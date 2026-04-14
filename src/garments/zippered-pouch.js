// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Zippered Pouch — beginner accessory project.
 * Custom-dimension zipper pouch with optional lining, boxed corners, and pockets.
 * All measurements in inches. Seam allowance computed by the engine.
 */

import { fmtInches } from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

const PRESETS = {
  small:  { pouchWidth: 5,  pouchHeight: 4  },
  medium: { pouchWidth: 8,  pouchHeight: 6  },
  large:  { pouchWidth: 10, pouchHeight: 7  },
};

export default {
  id: 'zippered-pouch',
  name: 'Zippered Pouch',
  category: 'accessory',
  difficulty: 'beginner',
  priceTier: 'simple',
  measurements: ['pouchWidth', 'pouchHeight'],
  measurementDefaults: { pouchWidth: 8, pouchHeight: 6 },

  options: {
    preset: {
      type: 'select', label: 'Size preset',
      values: [
        { value: 'custom', label: 'Custom' },
        { value: 'small',  label: 'Small (5 × 4″)', reference: 'coins, lip balm, earpods' },
        { value: 'medium', label: 'Medium (8 × 6″)', reference: 'most popular, pencil case' },
        { value: 'large',  label: 'Large (10 × 7″)', reference: 'travel, toiletries, cables' },
      ],
      default: 'medium',
    },
    boxedCorners: {
      type: 'select', label: 'Boxed bottom corners',
      values: [
        { value: 'none', label: 'None (flat)', reference: 'simplest construction' },
        { value: '1',    label: '1″ box corners', reference: 'small gusset, more room' },
        { value: '2',    label: '2″ box corners', reference: 'larger gusset, stands up' },
      ],
      default: 'none',
    },
    lined: {
      type: 'select', label: 'Lining',
      values: [
        { value: 'yes', label: 'Yes (clean finish inside)' },
        { value: 'no',  label: 'No (serge or bind raw edges)' },
      ],
      default: 'yes',
    },
    interiorPocket: {
      type: 'select', label: 'Interior slip pocket',
      values: [
        { value: 'none', label: 'None' },
        { value: 'yes',  label: 'Yes', reference: 'sewn to lining panel' },
      ],
      default: 'none',
    },
    wristLoop: {
      type: 'select', label: 'Wrist loop / pull tab',
      values: [
        { value: 'none', label: 'None' },
        { value: 'yes',  label: 'Yes', reference: '½″ ribbon or fabric tab at zipper end' },
      ],
      default: 'none',
    },
    zipperTab: {
      type: 'select', label: 'Zipper end tabs',
      values: [
        { value: 'yes', label: 'Yes (fabric tabs at each end)', reference: 'cleaner zipper installation' },
        { value: 'no',  label: 'No' },
      ],
      default: 'yes',
    },
    interfacing: {
      type: 'select', label: 'Interfacing',
      values: [
        { value: 'none',   label: 'None' },
        { value: 'light',  label: 'Light fusible', reference: 'quilting cotton' },
        { value: 'medium', label: 'Medium fusible', reference: 'canvas, stiffer pouch' },
      ],
      default: 'light',
    },
    sa: {
      type: 'select', label: 'Seam allowance',
      values: [
        { value: 0.25, label: '¼″' },
        { value: 0.375, label: '⅜″' },
        { value: 0.5,  label: '½″' },
      ],
      default: 0.25,
    },
  },

  pieces(m, opts) {
    const sa = parseFloat(opts.sa);
    const pre = PRESETS[opts.preset];
    const W = pre ? pre.pouchWidth  : m.pouchWidth;
    const H = pre ? pre.pouchHeight : m.pouchHeight;
    const boxCorner = opts.boxedCorners === 'none' ? 0 : parseFloat(opts.boxedCorners);
    const panelH = boxCorner > 0 ? H + boxCorner : H;
    const pieces = [];

    // ── Outer Panels ──────────────────────────────────────────────────────────
    pieces.push({
      id: 'outer-panel',
      name: 'Outer Panel',
      instruction: `Cut 2 · ${fmtInches(W)} wide × ${fmtInches(panelH)} tall`,
      type: 'rectangle',
      dimensions: { length: panelH, width: W },
      sa,
      dims: [
        { label: fmtInches(W) + ' width',  x1: 0, y1: -0.5, x2: W,    y2: -0.5, type: 'h' },
        { label: fmtInches(panelH) + ' height', x: W + 0.6, y1: 0, y2: panelH, type: 'v' },
      ],
    });

    // ── Lining Panels ─────────────────────────────────────────────────────────
    if (opts.lined === 'yes') {
      pieces.push({
        id: 'lining-panel',
        name: 'Lining Panel',
        instruction: `Cut 2 · ${fmtInches(W)} wide × ${fmtInches(panelH)} tall · Same shape as outer`,
        type: 'rectangle',
        dimensions: { length: panelH, width: W },
        sa,
      });
    }

    // ── Zipper End Tabs ───────────────────────────────────────────────────────
    if (opts.zipperTab === 'yes') {
      pieces.push({
        id: 'zipper-tab',
        name: 'Zipper End Tab',
        instruction: `Cut 2 · 1½″ long × ${fmtInches(W > 6 ? 1.5 : 1.25)} wide · Fold in half, enclose each end of zipper tape`,
        type: 'rectangle',
        dimensions: { length: 1.5, width: W > 6 ? 1.5 : 1.25 },
        sa: 0,
      });
    }

    // ── Interior Slip Pocket ──────────────────────────────────────────────────
    if (opts.interiorPocket === 'yes' && opts.lined === 'yes') {
      const pW = Math.max(3, Math.round((W * 0.7) * 4) / 4);
      const pH = Math.max(2.5, Math.round((H * 0.65) * 4) / 4);
      pieces.push({
        id: 'interior-pocket',
        name: 'Interior Slip Pocket',
        instruction: `Cut 1 · ${fmtInches(pW)} wide × ${fmtInches(pH)} tall · Attach to one lining panel before assembling`,
        type: 'rectangle',
        dimensions: { length: pH, width: pW },
        sa,
      });
    }

    // ── Wrist Loop ────────────────────────────────────────────────────────────
    if (opts.wristLoop === 'yes') {
      pieces.push({
        id: 'wrist-loop',
        name: 'Wrist Loop',
        instruction: `Cut 1 · 7″ long × 1¼″ wide · Or cut 7″ of ½″ ribbon · Fold in half, attach at one end of zipper seam`,
        type: 'rectangle',
        dimensions: { length: 7, width: 1.25 },
        sa: 0,
      });
    }

    return pieces;
  },

  materials(m, opts) {
    const pre = PRESETS[opts.preset];
    const W = pre ? pre.pouchWidth  : m.pouchWidth;
    const H = pre ? pre.pouchHeight : m.pouchHeight;
    const boxCorner = opts.boxedCorners === 'none' ? 0 : parseFloat(opts.boxedCorners);
    const panelH = boxCorner > 0 ? H + boxCorner : H;

    // Yardage: 2 outer panels + 2 lining panels
    const panelArea = W * panelH;
    const outerYards  = Math.ceil(((panelArea * 2) / 1296 + 0.25) * 4) / 4; // convert sq-in to yards + buffer
    const liningYards = opts.lined === 'yes' ? outerYards : 0;

    const zipperLen = W + 2; // zipper at least 2" longer than finished width
    const notions = [
      { name: `Zipper`, quantity: `1, at least ${fmtInches(zipperLen)} long (zipper tape, not molded end-to-end)` },
    ];
    if (opts.wristLoop === 'yes') {
      notions.push({ name: '½″ ribbon or matching fabric', quantity: '7″' });
    }

    const notes = [
      `Outer fabric: approximately ${outerYards} yard(s) at 44″ wide. Fat quarters work well for small/medium pouches.`,
    ];
    if (opts.lined === 'yes') {
      notes.push(`Lining fabric: approximately ${liningYards} yard(s).`);
    }
    if (opts.interfacing !== 'none') {
      const ifLabel = opts.interfacing === 'light'
        ? 'Light fusible interfacing. Best for quilting cotton. Adds body without bulk.'
        : 'Medium-weight fusible interfacing. Good for structure in a canvas or denim pouch.';
      notes.push(ifLabel);
      notions.push({ ref: opts.interfacing === 'light' ? 'interfacing-light' : 'interfacing-med', quantity: `${outerYards} yard(s)` });
    }
    notes.push('Use a zipper foot for installing the zipper. Lower the needle into the fabric before pivoting at corners.');
    notes.push('A nonstick or Teflon presser foot helps with slippery or coated fabrics.');

    return buildMaterialsSpec({
      fabrics: ['cotton-quilting', 'cotton-canvas', 'linen', 'cork-fabric', 'waxed-canvas'],
      notions,
      thread: 'poly-all',
      needle: 'universal-80',
      stitches: ['straight-2.5', 'topstitch'],
      notes,
    });
  },

  instructions(m, opts) {
    const steps = [];
    let n = 1;
    const pre = PRESETS[opts.preset];
    const W = pre ? pre.pouchWidth  : m.pouchWidth;
    const boxCorner = opts.boxedCorners === 'none' ? 0 : parseFloat(opts.boxedCorners);
    const isLined = opts.lined === 'yes';

    // 1. Interfacing
    if (opts.interfacing !== 'none') {
      steps.push({
        step: n++, title: 'Apply interfacing',
        detail: 'Fuse interfacing to the wrong side of each outer panel following the manufacturer\'s instructions. Use a {press} cloth and medium heat. Let cool completely before handling.',
      });
    }

    // 2. Zipper tabs
    if (opts.zipperTab === 'yes') {
      steps.push({
        step: n++, title: 'Make zipper end tabs',
        detail: 'Fold each tab piece in half, wrong sides together. Slip one tab over each end of the zipper tape so the raw edges align with the zipper end. Baste across the end to hold the tab in place. This gives you clean ends to sew into the side seams.',
      });
    }

    // 3. Interior pocket
    if (opts.interiorPocket === 'yes' && isLined) {
      steps.push({
        step: n++, title: 'Make and attach interior pocket',
        detail: 'Press the top edge of the pocket under ¼″ twice and {topstitch}. Press the remaining three edges under ¼″. Position the pocket on one lining panel, centered, 1″ below the top edge. {topstitch} around the bottom and sides close to the edge. Bar tack the top corners for strength.',
      });
    }

    // 4. Wrist loop
    if (opts.wristLoop === 'yes') {
      steps.push({
        step: n++, title: 'Prepare wrist loop',
        detail: 'If using fabric: fold in half lengthwise, right sides together, sew the long edge, turn right side out, {press}. Fold in half to form a loop. Set aside to attach with the zipper.',
      });
    }

    // 5. Install zipper — sandwich method
    steps.push({
      step: n++, title: 'Attach zipper — first panel',
      detail: `Place one outer panel face up. Lay the zipper face down along the top edge, raw edges aligned. If using a wrist loop, tuck it under the zipper tape at one end now. Place one lining panel face down on top of the zipper, sandwiching the zipper between the two panels. Pin through all layers. Using a zipper foot, sew along the top edge. {press} the panels away from the zipper. {topstitch} close to the zipper on both fabric layers.`,
    });

    steps.push({
      step: n++, title: 'Attach zipper — second panel',
      detail: 'Fold the sewn panels out of the way. Align the remaining outer panel and lining panel on the other side of the zipper, right sides facing the zipper. Pin and sew the same way. {press} away from zipper. {topstitch}.',
    });

    // 6. Open zipper partway
    steps.push({
      step: n++, title: 'Open the zipper partway',
      detail: 'Open the zipper about halfway. This is essential — you need an opening to turn the pouch right side out later.',
    });

    // 7. Sew sides
    if (isLined) {
      steps.push({
        step: n++, title: 'Sew the sides',
        detail: 'Arrange the pouch so the outer panels are right sides together and the lining panels are right sides together. The zipper should be in the center. Pin and sew both side seams in one continuous pass, sewing around the zipper ends. Leave a 3–4″ turning gap in the bottom of the lining.',
      });
    } else {
      steps.push({
        step: n++, title: 'Sew the sides and bottom',
        detail: 'Bring the outer panels right sides together. Sew both side seams and the bottom seam. Serge or zigzag the raw edges.',
      });
    }

    // 8. Boxed corners
    if (boxCorner > 0) {
      steps.push({
        step: n++, title: 'Sew boxed corners',
        detail: `At each bottom corner, open the corner into a triangle by matching the side seam to the bottom seam. The seam line is ${fmtInches(boxCorner)} from the point. Sew straight across. Trim the triangle to ½″. Repeat for all corners (outer and lining if lined).`,
      });
    }

    // 9. Turn
    if (isLined) {
      steps.push({
        step: n++, title: 'Turn right side out',
        detail: 'Pull the entire pouch right side out through the gap in the lining. Push out the corners. Hand-stitch or machine-stitch the lining gap closed. Tuck the lining inside the pouch.',
      });
    }

    // 10. Final
    steps.push({
      step: n++, title: 'Final press',
      detail: '{press} the entire pouch. Zip and unzip a few times to ensure the zipper glides smoothly. If the zipper is stiff, rub the teeth with beeswax or a bar of dry soap.',
    });

    return steps;
  },

  variants: [
    { id: 'makeup-bag',     name: 'Makeup Bag',     defaults: { preset: 'medium', boxedCorners: '1', interiorPocket: 'yes' } },
    { id: 'pencil-case',    name: 'Pencil Case',    defaults: { preset: 'large', boxedCorners: 'none', lined: 'yes' } },
  ],
};
