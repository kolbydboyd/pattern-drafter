// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Soloist Jeans — Straight-jeans base tuned to the Takahiromiyashita silhouette.
 * Straight 501-style leg with mid (body) rise, scoop front pockets, pointed V yoke,
 * shallower front crotch, and deeper back crotch. Inseam runs long for the
 * dragging-hem look. All construction delegates to straight-jeans.js; only
 * defaults change.
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
    ease:        { ...straightJeans.options.ease,        default: 'regular' },
    legShape:    { ...straightJeans.options.legShape,    default: 'straight' },
    riseStyle:   { ...straightJeans.options.riseStyle,   default: 'mid'      },
    frontPocket: { ...straightJeans.options.frontPocket, default: 'scoop'    },
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
