// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Admin dashboard - garment tracking, revenue, funnel, fit feedback, popularity.
 * Only accessible to the admin email via Supabase RLS + client-side gate.
 */
import { getUser } from '../lib/auth.js';
import {
  getGarmentCatalog, updateGarment,
  getGarmentPhotos, getAllPhotos, uploadGarmentPhoto, deleteGarmentPhoto, getPhotoUrl,
  getRevenueStats, getRevenueByGarment,
  getFunnelStats, getAllFitFeedback, getPopularGarments,
} from '../lib/admin-db.js';

const ADMIN_EMAIL = 'kolbyboyd970@gmail.com';
const root = document.getElementById('admin-root');

const DEV_STATUSES = ['planned', 'drafting', 'code-complete', 'muslin-ready', 'validated', 'launched'];
const MUSLIN_STATUSES = ['not-started', 'cut', 'sewn', 'fit-tested', 'adjustments-needed', 'approved'];
const PHOTO_TYPES = ['muslin-front', 'muslin-back', 'muslin-side', 'fit-issue', 'finished'];

// ── Status badge colors (colorblind-safe: blue/gold/teal, no red/green) ──────
const STATUS_COLORS = {
  // dev
  'planned':          { bg: '#e8e4dc', fg: '#6a6560' },
  'drafting':         { bg: '#dde8f0', fg: '#3a6a8a' },
  'code-complete':    { bg: '#e0ddf0', fg: '#5a4a8a' },
  'muslin-ready':     { bg: '#f0e8dd', fg: '#8a6a3a' },
  'validated':        { bg: '#ddf0e8', fg: '#3a7a6a' },
  'launched':         { bg: '#3a7a6a', fg: '#fff' },
  // muslin
  'not-started':      { bg: '#e8e4dc', fg: '#6a6560' },
  'cut':              { bg: '#dde8f0', fg: '#3a6a8a' },
  'sewn':             { bg: '#e0ddf0', fg: '#5a4a8a' },
  'fit-tested':       { bg: '#f0e8dd', fg: '#8a6a3a' },
  'adjustments-needed': { bg: '#f0dddd', fg: '#8a4a4a' },
  'approved':         { bg: '#3a7a6a', fg: '#fff' },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function badge(status) {
  const c = STATUS_COLORS[status] || { bg: '#e8e4dc', fg: '#6a6560' };
  return `<span style="display:inline-block;padding:2px 8px;border-radius:3px;font-size:.68rem;font-weight:600;background:${c.bg};color:${c.fg}">${status}</span>`;
}

function $(sel, el = document) { return el.querySelector(sel); }

function money(cents) { return '$' + (cents / 100).toFixed(2); }

function toast(msg) {
  const t = document.createElement('div');
  t.textContent = msg;
  t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#4a8a5a;color:#fff;padding:8px 18px;border-radius:4px;font-family:"IBM Plex Mono",monospace;font-size:.78rem;z-index:9999;opacity:1;transition:opacity .4s ease .6s;pointer-events:none';
  document.body.appendChild(t);
  requestAnimationFrame(() => requestAnimationFrame(() => { t.style.opacity = '0'; }));
  setTimeout(() => t.remove(), 1200);
}

function selectHtml(name, value, options) {
  return `<select data-field="${name}" style="font-family:'IBM Plex Mono',monospace;font-size:.72rem;padding:2px 4px;border:1px solid var(--bdr);border-radius:3px;background:var(--ibg);color:var(--text)">
    ${options.map(o => `<option value="${o}"${o === value ? ' selected' : ''}>${o}</option>`).join('')}
  </select>`;
}

// ── Auth gate ────────────────────────────────────────────────────────────────

async function init() {
  const { user } = await getUser();
  if (!user || user.email !== ADMIN_EMAIL) {
    root.innerHTML = '<p style="text-align:center;padding:60px 0;color:var(--mid)">Not authorized.</p>';
    return;
  }
  render();
}

// ── Main render ──────────────────────────────────────────────────────────────

async function render() {
  root.innerHTML = '<div style="text-align:center;padding:40px 0;color:var(--mid);font-size:.83rem;">Loading dashboard...</div>';

  const [catalogRes, revenueRes, funnelRes, feedbackRes, popularRes, photosRes] = await Promise.all([
    getGarmentCatalog(),
    getRevenueStats(),
    getFunnelStats(),
    getAllFitFeedback(),
    getPopularGarments(),
    getAllPhotos(),
  ]);

  const catalog = catalogRes.data;
  const revenue = revenueRes.data;
  const funnel = funnelRes.data;
  const feedback = feedbackRes.data;
  const popular = popularRes.data;
  const allPhotos = photosRes.data;

  // Build photo lookup by garment
  const photosByGarment = {};
  for (const p of allPhotos) {
    if (!photosByGarment[p.garment_id]) photosByGarment[p.garment_id] = [];
    photosByGarment[p.garment_id].push(p);
  }

  const launchMuslins = catalog.filter(g =>
    ['cargo-shorts', 'straight-jeans', 'tee', 'camp-shirt', 'a-line-skirt-w', 'wide-leg-trouser-w'].includes(g.id)
  );

  root.innerHTML = `
    <h1 style="font-family:'Fraunces',serif;font-size:1.6rem;font-weight:300;margin-bottom:8px;">Admin Dashboard</h1>
    <p style="font-size:.72rem;color:var(--mid);margin-bottom:32px;">Garment tracking, revenue, and analytics</p>

    ${renderNavTabs()}
    <div id="admin-section-launch">${renderLaunchTracker(launchMuslins, photosByGarment)}</div>
    <div id="admin-section-revenue" hidden>${renderRevenue(revenue)}</div>
    <div id="admin-section-funnel" hidden>${renderFunnel(funnel)}</div>
    <div id="admin-section-feedback" hidden>${renderFeedback(feedback)}</div>
    <div id="admin-section-popular" hidden>${renderPopular(popular)}</div>
    <div id="admin-section-catalog" hidden>${renderCatalog(catalog)}</div>
  `;

  wireNavTabs();
  wireLaunchTracker(launchMuslins);
  wireCatalog(catalog);
}

// ── Nav tabs ─────────────────────────────────────────────────────────────────

function renderNavTabs() {
  const tabs = [
    { id: 'launch', label: 'Launch Muslins' },
    { id: 'revenue', label: 'Revenue' },
    { id: 'funnel', label: 'Funnel' },
    { id: 'feedback', label: 'Fit Feedback' },
    { id: 'popular', label: 'Popular' },
    { id: 'catalog', label: 'Full Catalog' },
  ];
  return `<nav style="display:flex;gap:4px;margin-bottom:24px;flex-wrap:wrap">
    ${tabs.map((t, i) => `<button class="adm-tab" data-tab="${t.id}" style="padding:6px 14px;border:1px solid var(--bdr);border-radius:3px;background:${i === 0 ? 'var(--text)' : 'var(--card)'};color:${i === 0 ? 'var(--card)' : 'var(--text)'};font-family:'IBM Plex Mono',monospace;font-size:.72rem;cursor:pointer">${t.label}</button>`).join('')}
  </nav>`;
}

function wireNavTabs() {
  const tabs = root.querySelectorAll('.adm-tab');
  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      tabs.forEach(b => { b.style.background = 'var(--card)'; b.style.color = 'var(--text)'; });
      btn.style.background = 'var(--text)';
      btn.style.color = 'var(--card)';
      root.querySelectorAll('[id^="admin-section-"]').forEach(s => s.hidden = true);
      const section = $(`#admin-section-${btn.dataset.tab}`);
      if (section) section.hidden = false;
    });
  });
}

