# Audit References — Index

Maps each garment-piece type to the reference files that address it.

---

## How to Use

1. Find the garment piece type in the table below.
2. Open the referenced file(s) to get the ground-truth formula.
3. Compare to the People's Patterns implementation.
4. Classify: PASS / WARN / DEFECT.

For each comparison, anchor to **two independent sources** (e.g. a code implementation
+ a textbook). Where PP disagrees with two of these three, flag as DEFECT.

---

## Piece Type → Reference Files

| Garment piece type | Primary references | Secondary references |
|--------------------|--------------------|---------------------|
| **Bodice front/back** | `06-pattern-piece-formulas/BODICE.md` | `03-textbook-formulas/ALDRICH-WOMENSWEAR.md`, `01-freesewing-code/FREESEWING-FORMULAS.md` |
| **Armhole depth** | `06-pattern-piece-formulas/BODICE.md` | `03-textbook-formulas/ALDRICH-MENSWEAR.md`, `01-freesewing-code/FREESEWING-FORMULAS.md` |
| **Set-in sleeve / cap height** | `06-pattern-piece-formulas/SLEEVE.md` | `03-textbook-formulas/ALDRICH-MENSWEAR.md`, `02-jblockcreator-code/JBLOCKCREATOR-METHODS.md` |
| **Sleeve cap ease** | `06-pattern-piece-formulas/SLEEVE.md` | `04-ease-tables/BMV-EASE-CHART.md` |
| **Trousers / pants (front panel)** | `06-pattern-piece-formulas/TROUSERS.md` | `03-textbook-formulas/ALDRICH-MENSWEAR.md` |
| **Trousers / pants (back panel)** | `06-pattern-piece-formulas/TROUSERS.md` | `03-textbook-formulas/ALDRICH-MENSWEAR.md`, `02-jblockcreator-code/JBLOCKCREATOR-METHODS.md` |
| **Crotch curve** | `06-pattern-piece-formulas/TROUSERS.md` | `02-jblockcreator-code/JBLOCKCREATOR-METHODS.md` |
| **Skirt (straight/pencil)** | `06-pattern-piece-formulas/SKIRTS.md` | `03-textbook-formulas/ALDRICH-WOMENSWEAR.md` |
| **Skirt (A-line)** | `06-pattern-piece-formulas/SKIRTS.md` | `03-textbook-formulas/ALDRICH-WOMENSWEAR.md` |
| **Skirt (circle)** | `06-pattern-piece-formulas/SKIRTS.md` | `03-textbook-formulas/ALDRICH-WOMENSWEAR.md` |
| **Collar (convertible, band)** | `06-pattern-piece-formulas/COLLAR-WAISTBAND.md` | `03-textbook-formulas/MULLER-SOHN.md` |
| **Collar (shirt with stand)** | `06-pattern-piece-formulas/COLLAR-WAISTBAND.md` | `03-textbook-formulas/MULLER-SOHN.md` |
| **Waistband** | `06-pattern-piece-formulas/COLLAR-WAISTBAND.md` | `05-measurement-standards/FREESEWING-MEASUREMENTS.md` |
| **Cuff** | `06-pattern-piece-formulas/COLLAR-WAISTBAND.md` | `01-freesewing-code/FREESEWING-FORMULAS.md` |
| **Ease values (woven)** | `04-ease-tables/BMV-EASE-CHART.md` | `03-textbook-formulas/ALDRICH-WOMENSWEAR.md` |
| **Ease values (knit/stretch)** | `04-ease-tables/KNIT-STRETCH-FORMULA.md` | `01-freesewing-code/FREESEWING-FORMULAS.md` |
| **MTM minimums** | `04-ease-tables/MTM-WEARING-EASE-MINIMUMS.md` | `04-ease-tables/BMV-EASE-CHART.md` |
| **Measurement definitions** | `05-measurement-standards/FREESEWING-MEASUREMENTS.md` | `03-textbook-formulas/ALDRICH-WOMENSWEAR.md` |
| **Bust dart intake** | `06-pattern-piece-formulas/BODICE.md` | `03-textbook-formulas/ALDRICH-WOMENSWEAR.md` |
| **Shoulder slope** | `03-textbook-formulas/ALDRICH-MENSWEAR.md` | `01-freesewing-code/FREESEWING-FORMULAS.md` |
| **Neckline width** | `06-pattern-piece-formulas/BODICE.md` | `03-textbook-formulas/ALDRICH-MENSWEAR.md` |

---

## People's Patterns Garment → Category

| Category | Garments |
|----------|---------|
| **Upper body woven** | button-up, button-up-w, camp-shirt, chore-coat, crop-jacket, denim-jacket, athletic-formal-jacket, moto-jacket, shell-blouse-w, shirt-dress-w |
| **Upper body knit** | tee, crewneck, henley, polo-shirt, turtleneck, tank-top, fitted-tee-w, dolman-top-w, kids-tee |
| **Hooded / sweatshirt** | hoodie, scholar-hoodie, open-cardigan |
| **Dress (woven)** | a-line-dress-w, slip-dress-w, sundress-w, trapeze-dress-w, wrap-dress-w, kids-dress |
| **Dress (knit)** | tshirt-dress-w |
| **Trouser (woven)** | athletic-formal-trousers, chinos, pleated-trousers, straight-trouser-w, wide-leg-trouser-m, wide-leg-trouser-w, 874-work-pants, cargo-work-pants |
| **Jeans** | straight-jeans, soloist-jeans, baggy-jeans |
| **Shorts** | baggy-shorts, cargo-shorts, gym-shorts, lounge-shorts, pleated-shorts, kids-shorts |
| **Casual pants** | easy-pant-w, pajama-pants, sweatpants, scholar-sweatpants |
| **Leggings / stretch** | leggings, kids-leggings, kids-joggers |
| **Skirt** | a-line-skirt-w, circle-skirt-w, maxi-skirt-w, mini-skirt-w, pencil-skirt-w, slip-skirt-w |
| **Children's** | kids-tee, kids-dress, kids-shorts, kids-leggings, kids-joggers |
| **Accessories** | apron, bow-tie, dog-bandana, keepall-duffel, scrunchie, tote-bag, zippered-pouch |

---

## Audit Priority Order

1. **Crotch extension defaults** — affects all 31 lower-body garments; potential DEFECT at large sizes
2. **Armhole depth formula** — affects all 28 upper-body garments; WARN
3. **Sleeve cap height methodology** — affects all garments with set-in sleeves; WARN
4. **Upper body ease distribution** (55/45 split) — affects all upper garments; WARN
5. **Ease override inconsistencies** — specific garments; WARN
6. **Knit negative ease** — upper body knits; WARN (ROADMAP acknowledges gap)
7. **Neck depth hardcoded constants** — button-up family; WARN
8. **Circle skirt formula** — PASS (architecture-correct)
9. **Waist-to-armpit promotion** — users should be prompted to provide this measurement
