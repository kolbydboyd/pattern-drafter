// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Pattern detail page — handles /patterns/[garment-id]

import GARMENTS from '../garments/index.js';
import { PATTERN_PRICES } from '../lib/pricing.js';
import { renderMakesGallery, extractTesters, renderAsSeenOn } from './real-makes.js';

const SITE_URL = 'https://peoplespatterns.com';

// ── Dark-mode (shared with other pages) ──────────────────────────────────────
const THEME_KEY = 'pp-theme';
const savedTheme = localStorage.getItem(THEME_KEY);
if (savedTheme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
document.getElementById('theme-btn')?.addEventListener('click', () => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  document.documentElement.setAttribute('data-theme', isDark ? '' : 'dark');
  localStorage.setItem(THEME_KEY, isDark ? '' : 'dark');
});

// ── Routing ───────────────────────────────────────────────────────────────────
const pathParts = window.location.pathname.replace(/^\/+|\/+$/g, '').split('/');
// /patterns/cargo-shorts → ['patterns', 'cargo-shorts']
const garmentId = pathParts[1] || '';

const garment  = GARMENTS[garmentId];
const pricing  = PATTERN_PRICES[garmentId];
const root     = document.getElementById('pattern-page-root');

// ── 404 path ──────────────────────────────────────────────────────────────────
if (!garment) {
  // Show all-patterns listing if no ID given, else 404
  if (!garmentId) {
    renderPatternListing();
  } else {
    root.innerHTML = `
      <div class="pat-pg-notfound">
        <p class="pat-pg-404-num">404</p>
        <h2 class="pat-pg-404-heading">Pattern not found.</h2>
        <p class="pat-pg-404-sub">This page doesn't exist or may have been moved.</p>
        <div class="pat-pg-404-btns">
          <a href="/" class="btn-primary">Go Home</a>
          <a href="/?step=1" class="btn-secondary">Browse Patterns</a>
        </div>
      </div>`;
  }
  // eslint-disable-next-line no-throw-literal
  throw 0; // stop execution
}

// ── SEO meta ──────────────────────────────────────────────────────────────────
const title = `Custom-Fit ${garment.name} Sewing Pattern | People's Patterns`;
const diffLabel = garment.difficulty ? garment.difficulty.charAt(0).toUpperCase() + garment.difficulty.slice(1) : '';
const priceStr  = pricing ? `$${(pricing.cents / 100).toFixed(0)}` : '';
const desc      = `Generate a custom-fit ${garment.name} sewing pattern built to your exact measurements. ${diffLabel} difficulty. ${priceStr ? priceStr + '. ' : ''}Tiled PDF, materials guide, and construction instructions included.`;
const canonUrl  = `${SITE_URL}/patterns/${garmentId}`;

document.title = title;
document.getElementById('pp-title')?.setAttribute('content', title);
document.getElementById('pp-desc')?.setAttribute('content', desc);
document.getElementById('pp-og-title')?.setAttribute('content', title);
document.getElementById('pp-og-desc')?.setAttribute('content', desc);
document.getElementById('pp-og-url')?.setAttribute('content', canonUrl);
const canonEl = document.getElementById('pp-canonical');
if (canonEl) { canonEl.href = canonUrl; canonEl.setAttribute('href', canonUrl); }

// Product JSON-LD
const jsonld = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: `${garment.name} Sewing Pattern`,
  description: desc,
  url: canonUrl,
  brand: { '@type': 'Brand', name: "People's Patterns" },
  offers: pricing ? {
    '@type': 'Offer',
    price: (pricing.cents / 100).toFixed(2),
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
    url: canonUrl,
  } : undefined,
};
const jsonldEl = document.getElementById('pp-jsonld');
if (jsonldEl) jsonldEl.textContent = JSON.stringify(jsonld);

// ── Related patterns (same category) ──────────────────────────────────────────
const related = Object.values(GARMENTS)
  .filter(g => g.id !== garmentId && g.category === garment.category)
  .slice(0, 3);

// ── Option list ───────────────────────────────────────────────────────────────
const optionItems = garment.options
  ? Object.entries(garment.options).map(([key, opt]) => {
      const vals = opt.values?.map(v => v.label).join(' / ') || '';
      return `<li><strong>${opt.label}:</strong> ${vals}</li>`;
    }).join('')
  : '';

