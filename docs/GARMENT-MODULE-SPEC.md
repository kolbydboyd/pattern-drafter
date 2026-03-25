# How to Add a New Garment Module

Each garment is a single JS file in `src/garments/`. The file exports a default object with a standard interface.

## Required Exports

```js
export default {
  // ── Identity ──
  id: 'my-garment',           // kebab-case unique ID
  name: 'My Garment',         // Display name
  category: 'lower',          // 'lower' | 'upper' | 'skirt' | 'dress'

  // ── Measurements ──
  // Which body measurements this garment needs (from measurements.js)
  measurements: ['waist', 'hip', 'rise', 'thigh', 'inseam'],

  // ── Options ──
  // User-configurable settings specific to this garment
  options: {
    ease: {
      type: 'select',
      label: 'Fit',
      values: [
        { value: 'slim', label: 'Slim (+1.5″)' },
        { value: 'regular', label: 'Regular (+2.5″)' },
      ],
      default: 'regular',
    },
    pocketType: {
      type: 'select',
      label: 'Front pockets',
      values: [
        { value: 'none', label: 'None' },
        { value: 'slant', label: 'Slant' },
      ],
      default: 'slant',
    },
    hasCargo: {
      type: 'boolean',
      label: 'Cargo pockets',
      default: false,
    },
  },

  // ── Pattern Pieces ──
  // Returns an array of piece objects given measurements + options
  pieces(m, opts) {
    return [
      {
        id: 'front',
        name: 'Front Panel',
        instruction: 'Cut 2, mirror L & R',
        polygon: [...],       // array of {x, y} points (inches, no SA)
        saPolygon: [...],     // offset polygon with SA included
        grainLine: { start: {x, y}, end: {x, y} },
        dimensions: [
          { from: {x, y}, to: {x, y}, label: '10″', type: 'horizontal' },
        ],
        labels: [
          { text: 'CENTER SEAM', position: {x, y}, rotation: -90 },
        ],
        pocketIndicators: [...],
      },
      // ...more pieces
    ];
  },

  // ── Materials ──
  // Returns BOM for this garment
  materials(m, opts) {
    return buildMaterialsSpec({
      fabrics: ['cotton-twill'],
      notions: [
        { ref: 'elastic-1.5', quantity: `${m.waist + 1}″` },
        { ref: 'interfacing-med', quantity: '0.5 yard' },
      ],
      thread: 'poly-all',
      needle: 'universal-90',
      stitches: ['straight-2.5', 'zigzag-small', 'bartack'],
      notes: [
        'Pre-wash fabric if natural fiber',
        'Interface waistband BEFORE cutting',
      ],
    });
  },

  // ── Construction Instructions ──
  instructions(m, opts) {
    return [
      { step: 1, title: 'Prepare pockets', detail: 'Sew pocket facings...' },
      { step: 2, title: 'Sew crotch seams', detail: 'Join front panels...' },
      // ...
    ];
  },
};
```

## Base Blocks

For lower-body garments, import the shared block:

```js
import { lowerBodyPanels } from './_base-lower.js';

export default {
  // ...
  pieces(m, opts) {
    // Get standard front/back panels from the block
    const { front, back } = lowerBodyPanels(m, opts);
    // Add garment-specific pieces
    return [front, back, waistband(m, opts), ...pockets(opts)];
  },
};
```

## Testing a New Garment

1. Create the file in `src/garments/`
2. Import it in `src/garments/index.js`
3. Run `npm run dev`
4. Select your garment from the dropdown
5. Verify all pieces render correctly
6. Check materials panel shows correct BOM
7. Export SVG and verify dimensions at 1:1 scale

## Conventions

- All geometry in **inches** (converted to SVG units at render time)
- Seam allowance is computed by the engine, not baked into piece geometry
- Grain lines always run vertically (parallel to selvage)
- Piece polygons use **clockwise** winding
- Label positions in the same coordinate space as piece geometry
