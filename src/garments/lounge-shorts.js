// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Lounge Shorts — beginner woven or knit casual shorts.
 * Elastic casing waistband. Straight leg. No fly. No fly.
 * Works in cotton jersey, modal, seersucker, gauze, and lightweight wovens.
 * All measurements in inches. Seam allowance computed by the engine.
 */

import {
  crotchCurvePoints, sampleBezier, offsetPolygon, polyToPath,
  fmtInches, edgeAngle, insetCrotchBezier, buildSideSeamPocketBag,
} from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

export default {
  id: 'lounge-shorts',
  name: 'Lounge Shorts',
  category: 'lower',
  difficulty: 'beginner',
  priceTier: 'simple',
  measurements: ['waist', 'hip', 'rise', 'inseam'],
  measurementDefaults: { inseam: 6 },

  options: {
    ease: {
      type: 'select', label: 'Fit',
      values: [
        { value: 'relaxed',  label: 'Relaxed (+4″)', reference: 'classic, comfy' },
        { value: 'generous', label: 'Generous (+6″)', reference: 'extra roomy' },
      ],
      default: 'relaxed',
    },
    fabric: {
      type: 'select', label: 'Fabric type',
      values: [
        { value: 'knit',  label: 'Knit (jersey, modal, waffle)', reference: '3/8″ SA, stretch stitch' },
        { value: 'woven', label: 'Woven (seersucker, gauze, linen)', reference: '½″ SA, straight stitch' },
      ],
      default: 'woven',
    },
    inseam: {
      type: 'select', label: 'Inseam length',
      values: [
        { value: '3', label: '3″ (very short / boxy)' },
        { value: '5', label: '5″ (short)' },
        { value: '6', label: '6″ (mid-thigh, most popular)' },
        { value: '8', label: '8″ (longer / modest)' },
      ],
      default: '6',
    },
    pockets: {
      type: 'select', label: 'Side pockets',
      values: [
        { value: 'none',      label: 'None' },
        { value: 'side-seam', label: 'Side-seam bag ×2', reference: 'hidden, clean' },
      ],
      default: 'none',
    },
    elasticWidth: {
      type: 'select', label: 'Elastic width',
      values: [
        { value: 0.75, label: '¾″ elastic' },
        { value: 1,    label: '1″ elastic' },
      ],
      default: 1,
    },
    drawstring: {
      type: 'select', label: 'Drawstring',
      values: [
        { value: 'yes', label: 'Yes' },
        { value: 'no',  label: 'No (elastic only)' },
      ],
      default: 'no',
    },
    sa: {
      type: 'select', label: 'Seam allowance',
      values: [
        { value: 0.375, label: '⅜″ (knit)' },
        { value: 0.5,   label: '½″ (woven)' },
      ],
      default: 0.5,
    },
    hem: {
      type: 'select', label: 'Hem allowance',
      values: [
        { value: 0.5,  label: '½″ double-turn (woven)' },
        { value: 0.75, label: '¾″ twin-needle (knit)' },
      ],
      default: 0.5,
    },
  },

  pieces(m, opts) {
    const sa       = parseFloat(opts.sa)  || 0.5;
    const hem      = parseFloat(opts.hem) || 0.5;
    const easeVal  = opts.ease === 'generous' ? 6 : 4;
    const easeFront = easeVal * 0.2;
    const easeBack  = easeVal * 0.3;
    const elasticW  = parseFloat(opts.elasticWidth) || 1;

    const frontExt = 1.25;
    const backExt  = 2.0;
    const cbRaise  = 0.75;

    const rise   = m.rise || 10;
    const inseam = parseFloat(opts.inseam) || m.inseam || 6;

    let frontW = m.hip / 4 + easeFront + 0.5;
    let backW  = m.hip / 4 + easeBack;

    const H = rise + inseam;
    const shape = { knee: 1.0, hem: 1.0 };

    const pieces = [];

    pieces.push(buildPanel({
      type: 'front', name: 'Front Panel',
      instruction: 'Cut 2 (mirror L & R)',
      width: frontW, height: H, rise, inseam,
      ext: frontExt, cbRaise: 0, sa, hem, isBack: false, shape,
    }));

    pieces.push(buildPanel({
      type: 'back', name: 'Back Panel',
      instruction: `Cut 2 (mirror L & R) · CB raised ${fmtInches(cbRaise)}`,
      width: backW, height: H, rise, inseam,
      ext: backExt, cbRaise, sa, hem, isBack: true, shape,
    }));

    // ── Waistband casing ──────────────────────────────────────────────────────
    const wbCircumference = m.waist + 2;
    const wbCut = (elasticW + 0.75) * 2;
    pieces.push({
      id: 'waistband',
      name: 'Waistband Casing',
      instruction: `Cut 1 · ${fmtInches(wbCircumference)} long × ${fmtInches(wbCut)} wide · Gather short opening to fit band before attaching`,
      type: 'rectangle',
      dimensions: { length: wbCircumference, width: wbCut },
      sa,
    });

    // ── Side seam pocket bags ─────────────────────────────────────────────────
    if (opts.pockets === 'side-seam') {
      pieces.push(buildSideSeamPocketBag({
        bagWidth: 6, bagHeight: 7, sa,
        instruction: `Cut 4 (2 per side) · ${fmtInches(6)} wide × ${fmtInches(7)} deep · D-shaped · Self or lining fabric · Serge all edges before assembly`,
      }));
    }

    return pieces;
  },

  materials(m, opts) {
    const elasticW = parseFloat(opts.elasticWidth) || 1;
    const elasticLabel = { 0.75: '¾″', 1: '1″' }[elasticW] || '1″';
    const rise   = m.rise  || 10;
    const inseam = parseFloat(opts.inseam) || 6;
    const yards  = Math.ceil(((rise + inseam + 2) * 2 / 36 + 0.25) * 4) / 4;

    const notions = [
      { ref: 'elastic-1', quantity: `${Math.round(m.waist * 0.85)}″ of ${elasticLabel} elastic` },
    ];
    if (opts.drawstring === 'yes') {
      notions.push({ name: '¼″ cord', quantity: `${Math.round(m.waist + 16)}″` });
    }

    const fabricOptions = opts.fabric === 'knit'
      ? ['knit-jersey', 'cotton-modal', 'cotton-waffle']
      : ['cotton-seersucker', 'cotton-gauze', 'linen', 'cotton-lawn'];

    return buildMaterialsSpec({
      fabrics: fabricOptions,
      notions,
      thread: 'poly-all',
      needle: opts.fabric === 'knit' ? 'ballpoint-80' : 'universal-80',
      stitches: opts.fabric === 'knit' ? ['stretch', 'overlock'] : ['straight-2.5', 'topstitch'],
      notes: [
        `Fabric: approximately ${yards} yard(s) at 44″ wide.`,
        'Pre-wash to prevent shrinkage.',
        opts.fabric === 'knit'
          ? 'Use a ballpoint needle and stretch stitch (or serger) for all seams.'
          : 'Finish raw edges with a serger, zigzag, or French seams.',
      ],
    });
  },

  instructions(m, opts) {
    const steps = [];
    let n = 1;
    const sa = parseFloat(opts.sa) || 0.5;
    const saLabel = sa === 0.375 ? '⅜″' : '½″';
    const hemLabel = parseFloat(opts.hem) === 0.75 ? '¾″' : '½″';
    const isKnit = opts.fabric === 'knit';
    const seam = `${saLabel} seam${isKnit ? ' (stretch stitch or serger)' : ''}`;

    if (opts.pockets === 'side-seam') {
      steps.push({
        step: n++, title: 'Prepare side-seam pockets',
        detail: 'Serge or finish all edges of each pocket bag. Pin one pocket bag to the front panel and one to the back panel at the side seam, at hip level. Baste to the side seam edge.',
      });
    }

    steps.push({
      step: n++, title: 'Sew center front seam',
      detail: `Join the two front panels at the center front with a ${seam}. Clip the curve. {press} open.`,
    });

    steps.push({
      step: n++, title: 'Sew center back seam',
      detail: `Join the two back panels at the center back with a ${seam}. Clip the curve. {press} open.`,
    });

    steps.push({
      step: n++, title: 'Sew side seams',
      detail: opts.pockets === 'side-seam'
        ? `Sew the side seams above and below the pocket opening. Sew around the pocket bags to join them. {press} the seam open above and below the pocket; press pocket bags toward the front.`
        : `Join front to back at both side seams. {press} open.`,
    });

    steps.push({
      step: n++, title: 'Sew inseam',
      detail: `Sew the inseam from one hem to the other in one continuous pass through the crotch. Clip the crotch curve. {press} toward the back.`,
    });

    steps.push({
      step: n++, title: 'Attach waistband casing',
      detail: `Fold the waistband in half lengthwise, wrong sides together. Pin the raw edge to the waist of the shorts, right sides together. Sew with a ${saLabel} seam. Fold the casing to the inside. {press}.${opts.drawstring === 'yes' ? ' Make two buttonholes at center front before closing the casing.' : ''} {topstitch} close to the lower edge of the casing, leaving a 3″ opening for the elastic.`,
    });

    steps.push({
      step: n++, title: 'Insert elastic',
      detail: opts.drawstring === 'yes'
        ? 'Thread elastic through the back half of the casing. Thread drawstring through the front. Join elastic ends. Close the casing opening.'
        : 'Thread elastic through the casing. Overlap ends by 1″ and zigzag. Close the opening.',
    });

    steps.push({
      step: n++, title: 'Hem the legs',
      detail: isKnit
        ? `Fold under ${hemLabel} and sew with a twin needle or cover stitch.`
        : `Fold under ¼″, then another ${hemLabel}. {press}. {topstitch} close to the inner fold.`,
    });

    return steps;
  },
};


