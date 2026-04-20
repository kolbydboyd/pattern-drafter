// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Cloudflare Pages Function — generates a one-time 10% Stripe coupon for a new email.
// Each email address can only claim the discount once (tracked in email_discount_uses).
import Stripe from 'stripe';

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const ALLOWED_ORIGINS = new Set(['https://peoplespatterns.com', 'https://www.peoplespatterns.com']);
  const requestOrigin = request.headers.get('origin') || '';
  if (requestOrigin && !ALLOWED_ORIGINS.has(requestOrigin)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const raw = (body.email ?? '').trim().toLowerCase();
  if (!raw || !raw.includes('@')) {
    return Response.json({ error: 'Valid email required' }, { status: 400 });
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

    // Check if this email already used the discount
    const { data: existing } = await supabase
      .from('email_discount_uses')
      .select('id')
      .eq('email', raw)
      .maybeSingle();

    if (existing) {
      return Response.json(
        { error: 'Unable to process request.', alreadyUsed: true },
        { status: 400 },
      );
    }

    const stripe = new Stripe(env.STRIPE_SECRET_KEY);

    // Create a one-time-use 10% off coupon
    const coupon = await stripe.coupons.create({
      percent_off:      10,
      duration:         'once',
      max_redemptions:  1,
      metadata: { source: 'email_discount', email: raw },
    });

    // Record so the same email can't reuse it
    await supabase.from('email_discount_uses').insert({ email: raw, coupon_id: coupon.id });

    // Also add to join_list if the table exists (marketing opt-in, best-effort)
    supabase.from('join_list').upsert({ email: raw }).then(() => {}).catch(() => {});

    return Response.json({ couponId: coupon.id, percentOff: 10 });

  } catch (err) {
    console.error('Email discount error:', err);
    return Response.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
