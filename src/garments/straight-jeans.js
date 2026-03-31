// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Straight Jeans — 5-pocket denim with tapered leg shaping.
 * 31 inch default inseam, 10 inch rise.
 * Leg tapers from hip through knee (55% down inseam) to hem per LEG_SHAPES.
 * Zip fly + fly shield, slant front pockets, coin pocket, welt back pockets ×2.
 */

import {
  crotchCurvePoints, sampleBezier, offsetPolygon, polyToPath, dist, arcLength,
  fmtInches, easeDistribution, LEG_SHAPES, edgeAngle, insetCrotchBezier,
  buildSlantPocketBag, buildSlantPocketFacing
} from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

export default {
  id: 'straight-jeans',
  name: 'Straight Jeans',
  category: 'lower',
  difficulty: 'advanced',
  priceTier: 'core',
  measurements: ['waist', 'hip', 'rise', 'thigh', 'inseam'],
  measurementDefaults: { inseam: 31 },

  options: {
    ease: {
      type: 'select', label: 'Fit',
      values: [
        { value: 'slim',    label: 'Slim (+2.5\u2033) , stretch fabric only', reference: 'fitted, tailored'    },
        { value: 'regular', label: 'Regular (+4\u2033)', reference: 'classic, off-the-rack' },
        { value: 'relaxed', label: 'Relaxed (+6\u2033)',   reference: 'skater, workwear'      },
      ],
      default: 'regular',
    },
    legShape: {
      type: 'select', label: 'Leg shape',
      values: [
        { value: 'skinny',   label: 'Skinny',   reference: '510, spray-on'    },
        { value: 'slim',     label: 'Slim',     reference: '511, cigarette'   },
        { value: 'straight', label: 'Straight', reference: '501, regular'     },
        { value: 'bootcut',  label: 'Bootcut',  reference: '527, 70s flare'   },
        { value: 'wide',     label: 'Wide',     reference: 'Yohji, palazzo'   },
      ],
      default: 'straight',
    },
    frontPocket: {
      type: 'select', label: 'Front pockets',
      values: [
        { value: 'slant', label: 'Slant (western)' },
        { value: 'side',  label: 'Side seam'       },
        { value: 'none',  label: 'None'             },
      ],
      default: 'slant',
    },
    frontExt: { type: 'number', label: 'Front crotch ext', default: 1.5, step: 0.25, min: 0.5, max: 3   },
    backExt:  { type: 'number', label: 'Back crotch ext',  default: 2.5, step: 0.25, min: 1,   max: 4   },
    riseStyle: {
      type: 'select', label: 'Rise style',
      values: [
        { value: 'ultra-low',  label: 'Ultra low (2000s, −2.5″)'  },
        { value: 'low',        label: 'Low rise (−1.5″)'           },
        { value: 'mid',        label: 'Mid rise (body rise)'       },
        { value: 'high',       label: 'High rise (+1.5″)'          },
        { value: 'ultra-high', label: 'Ultra high (paperbag, +3″)' },
      ],
      default: 'mid',
    },
    riseOverride: { type: 'number', label: 'Rise override (inches)', default: 0, step: 0.25, min: 0, max: 18 },
    cbRaise:  { type: 'number', label: 'CB raise',         default: 0.75, step: 0.25, min: 0,  max: 2   },
    sa: {
      type: 'select', label: 'Seam allowance',
      values: [
        { value: 0.5,   label: '½″' },
        { value: 0.625, label: '⅝″' },
      ],
      default: 0.625,
    },
    hem: {
      type: 'select', label: 'Hem allowance',
      values: [
        { value: 0.75, label: '¾″ chain-stitch style' },
        { value: 1,    label: '1″'                    },
        { value: 1.5,  label: '1½″ (cuff)'            },
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
    const inseam   = m.inseam || (m.outseam ? Math.max(1, m.outseam - rise) : 31);
    const shape    = LEG_SHAPES[opts.legShape] || LEG_SHAPES.straight;

    let frontHipW   = m.hip / 4 + ease.front;
    let backHipW    = m.hip / 4 + ease.back;
    const frontWaistW = m.waist / 4 + ease.front;
    const backWaistW  = m.waist / 4 + ease.back;
    const hipLineY    = m.seatDepth || 7;

    // Thigh ease check — widen panels if thigh circumference is tight
    if (m.thigh) {
      const patternThigh = (frontHipW + backHipW + frontExt + backExt) * 2;
      const minThigh = m.thigh * 2 + 3;
      if (patternThigh < minThigh) {
        const perPanel = (minThigh - patternThigh) / 4;
        frontHipW += perPanel;
        backHipW += perPanel;
        console.warn(`[straight-jeans] Thigh ease insufficient (${(patternThigh - m.thigh * 2).toFixed(1)}\u2033): widened panels by ${perPanel.toFixed(2)}\u2033 each`);
      } else if (patternThigh - m.thigh * 2 < 2) {
        console.warn(`[straight-jeans] Thigh ease is tight: ${(patternThigh - m.thigh * 2).toFixed(1)}\u2033 (recommend \u2265 2\u2033)`);
      }
    }
    const H           = rise + inseam;

    const pieces = [];

    pieces.push(buildPanel({
      type: 'front', name: 'Front Panel',
      instruction: 'Cut 2 (mirror L & R) · Curve on CENTER · Mark knee point',
      waistWidth: frontWaistW, hipWidth: frontHipW, hipLineY,
      height: H, rise, inseam,
      ext: frontExt, cbRaise: 0, sa, hem,
      isBack: false, shape, opts,
      calf: m.calf, ankle: m.ankle, seatDepth: m.seatDepth,
    }));

    const backDartIntake = backHipW - backWaistW;

    pieces.push(buildPanel({
      type: 'back', name: 'Back Panel',
      instruction: `Cut 2 (mirror L & R) · CB raised ${fmtInches(cbRaise)} · Mark knee point`,
      waistWidth: backWaistW + backDartIntake, hipWidth: backHipW, hipLineY,
      dartIntake: backDartIntake,
      height: H, rise, inseam,
      ext: backExt, cbRaise, sa, hem,
      isBack: true, shape, opts,
      calf: m.calf, ankle: m.ankle, seatDepth: m.seatDepth,
    }));

    // ── WAISTBAND ──
    const wbLen = m.waist + ease.total + sa * 2;
    pieces.push({
      id: 'waistband',
      name: 'Waistband',
      instruction: `Cut 1 on fold · Interface · 1½″ finished · Belt loops ×${m.waist > 36 ? 7 : 6}`,
      dimensions: { length: wbLen, width: 3 },
      type: 'rectangle', sa,
    });

    // ── FLY ──
    pieces.push({ id: 'fly-shield', name: 'Fly Shield', instruction: 'Cut 1 · Interface · {topstitch} curve visible from RS', dimensions: { width: 2.5, height: rise }, type: 'pocket', sa });

    // ── POCKETS ──
    if (opts.frontPocket === 'slant') {
      pieces.push(buildSlantPocketFacing({ width: 2, height: 6.5, sa, instruction: 'Cut 2 (1 + 1 mirror; flip fabric for second) \xb7 Denim or twill' }));
      pieces.push(buildSlantPocketBag({ width: 7, height: 11.5, sa, instruction: 'Cut 2 (1 + 1 mirror) \xb7 Lining (muslin or drill)' }));
    }
    if (opts.frontPocket === 'side') {
      pieces.push({ id: 'side-bag', name: 'Side-Seam Pocket Bag', instruction: 'Cut 4 (2 per side)', dimensions: { width: 7, height: 9 }, type: 'pocket', sa });
    }
    pieces.push({ id: 'coin-pocket',  name: 'Coin Pocket',         instruction: 'Cut 2 (outer + lining) · Right front only · {serge} edges', dimensions: { width: 3, height: 3.5 }, type: 'pocket', sa });
    pieces.push({ id: 'welt-back',    name: 'Back Welt Pocket',    instruction: 'Cut 4 (2 welts + 2 bags) · ×2 pockets total', dimensions: { width: 5.5, height: 6 }, type: 'pocket', sa });

    // ── BELT LOOPS ──
    pieces.push({ id: 'belt-loop', name: 'Belt Loops', instruction: `Cut ${m.waist > 36 ? 7 : 6} strips 1¾″ × ¾″ finished`, dimensions: { width: 1.75, height: 0.75 }, type: 'pocket', sa });

    return pieces;
  },

  materials(m, opts) {
    const notions = [
      { ref: 'interfacing-med', quantity: '0.5 yard (waistband + pocket facings)' },
      { name: 'Metal zipper', quantity: `${Math.ceil(m.rise * 0.6)}″`, notes: 'YKK #5 metal or equivalent' },
      { name: 'Waistband button', quantity: '1', notes: '¾″ jeans tack button, no-sew' },
      { name: 'Copper rivets', quantity: '5–6', notes: 'At pocket corners and stress points' },
    ];

    return buildMaterialsSpec({
      fabrics: ['denim', 'stretch-denim'],
      notions,
      thread: 'poly-heavy',
      needle: 'denim-100',
      stitches: ['straight-2.5', 'straight-3.5', 'bartack'],
      notes: [
        '{topstitch} with 3.5mm stitch and contrasting gold/amber thread for the classic jeans look. Use a {topstitch} needle for heavier thread',
        'Fell seams on inseam and outseam: after sewing, {press} seam to one side, fold raw edge under, {topstitch} from RS two rows visible',
        'Pre-wash denim once (hot wash, dry on high) to pre-shrink before cutting',
        'Use a denim needle (100/16) and heavy polyester thread 30wt; lighter thread will break under tension',
        'Copper rivet all high-stress points: bottom of front pocket openings, coin pocket sides, crotch junction',
        '{press} denim with a damp cloth. Dry pressing may leave shine marks on dark denim',
      ],
    });
  },

  instructions(m, opts) {
    const steps = [];
    let n = 1;

    steps.push({
      step: n++, title: 'Prepare back welt pockets',
      detail: 'Mark pocket positions on back panels. Sew bound welts, slash, turn and {press}. Attach pocket bags. Whipstitch bag sides. Bar tack welt ends. {topstitch} welts with 3.5mm gold thread.',
    });
    steps.push({
      step: n++, title: 'Prepare slant + coin pockets',
      detail: 'Sew facing to front slash {RST}. {clip} curve, turn, {press}. {understitch}. Attach pocket bag. Construct coin pocket: sew outer to lining {RST} on 3 sides, trim SA to 3mm, {clip} corners diagonally, turn RS out, push corners with {point turner}, {press}. {topstitch} coin pocket to RS of right front panel in upper right corner of pocket opening. {baste} pocket and coin pocket to panel edges.',
    });
    steps.push({
      step: n++, title: 'Sew back yoke (if applicable) & join back panels',
      detail: 'Join back panels at CB crotch seam. {clip} curve. Fell seam toward left back or {press} open for stretch denim.',
    });
    steps.push({
      step: n++, title: 'Install zip fly',
      detail: 'Interface fly shield. {staystitch} CF seam allowances. Sew front panels at CF from crotch point up to bottom of fly. Sew zipper (RS up) to right CF extension. Sew fly shield to left extension. Pin and {topstitch} the fly J-curve from RS using {topstitch} thread. Secure fly shield to inside.',
    });
    steps.push({
      step: n++, title: 'Sew outseams (side seams)',
      detail: 'Join front to back at outseam {RST}. {press} toward back. {topstitch} outseam fell: fold back panel SA over front, {topstitch} two rows ⅛″ and ¼″ from seam edge (visible from RS as double {topstitch}).',
    });
    steps.push({
      step: n++, title: 'Sew inseam',
      detail: 'Continuous seam from hem to hem. {clip} crotch curve. Fell toward front: fold front inseam SA over, {press}, {topstitch} from RS.',
    });
    steps.push({
      step: n++, title: 'Construct and attach waistband',
      detail: 'Interface waistband. Sew to jeans waist {RST}, matching CB, side seams, CF. Fold over. {topstitch} top and bottom edge with gold {topstitch} thread. Install jeans tack button at CF overlap. Make machine buttonhole or use eyelet.',
    });
    steps.push({
      step: n++, title: 'Attach belt loops',
      detail: '{press} loop strips in thirds. {topstitch} both edges. Cut to length. Pin at CB, side seams, and flanking CF fly. Fold under ends, {topstitch} top and bottom with a bar tack.',
    });
    steps.push({ step: n++, title: 'Set rivets', detail: 'Using rivet setter, place copper rivets at base of front pocket openings and coin pocket sides. Add one at crotch seam junction if fabric is heavy.' });
    steps.push({ step: n++, title: 'Hem', detail: `Fold hem up ${fmtInches(parseFloat(opts.hem))} twice. {topstitch} with 3.5mm gold thread. For chain-stitch look, use a single fold and a serger with chainstitch if available.` });
    steps.push({ step: n++, title: 'Finish', detail: '{press} seams. Bar tack all remaining stress points. Turn jeans inside out and {press} seam allowances flat with damp cloth.' });

    return steps;
  },
};


// ── Panel builder with knee-point leg shaping ─────────────────────────────

function buildPanel({ type, name, instruction, waistWidth, hipWidth, hipLineY, height, rise, inseam, ext, cbRaise, sa, hem, isBack, shape, opts, calf, ankle, seatDepth, dartIntake = 0 }) {
  const ccp      = crotchCurvePoints(0, 0, rise, ext, isBack, cbRaise);
  const curvePts = sampleBezier(ccp.p0, ccp.p1, ccp.p2, ccp.p3, 96);

  // Knee sits 55% down the inseam from the crotch
  const kneeY      = rise + inseam * 0.55;
  // If calf/ankle provided, derive per-panel width from body measurement; else use shape ratios
  const kneeW      = calf  ? calf  / 2 + 0.5 : hipWidth * shape.knee;
  const hemW       = ankle ? ankle / 2 + 0.5 : hipWidth * shape.hem;

  // Each leg narrows symmetrically — half on side seam, half on inseam
  const kneeInward = (hipWidth - kneeW) * 0.5;
  const hemInward  = (hipWidth - hemW)  * 0.5;

  const sideKneeX    =  hipWidth - kneeInward;
  const sideHemX     =  hipWidth - hemInward;
  const inseamKneeX  = -ext   + kneeInward;
  const inseamHemX   = -ext   + hemInward;

  // Waist-to-hip shaping: all taper on side seam, center seam stays at x=0
  const sideWaistX = waistWidth;

  const poly = [];
  poly.push({ x: 0,            y: isBack ? -cbRaise : 0 });   // waist at center seam (raised on back)
  poly.push({ x: sideWaistX,   y: 0       });   // waist at side seam
  poly.push({ x: hipWidth,     y: hipLineY });   // hip at side seam
  poly.push({ x: sideKneeX,    y: kneeY   });   // knee on side seam
  poly.push({ x: sideHemX,     y: height  });   // hem at side seam
  poly.push({ x: inseamHemX,   y: height  });   // hem at inseam
  poly.push({ x: inseamKneeX,  y: kneeY   });   // knee on inseam
  poly.push({ x: -ext,         y: rise    });   // crotch extension point
  for (let i = curvePts.length - 2; i >= 1; i--) poly.push({ ...curvePts[i], curve: true });
  if (isBack && cbRaise > 0) poly.push({ x: 0, y: cbRaise }); // CB seam top

  // SA offset — match edges by geometry (sanitizePoly changes vertex order/count)
  const saPoly = offsetPolygon(poly, (i, a, b) => {
    if (Math.abs(a.y - height) < 0.5 && Math.abs(b.y - height) < 0.5) return -hem;
    return -sa;
  });

  const effSeatDepth = seatDepth || 7;

  // Compute seam lengths for cross-reference labels
  const outseamLen = dist({ x: sideWaistX, y: 0 }, { x: hipWidth, y: hipLineY })
    + dist({ x: hipWidth, y: hipLineY }, { x: sideKneeX, y: kneeY })
    + dist({ x: sideKneeX, y: kneeY }, { x: sideHemX, y: height });
  const inseamLen = dist({ x: inseamHemX, y: height }, { x: inseamKneeX, y: kneeY })
    + dist({ x: inseamKneeX, y: kneeY }, { x: -ext, y: rise });
  const crotchLen = arcLength(curvePts);

  const dims = [
    { label: fmtInches(waistWidth) + ' waist', x1: 0, y1: -0.5, x2: sideWaistX, y2: -0.5, type: 'h' },
    { label: fmtInches(hipWidth) + ' hip',     x1: 0,            y1: hipLineY + 0.4, x2: hipWidth, y2: hipLineY + 0.4, type: 'h', color: '#b8963e' },
    { label: fmtInches(kneeW) + ' knee',       x1: inseamKneeX,  y1: kneeY + 0.4, x2: sideKneeX, y2: kneeY + 0.4, type: 'h', color: '#b8963e' },
    { label: fmtInches(hemW)  + ' hem',        x1: inseamHemX,   y1: height - 0.5, x2: sideHemX,  y2: height - 0.5, type: 'h', color: '#b8963e' },
    { label: fmtInches(rise)   + ' rise',      x: hipWidth + 1.2, y1: 0,      y2: rise,               type: 'v' },
    { label: fmtInches(inseam) + ' inseam',    x: hipWidth + 1.2, y1: rise,   y2: height,             type: 'v' },
    { label: fmtInches(ext)    + ' ext',       x1: -ext, y1: rise + 0.4, x2: 0, y2: rise + 0.4,   type: 'h', color: '#c44' },
    { label: fmtInches(effSeatDepth) + ' seat', x: -ext - 1.2, y1: 0, y2: effSeatDepth,        type: 'v', color: '#b8963e' },
    { label: fmtInches(outseamLen) + ' outseam', x: hipWidth + 2.8, y1: 0, y2: height, type: 'v', color: '#b8963e' },
    { label: fmtInches(inseamLen) + ' inseam seam', x: -ext - 2.8, y1: rise, y2: height, type: 'v', color: '#b8963e' },
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

  // Notch marks: hip on side seam, crotch junction, knee on both seams
  const notches = [
    { x: hipWidth,    y: hipLineY,        angle: edgeAngle({ x: hipWidth, y: 0 }, { x: sideKneeX, y: kneeY }) },
    ...(isBack ? [{ x: hipWidth, y: hipLineY + 0.25, angle: edgeAngle({ x: hipWidth, y: 0 }, { x: sideKneeX, y: kneeY }) }] : []),
    { x: -ext,        y: rise,            angle: edgeAngle({ x: inseamKneeX, y: kneeY }, { x: -ext, y: rise }) },
    ...(isBack ? [{ x: -ext, y: rise - 0.25,         angle: edgeAngle({ x: inseamKneeX, y: kneeY }, { x: -ext, y: rise }) }] : []),
    { x: sideKneeX,   y: kneeY,           angle: edgeAngle({ x: hipWidth, y: hipLineY }, { x: sideKneeX, y: kneeY }) },
    { x: inseamKneeX, y: kneeY,           angle: edgeAngle({ x: -ext, y: rise }, { x: inseamKneeX, y: kneeY }) },
  ];

  return {
    id: type, name, instruction,
    polygon: poly, saPolygon: saPoly,
    path: polyToPath(poly), saPath: polyToPath(saPoly),
    dimensions: dims, waistWidth, hipWidth, width: hipWidth, height, rise, inseam, ext, cbRaise, sa, hem, isBack,
    notches, crotchBezier: ccp,
    // LOCKED — crotch curve cut & stitch lines are finalized. Do not modify
    // crotchBezier, crotchBezierSA, or their rendering in pattern-view.js.
    crotchBezierSA: insetCrotchBezier(ccp, sa),
    labels: [
      { text: 'SIDE SEAM', x: hipWidth + 0.3, y: height * 0.35, rotation: 90  },
      { text: 'CENTER',    x: -0.5,            y: rise   * 0.3,  rotation: -90 },
    ],
    darts, type: 'panel', opts,
  };
}
