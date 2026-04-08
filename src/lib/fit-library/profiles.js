// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Fit-library: profiles, garment-type mappings, and flat-lay field definitions.
 *
 * A "garment type" is a broader category than a garment ID — many garment IDs
 * share the same fitting conventions (e.g. 'straight-jeans' and 'slim-jeans'
 * both use the 'jeans' fit profile).
 *
 * EASE_OPTION_KEY tells the UI which option key on a garment module controls fit,
 * so the fit-reference result can be applied automatically.
 */

// ── Garment ID → fit-library type ───────────────────────────────────────────

export const GARMENT_TYPE_MAP = {
  // Jeans variants
  'straight-jeans':       'jeans',
  'slim-jeans':           'jeans',
  'high-rise-jeans':      'jeans',
  'soloist-jeans':        'jeans',
  'baggy-jeans':          'jeans',
  // Chinos / trousers
  'chinos':               'chinos',
  'slim-chinos':          'chinos',
  'pleated-trousers':     'trousers',
  'athletic-formal-trousers': 'trousers',
  // Casual lower
  'sweatpants':           'sweats',
  'tapered-joggers':      'sweats',
  'lounge-pant-w':        'sweats',
  'easy-pant-w':          'sweats',
  // Wide/tailored trousers (women's)
  'wide-leg-trouser-w':   'trousers',
  'linen-wide-legs-w':    'trousers',
  'straight-trouser-w':   'trousers',
  'cigarette-pants-w':    'trousers',
  // Shorts
  'cargo-shorts':         'shorts',
  'gym-shorts':           'shorts',
  'running-shorts':       'shorts',
  'basketball-shorts':    'shorts',
  'swim-trunks':          'shorts',
  'pleated-shorts':       'shorts',
  'baggy-shorts':         'shorts',
  // Leggings
  'leggings':             'leggings',
  'capri-leggings':       'leggings',
  'biker-shorts':         'leggings',
  // Tees / tanks
  'tee':                  'tee',
  'oversized-tee':        'tee',
  'muscle-tee':           'tee',
  'longline-tee':         'tee',
  'pocket-tee':           'tee',
  'fitted-tee-w':         'tee',
  'scoop-tee-w':          'tee',
  'long-sleeve-fitted-tee-w': 'tee',
  'cropped-tee-w':        'tee',
  'tshirt-dress-w':       'tee',
  'long-sleeve-tee-dress-w':  'tee',
  'maxi-tee-dress-w':     'tee',
  // Tanks
  'tank-top':             'tank',
  'racerback-tank':       'tank',
  'cropped-tank':         'tank',
  'woven-tank-w':         'tank',
  // Hoodies / sweatshirts
  'hoodie':               'hoodie',
  'zip-hoodie':           'hoodie',
  'oversized-hoodie':     'hoodie',
  'crewneck':             'sweatshirt',
  'raglan-sweatshirt':    'sweatshirt',
  // Woven shirts
  'camp-shirt':           'shirt',
  'vacation-shirt':       'shirt',
  'linen-shirt':          'shirt',
  'chambray-work-shirt':  'shirt',
  'button-up-w':          'shirt',
  'poplin-blouse-w':      'shirt',
  'linen-tunic-w':        'shirt',
  'shell-blouse-w':       'shirt',
  // Skirts
  'slip-skirt-w':         'skirt',
  'a-line-skirt-w':       'skirt',
  'pencil-skirt-w':       'skirt',
  'circle-skirt-w':       'skirt',
  'mini-circle-skirt-w':  'skirt',
  'midi-circle-skirt-w':  'skirt',
  // Dresses
  'shirt-dress-w':        'dress',
  'linen-shirt-dress-w':  'dress',
  'wrap-dress-w':         'dress',
  'maxi-wrap-dress-w':    'dress',
  'slip-dress-w':         'dress',
  'maxi-slip-dress-w':    'dress',
  'a-line-dress-w':       'dress',
  'midi-aline-dress-w':   'dress',
  'sundress-w':           'dress',
  'maxi-sundress-w':      'dress',
  'tiered-sundress-w':    'dress',
  // Outerwear
  'crop-jacket':          'jacket',
  'denim-jacket':         'jacket',
  'lightweight-denim-jacket': 'jacket',
  'athletic-formal-jacket':   'jacket',
};

