// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Standalone fit feedback page with interactive body map.
// URL: /feedback?garment=cargo-shorts&purchase=UUID&result=perfect

import './page.js';
import { createBodyMap } from './body-map.js';
import { getSession, getCurrentUser, onUserChange } from './auth-modal.js';

const root = document.getElementById('feedback-root');
const params = new URLSearchParams(window.location.search);
const garmentId = params.get('garment') || '';
const purchaseId = params.get('purchase') || '';
const quickResult = params.get('result') || ''; // perfect, adjusted, wip

// Map quick-select email options to overall fit values
const QUICK_MAP = {
  perfect:  'perfect',
  adjusted: 'needs_adjustment',
  wip:      '',
};

let bodyMapWidget = null;

function renderPage(user) {
  const garmentName = garmentId.replace(/-/g, ' ');
  const prefilledOverall = QUICK_MAP[quickResult] ?? '';

  root.innerHTML = `
    <h2 class="pg-title">Fit Feedback${garmentName ? `: ${garmentName}` : ''}</h2>
    <p class="pg-subtitle">Tell us how the pattern fit. Takes about 2 minutes. Your response directly improves the geometry for the next person who sews this pattern.</p>

    ${!user ? `
      <div class="feedback-auth-msg" style="background:var(--ibg);border:1px solid var(--bdr);border-radius:6px;padding:16px;margin-bottom:20px">
        <p style="font-size:.83rem;color:var(--text);margin:0 0 8px">Sign in to submit feedback for your purchase.</p>
        <button class="btn" id="fb-auth-btn" style="max-width:200px">Sign In</button>
      </div>` : ''}

    <form id="feedback-form" class="feedback-form" style="max-width:640px">
      <div class="f" style="margin-bottom:14px">
        <label>OVERALL FIT *</label>
        <select id="fb-overall" required>
          <option value="">Select overall fit...</option>
          <option value="perfect"${prefilledOverall === 'perfect' ? ' selected' : ''}>Perfect, no changes needed</option>
          <option value="good"${prefilledOverall === 'good' ? ' selected' : ''}>Good, minor tweaks only</option>
          <option value="needs_adjustment"${prefilledOverall === 'needs_adjustment' ? ' selected' : ''}>Needs adjustment, a few areas off</option>
          <option value="poor">Poor, significant fitting issues</option>
        </select>
      </div>

      <div class="f" style="margin-bottom:14px">
        <label>FIT BY AREA</label>
        <p style="font-size:.72rem;color:var(--mid);margin:0 0 8px">Tap zones on the body map to rate fit in each area.</p>
        <div id="fb-body-map"></div>
      </div>

      <div class="f" style="margin-bottom:14px">
        <label>SEW STAGE</label>
        <select id="fb-stage">
          <option value="final">Final garment</option>
          <option value="muslin">Muslin / toile</option>
        </select>
      </div>

      <div class="f" style="margin-bottom:14px">
        <label>NOTES <span style="opacity:.6">(optional)</span></label>
        <textarea id="fb-notes" rows="4" maxlength="1000"
          placeholder="Fabric used, alterations made, what you'd change next time..."
          style="resize:vertical;min-height:60px"></textarea>
      </div>

      <button type="submit" class="btn" id="fb-submit" ${!user ? 'disabled' : ''}>Submit Feedback</button>
    </form>

    <div id="fb-success" style="display:none;text-align:center;padding:40px 0">
      <p style="font-size:1.1rem;font-weight:600;color:var(--text);margin:0 0 8px">Thank you!</p>
      <p style="font-size:.83rem;color:var(--mid);margin:0 0 20px">Your fit feedback has been saved. It helps us improve the pattern math for everyone.</p>
      <a href="/patterns" class="btn" style="max-width:200px;display:inline-block;text-decoration:none;text-align:center">Browse Patterns</a>
    </div>`;

  // Mount body map
  const bmContainer = document.getElementById('fb-body-map');
  if (bmContainer) {
    bodyMapWidget = createBodyMap();
    bmContainer.appendChild(bodyMapWidget.el);
  }

  // Auth button
  const authBtn = document.getElementById('fb-auth-btn');
  if (authBtn) {
    authBtn.addEventListener('click', async () => {
      const { initAuthModal } = await import('./auth-modal.js');
      initAuthModal();
      document.dispatchEvent(new CustomEvent('open-auth'));
    });
  }

  // Form submit
  const form = document.getElementById('feedback-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await handleSubmit();
    });
  }
}

async function handleSubmit() {
  const overallFit = document.getElementById('fb-overall').value;
  if (!overallFit) {
    document.getElementById('fb-overall').focus();
    return;
  }

  const submitBtn = document.getElementById('fb-submit');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Saving...';

  const { session } = await getSession();
  if (!session) {
    alert('Please sign in to submit feedback.');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Feedback';
    return;
  }

  const specificFeedback = bodyMapWidget ? bodyMapWidget.getData() : {};
  const notes = document.getElementById('fb-notes').value.trim();
  const sewStage = document.getElementById('fb-stage').value;

  const payload = { garmentId, overallFit, specificFeedback, notes, sewStage };
  if (purchaseId) payload.purchaseId = purchaseId;

  try {
    const resp = await fetch('/api/submit-feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(payload),
    });
    const json = await resp.json();
    if (!resp.ok) {
      alert(json.error || 'Could not save feedback');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Feedback';
      return;
    }
  } catch (err) {
    alert('Network error. Please try again.');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Feedback';
    return;
  }

  // Show success
  document.getElementById('feedback-form').style.display = 'none';
  document.getElementById('fb-success').style.display = '';
}

// Wait for auth state, then render
onUserChange(user => {
  renderPage(user);
});

// Initial render
renderPage(getCurrentUser());
