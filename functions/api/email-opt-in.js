// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Records email marketing opt-in, sends Day 0 welcome email, enqueues drip sequence.
import { sendEmail } from './send-email.js';

// Welcome sequence schedule (days after opt-in)
const DRIP_DAYS = [2, 5, 9, 13];

export async function enqueueWelcomeSequence(env, email, userId = null) {
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

  const now = new Date();

  // Day 0 sent immediately (not enqueued)
  const rows = DRIP_DAYS.map((days, i) => ({
    user_id:       userId || null,
    email,
    step:          i + 1, // steps 1-4 (Day 0 is step 0, sent immediately)
    scheduled_for: new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString(),
  }));

  // Also insert step 0 as already sent (for tracking completeness)
  rows.unshift({
    user_id:       userId || null,
    email,
    step:          0,
    scheduled_for: now.toISOString(),
    sent_at:       now.toISOString(),
  });

  await supabase
    .from('welcome_sequence')
    .upsert(rows, { onConflict: 'email,step', ignoreDuplicates: true });
}

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const ALLOWED_ORIGINS = new Set(['https://peoplespatterns.com', 'https://www.peoplespatterns.com']);
  const requestOrigin = request.headers.get('origin') || '';
  if (requestOrigin && !ALLOWED_ORIGINS.has(requestOrigin)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const { email, userId } = body;
  if (!email || !email.includes('@')) {
    return Response.json({ error: 'Valid email required' }, { status: 400 });
  }

  const normalized = email.trim().toLowerCase();

  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

  // Upsert newsletter with marketing opt-in
  await supabase
    .from('newsletter')
    .upsert(
      { email: normalized, marketing_opt_in: true },
      { onConflict: 'email', ignoreDuplicates: false },
    );

  // Update profile if userId provided
  if (userId) {
    await supabase
      .from('profiles')
      .update({ marketing_opt_in: true })
      .eq('id', userId);
  }

  // Send Day 0 immediately
  sendEmail(env, 'WELCOME_SEQUENCE_DAY_0', normalized, {})
    .catch(err => console.error('Welcome Day 0 email failed:', err));

  // Enqueue remaining drip emails
  await enqueueWelcomeSequence(env, normalized, userId);

  return Response.json({ ok: true });
}
