// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Athletic Formal Jacket — suit-style blazer in heavyweight cotton jersey.
 * Inspired by the Keiji Kaneko × Fruit of the Loom Japan "Athletic Formal Suit".
 *
 * Key features:
 * - 12 oz heavyweight cotton jersey (t-shirt fabric, not fleece)
 * - Double-breasted default (4×2 button), single-breasted option
 * - Peak lapel default, notched and shawl options
 * - Deconstructed construction — knit fusible interfacing, no canvas/padding
 * - Patch + welt combo pockets default
 * - Two mirrored back panels with center back seam (enables center vent)
 * - Relaxed ease (+6″ default)
 * - Stretch stitch / serger for all seams
 *
 * Companion: athletic-formal-trousers
 */

import {
  shoulderSlope, necklineCurve, armholeCurve, sleeveCapCurve, shoulderDropFromWidth,
  armholeDepthFromChest, chestEaseDistribution, neckWidthFromCircumference, UPPER_EASE,
  peakLapelCurve, notchedLapelCurve, shawlCollarCurve, collarCurve,
} from '../engine/upper-body.js';
import { sampleBezier, fmtInches, edgeAngle, arcLength } from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

// ── Constants ────────────────────────────────────────────────────────────────
const SINGLE_PLACKET_W = 1.5;   // single-breasted button placket extension
const DOUBLE_PLACKET_W = 3.5;   // double-breasted overlap extension
const FACING_W         = 3.0;   // front facing width (interfaced)
const VENT_LENGTH_FRAC = 0.35;  // vent length as fraction of jacket length
const VENT_OVERLAP     = 1.5;   // vent overlap/underlap width (inches)

