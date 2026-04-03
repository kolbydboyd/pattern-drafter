// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Records email marketing opt-in, sends Day 0 welcome email, enqueues drip sequence.
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from './send-email.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

// Welcome sequence schedule (days after opt-in)
const DRIP_DAYS = [2, 5, 9, 13];
const STEP_TYPES = [
  'WELCOME_SEQUENCE_DAY_0',
  'WELCOME_SEQUENCE_DAY_2',
  'WELCOME_SEQUENCE_DAY_5',
  'WELCOME_SEQUENCE_DAY_9',
  'WELCOME_SEQUENCE_DAY_13',
];

export async function enqueueWelcomeSequence(email, userId = null) {
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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, userId } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email required' });
  }

  const normalized = email.trim().toLowerCase();

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
  sendEmail('WELCOME_SEQUENCE_DAY_0', normalized, {})
    .catch(err => console.error('Welcome Day 0 email failed:', err));

  // Enqueue remaining drip emails
  await enqueueWelcomeSequence(normalized, userId);

  res.status(200).json({ ok: true });
}
