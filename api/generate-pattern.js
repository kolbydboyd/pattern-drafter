// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Vercel serverless function — server-side PDF generation after purchase
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

// Dynamic imports so bundler only loads what's available at runtime
async function generatePDF(html) {
  // Try @sparticuz/chromium-min + puppeteer-core first (smaller Lambda bundle)
  try {
    const chromium   = (await import('@sparticuz/chromium-min')).default;
    const puppeteer  = (await import('puppeteer-core')).default;

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
    const pdf = await page.pdf({
      format:          'Letter',
      printBackground: true,
      margin:          { top: 0, right: 0, bottom: 0, left: 0 },
    });
    await browser.close();
    return pdf;
  } catch (chromiumErr) {
    console.warn('chromium-min failed, falling back to html-pdf-node:', chromiumErr.message);

    // Fallback: html-pdf-node (lighter, less accurate rendering)
    const htmlPdf = (await import('html-pdf-node')).default;
    const file    = { content: html };
    const options = { format: 'Letter', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } };
    return new Promise((resolve, reject) => {
      htmlPdf.generatePdf(file, options, (err, buf) => err ? reject(err) : resolve(buf));
    });
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { garmentId, userId, measurements, opts, sessionId } = req.body;

  // 1. Verify the user has purchased this garment
  if (userId) {
    const { data: purchase } = await supabase
      .from('purchases')
      .select('id')
      .eq('user_id', userId)
      .eq('garment_id', garmentId)
      .maybeSingle();

    if (!purchase) {
      return res.status(403).json({ error: 'Purchase not found' });
    }

    // Stamp last_generated_at so dashboard can show "generated {date}"
    supabase.from('purchases')
      .update({ last_generated_at: new Date().toISOString() })
      .eq('id', purchase.id)
      .then(() => {});          // fire-and-forget, don't block response
  } else {
    // Allow session-ID based access right after webhook (race window)
    if (!sessionId) {
      return res.status(403).json({ error: 'Not authorized' });
    }
  }

  // 2. Import garment module and generate pieces/materials/instructions
  //    Garment modules are ESM — use dynamic import
  let garment;
  try {
    const mod = await import(`../src/garments/${garmentId}.js`);
    garment   = mod.default;
  } catch (err) {
    return res.status(400).json({ error: `Unknown garment: ${garmentId}` });
  }

  const pieces       = garment.pieces(measurements, opts);
  const materials    = garment.materials(measurements, opts);
  const instructions = garment.instructions(measurements, opts);

  // 3. Generate HTML print layout
  const { generatePrintLayout } = await import('../src/pdf/print-layout.js');
  const html = generatePrintLayout(
    garment, pieces, materials, instructions,
    measurements, opts, 'letter'
  );

  // 4. Render to PDF
  let pdfBuffer;
  try {
    pdfBuffer = await generatePDF(html);
  } catch (err) {
    console.error('PDF generation failed:', err);
    return res.status(500).json({ error: 'PDF generation failed' });
  }

  // 5. Upload to Supabase Storage
  const timestamp = Date.now();
  const path      = `${userId || 'anon'}/${garmentId}/${timestamp}.pdf`;

  const { error: uploadErr } = await supabase.storage
    .from('patterns')
    .upload(path, pdfBuffer, { contentType: 'application/pdf', upsert: true });

  if (uploadErr) {
    console.error('Storage upload failed:', uploadErr);
    return res.status(500).json({ error: 'Storage upload failed' });
  }

  // 6. Generate signed URL valid for 48 hours
  const { data: signed, error: signErr } = await supabase.storage
    .from('patterns')
    .createSignedUrl(path, 60 * 60 * 48);

  if (signErr) {
    return res.status(500).json({ error: 'Could not generate download URL' });
  }

  // 7. Increment download_count
  if (userId) {
    await supabase.rpc('increment_download_count', {
      p_user_id:   userId,
      p_garment_id: garmentId,
    });
  }

  res.status(200).json({ downloadUrl: signed.signedUrl });
}
