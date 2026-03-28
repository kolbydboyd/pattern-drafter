# People's Patterns — Roadmap

_Last updated: 2026-03-27 · v0.7.0_

---

## North Star

The gap between a $20 generic indie pattern that 
doesn't fit and a $150 custom-drafted pattern is 
completely uncontested. We own that gap at $7–10.

**Revenue targets:**
- Break even (recoup build cost): $2,500–3,000
- Meaningful income: $50,000/year
- Life-changing: $120,000–200,000/year
- Ceiling without a team: $300,000–500,000/year

**The data play (2–3 year horizon):**
As fit feedback accumulates — thousands of people 
reporting "waist right, hip too tight" — we build 
the most detailed real-body fit dataset in existence. 
No clothing brand, pattern company, or fabric 
manufacturer has this. It becomes a licensable asset.

---

## Current Status — v0.7.0

23 garment modules · all code-complete · all bugs fixed
Per-edge seam allowances on 6 launch patterns
Bust dart geometry on 4 womenswear tops
Polygon sanitizer applied everywhere
Single-engine PDF renderer with scale verification
6 launch patterns need muslin testing
App live at peoplespatterns.com

---

## Immediate — This Week

- [ ] **Sew 6 launch muslins** (the actual critical path)
  - [ ] Cargo Shorts
  - [ ] Straight Jeans
  - [ ] T-Shirt
  - [ ] Camp Shirt
  - [ ] A-Line Skirt
  - [ ] Wide-Leg Trouser (W)
- [ ] Add social icons to landing page
      (Instagram, TikTok, YouTube, Pinterest, Newsletter)
      Gold in dark mode · warm brown in light mode
- [ ] Make repo private

---

## Phase 1 — Pre-Launch Infrastructure

### Email List (do first — before any content)
- [ ] Set up email provider (Resend, Mailchimp, or 
      ConvertKit — ConvertKit best for creators)
- [ ] Embed signup form on landing page
- [ ] Set up welcome email sequence:
      Email 1: "Here's how to measure yourself"
      Email 2: "Your first pattern — what to expect"
      Email 3: "How tiled PDFs work"
- [ ] Add fit feedback form (post-sew survey):
      "How did your pattern fit?"
      Fields: garment, which measurement was off,
      too big/small/right, photo upload optional
      → This is the data play. Collect from day one.

### Supabase — Accounts (do second)
- [ ] Set up Supabase project (free tier)
- [ ] Email/password auth
- [ ] Cloud measurement profiles
      (replaces fragile localStorage)
- [ ] Fit history per user
- [ ] Download history
- [ ] Switching cost grows with every saved profile

### Stripe — Payments (do third)
- [ ] Stripe account and product setup
- [ ] Per-pattern pricing by complexity:
      Beginner (gym shorts, slip skirt): $7
      Intermediate (tee, cargo shorts): $8
      Advanced (jeans, shirt dress): $10
      Complex (blazer, structured jacket): $12
      No price difference between men's and 
      women's equivalents — no pink tax.
- [ ] Subscription: $12–15/month
      Unlimited downloads + saved profiles + 
      fit history + new pattern notifications
- [ ] Watermarked preview until purchase
- [ ] PDF stamped with name, order number, 
      email, date after payment
- [ ] Backend PDF authorization
      (currently bypassable client-side)
- [ ] Gift cards

### Landing Page
- [ ] 10-second explanation above the fold
- [ ] Social links: Instagram, TikTok, YouTube,
      Pinterest, Newsletter
- [ ] "How to measure yourself" guide + video embed
- [ ] Email capture prominent above fold
- [ ] Before/after fit comparison visual

---

## Phase 2 — Launch Content

### Accounts Already Set Up ✅
- Instagram @peoplespatterns
- TikTok
- YouTube
- Pinterest
- Newsletter

### Content Queue (2–3 weeks before launch)
- [ ] Before/after fit video — TikTok first
      Standard-sized pattern that gaps at waist
      vs same garment from custom pattern on 
      same body. 30 seconds. This is the viral format.
- [ ] "I generated a jeans pattern for $8" series
- [ ] Muslin fitting session videos
- [ ] How tiled PDFs work (demystify the format)
- [ ] How to measure yourself (short form)
- [ ] Build-in-public content

### Sew-Along Videos (one per launch pattern)
measure → generate → print → tile → cut → sew → finished

