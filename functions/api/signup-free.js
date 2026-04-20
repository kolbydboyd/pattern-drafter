// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Cloudflare Pages Function — create a new user account with 1 free download credit.
// Bypasses email confirmation so the user can sign in and download immediately.
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from './send-email.js';

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== 'POST') return Response.json({ error: 'Method not allowed' }, { status: 405 });

  let body;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const { email, password } = body ?? {};
  if (!email || !password) return Response.json({ error: 'Email and password are required.' }, { status: 400 });
  if (password.length < 10 || !/[\d!@#$%^&*()\-_=+[\]{};:'",.<>/?\\|`~]/.test(password)) {
    return Response.json({ error: 'Password must be at least 10 characters and include a number or symbol.' }, { status: 400 });
  }

  const supabase = createClient(
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
  );

  // Create user, bypassing email confirmation for immediate sign-in
  const { data: { user }, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    const msg = error.message ?? '';
    if (msg.toLowerCase().includes('already registered') || error.status === 422) {
      return Response.json({ error: 'An account with this email already exists. Please sign in instead.' }, { status: 409 });
    }
    return Response.json({ error: msg || 'Could not create account.' }, { status: 400 });
  }

  // Create profile with 1 free download credit
  const { error: profileErr } = await supabase
    .from('profiles')
    .upsert({ id: user.id, email: user.email, free_credits: 1 }, { onConflict: 'id' });

  if (profileErr) {
    console.error('[signup-free] profile upsert error:', profileErr.message);
    // Non-fatal — account created, credit may be set by DB trigger
  }

  // Send welcome email (fire-and-forget — don't block account creation)
  sendEmail(env, 'WELCOME', email, { freeCredit: true })
    .catch(err => console.error('[signup-free] welcome email failed:', err));

  return Response.json({ ok: true });
}
