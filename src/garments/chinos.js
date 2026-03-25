/**
 * Chinos — clean tailored trousers with serger-finished seams.
 * 31 inch default inseam, 10 inch rise. Same leg shapes as straight-jeans.
 * Slant front pockets, welt back pockets ×2 with button, zip fly.
 * No fell seams — serge or zigzag edge finish throughout.
 */

import {
  crotchCurvePoints, sampleBezier, offsetPolygon, polyToPath,
  fmtInches, easeDistribution, LEG_SHAPES
} from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

export default {
  id: 'chinos',
  name: 'Chinos',
  category: 'lower',
  measurements: ['waist', 'hip', 'rise', 'thigh', 'inseam'],
  measurementDefaults: { inseam: 31 },

  options: {
    ease: {
      type: 'select', label: 'Fit',
      values: [
        { value: 'slim',    label: 'Slim (+1.5″)',    reference: 'fitted, tailored'    },
        { value: 'regular', label: 'Regular (+2.5″)', reference: 'classic, off-the-rack' },
        { value: 'relaxed', label: 'Relaxed (+4″)',   reference: 'skater, workwear'      },
      ],
      default: 'regular',
    },
    legShape: {
      type: 'select', label: 'Leg shape',
      values: [
        { value: 'skinny',   label: 'Skinny',   reference: '510, spray-on'  },
        { value: 'slim',     label: 'Slim',     reference: '511, cigarette' },
        { value: 'straight', label: 'Straight', reference: '501, regular'   },
        { value: 'bootcut',  label: 'Bootcut',  reference: '527, 70s flare' },
        { value: 'wide',     label: 'Wide',     reference: 'Yohji, palazzo' },
      ],
      default: 'straight',
    },
    backPocket: {
      type: 'select', label: 'Back pockets',
      values: [
        { value: 'welt-button', label: 'Welt with button ×2', reference: 'dress trouser' },
        { value: 'welt',        label: 'Welt no button ×2',  reference: 'clean finish'  },
        { value: 'none',        label: 'None',               reference: 'minimal'       },
      ],
      default: 'welt-button',
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
        { value: 1,   label: '1″'         },
        { value: 1.5, label: '1½″'        },
        { value: 2,   label: '2″ (cuff)'  },
      ],
      default: 1.5,
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
    const inseam   = m.inseam || 31;
    const shape    = LEG_SHAPES[opts.legShape] || LEG_SHAPES.straight;

    const frontW = m.hip / 4 + ease.front;
    const backW  = m.hip / 4 + ease.back;
    const H      = rise + inseam;

    const pieces = [];

    pieces.push(buildPanel({
      type: 'front', name: 'Front Panel',
      instruction: 'Cut 2 (mirror L & R) · Serge all raw edges after each seam',
      width: frontW, height: H, rise, inseam,
      ext: frontExt, cbRaise: 0, sa, hem, isBack: false, shape, opts,
    }));

    pieces.push(buildPanel({
      type: 'back', name: 'Back Panel',
      instruction: `Cut 2 (mirror L & R) · CB raised ${fmtInches(cbRaise)}`,
      width: backW, height: H, rise, inseam,
      ext: backExt, cbRaise, sa, hem, isBack: true, shape, opts,
    }));

    // ── WAISTBAND ──
    const wbLen = m.hip + ease.total + sa * 2;
    pieces.push({
      id: 'waistband',
      name: 'Waistband',
      instruction: `Cut 1 · Interface · 1½″ finished · Belt loops ×${m.waist > 36 ? 7 : 6}`,
      dimensions: { length: wbLen, width: 3 },
      type: 'rectangle', sa,
    });

    // ── FLY ──
    pieces.push({ id: 'fly-shield', name: 'Fly Shield', instruction: 'Cut 1 · Interface · Serge edge before attaching', dimensions: { width: 2.5, height: rise }, type: 'pocket' });

    // ── POCKETS ──
    pieces.push({ id: 'slant-facing', name: 'Slant Pocket Facing', instruction: 'Cut 2 · Match fabric or lining · Serge before attaching', dimensions: { width: 2, height: 6.5 }, type: 'pocket' });
    pieces.push({ id: 'slant-bag',    name: 'Slant Pocket Bag',    instruction: 'Cut 2 · Lining or drill · Serge all edges', dimensions: { width: 7, height: 9 }, type: 'pocket' });

    if (opts.backPocket !== 'none') {
      pieces.push({ id: 'welt-back', name: 'Back Welt Pocket', instruction: 'Cut 4 (2 welts + 2 bags) · ×2 pockets total · Serge bag edges', dimensions: { width: 5.5, height: 6 }, type: 'pocket' });
    }

    // ── BELT LOOPS ──
    pieces.push({ id: 'belt-loop', name: 'Belt Loops', instruction: `Cut ${m.waist > 36 ? 7 : 6} strips · ¾″ finished width · Serge or fold raw edges`, dimensions: { width: 1.75, height: 0.75 }, type: 'pocket' });

    return pieces;
  },

  materials(m, opts) {
    const notions = [
      { ref: 'interfacing-med', quantity: '0.5 yard (waistband + pocket facings)' },
      { name: 'Metal zipper',    quantity: `${Math.ceil(m.rise * 0.6)}″`, notes: 'YKK or equivalent' },
      { name: 'Waistband button', quantity: '1', notes: '¾″ shank button' },
    ];
    if (opts.backPocket === 'welt-button') {
      notions.push({ name: 'Welt buttons', quantity: '2', notes: '½″ sew-through buttons for back pockets' });
    }

    return buildMaterialsSpec({
      fabrics: ['cotton-twill', 'gabardine', 'stretch-denim'],
      notions,
      thread: 'poly-all',
      needle: 'universal-90',
      stitches: ['straight-2.5', 'straight-3', 'zigzag-small', 'bartack'],
      notes: [
        'Clean-finish ALL seams — serge or zigzag edge every seam allowance before or after sewing. No fell seams.',
        'Stitch seams at 2.5mm; topstitch at 3.0mm for a cleaner, less casual look than jeans',
        'Press every seam immediately after sewing — chinos require crisp pressing to lie flat',
        'Pre-wash fabric once at the temperature you plan to wash the finished garment',
        'Bar tack all pocket corners and the crotch junction',
      ],
    });
  },

  instructions(m, opts) {
    const steps = [];
    let n = 1;

    if (opts.backPocket !== 'none') {
      steps.push({
        step: n++, title: 'Prepare back welt pockets',
        detail: `Serge pocket bag edges. Mark welt positions on back panels. Sew bound welts (RST), slash, turn, press. Attach bag halves. Whipstitch bag sides. Bar tack ends.${opts.backPocket === 'welt-button' ? ' Work buttonhole on upper welt, attach button.' : ''}`,
      });
    }

    steps.push({
      step: n++, title: 'Prepare slant pockets',
      detail: 'Serge pocket bag and facing edges. Sew facing to front panel slash line (RST). Clip, turn, press. Understitch facing. Attach bag to facing. Baste bag to panel at side and waist.',
    });
    steps.push({
      step: n++, title: 'Install zip fly',
      detail: 'Serge fly shield edges. Staystitch CF seam allowances. Sew front panels at CF from crotch to bottom of fly opening. Clip curve. Sew zipper to right CF. Sew fly shield to left CF. Topstitch fly curve from RS at 3.0mm.',
    });
    steps.push({
      step: n++, title: 'Sew center back seam',
      detail: 'Join back panels at CB (RST). Clip curve. Serge seam allowances together. Press toward one side.',
    });
    steps.push({
      step: n++, title: 'Sew side seams',
      detail: 'Join front to back at side seams (RST). Press open. Serge each seam allowance separately. Topstitch at 3.0mm if desired.',
    });
    steps.push({
      step: n++, title: 'Sew inseam',
      detail: 'Continuous seam from hem to hem. Clip crotch curve. Serge seam allowances together. Press toward back.',
    });
    steps.push({
      step: n++, title: 'Construct and attach waistband',
      detail: 'Interface waistband. Sew to trousers waist (RST). Fold over. Topstitch top and bottom edges at 3.0mm. Waistband button and buttonhole at CF overlap.',
    });
    steps.push({
      step: n++, title: 'Attach belt loops',
      detail: 'Press loop strips. Topstitch edges. Cut to height. Place at CB, side seams, flanking CF. Fold and topstitch ends. Bar tack through all layers.',
    });
    steps.push({
      step: n++, title: 'Hem',
      detail: `Serge or turn under raw hem edge. Fold hem up ${fmtInches(parseFloat(opts.hem))}. Press. Topstitch at 3.0mm or hand-slip stitch for a cleaner finish.`,
    });
    steps.push({ step: n++, title: 'Finish', detail: 'Press entire garment with steam. Bar tack all stress points. Check all seam allowances are neatly serged.' });

    return steps;
  },
};


