/**
 * Materials database and recommendation engine.
 * Each garment module specifies material requirements.
 * This module provides the standard definitions and formatting.
 */

export const FABRIC_TYPES = {
  // Woven
  'cotton-twill':     { name: 'Cotton twill', weight: '8–10 oz/yd²', stretch: false, category: 'woven' },
  'gabardine':        { name: 'Gabardine', weight: '8–10 oz/yd²', stretch: false, category: 'woven' },
  'cotton-canvas':    { name: 'Cotton canvas', weight: '10–12 oz/yd²', stretch: false, category: 'woven' },
  'linen':            { name: 'Linen or linen-cotton', weight: '5–7 oz/yd²', stretch: false, category: 'woven', notes: 'Pre-wash hot — shrinks 3–5%' },
  'chambray':         { name: 'Chambray', weight: '4–6 oz/yd²', stretch: false, category: 'woven' },
  'denim':            { name: 'Denim', weight: '10–14 oz/yd²', stretch: false, category: 'woven' },
  'stretch-denim':    { name: 'Stretch denim (2% spandex)', weight: '10–12 oz/yd²', stretch: true, category: 'woven' },
  'rayon-twill':      { name: 'Rayon or tencel twill', weight: '5–7 oz/yd²', stretch: false, category: 'woven', notes: 'Drapey, good for wide leg' },
  'wool-suiting':     { name: 'Wool or poly suiting', weight: '8–10 oz/yd²', stretch: false, category: 'woven' },
  'nylon-taslan':     { name: 'Nylon taslan', weight: '3–5 oz/yd²', stretch: false, category: 'woven', notes: 'Water resistant, for swim/gym' },

  // Knit
  'jersey':           { name: 'Cotton jersey', weight: '5–7 oz/yd²', stretch: true, category: 'knit' },
  'french-terry':     { name: 'French terry', weight: '8–10 oz/yd²', stretch: true, category: 'knit' },
  'fleece':           { name: 'Cotton or poly fleece', weight: '10–14 oz/yd²', stretch: true, category: 'knit' },
  'sweatshirt-fleece':{ name: 'Sweatshirt fleece', weight: '10–12 oz/yd²', stretch: true, category: 'knit' },
  'rib-knit':         { name: 'Rib knit (for cuffs/collar)', weight: '6–8 oz/yd²', stretch: true, category: 'knit' },
  'supplex':          { name: 'Supplex nylon or poly-spandex', weight: '4–6 oz/yd²', stretch: true, category: 'knit', notes: '4-way stretch, moisture-wicking' },

  // Other
  'mesh':             { name: 'Athletic mesh', weight: '2–3 oz/yd²', stretch: true, category: 'knit', notes: 'For pocket linings, liner' },
};

export const THREAD_TYPES = {
  'poly-all':    { name: 'Polyester all-purpose', weight: '40wt', notes: 'Standard for most garments' },
  'poly-heavy':  { name: 'Polyester heavy-duty', weight: '30wt', notes: 'For denim, canvas, topstitching' },
  'cotton':      { name: 'Cotton thread', weight: '50wt', notes: 'For natural fiber purists' },
  'woolly-nylon':{ name: 'Woolly nylon', weight: 'texturized', notes: 'For serger loopers on knits' },
};

export const NEEDLE_TYPES = {
  'universal-80':   { name: 'Universal 80/12', use: 'Light-medium wovens' },
  'universal-90':   { name: 'Universal 90/14', use: 'Medium wovens (twill, gabardine)' },
  'universal-100':  { name: 'Universal 100/16', use: 'Heavy wovens (denim, canvas)' },
  'ballpoint-80':   { name: 'Ballpoint/Jersey 80/12', use: 'Knits (jersey, french terry)' },
  'ballpoint-90':   { name: 'Ballpoint/Jersey 90/14', use: 'Medium knits (fleece, sweatshirt)' },
  'stretch-75':     { name: 'Stretch 75/11', use: 'Lycra, spandex blends' },
  'denim-100':      { name: 'Denim/Jeans 100/16', use: 'Denim, heavy twill, multiple layers' },
};

