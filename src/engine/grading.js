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

// ── Children's size chart (2T–14, ages 2–14) ─────────────────────────────────
// Based on ASTM D4910 (standard children's sizing), industry RTW averages,
// and common indie sewing pattern size charts.
// All measurements in inches (body measurements, not finished garment).

export const CHILDREN_SIZES = [
  { label: '2T',  age: '~2 yrs',      chest: 21,   waist: 20,   hip: 21,   shoulder: 9,    neck: 10,   bicep: 6.5,  sleeveLength: 9,  torsoLength: 10,  rise: 5,   thigh: 12,   inseam: 10, fullLength: 22 },
  { label: '3T',  age: '~3 yrs',      chest: 22,   waist: 20.5, hip: 22,   shoulder: 9.5,  neck: 10.5, bicep: 7,    sleeveLength: 10, torsoLength: 11,  rise: 5.5, thigh: 13,   inseam: 12, fullLength: 24 },
  { label: '4T',  age: '~4 yrs',      chest: 23,   waist: 21,   hip: 23,   shoulder: 10,   neck: 11,   bicep: 7.5,  sleeveLength: 11, torsoLength: 11.5,rise: 6,   thigh: 14,   inseam: 13, fullLength: 26 },
  { label: '5',   age: '~4-5 yrs',    chest: 24,   waist: 21.5, hip: 24,   shoulder: 10.5, neck: 11.5, bicep: 8,    sleeveLength: 12, torsoLength: 12,  rise: 6.5, thigh: 15,   inseam: 14, fullLength: 27 },
  { label: '6',   age: '~5-6 yrs',    chest: 25,   waist: 22,   hip: 25,   shoulder: 11,   neck: 12,   bicep: 8.5,  sleeveLength: 13, torsoLength: 12.5,rise: 7,   thigh: 16,   inseam: 15, fullLength: 28 },
  { label: '7',   age: '~6-7 yrs',    chest: 26,   waist: 22.5, hip: 26,   shoulder: 11.5, neck: 12.5, bicep: 9,    sleeveLength: 14, torsoLength: 13,  rise: 7.5, thigh: 17,   inseam: 16, fullLength: 29 },
  { label: '8',   age: '~7-8 yrs',    chest: 27,   waist: 23,   hip: 27,   shoulder: 12,   neck: 13,   bicep: 9.5,  sleeveLength: 15, torsoLength: 13.5,rise: 8,   thigh: 18,   inseam: 18, fullLength: 30 },
  { label: '10',  age: '~9-10 yrs',   chest: 28.5, waist: 23.5, hip: 28.5, shoulder: 12.5, neck: 13.5, bicep: 10,   sleeveLength: 17, torsoLength: 14,  rise: 8.5, thigh: 19.5, inseam: 20, fullLength: 33 },
  { label: '12',  age: '~11-12 yrs',  chest: 30,   waist: 24.5, hip: 30,   shoulder: 13,   neck: 14,   bicep: 10.5, sleeveLength: 19, torsoLength: 15,  rise: 9,   thigh: 21,   inseam: 22, fullLength: 36 },
  { label: '14',  age: '~13-14 yrs',  chest: 32,   waist: 25.5, hip: 32,   shoulder: 14,   neck: 14.5, bicep: 11,   sleeveLength: 21, torsoLength: 16,  rise: 9.5, thigh: 22.5, inseam: 24, fullLength: 38 },
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
 * Children's garments (id starts with 'kids-') use CHILDREN_SIZES.
 * All other garments use MENS_SIZES (men's/unisex).
 *
 * @param {string} garmentId - e.g. 'tee', 'a-line-skirt-w', 'kids-tee'
 * @returns {{ sizes: Array, gender: string }}
 */
export function getSizeChart(garmentId) {
  if (garmentId.startsWith('kids-')) {
    return { sizes: CHILDREN_SIZES, gender: 'childrens' };
  }
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
  const { sizes, gender } = getSizeChart(garment.id);
  return sizes.map(row => {
    // Children's rows use 'age' instead of 'us'
    const entry = { label: row.label, us: gender === 'childrens' ? row.age : row.us };
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

/**
 * Generate a plain-text README for the Etsy download bundle.
 * Explains what each file is, how to pick a size, and includes
 * the redemption code for a free custom-fit upgrade.
 *
 * @param {Object} garment - garment module
 * @param {Object} gradingResult - output of gradeGarment()
 * @param {string} [redemptionCode] - optional code for custom-fit upgrade
 * @returns {string} Plain text README content
 */
export function generateBundleReadme(garment, gradingResult, redemptionCode) {
  const { sizeChart, gender } = gradingResult;
  const sizes = sizeChart;
  const sizeRange = `${sizes[0].label}-${sizes[sizes.length - 1].label}`;

  // Build size chart as aligned text table
  const measKeys = garment.measurements;
  const headers = ['Size', 'US', ...measKeys];
  const rows = sizes.map(row => {
    const vals = measKeys.map(key => {
      const v = key === 'chest' && row.bust !== undefined ? (row.bust ?? row.chest) : row[key];
      return v !== undefined ? String(v) : '-';
    });
    // Children's rows use 'age' in place of 'us'
    const usVal = row.us !== undefined ? row.us : (row.age ?? '-');
    return [row.label, usVal, ...vals];
  });

  // Pad columns
  const colWidths = headers.map((h, ci) =>
    Math.max(h.length, ...rows.map(r => r[ci].length))
  );
  const pad = (s, w) => s + ' '.repeat(Math.max(0, w - s.length));
  const headerLine = headers.map((h, i) => pad(h, colWidths[i])).join('  ');
  const divider = colWidths.map(w => '-'.repeat(w)).join('  ');
  const tableRows = rows.map(r => r.map((c, i) => pad(c, colWidths[i])).join('  ')).join('\n');

  const redeemSection = redemptionCode ? `
----------------------------------------------------------------------
FREE CUSTOM-FIT UPGRADE
----------------------------------------------------------------------

Want this pattern drafted to YOUR exact body measurements - for free?

1. Visit: https://peoplespatterns.com/redeem
2. Enter code: ${redemptionCode}
3. Create a free account and enter your measurements
4. Download a pattern made just for your body

This code never expires.
` : '';

  return `======================================================================
${garment.name} - Sewing Pattern
Sizes ${sizeRange} (${gender === 'womens' ? "Women's" : gender === 'childrens' ? "Children's" : "Men's/Unisex"})
People's Patterns - peoplespatterns.com
======================================================================


WHAT'S IN THIS DOWNLOAD
----------------------------------------------------------------------

This download contains your pattern in multiple formats so you can
print or project whichever way works best for you.


FOR PRINTING AT HOME (tiled):

  ${garment.name} - All Sizes - Tiled Letter.pdf
    All sizes overlaid on the same pages. Each size uses a different
    line style (solid, dashed, dotted, etc.). Find your size on the
    cover page chart, note the line style, and cut along that line.

  ${garment.name} - Size [XS/S/M/L/XL/2XL/3XL] - Tiled Letter.pdf
    Single-size files - only the lines for that one size. Cleaner to
    read, less paper wasted. Pick your size and print just that file.


FOR PROJECTOR CUTTING:

  ${garment.name} - Size [XS/S/M/L/XL/2XL/3XL] - Projector.pdf
    One file per size, full-scale, no tiling. Open in Pattern Projector
    (free, patternprojector.com) or your preferred projector app.
    Includes 4-inch and 10cm calibration squares.


EVERY FILE INCLUDES:
  - Cover page with measurements and size chart
  - Scale verification squares (2x2 inch + 5x5 cm)
  - Tile assembly map (tiled files only)
  - Materials and fabric guide
  - Step-by-step construction instructions
  - Seam allowances included on all pieces


HOW TO FIND YOUR SIZE
----------------------------------------------------------------------

Measure your body and compare to the chart below. If you're between
sizes, size up - it's easier to take in than let out.

All measurements in inches.

${headerLine}
${divider}
${tableRows}
${redeemSection}

PRINTING TIPS
----------------------------------------------------------------------

- Print at 100% scale. NEVER select "fit to page" or "shrink to fit"
- Verify the scale squares on page 2 before cutting any fabric
- Use plain paper (not glossy) for best cutting accuracy
- Tape tiles from the back after aligning the crosshair marks


NEED HELP?
----------------------------------------------------------------------

Email: hello@peoplespatterns.com
Instagram: @peoplespatterns
Website: peoplespatterns.com

Thank you for supporting indie pattern design!
`;
}
