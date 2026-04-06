// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Soloist Jeans — Straight jeans with scaled skeleton bone vinyl templates.
 * Inspired by Takahiromiyashita The Soloist skeleton-print jeans.
 * Delegates jeans construction to straight-jeans.js, then appends parametric
 * bone template pieces (pelvis, femur, knee, tibia) sized to body measurements
 * for Cricut/vinyl cutting.
 */

import { sampleBezier, polyToPath } from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';
import straightJeans from './straight-jeans.js';

// ── Bone geometry helpers ────────────────────────────────────────────────────

/**
 * Sample a cubic Bezier and return polygon points.
 * Wraps engine sampleBezier which takes {x,y} control points.
 */
function bezierPoints(p0, p1, p2, p3, steps = 24) {
  return sampleBezier(p0, p1, p2, p3, steps);
}

/**
 * Mirror a polygon horizontally around x = cx.
 */
function mirrorX(poly, cx) {
  return poly.map(p => ({ x: 2 * cx - p.x, y: p.y }));
}

/**
 * Concatenate multiple point arrays into one closed polygon.
 */
function concat(...arrs) {
  return arrs.flat();
}

// ── Parametric bone generators ───────────────────────────────────────────────
// All dimensions in inches, derived from body measurements.
// Each returns { polygon: [{x,y},...], width, height }.

/**
 * Front pelvis — stylized iliac wings + hip sockets.
 * Width spans both legs (full hip width at waistband level).
 * @param {number} hipW  — half-hip panel width (hip/4 + ease)
 * @param {number} rise  — crotch rise
 */
function buildFrontPelvis(hipW, rise) {
  // Pelvis spans roughly from waist to mid-thigh area
  const W = hipW * 2;        // full width for both sides
  const H = rise * 0.85;     // pelvis height relative to rise
  const cx = W / 2;

  // Right iliac wing (stylized) — built from Bezier curves
  // Top crest sweeping outward
  const crestOuter = bezierPoints(
    { x: cx + 0.3, y: 0.3 },
    { x: cx + W * 0.15, y: -0.2 },
    { x: cx + W * 0.35, y: 0.1 },
    { x: cx + W * 0.45, y: H * 0.18 },
    16
  );

  // Outer edge curving down to hip socket
  const outerDown = bezierPoints(
    { x: cx + W * 0.45, y: H * 0.18 },
    { x: cx + W * 0.48, y: H * 0.35 },
    { x: cx + W * 0.44, y: H * 0.52 },
    { x: cx + W * 0.38, y: H * 0.62 },
    12
  );

  // Hip socket (acetabulum) — indentation
  const hipSocket = bezierPoints(
    { x: cx + W * 0.38, y: H * 0.62 },
    { x: cx + W * 0.32, y: H * 0.68 },
    { x: cx + W * 0.28, y: H * 0.72 },
    { x: cx + W * 0.33, y: H * 0.78 },
    10
  );

  // Ischium curving down and inward
  const ischium = bezierPoints(
    { x: cx + W * 0.33, y: H * 0.78 },
    { x: cx + W * 0.36, y: H * 0.88 },
    { x: cx + W * 0.28, y: H * 0.96 },
    { x: cx + W * 0.18, y: H },
    12
  );

  // Pubic symphysis — curves inward to center
  const pubis = bezierPoints(
    { x: cx + W * 0.18, y: H },
    { x: cx + W * 0.1, y: H * 0.97 },
    { x: cx + W * 0.04, y: H * 0.92 },
    { x: cx, y: H * 0.88 },
    10
  );

  // Inner edge — sacral area up to top center
  const innerUp = bezierPoints(
    { x: cx, y: H * 0.88 },
    { x: cx + 0.15, y: H * 0.5 },
    { x: cx + 0.2, y: H * 0.25 },
    { x: cx + 0.3, y: 0.3 },
    12
  );

  // Right half
  const rightHalf = concat(crestOuter, outerDown.slice(1), hipSocket.slice(1), ischium.slice(1), pubis.slice(1), innerUp.slice(1));

  // Mirror for left half
  const leftHalf = mirrorX(rightHalf, cx).reverse();

  // Combine into full pelvis
  const polygon = concat(leftHalf, rightHalf.slice(1));

  return {
    polygon,
    width: W,
    height: H,
  };
}

/**
 * Back pelvis — sacrum + rear iliac view (simpler, mask-like).
 */
