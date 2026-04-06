#!/usr/bin/env node
// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Generates pre-rendered HTML pages for the /learn listing and each article.
// Runs AFTER vite build so it can use dist/learn.html as the template.

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { ARTICLES } from '../src/content/articles.js';
import GARMENTS from '../src/garments/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = resolve(ROOT, 'dist');
const SITE_URL = 'https://peoplespatterns.com';
const TODAY = new Date().toISOString().slice(0, 10);

const template = readFileSync(resolve(DIST, 'learn.html'), 'utf8');

const CATEGORY_LABELS = {
  'getting-started': 'Getting Started',
  'printing':        'Printing',
  'about':           'About',
  'technique':       'Technique',
  'fit':             'Fit',
  'fabric':          'Fabric &amp; Materials',
  'garments':        'Garment Guides',
  'community':       'Community &amp; More',
  'vs':              'Comparisons',
};

const PUBLISHED = ARTICLES.filter(a => !a.datePublished || a.datePublished <= TODAY);
const GARMENT_COUNT = Object.keys(GARMENTS).length;

// ══════════════════════════════════════════════════════════════════════════════
// 1. LISTING PAGE — dist/learn/index.html
// ══════════════════════════════════════════════════════════════════════════════

function generateListing() {
  let html = template;

  const title = "Learn to Sew | People's Patterns";
  const desc = `Guides on measuring, printing, and sewing custom-fit patterns. ${PUBLISHED.length} articles covering body measurements, fabric selection, garment construction, and more.`;

  // Title
  html = html.replace(
    /<title id="pp-title">[^<]*<\/title>/,
    `<title id="pp-title">${escHtml(title)}</title>`,
  );
  html = html.replace(/<meta id="pp-desc"[^>]*>/, `<meta id="pp-desc" name="description" content="${escAttr(desc)}">`);
  html = html.replace(/<meta id="pp-og-title"[^>]*>/, `<meta id="pp-og-title" property="og:title" content="${escAttr(title)}">`);
  html = html.replace(/<meta id="pp-og-desc"[^>]*>/, `<meta id="pp-og-desc" property="og:description" content="${escAttr(desc)}">`);
  html = html.replace(/<link id="pp-canonical"[^>]*>/, `<link id="pp-canonical" rel="canonical" href="${SITE_URL}/learn">`);

  // CollectionPage JSON-LD
  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description: desc,
    url: `${SITE_URL}/learn`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: PUBLISHED.length,
      itemListElement: PUBLISHED.map((a, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${SITE_URL}/learn/${a.slug}`,
        name: a.title,
      })),
    },
  };
  html = html.replace(
    /<script id="pp-jsonld" type="application\/ld\+json">[^<]*<\/script>/,
    `<script id="pp-jsonld" type="application/ld+json">${JSON.stringify(collectionJsonLd)}</script>`,
  );

  // Build article cards HTML
  const cards = PUBLISHED.map(a => `
    <article style="margin-bottom:24px">
      <span style="font-size:13px;color:#888">${CATEGORY_LABELS[a.category] || a.category}</span>
      <h2 style="margin:4px 0 8px"><a href="/learn/${a.slug}">${escHtml(a.title)}</a></h2>
      <p style="margin:0;color:#666">${escHtml(a.description)}</p>
    </article>`).join('');

  const listingHtml = `
  <div style="max-width:900px;margin:0 auto;padding:32px 20px">
    <h1>Learn to Sew</h1>
    <p>Guides for measuring, printing, and sewing custom-fit patterns. Whether you are picking up a sewing machine for the first time or refining your tailoring skills, these articles walk you through every step.</p>
    ${cards}
    <p><a href="/?step=1">Browse patterns</a> · <a href="/pricing">View pricing</a></p>
  </div>`;

  html = html.replace(
    /<main id="learn-root" class="learn-root"><\/main>/,
    `<main id="learn-root" class="learn-root">${listingHtml}</main>`,
  );

  const outDir = resolve(DIST, 'learn');
  mkdirSync(outDir, { recursive: true });
  writeFileSync(resolve(outDir, 'index.html'), html, 'utf8');
}

// ══════════════════════════════════════════════════════════════════════════════
// 2. ARTICLE DETAIL PAGES — dist/learn/{slug}/index.html
// ══════════════════════════════════════════════════════════════════════════════

function generateArticle(article) {
  let html = template;

  const title = `${article.title} | People's Patterns`;
  const canonUrl = `${SITE_URL}/learn/${article.slug}`;

  html = html.replace(/<title id="pp-title">[^<]*<\/title>/, `<title id="pp-title">${escHtml(title)}</title>`);
  html = html.replace(/<meta id="pp-desc"[^>]*>/, `<meta id="pp-desc" name="description" content="${escAttr(article.description)}">`);
  html = html.replace(/<meta id="pp-og-title"[^>]*>/, `<meta id="pp-og-title" property="og:title" content="${escAttr(title)}">`);
  html = html.replace(/<meta id="pp-og-desc"[^>]*>/, `<meta id="pp-og-desc" property="og:description" content="${escAttr(article.description)}">`);
  html = html.replace(/<link id="pp-canonical"[^>]*>/, `<link id="pp-canonical" rel="canonical" href="${escAttr(canonUrl)}">`);

  // Article JSON-LD
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    author: { '@type': 'Organization', name: "People's Patterns" },
    publisher: { '@type': 'Organization', name: "People's Patterns", url: SITE_URL },
    datePublished: article.datePublished || '2026-03-27',
    url: canonUrl,
  };

  let jsonLdScripts = `<script id="pp-jsonld" type="application/ld+json">${JSON.stringify(articleJsonLd)}</script>`;

  // FAQ JSON-LD
  if (article.faqSchema?.length) {
    const faqJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: article.faqSchema.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
      })),
    };
    jsonLdScripts += `\n<script type="application/ld+json">${JSON.stringify(faqJsonLd)}</script>`;
  }

  // BreadcrumbList
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Learn', item: `${SITE_URL}/learn` },
      { '@type': 'ListItem', position: 3, name: article.title },
    ],
  };
  jsonLdScripts += `\n<script type="application/ld+json">${JSON.stringify(breadcrumbJsonLd)}</script>`;

  html = html.replace(
    /<script id="pp-jsonld" type="application\/ld\+json">[^<]*<\/script>/,
    jsonLdScripts,
  );

  // Related articles
  const related = PUBLISHED
    .filter(a => a.slug !== article.slug && a.category === article.category)
    .slice(0, 2);
  const relatedHtml = related.length ? `
    <div style="margin-top:32px;padding-top:24px;border-top:1px solid #eee">
      <h3>Related articles</h3>
      ${related.map(r => `<a href="/learn/${r.slug}" style="display:block;margin-bottom:8px">${escHtml(r.title)} &rarr;</a>`).join('')}
    </div>` : '';

  // Article body with garment count replacement
  const body = article.body.replace(/\{\{GARMENT_COUNT\}\}/g, GARMENT_COUNT);

  const articleHtml = `
  <div style="max-width:760px;margin:0 auto;padding:32px 20px">
    <nav style="font-size:14px;margin-bottom:16px">
      <a href="/">Home</a> / <a href="/learn">Learn</a> / <span>${escHtml(article.title)}</span>
    </nav>
    <span style="font-size:13px;color:#888">${CATEGORY_LABELS[article.category] || article.category}</span>
    <h1>${escHtml(article.title)}</h1>
    <div>${body}</div>
    ${relatedHtml}
    <div style="margin-top:32px;text-align:center">
      <h2>Put it into practice</h2>
      <p>Generate a custom-fit sewing pattern in minutes.</p>
      <a href="/?step=1">Browse Patterns</a>
    </div>
  </div>`;

  html = html.replace(
    /<main id="learn-root" class="learn-root"><\/main>/,
    `<main id="learn-root" class="learn-root">${articleHtml}</main>`,
  );

  const outDir = resolve(DIST, 'learn', article.slug);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(resolve(outDir, 'index.html'), html, 'utf8');
}

// ══════════════════════════════════════════════════════════════════════════════
// Run
// ══════════════════════════════════════════════════════════════════════════════

generateListing();
for (const article of PUBLISHED) {
  generateArticle(article);
}

const futureCount = ARTICLES.length - PUBLISHED.length;
console.log(`learn pages generated: 1 listing + ${PUBLISHED.length} articles -> dist/learn/*/index.html`);
if (futureCount > 0) {
  console.log(`  (${futureCount} articles scheduled for future publication, not yet pre-rendered)`);
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function escHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function escAttr(s) {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
