// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Soloist Jeans — Straight jeans with scaled skeleton bone vinyl templates.
 * Inspired by Takahiromiyashita The Soloist skeleton-print jeans.
 * Delegates jeans construction to straight-jeans.js, then appends parametric
 * bone template pieces (pelvis, femur, knee, tibia) sized to body measurements
 * for Cricut/vinyl cutting.
 *
 * Bone shapes are sourced from anatomical reference SVGs (Wikimedia Commons),
 * normalized to [0-1] coordinate space, and scaled to body dimensions at
 * render time. Compound paths with fill-rule:evenodd create the obturator
 * foramina holes in the pelvis pieces.
 */

import { polyToPath } from '../engine/geometry.js';
import straightJeans from './straight-jeans.js';

// ── Normalized bone SVG path data ───────────────────────────────────────────
// Full anatomical shapes in [0-1] coordinate space. Pelvis pieces include
// compound sub-paths (outer + 2 holes) for evenodd fill rendering.

const BONE = {
  frontPelvis: 'M 0.4500 0.1500 L 0.4550 0.2800 L 0.4550 0.4200 L 0.4550 0.5799 L 0.4500 0.7200 L 0.4400 0.8399 L 0.4200 0.9299 L 0.3900 0.9799 L 0.3500 1.0000 L 0.3000 0.9700 L 0.2500 0.9400 L 0.2000 0.8900 L 0.1600 0.8399 L 0.1300 0.7800 L 0.1100 0.7200 L 0.1100 0.6599 L 0.1200 0.5999 L 0.1100 0.5600 L 0.0900 0.5799 L 0.0600 0.6100 L 0.0300 0.5600 L 0.0100 0.4999 L 0.0000 0.4300 L 0.0250 0.3400 L 0.0500 0.2600 L 0.0800 0.1900 L 0.1200 0.1300 L 0.1700 0.0800 L 0.2200 0.0401 L 0.2700 0.0200 L 0.3300 0.0000 L 0.3800 0.0000 L 0.4200 0.0000 L 0.4500 0.0500 L 0.5800 0.0000 L 0.6200 0.0000 L 0.6700 0.0000 L 0.7300 0.0200 L 0.7800 0.0401 L 0.8300 0.0800 L 0.8800 0.1300 L 0.9200 0.1900 L 0.9500 0.2600 L 0.9750 0.3400 L 1.0000 0.4300 L 0.9900 0.4999 L 0.9700 0.5600 L 0.9400 0.6100 L 0.9100 0.5799 L 0.8900 0.5600 L 0.8800 0.5999 L 0.8900 0.6599 L 0.8900 0.7200 L 0.8700 0.7800 L 0.8400 0.8399 L 0.8000 0.8900 L 0.7500 0.9400 L 0.7000 0.9700 L 0.6500 1.0000 L 0.6100 0.9799 L 0.5800 0.9299 L 0.5600 0.8399 L 0.5500 0.7200 L 0.5450 0.5799 L 0.5450 0.4200 L 0.5450 0.2800 L 0.5500 0.1500 Z M 0.6300 0.4400 L 0.6200 0.5200 L 0.6300 0.5999 L 0.6600 0.6800 L 0.7000 0.7200 L 0.7500 0.7000 L 0.7900 0.6599 L 0.8200 0.5999 L 0.8300 0.5200 L 0.8200 0.4400 L 0.7900 0.3800 L 0.7500 0.3400 L 0.7000 0.3300 L 0.6600 0.3599 Z M 0.3400 0.3599 L 0.3000 0.3300 L 0.2500 0.3400 L 0.2100 0.3800 L 0.1800 0.4400 L 0.1700 0.5200 L 0.1800 0.5999 L 0.2100 0.6599 L 0.2500 0.7000 L 0.3000 0.7200 L 0.3400 0.6800 L 0.3700 0.5999 L 0.3800 0.5200 L 0.3700 0.4400 Z',
  backPelvis: 'M 0.4388 0.1600 L 0.4490 0.2800 L 0.4541 0.4399 L 0.4541 0.6000 L 0.4490 0.7400 L 0.4439 0.8599 L 0.4286 0.9500 L 0.4082 1.0000 L 0.3673 0.9800 L 0.3061 0.9500 L 0.2449 0.9000 L 0.1837 0.8399 L 0.1327 0.7799 L 0.0816 0.6999 L 0.0408 0.6199 L 0.0102 0.5399 L 0.0000 0.4399 L 0.0204 0.3500 L 0.0612 0.2400 L 0.1122 0.1500 L 0.1735 0.0800 L 0.2347 0.0300 L 0.2959 0.0000 L 0.3571 0.0000 L 0.4082 0.0000 L 0.4388 0.0800 L 0.5918 0.0000 L 0.6429 0.0000 L 0.7041 0.0000 L 0.7653 0.0300 L 0.8265 0.0800 L 0.8878 0.1500 L 0.9388 0.2400 L 0.9796 0.3500 L 1.0000 0.4399 L 0.9898 0.5399 L 0.9592 0.6199 L 0.9184 0.6999 L 0.8673 0.7799 L 0.8163 0.8399 L 0.7551 0.9000 L 0.6939 0.9500 L 0.6327 0.9800 L 0.5918 1.0000 L 0.5714 0.9500 L 0.5561 0.8599 L 0.5510 0.7400 L 0.5459 0.6000 L 0.5459 0.4399 L 0.5510 0.2800 L 0.5612 0.1600 Z M 0.6224 0.3799 L 0.6122 0.4599 L 0.6122 0.5600 L 0.6429 0.6600 L 0.6837 0.7200 L 0.7347 0.7400 L 0.7857 0.6999 L 0.8163 0.6199 L 0.8265 0.5200 L 0.8163 0.4399 L 0.7857 0.3600 L 0.7347 0.3200 L 0.6837 0.3000 L 0.6429 0.3400 Z M 0.3571 0.3400 L 0.3163 0.3000 L 0.2653 0.3200 L 0.2143 0.3600 L 0.1837 0.4399 L 0.1735 0.5200 L 0.1837 0.6199 L 0.2143 0.6999 L 0.2653 0.7400 L 0.3163 0.7200 L 0.3571 0.6600 L 0.3878 0.5600 L 0.3878 0.4599 L 0.3776 0.3799 Z',
  femur: 'M 0.1052 0.0600 L 0.1052 0.0300 L 0.1579 0.0100 L 0.2368 0.0000 L 0.3159 0.0000 L 0.3947 0.0100 L 0.4473 0.0300 L 0.4473 0.0600 L 0.4736 0.0700 L 0.5264 0.0800 L 0.5790 0.0900 L 0.6316 0.0900 L 0.7106 0.0800 L 0.7895 0.0800 L 0.8685 0.0900 L 0.9211 0.1100 L 0.9474 0.1400 L 0.9211 0.1700 L 0.8685 0.1900 L 0.7895 0.2000 L 0.7369 0.2300 L 0.7106 0.2800 L 0.6974 0.3500 L 0.6843 0.4300 L 0.6711 0.5200 L 0.6711 0.6000 L 0.6711 0.6800 L 0.6843 0.7500 L 0.7106 0.8000 L 0.7632 0.8400 L 0.8421 0.8700 L 0.9211 0.9000 L 0.9737 0.9300 L 1.0000 0.9600 L 0.9737 0.9900 L 0.8948 1.0000 L 0.7632 1.0000 L 0.6316 0.9700 L 0.5527 0.9500 L 0.5001 0.9400 L 0.4473 0.9500 L 0.3684 0.9700 L 0.2368 1.0000 L 0.1052 1.0000 L 0.0263 0.9900 L 0.0000 0.9600 L 0.0263 0.9300 L 0.0789 0.9000 L 0.1579 0.8700 L 0.2368 0.8400 L 0.2894 0.8000 L 0.3159 0.7500 L 0.3289 0.6800 L 0.3289 0.6000 L 0.3289 0.5200 L 0.3159 0.4300 L 0.3026 0.3500 L 0.2894 0.2800 L 0.2631 0.2300 L 0.2368 0.2000 L 0.1973 0.1700 L 0.1579 0.1400 L 0.1316 0.1100 L 0.1052 0.0800 Z',
  knee: 'M 0.5000 0.0000 L 0.5800 0.0100 L 0.6600 0.0400 L 0.7399 0.0900 L 0.8199 0.1600 L 0.8799 0.2400 L 0.9400 0.3400 L 1.0000 0.4600 L 0.9800 0.5600 L 0.9400 0.6600 L 0.8799 0.7600 L 0.8000 0.8400 L 0.7200 0.9000 L 0.6199 0.9600 L 0.5000 1.0000 L 0.3801 0.9600 L 0.2800 0.9000 L 0.2000 0.8400 L 0.1199 0.7600 L 0.0600 0.6600 L 0.0200 0.5600 L 0.0000 0.4600 L 0.0600 0.3400 L 0.1199 0.2400 L 0.1799 0.1600 L 0.2599 0.0900 L 0.3400 0.0400 L 0.4200 0.0100 Z',
  tibia: 'M 0.0682 0.0000 L 0.2047 0.0000 L 0.3638 0.0000 L 0.5001 0.0100 L 0.6364 0.0000 L 0.7955 0.0000 L 0.9318 0.0000 L 0.9774 0.0200 L 1.0000 0.0400 L 0.9774 0.0700 L 0.9092 0.1100 L 0.8411 0.1600 L 0.7955 0.2200 L 0.7501 0.3000 L 0.7046 0.4000 L 0.6820 0.4800 L 0.6592 0.5500 L 0.6364 0.6400 L 0.6136 0.7200 L 0.5910 0.8000 L 0.5910 0.8600 L 0.6024 0.9000 L 0.6364 0.9400 L 0.6364 0.9800 L 0.5910 1.0000 L 0.5001 1.0000 L 0.4091 1.0000 L 0.3638 0.9800 L 0.3638 0.9400 L 0.3978 0.9000 L 0.4091 0.8600 L 0.4091 0.8000 L 0.3864 0.7200 L 0.3638 0.6400 L 0.3410 0.5500 L 0.3182 0.4800 L 0.2954 0.4000 L 0.2500 0.3000 L 0.2047 0.2200 L 0.1591 0.1600 L 0.0909 0.1100 L 0.0228 0.0700 L 0.0000 0.0400 L 0.0228 0.0200 Z',
};

