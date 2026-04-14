// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Turtleneck — knit top with tall stand collar.
 * Same upper-body block as tee.js (crew neckline only).
 * Collar replaces the neckband: tall rectangle cut double, folded down.
 * Full turtle (10-12″ cut), mock neck (6-8″ cut), funnel (4″ cut).
 * All measurements in inches. Seam allowance computed by the engine.
 */

import {
  armholeCurve, shoulderSlope, necklineCurve, sleeveCapCurve, shoulderDropFromWidth,
  armholeDepthFromChest, neckWidthFromCircumference, UPPER_EASE,
  validateSleeveSeams,
} from '../engine/upper-body.js';
import { sampleBezier, fmtInches, edgeAngle, ptAtArcLen } from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

const SLEEVE_LENGTHS = { short: 8, long: 25 };

// Collar cut heights (folded double; finished = cut / 2)
const COLLAR_HEIGHTS = { full: 11, mock: 7, funnel: 4 };

export default {
  id: 'turtleneck',
  name: 'Turtleneck',
  category: 'upper',
  difficulty: 'beginner',
  priceTier: 'simple',
  measurements: ['chest', 'shoulder', 'neck', 'sleeveLength', 'bicep', 'torsoLength'],
  measurementDefaults: { sleeveLength: 25 },

  options: {
    collarStyle: {
      type: 'select', label: 'Collar style',
      values: [
        { value: 'full',   label: 'Full turtleneck (10-12″ cut, folds over)',   reference: 'classic, cozy' },
        { value: 'mock',   label: 'Mock neck (6-8″ cut, does not fold over)',   reference: 'modern, clean' },
        { value: 'funnel', label: 'Funnel neck (4″ cut, structured/open top)', reference: 'fashion-forward' },
      ],
      default: 'full',
    },
    fit: {
      type: 'select', label: 'Fit',
      values: [
        { value: 'fitted',   label: 'Slim / fitted (+2″)',  reference: 'fitted, tailored' },
        { value: 'standard', label: 'Regular (+4″)',        reference: 'classic, off-the-rack' },
        { value: 'relaxed',  label: 'Relaxed (+6″)',        reference: 'cozy, layered look' },
      ],
      default: 'standard',
    },
    sleeveStyle: {
      type: 'select', label: 'Sleeve length',
      values: [
        { value: 'short', label: 'Short (8″)' },
        { value: 'long',  label: 'Long (25″)' },
      ],
      default: 'long',
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
    const sa  = parseFloat(opts.sa)  || 0.375;
    const hem = parseFloat(opts.hem) || 0.75;

    const totalEase = UPPER_EASE[opts.fit] ?? 4;
    const panelW    = (m.chest + totalEase) / 4;

    const halfShoulder = m.shoulder / 2;
    const neckW        = neckWidthFromCircumference(m.neck);
    const shoulderW    = halfShoulder - neckW;
    const slopeDrop    = shoulderDropFromWidth(shoulderW);
    const shoulderPtX  = halfShoulder;

    const armholeY    = armholeDepthFromChest(m.chest, 'standard');
    const armholeDepth = armholeY - slopeDrop;
    const chestDepth   = panelW - shoulderPtX;

    // Crew neckline only
    const neckDepthFront = neckW + 0.5;
    const neckDepthBack  = neckW / 3;

    const torsoLen = m.torsoLength;
    const slvLength = SLEEVE_LENGTHS[opts.sleeveStyle] ?? m.sleeveLength ?? 25;

    // ── Curve helpers ─────────────────────────────────────────────────────────
    function curvePts(cp, steps = 12) {
      return sampleBezier(cp.p0, cp.p1, cp.p2, cp.p3, steps).map(p => ({ ...p, curve: true }));
    }
    function polyPath(poly) {
      let d = `M ${poly[0].x.toFixed(2)} ${poly[0].y.toFixed(2)}`;
      for (let i = 1; i < poly.length; i++) d += ` L ${poly[i].x.toFixed(2)} ${poly[i].y.toFixed(2)}`;
      return d + ' Z';
    }

    // ── Front bodice ──────────────────────────────────────────────────────────
    const frontNeckPts   = curvePts(necklineCurve(neckW, neckDepthFront, 'crew'));
    const frontShoulderPts = curvePts(shoulderSlope(shoulderW, slopeDrop));
    const frontArmholePts  = curvePts(armholeCurve(shoulderW, chestDepth, armholeDepth, false));

    const frontPoly = [];
    for (const p of [...frontNeckPts].reverse()) frontPoly.push({ ...p, x: neckW - p.x });
    delete frontPoly[0].curve;
    delete frontPoly[frontNeckPts.length - 1].curve;
    for (let i = 1; i < frontShoulderPts.length; i++) frontPoly.push({ ...frontShoulderPts[i], x: neckW + frontShoulderPts[i].x });
    for (let i = 1; i < frontArmholePts.length; i++) frontPoly.push({ ...frontArmholePts[i], x: shoulderPtX + frontArmholePts[i].x, y: slopeDrop + frontArmholePts[i].y });
    frontPoly.push({ x: panelW, y: torsoLen });
    frontPoly.push({ x: 0,      y: torsoLen });
    frontPoly.push({ x: 0,      y: neckDepthFront });

    // ── Back bodice ───────────────────────────────────────────────────────────
    const backNeckPts   = curvePts(necklineCurve(neckW, neckDepthBack, 'crew'));
    const backArmholePts = curvePts(armholeCurve(shoulderW, chestDepth, armholeDepth, true));

    const backPoly = [];
    for (const p of [...backNeckPts].reverse()) backPoly.push({ ...p, x: neckW - p.x });
    delete backPoly[0].curve;
    delete backPoly[backNeckPts.length - 1].curve;
    for (let i = 1; i < frontShoulderPts.length; i++) backPoly.push({ ...frontShoulderPts[i], x: neckW + frontShoulderPts[i].x });
    for (let i = 1; i < backArmholePts.length; i++) backPoly.push({ ...backArmholePts[i], x: shoulderPtX + backArmholePts[i].x, y: slopeDrop + backArmholePts[i].y });
    backPoly.push({ x: panelW, y: torsoLen });
    backPoly.push({ x: 0,      y: torsoLen });
    backPoly.push({ x: 0,      y: neckDepthBack });

    // ── Sleeve ────────────────────────────────────────────────────────────────
    const slvFullWidth = m.bicep + 2;
    const capHeight    = armholeDepth * 0.60;
    const capCp        = sleeveCapCurve(m.bicep, capHeight, slvFullWidth);
    const capSampled   = curvePts(capCp, 32);
    const { capArc, armholeArc, capEase } = validateSleeveSeams('turtleneck', capSampled, frontArmholePts, backArmholePts);

    const sleevePoly = [];
    for (const p of capSampled) sleevePoly.push({ ...p, y: p.y + capHeight });
    delete sleevePoly[0].curve;
    delete sleevePoly[capSampled.length - 1].curve;
    sleevePoly.push({ x: slvFullWidth, y: capHeight + slvLength });
    sleevePoly.push({ x: 0,           y: capHeight + slvLength });

    // ── Collar ────────────────────────────────────────────────────────────────
    const collarH   = COLLAR_HEIGHTS[opts.collarStyle] ?? 11;
    // Length = neck circumference × 0.87 so collar lies flat when stretched
    const collarLen = Math.round(m.neck * 0.87 * 4) / 4;
    const foldNote  = opts.collarStyle === 'funnel'
      ? 'No fold — stands up at neck'
      : opts.collarStyle === 'mock'
      ? 'Does not fold over — stands up against chin'
      : 'Fold down over itself after attaching';

    const capEaseNote = `Cap: ${fmtInches(capArc)}, Armhole: ${fmtInches(armholeArc)}, Ease: ${fmtInches(capEase)}`;

    // ── Bounding boxes ────────────────────────────────────────────────────────
    function bbW(poly) { const xs = poly.map(p => p.x); return Math.max(...xs) - Math.min(...xs); }
    function bbH(poly) { const ys = poly.map(p => p.y); return Math.max(...ys) - Math.min(...ys); }

    return [
      {
        id: 'bodice-front',
        name: 'Front Bodice',
        instruction: 'Cut 1 on fold · Crew neckline',
        type: 'bodice',
        polygon: frontPoly, path: polyPath(frontPoly),
        width: bbW(frontPoly), height: bbH(frontPoly),
        sa, hem, isBack: false,
        dims: [
          { label: fmtInches(panelW) + ' half width', x1: 0, y1: -0.5, x2: panelW, y2: -0.5, type: 'h' },
          { label: fmtInches(torsoLen) + ' length', x: panelW + 1, y1: 0, y2: torsoLen, type: 'v' },
        ],
      },
      {
        id: 'bodice-back',
        name: 'Back Bodice',
        instruction: 'Cut 1 on fold · Crew neckline',
        type: 'bodice',
        polygon: backPoly, path: polyPath(backPoly),
        width: bbW(backPoly), height: bbH(backPoly),
        sa, hem, isBack: true,
        dims: [
          { label: fmtInches(panelW) + ' half width', x1: 0, y1: -0.5, x2: panelW, y2: -0.5, type: 'h' },
          { label: fmtInches(torsoLen) + ' length', x: panelW + 1, y1: 0, y2: torsoLen, type: 'v' },
        ],
      },
      {
        id: 'sleeve',
        name: 'Sleeve',
        instruction: `Cut 2 (mirror L & R) · ${opts.sleeveStyle === 'long' ? 'Long sleeve' : 'Short sleeve'} · ${capEaseNote}`,
        type: 'sleeve',
        polygon: sleevePoly, path: polyPath(sleevePoly),
        width: bbW(sleevePoly), height: bbH(sleevePoly),
        capHeight, sleeveLength: slvLength, sleeveWidth: slvFullWidth,
        sa, hem,
        dims: [
          { label: fmtInches(slvFullWidth) + ' underarm', x1: 0, y1: capHeight + 0.4, x2: slvFullWidth, y2: capHeight + 0.4, type: 'h' },
          { label: fmtInches(slvLength) + ' length', x: slvFullWidth + 1, y1: capHeight, y2: capHeight + slvLength, type: 'v' },
        ],
      },
      {
        id: 'collar',
        name: 'Collar',
        instruction: `Cut 1 from rib knit on fold · ${fmtInches(collarLen)} long × ${fmtInches(collarH)} cut (${fmtInches(collarH / 2)} finished) · 87% of neck circumference · ${foldNote}`,
        type: 'rectangle',
        dimensions: { length: collarLen, width: collarH },
        sa,
        dims: [
          { label: fmtInches(collarLen) + ' length', x1: 0, y1: -0.5, x2: collarLen, y2: -0.5, type: 'h' },
          { label: fmtInches(collarH) + ' cut height', x: collarLen + 0.6, y1: 0, y2: collarH, type: 'v' },
        ],
      },
    ];
  },

  materials(m, opts) {
    const collarH = COLLAR_HEIGHTS[opts.collarStyle] ?? 11;
    return buildMaterialsSpec({
      fabrics: ['knit-rib', 'cotton-jersey', 'merino-jersey', 'thermal-knit'],
      notions: [
        { name: 'Rib knit (collar)', quantity: `${fmtInches(collarH + 1)} × ${fmtInches(Math.round(m.neck * 0.9))} — must have excellent recovery` },
      ],
      thread: 'poly-all',
      needle: 'ballpoint-90',
      stitches: ['stretch', 'overlock', 'coverstitch'],
      notes: [
        'Use a ballpoint (jersey) needle. A straight stitch will pop at seams when stretched.',
        'Collar fabric must have strong horizontal recovery. Waffle knit, 2×2 rib, or interlock work well.',
        opts.collarStyle === 'full'
          ? 'Full turtleneck: attach collar with a seam at the lower edge, then fold the collar down to cover the seam. The seam is hidden inside the fold.'
          : opts.collarStyle === 'mock'
          ? 'Mock neck: attach and finish the top edge with a serger or fold under ⅜″ and {topstitch}. The collar stands up and does not fold over.'
          : 'Funnel neck: attach to neckline with a seam. Finish the raw top edge and allow it to spread open naturally.',
        'Stretch the collar to fit the neckline opening as you sew — do not stretch the bodice.',
        'Minimum 25% stretch required in collar fabric. Test: fold in half and pull — it should return to shape.',
      ],
    });
  },

  instructions(m, opts) {
    const steps = [];
    let n = 1;
    const isFull = opts.collarStyle === 'full';

    steps.push({ step: n++, title: 'Sew shoulder seams', detail: 'Join front to back at shoulders {RST}. Stretch stitch or {serge}. {press} toward back.' });

    steps.push({
      step: n++, title: 'Prepare and attach collar',
      detail: isFull
        ? 'Fold collar in half lengthwise, wrong sides together. Divide collar and neck opening into quarters, pin at quarters. Sew collar to neckline {RST}, raw edges together, stretching collar to fit. Stretch stitch or {serge}. Press SA toward bodice. The fold of the collar now faces up. Fold the collar back down over the seam. The seam is hidden inside the fold.'
        : opts.collarStyle === 'mock'
        ? 'Fold collar in half lengthwise {WST}. Divide into quarters. Sew to neckline {RST}, stretching to fit. Serge or stretch stitch. Fold the top raw edge of the collar under ⅜″ and {topstitch} to finish, or serge the edge cleanly. The collar stands up.'
        : 'Sew collar short ends together to form a ring. Divide into quarters. Sew to neckline {RST}, stretching to fit. Serge or stretch stitch. Finish the top raw edge by folding under ⅜″ and {topstitch}, or bind with a narrow strip. The funnel opens outward.',
    });

    steps.push({ step: n++, title: 'Set sleeves', detail: 'Divide sleeve cap and armhole into quarters, pin at quarters. Sew sleeve into armhole {RST}, easing cap to fit. Stretch stitch. {serge} SA. {press} toward sleeve.' });

    steps.push({ step: n++, title: 'Sew side and sleeve seams', detail: 'Sew front to back at side seams and sleeves in one continuous seam from hem to sleeve hem. Stretch stitch or {serge}. {press} toward back.' });

    if (opts.sleeveStyle === 'long') {
      steps.push({ step: n++, title: 'Hem sleeves', detail: 'Fold under ¾″. Twin needle from RS, or fold under raw edge and {zigzag}.' });
    } else {
      steps.push({ step: n++, title: 'Hem sleeves', detail: 'Fold under ¾″. Twin needle from RS in one pass.' });
    }

    steps.push({ step: n++, title: 'Hem body', detail: `Fold hem up ${fmtInches(parseFloat(opts.hem))}. {press}. Twin needle from RS or fold under raw edge and {zigzag} stitch.` });

    return steps;
  },

  variants: [
    { id: 'mock-neck', name: 'Mock Neck', defaults: { collarStyle: 'mock', fit: 'standard' } },
  ],
};
