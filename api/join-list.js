// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Adds an email to the newsletter list and sends a welcome email via Resend
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from './send-email.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email required' });
  }

  const normalized = email.trim().toLowerCase();

  // Upsert into newsletter table — ignore duplicates
  const { error: dbErr } = await supabase
    .from('newsletter')
    .upsert({ email: normalized }, { onConflict: 'email', ignoreDuplicates: true });

  if (dbErr) {
    console.error('Newsletter upsert failed:', dbErr);
    return res.status(500).json({ error: 'Could not save email' });
  }

  // Send welcome email using the shared template (fire-and-forget)
  sendEmail('WELCOME', normalized, {})
    .catch(err => console.error('Welcome email failed:', err));

  res.status(200).json({ ok: true });
}