// ── Section: Launch Tracker ──────────────────────────────────────────────────

function renderLaunchTracker(muslins, photosByGarment) {
  return `
    <h2 style="font-family:'Fraunces',serif;font-size:1.1rem;font-weight:300;margin-bottom:16px;">Launch Muslins (6)</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px">
      ${muslins.map(g => {
        const photos = photosByGarment[g.id] ?? [];
        return `
        <div class="adm-card" data-garment="${g.id}" style="border:1px solid var(--bdr);border-radius:6px;padding:16px;background:var(--card)">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
            <strong style="font-size:.83rem">${g.name}</strong>
            ${badge(g.muslin_status)}
          </div>
          <div style="margin-bottom:8px">
            <label style="font-size:.68rem;color:var(--mid)">Muslin status</label>
            ${selectHtml('muslin_status', g.muslin_status, MUSLIN_STATUSES)}
          </div>
          <div style="margin-bottom:8px">
            <label style="font-size:.68rem;color:var(--mid)">Dev status</label>
            ${selectHtml('dev_status', g.dev_status, DEV_STATUSES)}
          </div>
          <div style="margin-bottom:8px">
            <label style="font-size:.68rem;color:var(--mid)">Notes</label>
            <textarea data-field="muslin_notes" rows="2" style="width:100%;font-family:'IBM Plex Mono',monospace;font-size:.72rem;padding:4px 6px;border:1px solid var(--bdr);border-radius:3px;background:var(--ibg);color:var(--text);resize:vertical">${g.muslin_notes ?? ''}</textarea>
          </div>
          <div style="margin-bottom:8px">
            <label style="font-size:.68rem;color:var(--mid)">Photos</label>
            <div class="adm-photos" style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px">
              ${photos.map(p => `
                <div style="position:relative">
                  <img src="${getPhotoUrl(p.storage_path)}" style="width:60px;height:60px;object-fit:cover;border-radius:3px;border:1px solid var(--bdr)" title="${p.photo_type}${p.caption ? ' - ' + p.caption : ''}">
                  <button data-del-photo="${p.id}" data-del-path="${p.storage_path}" style="position:absolute;top:-4px;right:-4px;width:16px;height:16px;border-radius:50%;border:none;background:var(--text);color:var(--card);font-size:10px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center" title="Delete">x</button>
                </div>
              `).join('')}
            </div>
            <div style="margin-top:6px;display:flex;gap:6px;align-items:center;flex-wrap:wrap">
              <select class="adm-photo-type" style="font-family:'IBM Plex Mono',monospace;font-size:.68rem;padding:2px 4px;border:1px solid var(--bdr);border-radius:3px;background:var(--ibg);color:var(--text)">
                ${PHOTO_TYPES.map(t => `<option value="${t}">${t}</option>`).join('')}
              </select>
              <label style="font-size:.68rem;padding:3px 8px;border:1px solid var(--bdr);border-radius:3px;cursor:pointer;background:var(--ibg)">
                Upload <input type="file" accept="image/*" class="adm-photo-input" style="display:none">
              </label>
            </div>
          </div>
        </div>`;
      }).join('')}
    </div>`;
}

