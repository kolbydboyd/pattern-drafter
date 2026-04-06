#!/usr/bin/env node
// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Etsy Listing Data Generator -- produces titles, descriptions, and tags
 * for each garment's Etsy listing.
 *
 * Usage:
 *   node scripts/etsy-listing.mjs <garment-id>
 *   node scripts/etsy-listing.mjs --all
 *   node scripts/etsy-listing.mjs <garment-id> --json   (machine-readable output)
 *
 * Output: prints to stdout or writes to etsy-output/<garment-id>/listing.json
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

const GARMENTS = (await import(pathToFileURL(join(ROOT, 'src', 'garments', 'index.js')).href)).default;

// ── Measurement display names ────────────────────────────────────────────────
const MEAS_LABELS = {
  chest: 'chest', waist: 'waist', hip: 'hip', shoulder: 'shoulder width',
  neck: 'neck circumference', sleeveLength: 'sleeve length', bicep: 'bicep',
  torsoLength: 'torso length', rise: 'rise', thigh: 'thigh', inseam: 'inseam',
  skirtLength: 'desired length', outseam: 'outseam', knee: 'knee',
  bustCircumference: 'bust', underbust: 'underbust',
  shoulderToWaist: 'shoulder to waist', fullLength: 'full length',
};

// ── Difficulty labels ────────────────────────────────────────────────────────
const DIFF_LABELS = { beginner: 'Beginner Friendly', intermediate: 'Intermediate', advanced: 'Advanced' };

/**
 * Clean garment name for display (remove W/M suffixes).
 */
function displayName(garment) {
  return garment.name.replace(/\s*\([WM]\)\s*$/, '');
}

/**
 * Generate Etsy listing title (max ~140 chars, front-loaded with keywords).
 */
function generateTitle(garment) {
  const name = displayName(garment);
  const diff = garment.difficulty === 'beginner' ? ' Beginner Friendly' : '';
  return `${name} Sewing Pattern - Custom Fit PDF - Made to Your Measurements -${diff} Instant Download`;
}

/**
 * Generate Etsy listing description.
 */
function generateDescription(garment) {
  const name = displayName(garment);
  const opts = garment.options || {};
  const measurements = (garment.measurements || []).map(m => MEAS_LABELS[m] || m);
  const diff = DIFF_LABELS[garment.difficulty] || 'Intermediate';

  // Count customization options
  const customOpts = Object.entries(opts).filter(([k]) =>
    !['sa', 'hem', 'frontExt', 'backExt', 'cbRaise', 'riseOverride'].includes(k)
  );
  let combos = 1;
  for (const [, opt] of customOpts) {
    if (opt.values) combos *= opt.values.length;
  }

  // Option descriptions
  const optLines = customOpts.map(([, opt]) => {
    const vals = (opt.values || []).map(v => v.label).join(', ');
    return `${opt.label}: ${vals}`;
  });

  return `${name} - Custom Fit PDF Sewing Pattern

Not a standard size chart pattern. This ${name.toLowerCase()} pattern is drafted from YOUR body measurements for a custom fit - no grading, no "between sizes," just your numbers.

SKILL LEVEL: ${diff}

WHAT YOU GET:
- PDF sewing pattern drafted to your exact measurements
- Step-by-step construction instructions
- Full materials list with fabric recommendations
- Seam allowances included on all pieces
- Notch marks, grainlines, and fold indicators
- Print at home on Letter or A4 paper
- Instant download after purchase

MEASUREMENTS NEEDED (just ${measurements.length}):
${measurements.map(m => `- ${m}`).join('\n')}

CUSTOMIZATION OPTIONS (${combos}+ combinations):
${optLines.map(l => `- ${l}`).join('\n')}

HOW IT WORKS:
1. Enter your measurements at peoplespatterns.com
2. Choose your options (${customOpts.map(([, o]) => o.label?.toLowerCase()).join(', ')})
3. Your custom pattern is generated instantly
4. Download your PDF and print at home

WHY CUSTOM FIT?
Standard patterns assume your proportions match a size chart. If you've ever had a pattern gap at the waist, pull at the hip, or need adjustments every time - custom fit is the answer. Enter your measurements once and get a pattern drafted for YOUR body.

ABOUT PEOPLE'S PATTERNS:
Made-to-measure sewing patterns. Enter your measurements, pick your garment, print your pattern. Custom fit for everyone.

peoplespatterns.com
@peoplespatterns on all platforms

---
This is a digital PDF pattern - no physical product will be shipped.
Pattern is for personal use only. Commercial use requires a professional license.`;
}

