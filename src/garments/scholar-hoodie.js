// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Scholar Hoodie — oversized dropped-shoulder pullover hoodie with a
 * two-panel curved hood, kangaroo pocket, and ribbed hem and cuffs.
 * Inspired by the Alo Yoga Scholar Hooded Sweater.
 *
 * Key differences vs. base hoodie:
 *   - Dropped shoulder: shoulder seam extends `shoulderDrop` (default 2.5″)
 *     past the natural shoulder point. The slope is flattened to near-horizontal
 *     so the sleeve hangs cleanly off the upper arm.
 *   - Armhole is lowered by `shoulderDrop` so the dropped-seam-plus-sleeve
 *     geometry matches the bodice.
 *   - Shallower sleeve cap (0.35 × armhole depth) — dropped-shoulder sleeves
 *     need less cap height because most of the shaping is absorbed by the
 *     extended shoulder, not the cap itself.
 *   - Locked to oversized (+10″) pullover fit with a taller 2″ finished rib hem.
 *
 * Hood panel, kangaroo pocket, rib cuffs, and rib waistband are sourced from
 * `hoodie.js` by calling its `pieces()` with oversized-pullover defaults and
 * picking the relevant pieces out of the returned array. This keeps the hood
 * curve, pocket hex geometry, and rib widths in one place.
 */

import hoodie from './hoodie.js';
import {
  shoulderSlope, necklineCurve, armholeCurve, sleeveCapCurve,
  neckWidthFromCircumference, UPPER_EASE, validateSleeveSeams,
} from '../engine/upper-body.js';
import { sampleBezier, fmtInches, edgeAngle, dist } from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

// Default shoulder drop (inches) past natural shoulder — the signature Scholar look.
const DEFAULT_SHOULDER_DROP = 2.5;
// Rib hem: taller than the base hoodie's 1.5″ finished to match Alo's proportions.
const HEM_RIB_CUT = 4;        // 4″ cut → 2″ finished
const HEM_RIB_PCT = 0.90;     // 90% of body hem circumference

