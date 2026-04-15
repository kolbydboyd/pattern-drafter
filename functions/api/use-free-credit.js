// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Cloudflare Pages Function — deduct one free credit and record a free purchase.
import { createClient } from '@supabase/supabase-js';

export async function onRequestPost(context) {
  const { request, env } = context;

  const token = (request.headers.get('authorization') || '').split('Bearer ')[1];
  if (!token) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { garmentId, profileId = null, measurements = null, opts = null } = body ?? {};
  if (!garmentId) return Response.json({ error: 'garmentId required' }, { status: 400 });

  // Read credit balance
  const { data: profile, error: readErr } = await supabase
    .from('profiles')
    .select('free_credits')
    .eq('id', user.id)
    .single();

  if (readErr || !profile) return Response.json({ error: 'Could not read account' }, { status: 500 });
  if ((profile.free_credits ?? 0) < 1) return Response.json({ error: 'No free credits remaining' }, { status: 402 });

  // Deduct credit
  const { error: deductErr } = await supabase
    .from('profiles')
    .update({ free_credits: profile.free_credits - 1 })
    .eq('id', user.id);

  if (deductErr) return Response.json({ error: 'Could not deduct credit' }, { status: 500 });

  // Record as a $0 purchase so the pattern is permanently accessible.
  const { data: purchase, error: purchaseErr } = await supabase
    .from('purchases')
    .insert({
      user_id:      user.id,
      garment_id:   garmentId,
      profile_id:   profileId,
      amount_cents: 0,
      status:       'active',
      measurements: measurements || null,
      opts:         opts         || null,
    })
    .select()
    .single();

  if (purchaseErr) {
    // Roll back credit deduction on failure
    await supabase.from('profiles').update({ free_credits: profile.free_credits }).eq('id', user.id);
    return Response.json({ error: 'Could not record purchase' }, { status: 500 });
  }

  return Response.json({ ok: true, purchaseId: purchase.id, creditsRemaining: profile.free_credits - 1 });
}
