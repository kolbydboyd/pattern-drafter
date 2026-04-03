#!/usr/bin/env node
// Generate sample HTML files for each pin type — open in browser to preview.
// Usage: node scripts/preview-pins.mjs

import { writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = join(__dirname, '..');
const SAMPLES   = join(ROOT, 'pins', 'samples');

async function main() {
  const { PIN_DATA } = await import(pathToFileURL(join(ROOT, 'src', 'content', 'pin-data.js')).href);
  const { ARTICLES } = await import(pathToFileURL(join(ROOT, 'src', 'content', 'articles.js')).href);

  const articleMap = Object.fromEntries(ARTICLES.map(a => [a.slug, a]));
  const allPins = PIN_DATA.flatMap(entry =>
    entry.pins.map(pin => ({ ...pin, articleSlug: entry.articleSlug, article: articleMap[entry.articleSlug] }))
  );

  // Pick one of each type
  const types = ['comparison-table', 'checklist', 'how-to', 'product-feature', 'infographic'];
  const samples = types.map(t => allPins.find(p => p.type === t)).filter(Boolean);

  // Import the HTML builder from generate-pins
  const gen = await import(pathToFileURL(join(ROOT, 'scripts', 'generate-pins.mjs')).href);

  mkdirSync(SAMPLES, { recursive: true });

  for (const pin of samples) {
    const html = gen.buildPinHTML(pin);
    const path = join(SAMPLES, `${pin.type}.html`);
    writeFileSync(path, html);
    console.log(`  ${pin.type} → ${path}`);
  }

  console.log(`\nOpen these in your browser to preview.`);
}

main().catch(err => { console.error(err); process.exit(1); });
