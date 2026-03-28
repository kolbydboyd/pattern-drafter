// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
import { getUser, signOut, getSession } from '../lib/auth.js';
import {
  getMeasurementProfiles, saveMeasurementProfile,
  updateMeasurementProfile, updateProfileLastUsed,
  archiveMeasurementProfile, deleteMeasurementProfile,
  getPurchases, getPatterns, getFitFeedback,
  trashPattern, restorePattern, archivePattern,
  permanentlyDeletePattern, renamePattern, addPatternNote,
  getDaysUntilDeletion,
  getWishlist, removeFromWishlist,
} from '../lib/db.js';
import { supabase } from '../lib/supabase.js';

// ── Toast feedback ────────────────────────────────────────────────────────────
function _showToast(msg) {
  const t = document.createElement('div');
  t.textContent = msg;
  t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#4a8a5a;color:#fff;padding:8px 18px;border-radius:4px;font-family:"IBM Plex Mono",monospace;font-size:.78rem;z-index:9999;opacity:1;transition:opacity .4s ease .6s;pointer-events:none';
  document.body.appendChild(t);
  requestAnimationFrame(() => requestAnimationFrame(() => { t.style.opacity = '0'; }));
  setTimeout(() => t.remove(), 1200);
}

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
              <button class="acct-nav-item" data-section="projects">My Projects</button>
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
    case 'projects':     await _renderProjects(main, user); break;
    case 'wishlist':     await _renderWishlist(main, user); break;
    case 'orders':       await _renderOrders(main, user); break;
    case 'giftcards':    await _renderGiftCards(main, user); break;
    case 'settings':     await _renderSettings(main, user); break;
    default:             main.innerHTML = `<p class="acct-empty">Unknown section.</p>`;
  }
}

// ── 1. My Measurements ────────────────────────────────────────────────────────
function _keyMeasHtml(m) {
  const fields = [
    { key: 'chest', label: 'Chest' },
    { key: 'waist', label: 'Waist' },
    { key: 'hip',   label: 'Hip'   },
  ];
  const chips = fields
    .filter(f => m[f.key])
    .map(f => `<span class="acct-meas-chip"><span class="acct-meas-chip-lbl">${f.label}</span><span class="acct-meas-chip-val">${m[f.key]}"</span></span>`)
    .join('');
  return chips ? `<div class="acct-meas-chips">${chips}</div>` : '';
}

