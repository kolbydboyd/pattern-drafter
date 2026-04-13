// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Scholar Sweatpants — oversized straight-leg knit trousers with welt-zip
 * side pockets. Inspired by the Alo Yoga Scholar Straight Leg Sweatpant.
 *
 * Key differences vs. base sweatpants:
 *   - Defaults to "wide" ease + "straight" leg + mid rise for the Scholar
 *     relaxed straight-leg silhouette.
 *   - Deeper back crotch extension (3.25″) for the generous seat Alo is known for.
 *   - Side-seam welt-zip pockets (not in-seam, not kangaroo) — this is the
 *     signature Scholar construction detail. Adds welt strips + pocket bags.
 *
 * Everything else (panel drafting, waistband, rise options, SA) is delegated
 * to `sweatpants.js` so the crotch curve math, seam allowance offsets, and
 * engine validations stay in one place.
 */

import sweatpants from './sweatpants.js';
import { fmtInches } from '../engine/geometry.js';

// Welt-zip pocket dimensions (inches)
const WELT_OPENING_LEN = 6;    // length of zip opening
const WELT_STRIP_WIDTH = 1.25; // welt strip cut width (finished = 0.5″ each side of zip)
const WELT_POCKET_BAG_W = 7;   // pocket bag width
const WELT_POCKET_BAG_H = 10;  // pocket bag height

