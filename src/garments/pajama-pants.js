// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Pajama Pants — beginner woven lounge trousers.
 * Elastic + drawstring casing waistband. Straight leg. No fly.
 * Works in flannel, voile, satin, cotton lawn, and other lightweight wovens.
 * All measurements in inches. Seam allowance computed by the engine.
 */

import {
  crotchCurvePoints, sampleBezier, offsetPolygon, polyToPath,
  fmtInches, edgeAngle, insetCrotchBezier, tummyAdjustment,
} from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

// ── Ease presets ─────────────────────────────────────────────────────────────
const EASE = { relaxed: 4, generous: 6 };

export default {
  id: 'pajama-pants',
  name: 'Pajama Pants',
  category: 'lower',
  difficulty: 'beginner',
  priceTier: 'simple',
  measurements: ['waist', 'hip', 'rise', 'inseam'],
  measurementDefaults: { inseam: 30 },

  options: {
    ease: {
      type: 'select', label: 'Fit',
      values: [
        { value: 'relaxed',  label: 'Relaxed (+4″)',  reference: 'classic pajama fit' },
        { value: 'generous', label: 'Generous (+6″)', reference: 'extra roomy, lounge' },
      ],
      default: 'relaxed',
    },
    fabric: {
      type: 'select', label: 'Fabric weight',
      values: [
        { value: 'light',  label: 'Lightweight (voile, lawn, satin)', reference: '2–4 oz/yd²' },
        { value: 'medium', label: 'Medium (flannel, broadcloth)',      reference: '4–6 oz/yd²' },
      ],
      default: 'medium',
    },
    backPocket: {
      type: 'select', label: 'Back patch pocket',
      values: [
        { value: 'none', label: 'None' },
        { value: 'yes',  label: 'Yes (5″ × 5½″ patch pocket)' },
      ],
      default: 'none',
    },
    frenchSeams: {
      type: 'select', label: 'French seams',
      values: [
        { value: 'no',  label: 'No (serged or overcast edges)' },
        { value: 'yes', label: 'Yes (for voile, lawn, satin)', reference: 'clean finish on sheer/slippery fabric' },
      ],
      default: 'no',
    },
    elasticWidth: {
      type: 'select', label: 'Waistband elastic width',
      values: [
        { value: 0.75, label: '¾″ elastic' },
        { value: 1,    label: '1″ elastic (standard)' },
        { value: 1.5,  label: '1½″ elastic (wide)' },
      ],
      default: 1,
    },
    drawstring: {
      type: 'select', label: 'Drawstring',
      values: [
        { value: 'yes', label: 'Yes (exits through buttonholes at CF)' },
        { value: 'no',  label: 'No (elastic only)' },
      ],
      default: 'yes',
    },
    sa: {
      type: 'select', label: 'Seam allowance',
      values: [
        { value: 0.5,   label: '½″' },
        { value: 0.625, label: '⅝″ (standard woven)' },
      ],
      default: 0.625,
    },
    hem: {
      type: 'select', label: 'Hem allowance',
      values: [
        { value: 0.75, label: '¾″ narrow hem' },
        { value: 1,    label: '1″ standard hem' },
        { value: 1.5,  label: '1½″ deep hem' },
      ],
      default: 1,
    },
  },

  pieces(m, opts) {
    const sa        = parseFloat(opts.sa)        || 0.625;
    const hem       = parseFloat(opts.hem)       || 1;
    const easeVal   = EASE[opts.ease]            ?? 4;
    const easeFront = easeVal * 0.2;
    const easeBack  = easeVal * 0.3;
    const elasticW  = parseFloat(opts.elasticWidth) || 1;

    // Simplified crotch extensions per ROADMAP spec
    const frontExt = 1.5;
    const backExt  = 2.5;
    const cbRaise  = 1.0;

    const rise   = m.rise  || 10;
    const inseam = m.inseam || 30;

    let frontW = m.hip / 4 + easeFront + 0.5;
    let backW  = m.hip / 4 + easeBack;

    const H = rise + inseam;
    // Straight leg — no taper
    const shape = { knee: 1.0, hem: 1.0 };

    const pieces = [];
    const tummyAdj = tummyAdjustment(m);

    pieces.push(buildPanel({
      type: 'front', name: 'Front Panel',
      instruction: 'Cut 2 (mirror L & R) · Straight seams — no taper',
      width: frontW, height: H, rise, inseam,
      ext: frontExt, cbRaise: 0, sa, hem, isBack: false, shape, tummyAdj,
    }));

    pieces.push(buildPanel({
      type: 'back', name: 'Back Panel',
      instruction: `Cut 2 (mirror L & R) · CB raised ${fmtInches(cbRaise)}`,
      width: backW, height: H, rise, inseam,
      ext: backExt, cbRaise, sa, hem, isBack: true, shape,
    }));

    // ── Waistband casing ──────────────────────────────────────────────────────
    const wbCircumference = m.waist + 2;
    // Casing cut width: elastic + seam to fold in + hem on bottom = (elasticW + 1) × 2
    const wbCut = (elasticW + 1) * 2;
    pieces.push({
      id: 'waistband',
      name: 'Waistband Casing',
      instruction: `Cut 1 · ${fmtInches(wbCircumference)} long × ${fmtInches(wbCut)} wide · Elastic + drawstring casing · Fold in half, sew to waist · Gather pant opening to fit band before attaching`,
      type: 'rectangle',
      dimensions: { length: wbCircumference, width: wbCut },
      sa,
      dims: [
        { label: fmtInches(wbCircumference) + ' circumference', x1: 0, y1: -0.5, x2: wbCircumference, y2: -0.5, type: 'h' },
        { label: fmtInches(wbCut) + ' cut width', x: wbCircumference + 0.6, y1: 0, y2: wbCut, type: 'v' },
      ],
    });

    // ── Back patch pocket ─────────────────────────────────────────────────────
    if (opts.backPocket === 'yes') {
      pieces.push({
        id: 'back-pocket',
        name: 'Back Patch Pocket',
        instruction: 'Cut 1 · 5″ wide × 5½″ tall · Top edge: ½″ hem (fold under ¼″ twice, {topstitch}) · Sides + bottom: SA · Attach to right back panel',
        type: 'rectangle',
        dimensions: { length: 5.5, width: 5 },
        sa, hem: 0.5, hemEdge: 'top',
      });
    }

    return pieces;
  },

  materials(m, opts) {
    const elasticW = parseFloat(opts.elasticWidth) || 1;
    const elasticLabel = { 0.75: '¾″', 1: '1″', 1.5: '1½″' }[elasticW] || '1″';
    const rise   = m.rise  || 10;
    const inseam = m.inseam || 30;

    // Estimate yardage: 2 fronts + 2 backs + waistband, 44" wide fabric
    const panelHeight = (rise + inseam + 2) / 36; // in yards, with a little buffer
    const yards = Math.ceil(panelHeight * 2 * 4) / 4 + 0.5;

    const notions = [
      { ref: 'elastic-1', quantity: `${Math.round(m.waist * 0.85)}″ of ${elasticLabel} elastic` },
    ];
    if (opts.drawstring === 'yes') {
      notions.push({ name: '¼″ or ⅜″ cord or ribbon', quantity: `${Math.round(m.waist + 20)}″ for drawstring` });
    }

    const fabricOptions = opts.fabric === 'light'
      ? ['cotton-lawn', 'cotton-voile', 'cotton-satin', 'cotton-broadcloth']
      : ['cotton-flannel', 'cotton-broadcloth', 'cotton-quilting'];

    const notes = [
      `Main fabric: approximately ${yards} yards at 44″ wide.`,
      'Pre-wash fabric to prevent shrinkage, especially flannel which can shrink 5–10%.',
    ];
    if (opts.frenchSeams === 'yes') {
      notes.push('Using French seams: sew WS together first at ¼″, trim, then sew RS together at ⅜″. Perfect for sheer or slippery fabrics.');
    }
    notes.push('Use a ½″ seam allowance at the crotch curve for clean shaping. Clip the curve before turning.');

    return buildMaterialsSpec({
      fabrics: fabricOptions,
      notions,
      thread: 'poly-all',
      needle: 'universal-80',
      stitches: ['straight-2.5', 'topstitch'],
      notes,
    });
  },

  instructions(m, opts) {
    const steps = [];
    let n = 1;
    const sa = parseFloat(opts.sa) || 0.625;
    const saLabel = sa === 0.5 ? '½″' : '⅝″';
    const hemLabel = parseFloat(opts.hem) === 0.75 ? '¾″' : parseFloat(opts.hem) === 1 ? '1″' : '1½″';
    const elasticW = parseFloat(opts.elasticWidth) || 1;
    const elasticLabel = { 0.75: '¾″', 1: '1″', 1.5: '1½″' }[elasticW] || '1″';
    const isFrench = opts.frenchSeams === 'yes';
    const seam = isFrench
      ? `French seam (WS together at ¼″, trim, RS together at ${saLabel})`
      : `${saLabel} seam`;

    if (opts.backPocket === 'yes') {
      steps.push({
        step: n++, title: 'Make the back pocket',
        detail: 'Fold the top edge of the pocket under ¼″, then another ¼″. {press} and {topstitch} close to the inner fold. Fold and {press} the remaining three edges under ¼″. Position the pocket on the right back panel, 2″ below the waist edge and centered. {topstitch} the three sides to attach. Bar tack the top corners for reinforcement.',
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
      detail: `Join the front to the back at both side seams with a ${seam}. {press} open.`,
    });

    steps.push({
      step: n++, title: 'Sew inseam',
      detail: `Sew the inseam from one hem opening, through the crotch, to the other hem opening in a continuous seam. Clip the curve at the crotch. {press} the seam toward the back.`,
    });

    steps.push({
      step: n++, title: 'Attach waistband casing',
      detail: `Fold the waistband in half lengthwise, wrong sides together, and {press}. Pin the raw edge of the casing to the waist edge of the pants, right sides together. Sew all the way around with a ${saLabel} seam. Press the casing up.${opts.drawstring === 'yes' ? ' On the right side, make two vertical buttonholes at center front, ½″ from the fold line, spaced ¾″ apart.' : ''}`,
    });

    steps.push({
      step: n++, title: 'Insert elastic and drawstring',
      detail: opts.drawstring === 'yes'
        ? `Attach a safety pin to one end of the elastic. Thread it through the back half of the casing only (from side seam to side seam). Overlap the elastic ends by 1″ and zigzag stitch to join. Attach a safety pin to the drawstring cord and thread through the front half of the casing, exiting through both buttonholes. Knot or heat-seal the cord ends. Topstitch the casing fold to the waistband seam allowance, catching the elastic in place.`
        : `Attach a safety pin to the elastic. Thread through the entire casing. Overlap ends by 1″ and zigzag stitch. Topstitch the casing fold to secure.`,
    });

    steps.push({
      step: n++, title: 'Hem the legs',
      detail: `Fold each leg hem under ${hemLabel} and {press}. Fold under again the same amount. {press}. {topstitch} close to the inner fold. For French seams: fold under ¼″ then the remaining amount.`,
    });

    return steps;
  },

  variants: [
    { id: 'flannel-pajama-pants', name: 'Flannel Pajama Pants', defaults: { fabric: 'medium', frenchSeams: 'no' } },
    { id: 'satin-pajama-pants',   name: 'Satin Pajama Pants',   defaults: { fabric: 'light', frenchSeams: 'yes', sa: '0.5' } },
  ],
};


// ── Panel builder ─────────────────────────────────────────────────────────────
function buildPanel({ type, name, instruction, width, height, rise, inseam, ext, cbRaise, sa, hem, isBack, shape, tummyAdj = 0 }) {
  const ccp      = crotchCurvePoints(0, 0, rise, ext, isBack, cbRaise);
  const curvePts = sampleBezier(ccp.p0, ccp.p1, ccp.p2, ccp.p3, 96);

  const kneeY       = rise + inseam * 0.55;
  // Straight leg — width is constant all the way down
  const kneeW       = width * shape.knee;
  const hemW        = width * shape.hem;
  const kneeInward  = (width - kneeW) * 0.5;
  const hemInward   = (width - hemW)  * 0.5;
  const sideKneeX   =  width - kneeInward;
  const sideHemX    =  width - hemInward;
  const inseamKneeX = -ext  + kneeInward;
  const inseamHemX  = -ext  + hemInward;

  const poly = [];
  poly.push({ x: 0,           y: isBack ? -cbRaise : -tummyAdj });
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
    { x: width,       y: rise * 0.5,  angle: edgeAngle({ x: width, y: 0 }, { x: sideKneeX, y: kneeY }) },
    { x: -ext,        y: rise,        angle: edgeAngle({ x: inseamKneeX, y: kneeY }, { x: -ext, y: rise }) },
    { x: sideKneeX,   y: kneeY,       angle: edgeAngle({ x: width, y: 0 }, { x: sideKneeX, y: kneeY }) },
    { x: inseamKneeX, y: kneeY,       angle: edgeAngle({ x: -ext, y: rise }, { x: inseamKneeX, y: kneeY }) },
  ];

  return {
    id: type, name, instruction,
    polygon: poly, saPolygon: saPoly,
    path: polyToPath(poly), saPath: polyToPath(saPoly),
    dimensions: [
      { label: fmtInches(width),              x1: 0,     y1: -0.5,  x2: width,  y2: -0.5,  type: 'h' },
      { label: fmtInches(rise)   + ' rise',   x: width + 1.1, y1: 0,    y2: rise,            type: 'v' },
      { label: fmtInches(inseam) + ' inseam', x: width + 1.1, y1: rise, y2: height,          type: 'v' },
      { label: fmtInches(ext)    + ' ext',    x1: -ext, y1: rise + 0.3, x2: 0, y2: rise + 0.3, type: 'h', color: '#c44' },
    ],
    width, height, rise, inseam, ext, cbRaise, sa, hem, isBack,
    labels: [
      { text: 'SIDE SEAM', x: width + 0.3, y: height * 0.35, rotation: 90  },
      { text: 'CENTER',    x: -0.5,        y: rise * 0.3,    rotation: -90 },
    ],
    notches, crotchBezier: ccp,
    crotchBezierSA: insetCrotchBezier(ccp, sa), type: 'panel',
  };
}
