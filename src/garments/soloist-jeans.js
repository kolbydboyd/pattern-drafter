// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Soloist Jeans — Straight jeans with scaled skeleton bone vinyl templates.
 * Inspired by Takahiromiyashita The Soloist skeleton-print jeans.
 * Delegates jeans construction to straight-jeans.js, then appends parametric
 * bone template pieces (pelvis, femur, knee, tibia) sized to body measurements
 * for Cricut/vinyl cutting.
 *
 * Bone shapes are defined as normalized coordinates (0-1) and scaled to body
 * dimensions. Compound paths with fill-rule:evenodd create holes (obturator
 * foramina in the pelvis, intercondylar notch in femur).
 */

import { polyToPath } from '../engine/geometry.js';
import straightJeans from './straight-jeans.js';

// ── Bone geometry helpers ────────────────────────────────────────────────────

/**
 * Scale normalized [0-1] coordinate pairs to actual dimensions.
 * @param {Array<[number,number]>} pts  — normalized [x, y] pairs
 * @param {number} w — actual width in inches
 * @param {number} h — actual height in inches
 * @param {number} ox — x offset (default 0)
 * @param {number} oy — y offset (default 0)
 */
function scale(pts, w, h, ox = 0, oy = 0) {
  return pts.map(([x, y]) => ({ x: ox + x * w, y: oy + y * h }));
}

/**
 * Mirror normalized points horizontally (flip x around 0.5).
 */
function mirrorNorm(pts) {
  return pts.map(([x, y]) => [1 - x, y]);
}

/**
 * Build an SVG path `d` string from one or more polygons.
 * First polygon is the outer boundary, rest are holes.
 * Use with fill-rule:evenodd — holes wound in opposite direction.
 */
function compoundPath(polys) {
  return polys.map(poly => {
    let d = `M ${poly[0].x.toFixed(3)} ${poly[0].y.toFixed(3)}`;
    for (let i = 1; i < poly.length; i++) d += ` L ${poly[i].x.toFixed(3)} ${poly[i].y.toFixed(3)}`;
    return d + ' Z';
  }).join(' ');
}

// ── Normalized bone shapes ───────────────────────────────────────────────────
// All coordinates in [0-1] range, defining right half of symmetric shapes.
// Shapes are intentionally bold and graphic, matching the Soloist aesthetic.

// Front pelvis — RIGHT HALF outer boundary (clockwise from top-center).
// x: 0 = center, 1 = outer edge; y: 0 = top (waist), 1 = bottom (crotch)
const PELVIS_FRONT_RIGHT = [
  [0.10, 0.05],   // top near center (sacral crest)
  [0.16, 0.00],   // iliac crest start
  [0.24, 0.00],   // crest inner
  [0.34, 0.00],   // crest mid
  [0.46, 0.02],   // crest outer
  [0.56, 0.04],   // approaching ASIS
  [0.66, 0.08],   // ASIS
  [0.76, 0.13],   // outer upper
  [0.84, 0.19],   // outer slope
  [0.90, 0.26],   // widest upper area
  [0.95, 0.34],   // widest approach
  [1.00, 0.43],   // widest point
  [0.98, 0.50],   // narrowing
  [0.94, 0.56],   // hip socket approach
  [0.88, 0.61],   // acetabulum upper rim
  [0.82, 0.58],   // socket indentation
  [0.78, 0.56],   // socket deepest
  [0.76, 0.60],   // socket lower rim
  [0.78, 0.66],   // below socket
  [0.78, 0.72],   // ischial tuberosity
  [0.74, 0.78],   // ischium descending
  [0.68, 0.84],   // ischium lower
  [0.60, 0.89],   // pubic ramus
  [0.50, 0.94],   // approaching pubis
  [0.40, 0.97],   // near symphysis
  [0.30, 1.00],   // pubic tubercle
  [0.22, 0.98],   // superior pubic ramus
  [0.16, 0.93],   // inner lower
  [0.12, 0.84],   // inner ascending
  [0.10, 0.72],   // inner mid-lower
  [0.09, 0.58],   // sacral lower
  [0.09, 0.42],   // sacral mid
  [0.09, 0.28],   // sacral upper
  [0.10, 0.15],   // inner upper
];

