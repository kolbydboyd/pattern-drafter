// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Materials database and recommendation engine.
 *
 * Provides normalized definitions for fabrics, threads, needles, stitches,
 * and notions. Garment modules reference these by key via buildMaterialsSpec().
 *
 * All fabric weights are in oz/yd². Stretch indicates whether the fabric has
 * meaningful two-way or four-way stretch relevant to pattern ease calculations.
 */

// ── Affiliate configuration ───────────────────────────────────────────────────
// Amazon Associates — general fallback for all product types
const AMAZON_TAG = 'peoplespatter-20';

// FlexOffers — Wawak (pro sewing notions) and Fabric.com (fabric)
// Set these once your FlexOffers applications are approved
const FLEXOFFERS_WAWAK_ID  = ''; // FlexOffers advertiser ID for Wawak
const FLEXOFFERS_FABRIC_ID = ''; // FlexOffers advertiser ID for Fabric.com

// Awin — Mood Fabrics (fashion/designer fabrics)
// Set this once your Mood Fabrics application is approved in Awin
const AWIN_MOOD_ID = ''; // Awin publisher link ID for Mood Fabrics

// Sailrite — heavy-duty sewing supplies (denim needles, heavy thread, snaps, grommets, canvas)
// Set this once your Sailrite affiliate application is approved
const SAILRITE_AFF_ID = ''; // Sailrite affiliate/partner ID

/**
 * Affiliate network URL builders.
 * Each returns a search/product URL with the appropriate tracking tag.
 * Falls back to Amazon if the specialty network isn't configured yet.
 */
const AFFILIATE = {
  /** Amazon product search — general fallback */
  amazon(name, suffix = '') {
    const q = encodeURIComponent((name + (suffix ? ' ' + suffix : '')).replace(/\s+/g, ' ').trim());
    return `https://www.amazon.com/s?k=${q}&tag=${AMAZON_TAG}`;
  },

  /** Wawak — pro sewing notions (interfacing, zippers, buttons, elastic, snaps) */
  wawak(name) {
    if (!FLEXOFFERS_WAWAK_ID) return AFFILIATE.amazon(name, 'sewing');
    const q = encodeURIComponent(name.replace(/\s+/g, ' ').trim());
    return `https://www.wawak.com/search/?q=${q}&foid=${FLEXOFFERS_WAWAK_ID}`;
  },

  /** Fabric.com — fabric by the yard */
  fabricDotCom(name) {
    if (!FLEXOFFERS_FABRIC_ID) return AFFILIATE.amazon(name, 'fabric by the yard');
    const q = encodeURIComponent(name.replace(/\s+/g, ' ').trim());
    return `https://www.fabric.com/find?SearchText=${q}&foid=${FLEXOFFERS_FABRIC_ID}`;
  },

  /** Mood Fabrics — designer/fashion fabrics */
  mood(name) {
    if (!AWIN_MOOD_ID) return AFFILIATE.amazon(name, 'fabric by the yard');
    const q = encodeURIComponent(name.replace(/\s+/g, ' ').trim());
    return `https://www.moodfabrics.com/catalogsearch/result/?q=${q}&awid=${AWIN_MOOD_ID}`;
  },

  /** Sailrite — heavy-duty sewing supplies (canvas, denim, snaps, grommets, heavy thread) */
  sailrite(name) {
    if (!SAILRITE_AFF_ID) return AFFILIATE.amazon(name, 'sewing');
    const q = encodeURIComponent(name.replace(/\s+/g, ' ').trim());
    return `https://www.sailrite.com/search?q=${q}&aid=${SAILRITE_AFF_ID}`;
  },
};

/** Build an affiliate URL — routes to the best network for the product type */
function _affiliateUrl(name, suffix = '') {
  return AFFILIATE.amazon(name, suffix);
}

/** Build an affiliate URL specifically for notions — prefers Wawak when available */
function _notionAffiliateUrl(name) {
  return AFFILIATE.wawak(name);
}

/** Build an affiliate URL for fabric — prefers Fabric.com or Mood when available */
function _fabricAffiliateUrl(name) {
  // Mood for high-end fabrics, Fabric.com for everyday, Amazon as fallback
  if (AWIN_MOOD_ID) return AFFILIATE.mood(name);
  if (FLEXOFFERS_FABRIC_ID) return AFFILIATE.fabricDotCom(name);
  return AFFILIATE.amazon(name, 'fabric by the yard');
}

