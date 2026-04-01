#!/usr/bin/env node
// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Generates public/sitemap.xml at build time.
// Only includes articles whose datePublished <= today (drip-feed for SEO).
// Run: node scripts/generate-sitemap.js

import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { ARTICLES } from '../src/content/articles.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const TODAY = new Date().toISOString().slice(0, 10);

// ── Garment IDs (must match src/garments/index.js) ────────────────────────────
const GARMENT_IDS = [
  'cargo-shorts', 'gym-shorts', 'swim-trunks', 'pleated-shorts',
  'straight-jeans', 'chinos', 'pleated-trousers', 'sweatpants',
  'tee', 'camp-shirt', 'crewneck', 'hoodie', 'crop-jacket', 'denim-jacket',
  'wide-leg-trouser-w', 'straight-trouser-w', 'easy-pant-w',
  'button-up-w', 'shell-blouse-w', 'fitted-tee-w',
  'slip-skirt-w', 'a-line-skirt-w', 'shirt-dress-w', 'wrap-dress-w',
];

// ── Published articles (datePublished <= today) ───────────────────────────────
const PUBLISHED = ARTICLES.filter(a => !a.datePublished || a.datePublished <= TODAY);

// ── Static pages ───────────────────────────────────────────────────────────────
const STATIC_PAGES = [
  { loc: '/',         priority: '1.0', changefreq: 'weekly'  },
  { loc: '/patterns', priority: '0.9', changefreq: 'weekly'  },
  { loc: '/learn',    priority: '0.8', changefreq: 'weekly'  },
  { loc: '/faq',      priority: '0.6', changefreq: 'monthly' },
  { loc: '/terms',    priority: '0.3', changefreq: 'yearly'  },
  { loc: '/privacy',  priority: '0.3', changefreq: 'yearly'  },
];

const BASE = 'https://peoplespatterns.com';

function url(loc, priority, changefreq, lastmod) {
  return `  <url>
    <loc>${BASE}${loc}</loc>
    <lastmod>${lastmod || TODAY}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

const lines = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...STATIC_PAGES.map(p => url(p.loc, p.priority, p.changefreq)),
  ...GARMENT_IDS.map(id => url(`/patterns/${id}`, '0.8', 'monthly')),
  ...PUBLISHED.map(a => url(`/learn/${a.slug}`, '0.7', 'monthly', a.datePublished)),
  '</urlset>',
];

const xml = lines.join('\n');
writeFileSync(resolve(ROOT, 'public', 'sitemap.xml'), xml, 'utf8');

const totalUrls = STATIC_PAGES.length + GARMENT_IDS.length + PUBLISHED.length;
const futureCount = ARTICLES.length - PUBLISHED.length;
console.log(`sitemap.xml generated: ${totalUrls} URLs → public/sitemap.xml`);
if (futureCount > 0) {
  console.log(`  (${futureCount} articles scheduled for future publication, not yet in sitemap)`);
}