function wireLaunchTracker(muslins) {
  for (const g of muslins) {
    const card = $(`.adm-card[data-garment="${g.id}"]`);
    if (!card) continue;

    // Status dropdowns
    card.querySelectorAll('select[data-field]').forEach(sel => {
      sel.addEventListener('change', async () => {
        const { error } = await updateGarment(g.id, { [sel.dataset.field]: sel.value });
        if (error) toast('Save failed: ' + error.message);
        else toast('Saved');
      });
    });

    // Notes
    const notes = $('textarea[data-field="muslin_notes"]', card);
    if (notes) {
      let timeout;
      notes.addEventListener('input', () => {
        clearTimeout(timeout);
        timeout = setTimeout(async () => {
          const { error } = await updateGarment(g.id, { muslin_notes: notes.value });
          if (error) toast('Save failed');
          else toast('Notes saved');
        }, 800);
      });
    }

    // Photo upload
    const fileInput = $('.adm-photo-input', card);
    if (fileInput) {
      fileInput.addEventListener('change', async () => {
        const file = fileInput.files[0];
        if (!file) return;
        const photoType = $('.adm-photo-type', card).value;
        toast('Uploading...');
        const { error } = await uploadGarmentPhoto(g.id, photoType, file);
        if (error) toast('Upload failed: ' + error.message);
        else { toast('Photo uploaded'); render(); }
      });
    }

    // Photo delete
    card.querySelectorAll('[data-del-photo]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const { error } = await deleteGarmentPhoto(btn.dataset.delPhoto, btn.dataset.delPath);
        if (error) toast('Delete failed');
        else { toast('Photo deleted'); render(); }
      });
    });
  }
}

// ── Section: Revenue ─────────────────────────────────────────────────────────