- [ ] Cargo Shorts
- [ ] Straight Jeans
- [ ] T-Shirt
- [ ] Camp Shirt
- [ ] A-Line Skirt
- [ ] Wide-Leg Trouser

### Community Launch
- [ ] PatternReview.com designer account
      (593k members — most influential sewing community)
      List patterns in independent shop
      Post introducing made-to-measure concept
      Engage with reviews — these become social proof
- [ ] Reddit: r/sewing, r/sewhelp, r/myog
- [ ] Seed 50–100 free downloads to sewists
      with 5k–50k followers
      In exchange for honest documented makes
- [ ] Referral program:
      Give a friend a free pattern, get a free pattern

---

## Phase 3 — Revenue Expansion

### Affiliate Links (passive, implement early)
- [ ] Embed affiliate links in every materials list
      Fabric recommendations → Mood Fabrics, 
      Fabric.com, Hawthorne Supply Co
      Notions → Amazon, local craft suppliers
      Thread, needles, interfacing — all affiliate
- [ ] Every pattern download = potential $5–15 
      in affiliate revenue on the materials purchase
      1,000 downloads/month = $5,000–15,000/month
      passive affiliate income

### Etsy + Craftsy Shop
- [ ] Build grading function — run engine with 
      standard size chart measurements
      (XS/S/M/L/XL/2X/3X — unisex sizing)
- [ ] Generate sized PDFs for 6 launch patterns
- [ ] List on Etsy ($12–15 per pattern)
- [ ] List on Craftsy (sewing-specific platform)
- [ ] Different audience than direct site — 
      pure incremental revenue, zero extra work
      once grading is built

### Physical Products
- [ ] Branded beginner kit ($25–30)
      Tape measure, chalk, pins, seam ripper, 
      needles, seam gauge
      Upsell at first pattern purchase
      Target 10% attach rate
- [ ] Branded tape measure as standalone ($12–15)
- [ ] Etsy listings for physical kits

### Professional / Institutional Tier
- [ ] $50/month professional plan
      Commercial use rights
      Client measurement profile management
      Bulk downloads
      Targets: small fashion labels, costume 
      designers, theater wardrobe, tailors,
      fashion students
- [ ] School / institutional bulk pricing

---

## Phase 4 — Catalog Growth

### New Modules (one validated per week post-launch)
Validation = code + muslin + fit confirmed

#### Tier 1 — High demand, beginner-friendly, fast to build
These use existing engine geometry with minimal new math.

| Garment | Type | Difficulty | Engine needs | FreeSewing ref |
|---|---|---|---|---|
| Circle skirt | skirt | beginner | ring-sector math (reuse curved waistband v2) | sandy |
| Pencil skirt | skirt | beginner | straight panels + back vent/kick pleat | penelope |
| Tank top / A-shirt | upper | beginner | sleeveless bodice, wide straps | aaron |
| Boxer briefs | underwear | beginner | small panels, elastic waist, knit | bruce |
| Leggings | lower | beginner | knit stretch panels, elastic waist | lily, lumina |
| Apron | accessory | beginner | flat rectangle + ties, no fitting | albert |
| Bow tie | accessory | beginner | flat pattern, no fitting | benjamin |
| Flat cap | accessory | beginner | crown + brim panels | florent |

#### Tier 2 — Strong demand, intermediate, some new geometry
These require moderate new engine functions or garment-specific logic.

| Garment | Type | Difficulty | Engine needs | FreeSewing ref |
|---|---|---|---|---|
| Sundress | dress | intermediate | bodice + gathered/A-line skirt, straps | sophie (slip dress) |
| Knit dress | dress | intermediate | stretch bodice + straight/A-line skirt | onyx (one-piece) |
| Draped top | upper | intermediate | drape cowl neckline geometry | diana |
| Overalls | full body | intermediate | bib front, suspender straps, trouser base | opal |
| Romper | full body | intermediate | bodice + shorts, single garment | otis |
| Wrap pants | lower | intermediate | overlap panels, tie waist | waralee |
| Cycling shorts | lower | intermediate | high-stretch panels, chamois pad | cornelius |
| Classic button-up shirt (M) | upper | intermediate | collar stand, yoke, sleeve placket | simon |
| Waistcoat / vest | upper | intermediate | front panels + back, welt pockets | wahid |
| Quarter-zip pullover | upper | intermediate | half-placket, stand collar | - |
| Swimshirt / rash guard | upper | intermediate | knit, raglan or set-in, UPF fabric | shelly |
| Bikini top | swimwear | intermediate | cups, ties/bands, stretch | bee |

