// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Learn / blog page — handles /learn and /learn/[slug]

import '../analytics.js';
import { ARTICLES as STATIC_ARTICLES } from '../content/articles.js';
import { supabase } from '../lib/supabase.js';
import GARMENTS from '../garments/index.js';
import { initLocale, loadLocale, t } from '../lib/i18n.js';

// Shared page functionality (theme, hamburger, logo, auth, analytics inject)
import './page.js';

const _learnLocale = initLocale();
const _localeReady = loadLocale(_learnLocale);

async function loadLocaleArticles(locale) {
  if (locale === 'en') return STATIC_ARTICLES;
  try {
    const mod = await import(`../locales/${locale}/articles.js`);
    return mod.default || STATIC_ARTICLES;
  } catch {
    return STATIC_ARTICLES;
  }
}

const SITE_URL = 'https://peoplespatterns.com';

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

// ── Fetch articles (Supabase first, static fallback) ─────────────────────────
async function loadArticles() {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('slug, title, description, category, tags, youtube_id, date_published, faq_schema, body')
      .order('date_published', { ascending: false });

    if (!error && data?.length) {
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
    // Supabase unavailable — fall through to locale static
  }
  return loadLocaleArticles(_learnLocale);
}

// ── Init ─────────────────────────────────────────────────────────────────────
Promise.all([loadArticles(), _localeReady]).then(([ARTICLES]) => {
  const TODAY = new Date().toISOString().slice(0, 10);
  const isPublished = (a) => !a.datePublished || a.datePublished <= TODAY;
  const PUBLISHED = ARTICLES.filter(isPublished);

  const pathParts = window.location.pathname.replace(/^\/+|\/+$/g, '').split('/');
  const slug = pathParts[1] || '';
  const root = document.getElementById('learn-root');

  if (slug) {
    renderArticle(slug, ARTICLES, PUBLISHED, root);
  } else {
    renderListing(PUBLISHED, root);
  }
});

// ── Listing ───────────────────────────────────────────────────────────────────
function renderListing(PUBLISHED, root) {
  document.title = "Learn | People's Patterns";

  // Build category pills
  const cats = [...new Set(PUBLISHED.map(a => a.category))];
  const pills = ['all', ...cats].map(c => {
    const label = c === 'all' ? t('learn.cat.all') : (CATEGORY_LABELS[c] || c);
    return `<button class="learn-pill${c === 'all' ? ' learn-pill-active' : ''}" data-cat="${c}">${label}</button>`;
  }).join('');

  function renderCards(articles) {
    return articles.map(a => `
      <a href="/learn/${a.slug}" class="learn-card">
        <span class="learn-card-cat">${CATEGORY_LABELS[a.category] || a.category}</span>
        <h2 class="learn-card-title">${a.title}</h2>
        <p class="learn-card-desc">${a.description}</p>
        ${a.tags?.length ? `<div class="learn-card-tags">${a.tags.map(tag => `<span class="learn-tag">${tag}</span>`).join('')}</div>` : ''}
        <span class="learn-card-read">${t('learn.read-article')}</span>
      </a>`).join('');
  }

  root.innerHTML = `
    <div class="learn-wrap">
      <h1 class="learn-index-title">${t('learn.title')}</h1>
      <p class="learn-index-sub">${t('learn.index-sub')}</p>
      <div class="learn-filters">
        <input type="text" class="learn-search" id="learn-search" placeholder="${t('learn.search.placeholder')}" autocomplete="off">
        <div class="learn-pills">${pills}</div>
      </div>
      <div class="learn-grid" id="learn-grid">${renderCards(PUBLISHED)}</div>
      <div class="learn-cta">
        <h2 class="learn-cta-title">${t('learn.cta.h2')}</h2>
        <a href="/?step=1" class="btn-primary">${t('learn.cta.btn')}</a>
      </div>
    </div>`;

  // Filter logic
  let activeCat = 'all';
  const grid = document.getElementById('learn-grid');
  const searchInput = document.getElementById('learn-search');

  function applyFilters() {
    const q = (searchInput?.value || '').toLowerCase().trim();
    const filtered = PUBLISHED.filter(a => {
      if (activeCat !== 'all' && a.category !== activeCat) return false;
      if (q && !a.title.toLowerCase().includes(q) && !a.description.toLowerCase().includes(q) &&
          !(a.tags || []).some(tag => tag.toLowerCase().includes(q))) return false;
      return true;
    });
    grid.innerHTML = renderCards(filtered) || `<p style="color:var(--mid);padding:24px;text-align:center">${t('learn.no-results')}</p>`;
  }

  root.querySelectorAll('.learn-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      root.querySelectorAll('.learn-pill').forEach(b => b.classList.remove('learn-pill-active'));
      btn.classList.add('learn-pill-active');
      activeCat = btn.dataset.cat;
      applyFilters();
    });
  });

  searchInput?.addEventListener('input', applyFilters);
}

// ── Article ───────────────────────────────────────────────────────────────────
function renderArticle(slug, ARTICLES, PUBLISHED, root) {
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
      <h3 class="learn-related-title">${t('learn.article.related')}</h3>
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
        <a href="/learn">${t('learn.article.breadcrumb')}</a><span>/</span>
        <span>${article.title}</span>
      </nav>

      <div class="learn-founder-badge">${t('learn.article.written-by')}</div>
      <span class="learn-card-cat">${CATEGORY_LABELS[article.category] || article.category}</span>
      <h1 class="learn-article-title">${article.title}</h1>

      ${youtubeEmbed}

      <div class="learn-article-body">${article.body.replace(/\{\{GARMENT_COUNT\}\}/g, Object.keys(GARMENTS).length)}</div>

      ${relatedHtml}

      <div class="learn-cta learn-cta-article">
        <h2 class="learn-cta-title">${t('learn.article.cta.h2')}</h2>
        <p class="learn-cta-sub">${t('learn.article.cta.sub')}</p>
        <a href="/?step=1" class="btn-primary">${t('learn.article.cta.btn')}</a>
      </div>
    </div>`;
}
