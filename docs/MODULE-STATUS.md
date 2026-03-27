# Module Status — Interface Audit

Last updated: 2026-03-27 (v0.7.0)

Every garment module is audited against the standard export interface:

| Field | Type | Required |
|---|---|---|
| `id` | string | ✅ |
| `name` | string | ✅ |
| `category` | `'lower'` \| `'upper'` \| `'tops'` \| `'dresses'` | ✅ |
| `measurements` | `string[]` | ✅ |
| `measurementDefaults` | `Object` | recommended |
| `options` | `Object` | ✅ |
| `pieces(m, opts)` | function → `Object[]` | ✅ |
| `materials(m, opts)` | function → `Object` | ✅ |
| `instructions(m, opts)` | function → `Object[]` | ✅ |

New per-piece fields (v0.7.0):

| Field | Type | Notes |
|---|---|---|
| `edgeAllowances` | `Array<{ sa, label }>` | per-edge SA values; 6 launch modules |
| `bustDarts` | `Array<{ apexX, apexY, sideX, upperY, lowerY, intake, length }>` | bust dart geometry; 4 womenswear tops |
| `isCutOnFold` | `boolean` | explicit fold indicator (default `true` for bodice/sleeve) |

Status legend: ✅ complete · ⚠️ minor issue · ❌ broken

---

## Menswear · Bottoms

### `cargo-shorts` — Cargo Shorts
| Field | Status | Notes |
|---|---|---|
| id | ✅ | `'cargo-shorts'` |
| name | ✅ | `'Cargo Shorts'` |
| category | ✅ | `'lower'` |
| measurements | ✅ | waist, hip, rise, thigh, inseam |
| measurementDefaults | ⚠️ | Missing — inseam default falls through to global default (7″) which is unusually short for shorts; add `{ inseam: 9 }` |
| options | ✅ | ease, riseAdjust, leg, frontPocket, cargo, backPocket, fly, waistband |
| pieces() | ✅ | front panel, back panel, waistband, pockets; **edgeAllowances** ✅ |
| materials() | ✅ | |
| instructions() | ✅ | |

---

### `gym-shorts` — Gym Shorts
| Field | Status | Notes |
|---|---|---|
| id | ✅ | `'gym-shorts'` |
| name | ✅ | `'Gym Shorts'` |
| category | ✅ | `'lower'` |
| measurements | ✅ | waist, hip, rise, thigh, inseam |
| measurementDefaults | ⚠️ | Missing — same as cargo-shorts, add `{ inseam: 7 }` |
| options | ✅ | ease, riseAdjust, inseamLength, liner, drawstring, sidePanel |
| pieces() | ✅ | |
| materials() | ✅ | |
| instructions() | ✅ | |

---

### `swim-trunks` — Swim Trunks
| Field | Status | Notes |
|---|---|---|
| id | ✅ | `'swim-trunks'` |
| name | ✅ | `'Swim Trunks'` |
| category | ✅ | `'lower'` |
| measurements | ✅ | waist, hip, rise, thigh, inseam |
| measurementDefaults | ⚠️ | Missing — add `{ inseam: 5 }` for board-short default |
| options | ✅ | ease, riseAdjust, length, liner, drawstring, sidePocket, backPocket |
| pieces() | ✅ | |
| materials() | ✅ | |
| instructions() | ✅ | |

---

### `pleated-shorts` — Pleated Shorts
| Field | Status | Notes |
|---|---|---|
| id | ✅ | `'pleated-shorts'` |
| name | ✅ | `'Pleated Shorts'` |
| category | ✅ | `'lower'` |
| measurements | ✅ | waist, hip, rise, thigh, inseam |
| measurementDefaults | ⚠️ | Missing — add `{ inseam: 10 }` |
| options | ✅ | ease, riseAdjust, pleats, tab, frontPocket, backPocket |
| pieces() | ✅ | |
| materials() | ✅ | |
| instructions() | ✅ | |

---

### `straight-jeans` — Straight Jeans
| Field | Status | Notes |
|---|---|---|
| id | ✅ | `'straight-jeans'` |
| name | ✅ | `'Straight Jeans'` |
| category | ✅ | `'lower'` |
| measurements | ✅ | waist, hip, rise, thigh, inseam, knee |
| measurementDefaults | ✅ | `{ inseam: 30 }` |
| options | ✅ | ease, riseAdjust, leg, fly, frontPocket, backPocket, waistband |
| pieces() | ✅ | **edgeAllowances** ✅ |
| materials() | ✅ | |
| instructions() | ✅ | |

