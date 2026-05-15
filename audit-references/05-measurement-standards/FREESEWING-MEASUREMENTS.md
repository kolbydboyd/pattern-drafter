# FreeSewing Measurement Vocabulary

Source: freesewing.dev/reference/measurements/  
License: CC-BY (documentation)  
This is the closest free substitute for ISO 8559-1:2017 measurement definitions.

---

## Standard Measurement Set (37 named measurements)

```
ankle            — circumference around ankle at narrowest point
biceps           — largest circumference of upper arm (relaxed)
bustFront        — bust circumference front arc only (HPS to HPS)
bustPointToUnderbust — vertical distance from bust apex to underbust
bustSpan         — horizontal distance between bust apex points
chest            — full chest / bust circumference (FreeSewing maps this to "bust")
crossSeam        — total crotch length: front waist → crotch → back waist
crossSeamFront   — front crotch length only (waist to crotch)
crotchDepth      — seated: floor to waist, subtract floor to seat
head             — circumference around head at forehead
heel             — circumference around heel and instep
highBust         — circumference just under arms / above bust apex
highBustFront    — highBust front arc only
hips             — fullest part of seat (Western convention; ≈ ASTM "full hip")
hpsToBust        — high point shoulder (neck-shoulder junction) to bust apex
hpsToWaistBack   — HPS to waist at CB
hpsToWaistFront  — HPS to waist at CF
inseam           — inside leg: crotch to ankle (or preferred hem length)
knee             — circumference around knee
neck             — circumference at mid-neck
seat             — fullest part of seat (preferred for trouser drafting in v3+)
seatBack         — seat circumference back arc only
shoulderSlope    — angle or drop of shoulder from horizontal
shoulderToElbow  — shoulder point to elbow point (arm bent at 90°)
shoulderToShoulder — across back shoulder-to-shoulder width
shoulderToWrist  — shoulder point to wrist bone
underbust        — circumference directly below breasts
upperLeg         — circumference at fullest part of thigh
waist            — circumference at natural waist (smallest horizontal girth)
waistBack        — waist back arc only
waistToArmpit    — waist to underarm notch (vertical); replaces armhole depth
waistToFloor     — waist to floor (inseam proxy for full-length garments)
waistToHips      — waist to fullest hip (= hip depth; typically 7–9")
waistToKnee      — waist to knee
waistToSeat      — waist to seat (fullest part)
waistToUnderbust — waist to underbust (midriff length)
waistToUpperLeg  — waist to upper thigh
wrist            — circumference at wrist bone
```

---

## Derived Measurements (via plugins)

- `seatFront, waistFront, crossSeamBack` — `@freesewing/plugin-measurements`
- `bust` — remapped from `chest` via `@freesewing/plugin-bust`

---

## Key Definitions for Audit

| Measurement | ISO equivalent | Notes |
|-------------|----------------|-------|
| `waist` | ISO 8559-1 "natural waist" | Smallest horizontal girth between ribcage and iliac crest |
| `hips` / `seat` | ISO "full hip" | Fullest part of seat, typically 18–22 cm below waist |
| `chest` | ISO "chest / bust" | Fullest part; FreeSewing maps chest → bust via plugin |
| `highBust` | ISO "upper chest" | Just under arms; used for FBA calculation |
| `waistToArmpit` | ASTM "waist to underarm" | Critical for accurate armhole depth in MTM; replaces chest/4 fallback |
| `crossSeam` | ASTM "crotch length total" | Front waist → crotch → back waist |
| `inseam` | ASTM "inseam length" | |
| `biceps` | ASTM "upper arm maximum girth" | Measured relaxed |

---

## ISO 8559-1:2017 Notes

The standard (paywalled at iso.org) defines measurement location and method for
every body dimension. The FreeSewing vocabulary is the best free approximation.

Freely citable: measurement *point definitions* (where to measure on the body).
NOT freely citable: size *value tables* (e.g. "size 8 = 35½" bust").
