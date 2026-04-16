// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Custom checkout page — cart summary + Stripe Embedded Checkout + inline auth.

import '../analytics.js';
import { loadStripe } from '@stripe/stripe-js';
import { signIn, onAuthStateChange, getUser } from '../lib/auth.js';
import { getCart, removeFromCart, clearCart, computeCartPricing, getCartCount } from '../lib/cart.js';
import { PATTERN_PRICES } from '../lib/pricing.js';
import { getAffiliateCode } from '../lib/affiliate.js';

// ── Theme / header wiring (mirrors page.js) ───────────────────────────────────
function getSavedTheme() {
  try { return localStorage.getItem('theme'); } catch { return null; }
}
function applyTheme(dark) {
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  const icon = document.querySelector('#theme-btn .dark-mode-toggle__icon');
  if (icon) icon.classList.toggle('dark-mode-toggle__icon--moon', dark);
}
const _saved = getSavedTheme();
applyTheme(_saved !== null ? _saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches);
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
  if (getSavedTheme() === null) applyTheme(e.matches);
});
document.getElementById('theme-btn')?.addEventListener('click', () => {
  const next = document.documentElement.getAttribute('data-theme') !== 'dark';
  localStorage.setItem('theme', next ? 'dark' : 'light');
  applyTheme(next);
});
document.getElementById('theme-btn-m')?.addEventListener('click', () => {
  const next = document.documentElement.getAttribute('data-theme') !== 'dark';
  localStorage.setItem('theme', next ? 'dark' : 'light');
  applyTheme(next);
  document.getElementById('hdr-nav-mobile')?.classList.remove('open');
});
document.getElementById('hdr-logo')?.addEventListener('click', () => { location.href = '/'; });
const _menuBtn   = document.getElementById('hdr-menu-btn');
const _mobileNav = document.getElementById('hdr-nav-mobile');
_menuBtn?.addEventListener('click', () => _mobileNav?.classList.toggle('open'));
document.addEventListener('click', e => {
  if (_mobileNav?.classList.contains('open') &&
      !_mobileNav.contains(e.target) && !_menuBtn?.contains(e.target)) {
    _mobileNav.classList.remove('open');
  }
});

// ── Module state ──────────────────────────────────────────────────────────────
let _stripe          = null;
let _embeddedCheckout = null;
let _currentUser     = null;
let _pendingCouponId = null;

const STRIPE_PK = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

// ── Boot ──────────────────────────────────────────────────────────────────────
(async () => {
  const main = document.getElementById('co-main');

  // ── Success redirect from Stripe ──────────────────────────────────────────
  const urlParams = new URLSearchParams(location.search);
  const sessionId = urlParams.get('session_id');
  if (sessionId) {
    clearCart();
    _renderSuccess(main, sessionId);
    return;
  }

  // ── Empty cart guard ──────────────────────────────────────────────────────
  const cart = getCart();
  if (cart.length === 0) {
    _renderNudge(main);
    return;
  }

  // ── Auth state ────────────────────────────────────────────────────────────
  const { user } = await getUser();
  _currentUser = (user && user.email_confirmed_at) ? user : null;

  // ── Render page layout ────────────────────────────────────────────────────
  _renderLayout(main, cart);

  // Listen for auth changes (user signs in via inline form)
  onAuthStateChange((u, event) => {
    if (u && u.email_confirmed_at) {
      _currentUser = u;
      _onAuthResolved();
    }
  });

  if (_currentUser) {
    _onAuthResolved();
  }
})();

// ── Render: success ───────────────────────────────────────────────────────────
function _renderSuccess(main, _sessionId) {
  main.innerHTML = `
    <div class="co-success">
      <div class="co-success-icon">✓</div>
      <h2 class="co-success-heading">Payment complete.</h2>
      <p class="co-success-sub">Your patterns are being generated. They will be ready shortly in My Patterns.</p>
      <a href="/account" class="co-success-link">Go to My Patterns</a>
    </div>`;
}

// ── Render: empty cart nudge ──────────────────────────────────────────────────
function _renderNudge(main) {
  main.innerHTML = `
    <div class="co-nudge">
      <h2>Your cart is empty.</h2>
      <p>Browse patterns, configure your measurements, and add to cart.</p>
      <a href="/patterns">Browse Patterns</a>
    </div>`;
}

