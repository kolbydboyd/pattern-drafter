// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Returns metadata for a completed Stripe Checkout session (garment name, amount).
// Supports single pattern, bundle, and subscription sessions.
import Stripe from 'stripe';
import { PATTERN_PRICES, BUNDLES, SUBSCRIPTION_PRICES } from '../src/lib/pricing.js';

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

  const meta = session.metadata || {};
  const checkoutMode = meta.checkoutMode || 'pattern';

  // ── Single pattern ─────────────────────────────────────────────────────────
  if (checkoutMode === 'pattern') {
    const { garmentId, userId, measurements, opts } = meta;
    const price = PATTERN_PRICES[garmentId];

    return res.status(200).json({
      checkoutMode: 'pattern',
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

  // ── Bundle ─────────────────────────────────────────────────────────────────
  if (checkoutMode === 'bundle') {
    const { bundleId, userId, garmentIds, patternCount } = meta;
    const bundle = BUNDLES[bundleId];

    return res.status(200).json({
      checkoutMode: 'bundle',
      bundleId,
      bundleName:   bundle?.label ?? bundleId,
      patternCount: parseInt(patternCount, 10) || 0,
      garmentIds:   garmentIds ? JSON.parse(garmentIds) : [],
      amountCents:  session.amount_total,
      userId:       userId || null,
      sessionId:    session_id,
      status:       session.payment_status,
    });
  }

  // ── Subscription ───────────────────────────────────────────────────────────
  if (checkoutMode === 'subscription') {
    const { planId, userId } = meta;
    const plan = SUBSCRIPTION_PRICES[planId];

    return res.status(200).json({
      checkoutMode: 'subscription',
      planId,
      planName:     plan?.label ?? planId,
      credits:      plan?.credits ?? 0,
      amountCents:  session.amount_total,
      userId:       userId || null,
      sessionId:    session_id,
      status:       session.payment_status,
      subscriptionId: session.subscription || null,
    });
  }

  // ── A0 upgrade ─────────────────────────────────────────────────────────────
  if (checkoutMode === 'a0_upgrade') {
    return res.status(200).json({
      checkoutMode: 'a0_upgrade',
      purchaseId:   meta.purchaseId,
      amountCents:  session.amount_total,
      userId:       meta.userId || null,
      sessionId:    session_id,
      status:       session.payment_status,
    });
  }

  return res.status(200).json({
    checkoutMode,
    amountCents: session.amount_total,
    sessionId:   session_id,
    status:      session.payment_status,
  });
}
