// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Vercel serverless function — tester feedback submission.
import { createClient } from '@supabase/supabase-js';
import { rateLimit } from './_rate-limit.js';
import { sendEmail } from './send-email.js';

const limiter = rateLimit({ windowMs: 60_000, max: 10 });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const VALID_FIT     = new Set(['perfect', 'good', 'needs_adjustment', 'poor']);
const VALID_AREA    = new Set(['perfect', 'too_tight', 'too_loose', 'too_long', 'too_short', 'n/a']);
const FIT_AREA_KEYS = ['waist_fit', 'hip_fit', 'length', 'shoulder', 'armhole', 'chest_fit', 'thigh_fit', 'rise_fit', 'sleeve_fit'];

export default async function handler(req, res) {
  if (limiter(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) return res.status(401).json({ error: 'Unauthorized' });

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
  } = req.body ?? {};

  // Validate required fields
  if (!assignmentId) return res.status(400).json({ error: 'assignmentId required' });
  if (!VALID_FIT.has(overallFit)) return res.status(400).json({ error: 'Invalid overallFit' });
  if (!difficultyRating || difficultyRating < 1 || difficultyRating > 5) {
    return res.status(400).json({ error: 'difficultyRating must be 1-5' });
  }
  if (!instructionsClarity || instructionsClarity < 1 || instructionsClarity > 5) {
    return res.status(400).json({ error: 'instructionsClarity must be 1-5' });
  }

  // Verify user owns the assignment
  const { data: assignment, error: assignErr } = await supabase
    .from('tester_assignments')
    .select('id, garment_id, status')
    .eq('id', assignmentId)
    .eq('user_id', user.id)
    .single();

  if (assignErr || !assignment) return res.status(404).json({ error: 'Assignment not found' });
  if (assignment.status === 'submitted' || assignment.status === 'featured') {
    return res.status(400).json({ error: 'Feedback already submitted for this assignment' });
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
    return res.status(500).json({ error: 'Could not save submission' });
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
    await sendEmail('TESTER_SUBMISSION_RECEIVED', user.email, {
      name,
      garmentName: assignment.garment_id,
    });
  } catch (e) {
    console.error('tester submit email error:', e.message);
  }

  return res.status(200).json({ ok: true, submission });
}
