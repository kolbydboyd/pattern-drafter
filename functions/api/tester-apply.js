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
  const { experience, specialties = [], machineTypes = [], socialHandle, portfolioUrl, whyTest } = body ?? {};

  if (!VALID_EXPERIENCE.has(experience)) {
    return Response.json({ error: 'Invalid experience level' }, { status: 400 });
  }
  if (!whyTest || whyTest.trim().length < 10) {
    return Response.json({ error: 'Please tell us why you want to test (min 10 characters)' }, { status: 400 });
  }

  const cleanSpecialties = specialties.filter(s => VALID_SPECIALTIES.has(s));
  const cleanMachines    = machineTypes.filter(m => VALID_MACHINES.has(m));

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
      user_id:       user.id,
      experience,
      specialties:   cleanSpecialties,
      machine_types: cleanMachines,
      social_handle: socialHandle?.trim().slice(0, 100) || null,
      portfolio_url: portfolioUrl?.trim().slice(0, 500) || null,
      why_test:      whyTest.trim().slice(0, 2000),
    })
    .select()
    .single();

  if (insertErr) {
    console.error('tester-apply insert error:', insertErr.message);
    return Response.json({ error: 'Could not submit application' }, { status: 500 });
  }

  // Send confirmation email (fire-and-forget)
  try {
    const name = user.user_metadata?.name || user.email?.split('@')[0] || '';
    await sendEmail(env, 'TESTER_APPLICATION_RECEIVED', user.email, { name });
  } catch (e) {
    console.error('tester apply email error:', e.message);
  }

  return Response.json({ ok: true, application: app });
}
