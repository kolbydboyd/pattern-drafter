# Known Issues

Last updated: 2026-03-25 (v0.5.0)

Rendering bugs, geometry inaccuracies, and UX gaps found during the full project audit. Each entry includes the affected file(s), reproduction steps, and suggested fix.

---

## Rendering

### KI-001 · SA outline uses naive centroid scaling instead of edge offsetting

**Severity**: medium — visually inaccurate on all bodice/sleeve pieces
**Affects**: all `bodice` and `sleeve` type pieces
**File**: `src/ui/pattern-view.js` → `renderGenericPieceSVG()` → `insetPoly()`

**Description**
The seam-allowance outline for bodice and sleeve pieces is computed by scaling the polygon about its centroid (`insetPoly`), not by offsetting each edge perpendicularly. This produces a shape that is proportionally smaller/larger but not at a uniform distance from the cut line. The error is most visible on tall narrow pieces (sleeve cap) where the centroid-scale in X and Y diverge significantly.

**Example**
A sleeve piece ~6″ wide × 24″ tall: the centroid Y-scale is `1 + sa / (pH/2) = 1 + 0.5/12 = 1.042`, but the centroid X-scale is `1 + sa / (pW/2) = 1 + 0.5/3 = 1.167`. The SA is shown as ~0.5″ on long edges but ~1″ on short edges.

**Fix**
Replace `insetPoly` with `offsetPolygon` from `src/engine/geometry.js`, using a uniform `edgeOffsetFn` returning `sa` for all edges (or `hem` for the hem edge). `offsetPolygon` is already used and proven correct for the lower-body panel renderer.

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
**Affects**: `wrap-dress-w` front bodice piece
**Files**: `src/garments/wrap-dress-w.js`, `src/ui/pattern-view.js` → `renderGenericPieceSVG()`

**Description**
The wrap dress front bodice polygon extends into negative x (the wrap extension `−wrapExt` to the left of the CF fold line at x=0). `renderGenericPieceSVG` computes the bounding box and places a `← FOLD EDGE` annotation at the leftmost point of the bounding box (`x = mL`). But the leftmost point is the wrap extension edge, NOT the CF fold. The actual CF fold line is at x=0 inside the polygon; there is no fold — the front is cut as two separate pieces.

The annotation text `(cut on fold)` in `pieceLabel` is also wrong for the wrap front: it should be `cut × 2 (mirror)`.

**Fix**
`renderGenericPieceSVG` needs to accept a `foldEdge` prop (or read `piece.isCutOnFold`). Garments that are NOT cut on fold should pass `isCutOnFold: false`. `wrap-dress-w` should set this on its front bodice pieces, and the renderer should suppress both the fold annotation and `(cut on fold)` label text when this flag is false.

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
**Affects**: `cargo-shorts`, `gym-shorts`, `swim-trunks`, `pleated-shorts`, `shell-blouse-w`
**File**: each affected garment module

**Description**
These modules do not declare `measurementDefaults`, so `app.js` falls through to the global `MEASUREMENTS` default values. The global inseam default is `7″`, which is the correct starting value for swim trunks but too short for cargo shorts (better default: 9–10″) and clearly wrong for pleated shorts (better: 10–11″).

**Fix**
Add `measurementDefaults` to each module:
- `cargo-shorts`: `{ inseam: 10 }`
- `gym-shorts`: `{ inseam: 7 }`
- `swim-trunks`: `{ inseam: 5 }`
- `pleated-shorts`: `{ inseam: 11 }`
- `shell-blouse-w`: `{}` (sleeveless; global defaults are fine — just add for consistency)

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

## Summary

| ID | Description | Severity | Status |
|---|---|---|---|
| KI-001 | SA outline uses centroid scaling — inaccurate on bodice/sleeve | medium | open |
| KI-002 | SA corner spikes at acute angles | low | open |
| KI-003 | Slant pocket indicator doesn't annotate mirror direction | low | open |
| KI-004 | Ext label clips at small crotch extension values | low | open |
| KI-005 | Wrap dress front fold annotation incorrect | medium | open |
| KI-006 | Wrap dress skirt panels use bodice SA scaling | low | open |
| KI-007 | Five garments missing measurementDefaults | low | open |
| KI-008 | tee.js used `ease` option key instead of `fit` | low | ✅ fixed |
| KI-009 | Category `'tops'` vs `'upper'` inconsistency | low | open |
| — | console.log left in slant pocket renderer | — | ✅ removed |