/**
 * Fabric type definitions keyed by machine-readable ID.
 * Each entry describes a fabric's display name, weight range, stretch
 * behaviour, weave category ('woven' | 'knit'), and optional sewing notes.
 *
 * @type {Object.<string, { name: string, weight: string, stretch: boolean,
 *   category: string, notes?: string }>}
 */
export const FABRIC_TYPES = {
  // ── Heavy wovens ──────────────────────────────────────────────────────────
  'cotton-twill':     { name: 'Cotton twill', weight: '8–10 oz/yd²', stretch: false, category: 'woven' },
  'gabardine':        { name: 'Gabardine', weight: '8–10 oz/yd²', stretch: false, category: 'woven' },
  'cotton-canvas':    { name: 'Cotton canvas', weight: '10–12 oz/yd²', stretch: false, category: 'woven' },
  'bull-denim':       { name: 'Bull denim', weight: '11–14 oz/yd²', stretch: false, category: 'woven', notes: 'Very sturdy; best washed before cutting' },
  'waxed-cotton':     { name: 'Waxed cotton', weight: '8–10 oz/yd²', stretch: false, category: 'woven', notes: 'Repels water; sew with a Teflon foot' },
  'denim':            { name: 'Denim', weight: '10–14 oz/yd²', stretch: false, category: 'woven' },
  'stretch-denim':    { name: 'Stretch denim (2% spandex)', weight: '10–12 oz/yd²', stretch: true, category: 'woven' },
  'denim-light':      { name: 'Lightweight denim', weight: '6–8 oz/yd²', stretch: false, category: 'woven', notes: 'Softer drape than standard denim' },

  // ── Mid-weight wovens ─────────────────────────────────────────────────────
  'linen':            { name: 'Linen or linen-cotton', weight: '5–7 oz/yd²', stretch: false, category: 'woven', notes: 'Pre-wash hot - shrinks 3–5%' },
  'linen-light':      { name: 'Lightweight linen', weight: '3–5 oz/yd²', stretch: false, category: 'woven', notes: 'Breathable; press flat for crisp seams' },
  'chambray':         { name: 'Chambray', weight: '4–6 oz/yd²', stretch: false, category: 'woven' },
  'cotton-chambray':  { name: 'Cotton chambray', weight: '4–6 oz/yd²', stretch: false, category: 'woven' },
  'cotton-poplin':    { name: 'Cotton poplin', weight: '3–5 oz/yd²', stretch: false, category: 'woven', notes: 'Crisp, smooth hand; irons beautifully' },
  'cotton-lawn':      { name: 'Cotton lawn', weight: '2–3 oz/yd²', stretch: false, category: 'woven', notes: 'Very fine; use sharp 70/10 needle' },
  'cotton-voile':     { name: 'Cotton voile', weight: '2–3 oz/yd²', stretch: false, category: 'woven', notes: 'Sheer; line or underline for opacity' },
  'wool-suiting':     { name: 'Wool or poly suiting', weight: '8–10 oz/yd²', stretch: false, category: 'woven' },
  'wool-blend':       { name: 'Wool blend (suiting or crepe)', weight: '6–9 oz/yd²', stretch: false, category: 'woven', notes: 'Press with damp cloth and wool setting' },

  // ── Drapey wovens ─────────────────────────────────────────────────────────
  'rayon-twill':      { name: 'Rayon or tencel twill', weight: '5–7 oz/yd²', stretch: false, category: 'woven', notes: 'Drapey; stay-stitch bias areas immediately' },
  'rayon-challis':    { name: 'Rayon challis', weight: '3–4 oz/yd²', stretch: false, category: 'woven', notes: 'Very drapey; pre-wash, stay-stitch bias areas' },
  'crepe':            { name: 'Crepe (woven)', weight: '4–6 oz/yd²', stretch: false, category: 'woven', notes: 'Excellent drape; doesn\'t fray badly' },
  'wool-crepe':       { name: 'Wool crepe', weight: '5–7 oz/yd²', stretch: false, category: 'woven', notes: 'Elegant drape; press with damp cloth' },
  'silk-charmeuse':   { name: 'Silk charmeuse', weight: '2–3 oz/yd²', stretch: false, category: 'woven', notes: 'Very slippery; use tissue paper when cutting' },
  'satin':            { name: 'Satin (poly or silk)', weight: '3–5 oz/yd²', stretch: false, category: 'woven', notes: 'Slippery; clip with weights, not pins' },
  'tencel':           { name: 'Tencel / lyocell', weight: '3–5 oz/yd²', stretch: false, category: 'woven', notes: 'Silky drape; minimal pre-shrink needed' },
  'tencel-twill':     { name: 'Tencel twill', weight: '4–6 oz/yd²', stretch: false, category: 'woven', notes: 'Soft hand with structure; pre-wash gently' },
  'viscose':          { name: 'Viscose / rayon', weight: '3–5 oz/yd²', stretch: false, category: 'woven', notes: 'Drapey; pre-wash; stay-stitch all curves' },
  'nylon-taslan':     { name: 'Nylon taslan', weight: '3–5 oz/yd²', stretch: false, category: 'woven', notes: 'Water resistant, for swim/gym' },

  // ── Knit ──────────────────────────────────────────────────────────────────
  'cotton-jersey':    { name: 'Cotton jersey', weight: '5–7 oz/yd²', stretch: true, category: 'knit', notes: 'Pre-wash - cotton knits shrink 3–5%' },
  'rayon-jersey':     { name: 'Rayon jersey', weight: '4–6 oz/yd²', stretch: true, category: 'knit', notes: 'Drapey, fluid; pre-wash gently' },
  'poly-jersey':      { name: 'Poly jersey / interlock', weight: '4–6 oz/yd²', stretch: true, category: 'knit', notes: 'Minimal shrink; great for casual wear' },
  'cotton-modal':     { name: 'Cotton-modal blend', weight: '4–6 oz/yd²', stretch: true, category: 'knit', notes: 'Silky soft; minimal shrink' },
  'bamboo-jersey':    { name: 'Bamboo jersey', weight: '4–6 oz/yd²', stretch: true, category: 'knit', notes: 'Naturally antibacterial; wash cold' },
  'french-terry':     { name: 'French terry', weight: '8–10 oz/yd²', stretch: true, category: 'knit' },
  'fleece':           { name: 'Cotton or poly fleece', weight: '10–14 oz/yd²', stretch: true, category: 'knit' },
  'sweatshirt-fleece':{ name: 'Sweatshirt fleece', weight: '10–12 oz/yd²', stretch: true, category: 'knit' },
  'rib-knit':         { name: 'Rib knit (for cuffs/collar)', weight: '6–8 oz/yd²', stretch: true, category: 'knit' },
  'ponte':            { name: 'Ponte (double knit)', weight: '8–10 oz/yd²', stretch: true, category: 'knit', notes: 'Stable stretch; holds shape well; good for structured pieces' },
  'supplex':          { name: 'Supplex nylon or poly-spandex', weight: '4–6 oz/yd²', stretch: true, category: 'knit', notes: '4-way stretch, moisture-wicking' },

  // ── Other ─────────────────────────────────────────────────────────────────
  'mesh':             { name: 'Athletic mesh', weight: '2–3 oz/yd²', stretch: true, category: 'knit', notes: 'For pocket linings, liner' },
};

