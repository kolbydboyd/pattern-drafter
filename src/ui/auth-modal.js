// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
import { signUp, signIn, signOut, getUser, onAuthStateChange, resetPassword } from '../lib/auth.js';

// ── State ─────────────────────────────────────────────────────────────────────
let _modalState   = 'login';   // 'login' | 'signup'
let _pendingAction = null;     // function to call after successful auth
let _authUser     = null;

// ── Auth state broadcast ──────────────────────────────────────────────────────
const _listeners = [];
export function onUserChange(fn) { _listeners.push(fn); }
function _broadcast(user) { _authUser = user; _listeners.forEach(fn => fn(user)); }

// Subscribe to Supabase session changes on module load
onAuthStateChange(user => {
  _broadcast(user);
  updateHeaderAuth(user);
});

// Restore session on page load
getUser().then(({ user }) => {
  _broadcast(user);
  updateHeaderAuth(user);
});

export function getCurrentUser() { return _authUser; }

// ── Modal HTML ────────────────────────────────────────────────────────────────
export function renderAuthModal() {
  return `
  <dialog id="auth-modal" class="auth-modal">
    <div class="auth-card">
      <button class="auth-close" id="auth-close" aria-label="Close">&times;</button>
      <div class="auth-logo">People's Patterns</div>
      <div id="auth-modal-body"></div>
    </div>
  </dialog>`;
}

function _loginHTML(err) {
  return `
    <h2 class="auth-heading">Sign in</h2>
    ${err ? `<p class="auth-error">${err}</p>` : ''}
    <form id="auth-form">
      <div class="auth-field">
        <label class="auth-label">Email</label>
        <input class="auth-input" type="email" id="auth-email" autocomplete="email" required placeholder="you@example.com">
      </div>
      <div class="auth-field">
        <label class="auth-label">Password</label>
        <input class="auth-input" type="password" id="auth-password" autocomplete="current-password" required placeholder="••••••••">
      </div>
      <button class="auth-btn" type="submit" id="auth-submit">Sign In</button>
    </form>
    <p class="auth-switch">
      <a href="#" id="auth-forgot">Forgot password?</a>
    </p>
    <p class="auth-switch">
      Don't have an account? <a href="#" id="auth-toggle">Sign up</a>
    </p>`;
}

function _signupHTML(err) {
  return `
    <h2 class="auth-heading">Create account</h2>
    ${err ? `<p class="auth-error">${err}</p>` : ''}
    <form id="auth-form">
      <div class="auth-field">
        <label class="auth-label">Email</label>
        <input class="auth-input" type="email" id="auth-email" autocomplete="email" required placeholder="you@example.com">
      </div>
      <div class="auth-field">
        <label class="auth-label">Password</label>
        <input class="auth-input" type="password" id="auth-password" autocomplete="new-password" required placeholder="Min 8 characters" minlength="8">
      </div>
      <div class="auth-field">
        <label class="auth-label">Confirm password</label>
        <input class="auth-input" type="password" id="auth-confirm" autocomplete="new-password" required placeholder="••••••••">
      </div>
      <button class="auth-btn" type="submit" id="auth-submit">Create Account</button>
    </form>
    <p class="auth-legal">By signing up you agree to our Terms and Privacy Policy.</p>
    <p class="auth-switch">
      Already have an account? <a href="#" id="auth-toggle">Sign in</a>
    </p>`;
}

function _renderBody(state, err) {
  const body = document.getElementById('auth-modal-body');
  if (!body) return;
  body.innerHTML = state === 'signup' ? _signupHTML(err) : _loginHTML(err);
  _wireForm();
}

