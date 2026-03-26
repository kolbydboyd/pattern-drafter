# People's Patterns — Roadmap

_Last updated: 2026-03-26 · v0.6.0_

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

## Current Status — v0.6.0

23 garment modules · all code-complete · all bugs fixed
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

| Garment | Type | Priority |
|---|---|---|
| Tote bag | bag | high |
| Crossbody bag | bag | high |
| Sundress | dress | high |
| Knit dress | dress | high |
| Duffle bag | bag | medium |
| Daypack | bag | medium |
| Circle skirt | skirt | medium |
| Quarter-zip | upper | medium |
| Boxers / underwear | lower | medium |
| Kids sizing | all | medium |
| Blazer | jacket | medium |
| Bias-cut skirt | skirt | low |
| Trench coat | jacket | low |

### MYOG Push (Month 3)
- [ ] Tote, crossbody, stuff sack
- [ ] Duffle, daypack, simple backpack
- [ ] Post in r/myog after first bag modules
- [ ] Technical backpack (long-term)

### Seasonal
- [ ] Halloween costumes — target October launch
- [ ] Holiday party dress — target November
- [ ] Swimwear expansion — target June

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
- [ ] KI-002 SA corner spikes at acute angles
      (verify on slim V-neck tee first)
- [ ] KI-003 Slant pocket mirror annotation
- [ ] KI-004 Ext label clips at small values
- [ ] KI-006 Wrap dress skirt SA scaling
- [ ] KI-009 Category 'tops' vs 'upper' inconsistency

### UI Improvements
- [ ] Profile name input (replace prompt() with 
      inline field — currently broken on mobile)
- [ ] Measurement validation before generation
- [ ] cm / inch toggle
- [ ] Mobile-friendly measurement input
- [ ] React migration (low priority until scale)

### Output Formats
- [ ] Projector file export
      (sales of home projectors for sewing up 20%
      — significant and vocal user segment)
- [ ] A0 single-sheet export
- [ ] True PDF (not browser print)
- [ ] DXF for plotters

### Pattern Quality
- [ ] Notch marks on all pieces
      (most requested feature from experienced sewists)
- [ ] Dart manipulation tools
- [ ] Contoured waistband geometry
- [ ] Piece nesting / layout optimizer

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