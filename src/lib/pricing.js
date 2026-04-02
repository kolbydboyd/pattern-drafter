// Copyright (c) 2026 People's Patterns LLC. All rights reserved.

// ── Tier definitions ──────────────────────────────────────────────────────────
export const TIER_PRICES = {
  simple: {
    cents:   900,
    label:   'Simple',
    priceId: 'price_1TFlLvEcctnfQkkLPYNfYdUP',  // replace with live Stripe price ID
    description: 'Beginner-friendly builds - elastic waists, minimal shaping',
    examples: ['Gym Shorts', 'T-Shirt', 'Slip Skirt', 'Easy Pant'],
  },
  core: {
    cents:   1400,
    label:   'Core',
    priceId: 'price_1TFlMEEcctnfQkkLrWGrSnx3',
    description: 'Everyday wardrobe staples - standard closures, moderate shaping',
    examples: ['Cargo Shorts', 'Straight Jeans', 'Camp Shirt', 'A-Line Skirt'],
  },
  tailored: {
    cents:   1900,
    label:   'Tailored',
    priceId: 'price_1TFlMTEcctnfQkkLjaWAjH7D',
    description: 'Detailed construction - pleats, darts, linings, precision fit',
    examples: ['Pleated Trousers', 'Hoodie', 'Button-Up Shirt', 'Wrap Dress'],
  },
};

// ── Garment → tier mapping ────────────────────────────────────────────────────
const GARMENT_TIERS = {
  // simple — $9
  'gym-shorts':       'simple',
  'swim-trunks':      'simple',
  'tee':              'simple',
  'fitted-tee-w':     'simple',
  'slip-skirt-w':     'simple',
  'easy-pant-w':      'simple',
  'apron':            'simple',
  'bow-tie':          'simple',
  'tank-top':         'simple',
  'circle-skirt-w':   'simple',
  'pencil-skirt-w':   'simple',
  'leggings':         'simple',
  // core — $14
  'cargo-shorts':       'core',
  'straight-jeans':     'core',
  'baggy-jeans':        'core',
  'chinos':             'core',
  'sweatpants':         'core',
  'camp-shirt':         'core',
  'crewneck':           'core',
  'a-line-skirt-w':     'core',
  'straight-trouser-w': 'core',
  'wide-leg-trouser-w': 'core',
  'shell-blouse-w':     'core',
  // tailored — $19
  'pleated-shorts':   'tailored',
  'pleated-trousers': 'tailored',
  'hoodie':           'tailored',
  'crop-jacket':      'tailored',
  'denim-jacket':     'tailored',
  'cargo-work-pants': 'tailored',
  'button-up-w':      'tailored',
  'shirt-dress-w':    'tailored',
  'wrap-dress-w':     'tailored',
  'athletic-formal-jacket':   'tailored',
  'athletic-formal-trousers': 'core',
  // dresses
  'tshirt-dress-w':  'core',
  'slip-dress-w':    'core',
  'a-line-dress-w':  'tailored',
  'sundress-w':      'core',
  'tote-bag':        'core',
};

