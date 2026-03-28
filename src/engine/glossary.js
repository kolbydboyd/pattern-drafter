// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Sewing glossary — maps short term codes to human-readable definitions.
 * Terms are referenced in instruction text as {TERM} and expanded by
 * the instruction renderer into hover tooltips.
 */

export const GLOSSARY = {
  RST:         'Right sides together — good sides of fabric facing each other',
  WST:         'Wrong sides together — inside faces touching',
  SA:          'Seam allowance — extra fabric beyond the stitch line reserved for the seam',
  topstitch:   'Visible stitch on the outside of the garment, usually decorative or structural',
  understitch: 'Stitch the seam allowance to the facing close to the seam so it rolls inward and stays hidden',
  baste:       'Temporary long stitch to hold pieces in place before permanent sewing',
  'bar tack':  'Tight zigzag reinforcement stitch at stress points like pocket corners',
  press:       'Press with iron — press straight down and lift, don\'t slide. Never use a back-and-forth motion or you\'ll distort the fabric',
  clip:        'Cut small snips into the seam allowance on curves so the seam lies flat when turned — don\'t cut through the stitching',
  grade:       'Trim each layer of seam allowance to a different width to reduce bulk at seam intersections',
  ease:        'Distributing extra fabric length evenly without creating gathers — used when joining pieces of slightly different lengths',
  bodkin:      'Large blunt needle or safety pin used to thread elastic or cord through a casing',
  selvage:     'The finished woven edge of fabric that won\'t fray — run parallel to the grainline',
  bias:        '45-degree angle to the fabric grain — fabric stretches most on the bias',
  grainline:   'Direction of the fabric threads — pattern pieces must align with this for correct drape and stretch',
  serge:       'Overlock stitch that trims and encases the raw edge simultaneously — prevents fraying',
  notch:       'Small triangle or clip mark on the pattern edge used to align matching seams accurately',
  staystitch:  'Single line of stitching just inside the seam allowance on curved edges to prevent stretching before assembly',
};

/**
 * Expand {term} markers in instruction text into HTML tooltip spans.
 * Each matched term becomes: <span class="gloss-term" data-def="...">TERM</span>
 *
 * @param {string} text - raw instruction text possibly containing {term} markers
 * @returns {string} HTML string with tooltips injected
 */
export function expandGlossary(text) {
  if (!text) return text;
  return text.replace(/\{([^}]+)\}/g, (_, term) => {
    const def = GLOSSARY[term];
    if (!def) return term; // unknown term — render plain
    const safeDef = def.replace(/"/g, '&quot;');
    return `<span class="gloss-term" data-def="${safeDef}">${term}</span>`;
  });
}
