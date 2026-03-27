// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Success page — runs after Stripe checkout redirect

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
  elAmount.textContent = info.amountCents ? `$${(info.amountCents / 100).toFixed(2)}` : '';
  elState.hidden = false;

  elDlBtn.addEventListener('click', async () => {
    elDlBtn.disabled    = true;
    elDlBtn.textContent = 'Generating...';
    try {
      const r = await fetch('/api/generate-pattern', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          garmentId:    info.garmentId,
          userId:       info.userId || undefined,
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
