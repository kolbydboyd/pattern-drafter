// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Pleated Trousers — high-waisted wide-leg dress trousers.
 * 31 inch default inseam, 12 inch rise, double pleat default, +6″ ease.
 * Straight leg (no taper). Welt back pockets ×2. Zip fly.
 * Curtain waistband 2″ finished with button, hook-and-eye, and French bearer.
 */

import {
  edgeAngle, crotchCurvePoints, sampleBezier, offsetPolygon, polyToPath,
  fmtInches, easeDistribution, insetCrotchBezier,
  buildSlantPocketBag, buildSlantPocketFacing
} from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

const PLEAT_DEPTH = 1.5; // inches per pleat (front panel only)

export default {
  id: 'pleated-trousers',
  name: 'Pleated Trousers',
  category: 'lower',
  difficulty: 'advanced',
  priceTier: 'tailored',
  measurements: ['waist', 'hip', 'rise', 'thigh', 'inseam'],
  measurementDefaults: { inseam: 31 },

  options: {
    ease: {
      type: 'select', label: 'Fit',
      values: [
        { value: 'regular', label: 'Regular (+4\u2033)', reference: 'classic, off-the-rack' },
        { value: 'relaxed', label: 'Relaxed (+6\u2033)',   reference: 'skater, workwear'      },
        { value: 'wide',    label: 'Wide (+8\u2033)',      reference: 'Margiela, deconstructed' },
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
    pleats: {
      type: 'select', label: 'Pleats (front only)',
      values: [
        { value: 'none',   label: 'No pleats',    reference: 'flat front, modern' },
        { value: 'single', label: 'Single pleat', reference: 'classic, Italian'   },
        { value: 'double', label: 'Double pleat', reference: 'full, Savile Row'   },
      ],
      default: 'double',
    },
    riseStyle: {
      type: 'select', label: 'Rise style',
      values: [
        { value: 'ultra-low',  label: 'Ultra low (2000s, −2.5″)'  },
        { value: 'low',        label: 'Low rise (−1.5″)'           },
        { value: 'mid',        label: 'Mid rise (body rise)'       },
        { value: 'high',       label: 'High rise (+1.5″)'          },
        { value: 'ultra-high', label: 'Ultra high (paperbag, +3″)' },
      ],
      default: 'high',
    },
    riseOverride: { type: 'number', label: 'Rise override (inches)', default: 0, step: 0.25, min: 0, max: 18 },
    frontExt: { type: 'number', label: 'Front crotch ext', default: 1.75, step: 0.25, min: 0.5, max: 3   },
    backExt:  { type: 'number', label: 'Back crotch ext',  default: 3.0,  step: 0.25, min: 1,   max: 4.5 },
    cbRaise:  { type: 'number', label: 'CB raise',         default: 1.0,  step: 0.25, min: 0,   max: 2.5 },
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
        { value: 1.5, label: '1½″'                },
        { value: 2,   label: '2″ (blind hem)'      },
        { value: 2.5, label: '2½″ (cuff option)'   },
      ],
      default: 2,
    },
  },

  pieces(m, opts) {
    const ease = easeDistribution(opts.ease || 'wide');

    const sa       = parseFloat(opts.sa);
    const hem      = parseFloat(opts.hem);
    const frontExt = parseFloat(opts.frontExt);
    const backExt  = parseFloat(opts.backExt);
    const cbRaise  = parseFloat(opts.cbRaise);

    const numPleats  = opts.pleats === 'double' ? 2 : opts.pleats === 'single' ? 1 : 0;
    const pleatExtra = numPleats * PLEAT_DEPTH;

    const RISE_OFFSETS = { 'ultra-low': -2.5, low: -1.5, mid: 0, high: 1.5, 'ultra-high': 3.0 };
    const baseRise  = m.rise || 12;
    const riseOff   = RISE_OFFSETS[opts.riseStyle] ?? 0;
    const rise      = parseFloat(opts.riseOverride) || (baseRise + riseOff);
    const inseam = m.outseam ? Math.max(1, m.outseam - rise) : (m.inseam || 31);

    let frontHipW   = m.hip / 4 + ease.front + pleatExtra;
    let backHipW    = m.hip / 4 + ease.back;

    // Thigh ease check
    if (m.thigh) {
      const patternThigh = (frontHipW + backHipW + frontExt + backExt) * 2;
      const minThigh = m.thigh * 2 + 3;
      if (patternThigh < minThigh) {
        const perPanel = (minThigh - patternThigh) / 4;
        frontHipW += perPanel;
        backHipW += perPanel;
        console.warn(`[pleated-trousers] Thigh ease insufficient (${(patternThigh - m.thigh * 2).toFixed(1)}″) — widened panels by ${perPanel.toFixed(2)}″ each`);
      } else if (patternThigh - m.thigh * 2 < 2) {
        console.warn(`[pleated-trousers] Thigh ease is tight: ${(patternThigh - m.thigh * 2).toFixed(1)}″ (recommend ≥ 2″)`);
      }
    }

    const frontWaistW = m.waist / 4 + ease.front + pleatExtra;
    const backWaistW  = m.waist / 4 + ease.back;
    const hipLineY    = m.seatDepth || 7;
    const H           = rise + inseam;

    const pieces = [];

    // Straight leg — hem width matches hip panel (no taper)
    pieces.push(buildPanel({
      type: 'front', name: 'Front Panel',
      instruction: `Cut 2 (mirror L & R)${numPleats > 0 ? ` · ${numPleats === 2 ? 'Double' : 'Single'} pleat folded toward side seam, ${fmtInches(PLEAT_DEPTH)} each` : ''}`,
      waistWidth: frontWaistW, hipWidth: frontHipW, hipLineY,
      height: H, rise, inseam,
      ext: frontExt, cbRaise: 0, sa, hem, isBack: false, numPleats, pleatDepth: PLEAT_DEPTH, opts,
    }));

    const backDartIntake = backHipW - backWaistW;

    pieces.push(buildPanel({
      type: 'back', name: 'Back Panel',
      instruction: `Cut 2 (mirror L & R) · CB raised ${fmtInches(cbRaise)}`,
      waistWidth: backWaistW + backDartIntake, hipWidth: backHipW, hipLineY,
      dartIntake: backDartIntake,
      height: H, rise, inseam,
      ext: backExt, cbRaise, sa, hem, isBack: true, opts,
    }));

    // ── CURTAIN WAISTBAND (2″ finished) ──
    const wbLen = m.waist + ease.total + pleatExtra * 2 + sa * 2;
    const wbW   = 4;  // 2″ finished = 4″ cut (doubled + SA)
    pieces.push({
      id: 'waistband',
      name: 'Waistband (Curtain)',
      instruction: `Cut 1 · Interface · 2″ finished · Button + hook-and-eye + French bearer · CF overlap 1½″`,
      dimensions: { length: wbLen, width: wbW },
      type: 'rectangle', sa,
    });

    // French bearer (inner extension at CF that hooks to zipper)
    pieces.push({
      id: 'bearer',
      name: 'French Bearer',
      instruction: 'Cut 1 · Interface · Attaches to inside waistband at CF right side · Hook-and-eye closure',
      dimensions: { width: 3, height: wbW },
      type: 'pocket',
    });

    // ── FLY ──
    pieces.push({ id: 'fly-shield', name: 'Fly Shield', instruction: 'Cut 1 · Interface · {serge} edge', dimensions: { width: 2.5, height: rise }, type: 'pocket' });

    // ── POCKETS ──
    pieces.push({ id: 'welt-back',  name: 'Back Welt Pocket', instruction: 'Cut 4 (2 welts + 2 bags) · ×2 pockets total', dimensions: { width: 5.5, height: 6 }, type: 'pocket' });
    if (opts.frontPocket === 'slant') {
      pieces.push(buildSlantPocketFacing({ width: 2, height: 7, sa, instruction: 'Cut 2 (1 + 1 mirror — flip fabric for second) \xb7 Interface or match fabric' }));
      pieces.push(buildSlantPocketBag({ width: 7, height: 12, sa, instruction: 'Cut 2 (1 + 1 mirror) \xb7 Lining fabric' }));
    }
    if (opts.frontPocket === 'side') {
      pieces.push({ id: 'side-bag', name: 'Side-Seam Pocket Bag', instruction: 'Cut 4 (2 per side)', dimensions: { width: 7, height: 9 }, type: 'pocket' });
    }

    // ── BELT LOOPS ──
    pieces.push({ id: 'belt-loop', name: 'Belt Loops', instruction: `Cut ${m.waist > 36 ? 7 : 6} · ¾″ finished`, dimensions: { width: 1.75, height: 0.75 }, type: 'pocket' });

    return pieces;
  },

  materials(m, opts) {
    const notions = [
      { ref: 'interfacing-med', quantity: '0.75 yard (waistband + facings + bearer)' },
      { ref: 'interfacing-heavy', quantity: '0.25 yard (waistband outer layer only)' },
      { name: 'Metal zipper',    quantity: `${Math.ceil((m.rise || 12) * 0.6)}″`, notes: 'Concealed or metal coil' },
      { name: 'Waistband button', quantity: '1', notes: '¾″ shank button, quality metal' },
      { name: 'Hook-and-eye',    quantity: '2 sets', notes: 'Size 3 - waistband + French bearer' },
    ];

    return buildMaterialsSpec({
      fabrics: ['wool-suiting', 'rayon-twill', 'linen'],
      notions,
      thread: 'poly-all',
      needle: 'universal-90',
      stitches: ['straight-2.5', 'straight-3', 'zigzag-small', 'bartack'],
      notes: [
        '{press} with steam on a wool setting. Always use a {press} cloth to prevent shine on wool and rayon.',
        'Interface ALL waistband layers for structure - use heavy interfacing on the outer layer',
        'The French bearer is the inner hook extension at CF that keeps the waistband flat under the trouser front. Cut from matching fabric, interface, fold and {press}.',
        'Pre-wash linen (hot) before cutting. Do not pre-wash wool suiting - dry clean before cutting if needed.',
        'Fell seams optional on outseam and inseam for a tailored finish (see jeans); otherwise {serge}/{zigzag}.',
        'Hem note: dress trousers should have a slight BREAK at the shoe - hem at the top of the shoe, allowing ½–¾″ of fabric to rest on the shoe. Fit before hemming.',
        'Bar tack all pocket openings and crotch junction.',
      ],
    });
  },

  instructions(m, opts) {
    const steps = [];
    let n = 1;
    const numPleats = opts.pleats === 'double' ? 2 : opts.pleats === 'single' ? 1 : 0;

    steps.push({
      step: n++, title: 'Prepare back welt pockets',
      detail: 'Mark pocket positions on back panels (2.5″ below waist, centered in panel). Sew bound welts, slash, turn, {press}. Attach bag halves. Whipstitch bag sides. Bar tack ends.',
    });
    steps.push({
      step: n++, title: 'Prepare slant pockets',
      detail: 'Interface facing. Sew facing to front slash line {RST}. {clip}, turn, {press}. {understitch}. Attach pocket bag. {baste} edges to panel.',
    });

    if (numPleats > 0) {
      steps.push({
        step: n++, title: `Form ${numPleats === 2 ? 'double' : 'single'} front pleat${numPleats === 2 ? 's' : ''}`,
        detail: `Mark pleat fold line${numPleats === 2 ? 's' : ''} on RS. Fold each pleat toward side seam enclosing ${fmtInches(PLEAT_DEPTH)}. Pin at waist. {baste} ⅜″ from edge. {press} pleat down 4–5″ with steam from WS, then allow to drape. The pleat should release naturally below the hip.`,
      });
    }

    steps.push({
      step: n++, title: 'Install zip fly',
      detail: 'Interface fly shield. Sew fronts at CF from crotch to fly bottom. Sew zipper to right CF. Sew fly shield to left CF. {topstitch} fly J-curve from RS.',
    });
    steps.push({ step: n++, title: 'Sew center back seam', detail: 'Join backs at CB. {clip} curve. {serge} or {press} open.' });
    steps.push({ step: n++, title: 'Sew side seams', detail: 'Join front to back at side seams {RST}. {press} open. {serge} each SA separately.' });
    steps.push({ step: n++, title: 'Sew inseam', detail: 'Continuous seam hem to hem. {clip} crotch curve. {serge} together. {press} toward back.' });

    steps.push({
      step: n++, title: 'Construct curtain waistband',
      detail: 'Apply heavy interfacing to outer waistband, medium to inner. Fold lengthwise, {press}. Sew short ends - note CF right side has a 1½″ extension for overlap. Sew to trousers waist {RST}. Fold over. {topstitch} or {slipstitch} inside. Install button at CF overlap. Attach hook-and-eye inside overlap.',
    });
    steps.push({
      step: n++, title: 'Construct and attach French bearer',
      detail: 'Interface bearer piece. Fold in half {WST}, {press}. Sew short ends and long open edge, leaving a 2″ gap for turning. Trim SA to 3mm, {clip} corners diagonally. Turn RS out through gap, push corners with {point turner}. {press}. {slipstitch} gap closed. Attach to inside of right CF waistband/fly area. The bearer extends ½–1″ below waistband, hooks onto the inside zipper tape or a bar on the left side for a smooth, flat CF closure.',
    });
    steps.push({
      step: n++, title: 'Attach belt loops',
      detail: 'Fold, {press}, {topstitch} loop strips. Attach at CB, side seams, flanking CF. Bar tack top and bottom.',
    });
    steps.push({
      step: n++, title: 'Hem - fit first',
      detail: `Try on trousers with the shoes you intend to wear. Mark the hem so the trouser rests just at the top of the shoe with a slight break (½–¾″ of fabric drapes forward). Fold up ${fmtInches(parseFloat(opts.hem))} twice or once with serged edge. {press}. Hand {slipstitch} or blind hem stitch for an invisible finish on dress trousers.`,
    });
    steps.push({ step: n++, title: 'Finish', detail: '{press} entire garment with steam and {press} cloth. Bar tack all stress points. Steam-{press} front trouser creases - align side seam to inseam and {press} fold from waist to hem.' });

    return steps;
  },
};