---

### `chinos` — Chinos
| Field | Status | Notes |
|---|---|---|
| id | ✅ | `'chinos'` |
| name | ✅ | `'Chinos'` |
| category | ✅ | `'lower'` |
| measurements | ✅ | waist, hip, rise, thigh, inseam, knee |
| measurementDefaults | ✅ | |
| options | ✅ | ease, riseAdjust, leg, frontPocket, backPocket, waistband, cuff |
| pieces() | ✅ | |
| materials() | ✅ | |
| instructions() | ✅ | |

---

### `pleated-trousers` — Pleated Trousers
| Field | Status | Notes |
|---|---|---|
| id | ✅ | `'pleated-trousers'` |
| name | ✅ | `'Pleated Trousers'` |
| category | ✅ | `'lower'` |
| measurements | ✅ | waist, hip, rise, thigh, inseam, knee |
| measurementDefaults | ✅ | |
| options | ✅ | ease, riseAdjust, pleats, leg, frontPocket, backPocket, cuff, beltLoops |
| pieces() | ✅ | |
| materials() | ✅ | |
| instructions() | ✅ | |

---

### `sweatpants` — Sweatpants
| Field | Status | Notes |
|---|---|---|
| id | ✅ | `'sweatpants'` |
| name | ✅ | `'Sweatpants'` |
| category | ✅ | `'lower'` |
| measurements | ✅ | waist, hip, rise, thigh, inseam |
| measurementDefaults | ✅ | |
| options | ✅ | ease, riseAdjust, leg, cuff, waistband, sidePocket, backPocket |
| pieces() | ✅ | |
| materials() | ✅ | |
| instructions() | ✅ | |

---

## Menswear · Tops

### `tee` — T-Shirt
| Field | Status | Notes |
|---|---|---|
| id | ✅ | `'tee'` |
| name | ✅ | `'T-Shirt'` |
| category | ✅ | `'upper'` |
| measurements | ✅ | chest, shoulder, neck, sleeveLength, bicep, torsoLength |
| measurementDefaults | ✅ | |
| options | ✅ | fit, neckline, sleeve, chestPocket |
| pieces() | ✅ | front bodice, back bodice, sleeve, neckband; **edgeAllowances** ✅ |
| materials() | ✅ | |
| instructions() | ✅ | |

---

### `camp-shirt` — Camp Shirt
| Field | Status | Notes |
|---|---|---|
| id | ✅ | `'camp-shirt'` |
| name | ✅ | `'Camp Shirt'` |
| category | ✅ | `'upper'` |
| measurements | ✅ | chest, shoulder, neck, sleeveLength, bicep, torsoLength |
| measurementDefaults | ✅ | |
| options | ✅ | fit, sleeve, chestPockets, hem |
| pieces() | ✅ | front (×2), back, sleeve, collar, facing; **edgeAllowances** ✅ |
| materials() | ✅ | |
| instructions() | ✅ | |

---

### `crewneck` — Crewneck Sweatshirt
| Field | Status | Notes |
|---|---|---|
| id | ✅ | `'crewneck'` |
| name | ✅ | `'Crewneck Sweatshirt'` |
| category | ✅ | `'upper'` |
| measurements | ✅ | chest, shoulder, neck, sleeveLength, bicep, torsoLength |
| measurementDefaults | ✅ | |
| options | ✅ | fit, shoulder, kangarooPocket, ribTrim |
| pieces() | ✅ | front, back, sleeve, collar rib, cuff ribs, hem rib |
| materials() | ✅ | |
| instructions() | ✅ | |

---

### `hoodie` — Hoodie
| Field | Status | Notes |
|---|---|---|
| id | ✅ | `'hoodie'` |
| name | ✅ | `'Hoodie'` |
| category | ✅ | `'upper'` |
| measurements | ✅ | chest, shoulder, neck, sleeveLength, bicep, torsoLength |
| measurementDefaults | ✅ | |
| options | ✅ | fit, closure, kangarooPocket, ribTrim, drawstring |
| pieces() | ✅ | front (×2 if zip), back, sleeve, hood (×2), pocket, cuffs, hem rib |
| materials() | ✅ | |
| instructions() | ✅ | |

