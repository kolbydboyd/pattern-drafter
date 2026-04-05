// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Leggings — fitted knit stretch panels with elastic waistband.
 * Forked from sweatpants.js: removed pockets, cuffs, fly; added negative ease
 * for stretch fabric. Front + back panels + optional gusset.
 */

import {
  edgeAngle, crotchCurvePoints, sampleBezier, offsetPolygon, polyToPath,
  fmtInches, insetCrotchBezier
} from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

// Negative ease for stretch: leggings compress to body, no positive ease
const STRETCH_EASE = {
  compression: -2,   // athletic / compression (very fitted)
  standard:     0,   // body-skimming (zero ease — the stretch provides fit)
  relaxed:       2,  // slightly roomier
};

export default {
  id: 'leggings',
  name: 'Leggings',
  category: 'lower',
  difficulty: 'beginner',
  priceTier: 'simple',
  measurements: ['waist', 'hip', 'rise', 'thigh', 'inseam'],
  measurementDefaults: { inseam: 28 },

  options: {
    fit: {
      type: 'select', label: 'Fit',
      values: [
        { value: 'compression', label: 'Compression (−2″)',   reference: 'athletic, running'     },
        { value: 'standard',    label: 'Standard (0″ ease)',   reference: 'yoga, everyday'        },
        { value: 'relaxed',     label: 'Relaxed (+2″)',        reference: 'loungewear, cozy'      },
      ],
      default: 'standard',
    },
    length: {
      type: 'select', label: 'Length',
      values: [
        { value: 'full',    label: 'Full length (ankle)',  },
        { value: 'capri',   label: 'Capri (mid-calf)',     },
        { value: 'shorts',  label: 'Bike shorts (mid-thigh)', },
      ],
      default: 'full',
    },
    waistHeight: {
      type: 'select', label: 'Waist height',
      values: [
        { value: 'high',   label: 'High waist (+2″)',  reference: 'yoga, sculpting'        },
        { value: 'mid',    label: 'Mid rise (body rise)', reference: 'classic'              },
        { value: 'low',    label: 'Low rise (−1.5″)',  reference: '2000s, hipster'          },
      ],
      default: 'high',
    },
    gusset: {
      type: 'select', label: 'Gusset',
      values: [
        { value: 'yes', label: 'Yes — diamond gusset at crotch', reference: 'athletic, increased mobility' },
        { value: 'no',  label: 'No gusset',                      reference: 'minimal seams'               },
      ],
      default: 'no',
    },
    riseStyle: {
      type: 'select', label: 'Rise style',
      values: [
        { value: 'ultra-low',  label: 'Ultra low (−2.5″)' },
        { value: 'low',        label: 'Low rise (−1.5″)'  },
        { value: 'mid',        label: 'Mid rise'           },
        { value: 'high',       label: 'High rise (+1.5″)'  },
        { value: 'ultra-high', label: 'Ultra high (+3″)'   },
      ],
      default: 'mid',
    },
    frontExt: { type: 'number', label: 'Front crotch ext', default: 1.0, step: 0.25, min: 0.5, max: 2.5 },
    backExt:  { type: 'number', label: 'Back crotch ext',  default: 1.75, step: 0.25, min: 1,  max: 3.5 },
    cbRaise:  { type: 'number', label: 'CB raise',         default: 1.0, step: 0.25, min: 0,   max: 2   },
    sa: {
      type: 'select', label: 'Seam allowance',
      values: [
        { value: 0.375, label: '⅜″' },
        { value: 0.5,   label: '½″' },
      ],
      default: 0.375,
    },
  },

  pieces(m, opts) {
    const easeVal  = STRETCH_EASE[opts.fit] ?? 0;
    // For leggings, ease is applied symmetrically (not 20/30 split — knit doesn't need it)
    const easeFront = easeVal * 0.25;
    const easeBack  = easeVal * 0.25;

    const sa       = parseFloat(opts.sa);
    const hem      = 0.75;
    const frontExt = parseFloat(opts.frontExt);
    const backExt  = parseFloat(opts.backExt);
    const cbRaise  = parseFloat(opts.cbRaise);

    const RISE_OFFSETS = { 'ultra-low': -2.5, low: -1.5, mid: 0, high: 1.5, 'ultra-high': 3.0 };
    const waistHeightExtra = opts.waistHeight === 'high' ? 2 : opts.waistHeight === 'low' ? -1.5 : 0;
    const baseRise = m.rise || 10;
    const riseOff  = (RISE_OFFSETS[opts.riseStyle] ?? 0) + waistHeightExtra;
    const crotchEase = 0.5; // less ease for knit — fabric stretches
    const rise     = baseRise + riseOff + crotchEase;

    const fullInseam = m.inseam || 28;
    const inseam = opts.length === 'capri'
      ? Math.round(fullInseam * 0.65)
      : opts.length === 'shorts'
        ? Math.round(fullInseam * 0.25)
        : fullInseam;

    // Leggings: skinny leg shape (significant taper from thigh to ankle)
    const shape = opts.length === 'full'
      ? { knee: 0.75, hem: 0.60 }  // taper to ankle
      : opts.length === 'capri'
        ? { knee: 0.80, hem: 0.68 }
        : { knee: 1.0, hem: 1.0 }; // shorts: no taper needed

    const frontW = m.hip / 4 + easeFront;
    const backW  = m.hip / 4 + easeBack;

    const pieces = [];

    pieces.push(buildPanel({
      type: 'front', name: 'Front Panel',
      instruction: `Cut 2 (mirror L & R) · Stretch stitch all seams · 4-way stretch fabric only`,
      width: frontW, height: rise + inseam,
      rise, inseam, ext: frontExt, cbRaise: 0,
      sa, hem, isBack: false, shape,
      calf: m.calf, ankle: m.ankle,
    }));

    pieces.push(buildPanel({
      type: 'back', name: 'Back Panel',
      instruction: `Cut 2 (mirror L & R) · CB raised ${fmtInches(cbRaise)}`,
      width: backW, height: rise + inseam,
      rise, inseam, ext: backExt, cbRaise,
      sa, hem, isBack: true, shape,
      calf: m.calf, ankle: m.ankle,
    }));

    // Waistband: wide fold-over band for high-waist; narrow elastic for others
    const wbLen  = m.hip * (opts.fit === 'compression' ? 0.85 : 0.9);  // stretch band shorter than hip
    const wbHeight = opts.waistHeight === 'high' ? 5 : 3.5; // cut height (doubled for fold-over)
    pieces.push({
      id: 'waistband', name: 'Waistband',
      instruction: [
        `Cut 1 from waistband fabric`,
        `${fmtInches(wbLen)} long × ${fmtInches(wbHeight)} cut (${fmtInches(wbHeight / 2)} finished)`,
        `Fold in half lengthwise, sew to waist at ${Math.round((wbLen / m.hip) * 100)}% of hip opening`,
        opts.waistHeight === 'high' ? 'Fold-over band for high-waist coverage' : '1″ elastic in casing optional',
      ].filter(Boolean).join(' · '),
      dimensions: { length: wbLen, width: wbHeight },
      type: 'rectangle', sa,
    });

    // Gusset
    if (opts.gusset === 'yes') {
      const gussetSize = 3.5; // diamond ~3.5″ diagonal
      pieces.push({
        id: 'gusset', name: 'Gusset',
        instruction: `Cut 1 · Diamond shape ${fmtInches(gussetSize)} × ${fmtInches(gussetSize)} · Inset at crotch point where front and back meet`,
        dimensions: { width: gussetSize, height: gussetSize },
        type: 'pocket',
        sa,
      });
    }

    return pieces;
  },

  materials(m, opts) {
    const notions = [
      { name: 'Elastic 1″', quantity: `${Math.round(m.waist * 0.85)}″`, notes: 'Optional inside waistband — many leggings use band fabric stretch alone' },
    ];

    return buildMaterialsSpec({
      fabrics: ['supplex', 'poly-spandex', 'cotton-spandex', 'nylon-spandex'],
      notions,
      thread: 'poly-all',
      needle: 'ballpoint-90',
      stitches: ['stretch', 'overlock', 'coverstitch', 'zigzag-med'],
      notes: [
        'Use 4-way stretch fabric only — 2-way stretch will restrict movement in leggings',
        'Ballpoint needle (jersey/stretch) 90/14 prevents skipped stitches on lycra',
        'Serger or stretch stitch for ALL seams — straight stitch will pop under movement',
        'Pre-wash fabric: stretch knits relax 2–4% in first wash — cut after washing',
        opts.fit === 'compression' ? 'Compression fit: fabric will seem too small before stretching onto body — this is correct' : '',
        opts.waistHeight === 'high' ? 'High waist band: sew band in the round first, then attach to legging body with quarters matched' : '',
        'Hem: twin-needle or coverstitch for a professional finish on stretch hems',
      ].filter(Boolean),
    });
  },

  instructions(m, opts) {
    const steps = [];
    let n = 1;

    steps.push({ step: n++, title: 'Sew crotch seams', detail: 'Join front panels at CF crotch curve {RST}. Stretch stitch or {serge}. {clip} curve. Repeat for back panels at CB.' });

    if (opts.gusset === 'yes') {
      steps.push({ step: n++, title: 'Insert gusset', detail: 'Inset diamond gusset at crotch point where CF and CB meet. Sew on 4 sides {RST}. {clip} into corners. Turn and {press} gently.' });
    }

    steps.push({ step: n++, title: 'Sew side seams', detail: 'Join front to back at both side seams {RST}. Stretch stitch or {serge} from waist to hem. {press} toward back or serge flat.' });

    steps.push({ step: n++, title: 'Sew inseam', detail: 'Continuous stretch stitch from hem to hem through crotch. {clip} curve at crotch. {press} toward back.' });

    steps.push({
      step: n++, title: 'Attach waistband',
      detail: [
        'Sew waistband ends together to form a loop.',
        'Fold in half lengthwise {WST}.',
        'Divide waistband and legging waist into quarters, pin at quarters.',
        'Stretch waistband to match opening — sew {RST} with stretch stitch or serger.',
        opts.waistHeight === 'high' ? 'Fold band up to WS and topstitch close to edge from RS.' : 'Fold SA up into band. {topstitch} from RS close to seam.',
      ].join(' '),
    });

    steps.push({ step: n++, title: 'Hem', detail: 'Fold hem up ¾″, {press}. Twin needle or coverstitch from RS. Or {serge} raw edge and {topstitch}.' });

    steps.push({ step: n++, title: 'Finish', detail: 'Try on and check waistband lies flat and leg seams align at knee. {press} lightly with low steam — avoid high heat on synthetic stretch fabrics.' });

    return steps;
  },
};


