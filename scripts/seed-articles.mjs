#!/usr/bin/env node
// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Seed script — migrates all static JS articles into the Supabase articles table.
// Usage: node scripts/seed-articles.mjs
// Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars (or .env.local).

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Import static articles (ESM)
const { ARTICLES } = await import('../src/content/articles.js');

console.log(`Found ${ARTICLES.length} articles to seed.`);

// Transform to DB column names
const rows = ARTICLES.map(a => ({
  slug:           a.slug,
  title:          a.title,
  description:    a.description,
  category:       a.category,
  tags:           a.tags || [],
  youtube_id:     a.youtubeId || null,
  date_published: a.datePublished,
  faq_schema:     a.faqSchema || [],
  body:           a.body.trim(),
}));

// Upsert in batches of 10 (body column can be large)
const BATCH = 10;
let inserted = 0;
let updated = 0;
let errors = 0;

for (let i = 0; i < rows.length; i += BATCH) {
  const batch = rows.slice(i, i + BATCH);
  const { data, error } = await supabase
    .from('articles')
    .upsert(batch, { onConflict: 'slug', ignoreDuplicates: false })
    .select('slug');

  if (error) {
    console.error(`Batch ${i / BATCH + 1} error:`, error.message);
    errors += batch.length;
  } else {
    inserted += data.length;
    console.log(`  Batch ${i / BATCH + 1}: ${data.length} articles upserted`);
  }
}

console.log(`\nDone. ${inserted} upserted, ${errors} errors.`);
process.exit(errors > 0 ? 1 : 0);
