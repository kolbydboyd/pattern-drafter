// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Kids Leggings — children's fitted stretch knit panels (sizes 2T–14).
 * Adapted from leggings.js with zero/minimal ease (stretch fabric), elastic waistband,
 * and child-appropriate measurement defaults. No gusset for simplicity.
 * Pieces: front panel ×2, back panel ×2, waistband.
 */

import {
  edgeAngle, crotchCurvePoints, sampleBezier, offsetPolygon, polyToPath,
  fmtInches, insetCrotchBezier,
} from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

// Kids leggings: 0 ease on hip (knit fabric compresses to body)
const KIDS_STRETCH_EASE = { standard: 0, relaxed: 1.5 };

export default {
  id: 'kids-leggings',
  name: 'Kids Leggings',
  category: 'lower',
  audience: 'kids',
  difficulty: 'beginner',
  priceTier: 'simple',
  measurements: ['waist', 'hip', 'rise', 'thigh', 'inseam'],
  measurementDefaults: {
    waist: 22, hip: 24, rise: 6.5, thigh: 17, inseam: 16,
  },

  options: {
    fit: {
      type: 'select', label: 'Fit',
      values: [
        { value: 'standard', label: 'Standard (0″ ease)', reference: 'yoga, everyday' },
        { value: 'relaxed',  label: 'Relaxed (+1.5″)',    reference: 'loungewear'      },
      ],
      default: 'standard',
    },
    length: {
      type: 'select', label: 'Length',
      values: [
        { value: 'full',   label: 'Full length (ankle)' },
        { value: 'capri',  label: 'Capri (mid-calf)'    },
        { value: 'shorts', label: 'Bike shorts (mid-thigh)' },
      ],
      default: 'full',
    },
    waistHeight: {
      type: 'select', label: 'Waist height',
      values: [
        { value: 'high', label: 'High waist (+1.5″)', reference: 'stay-up, active'  },
        { value: 'mid',  label: 'Mid rise (body rise)', reference: 'standard'       },
      ],
      default: 'mid',
    },
    elasticWidth: {
      type: 'select', label: 'Elastic width',
      values: [
        { value: 0.75, label: '¾″' },
        { value: 1,    label: '1″' },
      ],
      default: 0.75,
    },
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
    const easeVal  = KIDS_STRETCH_EASE[opts.fit] ?? 0;
    const easeFront = easeVal * 0.25;
    const easeBack  = easeVal * 0.25;

    const sa      = parseFloat(opts.sa) || 0.375;
    const hem     = 0.75;
    const frontExt = 1.0;  // smaller crotch extension for children
    const backExt  = 1.75;
    const cbRaise  = 0.75;
    const RISE_OFFSETS = { high: 1.5, mid: 0 };
    const rise = (m.rise || 6.5) + (RISE_OFFSETS[opts.waistHeight] ?? 0);
    const LENGTH_MULT = { full: 1, capri: 0.65, shorts: 0.35 };
    const inseam = (m.inseam || 16) * (LENGTH_MULT[opts.length] ?? 1);

    let frontW = m.hip / 4 + easeFront;
    let backW  = m.hip / 4 + easeBack;

    // Thigh check — leggings should have at most slight ease
    if (m.thigh) {
      const patternThigh = (frontW + backW + frontExt + backExt) * 2;
      const targetThigh  = m.thigh * 2 + easeVal;
      if (patternThigh < targetThigh) {
        const perPanel = (targetThigh - patternThigh) / 4;
        frontW += perPanel;
        backW  += perPanel;
      }
    }

    const H = rise + inseam;

    const front = buildLeggingsPanel({
      type: 'front', name: 'Front Panel',
      instruction: 'Cut 2 (mirror L & R) · Stretch stitch all seams · 4-way stretch fabric required',
      width: frontW, height: H, rise, inseam,
      ext: frontExt, cbRaise: 0, sa, hem, isBack: false,
    });

    const back = buildLeggingsPanel({
      type: 'back', name: 'Back Panel',
      instruction: `Cut 2 (mirror L & R) · CB raised ${fmtInches(cbRaise)}`,
      width: backW, height: H, rise, inseam,
      ext: backExt, cbRaise, sa, hem, isBack: true,
    });

    const elasticW = parseFloat(opts.elasticWidth) || 0.75;
    const wbLen    = m.waist + 1.5 + sa * 2;
    const wbWidth  = (elasticW + 0.5) * 2;

    const waistband = {
      id: 'waistband',
      name: 'Waistband',
      instruction: `Cut 1 · ${fmtInches(wbWidth / 2)} finished width · Elastic-only casing · Gather leggings opening to fit band before attaching`,
      dimensions: { length: wbLen, width: wbWidth },
      type: 'rectangle', sa,
    };

    return [front, back, waistband];
  },

  materials(m, opts) {
    const elasticW = parseFloat(opts.elasticWidth) || 0.75;
    return buildMaterialsSpec({
      fabrics: ['cotton-jersey', 'poly-jersey', 'spandex-blend'],
      notions: [
        { ref: 'elastic-0.75', quantity: `${Math.round(m.waist * 0.85)}″`, notes: 'Full-circle waistband elastic' },
      ],
      thread: 'poly-all',
      needle: 'ballpoint-75',
      stitches: ['stretch', 'overlock', 'zigzag-med'],
      notes: [
        '4-way stretch fabric required — leggings have zero ease and rely on stretch to fit',
        'Use a ballpoint needle 75/11 to avoid snagging knit loops',
        'Stretch stitch or serger for ALL seams — straight stitch will pop',
        'Pre-wash fabric before cutting — knits shrink 3–5%',
        opts.length === 'full' ? 'Full-length: fold hem under ¾″, twin needle from RS' :
          opts.length === 'capri' ? 'Capri: raw edge is fine on stretch fabric — optionally serge and leave unfolded' : '',
      ].filter(Boolean),
    });
  },

  instructions(m, opts) {
    const steps = [];
    let n = 1;

    steps.push({
      step: n++, title: 'Sew center front seam',
      detail: 'Join front panels at CF {RST}. Stretch stitch from waist to crotch. {clip} curve. {serge} SA.',
    });
    steps.push({
      step: n++, title: 'Sew center back seam',
      detail: 'Join back panels at CB {RST}. Stretch stitch. {clip} curve. {serge} SA.',
    });
    steps.push({
      step: n++, title: 'Sew side seams',
      detail: 'Join front to back at side seams {RST}. Stretch stitch. {serge} or {press} open.',
    });
    steps.push({
      step: n++, title: 'Sew inseam',
      detail: 'Continuous stretch stitch from hem to hem through crotch. {clip} curve. {serge} SA.',
    });
    steps.push({
      step: n++, title: 'Attach waistband',
      detail: 'Sew waistband short ends into loop. Fold lengthwise {WST}. Divide into quarters, pin to leggings waist {RST}. Stretch stitch. Fold inside. {topstitch} all around leaving 2″ gap. Thread elastic through — snug on child but not tight. Overlap elastic 1″, {zigzag} to join. Close gap.',
    });
    steps.push({
      step: n++, title: 'Hem',
      detail: opts.length === 'full'
        ? 'Fold up ¾″, {press}. Twin needle from RS. Or serge raw edge and leave unfinished for stretch hems.'
        : 'Serge raw hem edge or fold under ½″ and {zigzag}. No need for a crisp hem on capri length.',
    });
    steps.push({
      step: n++, title: 'Finish',
      detail: 'Try on child. Waistband should stay up comfortably during movement. Adjust elastic if needed.',
    });

    return steps;
  },
};


