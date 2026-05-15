# How Collars and Lapels Are Drafted

All collar/lapel functions live in `src/engine/upper-body.js` (lines 675–1029). Every function uses the same **local frame**: origin = CF neckline point, x+ = inward toward body (negative x = extension beyond CF), y+ = downward.

---

## 1. Peak Lapel — `peakLapelCurve()` (line 713)

Used by the athletic formal jacket (double-breasted option).

**Key constants (Aldrich/Muller & Sohn conventions):**
- Gorge angle: 15–25° from horizontal (default 20°). Peak lapels have a *flat* gorge.
- Gorge sits 40–50% of the way down the front neckline (`gorgeHeightFrac = 0.45`). Not at CF bottom — this was an early bug that was fixed.
- Lapel width: 3.5–5″ at widest.

**Step-by-step geometry:**
1. **Break point** — `{x: 0, y: breakPointY}`. This is where the lapel starts folding back; sits ~0.5″ above the top button.
2. **Gorge point** — `{x: collarStand, y: neckDepthFront * gorgeHeightFrac}`. Sits `collarStand` (1.25″) inward from CF at 45% of the neckline depth. This is where the collar seam terminates on the front panel.
3. **Peak tip** — Computed by walking outward along the gorge seam direction from the gorge point:
   ```
   peakTip.x = gorgePoint.x − cos(gorgeAngle) × peakExtension
   peakTip.y = gorgePoint.y − sin(gorgeAngle) × peakExtension
   ```
   With default 20° and 4.0″ extension, the tip protrudes to roughly −2.5″ (well past CF) at near-shoulder height.
4. **Polyline** — `[breakPoint → widest point at −lapelWidth → upper outer transition → peakTip → gorgePoint]`. The midpoint of the outer sweep is at `midY = (breakPointY + gorgePoint.y) / 2`, giving the bell shape.

---

## 2. Notched Lapel — `notchedLapelCurve()` (line 783)

Used by the athletic formal jacket (single-breasted option) and the moto jacket.

**Differences from peak:**
- The gorge point sits at the *full* neckline depth (not 45% down) — `gorgePoint.y = neckDepthFront`.
- Steeper gorge angle (default 30°, range 25–40°), creating the characteristic V shape.
- No peak tip; instead a **lapel tip** pointing outward/slightly downward, and a notch cut.

**Step-by-step geometry:**
1. **Gorge point** at `{collarStand, neckDepthFront}` — at the very bottom of the neckline.
2. **Notch outer** — walk `notchDepth` (0.75″) from the gorge point along the gorge angle:
   ```
   notchOuter.x = gorgePoint.x − cos(gorgeAngle) × notchDepth
   notchOuter.y = gorgePoint.y − sin(gorgeAngle) × notchDepth
   ```
3. **Lapel tip** — the outward corner at full `lapelWidth`, with y solved so the gorge seam angle is preserved:
   ```
   lapelTip.x = −lapelWidth
   lapelTip.y = neckDepthFront − (lapelWidth + collarStand) × tan(gorgeAngle)
   ```
4. **Polyline** — `[breakPoint → outer sweep → lapelTip → gorgePoint → notchOuter]`. The `lapelTip` and `notchOuter` (aliased as `notchInner`) together define the V notch.

---

## 3. Shawl Lapel — `shawlLapelFront()` (line 849) + `shawlCollarCurve()` (line 886)

Used by the athletic formal jacket (shawl option). It's a two-piece system.

**Front panel (shawlLapelFront):**
- No gorge, no notch, no peak tip. The lapel outer edge curves *continuously* from the break point, past the widest point, then curves back inward and meets the shoulder-neck junction at `{neckW, 0}`.
- Polyline: `[breakPoint → widest at −lapelWidth → upper outer → just above shoulder baseline → shoulderNeck]`
- The `lapelWidth * 0.75` and `lapelWidth * 0.2` intermediate points control how smoothly the outer edge transitions back to shoulder.

**Back collar (shawlCollarCurve):**
- A separate piece, cut on fold at CB.
- Drafted as a flat curved band. The inner edge follows the back-neck arc at y=0 (straight line across 6 sampled points).
- The outer edge has a **gentle sine wave bow** peaking at CB:
  ```
  bow = collarWidth × 0.08 × sin(π × frac)
  ```
  This 8% bow at center-back is what allows the collar to lie flat without bunching when worn.
- Roll line is a straight horizontal at `y = −collarStand` (1.25″ above inner edge).

---

## 4. Tailored Two-Piece Collar — `collarCurve()` (line 954)

Used by button-up shirts, denim jacket, crop jacket, and blazers paired with lapels.

**Anatomy:** Stand (rises from neckline) + Roll line + Fall (folds over stand).

