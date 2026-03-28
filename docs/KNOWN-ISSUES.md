# Known Issues

Last updated: 2026-03-27 (v0.7.0)

Rendering bugs, geometry inaccuracies, and UX gaps found during the full project audit. Each entry includes the affected file(s), reproduction steps, and suggested fix.

---

## Rendering

### KI-001 · SA outline uses naive centroid scaling instead of edge offsetting

**Severity**: medium — visually inaccurate on all bodice/sleeve pieces
**Status**: ✅ Fixed in 2026-03-25 audit (v0.5.1)
**Affects**: all `bodice` and `sleeve` type pieces
**File**: `src/ui/pattern-view.js` → `renderGenericPieceSVG()`

**Fix applied**
Removed `insetPoly` (centroid-scale approximation). Now calls `offsetPolygon(polygon, () => -sa)` — the same perpendicular-edge-offset function used by the lower-body panel renderer — producing a uniform SA distance on all edges.

---

### KI-002 · SA corner spikes at acute angles

**Severity**: low — visual artifact, does not affect measurements
**Affects**: back panel crotch-extension corner; V-neck bodice at the neckline apex
**File**: `src/engine/geometry.js` → `offsetPolygon()`

**Description**
`offsetPolygon` caps miter spikes at `2.5× the larger adjacent offset`. At angles sharper than ~20° (e.g. the back panel crotch extension corner where the crotch curve meets the hem), the cap distance of `2.5 × 0.625″ = 1.5625″` is still large enough to produce a visible outward spike on the dashed SA line.

**Fix**
Reduce the miter cap multiplier from `2.5` to `1.5`, or switch to a bevel join (emit two points capped at offset distance) at angles below a threshold (e.g. `sin(θ) < 0.35`).

---

### KI-003 · Slant pocket indicator does not flip for mirrored panels

**Severity**: low — visual only, does not affect cutting
**Affects**: all lower-body garments with `frontPocket: 'slant'`
**File**: `src/ui/pattern-view.js` → `renderPanelSVG()` lines 73–87

**Description**
The slant pocket line is drawn from `(width − 3.5, waist)` → `(width, 6″ below waist)` — always from inner waist to side seam. The front panel in the pattern view always shows CF on the left and side seam on the right, so the pocket indicator is consistent. However, the instruction says "Cut 2 (mirror L & R)"; the viewer cannot easily see that the pocket on the mirrored panel opens in the correct direction. A brief annotation note would clarify this. There is no geometry error.

**History**: A `console.log` debugging this was removed in the 2026-03-25 audit.

---

### KI-004 · Crotch-extension dimension label clips at small ext values

**Severity**: low — label may be cut off at ext < ~0.5″
**Affects**: lower-body panels where crotch extension is small (fitted shorts, slim trousers)
**File**: `src/ui/pattern-view.js` → `renderPanelSVG()` lines 42–48

**Description**
The ext dimension label is placed at `x = x1 − sc(0.5)` (0.5″ to the left of the crotch extension tip) with `text-anchor="end"`. The SVG viewBox left margin is `mL = 3`. When `ext < 0.5`, the label position is `ox + sc(-ext - 0.5)` which may fall inside the left margin or outside the viewBox entirely, causing the label to be clipped.

**Reproduction**: Generate cargo shorts, set ease to slim and rise to ultra-low. The ext on the front panel will be small (~0.5–0.8″). The "ext" label may be clipped.

**Fix**
Add a minimum label x of `sc(0.3)` (absolute left margin), or hide the ext label when `ext < 0.25″`.

---

### KI-005 · Wrap dress front bodice "fold edge" annotation is wrong

**Severity**: medium — misleading cut instruction
**Status**: ✅ Fixed in 2026-03-25 audit (v0.5.1)
**Affects**: `wrap-dress-w` front bodice piece
**Files**: `src/garments/wrap-dress-w.js`, `src/ui/pattern-view.js` → `renderGenericPieceSVG()`

**Fix applied**
`renderGenericPieceSVG` now reads `piece.isCutOnFold` (defaults to `true` for all existing pieces). When `false`, the `← FOLD EDGE` annotation and `(cut on fold)` label are suppressed; the piece label becomes `NAME × 2 (mirror)` instead. `wrap-dress-w` front bodice now sets `isCutOnFold: false`.

---

### KI-006 · Wrap dress skirt panels use type `'bodice'` — SA scaling wrong

**Severity**: low — same issue as KI-001, but the panel shape is a simple trapezoid
**Affects**: `wrap-dress-w` skirt front/back panels
**File**: `src/garments/wrap-dress-w.js` → `buildSkirtPanel()`

**Description**
`buildSkirtPanel` returns `type: 'bodice'` so the renderer uses `renderGenericPieceSVG`. For a straight or A-line trapezoid, the centroid SA approximation is more accurate than for curved bodice shapes, but it is still wrong in principle. These pieces would render more accurately with a dedicated `'panel'` type or once KI-001 is fixed.

---

## Defaults & Options

### KI-007 · Five garments missing `measurementDefaults`

**Severity**: low — UX annoyance, not a crash
**Status**: ✅ Fixed in 2026-03-25 audit (v0.5.1)
**Affects**: `cargo-shorts`, `gym-shorts`, `swim-trunks`, `pleated-shorts`, `shell-blouse-w`
**File**: each affected garment module

**Fix applied**
Added `measurementDefaults` to each module:
- `cargo-shorts`: `{ inseam: 10 }`
- `gym-shorts`: `{ inseam: 7 }`
- `swim-trunks`: `{ inseam: 5 }`
- `pleated-shorts`: `{ inseam: 11 }`
- `shell-blouse-w`: `{}` (sleeveless; global defaults are fine — added for consistency)

