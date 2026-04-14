// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Garment release dates.
 * Maps garment ID to ISO release date. The single source of truth for
 * "newest" ordering on the landing page Newest Patterns carousel.
 * Add new entries here as garments ship. Missing entries are treated as
 * undated and sort to the bottom.
 */

export const RELEASE_DATES = {
  'zippered-pouch':     '2026-04-14',
  'turtleneck':         '2026-04-14',
  'trapeze-dress-w':    '2026-04-14',
  'scrunchie':          '2026-04-14',
  'pajama-pants':       '2026-04-14',
  'mini-skirt-w':       '2026-04-14',
  'maxi-skirt-w':       '2026-04-14',
  'lounge-shorts':      '2026-04-14',
  'kids-tee':           '2026-04-14',
  'kids-shorts':        '2026-04-14',
  'kids-leggings':      '2026-04-14',
  'kids-joggers':       '2026-04-14',
  'kids-dress':         '2026-04-14',
  'dolman-top-w':       '2026-04-14',
  'dog-bandana':        '2026-04-14',
  'scholar-sweatpants': '2026-04-13',
  'scholar-hoodie':     '2026-04-13',
  'wide-leg-trouser-m': '2026-04-08',
  'open-cardigan':      '2026-04-08',
  'henley':             '2026-04-08',
  'chore-coat':         '2026-04-08',
  'soloist-jeans':      '2026-04-06',
};

/**
 * Returns the IDs of the N newest garments present in the given registry,
 * sorted most recent first. Garments without a RELEASE_DATES entry are
 * skipped. Falls back gracefully if a listed ID is missing from the registry
 * (e.g. removed or renamed).
 */
export function getNewestGarmentIds(garments, limit = 7) {
  return Object.keys(RELEASE_DATES)
    .filter(id => garments[id])
    .sort((a, b) => {
      const cmp = RELEASE_DATES[b].localeCompare(RELEASE_DATES[a]);
      return cmp !== 0 ? cmp : a.localeCompare(b);
    })
    .slice(0, limit);
}
