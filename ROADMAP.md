# People's Patterns — Roadmap

_Last updated: 2026-04-08 · v0.7.0_

---

## North Star

The gap between a $20 generic indie pattern that
doesn't fit and a $150 custom-drafted pattern is
completely uncontested. We own that gap at $9–19.

**Positioning:** "The easiest way for home sewists to make clothes that actually fit their body."

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

## What's Done

- [x] 47 garment base modules built and code-complete (43 existing + 4 added 2026-04-08: open-cardigan, chore-coat, wide-leg-trouser-m, henley) — expands to ~95 catalog cards via variants
- [x] Pattern generation engine working
- [x] Print layout with tiling and scale verification
- [x] Single PDF renderer
- [x] Supabase backend (auth, profiles, purchases, fit history, download history)
- [x] Stripe checkout with 3-tier pricing ($9/$14/$19) and bundles
- [x] Watermarked preview until purchase
- [x] Email via Resend (welcome, purchase, feedback request)
- [x] Email signup forms on landing, FAQ, privacy pages
- [x] Vercel serverless functions (webhooks, email, PDF)
- [x] PostHog analytics with custom event tracking
- [x] A/B testing via PostHog feature flags
- [x] Fit feedback system in account dashboard
- [x] Affiliate links in materials lists
- [x] Gift cards (account dashboard)
- [x] Social icons on landing page
- [x] Repo made private
- [x] Domain: peoplespatterns.com
- [x] All social handles secured
- [x] Brand kit complete (fonts, colors, avatars, banners)
- [x] FAQ page with schema markup
- [x] Pricing page
- [x] Sitemap generation
- [x] Pre-rendered /patterns and /learn pages for crawler visibility
- [x] SEO landing pages for high-intent queries
- [x] AI crawler access (robots.txt: OAI-SearchBot, ChatGPT-User, ClaudeBot, etc.)
- [x] Per-edge seam allowances on launch patterns
- [x] Bust dart geometry on 4 womenswear tops
- [x] Polygon sanitizer (dedup, collinear removal, CW winding)
- [x] Notches added to launch patterns
- [x] Sleeve cap to armhole validation
- [x] Grainline arrows and fold indicators on all pieces
- [x] Purchase bypass patched (backend PDF authorization)
- [x] Account dashboard (measurements, patterns, projects, wishlist, orders, gift cards, settings)
- [x] cm / inch toggle
- [x] Fit Reference Library (brand/size lookup, flat-lay measurement, community submissions)

---

## Market Research - Gen Z & Men's Demand

_Research completed 2026-03-31. Sources: Fortune, CNN, MR PORTER,
Complex, Gitnux, Tapstitch, Printful, Google Trends, Depop,
Thread Theory, Wardrobe By Me, TikTok, Reddit r/sewing._

### Key Stats
- Millennials + Gen Z = **60% of new sewers**
- Custom clothing market: **$60B in 2025, projected $149.5B by 2035** (9.56% CAGR)
- No widely adopted automated MTM platform exists for home sewists - **we have no direct competitor at scale**
- Online pattern sales up 25% since 2019
- TikTok: ~3M #sewing posts; #boyswhosew at 53.4M views
- 45% increase in male crafting participation over 5 years
- Sweet spot pricing $8-16/pattern (our $9-19 is on target)

### Why People Sew (ranked)
1. **Fit** - 68% prefer oversized but standard sizing doesn't deliver; online return rates 20-30% (poor fit)
2. **Cost** - quality clothing increasingly unaffordable; custom shirt $20-40 in fabric vs $100+ retail
3. **Sustainability** - 73% willing to pay more for sustainable; #ThriftFlip 3B+ TikTok views
4. **Self-expression** - mass-produced feels generic; DIY content gets 3x more engagement than brand content
5. **Screen fatigue** - analog hobby to get off phones
6. **Social currency** - making clothes is a flex showing skill, creativity, and values

### Gen Z Aesthetics Driving Demand (ranked)
| Aesthetic | Key Garments | Status |
|---|---|---|
| Y2K Revival | Slip dresses, corset tops, low-rise, bold prints | Peak popularity |
| Coquette / Romantic | Corset tops, babydoll dresses, lace, bows | Very strong |
| Gorpcore / Utility | Cargo pants, utility jackets, quarter-zips | Evergreen |
| Cottagecore | Flowy dresses, puff sleeves, midi skirts | Sustained/mature |
| Quiet Luxury | Clean trousers, simple blazers, tonal | Rising |
| Office Siren | Pencil skirts, blazers, slinky office-wear | Growing (workforce entry) |
| Gender-Fluid | Oversized silhouettes, elastic waists | Growing strongly |

### Men's Aesthetics Driving Demand (ranked)
| Aesthetic | Key Garments | Status |
|---|---|---|
| Workwear / Heritage | Chore coats, worker trousers, denim, overshirts | HIGHEST demand |
| Quiet Luxury | Unstructured blazers, clean trousers, neutral tones | Dominant macro-trend |
| Streetwear | Bombers, hoodies, joggers, varsity, oversized | Evergreen for Gen Z |
| Elevated Athleisure | Tailored joggers, zip fleeces, gym-to-work | $257B market |
| Y2K / Retro Revival | Baggy jeans, vintage sportswear, oversized | Strong with 18-25 |
| Relaxed Tailoring | Wider silhouettes replacing slim-fit | Growing for 2026 |

