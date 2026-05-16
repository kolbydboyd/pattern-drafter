# Bodice Front/Back — Reference Formulas

---

## Armhole Depth

### Aldrich (womenswear close-fit)
```
scye_depth = chest/8 + 5.5–6.5 cm  (measured from CB neckline vertically)
           = chest/8 + 2.2"–2.6"
```
For 38" chest: 4.75 + 2.2 = **6.95"** from neckline; from shoulder ≈ 5.7"

### FreeSewing Brian v3
Uses `waistToArmpit` measurement directly (MTM). Falls back to `chest/4` only
as legacy. The `waistToArmpit` measurement is the vertical distance from waist
to underarm notch, measured on the body.

### People's Patterns `armholeDepthFromChest()` — `upper-body.js:95`
```javascript
return waistToArmpit || (chest / 4 + tolerance[style]);
// tolerance: fitted=0, standard=0.5, oversized=1.5
```
Returns Y from pattern TOP (neckline level), not from shoulder point.
Actual shoulder-to-underarm: `armholeY - slopeDrop`.

For 38" chest, standard: armholeY = 10", shoulder drop ≈ 1.16",
shoulder-to-underarm = **8.84"**

| Source | 38" chest armhole depth (from shoulder) | From neckline |
|--------|----------------------------------------|---------------|
| Aldrich | ~5.7" | ~6.95" |
| FreeSewing v3 | waistToArmpit (body measurement) | — |
| PP fallback (standard) | ~8.84" | 10" |

**Net finding**: PP fallback `chest/4` produces a ~3" deeper armhole than Aldrich
for 38" chest. This is intentional for casual/relaxed silhouettes but undersized
for close-fitting womenswear. The `waistToArmpit` override produces correct MTM depth.

---

## Across-Back and Chest

- Aldrich: across-back = back-width measurement + ~1 cm ease
- People's Patterns: derived from `shoulderWidth` and `chestDepth` proportions;
  no direct `crossBack` measurement used (it's listed as optional in measurements.js)

---

## Dart Intake — Bust Dart

### Aldrich (one side):
```
intake = (chest/2 + 5cm) − (waist/2 + 3cm)
```
Standard distribution: back dart, side dart, front waist dart.

### People's Patterns `bustDartIntake()` — `upper-body.js:38`
Uses **cup-size method** (Cashmerette / Closet Core) when `highBust` provided:
```javascript
cupInches = chest - highBust
intake    = max(0, min(3.0, (cupInches - 2) * 0.5))
// B cup (2" diff) → 0"  C→0.5"  D→1.0"  F→2.0"  H→3.0"
```
Fallback (no highBust): `max(0.75, min(3.0, (chest - 30) * 0.11 + 0.75))`

---

## Front-to-Back Ease Distribution

### Aldrich / textbook standard:
50% front / 50% back (both panels equal width).

### People's Patterns — `upper-body.js:71`
55% front / 45% back.

**Note**: the extra 5% at front provides more ease over the bust. This is appropriate
for inclusive sizing (people who need FBA). Back tightness across shoulder blades is
a risk if the back ease is consistently below 50%.

### Lower body:
40% front / 60% back (standard industry split; see `geometry.js:528`). Pass.

---

## Waistband Length

```
waistband_length = waist_seam_length + overlap (3–5 cm) for fastening
                 = body_waist + wearing_ease (0–2 cm) + overlap
```

People's Patterns template note: add +2" for button/zip closure overlap.
`src/garments/TEMPLATE.js` line ~83: documents `+2"` overlap requirement.
