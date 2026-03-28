// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Vercel serverless function — server-side PDF generation after purchase
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { sendEmail } from './send-email.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const RATE_LIMIT_MAX     = 10;   // max PDF generations per user per hour
const RATE_LIMIT_WINDOW  = 3600; // seconds

// PDF generation via headless Chromium (single renderer, no fallback).
// Using one engine guarantees consistent scale across all outputs.
async function generatePDF(html) {
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

  // Scale verification: measure the 2x2" calibration square in PDF coordinates.
  // Letter = 612x792pt (8.5x11" at 72pt/in). The calibration square should be
  // exactly 144x144pt (2" x 72pt/in). Extract its bounding box from the page.
  try {
    const box = await page.evaluate(() => {
      const rect = document.querySelector('[data-scale-check]');
      if (!rect) return null;
      const r = rect.getBoundingClientRect();
      return { w: r.width, h: r.height };
    });
    if (box) {
      // Page is rendered at 96 DPI on screen; PDF is 72 DPI.
      // 2 inches at 96 DPI = 192px on screen.
      const expectedPx = 2 * 96; // 192px at screen DPI
      const deviationW = Math.abs(box.w - expectedPx) / expectedPx;
      const deviationH = Math.abs(box.h - expectedPx) / expectedPx;
      const maxDev = Math.max(deviationW, deviationH);
      if (maxDev > 0.005) {
        console.warn(`[SCALE WARNING] Calibration square deviation: ${(maxDev * 100).toFixed(2)}% (w=${box.w.toFixed(1)}px, h=${box.h.toFixed(1)}px, expected=${expectedPx}px)`);
      }
    }
  } catch (scaleErr) {
    console.warn('Scale check failed (non-fatal):', scaleErr.message);
  }

  await browser.close();
  return pdf;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.socket?.remoteAddress || 'unknown';

  const { garmentId, measurements, opts, sessionId } = req.body;

  // Authenticate user server-side from the Authorization header.
  // Never trust a client-provided userId in the request body.
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    console.warn(`[REJECTED] Missing auth token | ip=${clientIp} garment=${garmentId}`);
    return res.status(403).json({ error: 'Not authorized' });
  }

  const token = authHeader.slice(7);
  const { data: { user: authUser }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !authUser) {
    console.warn(`[REJECTED] Invalid auth token | ip=${clientIp} garment=${garmentId} error=${authErr?.message}`);
    return res.status(403).json({ error: 'Not authorized' });
  }

  const userId = authUser.id;

  // 1. Rate limiting: max RATE_LIMIT_MAX generations per user per hour.
  //    Count downloaded_at timestamps across all purchases in the last window.
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
    return res.status(429).json({
      error: 'Too many requests. You may generate up to 10 patterns per hour. Please try again later.',
    });
  }

  // 2. Purchase verification — every path must be verified server-side.
  let purchase = null;

  if (sessionId) {
    // Verify the Stripe session server-side. Never trust client-provided sessionId.
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    let stripeSession;
    try {
      stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
    } catch (err) {
      console.warn(`[REJECTED] Stripe session retrieval failed | user=${userId} ip=${clientIp} sessionId=${sessionId} error=${err.message}`);
      return res.status(403).json({ error: 'Could not verify payment session' });
    }

    if (stripeSession.payment_status !== 'paid') {
      console.warn(`[REJECTED] Payment not completed | user=${userId} ip=${clientIp} sessionId=${sessionId} status=${stripeSession.payment_status}`);
      return res.status(403).json({ error: 'Payment not completed' });
    }

    if (stripeSession.metadata?.user_id !== userId) {
      console.warn(`[REJECTED] Session user mismatch | user=${userId} ip=${clientIp} sessionId=${sessionId} session_user=${stripeSession.metadata?.user_id}`);
      return res.status(403).json({ error: 'Session does not match the requesting user' });
    }

    if (stripeSession.metadata?.garment_id !== garmentId) {
      console.warn(`[REJECTED] Session garment mismatch | user=${userId} ip=${clientIp} sessionId=${sessionId} requested=${garmentId} session_garment=${stripeSession.metadata?.garment_id}`);
      return res.status(403).json({ error: 'Session does not match the requested pattern' });
    }

    // Look up the purchase row — webhook may not have inserted it yet (race window).
    // Stripe verification above is the authoritative gate; DB row is best-effort here.
    const { data: existingPurchase } = await supabase
      .from('purchases')
      .select('id, stripe_payment_intent, downloaded_at, a0_addon')
      .eq('user_id', userId)
      .eq('garment_id', garmentId)
      .maybeSingle();

    // If webhook hasn't inserted the row yet, fall back to session metadata for a0_addon
    purchase = existingPurchase
      ? existingPurchase
      : (stripeSession.metadata?.a0_addon === 'true' ? { a0_addon: true } : null);
  } else {
    // Re-download from account dashboard — purchase record must exist.
    const { data: existingPurchase, error: purchaseErr } = await supabase
      .from('purchases')
      .select('id, stripe_payment_intent, downloaded_at, a0_addon')
      .eq('user_id', userId)
      .eq('garment_id', garmentId)
      .maybeSingle();

    if (purchaseErr) {
      console.error('Purchase lookup error:', purchaseErr);
      return res.status(500).json({ error: 'Could not verify purchase: ' + purchaseErr.message });
    }
    if (!existingPurchase) {
      console.warn(`[REJECTED] No purchase record | user=${userId} ip=${clientIp} garment=${garmentId}`);
      return res.status(403).json({ error: 'Purchase not found' });
    }
    purchase = existingPurchase;
  }

  // 3. Subscription users have a monthly download limit of 10.
  //    Per-pattern purchasers (stripe_payment_intent set) have unlimited re-downloads.
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
      return res.status(429).json({
        error: `You've downloaded 10 patterns this month. Your limit resets on ${resetDate}. Need more? Contact us at hello@peoplespatterns.com`,
      });
    }
  }

  // 4. Stamp download timestamp (fire-and-forget).
  const nowIso = new Date().toISOString();
  if (purchase) {
    const updatedArr = [...(purchase.downloaded_at || []), nowIso];
    supabase.from('purchases')
      .update({ last_generated_at: nowIso, downloaded_at: updatedArr })
      .eq('id', purchase.id)
      .then(() => {});
  } else {
    // sessionId path where webhook hasn't inserted the row yet — update when it does.
    supabase.from('purchases')
      .update({ last_generated_at: nowIso })
      .eq('user_id', userId)
      .eq('garment_id', garmentId)
      .then(() => {});
  }

  // 5. Import garment module and generate pieces/materials/instructions
  //    Garment modules are ESM — use dynamic import
  let garment;
  try {
    const mod = await import(`../src/garments/${garmentId}.js`);
    garment   = mod.default;
  } catch (err) {
    return res.status(400).json({ error: `Unknown garment: ${garmentId}` });
  }

  const pieces       = garment.pieces(measurements, opts);
  // Sanitize all piece polygons
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

  // 6. Generate HTML print layout
  const { generatePrintLayout } = await import('../src/pdf/print-layout.js');
  const html = generatePrintLayout(
    garment, pieces, materials, instructions,
    measurements, opts, 'letter'
  );

  const needsA0 = purchase?.a0_addon === true;
  const htmlA0  = needsA0
    ? generatePrintLayout(garment, pieces, materials, instructions, measurements, opts, 'a0')
    : null;

  // 7. Render to PDF (letter + optional A0 in parallel)
  let pdfBuffer, pdfA0Buffer;
  try {
    const renders = [generatePDF(html)];
    if (htmlA0) renders.push(generatePDF(htmlA0));
    [pdfBuffer, pdfA0Buffer] = await Promise.all(renders);
  } catch (err) {
    console.error('PDF generation failed:', err);
    return res.status(500).json({ error: 'PDF generation failed' });
  }

  // 5. Upload to Supabase Storage
  const timestamp = Date.now();
  const path      = `${userId || 'anon'}/${garmentId}/${timestamp}.pdf`;
  const pathA0    = `${userId || 'anon'}/${garmentId}/${timestamp}-a0.pdf`;

  const uploads = [
    supabase.storage.from('patterns').upload(path, pdfBuffer, { contentType: 'application/pdf', upsert: true }),
  ];
  if (pdfA0Buffer) {
    uploads.push(supabase.storage.from('patterns').upload(pathA0, pdfA0Buffer, { contentType: 'application/pdf', upsert: true }));
  }
  const uploadResults = await Promise.all(uploads);
  const uploadErr = uploadResults.find(r => r.error)?.error;

  if (uploadErr) {
    console.error('Storage upload failed:', uploadErr);
    return res.status(500).json({ error: 'Storage upload failed' });
  }

  // 6. Generate signed URLs valid for 48 hours
  const signedUrls = await Promise.all([
    supabase.storage.from('patterns').createSignedUrl(path, 60 * 60 * 48),
    ...(pdfA0Buffer ? [supabase.storage.from('patterns').createSignedUrl(pathA0, 60 * 60 * 48)] : []),
  ]);

  const { data: signed, error: signErr } = signedUrls[0];
  if (signErr) {
    return res.status(500).json({ error: 'Could not generate download URL' });
  }

  const a0Signed = signedUrls[1]?.data ?? null;

  // 7. Increment download_count
  if (userId) {
    await supabase.rpc('increment_download_count', {
      p_user_id:   userId,
      p_garment_id: garmentId,
    });
  }

  // 8. Send purchase confirmation email (only on first post-purchase generation)
  if (sessionId && authUser?.email) {
    const garmentName = garment.name ?? garmentId.replace(/-/g, ' ');
    sendEmail('PURCHASE_CONFIRMATION', authUser.email, {
      garmentName,
      downloadUrl:    signed.signedUrl,
      a0DownloadUrl:  a0Signed?.signedUrl ?? null,
      measurements,
      expiresHours: 48,
    }).catch(err => console.error('Purchase confirmation email failed:', err));
  }

  const response = { downloadUrl: signed.signedUrl };
  if (a0Signed) response.a0DownloadUrl = a0Signed.signedUrl;
  res.status(200).json(response);
}
