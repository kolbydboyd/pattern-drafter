// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Vercel cron endpoint — drip-publish scheduled blog articles
// Schedule in vercel.json: { "path": "/api/cron/publish-posts", "schedule": "0 9 * * 1,4" }
// Runs Monday + Thursday at 09:00 UTC → publishes 1 article per run (≈ 2/week).

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const today = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'

  // Find the single oldest unpublished article whose scheduled_date has arrived.
  const { data: due, error: fetchErr } = await supabase
    .from('articles')
    .select('id, slug, title')
    .eq('published', false)
    .lte('scheduled_date', today)
    .order('scheduled_date', { ascending: true })
    .limit(1);

  if (fetchErr) {
    console.error('[publish-posts] fetch error:', fetchErr.message);
    return res.status(500).json({ error: fetchErr.message });
  }

  if (!due || due.length === 0) {
    console.log('[publish-posts] nothing due today');
    return res.status(200).json({ ok: true, published: 0 });
  }

  const article = due[0];

  const { error: updateErr } = await supabase
    .from('articles')
    .update({ published: true, publish_date: today })
    .eq('id', article.id);

  if (updateErr) {
    console.error('[publish-posts] update error:', updateErr.message);
    return res.status(500).json({ error: updateErr.message });
  }

  console.log(`[publish-posts] published: ${article.slug} (${today})`);
  return res.status(200).json({ ok: true, published: 1, slug: article.slug });
}
