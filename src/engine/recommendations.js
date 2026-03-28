// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Pattern recommendations by body block.
 * Garments that share a body block fit with the same confidence —
 * once a user trusts the lower-body block, every other lower-body
 * garment is a low-risk next purchase.
 */

const BODY_BLOCKS = {
  'lower-body': [
    'cargo-shorts', 'gym-shorts', 'swim-trunks', 'pleated-shorts',
    'straight-jeans', 'chinos', 'pleated-trousers', 'sweatpants',
    'wide-leg-trouser-w', 'straight-trouser-w', 'easy-pant-w',
  ],
  'upper-body': [
    'tee', 'camp-shirt', 'crewneck', 'hoodie', 'crop-jacket',
    'button-up-w', 'shell-blouse-w', 'fitted-tee-w',
  ],
  'combined': [
    'shirt-dress-w', 'wrap-dress-w',
  ],
  'skirt': [
    'slip-skirt-w', 'a-line-skirt-w',
  ],
};

// Reverse map: garmentId → block name
const GARMENT_BLOCK = {};
for (const [block, ids] of Object.entries(BODY_BLOCKS)) {
  for (const id of ids) GARMENT_BLOCK[id] = block;
}

/**
 * Return up to `limit` garments from the same body block as `garmentId`
 * that the user hasn't purchased yet.
 *
 * Falls back to other blocks if the same block is exhausted.
 *
 * @param {string}   garmentId    – the anchor garment
 * @param {string[]} purchasedIds – garment IDs the user already owns
 * @param {number}   limit        – how many to return (default 3)
 * @returns {string[]} garment IDs
 */
export function getRecommendations(garmentId, purchasedIds = [], limit = 3) {
  const purchased = new Set(purchasedIds);
  const block     = GARMENT_BLOCK[garmentId];

  // Candidates: same block first, then other blocks
  const sameBlock  = block ? (BODY_BLOCKS[block] || []).filter(id => id !== garmentId && !purchased.has(id)) : [];
  const otherBlock = Object.entries(BODY_BLOCKS)
    .filter(([b]) => b !== block)
    .flatMap(([, ids]) => ids)
    .filter(id => !purchased.has(id));

  return [...sameBlock, ...otherBlock].slice(0, limit);
}

/**
 * Return the block name for a garment (useful for UI labels).
 * @param {string} garmentId
 * @returns {string|null}
 */
export function getBodyBlock(garmentId) {
  return GARMENT_BLOCK[garmentId] ?? null;
}

/**
 * Return all garments in the same block as `garmentId`.
 * @param {string} garmentId
 * @returns {string[]}
 */
export function getBlockSiblings(garmentId) {
  const block = GARMENT_BLOCK[garmentId];
  if (!block) return [];
  return (BODY_BLOCKS[block] || []).filter(id => id !== garmentId);
}
