# Collar and Waistband — Reference Formulas

---

## Collar Types

### Convertible (One-Piece) Collar
```
length = front_neckline + back_neckline  (measured at seam line)
height = stand + fall (typically 3–4" combined)
```

### Two-Piece Shirt Collar (Stand + Collar)
| Part | Dimension |
|------|-----------|
| Stand height | ~1" (2.5 cm) |
| Gap height | ~2" (5 cm) |
| Fall height | ~1.5" (4 cm) |
Total stand width = ~2.5–3" finished

### Mandarin / Band Collar (Müller & Sohn)
```
lower_neckline_drop:
  at shoulder: 1 cm
  at CB: 0.5 cm
  at CF: 1.5 cm
collar_height: 3.5–4.5 cm
collar_length ≈ neckline_length - 0.5 cm  (to fit close to neck)
```

### Notch / Men's Tailored Collar
```
stand:  1⅛–1¼" (2.9–3.2 cm)
fall:   1⅝–1¾" (4.1–4.4 cm)
shift:  ½–⅞" (varies with size and break point)
```

### Müller & Sohn Stand-Up Collar Heights (3-segment)
```
stand: 4.5 cm
roll:  4.5 cm
fall:  5.5 cm
```

---

## Collar Notes

- Collar length must equal neckline seam-line length (not neckline minus SA)
- To make a collar that flares away from neck: increase CB collar seam length
- Stand height controls how high the collar sits; fall height controls how wide
  the collar appears when open
- People's Patterns button-up.js: collar pieces are derived from neck circumference
  and neckline arc length

---

## Waistband

### Formulas
```
waistband_length = seam_line_waist + overlap_allowance
seam_line_waist  = body_waist + wearing_ease (typically 0–1")
overlap_allowance = 1.5–2" for button + buttonhole (or hook + eye)
                  = 0" for invisible zip (closed at seam line)

waistband_width_cut = 2 × finished_height + 2 × SA
typical finished height: 1–1.5" (classic), 2–3" (wide/paperbag)
```

### People's Patterns Implementation
- Template note: add `+2"` for button/zip overlap (`TEMPLATE.js`)
- Athletic trousers elastic waistband: `wbLen = m.waist + 2 + sa × 2`
  (woven elastic: body waist + 2" overlap + SA both ends)
- Pleated trousers fly waistband: `FLY_OVERLAP = 1.875"` (5/8" underlap + 1¼" buttonhole)

### Contour Waistband
Shape with French curve from waist to high hip. Used when waist-hip difference > 5".
Length = same formula; width curved rather than straight.

---

## Cuff

```
cuff_length = wrist + cuff_ease + button_overlap (~2 cm)
sleeve_hem_circumference >= cuff_length + movement_allowance (5–7 cm min)
```

FreeSewing `cuffEase` option default ≈ 20% of wrist for casual shirts.

People's Patterns: cuff height is hardcoded at `CUFF_H = 4.5"` in camp-shirt.js
(doubled = 2.25" finished). Cuff length is derived from wrist + ease.