function buildBackPelvis(hipW, rise) {
  const W = hipW * 2;
  const H = rise * 0.75;
  const cx = W / 2;

  // Right side — broader, flatter iliac wing
  const crestOuter = bezierPoints(
    { x: cx + 0.2, y: 0.5 },
    { x: cx + W * 0.12, y: 0 },
    { x: cx + W * 0.32, y: 0.15 },
    { x: cx + W * 0.42, y: H * 0.22 },
    14
  );

  const outerDown = bezierPoints(
    { x: cx + W * 0.42, y: H * 0.22 },
    { x: cx + W * 0.45, y: H * 0.4 },
    { x: cx + W * 0.42, y: H * 0.58 },
    { x: cx + W * 0.35, y: H * 0.68 },
    12
  );

  const lowerCurve = bezierPoints(
    { x: cx + W * 0.35, y: H * 0.68 },
    { x: cx + W * 0.28, y: H * 0.8 },
    { x: cx + W * 0.18, y: H * 0.92 },
    { x: cx + W * 0.1, y: H },
    12
  );

  const toCenter = bezierPoints(
    { x: cx + W * 0.1, y: H },
    { x: cx + W * 0.05, y: H * 0.95 },
    { x: cx + 0.15, y: H * 0.82 },
    { x: cx, y: H * 0.75 },
    10
  );

  // Sacrum central notch
  const sacrum = bezierPoints(
    { x: cx, y: H * 0.75 },
    { x: cx + 0.1, y: H * 0.45 },
    { x: cx + 0.15, y: H * 0.2 },
    { x: cx + 0.2, y: 0.5 },
    10
  );

  const rightHalf = concat(crestOuter, outerDown.slice(1), lowerCurve.slice(1), toCenter.slice(1), sacrum.slice(1));
  const leftHalf = mirrorX(rightHalf, cx).reverse();
  const polygon = concat(leftHalf, rightHalf.slice(1));

  return { polygon, width: W, height: H };
}

/**
 * Femur — thigh bone with ball head and condyles at knee.
 * @param {number} length — femur length (upper leg)
 * @param {number} thickness — bone shaft width, proportional to thigh
 */
function buildFemur(length, thickness) {
  const W = thickness * 3.5;   // total width including ball head and condyles
  const H = length;
  const cx = W / 2;
  const shaft = thickness;
  const half = shaft / 2;

  const points = [];

  // Ball head (top, femoral head) — round knob
  const headR = thickness * 0.9;
  const headCx = cx - thickness * 0.3;  // offset medially
  const headTop = 0;
  // Draw ball head as a semicircle approximation
  const headLeft = bezierPoints(
    { x: headCx, y: headTop + headR },
    { x: headCx - headR, y: headTop + headR },
    { x: headCx - headR, y: headTop },
    { x: headCx, y: headTop },
    12
  );
  const headRight = bezierPoints(
    { x: headCx, y: headTop },
    { x: headCx + headR, y: headTop },
    { x: headCx + headR, y: headTop + headR },
    { x: headCx, y: headTop + headR },
    12
  );

  // Neck — narrows from head to greater trochanter
  const neckBottom = headR * 2.2;
  const neck = bezierPoints(
    { x: headCx + headR * 0.5, y: headTop + headR },
    { x: cx + half + thickness * 0.6, y: neckBottom * 0.5 },
    { x: cx + half + thickness * 0.5, y: neckBottom * 0.7 },
    { x: cx + half + thickness * 0.2, y: neckBottom },
    10
  );

  // Greater trochanter — bump on lateral side
  const trochanter = bezierPoints(
    { x: cx + half + thickness * 0.2, y: neckBottom },
    { x: cx + half + thickness * 0.7, y: neckBottom + thickness * 0.2 },
    { x: cx + half + thickness * 0.7, y: neckBottom + thickness * 0.8 },
    { x: cx + half, y: neckBottom + thickness * 1.2 },
    10
  );

  // Shaft — right side going down (slight lateral bow)
  const shaftStart = neckBottom + thickness * 1.2;
  const shaftEnd = H - thickness * 2.5;
  const rightShaft = bezierPoints(
    { x: cx + half, y: shaftStart },
    { x: cx + half + thickness * 0.15, y: shaftStart + (shaftEnd - shaftStart) * 0.3 },
    { x: cx + half + thickness * 0.1, y: shaftStart + (shaftEnd - shaftStart) * 0.7 },
    { x: cx + half + thickness * 0.3, y: shaftEnd },
    16
  );

  // Lateral condyle (bottom right)
  const condyleW = thickness * 1.1;
  const condyleH = thickness * 1.5;
  const latCondyle = bezierPoints(
    { x: cx + half + thickness * 0.3, y: shaftEnd },
    { x: cx + condyleW + half * 0.3, y: H - condyleH },
    { x: cx + condyleW + half * 0.3, y: H },
    { x: cx + thickness * 0.15, y: H },
    12
  );

  // Intercondylar notch (bottom center)
  const notch = bezierPoints(
    { x: cx + thickness * 0.15, y: H },
    { x: cx + thickness * 0.05, y: H - thickness * 0.4 },
    { x: cx - thickness * 0.05, y: H - thickness * 0.4 },
    { x: cx - thickness * 0.15, y: H },
    8
  );

  // Medial condyle (bottom left)
  const medCondyle = bezierPoints(
    { x: cx - thickness * 0.15, y: H },
    { x: cx - condyleW - half * 0.3, y: H },
    { x: cx - condyleW - half * 0.3, y: H - condyleH },
    { x: cx - half - thickness * 0.3, y: shaftEnd },
    12
  );

  // Left shaft going up
  const leftShaft = bezierPoints(
    { x: cx - half - thickness * 0.3, y: shaftEnd },
    { x: cx - half - thickness * 0.1, y: shaftStart + (shaftEnd - shaftStart) * 0.7 },
    { x: cx - half - thickness * 0.15, y: shaftStart + (shaftEnd - shaftStart) * 0.3 },
    { x: cx - half, y: shaftStart },
    16
  );

  // Left side up to neck
  const leftNeck = bezierPoints(
    { x: cx - half, y: shaftStart },
    { x: cx - half - thickness * 0.1, y: neckBottom },
    { x: headCx - headR * 0.3, y: headTop + headR * 1.2 },
    { x: headCx - headR * 0.5, y: headTop + headR },
    10
  );

  const polygon = concat(
    headLeft, headRight.slice(1),
    neck.slice(1), trochanter.slice(1), rightShaft.slice(1),
    latCondyle.slice(1), notch.slice(1), medCondyle.slice(1),
    leftShaft.slice(1), leftNeck.slice(1)
  );

  return { polygon, width: W, height: H };
}

