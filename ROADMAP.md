# People's Patterns — Roadmap

_Last updated: 2026-03-25 · v0.5.1_

---

## Phase 1 — MVP

Everything that must be true before showing this to anyone.

### Branding
- [x] Rename app to People's Patterns across all files
- [x] Header tagline: "made-to-measure sewing patterns"
- [x] Print layout cover page + tile footers stamped with brand, peoplespatterns.com, @peoplespatterns
- [x] package.json name: `peoples-patterns`

### Print Layout
- [x] Tiled print output at 1:1 scale (US Letter, A4, Tabloid, A0/plotter)
- [x] Scale verification page — 2×2 in + 5×5 cm squares
- [x] Tile assembly map
- [x] Registration crosshairs at all four corners
- [x] Print-safe margins — all content within safe boundary
- [x] Materials & stitch guide page
- [x] Numbered construction steps page
- [x] Cover page with garment name, measurements used, pattern options
- [ ] True PDF export (not just browser print-to-PDF)
- [ ] DXF export for plotters

### Line Styles & Visual Quality
- [x] Solid cut line, dashed stitch line
- [x] SA legend on every pattern piece SVG
- [x] Pleat fold lines rendered on pleated front panels
- [x] Waist SA angle fixed on lower body panels

### SA Rendering
- [x] **KI-001 ✅** SA outline now uses perpendicular edge offsetting on all bodice/sleeve pieces (was: inaccurate centroid scaling)
- [x] **KI-005 ✅** Wrap dress front bodice fold annotation corrected; `isCutOnFold: false` suppresses fold edge label correctly
- [ ] **KI-002** SA corner spikes at acute angles — crotch extension corner, V-neck apex.
  - `geometry.js:124` already has a 2.5× miter cap with bevel fallback — may already be fixed.
  - Crotch corner is ~90°, unlikely to spike. V-neck apex is higher risk: SA asymmetry (neckline=sa, fold edge=0) can push the miter along the fold line, but calculated offset (~0.6″) is within the 2.5× cap for typical V-neck geometry.
  - **To verify:** load slim tee (V-neck) + slim cargo shorts, inspect SA cut line at both corners visually.
  - **If still spiky:** change `* 2.5` → `* 1.5` at `geometry.js:124` (one line). If bevel fallback looks jagged at V-neck, add angle threshold (only miter if corner angle > ~30°).
- [ ] **KI-006** Wrap dress skirt panels use `type: 'bodice'` SA rendering (approximate). Fix: switch to `type: 'panel'` or dedicated trapezoid renderer

### Module Issues
- [x] **KI-007 ✅** `measurementDefaults` added to cargo-shorts, gym-shorts, swim-trunks, pleated-shorts, shell-blouse-w
- [x] **KI-008 ✅** `tee.js` option key renamed `ease` → `fit` for consistency with all other upper-body modules
- [ ] **KI-003** Slant pocket indicator doesn't annotate mirror direction (visual only, no geometry error). Fix: add note on mirrored panel
- [ ] **KI-004** Crotch extension label clips when ext < ~0.5″ on slim-fit shorts/trousers. Fix: clamp label x to minimum safe margin
- [x] **KI-009 ✅** Category `'tops'` vs `'upper'` inconsistency — all 23 modules already use `'upper'` or `'lower'` consistently. No change needed.

### 6 Launch Patterns — Code Complete + Muslin Tested
All 23 modules are code-complete. The 6 launch patterns need to be generated, printed, tiled, cut in muslin, and fit-checked.

| Pattern | Module | Code | Muslin |
|---|---|---|---|
| Cargo Shorts | `cargo-shorts` | ✅ | ⬜ pending |
| Straight Leg Jeans | `straight-jeans` | ✅ | ⬜ pending |
| T-Shirt | `tee` | ✅ | ⬜ pending |
| Button-Up / Camp Shirt | `camp-shirt` | ✅ | ⬜ pending |
| A-Line Skirt | `a-line-skirt-w` | ✅ | ⬜ pending |
| Wide-Leg Trouser | `wide-leg-trouser-w` | ✅ | ⬜ pending |

### UI & App
- [x] 4-step flow: Choose → Measure → Customize → Pattern
- [x] Saved measurement profiles (localStorage)
- [x] Inline measurement guide with SVG diagrams
- [x] Fabric yardage calculator
- [x] Rise presets (low / mid / high / ultra-high)
- [x] Dark mode (persistent via localStorage)
- [ ] React + Tailwind migration (current: vanilla JS)
- [ ] Full-screen step views with fixed stepper/breadcrumb bar
- [ ] Slide/fade transitions between steps
- [ ] Mobile-friendly measurement input
- [ ] cm / inch toggle

---

## Phase 2 — Launch

### Accounts & Payments
- [ ] Account + login required to generate/download
- [ ] Stripe checkout — per-pattern purchase ($9–15)
- [ ] Monthly membership — unlimited or throttled downloads, saved profiles, fit history, pattern library, discounts ($9–15/mo)
- [ ] Gift cards (Stripe)
- [ ] Cart for multi-pattern checkout

### Pattern Protection
- [ ] Watermarked low-res preview until purchase
- [ ] Full print-ready file unlocked after payment
- [ ] Downloaded patterns stamped with customer name, order number, email, date
- [ ] Patterns in account history only, no public links
- [ ] Rate-limit downloads
- [ ] Commercial-use terms for microbrands and businesses

