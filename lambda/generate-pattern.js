// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// AWS Lambda function — server-side PDF generation after purchase.
// Deployed separately from the Cloudflare Pages frontend because Chromium
// requires 1024 MB RAM and up to 60 s execution time.
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { Resend } from 'resend';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const RATE_LIMIT_MAX    = 10;   // max PDF generations per user per hour
const RATE_LIMIT_WINDOW = 3600; // seconds

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

  // Scale verification: measure the 2x2" calibration square.
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
  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON body' });
  }

  const clientIp = (headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  const { garmentId, measurements, opts, sessionId } = body;

  // Authenticate user server-side from the Authorization header.
  const authHeader = headers['authorization'] || headers['Authorization'] || '';
  if (!authHeader.startsWith('Bearer ')) {
    console.warn(`[REJECTED] Missing auth token | ip=${clientIp} garment=${garmentId}`);
    return jsonResponse(403, { error: 'Not authorized' });
  }

  const token = authHeader.slice(7);
  const { data: { user: authUser }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !authUser) {
    console.warn(`[REJECTED] Invalid auth token | ip=${clientIp} garment=${garmentId} error=${authErr?.message}`);
    return jsonResponse(403, { error: 'Not authorized' });
  }

  const userId = authUser.id;

  // 1. Rate limiting: max RATE_LIMIT_MAX generations per user per hour.
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW * 1000).toISOString();
  const { data: allUserPurchases } = await supabase
    .from('purchases')
    .select('downloaded_at')
    .eq('user_id', userId);

  let requestsThisWindow = 0;
  for (const p of allUserPurchases || []) {
    for (const ts of p.downloaded_at || []) {
      if (ts >= windowStart) requestsThisWindow++;
    }
  }

  if (requestsThisWindow >= RATE_LIMIT_MAX) {
    console.warn(`[REJECTED] Rate limit exceeded | user=${userId} ip=${clientIp} garment=${garmentId} count=${requestsThisWindow}`);
    return jsonResponse(429, { error: 'Too many requests. You may generate up to 10 patterns per hour. Please try again later.' });
  }

  // 2. Purchase verification.
  let purchase = null;

  if (sessionId) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    let stripeSession;
    try {
      stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
    } catch (err) {
      console.warn(`[REJECTED] Stripe session retrieval failed | user=${userId} ip=${clientIp} sessionId=${sessionId} error=${err.message}`);
      return jsonResponse(403, { error: 'Could not verify payment session' });
    }

    if (stripeSession.payment_status !== 'paid') {
      console.warn(`[REJECTED] Payment not completed | user=${userId} ip=${clientIp} sessionId=${sessionId} status=${stripeSession.payment_status}`);
      return jsonResponse(403, { error: 'Payment not completed' });
    }

    if (stripeSession.metadata?.user_id !== userId) {
      console.warn(`[REJECTED] Session user mismatch | user=${userId} ip=${clientIp} sessionId=${sessionId}`);
      return jsonResponse(403, { error: 'Session does not match the requesting user' });
    }

    if (stripeSession.metadata?.garment_id !== garmentId) {
      console.warn(`[REJECTED] Session garment mismatch | user=${userId} ip=${clientIp} sessionId=${sessionId}`);
      return jsonResponse(403, { error: 'Session does not match the requested pattern' });
    }

    const { data: existingPurchase } = await supabase
      .from('purchases')
      .select('id, stripe_payment_intent, downloaded_at, a0_addon, amount_cents')
      .eq('user_id', userId)
      .eq('garment_id', garmentId)
      .maybeSingle();

    purchase = existingPurchase
      ? existingPurchase
      : (stripeSession.metadata?.a0_addon === 'true' ? { a0_addon: true } : null);
  } else {
    const { data: existingPurchase, error: purchaseErr } = await supabase
      .from('purchases')
      .select('id, stripe_payment_intent, downloaded_at, a0_addon, amount_cents')
      .eq('user_id', userId)
      .eq('garment_id', garmentId)
      .maybeSingle();

    if (purchaseErr) {
      console.error('Purchase lookup error:', purchaseErr);
      return jsonResponse(500, { error: 'Could not verify purchase: ' + purchaseErr.message });
    }
    if (!existingPurchase) {
      console.warn(`[REJECTED] No purchase record | user=${userId} ip=${clientIp} garment=${garmentId}`);
      return jsonResponse(403, { error: 'Purchase not found' });
    }
    purchase = existingPurchase;
  }

  // 3. Subscription monthly download limit (10/month).
  if (purchase && !purchase.stripe_payment_intent) {
    const now        = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const { data: subPurchases } = await supabase
      .from('purchases')
      .select('downloaded_at')
      .eq('user_id', userId)
      .is('stripe_payment_intent', null);

    let monthCount = 0;
    for (const p of subPurchases || []) {
      for (const ts of p.downloaded_at || []) {
        if (ts >= monthStart) monthCount++;
      }
    }

    if (monthCount >= 10) {
      const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)
        .toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
      console.warn(`[REJECTED] Monthly subscription limit | user=${userId} ip=${clientIp} garment=${garmentId} monthCount=${monthCount}`);
      return jsonResponse(429, { error: `You've downloaded 10 patterns this month. Your limit resets on ${resetDate}.` });
    }
  }

  // 4. Stamp download timestamp (fire-and-forget).
  const nowIso = new Date().toISOString();
  if (purchase?.id) {
    const updatedArr = [...(purchase.downloaded_at || []), nowIso];
    supabase.from('purchases')
      .update({ last_generated_at: nowIso, downloaded_at: updatedArr })
      .eq('id', purchase.id)
      .then(() => {});
  } else {
    supabase.from('purchases')
      .update({ last_generated_at: nowIso })
      .eq('user_id', userId)
      .eq('garment_id', garmentId)
      .then(() => {});
  }

  // 5. Import garment module and generate pieces/materials/instructions.
  let garment;
  try {
    const mod = await import(`../src/garments/${garmentId}.js`);
    garment   = mod.default;
  } catch {
    return jsonResponse(400, { error: `Unknown garment: ${garmentId}` });
  }

  const pieces = garment.pieces(measurements, opts);
  const { sanitizePoly } = await import('../src/engine/geometry.js');
  for (const p of pieces) {
    if (p.polygon) {
      const orig = p.polygon;
      p.polygon = sanitizePoly(orig);
      if (p.edgeAllowances && p.polygon.length !== orig.length) p.edgeAllowances = null;
    }
    if (p.saPolygon) p.saPolygon = sanitizePoly(p.saPolygon);
  }
  const materials    = garment.materials(measurements, opts);
  const instructions = garment.instructions(measurements, opts);

  // 6. Generate HTML print layout.
  const { generatePrintLayout } = await import('../src/pdf/print-layout.js');
  const html = generatePrintLayout(garment, pieces, materials, instructions, measurements, opts, 'letter');

  const needsA0 = purchase?.a0_addon === true;
  const htmlA0  = needsA0
    ? generatePrintLayout(garment, pieces, materials, instructions, measurements, opts, 'a0')
    : null;
  const htmlProjector = needsA0
    ? generatePrintLayout(garment, pieces, materials, instructions, measurements, opts, 'projector')
    : null;

  // 7. Render to PDF.
  let pdfBuffer, pdfA0Buffer, pdfProjectorBuffer;
  try {
    const renders = [generatePDF(html)];
    if (htmlA0)        renders.push(generatePDF(htmlA0));
    if (htmlProjector) renders.push(generatePDF(htmlProjector));
    [pdfBuffer, pdfA0Buffer, pdfProjectorBuffer] = await Promise.all(renders);
  } catch (err) {
    console.error('PDF generation failed:', err);
    return jsonResponse(500, { error: 'PDF generation failed' });
  }

  // 8. Upload to Supabase Storage.
  const timestamp     = Date.now();
  const path          = `${userId || 'anon'}/${garmentId}/${timestamp}.pdf`;
  const pathA0        = `${userId || 'anon'}/${garmentId}/${timestamp}-a0.pdf`;
  const pathProjector = `${userId || 'anon'}/${garmentId}/${timestamp}-projector.pdf`;

  const uploads = [
    supabase.storage.from('patterns').upload(path, pdfBuffer, { contentType: 'application/pdf', upsert: true }),
  ];
  if (pdfA0Buffer)        uploads.push(supabase.storage.from('patterns').upload(pathA0, pdfA0Buffer, { contentType: 'application/pdf', upsert: true }));
  if (pdfProjectorBuffer) uploads.push(supabase.storage.from('patterns').upload(pathProjector, pdfProjectorBuffer, { contentType: 'application/pdf', upsert: true }));

  const uploadResults = await Promise.all(uploads);
  const uploadErr = uploadResults.find(r => r.error)?.error;
  if (uploadErr) {
    console.error('Storage upload failed:', uploadErr);
    return jsonResponse(500, { error: 'Storage upload failed' });
  }

  // 9. Generate signed URLs (48 hours).
  const signedUrls = await Promise.all([
    supabase.storage.from('patterns').createSignedUrl(path, 60 * 60 * 48),
    ...(pdfA0Buffer        ? [supabase.storage.from('patterns').createSignedUrl(pathA0, 60 * 60 * 48)]        : []),
    ...(pdfProjectorBuffer ? [supabase.storage.from('patterns').createSignedUrl(pathProjector, 60 * 60 * 48)] : []),
  ]);

  const { data: signed, error: signErr } = signedUrls[0];
  if (signErr) return jsonResponse(500, { error: 'Could not generate download URL' });

  let urlIdx = 1;
  const a0Signed        = pdfA0Buffer        ? (signedUrls[urlIdx++]?.data ?? null) : null;
  const projectorSigned = pdfProjectorBuffer ? (signedUrls[urlIdx++]?.data ?? null) : null;

  // 10. Increment download_count.
  if (userId) {
    await supabase.rpc('increment_download_count', { p_user_id: userId, p_garment_id: garmentId });
  }

  // 11. Send purchase confirmation email (only on first post-purchase generation).
  const isFreeCreditFirstGen = !sessionId && purchase?.amount_cents === 0
    && (purchase.downloaded_at || []).length === 0;
  if (authUser?.email && (sessionId || isFreeCreditFirstGen)) {
    const garmentName = garment.name ?? garmentId.replace(/-/g, ' ');
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const FROM   = process.env.FROM_EMAIL || "People's Patterns <hello@peoplespatterns.com>";
      const { purchaseConfirmationEmail } = await import('../src/lib/email-templates.js');
      const tmpl = purchaseConfirmationEmail({
        garmentName,
        downloadUrl:          signed.signedUrl,
        a0DownloadUrl:        a0Signed?.signedUrl ?? null,
        projectorDownloadUrl: projectorSigned?.signedUrl ?? null,
        measurements,
        expiresHours: 48,
      });
      await resend.emails.send({ from: FROM, to: authUser.email, subject: tmpl.subject, html: tmpl.html, text: tmpl.plain });
    } catch (err) {
      console.error('Purchase confirmation email failed:', err);
    }
  }

  const response = { downloadUrl: signed.signedUrl };
  if (a0Signed)        response.a0DownloadUrl        = a0Signed.signedUrl;
  if (projectorSigned) response.projectorDownloadUrl = projectorSigned.signedUrl;
  return jsonResponse(200, response);
};
