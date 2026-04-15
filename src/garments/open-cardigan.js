// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Open Cardigan / Shacket — oversized open-front unstructured layer.
 * Drop shoulder (no armhole curve). No closure — drapes open at CF.
 * Hip-to-midthigh length. Back on fold, two separate front panels.
 * Fabric: linen, cotton canvas, brushed cotton, lightweight wool.
 */

import {
  shoulderSlope, necklineCurve, sleeveCapCurve, shoulderDropFromWidth,
  armholeDepthFromChest, chestEaseDistribution, neckWidthFromCircumference,
  validateSleeveSeams,
} from '../engine/upper-body.js';
import { sampleBezier, fmtInches, edgeAngle, arcLength } from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

const DROP_EXT = 2.5; // inches of drop shoulder extension past natural shoulder point

export default {
  id: 'open-cardigan',
  name: 'Open Cardigan / Shacket',
  category: 'upper',
  difficulty: 'intermediate',
  priceTier: 'core',
  measurements: ['chest', 'shoulder', 'neck', 'sleeveLength', 'bicep', 'torsoLength'],
  measurementDefaults: { sleeveLength: 28 },

  options: {
    fit: {
      type: 'select', label: 'Fit',
      values: [
        { value: 'relaxed',   label: 'Relaxed (+7″)',   reference: 'roomy, easy-fitting layer' },
        { value: 'oversized', label: 'Oversized (+10″)', reference: 'blanket-coat drape' },
      ],
      default: 'oversized',
    },
    length: {
      type: 'select', label: 'Length',
      values: [
        { value: 'hip',      label: 'Hip (+4″ below torso)' },
        { value: 'midthigh', label: 'Mid-thigh (+8″)' },
      ],
      default: 'hip',
    },
    collar: {
      type: 'select', label: 'Collar',
      values: [
        { value: 'none',  label: 'None (open neckline)' },
        { value: 'shawl', label: 'Shawl collar band' },
      ],
      default: 'none',
    },
    pockets: {
      type: 'select', label: 'Pockets',
      values: [
        { value: 'patch', label: 'Patch pockets ×2' },
        { value: 'none',  label: 'None' },
      ],
      default: 'patch',
    },
    sleeve: {
      type: 'select', label: 'Sleeve length',
      values: [
        { value: 'long',          label: 'Long' },
        { value: 'three_quarter', label: '¾ length (18″)' },
      ],
      default: 'long',
    },
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
        { value: 0.75, label: '¾″' },
        { value: 1,    label: '1″' },
        { value: 1.5,  label: '1½″ folded' },
      ],
      default: 1,
    },
  },

  pieces(m, opts) {
    const sa  = parseFloat(opts.sa);
    const hem = parseFloat(opts.hem);

    const totalEase = opts.fit === 'oversized' ? 10 : 7;
    const panelW    = (m.chest + totalEase) / 4;

    const halfShoulder = m.shoulder / 2;
    const neckW        = neckWidthFromCircumference(m.neck);
    const shoulderW    = halfShoulder - neckW;
    const slopeDrop    = shoulderDropFromWidth(shoulderW);
    const shoulderPtX  = halfShoulder;

    // Drop shoulder: extend past natural shoulder point
    const dropShoulderX = shoulderPtX + DROP_EXT;

    // Armhole level: deeper for drop shoulder/oversized
    const armholeY = armholeDepthFromChest(m.chest, 'oversized');

    const lengthAdd = opts.length === 'midthigh' ? 8 : 4;
    const hemY      = m.torsoLength + lengthAdd;

    const slvLength    = opts.sleeve === 'three_quarter' ? 18 : (m.sleeveLength ?? 28);
    const sleeveEase   = totalEase * 0.3;
    const slvFullWidth = m.bicep + sleeveEase;
    const capHeight    = 1.5; // shallow drop-shoulder cap

    // ── CURVE TAGGING — VERIFIED WORKING, DO NOT CHANGE UNLESS NECESSARY ──
    function sampleCurve(cp, steps = 12) {
      return sampleBezier(cp.p0, cp.p1, cp.p2, cp.p3, steps).map(p => ({ ...p, curve: true }));
    }
    function polyToPathStr(poly) {
      let d = `M ${poly[0].x.toFixed(2)} ${poly[0].y.toFixed(2)}`;
      for (let i = 1; i < poly.length; i++) d += ` L ${poly[i].x.toFixed(2)} ${poly[i].y.toFixed(2)}`;
      return d + ' Z';
    }
    function bbox(poly) {
      const xs = poly.map(p => p.x), ys = poly.map(p => p.y);
      return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) };
    }

    const frontNeckDepth = neckW + 0.5;
    const backNeckDepth  = neckW / 3;

    const frontNeckPts  = sampleCurve(necklineCurve(neckW, frontNeckDepth, 'crew'));
    const backNeckPts   = sampleCurve(necklineCurve(neckW, backNeckDepth,  'crew'));
    const shoulderPts   = sampleCurve(shoulderSlope(shoulderW, slopeDrop));

    // ── BACK PANEL (on fold, CB) ─────────────────────────────────────────────
    const backPoly = [];

    for (const p of [...backNeckPts].reverse()) backPoly.push({ ...p, x: neckW - p.x });
    // ── JUNCTION UNTAGGING — VERIFIED WORKING, DO NOT CHANGE UNLESS NECESSARY ──
    delete backPoly[0].curve;
    delete backPoly[backNeckPts.length - 1].curve;

    for (let i = 1; i < shoulderPts.length; i++) {
      backPoly.push({ ...shoulderPts[i], x: neckW + shoulderPts[i].x });
    }

    // Drop shoulder extension: shoulder seam extends past natural shoulder point
    backPoly.push({ x: dropShoulderX, y: slopeDrop });   // extended shoulder tip
    backPoly.push({ x: dropShoulderX, y: armholeY });     // straight drop to underarm
    backPoly.push({ x: panelW,        y: armholeY });     // underarm seam
    backPoly.push({ x: panelW,        y: hemY });         // side seam
    backPoly.push({ x: 0,             y: hemY });         // hem (closes to CB fold)

    // ── FRONT PANEL (Cut 2 mirror, open at CF) ───────────────────────────────
    const frontPoly = [];

    for (const p of [...frontNeckPts].reverse()) frontPoly.push({ ...p, x: neckW - p.x });
    // ── JUNCTION UNTAGGING — VERIFIED WORKING, DO NOT CHANGE UNLESS NECESSARY ──
    delete frontPoly[0].curve;
    delete frontPoly[frontNeckPts.length - 1].curve;

    for (let i = 1; i < shoulderPts.length; i++) {
      frontPoly.push({ ...shoulderPts[i], x: neckW + shoulderPts[i].x });
    }

    // Drop shoulder — same geometry as back
    frontPoly.push({ x: dropShoulderX, y: slopeDrop });  // extended shoulder tip
    frontPoly.push({ x: dropShoulderX, y: armholeY });   // straight drop
    frontPoly.push({ x: panelW,        y: armholeY });   // underarm seam
    frontPoly.push({ x: panelW,        y: hemY });       // side seam
    frontPoly.push({ x: 0,             y: hemY });       // hem
    frontPoly.push({ x: 0,             y: frontNeckDepth }); // CF open edge

    // ── SLEEVE (shallow cap — drop shoulder) ────────────────────────────────
    const capCp  = sleeveCapCurve(m.bicep, capHeight, slvFullWidth);
    const capPts = sampleCurve(capCp, 24);

    const sleevePoly = [];
    for (const p of capPts) sleevePoly.push({ ...p, y: p.y + capHeight });
    // ── SLEEVE JUNCTION UNTAGGING — VERIFIED WORKING, DO NOT CHANGE UNLESS NECESSARY ──
    delete sleevePoly[0].curve;
    delete sleevePoly[capPts.length - 1].curve;
    sleevePoly.push({ x: slvFullWidth, y: capHeight + slvLength });
    sleevePoly.push({ x: 0,           y: capHeight + slvLength });

    // ── NOTCHES ───────────────────────────────────────────────────────────────
    const shoulderMidX = (neckW + shoulderPtX) / 2;
    const shoulderMidY = slopeDrop / 2;

    const frontNotches = [
      { x: shoulderMidX,   y: shoulderMidY, angle: edgeAngle({ x: neckW, y: 0 }, { x: shoulderPtX, y: slopeDrop }) },
      { x: dropShoulderX,  y: armholeY,     angle: 0 },
      { x: panelW,         y: armholeY,     angle: 0 },
    ];
    const backNotches = [
      { x: shoulderMidX,  y: shoulderMidY, angle: edgeAngle({ x: neckW, y: 0 }, { x: shoulderPtX, y: slopeDrop }) },
      { x: dropShoulderX, y: armholeY,     angle: 0 },
      { x: panelW,        y: armholeY,     angle: 0 },
    ];
    const sleeveNotches = [
      { x: slvFullWidth / 2, y: 0,         angle: -90 },
      { x: 0,                y: capHeight, angle: 0 },
      { x: slvFullWidth,     y: capHeight, angle: 0 },
    ];

    const frontBB  = bbox(frontPoly);
    const backBB   = bbox(backPoly);
    const sleeveBB = bbox(sleevePoly);

    const pieces = [
      {
        id: 'bodice-back',
        name: 'Back Panel',
        instruction: 'Cut 1 on fold (CB)',
        type: 'bodice',
        polygon: backPoly,
        path: polyToPathStr(backPoly),
        width:  backBB.maxX - backBB.minX,
        height: backBB.maxY - backBB.minY,
        isBack: true,
        sa, hem,
        notches: backNotches,
        dims: [
          { label: fmtInches(panelW) + ' half width', x1: 0, y1: -0.5, x2: panelW, y2: -0.5, type: 'h' },
          { label: fmtInches(hemY) + ' length', x: panelW + 1, y1: 0, y2: hemY, type: 'v' },
          { label: fmtInches(DROP_EXT) + ' drop', x1: shoulderPtX, y1: slopeDrop - 0.4, x2: dropShoulderX, y2: slopeDrop - 0.4, type: 'h', color: '#b8963e' },
        ],
      },
      {
        id: 'bodice-front',
        name: 'Front Panel',
        instruction: 'Cut 2 (mirror L & R) · CF edge is open — finish with facing or clean hem',
        type: 'bodice',
        polygon: frontPoly,
        path: polyToPathStr(frontPoly),
        width:  frontBB.maxX - frontBB.minX,
        height: frontBB.maxY - frontBB.minY,
        isBack: false,
        sa, hem,
        notches: frontNotches,
        dims: [
          { label: fmtInches(panelW) + ' half width', x1: 0, y1: -0.5, x2: panelW, y2: -0.5, type: 'h' },
          { label: fmtInches(hemY) + ' length', x: panelW + 1, y1: 0, y2: hemY, type: 'v' },
        ],
      },
      {
        id: 'sleeve',
        name: 'Sleeve',
        instruction: `Cut 2 (mirror L & R) · Shallow cap — drop shoulder attachment · ${opts.sleeve === 'three_quarter' ? '¾ length (18″)' : 'Full length'}`,
        type: 'sleeve',
        polygon: sleevePoly,
        path: polyToPathStr(sleevePoly),
        width:  sleeveBB.maxX - sleeveBB.minX,
        height: sleeveBB.maxY - sleeveBB.minY,
        capHeight,
        sleeveLength: slvLength,
        sleeveWidth: slvFullWidth,
        sa, hem,
        notches: sleeveNotches,
        dims: [
          { label: fmtInches(slvFullWidth) + ' underarm', x1: 0, y1: capHeight + 0.4, x2: slvFullWidth, y2: capHeight + 0.4, type: 'h' },
          { label: fmtInches(slvLength) + ' length', x: slvFullWidth + 1, y1: capHeight, y2: capHeight + slvLength, type: 'v' },
          { label: fmtInches(capHeight) + ' cap', x: -1.2, y1: 0, y2: capHeight, type: 'v', color: '#b8963e' },
        ],
      },
    ];

    // ── SHAWL COLLAR ──────────────────────────────────────────────────────────
    if (opts.collar === 'shawl') {
      const frontNeckArc = arcLength(frontNeckPts);
      const backNeckArc  = arcLength(backNeckPts);
      // Half-arc: CB to CF on one side. +1 = ease/overlap at each front edge.
      const halfArc     = frontNeckArc + backNeckArc + 1;
      const collarWidth = 4.5;             // cut width; folds to ~2.25″ finished
      const waveDepth   = collarWidth * 0.09; // ≈ 0.4″ outward bow at back neck

      // Outer (fall) edge: slight convex bow so the outer edge is longer than the
      // inner — this is what makes a shawl collar roll and lie flat without puckering.
      // x: 0 (CB fold) → halfArc (CF). Negative y = bows outward above piece.
      const outerPts = [];
      const OSTEPS   = 5;
      for (let i = 0; i <= OSTEPS; i++) {
        const frac = i / OSTEPS;
        const x    = halfArc * frac;
        // Sine envelope: peaks in back-neck region, fades to 0 at CF
        const wave = waveDepth * Math.sin(Math.PI * (1 - frac) * 0.85);
        outerPts.push({ x, y: -wave, curve: i > 0 && i < OSTEPS });
      }

      const collarPoly = [
        { x: 0,       y: 0            },        // CB fold, outer edge
        ...outerPts.slice(1, -1),               // intermediate outer bow points
        { x: halfArc, y: outerPts[OSTEPS].y },  // CF outer corner
        { x: halfArc, y: collarWidth   },        // CF neckline corner
        { x: 0,       y: collarWidth   },        // CB fold, neckline edge
      ];

      const collarBB = bbox(collarPoly);

      pieces.push({
        id: 'shawl-collar',
        name: 'Shawl Collar',
        instruction: 'Cut 2 on fold at CB (outer + facing) · Interface outer · Sew outer to facing {RST} along outer curved edge, leaving neckline open · {clip} curves, turn RS out, {press} · Pin to combined neckline and CF opening {RST} · Sew, {clip} curves · {understitch} facing to SA · Fold facing to inside, {slipstitch} or {topstitch}',
        type: 'bodice',
        polygon: collarPoly,
        path: polyToPathStr(collarPoly),
        width:  collarBB.maxX - collarBB.minX,
        height: collarBB.maxY - collarBB.minY,
        sa,
        dims: [
          { label: fmtInches(halfArc) + ' half length (CB to CF)', x1: 0, y1: -(waveDepth + 0.5), x2: halfArc, y2: -(waveDepth + 0.5), type: 'h' },
          { label: fmtInches(collarWidth) + ' cut width',          x: halfArc + 1, y1: 0, y2: collarWidth, type: 'v' },
        ],
      });
    }

    // ── PATCH POCKETS ─────────────────────────────────────────────────────────
    if (opts.pockets === 'patch') {
      const pktW = Math.max(5.5, m.chest * 0.14);  // pocket scales with chest
      pieces.push({
        id: 'patch-pocket',
        name: 'Side Patch Pocket',
        instruction: `Cut 2 · Position on each front panel at hip level · Top edge: 1″ hem (fold under ½″ twice, {topstitch}) · {topstitch} sides and bottom · Round bottom corners (1″ radius)`,
        type: 'pocket',
        dimensions: { width: pktW, height: 7 },
        sa, hem: 1.0, hemEdge: 'top',
      });
    }

    return pieces;
  },

  materials(m, opts) {
    const notions = [
      { ref: 'interfacing-light', quantity: '0.25 yard (pocket tops, CF facing)' },
    ];

    if (opts.collar === 'shawl') {
      notions.push({ ref: 'interfacing-light', quantity: '0.5 yard (shawl collar)' });
    }

    return buildMaterialsSpec({
      fabrics: ['linen', 'cotton-canvas', 'cotton-twill', 'fleece'],
      notions,
      thread: 'poly-all',
      needle: 'universal-90',
      stitches: ['straight-2.5', 'straight-3', 'zigzag-small', 'topstitch'],
      notes: [
        'Drop shoulder: sleeve seam runs along the top of the arm, not the shoulder point. Mark the shoulder seam line on the sleeve for accurate placement.',
        'CF edges are open — finish with a 1″ fold-and-topstitch hem, a facing strip, or a serged turn-and-stitch.',
        'Pre-wash linen and canvas before cutting — both can shrink 3–5%. Press flat while damp.',
        'For a clean hem on wovens: {press} the hem allowance up twice, stitch from the RS close to the fold.',
        'Topstitch all seams flat (1/4″ from seam) for workwear character — it also controls thick fabrics.',
        'Drop shoulder seams: sew with sleeve on TOP (facing you) to control ease distribution by eye.',
      ],
    });
  },

  instructions(m, opts) {
    const steps = [];
    let n = 1;

    if (opts.pockets === 'patch') {
      steps.push({
        step: n++, title: 'Prepare patch pockets',
        detail: 'Interface the top 1″ of each pocket piece. Fold the top edge under ½″, then 1″. {topstitch} across the top. Fold remaining edges under ½″ and {press}. Round the bottom two corners (1″ radius) — notch seam allowance at curves. Pockets are ready to apply after front seams.',
      });
    }

    steps.push({
      step: n++, title: 'Sew shoulder seams',
      detail: 'Join each front panel to the back at the shoulder {RST}. The shoulder seam runs from the neck-shoulder junction across to the extended drop shoulder point. Stitch, {press} toward back. {topstitch} ¼″ from seam if desired.',
    });

    steps.push({
      step: n++, title: 'Set sleeves',
      detail: 'Match the center notch at the top of the sleeve cap to the shoulder seam. Align the underarm notches on the sleeve to the underarm notches on the body. The shallow cap distributes evenly with minimal easing. Sew {RST}, {press} seam toward sleeve. {topstitch} if desired.',
    });

    steps.push({
      step: n++, title: 'Sew side and underarm seams',
      detail: 'Sew from the hem up continuously through the underarm and down to the sleeve hem in one pass {RST}. {clip} at the underarm junction. {press} seam open or toward back. {serge} or {zigzag} if raw.',
    });

    if (opts.pockets === 'patch') {
      steps.push({
        step: n++, title: 'Attach pockets',
        detail: 'Position each pocket on the front panel at hip level (approx 5–7″ from the hem, centered between CF and side seam). Pin, then {topstitch} sides and bottom ⅛–¼″ from edge. Bar tack the top two corners.',
      });
    }

    if (opts.collar === 'shawl') {
      steps.push({
        step: n++, title: 'Attach shawl collar',
        detail: 'Interface the outer collar piece. Sew outer and facing collar {RST} along the outer curved edge, leaving the inner neckline edge open. {clip} curves, turn RS out, {press}. Pin to the combined neckline + CF edge {RST}, matching neckline seam. Sew. {understitch} facing to SA so collar rolls cleanly. Fold facing over to inside, {slipstitch} or {topstitch}.',
      });
    } else {
      steps.push({
        step: n++, title: 'Finish neckline and CF edges',
        detail: 'Finish the neckline and both CF edges together as a continuous strip. Options: (a) fold-and-topstitch 1″ twice; (b) apply a self-fabric facing strip; (c) bind with a bias strip ½″ wide. {press} well.',
      });
    }

    steps.push({
      step: n++, title: 'Hem sleeves and body',
      detail: `Fold up hem allowance (${fmtInches(parseFloat(opts.hem))}) once, {press}, then fold again and {topstitch} or hand-stitch. Press entire garment.`,
    });

    return steps;
  },

  variants: [
    {
      id: 'duster-cardigan',
      name: 'Duster Cardigan',
      defaults: { length: 'midthigh', collar: 'none', fit: 'oversized', pockets: 'patch' },
    },
    {
      id: 'shacket',
      name: 'Shacket',
      defaults: { length: 'hip', collar: 'none', fit: 'relaxed', pockets: 'patch' },
    },
  ],
};
