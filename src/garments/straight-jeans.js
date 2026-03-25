/**
 * Straight Jeans — 5-pocket denim with tapered leg shaping.
 * 31 inch default inseam, 10 inch rise.
 * Leg tapers from hip through knee (55% down inseam) to hem per LEG_SHAPES.
 * Zip fly + fly shield, slant front pockets, coin pocket, welt back pockets ×2.
 */

import {
  crotchCurvePoints, sampleBezier, offsetPolygon, polyToPath,
  fmtInches, easeDistribution, LEG_SHAPES
} from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

export default {
  id: 'straight-jeans',
  name: 'Straight Jeans',
  category: 'lower',
  difficulty: 'advanced',
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
        { value: 'skinny',   label: 'Skinny',   reference: '510, spray-on'    },
        { value: 'slim',     label: 'Slim',     reference: '511, cigarette'   },
        { value: 'straight', label: 'Straight', reference: '501, regular'     },
        { value: 'bootcut',  label: 'Bootcut',  reference: '527, 70s flare'   },
        { value: 'wide',     label: 'Wide',     reference: 'Yohji, palazzo'   },
      ],
      default: 'straight',
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
    const inseam   = m.outseam ? Math.max(1, m.outseam - rise) : (m.inseam || 31);
    const shape    = LEG_SHAPES[opts.legShape] || LEG_SHAPES.straight;

    const frontW = m.hip / 4 + ease.front;
    const backW  = m.hip / 4 + ease.back;
    const H      = rise + inseam;

    const pieces = [];

    pieces.push(buildPanel({
      type: 'front', name: 'Front Panel',
      instruction: 'Cut 2 (mirror L & R) · Curve on CENTER · Mark knee point',
      width: frontW, height: H, rise, inseam,
      ext: frontExt, cbRaise: 0, sa, hem,
      isBack: false, shape, opts,
      calf: m.calf, ankle: m.ankle, seatDepth: m.seatDepth,
    }));

    pieces.push(buildPanel({
      type: 'back', name: 'Back Panel',
      instruction: `Cut 2 (mirror L & R) · CB raised ${fmtInches(cbRaise)} · Mark knee point`,
      width: backW, height: H, rise, inseam,
      ext: backExt, cbRaise, sa, hem,
      isBack: true, shape, opts,
      calf: m.calf, ankle: m.ankle, seatDepth: m.seatDepth,
    }));

    // ── WAISTBAND ──
    const wbLen = m.hip + ease.total + sa * 2;
    pieces.push({
      id: 'waistband',
      name: 'Waistband',
      instruction: `Cut 1 on fold · Interface · 1½″ finished · Belt loops ×${m.waist > 36 ? 7 : 6}`,
      dimensions: { length: wbLen, width: 3 },
      type: 'rectangle', sa,
    });

    // ── FLY ──
    pieces.push({ id: 'fly-shield', name: 'Fly Shield', instruction: 'Cut 1 · Interface · Topstitch curve visible from RS', dimensions: { width: 2.5, height: rise }, type: 'pocket' });

    // ── POCKETS ──
    pieces.push({ id: 'slant-facing', name: 'Slant Pocket Facing', instruction: 'Cut 2 · Denim or twill', dimensions: { width: 2, height: 6.5 }, type: 'pocket' });
    pieces.push({ id: 'slant-bag',    name: 'Slant Pocket Bag',    instruction: 'Cut 2 · Lining (muslin or drill)', dimensions: { width: 7, height: 9 }, type: 'pocket' });
    pieces.push({ id: 'coin-pocket',  name: 'Coin Pocket',         instruction: 'Cut 2 (outer + lining) · Right front only · Serge edges', dimensions: { width: 3, height: 3.5 }, type: 'pocket' });
    pieces.push({ id: 'welt-back',    name: 'Back Welt Pocket',    instruction: 'Cut 4 (2 welts + 2 bags) · ×2 pockets total', dimensions: { width: 5.5, height: 6 }, type: 'pocket' });

    // ── BELT LOOPS ──
    pieces.push({ id: 'belt-loop', name: 'Belt Loops', instruction: `Cut ${m.waist > 36 ? 7 : 6} strips 1¾″ × ¾″ finished`, dimensions: { width: 1.75, height: 0.75 }, type: 'pocket' });

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
        'Topstitch with 3.5mm stitch and contrasting gold/amber thread for the classic jeans look — use a topstitch needle for heavier thread',
        'Fell seams on inseam and outseam: after sewing, press seam to one side, fold raw edge under, topstitch from RS two rows visible',
        'Pre-wash denim once (hot wash, dry on high) to pre-shrink before cutting',
        'Use a denim needle (100/16) and heavy polyester thread 30wt — lighter thread will break under tension',
        'Copper rivet all high-stress points: bottom of front pocket openings, coin pocket sides, crotch junction',
        'Press denim with a damp cloth — dry pressing may leave shine marks on dark denim',
      ],
    });
  },

  instructions(m, opts) {
    const steps = [];
    let n = 1;

    steps.push({
      step: n++, title: 'Prepare back welt pockets',
      detail: 'Mark pocket positions on back panels. Sew bound welts, slash, turn and press. Attach pocket bags. Whipstitch bag sides. Bar tack welt ends. Topstitch welts with 3.5mm gold thread.',
    });
    steps.push({
      step: n++, title: 'Prepare slant + coin pockets',
      detail: 'Sew facing to front slash (RST). Clip, turn, press. Understitch. Attach pocket bag. Construct coin pocket (outer + lining, RST 3 sides, turn, press). Topstitch coin pocket to RS of right front panel in upper right corner of pocket opening. Baste pocket and coin pocket to panel edges.',
    });
    steps.push({
      step: n++, title: 'Sew back yoke (if applicable) & join back panels',
      detail: 'Join back panels at CB crotch seam. Clip curve. Fell seam toward left back or press open for stretch denim.',
    });
    steps.push({
      step: n++, title: 'Install zip fly',
      detail: 'Interface fly shield. Staystitch CF seam allowances. Sew front panels at CF from crotch point up to bottom of fly. Sew zipper (RS up) to right CF extension. Sew fly shield to left extension. Pin and topstitch the fly J-curve from RS using topstitch thread. Secure fly shield to inside.',
    });
    steps.push({
      step: n++, title: 'Sew outseams (side seams)',
      detail: 'Join front to back at outseam (RST). Press toward back. Topstitch outseam fell: fold back panel SA over front, topstitch two rows ⅛″ and ¼″ from seam edge (visible from RS as double topstitch).',
    });
    steps.push({
      step: n++, title: 'Sew inseam',
      detail: 'Continuous seam from hem to hem. Clip crotch curve. Fell toward front: fold front inseam SA over, press, topstitch from RS.',
    });
    steps.push({
      step: n++, title: 'Construct and attach waistband',
      detail: 'Interface waistband. Sew to jeans waist (RST), matching CB, side seams, CF. Fold over. Topstitch top and bottom edge with gold topstitch thread. Install jeans tack button at CF overlap. Make machine buttonhole or use eyelet.',
    });
    steps.push({
      step: n++, title: 'Attach belt loops',
      detail: 'Press loop strips in thirds. Topstitch both edges. Cut to length. Pin at CB, side seams, and flanking CF fly. Fold under ends, topstitch top and bottom with a bar tack.',
    });
    steps.push({ step: n++, title: 'Set rivets', detail: 'Using rivet setter, place copper rivets at base of front pocket openings and coin pocket sides. Add one at crotch seam junction if fabric is heavy.' });
    steps.push({ step: n++, title: 'Hem', detail: `Fold hem up ${fmtInches(parseFloat(opts.hem))} twice. Topstitch with 3.5mm gold thread. For chain-stitch look, use a single fold and a serger with chainstitch if available.` });
    steps.push({ step: n++, title: 'Finish', detail: 'Press seams. Bar tack all remaining stress points. Turn jeans inside out and press seam allowances flat with damp cloth.' });

    return steps;
  },
};