### Email & Landing Page
- [ ] Domain live (peoplespatterns.com)
- [ ] Landing page — 10-second explanation above the fold
- [ ] Email capture for free tier
- [ ] "How to measure yourself" written guide + video embed

### Content — Pre-Launch
- [ ] Instagram (@peoplespatterns) — 2–3 weeks of content before launch
- [ ] TikTok — 2–3 weeks of content before launch
- [ ] YouTube channel set up
- [ ] Build-in-public content: app development process
- [ ] Behind the scenes: sewing the patterns, muslin fitting sessions
- [ ] Tiny tutorials: SA explainer, tiling explainer, how to measure yourself

### Sew-Along Videos
One video per launch pattern: measure → generate → print → tile → cut → sew → finished garment.

- [ ] Cargo Shorts
- [ ] Straight Leg Jeans
- [ ] T-Shirt
- [ ] Button-Up / Camp Shirt
- [ ] A-Line Skirt
- [ ] Wide-Leg Trouser

### Social Launch
- [ ] Reddit: r/sewing, r/sewhelp, r/learnmachinesewing
- [ ] Facebook sewing groups
- [ ] Referral program — "give a friend a free pattern, get a free pattern"

---

## Phase 3 — Growth

### Physical Products & Affiliates
- [ ] Etsy shop — sized (non-custom) versions of the 6 launch patterns for sewists who prefer not to enter measurements
- [ ] Branded beginner sewing tool kit ($25–35): tape measure, chalk, pins, seam ripper, needles — upsell at first pattern purchase
- [ ] Branded sewing tape measure as standalone product
- [ ] Fabric company affiliate links on the materials page per garment
- [ ] Amazon notions affiliate links

### Community & Retention
- [ ] Fit feedback loop — post-sew prompt ("how did it fit?") with structured options (too tight at chest, crotch too low, torso too long, etc.) to refine geometry over time
- [ ] Shareable pattern links (view-only, watermarked)
- [ ] Saved garment drafts (beyond measurement profiles)
- [ ] Re-download with updated measurements, named saves (e.g. "Me Jan 2026", "Client A")
- [ ] Pattern version history
- [ ] Seasonal collections — quarterly themed drops with email campaign
- [ ] Fashion students and schools — bulk / institutional pricing

### Additional Garment Modules
Target: one new module per week post-launch.

| Garment | Priority |
|---|---|
| Blazer / structured jacket | high |
| Trousers with proper fly-front geometry | high |
| Knit dress | high |
| Button-down shirt (chambray, linen, cotton, flannel) | high |
| Sundress (pockets, collar options, strap options, back options) | high |
| Quarter-zip | medium |
| Boxers / panties | medium |
| Circle skirt | medium |
| Bias-cut skirt | medium |
| Kids sizing (all categories) | medium |

### Drafting & Accuracy
- [ ] Dart rotation and manipulation (bust, shoulder, waist)
- [ ] Grading between sizes
- [ ] Ease value fine-tuning per body section (hip vs. waist vs. chest independently)
- [ ] Curved / contoured waistbands
- [ ] Seam notch marks and drill holes on all exported pieces
- [ ] Piece nesting / layout optimizer to minimize fabric waste

### Output Formats
- [ ] Layered PDFs with per-layer SA toggle and fabric cut plan
- [ ] Size chart import (industry sizing, custom)

---

## All Modules — Current Status

23 modules total · 23 code-complete · 0 broken · 4 open minor issues (KI-002, KI-003, KI-004, KI-009)

| Module | Garment | Code | Muslin |
|---|---|---|---|
| `cargo-shorts` | Cargo Shorts | ✅ | ⬜ |
| `gym-shorts` | Gym Shorts | ✅ | — |
| `swim-trunks` | Swim Trunks | ✅ | — |
| `pleated-shorts` | Pleated Shorts | ✅ | — |
| `straight-jeans` | Straight Jeans | ✅ | ⬜ |
| `chinos` | Chinos | ✅ | — |
| `pleated-trousers` | Pleated Trousers | ✅ | — |
| `sweatpants` | Sweatpants | ✅ | — |
| `tee` | T-Shirt | ✅ | ⬜ |
| `camp-shirt` | Camp Shirt | ✅ | ⬜ |
| `crewneck` | Crewneck Sweatshirt | ✅ | — |
| `hoodie` | Hoodie | ✅ | — |
| `crop-jacket` | Crop Jacket | ✅ | — |
| `wide-leg-trouser-w` | Wide-Leg Trouser (W) | ✅ | ⬜ |
| `straight-trouser-w` | Straight Trouser (W) | ✅ | — |
| `easy-pant-w` | Easy Pant (W) | ✅ | — |
| `slip-skirt-w` | Slip Skirt (W) | ✅ | — |
| `a-line-skirt-w` | A-Line Skirt (W) | ✅ | ⬜ |
| `button-up-w` | Button-Up Shirt (W) | ✅ | — |
| `shell-blouse-w` | Shell Blouse (W) | ✅ | — |
| `fitted-tee-w` | Fitted Tee (W) | ✅ | — |
| `shirt-dress-w` | Shirt Dress (W) | ✅ | — |
| `wrap-dress-w` | Wrap Dress (W) | ✅ | — |

_⬜ = muslin required before launch · — = not a launch pattern_
