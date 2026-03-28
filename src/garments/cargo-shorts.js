// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Cargo Shorts — first complete garment module.
 * Uses lower body block for front/back panels.
 * Adds cargo pockets, slant pockets, patch back pocket, elastic waistband.
 */

import {
  crotchCurvePoints, sampleBezier, monotoneCrotchCurve, offsetPolygon, polyToPath,
  fmtInches, easeDistribution, LEG_SHAPES, edgeAngle
} from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

export default {
  id: 'cargo-shorts',
  name: 'Cargo Shorts',
  category: 'lower',
  difficulty: 'intermediate',
  priceTier: 'core',
  measurements: ['waist', 'hip', 'rise', 'thigh', 'inseam'],
  measurementDefaults: { inseam: 10 },

  options: {
    ease: {
      type: 'select', label: 'Fit',
      values: [
        { value: 'slim',    label: 'Slim (+1.5″)',    reference: 'fitted, tailored'    },
        { value: 'regular', label: 'Regular (+2.5″)', reference: 'classic, off-the-rack' },
        { value: 'relaxed', label: 'Relaxed (+4″)',   reference: 'skater, workwear'      },
      ],
      default: 'regular',
    },
    frontPocket: {
      type: 'select', label: 'Front pockets',
      values: [
        { value: 'none', label: 'None' },
        { value: 'slant', label: 'Slant (western)' },
        { value: 'side', label: 'Side seam' },
      ],
      default: 'slant',
    },
    cargo: {
      type: 'select', label: 'Cargo pockets',
      values: [
        { value: 'none', label: 'None' },
        { value: 'cargo', label: 'Cargo with flap' },
      ],
      default: 'cargo',
    },
    backPocket: {
      type: 'select', label: 'Back pockets',
      values: [
        { value: 'none', label: 'None' },
        { value: 'patch1', label: 'Patch ×1' },
        { value: 'patch2', label: 'Patch ×2' },
      ],
      default: 'patch1',
    },
    fly: {
      type: 'select', label: 'Closure',
      values: [
        { value: 'none', label: 'None (elastic/drawstring)' },
        { value: 'zip', label: 'Zip fly' },
        { value: 'button', label: 'Button fly' },
      ],
      default: 'none',
    },
    frontExt: { type: 'number', label: 'Front crotch ext', default: 1.5, step: 0.25, min: 0.5, max: 3 },
    backExt: { type: 'number', label: 'Back crotch ext', default: 2.5, step: 0.25, min: 1, max: 4 },
    sa: {
      type: 'select', label: 'Seam allowance',
      values: [
        { value: 0.375, label: '⅜″' },
        { value: 0.5, label: '½″' },
        { value: 0.625, label: '⅝″' },
        { value: 1, label: '1″' },
      ],
      default: 0.625,
    },
    hem: {
      type: 'select', label: 'Hem allowance',
      values: [
        { value: 0.5, label: '½″' },
        { value: 1, label: '1″' },
        { value: 1.5, label: '1½″' },
        { value: 2, label: '2″ (cuff)' },
      ],
      default: 1,
    },
    riseStyle: {
      type: 'select', label: 'Rise style',
      values: [
        { value: 'ultra-low',  label: 'Ultra low (2000s, −2.5″)'  },
        { value: 'low',        label: 'Low rise (−1.5″)'           },
        { value: 'mid',        label: 'Mid rise (body rise)'       },
        { value: 'high',       label: 'High rise (+1.5″)'          },
        { value: 'ultra-high', label: 'Ultra high (paperbag, +3″)' },
      ],
      default: 'mid',
    },
    riseOverride: { type: 'number', label: 'Rise override (inches)', default: 0, step: 0.25, min: 0, max: 18 },
    cbRaise: { type: 'number', label: 'CB raise', default: 0.75, step: 0.25, min: 0, max: 2 },
  },

  /**
   * Generate all pattern pieces
   */
  pieces(m, opts) {
    const ease = easeDistribution(opts.ease);
    const sa = parseFloat(opts.sa);
    const hem = parseFloat(opts.hem);
    const frontExt = parseFloat(opts.frontExt);
    const backExt = parseFloat(opts.backExt);
    const cbRaise = parseFloat(opts.cbRaise);

    const frontW = m.hip / 4 + ease.front;
    const backW = m.hip / 4 + ease.back;
    const RISE_OFFSETS = { 'ultra-low': -2.5, low: -1.5, mid: 0, high: 1.5, 'ultra-high': 3.0 };
    const baseRise  = m.rise || 10;
    const riseOff   = RISE_OFFSETS[opts.riseStyle] ?? 0;
    const rise      = parseFloat(opts.riseOverride) || (baseRise + riseOff);
    const inseam    = m.outseam ? Math.max(1, m.outseam - rise) : (m.inseam || 10);
    const H = rise + inseam;

    const pieces = [];

    // ── FRONT PANEL ──
    pieces.push(buildPanel({
      type: 'front',
      name: 'Front Panel',
      instruction: 'Cut 2 (mirror L & R) · Curve on CENTER seam',
      width: frontW,
      height: H,
      rise: rise,
      inseam,
      ext: frontExt,
      cbRaise: 0,
      sa, hem,
      isBack: false,
      opts, seatDepth: m.seatDepth,
    }));

    // ── BACK PANEL ──
    pieces.push(buildPanel({
      type: 'back',
      name: 'Back Panel',
      instruction: `Cut 2 (mirror L & R) · CB raised ${fmtInches(cbRaise)}`,
      width: backW,
      height: H,
      rise: rise,
      inseam,
      ext: backExt,
      cbRaise,
      sa, hem,
      isBack: true,
      opts, seatDepth: m.seatDepth,
    }));

    // ── WAISTBAND ──
    const flyOverlap = (opts.fly === 'none') ? 0 : 2;
    const wbLength = m.hip + ease.total + flyOverlap + sa * 2;
    const wbWidth = 4; // 2" finished
    pieces.push({
      id: 'waistband',
      name: 'Waistband',
      instruction: `Cut 1 on fold · Interface before cutting · ${fmtInches(wbWidth / 2)} finished`,
      dimensions: { length: wbLength, width: wbWidth },
      type: 'rectangle',
      sa,
    });

    // ── POCKET PIECES ──
    if (opts.frontPocket === 'slant') {
      pieces.push({ id: 'slant-facing', name: 'Slant Pocket Facing', instruction: 'Cut 2 · Match to front slash', dimensions: { width: 2, height: 6 }, type: 'pocket' });
      pieces.push({ id: 'slant-bag', name: 'Slant Pocket Bag', instruction: 'Cut 2 · Lining fabric OK', dimensions: { width: 7, height: 10.5 }, type: 'pocket' });
    }
    if (opts.frontPocket === 'side') {
      pieces.push({ id: 'side-bag', name: 'Side-Seam Pocket Bag', instruction: 'Cut 4 (2 per side)', dimensions: { width: 7, height: 7.5 }, type: 'pocket' });
    }
    if (opts.cargo === 'cargo') {
      pieces.push({ id: 'cargo-body', name: 'Cargo Pocket Body', instruction: 'Cut 2 · 1″ box pleat center', dimensions: { width: 7, height: 8 }, type: 'pocket' });
      pieces.push({ id: 'cargo-flap', name: 'Cargo Pocket Flap', instruction: 'Cut 4 (2 outer + 2 lining)', dimensions: { width: 7.5, height: 3 }, type: 'pocket' });
    }
    if (opts.backPocket !== 'none') {
      const qty = opts.backPocket === 'patch2' ? 4 : 2; // patch2: 2 pockets × 2 panels = 4; patch1: 1 pocket × 2 panels = 2
      pieces.push({ id: 'back-patch', name: 'Back Patch Pocket', instruction: `Cut ${qty}${opts.backPocket === 'patch2' ? ' (2 per back panel)' : ' (one per back panel)'}`, dimensions: { width: 6, height: 7 }, type: 'pocket' });
    }
    if (opts.fly === 'zip') {
      pieces.push({ id: 'fly-shield', name: 'Fly Shield', instruction: 'Cut 1 · Interface', dimensions: { width: 3, height: m.rise }, type: 'pocket' });
    }
    if (opts.fly === 'button') {
      pieces.push({ id: 'button-placket', name: 'Button Fly Placket', instruction: 'Cut 2 (left + right)', dimensions: { width: 5, height: m.rise }, type: 'pocket' });
    }

    return pieces;
  },

  /**
   * Materials / BOM
   */
  materials(m, opts) {
    const ease = easeDistribution(opts.ease);
    const notions = [
      { ref: 'interfacing-med', quantity: '0.5 yard (2 layers for waistband)' },
    ];

    if (opts.fly === 'none') {
      notions.push({ ref: 'elastic-1.5', quantity: `${Math.round(m.waist + 1)}″ — adjust at fitting` });
      notions.push({ ref: 'webbing-1.5', quantity: `${Math.round(m.waist + 2)}″ (internal belt for holster support)` });
    }
    if (opts.fly === 'zip') {
      notions.push({ name: 'Zipper', quantity: `${m.rise}″`, notes: 'Metal or nylon coil' });
      notions.push({ name: 'Waistband button', quantity: '1', notes: '¾″ shank button' });
    }
    if (opts.fly === 'button') {
      notions.push({ name: 'Buttons', quantity: '4–5', notes: '⅝″ for fly' });
    }
    if (opts.cargo === 'cargo') {
      notions.push({ ref: 'snaps', quantity: '2 sets (for cargo flaps)' });
    }

    return buildMaterialsSpec({
      fabrics: ['gabardine', 'cotton-twill', 'linen'],
      notions,
      thread: 'poly-all',
      needle: 'universal-90',
      stitches: ['straight-2.5', 'straight-3', 'zigzag-small', 'bartack'],
      notes: [
        'Pre-wash linen (hot wash, tumble dry) — shrinks 3–5%',
        'Interface waistband with 2 layers BEFORE cutting',
        'Sew nylon webbing into waistband for holster-clip support',
        'Bar tack all pocket corners and crotch junction',
        'Finish raw edges with serger or zigzag',
      ],
    });
  },

  /**
   * Construction instructions
   */
  instructions(m, opts) {
    const steps = [];
    let n = 1;

    // Pockets first
    if (opts.frontPocket === 'slant') {
      steps.push({ step: n++, title: 'Prepare slant pockets',
        detail: 'Sew facing to front panel along slash line {RST}. {clip} curve, turn, {press}. {understitch} facing. Attach pocket bag to facing bottom and side seam allowance. {baste} bag edges to panel.' });
    }
    if (opts.cargo === 'cargo') {
      steps.push({ step: n++, title: 'Prepare cargo pockets',
        detail: 'Fold and {press} box pleat. Fold top edge under 1″, {topstitch}. {press} side/bottom SA under. Sew flap outer to lining {RST} on 3 sides, {clip} corners, turn, {press}. {topstitch} ¼″ from edge. Install snaps.' });
    }
    if (opts.backPocket !== 'none') {
      steps.push({ step: n++, title: 'Prepare & attach back pocket',
        detail: 'Fold top edge under 1″, {topstitch}. {press} remaining edges under ⅝″. Position on back panel 2.5″ below waist line, centered. {topstitch} close to edge on 3 sides. Bar tack top corners.' });
    }

    // Assembly
    steps.push({ step: n++, title: 'Sew center front seam',
      detail: 'Join two front panels at center seam {RST}. {clip} crotch curve. {press} seam open or to one side.' });
    steps.push({ step: n++, title: 'Sew center back seam',
      detail: 'Join two back panels at center seam {RST}. {clip} crotch curve. {press}.' });
    steps.push({ step: n++, title: 'Sew side seams',
      detail: 'Join front to back at side seams {RST}. {press} open. Attach cargo pockets to outer side seam at mid-thigh if applicable.' });
    steps.push({ step: n++, title: 'Sew inseam',
      detail: 'One continuous seam from hem to hem through crotch. Use stretch stitch or small zigzag at crotch curve for durability. {clip} curve, {press}.' });

    // Waistband
    if (opts.fly === 'none') {
      steps.push({ step: n++, title: 'Construct waistband',
        detail: 'Fuse interfacing (2 layers). Sew webbing centered on outer half. Sew short ends to form loop (leave 2″ gap for elastic). Pin to shorts waist {RST}, matching side seams. Sew. Fold over, {press}. Fold top edge under, pin to inside covering seam. {topstitch} through all layers. Thread elastic with bodkin. Overlap ends 1″, zigzag. Close gap. Double {topstitch} top and bottom of waistband.' });
    } else {
      steps.push({ step: n++, title: 'Construct waistband',
        detail: 'Fuse interfacing. Attach to shorts waist {RST}. Fold, {press}, {topstitch}. Install button/buttonhole at center front overlap.' });
    }

    steps.push({ step: n++, title: 'Hem',
      detail: 'Fold up ½″, {press}. Fold again ½″, {press}. {topstitch} close to inner fold. Clean 1″ finished hem.' });
    steps.push({ step: n++, title: 'Finish',
      detail: '{press} entire garment. Bar tack all stress points: pocket openings, cargo pocket corners, crotch junction. Try on and adjust elastic tension if needed.' });

    return steps;
  },
};


