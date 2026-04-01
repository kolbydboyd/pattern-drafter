#!/usr/bin/env node
// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Pinterest pin generation orchestrator.
//
// This script manages the lifecycle of pin image generation via Canva:
//   1. Reads PIN_DATA and ARTICLES to build a manifest
//   2. Tracks which pins have been generated, exported, and uploaded
//   3. Outputs Canva prompts for each ungenerated pin
//
// Usage:
//   node scripts/generate-pins.mjs              — show status of all pins
//   node scripts/generate-pins.mjs --prompts    — output Canva prompts for pending pins
//   node scripts/generate-pins.mjs --mark-generated <pinId> <canvaDesignId>
//   node scripts/generate-pins.mjs --mark-exported <pinId> <localPath>

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = join(__dirname, '..');
const MANIFEST  = join(ROOT, 'pins', 'manifest.json');
const IMAGES    = join(ROOT, 'pins', 'images');

// ── Manifest helpers ────────────────────────────────────────────────────────

function loadManifest() {
  if (!existsSync(MANIFEST)) return {};
  return JSON.parse(readFileSync(MANIFEST, 'utf-8'));
}

function saveManifest(manifest) {
  mkdirSync(dirname(MANIFEST), { recursive: true });
  writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
}

// ── Load pin data (dynamic import since it's ES module) ─────────────────────

async function loadPinData() {
  const { PIN_DATA } = await import(pathToFileURL(join(ROOT, 'src', 'content', 'pin-data.js')).href);
  const { ARTICLES } = await import(pathToFileURL(join(ROOT, 'src', 'content', 'articles.js')).href);
  return { PIN_DATA, ARTICLES };
}

// ── Brand spec for Canva prompts ────────────────────────────────────────────

const BRAND = {
  headingFont: 'Fraunces Light',
  bodyFont:    'IBM Plex Mono',
  bgColor:     '#1a1714',
  textColor:   '#e8e0d4',
  accentColor: '#c9a96e',
  dimensions:  '1000x1500px vertical Pinterest pin',
  accessibility: 'IMPORTANT: Do NOT use red and green together. Use gold (#c9a96e) vs white (#e8e0d4) for contrast. Use shape + color for any icons (not color alone).',
};

// ── Prompt builders by pin type ─────────────────────────────────────────────

function buildPrompt(pin, article) {
  const base = [
    `Design a ${BRAND.dimensions}.`,
    `Brand: "${article.title}" article pin for People's Patterns (peoplespatterns.com).`,
    `Heading font: ${BRAND.headingFont}. Body font: ${BRAND.bodyFont}.`,
    `Background: ${BRAND.bgColor}. Text: ${BRAND.textColor}. Accent: ${BRAND.accentColor}.`,
    BRAND.accessibility,
    `Pin title: "${pin.title}"`,
    `Include "peoplespatterns.com" as small text at the bottom.`,
  ];

  switch (pin.type) {
    case 'comparison-table': {
      const cols = pin.tableData.columnC
        ? `Three columns: "${pin.tableData.columnA}" | "${pin.tableData.columnB}" | "${pin.tableData.columnC}"`
        : `Two columns: "${pin.tableData.columnA}" (left) vs "${pin.tableData.columnB}" (right)`;
      const rows = pin.tableData.rows
        .map((r, i) => `  Row ${i + 1}: ${r.join(' | ')}`)
        .join('\n');
      base.push(`Layout: comparison table.`, cols, `Rows:\n${rows}`);
      base.push(`Use gold accent for the "better" column header. Use subtle divider lines between rows.`);
      break;
    }
    case 'checklist': {
      const items = pin.listItems.map((item, i) => `  ${i + 1}. ${item}`).join('\n');
      base.push(`Layout: numbered checklist with checkboxes.`, `Items:\n${items}`);
      base.push(`Use gold accent for checkbox/check icons.`);
      break;
    }
    case 'how-to': {
      const steps = pin.steps.map((s, i) => `  Step ${i + 1}: ${s}`).join('\n');
      base.push(`Layout: numbered step-by-step vertical flow.`, `Steps:\n${steps}`);
      base.push(`Use gold accent for step numbers. Arrows or lines connecting steps.`);
      break;
    }
    case 'product-feature': {
      const feats = pin.features.map((f, i) => `  • ${f}`).join('\n');
      base.push(`Layout: feature list with icons.`, `Features:\n${feats}`);
      base.push(`Use gold accent for icons/bullets. Clean vertical layout.`);
      break;
    }
    case 'infographic': {
      const sections = pin.sections.map(s => `  ${s.heading}: ${s.detail}`).join('\n');
      base.push(`Layout: vertical infographic with connected sections (flowchart style).`, `Sections:\n${sections}`);
      base.push(`Use gold accent for section headers and connector lines.`);
      break;
    }
  }

  return base.join('\n');
}