async function _renderMeasurements(main, user) {
  const { data, error } = await getMeasurementProfiles(user.id);
  if (error) { main.innerHTML = `<p class="acct-error">${error.message}</p>`; return; }

  const active   = (data || []).filter(p => !p.archived);
  const archived = (data || []).filter(p => p.archived);

  const fmtDate = d => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null;

  let html = `<h2 class="acct-section-title">My Measurements</h2>`;

  html += `<div class="acct-add-profile">
    <input class="acct-input" type="text" id="new-profile-name" placeholder="New profile name">
    <button class="acct-btn-sm" id="acct-add-profile-btn">+ New Profile</button>
  </div>`;

  if (!active.length) {
    html += `<p class="acct-empty">No saved profiles yet. Save measurements from the pattern wizard to get started.</p>`;
  } else {
    html += `<div class="acct-profile-list">`;
    for (const p of active) {
      const created  = fmtDate(p.created_at);
      const lastUsed = fmtDate(p.last_used_at);
      const count    = p.pattern_count ?? 0;
      const m        = p.measurements ?? {};
      html += `<div class="acct-profile-card" data-id="${p.id}" data-measurements='${JSON.stringify(m)}'>
        <div class="acct-profile-name">${p.name}</div>
        ${_keyMeasHtml(m)}
        <div class="acct-profile-meta">
          <span>Saved ${created}</span>
          ${lastUsed ? `<span>Last used ${lastUsed}</span>` : ''}
          <span>${count} pattern${count !== 1 ? 's' : ''}</span>
        </div>
        <div class="acct-profile-actions">
          <button class="acct-btn-xs acct-edit-profile" data-id="${p.id}">Edit</button>
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
      const m     = p.measurements ?? {};
      const count = p.pattern_count ?? 0;
      html += `<div class="acct-profile-card acct-profile-dim" data-id="${p.id}">
        <div class="acct-profile-name">${p.name}</div>
        ${_keyMeasHtml(m)}
        <div class="acct-profile-meta"><span>${count} pattern${count !== 1 ? 's' : ''}</span></div>
        <div class="acct-profile-actions">
          <button class="acct-btn-xs acct-delete-profile" data-id="${p.id}">Delete</button>
        </div>
      </div>`;
    }
    html += `</div></details>`;
  }

  main.innerHTML = html;

  document.getElementById('acct-add-profile-btn')?.addEventListener('click', async () => {
    const nameInput = document.getElementById('new-profile-name');
    const name = nameInput?.value.trim();
    if (!name) { nameInput?.focus(); return; }

    const btn = document.getElementById('acct-add-profile-btn');
    const orig = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Saving…';

    const { error } = await saveMeasurementProfile(user.id, name, {});
    btn.disabled = false;
    btn.textContent = orig;

    if (error) { alert('Could not save profile: ' + error.message); return; }
    if (nameInput) nameInput.value = '';
    _showToast('Profile created');
    setTimeout(() => _showSection('measurements'), 900);
  });

  main.querySelectorAll('.acct-edit-profile').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.acct-profile-card');
      const id   = btn.dataset.id;
      const m    = JSON.parse(card.dataset.measurements || '{}');
      _showEditProfileModal(user, id, card.querySelector('.acct-profile-name').textContent, m);
    });
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

function _showEditProfileModal(user, profileId, currentName, currentMeas) {
  const EDIT_FIELDS = [
    { key: 'chest',  label: 'Chest'  },
    { key: 'waist',  label: 'Waist'  },
    { key: 'hip',    label: 'Hip'    },
    { key: 'inseam', label: 'Inseam' },
    { key: 'height', label: 'Height' },
  ];
  const fieldsHtml = EDIT_FIELDS.map(f => `
    <div class="acct-edit-row">
      <label class="acct-edit-lbl">${f.label}</label>
      <input class="acct-input acct-edit-meas" type="number" data-key="${f.key}"
        value="${currentMeas[f.key] ?? ''}" placeholder="inches" step="0.25" min="0">
    </div>`).join('');

  const { overlay, close } = _showModal({
    title: 'Edit Profile',
    body: `
      <div class="acct-edit-row" style="margin-bottom:12px">
        <label class="acct-edit-lbl">Name</label>
        <input class="acct-input" id="edit-profile-name" type="text" value="${currentName}">
      </div>
      ${fieldsHtml}`,
    buttons: `<button class="acct-btn-sm" id="edit-prof-save">Save</button>
              <button class="acct-btn-sm acct-btn-ghost" id="edit-prof-cancel">Cancel</button>`,
  });

  overlay.querySelector('#edit-prof-cancel').addEventListener('click', close);
  overlay.querySelector('#edit-prof-save').addEventListener('click', async () => {
    const name = overlay.querySelector('#edit-profile-name').value.trim();
    if (!name) { overlay.querySelector('#edit-profile-name').focus(); return; }
    const newMeas = { ...currentMeas };
    overlay.querySelectorAll('.acct-edit-meas').forEach(el => {
      const v = parseFloat(el.value);
      if (!isNaN(v) && v > 0) newMeas[el.dataset.key] = v;
      else delete newMeas[el.dataset.key];
    });

    // Detect measurement change (compare key values)
    const measChanged = JSON.stringify(newMeas) !== JSON.stringify(currentMeas);

    const saveBtn = overlay.querySelector('#edit-prof-save');
    saveBtn.disabled = true; saveBtn.textContent = 'Saving…';
    const { error } = await updateMeasurementProfile(profileId, newMeas);
    if (!error && name !== currentName) {
      await import('../lib/supabase.js').then(async ({ supabase }) => {
        await supabase.from('measurement_profiles').update({ name }).eq('id', profileId);
      });
    }
    saveBtn.disabled = false; saveBtn.textContent = 'Save';
    if (error) { alert('Could not save: ' + error.message); return; }
    close();

    if (measChanged) {
      _showRegenAllBanner(user, profileId, name || currentName, newMeas);
    } else {
      _showToast('Profile updated');
    }
    _showSection('measurements');
  });
}

function _showRegenAllBanner(user, profileId, profileName, newMeas) {
  document.getElementById('regen-all-banner')?.remove();
  const banner = document.createElement('div');
  banner.id = 'regen-all-banner';
  banner.className = 'regen-all-banner';
  banner.innerHTML = `
    <span class="regen-all-msg">Measurements updated for <strong>${profileName}</strong>. Re-generate all linked patterns with your new measurements?</span>
    <div class="regen-all-btns">
      <button class="acct-btn-sm" id="regen-all-confirm">Re-generate All</button>
      <button class="acct-btn-xs acct-btn-ghost" id="regen-all-dismiss">Dismiss</button>
    </div>`;
  const main = document.getElementById('acct-main');
  if (main) main.insertAdjacentElement('afterbegin', banner);

  banner.querySelector('#regen-all-dismiss').addEventListener('click', () => banner.remove());
  banner.querySelector('#regen-all-confirm').addEventListener('click', async () => {
    const btn = banner.querySelector('#regen-all-confirm');
    btn.disabled = true; btn.textContent = 'Re-generating…';

    // Fetch all active purchases linked to this profile
    const { data: purchases } = await getPatterns(user.id, 'active');
    const linked = (purchases || []).filter(p => p.profile_id === profileId && Object.keys(newMeas).length > 0);

    let done = 0;
    for (const p of linked) {
      try {
        const { session } = await (await import('../lib/auth.js')).getSession();
        await fetch('/api/regenerate-pattern', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
          body: JSON.stringify({ garmentId: p.garment_id, userId: user.id, purchaseId: p.id, measurements: newMeas, opts: {} }),
        });
        done++;
      } catch { /* skip failed */ }
    }

    banner.remove();
    _showToast(`${done} pattern${done !== 1 ? 's' : ''} re-generated`);
    _showSection('patterns');
  });
}

// ── 2. My Patterns ────────────────────────────────────────────────────────────

// Shared modal helper — dark overlay, centered card
function _showModal({ title, body, buttons }) {
  const overlay = document.createElement('div');
  overlay.className = 'pat-modal-overlay';
  overlay.innerHTML = `
    <div class="pat-modal" role="dialog" aria-modal="true">
      <h3 class="pat-modal-title">${title}</h3>
      <div class="pat-modal-body">${body}</div>
      <div class="pat-modal-btns">${buttons}</div>
    </div>`;
  document.body.appendChild(overlay);
  const close = () => overlay.remove();
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', function esc(e) {
    if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); }
  }, { once: false });
  return { overlay, close };
}

async function _renderPatterns(main, user, tab = 'active') {
  const [{ data, error }, { data: feedbackData }] = await Promise.all([
    getPatterns(user.id, tab),
    getFitFeedback(user.id),
  ]);
  if (error) { main.innerHTML = `<p class="acct-error">${error.message}</p>`; return; }
  // Build a Set of purchase IDs that already have feedback
  const feedbackSet = new Set((feedbackData || []).map(f => f.purchase_id));

  const fmt = d => new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  // Wardrobe progress (active tab only)
  const allPurchasedIds = tab === 'active'
    ? (data || []).map(p => p.garment_id)
    : [];
  const wardrobeHtml = tab === 'active' ? _wardrobeProgressHtml(allPurchasedIds) : '';

  // Tab bar
  let html = `<h2 class="acct-section-title">My Patterns</h2>
    ${wardrobeHtml}
    <div class="pat-tabs">
      <button class="pat-tab${tab === 'active'   ? ' pat-tab-active' : ''}" data-tab="active">Active</button>
      <button class="pat-tab${tab === 'archived' ? ' pat-tab-active' : ''}" data-tab="archived">Archived</button>
      <button class="pat-tab${tab === 'trashed'  ? ' pat-tab-active' : ''}" data-tab="trashed">Trash</button>
    </div>`;

  if (tab === 'trashed') {
    html += `<div class="pat-trash-banner">Patterns in trash are permanently deleted after 30 days. Restore a pattern at any time before then.</div>`;
  }

  if (!data?.length) {
    if (tab === 'active') {
      html += `<div class="pat-empty-state">
        <p class="acct-empty">No patterns yet.</p>
        <p class="acct-empty">Browse the catalog to find your first garment. Every pattern is drafted to your exact measurements.</p>
        <button class="acct-btn-sm pat-browse-btn">Browse Patterns</button>
      </div>`;
    } else if (tab === 'archived') {
      html += `<p class="acct-empty">No archived patterns.<br>Archive patterns you want to keep but don't need in your main list.</p>`;
    } else {
      html += `<p class="acct-empty">Trash is empty.</p>`;
    }
    main.innerHTML = html;
    main.querySelectorAll('.pat-tab').forEach(b => b.addEventListener('click', () => _renderPatterns(main, user, b.dataset.tab)));
    main.querySelector('.pat-browse-btn')?.addEventListener('click', () => _closeAccountDashboard());
    return;
  }

  // Group active/archived by profile; trash shown flat
  if (tab === 'trashed') {
    html += `<div class="pat-card-list">`;
    for (const p of data) {
      const days    = getDaysUntilDeletion(p.trashed_at);
      const urgent  = days <= 7;
      const name    = p.display_name || p.garment_id.replace(/-/g, ' ');
      // Use purchase-level snapshot first; fall back to linked profile
      const meas    = p.measurements || p.measurement_profiles?.measurements || {};
      html += _patCardHtml(p, name, meas, fmt, tab, days, urgent, feedbackSet);
    }
    html += `</div>`;
  } else {
    // Group by profile_id
    const groups = new Map();
    for (const p of data) {
      const key  = p.profile_id ?? '__default__';
      const prof = p.measurement_profiles;
      if (!groups.has(key)) {
        groups.set(key, { name: prof?.name ?? null, measurements: prof?.measurements ?? {}, purchases: [] });
      }
      groups.get(key).purchases.push(p);
    }

    for (const [, group] of groups) {
      const label     = group.name ?? 'My Measurements';
      const isDefault = !group.name;
      html += `<details class="acct-profile-group" open>
        <summary class="acct-profile-group-head">
          <span class="acct-profile-group-name${isDefault ? ' acct-profile-group-default' : ''}">${label}</span>
          <span class="acct-profile-group-count">${group.purchases.length} pattern${group.purchases.length !== 1 ? 's' : ''}</span>
        </summary>
        <div class="pat-card-list">`;
      for (const p of group.purchases) {
        const name    = p.display_name || p.garment_id.replace(/-/g, ' ');
        // Purchase snapshot first; current profile as fallback
        const effMeas = p.measurements || group.measurements;
        html += _patCardHtml(p, name, effMeas, fmt, tab, null, false, feedbackSet);
      }
      html += `</div></details>`;
    }
  }

  main.innerHTML = html;

  // Tab switching
  main.querySelectorAll('.pat-tab').forEach(b => b.addEventListener('click', () => _renderPatterns(main, user, b.dataset.tab)));

  // Shared download logic
  async function _doDownload(garmentId, card, labelEl, originalLabel) {
    const measJson = card?.dataset.measurements;
    const optsJson = card?.dataset.opts;
    const meas = measJson ? JSON.parse(measJson) : {};
    const opts = optsJson ? JSON.parse(optsJson) : {};
    if (labelEl) { labelEl.textContent = 'Generating…'; }
    try {
      const { session } = await getSession();
      const res  = await fetch('/api/generate-pattern', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ garmentId, measurements: meas, opts }),
      });
      const json = await res.json();
      if (!res.ok || json.error) { _showToast('Error: ' + (json.error ?? res.statusText)); return; }
      const a = document.createElement('a');
      a.href = json.downloadUrl; a.download = `${garmentId}-pattern.pdf`;
      document.body.appendChild(a); a.click(); a.remove();
      if (json.a0DownloadUrl) {
        setTimeout(() => {
          const a0 = document.createElement('a');
          a0.href = json.a0DownloadUrl; a0.download = `${garmentId}-pattern-a0.pdf`;
          document.body.appendChild(a0); a0.click(); a0.remove();
        }, 800);
        _showToast('Letter PDF + A0 copy-shop file downloading');
      } else {
        _showToast('Download started');
      }
    } catch { _showToast('Download failed. Try again.'); }
    finally { if (labelEl) { labelEl.textContent = originalLabel; } }
  }

  // Download button (standalone, desktop)
  main.querySelectorAll('.pat-dl-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      await _doDownload(btn.dataset.garmentId, btn.closest('.pat-card'), btn, 'Re-download PDF');
      btn.disabled = false;
    });
  });

  // Download PDF menu item (overflow menu, always accessible on mobile)
  main.querySelectorAll('.pat-menu-dl').forEach(item => {
    item.addEventListener('click', async () => {
      item.closest('.pat-overflow-menu')?.classList.remove('open');
      await _doDownload(item.dataset.garmentId, item.closest('.pat-card'), null, null);
    });
  });

  // Re-generate button
  main.querySelectorAll('.pat-regen-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const { garmentId, purchaseId } = btn.dataset;
      const card  = btn.closest('.pat-card');
      const meas  = JSON.parse(card?.dataset.measurements || '{}');
      const profName = card?.dataset.profileName || '';
      _showRegenModal(user, garmentId, purchaseId, meas, profName, () => _renderPatterns(main, user, tab));
    });
  });

  // Restore button (trash tab)
  main.querySelectorAll('.pat-restore-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      await restorePattern(btn.dataset.purchaseId, user.id);
      _showToast('Pattern restored');
      _renderPatterns(main, user, tab);
    });
  });

  // Delete Forever button (trash tab)
  main.querySelectorAll('.pat-delete-forever-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const { purchaseId, garmentName } = btn.dataset;
      _showDeleteForeverModal(user, purchaseId, garmentName, () => _renderPatterns(main, user, tab));
    });
  });

  // ⋯ overflow menu
  main.querySelectorAll('.pat-overflow-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      // Close other open menus
      main.querySelectorAll('.pat-overflow-menu.open').forEach(m => {
        if (m !== btn.nextElementSibling) m.classList.remove('open');
      });
      btn.nextElementSibling?.classList.toggle('open');
    });
  });
  document.addEventListener('click', () => {
    main.querySelectorAll('.pat-overflow-menu.open').forEach(m => m.classList.remove('open'));
  }, { once: false });

  // Overflow menu actions
  main.querySelectorAll('.pat-menu-rename').forEach(item => {
    item.addEventListener('click', () => {
      item.closest('.pat-overflow-menu')?.classList.remove('open');
      const card     = item.closest('.pat-card');
      const nameEl   = card?.querySelector('.pat-card-name');
      const curName  = nameEl?.textContent ?? '';
      const purchaseId = item.dataset.purchaseId;
      const garmentId  = item.dataset.garmentId;
      nameEl.innerHTML = `<input class="pat-rename-input" maxlength="60" value="${curName.replace(/"/g, '&quot;')}">`;
      const inp = nameEl.querySelector('input');
      inp.focus(); inp.select();
      const save = async () => {
        const val = inp.value.trim() || garmentId.replace(/-/g, ' ');
        nameEl.textContent = val;
        await renamePattern(purchaseId, user.id, val === garmentId.replace(/-/g, ' ') ? null : val);
      };
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') { nameEl.textContent = curName; } });
      inp.addEventListener('blur', save);
    });
  });

  main.querySelectorAll('.pat-menu-note').forEach(item => {
    item.addEventListener('click', () => {
      item.closest('.pat-overflow-menu')?.classList.remove('open');
      const card       = item.closest('.pat-card');
      const notesArea  = card?.querySelector('.pat-card-notes-wrap');
      if (!notesArea) return;
      const existing   = notesArea.dataset.note ?? '';
      notesArea.innerHTML = `
        <textarea class="pat-notes-textarea" maxlength="200" placeholder="Add a note…">${existing}</textarea>
        <span class="pat-char-count">${200 - existing.length} characters remaining</span>`;
      const ta = notesArea.querySelector('textarea');
      ta.focus();
      ta.addEventListener('input', () => {
        notesArea.querySelector('.pat-char-count').textContent = `${200 - ta.value.length} characters remaining`;
      });
      ta.addEventListener('blur', async () => {
        const val = ta.value.trim();
        notesArea.dataset.note = val;
        notesArea.innerHTML = val ? `<p class="pat-card-note">${val}</p>` : '';
        await addPatternNote(item.dataset.purchaseId, user.id, val || null);
      });
    });
  });

  main.querySelectorAll('.pat-menu-archive').forEach(item => {
    item.addEventListener('click', async () => {
      item.closest('.pat-overflow-menu')?.classList.remove('open');
      await archivePattern(item.dataset.purchaseId, user.id);
      _showToast('Pattern archived');
      _renderPatterns(main, user, tab);
    });
  });

  main.querySelectorAll('.pat-menu-activate').forEach(item => {
    item.addEventListener('click', async () => {
      item.closest('.pat-overflow-menu')?.classList.remove('open');
      await restorePattern(item.dataset.purchaseId, user.id);
      _showToast('Moved to Active');
      _renderPatterns(main, user, tab);
    });
  });

  main.querySelectorAll('.pat-menu-trash').forEach(item => {
    item.addEventListener('click', () => {
      item.closest('.pat-overflow-menu')?.classList.remove('open');
      const garmentName = item.dataset.garmentName;
      const purchaseId  = item.dataset.purchaseId;
      _showTrashModal(user, purchaseId, garmentName, () => _renderPatterns(main, user, tab));
    });
  });

  // Fit feedback
  main.querySelectorAll('.pat-feedback-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const { purchaseId, garmentId, garmentName } = btn.dataset;
      _showFeedbackModal(user, purchaseId, garmentId, garmentName, () => _renderPatterns(main, user, tab));
    });
  });
}