/**
 * Generate Etsy tags (max 13, each max 20 chars).
 */
function generateTags(garment) {
  const name = displayName(garment).toLowerCase();
  const cat = garment.category;

  // Base tags every listing should have
  const tags = [
    'sewing pattern',
    'pdf pattern',
    'custom fit',
    'made to measure',
  ];

  // Category-specific tags
  if (cat === 'upper') tags.push('top pattern', 'shirt pattern');
  if (cat === 'lower') tags.push('pants pattern', 'bottom pattern');
  if (cat === 'dress') tags.push('dress pattern');

  // Garment-specific tags
  const nameWords = name.toLowerCase().split(/\s+/);
  const shortName = nameWords.slice(0, 2).join(' ');
  if (shortName.length <= 20) tags.push(shortName);

  // Difficulty tag
  if (garment.difficulty === 'beginner') tags.push('beginner sewing');

  // General sewing tags
  tags.push('instant download', 'digital pattern', 'diy sewing');

  // Feature-specific
  const opts = garment.options || {};
  if (opts.pockets) tags.push('pockets');

  // Womenswear/menswear
  if (garment.id.endsWith('-w')) tags.push('womens pattern');
  else if (['tee', 'cargo-shorts', 'gym-shorts', 'chinos', 'hoodie'].includes(garment.id)) {
    tags.push('unisex pattern');
  }

  // Dedupe and limit to 13 tags, each max 20 chars
  const unique = [...new Set(tags)].filter(t => t.length <= 20).slice(0, 13);
  return unique;
}

/**
 * Generate complete listing data for a garment.
 */
function generateListing(garmentId) {
  const garment = GARMENTS[garmentId];
  if (!garment) throw new Error(`Unknown garment: ${garmentId}`);

  return {
    garmentId,
    title: generateTitle(garment),
    description: generateDescription(garment),
    tags: generateTags(garment),
    price: garment.priceTier === 'simple' ? 9.00 : garment.priceTier === 'core' ? 14.00 : 19.00,
    imageOrder: [
      '01-hero.png',
      '02-differentiator.png',
      '03-flat-sketch.png',
      '04-pieces.png',
      '05-what-you-get.png (Canva)',
      '06-materials.png (Canva)',
      '07-instructions.png (Canva)',
      '08-measurements.png',
      '09-options.png',
      '10-brand.png',
    ],
  };
}

// ── Main ─────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const jsonMode = args.includes('--json');
const filteredArgs = args.filter(a => a !== '--json');

if (!filteredArgs.length) {
  console.log('Etsy Listing Data Generator');
  console.log('==========================');
  console.log('Usage: node scripts/etsy-listing.mjs <garment-id> [--json]');
  console.log('       node scripts/etsy-listing.mjs --all [--json]');
  console.log('\nAvailable garments:');
  for (const [id, g] of Object.entries(GARMENTS)) {
    console.log(`  ${id.padEnd(24)} ${g.name}`);
  }
  process.exit(0);
}

const garmentIds = filteredArgs[0] === '--all'
  ? Object.keys(GARMENTS)
  : [filteredArgs[0]];

for (const id of garmentIds) {
  try {
    const listing = generateListing(id);

    if (jsonMode) {
      const dir = join(ROOT, 'etsy-output', id);
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, 'listing.json'), JSON.stringify(listing, null, 2), 'utf-8');
      console.log(`${id}: listing.json written`);
    } else {
      console.log(`\n${'='.repeat(70)}`);
      console.log(`GARMENT: ${listing.garmentId}`);
      console.log(`PRICE: $${listing.price.toFixed(2)}`);
      console.log(`${'='.repeat(70)}`);
      console.log(`\nTITLE:\n${listing.title}`);
      console.log(`\nTAGS:\n${listing.tags.join(', ')}`);
      console.log(`\nIMAGE ORDER:\n${listing.imageOrder.map((f, i) => `  ${i + 1}. ${f}`).join('\n')}`);
      console.log(`\nDESCRIPTION:\n${listing.description}`);
    }
  } catch (err) {
    console.error(`${id}: ${err.message}`);
  }
}
