// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Camp Shirt — woven button-front with camp/convertible collar.
 * Front panels split at CF for button placket (+1.5″ each side).
 * Collar drafted as a shaped flat piece (trapezoid) that lies flat when worn open.
 * Optional back yoke (geometry modeled on denim-jacket.js) for elevated fit.
 * Fabric: rayon challis, cotton lawn, viscose — drapey light wovens 3–5 oz.
 */

import {
  shoulderSlope, necklineCurve, armholeCurve, shoulderDropFromWidth,
  armholeDepthFromChest, chestEaseDistribution, neckWidthFromCircumference, UPPER_EASE,
  sleeveCapCurve, validateSleeveSeams,
} from '../engine/upper-body.js';
import { sampleBezier, fmtInches, edgeAngle, arcLength, ptAtArcLen, dist } from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

const PLACKET_W = 1.5; // button placket extension on each front panel (inches)

// Sleeve length presets
const SLEEVE_LENGTHS = { short: 9, long: 26 };

// Neckline depth for crew-fit camp collar
const NECK_DEPTH_FRONT = 3.0;
const NECK_DEPTH_BACK  = 0.75;

export default {
  id: 'camp-shirt',
  name: 'Camp Shirt',
  category: 'upper',
  difficulty: 'beginner',
  priceTier: 'core',
  measurements: ['chest', 'shoulder', 'neck', 'sleeveLength', 'bicep', 'wrist', 'torsoLength'],
  measurementDefaults: { sleeveLength: 26 },

  options: {
    sleeveStyle: {
      type: 'select', label: 'Sleeve length',
      values: [
        { value: 'short', label: 'Short (9″)' },
        { value: 'long',  label: 'Long (26″)' },
      ],
      default: 'short',
    },
    fit: {
      type: 'select', label: 'Fit',
      values: [
        { value: 'fitted',   label: 'Fitted (+2″)',   reference: 'slim, tapered, athletic' },
        { value: 'standard', label: 'Regular (+4″)',  reference: 'classic, off-the-rack'   },
        { value: 'relaxed',  label: 'Relaxed (+6″)',  reference: 'skater, workwear'        },
      ],
      default: 'standard',
    },
    yoke: {
      type: 'select', label: 'Back yoke',
      values: [
        { value: 'none', label: 'No yoke' },
        { value: 'yoke', label: 'Back yoke', reference: 'elevated, classic camp shirt' },
      ],
      default: 'none',
    },
    chestPocket: {
      type: 'select', label: 'Chest pocket',
      values: [
        { value: 'none',  label: 'None'         },
        { value: 'patch', label: 'Patch pocket' },
      ],
      default: 'patch',
    },
    buttons: {
      type: 'select', label: 'Button count',
      values: [
        { value: '5', label: '5 buttons' },
        { value: '6', label: '6 buttons' },
      ],
      default: '5',
    },
    sa: {
      type: 'select', label: 'Seam allowance',
      values: [
        { value: 0.5,   label: '½″' },
        { value: 0.625, label: '⅝″' },
      ],
      default: 0.625,
    },
    hem: {
      type: 'select', label: 'Hem allowance',
      values: [
        { value: 0.5, label: '½″ (rolled)' },
        { value: 1,   label: '1″ folded'   },
      ],
      default: 1,
    },
  },

  pieces(m, opts) {
    const sa  = parseFloat(opts.sa);
    const hem = parseFloat(opts.hem);

    const totalEase = UPPER_EASE[opts.fit] ?? 4;
    const panelW    = (m.chest + totalEase) / 4;
    const frontW    = panelW;
    const backW     = panelW;

    const halfShoulder = m.shoulder / 2;
    const neckW        = neckWidthFromCircumference(m.neck);
    const shoulderW    = halfShoulder - neckW;
    const slopeDrop    = shoulderDropFromWidth(shoulderW);
    const shoulderPtX  = neckW + shoulderW;
    const armholeY     = armholeDepthFromChest(m.chest, 'standard');
    const armholeDepth = armholeY - slopeDrop;
    const chestDepth   = panelW - shoulderPtX;
    const torsoLen     = m.torsoLength;
    const slvLength    = SLEEVE_LENGTHS[opts.sleeveStyle] ?? m.sleeveLength ?? 9;
    const shoulderPtY  = slopeDrop;
    const sideX        = shoulderPtX + chestDepth;

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
    const backNeckPts  = sampleCurve(necklineCurve(neckW, NECK_DEPTH_BACK, 'crew'));
    const shoulderPts  = sampleCurve(shoulderSlope(shoulderW, slopeDrop));
    const frontArmPts  = sampleCurve(armholeCurve(shoulderW, chestDepth, armholeDepth, false));
    const backArmPts   = sampleCurve(armholeCurve(shoulderW, chestDepth, armholeDepth, true));

    // ── YOKE LINE (always computed; used only when opts.yoke === 'yoke') ──────
    // Depth = 33% of armhole depth below shoulder — matches denim-jacket.js formula
    const yokeDepth = armholeDepth * 0.33;
    const yokeLineY = shoulderPtY + yokeDepth;

    // Split backArmPts into above/below the yoke seam (absolute coords)
    let yokeArmholeX = sideX; // x on armhole curve at yokeLineY; fallback = underarm
    const backArmAboveYoke = []; // for yoke piece
    const backArmBelowYoke = []; // for back panel when yoke present
    let yokeCrossed = false;

    for (let i = 0; i < backArmPts.length; i++) {
      const ax = shoulderPtX + backArmPts[i].x;
      const ay = shoulderPtY + backArmPts[i].y;
      if (!yokeCrossed && ay < yokeLineY) {
        backArmAboveYoke.push({ ...backArmPts[i], x: ax, y: ay });
      } else if (!yokeCrossed) {
        // Interpolate exact crossing point
        if (backArmAboveYoke.length > 0) {
          const prev = backArmAboveYoke[backArmAboveYoke.length - 1];
          const t = (yokeLineY - prev.y) / (ay - prev.y);
          yokeArmholeX = prev.x + t * (ax - prev.x);
        } else {
          yokeArmholeX = ax;
        }
        const crossPt = { x: yokeArmholeX, y: yokeLineY };
        backArmAboveYoke.push(crossPt);
        backArmBelowYoke.push(crossPt);
        yokeCrossed = true;
        if (ay > yokeLineY) backArmBelowYoke.push({ ...backArmPts[i], x: ax, y: ay });
      } else {
        backArmBelowYoke.push({ ...backArmPts[i], x: ax, y: ay });
      }
    }

    // ── FRONT PANEL (LEFT — RIGHT panel is a mirror, same piece) ─────────────
    const frontPoly = [];
    const neckFrontRev = [...frontNeckPts].reverse();
    for (const p of neckFrontRev) frontPoly.push({ ...p, x: neckW - p.x });
    // ── JUNCTION UNTAGGING — VERIFIED WORKING, DO NOT CHANGE UNLESS NECESSARY ──
    delete frontPoly[0].curve;
    delete frontPoly[frontNeckPts.length - 1].curve;
    for (let i = 1; i < shoulderPts.length; i++) {
      frontPoly.push({ ...shoulderPts[i], x: neckW + shoulderPts[i].x });
    }
    for (let i = 1; i < frontArmPts.length; i++) {
      frontPoly.push({ ...frontArmPts[i], x: shoulderPtX + frontArmPts[i].x, y: shoulderPtY + frontArmPts[i].y });
    }
    if (opts.fit === 'fitted') {
      frontPoly.push({ x: sideX - 1, y: torsoLen * 0.42 }); // waist suppression
    }
    frontPoly.push({ x: sideX, y: torsoLen });
    frontPoly.push({ x: -PLACKET_W, y: torsoLen });
    frontPoly.push({ x: -PLACKET_W, y: NECK_DEPTH_FRONT });

    // ── BACK PANEL ────────────────────────────────────────────────────────────
    const backPoly = [];

    if (opts.yoke === 'yoke') {
      // Back panel starts at yoke seam — no neckline or shoulder in this piece
      backPoly.push({ x: 0, y: yokeLineY }); // CB yoke-seam corner (fold side)
      for (const pt of backArmBelowYoke) backPoly.push({ ...pt });
      // ── JUNCTION UNTAGGING — VERIFIED WORKING, DO NOT CHANGE UNLESS NECESSARY ──
      delete backPoly[0].curve;
      if (backPoly.length > 1) delete backPoly[1].curve;
    } else {
      const neckBackRev = [...backNeckPts].reverse();
      for (const p of neckBackRev) backPoly.push({ ...p, x: neckW - p.x });
      // ── JUNCTION UNTAGGING — VERIFIED WORKING, DO NOT CHANGE UNLESS NECESSARY ──
      delete backPoly[0].curve;
      delete backPoly[backNeckPts.length - 1].curve;
      for (let i = 1; i < shoulderPts.length; i++) {
        backPoly.push({ ...shoulderPts[i], x: neckW + shoulderPts[i].x });
      }
      for (let i = 1; i < backArmPts.length; i++) {
        backPoly.push({ ...backArmPts[i], x: shoulderPtX + backArmPts[i].x, y: shoulderPtY + backArmPts[i].y });
      }
    }
    if (opts.fit === 'fitted') {
      backPoly.push({ x: sideX - 1, y: torsoLen * 0.42 });
    }
    backPoly.push({ x: sideX, y: torsoLen });
    backPoly.push({ x: 0, y: torsoLen });

    // ── BACK YOKE ─────────────────────────────────────────────────────────────
    let yokePoly = null;
    if (opts.yoke === 'yoke') {
      yokePoly = [];
      const neckBackRevYoke = [...backNeckPts].reverse();
      for (const p of neckBackRevYoke) yokePoly.push({ ...p, x: neckW - p.x });
      // ── JUNCTION UNTAGGING — VERIFIED WORKING, DO NOT CHANGE UNLESS NECESSARY ──
      delete yokePoly[0].curve;
      delete yokePoly[backNeckPts.length - 1].curve;
      for (let i = 1; i < shoulderPts.length; i++) {
        yokePoly.push({ ...shoulderPts[i], x: neckW + shoulderPts[i].x });
      }
      // Partial back armhole above yoke seam (skip index 0 — shoulder already added)
      for (let i = 1; i < backArmAboveYoke.length; i++) {
        yokePoly.push({ ...backArmAboveYoke[i] });
      }
      // Close yoke seam horizontally back to CB fold
      yokePoly.push({ x: 0, y: yokeLineY });
    }

    // ── SLEEVE ────────────────────────────────────────────────────────────────
    const effArmToElbow = m.armToElbow || (slvLength * 0.45);
    const sleeveEase = totalEase * 0.2;
    const slvTopW    = m.bicep / 2 + sleeveEase;
    const slvBotW    = opts.sleeveStyle === 'short'
      ? slvTopW - 0.5                                             // short sleeve: 1″ total taper, nearly straight
      : (m.wrist || m.bicep * 0.7) / 2 + 0.5;                   // long sleeve: taper to wrist
    const capH       = armholeDepth * 0.55;
    const capCp      = sleeveCapCurve(m.bicep, capH, slvTopW * 2);
    const capPts     = sampleCurve(capCp, 16);
    validateSleeveSeams('camp-shirt', capPts, frontArmPts, backArmPts);

    const sleevePoly = [];
    for (const p of capPts) sleevePoly.push({ ...p, y: p.y + capH });
    // ── JUNCTION UNTAGGING — VERIFIED WORKING, DO NOT CHANGE UNLESS NECESSARY ──
    delete sleevePoly[0].curve;
    delete sleevePoly[capPts.length - 1].curve;
    sleevePoly.push({ x: slvTopW * 2 - (slvTopW - slvBotW), y: capH + slvLength });
    sleevePoly.push({ x: slvTopW - slvBotW,                  y: capH + slvLength });

    // ── CAMP COLLAR (curved neckline seam) ───────────────────────────────────
    // Camp collar lies flat because the neckline seam is concave: it bows toward
    // the outer/fold edge at CB. A straight neckline seam produces a band collar
    // that stands up; the concave bow is what allows the collar to open and lie flat.
    //
    // Orientation: y=0 = outer/fold edge (top of piece as laid flat)
    //              y=collarH = neckline seam baseline at CF corners
    //              x=0 = left CF, x=collarLen = right CF, collarLen/2 = CB (notched)
    const frontNeckArc = arcLength(frontNeckPts);
    const backNeckArc  = arcLength(backNeckPts);
    const necklineLen  = frontNeckArc * 2 + backNeckArc * 2;
    const collarLen    = necklineLen;
    const collarH      = 3;        // cut height: 1.5″ finished when folded in half
    const pointCut     = collarH;  // outer edge inset from each CF end — gives 45° visible angle

    // Neckline seam: concave arc bowing toward the outer edge at CB by ~0.375"
    // (half of NECK_DEPTH_BACK). bowCtrl solves: 0.75 * bowCtrl = cbBow at t=0.5.
    const cbBow       = NECK_DEPTH_BACK * 0.5;
    const bowCtrl     = cbBow / 0.75;
    const neckSeamPts = sampleBezier(
      { x: 0,               y: collarH },
      { x: collarLen * 0.33, y: collarH - bowCtrl },
      { x: collarLen * 0.67, y: collarH - bowCtrl },
      { x: collarLen,        y: collarH },
      10
    );

    // Polygon: outer-left → outer-right → right CF neckline → [curved arc] → left CF neckline
    const collarPoly = [];
    collarPoly.push({ x: pointCut,             y: 0 }); // left outer front end
    collarPoly.push({ x: collarLen - pointCut, y: 0 }); // right outer front end
    for (let i = neckSeamPts.length - 1; i >= 0; i--) {
      collarPoly.push({ ...neckSeamPts[i], curve: true });
    }
    // Untag CF neckline corners (junctions between diagonal and curved seam)
    delete collarPoly[2].curve;
    delete collarPoly[collarPoly.length - 1].curve;

    const nNeckSeamEdges = neckSeamPts.length - 1;
    const collarEdgeAllowances = [
      { sa: 0, label: 'Outer edge' },   // outer-left → outer-right (fold line — no raw edge)
      { sa,    label: 'Front edge' },   // outer-right → right CF neckline diagonal
    ];
    for (let i = 0; i < nNeckSeamEdges; i++) collarEdgeAllowances.push({ sa, label: 'Neckline' });
    collarEdgeAllowances.push({ sa, label: 'Front edge' }); // left CF neckline → outer-left diagonal

    // ── PLACKET FACING ────────────────────────────────────────────────────────
    const placketH = torsoLen - NECK_DEPTH_FRONT;

    // ── BUTTON SPACING ────────────────────────────────────────────────────────
    const btnCount  = parseInt(opts.buttons) || 5;
    const btnDiam   = 0.5;
    const btnholeSz = fmtInches(btnDiam + 0.125);

    // ── PER-EDGE SEAM ALLOWANCES ──────────────────────────────────────────────
    const nNeckPts     = frontNeckPts.length;
    const nShoulderPts = shoulderPts.length - 1;
    const nFrontArmPts = frontArmPts.length - 1;
    const nBackArmPts  = backArmPts.length - 1;

    // Front panel SA
    const frontEdgeAllowances = [];
    for (let i = 0; i < nNeckPts - 1; i++) frontEdgeAllowances.push({ sa: 0.375, label: 'Neckline' });
    for (let i = 0; i < nShoulderPts; i++) frontEdgeAllowances.push({ sa: 0.625, label: 'Shoulder' });
    for (let i = 0; i < nFrontArmPts; i++) frontEdgeAllowances.push({ sa: 0.375, label: 'Armhole'  });
    if (opts.fit === 'fitted') frontEdgeAllowances.push({ sa: 0.625, label: 'Side seam' });
    frontEdgeAllowances.push({ sa: 0.625, label: 'Side seam' });
    frontEdgeAllowances.push({ sa: hem,   label: 'Hem'       });
    frontEdgeAllowances.push({ sa: 0.625, label: 'Placket'   });
    while (frontEdgeAllowances.length < frontPoly.length) frontEdgeAllowances.push({ sa: 0.625, label: 'Placket' });

    // Back panel SA (differs when yoke is present)
    const backEdgeAllowances = [];
    if (opts.yoke === 'yoke') {
      backEdgeAllowances.push({ sa: 0.625, label: 'Yoke seam' }); // CB → yokeArmholeX
      for (let i = 1; i < backArmBelowYoke.length; i++) backEdgeAllowances.push({ sa: 0.375, label: 'Armhole' });
    } else {
      for (let i = 0; i < nNeckPts - 1; i++) backEdgeAllowances.push({ sa: 0.375, label: 'Neckline' });
      for (let i = 0; i < nShoulderPts; i++) backEdgeAllowances.push({ sa: 0.625, label: 'Shoulder' });
      for (let i = 0; i < nBackArmPts;  i++) backEdgeAllowances.push({ sa: 0.375, label: 'Armhole'  });
    }
    if (opts.fit === 'fitted') backEdgeAllowances.push({ sa: 0.625, label: 'Side seam' });
    backEdgeAllowances.push({ sa: 0.625, label: 'Side seam' });
    backEdgeAllowances.push({ sa: hem,   label: 'Hem' });
    while (backEdgeAllowances.length < backPoly.length) backEdgeAllowances.push({ sa: 0, label: 'Fold' });

    // Sleeve SA
    const nCapPts = capPts.length;
    const sleeveEdgeAllowances = sleevePoly.map((_, i) => {
      if (i < nCapPts - 1)   return { sa: 0.375, label: 'Cap'       };
      if (i === nCapPts - 1) return { sa: 0.625, label: 'Side seam' };
      if (i === nCapPts)     return { sa: hem,   label: 'Hem'       };
      return { sa: 0.625, label: 'Side seam' };
    });

    // Yoke SA
    let yokeEdgeAllowances = null;
    if (opts.yoke === 'yoke' && yokePoly) {
      yokeEdgeAllowances = [];
      for (let i = 0; i < backNeckPts.length - 1; i++) yokeEdgeAllowances.push({ sa: 0.375, label: 'Neckline' });
      for (let i = 0; i < nShoulderPts; i++)            yokeEdgeAllowances.push({ sa: 0.625, label: 'Shoulder' });
      for (let i = 1; i < backArmAboveYoke.length; i++) yokeEdgeAllowances.push({ sa: 0.375, label: 'Armhole'  });
      yokeEdgeAllowances.push({ sa: 0.625, label: 'Yoke seam' });
      while (yokeEdgeAllowances.length < yokePoly.length) yokeEdgeAllowances.push({ sa: 0, label: 'Fold' });
    }

    // ── BOUNDING BOXES ────────────────────────────────────────────────────────
    const frontBB  = bbox(frontPoly);
    const backBB   = bbox(backPoly);
    const sleeveBB = bbox(sleevePoly);
    const collarBB = bbox(collarPoly);

    // ── NOTCHES ───────────────────────────────────────────────────────────────
    const shoulderMidX  = (neckW + shoulderPtX) / 2;
    const shoulderMidY  = slopeDrop / 2;
    const shoulderAngle = edgeAngle({ x: neckW, y: 0 }, { x: shoulderPtX, y: slopeDrop });

    const FRONT_NOTCH_ARC = 3.25;
    const BACK_NOTCH_ARC  = 3.25;
    const frontArmPtsRev  = [...frontArmPts].reverse();
    const backArmPtsRev   = [...backArmPts].reverse();
    const frontNotchPt    = ptAtArcLen(frontArmPtsRev, FRONT_NOTCH_ARC);
    const backNotch1Pt    = ptAtArcLen(backArmPtsRev,  BACK_NOTCH_ARC);
    const backNotch2Pt    = ptAtArcLen(backArmPtsRev,  BACK_NOTCH_ARC + 0.25);
    const frontNotchBodice = { x: frontNotchPt.x + shoulderPtX, y: frontNotchPt.y + shoulderPtY };
    const backNotch1Bodice = { x: backNotch1Pt.x + shoulderPtX, y: backNotch1Pt.y + shoulderPtY };
    const backNotch2Bodice = { x: backNotch2Pt.x + shoulderPtX, y: backNotch2Pt.y + shoulderPtY };

    const frontNotches = [
      { x: shoulderMidX, y: shoulderMidY, angle: shoulderAngle },
      { x: sideX,        y: armholeY,     angle: 0 },
      { x: frontNotchBodice.x, y: frontNotchBodice.y, angle: 0 },
    ];

    const backNotches = opts.yoke === 'yoke'
      ? [
          { x: yokeArmholeX, y: yokeLineY, angle: 0 },
          { x: sideX,        y: armholeY,  angle: 0 },
          { x: backNotch1Bodice.x, y: backNotch1Bodice.y, angle: 0 },
          { x: backNotch2Bodice.x, y: backNotch2Bodice.y, angle: 0 },
        ]
      : [
          { x: shoulderMidX, y: shoulderMidY, angle: shoulderAngle },
          { x: sideX,        y: armholeY,     angle: 0 },
          { x: backNotch1Bodice.x, y: backNotch1Bodice.y, angle: 0 },
          { x: backNotch2Bodice.x, y: backNotch2Bodice.y, angle: 0 },
        ];

    const sleeveNotches = [
      { x: slvTopW, y: 0, angle: -90 },
      { x: slvTopW * 0.5, y: capH * 0.5, angle: edgeAngle({ x: 0, y: capH }, { x: slvTopW, y: 0 }) },
      { x: slvTopW * 1.5, y: capH * 0.5, angle: edgeAngle({ x: slvTopW, y: 0 }, { x: slvTopW * 2, y: capH }) },
    ];

    const collarNotches = [
      { x: collarLen / 2, y: collarH, angle: 90  }, // CB neckline mark
      { x: collarLen / 2, y: 0,       angle: -90 }, // CB outer edge mark
    ];

    // ── PIECES ────────────────────────────────────────────────────────────────
    const pieces = [
      {
        id: 'bodice-front',
        name: 'Front Panel (Left)',
        instruction: `Cut 2 (L & R mirror) · CF edge has ${fmtInches(PLACKET_W)} placket extension · Right front: ${btnCount} horizontal buttonholes at ${btnholeSz} · Left front: ${btnCount} buttons spaced evenly`,
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
        name: opts.yoke === 'yoke' ? 'Back Body (below yoke)' : 'Back Panel',
        instruction: opts.yoke === 'yoke'
          ? 'Cut 1 on fold (CB) · Yoke seam at top · Place fold at CB edge'
          : 'Cut 1 on fold (CB) · Place fold at CB edge',
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
          { label: fmtInches(backW) + ' half width', x1: 0, y1: (opts.yoke === 'yoke' ? yokeLineY : 0) - 0.5, x2: backW, y2: (opts.yoke === 'yoke' ? yokeLineY : 0) - 0.5, type: 'h' },
          { label: fmtInches(opts.yoke === 'yoke' ? torsoLen - yokeLineY : torsoLen) + ' length', x: backBB.maxX + 1, y1: opts.yoke === 'yoke' ? yokeLineY : 0, y2: torsoLen, type: 'v' },
        ],
      },
    ];

    if (opts.yoke === 'yoke' && yokePoly) {
      const yokeBB = bbox(yokePoly);
      pieces.push({
        id: 'back-yoke',
        name: 'Back Yoke',
        instruction: `Cut 2 (outer + lining) on fold (CB) · Yoke seam at bottom · ${fmtInches(yokeLineY - shoulderPtY)} deep`,
        type: 'bodice',
        polygon: yokePoly,
        path: polyToPathStr(yokePoly),
        width: yokeBB.maxX - yokeBB.minX,
        height: yokeBB.maxY - yokeBB.minY,
        isBack: true,
        sa, hem: 0,
        notches: [
          { x: shoulderMidX, y: shoulderMidY, angle: shoulderAngle },
          { x: yokeArmholeX, y: yokeLineY,    angle: 0 },
        ],
        edgeAllowances: yokeEdgeAllowances,
        dims: [
          { label: fmtInches(backW) + ' half width', x1: 0, y1: -0.5, x2: backW, y2: -0.5, type: 'h' },
          { label: fmtInches(yokeLineY) + ' depth', x: yokeBB.maxX + 1, y1: 0, y2: yokeLineY, type: 'v' },
        ],
      });
    }

    pieces.push(
      {
        id: 'sleeve',
        name: 'Sleeve',
        instruction: `Cut 2 (mirror L & R) · Straight grain along center length · ${opts.sleeveStyle === 'short' ? 'Short sleeve' : 'Long sleeve'}`,
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
        id: 'collar',
        name: 'Camp Collar',
        instruction: `Cut 2 (outer + undercollar) · Interface outer only · CB notch at center · ${fmtInches(collarLen)} neckline seam · Fold in half lengthwise (WS together) to verify symmetry before sewing`,
        type: 'bodice',
        polygon: collarPoly,
        path: polyToPathStr(collarPoly),
        width: collarBB.maxX - collarBB.minX,
        height: collarBB.maxY - collarBB.minY,
        sa,
        notches: collarNotches,
        edgeAllowances: collarEdgeAllowances,
        dims: [
          { label: fmtInches(collarLen) + ' neckline', x1: 0, y1: collarH + 0.5, x2: collarLen, y2: collarH + 0.5, type: 'h' },
          { label: fmtInches(collarH) + ' cut height', x: collarLen + 1, y1: 0, y2: collarH, type: 'v' },
        ],
      },
      {
        id: 'placket-facing',
        name: 'Front Placket Facing',
        instruction: `Cut 2 (L & R) · Interface both · ${fmtInches(PLACKET_W + 0.5)} wide × ${fmtInches(placketH)} long`,
        type: 'pocket',
        dimensions: { width: PLACKET_W + 0.5, height: placketH },
        sa,
      },
    );

    if (opts.chestPocket === 'patch') {
      pieces.push({
        id: 'chest-pocket',
        name: 'Chest Patch Pocket',
        instruction: 'Cut 1 · Position at left chest 2.5″ below neckline, 1.5″ from placket · Top edge: 1″ hem (fold under ½″ twice, {topstitch}) · Sides + bottom: SA',
        type: 'pocket',
        dimensions: { width: 4, height: 5 },
        sa, hem: 1.0, hemEdge: 'top',
      });
    }

    return pieces;
  },

  materials(m, opts) {
    const btnCount  = parseInt(opts.buttons) || 5;
    const isLong    = opts.sleeveStyle === 'long';
    const hasYoke   = opts.yoke === 'yoke';

    // Yardage estimates rounded up to nearest ¼ yard
    const torsoLen = m.torsoLength || 28;
    const slvLen   = isLong ? 26 : 9;
    function yds(inches) { return (Math.ceil((inches / 36) * 4) / 4).toFixed(2); }

    // 45″: layout needs 2 body lengths (front panel pair) + sleeve + collar/yoke/pocket buffer
    const raw45 = torsoLen * 2 + slvLen + 10 + (hasYoke ? 8 : 0);
    // 60″: wider fabric fits front + back in one row — meaningful savings
    const raw60 = torsoLen + slvLen + 8 + (hasYoke ? 6 : 0);

    const yardage45 = yds(raw45);
    const yardage60 = yds(raw60);

    const notions = [
      {
        name: 'Buttons',
        quantity: `${btnCount + 1}`,
        notes: `½″ or ⅝″ shirt buttons, +1 spare. Corozo (tagua nut), shell, or horn buttons elevate the look considerably — search "corozo shirt buttons" on Etsy or Wawak, ~$5–8 per card of 10.`,
      },
      {
        ref: 'interfacing-light',
        quantity: `¼ yard (collar outer${hasYoke ? ' + yoke outer' : ''} + placket facings)`,
      },
    ];

    return buildMaterialsSpec({
      fabrics: [
        'rayon-challis',
        'cotton-lawn',
        'viscose',
        'tencel',
        'linen-light',
        {
          name: 'Quilting cotton',
          weight: '3–4 oz/yd²',
          stretch: false,
          category: 'woven',
          notes: 'Beginner-friendly and available in a huge range of novelty prints, but lacks the drape of rayon or lawn. Expect a stiffer, more casual result.',
        },
      ],
      notions,
      thread: 'poly-all',
      needle: 'universal-80',
      stitches: ['straight-2.5', 'straight-1.8', 'zigzag-small'],
      notes: [
        `Yardage — 45″ wide fabric: ${yardage45} yds · 60″ wide fabric: ${yardage60} yds (add ¼ yd extra if matching a print at the pocket)`,
        'Pre-wash before cutting. Rayon challis shrinks 3–5%; cotton lawn 2–3%. Wash cold, hang dry or tumble on low.',
        'Camp shirts need drape. Avoid canvas, duck, denim, heavy linen, or any fabric that holds a crease without ironing.',
        'Interface the outer collar only — not the undercollar. For rayon or lawn, prefer sew-in interfacing; fusible can show through and separate after washing.',
        `Button spacing: divide placket length by ${btnCount - 1}. Place top button 1″ from neckline, bottom button 1″ from hem, space the rest evenly.`,
        'Test buttonhole stitch on a scrap of your fabric layered with interfacing before sewing on the shirt.',
        'Optional upgrades: French seams for rayon or lawn (clean interior, no serger needed — sew WS together at 3mm, trim, fold RST, sew at 6mm) · Flat-felled seams for chambray or linen (very durable, flat interior) · Match print at chest pocket for a bespoke detail.',
        isLong ? 'Long sleeve: consider hemming the sleeve before setting it if your machine struggles sewing inside the full shirt tube.' : '',
      ].filter(Boolean),
    });
  },

  instructions(m, opts) {
    const steps    = [];
    let n          = 1;
    const btnCount = parseInt(opts.buttons) || 5;
    const hasYoke  = opts.yoke === 'yoke';

    steps.push({
      step: n++, title: 'Stay-stitch curves',
      detail: 'Before handling or sewing, stay-stitch the neckline and armhole curves on all bodice pieces at ⅜″ from the raw edge. Sew directionally: shoulder toward CF on the neckline, shoulder toward underarm on the armhole. This prevents bias-cut areas from stretching out of shape during construction.',
    });

    if (opts.chestPocket === 'patch') {
      steps.push({
        step: n++, title: 'Prepare chest pocket',
        detail: '{serge} or {zigzag} top edge. Fold top under ½″, {topstitch}. {press} remaining three edges under ⅝″. Set aside — attach after shoulder seams are sewn.',
      });
    }

    steps.push({
      step: n++, title: 'Prepare camp collar',
      detail: 'Fuse interfacing to outer collar only (not undercollar). Sew outer to undercollar {RST} along both front edges and the outer edge, leaving the neckline edge open. Trim seam allowances to 3mm; {clip} the angled front corners diagonally close to stitching. Turn RS out. {press} flat, rolling the seam slightly toward the undercollar so it stays hidden. {understitch} undercollar along the outer edge if desired — this prevents the seam from rolling forward when worn.',
    });

    steps.push({
      step: n++, title: 'Prepare front plackets',
      detail: `Fuse interfacing to both placket facing strips. {press} the center front fold line ${fmtInches(PLACKET_W)} from the CF edge on each front panel. Fold placket extension to WS along the fold line, {press}. Sew facing to placket edge {RST}, {press} seam toward facing, fold under, then {slipstitch} or {topstitch} to WS.`,
    });

    if (hasYoke) {
      steps.push({
        step: n++, title: 'Attach back yoke',
        detail: 'Sew the back body to the outer yoke {RST} at the yoke seam. {press} seam allowance toward the yoke. Place the yoke lining over, sandwiching the back body between the two yoke layers (lining {RST} to outer yoke). Sew along the yoke seam again through all layers. Turn lining up and {press}. {edgestitch} from RS close to the yoke seam.',
      });
    }

    steps.push({
      step: n++, title: 'Sew shoulder seams',
      detail: 'Join front panels to back at shoulders {RST}. {press} toward back. For French seams: sew WS together at 3mm, trim to 2mm, fold {RST}, sew at 6mm.',
    });

    if (opts.chestPocket === 'patch') {
      steps.push({
        step: n++, title: 'Attach chest pocket',
        detail: 'Position pocket on left front panel 2.5″ below the shoulder seam, 1.5″ from the placket fold. Pin and {topstitch} on 3 sides. Bar tack top two corners.',
      });
    }

    steps.push({
      step: n++, title: 'Attach collar',
      detail: 'Pin outer collar to neckline {RST}, matching CF marks on each front panel and the CB notch at center back. Sew collar to neckline through outer collar and bodice only — leave undercollar free. {clip} the curve every ½″. Fold undercollar seam allowance under, pin to cover the neckline seam on WS. {slipstitch} or {edgestitch} from RS.',
    });

    steps.push({
      step: n++, title: 'Set sleeves',
      detail: 'Match the sleeve crown notch to the shoulder seam. Pin sleeve into armhole {RST}, distributing any ease evenly across the cap. Short sleeves need minimal easing. Sew with the sleeve side up so you can guide ease under the needle. {press} seam toward sleeve.',
    });

    steps.push({
      step: n++, title: 'Sew side and underarm seams',
      detail: 'Sew front to back at side seams in one continuous seam from shirt hem through the underarm to sleeve hem {RST}. {press} toward back.',
    });

    steps.push({
      step: n++, title: 'Finish seam allowances',
      detail: 'Choose one method based on fabric and tools: {serge} (fastest, requires serger) · {zigzag} at 3mm wide (machine only) · French seams (cleanest interior — ideal for rayon and lawn; see shoulder seam note) · Flat-felled seams (most durable — sew, {press} both SA to one side, trim inner to 3mm, fold outer over it, {topstitch}).',
    });

    steps.push({
      step: n++, title: 'Hem sleeves and body',
      detail: `Sleeve hem: fold up ${fmtInches(parseFloat(opts.hem))} twice, {press}, {topstitch} close to inner fold. Body hem: fold up ${fmtInches(parseFloat(opts.hem))} twice, {press}, {topstitch}. Clip the hem allowance at the side seam junction to reduce bulk before folding.`,
    });

    steps.push({
      step: n++, title: 'Buttonholes and buttons',
      detail: `Mark ${btnCount} horizontal buttonhole positions on right front placket: first 1″ from neckline, last 1″ from hem, evenly spaced between. Test buttonhole stitch on a layered scrap first. Sew buttonholes. Cut open with a seam ripper, using a pin across the far end to prevent over-cutting. Sew buttons to left placket at matching positions.`,
    });

    steps.push({
      step: n++, title: 'Final press',
      detail: '{press} entire shirt with steam. Press collar flat so it lies smoothly against the chest when worn open. Verify button placket hangs straight and collar sits evenly at the neckline.',
    });

    return steps;
  },

  variants: [
    { id: 'vacation-shirt',    name: 'Vacation Shirt',          defaults: { sleeveStyle: 'short', fit: 'relaxed',  chestPocket: 'patch', yoke: 'none' } },
    { id: 'fitted-camp-shirt', name: 'Fitted Camp Shirt',       defaults: { sleeveStyle: 'short', fit: 'fitted',   chestPocket: 'none',  yoke: 'none' } },
    { id: 'fitted-linen-camp', name: 'Fitted Linen Camp Shirt', defaults: { sleeveStyle: 'long',  fit: 'fitted',   chestPocket: 'none',  yoke: 'none' } },
    { id: 'classic-camp-yoke', name: 'Classic Camp Shirt',      defaults: { sleeveStyle: 'short', fit: 'standard', chestPocket: 'patch', yoke: 'yoke' } },
  ],
};
