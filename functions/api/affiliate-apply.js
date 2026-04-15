// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Handles affiliate program applications.
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from './send-email.js';

const CODE_RE = /^[a-z0-9][a-z0-9-]{1,18}[a-z0-9]$/;

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

  const { name, email, code, websiteUrl, socialHandles, paypalEmail, userId } = body;

  if (!name || !email || !code) {
    return Response.json({ error: 'Name, email, and referral code are required' }, { status: 400 });
  }

  const normalizedCode = code.trim().toLowerCase().replace(/\s+/g, '-');
  if (!CODE_RE.test(normalizedCode)) {
    return Response.json({
      error: 'Code must be 3-20 characters, lowercase letters, numbers, and hyphens only',
    }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();

  const supabase = createClient(
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
  );

  // Check if code is already taken
  const { data: existing } = await supabase
    .from('affiliates')
    .select('id')
    .eq('code', normalizedCode)
    .single();
  if (existing) {
    return Response.json({ error: 'That referral code is already taken. Try another one.' }, { status: 409 });
  }

  // Check if email already applied
  const { data: existingEmail } = await supabase
    .from('affiliates')
    .select('id, status')
    .eq('email', normalizedEmail)
    .single();
  if (existingEmail) {
    return Response.json({ error: 'An application with this email already exists.' }, { status: 409 });
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
    return Response.json({ error: 'Could not submit application' }, { status: 500 });
  }

  // Confirmation email to applicant
  sendEmail(env, 'AFFILIATE_APPLICATION', normalizedEmail, { name: name.trim(), code: normalizedCode })
    .catch(err => console.error('Affiliate application email failed:', err));

  // Notify the admin
  const adminEmail = env.ADMIN_EMAIL || 'hello@peoplespatterns.com';
  sendEmail(env, 'AFFILIATE_ADMIN_NOTIFY', adminEmail, {
    name: name.trim(),
    email: normalizedEmail,
    code: normalizedCode,
    websiteUrl: websiteUrl?.trim() || '',
    socialHandles: socialHandles || {},
    paypalEmail: paypalEmail?.trim() || '',
  }).catch(err => console.error('Affiliate admin notify failed:', err));

  return Response.json({ ok: true });
}
