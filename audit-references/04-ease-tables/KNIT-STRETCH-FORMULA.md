# Knit / Stretch Fabric Ease Formula

Source: mislope.com, sewingforaliving.com, dresspatternmaking.com  
No official standard exists for knit ease. This is the industry consensus formula.

---

## Core Formula

There is no BMV chart for knits. There is a formula:

```
stretch_ratio   = stretched_length / original_length
negative_ease % = (1 − 1/stretch_ratio) × 100
```

### Worked Example (mislope.com)

36" bust × stretch ratio 1.5 (50% stretch fabric):
```
negative_ease % = (1 − 1/1.5) × 100 = (1 − 0.667) × 100 = 33.3%
negative ease   = 36 × 0.333 = 12"
finished garment = 36 − 12 = 24"
```
The 24" pattern stretches back to 36" on the body.

---

## Knit Category Guidelines (sewingforaliving.com)

| Stretch category | % stretch | Ease rule |
|---|---|---|
| Stable knit (0–25%) | 0–25% | Treat as woven; use body measurement |
| Moderate knit (26–50%) | jersey, interlock | −2 to −3 cm at half-circumference |
| Stretchy knit (51–75%) | | −4 cm at half-circumference |
| Super stretch (76–100%) | spandex, swimwear | −6 cm at half-circumference |

## Alternate Scheme (dresspatternmaking.com)

| Stretch category | Pattern as % of body |
|---|---|
| Low stretch | 97% of body measurement |
| Medium stretch | 95% of body measurement |
| High stretch | 90% of body measurement |

---

## FreeSewing Aaron (Knit A-Shirt) — Reference Implementation

Uses `stretchFactor` option that directly multiplies all horizontal measurements:
```javascript
// effective_width = body_width × (1 - stretchFactor)
```

This is the clean reference implementation. People's Patterns leggings use a
similar approach (STRETCH_EASE: -2/0/+2"). Upper body knit garments (tee, crewneck,
henley, tank) currently use positive ease only — no `stretchFactor` equivalent.

---

## People's Patterns Implementation Status

| Garment | Negative ease | Notes |
|---------|---------------|-------|
| Leggings | Yes — STRETCH_EASE (-2/0/+2") | Good |
| Kids leggings | To verify | Should match |
| Tee | No — uses UPPER_EASE (+2/+4/+6/+10") | Gap |
| Crewneck | No — uses UPPER_EASE | Gap |
| Henley | No — uses UPPER_EASE | Gap |
| Fitted-tee-w | No — uses fixed 2/4" | Gap |
| Tank top | No | Gap |
| Swimwear (planned) | Needed | -15 to -20% + wet stretch |
| Bodysuit (planned) | Needed | min 25% stretch |

ROADMAP entry: "Negative ease / compression | leggings, bodycon, bike shorts,
sports bra, swimwear | not yet — needs stretch block" (line 930).

---

## MTM Note

MTM knit ease should use the stretch-ratio formula rather than the BMV ease chart.
An MTM pattern for a 36" bust in a 4-way stretch fabric (stretch ratio 1.5) should
be drafted at 24", NOT at 36" + some positive ease value.