// ── Pattern card HTML helper ──────────────────────────────────────────────────
function _patCardHtml(p, name, measurements, fmt, tab, days, urgent, feedbackSet = new Set()) {
  const meas     = measurements ?? {};
  const measKeys = ['chest', 'waist', 'hip', 'inseam', 'rise', 'length'];
  const measParts = measKeys
    .filter(k => meas[k])
    .map(k => `${meas[k]}″ ${k}`)
    .slice(0, 4);
  const measStr  = measParts.join(' · ');
  const noteHtml = p.notes ? `<p class="pat-card-note">${p.notes}</p>` : '';
  const genPart  = p.last_generated_at ? `, generated ${fmt(p.last_generated_at)}` : '';
  const meta     = `Purchased ${fmt(p.purchased_at)}${genPart}`;
  const hasMeas  = Object.keys(meas).length > 0;

  // Countdown for trash
  let countdownHtml = '';
  if (tab === 'trashed' && days !== null) {
    const cls = urgent ? 'pat-trash-countdown urgent' : 'pat-trash-countdown';
    const label = days === 1 ? 'Deleted in 1 day' : days === 0 ? 'Deletes today' : `Deleted in ${days} days`;
    countdownHtml = `<span class="${cls}">${label}</span>`;
  }

  // Action buttons
  let actionHtml;
  if (tab === 'trashed') {
    actionHtml = `
      <button class="acct-btn-sm pat-restore-btn" data-purchase-id="${p.id}">Restore</button>
      <button class="acct-btn-sm pat-btn-danger pat-delete-forever-btn"
        data-purchase-id="${p.id}"
        data-garment-name="${name}">Delete Forever</button>`;
  } else {
    const dlMenuItem = `<button class="pat-menu-item pat-menu-dl" data-garment-id="${p.garment_id}" data-purchase-id="${p.id}">Re-download PDF</button>
         <hr class="pat-menu-divider">`;
    const menuItems = tab === 'active'
      ? `${dlMenuItem}<button class="pat-menu-item pat-menu-rename" data-purchase-id="${p.id}" data-garment-id="${p.garment_id}">Rename</button>
         <button class="pat-menu-item pat-menu-note" data-purchase-id="${p.id}">Add note</button>
         <button class="pat-menu-item pat-menu-archive" data-purchase-id="${p.id}">Archive</button>
         <button class="pat-menu-item pat-menu-trash pat-menu-item-danger" data-purchase-id="${p.id}" data-garment-name="${name}">Move to Trash</button>`
      : `${dlMenuItem}<button class="pat-menu-item pat-menu-rename" data-purchase-id="${p.id}" data-garment-id="${p.garment_id}">Rename</button>
         <button class="pat-menu-item pat-menu-activate" data-purchase-id="${p.id}">Move to Active</button>
         <button class="pat-menu-item pat-menu-trash pat-menu-item-danger" data-purchase-id="${p.id}" data-garment-name="${name}">Move to Trash</button>`;

    const hasFeedback = feedbackSet.has(p.id);
    const fbBtn = tab === 'active'
      ? hasFeedback
        ? `<button class="acct-btn-xs pat-feedback-btn pat-feedback-done" data-purchase-id="${p.id}" data-garment-id="${p.garment_id}" data-garment-name="${name}">Fit: submitted ✓</button>`
        : `<button class="acct-btn-xs pat-feedback-btn" data-purchase-id="${p.id}" data-garment-id="${p.garment_id}" data-garment-name="${name}">How did it fit?</button>`
      : '';
    actionHtml = `
      <button class="acct-btn-xs pat-dl-btn" data-garment-id="${p.garment_id}" data-purchase-id="${p.id}">Re-download PDF</button>
      <button class="acct-btn-sm pat-regen-btn" data-garment-id="${p.garment_id}" data-purchase-id="${p.id}">Re-generate</button>
      ${fbBtn}
      <div class="pat-overflow-wrap">
        <button class="pat-overflow-btn" aria-label="More options">⋯</button>
        <div class="pat-overflow-menu">${menuItems}</div>
      </div>`;
  }

  return `<div class="pat-card"
    data-purchase-id="${p.id}"
    data-measurements="${JSON.stringify(meas).replace(/"/g, '&quot;')}"
    data-opts="${JSON.stringify(p.opts || {}).replace(/"/g, '&quot;')}"
    data-profile-name="${p.measurement_profiles?.name ?? ''}">
    <div class="pat-card-main">
      <div class="pat-card-info">
        <span class="pat-card-name">${name}</span>
        ${measStr ? `<span class="pat-card-meas">${measStr}</span>` : ''}
        <span class="pat-card-meta">${meta}</span>
        ${countdownHtml}
        <div class="pat-card-notes-wrap" data-note="${(p.notes ?? '').replace(/"/g, '&quot;')}">${noteHtml}</div>
      </div>
      <div class="pat-card-actions">${actionHtml}</div>
    </div>
  </div>`;
}

