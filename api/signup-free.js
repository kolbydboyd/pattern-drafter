// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Vercel serverless function — create a new user account with 1 free download credit.
// Bypasses email confirmation so the user can sign in and download immediately.
import { createClient } from '@supabase/supabase-js';
import { rateLimit } from './_rate-limit.js';

const limiter = rateLimit({ windowMs: 60_000, max: 5 });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

export default async function handler(req, res) {
  if (limiter(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, password } = req.body ?? {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });

  // Create user, bypassing email confirmation for immediate sign-in
  const { data: { user }, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    const msg = error.message ?? '';
    if (msg.toLowerCase().includes('already registered') || error.status === 422) {
      return res.status(409).json({ error: 'An account with this email already exists. Please sign in instead.' });
    }
    return res.status(400).json({ error: msg || 'Could not create account.' });
  }

  // Create profile with 1 free download credit
  const { error: profileErr } = await supabase
    .from('profiles')
    .upsert({ id: user.id, email: user.email, free_credits: 1 }, { onConflict: 'id' });

  if (profileErr) {
    console.error('[signup-free] profile upsert error:', profileErr.message);
    // Non-fatal — account created, credit may be set by DB trigger
  }

  return res.status(200).json({ ok: true });
}
