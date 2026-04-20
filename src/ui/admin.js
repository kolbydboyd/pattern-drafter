// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Admin dashboard - garment tracking, revenue, funnel, fit feedback,
 * popularity, and roadmap reference sections.
 * Only accessible to the admin email via Supabase RLS + client-side gate.
 */
import { getUser } from '../lib/auth.js';
import { BUNDLES, PATTERN_PRICES } from '../lib/pricing.js';
import { ARTICLES } from '../content/articles.js';
import { getMeasurementProfiles, saveMeasurementProfile, updateMeasurementProfile } from '../lib/db.js';
import { MEASUREMENTS } from '../engine/measurements.js';
import {
  getGarmentCatalog, updateGarment,
  getGarmentPhotos, getAllPhotos, uploadGarmentPhoto, deleteGarmentPhoto, getPhotoUrl,
  getRevenueStats, getRevenueByGarment,
  getFunnelStats, getAllFitFeedback, getPopularGarments,
  getContentPipeline, createContentItem, updateContentItem, deleteContentItem,
  getPinterestPinStats,
} from '../lib/admin-db.js';

const ADMIN_EMAIL = 'kolbyboyd970@gmail.com';
const root = document.getElementById('admin-root');

const DEV_STATUSES = ['planned', 'drafting', 'code-complete', 'muslin-ready', 'validated', 'launched'];
const MUSLIN_STATUSES = ['not-started', 'cut', 'sewn', 'fit-tested', 'adjustments-needed', 'approved'];
const PHOTO_TYPES = ['muslin-front', 'muslin-back', 'muslin-side', 'fit-issue', 'finished'];

// ── Theme ────────────────────────────────────────────────────────────────────

function getSavedTheme() {
  try { return localStorage.getItem('theme'); } catch { return null; }
}

function applyTheme(dark) {
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
}

const _saved = getSavedTheme();
applyTheme(_saved !== null ? _saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches);

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
  if (getSavedTheme() === null) applyTheme(e.matches);
});

document.getElementById('adm-theme-btn')?.addEventListener('click', () => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const next = !isDark;
  localStorage.setItem('theme', next ? 'dark' : 'light');
  applyTheme(next);
});

// ── Helpers ──────────────────────────────────────────────────────────────────

function badge(status) {
  const cls = (status || '').replace(/\s+/g, '-');
  return `<span class="adm-badge adm-badge--${cls}">${status}</span>`;
}

function $(sel, el = document) { return el.querySelector(sel); }

function money(cents) { return '$' + (cents / 100).toFixed(2); }

function toast(msg) {
  const t = document.createElement('div');
  t.textContent = msg;
  t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--gold);color:#fff;padding:8px 18px;border-radius:4px;font-family:"IBM Plex Mono",monospace;font-size:.78rem;z-index:9999;opacity:1;transition:opacity .4s ease .6s;pointer-events:none';
  document.body.appendChild(t);
  requestAnimationFrame(() => requestAnimationFrame(() => { t.style.opacity = '0'; }));
  setTimeout(() => t.remove(), 1200);
}

function selectHtml(name, value, options) {
  return `<select data-field="${name}" class="adm-select">
    ${options.map(o => `<option value="${o}"${o === value ? ' selected' : ''}>${o}</option>`).join('')}
  </select>`;
}

function progress(current, goal) {
  const pct = Math.min(100, Math.max(0, (current / goal) * 100));
  return `<div class="adm-progress"><div class="adm-progress-fill" style="width:${pct.toFixed(1)}%"></div></div>`;
}

// ── Launch checklist (persisted in localStorage) ─────────────────────────────

function getChecklist() {
  try { return JSON.parse(localStorage.getItem('adm-checklist') || '{}'); } catch { return {}; }
}
function setCheckItem(key, done) {
  const cl = getChecklist();
  cl[key] = done;
  try { localStorage.setItem('adm-checklist', JSON.stringify(cl)); } catch {}
}

// ── Auth gate ────────────────────────────────────────────────────────────────

async function init() {
  const { user } = await getUser();
  if (!user || user.email !== ADMIN_EMAIL) {
    root.innerHTML = '<p style="text-align:center;padding:60px 0;color:var(--mid)">Not authorized.</p>';
    return;
  }
  render(user);
}

// ── Main render ──────────────────────────────────────────────────────────────

let _adminUser = null;

async function render(user) {
  if (user) _adminUser = user;
  root.innerHTML = '<div style="text-align:center;padding:40px 0;color:var(--mid);font-size:.83rem;">Loading dashboard...</div>';

  const [catalogRes, revenueRes, funnelRes, feedbackRes, popularRes, photosRes, pipelineRes, pinStatsRes, profilesRes] = await Promise.all([
    getGarmentCatalog(),
    getRevenueStats(),
    getFunnelStats(),
    getAllFitFeedback(),
    getPopularGarments(),
    getAllPhotos(),
    getContentPipeline(_adminUser.id),
    getPinterestPinStats(),
    getMeasurementProfiles(_adminUser.id),
  ]);

  const catalog = catalogRes.data;
  const revenue = revenueRes.data;
  const funnel = funnelRes.data;
  const feedback = feedbackRes.data;
  const popular = popularRes.data;
  const allPhotos = photosRes.data;
  const pipeline = pipelineRes.data;
  const pinStats = pinStatsRes.data;
  const myProfiles = profilesRes.data ?? [];

  const photosByGarment = {};
  for (const p of allPhotos) {
    if (!photosByGarment[p.garment_id]) photosByGarment[p.garment_id] = [];
    photosByGarment[p.garment_id].push(p);
  }

  const launchMuslins = catalog.filter(g =>
    ['cargo-shorts', 'straight-jeans', 'tee', 'camp-shirt', 'a-line-skirt-w', 'wide-leg-trouser-w'].includes(g.id)
  );

  const built = catalog.filter(g => g.tier === 0).length;
  const total = catalog.length;
  const muslinsPending = launchMuslins.filter(g => g.muslin_status !== 'approved').length;

  const tabs = [
    { id: 'north-star', label: 'North Star' },
    { id: 'launch', label: 'Launch' },
    { id: 'revenue', label: 'Revenue' },
    { id: 'funnel', label: 'Funnel' },
    { id: 'feedback', label: 'Feedback' },
    { id: 'popular', label: 'Popular' },
    { id: 'catalog', label: 'Catalog' },
    { id: 'build-order', label: 'Build Order' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'market', label: 'Market' },
    { id: 'content', label: 'Content' },
    { id: 'reference', label: 'Reference' },
    { id: 'founders-select', label: "Founder's Select" },
  ];

  root.innerHTML = `
    <div class="adm-hero">
      <h1>Admin Dashboard</h1>
      <p class="adm-hero-sub">Garment tracking, revenue, analytics, and roadmap</p>
      <div class="adm-summary">
        <span><strong>${built}</strong> built</span>
        <span><strong>${total}</strong> total catalog</span>
        <span><strong>${muslinsPending}</strong> muslins pending</span>
        <span><strong>${revenue?.count ?? 0}</strong> orders</span>
        <span><strong>${funnel?.users ?? 0}</strong> users</span>
      </div>
    </div>

    <nav class="adm-tabs">
      ${tabs.map((t, i) => `<button class="adm-tab${i === 0 ? ' adm-tab--active' : ''}" data-tab="${t.id}">${t.label}</button>`).join('')}
    </nav>

    <div id="adm-s-north-star">${renderNorthStar(revenue)}</div>
    <div id="adm-s-launch" hidden>${renderLaunchTracker(launchMuslins, photosByGarment)}</div>
    <div id="adm-s-revenue" hidden>${renderRevenue(revenue)}</div>
    <div id="adm-s-funnel" hidden>${renderFunnel(funnel)}</div>
    <div id="adm-s-feedback" hidden>${renderFeedback(feedback)}</div>
    <div id="adm-s-popular" hidden>${renderPopular(popular)}</div>
    <div id="adm-s-catalog" hidden>${renderCatalog(catalog)}</div>
    <div id="adm-s-build-order" hidden>${renderBuildOrder(catalog)}</div>
    <div id="adm-s-pricing" hidden>${renderPricing()}</div>
    <div id="adm-s-market" hidden>${renderMarket()}</div>
    <div id="adm-s-content" hidden>${renderContent(pipeline, pinStats)}</div>
    <div id="adm-s-reference" hidden>${renderReference()}</div>
    <div id="adm-s-founders-select" hidden>${renderFoundersSelect(myProfiles)}</div>
  `;

  wireNavTabs();
  wireLaunchTracker(launchMuslins);
  wireCatalog(catalog);
  wireChecklists();
  wireContentPipeline(pipeline);
  wireFoundersSelect();
}

// ── Nav tabs ─────────────────────────────────────────────────────────────────

function wireNavTabs() {
  const tabs = root.querySelectorAll('.adm-tab');
  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      tabs.forEach(b => b.classList.remove('adm-tab--active'));
      btn.classList.add('adm-tab--active');
      root.querySelectorAll('[id^="adm-s-"]').forEach(s => s.hidden = true);
      const section = $(`#adm-s-${btn.dataset.tab}`);
      if (section) section.hidden = false;
    });
  });
}

// ── Section: North Star ──────────────────────────────────────────────────────

function renderNorthStar(revenue) {
  const totalRev = revenue?.total ?? 0;
  const targets = [
    { label: 'Break even', goal: 300000 },
    { label: 'Meaningful income', goal: 5000000 },
    { label: 'Life-changing', goal: 12000000 },
    { label: 'Ceiling w/o team', goal: 30000000 },
  ];
  return `
    <h2 class="adm-section-title">North Star</h2>
    <div class="adm-roadmap-card">
      <h3>Positioning</h3>
      <p><span class="adm-gold">"The easiest way for home sewists to make clothes that actually fit their body."</span></p>
      <p>The gap between a $20 generic indie pattern that doesn't fit and a $150 custom-drafted pattern is completely uncontested. We own that gap at $9-19.</p>
    </div>

    <div class="adm-roadmap-card">
      <h3>Revenue Targets</h3>
      <p>All-time revenue: <strong class="adm-gold">${money(totalRev)}</strong></p>
      ${targets.map(t => `
        <div style="margin-bottom:10px">
          <div style="display:flex;justify-content:space-between;font-size:.72rem">
            <span>${t.label}</span>
            <span class="adm-gold">${money(t.goal)}</span>
          </div>
          ${progress(totalRev, t.goal)}
        </div>
      `).join('')}
    </div>

    <div class="adm-roadmap-card">
      <h3>The Data Play (2-3 year horizon)</h3>
      <p>As fit feedback accumulates - thousands of people reporting "waist right, hip too tight" - we build the most detailed real-body fit dataset in existence. No clothing brand, pattern company, or fabric manufacturer has this. It becomes a <strong>licensable asset</strong>.</p>
    </div>
  `;
}

// ── Section: Launch Tracker ──────────────────────────────────────────────────

function renderLaunchTracker(muslins, photosByGarment) {
  const checklist = getChecklist();
  const blockers = [
    { key: 'purchase-flow', label: 'Test full purchase flow end-to-end' },
    { key: 'print-layout', label: 'Test print layout at 1:1 scale' },
    { key: 'dns-cloudflare', label: 'Wire peoplespatterns.com to Cloudflare Pages' },
    { key: 'search-console', label: 'Set up Google Search Console + submit sitemap' },
    { key: 'stripe-pricing', label: 'Update pricing in Stripe to match 3-tier structure' },
  ];

  return `
    <h2 class="adm-section-title">Launch Muslins & Blockers</h2>

    <div class="adm-grid">
      ${muslins.map(g => {
        const photos = photosByGarment[g.id] ?? [];
        return `
        <div class="adm-card" data-garment="${g.id}">
          <div class="adm-card-hdr">
            <span class="adm-card-name">${g.name}</span>
            ${badge(g.muslin_status)}
          </div>
          <div class="adm-field">
            <label class="adm-label">Muslin status</label>
            ${selectHtml('muslin_status', g.muslin_status, MUSLIN_STATUSES)}
          </div>
          <div class="adm-field">
            <label class="adm-label">Dev status</label>
            ${selectHtml('dev_status', g.dev_status, DEV_STATUSES)}
          </div>
          <div class="adm-field">
            <label class="adm-label">Notes</label>
            <textarea data-field="muslin_notes" rows="2" class="adm-textarea">${g.muslin_notes ?? ''}</textarea>
          </div>
          <div class="adm-field">
            <label class="adm-label">Photos</label>
            <div class="adm-photos">
              ${photos.map(p => `
                <div class="adm-photo-wrap">
                  <img src="${getPhotoUrl(p.storage_path)}" class="adm-photo-thumb" title="${p.photo_type}${p.caption ? ' - ' + p.caption : ''}">
                  <button data-del-photo="${p.id}" data-del-path="${p.storage_path}" class="adm-photo-del" title="Delete">x</button>
                </div>
              `).join('')}
            </div>
            <div class="adm-upload-row">
              <select class="adm-photo-type adm-select">${PHOTO_TYPES.map(t => `<option value="${t}">${t}</option>`).join('')}</select>
              <label class="adm-upload-label">Upload <input type="file" accept="image/*" class="adm-photo-input" style="display:none"></label>
            </div>
          </div>
        </div>`;
      }).join('')}
    </div>

    <h3 class="adm-tier-title">Other Launch Blockers</h3>
    <ul class="adm-checklist" id="adm-blockers">
      ${blockers.map(b => `
        <li>
          <span class="adm-check${checklist[b.key] ? ' adm-check--done' : ''}" data-check="${b.key}">${checklist[b.key] ? '&#10003;' : ''}</span>
          <span${checklist[b.key] ? ' style="text-decoration:line-through;color:var(--mid)"' : ''}>${b.label}</span>
        </li>
      `).join('')}
    </ul>
  `;
}

