#!/usr/bin/env node
// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Etsy Export -- generates SVGs and converts them to PNGs at 2000x2000px
 * for Etsy listing images.
 *
 * Usage:
 *   node scripts/etsy-export.mjs <garment-id>
 *   node scripts/etsy-export.mjs --all
 *   node scripts/etsy-export.mjs <garment-id> --svg-only   (skip PNG conversion)
 *
 * Requires: sharp (already in devDependencies)
 * Output: etsy-output/<garment-id>/*.svg and *.png
 */

import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

// Dynamic imports -- use pathToFileURL for Windows compatibility
const GARMENTS = (await import(pathToFileURL(join(ROOT, 'src', 'garments', 'index.js')).href)).default;
const flatSketch = await import(pathToFileURL(join(ROOT, 'src', 'etsy', 'flat-sketch.js')).href);
const {
  renderFlatSketch, renderPiecesOverview, renderMeasurementGuide,
  renderOptionsGrid, renderDifferentiator, renderBrandSlide,
} = flatSketch;

// ── Median measurements ──────────────────────────────────────────────────────
const MEDIAN = {
  chest: 38, shoulder: 17.5, neck: 15.5, sleeveLength: 25,
  bicep: 12, torsoLength: 26, armToElbow: 14,
  waist: 30, hip: 38, rise: 10.5, thigh: 22, inseam: 32,
  outseam: 42, knee: 15, seatDepth: 10, skirtLength: 26,
  bustCircumference: 37, underbust: 32, shoulderToWaist: 16,
  fullLength: 42,
};

function getDefaultOptions(garment) {
  const opts = {};
  for (const [key, opt] of Object.entries(garment.options || {})) {
    opts[key] = opt.default ?? (opt.values?.[0]?.value);
  }
  return opts;
}

async function svgToPng(svgBuffer, outputPath, size = 2000) {
  const sharp = (await import('sharp')).default;
  await sharp(svgBuffer)
    .resize(size, size)
    .png({ quality: 95 })
    .toFile(outputPath);
}

async function processGarment(garmentId, svgOnly = false) {
  const garment = GARMENTS[garmentId];
  if (!garment) {
    console.error(`Unknown garment: ${garmentId}`);
    return;
  }

  const dir = join(ROOT, 'etsy-output', garmentId);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  console.log(`\n== ${garment.name} (${garmentId}) ==`);

  // Load the hand-crafted garment illustration SVG
  let illustrationSvg = null;
  const ilPath = join(ROOT, 'public', 'garment-illustrations', `${garmentId}.svg`);
  try {
    illustrationSvg = readFileSync(ilPath, 'utf-8');
  } catch {
    console.warn(`  No illustration found at ${ilPath}`);
  }

  const opts = getDefaultOptions(garment);
  let pieces;
  try {
    pieces = garment.pieces(MEDIAN, opts);
  } catch (err) {
    console.error(`  Failed to generate pieces: ${err.message}`);
    return;
  }

  const images = [
    { name: '01-hero',          svg: renderFlatSketch(garment, pieces, { theme: 'dark', showName: true, showBadges: true, illustrationSvg }) },
    { name: '02-differentiator', svg: renderDifferentiator() },
    { name: '03-flat-sketch',   svg: renderFlatSketch(garment, pieces, { theme: 'light', showName: true, showBadges: false, illustrationSvg }) },
    { name: '04-pieces',        svg: renderPiecesOverview(garment, pieces, { theme: 'light' }) },
    { name: '08-measurements',  svg: renderMeasurementGuide(garment, { theme: 'light' }) },
    { name: '09-options',       svg: renderOptionsGrid(garment, { theme: 'light' }) },
    { name: '10-brand',         svg: renderBrandSlide() },
  ];

  for (const img of images) {
    const svgPath = join(dir, `${img.name}.svg`);
    writeFileSync(svgPath, img.svg, 'utf-8');
    console.log(`  ${img.name}.svg`);

    if (!svgOnly) {
      try {
        const pngPath = join(dir, `${img.name}.png`);
        await svgToPng(Buffer.from(img.svg), pngPath);
        console.log(`  ${img.name}.png`);
      } catch (err) {
        console.warn(`  PNG failed (${img.name}): ${err.message}`);
      }
    }
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const svgOnly = args.includes('--svg-only');
const filteredArgs = args.filter(a => a !== '--svg-only');

if (!filteredArgs.length) {
  console.log('Etsy Listing Image Export');
  console.log('========================');
  console.log('Usage: node scripts/etsy-export.mjs <garment-id> [--svg-only]');
  console.log('       node scripts/etsy-export.mjs --all [--svg-only]');
  console.log('\nAvailable garments:');
  for (const id of Object.keys(GARMENTS)) console.log(`  ${id}`);
  process.exit(0);
}

const garmentIds = filteredArgs[0] === '--all'
  ? Object.keys(GARMENTS)
  : [filteredArgs[0]];

for (const id of garmentIds) {
  await processGarment(id, svgOnly);
}

console.log(`\nDone. Output in: etsy-output/`);
