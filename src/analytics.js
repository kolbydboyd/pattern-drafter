// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// PostHog analytics — initialized once on import, helpers exported for use across the app.

import posthog from 'posthog-js';
import { inject } from '@vercel/analytics';

inject();

posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
  api_host:         import.meta.env.VITE_POSTHOG_HOST,
  autocapture:      true,
  capture_pageview: true,
  capture_pageleave: true,
  defaults:         '2026-01-30',
});

export function trackEvent(name, properties) {
  posthog.capture(name, properties);
}

export function identifyUser(userId, traits) {
  posthog.identify(userId, traits);
}

export function resetUser() {
  posthog.reset();
}

// ── Site-wide tracking ────────────────────────────────────────────────────────
// Call once after DOMContentLoaded. Tracks buttons, forms, scroll depth, outbound links.

export function initSiteTracking() {
  // Button clicks + outbound links (single delegated listener)
  document.addEventListener('click', e => {
    const btn = e.target.closest('button, [role="button"]');
    if (btn) {
      trackEvent('button_clicked', {
        text: btn.textContent?.trim().slice(0, 100) || undefined,
        id:   btn.id || undefined,
      });
    }
    const a = e.target.closest('a[href]');
    if (a && a.href && !a.href.startsWith(location.origin) && !a.href.startsWith('mailto:')) {
      trackEvent('outbound_link_clicked', {
        url:  a.href,
        text: a.textContent?.trim().slice(0, 80) || undefined,
      });
    }
  });

  // Form submissions
  document.addEventListener('submit', e => {
    const f = e.target;
    trackEvent('form_submitted', {
      form_id: f.id || f.getAttribute('name') || f.className?.split(' ')[0] || 'unknown',
    });
  });

  // Scroll depth — 25 / 50 / 75 / 100%
  const DEPTHS  = [25, 50, 75, 100];
  const reached = new Set();
  window.addEventListener('scroll', () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollable <= 0) return;
    const pct = Math.round((window.scrollY / scrollable) * 100);
    for (const d of DEPTHS) {
      if (pct >= d && !reached.has(d)) {
        reached.add(d);
        trackEvent('scroll_depth', { depth: d });
      }
    }
  }, { passive: true });
}

// ── Hero A/B test ─────────────────────────────────────────────────────────────
// Feature flag: 'hero-cta-variant'
// Control  (default): current copy — tagline + "Get Started" CTA
// Variant  ('test'):  alternate copy — see constants below
//
// To activate: create feature flag 'hero-cta-variant' in PostHog
//   → Rollout: 50% → 50% (control vs test)
//   → No payload needed; variant name 'test' is the trigger

const AB_TAGLINE = 'patterns drafted to your exact measurements';
const AB_CTA     = 'Generate Your Pattern Free';

export function initHeroABTest() {
  posthog.onFeatureFlags(() => {
    const variant = posthog.getFeatureFlag('hero-cta-variant') ?? 'control';

    if (variant === 'test') {
      const taglineEl = document.querySelector('.land-tagline');
      const ctaEl     = document.getElementById('get-started-btn');
      if (taglineEl) taglineEl.textContent = AB_TAGLINE;
      if (ctaEl)     ctaEl.textContent     = AB_CTA;
    }

    // Track primary CTA click as conversion goal regardless of variant
    const ctaEl = document.getElementById('get-started-btn');
    ctaEl?.addEventListener('click', () => {
      trackEvent('hero_cta_clicked', { variant });
    }, { once: true });
  });
}
