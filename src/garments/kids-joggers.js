// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Kids Joggers — children's elastic-waist knit trousers (sizes 2T–14).
 * Adapted from sweatpants.js with child-appropriate ease, elastic-only waistband
 * (no drawstring — safety consideration for young children), and growth hem tuck.
 * Pieces: front panel ×2, back panel ×2, waistband, optional rib cuffs.
 */

import {
  edgeAngle, crotchCurvePoints, sampleBezier, offsetPolygon, polyToPath,
  fmtInches, insetCrotchBezier,
} from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

// Child ease: +2" hip (standard), +1.5" thigh
const KIDS_HIP_EASE = { standard: 2, relaxed: 3.5 };

export default {
  id: 'kids-joggers',
  name: 'Kids Joggers',
  category: 'lower',
  audience: 'kids',
  difficulty: 'beginner',
  priceTier: 'simple',
  measurements: ['waist', 'hip', 'rise', 'thigh', 'inseam'],
  measurementDefaults: {
    waist: 22, hip: 24, rise: 6.5, thigh: 17, inseam: 16,
  },

  options: {
    ease: {
      type: 'select', label: 'Fit',
      values: [
        { value: 'standard', label: 'Standard (+2″)', reference: 'classic, everyday' },
        { value: 'relaxed',  label: 'Relaxed (+3.5″)', reference: 'comfy, grow-into' },
      ],
      default: 'standard',
    },
    legStyle: {
      type: 'select', label: 'Leg style',
      values: [
        { value: 'straight', label: 'Straight, twin needle hem'   },
        { value: 'jogger',   label: 'Jogger, tapered + rib cuff' },
      ],
      default: 'straight',
    },
    pocket: {
      type: 'select', label: 'Side pockets',
      values: [
        { value: 'none',      label: 'None'                 },
        { value: 'side-seam', label: 'Side-seam bags (×2)' },
      ],
      default: 'none',
    },
    elasticWidth: {
      type: 'select', label: 'Elastic width',
      values: [
        { value: 0.75, label: '¾″ (1½″ finished waistband)' },
        { value: 1,    label: '1″ (1¾″ finished waistband)' },
        { value: 1.5,  label: '1½″ (2¼″ finished waistband)' },
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
    const easeVal  = KIDS_HIP_EASE[opts.ease] ?? 2;
    // Equal front/back ease for children (simpler block)
    const easeFront = easeVal * 0.25;
    const easeBack  = easeVal * 0.25;

    const sa      = parseFloat(opts.sa) || 0.375;
    const hem     = 1.5; // extra growth hem tuck built in
    const frontExt = 1.25;  // front crotch extension — shorter than adult
    const backExt  = 2.5;   // back crotch extension
    const cbRaise  = 0.75;  // back CB raise
    const rise     = m.rise || 6.5;
    const inseam   = m.inseam || 16;
    const isJogger = opts.legStyle === 'jogger';
    const shape    = isJogger ? { knee: 0.80, hem: 0.55 } : { knee: 1.0, hem: 1.0 };

    let frontW = m.hip / 4 + easeFront + 0.5;
    let backW  = m.hip / 4 + easeBack;

    // Thigh check
    if (m.thigh) {
      const patternThigh = (frontW + backW + frontExt + backExt) * 2;
      const minThigh = m.thigh * 2 + 2; // +2" kids thigh ease
      if (patternThigh < minThigh) {
        const perPanel = (minThigh - patternThigh) / 4;
        frontW += perPanel;
        backW  += perPanel;
      }
    }

    const H = rise + inseam;

    const front = buildKidsPanel({
      type: 'front', name: 'Front Panel',
      instruction: `Cut 2 (mirror L & R) · Stretch stitch all seams${isJogger ? ' · Tapers to rib cuff' : ''}`,
      width: frontW, height: H, rise, inseam,
      ext: frontExt, cbRaise: 0, sa, hem, isBack: false, shape,
    });

    const back = buildKidsPanel({
      type: 'back', name: 'Back Panel',
      instruction: `Cut 2 (mirror L & R) · CB raised ${fmtInches(cbRaise)}`,
      width: backW, height: H, rise, inseam,
      ext: backExt, cbRaise, sa, hem, isBack: true, shape,
    });

    // Waistband — elastic only (no drawstring for child safety)
    const elasticW = parseFloat(opts.elasticWidth) || 1;
    const wbLen    = m.waist + 1.5 + sa * 2;
    const wbWidth  = (elasticW + 0.75) * 2; // finished = elasticW + 0.75", cut = doubled

    const waistband = {
      id: 'waistband',
      name: 'Waistband',
      instruction: `Cut 1 · ${fmtInches(wbWidth / 2)} finished width · ${fmtInches(elasticW)} elastic casing · Elastic only (no drawstring) · Gather pant opening to fit band before attaching`,
      dimensions: { length: wbLen, width: wbWidth },
      type: 'rectangle', sa,
    };

    const pieces = [front, back, waistband];

    if (opts.pocket === 'side-seam') {
      pieces.push({
        id: 'pocket-bag',
        name: 'Side Pocket Bag',
        instruction: 'Cut 4 (2 per side) · Lining or self fabric · {serge} all edges',
        dimensions: { width: 6, height: 7 },
        type: 'pocket', sa,
      });
    }

    if (isJogger) {
      const kneeW     = frontW * shape.knee;
      const hemW      = frontW * shape.hem;
      const hemInward = (frontW - hemW) * 0.5;
      const sideHemX  = frontW - hemInward;
      const inseamHemX = -frontExt + hemInward;
      const hemOpening = sideHemX - inseamHemX;
      const cuffWidth  = hemOpening * 0.8;
      const cuffHeight = 2.5 * 2; // 2.5″ finished (shorter than adult)

      pieces.push({
        id: 'rib-cuff',
        name: 'Rib Cuff',
        instruction: `Cut 2 from rib knit · ${fmtInches(cuffWidth)} wide × ${fmtInches(cuffHeight)} tall · 80% of hem opening`,
        dimensions: { width: cuffWidth, height: cuffHeight },
        type: 'pocket', sa,
      });
    }

    return pieces;
  },

  materials(m, opts) {
    const isJogger = opts.legStyle === 'jogger';
    const elasticW = parseFloat(opts.elasticWidth) || 1;
    const notions = [
      { ref: 'elastic-1', quantity: `${Math.round(m.waist * 0.85)}″`, notes: 'Full-circle elastic for waistband' },
    ];
    if (isJogger) {
      notions.push({ name: 'Rib knit', quantity: '0.25 yard', notes: 'For leg cuffs' });
    }

    return buildMaterialsSpec({
      fabrics: ['french-terry', 'sweatshirt-fleece', 'cotton-jersey'],
      notions,
      thread: 'poly-all',
      needle: 'ballpoint-75',
      stitches: ['stretch', 'overlock', 'zigzag-med'],
      notes: [
        'Use a ballpoint needle 75/11 for knit fabrics — prevents snags',
        'Stretch stitch or serger for ALL seams — straight stitch will pop',
        'Elastic-only waistband recommended for children — no drawstring (safety)',
        'Growth hem: 1.5″ hem allowance is included. Fold up only 1″ to leave 0.5″ tuck for later letting down.',
        'Pre-wash fabric before cutting — knits shrink 3–5% in first wash',
        isJogger ? 'Rib cuffs at 80% of hem opening provide natural stretch recovery' : '',
      ].filter(Boolean),
    });
  },

  instructions(m, opts) {
    const steps = [];
    let n = 1;
    const isJogger = opts.legStyle === 'jogger';

    if (opts.pocket === 'side-seam') {
      steps.push({
        step: n++, title: 'Prepare side pockets',
        detail: '{serge} all pocket bag edges. Mark pocket opening position on side seams (roughly hip level). Sew pocket bags to front and back panel side seams along pocket opening. {press} bags away from panel. {baste} bags to panel at top and bottom edges of opening.',
      });
    }

    steps.push({
      step: n++, title: 'Sew center front seam',
      detail: 'Join front panels at CF {RST}. Stretch stitch from waist to crotch. {clip} curve. {serge} or {press} open.',
    });
    steps.push({
      step: n++, title: 'Sew center back seam',
      detail: 'Join back panels at CB {RST}. Stretch stitch. {clip} curve. {serge} or {press} open.',
    });
    steps.push({
      step: n++, title: 'Sew side seams',
      detail: opts.pocket === 'side-seam'
        ? 'Sew side seams above and below pocket openings. Sew around pocket bags to close. {press} seams open.'
        : 'Join front to back at side seams {RST}. Stretch stitch. {press} open.',
    });
    steps.push({
      step: n++, title: 'Sew inseam',
      detail: 'Continuous stretch stitch from hem to hem through crotch. {clip} curve. {press} toward back.',
    });
    steps.push({
      step: n++, title: 'Attach waistband',
      detail: 'Fold waistband in half lengthwise {WST}, {press}. Sew short ends together forming a loop. Pin to jogger waist {RST}, stretching to fit. Stretch stitch. Fold to inside. {topstitch} all around leaving a 2″ gap. Thread elastic through — measure elastic to fit snugly on child. Overlap elastic 1″, {zigzag} to join. Close gap in casing.',
    });

    if (isJogger) {
      steps.push({
        step: n++, title: 'Attach rib cuffs',
        detail: 'Fold each cuff in half widthwise {WST}. Sew short ends together. Divide cuff and hem opening into quarters, pin. Sew cuff to hem opening {RST}, stretching cuff to match opening. Stretch stitch.',
      });
    } else {
      steps.push({
        step: n++, title: 'Hem (with growth tuck)',
        detail: 'Fold hem up 1″ only (leaving a 0.5″ tuck inside for future letting-down), {press}. {topstitch} with stretch stitch or twin needle. To let down later: unpick hem, unfold tuck, press flat, re-hem.',
      });
    }

    steps.push({
      step: n++, title: 'Finish',
      detail: 'Try on child. Adjust elastic if needed — it should hold up without pinching. {press} lightly with damp cloth on low heat.',
    });

    return steps;
  },
};


// ── Panel builder (children's simplified block) ───────────────────────────────

function buildKidsPanel({ type, name, instruction, width, height, rise, inseam, ext, cbRaise, sa, hem, isBack, shape }) {
  const ccp      = crotchCurvePoints(0, 0, rise, ext, isBack, cbRaise);
  const curvePts = sampleBezier(ccp.p0, ccp.p1, ccp.p2, ccp.p3, 96);

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
  poly.push({ x: 0,            y: isBack ? -cbRaise : 0 });
  poly.push({ x: width,        y: 0      });
  poly.push({ x: sideKneeX,    y: kneeY  });
  poly.push({ x: sideHemX,     y: height });
  poly.push({ x: inseamHemX,   y: height });
  poly.push({ x: inseamKneeX,  y: kneeY  });
  poly.push({ x: -ext,         y: rise   });
  for (let i = curvePts.length - 2; i >= 1; i--) poly.push({ ...curvePts[i], curve: true });
  if (isBack && cbRaise > 0) poly.push({ x: 0, y: cbRaise });

  const saPoly = offsetPolygon(poly, (i, a, b) => {
    if (Math.abs(a.y - height) < 0.5 && Math.abs(b.y - height) < 0.5) return -hem;
    return -sa;
  });

  const dims = [
    { label: fmtInches(width),              x1: 0,    y1: -0.5,          x2: width,      y2: -0.5,          type: 'h' },
    { label: fmtInches(rise)   + ' rise',   x: width + 1.2, y1: 0,       y2: rise,                          type: 'v' },
    { label: fmtInches(inseam) + ' inseam', x: width + 1.2, y1: rise,    y2: height,                        type: 'v' },
    { label: fmtInches(ext)    + ' ext',    x1: -ext, y1: rise + 0.4,    x2: 0,          y2: rise + 0.4,    type: 'h', color: '#c44' },
  ];

  const notches = [
    { x: width,       y: rise * 0.5,  angle: edgeAngle({ x: width, y: 0 }, { x: sideKneeX, y: kneeY }) },
    { x: -ext,        y: rise,        angle: edgeAngle({ x: inseamKneeX, y: kneeY }, { x: -ext, y: rise }) },
    ...(isBack ? [
      { x: width,     y: rise * 0.5 + 0.25, angle: edgeAngle({ x: width, y: 0 }, { x: sideKneeX, y: kneeY }) },
      { x: -ext,      y: rise - 0.25,       angle: edgeAngle({ x: inseamKneeX, y: kneeY }, { x: -ext, y: rise }) },
    ] : []),
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
