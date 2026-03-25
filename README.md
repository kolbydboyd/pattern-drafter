# Pattern Drafter

A web-based tool that generates custom sewing patterns from body measurements. Input your measurements, choose your garment type and options, and get printable 1:1 scale patterns with full construction notes.

## Quick Start

```bash
npm install
npm run dev     # local dev server at localhost:5173
npm run build   # production build to /dist
```

Deploy: push to GitHub, connect to [Vercel](https://vercel.com) (free tier), auto-deploys on every push.

## Architecture

```
src/
  engine/         # Core geometry math (shared across all garments)
    measurements.js   # Measurement definitions, validation, how-to-measure instructions
    geometry.js       # Point/path math, bezier curves, SA offset, seam allowance
    materials.js      # Fabric, notions, thread, needle recommendations per garment
  garments/       # Each garment is a self-contained module
    _base-lower.js    # Lower body block (shared: shorts, pants, skirts)
    _base-upper.js    # Upper body block (shared: tees, shirts, jackets)
    cargo-shorts.js
    gym-shorts.js
    swim-trunks.js
    pleated-shorts.js
    straight-jeans.js
    chinos.js
    pleated-trousers.js
    sweatpants.js
    tee.js
    camp-shirt.js
    crewneck.js
    hoodie.js
    crop-jacket.js
    a-line-skirt.js
    pencil-skirt.js
    pleated-skirt.js
    shift-dress.js
  ui/             # Interface components
    input-form.js     # Measurement inputs, garment selector, options
    pattern-view.js   # SVG rendering of pattern pieces
    materials-panel.js # Fabric/notions/stitch info display
  pdf/            # Print output
    tiler.js          # Tiled PDF generation with registration marks
    large-format.js   # Single-sheet large format export
public/
  index.html
docs/
  GARMENT-MODULE-SPEC.md  # How to add a new garment
```

## How Garment Modules Work

Each garment module exports a standard interface:

```js
export default {
  id: 'cargo-shorts',
  name: 'Cargo Shorts',
  category: 'lower',           // uses lower body block
  measurements: ['waist', 'hip', 'rise', 'thigh', 'inseam'],
  options: {
    ease: { type: 'select', values: ['slim','regular','relaxed'], default: 'regular' },
    frontPocket: { type: 'select', values: ['none','slant','side-seam'], default: 'slant' },
    cargo: { type: 'boolean', default: true },
    // ...
  },
  pieces(measurements, options) {
    // Returns array of pattern pieces, each with:
    // - points/paths (geometry)
    // - labels, dimensions, grain line
    // - SA offset
    return [frontPanel, backPanel, waistband, ...pocketPieces];
  },
  materials(measurements, options) {
    // Returns bill of materials
    return {
      fabric: [{ name: 'Cotton twill or gabardine', weight: '8-10 oz', quantity: '1.75 yards' }],
      notions: [{ name: '1.5" woven elastic', quantity: '32"' }, ...],
      thread: { type: 'Polyester all-purpose', color: 'Match fabric' },
      needle: { machine: 'Universal 90/14', hand: 'Sharps size 7' },
      stitch: { seams: 'Straight stitch, 2.5mm length', topstitch: 'Straight, 3mm', finish: 'Zigzag or serge raw edges' },
    };
  },
  instructions() {
    // Returns ordered construction steps
    return [ 'Prepare pockets...', 'Sew crotch seams...', ... ];
  }
};
```

Adding a new garment = adding one file to `src/garments/`. The engine and UI handle everything else.

## Garment Roadmap

### Lower Body Block
- [x] Cargo shorts
- [x] Basic pants (straight, slim, bootcut, wide)
- [x] Pleated trousers (high waist, wide leg)
- [ ] Gym shorts (no cargo, drawstring)
- [ ] Swim trunks (mesh liner, shorter inseam)
- [ ] Pleated shorts
- [ ] Straight jeans (5-pocket, zip fly)
- [ ] Chinos (slash pocket, welt back)
- [ ] Sweatpants (ribbed cuff, drawstring)

### Upper Body Block
- [ ] Tee (crew neck, set-in sleeve)
- [ ] Camp/bowling shirt (open collar, short sleeve, button front)
- [ ] Crewneck sweatshirt (raglan or set-in, ribbed cuffs/hem)
- [ ] Hoodie (kangaroo pocket, drawstring hood)
- [ ] Crop Carhartt-style jacket (chore coat, patch pockets)

### Skirts & Dresses
- [ ] A-line skirt
- [ ] Pencil skirt (with kick pleat)
- [ ] Pleated skirt
- [ ] Shift dress (upper block + a-line)

### Features
- [x] SVG pattern output with dimensions
- [x] Seam allowance offset
- [x] Pocket generators (slant, side-seam, cargo, patch, welt)
- [x] Fly option (zip, button, none)
- [x] Leg shape (skinny, slim, straight, bootcut, wide)
- [x] Pleat support
- [x] Tiled PDF output for home printing
- [ ] Large format single-sheet PDF
- [x] Materials/notions/stitch info on pattern
- [ ] Construction instructions on pattern
- [ ] Grading (scale pattern across sizes for production)

## Materials System

Each pattern includes:
- **Fabric**: type, weight, quantity, pre-treatment notes
- **Notions**: elastic, zippers, buttons, interfacing, webbing, snaps
- **Thread**: type (poly, cotton, heavy-duty) and color guidance
- **Needle**: machine needle type/size, hand needle if needed
- **Stitch settings**: stitch type, length, width for each operation
- **Special notes**: e.g. "use ballpoint needle for knits", "interface waistband before cutting"

## Tech Stack

- **Vite** — dev server + build
- **Vanilla JS** — no framework needed, keeps it simple
- **SVG** — pattern rendering
- **jsPDF** (future) — client-side PDF generation
- No backend. Everything runs in the browser. Free to host.

## Development with Claude Code

```bash
npm install -g @anthropic-ai/claude-code
cd pattern-drafter
claude
```

Claude Code can read the full project, understand the module architecture, and add/edit individual garment files without touching anything else.

## License

MIT
