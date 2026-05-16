# Aldrich — Metric Pattern Cutting for Menswear

Source: Winifred Aldrich, *Metric Pattern Cutting for Menswear* (Wiley)  
Also: related Kershaw/UK menswear tradition cited as inspiration for FreeSewing Brian

---

## Shirt Body Block

### Armhole Depth
Same formula family as womenswear: `chest/8 + constant`.
For menswear shirts, the constant is slightly larger to accommodate shirt tails
and movement over trousers.

Common simplified industry rule (used by many menswear blocks including the
People's Patterns engine): `chest/4`. This produces a deeper armhole than the
Aldrich precise formula — appropriate for casual shirts, problematic for
fitted tailoring.

### Shoulder Slope
Industry standard: **13°** from horizontal.  
`shoulder_drop = shoulder_width × tan(13°)`  
For a 5" half-shoulder: drop ≈ 1.16"

People's Patterns engine (`upper-body.js:114`): matches exactly.

---

## Trouser Block (Aldrich / Gill methods)

### Crotch Extensions

The Aldrich-derived rule:

```
front_extension ≈ hip_panel_width / 4  =  (hip/4 + ease.front) / 4  ≈  hip / 16
back_extension  ≈ hip_panel_width / 2  =  (hip/4 + ease.back) / 2   ≈  hip / 8
```

Rule of thumb: back ≈ 3× front ("back of body needs significantly more fabric
to accommodate the seat").

| Hip circ | Front ext (Aldrich) | Back ext (Aldrich) | Ratio |
|----------|--------------------|--------------------|-------|
| 34" | 2.1" | 4.25" | 2.0× |
| 38" | 2.4" | 4.75" | 2.0× |
| 44" | 2.75" | 5.5" | 2.0× |
| 50" | 3.1" | 6.25" | 2.0× |

**Key point**: crotch extensions must scale with hip measurement.
Fixed absolute values (e.g. front=2.0", back=3.0" regardless of hip size) cause
increasing seat tightness as body size increases.

### Center-Back Raise
Back waist seam is tilted up at CB to accommodate seat curve (curved, not straight).
Typical CB raise: 0.75–1.5" depending on style and fit.

People's Patterns: cbRaise default 0.75" (athletic-formal), 1.25" (pleated-trousers).

---

## Sleeve Block

### Cap Height
- Tailored jacket: cap height ≈ `armscye_circumference / 3`
- Casual / sport: cap height ≈ `armscye_circumference / 5`

Note: **armscye CIRCUMFERENCE**, not armhole depth. These are different quantities.
For a 38" chest the armscye circumference is typically 14–17" depending on ease.

### Cap Ease
| Style | Cap ease |
|-------|---------|
| T-shirt / knit | 0" |
| Set-in woven shirt | ½–1" |
| Blouse | 1–1¼" |
| Suit jacket | 1¼–1½" |
| Coat | 1½–2" |

---

## Shoulder-Slope Angle

Source: Aldrich, Bunka — both cite 13° as the industry average.  
People's Patterns `shoulderDropFromWidth()` uses 13°. ✓

---

## Neckline Width

Neckline width ≈ neck circumference / 5 (Aldrich / JBlockCreator).  
People's Patterns `neckWidthFromCircumference()` uses neck/5. ✓