// ── Fit check table ───────────────────────────────────────────────────────────
const MEAS_LABELS = {
  waist:    ['Waist circumference',  'waist measurement + ease'],
  hip:      ['Hip circumference',    'hip measurement + ease'],
  chest:    ['Chest circumference',  'chest measurement + ease'],
  bust:     ['Bust circumference',   'bust measurement + ease'],
  rise:     ['Crotch rise',          'rise measurement'],
  inseam:   ['Inseam length',        'inseam measurement'],
  thigh:    ['Thigh circumference',  'thigh measurement + ease'],
  knee:     ['Knee circumference',   'knee measurement + ease'],
  shoulder: ['Shoulder width',       'shoulder measurement'],
  sleeve:   ['Sleeve length',        'sleeve measurement'],
  neck:     ['Neck circumference',   'neck measurement + ease'],
  height:   ['Body height',          'height measurement'],
};

const fitCheckRows = (garment.measurements || [])
  .filter(k => MEAS_LABELS[k])
  .map(k => `<tr><td>${MEAS_LABELS[k][0]}</td><td>From your ${MEAS_LABELS[k][1]}</td></tr>`)
  .join('');

// ── Included items ────────────────────────────────────────────────────────────
const includedItems = [
  'Print-ready tiled PDF (US Letter and A4)',
  'Full materials list with yardage',
  'Stitch and notions guide',
  'Step-by-step construction instructions',
  'Scale verification page',
  'Drafted to your exact measurements',
].map(i => `<li>${i}</li>`).join('');

// ── Related cards ─────────────────────────────────────────────────────────────
const relatedCards = related.map(g => {
  const p = PATTERN_PRICES[g.id];
  return `
    <a href="/patterns/${g.id}" class="pat-pg-related-card">
      <div class="pat-pg-related-name">${g.name}</div>
      <div class="pat-pg-related-meta">
        <span class="pat-pg-diff-badge pat-pg-diff-${g.difficulty}">${g.difficulty || ''}</span>
        ${p ? `<span class="pat-pg-related-price">$${(p.cents / 100).toFixed(0)}</span>` : ''}
      </div>
    </a>`;
}).join('');

// ── Render ────────────────────────────────────────────────────────────────────
root.innerHTML = `
<div class="pat-pg-wrap">

  <nav class="pat-pg-breadcrumb">
    <a href="/">Home</a>
    <span>/</span>
    <a href="/patterns">Patterns</a>
    <span>/</span>
    <span>${garment.name}</span>
  </nav>

  <div class="pat-pg-hero">
    <div class="pat-pg-photo-wrap">
      <div class="pat-pg-photo-placeholder">
        <span class="pat-pg-photo-coming">Photos coming soon</span>
      </div>
    </div>

    <div class="pat-pg-info">
      <div class="pat-pg-badges">
        ${diffLabel ? `<span class="pat-pg-diff-badge pat-pg-diff-${garment.difficulty}">${diffLabel}</span>` : ''}
        ${priceStr ? `<span class="pat-pg-price-badge">${priceStr}</span>` : ''}
      </div>

      <h1 class="pat-pg-name">${garment.name}</h1>

      <p class="pat-pg-tagline">Custom-fit sewing pattern drafted to your exact measurements.</p>

      <a href="/?step=1&garment=${garmentId}" class="btn-primary pat-pg-generate-btn">
        Generate This Pattern
      </a>
      <p class="pat-pg-generate-note">Enter your measurements and customize. Preview before you buy.</p>
      <div id="pat-pg-as-seen-on" style="display:none"></div>
      <p class="pat-pg-sewists-count" id="pat-pg-sewists-count"></p>
    </div>
  </div>

  ${optionItems ? `
  <section class="pat-pg-section">
    <h2 class="pat-pg-section-title">Customizable Options</h2>
    <ul class="pat-pg-options-list">${optionItems}</ul>
  </section>` : ''}

  <section class="pat-pg-section">
    <h2 class="pat-pg-section-title">What's Included</h2>
    <ul class="pat-pg-included-list">${includedItems}</ul>
  </section>

  ${fitCheckRows ? `
  <section class="pat-pg-section">
    <h2 class="pat-pg-section-title">Fit Check</h2>
    <p class="pat-pg-fit-note">Every dimension is drafted directly from your measurements - no grading, no size charts.</p>
    <table class="pat-pg-fit-table">
      <thead><tr><th>What we draft</th><th>Source</th></tr></thead>
      <tbody>${fitCheckRows}</tbody>
    </table>
  </section>` : ''}

  <section class="pat-pg-section" id="pat-pg-makes-gallery" style="display:none"></section>

  <section class="pat-pg-section pat-pg-section-placeholder">
    <h2 class="pat-pg-section-title">Customer Reviews</h2>
    <div class="pat-pg-reviews-placeholder">
      <p>Be the first to review this pattern. <a href="/?step=1&garment=${garmentId}">Generate yours</a> and share your fit feedback.</p>
    </div>
  </section>

  ${relatedCards ? `
  <section class="pat-pg-section">
    <h2 class="pat-pg-section-title">Related Patterns</h2>
    <p class="pat-pg-related-note">These patterns use the same body block and will fit with the same confidence.</p>
    <div class="pat-pg-related-grid">${relatedCards}</div>
  </section>` : ''}

</div>`;

