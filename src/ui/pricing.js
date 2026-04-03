// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Pricing page — wires bundle and subscription buttons to checkout flows.
import { getSession } from '../lib/auth.js';
import { openAuthModal } from './auth-modal.js';
import { trackEvent } from '../analytics.js';

async function getUser() {
  try {
    const { session } = await getSession();
    return session?.user ?? null;
  } catch { return null; }
}

// ── Bundle checkout ──────────────────────────────────────────────────────────

async function startBundleCheckout(bundleId) {
  trackEvent('bundle_cta_clicked', { bundle_id: bundleId });
  const user = await getUser();
  if (!user) {
    openAuthModal('download', () => startBundleCheckout(bundleId));
    return;
  }
  const { buyBundle } = await import('../lib/checkout.js');
  buyBundle(bundleId, user.id).catch(err => alert('Checkout failed: ' + err.message));
}

// ── Curated bundle checkout ─────────────────────────────────────────────────

async function startCuratedBundleCheckout(bundleId) {
  trackEvent('curated_bundle_cta_clicked', { bundle_id: bundleId });
  const user = await getUser();
  if (!user) {
    openAuthModal('download', () => startCuratedBundleCheckout(bundleId));
    return;
  }
  const { buyBundle } = await import('../lib/checkout.js');
  const { BUNDLES } = await import('../lib/pricing.js');
  const bundle = BUNDLES[bundleId];
  buyBundle(bundleId, user.id, bundle.garmentIds).catch(err =>
    alert('Checkout failed: ' + err.message)
  );
}

// ── Subscription checkout ────────────────────────────────────────────────────

async function startSubscriptionCheckout(planId) {
  trackEvent('subscription_cta_clicked', { plan_id: planId });
  const user = await getUser();
  if (!user) {
    openAuthModal('download', () => startSubscriptionCheckout(planId));
    return;
  }
  const { buySubscription } = await import('../lib/checkout.js');
  buySubscription(planId, user.id).catch(err => alert('Checkout failed: ' + err.message));
}

// ── Wire buttons ─────────────────────────────────────────────────────────────

document.querySelectorAll('[data-bundle]').forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault();
    startBundleCheckout(btn.dataset.bundle);
  });
});

document.querySelectorAll('[data-curated-bundle]').forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault();
    startCuratedBundleCheckout(btn.dataset.curatedBundle);
  });
});

document.querySelectorAll('[data-plan]').forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault();
    startSubscriptionCheckout(btn.dataset.plan);
  });
});
