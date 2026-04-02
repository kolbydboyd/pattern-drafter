// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Gym Shorts — athletic lower body block.
 * 4-way stretch supplex/poly-spandex, side-seam pockets only,
 * elastic-back / drawstring-front hybrid waistband, no fly, no cargo, no back pockets.
 */

import {
  crotchCurvePoints, sampleBezier, offsetPolygon, polyToPath,
  fmtInches, easeDistribution, edgeAngle, insetCrotchBezier
} from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

export default {
  id: 'gym-shorts',
  name: 'Gym Shorts',
  category: 'lower',
  difficulty: 'beginner',
  priceTier: 'simple',
  measurements: ['waist', 'hip', 'rise', 'thigh', 'inseam'],
  measurementDefaults: { inseam: 7 },

  options: {
    ease: {
      type: 'select', label: 'Fit',
      values: [
        { value: 'slim',    label: 'Slim (+2.5\u2033) , stretch fabric only', reference: 'fitted, tailored'    },
        { value: 'regular', label: 'Regular (+4\u2033)', reference: 'classic, off-the-rack' },
        { value: 'relaxed', label: 'Relaxed (+6\u2033)',   reference: 'skater, workwear'      },
      ],
      default: 'regular',
    },
    pocket: {
      type: 'select', label: 'Side pockets',
      values: [
        { value: 'none',      label: 'None',               reference: 'minimal'        },
        { value: 'side-seam', label: 'Side-seam bag ×2',  reference: 'hidden, clean'  },
      ],
      default: 'side-seam',
    },
    grommets: {
      type: 'select', label: 'Drawstring exit',
      values: [
        { value: 'grommets',  label: 'Metal grommets (2)' },
        { value: 'buttonhole', label: 'Worked buttonholes' },
      ],
      default: 'grommets',
    },
    liner: {
      type: 'select', label: 'Brief liner',
      values: [
        { value: 'none', label: 'None',               reference: 'minimal, layerable'   },
        { value: 'mesh', label: 'Athletic mesh liner', reference: 'athletic, brief-style' },
      ],
      default: 'none',
    },
    frontExt: { type: 'number', label: 'Front crotch ext', default: 2, step: 0.25, min: 0.5, max: 3    },
    backExt:  { type: 'number', label: 'Back crotch ext',  default: 2.5, step: 0.25, min: 1,   max: 4    },
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
    cbRaise:  { type: 'number', label: 'CB raise',         default: 1.25, step: 0.25, min: 0,   max: 2.5  },
    sa: {
      type: 'select', label: 'Seam allowance',
      values: [
        { value: 0.375, label: '⅜″' },
        { value: 0.5,   label: '½″' },
      ],
      default: 0.5,
    },
    hem: {
      type: 'select', label: 'Hem allowance',
      values: [
        { value: 0.75, label: '¾″ turned & stitched' },
        { value: 1,    label: '1″ (cuff roll)'       },
      ],
      default: 0.75,
    },
  },

  /**
   * Generate all pattern pieces
   */
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
    const crotchEase = 0.75; // ease below body rise — prevents fabric pulling tight against crotch
    const rise      = parseFloat(opts.riseOverride) || (baseRise + riseOff + crotchEase);
    const inseam    = m.inseam || (m.outseam ? Math.max(1, m.outseam - rise) : 7);

    let frontW = m.hip / 4 + ease.front;
    let backW  = m.hip / 4 + ease.back;

    // Thigh ease check
    if (m.thigh) {
      const patternThigh = (frontW + backW + frontExt + backExt) * 2;
      const minThigh = m.thigh * 2 + 3;
      if (patternThigh < minThigh) {
        const perPanel = (minThigh - patternThigh) / 4;
        frontW += perPanel;
        backW += perPanel;
        console.warn(`[gym-shorts] Thigh ease insufficient (${(patternThigh - m.thigh * 2).toFixed(1)}″) — widened panels by ${perPanel.toFixed(2)}″ each`);
      } else if (patternThigh - m.thigh * 2 < 2) {
        console.warn(`[gym-shorts] Thigh ease is tight: ${(patternThigh - m.thigh * 2).toFixed(1)}″ (recommend ≥ 2″)`);
      }
    }

    const H      = rise + inseam;

    const pieces = [];

    // ── FRONT PANEL ──
    pieces.push(buildPanel({
      type: 'front',
      name: 'Front Panel',
      instruction: 'Cut 2 (mirror L & R) · Curve on CENTER seam · Stretch fabric',
      width: frontW,
      height: H,
      rise,
      inseam,
      ext: frontExt,
      cbRaise: 0,
      sa, hem,
      isBack: false,
      opts,
    }));

    // ── BACK PANEL ──
    pieces.push(buildPanel({
      type: 'back',
      name: 'Back Panel',
      instruction: `Cut 2 (mirror L & R) · CB raised ${fmtInches(cbRaise)} · Stretch fabric`,
      width: backW,
      height: H,
      rise,
      inseam,
      ext: backExt,
      cbRaise,
      sa, hem,
      isBack: true,
      opts,
    }));

    // ── WAISTBAND — FRONT HALF (drawstring + grommets) ──
    // Front half matches front garment opening (both front panels)
    const wbFrontLen   = frontW * 2 + sa * 2;
    const wbWidth      = 3.5;   // 1.75″ finished (doubled)
    pieces.push({
      id: 'waistband-front',
      name: 'Waistband Front',
      instruction: `Cut 1 · Interface · ${fmtInches(wbWidth / 2)} finished · Grommet/buttonhole placement at CF`,
      dimensions: { length: wbFrontLen, width: wbWidth },
      type: 'rectangle',
      sa,
    });

    // ── WAISTBAND — BACK HALF (elastic casing) ──
    const wbBackLen = backW * 2 + sa * 2;
    pieces.push({
      id: 'waistband-back',
      name: 'Waistband Back',
      instruction: `Cut 1 · Casing for 1″ elastic · ${fmtInches(wbWidth / 2)} finished`,
      dimensions: { length: wbBackLen, width: wbWidth },
      type: 'rectangle',
      sa,
    });

    // ── POCKET PIECES ──
    if (opts.pocket === 'side-seam') {
      pieces.push({
        id: 'pocket-bag',
        name: 'Side-Seam Pocket Bag',
        instruction: 'Cut 4 (2 per side) · Mesh or lining fabric OK',
        dimensions: { width: 7, height: 7.5 },
        type: 'pocket',
        sa,
      });
    }

    // ── MESH LINER (optional) ──
    if (opts.liner === 'mesh') {
      // Simplified brief liner — mirror front panel, trimmed 0.5″ narrower each side
      const linerW = m.hip / 2 + 2;
      const linerH = H - inseam * 0.35;   // briefs stop above hem
      pieces.push({
        id: 'liner',
        name: 'Brief Liner',
        instruction: 'Cut 2 (mirror) from athletic mesh · No SA needed - {serge} raw edges',
        dimensions: { width: linerW, height: linerH },
        type: 'pocket',
        sa,
      });
    }

    return pieces;
  },

  /**
   * Materials / BOM
   */
  materials(m, opts) {
    const notions = [
      { ref: 'elastic-1',    quantity: `${Math.round(m.waist * 0.45)}″ - back waistband casing (~90% of half-waist)` },
      { ref: 'drawstring',   quantity: `${Math.round(m.waist + 12)}″ - front tie + tails` },
      { ref: 'interfacing-med', quantity: '0.25 yard - front waistband only' },
    ];

    if (opts.grommets === 'grommets') {
      notions.push({ ref: 'grommets', quantity: '2 - CF drawstring exits, ½″ inner dia' });
    }

    if (opts.liner === 'mesh') {
      notions.push({ name: 'Athletic mesh', quantity: '0.5 yard', notes: 'Brief liner only' });
    }

    return buildMaterialsSpec({
      fabrics: ['supplex', 'nylon-taslan'],
      notions,
      thread: 'poly-all',
      needle: 'ballpoint-80',
      stitches: ['stretch', 'zigzag-med', 'straight-3', 'zigzag-small'],
      notes: [
        'Color guidance - hides sweat best: black, navy, dark charcoal, dark olive. Avoid light gray and light blue.',
        'Pre-wash fabric before cutting - supplex and nylon-taslan resist shrinkage but relax slightly',
        'Use a stretch stitch or narrow {zigzag} for all seams - straight stitch will pop on stretch fabric',
        'Interface front waistband only; back casing does not need interfacing',
        'Use a ballpoint needle to avoid skipped stitches on knit/stretch weaves',
        '{press} seams with a damp cloth and low heat - high heat damages synthetic fibers',
      ],
    });
  },

  /**
   * Construction instructions
   */
  instructions(m, opts) {
    const steps = [];
    let n = 1;

    // Pockets
    if (opts.pocket === 'side-seam') {
      steps.push({
        step: n++,
        title: 'Prepare side-seam pocket bags',
        detail: '{serge} or {zigzag} all pocket bag edges. With RST, pin one bag to front panel side seam and one to back panel side seam at pocket opening. Sew bag to panel along opening edge only. {press} bags toward panels. {understitch} if desired.',
      });
    }

    // Liner
    if (opts.liner === 'mesh') {
      steps.push({
        step: n++,
        title: 'Attach brief liner',
        detail: '{serge} all liner edges. Align liner WS to WS of front panels at waist and crotch. {baste} ¼″ from waist and crotch edges. Treat as one layer going forward.',
      });
    }

    // Panel assembly
    steps.push({
      step: n++,
      title: 'Sew center front seam',
      detail: 'Join two front panels at center seam {RST}. Use stretch stitch from waist to crotch curve. {clip} curve every ½″. {press} seam open or to one side.',
    });
    steps.push({
      step: n++,
      title: 'Sew center back seam',
      detail: 'Join two back panels at center seam {RST}. Stretch stitch. {clip} crotch curve. {press}.',
    });
    steps.push({
      step: n++,
      title: 'Sew side seams',
      detail: opts.pocket === 'side-seam'
        ? 'Pin front to back at side seams {RST}. Sew above and below pocket opening with stretch stitch. Pivot and sew around pocket bag, joining both bags together. {clip} corners. {press} side seams open.'
        : 'Join front to back at side seams {RST} with stretch stitch. {press} open.',
    });
    steps.push({
      step: n++,
      title: 'Sew inseam',
      detail: 'Continuous stretch stitch from hem to hem through crotch junction. {clip} curve. {press} toward back.',
    });

    // Waistband
    steps.push({
      step: n++,
      title: 'Construct front waistband',
      detail: `Fuse interfacing to front waistband. Install ${opts.grommets === 'grommets' ? 'grommets ¾″ from each CF end' : 'worked buttonholes ¾″ from each CF end'} for drawstring exits. Fold in half lengthwise {WST}, {press}. Pin to shorts front waist {RST}, sew. Fold over to inside, pin covering seam. {topstitch} through all layers with straight stitch.`,
    });
    steps.push({
      step: n++,
      title: 'Construct back waistband',
      detail: 'Fold back waistband in half lengthwise {WST}, {press}. Pin to shorts back waist {RST}, sew. Fold over, leave a 2″ gap in the topstitching. Thread 1″ elastic through casing with a {bodkin}. Overlap ends 1″, {zigzag} to join. Close gap. Double {topstitch} top and bottom edges of casing.',
    });
    steps.push({
      step: n++,
      title: 'Join waistband halves',
      detail: 'Fold short ends of front and back waistband under ⅜″. Pin side seams of waistband together, aligning with garment side seams. {slipstitch} or {topstitch} closed on each side.',
    });
    steps.push({
      step: n++,
      title: 'Thread drawstring',
      detail: 'Attach a safety pin to one end of drawstring. Feed through front waistband casing, in through one grommet and out through the other. Even up tails. Knot or melt-seal synthetic cord ends to prevent fraying.',
    });

    // Hem
    steps.push({
      step: n++,
      title: 'Hem',
      detail: `Fold hem up ${fmtInches(parseFloat(opts.hem))} twice (or once and {serge} raw edge). {press} with damp cloth, low heat. {topstitch} with {zigzag} (width 2.5 mm) or coverstitch - do not use straight stitch on stretch hems.`,
    });
    steps.push({
      step: n++,
      title: 'Finish',
      detail: '{press} entire garment with damp cloth, low heat. Try on and adjust elastic tension and drawstring length. Tie a temporary overhand knot in the drawstring during wear testing.',
    });

    return steps;
  },
};


