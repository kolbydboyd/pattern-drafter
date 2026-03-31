// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Swim Trunks — nylon taslan outer with mesh liner panels.
 * Side-seam pockets with mesh drainage bags. Drawstring + grommets only (no elastic).
 * 5 inch default inseam.
 */

import {
  crotchCurvePoints, sampleBezier, offsetPolygon, polyToPath,
  fmtInches, easeDistribution, edgeAngle, insetCrotchBezier
} from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

export default {
  id: 'swim-trunks',
  name: 'Swim Trunks',
  category: 'lower',
  difficulty: 'beginner',
  priceTier: 'simple',
  measurements: ['waist', 'hip', 'rise', 'thigh', 'inseam'],
  measurementDefaults: { inseam: 5 },

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
        { value: 'none',      label: 'None',                         reference: 'minimal'       },
        { value: 'side-seam', label: 'Side-seam mesh bag ×2',       reference: 'hidden, clean' },
      ],
      default: 'side-seam',
    },
    liner: {
      type: 'select', label: 'Mesh liner',
      values: [
        { value: 'yes', label: 'Yes, front & back mesh panels',  reference: 'athletic, brief-style' },
        { value: 'no',  label: 'No liner',                       reference: 'minimal, layerable'   },
      ],
      default: 'yes',
    },
    frontExt: { type: 'number', label: 'Front crotch ext', default: 1.25, step: 0.25, min: 0.5, max: 2.5 },
    backExt:  { type: 'number', label: 'Back crotch ext',  default: 2.0,  step: 0.25, min: 1,   max: 3.5 },
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
    cbRaise:  { type: 'number', label: 'CB raise',         default: 0.5,  step: 0.25, min: 0,   max: 1.5 },
    sa: {
      type: 'select', label: 'Seam allowance',
      values: [
        { value: 0.375, label: '⅜″' },
        { value: 0.5,   label: '½″' },
      ],
      default: 0.5,
    },
    hem: {
      type: 'select', label: 'Hem finish',
      values: [
        { value: 0.5,  label: '½″ turned & stitched' },
        { value: 0.75, label: '¾″ with binding tape'  },
      ],
      default: 0.5,
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
    const inseam    = m.inseam || (m.outseam ? Math.max(1, m.outseam - rise) : 5);

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
        console.warn(`[swim-trunks] Thigh ease insufficient (${(patternThigh - m.thigh * 2).toFixed(1)}″) — widened panels by ${perPanel.toFixed(2)}″ each`);
      } else if (patternThigh - m.thigh * 2 < 2) {
        console.warn(`[swim-trunks] Thigh ease is tight: ${(patternThigh - m.thigh * 2).toFixed(1)}″ (recommend ≥ 2″)`);
      }
    }

    const H      = rise + inseam;

    const pieces = [];

    // ── OUTER PANELS ──
    pieces.push(buildPanel({
      type: 'front', name: 'Front Panel',
      instruction: 'Cut 2 (mirror L & R) · Nylon taslan outer',
      width: frontW, height: H, rise, inseam,
      ext: frontExt, cbRaise: 0, sa, hem, isBack: false, opts,
    }));
    pieces.push(buildPanel({
      type: 'back', name: 'Back Panel',
      instruction: `Cut 2 (mirror L & R) · CB raised ${fmtInches(cbRaise)}`,
      width: backW, height: H, rise, inseam,
      ext: backExt, cbRaise, sa, hem, isBack: true, opts,
    }));

    // ── MESH LINER PANELS (1″ shorter than outer) ──
    if (opts.liner === 'yes') {
      const linerInseam = Math.max(inseam - 1, 1);
      const linerH = rise + linerInseam;
      pieces.push(buildPanel({
        type: 'front-liner', name: 'Front Liner Panel',
        instruction: 'Cut 2 (mirror) · Athletic mesh · 1″ shorter than outer front',
        width: frontW, height: linerH, rise, inseam: linerInseam,
        ext: frontExt, cbRaise: 0, sa: 0.375, hem: 0.375, isBack: false, opts,
      }));
      pieces.push(buildPanel({
        type: 'back-liner', name: 'Back Liner Panel',
        instruction: 'Cut 2 (mirror) · Athletic mesh · 1″ shorter than outer back',
        width: backW, height: linerH, rise, inseam: linerInseam,
        ext: backExt, cbRaise, sa: 0.375, hem: 0.375, isBack: true, opts,
      }));
    }

    // ── WAISTBAND (drawstring only — no elastic) ──
    const wbLen   = m.hip + ease.total + sa * 2;
    const wbWidth = 3;   // 1.5″ finished
    pieces.push({
      id: 'waistband',
      name: 'Waistband',
      instruction: `Cut 1 · Nylon · ${fmtInches(wbWidth / 2)} finished · Grommet pair at CF for drawstring`,
      dimensions: { length: wbLen, width: wbWidth },
      type: 'rectangle', sa,
    });

    // ── SIDE-SEAM POCKET BAGS (mesh for drainage) ──
    if (opts.pocket === 'side-seam') {
      pieces.push({
        id: 'pocket-bag',
        name: 'Side-Seam Pocket Bag',
        instruction: 'Cut 4 (2 per side) · Athletic mesh - allows water drainage · {serge} all edges',
        dimensions: { width: 6.5, height: 7 },
        type: 'pocket',
        sa,
      });
    }

    return pieces;
  },

  materials(m, opts) {
    const notions = [
      { ref: 'drawstring', quantity: `${Math.round(m.waist + 14)}″ - flat nylon or polyester cord` },
      { ref: 'grommets',   quantity: '2 - CF drawstring exits, ½″ inner dia, rust-proof' },
    ];
    if (opts.liner === 'yes') {
      notions.push({ name: 'Athletic mesh', quantity: '0.75 yard', notes: 'Liner panels + pocket bags' });
    }

    return buildMaterialsSpec({
      fabrics: ['nylon-taslan', 'supplex'],
      notions,
      thread: 'poly-all',
      needle: 'ballpoint-80',
      stitches: ['stretch', 'zigzag-small', 'straight-3'],
      notes: [
        'Use polyester thread ONLY - cotton thread rots with repeated chlorine and salt water exposure',
        'Rinse trunks in fresh cold water after every wear (pool or ocean) to extend fabric life',
        'Color guidance - hides sweat: black, navy, dark charcoal, dark olive. Avoid light gray and light blue near the water line.',
        'Use rust-proof grommets (brass or stainless) - standard steel grommets will stain the fabric',
        'All hardware (grommets, cord locks) must be corrosion-resistant for saltwater use',
        '{serge} or {zigzag} all seams - do not leave raw edges on mesh; they will fray in water',
        'Do not {press} nylon with high heat - use a damp pressing cloth on low if needed',
      ],
    });
  },

  instructions(m, opts) {
    const steps = [];
    let n = 1;

    if (opts.liner === 'yes') {
      steps.push({
        step: n++, title: 'Assemble liner',
        detail: '{serge} all liner panel edges. Join liner fronts at CF crotch seam. Join liner backs at CB. Join liner at side seams. Join inseam. {baste} liner WS to WS of outer at waist edge (¼″). Treat as one unit going forward.',
      });
    }

    if (opts.pocket === 'side-seam') {
      steps.push({
        step: n++, title: 'Prepare pocket bags',
        detail: '{serge} all mesh pocket bag edges. Pin one bag to each front panel side seam and one to each back panel at the pocket opening zone. Sew bags to panels along opening only. {press} away from opening.',
      });
    }

    steps.push({ step: n++, title: 'Sew center front seam', detail: 'Join outer front panels at CF crotch {RST}. Stretch stitch. {clip} curve every ½″. {press}.' });
    steps.push({ step: n++, title: 'Sew center back seam',  detail: 'Join outer back panels at CB {RST}. Stretch stitch. {clip}. {press}.' });
    steps.push({
      step: n++, title: 'Sew side seams',
      detail: opts.pocket === 'side-seam'
        ? 'Sew above and below pocket opening with stretch stitch. Pivot and sew around pocket bags, joining both bags together. Trim corners. {press} open.'
        : 'Join front to back at side seams {RST}. Stretch stitch. {press} open.',
    });
    steps.push({ step: n++, title: 'Sew inseam', detail: 'Continuous stretch stitch from hem to hem through crotch. {clip} curve. {press} toward back.' });

    steps.push({
      step: n++, title: 'Install grommets in waistband',
      detail: 'Mark grommet positions ¾″ from each CF short end of waistband. Punch holes with awl or hole punch. Set rust-proof grommets per manufacturer instructions. Check they are flush and secure.',
    });
    steps.push({
      step: n++, title: 'Attach waistband',
      detail: 'Fold waistband in half lengthwise {WST}, {press}. Pin to trunks waist {RST}, matching side seams. Sew. Fold over to inside, pin covering seam. {topstitch} close to inner fold with stretch stitch.',
    });
    steps.push({
      step: n++, title: 'Thread drawstring',
      detail: 'Attach safety pin to cord end. Thread through waistband casing, exiting at both CF grommets. Even tails. Melt-seal or knot cord ends to prevent fraying. Test drawstring moves freely.',
    });
    steps.push({
      step: n++, title: 'Hem',
      detail: `Fold hem up ${fmtInches(parseFloat(opts.hem))} once. {topstitch} with {zigzag} (2.5mm width). Do not use straight stitch on stretch/nylon hems.`,
    });
    steps.push({ step: n++, title: 'Finish', detail: 'Inspect all seams. Stretch stitch should {zigzag} slightly. Trim any loose threads. Rinse finished trunks in cold water before first wear.' });

    return steps;
  },
};