// ── Real Makes gallery + "As seen on" attribution ───────────────────────────
(async function loadMakes() {
  const galleryEl = document.getElementById('pat-pg-makes-gallery');
  const asSeenEl = document.getElementById('pat-pg-as-seen-on');
  if (!galleryEl) return;
  const makes = await renderMakesGallery(galleryEl, { garmentId, limit: 12 });
  if (makes.length && asSeenEl) {
    const testers = extractTesters(makes);
    renderAsSeenOn(asSeenEl, testers);
  }
})();

// ── Per-garment sewist count ──────────────────────────────────────────────────
(function loadGarmentCount() {
  const el = document.getElementById('pat-pg-sewists-count');
  if (!el) return;
  fetch(`/api/pattern-count?garment_id=${encodeURIComponent(garmentId)}`)
    .then(r => r.json())
    .then(({ count }) => {
      if (count && count > 0) el.textContent = `${count.toLocaleString()} sewists have generated this pattern.`;
    })
    .catch(() => {});
})();

// ── Pattern listing (no garment ID given) ─────────────────────────────────────
function renderPatternListing() {
  document.title = "All Sewing Patterns | People's Patterns";
  const allGarments = Object.values(GARMENTS);

  function isWomenswear(g) { return g.id.endsWith('-w'); }

  function buildCards(list) {
    return list.map(g => {
      const p = PATTERN_PRICES[g.id];
      return `
        <a href="/patterns/${g.id}" class="pat-pg-listing-card">
          <div class="pat-pg-listing-name">${g.name}</div>
          <div class="pat-pg-listing-meta">
            <span class="pat-pg-diff-badge pat-pg-diff-${g.difficulty}">${g.difficulty || ''}</span>
            ${p ? `<span class="pat-pg-related-price">$${(p.cents / 100).toFixed(0)}</span>` : ''}
          </div>
        </a>`;
    }).join('');
  }

  root.innerHTML = `
    <div class="pat-pg-wrap">
      <h1 class="pat-pg-listing-title">All Patterns</h1>
      <div class="filter-tabs" role="tablist">
        <button class="filter-tab filter-tab-active" data-filter="all" role="tab" aria-selected="true">All</button>
        <button class="filter-tab" data-filter="menswear" role="tab" aria-selected="false">Menswear</button>
        <button class="filter-tab" data-filter="womenswear" role="tab" aria-selected="false">Womenswear</button>
      </div>
      <div class="pat-pg-listing-grid" id="pat-listing-grid">${buildCards(allGarments)}</div>
    </div>`;

  root.querySelectorAll('.filter-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      root.querySelectorAll('.filter-tab').forEach(b => {
        b.classList.remove('filter-tab-active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('filter-tab-active');
      btn.setAttribute('aria-selected', 'true');
      const filter = btn.dataset.filter;
      const filtered = filter === 'all' ? allGarments
        : filter === 'womenswear' ? allGarments.filter(isWomenswear)
        : allGarments.filter(g => !isWomenswear(g));
      document.getElementById('pat-listing-grid').innerHTML = buildCards(filtered);
    });
  });
}