/**
 * Knee joint — patella/condyle connector piece.
 * @param {number} thickness — proportional to thigh
 */
function buildKnee(thickness) {
  const W = thickness * 3.2;
  const H = thickness * 2.5;
  const cx = W / 2;

  // Rounded patella shape
  const top = bezierPoints(
    { x: cx - W * 0.35, y: H * 0.35 },
    { x: cx - W * 0.3, y: 0 },
    { x: cx + W * 0.3, y: 0 },
    { x: cx + W * 0.35, y: H * 0.35 },
    14
  );

  const rightSide = bezierPoints(
    { x: cx + W * 0.35, y: H * 0.35 },
    { x: cx + W * 0.45, y: H * 0.5 },
    { x: cx + W * 0.42, y: H * 0.75 },
    { x: cx + W * 0.32, y: H },
    10
  );

  const bottom = bezierPoints(
    { x: cx + W * 0.32, y: H },
    { x: cx + W * 0.1, y: H * 0.85 },
    { x: cx - W * 0.1, y: H * 0.85 },
    { x: cx - W * 0.32, y: H },
    10
  );

  const leftSide = bezierPoints(
    { x: cx - W * 0.32, y: H },
    { x: cx - W * 0.42, y: H * 0.75 },
    { x: cx - W * 0.45, y: H * 0.5 },
    { x: cx - W * 0.35, y: H * 0.35 },
    10
  );

  const polygon = concat(top, rightSide.slice(1), bottom.slice(1), leftSide.slice(1));

  return { polygon, width: W, height: H };
}

/**
 * Tibia — shin bone from knee to ankle.
 * @param {number} length — lower leg length
 * @param {number} thickness — bone shaft width
 */
