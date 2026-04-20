// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Cloudflare Pages Function — redeem a one-time-use code and create a $0 purchase.
import { createClient } from '@supabase/supabase-js';

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 });

  const token = request.headers.get('authorization')?.split('Bearer ')[1];
  if (!token) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createClient(
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
  );

  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  let body;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const { code, profileId = null, measurements = null, opts = null } = body ?? {};
  if (!code || typeof code !== 'string') {
    return Response.json({ error: 'code required' }, { status: 400 });
  }

  const normalized = code.trim().toUpperCase();

  // Fetch unconditionally first to avoid timing differences between
  // "code doesn't exist" and "code already redeemed" paths.
  const { data: redeemCode, error: lookupErr } = await supabase
    .from('redemption_codes')
    .select('*')
    .eq('code', normalized)
    .single();

  if (lookupErr || !redeemCode || redeemCode.redeemed_by !== null) {
    return Response.json({ error: 'Invalid or already redeemed code.' }, { status: 400 });
  }

  // Mark code as redeemed
  const { error: updateErr } = await supabase
    .from('redemption_codes')
    .update({ redeemed_by: user.id, redeemed_at: new Date().toISOString() })
    .eq('id', redeemCode.id)
    .is('redeemed_by', null); // guard against race condition

  if (updateErr) {
    return Response.json({ error: 'Could not redeem code.' }, { status: 500 });
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
    return Response.json({ error: 'Could not record purchase.' }, { status: 500 });
  }

  return Response.json({
    ok: true,
    purchaseId: purchase.id,
    garmentId: redeemCode.garment_id,
  });
}
