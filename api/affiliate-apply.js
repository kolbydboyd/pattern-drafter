// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Handles affiliate program applications.
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from './send-email.js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const CODE_RE = /^[a-z0-9][a-z0-9-]{1,18}[a-z0-9]$/;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, code, websiteUrl, socialHandles, paypalEmail, userId } = req.body;

  if (!name || !email || !code) {
    return res.status(400).json({ error: 'Name, email, and referral code are required' });
  }

  const normalizedCode = code.trim().toLowerCase().replace(/\s+/g, '-');
  if (!CODE_RE.test(normalizedCode)) {
    return res.status(400).json({
      error: 'Code must be 3-20 characters, lowercase letters, numbers, and hyphens only',
    });
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Check if code is already taken
  const { data: existing } = await supabase
    .from('affiliates')
    .select('id')
    .eq('code', normalizedCode)
    .single();
  if (existing) {
    return res.status(409).json({ error: 'That referral code is already taken. Try another one.' });
  }

  // Check if email already applied
  const { data: existingEmail } = await supabase
    .from('affiliates')
    .select('id, status')
    .eq('email', normalizedEmail)
    .single();
  if (existingEmail) {
    return res.status(409).json({ error: 'An application with this email already exists.' });
  }

  const { error: insertErr } = await supabase.from('affiliates').insert({
    user_id:        userId || null,
    name:           name.trim(),
    email:          normalizedEmail,
    code:           normalizedCode,
    paypal_email:   paypalEmail?.trim() || null,
    website_url:    websiteUrl?.trim() || null,
    social_handles: socialHandles || {},
    status:         'pending',
  });

  if (insertErr) {
    console.error('Affiliate insert failed:', insertErr);
    return res.status(500).json({ error: 'Could not submit application' });
  }

  // Confirmation email to applicant
  sendEmail('AFFILIATE_APPLICATION', normalizedEmail, { name: name.trim(), code: normalizedCode })
    .catch(err => console.error('Affiliate application email failed:', err));

  // Notify the admin
  const adminEmail = process.env.ADMIN_EMAIL || 'hello@peoplespatterns.com';
  sendEmail('AFFILIATE_ADMIN_NOTIFY', adminEmail, {
    name: name.trim(),
    email: normalizedEmail,
    code: normalizedCode,
    websiteUrl: websiteUrl?.trim() || '',
    socialHandles: socialHandles || {},
    paypalEmail: paypalEmail?.trim() || '',
  }).catch(err => console.error('Affiliate admin notify failed:', err));

  res.status(200).json({ ok: true });
}