**Step-by-step geometry:**
1. `collarLen = neckArc` (half the neckline, CB fold to CF).
2. `fallHeight = collarWidth − standHeight`. The stand is 1.25″, so with 3″ total width the fall is 1.75″.
3. **Outer (fall) edge** — 5 sampled points with a sine wave:
   ```
   wave = collarWidth × 0.08 × sin(π × (1 − frac) × 0.8)
   ```
   Peaks near the back quarter (~25% along), fades to zero at CF. This is what prevents the collar from pulling up at the back when worn.
4. **CF tip shape** by `style`:
   - `'point'`: tip extends 0.75″ beyond the neckline length, angled 30% of stand height upward — the classic shirt collar.
   - `'rounded'`: 0.25″ extension, same y as outer edge — softer finish.
   - `'band'`: no extension; straight rectangle; used as a stand-only collar (mandarin/band collar).
5. **Under collar** — every point divided by `1 + underShrink` (1.02). This 2% contraction in both x and y makes the under collar slightly smaller on all sides, so when the collar is turned and pressed the seam rolls to the underside and stays invisible.
6. **Roll line** — `[{0, standHeight} → {collarLen, standHeight}]`

---

## 5. Camp Collar (Flat) — inline in `camp-shirt.js` (line 345)

Not in the engine — drafted directly in the garment. It's a self-facing flat collar (folded in half), cut as a single piece.

**Geometry:**
- `collarLen = frontNeckArc × 2 + backNeckArc × 2` (full neckline all the way around, both sides).
- Cut height: 3″ (1.5″ finished when folded in half).
- `pointCut = collarH` (3″) inset from each CF end — creates the 45° diagonal at the visible front corners.
- The neckline seam has a **concave bow** (`cbBow = NECK_DEPTH_BACK × 0.5`) using Bézier control points at 33% and 67% of the collar length. This bow makes the collar drape open flat around the neckline rather than bunching.
- The outer fold edge is a straight horizontal line; the neckline edge is curved.
- Polygon: `[left outer corner → right outer corner → neckline arc (4 points, curved) → closes]`.

---

## 6. Revere (Convertible) Collar — inline in `camp-shirt.js` (lines 32–36, 253–258, 378–401)

A two-part system: the lapel is *part of the front panel*, and a separate narrow collar piece covers only the back neckline.

**Front panel (lapel fold):**
- Hard-coded constants:
  - `BREAK_Y = 7.5″` — CF roll line break point
  - `LAPEL_TIP_X = −2.25″`, `LAPEL_TIP_Y = 5.25″` — tip position (outward and mid-chest)
  - `PLACKET_W` — placket width
- When collar option is `'revere'`, two extra vertices are added to the front panel polygon after the hem: `{−PLACKET_W, BREAK_Y}` then `{LAPEL_TIP_X, LAPEL_TIP_Y}`. The polygon then closes back to the neckline. This fold-back creates the visible open lapel.

**Back neckline collar piece:**
- Width: `backNeckArc × 2 + COLLAR_EXT × 2` — the full back neckline plus 0.75″ shoulder extension on each side (so it sandwiches into the shoulder seams).
- Height: `REVERE_COLLAR_H = 2.5″` (finished ~1.25″ when folded).
- Neckline seam bowed with `revBowCtrl = (NECK_DEPTH_BACK × 0.4) / 0.75` using Bézier control points at 33% and 67%.
- Polygon: straight fold edge from shoulder to shoulder across the top, then the bowed neckline arc back.

---

## Garment Coverage Summary

| Garment | Collar/Lapel Type | Function(s) |
|---|---|---|
| `athletic-formal-jacket.js` | Peak, Notched, or Shawl lapel + tailored collar | `peakLapelCurve`, `notchedLapelCurve`, `shawlLapelFront`, `shawlCollarCurve`, `collarCurve` |
| `moto-jacket.js` | Notched lapel + point collar | `notchedLapelCurve`, `collarCurve` |
| `denim-jacket.js` | Two-piece point collar | `collarCurve` |
| `crop-jacket.js` | Stand (point or band) | `collarCurve` |
| `button-up.js` | Point, OCBD, or band collar | `collarCurve` |
| `camp-shirt.js` | Flat camp collar or revere | Inline geometry |

---

## Design System Invariants

- **Collar stand is always 1.25″** across every garment — consistency for fitting.
- **Under collar is always 2% smaller** (both axes) so seams roll to underside when pressed.
- **Sine-wave outer edges** (8% of width) on both the tailored collar fall and the shawl back collar — this is the mathematical reason they lie flat.
- **Gorge placement** is the sharpest difference between lapel types: peak sits at 45% down the neckline; notched sits at 100% (full depth).
- **No SA is ever hardcoded into piece geometry** — all seam allowance is added by the engine via `offsetPolygon` at render time.
