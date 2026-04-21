// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Cloudflare Pages Function — creates a Stripe Embedded Checkout session for a cart.
// Returns { clientSecret } (not a redirect URL).
import Stripe from 'stripe';
import { PATTERN_PRICES, BUNDLES, A0_UPSELL } from '../../src/lib/pricing.js';
import { withRetry, stripeRetryable } from './_utils/retry.js';

// Server-side bundle pricing — mirrors computeCartPricing() in src/lib/cart.js.
// Only applies a bundle when it is cheaper than paying individually.
// Applies bundle to the most expensive items to maximise savings.
// Compares 3- and 5-bundle options and picks whichever total is lowest.
function _serverPricing(items) {
  const resolved = items.map(item => {
    const p = PATTERN_PRICES[item.garmentId];
    return { ...item, priceCents: p?.cents ?? 900, priceId: p?.priceId ?? null };
  });

  // Sort most expensive first
  const sorted = [...resolved].sort((a, b) => b.priceCents - a.priceCents);
  const count  = sorted.length;

  const individualTotal = sorted.reduce((s, i) => s + i.priceCents, 0);

  let bestBundleId    = null;
  let bestBundleCents = 0;
  let bestTotal       = individualTotal;

  if (count >= 3) {
    const top3Cost  = sorted[0].priceCents + sorted[1].priceCents + sorted[2].priceCents;
    const cap3Cents = BUNDLES.capsule3.cents;
    if (cap3Cents < top3Cost) {
      const extras = sorted.slice(3).reduce((s, i) => s + i.priceCents, 0);
      const total3 = cap3Cents + extras;
      if (total3 < bestTotal) {
        bestBundleId    = 'capsule3';
        bestBundleCents = cap3Cents;
        bestTotal       = total3;
      }
    }
  }

  if (count >= 5) {
    const top5Cost   = sorted.slice(0, 5).reduce((s, i) => s + i.priceCents, 0);
    const ward5Cents = BUNDLES.wardrobe5.cents;
    if (ward5Cents < top5Cost) {
      const extras = sorted.slice(5).reduce((s, i) => s + i.priceCents, 0);
      const total5 = ward5Cents + extras;
      if (total5 < bestTotal) {
        bestBundleId    = 'wardrobe5';
        bestBundleCents = ward5Cents;
        bestTotal       = total5;
      }
    }
  }

  const a0Count     = items.filter(i => i.addA0).length;
  const a0Cents     = a0Count * A0_UPSELL.cents;
  const coveredCount = bestBundleId === 'wardrobe5' ? 5 : bestBundleId === 'capsule3' ? 3 : 0;

  const lineItems = [];
  if (bestBundleId) {
    lineItems.push({ price: BUNDLES[bestBundleId].priceId, quantity: 1 });
    for (const item of sorted.slice(coveredCount)) {
      if (item.priceId) lineItems.push({ price: item.priceId, quantity: 1 });
    }
  } else {
    for (const item of sorted) {
      if (item.priceId) lineItems.push({ price: item.priceId, quantity: 1 });
    }
  }
  if (a0Count > 0) {
    lineItems.push({ price: A0_UPSELL.priceId, quantity: a0Count });
  }

  return {
    lineItems,
    bundleId:      bestBundleId,
    totalCents:    bestTotal + a0Cents,
    resolvedItems: resolved,
  };
}

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

  const { userId = null, items = [], couponId = null, affiliateCode = '' } = body;

  if (!Array.isArray(items) || items.length === 0) {
    return Response.json({ error: 'Cart is empty' }, { status: 400 });
  }

  // Validate all garmentIds
  for (const item of items) {
    if (!item.garmentId || !PATTERN_PRICES[item.garmentId]) {
      return Response.json({ error: `Unknown garment: ${item.garmentId}` }, { status: 400 });
    }
  }

  try {
    const stripe  = new Stripe(env.STRIPE_SECRET_KEY);
    const ALLOWED_ORIGINS = new Set(['https://peoplespatterns.com', 'https://www.peoplespatterns.com']);
    const rawOrigin = request.headers.get('origin') || '';
    const origin  = ALLOWED_ORIGINS.has(rawOrigin) ? rawOrigin : 'https://peoplespatterns.com';

    const { lineItems, bundleId, resolvedItems } = _serverPricing(items);

    // Enrich items with server-validated prices before storing
    const enrichedItems = resolvedItems.map(item => ({
      garmentId:    item.garmentId,
      measurements: item.measurements ?? {},
      opts:         item.opts         ?? {},
      profileId:    item.profileId    ?? null,
      addA0:        item.addA0        ?? false,
      priceCents:   item.priceCents,
    }));

    // Store cart items in pending_checkouts (measurements stay off Stripe)
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

    const { data: pendingRow, error: pendingErr } = await supabase
      .from('pending_checkouts')
      .insert({
        user_id:  userId || null,
        items:    enrichedItems,
      })
      .select('id')
      .single();

    if (pendingErr) {
      console.error('Failed to create pending checkout:', pendingErr.message);
      return Response.json({ error: 'Could not prepare checkout' }, { status: 500 });
    }

    const sessionParams = {
      ui_mode:    'embedded',
      mode:       'payment',
      line_items: lineItems,
      return_url: `${origin}/checkout?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        checkoutMode: 'cart',
        userId:       userId ?? '',
        pendingId:    pendingRow.id,
        itemCount:    String(items.length),
        bundleId:     bundleId ?? '',
        affiliateCode,
      },
    };

    if (couponId) {
      sessionParams.discounts = [{ coupon: couponId }];
    } else {
      sessionParams.allow_promotion_codes = true;
    }

    const session = await withRetry(
      () => stripe.checkout.sessions.create(sessionParams),
      { shouldRetry: stripeRetryable },
    );

    return Response.json({ clientSecret: session.client_secret });

  } catch (err) {
    console.error('Cart checkout error:', err);
    return Response.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
