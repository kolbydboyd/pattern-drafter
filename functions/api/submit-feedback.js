// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Cloudflare Pages Function — store fit feedback in Supabase.
import { createClient } from '@supabase/supabase-js';

const VALID_OVERALL   = new Set(['perfect', 'good', 'needs_adjustment', 'poor']);
const VALID_AREA_VALS = new Set(['perfect', 'too_tight', 'too_loose', 'too_long', 'too_short', 'n/a']);
const AREA_KEYS       = ['waist_fit', 'hip_fit', 'length', 'shoulder', 'armhole', 'chest_fit', 'thigh_fit', 'neck_fit', 'sleeve_fit', 'rise_fit'];

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 });

  // Auth — extract user from Bearer token
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

  let { purchaseId, garmentId, overallFit, specificFeedback = {}, notes = '', profileId = null } = body ?? {};

  // Validate required fields
  if (!garmentId) return Response.json({ error: 'garmentId required' }, { status: 400 });
  if (!VALID_OVERALL.has(overallFit)) return Response.json({ error: 'Invalid overallFit value' }, { status: 400 });

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
    if (!found) return Response.json({ error: 'No purchase found for this garment' }, { status: 404 });
    purchaseId = found.id;
  }

  // Verify user owns this purchase
  const { data: purchase, error: purchErr } = await supabase
    .from('purchases')
    .select('id, profile_id')
    .eq('id', purchaseId)
    .eq('user_id', user.id)
    .single();
  if (purchErr || !purchase) return Response.json({ error: 'Purchase not found' }, { status: 404 });

  const resolvedProfileId = profileId || purchase.profile_id || null;

  // Fetch the measurements snapshot from the purchase (frozen at generation time)
  const { data: purchaseFull } = await supabase
    .from('purchases')
    .select('measurements')
    .eq('id', purchaseId)
    .single();

  const { sewStage = 'final' } = body ?? {};
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
    return Response.json({ error: 'Could not save feedback' }, { status: 500 });
  }

  return Response.json({ ok: true });
}
