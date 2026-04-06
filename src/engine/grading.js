// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Standard size grading for Etsy/marketplace pattern listings.
 *
 * Runs the pattern engine with standard body measurements for each size,
 * producing a map of size label -> pieces. These are then layered into
 * a single multi-size PDF.
 *
 * Size charts based on ASTM D5585 (misses) and D6960 (plus) with
 * interpolation for indie-standard size ranges.
 *
 * All measurements in inches.
 */

// ── Women's size chart (XS-3XL, US 0-26) ────────────────────────────────────
// Based on ASTM D5585 (misses 00-20) + D6960 (plus 14W-40W), interpolated
// to create a continuous XS-3XL range used by most indie pattern companies.

export const WOMENS_SIZES = [
  { label: 'XS',  us: '0-2',   bust: 32,   waist: 25,   hip: 35,   shoulder: 14.5, neck: 13.5, bicep: 10.5, wrist: 6,    sleeveLength: 22.5, torsoLength: 16,   rise: 9.5,  thigh: 20,   inseam: 30, skirtLength: 22 },
  { label: 'S',   us: '4-6',   bust: 34.5, waist: 27.5, hip: 37.5, shoulder: 15,   neck: 14,   bicep: 11,   wrist: 6.25, sleeveLength: 23,   torsoLength: 16.5, rise: 10,   thigh: 21.5, inseam: 30, skirtLength: 22 },
  { label: 'M',   us: '8-10',  bust: 37,   waist: 30,   hip: 40,   shoulder: 15.5, neck: 14.5, bicep: 11.75,wrist: 6.5,  sleeveLength: 23.5, torsoLength: 17,   rise: 10.5, thigh: 23,   inseam: 30, skirtLength: 22 },
  { label: 'L',   us: '12-14', bust: 40,   waist: 33,   hip: 43,   shoulder: 16,   neck: 15,   bicep: 12.5, wrist: 6.75, sleeveLength: 23.5, torsoLength: 17.5, rise: 11,   thigh: 24.5, inseam: 30, skirtLength: 22 },
  { label: 'XL',  us: '16-18', bust: 43.5, waist: 36.5, hip: 46.5, shoulder: 16.75,neck: 15.5, bicep: 13.5, wrist: 7,    sleeveLength: 24,   torsoLength: 18,   rise: 11.5, thigh: 26.5, inseam: 30, skirtLength: 22 },
  { label: '2XL', us: '20-22', bust: 47,   waist: 40,   hip: 50,   shoulder: 17.5, neck: 16,   bicep: 14.5, wrist: 7.25, sleeveLength: 24,   torsoLength: 18.5, rise: 12,   thigh: 28.5, inseam: 30, skirtLength: 22 },
  { label: '3XL', us: '24-26', bust: 51,   waist: 44,   hip: 54,   shoulder: 18.25,neck: 16.75,bicep: 15.5, wrist: 7.5,  sleeveLength: 24.5, torsoLength: 19,   rise: 12.5, thigh: 30.5, inseam: 30, skirtLength: 22 },
];

// ── Men's size chart (XS-2XL, US 32-52) ─────────────────────────────────────

export const MENS_SIZES = [
  { label: 'XS',  us: '32',    chest: 34,   waist: 28,   hip: 34,   shoulder: 17,   neck: 14,   bicep: 11.5, wrist: 6.5,  sleeveLength: 24,   torsoLength: 17.5, rise: 10,   thigh: 21,   inseam: 32 },
  { label: 'S',   us: '34-36', chest: 36.5, waist: 30.5, hip: 36.5, shoulder: 17.5, neck: 14.75,bicep: 12.25,wrist: 6.75, sleeveLength: 24.5, torsoLength: 18,   rise: 10.25,thigh: 22,   inseam: 32 },
  { label: 'M',   us: '38-40', chest: 40,   waist: 34,   hip: 40,   shoulder: 18.5, neck: 15.5, bicep: 13,   wrist: 7,    sleeveLength: 25,   torsoLength: 18.5, rise: 10.5, thigh: 23.5, inseam: 32 },
  { label: 'L',   us: '42-44', chest: 44,   waist: 38,   hip: 44,   shoulder: 19.5, neck: 16.5, bicep: 14,   wrist: 7.25, sleeveLength: 25.5, torsoLength: 19,   rise: 11,   thigh: 25,   inseam: 32 },
  { label: 'XL',  us: '46-48', chest: 48,   waist: 42,   hip: 48,   shoulder: 20.5, neck: 17.5, bicep: 15,   wrist: 7.5,  sleeveLength: 25.5, torsoLength: 19.5, rise: 11.5, thigh: 27,   inseam: 32 },
  { label: '2XL', us: '50-52', chest: 52,   waist: 46,   hip: 52,   shoulder: 21.5, neck: 18.5, bicep: 16,   wrist: 7.75, sleeveLength: 26,   torsoLength: 20,   rise: 12,   thigh: 29,   inseam: 32 },
];