// ── Panel builder with knee-point leg shaping ─────────────────────────────

function buildPanel({ type, name, instruction, width, height, rise, inseam, ext, cbRaise, sa, hem, isBack, shape, opts }) {
  const ccp      = crotchCurvePoints(0, 0, rise, ext, isBack, cbRaise);
  const curvePts = sampleBezier(ccp.p0, ccp.p1, ccp.p2, ccp.p3, 16);

  const kneeY       = rise + inseam * 0.55;
  const kneeW       = width * shape.knee;
  const hemW        = width * shape.hem;
  const kneeInward  = (width - kneeW) * 0.5;
  const hemInward   = (width - hemW)  * 0.5;
  const sideKneeX   =  width - kneeInward;
  const sideHemX    =  width - hemInward;
  const inseamKneeX = -ext   + kneeInward;
  const inseamHemX  = -ext   + hemInward;

  const poly = [];
  poly.push({ x: 0,     y: cbRaise });
  if (isBack) poly.push({ x: width * 0.5, y: cbRaise * 0.15 });
  poly.push({ x: width,       y: 0      });
  poly.push({ x: sideKneeX,   y: kneeY  });
  poly.push({ x: sideHemX,    y: height });
  poly.push({ x: inseamHemX,  y: height });
  poly.push({ x: inseamKneeX, y: kneeY  });
  poly.push({ x: -ext,        y: rise   });
  for (let i = curvePts.length - 2; i >= 0; i--) poly.push(curvePts[i]);

  const saPoly = offsetPolygon(poly, pt => (pt.y > height - 0.5 ? hem : sa));

  const dims = [
    { label: fmtInches(width),              x1: 0,           y1: -0.5,        x2: width,      y2: -0.5,        type: 'h' },
    { label: fmtInches(kneeW) + ' knee',    x1: inseamKneeX, y1: kneeY + 0.4, x2: sideKneeX,  y2: kneeY + 0.4, type: 'h', color: '#b8963e' },
    { label: fmtInches(hemW)  + ' hem',     x1: inseamHemX,  y1: height - 0.5, x2: sideHemX,  y2: height - 0.5, type: 'h', color: '#b8963e' },
    { label: fmtInches(rise)   + ' rise',   x: width + 1.2,  y1: 0,           y2: rise,                         type: 'v' },
    { label: fmtInches(inseam) + ' inseam', x: width + 1.2,  y1: rise,        y2: height,                       type: 'v' },
    { label: fmtInches(ext)    + ' ext',    x1: -ext, y1: rise + 0.4, x2: 0, y2: rise + 0.4,                   type: 'h', color: '#c44' },
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