export default {
  id: 'athletic-formal-jacket',
  name: 'Athletic Formal Jacket',
  category: 'upper',
  difficulty: 'advanced',
  priceTier: 'tailored',
  companionId: 'athletic-formal-trousers',
  measurements: ['chest', 'shoulder', 'neck', 'sleeveLength', 'bicep', 'wrist', 'torsoLength'],
  measurementDefaults: { sleeveLength: 26 },

  options: {
    fit: {
      type: 'select', label: 'Fit',
      values: [
        { value: 'standard',  label: 'Standard (+4″)',  reference: 'fitted, modern'           },
        { value: 'relaxed',   label: 'Relaxed (+6″)',   reference: 'Kaneko silhouette'         },
        { value: 'oversized', label: 'Oversized (+10″)', reference: 'deconstructed, very loose' },
      ],
      default: 'relaxed',
    },
    length: {
      type: 'select', label: 'Jacket length',
      values: [
        { value: 'crop',     label: 'Crop - at waist'          },
        { value: 'standard', label: 'Standard - mid-hip (+3″)' },
        { value: 'long',     label: 'Long - full hip (+5″)'    },
      ],
      default: 'standard',
    },
    breasted: {
      type: 'select', label: 'Front style',
      values: [
        { value: 'double', label: 'Double-breasted (4×2)', reference: 'Kaneko original, peak lapel' },
        { value: 'single', label: 'Single-breasted (2-button)', reference: 'classic, versatile'      },
      ],
      default: 'double',
    },
    collar: {
      type: 'select', label: 'Collar style',
      values: [
        { value: 'peak',    label: 'Peak lapel',    reference: 'double-breasted classic, FotL original' },
        { value: 'notched', label: 'Notched lapel',  reference: 'single-breasted classic'               },
        { value: 'shawl',   label: 'Shawl collar',   reference: 'relaxed, dinner jacket'                },
      ],
      default: 'peak',
    },
    pocket: {
      type: 'select', label: 'Hip pockets',
      values: [
        { value: 'combo', label: 'Patch + welt combo', reference: 'FotL original'       },
        { value: 'patch', label: 'Patch ×2',           reference: 'casual, workwear'    },
        { value: 'welt',  label: 'Welt ×2',            reference: 'formal, clean lines' },
        { value: 'none',  label: 'None'                                                  },
      ],
      default: 'combo',
    },
    chestPocket: {
      type: 'select', label: 'Chest pocket',
      values: [
        { value: 'welt', label: 'Welt (breast pocket)' },
        { value: 'none', label: 'None'                  },
      ],
      default: 'welt',
    },
    sleeveCuff: {
      type: 'select', label: 'Sleeve finish',
      values: [
        { value: 'hemmed', label: 'Hemmed (twin-needle)', reference: 'suit-like, FotL original' },
        { value: 'rib',    label: 'Rib knit cuff',        reference: 'sporty, athleisure'       },
      ],
      default: 'hemmed',
    },
    lining: {
      type: 'select', label: 'Lining',
      values: [
        { value: 'unlined', label: 'Unlined',                         reference: 'comfort, breathable' },
        { value: 'half',    label: 'Half-lined (sleeves + upper back)', reference: 'easy slide-on'       },
      ],
      default: 'unlined',
    },
    vent: {
      type: 'select', label: 'Back vent',
      values: [
        { value: 'center', label: 'Center back vent', reference: 'classic single-vent' },
        { value: 'side',   label: 'Side vents ×2',    reference: 'British style'       },
        { value: 'none',   label: 'No vent'                                             },
      ],
      default: 'center',
    },
    sa: {
      type: 'select', label: 'Seam allowance',
      values: [
        { value: 0.375, label: '⅜″' },
        { value: 0.5,   label: '½″' },
      ],
      default: 0.5,
    },
    hem: {
      type: 'select', label: 'Hem allowance',
      values: [
        { value: 0.75, label: '¾″ twin-needle' },
        { value: 1,    label: '1″ fold & stitch' },
      ],
      default: 0.75,
    },
  },

  pieces(m, opts) {
    const sa  = parseFloat(opts.sa);
    const hem = parseFloat(opts.hem);

    const isDouble = opts.breasted === 'double';
    const PLACKET_W = isDouble ? DOUBLE_PLACKET_W : SINGLE_PLACKET_W;

    const totalEase = UPPER_EASE[opts.fit] ?? 6;
    const { front: frontEase, back: backEase } = chestEaseDistribution(totalEase);
    const panelW = (m.chest + totalEase) / 4;
    const frontW = panelW;
    const backW  = panelW;

    const halfShoulder = m.shoulder / 2;
    const neckW        = neckWidthFromCircumference(m.neck);
    const shoulderW    = halfShoulder - neckW;
    const slopeDrop    = shoulderDropFromWidth(shoulderW);
    const shoulderPtX  = neckW + shoulderW;
    const armholeY     = armholeDepthFromChest(m.chest, opts.fit === 'oversized' ? 'oversized' : 'standard');
    const armholeDepth = armholeY - slopeDrop;
    const chestDepth   = panelW - shoulderPtX;
    const backChestDepth = chestDepth;

    const LENGTH_ADD = { crop: 0, standard: 3, long: 5 };
    const torsoLen   = m.torsoLength + (LENGTH_ADD[opts.length] ?? 3);
    const slvLength  = m.sleeveLength ?? 26;

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

    // ── Neckline depths ──
    const NECK_DEPTH_FRONT = isDouble ? 3.5 : 3.0;
    const NECK_DEPTH_BACK  = 0.75;

    const frontNeckPts = sampleCurve(necklineCurve(neckW, NECK_DEPTH_FRONT, 'crew'));
    const backNeckPts  = sampleCurve(necklineCurve(neckW, NECK_DEPTH_BACK, 'crew'));
    const shoulderPts  = sampleCurve(shoulderSlope(shoulderW, slopeDrop));
    const frontArmPts  = sampleCurve(armholeCurve(shoulderW, chestDepth, armholeDepth, false));
    const backArmPts   = sampleCurve(armholeCurve(shoulderW, backChestDepth, armholeDepth, true));

    // ── FRONT PANEL (left — right is mirror) ─────────────────────────────
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
    const sideX = shoulderPtX + chestDepth;
    frontPoly.push({ x: sideX, y: torsoLen });
    frontPoly.push({ x: -PLACKET_W, y: torsoLen });
    frontPoly.push({ x: -PLACKET_W, y: NECK_DEPTH_FRONT });

    // ── BACK PANEL (left — cut 2, mirror L & R, joined at CB seam) ──────
    const backPoly = [];
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
    const backSideX = shoulderPtX + backChestDepth;
    backPoly.push({ x: backSideX, y: torsoLen });
    // Vent extension on CB edge
    const ventLen = opts.vent !== 'none' ? torsoLen * VENT_LENGTH_FRAC : 0;
    if (opts.vent === 'center') {
      // Left back panel gets overlap extension, right gets underlap
      backPoly.push({ x: -VENT_OVERLAP, y: torsoLen });
      backPoly.push({ x: -VENT_OVERLAP, y: torsoLen - ventLen });
      backPoly.push({ x: 0, y: torsoLen - ventLen });
    }
    backPoly.push({ x: 0, y: NECK_DEPTH_BACK });

    // ── SLEEVE ───────────────────────────────────────────────────────────
    const effArmToElbow = m.armToElbow || (slvLength * 0.45);
    const sleeveEase = totalEase * 0.2;
    const slvWidth   = m.bicep / 2 + sleeveEase;
    // Knit fabrics need less cap ease — use lower cap height ratio
    const capHeight  = armholeDepth * (opts.fit === 'oversized' ? 0.50 : 0.55);
    const capCp      = sleeveCapCurve(m.bicep, capHeight, slvWidth * 2);
    const capPts     = sampleCurve(capCp, 16);
    const sleevePoly = [];
    for (const p of capPts) sleevePoly.push({ ...p, y: p.y + capHeight });
    // ── SLEEVE JUNCTION UNTAGGING — VERIFIED WORKING, DO NOT CHANGE UNLESS NECESSARY ──
    delete sleevePoly[0].curve;
    delete sleevePoly[capPts.length - 1].curve;
    // Slight taper toward wrist for jacket sleeve
    const wristW = (m.wrist || m.bicep * 0.75) / 2 + 0.5;
    sleevePoly.push({ x: slvWidth + wristW, y: capHeight + slvLength });
    sleevePoly.push({ x: slvWidth - wristW, y: capHeight + slvLength });

    // ── COLLAR ───────────────────────────────────────────────────────────
    // Button positions for lapel break point calculation
    const btnSpacing = isDouble ? 4.5 : 5;
    const btnCount   = isDouble ? 4 : 2;
    // Top button Y: below the neckline depth for double-breasted
    const topBtnY    = isDouble ? NECK_DEPTH_FRONT + 2 : NECK_DEPTH_FRONT + 3;
    const breakPointY = topBtnY - 0.5; // break point sits just above top button

    // Lapel width: wider for peak/double-breasted, narrower for notched
    const lapelW = opts.collar === 'peak'
      ? (isDouble ? 4 : 3.5)
      : opts.collar === 'notched'
        ? 3
        : 3.5; // shawl

    // ── NOTCH MARKS ─────────────────────────────────────────────────────
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
      { x: backSideX, y: armholeY, angle: 0 },
      { x: shoulderPtX, y: slopeDrop + armholeDepth * 0.25, angle: edgeAngle({ x: shoulderPtX, y: slopeDrop }, { x: backSideX, y: armholeY }) },
      { x: backSideX, y: slopeDrop + armholeDepth * 0.75, angle: edgeAngle({ x: shoulderPtX, y: slopeDrop }, { x: backSideX, y: armholeY }) },
    ];
    // Add vent notch marks to back panels
    if (opts.vent === 'center' && ventLen > 0) {
      backNotches.push({ x: 0, y: torsoLen - ventLen, angle: 180 }); // vent top mark
    }

    const capW = slvWidth * 2;
    const sleeveNotches = [
      { x: capW / 2, y: 0, angle: -90 },
      { x: capW * 0.25, y: capHeight * 0.5, angle: edgeAngle({ x: 0, y: capHeight }, { x: capW / 2, y: 0 }) },
      { x: capW * 0.75, y: capHeight * 0.5, angle: edgeAngle({ x: capW / 2, y: 0 }, { x: capW, y: capHeight }) },
    ];

    // ── SLEEVE CAP / ARMHOLE VALIDATION ──────────────────────────────────
    const frontArmArc = arcLength(frontArmPts);
    const backArmArc  = arcLength(backArmPts);
    const armholeArc  = frontArmArc + backArmArc;
    const capArc      = arcLength(capPts);
    const capEase     = capArc - armholeArc;
    if (capEase < 0.25 || capEase > 2.5) {
      console.warn(`[athletic-formal-jacket] Sleeve cap ease: ${capEase.toFixed(2)}″ (expected 0.25–2.5″). Cap: ${capArc.toFixed(2)}″, Armhole: ${armholeArc.toFixed(2)}″`);
    }
    const capEaseNote = `Sleeve cap: ${fmtInches(capArc)}, Armhole: ${fmtInches(armholeArc)}, Ease: ${fmtInches(capEase)}`;

    const frontBB  = bbox(frontPoly);
    const backBB   = bbox(backPoly);
    const sleeveBB = bbox(sleevePoly);

    // ── PIECES ───────────────────────────────────────────────────────────
    const pieces = [
      {
        id: 'bodice-front',
        name: isDouble ? 'Front Panel (Left)' : 'Front Panel (Left)',
        instruction: `Cut 2 (L & R mirror) · ${fmtInches(PLACKET_W)} ${isDouble ? 'double-breasted overlap' : 'placket'} extension at CF · ${isDouble ? '4×2 button arrangement' : '2-button single-breasted'}`,
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
          { label: fmtInches(PLACKET_W) + ' placket', x1: -PLACKET_W, y1: torsoLen + 0.5, x2: 0, y2: torsoLen + 0.5, type: 'h', color: '#b8963e' },
        ],
      },
      {
        id: 'bodice-back',
        name: 'Back Panel (Left)',
        instruction: `Cut 2 (L & R mirror) · Center back seam (NOT cut on fold)${opts.vent === 'center' ? ` · ${fmtInches(ventLen)} center vent — left overlap, right underlap` : opts.vent === 'side' ? ' · Side vents at side seams' : ''}`,
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
          ...(ventLen > 0 ? [{ label: fmtInches(ventLen) + ' vent', x: -VENT_OVERLAP - 0.8, y1: torsoLen - ventLen, y2: torsoLen, type: 'v', color: '#b8963e' }] : []),
        ],
      },
      {
        id: 'sleeve',
        name: 'Sleeve',
        instruction: `Cut 2 (mirror L & R) · Cap top, set into armhole · ${capEaseNote}`,
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
          { label: fmtInches(effArmToElbow) + ' to elbow', x: -1.5, y1: 0, y2: effArmToElbow, type: 'v', color: '#b8963e' },
        ],
      },
    ];

    // ── COLLAR PIECES ────────────────────────────────────────────────────
    if (opts.collar === 'peak' || opts.collar === 'notched') {
      // Neckline arc for collar construction
      const halfNeckArc = frontArmArc * 0.3 + neckW + shoulderW * 0.4; // approximate half-neck arc

      const { upperCollar, underCollar, standLength } = collarCurve({
        neckArc: halfNeckArc,
        collarWidth: opts.collar === 'peak' ? 3.5 : 3,
        style: 'point',
        standHeight: 1.25,
        underShrink: 0.02,
      });

      pieces.push({
        id: 'upper-collar',
        name: 'Upper Collar',
        instruction: `Cut 1 on fold (CB) · Interface with knit fusible · ${opts.collar === 'peak' ? 'Peak' : 'Notched'} lapel style`,
        type: 'bodice',
        polygon: upperCollar,
        path: polyToPathStr(upperCollar),
        width: standLength,
        height: opts.collar === 'peak' ? 3.5 : 3,
        isBack: false,
        sa,
      });

      pieces.push({
        id: 'under-collar',
        name: 'Under Collar',
        instruction: 'Cut 1 on fold (CB) · 2% smaller than upper collar for seam roll · Interface with knit fusible',
        type: 'bodice',
        polygon: underCollar,
        path: polyToPathStr(underCollar),
        width: standLength / 1.02,
        height: (opts.collar === 'peak' ? 3.5 : 3) / 1.02,
        isBack: false,
        sa,
      });

      // Front facing includes the lapel shape
      const facingH = torsoLen - NECK_DEPTH_FRONT;
      pieces.push({
        id: 'front-facing',
        name: 'Front Facing + Lapel',
        instruction: `Cut 2 (L & R) · Interface with knit fusible · ${fmtInches(FACING_W)} wide plus lapel extension · This piece shapes the ${opts.collar === 'peak' ? 'peak' : 'notched'} lapel`,
        type: 'pocket',
        dimensions: { width: FACING_W + lapelW, height: facingH },
      });
    } else {
      // Shawl collar — combined collar + facing, one piece
      const halfNeckArc = frontArmArc * 0.3 + neckW + shoulderW * 0.4;
      const { shawlPoly } = shawlCollarCurve({
        neckArc: halfNeckArc,
        collarWidth: 3.5,
        lapelWidth: lapelW,
        breakPointY,
        neckDepthFront: NECK_DEPTH_FRONT,
        collarStand: 1.25,
      });

      pieces.push({
        id: 'shawl-collar',
        name: 'Shawl Collar + Facing',
        instruction: 'Cut 2 (outer + facing) on fold at CB · Interface outer with knit fusible · Continuous collar-to-lapel curve, no notch',
        type: 'bodice',
        polygon: shawlPoly,
        path: polyToPathStr(shawlPoly),
        width: halfNeckArc,
        height: lapelW + 3.5,
        isBack: false,
        sa,
      });
    }

    // ── POCKETS ──────────────────────────────────────────────────────────
    if (opts.pocket === 'patch' || opts.pocket === 'combo') {
      pieces.push({
        id: 'hip-patch-pocket',
        name: 'Hip Patch Pocket',
        instruction: `Cut 2 · Position at hip level on front panels · {topstitch} sides and bottom · Bar tack corners`,
        type: 'pocket',
        dimensions: { width: 7, height: 7 },
      });
    }
    if (opts.pocket === 'welt' || opts.pocket === 'combo') {
      pieces.push({
        id: 'hip-welt-bag',
        name: 'Hip Welt Pocket Bag',
        instruction: 'Cut 4 (2 per side) · Lining fabric or self',
        type: 'pocket',
        dimensions: { width: 6, height: 7 },
      });
      pieces.push({
        id: 'hip-welt-flap',
        name: 'Hip Welt Facing',
        instruction: 'Cut 2 · Interface with knit fusible',
        type: 'pocket',
        dimensions: { width: 6, height: 2 },
      });
    }
    if (opts.chestPocket === 'welt') {
      pieces.push({
        id: 'chest-welt-bag',
        name: 'Chest Welt Pocket Bag',
        instruction: 'Cut 2 (top + bottom bag)',
        type: 'pocket',
        dimensions: { width: 5, height: 5 },
      });
      pieces.push({
        id: 'chest-welt-flap',
        name: 'Chest Welt Facing',
        instruction: 'Cut 1 · Interface with knit fusible · Left breast',
        type: 'pocket',
        dimensions: { width: 5, height: 1.5 },
      });
    }

    // ── SLEEVE CUFF ─────────────────────────────────────────────────────
    if (opts.sleeveCuff === 'rib') {
      const cuffLen = wristW * 2 * 0.85;
      pieces.push({
        id: 'sleeve-rib-cuff',
        name: 'Sleeve Rib Cuff',
        instruction: `Cut 2 from rib knit on fold · ${fmtInches(cuffLen)} long × 3″ cut (1.5″ finished) · 85% of sleeve opening`,
        type: 'rectangle',
        dimensions: { length: cuffLen, width: 3 },
        sa,
      });
    }

    // ── LINING ──────────────────────────────────────────────────────────
    if (opts.lining === 'half') {
      pieces.push({
        id: 'lining-back',
        name: 'Back Lining (Upper)',
        instruction: 'Cut 1 on fold (CB) · Extends from shoulder to 4″ below armhole · Jersey or tricot lining',
        type: 'pocket',
        dimensions: { width: backW, height: armholeY + 4 },
      });
      pieces.push({
        id: 'lining-sleeve',
        name: 'Sleeve Lining',
        instruction: 'Cut 2 (mirror L & R) · Full sleeve length · Jersey or tricot lining',
        type: 'pocket',
        dimensions: { width: slvWidth * 2, height: slvLength + capHeight },
      });
    }

    return pieces;
  },

  materials(m, opts) {
    const isDouble = opts.breasted === 'double';
    const btnCount = isDouble ? 4 : 2;

    const notions = [
      { ref: 'interfacing-light', quantity: '1 yard (lapels, collar, facings, pockets — knit fusible ONLY)' },
    ];

    notions.push({
      name: isDouble ? 'Flat buttons (4 functional + 2 decorative)' : 'Buttons',
      quantity: `${isDouble ? 6 : btnCount + 1}`,
      notes: `¾″ – ⅞″ flat or shank buttons${isDouble ? ' — 4×2 arrangement: 2 rows of 2 functional, plus 2 anchor buttons on inner overlap' : ''} +1 spare`,
    });

    if (opts.sleeveCuff === 'rib') {
      notions.push({ name: 'Rib knit', quantity: '0.5 yard', notes: 'For sleeve cuffs — high recovery stretch' });
    }

    if (opts.lining === 'half') {
      notions.push({ name: 'Jersey or tricot lining', quantity: '1.5 yard', notes: 'Slippery knit lining for sleeves + upper back — NOT woven lining' });
    }

    return buildMaterialsSpec({
      fabrics: ['heavyweight-jersey', 'ponte', 'french-terry'],
      notions,
      thread: 'poly-all',
      needle: 'ballpoint-90',
      stitches: ['stretch', 'overlock', 'coverstitch', 'zigzag-med'],
      notes: [
        'Use a ballpoint (jersey) needle 90/14 — prevents skipped stitches on knit',
        'Use stretch stitch or serger for ALL seams — a straight stitch will pop when stretched',
        'IMPORTANT: Use KNIT FUSIBLE interfacing ONLY — woven interfacing prevents stretch and causes puckering. Interface lapels, collar, facings, and welt pockets.',
        'This is a DECONSTRUCTED blazer — no canvas, no pad stitching, no shoulder pads. The knit fusible interfacing provides all the structure needed.',
        'Pre-wash heavyweight jersey before cutting — cotton knits can shrink 3–5% in the first wash',
        'Do not {press} with high heat — use medium heat, light steam. Finger {press} seams where possible.',
        `Hem finish: ${opts.sleeveCuff === 'rib' ? 'rib knit cuffs at 85% of sleeve opening for stretch recovery' : 'twin-needle or coverstitch hem — two parallel rows visible from RS'}`,
        isDouble ? `Double-breasted: the inner overlap has 2 anchor buttons that align with buttonholes on the inner front panel. The outer 4 buttons sit in a 2×2 arrangement — ${fmtInches(4.5)} vertical spacing, ${fmtInches(3)} horizontal spacing.` : '',
        opts.vent === 'center' ? 'Center vent: left back panel overlaps right. Vent is not sewn closed — it opens naturally for movement.' : '',
        opts.lining === 'half' ? 'Half lining: use a slippery KNIT lining (jersey or tricot), never woven. Line sleeves and upper back only. This allows the jacket to slide on over knit layers.' : '',
      ].filter(Boolean),
    });
  },

  instructions(m, opts) {
    const steps = [];
    let n = 1;
    const isDouble = opts.breasted === 'double';
    const btnCount = isDouble ? 4 : 2;

    // ── POCKETS ──
    if (opts.chestPocket === 'welt') {
      steps.push({
        step: n++, title: 'Prepare chest welt pocket',
        detail: 'Interface welt facing with knit fusible. Mark pocket position on left front panel (centered at chest level, about 2″ below shoulder). Sew bound welt: stitch welt rectangle, slash center, turn, {press} gently. Attach bag halves. Whipstitch sides. Bar tack ends.',
      });
    }

    if (opts.pocket === 'combo') {
      steps.push({
        step: n++, title: 'Prepare hip welt pockets',
        detail: 'Interface welt facings with knit fusible. Mark pocket positions at hip level. Sew bound welts on each front panel. Slash, turn, {press} gently. Attach bags. Bar tack ends.',
      });
      steps.push({
        step: n++, title: 'Prepare hip patch pockets',
        detail: 'Fold top edge under ¾″ twice, {topstitch}. {press} remaining three edges under ½″. Position above welt pockets on front panels. {topstitch} on 3 sides. Bar tack all four corners.',
      });
    } else if (opts.pocket === 'patch') {
      steps.push({
        step: n++, title: 'Prepare hip patch pockets',
        detail: 'Fold top edge under ¾″ twice, {topstitch}. {press} remaining three edges under ½″. Position on front panels at hip level. {topstitch} on 3 sides. Bar tack all four corners.',
      });
    } else if (opts.pocket === 'welt') {
      steps.push({
        step: n++, title: 'Prepare hip welt pockets',
        detail: 'Interface welt facings with knit fusible. Mark pocket positions at hip level on each front panel. Sew bound welts, slash, turn, {press} gently. Attach bag halves. Bar tack ends.',
      });
    }

    // ── COLLAR ──
    if (opts.collar === 'peak' || opts.collar === 'notched') {
      steps.push({
        step: n++, title: 'Prepare collar',
        detail: `Interface upper collar with knit fusible. Sew upper to under collar {RST} on three sides, leaving neck edge open. Trim SA to 3mm. {clip} corners. Turn, {press} gently — the under collar is 2% smaller so the seam rolls to the underside. {topstitch} 6mm from edge if desired.`,
      });

      steps.push({
        step: n++, title: 'Prepare front facings and lapels',
        detail: `Interface facing + lapel pieces with knit fusible. Sew facings to front panels {RST} along the lapel roll line and CF edge. {clip} curves. Turn, {press} gently. The facing creates the ${opts.collar === 'peak' ? 'peak' : 'notched'} lapel shape when folded back.`,
      });
    } else {
      steps.push({
        step: n++, title: 'Prepare shawl collar',
        detail: 'Interface outer shawl collar with knit fusible. Sew outer to facing {RST} around the outer edge, leaving neck edge open. {clip} curves. Turn, {press} gently. The collar flows continuously from the back neck into the lapel with no seam break.',
      });
    }

    // ── BODY CONSTRUCTION ──
    steps.push({
      step: n++, title: 'Sew center back seam',
      detail: `Join back panels at CB {RST}. Stretch stitch from neckline to ${opts.vent === 'center' ? 'vent opening. Leave the vent section unsewn — the overlap and underlap extensions fold back independently.' : 'hem.'}${opts.vent === 'side' ? ' Sew full length.' : ''} {press} open.`,
    });

    steps.push({
      step: n++, title: 'Sew shoulder seams',
      detail: 'Join front to back at shoulders {RST}. Stretch stitch or {serge}. {press} toward back.',
    });

    steps.push({
      step: n++, title: 'Attach collar to body',
      detail: opts.collar === 'shawl'
        ? 'Pin shawl collar to neckline {RST}, matching CB and shoulder marks. The collar ends at the break point on each front. Sew. {clip} curve. {press} SA toward collar.'
        : `Pin collar to neckline {RST}, matching CB and front gorge points. Sew. {clip} curve. The collar meets the lapel facing at the gorge — hand-stitch the gorge junction for a clean finish. {press} SA toward collar.`,
    });

    steps.push({
      step: n++, title: 'Set sleeves',
      detail: 'Pin sleeve cap to armhole, matching center cap to shoulder seam. Ease cap to fit (knit fabric eases readily). Stretch stitch or {serge}. {press} toward sleeve.',
    });

    steps.push({
      step: n++, title: 'Sew side seams',
      detail: `Sew front to back at side seams {RST} from hem through underarm to sleeve hem in one continuous seam.${opts.vent === 'side' ? ` Leave the bottom ${fmtInches(m.torsoLength * VENT_LENGTH_FRAC)} of each side seam open for side vents.` : ''} Stretch stitch or {serge}. {press} open.`,
    });

    // ── LINING ──
    if (opts.lining === 'half') {
      steps.push({
        step: n++, title: 'Attach half lining',
        detail: 'Sew sleeve linings to body back lining at armhole. Sew sleeve lining underarm seams. Insert assembled lining into jacket, WS together. Pin at neckline, shoulder, and underarm. Turn SA under at hem of lining. Hand-stitch or machine-tack lining to jacket at neckline, armhole, and lower edge of lining.',
      });
    }

    // ── SLEEVE HEM ──
    if (opts.sleeveCuff === 'rib') {
      steps.push({
        step: n++, title: 'Attach sleeve rib cuffs',
        detail: 'Fold each rib piece in half lengthwise {WST}. Divide cuff and opening into quarters. Sew cuff to sleeve opening {RST}, stretching rib to match opening. Stretch stitch or {serge}. {press} SA into sleeve.',
      });
    } else {
      steps.push({
        step: n++, title: 'Hem sleeves',
        detail: `Fold sleeve hem up ${fmtInches(parseFloat(opts.hem))} once. {press} gently. Twin-needle or coverstitch from RS.`,
      });
    }

    // ── BODY HEM ──
    steps.push({
      step: n++, title: 'Hem body',
      detail: `Fold body hem up ${fmtInches(parseFloat(opts.hem))} once. {press} gently. Twin-needle or coverstitch from RS. At the vent area, fold and {press} the vent extensions before hemming.`,
    });

    // ── BUTTONS ──
    steps.push({
      step: n++, title: isDouble ? 'Buttons — double-breasted' : 'Buttons',
      detail: isDouble
        ? 'Mark 4 button positions on right front panel in a 2×2 arrangement: 2 columns approximately 3″ apart, 2 rows approximately 4.5″ apart. Top row sits just below the break point. Make buttonholes on right panel. Sew buttons on left panel at corresponding positions. Sew 2 anchor buttons inside the left panel at the inner overlap — these hold the inner layer flat when buttoned.'
        : `Mark ${btnCount} button positions on right front panel: first at the break point, second 5″ below. Make vertical buttonholes on right panel. Sew buttons on left panel.`,
    });

    // ── VENT FINISH ──
    if (opts.vent === 'center') {
      steps.push({
        step: n++, title: 'Finish center vent',
        detail: 'The left back panel overlaps the right at the vent. {press} the vent extensions flat. Bar tack the top of the vent on both sides to reinforce. The vent should open naturally for movement — do not sew it closed.',
      });
    }

    steps.push({
      step: n++, title: 'Finish',
      detail: '{press} lightly with medium heat and damp cloth. Roll the lapels into position — with jersey fabric they will naturally hold a soft roll without pad stitching. Try on and check: lapels should lie flat, collar should sit evenly, vent should drape cleanly.',
    });

    return steps;
  },
};
