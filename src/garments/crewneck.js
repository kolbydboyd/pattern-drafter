/**
 * Crewneck Sweatshirt — heavier knit with ribbed trim.
 * Front body, back body, sleeve ×2 (long, 25″ default).
 * Rib trim: neckband, waistband, cuffs ×2.
 * Set-in or raglan sleeve option.
 * Fabric body: french terry or sweatshirt fleece 10–12 oz.
 * Trim: rib knit 6–8 oz.
 */

import {
  shoulderSlope, necklineCurve, armholeCurve, sleeveCapCurve,
  armholeDepthFromChest, chestEaseDistribution, neckWidthFromCircumference, UPPER_EASE,
} from '../engine/upper-body.js';
import { sampleBezier, fmtInches } from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

export default {
  id: 'crewneck',
  name: 'Crewneck Sweatshirt',
  category: 'upper',
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
    const slopeDrop    = 1.75;
    const shoulderPtX  = neckW + shoulderW;
    const armholeDepth = armholeDepthFromChest(m.chest, opts.fit === 'oversized' ? 'oversized' : 'standard');
    const chestDepth   = panelW - shoulderPtX;
    const torsoLen     = m.torsoLength;
    const slvLength    = m.sleeveLength ?? 25;
    const isRaglan     = opts.sleeveType === 'raglan';

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

    const shoulderPtY = slopeDrop;

    // ── FRONT BODICE ─────────────────────────────────────────────────────────
    const frontNeckPts = sampleCurve(necklineCurve(neckW, 2.5, 'crew'));
    const frontShoulderPts = sampleCurve(shoulderSlope(shoulderW, slopeDrop));

    const frontPoly = [];
    const neckFrontRev = [...frontNeckPts].reverse();
    for (const p of neckFrontRev) frontPoly.push({ x: neckW - p.x, y: 2.5 - p.y });

    if (isRaglan) {
      // Raglan: diagonal line from shoulder-neck junction to underarm instead of shoulder + armhole
      frontPoly.push({ x: shoulderPtX + chestDepth, y: shoulderPtY + armholeDepth });
    } else {
      for (let i = 1; i < frontShoulderPts.length; i++) {
        frontPoly.push({ x: neckW + frontShoulderPts[i].x, y: frontShoulderPts[i].y });
      }
      const frontArmPts = sampleCurve(armholeCurve(shoulderW, chestDepth, armholeDepth, false));
      for (let i = 1; i < frontArmPts.length; i++) {
        frontPoly.push({ x: shoulderPtX + frontArmPts[i].x, y: shoulderPtY + frontArmPts[i].y });
      }
    }

    const sideX = shoulderPtX + chestDepth;
    frontPoly.push({ x: sideX, y: torsoLen });
    frontPoly.push({ x: 0, y: torsoLen });
    frontPoly.push({ x: 0, y: 2.5 });

    // ── BACK BODICE ──────────────────────────────────────────────────────────
    const backNeckPts = sampleCurve(necklineCurve(neckW, 0.75, 'crew'));
    const backChestDepth = chestDepth * 0.95;

    const backPoly = [];
    const neckBackRev = [...backNeckPts].reverse();
    for (const p of neckBackRev) backPoly.push({ x: neckW - p.x, y: 0.75 - p.y });

    if (isRaglan) {
      backPoly.push({ x: shoulderPtX + backChestDepth, y: shoulderPtY + armholeDepth });
    } else {
      for (let i = 1; i < frontShoulderPts.length; i++) {
        backPoly.push({ x: neckW + frontShoulderPts[i].x, y: frontShoulderPts[i].y });
      }
      const backArmPts = sampleCurve(armholeCurve(shoulderW, backChestDepth, armholeDepth, true));
      for (let i = 1; i < backArmPts.length; i++) {
        backPoly.push({ x: shoulderPtX + backArmPts[i].x, y: shoulderPtY + backArmPts[i].y });
      }
    }

    const backSideX = shoulderPtX + backChestDepth;
    backPoly.push({ x: backSideX, y: torsoLen });
    backPoly.push({ x: 0, y: torsoLen });
    backPoly.push({ x: 0, y: 0.75 });

    // ── SLEEVE ───────────────────────────────────────────────────────────────
    const sleeveEase = totalEase * 0.25;
    const slvWidth   = m.bicep / 2 + sleeveEase;
    const capHeight  = isRaglan ? 0 : 5.5;

    let sleevePoly;
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
      const capPts = sampleBezier(capCp.p0, capCp.p1, capCp.p2, capCp.p3, 16);
      sleevePoly = [];
      for (const p of capPts) sleevePoly.push({ x: p.x, y: p.y + capHeight });
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
        dims: [
          { label: fmtInches(backW) + ' half width', x1: 0, y1: -0.5, x2: backW, y2: -0.5, type: 'h' },
          { label: fmtInches(torsoLen) + ' length', x: backBB.maxX + 1, y1: 0, y2: torsoLen, type: 'v' },
        ],
      },
      {
        id: 'sleeve',
        name: `Sleeve (${isRaglan ? 'Raglan' : 'Set-in'})`,
        instruction: `Cut 2 (mirror L & R)${isRaglan ? ' · Diagonal seam joins bodice at raglan line' : ' · Cap top, set into armhole'}`,
        type: 'sleeve',
        polygon: sleevePoly,
        path: polyToPathStr(sleevePoly),
        width: sleeveBB.maxX - sleeveBB.minX,
        height: sleeveBB.maxY - sleeveBB.minY,
        capHeight,
        sleeveLength: slvLength,
        sleeveWidth: slvWidth * 2,
        sa, hem,
        dims: [
          { label: fmtInches(slvWidth * 2) + ' underarm', x1: 0, y1: (isRaglan ? 0 : capHeight) + 0.4, x2: slvWidth * 2, y2: (isRaglan ? 0 : capHeight) + 0.4, type: 'h' },
          { label: fmtInches(slvLength) + ' length', x: slvWidth * 2 + 1, y1: isRaglan ? 0 : capHeight, y2: (isRaglan ? 0 : capHeight) + slvLength, type: 'v' },
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
        instruction: 'Cut 1 · Center on front bodice at waist level · Curve bottom corners (2″ radius) · Topstitch sides and bottom',
        type: 'pocket',
        dimensions: { width: 10, height: 7 },
      });
    }

    return pieces;
  },

  materials(m, opts) {
    const isRaglan = opts.sleeveType === 'raglan';
    const notions = [
      { name: 'Rib knit', quantity: '0.75 yard', notes: 'For neckband, waistband, and cuffs — high recovery 2×2 or 1×1 rib' },
    ];

    return buildMaterialsSpec({
      fabrics: ['french-terry', 'sweatshirt-fleece'],
      notions,
      thread: 'poly-all',
      needle: 'ballpoint-90',
      stitches: ['stretch', 'overlock', 'coverstitch', 'zigzag-med'],
      notes: [
        'Use a ballpoint (jersey) needle 90/14 for fleece and french terry — prevents skipped stitches',
        'Use stretch stitch or serger for ALL seams — a straight stitch will pop when stretched',
        'Stretch rib trim as you sew to match body opening — do not stretch the body edge',
        'Pre-wash fleece/terry before cutting — knits can shrink 3–5% in first wash',
        'Do not press fleece with high heat — use low steam or finger press seams open',
        isRaglan ? 'Raglan: sew four seams only (2 front, 2 back) — no shoulder seam or armhole setting required' : 'Ease sleeve cap evenly — divide cap and armhole into quarters and pin at quarters before sewing',
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
        detail: 'Round the two bottom corners of pocket (2″ radius). Serge or zigzag all edges. Fold top edge under ½″, topstitch. Position centered on front body at waist level. Topstitch sides and bottom close to edge. Bar tack top corners.',
      });
    }

    if (isRaglan) {
      steps.push({
        step: n++, title: 'Sew raglan seams',
        detail: 'Sew each sleeve to front and back along diagonal raglan seam (RST). Stretch stitch or serge. Press toward bodice.',
      });
      steps.push({
        step: n++, title: 'Attach neckband',
        detail: 'Fold neckband in half lengthwise (WST). Divide into quarters, pin to neck opening. Stretch stitch or serge, stretching band to fit. Press toward bodice.',
      });
      steps.push({
        step: n++, title: 'Sew side seams and underarm seams',
        detail: 'Sew front to back at side seams continuously from waistband level up through underarm and sleeve hem. Stretch stitch or serge. Press toward back.',
      });
    } else {
      steps.push({
        step: n++, title: 'Sew shoulder seams',
        detail: 'Join front to back at shoulders (RST). Stretch stitch or serge. Press toward back.',
      });
      steps.push({
        step: n++, title: 'Attach neckband',
        detail: 'Fold neckband in half lengthwise (WST). Divide into quarters, pin to neck opening. Stretch stitch or serge, stretching band to fit. Press toward bodice.',
      });
      steps.push({
        step: n++, title: 'Set sleeves',
        detail: 'Pin sleeve cap to armhole, matching center cap to shoulder seam. Ease cap to fit. Stretch stitch or serge. Press toward sleeve.',
      });
      steps.push({
        step: n++, title: 'Sew side and sleeve seams',
        detail: 'Sew front to back at side seams continuously from hem through underarm to sleeve hem. Stretch stitch or serge. Press toward back.',
      });
    }

    steps.push({
      step: n++, title: 'Attach sleeve cuffs',
      detail: 'Fold each cuff in half widthwise (WST). Divide cuff and sleeve opening into quarters. Sew cuff to sleeve opening (RST), stretching cuff to match. Stretch stitch or serge. Press SA up into sleeve.',
    });
    steps.push({
      step: n++, title: 'Attach waistband',
      detail: 'Fold waistband in half lengthwise (WST). Divide into quarters, pin to body hem (RST). Stretch stitch or serge, stretching band to fit. Press SA up into body.',
    });
    steps.push({
      step: n++, title: 'Finish',
      detail: 'Press with damp cloth on low heat. Rib trim should lay flat. Try on and check sleeve and body length.',
    });

    return steps;
  },
};
