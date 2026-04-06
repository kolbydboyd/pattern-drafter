// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Admin dashboard - garment tracking, revenue, funnel, fit feedback,
 * popularity, and roadmap reference sections.
 * Only accessible to the admin email via Supabase RLS + client-side gate.
 */
import { getUser } from '../lib/auth.js';
import { ARTICLES } from '../content/articles.js';
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

  const [catalogRes, revenueRes, funnelRes, feedbackRes, popularRes, photosRes, pipelineRes, pinStatsRes] = await Promise.all([
    getGarmentCatalog(),
    getRevenueStats(),
    getFunnelStats(),
    getAllFitFeedback(),
    getPopularGarments(),
    getAllPhotos(),
    getContentPipeline(_adminUser.id),
    getPinterestPinStats(),
  ]);

  const catalog = catalogRes.data;
  const revenue = revenueRes.data;
  const funnel = funnelRes.data;
  const feedback = feedbackRes.data;
  const popular = popularRes.data;
  const allPhotos = photosRes.data;
  const pipeline = pipelineRes.data;
  const pinStats = pinStatsRes.data;

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
  `;

  wireNavTabs();
  wireLaunchTracker(launchMuslins);
  wireCatalog(catalog);
  wireChecklists();
  wireContentPipeline(pipeline);
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
    { key: 'dns-vercel', label: 'Wire peoplespatterns.com to Vercel' },
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

  return `
    ${renderArticleTracker()}

    <hr style="border:none;border-top:1px solid var(--bdr);margin:32px 0">

    ${renderPinTracker(pinStats)}

    <hr style="border:none;border-top:1px solid var(--bdr);margin:32px 0">

    <h2 class="adm-section-title">Content Pipeline</h2>

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
    </div>

    <details style="margin-top:32px">
      <summary style="cursor:pointer;font-weight:600;font-size:.9rem;color:var(--text);padding:8px 0">Marketing Checklist</summary>
      ${checklistSections.map(s => `
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
      `).join('')}
    </details>
  `;
}

// ── Wire content pipeline ───────────────────────────────────────────────────

function wireContentPipeline(pipeline) {
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

// ── Section: Reference (social, shipped, seasonal) ───────────────────────────

function renderReference() {
  return `
    <h2 class="adm-section-title">Quick Reference</h2>

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

// ── Boot ─────────────────────────────────────────────────────────────────────
init();
