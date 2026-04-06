#!/usr/bin/env node
// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Generates a pre-rendered /patterns/index.html with crawlable catalog content.
// Runs AFTER vite build so it can use dist/patterns.html as the template.

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import GARMENTS from '../src/garments/index.js';
import { PATTERN_PRICES } from '../src/lib/pricing.js';
import SEO_DESCRIPTIONS from '../src/garments/seo-descriptions.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = resolve(ROOT, 'dist');
const SITE_URL = 'https://peoplespatterns.com';

const template = readFileSync(resolve(DIST, 'patterns.html'), 'utf8');

// ── Category grouping ────────────────────────────────────────────────────────
const CATEGORY_ORDER = ['lower', 'upper', 'skirt', 'dress', 'accessory'];
const CATEGORY_LABELS = {
  lower:     'Pants, Shorts &amp; Trousers',
  upper:     'Tops, Shirts &amp; Jackets',
  skirt:     'Skirts',
  dress:     'Dresses',
  accessory: 'Accessories',
};
const CATEGORY_INTROS = {
  lower:     'Custom-fit pants, shorts, jeans, and trousers drafted from your waist, hip, rise, and inseam measurements.',
  upper:     'Tops, shirts, and jackets drafted from your chest, shoulder, neck, and sleeve measurements.',
  skirt:     'Skirts in every silhouette, drafted from your waist and hip measurements.',
  dress:     'Dresses drafted to your full set of measurements for a complete custom fit.',
  accessory: 'Bags, ties, and aprons sized to your specifications.',
};

// ── Group garments by category ───────────────────────────────────────────────
const grouped = {};
for (const [id, garment] of Object.entries(GARMENTS)) {
  const cat = garment.category || 'accessory';
  if (!grouped[cat]) grouped[cat] = [];
  const pricing = PATTERN_PRICES[id];
  const seo = SEO_DESCRIPTIONS[id];
  const diffLabel = garment.difficulty
    ? garment.difficulty.charAt(0).toUpperCase() + garment.difficulty.slice(1)
    : '';
  const priceStr = pricing ? `$${(pricing.cents / 100).toFixed(0)}` : '';

  grouped[cat].push({
    id,
    name: garment.name,
    difficulty: diffLabel,
    price: priceStr,
    tier: pricing?.tier || '',
    desc: seo?.metaDescription || `Custom-fit ${garment.name} sewing pattern drafted to your exact measurements.`,
  });
}

// ── Build catalog HTML ───────────────────────────────────────────────────────
const totalCount = Object.keys(GARMENTS).length;

let catalogHtml = `
  <div class="seo-catalog" style="max-width:900px;margin:0 auto;padding:32px 20px">
    <h1>Made-to-Measure Sewing Patterns</h1>
    <p>${totalCount} custom-fit sewing patterns, each drafted from your exact body measurements. Enter your measurements once and generate a tiled PDF pattern sized to your body. Every pattern includes seam allowances, a materials list, and step-by-step construction instructions.</p>
    <p>Patterns start at $9 for beginner-friendly builds and go up to $19 for tailored garments with advanced construction. Your first pattern is free.</p>
`;

for (const cat of CATEGORY_ORDER) {
  const items = grouped[cat];
  if (!items?.length) continue;

  catalogHtml += `
    <section>
      <h2>${CATEGORY_LABELS[cat] || cat}</h2>
      <p>${CATEGORY_INTROS[cat] || ''}</p>
      <ul style="list-style:none;padding:0">`;

  for (const item of items) {
    catalogHtml += `
        <li style="margin-bottom:16px">
          <a href="/patterns/${item.id}" style="font-weight:600">${escHtml(item.name)}</a>
          ${item.difficulty ? ` · ${item.difficulty}` : ''}${item.price ? ` · ${item.price}` : ''}
          <br><span style="color:#666">${escHtml(item.desc)}</span>
        </li>`;
  }

  catalogHtml += `
      </ul>
    </section>`;
}

catalogHtml += `
    <section>
      <h2>How It Works</h2>
      <ol>
        <li><strong>Choose a pattern</strong> from ${totalCount} garment styles across pants, tops, skirts, dresses, and accessories.</li>
        <li><strong>Enter your measurements.</strong> Most patterns need only 3 to 5 body measurements.</li>
        <li><strong>Download your custom PDF.</strong> A tiled PDF pattern drafted to your exact body, ready to print at home.</li>
      </ol>
      <p>Every pattern is generated using parametric drafting. The same math taught in fashion design schools, applied to your numbers instead of a standard size chart.</p>
    </section>
    <p><a href="/?step=1">Get started</a> · <a href="/pricing">View pricing</a> · <a href="/learn">Learn to sew</a></p>
  </div>`;

// ── Inject into template ─────────────────────────────────────────────────────
let html = template;

// Title
html = html.replace(
  /<title id="pp-title">[^<]*<\/title>/,
  `<title id="pp-title">Made-to-Measure Sewing Patterns | People's Patterns</title>`,
);

// Meta description
const listingDesc = `Browse ${totalCount} custom-fit sewing patterns drafted from your exact body measurements. Pants, shirts, skirts, dresses, and more. Tiled PDF, materials list, and instructions included. Patterns from $9.`;
html = html.replace(
  /<meta id="pp-desc"[^>]*>/,
  `<meta id="pp-desc" name="description" content="${escAttr(listingDesc)}">`,
);

// OG tags
html = html.replace(
  /<meta id="pp-og-title"[^>]*>/,
  `<meta id="pp-og-title" property="og:title" content="Made-to-Measure Sewing Patterns | People's Patterns">`,
);
html = html.replace(
  /<meta id="pp-og-desc"[^>]*>/,
  `<meta id="pp-og-desc" property="og:description" content="${escAttr(listingDesc)}">`,
);
html = html.replace(
  /<meta id="pp-og-url"[^>]*>/,
  `<meta id="pp-og-url" property="og:url" content="${SITE_URL}/patterns">`,
);

// Canonical
html = html.replace(
  /<link id="pp-canonical"[^>]*>/,
  `<link id="pp-canonical" rel="canonical" href="${SITE_URL}/patterns">`,
);

// JSON-LD: ItemList schema
const itemListJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Made-to-Measure Sewing Patterns',
  description: listingDesc,
  numberOfItems: totalCount,
  itemListElement: Object.entries(GARMENTS).slice(0, 30).map(([id, g], i) => ({
    '@type': 'ListItem',
    position: i + 1,
    url: `${SITE_URL}/patterns/${id}`,
    name: `${g.name} Sewing Pattern`,
  })),
};
html = html.replace(
  /<script id="pp-jsonld" type="application\/ld\+json">[^<]*<\/script>/,
  `<script id="pp-jsonld" type="application/ld+json">${JSON.stringify(itemListJsonLd)}</script>`,
);

// Inject catalog content into main
html = html.replace(
  /<main id="pattern-page-root" class="pat-pg-root"><\/main>/,
  `<main id="pattern-page-root" class="pat-pg-root">${catalogHtml}</main>`,
);

// ── Write ────────────────────────────────────────────────────────────────────
const outDir = resolve(DIST, 'patterns');
mkdirSync(outDir, { recursive: true });
writeFileSync(resolve(outDir, 'index.html'), html, 'utf8');
console.log(`patterns listing generated: ${totalCount} garments -> dist/patterns/index.html`);

// ── Helpers ──────────────────────────────────────────────────────────────────
function escHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function escAttr(s) {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
