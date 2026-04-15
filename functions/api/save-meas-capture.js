// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Cloudflare Pages Function — exit-intent measurement profile capture.
// Creates a Supabase account (or signs in existing) and stores measurement profile.
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

  const { email, measurements = {} } = body ?? {};

  if (!email || !email.includes('@')) {
    return Response.json({ error: 'Valid email required' }, { status: 400 });
  }

  const supabase = createClient(
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
  );

  // 1. Check if user already exists; if not, create with a random password
  //    (user can set password via forgot-password flow)
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email.toLowerCase())
    .maybeSingle();

  let userId = existing?.id ?? null;

  if (!userId) {
    const password = Math.random().toString(36).slice(2, 10)
                   + Math.random().toString(36).slice(2, 10);
    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email: email.toLowerCase(),
      password,
      email_confirm: true,
    });

    if (createErr && !createErr.message?.includes('already registered')) {
      console.error('save-meas-capture createUser error:', createErr.message);
      // Still store in subscribers table as fallback
      await supabase.from('subscribers').upsert({ email: email.toLowerCase() }, { onConflict: 'email' });
      return Response.json({ saved: true, created: false });
    }
    userId = created?.user?.id ?? null;
  }

  // 2. If measurements provided and user exists, save as a measurement profile
  if (userId && Object.keys(measurements).length > 0) {
    await supabase.from('measurement_profiles').upsert({
      user_id:    userId,
      name:       'Saved from exit capture',
      measurements,
      last_used_at: new Date().toISOString(),
    }, { onConflict: 'user_id, name' });
  }

  // 3. Store in subscribers table
  await supabase.from('subscribers').upsert(
    { email: email.toLowerCase(), user_id: userId },
    { onConflict: 'email' },
  );

  // 4. Send welcome email
  sendEmail(env, 'WELCOME', email.toLowerCase(), {
    hasMeasurements: Object.keys(measurements).length > 0,
    freeCredit: true,
  }).catch(err => console.error('save-meas-capture welcome email failed:', err));

  return Response.json({ saved: true, created: !existing });
}
