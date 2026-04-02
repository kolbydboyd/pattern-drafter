#!/usr/bin/env node
// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Pinterest pin generator — renders HTML templates to 1000×1500 PNG via Puppeteer.
//
// Usage:
//   node scripts/generate-pins.mjs              — show status of all pins
//   node scripts/generate-pins.mjs --render     — render all pending pins to PNG
//   node scripts/generate-pins.mjs --render <pinId>  — render a single pin
//   node scripts/generate-pins.mjs --render-all — re-render every pin (overwrite)

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT      = join(__dirname, '..');
const MANIFEST  = join(ROOT, 'pins', 'manifest.json');
const IMAGES    = join(ROOT, 'pins', 'images');

const WIDTH    = 1000;
const MIN_H    = 1000;  // minimum pin height (1:1)
const MAX_H    = 1500;  // cap at 2:3

// ── Manifest helpers ────────────────────────────────────────────────────────

function loadManifest() {
  if (!existsSync(MANIFEST)) return {};
  return JSON.parse(readFileSync(MANIFEST, 'utf-8'));
}

function saveManifest(manifest) {
  mkdirSync(dirname(MANIFEST), { recursive: true });
  writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
}

// ── Load pin data ───────────────────────────────────────────────────────────

async function loadPinData() {
  const { PIN_DATA } = await import(pathToFileURL(join(ROOT, 'src', 'content', 'pin-data.js')).href);
  const { ARTICLES } = await import(pathToFileURL(join(ROOT, 'src', 'content', 'articles.js')).href);
  return { PIN_DATA, ARTICLES };
}

// ── Find local Chrome ───────────────────────────────────────────────────────

