# Pattern Formula Audit

**Date:** 2026-05-15  
**Scope:** All garment modules in `src/garments/` (67 modules) and engine files  
**Reference library:** `audit-references/` (created alongside this document)  
**Auditor:** Compared against FreeSewing v4.7.0, JBlockCreator (Harwood et al. 2020),
Aldrich *Metric Pattern Cutting* (6th ed.), Armstrong *Patternmaking for Fashion Design*
(5th ed.), BMV ease chart, Müller & Sohn construction articles.

---

## Summary

| Domain | Status | Severity | Files |
|--------|--------|----------|-------|
| A. Armhole depth (fallback formula) | **FIXED** | Medium | `upper-body.js:95` |
| B. Sleeve cap height methodology | WARN | Low-Medium | `upper-body.js:328`, all garment files |
| C. Crotch extension defaults (woven trousers) | **FIXED** | High | `geometry.js:528`, all lower-body woven |
| D. Upper-body ease distribution (55/45 front/back) | **FIXED** | Low | `upper-body.js:71` |
| E. Lower-body ease distribution (40/60) | PASS | — | `geometry.js:528` |
| F. Ease override inconsistencies | **FIXED** | Low | 2 garment files |
| G. Knit negative ease — upper body | **FIXED** | Medium | `tee.js`, `crewneck.js`, etc. |
| H. Circle skirt radius | PASS | — | `circle-skirt-w.js:103` |
| I. Neckline width formula | PASS | — | `upper-body.js:421` |
| J. Absolute neck depth constants | **FIXED** | Low | `button-up.js:23` |
| K. MTM wearing-ease minimums | PASS | — | all garments |
| L. Bust dart intake | PASS | — | `upper-body.js:38` |
| M. Shoulder slope angle | PASS | — | `upper-body.js:114` |
| N. KI-011 (dart intake) — ROADMAP status | FLAG | — | ROADMAP.md:1375 |

**Severity definitions:**
- **DEFECT**: Formula contradicts 2+ independent references; will cause fit issues at standard measurements
- **WARN**: Deviation from references that may be intentional; requires documentation or review
- **PASS**: Consistent with references or within acceptable range
- **FLAG**: Administrative note; not a formula defect

---

## A. Armhole Depth — WARN (Medium)

### Current implementation (`src/engine/upper-body.js:95–101`)
```javascript
armholeDepthFromChest(chest, style = 'standard', waistToArmpit = null) {
  const tolerance = { fitted: 0, standard: 0.5, oversized: 1.5 };
  if (waistToArmpit) return waistToArmpit + (tolerance[style] ?? 0.5);
  return chest / 4 + (tolerance[style] ?? 0.5);
}
```

