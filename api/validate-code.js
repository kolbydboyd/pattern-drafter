// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Vercel serverless function — validate a redemption code without consuming it.
// Public endpoint (no auth required) so users can check codes before signing up.
import { createClient } from '@supabase/supabase-js';
import { rateLimit } from './_rate-limit.js';

const limiter = rateLimit({ windowMs: 60_000, max: 10 });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

export default async function handler(req, res) {
  if (limiter(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { code } = req.body ?? {};
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'code required' });
  }

  const normalized = code.trim().toUpperCase();

  const { data, error } = await supabase
    .from('redemption_codes')
    .select('garment_id')
    .eq('code', normalized)
    .is('redeemed_by', null)
    .single();

  if (error || !data) {
    return res.status(200).json({ valid: false });
  }

  const garmentName = data.garment_id
    .replace(/-/g, ' ')
    .replace(/\bw\b$/, "(Women's)")
    .replace(/\b\w/g, c => c.toUpperCase());

  return res.status(200).json({
    valid: true,
    garmentId: data.garment_id,
    garmentName,
  });
}
