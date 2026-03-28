// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Success page — runs after Stripe checkout redirect
import { getSession } from '../lib/auth.js';
import { trackEvent, identifyUser } from '../analytics.js';
import { getRecommendations } from '../engine/recommendations.js';
import GARMENTS from '../garments/index.js';

const params     = new URLSearchParams(location.search);
const sessionId  = params.get('session_id');

const elState    = document.getElementById('success-state');
const elError    = document.getElementById('success-error');
const elName     = document.getElementById('success-garment-name');
const elAmount   = document.getElementById('success-amount');
const elDlBtn    = document.getElementById('success-download-btn');
const elPatsLink = document.getElementById('success-patterns-link');

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

  elName.textContent   = info.garmentName;
  elAmount.textContent = info.amountCents ? `— $${(info.amountCents / 100).toFixed(2)}` : '';
  elState.hidden = false;

  trackEvent('purchase_completed', {
    garment_id:     info.garmentId,
    amount:         info.amountCents ? info.amountCents / 100 : undefined,
    payment_method: 'stripe',
  });
  const { session } = await getSession().catch(() => ({}));
  if (session?.user) identifyUser(session.user.id, { email: session.user.email });

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
      document.getElementById('success-upsell-text').textContent =
        `Add ${upsellName} — same measurements, instant generation.`;
      const upsellWrap = document.getElementById('success-upsell');
      upsellWrap.hidden = false;
      document.getElementById('success-upsell-btn').addEventListener('click', () => {
        window.location.href = `/patterns/${recs[0]}`;
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

function showError(msg) {
  elError.textContent = msg;
  elError.hidden      = false;
}

init();