#### Tier 3 — Aspirational, advanced/expert, significant new engine work
These need new geometry (collars, tailoring, structure) or complex piece counts.

| Garment | Type | Difficulty | Engine needs | FreeSewing ref |
|---|---|---|---|---|
| Denim trucker jacket | jacket | expert | already built (v0.8.0) | - |
| Blazer / sport coat | jacket | expert | lapel/gorge line, welt pockets, canvas | jaeger |
| Coat (overcoat) | jacket | expert | extended blazer block, lining, deep hem | carlita/carlton |
| Trench coat | jacket | expert | storm flap, gun flap, belt, epaulettes | - |
| Corset | structure | expert | boning channels, busk, lacing | cathrin |
| Tailored shirt (W) | upper | advanced | princess seams, collar variations | simone |
| Puffy pants | lower | advanced | volume, gathering, elastic | percy |

#### Tier 4 — Niche / novelty / seasonal
Fun patterns that drive social engagement and seasonal sales.

| Garment | Type | Difficulty | Notes |
|---|---|---|---|
| Tote bag | bag | beginner | MYOG gateway pattern, huge Etsy demand |
| Crossbody bag | bag | beginner | adjustable strap, zipper |
| Messenger bag | bag | intermediate | flap, buckle, laptop sleeve | magde |
| Duffle bag | bag | intermediate | cylinder geometry, handles, zipper |
| Daypack / backpack | bag | advanced | structured panels, straps, padding |
| Face mask | accessory | beginner | flat or contoured, elastic/ties | florence |
| Deerstalker hat | accessory | intermediate | 4 panels + ear flaps | holmes |
| Handbag | bag | intermediate | structured sides, handles, lining | hortensia |
| Tie (necktie) | accessory | beginner | bias-cut, slip stitch lining | trayvon |
| Halloween costume base | costume | intermediate | seasonal, October launch |
| Holiday party dress | dress | intermediate | seasonal, November launch |
| Plush toy (octopus) | novelty | beginner | social media magnet, kid-friendly | octoplushy |

### Sewing skills / engine capabilities needed for expansion

| Skill / capability | Unlocks | Priority |
|---|---|---|
| Stretch/knit block | Leggings, bikini, swimshirt, boxer briefs, knit dress | high |
| Ring-sector math | Circle skirt, curved waistband (v2 plan exists) | high |
| Collar drafting (spread, notch lapel) | Blazer, coat, tailored shirt | medium |
| Two-part sleeve (already built) | Denim jacket (done), blazer, coat | done |
| Yoke split (already built) | Denim jacket (done), western shirts | done |
| Gathering/ease distribution | Sundress, puffy pants, dirndl | medium |
| Boning/channel layout | Corset, structured bodice | low |
| Cylinder geometry | Duffle bag, bucket hat | low |
| Bias grain calculation | Necktie, bias-cut skirt | low |
| Lining pieces (auto-generate) | Blazer, coat, lined skirt, handbag | medium |

### Build order recommendation

**Month 1 post-launch** (beginner patterns, fast catalog growth):
1. Circle skirt — uses curved waistband v2 engine
2. Pencil skirt — straight panels, minimal new geometry
3. Boxer briefs — introduces knit/stretch block
4. Tank top — sleeveless variant of existing bodice
5. Tote bag — MYOG gateway, Etsy listing

**Month 2** (intermediate, fills catalog gaps):
6. Leggings — stretch block (from boxers)
7. Classic button-up shirt (M) — collar stand + yoke
8. Sundress — bodice + gathered skirt
9. Overalls — trouser block + bib
10. Crossbody bag — second MYOG pattern

**Month 3** (advanced, flagship patterns):
11. Blazer — biggest single unlock for the catalog
12. Waistcoat — shares block with blazer
13. Knit dress — stretch bodice + skirt
14. Messenger bag — structured MYOG

**Month 4+** (niche, seasonal, novelty):
15-20. Costume base, holiday dress, plush toy, hat, tie, etc.

### MYOG Push (Month 2-3)
- [ ] Tote, crossbody — list on r/myog immediately
- [ ] Duffle, daypack — post after bag modules proven
- [ ] Technical backpack — long-term, high complexity

