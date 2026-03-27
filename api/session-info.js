// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Returns metadata for a completed Stripe Checkout session (garment name, amount)
import Stripe from 'stripe';
import { PATTERN_PRICES } from '../src/lib/pricing.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { session_id } = req.query;
  if (!session_id) {
    return res.status(400).json({ error: 'Missing session_id' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(session_id);
  } catch (err) {
    return res.status(400).json({ error: 'Invalid session' });
  }

  const { garmentId, userId, measurements, opts } = session.metadata || {};
  const price = PATTERN_PRICES[garmentId];

  res.status(200).json({
    garmentId,
    garmentName:  price?.label ?? garmentId,
    amountCents:  session.amount_total,
    userId:       userId || null,
    measurements: measurements ? JSON.parse(measurements) : {},
    opts:         opts ? JSON.parse(opts) : {},
    sessionId:    session_id,
    status:       session.payment_status,
  });
}
