// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Vercel cron endpoint — daily sitemap regeneration + Search Console ping.
// Runs once daily. Generates sitemap from published articles and garments,
// uploads to Supabase Storage, and pings Google Search Console.
// Schedule in vercel.json: { "path": "/api/cron-sitemap", "schedule": "0 6 * * *" }

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const SITE_URL = 'https://peoplespatterns.com';
const TODAY = new Date().toISOString().slice(0, 10);

// ── Garment IDs (must match src/garments/index.js) ──────────────────────────
const GARMENT_IDS = [
  'cargo-shorts', 'gym-shorts', 'swim-trunks', 'pleated-shorts', 'baggy-shorts',
  'straight-jeans', 'baggy-jeans', 'chinos', 'pleated-trousers', 'sweatpants',
  'tee', 'camp-shirt', 'crewneck', 'hoodie', 'crop-jacket', 'denim-jacket',
  'wide-leg-trouser-w', 'straight-trouser-w', 'easy-pant-w',
  'button-up-w', 'shell-blouse-w', 'fitted-tee-w',
  'slip-skirt-w', 'a-line-skirt-w', 'shirt-dress-w', 'wrap-dress-w',
  'cargo-work-pants',
  'athletic-formal-jacket', 'athletic-formal-trousers',
  'tshirt-dress-w', 'slip-dress-w', 'a-line-dress-w', 'sundress-w',
  'tote-bag',
];

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
];

function urlEntry(loc, priority, changefreq, lastmod) {
  return `  <url>
    <loc>${SITE_URL}${loc}</loc>
    <lastmod>${lastmod || TODAY}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

async function getPublishedArticles() {
  // Fetch from articles table if it exists, otherwise fall back to static list
  const { data, error } = await supabase
    .from('articles')
    .select('slug, date_published')
    .lte('date_published', TODAY)
    .order('date_published', { ascending: false });

  if (error || !data) {
    // Table may not exist yet — return empty (build-time sitemap covers this)
    console.log('Articles table not available, using garments + static pages only');
    return [];
  }
  return data;
}

function buildSitemap(articles) {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...STATIC_PAGES.map(p => urlEntry(p.loc, p.priority, p.changefreq)),
    ...GARMENT_IDS.map(id => urlEntry(`/patterns/${id}`, '0.8', 'monthly')),
    ...articles.map(a => urlEntry(`/learn/${a.slug}`, '0.7', 'monthly', a.date_published)),
    '</urlset>',
  ];
  return lines.join('\n');
}

async function uploadSitemap(xml) {
  // Upload to Supabase Storage (public bucket) as a fallback/canonical source.
  // The build-time sitemap in /public/sitemap.xml is primary during deploys.
  const { error } = await supabase.storage
    .from('site-assets')
    .upload('sitemap.xml', new Blob([xml], { type: 'application/xml' }), {
      contentType: 'application/xml',
      upsert: true,
    });
  return error;
}

async function pingSearchConsole() {
  const sitemapUrl = encodeURIComponent(`${SITE_URL}/sitemap.xml`);
  const pingUrl = `https://www.google.com/ping?sitemap=${sitemapUrl}`;
  try {
    const res = await fetch(pingUrl);
    return { ok: res.ok, status: res.status };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    if (process.env.CRON_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  const articles = await getPublishedArticles();
  const xml = buildSitemap(articles);
  const totalUrls = STATIC_PAGES.length + GARMENT_IDS.length + articles.length;

  const uploadErr = await uploadSitemap(xml);
  if (uploadErr) {
    console.error('Sitemap upload error:', uploadErr.message);
  }

  const pingResult = await pingSearchConsole();
  console.log(`Sitemap cron: ${totalUrls} URLs, ping: ${pingResult.ok ? 'ok' : 'failed'}`);

  return res.status(200).json({
    urls: totalUrls,
    articles: articles.length,
    uploaded: !uploadErr,
    ping: pingResult,
  });
}
