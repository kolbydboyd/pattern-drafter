#!/usr/bin/env node
// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Seeds the pinterest_pins table in Supabase with scheduled pin rows.
// Computes scheduled_at from article.datePublished + pin.scheduleDayOffset + smart slot time.
//
// Usage:
//   node scripts/seed-pinterest-pins.mjs              — seed all pins (skips existing)
//   node scripts/seed-pinterest-pins.mjs --dry-run    — show what would be inserted
//   node scripts/seed-pinterest-pins.mjs --reseed     — delete all and re-insert
//
// Requires: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createClient } from '@supabase/supabase-js';
import { getSmartPostTime } from './smart-schedule.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = join(__dirname, '..');
const MANIFEST  = join(ROOT, 'pins', 'manifest.json');

// ── Load env ────────────────────────────────────────────────────────────────

function loadEnv() {
  const envPath = join(ROOT, '.env.local');
  if (!existsSync(envPath)) {
    console.error('Missing .env.local — need SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }
  const lines = readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2].trim();
  }
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  loadEnv();

  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const reseed = args.includes('--reseed');

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );

  const { PIN_DATA } = await import(join(ROOT, 'src', 'content', 'pin-data.js'));
  const { ARTICLES } = await import(join(ROOT, 'src', 'content', 'articles.js'));

  const articleMap = Object.fromEntries(ARTICLES.map(a => [a.slug, a]));

  // Load manifest for image URLs
  let manifest = {};
  if (existsSync(MANIFEST)) {
    manifest = JSON.parse(readFileSync(MANIFEST, 'utf-8'));
  }

  // Build rows
  const rows = [];
  for (const entry of PIN_DATA) {
    const article = articleMap[entry.articleSlug];
    if (!article) {
      console.warn(`  [warn] Article not found: ${entry.articleSlug} — skipping`);
      continue;
    }

    // Track slot index per day to spread pins across time slots
    const daySlotCounters = {};

    for (const pin of entry.pins) {
      const baseDate = new Date(article.datePublished + 'T00:00:00');
      baseDate.setDate(baseDate.getDate() + pin.scheduleDayOffset);

      const dayKey = baseDate.toISOString().slice(0, 10);
      daySlotCounters[dayKey] = (daySlotCounters[dayKey] || 0);
      const slotIndex = daySlotCounters[dayKey]++;

      const scheduledAt = getSmartPostTime(baseDate, slotIndex);
      const imageUrl = manifest[pin.id]?.imageUrl || null;

      rows.push({
        article_slug: entry.articleSlug,
        pin_id:       pin.id,
        type:         pin.type,
        title:        pin.title,
        description:  pin.description,
        board:        pin.board,
        image_url:    imageUrl,
        link:         `/learn/${entry.articleSlug}`,
        scheduled_at: scheduledAt.toISOString(),
        ifttt_status: 'pending',
      });
    }
  }

  console.log(`\n${rows.length} pins to seed:\n`);
  for (const row of rows) {
    const date = new Date(row.scheduled_at);
    const dateStr = date.toLocaleString('en-US', { timeZone: 'America/New_York', dateStyle: 'short', timeStyle: 'short' });
    const img = row.image_url ? 'has image' : 'no image';
    console.log(`  ${dateStr.padEnd(20)} [${row.type.padEnd(16)}] ${row.pin_id} (${img})`);
  }

  if (dryRun) {
    console.log('\n(dry run — nothing inserted)');
    return;
  }

  if (reseed) {
    console.log('\nDeleting existing pins...');
    const { error: delErr } = await supabase.from('pinterest_pins').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (delErr) { console.error('Delete error:', delErr.message); process.exit(1); }
  }

  // Upsert by pin_id
  const { error } = await supabase
    .from('pinterest_pins')
    .upsert(rows, { onConflict: 'pin_id' });

  if (error) {
    console.error('\nInsert error:', error.message);
    process.exit(1);
  }

  console.log(`\nSeeded ${rows.length} pins successfully.`);
}

main().catch(err => { console.error(err); process.exit(1); });
