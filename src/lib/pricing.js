// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
export const PATTERN_PRICES = {
  // Beginner — $7
  'gym-shorts':         { cents: 700,  label: 'Gym Shorts',          priceId: 'price_1TFO3JEcctnfQkkL16G6tSHa', tier: 'beginner' },
  'swim-trunks':        { cents: 700,  label: 'Swim Trunks',         priceId: 'price_1TFO3JEcctnfQkkL16G6tSHa', tier: 'beginner' },
  'slip-skirt-w':       { cents: 700,  label: 'Slip Skirt',          priceId: 'price_1TFO3JEcctnfQkkL16G6tSHa', tier: 'beginner' },

  // Intermediate — $8
  'tee':                { cents: 800,  label: 'T-Shirt',             priceId: 'price_1TFO3aEcctnfQkkLLD48Qw5Z', tier: 'intermediate' },
  'cargo-shorts':       { cents: 800,  label: 'Cargo Shorts',        priceId: 'price_1TFO3aEcctnfQkkLLD48Qw5Z', tier: 'intermediate' },
  'pleated-shorts':     { cents: 800,  label: 'Pleated Shorts',      priceId: 'price_1TFO3aEcctnfQkkLLD48Qw5Z', tier: 'intermediate' },
  'crewneck':           { cents: 800,  label: 'Crewneck Sweatshirt', priceId: 'price_1TFO3aEcctnfQkkLLD48Qw5Z', tier: 'intermediate' },
  'hoodie':             { cents: 800,  label: 'Hoodie',              priceId: 'price_1TFO3aEcctnfQkkLLD48Qw5Z', tier: 'intermediate' },
  'fitted-tee-w':       { cents: 800,  label: 'Fitted Tee',          priceId: 'price_1TFO3aEcctnfQkkLLD48Qw5Z', tier: 'intermediate' },
  'a-line-skirt-w':     { cents: 800,  label: 'A-Line Skirt',        priceId: 'price_1TFO3aEcctnfQkkLLD48Qw5Z', tier: 'intermediate' },
  'easy-pant-w':        { cents: 800,  label: 'Easy Pant',           priceId: 'price_1TFO3aEcctnfQkkLLD48Qw5Z', tier: 'intermediate' },
  'shell-blouse-w':     { cents: 800,  label: 'Shell Blouse',        priceId: 'price_1TFO3aEcctnfQkkLLD48Qw5Z', tier: 'intermediate' },

  // Advanced — $10
  'straight-jeans':     { cents: 1000, label: 'Straight Jeans',      priceId: 'price_1TFO3qEcctnfQkkL4lJij7al', tier: 'advanced' },
  'chinos':             { cents: 1000, label: 'Chinos',              priceId: 'price_1TFO3qEcctnfQkkL4lJij7al', tier: 'advanced' },
  'pleated-trousers':   { cents: 1000, label: 'Pleated Trousers',    priceId: 'price_1TFO3qEcctnfQkkL4lJij7al', tier: 'advanced' },
  'sweatpants':         { cents: 1000, label: 'Sweatpants',          priceId: 'price_1TFO3qEcctnfQkkL4lJij7al', tier: 'advanced' },
  'camp-shirt':         { cents: 1000, label: 'Camp Shirt',          priceId: 'price_1TFO3qEcctnfQkkL4lJij7al', tier: 'advanced' },
  'crop-jacket':        { cents: 1000, label: 'Crop Jacket',         priceId: 'price_1TFO3qEcctnfQkkL4lJij7al', tier: 'advanced' },
  'wide-leg-trouser-w': { cents: 1000, label: 'Wide-Leg Trouser',    priceId: 'price_1TFO3qEcctnfQkkL4lJij7al', tier: 'advanced' },
  'straight-trouser-w': { cents: 1000, label: 'Straight Trouser',    priceId: 'price_1TFO3qEcctnfQkkL4lJij7al', tier: 'advanced' },
  'button-up-w':        { cents: 1000, label: 'Button-Up Shirt',     priceId: 'price_1TFO3qEcctnfQkkL4lJij7al', tier: 'advanced' },
  'shirt-dress-w':      { cents: 1000, label: 'Shirt Dress',         priceId: 'price_1TFO3qEcctnfQkkL4lJij7al', tier: 'advanced' },
  'wrap-dress-w':       { cents: 1000, label: 'Wrap Dress',          priceId: 'price_1TFO3qEcctnfQkkL4lJij7al', tier: 'advanced' },
};

// A0 / copy-shop single-sheet add-on
export const A0_UPSELL = {
  cents:   400,
  label:   'A0 / Copy Shop file',
  priceId: 'price_a0_upsell_placeholder', // replace with live Stripe price ID
};

export const SUBSCRIPTION_PRICE = {
  monthly: {
    cents:   1300,
    label:   'Monthly Membership',
    priceId: 'price_1TFO48EcctnfQkkLxbDSrnDe',
  },
};
