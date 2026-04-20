// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Cloudflare Pages Function — creates a Stripe Checkout session
// Supports three modes: single pattern, bundle, and subscription.
import Stripe from 'stripe';
import { PATTERN_PRICES, A0_UPSELL, BUNDLES, SUBSCRIPTION_PRICES, CREDIT_PACKS } from '../../src/lib/pricing.js';

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const stripe = new Stripe(env.STRIPE_SECRET_KEY);
    const ALLOWED_ORIGINS = new Set(['https://peoplespatterns.com', 'https://www.peoplespatterns.com']);
    const rawOrigin = request.headers.get('origin') || '';
    const origin = ALLOWED_ORIGINS.has(rawOrigin) ? rawOrigin : 'https://peoplespatterns.com';
    const { mode = 'pattern', affiliateCode = '' } = body;

    // ── Single pattern checkout ────────────────────────────────────────────────
    if (mode === 'pattern') {
      const { garmentId, userId, measurements, opts, profileId, addA0 = false } = body;

      const price = PATTERN_PRICES[garmentId];
      if (!price) {
        return Response.json({ error: `Unknown garment: ${garmentId}` }, { status: 400 });
      }

      // Store measurements + opts in Supabase so they never reach Stripe.
      // Body measurements are sensitive personal data — Stripe only gets
      // a reference ID, garment choice, and style options.
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        env.SUPABASE_URL,
        env.SUPABASE_SERVICE_ROLE_KEY,
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
        return Response.json({ error: 'Could not prepare checkout' }, { status: 500 });
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
          affiliateCode,
        },
      });

      return Response.json({ url: session.url });
    }

    // ── Bundle checkout ────────────────────────────────────────────────────────
    if (mode === 'bundle') {
      const { bundleId, userId, garmentIds = [] } = body;

      const bundle = BUNDLES[bundleId];
      if (!bundle) {
        return Response.json({ error: `Unknown bundle: ${bundleId}` }, { status: 400 });
      }

      // Curated bundles have fixed garment selections - validate to prevent tampering
      if (bundle.curated) {
        const expected = JSON.stringify([...bundle.garmentIds].sort());
        const received = JSON.stringify([...garmentIds].sort());
        if (expected !== received) {
          return Response.json({ error: 'Invalid garment selection for this bundle' }, { status: 400 });
        }
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
          affiliateCode,
        },
      });

      return Response.json({ url: session.url });
    }

    // ── Subscription checkout ──────────────────────────────────────────────────
    if (mode === 'subscription') {
      const { planId, userId } = body;

      const plan = SUBSCRIPTION_PRICES[planId];
      if (!plan) {
        return Response.json({ error: `Unknown plan: ${planId}` }, { status: 400 });
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
          affiliateCode,
        },
        subscription_data: {
          metadata: {
            userId:   userId ?? '',
            planId,
            credits:  String(plan.credits),
          },
        },
      });

      return Response.json({ url: session.url });
    }

    // ── A0 copy-shop upgrade (post-purchase) ──────────────────────────────────
    if (mode === 'a0_upgrade') {
      const { purchaseId, userId } = body;
      if (!purchaseId || !userId) {
        return Response.json({ error: 'Missing purchaseId or userId' }, { status: 400 });
      }

      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        env.SUPABASE_URL,
        env.SUPABASE_SERVICE_ROLE_KEY,
      );

      const { data: purchase, error: purchaseErr } = await supabase
        .from('purchases')
        .select('id, a0_addon')
        .eq('id', purchaseId)
        .eq('user_id', userId)
        .maybeSingle();

      if (purchaseErr || !purchase) {
        return Response.json({ error: 'Purchase not found' }, { status: 400 });
      }
      if (purchase.a0_addon) {
        return Response.json({ error: 'A0 + projector file already included in this purchase' }, { status: 400 });
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

      return Response.json({ url: session.url });
    }

    // ── Credit pack checkout ────────────────────────────────────────────────
    if (mode === 'credit_pack') {
      const { packId, userId } = body;

      const pack = CREDIT_PACKS[packId];
      if (!pack) {
        return Response.json({ error: `Unknown credit pack: ${packId}` }, { status: 400 });
      }

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [{ price: pack.priceId, quantity: 1 }],
        allow_promotion_codes: true,
        success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url:  `${origin}/pricing`,
        metadata: {
          checkoutMode: 'credit_pack',
          userId:       userId ?? '',
          packId,
          creditCount:  String(pack.creditCount),
        },
      });

      return Response.json({ url: session.url });
    }

    return Response.json({ error: `Unknown checkout mode: ${mode}` }, { status: 400 });

  } catch (err) {
    console.error('Checkout handler error:', err);
    return Response.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
