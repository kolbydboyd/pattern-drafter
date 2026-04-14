// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Scrunchie — beginner lead-magnet accessory.
 * One fabric rectangle, one piece of elastic. No body measurements needed.
 * All measurements in inches. Seam allowance computed by the engine.
 */

import { fmtInches } from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

const PRESETS = {
  standard:   { fabricLen: 22, elasticLen: 9  },
  mini:       { fabricLen: 16, elasticLen: 7  },
  oversized:  { fabricLen: 28, elasticLen: 11 },
};

const FABRIC_WIDTH = 4.5; // cut width (folded in half = 2.25" finished tube)

export default {
  id: 'scrunchie',
  name: 'Scrunchie',
  category: 'accessory',
  difficulty: 'beginner',
  priceTier: 'simple',
  measurements: [], // no body measurements needed

  options: {
    size: {
      type: 'select', label: 'Size',
      values: [
        { value: 'standard',  label: 'Standard (22″ fabric)',  reference: 'everyday, most popular' },
        { value: 'mini',      label: 'Mini (16″ fabric)',      reference: 'kids, stacking' },
        { value: 'oversized', label: 'Oversized (28″ fabric)', reference: 'thick hair, puffy look' },
      ],
      default: 'standard',
    },
    elasticWidth: {
      type: 'select', label: 'Elastic width',
      values: [
        { value: 0.25, label: '¼″ braided (standard)' },
        { value: 0.375, label: '⅜″ braided (extra hold)' },
      ],
      default: 0.25,
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
    const pre = PRESETS[opts.size] ?? PRESETS.standard;
    const { fabricLen, elasticLen } = pre;
    const elasticW = parseFloat(opts.elasticWidth);

    return [
      {
        id: 'scrunchie-fabric',
        name: 'Scrunchie Fabric Rectangle',
        instruction: `Cut 1 · ${fmtInches(fabricLen)} long × ${fmtInches(FABRIC_WIDTH)} wide`,
        type: 'rectangle',
        dimensions: { length: fabricLen, width: FABRIC_WIDTH },
        sa,
        dims: [
          { label: fmtInches(fabricLen) + ' length', x1: 0, y1: -0.5, x2: fabricLen, y2: -0.5, type: 'h' },
          { label: fmtInches(FABRIC_WIDTH) + ' width', x: fabricLen + 0.6, y1: 0, y2: FABRIC_WIDTH, type: 'v' },
        ],
      },
      {
        id: 'elastic',
        name: 'Elastic',
        instruction: `Cut 1 · ${fmtInches(elasticLen)} long × ${fmtInches(elasticW)} wide braided elastic`,
        type: 'rectangle',
        dimensions: { length: elasticLen, width: elasticW },
        sa: 0,
      },
    ];
  },

  materials(m, opts) {
    const pre = PRESETS[opts.size] ?? PRESETS.standard;
    const elasticW = parseFloat(opts.elasticWidth);
    const elasticLabel = elasticW === 0.25 ? '¼″' : '⅜″';

    return buildMaterialsSpec({
      fabrics: ['cotton-quilting', 'satin', 'velvet', 'knit-jersey', 'cotton-lawn'],
      notions: [
        { name: `${elasticLabel} braided elastic`, quantity: `${fmtInches(pre.elasticLen)}` },
      ],
      thread: 'poly-all',
      needle: 'universal-75',
      stitches: ['straight-2.5'],
      notes: [
        `Fabric rectangle: ${fmtInches(pre.fabricLen)} long × ${fmtInches(FABRIC_WIDTH)} wide.`,
        'Any fabric works. Satin and velvet give a luxe look. Quilting cotton is easiest to sew.',
        'Scrap-friendly. One scrunchie uses less than a quarter yard.',
        'Use a safety pin or bodkin to turn the tube right side out.',
      ],
    });
  },

  instructions(m, opts) {
    const pre = PRESETS[opts.size] ?? PRESETS.standard;
    const sa = parseFloat(opts.sa);
    const saLabel = sa === 0.25 ? '¼″' : '⅜″';
    const steps = [];
    let n = 1;

    steps.push({
      step: n++, title: 'Fold and sew the tube',
      detail: `Fold the fabric rectangle in half lengthwise, right sides together. Pin along the long raw edge. Sew the long edge with a ${saLabel} seam allowance, leaving both short ends open. Do not press yet.`,
    });

    steps.push({
      step: n++, title: 'Turn right side out',
      detail: 'Attach a safety pin to one short end and push it through the tube to turn the fabric right side out. Remove the safety pin. The seam should now be inside the tube. {press} lightly.',
    });

    steps.push({
      step: n++, title: 'Insert the elastic',
      detail: `Attach a safety pin to one end of the elastic. Thread the elastic through the fabric tube, being careful not to twist it. Let both ends of the elastic extend about 1″ out of each end of the tube.`,
    });

    steps.push({
      step: n++, title: 'Overlap and sew elastic ends',
      detail: `Overlap the two elastic ends by about ½″. Sew across the overlapped elastic with a zigzag stitch or sew a small box stitch. Pull on the elastic to make sure the join is secure.`,
    });

    steps.push({
      step: n++, title: 'Close the tube',
      detail: `Tuck one raw short end of the fabric tube inside the other. Overlap by about ½″. The elastic will naturally pull the tube into a circle. Pin and hand-stitch or machine-stitch the opening closed, catching all layers. Alternatively, overlap the ends and sew across with a straight stitch. Your scrunchie is complete.`,
    });

    return steps;
  },

  variants: [
    { id: 'mini-scrunchie',      name: 'Mini Scrunchie',      defaults: { size: 'mini' } },
    { id: 'oversized-scrunchie', name: 'Oversized Scrunchie', defaults: { size: 'oversized' } },
  ],
};