### Seasonal
- [ ] Halloween costume base — target October launch
- [ ] Holiday party dress — target November
- [ ] Swimwear (bikini, rash guard) — target June

---

## Phase 5 — The Data Play

### Fit Feedback Collection
- [ ] Post-sew survey on every download page
- [ ] Structured fields:
      Which measurement was off?
      How much (too big / too small by how much)?
      Overall fit rating
      Photo upload (optional)
- [ ] Aggregate by measurement + size range
- [ ] Feed corrections back into geometry
      (each module gets a correction factor
      based on real-world fit reports)

### What This Becomes
- Most detailed real-body fit dataset for 
  home sewists ever assembled
- No clothing brand, pattern company, or 
  fabric manufacturer has this
- Licensable to:
  Fabric companies understanding body diversity
  Clothing brands improving sizing
  Pattern companies modernizing blocks
  Academic textile research
- Timeline: meaningful data at ~5,000 fit reports
  Licensable asset at ~50,000 fit reports

---

## Technical Debt & Improvements

### Open Known Issues
- [x] KI-002 SA corner spikes at acute angles
      (mitigated: 2.5× miter cap + sanitizePoly dedup/collinear removal)
- [ ] KI-003 Slant pocket mirror annotation
- [ ] KI-004 Ext label clips at small values
- [ ] KI-006 Wrap dress skirt SA scaling
- [x] KI-009 Category 'tops' vs 'upper' inconsistency
      Not a bug: 'tops' is a UI display label in app.js/account-dashboard.js,
      'upper' is the measurement category in garment modules. Never compared.
- [x] KI-010 edgeAllowances/sanitizePoly interaction (mitigated by design)
- [ ] KI-011 Bust dart intake fixed at 1.5" (should scale with cup size)
- [x] KI-012 Dual PDF renderer removed (accepted risk)
- [x] KI-013 Scale check depends on CSS class name
      Fixed: uses `data-scale-check` attribute on the 2" square rect
      instead of a CSS class. API files query `[data-scale-check]`.
- [x] KI-014 Print colors too faint for B&W printers
      Fixed in print-layout.js: gold #b8963e → #555, green #4a8a5a → #444,
      warm gray #d0ccc4 → #999. Screen renderer keeps original colors.
- [x] KI-015 Negative chestDepth when shoulder wider than chest panel
      Fixed: `armholeCurve()` in upper-body.js clamps chestDepth
      to min 0.5″ with console warning.

### UI Improvements
- [ ] Profile name input (replace prompt() with 
      inline field — currently broken on mobile)
- [ ] Measurement validation before generation
- [ ] cm / inch toggle
- [ ] Mobile-friendly measurement input
- [ ] React migration (low priority until scale)

### Test Avatars — Internal QA measurement profiles
Run every garment module against diverse body types to catch edge
cases (negative chestDepth, extreme crotch curves, tiny/huge SA,
zero-width panels). Stored as a local test fixture file
(`tests/avatars.js`) — not Supabase. Each avatar is a named
measurement set that exercises a specific range.

