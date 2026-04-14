// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Soloist Jeans — Straight-jeans base tuned to the Takahiromiyashita silhouette.
 * Long, lean, slim leg with a deep back rise, shallower front rise, square-scoop
 * front pockets, and a pointed V yoke. Inseam runs long for the dragging-hem look.
 * All construction delegates to straight-jeans.js; only defaults change.
 */

import straightJeans from './straight-jeans.js';

// ── Module ───────────────────────────────────────────────────────────────────

export default {
  id: 'soloist-jeans',
  name: 'Soloist Jeans',
  category: 'lower',
  difficulty: 'intermediate',
  priceTier: 'core',
  measurements: straightJeans.measurements,
  measurementDefaults: { ...straightJeans.measurementDefaults, inseam: 33 },

  options: {
    ...straightJeans.options,
    ease:        { ...straightJeans.options.ease,        default: 'regular'      },
    legShape:    { ...straightJeans.options.legShape,    default: 'slim'         },
    riseStyle:   { ...straightJeans.options.riseStyle,   default: 'low'          },
    frontPocket: { ...straightJeans.options.frontPocket, default: 'square-scoop' },
    yokeStyle:   { ...straightJeans.options.yokeStyle,   default: 'pointed'      },
    frontExt:    { ...straightJeans.options.frontExt,    default: 1.75           },
    backExt:     { ...straightJeans.options.backExt,     default: 3.25           },
  },

  pieces(m, opts) {
    return straightJeans.pieces(m, opts);
  },

  materials(m, opts) {
    return straightJeans.materials(m, opts);
  },

  instructions(m, opts) {
    return straightJeans.instructions(m, opts);
  },
};
