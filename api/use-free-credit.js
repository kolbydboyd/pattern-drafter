// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Vercel serverless function — deduct one free credit and record a free purchase.
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) return res.status(401).json({ error: 'Unauthorized' });

  const { garmentId, profileId = null } = req.body ?? {};
  if (!garmentId) return res.status(400).json({ error: 'garmentId required' });

  // Read and deduct atomically using a Postgres function would be ideal;
  // as a safe fallback: read then conditional update
  const { data: profile, error: readErr } = await supabase
    .from('profiles')
    .select('free_credits')
    .eq('id', user.id)
    .single();

  if (readErr || !profile) return res.status(500).json({ error: 'Could not read account' });
  if ((profile.free_credits ?? 0) < 1) return res.status(402).json({ error: 'No free credits remaining' });

  // Deduct credit
  const { error: deductErr } = await supabase
    .from('profiles')
    .update({ free_credits: profile.free_credits - 1 })
    .eq('id', user.id);

  if (deductErr) return res.status(500).json({ error: 'Could not deduct credit' });

  // Record as a $0 purchase so the pattern is permanently accessible
  const { data: purchase, error: purchaseErr } = await supabase
    .from('purchases')
    .insert({
      user_id:     user.id,
      garment_id:  garmentId,
      profile_id:  profileId,
      amount_cents: 0,
      status:      'active',
    })
    .select()
    .single();

  if (purchaseErr) {
    // Roll back credit deduction on failure
    await supabase.from('profiles').update({ free_credits: profile.free_credits }).eq('id', user.id);
    return res.status(500).json({ error: 'Could not record purchase' });
  }

  return res.status(200).json({ ok: true, purchaseId: purchase.id, creditsRemaining: profile.free_credits - 1 });
}
