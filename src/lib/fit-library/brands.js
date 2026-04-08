// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Fit-library: curated brand/size reference data.
 *
 * All measurements are FINISHED GARMENT measurements in inches (full
 * circumference — not flat-lay half-measurements).  These values are
 * sourced from published size guides and are approximate.  They serve
 * as a starting point; user-submitted community data fills the gaps.
 *
 * Structure per brand entry:
 *   label        — display name
 *   garmentType  — matches keys in profiles.js FLAT_LAY_FIELDS
 *   sizeSystem   — 'alpha' | 'numeric-waist' | 'numeric-us-womens'
 *   sizes        — { [sizeLabel]: { [measurementId]: inches } }
 *
 * Add new brands here as needed. Entries with fewer size points are fine —
 * the UI only shows what's available.
 */

export const BRANDS = {

  // ── Jeans ──────────────────────────────────────────────────────────────────

  'levis-501': {
    label: "Levi's 501 Original",
    garmentType: 'jeans',
    sizeSystem: 'numeric-waist',
    description: 'Classic straight leg, regular fit. The original jean.',
    sizes: {
      '28W': { waist: 29,   hip: 38,   thigh: 25,   inseam: 30, rise: 11   },
      '30W': { waist: 31,   hip: 40,   thigh: 26,   inseam: 30, rise: 11   },
      '32W': { waist: 33,   hip: 42,   thigh: 27,   inseam: 30, rise: 11.5 },
      '34W': { waist: 35,   hip: 44,   thigh: 28,   inseam: 30, rise: 12   },
      '36W': { waist: 37,   hip: 46,   thigh: 29,   inseam: 30, rise: 12   },
      '38W': { waist: 39,   hip: 48,   thigh: 30,   inseam: 30, rise: 12.5 },
    },
  },

  'levis-511': {
    label: "Levi's 511 Slim",
    garmentType: 'jeans',
    sizeSystem: 'numeric-waist',
    description: 'Slim from hip to ankle. Sits below waist.',
    sizes: {
      '28W': { waist: 28,   hip: 36,   thigh: 23,   inseam: 30, rise: 10   },
      '30W': { waist: 30,   hip: 38,   thigh: 24,   inseam: 30, rise: 10.5 },
      '32W': { waist: 32,   hip: 40,   thigh: 25,   inseam: 30, rise: 11   },
      '34W': { waist: 34,   hip: 42,   thigh: 26,   inseam: 30, rise: 11   },
      '36W': { waist: 36,   hip: 44,   thigh: 27,   inseam: 30, rise: 11.5 },
    },
  },

  'levis-550': {
    label: "Levi's 550 Relaxed",
    garmentType: 'jeans',
    sizeSystem: 'numeric-waist',
    description: 'Relaxed seat and thigh, tapered to ankle.',
    sizes: {
      '30W': { waist: 32,   hip: 42,   thigh: 28.5, inseam: 30, rise: 12   },
      '32W': { waist: 34,   hip: 44,   thigh: 29.5, inseam: 30, rise: 12   },
      '34W': { waist: 36,   hip: 46,   thigh: 30.5, inseam: 30, rise: 12.5 },
      '36W': { waist: 38,   hip: 48,   thigh: 31.5, inseam: 30, rise: 13   },
      '38W': { waist: 40,   hip: 50,   thigh: 32.5, inseam: 30, rise: 13   },
    },
  },

  'abercrombie-slim-m': {
    label: 'Abercrombie Slim Jeans (Men)',
    garmentType: 'jeans',
    sizeSystem: 'numeric-waist',
    description: 'Slim through hip and thigh.',
    sizes: {
      '28':  { waist: 28,   hip: 36,   thigh: 22.5, inseam: 30, rise: 10   },
      '30':  { waist: 30,   hip: 38,   thigh: 23.5, inseam: 30, rise: 10.5 },
      '32':  { waist: 32,   hip: 40,   thigh: 24.5, inseam: 30, rise: 11   },
      '34':  { waist: 34,   hip: 42,   thigh: 25.5, inseam: 30, rise: 11   },
      '36':  { waist: 36,   hip: 44,   thigh: 26.5, inseam: 30, rise: 11.5 },
    },
  },

  'abercrombie-slim-w': {
    label: 'Abercrombie Slim Jeans (Women)',
    garmentType: 'jeans',
    sizeSystem: 'numeric-us-womens',
    description: 'Slim through hip and thigh, mid-rise.',
    sizes: {
      '00':  { waist: 24,   hip: 32.5, thigh: 20.5, inseam: 30, rise: 9.5  },
      '0':   { waist: 25,   hip: 33.5, thigh: 21,   inseam: 30, rise: 9.5  },
      '2':   { waist: 26,   hip: 34.5, thigh: 21.5, inseam: 30, rise: 9.5  },
      '4':   { waist: 27,   hip: 35.5, thigh: 22,   inseam: 30, rise: 10   },
      '6':   { waist: 28,   hip: 36.5, thigh: 22.5, inseam: 30, rise: 10   },
      '8':   { waist: 29,   hip: 37.5, thigh: 23,   inseam: 30, rise: 10   },
      '10':  { waist: 30,   hip: 38.5, thigh: 23.5, inseam: 30, rise: 10   },
      '12':  { waist: 31.5, hip: 40,   thigh: 24.5, inseam: 30, rise: 10.5 },
      '14':  { waist: 33,   hip: 41.5, thigh: 25.5, inseam: 30, rise: 10.5 },
    },
  },

  'abercrombie-athletic-w': {
    label: 'Abercrombie Athletic Jeans (Women)',
    garmentType: 'jeans',
    sizeSystem: 'numeric-us-womens',
    description: 'Extra room through hip and thigh vs Slim.',
    sizes: {
      '00':  { waist: 24,   hip: 34,   thigh: 22,   inseam: 30, rise: 10   },
      '0':   { waist: 25,   hip: 35,   thigh: 22.5, inseam: 30, rise: 10   },
      '2':   { waist: 26,   hip: 36,   thigh: 23,   inseam: 30, rise: 10   },
      '4':   { waist: 27,   hip: 37,   thigh: 23.5, inseam: 30, rise: 10.5 },
      '6':   { waist: 28,   hip: 38,   thigh: 24,   inseam: 30, rise: 10.5 },
      '8':   { waist: 29,   hip: 39,   thigh: 24.5, inseam: 30, rise: 10.5 },
      '10':  { waist: 30,   hip: 40,   thigh: 25,   inseam: 30, rise: 10.5 },
      '12':  { waist: 31.5, hip: 41.5, thigh: 26,   inseam: 30, rise: 11   },
      '14':  { waist: 33,   hip: 43,   thigh: 27,   inseam: 30, rise: 11   },
    },
  },

  'wrangler-regular': {
    label: 'Wrangler Regular Fit',
    garmentType: 'jeans',
    sizeSystem: 'numeric-waist',
    description: 'Classic Western regular fit.',
    sizes: {
      '28W': { waist: 29,   hip: 40,   thigh: 26,   inseam: 30, rise: 11.5 },
      '30W': { waist: 31,   hip: 42,   thigh: 27,   inseam: 30, rise: 12   },
      '32W': { waist: 33,   hip: 44,   thigh: 28,   inseam: 30, rise: 12   },
      '34W': { waist: 35,   hip: 46,   thigh: 29,   inseam: 30, rise: 12.5 },
      '36W': { waist: 37,   hip: 48,   thigh: 30,   inseam: 30, rise: 13   },
    },
  },

  // ── Chinos ─────────────────────────────────────────────────────────────────

  'dockers-classic': {
    label: 'Dockers Classic Fit Chinos',
    garmentType: 'chinos',
    sizeSystem: 'numeric-waist',
    description: 'Traditional relaxed through seat and thigh.',
    sizes: {
      '30W': { waist: 31,   hip: 43,   thigh: 28,   inseam: 30, rise: 12   },
      '32W': { waist: 33,   hip: 45,   thigh: 29,   inseam: 30, rise: 12   },
      '34W': { waist: 35,   hip: 47,   thigh: 30,   inseam: 30, rise: 12.5 },
      '36W': { waist: 37,   hip: 49,   thigh: 31,   inseam: 30, rise: 13   },
      '38W': { waist: 39,   hip: 51,   thigh: 32,   inseam: 30, rise: 13   },
    },
  },

  'jcrew-484': {
    label: "J.Crew 484 Slim-Fit Chinos",
    garmentType: 'chinos',
    sizeSystem: 'numeric-waist',
    description: 'Slim through seat and thigh, just above the knee.',
    sizes: {
      '28W': { waist: 28.5, hip: 37,   thigh: 23.5, inseam: 30, rise: 10.5 },
      '30W': { waist: 30.5, hip: 39,   thigh: 24.5, inseam: 30, rise: 11   },
      '32W': { waist: 32.5, hip: 41,   thigh: 25.5, inseam: 30, rise: 11   },
      '34W': { waist: 34.5, hip: 43,   thigh: 26.5, inseam: 30, rise: 11.5 },
      '36W': { waist: 36.5, hip: 45,   thigh: 27.5, inseam: 30, rise: 12   },
    },
  },

  // ── Tees ───────────────────────────────────────────────────────────────────

  'uniqlo-tee-m': {
    label: 'Uniqlo Cotton Crew Neck (Men)',
    garmentType: 'tee',
    sizeSystem: 'alpha',
    description: 'Lightweight, relaxed-regular everyday tee.',
    sizes: {
      'XS':  { chest: 37,   torsoLength: 26.5, sleeveLength: 25   },
      'S':   { chest: 40,   torsoLength: 27,   sleeveLength: 25.5 },
      'M':   { chest: 43,   torsoLength: 28,   sleeveLength: 26   },
      'L':   { chest: 46,   torsoLength: 29,   sleeveLength: 26.5 },
      'XL':  { chest: 49,   torsoLength: 30,   sleeveLength: 27   },
      'XXL': { chest: 52,   torsoLength: 31,   sleeveLength: 27.5 },
    },
  },

  'uniqlo-tee-w': {
    label: 'Uniqlo Cotton Crew Neck (Women)',
    garmentType: 'tee',
    sizeSystem: 'alpha',
    description: 'Slightly fitted women\'s everyday tee.',
    sizes: {
      'XS':  { chest: 34,   torsoLength: 23.5, sleeveLength: 24   },
      'S':   { chest: 37,   torsoLength: 24,   sleeveLength: 24.5 },
      'M':   { chest: 40,   torsoLength: 24.5, sleeveLength: 25   },
      'L':   { chest: 43,   torsoLength: 25,   sleeveLength: 25.5 },
      'XL':  { chest: 46,   torsoLength: 25.5, sleeveLength: 26   },
      'XXL': { chest: 49,   torsoLength: 26,   sleeveLength: 26.5 },
    },
  },

  'hanes-beefy': {
    label: 'Hanes Beefy-T',
    garmentType: 'tee',
    sizeSystem: 'alpha',
    description: 'Thick, boxy American classic.',
    sizes: {
      'S':   { chest: 40,   torsoLength: 28.5, sleeveLength: 25.5 },
      'M':   { chest: 43,   torsoLength: 29.5, sleeveLength: 26   },
      'L':   { chest: 46,   torsoLength: 30.5, sleeveLength: 26.5 },
      'XL':  { chest: 50,   torsoLength: 31.5, sleeveLength: 27   },
      '2XL': { chest: 54,   torsoLength: 32.5, sleeveLength: 27.5 },
      '3XL': { chest: 58,   torsoLength: 33.5, sleeveLength: 28   },
    },
  },

  'gildan-ultra': {
    label: 'Gildan Ultra Cotton Tee',
    garmentType: 'tee',
    sizeSystem: 'alpha',
    description: 'Standard boxy unisex tee, workwear weight.',
    sizes: {
      'S':   { chest: 38,   torsoLength: 28, sleeveLength: 25.5 },
      'M':   { chest: 40,   torsoLength: 29, sleeveLength: 26   },
      'L':   { chest: 44,   torsoLength: 30, sleeveLength: 26.5 },
      'XL':  { chest: 48,   torsoLength: 31, sleeveLength: 27   },
      '2XL': { chest: 52,   torsoLength: 32, sleeveLength: 27.5 },
      '3XL': { chest: 56,   torsoLength: 33, sleeveLength: 28   },
    },
  },

  // ── Hoodies / Sweatshirts ──────────────────────────────────────────────────

  'champion-rw-hoodie': {
    label: 'Champion Reverse Weave Hoodie',
    garmentType: 'hoodie',
    sizeSystem: 'alpha',
    description: 'Heavyweight boxy pullover hoodie, runs large.',
    sizes: {
      'XS':  { chest: 41,   torsoLength: 26.5, sleeveLength: 26   },
      'S':   { chest: 44,   torsoLength: 27.5, sleeveLength: 27   },
      'M':   { chest: 47,   torsoLength: 28.5, sleeveLength: 27.5 },
      'L':   { chest: 51,   torsoLength: 29.5, sleeveLength: 28   },
      'XL':  { chest: 55,   torsoLength: 30.5, sleeveLength: 28.5 },
      '2XL': { chest: 59,   torsoLength: 31.5, sleeveLength: 29   },
    },
  },

  'champion-rw-crew': {
    label: 'Champion Reverse Weave Crewneck',
    garmentType: 'sweatshirt',
    sizeSystem: 'alpha',
    description: 'Heavyweight boxy crew sweatshirt, runs large.',
    sizes: {
      'XS':  { chest: 41,   torsoLength: 25.5, sleeveLength: 25.5 },
      'S':   { chest: 44,   torsoLength: 26.5, sleeveLength: 26   },
      'M':   { chest: 47,   torsoLength: 27.5, sleeveLength: 26.5 },
      'L':   { chest: 51,   torsoLength: 28.5, sleeveLength: 27   },
      'XL':  { chest: 55,   torsoLength: 29.5, sleeveLength: 27.5 },
      '2XL': { chest: 59,   torsoLength: 30.5, sleeveLength: 28   },
    },
  },
};

// Sorted list for UI dropdowns — brands grouped by garment type
export function getBrandsForType(garmentType) {
  return Object.entries(BRANDS)
    .filter(([, b]) => b.garmentType === garmentType)
    .map(([key, b]) => ({ key, label: b.label, description: b.description }));
}

export function getSizesForBrand(brandKey) {
  const brand = BRANDS[brandKey];
  if (!brand) return [];
  return Object.keys(brand.sizes);
}

export function getFinishedMeasurements(brandKey, sizeLabel) {
  return BRANDS[brandKey]?.sizes[sizeLabel] ?? null;
}
