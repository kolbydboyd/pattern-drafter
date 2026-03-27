// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Adds an email to the newsletter list and sends a Resend welcome email
import { createClient } from '@supabase/supabase-js';

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

  // Upsert into newsletter table
  const { error: dbErr } = await supabase
    .from('newsletter')
    .upsert({ email: normalized }, { onConflict: 'email', ignoreDuplicates: true });

  if (dbErr) {
    console.error('Newsletter upsert failed:', dbErr);
    return res.status(500).json({ error: 'Could not save email' });
  }

  // Send welcome email via Resend (fire-and-forget — don't block response)
  if (process.env.RESEND_API_KEY) {
    fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from:    'People\'s Patterns <hello@peoplespatterns.com>',
        to:      [normalized],
        subject: 'You\'re on the list',
        html: `<p>Hi,</p>
<p>You're now on the People's Patterns notification list. We'll let you know when new patterns drop.</p>
<p>In the meantime, browse the current catalog at <a href="https://peoplespatterns.com">peoplespatterns.com</a>.</p>
<p>Happy sewing,<br>People's Patterns</p>
<p style="font-size:11px;color:#888">To unsubscribe, reply to this email with "unsubscribe" in the subject.</p>`,
      }),
    }).catch(err => console.error('Welcome email failed:', err));
  }

  res.status(200).json({ ok: true });
}