// ── Bone geometry helpers ────────────────────────────────────────────────────

/**
 * Scale a normalized [0-1] SVG path string to actual inch dimensions.
 */
function scalePath(normD, w, h) {
  return normD.replace(/([0-9.-]+)\s+([0-9.-]+)/g, (_, x, y) =>
    `${(parseFloat(x) * w).toFixed(3)} ${(parseFloat(y) * h).toFixed(3)}`
  );
}

/**
 * Extract the outer boundary polygon from a normalized path string.
 * Parses only the first M...Z sub-path (for bounding box computation).
 */
function outerPolygon(normD, w, h) {
  const pts = [];
  const re = /([MLZ])\s*(?:([0-9.-]+)\s+([0-9.-]+))?/g;
  let m, started = false;
  while ((m = re.exec(normD))) {
    if (m[1] === 'M') {
      if (started) break;
      started = true;
    }
    if (m[1] === 'Z') break;
    if (m[2] !== undefined) {
      pts.push({ x: parseFloat(m[2]) * w, y: parseFloat(m[3]) * h });
    }
  }
  return pts;
}

/**
 * Build a bone template piece from normalized path data.
 */
function buildBone(normD, w, h) {
  const svgPath = scalePath(normD, w, h);
  const polygon = outerPolygon(normD, w, h);
  return { polygon, svgPath, width: w, height: h };
}

