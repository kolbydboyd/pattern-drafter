// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Baggy Shorts (Jorts) — oversized denim shorts hitting below the knee.
 * 13 inch default inseam, high rise, wide straight leg.
 * No taper from thigh to hem. Denim construction with felled seams.
 * Zip fly + fly shield, slant front pockets, coin pocket, welt back pockets x2.
 */

import {
  crotchCurvePoints, sampleBezier, offsetPolygon, polyToPath, dist, arcLength,
  fmtInches, easeDistribution, LEG_SHAPES, edgeAngle, insetCrotchBezier,
  buildSlantPocketBag, buildSlantPocketBacking, clipPanelAtSlash
} from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

export default {
  id: 'baggy-shorts',
  name: 'Baggy Shorts (Jorts)',
  category: 'lower',
  difficulty: 'intermediate',
  priceTier: 'core',
  measurements: ['waist', 'hip', 'rise', 'thigh', 'inseam'],
  measurementDefaults: { inseam: 13 },

  options: {
    ease: {
      type: 'select', label: 'Fit',
      values: [
        { value: 'regular',   label: 'Regular (+4\u2033)',    reference: 'classic, workwear'  },
        { value: 'relaxed',   label: 'Relaxed (+6\u2033)',    reference: 'skater, streetwear' },
        { value: 'oversized', label: 'Oversized (+8\u2033)',  reference: 'Y2K, JNCO'         },
      ],
      default: 'relaxed',
    },
    legShape: {
      type: 'select', label: 'Leg shape',
      values: [
        { value: 'straight',   label: 'Straight',   reference: 'Dickies, workwear'  },
        { value: 'wide',       label: 'Wide',        reference: 'skater, streetwear' },
        { value: 'ultra-wide', label: 'Ultra wide',  reference: 'JNCO, raver'        },
      ],
      default: 'wide',
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
    frontExt: { type: 'number', label: 'Front crotch ext', default: 2, step: 0.25, min: 0.5, max: 3   },
    backExt:  { type: 'number', label: 'Back crotch ext',  default: 3.0, step: 0.25, min: 1,   max: 4.5 },
    riseStyle: {
      type: 'select', label: 'Rise style',
      values: [
        { value: 'low',        label: 'Low rise (\u22121.5\u2033)'           },
        { value: 'mid',        label: 'Mid rise (body rise)'       },
        { value: 'high',       label: 'High rise (+1.5\u2033)'          },
        { value: 'ultra-high', label: 'Ultra high (paperbag, +3\u2033)' },
      ],
      default: 'high',
    },
    riseOverride: { type: 'number', label: 'Rise override (inches)', default: 0, step: 0.25, min: 0, max: 18 },
    cbRaise:  { type: 'number', label: 'CB raise',         default: 1.25, step: 0.25, min: 0,  max: 2.5 },
    sa: {
      type: 'select', label: 'Seam allowance',
      values: [
        { value: 0.5,   label: '\u00BD\u2033' },
        { value: 0.625, label: '\u215D\u2033' },
      ],
      default: 0.625,
    },
    hem: {
      type: 'select', label: 'Hem allowance',
      values: [
        { value: 0.75, label: '\u00BE\u2033 chain-stitch style' },
        { value: 1,    label: '1\u2033'                    },
        { value: 1.5,  label: '1\u00BD\u2033 (cuff)'            },
      ],
      default: 1,
    },
  },

  pieces(m, opts) {
    const BAGGY_EASE = { regular: 4, relaxed: 6, oversized: 8 };
    const easeTotal  = BAGGY_EASE[opts.ease] ?? 6;
    const ease       = easeDistribution(easeTotal);
    const sa       = parseFloat(opts.sa);
    const hem      = parseFloat(opts.hem);
    const frontExt = parseFloat(opts.frontExt);
    const backExt  = parseFloat(opts.backExt);
    const cbRaise  = parseFloat(opts.cbRaise);
    const RISE_OFFSETS = { low: -1.5, mid: 0, high: 1.5, 'ultra-high': 3.0 };
    const baseRise  = m.rise || 10;
    const riseOff   = RISE_OFFSETS[opts.riseStyle] ?? 0;
    const crotchEase = 1.25; // ease below body rise — prevents fabric pulling tight against crotch
    const rawRise   = parseFloat(opts.riseOverride) || (baseRise + riseOff);
    const rise      = rawRise + crotchEase;
    const inseam   = m.inseam || (m.outseam ? Math.max(1, m.outseam - rise) : 13);
    const shape    = LEG_SHAPES[opts.legShape] || LEG_SHAPES.wide;

    let frontHipW   = m.hip / 4 + ease.front + 0.5;
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
        console.warn(`[baggy-shorts] Thigh ease insufficient (${(patternThigh - m.thigh * 2).toFixed(1)}\u2033): widened panels by ${perPanel.toFixed(2)}\u2033 each`);
      }
    }
    const H           = rise + inseam;

    const pieces = [];

    pieces.push(buildPanel({
      type: 'front', name: 'Front Panel',
      instruction: 'Cut 2 (mirror L & R) \xb7 Curve on CENTER \xb7 Wide straight leg',
      waistWidth: frontWaistW, hipWidth: frontHipW, hipLineY,
      height: H, rise, inseam,
      ext: frontExt, cbRaise: 0, sa, hem,
      isBack: false, shape, opts,
    }));

    const backDartIntake = backHipW - backWaistW;

    pieces.push(buildPanel({
      type: 'back', name: 'Back Panel',
      instruction: `Cut 2 (mirror L & R) \xb7 CB raised ${fmtInches(cbRaise)} \xb7 Wide straight leg`,
      waistWidth: backWaistW + backDartIntake, hipWidth: backHipW, hipLineY,
      dartIntake: backDartIntake,
      height: H, rise, inseam,
      ext: backExt, cbRaise, sa, hem,
      isBack: true, shape, opts,
    }));

    // ── WAISTBAND ──
    const wbLen = m.waist + ease.total + sa * 2;
    pieces.push({
      id: 'waistband',
      name: 'Waistband',
      instruction: `Cut 1 on fold \xb7 Interface \xb7 1\u00BD\u2033 finished \xb7 Belt loops \xd7${m.waist > 36 ? 7 : 6}`,
      dimensions: { length: wbLen, width: 3 },
      type: 'rectangle', sa,
    });

    // ── FLY ──
    pieces.push({ id: 'fly-shield', name: 'Fly Shield', instruction: 'Cut 1 \xb7 Interface \xb7 {topstitch} curve visible from RS', dimensions: { width: 2.5, height: rise }, type: 'pocket', sa });

    // ── POCKETS ──
    if (opts.frontPocket === 'slant') {
      pieces.push(buildSlantPocketBacking({ bagWidth: 7, slashInset: 3.5, slashDepth: 6, bagDepth: 9.5, sa, instruction: 'Cut 2 (1 + 1 mirror) \xb7 Self fabric (denim) \xb7 Visible pocket front' }));
      pieces.push(buildSlantPocketBag({ bagWidth: 7, slashInset: 3.5, slashDepth: 6, bagDepth: 9.5, sa, instruction: 'Cut 2 (1 + 1 mirror) \xb7 Lining (muslin or drill) \xb7 Pocket back (against body)' }));
    }
    if (opts.frontPocket === 'side') {
      pieces.push({ id: 'side-bag', name: 'Side-Seam Pocket Bag', instruction: 'Cut 4 (2 per side)', dimensions: { width: 7, height: 9 }, type: 'pocket', sa });
    }
    pieces.push({ id: 'coin-pocket',  name: 'Coin Pocket',         instruction: 'Cut 2 (outer + lining) \xb7 Right front only \xb7 {serge} edges', dimensions: { width: 3, height: 3.5 }, type: 'pocket', sa });
    pieces.push({ id: 'welt-back',    name: 'Back Welt Pocket',    instruction: 'Cut 4 (2 welts + 2 bags) \xb7 \xd72 pockets total', dimensions: { width: 5.5, height: 6 }, type: 'pocket', sa });

    // ── BELT LOOPS ──
    pieces.push({ id: 'belt-loop', name: 'Belt Loops', instruction: `Cut ${m.waist > 36 ? 7 : 6} strips 1\u00BE\u2033 \xd7 \u00BE\u2033 finished`, dimensions: { width: 1.75, height: 0.75 }, type: 'pocket', sa });

    return pieces;
  },

  materials(m, opts) {
    const notions = [
      { ref: 'interfacing-med', quantity: '0.5 yard (waistband + pocket facings)' },
      { name: 'Metal zipper', quantity: `${Math.ceil(m.rise * 0.6)}\u2033`, notes: 'YKK #5 metal or equivalent' },
      { name: 'Waistband button', quantity: '1', notes: '\u00BE\u2033 jeans tack button, no-sew' },
      { name: 'Copper rivets', quantity: '5\u20136', notes: 'At pocket corners and stress points' },
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
    steps.push({ step: n++, title: 'Sew pocket backing to pocket bag',
      detail: 'Place the pocket backing (self fabric) on the pocket bag (lining) {RST}. Sew along the curved bottom edge and the straight left side. Leave the top (waist), right side seam edge, and slash diagonal open. {clip} the curved seam allowance. Turn right side out so the backing faces outward. {press} flat. {topstitch} \u00bc\u2033 from the curved edge if desired. The pocket unit is now one piece with two layers.' });
    steps.push({ step: n++, title: 'Attach pocket to front panel',
      detail: 'The front panel is cut off at the slash line (the diagonal from waist to side seam). Align the pocket unit\u2019s slash diagonal edge to the front panel\u2019s slash edge {RST}. The pocket backing should face the front panel RS. Sew along the slash. {clip} the seam allowance. Turn the pocket to the wrong side of the panel. {press}. {understitch} through the pocket backing and both SAs so the seam rolls to the inside. {baste} the pocket\u2019s top edge to the panel\u2019s waist SA. {baste} the pocket\u2019s side seam edge to the panel\u2019s side SA. The pocket is now enclosed when the waist and side seams are sewn.' });
    steps.push({ step: n++, title: 'Prepare coin pocket',
      detail: 'Construct coin pocket: sew outer to lining {RST} on 3 sides, trim SA to 3mm, {clip} corners diagonally, turn RS out, push corners with {point turner}, {press}. {topstitch} coin pocket to RS of right front panel in upper right corner of pocket opening. {baste} coin pocket to panel edges.' });
    steps.push({
      step: n++, title: 'Join back panels at CB',
      detail: 'Join back panels at CB crotch seam. {clip} curve. Fell seam toward left back or {press} open for stretch denim.',
    });
    steps.push({
      step: n++, title: 'Install zip fly',
      detail: 'Interface fly shield. {staystitch} CF seam allowances. Sew front panels at CF from crotch point up to bottom of fly. Sew zipper (RS up) to right CF extension. Sew fly shield to left extension. Pin and {topstitch} the fly J-curve from RS using {topstitch} thread. Secure fly shield to inside.',
    });
    steps.push({
      step: n++, title: 'Sew outseams (side seams)',
      detail: 'Join front to back at outseam {RST}. {press} toward back. {topstitch} outseam fell: fold back panel SA over front, {topstitch} two rows \u215B\u2033 and \u00bc\u2033 from seam edge (visible from RS as double {topstitch}).',
    });
    steps.push({
      step: n++, title: 'Sew inseam',
      detail: 'Continuous seam from hem to hem. {clip} crotch curve. Fell toward front: fold front inseam SA over, {press}, {topstitch} from RS.',
    });
    steps.push({
      step: n++, title: 'Construct and attach waistband',
      detail: 'Interface waistband. Sew to jorts waist {RST}, matching CB, side seams, CF. Fold over. {topstitch} top and bottom edge with gold {topstitch} thread. Install jeans tack button at CF overlap. Make machine buttonhole or use eyelet.',
    });
    steps.push({
      step: n++, title: 'Attach belt loops',
      detail: '{press} loop strips in thirds. {topstitch} both edges. Cut to length. Pin at CB, side seams, and flanking CF fly. Fold under ends, {topstitch} top and bottom with a bar tack.',
    });
    steps.push({ step: n++, title: 'Set rivets', detail: 'Using rivet setter, place copper rivets at base of front pocket openings and coin pocket sides. Add one at crotch seam junction if fabric is heavy.' });
    steps.push({ step: n++, title: 'Hem', detail: `Fold hem up ${fmtInches(parseFloat(opts.hem))} twice. {topstitch} with 3.5mm gold thread. For chain-stitch look, use a single fold and a serger with chainstitch if available.` });
    steps.push({ step: n++, title: 'Finish', detail: '{press} seams. Bar tack all remaining stress points. Turn jorts inside out and {press} seam allowances flat with damp cloth.' });

    return steps;
  },
};