// Garment display labels (used in checkout, emails, UI)
const GARMENT_LABELS = {
  'gym-shorts':         'Gym Shorts',
  'swim-trunks':        'Swim Trunks',
  'tee':                'T-Shirt',
  'fitted-tee-w':       'Fitted Tee',
  'slip-skirt-w':       'Slip Skirt',
  'easy-pant-w':        'Easy Pant',
  'cargo-shorts':       'Cargo Shorts',
  'straight-jeans':     'Straight Jeans',
  'baggy-jeans':        'Baggy Jeans',
  'chinos':             'Chinos',
  'sweatpants':         'Sweatpants',
  'camp-shirt':         'Camp Shirt',
  'crewneck':           'Crewneck Sweatshirt',
  'a-line-skirt-w':     'A-Line Skirt',
  'straight-trouser-w': 'Straight Trouser',
  'wide-leg-trouser-w': 'Wide-Leg Trouser',
  'shell-blouse-w':     'Shell Blouse',
  'pleated-shorts':     'Pleated Shorts',
  'pleated-trousers':   'Pleated Trousers',
  'hoodie':             'Hoodie',
  'crop-jacket':        'Crop Jacket',
  'denim-jacket':       'Denim Jacket',
  'cargo-work-pants':   'Cargo Work Pants',
  'button-up-w':        'Button-Up Shirt',
  'shirt-dress-w':      'Shirt Dress',
  'wrap-dress-w':       'Wrap Dress',
  'apron':              'Apron',
  'bow-tie':            'Bow Tie',
  'tank-top':           'Tank Top',
  'circle-skirt-w':     'Circle Skirt',
  'pencil-skirt-w':     'Pencil Skirt',
  'leggings':           'Leggings',
  'athletic-formal-jacket':   'Athletic Formal Jacket',
  'athletic-formal-trousers': 'Athletic Formal Trousers',
  'tshirt-dress-w':           'T-Shirt Dress',
  'slip-dress-w':             'Slip Dress',
  'a-line-dress-w':           'A-Line Dress',
  'sundress-w':               'Sundress',
  'tote-bag':                 'Tote Bag',
};

// ── Per-garment lookup (backward-compatible with existing consumers) ──────────
// PATTERN_PRICES[garmentId] → { cents, priceId, label, tier }
export const PATTERN_PRICES = Object.fromEntries(
  Object.entries(GARMENT_TIERS).map(([id, tier]) => {
    const t = TIER_PRICES[tier];
    return [id, { cents: t.cents, priceId: t.priceId, label: GARMENT_LABELS[id] ?? id, tier }];
  })
);

// ── Bundle pricing ────────────────────────────────────────────────────────────
export const BUNDLES = {
  capsule3: {
    cents:   2900,
    label:   '3-Pattern Capsule',
    priceId: 'price_1TFlRNEcctnfQkkL9vDPJQh0',
    patternCount: 3,
    description: 'Any 3 patterns - mix tiers, same measurements',
  },
  wardrobe5: {
    cents:   4900,
    label:   '5-Pattern Wardrobe',
    priceId: 'price_1TFlSEEcctnfQkkLQRVMAUXS',
    patternCount: 5,
    description: 'Any 5 patterns - build a complete capsule wardrobe',
  },
};

// ── Membership / subscription pricing ────────────────────────────────────────
export const SUBSCRIPTION_PRICES = {
  club_monthly: {
    cents:       1200,
    label:       'Club Monthly',
    priceId:     'price_1TFlTIEcctnfQkkLji6mmeGO',
    billingCycle: 'month',
    credits:     1,
    description: '1 pattern credit / month · Download any pattern, any tier',
  },
  club_annual: {
    cents:       12000,
    label:       'Club Annual',
    priceId:     'price_1TFlTdEcctnfQkkLNIME3K4j',
    billingCycle: 'year',
    credits:     12,
    description: '12 credits / year · Best value for regular sewists',
  },
  wardrobe_monthly: {
    cents:       2400,
    label:       'Wardrobe Monthly',
    priceId:     'price_1TFlVLEcctnfQkkLmY6WwC0R',
    billingCycle: 'month',
    credits:     3,
    description: '3 pattern credits / month · Build a wardrobe fast',
  },
  wardrobe_annual: {
    cents:       24000,
    label:       'Wardrobe Annual',
    priceId:     'price_1TFlWAEcctnfQkkLcCPYTqnS',
    billingCycle: 'year',
    credits:     36,
    description: '36 credits / year · Unlimited wardrobe potential',
  },
};

// ── Legacy alias (used by existing cron-emails.js, stripe-webhook.js) ─────────
export const SUBSCRIPTION_PRICE = SUBSCRIPTION_PRICES.club_monthly;

// ── A0 / copy shop add-on ─────────────────────────────────────────────────────
export const A0_UPSELL = {
  cents:   400,
  label:   'A0 / Projector / Copy Shop files',
  priceId: 'price_1TFlPOEcctnfQkkLwH6SU14A',
};