// ── Panel builder — straight leg (no knee taper) ──────────────────────────

function buildPanel({ type, name, instruction, waistWidth, hipWidth, hipLineY, height, rise, inseam, ext, cbRaise, sa, hem, isBack, numPleats = 0, pleatDepth = 0, opts, dartIntake = 0 }) {
  const ccp      = crotchCurvePoints(0, 0, rise, ext, isBack, cbRaise);
  const curvePts = sampleBezier(ccp.p0, ccp.p1, ccp.p2, ccp.p3, 96);

  // Waist-to-hip shaping: all taper on side seam, center seam stays at x=0
  const sideWaistX = waistWidth;

  const poly = [];
  poly.push({ x: 0,            y: isBack ? -cbRaise : 0 });   // waist at center seam (raised on back)
  poly.push({ x: sideWaistX,   y: 0       });   // waist at side seam
  poly.push({ x: hipWidth,     y: hipLineY });   // hip at side seam
  poly.push({ x: hipWidth,     y: height  });   // hem at side seam
  poly.push({ x: -ext,         y: height  });
  poly.push({ x: -ext,         y: rise    });
  for (let i = curvePts.length - 2; i >= 1; i--) poly.push({ ...curvePts[i], curve: true });
  if (isBack && cbRaise > 0) poly.push({ x: 0, y: cbRaise }); // CB seam top

  const saPoly = offsetPolygon(poly, (i, a, b) => {
    if (Math.abs(a.y - height) < 0.5 && Math.abs(b.y - height) < 0.5) return -hem;
    return -sa;
  });

  const dims = [
    { label: fmtInches(waistWidth) + ' waist', x1: 0, y1: -0.5, x2: sideWaistX, y2: -0.5, type: 'h' },
    { label: fmtInches(hipWidth) + ' hip',     x1: 0,            y1: hipLineY + 0.4, x2: hipWidth, y2: hipLineY + 0.4, type: 'h', color: '#b8963e' },
    { label: fmtInches(rise)   + ' rise',      x: hipWidth + 1.2, y1: 0,          y2: rise,                   type: 'v' },
    { label: fmtInches(inseam) + ' inseam',    x: hipWidth + 1.2, y1: rise,       y2: height,                 type: 'v' },
    { label: fmtInches(height) + ' total',     x: hipWidth + 2.3, y1: 0,          y2: height,                 type: 'v' },
    { label: fmtInches(ext)    + ' ext',       x1: -ext, y1: rise + 0.4, x2: 0, y2: rise + 0.4,           type: 'h', color: '#c44' },
  ];

  const pleats = [];
  if (!isBack && numPleats >= 1) pleats.push({ x: waistWidth * 0.25, depth: pleatDepth, y1: 0, y2: 4.5 });
  if (!isBack && numPleats >= 2) pleats.push({ x: waistWidth * 0.5,  depth: pleatDepth, y1: 0, y2: 4.5 });

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

  const kneeY = rise + inseam * 0.55;
  const notches = [
    { x: hipWidth, y: hipLineY, angle: edgeAngle({ x: hipWidth, y: 0 }, { x: hipWidth, y: height }) },
    { x: -ext,     y: rise,     angle: edgeAngle({ x: -ext, y: height }, { x: -ext, y: rise }) },
    { x: hipWidth, y: kneeY,    angle: edgeAngle({ x: hipWidth, y: hipLineY }, { x: hipWidth, y: height }) },
    { x: -ext,     y: kneeY,    angle: edgeAngle({ x: -ext, y: rise }, { x: -ext, y: height }) },
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
    notches, pleats, darts, crotchBezier: ccp,
    // LOCKED — crotch curve cut & stitch lines are finalized. Do not modify
    // crotchBezier, crotchBezierSA, or their rendering in pattern-view.js.
    crotchBezierSA: insetCrotchBezier(ccp, sa), type: 'panel', opts,
  };
}
