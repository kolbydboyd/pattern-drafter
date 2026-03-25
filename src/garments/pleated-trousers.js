/**
 * Pleated Trousers — high-waisted wide-leg dress trousers.
 * 31 inch default inseam, 12 inch rise, double pleat default, +6″ ease.
 * Straight leg (no taper). Welt back pockets ×2. Zip fly.
 * Curtain waistband 2″ finished with button, hook-and-eye, and French bearer.
 */

import {
  crotchCurvePoints, sampleBezier, offsetPolygon, polyToPath,
  fmtInches, easeDistribution, EASE_VALUES
} from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

const PLEAT_DEPTH = 1.5; // inches per pleat (front panel only)

// Wide ease for dress trousers
const EASE_WIDE = 6;

export default {
  id: 'pleated-trousers',
  name: 'Pleated Trousers',
  category: 'lower',
  measurements: ['waist', 'hip', 'rise', 'thigh', 'inseam'],
  measurementDefaults: { inseam: 31 },

  options: {
    ease: {
      type: 'select', label: 'Fit',
      values: [
        { value: 'regular', label: 'Regular (+2.5″)' },
        { value: 'relaxed', label: 'Relaxed (+4″)'   },
        { value: 'wide',    label: 'Wide (+6″)'      },
      ],
      default: 'wide',
    },
    pleats: {
      type: 'select', label: 'Pleats (front only)',
      values: [
        { value: 'none',   label: 'No pleats'    },
        { value: 'single', label: 'Single pleat' },
        { value: 'double', label: 'Double pleat' },
      ],
      default: 'double',
    },
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
    const easeKey  = opts.ease;
    const easeVal  = easeKey === 'wide' ? EASE_WIDE : (easeKey === 'relaxed' ? 4 : 2.5);
    const easeFront = easeVal * 0.4;
    const easeBack  = easeVal * 0.6;

    const sa       = parseFloat(opts.sa);
    const hem      = parseFloat(opts.hem);
    const frontExt = parseFloat(opts.frontExt);
    const backExt  = parseFloat(opts.backExt);
    const cbRaise  = parseFloat(opts.cbRaise);

    const numPleats  = opts.pleats === 'double' ? 2 : opts.pleats === 'single' ? 1 : 0;
    const pleatExtra = numPleats * PLEAT_DEPTH;

    const rise   = m.rise || 12;
    const inseam = m.inseam || 31;

    const frontW = m.hip / 4 + easeFront + pleatExtra;
    const backW  = m.hip / 4 + easeBack;
    const H      = rise + inseam;

    const pieces = [];

    // Straight leg — hem width matches hip panel (no taper)
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

    // ── CURTAIN WAISTBAND (2″ finished) ──
    const wbLen = m.hip + easeVal + pleatExtra * 2 + sa * 2;
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
    pieces.push({ id: 'fly-shield', name: 'Fly Shield', instruction: 'Cut 1 · Interface · Serge edge', dimensions: { width: 2.5, height: rise }, type: 'pocket' });

    // ── POCKETS ──
    pieces.push({ id: 'welt-back',  name: 'Back Welt Pocket', instruction: 'Cut 4 (2 welts + 2 bags) · ×2 pockets total', dimensions: { width: 5.5, height: 6 }, type: 'pocket' });
    pieces.push({ id: 'slant-facing', name: 'Slant Pocket Facing', instruction: 'Cut 2 · Interface or match fabric', dimensions: { width: 2, height: 7 }, type: 'pocket' });
    pieces.push({ id: 'slant-bag',    name: 'Slant Pocket Bag',    instruction: 'Cut 2 · Lining fabric', dimensions: { width: 7, height: 9.5 }, type: 'pocket' });

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
      { name: 'Hook-and-eye',    quantity: '2 sets', notes: 'Size 3 — waistband + French bearer' },
    ];

    return buildMaterialsSpec({
      fabrics: ['wool-suiting', 'rayon-twill', 'linen'],
      notions,
      thread: 'poly-all',
      needle: 'universal-90',
      stitches: ['straight-2.5', 'straight-3', 'zigzag-small', 'bartack'],
      notes: [
        'Press with steam on a wool setting. Always use a press cloth to prevent shine on wool and rayon.',
        'Interface ALL waistband layers for structure — use heavy interfacing on the outer layer',
        'The French bearer is the inner hook extension at CF that keeps the waistband flat under the trouser front. Cut from matching fabric, interface, fold and press.',
        'Pre-wash linen (hot) before cutting. Do not pre-wash wool suiting — dry clean before cutting if needed.',
        'Fell seams optional on outseam and inseam for a tailored finish (see jeans); otherwise serge/zigzag.',
        'Hem note: dress trousers should have a slight BREAK at the shoe — hem at the top of the shoe, allowing ½–¾″ of fabric to rest on the shoe. Fit before hemming.',
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
      detail: 'Mark pocket positions on back panels (2.5″ below waist, centered in panel). Sew bound welts, slash, turn, press. Attach bag halves. Whipstitch bag sides. Bar tack ends.',
    });
    steps.push({
      step: n++, title: 'Prepare slant pockets',
      detail: 'Interface facing. Sew facing to front slash line (RST). Clip, turn, press. Understitch. Attach pocket bag. Baste edges to panel.',
    });

    if (numPleats > 0) {
      steps.push({
        step: n++, title: `Form ${numPleats === 2 ? 'double' : 'single'} front pleat${numPleats === 2 ? 's' : ''}`,
        detail: `Mark pleat fold line${numPleats === 2 ? 's' : ''} on RS. Fold each pleat toward side seam enclosing ${fmtInches(PLEAT_DEPTH)}. Pin at waist. Baste ⅜″ from edge. Press pleat down 4–5″ with steam from WS, then allow to drape. The pleat should release naturally below the hip.`,
      });
    }

    steps.push({
      step: n++, title: 'Install zip fly',
      detail: 'Interface fly shield. Sew fronts at CF from crotch to fly bottom. Sew zipper to right CF. Sew fly shield to left CF. Topstitch fly J-curve from RS.',
    });
    steps.push({ step: n++, title: 'Sew center back seam', detail: 'Join backs at CB. Clip curve. Serge or press open.' });
    steps.push({ step: n++, title: 'Sew side seams', detail: 'Join front to back at side seams (RST). Press open. Serge each SA separately.' });
    steps.push({ step: n++, title: 'Sew inseam', detail: 'Continuous seam hem to hem. Clip crotch curve. Serge together. Press toward back.' });

    steps.push({
      step: n++, title: 'Construct curtain waistband',
      detail: 'Apply heavy interfacing to outer waistband, medium to inner. Fold lengthwise, press. Sew short ends — note CF right side has a 1½″ extension for overlap. Sew to trousers waist (RST). Fold over. Topstitch or slipstitch inside. Install button at CF overlap. Attach hook-and-eye inside overlap.',
    });
    steps.push({
      step: n++, title: 'Construct and attach French bearer',
      detail: 'Interface bearer piece. Fold in half (WST), press. Sew edges, turn, press. Attach to inside of right CF waistband/fly area. The bearer extends ½–1″ below waistband, hooks onto the inside zipper tape or a bar on the left side for a smooth, flat CF closure.',
    });
    steps.push({
      step: n++, title: 'Attach belt loops',
      detail: 'Fold, press, topstitch loop strips. Attach at CB, side seams, flanking CF. Bar tack top and bottom.',
    });
    steps.push({
      step: n++, title: 'Hem — fit first',
      detail: `Try on trousers with the shoes you intend to wear. Mark the hem so the trouser rests just at the top of the shoe with a slight break (½–¾″ of fabric drapes forward). Fold up ${fmtInches(parseFloat(opts.hem))} twice or once with serged edge. Press. Hand slipstitch or blind hem stitch for an invisible finish on dress trousers.`,
    });
    steps.push({ step: n++, title: 'Finish', detail: 'Press entire garment with steam and press cloth. Bar tack all stress points. Steam-press front trouser creases — align side seam to inseam and press fold from waist to hem.' });

    return steps;
  },
};


