// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Cloudflare Pages Function — tester feedback submission.
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from './send-email.js';

const VALID_FIT     = new Set(['perfect', 'good', 'needs_adjustment', 'poor']);
const VALID_AREA    = new Set(['perfect', 'too_tight', 'too_loose', 'too_long', 'too_short', 'n/a']);
const FIT_AREA_KEYS = ['waist_fit', 'hip_fit', 'length', 'shoulder', 'armhole', 'chest_fit', 'thigh_fit', 'rise_fit', 'sleeve_fit'];

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

  const {
    assignmentId,
    overallFit,
    fitAreas = {},
    difficultyRating,
    instructionsClarity,
    wouldSewAgain = true,
    fitNotes = '',
    constructionNotes = '',
    fabricUsed = '',
    modifications = '',
    tips = '',
    photos = [],
    photoCaptions = [],
    featureConsent = false,
    socialHandle = '',
  } = body ?? {};

  // Validate required fields
  if (!assignmentId) return Response.json({ error: 'assignmentId required' }, { status: 400 });
  if (!VALID_FIT.has(overallFit)) return Response.json({ error: 'Invalid overallFit' }, { status: 400 });
  if (!difficultyRating || difficultyRating < 1 || difficultyRating > 5) {
    return Response.json({ error: 'difficultyRating must be 1-5' }, { status: 400 });
  }
  if (!instructionsClarity || instructionsClarity < 1 || instructionsClarity > 5) {
    return Response.json({ error: 'instructionsClarity must be 1-5' }, { status: 400 });
  }

  // Verify user owns the assignment
  const { data: assignment, error: assignErr } = await supabase
    .from('tester_assignments')
    .select('id, garment_id, status')
    .eq('id', assignmentId)
    .eq('user_id', user.id)
    .single();

  if (assignErr || !assignment) return Response.json({ error: 'Assignment not found' }, { status: 404 });
  if (assignment.status === 'submitted' || assignment.status === 'featured') {
    return Response.json({ error: 'Feedback already submitted for this assignment' }, { status: 400 });
  }

  // Sanitize fit areas
  const cleanFitAreas = {};
  for (const key of FIT_AREA_KEYS) {
    const val = fitAreas[key];
    if (val && VALID_AREA.has(val)) cleanFitAreas[key] = val;
  }

  // Sanitize photos (array of storage paths, max 10)
  const cleanPhotos   = (photos || []).filter(p => typeof p === 'string').slice(0, 10);
  const cleanCaptions = (photoCaptions || []).filter(c => typeof c === 'string').slice(0, 10);

  // Insert submission
  const { data: submission, error: insertErr } = await supabase
    .from('tester_submissions')
    .insert({
      assignment_id:        assignmentId,
      user_id:              user.id,
      garment_id:           assignment.garment_id,
      overall_fit:          overallFit,
      fit_areas:            cleanFitAreas,
      difficulty_rating:    difficultyRating,
      instructions_clarity: instructionsClarity,
      would_sew_again:      !!wouldSewAgain,
      fit_notes:            fitNotes.trim().slice(0, 2000),
      construction_notes:   constructionNotes.trim().slice(0, 2000),
      fabric_used:          fabricUsed.trim().slice(0, 500),
      modifications:        modifications.trim().slice(0, 2000),
      tips:                 tips.trim().slice(0, 1000),
      photos:               cleanPhotos,
      photo_captions:       cleanCaptions,
      feature_consent:      !!featureConsent,
      social_handle:        socialHandle?.trim().slice(0, 100) || null,
    })
    .select()
    .single();

  if (insertErr) {
    console.error('tester-submit insert error:', insertErr.message);
    return Response.json({ error: 'Could not save submission' }, { status: 500 });
  }

  // Mark assignment as submitted
  await supabase
    .from('tester_assignments')
    .update({
      status:       'submitted',
      completed_at: new Date().toISOString(),
      updated_at:   new Date().toISOString(),
    })
    .eq('id', assignmentId);

  // Send confirmation email
  try {
    const name = user.user_metadata?.name || user.email?.split('@')[0] || '';
    await sendEmail(env, 'TESTER_SUBMISSION_RECEIVED', user.email, {
      name,
      garmentName: assignment.garment_id,
    });
  } catch (e) {
    console.error('tester submit email error:', e.message);
  }

  return Response.json({ ok: true, submission });
}
