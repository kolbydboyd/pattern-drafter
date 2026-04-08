// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Fit Library — public API.
 *
 * Three paths for deriving ease from a reference garment:
 *   1. Brand + size lookup  → deriveEaseFromBrand()
 *   2. Measure your own garment (flat-lay) → deriveEaseFromFlatLay()
 *   3. Community submission → deriveEaseFromCommunity()
 *
 * In all cases the output is a { snappedValue, numericEase, easePerMeasurement,
 * hasNegativeEase, primaryMeasurement } object that the UI uses to:
 *   a) set the garment's ease/fit select to `snappedValue`
 *   b) display the numeric ease to the user
 *   c) optionally warn about stretch requirements
 */

import {
  FIT_PROFILES,
  FLAT_LAY_FIELDS,
  CIRCUMFERENCE_MEASUREMENTS,
  GARMENT_TYPE_MAP,
  EASE_OPTION_KEY,
} from './profiles.js';

import { getFinishedMeasurements } from './brands.js';

// Re-export everything callers need
export {
  GARMENT_TYPE_MAP,
  EASE_OPTION_KEY,
  FIT_PROFILES,
  FLAT_LAY_FIELDS,
  CIRCUMFERENCE_MEASUREMENTS,
} from './profiles.js';

export {
  BRANDS,
  getBrandsForType,
  getSizesForBrand,
  getFinishedMeasurements,
} from './brands.js';

// ── Core derivation ──────────────────────────────────────────────────────────

/**
 * Convert flat-lay measurements to finished circumference measurements.
 * Flat-lay is the reading across a garment laid on a flat surface.
 * For circumference measurements: finished = flat-lay × 2.
 * For linear measurements: finished = flat-lay (no conversion).
 *
 * @param {Object.<string, number>} flatLay - e.g. { waist: 13.5, hip: 17, inseam: 30 }
 * @returns {Object.<string, number>} finished measurements in inches
 */
export function flatLayToFinished(flatLay) {
  const finished = {};
  for (const [id, value] of Object.entries(flatLay)) {
    if (value == null || value === '' || isNaN(Number(value))) continue;
    const v = Number(value);
    finished[id] = CIRCUMFERENCE_MEASUREMENTS.has(id) ? v * 2 : v;
  }
  return finished;
}

/**
 * Compute per-measurement ease from finished garment measurements minus body measurements.
 * Positive ease = garment is larger than body (typical for most woven garments).
 * Negative ease = garment is smaller (stretch fabric required).
 *
 * @param {Object.<string, number>} finished
 * @param {Object.<string, number>} body
 * @returns {Object.<string, number>} ease per measurement ID
 */
export function deriveEasePerMeasurement(finished, body) {
  const ease = {};
  for (const [id, finVal] of Object.entries(finished)) {
    if (body[id] != null && body[id] > 0) {
      ease[id] = parseFloat((finVal - body[id]).toFixed(2));
    }
  }
  return ease;
}

/**
 * Snap a numeric ease value to the nearest named fit profile for a garment type.
 * For stretch garments (negative primary ease) we clamp to the tightest
 * positive-ease profile and surface a `needsStretch` flag.
 *
 * @param {number} numericEase - Derived ease on the primary measurement (inches)
 * @param {string} garmentType - e.g. 'jeans', 'tee'
 * @returns {{ value: string, label: string, ease: number, needsStretch: boolean } | null}
 */
export function snapToProfile(numericEase, garmentType) {
  const profiles = FIT_PROFILES[garmentType];
  if (!profiles?.length) return null;

  const needsStretch = numericEase < 0;
  const searchEase   = needsStretch ? 0 : numericEase;

  let closest = profiles[0];
  let minDist = Math.abs(searchEase - profiles[0].ease);
  for (const p of profiles.slice(1)) {
    const d = Math.abs(searchEase - p.ease);
    if (d < minDist) { minDist = d; closest = p; }
  }
  return { ...closest, needsStretch };
}