function wireLaunchTracker(muslins) {
  for (const g of muslins) {
    const card = $(`.adm-card[data-garment="${g.id}"]`);
    if (!card) continue;

    card.querySelectorAll('select[data-field]').forEach(sel => {
      sel.addEventListener('change', async () => {
        const { error } = await updateGarment(g.id, { [sel.dataset.field]: sel.value });
        if (error) toast('Save failed: ' + error.message);
        else toast('Saved');
      });
    });

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
    <h2 class="adm-section-title">Revenue & Orders</h2>
    <div class="adm-stat-grid">
      ${[['Today', money(rev.today)], ['This week', money(rev.week)], ['This month', money(rev.month)], ['All time', money(rev.total)], ['Total orders', rev.count]].map(([label, val]) => `
        <div class="adm-stat">
          <div class="adm-stat-label">${label}</div>
          <div class="adm-stat-val">${val}</div>
        </div>
      `).join('')}
    </div>
    <h3 class="adm-tier-title">Recent orders</h3>
    <table class="adm-table">
      <thead><tr><th>Garment</th><th>Amount</th><th>Date</th></tr></thead>
      <tbody>
        ${rev.recent.map(o => `<tr>
          <td class="bold">${o.garment_id}</td>
          <td>${money(o.amount ?? 0)}</td>
          <td class="muted">${new Date(o.purchased_at).toLocaleDateString()}</td>
        </tr>`).join('')}
        ${rev.recent.length === 0 ? '<tr><td colspan="3" class="muted">No orders yet</td></tr>' : ''}
      </tbody>
    </table>`;
}

// ── Section: Funnel ──────────────────────────────────────────────────────────

function renderFunnel(f) {
  if (!f) return '<p style="color:var(--mid);font-size:.83rem">No data.</p>';
  const convRate = f.users > 0 ? ((f.purchases / f.users) * 100).toFixed(1) : '0.0';
  return `
    <h2 class="adm-section-title">User & Funnel Stats</h2>
    <div class="adm-stat-grid">
      ${[['Registered users', f.users], ['Total purchases', f.purchases], ['Newsletter subs', f.newsletter], ['Conversion rate', convRate + '%']].map(([label, val]) => `
        <div class="adm-stat">
          <div class="adm-stat-label">${label}</div>
          <div class="adm-stat-val">${val}</div>
        </div>
      `).join('')}
    </div>`;
}

// ── Section: Fit Feedback ────────────────────────────────────────────────────

function renderFeedback(fb) {
  return `
    <h2 class="adm-section-title">Fit Feedback Inbox (${fb.length})</h2>
    ${fb.length === 0 ? '<p style="color:var(--mid);font-size:.83rem">No feedback yet.</p>' : `
    <table class="adm-table">
      <thead><tr><th>Garment</th><th>Overall</th><th>Details</th><th>Notes</th><th>Date</th></tr></thead>
      <tbody>
        ${fb.map(f => {
          const garment = f.purchases?.garment_id ?? 'unknown';
          const details = f.specific_feedback
            ? Object.entries(f.specific_feedback).map(([k, v]) => `${k}: ${v}`).join(', ')
            : '';
          return `<tr>
            <td class="bold">${garment}</td>
            <td>${badge(f.overall_fit ?? 'n/a')}</td>
            <td style="max-width:300px;overflow:hidden;text-overflow:ellipsis">${details}</td>
            <td class="muted" style="max-width:200px;overflow:hidden;text-overflow:ellipsis">${f.notes ?? ''}</td>
            <td class="muted" style="white-space:nowrap">${new Date(f.created_at).toLocaleDateString()}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>`}`;
}

// ── Section: Popular Garments ────────────────────────────────────────────────

function renderPopular(pop) {
  return `
    <h2 class="adm-section-title">Popular Garments</h2>
    ${pop.length === 0 ? '<p style="color:var(--mid);font-size:.83rem">No data yet.</p>' : `
    <table class="adm-table">
      <thead><tr><th>Garment</th><th class="r">Purchases</th><th class="r">Wishlisted</th></tr></thead>
      <tbody>
        ${pop.map(g => `<tr>
          <td class="bold">${g.garment_id}</td>
          <td class="r">${g.purchases}</td>
          <td class="r">${g.wishlisted}</td>
        </tr>`).join('')}
      </tbody>
    </table>`}`;
}

// ── Section: Full Catalog ────────────────────────────────────────────────────

function renderCatalog(catalog) {
  const tiers = [
    { tier: 0, label: 'Existing (code-complete)' },
    { tier: 1, label: 'Tier 1 - Beginner, fast to build' },
    { tier: 2, label: 'Tier 2 - Intermediate, new geometry' },
    { tier: 3, label: 'Tier 3 - Advanced/expert' },
    { tier: 4, label: 'Tier 4 - Niche/novelty/seasonal' },
  ];

  return `
    <h2 class="adm-section-title">Full Catalog (${catalog.length} garments)</h2>
    <div class="adm-filter-bar">
      <label class="adm-label" style="margin:0">Filter:</label>
      <select id="adm-filter-tier" class="adm-select">
        <option value="">All tiers</option>
        ${tiers.map(t => `<option value="${t.tier}">Tier ${t.tier}</option>`).join('')}
      </select>
      <select id="adm-filter-dev" class="adm-select">
        <option value="">All dev status</option>
        ${DEV_STATUSES.map(s => `<option value="${s}">${s}</option>`).join('')}
      </select>
      <select id="adm-filter-muslin" class="adm-select">
        <option value="">All muslin status</option>
        ${MUSLIN_STATUSES.map(s => `<option value="${s}">${s}</option>`).join('')}
      </select>
    </div>
    ${tiers.map(({ tier, label }) => {
      const items = catalog.filter(g => g.tier === tier);
      if (items.length === 0) return '';
      return `
        <div class="adm-tier-group" data-tier="${tier}">
          <h3 class="adm-tier-title">${label} (${items.length})</h3>
          <table class="adm-table">
            <thead><tr><th>Name</th><th>Category</th><th>Difficulty</th><th>Dev</th><th>Muslin</th><th>Engine needs</th></tr></thead>
            <tbody>
              ${items.map(g => `<tr class="adm-expand-row" data-garment="${g.id}">
                <td class="bold">${g.name}</td>
                <td>${g.category}</td>
                <td>${g.difficulty ?? ''}</td>
                <td>${badge(g.dev_status)}</td>
                <td>${badge(g.muslin_status)}</td>
                <td class="muted" style="max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${g.engine_needs ?? ''}</td>
              </tr>
              <tr class="adm-catalog-detail" data-detail-for="${g.id}" hidden>
                <td colspan="6" class="adm-detail-cell">
                  <div class="adm-detail-grid">
                    <div>
                      <label class="adm-label">Dev status</label>
                      ${selectHtml('dev_status', g.dev_status, DEV_STATUSES)}
                    </div>
                    <div>
                      <label class="adm-label">Muslin status</label>
                      ${selectHtml('muslin_status', g.muslin_status, MUSLIN_STATUSES)}
                    </div>
                    <div class="adm-detail-full">
                      <label class="adm-label">Notes</label>
                      <textarea data-field="muslin_notes" rows="2" class="adm-textarea">${g.muslin_notes ?? ''}</textarea>
                    </div>
                    ${g.freesewing_ref ? `<div class="adm-detail-full"><span class="adm-label">FreeSewing ref:</span> <span style="font-size:.72rem">${g.freesewing_ref}</span></div>` : ''}
                  </div>
                </td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>`;
    }).join('')}`;
}

function wireCatalog(catalog) {
  root.querySelectorAll('.adm-expand-row').forEach(row => {
    row.addEventListener('click', () => {
      const detail = $(`[data-detail-for="${row.dataset.garment}"]`);
      if (detail) detail.hidden = !detail.hidden;
    });
  });

  root.querySelectorAll('.adm-catalog-detail').forEach(detail => {
    const gid = detail.dataset.detailFor;

    detail.querySelectorAll('select[data-field]').forEach(sel => {
      sel.addEventListener('change', async () => {
        const { error } = await updateGarment(gid, { [sel.dataset.field]: sel.value });
        if (error) toast('Save failed');
        else toast('Saved');
      });
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

    root.querySelectorAll('.adm-expand-row').forEach(row => {
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

// ── Section: Build Order ─────────────────────────────────────────────────────

function renderBuildOrder(catalog) {
  const catalogSet = new Set(catalog.filter(g => g.tier === 0).map(g => g.id));

  const months = [
    { label: 'Month 1 - Beginner, fast catalog growth',
      items: ['circle-skirt', 'pencil-skirt', 'pajama-pants', 'joggers', 'tank-top', 'tote-bag'] },
    { label: 'Month 2 - Fill category gaps + stretch block',
      items: ['boxer-briefs', 'leggings', 'tshirt-dress', 'robe', 'bralette', 'bucket-hat'] },
    { label: 'Month 3 - Intermediate flagships',
      items: ['button-up-m', 'jumpsuit-w', 'bomber-jacket', 'sundress', 'underwear-w'] },
    { label: 'Month 4 - Advanced + children + workwear',
      items: ['blazer', 'waistcoat', 'kids-leggings', 'kids-tee', 'pajama-set', 'scrubs'] },
    { label: 'Month 5+ - Catalog breadth',
      items: ['tiered-dress', 'shacket', 'puffer-jacket', 'polo', 'one-piece-swimsuit', 'cardigan', 'wrap-skirt', 'shift-dress'] },
  ];

  const capabilities = [
    { skill: 'Stretch/knit block', unlocks: 'Leggings, bikini, swimshirt, boxer briefs, knit dress, bodycon, bralette, sports bra', priority: 'critical' },
    { skill: 'Ring-sector math', unlocks: 'Circle skirt, curved waistband v2', priority: 'high' },
    { skill: 'Cup sizing math', unlocks: 'Bralette, sports bra, underwire bra, one-piece swimsuit', priority: 'high' },
    { skill: 'Gathering/ease distribution', unlocks: 'Sundress, tiered dress, puffy pants, peasant blouse, babydoll', priority: 'high' },
    { skill: 'Elastic length calculator', unlocks: 'Pajama pants, joggers, underwear, swimwear, baby onesie', priority: 'high' },
    { skill: 'Collar drafting', unlocks: 'Blazer, coat, tailored shirt, peacoat', priority: 'medium' },
    { skill: 'Quilting channels', unlocks: 'Puffer jacket, puffer vest', priority: 'medium' },
    { skill: 'Boning/channel layout', unlocks: 'Corset, cocktail dress, evening gown', priority: 'medium' },
    { skill: 'Bias grain calculation', unlocks: 'Necktie, bias-cut skirt, slip dress', priority: 'medium' },
    { skill: 'Lining auto-generation', unlocks: 'Blazer, coat, lined skirt, handbag, vest', priority: 'medium' },
  ];

  // Check which build order items are already built (fuzzy match by slug prefix)
  function isDone(slug) {
    if (catalogSet.has(slug)) return true;
    // fuzzy: circle-skirt matches circle-skirt-w, etc.
    for (const id of catalogSet) {
      if (id.startsWith(slug) || slug.startsWith(id)) return true;
    }
    return false;
  }

  return `
    <h2 class="adm-section-title">Build Order (from roadmap)</h2>

    ${months.map(m => `
      <div class="adm-roadmap-card">
        <h3>${m.label}</h3>
        ${m.items.map((slug, i) => {
          const done = isDone(slug);
          return `<div class="adm-build-row">
            <span class="adm-build-num">${i + 1}</span>
            <span class="adm-build-name${done ? ' adm-build-done' : ''}">${slug.replace(/-/g, ' ')}</span>
            ${done ? '<span class="adm-badge adm-badge--approved">built</span>' : '<span class="adm-badge adm-badge--planned">planned</span>'}
          </div>`;
        }).join('')}
      </div>
    `).join('')}

    <div class="adm-roadmap-card">
      <h3>Engine Capabilities Needed</h3>
      <table class="adm-table">
        <thead><tr><th>Capability</th><th>Unlocks</th><th>Priority</th></tr></thead>
        <tbody>
          ${capabilities.map(c => `<tr>
            <td class="bold">${c.skill}</td>
            <td class="muted" style="font-size:.68rem">${c.unlocks}</td>
            <td>${badge(c.priority)}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>

    <div class="adm-roadmap-card">
      <h3>Quick-Add Sprint (1-2 hours each)</h3>
      <p>Laptop sleeve, book sleeve, dog bandana, zippered pouch, water bottle sling, bikepacking frame bag (custom to bike frame - signature parametric product), bench cushion (custom dimensions)</p>
    </div>
  `;
}

// ── Section: Market Research ─────────────────────────────────────────────────

function renderMarket() {
  return `
    <h2 class="adm-section-title">Market Research</h2>

    <div class="adm-roadmap-card">
      <h3>Key Stats</h3>
      <table class="adm-table">
        <thead><tr><th>Metric</th><th>Value</th></tr></thead>
        <tbody>
          <tr><td>Millennials + Gen Z share of new sewers</td><td class="bold">60%</td></tr>
          <tr><td>Custom clothing market (2025)</td><td class="bold">$60B</td></tr>
          <tr><td>Projected by 2035</td><td class="bold">$149.5B (9.56% CAGR)</td></tr>
          <tr><td>Online pattern sales growth since 2019</td><td class="bold">+25%</td></tr>
          <tr><td>TikTok #sewing posts</td><td class="bold">~3M</td></tr>
          <tr><td>#boyswhosew views</td><td class="bold">53.4M</td></tr>
          <tr><td>Male crafting participation increase (5yr)</td><td class="bold">+45%</td></tr>
          <tr><td>Sweet spot pricing</td><td class="bold">$8-16/pattern</td></tr>
          <tr><td>Direct competitors at scale</td><td class="bold">None</td></tr>
        </tbody>
      </table>
    </div>

    <div class="adm-roadmap-card">
      <h3>Why People Sew (ranked)</h3>
      <table class="adm-table">
        <thead><tr><th>#</th><th>Reason</th><th>Key insight</th></tr></thead>
        <tbody>
          <tr><td>1</td><td class="bold">Fit</td><td class="muted">68% prefer oversized but standard sizing doesn't deliver; online return rates 20-30%</td></tr>
          <tr><td>2</td><td class="bold">Cost</td><td class="muted">Custom shirt $20-40 in fabric vs $100+ retail</td></tr>
          <tr><td>3</td><td class="bold">Sustainability</td><td class="muted">73% willing to pay more for sustainable; #ThriftFlip 3B+ views</td></tr>
          <tr><td>4</td><td class="bold">Self-expression</td><td class="muted">DIY content gets 3x more engagement than brand content</td></tr>
          <tr><td>5</td><td class="bold">Screen fatigue</td><td class="muted">Analog hobby to get off phones</td></tr>
          <tr><td>6</td><td class="bold">Social currency</td><td class="muted">Making clothes is a flex showing skill, creativity, and values</td></tr>
        </tbody>
      </table>
    </div>

    <div class="adm-roadmap-card">
      <h3>Men's MTM Opportunity</h3>
      <table class="adm-table">
        <thead><tr><th>Segment</th><th>Key insight</th></tr></thead>
        <tbody>
          <tr><td class="bold">Rise is #1 MTM value prop</td><td class="muted">Standard sizing only provides waist + inseam, ignoring rise, thigh, hip. Rise CANNOT be fixed by a tailor.</td></tr>
          <tr><td class="bold">Athletic builds</td><td class="muted">95% of off-the-rack doesn't accommodate muscular proportions</td></tr>
          <tr><td class="bold">Short men (&lt;5'8")</td><td class="muted">~30% of US men, essentially ignored by industry</td></tr>
          <tr><td class="bold">Plus-size (XL+)</td><td class="muted">34.1% of US men overweight, only 12% of market serves them</td></tr>
          <tr><td class="bold">Men's formalwear</td><td class="muted">60% of custom orders in North America; suits market $19.57B</td></tr>
        </tbody>
      </table>
    </div>

    <div class="adm-roadmap-card">
      <h3>Gen Z Aesthetics Driving Demand</h3>
      <table class="adm-table">
        <thead><tr><th>Aesthetic</th><th>Key garments</th><th>Status</th></tr></thead>
        <tbody>
          <tr><td class="bold">Y2K Revival</td><td class="muted">Slip dresses, corset tops, low-rise</td><td>Peak</td></tr>
          <tr><td class="bold">Coquette</td><td class="muted">Corset tops, babydoll dresses, lace</td><td>Very strong</td></tr>
          <tr><td class="bold">Gorpcore</td><td class="muted">Cargo pants, utility jackets, quarter-zips</td><td>Evergreen</td></tr>
          <tr><td class="bold">Cottagecore</td><td class="muted">Flowy dresses, puff sleeves, midi skirts</td><td>Sustained</td></tr>
          <tr><td class="bold">Quiet Luxury</td><td class="muted">Clean trousers, simple blazers, tonal</td><td>Rising</td></tr>
          <tr><td class="bold">Office Siren</td><td class="muted">Pencil skirts, blazers, slinky office-wear</td><td>Growing</td></tr>
          <tr><td class="bold">Gender-Fluid</td><td class="muted">Oversized silhouettes, elastic waists</td><td>Growing strongly</td></tr>
        </tbody>
      </table>
    </div>

    <div class="adm-roadmap-card">
      <h3>Lead Messaging</h3>
      <ul class="adm-checklist">
        <li><span class="adm-gold" style="font-weight:600">*</span> "Pants that actually fit YOUR body" - strongest MTM value prop</li>
        <li><span class="adm-gold" style="font-weight:600">*</span> Men's: "Rise-customized pants - the measurement no other brand addresses"</li>
        <li><span class="adm-gold" style="font-weight:600">*</span> Athletic fit as explicit option - serve fitness community</li>
        <li><span class="adm-gold" style="font-weight:600">*</span> "Finally, men's patterns that don't look like your dad's wardrobe"</li>
      </ul>
    </div>

    <div class="adm-roadmap-card">
      <h3>Underserved Segments to Target</h3>
      <ul class="adm-checklist">
        <li><span class="adm-gold" style="font-weight:600">*</span> Athletic/muscular builds (95% of off-the-rack doesn't fit)</li>
        <li><span class="adm-gold" style="font-weight:600">*</span> Short men under 5'8" (~30% of US men)</li>
        <li><span class="adm-gold" style="font-weight:600">*</span> Plus-size men above XXL (34% of men, 12% of market)</li>
        <li><span class="adm-gold" style="font-weight:600">*</span> Gen Z wanting unique/OOAK garments</li>
      </ul>
    </div>
  `;
}

// ── Section: Article Tracker ─────────────────────────────────────────────────

function renderArticleTracker() {
  const TODAY = new Date().toISOString().slice(0, 10);
  const published = ARTICLES.filter(a => a.datePublished && a.datePublished <= TODAY);
  const scheduled = ARTICLES.filter(a => a.datePublished && a.datePublished > TODAY);

  // Group scheduled by month
  const byMonth = {};
  for (const a of scheduled) {
    const month = a.datePublished.slice(0, 7);
    if (!byMonth[month]) byMonth[month] = [];
    byMonth[month].push(a);
  }

  // Estimate word count from body HTML
  const wordCount = (html) => {
    if (!html) return 0;
    return html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  };

  const totalWords = ARTICLES.reduce((sum, a) => sum + wordCount(a.body), 0);

  // Category breakdown
  const byCat = {};
  for (const a of ARTICLES) {
    const cat = a.category || 'uncategorized';
    if (!byCat[cat]) byCat[cat] = { total: 0, live: 0 };
    byCat[cat].total++;
    if (a.datePublished && a.datePublished <= TODAY) byCat[cat].live++;
  }

  const articleRow = (a, showDate) => {
    const wc = wordCount(a.body);
    const isLive = a.datePublished && a.datePublished <= TODAY;
    const hasFaq = !!(a.faqSchema && a.faqSchema.length);
    const statusColor = isLive ? 'var(--sa)' : 'var(--gold)';
    const statusLabel = isLive ? 'live' : a.datePublished || 'no date';
    return `<tr>
      <td style="max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
        <a href="/learn/${a.slug}" target="_blank" rel="noopener" style="color:var(--text);text-decoration:none">${a.title}</a>
      </td>
      <td><span style="display:inline-block;padding:1px 6px;border-radius:3px;font-size:.65rem;background:${statusColor};color:#fff;font-weight:600">${statusLabel}</span></td>
      <td style="text-align:right;font-variant-numeric:tabular-nums">${wc.toLocaleString()}</td>
      <td style="text-align:center">${hasFaq ? '<span title="Has FAQ schema" style="color:var(--sa)">FAQ</span>' : ''}</td>
      <td style="font-size:.72rem;color:var(--mid)">${a.category || ''}</td>
    </tr>`;
  };

  return `
    <h2 class="adm-section-title">Article Tracker</h2>

    <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:16px">
      <div class="adm-roadmap-card" style="flex:1;min-width:120px;text-align:center">
        <div style="font-size:2rem;font-weight:700;color:var(--text)">${ARTICLES.length}</div>
        <div style="font-size:.72rem;color:var(--mid)">Total articles</div>
      </div>
      <div class="adm-roadmap-card" style="flex:1;min-width:120px;text-align:center">
        <div style="font-size:2rem;font-weight:700;color:var(--sa)">${published.length}</div>
        <div style="font-size:.72rem;color:var(--mid)">Live now</div>
      </div>
      <div class="adm-roadmap-card" style="flex:1;min-width:120px;text-align:center">
        <div style="font-size:2rem;font-weight:700;color:var(--gold)">${scheduled.length}</div>
        <div style="font-size:.72rem;color:var(--mid)">Scheduled</div>
      </div>
      <div class="adm-roadmap-card" style="flex:1;min-width:120px;text-align:center">
        <div style="font-size:2rem;font-weight:700;color:var(--text)">${Math.round(totalWords / 1000)}k</div>
        <div style="font-size:.72rem;color:var(--mid)">Total words</div>
      </div>
    </div>

    <div class="adm-roadmap-card" style="margin-bottom:16px">
      <h3>Category breakdown</h3>
      <table class="adm-table" style="font-size:.78rem">
        <thead><tr><th>Category</th><th style="text-align:right">Live</th><th style="text-align:right">Scheduled</th><th style="text-align:right">Total</th></tr></thead>
        <tbody>
          ${Object.entries(byCat).map(([cat, c]) => `<tr>
            <td>${cat}</td>
            <td style="text-align:right">${c.live}</td>
            <td style="text-align:right">${c.total - c.live}</td>
            <td style="text-align:right">${c.total}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>

    ${Object.keys(byMonth).length ? `
    <div class="adm-roadmap-card" style="margin-bottom:16px">
      <h3>Upcoming schedule</h3>
      ${Object.entries(byMonth).sort(([a],[b]) => a.localeCompare(b)).map(([month, articles]) => `
        <div style="margin-bottom:12px">
          <div style="font-weight:600;font-size:.83rem;margin-bottom:4px">${month} (${articles.length} articles)</div>
          <table class="adm-table" style="font-size:.75rem">
            <thead><tr><th>Title</th><th>Date</th><th style="text-align:right">Words</th><th>FAQ</th><th>Category</th></tr></thead>
            <tbody>${articles.sort((a,b) => a.datePublished.localeCompare(b.datePublished)).map(a => articleRow(a, true)).join('')}</tbody>
          </table>
        </div>
      `).join('')}
    </div>` : ''}

    <details style="margin-top:16px">
      <summary style="cursor:pointer;font-weight:600;font-size:.9rem;color:var(--text);padding:8px 0">All articles (${published.length} live)</summary>
      <div class="adm-roadmap-card">
        <table class="adm-table" style="font-size:.75rem">
          <thead><tr><th>Title</th><th>Status</th><th style="text-align:right">Words</th><th>FAQ</th><th>Category</th></tr></thead>
          <tbody>${ARTICLES.sort((a,b) => (a.datePublished||'9').localeCompare(b.datePublished||'9')).map(a => articleRow(a, true)).join('')}</tbody>
        </table>
      </div>
    </details>
  `;
}

// ── Section: Content & Marketing ─────────────────────────────────────────────

const PIPELINE_STATUSES = ['idea', 'script', 'shot-list', 'filming', 'editing', 'uploaded'];
const PIPELINE_PLATFORMS = ['youtube', 'tiktok', 'instagram', 'pinterest', 'facebook', 'other'];

function pipelineBadge(status) {
  const colors = {
    'idea': 'var(--mid)', 'script': 'var(--gold)', 'shot-list': '#6a8a9a',
    'filming': '#b87333', 'editing': '#8a6aaa', 'uploaded': 'var(--sa)',
  };
  const bg = colors[status] || 'var(--mid)';
  return `<span style="display:inline-block;padding:2px 8px;border-radius:3px;font-size:.7rem;background:${bg};color:#fff;font-weight:600">${status}</span>`;
}

function platformIcon(platform) {
  const labels = { youtube: 'YT', tiktok: 'TT', instagram: 'IG', pinterest: 'PIN', facebook: 'FB', other: '--' };
  return `<span style="display:inline-block;padding:2px 6px;border-radius:3px;font-size:.65rem;background:var(--bdr);color:var(--text);font-weight:600;margin-right:6px">${labels[platform] || platform}</span>`;
}

function renderPipelineItem(item) {
  const isUploaded = item.status === 'uploaded';
  return `
    <div class="adm-roadmap-card adm-pipeline-card" data-pipeline-id="${item.id}" style="cursor:pointer;margin-bottom:8px">
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
        ${platformIcon(item.platform)}
        <strong style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${item.title}</strong>
        ${pipelineBadge(item.status)}
        ${isUploaded && item.url ? `<a href="${item.url}" target="_blank" rel="noopener" style="font-size:.75rem;color:var(--gold)" onclick="event.stopPropagation()">view</a>` : ''}
        ${isUploaded && item.views != null ? `<span style="font-size:.7rem;color:var(--mid)">${item.views} views</span>` : ''}
      </div>
    </div>
    <div class="adm-pipeline-detail" data-detail-for="${item.id}" hidden>
      <div class="adm-roadmap-card" style="margin-bottom:16px;border-left:3px solid var(--gold)">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
          <label style="font-size:.75rem;color:var(--mid)">Title
            <input type="text" class="adm-input" data-pipe-field="title" value="${(item.title || '').replace(/"/g, '&quot;')}" style="width:100%;margin-top:2px">
          </label>
          <div style="display:flex;gap:8px">
            <label style="font-size:.75rem;color:var(--mid);flex:1">Platform
              <select class="adm-select" data-pipe-field="platform" style="width:100%;margin-top:2px">
                ${PIPELINE_PLATFORMS.map(p => `<option value="${p}"${p === item.platform ? ' selected' : ''}>${p}</option>`).join('')}
              </select>
            </label>
            <label style="font-size:.75rem;color:var(--mid);flex:1">Status
              <select class="adm-select" data-pipe-field="status" style="width:100%;margin-top:2px">
                ${PIPELINE_STATUSES.map(s => `<option value="${s}"${s === item.status ? ' selected' : ''}>${s}</option>`).join('')}
              </select>
            </label>
          </div>
        </div>
        <label style="font-size:.75rem;color:var(--mid)">Description
          <textarea class="adm-input" data-pipe-field="description" rows="2" style="width:100%;margin-top:2px;resize:vertical">${item.description || ''}</textarea>
        </label>
        <label style="font-size:.75rem;color:var(--mid);margin-top:8px;display:block">Script
          <textarea class="adm-input" data-pipe-field="script" rows="6" style="width:100%;margin-top:2px;resize:vertical;font-size:.78rem">${item.script || ''}</textarea>
        </label>
        <label style="font-size:.75rem;color:var(--mid);margin-top:8px;display:block">Shot List
          <textarea class="adm-input" data-pipe-field="shot_list" rows="4" style="width:100%;margin-top:2px;resize:vertical;font-size:.78rem">${item.shot_list || ''}</textarea>
        </label>
        <label style="font-size:.75rem;color:var(--mid);margin-top:8px;display:block">URL (final upload link)
          <input type="url" class="adm-input" data-pipe-field="url" value="${(item.url || '').replace(/"/g, '&quot;')}" style="width:100%;margin-top:2px" placeholder="https://youtube.com/watch?v=...">
        </label>
        <div style="display:flex;gap:8px;margin-top:8px">
          <label style="font-size:.75rem;color:var(--mid);flex:1">Views
            <input type="number" class="adm-input" data-pipe-field="views" value="${item.views ?? ''}" style="width:100%;margin-top:2px" min="0">
          </label>
          <label style="font-size:.75rem;color:var(--mid);flex:1">Likes
            <input type="number" class="adm-input" data-pipe-field="likes" value="${item.likes ?? ''}" style="width:100%;margin-top:2px" min="0">
          </label>
          <label style="font-size:.75rem;color:var(--mid);flex:1">Comments
            <input type="number" class="adm-input" data-pipe-field="comments" value="${item.comments ?? ''}" style="width:100%;margin-top:2px" min="0">
          </label>
        </div>
        <div style="display:flex;gap:8px;margin-top:12px;justify-content:space-between">
          <button class="adm-btn" data-pipe-save="${item.id}">Save</button>
          <button class="adm-btn adm-btn--danger" data-pipe-delete="${item.id}" style="background:transparent;color:var(--mid);border:1px solid var(--bdr);font-size:.72rem">Delete</button>
        </div>
      </div>
    </div>`;
}

function renderPinTracker(pinStats) {
  if (!pinStats || pinStats.length === 0) {
    return `
      <h2 class="adm-section-title">Pinterest Pins</h2>
      <p style="color:var(--mid);font-size:.83rem">No pin data found. Run <code>node scripts/seed-pinterest-pins.mjs</code> to populate.</p>
    `;
  }

  const now = new Date().toISOString();
  const posted = pinStats.filter(p => p.ifttt_status === 'success').length;
  const pending = pinStats.filter(p => p.ifttt_status === 'pending' && p.scheduled_at <= now).length;
  const scheduled = pinStats.filter(p => p.ifttt_status === 'pending' && p.scheduled_at > now).length;
  const failed = pinStats.filter(p => p.ifttt_status === 'error').length;
  const retrying = pinStats.filter(p => p.ifttt_status === 'retry').length;
  const noImage = pinStats.filter(p => !p.ifttt_status || p.ifttt_status === 'pending').length;

  // Board breakdown
  const byBoard = {};
  for (const p of pinStats) {
    if (!byBoard[p.board]) byBoard[p.board] = { posted: 0, pending: 0, error: 0 };
    if (p.ifttt_status === 'success') byBoard[p.board].posted++;
    else if (p.ifttt_status === 'error' || p.ifttt_status === 'retry') byBoard[p.board].error++;
    else byBoard[p.board].pending++;
  }

  return `
    <h2 class="adm-section-title">Pinterest Pins</h2>

    <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:16px">
      <div class="adm-roadmap-card" style="flex:1;min-width:100px;text-align:center">
        <div style="font-size:2rem;font-weight:700;color:var(--text)">${pinStats.length}</div>
        <div style="font-size:.72rem;color:var(--mid)">Total pins</div>
      </div>
      <div class="adm-roadmap-card" style="flex:1;min-width:100px;text-align:center">
        <div style="font-size:2rem;font-weight:700;color:var(--sa)">${posted}</div>
        <div style="font-size:.72rem;color:var(--mid)">Posted</div>
      </div>
      <div class="adm-roadmap-card" style="flex:1;min-width:100px;text-align:center">
        <div style="font-size:2rem;font-weight:700;color:var(--gold)">${pending + scheduled}</div>
        <div style="font-size:.72rem;color:var(--mid)">Queued</div>
      </div>
      <div class="adm-roadmap-card" style="flex:1;min-width:100px;text-align:center">
        <div style="font-size:2rem;font-weight:700;${failed > 0 ? 'color:#e05858' : 'color:var(--mid)'}">${failed}</div>
        <div style="font-size:.72rem;color:var(--mid)">Failed</div>
      </div>
      ${retrying > 0 ? `<div class="adm-roadmap-card" style="flex:1;min-width:100px;text-align:center">
        <div style="font-size:2rem;font-weight:700;color:var(--gold)">${retrying}</div>
        <div style="font-size:.72rem;color:var(--mid)">Retrying</div>
      </div>` : ''}
    </div>

    <details style="margin-bottom:16px">
      <summary style="cursor:pointer;font-weight:600;font-size:.9rem;color:var(--text);padding:8px 0">Board breakdown</summary>
      <div class="adm-roadmap-card">
        <table class="adm-table" style="font-size:.78rem">
          <thead><tr><th>Board</th><th style="text-align:right">Posted</th><th style="text-align:right">Queued</th><th style="text-align:right">Failed</th></tr></thead>
          <tbody>
            ${Object.entries(byBoard).sort(([a],[b]) => a.localeCompare(b)).map(([board, c]) => `<tr>
              <td>${board}</td>
              <td style="text-align:right">${c.posted}</td>
              <td style="text-align:right">${c.pending}</td>
              <td style="text-align:right;${c.error > 0 ? 'color:#e05858' : ''}">${c.error}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </details>
  `;
}

function renderContent(pipeline, pinStats) {
  const statusCounts = {};
  for (const s of PIPELINE_STATUSES) statusCounts[s] = 0;
  for (const item of pipeline) statusCounts[item.status] = (statusCounts[item.status] || 0) + 1;

  const checklist = getChecklist();
  const checklistSections = [
    { title: 'Phase 1 - Pre-Launch Content', items: [
      { key: 'c-sample-photos', label: 'Add sewn sample photos to pattern pages (biggest trust signal)' },
      { key: 'c-measure-video', label: 'Film "how to measure yourself" video (#1 content asset)' },
      { key: 'c-demo-video', label: 'Film "how People\'s Patterns works" video (product demo)' },
      { key: 'c-blog-articles', label: 'Create first 3 blog articles from video transcripts' },
      { key: 'c-pattern-pages', label: 'Create individual pattern pages with SEO meta tags' },
      { key: 'c-social-avatars', label: 'Post branded avatars and banners to all social accounts' },
    ]},
    { title: 'Email Flows', items: [
      { key: 'c-welcome-seq', label: 'Welcome sequence (3 emails: measure, first pattern, tiled PDFs)' },
      { key: 'c-gen-followup', label: 'Generated-not-purchased follow-up' },
      { key: 'c-fit-feedback', label: 'Post-sew fit feedback request' },
    ]},
    { title: 'Phase 2 - Launch Content', items: [
      { key: 'c-fit-video', label: 'Before/after fit video (TikTok first)' },
      { key: 'c-jeans-series', label: '"I generated a jeans pattern for $14" series' },
      { key: 'c-muslin-vids', label: 'Muslin fitting session videos' },
      { key: 'c-pdf-video', label: 'How tiled PDFs work (demystify the format)' },
      { key: 'c-measure-short', label: 'How to measure yourself (short form)' },
      { key: 'c-build-public', label: 'Build-in-public content' },
    ]},
    { title: 'Sew-Along Videos', items: [
      { key: 'c-sew-cargo', label: 'Cargo Shorts sew-along' },
      { key: 'c-sew-jeans', label: 'Straight Jeans sew-along' },
      { key: 'c-sew-tee', label: 'T-Shirt sew-along' },
      { key: 'c-sew-camp', label: 'Camp Shirt sew-along' },
      { key: 'c-sew-skirt', label: 'A-Line Skirt sew-along' },
      { key: 'c-sew-wlt', label: 'Wide-Leg Trouser sew-along' },
    ]},
    { title: 'Community Launch', items: [
      { key: 'c-patternreview', label: 'PatternReview.com designer account (593k members)' },
      { key: 'c-reddit', label: 'Reddit: r/sewing, r/sewhelp, r/myog' },
      { key: 'c-seed-downloads', label: 'Seed 50-100 free downloads to sewists (5k-50k followers)' },
      { key: 'c-referral', label: 'Referral program: give a friend a free pattern, get one free' },
    ]},
    { title: 'Phase 3 - Revenue Expansion', items: [
      { key: 'c-club-tier', label: 'Club membership: $12/mo, 1 credit/month, 20% off' },
      { key: 'c-wardrobe-tier', label: 'Wardrobe membership: $24/mo, 3 credits/month' },
      { key: 'c-etsy-grading', label: 'Build grading function (XS-3X) for Etsy' },
      { key: 'c-etsy-listing', label: 'List sized PDFs on Etsy ($12-15/pattern)' },
      { key: 'c-beginner-kit', label: 'Branded beginner kit ($25-30)' },
      { key: 'c-pro-plan', label: '$50/month professional plan (commercial use)' },
    ]},
  ];

  // ── Summary bar (always visible) ──────────────────────────────────────────
  const TODAY = new Date().toISOString().slice(0, 10);
  const articlesLive = ARTICLES.filter(a => a.datePublished && a.datePublished <= TODAY).length;
  const articlesScheduled = ARTICLES.length - articlesLive;
  const pinsPosted = pinStats.filter(p => p.ifttt_status === 'success').length;
  const pinsQueued = pinStats.length - pinsPosted - pinStats.filter(p => p.ifttt_status === 'error').length;
  const pinsFailed = pinStats.filter(p => p.ifttt_status === 'error' || p.ifttt_status === 'retry').length;
  const videosTotal = pipeline.length;
  const videosUploaded = pipeline.filter(p => p.status === 'uploaded').length;

  // Needs attention items
  const alerts = [];
  if (pinsFailed > 0) alerts.push(`${pinsFailed} pin${pinsFailed > 1 ? 's' : ''} failed`);
  const overduePins = pinStats.filter(p => p.ifttt_status === 'pending' && p.scheduled_at <= new Date().toISOString()).length;
  if (overduePins > 0) alerts.push(`${overduePins} pin${overduePins > 1 ? 's' : ''} overdue`);

  const subTabs = [
    { id: 'c-articles', label: 'Articles', badge: `${articlesLive}/${ARTICLES.length}` },
    { id: 'c-pins', label: 'Pins', badge: `${pinsPosted}/${pinStats.length}` },
    { id: 'c-videos', label: 'Videos', badge: `${videosUploaded}/${videosTotal}` },
    { id: 'c-checklist', label: 'Checklist' },
  ];

  // ── Videos sub-tab content ─────────────────────────────────────────────────
  const videosContent = `
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;flex-wrap:wrap">
      <div style="display:flex;gap:6px;flex-wrap:wrap;flex:1">
        ${PIPELINE_STATUSES.map(s => `<span style="font-size:.72rem;color:var(--mid)">${s}: <strong>${statusCounts[s]}</strong></span>`).join('')}
      </div>
      <select id="adm-pipe-filter-status" class="adm-select" style="font-size:.75rem">
        <option value="">All statuses</option>
        ${PIPELINE_STATUSES.map(s => `<option value="${s}">${s}</option>`).join('')}
      </select>
      <select id="adm-pipe-filter-platform" class="adm-select" style="font-size:.75rem">
        <option value="">All platforms</option>
        ${PIPELINE_PLATFORMS.map(p => `<option value="${p}">${p}</option>`).join('')}
      </select>
      <button class="adm-btn" id="adm-pipe-new">+ New</button>
    </div>
    <div id="adm-pipeline-list">
      ${pipeline.length === 0
        ? '<p style="color:var(--mid);font-size:.83rem;text-align:center;padding:24px 0">No content items yet. Click "+ New" to add one.</p>'
        : pipeline.map(item => renderPipelineItem(item)).join('')}
    </div>`;

  // ── Checklist sub-tab content ──────────────────────────────────────────────
  const checklistContent = checklistSections.map(s => `
    <div class="adm-roadmap-card">
      <h3>${s.title}</h3>
      <ul class="adm-checklist" data-checklist>
        ${s.items.map(item => `
          <li>
            <span class="adm-check${checklist[item.key] ? ' adm-check--done' : ''}" data-check="${item.key}">${checklist[item.key] ? '&#10003;' : ''}</span>
            <span${checklist[item.key] ? ' style="text-decoration:line-through;color:var(--mid)"' : ''}>${item.label}</span>
          </li>
        `).join('')}
      </ul>
    </div>
  `).join('');

  return `
    <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:20px">
      <div class="adm-roadmap-card" style="flex:1;min-width:140px;text-align:center;padding:16px">
        <div style="font-size:1.6rem;font-weight:700;color:var(--sa)">${articlesLive}</div>
        <div style="font-size:.7rem;color:var(--mid)">articles live</div>
        <div style="font-size:.7rem;color:var(--gold);margin-top:2px">${articlesScheduled} scheduled</div>
      </div>
      <div class="adm-roadmap-card" style="flex:1;min-width:140px;text-align:center;padding:16px">
        <div style="font-size:1.6rem;font-weight:700;color:var(--sa)">${pinsPosted}</div>
        <div style="font-size:.7rem;color:var(--mid)">pins posted</div>
        <div style="font-size:.7rem;color:var(--gold);margin-top:2px">${pinsQueued} queued</div>
      </div>
      <div class="adm-roadmap-card" style="flex:1;min-width:140px;text-align:center;padding:16px">
        <div style="font-size:1.6rem;font-weight:700;color:${videosUploaded > 0 ? 'var(--sa)' : 'var(--mid)'}">${videosUploaded}</div>
        <div style="font-size:.7rem;color:var(--mid)">videos uploaded</div>
        <div style="font-size:.7rem;color:var(--gold);margin-top:2px">${videosTotal - videosUploaded} in progress</div>
      </div>
      ${alerts.length ? `<div class="adm-roadmap-card" style="flex:1;min-width:140px;text-align:center;padding:16px;border-left:3px solid #e05858">
        <div style="font-size:1.6rem;font-weight:700;color:#e05858">${alerts.length}</div>
        <div style="font-size:.7rem;color:var(--mid)">needs attention</div>
        <div style="font-size:.7rem;color:#e05858;margin-top:2px">${alerts.join(', ')}</div>
      </div>` : ''}
    </div>

    <nav class="adm-content-subtabs" style="display:flex;gap:0;margin-bottom:20px;border-bottom:1px solid var(--bdr)">
      ${subTabs.map((t, i) => `<button class="adm-content-subtab${i === 0 ? ' adm-content-subtab--active' : ''}" data-content-tab="${t.id}" style="
        padding:10px 20px;font-size:.8rem;font-weight:600;background:none;border:none;
        color:${i === 0 ? 'var(--gold)' : 'var(--mid)'};cursor:pointer;
        border-bottom:2px solid ${i === 0 ? 'var(--gold)' : 'transparent'};
        transition:all .15s;font-family:inherit;
      ">${t.label}${t.badge ? ` <span style="font-size:.65rem;font-weight:400;opacity:.7">${t.badge}</span>` : ''}</button>`).join('')}
    </nav>

    <div id="adm-content-sub-c-articles">${renderArticleTracker()}</div>
    <div id="adm-content-sub-c-pins" hidden>${renderPinTracker(pinStats)}</div>
    <div id="adm-content-sub-c-videos" hidden>${videosContent}</div>
    <div id="adm-content-sub-c-checklist" hidden>${checklistContent}</div>
  `;
}

// ── Wire content pipeline ───────────────────────────────────────────────────

function wireContentSubTabs() {
  root.querySelectorAll('.adm-content-subtab').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.contentTab;
      // Update active tab style
      root.querySelectorAll('.adm-content-subtab').forEach(b => {
        const isActive = b.dataset.contentTab === tabId;
        b.classList.toggle('adm-content-subtab--active', isActive);
        b.style.color = isActive ? 'var(--gold)' : 'var(--mid)';
        b.style.borderBottom = isActive ? '2px solid var(--gold)' : '2px solid transparent';
      });
      // Show/hide panels
      root.querySelectorAll('[id^="adm-content-sub-"]').forEach(panel => {
        panel.hidden = panel.id !== `adm-content-sub-${tabId}`;
      });
    });
  });
}

function wireContentPipeline(pipeline) {
  wireContentSubTabs();
  // Toggle detail panels
  root.querySelectorAll('.adm-pipeline-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.pipelineId;
      const detail = root.querySelector(`[data-detail-for="${id}"]`);
      if (detail) detail.hidden = !detail.hidden;
    });
  });

  // New item
  const newBtn = root.querySelector('#adm-pipe-new');
  if (newBtn) {
    newBtn.addEventListener('click', async () => {
      newBtn.disabled = true;
      const { error } = await createContentItem(_adminUser.id, { title: 'Untitled video' });
      if (error) { toast('Error creating item'); newBtn.disabled = false; return; }
      toast('Created');
      await reloadContentTab();
    });
  }

  // Save buttons
  root.querySelectorAll('[data-pipe-save]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = btn.dataset.pipeSave;
      const detail = root.querySelector(`[data-detail-for="${id}"]`);
      if (!detail) return;
      const fields = {};
      detail.querySelectorAll('[data-pipe-field]').forEach(el => {
        const key = el.dataset.pipeField;
        if (el.type === 'number') {
          fields[key] = el.value === '' ? null : parseInt(el.value, 10);
        } else {
          fields[key] = el.value;
        }
      });
      btn.disabled = true;
      const { error } = await updateContentItem(id, fields);
      if (error) { toast('Error saving'); btn.disabled = false; return; }
      toast('Saved');
      await reloadContentTab();
    });
  });

  // Delete buttons
  root.querySelectorAll('[data-pipe-delete]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (!confirm('Delete this content item?')) return;
      btn.disabled = true;
      const { error } = await deleteContentItem(btn.dataset.pipeDelete);
      if (error) { toast('Error deleting'); btn.disabled = false; return; }
      toast('Deleted');
      await reloadContentTab();
    });
  });

  // Filters
  const filterStatus = root.querySelector('#adm-pipe-filter-status');
  const filterPlatform = root.querySelector('#adm-pipe-filter-platform');
  function applyFilters() {
    const status = filterStatus?.value || '';
    const platform = filterPlatform?.value || '';
    root.querySelectorAll('.adm-pipeline-card').forEach(card => {
      const id = card.dataset.pipelineId;
      const item = pipeline.find(p => p.id === id);
      if (!item) return;
      const show = (!status || item.status === status) && (!platform || item.platform === platform);
      card.style.display = show ? '' : 'none';
      const detail = root.querySelector(`[data-detail-for="${id}"]`);
      if (detail && !show) detail.hidden = true;
    });
  }
  if (filterStatus) filterStatus.addEventListener('change', applyFilters);
  if (filterPlatform) filterPlatform.addEventListener('change', applyFilters);
}

async function reloadContentTab() {
  const [res, pinRes] = await Promise.all([
    getContentPipeline(_adminUser.id),
    getPinterestPinStats(),
  ]);
  const container = root.querySelector('#adm-s-content');
  if (container) {
    container.innerHTML = renderContent(res.data, pinRes.data);
    wireContentPipeline(res.data);
    wireChecklists();
  }
}

// ── Wire checklists ──────────────────────────────────────────────────────────

function wireChecklists() {
  root.querySelectorAll('[data-check]').forEach(el => {
    el.addEventListener('click', () => {
      const key = el.dataset.check;
      const isDone = el.classList.contains('adm-check--done');
      const next = !isDone;
      setCheckItem(key, next);
      el.classList.toggle('adm-check--done', next);
      el.innerHTML = next ? '&#10003;' : '';
      const label = el.nextElementSibling;
      if (label) {
        label.style.textDecoration = next ? 'line-through' : '';
        label.style.color = next ? 'var(--mid)' : '';
      }
    });
  });
}

// ── Section: Pricing ──────────────────────────────────────────────────────────

function renderPricing() {
  // ── Build bundle tracker data ────────────────────────────────────────────
  const existingBundles = Object.entries(BUNDLES).map(([id, b]) => ({
    id,
    name: b.label,
    description: b.description,
    type: b.curated ? 'curated' : 'mix-and-match',
    category: b.category || 'any',
    patterns: b.garmentIds || [],
    patternCount: b.patternCount,
    priceCents: b.cents,
    retailCents: b.retailCents || null,
    status: 'implemented',
  }));

  const suggestedBundles = [
    {
      id: 'beginner-starter',
      name: 'Beginner Starter Pack',
      description: 'All Simple-tier base patterns. Elastic waists, minimal shaping, ideal first makes.',
      type: 'skill-level',
      category: 'unisex',
      patterns: ['gym-shorts', 'swim-trunks', 'tee', 'fitted-tee-w', 'slip-skirt-w', 'easy-pant-w', 'apron', 'bow-tie', 'tank-top', 'circle-skirt-w', 'pencil-skirt-w', 'leggings'],
      patternCount: 12,
      priceCents: 5900,
      retailCents: 10800,
      status: 'needs-implementation',
    },
    {
      id: 'level-up',
      name: 'Level-Up Pack',
      description: 'Graduate from beginner. Core patterns that introduce zippers, collars, and shaping.',
      type: 'skill-level',
      category: 'unisex',
      patterns: ['cargo-shorts', 'straight-jeans', 'camp-shirt', 'a-line-skirt-w'],
      patternCount: 4,
      priceCents: 3900,
      retailCents: 5600,
      status: 'needs-implementation',
    },
    {
      id: 'all-tops',
      name: 'All Tops Bundle',
      description: 'Every upper-body base pattern: tees, shirts, sweatshirts, jackets.',
      type: 'category',
      category: 'unisex',
      patterns: ['tee', 'fitted-tee-w', 'tank-top', 'camp-shirt', 'button-up', 'crewneck', 'hoodie', 'shell-blouse-w', 'button-up-w', 'crop-jacket', 'denim-jacket', 'athletic-formal-jacket'],
      patternCount: 12,
      priceCents: 7900,
      retailCents: 16800,
      status: 'needs-implementation',
    },
    {
      id: 'all-bottoms',
      name: 'All Bottoms Bundle',
      description: 'Every lower-body base pattern: shorts, jeans, trousers, skirts, leggings.',
      type: 'category',
      category: 'unisex',
      patterns: ['gym-shorts', 'swim-trunks', 'cargo-shorts', 'baggy-shorts', 'pleated-shorts', 'straight-jeans', 'baggy-jeans', 'chinos', 'sweatpants', 'pleated-trousers', 'easy-pant-w', 'straight-trouser-w', 'wide-leg-trouser-w', 'slip-skirt-w', 'a-line-skirt-w', 'circle-skirt-w', 'pencil-skirt-w', 'leggings', 'cargo-work-pants', 'athletic-formal-trousers'],
      patternCount: 20,
      priceCents: 9900,
      retailCents: 26200,
      status: 'needs-implementation',
    },
    {
      id: 'complete-womenswear',
      name: 'Complete Womenswear',
      description: 'All womenswear base patterns: tops, skirts, trousers, dresses.',
      type: 'category',
      category: 'womenswear',
      patterns: ['fitted-tee-w', 'easy-pant-w', 'slip-skirt-w', 'a-line-skirt-w', 'straight-trouser-w', 'wide-leg-trouser-w', 'shell-blouse-w', 'button-up-w', 'circle-skirt-w', 'pencil-skirt-w', 'shirt-dress-w', 'wrap-dress-w', 'tshirt-dress-w', 'slip-dress-w', 'a-line-dress-w', 'sundress-w'],
      patternCount: 16,
      priceCents: 8900,
      retailCents: 22200,
      status: 'needs-implementation',
    },
    {
      id: 'all-dresses',
      name: 'All Dresses',
      description: 'Every dress base pattern in the catalog.',
      type: 'category',
      category: 'womenswear',
      patterns: ['shirt-dress-w', 'wrap-dress-w', 'tshirt-dress-w', 'slip-dress-w', 'a-line-dress-w', 'sundress-w'],
      patternCount: 6,
      priceCents: 4900,
      retailCents: 8600,
      status: 'needs-implementation',
    },
    {
      id: 'summer-essentials',
      name: 'Summer Essentials',
      description: 'Warm-weather patterns: shorts, swim trunks, tee, camp shirt, sundress, tote.',
      type: 'seasonal',
      category: 'unisex',
      patterns: ['gym-shorts', 'swim-trunks', 'tee', 'camp-shirt', 'sundress-w', 'tote-bag'],
      patternCount: 6,
      priceCents: 3900,
      retailCents: 6800,
      status: 'needs-implementation',
    },
    {
      id: 'fall-layers',
      name: 'Fall Layering',
      description: 'Layer up: crewneck, hoodie, denim jacket, jeans, chinos.',
      type: 'seasonal',
      category: 'unisex',
      patterns: ['crewneck', 'hoodie', 'denim-jacket', 'straight-jeans', 'chinos'],
      patternCount: 5,
      priceCents: 5500,
      retailCents: 8000,
      status: 'needs-implementation',
    },
    {
      id: 'his-hers-basics',
      name: 'His & Hers Basics',
      description: 'Matching basics for two: T-Shirt + Fitted Tee, Gym Shorts + Easy Pant, Sweatpants.',
      type: 'matching',
      category: 'unisex',
      patterns: ['tee', 'fitted-tee-w', 'gym-shorts', 'easy-pant-w', 'sweatpants'],
      patternCount: 5,
      priceCents: 3500,
      retailCents: 5000,
      status: 'needs-implementation',
      note: 'Requires two measurement profiles at checkout',
    },
    {
      id: 'full-catalog',
      name: 'Full Catalog (All 42 Base Patterns)',
      description: 'Every base pattern in the shop. The ultimate value for serious sewists.',
      type: 'mega',
      category: 'unisex',
      patterns: 'all',
      patternCount: 42,
      priceCents: 19900,
      retailCents: 54600,
      status: 'needs-implementation',
    },
  ];

  const allBundles = [...existingBundles, ...suggestedBundles];
  const implCount = allBundles.filter(b => b.status === 'implemented').length;
  const needsCount = allBundles.filter(b => b.status === 'needs-implementation').length;

  function bundleStatusBadge(status) {
    if (status === 'implemented') return '<span class="adm-badge adm-badge--implemented">[ok] implemented</span>';
    return '<span class="adm-badge adm-badge--needs-impl">[--] needs implementation</span>';
  }

  function patternChips(patterns) {
    if (patterns === 'all') return '<span style="font-size:.68rem;color:var(--mid);font-style:italic">all base patterns</span>';
    if (!patterns || patterns.length === 0) return '<span style="font-size:.68rem;color:var(--mid);font-style:italic">user-selected (any)</span>';
    return patterns.map(id => {
      const p = PATTERN_PRICES[id];
      const label = p?.label || id;
      const tierCls = p?.tier || '';
      return `<span class="adm-pattern-chip adm-chip--${tierCls}" title="${tierCls} - $${p ? (p.cents / 100).toFixed(0) : '?'}">${label}</span>`;
    }).join(' ');
  }

  function savings(bundle) {
    if (!bundle.retailCents || !bundle.priceCents) return '';
    const pct = Math.round((1 - bundle.priceCents / bundle.retailCents) * 100);
    return `<span style="font-size:.68rem;color:var(--mid)">Save ${pct}% vs individual (${money(bundle.retailCents)} retail)</span>`;
  }

  // Group bundles by type
  const typeLabels = {
    'mix-and-match': 'Mix & Match',
    'curated': 'Curated (Live)',
    'skill-level': 'Skill Level',
    'category': 'Category',
    'seasonal': 'Seasonal',
    'matching': 'Matching',
    'mega': 'Full Catalog',
  };
  const typeOrder = ['mix-and-match', 'curated', 'skill-level', 'category', 'seasonal', 'matching', 'mega'];
  const grouped = {};
  for (const b of allBundles) {
    if (!grouped[b.type]) grouped[b.type] = [];
    grouped[b.type].push(b);
  }

  const bundleHtml = typeOrder
    .filter(type => grouped[type])
    .map(type => `
      <h3 style="font-size:.78rem;font-weight:600;color:var(--gold);margin:20px 0 8px;border-bottom:1px solid var(--bdr);padding-bottom:4px">${typeLabels[type] || type} (${grouped[type].length})</h3>
      ${grouped[type].map(b => `
        <div class="adm-roadmap-card" style="margin-bottom:10px">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;margin-bottom:6px">
            <div>
              <strong>${b.name}</strong>
              ${b.category !== 'any' ? `<span style="font-size:.65rem;color:var(--mid);margin-left:6px">${b.category}</span>` : ''}
            </div>
            <div style="display:flex;gap:8px;align-items:center">
              <span class="adm-gold" style="font-weight:600;font-size:.9rem">${money(b.priceCents)}</span>
              ${bundleStatusBadge(b.status)}
            </div>
          </div>
          <p style="font-size:.72rem;color:var(--mid);margin:0 0 6px">${b.description}</p>
          <div style="font-size:.72rem;margin-bottom:4px"><strong>${b.patternCount}</strong> patterns: ${patternChips(b.patterns)}</div>
          ${savings(b)}
          ${b.note ? `<div style="font-size:.68rem;color:var(--mid);font-style:italic;margin-top:4px">Note: ${b.note}</div>` : ''}
        </div>
      `).join('')}
    `).join('');

  return `
    <h2 class="adm-section-title">Pricing Structure</h2>

    <div class="adm-roadmap-card">
      <h3>Pattern Pricing Tiers (acquisition funnel)</h3>
      <table class="adm-table">
        <thead><tr><th>Tier</th><th>Price</th><th>Target</th></tr></thead>
        <tbody>
          <tr><td class="bold">Free</td><td class="adm-gold" style="font-weight:600">$0</td><td>Lead magnets - email capture, trust building (scrunchie, dog bandana, face mask)</td></tr>
          <tr><td class="bold">Quick</td><td class="adm-gold" style="font-weight:600">$5</td><td>Non-garment projects - bags, home decor, accessories, pet items</td></tr>
          <tr><td class="bold">Simple</td><td class="adm-gold" style="font-weight:600">$9</td><td>Beginner garments - elastic waists, pull-on, minimal shaping</td></tr>
          <tr><td class="bold">Core</td><td class="adm-gold" style="font-weight:600">$14</td><td>Standard closures, moderate shaping, multiple pieces</td></tr>
          <tr><td class="bold">Tailored</td><td class="adm-gold" style="font-weight:600">$19</td><td>Detailed construction - pleats, darts, linings, boning, precision fit</td></tr>
        </tbody>
      </table>
    </div>

    <div class="adm-roadmap-card">
      <h3>Sewing Difficulty Levels</h3>
      <table class="adm-table">
        <thead><tr><th>Level</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td class="bold">Beginner</td><td>Few pieces, straight seams, elastic waists, minimal fitting</td></tr>
          <tr><td class="bold">Intermediate</td><td>Multiple pieces, zips/buttons, moderate shaping, darts</td></tr>
          <tr><td class="bold">Advanced</td><td>Complex construction, boning, tailoring, precision fitting</td></tr>
        </tbody>
      </table>
    </div>

    <h2 class="adm-section-title" style="margin-top:32px">Bundle Tracker</h2>
    <div class="adm-stat-grid" style="margin-bottom:20px">
      <div class="adm-stat"><div class="adm-stat-label">Total Bundles</div><div class="adm-stat-val">${allBundles.length}</div></div>
      <div class="adm-stat"><div class="adm-stat-label">Implemented</div><div class="adm-stat-val">${implCount}</div></div>
      <div class="adm-stat"><div class="adm-stat-label">Needs Impl.</div><div class="adm-stat-val">${needsCount}</div></div>
    </div>
    ${bundleHtml}

    <h2 class="adm-section-title" style="margin-top:32px">Membership & Revenue</h2>

    <div class="adm-roadmap-card">
      <h3>Planned Membership Tiers (Phase 3)</h3>
      <table class="adm-table">
        <thead><tr><th>Plan</th><th>Price</th><th>Includes</th></tr></thead>
        <tbody>
          <tr><td class="bold">Club</td><td class="adm-gold" style="font-weight:600">$12/mo</td><td>1 credit/month, member pricing 20% off</td></tr>
          <tr><td class="bold">Wardrobe</td><td class="adm-gold" style="font-weight:600">$24/mo</td><td>3 credits/month, early access, premium exports</td></tr>
          <tr><td class="bold">Annual</td><td class="adm-gold" style="font-weight:600">2 months free</td><td>Annual pricing on either plan</td></tr>
          <tr><td class="bold">Professional</td><td class="adm-gold" style="font-weight:600">$50/mo</td><td>Commercial use rights, client profiles, bulk downloads</td></tr>
        </tbody>
      </table>
      <p style="font-size:.72rem;color:var(--mid);margin-top:8px">Credit system: 1 credit = 1 pattern, rolls over 3 months</p>
    </div>

    <div class="adm-roadmap-card">
      <h3>Other Revenue Channels</h3>
      <table class="adm-table">
        <thead><tr><th>Channel</th><th>Details</th></tr></thead>
        <tbody>
          <tr><td class="bold">Etsy + Craftsy</td><td>Graded sized PDFs (XS-3X) at $12-15/pattern</td></tr>
          <tr><td class="bold">Branded beginner kit</td><td>$25-30, physical product</td></tr>
          <tr><td class="bold">Branded tape measure</td><td>$12-15, physical product</td></tr>
          <tr><td class="bold">School/institutional</td><td>Bulk pricing for classes</td></tr>
        </tbody>
      </table>
    </div>
  `;
}

// ── Deep Autumn Palette ──────────────────────────────────────────────────────
const DEEP_AUTUMN_PALETTE = [
  {
    group: 'Neutrals',
    swatches: [
      { name: 'Cream',         hex: '#EDE4D3' },
      { name: 'Warm Charcoal', hex: '#3A3835' },
      { name: 'Chocolate',     hex: '#8C573A' },
      { name: 'Dark Brown',    hex: '#3D2914' },
    ],
  },
  {
    group: 'Earth Tones',
    swatches: [
      { name: 'Rust',          hex: '#924819' },
      { name: 'Terracotta',    hex: '#BF4C2B' },
      { name: 'Mustard',       hex: '#DDA631' },
      { name: 'Cafe au Lait',  hex: '#A78851' },
    ],
  },
  {
    group: 'Greens',
    swatches: [
      { name: 'Muddy Olive',   hex: '#675100' },
      { name: 'Army Green',    hex: '#404C24' },
      { name: 'Spanish Bistre',hex: '#71803C' },
    ],
  },
  {
    group: 'Accents',
    swatches: [
      { name: 'Burgundy',      hex: '#954344' },
      { name: 'Old Mauve',     hex: '#5E3343' },
      { name: 'Deep Teal',     hex: '#2A6B6B' },
      { name: 'Indigo Denim',  hex: '#4A6FA5' },
    ],
  },
];

// ── Section: Reference (social, shipped, seasonal) ───────────────────────────

function renderReference() {
  return `
    <h2 class="adm-section-title">Quick Reference</h2>

    <div class="adm-roadmap-card adm-palette-card">
      <h3>Deep Autumn Color Palette</h3>
      <p style="margin-bottom:12px">Dark. Muted. Warm. Earthy tones with golden undertones. These are your foundation colors for fabric shopping and wardrobe planning.</p>
      ${DEEP_AUTUMN_PALETTE.map(group => `
        <div class="adm-palette-group">
          <div class="adm-palette-group-label">${group.group}</div>
          <div class="adm-swatch-row">
            ${group.swatches.map(s => `
              <div class="adm-swatch">
                <div class="adm-swatch-chip" style="background:${s.hex};" title="${s.name} ${s.hex}"></div>
                <div class="adm-swatch-name">${s.name}</div>
                <div class="adm-swatch-hex">${s.hex}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('')}
    </div>

    <div class="adm-roadmap-card">
      <h3>Social Accounts</h3>
      <table class="adm-table">
        <thead><tr><th>Platform</th><th>Handle</th></tr></thead>
        <tbody>
          <tr><td class="bold">Instagram</td><td><a href="https://instagram.com/peoplespatterns" target="_blank" style="color:var(--gold)">@peoplespatterns</a></td></tr>
          <tr><td class="bold">Threads</td><td><a href="https://threads.net/@peoplespatterns" target="_blank" style="color:var(--gold)">@peoplespatterns</a></td></tr>
          <tr><td class="bold">Facebook</td><td><a href="https://facebook.com/peoplespatterns" target="_blank" style="color:var(--gold)">@peoplespatterns</a></td></tr>
          <tr><td class="bold">Pinterest</td><td><a href="https://pinterest.com/peoplespatterns" target="_blank" style="color:var(--gold)">@peoplespatterns</a></td></tr>
          <tr><td class="bold">Etsy</td><td><a href="https://etsy.com/shop/peoplespatterns" target="_blank" style="color:var(--gold)">@peoplespatterns</a></td></tr>
          <tr><td class="bold">TikTok Shop</td><td><a href="https://tiktok.com/@peoplespatterns" target="_blank" style="color:var(--gold)">@peoplespatterns</a></td></tr>
          <tr><td class="bold">TikTok</td><td><a href="https://tiktok.com/@peoplespatternsofficial" target="_blank" style="color:var(--gold)">@peoplespatternsofficial</a></td></tr>
          <tr><td class="bold">YouTube</td><td><a href="https://youtube.com/@peoplespatterns" target="_blank" style="color:var(--gold)">@peoplespatterns</a></td></tr>
          <tr><td class="bold">Reddit</td><td><a href="https://reddit.com/user/peoplespatterns" target="_blank" style="color:var(--gold)">u/peoplespatterns</a></td></tr>
          <tr><td class="bold">Newsletter</td><td><a href="mailto:hello@peoplespatterns.com" style="color:var(--gold)">hello@peoplespatterns.com</a></td></tr>
        </tbody>
      </table>
    </div>

    <div class="adm-roadmap-card">
      <h3>Seasonal Calendar</h3>
      <table class="adm-table">
        <thead><tr><th>Target</th><th>Pattern</th><th>Notes</th></tr></thead>
        <tbody>
          <tr><td class="bold">October</td><td>Halloween Costume Base</td><td>Modular base, seasonal spike</td></tr>
          <tr><td class="bold">November</td><td>Holiday Party Dress</td><td>Fit-and-flare or cocktail base, occasion fabrics</td></tr>
          <tr><td class="bold">December</td><td>Christmas Stocking + Advent Calendar</td><td>Quick $5 projects, gift-making season</td></tr>
          <tr><td class="bold">Year-round</td><td>Plush Octopus</td><td>Social media magnet, kid-friendly, evergreen gift</td></tr>
        </tbody>
      </table>
    </div>

    <div class="adm-roadmap-card">
      <h3>What's Shipped</h3>
      <ul class="adm-checklist">
        ${[
          '42 garment modules built and code-complete (84 with variants)',
          'Pattern generation engine working',
          'Print layout with tiling and scale verification',
          'Single PDF renderer (Puppeteer + html-pdf-node)',
          'Supabase backend (auth, profiles, purchases, fit history, downloads)',
          'Stripe checkout with 5-tier pricing ($0/$5/$9/$14/$19)',
          'Watermarked preview until purchase',
          'Email via Resend (welcome, purchase, feedback request)',
          'Email signup forms on landing, FAQ, privacy pages',
          'Vercel serverless functions (webhooks, email, PDF)',
          'PostHog analytics with custom event tracking',
          'A/B testing via PostHog feature flags',
          'Fit feedback system in account dashboard',
          'Affiliate links in materials lists',
          'Gift cards (account dashboard)',
          'Account dashboard (measurements, patterns, projects, wishlist, orders, gift cards, settings)',
          'Per-edge seam allowances on all patterns',
          'Bust dart geometry on womenswear tops',
          'Polygon sanitizer (dedup, collinear, CW winding)',
          'Notches on all patterns',
          'Sleeve cap to armhole validation',
          'Grainline arrows and fold indicators on all pieces',
          'cm / inch toggle',
          'Domain: peoplespatterns.com',
          'All social handles secured',
          'Brand kit complete (fonts, colors, avatars, banners)',
          'FAQ page with schema markup',
          'Pricing page',
          'Sitemap generation',
          'Repo made private',
        ].map(item => `<li><span class="adm-check adm-check--done">&#10003;</span><span style="color:var(--mid)">${item}</span></li>`).join('')}
      </ul>
    </div>

    <div class="adm-roadmap-card">
      <h3>Competitive Positioning</h3>
      <p>Top indie brands Gen Z follows: <strong>Friday Pattern Company, Closet Core, Megan Nielsen, Helen's Closet, Papercut Patterns, Merchant & Mills</strong> - all use standard sizing.</p>
      <p>Big 4 (Simplicity, McCall's, Butterick, Vogue) are slow to adapt to trend cycles.</p>
      <p><span class="adm-gold" style="font-weight:600">No MTM brand combines modern/trending styling with true custom-fit. We own this gap.</span></p>
    </div>

    <div class="adm-roadmap-card">
      <h3>MYOG Push (Month 2-3)</h3>
      <ul class="adm-checklist">
        ${[
          { key: 'myog-tote', label: 'Tote, crossbody - list on r/myog immediately' },
          { key: 'myog-frame-bag', label: 'Bikepacking frame bag - custom to exact bike triangle (killer product)' },
          { key: 'myog-duffle', label: 'Duffle, daypack - post after bag modules proven' },
          { key: 'myog-backpack', label: 'Technical backpack - long-term, high complexity' },
        ].map(item => {
          const cl = getChecklist();
          return `<li>
            <span class="adm-check${cl[item.key] ? ' adm-check--done' : ''}" data-check="${item.key}">${cl[item.key] ? '&#10003;' : ''}</span>
            <span${cl[item.key] ? ' style="text-decoration:line-through;color:var(--mid)"' : ''}>${item.label}</span>
          </li>`;
        }).join('')}
      </ul>
    </div>
  `;
}

// ── Section: Founder's Select ─────────────────────────────────────────────────

const FS_GARMENTS = [
  { id: 'camp-shirt', name: 'Camp Shirt (x3-4)', pattern: 'Camp Shirt / Vacation Shirt', slug: 'camp-shirt', fabric: 'Mid-weight linen (5.5-7 oz/yd2) or rayon challis', yardage: '2-2.5 yd', colors: ['Rust solid','Olive solid','Bold warm floral/geometric print','Cream solid'], notions: '5-6 buttons (coconut shell or matte horn), matching thread', tips: 'Rayon challis drapes beautifully for camp shirts but wrinkles less than linen. Pre-wash all fabric before cutting. Linen shrinks 5-10%, rayon challis 3-5%. For prints, go BOLD. Large-scale florals, paisleys, or geometrics. Small prints get lost on an FN frame.', local: [{store:'Mood Fabrics Houston',note:'Best selection of linen solids + rayon challis prints'},{store:'Hobby Lobby',note:'Budget linen blends and rayon challis prints'}], online: [{store:'Mood Fabrics',url:'moodfabrics.com',note:'Premium linen, huge rayon challis print selection'},{store:'Cali Fabrics',url:'califabrics.com',note:'Great rayon challis prints at good prices'},{store:'Style Maker Fabrics',url:'stylemakerfabrics.com',note:'Curated apparel fabrics, easy to browse by garment type'},{store:'LA Finch Fabrics',url:'lafinchfabrics.com',note:'Deadstock designer rayon and linen at discount'}] },
  { id: 'oversized-tee', name: 'Oversized Tee (x4-5)', pattern: 'Oversized Tee', slug: 'oversized-tee', fabric: 'Heavyweight cotton jersey (7-10 oz/yd2)', yardage: '1.5-2 yd', colors: ['Burgundy/wine','Cream/off-white','Mustard','Charcoal','Deep teal'], notions: 'Matching thread, ballpoint/jersey needle, twin needle for hems', tips: 'You want HEAVYWEIGHT cotton jersey. 8 oz+ minimum. Thin jersey will cling and look cheap on your frame. Comfort Colors weight (6.1 oz) is the floor. Look for garment-dyed or pigment-dyed jersey for that lived-in look. Use a walking foot or serger for knits.', local: [{store:'Mood Fabrics Houston',note:'Designer jersey knits'},{store:'JoAnn Fabrics',note:'Basic cotton jersey solids, affordable'}], online: [{store:'LA Finch Fabrics',url:'lafinchfabrics.com',note:'Deadstock heavyweight jersey, great colors'},{store:'Raspberry Creek Fabrics',url:'raspberrycreekfabrics.com',note:'Known for quality knits'},{store:'Mood Fabrics',url:'moodfabrics.com',note:'Premium cotton jersey'},{store:'Harts Fabric',url:'hartsfabrics.com',note:'Good knit selection, fair prices'}] },
  { id: 'linen-shirt', name: 'Linen Shirt (x1-2)', pattern: 'Linen Shirt', slug: 'linen-shirt', fabric: 'Mid-weight linen (5.5-7 oz/yd2)', yardage: '2.5-3 yd', colors: ['Terracotta','Dark olive'], notions: '7-8 buttons (natural wood or coconut shell), matching thread', tips: 'Mid-weight linen (IL019 weight) is the sweet spot. Structured enough for a shirt but not stiff. fabrics-store.com has the widest color range of pure linen at reasonable prices. Pre-wash and dry on high heat to get all shrinkage out before cutting.', local: [{store:'Mood Fabrics Houston',note:'Wide range of linen weights and colors'},{store:'Hobby Lobby',note:'Budget linen blends in earth tones'}], online: [{store:'Mood Fabrics',url:'moodfabrics.com',note:'Largest online linen selection'},{store:'Fabric Store (The)',url:'thefabricstore.com',note:'Premium European linen, beautiful drape'},{store:'fabrics-store.com',url:'fabrics-store.com',note:'Pure linen by the yard, tons of colors, great prices'}] },
  { id: 'straight-jeans', name: 'Straight Jeans (x2)', pattern: 'Straight Jeans', slug: 'straight-jeans', fabric: '12 oz non-stretch denim or 11 oz stretch denim (2% elastane)', yardage: '3-3.5 yd', colors: ['Medium wash indigo','Dark indigo (raw)'], notions: 'Jeans zipper (7"), jeans button, rivets (optional), topstitch thread (gold/copper), denim needle (16/100), waistband interfacing', tips: 'For your first pair, 11 oz stretch denim is more forgiving to sew and more comfortable. For raw denim, buy dark indigo and let it develop its own wash over time. Use gold/copper topstitch thread. It is a warm-toned detail that matches your Deep Autumn palette. Buy a jeans hardware kit (button + rivets).', local: [{store:'Mood Fabrics Houston',note:'Cone Mills and designer denim'}], online: [{store:'Mood Fabrics',url:'moodfabrics.com',note:'Best denim selection. Cone Mills, Japanese denim'},{store:'Pacific Blue Denims',url:'pacificbluedenims.com',note:'Specialty denim shop, raw and washed'},{store:'Blackbird Fabrics',url:'blackbirdfabrics.com',note:'Curated denim + jeans hardware kits'},{store:'Threadbare Fabrics',url:'threadbarefabrics.com',note:'Deadstock denim at good prices'}] },
  { id: 'baggy-jeans', name: 'Baggy Jeans (x1)', pattern: 'Baggy Jeans', slug: 'baggy-jeans', fabric: '12 oz non-stretch denim', yardage: '3.5-4 yd', colors: ['Medium wash indigo'], notions: 'Same as Straight Jeans', tips: 'Non-stretch is better here. The wide leg holds its shape better without elastane. Same hardware and construction as straight jeans. More yardage needed for the wider leg.', local: [{store:'Mood Fabrics Houston',note:'Cone Mills denim'}], online: [{store:'Pacific Blue Denims',url:'pacificbluedenims.com',note:'Wide selection of medium wash'},{store:'Mood Fabrics',url:'moodfabrics.com',note:'Designer denim options'}] },
  { id: 'baggy-shorts', name: 'Baggy Shorts / Jorts (x2)', pattern: 'Baggy Shorts', slug: 'baggy-shorts', fabric: '10-12 oz denim or canvas', yardage: '1.5-2 yd', colors: ['Light wash denim','Olive canvas'], notions: 'Jeans zipper, button, topstitch thread, denim needle', tips: 'For jorts, you can also buy thrifted jeans and cut them. But custom-drafted gives you the right rise and leg width for your body. Canvas jorts in olive are extremely Houston-summer-appropriate.', local: [{store:'Mood Fabrics Houston',note:'Denim and canvas'},{store:'JoAnn Fabrics',note:'Canvas in olive/earth tones'}], online: [{store:'Mood Fabrics',url:'moodfabrics.com',note:'Light wash denim'},{store:'Big Duck Canvas',url:'bigduckcanvas.com',note:'Canvas by the yard, many weights and colors'}] },
  { id: 'pleated-trousers', name: 'Pleated Trousers (x1)', pattern: 'Pleated Trousers', slug: 'pleated-trousers', fabric: 'Wool-poly blend suiting (8-10 oz) or heavy cotton twill', yardage: '3-3.5 yd', colors: ['Chocolate brown'], notions: 'Trouser zipper (9"), hook and bar closure, pocketing fabric (cotton), waistband interfacing, matching thread', tips: 'For Houston, a tropical weight wool-poly blend (8 oz) breathes well year-round. Chocolate brown is a Deep Autumn essential. It reads dressier than khaki but warmer than black. Do not skip the pocketing fabric. Use cotton shirting for clean interior pockets.', local: [{store:'Mood Fabrics Houston',note:'Suiting fabrics and wool blends'}], online: [{store:'Mood Fabrics',url:'moodfabrics.com',note:'Largest suiting selection online'},{store:'B&J Fabrics',url:'bandjfabrics.com',note:'NYC garment district quality, great wool/poly blends'},{store:'Emma One Sock',url:'emmaonesock.com',note:'Curated suiting and bottom-weight fabrics'}] },
  { id: 'chinos', name: 'Chinos (x1)', pattern: 'Chinos', slug: 'chinos', fabric: 'Cotton twill or stretch cotton twill (7-9 oz)', yardage: '2.5-3 yd', colors: ['Olive'], notions: 'Zipper, button/hook closure, matching thread, waistband interfacing', tips: 'Stretch twill (3% elastane) is more comfortable for daily wear but non-stretch holds its shape better over time. Olive is the most versatile FN chino color. Pairs with every top in your palette.', local: [{store:'Mood Fabrics Houston',note:'Cotton twill in earth tones'}], online: [{store:'Mood Fabrics',url:'moodfabrics.com',note:'Good twill selection'},{store:'Style Maker Fabrics',url:'stylemakerfabrics.com',note:'Bottom-weight fabrics section'},{store:'Blackbird Fabrics',url:'blackbirdfabrics.com',note:'Curated twill and bottom-weights'}] },
  { id: 'chambray-work-shirt', name: 'Chambray Work Shirt (x1)', pattern: 'Chambray Work Shirt', slug: 'chambray-work-shirt', fabric: 'Chambray (5-7 oz)', yardage: '2.5-3 yd', colors: ['Classic indigo chambray'], notions: '7-8 buttons (natural or metal snap), matching thread', tips: 'Chambray looks like denim but is much lighter. It is plain-woven, not twill. Perfect shirt-weight fabric for Houston. Robert Kaufman Chambray Union is the gold standard. This is one of the few places where a cooler blue works because the fabric texture warms it up.', local: [{store:'Mood Fabrics Houston',note:'Quality chambray'}], online: [{store:'Mood Fabrics',url:'moodfabrics.com',note:'Multiple chambray weights'},{store:'Blackbird Fabrics',url:'blackbirdfabrics.com',note:'Good chambray options'}] },
  { id: 'denim-jacket', name: 'Lightweight Denim Jacket (x1)', pattern: 'Denim Jacket', slug: 'denim-jacket', fabric: '8-10 oz denim', yardage: '3-3.5 yd', colors: ['Medium wash'], notions: 'Metal snaps or buttons, topstitch thread (gold), denim needle, interfacing', tips: '8 oz is ideal. Heavy enough to hold structure but light enough for Houston layering. You will wear this open over tees and camp shirts most of the time, so the fit through the shoulders matters most. Gold topstitch thread keeps it in your warm palette.', local: [{store:'Mood Fabrics Houston',note:'Multiple denim weights'}], online: [{store:'Mood Fabrics',url:'moodfabrics.com',note:'8 oz denim in various washes'},{store:'Pacific Blue Denims',url:'pacificbluedenims.com',note:'Lightweight denim specialty'}] },
  { id: 'open-cardigan', name: 'Open Cardigan / Shacket (x1-2)', pattern: 'Open Cardigan', slug: 'open-cardigan', fabric: 'Heavyweight cotton twill, wool blend, or flannel (10-14 oz)', yardage: '3-4 yd', colors: ['Earth tone patchwork','Solid chocolate or olive wool blend'], notions: 'No closures needed (open front). Matching thread only.', tips: 'This is your highest-impact garment. For the patchwork version, buy 3-4 different wool or flannel remnants in complementary warm tones and piece them together. For a solid version, a boiled wool or heavy cotton canvas in chocolate or olive. No buttons, no zipper. The whole point is that it hangs open.', local: [{store:'Mood Fabrics Houston',note:'Wool blends, heavy cotton, flannel'},{store:'Thrift stores',note:'Buy wool blankets to cut up for patchwork versions'}], online: [{store:'Mood Fabrics',url:'moodfabrics.com',note:'Wool coating, flannel, heavy cotton'},{store:'Fabric Mart',url:'fabricmartfabrics.com',note:'Discount designer woolens and heavy wovens'},{store:'Pendleton Woolen Mill Store',url:'pendleton-usa.com',note:'Iconic wool fabrics, patchwork-worthy'}] },
  { id: 'crewneck', name: 'Crewneck Sweatshirt (x2)', pattern: 'Crewneck', slug: 'crewneck', fabric: 'French terry (10-12 oz)', yardage: '2-2.5 yd + 0.25 yd ribbing', colors: ['Charcoal','Burgundy'], notions: 'Matching thread, ballpoint needle, ribbing for cuffs/hem/neckband', tips: 'French terry has loops on the inside and a smooth face. It is what good sweatshirts are made of. Buy ribbing separately in a matching color for cuffs and hem. Heavyweight (12 oz+) will hold its shape better and not look flimsy.', local: [{store:'Mood Fabrics Houston',note:'French terry knits'},{store:'JoAnn Fabrics',note:'Basic french terry, limited colors'}], online: [{store:'LA Finch Fabrics',url:'lafinchfabrics.com',note:'Deadstock french terry in unusual colors'},{store:'Raspberry Creek Fabrics',url:'raspberrycreekfabrics.com',note:'Quality french terry'},{store:'Mood Fabrics',url:'moodfabrics.com',note:'Premium french terry selection'}] },
  { id: 'hoodie', name: 'Hoodie (x1)', pattern: 'Oversized Hoodie', slug: 'oversized-hoodie', fabric: 'Heavyweight french terry or fleece-back sweatshirt knit (12-14 oz)', yardage: '2.5-3 yd + 0.25 yd ribbing', colors: ['Olive','Cream'], notions: 'Matching thread, ballpoint needle, ribbing, drawcord, grommets (optional)', tips: 'Go heavyweight. 12 oz minimum. A flimsy hoodie looks cheap. Olive or cream keeps it in the Deep Autumn palette. The oversized version will be more FN-appropriate than the standard fit.', local: [{store:'Mood Fabrics Houston',note:'Sweatshirt fleece and french terry'}], online: [{store:'Raspberry Creek Fabrics',url:'raspberrycreekfabrics.com',note:'Heavy french terry for hoodies'},{store:'Mood Fabrics',url:'moodfabrics.com',note:'Fleece-back knits'}] },
  { id: 'longline-tee', name: 'Longline Tee (x2)', pattern: 'Longline Tee', slug: 'longline-tee', fabric: 'Medium-weight cotton jersey (6-8 oz)', yardage: '2-2.5 yd', colors: ['Cream','Charcoal'], notions: 'Matching thread, ballpoint needle, twin needle for hems', tips: 'Slightly lighter weight than your oversized tees. This is a layering piece that sits under jackets and open shirts. The extended length maintains your vertical line when layered.', local: [{store:'JoAnn Fabrics',note:'Basic jersey'},{store:'Mood Fabrics Houston',note:'Better jersey selection'}], online: [{store:'LA Finch Fabrics',url:'lafinchfabrics.com',note:'Jersey knits in good colors'},{store:'Mood Fabrics',url:'moodfabrics.com',note:'Premium jersey'}] },
  { id: 'cargo-shorts', name: 'Cargo Shorts (x1)', pattern: 'Cargo Shorts', slug: 'cargo-shorts', fabric: 'Cotton canvas or twill (8-10 oz)', yardage: '2-2.5 yd', colors: ['Olive'], notions: 'Zipper, button, matching thread, cargo pocket flap buttons or velcro', tips: 'You literally built People\'s Patterns starting with cargo shorts. This one is sentimental AND practical. Olive canvas, relaxed fit, functional pockets.', local: [{store:'JoAnn Fabrics',note:'Canvas and twill in earth tones'},{store:'Mood Fabrics Houston',note:'Better canvas options'}], online: [{store:'Big Duck Canvas',url:'bigduckcanvas.com',note:'Canvas specialist, many weights'},{store:'Mood Fabrics',url:'moodfabrics.com',note:'Cotton canvas'}] },
  { id: 'sweatpants', name: 'Sweatpants (x1)', pattern: 'Sweatpants', slug: 'sweatpants', fabric: 'French terry (10-12 oz)', yardage: '2.5-3 yd + ribbing', colors: ['Charcoal','Olive'], notions: 'Matching thread, elastic (1" wide), ballpoint needle, ribbing for cuffs', tips: 'Match the fabric to your crewneck sweatshirt for an easy set. Straight leg, not tapered. Tapered shortens your visual line.', local: [{store:'JoAnn Fabrics',note:'Basic french terry'}], online: [{store:'Raspberry Creek Fabrics',url:'raspberrycreekfabrics.com',note:'French terry'},{store:'Mood Fabrics',url:'moodfabrics.com',note:'French terry'}] },
  { id: 'tank-top', name: 'Tank Top (x2)', pattern: 'Tank Top', slug: 'tank-top', fabric: 'Cotton jersey (5-7 oz)', yardage: '1-1.5 yd', colors: ['Cream','Charcoal'], notions: 'Matching thread, ballpoint needle', tips: 'Base layer under open camp shirts and linen shirts. Keep it simple. Solid colors, nothing competing with the outer layer. Quick beginner sew.', local: [{store:'JoAnn Fabrics',note:'Cotton jersey basics'}], online: [{store:'LA Finch Fabrics',url:'lafinchfabrics.com',note:'Jersey remnants at low prices'},{store:'Mood Fabrics',url:'moodfabrics.com',note:'Cotton jersey'}] },
  { id: 'tote-bag', name: 'Tote Bag (x1)', pattern: 'Tote Bag / Market Tote', slug: 'tote-bag', fabric: 'Waxed canvas or heavy cotton canvas (10-16 oz)', yardage: '1-1.5 yd', colors: ['Tan','Olive'], notions: 'Heavy-duty thread, leather straps (optional), rivets (optional), webbing for handles', tips: 'Waxed canvas is water-resistant and develops a beautiful patina over time. Tan or olive keeps it in palette. A quick, satisfying project to break up garment sewing.', local: [{store:'JoAnn Fabrics',note:'Canvas and webbing'}], online: [{store:'Big Duck Canvas',url:'bigduckcanvas.com',note:'Waxed canvas, heavy canvas, many colors'},{store:'Mood Fabrics',url:'moodfabrics.com',note:'Heavy canvas'},{store:'Tandy Leather',url:'tandyleather.com',note:'Leather strap handles and rivets'}] },
];

const FS_STORES = {
  essential: { name: 'Mood Fabrics Houston', address: '3461 W Alabama St, Houston, TX 77027', hours: 'Mon-Fri 9:30-6:30, Sat 10-5, Closed Sunday', note: 'Your #1 stop. 9,000 sq ft, opened Nov 2025. Linen, denim, rayon challis, wool, jersey. They have everything. Go here first for any fabric on this list.' },
  secondary: [
    { name: 'Hobby Lobby', note: 'Budget linen blends, basic rayon prints. Good for practice fabric.' },
    { name: 'JoAnn Fabrics', note: 'Cotton jersey, canvas, twill, basic notions. Reliable for basics.' },
    { name: 'Fabrictopia', address: '3301 Fondren Rd, Ste O', note: 'Discount fabrics. More formal/specialty focus (satins, lace) but worth checking for deals on basics.' },
    { name: 'Universal Fabric Center', note: 'Small local shop with some unique finds.' },
  ],
  topOnline: [
    { name: 'Mood Fabrics', url: 'moodfabrics.com', note: 'Largest selection across all fabric types' },
    { name: 'fabrics-store.com', url: 'fabrics-store.com', note: 'Best pure linen selection and pricing' },
    { name: 'Cali Fabrics', url: 'califabrics.com', note: 'Rayon challis prints. Camp shirt fabric heaven' },
    { name: 'LA Finch Fabrics', url: 'lafinchfabrics.com', note: 'Deadstock designer fabrics at 40-60% off' },
    { name: 'Style Maker Fabrics', url: 'stylemakerfabrics.com', note: 'Curated by garment type. Browse Tops or Pants' },
    { name: 'Blackbird Fabrics', url: 'blackbirdfabrics.com', note: 'Denim, twill, and hardware kits' },
    { name: 'Raspberry Creek', url: 'raspberrycreekfabrics.com', note: 'Best for knits. French terry, jersey' },
    { name: 'Big Duck Canvas', url: 'bigduckcanvas.com', note: 'Canvas and waxed canvas specialist' },
  ],
};

const FS_WEALTHY = {
  fabrics: [
    { name: 'Sea Island Cotton', bestFor: 'Tees, dress shirts, casual button-downs', notes: 'Longest and finest cotton staple. Described as strong as silk, durable as wool, soft as cashmere. Naturally lustrous. Shrinks ~3-5% on first wash. The benchmark for premium basics.', brands: 'Sunspel, Charvet' },
    { name: 'Cashmere', bestFor: 'Crewnecks, cardigans, lightweight knits', notes: '3x warmer than sheep wool, exquisitely soft. Sourced from Hircus goats in Inner Mongolia. Less durable than merino. Wash every 5-7 wears. Fold to store, never hang.', brands: 'Brunello Cucinelli, Loro Piana, John Smedley' },
    { name: 'Baby Cashmere', bestFor: 'Ultra-premium knitwear, scarves', notes: 'Finest grade cashmere, hand-collected from the neck and belly of young Hircus goats. Only ~30g per animal. Feather-light and incomparably soft. Reference-level luxury.', brands: 'Brunello Cucinelli, Loro Piana exclusively' },
    { name: 'Merino Wool', bestFor: 'Base layers, knitwear, travel pieces', notes: 'Naturally curly fiber traps air for insulation. Softer than standard wool. Better durability and elasticity than cashmere. Resists odor naturally. Wash every 3-5 wears.', brands: 'John Smedley, Icebreaker, Uniqlo Merino' },
    { name: 'Supima / Egyptian Cotton', bestFor: 'Tees, OCBD shirts, polos', notes: 'Long-staple American (Supima) or Egyptian cotton. Noticeably softer and more durable than standard cotton. Pima cotton is the accessible equivalent. Pre-wash cold before cutting.', brands: 'Sunspel, Vince, Todd Snyder' },
    { name: 'Linen', bestFor: 'Summer shirts, trousers, casual outerwear', notes: 'Best weight is 5.5-7 oz for shirts, 7-9 oz for trousers. Pre-wash on high heat — shrinks 5-10%. Gets softer with every wash. Accept the wrinkle; it reads as intentional at this quality level.', brands: 'Loro Piana, 120% Lino, fabrics-store.com' },
    { name: 'Silk-Linen Blend', bestFor: 'Summer trousers, elevated casual shirts', notes: 'Combines silk sheen with linen breathability. Complex surface texture reads as expensive. Less prone to wrinkling than pure linen. Dry clean only.', brands: 'Loro Piana, Zegna' },
    { name: 'Vicuña', bestFor: 'Reference only. The ceiling of luxury.', notes: 'Rarest natural fiber on earth. ~$3,000-5,000/yd. Collected from wild Andean vicuña during ceremonial shearings. Ultra-fine and incredibly warm. Loro Piana holds exclusive sourcing rights. Know it exists.', brands: 'Loro Piana exclusively' },
  ],
  garments: [
    { name: 'White Linen Button-Down', fabric: '5.5-7 oz linen', role: 'Summer anchor piece', notes: 'The single most versatile item in elevated casual. Wears alone, unbuttoned over a tee, tucked or untucked. Accept the natural wrinkle. Keep collar structure minimal — no stiff fusing.' },
    { name: 'OCBD Shirt', fabric: 'Oxford cloth cotton', role: 'Year-round workhorse', notes: 'Oxford Cloth Button-Down. The cornerstone of American prep. Soft collar roll is the hallmark of quality. Must be slightly oversized to achieve the right drape. Works with chinos, trousers, denim.' },
    { name: 'Premium Tee', fabric: 'Sea Island cotton or Supima, 7-9 oz', role: 'Everyday base', notes: 'Heavyweight matters. Under 6 oz looks cheap on the body. No branding. Neutral colors only: white, ecru, navy, charcoal, black. Invest in fabric quality here — this gets worn the most.' },
    { name: 'Merino or Cashmere Crewneck', fabric: 'Merino 12-ply or cashmere 2-ply', role: 'Fall/winter layer', notes: 'Wear over an OCBD or alone. Solid neutral only. No patterns. Fits slightly relaxed through the body. The garment that instantly elevates any casual outfit.' },
    { name: 'Navy Chinos', fabric: 'Cotton twill 7-9 oz', role: 'Versatile trouser', notes: 'The bridge between jeans and dress trousers. Flat front, straight or slightly tapered leg. No cargo pockets. Navy travels further than khaki. Belt loops with a slim leather belt.' },
    { name: 'Straight Trousers', fabric: 'Tropical weight wool or wool-poly 8-10 oz', role: 'Elevated casual bottom', notes: 'The upgrade from chinos. Single pleat optional. Unlined or half-lined for flexibility. Charcoal, camel, or olive. Breaks at the shoe — no pooling.' },
    { name: 'Polo Shirt', fabric: 'Pique cotton or fine merino', role: 'Smart casual essential', notes: 'Classic two-button placket only. No logo or micro-logo. Fits across the chest, tapers slightly. Goes with chinos, shorts, or trousers. Tuck for more formal settings.' },
    { name: 'Chore Coat / Overshirt', fabric: 'Heavy linen, moleskin, or brushed cotton 10-14 oz', role: 'Casual outer layer', notes: 'The relaxed alternative to a blazer. Worn open over a tee or crewneck. Four patch pockets. Loose through the body. Brown, olive, or washed black are the moves.' },
    { name: 'Merino Cardigan', fabric: 'Merino or fine wool', role: 'Versatile knit layer', notes: 'Full-button or half-zip. Replaces a blazer in casual settings. Fits like a light jacket — not a sweater stretched over a shirt. Navy, camel, or charcoal are the standard colors.' },
    { name: 'Quality Denim', fabric: '12-14 oz raw or washed selvedge', role: 'Casual foundation', notes: 'Straight or slightly tapered cut. No distressing, no branding on pockets. Raw denim develops personal fading over time. Japanese denim (Oni, Kurabo) or American (Cone Mills) for fabric quality.' },
  ],
  construction: [
    { technique: 'Single-Needle 2-Thread Stitching', applies: 'Dress shirts, fine casual shirts', notes: 'Stitches look identical inside and out. Finer and more precise than mass-market double-needle. Runs 1/16" from the seam edge with tight tension. The gold standard for shirt construction.' },
    { technique: 'Flat-Felled Seams', applies: 'Dress shirts, chinos, fine casual wear', notes: 'Both seam allowances folded and stitched flat. Strong, durable, no raw edges visible. Appears on side seams and sleeve seams in fine shirts. Doubles as a decorative detail.' },
    { technique: 'Gusset at Hem Junction', applies: 'Fine shirts', notes: 'Triangular fabric insert at the side seam/hem junction. Prevents tearing at the highest-stress point. Invisible when the shirt is untucked. Mark of serious construction quality.' },
    { technique: 'Rolled Hem (Hand-Stitched)', applies: 'Fine shirts, scarves', notes: '1/8" to 1/4" hem hand-rolled and stitched. Softer edge than any machine hem. Appears on shirt hem and cuffs in true bespoke shirts. Near-impossible to replicate by machine.' },
    { technique: 'Full Canvas Construction', applies: 'Jackets, blazers, sport coats', notes: 'Horsehair, linen, and wool canvas hand-stitched through the entire jacket front — not just the lapels. Canvas molds to the wearer\'s torso over years. The garment feels alive. Dry-clean only, worth it.' },
    { technique: 'Pad Stitching', applies: 'Jacket lapels and chest piece', notes: 'Hundreds of tiny diagonal hand stitches attaching canvas to lapel fabric. Creates natural curl and body in the lapel. Cannot be replicated by machine. The definitive mark of bespoke tailoring.' },
  ],
  footwear: [
    { style: 'Suede Loafer', materials: 'Suede upper, leather sole', notes: 'The unofficial shoe of old money. Horsebit or plain. Wear without socks or with no-show socks. Spray with suede protector. Colors: tan, tobacco, dark brown.', brands: 'Gucci, Loro Piana, Allen Edmonds' },
    { style: 'Leather Penny Loafer', materials: 'French calf or cordovan leather', notes: 'Ages beautifully and is resoleable — a quality pair lasts decades. Burgundy, tan, or dark brown. Cedar shoe trees after every wear. Rotate with at least one other pair.', brands: 'Alden (cordovan), Allen Edmonds, Tricker\'s' },
    { style: 'Suede Desert Boot', materials: 'Suede upper, crepe or rubber sole', notes: 'Clean, casual, endlessly versatile. Mid-height ankle boot. Wears with chinos, jeans, or casual trousers. Tan or sand suede is the classic. Waterproof spray is essential.', brands: 'Clarks Originals, Sanders, Tricker\'s' },
    { style: 'White Leather Sneaker', materials: 'Full-grain leather, clean rubber sole', notes: 'No logos, no color blocking, no mesh. Clean white leather only. Pairs with anything. Clean with a leather eraser. One quality pair is worth more than ten cheap pairs.', brands: 'Common Projects, Axel Arigato, Oliver Cabell' },
    { style: 'Boat Shoe', materials: 'Full-grain leather, hand-sewn moccasin construction', notes: 'Classic non-marking rubber sole. Wear sockless in warm weather. Ages into a personal artifact. Tan or brown. The genuine article is hand-sewn around the sole — check the welt.', brands: 'Sperry Gold Cup, Quoddy, Rancourt' },
    { style: 'Driving Moccasin', materials: 'Soft glove leather, pebble rubber sole', notes: 'Extremely low-profile, minimal sole. Designed for driving, works for casual weekends. Wear sockless. Tobacco or cognac leather. Store with cedar trees to maintain shape.', brands: 'Tod\'s, Loro Piana, Car Shoe' },
  ],
  accessories: [
    { item: 'Slim Leather Belt', notes: 'Match leather tone to shoes — always. 1" to 1.25" width maximum. Minimal buckle hardware in silver or gold (match to other metal on the outfit). No embossing, no branding. Quality leather improves with age and conditioning.' },
    { item: 'Waxed Canvas Tote / Bag', notes: 'Develops personal patina over years of use. Tan or olive. Functional over fashionable. Quality marks: flat-felled seams, brass rivets, rolled leather handles. Big Duck Canvas for material; Filson for made-to-last.', brands: 'Filson, Tanner Goods, Frank Clegg' },
    { item: 'Slim Leather Wallet', notes: 'No velcro. No chain. No bulk. Carry 3-5 cards maximum. Slim bifold or card holder only. Gets thinner and more personal with age. Same leather family as belt and shoes.' },
    { item: 'Cashmere or Fine Wool Scarf', notes: 'The single accessory that instantly elevates any outfit. Solid or subtle pattern. Drape loosely or fold-and-loop — never a tight full wrap. Ideal dimension: 12" x 72".', brands: 'Brunello Cucinelli, Begg & Co., Johnstons of Elgin' },
    { item: 'Fitted Hat (Panama or Felt)', notes: 'Measure first, never impulse-buy. Genuine Panama straw (Montecristi grade) for summer — lighter and more packable than tourist versions. Wool felt for fall/winter — holds shape in rain. No baseball caps in elevated contexts.', brands: 'Optimo, Worth & Worth, Stetson' },
  ],
  jewelry: [
    { item: 'Dress Watch', notes: 'The only accessory with real investment value. Quiet luxury standard: clean dial, no chronograph sub-dials, no date window if possible. Round case 36-40mm. Metal bracelet or leather strap. Understated over flashy.', brands: 'Patek Philippe Calatrava, Rolex Cellini, Jaeger-LeCoultre, IWC Portugieser' },
    { item: 'Simple Band Ring', notes: 'One ring maximum on the hand (other than a wedding band). Plain gold or silver. No stones. No visible exterior engraving. Width 4-6mm. Quiet and intentional, not decorative.' },
    { item: 'Fine Chain Necklace', notes: 'Worn under the shirt — shows at the collar occasionally. Gold or white gold. Fine chain 1-2mm width. No pendants for everyday wear. Optional: a small pendant with personal meaning only.', brands: 'Miansai, Mejuri Men, or a custom goldsmith' },
    { item: 'Cufflinks', notes: 'Dress occasions only. Simple shapes: oval, round, or rectangular. Matte or brushed metal over polished. No novelty shapes or themes. Silver or gold tone consistent with watch and belt hardware.', brands: 'Tiffany & Co., Deakin & Francis, personal heirlooms' },
  ],
  care: [
    { fiber: 'Cashmere', frequency: 'Every 5-7 wears', wash: 'Hand wash cold with mild wool detergent. Gently squeeze — never wring, twist, or scrunch.', dry: 'Roll in a clean towel to remove water. Lay flat in original shape on a drying rack. Away from heat and direct sun.', storage: 'Fold only — never hang. Wrap in acid-free tissue. Cedar blocks or sachets prevent moths. Breathable container.' },
    { fiber: 'Merino Wool', frequency: 'Every 3-5 wears', wash: 'Hand wash cold, or machine delicate cycle at 30°C max in a mesh bag. 30-minute cycle maximum.', dry: 'Lay flat on a clean towel or drying rack. Reshape while damp. No tumble dryer.', storage: 'Fold. Cedar blocks prevent moths. Air out between wears to extend time between washes.' },
    { fiber: 'Linen', frequency: 'After each wear', wash: 'Machine wash cold on gentle cycle. Warm wash is acceptable if you want a more relaxed texture over time.', dry: 'Low heat tumble 10 minutes max, or hang while damp. Smooth the seams and collar while damp to reduce ironing.', storage: 'Hang on wide wooden hangers. Never cramped — linen wrinkles permanently under sustained pressure.' },
    { fiber: 'Leather Shoes', frequency: 'After every wear', wash: 'Not applicable. Wipe with a damp cloth after each wear to remove dust and moisture.', dry: 'Cedar shoe trees inserted immediately after removing. Absorb moisture and maintain shape overnight.', storage: 'Rotate pairs (never wear the same pair two days in a row). Condition with leather cream monthly. Polish as needed. Store in dust bags.' },
  ],
  brands: [
    { name: 'Loro Piana', tier: 'Tier 1', focus: 'Fabric + ready-to-wear', notes: 'The benchmark for material-driven luxury. Largest cashmere manufacturer in the Western world. Exclusive rights to vicuña. The best fabric nobody talks about.' },
    { name: 'Brunello Cucinelli', tier: 'Tier 1', focus: 'Knitwear + elevated casual', notes: 'King of cashmere. Selects only the best fibers from neck and belly, hand-dyed with plant dyes, hand-stitched by Italian craftsmen in Solomeo. Quiet dignity as a brand ethos.' },
    { name: 'Hermès', tier: 'Tier 1', focus: 'Accessories + leather goods', notes: 'The global benchmark for leather goods. Buy for the leather belt, the silk scarf, and the quality basics. Resale value holds better than almost any other brand.' },
    { name: 'Kiton', tier: 'Tier 1', focus: 'Neapolitan tailoring', notes: 'The technical ceiling of what a jacket can be. Every piece is full-canvas, extensively hand-stitched by Neapolitan tailors. Reference for understanding construction standards.' },
    { name: 'Zegna', tier: 'Tier 2', focus: 'Italian tailoring + casual', notes: 'Controls its own wool mills. Exceptional tailored sportswear and elevated casual. The Triple Stitch sneaker is their quiet luxury casual foothold. More accessible than Loro Piana at comparable quality.' },
    { name: 'Ralph Lauren Purple Label', tier: 'Tier 2', focus: 'American old money', notes: 'The American old money narrative at its best. Full-canvas construction, superb fabrics. Purple Label (not Polo) is where quality actually lives. The aesthetic reference for American elevated casual.' },
    { name: 'Bottega Veneta', tier: 'Tier 2', focus: 'Leather goods + accessories', notes: 'No visible logo — the item speaks for itself. Intrecciato woven leather is the signature. The bags and shoes are the move. Exudes craft and restraint.' },
    { name: 'Sunspel', tier: 'Tier 3', focus: 'Premium basics', notes: 'The British authority on Sea Island cotton basics. Their classic tee is the reference point for what a quality tee actually feels like. Founded 1860. Worth the price for pure fabric quality.' },
    { name: 'John Smedley', tier: 'Tier 3', focus: 'Fine knitwear', notes: 'Heritage British knitwear since 1784. Sea Island cotton and merino polos and crewnecks. Slim, classic fit. The affordable entry point to true luxury knitwear. Their Sea Island polo is the reference.' },
  ],
};

const FS_STYLE = {
  outfits: [
    { name: 'Weekend Relaxed', pieces: ['Pleated Trousers', 'Camp Shirt', 'Suede Loafer', 'Fine Chain Necklace'], note: 'Rayon challis camp shirt — let the print do the work. Loafer sockless. Nothing else needed.' },
    { name: 'Smart Casual', pieces: ['Navy Chinos', 'OCBD Shirt', 'Merino Cardigan', 'Penny Loafer', 'Dress Watch'], note: 'The cardigan replaces a blazer. Chinos tucked in. Watch on a leather strap in cognac or dark brown.' },
    { name: 'Hot Weather', pieces: ['Linen Trousers', 'White Linen Button-Down', 'Driving Moccasin', 'Waxed Canvas Tote'], note: 'Open collar, sleeves rolled once. Accept the wrinkle — it reads as intentional at this quality level.' },
    { name: 'Elevated Street', pieces: ['Selvedge Denim', 'Premium Tee', 'White Leather Sneaker', 'Dress Watch'], note: 'Everything clean and unfussy. Watch on a leather strap, not metal bracelet, keeps it from looking too dressed.' },
    { name: 'Country Weekend', pieces: ['Straight Trousers', 'Polo Shirt', 'Suede Desert Boot', 'Slim Leather Belt'], note: 'Belt and boot in the same leather tone. No socks visible. Polo untucked.' },
    { name: 'Evening Casual', pieces: ['Straight Trousers', 'Cashmere Crewneck', 'Penny Loafer', 'Dress Watch'], note: 'The crewneck over a collared shirt reads too layered. Wear the crewneck alone with a clean break at the collar.' },
    { name: 'Texas Heat', pieces: ['Chinos', 'Camp Shirt (Rayon Challis)', 'Boat Shoe'], note: 'Sockless. Nothing extra. The looser the camp shirt the better. This is the whole outfit.' },
    { name: 'Layered Fall', pieces: ['Straight Trousers', 'OCBD Shirt', 'Chore Coat (open)', 'Suede Desert Boot', 'Cashmere Scarf'], note: 'Chore coat worn open the whole time — it\'s a layer, not a closed garment. Scarf draped loosely, not wrapped.' },
  ],
  fitRules: [
    { rule: 'Trouser Break', detail: 'None to slight only. Maximum 1/2" of fabric resting on the shoe. Anything more reads as sloppy regardless of how good the fabric is.' },
    { rule: 'Shirt Ease', detail: '2-3" across the chest for a relaxed fit. 1-1.5" for slim. Measure at the widest point. Too tight strains buttons. Too loose loses shape.' },
    { rule: 'Shoulder Seam', detail: 'Sits exactly at the shoulder point. Overhanging = too big. Riding up toward the neck = too small. The shoulder is the hardest thing to alter — get it right at the pattern stage.' },
    { rule: 'Shirt Sleeve Length', detail: 'Cuff hits at the wrist bone. When wearing a jacket, 1/4" to 1/2" of shirt cuff should show. No shirt cuff visible at all = jacket too long.' },
    { rule: 'Shirt Hem (Untucked)', detail: 'Hits at mid-fly. Longer = sloppy overhang. Shorter = unintentional crop. Shirts designed to be tucked need 3-4" more length than untucked hem length.' },
    { rule: 'Collar Fit', detail: 'Zero gap between the collar band and the neck when buttoned. A gap means the collar is too large. This is the most visible fit flaw on a dress shirt.' },
    { rule: 'Waistband Placement', detail: 'Sits at the natural waist, not the hips. No pulling, buckling, or horizontal drag lines across the front. Hip-rise trousers are a different category entirely.' },
  ],
  gaps: [
    { garment: 'White Linen Button-Down', status: 'covered', patternId: 'linen-shirt', note: 'Direct match.' },
    { garment: 'OCBD Shirt', status: 'partial', patternId: 'button-up', note: 'General button-up exists. No oxford cloth variant. Needs ocbd variant with soft collar roll.' },
    { garment: 'Premium Tee', status: 'covered', patternId: 'tee', note: 'Use fit: fitted (2" ease). Tee and fitted-tee-w both available.' },
    { garment: 'Merino / Cashmere Crewneck', status: 'covered', patternId: 'crewneck', note: 'Pattern exists. Fabric choice is up to the sewist.' },
    { garment: 'Navy Chinos', status: 'covered', patternId: 'chinos', note: 'Direct match.' },
    { garment: 'Straight Trousers (casual)', status: 'partial', patternId: 'wide-leg-trouser-m', note: 'Flat-front option exists but skews formal. Needs a casual straight trouser or new variant.' },
    { garment: 'Polo Shirt', status: 'covered', patternId: 'polo-shirt', note: 'Direct match with slim, classic, and sport variants.' },
    { garment: 'Chore Coat / Overshirt', status: 'covered', patternId: 'chore-coat', note: 'Direct match. linen-overshirt variant available.' },
    { garment: 'Merino Cardigan', status: 'missing', patternId: null, note: 'open-cardigan is unstructured/drop-shoulder. A fitted full-button cardigan does not exist in the catalog.' },
    { garment: 'Quality Denim', status: 'covered', patternId: 'straight-jeans', note: 'Direct match.' },
  ],
  palette: {
    neutrals: [
      ['Warm White', '#FDFCF9', '#3E3E3E'],
      ['Stone', '#F5F0E8', '#3E3E3E'],
      ['Ecru', '#F5F0DC', '#3E3E3E'],
      ['Tan', '#C4A882', '#3E2723'],
      ['Charcoal', '#3E3E3E', '#FDFCF9'],
    ],
    colors: [
      ['Navy', '#1B2A4A', '#FDFCF9'],
      ['Camel', '#B8976A', '#3E2723'],
      ['Olive', '#4A5D23', '#FDFCF9'],
      ['Burgundy', '#722F37', '#FDFCF9'],
    ],
  },
  fabrics: [
    { name: 'Sea Island Cotton', sources: [{store:'Mood Fabrics',url:'moodfabrics.com'},{store:'Liberty London',url:'libertylondon.com'},{store:'Burnley & Trowbridge',url:'burnleyandtrowbridge.com'}], notes: 'Search specifically for "Sea Island" — not pima, not Egyptian. Expect $40-80/yd. Very limited availability; buy when you find it.' },
    { name: 'Merino Wool Knit', sources: [{store:'Raspberry Creek Fabrics',url:'raspberrycreekfabrics.com'},{store:'Mood Fabrics',url:'moodfabrics.com'}], notes: 'For crewnecks and cardigans, look for 12-ply or 300g/m² weight. For base layers, 180g/m². Natural stretch, no polyester blend needed.' },
    { name: 'Tropical Weight Wool', sources: [{store:'B&J Fabrics',url:'bandjfabrics.com'},{store:'Mood Fabrics',url:'moodfabrics.com'},{store:'Emma One Sock',url:'emmaonesock.com'}], notes: 'Search "tropical weight" or "fresco wool." 8-10 oz. Breathes year-round in Houston. B&J Fabrics (NYC) has the best selection of true tropical weights.' },
    { name: 'Selvedge / Japanese Denim', sources: [{store:'Pacific Blue Denims',url:'pacificbluedenims.com'},{store:'Blackbird Fabrics',url:'blackbirdfabrics.com'}], notes: 'Look for Kurabo, Nisshinbo, or Cone Mills White Oak. 12-14 oz for straight jeans. Pacific Blue Denims is the specialist.' },
    { name: 'Premium Linen', sources: [{store:'fabrics-store.com',url:'fabrics-store.com'},{store:'Mood Fabrics',url:'moodfabrics.com'},{store:'Blackbird Fabrics',url:'blackbirdfabrics.com'}], notes: 'For shirts: IL019 weight (5.5 oz), pure linen not blend. For trousers: IL020 or heavier (7-9 oz). fabrics-store.com has the widest range of pure linen at fair prices.' },
  ],
};

function renderFoundersSelect(profiles = []) {
  const activeProfile = profiles[0];
  const m = activeProfile?.measurements ?? {};

  // Body measurements only (exclude bag/accessory)
  const bodyMeasurements = Object.values(MEASUREMENTS).filter(def => def.category !== 'accessory');
  const upperMeasurements = bodyMeasurements.filter(def => def.category === 'upper');
  const lowerMeasurements = bodyMeasurements.filter(def => def.category === 'lower');
  const fullMeasurements  = bodyMeasurements.filter(def => def.category === 'full');

  function renderMeasurementInput(def) {
    const val = m[def.id] ?? '';
    const opt = def.optional ? ' <span style="font-size:.6rem;color:var(--mid)">(opt)</span>' : '';
    return `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px" title="${def.instruction}">
        <label style="font-size:.75rem;width:140px;flex-shrink:0;color:var(--text)">${def.label}${opt}</label>
        <input type="number" class="adm-fs-meas-input" data-meas-id="${def.id}"
          value="${val}" min="${def.min}" max="${def.max}" step="${def.step}" placeholder="${def.default}"
          style="width:80px;font-family:'IBM Plex Mono',monospace;font-size:.78rem;padding:4px 6px;border:1px solid var(--bdr);border-radius:3px;background:var(--bg);color:var(--text);text-align:right">
        <span style="font-size:.7rem;color:var(--mid)">in</span>
      </div>`;
  }

  return `
    <h2 class="adm-section-title">Founder's Select</h2>
    <p style="font-size:.8rem;color:var(--mid);margin-bottom:20px">Deep Autumn. Flamboyant Natural. Your personal wardrobe system, fabric sourcing guide, and pattern shortcuts.</p>

    <div class="adm-roadmap-card" style="margin-bottom:16px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <h3 style="margin:0">My Measurements</h3>
        <div style="display:flex;align-items:center;gap:8px">
          ${activeProfile ? `<span style="font-size:.7rem;color:var(--mid)">Profile: <strong style="color:var(--gold)">${activeProfile.name}</strong></span>` : ''}
          <button id="adm-fs-save-meas" class="adm-btn" style="font-size:.72rem;padding:4px 14px">Save</button>
        </div>
      </div>
      <div id="adm-fs-meas-status" style="font-size:.72rem;margin-bottom:8px" hidden></div>
      ${!activeProfile ? `
        <div style="margin-bottom:10px">
          <label style="font-size:.75rem;color:var(--mid);margin-right:6px">Profile name:</label>
          <input type="text" id="adm-fs-profile-name" value="Kolby" style="font-family:'IBM Plex Mono',monospace;font-size:.78rem;padding:4px 6px;border:1px solid var(--bdr);border-radius:3px;background:var(--bg);color:var(--text);width:160px">
        </div>` : ''}
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px">
        <div>
          <div style="font-size:.68rem;font-weight:700;color:var(--gold);text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px;border-bottom:1px solid var(--bdr);padding-bottom:4px">Upper Body</div>
          ${upperMeasurements.map(renderMeasurementInput).join('')}
        </div>
        <div>
          <div style="font-size:.68rem;font-weight:700;color:var(--gold);text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px;border-bottom:1px solid var(--bdr);padding-bottom:4px">Lower Body</div>
          ${lowerMeasurements.map(renderMeasurementInput).join('')}
        </div>
        <div>
          <div style="font-size:.68rem;font-weight:700;color:var(--gold);text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px;border-bottom:1px solid var(--bdr);padding-bottom:4px">Full Body</div>
          ${fullMeasurements.map(renderMeasurementInput).join('')}
        </div>
      </div>
      <input type="hidden" id="adm-fs-profile-id" value="${activeProfile?.id ?? ''}">
    </div>

    <div class="adm-roadmap-card" style="margin-bottom:16px">
      <div style="display:flex;justify-content:space-between;align-items:center;cursor:pointer" id="adm-fs-palette-toggle">
        <h3 style="margin:0;font-size:.88rem">Deep Autumn Color Palette</h3>
        <span id="adm-fs-palette-chevron" style="font-size:.85rem;color:var(--mid);transition:transform .2s">+</span>
      </div>
      <div id="adm-fs-palette-body" hidden style="margin-top:12px">
        <div style="margin-bottom:10px">
          <div style="font-size:.65rem;font-weight:700;color:var(--gold);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">Neutrals</div>
          <div style="display:flex;flex-wrap:wrap;gap:8px">
            ${[['Cream','#FFF8E7','#3E2723'],['Charcoal','#3E3E3E','#FFF8E7'],['Chocolate','#3E2723','#FFF8E7'],['Olive','#4A5D23','#FFF8E7']].map(([n,bg,fg]) => `<div style="text-align:center"><div style="width:48px;height:32px;border-radius:4px;background:${bg};border:1px solid var(--bdr)"></div><div style="font-size:.6rem;font-family:'IBM Plex Mono',monospace;color:var(--mid);margin-top:2px">${n}</div><div style="font-size:.55rem;font-family:'IBM Plex Mono',monospace;color:var(--mid)">${bg}</div></div>`).join('')}
          </div>
        </div>
        <div style="margin-bottom:10px">
          <div style="font-size:.65rem;font-weight:700;color:var(--gold);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">Core Palette</div>
          <div style="display:flex;flex-wrap:wrap;gap:8px">
            ${[['Rust','#BF5B21'],['Burgundy','#722F37'],['Terracotta','#C85A3A'],['Mustard','#C4960C'],['Deep Teal','#1A6B5A']].map(([n,bg]) => `<div style="text-align:center"><div style="width:48px;height:32px;border-radius:4px;background:${bg};border:1px solid var(--bdr)"></div><div style="font-size:.6rem;font-family:'IBM Plex Mono',monospace;color:var(--mid);margin-top:2px">${n}</div><div style="font-size:.55rem;font-family:'IBM Plex Mono',monospace;color:var(--mid)">${bg}</div></div>`).join('')}
          </div>
        </div>
        <div>
          <div style="font-size:.65rem;font-weight:700;color:var(--gold);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">Accents</div>
          <div style="display:flex;flex-wrap:wrap;gap:8px">
            ${[['Warm Gold','#BF6A30'],['Copper','#B36B3E'],['Dark Olive','#2E3D1A']].map(([n,bg]) => `<div style="text-align:center"><div style="width:48px;height:32px;border-radius:4px;background:${bg};border:1px solid var(--bdr)"></div><div style="font-size:.6rem;font-family:'IBM Plex Mono',monospace;color:var(--mid);margin-top:2px">${n}</div><div style="font-size:.55rem;font-family:'IBM Plex Mono',monospace;color:var(--mid)">${bg}</div></div>`).join('')}
          </div>
        </div>
      </div>
    </div>

    <nav style="display:flex;gap:0;margin-bottom:16px;border-bottom:2px solid var(--bdr)">
      <button class="adm-fs-subtab adm-fs-subtab--active" data-fs-view="garments" style="font-family:'IBM Plex Mono',monospace;font-size:.75rem;font-weight:600;padding:8px 16px;border:none;background:none;color:var(--gold);border-bottom:2px solid var(--gold);cursor:pointer;text-transform:uppercase;letter-spacing:.06em;margin-bottom:-2px">By Garment (${FS_GARMENTS.length})</button>
      <button class="adm-fs-subtab" data-fs-view="stores" style="font-family:'IBM Plex Mono',monospace;font-size:.75rem;font-weight:600;padding:8px 16px;border:none;background:none;color:var(--mid);border-bottom:2px solid transparent;cursor:pointer;text-transform:uppercase;letter-spacing:.06em;margin-bottom:-2px">Store Guide</button>
      <button class="adm-fs-subtab" data-fs-view="wealthy" style="font-family:'IBM Plex Mono',monospace;font-size:.75rem;font-weight:600;padding:8px 16px;border:none;background:none;color:var(--mid);border-bottom:2px solid transparent;cursor:pointer;text-transform:uppercase;letter-spacing:.06em;margin-bottom:-2px">Wealthy Men</button>
      <button class="adm-fs-subtab" data-fs-view="style" style="font-family:'IBM Plex Mono',monospace;font-size:.75rem;font-weight:600;padding:8px 16px;border:none;background:none;color:var(--mid);border-bottom:2px solid transparent;cursor:pointer;text-transform:uppercase;letter-spacing:.06em;margin-bottom:-2px">Men's Style</button>
    </nav>

    <div id="adm-fs-garments">
      ${FS_GARMENTS.map((g, i) => `
        <div class="adm-roadmap-card adm-fs-card" data-fs-idx="${i}" style="margin-bottom:8px;cursor:pointer">
          <div class="adm-fs-header" style="display:flex;justify-content:space-between;align-items:center">
            <div>
              <span style="font-family:'IBM Plex Mono',monospace;font-size:.7rem;color:var(--gold);margin-right:8px">#${i + 1}</span>
              <strong style="font-size:.85rem">${g.name}</strong>
              <span style="font-size:.72rem;color:var(--mid);margin-left:8px">${g.fabric.split('(')[0].trim()}</span>
            </div>
            <div style="display:flex;align-items:center;gap:8px">
              <a href="/patterns/${g.slug}" style="font-size:.7rem;color:var(--gold);text-decoration:none;padding:2px 8px;border:1px solid var(--gold);border-radius:3px" onclick="event.stopPropagation()">Pattern &rarr;</a>
              <span class="adm-fs-chevron" style="font-size:1rem;color:var(--mid);transition:transform .2s">+</span>
            </div>
          </div>
          <div class="adm-fs-body" hidden style="margin-top:12px;border-top:1px solid var(--bdr);padding-top:12px">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
              <div style="background:var(--bg);border-radius:4px;padding:6px 8px"><div style="font-size:.65rem;font-weight:700;color:var(--mid);text-transform:uppercase;letter-spacing:.08em">Pattern</div><div style="font-size:.78rem;margin-top:2px">${g.pattern}</div></div>
              <div style="background:var(--bg);border-radius:4px;padding:6px 8px"><div style="font-size:.65rem;font-weight:700;color:var(--mid);text-transform:uppercase;letter-spacing:.08em">Yardage</div><div style="font-size:.78rem;margin-top:2px">${g.yardage}</div></div>
            </div>
            <div style="background:var(--bg);border-radius:4px;padding:6px 8px;margin-bottom:12px"><div style="font-size:.65rem;font-weight:700;color:var(--mid);text-transform:uppercase;letter-spacing:.08em">Fabric</div><div style="font-size:.78rem;margin-top:2px">${g.fabric}</div></div>
            <div style="margin-bottom:12px"><div style="font-size:.65rem;font-weight:700;color:var(--mid);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">Colors</div><div style="display:flex;flex-wrap:wrap;gap:4px">${g.colors.map(c => `<span style="font-size:.72rem;background:var(--text);color:var(--bg);padding:2px 8px;border-radius:12px">${c}</span>`).join('')}</div></div>
            <div style="margin-bottom:12px"><div style="font-size:.65rem;font-weight:700;color:var(--mid);text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px">Notions</div><div style="font-size:.78rem;line-height:1.5">${g.notions}</div></div>
            <div style="margin-bottom:12px"><div style="font-size:.65rem;font-weight:700;color:var(--gold);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">Buy Local (Houston)</div>${g.local.map(s => `<div style="padding:4px 0;font-size:.78rem"><strong>${s.store}</strong><span style="color:var(--mid)"> &mdash; ${s.note}</span></div>`).join('')}</div>
            <div style="margin-bottom:12px"><div style="font-size:.65rem;font-weight:700;color:var(--gold);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">Buy Online</div>${g.online.map(s => `<div style="padding:4px 0;font-size:.78rem;display:flex;justify-content:space-between;align-items:baseline"><div><strong>${s.store}</strong><span style="color:var(--mid)"> &mdash; ${s.note}</span></div><span style="font-size:.68rem;color:var(--gold);white-space:nowrap;margin-left:8px">${s.url}</span></div>`).join('')}</div>
            <div style="background:var(--card);border-left:3px solid var(--gold);padding:8px 10px;border-radius:0 4px 4px 0"><div style="font-size:.65rem;font-weight:700;color:var(--gold);text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px">Sewing Tips</div><div style="font-size:.78rem;line-height:1.6">${g.tips}</div></div>
          </div>
        </div>
      `).join('')}
    </div>

    <div id="adm-fs-stores" hidden>
      <div class="adm-roadmap-card" style="border:2px solid var(--gold);margin-bottom:16px">
        <div style="font-size:.68rem;font-weight:700;color:var(--gold);text-transform:uppercase;letter-spacing:.1em;margin-bottom:6px">YOUR #1 STORE</div>
        <h3 style="margin:0 0 4px">${FS_STORES.essential.name}</h3>
        <p style="font-size:.78rem;color:var(--mid);margin:0 0 4px">${FS_STORES.essential.address}</p>
        <p style="font-size:.72rem;color:var(--mid);margin:0 0 8px">${FS_STORES.essential.hours}</p>
        <p style="font-size:.8rem;margin:0;line-height:1.5">${FS_STORES.essential.note}</p>
      </div>
      <h3 style="font-size:.88rem;margin:20px 0 10px;color:var(--mid)">Other Houston Stores</h3>
      ${FS_STORES.secondary.map(s => `
        <div class="adm-roadmap-card" style="margin-bottom:8px">
          <strong style="font-size:.82rem">${s.name}</strong>
          ${s.address ? `<span style="font-size:.72rem;color:var(--mid)"> &mdash; ${s.address}</span>` : ''}
          <div style="font-size:.78rem;color:var(--mid);margin-top:4px">${s.note}</div>
        </div>
      `).join('')}
      <h3 style="font-size:.88rem;margin:20px 0 10px;color:var(--mid)">Top Online Shops</h3>
      ${FS_STORES.topOnline.map(s => `
        <div class="adm-roadmap-card" style="margin-bottom:8px;display:flex;justify-content:space-between;align-items:flex-start;gap:12px">
          <div style="flex:1"><strong style="font-size:.82rem">${s.name}</strong><div style="font-size:.78rem;color:var(--mid);margin-top:2px">${s.note}</div></div>
          <span style="font-size:.7rem;color:var(--gold);background:var(--bg);padding:3px 8px;border-radius:3px;white-space:nowrap;font-weight:600">${s.url}</span>
        </div>
      `).join('')}
    </div>

    <div id="adm-fs-wealthy" hidden>
      <p style="font-size:.8rem;color:var(--mid);margin:0 0 16px">Quick-reference research on elevated casual men's style. Fabrics, construction, footwear, accessories, jewelry, and care.</p>

      ${[
        { key: 'fabrics', label: 'Fabrics', renderItem: f => `
          <div style="font-size:.82rem;font-weight:700;margin-bottom:4px">${f.name}</div>
          <div style="font-size:.65rem;font-weight:700;color:var(--gold);text-transform:uppercase;letter-spacing:.08em;margin-bottom:2px">Best For</div>
          <div style="font-size:.75rem;margin-bottom:6px">${f.bestFor}</div>
          <div style="font-size:.75rem;color:var(--mid);line-height:1.55;margin-bottom:6px">${f.notes}</div>
          ${f.brands ? `<div style="font-size:.65rem;font-weight:700;color:var(--gold);text-transform:uppercase;letter-spacing:.08em;margin-bottom:2px">Brands</div><div style="font-size:.75rem">${f.brands}</div>` : ''}
        ` },
        { key: 'garments', label: 'Garments', renderItem: g => `
          <div style="font-size:.82rem;font-weight:700;margin-bottom:4px">${g.name}</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:6px">
            <div><div style="font-size:.65rem;font-weight:700;color:var(--mid);text-transform:uppercase;letter-spacing:.08em">Fabric</div><div style="font-size:.75rem">${g.fabric}</div></div>
            <div><div style="font-size:.65rem;font-weight:700;color:var(--mid);text-transform:uppercase;letter-spacing:.08em">Role</div><div style="font-size:.75rem">${g.role}</div></div>
          </div>
          <div style="font-size:.75rem;color:var(--mid);line-height:1.55">${g.notes}</div>
        ` },
        { key: 'construction', label: 'Construction', renderItem: c => `
          <div style="font-size:.82rem;font-weight:700;margin-bottom:4px">${c.technique}</div>
          <div style="font-size:.65rem;font-weight:700;color:var(--mid);text-transform:uppercase;letter-spacing:.08em;margin-bottom:2px">Applies To</div>
          <div style="font-size:.75rem;margin-bottom:6px">${c.applies}</div>
          <div style="font-size:.75rem;color:var(--mid);line-height:1.55">${c.notes}</div>
        ` },
        { key: 'footwear', label: 'Footwear', renderItem: f => `
          <div style="font-size:.82rem;font-weight:700;margin-bottom:4px">${f.style}</div>
          <div style="font-size:.65rem;font-weight:700;color:var(--mid);text-transform:uppercase;letter-spacing:.08em;margin-bottom:2px">Materials</div>
          <div style="font-size:.75rem;margin-bottom:6px">${f.materials}</div>
          <div style="font-size:.75rem;color:var(--mid);line-height:1.55;margin-bottom:6px">${f.notes}</div>
          <div style="font-size:.65rem;font-weight:700;color:var(--gold);text-transform:uppercase;letter-spacing:.08em;margin-bottom:2px">Brands</div>
          <div style="font-size:.75rem">${f.brands}</div>
        ` },
        { key: 'accessories', label: 'Accessories', renderItem: a => `
          <div style="font-size:.82rem;font-weight:700;margin-bottom:6px">${a.item}</div>
          <div style="font-size:.75rem;color:var(--mid);line-height:1.55;margin-bottom:${a.brands ? '6px' : '0'}">${a.notes}</div>
          ${a.brands ? `<div style="font-size:.65rem;font-weight:700;color:var(--gold);text-transform:uppercase;letter-spacing:.08em;margin-bottom:2px">Brands</div><div style="font-size:.75rem">${a.brands}</div>` : ''}
        ` },
        { key: 'jewelry', label: 'Jewelry', renderItem: j => `
          <div style="font-size:.82rem;font-weight:700;margin-bottom:6px">${j.item}</div>
          <div style="font-size:.75rem;color:var(--mid);line-height:1.55;margin-bottom:6px">${j.notes}</div>
          <div style="font-size:.65rem;font-weight:700;color:var(--gold);text-transform:uppercase;letter-spacing:.08em;margin-bottom:2px">Brands</div>
          <div style="font-size:.75rem">${j.brands}</div>
        ` },
        { key: 'care', label: 'Care & Maintenance', renderItem: c => `
          <div style="font-size:.82rem;font-weight:700;margin-bottom:4px">${c.fiber}</div>
          <div style="font-size:.65rem;font-weight:700;color:var(--mid);text-transform:uppercase;letter-spacing:.08em;margin-bottom:2px">Frequency</div>
          <div style="font-size:.75rem;margin-bottom:6px">${c.frequency}</div>
          <div style="font-size:.65rem;font-weight:700;color:var(--mid);text-transform:uppercase;letter-spacing:.08em;margin-bottom:2px">Wash</div>
          <div style="font-size:.75rem;margin-bottom:6px">${c.wash}</div>
          <div style="font-size:.65rem;font-weight:700;color:var(--mid);text-transform:uppercase;letter-spacing:.08em;margin-bottom:2px">Dry</div>
          <div style="font-size:.75rem;margin-bottom:6px">${c.dry}</div>
          <div style="font-size:.65rem;font-weight:700;color:var(--mid);text-transform:uppercase;letter-spacing:.08em;margin-bottom:2px">Storage</div>
          <div style="font-size:.75rem">${c.storage}</div>
        ` },
        { key: 'brands', label: 'Brands', renderItem: b => `
          <div style="display:flex;align-items:baseline;gap:8px;margin-bottom:4px">
            <div style="font-size:.82rem;font-weight:700">${b.name}</div>
            <span style="font-size:.65rem;font-family:'IBM Plex Mono',monospace;color:var(--gold);background:var(--bg);padding:1px 6px;border-radius:3px;white-space:nowrap">${b.tier}</span>
          </div>
          <div style="font-size:.65rem;font-weight:700;color:var(--mid);text-transform:uppercase;letter-spacing:.08em;margin-bottom:2px">Focus</div>
          <div style="font-size:.75rem;margin-bottom:6px">${b.focus}</div>
          <div style="font-size:.75rem;color:var(--mid);line-height:1.55">${b.notes}</div>
        ` },
      ].map(({ key, label, renderItem }) => {
        const items = FS_WEALTHY[key];
        return `
          <div class="adm-roadmap-card adm-fs-card" style="margin-bottom:8px;cursor:pointer">
            <div class="adm-fs-header" style="display:flex;justify-content:space-between;align-items:center">
              <div>
                <strong style="font-size:.85rem">${label}</strong>
                <span style="font-size:.7rem;font-family:'IBM Plex Mono',monospace;color:var(--gold);margin-left:8px">${items.length}</span>
              </div>
              <span class="adm-fs-chevron" style="font-size:1rem;color:var(--mid);transition:transform .2s">+</span>
            </div>
            <div class="adm-fs-body" hidden style="margin-top:12px;border-top:1px solid var(--bdr);padding-top:12px">
              <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:8px">
                ${items.map(item => `
                  <div style="background:var(--bg);border-radius:4px;padding:10px 12px">
                    ${renderItem(item)}
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>

    <div id="adm-fs-style" hidden>
      <p style="font-size:.8rem;color:var(--mid);margin:0 0 16px">Outfit formulas, fit rules, pattern gaps, old money palette, and where to source luxury fabrics.</p>

      <!-- Outfit Formulas -->
      <div class="adm-roadmap-card adm-fs-card" style="margin-bottom:8px;cursor:pointer">
        <div class="adm-fs-header" style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <strong style="font-size:.85rem">Outfit Formulas</strong>
            <span style="font-size:.7rem;font-family:'IBM Plex Mono',monospace;color:var(--gold);margin-left:8px">${FS_STYLE.outfits.length}</span>
          </div>
          <span class="adm-fs-chevron" style="font-size:1rem;color:var(--mid);transition:transform .2s">+</span>
        </div>
        <div class="adm-fs-body" hidden style="margin-top:12px;border-top:1px solid var(--bdr);padding-top:12px">
          ${FS_STYLE.outfits.map(o => `
            <div style="background:var(--bg);border-radius:4px;padding:10px 12px;margin-bottom:8px">
              <div style="font-size:.82rem;font-weight:700;margin-bottom:6px">${o.name}</div>
              <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px">
                ${o.pieces.map(p => `<span style="font-size:.7rem;background:var(--card);border:1px solid var(--bdr);color:var(--text);padding:2px 8px;border-radius:12px">${p}</span>`).join('')}
              </div>
              <div style="font-size:.75rem;color:var(--mid);line-height:1.55">${o.note}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Fit Rules -->
      <div class="adm-roadmap-card adm-fs-card" style="margin-bottom:8px;cursor:pointer">
        <div class="adm-fs-header" style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <strong style="font-size:.85rem">Fit Rules</strong>
            <span style="font-size:.7rem;font-family:'IBM Plex Mono',monospace;color:var(--gold);margin-left:8px">${FS_STYLE.fitRules.length}</span>
          </div>
          <span class="adm-fs-chevron" style="font-size:1rem;color:var(--mid);transition:transform .2s">+</span>
        </div>
        <div class="adm-fs-body" hidden style="margin-top:12px;border-top:1px solid var(--bdr);padding-top:12px">
          ${FS_STYLE.fitRules.map(r => `
            <div style="display:flex;gap:12px;padding:8px 0;border-bottom:1px solid var(--bdr)">
              <div style="font-size:.75rem;font-weight:700;color:var(--gold);width:160px;flex-shrink:0">${r.rule}</div>
              <div style="font-size:.78rem;color:var(--text);line-height:1.55">${r.detail}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Pattern Gap Analysis -->
      <div class="adm-roadmap-card adm-fs-card" style="margin-bottom:8px;cursor:pointer">
        <div class="adm-fs-header" style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <strong style="font-size:.85rem">Pattern Gap Analysis</strong>
            <span style="font-size:.7rem;font-family:'IBM Plex Mono',monospace;color:var(--gold);margin-left:8px">${FS_STYLE.gaps.length} garments</span>
          </div>
          <span class="adm-fs-chevron" style="font-size:1rem;color:var(--mid);transition:transform .2s">+</span>
        </div>
        <div class="adm-fs-body" hidden style="margin-top:12px;border-top:1px solid var(--bdr);padding-top:12px">
          ${FS_STYLE.gaps.map(g => {
            const badgeColor = g.status === 'covered' ? '#2e7d32' : g.status === 'partial' ? '#b8600c' : '#c62828';
            const badgeLabel = g.status === 'covered' ? 'Covered' : g.status === 'partial' ? 'Partial' : 'Missing';
            return `
              <div style="display:flex;gap:12px;align-items:baseline;padding:8px 0;border-bottom:1px solid var(--bdr)">
                <span style="font-size:.65rem;font-weight:700;color:#fff;background:${badgeColor};padding:2px 7px;border-radius:3px;white-space:nowrap">${badgeLabel}</span>
                <div style="flex:1">
                  <span style="font-size:.78rem;font-weight:600">${g.garment}</span>
                  ${g.patternId ? `<a href="/patterns/${g.patternId}" style="font-size:.68rem;color:var(--gold);margin-left:8px;text-decoration:none">${g.patternId} &rarr;</a>` : ''}
                  <div style="font-size:.73rem;color:var(--mid);margin-top:2px">${g.note}</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Old Money Color Palette -->
      <div class="adm-roadmap-card adm-fs-card" style="margin-bottom:8px;cursor:pointer">
        <div class="adm-fs-header" style="display:flex;justify-content:space-between;align-items:center">
          <strong style="font-size:.85rem">Old Money Color Palette</strong>
          <span class="adm-fs-chevron" style="font-size:1rem;color:var(--mid);transition:transform .2s">+</span>
        </div>
        <div class="adm-fs-body" hidden style="margin-top:12px;border-top:1px solid var(--bdr);padding-top:12px">
          <div style="margin-bottom:10px">
            <div style="font-size:.65rem;font-weight:700;color:var(--gold);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">Neutrals</div>
            <div style="display:flex;flex-wrap:wrap;gap:8px">
              ${FS_STYLE.palette.neutrals.map(([n,bg,fg]) => `<div style="text-align:center"><div style="width:48px;height:32px;border-radius:4px;background:${bg};border:1px solid var(--bdr)"></div><div style="font-size:.6rem;font-family:'IBM Plex Mono',monospace;color:var(--mid);margin-top:2px">${n}</div><div style="font-size:.55rem;font-family:'IBM Plex Mono',monospace;color:var(--mid)">${bg}</div></div>`).join('')}
            </div>
          </div>
          <div>
            <div style="font-size:.65rem;font-weight:700;color:var(--gold);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px">Colors</div>
            <div style="display:flex;flex-wrap:wrap;gap:8px">
              ${FS_STYLE.palette.colors.map(([n,bg,fg]) => `<div style="text-align:center"><div style="width:48px;height:32px;border-radius:4px;background:${bg};border:1px solid var(--bdr)"></div><div style="font-size:.6rem;font-family:'IBM Plex Mono',monospace;color:var(--mid);margin-top:2px">${n}</div><div style="font-size:.55rem;font-family:'IBM Plex Mono',monospace;color:var(--mid)">${bg}</div></div>`).join('')}
            </div>
          </div>
        </div>
      </div>

      <!-- Luxury Fabric Sourcing -->
      <div class="adm-roadmap-card adm-fs-card" style="margin-bottom:8px;cursor:pointer">
        <div class="adm-fs-header" style="display:flex;justify-content:space-between;align-items:center">
          <div>
            <strong style="font-size:.85rem">Luxury Fabric Sourcing</strong>
            <span style="font-size:.7rem;font-family:'IBM Plex Mono',monospace;color:var(--gold);margin-left:8px">${FS_STYLE.fabrics.length} fabrics</span>
          </div>
          <span class="adm-fs-chevron" style="font-size:1rem;color:var(--mid);transition:transform .2s">+</span>
        </div>
        <div class="adm-fs-body" hidden style="margin-top:12px;border-top:1px solid var(--bdr);padding-top:12px">
          ${FS_STYLE.fabrics.map(f => `
            <div style="background:var(--bg);border-radius:4px;padding:10px 12px;margin-bottom:8px">
              <div style="font-size:.82rem;font-weight:700;margin-bottom:4px">${f.name}</div>
              <div style="font-size:.73rem;color:var(--mid);line-height:1.55;margin-bottom:8px">${f.notes}</div>
              ${f.sources.map(s => `
                <div style="display:flex;justify-content:space-between;align-items:baseline;padding:3px 0">
                  <span style="font-size:.75rem"><strong>${s.store}</strong></span>
                  <span style="font-size:.68rem;color:var(--gold);font-family:'IBM Plex Mono',monospace">${s.url}</span>
                </div>
              `).join('')}
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function wireFoundersSelect() {
  const section = root.querySelector('#adm-s-founders-select');
  if (!section) return;

  // Sub-tab switching (garments vs stores)
  section.querySelectorAll('.adm-fs-subtab').forEach(btn => {
    btn.addEventListener('click', () => {
      section.querySelectorAll('.adm-fs-subtab').forEach(b => {
        b.classList.remove('adm-fs-subtab--active');
        b.style.color = 'var(--mid)';
        b.style.borderBottomColor = 'transparent';
      });
      btn.classList.add('adm-fs-subtab--active');
      btn.style.color = 'var(--gold)';
      btn.style.borderBottomColor = 'var(--gold)';
      const view = btn.dataset.fsView;
      const garments = section.querySelector('#adm-fs-garments');
      const stores = section.querySelector('#adm-fs-stores');
      const wealthy = section.querySelector('#adm-fs-wealthy');
      const style = section.querySelector('#adm-fs-style');
      if (garments) garments.hidden = view !== 'garments';
      if (stores) stores.hidden = view !== 'stores';
      if (wealthy) wealthy.hidden = view !== 'wealthy';
      if (style) style.hidden = view !== 'style';
    });
  });

  // Color palette toggle
  section.querySelector('#adm-fs-palette-toggle')?.addEventListener('click', () => {
    const body = section.querySelector('#adm-fs-palette-body');
    const chevron = section.querySelector('#adm-fs-palette-chevron');
    if (!body) return;
    body.hidden = !body.hidden;
    if (chevron) chevron.textContent = body.hidden ? '+' : '\u2212';
  });

  // Save / update measurement profile
  section.querySelector('#adm-fs-save-meas')?.addEventListener('click', async () => {
    const statusEl = section.querySelector('#adm-fs-meas-status');
    const profileIdEl = section.querySelector('#adm-fs-profile-id');
    const profileId = profileIdEl?.value || '';
    const inputs = section.querySelectorAll('.adm-fs-meas-input');
    const measurements = {};
    inputs.forEach(inp => {
      const val = parseFloat(inp.value);
      if (!isNaN(val) && val > 0) measurements[inp.dataset.measId] = val;
    });
    if (Object.keys(measurements).length === 0) {
      if (statusEl) { statusEl.hidden = false; statusEl.style.color = 'var(--mid)'; statusEl.textContent = 'Enter at least one measurement.'; }
      return;
    }
    const saveBtn = section.querySelector('#adm-fs-save-meas');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';
    let result;
    if (profileId) {
      result = await updateMeasurementProfile(profileId, measurements);
    } else {
      const nameEl = section.querySelector('#adm-fs-profile-name');
      const name = nameEl?.value?.trim() || 'Kolby';
      result = await saveMeasurementProfile(_adminUser.id, name, measurements);
      if (result.data?.id && profileIdEl) {
        profileIdEl.value = result.data.id;
        nameEl?.closest('div')?.remove();
      }
    }
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save';
    if (statusEl) {
      statusEl.hidden = false;
      if (result.error) {
        statusEl.style.color = '#c62828';
        statusEl.textContent = 'Error: ' + (result.error.message || 'Save failed.');
      } else {
        statusEl.style.color = 'var(--gold)';
        statusEl.textContent = 'Saved ' + Object.keys(measurements).length + ' measurements.';
        setTimeout(() => { statusEl.hidden = true; }, 3000);
      }
    }
  });

  // Accordion expand/collapse
  section.addEventListener('click', e => {
    const card = e.target.closest('.adm-fs-card');
    if (!card || e.target.closest('a')) return;
    const body = card.querySelector('.adm-fs-body');
    const chevron = card.querySelector('.adm-fs-chevron');
    if (!body) return;
    const opening = body.hidden;
    // Close all others
    section.querySelectorAll('.adm-fs-body').forEach(b => { b.hidden = true; });
    section.querySelectorAll('.adm-fs-chevron').forEach(c => { c.textContent = '+'; c.style.transform = ''; });
    if (opening) {
      body.hidden = false;
      if (chevron) { chevron.textContent = '\u2212'; chevron.style.transform = 'rotate(0deg)'; }
    }
  });
}

// ── Boot ─────────────────────────────────────────────────────────────────────
init();