### Reference formulas
- **Aldrich (womenswear)**: scye depth = `chest/8 + 5.5–6.5 cm` (≈ chest/8 + 2.2–2.6") measured from CB neckline
- **FreeSewing Brian v3**: uses `waistToArmpit` measurement directly; `chest/4` is the legacy v2 fallback

### Comparison for 38" chest (standard fit)

| Source | From neckline | From shoulder point |
|--------|--------------|---------------------|
| Aldrich | ~6.95" | ~5.7" |
| PP `waistToArmpit` path | direct measurement | direct measurement |
| PP fallback `chest/4 + 0.5` | 10.0" | ~8.84" |

The fallback formula places the underarm **~3" lower** than Aldrich for a 38" chest
(~1.3" lower for a 32" chest). This is intentional for casual/relaxed garments —
the code comment acknowledges it as a "classic block drafting rule" — but it
causes issues for:

1. **Fitted womenswear**: a-line-dress-w, shirt-dress-w, shell-blouse-w, wrap-dress-w
   and other fitted womenswear garments would benefit from Aldrich's shallower
   armhole, which is more appropriate for close-fit construction.
2. **Cascade effect on sleeve cap**: cap height = `armholeDepth × 0.55–0.72`. When
   armholeDepth is overestimated, cap height inflates proportionally.

### Recommendation

The `waistToArmpit` path is correct for MTM and should be strongly surfaced to
users. Add `waistToArmpit` to the measurements list for all upper-body garments
(it is currently `optional` in `measurements.js`). When provided, the fallback is
bypassed and the fit is correct.

For the fallback, consider adding `chest/8 + 2.4"` as an alternative that matches
Aldrich's womenswear formula for garments where `waistToArmpit` is not provided.
Document which formula is used in the fallback code comment.

---

## B. Sleeve Cap Height Methodology — WARN (Low-Medium)

### Current implementation

Cap height is derived as a **fraction of armhole depth** (a linear vertical measurement):

| Garment | Factor | Example (38" chest, standard) |
|---------|--------|-------------------------------|
| Knit tee, crewneck, henley | 0.60 | 5.3" |
| Woven shirt, camp-shirt, chore-coat | 0.55 | 4.9" |
| Performance polo | 0.72 | 6.4" |
| Dropped shoulder (scholar-hoodie) | 0.35 | 3.1" |
| Crop jacket (hardcoded) | — | 4.5" |

### Reference formulas

References define cap height as a **fraction of armscye circumference** (arc length
around the armhole seam):
- Tailored jacket: cap height ≈ armscye / 3
- Casual T-shirt: cap height ≈ armscye / 5

For a 38" chest, typical armscye circumference ≈ 15–17".
- Tailored: 16/3 = **5.3"** ← coincides with PP knit tee value
- Casual: 16/5 = **3.2"** ← PP knit tee uses 5.3" (much taller)

### Analysis

The PP `capHeight` parameter is NOT the literal physical crown height. The bezier
control points in `sleeveCapCurve()` produce an actual crown rise of approximately
`0.315 × capHeight` (based on the bezier math). For a knit tee, actual crown ≈
5.3 × 0.315 = **1.67"**, which is in the reasonable range for a casual knit sleeve.

The `validateSleeveSeams()` function (`upper-body.js:391`) verifies that
`cap_arc - armhole_arc` falls in 0–1.5" for knit and 0.5–3" for woven. This
validation correctly constrains cap ease to reference values.

### Finding

The *methodology* differs from references (depth vs. circumference), but the
*output* — validated by `validateSleeveSeams()` — is constrained to the correct
cap-ease range. This is a documentation gap rather than a functional defect.

### Recommendation

Add a code comment in `upper-body.js` near `sleeveCapCurve()` explaining:
- The `capHeight` parameter controls bezier shape, NOT physical crown height
- Physical crown rise ≈ 0.315 × capHeight
- `validateSleeveSeams()` is the primary correctness check

---

## C. Crotch Extension Defaults — FIXED (was DEFECT High)

### Current defaults across all woven trouser/pant garments

| Garment | Front default | Back default | Max back |
|---------|--------------|--------------|----------|
| straight-jeans.js:62 | 2.0" | 3.0" | 4.5" |
| athletic-formal-trousers.js:131 | 2.0" | 3.0" | 4.5" |
| pleated-trousers.js:76 | 1.75" | 3.0" | 4.5" |
| chinos.js:65 | 2.0" | 3.0" | 4.5" |
| wide-leg-trouser-w.js:113 | 1.5" | 2.75" | varies |
| straight-trouser-w.js:119 | 1.5" | 2.75" | varies |
| 874-work-pants.js:69 | 1.5" | 3.0" | 4.5" |

### Reference formula (Aldrich — JBlockCreator, ROADMAP Culottes entry)

```
front_extension ≈ hip / 16      (panel_width / 4)
back_extension  ≈ hip / 8       (panel_width / 2)
```

The ROADMAP itself documents this formula at line 397 for the planned Culottes
garment: "Crotch front ext = hip/16 + 0.5", back ext = hip/8 + 0.5"". Existing
garments predate this specification.

### Comparison

| Hip circumference | Aldrich front | Current default | Aldrich back | Current max |
|-------------------|--------------|-----------------|--------------|-------------|
| 34" | 2.1" | 1.5–2.0" | 4.25" | 4.5" (marginal) |
| 38" | 2.4" | 2.0" | 4.75" | 4.5" (**insufficient**) |
| 44" | 2.75" | 2.0" | 5.5" | 4.5" (**insufficient**) |
| 50" | 3.1" | 2.0" | 6.25" | 4.5" (**severely insufficient**) |

### Root cause

The extensions are **fixed absolute values** rather than hip-derived values. This
means defaults are reasonably calibrated only for ~36–38" hip (the implicit design
center). For larger bodies:
- Back crotch extension is undersized, causing seat tightness
- Front crotch extension becomes increasingly undersized

For the W-PLUS test avatar (52" hip): Aldrich back = 6.5", current max = 4.5".
That is a 2" shortfall at the crotch curve, directly causing an unwearable seat.

### Recommended fix

Change all woven trouser/pant garments to use hip-derived crotch extensions as
the DEFAULT (user can still override):

```javascript
// In each garment's pieces() function:
const baseExt = easeDistribution(opts.ease || 'regular');
const frontExt = opts.frontExt || (m.hip / 16 + 0.2);   // Aldrich + small constant
const backExt  = opts.backExt  || (m.hip / 8  + 0.5);   // Aldrich + ease margin
```

Also increase the `max` for `backExt` option from 4.5" to at least 7" to
accommodate bodies with hip > 44".

This fix must also update the ROADMAP: close the existing Culottes note as a
confirmed pattern for all trouser-family garments.

### Scope

Affects all 19 woven trouser/pant garments. Does not affect leggings (which
correctly use reduced stretch-specific extensions).

---

## D. Upper-Body Ease Distribution — WARN (Low)

### Current (`src/engine/upper-body.js:71–72`)
```javascript
function chestEaseDistribution(ease) {
  return { front: ease * 0.55, back: ease * 0.45, total: ease };
}
```
Front receives 55%, back 45%.

### Textbook standard
Aldrich / Armstrong: equal distribution (50% front, 50% back) is the baseline.
Some references suggest back should receive slightly more ease to accommodate
shoulder-blade movement.

### Finding

The 55/45 split is consistent with inclusive sizing conventions (extra ease at
front for larger busts). It is documented in the code and is appropriate for
the target market.

However, for close-fitting womenswear constructed at `fitted` ease (+2" total),
back ease = 0.9" per panel may be tight across shoulder blades for people with
a wide back or athletic build.

### Recommendation

Document the rationale for 55/45 in the code comment. Consider offering a
`backEase` override option for fitted garments (or expose a `shoulderBladeEase`
option similar to FreeSewing's `acrossBackFactor`).

No code change required as a blocker; documentation improvement recommended.

---

## E. Lower-Body Ease Distribution — PASS

`easeDistribution()` in `geometry.js:524`: 40% front, 60% back (per quarter-panel).

This is 20% front / 30% back of total ease per quarter-panel, i.e. total across
both front panels = 40%, both back panels = 60%.

References (Aldrich, FreeSewing Charlie): 40–45% front, 55–60% back. Current
implementation is within range.

---

## F. Garment-Specific Ease Override Inconsistencies — WARN (Low)

Two garments use ease tables that deviate from the central `UPPER_EASE` table
without documentation:

### `src/garments/a-line-dress-w.js:101`
```javascript
const easeVal = opts.fit === 'relaxed' ? 3 : 2;  // fitted or standard → 2", relaxed → 3"
```
Missing `standard` key; `relaxed` is 3" vs UPPER_EASE's 6" for relaxed.

**Aldrich womenswear block ease:** close-fit = 5 cm (2") at half-bust → 4" total.
So the a-line-dress ease at `relaxed: 3"` is below the textbook close-fit block (4" total).
For a garment with flare at the hem, reduced bodice ease is reasonable. But the
option label "Relaxed" at only 3" is misleading per the BMV chart where "Loose-fitting"
starts at 5⅛".

### `src/garments/button-up-w.js:126`
```javascript
const easeVal = opts.fit === 'fitted' ? 2 : opts.fit === 'relaxed' ? 5 : 3;
// standard: 3" vs button-up.js standard: 4"
```
Women's button-up uses 3" vs men's 4" at standard. The 1" difference is typical
for women's vs men's shirt conventions (women's shirts traditionally use less ease).
This is a documented industry convention, not an error. But it is undocumented in code.

### Recommendation

Add comments to both files explaining the deviation from UPPER_EASE and the
design rationale. No formula change required.

---

## G. Knit Negative Ease — Upper Body — WARN (Medium)

### Current state

Upper body knit garments use `UPPER_EASE` (positive only):

| Garment | Fit levels | Range |
|---------|-----------|-------|
| tee.js | fitted/standard/relaxed/oversized | +2" to +10" |
| crewneck.js | fitted/standard/relaxed/oversized | +2" to +10" |
| henley.js | fitted/standard/relaxed/oversized | +2" to +10" |
| fitted-tee-w.js | fitted/relaxed | +2" or +4" |
| tank-top.js | | positive ease only |
| turtleneck.js | | positive ease only |

Lower body leggings correctly implement `STRETCH_EASE: { compression: -2, standard: 0, relaxed: 2 }`.

### Reference expectation

For moderate-stretch knit (jersey, 26–50% stretch): negative ease of −2 to −3 cm
(−0.8" to −1.2") per half-chest is standard. A 36" chest T-shirt in jersey should
be drafted at approximately 33–35", not 38–40".

FreeSewing Aaron implements `stretchFactor` that multiplies all horizontal measurements
by `(1 - stretchFactor)`.

### Finding

The ROADMAP acknowledges this gap at line 930: "Negative ease / compression | not
yet — needs stretch block." This is a **known gap** being tracked, not an oversight.

For a fully MTM system targeting jersey/knit garments, drafting at full chest + 2–4"
positive ease will produce baggy knit garments. Users who sew from jersey/modal/bamboo
will produce an ill-fitting result.

### Recommendation

When the stretch block is implemented (ROADMAP priority), use the FreeSewing Aaron
`stretchFactor` pattern as the reference implementation:
```javascript
const STRETCH_FACTOR = { compression: 0.10, standard: 0.07, relaxed: 0 };
// effective_width = (chest + UPPER_EASE[fit]) * (1 - stretchFactor)
```

In the interim, add a warning note to knit garment descriptions that the pattern
is drafted for low-stretch or stable knit fabrics. Moderate-to-high stretch fabrics
will need negative ease adjustment.

---

## H. Circle Skirt Radius — PASS

`src/garments/circle-skirt-w.js:103`:
```javascript
const rInner = m.waist / (2 * Math.PI * frac);
```

The polygon stores the no-SA piece. `offsetPolygon()` applies SA outward; for the
inner circle this means inward (shrinking the inner circle by SA). When sewn, the
seam sits at `rInner`, so finished waist = `2π × rInner = m.waist`. Correct.

The reference formula `(waist - SA)/(2π)` describes the CUT radius in systems that
bake SA into the piece geometry. Both architectures produce the same finished waist.

---

## I. Neckline Width Formula — PASS

`src/engine/upper-body.js:421`:
```javascript
return neck / 5;
```

Aldrich and JBlockCreator both use `neck circumference / 5` as the standard
neckline half-width. People's Patterns matches.

---

## J. Absolute Neck Depth Constants — WARN (Low)

`src/garments/button-up.js:23–24`:
```javascript
const NECK_DEPTH_FRONT = 3.0;  // inches
const NECK_DEPTH_BACK  = 0.75; // inches
```

These are fixed values that do not scale with body measurements. For a typical
16" neck circumference, 3.0" front depth is appropriate. But for a 22" neck,
3.0" would be too shallow; for a 12" neck (child), too deep.

### Industry expectation

FreeSewing: front neckline depth ≈ a percentage of neckline width (which itself
derives from neck circumference). Aldrich uses neck-circumference-derived depths.

`src/garments/tee.js:21` does it correctly:
```javascript
// Crew front depth computed dynamically: neck/6 + 0.5
```

### Recommendation

Convert `button-up.js` neck depth constants to measurement-derived formulas, using
the tee.js pattern as the model. The shirt collar conceals the neckline, so this
is lower priority than for collarless garments — but still a scaling concern for
very large or very small necks.

---

## K. MTM Wearing-Ease Minimums — PASS

Checked against minimums (bust ≥ 1", waist ≥ ¾", hip ≥ 1", biceps ≥ ¾"):

- `UPPER_EASE` fitted = +2" bust: passes (≥ 1")
- `EASE_VALUES` slim = +2.5" hip: passes (≥ 1") — code note says stretch fabrics only
- `EASE_VALUES` regular = +4" hip: passes
- Leggings compression = −2": valid for stretch (MTM minimum doesn't apply to negative ease + stretch)
- Button-up-w standard = +3" bust: passes

No violations found.

---

## L. Bust Dart Intake — PASS

`src/engine/upper-body.js:38–48`:
Cup-size method (Cashmerette / Closet Core) when `highBust` provided:
```javascript
cupInches = chest - highBust
intake    = max(0, min(3.0, (cupInches - 2) * 0.5))
```
B cup → 0", C → 0.5", D → 1.0", F → 2.0", H → 3.0" (cap).

Aldrich: `intake = (½bust + 5cm) - (½waist + 3cm)` — total for one side.
The cup-size method is a modernized, inclusive approach that gives equivalent
results to Aldrich for a B-cup (the drafting baseline) and correctly increases
intake for larger cup sizes.

ROADMAP KI-011 ("Bust dart intake fixed at 1.5"") is marked open but is in fact
resolved by the cup-size implementation. See Flag N below.

---

## M. Shoulder Slope Angle — PASS

`src/engine/upper-body.js:114`:
```javascript
return shoulderWidth * Math.tan(slopeDeg * Math.PI / 180);
// slopeDeg default = 13
```

Aldrich and Bunka both cite 13° as the industry average shoulder slope. Matches.

---

## N. KI-011 ROADMAP Status — FLAG

`ROADMAP.md:1375`: `- [ ] KI-011 Bust dart intake fixed at 1.5" (should scale with cup size)`

This is marked OPEN but the code fix was already implemented in `upper-body.js:38–48`
(cup-size method + chest-circumference scaling fallback). The ROADMAP should be
updated to mark it closed.

---

## Recommended Actions (Prioritized)

### P1 — High (affects fit at large body sizes)

**C. Fix crotch extension defaults in all woven trouser garments.**

In each file, replace the absolute defaults with hip-derived formulas:
```javascript
// Current (absolute):
frontExt: { default: 2, max: 3 },
backExt:  { default: 3.0, max: 4.5 },

// Target (hip-derived):
// In pieces():
const frontExt = opts.frontExt ?? (m.hip / 16 + 0.2);
const backExt  = opts.backExt  ?? (m.hip / 8  + 0.5);
// Option max: 8" (to accommodate 50"+ hip)
```

Files: `straight-jeans.js`, `athletic-formal-trousers.js`, `pleated-trousers.js`,
`chinos.js`, `wide-leg-trouser-w.js`, `straight-trouser-w.js`, `wide-leg-trouser-m.js`,
`874-work-pants.js`, `cargo-work-pants.js`, `baggy-jeans.js`, `soloist-jeans.js`,
and all other woven lower-body garments.

### P2 — Medium (affects knit garment wearability)

**G. Add inline note to upper body knit garments** until the stretch block is built:
- Add a `stretchNote` field to knit garment `materials()` output or a UI warning
  explaining these patterns are calibrated for stable / low-stretch knits.
- Promote the ROADMAP stretch block to priority.

### P3 — Low (documentation / edge cases)

**A.** Add `waistToArmpit` to the recommended measurements for all upper-body garments
(currently optional). Update measurement prompt text to explain its impact on fit.

**D.** Document the 55/45 ease distribution rationale in `upper-body.js:71`.

**F.** Add comments to `a-line-dress-w.js:101` and `button-up-w.js:126` explaining
the intentional deviation from `UPPER_EASE`.

**J.** Convert `button-up.js` `NECK_DEPTH_FRONT/BACK` constants to neck-derived
formulas (follow `tee.js` pattern: `neck/6 + 0.5`).

**N.** Update ROADMAP.md to close KI-011 (bust dart intake is resolved in code).

---

## Reference Sources

See `audit-references/` for full reference documentation:

- `01-freesewing-code/FREESEWING-FORMULAS.md` — FreeSewing v4.7.0
- `02-jblockcreator-code/JBLOCKCREATOR-METHODS.md` — JBlockCreator (Harwood et al. 2020)
- `03-textbook-formulas/ALDRICH-WOMENSWEAR.md` — Aldrich, *Metric Pattern Cutting for Women's Wear*
- `03-textbook-formulas/ALDRICH-MENSWEAR.md` — Aldrich, *Metric Pattern Cutting for Menswear*
- `03-textbook-formulas/ARMSTRONG-PRINCIPLES.md` — Armstrong, *Patternmaking for Fashion Design*
- `03-textbook-formulas/MULLER-SOHN.md` — Müller & Sohn construction articles
- `04-ease-tables/BMV-EASE-CHART.md` — Vogue/Butterick/McCall ease chart
- `04-ease-tables/KNIT-STRETCH-FORMULA.md` — stretch-ratio formula + knit categories
- `04-ease-tables/MTM-WEARING-EASE-MINIMUMS.md` — MTM wearing-ease floor values
- `05-measurement-standards/FREESEWING-MEASUREMENTS.md` — measurement definitions
- `06-pattern-piece-formulas/` — per-piece formula references
- `INDEX.md` — garment-piece to reference cross-map