### Men's MTM Opportunity
- **Rise is the #1 MTM value prop for men** - standard sizing only provides waist + inseam, ignoring rise, thigh, hip. Rise CANNOT be fixed by a tailor.
- **Athletic builds**: 95% of off-the-rack doesn't accommodate muscular proportions
- **Short men (under 5'8")**: ~30% of US men, essentially ignored by the industry
- **Plus-size (XL+)**: 34.1% of US men overweight, only 12% of market serves them
- **67% of men** don't know their correct waist size
- Men's formalwear = 60% of custom orders in North America
- Men's suits market: $19.57B in 2026; custom suit adoption up 38%

---

## Immediate - Launch Blockers

- [ ] **Sew 6 launch muslins** (the actual critical path)
  - [ ] Cargo Shorts
  - [ ] Straight Jeans
  - [ ] T-Shirt
  - [ ] Camp Shirt
  - [ ] A-Line Skirt
  - [ ] Wide-Leg Trouser (W)
- [ ] **Photograph sewn samples** — multiple angles, fit details, on body
- [ ] **Fix any fit issues found during muslin testing**
- [ ] **Test full purchase flow end-to-end** — checkout, webhook, PDF generation, download, re-download
- [ ] **Test print layout at 1:1 scale** — verify scale square, tiles assemble, no clipping
- [ ] **Wire peoplespatterns.com to Vercel** — DNS records in Porkbun
- [ ] **Set up Google Search Console** and submit sitemap
- [ ] **Update pricing in Stripe** to match new 3-tier structure if not already done

---

## Phase 1 — Pre-Launch Polish

### Content (do before public promotion)
- [ ] Add sewn sample photos to pattern pages — biggest trust signal
- [ ] Film "how to measure yourself" video — #1 content asset
- [ ] Film "how People's Patterns works" video — product demo
- [ ] Create first 3 blog articles from video transcripts
- [ ] Create individual pattern pages with SEO meta tags
- [ ] Post branded avatars and banners to all social accounts

### Email Flows (templates exist, verify sequences work)
- [ ] Welcome sequence:
      Email 1: "Here's how to measure yourself"
      Email 2: "Your first pattern — what to expect"
      Email 3: "How tiled PDFs work"
- [ ] Generated-not-purchased follow-up
- [ ] Post-sew fit feedback request

### Privacy / Technical
- [ ] Move body measurements out of Stripe session metadata
      (store only in Supabase, pass reference ID to Stripe)
- [ ] Document required schema state or use proper Supabase migrations

---

## Phase 2 — Launch Content

### Social Accounts ✅
- Instagram: @peoplespatterns
- Threads: @peoplespatterns
- Facebook: @peoplespatterns
- Pinterest: @peoplespatterns
- Etsy: @peoplespatterns
- TikTok Shop: @peoplespatterns
- TikTok (regular): @peoplespatternsofficial
- YouTube: @peoplespatterns
- Reddit: u/peoplespatterns
- Newsletter: hello@peoplespatterns.com

### Content Queue (2–3 weeks before launch)
- [ ] Before/after fit video — TikTok first
      Standard-sized pattern that gaps at waist
      vs custom-fit pattern on same body. 30 seconds.
- [ ] "I generated a jeans pattern for $14" series
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
- [ ] Reddit: r/sewing, r/sewhelp, r/myog
- [ ] Seed 50–100 free downloads to sewists
      with 5k–50k followers
- [ ] Referral program:
      Give a friend a free pattern, get a free pattern

---

## Phase 3 — Revenue Expansion

### Membership Tiers (from pricing strategy)
- [ ] Club: $12/mo (1 credit/month, member pricing 20% off)
- [ ] Wardrobe: $24/mo (3 credits/month, early access, premium exports)
- [ ] Annual pricing at 2 months free
- [ ] Credit system (1 credit = 1 pattern, rolls over 3 months)

### Etsy + Craftsy Shop
- [ ] Build grading function — run engine with
      standard size chart measurements (XS–3X)
- [ ] Generate sized PDFs for 6 launch patterns
- [ ] List on Etsy ($12–15 per pattern)
- [ ] List on Craftsy

### Physical Products
- [ ] Branded beginner kit ($25–30)
- [ ] Branded tape measure ($12–15)
- [ ] Etsy listings for physical kits

### Professional / Institutional Tier
- [ ] $50/month professional plan
      Commercial use rights, client profiles, bulk downloads
- [ ] School / institutional bulk pricing

---

## Phase 4 — Catalog Growth

_Research references: Aldrich (Metric Pattern Cutting for Women's Wear, 6th ed.), Armstrong (Patternmaking for Fashion Design, 6th ed.), Bunka Fashion College (Fundamentals of Garment Design), FreeSewing.org, ASTM D5585/D6192/D6458 body measurement standards, Beverly Johnson (lingerie), Cloth Habit, Orange Lingerie, Jalie, Style Arc._

### Current catalog: 84 patterns (42 base garments + 42 style variants)

**Men's/unisex base (24):** tee, camp shirt, button-up, crewneck, hoodie, straight jeans, baggy jeans, chinos, 874 work pants, pleated trousers, sweatpants, cargo shorts, baggy shorts, gym shorts, pleated shorts, swim trunks, crop jacket, athletic formal jacket, denim jacket, cargo work pants, apron, bow tie, tank top, tote bag
**Women's base (18):** fitted tee, shell blouse, button-up, easy pant, straight trouser, wide-leg trouser, A-line skirt, slip skirt, circle skirt, pencil skirt, shirt dress, wrap dress, T-shirt dress, slip dress, A-line dress, sundress, leggings, athletic formal trousers

**Style variants (42):** oversized tee, muscle tee, longline tee, pocket tee, scoop tee (W), long-sleeve fitted tee (W), cropped tee (W), running shorts, basketball shorts, racerback tank, cropped tank, capri leggings, biker shorts, lounge pant (W), mini circle skirt (W), midi circle skirt (W), slim jeans, high-rise jeans, slim chinos, tapered joggers, vacation shirt, raglan sweatshirt, woven tank (W), cigarette pants (W), linen wide-legs (W), long-sleeve tee dress (W), maxi tee dress (W), maxi slip dress (W), maxi sundress (W), tiered sundress (W), market tote, beach tote, zip hoodie, oversized hoodie, maxi wrap dress (W), linen shirt dress (W), midi A-line dress (W), poplin blouse (W), linen tunic (W), lightweight denim jacket, linen shirt, chambray work shirt

**Live bundles (10):** 3-Pattern Capsule ($29), 5-Pattern Wardrobe ($49), Beach Day ($39), Weekend Casual ($34), Athleisure ($34), Tailored Essentials ($42), Cozy Weekend ($25), Summer Capsule (W) ($25), Office Ready (W) ($34), Date Night (W) ($29)

### New Modules (one validated per week post-launch)
Validation = code + muslin + fit confirmed

_Note: Some entries below (circle skirt, pencil skirt, tank top, apron, bow tie, sundress, leggings, tote bag) were planned here but are now shipped and live in the current catalog above. They remain in the tables as reference for their technical specs._

Each entry includes: pricing tier, price, sewing difficulty, pattern pieces, measurements, fabric, ease, key math, and industry standards. Grouped by category within each tier for clarity.

**Pricing tiers (acquisition funnel):**
| Tier | Price | Target |
|---|---|---|
| Free | $0 | Lead magnets - email capture, trust building (scrunchie, dog bandana, face mask) |
| Quick | $5 | Non-garment projects - bags, home decor, accessories, pet items |
| Simple | $9 | Beginner garments - elastic waists, pull-on, minimal shaping |
| Core | $14 | Standard closures, moderate shaping, multiple pieces |
| Tailored | $19 | Detailed construction - pleats, darts, linings, boning, precision fit |

**Sewing difficulty levels:**
- **Beginner** - Few pieces, straight seams, elastic waists, minimal fitting
- **Intermediate** - Multiple pieces, zips/buttons, moderate shaping, darts
- **Advanced** - Complex construction, boning, tailoring, precision fitting

---

#### Tier 1 — High demand, beginner-friendly, fast to build
These use existing engine geometry with minimal new math.

##### Skirts

| Garment | Tier | Price | Difficulty | Pieces | Measurements | Fabric | Ease | Key Math | Standards |
|---|---|---|---|---|---|---|---|---|---|
| Circle skirt | Simple | $9 | Beginner | 2 panels (front/back half-circle or full circle on fold), waistband | waist, hip, desired length | light-med woven: cotton, linen, crepe (3-6 oz) | waist +1", hip N/A (flare provides) | waist radius = W / 6.28 (full circle), W / 3.14 (half), W / 1.57 (quarter). Hem circ = 2pi(r+length). Ring-sector math (reuse curved waistband v2) | SA 5/8", hem 1/2-3/4" (narrow for curves), invisible zip 7" at CB, horsehair braid optional. FreeSewing: sandy |
| Pencil skirt | Core | $14 | Intermediate | front panel, back panel x2 (CB zip), waistband, kick pleat underlay | waist, hip, hip depth, desired length (knee) | med woven with 2-3% spandex: stretch wool, ponte, cotton sateen (6-10 oz) | waist +0.5-1", hip +2" | straight panels, back vent 6-8" for walking. Dart intake = (hip+ease)/2 - (waist+ease)/2, distribute across 4 darts. Taper 0.5" per side below hip optional | SA 5/8", hem 1.5-2", invisible zip at CB 7-9", hook/bar at waist. FreeSewing: penelope |
| Wrap skirt | Core | $14 | Intermediate | front left (extends 4-6" past CF), front right (underlap), back panel, waistband, ties x2 | waist, hip, hip depth, desired length | med woven: cotton, linen, denim, chambray (5-8 oz). Avoid slippery fabrics | waist +1", hip +2", overlap 4-6" past CF | each front panel = hip/4 + ease + 4-6" extension. Total coverage = hip circ + 8-12" overlap. Tie length 24-30" each | SA 5/8", hem 1", overlap edges hemmed same as bottom. No zip - ties only |
| Maxi skirt | Core | $14 | Beginner | front panel, back panel (or x2 for CB zip), waistband or elastic casing | waist, hip, waist-to-floor | drapey wovens: rayon, viscose, crepe, challis (3-5 oz) | waist +1", hip +2-3" | length = waist to floor minus 0.5-1". A-line flare: +4-6" per panel at hem. Hang 24-48 hrs before hemming. Walking slit 18-24" from hem if straight | SA 5/8", hem 1/2-1" (narrow for drapey), invisible zip CB or side 7-9" |

##### Dresses

| Garment | Tier | Price | Difficulty | Pieces | Measurements | Fabric | Ease | Key Math | Standards |
|---|---|---|---|---|---|---|---|---|---|
| T-shirt dress (W) | Simple | $9 | Beginner | front (on fold), back (on fold), sleeve x2, neckband | bust, shoulder, neck, hip, sleeve length, desired dress length | knit: cotton jersey, cotton-modal, bamboo jersey (5-7 oz). Min 25% stretch | bust 0 to +2", no waist shaping | neckband = neckline x 0.75-0.80. Sleeve cap height 2-3" (knit). Side seam straight underarm to hem | SA 3/8-1/2", hem 1.5" twin-needle, no closures (pull-on) |
| Shift dress (W) | Core | $14 | Intermediate | front (on fold), back (x2 for CB zip), sleeve x2 or armhole facings, neck facings | bust, waist (ref only), hip, shoulder, neck, desired length | med woven with body: linen, cotton poplin, cotton sateen (5-8 oz) | bust +3-5" (loose boxy), hip same | minimal dart intake 0.5-1" per dart. Width at every level = (bust+ease)/4. Armhole depth = bust/8 + 2.5" | SA 5/8", hem 1.5-2", invisible zip CB 20-22", facing width 2-2.5" |
| Pinafore / jumper dress (W) | Core | $14 | Intermediate | front bodice, back bodice, front skirt, back skirt, straps x2, facings, pockets x2 optional | bust, waist, hip, shoulder, front bodice length, strap length | denim, corduroy, twill, canvas, linen (8-12 oz) | bust +3-5" (layering over top), waist +2-4", hip +2-4" | strap width 1.5-2.5" finished. Strap placement 2-3" in from armhole. D-ring option adds 3" extra length. A-line skirt flare 3-5" per panel | SA 5/8", hem 1.5-2", topstitch 1/4" on denim |
| Babydoll dress (W) | Core | $14 | Intermediate | front bodice (short, to underbust), back bodice, front skirt (gathered rectangle), back skirt, sleeve x2 (puff/flutter), neckline binding | bust, underbust, shoulder, neck, nape-to-underbust, total length | light woven: cotton voile, lawn, batiste, eyelet, rayon (2-4 oz) | underbust +1-2" (bodice snug) | empire line 1-2" below underbust. Gathering ratio 1.5:1 to 2.5:1. Skirt width = (bust circ at empire + ease) x ratio / 2 per panel. Puff sleeve = bicep x 1.5-2x. Flutter sleeve = half-circle at armhole radius | SA 1/2-5/8", hem 1/4-1/2" (narrow for lightweight), stay tape at empire seam |
| Trapeze dress (W) | Core | $14 | Intermediate | front panel, back panel (or x2 for CB zip), neck/armhole facings | bust, shoulder, neck, desired length | woven with body: cotton poplin, linen, scuba, neoprene (5-10 oz) | bust +4-6" (body doesn't touch at waist/hip) | flare ratio 1:2 to 1:3 from bust to hem. Per panel: hem width = bust panel + (flare x 2). Hang 24+ hrs, level hem from floor | SA 5/8", hem 1-1.5" |

##### Tops

| Garment | Tier | Price | Difficulty | Pieces | Measurements | Fabric | Ease | Key Math | Standards |
|---|---|---|---|---|---|---|---|---|---|
| Tank top / A-shirt | Simple | $9 | Beginner | front bodice, back bodice, neckline binding, armhole binding x2 | bust, shoulder, neck, torso length | knit: jersey, rib knit (4-6 oz). Or woven with bias binding | bust +2-4" | sleeveless bodice block. Binding cut at 85% of opening (knit) or bias 1.25" wide. Armhole 0.5-1" deeper than sleeved version | SA 3/8", binding 3/8" finished. FreeSewing: aaron |
| Crop top (W) | Simple | $9 | Beginner | front bodice, back bodice, sleeve x2 optional, neckband/binding | bust, shoulder, neck, underbust, crop length (14-16" from shoulder) | knit: jersey, ponte, rib. Woven: poplin, linen for boxy crop | fitted +2", standard +3-4", relaxed +6-8" | body length = torso shortened to underbust or user crop point. Same panelW as tee.js. Armhole binding for sleeveless: bias 1.25" cut, 3/8" finished | SA 3/8" knit / 5/8" woven, hem 3/4" knit / 1" woven |
| Halter top (W) | Simple | $9 | Beginner | front bodice, back bodice, halter straps/ties x2, optional facing | bust, underbust, shoulder, neck, torso length | woven: cotton sateen, crepe, rayon (3-5 oz). Knit: ponte for structured | fitted +1-2", standard +2-3" | strap attachment at or slightly inside shoulder point. Strap length: neck circ/2 + 12" for tying (~24-30" per strap). Back elastic at 80% of back width if strapless back | SA 5/8", facing 2-2.5" interfaced, hem 1" |
| Tunic (W) | Core | $14 | Beginner | front bodice, back bodice, sleeve x2, neckband/facing, optional side slits | bust, shoulder, neck, sleeve length, hip, desired total length (28-36") | woven: voile, linen, double gauze (3-5 oz). Knit: rayon jersey, french terry | standard +4-6", relaxed +8-10" | same upper block as tee.js extended. A-line shaping: +1-2" at hem per side vs hip. Side slit 4-6" from hem, bar tack at top. Curved shirttail adds 1.5-2" at CF/CB | SA 5/8" woven / 3/8" knit, hem 1-1.5" |
| Dolman / batwing top (W) | Simple | $9 | Beginner | front bodice-sleeve combined (on fold), back combined (on fold), neckband, optional gusset | bust, neck, wrist or sleeve opening, torso length, total span (fingertip to fingertip) | knit: rayon jersey, modal (must drape well). Avoid stiff fabrics | N/A traditional - inherent volume from extended sleeve-body | NO separate armhole or sleeve cap. T-shape pattern. Underarm curve radius 3-5". Sleeve angle 20-45 deg below horizontal. Gusset: diamond 4-6" per side, cut on bias | SA 3/8-1/2", hem 3/4" twin-needle, gusset on bias |
| Turtleneck (unisex) | Simple | $9 | Beginner | front (on fold), back (on fold), sleeve x2, turtleneck collar (rectangle on fold) | chest, shoulder, neck, sleeve length, torso length | knit ONLY: rib knit, interlock, merino jersey (6-10 oz). Good recovery essential | fitted +2", standard +3-4" | collar length = neck circ x 0.85-0.90. Full turtle: 10-12" cut (5-6" finished folded double then down). Mock: 6-8" cut (3-4" finished). Neckline must be head circ + 2" min | SA 3/8-1/2", collar 2x2 rib preferred, ballpoint needle 80/12 |
| Henley (unisex) | Core | $14 | Intermediate | front (on fold, with placket slit), back (on fold), sleeve x2, placket x2 (L/R), neckband, buttons | chest, shoulder, neck, sleeve length, torso length | knit: waffle/thermal, jersey, french terry, slub (5-8 oz) | fitted +2", standard +4", relaxed +6" | placket opening 6-8" from neckline. Placket width 1.25" finished each side. Buttons 3-4, spaced 1.5-2" apart. Buttonholes horizontal, 1/16" > button diameter | SA 3/8-1/2", buttons 3/8-1/2" 4-hole, placket interfaced |
| V-neck tee (unisex) | Simple | $9 | Beginner | front (on fold, V neckline), back (on fold), sleeve x2, V-neck binding strip | chest, shoulder, neck, sleeve length, torso length | knit: cotton jersey, rayon jersey (5-6 oz) | same as tee.js: fitted +2", standard +4", relaxed +6" | V depth 7-10" below shoulder. Binding 1.5-2" wide, 3/8-1/2" finished. Miter at V-point: fold binding at 45 deg at apex. Already in tee.js via NECK_DEPTH_FRONT.vneck | SA 3/8", hem 3/4" twin-needle |
| Raglan tee (unisex) | Core | $14 | Intermediate | front (on fold, NO armhole - diagonal raglan), back (on fold), raglan sleeve x2 (includes shoulder), neckband | chest, shoulder, neck, sleeve length, torso length | knit: jersey, french terry, athletic mesh (5-8 oz) | fitted +2-3", standard +4", relaxed +6-8" | NO armholeCurve(). Front raglan: line from (neckW+0.5, 0) to (panelW, armholeY). Back raglan 0.5" wider at neck than front. Sleeve cap is triangular extension. Cap dart 1-1.5" at shoulder top. Raglan angle 45-55 deg | SA 3/8-1/2", flat-felled or serged seams, neckband 85% of opening |

##### Pants

| Garment | Tier | Price | Difficulty | Pieces | Measurements | Fabric | Ease | Key Math | Standards |
|---|---|---|---|---|---|---|---|---|---|
| Pajama pants (unisex) | Simple | $9 | Beginner | front x2, back x2, elastic waistband casing, drawstring, optional back pocket | waist, hip, rise, inseam (30-32") | woven: cotton flannel, voile, lawn, satin, broadcloth (3-6 oz) | hip +4-6" (generous comfort). Leg straight, ratio 0.90-1.0 at hem | simplified lower block (like sweatpants.js). Crotch front ext 1.5", back ext 2.5". Waistband casing 1.5" for 1" elastic + drawstring | SA 5/8", elastic 1" at 85% waist, drawstring 1/4" x 48", hem 1" fold, French seams for sheer |
| Joggers (unisex) | Core | $14 | Beginner | front x2, back x2, waistband (elastic casing), rib cuffs x2, drawstring, optional pockets | waist, hip, rise, thigh, inseam, calf, ankle | knit: french terry, sweatshirt fleece (10-14 oz), ponte. Cuffs: 2x1 or 2x2 rib | regular +2.5" hip, relaxed +4" | same lower block as sweatpants.js. TAPERED: knee = hipW x 0.80, hem = hipW x 0.60. Rib cuff circ = ankle x 0.80-0.85. Waistband = waist + 4" for elastic. Distinct from sweatpants: tapered leg, cuffed | SA 1/2", elastic 1-1.5" at 80-85% waist, rib cuffs 3-4" finished |
| Lounge shorts (unisex) | Simple | $9 | Beginner | front x2, back x2, elastic casing, drawstring, optional pockets | waist, hip, rise, desired length (5-8" inseam) | knit: jersey, modal, waffle. Woven: voile, gauze, seersucker, lightweight linen | relaxed +4-6" hip | simplified lower block, minimal shaping. No darts, no fly. Leg straight. Crotch front ext 1.25", back ext 2" | SA 3/8" knit / 1/2" woven, elastic 1" at 80-85% waist, hem 3/4" knit / 1/2" double-turn woven |
| Palazzo pants (W) | Core | $14 | Intermediate | front x2, back x2, waistband (interfaced), fly or side invisible zip, optional pocket bags | waist, hip, rise, inseam, thigh | drapey wovens: crepe, rayon, silk, linen, chiffon (lined) (3-6 oz). Lining for sheer | waist +0.5-1" (fitted), hip +2-3" | ultra-wide: each panel at hem = hipW x 1.0-1.5. No taper - straight wide. Rise: high (+1.5-3" above natural). Uses LEG_SHAPES.wide or custom | SA 5/8", invisible zip 7-9" at left side, hem 1-1.5", lined to knee for sheer |

##### Sleepwear & Loungewear

| Garment | Tier | Price | Difficulty | Pieces | Measurements | Fabric | Ease | Key Math | Standards |
|---|---|---|---|---|---|---|---|---|---|
| Pajama set top (unisex) | Core | $14 | Intermediate | front left (button stand), front right (buttonhole stand), back (on fold), sleeve x2, camp collar, facing, optional pocket | chest, shoulder, neck, sleeve length, torso length | same as PJ pants: cotton flannel, voile, broadcloth, satin (3-6 oz) | relaxed +6-8", oversized +8-10" | same upper block as camp-shirt.js with more ease. Camp collar (no stand, lies flat). Length at hip (24-26"). Optional contrast piping: bias strip 1.5" wide over 1/8" cord | SA 5/8", French seams, buttons 5/8" x 5-6, hem 1/2" double-turn |
| Robe / kimono robe (unisex) | Core | $14 | Intermediate | front left (extends 6-8" past CF), front right (mirror), back (on fold), sleeve x2 (wide), shawl collar or front band, belt, belt loops x2, optional pockets x2 | chest, shoulder, neck, sleeve length, hip, desired length (knee 38-42", ankle 50-56") | heavyweight: terry cloth (12-16 oz), fleece, flannel, quilted. Lightweight: voile, silk, satin (4-16 oz) | relaxed +8-12" | shawl collar: continuous piece, width 4-5" at back neck, 5-6" at CF, curves 90 deg at back neck. Belt 2-3" x 60-72". Inner tie at right side seam prevents flapping. Wrap overlap 6-8" past CF | SA 5/8" woven / 1/2" knit, belt loops 1" x 2.5" at side seams, pockets 7x8" at hip |
| Nightgown (W) | Core | $14 | Beginner | front bodice, back bodice, front skirt, back skirt, neckline binding/facing, optional straps, optional lace trim | bust, underbust, shoulder, neck, desired length (knee to floor) | light wovens: cotton lawn, voile, satin, silk, cotton gauze (2-4 oz) | bust +2-4", skirt gathered or A-line | empire or natural waist seam. If gathered skirt: ratio 1.5:1 to 2:1. Strap length = shoulder to bust + 2-3" adjustment. Narrow hem for lightweight | SA 1/2-5/8", hem 1/4-1/2" narrow or lace-trimmed |

##### Underwear & Intimates

| Garment | Tier | Price | Difficulty | Pieces | Measurements | Fabric | Ease | Key Math | Standards |
|---|---|---|---|---|---|---|---|---|---|
| Boxer briefs (M) | Simple | $9 | Intermediate | front panel x2, back panel x2, waistband (elastic casing or fold-over elastic), optional fly opening | waist, hip, rise, thigh | knit: cotton/spandex jersey (95/5), modal/spandex, bamboo. 4-way stretch, good recovery (5-7 oz) | NEGATIVE: -5 to -10% at hip (compression). Waist elastic at 80-85% | small panels. Front ext 1-1.25", back ext 1.5-2". Leg opening = thigh x 0.85. Inseam 3-6" | SA 1/4-3/8", elastic 1" waist / 3/8" leg, serged or flatlock seams. FreeSewing: bruce |
| Underwear / knickers (W) | Simple | $9 | Intermediate | front panel, back panel, gusset (double-layer cotton), elastic for waist and legs | waist, hip, rise | knit: cotton/spandex (95/5), bamboo, modal, microfiber. 4-way stretch (3-5 oz) | NEGATIVE: -5 to -15%. Waist elastic 80%, leg elastic 75-80% | multiple styles (bikini, high-waist, boyshort). Front rise varies by style. Gusset 2.5-3" wide x 5-6" long, double cotton. FOE at legs | SA 1/4", FOE 5/8" for leg/waist finish, cotton gusset mandatory |
| Scrunchie (unisex) | Free | $0 | Beginner | 1 rectangle fabric, 1 piece elastic | N/A (one size or custom circumference) | any: cotton, satin, velvet, knit scraps | N/A | rectangle 22x4.5". Elastic 9" of 1/4" braided. Tube, insert elastic, close | SA 1/4", 10-min project. Lead magnet / traffic driver |

##### Outerwear

| Garment | Tier | Price | Difficulty | Pieces | Measurements | Fabric | Ease | Key Math | Standards |
|---|---|---|---|---|---|---|---|---|---|
| Cardigan (unisex) | Core | $14 | Intermediate | front left (button band), front right, back (on fold), sleeve x2, button bands x2 (rib), neckband (rib), optional rib waistband/cuffs | chest, shoulder, neck, sleeve length, torso length | knit: med-weight knit (8-12 oz), boiled wool, sweater knit, french terry, ponte. Bands: 1x1 or 2x2 rib | standard +4-6", relaxed +6-8" (layers over other garments), oversized +10-12" | open front (no fold at CF). Each front panel = panelW + 1-1.5" button band extension. V-neck variant: front neckline to bust level (8-10" deep). Button band rib at 90-95% of front edge length | SA 3/8-1/2", buttons 3/4-1" (larger than shirt), hem rib 3-4" finished or 3/4" twin-needle |
| Cape / poncho (unisex) | Core | $14 | Beginner | main body (1 piece with neck hole, or 2 pieces front+back), neckline binding/facing, optional hood, optional arm slits | neck, shoulder width, desired length | wool coating, boiled wool, melton, fleece (8-16 oz) | N/A traditional - drapes from shoulders. Neck = head circ + 2" | rectangle poncho: 50-60" wide. Circle: inner r = head circ / (2pi) + 1", outer r = inner + length. Semi-circle cape: inner r = neck/pi. Hood same as hoodie calc | SA 5/8", hem 1-2" or blanket-stitch, toggle/frog closure |
| Kimono jacket (unisex) | Core | $14 | Intermediate | front left, front right, back (on fold), sleeves integral (cut as one with body), front band, belt, optional pockets | chest, shoulder (extended), sleeve length, torso length, hip | woven: cotton, linen, rayon, silk, brocade (4-8 oz). Knit: french terry, sweater knit | relaxed +6-10", oversized +10-14" | sleeve cut as body extension (like dolman but rectangular). Sleeve width 16-20" opening. Front overlap 4-6" past CF. Belt 2-3" x 60-72" | SA 5/8" woven / 3/8" knit, front band 2-3" finished interfaced, belt loops at side seams |
| Vest / gilet (unisex) | Tailored | $19 | Intermediate | front left, front right, back, full lining (front x2, back), optional welt pockets, optional back belt | chest, shoulder, neck, torso length, waist (for fitted) | outer: twill, wool, canvas, quilted, corduroy (6-12 oz). Lining: polyester or cotton | fitted +2" (over shirt), standard +4", layering +6" | standard upper block with NO sleeves. Armhole 0.5-1" deeper than sleeved. Bagged lining: sew at all edges, turn through shoulder. Back lining 1" kick pleat | SA 5/8" outer / 1/2" lining, buttons 5-6, welt pockets 5" wide double-welt (3/8" lips) |

##### Accessories

| Garment | Tier | Price | Difficulty | Pieces | Measurements | Fabric | Ease | Key Math | Standards |
|---|---|---|---|---|---|---|---|---|---|
| Apron | Simple | $9 | Beginner | front panel, ties x2, neckband or neck tie, optional pockets | N/A (standard sizing or custom) | cotton, linen, canvas, denim (4-8 oz) | N/A | flat rectangle + ties. Full apron: ~27x30" body, ties 1.5-2" x 30-36" each. Half apron: ~27x18" | SA 5/8", hem 1/2" double-turn, topstitch all edges. FreeSewing: albert |
| Bow tie | Simple | $9 | Beginner | center rectangle, knot wrap, optional neckband/strap with adjustable hardware | neck circumference | cotton, silk, linen (3-5 oz) | N/A | rectangle 4.5x11" (butterfly) or 4.5x14" (batwing). Knot 4.5x4.5". No fitting. FreeSewing: benjamin | SA 1/4", press flat, slip-stitch closed |
| Flat cap | Core | $14 | Intermediate | crown (6-8 panels), brim (2 pieces + interfacing) | head circumference | wool, tweed, cotton, linen (6-10 oz) | head circ + 0.5" | crown panels = head circ / panel count. Brim: kidney shape, inner edge = head circ. FreeSewing: florent | SA 3/8", brim interfaced with buckram |
| Bucket hat | Core | $14 | Beginner | crown (1 circle), side band (rectangle), brim (ring) | head circumference | cotton, denim, linen, nylon (4-8 oz) | head circ + 0.5" | crown circle diameter = head circ / pi + 1". Side band = head circ x 3-4" tall. Brim inner = head circ, outer = inner + 5-6" | SA 3/8", topstitch 1/4" on brim |
| Beanie | Simple | $9 | Beginner | 2 or 4 panels (or 1 rectangle folded) | head circumference | knit: rib knit, jersey, fleece (6-10 oz). Must stretch | head circ x 0.85-0.90 (negative ease) | 4-panel: each panel width = head circ/4, height = head circ/2 + 2" for fold-up brim. Panels taper to point at crown | SA 3/8", serged seams |
| Neck gaiter / buff | Simple | $9 | Beginner | 1 rectangle (tube) | head circumference | stretch knit: jersey, fleece, performance (4-8 oz). Must stretch over head | head circ x 0.85 | rectangle: width = head circ x 0.85, height = 10-12" (single) or 20-24" (doubled). Sew into tube | SA 3/8", serged or flatlock |

##### Maternity

| Garment | Tier | Price | Difficulty | Pieces | Measurements | Fabric | Ease | Key Math | Standards |
|---|---|---|---|---|---|---|---|---|---|
| Belly band | Simple | $9 | Beginner | 1 tube of stretch fabric | belly circumference, under-belly, hip | stretch knit: cotton/spandex, bamboo/spandex (5-7 oz). 4-way stretch, good recovery | NEGATIVE: -10 to -15% | tube: width = belly circ x 0.85-0.90, height = 12-14" (covers belly to under-belly). Double-fold for 6-7" finished | SA 3/8", serged, no closures. Very low drafting effort |

---

#### Tier 2 — Strong demand, intermediate, some new geometry
These require moderate new engine functions or garment-specific logic.

##### Dresses

| Garment | Tier | Price | Difficulty | Pieces | Measurements | Fabric | Ease | Key Math | Standards |
|---|---|---|---|---|---|---|---|---|---|
| Sundress | Core | $14 | Intermediate | front bodice, back bodice, front skirt (gathered), back skirt, straps x2, optional lining | bust, underbust, waist, hip, shoulder, nape-to-waist, desired length | light wovens: cotton lawn, voile, rayon, crepe (2-5 oz) | bust +2-3", waist +1" | bodice + gathered skirt. Gathering ratio 1.5:1 to 2:1. Stay tape at waist seam. Strap length = shoulder to bust + 2-3" | SA 5/8", hem 1/2-1", invisible zip CB. FreeSewing: sophie |
| Fit-and-flare dress (W) | Tailored | $19 | Intermediate | front bodice, back bodice x2, front skirt (flared), back skirt, sleeve x2 optional, neck facings, optional lining | bust, waist, hip, shoulder, neck, nape-to-waist, bicep, arm length, skirt length | cotton sateen, ponte, crepe, taffeta (5-8 oz) | bust +2-3", waist +1-1.5" | circle skirt math for skirt: waist r = W/6.28 (full) or W/3.14 (half). Dart intake = (bust+ease)/2 - (waist+ease)/2. Distribute: side 1-1.5", front 0.75-1", back 1-1.5". Waist stay: grosgrain at waist -1" | SA 5/8", hem 1/2-1" for circle / 1.5" for A-line, CB zip 20-22" |
| Maxi dress (W) | Core | $14 | Intermediate | front bodice, back bodice, front skirt, back skirt, sleeve x2 or straps, waist facing, optional lining | bust, waist, hip, shoulder, neck, nape-to-floor, desired length | drapey wovens: rayon, viscose, cotton voile, crepe, chiffon (lined) (3-5 oz) | bust +2-4", waist +1-2", hip +2-4" | floor length = nape to floor - 0.5-1". Hang 48 hrs min before hemming. Slit at side: 22-26" from hem. Fabric req: 4-6 yds at 45" | SA 5/8", hem 1/2-1", waist stay recommended |
| Tiered dress (W) | Core | $14 | Intermediate | front bodice, back bodice, tiers 1-3 (rectangles, progressively wider), sleeve x2 (puff/flutter), neck binding | bust, waist, hip, shoulder, neck, nape-to-waist, total length | light wovens: cotton lawn, voile, gauze, rayon (2-4 oz). Must gather without bulk | bust +2-3", waist +1-2" | **gathering progression: tier 1 = waist circ x 1.5-2.0, tier 2 = tier 1 x 1.5-2.0, tier 3 = tier 2 x 1.5-2.0**. Tier height = total skirt length / tiers (equal or progressive: 6"+8"+10"). Fabric req escalates ~3x | SA 1/2-5/8", hem 1/2" (narrow on full tiers), grade seam allowances at gathers |
| Smocked dress (W) | Core | $14 | Intermediate | front panel (wide rectangle, bust x 2-2.5), back panel (same), optional straps, optional skirt panel | bust, underbust, waist, hip, desired length | light wovens with crisp hand: cotton lawn, voile, batiste, seersucker (2-4 oz) | NEGATIVE in shirred state (elastic draws in to body). Cut width = bust x 2.0-2.5 | **shirring reduces fabric to 40-50% of original width**. Rows every 3/8-1/2", 8-20 rows covering 3-8" of bodice. Stitch length 3-4mm. Steam to activate elastic. Elastic thread: polyester-wrapped latex (NOT polyurethane) | SA 1/2", no zipper (pull-on), hem 1/2-1" |
| Empire waist dress (W) | Core | $14 | Intermediate | front bodice (short, to underbust), back bodice x2, skirt front, skirt back, sleeve x2 optional, neck facings, empire waist stay | bust, underbust, shoulder, neck, nape-to-underbust, waist, hip, total length | georgette (lined), crepe, voile, silk, jersey (3-6 oz) | underbust +0.5-1" (fitted anchor point), bust +1.5-2.5" | empire line 1-2" below underbust. Bodice length 9-12". Front bust dart intake = (bust - underbust) / 4 per side. Stay tape at empire seam (critical). Maternity-friendly crossover | SA 5/8", hem 1/2-1.5", CB zip 14-20", stay tape 1/4" twill |
| Sheath dress (W) | Tailored | $19 | Intermediate | front bodice, back bodice x2, front skirt, back skirt x2 (CB vent), neck facings, armhole facings, optional lining (recommended) | bust, waist, hip, shoulder, neck, nape-to-waist, waist-to-knee, bicep, back width | med woven with 2-5% spandex: wool crepe, stretch wool, ponte, cotton sateen (6-10 oz) | bust +2-3", waist +1-1.5", hip +2" | dart distribution: front bust 1-1.5" + waist 0.75-1", back waist 1-1.5" x2. CB vent 6-8", 1.5" overlap. Walking vent mandatory if hip+ease < 38-40" | SA 5/8", hem 1.5-2", CB zip 20-24" full-length |
| Bodycon dress (W) | Core | $14 | Beginner | front (on fold), back (on fold), optional neckband | bust, waist, hip, shoulder, neck, desired length | HIGH-stretch knits ONLY: power mesh, scuba, ponte with 20-30% spandex. Min 50% stretch + good recovery | NEGATIVE: -1 to -3" at bust/waist/hip | **stretch factor = 1 / (1+stretch%). For 50% stretch: pattern = body x 0.67**. No darts, no zip, no closures. Armhole depth = chest/8 + 1.5" | SA 3/8", hem 3/4-1" twin-needle, all seams 4-thread overlock, ballpoint needle |
| Slip dress (W) | Tailored | $19 | Advanced | front (on TRUE BIAS), back (on TRUE BIAS), spaghetti straps x2, optional side zip, optional lining (on bias) | bust, waist, hip, shoulder-to-bust-point, desired length | fluid fabrics: silk charmeuse, satin-back crepe, crepe de chine, viscose (2-4 oz) | bust +1-2", waist 0-1", hip +1-2" (bias adds ~10-15% stretch) | **BIAS = 45 deg to selvage. Fabric req 1.5-2x straight-grain**. Max panel width on bias for 45" fabric = 31.8". Dress "grows" 1-2" after hanging - cut shorter. Strap 1/4-1/2" finished. Hang 24-48hrs pre-sew, 48hrs pre-hem | SA 1/2" (French seams), hem 1/4" hand-rolled, silk pins, Microtex needle 60/8 |
| Pinafore-to-skirt convertible (W) | Tailored | $19 | Intermediate | front bodice (detachable), back bodice, front skirt, back skirt, waistband (junction), straps/ties, neck binding | bust, waist, hip, shoulder, neck, nape-to-waist, skirt length | med wovens: cotton, linen, denim, ponte (6-10 oz) | bodice bust +2-3", skirt waist +1", hip +2" | connection: snap tape (heavy-duty size 20), buttons, or concealed zip at waist. Bodice overlaps waistband 1-2" to hide junction. Each component must function independently | SA 5/8", snaps heavy-duty size 20, bodice hem 1/2", skirt hem 1.5" |

##### Skirts

| Garment | Tier | Price | Difficulty | Pieces | Measurements | Fabric | Ease | Key Math | Standards |
|---|---|---|---|---|---|---|---|---|---|
| Pleated skirt (W) | Core | $14 | Intermediate | front panel (WIDE), back panel (WIDE), waistband, optional lining | waist, hip, hip depth, desired length | crisp wovens that hold crease: wool suiting, gabardine, taffeta, poly-wool (6-10 oz) | waist +0.5" (pleats absorb ease) | **knife pleat: 3:1 ratio (3" fabric per 1" finished). Box pleat: 3:1 per box**. Pleat count = waist / pleat width. E.g., 28 knife pleats x 3" = 84" fabric. Released pleats: stitched waist to hip (7-8"), released below | SA 5/8", hem 1-1.5", invisible zip side or CB, press with clapper |
| Tiered / gathered skirt (W) | Core | $14 | Intermediate | yoke (or waistband), tier 1 front+back, tier 2, tier 3, optional tier 4 | waist, hip, hip depth, desired length | light wovens: lawn, voile, gauze, rayon (2-4 oz). Must gather without bulk | yoke: waist +1", hip +2" | same gathering progression as tiered dress. Yoke extends below fullest hip (7-8" below waist). Tier 1 = yoke bottom x 1.5-2.0. Each subsequent x 1.5-2.0. Grade seam allowances at gathers | SA 1/2", hem 1/2" (narrow on full bottom tier) |
| Culottes (W) | Core | $14 | Intermediate | front x2, back x2, waistband, optional pockets, optional fly | waist, hip, crotch depth, outseam (mid-calf), thigh, short inseam (10-16") | med wovens: linen, twill, crepe, wool crepe, chambray (5-8 oz) | waist +1", hip +2-4" (must look like skirt), crotch depth +1-1.5" | drafted from trouser block with MUCH wider legs. **Each leg opening >= hip/2 + 4-8"**. Crotch front ext = hip/16 + 0.5", back ext = hip/8 + 0.5" | SA 5/8", hem 1.5", invisible side zip or elastic waist |
| Yoke skirt (W) | Core | $14 | Intermediate | front yoke (interfaced), back yoke, front skirt (gathered), back skirt, optional pockets in yoke seam | waist, hip, hip depth, desired length | yoke: denim, twill, corduroy (structured). Skirt: can be lighter (lawn, voile) | yoke: waist +1", hip +2" (fitted block). Skirt: gathering ratio determines | yoke depth 6-9" from waist (must extend below fullest hip). Yoke dart intake same as standard. Skirt gathering: yoke bottom circ x 1.5-2.5. Western variant: pointed V at CF/CB | SA 5/8", hem 1-1.5", invisible zip CB, interface yoke |
| Tulip skirt (W) | Core | $14 | Intermediate | front left panel, front right panel, back panel, waistband | waist, hip, desired length | med wovens with drape: crepe, wool crepe, ponte, satin (5-8 oz) | waist +1", hip +2" | two front panels overlap at CF. Overlap 3-6" at waist, 0" at hem. Curved convex edge creates "petal" shape. Control point at mid-length extends 2-4" past diagonal | SA 5/8" seams / 1/2" curved overlap edge, faced or lined overlap edge |
| Godet skirt (W) | Tailored | $19 | Intermediate | front panel, back panel, godets x4-8 (triangles or circle segments), waistband | waist, hip, desired length, godet insertion point | light-med wovens: chiffon, crepe, georgette, silk (2-5 oz). Fluid fabrics for drama | waist +1", hip +2" (godets don't affect hip) | **godet = isosceles triangle. Height = insertion to hem. Angle determines fullness**. 12" tall, 6" base = 28 deg. Circular godet: quarter-circle at radius = godet height. Insertion at hip (7-8") or knee (mermaid). Reinforce insertion point | SA 5/8" panels / 1/2" godet seams, hem 1/2-1", bartack at insertion points |
| Bias-cut skirt (W) | Tailored | $19 | Advanced | front (on BIAS, NOT on fold), back (on BIAS), waistband (straight grain) or petersham | waist, hip, hip depth, desired length | fluid fabrics: silk crepe, satin, charmeuse, rayon, viscose (2-4 oz) | waist +0.5-1", hip +1-2" (bias adds ~10-15% stretch) | **45 deg to selvage. Fabric req 1.5-2x**. Stay tape on all seams. Petersham waistband preferred (doesn't stretch). Hem drops 1-2" at bias points after hanging. Polyester thread (cotton puckers on bias) | SA 1/2" (French seams), hem 1/4" hand-rolled, hang 24-48hrs, level from floor |

##### Tops

| Garment | Tier | Price | Difficulty | Pieces | Measurements | Fabric | Ease | Key Math | Standards |
|---|---|---|---|---|---|---|---|---|---|
| Peplum top (W) | Core | $14 | Intermediate | front bodice (fitted, to waist), back bodice, peplum skirt front, peplum skirt back, sleeve x2, neckband/facing | bust, waist, shoulder, neck, sleeve length, hip, underbust | woven: cotton sateen, ponte, neoprene (6-10 oz). Needs body for peplum | bust +1-2" (fitted), waist +0-1" | bodice to waist (15-16"). Bust dart = (bust-waist)/4. **Peplum options: gathered rectangle at 1.5-2x waist, OR circle peplum: inner r = waist/(2pi), outer r = inner + 6-8"**. Peplum length 6-8" | SA 5/8", peplum hem 1/4-3/8" narrow rolled |
| Wrap top (W) | Core | $14 | Intermediate | front left (extends 4-5" past CF), front right, back (on fold), sleeve x2, ties x2, V-neckline facing | bust, waist, shoulder, neck, sleeve length, torso length | drapey wovens: rayon, crepe, cotton lawn (3-5 oz). Knit: jersey with recovery | standard +3", relaxed +5". Waist +1-2" (wrap cinches) | same as wrap-dress-w.js shortened. Each front extends 4-5" past CF. V-neckline 8-12" deep. Tie placement: one in right side seam, second at left front inner edge. Snap at inner CF overlap | SA 5/8", hem 1/4" rolled at overlap edges / 1" at body, ties 1.5" x 28-30" |
| Peasant / boho blouse (W) | Core | $14 | Intermediate | front (on fold, gathered neckline), back (on fold), puff sleeve x2, neckline elastic casing, sleeve elastic casings | bust, shoulder (less critical), neck, bicep, sleeve length, torso length | light wovens: cotton voile, lawn, double gauze, rayon (2-4 oz) | very generous +6-10" (gathered/smocked fit) | neckline cut width = shoulder width + 4-6", gathered to neck circ + 2" by elastic. Elastic at 85-90% of head circ (must pass over head). Puff sleeve = bicep x 1.5-2.0. Cuff elastic at 80% of wrist | SA 5/8", neckline casing 1/2" for 1/4" elastic, French seams for sheer |
| Off-shoulder / bardot top (W) | Core | $14 | Intermediate | front (on fold, wide neckline), back (on fold), elastic casing strip, optional ruffle strip | bust, shoulder, bicep, torso length, underbust | woven: poplin, sateen, chambray, eyelet (4-6 oz). Knit: ponte, jersey | standard +3-4", relaxed +5-6" | top edge circ = (shoulder width + 4") x 2 (~36-42"). Elastic = upper arm circ at off-shoulder position x 0.80. Optional ruffle: 2-3x elastic circ, 3-5" wide | elastic 3/4" braided, 1" fold-over casing |
| Puff-sleeve top (W) | Core | $14 | Intermediate | front bodice, back bodice, puff sleeve x2 (oversized), cuff bands x2, neckband | bust, shoulder, neck, bicep, sleeve length, torso length | woven: poplin, organza (volume), taffeta, sateen. Knit: jersey, ponte | body +3-4", **sleeve = bicep x 1.5-2.5x** | sleeve cap ease 3-6" (much more than standard 1-1.5"). Cap height increased 0.70-0.75 of armhole depth. Cuff band circ = arm-at-cuff x 0.85-0.90. Bishop variant: gathered at BOTH cap and cuff | gathering threads 2 rows at 4-5mm stitch. No pressing of gathers |
| Bodysuit (W) | Core | $14 | Intermediate | front (on fold, extended through crotch), back (on fold, extended), sleeve x2 optional, neckband, snap crotch extension, leg elastic | bust, shoulder, neck, bicep, torso length, waist, hip, front AND back rise | knit ONLY: cotton/spandex, ponte, rib, mesh (5-8 oz). Min 25% stretch | fitted +1-2", standard +2-3" | front body = torso + front rise. Back body = torso + back rise (1-2" longer). Crotch width 2-3". Leg elastic at 80-85% of leg opening. Gusset: 3" x 4-5", double-layer for snaps | SA 3/8", snaps: 3 KAM size 20 at crotch, gusset double cotton, all seams serged/flatlock |
| Corset / bustier top (W) | Tailored | $19 | Advanced | CF panel x2, side-front x2, side x2, CB panel x2 (lacing), lining (all panels in coutil), boning channels x12+ | bust, underbust, waist, upper hip, bust apex height, bust apex spacing, back width | outer: sateen, brocade, satin (6-12 oz). Lining: cotton coutil/drill (8-10 oz, NON-stretch) | **NEGATIVE at waist: -2 to -4"**. Bust +0-1". Underbust 0 to -1" | **6-panel min (3/side). Bust cup = convex curve at apex on CF/side-front panels**. Boning at every seam + 2 flanking CF/CB. Bone length = panel height - 1/2" each end. Eyelet spacing 1" apart, 1/2" from CB edge. Lacing gap 2-3" when worn | SA 1/2", spiral steel bones 1/4" in 5/8" channels, 2-part grommets 3/16-1/4", bias binding 1" finished |
| Polo shirt (M) | Core | $14 | Intermediate | front (on fold, placket slit), back (on fold), sleeve x2, collar (upper+under), collar stand x2, placket x2 (L/R), optional rib sleeve bands | chest, shoulder, neck, bicep, torso length, sleeve length (8-10") | knit: pique (6-8 oz), interlock, performance poly-pique. Collar: self-fabric or rib (firmer) | fitted +2-3", standard +4", relaxed +6" | collar: rectangle, length = neck opening/2, width 2.5-3". Stand 1-1.25" high. Placket 6-7" deep, 1.25" each side. 2-3 buttons 7/16-1/2". Side vents 2-3", front overlaps back | SA 3/8-1/2", collar interfaced, hem 3/4" twin-needle, side vents bar tacked |
| Flannel shirt (M) | Tailored | $19 | Intermediate | front left (button stand), front right, back (on fold/yoke), back yoke x2, sleeve x2, collar + stand, cuff x2, sleeve placket x2, pocket x1-2 | chest, shoulder, neck, sleeve length, bicep, wrist, torso length, back width | cotton flannel (5-8 oz), brushed cotton. Plaid matching adds 15-25% fabric | standard +4", relaxed +5-6" | plaid matching at CF, shoulders, sides, plackets. Collar: collarCurve() style='point'. Stand 1.25". Button spacing 3-3.5", 7 buttons. Yoke: yokeSplit(). Sleeve placket 5-6". Cuff 2.5-3" finished, wrist + 3-4" | SA 5/8", flat-felled seams, interfaced collar/stand/cuffs, buttons 5/8-3/4" |
| Western shirt (M) | Tailored | $19 | Intermediate | front left, front right, front yoke x2 (pointed), back yoke x2, back, sleeve x2, collar + stand (wider spread), cuff x2 (pointed), flap pockets x2 | chest, shoulder, neck, sleeve length, bicep, wrist, torso length, back width | cotton chambray, broadcloth, cotton sateen (5-7 oz) | standard +4", relaxed +5-6" | front yoke: pointed V shape, 3-4" at shoulder, 6-8" at CF point. Uses yokeSplit(). Collar: wider spread, points 3-3.5" (vs 2.5-3" standard). Western cuff: pointed tab. Pearl snaps 5-6mm, 5-7 total | SA 5/8", flat-felled seams, pearl snaps installed with setter, topstitch 1/4" all details |
| Hawaiian shirt (M) | Core | $14 | Intermediate | front left (button stand), front right, back (on fold), sleeve x2 (short), camp collar, front facing, optional pocket | chest, shoulder, neck, torso length, bicep | rayon (classic), viscose, cotton lawn, linen, silk (3-5 oz, lightweight drapey) | standard +4-6", relaxed +6-8" (boxy) | same as camp-shirt.js. Camp collar: no stand, lies flat. Notch angle 30-45 deg at CF. Untucked length (22-24"). No plaid matching needed (all-over prints) | SA 5/8", French or flat-felled seams, buttons 5/8-3/4" coconut/MOP, collar lightweight interfacing |
| Rugby shirt (M) | Core | $14 | Intermediate | front (on fold, placket slit), back (on fold), sleeve x2, woven collar (NOT knit), placket strip (twill reinforced), optional rib cuffs, optional contrast panels | chest, shoulder, neck, sleeve length, torso length | heavy knit: cotton jersey (8-12 oz, 240-280 GSM). Collar: woven cotton twill/drill | standard +4-5", relaxed +6-8" | placket 7-8", reinforced with twill tape. Collar: one-piece woven rectangle 2.5-3" wide, NO stand - direct attach to neckline. Rubber buttons 2-3, spaced 2.5-3". Color blocking: horizontal panels sewn together | SA 1/2", serged/safety-stitched, woven collar is distinguishing feature, rubber buttons |

##### Pants

| Garment | Tier | Price | Difficulty | Pieces | Measurements | Fabric | Ease | Key Math | Standards |
|---|---|---|---|---|---|---|---|---|---|
| Paperbag waist pants (W) | Core | $14 | Intermediate | front x2, back x2, extended waistband (integral), belt/tie, fly or side zip, optional pockets | waist, hip, rise, thigh, inseam | cotton poplin, linen, twill, tencel, chambray (4-7 oz) | waist +4-8" BEFORE gathering (excess = paperbag). Hip +2-3" | **waist cut 1.5-2x actual waist, gathered to fit**. Paperbag extension 2-3" above natural waist. Belt loops x5-6. Back can have elastic shirring. Belt 1.5-2" x 48-60" | SA 5/8", gathering 2 rows at 4mm, belt self-fabric tube |
| Cigarette pants (W) | Core | $14 | Intermediate | front x2, back x2, waistband (interfaced), fly or invisible side zip, optional pockets, belt loops | waist, hip, rise, thigh, inseam (27-29" cropped), knee, calf, ankle | woven with stretch: cotton/spandex twill, stretch gabardine, wool/spandex (6-10 oz). 2-3% spandex essential | slim: hip +1-1.5", standard +2". Waist +0.5" | LEG_SHAPES.slim or .skinny. Knee = hipW x 0.65-0.70, ankle = hipW x 0.55-0.60. Rise: mid or low (0 to -1.5"). Length cropped to ankle (1-2" above ankle bone) | SA 5/8", invisible side zip 7", hem 3/4-1", hook and bar |
| Harem / drop-crotch pants (W) | Core | $14 | Intermediate | front x2, back x2, waistband (elastic), optional gusset | waist, hip, rise, thigh, inseam, desired crotch drop (4-10") | knit: rayon jersey, modal, bamboo. Woven: rayon, linen, silk (3-5 oz, drapey) | hip +4-8" (relaxed). Elastic gathers waist | **effective rise = natural rise + drop (e.g., 10" + 6" = 16")**. Inseam shortened by drop amount. Front ext 3-5", back ext 5-8". Optional diamond gusset 6-12" at crotch | SA 3/8-1/2" knit / 5/8" woven, elastic 1-1.5", tapered ankle 10-12" circ |
| Barrel-leg pants (W) | Core | $14 | Intermediate | front x2, back x2, waistband, fly or side zip | waist, hip, rise, thigh, inseam, knee, calf, ankle | woven with body: twill, gabardine, wool suiting, linen (5-8 oz) | hip +2-3" | **custom leg shape: knee ratio 1.0-1.1 (WIDEST), hem ratio 0.65-0.75**. Convex side seam hip-to-knee, concave knee-to-hem. Total hem must accommodate foot: ankle + 4" min | SA 5/8", hem 1-1.5", waistband 1.5" interfaced |
| Tailored shorts (W) | Core | $14 | Intermediate | front x2, back x2, waistband, fly, pockets, belt loops | waist, hip, rise, thigh, desired inseam (5-8") | cotton twill, linen, sateen, gabardine, seersucker (5-8 oz) | waist +0.5-1", hip +2-2.5" | same lower block as chinos.js shortened. Rise: mid to high. Leg straight (no taper at this length). Back darts: 2 per side, 3/4-1" intake, 4" long | SA 5/8", waistband 1.5" interfaced, zip fly 5-6", belt loops x6, hem 1-1.5" |
| Bike shorts (unisex) | Simple | $9 | Intermediate | front x2, back x2, waistband (wide elastic), optional chamois pad, optional gusset | waist, hip, rise, thigh, desired inseam (7-10") | nylon/spandex (80/20), cotton/spandex (92/8), performance compression (6-8 oz). 4-way stretch, high recovery | **NEGATIVE: -1 to -2" at hip (compression)**. Thigh = natural x 0.85-0.90 | pattern cut SMALLER than body. 2-piece construction (no side seam) reduces chafing. Silicone gripper tape at leg hem optional | SA 3/8", flatlock preferred, waistband 1.5-2" plush-backed elastic, no pockets |

##### Outerwear

| Garment | Tier | Price | Difficulty | Pieces | Measurements | Fabric | Ease | Key Math | Standards |
|---|---|---|---|---|---|---|---|---|---|
| Shacket / shirt jacket (unisex) | Tailored | $19 | Intermediate | front left (button stand), front right, back (optional yoke), yoke x2, sleeve x2, collar + stand, cuff x2, pockets x2, facing | chest, shoulder, neck, sleeve length, bicep, wrist, torso length | heavy flannel (8-10 oz), cotton twill, corduroy, wool blend, heavy chambray (7-12 oz) | standard +5-6", relaxed +8-10". Shoulder extended 0.5-1" (dropped) | same as flannel shirt but heavier, wider. Facing 3-3.5" (wider than shirt). Pocket 5.5-6" x 6-6.5" (larger than shirt). THE trending garment 2024-2026 | SA 5/8", flat-felled seams, buttons 3/4-7/8", interfacing medium on collar/stand/cuffs/facing |
| Bomber jacket (unisex) | Tailored | $19 | Intermediate | front left (zip extension), front right, back (on fold), sleeve x2, rib collar, rib waistband, rib cuffs x2, lining (front x2, back, sleeve x2), optional pockets | chest, shoulder, neck, sleeve length, bicep, torso length (waist-length) | outer: nylon, satin, twill, wool (6-10 oz). Lining: quilted polyester or satin. Rib: 2x1 knit (3-4" finished) | standard +4-6", relaxed +6-8". Length: natural waist or 1" below | rib collar = neck opening x 0.85, 2.5-3" finished. Rib waistband = hem x 0.85-0.90, 3-4" finished. Rib cuffs = sleeve opening x 0.80-0.85. CB lining pleat 1". Lining cut 1/2" shorter than outer | SA 5/8" outer / 1/2" lining, separating zip 20-24" (YKK #5), rib 95% cotton/5% spandex |
| Quilted / puffer jacket (unisex) | Tailored | $19 | Advanced | front left, front right, back, sleeve x2 (ALL quilted: outer+batting), lining same pieces, hood or stand collar, zipper, optional storm flap | chest, shoulder, neck, sleeve length, bicep, torso length | shell: ripstop nylon, microfiber poly (3-5 oz). Insulation: poly batting 3-6 oz or down. Lining: poly taffeta (1-2 oz) | +6-8" at chest (batting takes up space). Sleeve: bicep + 4-6" | **quilting channels 3-5" apart. Quilting reduces panel 5-10% - cut 5% larger**. Batting cut WITHOUT SA (butted, not overlapped). Hood: add 1" all around for insulation bulk | SA 5/8" outer / 1/2" lining, heavy-duty separating zip (YKK #5 or #7), storm flap 2" with snap/velcro |
| Rain jacket / anorak (unisex) | Tailored | $19 | Advanced | front (or x2 for full zip / 1 for half-zip anorak), back, hood (2 panels + optional brim), sleeve x2, storm flap, drawstring channels x2, sealed pockets | chest, shoulder, neck, sleeve length, bicep, torso length, hip | waterproof: PUL, Gore-Tex, waxed cotton, DWR-coated nylon (3-6 oz). Lining: mesh. **NO PINS - use clips** | standard +5-6", relaxed +7-9". Length mid-hip to thigh (26-30") | **ALL seams must be sealed (seam tape at 300-350F)**. Hood larger than hoodie (head circ/2 + 3", head circ/3 + 2"). Raglan option eliminates shoulder seam (fewer seal points). Drawstring channels 3/4" | seam tape 1" wide waterproof, waterproof zipper (Aquaguard), storm flap 2-3" with velcro, drawstring elastic cord with barrel toggles |
| Peacoat (unisex) | Tailored | $19 | Advanced | front left (double-breasted overlap), front right, back (CB vent), two-piece sleeve x2, collar (upper+under+stand), front facings x2, lining (all + CB pleat), welt pockets x2 | chest, shoulder, neck, sleeve length, bicep, wrist, torso length, waist | wool melton (24-32 oz), wool/cashmere blend. Lining: poly satin, acetate. Canvas: sew-in chest canvas | standard +5-6" (layers over suits), relaxed +7-8". Length mid-thigh (32-36") | **double-breasted overlap 3-4" past CF each side (6-8" total)**. 2 button columns 2.5-3" from CF, 6 buttons shown (4 functional). Two-piece sleeve: twoPartSleeve() with cap ease 1.5-2". Under collar 2% smaller. CB vent 8-12" | SA 5/8" / 1/2" lining, buttons 7/8-1" (horn/metal) + anchor buttons, keyhole buttonholes, pad-stitching on collar/lapel |
| Varsity jacket (unisex) | Tailored | $19 | Advanced | front left, front right (body color), back (body color), sleeve x2 (CONTRAST - leather or contrast wool), rib collar/waistband/cuffs (striped), lining, optional chenille patch | chest, shoulder, neck, sleeve length, bicep, torso length (waist-length) | body: wool melton (24 oz). Sleeves: leather/faux leather or contrast wool. Rib: 2x2 with stripe pattern | standard +4-6" (same as bomber) | same block as bomber with TWO FABRICS. Rib stripe: solid center + 2 contrast lines 3/8-1/2" wide. 5-6 cap snaps (line 24). Heavy interfacing at snap locations | leather SA 3/8" (no fray), wool 5/8", leather needle 110/18, walking foot, chenille hand-tacked |
| Puffer vest (unisex) | Tailored | $19 | Intermediate | front left, front right, back (quilted: shell+batting), lining, stand collar or hood, separating zip, optional pockets | chest, shoulder, neck, torso length | same as puffer jacket minus sleeves. Shell + batting + lining | +4-6" at chest | armhole 1" deeper than standard (no sleeves). Quilting channels same as puffer jacket. Binding at armhole edge | same as puffer jacket. Armhole bound with bias 1" finished |
| Moto / biker jacket (unisex) | Tailored | $19 | Advanced | front left (asymmetric zip line), front right (shorter underlap), back, two-piece sleeve x2 (pre-bent elbow), collar (band or notch), lining, zipper pockets x2-4, optional belt + buckle | chest, shoulder, neck, sleeve length, bicep, wrist, torso length, waist | leather (2-3 oz garment weight), faux leather, heavy waxed canvas. Lining: quilted poly or satin | fitted +3-4", standard +4-5". Short: waist to 2" below (18-20") | **asymmetric front zip: runs from right hip diagonally to left collar**. Left front extends 5-6" past CF. Zip angle ~15-20 deg from vertical. Two-piece sleeve with elbow bend = 15-20 deg. Band collar 2" tall or asymmetric notch | leather SA 3/8", Teflon foot, 3.5-4mm stitch, metal zips YKK #5 (main 20-24", pockets 6-7"), Tex 70 thread |

##### Intimates & Swimwear

| Garment | Tier | Price | Difficulty | Pieces | Measurements | Fabric | Ease | Key Math | Standards |
|---|---|---|---|---|---|---|---|---|---|
| Bralette (W) | Simple | $9 | Intermediate | center cup x2 (or single triangle), side cup x2, band (front+back), strap x2, back closure facing | underbust, bust, highBust, bustSpan, bustApexVertical | stretch lace (1-3 oz, 40-60% stretch 4-way), cotton/spandex jersey, power mesh. Lining: nylon tricot | **NEGATIVE: band = underbust x 0.85-0.90**. Cup 0" ease | **cup size = bust - underbust (A=1", B=2", C=3", D=4")**. Cup height = difference + 0.5". Cup width at base = bustSpan/2 + 0.5". 2-piece cup: center 40%, side 60%. Band curve: concave at cup junction (ribcage contour). Triangle: base = bustSpan/2, height = cup diff + 2" | SA 1/4" (narrow lingerie), hook-eye 2-row A-C / 3-row D+, strap 3/8" A-C / 1/2" D+, FOE at edges |
| Sports bra (W) | Core | $14 | Intermediate | front outer (on fold or 2 pieces princess), front lining, back outer (racerback option), back lining, elastic channeling, optional cup pocket for inserts | underbust, bust, highBust, bustSpan, bustApexVertical, shoulder | performance poly/spandex (80/20, 5-7 oz). Lining: power mesh. Min 50% stretch + 95% recovery | **NEGATIVE: light -10-15%, med -15-20%, high -20-25%** | princess seam: cup depth = (bust-underbust)/2 per side. D+: 3-part cup. Power mesh inner panel for support. Encapsulation (each cup separate) vs compression (flatten) | SA 3/8", elastic 3/4-1" at underbust (heavy-duty), serged or flatlock seams |
| Bikini top (W) | Simple | $9 | Intermediate | triangle cups x2 (or structured cups), band or tie, neck strap, back tie/clasp | underbust, bust, bustSpan, bustApexVertical | swim knit: nylon/spandex 80/20 (5-7 oz), chlorine resistant. Lining: swim lining | NEGATIVE: -10 to -15% (body + wet stretch) | triangle: base = bustSpan/2, height = cup diff + 1.5". Band = underbust x 0.85. **Wet stretch compensation: -5 to -10% additional**. Rings/sliders for adjustable straps | SA 1/4", swimwear elastic (chlorine resistant), zigzag all seams, stretch needle |
| Bikini bottom (W) | Simple | $9 | Intermediate | front panel, back panel, lining (front+back), elastic for waist and legs | waist, hip, rise | swim knit (same as top). Lining: swim lining (nude or matching) | NEGATIVE: -10 to -15% + wet stretch -5-10% | multiple styles: classic, high-waist, high-cut. Front rise varies by style. FOE or swimwear elastic at all openings. Lining cut same as outer | SA 1/4", FOE or swimwear elastic, all seams zigzag or serged |
| One-piece swimsuit (W) | Core | $14 | Intermediate | front (on fold), back (on fold), lining (front+back), optional bust cups, optional shelf bra panel | bust, underbust, waist, hip, rise (front+back), torsoVertical | swim knit 80/20 nylon/spandex, chlorine resistant. Lining: power mesh or swim lining | **NEGATIVE: -15 to -20% + wet stretch comp** | combines bodice block + lower body simplified. Front body = torso + front rise. Back = torso + back rise (longer). Shelf bra: inner panel of power mesh from underbust to cup line. Leg opening = hip/4 per panel, curved | SA 1/4", swimwear elastic, bra cups optional (removable inserts), all seams serged |
| Tankini (W) | Core | $14 | Intermediate | tank top (on fold front+back), bikini bottom (same as above), optional shelf bra in tank | bust, underbust, waist, hip, rise, torso length | swim knit, chlorine resistant. Lining: swim lining | tank: -10 to -15%. Bottom: -10 to -15% + wet stretch | tank length: hip bone (covers waist). Shelf bra at underbust. Tank ease slightly less negative than one-piece. Bottom: same as bikini bottom | SA 1/4", swimwear elastic, combination of tank top + bottom construction |
| Swim cover-up / kaftan (W) | Simple | $9 | Beginner | front (on fold or 2 pieces for neckline slit), back (on fold), optional neckline binding | bust, shoulder, desired length | cotton gauze, rayon, lightweight linen, chiffon (2-4 oz). NOT swim fabric - woven | relaxed +8-12" (very loose) | essentially a simplified tunic/caftan. Rectangle or A-line with neckline opening. No fitting needed. Quick sew, pairs with swimwear sales | SA 5/8", hem 1/2-1" |

##### Jumpsuits & Full-body

| Garment | Tier | Price | Difficulty | Pieces | Measurements | Fabric | Ease | Key Math | Standards |
|---|---|---|---|---|---|---|---|---|---|
| Jumpsuit wide-leg (W) | Tailored | $19 | Intermediate | front bodice, back bodice x2, front leg x2, back leg x2, waist facing or waistband, optional pockets, closure | bust, waist, hip, shoulder, neck, nape-to-waist, rise, thigh, inseam | woven: crepe, linen, rayon, cotton (4-7 oz) | bust +2-3", waist +1-1.5", hip +2-3" | combines upper body block + lower body block at waist. Wide leg: each opening = hip/2 + 4-8". Critical: total torso + rise + inseam = full body length | SA 5/8", CB zip 20-24" (through bodice into pants), waist stay |
| Boilersuit / coverall (unisex) | Core | $14 | Intermediate | front x2 (or 1 with CF zip), back x2 (or 1 on fold), sleeve x2, collar (optional), pockets (patch, chest, leg), waistband elastic or drawstring | chest, shoulder, neck, sleeve length, bicep, torso length, waist, hip, rise, inseam | cotton twill, cotton drill, canvas, denim (7-12 oz, sturdy) | +4-6" chest, +3-4" hip (utility ease) | utilitarian full-body. Front separating zip from neck to crotch/waist. Elastic or drawstring at waist to define shape. Multiple pockets (utility) | SA 5/8", flat-felled seams, heavy-duty separating zip, bar tacks at stress points |
| Overalls / dungarees | Tailored | $19 | Intermediate | front bib, back body x2, front leg x2, back leg x2, straps x2 (adjustable), waistband, pockets | waist, hip, rise, thigh, inseam, chest (for bib width), shoulder (for strap placement) | denim, cotton twill, canvas, corduroy (8-12 oz) | hip +2-4", bib width = chest/2 + 2-3" | bib front: width = chest/2, height = waist to desired chest coverage (10-14"). Straps: 1.5-2" wide, adjustable with D-rings or buckles. Trouser base uses standard lower block | SA 5/8", topstitch 1/4", D-ring/buckle hardware, rivets at stress points. FreeSewing: opal |
| Romper | Core | $14 | Intermediate | front bodice, back bodice, front short x2, back short x2, optional waist elastic, closure | bust, waist, hip, shoulder, neck, rise, thigh, desired short inseam (3-6") | cotton, linen, rayon (4-7 oz) | bust +2-3", hip +2-3" | bodice + shorts at waist. Short inseam 3-6". Can be pull-on with elastic waist or have CB zip | SA 5/8", hem 1", closure CB zip or elastic waist. FreeSewing: otis |

##### Workwear

| Garment | Tier | Price | Difficulty | Pieces | Measurements | Fabric | Ease | Key Math | Standards |
|---|---|---|---|---|---|---|---|---|---|
| Scrubs top (unisex) | Simple | $9 | Beginner | front (on fold, V-neck), back (on fold), sleeve x2 (short), neckline binding, optional chest pocket | chest, shoulder, neck, torso length | polyester/cotton poplin 65/35 (4-5 oz), wrinkle-resistant | relaxed +6-8" | V-neckline 8-10" deep. Short sleeves. Boxy fit, no darts. Side vents 2-3". Same upper block with generous ease | SA 5/8", hem 1", binding at V-neck 1" finished |
| Scrubs pants (unisex) | Simple | $9 | Beginner | front x2, back x2, elastic waistband, drawstring, optional cargo pockets | waist, hip, rise, inseam | same as top: poly/cotton poplin | relaxed +4-6" hip | simplified straight-leg trouser. Elastic + drawstring waist. Optional cargo pockets at thigh (6x7" with flap). Same lower block as pajama pants with less ease | SA 5/8", elastic 1" at 85% waist, drawstring 1/4" x 48" |
| Chef coat (unisex) | Core | $14 | Intermediate | front left, front right (double-breasted overlap), back, sleeve x2, mandarin collar (stand only, no fall), knotted buttons, optional pocket | chest, shoulder, neck, sleeve length, bicep, torso length | cotton twill, poly/cotton blend (5-8 oz), white traditional or patterned | standard +4-6" (must move freely) | double-breasted: each front extends 3-4" past CF. Mandarin collar 1.5-2" stand, no fall. Knotted cloth buttons (heat resistant). Reversible front (switch sides when soiled). Sleeve: can roll up (no cuff) | SA 5/8", cloth knotted buttons x 10-12 |

##### Children's (via body type selector + new measurement defaults)

| Garment | Tier | Price | Difficulty | Pieces | Measurements | Fabric | Ease | Key Math | Standards |
|---|---|---|---|---|---|---|---|---|---|
| Kids' leggings | Simple | $9 | Beginner | front x2, back x2, waistband (elastic casing) | waist, hip, rise, inseam, height | cotton/spandex jersey, performance knit (4-6 oz). 4-way stretch | NEGATIVE -5 to -10% | same as adult leggings scaled. **ASTM D6192 children's body tables**. Proportionally larger head, shorter limbs. Elastic waist only, no fly | SA 3/8", elastic 3/4" at 80% waist. CPSC flammability if labeled "sleepwear" (16 CFR 1615/1616) |
| Kids' T-shirt | Simple | $9 | Beginner | front (on fold), back (on fold), sleeve x2, neckband | chest, shoulder, neck, sleeve length, torso length, height | cotton jersey, cotton/poly blend (4-6 oz) | +2-3" at chest (extra for growth + movement) | same upper block scaled. +1" to standard ease for growth room. Neckband must fit over head: head circ + 2" min. No bust darts | SA 3/8", hem 3/4" twin-needle |
| Kids' dress (A-line) | Simple | $9 | Beginner | front bodice, back bodice, front skirt, back skirt, neckband or facing, optional sleeve | chest, shoulder, neck, waist, desired length, height | cotton, cotton/poly, knit, flannel (4-6 oz) | +2-3" chest, +1" waist | A-line skirt from waist. No bust darts. Elastic or button back closure for small children. Add +1" ease for growth | SA 3/8-5/8" depending on fabric, hem 1" |
| Kids' joggers | Simple | $9 | Beginner | front x2, back x2, elastic waistband, rib cuffs x2 | waist, hip, rise, inseam, height | french terry, sweatshirt fleece, cotton jersey (6-10 oz) | +2-3" hip | same as adult joggers scaled. All elastic waist (no fly for under 8). Rib cuffs at 85% ankle | SA 3/8-1/2", elastic 3/4" at 80% waist |
| Kids' pajamas (set) | Core | $14 | Beginner | top: front, back, sleeve x2, neckband. Pants: front x2, back x2, elastic waist | chest, shoulder, neck, sleeve length, waist, hip, rise, inseam, height | cotton flannel, cotton knit (4-6 oz). **Must meet CPSC flammability (16 CFR 1615/1616)**: either snug-fit OR flame-resistant fabric | +1-2" chest (snug-fit) or per CPSC | **CPSC compliance mandatory for children's sleepwear sizes 9M-14Y**: snug-fitting (max 10% ease) OR flame-resistant treated fabric. Snug-fit = body dimensions + max 10% ease. Label must state "Tight-Fitting - Not Flame Resistant" if snug-fit | SA 3/8", all elastic waist, snap or button top, CPSC labeling required |
| Baby romper | Simple | $9 | Intermediate | front (1 piece through crotch), back (1 piece), sleeve x2 optional, snap tape at crotch and possibly inseam, neckband | chest, torso length, rise, shoulder, neck, height | cotton knit, interlock, cotton woven (3-5 oz). Soft hand essential | +2-3" (generous for diaper + movement) | envelope neck (overlapping shoulders) for easy dressing. Snap tape at crotch for diaper changes. Length = shoulder to crotch + 2" for diaper. Leg openings elasticized or snap-open | SA 3/8", KAM snaps T3/T5 at crotch (5-7 snaps), envelope neck opening |
| Baby onesie / bodysuit | Simple | $9 | Intermediate | front (on fold, extended through crotch), back (on fold, extended), snap crotch extension, neckband (envelope) | chest, torso length, rise, shoulder, neck, height | cotton interlock, cotton jersey (4-5 oz). Soft, pre-washed | +2-3" | envelope neck must stretch to head circ + 4". Snap crotch: 3 snaps. Leg elastic at 80% of opening. Gusset double-cotton for comfort | SA 1/4-3/8", KAM snaps T3, ballpoint needle |

##### Adaptive Clothing

| Garment | Tier | Price | Difficulty | Pieces | Measurements | Fabric | Ease | Key Math | Standards |
|---|---|---|---|---|---|---|---|---|---|
| Seated-fit pants | Core | $14 | Intermediate | front x2, back x2 (HIGHER back rise), waistband (elastic, no fly), optional side-open panels | waist, hip, seatToFloor, backWaistToSeat, lapWidth, thigh | cotton twill, stretch woven with spandex (5-8 oz) | hip +3-4" (wider for seated spread) | **back rise +3-4" above standard (prevent gap when seated). Front rise -1-2" (fabric bunches seated)**. lapWidth replaces standing hip for wheelchair. Leg width generous for seated position. Side-open: full snap or zip from waist to hem | SA 5/8", elastic waist, magnetic snaps or velcro for easy on/off |
| Magnetic closure top | Core | $14 | Intermediate | same as standard top BUT buttons replaced with sew-in magnetic closures | same as standard top | same as standard top | same as standard | magnetic snaps replace all buttons. Button stand reinforced for magnet weight. Magnets concealed behind facing. For dexterity-limited users | sew-in magnets 15-18mm, concealed behind facings |
| Open-back top/gown | Core | $14 | Intermediate | front (standard), back LEFT (extends 3-4" past CB), back RIGHT (overlaps), ties or velcro at back neck and waist | bust, waist, shoulder, neck, torso length | cotton knit, cotton woven (4-6 oz). Soft, easy-care | standard +3-4" | full back opening from neck to hem. Back panels overlap 3-4" at CB. Velcro or ties at neck and waist. For wheelchair/hospital use. Can be adapted from any existing top pattern | SA 5/8", velcro 3/4" or 1" sew-in, ties self-fabric 1" x 12" |

##### Maternity (Tier 2)

| Garment | Tier | Price | Difficulty | Pieces | Measurements | Fabric | Ease | Key Math | Standards |
|---|---|---|---|---|---|---|---|---|---|
| Maternity leggings | Core | $14 | Intermediate | front x2 (with belly panel extension), back x2, belly panel (stretch knit), elastic at panel top | waist, hip, bellyCircumference, rise, inseam | cotton/spandex jersey (body), power mesh or jersey (belly panel). 4-way stretch | NEGATIVE -5-10% body, belly panel at 90% of belly | belly panel: extends 6-8" above natural waist, covers belly. Panel cut as curved piece matching belly curve. Can be over-belly or under-belly style | SA 3/8", elastic at panel top 3/4" at 80%, serged seams |
| Nursing top | Core | $14 | Intermediate | front LEFT (extends past CF for overlap), front RIGHT (underlap), back (on fold), sleeve x2, neckband | bust, shoulder, neck, sleeve length, torso length | cotton jersey, modal, bamboo knit (5-7 oz). Soft, washable | +3-4" bust (nursing access + postpartum sizing) | crossover/wrap front for nursing access. Left front over right (or reverse). Hidden overlap seam allows pull-aside for nursing without lifting. Can also use button-front or hidden side-zip access | SA 3/8", crossover overlap 4-5" past CF |

##### Formal / Occasion (Tier 2-3)

| Garment | Tier | Price | Difficulty | Pieces | Measurements | Fabric | Ease | Key Math | Standards |
|---|---|---|---|---|---|---|---|---|---|
| Cocktail dress (W) | Tailored | $19 | Advanced | front bodice x2 (princess seams), side bodice x2, back bodice x2, skirt front, skirt back x2, full lining, boning channels x6-8 | bust, waist, hip, shoulder, neck, nape-to-waist, waist-to-knee, front bust-to-bust, shoulder-to-bust-point | duchess satin, mikado, stretch crepe, lace over lining (5-10 oz). Underlining: silk organza | bust +1.5-2.5", waist +0.5-1" (boned = 0"), hip +2-3" | **princess seam through bust apex** (starts at armhole 1/3 from shoulder, curves through apex to hem). Boning at every princess + side + CB (6-8 bones). Spiral steel for curves, flat for straight. Cocktail length = 1-2" above to 3" below knee | SA 5/8", hem 2" hand-stitched, CB zip 20-22" + hook/eye, boning 1/4" spiral in 1/2" channels |
| Bridesmaid dress (W) | Tailored | $19 | Advanced | MULTI-STYLE: bodice option A (sweetheart), B (V-neck), C (strapless), shared back bodice x2, skirt front, skirt back, full lining, strap variations, optional sash | bust, waist, hip, shoulder, neck, nape-to-waist, waist-to-floor, underbust | chiffon (lined), georgette, crepe, satin, tulle overlay (3-8 oz) | bust +2-3", waist +1-1.5", hip +2-3" | all bodice options share same side seams, waistline, CB. Interchangeable. Floor length = 0.5-1" from floor barefoot. Sash 2-3" x waist + 40-60" for bow. Min 4 bones for strapless (princess + side seams) | SA 5/8", hem 2" hand-stitched, CB zip 22-24", lining REQUIRED, Pantone color matching |
| Evening gown (W) | Tailored | $19 | Advanced | front bodice x2 (princess), side panels x2, back bodice x2, skirt panels (multi), full lining, boning channels x8-16, optional train, optional tulle underskirt | bust, underbust, waist, hip, shoulder, neck, nape-to-waist, waist-to-floor, back width, bust-to-bust, shoulder-to-bust-point | silk satin, duchess satin, mikado, French lace, velvet, brocade (6-14 oz). Inner: coutil. Lining: habotai | bust +1-2", waist 0-1" (boned), hip varies by style | **ball gown: full circle or 1.5 circle skirt. r = W/6.28**. Train: sweep 6-12", court 12-24", chapel 36-48", cathedral 72-108". Min 8 bones, max 14-16. Bustle: 3-point (ribbon loops + buttons). Mermaid: fitted to knee, godets below. Horsehair braid 1-4" at hem | SA 5/8", hem 2-3" hand-stitched, silk thread for hand finish, horsehair braid, CB zip 22-24" or lace-up with grommets |

##### Novelty / Seasonal / Niche

| Garment | Tier | Price | Difficulty | Pieces | Measurements | Fabric | Ease | Key Math | Standards |
|---|---|---|---|---|---|---|---|---|---|
| Onesie / union suit (unisex) | Core | $14 | Intermediate | front bodice-leg (or 2 for CF zip), back bodice-leg, sleeve x2, hood or neckband, optional foot panels | chest, shoulder, neck, bicep, sleeve length, torso length, waist, hip, rise, inseam, full body length | fleece (8-12 oz), french terry, waffle knit. Must stretch | relaxed +6-8" chest, +4-6" hip | **combines upper + lower blocks**. Critical: torsoLength + rise + inseam = full body length. CF zip 24-36" (neck to waist or crotch). Crotch reinforced with bar tack. Hood: same as hoodie | SA 1/2", separating zip, rib cuffs at wrists/ankles 3" at 85% |
| Infinity / multi-way dress (W) | Core | $14 | Intermediate | body tube (skirt), attached long straps x2, optional bandeau top | bust, waist, hip, desired length | stretch knit: ITY jersey, cotton/spandex, modal (5-7 oz). Must stretch + recover | NEGATIVE at bust/waist. Skirt +2-4" | tube skirt + 2 very long straps (60-80" each) attached at waist. Straps wrap, twist, tie in 15+ configurations. Strap width 4-8". Key: high-recovery fabric so straps don't stretch out | SA 3/8", all seams serged, no closures |
| Reversible jacket (unisex) | Tailored | $19 | Intermediate | SIDE A: front x2, back, sleeve x2. SIDE B: identical cut (IS the lining). Binding or bagged construction | chest, shoulder, neck, sleeve length, torso length | both sides "right side" quality. Cotton twill + print, canvas + flannel, or double-face wool | +5-6" chest (double-layer bulk) | **bagged: Side B cut 1/8-1/4" larger (turn of cloth)**. All construction hidden. Reversible snaps (cap both sides) or toggle/loop closures. Buttonholes DON'T work (inside-out on one side) | SA 5/8" bagged / 1/4" binding method, reversible snaps or magnetic snaps, edge topstitch 1/4" |
| Dog coat / jacket | Quick | $5 | Beginner | chest panel, back panel, belly strap, optional hood | dog chest, dog neck-to-tail, dog neck | fleece, quilted fabric, water-resistant nylon (6-10 oz) | +2-3" (movement over fur) | custom to pet measurements (not human body). Belly strap with velcro. Back panel = neck-to-tail length. Chest panel wraps under. Leg openings sized to dog's legs | SA 3/8-1/2", velcro closure at belly and neck |
| Christmas stocking | Quick | $5 | Beginner | front panel, back panel, cuff, hanging loop | N/A (custom size: mini to jumbo) | cotton, felt, velvet, quilted (4-10 oz) | N/A | stocking shape: outline at desired height (6-24"). Cuff 4-6" tall at top. Hanging loop at CB. Lining optional | SA 1/2", topstitch or turn-and-stitch, lined for structure |
| Advent calendar | Quick | $5 | Beginner | backing panel (24-pocket wall hanging), 24 pocket pieces, hanging channel | N/A (custom to wall space) | cotton, felt (pockets), dowel for hanging | N/A | backing ~24x36". Pockets 3x3" to 4x4" arranged in grid. Numbered 1-24. Dowel channel at top | SA 1/4" on pockets, hem 1" on backing |
| Halloween costume base | Core | $14 | Varies | varies by design - basic top + bottom OR jumpsuit base | standard body measurements | varies: stretch knit, felt, broadcloth | varies | modular base pattern that can be customized. Target October launch | varies. Seasonal spike |
| Holiday party dress | Tailored | $19 | Intermediate | fitted bodice + full skirt (fit-and-flare base) | standard dress measurements | occasion fabrics: velvet, brocade, taffeta, sequin | fitted bodice, full skirt | target November launch. Uses fit-and-flare or cocktail dress base | varies. Seasonal spike |
| Plush toy (octopus) | Quick | $5 | Beginner | body sphere panels (6-8), tentacles x8, stuffing opening | N/A (standard sizing) | minky, fleece, felt (6-10 oz). Polyester fiberfill stuffing | N/A | sphere: panels like a baseball (curved pieces that form a ball). Tentacles: tubes or flat tapered pieces. Social media magnet. FreeSewing: octoplushy | SA 1/4", ladder-stitch closing, safety eyes for children |
| Tie (necktie) | Core | $14 | Intermediate | main blade, tail, interlining (wool or fleece), tipping (triangle at each end) | neck circumference (for length adjustment) | silk, wool, cotton, linen (3-5 oz). CUT ON BIAS (45 deg) | N/A | **bias-cut for drape**. Main blade 3.25-3.5" wide, total length 57-60". Interlining: wool interfacing. Slip-stitch lining by hand. Keeper loop at back. FreeSewing: trayvon | SA 5/8" (folded under, hand-stitched). All hand-finished: slip stitch lining, bar tack keeper |
| Face mask | Free | $0 | Beginner | outer panel x2, lining panel x2, nose wire, elastic ear loops | nose-to-chin, ear-to-ear (across face) | cotton woven (quilting weight). Lining: cotton. Nose wire: aluminum strip 4" | snug to face with elastic tension | contoured: 2 shaped panels sewn at center (concave curve at nose). Filter pocket between layers. Elastic at 70-75% of ear-loop measurement. FreeSewing: florence | SA 3/8", elastic 1/4" or 1/8", nose wire in channel |
| Flower girl dress | Tailored | $19 | Intermediate | front bodice, back bodice, full skirt (gathered or circle), sash, optional tulle overlay | chest, waist, shoulder, desired length, height | cotton, satin, tulle, organza (3-6 oz) | +2" chest, +1" waist | children's bodice block + gathered or circle skirt. Sash at waist. Tulle overlay: 2-3 layers. Button/zip at CB. Petticoat for volume | SA 1/2", hem 1", CB button or zip, tulle raw-edge (doesn't fray) |
| Egg gathering apron | Quick | $5 | Beginner | front panel with 8-12 deep pockets, ties at waist | N/A (one-size or custom waist) | cotton, canvas, denim (5-8 oz) | N/A | front panel ~18x20" with 8-12 pocketed pouches (each ~4x4" opening). Ties at waist. Homesteading/cottagecore niche | SA 5/8", pockets reinforced at openings |
| Skort | Core | $14 | Intermediate | front skirt overlay, back shorts panels x2, waistband | waist, hip, rise, desired length | cotton twill, performance knit, linen (5-8 oz) | waist +1", hip +2-3" | skirt front panel overlaps shorts back. Biarritz skort is an indie bestseller. Athletic + casual crossover | SA 5/8", elastic or zip waist |
| Quilted vest / gilet | Tailored | $19 | Intermediate | front x2, back, quilted (shell+batting), lining, stand collar or hood, zip | chest, shoulder, neck, torso length | ripstop nylon + batting (3-6 oz shell). Lining: poly taffeta | +4-6" chest | gorpcore layering trend. Same as puffer jacket minus sleeves. Armhole 1" deeper | separating zip, binding at armhole |
| "Mom & Me" curated bundles | Bundle | varies | Varies | adult + child versions of same garment, sold as bundle | adult + child measurements | matched fabric | per garment | no new engine work - uses body type selector. Bundle pricing. Social media gold | bundle discount pricing |

---

### Sewing skills / engine capabilities needed for expansion

| Skill / capability | Unlocks | Priority |
|---|---|---|
| Stretch/knit block (negative ease calculator) | Leggings, bikini, swimshirt, boxer briefs, knit dress, bodycon, bralette, sports bra, underwear, joggers | **critical** |
| Ring-sector math | Circle skirt, curved waistband (v2 plan exists) | high |
| Cup sizing math (bust - underbust system) | Bralette, sports bra, underwire bra, one-piece swimsuit | high |
| Gathering/ease distribution | Sundress, tiered dress, tiered skirt, puffy pants, peasant blouse, babydoll | high |
| Collar drafting (spread, notch lapel) | Blazer, coat, tailored shirt, peacoat | medium |
| Elastic length calculator | Pajama pants, joggers, underwear, swimwear, lounge shorts, baby onesie | high |
| Two-part sleeve (already built) | Denim jacket (done), blazer, coat, peacoat, moto jacket | done |
| Yoke split (already built) | Denim jacket (done), western shirts, flannel shirts, shackets | done |
| Shirring / smocking rows | Smocked dress, peasant blouse, off-shoulder top | medium |
| Quilting channels | Puffer jacket, puffer vest, pot holders | medium |
| Boning/channel layout | Corset, cocktail dress, evening gown, structured bodice | medium |
| Parametric object sizing (non-body) | All quick-add projects: bags, sleeves, cushions, device cases | high |
| PUL / waterproof construction (seam sealing) | Rain jacket, wet bags | low |
| Snap / magnetic closure | Adaptive clothing, baby onesies, bodysuits | medium |
| Bias grain calculation | Necktie, bias-cut skirt, slip dress | medium |
| Lining pieces (auto-generate) | Blazer, coat, lined skirt, handbag, vest, evening gown | medium |
| Cylinder geometry | Duffle bag, bucket hat | low |
| Matching set coordination | Pajama sets, lounge sets, scrub sets, bikini mix-match | medium |
| Children's measurement scaling (ASTM tables) | All kids' garments via body type selector | medium |
| Seated-body dimension adjustments | Adaptive seated-fit pants, open-back garments | low |
| Wet-stretch compensation (-5 to -10%) | All swimwear | medium |

### New measurements needed (not yet in engine)

```
// Intimates / Bra
underbust         - ribcage directly under bust
bustApex          - nipple to nipple (horizontal)
bustApexVertical  - shoulder to bust apex (vertical)
highBust          - chest above bust, under arms
bustSpan          - distance between bust points

// Swimwear / Bodysuits
torsoVertical     - shoulder over bust through crotch back to shoulder
frontWaistLength  - shoulder/neck junction over bust to waist
backWaistLength   - nape to waist at CB

// Children's
height            - total standing height (primary sizing dimension)
headCircumference - around head (for neck openings)

// Adaptive
seatToFloor       - seated: chair surface to floor
backWaistToSeat   - seated: nape to chair surface
lapWidth          - seated: hip-to-hip across lap

// Maternity
bellyCircumference - fullest part of belly
underBelly         - below belly, above pubic bone
```

### New fabric types needed

```
// Intimates
'power-mesh'           - 4-way stretch, sheer support (2-3 oz)
'duoplex'              - foam-lined, pre-formed cup fabric (4-6 oz)
'tricot'               - nylon tricot, lining for bras/underwear (1-2 oz)
'cotton-spandex-jersey' - 95/5 blend, underwear staple (5-7 oz)
'lace-stretch'         - decorative overlay, 4-way stretch (1-3 oz)
'fold-over-elastic'    - 5/8" or 3/4", leg/waist finish

// Swimwear
'swim-knit'            - nylon/spandex 80/20, chlorine resistant, UPF 50+ (5-7 oz)
'swim-lining'          - nude or matching, chlorine resistant (3-4 oz)

// Activewear
'performance-knit'     - poly/spandex 87/13, moisture-wicking (5-7 oz)
'supplex-compression'  - nylon/spandex 80/20, squat-proof (6-8 oz)

// Workwear
'polyester-poplin'     - 65/35 poly/cotton, wrinkle-resistant (4-5 oz)
```

### New notions needed

```
'bra-hook-eye'     - 2x3 or 3x3 rows
'bra-rings'        - rings and sliders (match strap width 3/8" or 1/2")
'bra-underwire'    - sized to underbust measurement
'bra-channeling'   - nylon underwire casing
'swimwear-elastic' - 3/8" chlorine-resistant clear or matching
'snap-tape'        - T3 or T5, for crotch closures
'magnetic-closures' - sew-in, various sizes, for adaptive clothing
```

---

### Build order recommendation

_Items marked ~~strikethrough~~ are already shipped and live._

**Month 1 post-launch** (beginner, fast catalog growth + gift sewing):
1. ~~Circle skirt~~ - SHIPPED
2. ~~Pencil skirt~~ - SHIPPED
3. Pajama pants - #1 gift-sewing project, elastic waist, beginner
4. Joggers - best-selling indie pattern type, tapered cuff, distinct from sweatpants
5. ~~Tank top~~ - SHIPPED
6. ~~Tote bag~~ - SHIPPED

**Month 2** (fill major category gaps + stretch block):
7. Boxer briefs - introduces stretch/knit block with negative ease
8. ~~Leggings~~ - SHIPPED
9. ~~T-shirt dress~~ - SHIPPED
10. Robe - universal gift, beginner-friendly, wrap closure
11. Bralette - exploding indie niche, cup sizing math
12. Bucket hat - quick sew accessory, trending

**Month 3** (intermediate, flagship patterns):
13. ~~Classic button-up shirt (M)~~ - SHIPPED
14. Jumpsuit (W) - top 5 indie pattern category
15. Bomber jacket - unisex, huge demand
16. ~~Sundress~~ - SHIPPED
17. Underwear/knickers - sewists make dozens, scrap-friendly

**Month 4** (advanced + children's + workwear):
18. Blazer - biggest single catalog unlock
19. Waistcoat - shares blazer block
20. Kids' leggings + kids' tee (body type selector)
21. Pajama set (top + pants, matching)
22. Scrubs (top + pants)

**Month 5+** (expand catalog breadth):
23-30. Tiered dress, shacket, puffer jacket, polo, one-piece swimsuit, cardigan, wrap skirt, shift dress

**Quick-add sprint** (can happen in parallel, 1-2 hours each):
- Laptop sleeve, book sleeve, dog bandana, zippered pouch, water bottle sling
- Bikepacking frame bag (custom to bike frame - signature parametric product)
- Bench cushion (custom dimensions)

### Research-backed marketing angles

_From 2026-03-31 market research._

**Lead messaging:**
- "Pants that actually fit YOUR body" - strongest MTM value prop across all demographics
- Men's angle: "Rise-customized pants - the measurement no other brand addresses"
- Athletic fit as explicit option - serve the fitness community directly
- "Finally, men's patterns that don't look like your dad's wardrobe" - modern styling differentiator

**Channels:**
- Target TikTok first - 3M+ sewing posts, #boyswhosew 53.4M views, sewing videos getting 11M+ views
- Free pattern as acquisition funnel (every major indie brand does this - Mood has 490+ free patterns)
- Seed 50-100 free downloads to sewists with 5k-50k followers

**Differentiators to emphasize:**
- Gender-inclusive sizing (measurements, not gendered size charts)
- Plus-size support above XXL/46" chest - the entire men's market ignores this
- Short/tall proportional adjustment - not just length changes, full proportional redesign
- Sustainability angle: make what you need, not fast fashion

**Underserved segments to target:**
- Athletic/muscular builds (95% of off-the-rack doesn't fit)
- Short men under 5'8" (~30% of US men, essentially ignored)
- Plus-size men above XXL (34% of men, 12% of market)
- Gen Z men wanting unique/OOAK garments

**Competitive positioning:**
- Top indie brands Gen Z follows: Friday Pattern Company, Closet Core, Megan Nielsen, Helen's Closet, Papercut Patterns, Merchant & Mills - all use standard sizing
- Big 4 (Simplicity, McCall's, Butterick, Vogue) are slow to adapt to trend cycles
- No MTM brand combines modern/trending styling with true custom-fit - we own this gap

### MYOG Push (Month 2-3)
- [ ] Tote, crossbody - list on r/myog immediately
- [ ] Bikepacking frame bag - custom to exact bike triangle (killer product)
- [ ] Duffle, daypack - post after bag modules proven
- [ ] Technical backpack - long-term, high complexity

### Seasonal
- [ ] Halloween costume base - target October launch
- [ ] Holiday party dress - target November
- [ ] Swimwear (bikini, rash guard, one-piece) - target June
- [ ] Christmas stocking - target October
- [ ] Kids' pajamas - target November (holiday pajama tradition)

### Strategic notes

1. **Sleepwear/loungewear is the #1 gift-sewing category** - currently zero coverage, pajama pants + robe are highest-impact adds
2. **Matching sets** (pajama set, lounge set, scrub set) are a major 2025-2026 trend
3. **Children's patterns drive repeat purchases** - kids outgrow clothes, parents re-buy
4. **Made-to-measure adds the most value for fitted garments** - blazer, dress shirt, tailored trousers, cocktail dress benefit most from custom sizing
5. **Parametric object-dimension projects** (bags, device sleeves, cushions) are a unique competitive advantage no Etsy PDF seller can match - user enters laptop dimensions, pattern auto-generates
6. **Bikepacking frame bag** is a signature product - user enters 3 frame triangle measurements, pattern auto-generates. High price tolerance in MYOG community
7. **Adaptive clothing is an underserved market** with almost zero indie pattern competition
8. **Scrubs post-COVID demand** is enormous and sustained - professionals sew custom scrubs constantly
9. **Bralettes and underwear have very high repeat purchase rates** - sewists make dozens
10. **"Shacket" is THE trending garment 2024-2026** - heavy flannel/shirt jacket, easy to build from existing shirt block
11. **CPSC compliance is mandatory** for children's sleepwear (16 CFR 1615/1616) - snug-fit or flame-resistant fabric
12. **Negative ease is the single biggest engine capability gap** - blocks all stretch/knit garments, swimwear, intimates, activewear

---

### Quick-add projects (high volume, low complexity)
These take 1-2 hours to build, generate high social engagement,
and serve as gateway projects for new sewists. No body measurements
needed - just dimensions. **Parametric sizing is the key competitive advantage.**

#### Bags & Totes (parametric - user enters object dimensions)

| Project | Tier | Price | Difficulty | Build time | Input dimensions | Pieces | Notes |
|---|---|---|---|---|---|---|---|
| Zippered pouch (3 sizes) | Quick | $5 | beginner | 1 hr | desired width x height | 2 panels, 2 lining, 1 zipper | #1 most-sewn project. Lining, zipper, boxed corners |
| Tote bag | Quick | $5 | beginner | 1 hr | desired height x width x depth | 2 panels, 2 handles, optional pocket | MYOG gateway. Huge Etsy demand |
| Crossbody bag | Quick | $5 | beginner | 1.5 hr | desired width x height, strap length | 2 panels, flap, strap, lining | adjustable strap, zipper or magnetic snap |
| Laptop sleeve | Quick | $5 | beginner | 1 hr | exact device dimensions (dropdown: model) | 2 panels, padding, optional closure | PRIME parametric product. Auto-size from device model |
| Book sleeve / Kindle sleeve | Quick | $5 | beginner | 45 min | device dimensions | 2 panels, padding, optional bow | TikTok viral (BookTok). Bow version sells out everywhere |
| Phone crossbody pouch | Quick | $5 | beginner | 1 hr | phone model (dropdown) | front, back, card pocket, strap | daily use item. Card slots. Custom to exact phone |
| Fanny pack / belt bag | Quick | $5 | beginner | 1.5 hr | desired width, waist | front, back, gusset, strap, zipper | major fashion comeback. Adjustable strap. Trail version in technical fabric |
| Water bottle sling | Quick | $5 | beginner | 30 min | bottle diameter (Yeti, Hydro Flask, Nalgene dropdown) | tube, base circle, strap | "insanely popular." Custom to bottle diameter. 15-min sew |
| Wine bottle tote | Quick | $5 | beginner | 30 min | standard or magnum | 2 panels, handles | reversible. The bag IS the gift wrap |
| Insulated lunch bag | Quick | $5 | beginner | 1.5 hr | container dimensions | panels, insulated batting, zipper, handles | custom to bento box or specific container |
| Market / grocery bag | Quick | $5 | beginner | 45 min | desired size | 2 panels, handles | reusable/eco angle. One-yard pattern |
| Bucket bag | Quick | $5 | beginner | 1.5 hr | desired height x diameter | side panel, base circle, drawstring or zip | trending silhouette. Slouchy |
| Yoga mat bag | Quick | $5 | beginner | 1 hr | mat diameter, mat length | tube, base, drawstring or zip, strap | custom to mat size |
| Wet bag (waterproof) | Quick | $5 | beginner | 1 hr | desired size (S/M/L) | 2 PUL panels, zipper | swimsuits, diapers, gym clothes. PUL fabric |
| Cosmetic pouch (boxy) | Quick | $5 | beginner | 45 min | desired width x height x depth | 2 panels, 2 gussets, zipper, lining | boxy bottom design. Scrap-friendly |
| Dopp kit / toiletry bag | Quick | $5 | beginner | 1.5 hr | desired width x height | panels, vinyl lining, zipper | hanging or flat. Great men's gift |
| Jewelry roll | Quick | $5 | beginner | 1.5 hr | N/A (standard) | padded panels, ring holder strip, earring felt page, tie | padded, rolled design. Travel gift |
| Project bag (knitting) | Quick | $5 | beginner | 1 hr | desired size | panels, drawstring or zip, pockets | fiber arts market. Drawstring or zippered |
| Messenger bag | Simple | $9 | intermediate | 2 hr | laptop/tablet size | front, back, gusset, flap, strap, buckle, laptop sleeve | flap with buckle. Custom to device |
| Duffle bag | Simple | $9 | intermediate | 2 hr | desired length x diameter | 2 end circles, body rectangle, handles, zipper | cylinder geometry. Handles, zipper |
| Handbag | Simple | $9 | intermediate | 2 hr | desired width x height x depth | front, back, gussets, handles, lining, closure | structured sides. FreeSewing: hortensia |
| Daypack / backpack | Simple | $9 | advanced | 3 hr | torso length, desired volume | front, back, side panels, top, straps, padding | structured panels, straps, padding. MYOG staple |
| Diaper bag | Simple | $9 | intermediate | 2 hr | N/A (standard) | panels, pockets (many), changing pad, straps | structured. Huge gifting market |

#### MYOG / Outdoor Gear (high-value niche, parametric)

| Project | Tier | Price | Difficulty | Build time | Input dimensions | Notes |
|---|---|---|---|---|---|---|
| Stuff sack | Quick | $5 | beginner | 30 min | desired diameter x height | THE starter MYOG project. Drawstring, ripstop nylon |
| Bikepacking frame bag | Simple | $9 | intermediate | 2 hr | **3 frame triangle measurements** | CUSTOM to exact bike frame. THE signature parametric product. No competition in auto-generated patterns. High price tolerance |
| Bikepacking handlebar bag | Quick | $5 | beginner | 1.5 hr | handlebar width | barrel/burrito roll. Ripstop nylon |
| Bikepacking top tube bag | Quick | $5 | beginner | 1 hr | tube length | custom to tube. Velcro attach. Snack access |
| Bikepacking stem bag | Quick | $5 | beginner | 45 min | stem dimensions | small, velcro-attached |
| Hammock | Quick | $5 | beginner | 1.5 hr | desired length | custom length. Ripstop nylon. Whipped ends |
| Tarp / rain shelter | Quick | $5 | beginner | 1 hr | desired width x length | rectangle + tie-outs. Silnylon or Tyvek |
| Sleeping bag liner | Quick | $5 | beginner | 1 hr | desired length | custom length. Silk or cotton. Rectangle with zipper |
| Ground cloth / footprint | Quick | $5 | beginner | 30 min | tent dimensions | custom to tent. Tyvek or silnylon |
| Packing cubes | Quick | $5 | beginner | 1 hr | suitcase compartment dimensions | custom S/M/L. Mesh window. Ripstop |
| Ultralight daypack | Simple | $9 | intermediate | 2.5 hr | torso length | custom. Rolltop closure. Technical fabrics |

#### Home Decor (custom dimensions = key selling point)

| Project | Tier | Price | Difficulty | Build time | Input dimensions | Notes |
|---|---|---|---|---|---|---|
| Pillowcase / envelope pillow | Quick | $5 | trivial | 30 min | pillow insert size | any size insert. Envelope back (no zip). Seasonal swaps |
| Bench / window seat cushion | Quick | $5 | beginner | 1.5 hr | **exact bench length x width x depth** | PRIME custom-dimension product. Box style with piping. Nothing standard fits |
| Chair seat pad | Quick | $5 | beginner | 1 hr | chair seat dimensions | ties for attachment. Dining, patio, office |
| Curtain panels | Quick | $5 | beginner | 1 hr | window width x desired length | rod pocket, tab top, or grommet. Straight seams only |
| Table runner | Quick | $5 | beginner | 30 min | table length | seasonal fabrics. 10-min pattern |
| Placemats | Quick | $5 | beginner | 30 min | table setting size | reversible. Quilted or simple. Set of 4-6 |
| Fabric storage bin | Quick | $5 | beginner | 1 hr | **shelf dimensions (IKEA Kallax = #1 use case)** | custom to shelf. Fold-flat |
| Hanging wall organizer | Quick | $5 | beginner | 1.5 hr | wall space | nursery, bathroom, craft room |
| Kitchen appliance cover | Quick | $5 | beginner | 1 hr | **exact mixer/toaster/Instant Pot dimensions** | custom to appliance. Quilted. Nothing standard fits |
| Draft stopper / door snake | Quick | $5 | beginner | 30 min | door width | custom width. Weighted fill. Fall/winter seasonal |
| Outdoor cushion cover | Quick | $5 | beginner | 1.5 hr | furniture dimensions | weather-resistant fabric option |
| Cloth napkins | Quick | $5 | beginner | 30 min | desired size | mitered corners. Eco-friendly angle. Set pricing |

#### Kitchen

| Project | Tier | Price | Difficulty | Build time | Input dimensions | Notes |
|---|---|---|---|---|---|---|
| Bowl cozy (microwave) | Quick | $5 | beginner | 30 min | bowl diameter | reversible. Holds hot/cold bowls. Craft fair top seller |
| Mug rug | Free | $0 | beginner | 20 min | N/A (standard ~5x7") | mini placemat for mug + snack. Perfect scrap project. Lead magnet |
| Pot holders / hot pads | Quick | $5 | beginner | 30 min | N/A (standard 8x8") | insulated batting. Quick gifts. Hexagon/heart shapes trending |
| Oven mitts | Quick | $5 | beginner | 45 min | hand size (optional custom) | quilted, insulated batting |
| Hanging kitchen towel | Quick | $5 | beginner | 15 min | N/A | snaps/ties over oven handle. Stays put |
| Pan protectors | Free | $0 | beginner | 15 min | pan diameter | stackable circles. Prevents scratches. Lead magnet |
| Casserole carrier | Quick | $5 | beginner | 1 hr | dish dimensions (9x13, round, etc.) | insulated. Potluck essential. Hostess gift |
| Produce bags (reusable) | Quick | $5 | beginner | 30 min | desired sizes (S/M/L) | mesh or muslin. Eco-friendly |

#### Baby & Kids Gifts

| Project | Tier | Price | Difficulty | Build time | Notes |
|---|---|---|---|---|---|
| Burp cloths | Quick | $5 | beginner | 15 min each | flannel + terry. Baby shower staple. Batch-sewable |
| Baby bib (bandana) | Quick | $5 | beginner | 30 min | adjustable snaps. 3 sizes. Adorable fabrics |
| Receiving blanket | Quick | $5 | beginner | 30 min | self-binding. Flannel or muslin |
| Diaper clutch / changing pad | Quick | $5 | beginner | 1 hr | folds flat. Vinyl-lined. Top shower gift |
| Baby toy (crinkle/taggie) | Quick | $5 | beginner | 15 min | sensory fabrics. Scrap project |
| Pacifier clip strap | Free | $0 | beginner | 10 min | ribbon + snap. 10-min project. Lead magnet |
| Stuffed animal (simple) | Quick | $5 | beginner | 1.5 hr | turtle, bunny. Polyester fill |
| Car seat canopy | Quick | $5 | beginner | 1 hr | seasonal (warm/cool) |

#### Pet Products (booming market)

| Project | Tier | Price | Difficulty | Build time | Input dimensions | Notes |
|---|---|---|---|---|---|---|
| Dog bandana (over-collar) | Free | $0 | trivial | 15 min | collar width (S/M/L/XL) | #1 pet sewing project. Massive seasonal demand. Lead magnet |
| Dog bandana (tie-on) | Free | $0 | trivial | 15 min | neck size | adjustable. Even simpler. Lead magnet |
| Pet collar | Quick | $5 | beginner | 30 min | neck size | fabric + velcro + D-ring. Matching leash option |
| Pet bow tie | Free | $0 | trivial | 10 min | N/A (collar attachment) | holiday/event photos. Lead magnet |
| Dog / cat bed | Quick | $5 | beginner | 1.5 hr | pet size/weight | removable washable cover |
| Poop bag dispenser | Free | $0 | trivial | 15 min | N/A | clips to leash. Quick scrap. Lead magnet |
| Pet placemat | Quick | $5 | beginner | 20 min | bowl spacing | waterproof backing optional |

#### Wellness & Comfort Gifts

| Project | Tier | Price | Difficulty | Build time | Notes |
|---|---|---|---|---|---|
| Rice/flax heating pad | Quick | $5 | beginner | 30 min | 3 straight seams. Lavender-scented. Microwavable. 100% cotton ONLY. Craft fair best-seller |
| Neck wrap (heated/weighted) | Quick | $5 | beginner | 45 min | sectioned channels. Custom to neck/shoulder |
| Eye pillow (weighted) | Quick | $5 | beginner | 15 min | lavender + flax seed. Yoga/meditation |
| Sleep mask | Quick | $5 | beginner | 30 min | silk or satin lining. Gift set potential |

#### Travel

| Project | Tier | Price | Difficulty | Build time | Input dimensions | Notes |
|---|---|---|---|---|---|---|
| Shoe bags | Quick | $5 | beginner | 20 min each | shoe size (dropdown) | drawstring. Travel essential. Custom M/W/boots |
| Passport holder / travel wallet | Quick | $5 | beginner | 30 min | N/A (standard passport size) | fits passport + cards. Popular gift |
| Neck pillow | Quick | $5 | beginner | 30 min | N/A | airplane/road trip essential |
| Laundry bag (travel) | Quick | $5 | beginner | 20 min | desired size | drawstring. Fits in suitcase |
| Luggage tags | Quick | $5 | beginner | 15 min | N/A | clear vinyl window for ID. Travel gift |

#### Straps & Carriers

| Project | Tier | Price | Difficulty | Build time | Input dimensions | Notes |
|---|---|---|---|---|---|---|
| Camera strap | Quick | $5 | beginner | 1 hr | custom length | padded. Canvas or fabric + webbing |
| Guitar strap | Quick | $5 | beginner | 30 min | custom length | padded option. Dedicated community |
| Yoga mat strap | Quick | $5 | beginner | 20 min | mat diameter | simpler than full bag. Adjustable |

#### Seasonal & Holiday

| Project | Tier | Price | Difficulty | Build time | Notes |
|---|---|---|---|---|---|
| Reusable fabric gift bags (5 sizes) | Quick | $5 | beginner | 15 min each | replace wrapping paper. Eco angle. 3-seam construction |
| Fabric gift card holder | Free | $0 | beginner | 10 min | envelope style. Lead magnet |
| Holiday ornaments (fabric) | Quick | $5 | beginner | 30 min | gnomes, stars, Scandinavian. Felt or cotton |

#### Gaming & Hobby Niche

| Project | Tier | Price | Difficulty | Build time | Notes |
|---|---|---|---|---|---|
| D&D dice bag | Quick | $5 | beginner | 30 min | drawstring with internal mesh pockets. Nerdy prints. Dedicated community |
| Dice tray (collapsible) | Quick | $5 | beginner | 45 min | snaps flat for transport. Felt-lined |
| Craft supply organizer | Quick | $5 | beginner | 1 hr | custom pocket sizes for specific tools (brushes, hooks, pencils) |

#### Sewing Accessories (meta - sell to your own community)

| Project | Tier | Price | Difficulty | Build time | Notes |
|---|---|---|---|---|---|
| Pincushion | Quick | $5 | beginner | 20 min | multiple shapes. Wrist-worn version popular |
| Needle case / book | Quick | $5 | beginner | 30 min | felt pages. Pocket for scissors |
| Thread catcher (wrist/table) | Quick | $5 | beginner | 30 min | weighted base. Collapsible |
| Travel sewing kit | Quick | $5 | beginner | 45 min | mini roll-up. Needle case, thread, buttons, scissors pocket |
| Sewing machine cover | Quick | $5 | beginner | 1 hr | **custom to exact machine dimensions**. Quilted |

#### Garden & Outdoor

| Project | Tier | Price | Difficulty | Build time | Notes |
|---|---|---|---|---|---|
| Garden tool apron/belt | Quick | $5 | beginner | 1 hr | multi-pocket. Custom pocket sizing for specific tools |
| Garden kneeling pad | Quick | $5 | beginner | 45 min | oilcloth exterior. Towel/foam fill. Handles |

---

### Technique coverage map
Every sewing technique covered by at least one module in the catalog.
When adding a new module, check this list - if it introduces a technique
not yet covered, it has higher catalog value.

| Technique | Covered by | Status |
|---|---|---|
| Set-in sleeve | tee, camp-shirt, button-up-w, blazer | done |
| Raglan sleeve | crewneck, hoodie, raglan tee | done |
| Two-piece sleeve | denim-jacket, peacoat, moto jacket | done |
| Kimono / dolman sleeve | dolman top, kimono jacket, robe | not yet - easy add |
| Collar stand + roll | camp-shirt, button-up-w, denim-jacket, polo, flannel | done |
| Spread / notch lapel | blazer, trench, peacoat | not yet |
| Camp / convertible collar | camp-shirt, Hawaiian shirt, PJ top | done |
| Mandarin collar (stand only) | chef coat, quarter-zip | not yet |
| Hood | hoodie, rain jacket, puffer | done |
| Shawl collar | robe/dressing gown | not yet |
| Welt pocket | straight-jeans, chinos, blazer | done (jeans/chinos), blazer pending |
| Patch pocket | tee, crop-jacket, tote, shacket | done |
| Flap pocket | denim-jacket, cargo-shorts, scrubs | done |
| Slash / slant pocket | jeans, chinos, sweatpants | done |
| Zip fly | straight-jeans, chinos | done |
| Button placket | button-up-w, denim-jacket, henley | done |
| Snap placket | western shirt | not yet |
| Elastic waist | sweatpants, gym-shorts, easy-pant-w, pajama pants, joggers | done |
| Drawstring | swim-trunks, sweatpants, pajama pants | done |
| Waist darts | jeans back, trousers, pencil skirt | done |
| Bust darts | button-up-w, fitted-tee-w, shell-blouse-w | done |
| Princess seams | cocktail dress, blazer, evening gown | not yet |
| Gathers | sundress, tiered dress, babydoll, peasant blouse | not yet |
| Shirring / smocking | smocked dress | not yet |
| Pleats (box, knife) | pleated-shorts, pleated-trousers, pleated skirt | done (shorts/trousers), skirt pending |
| Yoke (horizontal) | denim-jacket, western shirt, flannel | done |
| Yoke (back V/curved, jeans) | straight-jeans, soloist-jeans | done |
| Lining (full garment) | blazer, slip-skirt-w, coat, vest, evening gown | partial (slip skirt) |
| Bias cut | bias-cut skirt, slip dress, necktie | not yet |
| Knit / stretch construction | tee, leggings, boxers, bralette, bodycon | partial (tee), full with leggings |
| Negative ease / compression | leggings, bodycon, bike shorts, sports bra, swimwear | not yet - needs stretch block |
| Flat-felled seam | straight-jeans, denim-jacket, flannel | done |
| French seam | shell-blouse-w, slip-skirt-w, PJ pants | done |
| Cylinder construction | duffle bag | not yet |
| Webbing / strap | tote, crossbody, daypack, camera strap | not yet |
| Invisible zipper | a-line-skirt-w, slip-skirt-w | done |
| Exposed / sport zipper | hoodie, bomber, puffer, daypack | done (hoodie) |
| Separating zipper | bomber, puffer, rain jacket | not yet |
| Boning / structure | corset, cocktail dress, evening gown | not yet |
| Bias binding / tape | apron, tank top, cape | not yet |
| Rolled hem | nightgown, slip dress | not yet - easy add |
| Elastic casing (channel) | pajama pants, joggers, robe, lounge shorts | not yet |
| Tie / sash closure | robe, wrap skirt, wrap top | not yet |
| Cup construction | bralette, sports bra, bikini top | not yet |
| Knit binding / band | joggers, henley, turtleneck, cardigan | not yet |
| Snap closure | baby onesie, bodysuit, western shirt, adaptive | not yet |
| Quilting | puffer jacket, puffer vest, pot holders | not yet |
| Magnetic closure | adaptive clothing | not yet |
| FOE (fold-over elastic) | underwear, bralette, swimwear | not yet |
| Seam sealing (waterproof) | rain jacket, wet bag | not yet |
| Parametric object sizing | all quick-add projects (bags, cushions, sleeves) | not yet |

---

### Style variants plan - one base module, many catalog cards

PR #120 introduced a `variants` array on garment exports. Each variant gets
its own catalog listing, URL, pricing entry, and pre-filled defaults while
sharing the same `pieces()`, `construction()`, and engine math. The variant
expansion in `index.js` creates standalone registry entries so downstream
code (routing, checkout, DB, analytics) treats variant IDs as regular garments.

**How it works:**
```js
variants: [
  {
    id: 'linen-shirt',           // becomes its own garment ID
    name: 'Linen Shirt',         // catalog card title
    defaults: { fit: 'relaxed', pocket: 'none' },  // pre-selected options
    fabrics: ['linen', 'linen-light'],              // materials override
  },
]
```

**Why this matters for catalog growth:**
- One base module can power 2-5 catalog cards without duplicating code
- Each card feels like a distinct product to the customer
- Reduces engineering cost per "new pattern" by 70-80%
- A/B testable: which variant names/defaults convert better?
- Supports the "1 pattern per week" post-launch cadence

**Principles:**
1. Variants should feel like genuinely different garments, not just color swaps
2. Each variant changes at least 2-3 options (fit, pockets, fabric, length, etc.)
3. Variant names use approachable style language, not technical terms
4. Base module remains accessible for users who want full control
5. Variants can have unique construction notes (e.g., linen-specific pre-wash)

---

#### Existing garments - variant opportunities

| Base module | Variant name | Key defaults | Fabrics | Notes |
|---|---|---|---|---|
| **tee** | Classic Crew Tee | crew neck, short sleeve, standard fit | cotton jersey | the default |
| | Oversized Tee | crew neck, short sleeve, oversized +10" | heavyweight jersey | streetwear/trend |
| | Muscle Tee | crew neck, no sleeve (cut off), relaxed | slub jersey | gym/casual |
| | Longline Tee | crew neck, short sleeve, extended length +4" | drapey jersey | streetwear layering |
| **camp-shirt** | Camp Collar Shirt | camp collar, short sleeve, relaxed | rayon, viscose | the default |
| | Vacation Shirt | camp collar, short sleeve, relaxed, pocket | rayon print | Hawaiian-style rename |
| **button-up** | Linen Shirt | point collar, relaxed, no pocket | linen | **already in PR #120** |
| | Chambray Work Shirt | point collar, standard, dual pockets | chambray, twill | **already in PR #120** |
| | Band Collar Shirt | band/mandarin, standard, no pocket | cotton poplin | minimalist, Nehru-style |
| | Oxford Shirt | point collar, standard, single pocket | oxford cloth | preppy classic |
| **button-up-w** | Poplin Blouse | point collar, fitted, single pocket | cotton poplin | office staple |
| | Linen Tunic | band collar, relaxed, tunic length | linen | summer layering |
| **fitted-tee-w** | Basic Fitted Tee | crew, short sleeve, standard | cotton jersey | the default |
| | Scoop Neck Tee | scoop, short sleeve, standard | modal jersey | everyday casual |
| | Long Sleeve Fitted Tee | crew, long sleeve, standard | cotton/spandex | layering staple |
| **shell-blouse-w** | Silk Shell | crew, sleeveless, fitted | silk, crepe | office under-blazer |
| | Woven Tank | scoop, sleeveless, relaxed | linen, voile | summer casual |
| **hoodie** | Classic Hoodie | pullover, kangaroo pocket, standard | french terry | the default |
| | Zip-Up Hoodie | full zip, split pockets, standard | french terry | everyday jacket |
| | Cropped Hoodie | pullover, kangaroo pocket, cropped length | fleece | trend/athleisure |
| **crewneck** | Crewneck Sweatshirt | crew, standard fit | french terry | the default |
| | Raglan Sweatshirt | raglan sleeve, relaxed | french terry | retro/sporty feel |
| **sweatpants** | Classic Sweatpants | straight leg, elastic cuff | fleece | the default |
| | Tapered Joggers | tapered, rib cuff, slim | french terry | athleisure (can replace separate jogger module) |
| **straight-jeans** | Classic Straight Jeans | mid-rise, straight, 5-pocket | denim 12 oz | the default |
| | Slim Jeans | mid-rise, slim taper, 5-pocket | stretch denim | modern slim fit |
| | High-Rise Jeans | high-rise, straight, 5-pocket | rigid denim | vintage/mom jeans |
| **chinos** | Classic Chinos | mid-rise, straight, slant pockets | cotton twill | the default |
| | Slim Chinos | mid-rise, slim taper, slant pockets | stretch twill | modern slim |
| **cargo-shorts** | Cargo Shorts | standard, cargo pockets | cotton twill | the default |
| | Hiking Shorts ✅ | drawstring, cargo pockets, ripstop | ripstop nylon | MYOG/outdoor crossover — gusset deferred (engine) |
| **gym-shorts** | Gym Shorts | elastic, lined, 5" inseam | performance knit | the default |
| | Running Shorts ✅ | elastic, brief liner, 2″ side split | performance knit | athletic — sideSplit option added |
| | Basketball Shorts ✅ | elastic, 1″ side split, 9" inseam | performance mesh | sport-specific |
| **swim-trunks** | Board Shorts | elastic, 7" inseam | board short fabric | surf style |
| | Swim Trunks | elastic, mesh lined, 5" inseam | swim fabric | classic |
| | Retro Short Trunks ✅ | 3″ inseam, brief liner, 1″ side slit, slim | nylon/spandex, nylon taslan | 70s/80s retro revival |
| **crop-jacket** | Detroit Jacket ✅ | zipper, lined, welt pockets, cuff tab | cotton canvas / duck | full Carhartt-style conversion 2026-04-14 |
| | Cropped Jacket | standard, zip front | cotton twill | the default |
| | Trucker Crop | button front, chest pockets | denim | denim crop |
| **denim-jacket** | Denim Trucker Jacket | standard, button, chest pockets | denim 12 oz | the default |
| | Lightweight Denim Jacket | standard, button, no lining | denim 8 oz | summer weight |
| **wide-leg-trouser-w** | Wide-Leg Trousers | high-rise, wide, invisible zip | crepe, wool | the default |
| | Linen Wide-Legs | high-rise, wide, relaxed | linen | summer staple |
| **straight-trouser-w** | Straight Trouser | mid-rise, straight, invisible zip | wool blend | office default |
| | Cigarette Pants | high-rise, slim taper, cropped | stretch gabardine | can replace separate module |
| **easy-pant-w** | Easy Pant | elastic, straight, relaxed | linen, rayon | the default |
| | Lounge Pant | elastic, wide, very relaxed | modal jersey | home/lounge |
| **a-line-skirt-w** | A-Line Skirt | standard, invisible zip, knee | cotton, linen | the default |
| | Denim A-Line | standard, topstitched, knee | denim | casual/workwear |
| **slip-skirt-w** | Slip Skirt | bias-cut, invisible zip, midi | satin, crepe | the default |
| | Satin Midi Skirt | bias-cut, invisible zip, midi | silk satin | elevated/occasion |
| **shirt-dress-w** | Shirt Dress | button front, collar, belted | cotton poplin | the default |
| | Linen Shirt Dress | button front, band collar, relaxed | linen | summer version |
| **wrap-dress-w** | Wrap Dress | true wrap, V-neck, knee | jersey, crepe | the default |
| | Maxi Wrap Dress | true wrap, V-neck, floor-length | rayon | summer/resort |

#### New garments - variant plan

Each new base module below should ship with 2-3 variants from day one.
Variants are listed in recommended build order (highest-value first).

| Base module | Variants (each = separate catalog card) | Variant defaults summary |
|---|---|---|
| **circle-skirt** | Circle Skirt (full, knee), Mini Circle Skirt (full, short), Midi Circle Skirt (half-circle, mid-calf) | circle fraction + length combos |
| **pencil-skirt** | Pencil Skirt (classic knee), Long Pencil Skirt (midi), Denim Pencil Skirt (denim, topstitched) | length + fabric |
| **pajama-pants** | Flannel PJ Pants (flannel, straight), Satin Sleep Pants (satin, straight), Lounge Pants (jersey, tapered) | fabric + leg shape |
| **joggers** | French Terry Joggers (standard, cuffed), Performance Joggers (athletic, tapered), Fleece Joggers (heavyweight, relaxed) | fabric + fit |
| **tank-top** | Classic Tank (crew binding, standard), Racerback Tank (racerback cut), Cropped Tank (shortened, wide straps) | neckline + length |
| **leggings** | Full-Length Leggings (ankle), Capri Leggings (mid-calf), Bike Shorts (mid-thigh) | length only - same module |
| **tee-dress-w** | T-Shirt Dress (knee, short sleeve), Maxi T-Shirt Dress (floor, short sleeve), Long-Sleeve Dress (knee, long sleeve) | length + sleeve |
| **shift-dress-w** | Shift Dress (sleeveless, knee), Linen Shift (sleeveless, relaxed, linen), Shift Tunic (sleeved, hip-length) | sleeve + length + fabric |
| **sundress-w** | Sundress (gathered, straps, knee), Maxi Sundress (gathered, straps, floor), Tiered Sundress (3 tiers, straps) | skirt treatment + length |
| **robe** | Fleece Robe (floor, fleece, shawl collar), Cotton Robe (knee, cotton, kimono), Silk Dressing Gown (floor, silk, shawl) | fabric + length + collar |
| **bralette-w** | Triangle Bralette (triangle cups, lace), Scoop Bralette (scooped, jersey), Longline Bralette (extended band, mesh) | cup shape + fabric + band |
| **underwear-w** | Bikini Briefs (low-rise), High-Waist Briefs (full coverage), Boyshorts (mid-thigh coverage) | rise + coverage |
| **boxer-briefs** | Classic Boxer Briefs (mid-thigh), Trunks (shorter leg), Long Boxer Briefs (above-knee) | inseam length |
| **bomber-jacket** | Satin Bomber (satin, quilted lining), Cotton Bomber (twill, unlined), Varsity Bomber (wool body, contrast sleeves) | fabric + lining |
| **cardigan** | Classic Cardigan (V-neck, buttons), Open Cardigan (no closure, relaxed), Cropped Cardigan (shortened, buttons) | closure + length |
| **wrap-top-w** | Wrap Blouse (woven, 3/4 sleeve), Wrap Tee (jersey, short sleeve), Cache-Coeur Top (woven, puff sleeve) | fabric + sleeve |
| **jumpsuit-w** | Wide-Leg Jumpsuit (woven, wide, belted), Utility Jumpsuit (twill, pockets, zip), Lounge Jumpsuit (jersey, relaxed) | fabric + fit + closure |
| **overalls** | Denim Overalls (denim, buckle, 5-pocket), Linen Overalls (linen, button straps, relaxed), Short Overalls (denim, shorts) | fabric + strap + length |
| **scrubs** | Classic Scrubs (V-neck, straight leg), Modern Scrubs (jogger leg, zip pocket), Slim Scrubs (tapered, fitted) | leg shape + pocket style |
| **puffer-jacket** | Quilted Puffer (horizontal channels), Diamond Puffer (diagonal channels), Puffer Vest (sleeveless) | quilting pattern + sleeves |
| **shacket** | Flannel Shacket (plaid flannel, relaxed), Corduroy Shacket (cord, standard), Wool Shacket (wool blend, structured) | fabric |
| **polo** | Classic Polo (pique, standard), Performance Polo (athletic, moisture-wick), Oversized Polo (relaxed, rugby-weight) | fabric + fit |
| **pajama-set** | Flannel PJ Set (flannel, piped), Cotton PJ Set (broadcloth, classic), Satin PJ Set (satin, luxe) | fabric + trim |
| **swimsuit-w** | One-Piece Swimsuit (scoop, full), High-Cut Swimsuit (high leg, scoop), Square-Neck Swimsuit (square neck, full) | neckline + leg cut |
| **bikini-w** | Triangle Bikini (triangle top, classic bottom), High-Waist Bikini (bralette top, high-waist bottom), Sporty Bikini (racerback, boyshort) | top shape + bottom style |

#### Catalog card count projection

| Phase | Base modules | Avg variants | Catalog cards | Notes |
|---|---|---|---|---|
| Current (pre-variants) | 24 | 1 | 24 | no variants yet |
| After PR #120 | 25 | 1.1 | 27 | button-up + 2 variants |
| After existing garment variants | 24 | 2.5 | ~60 | variants on existing modules, no new code |
| Month 1 new modules + variants | 30 | 2.5 | ~75 | 6 new base modules x ~3 variants each |
| Month 3 | 40 | 2.5 | ~100 | 100-card catalog milestone |
| Month 6 | 55 | 3.0 | ~165 | broad coverage across all categories |
| Year 1 | 70+ | 3.0 | ~210+ | competitive with major indie pattern companies |

**The variant system is the single biggest catalog growth multiplier.** Adding variants
to existing modules is the fastest path to a 60+ card catalog with zero new engine work.

#### Implementation priority

**Phase A - Variant-ize existing modules (no new code, massive catalog growth):**
- [ ] tee: Classic Crew, Oversized, Muscle Tee, Longline (4 cards from 1)
- [ ] hoodie: Classic, Zip-Up, Cropped (3 cards)
- [ ] straight-jeans: Classic, Slim, High-Rise (3 cards)
- [ ] chinos: Classic, Slim (2 cards)
- [x] gym-shorts: Gym, Running, Basketball (3 cards) — Running + Basketball variants updated with sideSplit defaults 2026-04-13
- [ ] fitted-tee-w: Basic, Scoop, Long-Sleeve (3 cards)
- [ ] wrap-dress-w: Wrap Dress, Maxi Wrap (2 cards)
- [ ] shirt-dress-w: Shirt Dress, Linen Shirt Dress (2 cards)
- [ ] sweatpants: Classic, Tapered Joggers (2 cards - may replace jogger module)
- [ ] straight-trouser-w: Straight, Cigarette Pants (2 cards)
- Result: 24 base modules -> ~50 catalog cards with NO new garment code

**Phase B - New modules ship with variants from day one:**
- [ ] Every new module in the build order must define 2-3 variants
- [ ] Variant names vetted for SEO (what do people search for?)
- [ ] Variant fabric lists populated with affiliate-linked materials
- [ ] Variant thumbnails on catalog page (rendered previews when 2D plan renderer is ready)

**Phase C - Data-driven variant creation:**
- [ ] PostHog: track which options users change most per base module
- [ ] Popular option combos that differ from defaults = candidate for a new variant
- [ ] A/B test variant names and default combos for conversion

---

### Body type selector - children's sizing without new modules

Every garment module already accepts any measurement values. A "body
type" selector at step 1 loads appropriate defaults and hides
irrelevant options. No new engine work needed.

**Implementation:**
- [ ] Add body type selector to wizard step 1: Adult / Child (4-12) / Toddler (1-3)
- [ ] Per-type measurement defaults (from ASTM D6192/D6458):
      Adult: current defaults (chest 38, waist 32, etc.)
      Child 4-6: chest 23, waist 21, hip 23, rise 7, shoulder 11, neck 11
      Child 8-10: chest 27, waist 23, hip 27, rise 8, shoulder 13, neck 12
      Child 12: chest 31, waist 25, hip 31, rise 9, shoulder 14, neck 13
      Toddler: chest 21, waist 20, hip 21, rise 6.5, shoulder 9.5, neck 10
- [ ] Per-type option filtering:
      Children: hide bust dart, hide ultra-low/ultra-high rise,
      default elastic waist on all pants, hide "fitted" ease
      Toddler: force elastic waist, hide zip fly, hide welt pockets,
      default snap/velcro closures
- [ ] Per-type ease adjustment:
      Children +1" to standard ease (movement + growth)
      Toddlers +1.5"
- [ ] UI: body type selector as toggle row above garment cards
- [ ] **CPSC compliance for children's sleepwear**: snug-fit (max 10% ease) OR flame-resistant fabric. Labeling required: "Tight-Fitting - Not Flame Resistant"

**Not in scope:** Infant sizing (onesies, sleep sacks - different block
geometry entirely). Baby accessories (bibs, burp cloths) covered
by quick-add projects above.

### 2D plan render - real-time 3-view garment preview

As the user selects garment options, a front / side / back line drawing
updates in real time showing the garment shape. Like a paper doll but
driven by the actual pattern geometry.

**Why it matters:**
- Users can SEE what their choices look like before generating
- Eliminates "I picked V-neck but I wanted scoop" confusion
- Screenshots beautifully for marketing and social sharing
- Makes the product feel premium (no other pattern company has this)
- Reduces refund requests / support tickets

**Implementation plan:**

Phase 1 - Static garment silhouettes (quick win):
- [ ] SVG line drawings for each garment category (tops, pants, skirts, dresses, jackets)
- [ ] Swap elements on/off based on options: pocket placement,
      neckline shape, collar style, sleeve length, hem shape
- [ ] Show in step 3 (options) as a preview panel beside the option controls
- [ ] 3 views: front, side, back - arranged horizontally
- [ ] Monochrome line art on transparent background
- [ ] Difficulty: moderate - hand-drawn SVG templates with conditional visibility

Phase 2 - Measurement-driven proportions (medium effort):
- [ ] Scale the silhouette proportions from user's measurements
      (wider hip = visually wider hip on the drawing)
- [ ] Neckline depth, shoulder width, sleeve length all proportional
- [ ] Garment length reflects actual torso/inseam input
- [ ] Reuses geometry from the engine (armholeCurve, necklineCurve, etc.)
      at a miniature scale
- [ ] Difficulty: moderate - math already exists, just needs a miniature renderer

Phase 3 - Live pattern piece overlay (ambitious):
- [ ] Actual pattern piece outlines rendered at small scale
- [ ] Shows how pieces relate to each other and to the body
- [ ] Toggle between "on body" view and "flat layout" view
- [ ] Difficulty: high - needs body outline + piece positioning

**Technical approach:**
The engine already computes all the coordinates (neckline curve, armhole,
shoulder slope, sleeve cap, crotch curve). The 2D plan render is a
second renderer that draws a simplified body outline and maps the
pattern geometry onto it at a reduced scale. Front view = front bodice
polygon reflected around CF. Side view = bodice depth at key points
(shoulder, bust, waist, hip). Back view = back bodice reflected.

For lower body: front view = front panel reflected. The leg taper,
knee point, and hem width are already computed.

For bags: front/side/top orthographic views from the bag dimensions.

**Priority:** Phase 1 (static silhouettes) in Month 2 post-launch.
Phase 2 (measurement-driven) in Month 4. Phase 3 is a stretch goal.

---

## Phase 5 — The Data Play

### Reality Check
At ~15% feedback-per-purchase conversion (industry sew-rate × return-to-submit rate),
50k reviews requires ~330k purchases (~$4.6M revenue). This is a compounding asset,
not an early-stage strategy. Milestones:
- **5,000 reviews** → correction factors per garment module (useful for us)
- **50,000 reviews** → licensable dataset (useful to others, 5+ year horizon)

### Fit Feedback Collection
- [x] Post-sew feedback form in account dashboard
- [x] Measurements snapshot frozen on every purchase (migration 001)
- [x] Measurements snapshot attached to every fit review
- [x] Multiple reviews per purchase (muslin + final garment)
- [x] Implicit fit signals: measurement deltas logged on re-generation
- [ ] Aggregate by measurement + size range
- [ ] Feed corrections back into geometry
      (each module gets a correction factor
      based on real-world fit reports)

### Increase Feedback Volume
- [ ] **Incentivized reviews**: submit fit feedback → earn discount or credit on next pattern
      ("Review your pattern, get 50% off your next one")
- [ ] **Signed-token feedback URL**: email deep link goes straight to form, no login required
- [ ] **Second email nudge** at 21 days if first (14-day) nudge got no response
- [ ] **Photo-first feedback**: let users submit a photo with one tap, add structured data later
- [ ] **Public fit gallery**: opt-in make photos visible on pattern pages (social proof)
- [ ] **Aggregated fit scores on pattern pages**: "87% rated waist fit as perfect"
      (creates reason to both read AND submit reviews)

### Seed Data Through Partnerships
- [ ] **Pattern tester program**: recruit 50–100 testers, require structured review
- [ ] **Sewing influencer program**: free patterns to sewists with 5k–50k followers, require review
- [ ] **Sewing class partnerships**: free patterns for classes in exchange for group feedback
- [ ] **PatternReview.com**: get patterns reviewed on PR (593k members, reviews are the culture)

### Passive Data Signals (no user action required)
- [x] Re-generation measurement deltas (table: `measurement_deltas`)
- [ ] Track measurement profile edits with before/after diffs
- [ ] Multiple re-download patterns as "still adjusting" signal
- [ ] PostHog behavioral signals: time on measurement page, garments previewed, etc.

### What This Becomes
- Most detailed real-body fit dataset for
  home sewists ever assembled
- Licensable to:
  Fabric companies, clothing brands, pattern
  companies, academic textile research
- Timeline: meaningful data at ~5,000 fit reports (achievable at ~$460k revenue)
  Licensable asset at ~50,000 fit reports (5+ year compounding horizon)

### Publication Path
The dataset becomes publishable and licensable at different stages:

**Year 1–2: Whitepaper (self-published)**
- "Body Measurement vs. Fit Outcome: Findings from N Made-to-Measure Sewing Patterns"
- Self-published PDF on peoplespatterns.com (email-gated for B2B leads)
- Use to pitch licensing conversations with fabric companies and apparel brands
- No peer review needed — this is a marketing + credibility asset

**Year 2–3: Industry report (the money version)**
- "The State of Fit in Home Sewing, 20XX"
- Sell directly ($500–2,000/copy to apparel companies) or use as licensing lead magnet
- Comparable: Alvanon's fit analytics reports

**Year 3+: Academic paper (the credibility version)**
- Target journals: *International Journal of Fashion Design, Technology and Education*,
  *Clothing and Textiles Research Journal*, *Ergonomics*, or *Applied Ergonomics*
- Partner with a co-author from a textile/apparel program for academic legitimacy
  (FIT, NC State Wilson College of Textiles, Drexel, Cornell Human Ecology)
  They get data access + publication credit, we get academic credibility
- Working title: "Systematic Analysis of Fit Discrepancies in Custom-Drafted
  Garment Patterns Across Diverse Body Morphologies"
- Peer review takes 6–18 months; the citation lives forever

**Year 3+: Conference presentations**
- ITAA (International Textile and Apparel Association) annual conference
- This is where the apparel industry people who'd license the data gather

### Licensing Comparables
- **Alvanon** (fit mannequins + body data): charges $50k–200k/year for fit analytics
- **SizeStream** (3D body scanning): licenses scan data to apparel companies
- **ASTM body measurement standards**: basis for all US sizing — from 2004, notoriously outdated
- Our edge: fit *outcomes* linked to measurements — not just "here are body measurements"
  but "here's what happened when we made clothes from them." Nobody has that at scale.
- Realistic year 3–4 target: $25k–50k/year per licensing client, 3–5 clients

---

## Path to Full-Time

### The Target
$60k/year = full-time People's Patterns. The mix:
- 100 subscribers at $18/mo avg (Club + Wardrobe mix) = $21,600/year
- 200 single pattern sales/month at $14 avg = $33,600/year
- Etsy graded patterns (passive) at $500/month = $6,000/year
- **Total: ~$61k/year**

That's 100 subscribers + 200 sales/month + Etsy trickle. Not easy, not fantasy.
Indie pattern companies (Friday Pattern Co, Helen's Closet, Megan Nielsen) all
got there as solo founders.

### Sequencing (don't do everything at once)

**Phase A: Pre-launch (now → launch day)**
Only jobs: sew 6 muslins, photograph them, wire DNS, test purchase flow.
Nothing else. No social media strategy. No videos. No blog. No new modules.
Ship the thing.

**Phase B: First 90 days post-launch**
Only jobs: post content (TikTok/Instagram short-form video — sewing + fit results),
respond to every customer personally, fix bugs. No new patterns. No subscriptions.
No Etsy. Learn what resonates.

**Phase C: Months 4–6**
Add 1 new pattern per week (easy ones: circle skirt, pencil skirt, tank top, tote bag).
Start Etsy graded pattern listings. By now you know what's selling and what content works.

**Phase D: Months 7–12**
Launch subscriptions. Build referral program. Start tester program.
Target: 50–100 sales/month. If not there, the problem is marketing, not product.

**Phase E: Year 2**
Subscriber flywheel or not. If 50+ subscribers and growing, you're on track.
Go full-time when you can cover 6 months of expenses in savings + the business
is covering monthly costs.

### What actually makes money (do these)
1. Sewn sample photos → trust → conversion
2. Short-form video → discovery → traffic
3. Product being good → retention → word of mouth
4. Every customer interaction → testimonials → social proof

### What feels productive but doesn't make money yet (defer these)
1. New garment modules (until you have traffic to sell them to)
2. Infrastructure improvements (until you have users who need them)
3. Data play features (until you have volume)
4. Code polish, refactoring, new output formats

### Burnout prevention
- One job per phase. Not seven jobs simultaneously.
- The code is done enough. The infrastructure is done enough.
  The bottleneck is now content and trust, not software.
- Every hour writing code instead of sewing and posting is an hour
  that doesn't move the needle toward full-time.
- Set a weekly content cadence you can sustain for 2 years, not one you can
  sustain for 2 weeks. 2 posts/week > 14 posts/week for 1 month then silence.
- Revenue milestones, not feature milestones, determine what to build next.

---

## Technical Debt & Improvements

### Open Known Issues
- [x] KI-002 SA corner spikes at acute angles
      (mitigated: 2.5× miter cap + sanitizePoly dedup/collinear removal)
- [x] KI-003 Slant pocket mirror annotation (v0.8.0)
- [x] KI-004 Ext label clips at small values (v0.8.0)
- [x] KI-006 Wrap dress skirt SA scaling (v0.8.0)
- [x] KI-009 Category 'tops' vs 'upper' inconsistency
      Not a bug: 'tops' is a UI display label, 'upper' is measurement category.
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
      inline field — broken on mobile)
- [ ] Measurement validation before generation
- [ ] Mobile-friendly measurement input
- [ ] React/Tailwind migration (low priority until scale)

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
- [ ] A0 single-sheet export
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
- [x] Bust dart intake scales with chest (KI-011)
- [ ] Notch marks on all pieces
      (most requested feature from experienced sewists)
- [ ] Dart manipulation tools (partial: bust darts done)
- [ ] Bezier SVG curves for smooth neckline/armhole rendering
- [ ] Piece nesting / layout optimizer
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

All 42 base garments are live on main. 42 style variants expand from these bases (84 total patterns). 10 curated bundles are live.

| Module | Garment | Code | Variants |
|---|---|---|---|
| tee | T-Shirt | ✅ | oversized, muscle, longline, pocket, scoop (W), long-sleeve fitted (W), cropped (W) |
| fitted-tee-w | Fitted Tee (W) | ✅ | long-sleeve fitted, cropped |
| camp-shirt | Camp Shirt | ✅ | vacation shirt |
| button-up | Button-Up Shirt (M) | ✅ | linen shirt, chambray work shirt |
| button-up-w | Button-Up Shirt (W) | ✅ | poplin blouse, linen tunic |
| shell-blouse-w | Shell Blouse (W) | ✅ | woven tank |
| crewneck | Crewneck Sweatshirt | ✅ | raglan sweatshirt |
| hoodie | Hoodie | ✅ | zip hoodie, oversized hoodie |
| tank-top | Tank Top | ✅ | racerback, cropped tank |
| straight-jeans | Straight Jeans | ✅ | slim jeans, high-rise jeans |
| baggy-jeans | Baggy Jeans | ✅ | — |
| chinos | Chinos | ✅ | slim chinos |
| 874-work-pants | 874 Work Pants | ✅ | — |
| pleated-trousers | Pleated Trousers | ✅ | — |
| sweatpants | Sweatpants | ✅ | tapered joggers |
| cargo-shorts | Cargo Shorts | ✅ | — |
| baggy-shorts | Baggy Shorts | ✅ | — |
| gym-shorts | Gym Shorts | ✅ | running shorts, basketball shorts |
| pleated-shorts | Pleated Shorts | ✅ | — |
| swim-trunks | Swim Trunks | ✅ | — |
| cargo-work-pants | Cargo Work Pants | ✅ | — |
| crop-jacket | Crop Jacket | ✅ | — |
| athletic-formal-jacket | Athletic Formal Jacket | ✅ | — |
| denim-jacket | Denim Jacket | ✅ | lightweight denim jacket |
| easy-pant-w | Easy Pant (W) | ✅ | lounge pant, cigarette pants |
| straight-trouser-w | Straight Trouser (W) | ✅ | linen wide-legs |
| wide-leg-trouser-w | Wide-Leg Trouser (W) | ✅ | — |
| athletic-formal-trousers | Athletic Formal Trousers (W) | ✅ | — |
| leggings | Leggings | ✅ | capri leggings, biker shorts |
| slip-skirt-w | Slip Skirt (W) | ✅ | — |
| a-line-skirt-w | A-Line Skirt (W) | ✅ | — |
| circle-skirt-w | Circle Skirt (W) | ✅ | mini, midi circle skirt |
| pencil-skirt-w | Pencil Skirt (W) | ✅ | — |
| shirt-dress-w | Shirt Dress (W) | ✅ | linen shirt dress |
| wrap-dress-w | Wrap Dress (W) | ✅ | maxi wrap dress |
| tshirt-dress-w | T-Shirt Dress (W) | ✅ | long-sleeve tee dress, maxi tee dress |
| slip-dress-w | Slip Dress (W) | ✅ | maxi slip dress |
| a-line-dress-w | A-Line Dress (W) | ✅ | midi A-line dress |
| sundress-w | Sundress (W) | ✅ | maxi sundress, tiered sundress |
| apron | Apron | ✅ | — |
| bow-tie | Bow Tie | ✅ | — |
| tote-bag | Tote Bag | ✅ | market tote, beach tote |

---

## Reference: Strategy Documents

See `peoples-patterns-strategy/` for detailed plans:

1. **01-email-flows.md** — All 8 email templates with implementation prompts
2. **02-social-media-strategy.md** — Platform strategies, content calendars, schedules
3. **03-website-seo.md** — Site structure, keywords, technical SEO
4. **04-retention-features.md** — Saved profiles, fit feedback, project history, recommendations
5. **05-sales-funnel.md** — Full funnel from discovery to repeat purchase
6. **06-upsell-crosssell-downsell.md** — Revenue maximization per touchpoint
7. **07-pricing-strategy.md** — 3-tier pricing, bundles, membership tiers, per-garment pricing
8. **08-master-action-plan.md** — 30-day launch plan, revenue targets, solo founder playbook