// ══════════════════════════════════════════════
// PANEL BUILDER  (mirrors cargo-shorts geometry)
// ══════════════════════════════════════════════

function buildPanel({ type, name, instruction, width, height, rise, inseam, ext, cbRaise, sa, hem, isBack, opts }) {
  const ccp      = crotchCurvePoints(0, 0, rise, ext, isBack, cbRaise);
  const curvePts = sampleBezier(ccp.p0, ccp.p1, ccp.p2, ccp.p3, 96);

  const poly = [];

  poly.push({ x: 0,     y: isBack ? -cbRaise : 0 }); // waist (raised on back)
  poly.push({ x: width, y: 0 });
  poly.push({ x: width, y: height });
  poly.push({ x: -ext,  y: height });
  poly.push({ x: -ext,  y: rise   });

  for (let i = curvePts.length - 2; i >= 1; i--) {
    poly.push({ ...curvePts[i], curve: true });
  }
  if (isBack && cbRaise > 0) poly.push({ x: 0, y: cbRaise }); // CB seam top

  const saPoly = offsetPolygon(poly, (i, a, b) => {
    if (Math.abs(a.y - height) < 0.5 && Math.abs(b.y - height) < 0.5) return -hem;
    return -sa;
  });

  const dims = [
    { label: fmtInches(width),              x1: 0,      y1: -0.5,       x2: width,      y2: -0.5,       type: 'h' },
    { label: fmtInches(rise)   + ' rise',   x: width + 1.2, y1: 0,      y2: rise,                       type: 'v' },
    { label: fmtInches(inseam) + ' inseam', x: width + 1.2, y1: rise,   y2: height,                     type: 'v' },
    { label: fmtInches(height) + ' total',  x: width + 2.3, y1: 0,      y2: height,                     type: 'v' },
    { label: fmtInches(ext)    + ' ext',    x1: -ext,   y1: rise + 0.4, x2: 0,          y2: rise + 0.4, type: 'h', color: '#c44' },
  ];

  // Notch marks: hip level on side seam, crotch junction
  const notches = [
    { x: width, y: rise,        angle: edgeAngle({ x: width, y: 0 }, { x: width, y: height }) },  // hip on side seam
    ...(isBack ? [{ x: width, y: rise + 0.25, angle: edgeAngle({ x: width, y: 0 }, { x: width, y: height }) }] : []),
    { x: -ext,  y: rise,        angle: edgeAngle({ x: -ext, y: height }, { x: -ext, y: rise }) },  // crotch junction
    ...(isBack ? [{ x: -ext,  y: rise - 0.25, angle: edgeAngle({ x: -ext, y: height }, { x: -ext, y: rise }) }] : []),
  ];

  return {
    id: type,
    name,
    instruction,
    polygon:   poly,
    saPolygon: saPoly,
    path:   polyToPath(poly),
    saPath: polyToPath(saPoly),
    dimensions: dims,
    width, height, rise, inseam, ext, cbRaise, sa, hem,
    isBack,
    notches,
    labels: [
      { text: 'SIDE SEAM', x: width + 0.3, y: height * 0.35, rotation: 90  },
      { text: 'CENTER',    x: -0.5,         y: rise   * 0.3,  rotation: -90 },
    ],
    crotchBezier: ccp,
    // LOCKED — crotch curve cut & stitch lines are finalized. Do not modify
    // crotchBezier, crotchBezierSA, or their rendering in pattern-view.js.
    crotchBezierSA: insetCrotchBezier(ccp, sa), type: 'panel',
    opts,
  };
}
