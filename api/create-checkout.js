// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Vercel serverless function — creates a Stripe Checkout session
// Supports three modes: single pattern, bundle, and subscription.
import Stripe from 'stripe';
import { PATTERN_PRICES, A0_UPSELL, BUNDLES, SUBSCRIPTION_PRICES } from '../src/lib/pricing.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const origin = req.headers.origin || 'https://peoplespatterns.com';
  const { mode = 'pattern' } = req.body;

  // ── Single pattern checkout ────────────────────────────────────────────────
  if (mode === 'pattern') {
    const { garmentId, userId, measurements, opts, profileId, addA0 = false } = req.body;

    const price = PATTERN_PRICES[garmentId];
    if (!price) {
      return res.status(400).json({ error: `Unknown garment: ${garmentId}` });
    }

    // Store measurements + opts in Supabase so they never reach Stripe.
    // Body measurements are sensitive personal data — Stripe only gets
    // a reference ID, garment choice, and style options.
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );
    const { data: pendingRow, error: pendingErr } = await supabase
      .from('pending_checkouts')
      .insert({
        user_id:      userId || null,
        garment_id:   garmentId,
        profile_id:   profileId || null,
        measurements: measurements ?? {},
        opts:         opts ?? {},
      })
      .select('id')
      .single();
    if (pendingErr) {
      console.error('Failed to create pending checkout:', pendingErr.message);
      return res.status(500).json({ error: 'Could not prepare checkout' });
    }

    const lineItems = [{ price: price.priceId, quantity: 1 }];
    if (addA0 && A0_UPSELL.priceId) {
      lineItems.push({ price: A0_UPSELL.priceId, quantity: 1 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      allow_promotion_codes: true,
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${origin}/?garment=${garmentId}`,
      metadata: {
        checkoutMode: 'pattern',
        userId:       userId ?? '',
        garmentId,
        pendingId:    pendingRow.id,
        a0_addon:     addA0 ? 'true' : 'false',
      },
    });

    return res.status(200).json({ url: session.url });
  }

  // ── Bundle checkout ────────────────────────────────────────────────────────
  if (mode === 'bundle') {
    const { bundleId, userId, garmentIds = [] } = req.body;

    const bundle = BUNDLES[bundleId];
    if (!bundle) {
      return res.status(400).json({ error: `Unknown bundle: ${bundleId}` });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: bundle.priceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${origin}/pricing`,
      metadata: {
        checkoutMode: 'bundle',
        userId:       userId ?? '',
        bundleId,
        garmentIds:   JSON.stringify(garmentIds),
        patternCount: String(bundle.patternCount),
      },
    });

    return res.status(200).json({ url: session.url });
  }

  // ── Subscription checkout ──────────────────────────────────────────────────
  if (mode === 'subscription') {
    const { planId, userId } = req.body;

    const plan = SUBSCRIPTION_PRICES[planId];
    if (!plan) {
      return res.status(400).json({ error: `Unknown plan: ${planId}` });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: plan.priceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${origin}/pricing`,
      metadata: {
        checkoutMode: 'subscription',
        userId:       userId ?? '',
        planId,
      },
      subscription_data: {
        metadata: {
          userId:   userId ?? '',
          planId,
          credits:  String(plan.credits),
        },
      },
    });

    return res.status(200).json({ url: session.url });
  }

  // ── A0 copy-shop upgrade (post-purchase) ──────────────────────────────────
  if (mode === 'a0_upgrade') {
    const { purchaseId, userId } = req.body;
    if (!purchaseId || !userId) {
      return res.status(400).json({ error: 'Missing purchaseId or userId' });
    }

    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
    );

    const { data: purchase, error: purchaseErr } = await supabase
      .from('purchases')
      .select('id, a0_addon')
      .eq('id', purchaseId)
      .eq('user_id', userId)
      .maybeSingle();

    if (purchaseErr || !purchase) {
      return res.status(400).json({ error: 'Purchase not found' });
    }
    if (purchase.a0_addon) {
      return res.status(400).json({ error: 'A0 + projector file already included in this purchase' });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: A0_UPSELL.priceId, quantity: 1 }],
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${origin}/account`,
      metadata: {
        checkoutMode: 'a0_upgrade',
        userId:       userId ?? '',
        purchaseId,
      },
    });

    return res.status(200).json({ url: session.url });
  }

  return res.status(400).json({ error: `Unknown checkout mode: ${mode}` });
}
