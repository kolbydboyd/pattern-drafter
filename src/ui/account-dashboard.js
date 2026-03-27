// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
import { getUser, signOut } from '../lib/auth.js';
import {
  getMeasurementProfiles, saveMeasurementProfile,
  archiveMeasurementProfile, deleteMeasurementProfile,
  getPurchases, getWishlist, removeFromWishlist,
} from '../lib/db.js';
import { supabase } from '../lib/supabase.js';

// ── Open / close ──────────────────────────────────────────────────────────────
function _closeAccountDashboard() {
  const overlay = document.getElementById('acct-overlay');
  if (overlay) overlay.hidden = true;
  document.body.style.overflow = '';
}

export function openAccountDashboard(section = 'measurements') {
  let overlay = document.getElementById('acct-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'acct-overlay';
    overlay.className = 'acct-overlay';
    overlay.hidden = true;
    overlay.innerHTML = `
      <div class="acct-modal" role="dialog" aria-modal="true">
        <div class="acct-wrap">
          <div class="acct-sidebar">
            <div class="acct-brand">People's Patterns</div>
            <nav class="acct-nav">
              <button class="acct-nav-item" data-section="measurements">My Measurements</button>
              <button class="acct-nav-item" data-section="patterns">My Patterns</button>
              <button class="acct-nav-item" data-section="wishlist">Wishlist</button>
              <button class="acct-nav-item" data-section="orders">Orders</button>
              <button class="acct-nav-item" data-section="giftcards">Gift Cards</button>
              <button class="acct-nav-item" data-section="settings">Account Settings</button>
            </nav>
            <button class="acct-close-btn" id="acct-close">✕ Close</button>
          </div>
          <div class="acct-main" id="acct-main">
            <div class="acct-loading">Loading…</div>
          </div>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    // Click outside the modal card closes
    overlay.addEventListener('click', e => { if (e.target === overlay) _closeAccountDashboard(); });
    document.getElementById('acct-close').addEventListener('click', _closeAccountDashboard);
    overlay.querySelectorAll('.acct-nav-item').forEach(btn => {
      btn.addEventListener('click', () => _showSection(btn.dataset.section));
    });

    // ESC key
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !overlay.hidden) _closeAccountDashboard();
    });
  }

  overlay.hidden = false;
  document.body.style.overflow = 'hidden';
  _showSection(section);
}

async function _showSection(section) {
  // Highlight active nav item
  document.querySelectorAll('.acct-nav-item').forEach(b =>
    b.classList.toggle('acct-nav-active', b.dataset.section === section));

  const main = document.getElementById('acct-main');
  main.innerHTML = `<div class="acct-loading">Loading…</div>`;

  const { user } = await getUser();
  if (!user) { main.innerHTML = `<p class="acct-empty">Not signed in.</p>`; return; }

  switch (section) {
    case 'measurements': await _renderMeasurements(main, user); break;
    case 'patterns':     await _renderPatterns(main, user); break;
    case 'wishlist':     await _renderWishlist(main, user); break;
    case 'orders':       await _renderOrders(main, user); break;
    case 'giftcards':    await _renderGiftCards(main, user); break;
    case 'settings':     await _renderSettings(main, user); break;
    default:             main.innerHTML = `<p class="acct-empty">Unknown section.</p>`;
  }
}

// ── 1. My Measurements ────────────────────────────────────────────────────────
async function _renderMeasurements(main, user) {
  const { data, error } = await getMeasurementProfiles(user.id);
  if (error) { main.innerHTML = `<p class="acct-error">${error.message}</p>`; return; }

  const active   = (data || []).filter(p => !p.archived);
  const archived = (data || []).filter(p => p.archived);

  let html = `<h2 class="acct-section-title">My Measurements</h2>`;

  html += `<div class="acct-add-profile">
    <input class="acct-input" type="text" id="new-profile-name" placeholder="Profile name">
    <button class="acct-btn-sm" id="acct-add-profile-btn">+ Add Profile</button>
  </div>`;

  if (!active.length) {
    html += `<p class="acct-empty">No saved profiles yet. Save measurements from the pattern wizard to get started.</p>`;
  } else {
    html += `<div class="acct-profile-list">`;
    for (const p of active) {
      const date = new Date(p.created_at).toLocaleDateString();
      html += `<div class="acct-profile-card" data-id="${p.id}">
        <div class="acct-profile-name">${p.name}</div>
        <div class="acct-profile-meta">Saved ${date}</div>
        <div class="acct-profile-actions">
          <button class="acct-btn-xs acct-load-profile" data-id="${p.id}">Load</button>
          <button class="acct-btn-xs acct-archive-profile" data-id="${p.id}">Archive</button>
          <button class="acct-btn-xs acct-btn-danger acct-delete-profile" data-id="${p.id}">Delete</button>
        </div>
      </div>`;
    }
    html += `</div>`;
  }

  if (archived.length) {
    html += `<details class="acct-archived"><summary>Archived (${archived.length})</summary><div class="acct-profile-list">`;
    for (const p of archived) {
      html += `<div class="acct-profile-card acct-profile-dim" data-id="${p.id}">
        <div class="acct-profile-name">${p.name}</div>
        <div class="acct-profile-actions">
          <button class="acct-btn-xs acct-delete-profile" data-id="${p.id}">Delete</button>
        </div>
      </div>`;
    }
    html += `</div></details>`;
  }

  main.innerHTML = html;

  document.getElementById('acct-add-profile-btn')?.addEventListener('click', async () => {
    const name = document.getElementById('new-profile-name')?.value.trim();
    if (!name) return;
    await saveMeasurementProfile(user.id, name, {});
    _showSection('measurements');
  });

  main.querySelectorAll('.acct-archive-profile').forEach(btn => {
    btn.addEventListener('click', async () => {
      await archiveMeasurementProfile(btn.dataset.id);
      _showSection('measurements');
    });
  });

  main.querySelectorAll('.acct-delete-profile').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Delete this profile?')) return;
      await deleteMeasurementProfile(btn.dataset.id);
      _showSection('measurements');
    });
  });
}

// ── 2. My Patterns ────────────────────────────────────────────────────────────
async function _renderPatterns(main, user) {
  const { data, error } = await getPurchases(user.id);
  if (error) { main.innerHTML = `<p class="acct-error">${error.message}</p>`; return; }

  let html = `<h2 class="acct-section-title">My Patterns</h2>`;
  if (!data?.length) {
    html += `<p class="acct-empty">No patterns yet — <a class="acct-link" href="#">browse the catalog</a>.</p>`;
    main.innerHTML = html;
    main.querySelector('.acct-link')?.addEventListener('click', e => {
      e.preventDefault();
      _closeAccountDashboard();
    });
    return;
  }

  html += `<div class="acct-pattern-grid">`;
  for (const p of data) {
    const date = new Date(p.purchased_at).toLocaleDateString();
    html += `<div class="acct-pattern-card">
      <div class="acct-pattern-name">${p.garment_id.replace(/-/g, ' ')}</div>
      <div class="acct-pattern-meta">Purchased ${date} · Downloaded ${p.download_count}×</div>
      <button class="acct-btn-sm acct-redownload" data-garment="${p.garment_id}">Download Again</button>
    </div>`;
  }
  html += `</div>`;
  main.innerHTML = html;
}

// ── 3. Wishlist ───────────────────────────────────────────────────────────────
async function _renderWishlist(main, user) {
  const { data, error } = await getWishlist(user.id);
  if (error) { main.innerHTML = `<p class="acct-error">${error.message}</p>`; return; }

  let html = `<h2 class="acct-section-title">Wishlist</h2>`;
  if (!data?.length) {
    html += `<p class="acct-empty">Your wishlist is empty.</p>`;
    main.innerHTML = html;
    return;
  }

  html += `<div class="acct-pattern-grid">`;
  for (const item of data) {
    html += `<div class="acct-pattern-card">
      <div class="acct-pattern-name">${item.garment_id.replace(/-/g, ' ')}</div>
      <div class="acct-pattern-actions">
        <button class="acct-btn-sm">Buy Now</button>
        <button class="acct-btn-xs acct-btn-danger acct-remove-wish" data-id="${item.id}" data-garment="${item.garment_id}">♡ Remove</button>
      </div>
    </div>`;
  }
  html += `</div>`;
  main.innerHTML = html;

  main.querySelectorAll('.acct-remove-wish').forEach(btn => {
    btn.addEventListener('click', async () => {
      await removeFromWishlist(user.id, btn.dataset.garment);
      _showSection('wishlist');
    });
  });
}

// ── 4. Orders ─────────────────────────────────────────────────────────────────
async function _renderOrders(main, user) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (error) { main.innerHTML = `<p class="acct-error">${error.message}</p>`; return; }

  let html = `<h2 class="acct-section-title">Orders</h2>`;
  if (!data?.length) {
    html += `<p class="acct-empty">No orders yet.</p>`;
    main.innerHTML = html;
    return;
  }

  html += `<div class="acct-order-list">`;
  for (const o of data) {
    const date  = new Date(o.created_at).toLocaleDateString();
    const items = Array.isArray(o.items) ? o.items.map(i => i.garment_id || i).join(', ') : '—';
    const total = o.total_cents ? `$${(o.total_cents / 100).toFixed(2)}` : '—';
    html += `<div class="acct-order-row">
      <div class="acct-order-id">${o.id.slice(0, 8)}…</div>
      <div class="acct-order-date">${date}</div>
      <div class="acct-order-items">${items}</div>
      <div class="acct-order-total">${total}</div>
      <div class="acct-order-status acct-status-${o.status}">${o.status}</div>
    </div>`;
  }
  html += `</div>`;
  main.innerHTML = html;
}

// ── 5. Gift Cards ─────────────────────────────────────────────────────────────
async function _renderGiftCards(main, user) {
  const { data, error } = await supabase
    .from('gift_cards')
    .select('*')
    .eq('redeemed_by', user.id);

  let html = `<h2 class="acct-section-title">Gift Cards</h2>`;

  if (!error && data?.length) {
    html += `<div class="acct-gc-list">`;
    for (const gc of data) {
      html += `<div class="acct-gc-row">Code: <strong>${gc.code}</strong> · $${(gc.amount_cents / 100).toFixed(2)} · Redeemed ${new Date(gc.redeemed_at).toLocaleDateString()}</div>`;
    }
    html += `</div>`;
  } else {
    html += `<p class="acct-empty">No gift cards on your account.</p>`;
  }

  html += `<div class="acct-gc-redeem">
    <h3 class="acct-sub-title">Redeem a gift card</h3>
    <div class="acct-gc-row-input">
      <input class="acct-input" type="text" id="gc-code-input" placeholder="Gift card code">
      <button class="acct-btn-sm" id="gc-redeem-btn">Redeem</button>
    </div>
    <p class="acct-gc-msg" id="gc-msg"></p>
  </div>`;

  main.innerHTML = html;

  document.getElementById('gc-redeem-btn')?.addEventListener('click', async () => {
    const code = document.getElementById('gc-code-input')?.value.trim().toUpperCase();
    const msg  = document.getElementById('gc-msg');
    if (!code) return;
    const { data: gc, error: gcErr } = await supabase
      .from('gift_cards')
      .select('*')
      .eq('code', code)
      .is('redeemed_by', null)
      .single();
    if (gcErr || !gc) { msg.textContent = 'Invalid or already redeemed code.'; msg.className = 'acct-gc-msg acct-error'; return; }
    await supabase.from('gift_cards').update({ redeemed_by: user.id, redeemed_at: new Date().toISOString() }).eq('id', gc.id);
    msg.textContent = `Redeemed! $${(gc.amount_cents / 100).toFixed(2)} credit added to your account.`;
    msg.className = 'acct-gc-msg acct-success';
    _showSection('giftcards');
  });
}

// ── 6. Account Settings ───────────────────────────────────────────────────────
async function _renderSettings(main, user) {
  let html = `<h2 class="acct-section-title">Account Settings</h2>
    <div class="acct-settings-group">
      <h3 class="acct-sub-title">Change Password</h3>
      <div class="acct-field">
        <label class="acct-field-label">New password</label>
        <input class="acct-input" type="password" id="acct-new-pass" placeholder="Min 8 characters" minlength="8">
      </div>
      <div class="acct-field">
        <label class="acct-field-label">Confirm new password</label>
        <input class="acct-input" type="password" id="acct-confirm-pass" placeholder="••••••••">
      </div>
      <button class="acct-btn-sm" id="acct-change-pass-btn">Update Password</button>
      <p class="acct-settings-msg" id="acct-pass-msg"></p>
    </div>

    <div class="acct-settings-group">
      <h3 class="acct-sub-title">Email Preferences</h3>
      <label class="acct-check-row">
        <input type="checkbox" id="pref-announcements" checked>
        New pattern announcements
      </label>
      <label class="acct-check-row">
        <input type="checkbox" id="pref-feedback" checked>
        Fit feedback reminders (2 weeks after purchase)
      </label>
      <label class="acct-check-row acct-check-disabled">
        <input type="checkbox" checked disabled>
        Order confirmations (always on)
      </label>
    </div>

    <div class="acct-settings-group acct-danger-zone">
      <h3 class="acct-sub-title acct-danger-title">Danger Zone</h3>
      <p class="acct-field-label">Deleting your account is permanent and cannot be undone. All saved profiles and purchase history will be lost.</p>
      <button class="acct-btn-sm acct-btn-danger" id="acct-delete-account-btn">Delete Account</button>
    </div>`;

  main.innerHTML = html;

  document.getElementById('acct-change-pass-btn')?.addEventListener('click', async () => {
    const msg     = document.getElementById('acct-pass-msg');
    const newPass = document.getElementById('acct-new-pass')?.value;
    const confirm = document.getElementById('acct-confirm-pass')?.value;
    if (newPass !== confirm) { msg.textContent = 'Passwords do not match.'; msg.className = 'acct-settings-msg acct-error'; return; }
    if (newPass.length < 8)  { msg.textContent = 'Password must be at least 8 characters.'; msg.className = 'acct-settings-msg acct-error'; return; }
    const { error } = await supabase.auth.updateUser({ password: newPass });
    if (error) { msg.textContent = error.message; msg.className = 'acct-settings-msg acct-error'; return; }
    msg.textContent = 'Password updated.';
    msg.className = 'acct-settings-msg acct-success-text';
  });

  document.getElementById('acct-delete-account-btn')?.addEventListener('click', async () => {
    if (!confirm('Delete your account permanently? This cannot be undone.')) return;
    if (!confirm('Are you absolutely sure? All purchases and saved profiles will be lost.')) return;
    // Supabase admin delete requires service role key — show instructions instead
    alert('To fully delete your account, email hello@peoplespatterns.com with the subject "Delete my account".\n\nWe\'ll process your request within 48 hours.');
  });
}