// ── Panel builder ─────────────────────────────────────────────────────────────
function buildPanel({ type, name, instruction, width, height, rise, inseam, ext, cbRaise, sa, hem, isBack, shape }) {
  const ccp      = crotchCurvePoints(0, 0, rise, ext, isBack, cbRaise);
  const curvePts = sampleBezier(ccp.p0, ccp.p1, ccp.p2, ccp.p3, 96);

  const kneeY       = rise + inseam * 0.5;
  const kneeW       = width * shape.knee;
  const hemW        = width * shape.hem;
  const kneeInward  = (width - kneeW) * 0.5;
  const hemInward   = (width - hemW)  * 0.5;
  const sideKneeX   =  width - kneeInward;
  const sideHemX    =  width - hemInward;
  const inseamKneeX = -ext  + kneeInward;
  const inseamHemX  = -ext  + hemInward;

  const poly = [];
  poly.push({ x: 0,           y: isBack ? -cbRaise : 0 });
  poly.push({ x: width,       y: 0 });
  poly.push({ x: sideKneeX,   y: kneeY });
  poly.push({ x: sideHemX,    y: height });
  poly.push({ x: inseamHemX,  y: height });
  poly.push({ x: inseamKneeX, y: kneeY });
  poly.push({ x: -ext,        y: rise });
  for (let i = curvePts.length - 2; i >= 1; i--) poly.push({ ...curvePts[i], curve: true });
  if (isBack && cbRaise > 0) poly.push({ x: 0, y: cbRaise });

  const saPoly = offsetPolygon(poly, (i, a, b) => {
    if (Math.abs(a.y - height) < 0.5 && Math.abs(b.y - height) < 0.5) return -hem;
    return -sa;
  });

  const notches = [
    { x: width,       y: rise * 0.5, angle: edgeAngle({ x: width, y: 0 }, { x: sideKneeX, y: kneeY }) },
    { x: -ext,        y: rise,       angle: edgeAngle({ x: inseamKneeX, y: kneeY }, { x: -ext, y: rise }) },
  ];

  return {
    id: type, name, instruction,
    polygon: poly, saPolygon: saPoly,
    path: polyToPath(poly), saPath: polyToPath(saPoly),
    dimensions: [
      { label: fmtInches(width),              x1: 0,     y1: -0.5,  x2: width, y2: -0.5, type: 'h' },
      { label: fmtInches(rise)   + ' rise',   x: width + 1.1, y1: 0,    y2: rise,        type: 'v' },
      { label: fmtInches(inseam) + ' inseam', x: width + 1.1, y1: rise, y2: height,      type: 'v' },
    ],
    width, height, rise, inseam, ext, cbRaise, sa, hem, isBack,
    notches, crotchBezier: ccp,
    crotchBezierSA: insetCrotchBezier(ccp, sa), type: 'panel',
  };
}