// ── Render: full layout ───────────────────────────────────────────────────────
function _renderLayout(main, cart) {
  const pricing = computeCartPricing(cart);

  main.innerHTML = `
    <div class="co-layout">
      <div class="co-left" id="co-left">
        ${_cartSummaryHTML(cart, pricing)}
      </div>
      <div class="co-right" id="co-right">
        <div id="co-auth-area"></div>
        <div id="co-discount-area"></div>
        <div id="co-payment-area"></div>
      </div>
    </div>`;

  _bindCartActions(cart);
  _renderAuthArea();
}

// ── Cart summary HTML ─────────────────────────────────────────────────────────
function _cartSummaryHTML(cart, pricing) {
  const { bundleId, bundleCents, extrasCents, totalCents, savings, a0Cents } = pricing;

  const itemRows = cart.map(item => {
    const p = PATTERN_PRICES[item.garmentId];
    const label = p?.label ?? item.garmentId.replace(/-/g, ' ');
    const price = p ? `$${(p.cents / 100).toFixed(0)}` : '';
    const a0Note = item.addA0 ? '<span class="co-item-meta"> + A0/Projector</span>' : '';
    return `
      <div class="co-item-row" data-item-id="${item.id}">
        <div class="co-item-info">
          <span class="co-item-name">${label}</span>
          ${a0Note}
        </div>
        <span class="co-item-price">${price}</span>
        <button class="co-item-remove" data-remove="${item.id}" aria-label="Remove ${label}">&times;</button>
      </div>`;
  }).join('');

  const bundleBadge = bundleId ? `
    <div class="co-bundle-badge">
      <span class="co-bundle-badge-icon">🎁</span>
      Bundle applied. You save $${(savings / 100).toFixed(0)}.
    </div>` : '';

  const totalRows = [];
  if (bundleId) {
    const bundleLabel = bundleId === 'wardrobe5' ? '5-Pattern Bundle' : '3-Pattern Bundle';
    totalRows.push(`<div class="co-totals-row"><span>${bundleLabel}</span><span>$${(bundleCents / 100).toFixed(2)}</span></div>`);
    if (extrasCents > 0) {
      totalRows.push(`<div class="co-totals-row"><span>Extra patterns</span><span>$${(extrasCents / 100).toFixed(2)}</span></div>`);
    }
  }
  if (a0Cents > 0) {
    totalRows.push(`<div class="co-totals-row"><span>A0 / Projector files</span><span>$${(a0Cents / 100).toFixed(2)}</span></div>`);
  }
  totalRows.push(`<div class="co-totals-row total"><span>Total</span><span>$${(totalCents / 100).toFixed(2)}</span></div>`);

  return `
    <h2 class="co-summary-heading">Your cart (${cart.length})</h2>
    ${bundleBadge}
    <div id="co-items">${itemRows}</div>
    <div class="co-totals">${totalRows.join('')}</div>
    <a href="/patterns" class="co-back-link">← Add more patterns</a>`;
}

// ── Bind remove buttons ───────────────────────────────────────────────────────
function _bindCartActions(cart) {
  document.getElementById('co-left')?.addEventListener('click', e => {
    const id = e.target.dataset.remove;
    if (!id) return;
    removeFromCart(id);
    const newCart = getCart();
    if (newCart.length === 0) {
      location.href = '/patterns';
      return;
    }
    // Re-render summary
    const pricing = computeCartPricing(newCart);
    document.getElementById('co-left').innerHTML = _cartSummaryHTML(newCart, pricing);
    _bindCartActions(newCart);
    // Rebuild Stripe session with updated items
    _mountStripe(newCart);
  });
}

