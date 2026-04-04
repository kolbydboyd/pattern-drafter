// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Records an affiliate referral click.
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, landingPage, referrer } = req.body;
  if (!code) return res.status(400).json({ error: 'Missing code' });

  // Look up the affiliate
  const { data: affiliate } = await supabase
    .from('affiliates')
    .select('id')
    .eq('code', code.trim().toLowerCase())
    .eq('status', 'active')
    .single();

  if (!affiliate) {
    // Silently succeed - don't reveal whether the code exists
    return res.status(200).json({ ok: true });
  }

  // Hash the IP for dedup without storing raw IPs
  const rawIp = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim();
  const ipHash = rawIp ? createHash('sha256').update(rawIp + process.env.SUPABASE_SERVICE_ROLE_KEY).digest('hex').slice(0, 16) : null;

  await supabase.from('affiliate_clicks').insert({
    affiliate_id: affiliate.id,
    landing_page: landingPage || null,
    referrer:     referrer || null,
    ip_hash:      ipHash,
    user_agent:   req.headers['user-agent'] || null,
  });

  res.status(200).json({ ok: true });
}