---

### `crop-jacket` — Crop Jacket
| Field | Status | Notes |
|---|---|---|
| id | ✅ | `'crop-jacket'` |
| name | ✅ | `'Crop Jacket'` |
| category | ✅ | `'upper'` |
| measurements | ✅ | chest, shoulder, neck, sleeveLength, bicep, wrist, torsoLength |
| measurementDefaults | ✅ | |
| options | ✅ | fit, closure, pockets, lining, seams |
| pieces() | ✅ | front (×2), back, sleeve (×2), collar, pocket welt, facing |
| materials() | ✅ | |
| instructions() | ✅ | |

---

## Womenswear · Bottoms

### `wide-leg-trouser-w` — Wide-Leg Trouser
| Field | Status | Notes |
|---|---|---|
| id | ✅ | `'wide-leg-trouser-w'` |
| name | ✅ | `'Wide-Leg Trouser (W)'` |
| category | ✅ | `'lower'` |
| measurements | ✅ | waist, hip, rise, thigh, inseam, knee |
| measurementDefaults | ✅ | |
| options | ✅ | ease, riseAdjust, pleat, waistband, frontPocket, backPocket, beltLoops, cuff |
| pieces() | ✅ | |
| materials() | ✅ | |
| instructions() | ✅ | |

---

### `straight-trouser-w` — Straight Trouser
| Field | Status | Notes |
|---|---|---|
| id | ✅ | `'straight-trouser-w'` |
| name | ✅ | `'Straight Trouser (W)'` |
| category | ✅ | `'lower'` |
| measurements | ✅ | waist, hip, rise, thigh, inseam, knee |
| measurementDefaults | ✅ | |
| options | ✅ | ease, riseAdjust, leg, frontPocket, backPocket, waistband, beltLoops |
| pieces() | ✅ | |
| materials() | ✅ | |
| instructions() | ✅ | |

---

### `easy-pant-w` — Easy Pant
| Field | Status | Notes |
|---|---|---|
| id | ✅ | `'easy-pant-w'` |
| name | ✅ | `'Easy Pant (W)'` |
| category | ✅ | `'lower'` |
| measurements | ✅ | waist, hip, rise, thigh, inseam |
| measurementDefaults | ✅ | |
| options | ✅ | ease, riseAdjust, leg, waistband, sidePocket |
| pieces() | ✅ | |
| materials() | ✅ | |
| instructions() | ✅ | |

---

### `slip-skirt-w` — Slip Skirt
| Field | Status | Notes |
|---|---|---|
| id | ✅ | `'slip-skirt-w'` |
| name | ✅ | `'Slip Skirt (W)'` |
| category | ✅ | `'lower'` |
| measurements | ✅ | waist, hip, skirtLength |
| measurementDefaults | ✅ | |
| options | ✅ | ease, length, slit, waistband, closure |
| pieces() | ✅ | front panel, back panel, waistband; **edgeAllowances** ✅ |
| materials() | ✅ | |
| instructions() | ✅ | |

---

### `a-line-skirt-w` — A-Line Skirt
| Field | Status | Notes |
|---|---|---|
| id | ✅ | `'a-line-skirt-w'` |
| name | ✅ | `'A-Line Skirt (W)'` |
| category | ✅ | `'lower'` |
| measurements | ✅ | waist, hip, skirtLength |
| measurementDefaults | ✅ | |
| options | ✅ | ease, flare, waistband, pocket, closure, lining |
| pieces() | ✅ | front panel, back panel, waistband or elastic casing, optional pockets and lining; **edgeAllowances** ✅ |
| materials() | ✅ | |
| instructions() | ✅ | |

---

## Womenswear · Tops

