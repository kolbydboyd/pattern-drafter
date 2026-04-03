// Copyright (c) 2026 People's Patterns LLC. All rights reserved.

// ── Single pattern checkout ──────────────────────────────────────────────────
export async function buyPattern(garmentId, measurements, opts, userId, profileId, addA0 = false) {
  const res = await fetch('/api/create-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode: 'pattern', garmentId, userId, measurements, opts, profileId: profileId ?? null, addA0 }),
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
  const res = await fetch('/api/create-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode: 'bundle', bundleId, userId, garmentIds }),
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
  const res = await fetch('/api/create-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode: 'subscription', planId, userId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Subscription checkout failed');
  }
  const { url } = await res.json();
  window.location.href = url;
}
