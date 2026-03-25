/**
 * Pleated Shorts — structured woven shorts with front pleats.
 * 7 inch default inseam, 10 inch rise.
 * Single or double box pleats on front panel only, fold toward side seam.
 * Slant front pockets, welt back pockets ×2, zip fly default.
 * Structured interfaced waistband with button; optional curtain waistband.
 */

import {
  crotchCurvePoints, sampleBezier, offsetPolygon, polyToPath,
  fmtInches, easeDistribution
} from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

// Each pleat adds this much extra fabric to the front panel width
const PLEAT_DEPTH = 1.5; // inches per pleat

export default {
  id: 'pleated-shorts',
  name: 'Pleated Shorts',
  category: 'lower',
  measurements: ['waist', 'hip', 'rise', 'thigh', 'inseam'],

  options: {
    ease: {
      type: 'select', label: 'Fit',
      values: [
        { value: 'regular', label: 'Regular (+2.5″)' },
        { value: 'relaxed', label: 'Relaxed (+4″)'   },
      ],
      default: 'regular',
    },
    pleats: {
      type: 'select', label: 'Pleats (front only)',
      values: [
        { value: 'none',   label: 'No pleats'        },
        { value: 'single', label: 'Single pleat'     },
        { value: 'double', label: 'Double pleat'     },
      ],
      default: 'single',
    },
    waistband: {
      type: 'select', label: 'Waistband',
      values: [
        { value: 'standard', label: 'Standard — 1½″ finished, interfaced' },
        { value: 'curtain',  label: 'Curtain — 1½″ finished, button + hook-and-eye' },
      ],
      default: 'standard',
    },
    fly: {
      type: 'select', label: 'Closure',
      values: [
        { value: 'zip',    label: 'Zip fly'    },
        { value: 'button', label: 'Button fly' },
      ],
      default: 'zip',
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
        { value: 1,   label: '1″'          },
        { value: 1.5, label: '1½″'         },
        { value: 2,   label: '2″ (cuff)'   },
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

    // Pleat addition to front panel width only
    const numPleats   = opts.pleats === 'double' ? 2 : opts.pleats === 'single' ? 1 : 0;
    const pleatExtra  = numPleats * PLEAT_DEPTH;

    const RISE_OFFSETS = { 'ultra-low': -2.5, low: -1.5, mid: 0, high: 1.5, 'ultra-high': 3.0 };
    const baseRise  = m.rise || 10;
    const riseOff   = RISE_OFFSETS[opts.riseStyle] ?? 0;
    const rise      = parseFloat(opts.riseOverride) || (baseRise + riseOff);
    const inseam = m.inseam || 7;

    const frontW = m.hip / 4 + ease.front + pleatExtra;
    const backW  = m.hip / 4 + ease.back;
    const H      = rise + inseam;

    const pieces = [];

    pieces.push(buildPanel({
      type: 'front', name: 'Front Panel',
      instruction: `Cut 2 (mirror L & R)${numPleats > 0 ? ` · ${numPleats === 2 ? 'Double' : 'Single'} pleat folded toward side seam, ${fmtInches(PLEAT_DEPTH)} each` : ''}`,
      width: frontW, height: H, rise, inseam,
      ext: frontExt, cbRaise: 0, sa, hem, isBack: false, opts,
    }));

    pieces.push(buildPanel({
      type: 'back', name: 'Back Panel',
      instruction: `Cut 2 (mirror L & R) · CB raised ${fmtInches(cbRaise)}`,
      width: backW, height: H, rise, inseam,
      ext: backExt, cbRaise, sa, hem, isBack: true, opts,
    }));

    // ── WAISTBAND ──
    const wbLen = m.hip + ease.total + pleatExtra * 2 + sa * 2;
    const wbW   = opts.waistband === 'curtain' ? 3 : 3;  // both 1.5″ finished = 3″ cut
    pieces.push({
      id: 'waistband',
      name: opts.waistband === 'curtain' ? 'Waistband (Curtain)' : 'Waistband',
      instruction: opts.waistband === 'curtain'
        ? `Cut 1 · Interface · 1½″ finished · Button + hook-and-eye closure at CF overlap`
        : `Cut 1 · Interface both layers · 1½″ finished · Button closure`,
      dimensions: { length: wbLen, width: wbW },
      type: 'rectangle', sa,
    });

    // ── FLY ──
    if (opts.fly === 'zip') {
      pieces.push({ id: 'fly-shield', name: 'Fly Shield', instruction: 'Cut 1 · Interface', dimensions: { width: 2.5, height: rise }, type: 'pocket' });
    }
    if (opts.fly === 'button') {
      pieces.push({ id: 'button-placket', name: 'Button Fly Placket', instruction: 'Cut 2 (left + right) · Interface', dimensions: { width: 5, height: rise }, type: 'pocket' });
    }

    // ── POCKETS ──
    pieces.push({ id: 'slant-facing', name: 'Slant Pocket Facing', instruction: 'Cut 2 · Match to front slash line', dimensions: { width: 2, height: 6 }, type: 'pocket' });
    pieces.push({ id: 'slant-bag',    name: 'Slant Pocket Bag',    instruction: 'Cut 2 · Lining fabric OK',           dimensions: { width: 7, height: 8 }, type: 'pocket' });
    pieces.push({ id: 'welt-back',    name: 'Back Welt Pocket',    instruction: 'Cut 4 (2 welts + 2 bags) per pocket · ×2 pockets total', dimensions: { width: 5.5, height: 6 }, type: 'pocket' });

    return pieces;
  },

  materials(m, opts) {
    const notions = [
      { ref: 'interfacing-med', quantity: opts.waistband === 'curtain' ? '0.5 yard' : '0.75 yard (waistband + pocket facings)' },
      { name: 'Zipper or buttons', quantity: opts.fly === 'zip' ? '7–8″ metal zipper' : '4–5 buttons ⅝″', notes: opts.fly === 'zip' ? 'Metal coil preferred' : 'For fly' },
      { name: 'Waistband button', quantity: '1', notes: '¾″ shank button' },
    ];
    if (opts.waistband === 'curtain') {
      notions.push({ name: 'Hook-and-eye', quantity: '1 set', notes: 'Size 3, waistband closure' });
    }

    return buildMaterialsSpec({
      fabrics: ['linen', 'rayon-twill', 'cotton-twill'],
      notions,
      thread: 'poly-all',
      needle: 'universal-90',
      stitches: ['straight-2.5', 'straight-3', 'zigzag-small', 'bartack'],
      notes: [
        'Pre-wash linen (hot wash, tumble dry) — shrinks 3–5%',
        `Pleat construction: mark pleat fold lines on WS. Fold pleat toward side seam, pin. Baste across waist edge ⅜″ from top. Press pleat from WS with steam.`,
        'Interface both waistband layers for a stiff, structured finish',
        'Welt back pockets: understitch welts, bar tack ends. Bound buttonhole or sew-through button on welt.',
        'Bar tack all pocket openings and crotch junction',
        'Press every seam — structured shorts require crisp pressing throughout',
      ],
    });
  },

  instructions(m, opts) {
    const steps = [];
    let n = 1;
    const numPleats = opts.pleats === 'double' ? 2 : opts.pleats === 'single' ? 1 : 0;

    // Pockets
    steps.push({
      step: n++, title: 'Prepare slant pockets',
      detail: 'Sew facing to front panel along slash line (RST). Clip, turn, press. Understitch facing. Attach pocket bag to facing. Baste bag edges to panel at side and waist.',
    });
    steps.push({
      step: n++, title: 'Prepare back welt pockets',
      detail: 'Mark welt pocket positions on back panel (2.5″ below waist, centered). Sew bound-welt opening. Slash and turn welts. Press. Attach pocket bag halves. Whipstitch bag sides together. Bar tack ends.',
    });

    // Pleats
    if (numPleats > 0) {
      steps.push({
        step: n++, title: `Form ${numPleats === 2 ? 'double' : 'single'} front pleat${numPleats === 2 ? 's' : ''}`,
        detail: `Mark pleat fold line${numPleats === 2 ? 's' : ''} on RS of front panel. Each pleat folds toward the side seam enclosing ${fmtInches(PLEAT_DEPTH)} of fabric. Pin across waist. Baste ⅜″ from waist edge. Press pleat from WS with steam — press down 3–4″, then release to drape naturally.`,
      });
    }

    // Fly
    if (opts.fly === 'zip') {
      steps.push({ step: n++, title: 'Install zip fly', detail: 'Interface fly shield. Staystitch CF seam allowances. Sew front panels at CF from crotch curve up to bottom of fly opening. Clip curve. Sew zipper to right CF extension, RS up. Sew fly shield to left extension. Topstitch fly curve from RS. Attach fly shield to inside.' });
    } else {
      steps.push({ step: n++, title: 'Install button fly', detail: 'Interface both plackets. Attach left and right plackets to CF edges. Sew buttonholes on left placket. Mark and sew buttons on right. Topstitch placket curve.' });
    }

    steps.push({ step: n++, title: 'Sew center back seam', detail: 'Join back panels at CB (RST). Clip curve. Press open.' });
    steps.push({ step: n++, title: 'Sew side seams', detail: 'Join front to back at side seams (RST). Press open.' });
    steps.push({ step: n++, title: 'Sew inseam', detail: 'Continuous seam from hem to hem. Clip crotch curve. Press toward back.' });

    steps.push({
      step: n++, title: 'Construct waistband',
      detail: opts.waistband === 'curtain'
        ? 'Interface waistband. Fold and press. Sew to shorts waist (RST). Fold, topstitch. Install button at CF overlap. Attach hook-and-eye inside the curtain extension for a second closure point.'
        : 'Interface both layers of waistband. Sew short ends. Turn. Sew to shorts waist (RST). Fold over, slipstitch inside. Topstitch. Install waistband button and work buttonhole.',
    });

    steps.push({ step: n++, title: 'Hem', detail: `Fold up ${fmtInches(parseFloat(opts.hem))} twice, press. Topstitch close to inner fold. Press from RS.` });
    steps.push({ step: n++, title: 'Finish', detail: 'Press entire garment. Bar tack all stress points. Hang press front creases with a damp cloth if desired.' });

    return steps;
  },
};


// ── Panel builder ─────────────────────────────────────────────────────────

function buildPanel({ type, name, instruction, width, height, rise, inseam, ext, cbRaise, sa, hem, isBack, opts }) {
  const ccp      = crotchCurvePoints(0, 0, rise, ext, isBack, cbRaise);
  const curvePts = sampleBezier(ccp.p0, ccp.p1, ccp.p2, ccp.p3, 16);

  const poly = [];
  poly.push({ x: 0,     y: cbRaise });
  if (isBack) poly.push({ x: width * 0.5, y: cbRaise * 0.15 });
  poly.push({ x: width, y: 0 });
  poly.push({ x: width, y: height });
  poly.push({ x: -ext,  y: height });
  poly.push({ x: -ext,  y: rise   });
  for (let i = curvePts.length - 2; i >= 0; i--) poly.push(curvePts[i]);

  const saPoly = offsetPolygon(poly, pt => (pt.y > height - 0.5 ? hem : sa));

  const dims = [
    { label: fmtInches(width),              x1: 0,          y1: -0.5,       x2: width,  y2: -0.5,   type: 'h' },
    { label: fmtInches(rise)   + ' rise',   x: width + 1.2, y1: 0,          y2: rise,               type: 'v' },
    { label: fmtInches(inseam) + ' inseam', x: width + 1.2, y1: rise,       y2: height,             type: 'v' },
    { label: fmtInches(height) + ' total',  x: width + 2.3, y1: 0,          y2: height,             type: 'v' },
    { label: fmtInches(ext)    + ' ext',    x1: -ext, y1: rise + 0.4, x2: 0, y2: rise + 0.4,       type: 'h', color: '#c44' },
  ];

  return {
    id: type, name, instruction,
    polygon: poly, saPolygon: saPoly,
    path: polyToPath(poly), saPath: polyToPath(saPoly),
    dimensions: dims, width, height, rise, inseam, ext, cbRaise, sa, hem, isBack,
    labels: [
      { text: 'SIDE SEAM', x: width + 0.3, y: height * 0.35, rotation: 90  },
      { text: 'CENTER',    x: -0.5,         y: rise   * 0.3,  rotation: -90 },
    ],
    type: 'panel', opts,
  };
}