function findChrome() {
  // Check env var first
  if (process.env.CHROME_PATH && existsSync(process.env.CHROME_PATH)) {
    return process.env.CHROME_PATH;
  }
  const candidates = [
    // Windows
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    process.env.LOCALAPPDATA && `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
    // macOS
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    // Linux
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
  ].filter(Boolean);
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  return null;
}

// ── Brand constants ─────────────────────────────────────────────────────────

const BRAND = {
  bg:      '#1a1714',
  card:    '#22201c',
  text:    '#e8e0d4',
  mid:     '#a09890',
  gold:    '#c9a96e',
  accent:  '#e05858',
  bdr:     '#3a3530',
};

// ── HTML builders per pin type ──────────────────────────────────────────────

function baseHTML(title, innerContent) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,600&display=swap" rel="stylesheet">
<style>

  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: ${WIDTH}px;
    background: ${BRAND.bg};
    color: ${BRAND.text};
    font-family: 'IBM Plex Mono', monospace;
  }
  .pin {
    padding: 60px 56px;
  }
  .pin-logo {
    font-family: 'Fraunces', serif;
    font-size: 18px;
    font-weight: 300;
    color: ${BRAND.mid};
    letter-spacing: 4px;
    text-transform: uppercase;
    margin-bottom: 8px;
  }
  .pin-divider {
    width: 48px;
    height: 2px;
    background: ${BRAND.gold};
    margin-bottom: 40px;
  }
  .pin-title {
    font-family: 'Fraunces', serif;
    font-size: 48px;
    font-weight: 300;
    line-height: 1.2;
    color: ${BRAND.text};
    margin-bottom: 40px;
  }
  .pin-content {
    margin-bottom: 48px;
  }
  .pin-footer {
    padding-top: 32px;
    border-top: 1px solid ${BRAND.bdr};
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .pin-footer-url {
    font-size: 14px;
    color: ${BRAND.mid};
    letter-spacing: 2px;
  }
  .pin-footer-tagline {
    font-size: 12px;
    color: ${BRAND.gold};
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  /* comparison-table */
  .cmp-table { width: 100%; border-collapse: collapse; }
  .cmp-table th {
    font-size: 18px;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
    padding: 20px 14px;
    text-align: left;
    border-bottom: 2px solid ${BRAND.gold};
  }
  .cmp-table th.cmp-better { color: ${BRAND.gold}; }
  .cmp-table th.cmp-other { color: ${BRAND.mid}; }
  .cmp-table td {
    font-size: 20px;
    padding: 24px 14px;
    border-bottom: 1px solid ${BRAND.bdr};
    line-height: 1.5;
    vertical-align: top;
  }
  .cmp-table td.cmp-better-cell { color: ${BRAND.text}; }
  .cmp-table td.cmp-other-cell { color: ${BRAND.mid}; }
  .cmp-table tr:last-child td { border-bottom: none; }

  /* checklist */
  .chk-list { list-style: none; }
  .chk-item {
    display: flex;
    align-items: flex-start;
    gap: 18px;
    padding: 20px 0;
    border-bottom: 1px solid ${BRAND.bdr};
    font-size: 22px;
    line-height: 1.45;
  }
  .chk-item:last-child { border-bottom: none; }
  .chk-box {
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    border: 2px solid ${BRAND.gold};
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 2px;
  }
  .chk-check {
    color: ${BRAND.gold};
    font-size: 20px;
    font-weight: 700;
  }

  /* how-to */
  .howto-steps { display: flex; flex-direction: column; gap: 0; }
  .howto-step {
    display: flex;
    gap: 20px;
    align-items: flex-start;
  }
  .howto-track {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-shrink: 0;
    width: 52px;
  }
  .howto-num {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: ${BRAND.gold};
    color: ${BRAND.bg};
    font-size: 24px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .howto-line {
    width: 2px;
    flex: 1;
    min-height: 20px;
    background: ${BRAND.bdr};
  }
  .howto-text {
    font-size: 22px;
    line-height: 1.45;
    padding: 12px 0 32px;
    color: ${BRAND.text};
  }
  .howto-step:last-child .howto-line { display: none; }
  .howto-step:last-child .howto-text { padding-bottom: 0; }

  /* product-feature */
  .feat-list { display: flex; flex-direction: column; gap: 0; }
  .feat-item {
    display: flex;
    gap: 18px;
    align-items: flex-start;
    padding: 18px 0;
    border-bottom: 1px solid ${BRAND.bdr};
    font-size: 22px;
    line-height: 1.45;
  }
  .feat-item:last-child { border-bottom: none; }
  .feat-bullet {
    flex-shrink: 0;
    color: ${BRAND.gold};
    font-size: 24px;
    margin-top: -1px;
  }

  /* infographic */
  .info-sections { display: flex; flex-direction: column; gap: 0; }
  .info-section {
    display: flex;
    gap: 20px;
    align-items: flex-start;
  }
  .info-track {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-shrink: 0;
    width: 18px;
  }
  .info-dot {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: ${BRAND.gold};
    flex-shrink: 0;
    margin-top: 5px;
  }
  .info-connector {
    width: 2px;
    flex: 1;
    min-height: 16px;
    background: ${BRAND.bdr};
  }
  .info-body { padding: 0 0 32px; }
  .info-heading {
    font-size: 23px;
    font-weight: 600;
    color: ${BRAND.gold};
    margin-bottom: 8px;
  }
  .info-detail {
    font-size: 20px;
    color: ${BRAND.mid};
    line-height: 1.5;
  }
  .info-section:last-child .info-connector { display: none; }
  .info-section:last-child .info-body { padding-bottom: 0; }
</style>
</head>
<body>
<div class="pin">
  <div class="pin-logo">People's Patterns</div>
  <div class="pin-divider"></div>
  <h1 class="pin-title">${esc(title)}</h1>
  <div class="pin-content">
    ${innerContent}
  </div>
  <div class="pin-footer">
    <span class="pin-footer-url">peoplespatterns.com</span>
    <span class="pin-footer-tagline">made-to-measure sewing patterns</span>
  </div>
</div>
</body>
</html>`;
}

function esc(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function buildComparisonTable(pin) {
  const has3 = !!pin.tableData.columnC;
  const headers = has3
    ? `<tr><th class="cmp-other">${esc(pin.tableData.columnA)}</th><th class="cmp-better">${esc(pin.tableData.columnB)}</th><th class="cmp-other">${esc(pin.tableData.columnC)}</th></tr>`
    : `<tr><th class="cmp-other">${esc(pin.tableData.columnA)}</th><th class="cmp-better">${esc(pin.tableData.columnB)}</th></tr>`;

  const rows = pin.tableData.rows.map(r => {
    if (has3) {
      return `<tr><td class="cmp-other-cell">${esc(r[0])}</td><td class="cmp-better-cell">${esc(r[1])}</td><td class="cmp-other-cell">${esc(r[2])}</td></tr>`;
    }
    return `<tr><td class="cmp-other-cell">${esc(r[0])}</td><td class="cmp-better-cell">${esc(r[1])}</td></tr>`;
  }).join('');

  return `<table class="cmp-table"><thead>${headers}</thead><tbody>${rows}</tbody></table>`;
}

function buildChecklist(pin) {
  const items = pin.listItems.map(item =>
    `<li class="chk-item"><span class="chk-box"><span class="chk-check">&#10003;</span></span><span>${esc(item)}</span></li>`
  ).join('');
  return `<ul class="chk-list">${items}</ul>`;
}

function buildHowTo(pin) {
  const steps = pin.steps.map((s, i) =>
    `<div class="howto-step">
      <div class="howto-track"><div class="howto-num">${i + 1}</div><div class="howto-line"></div></div>
      <div class="howto-text">${esc(s)}</div>
    </div>`
  ).join('');
  return `<div class="howto-steps">${steps}</div>`;
}

function buildProductFeature(pin) {
  const items = pin.features.map(f =>
    `<div class="feat-item"><span class="feat-bullet">&#9670;</span><span>${esc(f)}</span></div>`
  ).join('');
  return `<div class="feat-list">${items}</div>`;
}

function buildInfographic(pin) {
  const sections = pin.sections.map(s =>
    `<div class="info-section">
      <div class="info-track"><div class="info-dot"></div><div class="info-connector"></div></div>
      <div class="info-body">
        <div class="info-heading">${esc(s.heading)}</div>
        <div class="info-detail">${esc(s.detail)}</div>
      </div>
    </div>`
  ).join('');
  return `<div class="info-sections">${sections}</div>`;
}

export function buildPinHTML(pin) {
  let inner;
  switch (pin.type) {
    case 'comparison-table': inner = buildComparisonTable(pin); break;
    case 'checklist':        inner = buildChecklist(pin); break;
    case 'how-to':           inner = buildHowTo(pin); break;
    case 'product-feature':  inner = buildProductFeature(pin); break;
    case 'infographic':      inner = buildInfographic(pin); break;
    default: inner = `<p>Unknown type: ${pin.type}</p>`;
  }
  return baseHTML(pin.title, inner);
}

// ── Render to PNG ───────────────────────────────────────────────────────────

async function renderPins(pins, manifest) {
  const chromePath = findChrome();
  if (!chromePath) {
    console.error('Could not find Chrome or Chromium on your system.');
    console.error('Install Google Chrome, or set CHROME_PATH env var.');
    process.exit(1);
  }

  const puppeteer = (await import('puppeteer-core')).default;
  const browser = await puppeteer.launch({
    executablePath: process.env.CHROME_PATH || chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  mkdirSync(IMAGES, { recursive: true });

  const page = await browser.newPage();

  for (const pin of pins) {
    const html = buildPinHTML(pin);

    // First pass: measure content height
    await page.setViewport({ width: WIDTH, height: MAX_H, deviceScaleFactor: 2 });
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    // Wait for fonts: up to 10s, then proceed anyway
    await page.evaluate(() => Promise.race([
      document.fonts.ready,
      new Promise(r => setTimeout(r, 10000)),
    ]));

    const contentH = await page.evaluate(() => document.querySelector('.pin').scrollHeight);
    const pinH = Math.min(MAX_H, Math.max(MIN_H, contentH));

    // Second pass: screenshot at exact height (fonts cached now)
    await page.setViewport({ width: WIDTH, height: pinH, deviceScaleFactor: 2 });
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => Promise.race([
      document.fonts.ready,
      new Promise(r => setTimeout(r, 5000)),
    ]));

    const outPath = join(IMAGES, `${pin.id}.png`);
    await page.screenshot({ path: outPath, type: 'png', clip: { x: 0, y: 0, width: WIDTH, height: pinH } });

    manifest[pin.id] = {
      ...manifest[pin.id],
      localPath:   `pins/images/${pin.id}.png`,
      generatedAt: new Date().toISOString(),
      exportedAt:  new Date().toISOString(),
    };
    console.log(`  [ok] ${pin.id} → ${outPath}`);
  }

  await browser.close();
  return manifest;
}

// ── CLI ─────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const { PIN_DATA, ARTICLES } = await loadPinData();
  let manifest = loadManifest();

  const articleMap = Object.fromEntries(ARTICLES.map(a => [a.slug, a]));

  const allPins = PIN_DATA.flatMap(entry =>
    entry.pins.map(pin => ({
      ...pin,
      articleSlug: entry.articleSlug,
      article:     articleMap[entry.articleSlug],
    }))
  );

  if (args[0] === '--render' || args[0] === '--render-all') {
    const renderAll = args[0] === '--render-all';
    const targetId  = args[1]; // optional single pin ID

    let toRender;
    if (targetId) {
      toRender = allPins.filter(p => p.id === targetId);
      if (toRender.length === 0) {
        console.error(`Pin not found: ${targetId}`);
        process.exit(1);
      }
    } else if (renderAll) {
      toRender = allPins;
    } else {
      toRender = allPins.filter(p => !manifest[p.id]?.generatedAt);
    }

    if (toRender.length === 0) {
      console.log('All pins already rendered. Use --render-all to re-render.');
      return;
    }

    console.log(`\nRendering ${toRender.length} pin(s) to PNG...\n`);
    manifest = await renderPins(toRender, manifest);
    saveManifest(manifest);
    console.log(`\nDone. ${toRender.length} pin(s) saved to pins/images/`);
    console.log('Manifest updated.');
    return;
  }

  // Default: status
  console.log('\nPinterest Pin Generation Status\n');
  console.log(`Total pins: ${allPins.length}`);

  const generated = allPins.filter(p => manifest[p.id]?.generatedAt).length;
  const uploaded  = allPins.filter(p => manifest[p.id]?.imageUrl).length;

  console.log(`Rendered:   ${generated}/${allPins.length}`);
  console.log(`Uploaded:   ${uploaded}/${allPins.length}`);
  console.log();

  for (const pin of allPins) {
    const m = manifest[pin.id] || {};
    const status = m.imageUrl ? 'uploaded' : m.generatedAt ? 'rendered' : 'pending';
    console.log(`  [${status.padEnd(9)}] ${pin.id} — ${pin.title.slice(0, 50)}`);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
