// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
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
    min: 16, max: 60, step: 0.25, default: 32,
  },
  hip: {
    id: 'hip',
    label: 'Hip (fullest)',
    instruction: 'Around the fullest part of your seat and hips, standing.',
    category: 'lower',
    min: 18, max: 70, step: 0.25, default: 36,
  },
  rise: {
    id: 'rise',
    label: 'Rise (crotch depth)',
    instruction: 'Sit on a flat chair. Measure your SIDE from waist to the chair surface.',
    category: 'lower',
    min: 4, max: 18, step: 0.25, default: 10,
  },
  thigh: {
    id: 'thigh',
    label: 'Thigh circumference',
    instruction: 'Around the fullest part of your thigh, standing relaxed.',
    category: 'lower',
    min: 10, max: 40, step: 0.25, default: 22,
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
    min: 18, max: 65, step: 0.25, default: 38,
  },
  shoulder: {
    id: 'shoulder',
    label: 'Shoulder width',
    instruction: 'Across back from shoulder point to shoulder point (where arm meets body).',
    category: 'upper',
    min: 8, max: 24, step: 0.25, default: 18,
  },
  neck: {
    id: 'neck',
    label: 'Neck circumference',
    instruction: 'Around the base of your neck, where a collar sits.',
    category: 'upper',
    min: 9, max: 22, step: 0.25, default: 15.5,
  },
  sleeveLength: {
    id: 'sleeveLength',
    label: 'Sleeve length',
    instruction: 'From shoulder point to desired cuff, arm slightly bent.',
    category: 'upper',
    min: 4, max: 38, step: 0.5, default: 25,
  },
  bicep: {
    id: 'bicep',
    label: 'Bicep circumference',
    instruction: 'Around the fullest part of your bicep, arm relaxed at side.',
    category: 'upper',
    min: 6, max: 22, step: 0.25, default: 13,
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
    min: 8, max: 26, step: 0.25, default: 18,
  },

  // ── Optional — Lower Body ──
  outseam: {
    id: 'outseam',
    label: 'Outseam',
    instruction: 'Outer leg from natural waist to ankle bone, standing straight.',
    category: 'lower',
    optional: true,
    min: 18, max: 48, step: 0.25, default: 40,
  },
  calf: {
    id: 'calf',
    label: 'Calf circumference',
    instruction: 'Around the widest part of your calf, standing relaxed.',
    category: 'lower',
    optional: true,
    min: 10, max: 24, step: 0.25, default: 14,
  },
  ankle: {
    id: 'ankle',
    label: 'Ankle circumference',
    instruction: 'Around the ankle bone (the bony knob on the side).',
    category: 'lower',
    optional: true,
    min: 7, max: 16, step: 0.25, default: 10,
  },
  seatDepth: {
    id: 'seatDepth',
    label: 'Seat depth',
    instruction: 'From natural waist straight down to the fullest part of your hips/seat.',
    category: 'lower',
    optional: true,
    min: 4, max: 14, step: 0.25, default: 7,
  },
  crotchArc: {
    id: 'crotchArc',
    label: 'Crotch arc (total rise)',
    instruction: 'From center-front waist, pass the tape between your legs, and bring it up to center-back waist.',
    category: 'lower',
    optional: true,
    min: 20, max: 45, step: 0.25, default: 27,
  },

  // ── Optional — Upper Body ──
  waistToArmpit: {
    id: 'waistToArmpit',
    label: 'Waist to armpit',
    instruction: 'From natural waist straight up to the crease of your armpit, arm relaxed at side.',
    category: 'upper',
    optional: true,
    min: 5, max: 14, step: 0.25, default: 8,
  },
  crossBack: {
    id: 'crossBack',
    label: 'Cross-back width',
    instruction: 'Across back between the two armhole creases, arms relaxed at sides.',
    category: 'upper',
    optional: true,
    min: 12, max: 22, step: 0.25, default: 16,
  },
  armToElbow: {
    id: 'armToElbow',
    label: 'Arm to elbow',
    instruction: 'From shoulder point (where sleeve joins body) to elbow point, arm slightly bent.',
    category: 'upper',
    optional: true,
    min: 10, max: 18, step: 0.25, default: 14,
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

  // ── Accessory — Bag Dimensions ──
  bagWidth: {
    id: 'bagWidth',
    label: 'Width (bottom & top)',
    instruction: 'Finished outer width of the bag.',
    category: 'accessory',
    min: 8, max: 20, step: 0.5, default: 14,
  },
  bagHeight: {
    id: 'bagHeight',
    label: 'Height',
    instruction: 'Finished outer height (excluding straps).',
    category: 'accessory',
    min: 8, max: 22, step: 0.5, default: 15,
  },
  bagDepth: {
    id: 'bagDepth',
    label: 'Depth / Gusset',
    instruction: '0 = completely flat. 4 to 6 = most popular flat bottom.',
    category: 'accessory',
    min: 0, max: 8, step: 0.5, default: 4,
  },
  strapWidth: {
    id: 'strapWidth',
    label: 'Strap Width',
    instruction: 'Finished width of straps.',
    category: 'accessory',
    min: 1, max: 3, step: 0.25, default: 1.5,
  },
  strapLength: {
    id: 'strapLength',
    label: 'Strap Length',
    instruction: 'Shoulder drop (or total fabric length if you prefer).',
    category: 'accessory',
    min: 20, max: 60, step: 1, default: 28,
  },
};

/**
 * Optional measurements keyed by id.
 * These never appear in a garment's required `measurements` array.
 * Garment modules check for their presence and fall back to derived values.
 *
 * @type {Object.<string, { id: string, label: string, category: string, optional: true }>}
 */
export const OPTIONAL_MEASUREMENTS = Object.fromEntries(
  Object.entries(MEASUREMENTS).filter(([, v]) => v.optional)
);

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
