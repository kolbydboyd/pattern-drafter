// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Vercel serverless function — store fit feedback in Supabase.
import { createClient } from '@supabase/supabase-js';
import { rateLimit } from './_rate-limit.js';

const limiter = rateLimit({ windowMs: 60_000, max: 10 });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const VALID_OVERALL   = new Set(['perfect', 'good', 'needs_adjustment', 'poor']);
const VALID_AREA_VALS = new Set(['perfect', 'too_tight', 'too_loose', 'too_long', 'too_short', 'n/a']);
const AREA_KEYS       = ['waist_fit', 'hip_fit', 'length', 'shoulder', 'armhole', 'chest_fit', 'thigh_fit', 'neck_fit', 'sleeve_fit', 'rise_fit'];

export default async function handler(req, res) {
  if (limiter(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Auth — extract user from Bearer token
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) return res.status(401).json({ error: 'Unauthorized' });

  let { purchaseId, garmentId, overallFit, specificFeedback = {}, notes = '', profileId = null } = req.body ?? {};

  // Validate required fields
  if (!garmentId) return res.status(400).json({ error: 'garmentId required' });
  if (!VALID_OVERALL.has(overallFit))  return res.status(400).json({ error: 'Invalid overallFit value' });

  // Sanitize specific feedback
  const cleanSpecific = {};
  for (const key of AREA_KEYS) {
    const val = specificFeedback[key];
    if (val && VALID_AREA_VALS.has(val)) cleanSpecific[key] = val;
  }

  // If no purchaseId provided, look up the most recent purchase for this garment
  if (!purchaseId) {
    const { data: found } = await supabase
      .from('purchases')
      .select('id, profile_id')
      .eq('user_id', user.id)
      .eq('garment_id', garmentId)
      .order('purchased_at', { ascending: false })
      .limit(1)
      .single();
    if (!found) return res.status(404).json({ error: 'No purchase found for this garment' });
    purchaseId = found.id;
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

  // Fetch the measurements snapshot from the purchase (frozen at generation time)
  const { data: purchaseFull } = await supabase
    .from('purchases')
    .select('measurements')
    .eq('id', purchaseId)
    .single();

  const { sewStage = 'final' } = req.body ?? {};
  const VALID_STAGES = new Set(['muslin', 'final']);
  const cleanStage = VALID_STAGES.has(sewStage) ? sewStage : 'final';

  // Insert — multiple reviews allowed per purchase (muslin + final)
  const { error: insertErr } = await supabase
    .from('fit_feedback')
    .insert({
      user_id:                user.id,
      purchase_id:            purchaseId,
      garment_id:             garmentId,
      profile_id:             resolvedProfileId,
      overall_fit:            overallFit,
      specific_feedback:      cleanSpecific,
      notes:                  notes.trim().slice(0, 1000),
      sew_stage:              cleanStage,
      measurements_snapshot:  purchaseFull?.measurements ?? null,
      created_at:             new Date().toISOString(),
    });

  if (insertErr) {
    console.error('submit-feedback insert error:', insertErr.message);
    return res.status(500).json({ error: 'Could not save feedback' });
  }

  return res.status(200).json({ ok: true });
}
