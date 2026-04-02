// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Learn / blog page — handles /learn and /learn/[slug]

import '../analytics.js';
import { ARTICLES as STATIC_ARTICLES } from '../content/articles.js';
import { supabase } from '../lib/supabase.js';
import GARMENTS from '../garments/index.js';

// Shared page functionality (theme, hamburger, logo, auth, analytics inject)
import './page.js';

const SITE_URL = 'https://peoplespatterns.com';

// ── Fetch articles (Supabase first, static fallback) ─────────────────────────
async function loadArticles() {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('slug, title, description, category, tags, youtube_id, date_published, faq_schema, body')
      .order('date_published', { ascending: false });

    if (!error && data?.length) {
      // Map DB column names to JS camelCase
      return data.map(a => ({
        slug:          a.slug,
        title:         a.title,
        description:   a.description,
        category:      a.category,
        tags:          a.tags || [],
        youtubeId:     a.youtube_id || null,
        datePublished: a.date_published,
        faqSchema:     a.faq_schema || [],
        body:          a.body,
      }));
    }
  } catch (_) {
    // Supabase unavailable — fall through to static
  }
  return STATIC_ARTICLES;
}

const ARTICLES = await loadArticles();

// ── Publish-date gate (drip feed for SEO) ─────────────────────────────────────
// Only articles whose datePublished <= today appear in listing & related links.
// Direct URL access still works for previewing upcoming articles.
const TODAY = new Date().toISOString().slice(0, 10);
const isPublished = (a) => !a.datePublished || a.datePublished <= TODAY;
const PUBLISHED = ARTICLES.filter(isPublished);
const CATEGORY_LABELS = {
  'getting-started': 'Getting Started',
  'printing':        'Printing',
  'about':           'About',
  'technique':       'Technique',
  'fit':             'Fit',
  'fabric':          'Fabric & Materials',
  'garments':        'Garment Guides',
  'community':       'Community & More',
  'vs':              'Comparisons',
};

// ── Routing ───────────────────────────────────────────────────────────────────
const pathParts = window.location.pathname.replace(/^\/+|\/+$/g, '').split('/');
// /learn → listing, /learn/slug → article
const slug = pathParts[1] || '';
const root = document.getElementById('learn-root');

if (slug) {
  renderArticle(slug);
} else {
  renderListing();
}

// ── Listing ───────────────────────────────────────────────────────────────────
function renderListing() {
  document.title = "Learn | People's Patterns";

  const cards = PUBLISHED.map(a => `
    <a href="/learn/${a.slug}" class="learn-card">
      <span class="learn-card-cat">${CATEGORY_LABELS[a.category] || a.category}</span>
      <h2 class="learn-card-title">${a.title}</h2>
      <p class="learn-card-desc">${a.description}</p>
      ${a.tags?.length ? `<div class="learn-card-tags">${a.tags.map(t => `<span class="learn-tag">${t}</span>`).join('')}</div>` : ''}
      <span class="learn-card-read">Read article →</span>
    </a>`).join('');

  root.innerHTML = `
    <div class="learn-wrap">
      <h1 class="learn-index-title">Learn</h1>
      <p class="learn-index-sub">Guides for measuring, printing, and sewing custom-fit patterns.</p>
      <div class="learn-grid">${cards}</div>
      <div class="learn-cta">
        <h2 class="learn-cta-title">Ready to generate your pattern?</h2>
        <a href="/?step=1" class="btn-primary">Browse Patterns</a>
      </div>
    </div>`;
}

// ── Article ───────────────────────────────────────────────────────────────────
function renderArticle(slug) {
  const article = ARTICLES.find(a => a.slug === slug);

  if (!article) {
    document.title = "Article not found | People's Patterns";
    root.innerHTML = `
      <div class="learn-wrap">
        <div class="pat-pg-notfound">
          <p class="pat-pg-404-num">404</p>
          <h2 class="pat-pg-404-heading">Article not found.</h2>
          <p class="pat-pg-404-sub">This page doesn't exist or may have been moved.</p>
          <div class="pat-pg-404-btns">
            <a href="/learn" class="btn-secondary">All articles</a>
            <a href="/" class="btn-primary">Go Home</a>
          </div>
        </div>
      </div>`;
    return;
  }

  // SEO
  const title = `${article.title} | People's Patterns`;
  const canonUrl = `${SITE_URL}/learn/${article.slug}`;
  document.title = title;
  document.getElementById('pp-title')?.setAttribute('content', title);
  document.getElementById('pp-desc')?.setAttribute('content', article.description);
  document.getElementById('pp-og-title')?.setAttribute('content', title);
  document.getElementById('pp-og-desc')?.setAttribute('content', article.description);
  const canonEl = document.getElementById('pp-canonical');
  if (canonEl) { canonEl.href = canonUrl; canonEl.setAttribute('href', canonUrl); }

  // Article JSON-LD
  const jsonld = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    author: { '@type': 'Organization', name: "People's Patterns" },
    publisher: { '@type': 'Organization', name: "People's Patterns", url: SITE_URL },
    datePublished: article.datePublished || '2026-03-27',
    url: canonUrl,
  };
  const jsonldEl = document.getElementById('pp-jsonld');
  if (jsonldEl) jsonldEl.textContent = JSON.stringify(jsonld);

  // FAQ JSON-LD (FAQPage schema)
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
    const faqScript = document.createElement('script');
    faqScript.type = 'application/ld+json';
    faqScript.textContent = JSON.stringify(faqJsonLd);
    document.head.appendChild(faqScript);
  }

  // Related articles (same category, exclude current, published only)
  const related = PUBLISHED
    .filter(a => a.slug !== slug && a.category === article.category)
    .slice(0, 2);

  const relatedHtml = related.length ? `
    <div class="learn-related">
      <h3 class="learn-related-title">Related articles</h3>
      ${related.map(r => `<a href="/learn/${r.slug}" class="learn-related-link">${r.title} →</a>`).join('')}
    </div>` : '';

  const youtubeEmbed = article.youtubeId ? `
    <div class="learn-video-wrap">
      <iframe
        src="https://www.youtube.com/embed/${article.youtubeId}"
        title="${article.title}"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
        loading="lazy">
      </iframe>
    </div>` : '';

  root.innerHTML = `
    <div class="learn-wrap learn-article-wrap">
      <nav class="pat-pg-breadcrumb">
        <a href="/">Home</a><span>/</span>
        <a href="/learn">Learn</a><span>/</span>
        <span>${article.title}</span>
      </nav>

      <span class="learn-card-cat">${CATEGORY_LABELS[article.category] || article.category}</span>
      <h1 class="learn-article-title">${article.title}</h1>

      ${youtubeEmbed}

      <div class="learn-article-body">${article.body.replace(/\{\{GARMENT_COUNT\}\}/g, Object.keys(GARMENTS).length)}</div>

      ${relatedHtml}

      <div class="learn-cta learn-cta-article">
        <h2 class="learn-cta-title">Put it into practice</h2>
        <p class="learn-cta-sub">Generate a custom-fit sewing pattern in minutes.</p>
        <a href="/?step=1" class="btn-primary">Browse Patterns</a>
      </div>
    </div>`;
}
