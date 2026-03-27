// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Vercel cron endpoint — daily email triggers
// Schedule in vercel.json: { "crons": [{ "path": "/api/cron-emails", "schedule": "0 9 * * *" }] }

import { createClient } from '@supabase/supabase-js';
import { sendEmail } from './send-email.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const SITE_URL = 'https://peoplespatterns.com';

// ── helpers ────────────────────────────────────────────────────────────────────

/** Returns true if we've already sent `template` to `userId` for `garmentId`. */
async function alreadySent(userId, template, garmentId = null) {
  const query = supabase
    .from('email_log')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('template', template);
  if (garmentId) query.eq('garment_id', garmentId);
  const { count } = await query;
  return (count ?? 0) > 0;
}

async function logEmail(userId, email, template, garmentId = null, metadata = {}) {
  await supabase.from('email_log').insert({
    user_id: userId, email, template, garment_id: garmentId, metadata,
  });
}

async function getUserEmail(userId) {
  const { data } = await supabase.auth.admin.getUserById(userId);
  return data?.user?.email ?? null;
}

// ── trigger 1: generated but not purchased (24 h) ────────────────────────────

async function sendGeneratedNotPurchased() {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const cutoffOld = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

  // Sessions created 24-48h ago that haven't been purchased
  const { data: sessions } = await supabase
    .from('pattern_sessions')
    .select('user_id, email, garment_id, generated_at')
    .eq('purchased', false)
    .gte('generated_at', cutoffOld)
    .lte('generated_at', cutoff);

  let sent = 0;
  for (const s of sessions ?? []) {
    if (!s.user_id && !s.email) continue;
    if (await alreadySent(s.user_id, 'GENERATED_NOT_PURCHASED', s.garment_id)) continue;

    const email = s.email || await getUserEmail(s.user_id);
    if (!email) continue;

    try {
      await sendEmail('GENERATED_NOT_PURCHASED', email, {
        garmentName: s.garment_id.replace(/-/g, ' '),
        patternUrl:  `${SITE_URL}/?step=1&garment=${s.garment_id}`,
      });
      await logEmail(s.user_id, email, 'GENERATED_NOT_PURCHASED', s.garment_id);
      sent++;
    } catch (err) {
      console.error(`GENERATED_NOT_PURCHASED failed for ${email}:`, err.message);
    }
  }
  return sent;
}

// ── trigger 2: purchased but not downloaded (48 h) ───────────────────────────

async function sendPurchasedNotDownloaded() {
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
  const cutoffOld = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString();

  const { data: purchases } = await supabase
    .from('purchases')
    .select('user_id, garment_id, purchased_at, download_count')
    .eq('download_count', 0)
    .gte('purchased_at', cutoffOld)
    .lte('purchased_at', cutoff);

  let sent = 0;
  for (const p of purchases ?? []) {
    if (await alreadySent(p.user_id, 'PURCHASED_NOT_DOWNLOADED', p.garment_id)) continue;

    const email = await getUserEmail(p.user_id);
    if (!email) continue;

    try {
      await sendEmail('PURCHASED_NOT_DOWNLOADED', email, {
        garmentName:  p.garment_id.replace(/-/g, ' '),
        downloadUrl:  `${SITE_URL}/account`,
      });
      await logEmail(p.user_id, email, 'PURCHASED_NOT_DOWNLOADED', p.garment_id);
      sent++;
    } catch (err) {
      console.error(`PURCHASED_NOT_DOWNLOADED failed for ${email}:`, err.message);
    }
  }
  return sent;
}

// ── trigger 3: post-purchase sew help (3 days after first download) ───────────

async function sendPostPurchaseSewHelp() {
  const cutoff    = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
  const cutoffOld = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString();

  // Purchases where the first download_at timestamp falls in the 3-4 day window
  const { data: purchases } = await supabase
    .from('purchases')
    .select('user_id, garment_id, downloaded_at')
    .not('downloaded_at', 'is', null)
    .gt('download_count', 0);

  let sent = 0;
  for (const p of purchases ?? []) {
    const firstDownload = (p.downloaded_at ?? [])[0];
    if (!firstDownload) continue;
    if (firstDownload < cutoffOld || firstDownload > cutoff) continue;
    if (await alreadySent(p.user_id, 'POST_PURCHASE_SEW_HELP', p.garment_id)) continue;

    const email = await getUserEmail(p.user_id);
    if (!email) continue;

    try {
      await sendEmail('POST_PURCHASE_SEW_HELP', email, {
        garmentName: p.garment_id.replace(/-/g, ' '),
      });
      await logEmail(p.user_id, email, 'POST_PURCHASE_SEW_HELP', p.garment_id);
      sent++;
    } catch (err) {
      console.error(`POST_PURCHASE_SEW_HELP failed for ${email}:`, err.message);
    }
  }
  return sent;
}

// ── trigger 4: fit feedback request (14 days after first download) ────────────

async function sendFitFeedbackRequest() {
  const cutoff    = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
  const cutoffOld = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString();

  const { data: purchases } = await supabase
    .from('purchases')
    .select('user_id, garment_id, purchased_at, downloaded_at')
    .not('downloaded_at', 'is', null)
    .gt('download_count', 0);

  let sent = 0;
  for (const p of purchases ?? []) {
    const firstDownload = (p.downloaded_at ?? [])[0];
    if (!firstDownload) continue;
    if (firstDownload < cutoffOld || firstDownload > cutoff) continue;
    if (await alreadySent(p.user_id, 'FIT_FEEDBACK_REQUEST', p.garment_id)) continue;

    const email = await getUserEmail(p.user_id);
    if (!email) continue;

    try {
      await sendEmail('FIT_FEEDBACK_REQUEST', email, {
        garmentName:  p.garment_id.replace(/-/g, ' '),
        purchaseDate: p.purchased_at,
        feedbackUrl:  `${SITE_URL}/account?tab=projects&feedback=${p.garment_id}`,
      });
      await logEmail(p.user_id, email, 'FIT_FEEDBACK_REQUEST', p.garment_id);
      sent++;
    } catch (err) {
      console.error(`FIT_FEEDBACK_REQUEST failed for ${email}:`, err.message);
    }
  }
  return sent;
}

// ── handler ────────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  // Vercel cron calls use GET with a shared secret header
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const results = await Promise.allSettled([
    sendGeneratedNotPurchased(),
    sendPurchasedNotDownloaded(),
    sendPostPurchaseSewHelp(),
    sendFitFeedbackRequest(),
  ]);

  const [gnp, pnd, sew, fit] = results.map(r =>
    r.status === 'fulfilled' ? r.value : `error: ${r.reason?.message}`
  );

  console.log(`[cron-emails] generatedNotPurchased=${gnp} purchasedNotDownloaded=${pnd} sewHelp=${sew} fitFeedback=${fit}`);

  res.status(200).json({
    ok: true,
    generatedNotPurchased:   gnp,
    purchasedNotDownloaded:  pnd,
    postPurchaseSewHelp:     sew,
    fitFeedbackRequest:      fit,
  });
}