/**
 * Full ease derivation pipeline.
 * Given finished garment measurements, body measurements, and a garment type:
 *   1. Compute ease per measurement
 *   2. Identify the primary ease measurement (hip or chest)
 *   3. Snap to nearest fit profile
 *
 * @param {Object.<string, number>} finished
 * @param {Object.<string, number>} body
 * @param {string} garmentType
 * @returns {{
 *   easePerMeasurement: Object,
 *   primaryMeasurement: string,
 *   numericEase: number,
 *   snappedValue: string | null,
 *   snappedLabel: string | null,
 *   needsStretch: boolean,
 *   optionKey: string | null,
 * }}
 */
export function deriveEase(finished, body, garmentType) {
  const easePerMeasurement = deriveEasePerMeasurement(finished, body);
  const fieldDef = FLAT_LAY_FIELDS[garmentType];
  const primaryMeasurement = fieldDef?.primaryEase ?? 'hip';
  const numericEase = easePerMeasurement[primaryMeasurement] ?? 0;
  const snapped = snapToProfile(numericEase, garmentType);
  const optionKey = EASE_OPTION_KEY[garmentType] ?? null;

  return {
    easePerMeasurement,
    primaryMeasurement,
    numericEase,
    snappedValue: snapped?.value ?? null,
    snappedLabel: snapped?.label ?? null,
    needsStretch:  snapped?.needsStretch ?? false,
    optionKey,
  };
}

/**
 * Derive ease from a brand/size reference + body measurements.
 *
 * @param {string} brandKey - Key from brands.js BRANDS object
 * @param {string} sizeLabel - Size string e.g. '32W', 'M', '00'
 * @param {Object.<string, number>} body - Body measurements from wizard
 * @param {string} garmentType
 * @returns {ReturnType<typeof deriveEase> | null}
 */
export function deriveEaseFromBrand(brandKey, sizeLabel, body, garmentType) {
  const finished = getFinishedMeasurements(brandKey, sizeLabel);
  if (!finished) return null;
  return deriveEase(finished, body, garmentType);
}

/**
 * Derive ease from flat-lay measurements + body measurements.
 *
 * @param {Object.<string, number>} flatLay - Raw flat-lay readings (half-circumferences)
 * @param {Object.<string, number>} body
 * @param {string} garmentType
 * @returns {ReturnType<typeof deriveEase>}
 */
export function deriveEaseFromFlatLay(flatLay, body, garmentType) {
  const finished = flatLayToFinished(flatLay);
  return deriveEase(finished, body, garmentType);
}

/**
 * Derive ease from community garment data (already in finished measurements).
 *
 * @param {Object.<string, number>} communityMeasurements - Finished measurements from Supabase
 * @param {Object.<string, number>} body
 * @param {string} garmentType
 * @returns {ReturnType<typeof deriveEase>}
 */
export function deriveEaseFromCommunity(communityMeasurements, body, garmentType) {
  return deriveEase(communityMeasurements, body, garmentType);
}

/**
 * Get the fit-library garment type from a garment module ID.
 *
 * @param {string} garmentId - e.g. 'straight-jeans', 'tee'
 * @returns {string | null}
 */
export function getGarmentType(garmentId) {
  return GARMENT_TYPE_MAP[garmentId] ?? null;
}

/**
 * Format a derived ease result into a human-readable summary string.
 *
 * @param {ReturnType<typeof deriveEase>} result
 * @returns {string}
 */
export function formatEaseSummary(result) {
  if (!result) return '';
  const { numericEase, primaryMeasurement, snappedLabel, needsStretch } = result;
  const sign = numericEase >= 0 ? '+' : '';
  const measLabel = primaryMeasurement === 'chest' ? 'chest' : 'hip';
  const base = `${snappedLabel} fit. ${sign}${numericEase.toFixed(1)}" ${measLabel} ease.`;
  return needsStretch
    ? `${base} Reference uses stretch fabric. Woven pattern will use minimum ease.`
    : base;
}
