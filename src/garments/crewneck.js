// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Crewneck Sweatshirt — heavier knit with ribbed trim.
 * Front body, back body, sleeve ×2 (long, 25″ default).
 * Rib trim: neckband, waistband, cuffs ×2.
 * Set-in or raglan sleeve option.
 * Fabric body: french terry or sweatshirt fleece 10–12 oz.
 * Trim: rib knit 6–8 oz.
 */

import {
  shoulderSlope, necklineCurve, armholeCurve, sleeveCapCurve, shoulderDropFromWidth,
  armholeDepthFromChest, chestEaseDistribution, neckWidthFromCircumference, UPPER_EASE,
} from '../engine/upper-body.js';
import { sampleBezier, fmtInches, edgeAngle, arcLength, ptAtArcLen, dist } from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

export default {
  id: 'crewneck',
  name: 'Crewneck Sweatshirt',
  category: 'upper',
  difficulty: 'intermediate',
  priceTier: 'core',
  measurements: ['chest', 'shoulder', 'neck', 'sleeveLength', 'bicep', 'torsoLength'],
  measurementDefaults: { sleeveLength: 25 },

  options: {
    fit: {
      type: 'select', label: 'Fit',
      values: [
        { value: 'standard',  label: 'Regular (+4″)'    },
        { value: 'oversized', label: 'Oversized (+10″)' },
      ],
      default: 'standard',
    },
    sleeveType: {
      type: 'select', label: 'Sleeve construction',
      values: [
        { value: 'set-in',  label: 'Set-in sleeve'  },
        { value: 'raglan',  label: 'Raglan sleeve'  },
      ],
      default: 'set-in',
    },
    kangaroo: {
      type: 'select', label: 'Kangaroo pocket',
      values: [
        { value: 'none',     label: 'None'           },
        { value: 'kangaroo', label: 'Kangaroo pocket' },
      ],
      default: 'none',
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
      type: 'select', label: 'Hem allowance (no rib)',
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

    const totalEase = UPPER_EASE[opts.fit] ?? 4;
    const { front: frontEase, back: backEase } = chestEaseDistribution(totalEase);
    // Both front and back half-panels are equal so side seams align when sewn
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
    // Back armhole must also end at panelW for vertical side seam.
    // crossBack influences armhole curve shape, not endpoint.
    const backChestDepth = chestDepth;
    const torsoLen     = m.torsoLength;
    const slvLength    = m.sleeveLength ?? 25;
    const isRaglan     = opts.sleeveType === 'raglan';

    // ── CURVE TAGGING — VERIFIED WORKING, DO NOT CHANGE UNLESS NECESSARY ──
    // .curve tags enable Catmull-Rom rendering in pattern-view.js / print-layout.js.
    // Junction points must have .curve DELETED after polygon construction.
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

    // ── FRONT BODICE ─────────────────────────────────────────────────────────
    const frontNeckPts = sampleCurve(necklineCurve(neckW, 2.5, 'crew'));
    const frontShoulderPts = sampleCurve(shoulderSlope(shoulderW, slopeDrop));

    const frontPoly = [];
    const neckFrontRev = [...frontNeckPts].reverse();
    for (const p of neckFrontRev) frontPoly.push({ ...p, x: neckW - p.x });
    // ── JUNCTION UNTAGGING — VERIFIED WORKING, DO NOT CHANGE UNLESS NECESSARY ──
    delete frontPoly[0].curve;  // fold-neckline junction
    delete frontPoly[frontNeckPts.length - 1].curve;  // shoulder-neck junction

    if (isRaglan) {
      // Raglan: diagonal line from shoulder-neck junction to underarm instead of shoulder + armhole
      frontPoly.push({ x: shoulderPtX + chestDepth, y: shoulderPtY + armholeDepth });
    } else {
      for (let i = 1; i < frontShoulderPts.length; i++) {
        frontPoly.push({ ...frontShoulderPts[i], x: neckW + frontShoulderPts[i].x });
      }
      const frontArmPts = sampleCurve(armholeCurve(shoulderW, chestDepth, armholeDepth, false));
      for (let i = 1; i < frontArmPts.length; i++) {
        frontPoly.push({ ...frontArmPts[i], x: shoulderPtX + frontArmPts[i].x, y: shoulderPtY + frontArmPts[i].y });
      }
    }

    const sideX = shoulderPtX + chestDepth;
    frontPoly.push({ x: sideX, y: torsoLen });
    frontPoly.push({ x: 0, y: torsoLen });
    frontPoly.push({ x: 0, y: 2.5 });

    // ── BACK BODICE ──────────────────────────────────────────────────────────
    const backNeckPts = sampleCurve(necklineCurve(neckW, 0.75, 'crew'));

    const backPoly = [];
    const neckBackRev = [...backNeckPts].reverse();
    for (const p of neckBackRev) backPoly.push({ ...p, x: neckW - p.x });
    // ── JUNCTION UNTAGGING — VERIFIED WORKING, DO NOT CHANGE UNLESS NECESSARY ──
    delete backPoly[0].curve;  // fold-neckline junction
    delete backPoly[backNeckPts.length - 1].curve;  // shoulder-neck junction

    if (isRaglan) {
      backPoly.push({ x: shoulderPtX + backChestDepth, y: shoulderPtY + armholeDepth });
    } else {
      for (let i = 1; i < frontShoulderPts.length; i++) {
        backPoly.push({ ...frontShoulderPts[i], x: neckW + frontShoulderPts[i].x });
      }
      const backArmPts = sampleCurve(armholeCurve(shoulderW, backChestDepth, armholeDepth, true));
      for (let i = 1; i < backArmPts.length; i++) {
        backPoly.push({ ...backArmPts[i], x: shoulderPtX + backArmPts[i].x, y: shoulderPtY + backArmPts[i].y });
      }
    }

    const backSideX = shoulderPtX + backChestDepth;
    backPoly.push({ x: backSideX, y: torsoLen });
    backPoly.push({ x: 0, y: torsoLen });
    backPoly.push({ x: 0, y: 0.75 });

    // ── SLEEVE ───────────────────────────────────────────────────────────────
    const effArmToElbow = m.armToElbow || (slvLength * 0.45);
    const sleeveEase = totalEase * 0.25;
    const slvWidth   = m.bicep / 2 + sleeveEase;
    const capHeight  = isRaglan ? 0 : armholeDepth * 0.60;

    let sleevePoly;
    let capPts;
    if (isRaglan) {
      // Raglan sleeve: trapezoid — wider at cap (armhole), tapers to cuff
      const capW = (shoulderW + chestDepth) * 1.05;
      sleevePoly = [
        { x: 0,       y: 0         },
        { x: capW * 2, y: 0        },
        { x: slvWidth * 2, y: slvLength },
        { x: 0,       y: slvLength },
      ];
    } else {
      const capCp  = sleeveCapCurve(m.bicep, capHeight, slvWidth * 2);
      capPts = sampleCurve(capCp, 16);
      sleevePoly = [];
      for (const p of capPts) sleevePoly.push({ ...p, y: p.y + capHeight });
      // ── SLEEVE JUNCTION UNTAGGING — VERIFIED WORKING, DO NOT CHANGE UNLESS NECESSARY ──
      delete sleevePoly[0].curve;
      delete sleevePoly[capPts.length - 1].curve;
      sleevePoly.push({ x: slvWidth * 2, y: capHeight + slvLength });
      sleevePoly.push({ x: 0, y: capHeight + slvLength });
    }

    // ── RIB TRIM PIECES ───────────────────────────────────────────────────────
    // Neckband: 85% of neck circumference
    const nbLen = m.neck * 0.85;
    // Waistband: 90% of body hem circumference
    const hemCirc  = (frontW + backW) * 2;
    const wbLen    = hemCirc * 0.90;
    // Cuffs: 85% of sleeve opening (≈ bicep / 2 + ease) × 2 sides
    const slvHemW  = slvWidth * 2;  // opening width (flat)
    const cuffLen  = slvHemW * 0.85;

    // ── NOTCH MARKS ─────────────────────────────────────────────────────────
    const shoulderMidX = neckW + shoulderW / 2;
    const shoulderMidY = slopeDrop / 2;

    // Arc-length notches: single = front, double = back; ~3.25″ from underarm
    const FRONT_NOTCH_ARC = 3.25;
    const BACK_NOTCH_ARC  = 3.25;
    const frontArmPtsRev = [...frontArmPts].reverse();
    const backArmPtsRev  = [...backArmPts].reverse();
    const frontNotchPt    = ptAtArcLen(frontArmPtsRev, FRONT_NOTCH_ARC);
    const backNotch1Pt    = ptAtArcLen(backArmPtsRev, BACK_NOTCH_ARC);
    const backNotch2Pt    = ptAtArcLen(backArmPtsRev, BACK_NOTCH_ARC + 0.25);
    const frontNotchBodice = { x: frontNotchPt.x + shoulderPtX, y: frontNotchPt.y + shoulderPtY };
    const backNotch1Bodice = { x: backNotch1Pt.x + shoulderPtX, y: backNotch1Pt.y + shoulderPtY };
    const backNotch2Bodice = { x: backNotch2Pt.x + shoulderPtX, y: backNotch2Pt.y + shoulderPtY };

    const frontNotches = isRaglan ? [] : [
      { x: shoulderMidX, y: shoulderMidY, angle: edgeAngle({ x: neckW, y: 0 }, { x: shoulderPtX, y: slopeDrop }) },
      { x: sideX, y: armholeY, angle: 0 },
      { x: frontNotchBodice.x, y: frontNotchBodice.y, angle: 0 },
    ];

    const backNotches = isRaglan ? [] : [
      { x: shoulderMidX, y: shoulderMidY, angle: edgeAngle({ x: neckW, y: 0 }, { x: shoulderPtX, y: slopeDrop }) },
      { x: backSideX, y: armholeY, angle: 0 },
      { x: backNotch1Bodice.x, y: backNotch1Bodice.y, angle: 0 },
      { x: backNotch2Bodice.x, y: backNotch2Bodice.y, angle: 0 },
    ];

    const capW = slvWidth * 2;
    const capMidIdx      = Math.floor(capPts.length / 2);
    const backCapPts     = capPts.slice(0, capMidIdx + 1);
    const frontCapPtsRev = [...capPts.slice(capMidIdx)].reverse();
    const backCapNotch1  = ptAtArcLen(backCapPts, BACK_NOTCH_ARC);
    const backCapNotch2  = ptAtArcLen(backCapPts, BACK_NOTCH_ARC + 0.25);
    const frontCapNotch  = ptAtArcLen(frontCapPtsRev, FRONT_NOTCH_ARC);
    const sleeveNotches = isRaglan ? [] : [
      { x: capW / 2, y: 0, angle: -90 },
      { x: backCapNotch1.x,  y: backCapNotch1.y  + capHeight, angle: edgeAngle(backCapPts[0], backCapPts[1]) },
      { x: backCapNotch2.x,  y: backCapNotch2.y  + capHeight, angle: edgeAngle(backCapPts[0], backCapPts[1]) },
      { x: frontCapNotch.x,  y: frontCapNotch.y  + capHeight, angle: edgeAngle(frontCapPtsRev[0], frontCapPtsRev[1]) },
    ];

    // ── SLEEVE CAP / ARMHOLE VALIDATION ───────────────────────────────────────
    let capEaseNote = '';
    if (!isRaglan) {
      const frontArmArc = arcLength(sampleCurve(armholeCurve(shoulderW, chestDepth, armholeDepth, false)));
      const backArmArc  = arcLength(sampleCurve(armholeCurve(shoulderW, backChestDepth, armholeDepth, true)));
      const armholeArc  = frontArmArc + backArmArc;
      const capArc      = arcLength(capPts);
      const capEase     = capArc - armholeArc;
      if (capEase < 0.5 || capEase > 3) {
        console.warn(`[crewneck] Sleeve cap ease out of range: ${capEase.toFixed(2)}″ (expected 0.5–3″). Cap: ${capArc.toFixed(2)}″, Armhole: ${armholeArc.toFixed(2)}″`);
      }
      capEaseNote = ` · Sleeve cap: ${fmtInches(capArc)}, Armhole: ${fmtInches(armholeArc)}, Ease: ${fmtInches(capEase)}`;
    }

    const frontBB  = bbox(frontPoly);
    const backBB   = bbox(backPoly);
    const sleeveBB = bbox(sleevePoly);

    const pieces = [
      {
        id: 'bodice-front',
        name: 'Front Bodice',
        instruction: `Cut 1 on fold (CF)${isRaglan ? ' · Raglan: diagonal armhole seam' : ''}`,
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
        ],
      },
      {
        id: 'bodice-back',
        name: 'Back Bodice',
        instruction: `Cut 1 on fold (CB)${isRaglan ? ' · Raglan: diagonal armhole seam' : ''}`,
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
        name: `Sleeve (${isRaglan ? 'Raglan' : 'Set-in'})`,
        instruction: `Cut 2 (mirror L & R)${isRaglan ? ' · Diagonal seam joins bodice at raglan line' : ' · Cap top, set into armhole'}${capEaseNote}`,
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
          { label: fmtInches(slvWidth * 2) + ' underarm', x1: 0, y1: (isRaglan ? 0 : capHeight) + 0.4, x2: slvWidth * 2, y2: (isRaglan ? 0 : capHeight) + 0.4, type: 'h' },
          { label: fmtInches(slvLength) + ' length', x: slvWidth * 2 + 1, y1: isRaglan ? 0 : capHeight, y2: (isRaglan ? 0 : capHeight) + slvLength, type: 'v' },
          { label: fmtInches(effArmToElbow) + ' to elbow', x: -1.5, y1: 0, y2: effArmToElbow, type: 'v', color: '#b8963e' },
        ],
      },
      {
        id: 'neckband',
        name: 'Neckband (rib)',
        instruction: `Cut 1 from rib knit on fold · ${fmtInches(nbLen)} long × 3″ cut (1.5″ finished) · 85% of neck opening`,
        type: 'rectangle',
        dimensions: { length: nbLen, width: 3 },
        sa,
      },
      {
        id: 'waistband',
        name: 'Waistband (rib)',
        instruction: `Cut 1 from rib knit on fold · ${fmtInches(wbLen)} long × 3″ cut (1.5″ finished) · 90% of body hem circumference`,
        type: 'rectangle',
        dimensions: { length: wbLen, width: 3 },
        sa,
      },
      {
        id: 'cuff',
        name: 'Sleeve Cuff (rib)',
        instruction: `Cut 2 from rib knit on fold · ${fmtInches(cuffLen)} long × 3″ cut (1.5″ finished) · 85% of sleeve opening`,
        type: 'rectangle',
        dimensions: { length: cuffLen, width: 3 },
        sa,
      },
    ];

    if (opts.kangaroo === 'kangaroo') {
      pieces.push({
        id: 'kangaroo-pocket',
        name: 'Kangaroo Pocket',
        instruction: 'Cut 1 · Center on front bodice at waist level · Curve bottom corners (2″ radius) · {topstitch} sides and bottom',
        type: 'pocket',
        dimensions: { width: 10, height: 7 },
        sa,
      });
    }

    return pieces;
  },

  materials(m, opts) {
    const isRaglan = opts.sleeveType === 'raglan';
    const notions = [
      { name: 'Rib knit', quantity: '0.75 yard', notes: 'For neckband, waistband, and cuffs (high recovery 2×2 or 1×1 rib)' },
    ];

    return buildMaterialsSpec({
      fabrics: ['french-terry', 'sweatshirt-fleece'],
      notions,
      thread: 'poly-all',
      needle: 'ballpoint-90',
      stitches: ['stretch', 'overlock', 'coverstitch', 'zigzag-med'],
      notes: [
        'Use a ballpoint (jersey) needle 90/14 for fleece and french terry - prevents skipped stitches',
        'Use stretch stitch or serger for ALL seams - a straight stitch will pop when stretched',
        'Stretch rib trim as you sew to match body opening - do not stretch the body edge',
        'Pre-wash fleece/terry before cutting - knits can shrink 3–5% in first wash',
        'Do not {press} fleece with high heat - use low steam or finger {press} seams open',
        isRaglan ? 'Raglan: sew four seams only (2 front, 2 back) - no shoulder seam or armhole setting required' : 'Ease sleeve cap evenly - divide cap and armhole into quarters and pin at quarters before sewing',
        opts.kangaroo === 'kangaroo' ? 'Kangaroo pocket: sew to front body BEFORE sewing shoulder seams for easiest access' : '',
      ].filter(Boolean),
    });
  },

  instructions(m, opts) {
    const steps = [];
    let n = 1;
    const isRaglan = opts.sleeveType === 'raglan';

    if (opts.kangaroo === 'kangaroo') {
      steps.push({
        step: n++, title: 'Attach kangaroo pocket',
        detail: 'Round the two bottom corners of pocket (2″ radius). {serge} or {zigzag} all edges. Fold top edge under ½″, {topstitch}. Position centered on front body at waist level. {topstitch} sides and bottom close to edge. Bar tack top corners.',
      });
    }

    if (isRaglan) {
      steps.push({
        step: n++, title: 'Sew raglan seams',
        detail: 'Sew each sleeve to front and back along diagonal raglan seam {RST}. Stretch stitch or {serge}. {press} toward bodice.',
      });
      steps.push({
        step: n++, title: 'Attach neckband',
        detail: 'Fold neckband in half lengthwise {WST}. Divide into quarters, pin to neck opening. Stretch stitch or {serge}, stretching band to fit. {press} toward bodice.',
      });
      steps.push({
        step: n++, title: 'Sew side seams and underarm seams',
        detail: 'Sew front to back at side seams continuously from waistband level up through underarm and sleeve hem. Stretch stitch or {serge}. {press} toward back.',
      });
    } else {
      steps.push({
        step: n++, title: 'Sew shoulder seams',
        detail: 'Join front to back at shoulders {RST}. Stretch stitch or {serge}. {press} toward back.',
      });
      steps.push({
        step: n++, title: 'Attach neckband',
        detail: 'Fold neckband in half lengthwise {WST}. Divide into quarters, pin to neck opening. Stretch stitch or {serge}, stretching band to fit. {press} toward bodice.',
      });
      steps.push({
        step: n++, title: 'Set sleeves',
        detail: 'Pin sleeve cap to armhole, matching center cap to shoulder seam. Ease cap to fit. Stretch stitch or {serge}. {press} toward sleeve.',
      });
      steps.push({
        step: n++, title: 'Sew side and sleeve seams',
        detail: 'Sew front to back at side seams continuously from hem through underarm to sleeve hem. Stretch stitch or {serge}. {press} toward back.',
      });
    }

    steps.push({
      step: n++, title: 'Attach sleeve cuffs',
      detail: 'Fold each cuff in half widthwise {WST}. Divide cuff and sleeve opening into quarters. Sew cuff to sleeve opening {RST}, stretching cuff to match. Stretch stitch or {serge}. {press} SA up into sleeve.',
    });
    steps.push({
      step: n++, title: 'Attach waistband',
      detail: 'Fold waistband in half lengthwise {WST}. Divide into quarters, pin to body hem {RST}. Stretch stitch or {serge}, stretching band to fit. {press} SA up into body.',
    });
    steps.push({
      step: n++, title: 'Finish',
      detail: '{press} with damp cloth on low heat. Rib trim should lay flat. Try on and check sleeve and body length.',
    });

    return steps;
  },
};
