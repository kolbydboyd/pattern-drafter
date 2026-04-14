// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Kids T-Shirt — children's upper body knit garment (sizes 2T–14).
 * Adapted from tee.js with child-appropriate ease (standard +2", relaxed +3"),
 * proportional defaults for a size 6/7 child, and simplified options.
 * Pieces: front bodice, back bodice, sleeve ×2, neckband rib strip.
 */

import {
  armholeCurve, shoulderSlope, necklineCurve, sleeveCapCurve, shoulderDropFromWidth,
  armholeDepthFromChest, neckWidthFromCircumference, validateSleeveSeams,
} from '../engine/upper-body.js';
import { sampleBezier, fmtInches, edgeAngle, arcLength, ptAtArcLen, dist } from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

// ── Kids ease table (less than adult UPPER_EASE) ─────────────────────────────
const KIDS_UPPER_EASE = { standard: 2, relaxed: 3 };

// ── Sleeve length presets (shorter than adult) ────────────────────────────────
const SLEEVE_LENGTHS = { short: 5, long: 14 };

// ── Neckline depth by style ───────────────────────────────────────────────────
const NECK_DEPTH_FRONT = { scoop: 4.5 };

export default {
  id: 'kids-tee',
  name: 'Kids T-Shirt',
  category: 'upper',
  audience: 'kids',
  difficulty: 'beginner',
  priceTier: 'simple',
  measurements: ['chest', 'shoulder', 'neck', 'sleeveLength', 'bicep', 'torsoLength'],
  measurementDefaults: {
    chest: 25, shoulder: 11.5, neck: 11.5, sleeveLength: 15, bicep: 9, torsoLength: 13,
  },

  options: {
    neckline: {
      type: 'select', label: 'Neckline',
      values: [
        { value: 'crew',  label: 'Crew neck' },
        { value: 'scoop', label: 'Scoop neck' },
      ],
      default: 'crew',
    },
    fit: {
      type: 'select', label: 'Fit',
      values: [
        { value: 'standard', label: 'Standard (+2″)',  reference: 'classic, everyday' },
        { value: 'relaxed',  label: 'Relaxed (+3″)',   reference: 'comfy, boxy'       },
      ],
      default: 'standard',
    },
    sleeveStyle: {
      type: 'select', label: 'Sleeve length',
      values: [
        { value: 'short', label: 'Short (5″)' },
        { value: 'long',  label: 'Long (14″)' },
      ],
      default: 'short',
    },
    hemStyle: {
      type: 'select', label: 'Hem style',
      values: [
        { value: 'straight',  label: 'Straight' },
        { value: 'shirttail', label: 'Shirttail curve' },
      ],
      default: 'straight',
    },
    sa: {
      type: 'select', label: 'Seam allowance',
      values: [
        { value: 0.375, label: '⅜″' },
        { value: 0.5,   label: '½″' },
      ],
      default: 0.375,
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

    // ── Ease + panel widths ──────────────────────────────────────────────────
    const totalEase = KIDS_UPPER_EASE[opts.fit] ?? 2;
    const panelW    = (m.chest + totalEase) / 4;

    // ── Shoulder geometry ─────────────────────────────────────────────────────
    const halfShoulder = m.shoulder / 2;
    const neckW        = neckWidthFromCircumference(m.neck);
    const shoulderW    = halfShoulder - neckW;
    const slopeDrop    = shoulderDropFromWidth(shoulderW);
    const shoulderPtX  = halfShoulder;

    // ── Armhole geometry ──────────────────────────────────────────────────────
    const armholeStyle = 'standard';
    const armholeY     = armholeDepthFromChest(m.chest, armholeStyle);
    const armholeDepth = armholeY - slopeDrop;
    const chestDepth   = panelW - shoulderPtX;

    // ── Neckline ──────────────────────────────────────────────────────────────
    const neckKey        = opts.neckline;
    const neckDepthBack  = neckW / 3;
    const neckDepthFront = neckKey === 'crew'
      ? neckW + 0.5
      : (NECK_DEPTH_FRONT[neckKey] ?? neckW + 0.5);
    const neckStyleFront = neckKey === 'scoop' ? 'scoop' : 'crew';
    const neckStyleBack  = 'crew';

    const torsoLen  = m.torsoLength;
    const slvLength = SLEEVE_LENGTHS[opts.sleeveStyle] ?? m.sleeveLength ?? 5;

    function curveToPoints(cp, steps = 12) {
      return sampleBezier(cp.p0, cp.p1, cp.p2, cp.p3, steps).map(p => ({ ...p, curve: true }));
    }

    // ── FRONT BODICE ──────────────────────────────────────────────────────────
    const frontNeckPts    = curveToPoints(necklineCurve(neckW, neckDepthFront, neckStyleFront));
    const frontShoulderPts = curveToPoints(shoulderSlope(shoulderW, slopeDrop));
    const frontArmholePts  = curveToPoints(armholeCurve(shoulderW, chestDepth, armholeDepth, false));
    const backArmholePts   = curveToPoints(armholeCurve(shoulderW, chestDepth, armholeDepth, true));
    const backNeckPts      = curveToPoints(necklineCurve(neckW, neckDepthBack, neckStyleBack));

    const frontPoly = [];
    for (const p of [...frontNeckPts].reverse()) {
      frontPoly.push({ ...p, x: neckW - p.x });
    }
    delete frontPoly[0].curve;
    delete frontPoly[frontNeckPts.length - 1].curve;
    for (let i = 1; i < frontShoulderPts.length; i++) {
      frontPoly.push({ ...frontShoulderPts[i], x: neckW + frontShoulderPts[i].x });
    }
    for (let i = 1; i < frontArmholePts.length; i++) {
      frontPoly.push({ ...frontArmholePts[i], x: shoulderPtX + frontArmholePts[i].x, y: slopeDrop + frontArmholePts[i].y });
    }
    frontPoly.push({ x: panelW, y: torsoLen });
    if (opts.hemStyle === 'shirttail') {
      frontPoly.push({ x: neckW * 0.5, y: torsoLen + 0.5 });
    }
    frontPoly.push({ x: 0, y: torsoLen });
    frontPoly.push({ x: 0, y: neckDepthFront });

    // ── BACK BODICE ───────────────────────────────────────────────────────────
    const backPoly = [];
    for (const p of [...backNeckPts].reverse()) {
      backPoly.push({ ...p, x: neckW - p.x });
    }
    delete backPoly[0].curve;
    delete backPoly[backNeckPts.length - 1].curve;
    for (let i = 1; i < frontShoulderPts.length; i++) {
      backPoly.push({ ...frontShoulderPts[i], x: neckW + frontShoulderPts[i].x });
    }
    for (let i = 1; i < backArmholePts.length; i++) {
      backPoly.push({ ...backArmholePts[i], x: shoulderPtX + backArmholePts[i].x, y: slopeDrop + backArmholePts[i].y });
    }
    backPoly.push({ x: panelW, y: torsoLen });
    if (opts.hemStyle === 'shirttail') {
      backPoly.push({ x: neckW * 0.5, y: torsoLen + 1 });
    }
    backPoly.push({ x: 0, y: torsoLen });
    backPoly.push({ x: 0, y: neckDepthBack });

    // ── SLEEVE ────────────────────────────────────────────────────────────────
    // Kids sleeves get slightly more armhole ease for free movement
    const slvFullWidth = m.bicep + 2.5;
    const capHeight    = armholeDepth * 0.60;
    const capCp        = sleeveCapCurve(m.bicep, capHeight, slvFullWidth);
    const capPts       = sampleBezier(capCp.p0, capCp.p1, capCp.p2, capCp.p3, 32)
      .map(p => ({ ...p, curve: true }));

    const sleevePoly = [];
    for (const p of capPts) {
      sleevePoly.push({ ...p, y: p.y + capHeight });
    }
    delete sleevePoly[0].curve;
    delete sleevePoly[capPts.length - 1].curve;
    sleevePoly.push({ x: slvFullWidth, y: capHeight + slvLength });
    sleevePoly.push({ x: 0,            y: capHeight + slvLength });

    // ── Dedup ─────────────────────────────────────────────────────────────────
    function dedupPoly(poly) {
      const out = [poly[0]];
      for (let i = 1; i < poly.length; i++) {
        const prev = out[out.length - 1];
        const dx = poly[i].x - prev.x, dy = poly[i].y - prev.y;
        if (Math.sqrt(dx * dx + dy * dy) >= 0.05) out.push(poly[i]);
      }
      return out;
    }
    frontPoly.splice(0, frontPoly.length, ...dedupPoly(frontPoly));
    backPoly.splice(0, backPoly.length, ...dedupPoly(backPoly));
    sleevePoly.splice(0, sleevePoly.length, ...dedupPoly(sleevePoly));

    // ── Validate cap seam ─────────────────────────────────────────────────────
    const { capEase } = validateSleeveSeams('kids-tee', capPts, frontArmholePts, backArmholePts);
    const capEaseNote = `Cap ease: ${fmtInches(capEase)}`;

    // ── Neckband ──────────────────────────────────────────────────────────────
    const nbLength = m.neck * 0.85;
    const nbWidth  = 2.5; // 1.25″ finished, slightly narrower than adult

    // ── Bounding boxes ────────────────────────────────────────────────────────
    function bbox(poly) {
      const xs = poly.map(p => p.x), ys = poly.map(p => p.y);
      return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) };
    }
    const frontBB = bbox(frontPoly);
    const backBB  = bbox(backPoly);
    const slvBB   = bbox(sleevePoly);

    // ── Per-edge seam allowances ──────────────────────────────────────────────
    const nNeckPts     = frontNeckPts.length;
    const nShoulderPts = frontShoulderPts.length - 1;
    const nArmholePts  = frontArmholePts.length - 1;

    function buildBodyEA(nNeck, nShoulder, nArm, hasShirttail) {
      const ea = [];
      for (let i = 0; i < nNeck - 1; i++)  ea.push({ sa: 0.375, label: 'Neckline' });
      for (let i = 0; i < nShoulder; i++)   ea.push({ sa: 0.5,   label: 'Shoulder' });
      for (let i = 0; i < nArm; i++)        ea.push({ sa: 0.375, label: 'Armhole' });
      ea.push({ sa: 0.5, label: 'Side seam' });
      if (hasShirttail) ea.push({ sa: hem, label: 'Hem' });
      ea.push({ sa: hem, label: 'Hem' });
      ea.push({ sa: 0,   label: 'Fold' });
      return ea;
    }
    const hasShirttail        = opts.hemStyle === 'shirttail';
    const frontEdgeAllowances = buildBodyEA(nNeckPts, nShoulderPts, nArmholePts, hasShirttail);
    const backEdgeAllowances  = buildBodyEA(nNeckPts, nShoulderPts, backArmholePts.length - 1, hasShirttail);
    const nCapPts = capPts.length;
    const sleeveEdgeAllowances = sleevePoly.map((_, i) => {
      if (i < nCapPts - 1)  return { sa: 0.375, label: 'Sleeve cap' };
      if (i === nCapPts - 1) return { sa: 0.5,   label: 'Side seam' };
      if (i === nCapPts)     return { sa: hem,    label: 'Hem' };
      return { sa: 0.5, label: 'Side seam' };
    });

    return [
      {
        id: 'bodice-front',
        name: 'Front Bodice',
        instruction: 'Cut 1 on fold (CF) · Place fold at CF edge',
        type: 'bodice',
        polygon: frontPoly,
        width: frontBB.maxX - frontBB.minX,
        height: frontBB.maxY - frontBB.minY,
        sa, hem,
        edgeAllowances: frontEdgeAllowances,
        dims: [
          { label: fmtInches(panelW) + ' half width', x1: 0, y1: -0.5, x2: panelW, y2: -0.5, type: 'h' },
          { label: fmtInches(torsoLen) + ' length', x: frontBB.maxX + 1, y1: 0, y2: torsoLen, type: 'v' },
        ],
      },
      {
        id: 'bodice-back',
        name: 'Back Bodice',
        instruction: 'Cut 1 on fold (CB) · Place fold at CB edge',
        type: 'bodice',
        polygon: backPoly,
        width: backBB.maxX - backBB.minX,
        height: backBB.maxY - backBB.minY,
        sa, hem,
        edgeAllowances: backEdgeAllowances,
        dims: [
          { label: fmtInches(panelW) + ' half width', x1: 0, y1: -0.5, x2: panelW, y2: -0.5, type: 'h' },
          { label: fmtInches(torsoLen) + ' length', x: backBB.maxX + 1, y1: 0, y2: torsoLen, type: 'v' },
        ],
      },
      {
        id: 'sleeve',
        name: 'Sleeve',
        instruction: `Cut 2 (mirror L & R) · ${opts.sleeveStyle === 'short' ? 'Short sleeve' : 'Long sleeve'} · ${capEaseNote}`,
        type: 'sleeve',
        polygon: sleevePoly,
        width: slvBB.maxX - slvBB.minX,
        height: slvBB.maxY - slvBB.minY,
        capHeight,
        sleeveLength: slvLength,
        sa, hem,
        edgeAllowances: sleeveEdgeAllowances,
        dims: [
          { label: fmtInches(slvFullWidth) + ' underarm', x1: 0, y1: capHeight + 0.4, x2: slvFullWidth, y2: capHeight + 0.4, type: 'h' },
          { label: fmtInches(slvLength) + ' length', x: slvFullWidth + 1, y1: capHeight, y2: capHeight + slvLength, type: 'v' },
        ],
      },
      {
        id: 'neckband',
        name: 'Neckband',
        instruction: `Cut 1 from rib knit on fold · ${fmtInches(nbLength)} long × ${fmtInches(nbWidth)} cut · 85% of neck opening`,
        type: 'rectangle',
        dimensions: { length: nbLength, width: nbWidth },
        sa,
      },
    ];
  },

  materials(m, opts) {
    return buildMaterialsSpec({
      fabrics: ['cotton-jersey', 'rayon-jersey', 'poly-jersey'],
      notions: [
        { name: 'Rib knit', quantity: '0.25 yard', notes: 'For neckband (high recovery stretch)' },
      ],
      thread: 'poly-all',
      needle: 'ballpoint-75',
      stitches: ['stretch', 'overlock', 'coverstitch', 'zigzag-med'],
      notes: [
        'Use a ballpoint (jersey) needle 75/11 for lightweight kids knit fabric',
        'Use a stretch stitch or serger for ALL seams — straight stitch will pop when stretched',
        'Twin needle for hem (RS shows two parallel rows) or fold under and coverstitch',
        'Pre-wash jersey before cutting — cotton knits shrink 3–5% in first wash',
        'Neckband cut at 85% of neck opening so it lies flat without gaping',
        opts.fit === 'relaxed' ? 'Relaxed fit: fabric drapes freely — great for active kids' : '',
      ].filter(Boolean),
    });
  },

  instructions(m, opts) {
    const steps = [];
    let n = 1;
    steps.push({
      step: n++, title: 'Sew shoulder seams',
      detail: 'Join front to back at shoulders {RST}. Stretch stitch or {serge}. {press} toward back.',
    });
    steps.push({
      step: n++, title: 'Attach neckband',
      detail: 'Fold neckband in half lengthwise {WST}, {press}. Divide neckband and neck opening into quarters, pin. Sew neckband to neck opening {RST}, stretching band to fit. {serge} or stretch stitch. {press} SA toward bodice.',
    });
    steps.push({
      step: n++, title: 'Set sleeves',
      detail: 'Divide sleeve cap and armhole into quarters, pin. Sew sleeve into armhole {RST}, easing cap to fit. Stretch stitch. {serge} SA. {press} toward sleeve.',
    });
    steps.push({
      step: n++, title: 'Sew side seams and sleeve seams',
      detail: 'Pin front to back at side seams and sleeve seams in one continuous seam. Stretch stitch or {serge}. {press} toward back.',
    });
    steps.push({
      step: n++, title: 'Hem sleeves',
      detail: 'Fold up ¾″, {press}. Twin needle from RS or {zigzag} stitch.',
    });
    steps.push({
      step: n++, title: 'Hem body',
      detail: `Fold hem up ${fmtInches(parseFloat(opts.hem))}, {press}. Twin needle from RS or {zigzag} stitch.`,
    });
    steps.push({
      step: n++, title: 'Finish',
      detail: '{press} with damp cloth. Try on child. Neckband should sit flat and not gap.',
    });
    return steps;
  },
};
