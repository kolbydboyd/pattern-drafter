// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Standard children's body measurement profiles by size (2T–14).
 *
 * All values in inches. These are body measurements, not finished garment
 * measurements — ease is applied by each garment module.
 *
 * Sources: ASTM D4910 (standard children's sizing), industry RTW averages,
 * and common indie sewing pattern size charts.
 *
 * Each size entry includes all measurements used by the kids garment modules:
 *   chest, waist, hip, shoulder, neck, bicep, torsoLength, sleeveLength,
 *   rise, thigh, inseam, fullLength (shoulder-to-floor, for dresses)
 *
 * @type {Record<string, {
 *   label: string, chest: number, waist: number, hip: number,
 *   shoulder: number, neck: number, bicep: number, torsoLength: number,
 *   sleeveLength: number, rise: number, thigh: number, inseam: number,
 *   fullLength: number
 * }>}
 */
export const CHILDREN_SIZES = {
  '2T': {
    label: '2T (approx. 2 years)',
    chest: 21, waist: 20,   hip: 21,   shoulder: 9,    neck: 10,
    bicep: 6.5, torsoLength: 10,  sleeveLength: 9,  rise: 5,
    thigh: 12,  inseam: 10, fullLength: 22,
  },
  '3T': {
    label: '3T (approx. 3 years)',
    chest: 22, waist: 20.5, hip: 22,   shoulder: 9.5,  neck: 10.5,
    bicep: 7,   torsoLength: 11,  sleeveLength: 10, rise: 5.5,
    thigh: 13,  inseam: 12, fullLength: 24,
  },
  '4T': {
    label: '4T (approx. 4 years)',
    chest: 23, waist: 21,   hip: 23,   shoulder: 10,   neck: 11,
    bicep: 7.5, torsoLength: 11.5, sleeveLength: 11, rise: 6,
    thigh: 14,  inseam: 13, fullLength: 26,
  },
  '5': {
    label: '5 (approx. 4–5 years)',
    chest: 24, waist: 21.5, hip: 24,   shoulder: 10.5, neck: 11.5,
    bicep: 8,   torsoLength: 12,  sleeveLength: 12, rise: 6.5,
    thigh: 15,  inseam: 14, fullLength: 27,
  },
  '6': {
    label: '6 (approx. 5–6 years)',
    chest: 25, waist: 22,   hip: 25,   shoulder: 11,   neck: 12,
    bicep: 8.5, torsoLength: 12.5, sleeveLength: 13, rise: 7,
    thigh: 16,  inseam: 15, fullLength: 28,
  },
  '7': {
    label: '7 (approx. 6–7 years)',
    chest: 26, waist: 22.5, hip: 26,   shoulder: 11.5, neck: 12.5,
    bicep: 9,   torsoLength: 13,  sleeveLength: 14, rise: 7.5,
    thigh: 17,  inseam: 16, fullLength: 29,
  },
  '8': {
    label: '8 (approx. 7–8 years)',
    chest: 27, waist: 23,   hip: 27,   shoulder: 12,   neck: 13,
    bicep: 9.5, torsoLength: 13.5, sleeveLength: 15, rise: 8,
    thigh: 18,  inseam: 18, fullLength: 30,
  },
  '10': {
    label: '10 (approx. 9–10 years)',
    chest: 28.5, waist: 23.5, hip: 28.5, shoulder: 12.5, neck: 13.5,
    bicep: 10,   torsoLength: 14,   sleeveLength: 17,  rise: 8.5,
    thigh: 19.5, inseam: 20,  fullLength: 33,
  },
  '12': {
    label: '12 (approx. 11–12 years)',
    chest: 30, waist: 24.5, hip: 30,   shoulder: 13,   neck: 14,
    bicep: 10.5, torsoLength: 15,  sleeveLength: 19, rise: 9,
    thigh: 21,   inseam: 22, fullLength: 36,
  },
  '14': {
    label: '14 (approx. 13–14 years)',
    chest: 32, waist: 25.5, hip: 32,   shoulder: 14,   neck: 14.5,
    bicep: 11,   torsoLength: 16,  sleeveLength: 21, rise: 9.5,
    thigh: 22.5, inseam: 24, fullLength: 38,
  },
};

/**
 * Ordered list of size keys for UI iteration.
 * @type {string[]}
 */
export const CHILDREN_SIZE_ORDER = ['2T', '3T', '4T', '5', '6', '7', '8', '10', '12', '14'];

/**
 * Return the best-matching size label given a chest measurement.
 * Returns the size whose chest value is closest to the input.
 *
 * @param {number} chestInches
 * @returns {string} size key (e.g. '6')
 */
export function sizeFromChest(chestInches) {
  return CHILDREN_SIZE_ORDER.reduce((best, key) => {
    const diff = Math.abs(CHILDREN_SIZES[key].chest - chestInches);
    const bestDiff = Math.abs(CHILDREN_SIZES[best].chest - chestInches);
    return diff < bestDiff ? key : best;
  });
}