// ── Leggings panel builder ─────────────────────────────────────────────────────

function buildLeggingsPanel({ type, name, instruction, width, height, rise, inseam, ext, cbRaise, sa, hem, isBack }) {
  const ccp      = crotchCurvePoints(0, 0, rise, ext, isBack, cbRaise);
  const curvePts = sampleBezier(ccp.p0, ccp.p1, ccp.p2, ccp.p3, 96);

  const H = height;

  const poly = [];
  poly.push({ x: 0,     y: isBack ? -cbRaise : 0 });
  poly.push({ x: width, y: 0     });
  poly.push({ x: width, y: H     });
  poly.push({ x: -ext,  y: H     });
  poly.push({ x: -ext,  y: rise  });
  for (let i = curvePts.length - 2; i >= 1; i--) poly.push({ ...curvePts[i], curve: true });
  if (isBack && cbRaise > 0) poly.push({ x: 0, y: cbRaise });

  const saPoly = offsetPolygon(poly, (i, a, b) => {
    if (Math.abs(a.y - H) < 0.5 && Math.abs(b.y - H) < 0.5) return -hem;
    return -sa;
  });

  const dims = [
    { label: fmtInches(width),              x1: 0,    y1: -0.5,       x2: width, y2: -0.5,       type: 'h' },
    { label: fmtInches(rise)   + ' rise',   x: width + 1.2, y1: 0,    y2: rise,                   type: 'v' },
    { label: fmtInches(inseam) + ' inseam', x: width + 1.2, y1: rise, y2: H,                      type: 'v' },
    { label: fmtInches(ext)    + ' ext',    x1: -ext, y1: rise + 0.4, x2: 0,     y2: rise + 0.4, type: 'h', color: '#c44' },
  ];

  const notches = [
    { x: width, y: rise * 0.5, angle: 0 },
    { x: -ext,  y: rise,       angle: edgeAngle({ x: -ext, y: H }, { x: -ext, y: rise }) },
    ...(isBack ? [
      { x: width, y: rise * 0.5 + 0.25, angle: 0 },
      { x: -ext,  y: rise - 0.25,       angle: edgeAngle({ x: -ext, y: H }, { x: -ext, y: rise }) },
    ] : []),
  ];

  return {
    id: type, name, instruction,
    polygon: poly, saPolygon: saPoly,
    path: polyToPath(poly), saPath: polyToPath(saPoly),
    dimensions: dims, width, height, rise, inseam, ext, cbRaise, sa, hem, isBack,
    labels: [
      { text: 'SIDE SEAM', x: width + 0.3, y: H * 0.35,  rotation: 90  },
      { text: 'CENTER',    x: -0.5,         y: rise * 0.3, rotation: -90 },
    ],
    notches, crotchBezier: ccp,
    crotchBezierSA: insetCrotchBezier(ccp, sa), type: 'panel',
  };
}
