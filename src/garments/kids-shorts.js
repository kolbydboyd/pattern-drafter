// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Kids Pull-On Shorts — elastic-waist children's shorts (sizes 2T–14).
 * The most beginner-friendly kids pattern. Elastic waistband only, no fly, no zipper.
 * Pieces: front panel ×2, back panel ×2, waistband, optional side pocket bags.
 */

import {
  edgeAngle, crotchCurvePoints, sampleBezier, offsetPolygon, polyToPath,
  fmtInches, insetCrotchBezier, buildSideSeamPocketBag,
} from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

// Kids shorts: +1.5" hip ease (standard), +2.5" (relaxed)
const KIDS_SHORTS_EASE = { standard: 1.5, relaxed: 2.5 };
// Inseam length by size option
const INSEAM_PRESETS = { short: 3, mid: 5, bermuda: 8 };

export default {
  id: 'kids-shorts',
  name: 'Kids Pull-On Shorts',
  category: 'lower',
  audience: 'kids',
  difficulty: 'beginner',
  priceTier: 'simple',
  measurements: ['waist', 'hip', 'rise', 'thigh', 'inseam'],
  measurementDefaults: {
    waist: 22, hip: 24, rise: 6.5, thigh: 17, inseam: 5,
  },

  options: {
    ease: {
      type: 'select', label: 'Fit',
      values: [
        { value: 'standard', label: 'Standard (+1.5″)', reference: 'everyday, active' },
        { value: 'relaxed',  label: 'Relaxed (+2.5″)',  reference: 'comfy, play'      },
      ],
      default: 'standard',
    },
    length: {
      type: 'select', label: 'Length',
      values: [
        { value: 'short',   label: 'Short (3″ inseam)'    },
        { value: 'mid',     label: 'Mid (5″ inseam)'      },
        { value: 'bermuda', label: 'Bermuda (8″ inseam)'  },
      ],
      default: 'mid',
    },
    pocket: {
      type: 'select', label: 'Pockets',
      values: [
        { value: 'none',      label: 'None'                 },
        { value: 'side-seam', label: 'Side-seam bags (×2)' },
      ],
      default: 'none',
    },
    elasticWidth: {
      type: 'select', label: 'Elastic width',
      values: [
        { value: 0.75, label: '¾″' },
        { value: 1,    label: '1″' },
        { value: 1.5,  label: '1½″' },
      ],
      default: 1,
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
    const easeVal   = KIDS_SHORTS_EASE[opts.ease] ?? 1.5;
    const easeFront = easeVal * 0.25;
    const easeBack  = easeVal * 0.25;

    const sa      = parseFloat(opts.sa) || 0.375;
    const hem     = 1;   // 1″ hem for clean finish
    const frontExt = 1.5; // front crotch extension
    const backExt  = 2.75; // back crotch extension
    const cbRaise  = 0.75;
    const rise     = m.rise || 6.5;
    const inseam   = INSEAM_PRESETS[opts.length] ?? (m.inseam || 5);

    let frontW = m.hip / 4 + easeFront + 0.5;
    let backW  = m.hip / 4 + easeBack;

    // Thigh check
    if (m.thigh) {
      const patternThigh = (frontW + backW + frontExt + backExt) * 2;
      const minThigh = m.thigh * 2 + 2.5; // kids thigh ease
      if (patternThigh < minThigh) {
        const perPanel = (minThigh - patternThigh) / 4;
        frontW += perPanel;
        backW  += perPanel;
      }
    }

    const H = rise + inseam;

    const front = buildShortsPanel({
      type: 'front', name: 'Front Panel',
      instruction: 'Cut 2 (mirror L & R) · Straight stitch or {serge} seams',
      width: frontW, height: H, rise, inseam,
      ext: frontExt, cbRaise: 0, sa, hem, isBack: false,
    });

    const back = buildShortsPanel({
      type: 'back', name: 'Back Panel',
      instruction: `Cut 2 (mirror L & R) · CB raised ${fmtInches(cbRaise)}`,
      width: backW, height: H, rise, inseam,
      ext: backExt, cbRaise, sa, hem, isBack: true,
    });

    const elasticW = parseFloat(opts.elasticWidth) || 1;
    const wbLen    = m.waist + 1.5 + sa * 2;
    const wbWidth  = (elasticW + 0.75) * 2;

    const waistband = {
      id: 'waistband',
      name: 'Waistband',
      instruction: `Cut 1 · ${fmtInches(wbWidth / 2)} finished width · Full-circle elastic casing · Gather shorts opening to fit band before attaching`,
      dimensions: { length: wbLen, width: wbWidth },
      type: 'rectangle', sa,
    };

    const pieces = [front, back, waistband];

    if (opts.pocket === 'side-seam') {
      pieces.push(buildSideSeamPocketBag({
        bagWidth: 5, bagHeight: 6, sa,
        instruction: `Cut 4 (2 per side) · ${fmtInches(5)} wide × ${fmtInches(6)} deep · D-shaped · Lining or self fabric · Serge all edges before assembly`,
      }));
    }

    return pieces;
  },

  materials(m, opts) {
    const elasticW = parseFloat(opts.elasticWidth) || 1;
    const notions = [
      { ref: 'elastic-1', quantity: `${Math.round(m.waist * 0.85)}″`, notes: 'Full-circle elastic for waistband' },
    ];

    return buildMaterialsSpec({
      fabrics: ['cotton-twill', 'cotton-poplin', 'linen-blend', 'cotton-jersey'],
      notions,
      thread: 'poly-all',
      needle: 'universal-80',
      stitches: ['straight-2.5', 'zigzag-small', 'overlock'],
      notes: [
        'Woven fabric (cotton twill, poplin, linen) gives crisp shape. Jersey gives a comfier pull-on fit.',
        'For woven: use straight stitch seams and {serge} or zigzag raw edges.',
        'Pre-wash fabric before cutting — natural fibers can shrink 3–5%.',
        'Elastic-only waistband — no drawstring needed. Makes dressing easier for young children.',
        opts.length === 'short' ? 'Short inseam: great as play shorts or swimsuit cover-up' : '',
      ].filter(Boolean),
    });
  },

  instructions(m, opts) {
    const steps = [];
    let n = 1;

    if (opts.pocket === 'side-seam') {
      steps.push({
        step: n++, title: 'Prepare side pockets',
        detail: '{serge} all pocket bag edges. Mark pocket opening position on side seams. Sew pocket bags to front and back panel side seams {RST} along pocket opening. {press} bags away. {baste} bags at top and bottom edges.',
      });
    }

    steps.push({
      step: n++, title: 'Sew center front seam',
      detail: 'Join front panels at CF {RST}. Straight stitch or stretch stitch from waist to crotch. {clip} curve. {serge} or {press} open.',
    });
    steps.push({
      step: n++, title: 'Sew center back seam',
      detail: 'Join back panels at CB {RST}. Straight stitch. {clip} curve. {serge} or {press} open.',
    });
    steps.push({
      step: n++, title: 'Sew side seams',
      detail: opts.pocket === 'side-seam'
        ? 'Sew above and below pocket opening. Sew around bag to close. {press} seams open.'
        : 'Join front to back at side seams {RST}. Straight stitch. {press} seams open or {serge} together.',
    });
    steps.push({
      step: n++, title: 'Sew inseam',
      detail: 'Continuous straight stitch from hem to hem through crotch. {clip} curve. {serge} SA. {press} toward back.',
    });
    steps.push({
      step: n++, title: 'Attach waistband',
      detail: 'Sew waistband short ends into a loop. Fold lengthwise {WST}, {press}. Divide into quarters, pin to shorts waist {RST}. Sew around. Fold to inside. {topstitch} all the way around leaving a 2″ gap at a side seam. Thread elastic through — snug on child. Overlap elastic 1″, {zigzag} to join. Close gap.',
    });
    steps.push({
      step: n++, title: 'Hem',
      detail: 'Fold up 1″, {press}. {topstitch} close to fold. Optionally fold under raw edge for a clean double fold.',
    });
    steps.push({
      step: n++, title: 'Finish',
      detail: '{press} with damp cloth. Try on child — waistband should hold up comfortably. Shorts ready to wear.',
    });

    return steps;
  },
};


// ── Shorts panel builder ───────────────────────────────────────────────────────

function buildShortsPanel({ type, name, instruction, width, height, rise, inseam, ext, cbRaise, sa, hem, isBack }) {
  const ccp      = crotchCurvePoints(0, 0, rise, ext, isBack, cbRaise);
  const curvePts = sampleBezier(ccp.p0, ccp.p1, ccp.p2, ccp.p3, 96);

  const H = height;

  const poly = [];
  poly.push({ x: 0,     y: isBack ? -cbRaise : 0 });
  poly.push({ x: width, y: 0  });
  poly.push({ x: width, y: H  });
  poly.push({ x: -ext,  y: H  });
  poly.push({ x: -ext,  y: rise });
  for (let i = curvePts.length - 2; i >= 1; i--) poly.push({ ...curvePts[i], curve: true });
  if (isBack && cbRaise > 0) poly.push({ x: 0, y: cbRaise });

  const saPoly = offsetPolygon(poly, (i, a, b) => {
    if (Math.abs(a.y - H) < 0.5 && Math.abs(b.y - H) < 0.5) return -hem;
    return -sa;
  });

  const dims = [
    { label: fmtInches(width),             x1: 0,    y1: -0.5,       x2: width, y2: -0.5,       type: 'h' },
    { label: fmtInches(rise)   + ' rise',  x: width + 1.2, y1: 0,    y2: rise,                   type: 'v' },
    { label: fmtInches(inseam) + ' inseam', x: width + 1.2, y1: rise, y2: H,                     type: 'v' },
    { label: fmtInches(ext)    + ' ext',   x1: -ext, y1: rise + 0.4, x2: 0,     y2: rise + 0.4, type: 'h', color: '#c44' },
  ];

  const notches = [
    { x: width, y: rise * 0.5,       angle: 0 },
    { x: -ext,  y: rise,             angle: edgeAngle({ x: -ext, y: H }, { x: -ext, y: rise }) },
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
