# JBlockCreator — Academic Reference Implementation

Source: github.com/aharwood2/JBlockCreator  
License: Open source (University of Manchester)  
Citation: Harwood, Gill & Gill, *SoftwareX* 11 (2020) 100365,
doi:10.1016/j.softx.2019.100365

---

## Purpose

JBlockCreator is the only **peer-reviewed, open-source** implementation of
Aldrich's and Beazley & Bond's drafting methods. It is the most legally and
academically defensible reference for "what a textbook formula looks like in code."

Built to "facilitate the automated manufacture of made-to-measure clothing."
Reads 3D body-scan input; outputs ASTM/AAMA-DXF per ASTM D6673-10.

---

## Implemented Pattern Methods

| Pattern | Authority |
|---------|-----------|
| Aldrich Trouser | Aldrich *Metric Pattern Cutting for Menswear* |
| Aldrich Skirt | Aldrich *Metric Pattern Cutting for Women's Wear* |
| Beazley-Bond Bodice | Beazley & Bond *Computer-Aided Pattern Design* |
| Beazley-Bond Straight Sleeve | Beazley & Bond |
| Gill Skirt | Gill (derived from Aldrich tradition) |
| Gill Trouser Type 1 | Gill |
| Gill Trouser Type 2 | Gill |
| Gill Sweatshirt | Gill |
| Ahmed Bodice | Ahmed |

Not covered: fitted jacket, collar, waistband construction.

---

## Architecture

- `Block` base class — geometric primitives
- `Pattern` subclass — new methods added by subclassing
- Output: ASTM/AAMA-DXF (ASTM D6673-10)

---

## Issue Tracker as Audit Log

The JBlockCreator GitHub issue tracker is a record of common drafting errors
and is worth mining. Notable issues:
- #59: armhole width rule
- #63: hip-to-waist curve

---

## Key Formulas Implemented (Aldrich tradition)

### Bodice
- Scye depth (armhole level) = `chest/8 + 5.5–6.5 cm` (varies by edition)
  - Size 12 (UK): ≈ 21–22 cm from CB neckline
- Half-bust at block = `chest/2 + 5 cm` ease (close-fitting block)
- Half-waist at block = `waist/2 + 3 cm` ease
- Dart intake (one side) = `(chest/2 + 5) − (waist/2 + 3)`
- Across-back ≈ back-width measurement + small ease (~1 cm)

### Trouser / Skirt
- Front crotch extension ≈ `hip_panel_width / 4` = `hip/16`
- Back crotch extension ≈ `hip_panel_width / 2` = `hip/8`
- Back-to-front crotch ratio: 2–3× (rule of thumb: ~3×)

### Sleeve
- Cap height (tailored) ≈ `armscye_circumference / 3`
- Cap height (casual) ≈ `armscye_circumference / 5`

---

## Relationship to People's Patterns

The People's Patterns engine was not directly derived from JBlockCreator but
uses similar drafting logic. Where the two implementations diverge, JBlockCreator
(as the peer-reviewed Aldrich implementation) is the academic ground truth.

---

## Reference

Wang, R., Gill, S. & Hayes, S.G. (2025). "3D Scan Technology to Enhance Body to
Pattern Theory: Comparing the Conventional Bespoke Jacket Method with a Novel
Parametric Method," *Advances in Digital Human Modeling II*, Springer, pp. 247–257,
doi:10.1007/978-3-032-00839-8_22.