// ── 2b. My Projects ───────────────────────────────────────────────────────────
async function _renderProjects(main, user) {
  const [{ data, error }, { data: feedbackData }] = await Promise.all([
    getPatterns(user.id, 'all'),
    getFitFeedback(user.id),
  ]);
  if (error) { main.innerHTML = `<p class="acct-error">${error.message}</p>`; return; }

  const feedbackMap = new Map((feedbackData || []).map(f => [f.purchase_id, f]));
  const active = (data || []).filter(p => p.status !== 'trashed');
  const fmt = d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  let html = `<h2 class="acct-section-title">My Projects</h2>`;

  if (!active.length) {
    html += `<p class="acct-empty">No projects yet. Purchase a pattern to get started.</p>`;
    main.innerHTML = html;
    return;
  }

  html += `<div class="proj-card-list">`;
  for (const p of active) {
    const name       = p.display_name || p.garment_id.replace(/-/g, ' ');
    const meas       = p.measurement_profiles?.measurements ?? {};
    const profName   = p.measurement_profiles?.name ?? null;
    const fb         = feedbackMap.get(p.id);
    const fbBadge    = fb
      ? `<span class="proj-fb-badge proj-fb-${fb.overall_fit}">${fb.overall_fit.replace(/_/g,' ')}</span>`
      : `<span class="proj-fb-badge proj-fb-none">no feedback yet</span>`;
    const notePreview = p.notes
      ? `<p class="proj-note-preview">${p.notes.slice(0, 80)}${p.notes.length > 80 ? '…' : ''}</p>`
      : '';
    const hasMeas = Object.keys(meas).length > 0;

    html += `<div class="proj-card" data-purchase-id="${p.id}"
        data-garment-id="${p.garment_id}"
        data-measurements="${JSON.stringify(meas).replace(/"/g, '&quot;')}"
        data-profile-name="${profName ?? ''}">
      <div class="proj-card-top">
        <span class="proj-card-name">${name}</span>
        ${fbBadge}
      </div>
      <div class="proj-card-meta">
        <span>Purchased ${fmt(p.purchased_at)}</span>
        ${profName ? `<span>Profile: ${profName}</span>` : ''}
        ${p.last_generated_at ? `<span>Generated ${fmt(p.last_generated_at)}</span>` : ''}
      </div>
      ${notePreview}
      <div class="proj-card-actions">
        ${hasMeas ? `<button class="acct-btn-sm proj-sew-again" data-purchase-id="${p.id}" data-garment-id="${p.garment_id}">Sew Again</button>` : ''}
        ${!fb ? `<button class="acct-btn-xs pat-feedback-btn" data-purchase-id="${p.id}" data-garment-id="${p.garment_id}" data-garment-name="${name}">Rate fit</button>` : ''}
      </div>
    </div>`;
  }
  html += `</div>`;
  main.innerHTML = html;

  // Sew Again — re-generate with same measurements
  main.querySelectorAll('.proj-sew-again').forEach(btn => {
    btn.addEventListener('click', () => {
      const card     = btn.closest('.proj-card');
      const meas     = JSON.parse(card.dataset.measurements || '{}');
      const profName = card.dataset.profileName || '';
      _showRegenModal(user, card.dataset.garmentId, card.dataset.purchaseId, meas, profName,
        () => _renderProjects(main, user));
    });
  });

  // Feedback buttons
  main.querySelectorAll('.pat-feedback-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const { purchaseId, garmentId, garmentName } = btn.dataset;
      _showFeedbackModal(user, purchaseId, garmentId, garmentName, () => _renderProjects(main, user));
    });
  });
}