// ── Panel builder with knee-point leg shaping ─────────────────────────────

function buildPanel({ type, name, instruction, width, height, rise, inseam, ext, cbRaise, sa, hem, isBack, shape, opts, calf, ankle, seatDepth }) {
  const ccp      = crotchCurvePoints(0, 0, rise, ext, isBack, cbRaise);
  const curvePts = sampleBezier(ccp.p0, ccp.p1, ccp.p2, ccp.p3, 16);

  // Knee sits 55% down the inseam from the crotch
  const kneeY      = rise + inseam * 0.55;
  // If calf/ankle provided, derive per-panel width from body measurement; else use shape ratios
  const kneeW      = calf  ? calf  / 4 : width * shape.knee;
  const hemW       = ankle ? ankle / 4 : width * shape.hem;

  // Each leg narrows symmetrically — half on side seam, half on inseam
  const kneeInward = (width - kneeW) * 0.5;
  const hemInward  = (width - hemW)  * 0.5;

  const sideKneeX    =  width - kneeInward;
  const sideHemX     =  width - hemInward;
  const inseamKneeX  = -ext   + kneeInward;
  const inseamHemX   = -ext   + hemInward;

  const poly = [];
  poly.push({ x: 0,     y: cbRaise });
  if (isBack) poly.push({ x: width * 0.5, y: cbRaise * 0.15 });
  poly.push({ x: width,      y: 0       }); // waist at side seam
  poly.push({ x: sideKneeX,  y: kneeY   }); // knee on side seam
  poly.push({ x: sideHemX,   y: height  }); // hem at side seam
  poly.push({ x: inseamHemX, y: height  }); // hem at inseam
  poly.push({ x: inseamKneeX, y: kneeY  }); // knee on inseam
  poly.push({ x: -ext,       y: rise    }); // crotch extension point
  for (let i = curvePts.length - 2; i >= 0; i--) poly.push(curvePts[i]);

  const saPoly = offsetPolygon(poly, i => {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    return (a.y > height - 0.5 && b.y > height - 0.5) ? hem : sa;
  });

  const effSeatDepth = seatDepth || 7;
  const dims = [
    { label: fmtInches(width),              x1: 0,          y1: -0.5,   x2: width,      y2: -0.5,   type: 'h' },
    { label: fmtInches(kneeW) + ' knee',    x1: inseamKneeX, y1: kneeY + 0.4, x2: sideKneeX, y2: kneeY + 0.4, type: 'h', color: '#b8963e' },
    { label: fmtInches(hemW)  + ' hem',     x1: inseamHemX, y1: height - 0.5, x2: sideHemX,  y2: height - 0.5, type: 'h', color: '#b8963e' },
    { label: fmtInches(rise)   + ' rise',   x: width + 1.2, y1: 0,      y2: rise,               type: 'v' },
    { label: fmtInches(inseam) + ' inseam', x: width + 1.2, y1: rise,   y2: height,             type: 'v' },
    { label: fmtInches(ext)    + ' ext',    x1: -ext, y1: rise + 0.4, x2: 0, y2: rise + 0.4,   type: 'h', color: '#c44' },
    { label: fmtInches(effSeatDepth) + ' seat', x: -ext - 1.2, y1: 0, y2: effSeatDepth,        type: 'v', color: '#b8963e' },
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
