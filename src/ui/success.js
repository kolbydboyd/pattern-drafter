// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Success page — runs after Stripe checkout redirect
import { getSession } from '../lib/auth.js';
import { trackEvent, identifyUser } from '../analytics.js';
import { getRecommendations } from '../engine/recommendations.js';
import GARMENTS from '../garments/index.js';
import { PATTERN_PRICES } from '../lib/pricing.js';

const params     = new URLSearchParams(location.search);
const sessionId  = params.get('session_id');

async function init() {
  if (!sessionId) {
    showError('No session found. If you completed a purchase, check My Patterns in your account.');
    return;
  }

  let info;
  try {
    const r = await fetch(`/api/session-info?session_id=${encodeURIComponent(sessionId)}`);
    if (!r.ok) throw new Error('Session lookup failed');
    info = await r.json();
  } catch {
    showError('Could not load your order. If payment was successful, your pattern will appear in My Patterns shortly.');
    return;
  }

  if (info.status !== 'paid') {
    showError('Payment is still processing. Your pattern will appear in My Patterns once confirmed.');
    return;
  }

  const { session } = await getSession().catch(() => ({}));
  if (session?.user) identifyUser(session.user.id, { email: session.user.email });

  const checkoutMode = info.checkoutMode || 'pattern';

  if (checkoutMode === 'pattern') {
    initPatternSuccess(info);
  } else if (checkoutMode === 'bundle') {
    initBundleSuccess(info);
  } else if (checkoutMode === 'subscription') {
    initSubscriptionSuccess(info);
  }
}

// ── Single pattern success ───────────────────────────────────────────────────

function initPatternSuccess(info) {
  const elState  = document.getElementById('success-state');
  const elName   = document.getElementById('success-garment-name');
  const elAmount = document.getElementById('success-amount');
  const elDlBtn  = document.getElementById('success-download-btn');

  elName.textContent   = info.garmentName;
  elAmount.textContent = info.amountCents ? `— $${(info.amountCents / 100).toFixed(2)}` : '';
  elState.hidden = false;

  trackEvent('purchase_completed', {
    garment_id:     info.garmentId,
    amount:         info.amountCents ? info.amountCents / 100 : undefined,
    payment_method: 'stripe',
  });

  // Measurements used
  const MEAS_LABELS = { chest:'Chest', waist:'Waist', hip:'Hip', inseam:'Inseam', rise:'Rise', height:'Height', length:'Length' };
  const meas = info.measurements ?? {};
  const measEntries = Object.entries(MEAS_LABELS).filter(([k]) => meas[k]);
  if (measEntries.length) {
    document.getElementById('success-meas-chips').innerHTML = measEntries
      .map(([k, l]) => `<span class="success-meas-chip"><span class="success-meas-lbl">${l}</span><span class="success-meas-val">${meas[k]}"</span></span>`)
      .join('');
    document.getElementById('success-meas-wrap').hidden = false;
  }

  // Recommendations
  const recs = getRecommendations(info.garmentId, [info.garmentId], 3);
  if (recs.length) {
    const recsGrid = document.getElementById('success-recs-grid');
    recsGrid.innerHTML = recs.map(id => {
      const g = GARMENTS[id];
      const displayName = g?.name ?? id.replace(/-/g, ' ');
      return `<a href="/patterns/${id}" class="success-rec-card">
        <span class="success-rec-name">${displayName}</span>
        <span class="success-rec-cta">View pattern →</span>
      </a>`;
    }).join('');
    document.getElementById('success-recs-wrap').hidden = false;

    // Upsell: first recommendation at 25% off
    if (recs[0]) {
      const g0 = GARMENTS[recs[0]];
      const upsellName = g0?.name ?? recs[0].replace(/-/g, ' ');
      const upsellPrice = PATTERN_PRICES[recs[0]];
      const fullPrice = upsellPrice ? (upsellPrice.cents / 100).toFixed(0) : '';
      const discountPrice = upsellPrice ? (upsellPrice.cents * 0.75 / 100).toFixed(2) : '';
      const priceNote = fullPrice
        ? ` <span class="success-upsell-price"><s>$${fullPrice}</s> $${discountPrice}</span>`
        : '';
      document.getElementById('success-upsell-text').innerHTML =
        `Add ${upsellName} — same measurements, 25% off.${priceNote}`;
      const upsellWrap = document.getElementById('success-upsell');
      upsellWrap.hidden = false;
      document.getElementById('success-upsell-btn').addEventListener('click', () => {
        window.location.href = `/patterns/${recs[0]}?capsule=1&from=${info.garmentId}`;
      });
    }
  }

  elDlBtn.addEventListener('click', async () => {
    elDlBtn.disabled    = true;
    elDlBtn.textContent = 'Generating...';
    try {
      const { session } = await getSession();
      const r = await fetch('/api/generate-pattern', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          garmentId:    info.garmentId,
          measurements: info.measurements,
          opts:         info.opts,
          sessionId:    info.sessionId,
        }),
      });
      const json = await r.json();
      if (!r.ok) throw new Error(json.error || 'Generation failed');

      const a = document.createElement('a');
      a.href     = json.downloadUrl;
      a.download = `${info.garmentId}-pattern.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      elDlBtn.textContent = 'Downloaded';
    } catch (err) {
      elDlBtn.disabled    = false;
      elDlBtn.textContent = 'Download Pattern';
      alert(err.message || 'Download failed. Please try again.');
    }
  });
}

// ── Bundle success ───────────────────────────────────────────────────────────

function initBundleSuccess(info) {
  const el = document.getElementById('success-bundle');
  document.getElementById('success-bundle-name').textContent = info.bundleName;
  document.getElementById('success-bundle-amount').textContent =
    info.amountCents ? `$${(info.amountCents / 100).toFixed(2)}` : '';
  document.getElementById('success-bundle-credits').textContent = info.patternCount;
  el.hidden = false;

  trackEvent('bundle_purchased', {
    bundle_id:     info.bundleId,
    pattern_count: info.patternCount,
    amount:        info.amountCents ? info.amountCents / 100 : undefined,
  });
}

// ── Subscription success ─────────────────────────────────────────────────────

function initSubscriptionSuccess(info) {
  const el = document.getElementById('success-subscription');
  document.getElementById('success-plan-name').textContent = info.planName;
  document.getElementById('success-sub-credits').textContent = info.credits;
  el.hidden = false;

  trackEvent('subscription_started', {
    plan_id: info.planId,
    credits: info.credits,
    amount:  info.amountCents ? info.amountCents / 100 : undefined,
  });
}

// ── Error ────────────────────────────────────────────────────────────────────

function showError(msg) {
  const el = document.getElementById('success-error');
  el.textContent = msg;
  el.hidden      = false;
}

init();
