// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Adds an email to the newsletter list and sends a welcome email via Resend
import { sendEmail } from './send-email.js';
import { enqueueWelcomeSequence } from './email-opt-in.js';

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const { email } = body;
  if (!email || !email.includes('@')) {
    return Response.json({ error: 'Valid email required' }, { status: 400 });
  }

  const normalized = email.trim().toLowerCase();

  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

  // Upsert into newsletter table with marketing opt-in
  const { error: dbErr } = await supabase
    .from('newsletter')
    .upsert(
      { email: normalized, marketing_opt_in: true },
      { onConflict: 'email', ignoreDuplicates: false },
    );

  if (dbErr) {
    console.error('Newsletter upsert failed:', dbErr);
    return Response.json({ error: 'Could not save email' }, { status: 500 });
  }

  // Send Day 0 welcome email and enqueue the full welcome sequence
  sendEmail(env, 'WELCOME_SEQUENCE_DAY_0', normalized, {})
    .catch(err => console.error('Welcome Day 0 email failed:', err));

  enqueueWelcomeSequence(env, normalized)
    .catch(err => console.error('Welcome sequence enqueue failed:', err));

  return Response.json({ ok: true });
}