// ══════════════════════════════════════════════
// PANEL BUILDER (shared geometry for front/back)
// ══════════════════════════════════════════════

function buildPanel({ type, name, instruction, width, height, rise, inseam, ext, cbRaise, sa, hem, isBack, opts, seatDepth }) {
  // Build polygon points (all in inches, CW winding)
  // LEFT = center seam (crotch curve), RIGHT = side seam (straight)
  const kneeY = rise + inseam * 0.55;

  // Crotch curve
  const ccp = crotchCurvePoints(0, 0, rise, ext, isBack, cbRaise);
  const curvePts = monotoneCrotchCurve(sampleBezier(ccp.p0, ccp.p1, ccp.p2, ccp.p3, 32));

  // Main polygon
  const poly = [];

  // Waist: CB to Side
    poly.push({ x: 0, y: 0 }); // waist at center seam
  poly.push({ x: width, y: 0 }); // waist at side seam

  // Side seam down (straight for shorts)
  poly.push({ x: width, y: height }); // hem at side

  // Hem across
  poly.push({ x: -ext, y: height }); // hem at inseam

  // Inseam up to crotch ext
  poly.push({ x: -ext, y: rise }); // crotch extension point

  // Crotch curve back to waist (reverse order)
  for (let i = curvePts.length - 2; i >= 1; i--) {
    poly.push(curvePts[i]);
  }
  if (isBack && cbRaise > 0) poly.push({ x: 0, y: cbRaise }); // CB seam top

  // Per-edge seam allowances
  const crotchEdgeCount = curvePts.length - 2; // 15 crotch curve edges
  const edgeAllowances = poly.map((_, i) => {
    if (i === 0) return { sa, label: 'Waist' };
    if (i === 1) return { sa, label: 'Side seam' };
    if (i === 2) return { sa: hem, label: 'Hem' };
    if (i === 3) return { sa, label: 'Inseam' };
    if (i >= 4 && i < 4 + crotchEdgeCount) return { sa: 0.375, label: 'Crotch' };
    return { sa, label: 'Center' };
  });

  // SA offset
  const saPoly = offsetPolygon(poly, i => -edgeAllowances[i].sa);

  // Build dimension annotations
  const dims = [
    { label: fmtInches(width), x1: 0, y1: -0.5, x2: width, y2: -0.5, type: 'h' },
    { label: fmtInches(rise) + ' rise', x: width + 1.2, y1: 0, y2: rise, type: 'v' },
    { label: fmtInches(inseam) + ' inseam', x: width + 1.2, y1: rise, y2: height, type: 'v' },
    { label: fmtInches(height) + ' total', x: width + 2.3, y1: 0, y2: height, type: 'v' },
    { label: fmtInches(ext) + ' ext', x1: -ext, y1: rise + 0.4, x2: 0, y2: rise + 0.4, type: 'h', color: '#c44' },
    { label: fmtInches(seatDepth || 7) + ' seat', x: -ext - 1.2, y1: 0, y2: seatDepth || 7, type: 'v', color: '#b8963e' },
  ];

  // Notch marks: hip level on side seam, crotch junction
  const effSeatDepth = seatDepth || 7;
  const notches = [
    { x: width, y: effSeatDepth, angle: edgeAngle({ x: width, y: 0 }, { x: width, y: height }) },  // hip on side seam
    { x: -ext,  y: rise,         angle: edgeAngle({ x: -ext, y: height }, { x: -ext, y: rise }) },  // crotch junction
  ];

  return {
    id: type,
    name,
    instruction,
    polygon: poly,
    saPolygon: saPoly,
    path: polyToPath(poly),
    saPath: polyToPath(saPoly),
    dimensions: dims,
    width, height, rise, inseam, ext, cbRaise, sa, hem,
    isBack,
    notches, edgeAllowances, crotchBezier: ccp,
    labels: [
      { text: 'SIDE SEAM', x: width + 0.3, y: height * 0.35, rotation: 90 },
      { text: 'CENTER', x: -0.5, y: rise * 0.3, rotation: -90 },
    ],
    type: 'panel',
    opts,
  };
}