// ── Auth area ─────────────────────────────────────────────────────────────────
function _renderAuthArea() {
  const area = document.getElementById('co-auth-area');
  if (!area) return;

  if (_currentUser) {
    area.innerHTML = `
      <div class="co-signed-in-row">
        <span>Signed in as <span class="co-signed-in-email">${_currentUser.email}</span></span>
      </div>`;
    return;
  }

  // Inline sign-in / sign-up tabs
  area.innerHTML = `
    <div class="co-auth-section">
      <h3 class="co-auth-heading">Sign in or create an account to continue</h3>
      <div class="co-auth-tabs">
        <button class="co-auth-tab active" id="co-tab-signin">Sign In</button>
        <button class="co-auth-tab" id="co-tab-signup">Create Account</button>
      </div>
      <div id="co-auth-form-wrap"></div>
    </div>`;

  document.getElementById('co-tab-signin').addEventListener('click', () => {
    document.getElementById('co-tab-signin').classList.add('active');
    document.getElementById('co-tab-signup').classList.remove('active');
    _renderSignInForm();
  });
  document.getElementById('co-tab-signup').addEventListener('click', () => {
    document.getElementById('co-tab-signup').classList.add('active');
    document.getElementById('co-tab-signin').classList.remove('active');
    _renderSignUpForm();
  });

  _renderSignInForm();
}

function _renderSignInForm(err) {
  const wrap = document.getElementById('co-auth-form-wrap');
  if (!wrap) return;
  wrap.innerHTML = `
    ${err ? `<p class="co-auth-error">${err}</p>` : ''}
    <form class="co-auth-form" id="co-signin-form">
      <input class="co-auth-input" type="email" id="co-si-email" placeholder="you@example.com" autocomplete="email" required>
      <input class="co-auth-input" type="password" id="co-si-pw" placeholder="Password" autocomplete="current-password" required>
      <button class="co-auth-btn" type="submit" id="co-si-btn">Sign In</button>
    </form>`;

  document.getElementById('co-signin-form').addEventListener('submit', async e => {
    e.preventDefault();
    const btn   = document.getElementById('co-si-btn');
    const email = document.getElementById('co-si-email').value;
    const pw    = document.getElementById('co-si-pw').value;
    btn.disabled = true; btn.textContent = 'Signing in…';
    const { data, error } = await signIn(email, pw);
    if (error || !data?.session) {
      btn.disabled = false; btn.textContent = 'Sign In';
      _renderSignInForm(error?.message || 'Sign in failed. Check your email and password.');
      return;
    }
    _currentUser = data.session.user;
    _onAuthResolved();
  });
}

function _renderSignUpForm(err) {
  const wrap = document.getElementById('co-auth-form-wrap');
  if (!wrap) return;
  wrap.innerHTML = `
    ${err ? `<p class="co-auth-error">${err}</p>` : ''}
    <form class="co-auth-form" id="co-signup-form">
      <input class="co-auth-input" type="email" id="co-su-email" placeholder="you@example.com" autocomplete="email" required>
      <input class="co-auth-input" type="password" id="co-su-pw" placeholder="Password (8+ characters)" autocomplete="new-password" required minlength="8">
      <button class="co-auth-btn" type="submit" id="co-su-btn">Create Account</button>
    </form>
    <p class="co-auth-note">By signing up you agree to our <a href="/terms">Terms</a> and <a href="/privacy">Privacy Policy</a>.</p>`;

  document.getElementById('co-signup-form').addEventListener('submit', async e => {
    e.preventDefault();
    const btn   = document.getElementById('co-su-btn');
    const email = document.getElementById('co-su-email').value;
    const pw    = document.getElementById('co-su-pw').value;
    btn.disabled = true; btn.textContent = 'Creating account…';

    // Use signup-free to bypass email confirmation
    const res  = await fetch('/api/signup-free', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, password: pw }),
    });
    const json = await res.json();
    if (!res.ok) {
      btn.disabled = false; btn.textContent = 'Create Account';
      _renderSignUpForm(json.error || 'Could not create account.');
      return;
    }

    const { data: sinData, error: sinErr } = await signIn(email, pw);
    if (sinErr || !sinData?.session) {
      btn.disabled = false; btn.textContent = 'Create Account';
      _renderSignUpForm('Account created. Please sign in.');
      return;
    }
    _currentUser = sinData.session.user;
    _onAuthResolved();
  });
}