export default {
  id: 'scholar-sweatpants',
  name: 'Scholar Sweatpants',
  category: 'lower',
  difficulty: 'intermediate',
  priceTier: 'tailored',
  measurements: sweatpants.measurements,
  measurementDefaults: sweatpants.measurementDefaults,

  options: {
    // Subset of sweatpants options, with Scholar defaults.
    ease:         { ...sweatpants.options.ease,         default: 'wide'     },
    legStyle:     { ...sweatpants.options.legStyle,     default: 'straight' },
    riseStyle:    { ...sweatpants.options.riseStyle,    default: 'mid'      },
    elasticWidth: { ...sweatpants.options.elasticWidth, default: 1          },
    backExt:      { ...sweatpants.options.backExt,      default: 3.25       },
    frontExt:     sweatpants.options.frontExt,
    cbRaise:      sweatpants.options.cbRaise,
    riseOverride: sweatpants.options.riseOverride,
    sa:           sweatpants.options.sa,
    hem:          sweatpants.options.hem,
  },

  pieces(m, opts) {
    // Force Scholar-specific pocket config: we draw our own welt-zip, so
    // suppress the base slash/slant/side pockets regardless of what ships in opts.
    const baseOpts = { ...opts, pocket: 'none', frontPocket: 'none' };
    const basePieces = sweatpants.pieces(m, baseOpts);

    // Drop any pocket pieces emitted by the base (defensive — should be empty).
    const pieces = basePieces.filter(p => p.id !== 'pocket-bag' && p.id !== 'side-bag');

    const sa = parseFloat(opts.sa) || 0.5;

    // ── WELT-ZIP SIDE POCKET PIECES ────────────────────────────────────────
    // Two pockets total (one per side). Each pocket needs:
    //   - 1 welt strip (folded lengthwise → double welt around the zipper)
    //   - 1 pocket bag (folded or cut in 2 halves) matching the opening length
    // The opening lives in the side seam ~2¼″ below the finished waistband.
    pieces.push({
      id: 'welt-strip',
      name: 'Welt Strip',
      instruction: `Cut 2 (1 per side) · ${fmtInches(WELT_OPENING_LEN + 1.5)} × ${fmtInches(WELT_STRIP_WIDTH * 2 + 0.5)} · Interface lightly · Folds around ${fmtInches(WELT_OPENING_LEN)} zipper opening`,
      dimensions: { width: WELT_OPENING_LEN + 1.5, height: WELT_STRIP_WIDTH * 2 + 0.5 },
      type: 'pocket',
      sa,
    });

    pieces.push({
      id: 'welt-pocket-bag',
      name: 'Welt Pocket Bag',
      instruction: `Cut 4 (2 per side) · Lining or self-fabric · ${fmtInches(WELT_POCKET_BAG_W)} × ${fmtInches(WELT_POCKET_BAG_H)} · {serge} all edges after sewing`,
      dimensions: { width: WELT_POCKET_BAG_W, height: WELT_POCKET_BAG_H },
      type: 'pocket',
      sa,
    });

    return pieces;
  },

  materials(m, opts) {
    const baseOpts = { ...opts, pocket: 'none', frontPocket: 'none' };
    const base = sweatpants.materials(m, baseOpts);

    // Return a new object rather than mutating `base` in place.
    return {
      ...base,
      notions: [
        ...base.notions,
        {
          name: 'Pocket zipper',
          quantity: `2 × ${fmtInches(WELT_OPENING_LEN)}`,
          notes: 'Coil or molded plastic, closed-end. Trim to length after install.',
        },
        {
          name: 'Light fusible interfacing',
          quantity: '0.25 yard',
          notes: 'For welt strip stabilization only',
        },
      ],
      notes: [
        ...(base.notes || []),
        'Welt-zip side pockets: interface the welt strips before sewing to prevent the knit from stretching around the zipper teeth.',
        'Fabric note: Alo Scholar is a heavyweight sweater-knit cotton. Any heavyweight french terry, heavy jersey, or interlock of similar weight will read correctly.',
      ],
    };
  },

  instructions(m, opts) {
    const baseOpts = { ...opts, pocket: 'none', frontPocket: 'none' };
    const baseSteps = sweatpants.instructions(m, baseOpts);

    // Insert welt-zip pocket steps immediately before side seams.
    const sideSeamIdx = baseSteps.findIndex(s => /side seam/i.test(s.title));
    const insertAt = sideSeamIdx === -1 ? 0 : sideSeamIdx;

    const weltSteps = [
      {
        title: 'Mark welt-zip pocket opening',
        detail: `On each front panel, mark a ${fmtInches(WELT_OPENING_LEN)} horizontal pocket opening starting ${fmtInches(0.75)} in from the side seam and ${fmtInches(2.25)} below the finished waistband edge. Fuse a ${fmtInches(WELT_OPENING_LEN + 1)} × ${fmtInches(2)} rectangle of light interfacing behind the mark on the WS to stabilize the knit.`,
      },
      {
        title: 'Attach welt strip and cut opening',
        detail: `Fold each welt strip in half lengthwise {WST}, {press}. Pin to the marked opening on the RS of the front panel, raw edges along the opening mark. Sew a ${fmtInches(0.25)} box around the folded welt (top, bottom, and short ends). {clip} through only the panel (NOT the welt) along the center of the box, tapering into Y-cuts at each short end. Push the welt through to the WS and {press} flat so a ${fmtInches(0.25)} double welt shows around the opening.`,
      },
      {
        title: 'Install pocket zipper',
        detail: `Center a ${fmtInches(WELT_OPENING_LEN)} zipper behind the welt opening on the WS. {baste} through all layers, then {topstitch} around the welt from the RS to secure the zipper tape. Trim zipper tails if needed.`,
      },
      {
        title: 'Attach welt pocket bags',
        detail: `Place one pocket bag on each zipper tape on the WS of the panel. Sew the bag to the tape only, then fold the second bag up over the first and sew around three sides to enclose. {serge} the bag edges. This creates a clean bag that hangs between the front and back of the pant without affecting the side seam.`,
      },
    ];

    // Renumber everything after the insert.
    const before = baseSteps.slice(0, insertAt).map((s, i) => ({ ...s, step: i + 1 }));
    const welt = weltSteps.map((s, i) => ({ ...s, step: before.length + i + 1 }));
    const after = baseSteps.slice(insertAt).map((s, i) => ({ ...s, step: before.length + welt.length + i + 1 }));

    return [...before, ...welt, ...after];
  },
};