export const STITCH_TYPES = {
  'straight-2.5':  { name: 'Straight stitch', length: '2.5mm', width: '0', use: 'Standard seams on wovens' },
  'straight-3':    { name: 'Straight stitch', length: '3.0mm', width: '0', use: 'Topstitching, visible seams' },
  'straight-3.5':  { name: 'Straight stitch', length: '3.5mm', width: '0', use: 'Basting, heavy fabric topstitch' },
  'zigzag-small':  { name: 'Zigzag', length: '2.0mm', width: '1.0mm', use: 'Seam finishing on wovens' },
  'zigzag-med':    { name: 'Zigzag', length: '2.5mm', width: '2.5mm', use: 'Stretch seams, seam finishing' },
  'stretch':       { name: 'Lightning/stretch stitch', length: '2.5mm', width: '1.0mm', use: 'Knit seams (if no serger)' },
  'overlock':      { name: 'Serger/overlock', length: '2.5–3mm', width: '5mm', use: 'Seam + finish in one pass' },
  'coverstitch':   { name: 'Coverstitch', length: '3.0mm', width: 'twin needle', use: 'Knit hems (or use twin needle)' },
  'bartack':       { name: 'Bar tack', length: '0.5mm', width: '3mm', use: 'Stress points: pocket corners, fly' },
};

/**
 * Standard notions that many garments share
 */
export const STANDARD_NOTIONS = {
  'elastic-1.5':       { name: '1.5″ woven elastic', notes: 'Woven, not braided — holds shape better' },
  'elastic-1':         { name: '1″ woven elastic', notes: 'For lighter garments' },
  'elastic-0.75':      { name: '¾″ elastic', notes: 'For casings, waist gathering' },
  'drawstring':        { name: '½–¾″ flat drawstring cord', notes: 'Woven cotton or nylon' },
  'interfacing-med':   { name: 'Medium fusible interfacing', notes: 'Pellon SF101 or similar' },
  'interfacing-heavy': { name: 'Heavy fusible interfacing', notes: 'Pellon 809 Decor-Bond' },
  'webbing-1.5':       { name: '1.5″ nylon webbing', notes: 'Stiff, for internal belt/holster support' },
  'zipper':            { name: 'Zipper', notes: 'Length = rise measurement' },
  'buttons':           { name: 'Buttons', notes: 'Size and count varies by garment' },
  'snaps':             { name: 'Snap fasteners', notes: 'Size 16 or similar' },
  'grommets':          { name: 'Metal grommets/eyelets', notes: '½″ inner diameter' },
  'velcro':            { name: 'Hook & loop tape (Velcro)', notes: '1″ wide' },
};

/**
 * Build a materials spec for a garment
 * @param {Object} config - { fabrics, notions, thread, needle, stitches, notes }
 * @returns {Object} formatted materials object
 */
export function buildMaterialsSpec(config) {
  return {
    fabrics: config.fabrics.map(f =>
      typeof f === 'string' ? { ...FABRIC_TYPES[f] } : f
    ),
    notions: config.notions.map(n =>
      typeof n === 'string'
        ? { ...STANDARD_NOTIONS[n] }
        : typeof n.ref === 'string'
          ? { ...STANDARD_NOTIONS[n.ref], quantity: n.quantity }
          : n
    ),
    thread: typeof config.thread === 'string' ? THREAD_TYPES[config.thread] : config.thread,
    needle: typeof config.needle === 'string' ? NEEDLE_TYPES[config.needle] : config.needle,
    stitches: config.stitches.map(s =>
      typeof s === 'string' ? STITCH_TYPES[s] : s
    ),
    notes: config.notes || [],
  };
}