### `button-up-w` — Button-Up Shirt
| Field | Status | Notes |
|---|---|---|
| id | ✅ | `'button-up-w'` |
| name | ✅ | `'Button-Up Shirt (W)'` |
| category | ✅ | `'tops'` — note: differs from menswear upper body `'upper'`; both values are handled by the app |
| measurements | ✅ | chest, shoulder, neck, sleeveLength, bicep, wrist, torsoLength |
| measurementDefaults | ✅ | |
| options | ✅ | fit, sleeve, collar, placket, frontPocket, hem, dart (bustDart) |
| pieces() | ✅ | **bustDarts** ✅ (when dart=yes) |
| materials() | ✅ | |
| instructions() | ✅ | |

---

### `shell-blouse-w` — Shell Blouse
| Field | Status | Notes |
|---|---|---|
| id | ✅ | `'shell-blouse-w'` |
| name | ✅ | `'Shell Blouse (W)'` |
| category | ✅ | `'tops'` |
| measurements | ✅ | chest, shoulder, neck, torsoLength |
| measurementDefaults | ⚠️ | Missing — sleeveless so no sleeveLength default needed, but adding an explicit empty object `{}` would be consistent |
| options | ✅ | fit, neckline, closure, dart (bustDart), hem |
| pieces() | ✅ | **bustDarts** ✅ (when dart=yes) |
| materials() | ✅ | |
| instructions() | ✅ | |

---

### `fitted-tee-w` — Fitted Tee
| Field | Status | Notes |
|---|---|---|
| id | ✅ | `'fitted-tee-w'` |
| name | ✅ | `'Fitted Tee (W)'` |
| category | ✅ | `'tops'` |
| measurements | ✅ | chest, shoulder, neck, sleeveLength, bicep, torsoLength |
| measurementDefaults | ✅ | |
| options | ✅ | fit, neckline, sleeve, dart (bustDart) |
| pieces() | ✅ | **bustDarts** ✅ (when dart=yes) |
| materials() | ✅ | |
| instructions() | ✅ | |

---

## Womenswear · Dresses

### `shirt-dress-w` — Shirt Dress
| Field | Status | Notes |
|---|---|---|
| id | ✅ | `'shirt-dress-w'` |
| name | ✅ | `'Shirt Dress (W)'` |
| category | ✅ | `'dresses'` |
| measurements | ✅ | chest, shoulder, neck, waist, hip, sleeveLength, bicep, fullLength |
| measurementDefaults | ✅ | |
| options | ✅ | fit, sleeve, collar, belt, skirtStyle, pocket |
| pieces() | ✅ | bodice front/back, skirt front/back, sleeve, collar, belt; **bustDarts** ✅ (when dart=yes) |
| materials() | ✅ | |
| instructions() | ✅ | |

---

### `wrap-dress-w` — Wrap Dress
| Field | Status | Notes |
|---|---|---|
| id | ✅ | `'wrap-dress-w'` |
| name | ✅ | `'Wrap Dress (W)'` |
| category | ✅ | `'dresses'` |
| measurements | ✅ | chest, shoulder, neck, waist, hip, sleeveLength, bicep, fullLength |
| measurementDefaults | ✅ | |
| options | ✅ | fit, sleeve, skirtFlare, sash, lining |
| pieces() | ✅ | bodice front (×2), back, sleeve, sash, skirt front (×2), back |
| materials() | ✅ | |
| instructions() | ✅ | |

---

## Summary

| Status | Count | Modules |
|---|---|---|
| ✅ Complete | 23 | All 23 modules pass interface audit |
| ⚠️ Minor issue | 0 | — (measurementDefaults fixed in v0.5.1) |
| ❌ Broken | 0 | — |

### Feature coverage (v0.7.0)

| Feature | Modules |
|---|---|
| **edgeAllowances** | cargo-shorts, straight-jeans, tee, camp-shirt, slip-skirt-w, a-line-skirt-w |
| **bustDarts** | button-up-w, shell-blouse-w, fitted-tee-w, shirt-dress-w |
| **grainline / fold indicator** | all pieces (rendered in pattern-view.js and print-layout.js) |
| **sanitizePoly** | all pieces (applied in app.js, offsetPolygon, and API functions) |

### Known issues

**Category inconsistency** (`'tops'` vs `'upper'`):
- Menswear tops use `category: 'upper'`; womenswear tops use `category: 'tops'`.
- Both values are handled by the app's garment registry. Not a bug, but worth standardising in a future cleanup.

**`index.js`** is the registry file, not a garment module — it exports no `id`, `name`, or interface fields. This is intentional.
