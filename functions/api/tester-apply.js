// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Cloudflare Pages Function — tester program application.
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from './send-email.js';

const VALID_EXPERIENCE = new Set(['beginner', 'intermediate', 'advanced']);
const VALID_SPECIALTIES = new Set([
  'woven_tops', 'knit_tops', 'pants', 'skirts', 'dresses',
  'outerwear', 'activewear', 'tailoring', 'menswear', 'childrenswear',
]);
const VALID_MACHINES = new Set([
  'domestic_sewing', 'industrial_sewing', 'serger', 'coverstitch', 'embroidery',
]);
const VALID_PATTERN_CATEGORIES = new Set([
  'lower_body', 'skirts', 'upper_body', 'dresses', 'outerwear',
]);
const VALID_MEASUREMENT_IDS = new Set([
  'waist', 'hip', 'rise', 'thigh', 'inseam', 'knee',
  'chest', 'shoulder', 'neck', 'torsoLength', 'sleeveLength', 'bicep', 'wrist',
  'skirtLength', 'fullLength', 'height',
]);

function cleanMeasurements(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const out = {};
  for (const [k, v] of Object.entries(raw)) {
    if (!VALID_MEASUREMENT_IDS.has(k)) continue;
    const n = parseFloat(v);
    if (!isNaN(n) && n > 0 && n < 200) out[k] = n;
  }
  return out;
}

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 });

  // Auth
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

  const { action = 'apply' } = body ?? {};

  // ── Withdraw ───────────────────────────────────────────────────────────────
  if (action === 'withdraw') {
    const { error } = await supabase
      .from('tester_applications')
      .update({ status: 'withdrawn', updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('status', 'pending');
    if (error) return Response.json({ error: 'Could not withdraw application' }, { status: 500 });
    return Response.json({ ok: true });
  }

  // ── Apply ──────────────────────────────────────────────────────────────────
  const {
    experience,
    specialties      = [],
    machineTypes      = [],
    socialHandle,
    portfolioUrl,
    whyTest,
    fullName,
    location,
    measurements     = {},
    patternCategories = [],
    hasPrinter,
    agreementAccepted,
    mediaConsent,
    agreementVersion,
  } = body ?? {};

  if (!VALID_EXPERIENCE.has(experience)) {
    return Response.json({ error: 'Invalid experience level' }, { status: 400 });
  }
  if (!whyTest || whyTest.trim().length < 10) {
    return Response.json({ error: 'Please tell us why you want to test (min 10 characters)' }, { status: 400 });
  }
  if (!agreementAccepted) {
    return Response.json({ error: 'You must accept the Tester Agreement to apply' }, { status: 400 });
  }
  if (!mediaConsent) {
    return Response.json({ error: 'Photo and media consent is required to apply' }, { status: 400 });
  }

  const cleanSpecialties  = specialties.filter(s => VALID_SPECIALTIES.has(s));
  const cleanMachines     = machineTypes.filter(m => VALID_MACHINES.has(m));
  const cleanCategories   = patternCategories.filter(c => VALID_PATTERN_CATEGORIES.has(c));
  const cleanMeas         = cleanMeasurements(measurements);

  // Check for existing active application
  const { data: existing } = await supabase
    .from('tester_applications')
    .select('id, status')
    .eq('user_id', user.id)
    .neq('status', 'withdrawn')
    .limit(1)
    .maybeSingle();

  if (existing) {
    if (existing.status === 'approved') {
      return Response.json({ error: 'You are already an approved tester' }, { status: 400 });
    }
    return Response.json({ error: 'You already have a pending application' }, { status: 400 });
  }

  const { data: app, error: insertErr } = await supabase
    .from('tester_applications')
    .insert({
      user_id:               user.id,
      experience,
      specialties:           cleanSpecialties,
      machine_types:         cleanMachines,
      social_handle:         socialHandle?.trim().slice(0, 100) || null,
      portfolio_url:         portfolioUrl?.trim().slice(0, 500) || null,
      why_test:              whyTest.trim().slice(0, 2000),
      full_name:             fullName?.trim().slice(0, 120) || null,
      location:              location?.trim().slice(0, 200) || null,
      measurements:          cleanMeas,
      pattern_categories:    cleanCategories,
      has_printer:           !!hasPrinter,
      agreement_accepted:    true,
      agreement_accepted_at: new Date().toISOString(),
      agreement_version:     (agreementVersion || 'v1.0').slice(0, 20),
      media_consent:         true,
    })
    .select()
    .single();

  if (insertErr) {
    console.error('tester-apply insert error:', insertErr.message);
    return Response.json({ error: 'Could not submit application' }, { status: 500 });
  }

  // Send confirmation to applicant (fire-and-forget)
  try {
    const name = fullName?.trim() || user.user_metadata?.name || user.email?.split('@')[0] || '';
    await sendEmail(env, 'TESTER_APPLICATION_RECEIVED', user.email, { name });
  } catch (e) {
    console.error('tester apply email error:', e.message);
  }

  // Notify admin with current slot counts (fire-and-forget)
  try {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const { count: slotsThisMonth } = await supabase
      .from('tester_assignments')
      .select('id', { count: 'exact', head: true })
      .eq('is_paid_slot', true)
      .eq('paid_slot_month', currentMonth);

    const adminEmail = env.ADMIN_EMAIL || 'kolbyboyd970@gmail.com';
    await sendEmail(env, 'TESTER_ADMIN_NOTIFY', adminEmail, {
      applicantName:       fullName?.trim() || user.email?.split('@')[0] || '',
      applicantEmail:      user.email,
      experience,
      specialties:         cleanSpecialties,
      patternCategories:   cleanCategories,
      slotsClaimedThisMonth: slotsThisMonth ?? 0,
      monthlyCapTotal:     parseInt(env.MONTHLY_PAID_TEST_CAP || '5', 10),
    });
  } catch (e) {
    console.error('tester admin notify error:', e.message);
  }

  return Response.json({ ok: true, application: app });
}
