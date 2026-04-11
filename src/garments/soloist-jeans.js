// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Soloist Jeans — Straight jeans with the Soloist aesthetic.
 * Inspired by Takahiromiyashita The Soloist silhouette.
 * Delegates all construction to straight-jeans.js with Soloist defaults.
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
  measurementDefaults: straightJeans.measurementDefaults,

  options: {
    ...straightJeans.options,
    ease:       { ...straightJeans.options.ease,        default: 'regular'  },
    legShape:   { ...straightJeans.options.legShape,    default: 'straight' },
    riseStyle:  { ...straightJeans.options.riseStyle,   default: 'mid'      },
    frontPocket:{ ...straightJeans.options.frontPocket,  default: 'square-scoop' },
    yokeStyle:  { ...straightJeans.options.yokeStyle,   default: 'pointed'  },
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
