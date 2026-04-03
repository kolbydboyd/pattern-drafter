// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Redemption landing page — validates code, stores in sessionStorage, redirects to wizard.

const entry      = document.getElementById('redeem-entry');
const success    = document.getElementById('redeem-success');
const codeInput  = document.getElementById('redeem-code-input');
const validateBtn = document.getElementById('redeem-validate-btn');
const msg        = document.getElementById('redeem-msg');
const garmentEl  = document.getElementById('redeem-garment-name');
const continueBtn = document.getElementById('redeem-continue-btn');

// ── Format code as user types: PP-XXXX-XXXX ──────────────────────────────────
codeInput.addEventListener('input', () => {
  let raw = codeInput.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  // Auto-prepend PP if they start typing the code digits directly
  if (raw.length > 0 && !raw.startsWith('PP')) {
    raw = 'PP' + raw;
  }
  // Format: PP-XXXX-XXXX
  let formatted = raw.slice(0, 2);
  if (raw.length > 2) formatted += '-' + raw.slice(2, 6);
  if (raw.length > 6) formatted += '-' + raw.slice(6, 10);
  codeInput.value = formatted;
});

// ── Auto-fill from URL param ─────────────────────────────────────────────────
const urlCode = new URLSearchParams(window.location.search).get('code');
if (urlCode) {
  codeInput.value = urlCode.trim().toUpperCase();
  // Auto-validate after a tick so the page renders first
  setTimeout(() => validateBtn.click(), 100);
}

// ── Validate ─────────────────────────────────────────────────────────────────
validateBtn.addEventListener('click', async () => {
  const code = codeInput.value.trim().toUpperCase();
  if (!code) { showMsg('Please enter a code.', true); return; }

  validateBtn.disabled = true;
  showMsg('Checking...', false, true);

  try {
    const res = await fetch('/api/validate-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    const data = await res.json();

    if (!data.valid) {
      showMsg('Invalid or already redeemed code. Please check and try again.', true);
      validateBtn.disabled = false;
      return;
    }

    // Store in sessionStorage — consumed only on actual download
    sessionStorage.setItem('redemptionCode', code);
    sessionStorage.setItem('redemptionGarment', data.garmentId);
    sessionStorage.setItem('redemptionGarmentName', data.garmentName);

    // Show success state
    garmentEl.textContent = data.garmentName;
    continueBtn.href = `/?step=2&garment=${data.garmentId}&redeem=1`;
    entry.hidden = true;
    success.hidden = false;
  } catch (err) {
    showMsg('Something went wrong. Please try again.', true);
    validateBtn.disabled = false;
  }
});

// Enter key triggers validation
codeInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') validateBtn.click();
});

function showMsg(text, isError = false, isLoading = false) {
  msg.textContent = text;
  msg.className = 'redeem-msg' + (isError ? ' redeem-error' : '') + (isLoading ? ' redeem-loading' : '');
}