// ── Which garment option key maps to ease/fit ────────────────────────────────
// Lower-body garments use 'ease'; upper-body use 'fit'.
// Some garments use neither (skirts, accessories) — those get null.

export const EASE_OPTION_KEY = {
  jeans:      'ease',
  chinos:     'ease',
  trousers:   'ease',
  sweats:     'ease',
  shorts:     'ease',
  leggings:   null,   // leggings are body-contour; ease isn't user-selectable
  tee:        'fit',
  tank:       'fit',
  hoodie:     'fit',
  sweatshirt: 'fit',
  shirt:      'fit',
  skirt:      null,
  dress:      'fit',
  jacket:     'fit',
};

// ── Named fit profiles per garment type ─────────────────────────────────────
// Each profile has the select value expected by the garment module, plus the
// canonical ease total (inches) for the primary measurement (hip for lower,
// chest for upper).  Used to snap a derived numeric ease to a named profile.

export const FIT_PROFILES = {
  jeans: [
    { value: 'slim',    label: 'Slim',    ease: 2.5 },
    { value: 'regular', label: 'Regular', ease: 4   },
    { value: 'relaxed', label: 'Relaxed', ease: 6   },
    { value: 'wide',    label: 'Wide',    ease: 8   },
  ],
  chinos: [
    { value: 'slim',    label: 'Slim',    ease: 2.5 },
    { value: 'regular', label: 'Regular', ease: 4   },
    { value: 'relaxed', label: 'Relaxed', ease: 6   },
  ],
  trousers: [
    { value: 'slim',    label: 'Slim',    ease: 2.5 },
    { value: 'regular', label: 'Regular', ease: 4   },
    { value: 'relaxed', label: 'Relaxed', ease: 6   },
    { value: 'wide',    label: 'Wide',    ease: 8   },
  ],
  sweats: [
    { value: 'slim',    label: 'Slim',    ease: 2.5 },
    { value: 'regular', label: 'Regular', ease: 4   },
    { value: 'relaxed', label: 'Relaxed', ease: 6   },
    { value: 'wide',    label: 'Wide',    ease: 8   },
  ],
  shorts: [
    { value: 'slim',    label: 'Slim',    ease: 2.5 },
    { value: 'regular', label: 'Regular', ease: 4   },
    { value: 'relaxed', label: 'Relaxed', ease: 6   },
    { value: 'wide',    label: 'Wide',    ease: 8   },
  ],
  tee: [
    { value: 'fitted',    label: 'Slim / fitted', ease: 2  },
    { value: 'standard',  label: 'Regular',       ease: 4  },
    { value: 'relaxed',   label: 'Relaxed',       ease: 6  },
    { value: 'oversized', label: 'Oversized',     ease: 10 },
  ],
  tank: [
    { value: 'fitted',    label: 'Fitted',   ease: 1  },
    { value: 'standard',  label: 'Regular',  ease: 3  },
    { value: 'relaxed',   label: 'Relaxed',  ease: 5  },
    { value: 'oversized', label: 'Oversized',ease: 8  },
  ],
  hoodie: [
    { value: 'fitted',    label: 'Fitted',   ease: 3  },
    { value: 'standard',  label: 'Regular',  ease: 5  },
    { value: 'relaxed',   label: 'Relaxed',  ease: 8  },
    { value: 'oversized', label: 'Oversized',ease: 12 },
  ],
  sweatshirt: [
    { value: 'fitted',    label: 'Fitted',   ease: 3  },
    { value: 'standard',  label: 'Regular',  ease: 5  },
    { value: 'relaxed',   label: 'Relaxed',  ease: 8  },
    { value: 'oversized', label: 'Oversized',ease: 12 },
  ],
  shirt: [
    { value: 'slim',      label: 'Slim',     ease: 3  },
    { value: 'standard',  label: 'Regular',  ease: 5  },
    { value: 'relaxed',   label: 'Relaxed',  ease: 7  },
  ],
  dress: [
    { value: 'fitted',    label: 'Fitted',   ease: 2  },
    { value: 'standard',  label: 'Regular',  ease: 4  },
    { value: 'relaxed',   label: 'Relaxed',  ease: 6  },
    { value: 'oversized', label: 'Oversized',ease: 10 },
  ],
  jacket: [
    { value: 'slim',      label: 'Slim',     ease: 3  },
    { value: 'standard',  label: 'Regular',  ease: 5  },
    { value: 'relaxed',   label: 'Relaxed',  ease: 8  },
  ],
};

