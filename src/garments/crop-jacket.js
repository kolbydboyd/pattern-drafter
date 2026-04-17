// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Crop Jacket (Chore Coat style) — woven outerwear, extra ease for layering.
 * Front panels split at CF for button/snap placket.
 * Flat-felled seams on shoulders and side seams.
 * Stand collar (point or Mandarin/band). Large hip patch pockets.
 * Fabric: cotton canvas 10–12 oz, bull denim, waxed cotton.
 */

import {
  shoulderSlope, necklineCurve, armholeCurve, sleeveCapCurve, collarCurve,
  shoulderDropFromWidth, armholeDepthFromChest, chestEaseDistribution,
  neckWidthFromCircumference, UPPER_EASE,
} from '../engine/upper-body.js';
import { sampleBezier, fmtInches, edgeAngle, arcLength } from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';
import { flatFelledSeam } from '../lib/seam-techniques.js';

const PLACKET_W   = 1.5;  // button placket extension each front panel
const FACING_W    = 3.0;  // front facing width (interfaced)

export default {
  id: 'crop-jacket',
  name: 'Crop Jacket',
  category: 'upper',
  difficulty: 'advanced',
  priceTier: 'tailored',
  measurements: ['chest', 'shoulder', 'neck', 'sleeveLength', 'bicep', 'wrist', 'torsoLength'],
  measurementDefaults: { sleeveLength: 26 },

  options: {
    length: {
      type: 'select', label: 'Jacket length',
      values: [
        { value: 'crop', label: 'Crop, at waist (torso length)' },
        { value: 'hip',  label: 'Hip, +4″ below waist'          },
      ],
      default: 'crop',
    },
    collar: {
      type: 'select', label: 'Collar style',
      values: [
        { value: 'point',   label: 'Worker / point stand collar' },
        { value: 'mandarin', label: 'Mandarin / band collar'     },
      ],
      default: 'point',
    },
    closure: {
      type: 'select', label: 'Closure',
      values: [
        { value: 'button', label: 'Buttons (shank)'    },
        { value: 'snap',   label: 'Snap buttons'       },
        { value: 'zipper', label: 'Separating zipper (Detroit)' },
      ],
      default: 'zipper',
    },
    lining: {
      type: 'select', label: 'Lining',
      values: [
        { value: 'none',    label: 'Unlined'                  },
        { value: 'poplin',  label: 'Poplin (lightweight)'     },
        { value: 'flannel', label: 'Flannel (warmth, blanket)' },
      ],
      default: 'none',
    },
    lowerPocket: {
      type: 'select', label: 'Lower pockets',
      values: [
        { value: 'patch', label: 'Hip patch pockets ×2' },
        { value: 'welt',  label: 'Welt pockets ×2 (Detroit)' },
      ],
      default: 'patch',
    },
    chestPocket: {
      type: 'select', label: 'Chest pocket',
      values: [
        { value: 'none',  label: 'None'                   },
        { value: 'patch', label: 'Patch with pencil slot' },
        { value: 'zip',   label: 'Zippered welt pocket'   },
      ],
      default: 'none',
    },
    innerPocket: {
      type: 'select', label: 'Inner breast pocket',
      values: [
        { value: 'none', label: 'None'                              },
        { value: 'welt', label: 'Welt pocket in lining (needs lining)' },
      ],
      default: 'none',
    },
    cuff: {
      type: 'select', label: 'Cuff',
      values: [
        { value: 'plain', label: 'Plain hemmed cuff'         },
        { value: 'tab',   label: 'Adjustable tab (snap/button)' },
      ],
      default: 'plain',
    },
    sa: {
      type: 'select', label: 'Seam allowance',
      values: [
        { value: 0.625, label: '⅝″' },
        { value: 1,     label: '1″' },
      ],
      default: 0.625,
    },
    hem: {
      type: 'select', label: 'Hem allowance',
      values: [
        { value: 1,   label: '1″' },
        { value: 1.5, label: '1½″' },
      ],
      default: 1,
    },
  },

  pieces(m, opts) {
    const sa  = parseFloat(opts.sa);
    const hem = parseFloat(opts.hem);

    // Outerwear ease: 6″ over chest for layering
    const totalEase = 6;
    const { front: frontEase, back: backEase } = chestEaseDistribution(totalEase);
    // Both front and back half-panels are equal so side seams align when sewn
    const panelW = (m.chest + totalEase) / 4;
    const frontW = panelW;
    const backW  = panelW;

    const halfShoulder  = m.shoulder / 2;
    const neckW         = neckWidthFromCircumference(m.neck);
    const shoulderW     = halfShoulder - neckW;
    const slopeDrop     = shoulderDropFromWidth(shoulderW);
    const shoulderPtX   = neckW + shoulderW;
    const armholeY      = armholeDepthFromChest(m.chest, 'oversized'); // extra depth for layers
    const armholeDepth  = armholeY - slopeDrop;
    const chestDepth    = panelW - shoulderPtX;
    // Back armhole must also end at panelW for vertical side seam.
    const backChestDepth = chestDepth;
    const torsoLen      = m.torsoLength + (opts.length === 'hip' ? 4 : 0);
    const slvLength     = m.sleeveLength ?? 26;
    const btnCount      = 5;

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

    const shoulderPtY = slopeDrop;
    const NECK_DEPTH_FRONT = 3.0;
    const NECK_DEPTH_BACK  = 1.0;

    const frontNeckPts   = sampleCurve(necklineCurve(neckW, NECK_DEPTH_FRONT, 'crew'));
    const backNeckPts    = sampleCurve(necklineCurve(neckW, NECK_DEPTH_BACK, 'crew'));
    const shoulderPts    = sampleCurve(shoulderSlope(shoulderW, slopeDrop));
    const frontArmPts    = sampleCurve(armholeCurve(shoulderW, chestDepth, armholeDepth, false));
    const backArmPts     = sampleCurve(armholeCurve(shoulderW, backChestDepth, armholeDepth, true));

    // ── FRONT PANEL (left — right is mirror) ─────────────────────────────────
    const frontPoly = [];
    const neckFrontRev = [...frontNeckPts].reverse();
    for (const p of neckFrontRev) frontPoly.push({ ...p, x: neckW - p.x });
    // ── JUNCTION UNTAGGING — VERIFIED WORKING, DO NOT CHANGE UNLESS NECESSARY ──
    delete frontPoly[0].curve;  // fold-neckline junction
    delete frontPoly[frontNeckPts.length - 1].curve;  // shoulder-neck junction
    for (let i = 1; i < shoulderPts.length; i++) {
      frontPoly.push({ ...shoulderPts[i], x: neckW + shoulderPts[i].x });
    }
    for (let i = 1; i < frontArmPts.length; i++) {
      frontPoly.push({ ...frontArmPts[i], x: shoulderPtX + frontArmPts[i].x, y: shoulderPtY + frontArmPts[i].y });
    }
    const sideX = shoulderPtX + chestDepth;
    frontPoly.push({ x: sideX, y: torsoLen });
    frontPoly.push({ x: -PLACKET_W, y: torsoLen });
    frontPoly.push({ x: -PLACKET_W, y: NECK_DEPTH_FRONT });

    // ── BACK PANEL ───────────────────────────────────────────────────────────
    const backPoly = [];
    const neckBackRev = [...backNeckPts].reverse();
    for (const p of neckBackRev) backPoly.push({ ...p, x: neckW - p.x });
    // ── JUNCTION UNTAGGING — VERIFIED WORKING, DO NOT CHANGE UNLESS NECESSARY ──
    delete backPoly[0].curve;  // fold-neckline junction
    delete backPoly[backNeckPts.length - 1].curve;  // shoulder-neck junction
    for (let i = 1; i < shoulderPts.length; i++) {
      backPoly.push({ ...shoulderPts[i], x: neckW + shoulderPts[i].x });
    }
    for (let i = 1; i < backArmPts.length; i++) {
      backPoly.push({ ...backArmPts[i], x: shoulderPtX + backArmPts[i].x, y: shoulderPtY + backArmPts[i].y });
    }
    backPoly.push({ x: shoulderPtX + backChestDepth, y: torsoLen });
    backPoly.push({ x: 0, y: torsoLen });

    // ── SLEEVE — one-piece set-in with shaped cap ────────────────────────────
    const effArmToElbow = m.armToElbow || (slvLength * 0.45);
    const slvTopW  = m.bicep / 2 + totalEase * 0.2;  // half sleeve width at bicep
    const slvBotW  = (m.wrist || m.bicep * 0.8) / 2 + 0.5;  // half wrist width

    // Armhole arc — used for cap ease validation
    const frontArmArc = arcLength(frontArmPts);
    const backArmArc  = arcLength(backArmPts);
    const armholeArc  = frontArmArc + backArmArc;

    // 4.5″ flat cap: workwear aesthetic, easy to flat-fell topstitch (same as denim jacket)
    const capH   = 4.5;
    const capCp  = sleeveCapCurve(m.bicep, capH, slvTopW * 2);
    const capPts = sampleBezier(capCp.p0, capCp.p1, capCp.p2, capCp.p3, 16);
    const capArc = arcLength(capPts);
    const capEase = capArc - armholeArc;
    if (capEase < 0.5 || capEase > 3) {
      console.warn(`[crop-jacket] Sleeve cap ease out of range: ${capEase.toFixed(2)}″ (expected 0.5–3″). Cap: ${capArc.toFixed(2)}″, Armhole: ${armholeArc.toFixed(2)}″`);
    }
    const capEaseNote = `Cap: ${fmtInches(capArc)}, Armhole: ${fmtInches(armholeArc)}, Ease: ${fmtInches(capEase)}`;

    // Polygon: cap curve at top (crown near y=0, underarm at y=capH), taper to wrist
    const sleevePoly = [];
    for (const p of capPts) sleevePoly.push({ x: p.x, y: p.y + capH });
    sleevePoly.push({ x: slvTopW + slvBotW, y: capH + slvLength });
    sleevePoly.push({ x: slvTopW - slvBotW, y: capH + slvLength });

    // ── LINING POLYGONS ──────────────────────────────────────────────────────
    // Lining pieces follow the actual shell shapes (not rectangles).
    // Front lining: clip the placket/facing area (inner edge at x = FACING_W),
    // hem shortened 1″ so lining floats free of shell hem.
    // Back & sleeve lining: same shape as shell, hem shortened 1″.
    const LINING_HEM_LIFT = 1.0;
    const liningHemY = torsoLen - LINING_HEM_LIFT;

    function dedupPoly(poly) {
      const out = [];
      for (const p of poly) {
        const last = out[out.length - 1];
        if (!last || Math.abs(last.x - p.x) > 0.001 || Math.abs(last.y - p.y) > 0.001) {
          out.push(p);
        }
      }
      // Also drop a trailing point that duplicates the first
      if (out.length > 1) {
        const first = out[0], lastP = out[out.length - 1];
        if (Math.abs(first.x - lastP.x) < 0.001 && Math.abs(first.y - lastP.y) < 0.001) out.pop();
      }
      return out;
    }

    // Front lining: snap inner edge to FACING_W, lift hem
    const liningFrontPoly = dedupPoly(
      frontPoly.map(p => ({
        ...p,
        x: Math.max(p.x, FACING_W),
        y: Math.min(p.y, liningHemY),
      }))
    );

    // Back lining: just lift hem
    const liningBackPoly = dedupPoly(
      backPoly.map(p => ({
        ...p,
        y: Math.min(p.y, liningHemY),
      }))
    );

    // Sleeve lining: same cap shape as shell, hem shortened 1″
    const sleeveLiningLen = slvLength - LINING_HEM_LIFT;
    const liningSleevePoly = [];
    for (const p of capPts) liningSleevePoly.push({ x: p.x, y: p.y + capH });
    liningSleevePoly.push({ x: slvTopW + slvBotW, y: capH + sleeveLiningLen });
    liningSleevePoly.push({ x: slvTopW - slvBotW, y: capH + sleeveLiningLen });

    // ── COLLAR ───────────────────────────────────────────────────────────────
    // Shaped stand collar: inner (neck) edge arc-matched to bodice neckline.
    // collarCurve() gives outer edge a slight wave so the collar stands properly.
    const frontNeckArc = arcLength(frontNeckPts);
    const backNeckArc  = arcLength(backNeckPts);
    const halfNeckArc  = frontNeckArc + backNeckArc;
    const collarH      = 3;  // 1.5″ finished stand
    const collarResult = collarCurve({
      neckArc:     halfNeckArc,
      collarWidth: collarH,
      style:       opts.collar === 'point' ? 'point' : 'band',
      standHeight: 1.5,
    });

    // ── FRONT FACING ─────────────────────────────────────────────────────────
    const facingH = torsoLen - NECK_DEPTH_FRONT;

    // ── NOTCH MARKS ─────────────────────────────────────────────────────────
    const shoulderMidX = neckW + shoulderW / 2;
    const shoulderMidY = slopeDrop / 2;

    const frontNotches = [
      { x: shoulderMidX, y: shoulderMidY, angle: edgeAngle({ x: neckW, y: 0 }, { x: shoulderPtX, y: slopeDrop }) },
      { x: sideX, y: armholeY, angle: 0 },
      { x: shoulderPtX, y: slopeDrop + armholeDepth * 0.25, angle: edgeAngle({ x: shoulderPtX, y: slopeDrop }, { x: sideX, y: armholeY }) },
      { x: sideX, y: slopeDrop + armholeDepth * 0.75, angle: edgeAngle({ x: shoulderPtX, y: slopeDrop }, { x: sideX, y: armholeY }) },
    ];

    const backSideX = shoulderPtX + backChestDepth;
    const backNotches = [
      { x: shoulderMidX, y: shoulderMidY, angle: edgeAngle({ x: neckW, y: 0 }, { x: shoulderPtX, y: slopeDrop }) },
      { x: backSideX, y: armholeY,        angle: 0 },  // double notch = back
      { x: backSideX, y: armholeY + 0.25, angle: 0 },
      { x: shoulderPtX, y: slopeDrop + armholeDepth * 0.25, angle: edgeAngle({ x: shoulderPtX, y: slopeDrop }, { x: backSideX, y: armholeY }) },
      { x: backSideX, y: slopeDrop + armholeDepth * 0.75, angle: edgeAngle({ x: shoulderPtX, y: slopeDrop }, { x: backSideX, y: armholeY }) },
    ];

    const frontBB       = bbox(frontPoly);
    const backBB        = bbox(backPoly);
    const sleeveBB      = bbox(sleevePoly);
    const upperCollarBB = bbox(collarResult.upperCollar);
    const underCollarBB = bbox(collarResult.underCollar);

    const pieces = [
      {
        id: 'bodice-front',
        name: 'Front Panel (Left)',
        instruction: `Cut 2 (L & R mirror) · ${fmtInches(PLACKET_W)} placket extension at CF · Flat-fell side seams · Bar tack all pocket corners`,
        type: 'bodice',
        polygon: frontPoly,
        path: polyToPathStr(frontPoly),
        width: frontBB.maxX - frontBB.minX,
        height: frontBB.maxY - frontBB.minY,
        isBack: false,
        sa, hem,
        notches: frontNotches,
        dims: [
          { label: fmtInches(frontW) + ' panel', x1: 0, y1: -0.5, x2: frontW, y2: -0.5, type: 'h' },
          { label: fmtInches(torsoLen) + ' length', x: frontBB.maxX + 1, y1: 0, y2: torsoLen, type: 'v' },
        ],
      },
      {
        id: 'bodice-back',
        name: 'Back Panel',
        instruction: 'Cut 1 on fold (CB) · Flat-fell shoulder and side seams',
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
        instruction: `Cut 2 (mirror L & R) · Straight grain along length · Set-in cap with ease · ${capEaseNote}`,
        type: 'sleeve',
        polygon: sleevePoly,
        path: polyToPathStr(sleevePoly),
        width: sleeveBB.maxX - sleeveBB.minX,
        height: sleeveBB.maxY - sleeveBB.minY,
        capHeight: capH,
        sleeveLength: slvLength,
        sleeveWidth: slvTopW * 2,
        sa, hem,
        notches: (() => {
          const slvFullW = slvTopW * 2;
          const backAngle = edgeAngle({ x: slvFullW / 2, y: 0 }, { x: slvFullW, y: capH });
          const bDx = slvFullW / 2, bDy = capH;
          const bLen = Math.sqrt(bDx * bDx + bDy * bDy);
          const bStepX = 0.25 * bDx / bLen, bStepY = 0.25 * bDy / bLen;
          return [
            { x: slvFullW / 2,             y: 0,            angle: -90 },  // crown → shoulder seam
            { x: slvFullW * 0.25,          y: capH * 0.5,   angle: edgeAngle({ x: 0, y: capH }, { x: slvFullW / 2, y: 0 }) },  // front (single)
            { x: slvFullW * 0.75,          y: capH * 0.5,   angle: backAngle },   // back (double)
            { x: slvFullW * 0.75 + bStepX, y: capH * 0.5 + bStepY, angle: backAngle },
          ];
        })(),
        dims: [
          { label: fmtInches(slvTopW * 2) + ' underarm width', x1: 0, y1: capH + 0.4, x2: slvTopW * 2, y2: capH + 0.4, type: 'h' },
          { label: fmtInches(slvLength) + ' length', x: slvTopW * 2 + 1, y1: capH, y2: capH + slvLength, type: 'v' },
          { label: fmtInches(effArmToElbow) + ' to elbow', x: -1.5, y1: capH, y2: capH + effArmToElbow, type: 'v', color: '#b8963e' },
        ],
      },
      {
        id: 'upper-collar',
        name: opts.collar === 'mandarin' ? 'Band Collar (Outer)' : 'Stand Collar (Outer)',
        instruction: `Cut 1 on fold (CB) · Interface · ${fmtInches(collarResult.standLength)} half-length × ${fmtInches(collarH)} cut · ${opts.collar === 'point' ? 'Point tips ¾″ at CF — turn precisely' : 'Square ends at CF'} · Outer visible collar`,
        type: 'bodice',
        polygon: collarResult.upperCollar,
        path: polyToPathStr(collarResult.upperCollar),
        width: upperCollarBB.maxX - upperCollarBB.minX,
        height: upperCollarBB.maxY - upperCollarBB.minY,
        isBack: false,
        sa, hem: 0,
        dims: [
          { label: fmtInches(collarResult.standLength) + ' half length', x1: 0, y1: -0.5, x2: collarResult.standLength, y2: -0.5, type: 'h' },
          { label: fmtInches(collarH) + ' width', x: upperCollarBB.maxX + 1, y1: upperCollarBB.minY, y2: upperCollarBB.maxY, type: 'v' },
        ],
      },
      {
        id: 'under-collar',
        name: opts.collar === 'mandarin' ? 'Band Collar (Facing)' : 'Stand Collar (Facing)',
        instruction: 'Cut 1 on fold (CB) · Interface with 2 layers · 2% smaller than outer collar so seam rolls under · Inner layer',
        type: 'bodice',
        polygon: collarResult.underCollar,
        path: polyToPathStr(collarResult.underCollar),
        width: underCollarBB.maxX - underCollarBB.minX,
        height: underCollarBB.maxY - underCollarBB.minY,
        isBack: false,
        sa, hem: 0,
        dims: [
          { label: fmtInches(collarResult.standLength / 1.02) + ' half length', x1: 0, y1: -0.5, x2: collarResult.standLength / 1.02, y2: -0.5, type: 'h' },
        ],
      },
      {
        id: 'front-facing',
        name: 'Front Facing',
        instruction: opts.closure === 'zipper'
          ? `Cut 2 (L & R) · Interface · ${fmtInches(FACING_W)} wide × ${fmtInches(facingH)} long · Backs the zipper tape on inside`
          : `Cut 2 (L & R) · Interface · ${fmtInches(FACING_W)} wide × ${fmtInches(facingH)} long`,
        type: 'pocket',
        dimensions: { width: FACING_W, height: facingH },
        sa,
      },
    ];

    // ── LOWER POCKETS ────────────────────────────────────────────────────────
    if (opts.lowerPocket === 'welt') {
      pieces.push({
        id: 'hip-welt-pocket',
        name: 'Hip Welt Pocket',
        instruction: `Cut 4 (2 welts 7″ × 1.5″ + 2 bags 7″ × 8″) per pocket · ×2 pockets total · Interface welts · {understitch} · Bar tack ends`,
        type: 'pocket',
        dimensions: { width: 7, height: 8 },
        sa,
      });
    } else {
      pieces.push({
        id: 'hip-pocket',
        name: 'Hip Patch Pocket',
        instruction: `Cut 2 · Position at hip level ${fmtInches(opts.length === 'hip' ? 8 : 4)}″ from hem on front panels · Top edge: 1″ hem (fold under ½″ twice, {topstitch}) · Sides + bottom: SA · Bar tack top corners`,
        type: 'pocket',
        dimensions: { width: 7, height: 7 },
        sa, hem: 1.0, hemEdge: 'top',
      });
    }

    // ── CHEST POCKET ─────────────────────────────────────────────────────────
    if (opts.chestPocket === 'patch') {
      pieces.push({
        id: 'chest-pocket',
        name: 'Chest Patch Pocket with Pencil Slot',
        instruction: 'Cut 1 · Left chest, 2.5″ below neckline · Top edge: 1″ hem (fold under ½″ twice, {topstitch}) · Pencil slot: 1.5″ wide section at top, divided by topstitching · Sides + bottom: SA',
        type: 'pocket',
        dimensions: { width: 5, height: 6 },
        sa, hem: 1.0, hemEdge: 'top',
      });
    } else if (opts.chestPocket === 'zip') {
      pieces.push({
        id: 'chest-pocket-bag',
        name: 'Zippered Chest Pocket',
        instruction: 'Cut 2 bag halves (5″ × 7″) + 1 welt strip (5″ × 1.5″, interfaced) · 5″ #3 zipper · Left chest, 2.5″ below neckline · Bar tack zipper ends',
        type: 'pocket',
        dimensions: { width: 5, height: 7 },
        sa,
      });
    }

    // ── ZIPPER GUARD STRIP (closure === 'zipper') ────────────────────────────
    if (opts.closure === 'zipper') {
      pieces.push({
        id: 'zipper-guard',
        name: 'Zipper Guard Strip',
        instruction: `Cut 2 (L & R) · Interface · ${fmtInches(1.5)} × ${fmtInches(torsoLen)} · Folds behind CF zipper tape · {topstitch} inner edge`,
        type: 'pocket',
        dimensions: { width: 1.5, height: torsoLen },
        sa,
      });
    }

    // ── LINING (lining !== 'none') ───────────────────────────────────────────
    if (opts.lining !== 'none') {
      const liningFrontBB  = bbox(liningFrontPoly);
      const liningBackBB   = bbox(liningBackPoly);
      const liningSleeveBB = bbox(liningSleevePoly);

      pieces.push({
        id: 'lining-front',
        name: 'Front Lining',
        instruction: `Cut 2 (L & R mirror) · Inner edge sits at facing line (${fmtInches(FACING_W)} from CF) · Hem ${fmtInches(LINING_HEM_LIFT)} shorter than shell · Sew {RST} to facing inner edge`,
        type: 'bodice',
        polygon: liningFrontPoly,
        path: polyToPathStr(liningFrontPoly),
        width: liningFrontBB.maxX - liningFrontBB.minX,
        height: liningFrontBB.maxY - liningFrontBB.minY,
        isBack: false,
        sa, hem: 0,
        dims: [
          { label: fmtInches(liningHemY) + ' length', x: liningFrontBB.maxX + 1, y1: 0, y2: liningHemY, type: 'v' },
        ],
      });

      pieces.push({
        id: 'lining-back',
        name: 'Back Lining',
        instruction: `Cut 1 on fold (CB) · Same shape as back panel · Hem ${fmtInches(LINING_HEM_LIFT)} shorter than shell · Add ½″ pleat at CB for ease`,
        type: 'bodice',
        polygon: liningBackPoly,
        path: polyToPathStr(liningBackPoly),
        width: liningBackBB.maxX - liningBackBB.minX,
        height: liningBackBB.maxY - liningBackBB.minY,
        isBack: true,
        sa, hem: 0,
        dims: [
          { label: fmtInches(backW) + ' half width', x1: 0, y1: -0.5, x2: backW, y2: -0.5, type: 'h' },
          { label: fmtInches(liningHemY) + ' length', x: liningBackBB.maxX + 1, y1: 0, y2: liningHemY, type: 'v' },
        ],
      });

      pieces.push({
        id: 'lining-sleeve',
        name: 'Sleeve Lining',
        instruction: `Cut 2 (mirror L & R) · Same width as sleeve · Hem ${fmtInches(LINING_HEM_LIFT)} shorter than shell · Sew {RST} to sleeve at hem, bag through cap`,
        type: 'sleeve',
        polygon: liningSleevePoly,
        path: polyToPathStr(liningSleevePoly),
        width: liningSleeveBB.maxX - liningSleeveBB.minX,
        height: liningSleeveBB.maxY - liningSleeveBB.minY,
        capHeight: capH,
        sleeveLength: sleeveLiningLen,
        sleeveWidth: slvTopW * 2,
        sa, hem: 0,
        dims: [
          { label: fmtInches(slvTopW * 2) + ' underarm width', x1: 0, y1: capH + 0.4, x2: slvTopW * 2, y2: capH + 0.4, type: 'h' },
          { label: fmtInches(sleeveLiningLen) + ' length', x: slvTopW * 2 + 1, y1: capH, y2: capH + sleeveLiningLen, type: 'v' },
        ],
      });
    }

    // ── INNER BREAST POCKET (innerPocket === 'welt', requires lining) ────────
    if (opts.innerPocket === 'welt' && opts.lining !== 'none') {
      pieces.push({
        id: 'inner-pocket-welt',
        name: 'Inner Pocket Welt',
        instruction: 'Cut 2 (L & R) from lining fabric · Interface · 5″ × 3″ · Fold on horizontal center line · Welt opening sits on lining front',
        type: 'pocket',
        dimensions: { width: 5, height: 3 },
        sa,
      });
      pieces.push({
        id: 'inner-pocket-bag',
        name: 'Inner Pocket Bag',
        instruction: 'Cut 4 (2 per pocket) from lining · 5″ × 8″ · Sew bag halves {RST} on 3 sides · Slip through welt opening · Bar tack ends',
        type: 'pocket',
        dimensions: { width: 5, height: 8 },
        sa,
      });
    }

    // ── CUFF TAB (cuff === 'tab') ────────────────────────────────────────────
    if (opts.cuff === 'tab') {
      pieces.push({
        id: 'cuff-tab',
        name: 'Adjustable Cuff Tab',
        instruction: 'Cut 4 (2 per sleeve) · Interface · 3″ × 2.5″ · Fold {RST}, sew 3 sides, turn, {press} · 1 button or snap per tab',
        type: 'pocket',
        dimensions: { width: 3, height: 2.5 },
        sa,
      });
    }

    return pieces;
  },

  materials(m, opts) {
    const btnCount = 5;
    const torsoLen = m.torsoLength + (opts.length === 'hip' ? 4 : 0);
    const notions  = [
      { ref: 'interfacing-med', quantity: '0.75 yard (collar + front facings)' },
    ];

    if (opts.closure === 'button') {
      notions.push({ name: 'Heavy-duty shank buttons', quantity: `${btnCount + 1}`, notes: '⅞″ – 1″ diameter (+1 spare)' });
    } else if (opts.closure === 'snap') {
      notions.push({ name: 'Snap buttons', quantity: `${btnCount}`, notes: 'Heavy-duty snaps (size 24 or 20)' });
    } else if (opts.closure === 'zipper') {
      notions.push({ name: 'Separating zipper (YKK #5)', quantity: `${Math.ceil(torsoLen + 2)}″`, notes: 'Metal coil, exposed CF, brass preferred. Detroit jacket style.' });
      notions.push({ name: 'Collar button or snap', quantity: '1', notes: 'For neck tab above zipper' });
    }

    if (opts.chestPocket === 'zip') {
      notions.push({ name: 'Pocket zipper (#3)', quantity: '5″', notes: 'Coil zipper for chest welt pocket' });
    }

    if (opts.lining !== 'none') {
      const liningName = opts.lining === 'flannel' ? 'Cotton flannel lining' : 'Cotton poplin lining';
      notions.push({ name: liningName, quantity: '2.5 yard', notes: opts.lining === 'flannel' ? 'Soft brushed flannel for warmth (Carhartt blanket-lined style)' : 'Lightweight, smooth — Bemberg or poplin' });
    }

    if (opts.cuff === 'tab') {
      notions.push({ name: 'Cuff tab snaps or buttons', quantity: '2', notes: 'One per sleeve cuff tab' });
    }

    return buildMaterialsSpec({
      fabrics: ['cotton-canvas', 'bull-denim', 'waxed-cotton'],
      notions,
      thread: 'poly-heavy',
      needle: 'denim-100',
      stitches: ['straight-3', 'straight-3.5', 'bartack'],
      notes: [
        '{topstitch} all seams at 3.5mm - use contrasting or matching thread as desired',
        '{flat-fell} seams on shoulder and side seams: sew, {press} to one side, trim lower SA to 3mm, fold upper SA over, {topstitch}',
        'Pre-wash canvas to preshrink - canvas can shrink 5–8% in first wash',
        'Interface collar with 2 layers of medium woven interfacing for structure',
        'Bar tack all four corners of each pocket - canvas is heavy and will stress pocket attachment',
        opts.closure === 'snap' ? 'Install snaps with a snap setter tool - do not sew snap buttons by hand on canvas' : '',
        opts.closure === 'zipper' ? 'Separating zipper: use a zipper foot. Install AFTER attaching front facings and zipper guard strips. Test zipper engagement before topstitching.' : '',
        opts.lining !== 'none' ? 'Pre-wash lining fabric. Bag the lining: sew shell + lining at hem and front edges, turn through sleeve hem opening, slipstitch closed.' : '',
        opts.lowerPocket === 'welt' ? 'Welt pockets: practice on scrap canvas first. Mark accurately, slash precisely. Bar tack ends after turning.' : '',
        'Waxed cotton: do not pre-wash - wipe clean only, re-wax annually',
      ].filter(Boolean),
    });
  },

  instructions(m, opts) {
    const steps = [];
    let n = 1;
    const btnCount = 5;
    const lined = opts.lining !== 'none';
    const isZip = opts.closure === 'zipper';

    if (opts.chestPocket === 'patch') {
      steps.push({
        step: n++, title: 'Prepare chest pocket',
        detail: 'Mark pencil slot division line 1.5″ from right edge. Fold top under 1″, {topstitch} twice. {press} sides and bottom under ⅝″. {topstitch} slot division line through pocket. Position on left front panel. {topstitch} on 3 sides. Bar tack all four corners.',
      });
    } else if (opts.chestPocket === 'zip') {
      steps.push({
        step: n++, title: 'Prepare zippered chest pocket',
        detail: 'Mark welt opening on left chest, 2.5″ below neckline. Interface welt strip. Sew welt {RST} centered over slash line. Slash through center, clip to corners. Turn welt to WS, {press}. Sew #3 zipper to WS of opening, face down, teeth at slash edges. {topstitch} from RS at 3mm. Sew bag halves {RST}, attach to welt SA. Bar tack zipper ends.',
      });
    }

    if (opts.lowerPocket === 'welt') {
      steps.push({
        step: n++, title: 'Prepare hip welt pockets',
        detail: 'Mark welt opening on each front panel at hip level (4″ from hem, or 8″ if hip length). Interface welt strips. Sew welts {RST} above and below slash line, ending stitches exactly at corners. Slash through center, clip diagonally to corners. Turn welts through opening to WS. {press}. {understitch} welts. Attach pocket bag halves to welt SAs. {whipstitch} bag sides. Bar tack welt ends.',
      });
    } else {
      steps.push({
        step: n++, title: 'Prepare hip patch pockets',
        detail: 'Fold top edge under 1″ twice, {topstitch}. {press} remaining three edges under ⅝″. Position on front panels at hip level. {topstitch} on 3 sides at 3.5mm. Bar tack all four corners.',
      });
    }

    steps.push({
      step: n++, title: 'Prepare collar',
      detail: `Interface outer collar with 2 layers of woven interfacing. Pin outer to under collar {RST}, curved edges aligned. Sew outer edge and both CF ends (3 sides), leaving neck edge open. Trim to 3mm. ${opts.collar === 'point' ? '{clip} diagonally to point corners — 1mm from tip. Turn, use a {point turner} to fully push points. ' : 'Notch outer curve, turn. '}{press} from outer collar side, rolling seam to underside. {topstitch} 3.5mm from outer edge if desired.`,
    });

    if (isZip) {
      steps.push({
        step: n++, title: 'Prepare zipper guards and front facings',
        detail: `Interface zipper guard strips and front facings. {press} guard strips in half lengthwise. Sew guard to CF edge of each front panel {RST}, raw edges aligned. {press} guard toward inside, {topstitch} inner edge through panel. Sew front facing to inner edge of guard {RST}. {press} facing toward inside.`,
      });
    } else {
      steps.push({
        step: n++, title: 'Prepare front facings and plackets',
        detail: `Interface facing strips. {press} placket extension ${fmtInches(PLACKET_W)} to WS at CF fold line. Sew facing to placket edge {RST}. {press}, {topstitch}. Facing creates clean interior at front opening.`,
      });
    }

    steps.push({
      step: n++, title: 'Sew shoulder seams (flat-fell)',
      detail: flatFelledSeam({
        seam: 'shoulder seam',
        sa: '⅝″',
        pressDir: 'back',
        trimSide: 'front',
        foldSide: 'back',
        trimTo: '3mm (⅛″)',
        row1: '⅛″',
        row2: '¼″ (3.5mm)',
        thread: 'matching or contrasting',
        extraTip: 'On the shoulder seam the fell runs horizontally across the back — keep your presser foot parallel to the shoulder line for straight rows.',
      }),
    });

    steps.push({
      step: n++, title: 'Attach collar',
      detail: 'Pin outer collar neck edge to bodice neckline {RST}, matching CB and CF marks. Distribute ease evenly. Sew. {clip} neckline seam allowance every ½″. Fold under-collar neck SA under, slipstitch to WS covering seam. {topstitch} from RS at 3.5mm through all layers if desired.',
    });

    steps.push({
      step: n++, title: 'Set sleeves',
      detail: 'Match crown notch (single, at top of cap) to shoulder seam. Match single front notch to front armhole, double back notch to back armhole. Pin {RST} from underarm, working up each side. Ease cap fullness evenly between notches — use your fingers or basting. Sew. {topstitch} SA toward sleeve at 6mm from seam.',
    });

    steps.push({
      step: n++, title: 'Sew side seams (flat-fell)',
      detail: flatFelledSeam({
        seam: 'side seam (from jacket hem continuously through the underarm to the sleeve hem in one pass)',
        sa: '⅝″',
        pressDir: 'back',
        trimSide: 'front',
        foldSide: 'back',
        trimTo: '3mm (⅛″)',
        row1: '⅛″',
        row2: '¼″ (3.5mm)',
        thread: 'matching or contrasting',
        extraTip: 'Because this seam runs continuously from hem to sleeve hem, sew and fell in one long pass. At the underarm pivot point, clip the seam allowance nearly to the stitching line so the fell lies flat around the curve.',
      }),
    });

    if (isZip) {
      steps.push({
        step: n++, title: 'Install separating zipper',
        detail: `Open the separating zipper. Place left tape face-down on RS of left front panel, teeth aligned with CF edge under the guard. Baste in place. Sew through guard + zipper tape + front panel using zipper foot at 3mm from teeth. Repeat for right tape on right front. Close zipper to test alignment - both halves should meet evenly at the collar. {topstitch} from RS at ¼″ from the zipper teeth on both sides.`,
      });
    }

    if (opts.cuff === 'tab') {
      steps.push({
        step: n++, title: 'Make and attach cuff tabs',
        detail: 'Fold each tab pair {RST}, sew 3 sides leaving short end open. Trim corners, turn, {press}. {topstitch} edges. Attach tab to underarm side of sleeve hem before hemming, pointing toward the cuff opening. Mark and install snap or button to allow ~1″ adjustment.',
      });
    }

    steps.push({
      step: n++, title: 'Hem sleeves and body',
      detail: `Fold sleeve hem up ${fmtInches(parseFloat(opts.hem))} twice, {press}. {topstitch} at 3.5mm. Repeat for jacket body hem.${lined ? ' Leave lining hem free for bagging in next step.' : ''}`,
    });

    if (lined) {
      steps.push({
        step: n++, title: 'Assemble lining',
        detail: 'Sew lining front + back at shoulders and side seams. Sew sleeve linings into lining armholes. Add ½″ pleat at CB lining for ease. Press all seams toward back.',
      });

      if (opts.innerPocket === 'welt') {
        steps.push({
          step: n++, title: 'Sew inner breast pocket',
          detail: 'Mark welt opening on left lining front, ~3″ below shoulder. Interface welt strip. Sew welt {RST} centered over slash. Slash, clip corners, turn through opening. {press}. Sew bag halves {RST} on 3 sides. Attach bag to welt SAs through opening. Bar tack ends. Repeat on right side if desired.',
        });
      }

      steps.push({
        step: n++, title: 'Bag the lining',
        detail: 'Pin lining to jacket {RST}: lining CF to facing inner edge, lining hem to jacket hem (lining 1″ shorter than shell). {Slipstitch} lining hem to facing edges. {Slipstitch} sleeve lining hem to sleeve hem. Tack lining at underarm seam to keep it from twisting. Lining floats free at side seams.',
      });
    }

    if (opts.closure === 'button') {
      steps.push({
        step: n++, title: 'Buttonholes and buttons',
        detail: `Mark ${btnCount} buttonholes on right placket (vertical buttonholes for jacket): first 1.5″ from neckline, last 2″ from hem, evenly spaced. Test on scrap canvas. Sew buttonholes. Cut open. Sew buttons to left placket.`,
      });
    } else if (opts.closure === 'snap') {
      steps.push({
        step: n++, title: 'Install snaps',
        detail: `Mark ${btnCount} snap positions. Install male halves on right placket, female halves on left placket. Use snap setter tool and backing plate - canvas requires firm pressure.`,
      });
    } else if (isZip) {
      steps.push({
        step: n++, title: 'Install collar tab closure',
        detail: 'Sew a small button or snap at the collar/neckline above the zipper top stop. Detroit jackets often have a single button or snap here to keep the collar closed at the throat.',
      });
    }

    steps.push({
      step: n++, title: 'Finish',
      detail: '{press} with steam on cotton/linen setting. Bar tack any remaining stress points. Try on and check collar stands evenly.',
    });

    return steps;
  },
};
