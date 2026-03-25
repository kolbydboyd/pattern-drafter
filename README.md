# People's Patterns

Made-to-measure sewing patterns, generated entirely in the browser. Input your measurements, choose your garment type and options, and get printable 1:1 scale patterns with full construction notes.

**[peoplespatterns.com](https://peoplespatterns.com) · [@peoplespatterns](https://instagram.com/peoplespatterns)**

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
  engine/
    geometry.js          # Point/path math, bezier curves, SA offset, seam allowance
    upper-body.js        # Upper body block geometry (bodice, armhole, sleeve cap, neckline)
    measurements.js      # Measurement definitions, validation, how-to-measure instructions
    materials.js         # Fabric, notions, thread, needle, stitch database
  garments/
    index.js             # Registry — imports and exports all garment modules
    ── Menswear · Bottoms ──
    cargo-shorts.js
    gym-shorts.js
    swim-trunks.js
    pleated-shorts.js
    straight-jeans.js
    chinos.js
    pleated-trousers.js
    sweatpants.js
    ── Menswear · Tops ──
    tee.js
    camp-shirt.js
    crewneck.js
    hoodie.js
    crop-jacket.js
    ── Womenswear · Bottoms ──
    wide-leg-trouser-w.js
    straight-trouser-w.js
    easy-pant-w.js
    slip-skirt-w.js
    a-line-skirt-w.js
    ── Womenswear · Tops ──
    button-up-w.js
    shell-blouse-w.js
    fitted-tee-w.js
    ── Womenswear · Dresses ──
    shirt-dress-w.js
    wrap-dress-w.js
  ui/
    app.js               # App logic, wizard flow, profile save/load, yardage calc, export
    pattern-view.js      # SVG rendering of pattern pieces (panels, bodices, sleeves, rects)
    measurement-teacher.js  # Inline measurement guide with annotated SVG diagrams
    styles.css
  pdf/
    print-layout.js      # Tiled print-ready HTML output (Letter, 96 dpi, registration marks)
docs/
  GARMENT-MODULE-SPEC.md   # How to add a new garment
  MODULE-STATUS.md         # Per-module interface audit and known issues
```

## How Garment Modules Work

Each garment module exports a standard interface:

```js
export default {
  id: 'cargo-shorts',
  name: 'Cargo Shorts',
  category: 'lower',            // 'lower' | 'upper' | 'tops' | 'dresses'
  measurements: ['waist', 'hip', 'rise', 'thigh', 'inseam'],
  measurementDefaults: { inseam: 9 },
  options: {
    ease: { type: 'select', values: ['slim','regular','relaxed'], default: 'regular' },
    cargo: { type: 'boolean', default: true },
    // ...
  },
  pieces(measurements, options) {
    // Returns array of pattern pieces.
    // Each piece has: id, name, type, instruction, dimensions, and either
    // polygon points (panel/bodice) or { width, height } (rectangle/pocket).
    return [frontPanel, backPanel, waistband, ...pocketPieces];
  },
  materials(measurements, options) {
    // Returns bill of materials
    return {
      fabrics:  [{ name, weight, quantity, notes }],
      notions:  [{ name, quantity, notes }],
      thread:   { name, weight, notes },
      needle:   { name, use },
      stitches: [{ name, length, width, use }],
      notes:    [],
    };
  },
  instructions(measurements, options) {
    // Returns ordered construction steps
    return [{ step: 1, title: 'Prepare pockets', detail: '...' }, ...];
  },
};
```

Adding a new garment = adding one file to `src/garments/` and one import line in `src/garments/index.js`.

## Garment Modules

### Menswear · Bottoms (8)
| Module | Garment | Status |
|---|---|---|
| `cargo-shorts` | Cargo Shorts | ✅ |
| `gym-shorts` | Gym Shorts | ✅ |
| `swim-trunks` | Swim Trunks | ✅ |
| `pleated-shorts` | Pleated Shorts | ✅ |
| `straight-jeans` | Straight Jeans | ✅ |
| `chinos` | Chinos | ✅ |
| `pleated-trousers` | Pleated Trousers | ✅ |
| `sweatpants` | Sweatpants | ✅ |

### Menswear · Tops (5)
| Module | Garment | Status |
|---|---|---|
| `tee` | T-Shirt | ✅ |
| `camp-shirt` | Camp Shirt | ✅ |
| `crewneck` | Crewneck Sweatshirt | ✅ |
| `hoodie` | Hoodie | ✅ |
| `crop-jacket` | Crop Jacket | ✅ |

### Womenswear · Bottoms (5)
| Module | Garment | Status |
|---|---|---|
| `wide-leg-trouser-w` | Wide-Leg Trouser | ✅ |
| `straight-trouser-w` | Straight Trouser | ✅ |
| `easy-pant-w` | Easy Pant | ✅ |
| `slip-skirt-w` | Slip Skirt | ✅ |
| `a-line-skirt-w` | A-Line Skirt | ✅ |

### Womenswear · Tops (3)
| Module | Garment | Status |
|---|---|---|
| `button-up-w` | Button-Up Shirt | ✅ |
| `shell-blouse-w` | Shell Blouse | ✅ |
| `fitted-tee-w` | Fitted Tee | ✅ |

### Womenswear · Dresses (2)
| Module | Garment | Status |
|---|---|---|
| `shirt-dress-w` | Shirt Dress | ✅ |
| `wrap-dress-w` | Wrap Dress | ✅ |

See `docs/MODULE-STATUS.md` for a full interface audit and known issues per module.

## Features

### Pattern output — every garment produces
- **Pattern pieces** — SVG at true scale with seam allowances, hem allowances, grain lines, notches, cut instructions
- **Materials** — Recommended fabrics, yardage at 45″ and 58–60″ widths, notions list, thread, needle type, stitch guide
- **Instructions** — Numbered construction steps with technique notes

### App
- **4-step flow** — Choose garment → Enter measurements → Set options → View pattern
- **Saved measurement profiles** — Name and save multiple sets (e.g. "Me", "Client A")
- **Measurement guide** — Inline how-to-measure instructions and SVG diagrams for every field
- **Fabric yardage calculator** — Strip-packing estimate at two fabric widths with 10% buffer
- **Rise presets** — Low / mid / high / ultra-high presets on all trousers and shorts
- **Style reference labels** — Every option includes a plain-English reference string
- **Print layout** — Print-ready tiled output at true scale with piece labels and SA key
- **Dark mode** — Persistent light/dark toggle via localStorage

## Engine

| Module | Purpose |
|---|---|
| `geometry.js` | Bezier curves, polygon offsetting, SVG path output, leg shapes, ease values |
| `upper-body.js` | Armhole, shoulder, neckline, sleeve cap curves from standard drafting rules |
| `measurements.js` | Measurement schema (13 fields), labels, instructions, validation, garment categories |
| `materials.js` | Fabric, thread, needle, stitch, notions database used by all garment modules |

Standard drafting rules used:
- Neck width = neck circumference / 6
- Armhole level (scye depth) = chest / 4 + style tolerance
- Back neck depth = neck width / 3
- Sleeve cap height 5 – 6.5 inches depending on garment type
- Chest ease: front 55%, back 45%

## Tech Stack

- **Vite** — dev server + build
- **Vanilla JS** — no framework, ES modules throughout
- **SVG** — all pattern rendering
- No backend. Runs entirely in the browser.

## Development with Claude Code

```bash
npm install -g @anthropic-ai/claude-code
cd peoples-patterns
claude
```

## License

MIT
