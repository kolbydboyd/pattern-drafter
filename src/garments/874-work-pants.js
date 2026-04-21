// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * 874 Work Pants - classic American workwear trousers.
 * High rise (11.5" default), relaxed fit (+6" ease), slight taper.
 * Slant front pockets, welt back pockets x2 with button, zip fly.
 * Hook-and-eye + button waistband closure, 1.75" finished waistband.
 * 7 tunnel belt loops (1" finished width).
 * Double-stitch + edge finish seam construction throughout.
 * Poly-cotton twill with era option (classic vs modern).
 */

import {
  edgeAngle, crotchCurvePoints, sampleBezier, offsetPolygon, polyToPath,
  fmtInches, easeDistribution, insetCrotchBezier, tummyAdjustment,
} from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

// 874-specific leg shape: straighter than standard straight (0.90/0.85)
const LEG_874 = { knee: 0.95, hem: 0.90 };

export default {
  id: '874-work-pants',
  name: '874 Work Pants',
  category: 'lower',
  difficulty: 'advanced',
  priceTier: 'core',
  measurements: ['waist', 'hip', 'rise', 'thigh', 'inseam'],
  measurementDefaults: { inseam: 31 },

  options: {
    ease: {
      type: 'select', label: 'Fit',
      values: [
        { value: 'slim',    label: 'Slim (+1.5")',    reference: 'fitted, modern slim'     },
        { value: 'regular', label: 'Regular (+2.5")', reference: 'classic, off-the-rack'   },
        { value: 'relaxed', label: 'Relaxed (+4")',   reference: 'skater, workwear'        },
        { value: 'wide',    label: 'Wide (+6")',      reference: 'original 874, loose fit'  },
      ],
      default: 'wide',
    },
    riseStyle: {
      type: 'select', label: 'Rise style',
      values: [
        { value: 'ultra-low',  label: 'Ultra low (2000s, -2.5")'  },
        { value: 'low',        label: 'Low rise (-1.5")'           },
        { value: 'mid',        label: 'Mid rise (body rise)'       },
        { value: 'high',       label: 'High rise (+1.5")'          },
        { value: 'ultra-high', label: 'Ultra high (paperbag, +3")' },
      ],
      default: 'high',
    },
    riseOverride: { type: 'number', label: 'Rise override (inches)', default: 0, step: 0.25, min: 0, max: 18 },
    centerCrease: {
      type: 'select', label: 'Center crease',
      values: [
        { value: 'yes', label: 'Yes (classic 874 look)' },
        { value: 'no',  label: 'No'                      },
      ],
      default: 'yes',
    },
    era: {
      type: 'select', label: 'Fabric era',
      values: [
        { value: 'classic', label: 'Classic (pre-2010, heavier USA-made twill)'  },
        { value: 'modern',  label: 'Modern (current, lighter poly-cotton blend)' },
      ],
      default: 'classic',
    },
    frontExt: { type: 'number', label: 'Front crotch ext', default: 1.5, step: 0.25, min: 0.5, max: 3   },
    backExt:  { type: 'number', label: 'Back crotch ext',  default: 3.0, step: 0.25, min: 1,   max: 4.5 },
    cbRaise:  { type: 'number', label: 'CB raise',         default: 1.25, step: 0.25, min: 0,  max: 2.5 },
    sa: {
      type: 'select', label: 'Seam allowance',
      values: [
        { value: 0.5,   label: '1/2"' },
        { value: 0.625, label: '5/8"' },
      ],
      default: 0.625,
    },
    hem: {
      type: 'select', label: 'Hem allowance',
      values: [
        { value: 1,   label: '1"'         },
        { value: 1.5, label: '1 1/2"'     },
        { value: 2,   label: '2" (cuff)'  },
      ],
      default: 1,
    },
  },

  pieces(m, opts) {
    const ease     = easeDistribution(opts.ease);
    const sa       = parseFloat(opts.sa);
    const hem      = parseFloat(opts.hem);
    const frontExt = parseFloat(opts.frontExt);
    const backExt  = parseFloat(opts.backExt);
    const cbRaise  = parseFloat(opts.cbRaise);
    const RISE_OFFSETS = { 'ultra-low': -2.5, low: -1.5, mid: 0, high: 1.5, 'ultra-high': 3.0 };
    const baseRise  = m.rise || 10;
    const riseOff   = RISE_OFFSETS[opts.riseStyle] ?? 0;
    const rise      = parseFloat(opts.riseOverride) || (baseRise + riseOff);
    const inseam   = m.outseam ? Math.max(1, m.outseam - rise) : (m.inseam || 31);
    const shape    = LEG_874;

    const frontHipW   = m.hip / 4 + ease.front;
    const backHipW    = m.hip / 4 + ease.back;
    const frontWaistW = m.waist / 4 + ease.front;
    const backWaistW  = m.waist / 4 + ease.back;
    const hipLineY    = m.seatDepth || 7;
    const H           = rise + inseam;

    const pieces = [];
    const tummyAdj = tummyAdjustment(m);

    pieces.push(buildPanel({
      type: 'front', name: 'Front Panel',
      instruction: 'Cut 2 (mirror L & R) - Double-stitch all structural seams, {serge} raw edges',
      waistWidth: frontWaistW, hipWidth: frontHipW, hipLineY,
      height: H, rise, inseam,
      ext: frontExt, cbRaise: 0, sa, hem, isBack: false, shape, opts,
      calf: m.calf, ankle: m.ankle, seatDepth: m.seatDepth, tummyAdj,
    }));

    // Back panel waist darts: suppress waist-to-hip difference
    const backDartIntake = backHipW - backWaistW;

    pieces.push(buildPanel({
      type: 'back', name: 'Back Panel',
      instruction: `Cut 2 (mirror L & R) - CB raised ${fmtInches(cbRaise)}`,
      waistWidth: backWaistW + backDartIntake, hipWidth: backHipW, hipLineY,
      dartIntake: backDartIntake,
      height: H, rise, inseam,
      ext: backExt, cbRaise, sa, hem, isBack: true, shape, opts,
      calf: m.calf, ankle: m.ankle, seatDepth: m.seatDepth,
    }));

    // -- WAISTBAND (1.75" finished, +2 for closure overlap) --
    const wbLen = m.waist + ease.total + sa * 2 + 2;
    pieces.push({
      id: 'waistband',
      name: 'Waistband',
      instruction: `Cut 1 - Interface - 1 3/4" finished (3 1/2" cut) - Hook-and-eye + button closure at CF overlap - Belt loops x7`,
      dimensions: { length: wbLen, width: 3.5 },
      type: 'rectangle', sa,
    });

    // -- FLY --
    pieces.push({ id: 'fly-shield', name: 'Fly Shield', instruction: 'Cut 1 - Interface - {serge} edge before attaching', dimensions: { width: 2.5, height: rise }, type: 'pocket' });

    // -- POCKETS (874 always has slant front + welt-button back) --
    pieces.push({ id: 'slant-facing', name: 'Slant Pocket Facing', instruction: 'Cut 2 (1 + 1 mirror - flip fabric for second) - Match fabric or lining - {serge} before attaching', dimensions: { width: 2, height: 6.5 }, type: 'pocket' });
    pieces.push({ id: 'slant-bag',    name: 'Slant Pocket Bag',    instruction: 'Cut 2 (1 + 1 mirror) - Lining or drill - {serge} all edges', dimensions: { width: 7, height: 11.5 }, type: 'pocket' });
    pieces.push({ id: 'welt-back',    name: 'Back Welt Pocket',    instruction: 'Cut 4 (2 welts + 2 bags) - x2 pockets total - {serge} bag edges', dimensions: { width: 5.5, height: 6 }, type: 'pocket' });

    // -- BELT LOOPS (7 tunnel-style, 1" finished) --
    pieces.push({ id: 'belt-loop', name: 'Belt Loops', instruction: 'Cut 7 strips - Fold in half lengthwise, sew, turn (1" finished tunnel) - Length 4 1/2" - Fold under ends before attaching to waistband', dimensions: { length: 4.5, width: 2.5 }, type: 'pocket' });

    return pieces;
  },

  materials(m, opts) {
    const isClassic = opts.era === 'classic';
    const notions = [
      { ref: 'interfacing-med', quantity: '0.5 yard (waistband + pocket facings)' },
      { name: 'Metal zipper',    quantity: `${Math.ceil(m.rise * 0.6)}"`, notes: 'YKK or equivalent' },
      { name: 'Hook-and-eye',    quantity: '1 set', notes: 'Size 2-3 at waistband overlap' },
      { name: 'Waistband button', quantity: '1', notes: '3/4" shank button' },
      { name: 'Welt buttons',    quantity: '2', notes: '1/2" sew-through buttons for back pockets' },
    ];

    return buildMaterialsSpec({
      fabrics: ['cotton-twill'],
      notions,
      thread: 'poly-all',
      needle: 'universal-90',
      stitches: ['straight-2.5', 'straight-3', 'zigzag-small', 'bartack'],
      notes: [
        isClassic
          ? '874 classic (pre-2010): 65/35 polyester-cotton twill, 8.5 oz/yd2, stiff hand, crease-resistant. The original USA-made fabric.'
          : '874 modern: 65/35 polyester-cotton blend, lighter weight (~7.5 oz/yd2), softer hand. Current production fabric.',
        'DOUBLE-STITCH all structural seams: sew seam, then {topstitch} 1/4" from seam line through both allowances. {serge} or {zigzag} raw edges after double-stitching.',
        '{press} every seam immediately after sewing',
        'Pre-wash fabric once at the temperature you plan to wash the finished garment',
        'Bar tack all pocket corners, belt loop ends, and the crotch junction',
        'Use matching poly thread throughout for durability',
      ],
    });
  },

  instructions(m, opts) {
    const steps = [];
    let n = 1;

    steps.push({
      step: n++, title: 'Prepare back welt pockets',
      detail: '{serge} pocket bag edges. Mark welt positions on back panels. Sew bound welts {RST}, slash, turn, {press}. Attach bag halves. Whipstitch bag sides. Bar tack ends. Work buttonhole on upper welt, attach button.',
    });

    steps.push({
      step: n++, title: 'Prepare slant pockets',
      detail: '{serge} pocket bag and facing edges. Sew facing to front panel slash line {RST}. {clip}, turn, {press}. {understitch} facing. Attach bag to facing. {baste} bag to panel at side and waist.',
    });
    steps.push({
      step: n++, title: 'Install zip fly',
      detail: '{serge} fly shield edges. {staystitch} CF seam allowances. Sew front panels at CF from crotch to bottom of fly opening. {clip} curve. Sew zipper to right CF. Sew fly shield to left CF. {topstitch} fly curve from RS at 3.0mm.',
    });
    steps.push({
      step: n++, title: 'Sew center back seam',
      detail: 'Join back panels at CB {RST}. {clip} curve. Double-stitch: sew seam, then {topstitch} 1/4" from seam through both allowances. {serge} raw edges.',
    });
    steps.push({
      step: n++, title: 'Sew side seams',
      detail: 'Join front to back at side seams {RST}. Double-stitch: sew seam, then {topstitch} 1/4" from seam through both allowances. {serge} each raw edge. {press} toward back.',
    });
    steps.push({
      step: n++, title: 'Sew inseam',
      detail: 'Continuous seam from hem to hem. {clip} crotch curve. Double-stitch: sew seam, then {topstitch} 1/4" from seam through both allowances. {serge} raw edges. {press} toward back.',
    });
    steps.push({
      step: n++, title: 'Construct and attach waistband',
      detail: 'Interface waistband. Fold lengthwise, {press}. Sew to trousers waist {RST}. Fold over. {topstitch} top and bottom edges at 3.0mm. Install hook-and-eye inside CF overlap. Sew button and buttonhole at CF.',
    });
    steps.push({
      step: n++, title: 'Attach belt loops',
      detail: 'Sew 7 tunnel belt loops: fold strip in half lengthwise {RST}, sew long edge, turn RS out, {press} with seam centered on back. Cut to 4 1/2". Place at CB, side seams, flanking CF, and between CF and side seams. Fold under ends, {topstitch}. Bar tack through all layers at top and bottom of waistband.',
    });

    if (opts.centerCrease === 'yes') {
      steps.push({
        step: n++, title: 'Press center crease',
        detail: '{press} center crease on each leg from hem to just below pocket opening. Align front and back inseam/outseam, {press} fold line with steam and starch for a sharp crease. This is the signature 874 detail.',
      });
    }

    steps.push({
      step: n++, title: 'Hem',
      detail: `{serge} or turn under raw hem edge. Fold hem up ${fmtInches(parseFloat(opts.hem))}. {press}. {topstitch} at 3.0mm.`,
    });
    steps.push({ step: n++, title: 'Finish', detail: '{press} entire garment with steam. Bar tack all stress points. Check all seam allowances are double-stitched and neatly serged.' });

    return steps;
  },
};


// -- Panel builder with knee-point leg shaping --------------------------------

function buildPanel({ type, name, instruction, waistWidth, hipWidth, hipLineY, height, rise, inseam, ext, cbRaise, sa, hem, isBack, shape, opts, calf, ankle, seatDepth, dartIntake = 0, tummyAdj = 0 }) {
  const ccp      = crotchCurvePoints(0, 0, rise, ext, isBack, cbRaise);
  const curvePts = sampleBezier(ccp.p0, ccp.p1, ccp.p2, ccp.p3, 96);

  const kneeY       = rise + inseam * 0.55;
  const kneeW       = calf  ? calf  / 2 + 0.5 : hipWidth * shape.knee;
  const hemW        = ankle ? ankle / 2 + 0.5 : hipWidth * shape.hem;
  const kneeInward  = (hipWidth - kneeW) * 0.5;
  const hemInward   = (hipWidth - hemW)  * 0.5;
  const sideKneeX   =  hipWidth - kneeInward;
  const sideHemX    =  hipWidth - hemInward;
  const inseamKneeX = -ext   + kneeInward;
  const inseamHemX  = -ext   + hemInward;

  // Waist-to-hip shaping: all taper on side seam, center seam stays at x=0
  const sideWaistX = waistWidth;

  const poly = [];
  poly.push({ x: 0,            y: isBack ? 0 : -tummyAdj });   // waist at center seam (tummy on front)
  poly.push({ x: sideWaistX,   y: 0       });   // waist at side seam
  poly.push({ x: hipWidth,     y: hipLineY });   // hip at side seam
  poly.push({ x: sideKneeX,    y: kneeY   });
  poly.push({ x: sideHemX,     y: height  });
  poly.push({ x: inseamHemX,   y: height  });
  poly.push({ x: inseamKneeX,  y: kneeY   });
  poly.push({ x: -ext,         y: rise    });
  for (let i = curvePts.length - 2; i >= 1; i--) poly.push({ ...curvePts[i], curve: true });
  if (isBack && cbRaise > 0) poly.push({ x: 0, y: cbRaise }); // CB seam top

  const saPoly = offsetPolygon(poly, (i, a, b) => {
    if (Math.abs(a.y - height) < 0.5 && Math.abs(b.y - height) < 0.5) return -hem;
    return -sa;
  });

  const effSeatDepth = seatDepth || 7;
  const dims = [
    { label: fmtInches(waistWidth) + ' waist', x1: 0, y1: -0.5, x2: sideWaistX, y2: -0.5, type: 'h' },
    { label: fmtInches(hipWidth) + ' hip',     x1: 0,            y1: hipLineY + 0.4, x2: hipWidth, y2: hipLineY + 0.4, type: 'h', color: '#b8963e' },
    { label: fmtInches(kneeW) + ' knee',       x1: inseamKneeX,  y1: kneeY + 0.4, x2: sideKneeX,  y2: kneeY + 0.4, type: 'h', color: '#b8963e' },
    { label: fmtInches(hemW)  + ' hem',        x1: inseamHemX,   y1: height - 0.5, x2: sideHemX,  y2: height - 0.5, type: 'h', color: '#b8963e' },
    { label: fmtInches(rise)   + ' rise',      x: hipWidth + 1.2, y1: 0,           y2: rise,                         type: 'v' },
    { label: fmtInches(inseam) + ' inseam',    x: hipWidth + 1.2, y1: rise,        y2: height,                       type: 'v' },
    { label: fmtInches(ext)    + ' ext',       x1: -ext, y1: rise + 0.4, x2: 0, y2: rise + 0.4,                   type: 'h', color: '#c44' },
    { label: fmtInches(effSeatDepth) + ' seat', x: -ext - 1.2, y1: 0, y2: effSeatDepth,                        type: 'v', color: '#b8963e' },
  ];

  // Waist darts for back panel
  const darts = [];
  if (isBack && dartIntake > 1) {
    if (dartIntake <= 1.5) {
      darts.push({ x: waistWidth * 0.4, intake: dartIntake, length: 4.5 });
    } else {
      darts.push({ x: waistWidth * 0.3, intake: dartIntake / 2, length: 4.5 });
      darts.push({ x: waistWidth * 0.6, intake: dartIntake / 2, length: 4 });
    }
  }

  const notches = [
    { x: hipWidth,     y: hipLineY, angle: edgeAngle({ x: hipWidth, y: 0 }, { x: sideKneeX, y: kneeY }) },
    { x: -ext,         y: rise,     angle: edgeAngle({ x: inseamKneeX, y: kneeY }, { x: -ext, y: rise }) },
    { x: sideKneeX,    y: kneeY,    angle: edgeAngle({ x: hipWidth, y: hipLineY }, { x: sideKneeX, y: kneeY }) },
    { x: inseamKneeX,  y: kneeY,    angle: edgeAngle({ x: -ext, y: rise }, { x: inseamKneeX, y: kneeY }) },
  ];

  return {
    id: type, name, instruction,
    polygon: poly, saPolygon: saPoly,
    path: polyToPath(poly), saPath: polyToPath(saPoly),
    dimensions: dims, waistWidth, hipWidth, width: hipWidth, height, rise, inseam, ext, cbRaise, sa, hem, isBack,
    labels: [
      { text: 'SIDE SEAM', x: hipWidth + 0.3, y: height * 0.35, rotation: 90  },
      { text: 'CENTER',    x: -0.5,            y: rise   * 0.3,  rotation: -90 },
    ],
    notches, darts, crotchBezier: ccp,
    // LOCKED -- crotch curve cut & stitch lines are finalized. Do not modify
    // crotchBezier, crotchBezierSA, or their rendering in pattern-view.js.
    crotchBezierSA: insetCrotchBezier(ccp, sa), type: 'panel', opts,
  };
}