// ── Re-generate confirmation modal ───────────────────────────────────────────
function _showRegenModal(user, garmentId, purchaseId, measurements, profileName, onSuccess) {
  const name    = garmentId.replace(/-/g, ' ');
  const measKeys = ['chest', 'waist', 'hip', 'inseam', 'rise', 'length', 'thigh', 'knee'];
  const measRows = measKeys.filter(k => measurements[k])
    .map(k => `<div class="regen-meas-row"><span class="regen-meas-key">${k}</span><span class="regen-meas-val">${measurements[k]}″</span></div>`).join('');

  const { overlay, close } = _showModal({
    title: `Re-generate ${name}`,
    body: `
      <p class="pat-modal-text">This will draft a new pattern using your ${profileName ? `<strong>${profileName}</strong>` : 'current'} measurements.</p>
      ${measRows ? `<div class="regen-meas-grid">${measRows}</div>` : ''}
      <p class="pat-modal-text pat-modal-subtext">Your previous pattern will be moved to your archive automatically.</p>`,
    buttons: `<button class="pat-modal-cancel">Cancel</button>
      <button class="pat-modal-confirm" id="regen-confirm-btn">Re-generate Pattern</button>`,
  });

  overlay.querySelector('.pat-modal-cancel').addEventListener('click', close);
  const confirmBtn = overlay.querySelector('#regen-confirm-btn');
  confirmBtn.addEventListener('click', async () => {
    confirmBtn.disabled = true; confirmBtn.textContent = 'Generating…';
    try {
      const res  = await fetch('/api/regenerate-pattern', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ garmentId, userId: user.id, purchaseId, measurements, opts: {} }),
      });
      const json = await res.json();
      if (!res.ok || json.error) {
        confirmBtn.disabled = false; confirmBtn.textContent = 'Re-generate Pattern';
        _showToast('Error: ' + (json.error ?? res.statusText));
        return;
      }
      // Show success state
      overlay.querySelector('.pat-modal').innerHTML = `
        <h3 class="pat-modal-title">Pattern ready</h3>
        <p class="pat-modal-text" style="margin-bottom:1.2rem">Your new ${name} pattern is ready to download.</p>
        <div class="pat-modal-btns">
          <a class="pat-modal-confirm" href="${json.downloadUrl}" download="${garmentId}-pattern.pdf">Download Pattern</a>
          <button class="pat-modal-cancel" id="regen-done-btn">Done</button>
        </div>`;
      overlay.querySelector('#regen-done-btn').addEventListener('click', () => { close(); onSuccess(); });
      _showToast('Pattern regenerated');
    } catch {
      confirmBtn.disabled = false; confirmBtn.textContent = 'Re-generate Pattern';
      _showToast('Generation failed. Try again.');
    }
  });
}