function _wireForm() {
  document.getElementById('auth-toggle')?.addEventListener('click', e => {
    e.preventDefault();
    _modalState = _modalState === 'login' ? 'signup' : 'login';
    _renderBody(_modalState);
  });

  document.getElementById('auth-forgot')?.addEventListener('click', async e => {
    e.preventDefault();
    const email = document.getElementById('auth-email')?.value.trim();
    if (!email) { _renderBody('login', 'Enter your email first.'); return; }
    const { error } = await resetPassword(email);
    if (error) { _renderBody('login', error.message); return; }
    _renderBody('login');
    document.getElementById('auth-modal-body').insertAdjacentHTML('afterbegin',
      `<p class="auth-success">Password reset email sent — check your inbox.</p>`);
  });

  document.getElementById('auth-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    const btn   = document.getElementById('auth-submit');
    const email = document.getElementById('auth-email').value.trim();
    const pass  = document.getElementById('auth-password').value;

    btn.disabled  = true;
    btn.textContent = _modalState === 'signup' ? 'Creating…' : 'Signing in…';

    if (_modalState === 'signup') {
      const confirm = document.getElementById('auth-confirm').value;
      if (pass !== confirm) {
        _renderBody('signup', 'Passwords do not match.');
        return;
      }
      if (pass.length < 8) {
        _renderBody('signup', 'Password must be at least 8 characters.');
        return;
      }
      const { error } = await signUp(email, pass);
      if (error) { _renderBody('signup', error.message); return; }
      // Show "check email" message for email confirmation
      document.getElementById('auth-modal-body').innerHTML = `
        <p class="auth-success" style="text-align:center;margin-top:16px">
          Account created! Check your email to confirm your address,<br>
          then sign in below.
        </p>`;
      setTimeout(() => { _modalState = 'login'; _renderBody('login'); }, 2500);
    } else {
      const { data, error } = await signIn(email, pass);
      if (error) { _renderBody('login', error.message); return; }
      closeAuthModal();
      const action = _pendingAction;
      _pendingAction = null;
      if (action) action(data.user);
    }
  });
}

// ── Open / close ──────────────────────────────────────────────────────────────
export function openAuthModal(state = 'login', afterAuth = null) {
  _modalState   = state;
  _pendingAction = afterAuth;
  const modal = document.getElementById('auth-modal');
  if (!modal) return;
  _renderBody(state);
  modal.showModal();
}

export function closeAuthModal() {
  document.getElementById('auth-modal')?.close();
}

// ── Init (call once on page load) ─────────────────────────────────────────────
export function initAuthModal() {
  // Inject modal HTML if not already present
  if (!document.getElementById('auth-modal')) {
    document.body.insertAdjacentHTML('beforeend', renderAuthModal());
  }

  document.getElementById('auth-close')?.addEventListener('click', closeAuthModal);

  // Close on backdrop click
  document.getElementById('auth-modal')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) closeAuthModal();
  });
}

// ── Header auth UI ────────────────────────────────────────────────────────────
export function updateHeaderAuth(user) {
  let slot = document.getElementById('hdr-auth');
  if (!slot) {
    // Insert slot before theme button
    const themeBtn = document.getElementById('theme-btn');
    if (!themeBtn) return;
    slot = document.createElement('div');
    slot.id = 'hdr-auth';
    slot.className = 'hdr-auth';
    themeBtn.parentNode.insertBefore(slot, themeBtn);
  }

  if (user) {
    const truncated = user.email.length > 22
      ? user.email.slice(0, 20) + '…'
      : user.email;
    slot.innerHTML = `
      <div class="hdr-user-wrap">
        <button class="hdr-user-btn" id="hdr-user-btn">${truncated} ▾</button>
        <div class="hdr-dropdown" id="hdr-dropdown" hidden>
          <button class="hdr-dd-item" id="hdr-dd-measurements">My Measurements</button>
          <button class="hdr-dd-item" id="hdr-dd-patterns">My Patterns</button>
          <button class="hdr-dd-item" id="hdr-dd-settings">Account Settings</button>
          <hr class="hdr-dd-div">
          <button class="hdr-dd-item hdr-dd-signout" id="hdr-dd-signout">Sign Out</button>
        </div>
      </div>`;
    document.getElementById('hdr-user-btn').addEventListener('click', e => {
      e.stopPropagation();
      const dd = document.getElementById('hdr-dropdown');
      dd.hidden = !dd.hidden;
    });
    document.addEventListener('click', () => {
      const dd = document.getElementById('hdr-dropdown');
      if (dd) dd.hidden = true;
    }, { once: true });
    document.getElementById('hdr-dd-signout').addEventListener('click', async () => {
      await signOut();
    });
    document.getElementById('hdr-dd-measurements').addEventListener('click', () => {
      import('./account-dashboard.js').then(m => m.openAccountDashboard('measurements'));
    });
    document.getElementById('hdr-dd-patterns').addEventListener('click', () => {
      import('./account-dashboard.js').then(m => m.openAccountDashboard('patterns'));
    });
    document.getElementById('hdr-dd-settings').addEventListener('click', () => {
      import('./account-dashboard.js').then(m => m.openAccountDashboard('settings'));
    });
  } else {
    slot.innerHTML = `
      <button class="hdr-signin-btn" id="hdr-signin-btn">Sign In</button>
      <button class="hdr-signup-btn" id="hdr-signup-btn">Create Account</button>`;
    document.getElementById('hdr-signin-btn').addEventListener('click', () =>
      openAuthModal('login'));
    document.getElementById('hdr-signup-btn').addEventListener('click', () =>
      openAuthModal('signup'));
  }
}