// ── Panel builder (shared geometry) ──────────────────────────────────────

function buildPanel({ type, name, instruction, width, height, rise, inseam, ext, cbRaise, sa, hem, isBack, opts }) {
  const ccp      = crotchCurvePoints(0, 0, rise, ext, isBack, cbRaise);
  const curvePts = sampleBezier(ccp.p0, ccp.p1, ccp.p2, ccp.p3, 96);

  const poly = [];
  poly.push({ x: 0,     y: isBack ? -cbRaise : 0 }); // waist (raised on back)
  poly.push({ x: width, y: 0 });
  poly.push({ x: width, y: height });
  poly.push({ x: -ext,  y: height });
  poly.push({ x: -ext,  y: rise   });
  for (let i = curvePts.length - 2; i >= 1; i--) poly.push({ ...curvePts[i], curve: true });
  if (isBack && cbRaise > 0) poly.push({ x: 0, y: cbRaise }); // CB seam top

  const saPoly = offsetPolygon(poly, (i, a, b) => {
    if (Math.abs(a.y - height) < 0.5 && Math.abs(b.y - height) < 0.5) return -hem;
    return -sa;
  });

  const dims = [
    { label: fmtInches(width),              x1: 0,          y1: -0.5,       x2: width,  y2: -0.5,       type: 'h' },
    { label: fmtInches(rise)   + ' rise',   x: width + 1.2, y1: 0,          y2: rise,                   type: 'v' },
    { label: fmtInches(inseam) + ' inseam', x: width + 1.2, y1: rise,       y2: height,                 type: 'v' },
    { label: fmtInches(height) + ' total',  x: width + 2.3, y1: 0,          y2: height,                 type: 'v' },
    { label: fmtInches(ext)    + ' ext',    x1: -ext,       y1: rise + 0.4, x2: 0, y2: rise + 0.4,     type: 'h', color: '#c44' },
  ];

  // Notch marks: hip level on side seam, crotch junction
  const notches = [
    { x: width, y: rise,        angle: edgeAngle({ x: width, y: 0 }, { x: width, y: height }) },  // hip on side seam
    ...(isBack ? [{ x: width, y: rise + 0.25, angle: edgeAngle({ x: width, y: 0 }, { x: width, y: height }) }] : []),
    { x: -ext,  y: rise,        angle: edgeAngle({ x: -ext, y: height }, { x: -ext, y: rise }) },  // crotch junction
    ...(isBack ? [{ x: -ext,  y: rise - 0.25, angle: edgeAngle({ x: -ext, y: height }, { x: -ext, y: rise }) }] : []),
  ];

  return {
    id: type, name, instruction,
    polygon: poly, saPolygon: saPoly,
    path: polyToPath(poly), saPath: polyToPath(saPoly),
    dimensions: dims,
    width, height, rise, inseam, ext, cbRaise, sa, hem, isBack,
    notches, crotchBezier: ccp,
    // LOCKED — crotch curve cut & stitch lines are finalized. Do not modify
    // crotchBezier, crotchBezierSA, or their rendering in pattern-view.js.
    crotchBezierSA: insetCrotchBezier(ccp, sa),
    labels: [
      { text: 'SIDE SEAM', x: width + 0.3, y: height * 0.35, rotation: 90  },
      { text: 'CENTER',    x: -0.5,         y: rise   * 0.3,  rotation: -90 },
    ],
    type: 'panel', opts,
  };
}
