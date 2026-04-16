// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// PostHog analytics — lazily initialized after page load, helpers exported for use across the app.

let _ph    = null;
let _queue = [];

const _POSTHOG_KEY  = import.meta.env.VITE_POSTHOG_KEY;
const _POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST;

async function _initPosthog() {
  if (_ph) return _ph;
  const { default: posthog } = await import('posthog-js');
  posthog.init(_POSTHOG_KEY, {
    api_host:          _POSTHOG_HOST,
    autocapture:       true,
    capture_pageview:  true,
    capture_pageleave: true,
    session_recording: { maskAllInputs: true, maskTextSelector: '[data-ph-mask]' },
  });
  _ph = posthog;
  for (const { name, properties } of _queue) posthog.capture(name, properties);
  _queue = [];
  return posthog;
}

// Defer PostHog until after page load so vendor-posthog chunk stays off the critical path.
if (document.readyState === 'complete') {
  requestIdleCallback(_initPosthog);
} else {
  window.addEventListener('load', () => requestIdleCallback(_initPosthog), { once: true });
}

export function trackEvent(name, properties) {
  if (_ph) {
    _ph.capture(name, properties);
  } else {
    _queue.push({ name, properties });
  }
}

export function identifyUser(userId, traits) {
  if (_ph) {
    _ph.identify(userId, traits);
  } else {
    _queue.push({ name: '__identify__', properties: { userId, traits } });
    // Flush immediately so identify fires as soon as PostHog loads.
    _initPosthog().then(ph => {
      const idx = _queue.findIndex(e => e.name === '__identify__' && e.properties.userId === userId);
      if (idx !== -1) {
        _queue.splice(idx, 1);
        ph.identify(userId, traits);
      }
    });
  }
}

export function resetUser() {
  if (_ph) {
    _ph.reset();
  } else {
    _initPosthog().then(ph => ph.reset());
  }
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

// ── Core Web Vitals ───────────────────────────────────────────────────────────
// Uses native PerformanceObserver and Navigation Timing — no extra libraries.

export function initWebVitals() {
  const page = location.pathname;

  // TTFB
  const nav = performance.getEntriesByType('navigation')[0];
  if (nav) {
    trackEvent('web_vital', { name: 'TTFB', value: Math.round(nav.responseStart - nav.requestStart), page });
  }

  // FCP + LCP
  if ('PerformanceObserver' in window) {
    try {
      new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          trackEvent('web_vital', { name: 'FCP', value: Math.round(entry.startTime), page });
        }
      }).observe({ type: 'paint', buffered: true });
    } catch (_) {}

    try {
      let _lcp = 0;
      const lcpObs = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) _lcp = Math.round(entry.startTime);
      });
      lcpObs.observe({ type: 'largest-contentful-paint', buffered: true });
      // Report LCP on page hide (final value)
      addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden' && _lcp > 0) {
          trackEvent('web_vital', { name: 'LCP', value: _lcp, page });
          lcpObs.disconnect();
        }
      }, { once: true });
    } catch (_) {}

    // CLS
    try {
      let _cls = 0;
      const clsObs = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) _cls += entry.value;
        }
      });
      clsObs.observe({ type: 'layout-shift', buffered: true });
      addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          trackEvent('web_vital', { name: 'CLS', value: Math.round(_cls * 1000) / 1000, page });
          clsObs.disconnect();
        }
      }, { once: true });
    } catch (_) {}

    // INP (interaction to next paint)
    try {
      let _inp = 0;
      new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          if (entry.duration > _inp) _inp = entry.duration;
        }
      }).observe({ type: 'event', durationThreshold: 16, buffered: true });
      addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden' && _inp > 0) {
          trackEvent('web_vital', { name: 'INP', value: Math.round(_inp), page });
        }
      }, { once: true });
    } catch (_) {}
  }
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

export async function initHeroABTest() {
  const posthog = await _initPosthog();
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

export async function initSocialProofABTest() {
  const posthog = await _initPosthog();
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
