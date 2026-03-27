// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Vercel serverless function — free re-generation for existing purchase owners
// Archives the old purchase and creates a new one, then generates a fresh PDF.
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

async function generatePDF(html) {
  try {
    const chromium  = (await import('@sparticuz/chromium-min')).default;
    const puppeteer = (await import('puppeteer-core')).default;
    const browser = await puppeteer.launch({
      args:            chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath:  await chromium.executablePath(
        `https://github.com/Sparticuz/chromium/releases/download/v121.0.0/chromium-v121.0.0-pack.tar`
      ),
      headless: chromium.headless,
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({ format: 'Letter', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
    await browser.close();
    return pdf;
  } catch {
    const htmlPdf = (await import('html-pdf-node')).default;
    const file    = { content: html };
    const options = { format: 'Letter', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } };
    return new Promise((resolve, reject) => {
      htmlPdf.generatePdf(file, options, (err, buf) => err ? reject(err) : resolve(buf));
    });
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { garmentId, userId, purchaseId, measurements, opts } = req.body;
  if (!garmentId || !userId || !purchaseId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // 1. Verify the user actually owns this purchase
  const { data: existing } = await supabase
    .from('purchases')
    .select('id, profile_id, status')
    .eq('id', purchaseId)
    .eq('user_id', userId)
    .maybeSingle();

  if (!existing) return res.status(403).json({ error: 'Purchase not found' });

  // 2. Archive the old purchase
  await supabase.from('purchases')
    .update({ status: 'archived' })
    .eq('id', purchaseId);

  // 3. Create new purchase record (free re-gen)
  const { data: newPurchase, error: insertErr } = await supabase
    .from('purchases')
    .insert({
      user_id:    userId,
      garment_id: garmentId,
      profile_id: existing.profile_id ?? null,
      amount_cents: 0,
      status:     'active',
      last_generated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (insertErr) {
    // Roll back archive if insert failed
    await supabase.from('purchases').update({ status: existing.status }).eq('id', purchaseId);
    return res.status(500).json({ error: 'Could not create new purchase record' });
  }

  // 4. Load garment module
  let garment;
  try {
    const mod = await import(`../src/garments/${garmentId}.js`);
    garment   = mod.default;
  } catch {
    return res.status(400).json({ error: `Unknown garment: ${garmentId}` });
  }

  const pieces       = garment.pieces(measurements, opts ?? {});
  const materials    = garment.materials(measurements, opts ?? {});
  const instructions = garment.instructions(measurements, opts ?? {});

  // 5. Generate HTML + PDF
  const { generatePrintLayout } = await import('../src/pdf/print-layout.js');
  const html = generatePrintLayout(garment, pieces, materials, instructions, measurements, opts ?? {}, 'letter');

  let pdfBuffer;
  try {
    pdfBuffer = await generatePDF(html);
  } catch (err) {
    console.error('PDF generation failed:', err);
    return res.status(500).json({ error: 'PDF generation failed' });
  }

  // 6. Upload to storage
  const timestamp = Date.now();
  const path = `${userId}/${garmentId}/${timestamp}.pdf`;
  const { error: uploadErr } = await supabase.storage
    .from('patterns')
    .upload(path, pdfBuffer, { contentType: 'application/pdf', upsert: true });

  if (uploadErr) return res.status(500).json({ error: 'Storage upload failed' });

  // 7. Signed URL
  const { data: signed, error: signErr } = await supabase.storage
    .from('patterns')
    .createSignedUrl(path, 60 * 60 * 48);

  if (signErr) return res.status(500).json({ error: 'Could not generate download URL' });

  res.status(200).json({ downloadUrl: signed.signedUrl, newPurchaseId: newPurchase.id });
}
