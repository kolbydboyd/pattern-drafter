# Aldrich — Metric Pattern Cutting for Women's Wear

Source: Winifred Aldrich, *Metric Pattern Cutting for Women's Wear* (6th ed., Wiley)  
Free access: earlier editions on Internet Archive (e.g. archive.org/details/metricpatterncut0000aldr_b7m8)  
Implemented in: JBlockCreator (Gill/Beazley-Bond methods)

---

## Close-Fitting Bodice Block

Drafted at half-body (one side).

| Measurement point | Formula |
|-------------------|---------|
| Block width at bust | `½ chest + 5 cm ease` |
| Block width at waist | `½ waist + 3 cm ease` |
| Total dart intake (one side) | `(½ chest + 5) − (½ waist + 3)` |
| Across-back | back-width measurement + ~1 cm ease |
| Scye depth (armhole Y from CB neck) | `chest/8 + 5.5–6.5 cm` (varies by edition) |

### Standard dart split (one side):
- Back waist dart: ~4 cm
- Side-seam dart (effective): ~5 cm
- Front waist dart: ~3 cm
- Total: ~12 cm (matches intake formula for size 12 UK)

### Standard block ease (publicly summarized):
- Close-fitting: 5 cm at half-bust, 3 cm at half-waist
- Standard (block): ~6" (15 cm) ease at upper bust; ~4" at bust line
- Sleeveless: reduce upper-bust ease to 3.5–4", bust ease to 1.5–2"

---

## Armhole Depth — Important Reference Points

Aldrich's scye depth is measured **from the CB neckline** vertically to the
underarm level. This is NOT the same as measuring from the shoulder seam point.

For a typical body, neckline-to-shoulder vertical distance ≈ 1–1.5" (varies
with shoulder slope). The shoulder-to-underarm distance is therefore:

```
scye_depth - neckline_to_shoulder ≈ (chest/8 + 2.2") - 1.25"
```

For 38" chest: ≈ (4.75 + 2.2) - 1.25 = **5.7" from shoulder to underarm**

Compare to People's Patterns formula `armholeDepthFromChest(chest, 'standard')`:
- Returns Y from pattern TOP LINE (= neckline level), not shoulder point
- Value: `chest/4 + 0.5"` = 10" for 38" chest
- Subtract shoulder drop (~1.16"): effective shoulder-to-underarm = ~8.84"

**Net difference: current engine places underarm ~3" lower than Aldrich for 38" chest.**

---

## Skirt Blocks

### Straight / Pencil Skirt
- Half-hip width at block: `hip/4 + ease`
- Half-waist width: `waist/4`
- Dart intake = difference between hip and waist panel widths

### A-Line Skirt
Built from straight skirt block by closing waist darts and spreading hem.
Hem flare: commonly 2–5 cm per side seam.

### Circle Skirts

| Fullness | Inner radius formula |
|----------|---------------------|
| Full circle (360°) | `R = (waist − SA) / (2π)` — for CUT radius including SA |
| 3/4 circle (270°) | `R = (4 × waist) / (6π)` |
| Half circle (180°) | `R = waist / π` |
| Quarter circle (90°) | `R = (2 × waist) / π` |

Note: "waist − SA" means subtract the seam allowance from waist before
computing radius. In systems that store no-SA polygons and apply SA offset
separately (like People's Patterns), the no-SA radius = `waist / (2π × frac)` is
correct — the SA offset tool applies the seam allowance outward (inward on the
inner circle edge) automatically.

---

## References

- Aldrich (2015), 6th ed., Wiley-Blackwell
- JBlockCreator implements Aldrich's trouser + skirt methods directly
- FreeSewing Brian uses a Kershaw-inspired lineage that resembles Aldrich but is
  not faithful to any single source
