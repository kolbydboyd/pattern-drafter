// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Vercel serverless function — tester program application.
import { createClient } from '@supabase/supabase-js';
import { rateLimit } from './_rate-limit.js';
import { sendEmail } from './send-email.js';

const limiter = rateLimit({ windowMs: 60_000, max: 5 });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const VALID_EXPERIENCE = new Set(['beginner', 'intermediate', 'advanced']);
const VALID_SPECIALTIES = new Set([
  'woven_tops', 'knit_tops', 'pants', 'skirts', 'dresses',
  'outerwear', 'activewear', 'tailoring', 'menswear', 'childrenswear',
]);
const VALID_MACHINES = new Set([
  'domestic_sewing', 'industrial_sewing', 'serger', 'coverstitch', 'embroidery',
]);

export default async function handler(req, res) {
  if (limiter(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Auth
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { data: { user }, error: authErr } = await supabase.auth.getUser(token);
  if (authErr || !user) return res.status(401).json({ error: 'Unauthorized' });

  const { action = 'apply' } = req.body ?? {};

  // ── Withdraw ───────────────────────────────────────────────────────────────
  if (action === 'withdraw') {
    const { error } = await supabase
      .from('tester_applications')
      .update({ status: 'withdrawn', updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('status', 'pending');
    if (error) return res.status(500).json({ error: 'Could not withdraw application' });
    return res.status(200).json({ ok: true });
  }

  // ── Apply ──────────────────────────────────────────────────────────────────
  const { experience, specialties = [], machineTypes = [], socialHandle, portfolioUrl, whyTest } = req.body ?? {};

  if (!VALID_EXPERIENCE.has(experience)) {
    return res.status(400).json({ error: 'Invalid experience level' });
  }
  if (!whyTest || whyTest.trim().length < 10) {
    return res.status(400).json({ error: 'Please tell us why you want to test (min 10 characters)' });
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
      return res.status(400).json({ error: 'You are already an approved tester' });
    }
    return res.status(400).json({ error: 'You already have a pending application' });
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
    return res.status(500).json({ error: 'Could not submit application' });
  }

  // Send confirmation email (fire-and-forget)
  try {
    const name = user.user_metadata?.name || user.email?.split('@')[0] || '';
    await sendEmail('TESTER_APPLICATION_RECEIVED', user.email, { name });
  } catch (e) {
    console.error('tester apply email error:', e.message);
  }

  return res.status(200).json({ ok: true, application: app });
}