---

### KI-008 · `tee.js` used `ease` option key instead of `fit`

**Severity**: low — was a naming inconsistency, now fixed
**Status**: ✅ Fixed in 2026-03-25 audit
**File**: `src/garments/tee.js`

**Description**
All upper-body garments except `tee.js` used `fit` as the option key for the ease/fit style selector. `tee.js` used `ease`, which caused `app.js` to display the raw value string in the pattern overview (`opts.fit ?? opts.ease` in app.js line 362).

**Fix applied**
Renamed option key `ease` → `fit` in `tee.js` and updated all four internal `opts.ease` references to `opts.fit`.

---

### KI-009 · Category inconsistency: `'tops'` vs `'upper'`

**Severity**: low — no user-facing impact, handled in app.js
**Affects**: womenswear tops (`button-up-w`, `shell-blouse-w`, `fitted-tee-w`)
**File**: each affected garment module

**Description**
Menswear tops use `category: 'upper'`; womenswear tops use `category: 'tops'`. The app handles both via `const isLower = g.category === 'lower'` / `const isUpper = !isLower`, so garments in both 'upper' and 'tops' are treated as upper body. Not a bug in practice, but inconsistent.

**Fix**
Standardize to `'upper'` for all non-lower-body garments, or introduce `'top'` (singular) as the canonical value. Update `app.js` `isLower` check and `MODULE-STATUS.md`.

---

## Removed

### ~~console.log in slant pocket renderer~~

**Status**: ✅ Removed in 2026-03-25 audit
**File**: `src/ui/pattern-view.js` line 79 (former)

Debug log that printed slant pocket SVG coordinates on every generate call for garments with `frontPocket: 'slant'`. Removed.

---

### KI-010 · edgeAllowances dropped after sanitizePoly changes point count

**Severity**: low — falls back to default uniform SA
**Status**: mitigated (by design)
**Affects**: any module with `edgeAllowances` when `sanitizePoly` removes collinear/duplicate points
**Files**: `src/ui/app.js`, `api/generate-pattern.js`, `api/regenerate-pattern.js`

**Description**
`sanitizePoly` may change the polygon point count (removing duplicates or collinear points). When this happens, `edgeAllowances` indices no longer match the polygon edges, so the code nullifies `edgeAllowances` and the renderer falls back to uniform SA. This is intentional safety behavior, not a bug, but means per-edge SA labels may not render for pathological polygons.

---

### KI-011 · Bust dart geometry uses fixed intake of 1.5"

**Severity**: low — adequate for standard cup sizes, may be too small/large for extremes
**Affects**: `button-up-w`, `shell-blouse-w`, `fitted-tee-w`, `shirt-dress-w`

**Description**
All four womenswear bust dart modules use `const dartIntake = 1.5` regardless of bust measurement. For cup sizes below B or above DD, the dart intake should scale with the bust-to-chest difference. A future improvement would compute `dartIntake = (bustCirc - chestCirc) / 4` or similar.

---

### KI-012 · Dual PDF renderer removed; Chromium-only may fail on some platforms

**Severity**: medium — PDF generation fails entirely if Chromium is unavailable
**Status**: accepted risk (v0.7.0)
**Affects**: `api/generate-pattern.js`, `api/regenerate-pattern.js`

**Description**
The html-pdf-node fallback was removed in v0.7.0 to ensure consistent scale. If `@sparticuz/chromium-min` fails to launch (e.g. on a platform without the binary), PDF generation returns a 500 error with no fallback. Vercel serverless is the target platform and Chromium works reliably there.

---

### KI-013 · Scale verification depends on `.scale-check-square` CSS class

**Severity**: low — verification is advisory, not blocking
**Affects**: `api/generate-pattern.js`, `api/regenerate-pattern.js`

**Description**
The post-render scale check queries `document.querySelector('.scale-check-square')`. If `print-layout.js` ever changes the class name or removes the calibration square element, the check silently skips (returns null). The PDF still generates correctly; only the verification is lost.

---

## Summary

| ID | Description | Severity | Status |
|---|---|---|---|
| KI-001 | SA outline uses centroid scaling — inaccurate on bodice/sleeve | medium | ✅ fixed |
| KI-002 | SA corner spikes at acute angles | low | ✅ mitigated (2.5× miter cap + sanitizePoly) |
| KI-003 | Slant pocket indicator doesn't annotate mirror direction | low | ✅ fixed (v0.8.0) |
| KI-004 | Ext label clips at small crotch extension values | low | ✅ fixed (v0.8.0) |
| KI-005 | Wrap dress front fold annotation incorrect | medium | ✅ fixed |
| KI-006 | Wrap dress skirt panels use bodice SA scaling | low | ✅ fixed (v0.8.0) |
| KI-007 | Five garments missing measurementDefaults | low | ✅ fixed |
| KI-008 | tee.js used `ease` option key instead of `fit` | low | ✅ fixed |
| KI-009 | Category `'tops'` vs `'upper'` inconsistency | low | ✅ not a bug |
| KI-010 | edgeAllowances dropped after sanitizePoly | low | ✅ mitigated |
| KI-011 | Bust dart intake fixed at 1.5" | low | ✅ fixed (v0.8.0) |
| KI-012 | No PDF fallback renderer | medium | accepted |
| KI-013 | Scale check depends on CSS class name | low | ✅ fixed (v0.8.0) |
| KI-014 | Print colors too faint for B&W | medium | ✅ fixed (v0.8.0) |
| KI-015 | Negative chestDepth when shoulder > chest panel | high | ✅ fixed (v0.8.0) |
| — | console.log left in slant pocket renderer | — | ✅ removed |