// ── CLI ─────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const { PIN_DATA, ARTICLES } = await loadPinData();
  const manifest = loadManifest();

  const articleMap = Object.fromEntries(ARTICLES.map(a => [a.slug, a]));

  // Flatten all pins with article context
  const allPins = PIN_DATA.flatMap(entry =>
    entry.pins.map(pin => ({
      ...pin,
      articleSlug: entry.articleSlug,
      article:     articleMap[entry.articleSlug],
    }))
  );

  if (args[0] === '--mark-generated') {
    const [, pinId, canvaId] = args;
    if (!pinId || !canvaId) { console.error('Usage: --mark-generated <pinId> <canvaDesignId>'); process.exit(1); }
    manifest[pinId] = { ...manifest[pinId], canvaDesignId: canvaId, generatedAt: new Date().toISOString() };
    saveManifest(manifest);
    console.log(`Marked ${pinId} as generated (Canva: ${canvaId})`);
    return;
  }

  if (args[0] === '--mark-exported') {
    const [, pinId, localPath] = args;
    if (!pinId || !localPath) { console.error('Usage: --mark-exported <pinId> <localPath>'); process.exit(1); }
    manifest[pinId] = { ...manifest[pinId], localPath, exportedAt: new Date().toISOString() };
    saveManifest(manifest);
    console.log(`Marked ${pinId} as exported (${localPath})`);
    return;
  }

  if (args[0] === '--prompts') {
    const pending = allPins.filter(p => !manifest[p.id]?.canvaDesignId);
    if (pending.length === 0) { console.log('All pins have been generated!'); return; }
    console.log(`\n${pending.length} pins pending generation:\n`);
    for (const pin of pending) {
      console.log(`${'─'.repeat(70)}`);
      console.log(`PIN: ${pin.id} (${pin.type})`);
      console.log(`ARTICLE: ${pin.articleSlug}`);
      console.log(`${'─'.repeat(70)}`);
      console.log(buildPrompt(pin, pin.article));
      console.log();
    }
    return;
  }

  // Default: status
  console.log('\nPinterest Pin Generation Status\n');
  console.log(`Total pins: ${allPins.length}`);

  const generated = allPins.filter(p => manifest[p.id]?.canvaDesignId).length;
  const exported  = allPins.filter(p => manifest[p.id]?.exportedAt).length;
  const uploaded  = allPins.filter(p => manifest[p.id]?.imageUrl).length;

  console.log(`Generated:  ${generated}/${allPins.length}`);
  console.log(`Exported:   ${exported}/${allPins.length}`);
  console.log(`Uploaded:   ${uploaded}/${allPins.length}`);
  console.log();

  for (const pin of allPins) {
    const m = manifest[pin.id] || {};
    const status = m.imageUrl ? 'uploaded' : m.exportedAt ? 'exported' : m.canvaDesignId ? 'generated' : 'pending';
    console.log(`  [${status.padEnd(9)}] ${pin.id} — ${pin.title.slice(0, 50)}`);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