/**
 * Thread type definitions keyed by machine-readable ID.
 *
 * @type {Object.<string, { name: string, weight: string, notes: string }>}
 */
export const THREAD_TYPES = {
  'poly-all':    { name: 'Polyester all-purpose', weight: '40wt', notes: 'Standard for most garments' },
  'poly-heavy':  { name: 'Polyester heavy-duty', weight: '30wt', notes: 'For denim, canvas, topstitching' },
  'cotton':      { name: 'Cotton thread', weight: '50wt', notes: 'For natural fiber purists' },
  'woolly-nylon':{ name: 'Woolly nylon', weight: 'texturized', notes: 'For serger loopers on knits' },
};

/**
 * Machine needle type definitions keyed by machine-readable ID.
 * Size notation follows the European/American dual system (e.g. 90/14).
 *
 * @type {Object.<string, { name: string, use: string }>}
 */
export const NEEDLE_TYPES = {
  'universal-70':   { name: 'Universal 70/10', use: 'Very fine wovens (lawn, voile, charmeuse, chiffon)' },
  'universal-75':   { name: 'Universal 75/11', use: 'Fine-light wovens (poplin, chambray, lawn)' },
  'universal-80':   { name: 'Universal 80/12', use: 'Light-medium wovens (cotton, linen, crepe)' },
  'universal-90':   { name: 'Universal 90/14', use: 'Medium wovens (twill, gabardine, wool suiting)' },
  'universal-100':  { name: 'Universal 100/16', use: 'Heavy wovens (canvas, heavy denim)' },
  'ballpoint-75':   { name: 'Ballpoint/Jersey 75/11', use: 'Fine knits (jersey, modal, bamboo)' },
  'ballpoint-80':   { name: 'Ballpoint/Jersey 80/12', use: 'Knits (jersey, french terry, ponte)' },
  'ballpoint-90':   { name: 'Ballpoint/Jersey 90/14', use: 'Medium-heavy knits (fleece, sweatshirt)' },
  'stretch-75':     { name: 'Stretch 75/11', use: 'Lycra, spandex blends' },
  'denim-100':      { name: 'Denim/Jeans 100/16', use: 'Denim, heavy twill, multiple layers' },
};

