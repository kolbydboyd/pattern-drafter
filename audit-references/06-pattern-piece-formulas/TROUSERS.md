# Trouser / Pant Block — Reference Formulas

---

## Crotch Extensions

### Aldrich-derived formulas (JBlockCreator implementation)

```
front_extension = hip_panel_width / 4  ≈  hip / 16
back_extension  = hip_panel_width / 2  ≈  hip / 8
```

where `hip_panel_width = hip/4 + ease_per_panel`.

With regular ease (4" total, 40/60 split: 0.8" front, 1.2" back per panel):
- front panel width = hip/4 + 0.8
- front extension = (hip/4 + 0.8) / 4 ≈ hip/16 + 0.2

| Hip | Front ext (Aldrich) | Back ext (Aldrich) | Ratio |
|-----|--------------------|--------------------|-------|
| 34" | 2.1" | 4.25" | 2.02× |
| 38" | 2.4" | 4.75" | 1.98× |
| 44" | 2.75" | 5.5" | 2.0× |
| 50" | 3.1" | 6.25" | 2.0× |

Rule of thumb: back ≈ 2–3× front. The "3×" rule comes from cruder approximations;
Aldrich's actual formula gives closer to 2× for typical sizes.

### Critical: extensions must SCALE with hip measurement

Fixed absolute values (front=2.0", back=3.0" regardless of hip) cause:
- Correct proportions only at hip ≈ 38–40"
- Seat tightness for larger bodies (50"+ hip: back should be ~6.25", not 3.0")
- Excessive seat room for smaller bodies (30" hip: back should be ~3.75", close to 3.0")

### People's Patterns Current State

| Garment | Front default | Back default | Max back | Back for 50" hip (needed) |
|---------|--------------|--------------|----------|---------------------------|
| straight-jeans | 2.0" | 3.0" | 4.5" | 6.25" |
| athletic-formal-trousers | 2.0" | 3.0" | 4.5" | 6.25" |
| pleated-trousers | 1.75" | 3.0" | 4.5" | 6.25" |
| straight-trouser-w | 1.5" | 2.75" | (varies) | 6.25" |
| leggings (stretch) | 1.0" | 1.75" | 3.5" | N/A (stretch) |

**The maximum user-settable `backExt` of 4.5" is insufficient for bodies with
hip > 44" (Aldrich formula requires ≥ 5.5").**

### Roadmap Validation

The People's Patterns ROADMAP (line 397) for the planned Culottes garment explicitly
states: "Crotch front ext = hip/16 + 0.5", back ext = hip/8 + 0.5"" — confirming
the Aldrich formula is the intended approach. Existing garments deviate from this.

---

## Crotch Depth

```
crotch_depth = waist_to_seat (measured seated)
             = FreeSewing `crotchDepth`
             = People's Patterns `m.rise` (body rise measurement)
```

People's Patterns adds `crotchEase = 1.25"` below body rise to prevent fabric
pulling at crotch (`athletic-formal-trousers.js:167`). This is consistent with
industry practice.

---

## Inseam

```
inseam = body inseam length (inner leg: crotch to ankle)
       = FreeSewing `inseam`
       = People's Patterns `m.inseam`
```

---

## Total Crotch Length (crossSeam)

```
crossSeam = front crotch arc + back crotch arc
          = FreeSewing `crossSeam`
```

People's Patterns `validateCrossSeam()` in `geometry.js:178` checks
front + back arc lengths against expected range (0.7× to 1.3× rise × 2).

---

## Center-Back Raise

Back waist seam tilted up at CB to accommodate seat curve:
- Typical: 0.75–1.5" (Aldrich tradition)
- PP defaults: 0.75" (athletic), 1.25" (pleated)

---

## Waistband

```
waistband_length = body_waist + wearing_ease + overlap (1.5–2" for hook/button)
```

PP template: add +2" for button/zip closure (`TEMPLATE.js`).

---

## Crotch Curve Shape

PP `crotchCurvePoints()` in `geometry.js:137`:
- Back: p1.y = rise × 0.35; p2.x = ext × 0.55, p2.y = rise × 0.88
- Front: p1.y = rise × 0.45; p2.x = ext × 0.35, p2.y = rise × 0.93

These proportions control the shape of the curve independent of the extension
length. The shape is consistent with Aldrich tradition (deeper back curve, shallower
front).
