// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Vercel serverless function — creates a Stripe Customer Portal session
// for subscription management (upgrade, downgrade, cancel, update payment).
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'userId required' });
  }

  // Look up the Stripe customer ID from the profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', userId)
    .single();

  if (!profile?.stripe_customer_id) {
    return res.status(400).json({ error: 'No active subscription found' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const origin = req.headers.origin || 'https://peoplespatterns.com';

  const portalSession = await stripe.billingPortal.sessions.create({
    customer:   profile.stripe_customer_id,
    return_url: `${origin}/?account=subscription`,
  });

  res.status(200).json({ url: portalSession.url });
}
