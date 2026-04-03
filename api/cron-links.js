// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Vercel cron endpoint — scans published articles for internal linking opportunities.
// When a new article goes live, older articles that mention related topics get
// contextual links added to their body HTML.
// Schedule in vercel.json: { "path": "/api/cron-links", "schedule": "30 7 * * *" }

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const TODAY = new Date().toISOString().slice(0, 10);

// ── Link keywords ───────────────────────────────────────────────────────────
// Maps article slugs to phrases that should link to them when found in other
// articles. Only exact phrase matches (case-insensitive) are linked.
// Each entry: { slug, phrases[] }
// Phrases are checked longest-first to avoid partial matches.

function buildLinkMap(articles) {
  const map = [];

  for (const a of articles) {
    const phrases = [];

    // Use tags as linkable phrases (convert kebab to words)
    if (a.tags?.length) {
      for (const tag of a.tags) {
        const phrase = tag.replace(/-/g, ' ');
        if (phrase.length >= 4) phrases.push(phrase);
      }
    }

    // Add the article title as a linkable phrase (without the brand suffix)
    const shortTitle = a.title
      .replace(/:\s.*$/, '')           // strip subtitle after colon
      .replace(/\(.*?\)/g, '')         // strip parenthetical
      .trim();
    if (shortTitle.length >= 8) phrases.push(shortTitle);

    if (phrases.length) {
      map.push({
        slug: a.slug,
        phrases: [...new Set(phrases)].sort((a, b) => b.length - a.length),
      });
    }
  }

  return map;
}

// ── Link inserter ───────────────────────────────────────────────────────────
// Scans an article body for phrases and wraps the first occurrence of each
// matching phrase in an <a> tag, if not already linked.

function addLinks(body, linkMap, ownSlug) {
  let updated = body;
  let linksAdded = 0;
  const MAX_LINKS_PER_ARTICLE = 5;

  for (const entry of linkMap) {
    if (linksAdded >= MAX_LINKS_PER_ARTICLE) break;
    if (entry.slug === ownSlug) continue;

    const href = `/learn/${entry.slug}`;

    // Skip if this article already links to the target
    if (updated.includes(href)) continue;

    for (const phrase of entry.phrases) {
      if (linksAdded >= MAX_LINKS_PER_ARTICLE) break;

      // Build regex: match phrase not inside an existing <a> tag or HTML attribute.
      // We match the phrase only when it appears in text content (not inside tags).
      const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(
        // Negative lookbehind: not preceded by href=" or > with no < between
        `(?<![">])\\b(${escaped})\\b(?![^<]*<\\/a>)`,
        'i',
      );

      const match = updated.match(regex);
      if (match) {
        // Only replace the first occurrence
        updated = updated.replace(regex, `<a href="${href}">$1</a>`);
        linksAdded++;
        break; // one link per target article
      }
    }
  }

  return { body: updated, linksAdded };
}

// ── Main handler ────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    if (process.env.CRON_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  // Fetch all published articles
  const { data: articles, error: fetchErr } = await supabase
    .from('articles')
    .select('slug, title, tags, body, date_published')
    .lte('date_published', TODAY)
    .order('date_published', { ascending: false });

  if (fetchErr) {
    console.error('Fetch error:', fetchErr.message);
    return res.status(500).json({ error: fetchErr.message });
  }

  if (!articles || articles.length < 2) {
    return res.status(200).json({ message: 'Not enough articles for linking', processed: 0 });
  }

  const linkMap = buildLinkMap(articles);
  const results = [];

  for (const article of articles) {
    const { body: newBody, linksAdded } = addLinks(article.body, linkMap, article.slug);

    if (linksAdded > 0) {
      const { error: updateErr } = await supabase
        .from('articles')
        .update({ body: newBody })
        .eq('slug', article.slug);

      if (updateErr) {
        console.error(`Error updating ${article.slug}:`, updateErr.message);
        results.push({ slug: article.slug, status: 'error', error: updateErr.message });
      } else {
        results.push({ slug: article.slug, status: 'ok', linksAdded });
      }
    }
  }

  const updated = results.filter(r => r.status === 'ok').length;
  const totalLinks = results.reduce((sum, r) => sum + (r.linksAdded || 0), 0);
  console.log(`Link cron: ${updated} articles updated, ${totalLinks} links added`);

  return res.status(200).json({ updated, totalLinks, results });
}