// ── Panel builder with leg shaping ─────────────────────────────

function buildPanel({ type, name, instruction, waistWidth, hipWidth, hipLineY, height, rise, inseam, ext, cbRaise, sa, hem, isBack, shape, opts, dartIntake = 0 }) {
  const ccp      = crotchCurvePoints(0, 0, rise, ext, isBack, cbRaise);
  const curvePts = sampleBezier(ccp.p0, ccp.p1, ccp.p2, ccp.p3, 96);

  // For shorts, knee point is near or at hem — use shape ratios for hem width
  const kneeY      = rise + inseam * 0.55;
  const kneeW      = hipWidth * shape.knee;
  const hemW       = hipWidth * shape.hem;

  // Each leg narrows/widens symmetrically — half on side seam, half on inseam
  const kneeInward = (hipWidth - kneeW) * 0.5;
  const hemInward  = (hipWidth - hemW)  * 0.5;

  const sideKneeX    =  hipWidth - kneeInward;
  const sideHemX     =  hipWidth - hemInward;
  const inseamKneeX  = -ext   + kneeInward;
  const inseamHemX   = -ext   + hemInward;

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

  const hasSlash = !isBack && opts?.frontPocket === 'slant';
  if (hasSlash) clipPanelAtSlash(poly, sideWaistX, 3.5, 6);

  // SA offset — hem uses different allowance
  const saPoly = offsetPolygon(poly, (i, a, b) => {
    if (Math.abs(a.y - height) < 0.5 && Math.abs(b.y - height) < 0.5) return -hem;
    return -sa;
  });

  const effSeatDepth = hipLineY;

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
