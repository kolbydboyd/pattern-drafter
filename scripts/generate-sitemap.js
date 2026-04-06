#!/usr/bin/env node
// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Generates public/sitemap.xml at build time.
// Only includes articles whose datePublished <= today (drip-feed for SEO).
// Fetches articles from Supabase if available, falling back to static files.
// Run: node scripts/generate-sitemap.js

import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { ARTICLES as STATIC_ARTICLES } from '../src/content/articles.js';
import GARMENTS from '../src/garments/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const TODAY = new Date().toISOString().slice(0, 10);

// ── Garment IDs (derived from source registry) ──────────────────────────────
const GARMENT_IDS = Object.keys(GARMENTS);

// ── Fetch articles (Supabase first, static fallback) ─────────────────────────
async function loadArticles() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (url && key) {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(url, key);
      const { data, error } = await supabase
        .from('articles')
        .select('slug, date_published')
        .order('date_published', { ascending: false });

      if (!error && data?.length) {
        console.log(`  fetched ${data.length} articles from Supabase`);
        return data.map(a => ({
          slug: a.slug,
          datePublished: a.date_published,
        }));
      }
    } catch (err) {
      console.log(`  Supabase unavailable (${err.message}), using static articles`);
    }
  }
  return STATIC_ARTICLES;
}

// ── Static pages ───────────────────────────────────────────────────────────────
const STATIC_PAGES = [
  { loc: '/',         priority: '1.0', changefreq: 'weekly'  },
  { loc: '/patterns', priority: '0.9', changefreq: 'weekly'  },
  { loc: '/learn',    priority: '0.8', changefreq: 'weekly'  },
  { loc: '/faq',      priority: '0.6', changefreq: 'monthly' },
  { loc: '/terms',    priority: '0.3', changefreq: 'yearly'  },
  { loc: '/privacy',  priority: '0.3', changefreq: 'yearly'  },
  { loc: '/tester',   priority: '0.7', changefreq: 'weekly'  },
  { loc: '/pricing',  priority: '0.8', changefreq: 'monthly' },
  { loc: '/about',    priority: '0.5', changefreq: 'monthly' },
  // SEO landing pages
  { loc: '/made-to-measure-sewing-patterns',          priority: '0.8', changefreq: 'monthly' },
  { loc: '/custom-sewing-patterns-from-measurements', priority: '0.8', changefreq: 'monthly' },
  { loc: '/made-to-measure-mens-sewing-patterns',     priority: '0.8', changefreq: 'monthly' },
  { loc: '/made-to-measure-womens-sewing-patterns',   priority: '0.8', changefreq: 'monthly' },
  { loc: '/how-made-to-measure-sewing-patterns-work', priority: '0.7', changefreq: 'monthly' },
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

async function main() {
  const ARTICLES = await loadArticles();
  const PUBLISHED = ARTICLES.filter(a => !a.datePublished || a.datePublished <= TODAY);

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
}

main();