// ── Panel builder — adapted from sweatpants.js buildPanel ─────────────────

function buildPanel({ type, name, instruction, width, height, rise, inseam, ext, cbRaise, sa, hem, isBack, shape, calf, ankle }) {
  const ccp      = crotchCurvePoints(0, 0, rise, ext, isBack, cbRaise);
  const curvePts = sampleBezier(ccp.p0, ccp.p1, ccp.p2, ccp.p3, 96);

  const kneeY       = rise + inseam * 0.55;
  const kneeW       = calf  ? calf  / 2 + 0.5 : width * shape.knee;
  const hemW        = ankle ? ankle / 2 + 0.5 : width * shape.hem;
  const kneeInward  = (width - kneeW) * 0.5;
  const hemInward   = (width - hemW)  * 0.5;
  const sideKneeX   =  width - kneeInward;
  const sideHemX    =  width - hemInward;
  const inseamKneeX = -ext   + kneeInward;
  const inseamHemX  = -ext   + hemInward;

  const poly = [];
  poly.push({ x: 0,     y: 0 });
  poly.push({ x: width,       y: 0      });
  poly.push({ x: sideKneeX,   y: kneeY  });
  poly.push({ x: sideHemX,    y: height });
  poly.push({ x: inseamHemX,  y: height });
  poly.push({ x: inseamKneeX, y: kneeY  });
  poly.push({ x: -ext,        y: rise   });
  for (let i = curvePts.length - 2; i >= 1; i--) poly.push({ ...curvePts[i], curve: true });
  if (isBack && cbRaise > 0) poly.push({ x: 0, y: cbRaise });

  const saPoly = offsetPolygon(poly, (i, a, b) => {
    if (Math.abs(a.y - height) < 0.5 && Math.abs(b.y - height) < 0.5) return -hem;
    return -sa;
  });

  const dims = [
    { label: fmtInches(width),              x1: 0,           y1: -0.5,         x2: width,     y2: -0.5,         type: 'h' },
    { label: fmtInches(kneeW) + ' knee',    x1: inseamKneeX, y1: kneeY + 0.4,  x2: sideKneeX, y2: kneeY + 0.4,  type: 'h', color: '#b8963e' },
    { label: fmtInches(hemW)  + ' hem',     x1: inseamHemX,  y1: height - 0.5, x2: sideHemX,  y2: height - 0.5, type: 'h', color: '#b8963e' },
    { label: fmtInches(rise)   + ' rise',   x: width + 1.2,  y1: 0,            y2: rise,                         type: 'v' },
    { label: fmtInches(inseam) + ' inseam', x: width + 1.2,  y1: rise,         y2: height,                       type: 'v' },
    { label: fmtInches(ext)    + ' ext',    x1: -ext, y1: rise + 0.4, x2: 0, y2: rise + 0.4,                    type: 'h', color: '#c44' },
  ];

  const notches = [
    { x: width,       y: 7,    angle: edgeAngle({ x: width, y: 0 }, { x: sideKneeX, y: kneeY }) },
    { x: -ext,        y: rise, angle: edgeAngle({ x: inseamKneeX, y: kneeY }, { x: -ext, y: rise }) },
    { x: sideKneeX,   y: kneeY, angle: edgeAngle({ x: width, y: 0 }, { x: sideKneeX, y: kneeY }) },
    { x: inseamKneeX, y: kneeY, angle: edgeAngle({ x: -ext, y: rise }, { x: inseamKneeX, y: kneeY }) },
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
    notches, crotchBezier: ccp,
    crotchBezierSA: insetCrotchBezier(ccp, sa), type: 'panel',
  };
}
