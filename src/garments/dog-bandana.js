// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Dog Bandana — free lead-magnet accessory.
 * Over-collar triangle fold or adjustable tie-on styles.
 * Sized to dog collar width (S/M/L/XL). No human body measurements needed.
 * All measurements in inches. Seam allowance computed by the engine.
 */

import { fmtInches, polyToPath } from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

// Collar width = the width of the finished bandana's top (neck edge)
const SIZE_PRESETS = {
  S:  { collarWidth: 12, label: 'Small (collar ~12″, toy/small breeds)' },
  M:  { collarWidth: 16, label: 'Medium (collar ~16″, medium breeds)' },
  L:  { collarWidth: 20, label: 'Large (collar ~20″, large breeds)' },
  XL: { collarWidth: 24, label: 'XL (collar ~24″, giant breeds)' },
};

export default {
  id: 'dog-bandana',
  name: 'Dog Bandana',
  category: 'accessory',
  difficulty: 'beginner',
  priceTier: 'simple',
  measurements: [], // size chosen via preset; no body measurements

  options: {
    dogSize: {
      type: 'select', label: 'Dog size',
      values: [
        { value: 'S',      label: 'Small (toy / small breeds)',  reference: 'Chihuahua, Pomeranian, Shih Tzu' },
        { value: 'M',      label: 'Medium breeds',              reference: 'Beagle, Cocker Spaniel, Corgi' },
        { value: 'L',      label: 'Large breeds',               reference: 'Labrador, Golden Retriever, Husky' },
        { value: 'XL',     label: 'XL / giant breeds',          reference: 'Great Dane, Saint Bernard, Mastiff' },
        { value: 'custom', label: 'Custom collar width',        reference: 'enter exact collar measurement' },
      ],
      default: 'M',
    },
    style: {
      type: 'select', label: 'Style',
      values: [
        { value: 'over-collar', label: 'Over-collar (slides onto collar)', reference: 'no tying needed, most popular' },
        { value: 'tie-on',      label: 'Tie-on (ties around neck)',        reference: 'adjustable, no collar needed' },
      ],
      default: 'over-collar',
    },
    lined: {
      type: 'select', label: 'Lined',
      values: [
        { value: 'yes', label: 'Yes (fully lined, clean finish)' },
        { value: 'no',  label: 'No (single layer, raw edges hemmed)' },
      ],
      default: 'yes',
    },
    sa: {
      type: 'select', label: 'Seam allowance',
      values: [
        { value: 0.25, label: '¼″' },
        { value: 0.375, label: '⅜″' },
      ],
      default: 0.25,
    },
  },

  pieces(m, opts) {
    const sa = parseFloat(opts.sa);
    const pre = SIZE_PRESETS[opts.dogSize];
    const collarW = pre ? pre.collarWidth : (m.collarWidth || 16);
    const pieces = [];

    if (opts.style === 'over-collar') {
      // Isoceles triangle: top edge = collarW, point at bottom
      // Height ≈ collarW * 0.9 for a classic bandana proportion
      const triW  = collarW;
      const triH  = Math.round(collarW * 0.9 * 4) / 4; // round to 0.25"

      const trianglePoly = [
        { x: 0,          y: 0 },
        { x: triW,       y: 0 },
        { x: triW / 2,   y: triH },
      ];
      const triPath = polyToPath(trianglePoly);

      const layerCount = opts.lined === 'yes' ? 2 : 1;
      const cutNote = opts.lined === 'yes' ? 'Cut 2 (outer + lining)' : 'Cut 1';

      pieces.push({
        id: 'bandana-triangle',
        name: 'Bandana Triangle',
        instruction: `${cutNote} · ${fmtInches(triW)} wide × ${fmtInches(triH)} tall · Top edge threads through collar`,
        type: 'bodice',
        polygon: trianglePoly,
        path: triPath,
        width: triW,
        height: triH,
        sa,
        edgeAllowances: [
          { sa, label: 'Top' },
          { sa, label: 'Right side' },
          { sa, label: 'Left side' },
        ],
        dims: [
          { label: fmtInches(triW) + ' width', x1: 0, y1: -0.5, x2: triW, y2: -0.5, type: 'h' },
          { label: fmtInches(triH) + ' height', x: triW + 0.7, y1: 0, y2: triH, type: 'v' },
        ],
      });

      // Collar tunnel strips (slide the collar through)
      const stripH = 1.5; // finished = 0.5" tunnel
      pieces.push({
        id: 'collar-tunnel',
        name: 'Collar Tunnel Strip',
        instruction: `Cut 1 · ${fmtInches(collarW)} long × ${fmtInches(stripH)} wide · Folds over top edge of bandana to create collar tunnel`,
        type: 'rectangle',
        dimensions: { length: collarW, width: stripH },
        sa,
      });

    } else {
      // Tie-on: rectangle that folds into a triangle + long ties
      // Bandana head = square folded on diagonal; total tie length 24-28"
      const sqSide = collarW * 0.8;   // the folded triangle portion
      const tieLen = 26;              // each tie length

      pieces.push({
        id: 'bandana-square',
        name: 'Bandana Square',
        instruction: `Cut ${opts.lined === 'yes' ? 2 : 1} · ${fmtInches(sqSide)} × ${fmtInches(sqSide)} · Fold on diagonal to form triangle`,
        type: 'rectangle',
        dimensions: { length: sqSide, width: sqSide },
        sa,
      });

      pieces.push({
        id: 'tie-strip',
        name: 'Tie Strip',
        instruction: `Cut 2 · ${fmtInches(tieLen)} long × 2″ wide · Fold in half lengthwise, sew, turn; attach one to each top corner of bandana`,
        type: 'rectangle',
        dimensions: { length: tieLen, width: 2 },
        sa,
      });
    }

    return pieces;
  },

  materials(m, opts) {
    const notes = [
      'Pre-wash fabric to prevent shrinkage.',
      'Cotton quilting fabric is ideal for durability and easy care.',
      'Use a short stitch length (2.0mm) on the curved or diagonal seams for strength.',
      'If lining, clip the seam allowance at the point before turning to reduce bulk.',
    ];

    return buildMaterialsSpec({
      fabrics: ['cotton-quilting', 'cotton-canvas', 'cotton-lawn', 'linen'],
      notions: [],
      thread: 'poly-all',
      needle: 'universal-75',
      stitches: ['straight-2'],
      notes,
    });
  },

  instructions(m, opts) {
    const steps = [];
    let n = 1;
    const pre = SIZE_PRESETS[opts.dogSize];
    const collarW = pre ? pre.collarWidth : 16;
    const isLinked = opts.lined === 'yes';

    if (opts.style === 'over-collar') {
      if (isLinked) {
        steps.push({
          step: n++, title: 'Sew the triangle',
          detail: 'Place the two triangles right sides together. Pin along the two diagonal sides. Sew the two side seams, leaving the top (straight) edge open. Clip the seam allowance at the bottom point to reduce bulk. Turn right side out. {press} flat.',
        });
      } else {
        steps.push({
          step: n++, title: 'Hem the edges',
          detail: 'Press under ¼″ on each edge of the triangle. Press under another ¼″ and {topstitch} close to the edge. Leave the top edge un-hemmed for now.',
        });
      }

      steps.push({
        step: n++, title: 'Make the collar tunnel',
        detail: `Fold the collar tunnel strip in half lengthwise, wrong sides together, and {press}. Fold the raw edges in to meet the center crease and {press} again (like making quilt binding). Slip this strip over the top raw edge of the bandana, centering it. {topstitch} close to both long edges of the strip, catching the bandana inside. This creates a tunnel the collar slides through.`,
      });

      steps.push({
        step: n++, title: 'Thread onto collar',
        detail: 'Unclip your dog\'s collar, slide both collar ends through the tunnel, and re-clip. The bandana point should hang at the front of the neck.',
      });

    } else {
      if (isLinked) {
        steps.push({
          step: n++, title: 'Sew the bandana square',
          detail: 'Place the two squares right sides together. Sew around three sides, leaving one side open. Trim corners. Turn right side out and {press}. Fold and {press} the open edge under ¼″.',
        });
        steps.push({
          step: n++, title: 'Fold into triangle',
          detail: 'Fold the finished square diagonally so it forms a triangle, with the closed edges forming the two diagonal sides. {press}.',
        });
      } else {
        steps.push({
          step: n++, title: 'Hem and fold',
          detail: 'Press and hem all edges of the square with a narrow ¼″ double-turn hem. Fold on the diagonal to form a triangle.',
        });
      }

      steps.push({
        step: n++, title: 'Make the ties',
        detail: 'Fold each tie strip in half lengthwise, right sides together. Sew the long edge and one short end. Turn right side out. {press}. Repeat for the second tie.',
      });

      steps.push({
        step: n++, title: 'Attach ties',
        detail: 'Tuck the raw end of each tie into one of the top corners of the bandana triangle. Hand-stitch or machine-stitch securely through multiple layers.',
      });

      steps.push({
        step: n++, title: 'Tie on dog',
        detail: 'Tie the bandana around your dog\'s neck with the point facing forward. Tie a bow or square knot at the back of the neck. The fit should be comfortable with two fingers of room.',
      });
    }

    return steps;
  },
};
