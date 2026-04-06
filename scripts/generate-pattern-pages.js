#!/usr/bin/env node
// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Generates pre-rendered HTML pages for each garment at build time.
// Runs AFTER vite build so it can use dist/patterns.html as the template.
// Run: node scripts/generate-pattern-pages.js

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import GARMENTS from '../src/garments/index.js';
import { PATTERN_PRICES } from '../src/lib/pricing.js';
import SEO_DESCRIPTIONS from '../src/garments/seo-descriptions.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = resolve(ROOT, 'dist');
const SITE_URL = 'https://peoplespatterns.com';

// Read the Vite-compiled template (has hashed asset references)
const template = readFileSync(resolve(DIST, 'patterns.html'), 'utf8');

// Warn about garments missing SEO descriptions so new additions don't slip through
const missing = Object.keys(GARMENTS).filter(id => !SEO_DESCRIPTIONS[id]);
if (missing.length) {
  console.warn(`⚠  Missing SEO descriptions for: ${missing.join(', ')}`);
  console.warn('   Add entries to src/garments/seo-descriptions.js for full SEO coverage.');
}

// Warn about garments missing SVG illustrations
const missingSvg = Object.keys(GARMENTS).filter(
  id => !existsSync(resolve(ROOT, 'public', 'garment-illustrations', `${id}.svg`))
);
if (missingSvg.length) {
  console.warn(`\u26A0  Missing SVG illustrations for: ${missingSvg.join(', ')}`);
  console.warn('   Add files to public/garment-illustrations/ for catalog card images.');
}

let generated = 0;

for (const [id, garment] of Object.entries(GARMENTS)) {
  const pricing = PATTERN_PRICES[id];
  const seo = SEO_DESCRIPTIONS[id];

  const diffLabel = garment.difficulty
    ? garment.difficulty.charAt(0).toUpperCase() + garment.difficulty.slice(1)
    : '';
  const priceStr = pricing ? `$${(pricing.cents / 100).toFixed(0)}` : '';
  const canonUrl = `${SITE_URL}/patterns/${id}`;

  // Use SEO description if available, otherwise fall back to the generic template
  const desc = seo?.metaDescription
    || `Generate a custom-fit ${garment.name} sewing pattern built to your exact measurements. ${diffLabel} difficulty. ${priceStr ? priceStr + '. ' : ''}Tiled PDF, materials guide, and construction instructions included.`;

  const title = `Custom-Fit ${garment.name} Sewing Pattern | People's Patterns`;

  // ---- Product JSON-LD ----
  const productJsonLd = {
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

  // ---- BreadcrumbList JSON-LD ----
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Patterns', item: `${SITE_URL}/patterns` },
      { '@type': 'ListItem', position: 3, name: garment.name },
    ],
  };

  // ---- FAQ JSON-LD (if FAQ content exists) ----
  let faqScript = '';
  if (seo?.faq?.length) {
    const faqJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: seo.faq.map(({ q, a }) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      })),
    };
    faqScript = `<script type="application/ld+json">${JSON.stringify(faqJsonLd)}</script>`;
  }

  // ---- Breadcrumb JSON-LD script tag ----
  const breadcrumbScript = `<script type="application/ld+json">${JSON.stringify(breadcrumbJsonLd)}</script>`;

  // ---- Replace placeholders in template ----
  let html = template;

  // Title tag
  html = html.replace(
    /<title id="pp-title">[^<]*<\/title>/,
    `<title id="pp-title">${escHtml(title)}</title>`,
  );

  // Meta description
  html = html.replace(
    /<meta id="pp-desc"[^>]*>/,
    `<meta id="pp-desc" name="description" content="${escAttr(desc)}">`,
  );

  // OG title
  html = html.replace(
    /<meta id="pp-og-title"[^>]*>/,
    `<meta id="pp-og-title" property="og:title" content="${escAttr(title)}">`,
  );

  // OG description
  html = html.replace(
    /<meta id="pp-og-desc"[^>]*>/,
    `<meta id="pp-og-desc" property="og:description" content="${escAttr(desc)}">`,
  );

  // OG URL
  html = html.replace(
    /<meta id="pp-og-url"[^>]*>/,
    `<meta id="pp-og-url" property="og:url" content="${escAttr(canonUrl)}">`,
  );

  // Canonical
  html = html.replace(
    /<link id="pp-canonical"[^>]*>/,
    `<link id="pp-canonical" rel="canonical" href="${escAttr(canonUrl)}">`,
  );

  // JSON-LD (replace the empty placeholder, then inject breadcrumb + FAQ after it)
  html = html.replace(
    /<script id="pp-jsonld" type="application\/ld\+json">[^<]*<\/script>/,
    `<script id="pp-jsonld" type="application/ld+json">${JSON.stringify(productJsonLd)}</script>\n${breadcrumbScript}${faqScript ? '\n' + faqScript : ''}`,
  );

  // ---- Write to dist/patterns/{id}/index.html ----
  const outDir = resolve(DIST, 'patterns', id);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(resolve(outDir, 'index.html'), html, 'utf8');
  generated++;
}

console.log(`pattern pages generated: ${generated} garments -> dist/patterns/*/index.html`);

// ── Helpers ──────────────────────────────────────────────────────────────────
function escHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escAttr(s) {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
