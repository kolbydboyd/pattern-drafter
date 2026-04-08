// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Wide-Leg Trouser (Menswear) — higher rise, full-width leg with clean drape.
 * 32″ default inseam, 10″ default rise (mid-rise), +4″ ease default.
 * Flat front default (no pleats). Straight leg — hem width equals hip panel width.
 * Men's crotch proportions: smaller front extension, less CB raise than women's.
 * Fabric: wool suiting, cotton twill, linen, tencel twill.
 */

import {
  edgeAngle, crotchCurvePoints, sampleBezier, offsetPolygon, polyToPath,
  fmtInches, easeDistribution, insetCrotchBezier,
  buildSlantPocketBag, buildSlantPocketBacking, clipPanelAtSlash,
} from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

const PLEAT_DEPTH = 1.25; // inches per pleat (front panel only)

export default {
  id: 'wide-leg-trouser-m',
  name: 'Wide-Leg Trouser (M)',
  category: 'lower',
  difficulty: 'intermediate',
  priceTier: 'core',
  measurements: ['waist', 'hip', 'rise', 'thigh', 'inseam'],
  measurementDefaults: { inseam: 32, rise: 10 },

  options: {
    riseStyle: {
      type: 'select', label: 'Rise style',
      values: [
        { value: 'low',  label: 'Low rise (−1.5″)'       },
        { value: 'mid',  label: 'Mid rise (body rise)'   },
        { value: 'high', label: 'High rise (+1.5″)'      },
      ],
      default: 'mid',
    },
    riseOverride: { type: 'number', label: 'Rise override (inches)', default: 0, step: 0.25, min: 0, max: 18 },
    ease: {
      type: 'select', label: 'Fit',
      values: [
        { value: 'regular', label: 'Regular (+4″)',      reference: 'clean, contemporary'   },
        { value: 'wide',    label: 'Wide (+7″)',         reference: 'relaxed, Italian'       },
        { value: 'xwide',   label: 'Extra wide (+10″)', reference: 'avant-garde, Margiela'  },
      ],
      default: 'regular',
    },
    pleats: {
      type: 'select', label: 'Pleats (front only)',
      values: [
        { value: 'none',   label: 'Flat front',      reference: 'clean, modern'       },
        { value: 'single', label: 'Single pleat',    reference: 'classic, Italian'    },
        { value: 'double', label: 'Double pleat',    reference: 'full, heritage cut'  },
      ],
      default: 'none',
    },
    waistband: {
      type: 'select', label: 'Waistband',
      values: [
        { value: 'structured', label: 'Structured 1.5″ (button + hook-eye)', reference: 'dress trouser'  },
        { value: 'elastic',    label: 'Elastic casing',                       reference: 'pull-on, relaxed' },
      ],
      default: 'structured',
    },
    elasticWidth: {
      type: 'select', label: 'Elastic width',
      values: [
        { value: 0.75, label: '¾″' },
        { value: 1,    label: '1″' },
        { value: 1.5,  label: '1½″' },
      ],
      default: 1,
      showWhen: { waistband: 'elastic' },
    },
    pockets: {
      type: 'select', label: 'Front pockets',
      values: [
        { value: 'slant', label: 'Slant (western)', reference: 'chino, classic men\'s' },
        { value: 'side',  label: 'Side seam',       reference: 'hidden, clean'        },
        { value: 'none',  label: 'None',             reference: 'minimal'             },
      ],
      default: 'slant',
    },
    backPockets: {
      type: 'select', label: 'Back pockets',
      values: [
        { value: 'welt2', label: 'Welt ×2' },
        { value: 'none',  label: 'None'    },
      ],
      default: 'welt2',
    },
    fly: {
      type: 'select', label: 'Closure',
      values: [
        { value: 'zip',  label: 'Zip fly' },
        { value: 'none', label: 'None (elastic waistband)' },
      ],
      default: 'zip',
    },
    hem: {
      type: 'select', label: 'Hem',
      values: [
        { value: 1.5, label: '1.5″ straight (blind hem)' },
        { value: 2,   label: '2″ wide cuff fold'         },
      ],
      default: 1.5,
    },
    // Men's crotch defaults differ from women's — smaller front ext, less CB raise
    frontExt: { type: 'number', label: 'Front crotch ext', default: 1.25, step: 0.25, min: 0.5, max: 3   },
    backExt:  { type: 'number', label: 'Back crotch ext',  default: 2.25, step: 0.25, min: 1,   max: 4.5 },
    cbRaise:  { type: 'number', label: 'CB raise',         default: 1.0,  step: 0.25, min: 0,   max: 2   },
    sa: {
      type: 'select', label: 'Seam allowance',
      values: [
        { value: 0.5,   label: '½″' },
        { value: 0.625, label: '⅝″' },
      ],
      default: 0.625,
    },
  },

  pieces(m, opts) {
    const easeVal = opts.ease === 'xwide' ? 10 : opts.ease === 'wide' ? 7 : 4;
    const ease    = easeDistribution(easeVal);

    const sa       = parseFloat(opts.sa);
    const hem      = parseFloat(opts.hem);
    const frontExt = parseFloat(opts.frontExt);
    const backExt  = parseFloat(opts.backExt);
    const cbRaise  = parseFloat(opts.cbRaise);

    const RISE_OFFSETS = { low: -1.5, mid: 0, high: 1.5 };
    const baseRise   = m.rise || 10;
    const riseOff    = RISE_OFFSETS[opts.riseStyle] ?? 0;
    const crotchEase = 1.25;
    const rawRise    = parseFloat(opts.riseOverride) || (baseRise + riseOff);
    const rise       = rawRise + crotchEase;
    const inseam     = m.inseam || (m.outseam ? Math.max(1, m.outseam - rise) : 32);

    const numPleats  = opts.pleats === 'double' ? 2 : opts.pleats === 'single' ? 1 : 0;
    const pleatExtra = numPleats * PLEAT_DEPTH;

    let frontHipW = m.hip / 4 + ease.front + 0.5 + pleatExtra;
    let backHipW  = m.hip / 4 + ease.back;

    // Thigh ease check
    if (m.thigh) {
      const patternThigh = (frontHipW + backHipW + frontExt + backExt) * 2;
      const minThigh = m.thigh * 2 + 3;
      if (patternThigh < minThigh) {
        const perPanel = (minThigh - patternThigh) / 4;
        frontHipW += perPanel;
        backHipW  += perPanel;
        console.warn(`[wide-leg-trouser-m] Thigh ease insufficient — widened panels by ${perPanel.toFixed(2)}″ each`);
      }
    }

    const frontWaistW = m.waist / 4 + ease.front + pleatExtra;
    const backWaistW  = m.waist / 4 + ease.back;
    const hipLineY    = m.seatDepth || 7;
    const H           = rise + inseam;

    const pieces = [];

    // ── FRONT PANEL ──────────────────────────────────────────────────────────
    pieces.push(buildPanel({
      type: 'front', name: 'Front Panel',
      instruction: `Cut 2 (mirror L & R)${numPleats > 0
        ? ` · ${numPleats === 2 ? 'Double' : 'Single'} pleat ${fmtInches(PLEAT_DEPTH)} each, folds toward side seam`
        : ''}`,
      waistWidth: frontWaistW, hipWidth: frontHipW, hipLineY,
      height: H, rise, inseam,
      ext: frontExt, cbRaise: 0, sa, hem, isBack: false, numPleats, pleatDepth: PLEAT_DEPTH, opts,
    }));

    // ── BACK PANEL ───────────────────────────────────────────────────────────
    const backDartIntake = backHipW - backWaistW;

    pieces.push(buildPanel({
      type: 'back', name: 'Back Panel',
      instruction: `Cut 2 (mirror L & R) · CB raised ${fmtInches(cbRaise)}`,
      waistWidth: backWaistW + backDartIntake, hipWidth: backHipW, hipLineY,
      dartIntake: backDartIntake,
      height: H, rise, inseam,
      ext: backExt, cbRaise, sa, hem, isBack: true, opts,
    }));

    // ── WAISTBAND ────────────────────────────────────────────────────────────
    const garmentWaist = (frontHipW + backHipW) * 2;
    const wbCirc = (opts.waistband === 'elastic') ? garmentWaist + sa * 2 : m.waist + ease.total + pleatExtra * 2 + sa * 2;

    if (opts.waistband === 'structured') {
      pieces.push({
        id: 'waistband',
        name: 'Waistband (Structured)',
        instruction: `Cut 1 · Interface · 1.5″ finished · Button + hook-and-eye closure · Right side 1″ overlap extension`,
        dimensions: { length: wbCirc, width: 3 },
        type: 'rectangle', sa,
      });
    } else {
      const elasticW = parseFloat(opts.elasticWidth) || 1;
      const wbWidth  = (elasticW + 1) * 2;
      pieces.push({
        id: 'waistband',
        name: 'Waistband (Elastic Casing)',
        instruction: `Cut 1 · ${fmtInches(wbCirc)} long × ${fmtInches(wbWidth)} cut · Thread ${fmtInches(elasticW)} elastic = ${Math.round(m.waist * 0.9)}″ (~90% of waist)`,
        dimensions: { length: wbCirc, width: wbWidth },
        type: 'rectangle', sa,
      });
    }

    // ── FLY ──────────────────────────────────────────────────────────────────
    if (opts.fly === 'zip') {
      pieces.push({
        id: 'fly-shield',
        name: 'Fly Shield',
        instruction: 'Cut 1 · Interface · {serge} curved edge',
        dimensions: { width: 2.5, height: rise },
        type: 'pocket',
        sa,
      });
    }

    // ── FRONT POCKETS ────────────────────────────────────────────────────────
    if (opts.pockets === 'slant') {
      pieces.push(buildSlantPocketBacking({ bagWidth: 7, slashInset: 3.5, slashDepth: 7, bagDepth: 12, sa, instruction: 'Cut 2 (1 + 1 mirror) · Self fabric · Interface · Visible pocket front' }));
      pieces.push(buildSlantPocketBag({ bagWidth: 7, slashInset: 3.5, slashDepth: 7, bagDepth: 12, sa, instruction: 'Cut 2 (1 + 1 mirror) · Lining fabric · Pocket back (against body)' }));
    } else if (opts.pockets === 'side') {
      pieces.push({ id: 'side-bag', name: 'Side-Seam Pocket Bag', instruction: 'Cut 4 (2 per side) · Lining fabric', dimensions: { width: 7, height: 9 }, type: 'pocket', sa });
    }

    // ── BACK POCKETS ─────────────────────────────────────────────────────────
    if (opts.backPockets === 'welt2') {
      pieces.push({ id: 'back-welt', name: 'Back Welt Pocket', instruction: 'Cut 4 (2 welts + 2 bags) · ×2 pockets total', dimensions: { width: 5.5, height: 6 }, type: 'pocket', sa });
    }

    return pieces;
  },

  materials(m, opts) {
    const rise   = m.rise || 10;
    const notions = [
      { ref: 'interfacing-light', quantity: '0.5 yard (waistband + pocket facings)' },
    ];

    if (opts.waistband !== 'elastic' && opts.fly === 'zip') {
      const zipLen = Math.ceil(rise * 0.65);
      notions.push({ name: 'Invisible zipper', quantity: `${zipLen}″`, notes: 'Invisible (lapped) zip for clean fly finish' });
      notions.push({ name: 'Waistband button', quantity: '1', notes: '¾″ button or trouser hook' });
      notions.push({ name: 'Hook-and-eye', quantity: '1 set', notes: 'Size 2–3 at waistband overlap' });
    }
    if (opts.waistband === 'elastic') {
      const elasticW = parseFloat(opts.elasticWidth) || 1;
      notions.push({ name: `Elastic ${fmtInches(elasticW)}`, quantity: `${Math.round(m.waist * 0.9)}″`, notes: `Non-roll ${fmtInches(elasticW)} elastic (~90% of waist)` });
    }

    return buildMaterialsSpec({
      fabrics: ['wool-suiting', 'cotton-twill', 'linen', 'tencel-twill', 'gabardine'],
      notions,
      thread: 'poly-all',
      needle: 'universal-90',
      stitches: ['straight-2.5', 'straight-3', 'zigzag-small', 'blindhem'],
      notes: [
        'Wool suiting: press every seam with a damp press cloth and a tailor\'s ham at the crotch curve. Under-pressing is the top reason home-sewn trousers don\'t hang correctly.',
        'Stay-stitch the waist seam (⅝″ from edge) BEFORE attaching waistband — even stable wovens stretch on the bias at the waist.',
        'Grade seam allowances at the waistband to reduce bulk: trim each layer to a different width (⅜″, ¼″, ⅛″) before folding over.',
        'For invisible hem: fold up hem allowance, {press}, and hand-sew with a catch stitch. Mark the break while wearing the trouser with your shoes on.',
        'Wide-leg: let the trouser hang for 24 hours after completing before marking the hem — knit and woven fabrics both drop at the hem when hanging on the bias.',
        'Trouser break: full break (hem rests on top of shoe) looks traditional; half break (slight ripple at front) is modern. Mark with a pin while wearing.',
      ],
    });
  },

  instructions(m, opts) {
    const steps = [];
    let n = 1;
    const numPleats = opts.pleats === 'double' ? 2 : opts.pleats === 'single' ? 1 : 0;
    const hasFly    = opts.fly === 'zip';
    const rise      = m.rise || 10;

    if (opts.backPockets === 'welt2') {
      steps.push({
        step: n++, title: 'Prepare back welt pockets',
        detail: 'Mark pocket positions on back panels: 2.5″ below waist line, centered. Sew welt pieces {RST} on each side of marked opening. Slash opening. Turn welts through, {press}. Attach bag halves inside. Whipstitch bag sides together. Bar tack both ends of each opening.',
      });
    }

    if (opts.pockets === 'slant') {
      steps.push({ step: n++, title: 'Sew pocket backing to pocket bag',
        detail: 'Place pocket backing {RST} on pocket bag. Sew curved bottom and straight side edge, leaving the diagonal slash open. {clip} curve. Turn RS out, {press}. {topstitch} ¼″ from curve.' });
      steps.push({ step: n++, title: 'Attach pocket to front panel',
        detail: 'Align pocket unit\'s slash diagonal to front panel slash edge {RST}. Sew along slash. {clip}. Turn pocket to WS, {press}. {understitch}. {baste} pocket top to waist SA and pocket side to side SA.' });
    } else if (opts.pockets === 'side') {
      steps.push({ step: n++, title: 'Prepare side-seam pockets', detail: 'Sew each bag pair together along curved edge {RST}. {press}. {baste} straight edges to front and back side SAs at pocket position.' });
    }

    if (numPleats > 0) {
      steps.push({
        step: n++, title: `Form front pleat${numPleats === 2 ? 's' : ''}`,
        detail: `On RS, fold each pleat toward side seam enclosing ${fmtInches(PLEAT_DEPTH)}. Pin at waist. {baste} at ⅜″. {press} first 5–6″ from waist with steam — do NOT press full leg length.`,
      });
    }

    steps.push({ step: n++, title: 'Stay-stitch waist', detail: 'Stay-stitch ⅝″ from waist edge on all panels before attaching waistband. Sew directionally (side seam toward CF; side seam toward CB).' });

    if (hasFly) {
      steps.push({ step: n++, title: 'Install zip fly', detail: 'Interface fly shield. Sew front CF seam below fly opening only. {clip} crotch curve. Sew invisible zipper to right CF opening, close fly with shield behind left CF. {topstitch} J-curve 1″ from fly.' });
    } else {
      steps.push({ step: n++, title: 'Sew center front seam', detail: 'Join front panels {RST}. {clip} curve. {press} open or {serge}.' });
    }

    steps.push({ step: n++, title: 'Sew center back seam', detail: 'Join back panels at CB {RST}. {clip} curve. {press} open. {serge} each side separately.' });
    steps.push({ step: n++, title: 'Sew side seams', detail: 'Join front to back at side seams {RST}. For side pockets: sew above and below opening; sew around bag. {press} seams open. {serge}.' });
    steps.push({ step: n++, title: 'Sew inseam', detail: 'One continuous seam from front hem through crotch to back hem. {clip} curve. {press} toward back. {serge}.' });

    if (opts.waistband === 'structured') {
      steps.push({ step: n++, title: 'Construct waistband', detail: 'Interface outer waistband. Sew to trouser waist {RST}. Fold over to inside. Grade SA layers to reduce bulk. {topstitch} or {slipstitch}. Install button and hook-and-eye.' });
    } else {
      steps.push({ step: n++, title: 'Construct elastic waistband', detail: 'Fold casing in half {WST}, {press}. Sew to trouser waist {RST}. Fold over, {topstitch} leaving 2″ gap. Thread elastic (~90% of waist), overlap 1″, {zigzag}. Close gap. {topstitch} edge.' });
    }

    steps.push({ step: n++, title: 'Hem — fit first', detail: `Try on with your shoes. Mark break point. Fold up ${fmtInches(parseFloat(opts.hem))} twice, {press}. Hand-sew with catch stitch or blind hem for invisible finish.` });
    steps.push({ step: n++, title: 'Finish', detail: '{press} entire trouser with steam. Press front crease (align side seam to inseam, press fold). Bar tack all pocket openings and crotch junction.' });

    return steps;
  },

  variants: [
    {
      id: 'pleated-trouser-m',
      name: 'Pleated Trouser (M)',
      defaults: { pleats: 'single', ease: 'regular', riseStyle: 'high', waistband: 'structured' },
    },
  ],
};


