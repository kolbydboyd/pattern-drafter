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

  // Sort cheapest first (bundle covers the cheapest items to maximise savings)
  const sorted = [...resolved].sort((a, b) => a.priceCents - b.priceCents);

  const count = sorted.length;
  let bundleId   = null;
  let bundleCents = 0;
  let extraItems  = [];

  if (count >= 5) {
    bundleId    = 'wardrobe5';
    bundleCents = BUNDLES.wardrobe5.cents; // $49
    extraItems  = sorted.slice(5);
  } else if (count >= 3) {
    bundleId    = 'capsule3';
    bundleCents = BUNDLES.capsule3.cents; // $29
    extraItems  = sorted.slice(3);
  } else {
    extraItems = sorted;
  }

  const extrasCents = extraItems.reduce((s, i) => s + i.priceCents, 0);

  // A0 add-ons
  const a0Count = items.filter(i => i.addA0).length;
  const a0Cents = a0Count * A0_UPSELL.cents;

  // Savings vs paying individually
  const individualTotal = resolved.reduce((s, i) => s + i.priceCents, 0);
  const subtotal        = bundleCents + extrasCents;
  const savings         = Math.max(0, individualTotal - subtotal);
  const totalCents      = subtotal + a0Cents;

  // Stripe line_items array (used by create-cart-checkout.js)
  const lineItems = [];
  if (bundleId) {
    lineItems.push({ price: BUNDLES[bundleId].priceId, quantity: 1 });
  }
  for (const item of extraItems) {
    if (item.priceId) lineItems.push({ price: item.priceId, quantity: 1 });
  }
  if (!bundleId) {
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