// ── Line styles per size (for multi-size overlay rendering) ──────────────────
// Used when multiple layers are visible simultaneously. The primary
// differentiation is toggleable PDF layers; these are a secondary visual aid.

export const SIZE_LINE_STYLES = [
  { dash: '',           label: 'solid'     },  // XS
  { dash: '8,4',        label: 'dashed'    },  // S
  { dash: '2,4',        label: 'dotted'    },  // M
  { dash: '8,3,2,3',    label: 'dash-dot'  },  // L
  { dash: '12,4,2,4',   label: 'long-dash' },  // XL
  { dash: '8,3,2,3,2,3',label: 'dash-2dot' },  // 2XL
  { dash: '4,4',        label: 'short-dash'},   // 3XL
];

/**
 * Determine which size chart to use for a garment.
 *
 * Women's garments (id ends with '-w') use WOMENS_SIZES.
 * All other garments use MENS_SIZES (men's/unisex).
 *
 * @param {string} garmentId - e.g. 'tee', 'a-line-skirt-w'
 * @returns {{ sizes: Array, gender: string }}
 */
export function getSizeChart(garmentId) {
  const isWomens = garmentId.endsWith('-w');
  return {
    sizes: isWomens ? WOMENS_SIZES : MENS_SIZES,
    gender: isWomens ? 'womens' : 'mens',
  };
}

/**
 * Extract the measurements a garment needs from a size chart entry.
 *
 * The garment declares which measurement keys it requires (e.g. ['chest', 'shoulder', ...]).
 * This function picks just those keys from the size row, using the `bust` field
 * for garments that ask for `chest` (women's size charts use bust circumference
 * which maps to the chest measurement in our engine).
 *
 * @param {Object} sizeRow - one entry from WOMENS_SIZES or MENS_SIZES
 * @param {string[]} requiredMeasurements - garment.measurements array
 * @returns {Object} measurements object suitable for garment.pieces(m, opts)
 */
export function extractMeasurements(sizeRow, requiredMeasurements) {
  const m = {};
  for (const key of requiredMeasurements) {
    if (key === 'chest' && sizeRow.bust !== undefined) {
      // Women's charts use 'bust', engine uses 'chest'
      m[key] = sizeRow.bust ?? sizeRow.chest;
    } else {
      m[key] = sizeRow[key];
    }
  }
  return m;
}

/**
 * Run the grading pipeline: generate pattern pieces for every standard size.
 *
 * @param {Object} garment - garment module (from GARMENTS registry)
 * @param {Object} opts - garment options (neckline, fit, etc.)
 * @returns {{ sizeChart: Array, gender: string, gradedPieces: Array<{ size: Object, pieces: Array }> }}
 */
export function gradeGarment(garment, opts = {}) {
  const { sizes, gender } = getSizeChart(garment.id);

  // Apply garment's default options for any unspecified options
  const resolvedOpts = { ...opts };
  if (garment.options) {
    for (const [key, def] of Object.entries(garment.options)) {
      if (resolvedOpts[key] === undefined && def.default !== undefined) {
        resolvedOpts[key] = def.default;
      }
    }
  }

  const gradedPieces = [];

  for (const sizeRow of sizes) {
    const measurements = extractMeasurements(sizeRow, garment.measurements);
    const pieces = garment.pieces(measurements, resolvedOpts);
    gradedPieces.push({
      size: sizeRow,
      measurements,
      pieces,
    });
  }

  return {
    sizeChart: sizes,
    gender,
    gradedPieces,
    garment,
    opts: resolvedOpts,
  };
}

/**
 * Build a size chart table (body measurements) for the cover page.
 * Returns an array of { label, us, ...measurements } for the garment's
 * required measurements only.
 *
 * @param {Object} garment - garment module
 * @param {string} garmentId - garment ID for chart selection
 * @returns {Array<Object>}
 */
export function buildSizeChartTable(garment) {
  const { sizes } = getSizeChart(garment.id);
  return sizes.map(row => {
    const entry = { label: row.label, us: row.us };
    for (const key of garment.measurements) {
      if (key === 'chest' && row.bust !== undefined) {
        entry[key] = row.bust ?? row.chest;
      } else {
        entry[key] = row[key];
      }
    }
    return entry;
  });
}
