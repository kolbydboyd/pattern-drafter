// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Etsy Listing Image Composer -- generates all code-producible SVGs
 * for a garment's Etsy listing.
 *
 * Usage (Node.js):
 *   node src/etsy/listing-composer.js <garment-id>
 *   node src/etsy/listing-composer.js --all
 *
 * Outputs SVGs to etsy-output/<garment-id>/ directory.
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

import GARMENTS from '../garments/index.js';
import {
  renderFlatSketch,
  renderPiecesOverview,
  renderMeasurementGuide,
  renderOptionsGrid,
  renderDifferentiator,
  renderBrandSlide,
} from './flat-sketch.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..', '..');

// ── Median measurements for representative renders ───────────────────────────
// These produce realistic-looking silhouettes at a "standard" body size.

const MEDIAN_MEASUREMENTS = {
  upper: {
    chest: 38, shoulder: 17.5, neck: 15.5, sleeveLength: 25,
    bicep: 12, torsoLength: 26, armToElbow: 14,
  },
  'upper-w': {
    chest: 36, shoulder: 15.5, neck: 14, sleeveLength: 23,
    bicep: 11, torsoLength: 24, armToElbow: 13,
    bustCircumference: 37, underbust: 32, shoulderToWaist: 16,
  },
  lower: {
    waist: 32, hip: 38, rise: 10.5, thigh: 22, inseam: 32,
    outseam: 42, knee: 15, seatDepth: 10,
  },
  'lower-w': {
    waist: 28, hip: 38, rise: 10, thigh: 22, inseam: 32,
    outseam: 42, skirtLength: 26,
  },
  dress: {
    chest: 36, shoulder: 15.5, neck: 14, sleeveLength: 23,
    bicep: 11, torsoLength: 24, waist: 28, hip: 38,
    bustCircumference: 37, underbust: 32, shoulderToWaist: 16,
    skirtLength: 26, fullLength: 42,
  },
};

/**
 * Get appropriate median measurements for a garment.
 */
function getMeasurements(garment) {
  const isWomenswear = garment.id.endsWith('-w');
  const cat = garment.category;

  let base;
  if (cat === 'dress') base = MEDIAN_MEASUREMENTS.dress;
  else if (cat === 'upper') base = isWomenswear ? MEDIAN_MEASUREMENTS['upper-w'] : MEDIAN_MEASUREMENTS.upper;
  else base = isWomenswear ? MEDIAN_MEASUREMENTS['lower-w'] : MEDIAN_MEASUREMENTS.lower;

  // Merge all measurement pools so garments can find what they need
  return { ...MEDIAN_MEASUREMENTS.upper, ...MEDIAN_MEASUREMENTS.lower, ...MEDIAN_MEASUREMENTS.dress, ...base };
}

/**
 * Get default options for a garment.
 */
function getDefaultOptions(garment) {
  const opts = {};
  for (const [key, opt] of Object.entries(garment.options || {})) {
    opts[key] = opt.default ?? (opt.values?.[0]?.value);
  }
  return opts;
}

/**
 * Generate all listing SVGs for a single garment.
 * Returns an array of { filename, svg, description } objects.
 */
export function generateListingImages(garmentId) {
  const garment = GARMENTS[garmentId];
  if (!garment) throw new Error(`Unknown garment: ${garmentId}`);

  const measurements = getMeasurements(garment);
  const opts = getDefaultOptions(garment);
  const pieces = garment.pieces(measurements, opts);

  const images = [];

  // Image 1: Hero / Thumbnail (dark bg)
  images.push({
    filename: '01-hero.svg',
    description: 'Hero thumbnail - dark bg, garment name, flat sketch, badges',
    svg: renderFlatSketch(garment, pieces, {
      theme: 'dark', showName: true, showBadges: true,
    }),
  });

  // Image 2: Differentiator (universal - same for all garments)
  images.push({
    filename: '02-differentiator.svg',
    description: 'Why custom fit comparison slide',
    svg: renderDifferentiator(),
  });

  // Image 3: Technical flat sketch (light bg, no badges)
  images.push({
    filename: '03-flat-sketch.svg',
    description: 'Clean flat sketch on light background',
    svg: renderFlatSketch(garment, pieces, {
      theme: 'light', showName: true, showBadges: false, showDetails: true,
    }),
  });

  // Image 4: Pattern pieces overview
  images.push({
    filename: '04-pieces.svg',
    description: 'All pattern pieces labeled in grid',
    svg: renderPiecesOverview(garment, pieces, { theme: 'light' }),
  });

  // Image 8: Measurement guide
  images.push({
    filename: '08-measurements.svg',
    description: 'Body measurements needed for this garment',
    svg: renderMeasurementGuide(garment, { theme: 'light' }),
  });

  // Image 9: Options/Variations
  images.push({
    filename: '09-options.svg',
    description: 'Customization options grid',
    svg: renderOptionsGrid(garment, { theme: 'light' }),
  });

  // Image 10: Brand/Trust slide
  images.push({
    filename: '10-brand.svg',
    description: 'Brand closing slide with trust badges',
    svg: renderBrandSlide(),
  });

  return images;
}

// ── CLI entry point ──────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);

  if (!args.length) {
    console.log('Usage: node src/etsy/listing-composer.js <garment-id> [--all]');
    console.log('\nAvailable garments:');
    for (const id of Object.keys(GARMENTS)) console.log(`  ${id}`);
    process.exit(0);
  }

  const garmentIds = args[0] === '--all'
    ? Object.keys(GARMENTS)
    : [args[0]];

  const outDir = join(ROOT, 'etsy-output');

  for (const id of garmentIds) {
    console.log(`\nGenerating listing images for: ${id}`);
    const dir = join(outDir, id);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    try {
      const images = generateListingImages(id);
      for (const img of images) {
        const path = join(dir, img.filename);
        writeFileSync(path, img.svg, 'utf-8');
        console.log(`  ${img.filename} - ${img.description}`);
      }
    } catch (err) {
      console.error(`  ERROR: ${err.message}`);
    }
  }

  console.log(`\nOutput: ${outDir}`);
}

// Run if executed directly
if (process.argv[1] && process.argv[1].includes('listing-composer')) {
  main();
}
