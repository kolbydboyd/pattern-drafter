/**
 * Sweatpants — athletic knit trousers with elastic+drawstring waistband.
 * 30 inch default inseam, 10 inch rise, relaxed ease default.
 * Straight or tapered (jogger) leg. Optional kangaroo/slash side pockets.
 * Ribbed cuffs when jogger selected (3″ finished, 80% of hem opening width).
 */

import {
  crotchCurvePoints, sampleBezier, offsetPolygon, polyToPath,
  fmtInches, easeDistribution, LEG_SHAPES
} from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

export default {
  id: 'sweatpants',
  name: 'Sweatpants',
  category: 'lower',
  measurements: ['waist', 'hip', 'rise', 'thigh', 'inseam'],
  measurementDefaults: { inseam: 30 },

  options: {
    ease: {
      type: 'select', label: 'Fit',
      values: [
        { value: 'regular', label: 'Regular (+2.5″)' },
        { value: 'relaxed', label: 'Relaxed (+4″)'   },
        { value: 'wide',    label: 'Wide (+6″)'      },
      ],
      default: 'relaxed',
    },
    legStyle: {
      type: 'select', label: 'Leg style',
      values: [
        { value: 'straight', label: 'Straight — twin needle hem'  },
        { value: 'jogger',   label: 'Jogger — tapered + rib cuff' },
      ],
      default: 'straight',
    },
    pocket: {
      type: 'select', label: 'Pockets',
      values: [
        { value: 'none',     label: 'None'                      },
        { value: 'slash',    label: 'Slash/kangaroo side pockets' },
      ],
      default: 'slash',
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
      default: 'mid',
    },
    riseOverride: { type: 'number', label: 'Rise override (inches)', default: 0, step: 0.25, min: 0, max: 18 },
    frontExt: { type: 'number', label: 'Front crotch ext', default: 1.5, step: 0.25, min: 0.5, max: 3   },
    backExt:  { type: 'number', label: 'Back crotch ext',  default: 2.5, step: 0.25, min: 1,   max: 4   },
    cbRaise:  { type: 'number', label: 'CB raise',         default: 0.5, step: 0.25, min: 0,   max: 1.5 },
    sa: {
      type: 'select', label: 'Seam allowance',
      values: [
        { value: 0.375, label: '⅜″' },
        { value: 0.5,   label: '½″' },
      ],
      default: 0.5,
    },
    hem: {
      type: 'select', label: 'Hem allowance (straight leg)',
      values: [
        { value: 0.75, label: '¾″ twin-needle hem' },
        { value: 1,    label: '1″ fold & stitch'   },
      ],
      default: 0.75,
    },
  },

  pieces(m, opts) {
    const ease     = easeDistribution(opts.ease === 'wide' ? 'relaxed' : opts.ease);  // map to known keys
    const easeVal  = opts.ease === 'wide' ? 6 : opts.ease === 'relaxed' ? 4 : 2.5;
    const easeFront = easeVal * 0.4;
    const easeBack  = easeVal * 0.6;

    const sa       = parseFloat(opts.sa);
    const hem      = parseFloat(opts.hem);
    const frontExt = parseFloat(opts.frontExt);
    const backExt  = parseFloat(opts.backExt);
    const cbRaise  = parseFloat(opts.cbRaise);
    const RISE_OFFSETS = { 'ultra-low': -2.5, low: -1.5, mid: 0, high: 1.5, 'ultra-high': 3.0 };
    const baseRise  = m.rise || 10;
    const riseOff   = RISE_OFFSETS[opts.riseStyle] ?? 0;
    const rise      = parseFloat(opts.riseOverride) || (baseRise + riseOff);
    const inseam   = m.inseam || 30;
    const isJogger = opts.legStyle === 'jogger';

    // For jogger: taper to ~55% of panel width at hem (similar to slim shape)
    const shape = isJogger ? { knee: 0.82, hem: 0.58 } : { knee: 1.0, hem: 1.0 };

    const frontW = m.hip / 4 + easeFront;
    const backW  = m.hip / 4 + easeBack;
    const H      = rise + inseam;

    const pieces = [];

    pieces.push(buildPanel({
      type: 'front', name: 'Front Panel',
      instruction: `Cut 2 (mirror L & R) · Stretch stitch all seams${isJogger ? ' · Tapers to rib cuff at hem' : ''}`,
      width: frontW, height: H, rise, inseam,
      ext: frontExt, cbRaise: 0, sa, hem, isBack: false, shape, opts,
    }));

    pieces.push(buildPanel({
      type: 'back', name: 'Back Panel',
      instruction: `Cut 2 (mirror L & R) · CB raised ${fmtInches(cbRaise)}`,
      width: backW, height: H, rise, inseam,
      ext: backExt, cbRaise, sa, hem, isBack: true, shape, opts,
    }));

    // ── WAISTBAND (elastic + drawstring) ──
    const wbLen   = m.hip + easeVal + sa * 2;
    const wbWidth = 3.5;  // ~1.75″ finished
    pieces.push({
      id: 'waistband',
      name: 'Waistband',
      instruction: `Cut 1 · ${fmtInches(wbWidth / 2)} finished · Elastic + drawstring casing · Buttonhole/grommet pair at CF`,
      dimensions: { length: wbLen, width: wbWidth },
      type: 'rectangle', sa,
    });

    // ── POCKETS ──
    if (opts.pocket === 'slash') {
      pieces.push({
        id: 'pocket-bag',
        name: 'Side Slash Pocket Bag',
        instruction: 'Cut 4 (2 per side) · Same fabric or lining · Serge all edges',
        dimensions: { width: 8, height: 9 },
        type: 'pocket',
      });
    }

    // ── RIBBED CUFFS (jogger only) ──
    if (isJogger) {
      // Hem opening at hem level: sideHemX - inseamHemX
      const hemInward  = (frontW - frontW * shape.hem) * 0.5;
      const sideHemX   = frontW - hemInward;
      const inseamHemX = -frontExt + hemInward;
      const hemOpening = sideHemX - inseamHemX;

      const cuffWidth    = hemOpening * 0.8;  // 80% of hem opening for recovery
      const cuffHeight   = 3 * 2;             // 3″ finished = 6″ cut (doubled)

      pieces.push({
        id: 'rib-cuff',
        name: 'Rib Cuff',
        instruction: `Cut 2 from rib knit · ${fmtInches(cuffWidth)} wide × ${fmtInches(cuffHeight)} tall · 80% of hem opening (${fmtInches(hemOpening)}) for stretch recovery`,
        dimensions: { width: cuffWidth, height: cuffHeight },
        type: 'pocket',
      });
    }

    return pieces;
  },

  materials(m, opts) {
    const easeVal = opts.ease === 'wide' ? 6 : opts.ease === 'relaxed' ? 4 : 2.5;
    const isJogger = opts.legStyle === 'jogger';

    const notions = [
      { ref: 'elastic-1',    quantity: `${Math.round(m.waist * 0.85)}″ — back half of waistband` },
      { ref: 'drawstring',   quantity: `${Math.round(m.waist + 14)}″ — front tie + tails` },
    ];
    if (isJogger) {
      notions.push({ name: 'Rib knit', quantity: '0.5 yard', notes: 'For leg cuffs — high recovery stretch' });
    }

    return buildMaterialsSpec({
      fabrics: ['french-terry', 'sweatshirt-fleece'],
      notions,
      thread: 'poly-all',
      needle: 'ballpoint-90',
      stitches: ['stretch', 'overlock', 'zigzag-med', 'coverstitch'],
      notes: [
        'Use a ballpoint (jersey) needle 90/14 for fleece and french terry — prevents skipped stitches',
        'Use stretch stitch or serger for ALL seams — a straight stitch will pop when stretched',
        `Hem finish: ${isJogger ? 'ribbed cuffs gathered to 80% of hem opening provide natural stretch recovery — no hem needed' : 'twin needle creates two parallel rows of topstitch visible from RS; or use coverstitch if available'}`,
        'Pre-wash fleece/terry before cutting — knits can shrink 3–5% in first wash',
        'Do not press fleece with high heat — use low steam or finger press seams open',
        'Elastic runs through back half of waistband only. Drawstring ties at front only.',
      ],
    });
  },

  instructions(m, opts) {
    const steps = [];
    let n = 1;
    const isJogger = opts.legStyle === 'jogger';

    if (opts.pocket === 'slash') {
      steps.push({
        step: n++, title: 'Prepare slash pockets',
        detail: 'Serge all pocket bag edges. Mark pocket opening on front and back panels at mid-hip height. Sew pocket bag to front and back panels along opening seam (RST). Press bags away from opening. Understitch if desired. Baste bags to panel at side seam edges.',
      });
    }

    steps.push({ step: n++, title: 'Sew center front seam', detail: 'Join front panels at CF (RST). Stretch stitch from waist to crotch. Clip curve. Press or serge.' });
    steps.push({ step: n++, title: 'Sew center back seam',  detail: 'Join back panels at CB (RST). Stretch stitch. Clip. Press.' });
    steps.push({
      step: n++, title: 'Sew side seams',
      detail: opts.pocket === 'slash'
        ? 'Sew above and below pocket opening with stretch stitch. Sew around bag to join both halves. Trim corners. Press open.'
        : 'Join front to back at side seams (RST). Stretch stitch. Press open or serge together.',
    });
    steps.push({ step: n++, title: 'Sew inseam', detail: 'Continuous stretch stitch from hem to hem through crotch. Clip curve. Press toward back.' });

    steps.push({
      step: n++, title: 'Construct waistband',
      detail: 'Fold waistband in half lengthwise (WST), press. Fold CF ends under ½″. Sew buttonholes or install grommets at CF for drawstring exits. Pin to sweatpants waist (RST), stretching to fit. Stretch stitch. Fold to inside. Topstitch all the way around leaving a 3″ gap. Insert elastic into back half of casing — length = half the waist minus a little ease. Overlap elastic ends 1″, zigzag. Close gap in casing. Thread drawstring through front half. Knot or heat-seal ends.',
    });

    if (isJogger) {
      steps.push({
        step: n++, title: 'Attach rib cuffs',
        detail: 'Fold each rib cuff in half widthwise (WST). Divide hem opening and cuff into quarters, pin at quarters. Sew cuff to hem opening (RST), stretching cuff to match opening. Use stretch stitch or serger. Fold seam allowance up into leg, topstitch from RS if desired.',
      });
    } else {
      steps.push({
        step: n++, title: 'Hem',
        detail: `Fold hem up ${fmtInches(parseFloat(opts.hem))} once, press. For twin needle: sew from RS using a twin needle (2.5mm apart) in one pass. For regular: fold under raw edge, topstitch with zigzag or stretch stitch.`,
      });
    }

    steps.push({ step: n++, title: 'Finish', detail: 'Thread drawstring with safety pin. Knot or heat-seal cord ends. Try on and adjust elastic tension. Press lightly with damp cloth on low heat.' });

    return steps;
  },
};


// ── Panel builder with optional knee taper ────────────────────────────────

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