// ── Move to Trash modal ───────────────────────────────────────────────────────
function _showTrashModal(user, purchaseId, garmentName, onSuccess) {
  const { overlay, close } = _showModal({
    title: 'Move to Trash?',
    body: `<p class="pat-modal-text">Your <strong>${garmentName}</strong> pattern will be moved to trash and permanently deleted in 30 days.</p>
           <p class="pat-modal-text">You can restore it any time before then from your Trash tab.</p>`,
    buttons: `<button class="pat-modal-cancel">Cancel</button>
      <button class="pat-modal-warn" id="trash-confirm-btn">Move to Trash</button>`,
  });
  overlay.querySelector('.pat-modal-cancel').addEventListener('click', close);
  overlay.querySelector('#trash-confirm-btn').addEventListener('click', async () => {
    await trashPattern(purchaseId, user.id);
    close(); _showToast('Moved to Trash'); onSuccess();
  });
}

// ── Delete Forever modal ──────────────────────────────────────────────────────
function _showDeleteForeverModal(user, purchaseId, garmentName, onSuccess) {
  const { overlay, close } = _showModal({
    title: 'Delete Forever?',
    body: `<p class="pat-modal-text">This will permanently delete your <strong>${garmentName}</strong> pattern. This cannot be undone.</p>
           <p class="pat-modal-text">If you want to sew this pattern again in the future, you will need to purchase it again.</p>
           <div class="pat-modal-field">
             <label class="pat-modal-field-label">Type DELETE to confirm</label>
             <input class="pat-modal-input" id="delete-confirm-input" placeholder="DELETE" autocomplete="off">
           </div>`,
    buttons: `<button class="pat-modal-cancel">Cancel</button>
      <button class="pat-modal-danger" id="delete-forever-btn" disabled>Delete Forever</button>`,
  });
  overlay.querySelector('.pat-modal-cancel').addEventListener('click', close);
  const delBtn = overlay.querySelector('#delete-forever-btn');
  overlay.querySelector('#delete-confirm-input').addEventListener('input', e => {
    delBtn.disabled = e.target.value.trim() !== 'DELETE';
  });
  delBtn.addEventListener('click', async () => {
    await permanentlyDeletePattern(purchaseId, user.id);
    close(); _showToast('Pattern deleted'); onSuccess();
  });
}

