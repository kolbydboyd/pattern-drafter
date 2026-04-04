// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Adds an email to the newsletter list and sends a welcome email via Resend
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from './send-email.js';
import { rateLimit } from './_rate-limit.js';
import { enqueueWelcomeSequence } from './email-opt-in.js';

const limiter = rateLimit({ windowMs: 60_000, max: 5 });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

export default async function handler(req, res) {
  if (limiter(req, res)) return;
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email required' });
  }

  const normalized = email.trim().toLowerCase();

  // Upsert into newsletter table with marketing opt-in
  const { error: dbErr } = await supabase
    .from('newsletter')
    .upsert(
      { email: normalized, marketing_opt_in: true },
      { onConflict: 'email', ignoreDuplicates: false },
    );

  if (dbErr) {
    console.error('Newsletter upsert failed:', dbErr);
    return res.status(500).json({ error: 'Could not save email' });
  }

  // Send Day 0 welcome email and enqueue the full welcome sequence
  sendEmail('WELCOME_SEQUENCE_DAY_0', normalized, {})
    .catch(err => console.error('Welcome Day 0 email failed:', err));

  enqueueWelcomeSequence(normalized)
    .catch(err => console.error('Welcome sequence enqueue failed:', err));

  res.status(200).json({ ok: true });
}
