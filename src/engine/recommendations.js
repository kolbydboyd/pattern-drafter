// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Pattern recommendations — data-driven, based on garment metadata.
 *
 * Replaces the hand-maintained BODY_BLOCKS map with category + measurement-
 * overlap scoring so all garments in the registry get sensible results
 * automatically as new garments are added.
 *
 * Strategy:
 *  - Similar:       same category + same audience, sorted by measurement overlap
 *  - Complementary: paired category (upper↔lower, dress→accessory, accessory→lower),
 *                   same audience, sorted by overlap
 *  - Fill:          up to (limit-1) similar, then at least 1 complementary;
 *                   if fewer similar exist, fill remaining slots from complementary
 */

import GARMENTS from '../garments/index.js';

/** Paired categories for cross-category "you might also need" suggestions. */
const COMPLEMENTARY = {
  upper:     'lower',
  lower:     'upper',
  dress:     'accessory',
  accessory: 'lower',
};

/**
 * Count shared measurement keys between two garments.
 * Garments with no measurements (e.g. scrunchie) score 0 — correct, since
 * there is no fitting overlap to speak of.
 *
 * @param {string[]} anchorMeas    - measurements array of the anchor garment
 * @param {string[]} candidateMeas - measurements array of the candidate
 * @returns {number}
 */
function measurementOverlap(anchorMeas, candidateMeas) {
  if (!anchorMeas?.length || !candidateMeas?.length) return 0;
  const anchorSet = new Set(anchorMeas);
  let count = 0;
  for (const m of candidateMeas) {
    if (anchorSet.has(m)) count++;
  }
  return count;
}

/**
 * Return up to `limit` recommended garment IDs for a given anchor garment.
 *
 * @param {string}   garmentId    - the anchor garment
 * @param {string[]} purchasedIds - garment IDs the user already owns
 * @param {number}   limit        - how many to return (default 3)
 * @returns {string[]} garment IDs
 */
export function getRecommendations(garmentId, purchasedIds = [], limit = 3) {
  const anchor = GARMENTS[garmentId];
  if (!anchor) return [];

  const purchased = new Set(purchasedIds);
  const anchorAudience = anchor.audience || null;
  const anchorMeas = anchor.measurements || [];

  // Pool: base garments only (no style variants), excluding anchor + purchased
  const pool = Object.values(GARMENTS).filter(g =>
    !g._baseId
    && g.id !== garmentId
    && !purchased.has(g.id)
  );

  const byOverlapDesc = (a, b) =>
    measurementOverlap(anchorMeas, b.measurements || []) -
    measurementOverlap(anchorMeas, a.measurements || []);

  const sameAudience = g => (g.audience || null) === anchorAudience;

  const similar = pool
    .filter(g => g.category === anchor.category && sameAudience(g))
    .sort(byOverlapDesc);

  const compCategory = COMPLEMENTARY[anchor.category];
  const complementary = compCategory
    ? pool
        .filter(g => g.category === compCategory && sameAudience(g))
        .sort(byOverlapDesc)
    : [];

  const result = similar.slice(0, limit - 1);
  result.push(...complementary.slice(0, limit - result.length));

  return result.map(g => g.id);
}

// Stub exports retained for any future external callers.
export function getBodyBlock(_garmentId) { return null; }
export function getBlockSiblings(_garmentId) { return []; }
