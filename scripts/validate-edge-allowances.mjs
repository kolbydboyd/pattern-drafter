#!/usr/bin/env node
/**
 * Validates that every piece's edgeAllowances array matches the polygon
 * vertex count after sanitizePoly runs (mirroring what app.js does at
 * runtime). A mismatch causes SA labels to be silently truncated.
 *
 * Only reports pieces where sanitizePoly does NOT change the polygon length
 * (because when the length changes, app.js already nulls edgeAllowances).
 */

import GARMENTS from '../src/garments/index.js';
import { sanitizePoly } from '../src/engine/geometry.js';

// Sensible defaults covering every measurement ID used across all garments.
const FALLBACK_M = {
  waist: 30, hip: 38, bust: 38, chest: 38,
  rise: 10, thigh: 22, inseam: 30,
  shoulder: 16, neck: 15, sleeveLength: 25, bicep: 13, wrist: 7,
  torsoLength: 26, skirtLength: 24, fullLength: 40,
  bagLen: 20, bagHeight: 12, bagDepth: 8,
  bagWidth: 14, strapWidth: 1.5, strapLength: 24,
  pouchWidth: 8, pouchHeight: 5,
};

function buildM(g) {
  const m = { ...FALLBACK_M, ...(g.measurementDefaults || {}) };
  for (const id of (g.measurements || [])) {
    if (!(id in m)) m[id] = 10;
  }
  return m;
}

function buildOpts(g) {
  const opts = {};
  for (const [key, opt] of Object.entries(g.options || {})) {
    opts[key] = opt.default ?? opt.values?.[0]?.value;
  }
  return opts;
}

const errors = [];
const seen = new Set();

for (const [id, g] of Object.entries(GARMENTS)) {
  // Variants share pieces() with the base garment — skip duplicates.
  const baseId = g._baseId || id;
  if (seen.has(baseId)) continue;
  seen.add(baseId);

  let pieces;
  try {
    pieces = g.pieces(buildM(g), buildOpts(g));
  } catch (err) {
    errors.push(`${id}: pieces() threw — ${err.message}`);
    continue;
  }

  for (const p of pieces) {
    if (!p.polygon || !p.edgeAllowances) continue;
    if (p.type === 'panel') continue;

    const sanitized = sanitizePoly(p.polygon);

    // When sanitizePoly changes the vertex count, app.js nulls edgeAllowances
    // automatically, so there is no runtime problem — skip those cases.
    if (sanitized.length !== p.polygon.length) continue;

    if (p.edgeAllowances.length !== sanitized.length) {
      errors.push(
        `${id} / ${p.id ?? p.name ?? '?'}: ` +
        `edgeAllowances has ${p.edgeAllowances.length} entries ` +
        `but polygon has ${sanitized.length} vertices`
      );
    }
  }
}

if (errors.length) {
  console.error('\nedge-allowance mismatch:\n');
  for (const e of errors) console.error('  ' + e);
  console.error(`\n${errors.length} error(s). Fix the edgeAllowances arrays in the garment modules.\n`);
  process.exit(1);
}

console.log(`edge-allowances OK (${seen.size} garments checked)`);