function buildTibia(length, thickness) {
  const W = thickness * 3;
  const H = length;
  const cx = W / 2;
  const half = thickness / 2;

  // Tibial plateau (wide top)
  const plateauW = thickness * 1.4;
  const plateauTop = bezierPoints(
    { x: cx - plateauW, y: 0 },
    { x: cx - plateauW * 0.5, y: -thickness * 0.15 },
    { x: cx + plateauW * 0.5, y: -thickness * 0.15 },
    { x: cx + plateauW, y: 0 },
    10
  );

  // Right side — plateau to shaft
  const rightPlateau = bezierPoints(
    { x: cx + plateauW, y: 0 },
    { x: cx + plateauW, y: thickness * 0.6 },
    { x: cx + half + thickness * 0.2, y: thickness * 1.5 },
    { x: cx + half + thickness * 0.15, y: thickness * 2.5 },
    10
  );

  // Right shaft (slight triangular taper)
  const shaftTopY = thickness * 2.5;
  const shaftBotY = H - thickness * 1.5;
  const rightShaft = bezierPoints(
    { x: cx + half + thickness * 0.15, y: shaftTopY },
    { x: cx + half + thickness * 0.05, y: shaftTopY + (shaftBotY - shaftTopY) * 0.3 },
    { x: cx + half * 0.6, y: shaftTopY + (shaftBotY - shaftTopY) * 0.7 },
    { x: cx + half * 0.5, y: shaftBotY },
    14
  );

  // Medial malleolus (inner ankle bump) — right side at bottom
  const rightAnkle = bezierPoints(
    { x: cx + half * 0.5, y: shaftBotY },
    { x: cx + half * 0.6, y: H - thickness * 0.5 },
    { x: cx + half * 0.4, y: H },
    { x: cx, y: H },
    8
  );

  // Left ankle
  const leftAnkle = bezierPoints(
    { x: cx, y: H },
    { x: cx - half * 0.5, y: H },
    { x: cx - half * 0.8, y: H - thickness * 0.5 },
    { x: cx - half * 0.5, y: shaftBotY },
    8
  );

  // Left shaft
  const leftShaft = bezierPoints(
    { x: cx - half * 0.5, y: shaftBotY },
    { x: cx - half * 0.6, y: shaftTopY + (shaftBotY - shaftTopY) * 0.7 },
    { x: cx - half - thickness * 0.05, y: shaftTopY + (shaftBotY - shaftTopY) * 0.3 },
    { x: cx - half - thickness * 0.15, y: shaftTopY },
    14
  );

  // Left plateau
  const leftPlateau = bezierPoints(
    { x: cx - half - thickness * 0.15, y: shaftTopY },
    { x: cx - half - thickness * 0.2, y: thickness * 1.5 },
    { x: cx - plateauW, y: thickness * 0.6 },
    { x: cx - plateauW, y: 0 },
    10
  );

  const polygon = concat(
    plateauTop, rightPlateau.slice(1), rightShaft.slice(1),
    rightAnkle.slice(1), leftAnkle.slice(1), leftShaft.slice(1),
    leftPlateau.slice(1)
  );

  return { polygon, width: W, height: H };
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
    // Lock defaults to match the Soloist silhouette
    ease:     { ...straightJeans.options.ease,     default: 'regular'  },
    legShape: { ...straightJeans.options.legShape, default: 'straight' },
    riseStyle:{ ...straightJeans.options.riseStyle, default: 'mid'     },
  },

  pieces(m, opts) {
    // Get all standard jeans pieces
    const jeansPieces = straightJeans.pieces(m, opts);

    // ── Derive bone dimensions from body measurements ──
    const baseRise  = m.rise || 10;
    const inseam    = m.inseam || 31;
    const hip       = m.hip || 38;
    const thigh     = m.thigh || 22;
    const RISE_OFFSETS = { 'ultra-low': -2.5, low: -1.5, mid: 0, high: 1.5, 'ultra-high': 3.0 };
    const riseOff   = RISE_OFFSETS[opts.riseStyle] ?? 0;
    const rise      = (parseFloat(opts.riseOverride) || (baseRise + riseOff)) + 1.25;

    const hipW      = hip / 4 + 2;  // approximate panel width
    const upperLeg  = inseam * 0.55; // femur length (waist-to-knee proportion)
    const lowerLeg  = inseam * 0.45; // tibia length (knee-to-ankle)
    const boneThick = thigh / 16;    // shaft thickness proportional to thigh

    // ── Generate bone templates ──
    const frontPelvis = buildFrontPelvis(hipW, rise);
    const backPelvis  = buildBackPelvis(hipW, rise);
    const femur       = buildFemur(upperLeg, boneThick);
    const knee        = buildKnee(boneThick);
    const tibia       = buildTibia(lowerLeg, boneThick);

    // Append bone template pieces
    jeansPieces.push({
      type: 'template',
      id: 'bone-front-pelvis',
      name: 'Front Pelvis (vinyl)',
      instruction: 'Cut 1 from white HTV. Mirror is built in. Align top edge to waistband seam, center on front.',
      polygon: frontPelvis.polygon,
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
      path: polyToPath(tibia.polygon),
      width: tibia.width,
      height: tibia.height,
    });

    return jeansPieces;
  },

  materials(m, opts) {
    const base = straightJeans.materials(m, opts);
    // Add HTV vinyl to the notions
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
