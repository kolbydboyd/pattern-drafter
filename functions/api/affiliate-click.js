// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Records an affiliate referral click.
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'node:crypto';

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { code, landingPage, referrer } = body;
  if (!code) return Response.json({ error: 'Missing code' }, { status: 400 });

  const supabase = createClient(
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
  );

  // Look up the affiliate
  const { data: affiliate } = await supabase
    .from('affiliates')
    .select('id')
    .eq('code', code.trim().toLowerCase())
    .eq('status', 'active')
    .single();

  if (!affiliate) {
    // Silently succeed - don't reveal whether the code exists
    return Response.json({ ok: true });
  }

  // Hash the IP for dedup without storing raw IPs
  const rawIp = (request.headers.get('x-forwarded-for') || '').split(',')[0].trim();
  const ipHash = rawIp ? createHash('sha256').update(rawIp + env.SUPABASE_SERVICE_ROLE_KEY).digest('hex').slice(0, 16) : null;

  await supabase.from('affiliate_clicks').insert({
    affiliate_id: affiliate.id,
    landing_page: landingPage || null,
    referrer:     referrer || null,
    ip_hash:      ipHash,
    user_agent:   request.headers.get('user-agent') || null,
  });

  return Response.json({ ok: true });
}