// ── Flat-lay measurement fields per garment type ─────────────────────────────
// `circumference: true` → multiply flat-lay reading by 2 to get full circumference.
// `circumference: false` → linear measurement; no conversion needed.
// `primaryEase` → the measurement used to derive the primary ease value for snapping.

export const FLAT_LAY_FIELDS = {
  jeans: {
    primaryEase: 'hip',
    fields: [
      { id: 'waist',  label: 'Waist (across flat)',  circumference: true,  hint: 'Measure across the waistband while laid flat' },
      { id: 'hip',    label: 'Hip (across flat)',    circumference: true,  hint: 'At the fullest point, measure across while flat' },
      { id: 'thigh',  label: 'Thigh (across flat)',  circumference: true,  hint: 'Below crotch seam, measure across while flat' },
      { id: 'inseam', label: 'Inseam',               circumference: false, hint: 'Crotch seam to hem, along inner leg' },
      { id: 'rise',   label: 'Rise',                 circumference: false, hint: 'Waistband to crotch seam at center front' },
    ],
  },
  chinos: {
    primaryEase: 'hip',
    fields: [
      { id: 'waist',  label: 'Waist (across flat)',  circumference: true,  hint: 'Measure across waistband while laid flat' },
      { id: 'hip',    label: 'Hip (across flat)',    circumference: true,  hint: 'At fullest point across' },
      { id: 'thigh',  label: 'Thigh (across flat)',  circumference: true,  hint: 'Below crotch seam, across' },
      { id: 'inseam', label: 'Inseam',               circumference: false, hint: 'Crotch seam to hem' },
    ],
  },
  trousers: {
    primaryEase: 'hip',
    fields: [
      { id: 'waist',  label: 'Waist (across flat)',  circumference: true,  hint: 'Measure across waistband while laid flat' },
      { id: 'hip',    label: 'Hip (across flat)',    circumference: true,  hint: 'At fullest point across' },
      { id: 'inseam', label: 'Inseam',               circumference: false, hint: 'Crotch seam to hem' },
    ],
  },
  sweats: {
    primaryEase: 'hip',
    fields: [
      { id: 'waist',  label: 'Waist (across flat)',  circumference: true,  hint: 'Measure across waistband while laid flat' },
      { id: 'hip',    label: 'Hip (across flat)',    circumference: true,  hint: 'At fullest point across' },
      { id: 'inseam', label: 'Inseam',               circumference: false, hint: 'Crotch seam to hem' },
    ],
  },
  shorts: {
    primaryEase: 'hip',
    fields: [
      { id: 'waist',  label: 'Waist (across flat)',  circumference: true,  hint: 'Measure across waistband while laid flat' },
      { id: 'hip',    label: 'Hip (across flat)',    circumference: true,  hint: 'At fullest point across' },
      { id: 'inseam', label: 'Inseam',               circumference: false, hint: 'Inseam length to hem' },
    ],
  },
  tee: {
    primaryEase: 'chest',
    fields: [
      { id: 'chest',        label: 'Chest (across flat)',  circumference: true,  hint: 'Measure across front at underarm, folded flat' },
      { id: 'torsoLength',  label: 'Length',               circumference: false, hint: 'Back neck to hem' },
      { id: 'sleeveLength', label: 'Sleeve length',        circumference: false, hint: 'Shoulder seam to sleeve hem' },
    ],
  },
  tank: {
    primaryEase: 'chest',
    fields: [
      { id: 'chest',       label: 'Chest (across flat)', circumference: true,  hint: 'Measure across front at underarm, folded flat' },
      { id: 'torsoLength', label: 'Length',              circumference: false, hint: 'Shoulder to hem' },
    ],
  },
  hoodie: {
    primaryEase: 'chest',
    fields: [
      { id: 'chest',        label: 'Chest (across flat)',  circumference: true,  hint: 'Measure across front at underarm, folded flat' },
      { id: 'torsoLength',  label: 'Body length',          circumference: false, hint: 'Back neck to hem' },
      { id: 'sleeveLength', label: 'Sleeve length',        circumference: false, hint: 'Shoulder seam to cuff' },
    ],
  },
  sweatshirt: {
    primaryEase: 'chest',
    fields: [
      { id: 'chest',        label: 'Chest (across flat)',  circumference: true,  hint: 'Measure across front at underarm, folded flat' },
      { id: 'torsoLength',  label: 'Body length',          circumference: false, hint: 'Back neck to hem' },
      { id: 'sleeveLength', label: 'Sleeve length',        circumference: false, hint: 'Shoulder seam to cuff' },
    ],
  },
  shirt: {
    primaryEase: 'chest',
    fields: [
      { id: 'chest',        label: 'Chest (across flat)',  circumference: true,  hint: 'Measure across front at underarm, folded flat' },
      { id: 'torsoLength',  label: 'Body length',          circumference: false, hint: 'Back neck to hem' },
      { id: 'sleeveLength', label: 'Sleeve length',        circumference: false, hint: 'Shoulder seam to cuff edge' },
    ],
  },
  skirt: {
    primaryEase: 'hip',
    fields: [
      { id: 'waist', label: 'Waist (across flat)', circumference: true,  hint: 'Measure across waistband while laid flat' },
      { id: 'hip',   label: 'Hip (across flat)',   circumference: true,  hint: 'At fullest point across' },
      { id: 'inseam',label: 'Length',              circumference: false, hint: 'Waist seam to hem' },
    ],
  },
  dress: {
    primaryEase: 'chest',
    fields: [
      { id: 'chest',  label: 'Chest (across flat)', circumference: true,  hint: 'Measure across front at underarm, folded flat' },
      { id: 'waist',  label: 'Waist (across flat)', circumference: true,  hint: 'At narrowest point across' },
      { id: 'hip',    label: 'Hip (across flat)',   circumference: true,  hint: 'At fullest point across' },
      { id: 'inseam', label: 'Length',              circumference: false, hint: 'Back neck to hem' },
    ],
  },
  jacket: {
    primaryEase: 'chest',
    fields: [
      { id: 'chest',        label: 'Chest (across flat)',  circumference: true,  hint: 'Measure across back at underarm, folded flat' },
      { id: 'torsoLength',  label: 'Body length',          circumference: false, hint: 'Back neck to hem' },
      { id: 'sleeveLength', label: 'Sleeve length',        circumference: false, hint: 'Shoulder seam to cuff' },
    ],
  },
};

// Measurements that are circumferences. Any measurement NOT in this set is linear.
export const CIRCUMFERENCE_MEASUREMENTS = new Set([
  'waist', 'hip', 'thigh', 'chest', 'bicep', 'wrist', 'neck', 'calf', 'ankle', 'knee',
]);