function renderRevenue(rev) {
  if (!rev) return '<p style="color:var(--mid);font-size:.83rem">No revenue data yet.</p>';
  return `
    <h2 style="font-family:'Fraunces',serif;font-size:1.1rem;font-weight:300;margin-bottom:16px;">Revenue & Orders</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px;margin-bottom:24px">
      ${[
        ['Today', money(rev.today)],
        ['This week', money(rev.week)],
        ['This month', money(rev.month)],
        ['All time', money(rev.total)],
        ['Total orders', rev.count],
      ].map(([label, val]) => `
        <div style="border:1px solid var(--bdr);border-radius:6px;padding:12px;background:var(--card);text-align:center">
          <div style="font-size:.68rem;color:var(--mid);margin-bottom:4px">${label}</div>
          <div style="font-size:1.1rem;font-weight:600">${val}</div>
        </div>
      `).join('')}
    </div>
    <h3 style="font-size:.83rem;font-weight:600;margin-bottom:8px">Recent orders</h3>
    <table style="width:100%;border-collapse:collapse;font-size:.72rem;margin-bottom:24px">
      <thead><tr style="text-align:left;border-bottom:1px solid var(--bdr)">
        <th style="padding:4px 8px">Garment</th><th style="padding:4px 8px">Amount</th><th style="padding:4px 8px">Date</th>
      </tr></thead>
      <tbody>
        ${rev.recent.map(o => `<tr style="border-bottom:1px solid var(--bdr)">
          <td style="padding:4px 8px">${o.garment_id}</td>
          <td style="padding:4px 8px">${money(o.amount ?? 0)}</td>
          <td style="padding:4px 8px;color:var(--mid)">${new Date(o.purchased_at).toLocaleDateString()}</td>
        </tr>`).join('')}
        ${rev.recent.length === 0 ? '<tr><td colspan="3" style="padding:8px;color:var(--mid)">No orders yet</td></tr>' : ''}
      </tbody>
    </table>`;
}

// ── Section: Funnel ──────────────────────────────────────────────────────────

function renderFunnel(f) {
  if (!f) return '<p style="color:var(--mid);font-size:.83rem">No data.</p>';
  const convRate = f.users > 0 ? ((f.purchases / f.users) * 100).toFixed(1) : '0.0';
  return `
    <h2 style="font-family:'Fraunces',serif;font-size:1.1rem;font-weight:300;margin-bottom:16px;">User & Funnel Stats</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px">
      ${[
        ['Registered users', f.users],
        ['Total purchases', f.purchases],
        ['Newsletter subs', f.newsletter],
        ['Conversion rate', convRate + '%'],
      ].map(([label, val]) => `
        <div style="border:1px solid var(--bdr);border-radius:6px;padding:12px;background:var(--card);text-align:center">
          <div style="font-size:.68rem;color:var(--mid);margin-bottom:4px">${label}</div>
          <div style="font-size:1.1rem;font-weight:600">${val}</div>
        </div>
      `).join('')}
    </div>`;
}

// ── Section: Fit Feedback ────────────────────────────────────────────────────