**Women's avatars:**
- [ ] W-XS: 30 chest, 14 shoulder, 24 waist, 33 hip, 8 rise (petite)
- [ ] W-STD: 36 chest, 16 shoulder, 28 waist, 38 hip, 10 rise (US 8)
- [ ] W-CURVY: 42 chest, 16 shoulder, 32 waist, 46 hip, 11 rise (hip-waist diff > 12")
- [ ] W-PLUS: 48 chest, 18 shoulder, 40 waist, 52 hip, 12 rise (US 20+)
- [ ] W-TALL: 36 chest, 17 shoulder, 28 waist, 38 hip, 11 rise, 34 inseam
- [ ] W-PETITE-FULL: 40 chest, 14.5 shoulder, 34 waist, 44 hip, 9 rise (short + full)

**Men's avatars:**
- [ ] M-SLIM: 34 chest, 17 shoulder, 28 waist, 34 hip, 10 rise (runner build)
- [ ] M-STD: 40 chest, 18 shoulder, 34 waist, 40 hip, 10.5 rise (US M)
- [ ] M-BROAD: 44 chest, 21 shoulder, 34 waist, 40 hip, 10.5 rise
      (swimmer — triggers KI-015 shoulder > chest panel)
- [ ] M-HEAVY: 50 chest, 19 shoulder, 44 waist, 48 hip, 12 rise (US 2XL+)
- [ ] M-TALL: 42 chest, 19 shoulder, 34 waist, 40 hip, 11 rise, 34 inseam
- [ ] M-SHORT: 38 chest, 17 shoulder, 32 waist, 38 hip, 9 rise, 26 inseam

**Edge-case avatars:**
- [ ] EDGE-NARROW-SHOULDER: 40 chest, 14 shoulder (shoulder << chest/2)
- [ ] EDGE-WIDE-SHOULDER: 34 chest, 20 shoulder (triggers negative chestDepth)
- [ ] EDGE-BIG-DROP: 36 chest, 24 waist, 44 hip (waist-hip diff > 20")
- [ ] EDGE-NO-DROP: 40 chest, 38 waist, 40 hip (cylindrical torso)
- [ ] EDGE-LONG-RISE: 34 waist, 38 hip, 14 rise (very long rise)
- [ ] EDGE-SHORT-RISE: 34 waist, 38 hip, 7.5 rise (low rise extreme)

**Test runner:**
- [ ] Script `tests/run-avatars.js`: loop all avatars × all garments,
      call `pieces()`, check no NaN in any polygon coordinate, no
      negative widths, no zero-length edges, SA polygon doesn't
      self-intersect. Log pass/fail per combination.
- [ ] CI integration: `npm test` runs avatar suite

### Output Formats
- [ ] Projector file export
      (sales of home projectors for sewing up 20%
      — significant and vocal user segment)
- [ ] A0 single-sheet export
- [ ] True PDF (not browser print)
- [ ] DXF for plotters

### Pattern Quality
- [x] Per-edge seam allowances (6 launch modules)
- [x] Grainline arrows and fold indicators on all pieces
- [x] Bust dart geometry (4 womenswear tops)
- [x] Polygon sanitizer (dedup, collinear removal, CW winding)
- [x] Single PDF renderer with scale verification
- [x] Proportional shoulder slope (was hardcoded 1.75″)
- [x] Neck width corrected to neck/5 (was neck/6)
- [x] Sleeve cap height proportional to armhole depth
- [x] Waistband fold-in-half on print layout
- [x] Small-piece bin-packing on letter/A4
- [x] Per-piece 1″ scale box on print tiles
- [x] Cross-seam validation warning
- [ ] Notch marks on all pieces
      (most requested feature from experienced sewists)
- [ ] Dart manipulation tools (partial: bust darts done)
- [ ] Bezier SVG curves for smooth neckline/armhole rendering
- [ ] Piece nesting / layout optimizer
- [ ] Scale bust dart intake with cup size (KI-011)
- [x] B&W-safe print colors — gold/green/warm-gray replaced with dark grays (KI-014)
- [ ] Contoured waistband geometry (see v2 plan below)

---

## v2 Plan: Contoured (Curved) Waistband Geometry

### What it is
A waistband pattern piece shaped as a ring sector (arc) instead of a
flat rectangle. The inner edge matches the waist circumference; the outer
edge is slightly longer because it sits on the hip curve below. When sewn,
the band curves naturally around the body instead of buckling or gapping.

### Why it matters
- Flat waistbands on flared garments (A-line skirts, circle skirts,
  wide-leg trousers) ride up or gap at the top edge
- A curved waistband eliminates the need to "ease in" the top edge
- More professional finish — commercial RTW uses curved waistbands
  on nearly all womenswear skirts and trousers

### Which garments get it
| Garment | Priority | Notes |
|---|---|---|
| a-line-skirt-w | high | Flared skirt = most visible improvement |
| wide-leg-trouser-w | high | Already lists "contoured" option but fakes it |
| straight-trouser-w | medium | Already lists "contoured" option |
| slip-skirt-w | medium | Bias cut benefits from curved band |
| circle skirt (future) | high | Mandatory — flat waistband is wrong on a circle skirt |

NOT needed: jeans, chinos, cargo shorts, sweatpants, swim trunks,
pleated shorts/trousers (flat waistband is standard for menswear and
casual garments with belt loops).

### Implementation plan

**Step 1 — New engine function: `curvedWaistband()`**

File: `src/engine/geometry.js`

Input:
- `waistCirc` — inner edge circumference (waist measurement + ease)
- `bandWidth` — finished waistband width (e.g. 1.5″)
- `hipCirc` — outer edge circumference (hip measurement + ease)
  or derive from `waist-to-hip drop` and body curvature

Output: A ring-sector polygon with:
- Inner arc (waist edge) — radius R = waistCirc / (2π × curveFraction)
- Outer arc (hip edge) — radius R + bandWidth
- Straight ends at CF or CB (for closure/overlap)
- The arc angle θ = waistCirc / R (in radians)

The key math (standard drafting):
```
curveDiff = (hipCirc - waistCirc) over the bandWidth height
R_inner = waistCirc / θ
θ = curveDiff / bandWidth  (in radians)
R_outer = R_inner + bandWidth
```

The inner arc is sampled as a bezier (standard circle-arc approximation:
`cp = (4/3) × tan(θ/4) × R`). The outer arc is the same angle at
R + bandWidth.

For small curve amounts (< 1″ difference between waist and hip over
the band height), a flat waistband is close enough — the function
should return a flat rectangle as a degenerate case.

**Step 2 — New piece type: `curvedWaistband`**

The ring-sector piece needs its own renderer in `print-layout.js` and
`pattern-view.js` because it's not a rectangle or a polygon with
straight edges — it has two arcs and two straight ends.

Renderer draws:
- Inner arc (stitch line, dashed)
- Outer arc + SA offset (cut line, solid)
- Straight ends with SA
- Grainline along the straight CF/CB end
- "PLACE ON FOLD" or "Cut 1" annotation
- Dimensions: inner arc length, outer arc length, band width

**Step 3 — Wire into garment modules**

For each target garment:
1. Add `hip` to required measurements (most already have it)
2. In the `pieces()` function, replace the flat `type: 'rectangle'`
   waistband with a call to `curvedWaistband()`
3. Output the new piece with `type: 'curvedWaistband'`
4. Keep flat waistband as a user option ("Flat" vs "Contoured")

**Step 4 — Update print layout**

- Add `renderCurvedWaistbandSVG()` to print-layout.js
- Register in `renderPiece()` dispatch
- The compact renderer for bin-packing should handle curved bands too
  (fold in half along the arc midpoint — same paper savings)

### Dependencies
- Bezier circle-arc approximation (already have `sampleBezier()`)
- `offsetPolygon()` works on sampled arcs (already handles curves)
- No new measurements needed (waist + hip already collected)

### Effort estimate
- Engine function: ~50 lines
- SVG renderer (pattern-view + print-layout): ~80 lines each
- Garment module changes: ~10 lines per garment (5 garments)
- Testing: 1 muslin per garment type (skirt + trouser)

### Not in scope for v2
- Multi-piece contoured waistbands (princess-seamed waistbands)
- Petersham ribbon template (off-the-roll, not pattern-drafted)
- Waistband with built-in elastic channel curvature

---

## Module Status

| Module | Garment | Code | Muslin |
|---|---|---|---|
| cargo-shorts | Cargo Shorts | ✅ | ⬜ |
| gym-shorts | Gym Shorts | ✅ | — |
| swim-trunks | Swim Trunks | ✅ | — |
| pleated-shorts | Pleated Shorts | ✅ | — |
| straight-jeans | Straight Jeans | ✅ | ⬜ |
| chinos | Chinos | ✅ | — |
| pleated-trousers | Pleated Trousers | ✅ | — |
| sweatpants | Sweatpants | ✅ | — |
| tee | T-Shirt | ✅ | ⬜ |
| camp-shirt | Camp Shirt | ✅ | ⬜ |
| crewneck | Crewneck Sweatshirt | ✅ | — |
| hoodie | Hoodie | ✅ | — |
| crop-jacket | Crop Jacket | ✅ | — |
| wide-leg-trouser-w | Wide-Leg Trouser (W) | ✅ | ⬜ |
| straight-trouser-w | Straight Trouser (W) | ✅ | — |
| easy-pant-w | Easy Pant (W) | ✅ | — |
| slip-skirt-w | Slip Skirt (W) | ✅ | — |
| a-line-skirt-w | A-Line Skirt (W) | ✅ | ⬜ |
| button-up-w | Button-Up Shirt (W) | ✅ | — |
| shell-blouse-w | Shell Blouse (W) | ✅ | — |
| fitted-tee-w | Fitted Tee (W) | ✅ | — |
| shirt-dress-w | Shirt Dress (W) | ✅ | — |
| wrap-dress-w | Wrap Dress (W) | ✅ | — |

⬜ = muslin required before payments go live
— = not a launch pattern, test post-launch