// Called when we have a confirmed user (either on load or after inline auth)
function _onAuthResolved() {
  _renderAuthArea();       // swap inline form → signed-in row
  _renderDiscountArea();   // show email-for-discount (if not already used)
  _mountStripe(getCart()); // mount Stripe embedded checkout
}

// ── Email-for-discount ────────────────────────────────────────────────────────
function _renderDiscountArea() {
  const area = document.getElementById('co-discount-area');
  if (!area) return;

  // Don't show if user already used a discount this session
  if (localStorage.getItem('pp-discount-used')) {
    area.innerHTML = '';
    return;
  }

  area.innerHTML = `
    <div class="co-discount-row">
      <p class="co-discount-label">New here? Enter your email for <strong>10% off</strong> your first order.</p>
      <div class="co-discount-form">
        <input class="co-discount-input" type="email" id="co-disc-email"
               placeholder="you@example.com"
               value="${_currentUser?.email ?? ''}"
               autocomplete="email">
        <button class="co-discount-btn" id="co-disc-btn">Apply</button>
      </div>
      <p id="co-disc-msg" class="co-discount-msg" hidden></p>
    </div>`;

  document.getElementById('co-disc-btn').addEventListener('click', _applyDiscount);
  document.getElementById('co-disc-email').addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); _applyDiscount(); }
  });
}

async function _applyDiscount() {
  const btn    = document.getElementById('co-disc-btn');
  const input  = document.getElementById('co-disc-email');
  const msg    = document.getElementById('co-disc-msg');
  const email  = (input?.value ?? '').trim();

  if (!email || !email.includes('@')) {
    if (msg) { msg.textContent = 'Enter a valid email address.'; msg.className = 'co-discount-msg error'; msg.hidden = false; }
    return;
  }

  if (btn) { btn.disabled = true; btn.textContent = 'Applying…'; }

  const res  = await fetch('/api/email-discount', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ email }),
  });
  const json = await res.json();

  if (!res.ok) {
    if (btn) { btn.disabled = false; btn.textContent = 'Apply'; }
    const errText = json.alreadyUsed
      ? 'This email has already claimed the first-order discount.'
      : (json.error || 'Could not apply discount.');
    if (msg) { msg.textContent = errText; msg.className = 'co-discount-msg error'; msg.hidden = false; }
    return;
  }

  _pendingCouponId = json.couponId;
  localStorage.setItem('pp-discount-used', '1');

  if (msg) {
    msg.textContent = `10% discount applied.`;
    msg.className   = 'co-discount-msg success';
    msg.hidden      = false;
  }
  if (btn) { btn.disabled = true; btn.textContent = 'Applied'; }
  if (input) input.disabled = true;

  // Rebuild Stripe session with the coupon
  _mountStripe(getCart());
}

// ── Stripe Embedded Checkout ──────────────────────────────────────────────────
async function _mountStripe(cart) {
  const area = document.getElementById('co-payment-area');
  if (!area) return;

  area.innerHTML = `
    <div class="co-payment-section">
      <h3 class="co-payment-heading">Payment</h3>
      <div id="stripe-payment-container">
        <p class="co-payment-loading">Loading payment form…</p>
      </div>
    </div>`;

  // Destroy any previous instance
  if (_embeddedCheckout) {
    try { await _embeddedCheckout.destroy(); } catch { /* ignore */ }
    _embeddedCheckout = null;
  }

  if (!_stripe) {
    _stripe = await loadStripe(STRIPE_PK);
  }

  const userId = _currentUser?.id ?? null;

  // Create cart checkout session (server-side)
  let clientSecret;
  try {
    const res  = await fetch('/api/create-cart-checkout', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        userId,
        items:          cart,
        couponId:       _pendingCouponId ?? null,
        affiliateCode:  getAffiliateCode(),
      }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Could not start checkout');
    clientSecret = json.clientSecret;
  } catch (err) {
    area.innerHTML = `<div class="co-payment-section"><p class="co-payment-loading" style="color:var(--text)">Could not load payment form: ${err.message}. <a href="/" style="color:var(--gold)">Try again</a></p></div>`;
    return;
  }

  _embeddedCheckout = await _stripe.initEmbeddedCheckout({ clientSecret });
  _embeddedCheckout.mount('#stripe-payment-container');
}
