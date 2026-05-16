#!/usr/bin/env node
/**
 * Pattern Audit Script — People's Patterns
 * Runs all garments against 5 standard test measurement sets.
 * Reports waistband lengths, hip/bust widths, and flags deviations > 0.5".
 *
 * Usage: node scripts/audit-patterns.mjs
 */

import GARMENTS from '../src/garments/index.js';

// ── Test measurement sets ────────────────────────────────────────────────────
const TEST_SETS = {
  A: { label: 'Standard proportional',
    bust: 36, chest: 36, waist: 28, hip: 38, inseam: 30, shoulder: 15.5, neck: 14,
    sleeveLength: 23.5, bicep: 13, wrist: 6.5, rise: 11, thigh: 22,
    torsoLength: 16.5, skirtLength: 22, outseam: 40, highBust: 34, calf: 14 },
  B: { label: 'Hip-dominant',
    bust: 38, chest: 38, waist: 32, hip: 46, inseam: 29, shoulder: 16, neck: 15,
    sleeveLength: 23, bicep: 14, wrist: 6.5, rise: 12, thigh: 24,
    torsoLength: 16, skirtLength: 22, outseam: 40, highBust: 36, calf: 15 },
  C: { label: 'Petite',
    bust: 33, chest: 33, waist: 25, hip: 35, inseam: 26, shoulder: 14.5, neck: 13,
    sleeveLength: 21, bicep: 11, wrist: 6, rise: 10, thigh: 19,
    torsoLength: 14.5, skirtLength: 19, outseam: 35, highBust: 31, calf: 12 },
  D: { label: 'Plus / full figure',
    bust: 48, chest: 48, waist: 42, hip: 52, inseam: 31, shoulder: 17.5, neck: 17,
    sleeveLength: 24, bicep: 17, wrist: 7.5, rise: 13, thigh: 28,
    torsoLength: 17.5, skirtLength: 23, outseam: 43, highBust: 44, calf: 18 },
  E: { label: 'Tall narrow',
    bust: 34, chest: 34, waist: 26, hip: 36, inseam: 35, shoulder: 15, neck: 13.5,
    sleeveLength: 26, bicep: 12, wrist: 6, rise: 10.5, thigh: 20,
    torsoLength: 18, skirtLength: 24, outseam: 44, highBust: 32, calf: 13 },
};

// ── Expected ease ranges by garment category / piece type ───────────────────
// For waistbands on fitted garments, expected = body_waist + [min, max] ease
const WAISTBAND_EASE_EXPECTED = {
  // structured bands — band matches seam, plus closure extension
  structured:  { min: 0.5, max: 3.5, note: 'waist + wearing_ease + closure_ext' },
  // elastic bands — body waist + comfort ease
  elastic:     { min: 1.5, max: 6.0, note: 'waist + comfort_ease' },
};

// ── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n) {
  if (n == null || isNaN(n)) return 'NaN';
  return n.toFixed(2) + '″';
}

function getDefaults(garment) {
  const d = {};
  for (const [k, opt] of Object.entries(garment.options || {})) {
    if (opt.default != null) d[k] = opt.default;
  }
  if (garment._variantDefaults) Object.assign(d, garment._variantDefaults);
  return d;
}

function getWaistbandPieces(pieces) {
  return pieces.filter(p =>
    p.id && (p.id.includes('waistband') || p.id.includes('waist-band') || p.id === 'wb')
  );
}

function getNeckbandPieces(pieces) {
  return pieces.filter(p =>
    p.id && (p.id.includes('neckband') || p.id.includes('neck-band') || p.id.includes('collar'))
  );
}

function getCuffPieces(pieces) {
  return pieces.filter(p =>
    p.id && (p.id.includes('cuff') || p.id.includes('sleeve-band'))
  );
}

// ── Main audit loop ──────────────────────────────────────────────────────────
const results = [];
const errors  = [];
const flags   = [];

