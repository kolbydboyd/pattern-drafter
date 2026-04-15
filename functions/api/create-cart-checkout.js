// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Cloudflare Pages Function — creates a Stripe Embedded Checkout session for a cart.
// Returns { clientSecret } (not a redirect URL).
import Stripe from 'stripe';
import { PATTERN_PRICES, BUNDLES, A0_UPSELL } from '../../src/lib/pricing.js';

// Server-side bundle pricing — mirrors computeCartPricing() in src/lib/cart.js
function _serverPricing(items) {
  const resolved = items.map(item => {
    const p = PATTERN_PRICES[item.garmentId];
    return { ...item, priceCents: p?.cents ?? 900, priceId: p?.priceId ?? null };
  });

  const sorted = [...resolved].sort((a, b) => a.priceCents - b.priceCents);
  const count  = sorted.length;

  let bundleId   = null;
  let bundleCents = 0;
  let extraItems  = [];

  if (count >= 5) {
    bundleId    = 'wardrobe5';
    bundleCents = BUNDLES.wardrobe5.cents;
    extraItems  = sorted.slice(5);
  } else if (count >= 3) {
    bundleId    = 'capsule3';
    bundleCents = BUNDLES.capsule3.cents;
    extraItems  = sorted.slice(3);
  } else {
    extraItems = sorted;
  }

  const extrasCents = extraItems.reduce((s, i) => s + i.priceCents, 0);
  const a0Count     = items.filter(i => i.addA0).length;
  const a0Cents     = a0Count * A0_UPSELL.cents;

  const lineItems = [];
  if (bundleId) {
    lineItems.push({ price: BUNDLES[bundleId].priceId, quantity: 1 });
    for (const item of extraItems) {
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
    bundleId,
    totalCents: bundleCents + extrasCents + a0Cents,
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
    const origin  = request.headers.get('origin') || 'https://peoplespatterns.com';

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

    const session = await stripe.checkout.sessions.create(sessionParams);

    return Response.json({ clientSecret: session.client_secret });

  } catch (err) {
    console.error('Cart checkout error:', err);
    return Response.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
