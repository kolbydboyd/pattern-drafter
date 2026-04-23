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
  peakLapelCurve, notchedLapelCurve, shawlLapelFront, shawlCollarCurve, collarCurve, twoPartSleeve,
} from '../engine/upper-body.js';
import { sampleBezier, fmtInches, edgeAngle, arcLength, offsetPolygon } from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

// ── Constants ────────────────────────────────────────────────────────────────
const SINGLE_PLACKET_W = 1.5;   // single-breasted button placket extension
const DOUBLE_PLACKET_W = 3.5;   // double-breasted overlap extension
const FACING_W         = 3.5;   // front facing width at hem (interfaced; wider for unlined)
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
    const NECK_DEPTH_BACK  = 1.0;   // increased from 0.75 — more comfortable for layering

    const frontNeckPts = sampleCurve(necklineCurve(neckW, NECK_DEPTH_FRONT, 'crew'));
    const backNeckPts  = sampleCurve(necklineCurve(neckW, NECK_DEPTH_BACK, 'crew'));
    const shoulderPts  = sampleCurve(shoulderSlope(shoulderW, slopeDrop));
    const frontArmPts  = sampleCurve(armholeCurve(shoulderW, chestDepth, armholeDepth, false));
    const backArmPts   = sampleCurve(armholeCurve(shoulderW, backChestDepth, armholeDepth, true));

    // ── LAPEL GEOMETRY ────────────────────────────────────────────────────
    // Lapel is cut AS PART OF the front panel (traditional tailoring).
    // Computed here so the panel can incorporate it directly.
    const COLLAR_STAND = 1.25;
    const btnSpacing = isDouble ? 4.5 : 5;
    const btnCount   = isDouble ? 4 : 2;
    // Top button Y: at underarm level for DB (mid-chest placement), below neckline for SB
    const topBtnY     = isDouble ? armholeY : NECK_DEPTH_FRONT + 3;
    const breakPointY = topBtnY - 0.5; // break point sits just above top button

    // Lapel width: wider for peak/double-breasted, narrower for notched
    const lapelW = opts.collar === 'peak'
      ? (isDouble ? 4.5 : 3.5)
      : opts.collar === 'notched'
        ? 3
        : 3.5; // shawl

    const lapelParams = {
      neckDepthFront: NECK_DEPTH_FRONT,
      breakPointY,
      lapelWidth: lapelW,
      collarStand: COLLAR_STAND,
      gorgeHeightFrac: 0.45,  // gorge at 45% of neckline depth — collar sits close to neck
    };
    const lapelResult =
      opts.collar === 'peak'    ? peakLapelCurve(lapelParams) :
      opts.collar === 'notched' ? notchedLapelCurve(lapelParams) :
                                  shawlLapelFront({ neckDepthFront: NECK_DEPTH_FRONT, breakPointY, lapelWidth: lapelW, neckW });

    // Panel-side "stop" for the neckline: peak/notched use the gorge point;
    // shawl uses the shoulder-neck junction (no gorge, no notch).
    // gorgePoint frame matches the panel: origin at CF neckline point, x+ toward body.
    const neckStop = opts.collar === 'shawl' ? lapelResult.shoulderNeck : lapelResult.gorgePoint;

    // ── FRONT PANEL (left — right is mirror) ─────────────────────────────
    // Clockwise winding, starting at shoulder-neck:
    //   shoulder-neck → shoulder → armhole → side → hem → up placket →
    //   across to break point → lapel outline (break → outer → peak/notch → gorge) →
    //   partial neckline back to shoulder-neck.
    const sideX = shoulderPtX + chestDepth;
    const frontPoly = [];

    // Start at shoulder-neck junction. First shoulder point is the neck end.
    frontPoly.push({ x: neckW, y: 0 });
    // Shoulder seam → shoulder point
    for (let i = 1; i < shoulderPts.length; i++) {
      frontPoly.push({ ...shoulderPts[i], x: neckW + shoulderPts[i].x });
    }
    // Armhole → underarm
    for (let i = 1; i < frontArmPts.length; i++) {
      frontPoly.push({ ...frontArmPts[i], x: shoulderPtX + frontArmPts[i].x, y: shoulderPtY + frontArmPts[i].y });
    }
    // Side seam → hem
    frontPoly.push({ x: sideX, y: torsoLen });
    // Hem across to CF placket
    frontPoly.push({ x: -PLACKET_W, y: torsoLen });
    // Up the placket to the break point
    frontPoly.push({ x: -PLACKET_W, y: breakPointY });
    // Horizontal step from placket edge to break point at CF (lapel flap bottom edge)
    frontPoly.push({ x: 0, y: breakPointY });
    // Lapel outline: breakPoint → outer → (peakTip / notchInner) → neckStop
    // For peak: [breakPoint, outerMid, upperOuter, peakTip, gorgePoint]
    // For notched: [breakPoint, lowerOuter, outerMid, upperOuter, notchInner, gorgePoint, notchOuter]
    // For shawl: [breakPoint, outerMid, upperOuter, ..., shoulderNeck]
    // Start from index 1 (we already pushed breakPoint). Stop at neckStop (gorgePoint / shoulderNeck).
    for (let i = 1; i < lapelResult.lapelPoints.length; i++) {
      const p = lapelResult.lapelPoints[i];
      frontPoly.push({ x: p.x, y: p.y });
      // Stop after pushing the neckStop — this is gorgePoint for peak/notched,
      // shoulderNeck for shawl. Remaining points (e.g. notchOuter) belong to
      // the under collar gorge, not the panel.
      if (p.x === neckStop.x && p.y === neckStop.y) break;
    }
    // Seam from gorge to shoulder-neck junction.
    // gorgePoint does not sit on the natural neckline bezier, so a straight diagonal
    // seam is correct here — standard practice in tailored jacket construction.
    // The collar pattern is drafted to this same straight seam length.
    if (opts.collar !== 'shawl') {
      frontPoly.push({ x: neckW, y: 0 });
    }

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

    // ── TWO-PIECE SLEEVE ──────────────────────────────────────────────────
    // Top sleeve (outer arm) + under sleeve (inner arm) for tailored arm hang.
    // Knit fabric: lower cap height, less ease, slight elbow bend.
    const effArmToElbow = m.armToElbow || (slvLength * 0.45);
    const frontArmArc = arcLength(frontArmPts);
    const backArmArc  = arcLength(backArmPts);
    const armholeArc  = frontArmArc + backArmArc;

    const sleeveResult = twoPartSleeve({
      bicep: m.bicep,
      sleeveLength: slvLength,
      armToElbow: effArmToElbow,
      wrist: m.wrist || m.bicep * 0.55,
      armholeArc,
      capEaseTarget: 1.0,    // knit fabric eases readily — less cap ease
      sleeveBend: 2,          // jersey stretch eliminates structural elbow shaping (denim uses 10°, woven 6°)
      bicepEase: 0.15,
      capHeightRatio: 0.40,   // lower cap for knit
      cuffEase: 0.25,         // jersey stretches; 40% default produces an unacceptably wide opening
    });
    const topSlvBB   = bbox(sleeveResult.topSleeve);
    const underSlvBB = bbox(sleeveResult.underSleeve);
    const capEaseVal  = sleeveResult.capArc - armholeArc;
    if (capEaseVal < 0.5 || capEaseVal > 3) {
      console.warn(`[athletic-formal-jacket] Sleeve cap ease out of range: ${capEaseVal.toFixed(2)}″ (expected 0.5–3″). Cap: ${sleeveResult.capArc.toFixed(2)}″, Armhole: ${armholeArc.toFixed(2)}″`);
    }
    const capEaseNote = `Cap: ${fmtInches(sleeveResult.capArc)}, Armhole: ${fmtInches(armholeArc)}, Ease: ${fmtInches(capEaseVal)} (${sleeveResult.iterations} iter)`;

    // ── NOTCH MARKS ─────────────────────────────────────────────────────
    const shoulderMidX = neckW + shoulderW / 2;
    const shoulderMidY = slopeDrop / 2;

    const frontNotches = [
      { x: shoulderMidX, y: shoulderMidY, angle: edgeAngle({ x: neckW, y: 0 }, { x: shoulderPtX, y: slopeDrop }) },
      { x: sideX, y: armholeY, angle: 0 },
      { x: shoulderPtX, y: slopeDrop + armholeDepth * 0.25, angle: edgeAngle({ x: shoulderPtX, y: slopeDrop }, { x: sideX, y: armholeY }) },
      { x: sideX, y: slopeDrop + armholeDepth * 0.75, angle: edgeAngle({ x: shoulderPtX, y: slopeDrop }, { x: sideX, y: armholeY }) },
      // Lapel/collar assembly notches — match corresponding points on facing and under collar.
      { x: -PLACKET_W, y: breakPointY, angle: 180 },   // break point — matches facing break point
      ...(opts.collar === 'shawl'
        ? [{ x: neckW, y: 0, angle: 90 }]              // shawl: shoulder-neck match (also matches back collar)
        : [{ x: neckStop.x, y: neckStop.y, angle: 90 }] // peak/notched: gorge — matches under collar CF end
      ),
    ];

    const backNotches = [
      { x: neckW, y: 0, angle: 90 },  // shoulder-neck junction — matches collar shoulder notch
      { x: shoulderMidX, y: shoulderMidY, angle: edgeAngle({ x: neckW, y: 0 }, { x: shoulderPtX, y: slopeDrop }) },
      { x: backSideX, y: armholeY, angle: 0 },
      { x: shoulderPtX, y: slopeDrop + armholeDepth * 0.25, angle: edgeAngle({ x: shoulderPtX, y: slopeDrop }, { x: backSideX, y: armholeY }) },
      { x: backSideX, y: slopeDrop + armholeDepth * 0.75, angle: edgeAngle({ x: shoulderPtX, y: slopeDrop }, { x: backSideX, y: armholeY }) },
    ];
    // Add vent notch marks to back panels
    if (opts.vent === 'center' && ventLen > 0) {
      backNotches.push({ x: 0, y: torsoLen - ventLen, angle: 180 }); // vent top mark
    }

    const frontBB  = bbox(frontPoly);
    const backBB   = bbox(backPoly);

    const buttonMarks = isDouble
      ? [
          { type: 'button', x:  0,   y: topBtnY },
          { type: 'button', x: -3.0, y: topBtnY },
          { type: 'button', x:  0,   y: topBtnY + 4.5 },
          { type: 'button', x: -3.0, y: topBtnY + 4.5 },
        ]
      : [
          { type: 'button', x: 0, y: topBtnY },
          { type: 'button', x: 0, y: topBtnY + btnSpacing },
        ];

    // ── PIECES ───────────────────────────────────────────────────────────
    const pieces = [
      {
        id: 'bodice-front',
        name: isDouble ? 'Front Panel (Left)' : 'Front Panel (Left)',
        instruction: `Cut 2 (L & R mirror) · ${fmtInches(PLACKET_W)} ${isDouble ? 'double-breasted overlap' : 'placket'} extension at CF · ${isDouble ? '4×2 button arrangement' : '2-button single-breasted'}`,
        type: 'bodice',
        isCutOnFold: false,
        polygon: frontPoly,
        path: polyToPathStr(frontPoly),
        width: frontBB.maxX - frontBB.minX,
        height: frontBB.maxY - frontBB.minY,
        isBack: false,
        sa, hem,
        marks: buttonMarks,
        notches: frontNotches,
        // Roll line: break point (CF placket edge) → gorge (peak/notched) or shoulder-neck (shawl).
        // The lapel folds back along this line when worn.
        rollLine: {
          from: { x: 0, y: breakPointY },
          to:   { x: neckStop.x, y: neckStop.y },
          label: 'roll line',
        },
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
        isCutOnFold: false,
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
        id: 'top-sleeve',
        name: 'Top Sleeve (Outer)',
        instruction: `Cut 2 (mirror L & R) · Outer arm · Carries the full cap crown · ${capEaseNote}`,
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
          { label: fmtInches(sleeveResult.topSleeveWidth) + ' top width', x1: topSlvBB.minX, y1: sleeveResult.capHeight + 0.4, x2: topSlvBB.maxX, y2: sleeveResult.capHeight + 0.4, type: 'h' },
          { label: fmtInches(slvLength) + ' length', x: topSlvBB.maxX + 1, y1: 0, y2: slvLength + sleeveResult.capHeight, type: 'v' },
          { label: fmtInches(effArmToElbow) + ' to elbow', x: topSlvBB.minX - 1.5, y1: sleeveResult.capHeight, y2: sleeveResult.elbowY, type: 'v', color: '#b8963e' },
        ],
      },
      {
        id: 'under-sleeve',
        name: 'Under Sleeve (Inner)',
        instruction: 'Cut 2 (mirror L & R) · Inner arm · Joins top sleeve at front and back seams',
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
          { label: fmtInches(sleeveResult.underSleeveWidth) + ' under width', x1: underSlvBB.minX, y1: sleeveResult.capHeight + 0.4, x2: underSlvBB.maxX, y2: sleeveResult.capHeight + 0.4, type: 'h' },
          { label: fmtInches(slvLength) + ' length', x: underSlvBB.maxX + 1, y1: 0, y2: slvLength + sleeveResult.capHeight, type: 'v' },
          { label: fmtInches(effArmToElbow) + ' to elbow', x: underSlvBB.minX - 1.5, y1: sleeveResult.capHeight, y2: sleeveResult.elbowY, type: 'v', color: '#b8963e' },
        ],
      },
    ];

    // ── COLLAR PIECES ────────────────────────────────────────────────────
    // Upper/under collar for peak + notched. Narrow back-neck collar for shawl.
    if (opts.collar === 'peak' || opts.collar === 'notched') {
      // Collar arc = back neckline arc + straight gorge-to-shoulder seam on front panel.
      const frontGorgeLen = Math.sqrt((neckW - neckStop.x) ** 2 + neckStop.y ** 2);
      const halfNeckArc = arcLength(backNeckPts) + frontGorgeLen;

      const { upperCollar, underCollar, standLength } = collarCurve({
        neckArc: halfNeckArc,
        collarWidth: opts.collar === 'peak' ? 4.0 : 3,
        style: 'point',
        standHeight: COLLAR_STAND,
        underShrink: 0.02,
      });

      const collarW = opts.collar === 'peak' ? 4.0 : 3;
      const ucCFEnd = upperCollar[upperCollar.length - 2];
      const ucCBMid = { x: 0, y: collarW / 2 };
      const lcCFEnd = underCollar[underCollar.length - 2];
      const lcCBMid = { x: 0, y: (collarW / 1.02) / 2 };
      // Shoulder-seam position on collar: where back neckline seam meets front gorge seam.
      const backNeckLen = arcLength(backNeckPts);
      const collarShoulderX = standLength * (backNeckLen / halfNeckArc);

      pieces.push({
        id: 'upper-collar',
        name: 'Upper Collar',
        instruction: `Cut 1 on fold (CB) · Interface with knit fusible · Attaches at the gorge between collar and ${opts.collar === 'peak' ? 'peak' : 'notched'} lapel`,
        type: 'bodice',
        polygon: upperCollar,
        path: polyToPathStr(upperCollar),
        width: standLength,
        height: collarW,
        isBack: false,
        sa,
        notches: [
          { x: ucCFEnd.x,       y: ucCFEnd.y, angle: 0   }, // CF end — matches panel gorge notch
          { x: ucCBMid.x,       y: ucCBMid.y, angle: 180 }, // CB fold — alignment mark
          { x: collarShoulderX, y: ucCFEnd.y, angle: 90  }, // shoulder seam — matches back panel shoulder-neck
        ],
      });

      pieces.push({
        id: 'under-collar',
        name: 'Under Collar',
        instruction: 'Cut 2 (mirror at CB) · Cut on straight grain (NOT bias — jersey needs directional stretch, not bias drape) · 2% smaller than upper collar for seam roll · Interface with knit fusible',
        type: 'bodice',
        isCutOnFold: false,
        polygon: underCollar,
        path: polyToPathStr(underCollar),
        width: standLength / 1.02,
        height: collarW / 1.02,
        isBack: false,
        sa,
        notches: [
          { x: lcCFEnd.x,                 y: lcCFEnd.y, angle: 0   }, // CF end — matches panel gorge notch
          { x: lcCBMid.x,                 y: lcCBMid.y, angle: 180 }, // CB seam — alignment mark
          { x: collarShoulderX / 1.02,    y: lcCFEnd.y, angle: 90  }, // shoulder seam — matches back panel shoulder-neck
        ],
      });
    } else {
      // Shawl: narrow back-neck collar that sews shoulder-to-shoulder across
      // the back. The front lapel is part of the front panel; no front collar.
      const halfBackArc = arcLength(backNeckPts);
      const SHAWL_COLLAR_W = 3.5;
      const { shawlPoly } = shawlCollarCurve({
        backNeckArc: halfBackArc,
        collarWidth: SHAWL_COLLAR_W,
        collarStand: COLLAR_STAND,
      });

      pieces.push({
        id: 'shawl-back-collar',
        name: 'Shawl Back Collar',
        instruction: 'Cut 1 on fold (CB) · Interface with knit fusible · Sews shoulder-to-shoulder across the back neck · Front lapel is cut as part of the front panel',
        type: 'bodice',
        polygon: shawlPoly,
        path: polyToPathStr(shawlPoly),
        width: halfBackArc,
        height: SHAWL_COLLAR_W,
        isBack: true,
        sa,
      });
    }

    // ── FRONT FACING (shared across peak / notched / shawl) ─────────────
    // A true facing: mirrors the lapel area of the front panel so its pretty
    // side shows when the lapel folds back along the roll line, then tapers
    // into a strip down CF to the hem.
    //
    // Panel stitch line along the lapel is the EXACT same points used on the
    // front panel so the facing sews cleanly to the panel's lapel edge.
    {
      const FACING_TOP_W = 2.5;   // wider for unlined: more support at neckline
      const topEnd = neckStop; // gorgePoint (peak/notched) or shoulderNeck (shawl)

      // Lapel outline reused verbatim from the panel build, break → topEnd.
      const lapelForFacing = [];
      for (let i = 0; i < lapelResult.lapelPoints.length; i++) {
        const p = lapelResult.lapelPoints[i];
        lapelForFacing.push({ x: p.x, y: p.y });
        if (p.x === topEnd.x && p.y === topEnd.y) break;
      }

      const facingPoly = [...lapelForFacing];
      // For shawl, include the neckline curve so the facing inner edge follows
      // the original (now-hidden) neckline between shoulder-neck and CF.
      const neckForFacing = opts.collar === 'shawl'
        ? frontNeckPts
            .map(p => ({ x: neckW - p.x, y: p.y }))
            .filter(p => p.x < neckW - 0.01)
            .sort((a, b) => b.x - a.x) // shoulder-side → CF-side (descending x)
        : [];
      for (const p of neckForFacing) facingPoly.push({ x: p.x, y: p.y });
      // Shawl: neckForFacing ends near CF, so step right to facing width before tapering.
      // Peak/notched: gorgePoint is already inset from CF — go straight to hem width.
      if (opts.collar === 'shawl') {
        facingPoly.push({ x: FACING_TOP_W, y: NECK_DEPTH_FRONT });
      }
      facingPoly.push({ x: FACING_W, y: torsoLen });
      facingPoly.push({ x: -PLACKET_W, y: torsoLen });
      facingPoly.push({ x: -PLACKET_W, y: breakPointY });
      // closes back to breakPoint (= lapelForFacing[0])

      // Per-edge SA. `edgeAllowances[i]` is the edge OUTGOING from vertex i,
      // so the array MUST have exactly `facingPoly.length` entries — the last
      // slot is the closing edge back to vertex 0. Missing slots crash
      // `edgeSALabels` (src/ui/pattern-view.js) at render.
      const facingEdges = [];
      // Lapel: K-1 edges between the K lapelForFacing points.
      for (let i = 0; i < lapelForFacing.length - 1; i++) {
        facingEdges.push({ sa, label: 'Lapel' });
      }
      // Shawl only: neckline curve edges + step from neckline to facing inner width.
      for (let i = 0; i < neckForFacing.length; i++) {
        facingEdges.push({ sa, label: 'Neck' });
      }
      if (opts.collar === 'shawl') {
        facingEdges.push({ sa, label: 'Neck-step' }); // shawl: step CF → FACING_TOP_W
      }
      facingEdges.push({ sa,      label: 'Inner' });     // → (FACING_W, torso)
      facingEdges.push({ sa: hem, label: 'Hem' });       // → (-PLACKET_W, torso)
      facingEdges.push({ sa,      label: 'Placket' });   // → (-PLACKET_W, breakPointY)
      facingEdges.push({ sa,      label: 'BreakStep' }); // closing → breakPoint

      if (facingEdges.length !== facingPoly.length) {
        console.warn(`[athletic-formal-jacket] facingEdges length ${facingEdges.length} !== facingPoly length ${facingPoly.length}`);
      }

      // sanitizePoly normalizes to CW-in-standard-math (negative shoelace), so
      // offsetPolygon with negative values goes inward = correct stitch-line direction.
      const facingSA = offsetPolygon(facingPoly, (i) => -(facingEdges[i]?.sa ?? sa));

      const facingBB = bbox(facingPoly);
      const styleLabel = opts.collar === 'peak' ? 'peak' : opts.collar === 'notched' ? 'notched' : 'shawl';
      pieces.push({
        id: 'front-facing',
        name: 'Front Facing',
        instruction: `Cut 2 (L & R mirror) · Interface with knit fusible · Mirrors the ${styleLabel} lapel of the front panel plus a ${fmtInches(FACING_W)} CF strip to the hem`,
        type: 'bodice',
        isCutOnFold: false,
        polygon: facingPoly,
        saPolygon: facingSA,
        path: polyToPathStr(facingPoly),
        edgeAllowances: facingEdges,
        rollLine: {
          from: { x: 0, y: breakPointY },
          to:   { x: topEnd.x, y: topEnd.y },
          label: 'roll line',
        },
        notches: [
          { x: topEnd.x, y: topEnd.y, angle: 0 },
          { x: 0, y: breakPointY, angle: 180 },
        ],
        width: facingBB.maxX - facingBB.minX,
        height: facingBB.maxY - facingBB.minY,
        isBack: false,
        sa,
      });
    }

    // ── POCKETS ──────────────────────────────────────────────────────────
    if (opts.pocket === 'patch' || opts.pocket === 'combo') {
      pieces.push({
        id: 'hip-patch-pocket',
        name: 'Hip Patch Pocket',
        instruction: `Cut 2 · Round bottom corners with a ½″ radius (trace a coin) for the athletic relaxed look · Top edge: 1½″ hem (fold under ¾″ twice, {topstitch}) · {topstitch} sides + bottom · Bar tack top corners`,
        type: 'pocket',
        dimensions: { width: 7, height: 7 },
        sa, hem: 1.5, hemEdge: 'top',
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
        dimensions: { width: 4.5, height: 4.5 },
      });
      pieces.push({
        id: 'chest-welt-flap',
        name: 'Chest Welt Facing',
        instruction: 'Cut 1 · Interface with knit fusible · Left breast',
        type: 'pocket',
        dimensions: { width: 4.5, height: 1.5 },
      });
    }

    // ── SLEEVE CUFF ─────────────────────────────────────────────────────
    if (opts.sleeveCuff === 'rib') {
      const wristCirc = (m.wrist || m.bicep * 0.55) * 1.4;
      const cuffLen = wristCirc * 0.85;
      pieces.push({
        id: 'sleeve-rib-cuff',
        name: 'Sleeve Rib Cuff',
        instruction: `Cut 2 from rib knit on fold · ${fmtInches(cuffLen)} long × 3″ cut (1.5″ finished) · 85% of sleeve opening`,
        type: 'rectangle',
        dimensions: { length: cuffLen, width: 3 },
        sa,
      });
    }

    // ── BACK NECK FACING ────────────────────────────────────────────────
    // Shaped piece that finishes the back neckline between the front facings.
    // Follows the back neckline curve, 2.5″ wide. Cut 1 on fold at CB.
    const BACK_FACING_W = 2.5;
    const backFacingPoly = [];
    // Outer edge: neckline curve (same as back panel neckline)
    const neckBackForFacing = [...backNeckPts].reverse();
    for (const p of neckBackForFacing) backFacingPoly.push({ ...p, x: neckW - p.x });
    delete backFacingPoly[0].curve;
    delete backFacingPoly[backFacingPoly.length - 1].curve;
    // Inner edge: BACK_FACING_W below the neckline, spanning only CB → shoulder-neck (neckW)
    backFacingPoly.push({ x: neckW, y: BACK_FACING_W });
    backFacingPoly.push({ x: 0, y: NECK_DEPTH_BACK + BACK_FACING_W });
    const backFacingBB = bbox(backFacingPoly);

    pieces.push({
      id: 'back-neck-facing',
      name: 'Back Neck Facing',
      instruction: `Cut 1 on fold (CB) · Interface with knit fusible · ${fmtInches(BACK_FACING_W)} wide · Joins front facings at shoulder seams`,
      type: 'bodice',
      polygon: backFacingPoly,
      path: polyToPathStr(backFacingPoly),
      width: backFacingBB.maxX - backFacingBB.minX,
      height: backFacingBB.maxY - backFacingBB.minY,
      isBack: true,
      sa,
    });

    // ── LINING ──────────────────────────────────────────────────────────
    if (opts.lining === 'half') {
      // Back lining: follows back panel from shoulder to 4″ below armhole
      const liningCutoff = armholeY + 4;
      const backLiningPoly = [];
      for (const p of backPoly) {
        if (p.y <= liningCutoff) backLiningPoly.push({ x: p.x, y: p.y });
      }
      // Close the bottom edge
      if (backLiningPoly.length > 0) {
        const lastX = backLiningPoly[backLiningPoly.length - 1].x;
        backLiningPoly.push({ x: lastX, y: liningCutoff });
        backLiningPoly.push({ x: 0, y: liningCutoff });
      }
      const backLiningBB = bbox(backLiningPoly);

      pieces.push({
        id: 'lining-back',
        name: 'Back Lining (Upper)',
        instruction: `Cut 1 on fold (CB) · Extends from shoulder to ${fmtInches(liningCutoff)} below baseline · Jersey or tricot lining`,
        type: 'bodice',
        polygon: backLiningPoly,
        path: polyToPathStr(backLiningPoly),
        width: backLiningBB.maxX - backLiningBB.minX,
        height: backLiningBB.maxY - backLiningBB.minY,
        isBack: true,
        sa,
      });

      // Sleeve lining: follows top sleeve shape
      pieces.push({
        id: 'lining-top-sleeve',
        name: 'Top Sleeve Lining',
        instruction: 'Cut 2 (mirror L & R) · Outer arm lining · Jersey or tricot',
        type: 'sleeve',
        polygon: sleeveResult.topSleeve,
        path: polyToPathStr(sleeveResult.topSleeve),
        width: topSlvBB.maxX - topSlvBB.minX,
        height: topSlvBB.maxY - topSlvBB.minY,
        capHeight: sleeveResult.capHeight,
        sleeveLength: slvLength,
        sleeveWidth: sleeveResult.topSleeveWidth,
        sa, hem,
      });
      pieces.push({
        id: 'lining-under-sleeve',
        name: 'Under Sleeve Lining',
        instruction: 'Cut 2 (mirror L & R) · Inner arm lining · Jersey or tricot',
        type: 'sleeve',
        polygon: sleeveResult.underSleeve,
        path: polyToPathStr(sleeveResult.underSleeve),
        width: underSlvBB.maxX - underSlvBB.minX,
        height: underSlvBB.maxY - underSlvBB.minY,
        capHeight: sleeveResult.capHeight,
        sleeveLength: slvLength,
        sleeveWidth: sleeveResult.underSleeveWidth,
        sa, hem,
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

    // ── COLLAR / LAPEL ──
    if (opts.collar === 'peak' || opts.collar === 'notched') {
      steps.push({
        step: n++, title: 'Prepare collar',
        detail: 'Interface upper collar with knit fusible. Sew upper to under collar {RST} on three sides, leaving neck edge open. Trim SA to 3mm. {clip} corners. Turn, {press} gently — the under collar is 2% smaller so the seam rolls to the underside. {topstitch} 6mm from edge if desired.',
      });

      steps.push({
        step: n++, title: 'Attach front facings',
        detail: `Interface facings with knit fusible. Pin each facing to its front panel {RST} along the ${opts.collar === 'peak' ? 'peak' : 'notched'} lapel edge and CF down to the hem, matching break-point and gorge notches. Sew. Trim SA, {clip} curves, and turn. {press} gently, rolling the seam 1/16″ to the underside so it stays invisible when the lapel folds back along the roll line. Tack the facing at the shoulder seam and along CF.`,
      });
    } else {
      steps.push({
        step: n++, title: 'Attach front facings',
        detail: `Interface facings with knit fusible. Pin each facing to its front panel {RST} along the shawl lapel edge and CF down to the hem, matching break-point and shoulder-neck notches. Sew. {clip} curves, turn. {press} gently, rolling the seam 1/16″ to the underside so it stays invisible when the shawl rolls back along the roll line. Tack the facing at the shoulder seam and along CF.`,
      });

      steps.push({
        step: n++, title: 'Prepare back shawl collar',
        detail: 'Interface back collar with knit fusible. This piece sews shoulder-to-shoulder across the back neck to finish the neckline between the two fronts. The front lapel is already part of the front panel.',
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
        ? 'Pin back shawl collar to the back neckline {RST}, matching CB fold and shoulder-neck notches. The collar ends at each shoulder seam; the front shawl lapel (already part of the front panel) continues from there. Sew. {clip} curve. {press} SA toward collar.'
        : 'Pin collar to neckline {RST}, matching CB and front gorge notches. Sew from shoulder seam to gorge on each side. The collar meets the lapel at the gorge — hand-stitch the gorge junction for a clean finish. {press} SA toward collar.',
    });

    steps.push({
      step: n++, title: 'Assemble sleeves',
      detail: 'For each sleeve: pin top sleeve to under sleeve {RST} along the front (inner arm) seam, matching elbow notches. Stretch stitch or {serge}. {press} open. Then sew the back (outer arm) seam the same way. You now have a finished sleeve tube with the cap shaped for the armhole.',
    });

    steps.push({
      step: n++, title: 'Set sleeves',
      detail: 'Pin each assembled sleeve cap into the armhole {RST}. Match the crown notch to the shoulder seam, the front seam of the sleeve to the front pitch notch on the armhole, and the back seam to the back (double) pitch notch. Distribute the cap ease evenly — 1″ of ease in jersey eases readily. Stretch stitch or {serge}. {press} toward sleeve.',
    });

    steps.push({
      step: n++, title: 'Sew side seams',
      detail: `Sew front to back at side seams {RST} from hem to underarm only — the sleeve is already assembled and set.${opts.vent === 'side' ? ` Leave the bottom ${fmtInches(m.torsoLength * VENT_LENGTH_FRAC)} of each side seam open for side vents.` : ''} Stretch stitch or {serge}. {press} open.`,
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
