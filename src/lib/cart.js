// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Cart state — persisted to localStorage under 'pp-cart'.

import { PATTERN_PRICES, BUNDLES, A0_UPSELL } from './pricing.js';

const CART_KEY = 'pp-cart';

// ── Persistence ───────────────────────────────────────────────────────────────

export function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  } catch {
    return [];
  }
}

function _saveCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent('cart-updated'));
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function addToCart(item) {
  const items = getCart();
  // Deduplicate: same garmentId replaces the previous entry (measurements may differ)
  const idx = items.findIndex(i => i.garmentId === item.garmentId);
  if (idx !== -1) {
    items[idx] = item;
  } else {
    items.push(item);
  }
  _saveCart(items);
}

export function removeFromCart(id) {
  _saveCart(getCart().filter(i => i.id !== id));
}

export function clearCart() {
  localStorage.removeItem(CART_KEY);
  window.dispatchEvent(new CustomEvent('cart-updated'));
}

export function getCartCount() {
  return getCart().length;
}

// ── Pricing calculation ───────────────────────────────────────────────────────
// Returns the full pricing breakdown for an array of cart items.
// Pure function — no side effects, safe to call on both client and server.

export function computeCartPricing(items) {
  if (!items || items.length === 0) {
    return { lineItems: [], bundleId: null, bundleCents: 0, extrasCents: 0, totalCents: 0, savings: 0, a0Cents: 0 };
  }

  // Resolve price per item
  const resolved = items.map(item => {
    const p = PATTERN_PRICES[item.garmentId];
    return { ...item, priceCents: p?.cents ?? 900, priceId: p?.priceId ?? null };
  });

  // Sort most expensive first — bundles cover the priciest items to maximise savings
  const sorted = [...resolved].sort((a, b) => b.priceCents - a.priceCents);

  const count           = sorted.length;
  const individualTotal = sorted.reduce((s, i) => s + i.priceCents, 0);

  // Try each applicable bundle; only accept it when it actually saves money.
  // Compare both 3- and 5-bundle options and pick the cheapest total.
  let bestBundleId    = null;
  let bestBundleCents = 0;
  let bestExtrasCents = individualTotal;
  let bestTotal       = individualTotal;

  if (count >= 3) {
    const top3Cost    = sorted[0].priceCents + sorted[1].priceCents + sorted[2].priceCents;
    const cap3Cents   = BUNDLES.capsule3.cents; // $29
    if (cap3Cents < top3Cost) {
      const extras = sorted.slice(3).reduce((s, i) => s + i.priceCents, 0);
      const total3 = cap3Cents + extras;
      if (total3 < bestTotal) {
        bestBundleId    = 'capsule3';
        bestBundleCents = cap3Cents;
        bestExtrasCents = extras;
        bestTotal       = total3;
      }
    }
  }

  if (count >= 5) {
    const top5Cost  = sorted.slice(0, 5).reduce((s, i) => s + i.priceCents, 0);
    const ward5Cents = BUNDLES.wardrobe5.cents; // $49
    if (ward5Cents < top5Cost) {
      const extras = sorted.slice(5).reduce((s, i) => s + i.priceCents, 0);
      const total5 = ward5Cents + extras;
      if (total5 < bestTotal) {
        bestBundleId    = 'wardrobe5';
        bestBundleCents = ward5Cents;
        bestExtrasCents = extras;
        bestTotal       = total5;
      }
    }
  }

  const bundleId    = bestBundleId;
  const bundleCents = bestBundleCents;
  const extrasCents = bestExtrasCents;

  // A0 add-ons
  const a0Count = items.filter(i => i.addA0).length;
  const a0Cents = a0Count * A0_UPSELL.cents;

  const savings    = individualTotal - bestTotal;
  const totalCents = bestTotal + a0Cents;

  // Stripe line_items array (used by create-cart-checkout.js)
  const coveredCount = bundleId === 'wardrobe5' ? 5 : bundleId === 'capsule3' ? 3 : 0;
  const lineItems = [];
  if (bundleId) {
    lineItems.push({ price: BUNDLES[bundleId].priceId, quantity: 1 });
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
    bundleId,
    bundleCents,
    extrasCents,
    totalCents,
    savings,
    a0Cents,
    resolvedItems: resolved,
  };
}
