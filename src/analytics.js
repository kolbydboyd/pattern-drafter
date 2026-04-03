// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// PostHog analytics — initialized once on import, helpers exported for use across the app.

import posthog from 'posthog-js';
import { inject } from '@vercel/analytics';

inject();

posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
  api_host:          import.meta.env.VITE_POSTHOG_HOST,
  autocapture:       true,
  capture_pageview:  true,
  capture_pageleave: true,
  session_recording: { maskAllInputs: true, maskTextSelector: '[data-ph-mask]' },
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
  // Outbound link clicks (autocapture handles internal clicks)
  document.addEventListener('click', e => {
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

// ── Social proof A/B test ────────────────────────────────────────────────────
// Feature flag: 'social-proof-variant'
// Control  (default): no social proof section shown
// Variant  ('test'):  shows "Real Sewists, Real Fits" proof section
//
// To activate: create feature flag 'social-proof-variant' in PostHog
//   → Rollout: 50% control / 50% test
//   → No payload needed; variant name 'test' is the trigger

export function initSocialProofABTest() {
  posthog.onFeatureFlags(() => {
    const variant = posthog.getFeatureFlag('social-proof-variant') ?? 'control';

    if (variant === 'test') {
      const proofSection = document.getElementById('land-proof');
      const heroEl = document.querySelector('.land-hero');
      if (proofSection) {
        proofSection.style.display = '';
        if (heroEl) heroEl.classList.add('land-hero--proof');

        const observer = new IntersectionObserver((entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              trackEvent('social_proof_impression', { variant });
              observer.disconnect();
              break;
            }
          }
        }, { threshold: 0.5 });
        observer.observe(proofSection);
      }
    }

    const proofGrid = document.querySelector('.land-proof-grid');
    if (proofGrid) {
      proofGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.land-proof-card');
        if (card) {
          trackEvent('social_proof_card_clicked', {
            variant,
            card_id: card.dataset.proof,
          });
        }
      });
    }
  });
}
