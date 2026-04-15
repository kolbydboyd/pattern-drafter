// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// AWS Lambda function — free re-generation for existing purchase owners.
// Archives the old purchase and creates a new one, then generates a fresh PDF.
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

// PDF generation via headless Chromium (single renderer, no fallback).
async function generatePDF(html) {
  const chromium  = (await import('@sparticuz/chromium-min')).default;
  const puppeteer = (await import('puppeteer-core')).default;

  const browser = await puppeteer.launch({
    args:            chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath:  await chromium.executablePath(
      'https://github.com/Sparticuz/chromium/releases/download/v121.0.0/chromium-v121.0.0-pack.tar',
    ),
    headless: chromium.headless,
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdf = await page.pdf({
    format:          'Letter',
    printBackground: true,
    margin:          { top: 0, right: 0, bottom: 0, left: 0 },
  });

  // Scale verification: check the 2x2" calibration square.
  try {
    const box = await page.evaluate(() => {
      const rect = document.querySelector('[data-scale-check]');
      if (!rect) return null;
      const r = rect.getBoundingClientRect();
      return { w: r.width, h: r.height };
    });
    if (box) {
      const expectedPx = 2 * 96;
      const deviationW = Math.abs(box.w - expectedPx) / expectedPx;
      const deviationH = Math.abs(box.h - expectedPx) / expectedPx;
      const maxDev = Math.max(deviationW, deviationH);
      if (maxDev > 0.005) {
        console.warn(`[SCALE WARNING] deviation: ${(maxDev * 100).toFixed(2)}% (w=${box.w.toFixed(1)}px h=${box.h.toFixed(1)}px expected=${expectedPx}px)`);
      }
    }
  } catch (scaleErr) {
    console.warn('Scale check failed (non-fatal):', scaleErr.message);
  }

  await browser.close();
  return pdf;
}

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

export const handler = async (event) => {
  const method = event.requestContext?.http?.method || event.httpMethod || 'POST';
  if (method !== 'POST') return jsonResponse(405, { error: 'Method not allowed' });

  const headers = event.headers || {};

  // Authenticate user server-side from the Authorization header.
  const authHeader = headers['authorization'] || headers['Authorization'] || '';
  if (!authHeader.startsWith('Bearer ')) {
    return jsonResponse(403, { error: 'Not authorized' });
  }
  const token = authHeader.slice(7);
  const { data: { user: authUser }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !authUser) {
    return jsonResponse(403, { error: 'Not authorized' });
  }
  const userId = authUser.id;

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON body' });
  }

  const { garmentId, purchaseId, measurements, opts } = body;
  if (!garmentId || !purchaseId) {
    return jsonResponse(400, { error: 'Missing required fields' });
  }

  // 1. Verify the user owns this purchase.
  const { data: existing } = await supabase
    .from('purchases')
    .select('id, profile_id, status')
    .eq('id', purchaseId)
    .eq('user_id', userId)
    .maybeSingle();

  if (!existing) return jsonResponse(403, { error: 'Purchase not found' });

  // 2. Archive the old purchase.
  await supabase.from('purchases').update({ status: 'archived' }).eq('id', purchaseId);

  // 2b. Capture old measurements for delta logging.
  const { data: oldPurchase } = await supabase
    .from('purchases')
    .select('measurements')
    .eq('id', purchaseId)
    .single();

  // 3. Create new purchase record (free re-gen).
  const { data: newPurchase, error: insertErr } = await supabase
    .from('purchases')
    .insert({
      user_id:           userId,
      garment_id:        garmentId,
      profile_id:        existing.profile_id ?? null,
      amount_cents:      0,
      status:            'active',
      last_generated_at: new Date().toISOString(),
      measurements:      measurements ?? null,
      opts:              opts ?? null,
    })
    .select()
    .single();

  if (insertErr) {
    await supabase.from('purchases').update({ status: existing.status }).eq('id', purchaseId);
    return jsonResponse(500, { error: 'Could not create new purchase record' });
  }

  // 3b. Log measurement delta (fire-and-forget).
  const oldMeas = oldPurchase?.measurements;
  if (oldMeas && measurements) {
    const deltas = {};
    for (const key of Object.keys(measurements)) {
      const oldVal = parseFloat(oldMeas[key]);
      const newVal = parseFloat(measurements[key]);
      if (!isNaN(oldVal) && !isNaN(newVal) && oldVal !== newVal) {
        deltas[key] = { old: oldVal, new: newVal, diff: +(newVal - oldVal).toFixed(2) };
      }
    }
    if (Object.keys(deltas).length > 0) {
      supabase.from('measurement_deltas').insert({
        user_id:         userId,
        garment_id:      garmentId,
        old_purchase_id: purchaseId,
        new_purchase_id: newPurchase.id,
        profile_id:      existing.profile_id ?? null,
        deltas,
      }).then(() => {}).catch(err => console.error('Delta log failed:', err.message));
    }
  }

  // 4. Load garment module.
  let garment;
  try {
    const mod = await import(`../src/garments/${garmentId}.js`);
    garment   = mod.default;
  } catch {
    return jsonResponse(400, { error: `Unknown garment: ${garmentId}` });
  }

  const pieces = garment.pieces(measurements, opts ?? {});
  const { sanitizePoly } = await import('../src/engine/geometry.js');
  for (const p of pieces) {
    if (p.polygon) {
      const orig = p.polygon;
      p.polygon = sanitizePoly(orig);
      if (p.edgeAllowances && p.polygon.length !== orig.length) p.edgeAllowances = null;
    }
    if (p.saPolygon) p.saPolygon = sanitizePoly(p.saPolygon);
  }
  const materials    = garment.materials(measurements, opts ?? {});
  const instructions = garment.instructions(measurements, opts ?? {});

  // 5. Generate HTML + PDF.
  const { generatePrintLayout } = await import('../src/pdf/print-layout.js');
  const html = generatePrintLayout(garment, pieces, materials, instructions, measurements, opts ?? {}, 'letter');

  let pdfBuffer;
  try {
    pdfBuffer = await generatePDF(html);
  } catch (err) {
    console.error('PDF generation failed:', err);
    return jsonResponse(500, { error: 'PDF generation failed' });
  }

  // 6. Upload to storage.
  const timestamp = Date.now();
  const path      = `${userId}/${garmentId}/${timestamp}.pdf`;
  const { error: uploadErr } = await supabase.storage
    .from('patterns')
    .upload(path, pdfBuffer, { contentType: 'application/pdf', upsert: true });

  if (uploadErr) return jsonResponse(500, { error: 'Storage upload failed' });

  // 7. Signed URL (48 hours).
  const { data: signed, error: signErr } = await supabase.storage
    .from('patterns')
    .createSignedUrl(path, 60 * 60 * 48);

  if (signErr) return jsonResponse(500, { error: 'Could not generate download URL' });

  return jsonResponse(200, { downloadUrl: signed.signedUrl, newPurchaseId: newPurchase.id });
};