// ── Panel builder — straight leg (no knee taper) ──────────────────────────

function buildPanel({ type, name, instruction, width, height, rise, inseam, ext, cbRaise, sa, hem, isBack, opts }) {
  const ccp      = crotchCurvePoints(0, 0, rise, ext, isBack, cbRaise);
  const curvePts = sampleBezier(ccp.p0, ccp.p1, ccp.p2, ccp.p3, 16);

  const poly = [];
  poly.push({ x: 0,     y: cbRaise });
  if (isBack) poly.push({ x: width * 0.5, y: cbRaise * 0.15 });
  poly.push({ x: width, y: 0      });
  poly.push({ x: width, y: height });
  poly.push({ x: -ext,  y: height });
  poly.push({ x: -ext,  y: rise   });
  for (let i = curvePts.length - 2; i >= 0; i--) poly.push(curvePts[i]);

  const saPoly = offsetPolygon(poly, pt => (pt.y > height - 0.5 ? hem : sa));

  const dims = [
    { label: fmtInches(width),              x1: 0,          y1: -0.5,       x2: width,  y2: -0.5,       type: 'h' },
    { label: fmtInches(rise)   + ' rise',   x: width + 1.2, y1: 0,          y2: rise,                   type: 'v' },
    { label: fmtInches(inseam) + ' inseam', x: width + 1.2, y1: rise,       y2: height,                 type: 'v' },
    { label: fmtInches(height) + ' total',  x: width + 2.3, y1: 0,          y2: height,                 type: 'v' },
    { label: fmtInches(ext)    + ' ext',    x1: -ext, y1: rise + 0.4, x2: 0, y2: rise + 0.4,           type: 'h', color: '#c44' },
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