/**
 * Machine stitch type definitions keyed by machine-readable ID.
 * Length and width are in millimetres. Width '0' means straight stitch.
 *
 * @type {Object.<string, { name: string, length: string, width: string, use: string }>}
 */
export const STITCH_TYPES = {
  'straight-1.8':  { name: 'Straight stitch', length: '1.8mm', width: '0', use: 'Fine fabrics, detail stitching, understitching' },
  'straight-2':    { name: 'Straight stitch', length: '2.0mm', width: '0', use: 'Fine wovens, French seams, understitching' },
  'straight-2.5':  { name: 'Straight stitch', length: '2.5mm', width: '0', use: 'Standard seams on wovens' },
  'straight-3':    { name: 'Straight stitch', length: '3.0mm', width: '0', use: 'Topstitching, visible seams' },
  'straight-3.5':  { name: 'Straight stitch', length: '3.5mm', width: '0', use: 'Basting, heavy fabric topstitch' },
  'zigzag-small':  { name: 'Zigzag', length: '2.0mm', width: '1.0mm', use: 'Seam finishing on wovens' },
  'zigzag-med':    { name: 'Zigzag', length: '2.5mm', width: '2.5mm', use: 'Stretch seams, seam finishing' },
  'stretch':       { name: 'Lightning/stretch stitch', length: '2.5mm', width: '1.0mm', use: 'Knit seams (if no serger)' },
  'overlock':      { name: 'Serger/overlock', length: '2.5–3mm', width: '5mm', use: 'Seam + finish in one pass' },
  'coverstitch':   { name: 'Coverstitch', length: '3.0mm', width: 'twin needle', use: 'Knit hems (or use twin needle)' },
  'bartack':       { name: 'Bar tack', length: '0.5mm', width: '3mm', use: 'Stress points: pocket corners, fly' },
  'blindhem':      { name: 'Blind hem stitch', length: '2.5mm', width: '4mm', use: 'Invisible hems on trousers and skirts' },
};

/**
 * Standard notions shared across many garments, keyed by machine-readable ID.
 * Garment modules reference these by key in their buildMaterialsSpec() call;
 * quantity overrides can be provided per-garment.
 *
 * @type {Object.<string, { name: string, notes: string }>}
 */
export const STANDARD_NOTIONS = {
  'elastic-1.5':       { name: '1.5″ woven elastic', notes: 'Woven, not braided - holds shape better' },
  'elastic-1':         { name: '1″ woven elastic', notes: 'For lighter garments' },
  'elastic-0.75':      { name: '¾″ elastic', notes: 'For casings, waist gathering' },
  'drawstring':        { name: '½–¾″ flat drawstring cord', notes: 'Woven cotton or nylon' },
  'interfacing-light':  { name: 'Lightweight fusible interfacing', notes: 'Pellon SF101 or similar - for lightweight wovens and facings' },
  'interfacing-med':    { name: 'Medium fusible interfacing', notes: 'Pellon SF101 or similar' },
  'interfacing-heavy':  { name: 'Heavy fusible interfacing', notes: 'Pellon 809 Decor-Bond' },
  'webbing-1.5':       { name: '1.5″ nylon webbing', notes: 'Stiff, for internal belt/holster support' },
  'zipper':            { name: 'Zipper', notes: 'Length = rise measurement' },
  'buttons':           { name: 'Buttons', notes: 'Size and count varies by garment' },
  'snaps':             { name: 'Snap fasteners', notes: 'Size 16 or similar' },
  'grommets':          { name: 'Metal grommets/eyelets', notes: '½″ inner diameter' },
  'velcro':            { name: 'Hook & loop tape (Velcro)', notes: '1″ wide' },
};