// ── Panel builder — straight leg, no taper ────────────────────────────────
// Verbatim from wide-leg-trouser-w.js. Private function — do not export.

function buildPanel({ type, name, instruction, waistWidth, hipWidth, hipLineY, height, rise, inseam, ext, cbRaise, sa, hem, isBack, numPleats = 0, pleatDepth = 0, opts, dartIntake = 0 }) {
  const ccp      = crotchCurvePoints(0, 0, rise, ext, isBack, cbRaise);
  const curvePts = sampleBezier(ccp.p0, ccp.p1, ccp.p2, ccp.p3, 96);

  const sideWaistX = waistWidth;

  const poly = [];
  poly.push({ x: 0,            y: isBack ? -cbRaise : 0 });
  poly.push({ x: sideWaistX,   y: 0       });
  poly.push({ x: hipWidth,     y: hipLineY });
  poly.push({ x: hipWidth,     y: height  });
  poly.push({ x: -ext,         y: height  });
  poly.push({ x: -ext,         y: rise    });
  for (let i = curvePts.length - 2; i >= 1; i--) poly.push({ ...curvePts[i], curve: true });
  if (isBack && cbRaise > 0) poly.push({ x: 0, y: cbRaise });

  const hasSlash = !isBack && opts?.pockets === 'slant';
  if (hasSlash) clipPanelAtSlash(poly, sideWaistX, 3.5, 7);

  const saPoly = offsetPolygon(poly, (i, a, b) => {
    if (Math.abs(a.y - height) < 0.5 && Math.abs(b.y - height) < 0.5) return -hem;
    return -sa;
  });

  const dims = [
    { label: fmtInches(waistWidth) + ' waist', x1: 0, y1: -0.5, x2: sideWaistX, y2: -0.5, type: 'h' },
    { label: fmtInches(hipWidth)   + ' hip',   x1: 0, y1: hipLineY + 0.4, x2: hipWidth, y2: hipLineY + 0.4, type: 'h', color: '#b8963e' },
    { label: fmtInches(rise)   + ' rise',   x: hipWidth + 1.2, y1: 0,    y2: rise,   type: 'v' },
    { label: fmtInches(inseam) + ' inseam', x: hipWidth + 1.2, y1: rise, y2: height, type: 'v' },
    { label: fmtInches(height) + ' total',  x: hipWidth + 2.3, y1: 0,    y2: height, type: 'v' },
    { label: fmtInches(ext)    + ' ext',    x1: -ext, y1: rise + 0.4, x2: 0, y2: rise + 0.4, type: 'h', color: '#c44' },
  ];

  const pleats = [];
  if (!isBack && numPleats >= 1) pleats.push({ x: waistWidth * 0.25, depth: pleatDepth, y1: 0, y2: 4.5 });
  if (!isBack && numPleats >= 2) pleats.push({ x: waistWidth * 0.5,  depth: pleatDepth, y1: 0, y2: 4.5 });

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
    { x: hipWidth, y: hipLineY,        angle: edgeAngle({ x: hipWidth, y: 0 }, { x: hipWidth, y: height }) },
    ...(isBack ? [{ x: hipWidth, y: hipLineY + 0.25, angle: edgeAngle({ x: hipWidth, y: 0 }, { x: hipWidth, y: height }) }] : []),
    { x: -ext,     y: rise,            angle: edgeAngle({ x: -ext, y: height }, { x: -ext, y: rise }) },
    ...(isBack ? [{ x: -ext,     y: rise - 0.25,     angle: edgeAngle({ x: -ext, y: height }, { x: -ext, y: rise }) }] : []),
    { x: hipWidth, y: kneeY,           angle: edgeAngle({ x: hipWidth, y: hipLineY }, { x: hipWidth, y: height }) },
    { x: -ext,     y: kneeY,           angle: edgeAngle({ x: -ext, y: rise }, { x: -ext, y: height }) },
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
    // LOCKED — crotch curve cut & stitch lines are finalized. Do not modify.
    crotchBezierSA: insetCrotchBezier(ccp, sa), type: 'panel', opts,
  };
}
