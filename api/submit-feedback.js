// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Vercel serverless function — store fit feedback in Supabase.
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const VALID_OVERALL   = new Set(['perfect', 'good', 'needs_adjustment', 'poor']);
const VALID_AREA_VALS = new Set(['perfect', 'too_tight', 'too_loose', 'too_long', 'too_short', 'n/a']);
const AREA_KEYS       = ['waist_fit', 'hip_fit', 'length', 'shoulder', 'armhole', 'chest_fit', 'thigh_fit'];

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Auth — extract user from Bearer token
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) return res.status(401).json({ error: 'Unauthorized' });

  const { purchaseId, garmentId, overallFit, specificFeedback = {}, notes = '', profileId = null } = req.body ?? {};

  // Validate required fields
  if (!purchaseId || !garmentId) return res.status(400).json({ error: 'purchaseId and garmentId required' });
  if (!VALID_OVERALL.has(overallFit))  return res.status(400).json({ error: 'Invalid overallFit value' });

  // Sanitize specific feedback
  const cleanSpecific = {};
  for (const key of AREA_KEYS) {
    const val = specificFeedback[key];
    if (val && VALID_AREA_VALS.has(val)) cleanSpecific[key] = val;
  }

  // Verify user owns this purchase
  const { data: purchase, error: purchErr } = await supabase
    .from('purchases')
    .select('id, profile_id')
    .eq('id', purchaseId)
    .eq('user_id', user.id)
    .single();
  if (purchErr || !purchase) return res.status(404).json({ error: 'Purchase not found' });

  const resolvedProfileId = profileId || purchase.profile_id || null;

  // Upsert — one feedback record per purchase
  const { error: insertErr } = await supabase
    .from('fit_feedback')
    .upsert({
      user_id:           user.id,
      purchase_id:       purchaseId,
      garment_id:        garmentId,
      profile_id:        resolvedProfileId,
      overall_fit:       overallFit,
      specific_feedback: cleanSpecific,
      notes:             notes.trim().slice(0, 1000),
      created_at:        new Date().toISOString(),
    }, { onConflict: 'user_id,purchase_id' });

  if (insertErr) {
    console.error('submit-feedback insert error:', insertErr.message);
    return res.status(500).json({ error: 'Could not save feedback' });
  }

  return res.status(200).json({ ok: true });
}
