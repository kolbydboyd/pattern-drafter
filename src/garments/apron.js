// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Apron — beginner flat-construction project.
 * Full bib or waist-only style. Adjustable neck strap + waist ties.
 * Optional patch pocket. All rectangular pieces, no body-fitting curves.
 */

import { fmtInches } from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

export default {
  id: 'apron',
  name: 'Apron',
  category: 'accessory',
  difficulty: 'beginner',
  priceTier: 'simple',
  measurements: ['waist', 'torsoLength'],
  measurementDefaults: { torsoLength: 24 },

  options: {
    style: {
      type: 'select', label: 'Style',
      values: [
        { value: 'bib',   label: 'Full bib (chest to knee)',  reference: 'classic chef, BBQ'     },
        { value: 'waist', label: 'Waist-only (half apron)',   reference: 'café, cocktail server'  },
      ],
      default: 'bib',
    },
    pocket: {
      type: 'select', label: 'Pocket',
      values: [
        { value: 'none',     label: 'None'                         },
        { value: 'single',   label: 'Single center pocket'         },
        { value: 'divided',  label: 'Divided center pocket (3 slots)', reference: 'tool apron' },
      ],
      default: 'single',
    },
    tieLength: {
      type: 'select', label: 'Waist tie length',
      values: [
        { value: 'standard', label: 'Standard (28″ per side)',  reference: 'ties behind back'       },
        { value: 'long',     label: 'Long (36″ per side)',      reference: 'wraps and ties in front' },
      ],
      default: 'standard',
    },
    sa: {
      type: 'select', label: 'Seam allowance',
      values: [
        { value: 0.5,   label: '½″' },
        { value: 0.625, label: '⅝″' },
      ],
      default: 0.5,
    },
  },

  pieces(m, opts) {
    const sa = parseFloat(opts.sa);
    const isBib = opts.style === 'bib';
    const tieLen = opts.tieLength === 'long' ? 36 : 28;

    // Body dimensions
    const bodyW = isBib ? Math.max(m.waist * 0.6, 18) : Math.max(m.waist * 0.7, 20);
    const bodyH = isBib ? Math.max(m.torsoLength * 1.1, 28) : Math.max(m.torsoLength * 0.5, 16);

    // Bib section (above waist on full bib)
    const bibW = bodyW * 0.45;
    const bibH = isBib ? 10 : 0;

    const pieces = [];

    if (isBib) {
      // Full bib apron: bib + skirt as one piece
      // Shape: narrow bib at top, flares to full width at waist, straight to hem
      const waistY = bibH;
      const poly = [
        { x: (bodyW - bibW) / 2, y: 0 },             // top-left of bib
        { x: (bodyW + bibW) / 2, y: 0 },             // top-right of bib
        { x: (bodyW + bibW) / 2, y: waistY * 0.6 },  // bib side before flare
        { x: bodyW,              y: waistY },          // waist right
        { x: bodyW,              y: bodyH },           // hem right
        { x: 0,                  y: bodyH },           // hem left
        { x: 0,                  y: waistY },          // waist left
        { x: (bodyW - bibW) / 2, y: waistY * 0.6 },  // bib side before flare
      ];

      const path = poly.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ') + ' Z';

      const edgeAllowances = [
        { sa,      label: 'Bib top' },
        { sa,      label: 'Bib side' },
        { sa,      label: 'Bib side' },
        { sa,      label: 'Side' },
        { sa: 1.0, label: 'Hem' },
        { sa: 1.0, label: 'Hem' },
        { sa,      label: 'Side' },
        { sa,      label: 'Bib side' },
      ];

      pieces.push({
        id: 'apron-body', name: 'Apron Body',
        instruction: `Cut 1 · ${fmtInches(bodyW)} wide × ${fmtInches(bodyH)} long · Bib narrows to ${fmtInches(bibW)} at top`,
        type: 'bodice', polygon: poly, path,
        width: bodyW, height: bodyH, sa, hem: 1.0,
        edgeAllowances,
        dims: [
          { label: fmtInches(bodyW) + ' width', x1: 0, y1: bodyH + 0.8, x2: bodyW, y2: bodyH + 0.8, type: 'h' },
          { label: fmtInches(bodyH) + ' length', x: bodyW + 0.8, y1: 0, y2: bodyH, type: 'v' },
          { label: fmtInches(bibW) + ' bib', x1: (bodyW - bibW) / 2, y1: -0.5, x2: (bodyW + bibW) / 2, y2: -0.5, type: 'h' },
        ],
      });
    } else {
      // Waist apron: simple rectangle
      const poly = [
        { x: 0,     y: 0 },
        { x: bodyW, y: 0 },
        { x: bodyW, y: bodyH },
        { x: 0,     y: bodyH },
      ];
      const path = `M 0 0 L ${bodyW.toFixed(2)} 0 L ${bodyW.toFixed(2)} ${bodyH.toFixed(2)} L 0 ${bodyH.toFixed(2)} Z`;

      const edgeAllowances = [
        { sa,      label: 'Waist' },
        { sa,      label: 'Side' },
        { sa: 1.0, label: 'Hem' },
        { sa,      label: 'Side' },
      ];

      pieces.push({
        id: 'apron-body', name: 'Apron Body',
        instruction: `Cut 1 · ${fmtInches(bodyW)} wide × ${fmtInches(bodyH)} long`,
        type: 'bodice', polygon: poly, path,
        width: bodyW, height: bodyH, sa, hem: 1.0,
        edgeAllowances,
        dims: [
          { label: fmtInches(bodyW) + ' width', x1: 0, y1: -0.5, x2: bodyW, y2: -0.5, type: 'h' },
          { label: fmtInches(bodyH) + ' length', x: bodyW + 0.8, y1: 0, y2: bodyH, type: 'v' },
        ],
      });
    }

    // Waist ties
    pieces.push({
      id: 'waist-tie', name: 'Waist Tie',
      instruction: `Cut 2 · ${fmtInches(tieLen)} long × 3″ cut (1.5″ finished) · Fold lengthwise, sew, turn`,
      type: 'rectangle',
      dimensions: { length: tieLen, width: 3 },
      sa,
    });

    // Neck strap (bib only)
    if (isBib) {
      const neckLen = 30; // adjustable, will be trimmed to fit
      pieces.push({
        id: 'neck-strap', name: 'Neck Strap',
        instruction: `Cut 1 · ${fmtInches(neckLen)} long × 2.5″ cut (1″ finished) · Fold lengthwise, sew, turn · Adjust length to fit`,
        type: 'rectangle',
        dimensions: { length: neckLen, width: 2.5 },
        sa,
      });
    }

    // Pocket
    if (opts.pocket !== 'none') {
      const pocketW = opts.pocket === 'divided' ? bodyW * 0.6 : 8;
      const pocketH = 7;
      pieces.push({
        id: 'pocket', name: opts.pocket === 'divided' ? 'Divided Pocket' : 'Patch Pocket',
        instruction: `Cut 1 · ${fmtInches(pocketW)} wide × ${fmtInches(pocketH)} tall · Top edge: 1″ hem (fold under ½″ twice, {topstitch})${opts.pocket === 'divided' ? ' · Topstitch 2 vertical dividing lines at ⅓ intervals' : ''} · Sides + bottom: SA`,
        type: 'rectangle',
        dimensions: { width: pocketW, height: pocketH },
        sa, hem: 1.0, hemEdge: 'top',
      });
    }

    return pieces;
  },

  materials(m, opts) {
    const isBib = opts.style === 'bib';
    const notions = [];

    if (opts.pocket === 'divided') {
      notions.push({ name: 'Contrast thread (optional)', quantity: '1 spool', notes: 'For decorative pocket topstitching' });
    }

    return buildMaterialsSpec({
      fabrics: ['cotton-canvas', 'cotton-duck', 'denim', 'linen'],
      notions,
      thread: 'poly-all',
      needle: 'universal-90',
      stitches: ['straight-3', 'topstitch'],
      notes: [
        'Pre-wash fabric before cutting — canvas and denim shrink 3–5%',
        'Use topstitch thread and a jeans needle for visible stitching on heavy fabrics',
        isBib ? 'Reinforce bib-to-waist junction with bar tacks or an X-stitch box' : '',
        'Turn and {press} tie edges before topstitching for a clean finish',
        'Double-fold all raw edges: fold under ¼″, then ½″, {press}, {topstitch}',
        'Attach waist ties at side edges, sandwiching between body layers or topstitching on',
      ].filter(Boolean),
    });
  },

  instructions(m, opts) {
    const steps = [];
    let n = 1;
    const isBib = opts.style === 'bib';

    steps.push({ step: n++, title: 'Cut all pieces', detail: 'Cut apron body, waist ties, and pocket (if applicable). Transfer any markings for pocket placement.' });

    steps.push({ step: n++, title: 'Finish apron edges', detail: 'Double-fold all raw edges of apron body: fold under ¼″ then ½″, {press}, {topstitch}. Start with sides, then hem. Leave waist/top edge raw for now.' });

    if (opts.pocket !== 'none') {
      steps.push({ step: n++, title: 'Prepare and attach pocket', detail: `Fold top edge of pocket under ½″ twice, {topstitch}. {press} remaining edges under ½″. Position centered on apron body, ${isBib ? '4″ below waistline' : '3″ below top edge'}. {topstitch} sides and bottom close to edge. Bar tack top corners.${opts.pocket === 'divided' ? ' Topstitch 2 vertical dividing lines at equal ⅓ intervals.' : ''}` });
    }

    steps.push({ step: n++, title: 'Make waist ties', detail: 'Fold each tie strip in half lengthwise {RST}. Sew long edge and one short end. Turn right side out using a safety pin or bodkin. {press} flat with seam centered on back.' });

    if (isBib) {
      steps.push({ step: n++, title: 'Make neck strap', detail: 'Fold neck strap in half lengthwise {RST}. Sew long edge. Turn right side out. {press} flat. Sew raw ends to top corners of bib, sandwiching between layers or topstitching firmly.' });
    }

    steps.push({ step: n++, title: 'Attach waist ties', detail: `Pin raw end of each tie to ${isBib ? 'waist-level side edge of apron body' : 'top corner of apron body'}, {RST}. Sew across with ½″ seam. Fold tie outward, {topstitch} across junction for strength.` });

    if (isBib) {
      steps.push({ step: n++, title: 'Finish top edge', detail: 'Fold top edge of bib under ½″ twice. {press} and {topstitch}. Ensure neck strap attachment is secure.' });
    } else {
      steps.push({ step: n++, title: 'Finish waist edge', detail: 'Fold top (waist) edge under ½″ twice. {press} and {topstitch}.' });
    }

    steps.push({ step: n++, title: 'Final press', detail: '{press} entire apron. Try on and adjust neck strap length if needed.' });

    return steps;
  },
};
