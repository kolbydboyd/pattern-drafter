// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Cloudflare Pages Function — creates a Stripe Customer Portal session
// for subscription management (upgrade, downgrade, cancel, update payment).
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

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

  const { userId } = body;
  if (!userId) {
    return Response.json({ error: 'userId required' }, { status: 400 });
  }

  const supabase = createClient(
    env.SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
  );

  // Look up the Stripe customer ID from the profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', userId)
    .single();

  if (!profile?.stripe_customer_id) {
    return Response.json({ error: 'No active subscription found' }, { status: 400 });
  }

  const stripe = new Stripe(env.STRIPE_SECRET_KEY);
  const origin = request.headers.get('origin') || 'https://peoplespatterns.com';

  const portalSession = await stripe.billingPortal.sessions.create({
    customer:   profile.stripe_customer_id,
    return_url: `${origin}/?account=subscription`,
  });

  return Response.json({ url: portalSession.url });
}
