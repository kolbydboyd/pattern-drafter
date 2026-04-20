// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Denim Jacket (Levi's / Type III style) — structured outerwear with:
 * - Back yoke + back panel (cut on CB fold)
 * - Split front panels with button placket
 * - Two-part sleeve (top sleeve + under sleeve) for tailored arm hang
 * - Upper collar + under collar (2% smaller for roll)
 * - Chest flap pockets, front facing
 * - Waistband with button tabs
 * Fabric: 10–14 oz denim, bull denim, raw selvedge.
 */

import {
  shoulderSlope, necklineCurve, armholeCurve, sleeveCapCurve,
  armholeDepthFromChest, chestEaseDistribution, neckWidthFromCircumference,
  UPPER_EASE, twoPartSleeve, yokeSplit, collarCurve,
} from '../engine/upper-body.js';
import { sampleBezier, fmtInches, edgeAngle, arcLength } from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';
import { flatFelledSeam } from '../lib/seam-techniques.js';

const PLACKET_W = 1.5;  // button placket extension each front panel
const FACING_W  = 3.0;  // front facing width (interfaced)

export default {
  id: 'denim-jacket',
  name: 'Denim Jacket',
  category: 'upper',
  difficulty: 'advanced',
  priceTier: 'tailored',
  measurements: ['chest', 'shoulder', 'neck', 'sleeveLength', 'bicep', 'wrist', 'torsoLength'],
  measurementDefaults: { sleeveLength: 26 },

  options: {
    fit: {
      type: 'select', label: 'Fit',
      values: [
        { value: 'standard',  label: 'Standard (+4″)',  reference: 'classic trucker' },
        { value: 'relaxed',   label: 'Relaxed (+6″)',   reference: 'oversized / layering' },
      ],
      default: 'standard',
    },
    length: {
      type: 'select', label: 'Length',
      values: [
        { value: 'crop', label: 'Cropped, at waist (classic trucker)' },
        { value: 'hip',  label: 'Hip, +4″ below waist' },
      ],
      default: 'crop',
    },
    yokeStyle: {
      type: 'select', label: 'Yoke',
      values: [
        { value: 'pointed', label: 'Pointed yoke (classic Levi\'s)' },
        { value: 'straight', label: 'Straight yoke' },
      ],
      default: 'pointed',
    },
    sleeveStyle: {
      type: 'select', label: 'Sleeve construction',
      values: [
        { value: 'one-piece', label: 'One-piece set-in (American trucker style)', reference: 'flat cap, easy to topstitch, classic workwear' },
        { value: 'two-piece', label: 'Two-piece tailored (European workwear style)', reference: 'shaped cap, better arm hang, heritage denim tradition' },
      ],
      default: 'one-piece',
    },
    chestPocket: {
      type: 'select', label: 'Chest pockets',
      values: [
        { value: 'flap',  label: 'Flap pockets ×2 (classic)' },
        { value: 'patch', label: 'Patch pockets ×2' },
        { value: 'none',  label: 'None' },
      ],
      default: 'flap',
    },
    closure: {
      type: 'select', label: 'Closure',
      values: [
        { value: 'button', label: 'Shank buttons' },
        { value: 'snap',   label: 'Snap buttons' },
      ],
      default: 'button',
    },
    cuff: {
      type: 'select', label: 'Cuff style',
      values: [
        { value: 'tab',   label: 'Button tab cuff (classic)' },
        { value: 'plain', label: 'Plain hem cuff' },
      ],
      default: 'tab',
    },
    sa: {
      type: 'select', label: 'Seam allowance',
      values: [
        { value: 0.625, label: '⅝″ (standard)' },
        { value: 1,     label: '1″ (flat-felled)' },
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

    // Outerwear ease: extra for layering over shirts
    const totalEase = opts.fit === 'relaxed' ? 6 : 4;
    const { front: frontEase, back: backEase } = chestEaseDistribution(totalEase);
    const panelW = (m.chest + totalEase) / 4;

    const halfShoulder = m.shoulder / 2;
    const neckW        = neckWidthFromCircumference(m.neck);
    const shoulderW    = halfShoulder - neckW;
    const slopeDrop    = 1.75;
    const shoulderPtX  = neckW + shoulderW;
    const armholeY     = armholeDepthFromChest(m.chest, opts.fit === 'relaxed' ? 'oversized' : 'standard');
    const armholeDepth = armholeY - slopeDrop;
    const chestDepth   = panelW - shoulderPtX;
    const backChestDepth = m.crossBack ? Math.max(0.5, m.crossBack / 2 - shoulderPtX) : chestDepth;
    const torsoLen     = m.torsoLength + (opts.length === 'hip' ? 4 : 0);
    const slvLength    = m.sleeveLength ?? 26;
    const btnCount     = opts.length === 'hip' ? 6 : 5;

    // Yoke depth: ~33% of armhole depth below shoulder
    const yokeDepthRatio = 0.33;
    const yokeY = armholeDepth * yokeDepthRatio;

    function sampleCurve(cp, steps = 12) {
      return sampleBezier(cp.p0, cp.p1, cp.p2, cp.p3, steps);
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

    const shoulderPtY      = slopeDrop;
    const NECK_DEPTH_FRONT = 3.0;
    const NECK_DEPTH_BACK  = 1.0;

    // Sample bodice curves
    const frontNeckPts = sampleCurve(necklineCurve(neckW, NECK_DEPTH_FRONT, 'crew'));
    const backNeckPts  = sampleCurve(necklineCurve(neckW, NECK_DEPTH_BACK, 'crew'));
    const shoulderPts  = sampleCurve(shoulderSlope(shoulderW, slopeDrop));
    const frontArmCp   = armholeCurve(shoulderW, chestDepth, armholeDepth, false);
    const backArmCp    = armholeCurve(shoulderW, backChestDepth, armholeDepth, true);
    const frontArmPts  = sampleCurve(frontArmCp);
    const backArmPts   = sampleCurve(backArmCp);

    const sideX     = shoulderPtX + chestDepth;
    const backSideX = shoulderPtX + backChestDepth;

    // ── YOKE SPLIT POINTS ──────────────────────────────────────────────
    const frontYokePt = yokeSplit(frontArmCp, yokeY);
    const backYokePt  = yokeSplit(backArmCp, yokeY);
    const frontYokeX  = frontYokePt ? shoulderPtX + frontYokePt.x : sideX;
    const backYokeX   = backYokePt  ? shoulderPtX + backYokePt.x  : backSideX;
    const yokeLineY   = shoulderPtY + yokeY;

    // Pointed yoke dips ~1.5″ at center
    const yokePointDip = opts.yokeStyle === 'pointed' ? 1.5 : 0;

    // ── BACK YOKE (cut on fold at CB) ──────────────────────────────────
    const backYokePoly = [];
    const neckBackRev = [...backNeckPts].reverse();
    for (const p of neckBackRev) backYokePoly.push({ x: neckW - p.x, y: p.y });
    for (let i = 1; i < shoulderPts.length; i++) {
      backYokePoly.push({ x: neckW + shoulderPts[i].x, y: shoulderPts[i].y });
    }
    // Armhole from shoulder to yoke line
    for (let i = 1; i < backArmPts.length; i++) {
      const pt = { x: shoulderPtX + backArmPts[i].x, y: shoulderPtY + backArmPts[i].y };
      if (pt.y > yokeLineY) break;
      backYokePoly.push(pt);
    }
    backYokePoly.push({ x: backYokeX, y: yokeLineY });
    if (yokePointDip > 0) {
      // Pointed yoke: V dips at center back
      backYokePoly.push({ x: panelW * 0.5, y: yokeLineY + yokePointDip });
    }
    backYokePoly.push({ x: 0, y: yokeLineY + yokePointDip });

    // ── BACK PANEL (below yoke, cut on fold at CB) ─────────────────────
    const backPanelPoly = [];
    backPanelPoly.push({ x: 0, y: yokeLineY + yokePointDip });
    if (yokePointDip > 0) {
      backPanelPoly.push({ x: panelW * 0.5, y: yokeLineY + yokePointDip });
    }
    backPanelPoly.push({ x: backYokeX, y: yokeLineY });
    // Continue armhole from yoke line to underarm
    for (let i = 0; i < backArmPts.length; i++) {
      const pt = { x: shoulderPtX + backArmPts[i].x, y: shoulderPtY + backArmPts[i].y };
      if (pt.y <= yokeLineY) continue;
      backPanelPoly.push(pt);
    }
    backPanelPoly.push({ x: backSideX, y: torsoLen });
    backPanelPoly.push({ x: 0, y: torsoLen });

    // ── FRONT YOKE (L panel — R is mirror) ─────────────────────────────
    const frontYokePoly = [];
    const neckFrontRev = [...frontNeckPts].reverse();
    for (const p of neckFrontRev) frontYokePoly.push({ x: neckW - p.x, y: p.y });
    for (let i = 1; i < shoulderPts.length; i++) {
      frontYokePoly.push({ x: neckW + shoulderPts[i].x, y: shoulderPts[i].y });
    }
    for (let i = 1; i < frontArmPts.length; i++) {
      const pt = { x: shoulderPtX + frontArmPts[i].x, y: shoulderPtY + frontArmPts[i].y };
      if (pt.y > yokeLineY) break;
      frontYokePoly.push(pt);
    }
    frontYokePoly.push({ x: frontYokeX, y: yokeLineY });
    frontYokePoly.push({ x: -PLACKET_W, y: yokeLineY });
    frontYokePoly.push({ x: -PLACKET_W, y: NECK_DEPTH_FRONT });

    // ── FRONT PANEL (below yoke, L panel) ──────────────────────────────
    const frontPanelPoly = [];
    frontPanelPoly.push({ x: -PLACKET_W, y: yokeLineY });
    frontPanelPoly.push({ x: frontYokeX, y: yokeLineY });
    // Continue armhole from yoke line to underarm
    for (let i = 0; i < frontArmPts.length; i++) {
      const pt = { x: shoulderPtX + frontArmPts[i].x, y: shoulderPtY + frontArmPts[i].y };
      if (pt.y <= yokeLineY) continue;
      frontPanelPoly.push(pt);
    }
    frontPanelPoly.push({ x: sideX, y: torsoLen });
    frontPanelPoly.push({ x: -PLACKET_W, y: torsoLen });

    // ── SLEEVE ─────────────────────────────────────────────────────────
    const frontArmArc = arcLength(frontArmPts);
    const backArmArc  = arcLength(backArmPts);
    const armholeArc  = frontArmArc + backArmArc;
    const effArmToElbow = m.armToElbow || (slvLength * 0.55);
    const isTwoPiece = opts.sleeveStyle === 'two-piece';

    // Two-piece tailored sleeve (European workwear)
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
        bicepEase: totalEase > 4 ? 0.20 : 0.15,
      });
    }

    // One-piece set-in sleeve (American trucker) — lower, flatter cap
    let onePiecePoly = null;
    let onePieceCapH = 0;
    let onePieceCapArc = 0;
    if (!isTwoPiece) {
      const sleeveEase = totalEase * 0.25;
      const slvW       = m.bicep / 2 + sleeveEase;
      onePieceCapH     = 4.5; // lower cap than dress shirts — easier to flat-fell
      const capCp      = sleeveCapCurve(m.bicep, onePieceCapH, slvW * 2);
      const capPts     = sampleBezier(capCp.p0, capCp.p1, capCp.p2, capCp.p3, 16);
      onePieceCapArc   = arcLength(capPts);
      const wristW     = (m.wrist || m.bicep * 0.55) / 2 + 0.5;
      onePiecePoly     = [];
      for (const p of capPts) onePiecePoly.push({ x: p.x, y: p.y + onePieceCapH });
      // Taper to wrist
      onePiecePoly.push({ x: slvW + wristW, y: onePieceCapH + slvLength });
      onePiecePoly.push({ x: slvW - wristW, y: onePieceCapH + slvLength });
    }

    const capEase = isTwoPiece
      ? sleeveResult.capArc - armholeArc
      : onePieceCapArc - armholeArc;
    const capArcVal = isTwoPiece ? sleeveResult.capArc : onePieceCapArc;
    if (capEase < 0.5 || capEase > 3) {
      console.warn(`[denim-jacket] Sleeve cap ease out of range: ${capEase.toFixed(2)}″ (expected 0.5–3″). Cap: ${capArcVal.toFixed(2)}″, Armhole: ${armholeArc.toFixed(2)}″`);
    }
    const capEaseNote = `Cap: ${fmtInches(capArcVal)}, Armhole: ${fmtInches(armholeArc)}, Ease: ${fmtInches(capEase)}`;

    // ── COLLAR ─────────────────────────────────────────────────────────
    // Half neckline arc: front neck curve + back neck curve
    const frontNeckArc = arcLength(frontNeckPts);
    const backNeckArc  = arcLength(backNeckPts);
    const halfNeckArc  = frontNeckArc + backNeckArc + shoulderW; // shoulder seam contributes too
    const collarResult = collarCurve({
      neckArc: halfNeckArc,
      collarWidth: 3,
      style: 'point',
      standHeight: 1.25,
    });

    // ── CUFF ───────────────────────────────────────────────────────────
    const wristCirc = (m.wrist || m.bicep * 0.55) + 1; // ease
    const cuffH     = opts.cuff === 'tab' ? 3.5 : 2.5;
    const cuffW     = wristCirc / 2 + 1; // half cuff + overlap for button tab

    // ── WAISTBAND ──────────────────────────────────────────────────────
    const waistbandLen = (panelW * 4) * 0.5 + 2; // half body + button tab overlap
    const waistbandH   = 3; // 1.5″ finished

    // ── POCKET DIMENSIONS ──────────────────────────────────────────────
    const pocketW = 5.5;
    const pocketH = 6;
    const flapH   = 2;

    // ── FRONT FACING ───────────────────────────────────────────────────
    const facingH = torsoLen - NECK_DEPTH_FRONT;

    // ── BOUNDING BOXES ─────────────────────────────────────────────────
    const backYokeBB     = bbox(backYokePoly);
    const backPanelBB    = bbox(backPanelPoly);
    const frontYokeBB    = bbox(frontYokePoly);
    const frontPanelBB   = bbox(frontPanelPoly);
    const topSlvBB       = isTwoPiece ? bbox(sleeveResult.topSleeve) : null;
    const underSlvBB     = isTwoPiece ? bbox(sleeveResult.underSleeve) : null;
    const onePieceSlvBB  = !isTwoPiece ? bbox(onePiecePoly) : null;
    const upperCollarBB  = bbox(collarResult.upperCollar);
    const underCollarBB  = bbox(collarResult.underCollar);

    // ── NOTCH MARKS ────────────────────────────────────────────────────
    const shoulderMidX = neckW + shoulderW / 2;
    const shoulderMidY = slopeDrop / 2;

    const yokeNotches = [
      { x: shoulderMidX, y: shoulderMidY, angle: edgeAngle({ x: neckW, y: 0 }, { x: shoulderPtX, y: slopeDrop }) },
    ];

    const frontPanelNotches = [
      { x: sideX, y: armholeY, angle: 0 },
      { x: sideX, y: (yokeLineY + armholeY) / 2, angle: edgeAngle({ x: frontYokeX, y: yokeLineY }, { x: sideX, y: armholeY }) },
    ];

    const backPanelNotches = [
      { x: backSideX, y: armholeY,        angle: 0 },  // double notch = back
      { x: backSideX, y: armholeY + 0.25, angle: 0 },
      { x: backSideX, y: (yokeLineY + armholeY) / 2, angle: edgeAngle({ x: backYokeX, y: yokeLineY }, { x: backSideX, y: armholeY }) },
    ];

    const allButtonMarks = opts.closure === 'button' ? (() => {
      const btnFirst   = NECK_DEPTH_FRONT + 1.0;
      const btnLast    = torsoLen - 2.0;
      const btnSpacing = (btnLast - btnFirst) / (btnCount - 1);
      return Array.from({ length: btnCount }, (_, i) => ({ type: 'button', x: 0, y: btnFirst + i * btnSpacing }));
    })() : [];
    const yokeButtonMarks  = allButtonMarks.filter(m => m.y <= yokeLineY);
    const panelButtonMarks = allButtonMarks.filter(m => m.y >  yokeLineY);

    // ── ASSEMBLE PIECES ────────────────────────────────────────────────
    const pieces = [
      {
        id: 'back-yoke',
        name: 'Back Yoke',
        instruction: `Cut 1 on fold (CB) · ${opts.yokeStyle === 'pointed' ? 'Pointed V at center' : 'Straight across'} · Flat-fell to back panel`,
        type: 'bodice',
        polygon: backYokePoly,
        path: polyToPathStr(backYokePoly),
        width: backYokeBB.maxX - backYokeBB.minX,
        height: backYokeBB.maxY - backYokeBB.minY,
        isBack: true,
        sa, hem: 0,
        notches: yokeNotches,
        dims: [
          { label: fmtInches(panelW) + ' half width', x1: 0, y1: -0.5, x2: panelW, y2: -0.5, type: 'h' },
          { label: fmtInches(yokeLineY + yokePointDip) + ' depth', x: backYokeBB.maxX + 1, y1: 0, y2: yokeLineY + yokePointDip, type: 'v' },
        ],
      },
      {
        id: 'back-panel',
        name: 'Back Panel',
        instruction: 'Cut 1 on fold (CB) · Joins to back yoke at top, side seams at sides',
        type: 'bodice',
        polygon: backPanelPoly,
        path: polyToPathStr(backPanelPoly),
        width: backPanelBB.maxX - backPanelBB.minX,
        height: backPanelBB.maxY - backPanelBB.minY,
        isBack: true,
        sa, hem,
        notches: backPanelNotches,
        dims: [
          { label: fmtInches(panelW) + ' half width', x1: 0, y1: yokeLineY - 0.5, x2: panelW, y2: yokeLineY - 0.5, type: 'h' },
          { label: fmtInches(torsoLen - yokeLineY) + ' length', x: backPanelBB.maxX + 1, y1: yokeLineY, y2: torsoLen, type: 'v' },
        ],
      },
      {
        id: 'front-yoke',
        name: 'Front Yoke (Left)',
        instruction: `Cut 2 (L & R mirror) · ${fmtInches(PLACKET_W)} placket extension at CF · Joins to front panel at yoke seam`,
        type: 'bodice',
        polygon: frontYokePoly,
        path: polyToPathStr(frontYokePoly),
        width: frontYokeBB.maxX - frontYokeBB.minX,
        height: frontYokeBB.maxY - frontYokeBB.minY,
        isBack: false,
        sa, hem: 0,
        marks: yokeButtonMarks,
        notches: yokeNotches,
        dims: [
          { label: fmtInches(panelW + PLACKET_W) + ' width', x1: -PLACKET_W, y1: -0.5, x2: panelW, y2: -0.5, type: 'h' },
          { label: fmtInches(yokeLineY) + ' depth', x: frontYokeBB.maxX + 1, y1: 0, y2: yokeLineY, type: 'v' },
        ],
      },
      {
        id: 'front-panel',
        name: 'Front Panel (Left)',
        instruction: `Cut 2 (L & R mirror) · ${fmtInches(PLACKET_W)} placket extension at CF · Pocket placement below yoke seam`,
        type: 'bodice',
        polygon: frontPanelPoly,
        path: polyToPathStr(frontPanelPoly),
        width: frontPanelBB.maxX - frontPanelBB.minX,
        height: frontPanelBB.maxY - frontPanelBB.minY,
        isBack: false,
        sa, hem,
        marks: panelButtonMarks,
        notches: frontPanelNotches,
        dims: [
          { label: fmtInches(panelW + PLACKET_W) + ' width', x1: -PLACKET_W, y1: yokeLineY - 0.5, x2: panelW, y2: yokeLineY - 0.5, type: 'h' },
          { label: fmtInches(torsoLen - yokeLineY) + ' length', x: frontPanelBB.maxX + 1, y1: yokeLineY, y2: torsoLen, type: 'v' },
        ],
      },
      // Sleeve pieces — conditional on sleeve style
      ...(isTwoPiece ? [
        {
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
          notches: (() => {
            const { crown, backPitchPt, frontPitchPt, tsElbowLeft } = sleeveResult.landmarks;
            return [
              { x: crown.x,             y: crown.y,        angle: -90 }, // crown — aligns to shoulder seam
              { x: frontPitchPt.x,      y: frontPitchPt.y, angle: 180 }, // front pitch (single notch)
              { x: backPitchPt.x,       y: backPitchPt.y,  angle: 0 },   // back pitch (double notch)
              { x: backPitchPt.x + 0.3, y: backPitchPt.y,  angle: 0 },
              { x: tsElbowLeft.x,       y: tsElbowLeft.y,  angle: 180 }, // elbow — front seam alignment
            ];
          })(),
          dims: [
            { label: fmtInches(sleeveResult.topSleeveWidth) + ' top slv width', x1: topSlvBB.minX, y1: sleeveResult.capHeight + 0.4, x2: topSlvBB.maxX, y2: sleeveResult.capHeight + 0.4, type: 'h' },
            { label: fmtInches(slvLength) + ' length', x: topSlvBB.maxX + 1, y1: 0, y2: slvLength + sleeveResult.capHeight, type: 'v' },
            { label: fmtInches(effArmToElbow) + ' to elbow', x: topSlvBB.minX - 1.5, y1: sleeveResult.capHeight, y2: sleeveResult.elbowY, type: 'v', color: '#b8963e' },
          ],
        },
        {
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
            { x: sleeveResult.landmarks.usElbowLeft.x, y: sleeveResult.landmarks.usElbowLeft.y, angle: 0 }, // elbow — front seam alignment
          ],
          dims: [
            { label: fmtInches(sleeveResult.underSleeveWidth) + ' under slv width', x1: underSlvBB.minX, y1: sleeveResult.capHeight + 0.4, x2: underSlvBB.maxX, y2: sleeveResult.capHeight + 0.4, type: 'h' },
            { label: fmtInches(slvLength) + ' length', x: underSlvBB.maxX + 1, y1: 0, y2: slvLength + sleeveResult.capHeight, type: 'v' },
            { label: fmtInches(effArmToElbow) + ' to elbow', x: underSlvBB.minX - 1.5, y1: sleeveResult.capHeight, y2: sleeveResult.elbowY, type: 'v', color: '#b8963e' },
          ],
        },
      ] : [
        {
          id: 'sleeve',
          name: 'Sleeve',
          instruction: `Cut 2 (L & R mirror) · One-piece set-in · Low flat cap for easy flat-fell topstitching · ${capEaseNote}`,
          type: 'sleeve',
          polygon: onePiecePoly,
          path: polyToPathStr(onePiecePoly),
          width: onePieceSlvBB.maxX - onePieceSlvBB.minX,
          height: onePieceSlvBB.maxY - onePieceSlvBB.minY,
          capHeight: onePieceCapH,
          sleeveLength: slvLength,
          sleeveWidth: onePieceSlvBB.maxX - onePieceSlvBB.minX,
          sa, hem,
          notches: (() => {
            const slvW = onePieceSlvBB.maxX - onePieceSlvBB.minX;
            const bDx = slvW / 2, bDy = onePieceCapH;
            const bLen = Math.sqrt(bDx * bDx + bDy * bDy);
            const bStepX = 0.25 * bDx / bLen, bStepY = 0.25 * bDy / bLen;
            const backAngle = edgeAngle({ x: slvW / 2, y: 0 }, { x: slvW, y: onePieceCapH });
            return [
              { x: slvW / 2,           y: 0,                         angle: -90 },             // crown → shoulder
              { x: slvW * 0.25,        y: onePieceCapH * 0.5,        angle: edgeAngle({ x: 0, y: onePieceCapH }, { x: slvW / 2, y: 0 }) },  // front (single)
              { x: slvW * 0.75,        y: onePieceCapH * 0.5,        angle: backAngle },        // back (double)
              { x: slvW * 0.75 + bStepX, y: onePieceCapH * 0.5 + bStepY, angle: backAngle },
            ];
          })(),
          dims: [
            { label: fmtInches(onePieceSlvBB.maxX - onePieceSlvBB.minX) + ' underarm width', x1: onePieceSlvBB.minX, y1: onePieceCapH + 0.4, x2: onePieceSlvBB.maxX, y2: onePieceCapH + 0.4, type: 'h' },
            { label: fmtInches(slvLength) + ' length', x: onePieceSlvBB.maxX + 1, y1: onePieceCapH, y2: onePieceCapH + slvLength, type: 'v' },
            { label: fmtInches(effArmToElbow) + ' to elbow', x: onePieceSlvBB.minX - 1.5, y1: onePieceCapH, y2: onePieceCapH + effArmToElbow, type: 'v', color: '#b8963e' },
          ],
        },
      ]),
      {
        id: 'upper-collar',
        name: 'Upper Collar',
        instruction: `Cut 1 on fold (CB) · Interface · Point collar tips shaped to ${fmtInches(0.75)} extension · Outer visible collar`,
        type: 'bodice',
        polygon: collarResult.upperCollar,
        path: polyToPathStr(collarResult.upperCollar),
        width: upperCollarBB.maxX - upperCollarBB.minX,
        height: upperCollarBB.maxY - upperCollarBB.minY,
        isBack: false,
        sa, hem: 0,
        dims: [
          { label: fmtInches(collarResult.standLength) + ' half length', x1: 0, y1: -0.5, x2: collarResult.standLength, y2: -0.5, type: 'h' },
          { label: '3″ width', x: upperCollarBB.maxX + 1, y1: upperCollarBB.minY, y2: upperCollarBB.maxY, type: 'v' },
        ],
      },
      {
        id: 'under-collar',
        name: 'Under Collar',
        instruction: 'Cut 1 on fold (CB) · Interface with 2 layers · 2% smaller than upper collar so seam rolls under',
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
        id: 'cuff',
        name: opts.cuff === 'tab' ? 'Button Tab Cuff' : 'Cuff',
        instruction: `Cut 4 (2 outer + 2 facing) · ${fmtInches(cuffW)} × ${fmtInches(cuffH)} · ${opts.cuff === 'tab' ? 'Button tab at back seam' : 'Plain hem'}`,
        type: 'rectangle',
        dimensions: { length: cuffW, width: cuffH },
        sa,
      },
      {
        id: 'waistband',
        name: 'Waistband',
        instruction: `Cut 2 (L & R, meet at CF with overlap) · ${fmtInches(waistbandLen)} × ${fmtInches(waistbandH)} · Button tab at CF ends`,
        type: 'rectangle',
        dimensions: { length: waistbandLen, width: waistbandH },
        sa,
      },
      {
        id: 'front-facing',
        name: 'Front Facing',
        instruction: `Cut 2 (L & R) · Interface · ${fmtInches(FACING_W)} wide × ${fmtInches(facingH)} long`,
        type: 'pocket',
        dimensions: { width: FACING_W, height: facingH },
        sa,
      },
    ];

    // Chest pockets
    if (opts.chestPocket === 'flap') {
      pieces.push({
        id: 'chest-pocket',
        name: 'Chest Flap Pocket',
        instruction: `Cut 4 (2 pocket bags + 2 flaps - mirror L & R) · ${fmtInches(pocketW)} × ${fmtInches(pocketH)} pocket · ${fmtInches(pocketW)} × ${fmtInches(flapH)} flap · Position on front panel just below yoke seam`,
        type: 'pocket',
        dimensions: { width: pocketW, height: pocketH },
        sa,
      });
      pieces.push({
        id: 'pocket-flap',
        name: 'Pocket Flap',
        instruction: `Cut 4 (2 outer + 2 facing) · ${fmtInches(pocketW)} × ${fmtInches(flapH)} · Interface outer · Button snap or shank at center`,
        type: 'pocket',
        dimensions: { width: pocketW, height: flapH },
        sa,
      });
    } else if (opts.chestPocket === 'patch') {
      pieces.push({
        id: 'chest-pocket',
        name: 'Chest Patch Pocket',
        instruction: `Cut 2 (mirror L & R) · ${fmtInches(pocketW)} × ${fmtInches(pocketH)} · Top edge: 1″ hem (fold under ½″ twice, {topstitch}) · {topstitch} sides + bottom (3 sides)`,
        type: 'pocket',
        dimensions: { width: pocketW, height: pocketH },
        sa, hem: 1.0, hemEdge: 'top',
      });
    }

    return pieces;
  },

  materials(m, opts) {
    const btnCount = opts.length === 'hip' ? 6 : 5;
    const notions = [
      { ref: 'interfacing-med', quantity: '1 yard (collar + front facings + cuffs)' },
    ];

    if (opts.closure === 'button') {
      notions.push({ name: 'Heavy-duty shank buttons', quantity: `${btnCount + 4}`, notes: `${btnCount} front + 2 cuff tabs + 2 pocket flaps + 1 spare (⅞″ tack or shank)` });
    } else {
      notions.push({ name: 'Snap buttons', quantity: `${btnCount + 4}`, notes: `${btnCount} front + 2 cuff + 2 pocket (size 24 heavy duty)` });
    }

    notions.push({ name: 'Rivets (optional)', quantity: '6–8', notes: 'Copper rivets at pocket corners and stress points (traditional denim detail)' });

    return buildMaterialsSpec({
      fabrics: ['denim-12oz', 'bull-denim', 'raw-selvedge-denim'],
      notions,
      thread: 'poly-heavy',
      needle: 'denim-100',
      stitches: ['straight-3', 'straight-3.5', 'bartack', 'topstitch'],
      notes: [
        '{topstitch} all seams at 3.5mm with contrasting gold thread for classic denim look',
        '{flat-fell} seams on yoke, shoulder, and side seams: sew, {press} to one side, trim lower SA to 3mm, fold upper SA over, {topstitch}',
        'Pre-wash denim to preshrink and soften - raw denim can shrink 3–5% on first wash',
        'Interface collar with 2 layers of medium woven interfacing for structure',
        'Under collar is cut 2% smaller than upper collar - seam rolls to underside when pressed',
        opts.sleeveStyle === 'two-piece'
          ? 'Two-part sleeve: sew front seam first, then back seam. Ease top sleeve cap into armhole'
          : 'One-piece sleeve: low flat cap makes flat-felling the armhole seam straightforward - topstitch from the outside',
        opts.cuff === 'tab' ? 'Button tab cuff: sew cuff facing to outer cuff {RST} on 3 sides, trim SA to 3mm, {clip} corners diagonally, turn, {press}. Sew to sleeve opening. Add button and buttonhole at tab overlap' : '',
        'Bar tack all pocket corners, waistband tab ends, and cuff tab corners',
        'For raw selvedge: do NOT pre-wash - wear and fade naturally, expect 5% shrinkage',
      ].filter(Boolean),
    });
  },

  instructions(m, opts) {
    const steps = [];
    let n = 1;
    const btnCount = opts.length === 'hip' ? 6 : 5;

    if (opts.chestPocket === 'flap') {
      steps.push({
        step: n++, title: 'Prepare chest flap pockets',
        detail: 'Sew pocket flap outer to facing {RST} on three sides, leaving top open. Trim SA to 3mm, {clip} corners diagonally. Turn RS out, push corners with a {point turner}. {press}. {topstitch} at 3.5mm. Fold pocket bag top under ⅝″, {press}. Position pocket bag on front panel just below yoke seam line. {topstitch} sides and bottom. Sew flap above pocket opening, flip down, {topstitch} hinge.',
      });
    } else if (opts.chestPocket === 'patch') {
      steps.push({
        step: n++, title: 'Prepare chest patch pockets',
        detail: 'Fold top edge under 1″ twice, {topstitch}. {press} sides and bottom under ⅝″. Position on front panel below yoke. {topstitch} 3 sides at 3.5mm. Bar tack all corners.',
      });
    }

    steps.push({
      step: n++, title: 'Prepare collar pieces',
      detail: 'Interface upper collar with 1 layer, under collar with 2 layers of medium interfacing. Sew upper to under collar {RST} along outer (fall) edge and both CF ends. Trim SA to 3mm, {clip} corners diagonally at collar points. Turn RS out, use a {point turner} to push collar tips out cleanly. {press}. {topstitch} outer edge at 3.5mm. Leave neckline edge raw - will be sewn into neckline seam.',
    });

    steps.push({
      step: n++, title: 'Prepare front facings and plackets',
      detail: `Interface facing strips. {press} placket extension ${fmtInches(PLACKET_W)} to WS at CF fold line. Sew facing to placket edge {RST}. {press}, {topstitch}.`,
    });

    steps.push({
      step: n++, title: 'Sew front yoke to front panel (flat-fell)',
      detail: (opts.yokeStyle === 'pointed' ? 'Match the pointed V at center precisely — pin from the center point outward. ' : '') + flatFelledSeam({
        seam: 'front yoke seam',
        sa: '⅝″',
        pressDir: 'yoke',
        trimSide: 'front panel',
        foldSide: 'yoke',
        trimTo: '3mm (⅛″)',
        row1: '⅛″',
        row2: '¼″ (3.5mm)',
        thread: 'gold',
        extraTip: 'The yoke seam runs horizontally across the chest — use a ruler or seam guide to keep your topstitch rows perfectly parallel to the horizontal seam.',
      }),
    });

    steps.push({
      step: n++, title: 'Sew back yoke to back panel (flat-fell)',
      detail: (opts.yokeStyle === 'pointed' ? 'Carefully match the pointed V at center back — pin from the center point outward on each side so the V stays symmetrical. ' : 'Keep the seam straight and level across the back. ') + flatFelledSeam({
        seam: 'back yoke seam',
        sa: '⅝″',
        pressDir: 'yoke',
        trimSide: 'back panel',
        foldSide: 'yoke',
        trimTo: '3mm (⅛″)',
        row1: '⅛″',
        row2: '¼″ (3.5mm)',
        thread: 'gold',
        extraTip: 'The back yoke is a focal point of the jacket — take time to press the fell completely flat before stitching. Uneven topstitch rows here are very visible on the finished garment.',
      }),
    });

    steps.push({
      step: n++, title: 'Sew shoulder seams (flat-fell)',
      detail: 'Join front yoke to back yoke at shoulders {RST}.\n\n' + flatFelledSeam({
        seam: 'shoulder seam',
        sa: '⅝″',
        pressDir: 'back',
        trimSide: 'front',
        foldSide: 'back',
        trimTo: '3mm (⅛″)',
        row1: '⅛″',
        row2: '¼″ (3.5mm)',
        thread: 'gold',
        extraTip: 'Shoulder seams are short and easy to fell — a good seam to practice the technique before moving on to the longer side seams.',
      }),
    });

    steps.push({
      step: n++, title: 'Attach collar to neckline',
      detail: 'Pin collar to neckline {RST}, matching CB of collar to CB of jacket. Under collar faces jacket RS. Sew around neckline. {clip} curve. Fold upper collar neckline SA under, pin over seam from RS. {topstitch} from RS through all layers at 3.5mm.',
    });

    if (opts.sleeveStyle === 'two-piece') {
      steps.push({
        step: n++, title: 'Sew two-part sleeves',
        detail: 'For each sleeve: sew top sleeve to under sleeve along the front (inner) seam {RST}. {press} open. Sew back (outer) seam {RST}. {press} open. You now have a cylinder with the cap shaped for the armhole.',
      });
      steps.push({
        step: n++, title: 'Set sleeves into armholes',
        detail: 'Pin top sleeve cap to armhole, matching back seam to back pitch point and front seam to front pitch point. Ease cap fullness evenly. Sew. {topstitch} SA toward sleeve at 6mm. Second row of {topstitch} at 3.5mm from first.',
      });
    } else {
      steps.push({
        step: n++, title: 'Set sleeves into armholes (flat-fell)',
        detail: 'Pin sleeve cap to armhole {RST}, matching the center cap notch to the shoulder seam and the quarter notches to the front and back pitch points. The low cap has minimal ease — distribute any fullness evenly between the notches rather than in one spot.\n\n' + flatFelledSeam({
          seam: 'armhole seam',
          sa: '⅝″',
          pressDir: 'body',
          trimSide: 'sleeve',
          foldSide: 'body',
          trimTo: '3mm (⅛″)',
          row1: '⅛″',
          row2: '¼″ (3.5mm)',
          thread: 'gold',
          extraTip: 'The armhole is a curve. Before folding, {clip} the trimmed sleeve SA every ½″ around the curve so the fell lies flat without pulling. Two rows of gold topstitching here is the classic denim jacket detail.',
        }),
      });
    }

    steps.push({
      step: n++, title: 'Sew side seams (flat-fell)',
      detail: (opts.sleeveStyle === 'two-piece'
        ? 'Sew front panel to back panel at side seams from hem to underarm {RST}.\n\n'
        : 'Sew front panel to back panel at side seams {RST}, continuing through the underarm to the sleeve hem in one continuous seam.\n\n'
      ) + flatFelledSeam({
        seam: opts.sleeveStyle === 'two-piece' ? 'side seam' : 'side seam (continuing through underarm to sleeve hem)',
        sa: '⅝″',
        pressDir: 'back',
        trimSide: 'front',
        foldSide: 'back',
        trimTo: '3mm (⅛″)',
        row1: '⅛″',
        row2: '¼″ (3.5mm)',
        thread: 'gold',
        extraTip: opts.sleeveStyle === 'two-piece'
          ? 'The sleeve underarm seam was already sewn, so this is a straight side seam — one of the easiest fells on the jacket.'
          : 'At the underarm pivot, {clip} the trimmed SA nearly to the stitching so the fell turns the corner. Work the long seam in sections: fell the body portion, then fell the sleeve portion.',
      }),
    });

    steps.push({
      step: n++, title: 'Attach cuffs',
      detail: opts.cuff === 'tab'
        ? 'Sew cuff outer to facing {RST} on 3 sides, leaving top open. Trim SA to 3mm, {clip} corners diagonally. Turn RS out, push corners with {point turner}. {press}. Sew to sleeve opening. Fold back seam allowance creates button tab overlap. Add buttonhole to tab, sew button.'
        : 'Fold cuff in half lengthwise {WST}. Sew to sleeve opening. {press}. {topstitch} at 3.5mm.',
    });

    steps.push({
      step: n++, title: 'Attach waistband',
      detail: 'Sew waistband outer to facing {RST} along bottom and both CF tab ends. Trim SA to 3mm, {clip} corners diagonally at tab ends. Turn RS out, push corners. {press}. Sew top (open) edge to jacket body at hem, matching CF overlap tabs. {topstitch} top and bottom edges. Button tab overlaps at CF.',
    });

    steps.push({
      step: n++, title: opts.closure === 'button' ? 'Buttonholes and buttons' : 'Install snaps',
      detail: opts.closure === 'button'
        ? `Mark ${btnCount} buttonhole positions on right placket (vertical buttonholes): first at neckline, last at waistband, evenly spaced. Test on denim scrap. Sew buttonholes. Cut open. Sew shank buttons to left placket. Add buttons to cuff tabs and pocket flaps.`
        : `Mark ${btnCount} snap positions on placket: first at neckline, last at waistband, evenly spaced. Install male halves on right placket, female on left. Use snap setter with backing plate - denim requires firm pressure. Add snaps to cuff tabs and pocket flaps.`,
    });

    steps.push({
      step: n++, title: 'Finish',
      detail: '{press} with steam on cotton setting. Add rivets at pocket corners and stress points if desired (use rivet setter tool). Final {topstitch} check: all seams should show clean parallel rows. Try on and check collar roll, sleeve hang, and yoke alignment.',
    });

    return steps;
  },

  variants: [
    { id: 'lightweight-denim-jacket', name: 'Lightweight Denim Jacket', defaults: { fit: 'relaxed', length: 'hip' } },
  ],
};
