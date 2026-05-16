# Sleeve Cap — Reference Formulas

---

## Cap Height

### Multiple Competing Methods

All published sources agree: cap height varies by style. No single formula is
universally correct — pick a target method and document it.

| Source | Method | Formula |
|--------|--------|---------|
| Aldrich/UK tailored jacket | Fraction of armscye circumference | cap_height ≈ armscye/3 |
| Casual / T-shirt | Fraction of armscye circumference | cap_height ≈ armscye/5 |
| Armstrong | Fraction of armscye depth | cap_height ≈ armhole_depth/2 |
| FreeSewing Brian v3 | Auto-fit to armhole | emerges from biceps + ease + armhole curve |
| People's Patterns | Fraction of armhole depth | 0.35–0.72 × armholeDepth (by garment) |

### Key distinction: depth vs circumference

**Armhole depth** = vertical linear distance from shoulder point to underarm notch.
**Armscye circumference** = arc length around the armhole seam line.

For a typical 38" chest garment:
- Armhole depth ≈ 8.84" (PP standard)
- Armscye circumference ≈ 14–17" (depends on shape and ease)

The Aldrich formula uses circumference; PP uses depth. These produce different scales:
- Aldrich casual: 16" armscye / 5 = **3.2"** cap height
- PP casual (0.60): 8.84" depth × 0.60 = **5.3"** cap height (much taller)

However, PP's `sleeveCapCurve()` uses `capHeight` as a control-point driver, not
the literal crown height. The actual crown rise in the bezier curve is approximately
`0.315 × capHeight` = 5.3 × 0.315 = **1.67"** for a knit tee.

This means the relationship between the PP `capHeight` parameter and the physical
crown height is non-linear. Translating directly from reference formulas to PP's
`capHeight` parameter requires calibration.

---

## Cap Ease

| Style | Cap ease |
|-------|---------|
| T-shirt / knit | 0" |
| Set-in woven shirt | ½–1" |
| Blouse | 1–1¼" |
| Suit jacket | 1¼–1½" |
| Coat | 1½–2" |

People's Patterns: `validateSleeveSeams()` in `upper-body.js:391` checks that
cap seam length - armhole circumference falls in 0–1.5" for knit, 0.5–3" for
woven. This is consistent with references.

---

## Sleeve Cap Construction Notes

### Set-In Cap (standard)
- Cap base width = bicep + ease
- Cap height determined by method above
- Underarm notches placed at ⅓ front armscye and ⅓ back armscye from underarm

### FreeSewing Brian v3 auto-fit
The cap shape is honored but the length is forced equal to armhole arc + cap ease.
This is the ideal MTM approach — shape is a design choice; seam length is constrained
to match the armhole.

### People's Patterns
Uses `sleeveCapCurve(bicep, capHeight, sleeveWidth)` — bezier with:
```
crownPull = −capHeight × 0.42
p1 = (sleeveWidth × 0.14, crownPull)  // back cap control
p2 = (sleeveWidth × 0.84, crownPull)  // front cap control
```
Then `validateSleeveSeams()` verifies cap arc vs armhole arc. Defects log as
console warnings (not blocking).

---

## Sleeve Width

```
sleeve_width = bicep + bicepEase
```

Typical bicep ease: 0.5–1" for fitted/knit, 1–2" for standard woven shirt.
FreeSewing `bicepsEase` option.

People's Patterns: bicep ease is included in the sleeve width calculations per
garment (derived from the fit option's ease level).

---

## Fasanella Controversy

Kathleen Fasanella ("Sleeve cap ease is bogus", fashion-incubator.com, 2005):
argues that no cap ease is needed in industrially sewn garments; the sleeve is
set flat. Aldrich and Armstrong include 1–1½" cap ease as standard. FreeSewing
exposes it as configurable. Audit should NOT assume a single correct value here.
