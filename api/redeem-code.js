// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Vercel serverless function — redeem a one-time-use code and create a $0 purchase.
// Modeled after api/use-free-credit.js.
import { createClient } from '@supabase/supabase-js';
import { rateLimit } from './_rate-limit.js';

const limiter = rateLimit({ windowMs: 60_000, max: 5 });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

export default async function handler(req, res) {
  if (limiter(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) return res.status(401).json({ error: 'Unauthorized' });

  const { code, profileId = null, measurements = null, opts = null } = req.body ?? {};
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'code required' });
  }

  const normalized = code.trim().toUpperCase();

  // Look up unredeemed code
  const { data: redeemCode, error: lookupErr } = await supabase
    .from('redemption_codes')
    .select('*')
    .eq('code', normalized)
    .is('redeemed_by', null)
    .single();

  if (lookupErr || !redeemCode) {
    return res.status(400).json({ error: 'Invalid or already redeemed code.' });
  }

  // Mark code as redeemed
  const { error: updateErr } = await supabase
    .from('redemption_codes')
    .update({ redeemed_by: user.id, redeemed_at: new Date().toISOString() })
    .eq('id', redeemCode.id)
    .is('redeemed_by', null); // guard against race condition

  if (updateErr) {
    return res.status(500).json({ error: 'Could not redeem code.' });
  }

  // Create a $0 purchase so the pattern appears in "My Patterns"
  const { data: purchase, error: purchaseErr } = await supabase
    .from('purchases')
    .insert({
      user_id:         user.id,
      garment_id:      redeemCode.garment_id,
      profile_id:      profileId,
      amount_cents:    0,
      status:          'active',
      measurements:    measurements || null,
      opts:            opts || null,
      redemption_code: normalized,
      source:          redeemCode.source,
    })
    .select()
    .single();

  if (purchaseErr) {
    // Roll back the redemption on failure
    await supabase
      .from('redemption_codes')
      .update({ redeemed_by: null, redeemed_at: null })
      .eq('id', redeemCode.id);
    return res.status(500).json({ error: 'Could not record purchase.' });
  }

  return res.status(200).json({
    ok: true,
    purchaseId: purchase.id,
    garmentId: redeemCode.garment_id,
  });
}
