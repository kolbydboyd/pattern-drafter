// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Sewing glossary — maps short term codes to human-readable definitions.
 * Terms are referenced in instruction text as {TERM} and expanded by
 * the instruction renderer into hover tooltips.
 */

export const GLOSSARY = {
  // ── Placement & orientation ──
  RST:           'Right sides together — good sides of fabric facing each other',
  WST:           'Wrong sides together — inside faces touching',
  RS:            'Right side — the "good" or outer-facing side of the fabric',
  WS:            'Wrong side — the inside of the fabric that won\'t be visible when worn',
  CF:            'Center front — the vertical center line of the garment front, often placed on a fold',
  CB:            'Center back — the vertical center line of the garment back, often placed on a fold',
  SA:            'Seam allowance — extra fabric beyond the stitch line reserved for the seam',

  // ── Stitching techniques ──
  topstitch:     'Visible stitch on the outside of the garment, usually decorative or structural',
  edgestitch:    'Topstitch very close to a folded or seamed edge (1–2mm) — keeps facings and edges flat',
  understitch:   'Stitch the seam allowance to the facing close to the seam so it rolls inward and stays hidden',
  slipstitch:    'Nearly invisible hand stitch used to close openings or attach folded edges from the outside — the needle travels inside the fold',
  baste:         'Temporary long stitch to hold pieces in place before permanent sewing',
  'bar tack':    'Tight zigzag reinforcement stitch at stress points like pocket corners',
  zigzag:        'Machine stitch that moves side to side — used for stretch, finishing raw edges, or attaching elastic',
  staystitch:    'Single line of stitching just inside the seam allowance on curved edges to prevent stretching before assembly',

  // ── Seam types ──
  'flat-fell':   'Strong enclosed seam with two visible rows of topstitching — sew, press to one side, trim inner SA, fold outer SA over, topstitch. Used on jeans and outerwear',
  serge:         'Overlock stitch that trims and encases the raw edge simultaneously — prevents fraying',

  // ── Pressing & shaping ──
  press:         'Press with iron — press straight down and lift, don\'t slide. Never use a back-and-forth motion or you\'ll distort the fabric',
  clip:          'Cut small snips into the seam allowance on curves so the seam lies flat when turned — don\'t cut through the stitching',
  grade:         'Trim each layer of seam allowance to a different width to reduce bulk at seam intersections',
  ease:          'Distributing extra fabric length evenly without creating gathers — used when joining pieces of slightly different lengths',
  'point turner': 'Tool used to push out corners cleanly after turning a piece right side out — a chopstick or knitting needle also works',

  // ── Tools & materials ──
  bodkin:        'Large blunt needle or safety pin used to thread elastic or cord through a casing',
  selvage:       'The finished woven edge of fabric that won\'t fray — run parallel to the grainline',
  bias:          '45-degree angle to the fabric grain — fabric stretches most on the bias',
  grainline:     'Direction of the fabric threads — pattern pieces must align with this for correct drape and stretch',
  notch:         'Small triangle or clip mark on the pattern edge used to align matching seams accurately',
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
