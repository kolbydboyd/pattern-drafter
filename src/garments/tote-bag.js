// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Tote Bag — beginner accessory project.
 * Customizable dimensions, bottom styles, pockets, straps, lining, and closures.
 * All measurements in inches. Seam allowance computed by the engine.
 */

import { fmtInches, polyToPath } from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

const PRESETS = {
  small:  { bagWidth: 10, bagHeight: 11, bagDepth: 3 },
  medium: { bagWidth: 14, bagHeight: 15, bagDepth: 4 },
  large:  { bagWidth: 18, bagHeight: 18, bagDepth: 6 },
};

export default {
  id: 'tote-bag',
  name: 'Tote Bag',
  category: 'accessory',
  difficulty: 'beginner',
  priceTier: 'intermediate',
  measurementLabel: 'Bag Dimensions',
  measurements: ['bagWidth', 'bagHeight', 'bagDepth', 'strapWidth', 'strapLength'],

  options: {
    preset: {
      type: 'select', label: 'Size preset',
      values: [
        { value: 'custom', label: 'Custom' },
        { value: 'small',  label: 'Small Everyday (10 × 11 × 3)', reference: 'lunch, book bag' },
        { value: 'medium', label: 'Medium Classic (14 × 15 × 4)',  reference: 'most popular' },
        { value: 'large',  label: 'Large Market/Beach (18 × 18 × 6)', reference: 'grocery, beach' },
      ],
      default: 'custom',
    },
    bottomStyle: {
      type: 'select', label: 'Bottom style',
      values: [
        { value: 'flat',            label: 'Flat (no gusset)',          reference: 'simplest construction' },
        { value: 'boxed-corners',   label: 'Flat bottom (boxed corners)', reference: 'most popular' },
        { value: 'separate-gusset', label: 'Separate gusset panel',    reference: 'more structured' },
      ],
      default: 'boxed-corners',
    },
    interiorSlipPocket: {
      type: 'select', label: 'Interior slip pocket',
      values: [
        { value: 'none', label: 'None' },
        { value: 'yes',  label: 'Yes', reference: '6 × 7 inch slip pocket' },
      ],
      default: 'yes',
    },
    interiorZipPocket: {
      type: 'select', label: 'Interior zippered pocket',
      values: [
        { value: 'none', label: 'None' },
        { value: 'yes',  label: 'Yes', reference: 'adds zipper to interior' },
      ],
      default: 'none',
    },
    exteriorPatchPocket: {
      type: 'select', label: 'Exterior patch pocket',
      values: [
        { value: 'none',  label: 'None' },
        { value: 'front', label: 'Front' },
        { value: 'side',  label: 'Side' },
      ],
      default: 'none',
    },
    exteriorGussetedPocket: {
      type: 'select', label: 'Exterior gusseted pocket',
      values: [
        { value: 'none', label: 'None' },
        { value: 'yes',  label: 'Yes', reference: 'water bottle or phone' },
      ],
      default: 'none',
    },
    strapPhonePocket: {
      type: 'select', label: 'Phone pocket on strap',
      values: [
        { value: 'none', label: 'None' },
        { value: 'yes',  label: 'Yes' },
      ],
      default: 'none',
    },
    strapStyle: {
      type: 'select', label: 'Handles / straps',
      values: [
        { value: 'standard',   label: 'Standard (2 top-edge straps)', reference: 'classic tote' },
        { value: 'crossbody',  label: 'Cross-body (1 long strap)',    reference: 'adjustable with sliders' },
        { value: 'reinforced', label: 'Reinforced / padded straps',   reference: 'added comfort' },
      ],
      default: 'standard',
    },
    lined: {
      type: 'select', label: 'Fully lined',
      values: [
        { value: 'yes', label: 'Yes' },
        { value: 'no',  label: 'No' },
      ],
      default: 'yes',
    },
    interfacing: {
      type: 'select', label: 'Interfacing',
      values: [
        { value: 'none',   label: 'None' },
        { value: 'light',  label: 'Light fusible',    reference: 'quilting cotton' },
        { value: 'medium', label: 'Medium fusible',   reference: 'canvas, general purpose' },
        { value: 'heavy',  label: 'Heavy fusible',    reference: 'craft weight' },
        { value: 'foam',   label: 'Foam stabilizer',  reference: 'structured, stands up on its own' },
      ],
      default: 'medium',
    },
    bottomReinforcement: {
      type: 'select', label: 'Bottom reinforcement',
      values: [
        { value: 'none',           label: 'None' },
        { value: 'canvas-insert',  label: 'Canvas insert' },
        { value: 'plastic-canvas', label: 'Plastic canvas insert' },
      ],
      default: 'none',
    },
    closure: {
      type: 'select', label: 'Closure',
      values: [
        { value: 'none',          label: 'None (open top)' },
        { value: 'top-zipper',    label: 'Top zipper' },
        { value: 'magnetic-snap', label: 'Magnetic snap' },
        { value: 'drawstring',    label: 'Drawstring' },
      ],
      default: 'none',
    },
    keyFob: {
      type: 'select', label: 'Key fob / D-ring inside',
      values: [
        { value: 'none', label: 'None' },
        { value: 'yes',  label: 'Yes' },
      ],
      default: 'none',
    },
    contrastBottom: {
      type: 'select', label: 'Contrast bottom panel',
      values: [
        { value: 'none', label: 'None' },
        { value: 'yes',  label: 'Yes' },
      ],
      default: 'none',
    },
    topFinish: {
      type: 'select', label: 'Top edge finish',
      values: [
        { value: 'folded-hem', label: 'Folded hem' },
        { value: 'binding',    label: 'Binding strip' },
      ],
      default: 'folded-hem',
    },
    sa: {
      type: 'select', label: 'Seam allowance',
      values: [
        { value: 0.375, label: '⅜″' },
        { value: 0.5,   label: '½″' },
      ],
      default: 0.5,
    },
  },

  pieces(m, opts) {
    const sa = parseFloat(opts.sa);
    const pre = PRESETS[opts.preset];
    const W = pre ? pre.bagWidth : m.bagWidth;
    const H = pre ? pre.bagHeight : m.bagHeight;
    const D = pre ? pre.bagDepth : m.bagDepth;
    const strapW = m.strapWidth;
    const strapL = m.strapLength;
    const pieces = [];

    // ── Outer Main Panel ──
    const isBoxed = opts.bottomStyle === 'boxed-corners';
    const panelH = isBoxed ? H + D / 2 : H;
    let outerPoly;

    if (isBoxed && D > 0) {
      const cut = D / 2;
      outerPoly = [
        { x: 0,         y: 0 },
        { x: W,         y: 0 },
        { x: W,         y: panelH - cut },
        { x: W - cut,   y: panelH - cut },
        { x: W - cut,   y: panelH },
        { x: cut,       y: panelH },
        { x: cut,       y: panelH - cut },
        { x: 0,         y: panelH - cut },
      ];
    } else {
      outerPoly = [
        { x: 0, y: 0 },
        { x: W, y: 0 },
        { x: W, y: panelH },
        { x: 0, y: panelH },
      ];
    }

    const outerPath = polyToPath(outerPoly);
    const hemSa = opts.lined === 'yes' ? sa : 1.0;

    const outerEdgeAllowances = isBoxed && D > 0
      ? [
          { sa: hemSa, label: 'Top' },
          { sa, label: 'Side' },
          { sa, label: 'Cutout' },
          { sa, label: 'Cutout' },
          { sa, label: 'Bottom' },
          { sa, label: 'Cutout' },
          { sa, label: 'Cutout' },
          { sa, label: 'Side' },
        ]
      : [
          { sa: hemSa, label: 'Top' },
          { sa, label: 'Side' },
          { sa, label: 'Bottom' },
          { sa, label: 'Side' },
        ];

    const flatNote = opts.bottomStyle === 'flat' ? ' (or 1 on fold)' : '';
    pieces.push({
      id: 'outer-panel', name: 'Outer Main Panel',
      instruction: `Cut 2${flatNote} · ${fmtInches(W)} wide × ${fmtInches(panelH)} tall`,
      type: 'bodice', polygon: outerPoly, path: outerPath,
      width: W, height: panelH, sa, hem: hemSa,
      edgeAllowances: outerEdgeAllowances,
      dims: [
        { label: fmtInches(W) + ' width', x1: 0, y1: -0.5, x2: W, y2: -0.5, type: 'h' },
        { label: fmtInches(panelH) + ' height', x: W + 0.8, y1: 0, y2: panelH, type: 'v' },
      ],
    });

    // ── Lining Main Panel ──
    if (opts.lined === 'yes') {
      pieces.push({
        id: 'lining-panel', name: 'Lining Main Panel',
        instruction: `Cut 2${flatNote} · ${fmtInches(W)} wide × ${fmtInches(panelH)} tall · Same shape as outer`,
        type: 'bodice', polygon: outerPoly, path: outerPath,
        width: W, height: panelH, sa,
        edgeAllowances: outerEdgeAllowances.map(e => ({ ...e, sa })),
        dims: [
          { label: fmtInches(W) + ' width', x1: 0, y1: -0.5, x2: W, y2: -0.5, type: 'h' },
          { label: fmtInches(panelH) + ' height', x: W + 0.8, y1: 0, y2: panelH, type: 'v' },
        ],
      });
    }

    // ── Gusset / Bottom Panel ──
    if (opts.bottomStyle === 'separate-gusset' && D > 0) {
      const gussetLen = W + 2 * D;
      pieces.push({
        id: 'gusset', name: 'Bottom Gusset Panel',
        instruction: `Cut 1 outer${opts.lined === 'yes' ? ' + 1 lining' : ''} · ${fmtInches(gussetLen)} long × ${fmtInches(D)} wide`,
        type: 'rectangle',
        dimensions: { length: gussetLen, width: D },
        sa,
      });
    }

    // ── Contrast Bottom Panel ──
    if (opts.contrastBottom === 'yes' && D > 0) {
      const contrastH = D / 2 + 1;
      pieces.push({
        id: 'contrast-bottom', name: 'Contrast Bottom Strip',
        instruction: `Cut 2 in contrast fabric · ${fmtInches(W)} wide × ${fmtInches(contrastH)} tall · Replaces bottom section of outer panel`,
        type: 'rectangle',
        dimensions: { length: contrastH, width: W },
        sa,
      });
    }

    // ── Straps ──
    const cutStrapW = strapW * 2 + 0.5;
    const isCrossbody = opts.strapStyle === 'crossbody';
    const strapCount = isCrossbody ? 1 : 2;
    const actualStrapL = isCrossbody ? Math.round(strapL * 1.5) : strapL;
    let strapNote = `Fold lengthwise, sew, turn, {topstitch} both edges`;
    if (opts.strapStyle === 'reinforced') strapNote += ' · Add padding or interfacing before folding';
    if (isCrossbody) strapNote += ' · Attach hardware sliders at each end';

    pieces.push({
      id: 'strap', name: isCrossbody ? 'Cross-body Strap' : 'Strap',
      instruction: `Cut ${strapCount} · ${fmtInches(actualStrapL)} long × ${fmtInches(cutStrapW)} wide · ${strapNote}`,
      type: 'rectangle',
      dimensions: { length: actualStrapL, width: cutStrapW },
      sa,
    });

    // ── Interior Slip Pocket ──
    if (opts.interiorSlipPocket === 'yes') {
      const pW = Math.min(6, W * 0.5);
      pieces.push({
        id: 'interior-slip-pocket', name: 'Interior Slip Pocket',
        instruction: `Cut 1 · ${fmtInches(pW)} wide × 7″ tall · Fold top edge under ½″ twice, {topstitch}`,
        type: 'rectangle',
        dimensions: { length: 7, width: pW },
        sa,
      });
    }

    // ── Interior Zip Pocket ──
    if (opts.interiorZipPocket === 'yes') {
      const pW = Math.min(8, W * 0.6);
      pieces.push({
        id: 'interior-zip-pocket', name: 'Interior Zippered Pocket',
        instruction: `Cut 2 (front + back) · ${fmtInches(pW)} wide × 6″ tall · Install zipper between the two layers`,
        type: 'rectangle',
        dimensions: { length: 6, width: pW },
        sa,
      });
    }

    // ── Exterior Patch Pocket ──
    if (opts.exteriorPatchPocket !== 'none') {
      const pW = Math.round(W * 0.6);
      const pH = Math.round(H * 0.4);
      const placement = opts.exteriorPatchPocket === 'front' ? 'front panel' : 'side';
      pieces.push({
        id: 'exterior-patch-pocket', name: 'Exterior Patch Pocket',
        instruction: `Cut 1 · ${fmtInches(pW)} wide × ${fmtInches(pH)} tall · Attach to ${placement}`,
        type: 'rectangle',
        dimensions: { length: pH, width: pW },
        sa,
      });
    }

    // ── Exterior Gusseted Pocket ──
    if (opts.exteriorGussetedPocket === 'yes') {
      pieces.push({
        id: 'exterior-gusseted-pocket', name: 'Exterior Gusseted Pocket',
        instruction: `Cut 1 · 5″ wide × 8″ tall · Pleat 1½″ gusset on each side before attaching`,
        type: 'rectangle',
        dimensions: { length: 8, width: 5 },
        sa,
      });
    }

    // ── Phone Pocket on Strap ──
    if (opts.strapPhonePocket === 'yes') {
      pieces.push({
        id: 'strap-phone-pocket', name: 'Strap Phone Pocket',
        instruction: `Cut 2 (front + back) · 4″ wide × 6″ tall · Sew together, turn, attach to strap`,
        type: 'rectangle',
        dimensions: { length: 6, width: 4 },
        sa,
      });
    }

    // ── Top Binding Strip ──
    if (opts.topFinish === 'binding') {
      const bindLen = (W + D) * 2 + 4;
      pieces.push({
        id: 'binding-strip', name: 'Top Binding Strip',
        instruction: `Cut 1 (on bias) · ${fmtInches(bindLen)} long × 2½″ wide · Encloses top raw edge`,
        type: 'rectangle',
        dimensions: { length: bindLen, width: 2.5 },
        sa: 0,
      });
    }

    // ── Bottom Reinforcement Insert ──
    if (opts.bottomReinforcement !== 'none' && D > 0) {
      const matName = opts.bottomReinforcement === 'plastic-canvas' ? 'plastic canvas' : 'heavy canvas';
      pieces.push({
        id: 'bottom-reinforcement', name: 'Bottom Reinforcement',
        instruction: `Cut 1 from ${matName} · ${fmtInches(W - 0.5)} wide × ${fmtInches(D - 0.5)} deep · No seam allowance needed. Slides into finished bag.`,
        type: 'rectangle',
        dimensions: { length: D - 0.5, width: W - 0.5 },
        sa: 0,
      });
    }

    return pieces;
  },

  materials(m, opts) {
    const pre = PRESETS[opts.preset];
    const H = pre ? pre.bagHeight : m.bagHeight;
    const D = pre ? pre.bagDepth : m.bagDepth;
    const strapL = m.strapLength;

    // Yardage estimate
    const base = (H * 2 + D * 2 + strapL * 2) / 36 + 0.5;
    let yards = Math.ceil(base * 4) / 4;

    const hasPockets = [
      opts.interiorSlipPocket, opts.interiorZipPocket,
      opts.exteriorPatchPocket, opts.exteriorGussetedPocket,
      opts.strapPhonePocket,
    ].some(v => v !== 'none');
    if (hasPockets) yards += 0.25;

    const notions = [];
    const notes = [
      'Pre-wash fabric before cutting. Canvas and denim shrink 3 to 5 percent.',
      `Main fabric: approximately ${yards} yards at 44″ wide.`,
    ];

    // Lining
    if (opts.lined === 'yes') {
      const liningYards = Math.ceil((base + 0.25) * 4) / 4;
      notes.push(`Lining fabric: approximately ${liningYards} yards.`);
    }

    // Interfacing
    if (opts.interfacing !== 'none') {
      const ifRef = opts.interfacing === 'light' ? 'interfacing-light' : 'interfacing-med';
      const ifYards = Math.ceil((base + 0.25) * 4) / 4;
      notions.push({ ref: ifRef, quantity: `${ifYards} yards` });
      const ifNotes = {
        light: 'Light fusible interfacing. Best for quilting cotton.',
        medium: 'Medium-weight fusible interfacing. Good all-purpose choice for canvas.',
        heavy: 'Heavy fusible or craft-weight interfacing for maximum structure.',
        foam: 'Foam stabilizer (such as Pellon FF77). Creates a structured bag that stands up on its own.',
      };
      notes.push(ifNotes[opts.interfacing]);
    }

    // Closure hardware
    if (opts.closure === 'top-zipper') {
      const pre2 = PRESETS[opts.preset];
      const W = pre2 ? pre2.bagWidth : m.bagWidth;
      notions.push({ name: 'Zipper', quantity: `1, at least ${fmtInches(W + 2)} long` });
    }
    if (opts.closure === 'magnetic-snap') {
      notions.push({ name: 'Magnetic snap set', quantity: '1' });
    }
    if (opts.closure === 'drawstring') {
      const pre2 = PRESETS[opts.preset];
      const W = pre2 ? pre2.bagWidth : m.bagWidth;
      const cordLen = (W + D) * 2 + 12;
      notions.push({ name: 'Drawstring cord', quantity: `${fmtInches(cordLen)} long` });
    }

    // Key fob
    if (opts.keyFob === 'yes') {
      notions.push({ name: 'D-ring (¾″ or 1″)', quantity: '1' });
      notions.push({ name: 'Swivel clasp', quantity: '1' });
      notions.push({ name: 'Webbing (1″ wide)', quantity: '4″ strip' });
    }

    // Interior zip pocket zipper
    if (opts.interiorZipPocket === 'yes') {
      notions.push({ name: 'Zipper (pocket)', quantity: '1, 7″' });
    }

    // Crossbody hardware
    if (opts.strapStyle === 'crossbody') {
      notions.push({ name: 'Slider / tri-glide (1″ or 1½″)', quantity: '2' });
      notions.push({ name: 'Swivel snap hook', quantity: '2' });
      notions.push({ name: 'D-ring for strap attachment', quantity: '2' });
    }

    // Bottom reinforcement
    if (opts.bottomReinforcement === 'plastic-canvas') {
      notions.push({ name: 'Plastic canvas sheet', quantity: '1' });
    }

    notes.push('Use a jeans or denim needle (size 90/14 or 100/16) for heavy fabrics.');
    notes.push('Reinforce strap attachment points with an X-box stitch for strength.');

    return buildMaterialsSpec({
      fabrics: ['cotton-canvas', 'cotton-duck', 'denim', 'linen'],
      notions,
      thread: 'poly-all',
      needle: 'universal-90',
      stitches: ['straight-3', 'topstitch', 'bartack'],
      notes,
    });
  },

  instructions(m, opts) {
    const steps = [];
    let n = 1;
    const pre = PRESETS[opts.preset];
    const W = pre ? pre.bagWidth : m.bagWidth;
    const D = pre ? pre.bagDepth : m.bagDepth;
    const isLined = opts.lined === 'yes';
    const hasExtPocket = opts.exteriorPatchPocket !== 'none' || opts.exteriorGussetedPocket === 'yes';
    const hasIntPocket = opts.interiorSlipPocket === 'yes' || opts.interiorZipPocket === 'yes';

    // 1. Cut
    steps.push({ step: n++, title: 'Cut all pieces',
      detail: 'Cut all pattern pieces as marked. If using interfacing, also cut interfacing pieces for the outer panels (and straps if reinforced). Transfer any pocket placement markings to fabric.' });

    // 2. Interfacing
    if (opts.interfacing !== 'none') {
      const ifType = opts.interfacing === 'foam'
        ? 'Baste foam stabilizer to the wrong side of each outer panel. Trim foam close to the stitching line so it does not add bulk in seam allowances.'
        : 'Fuse interfacing to the wrong side of each outer panel following manufacturer instructions. Use a {press} cloth and medium heat. Allow pieces to cool flat before handling.';
      steps.push({ step: n++, title: 'Apply interfacing', detail: ifType });
    }

    // 3. Prepare pockets
    if (hasIntPocket || hasExtPocket) {
      let pocketDetail = '';
      if (opts.interiorSlipPocket === 'yes') {
        pocketDetail += 'Interior slip pocket: fold top edge under ½″ twice. {press} and {topstitch}. {press} remaining edges under ½″. ';
      }
      if (opts.interiorZipPocket === 'yes') {
        pocketDetail += 'Interior zip pocket: mark zipper placement on one lining panel. Sew zipper between the two pocket rectangles. {press} seams away from zipper. {topstitch} along both sides of zipper. ';
      }
      if (opts.exteriorPatchPocket !== 'none') {
        pocketDetail += 'Exterior patch pocket: fold top edge under ½″ twice. {press} and {topstitch}. {press} remaining edges under ½″. ';
      }
      if (opts.exteriorGussetedPocket === 'yes') {
        pocketDetail += 'Exterior gusseted pocket: fold and {press} 1½″ box pleat on each side. {press} top edge under ½″ twice and {topstitch}. ';
      }
      steps.push({ step: n++, title: 'Prepare pockets', detail: pocketDetail.trim() });
    }

    // 4. Attach exterior pockets
    if (hasExtPocket) {
      let extDetail = '';
      if (opts.exteriorPatchPocket !== 'none') {
        const pos = opts.exteriorPatchPocket === 'front' ? 'centered on the front outer panel' : 'on the side of the outer panel';
        extDetail += `Position the patch pocket ${pos}, 2″ below the top edge. {topstitch} sides and bottom close to the edge. Bar tack the top corners for strength. `;
      }
      if (opts.exteriorGussetedPocket === 'yes') {
        extDetail += 'Position the gusseted pocket on the front outer panel, aligned to one side. Sew the bottom and sides in place, keeping the gusset pleats free at the top. ';
      }
      steps.push({ step: n++, title: 'Attach exterior pockets', detail: extDetail.trim() });
    }

    // 5. Contrast bottom
    if (opts.contrastBottom === 'yes' && D > 0) {
      steps.push({ step: n++, title: 'Attach contrast bottom panels',
        detail: `Sew each contrast bottom strip to the lower edge of an outer panel {RST}. {press} seam allowance toward the contrast fabric. {topstitch} along the seam for a clean finish.` });
    }

    // 6. Sew outer panels
    if (opts.bottomStyle === 'flat') {
      steps.push({ step: n++, title: 'Assemble outer bag',
        detail: 'Place the two outer panels together {RST}. Sew both side seams and the bottom seam. {press} seams open or to one side. Turn right side out.' });
    } else if (opts.bottomStyle === 'boxed-corners') {
      steps.push({ step: n++, title: 'Assemble outer bag',
        detail: `Place the two outer panels together {RST}. Sew both side seams and the bottom seam. {press} seams open.` });
      steps.push({ step: n++, title: 'Create flat bottom (boxed corners)',
        detail: `This is the key step for a flat bottom. At each bottom corner, match the side seam to the bottom seam so the corner opens into a triangle. Pin the raw edges of the cutout square together. The seam line should be ${fmtInches(D / 2)} from the point. Sew straight across. Repeat for the other corner. This creates a ${fmtInches(W)} × ${fmtInches(D)} rectangular base. Trim the triangle points to ½″ if desired.` });
    } else {
      steps.push({ step: n++, title: 'Assemble outer bag with gusset',
        detail: `Pin the gusset strip to the bottom edge of one outer panel {RST}. Sew along the bottom. Continue pinning and sewing the gusset up each side. Repeat with the second outer panel on the other side of the gusset. {press} seams toward the gusset. Clip curves if needed at the corners.` });
    }

    // 7. Make straps
    if (opts.strapStyle === 'crossbody') {
      steps.push({ step: n++, title: 'Make cross-body strap',
        detail: 'Fold the strap in half lengthwise {RST}. Sew the long edge. Turn right side out using a safety pin or bodkin. {press} flat with the seam centered on one side. {topstitch} both long edges. Thread each end through a slider and fold back 1½″. Sew across to secure.' });
    } else {
      let strapDetail = 'Fold each strap in half lengthwise {RST}. Sew the long edge. Turn right side out. {press} flat with the seam centered on one side. {topstitch} both long edges.';
      if (opts.strapStyle === 'reinforced') {
        strapDetail += ' Before folding, layer padding or interfacing inside the strap for cushioning.';
      }
      steps.push({ step: n++, title: 'Make straps', detail: strapDetail });
    }

    // 8. Attach straps
    if (opts.strapStyle === 'crossbody') {
      steps.push({ step: n++, title: 'Attach strap hardware',
        detail: 'Sew a D-ring tab to each side of the bag at the top edge. Thread the strap snap hooks through the D-rings. Use an X-box stitch to reinforce the D-ring tabs.' });
    } else {
      steps.push({ step: n++, title: 'Attach straps to outer bag',
        detail: `Position each strap on the outer bag top edge, about ${fmtInches(W / 4)} from each side seam. The strap ends should extend 1″ below the top raw edge. Baste in place. For maximum strength, sew an X inside a box (X-box stitch) through the strap and bag body, catching at least 1″ of strap.` });
    }

    // 9. Interior pockets on lining
    if (isLined && hasIntPocket) {
      let intDetail = '';
      if (opts.interiorSlipPocket === 'yes') {
        intDetail += 'Position the slip pocket on one lining panel, 3″ below the top edge, centered. {topstitch} the sides and bottom close to the edge. ';
      }
      if (opts.interiorZipPocket === 'yes') {
        intDetail += 'Position the zippered pocket unit on the other lining panel, 2″ below the top edge. Sew in place along the outer edges of the pocket. ';
      }
      steps.push({ step: n++, title: 'Attach pockets to lining', detail: intDetail.trim() });
    }

    // 10. Key fob
    if (opts.keyFob === 'yes') {
      steps.push({ step: n++, title: 'Add key fob',
        detail: 'Fold a 4″ piece of webbing through a D-ring. Clip the swivel clasp to the D-ring. Baste the webbing ends to the top edge of one lining panel at a side seam. It will be caught in the top seam.' });
    }

    // 11. Assemble lining
    if (isLined) {
      const liningMethod = opts.bottomStyle === 'boxed-corners'
        ? 'Assemble the lining the same way as the outer bag, including the boxed corners. Leave a 5 to 6 inch turning gap in the bottom seam.'
        : opts.bottomStyle === 'separate-gusset'
        ? 'Assemble the lining gusset the same way as the outer. Leave a 5 to 6 inch turning gap in the bottom of the gusset seam.'
        : 'Sew the lining side and bottom seams {RST}. Leave a 5 to 6 inch turning gap in the bottom seam.';
      steps.push({ step: n++, title: 'Assemble lining', detail: liningMethod });
    }

    // 12. Closure
    if (opts.closure === 'top-zipper') {
      steps.push({ step: n++, title: 'Install top zipper',
        detail: isLined
          ? 'Sandwich the zipper between the outer bag and lining at the top edge {RST}. Sew along both sides of the zipper tape. {press} the fabric away from the zipper teeth. {topstitch} along both sides.'
          : 'Fold the top edge of the bag over the zipper tape. Pin and sew close to the zipper teeth. Fold under the raw edge and {topstitch} to enclose.' });
    }
    if (opts.closure === 'magnetic-snap') {
      steps.push({ step: n++, title: 'Install magnetic snap',
        detail: 'Mark snap placement 1½″ below the top edge, centered on each side. Apply interfacing behind snap locations. Install the male half on one side and the female half on the other, following the hardware instructions.' });
    }
    if (opts.closure === 'drawstring') {
      steps.push({ step: n++, title: 'Add drawstring channel',
        detail: 'Create a 1½″ channel below the top edge by sewing two parallel lines around the bag. Leave openings at the side seams. Thread the drawstring cord through the channel. Knot or add cord stops at the ends.' });
    }

    // 13. Join lining to outer
    if (isLined && opts.closure !== 'top-zipper') {
      steps.push({ step: n++, title: 'Join lining to outer bag',
        detail: 'Place the lining inside the outer bag {RST} (lining should be inside out, outer should be right side out, nested together). Align the top edges. Pin around the entire top opening. Sew around the top. Turn the entire bag right side out through the gap in the lining. Push the lining down into the bag. {press} the top edge. Hand-stitch or machine-stitch the turning gap closed.' });
    }

    // 14. Finish top edge
    if (isLined) {
      steps.push({ step: n++, title: 'Finish top edge',
        detail: '{topstitch} around the top edge, ¼″ from the edge. This keeps the lining from rolling to the outside and gives a clean finish.' });
    } else if (opts.topFinish === 'binding') {
      steps.push({ step: n++, title: 'Apply top binding',
        detail: 'Fold the binding strip in half lengthwise, wrong sides together. {press}. Open and fold each long edge to the center crease. {press}. Encase the top raw edge of the bag with the binding. Pin and {topstitch} through all layers close to the inner edge of the binding.' });
    } else {
      steps.push({ step: n++, title: 'Finish top edge',
        detail: 'Fold the top edge under ½″, then 1″. {press}. {topstitch} close to the inner fold. This creates a clean hem and reinforces the top of the bag.' });
    }

    // 15. Bottom reinforcement
    if (opts.bottomReinforcement !== 'none' && D > 0) {
      steps.push({ step: n++, title: 'Insert bottom reinforcement',
        detail: 'Slide the reinforcement panel into the bottom of the bag between the outer fabric and lining. It should fit snugly without bunching. The reinforcement is not sewn in so it can be removed for washing.' });
    }

    // 16. Strap phone pocket
    if (opts.strapPhonePocket === 'yes') {
      steps.push({ step: n++, title: 'Attach phone pocket to strap',
        detail: 'Place the two phone pocket pieces {RST}. Sew around three sides, leaving the top open. Turn right side out. {press}. Fold the top edges in and {topstitch} closed. Position on the strap and {topstitch} the bottom and sides to attach, leaving the top open as the pocket opening.' });
    }

    // 17. Final
    steps.push({ step: n++, title: 'Final press',
      detail: '{press} the entire bag. Shape the bottom by pushing out the corners. Your tote bag is complete.' });

    return steps;
  },
};