for (const [gid, garment] of Object.entries(GARMENTS)) {
  for (const [setId, mFull] of Object.entries(TEST_SETS)) {
    // Filter measurements to only those required by this garment
    const required = garment.measurements || [];
    const m = {};
    // Start with garment's own measurementDefaults for non-body measurements
    if (garment.measurementDefaults) Object.assign(m, garment.measurementDefaults);
    for (const key of required) {
      if (mFull[key] != null) m[key] = mFull[key];
    }
    // Always include commonly used optional measurements
    for (const key of ['highBust', 'calf', 'seatDepth', 'outseam', 'belly', 'armToElbow', 'waistToArmpit']) {
      if (mFull[key] != null) m[key] = mFull[key];
    }

    // Skip garments whose required measurements are all non-body (e.g. tote-bag uses bagWidth/bagHeight)
    const bodyMeasurementKeys = Object.keys(mFull);
    const hasBodyMeasurements = required.some(k => bodyMeasurementKeys.includes(k));
    if (!hasBodyMeasurements && required.length > 0) continue;

    const opts = getDefaults(garment);
    let pieces;
    try {
      pieces = garment.pieces(m, opts);
    } catch (e) {
      errors.push({ id: gid, set: setId, error: e.message });
      continue;
    }

    const row = {
      id: gid,
      name: garment.name,
      category: garment.category,
      set: setId,
      setLabel: mFull.label,
    };

    // ── Waistband check ──────────────────────────────────────────────────────
    const wbPieces = getWaistbandPieces(pieces);
    if (wbPieces.length > 0) {
      const wb = wbPieces[0];
      const wbLen = wb.dimensions?.length;
      row.waistbandLen = wbLen;
      row.waistInput = m.waist;
      if (wbLen != null && m.waist) {
        const delta = wbLen - m.waist;
        row.waistbandDelta = delta;
        // Flag if waistband < body waist (impossible) or > body waist + 10" (excessive)
        if (delta < 0) {
          row.waistbandFlag = `FAIL: band (${fmt(wbLen)}) shorter than body waist (${fmt(m.waist)})`;
          flags.push({ ...row, issue: row.waistbandFlag });
        } else if (delta > 10) {
          row.waistbandFlag = `FAIL: band delta ${fmt(delta)} exceeds 10″ — likely using hip instead of waist`;
          flags.push({ ...row, issue: row.waistbandFlag });
        } else if (delta > 6) {
          row.waistbandFlag = `WARN: band delta ${fmt(delta)} — check ease amount`;
          flags.push({ ...row, issue: row.waistbandFlag });
        }
      }
    }

    // ── Neckband check ───────────────────────────────────────────────────────
    const nbPieces = getNeckbandPieces(pieces);
    if (nbPieces.length > 0 && m.neck) {
      const nb = nbPieces[0];
      const nbLen = nb.dimensions?.length;
      row.neckbandLen = nbLen;
      row.neckInput = m.neck;
      if (nbLen != null) {
        const ratio = nbLen / m.neck;
        row.neckbandRatio = ratio;
        if (ratio > 1.1) {
          row.neckbandFlag = `WARN: neckband (${fmt(nbLen)}) > 110% of neck (${fmt(m.neck)})`;
          flags.push({ ...row, issue: row.neckbandFlag });
        } else if (ratio < 0.60) {
          row.neckbandFlag = `WARN: neckband (${fmt(nbLen)}) < 60% of neck — may be too short to stretch`;
          flags.push({ ...row, issue: row.neckbandFlag });
        }
      }
    }

    // ── Cuff check ───────────────────────────────────────────────────────────
    const cuffPieces = getCuffPieces(pieces);
    if (cuffPieces.length > 0 && m.wrist) {
      const cuff = cuffPieces[0];
      const cuffLen = cuff.dimensions?.length;
      row.cuffLen = cuffLen;
      if (cuffLen != null && cuffLen < m.wrist * 0.5) {
        row.cuffFlag = `WARN: cuff (${fmt(cuffLen)}) is < 50% of wrist — check sizing`;
        flags.push({ ...row, issue: row.cuffFlag });
      }
    }

    results.push(row);
  }
}

// ── Output ───────────────────────────────────────────────────────────────────
console.log('\n══════════════════════════════════════════════════════════════════');
console.log('  PEOPLE\'S PATTERNS — FULL AUDIT REPORT');
console.log('══════════════════════════════════════════════════════════════════\n');

// Summary counts
const garmentsAudited = new Set(results.map(r => r.id)).size;
const totalRuns = results.length;
const errorCount = errors.length;
const flagCount  = flags.length;