/**
 * Build a normalised materials spec for a garment from a config object.
 *
 * Each array entry can be:
 *   - A string key → looked up in the corresponding database (FABRIC_TYPES etc.)
 *   - An object with a `ref` key → looked up and merged with extra fields (e.g. quantity)
 *   - A plain object → used as-is
 *
 * @param {{
 *   fabrics:  Array<string | Object>,
 *   notions:  Array<string | { ref: string, quantity: string } | Object>,
 *   thread:   string | Object,
 *   needle:   string | Object,
 *   stitches: Array<string | Object>,
 *   notes?:   string[]
 * }} config
 * @returns {{
 *   fabrics:  Object[],
 *   notions:  Object[],
 *   thread:   Object,
 *   needle:   Object,
 *   stitches: Object[],
 *   notes:    string[]
 * }}
 */
export function buildMaterialsSpec(config) {
  function enrichFabric(f) {
    if (!f?.name) return f;
    return f.affiliateUrl ? f : { ...f, affiliateUrl: _fabricAffiliateUrl(f.name) };
  }
  function enrichThread(t) {
    if (!t?.name) return t;
    return t.affiliateUrl ? t : { ...t, affiliateUrl: _affiliateUrl(t.name, 'thread sewing') };
  }
  function enrichNeedle(n) {
    if (!n?.name) return n;
    return n.affiliateUrl ? n : { ...n, affiliateUrl: _affiliateUrl(n.name, 'sewing machine needle') };
  }
  function enrichNotion(n) {
    if (!n?.name) return n;
    return n.affiliateUrl ? n : { ...n, affiliateUrl: _notionAffiliateUrl(n.name) };
  }

  const rawThread = typeof config.thread === 'string' ? THREAD_TYPES[config.thread] : config.thread;
  const rawNeedle = typeof config.needle === 'string' ? NEEDLE_TYPES[config.needle] : config.needle;

  // Determine fabric categories used by this garment
  const fabricEntries = config.fabrics.map(f =>
    typeof f === 'string' ? FABRIC_TYPES[f] : f
  ).filter(Boolean);
  const hasWoven = fabricEntries.some(f => f.category === 'woven');
  const hasKnit  = fabricEntries.some(f => f.category === 'knit');

  const machineSettings = [];
  if (hasWoven) {
    machineSettings.push({
      label: 'Woven fabrics (cotton twill, gabardine, muslin, linen)',
      tension: '4–4.5',
      stitch: 'Straight stitch, length 2.5mm',
      notes: 'Backstitch 3–4 stitches at start and end of every seam',
    });
  }
  if (hasKnit) {
    machineSettings.push({
      label: 'Knit fabrics (cotton jersey, rayon jersey)',
      tension: '3.5–4',
      stitch: 'Stretch stitch or narrow zigzag (width 0.5, length 2.5)',
      notes: 'Reduce presser foot pressure if available',
    });
  }

  const troubleshooting = [
    'Loops on the back of fabric = top tension too loose, increase by 0.5',
    'Loops on the front of fabric = bobbin tension issue, re-seat bobbin',
    'Thread breaking = re-thread from scratch with presser foot UP',
    'Skipped stitches = change needle, ensure correct needle type for fabric',
    'Fabric not feeding = check feed dogs are up, clean lint under needle plate',
    'Puckering = reduce tension by 0.5 and/or reduce presser foot pressure',
  ];

  return {
    fabrics: fabricEntries.map(f => enrichFabric({ ...f })),
    notions: config.notions.map(n =>
      enrichNotion(
        typeof n === 'string'
          ? { ...STANDARD_NOTIONS[n] }
          : typeof n.ref === 'string'
            ? { ...STANDARD_NOTIONS[n.ref], quantity: n.quantity }
            : n
      )
    ),
    thread: enrichThread(rawThread),
    needle: enrichNeedle(rawNeedle),
    stitches: config.stitches.map(s =>
      typeof s === 'string' ? STITCH_TYPES[s] : s
    ),
    notes: config.notes || [],
    machineSettings,
    troubleshooting,
  };
}
