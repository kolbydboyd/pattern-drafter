# Skirt Blocks — Reference Formulas

---

## Circle Skirt Radius Formula

### Standard (Aldrich / industry)
The CUT piece has:
```
inner_cut_radius = (waist - SA) / (2π × frac)
```
where `frac = 1.0` for full circle, `0.75` for ¾ circle, `0.5` for half circle,
`0.25` for quarter circle.

### People's Patterns (`circle-skirt-w.js:103`)
```javascript
rInner = m.waist / (2 * Math.PI * frac)  // no-SA polygon
```
The `rInner` here is the **no-SA** polygon radius. The `offsetPolygon()` engine
applies SA outward. For the inner circle, "outward from the piece" = inward toward
the circle center, so the cut inner radius = `rInner - SA`.

When sewing, the seam is stitched at SA distance from the cut edge, so the
finished seam line sits at radius `(rInner - SA) + SA = rInner` from the center.

Finished waist circumference = `2π × rInner` = `2π × m.waist/(2π)` = `m.waist`. **Correct.**

The reference formula `(waist - SA)/(2π)` describes the CUT piece in systems that
store cut pieces with SA baked in. People's Patterns stores no-SA polygons and applies
SA separately — the formulas are architecturally equivalent and both produce the
correct finished waist.

**Status: PASS** — circle skirt radius formula is correct for the PP polygon architecture.

---

## Circle Skirt Area / Fabric Requirement

| Fullness | Inner radius | Fabric square |
|----------|-------------|---------------|
| Full (360°) | `waist/(2π)` | `2 × (R + length)` |
| ¾ circle | `4×waist/(6π)` | varies |
| Half circle | `waist/π` | `2 × (R + length)` |
| Quarter circle | `2×waist/π` | `(R + length)` per piece × 2 |

---

## A-Line Skirt

Built from straight skirt block by closing waist darts and spreading hem.

```
waist_panel_width = waist/2  (one half of waist)
hip_panel_width   = hip/2 + ease  (one half of hip)
hem_panel_width   = hip_panel + flare_amt
dart_intake       = hip_panel - waist_panel
```

Typical flare: 2–5 cm (Aldrich) or 2–6" per panel in People's Patterns (user option).

### People's Patterns (`a-line-skirt-w.js`)
```javascript
const waistW = m.waist / 2;
const hipW   = m.hip / 2 + ease / 2;   // ease = 1.0"
const hemW   = hipW + flareAmt;         // flareAmt = 2, 4, or 6"
```
Note: uses `m.waist / 2` (half waist) and `m.hip / 2` (half hip) for one panel,
NOT `/ 4`. This is correct — the skirt has two panels (front and back half-width each).

---

## Pencil / Straight Skirt

```
hip_panel  = hip/4 + ease          (quarter-panel)
waist_panel = waist/4              (quarter-panel)
dart_intake = hip_panel - waist_panel
hem_panel   = hip_panel - taper/2  (taper = 0–4" total)
```

People's Patterns (`pencil-skirt-w.js`): uses `hip/2` and `waist/2` for
half-panels (front + back as single pieces folded on CF/CB), consistent.

---

## Maxi / Midi / Mini Skirts

All use the same straight-skirt block with length adjustment only.
Hem flare added as `flareAmt` per panel.

---

## Wrap Skirt

Per panel = `hip/4 + ease + 4–6"` extension for overlap. Total coverage =
hip circumference + 8–12" overlap. See ROADMAP.md line 293.