function renderFeedback(fb) {
  return `
    <h2 style="font-family:'Fraunces',serif;font-size:1.1rem;font-weight:300;margin-bottom:16px;">Fit Feedback Inbox (${fb.length})</h2>
    ${fb.length === 0 ? '<p style="color:var(--mid);font-size:.83rem">No feedback yet.</p>' : `
    <table style="width:100%;border-collapse:collapse;font-size:.72rem">
      <thead><tr style="text-align:left;border-bottom:1px solid var(--bdr)">
        <th style="padding:4px 8px">Garment</th>
        <th style="padding:4px 8px">Overall</th>
        <th style="padding:4px 8px">Details</th>
        <th style="padding:4px 8px">Notes</th>
        <th style="padding:4px 8px">Date</th>
      </tr></thead>
      <tbody>
        ${fb.map(f => {
          const garment = f.purchases?.garment_id ?? 'unknown';
          const details = f.specific_feedback
            ? Object.entries(f.specific_feedback).map(([k, v]) => `${k}: ${v}`).join(', ')
            : '';
          return `<tr style="border-bottom:1px solid var(--bdr)">
            <td style="padding:4px 8px;font-weight:600">${garment}</td>
            <td style="padding:4px 8px">${badge(f.overall_fit ?? 'n/a')}</td>
            <td style="padding:4px 8px;max-width:300px;overflow:hidden;text-overflow:ellipsis">${details}</td>
            <td style="padding:4px 8px;color:var(--mid);max-width:200px;overflow:hidden;text-overflow:ellipsis">${f.notes ?? ''}</td>
            <td style="padding:4px 8px;color:var(--mid);white-space:nowrap">${new Date(f.created_at).toLocaleDateString()}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>`}`;
}

// ── Section: Popular Garments ────────────────────────────────────────────────

function renderPopular(pop) {
  return `
    <h2 style="font-family:'Fraunces',serif;font-size:1.1rem;font-weight:300;margin-bottom:16px;">Popular Garments</h2>
    ${pop.length === 0 ? '<p style="color:var(--mid);font-size:.83rem">No data yet.</p>' : `
    <table style="width:100%;border-collapse:collapse;font-size:.72rem">
      <thead><tr style="text-align:left;border-bottom:1px solid var(--bdr)">
        <th style="padding:4px 8px">Garment</th>
        <th style="padding:4px 8px;text-align:right">Purchases</th>
        <th style="padding:4px 8px;text-align:right">Wishlisted</th>
      </tr></thead>
      <tbody>
        ${pop.map(g => `<tr style="border-bottom:1px solid var(--bdr)">
          <td style="padding:4px 8px;font-weight:600">${g.garment_id}</td>
          <td style="padding:4px 8px;text-align:right">${g.purchases}</td>
          <td style="padding:4px 8px;text-align:right">${g.wishlisted}</td>
        </tr>`).join('')}
      </tbody>
    </table>`}`;
}

// ── Section: Full Catalog ────────────────────────────────────────────────────

function renderCatalog(catalog) {
  const tiers = [
    { tier: 0, label: 'Existing (code-complete)' },
    { tier: 1, label: 'Tier 1 - Beginner, fast to build' },
    { tier: 2, label: 'Tier 2 - Intermediate, some new geometry' },
    { tier: 3, label: 'Tier 3 - Advanced/expert, significant engine work' },
    { tier: 4, label: 'Tier 4 - Niche/novelty/seasonal' },
  ];

  return `
    <h2 style="font-family:'Fraunces',serif;font-size:1.1rem;font-weight:300;margin-bottom:16px;">Full Catalog (${catalog.length} garments)</h2>
    <div style="margin-bottom:16px;display:flex;gap:8px;flex-wrap:wrap;align-items:center">
      <label style="font-size:.68rem;color:var(--mid)">Filter:</label>
      <select id="adm-filter-tier" style="font-family:'IBM Plex Mono',monospace;font-size:.72rem;padding:2px 4px;border:1px solid var(--bdr);border-radius:3px;background:var(--ibg);color:var(--text)">
        <option value="">All tiers</option>
        ${tiers.map(t => `<option value="${t.tier}">Tier ${t.tier}</option>`).join('')}
      </select>
      <select id="adm-filter-dev" style="font-family:'IBM Plex Mono',monospace;font-size:.72rem;padding:2px 4px;border:1px solid var(--bdr);border-radius:3px;background:var(--ibg);color:var(--text)">
        <option value="">All dev status</option>
        ${DEV_STATUSES.map(s => `<option value="${s}">${s}</option>`).join('')}
      </select>
      <select id="adm-filter-muslin" style="font-family:'IBM Plex Mono',monospace;font-size:.72rem;padding:2px 4px;border:1px solid var(--bdr);border-radius:3px;background:var(--ibg);color:var(--text)">
        <option value="">All muslin status</option>
        ${MUSLIN_STATUSES.map(s => `<option value="${s}">${s}</option>`).join('')}
      </select>
    </div>
    ${tiers.map(({ tier, label }) => {
      const items = catalog.filter(g => g.tier === tier);
      if (items.length === 0) return '';
      return `
        <div class="adm-tier-group" data-tier="${tier}">
          <h3 style="font-size:.83rem;font-weight:600;margin:20px 0 8px;color:var(--mid)">${label} (${items.length})</h3>
          <table style="width:100%;border-collapse:collapse;font-size:.72rem;margin-bottom:8px">
            <thead><tr style="text-align:left;border-bottom:1px solid var(--bdr)">
              <th style="padding:4px 8px">Name</th>
              <th style="padding:4px 8px">Category</th>
              <th style="padding:4px 8px">Difficulty</th>
              <th style="padding:4px 8px">Dev</th>
              <th style="padding:4px 8px">Muslin</th>
              <th style="padding:4px 8px">Engine needs</th>
            </tr></thead>
            <tbody>
              ${items.map(g => `<tr class="adm-catalog-row" data-garment="${g.id}" style="border-bottom:1px solid var(--bdr);cursor:pointer" title="Click to expand">
                <td style="padding:4px 8px;font-weight:600">${g.name}</td>
                <td style="padding:4px 8px">${g.category}</td>
                <td style="padding:4px 8px">${g.difficulty ?? ''}</td>
                <td style="padding:4px 8px">${badge(g.dev_status)}</td>
                <td style="padding:4px 8px">${badge(g.muslin_status)}</td>
                <td style="padding:4px 8px;color:var(--mid);max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${g.engine_needs ?? ''}</td>
              </tr>
              <tr class="adm-catalog-detail" data-detail-for="${g.id}" hidden>
                <td colspan="6" style="padding:8px 12px;background:var(--ibg)">
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;max-width:600px">
                    <div>
                      <label style="font-size:.68rem;color:var(--mid)">Dev status</label>
                      ${selectHtml('dev_status', g.dev_status, DEV_STATUSES)}
                    </div>
                    <div>
                      <label style="font-size:.68rem;color:var(--mid)">Muslin status</label>
                      ${selectHtml('muslin_status', g.muslin_status, MUSLIN_STATUSES)}
                    </div>
                    <div style="grid-column:1/-1">
                      <label style="font-size:.68rem;color:var(--mid)">Notes</label>
                      <textarea data-field="muslin_notes" rows="2" style="width:100%;font-family:'IBM Plex Mono',monospace;font-size:.72rem;padding:4px 6px;border:1px solid var(--bdr);border-radius:3px;background:var(--card);color:var(--text);resize:vertical">${g.muslin_notes ?? ''}</textarea>
                    </div>
                    ${g.freesewing_ref ? `<div style="grid-column:1/-1"><span style="font-size:.68rem;color:var(--mid)">FreeSewing ref:</span> <span style="font-size:.72rem">${g.freesewing_ref}</span></div>` : ''}
                  </div>
                </td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>`;
    }).join('')}`;
}

function wireCatalog(catalog) {
  // Row expand/collapse
  root.querySelectorAll('.adm-catalog-row').forEach(row => {
    row.addEventListener('click', () => {
      const detail = $(`[data-detail-for="${row.dataset.garment}"]`);
      if (detail) detail.hidden = !detail.hidden;
    });
  });

  // Inline editing in detail rows
  root.querySelectorAll('.adm-catalog-detail').forEach(detail => {
    const gid = detail.dataset.detailFor;

    detail.querySelectorAll('select[data-field]').forEach(sel => {
      sel.addEventListener('change', async () => {
        const { error } = await updateGarment(gid, { [sel.dataset.field]: sel.value });
        if (error) toast('Save failed');
        else toast('Saved');
      });
      // Stop click from collapsing the row
      sel.addEventListener('click', e => e.stopPropagation());
    });

    const notes = $('textarea[data-field="muslin_notes"]', detail);
    if (notes) {
      let timeout;
      notes.addEventListener('input', () => {
        clearTimeout(timeout);
        timeout = setTimeout(async () => {
          const { error } = await updateGarment(gid, { muslin_notes: notes.value });
          if (error) toast('Save failed');
          else toast('Notes saved');
        }, 800);
      });
      notes.addEventListener('click', e => e.stopPropagation());
    }
  });

  // Filters
  const filterTier = $('#adm-filter-tier');
  const filterDev = $('#adm-filter-dev');
  const filterMuslin = $('#adm-filter-muslin');

  function applyFilters() {
    const tier = filterTier.value;
    const dev = filterDev.value;
    const muslin = filterMuslin.value;

    root.querySelectorAll('.adm-tier-group').forEach(group => {
      if (tier !== '' && group.dataset.tier !== tier) { group.hidden = true; return; }
      group.hidden = false;
    });

    root.querySelectorAll('.adm-catalog-row').forEach(row => {
      const g = catalog.find(c => c.id === row.dataset.garment);
      if (!g) return;
      let show = true;
      if (tier !== '' && String(g.tier) !== tier) show = false;
      if (dev && g.dev_status !== dev) show = false;
      if (muslin && g.muslin_status !== muslin) show = false;
      row.hidden = !show;
      const detail = $(`[data-detail-for="${g.id}"]`);
      if (detail && !show) detail.hidden = true;
    });
  }

  if (filterTier) filterTier.addEventListener('change', applyFilters);
  if (filterDev) filterDev.addEventListener('change', applyFilters);
  if (filterMuslin) filterMuslin.addEventListener('change', applyFilters);
}

// ── Boot ─────────────────────────────────────────────────────────────────────
init();