export default {
  id: 'scholar-hoodie',
  name: 'Scholar Hoodie',
  category: 'upper',
  difficulty: 'advanced',
  priceTier: 'tailored',
  measurements: hoodie.measurements,
  measurementDefaults: hoodie.measurementDefaults,

  options: {
    shoulderDrop: {
      type: 'number',
      label: 'Shoulder drop (inches past natural)',
      default: DEFAULT_SHOULDER_DROP,
      step: 0.25,
      min: 1,
      max: 4,
    },
    hoodLining: { ...hoodie.options.hoodLining },
    sa:         { ...hoodie.options.sa },
    hem:        { ...hoodie.options.hem },
  },

  pieces(m, opts) {
    const sa  = parseFloat(opts.sa)  || 0.5;
    const hem = parseFloat(opts.hem) || 0.75;
    const shoulderDrop = Math.max(0, parseFloat(opts.shoulderDrop) || DEFAULT_SHOULDER_DROP);

    // ── Hard-coded: Scholar is always oversized pullover ────────────────────
    const totalEase = UPPER_EASE.oversized;                // +10″
    const panelW    = (m.chest + totalEase) / 4;
    const frontW    = panelW;
    const backW     = panelW;

    const halfShoulder    = m.shoulder / 2;
    const neckW           = neckWidthFromCircumference(m.neck);
    const naturalShoulder = halfShoulder - neckW;

    // Dropped shoulder: extend the seam past the natural shoulder point.
    // Flatten the slope significantly — dropped shoulders are visually flat
    // (the body of the garment carries the sleeve rather than the shoulder).
    const shoulderW   = naturalShoulder + shoulderDrop;
    const slopeDrop   = 0.5;                                // essentially flat
    const shoulderPtX = neckW + shoulderW;

    // Lower the armhole by the dropped amount so the side seam meets the
    // panel side cleanly and the sleeve has somewhere to attach.
    const armholeY     = (m.chest / 4) + 1.5 + shoulderDrop;
    const armholeDepth = armholeY - slopeDrop;
    const chestDepth   = panelW - shoulderPtX;

    if (chestDepth < 0.5) {
      console.warn(`[scholar-hoodie] chestDepth is ${chestDepth.toFixed(2)}″ — shoulder drop may be too large for this chest. Reduce shoulderDrop or increase chest measurement.`);
    }

    const torsoLen  = m.torsoLength;
    const slvLength = m.sleeveLength ?? 25;

    // ── Helpers copied from hoodie.js pattern ─────────────────────────────
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
    function ptAtArcLen(pts, targetLen) {
      let walked = 0;
      for (let i = 1; i < pts.length; i++) {
        const d = dist(pts[i - 1], pts[i]);
        if (walked + d >= targetLen) {
          const t = (targetLen - walked) / d;
          return {
            x: pts[i - 1].x + t * (pts[i].x - pts[i - 1].x),
            y: pts[i - 1].y + t * (pts[i].y - pts[i - 1].y),
          };
        }
        walked += d;
      }
      return pts[pts.length - 1];
    }

    const shoulderPtY = slopeDrop;

    // ── FRONT BODICE ─────────────────────────────────────────────────────
    const neckDepthFront = 2.5;
    const frontNeckPts     = sampleCurve(necklineCurve(neckW, neckDepthFront, 'crew'));
    const frontShoulderPts = sampleCurve(shoulderSlope(shoulderW, slopeDrop));
    const frontArmPts      = sampleCurve(armholeCurve(shoulderW, chestDepth, armholeDepth, false));

    const frontPoly = [];
    const neckFrontRev = [...frontNeckPts].reverse();
    for (const p of neckFrontRev) frontPoly.push({ ...p, x: neckW - p.x });
    delete frontPoly[0].curve;  // fold-neckline junction
    delete frontPoly[frontNeckPts.length - 1].curve;  // shoulder-neck junction
    for (let i = 1; i < frontShoulderPts.length; i++) {
      frontPoly.push({ ...frontShoulderPts[i], x: neckW + frontShoulderPts[i].x });
    }
    for (let i = 1; i < frontArmPts.length; i++) {
      frontPoly.push({ ...frontArmPts[i], x: shoulderPtX + frontArmPts[i].x, y: shoulderPtY + frontArmPts[i].y });
    }
    const sideX = shoulderPtX + chestDepth;
    frontPoly.push({ x: sideX, y: torsoLen });
    frontPoly.push({ x: 0,     y: torsoLen });
    frontPoly.push({ x: 0,     y: neckDepthFront });

    // ── BACK BODICE ──────────────────────────────────────────────────────
    const neckDepthBack = 0.75;
    const backNeckPts   = sampleCurve(necklineCurve(neckW, neckDepthBack, 'crew'));
    const backArmPts    = sampleCurve(armholeCurve(shoulderW, chestDepth, armholeDepth, true));

    const backPoly = [];
    const neckBackRev = [...backNeckPts].reverse();
    for (const p of neckBackRev) backPoly.push({ ...p, x: neckW - p.x });
    delete backPoly[0].curve;
    delete backPoly[backNeckPts.length - 1].curve;
    for (let i = 1; i < frontShoulderPts.length; i++) {
      backPoly.push({ ...frontShoulderPts[i], x: neckW + frontShoulderPts[i].x });
    }
    for (let i = 1; i < backArmPts.length; i++) {
      backPoly.push({ ...backArmPts[i], x: shoulderPtX + backArmPts[i].x, y: shoulderPtY + backArmPts[i].y });
    }
    const backSideX = shoulderPtX + chestDepth;
    backPoly.push({ x: backSideX, y: torsoLen });
    backPoly.push({ x: 0,         y: torsoLen });

    // ── SLEEVE (shallow-cap, dropped-shoulder style) ─────────────────────
    const sleeveEase = totalEase * 0.30;                    // a bit more ease than the base hoodie
    const slvWidth   = m.bicep / 2 + sleeveEase;
    const capHeight  = armholeDepth * 0.35;                 // shallow cap for dropped shoulder
    const capCp      = sleeveCapCurve(m.bicep, capHeight, slvWidth * 2);
    const capPts     = sampleCurve(capCp, 16);
    const sleevePoly = [];
    for (const p of capPts) sleevePoly.push({ ...p, y: p.y + capHeight });
    delete sleevePoly[0].curve;
    delete sleevePoly[capPts.length - 1].curve;
    sleevePoly.push({ x: slvWidth * 2, y: capHeight + slvLength });
    sleevePoly.push({ x: 0,            y: capHeight + slvLength });

    // ── NOTCHES (crown + underarm) ───────────────────────────────────────
    const shoulderMidX = neckW + shoulderW / 2;
    const shoulderMidY = slopeDrop / 2;
    const frontArmPtsRev = [...frontArmPts].reverse();
    const backArmPtsRev  = [...backArmPts].reverse();
    const NOTCH_ARC = 3.0;  // slightly tighter than base hoodie because the cap is shallower
    const frontNotchPt = ptAtArcLen(frontArmPtsRev, NOTCH_ARC);
    const backNotch1Pt = ptAtArcLen(backArmPtsRev,  NOTCH_ARC);
    const backNotch2Pt = ptAtArcLen(backArmPtsRev,  NOTCH_ARC + 0.25);
    const fArmOffset = { x: shoulderPtX, y: shoulderPtY };
    const frontNotchBodice = { x: frontNotchPt.x + fArmOffset.x, y: frontNotchPt.y + fArmOffset.y };
    const backNotch1Bodice = { x: backNotch1Pt.x + fArmOffset.x, y: backNotch1Pt.y + fArmOffset.y };
    const backNotch2Bodice = { x: backNotch2Pt.x + fArmOffset.x, y: backNotch2Pt.y + fArmOffset.y };

    const frontNotches = [
      { x: shoulderMidX, y: shoulderMidY, angle: edgeAngle({ x: neckW, y: 0 }, { x: shoulderPtX, y: slopeDrop }) },
      { x: sideX, y: armholeY, angle: 0 },
      { x: frontNotchBodice.x, y: frontNotchBodice.y, angle: 0 },
    ];
    const backNotches = [
      { x: shoulderMidX, y: shoulderMidY, angle: edgeAngle({ x: neckW, y: 0 }, { x: shoulderPtX, y: slopeDrop }) },
      { x: backSideX, y: armholeY, angle: 0 },
      { x: backNotch1Bodice.x, y: backNotch1Bodice.y, angle: 0 },
      { x: backNotch2Bodice.x, y: backNotch2Bodice.y, angle: 0 },
    ];

    // Sleeve cap notches
    const capMidIdx = Math.floor(capPts.length / 2);
    const backCapPts     = capPts.slice(0, capMidIdx + 1);
    const frontCapPtsRev = [...capPts.slice(capMidIdx)].reverse();
    const backCapNotch1  = ptAtArcLen(backCapPts,     NOTCH_ARC);
    const backCapNotch2  = ptAtArcLen(backCapPts,     NOTCH_ARC + 0.25);
    const frontCapNotch  = ptAtArcLen(frontCapPtsRev, NOTCH_ARC);
    const capW = slvWidth * 2;
    const sleeveNotches = [
      { x: capW / 2, y: 0, angle: -90 },
      { x: backCapNotch1.x, y: backCapNotch1.y + capHeight, angle: edgeAngle(backCapPts[0], backCapPts[1]) },
      { x: backCapNotch2.x, y: backCapNotch2.y + capHeight, angle: edgeAngle(backCapPts[0], backCapPts[1]) },
      { x: frontCapNotch.x, y: frontCapNotch.y + capHeight, angle: edgeAngle(frontCapPtsRev[0], frontCapPtsRev[1]) },
    ];

    // Validate cap ease — knit hoodies accept lower ease than wovens (≥0)
    const { capArc, armholeArc, capEase } = validateSleeveSeams('scholar-hoodie', capPts, frontArmPts, backArmPts);
    const capEaseNote = `Sleeve cap: ${fmtInches(capArc)}, Armhole: ${fmtInches(armholeArc)}, Ease: ${fmtInches(capEase)}`;

    const frontBB  = bbox(frontPoly);
    const backBB   = bbox(backPoly);
    const sleeveBB = bbox(sleevePoly);

    // ── HOOD + KANGAROO POCKET + RIB CUFFS (delegate to hoodie.js) ────────
    // Call hoodie.pieces() in pullover+oversized mode and steal just the
    // hood-panel, kangaroo-pocket, and cuff pieces. This keeps the hood
    // curve math and pocket hexagon geometry in one place.
    const delegateOpts = { ...opts, fit: 'oversized', frontStyle: 'pullover' };
    const borrowed = hoodie.pieces(m, delegateOpts);
    const hoodPanel    = borrowed.find(p => p.id === 'hood-panel');
    const kangaroo     = borrowed.find(p => p.id === 'kangaroo-pocket');
    const cuff         = borrowed.find(p => p.id === 'cuff');

    // ── TALLER RIB HEM (Scholar-specific) ────────────────────────────────
    const hemCirc   = (frontW + backW) * 2;
    const hemRibLen = hemCirc * HEM_RIB_PCT;
    const hemRib = {
      id: 'waistband',
      name: 'Rib Hem',
      instruction: `Cut 1 from rib knit on fold · ${fmtInches(hemRibLen)} long × ${fmtInches(HEM_RIB_CUT)} cut (${fmtInches(HEM_RIB_CUT / 2)} finished) · ${Math.round(HEM_RIB_PCT * 100)}% of body hem circumference`,
      type: 'rectangle',
      dimensions: { length: hemRibLen, width: HEM_RIB_CUT },
      sa,
    };

    // ── ASSEMBLE PIECES ──────────────────────────────────────────────────
    const pieces = [
      {
        id: 'bodice-front',
        name: 'Front Bodice',
        instruction: `Cut 1 on fold (CF) · Dropped shoulder (+${fmtInches(shoulderDrop)} past natural)`,
        type: 'bodice',
        polygon: frontPoly,
        path: polyToPathStr(frontPoly),
        width: frontBB.maxX - frontBB.minX,
        height: frontBB.maxY - frontBB.minY,
        isBack: false,
        sa, hem,
        notches: frontNotches,
        dims: [
          { label: fmtInches(frontW) + ' half width', x1: 0, y1: -0.5, x2: frontW, y2: -0.5, type: 'h' },
          { label: fmtInches(torsoLen) + ' length', x: frontBB.maxX + 1, y1: 0, y2: torsoLen, type: 'v' },
          { label: fmtInches(shoulderDrop) + ' drop', x1: neckW + naturalShoulder, y1: shoulderPtY + 0.5, x2: shoulderPtX, y2: shoulderPtY + 0.5, type: 'h', color: '#b8963e' },
        ],
      },
      {
        id: 'bodice-back',
        name: 'Back Bodice',
        instruction: `Cut 1 on fold (CB) · Dropped shoulder (+${fmtInches(shoulderDrop)} past natural)`,
        type: 'bodice',
        polygon: backPoly,
        path: polyToPathStr(backPoly),
        width: backBB.maxX - backBB.minX,
        height: backBB.maxY - backBB.minY,
        isBack: true,
        sa, hem,
        notches: backNotches,
        dims: [
          { label: fmtInches(backW) + ' half width', x1: 0, y1: -0.5, x2: backW, y2: -0.5, type: 'h' },
          { label: fmtInches(torsoLen) + ' length', x: backBB.maxX + 1, y1: 0, y2: torsoLen, type: 'v' },
        ],
      },
      {
        id: 'sleeve',
        name: 'Sleeve',
        instruction: `Cut 2 (mirror L & R) · Shallow cap for dropped shoulder · ${capEaseNote}`,
        type: 'sleeve',
        polygon: sleevePoly,
        path: polyToPathStr(sleevePoly),
        width: sleeveBB.maxX - sleeveBB.minX,
        height: sleeveBB.maxY - sleeveBB.minY,
        capHeight,
        sleeveLength: slvLength,
        sleeveWidth: slvWidth * 2,
        sa, hem,
        notches: sleeveNotches,
        dims: [
          { label: fmtInches(slvWidth * 2) + ' underarm', x1: 0, y1: capHeight + 0.4, x2: slvWidth * 2, y2: capHeight + 0.4, type: 'h' },
          { label: fmtInches(slvLength) + ' length', x: slvWidth * 2 + 1, y1: capHeight, y2: capHeight + slvLength, type: 'v' },
        ],
      },
    ];

    if (hoodPanel) pieces.push(hoodPanel);
    if (kangaroo)  pieces.push(kangaroo);
    pieces.push(hemRib);
    if (cuff) pieces.push(cuff);

    return pieces;
  },

  materials(m, opts) {
    // Reuse the base hoodie materials in pullover+oversized mode and append
    // a Scholar-specific note about the dropped shoulder and sweater-knit fabric.
    const base = hoodie.materials(m, { ...opts, fit: 'oversized', frontStyle: 'pullover' });
    return {
      ...base,
      notes: [
        ...(base.notes || []),
        `Dropped shoulder: the shoulder seam sits ${fmtInches(opts.shoulderDrop || DEFAULT_SHOULDER_DROP)} past the natural shoulder point. When setting the sleeve, match the crown notch to the shoulder seam and ease very gently — the shallow cap has almost no ease and should pin flat.`,
        'Fabric note: Alo Scholar is a heavyweight knitted cotton sweater yarn. A heavy french terry, 14oz+ fleece, or a stable sweater knit will all read correctly.',
      ],
    };
  },

  instructions(m, opts) {
    // Delegate to the base hoodie with pullover+oversized defaults, then
    // prepend a Scholar-specific note about the dropped-shoulder sleeve set.
    const baseSteps = hoodie.instructions(m, { ...opts, fit: 'oversized', frontStyle: 'pullover' });
    const setSleevesIdx = baseSteps.findIndex(s => /set sleeves/i.test(s.title));

    const droppedNote = {
      title: 'Set sleeves (dropped-shoulder note)',
      detail: 'The armhole sits well off the natural shoulder. The cap has minimal ease, so it should pin flat to the armhole without gathers. Match the crown notch to the shoulder seam, pin underarms, and stretch stitch without easing. If puckers appear along the cap, relax pressure and let the knit recover before sewing.',
    };

    let out;
    if (setSleevesIdx === -1) {
      out = [droppedNote, ...baseSteps];
    } else {
      out = [
        ...baseSteps.slice(0, setSleevesIdx),
        droppedNote,
        ...baseSteps.slice(setSleevesIdx),
      ];
    }
    return out.map((s, i) => ({ ...s, step: i + 1 }));
  },
};
