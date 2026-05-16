# FreeSewing v4.7.0 — Pattern Formulas Reference

Source: codeberg.org/freesewing/freesewing (canonical; v4.7.0 released 2026-03-27)
License: MIT (code) + CC-BY (drafts)

---

## Standard Measurement Names

Verbatim from freesewing.dev/reference/measurements/:

`ankle, biceps, bustFront, bustPointToUnderbust, bustSpan, chest, crossSeam,
crossSeamFront, crotchDepth, head, heel, highBust, highBustFront, hips,
hpsToBust, hpsToWaistBack, hpsToWaistFront, inseam, knee, neck, seat, seatBack,
shoulderSlope, shoulderToElbow, shoulderToShoulder, shoulderToWrist, underbust,
upperLeg, waist, waistBack, waistToArmpit, waistToFloor, waistToHips, waistToKnee,
waistToSeat, waistToUnderbust, waistToUpperLeg, wrist`

Derived measurements via plugins:
- `seatFront, waistFront, crossSeamBack` — `@freesewing/plugin-measurements`
- `bust` / `chest` remapping — `@freesewing/plugin-bust`

---

## Brian (Menswear Foundation Block)

### Armhole Depth — Version History

**v2 (legacy)**: armhole depth = percentage of `biceps`  
**v3 (current)**: armhole bottom located via `waistToArmpit` measurement;
biceps ease is then taken into account when calculating depth.  
The v2 behaviour is preserved behind the `legacyArmholeDepth` boolean option
(freesewing.eu/docs/designs/brian/options/legacyarmholedepth/).

### Sleeve Cap Construction

Bounding rectangle: width = biceps + `bicepsEase` + `sleevecapEase`; height
negotiated against actual armscye curve length. Cap shape = 5 Bézier curves with
anchor points. 20 user-tweakable options:

`sleevecapTopX/Y, sleevecapBackX/Y, sleevecapFrontX/Y,
sleevecapQ1…Q4 Offset / UpwardSpread / DownwardSpread`

The library **auto-fits** the cap to the armhole — i.e. the *shape* is honored but
the *length* is forced to equal armhole circumference + cap ease.

### Standard Option Names (inheritable across many designs)

`acrossBackFactor, armholeDepth, armholeDepthFactor, backNeckCutout, bicepsEase,
chestEase, collarEase, cuffEase, draftForHighBust, frontArmholeExtraCutout,
legacyArmholeDepth, lengthBonus, shoulderEase, shoulderSeamShiftArmholeSide,
shoulderSeamShiftCollarSide, shoulderSlopeReduction, sleeveLengthBonus,
sleeveWidthGuarantee`

---

## Bella (Womenswear Foundation Block)

Womenswear equivalent of Brian. Uses `highBust` for dart calculation via
`@freesewing/plugin-bust`. Key difference from Brian: darts drafted from cup-size
method rather than fixed intake.

---

## Charlie (Trousers)

Key options: `crossSeamAngle, crossSeamBend, crotchDrop`

Crotch length is driven by the `crossSeam` measurement (FreeSewing name for the
total crotch-seam length from front waist through crotch to back waist = ISO
"crotch length total"). Inseam = `inseam` measurement.

---

## Aaron (Knit A-Shirt)

Key options: `armholeDrop, stretchFactor`

The `stretchFactor` option directly applies negative ease to the pattern by
multiplying all horizontal measurements by `(1 - stretchFactor)`. This is the
reference implementation for knit negative ease in FreeSewing.

---

## Crux (Climbing Pants — added v4.6.0)

New in v4.6.0. Designed for high-stretch technical fabric. Uses `crossSeam` and
`inseam` with an aggressive crotch gusset.

---

## FreeSewing Best Practices

From freesewing.dev/guides/best-practices/:

> "Resist the temptation to use an absolute value for any seam allowance… Instead,
> always use a multiple of the `sa` value."

> "Embrace percentages as options. By using values that are percentages of
> measurements, the values will scale and continue to work as the measurements
> scale up or down."

**Audit implication**: Any absolute-value constant (in/cm) that should scale with
body size is a candidate defect. Examples: neck depth, cuff height, pleat depth
(structural details acceptable) vs. armhole depth, crotch extension (must scale).

---

## Key Numerical Defaults

Exact `pct` defaults live in `designs/<name>/src/options.mjs` on Codeberg.
Unverified community approximations (treat as rough guides only):

- `armholeDepthFactor` (v2 legacy): ~60% of biceps
- `bicepsEase` default: ~10–15% of biceps
- `chestEase` default: ~15–20% of chest
- `sleevecapEase` default: ~1–1.5" for woven set-in

---

## Citation

FreeSewing is the only mature MTM codebase drafting from individual body
measurements with a documented, named option vocabulary. Treat its option names
as the audit vocabulary. Where People's Patterns disagrees with FreeSewing AND
a textbook, that disagreement is a defect candidate.
