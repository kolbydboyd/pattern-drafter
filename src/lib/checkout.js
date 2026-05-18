// Copyright (c) 2026 People's Patterns LLC. All rights reserved.

import { getAffiliateCode } from './affiliate.js';
import { trackEvent } from '../analytics.js';

// ── Single pattern checkout ──────────────────────────────────────────────────
export async function buyPattern(garmentId, measurements, opts, userId, profileId, addA0 = false) {
  trackEvent('checkout_started', { mode: 'pattern', garment_id: garmentId });
  const res = await fetch('/api/create-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode: 'pattern', garmentId, userId, measurements, opts, profileId: profileId ?? null, addA0, affiliateCode: getAffiliateCode() }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Checkout failed');
  }
  const { url } = await res.json();
  window.location.href = url;
}

// ── Bundle checkout ──────────────────────────────────────────────────────────
export async function buyBundle(bundleId, userId, garmentIds = []) {
  trackEvent('checkout_started', { mode: 'bundle', bundle_id: bundleId });
  const res = await fetch('/api/create-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode: 'bundle', bundleId, userId, garmentIds, affiliateCode: getAffiliateCode() }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Bundle checkout failed');
  }
  const { url } = await res.json();
  window.location.href = url;
}

// ── Credit pack checkout ────────────────────────────────────────────────────
export async function buyCreditPack(packId, userId) {
  trackEvent('checkout_started', { mode: 'credit_pack', pack_id: packId });
  const res = await fetch('/api/create-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode: 'credit_pack', packId, userId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Credit pack checkout failed');
  }
  const { url } = await res.json();
  window.location.href = url;
}

// ── Subscription checkout ────────────────────────────────────────────────────
export async function buySubscription(planId, userId) {
  trackEvent('checkout_started', { mode: 'subscription', plan_id: planId });
  const res = await fetch('/api/create-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode: 'subscription', planId, userId, affiliateCode: getAffiliateCode() }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Subscription checkout failed');
  }
  const { url } = await res.json();
  window.location.href = url;
}