// ── Fit Feedback modal ────────────────────────────────────────────────────────
function _showFeedbackModal(user, purchaseId, garmentId, garmentName, onSuccess) {
  const OVERALL_OPTS = [
    { value: 'perfect',          label: 'Perfect — no changes needed' },
    { value: 'good',             label: 'Good — minor tweaks only' },
    { value: 'needs_adjustment', label: 'Needs adjustment — a few areas off' },
    { value: 'poor',             label: 'Poor — significant fitting issues' },
  ];
  const AREA_OPTS = [
    { key: 'chest_fit',  label: 'Chest'    },
    { key: 'waist_fit',  label: 'Waist'    },
    { key: 'hip_fit',    label: 'Hip'      },
    { key: 'length',     label: 'Length'   },
    { key: 'shoulder',   label: 'Shoulder' },
    { key: 'armhole',    label: 'Armhole'  },
    { key: 'thigh_fit',  label: 'Thigh'    },
  ];
  const AREA_VALS = ['perfect', 'too_tight', 'too_loose', 'too_long', 'too_short', 'n/a'];

  const overallSelect = `<select class="acct-input" id="fb-overall">
    <option value="">Select overall fit…</option>
    ${OVERALL_OPTS.map(o => `<option value="${o.value}">${o.label}</option>`).join('')}
  </select>`;

  const areaRows = AREA_OPTS.map(area => `
    <div class="acct-edit-row">
      <label class="acct-edit-lbl" style="width:72px">${area.label}</label>
      <select class="acct-input fb-area-select" data-key="${area.key}">
        <option value="">—</option>
        ${AREA_VALS.map(v => `<option value="${v}">${v.replace(/_/g, ' ')}</option>`).join('')}
      </select>
    </div>`).join('');

  const { overlay, close } = _showModal({
    title: `How did your ${garmentName} fit?`,
    body: `
      <div style="margin-bottom:14px">
        <label class="acct-edit-lbl" style="width:auto;display:block;margin-bottom:6px;font-size:.78rem;color:var(--mid)">Overall fit</label>
        ${overallSelect}
      </div>
      <div style="margin-bottom:14px">
        <p style="font-size:.75rem;color:var(--mid);margin:0 0 8px">Specific areas <span style="opacity:.6">(optional)</span></p>
        ${areaRows}
      </div>
      <div>
        <label class="acct-edit-lbl" style="width:auto;display:block;margin-bottom:6px;font-size:.78rem;color:var(--mid)">Notes <span style="opacity:.6">(optional)</span></label>
        <textarea class="acct-input" id="fb-notes" rows="3" maxlength="1000"
          placeholder="Fabric used, alterations made, what you'd change next time…"
          style="resize:vertical;min-height:60px"></textarea>
      </div>`,
    buttons: `<button class="acct-btn-sm" id="fb-submit-btn">Submit Feedback</button>
              <button class="acct-btn-sm acct-btn-ghost" id="fb-cancel-btn">Cancel</button>`,
  });

  overlay.querySelector('#fb-cancel-btn').addEventListener('click', close);
  overlay.querySelector('#fb-submit-btn').addEventListener('click', async () => {
    const overallFit = overlay.querySelector('#fb-overall').value;
    if (!overallFit) { overlay.querySelector('#fb-overall').focus(); return; }

    const specificFeedback = {};
    overlay.querySelectorAll('.fb-area-select').forEach(sel => {
      if (sel.value) specificFeedback[sel.dataset.key] = sel.value;
    });
    const notes = overlay.querySelector('#fb-notes').value.trim();

    const submitBtn = overlay.querySelector('#fb-submit-btn');
    submitBtn.disabled = true; submitBtn.textContent = 'Saving…';

    const { session } = await (await import('../lib/auth.js')).getSession();
    const res = await fetch('/api/submit-feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({ purchaseId, garmentId, overallFit, specificFeedback, notes }),
    });
    const json = await res.json();

    if (!res.ok) {
      submitBtn.disabled = false; submitBtn.textContent = 'Submit Feedback';
      _showToast('Error: ' + (json.error ?? 'Could not save feedback'));
      return;
    }

    // Replace modal content with thank-you
    overlay.querySelector('.pat-modal').innerHTML = `
      <h3 class="pat-modal-title">Thank you!</h3>
      <div class="pat-modal-body">
        <p class="pat-modal-text">Your fit feedback for <strong>${garmentName}</strong> has been saved. It helps us improve the pattern math for everyone.</p>
      </div>
      <div class="pat-modal-btns">
        <button class="pat-modal-cancel" id="fb-done-btn">Done</button>
      </div>`;
    overlay.querySelector('#fb-done-btn').addEventListener('click', () => { close(); onSuccess(); });
  });
}