// Front pelvis — RIGHT HALF obturator foramen (hole), counter-clockwise.
const PELVIS_FRONT_HOLE_RIGHT = [
  [0.32, 0.36],   // top-left of hole
  [0.40, 0.33],   // top
  [0.50, 0.34],   // top-right
  [0.58, 0.38],   // right upper
  [0.64, 0.44],   // right
  [0.66, 0.52],   // right lower
  [0.64, 0.60],   // bottom-right
  [0.58, 0.66],   // bottom
  [0.50, 0.70],   // bottom center
  [0.40, 0.72],   // bottom-left
  [0.32, 0.68],   // left lower
  [0.26, 0.60],   // left
  [0.24, 0.52],   // left upper
  [0.26, 0.44],   // closing
];

// Back pelvis — RIGHT HALF outer boundary. Broader sacrum, no obturator holes visible.
const PELVIS_BACK_RIGHT = [
  [0.12, 0.08],   // top near center
  [0.18, 0.00],   // crest start
  [0.28, 0.00],   // crest inner
  [0.40, 0.00],   // crest mid
  [0.52, 0.03],   // crest outer
  [0.64, 0.08],   // outer crest
  [0.76, 0.15],   // outer slope
  [0.86, 0.24],   // widest upper
  [0.94, 0.35],   // widest approach
  [0.98, 0.44],   // widest point
  [0.96, 0.54],   // narrowing
  [0.90, 0.62],   // posterior hip area
  [0.82, 0.70],   // greater sciatic notch area
  [0.72, 0.78],   // ischium upper
  [0.62, 0.84],   // ischium
  [0.50, 0.90],   // descending
  [0.38, 0.95],   // pubic ramus
  [0.26, 0.98],   // near center bottom
  [0.18, 1.00],   // bottom center
  [0.14, 0.95],   // inner lower
  [0.11, 0.86],   // sacral lower
  [0.10, 0.74],   // sacral mid-lower
  [0.09, 0.60],   // sacral mid
  [0.09, 0.44],   // sacral upper
  [0.10, 0.28],   // iliac inner
  [0.12, 0.16],   // inner upper
];

// Back pelvis sacral foramen hole (right side)
const PELVIS_BACK_HOLE_RIGHT = [
  [0.28, 0.34],
  [0.36, 0.30],
  [0.46, 0.32],
  [0.56, 0.36],
  [0.62, 0.44],
  [0.64, 0.52],
  [0.62, 0.62],
  [0.56, 0.70],
  [0.46, 0.74],
  [0.36, 0.72],
  [0.28, 0.66],
  [0.22, 0.56],
  [0.22, 0.46],
  [0.24, 0.38],
];

// Femur — full outline (not half — asymmetric due to neck angle)
// x: 0-1 full width; y: 0 = top (head), 1 = bottom (condyles)
const FEMUR_OUTLINE = [
  // Ball head (top, offset medially)
  [0.20, 0.06],   // head left
  [0.20, 0.03],   // head top-left
  [0.24, 0.01],   // head top approach
  [0.30, 0.00],   // head top-left
  [0.36, 0.00],   // head top-right
  [0.42, 0.01],   // head top approach right
  [0.46, 0.03],   // head top-right
  [0.46, 0.06],   // head right
  // Neck — smooth transition to trochanter
  [0.48, 0.07],   // neck upper
  [0.52, 0.08],   // neck mid
  [0.56, 0.09],   // neck lower
  [0.60, 0.09],   // neck-trochanter start
  // Greater trochanter (lateral bump)
  [0.66, 0.08],   // trochanter approach
  [0.72, 0.08],   // trochanter top
  [0.78, 0.09],   // trochanter upper
  [0.82, 0.11],   // trochanter peak
  [0.84, 0.14],   // trochanter outer
  [0.82, 0.17],   // trochanter descending
  [0.78, 0.19],   // trochanter lower
  [0.72, 0.20],   // trochanter base
  // Shaft — right (lateral) side, gentle bow
  [0.68, 0.23],   // upper shaft
  [0.66, 0.28],   // shaft
  [0.65, 0.35],   // mid-upper shaft
  [0.64, 0.43],   // shaft
  [0.63, 0.52],   // mid shaft
  [0.63, 0.60],   // shaft
  [0.63, 0.68],   // mid-lower shaft
  [0.64, 0.75],   // shaft widening
  [0.66, 0.80],   // lower shaft
  // Lateral condyle (right bottom)
  [0.70, 0.84],   // condyle top
  [0.76, 0.87],   // condyle outer upper
  [0.82, 0.90],   // condyle outer
  [0.86, 0.93],   // condyle peak
  [0.88, 0.96],   // condyle lower
  [0.86, 0.99],   // condyle bottom approach
  [0.80, 1.00],   // condyle bottom
  [0.70, 1.00],   // condyle inner edge
  // Intercondylar notch
  [0.60, 0.97],   // notch right
  [0.54, 0.95],   // notch right-center
  [0.50, 0.94],   // notch center (deepest)
  [0.46, 0.95],   // notch left-center
  [0.40, 0.97],   // notch left
  // Medial condyle (left bottom)
  [0.30, 1.00],   // condyle inner edge
  [0.20, 1.00],   // condyle bottom
  [0.14, 0.99],   // condyle bottom approach
  [0.12, 0.96],   // condyle lower
  [0.14, 0.93],   // condyle peak
  [0.18, 0.90],   // condyle outer
  [0.24, 0.87],   // condyle outer upper
  [0.30, 0.84],   // condyle top
  // Shaft — left (medial) side
  [0.34, 0.80],   // lower shaft
  [0.36, 0.75],   // shaft
  [0.37, 0.68],   // mid-lower shaft
  [0.37, 0.60],   // shaft
  [0.37, 0.52],   // mid shaft
  [0.36, 0.43],   // shaft
  [0.35, 0.35],   // mid-upper shaft
  [0.34, 0.28],   // shaft
  [0.32, 0.23],   // upper shaft
  // Left side up to neck
  [0.30, 0.20],   // lesser trochanter
  [0.27, 0.17],   // medial upper
  [0.24, 0.14],   // medial neck
  [0.22, 0.11],   // neck base
  [0.20, 0.08],   // neck to head
];

