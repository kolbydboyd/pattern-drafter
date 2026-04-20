// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Button-Up Shirt (Unisex) -- base module for woven button-front shirts.
 * Front panels split at CF for button placket (+1.5" each side).
 * Point collar with collar stand (default). Back yoke standard.
 * Barrel cuff default. Style variants override defaults and fabrics.
 * Variants: Linen Shirt, Chambray Work Shirt.
 */

import {
  shoulderSlope, necklineCurve, armholeCurve, shoulderDropFromWidth,
  armholeDepthFromChest, chestEaseDistribution, neckWidthFromCircumference,
  sleeveCapCurve, validateSleeveSeams, yokeSplit,
} from '../engine/upper-body.js';
import { sampleBezier, fmtInches, edgeAngle, arcLength } from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';
import { flatFelledSeam } from '../lib/seam-techniques.js';

const PLACKET_W = 1.5; // button placket extension on each front panel (inches)

const SLEEVE_LENGTHS = { short: 9, three_quarter: 18, long: 26 };

const NECK_DEPTH_FRONT = 3.0;
const NECK_DEPTH_BACK  = 0.75;

export default {
  id: 'button-up',
  name: 'Button-Up Shirt',
  category: 'upper',
  difficulty: 'intermediate',
  priceTier: 'core',
  measurements: ['chest', 'shoulder', 'neck', 'sleeveLength', 'bicep', 'wrist', 'torsoLength'],
  measurementDefaults: { sleeveLength: 26 },

  options: {
    collar: {
      type: 'select', label: 'Collar',
      values: [
        { value: 'point',        label: 'Point collar',               reference: 'dress shirt'              },
        { value: 'button-down',  label: 'Button-down collar (OCBD)',   reference: 'Oxford cloth button-down' },
        { value: 'band',         label: 'Band / Mandarin collar',      reference: 'Mandarin, Nehru'          },
      ],
      default: 'point',
    },
    sleeve: {
      type: 'select', label: 'Sleeve',
      values: [
        { value: 'long',          label: 'Long (with cuff)' },
        { value: 'three_quarter', label: '3/4 length'        },
        { value: 'short',         label: 'Short'            },
      ],
      default: 'long',
    },
    cuff: {
      type: 'select', label: 'Cuff (long sleeve)',
      values: [
        { value: 'barrel', label: 'Barrel cuff (2.5" band)'      },
        { value: 'french', label: 'French cuff (cufflinks)',      reference: 'double cuff, dress shirt' },
        { value: 'none',   label: 'No cuff (hem only)'           },
      ],
      default: 'barrel',
    },
    fit: {
      type: 'select', label: 'Fit',
      values: [
        { value: 'fitted',   label: 'Fitted (+2")',   reference: 'slim, tapered, athletic'   },
        { value: 'standard', label: 'Standard (+4")', reference: 'classic, off-the-rack'     },
        { value: 'relaxed',  label: 'Relaxed (+6")',  reference: 'linen drape, casual'       },
      ],
      default: 'fitted',
    },
    length: {
      type: 'select', label: 'Length',
      values: [
        { value: 'hip',   label: 'Hip (+4" below torso)' },
        { value: 'tunic', label: 'Tunic (+8")'           },
      ],
      default: 'hip',
    },
    backDetail: {
      type: 'select', label: 'Back detail',
      values: [
        { value: 'yoke',  label: 'Back yoke' },
        { value: 'plain', label: 'Plain'     },
      ],
      default: 'yoke',
    },
    pocket: {
      type: 'select', label: 'Chest pocket',
      values: [
        { value: 'none',       label: 'None'                },
        { value: 'patch',      label: 'Single patch pocket' },
        { value: 'dual-patch', label: 'Two patch pockets',  reference: 'work shirt, utility' },
      ],
      default: 'none',
    },
    buttons: {
      type: 'select', label: 'Button count',
      values: [
        { value: '6', label: '6 buttons' },
        { value: '7', label: '7 buttons' },
      ],
      default: '6',
    },
    sa: {
      type: 'select', label: 'Seam allowance',
      values: [
        { value: 0.5,   label: '1/2"' },
        { value: 0.625, label: '5/8"' },
      ],
      default: 0.625,
    },
    hem: {
      type: 'select', label: 'Hem allowance',
      values: [
        { value: 0.5, label: '1/2" (rolled)' },
        { value: 1,   label: '1" folded'     },
      ],
      default: 0.5,
    },
  },

  pieces(m, opts) {
    const sa  = parseFloat(opts.sa);
    const hem = parseFloat(opts.hem);

    const easeVal = opts.fit === 'relaxed' ? 6 : opts.fit === 'fitted' ? 2 : 4;
    const { front: frontEase, back: backEase } = chestEaseDistribution(easeVal);
    // Both front and back half-panels are equal so side seams align when sewn
    const panelW = (m.chest + easeVal) / 4;
    const frontW = panelW;
    const backW  = panelW;

    const halfShoulder  = m.shoulder / 2;
    const neckW         = neckWidthFromCircumference(m.neck);
    const shoulderW     = halfShoulder - neckW;
    const slopeDrop     = shoulderDropFromWidth(shoulderW);
    const shoulderPtX   = neckW + shoulderW;
    const armholeY      = armholeDepthFromChest(m.chest, 'standard');
    const armholeDepth  = armholeY - slopeDrop;
    const chestDepth    = panelW - shoulderPtX;
    const backChestDepth = chestDepth;
    const lengthExtra   = opts.length === 'tunic' ? 8 : 4;
    const torsoLen      = m.torsoLength + lengthExtra;
    const slvLength     = SLEEVE_LENGTHS[opts.sleeve] ?? m.sleeveLength ?? 26;
    const yokeH         = opts.backDetail === 'yoke' ? 3.5 : 0;

    // ── CURVE TAGGING -- VERIFIED WORKING, DO NOT CHANGE UNLESS NECESSARY ──
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

    const frontNeckPts   = sampleCurve(necklineCurve(neckW, NECK_DEPTH_FRONT, 'crew'));
    const backNeckPts    = sampleCurve(necklineCurve(neckW, NECK_DEPTH_BACK, 'crew'));
    const shoulderPts    = sampleCurve(shoulderSlope(shoulderW, slopeDrop));
    const frontArmCp     = armholeCurve(shoulderW, chestDepth, armholeDepth, false);
    const backArmCp      = armholeCurve(shoulderW, backChestDepth, armholeDepth, true);
    const frontArmPts    = sampleCurve(frontArmCp);
    const backArmPts     = sampleCurve(backArmCp);

    const shoulderPtY = slopeDrop;

    // ── YOKE SPLIT GEOMETRY ───────────────────────────────────────────────────
    const yokeLineY  = shoulderPtY + yokeH;
    const backYokePt = opts.backDetail === 'yoke' ? yokeSplit(backArmCp, yokeH) : null;
    const backYokeX  = backYokePt ? shoulderPtX + backYokePt.x : shoulderPtX + backChestDepth;

    // ── FRONT PANEL (LEFT -- RIGHT panel is a mirror, same piece) ────────────
    // CF edge gets +PLACKET_W extension (button placket fold-over).
    // Origin: CF neckline low point at (0, NECK_DEPTH_FRONT).
    const frontPoly = [];

    // CF low point -> shoulder-neck junction (reverse neck curve, shifted to x-axis)
    const neckFrontRev = [...frontNeckPts].reverse();
    for (const p of neckFrontRev) {
      frontPoly.push({ ...p, x: neckW - p.x });
    }
    // ── JUNCTION UNTAGGING -- VERIFIED WORKING, DO NOT CHANGE UNLESS NECESSARY ──
    delete frontPoly[0].curve;  // fold-neckline junction
    delete frontPoly[frontNeckPts.length - 1].curve;  // shoulder-neck junction
    // Shoulder-neck -> shoulder point
    for (let i = 1; i < shoulderPts.length; i++) {
      frontPoly.push({ ...shoulderPts[i], x: neckW + shoulderPts[i].x });
    }
    // Shoulder point -> underarm (front armhole)
    for (let i = 1; i < frontArmPts.length; i++) {
      frontPoly.push({ ...frontArmPts[i], x: shoulderPtX + frontArmPts[i].x, y: shoulderPtY + frontArmPts[i].y });
    }
    // Underarm -> hem
    const sideX = shoulderPtX + chestDepth;
    if (opts.fit === 'fitted') {
      frontPoly.push({ x: sideX - 1, y: torsoLen * 0.42 }); // waist suppression: 1" inward at natural waist
    }
    frontPoly.push({ x: sideX, y: torsoLen });
    // Hem -> CF fold (including placket extension)
    frontPoly.push({ x: -PLACKET_W, y: torsoLen });
    // CF fold up to neckline low point (polygon closes to first point via polyToPath Z)
    frontPoly.push({ x: -PLACKET_W, y: NECK_DEPTH_FRONT });

    // ── BACK PANEL ───────────────────────────────────────────────────────────
    const backPoly = [];
    const backSideX = shoulderPtX + backChestDepth;

    if (opts.backDetail === 'yoke') {
      // When a yoke is used, the back body panel starts at the yoke seam
      backPoly.push({ x: 0, y: yokeLineY });
      backPoly.push({ x: backYokeX, y: yokeLineY });
      for (let i = 0; i < backArmPts.length; i++) {
        const pt = { x: shoulderPtX + backArmPts[i].x, y: shoulderPtY + backArmPts[i].y };
        if (pt.y <= yokeLineY) continue;
        backPoly.push(pt);
      }
    } else {
      // Full back from neckline (no yoke)
      const neckBackRev = [...backNeckPts].reverse();
      for (const p of neckBackRev) {
        backPoly.push({ ...p, x: neckW - p.x });
      }
      // ── JUNCTION UNTAGGING -- VERIFIED WORKING, DO NOT CHANGE UNLESS NECESSARY ──
      delete backPoly[0].curve;  // fold-neckline junction
      delete backPoly[backNeckPts.length - 1].curve;  // shoulder-neck junction
      for (let i = 1; i < shoulderPts.length; i++) {
        backPoly.push({ ...shoulderPts[i], x: neckW + shoulderPts[i].x });
      }
      for (let i = 1; i < backArmPts.length; i++) {
        backPoly.push({ ...backArmPts[i], x: shoulderPtX + backArmPts[i].x, y: shoulderPtY + backArmPts[i].y });
      }
    }
    if (opts.fit === 'fitted') {
      backPoly.push({ x: backSideX - 1, y: torsoLen * 0.42 }); // waist suppression: 1" inward at natural waist
    }
    backPoly.push({ x: backSideX, y: torsoLen });
    backPoly.push({ x: 0, y: torsoLen });

    // ── SLEEVE (set-in cap curve) ─────────────────────────────────────────────
    const effArmToElbow = m.armToElbow || (slvLength * 0.45);
    const sleeveEase = easeVal * 0.2;
    const slvTopW    = m.bicep / 2 + sleeveEase;
    const slvBotW    = (m.wrist || m.bicep * 0.7) / 2 + (opts.sleeve === 'long' ? 0.5 : 0);
    const capH       = armholeDepth * 0.55;   // woven shirt cap — slightly lower than knit
    const capCp      = sleeveCapCurve(m.bicep, capH, slvTopW * 2);
    const capPts     = sampleCurve(capCp, 16);
    validateSleeveSeams('button-up', capPts, frontArmPts, backArmPts);

    const sleevePoly = [];
    for (const p of capPts) sleevePoly.push({ ...p, y: p.y + capH });
    // ── JUNCTION UNTAGGING — VERIFIED WORKING, DO NOT CHANGE UNLESS NECESSARY ──
    delete sleevePoly[0].curve;
    delete sleevePoly[capPts.length - 1].curve;
    sleevePoly.push({ x: slvTopW * 2 - (slvTopW - slvBotW), y: capH + slvLength }); // front hem
    sleevePoly.push({ x: slvTopW - slvBotW,                  y: capH + slvLength }); // back hem

    // ── COLLAR ───────────────────────────────────────────────────────────────
    const frontNeckArc = arcLength(frontNeckPts);
    const backNeckArc  = arcLength(backNeckPts);
    const necklineLen  = frontNeckArc * 2 + backNeckArc * 2;
    const collarLen    = necklineLen;
    const standH       = 1.25;  // collar stand height (finished)
    const fallH        = 2.0;   // collar fall height (finished)

    // ── PLACKET FACING ───────────────────────────────────────────────────────
    const placketH = torsoLen - NECK_DEPTH_FRONT;

    // ── BUTTON spacing ───────────────────────────────────────────────────────
    const btnCount   = parseInt(opts.buttons) || 6;
    const btnDiam    = 0.5; // 1/2" default button
    const btnholeSz  = fmtInches(btnDiam + 0.125);

    // ── PER-EDGE SEAM ALLOWANCES ─────────────────────────────────────────────
    const nNeckPts     = frontNeckPts.length;          // 13
    const nShoulderPts = shoulderPts.length - 1;       // 12 added (skip first)
    const nFrontArmPts = frontArmPts.length - 1;       // 12 added
    const nBackArmPts  = backArmPts.length - 1;        // 12 added

    // Front: neckline -> shoulder -> armhole -> side seam -> hem -> placket up -> closing
    const frontEdgeAllowances = [];
    for (let i = 0; i < nNeckPts - 1; i++) frontEdgeAllowances.push({ sa: 0.375, label: 'Neckline' });
    for (let i = 0; i < nShoulderPts; i++) frontEdgeAllowances.push({ sa: 0.625, label: 'Shoulder' });
    for (let i = 0; i < nFrontArmPts; i++) frontEdgeAllowances.push({ sa: 0.375, label: 'Armhole' });
    if (opts.fit === 'fitted') frontEdgeAllowances.push({ sa: 0.625, label: 'Side seam' }); // armhole->waist
    frontEdgeAllowances.push({ sa: 0.625, label: 'Side seam' }); // side seam->hem
    frontEdgeAllowances.push({ sa: hem, label: 'Hem' });         // hem across
    frontEdgeAllowances.push({ sa: 0.625, label: 'Placket' });   // placket up
    while (frontEdgeAllowances.length < frontPoly.length) frontEdgeAllowances.push({ sa: 0.625, label: 'Placket' });

    // Back: edges differ depending on whether a yoke splits the back
    const backEdgeAllowances = [];
    if (opts.backDetail === 'yoke') {
      // yoke seam (across) -> partial armhole (below yoke) -> side seam -> hem -> fold
      backEdgeAllowances.push({ sa: 0.625, label: 'Yoke seam' }); // CB to armhole exit
      const nPartialArm = backArmPts.filter(p => (shoulderPtY + p.y) > yokeLineY).length;
      for (let i = 0; i < nPartialArm; i++) backEdgeAllowances.push({ sa: 0.375, label: 'Armhole' });
      if (opts.fit === 'fitted') backEdgeAllowances.push({ sa: 0.625, label: 'Side seam' });
      backEdgeAllowances.push({ sa: 0.625, label: 'Side seam' });
      backEdgeAllowances.push({ sa: hem, label: 'Hem' });
      while (backEdgeAllowances.length < backPoly.length) backEdgeAllowances.push({ sa: 0, label: 'Fold' });
    } else {
      // neckline -> shoulder -> armhole -> side seam -> hem -> fold
      for (let i = 0; i < nNeckPts - 1; i++) backEdgeAllowances.push({ sa: 0.375, label: 'Neckline' });
      for (let i = 0; i < nShoulderPts; i++) backEdgeAllowances.push({ sa: 0.625, label: 'Shoulder' });
      for (let i = 0; i < nBackArmPts; i++) backEdgeAllowances.push({ sa: 0.375, label: 'Armhole' });
      if (opts.fit === 'fitted') backEdgeAllowances.push({ sa: 0.625, label: 'Side seam' });
      backEdgeAllowances.push({ sa: 0.625, label: 'Side seam' });
      backEdgeAllowances.push({ sa: hem, label: 'Hem' });
      while (backEdgeAllowances.length < backPoly.length) backEdgeAllowances.push({ sa: 0, label: 'Fold' });
    }

    // Sleeve: cap curve -> front side seam -> hem -> back side seam
    const nCapPts = capPts.length;
    const sleeveEdgeAllowances = sleevePoly.map((_, i) => {
      if (i < nCapPts - 1) return { sa: 0.375, label: 'Cap' };
      if (i === nCapPts - 1) return { sa: 0.625, label: 'Side seam' };
      if (i === nCapPts)     return { sa: hem,   label: 'Hem' };
      return { sa: 0.625, label: 'Side seam' };
    });

    const frontBB  = bbox(frontPoly);
    const backBB   = bbox(backPoly);
    const sleeveBB = bbox(sleevePoly);

    // Notch positions
    const shoulderMidX = (neckW + shoulderPtX) / 2;
    const shoulderMidY = slopeDrop / 2;
    const chestNotchY  = armholeY;
    const armQTop      = slopeDrop + armholeDepth * 0.25;
    const armQBot      = slopeDrop + armholeDepth * 0.75;
    const shoulderAngle = edgeAngle({ x: neckW, y: 0 }, { x: shoulderPtX, y: slopeDrop });

    const frontNotches = [
      { x: shoulderMidX, y: shoulderMidY, angle: shoulderAngle },
      { x: sideX,        y: chestNotchY,  angle: 0 },
      { x: shoulderPtX + chestDepth * 0.3, y: armQTop, angle: shoulderAngle },
      { x: sideX - 0.2, y: armQBot, angle: shoulderAngle },
    ];
    const backNotches = opts.backDetail === 'yoke'
      ? [
          // Body panel only has notches below the yoke seam
          { x: backSideX,      y: armholeY,        angle: 0 },
          { x: backSideX,      y: armholeY + 0.25, angle: 0 },
        ]
      : [
          { x: shoulderMidX, y: shoulderMidY, angle: shoulderAngle },
          { x: backSideX,    y: chestNotchY,  angle: 0 },
          { x: shoulderPtX + backChestDepth * 0.3, y: armQTop, angle: shoulderAngle },
          { x: backSideX - 0.2, y: armQBot, angle: shoulderAngle },
        ];
    const sleeveNotches = [
      { x: slvTopW, y: 0, angle: -90 },  // crown center
      { x: slvTopW * 0.5, y: capH * 0.5, angle: edgeAngle({ x: 0, y: capH }, { x: slvTopW, y: 0 }) },   // back cap
      { x: slvTopW * 1.5, y: capH * 0.5, angle: edgeAngle({ x: slvTopW, y: 0 }, { x: slvTopW * 2, y: capH }) }, // front cap
    ];

    const pieces = [
      {
        id: 'bodice-front',
        name: 'Front Panel (Left)',
        instruction: `Cut 2 (L & R mirror) - CF edge has ${fmtInches(PLACKET_W)} placket extension - Button side: ${btnCount} buttonholes at ${btnholeSz} - Buttonhole side: ${btnCount} buttons spaced evenly`,
        type: 'bodice',
        isCutOnFold: false,
        polygon: frontPoly,
        path: polyToPathStr(frontPoly),
        width: frontBB.maxX - frontBB.minX,
        height: frontBB.maxY - frontBB.minY,
        isBack: false,
        sa, hem,
        notches: frontNotches,
        edgeAllowances: frontEdgeAllowances,
        dims: [
          { label: fmtInches(frontW) + ' panel', x1: 0, y1: -0.5, x2: frontW, y2: -0.5, type: 'h' },
          { label: fmtInches(torsoLen) + ' length', x: frontBB.maxX + 1, y1: 0, y2: torsoLen, type: 'v' },
        ],
      },
      {
        id: 'bodice-back',
        name: opts.backDetail === 'yoke' ? 'Back Body Panel' : 'Back Panel',
        instruction: opts.backDetail === 'yoke'
          ? 'Cut 1 on fold (CB) - Joins to back yoke at top, side seams at sides'
          : 'Cut 1 on fold (CB)',
        type: 'bodice',
        polygon: backPoly,
        path: polyToPathStr(backPoly),
        width: backBB.maxX - backBB.minX,
        height: backBB.maxY - backBB.minY,
        isBack: true,
        sa, hem,
        notches: backNotches,
        edgeAllowances: backEdgeAllowances,
        dims: [
          { label: fmtInches(backW) + ' half width', x1: 0, y1: -0.5, x2: backW, y2: -0.5, type: 'h' },
          opts.backDetail === 'yoke'
            ? { label: fmtInches(torsoLen - yokeLineY) + ' body length', x: backBB.maxX + 1, y1: yokeLineY, y2: torsoLen, type: 'v' }
            : { label: fmtInches(torsoLen) + ' length', x: backBB.maxX + 1, y1: 0, y2: torsoLen, type: 'v' },
        ],
      },
      {
        id: 'sleeve',
        name: 'Sleeve',
        instruction: `Cut 2 (mirror L & R) - Straight grain along center length - ${opts.sleeve === 'short' ? 'Short sleeve' : opts.sleeve === 'three_quarter' ? '3/4 sleeve' : 'Long sleeve'}`,
        type: 'sleeve',
        polygon: sleevePoly,
        path: polyToPathStr(sleevePoly),
        width: sleeveBB.maxX - sleeveBB.minX,
        height: sleeveBB.maxY - sleeveBB.minY,
        capHeight: capH,
        sleeveLength: slvLength,
        sleeveWidth: slvTopW * 2,
        sa, hem,
        notches: sleeveNotches,
        edgeAllowances: sleeveEdgeAllowances,
        dims: [
          { label: fmtInches(slvTopW * 2) + ' underarm', x1: 0, y1: capH + 0.4, x2: slvTopW * 2, y2: capH + 0.4, type: 'h' },
          { label: fmtInches(slvLength) + ' length', x: slvTopW * 2 + 1, y1: capH, y2: capH + slvLength, type: 'v' },
          { label: fmtInches(capH) + ' cap', x: -1.2, y1: 0, y2: capH, type: 'v' },
          { label: fmtInches(effArmToElbow) + ' to elbow', x: -1.5, y1: 0, y2: effArmToElbow, type: 'v', color: '#b8963e' },
        ],
      },
      {
        id: 'front-facing',
        name: 'Front Placket Facing',
        instruction: `Cut 2 (L & R) - Interface - ${fmtInches(PLACKET_W + 0.5)} wide x ${fmtInches(placketH)} long`,
        type: 'pocket',
        dimensions: { width: PLACKET_W + 0.5, height: placketH },
      },
    ];

    // Point collar and button-down (OCBD) collar: separate collar fall + collar stand
    if (opts.collar === 'point' || opts.collar === 'button-down') {
      const isOCBD = opts.collar === 'button-down';
      pieces.push({
        id: 'collar',
        name: isOCBD ? 'Button-Down Collar Fall' : 'Point Collar',
        instruction: isOCBD
          ? `Cut 2 (outer + undercollar) - No interfacing (soft, unlined — allows natural roll) - ${fmtInches(collarLen)} long x ${fmtInches(fallH * 2 + sa * 2)} cut (${fmtInches(fallH)} finished fall) - Mark buttonhole 1/2" from each point tip (for anchor buttons on shirt front) - Neckline seam: ${fmtInches(necklineLen)}`
          : `Cut 2 (outer + undercollar) - Interface outer - ${fmtInches(collarLen)} long x ${fmtInches(fallH * 2 + sa * 2)} cut (${fmtInches(fallH)} finished fall) - Neckline seam: ${fmtInches(necklineLen)}`,
        type: 'rectangle',
        dimensions: { length: collarLen, width: fallH * 2 + sa * 2 },
        sa,
        dims: [
          { label: `Neckline: ${fmtInches(necklineLen)}`, x1: 0, y1: -0.5, x2: collarLen, y2: -0.5, type: 'h' },
        ],
      });
      pieces.push({
        id: 'collar-stand',
        name: 'Collar Stand',
        instruction: `Cut 2 - Interface one - ${fmtInches(collarLen)} long x ${fmtInches(standH * 2 + sa * 2)} cut (${fmtInches(standH)} finished stand) - Neckline seam: ${fmtInches(necklineLen)}`,
        type: 'rectangle',
        dimensions: { length: collarLen, width: standH * 2 + sa * 2 },
        sa,
        dims: [
          { label: `Neckline: ${fmtInches(necklineLen)}`, x1: 0, y1: -0.5, x2: collarLen, y2: -0.5, type: 'h' },
        ],
      });
    } else {
      // Band / Mandarin collar: the stand IS the collar
      pieces.push({
        id: 'collar-band',
        name: 'Band Collar',
        instruction: `Cut 2 (outer + facing) - Interface outer - ${fmtInches(collarLen)} long x ${fmtInches(standH * 2 + sa * 2)} cut (${fmtInches(standH)} finished height) - Neckline seam: ${fmtInches(necklineLen)}`,
        type: 'rectangle',
        dimensions: { length: collarLen, width: standH * 2 + sa * 2 },
        sa,
        dims: [
          { label: `Neckline: ${fmtInches(necklineLen)}`, x1: 0, y1: -0.5, x2: collarLen, y2: -0.5, type: 'h' },
        ],
      });
    }

    // Back yoke — proper shaped polygon (neck curve + shoulder + partial armhole + yoke seam)
    if (opts.backDetail === 'yoke') {
      const backYokePoly = [];
      const neckBackRev = [...backNeckPts].reverse();
      for (const p of neckBackRev) backYokePoly.push({ x: neckW - p.x, y: p.y });
      for (let i = 1; i < shoulderPts.length; i++)
        backYokePoly.push({ x: neckW + shoulderPts[i].x, y: shoulderPts[i].y });
      for (let i = 1; i < backArmPts.length; i++) {
        const pt = { x: shoulderPtX + backArmPts[i].x, y: shoulderPtY + backArmPts[i].y };
        if (pt.y > yokeLineY) break;
        backYokePoly.push(pt);
      }
      backYokePoly.push({ x: backYokeX, y: yokeLineY });
      backYokePoly.push({ x: 0, y: yokeLineY });
      const backYokeBB = bbox(backYokePoly);
      pieces.push({
        id: 'back-yoke',
        name: 'Back Yoke',
        instruction: 'Cut 2 (outer + lining) - Interface outer - Flat-fell to back panel at yoke seam',
        type: 'bodice',
        polygon: backYokePoly,
        path: polyToPathStr(backYokePoly),
        width: backYokeBB.maxX - backYokeBB.minX,
        height: backYokeBB.maxY - backYokeBB.minY,
        isBack: true,
        sa, hem: 0,
        notches: [{ x: backYokeX, y: yokeLineY, angle: 0 }],
        dims: [
          { label: fmtInches(backW) + ' half width', x1: 0, y1: -0.5, x2: backW, y2: -0.5, type: 'h' },
          { label: fmtInches(yokeLineY) + ' depth', x: backYokeBB.maxX + 1, y1: 0, y2: yokeLineY, type: 'v' },
        ],
      });
    }

    // Cuff (long sleeve only)
    if (opts.sleeve === 'long' && opts.cuff !== 'none') {
      const cuffH = opts.cuff === 'french' ? 5 : 2.5;
      pieces.push({
        id: 'cuff',
        name: opts.cuff === 'french' ? 'French Cuff' : 'Barrel Cuff',
        instruction: opts.cuff === 'french'
          ? `Cut 4 (2 outer + 2 facing) - Interface outer - ${fmtInches(m.wrist + 1)} long x ${fmtInches(cuffH + sa * 2)} cut (5" finished when unfolded; folds to 2.5" to wear) - Mark 4 link holes: 2 per layer, centered, 1/4" from edge`
          : `Cut 4 (2 outer + 2 facing) - Interface outer - ${fmtInches(m.wrist + 1)} long x ${fmtInches(cuffH + sa * 2)} cut - 1 button per cuff`,
        type: 'pocket',
        dimensions: { length: m.wrist + 1, width: cuffH + sa * 2 },
      });
    }

    // Chest pockets
    if (opts.pocket === 'patch') {
      pieces.push({
        id: 'chest-pocket',
        name: 'Chest Patch Pocket',
        instruction: 'Cut 1 · Position at left chest 2.5″ below neckline, 1.5″ from placket · Top edge: 1″ hem (fold under ½″ twice, {topstitch}) · Sides + bottom: SA',
        type: 'pocket',
        dimensions: { width: 4, height: 5 },
        sa, hem: 1.0, hemEdge: 'top',
      });
    }
    if (opts.pocket === 'dual-patch') {
      pieces.push({
        id: 'chest-pocket-left',
        name: 'Chest Patch Pocket (Left)',
        instruction: 'Cut 1 - Position at left chest 2.5" below neckline, 1.5" from placket - Interface if desired',
        type: 'pocket',
        dimensions: { width: 4, height: 5 },
      });
      pieces.push({
        id: 'chest-pocket-right',
        name: 'Chest Patch Pocket (Right)',
        instruction: 'Cut 1 - Position at right chest, mirror of left pocket - Interface if desired',
        type: 'pocket',
        dimensions: { width: 4, height: 5 },
      });
    }

    return pieces;
  },

  materials(m, opts) {
    const btnCount  = parseInt(opts.buttons) || 6;
    const hasCuff   = opts.sleeve === 'long' && opts.cuff === 'barrel';
    const isFrench  = opts.sleeve === 'long' && opts.cuff === 'french';
    const isOCBD    = opts.collar === 'button-down';
    const fabrics   = opts._fabrics || ['linen', 'linen-light'];
    const isLinen   = fabrics.some(f => f.startsWith('linen'));

    const notions = [
      { name: 'Buttons', quantity: `${btnCount + (hasCuff ? 3 : 0) + 1}`, notes: `${fmtInches(0.5)} (shirt buttons) - +1 spare${hasCuff ? ', +2 for cuffs' : ''}` },
      { ref: 'interfacing-light', quantity: '0.75 yard (collar + stand + placket facings + cuffs)' },
      ...(isOCBD ? [{ name: 'Collar anchor buttons', quantity: '2', notes: '9 mm (~3/8") — sew to shirt front at collar point positions' }] : []),
      ...(isFrench ? [{ name: 'Cufflinks or link buttons', quantity: '1 pair (2 cufflinks)', notes: 'French cuff — no regular buttons at wrist' }] : []),
    ];

    const notes = [
      isLinen
        ? 'PRE-WASH LINEN: wash warm (40 °C / 105 °F), air dry or tumble dry on low heat only - linen shrinks 3-8% and tumble drying hot risks 10-15% additional shrinkage'
        : 'Pre-wash fabric before cutting to prevent shrinkage after construction',
      isLinen
        ? 'French seams recommended for linen: sew WS together at 3/8" from edge, trim to 1/8", fold RST, sew at 1/4" from fold. Encloses raw edges and suits loosely woven cloth.'
        : 'Flat-felled seams recommended: sew RST, trim one SA to 3mm, fold the other over it, topstitch - clean finish, very durable',
      isLinen
        ? 'Press all seams with steam and high heat - linen loves a hot iron and pressing gives crisp results'
        : 'Press all seams open or to one side with steam for crisp results',
      isLinen
        ? 'Interface collar (outer only) with sew-in interfacing - fusible can show through linen and separate after washing'
        : 'Interface collar (outer only) with lightweight fusible or sew-in interfacing',
      `Button spacing: divide placket length by ${btnCount - 1} - place top button 1" from collar stand, bottom button 2" from hem`,
      isLinen ? 'Linen softens beautifully with wear and washing - avoid over-pressing for a relaxed, lived-in look' : '',
      hasCuff ? 'Barrel cuffs: interface one layer, attach with clean finish inside' : '',
    ].filter(Boolean);

    return buildMaterialsSpec({
      fabrics,
      notions,
      thread: 'poly-all',
      needle: 'universal-80',
      stitches: ['straight-2.5', 'straight-1.8', 'zigzag-small'],
      notes,
    });
  },

  instructions(m, opts) {
    const steps = [];
    let n = 1;
    const btnCount = parseInt(opts.buttons) || 6;
    const isLinen  = (opts._fabrics || ['linen']).some(f => f.startsWith('linen'));
    const isOCBD   = opts.collar === 'button-down';
    const interfacingNote = isLinen ? 'sew-in interfacing (fusible can show through linen)' : 'lightweight fusible or sew-in interfacing';

    if (opts.pocket === 'patch') {
      steps.push({
        step: n++, title: 'Prepare chest pocket',
        detail: '{serge} or {zigzag} top edge. Fold top under 1/2", {topstitch}. {press} remaining three edges under 5/8". Position on left front panel 2.5" below shoulder seam. {topstitch} on 3 sides. Bar tack top corners.',
      });
    }
    if (opts.pocket === 'dual-patch') {
      steps.push({
        step: n++, title: 'Prepare chest pockets',
        detail: '{serge} or {zigzag} top edges. Fold tops under 1/2", {topstitch}. {press} remaining three edges under 5/8". Position left pocket on left front panel 2.5" below shoulder seam, 1.5" from placket. Mirror position for right pocket on right front panel. {topstitch} on 3 sides each. Bar tack top corners.',
      });
    }

    if (opts.backDetail === 'yoke') {
      steps.push({
        step: n++, title: 'Attach back yoke',
        detail: 'Sew back body to outer yoke {RST} at yoke seam. {press} up. Place yoke lining over {RST}, sew. Turn and {press}. {edgestitch} from RS.',
      });
    }

    if (opts.collar === 'point') {
      steps.push({
        step: n++, title: 'Prepare collar and stand',
        detail: `Use ${interfacingNote} on outer collar and one stand piece. Sew outer to undercollar {RST} along outer 3 edges. Trim SA to 3mm, {clip} corners diagonally. Turn RS out, use a {point turner} to push corners out cleanly. {press}. Sew collar to outer stand {RST} along top edge. {press} seam up into stand.`,
      });
    } else if (isOCBD) {
      steps.push({
        step: n++, title: 'Prepare button-down collar and stand',
        detail: `No interfacing on the collar fall — leave both layers unlined for the traditional OCBD soft roll. Interface one stand piece only (${interfacingNote}). Sew outer fall to underfall {RST} along outer 3 edges. Trim SA to 3mm, {clip} corners diagonally. Turn RS out, {point turner} to push corners out. {press} lightly — do not over-press; a slight natural roll at the collar break is correct. Work a small buttonhole (9mm) 1/2" from each collar point tip. Sew collar to outer stand {RST} along top edge. {press} seam up into stand.`,
      });
    } else {
      steps.push({
        step: n++, title: 'Prepare band collar',
        detail: `Use ${interfacingNote} on outer collar band. Sew outer to facing {RST} along top edge and short ends, leaving neck edge open. Trim SA to 3mm, {clip} corners. Turn RS out, {press} flat.`,
      });
    }

    steps.push({
      step: n++, title: 'Prepare front plackets',
      detail: `{press} center front fold line ${fmtInches(PLACKET_W)} from CF edge. Interface placket facing strips with ${interfacingNote}. Fold placket extension to WS along fold line, {press}. Sew facing to placket edge {RST}, {press}, fold under, {slipstitch} or {topstitch} to WS.`,
    });

    steps.push({
      step: n++, title: 'Sew shoulder seams',
      detail: 'Join front panels to back at shoulders {RST}.\n\n' + flatFelledSeam({
        seam: 'shoulder seam',
        sa: '⅝″',
        pressDir: 'back',
        trimSide: 'front',
        foldSide: 'back',
        trimTo: '3mm (⅛″)',
        row1: '⅛″',
        row2: '¼″',
        thread: 'matching',
        extraTip: 'For linen and woven fabrics, pressing thoroughly at each stage is especially important — linen responds very well to a hot iron and a damp press cloth.',
      }),
    });

    if (opts.collar === 'point') {
      steps.push({
        step: n++, title: 'Attach collar and stand',
        detail: 'Pin outer stand (with collar attached) to neckline {RST}, matching CF and CB marks. Sew through outer stand and bodice. {clip} curve. Fold inner stand SA under, pin to cover neckline seam on WS. {slipstitch} or {edgestitch} from RS.',
      });
    } else if (isOCBD) {
      steps.push({
        step: n++, title: 'Attach button-down collar and stand',
        detail: 'Pin outer stand (with collar attached) to neckline {RST}, matching CF and CB marks. Sew through outer stand and bodice. {clip} curve. Fold inner stand SA under, {slipstitch} or {edgestitch} from RS. With shirt fully buttoned and collar lying flat in its natural roll position, mark the shirt front where each collar point tip naturally falls. Sew the two small anchor buttons (9mm) to the shirt front at those marks. Button collar points down.',
      });
    } else {
      steps.push({
        step: n++, title: 'Attach band collar',
        detail: 'Pin outer band to neckline {RST}, matching CF and CB marks. Sew through outer band and bodice. {clip} curve. Fold inner band SA under, pin to cover neckline seam on WS. {slipstitch} or {edgestitch} from RS.',
      });
    }

    steps.push({
      step: n++, title: 'Set sleeves',
      detail: 'Mark center of sleeve cap (top edge). Match to shoulder seam. Pin sleeve to armhole {RST} and ease the cap fullness evenly between notches.\n\n' + flatFelledSeam({
        seam: 'armhole seam',
        sa: '⅝″',
        pressDir: 'sleeve',
        trimSide: 'body',
        foldSide: 'sleeve',
        trimTo: '3mm (⅛″)',
        row1: '⅛″',
        row2: '¼″',
        thread: 'matching',
        extraTip: 'The armhole is a curve, so {clip} the trimmed body SA every ½″ before folding so the fell lies flat without pleating. Alternatively, {serge} and press open if a flat fell on the armhole feels too advanced — both finishes are durable.',
      }),
    });

    steps.push({
      step: n++, title: 'Sew side seams and sleeve seams',
      detail: isLinen
        ? 'Sew front to back at side seams in one continuous seam from shirt hem through the underarm to the sleeve hem.\n\nFrench seams: sew WS together at 3/8" from raw edge. {press}. Trim SA to 1/8". Fold RST enclosing raw edge. {press} fold. Sew at 1/4" from fold. At the underarm pivot point, {clip} to stitching line before folding so the seam turns the corner without pulling.'
        : 'Sew front to back at side seams in one continuous seam from shirt hem through the underarm to the sleeve hem {RST}.\n\n' + flatFelledSeam({
            seam: 'side and sleeve seam (sewn as one continuous pass)',
            sa: '⅝″',
            pressDir: 'back',
            trimSide: 'front',
            foldSide: 'back',
            trimTo: '3mm (⅛″)',
            row1: '⅛″',
            row2: '¼″',
            thread: 'matching',
            extraTip: 'At the underarm pivot point, {clip} the trimmed SA nearly to the stitching line so the fell turns the corner smoothly.',
          }),
    });

    if (opts.sleeve === 'long' && opts.cuff !== 'none') {
      if (opts.cuff === 'french') {
        steps.push({
          step: n++, title: 'Attach French cuffs',
          detail: `Interface outer cuff with ${interfacingNote}. Sew outer to facing {RST} on 3 sides (leave one long edge open). Trim SA to 6mm, {clip} corners diagonally. Turn RS out, {press} firmly — crisp edges are important for French cuffs. Fold cuff in half widthwise WS together; this fold is the wear fold. Attach open edge to sleeve hem {RST}. Sew, press SA into sleeve, {slipstitch} or {edgestitch} inner facing over seam. Mark 4 link holes — 2 per folded layer, centered, 1/4" from cuff edge. Work buttonholes or use a {punch and eyelet} tool.`,
        });
      } else {
        steps.push({
          step: n++, title: 'Attach barrel cuffs',
          detail: `Interface outer cuff with ${interfacingNote}. Sew outer cuff to sleeve opening {RST}, easing fullness. Fold cuff SA under. {slipstitch} or {edgestitch}. Make buttonhole on overlap. Attach button.`,
        });
      }
    }

    steps.push({
      step: n++, title: 'Hem sleeves and body',
      detail: `Sleeve hem: fold up ${fmtInches(parseFloat(opts.hem))} twice, {press}, {topstitch}. Body hem: fold up ${fmtInches(parseFloat(opts.hem))} twice, {press}, {topstitch} close to inner fold.`,
    });

    steps.push({
      step: n++, title: 'Buttonholes and buttons',
      detail: `Mark ${btnCount} buttonhole positions on right front placket (horizontal buttonholes): first 1" from collar stand, last 2" from hem, evenly spaced. Test buttonhole on scrap. Sew buttonholes. Cut open with seam ripper. Sew buttons to left placket at matching positions.`,
    });

    steps.push({
      step: n++, title: 'Finish',
      detail: `{press} entire shirt with steam${isLinen ? ' and high heat - linen presses beautifully' : ''}. Check collar sits flat and even. Verify button placket hangs straight. Give a final steam press to set all seams.`,
    });

    return steps;
  },

  // ── Style variants ─────────────────────────────────────────────────────────
  // Each variant becomes a separate catalog entry with its own defaults and
  // fabric recommendations. The underlying pieces/math are shared.
  variants: [
    {
      id: 'linen-shirt',
      name: 'Linen Shirt',
      defaults: { collar: 'point', sleeve: 'long', cuff: 'barrel', fit: 'standard', pocket: 'none', backDetail: 'yoke' },
      fabrics: ['linen', 'linen-light'],
    },
    {
      id: 'chambray-work-shirt',
      name: 'Chambray Work Shirt',
      defaults: { collar: 'point', sleeve: 'long', cuff: 'barrel', fit: 'standard', pocket: 'dual-patch', backDetail: 'yoke' },
      fabrics: ['chambray', 'cotton-twill'],
    },
    {
      id: 'oxford-shirt',
      name: 'Oxford Shirt (OCBD)',
      defaults: { collar: 'button-down', sleeve: 'long', cuff: 'barrel', fit: 'standard', pocket: 'none', backDetail: 'yoke' },
      fabrics: ['chambray', 'cotton-twill'],
    },
  ],
};
