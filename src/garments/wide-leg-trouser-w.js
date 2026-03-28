// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Wide-Leg Trouser (Womenswear) — drapey high-waisted wide leg.
 * 30″ default inseam, 11″ default rise (high waist), +5″ ease.
 * Straight leg — hem width equals hip panel width (no taper).
 * Single pleat default (front only, 1.25″, folds toward side seam).
 * Fabric: wool crepe, rayon twill, tencel twill, linen — drapey 5–8 oz.
 */

import {
  edgeAngle, crotchCurvePoints, sampleBezier, offsetPolygon, polyToPath,
  fmtInches, easeDistribution,
} from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

const PLEAT_DEPTH = 1.25; // inches per pleat (front panel only)

export default {
  id: 'wide-leg-trouser-w',
  name: 'Wide-Leg Trouser (W)',
  category: 'lower',
  difficulty: 'intermediate',
  priceTier: 'core',
  measurements: ['waist', 'hip', 'rise', 'thigh', 'inseam'],
  measurementDefaults: { inseam: 30, rise: 11 },

  options: {
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
    ease: {
      type: 'select', label: 'Fit',
      values: [
        { value: 'regular', label: 'Regular (+3″)',    reference: 'classic, off-the-rack'  },
        { value: 'wide',    label: 'Wide (+5″)',      reference: 'Margiela, deconstructed' },
        { value: 'xwide',   label: 'Extra wide (+7″)', reference: 'avant-garde, oversized'  },
      ],
      default: 'wide',
    },
    pleats: {
      type: 'select', label: 'Pleats (front only)',
      values: [
        { value: 'none',   label: 'No pleats',    reference: 'flat front, modern' },
        { value: 'single', label: 'Single pleat', reference: 'classic, Italian'   },
        { value: 'double', label: 'Double pleat', reference: 'full, Savile Row'   },
      ],
      default: 'single',
    },
    waistband: {
      type: 'select', label: 'Waistband',
      values: [
        { value: 'structured', label: 'Structured 1.5″ (button + hook-eye)', reference: 'dress trouser, Dickies'  },
        { value: 'elastic',    label: 'Elastic casing',                       reference: 'chef pant, pull-on'     },
        { value: 'wide',       label: 'Wide 2.5″ petersham / contoured',      reference: 'petersham, contoured'   },
      ],
      default: 'structured',
    },
    pockets: {
      type: 'select', label: 'Front pockets',
      values: [
        { value: 'slant',    label: 'Slant (western)',  reference: 'chino, Western'  },
        { value: 'side',     label: 'Side seam',        reference: 'hidden, clean'   },
        { value: 'welt',     label: 'Welt (front)'     },
        { value: 'none',     label: 'None',             reference: 'minimal'         },
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
    frontExt: { type: 'number', label: 'Front crotch ext', default: 1.5, step: 0.25, min: 0.5, max: 3   },
    backExt:  { type: 'number', label: 'Back crotch ext',  default: 2.75, step: 0.25, min: 1,  max: 4.5 },
    cbRaise:  { type: 'number', label: 'CB raise',         default: 0.75, step: 0.25, min: 0,  max: 2   },
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
    const easeVal = opts.ease === 'xwide' ? 7 : opts.ease === 'wide' ? 5 : 3;
    const ease    = easeDistribution(easeVal);

    const sa       = parseFloat(opts.sa);
    const hem      = parseFloat(opts.hem);
    const frontExt = parseFloat(opts.frontExt);
    const backExt  = parseFloat(opts.backExt);
    const cbRaise  = parseFloat(opts.cbRaise);

    const RISE_OFFSETS = { 'ultra-low': -2.5, low: -1.5, mid: 0, high: 1.5, 'ultra-high': 3.0 };
    const baseRise  = m.rise || 11;
    const riseOff   = RISE_OFFSETS[opts.riseStyle] ?? 0;
    const rise      = parseFloat(opts.riseOverride) || (baseRise + riseOff);
    const inseam = m.outseam ? Math.max(1, m.outseam - rise) : (m.inseam || 30);

    const numPleats  = opts.pleats === 'double' ? 2 : opts.pleats === 'single' ? 1 : 0;
    const pleatExtra = numPleats * PLEAT_DEPTH;

    const frontHipW   = m.hip / 4 + ease.front + pleatExtra;
    const backHipW    = m.hip / 4 + ease.back;
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
    const wbCirc = m.hip + ease.total + pleatExtra * 2 + sa * 2;

    if (opts.waistband === 'structured') {
      // 1.5″ finished = 3″ cut
      pieces.push({
        id: 'waistband',
        name: 'Waistband (Structured)',
        instruction: `Cut 1 · Interface · 1.5″ finished · Button + hook-and-eye closure · CF right side 1″ overlap extension`,
        dimensions: { length: wbCirc, width: 3 },
        type: 'rectangle', sa,
      });
    } else if (opts.waistband === 'elastic') {
      // 1.25″ casing = 2.5″ cut
      pieces.push({
        id: 'waistband',
        name: 'Waistband (Elastic Casing)',
        instruction: `Cut 1 · ${fmtInches(wbCirc)} long × 2.5″ cut (1.25″ finished casing) · Thread 1″ elastic = waist measurement − 1″`,
        dimensions: { length: wbCirc, width: 2.5 },
        type: 'rectangle', sa,
      });
    } else {
      // Wide 2.5″ finished = 5″ cut
      pieces.push({
        id: 'waistband',
        name: 'Waistband (Wide / Petersham)',
        instruction: `Cut 1 · Interface · 2.5″ finished · Contour curved edge to match waist curve · Button + hook-and-eye`,
        dimensions: { length: wbCirc, width: 5 },
        type: 'rectangle', sa,
      });
    }

    // ── FLY ──────────────────────────────────────────────────────────────────
    if (opts.fly === 'zip') {
      pieces.push({
        id: 'fly-shield',
        name: 'Fly Shield',
        instruction: 'Cut 1 · Interface · Serge curved edge',
        dimensions: { width: 2.5, height: rise },
        type: 'pocket',
      });
    }

    // ── FRONT POCKETS ────────────────────────────────────────────────────────
    if (opts.pockets === 'slant') {
      pieces.push({ id: 'slant-facing', name: 'Slant Pocket Facing', instruction: 'Cut 2 · Interface or self-fabric', dimensions: { width: 2, height: 7 }, type: 'pocket' });
      pieces.push({ id: 'slant-bag',    name: 'Slant Pocket Bag',    instruction: 'Cut 2 · Lining fabric',           dimensions: { width: 7, height: 11.5 }, type: 'pocket' });
    } else if (opts.pockets === 'side') {
      pieces.push({ id: 'side-bag', name: 'Side-Seam Pocket Bag', instruction: 'Cut 4 (2 per side) · Lining fabric', dimensions: { width: 7, height: 9 }, type: 'pocket' });
    } else if (opts.pockets === 'welt') {
      pieces.push({ id: 'front-welt', name: 'Front Welt Pocket', instruction: 'Cut 4 (2 welts + 2 bags) · ×2 pockets total', dimensions: { width: 5, height: 6 }, type: 'pocket' });
    }

    // ── BACK POCKETS ─────────────────────────────────────────────────────────
    if (opts.backPockets === 'welt2') {
      pieces.push({ id: 'back-welt', name: 'Back Welt Pocket', instruction: 'Cut 4 (2 welts + 2 bags) · ×2 pockets total', dimensions: { width: 5.5, height: 6 }, type: 'pocket' });
    }

    return pieces;
  },

  materials(m, opts) {
    const easeVal   = opts.ease === 'xwide' ? 7 : opts.ease === 'wide' ? 5 : 3;
    const rise      = m.rise || 11;
    const notions   = [
      { ref: 'interfacing-light', quantity: '0.5 yard (waistband + pocket facings)' },
    ];

    if (opts.waistband !== 'elastic' && opts.fly === 'zip') {
      const zipLen = Math.ceil(rise * 0.65);
      notions.push({ name: 'Invisible zipper', quantity: `${zipLen}″`, notes: 'Invisible (lapped) zipper for clean finish' });
      notions.push({ name: 'Waistband button', quantity: '1', notes: '¾″ button or hook' });
      notions.push({ name: 'Hook-and-eye', quantity: '1 set', notes: 'Size 2–3 at waistband overlap' });
    }
    if (opts.waistband === 'elastic') {
      notions.push({ name: 'Elastic 1″', quantity: `${Math.round(m.waist - 1)}″`, notes: 'Non-roll elastic for waistband casing' });
    }
    if (opts.waistband === 'wide') {
      notions.push({ name: 'Petersham ribbon', quantity: `${Math.round(m.waist + 4)}″`, notes: '2.5″ wide petersham — optional facing for wide waistband interior' });
      notions.push({ name: 'Hook-and-eye', quantity: '2 sets', notes: 'Size 3 — waistband closure' });
    }

    return buildMaterialsSpec({
      fabrics: ['wool-crepe', 'rayon-twill', 'tencel-twill', 'linen-light'],
      notions,
      thread: 'poly-all',
      needle: 'universal-80',
      stitches: ['straight-2.5', 'straight-3', 'zigzag-small', 'blindhem'],
      notes: [
        'Drapey fabrics hang better on wide legs — avoid stiff canvas or structured wovens that will tent at the hip',
        'Use a universal 80/12 needle for lighter fabrics (rayon, lawn); step up to 90/14 for wool or linen',
        'Stay-stitch the waist seam (⅝″ from edge) BEFORE attaching waistband — drapey fabrics stretch on the bias at the waist',
        'Press pleats with steam from the WS — use a press cloth on rayon and wool to prevent shine',
        'Grade seam allowances at the waistband to reduce bulk: trim each layer to a different width before folding over',
        'For an invisible hem: fold up hem allowance, press, and hand-sew with a catch stitch or use a blind hem foot at the shortest stitch length',
        'Pre-wash rayon and tencel before cutting — both can shrink 3–5% and they are not dry-cleanable',
        'Linen note: wash in hot water twice to preshrink fully. Press damp with high steam.',
        'Trouser break: fit the hem while wearing the shoes you plan to wear — mark break at the top of the shoe, approximately ½–¾″ of fabric resting forward on the shoe.',
      ],
    });
  },

  instructions(m, opts) {
    const steps = [];
    let n = 1;
    const numPleats = opts.pleats === 'double' ? 2 : opts.pleats === 'single' ? 1 : 0;
    const hasFly    = opts.fly === 'zip';
    const rise      = m.rise || 11;

    // Back pockets first
    if (opts.backPockets === 'welt2') {
      steps.push({
        step: n++, title: 'Prepare back welt pockets',
        detail: 'Mark pocket positions on back panels: 2.5″ below waist line, centered. Sew welt pieces (RST) on each side of marked opening. Slash opening. Turn welts through, press. Attach bag halves inside. Whipstitch bag sides together. Bar tack both ends of each opening.',
      });
    }

    // Front pockets
    if (opts.pockets === 'slant') {
      steps.push({
        step: n++, title: 'Prepare slant pockets',
        detail: 'Interface facing. Sew facing to front panel along slash line (RST). Clip curve, turn, press. Understitch facing. Attach pocket bag to facing bottom. Baste bag edges to panel edges.',
      });
    } else if (opts.pockets === 'side') {
      steps.push({
        step: n++, title: 'Prepare side-seam pockets',
        detail: 'Sew each bag pair together along curved pocket edge (RST). Press. Baste straight edges of bags to front and back panel side seam allowances at pocket position.',
      });
    } else if (opts.pockets === 'welt') {
      steps.push({
        step: n++, title: 'Prepare front welt pockets',
        detail: 'Mark pocket openings 3.5″ below waist line. Sew welts and cut slash. Turn, press. Attach bags. Bar tack ends.',
      });
    }

    // Pleats
    if (numPleats > 0) {
      steps.push({
        step: n++, title: `Form front pleat${numPleats === 2 ? 's' : ''}`,
        detail: `On RS, mark pleat fold line${numPleats === 2 ? 's' : ''} from waist down ${fmtInches(rise)}. Fold each pleat toward side seam enclosing ${fmtInches(PLEAT_DEPTH)}. Pin at waist only. Baste across waist at ⅜″. Press pleat from WS using steam and a press cloth — press only the first 5–6″ below the waist. Below the hip the pleat should drape freely. Do NOT press the full leg length.`,
      });
    }

    // Stay-stitch
    steps.push({
      step: n++, title: 'Stay-stitch waist',
      detail: 'Before attaching waistband, stay-stitch ⅝″ from the waist edge all the way around — front panels, back panels. Sew directionally (side seam toward CF; side seam toward CB). This prevents the waist from stretching while you handle the trouser.',
    });

    // Fly or CF seam
    if (hasFly) {
      steps.push({
        step: n++, title: 'Install zip fly',
        detail: 'Interface fly shield. Sew front CF seam below fly opening only (from crotch curve to fly base). Clip crotch curve. Sew invisible zipper to right CF opening, then close fly by sewing fly shield to left CF behind zipper. Topstitch fly J-curve from RS at 1″.',
      });
    } else {
      steps.push({
        step: n++, title: 'Sew center front seam',
        detail: 'Join front panels at CF (RST). Clip crotch curve. Press open or serge.',
      });
    }

    steps.push({ step: n++, title: 'Sew center back seam', detail: 'Join back panels at CB (RST). Clip curve. Press open. Serge each side separately.' });
    steps.push({ step: n++, title: 'Sew side seams', detail: 'Join front to back at side seams (RST). For side-seam pockets: sew above and below pocket opening; sew around bag. Press seams open. Serge each SA separately.' });
    steps.push({ step: n++, title: 'Sew inseam', detail: 'One continuous seam from front hem to back hem through crotch. Clip crotch curve. Press toward back. Serge.' });

    // Waistband
    if (opts.waistband === 'structured') {
      steps.push({
        step: n++, title: 'Construct structured waistband',
        detail: 'Fuse interfacing to outer waistband. Fold lengthwise (RST). Sew short ends — right side with 1″ extension for button overlap. Turn, press. Sew to trouser waist (RST). Fold over to inside, slipstitch or edgestitch. Grade all seam allowances at waistband seam before folding: trim each layer to a different width (⅜″, ¼″, ⅛″) to reduce bulk. Install button at CF overlap. Attach hook-and-eye on inside of overlap.',
      });
    } else if (opts.waistband === 'elastic') {
      steps.push({
        step: n++, title: 'Construct elastic waistband casing',
        detail: 'Fold casing strip in half lengthwise (WST), press. Sew to trouser waist (RST). Fold over to inside, topstitch leaving a 2″ gap at CB. Thread elastic (waist − 1″) using a bodkin. Overlap elastic ends 1″, zigzag. Close gap. Topstitch close to folded edge.',
      });
    } else {
      steps.push({
        step: n++, title: 'Construct wide/petersham waistband',
        detail: 'Interface outer waistband. If using petersham, sew to inner edge. Curved/contoured waistband: sew the waistband outer to trouser waist (RST), clip curves. Fold waistband over, press. Grade SA in layers to reduce bulk. Topstitch or slipstitch inner edge. Install hook-and-eye at closure.',
      });
    }

    steps.push({
      step: n++, title: 'Hem — fit first',
      detail: `Try on trousers with your intended shoes. Mark the trouser break (hem rests at top of shoe with ½–¾″ draping forward). For straight hem: fold up ${fmtInches(parseFloat(opts.hem))} twice, press. Hand sew with catch stitch or blind hem stitch for an invisible finish. For wide cuff: fold up ${fmtInches(parseFloat(opts.hem))} to outside, press crisp fold, topstitch or hand stitch.`,
    });

    steps.push({
      step: n++, title: 'Finish',
      detail: 'Press entire garment with steam and press cloth. Re-press front trouser crease from waist to hem (align side seam to inseam, press fold). Bar tack all pocket openings and crotch junction.',
    });

    return steps;
  },
};


// ── Panel builder — straight leg, no knee taper ───────────────────────────

function buildPanel({ type, name, instruction, waistWidth, hipWidth, hipLineY, height, rise, inseam, ext, cbRaise, sa, hem, isBack, numPleats = 0, pleatDepth = 0, opts, dartIntake = 0 }) {
  const ccp      = crotchCurvePoints(0, 0, rise, ext, isBack, cbRaise);
  const curvePts = sampleBezier(ccp.p0, ccp.p1, ccp.p2, ccp.p3, 32);

  // Waist-to-hip shaping: all taper on side seam, center seam stays at x=0
  const sideWaistX = waistWidth;

  const poly = [];
  poly.push({ x: 0,            y: 0       });   // waist at center seam
  poly.push({ x: sideWaistX,   y: 0       });   // waist at side seam
  poly.push({ x: hipWidth,     y: hipLineY });   // hip at side seam
  poly.push({ x: hipWidth,     y: height  });
  poly.push({ x: -ext,         y: height  });
  poly.push({ x: -ext,         y: rise    });
  for (let i = curvePts.length - 2; i >= 1; i--) poly.push(curvePts[i]);
  if (isBack && cbRaise > 0) poly.push({ x: 0, y: cbRaise }); // CB seam top

  const saPoly = offsetPolygon(poly, i => {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    return (a.y > height - 0.5 && b.y > height - 0.5) ? -hem : -sa;
  });

  const dims = [
    { label: fmtInches(waistWidth) + ' waist', x1: 0, y1: -0.5, x2: sideWaistX, y2: -0.5, type: 'h' },
    { label: fmtInches(hipWidth) + ' hip',     x1: 0,            y1: hipLineY + 0.4, x2: hipWidth, y2: hipLineY + 0.4, type: 'h', color: '#b8963e' },
    { label: fmtInches(rise)   + ' rise',      x: hipWidth + 1.2, y1: 0,           y2: rise,                   type: 'v' },
    { label: fmtInches(inseam) + ' inseam',    x: hipWidth + 1.2, y1: rise,        y2: height,                 type: 'v' },
    { label: fmtInches(height) + ' total',     x: hipWidth + 2.3, y1: 0,           y2: height,                 type: 'v' },
    { label: fmtInches(ext)    + ' ext',       x1: -ext, y1: rise + 0.4, x2: 0,    y2: rise + 0.4,             type: 'h', color: '#c44' },
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
    notches, pleats, darts, type: 'panel', opts,
  };
}
