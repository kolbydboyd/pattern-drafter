// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Crop Jacket (Chore Coat style) — woven outerwear, extra ease for layering.
 * Front panels split at CF for button/snap placket.
 * Flat-felled seams on shoulders and side seams.
 * Stand collar (point or Mandarin/band). Large hip patch pockets.
 * Fabric: cotton canvas 10–12 oz, bull denim, waxed cotton.
 */

import {
  shoulderSlope, necklineCurve, armholeCurve, shoulderDropFromWidth,
  armholeDepthFromChest, chestEaseDistribution, neckWidthFromCircumference, UPPER_EASE,
} from '../engine/upper-body.js';
import { sampleBezier, fmtInches, edgeAngle } from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

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

    // ── SLEEVE (straight, long, no taper) ────────────────────────────────────
    const effArmToElbow = m.armToElbow || (slvLength * 0.45);
    const slvTopW  = m.bicep / 2 + totalEase * 0.2;
    const slvBotW  = (m.wrist || m.bicep * 0.8) / 2 + 0.5;
    const sleevePoly = [
      { x: 0,           y: 0         },
      { x: slvTopW * 2, y: 0         },
      { x: slvTopW * 2, y: slvLength },
      { x: 0,           y: slvLength },
    ];

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

    // Sleeve lining: same rectangle, shortened 1″
    const sleeveLiningLen = slvLength - LINING_HEM_LIFT;
    const liningSleevePoly = [
      { x: 0,           y: 0                },
      { x: slvTopW * 2, y: 0                },
      { x: slvTopW * 2, y: sleeveLiningLen  },
      { x: 0,           y: sleeveLiningLen  },
    ];

    // ── COLLAR ───────────────────────────────────────────────────────────────
    // Stand collar: 3″ cut (1.5″ finished stand). Length = neckline circumference.
    const collarLen   = m.neck + 1; // ease for standing collar
    const collarH     = 3;          // 1.5″ finished stand

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

    const sleeveNotches = [
      { x: slvTopW,          y: 0, angle: -90 },  // crown → shoulder seam
      { x: slvTopW * 0.5,    y: 0, angle: -90 },  // front quarter (single)
      { x: slvTopW * 1.5,    y: 0, angle: -90 },  // back quarter (double)
      { x: slvTopW * 1.5 + 0.25, y: 0, angle: -90 },
    ];

    const frontBB  = bbox(frontPoly);
    const backBB   = bbox(backPoly);
    const sleeveBB = bbox(sleevePoly);

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
        instruction: 'Cut 2 (mirror L & R) · Straight grain along length · No ease in cap - set flat',
        type: 'sleeve',
        polygon: sleevePoly,
        path: polyToPathStr(sleevePoly),
        width: sleeveBB.maxX - sleeveBB.minX,
        height: sleeveBB.maxY - sleeveBB.minY,
        capHeight: 0,
        sleeveLength: slvLength,
        sleeveWidth: slvTopW * 2,
        sa, hem,
        notches: sleeveNotches,
        dims: [
          { label: fmtInches(slvTopW * 2) + ' width', x1: 0, y1: -0.4, x2: slvTopW * 2, y2: -0.4, type: 'h' },
          { label: fmtInches(slvLength) + ' length', x: slvTopW * 2 + 1, y1: 0, y2: slvLength, type: 'v' },
          { label: fmtInches(effArmToElbow) + ' to elbow', x: -1.5, y1: 0, y2: effArmToElbow, type: 'v', color: '#b8963e' },
        ],
      },
      {
        id: 'collar',
        name: opts.collar === 'mandarin' ? 'Band Collar' : 'Stand Collar',
        instruction: `Cut 2 (outer + facing) · Interface outer · ${fmtInches(collarLen)} × ${fmtInches(collarH)} cut · ${opts.collar === 'point' ? 'Shape front corners to a point' : 'Round front corners slightly'}`,
        type: 'rectangle',
        dimensions: { length: collarLen, width: collarH },
        sa,
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
        instruction: `Cut 2 · Position at hip level ${fmtInches(opts.length === 'hip' ? 8 : 4)}″ from hem on front panels · Bar tack top corners`,
        type: 'pocket',
        dimensions: { width: 7, height: 7 },
        sa,
      });
    }

    // ── CHEST POCKET ─────────────────────────────────────────────────────────
    if (opts.chestPocket === 'patch') {
      pieces.push({
        id: 'chest-pocket',
        name: 'Chest Patch Pocket with Pencil Slot',
        instruction: 'Cut 1 · Left chest, 2.5″ below neckline · Pencil slot: 1.5″ wide section at top, divided by topstitching',
        type: 'pocket',
        dimensions: { width: 5, height: 6 },
        sa,
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
        capHeight: 0,
        sleeveLength: sleeveLiningLen,
        sleeveWidth: slvTopW * 2,
        sa, hem: 0,
        dims: [
          { label: fmtInches(slvTopW * 2) + ' width', x1: 0, y1: -0.4, x2: slvTopW * 2, y2: -0.4, type: 'h' },
          { label: fmtInches(sleeveLiningLen) + ' length', x: slvTopW * 2 + 1, y1: 0, y2: sleeveLiningLen, type: 'v' },
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
      detail: `Interface outer collar with 2 layers. Sew outer to facing {RST} on three sides, leaving neck edge open. Trim seam to 3mm. {clip} corners (point collar) or notch curves. Turn, {press}. For point collar: shape points precisely - use a {point turner}. {topstitch} 3.5mm from edge if desired.`,
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
      detail: 'Sew front to back at shoulders {RST}. {press} both SAs toward back. Trim front SA to 3mm. Fold back SA over trimmed edge, {press}. {topstitch} at 3.5mm close to fold. Result: two visible rows of {topstitch} on RS.',
    });

    steps.push({
      step: n++, title: 'Attach collar',
      detail: 'Pin outer collar to neckline {RST}, matching CF marks. Sew. {clip} curve. Fold facing SA under, pin to WS covering seam. {topstitch} from RS through all layers.',
    });

    steps.push({
      step: n++, title: 'Set sleeves',
      detail: 'Sew sleeves into armhole {RST}, starting at underarm notch. Ease fullness at cap evenly. Sew. {topstitch} SA toward sleeve at 6mm from seam.',
    });

    steps.push({
      step: n++, title: 'Sew side seams (flat-fell)',
      detail: 'Sew front to back at side seams {RST}, from hem through underarm continuously to sleeve hem. Apply flat-fell finish: {press} toward back, trim front SA to 3mm, fold back SA over, {topstitch} at 3.5mm.',
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
