// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Mini Skirt (Womenswear) — short fitted skirt with a contoured front panel,
 * raised-peak back waist darts, and a three-piece contoured waistband.
 * Invisible zipper at center back. Hem allowance is mirrored across the fold
 * line so the side edges lie flush when the hem is turned up.
 * Loosely inspired by the shaping approach in unfetteredpatterns UP1008.
 */

import { sampleBezier, fmtInches, edgeAngle, tummyAdjustment } from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

export default {
  id: 'mini-skirt-w',
  name: 'Mini Skirt (W)',
  category: 'lower',
  difficulty: 'intermediate',
  priceTier: 'simple',
  measurements: ['waist', 'hip', 'skirtLength'],
  measurementDefaults: { skirtLength: 14 },

  options: {
    sa: {
      type: 'select', label: 'Seam allowance',
      values: [
        { value: 0.5,   label: '½″' },
        { value: 0.625, label: '⅝″' },
      ],
      default: 0.625,
    },
    hem: {
      type: 'select', label: 'Hem',
      values: [
        { value: 'straight',   label: 'Turned hem (baked-in allowance)' },
        { value: 'handrolled', label: 'Hand-rolled (fine fabrics)' },
      ],
      default: 'straight',
    },
    lining: {
      type: 'select', label: 'Lining',
      values: [
        { value: 'no',  label: 'No' },
        { value: 'yes', label: 'Yes, full lining' },
      ],
      default: 'no',
    },
  },

  pieces(m, opts) {
    const sa         = parseFloat(opts.sa);
    const L          = m.skirtLength || 14;
    const ease       = 1.0;
    const halfW      = m.waist / 2;
    const halfH      = m.hip / 2 + ease / 2;
    const hipY       = 7;
    const hemIn      = 0.5;
    const hemAlw     = opts.hem === 'handrolled' ? 0.25 : 1.25;
    const waistDipCB = 0.375;
    const dartL      = 3.5;
    const dartPeak   = 0.4;
    const wbHeight   = 1.5;
    const wbRise     = 0.35;
    const zipLen     = Math.ceil(L * 0.45);

    // Mirrored hem kick: reflect the side-seam taper across y = L so the hem
    // allowance edge ends up at x_kick at y = L + hemAlw.  When folded up at
    // y = L, the kick corner lands exactly on top of the panel's side seam.
    // slope = -hemIn / (L - hipY), reflected slope = +hemIn / (L - hipY).
    // x_kick = (halfH - hemIn) + hemIn * hemAlw / (L - hipY)
    const frontKickX = (halfH - hemIn) + (hemIn * hemAlw) / (L - hipY);

    const backHipW    = halfH / 2;
    const backDartW   = Math.max(0.4, Math.min(backHipW - halfW / 2, 0.9));
    const backWaistW  = halfW / 2 + backDartW;
    const dartCx      = backWaistW * 0.42;
    const dartLip     = backDartW / 2;
    const backKickX   = (backHipW - hemIn) + (hemIn * hemAlw) / (L - hipY);
    const tummyAdj    = tummyAdjustment(m);

    function pp(poly) {
      let d = `M ${poly[0].x.toFixed(2)} ${poly[0].y.toFixed(2)}`;
      for (let i = 1; i < poly.length; i++) d += ` L ${poly[i].x.toFixed(2)} ${poly[i].y.toFixed(2)}`;
      return d + ' Z';
    }

    // ── Front panel ────────────────────────────────────────────────────────
    // Cut 1 on fold (CF at x = 0). Waist curves concave; side seam is convex
    // bulging out to the hip then tapers inward to a narrower hem. Hem allowance
    // is baked into the polygon with a mirrored kick at the side edge.
    function buildFrontPanel() {
      // Slight concave waist curve (dips ~0.15" from the linear path at midpoint).
      // Control points interpolate linearly between start y (-tummyAdj) and end y (0)
      // before adding the dip, so the curve stays monotone when tummyAdj > 0.
      const waistCurve = sampleBezier(
        { x: 0,              y: -tummyAdj                  },
        { x: halfW * 0.33,   y: -tummyAdj * 0.67 + 0.15   },
        { x: halfW * 0.67,   y: -tummyAdj * 0.33 + 0.15   },
        { x: halfW,          y: 0                          },
        10,
      ).map((p, i, arr) => (i === 0 || i === arr.length - 1 ? p : { ...p, curve: true }));

      // Convex side seam bulging outward to the hip
      const sideCurve = sampleBezier(
        { x: halfW, y: 0               },
        { x: halfW, y: hipY * 0.55     },
        { x: halfH, y: hipY * 0.6      },
        { x: halfH, y: hipY            },
        12,
      ).map((p, i, arr) => (i === 0 || i === arr.length - 1 ? p : { ...p, curve: true }));

      // Linear hip→hem taper
      const hemFoldCorner = { x: halfH - hemIn, y: L };
      // Mirrored hem-allowance kick
      const hemKickCorner = { x: frontKickX,    y: L + hemAlw };
      // Raw hem at the fold
      const rawHemFold    = { x: 0,             y: L + hemAlw };

      const poly = [
        ...waistCurve,            // concave waist
        ...sideCurve.slice(1),    // convex side to hip (skip duplicate at waist corner)
        hemFoldCorner,            // hip → hem taper endpoint
        hemKickCorner,            // hem allowance kick outward
        rawHemFold,               // raw hem across to fold
        // polygon closes back to waistCurve[0] = (0, 0)
      ];

      // Hip on side seam (approximate angle from the hip→hem taper)
      const hipNotch = {
        x: halfH,
        y: hipY,
        angle: edgeAngle({ x: halfH, y: hipY }, hemFoldCorner),
      };

      const notches = [
        hipNotch,
        { x: halfW / 2, y: 0, angle: -90 },              // CF waist mark
        { x: halfH - hemIn, y: L, angle: 0 },            // hem fold at side
        { x: 0, y: L, angle: 180 },                      // hem fold at CF
      ];

      // Edge allowances are per-polygon-edge in order. The polygon has many
      // bezier-sampled edges along the waist/side curves plus four structural
      // edges at the end. sanitizePoly preserves curve points, but edge count
      // is dynamic, so we tag by start-point y-coord ranges inside the fn.
      // Simpler: use a fixed array ordered by polygon edges with the hem
      // corners matching the hem/fold structural edges.
      //
      // Because our polygon's edges walk: waist curve(many) → side curve(many)
      // → taper → kick → raw hem → fold, we instead use an edge-match
      // function so the engine picks SA per edge based on coordinate ranges.
      const edgeAllowances = [
        { sa,      label: 'Waist' },       // curve segments near y ≈ 0 at top
        { sa,      label: 'Side seam' },   // segments from (halfW, 0) down to (halfH - hemIn, L)
        { sa: 0,   label: 'Hem kick' },    // taper corner → kick corner
        { sa: 0,   label: 'Raw hem' },     // kick corner → rawHemFold
        { sa: 0,   label: 'Fold' },        // rawHemFold → (0, 0) (CF fold)
      ];

      return {
        id: 'mini-skirt-front',
        name: 'Front Panel',
        instruction: 'Cut 1 on fold (CF) · No darts · Hem allowance included — fold up at hem notches',
        type: 'bodice',
        polygon: poly,
        path: pp(poly),
        width: Math.max(halfW, halfH),
        height: L + hemAlw,
        isBack: false,
        sa,
        hem: hemAlw,
        notches,
        edgeAllowances,
        dims: [
          { label: fmtInches(halfW) + ' waist', x1: 0, y1: -0.75, x2: halfW, y2: -0.75, type: 'h' },
          { label: fmtInches(halfH) + ' hip',   x1: 0, y1: hipY - 0.5, x2: halfH, y2: hipY - 0.5, type: 'h' },
          { label: fmtInches(L) + ' length',    x: halfH + 0.8, y1: 0, y2: L, type: 'v' },
        ],
      };
    }

    // ── Back panel ─────────────────────────────────────────────────────────
    // Cut 2, mirrored. CB edge at x = 0 is a sewn seam (invisible zip).
    // The waist has a raised bezier-peak at the single dart location, which
    // vanishes into a smooth curve when the dart is sewn closed.
    function buildBackPanel() {
      // Waist segment from CB to the dart's left base (bezier, CB dip)
      const preDartCurve = sampleBezier(
        { x: 0,                     y: waistDipCB },
        { x: (dartCx - dartLip) * 0.4, y: waistDipCB },
        { x: (dartCx - dartLip) * 0.8, y: 0          },
        { x: dartCx - dartLip,      y: 0           },
        8,
      ).map((p, i, arr) => (i === 0 || i === arr.length - 1 ? p : { ...p, curve: true }));

      // Raised dart bump: bezier arch rising to -dartPeak at dartCx, returning
      // to 0 at dartCx + dartLip. Two legs of the dart are the start/end of
      // this arch; when the dart is sewn closed the arch flattens into the
      // waistline, leaving a smooth curve.
      const dartArch = sampleBezier(
        { x: dartCx - dartLip,       y: 0          },
        { x: dartCx - dartLip * 0.35, y: -dartPeak },
        { x: dartCx + dartLip * 0.35, y: -dartPeak },
        { x: dartCx + dartLip,       y: 0          },
        10,
      ).map((p, i, arr) => (i === 0 || i === arr.length - 1 ? p : { ...p, curve: true }));

      // Remainder of the waist from dart right base to the side seam
      const postDartCurve = sampleBezier(
        { x: dartCx + dartLip,                                   y: 0 },
        { x: dartCx + dartLip + (backWaistW - dartCx - dartLip) * 0.4, y: 0 },
        { x: dartCx + dartLip + (backWaistW - dartCx - dartLip) * 0.8, y: 0 },
        { x: backWaistW,                                         y: 0 },
        6,
      ).map((p, i, arr) => (i === 0 || i === arr.length - 1 ? p : { ...p, curve: true }));

      // Convex side seam to hip
      const sideCurve = sampleBezier(
        { x: backWaistW, y: 0           },
        { x: backWaistW, y: hipY * 0.55 },
        { x: backHipW,   y: hipY * 0.6  },
        { x: backHipW,   y: hipY        },
        12,
      ).map((p, i, arr) => (i === 0 || i === arr.length - 1 ? p : { ...p, curve: true }));

      const hemFoldCorner = { x: backHipW - hemIn, y: L          };
      const hemKickCorner = { x: backKickX,        y: L + hemAlw };
      const rawHemCB      = { x: 0,                y: L + hemAlw };

      const poly = [
        ...preDartCurve,
        ...dartArch.slice(1),
        ...postDartCurve.slice(1),
        ...sideCurve.slice(1),
        hemFoldCorner,
        hemKickCorner,
        rawHemCB,
        // closes back to preDartCurve[0] = (0, waistDipCB) along the CB edge
      ];

      const hipNotch = {
        x: backHipW,
        y: hipY,
        angle: edgeAngle({ x: backHipW, y: hipY }, hemFoldCorner),
      };

      const notches = [
        hipNotch,
        { x: dartCx, y: dartL, angle: -90 },                // dart vanishing point
        { x: 0, y: zipLen + 0.5, angle: 180 },              // zipper-stop mark on CB
        { x: 0, y: waistDipCB, angle: 180 },                // CB waist
        { x: backHipW - hemIn, y: L, angle: 0 },            // hem fold at side
        { x: 0, y: L, angle: 180 },                         // hem fold at CB
      ];

      const edgeAllowances = [
        { sa,      label: 'Waist' },
        { sa,      label: 'Side seam' },
        { sa: 0,   label: 'Hem kick' },
        { sa: 0,   label: 'Raw hem' },
        { sa,      label: 'Center back (zip)' },
      ];

      return {
        id: 'mini-skirt-back',
        name: 'Back Panel',
        instruction: `Cut 2, mirror L & R · Invisible zip at CB · 1 waist dart per panel (${fmtInches(backDartW)} × ${fmtInches(dartL)}) · Match dart legs at raised peak`,
        type: 'bodice',
        polygon: poly,
        path: pp(poly),
        width: backHipW,
        height: L + hemAlw,
        isBack: true,
        sa,
        hem: hemAlw,
        notches,
        edgeAllowances,
        dims: [
          { label: fmtInches(backWaistW) + ' cut waist', x1: 0, y1: -0.9, x2: backWaistW, y2: -0.9, type: 'h' },
          { label: fmtInches(backHipW) + ' hip',         x1: 0, y1: hipY - 0.5, x2: backHipW, y2: hipY - 0.5, type: 'h' },
        ],
      };
    }

    // ── Front waistband ────────────────────────────────────────────────────
    // Cut 1 on fold. Curved lower edge matches the front waist curve; upper
    // edge is slightly shorter (contoured to sit above the natural waist).
    function buildFrontWaistband() {
      // Lower edge matches the skirt front waist curve exactly (same control-point
      // interpolation used in buildFrontPanel), so the two seam lines align.
      const lower = sampleBezier(
        { x: 0,            y: -tummyAdj                  },
        { x: halfW * 0.33, y: -tummyAdj * 0.67 + 0.15   },
        { x: halfW * 0.67, y: -tummyAdj * 0.33 + 0.15   },
        { x: halfW,        y: 0                          },
        8,
      ).map((p, i, arr) => (i === 0 || i === arr.length - 1 ? p : { ...p, curve: true }));

      // Upper edge: CF corner rises by tummyAdj to keep waistband height uniform.
      // Control points interpolate linearly from right (unchanged) to left (raised).
      const upper = sampleBezier(
        { x: halfW - wbRise,          y: -wbHeight                          },
        { x: (halfW - wbRise) * 0.67, y: -wbHeight - tummyAdj * 0.33 + 0.08 },
        { x: (halfW - wbRise) * 0.33, y: -wbHeight - tummyAdj * 0.67 + 0.08 },
        { x: 0,                       y: -wbHeight - tummyAdj               },
        8,
      ).map((p, i, arr) => (i === 0 || i === arr.length - 1 ? p : { ...p, curve: true }));

      // CW walk: lower L→R, right diagonal up, upper R→L (already reversed),
      // left fold edge implicit closing back to start.
      const poly = [
        ...lower,
        { x: halfW - wbRise, y: -wbHeight },
        ...upper.slice(1),
        // closes back to lower[0] = (0, -tummyAdj) along the left fold edge
      ];

      const edgeAllowances = [
        { sa, label: 'Lower (to skirt)' },
        { sa, label: 'Side seam' },
        { sa, label: 'Upper' },
        { sa: 0, label: 'Fold' },
      ];

      return {
        id: 'mini-skirt-waistband-front',
        name: 'Front Waistband',
        instruction: 'Cut 1 on fold (CF) · Interface fully · Slipstitch inner edge to WS — no topstitch',
        type: 'bodice',
        polygon: poly,
        path: pp(poly),
        width: halfW,
        height: wbHeight,
        sa,
        notches: [
          { x: halfW / 2, y: 0, angle: -90 },
          { x: halfW, y: 0, angle: 0 },
        ],
        edgeAllowances,
      };
    }

    // ── Back waistband ─────────────────────────────────────────────────────
    // Cut 2, mirrored. CB edge gets real SA (zipper continues through it).
    // Lower edge is effectively straight because the back dart has been
    // conceptually closed; upper edge is a shallow contour.
    function buildBackWaistband() {
      const half = halfW / 2;
      const lower = [
        { x: 0,   y: 0 },
        { x: half, y: 0 },
      ];
      const upper = sampleBezier(
        { x: half - wbRise / 2,          y: -wbHeight        },
        { x: (half - wbRise / 2) * 0.67, y: -wbHeight + 0.06 },
        { x: (half - wbRise / 2) * 0.33, y: -wbHeight + 0.06 },
        { x: 0,                           y: -wbHeight       },
        8,
      ).map((p, i, arr) => (i === 0 || i === arr.length - 1 ? p : { ...p, curve: true }));

      const poly = [
        ...lower,
        { x: half - wbRise / 2, y: -wbHeight },
        ...upper.slice(1),
      ];

      const edgeAllowances = [
        { sa, label: 'Lower (to skirt)' },
        { sa, label: 'Side seam' },
        { sa, label: 'Upper' },
        { sa, label: 'Center back' },
      ];

      return {
        id: 'mini-skirt-waistband-back',
        name: 'Back Waistband',
        instruction: 'Cut 2, mirror L & R · Interface fully · Slipstitch inner edge to WS — no topstitch · Zip passes through CB edge',
        type: 'bodice',
        polygon: poly,
        path: pp(poly),
        width: half,
        height: wbHeight,
        sa,
        notches: [
          { x: 0, y: 0, angle: 180 },
          { x: half, y: 0, angle: 0 },
        ],
        edgeAllowances,
      };
    }

    const pieces = [
      buildFrontPanel(),
      buildBackPanel(),
      buildFrontWaistband(),
      buildBackWaistband(),
    ];

    pieces.push({
      id: 'cb-zip',
      name: 'Invisible Zip',
      instruction: `${zipLen}″ invisible zip · Install at CB through back panels and back waistband before closing CB seam below zip stop`,
      dimensions: { width: 1, height: zipLen },
      type: 'pocket',
      sa,
    });

    if (opts.lining === 'yes') {
      pieces.push({
        id: 'lining-front',
        name: 'Lining Front',
        instruction: 'Cut 1 on fold · Use front panel as template · Shorten ¾″ from hem fold · No hem kick (straight hem)',
        dimensions: { width: halfH, height: L - 0.75 },
        type: 'pocket',
        sa,
      });
      pieces.push({
        id: 'lining-back',
        name: 'Lining Back',
        instruction: 'Cut 2 · Use back panel as template · Shorten ¾″ from hem fold · Leave CB open to zip',
        dimensions: { width: backHipW, height: L - 0.75 },
        type: 'pocket',
        sa,
      });
    }

    return pieces;
  },

  materials(m, opts) {
    const L = m.skirtLength || 14;
    const zipLen = Math.ceil(L * 0.45);
    const notions = [
      { ref: 'interfacing-med', quantity: '0.5 yard', notes: 'Interface all three waistband pieces fully' },
      { name: 'Invisible zipper', quantity: `${zipLen}″`, notes: 'Center back closure' },
    ];
    if (opts.lining === 'yes') {
      notions.push({ name: 'Lining fabric', quantity: '1 yard', notes: 'Habotai, China silk, or Bemberg rayon' });
    }

    return buildMaterialsSpec({
      fabrics: ['cotton-poplin', 'linen-light', 'crepe', 'wool-blend', 'denim-light', 'tencel'],
      notions,
      thread: 'poly-all',
      needle: 'universal-75',
      stitches: ['straight-2.5', 'zigzag-small'],
      notes: [
        'Stay-stitch waist edges at ½″ on all three main panels immediately after cutting to prevent bias stretch.',
        'The back dart is drafted with a raised peak at the waist — match the two dart leg points at the top of the peak when marking, then sew from that matched point down to the dart vanishing notch.',
        '{press} back darts toward CB. When sewn, the raised peak flattens and the waistline becomes smooth.',
        'The hem allowance is baked into the pattern with a mirrored kick-out at the side seams. When you fold the hem up at the notches, the side edges of the allowance line up with the panel side seams with no trimming.',
        'The waistband is three contoured pieces (front on fold + 2 backs). Attach pieces at the side seams first, then sew the curved lower edge to the skirt waist matching CF/CB/side-seam notches. Slipstitch the inner edge to the WS — this skirt has no visible topstitching on the waistband.',
        opts.hem === 'handrolled' ? 'For hand-rolled hem, ignore the baked hem allowance — trim at the fold line and roll the raw edge.' : '',
      ].filter(Boolean),
    });
  },

  instructions(m, opts) {
    const steps = [];
    let n = 1;

    steps.push({ step: n++, title: 'Stay-stitch waists', detail: 'Stitch ½″ from the waist edge on the front panel, both back panels, and all three waistband pieces immediately after cutting. This prevents the bias areas from stretching.' });
    steps.push({ step: n++, title: 'Mark and sew back darts', detail: 'Mark the raised-peak point at the top of each back dart and the vanishing point inside the panel. Fold each dart {RST} so the two dart legs meet at the peak. Stitch from the peak down to the vanishing point, tapering to nothing. Backstitch carefully at the waist. {press} toward CB. The peak flattens when sewn, leaving a smooth waistline.' });
    steps.push({ step: n++, title: 'Install invisible zipper at CB', detail: '{press} zip coils flat. Align zip RS to RS with the CB edge of the left back panel, coils facing inward, top of zip at the top of the waistband seam allowance. Sew with an invisible-zip foot. Repeat on the right back panel. Close the remaining CB seam below the zip stop with a regular foot.' });
    steps.push({ step: n++, title: 'Sew side seams', detail: 'Join the front panel to each back panel at the side seams {RST} from waist to hem fold. {press} seams open.' });
    steps.push({ step: n++, title: 'Assemble waistband', detail: 'Interface all three waistband pieces. Join the front waistband to the two back waistbands at the side seams {RST}, pressing open. This creates a curved arch that matches the contour of the skirt waist.' });
    steps.push({ step: n++, title: 'Attach waistband', detail: 'Pin the waistband lower edge to the skirt waist {RST}, matching CF/CB/side-seam notches. The zip opening in the back waistband aligns with the CB zip seam. Sew, grade the seam allowance, and {press} the waistband up. Fold the upper edge to the WS along the upper seam line, turn under the raw edge, and {slipstitch} to the WS of the waist seam. Do not topstitch.' });

    if (opts.lining === 'yes') {
      steps.push({ step: n++, title: 'Assemble lining', detail: 'Sew the lining front to lining backs at side seams. Leave the CB seam open above the zip stop. Hem the lining shorter than the shell. Attach the upper edge of the lining to the WS of the waistband seam allowance with a {slipstitch}.' });
    }

    if (opts.hem === 'handrolled') {
      steps.push({ step: n++, title: 'Hand-roll the hem', detail: 'Trim the baked-in hem allowance off at the hem fold line. Stitch 2mm from the raw edge, trim close, roll the edge between your fingers, and {slipstitch}.' });
    } else {
      steps.push({ step: n++, title: 'Hang and hem', detail: 'Hang the skirt for 24 hours so any bias stretch settles. The hem fold line is pre-drafted at the notches — fold up along those notches and the mirrored side-edge kicks will align exactly with the panel side seams above the fold. {press}, then {slipstitch} or {edgestitch} the raw edge to the WS.' });
    }
    steps.push({ step: n++, title: 'Finish', detail: '{press} the entire skirt with a cloth. Check that the waistband sits smoothly over the hip and the back darts lie flat.' });
    return steps;
  },

  variants: [
    { id: 'micro-skirt-w', name: 'Micro Skirt (W)', measurementDefaults: { skirtLength: 12 } },
  ],
};