// Knee joint — patella shape (symmetric)
const KNEE_OUTLINE = [
  [0.50, 0.00],   // top center
  [0.58, 0.01],   // top right-center
  [0.66, 0.04],   // top right
  [0.74, 0.09],   // upper right
  [0.82, 0.16],   // right upper
  [0.88, 0.24],   // right
  [0.94, 0.34],   // right mid
  [1.00, 0.46],   // widest right
  [0.98, 0.56],   // lower right upper
  [0.94, 0.66],   // lower right
  [0.88, 0.76],   // bottom right approach
  [0.80, 0.84],   // bottom right
  [0.72, 0.90],   // bottom right inner
  [0.62, 0.96],   // bottom near-right
  [0.50, 1.00],   // bottom center
  [0.38, 0.96],   // bottom near-left
  [0.28, 0.90],   // bottom left inner
  [0.20, 0.84],   // bottom left
  [0.12, 0.76],   // lower left
  [0.06, 0.66],   // lower left upper
  [0.02, 0.56],   // left lower
  [0.00, 0.46],   // widest left
  [0.06, 0.34],   // left mid
  [0.12, 0.24],   // left upper
  [0.18, 0.16],   // upper left
  [0.26, 0.09],   // top left
  [0.34, 0.04],   // top left-center
  [0.42, 0.01],   // top near-left
];

// Tibia — full outline (symmetric, wider at top, tapers at ankle)
const TIBIA_OUTLINE = [
  // Tibial plateau (wide top)
  [0.12, 0.00],   // plateau left
  [0.24, 0.00],   // plateau left-mid
  [0.38, 0.00],   // plateau left-center
  [0.50, 0.01],   // plateau center
  [0.62, 0.00],   // plateau right-center
  [0.76, 0.00],   // plateau right-mid
  [0.88, 0.00],   // plateau right
  // Right side — plateau curves to shaft
  [0.92, 0.02],   // right upper
  [0.94, 0.04],   // right tuberosity
  [0.92, 0.07],   // right narrowing
  [0.86, 0.11],   // narrowing
  [0.80, 0.16],   // upper shaft
  // Right shaft — gentle taper down
  [0.76, 0.22],   // shaft upper
  [0.72, 0.30],   // shaft
  [0.68, 0.40],   // shaft mid-upper
  [0.66, 0.48],   // shaft
  [0.64, 0.55],   // shaft mid
  [0.62, 0.64],   // shaft
  [0.60, 0.72],   // shaft lower
  [0.58, 0.80],   // approaching ankle
  // Right ankle (medial malleolus)
  [0.58, 0.86],   // ankle approach
  [0.59, 0.90],   // ankle upper
  [0.62, 0.94],   // malleolus bump
  [0.62, 0.98],   // malleolus lower
  [0.58, 1.00],   // ankle bottom right
  [0.50, 1.00],   // ankle bottom center
  // Left ankle
  [0.42, 1.00],   // ankle bottom left
  [0.38, 0.98],   // left malleolus lower
  [0.38, 0.94],   // left malleolus
  [0.41, 0.90],   // left ankle upper
  [0.42, 0.86],   // left ankle approach
  // Left shaft — taper up
  [0.42, 0.80],   // left lower shaft
  [0.40, 0.72],   // left shaft lower
  [0.38, 0.64],   // left shaft
  [0.36, 0.55],   // left shaft mid
  [0.34, 0.48],   // left shaft
  [0.32, 0.40],   // left shaft mid-upper
  [0.28, 0.30],   // left shaft
  [0.24, 0.22],   // left shaft upper
  // Left side — upper
  [0.20, 0.16],   // left upper shaft
  [0.14, 0.11],   // narrowing
  [0.08, 0.07],   // left narrowing
  [0.06, 0.04],   // left tuberosity
  [0.08, 0.02],   // left upper
];

