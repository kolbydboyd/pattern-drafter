/**
 * Measurement definitions for all garment types.
 *
 * All measurements are in inches. Each entry describes a single body measurement:
 *   id          — machine-readable key, matches the property name
 *   label       — display name shown in the UI
 *   instruction — how-to-measure guidance shown alongside the input field
 *   category    — 'lower' | 'upper' | 'full' — used to filter measurements per garment
 *   min/max     — validation bounds; inputs outside this range are flagged
 *   step        — input increment (0.25 or 0.5 inches)
 *   default     — pre-filled value for a median adult body
 *
 * @type {Object.<string, { id: string, label: string, instruction: string,
 *   category: string, min: number, max: number, step: number, default: number }>}
 */
export const MEASUREMENTS = {
  // ── Lower Body ──
  waist: {
    id: 'waist',
    label: 'Waist',
    instruction: 'Around your natural waist where you want the garment to sit.',
    category: 'lower',
    min: 22, max: 60, step: 0.25, default: 32,
  },
  hip: {
    id: 'hip',
    label: 'Hip (fullest)',
    instruction: 'Around the fullest part of your seat and hips, standing.',
    category: 'lower',
    min: 28, max: 70, step: 0.25, default: 36,
  },
  rise: {
    id: 'rise',
    label: 'Rise (crotch depth)',
    instruction: 'Sit on a flat chair. Measure your SIDE from waist to the chair surface.',
    category: 'lower',
    min: 7, max: 18, step: 0.25, default: 10,
  },
  thigh: {
    id: 'thigh',
    label: 'Thigh circumference',
    instruction: 'Around the fullest part of your thigh, standing relaxed.',
    category: 'lower',
    min: 16, max: 40, step: 0.25, default: 22,
  },
  inseam: {
    id: 'inseam',
    label: 'Inseam',
    instruction: 'Inside leg from crotch to desired hem length.',
    category: 'lower',
    min: 3, max: 36, step: 0.5, default: 7,
  },
  knee: {
    id: 'knee',
    label: 'Knee circumference',
    instruction: 'Around your knee, leg slightly bent.',
    category: 'lower',
    min: 12, max: 30, step: 0.25, default: 15,
  },

  // ── Upper Body ──
  chest: {
    id: 'chest',
    label: 'Chest (fullest)',
    instruction: 'Around the fullest part of your chest, under arms, standing relaxed.',
    category: 'upper',
    min: 30, max: 65, step: 0.25, default: 38,
  },
  shoulder: {
    id: 'shoulder',
    label: 'Shoulder width',
    instruction: 'Across back from shoulder point to shoulder point (where arm meets body).',
    category: 'upper',
    min: 14, max: 24, step: 0.25, default: 18,
  },
  neck: {
    id: 'neck',
    label: 'Neck circumference',
    instruction: 'Around the base of your neck, where a collar sits.',
    category: 'upper',
    min: 13, max: 22, step: 0.25, default: 15.5,
  },
  sleeveLength: {
    id: 'sleeveLength',
    label: 'Sleeve length',
    instruction: 'From shoulder point to desired cuff, arm slightly bent.',
    category: 'upper',
    min: 6, max: 38, step: 0.5, default: 25,
  },
  bicep: {
    id: 'bicep',
    label: 'Bicep circumference',
    instruction: 'Around the fullest part of your bicep, arm relaxed at side.',
    category: 'upper',
    min: 10, max: 22, step: 0.25, default: 13,
  },
  wrist: {
    id: 'wrist',
    label: 'Wrist circumference',
    instruction: 'Around your wrist at the wrist bone.',
    category: 'upper',
    min: 5.5, max: 10, step: 0.25, default: 7,
  },
  torsoLength: {
    id: 'torsoLength',
    label: 'Torso length',
    instruction: 'From shoulder (where collar sits) straight down to waist.',
    category: 'upper',
    min: 14, max: 26, step: 0.25, default: 18,
  },

  // ── Full Body (dresses) ──
  fullLength: {
    id: 'fullLength',
    label: 'Full length',
    instruction: 'From shoulder to desired hem (for dresses).',
    category: 'full',
    min: 28, max: 60, step: 0.5, default: 40,
  },
  skirtLength: {
    id: 'skirtLength',
    label: 'Skirt length',
    instruction: 'From waist to desired hem.',
    category: 'lower',
    min: 12, max: 45, step: 0.5, default: 22,
  },
};

/**
 * Canonical measurement lists by garment category.
 * Garment modules declare their `measurements` array from one of these sets,
 * or define a custom subset.
 *
 * Keys:
 *   lower         — shorts and basic pants (no knee)
 *   lower-pants   — fitted trousers and jeans (adds knee)
 *   lower-skirt   — skirts (waist, hip, skirtLength only)
 *   upper         — tops without wrist measurement
 *   upper-long    — tops where wrist matters (fitted shirts, jackets)
 *   dress         — full-body garments combining upper + lower fields
 *
 * @type {Object.<string, string[]>}
 */
export const GARMENT_MEASUREMENTS = {
  lower: ['waist', 'hip', 'rise', 'thigh', 'inseam'],
  'lower-pants': ['waist', 'hip', 'rise', 'thigh', 'inseam', 'knee'],
  'lower-skirt': ['waist', 'hip', 'skirtLength'],
  upper: ['chest', 'shoulder', 'neck', 'sleeveLength', 'bicep', 'torsoLength'],
  'upper-long': ['chest', 'shoulder', 'neck', 'sleeveLength', 'bicep', 'wrist', 'torsoLength'],
  dress: ['chest', 'shoulder', 'neck', 'waist', 'hip', 'sleeveLength', 'bicep', 'fullLength'],
};
