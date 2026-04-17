// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Crop Jacket — Detroit-style workwear silhouette.
 * Cropped, boxy chore-jacket construction with generous layering ease.
 * Two-piece collar-with-stand (elevated) or Mandarin/band collar.
 * Optional back yoke, two-piece tailored sleeve, banded waist/cuffs.
 * Flat-felled seams on shoulders and side seams.
 * Fabric: cotton canvas 10–12 oz, bull denim, waxed cotton, twill, corduroy, moleskin, wool melton.
 */

import {
  shoulderSlope, necklineCurve, armholeCurve, sleeveCapCurve, collarCurve,
  shoulderDropFromWidth, armholeDepthFromChest, chestEaseDistribution,
  neckWidthFromCircumference, UPPER_EASE, twoPartSleeve, yokeSplit,
} from '../engine/upper-body.js';
import { sampleBezier, fmtInches, edgeAngle, arcLength } from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';
import { flatFelledSeam } from '../lib/seam-techniques.js';

const PLACKET_W   = 1.5;  // button placket extension each front panel
const FACING_W    = 3.0;  // front facing width (interfaced)

const JACKET_EASE = { relaxed: 6, oversized: 8 };

export default {
  id: 'crop-jacket',
  name: 'Crop Jacket',
  category: 'upper',
  difficulty: 'advanced',
  priceTier: 'tailored',
  measurements: ['chest', 'shoulder', 'neck', 'sleeveLength', 'bicep', 'wrist', 'torsoLength'],
  measurementDefaults: { sleeveLength: 26 },

  options: {
    fit: {
      type: 'select', label: 'Fit',
      values: [
        { value: 'relaxed',   label: 'Relaxed (+6″)', reference: 'fits comfortably over a knit top or light layer' },
        { value: 'oversized', label: 'Oversized (+8″)', reference: 'fits over a hoodie or chunky knit, Detroit silhouette' },
      ],
      default: 'relaxed',
    },
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
        { value: 'stand',    label: 'Two-piece collar with stand (elevated workwear)' },
        { value: 'mandarin', label: 'Mandarin / band collar'     },
      ],
      default: 'stand',
    },
    closure: {
      type: 'select', label: 'Closure',
      values: [
        { value: 'button', label: 'Buttons (shank)'    },
        { value: 'snap',   label: 'Snap buttons'       },
        { value: 'zipper', label: 'Separating zipper (Detroit)' },
      ],
      default: 'button',
    },
    sleeveStyle: {
      type: 'select', label: 'Sleeve construction',
      values: [
        { value: 'one-piece', label: 'One-piece set-in (flat cap, easy to topstitch)', reference: 'beginner-friendly, classic workwear' },
        { value: 'two-piece', label: 'Two-piece tailored (shaped cap, better arm hang)', reference: 'intermediate, elevated read' },
      ],
      default: 'one-piece',
    },
    backYoke: {
      type: 'select', label: 'Back yoke',
      values: [
        { value: 'none',     label: 'No yoke (single-piece back)' },
        { value: 'straight', label: 'Straight back yoke (workwear detail)' },
      ],
      default: 'none',
    },
    lining: {
      type: 'select', label: 'Lining',
      values: [
        { value: 'none',    label: 'Unlined (flat-felled or Hong Kong finish)' },
        { value: 'poplin',  label: 'Bag-lined (poplin or cupro)'     },
        { value: 'flannel', label: 'Blanket-lined (flannel, Detroit signature)' },
        { value: 'quilted', label: 'Quilted cotton (warmth)'         },
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
    waistband: {
      type: 'select', label: 'Hem / waistband',
      values: [
        { value: 'hem',  label: 'Plain folded hem'                          },
        { value: 'band', label: 'Self-fabric or ribbed knit band (Detroit)' },
      ],
      default: 'hem',
    },
    cuff: {
      type: 'select', label: 'Cuff',
      values: [
        { value: 'plain', label: 'Plain hemmed cuff'                        },
        { value: 'tab',   label: 'Adjustable tab (snap/button)'             },
        { value: 'band',  label: 'Self-fabric or ribbed knit band (Detroit)' },
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

    // Outerwear ease: named fit levels for layering
    const totalEase = JACKET_EASE[opts.fit] ?? 6;
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
    const btnCount      = opts.length === 'hip' ? 6 : 5;
    const isTwoPiece    = opts.sleeveStyle === 'two-piece';
    const hasYoke       = opts.backYoke === 'straight';

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
    const frontArmCp     = armholeCurve(shoulderW, chestDepth, armholeDepth, false);
    const backArmCp      = armholeCurve(shoulderW, backChestDepth, armholeDepth, true);
    const frontArmPts    = sampleCurve(frontArmCp);
    const backArmPts     = sampleCurve(backArmCp);

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

    // ── BACK YOKE SPLIT (optional) ──────────────────────────────────────────
    const backSideX = shoulderPtX + backChestDepth;
    let backYokePoly = null;
    let backLowerPoly = null;
    if (hasYoke) {
      const yokeY = armholeDepth * 0.33;
      const yokePt = yokeSplit(backArmCp, yokeY);
      const yokeArmX = yokePt ? shoulderPtX + yokePt.x : backSideX;
      const yokeLineY = shoulderPtY + yokeY;

      // Back yoke: neckline + shoulder + armhole down to yoke line
      backYokePoly = [];
      const neckBackRev2 = [...backNeckPts].reverse();
      for (const p of neckBackRev2) backYokePoly.push({ x: neckW - p.x, y: p.y });
      for (let i = 1; i < shoulderPts.length; i++) {
        backYokePoly.push({ x: neckW + shoulderPts[i].x, y: shoulderPts[i].y });
      }
      for (let i = 1; i < backArmPts.length; i++) {
        const pt = { x: shoulderPtX + backArmPts[i].x, y: shoulderPtY + backArmPts[i].y };
        if (pt.y > yokeLineY) break;
        backYokePoly.push(pt);
      }
      backYokePoly.push({ x: yokeArmX, y: yokeLineY });
      backYokePoly.push({ x: 0, y: yokeLineY });

      // Back lower panel: yoke line → armhole remainder → hem
      backLowerPoly = [];
      backLowerPoly.push({ x: 0, y: yokeLineY });
      backLowerPoly.push({ x: yokeArmX, y: yokeLineY });
      for (let i = 0; i < backArmPts.length; i++) {
        const pt = { x: shoulderPtX + backArmPts[i].x, y: shoulderPtY + backArmPts[i].y };
        if (pt.y <= yokeLineY) continue;
        backLowerPoly.push(pt);
      }
      backLowerPoly.push({ x: backSideX, y: torsoLen });
      backLowerPoly.push({ x: 0, y: torsoLen });
    }

    // ── SLEEVE ────────────────────────────────────────────────────────────
    const effArmToElbow = m.armToElbow || (slvLength * 0.55);
    const slvTopW  = m.bicep / 2 + totalEase * 0.35;  // half sleeve width at bicep — generous for layering
    const slvBotW  = (m.wrist || m.bicep * 0.8) / 2 + 1.0;  // half wrist width — outerwear ease

    // Armhole arc — used for cap ease validation
    const frontArmArc = arcLength(frontArmPts);
    const backArmArc  = arcLength(backArmPts);
    const armholeArc  = frontArmArc + backArmArc;

    // Two-piece tailored sleeve (shaped cap, better arm hang)
    let sleeveResult = null;
    if (isTwoPiece) {
      sleeveResult = twoPartSleeve({
        bicep: m.bicep,
        sleeveLength: slvLength,
        armToElbow: effArmToElbow,
        wrist: m.wrist || m.bicep * 0.55,
        armholeArc,
        capEaseTarget: 1.5,
        sleeveBend: 10,
        bicepEase: totalEase > 6 ? 0.20 : 0.15,
      });
    }

    // One-piece set-in sleeve — low flat cap, easy to topstitch and flat-fell
    let onePiecePoly = null;
    let onePieceCapH = 0;
    let onePieceCapArc = 0;
    let onePieceCapPts = null;
    if (!isTwoPiece) {
      onePieceCapH = 4.5; // workwear aesthetic (same as denim jacket)
      const capCp  = sleeveCapCurve(m.bicep, onePieceCapH, slvTopW * 2);
      onePieceCapPts = sampleBezier(capCp.p0, capCp.p1, capCp.p2, capCp.p3, 16);
      onePieceCapArc = arcLength(onePieceCapPts);
      onePiecePoly = [];
      for (const p of onePieceCapPts) onePiecePoly.push({ x: p.x, y: p.y + onePieceCapH });
      onePiecePoly.push({ x: slvTopW + slvBotW, y: onePieceCapH + slvLength });
      onePiecePoly.push({ x: slvTopW - slvBotW, y: onePieceCapH + slvLength });
    }

    const capH = isTwoPiece ? sleeveResult.capHeight : onePieceCapH;
    const capEase = isTwoPiece
      ? sleeveResult.capArc - armholeArc
      : onePieceCapArc - armholeArc;
    const capArcVal = isTwoPiece ? sleeveResult.capArc : onePieceCapArc;
    if (capEase < 0.5 || capEase > 3) {
      console.warn(`[crop-jacket] Sleeve cap ease out of range: ${capEase.toFixed(2)}″ (expected 0.5–3″). Cap: ${capArcVal.toFixed(2)}″, Armhole: ${armholeArc.toFixed(2)}″`);
    }
    const capEaseNote = `Cap: ${fmtInches(capArcVal)}, Armhole: ${fmtInches(armholeArc)}, Ease: ${fmtInches(capEase)}`;

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

    // Sleeve lining: same cap shape as shell, hem shortened 1″ (one-piece only; two-piece lining uses same shape)
    const sleeveLiningLen = slvLength - LINING_HEM_LIFT;
    let liningSleevePoly = null;
    if (!isTwoPiece && onePieceCapPts) {
      liningSleevePoly = [];
      for (const p of onePieceCapPts) liningSleevePoly.push({ x: p.x, y: p.y + capH });
      liningSleevePoly.push({ x: slvTopW + slvBotW, y: capH + sleeveLiningLen });
      liningSleevePoly.push({ x: slvTopW - slvBotW, y: capH + sleeveLiningLen });
    }

    // ── COLLAR ───────────────────────────────────────────────────────────────
    const frontNeckArc = arcLength(frontNeckPts);
    const backNeckArc  = arcLength(backNeckPts);
    const halfNeckArc  = frontNeckArc + backNeckArc;

    // Two-piece collar-with-stand: separate stand (band) + collar fall (pointed)
    // Mandarin: single-piece band collar (existing)
    const standH = 1.5;
    const fallH  = 1.75;
    let standResult = null;
    let fallResult  = null;
    let collarResult = null;
    const collarH = opts.collar === 'stand' ? standH + fallH : standH * 2;

    if (opts.collar === 'stand') {
      standResult = collarCurve({
        neckArc:     halfNeckArc,
        collarWidth: standH,
        style:       'band',
        standHeight: standH,
      });
      fallResult = collarCurve({
        neckArc:     halfNeckArc + 0.5,
        collarWidth: fallH,
        style:       'point',
        standHeight: 0,
      });
    } else {
      collarResult = collarCurve({
        neckArc:     halfNeckArc,
        collarWidth: collarH,
        style:       'band',
        standHeight: 1.5,
      });
    }

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

    const backNotches = [
      { x: shoulderMidX, y: shoulderMidY, angle: edgeAngle({ x: neckW, y: 0 }, { x: shoulderPtX, y: slopeDrop }) },
      { x: backSideX, y: armholeY,        angle: 0 },  // double notch = back
      { x: backSideX, y: armholeY + 0.25, angle: 0 },
      { x: shoulderPtX, y: slopeDrop + armholeDepth * 0.25, angle: edgeAngle({ x: shoulderPtX, y: slopeDrop }, { x: backSideX, y: armholeY }) },
      { x: backSideX, y: slopeDrop + armholeDepth * 0.75, angle: edgeAngle({ x: shoulderPtX, y: slopeDrop }, { x: backSideX, y: armholeY }) },
    ];

    const frontBB       = bbox(frontPoly);
    const backBB        = bbox(backPoly);
    const topSlvBB      = isTwoPiece ? bbox(sleeveResult.topSleeve) : null;
    const underSlvBB    = isTwoPiece ? bbox(sleeveResult.underSleeve) : null;
    const onePieceSlvBB = !isTwoPiece ? bbox(onePiecePoly) : null;

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
    ];

    // ── BACK — yoke split or single-piece ────────────────────────────────────
    if (hasYoke) {
      const backYokeBB = bbox(backYokePoly);
      const backLowerBB = bbox(backLowerPoly);
      const yokeLineY = backYokePoly[backYokePoly.length - 1].y;
      pieces.push({
        id: 'back-yoke',
        name: 'Back Yoke',
        instruction: 'Cut 1 on fold (CB) · Straight yoke seam · Flat-fell to lower back panel · {topstitch} two rows from RS',
        type: 'bodice',
        polygon: backYokePoly,
        path: polyToPathStr(backYokePoly),
        width: backYokeBB.maxX - backYokeBB.minX,
        height: backYokeBB.maxY - backYokeBB.minY,
        isBack: true,
        sa, hem: 0,
        notches: [
          { x: neckW + shoulderW / 2, y: slopeDrop / 2, angle: edgeAngle({ x: neckW, y: 0 }, { x: shoulderPtX, y: slopeDrop }) },
        ],
        dims: [
          { label: fmtInches(backW) + ' half width', x1: 0, y1: -0.5, x2: backW, y2: -0.5, type: 'h' },
          { label: fmtInches(yokeLineY) + ' depth', x: backYokeBB.maxX + 1, y1: 0, y2: yokeLineY, type: 'v' },
        ],
      });
      pieces.push({
        id: 'back-panel',
        name: 'Back Panel (below yoke)',
        instruction: 'Cut 1 on fold (CB) · Joins to back yoke at top. Optional: add 1″ CB box pleat for ease.',
        type: 'bodice',
        polygon: backLowerPoly,
        path: polyToPathStr(backLowerPoly),
        width: backLowerBB.maxX - backLowerBB.minX,
        height: backLowerBB.maxY - backLowerBB.minY,
        isBack: true,
        sa, hem,
        notches: backNotches,
        dims: [
          { label: fmtInches(backW) + ' half width', x1: 0, y1: yokeLineY - 0.5, x2: backW, y2: yokeLineY - 0.5, type: 'h' },
          { label: fmtInches(torsoLen - yokeLineY) + ' length', x: backLowerBB.maxX + 1, y1: yokeLineY, y2: torsoLen, type: 'v' },
        ],
      });
    } else {
      pieces.push({
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
      });
    }

    // ── SLEEVE PIECES — conditional on sleeve style ─────────────────────────
    if (isTwoPiece) {
      const { crown, backPitchPt, frontPitchPt, tsElbowLeft, usElbowLeft } = sleeveResult.landmarks;
      pieces.push({
        id: 'top-sleeve',
        name: 'Top Sleeve',
        instruction: `Cut 2 (L & R mirror) · Outer arm · Set into armhole with ease · ${capEaseNote}`,
        type: 'sleeve',
        polygon: sleeveResult.topSleeve,
        path: polyToPathStr(sleeveResult.topSleeve),
        width: topSlvBB.maxX - topSlvBB.minX,
        height: topSlvBB.maxY - topSlvBB.minY,
        capHeight: sleeveResult.capHeight,
        sleeveLength: slvLength,
        sleeveWidth: sleeveResult.topSleeveWidth,
        sa, hem,
        notches: [
          { x: crown.x,             y: crown.y,        angle: -90 },
          { x: frontPitchPt.x,      y: frontPitchPt.y, angle: 180 },
          { x: backPitchPt.x,       y: backPitchPt.y,  angle: 0 },
          { x: backPitchPt.x + 0.3, y: backPitchPt.y,  angle: 0 },
          { x: tsElbowLeft.x,       y: tsElbowLeft.y,  angle: 180 },
        ],
        dims: [
          { label: fmtInches(sleeveResult.topSleeveWidth) + ' top slv width', x1: topSlvBB.minX, y1: sleeveResult.capHeight + 0.4, x2: topSlvBB.maxX, y2: sleeveResult.capHeight + 0.4, type: 'h' },
          { label: fmtInches(slvLength) + ' length', x: topSlvBB.maxX + 1, y1: 0, y2: slvLength + sleeveResult.capHeight, type: 'v' },
          { label: fmtInches(effArmToElbow) + ' to elbow', x: topSlvBB.minX - 1.5, y1: sleeveResult.capHeight, y2: sleeveResult.elbowY, type: 'v', color: '#b8963e' },
        ],
      });
      pieces.push({
        id: 'under-sleeve',
        name: 'Under Sleeve',
        instruction: 'Cut 2 (L & R mirror) · Inner arm · Joins to top sleeve at front and back seams',
        type: 'sleeve',
        polygon: sleeveResult.underSleeve,
        path: polyToPathStr(sleeveResult.underSleeve),
        width: underSlvBB.maxX - underSlvBB.minX,
        height: underSlvBB.maxY - underSlvBB.minY,
        capHeight: sleeveResult.capHeight,
        sleeveLength: slvLength,
        sleeveWidth: sleeveResult.underSleeveWidth,
        sa, hem,
        notches: [
          { x: usElbowLeft.x, y: usElbowLeft.y, angle: 0 },
        ],
        dims: [
          { label: fmtInches(sleeveResult.underSleeveWidth) + ' under slv width', x1: underSlvBB.minX, y1: sleeveResult.capHeight + 0.4, x2: underSlvBB.maxX, y2: sleeveResult.capHeight + 0.4, type: 'h' },
          { label: fmtInches(slvLength) + ' length', x: underSlvBB.maxX + 1, y1: 0, y2: slvLength + sleeveResult.capHeight, type: 'v' },
        ],
      });
    } else {
      pieces.push({
        id: 'sleeve',
        name: 'Sleeve',
        instruction: `Cut 2 (mirror L & R) · One-piece set-in · Low flat cap for easy flat-fell topstitching · ${capEaseNote}`,
        type: 'sleeve',
        polygon: onePiecePoly,
        path: polyToPathStr(onePiecePoly),
        width: onePieceSlvBB.maxX - onePieceSlvBB.minX,
        height: onePieceSlvBB.maxY - onePieceSlvBB.minY,
        capHeight: onePieceCapH,
        sleeveLength: slvLength,
        sleeveWidth: slvTopW * 2,
        sa, hem,
        notches: (() => {
          const slvFullW = slvTopW * 2;
          const backAngle = edgeAngle({ x: slvFullW / 2, y: 0 }, { x: slvFullW, y: onePieceCapH });
          const bDx = slvFullW / 2, bDy = onePieceCapH;
          const bLen = Math.sqrt(bDx * bDx + bDy * bDy);
          const bStepX = 0.25 * bDx / bLen, bStepY = 0.25 * bDy / bLen;
          return [
            { x: slvFullW / 2,             y: 0,                    angle: -90 },
            { x: slvFullW * 0.25,          y: onePieceCapH * 0.5,   angle: edgeAngle({ x: 0, y: onePieceCapH }, { x: slvFullW / 2, y: 0 }) },
            { x: slvFullW * 0.75,          y: onePieceCapH * 0.5,   angle: backAngle },
            { x: slvFullW * 0.75 + bStepX, y: onePieceCapH * 0.5 + bStepY, angle: backAngle },
          ];
        })(),
        dims: [
          { label: fmtInches(slvTopW * 2) + ' underarm width', x1: 0, y1: onePieceCapH + 0.4, x2: slvTopW * 2, y2: onePieceCapH + 0.4, type: 'h' },
          { label: fmtInches(slvLength) + ' length', x: slvTopW * 2 + 1, y1: onePieceCapH, y2: onePieceCapH + slvLength, type: 'v' },
          { label: fmtInches(effArmToElbow) + ' to elbow', x: -1.5, y1: onePieceCapH, y2: onePieceCapH + effArmToElbow, type: 'v', color: '#b8963e' },
        ],
      });
    }

    // ── COLLAR PIECES — conditional on collar style ──────────────────────────
    if (opts.collar === 'stand') {
      const standUpperBB = bbox(standResult.upperCollar);
      const standUnderBB = bbox(standResult.underCollar);
      const fallUpperBB  = bbox(fallResult.upperCollar);
      const fallUnderBB  = bbox(fallResult.underCollar);
      pieces.push({
        id: 'collar-stand-outer',
        name: 'Collar Stand (Outer)',
        instruction: `Cut 1 on fold (CB) · Interface · ${fmtInches(standResult.standLength)} half-length × ${fmtInches(standH)} height · Sewn to neckline`,
        type: 'bodice', polygon: standResult.upperCollar, path: polyToPathStr(standResult.upperCollar),
        width: standUpperBB.maxX - standUpperBB.minX, height: standUpperBB.maxY - standUpperBB.minY,
        isBack: false, sa, hem: 0,
        dims: [
          { label: fmtInches(standResult.standLength) + ' half length', x1: 0, y1: -0.5, x2: standResult.standLength, y2: -0.5, type: 'h' },
        ],
      });
      pieces.push({
        id: 'collar-stand-facing',
        name: 'Collar Stand (Facing)',
        instruction: 'Cut 1 on fold (CB) · Interface · 2% smaller than outer stand so seam rolls under',
        type: 'bodice', polygon: standResult.underCollar, path: polyToPathStr(standResult.underCollar),
        width: standUnderBB.maxX - standUnderBB.minX, height: standUnderBB.maxY - standUnderBB.minY,
        isBack: false, sa, hem: 0,
      });
      pieces.push({
        id: 'collar-fall-outer',
        name: 'Collar Fall (Outer)',
        instruction: `Cut 1 on fold (CB) · Interface · ${fmtInches(fallResult.standLength)} half-length × ${fmtInches(fallH)} height · Point tips ¾″ at CF — turn precisely`,
        type: 'bodice', polygon: fallResult.upperCollar, path: polyToPathStr(fallResult.upperCollar),
        width: fallUpperBB.maxX - fallUpperBB.minX, height: fallUpperBB.maxY - fallUpperBB.minY,
        isBack: false, sa, hem: 0,
        dims: [
          { label: fmtInches(fallResult.standLength) + ' half length', x1: 0, y1: -0.5, x2: fallResult.standLength, y2: -0.5, type: 'h' },
          { label: fmtInches(fallH) + ' width', x: fallUpperBB.maxX + 1, y1: fallUpperBB.minY, y2: fallUpperBB.maxY, type: 'v' },
        ],
      });
      pieces.push({
        id: 'collar-fall-under',
        name: 'Collar Fall (Under)',
        instruction: 'Cut 1 on fold (CB) · 2% smaller than outer fall so seam rolls under',
        type: 'bodice', polygon: fallResult.underCollar, path: polyToPathStr(fallResult.underCollar),
        width: fallUnderBB.maxX - fallUnderBB.minX, height: fallUnderBB.maxY - fallUnderBB.minY,
        isBack: false, sa, hem: 0,
      });
    } else {
      const upperCollarBB = bbox(collarResult.upperCollar);
      const underCollarBB = bbox(collarResult.underCollar);
      pieces.push({
        id: 'upper-collar',
        name: 'Band Collar (Outer)',
        instruction: `Cut 1 on fold (CB) · Interface · ${fmtInches(collarResult.standLength)} half-length × ${fmtInches(collarH)} cut · Square ends at CF · Outer visible collar`,
        type: 'bodice', polygon: collarResult.upperCollar, path: polyToPathStr(collarResult.upperCollar),
        width: upperCollarBB.maxX - upperCollarBB.minX, height: upperCollarBB.maxY - upperCollarBB.minY,
        isBack: false, sa, hem: 0,
        dims: [
          { label: fmtInches(collarResult.standLength) + ' half length', x1: 0, y1: -0.5, x2: collarResult.standLength, y2: -0.5, type: 'h' },
          { label: fmtInches(collarH) + ' width', x: upperCollarBB.maxX + 1, y1: upperCollarBB.minY, y2: upperCollarBB.maxY, type: 'v' },
        ],
      });
      pieces.push({
        id: 'under-collar',
        name: 'Band Collar (Facing)',
        instruction: 'Cut 1 on fold (CB) · Interface with 2 layers · 2% smaller than outer collar so seam rolls under · Inner layer',
        type: 'bodice', polygon: collarResult.underCollar, path: polyToPathStr(collarResult.underCollar),
        width: underCollarBB.maxX - underCollarBB.minX, height: underCollarBB.maxY - underCollarBB.minY,
        isBack: false, sa, hem: 0,
        dims: [
          { label: fmtInches(collarResult.standLength / 1.02) + ' half length', x1: 0, y1: -0.5, x2: collarResult.standLength / 1.02, y2: -0.5, type: 'h' },
        ],
      });
    }

    pieces.push({
      id: 'front-facing',
      name: 'Front Facing',
      instruction: opts.closure === 'zipper'
        ? `Cut 2 (L & R) · Interface · ${fmtInches(FACING_W)} wide × ${fmtInches(facingH)} long · Backs the zipper tape on inside`
        : `Cut 2 (L & R) · Interface · ${fmtInches(FACING_W)} wide × ${fmtInches(facingH)} long`,
      type: 'pocket',
      dimensions: { width: FACING_W, height: facingH },
      sa,
    });

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

    // ── CUFF BAND (cuff === 'band') ──────────────────────────────────────────
    if (opts.cuff === 'band') {
      const cuffBandW = slvBotW * 2 + 1.5;
      const cuffBandH = 3.5;
      pieces.push({
        id: 'cuff-band',
        name: 'Cuff Band',
        instruction: `Cut 4 (2 outer + 2 facing) from self-fabric, OR cut 2 from ribbed knit on the cross-grain · ${fmtInches(cuffBandW)} × ${fmtInches(cuffBandH)} · Interface self-fabric bands · Finished height ~1.5″`,
        type: 'pocket',
        dimensions: { width: cuffBandW, height: cuffBandH },
        sa,
      });
    }

    // ── WAISTBAND / HEM BAND (waistband === 'band') ──────────────────────────
    if (opts.waistband === 'band') {
      const wbLen = panelW * 2 + PLACKET_W + 1.5;
      const wbH = 4;
      pieces.push({
        id: 'waistband',
        name: 'Waistband / Hem Band',
        instruction: `Cut 2 on fold (CB) from self-fabric, OR cut 1 from ribbed knit on the cross-grain · ${fmtInches(wbLen)} half-length × ${fmtInches(wbH)} · Interface self-fabric bands · Finished height ~2″ · Overlap at CF for button/snap`,
        type: 'pocket',
        dimensions: { width: wbLen, height: wbH },
        sa,
      });
    }

    return pieces;
  },

  materials(m, opts) {
    const btnCount = opts.length === 'hip' ? 6 : 5;
    const torsoLen = m.torsoLength + (opts.length === 'hip' ? 4 : 0);
    const slvLength = m.sleeveLength ?? 26;
    const capH = opts.sleeveStyle === 'two-piece' ? 5 : 4.5;

    // ── YARDAGE ESTIMATES ────────────────────────────────────────────────────
    function roundYd(n) { return Math.ceil(n / 0.25) * 0.25; }
    const totalLinear = torsoLen + capH + slvLength;
    const shellY60 = roundYd(totalLinear / 36 + 1.0);
    const shellY54 = roundYd(totalLinear / 36 + 1.25);
    const shellY45 = roundYd(totalLinear / 36 + 2.0);
    const liningYd = roundYd(shellY60 - 0.5);

    // ── INTERFACING ──────────────────────────────────────────────────────────
    const hasBands = opts.waistband === 'band' || opts.cuff === 'band';
    const interfacingYd = hasBands ? '1 yard' : '0.75 yard';
    const interfacingParts = [
      opts.collar === 'stand' ? 'collar stand + fall' : 'collar',
      'front facings',
      opts.waistband === 'band' ? 'waistband' : '',
      opts.cuff === 'band' ? 'cuff bands' : '',
    ].filter(Boolean).join(', ');

    const notions = [
      { ref: 'interfacing-med', quantity: `${interfacingYd} (${interfacingParts})` },
    ];

    if (opts.closure === 'button') {
      notions.push({ name: 'Heavy-duty shank buttons', quantity: `${btnCount + 1}`, notes: '⅞″ – 1″. Corozo, horn, or metal shank for the elevated workwear read. Avoid plastic.' });
    } else if (opts.closure === 'snap') {
      notions.push({ name: 'Snap buttons', quantity: `${btnCount}`, notes: 'Heavy-duty snaps (size 24 or 20). Use snap setter tool and backing plate.' });
    } else if (opts.closure === 'zipper') {
      notions.push({ name: 'Separating zipper (YKK #5)', quantity: `${Math.ceil(torsoLen + 2)}″`, notes: 'Metal coil, exposed CF, brass preferred. Detroit jacket style.' });
      notions.push({ name: 'Collar button or snap', quantity: '1', notes: 'For neck tab above zipper' });
    }

    if (opts.chestPocket === 'zip') {
      notions.push({ name: 'Pocket zipper (#3)', quantity: '5″', notes: 'Coil zipper for chest welt pocket' });
    }

    if (opts.lining !== 'none') {
      const liningNames = { flannel: 'Cotton flannel lining', poplin: 'Cotton poplin or Bemberg/cupro lining', quilted: 'Quilted cotton lining' };
      const liningNotes = { flannel: 'Soft brushed flannel for warmth. This is the Carhartt blanket-lined signature.', poplin: 'Lightweight, smooth. Bemberg (cupro) is the premium option: it breathes and drapes.', quilted: 'Pre-quilted cotton batting. Adds warmth without bulk.' };
      notions.push({ name: liningNames[opts.lining] || 'Lining fabric', quantity: `${liningYd} yard`, notes: liningNotes[opts.lining] || '' });
    }

    if (opts.cuff === 'tab') {
      notions.push({ name: 'Cuff tab snaps or buttons', quantity: '2', notes: 'One per sleeve cuff tab' });
    }

    if (hasBands) {
      notions.push({ name: 'Ribbed knit yardage (optional)', quantity: '¼ yard', notes: 'If using ribbed knit for waistband/cuffs instead of self-fabric. Cotton/poly rib, 2×2 or 1×1 rib.' });
    }

    return buildMaterialsSpec({
      fabrics: ['cotton-canvas', 'bull-denim', 'cotton-twill', 'waxed-cotton', 'corduroy', 'moleskin', 'wool-melton'],
      notions,
      thread: 'poly-heavy',
      needle: 'denim-100',
      stitches: ['straight-3', 'straight-3.5', 'bartack', 'topstitch'],
      notes: [
        `Shell fabric yardage: ~${shellY60} yd at 60″, ~${shellY54} yd at 54″, ~${shellY45} yd at 45″. Canvas commonly comes in all three widths.`,
        'Fabric recommendations: cotton canvas / duck (10–12 oz) is the Detroit standard. Cotton twill or bull denim (10–14 oz) gives a cleaner read and takes dye well. Waxed canvas for the Filson-style elevated read (pricier but transformative). Corduroy (mid-wale, 11–14 oz) reads vintage fall/winter workwear. Moleskin is underrated: soft, reads British workwear. Wool melton or heavy coating (deadstock) for a cold-weather version that reads expensive.',
        'Budget tip: pre-washed drop cloths from Home Depot work well for a first muslin or a lived-in canvas jacket. Wash 2–3 times hot before cutting to pre-shrink and soften. Harbor Freight cloths are looser woven and lower quality.',
        'Avoid anything drapey (rayon, challis, lightweight linen), stretchy, or quilting-cotton weight. This silhouette needs body and structure.',
        'Pre-wash canvas and denim to preshrink. Canvas can shrink 5–8% in the first wash. Waxed cotton: do NOT pre-wash. Wipe clean only, re-wax annually.',
        '{topstitch} all seams at 3.5mm. Use contrasting gold/tan thread (Gutermann Mara 70 or equivalent) for the workwear read, or matching thread for an elevated/clean finish. The topstitching is where the "expensive" read lives: double rows at yoke, pocket edges, hems.',
        'Interface collar with 2 layers of medium woven interfacing for structure. Use fusible for canvas, sew-in for waxed cotton (fusible will not adhere to wax).',
        'Bar tack all four corners of each pocket. Canvas is heavy and will stress pocket attachment points.',
        opts.closure === 'snap' ? 'Install snaps with a snap setter tool and backing plate. Canvas requires firm pressure.' : '',
        opts.closure === 'zipper' ? 'Separating zipper: use a zipper foot. Install AFTER attaching front facings and zipper guard strips. Test zipper engagement before topstitching.' : '',
        opts.lining !== 'none' ? 'Pre-wash lining fabric before cutting. Bag the lining: sew shell + lining at hem and front edges, turn through sleeve hem opening, slipstitch closed.' : '',
        opts.lining === 'none' ? 'Unlined interior finish options: flat-felled seams (already specified for shoulders and sides). For remaining raw edges, use Hong Kong finish (bind with ½″ bias strips) for a very clean interior.' : '',
        opts.lowerPocket === 'welt' ? 'Welt pockets: practice on scrap canvas first. Mark accurately, slash precisely. Bar tack ends after turning.' : '',
        'Optional upgrades: copper rivets at pocket stress points (rivet setter + backing plate), pattern-matching for plaid/stripe fabrics (buy extra ¼ yd), flat-felled ALL interior seams for a fully enclosed interior.',
      ].filter(Boolean),
    });
  },

  instructions(m, opts) {
    const steps = [];
    let n = 1;
    const btnCount = opts.length === 'hip' ? 6 : 5;
    const lined = opts.lining !== 'none';
    const isZip = opts.closure === 'zipper';
    const isTwoPiece = opts.sleeveStyle === 'two-piece';
    const hasYoke = opts.backYoke === 'straight';

    // ── 1. INTERFACE ─────────────────────────────────────────────────────────
    steps.push({
      step: n++, title: 'Interface all pieces',
      detail: `Before any sewing, fuse or sew interfacing to: ${opts.collar === 'stand' ? 'collar stand outer + facing (both layers), collar fall outer,' : 'outer collar (2 layers),'} front facings${opts.waistband === 'band' ? ', waistband' : ''}${opts.cuff === 'band' ? ', cuff bands' : ''}${opts.lowerPocket === 'welt' ? ', welt strips' : ''}${opts.chestPocket === 'zip' ? ', chest welt strip' : ''}. Use medium-weight fusible for canvas and twill. For waxed cotton, use sew-in interfacing (fusible will not bond to wax). {press} each piece with a damp cloth on the appropriate heat setting.`,
    });

    // ── 2. POCKETS (while panels are flat) ───────────────────────────────────
    if (opts.chestPocket === 'patch') {
      steps.push({
        step: n++, title: 'Prepare and attach chest pocket',
        detail: 'Mark pencil slot division line 1.5″ from right edge. Fold top under 1″, {topstitch} twice. {press} sides and bottom under ⅝″. {topstitch} slot division line through pocket. Position on left front panel, 2.5″ below neckline. {topstitch} on 3 sides at 3.5mm. Bar tack all four corners. Fit-critical: measure pocket placement from the shoulder seam line on both sides to ensure symmetry. Asymmetric pockets are the #1 tell on a handmade jacket.',
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
        detail: `Mark welt opening on each front panel at hip level (${opts.length === 'hip' ? '8' : '4'}″ from hem). Interface welt strips. Sew welts {RST} above and below slash line, ending stitches exactly at corners. Slash through center, clip diagonally to corners. Turn welts through opening to WS. {press}. {understitch} welts. Attach pocket bag halves to welt SAs. {whipstitch} bag sides. Bar tack welt ends. Fit-critical: use a ruler to confirm both pocket openings are the same distance from the hem and the same distance from the side seam.`,
      });
    } else {
      steps.push({
        step: n++, title: 'Prepare and attach hip patch pockets',
        detail: `Fold top edge under 1″ twice, {topstitch}. {press} remaining three edges under ⅝″. Position on front panels at hip level, ${opts.length === 'hip' ? '8' : '4'}″ from hem. {topstitch} on 3 sides at 3.5mm. Bar tack all four corners. Fit-critical: measure pocket placement from the side seam and from the hem on both panels. They must match.`,
      });
    }

    // ── 3. BACK YOKE (if selected) ───────────────────────────────────────────
    if (hasYoke) {
      steps.push({
        step: n++, title: 'Sew back yoke to lower back panel',
        detail: 'Pin back yoke to lower back panel at the horizontal yoke seam {RST}, matching CB and armhole notches. Sew at ⅝″. {press} both SAs toward the yoke. Trim the lower panel SA to 3mm. Tuck the raw edge of the yoke SA under so it encloses the trimmed lower SA. {press} flat. {topstitch} with two rows from the right side: first at ⅛″ from the seam, then at ¼″ from the seam. Both rows should bite through the fold, the trimmed SA, and the lower panel. This gives the classic workwear double-row detail at the yoke. Optional: before sewing the yoke seam, baste a 1″ CB box pleat on the lower back panel for ease of movement. Fold two pleats 0.5″ from CB toward the sides, stitch the pleat closed from the yoke seam down 3–4″, then let the pleat open below.',
      });
    }

    // ── 4. COLLAR ASSEMBLY ───────────────────────────────────────────────────
    if (opts.collar === 'stand') {
      steps.push({
        step: n++, title: 'Assemble collar stand',
        detail: 'Pin collar stand outer to collar stand facing {RST}. Sew both short CF ends only, leaving the top (fall attachment) edge and bottom (neckline) edge open. Trim corner SAs to 3mm. Turn RS out, {press}. Baste the two layers together at both long edges, raw edges aligned. The stand is now a clean-finished band ready for the neckline and the collar fall.',
      });
      steps.push({
        step: n++, title: 'Assemble collar fall',
        detail: 'Pin collar fall outer to collar fall under {RST}. Sew the outer (top) edge and both short CF ends (3 sides), leaving the inner (bottom) edge open. Trim seam to 3mm. {clip} diagonally to the CF point corners, 1mm from the tip. Turn RS out. Use a {point turner} to fully push the CF points out. {press} from the outer side, rolling the seam slightly to the under side so it is invisible from the outside. {topstitch} at 3.5mm from the outer edge if desired.',
      });
    } else {
      steps.push({
        step: n++, title: 'Prepare collar',
        detail: 'Interface outer collar with 2 layers of woven interfacing. Pin outer to under collar {RST}, curved edges aligned. Sew outer edge and both CF ends (3 sides), leaving neck edge open. Trim to 3mm. Notch outer curve, turn. {press} from outer collar side, rolling seam to underside. {topstitch} 3.5mm from outer edge if desired.',
      });
    }

    // ── 5. FRONT FACINGS / PLACKETS ──────────────────────────────────────────
    if (isZip) {
      steps.push({
        step: n++, title: 'Prepare zipper guards and front facings',
        detail: 'Interface zipper guard strips and front facings. {press} guard strips in half lengthwise. Sew guard to CF edge of each front panel {RST}, raw edges aligned. {press} guard toward inside, {topstitch} inner edge through panel. Sew front facing to inner edge of guard {RST}. {press} facing toward inside.',
      });
    } else {
      steps.push({
        step: n++, title: 'Prepare front facings and plackets',
        detail: `Interface facing strips. {press} placket extension ${fmtInches(PLACKET_W)} to WS at CF fold line. Sew facing to placket edge {RST}. {press}, {topstitch}. Facing creates clean interior at front opening.`,
      });
    }

    // ── 6. SHOULDER SEAMS ────────────────────────────────────────────────────
    steps.push({
      step: n++, title: 'Sew shoulder seams (flat-fell)',
      detail: (hasYoke ? 'Join front panel (or front yoke, if your design has one) to back yoke at shoulders {RST}.\n\n' : '') + flatFelledSeam({
        seam: 'shoulder seam',
        sa: '⅝″',
        pressDir: 'back',
        trimSide: 'front',
        foldSide: 'back',
        trimTo: '3mm (⅛″)',
        row1: '⅛″',
        row2: '¼″ (3.5mm)',
        thread: 'matching or contrasting',
        extraTip: 'Fit-critical: the shoulder seam should sit right at the shoulder bone, not forward onto the chest or back onto the deltoid. If it is off, the entire sleeve hang will be wrong. Pin and try on before sewing if unsure.',
      }),
    });

    // ── 7. COLLAR ATTACHMENT ─────────────────────────────────────────────────
    if (opts.collar === 'stand') {
      steps.push({
        step: n++, title: 'Attach collar stand to neckline',
        detail: 'Pin the collar stand bottom (neckline) edge to the bodice neckline {RST}, matching CB mark to CB and CF ends to front edges. Distribute ease evenly around the neckline curve. Sew. {clip} the neckline SA every ½″ so it lies flat. Grade the SA (trim bodice SA slightly shorter than stand SA). {press} toward the stand. Fold the stand facing SA under so the folded edge just covers the seam line from inside. {slipstitch} or {edgestitch} through all layers at ⅛″ from the seamline.',
      });
      steps.push({
        step: n++, title: 'Attach collar fall to stand',
        detail: 'Pin the collar fall inner (bottom) edge to the collar stand outer (top) edge {RST}, matching CB and CF marks. Sew. Grade and {press} the SA toward the fall. Fold the fall under layer SA under and {slipstitch} to the stand from inside, covering the seam. Alternatively, {edgestitch} from the RS at ⅛″ through all layers. Fit-critical: try on the jacket (or put it on a dress form) and confirm the collar stands evenly on both sides before finishing the under layer. Adjust if one side sits higher.',
      });
    } else {
      steps.push({
        step: n++, title: 'Attach collar',
        detail: 'Pin outer collar neck edge to bodice neckline {RST}, matching CB and CF marks. Distribute ease evenly. Sew. {clip} neckline seam allowance every ½″. Fold under-collar neck SA under, slipstitch to WS covering seam. {topstitch} from RS at 3.5mm through all layers if desired.',
      });
    }

    // ── 8. SIDE SEAMS ────────────────────────────────────────────────────────
    steps.push({
      step: n++, title: 'Sew side seams (flat-fell)',
      detail: flatFelledSeam({
        seam: isTwoPiece
          ? 'side seam (from jacket hem to underarm)'
          : 'side seam (from jacket hem continuously through the underarm to the sleeve hem in one pass)',
        sa: '⅝″',
        pressDir: 'back',
        trimSide: 'front',
        foldSide: 'back',
        trimTo: '3mm (⅛″)',
        row1: '⅛″',
        row2: '¼″ (3.5mm)',
        thread: 'matching or contrasting',
        extraTip: isTwoPiece
          ? 'With a two-piece sleeve, the side seam runs only from hem to underarm. The sleeve is set in separately.'
          : 'Because this seam runs continuously from hem to sleeve hem, sew and fell in one long pass. At the underarm pivot point, clip the seam allowance nearly to the stitching line so the fell lies flat around the curve.',
      }),
    });

    // ── 9. SLEEVES ───────────────────────────────────────────────────────────
    if (isTwoPiece) {
      steps.push({
        step: n++, title: 'Construct two-piece sleeves',
        detail: 'For each sleeve: sew the top sleeve to the under sleeve along the front (inner) seam {RST}. {press} open. Sew the back (outer) seam {RST}. {press} open. You now have a cylinder with the cap shaped to fit the armhole. Match the elbow notches on both seams to ensure correct alignment.',
      });
      steps.push({
        step: n++, title: 'Set sleeves into armholes',
        detail: 'Pin the top sleeve cap to the armhole {RST}, matching the crown notch to the shoulder seam, the back pitch notches (double) to the back armhole, and the front pitch notch (single) to the front armhole. The shaped cap has minimal ease — distribute any fullness evenly between the notches rather than bunching it at the crown. Sew. {topstitch} SA toward the sleeve at 6mm from the seam, or apply a flat-fell finish for maximum durability.',
      });
    } else {
      steps.push({
        step: n++, title: 'Set sleeves',
        detail: 'Match crown notch (single, at top of cap) to shoulder seam. Match single front notch to front armhole, double back notch to back armhole. Pin {RST} from underarm, working up each side. Ease cap fullness evenly between notches. Sew. {topstitch} SA toward sleeve at 6mm from seam.',
      });
    }

    // ── 10. ZIPPER (if applicable) ───────────────────────────────────────────
    if (isZip) {
      steps.push({
        step: n++, title: 'Install separating zipper',
        detail: 'Open the separating zipper. Place left tape face-down on RS of left front panel, teeth aligned with CF edge under the guard. Baste in place. Sew through guard + zipper tape + front panel using zipper foot at 3mm from teeth. Repeat for right tape on right front. Close zipper to test alignment. Both halves should meet evenly at the collar. {topstitch} from RS at ¼″ from the zipper teeth on both sides.',
      });
    }

    // ── 11. CUFFS ────────────────────────────────────────────────────────────
    if (opts.cuff === 'band') {
      steps.push({
        step: n++, title: 'Attach cuff bands',
        detail: 'For each sleeve: pin the cuff band outer to the sleeve hem {RST}, matching the underarm seam to the cuff side mark. Sew at ⅝″. Fold the band facing SA under and {slipstitch} to the inside, covering the seam. {topstitch} from RS at ⅛″ from the band seam and again at the band lower edge. If using ribbed knit, stretch the knit slightly to match the sleeve circumference — the gathering gives the Detroit silhouette.',
      });
    } else if (opts.cuff === 'tab') {
      steps.push({
        step: n++, title: 'Make and attach cuff tabs',
        detail: 'Fold each tab pair {RST}, sew 3 sides leaving short end open. Trim corners, turn, {press}. {topstitch} edges. Attach tab to underarm side of sleeve hem before hemming, pointing toward the cuff opening. Mark and install snap or button to allow ~1″ adjustment.',
      });
    }

    // ── 12. WAISTBAND / HEM ──────────────────────────────────────────────────
    if (opts.waistband === 'band') {
      steps.push({
        step: n++, title: 'Attach waistband / hem band',
        detail: 'Pin the waistband outer to the jacket hem {RST}, matching CB to CB, side seams to side marks, and CF overlap to the front edge. Sew at ⅝″. Grade the SA (trim jacket SA shorter than band SA). Fold the band facing SA under and {slipstitch} to the inside covering the seam. {topstitch} from RS at ⅛″ from the band seam, and again along the lower edge of the band. If using ribbed knit, stretch the knit to match the jacket circumference. The ribbed band is the Detroit signature and should gather the hem slightly inward for the boxy cropped silhouette.',
      });
    } else {
      steps.push({
        step: n++, title: opts.cuff === 'band' ? 'Hem jacket body' : 'Hem sleeves and body',
        detail: `Fold ${opts.cuff === 'band' ? 'jacket body' : 'sleeve'} hem up ${fmtInches(parseFloat(opts.hem))} twice, {press}. {topstitch} at 3.5mm.${opts.cuff === 'band' ? '' : ' Repeat for jacket body hem.'}${lined ? ' Leave lining hem free for bagging in next step.' : ''}`,
      });
    }

    // ── 13. LINING ───────────────────────────────────────────────────────────
    if (lined) {
      steps.push({
        step: n++, title: 'Assemble lining',
        detail: `Sew lining front + back at shoulders and side seams. ${isTwoPiece ? 'Sew sleeve linings at front and back seams, then sew into lining armholes.' : 'Sew sleeve linings into lining armholes.'} Add ½″ pleat at CB lining for ease. Press all seams toward back.`,
      });

      if (opts.innerPocket === 'welt') {
        steps.push({
          step: n++, title: 'Sew inner breast pocket',
          detail: 'Mark welt opening on left lining front, ~3″ below shoulder. Interface welt strip. Sew welt {RST} centered over slash. Slash, clip corners, turn through opening. {press}. Sew bag halves {RST} on 3 sides. Attach bag to welt SAs through opening. Bar tack ends. Repeat on right side if desired.',
        });
      }

      steps.push({
        step: n++, title: 'Bag the lining',
        detail: `Pin lining to jacket {RST}: lining CF to facing inner edge, lining hem to jacket hem (lining 1″ shorter than shell). {Slipstitch} lining hem to facing edges. {Slipstitch} sleeve lining hem to sleeve hem. Tack lining at underarm seam to keep it from twisting. Lining floats free at side seams.${opts.lining === 'flannel' ? ' For the Detroit blanket-lined look, the flannel lining should be slightly visible at the hem roll when the jacket hangs open. Do not trim the lining shorter than 1″ from the shell hem.' : ''}`,
      });
    }

    // ── 14. TOPSTITCHING PASS ────────────────────────────────────────────────
    steps.push({
      step: n++, title: 'Topstitching pass',
      detail: 'Walk through the entire jacket and add any remaining topstitching. Double rows at: yoke seam (if present), pocket edges, hem/band edges, collar stand seam, placket edges. Single row at: armhole seam (if not flat-felled), sleeve hem. Use a longer stitch (3.5mm) and contrasting gold/tan thread for the classic workwear read, or matching thread for a cleaner elevated finish. This is where the "expensive" read lives. Take time to keep rows straight and evenly spaced.',
    });

    // ── 15. CLOSURES ─────────────────────────────────────────────────────────
    if (opts.closure === 'button') {
      steps.push({
        step: n++, title: 'Buttonholes and buttons',
        detail: `Mark ${btnCount} buttonholes on right placket (vertical buttonholes for jacket): first 1.5″ from neckline, last 2″ from hem, evenly spaced. Test buttonhole size on a scrap of your shell fabric first. Canvas dulls needles quickly, so use a fresh needle for buttonholes. Sew buttonholes. Cut open with a seam ripper, working from each end toward the center to avoid overshooting. Sew buttons to left placket.`,
      });
    } else if (opts.closure === 'snap') {
      steps.push({
        step: n++, title: 'Install snaps',
        detail: `Mark ${btnCount} snap positions. Install male halves on right placket, female halves on left placket. Use snap setter tool and backing plate. Canvas requires firm, even pressure.`,
      });
    } else if (isZip) {
      steps.push({
        step: n++, title: 'Install collar tab closure',
        detail: 'Sew a small button or snap at the collar/neckline above the zipper top stop. Detroit jackets often have a single button or snap here to keep the collar closed at the throat.',
      });
    }

    // ── 16. FINISH ───────────────────────────────────────────────────────────
    steps.push({
      step: n++, title: 'Finish and press',
      detail: `${lined ? 'Bag-lined finish: the lining is already installed. ' : opts.lining === 'none' ? 'Interior finish: all flat-felled seams are already enclosed. For the remaining raw edges (collar, facing, armhole if not felled), consider a Hong Kong finish: bind each raw edge with a ½″ bias strip of self-fabric or contrast fabric. A bias binding foot speeds this up. ' : ''}{press} the entire jacket with steam on the appropriate heat setting for your fabric. Bar tack any remaining stress points: pocket corners, cuff tab ends, waistband ends, underarm junction. Try on and check: (1) shoulder seams sit at the shoulder bone, not down the arm; (2) collar stands evenly on both sides; (3) pockets are level and symmetrical; (4) front panels hang straight with no twist when buttoned/zipped.`,
    });

    return steps;
  },
};
