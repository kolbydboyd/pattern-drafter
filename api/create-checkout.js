// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Vercel serverless function — creates a Stripe Checkout session
import Stripe from 'stripe';
import { PATTERN_PRICES } from '../src/lib/pricing.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { garmentId, userId, measurements, opts } = req.body;

  const price = PATTERN_PRICES[garmentId];
  if (!price) {
    return res.status(400).json({ error: `Unknown garment: ${garmentId}` });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const origin = req.headers.origin || 'https://peoplespatterns.com';

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{
      price:    price.priceId,
      quantity: 1,
    }],
    success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:  `${origin}/?garment=${garmentId}`,
    metadata: {
      userId:       userId ?? '',
      garmentId,
      measurements: JSON.stringify(measurements ?? {}),
      opts:         JSON.stringify(opts ?? {}),
    },
  });

  res.status(200).json({ url: session.url });
}