console.log(`Garments audited: ${garmentsAudited}`);
console.log(`Total pattern×set runs: ${totalRuns}`);
console.log(`Drafting errors (threw): ${errorCount}`);
console.log(`Flags (fail/warn): ${flagCount}\n`);

// ── Errors ──
if (errors.length > 0) {
  console.log('── DRAFTING ERRORS (threw exception) ──────────────────────────────');
  for (const e of errors) {
    console.log(`  [${e.set}] ${e.id}: ${e.error}`);
  }
  console.log('');
}

// ── Flagged issues ──
if (flags.length > 0) {
  console.log('── FLAGGED ISSUES ──────────────────────────────────────────────────');
  const seen = new Set();
  for (const f of flags) {
    const key = `${f.id}|${f.issue}`;
    if (seen.has(key)) continue; // deduplicate same issue across test sets
    seen.add(key);
    console.log(`  ${f.id} [${f.set}]: ${f.issue}`);
  }
  console.log('');
}

// ── Per-garment waistband table ──
console.log('── WAISTBAND LENGTH TABLE (Test Set A — waist=28″, hip=38″) ────────');
console.log(
  'Garment'.padEnd(35) +
  'WB Length'.padStart(10) +
  'Body Waist'.padStart(12) +
  'Delta'.padStart(8) +
  '  Status'
);
console.log('─'.repeat(80));

const setAResults = results.filter(r => r.set === 'A' && r.waistbandLen != null);
setAResults.sort((a, b) => (b.waistbandDelta || 0) - (a.waistbandDelta || 0));

for (const r of setAResults) {
  const status = r.waistbandFlag ? r.waistbandFlag.split(':')[0] : 'OK';
  console.log(
    r.id.padEnd(35) +
    fmt(r.waistbandLen).padStart(10) +
    fmt(r.waistInput).padStart(12) +
    fmt(r.waistbandDelta).padStart(8) +
    '  ' + status
  );
}

// ── Per-garment neckband table ──
console.log('\n── NECKBAND LENGTH TABLE (Test Set A — neck=14″) ───────────────────');
console.log(
  'Garment'.padEnd(35) +
  'NB Length'.padStart(10) +
  'Neck Input'.padStart(12) +
  'Ratio'.padStart(8) +
  '  Status'
);
console.log('─'.repeat(80));

const setANeck = results.filter(r => r.set === 'A' && r.neckbandLen != null);
for (const r of setANeck) {
  const status = r.neckbandFlag ? r.neckbandFlag.split(':')[0] : 'OK';
  const ratio = r.neckbandRatio != null ? r.neckbandRatio.toFixed(3) : 'n/a';
  console.log(
    r.id.padEnd(35) +
    fmt(r.neckbandLen).padStart(10) +
    fmt(r.neckInput).padStart(12) +
    ratio.padStart(8) +
    '  ' + status
  );
}

// ── Multi-set waistband summary for flagged garments ──
const flaggedIds = [...new Set(flags.filter(f => f.waistbandFlag).map(f => f.id))];
if (flaggedIds.length > 0) {
  console.log('\n── FLAGGED GARMENTS — ALL TEST SETS ──────────────────────────────────');
  for (const gid of flaggedIds) {
    console.log(`\n  ${gid}:`);
    const rows = results.filter(r => r.id === gid && r.waistbandLen != null);
    for (const r of rows) {
      const m = TEST_SETS[r.set];
      console.log(`    [${r.set}] waist=${m.waist}″  band=${fmt(r.waistbandLen)}  delta=${fmt(r.waistbandDelta)}  ${r.waistbandFlag || 'OK'}`);
    }
  }
}

console.log('\n══════════════════════════════════════════════════════════════════\n');

// Machine-readable output
const report = { timestamp: new Date().toISOString(), garmentsAudited, totalRuns, errorCount, flagCount, errors, flags: [...new Set(flags.map(f => JSON.stringify({id:f.id, set:f.set, issue:f.issue}))).values()].map(s => JSON.parse(s)) };
process.stdout.write('\n--- JSON REPORT ---\n');
process.stdout.write(JSON.stringify(report, null, 2) + '\n');
