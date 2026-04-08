// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Chore Coat / Overshirt — boxy hip-length woven overshirt with set-in sleeves.
 * Button front with placket (+1.5″ CF extension each panel).
 * Camp collar (flat, open) or band collar.
 * Chest flap pockets + lower patch pockets.
 * Fabric: cotton canvas, heavy linen, flannel, lightweight denim.
 */

import {
  shoulderSlope, necklineCurve, armholeCurve, sleeveCapCurve, shoulderDropFromWidth,
  armholeDepthFromChest, chestEaseDistribution, neckWidthFromCircumference,
  validateSleeveSeams,
} from '../engine/upper-body.js';
import { sampleBezier, fmtInches, edgeAngle, arcLength } from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

const PLACKET_W = 1.5;  // button placket extension on each front panel (inches)

const SLEEVE_LENGTHS = { long: 26, three_quarter: 18 };

export default {
  id: 'chore-coat',
  name: 'Chore Coat / Overshirt',
  category: 'upper',
  difficulty: 'intermediate',
  priceTier: 'core',
  measurements: ['chest', 'shoulder', 'neck', 'sleeveLength', 'bicep', 'wrist', 'torsoLength'],
  measurementDefaults: { sleeveLength: 26 },

  options: {
    fit: {
      type: 'select', label: 'Fit',
      values: [
        { value: 'relaxed',   label: 'Relaxed (+6″)',   reference: 'classic overshirt' },
        { value: 'oversized', label: 'Oversized (+9″)', reference: 'boxy work coat' },
      ],
      default: 'relaxed',
    },
    length: {
      type: 'select', label: 'Length',
      values: [
        { value: 'hip',  label: 'Hip (+4″ below torso)' },
        { value: 'long', label: 'Long (+7″)' },
      ],
      default: 'hip',
    },
    collar: {
      type: 'select', label: 'Collar',
      values: [
        { value: 'camp', label: 'Camp collar (flat, open)',     reference: 'resort wear, overshirt' },
        { value: 'band', label: 'Band / Mandarin collar',       reference: 'workwear, minimal' },
      ],
      default: 'camp',
    },
    pockets: {
      type: 'select', label: 'Pockets',
      values: [
        { value: 'chest-lower', label: 'Chest flap ×2 + lower patch ×2 (default)' },
        { value: 'chest-only',  label: 'Chest flap ×2 only' },
        { value: 'none',        label: 'None' },
      ],
      default: 'chest-lower',
    },
    sleeve: {
      type: 'select', label: 'Sleeve length',
      values: [
        { value: 'long',          label: 'Long (with cuff)' },
        { value: 'three_quarter', label: '¾ length (18″)' },
      ],
      default: 'long',
    },
    cuff: {
      type: 'select', label: 'Cuff (long sleeve)',
      values: [
        { value: 'barrel', label: 'Barrel cuff (2.5″ finished)' },
        { value: 'plain',  label: 'Plain hem' },
      ],
      default: 'barrel',
    },
    closure: {
      type: 'select', label: 'Closure',
      values: [
        { value: 'button', label: 'Buttons' },
        { value: 'snap',   label: 'Snap buttons' },
      ],
      default: 'button',
    },
    sa: {
      type: 'select', label: 'Seam allowance',
      values: [
        { value: 0.625, label: '⅝″ (standard)' },
        { value: 1,     label: '1″ (flat-felled seams)' },
      ],
      default: 0.625,
    },
    hem: {
      type: 'select', label: 'Hem allowance',
      values: [
        { value: 0.5, label: '½″ rolled' },
        { value: 1,   label: '1″ folded' },
      ],
      default: 1,
    },
  },

  pieces(m, opts) {
    const sa  = parseFloat(opts.sa);
    const hem = parseFloat(opts.hem);

    const totalEase = opts.fit === 'oversized' ? 9 : 6;
    const panelW    = (m.chest + totalEase) / 4;

    const halfShoulder  = m.shoulder / 2;
    const neckW         = neckWidthFromCircumference(m.neck);
    const shoulderW     = halfShoulder - neckW;
    const slopeDrop     = shoulderDropFromWidth(shoulderW);
    const shoulderPtX   = halfShoulder;
    const armholeY      = armholeDepthFromChest(m.chest, 'relaxed');
    const armholeDepth  = armholeY - slopeDrop;
    const chestDepth    = panelW - shoulderPtX;
    const lengthAdd     = opts.length === 'long' ? 7 : 4;
    const hemY          = m.torsoLength + lengthAdd;
    const slvLength     = SLEEVE_LENGTHS[opts.sleeve] ?? m.sleeveLength ?? 26;
    const slvBotW       = (m.wrist || m.bicep * 0.7) / 2 + 0.5;
    const capH          = armholeDepth * 0.55;
    const sleeveEase    = totalEase * 0.2;
    const slvTopW       = m.bicep / 2 + sleeveEase;

    const NECK_DEPTH_FRONT = 3.0;
    const NECK_DEPTH_BACK  = 0.75;

    // ── CURVE TAGGING — VERIFIED WORKING, DO NOT CHANGE UNLESS NECESSARY ──
    function sampleCurve(cp, steps = 12) {
      return sampleBezier(cp.p0, cp.p1, cp.p2, cp.p3, steps).map(p => ({ ...p, curve: true }));
    }
    function polyToPathStr(poly) {
      let d = `M ${poly[0].x.toFixed(2)} ${poly[0].y.toFixed(2)}`;
      for (let i = 1; i < poly.length; i++) d += ` L ${poly[i].x.toFixed(2)} ${poly[i].y.toFixed(2)}`;
      return d + ' Z';
    }
    function bbox(poly) {
      const xs = poly.map(p => p.x), ys = poly.map(p => p.y);
      return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) };
    }

    const frontNeckPts = sampleCurve(necklineCurve(neckW, NECK_DEPTH_FRONT, 'crew'));
    const backNeckPts  = sampleCurve(necklineCurve(neckW, NECK_DEPTH_BACK,  'crew'));
    const shoulderPts  = sampleCurve(shoulderSlope(shoulderW, slopeDrop));
    const frontArmPts  = sampleCurve(armholeCurve(shoulderW, chestDepth, armholeDepth, false));
    const backArmPts   = sampleCurve(armholeCurve(shoulderW, chestDepth,  armholeDepth, true));

    const shoulderPtY = slopeDrop;
    const sideX       = shoulderPtX + chestDepth;

    // ── FRONT PANEL (CF gets +PLACKET_W extension) ───────────────────────────
    const frontPoly = [];

    for (const p of [...frontNeckPts].reverse()) frontPoly.push({ ...p, x: neckW - p.x });
    // ── JUNCTION UNTAGGING — VERIFIED WORKING, DO NOT CHANGE UNLESS NECESSARY ──
    delete frontPoly[0].curve;
    delete frontPoly[frontNeckPts.length - 1].curve;

    for (let i = 1; i < shoulderPts.length; i++) {
      frontPoly.push({ ...shoulderPts[i], x: neckW + shoulderPts[i].x });
    }
    for (let i = 1; i < frontArmPts.length; i++) {
      frontPoly.push({ ...frontArmPts[i], x: shoulderPtX + frontArmPts[i].x, y: shoulderPtY + frontArmPts[i].y });
    }
    frontPoly.push({ x: sideX,      y: hemY });
    frontPoly.push({ x: -PLACKET_W, y: hemY });
    frontPoly.push({ x: -PLACKET_W, y: NECK_DEPTH_FRONT });
    // Polygon closes back to (0, NECK_DEPTH_FRONT)

    // ── BACK PANEL ───────────────────────────────────────────────────────────
    const backPoly = [];

    for (const p of [...backNeckPts].reverse()) backPoly.push({ ...p, x: neckW - p.x });
    // ── JUNCTION UNTAGGING — VERIFIED WORKING, DO NOT CHANGE UNLESS NECESSARY ──
    delete backPoly[0].curve;
    delete backPoly[backNeckPts.length - 1].curve;

    for (let i = 1; i < shoulderPts.length; i++) {
      backPoly.push({ ...shoulderPts[i], x: neckW + shoulderPts[i].x });
    }
    for (let i = 1; i < backArmPts.length; i++) {
      backPoly.push({ ...backArmPts[i], x: shoulderPtX + backArmPts[i].x, y: shoulderPtY + backArmPts[i].y });
    }
    backPoly.push({ x: sideX, y: hemY });
    backPoly.push({ x: 0,     y: hemY });

    // ── SLEEVE ───────────────────────────────────────────────────────────────
    const capCp   = sleeveCapCurve(m.bicep, capH, slvTopW * 2);
    const capPts  = sampleCurve(capCp, 16);
    validateSleeveSeams('chore-coat', capPts, frontArmPts, backArmPts);

    const sleevePoly = [];
    for (const p of capPts) sleevePoly.push({ ...p, y: p.y + capH });
    // ── SLEEVE JUNCTION UNTAGGING — VERIFIED WORKING, DO NOT CHANGE UNLESS NECESSARY ──
    delete sleevePoly[0].curve;
    delete sleevePoly[capPts.length - 1].curve;
    const slvBarrelOffset = (opts.sleeve === 'long' && opts.cuff === 'barrel') ? 1.0 : 0;
    sleevePoly.push({ x: slvTopW * 2 - (slvTopW - slvBotW), y: capH + slvLength - slvBarrelOffset });
    sleevePoly.push({ x: slvTopW - slvBotW,                  y: capH + slvLength - slvBarrelOffset });

    // ── NOTCHES ───────────────────────────────────────────────────────────────
    const shoulderMidX = (neckW + shoulderPtX) / 2;
    const shoulderMidY = slopeDrop / 2;
    const frontNotches = [
      { x: shoulderMidX, y: shoulderMidY, angle: edgeAngle({ x: neckW, y: 0 }, { x: shoulderPtX, y: slopeDrop }) },
      { x: sideX,        y: armholeY,     angle: 0 },
    ];
    const backNotches = [
      { x: shoulderMidX, y: shoulderMidY, angle: edgeAngle({ x: neckW, y: 0 }, { x: shoulderPtX, y: slopeDrop }) },
      { x: sideX,        y: armholeY,     angle: 0 },
    ];
    const sleeveNotches = [
      { x: slvTopW * 2 / 2, y: 0,       angle: -90 },
      { x: 0,               y: capH,     angle: 0 },
      { x: slvTopW * 2,     y: capH,     angle: 0 },
    ];

    const frontBB  = bbox(frontPoly);
    const backBB   = bbox(backPoly);
    const sleeveBB = bbox(sleevePoly);

    const pieces = [
      {
        id: 'bodice-back',
        name: 'Back Panel',
        instruction: 'Cut 1 on fold (CB)',
        type: 'bodice',
        polygon: backPoly,
        path: polyToPathStr(backPoly),
        width:  backBB.maxX - backBB.minX,
        height: backBB.maxY - backBB.minY,
        isBack: true,
        sa, hem,
        notches: backNotches,
        dims: [
          { label: fmtInches(panelW) + ' half width', x1: 0, y1: -0.5, x2: panelW, y2: -0.5, type: 'h' },
          { label: fmtInches(hemY) + ' length', x: panelW + 1, y1: 0, y2: hemY, type: 'v' },
        ],
      },
      {
        id: 'bodice-front',
        name: 'Front Panel',
        instruction: `Cut 2 (mirror L & R) · Fold CF facing at x=0 · Interface facing 3–4″ wide`,
        type: 'bodice',
        polygon: frontPoly,
        path: polyToPathStr(frontPoly),
        width:  frontBB.maxX - frontBB.minX,
        height: frontBB.maxY - frontBB.minY,
        isBack: false,
        sa, hem,
        notches: frontNotches,
        dims: [
          { label: fmtInches(panelW) + ' half width', x1: 0, y1: -0.5, x2: panelW, y2: -0.5, type: 'h' },
          { label: fmtInches(hemY) + ' length', x: panelW + 1, y1: 0, y2: hemY, type: 'v' },
          { label: fmtInches(PLACKET_W) + ' placket', x1: -PLACKET_W, y1: hemY + 0.4, x2: 0, y2: hemY + 0.4, type: 'h', color: '#b8963e' },
        ],
      },
      {
        id: 'sleeve',
        name: 'Sleeve',
        instruction: `Cut 2 (mirror L & R) · Set-in cap`,
        type: 'sleeve',
        polygon: sleevePoly,
        path: polyToPathStr(sleevePoly),
        width:  sleeveBB.maxX - sleeveBB.minX,
        height: sleeveBB.maxY - sleeveBB.minY,
        capHeight: capH,
        sleeveLength: slvLength,
        sleeveWidth: slvTopW * 2,
        sa, hem,
        notches: sleeveNotches,
        dims: [
          { label: fmtInches(slvTopW * 2) + ' underarm', x1: 0, y1: capH + 0.4, x2: slvTopW * 2, y2: capH + 0.4, type: 'h' },
          { label: fmtInches(slvLength) + ' length', x: slvTopW * 2 + 1, y1: capH, y2: capH + slvLength, type: 'v' },
        ],
      },
    ];

    // ── COLLAR ────────────────────────────────────────────────────────────────
    const frontNeckArc = arcLength(frontNeckPts);
    const backNeckArc  = arcLength(backNeckPts);
    const collarLen    = frontNeckArc * 2 + backNeckArc * 2 + PLACKET_W * 2 + 1;

    if (opts.collar === 'camp') {
      pieces.push({
        id: 'collar',
        name: 'Camp Collar',
        instruction: 'Cut 2 (outer + facing) · Interface outer · 2.5″ at CB, widens to 3.5″ at CF · Shape CF tip: square, rounded, or pointed to taste · {topstitch} outer edge after turning',
        type: 'rectangle',
        dimensions: { length: collarLen, width: 3.5 },
        sa,
      });
    } else {
      pieces.push({
        id: 'collar',
        name: 'Band Collar',
        instruction: 'Cut 2 (outer + facing) · Interface outer · 1.5″ finished height · {topstitch} ⅛″ from top edge after attaching to neckline',
        type: 'rectangle',
        dimensions: { length: collarLen, width: 3 },
        sa,
      });
    }

    // ── CUFFS (long sleeve only) ─────────────────────────────────────────────
    if (opts.sleeve === 'long' && opts.cuff === 'barrel') {
      const cuffLen = (m.wrist || m.bicep * 0.65) + 2; // +2 for overlap
      pieces.push({
        id: 'cuff',
        name: 'Barrel Cuff',
        instruction: 'Cut 4 (2 outer + 2 facing) · Interface outer · 2.5″ finished height · 1 button + buttonhole',
        type: 'rectangle',
        dimensions: { length: cuffLen, width: 5 },
        sa,
      });
    }

    // ── CHEST POCKETS (flap + bag) ────────────────────────────────────────────
    if (opts.pockets === 'chest-lower' || opts.pockets === 'chest-only') {
      pieces.push({
        id: 'chest-pocket-bag',
        name: 'Chest Patch Pocket',
        instruction: 'Cut 2 · Position 2″ below neckline, toward CF · Interface top 1″ · {topstitch} sides and bottom',
        type: 'pocket',
        dimensions: { width: 5, height: 5.5 },
        sa,
      });
      pieces.push({
        id: 'chest-pocket-flap',
        name: 'Chest Pocket Flap',
        instruction: 'Cut 4 (2 outer + 2 facing) · Interface outer · 1 button + buttonhole on flap · Matches pocket width',
        type: 'pocket',
        dimensions: { width: 5, height: 2.5 },
        sa,
      });
    }

    // ── LOWER PATCH POCKETS ───────────────────────────────────────────────────
    if (opts.pockets === 'chest-lower') {
      const pktW = Math.max(6.5, m.chest * 0.16);
      pieces.push({
        id: 'lower-pocket',
        name: 'Lower Patch Pocket',
        instruction: 'Cut 2 · Position at hip level on each front panel · Interface top 1″ · {topstitch} sides and bottom · Round bottom corners (1.5″ radius) optional',
        type: 'pocket',
        dimensions: { width: pktW, height: 7.5 },
        sa,
      });
    }

    return pieces;
  },

  materials(m, opts) {
    const notions = [
      { ref: 'interfacing-med', quantity: '1 yard (collar, cuffs, pocket flaps, CF facings)' },
    ];

    const btnLabel = opts.closure === 'snap' ? 'Snap buttons' : 'Buttons';
    const btnCount = opts.pockets === 'chest-lower' ? 11 : opts.pockets === 'chest-only' ? 9 : 7;
    notions.push({ name: btnLabel, quantity: `${btnCount}`, notes: '½–¾″ shank or sew-through buttons' });

    if (opts.sleeve === 'long' && opts.cuff === 'barrel') {
      notions.push({ name: 'Cuff buttons', quantity: '2', notes: '½″ buttons for barrel cuffs' });
    }

    return buildMaterialsSpec({
      fabrics: ['cotton-canvas', 'linen', 'cotton-twill', 'denim-light'],
      notions,
      thread: opts.sa === '1' ? 'poly-heavy' : 'poly-all',
      needle: 'universal-90',
      stitches: ['straight-2.5', 'straight-3', 'zigzag-small', 'topstitch', 'bartack'],
      notes: [
        'Pre-wash canvas and linen before cutting — both can shrink 3–5% and the finished coat must be washable.',
        'Interface the CF facing 3–4″ wide on each front panel. This stabilises the button/snap placement and prevents the edge from stretching.',
        'For flat-felled seams (1″ SA): sew with one edge trimmed to ¼″, fold the wider SA over the trimmed one and {topstitch} twice. Classic workwear finish.',
        'Camp collar: baste the neckline seam with long stitches first to check the collar drape before sewing permanently.',
        'Mark and stitch all bartacks before washing the finished coat — heavy fabrics shift at pocket openings after laundering.',
        'Sew collar and cuffs {WST} first, then {RST} to the garment, so the seam line is visible from the inside for precision.',
      ],
    });
  },

  instructions(m, opts) {
    const steps = [];
    let n = 1;
    const hasPockets = opts.pockets !== 'none';
    const hasLower   = opts.pockets === 'chest-lower';
    const hasBarrel  = opts.sleeve === 'long' && opts.cuff === 'barrel';

    // Pockets first (always easier before assembly)
    if (hasPockets) {
      steps.push({
        step: n++, title: 'Prepare chest pocket flaps',
        detail: 'Interface flap outer pieces. Sew outer to facing {RST} on three sides, leaving one long edge open. {clip} corners. Turn RS out, {press}. {topstitch} ⅛″ from closed edges. Mark and make buttonhole. Set aside.',
      });
    }

    if (hasLower) {
      steps.push({
        step: n++, title: 'Prepare lower patch pockets',
        detail: 'Interface top 1″. Fold top edge under ½″, then 1″. {topstitch} across top. Fold remaining three sides under ½″ and {press}, mitering corners. Position on front panels at hip level, pin. {topstitch} three sides ⅛–¼″ from edge. Bar tack top corners.',
      });
    }

    if (hasPockets) {
      steps.push({
        step: n++, title: 'Attach chest pocket bags and flaps',
        detail: 'Sew chest pocket bags to front panels at marked position. Interface and topstitch top edge. {press}. Pin flap above bag, RS to RS, raw edge of flap at top of pocket opening. Sew flap header seam. Press flap down over pocket. {topstitch} flap header from RS.',
      });
    }

    steps.push({
      step: n++, title: 'Interface and prepare CF front facings',
      detail: `Apply interfacing to the 3–4″ CF facing strip on each front panel. Mark button/snap positions evenly spaced from neckline to hem. Sew buttonholes (or set snaps) before assembly — easier to handle flat.`,
    });

    steps.push({
      step: n++, title: 'Sew shoulder seams',
      detail: 'Join front panels to back at shoulders {RST}. {press} open or {serge} and {press} toward back. {topstitch} if flat-felled.',
    });

    steps.push({
      step: n++, title: 'Attach collar',
      detail: opts.collar === 'camp'
        ? 'Interface outer collar. Sew outer + facing {RST} along outer curved edge, leaving the neckline edge open. {clip} curves, turn RS out, {press}. {topstitch} outer edge. Baste the collar unit to the neckline {RST}, aligning notches. Sew. Fold facing in and {slipstitch} or {topstitch} inside.'
        : 'Interface outer collar band. Sew outer + facing {RST} along short ends and top edge, leaving bottom edge open. Turn RS out, {press}. Sew outer collar band to neckline {RST}. Fold facing over, {topstitch} from RS through all layers.',
    });

    steps.push({
      step: n++, title: 'Set sleeves',
      detail: 'Pin sleeve cap to armhole {RST}, matching shoulder seam to center cap notch. Ease cap to fit. Sew. {press} toward sleeve. {topstitch} if desired.',
    });

    steps.push({
      step: n++, title: 'Sew side and underarm seams',
      detail: 'Sew continuously from hem through underarm to sleeve hem {RST}. {clip} at underarm. {press} open or flat-fell. {serge} if raw.',
    });

    if (hasBarrel) {
      steps.push({
        step: n++, title: 'Attach barrel cuffs',
        detail: 'Interface outer cuff. Sew outer + facing {RST} on short ends, leaving long edges open. Turn RS out, {press}. Gather or pleat sleeve opening to match cuff length. Sew outer cuff to sleeve end {RST}. Fold cuff facing over, {slipstitch} or {topstitch} from RS. Attach cuff button.',
      });
    } else {
      steps.push({
        step: n++, title: 'Hem sleeves',
        detail: 'Fold up hem allowance once, {press}, fold again. {topstitch} from RS close to fold.',
      });
    }

    steps.push({
      step: n++, title: 'Hem body',
      detail: `Fold up hem allowance ${fmtInches(parseFloat(opts.hem))} once, {press}, fold again. {topstitch} from RS.`,
    });

    steps.push({
      step: n++, title: 'Sew buttons and finish',
      detail: 'Sew all buttons to left front panel, aligning to buttonholes. Bar tack all pocket corners and any bartack points. {press} entire coat.',
    });

    return steps;
  },

  variants: [
    {
      id: 'linen-overshirt',
      name: 'Linen Overshirt',
      defaults: { fit: 'relaxed', collar: 'camp', pockets: 'chest-only', sleeve: 'long' },
      fabrics: ['linen'],
    },
    {
      id: 'canvas-work-coat',
      name: 'Canvas Work Coat',
      defaults: { fit: 'oversized', collar: 'band', pockets: 'chest-lower', length: 'long' },
      fabrics: ['cotton-canvas'],
    },
  ],
};