// ── Wardrobe progress (shown at the top of My Patterns) ──────────────────────
const WARDROBE_CATEGORIES = [
  { key: 'shorts',    label: 'Shorts',    icon: '🩳', garments: ['cargo-shorts','gym-shorts','swim-trunks','pleated-shorts'] },
  { key: 'pants',     label: 'Pants',     icon: '👖', garments: ['straight-jeans','chinos','pleated-trousers','sweatpants','wide-leg-trouser-w','straight-trouser-w','easy-pant-w'] },
  { key: 'tops',      label: 'Tops',      icon: '👕', garments: ['tee','camp-shirt','crewneck','hoodie','crop-jacket','button-up-w','shell-blouse-w','fitted-tee-w'] },
  { key: 'skirts',    label: 'Skirts',    icon: '🌂', garments: ['slip-skirt-w','a-line-skirt-w'] },
  { key: 'dresses',   label: 'Dresses',   icon: '👗', garments: ['shirt-dress-w','wrap-dress-w'] },
];

const MILESTONES = [
  { count: 1,  msg: '1st pattern — welcome to custom fit!' },
  { count: 3,  msg: '3 patterns — building a wardrobe' },
  { count: 5,  msg: '5 patterns — capsule complete' },
  { count: 10, msg: '10 patterns — true custom wardrobe' },
];

function _wardrobeProgressHtml(purchasedGarmentIds) {
  const purchased = new Set(purchasedGarmentIds);
  const total     = purchased.size;
  if (!total) return '';

  // Milestone
  let milestone = null;
  for (const m of MILESTONES) {
    if (total >= m.count) milestone = m.msg;
  }

  // Category grid
  const catCells = WARDROBE_CATEGORIES.map(cat => {
    const owned = cat.garments.filter(g => purchased.has(g)).length;
    const hasCat = owned > 0;
    return `<div class="wrd-cat${hasCat ? ' wrd-cat-owned' : ''}">
      <span class="wrd-cat-icon">${cat.icon}</span>
      <span class="wrd-cat-label">${cat.label}</span>
      ${hasCat ? `<span class="wrd-cat-count">${owned}</span>` : ''}
    </div>`;
  }).join('');

  // Next suggested category
  const nextCat = WARDROBE_CATEGORIES.find(c => !c.garments.some(g => purchased.has(g)));
  const nextHint = nextCat
    ? `<p class="wrd-next">Complete your wardrobe: try a <strong>${nextCat.label.toLowerCase()}</strong> next.</p>`
    : '<p class="wrd-next">You\'ve covered every category — impressive wardrobe!</p>';

  return `<div class="wrd-wrap">
    ${milestone ? `<div class="wrd-milestone">${milestone}</div>` : ''}
    <div class="wrd-grid">${catCells}</div>
    ${nextHint}
  </div>`;
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
    const items = Array.isArray(o.items) ? o.items.map(i => i.garment_id || i).join(', ') : '-';
    const total = o.total_cents ? `$${(o.total_cents / 100).toFixed(2)}` : '-';
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
