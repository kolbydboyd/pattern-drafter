# Changelog

All notable changes are documented here, newest first.

---

## [0.5.0] — 2026-03-25

### Engine — upper body block rewritten to standard drafting rules
- `upper-body.js` fully rewritten: scye depth now uses `chest/4 + style tolerance` instead of a flat constant; back neck width uses `neck/6`; shoulder slope, neckline curves (crew/v-neck/scoop/boat), armhole curves (back shallow bow, front deep scoop), and sleeve cap curve are now separate exported functions with full JSDoc
- `UPPER_EASE` table: fitted=2, standard=4, relaxed=6, oversized=10 inches
- `chestEaseDistribution()`: front 55%, back 45%
- `armholeDepthFromChest()`: `chest/4` plus per-style tolerance
- `armholeCurve()`: back armhole has slight inward bow; front has deeper forward scoop
- `shoulderSlope()`: straight line as bezier (collinear control points) for pipeline consistency
- `necklineCurve()`: crew, v-neck, scoop, boat — each parametric with documented control point rationale
- `sleeveCapCurve()` / `sleeveCapEase()`: asymmetric cap (back slightly flatter, front slightly fuller); ease computed as bezier arc length minus armhole circumference

---

## [0.4.0] — 2026-03-25

### Bug fix — chest/8 typo in upper body geometry
- Fixed incorrect formula where `chest/8` was used where `chest/4` was intended for scye depth calculation, producing armholes roughly half the correct depth

---

## [0.3.0] — 2026-03-24

### Bug fix — upper body garments crash on generate
- All upper body garments (`tee`, `camp-shirt`, `crewneck`, `hoodie`, `crop-jacket`, `button-up-w`, `shell-blouse-w`, `fitted-tee-w`) were crashing on pattern generation due to missing dimension fields expected by the renderer
- Added required `dimensions` object to all bodice, sleeve, and panel pieces in upper body garments

### Bug fix — pattern view rendering
- Fixed `mR` (margin-right) padding on pattern piece cards
- Slant pocket rendering: corrected pocket-mouth line endpoint calculation
- Extension label (`ext` annotation) was rendering at wrong coordinates
- SA (seam allowance) polygon miter at bottom corners now produces a clean right-angle step instead of an interpolated blend — `offsetPolygon()` now emits two points at step corners

---

## [0.2.0] — 2026-03-24

### Style reference labels on all garment options
- Every garment option dropdown now includes a `ref` string — a plain-English style reference shown in the UI (e.g. "classic, off-the-rack", "workwear", "streetwear/oversized")
- Covers: ease, leg shape, rise, neckline, collar, pocket, fly, and sleeve length options across all 23 modules

### Rise presets on all lower body garments
- Standardised `riseAdjust` option with five presets: ultra-low (−2.5″), low (−1.5″), mid (0), high (+1.5″), ultra-high (+3.0″)
- Applied to all 8 menswear bottoms and all 5 womenswear bottoms

---

## [0.1.0] — 2026-03-23

### 10 womenswear garments added
**Womenswear · Bottoms**
- `wide-leg-trouser-w` — high waist, belt loops, slash pockets
- `straight-trouser-w` — mid rise, slash and back welt pockets
- `easy-pant-w` — elastic waist, tapered leg, side pockets
- `slip-skirt-w` — midi or maxi, side slit
- `a-line-skirt-w` — fitted waist, flared hem, optional lining

**Womenswear · Tops**
- `button-up-w` — collar stand, French placket, short or long sleeve
- `shell-blouse-w` — sleeveless, jewel or scoop neck, side zip
- `fitted-tee-w` — crew/scoop/V neck, set-in sleeve, knit fabric

**Womenswear · Dresses**
- `shirt-dress-w` — button-up bodice, full skirt, collar stand, optional belt
- `wrap-dress-w` — V-neck bodice, A-line skirt, self-tie sash

### Measurement teacher
- `measurement-teacher.js` added: inline SVG diagrams with annotated measurement points for all 13 body measurements; separate lower-body and upper-body schematics

---

## [0.0.4] — 2026-03-22

### Upper body garments — camp shirt, crewneck, hoodie, crop jacket
- `camp-shirt` — camp/open collar, short sleeve, chest patch pockets, relaxed fit
- `crewneck` — dropped shoulder option, kangaroo pocket, ribbed trim
- `hoodie` — drawstring hood, kangaroo pocket, ribbed cuffs and hem
- `crop-jacket` — structured crop, welt pockets, optional lining, flat-fell seam option

### Bug fix — pattern view panel bottom text spacing
- Construction step text was overflowing the SVG panel card; added bottom padding offset

---

## [0.0.3] — 2026-03-22

### First upper body garment — tee
- `tee.js`: crew/V/scoop neckline, short/¾/long sleeve, optional chest pocket, set-in sleeve
- Garment-specific `measurementDefaults` field introduced (sets reasonable inseam/sleeve starting values per garment)
- Pattern view `viewBox` fixed for long-inseam garments — was clipping the hem on inseams > 20″

### Upper body geometry engine
- `upper-body.js` created with armhole, shoulder slope, neckline, and sleeve cap curve functions (initial version; rewrote in 0.5.0)

---

## [0.0.2] — 2026-03-21

### 7 garment modules, print layout, dark mode, profiles, yardage calculator
**Garments**
- `cargo-shorts` — rise preset, cargo pocket, inseam length
- `gym-shorts` — elastic waist, optional liner, inseam
- `swim-trunks` — mesh liner, board short or trunk length
- `pleated-shorts` — single or double pleat, tab waistband
- `straight-jeans` — 5-pocket, fly front, low/mid/high rise
- `chinos` — flat front, slash pockets, back welts
- `pleated-trousers` — double pleat, belt loops, cuffed hem
- `sweatpants` — drawstring waist, ribbed cuffs, side pockets

**App features**
- 4-step wizard flow: Choose garment → Measurements → Options → Pattern
- Dark mode with persistent `localStorage` preference
- Measurement profiles: save/load/delete named profiles via `localStorage`
- Fabric yardage calculator: greedy row-packing at 45″ and 60″ widths, +10% buffer
- Print layout (`print-layout.js`): US Letter tiled output at 1:1 scale (96 dpi) with ¾″ tile overlap, registration crosshairs, scale verification squares, cover sheet, materials and instructions pages

**Engine**
- `geometry.js`: `norm`, `dist`, `cubicBezier`, `sampleBezier`, `crotchCurvePoints`, `offsetPolygon` (miter intersection), `polyToPath`, `fmtInches`, `LEG_SHAPES`, `EASE_VALUES`, `easeDistribution`
- `measurements.js`: 13 measurement fields with labels, instructions, min/max/step/default
- `materials.js`: `FABRIC_TYPES` (40+ entries), `THREAD_TYPES`, `NEEDLE_TYPES`, `STITCH_TYPES`, `STANDARD_NOTIONS`, `buildMaterialsSpec()`

---

## [0.0.1] — 2026-03-20

### Initial commit
- Project scaffolded with Vite 6, ES modules, vanilla JS
- `index.html` entry point