// ── Module ───────────────────────────────────────────────────────────────────

export default {
  id: 'soloist-jeans',
  name: 'Soloist Jeans',
  category: 'lower',
  difficulty: 'intermediate',
  priceTier: 'core',
  measurements: straightJeans.measurements,
  measurementDefaults: straightJeans.measurementDefaults,

  options: {
    ...straightJeans.options,
    ease:       { ...straightJeans.options.ease,        default: 'regular'  },
    legShape:   { ...straightJeans.options.legShape,    default: 'straight' },
    riseStyle:  { ...straightJeans.options.riseStyle,   default: 'mid'      },
    frontPocket:{ ...straightJeans.options.frontPocket,  default: 'square-scoop' },
    yokeStyle:  { ...straightJeans.options.yokeStyle,   default: 'pointed'  },
  },

  pieces(m, opts) {
    const jeansPieces = straightJeans.pieces(m, opts);

    // ── Derive bone dimensions from body measurements ──
    const baseRise  = m.rise || 10;
    const inseam    = m.inseam || 31;
    const hip       = m.hip || 38;
    const thigh     = m.thigh || 22;
    const RISE_OFFSETS = { 'ultra-low': -2.5, low: -1.5, mid: 0, high: 1.5, 'ultra-high': 3.0 };
    const riseOff   = RISE_OFFSETS[opts.riseStyle] ?? 0;
    const rise      = (parseFloat(opts.riseOverride) || (baseRise + riseOff)) + 1.25;

    const hipW      = hip / 4 + 2;
    const upperLeg  = inseam * 0.55;
    const lowerLeg  = inseam * 0.45;
    const boneThick = thigh / 14;

    // ── Generate bone templates ──
    const frontPelvis = buildBone(BONE.frontPelvis, hipW * 2, rise * 0.85);
    const backPelvis  = buildBone(BONE.backPelvis,  hipW * 2, rise * 0.75);
    const femur       = buildBone(BONE.femur,  boneThick * 5, upperLeg);
    const knee        = buildBone(BONE.knee,   boneThick * 4, boneThick * 2.8);
    const tibia       = buildBone(BONE.tibia,  boneThick * 4, lowerLeg);

    jeansPieces.push({
      type: 'template',
      id: 'bone-front-pelvis',
      name: 'Front Pelvis (vinyl)',
      instruction: 'Cut 1 from white HTV. Mirror is built in. Align top edge to waistband seam, center on front.',
      polygon: frontPelvis.polygon,
      svgPath: frontPelvis.svgPath,
      path: polyToPath(frontPelvis.polygon),
      width: frontPelvis.width,
      height: frontPelvis.height,
    });

    jeansPieces.push({
      type: 'template',
      id: 'bone-back-pelvis',
      name: 'Back Pelvis (vinyl)',
      instruction: 'Cut 1 from white HTV. Mirror is built in. Align top edge to waistband seam, center on back.',
      polygon: backPelvis.polygon,
      svgPath: backPelvis.svgPath,
      path: polyToPath(backPelvis.polygon),
      width: backPelvis.width,
      height: backPelvis.height,
    });

    jeansPieces.push({
      type: 'template',
      id: 'bone-femur',
      name: 'Femur (vinyl)',
      instruction: 'Cut 2 from white HTV (1 + 1 mirror). Position below pelvis, centered on thigh.',
      polygon: femur.polygon,
      svgPath: femur.svgPath,
      path: polyToPath(femur.polygon),
      width: femur.width,
      height: femur.height,
    });

    jeansPieces.push({
      type: 'template',
      id: 'bone-knee',
      name: 'Knee Joint (vinyl)',
      instruction: 'Cut 2 from white HTV (1 + 1 mirror). Center on knee between femur and tibia.',
      polygon: knee.polygon,
      svgPath: knee.svgPath,
      path: polyToPath(knee.polygon),
      width: knee.width,
      height: knee.height,
    });

    jeansPieces.push({
      type: 'template',
      id: 'bone-tibia',
      name: 'Tibia (vinyl)',
      instruction: 'Cut 2 from white HTV (1 + 1 mirror). Position below knee, centered on shin.',
      polygon: tibia.polygon,
      svgPath: tibia.svgPath,
      path: polyToPath(tibia.polygon),
      width: tibia.width,
      height: tibia.height,
    });

    return jeansPieces;
  },

  materials(m, opts) {
    const base = straightJeans.materials(m, opts);
    base.notions = base.notions || [];
    base.notions.push(
      { name: 'White HTV vinyl', quantity: '2 yards', notes: 'Heat transfer vinyl for skeleton print. Siser Easyweed or equivalent.' },
      { name: 'Parchment/Teflon sheet', quantity: '1', notes: 'Protects vinyl during heat press application' },
    );
    base.notes = base.notes || [];
    base.notes.push(
      'Apply HTV vinyl AFTER constructing the jeans. Press at 305F for 15 seconds with medium pressure.',
      'For best results, apply pelvis piece first, then femurs, knees, and tibias working downward.',
      'Let each section cool completely before peeling the carrier sheet.',
      'Use the bone template pieces as cut guides in Cricut Design Space. Import the SVGs and set material to HTV.',
    );
    return base;
  },

  instructions(m, opts) {
    const base = straightJeans.instructions(m, opts);
    const n = base.length + 1;
    base.push({
      step: n, title: 'Apply skeleton vinyl',
      detail: 'Cut all bone pieces from white HTV vinyl using a Cricut or similar cutter. Weed excess vinyl. Position the front pelvis centered on the front panels at the waistband. Apply with heat press or iron at 305F for 15 seconds. Peel carrier sheet when cool. Repeat for femurs on each thigh, knee joints at the knee, and tibias on each shin. Mirror one femur, knee, and tibia for the opposite leg. Repeat the full bone layout on the back panels using the back pelvis template.',
    });
    return base;
  },
};
