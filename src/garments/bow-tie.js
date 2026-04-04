// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Bow Tie — flat accessory pattern.
 * Three rectangles: bow body, center knot wrap, neckband/strap.
 * Self-tie or pre-tied option. Only measurement needed: neck circumference.
 */

import { fmtInches } from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

export default {
  id: 'bow-tie',
  name: 'Bow Tie',
  category: 'accessory',
  difficulty: 'beginner',
  priceTier: 'simple',
  measurements: ['neck'],
  measurementDefaults: {},

  options: {
    bowWidth: {
      type: 'select', label: 'Bow width',
      values: [
        { value: 'slim',      label: 'Slim (2″)',     reference: 'modern, skinny tie'   },
        { value: 'standard',  label: 'Standard (2.5″)', reference: 'classic, versatile' },
        { value: 'butterfly', label: 'Butterfly (3″)',  reference: 'formal, wide'        },
      ],
      default: 'standard',
    },
    style: {
      type: 'select', label: 'Style',
      values: [
        { value: 'self-tie', label: 'Self-tie (traditional)',  reference: 'classic, adjustable' },
        { value: 'pre-tied', label: 'Pre-tied (easy)',         reference: 'clip-on, fixed bow'  },
      ],
      default: 'self-tie',
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
    const bowWidths = { slim: 2, standard: 2.5, butterfly: 3 };
    const finishedW = bowWidths[opts.bowWidth] ?? 2.5;

    // Bow body: finished width × 2 (folded), length = typical bow span
    const bowCutW = finishedW * 2 + sa * 2;
    const bowCutL = finishedW * 2 + 4; // bow length (each wing = half)

    // Center knot wrap
    const knotW = finishedW + 0.5;
    const knotL = finishedW * 2 + 1;

    // Neckband/strap
    const strapL = opts.style === 'self-tie'
      ? m.neck + 6  // self-tie needs extra length to tie
      : m.neck + 2; // pre-tied just needs to go around neck + overlap
    const strapW = 1.5; // cut width; finishes to ~0.5" strap

    const pieces = [];

    // Bow body
    pieces.push({
      id: 'bow-body', name: 'Bow Body',
      instruction: `Cut 1 on bias · ${fmtInches(bowCutL)} long × ${fmtInches(bowCutW)} wide · Fold in half lengthwise {WST}, sew long edge, turn, {press} with seam centered on back`,
      type: 'rectangle',
      dimensions: { length: bowCutL, width: bowCutW },
      grainAngle: 45,
      sa,
    });

    // Center knot wrap
    pieces.push({
      id: 'knot-wrap', name: 'Center Knot',
      instruction: `Cut 1 on bias · ${fmtInches(knotL)} long × ${fmtInches(knotW)} wide · Fold in thirds lengthwise, {press} · Wraps around gathered center of bow`,
      type: 'rectangle',
      dimensions: { length: knotL, width: knotW },
      grainAngle: 45,
      sa: 0,
    });

    // Neckband/strap
    if (opts.style === 'self-tie') {
      // Self-tie: two shaped ends that form the bow when tied
      pieces.push({
        id: 'neckband', name: 'Neckband',
        instruction: `Cut 1 · ${fmtInches(strapL)} long × ${fmtInches(strapW)} wide · Fold lengthwise, sew, turn · Both ends stay open for tying`,
        type: 'rectangle',
        dimensions: { length: strapL, width: strapW },
        sa,
      });
    } else {
      // Pre-tied: strap with closure
      pieces.push({
        id: 'neckband', name: 'Neckband',
        instruction: `Cut 1 · ${fmtInches(strapL)} long × ${fmtInches(strapW)} wide · Fold lengthwise, sew, turn · Attach hook-and-eye or adjustable slider at ends`,
        type: 'rectangle',
        dimensions: { length: strapL, width: strapW },
        sa,
      });
    }

    return pieces;
  },

  materials(m, opts) {
    const notions = [];
    if (opts.style === 'pre-tied') {
      notions.push({ name: 'Hook-and-eye closure or adjustable slider', quantity: '1 set', notes: 'For neckband closure' });
    }

    return buildMaterialsSpec({
      fabrics: ['silk', 'cotton-shirting', 'linen', 'wool-suiting'],
      notions,
      thread: 'poly-all',
      needle: 'universal-70',
      stitches: ['straight-2'],
      notes: [
        'Cut on the bias for a smoother drape and more natural bow shape',
        'Use lightweight fabric — heavy fabrics make bulky knots',
        '{press} all seams open before turning for crisp edges',
        'Turn tubes right-side out with a loop turner, safety pin, or chopstick',
        'Starch lightly for a crisper bow that holds its shape',
        opts.style === 'self-tie'
          ? 'Search "how to tie a bow tie" for tying tutorials — it takes practice!'
          : 'Gather center of bow body with a running stitch, wrap knot piece around, hand-stitch closed on back',
      ],
    });
  },

  instructions(m, opts) {
    const steps = [];
    let n = 1;

    steps.push({ step: n++, title: 'Cut all pieces', detail: 'Cut bow body, center knot, and neckband. Cut on the bias if possible for better drape.' });

    steps.push({ step: n++, title: 'Sew bow body', detail: 'Fold bow body in half lengthwise {RST}. Sew long edge with ¼″ SA. Turn right side out. {press} flat with seam centered on back.' });

    steps.push({ step: n++, title: 'Sew neckband', detail: 'Fold neckband in half lengthwise {RST}. Sew long edge. Turn right side out. {press} flat.' });

    if (opts.style === 'pre-tied') {
      steps.push({ step: n++, title: 'Form the bow', detail: 'Fold bow body ends toward center, overlapping by 1″. Pinch center to create bow shape. Run a gathering stitch through center if desired.' });

      steps.push({ step: n++, title: 'Attach center knot', detail: 'Fold knot piece in thirds lengthwise. Wrap tightly around gathered center of bow. Hand-stitch closed on back, catching the neckband in the wrap.' });

      steps.push({ step: n++, title: 'Attach neckband closure', detail: 'Sew hook to one end of neckband and eye to the other, or install adjustable slider hardware. The bow should slide freely on the neckband.' });
    } else {
      steps.push({ step: n++, title: 'Prepare center knot', detail: 'Fold knot piece in thirds lengthwise, {press}. Set aside — this wraps around the tied bow knot for a clean finish (optional decorative use).' });

      steps.push({ step: n++, title: 'Attach neckband to bow', detail: 'Thread neckband through the center knot wrap. The knot wrap sits at center back of neck. Tie bow at front.' });
    }

    steps.push({ step: n++, title: 'Finish', detail: '{press} gently with a pressing cloth. For silk, use low heat with no steam.' });

    return steps;
  },
};