// ── Parametric bone generators ───────────────────────────────────────────────

function buildFrontPelvis(hipW, rise) {
  const W = hipW * 2;
  const H = rise * 0.85;
  const hw = W / 2;

  // Build full outer boundary: left half (mirrored) + right half
  const rightOuter = scale(PELVIS_FRONT_RIGHT, hw, H, hw, 0);
  const leftOuter = scale(mirrorNorm(PELVIS_FRONT_RIGHT), hw, H, 0, 0).reverse();
  const outerPoly = [...leftOuter, ...rightOuter.slice(1)];

  // Build hole polygons (opposite winding for evenodd fill)
  const rightHole = scale(PELVIS_FRONT_HOLE_RIGHT, hw, H, hw, 0).reverse();
  const leftHole = scale(mirrorNorm(PELVIS_FRONT_HOLE_RIGHT), hw, H, 0, 0);

  const svgPath = compoundPath([outerPoly, rightHole, leftHole]);

  return { polygon: outerPoly, svgPath, width: W, height: H };
}

function buildBackPelvis(hipW, rise) {
  const W = hipW * 2;
  const H = rise * 0.75;
  const hw = W / 2;

  const rightOuter = scale(PELVIS_BACK_RIGHT, hw, H, hw, 0);
  const leftOuter = scale(mirrorNorm(PELVIS_BACK_RIGHT), hw, H, 0, 0).reverse();
  const outerPoly = [...leftOuter, ...rightOuter.slice(1)];

  const rightHole = scale(PELVIS_BACK_HOLE_RIGHT, hw, H, hw, 0).reverse();
  const leftHole = scale(mirrorNorm(PELVIS_BACK_HOLE_RIGHT), hw, H, 0, 0);

  const svgPath = compoundPath([outerPoly, rightHole, leftHole]);

  return { polygon: outerPoly, svgPath, width: W, height: H };
}

function buildFemur(length, thickness) {
  // Width = 4x thickness for bold proportions (head + shaft + condyles)
  const W = thickness * 5;
  const H = length;
  const outerPoly = scale(FEMUR_OUTLINE, W, H);

  return { polygon: outerPoly, svgPath: compoundPath([outerPoly]), width: W, height: H };
}

function buildKnee(thickness) {
  const W = thickness * 4;
  const H = thickness * 2.8;
  const outerPoly = scale(KNEE_OUTLINE, W, H);

  return { polygon: outerPoly, svgPath: compoundPath([outerPoly]), width: W, height: H };
}

function buildTibia(length, thickness) {
  const W = thickness * 4;
  const H = length;
  const outerPoly = scale(TIBIA_OUTLINE, W, H);

  return { polygon: outerPoly, svgPath: compoundPath([outerPoly]), width: W, height: H };
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
    ease:     { ...straightJeans.options.ease,     default: 'regular'  },
    legShape: { ...straightJeans.options.legShape, default: 'straight' },
    riseStyle:{ ...straightJeans.options.riseStyle, default: 'mid'     },
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
    const boneThick = thigh / 14;   // bolder: /14 instead of /16

    // ── Generate bone templates ──
    const frontPelvis = buildFrontPelvis(hipW, rise);
    const backPelvis  = buildBackPelvis(hipW, rise);
    const femur       = buildFemur(upperLeg, boneThick);
    const knee        = buildKnee(boneThick);
    const tibia       = buildTibia(lowerLeg, boneThick);

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
