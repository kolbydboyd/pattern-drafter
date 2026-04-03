# People's Patterns — Roadmap

_Last updated: 2026-03-27 · v0.7.0_

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

- [x] 23 garment modules built and code-complete
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
- [x] Per-edge seam allowances on launch patterns
- [x] Bust dart geometry on 4 womenswear tops
- [x] Polygon sanitizer (dedup, collinear removal, CW winding)
- [x] Notches added to launch patterns
- [x] Sleeve cap to armhole validation
- [x] Grainline arrows and fold indicators on all pieces
- [x] Purchase bypass patched (backend PDF authorization)
- [x] Account dashboard (measurements, patterns, projects, wishlist, orders, gift cards, settings)
- [x] cm / inch toggle

---

## Immediate — Launch Blockers

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

### Email Flows - ready to implement (code complete, not yet live)
- [x] 5-email welcome sequence (Days 0/2/5/9/13):
      Day 0: "Welcome! How to measure yourself"
      Day 2: "Your first pattern - what to expect"
      Day 5: "How tiled PDFs work"
      Day 9: "3 patterns beginners love"
      Day 13: "Fit tips from the community"
- [x] Email opt-in UI after free pattern redemption + paid purchase success
- [x] Weekly digest (new articles + tester calls, Sundays)
- [x] Abandoned pattern reminders (3-7 days, 25% off credit pack)
- [x] Landing page copy: "Weekly fit tips + new pattern drops"
- [x] join-list.js upgraded to full welcome sequence enrollment
- [x] Generated-not-purchased follow-up
- [x] Post-sew fit feedback request

**To activate:**
1. Run migration `004_email_marketing.sql` in Supabase
2. Create Stripe price for 2-credit pack, update `price_CREDIT_PACK_2` in `pricing.js`
3. Create Stripe promotion code `FIRSTPACK25` (25% off credit packs)

### Credit Packs - ready to implement (code complete, not yet live)
- [x] 2-Credit Pack at $22 ($11/credit)
- [x] Checkout flow (create-checkout.js, stripe-webhook.js)
- [x] Pricing page section between bundles and memberships
- [x] Success page display
- [x] Abandoned pattern reminder ties into credit pack upsell

### Privacy / Technical
- [x] Move body measurements out of Stripe session metadata
      (store only in Supabase, pass reference ID to Stripe)
- [x] Document required schema state or use proper Supabase migrations

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

### Technique coverage map
Every sewing technique covered by at least one module in the catalog.
When adding a new module, check this list — if it introduces a technique
not yet covered, it has higher catalog value.

| Technique | Covered by | Status |
|---|---|---|
| Set-in sleeve | tee, camp-shirt, button-up-w, blazer | done |
| Raglan sleeve | crewneck, hoodie | done |
| Two-piece sleeve | denim-jacket | done |
| Kimono / dolman sleeve | - | not yet — easy tee variant |
| Collar stand + roll | camp-shirt, button-up-w, denim-jacket | done |
| Spread / notch lapel | blazer, trench | not yet |
| Hood | hoodie | done |
| Welt pocket | straight-jeans, chinos, blazer | done (jeans/chinos), blazer pending |
| Patch pocket | tee, crop-jacket, tote | done |
| Flap pocket | denim-jacket, cargo-shorts | done |
| Slash / slant pocket | jeans, chinos, sweatpants | done |
| Zip fly | straight-jeans, chinos | done |
| Button placket | button-up-w, denim-jacket | done |
| Elastic waist | sweatpants, gym-shorts, easy-pant-w | done |
| Drawstring | swim-trunks, sweatpants | done |
| Waist darts | jeans back, trousers | done |
| Bust darts | button-up-w, fitted-tee-w, shell-blouse-w | done |
| Princess seams | - | not yet — blazer or fitted dress adds |
| Gathers | sundress skirt | not yet |
| Pleats | pleated-shorts, pleated-trousers | done |
| Yoke (horizontal) | denim-jacket | done |
| Lining | blazer, slip-skirt-w, coat | partial (slip skirt) |
| Bias cut | bias-cut skirt | not yet |
| Knit / stretch construction | tee, leggings, boxers | partial (tee), full with leggings |
| Flat-felled seam | straight-jeans, denim-jacket | done |
| French seam | shell-blouse-w, slip-skirt-w | done |
| Cylinder construction | duffle bag | not yet |
| Webbing / strap | tote, crossbody, daypack | not yet |
| Invisible zipper | a-line-skirt-w, slip-skirt-w | done |
| Exposed / sport zipper | hoodie, daypack | done (hoodie) |
| Boning / structure | corset | not yet — future |
| Bias binding / tape | apron, tank top | not yet |
| Rolled hem | - | not yet — easy add on any garment |

### Quick-add projects (high volume, low complexity)
These take 1-2 hours to build, generate high social engagement,
and serve as gateway projects for new sewists. No body measurements
needed — just dimensions.

| Project | Difficulty | Time to build | Notes |
|---|---|---|---|
| Zippered pouch (3 sizes) | beginner | 1 hr | #1 most-sewn project on earth. Lining, zipper, boxed corners. |
| Pillowcase / envelope pillow | trivial | 30 min | Absolute beginner gateway. Custom dimensions. |
| Drawstring bag / stuff sack | beginner | 1 hr | MYOG staple. Cord channel, grommet option. |
| Scrunchie | trivial | 30 min | #1 beginner project on TikTok. Elastic + tube. |
| Pet bandana | trivial | 30 min | Viral niche. Measure neck, pick size. |
| Baby bib | beginner | 30 min | Gift economy. Snap or tie closure. |
| Phone crossbody / wallet | beginner | 1 hr | Small, fast, gift-friendly. Card slots. |
| Laptop sleeve | beginner | 1 hr | Dropdown: select device model, auto-dimensions. |
| Table runner / placemat set | beginner | 1 hr | Home dec crossover. Custom table dimensions. |
| Curtain panels | beginner | 1 hr | Enter window dimensions, get cut-to-size pattern. |
| Tool roll | beginner | 1 hr | Workshop/craft storage. Custom pocket count + widths. |
| Guitar strap | beginner | 30 min | Niche but dedicated community. Webbing + pad. |
| Dog coat | intermediate | 2 hr | Measure your dog, get a pattern. Viral potential. |
| Diaper bag | intermediate | 2 hr | Structured bag variant. Huge gifting market. |
| Camera bag / insert | intermediate | 2 hr | MYOG crossover. Custom padded compartments. |

### Body type selector — children's sizing without new modules

Every garment module already accepts any measurement values. A "body
type" selector at step 1 loads appropriate defaults and hides
irrelevant options. No new engine work needed.

**Implementation:**
- [ ] Add body type selector to wizard step 1: Adult / Child (4-12) / Toddler (1-3)
- [ ] Per-type measurement defaults:
      Adult: current defaults (chest 38, waist 32, etc.)
      Child 4-6: chest 23, waist 21, hip 23, rise 7, shoulder 11, neck 11
      Child 8-10: chest 27, waist 23, hip 27, rise 8, shoulder 13, neck 12
      Child 12: chest 31, waist 25, hip 31, rise 9, shoulder 14, neck 13
      Toddler: chest 21, waist 20, hip 21, rise 6.5, shoulder 9.5, neck 10
- [ ] Per-type option filtering:
      Children: hide bust dart option, hide ultra-low/ultra-high rise,
      default to elastic waist on all pants, hide "fitted" ease option
      Toddler: force elastic waist, hide zip fly, hide welt pockets,
      default to snap/velcro closures
- [ ] Per-type ease adjustment:
      Children need proportionally more ease for movement and growth
      Add +1" to standard ease values for children
      Add +1.5" for toddlers
- [ ] UI: body type selector shows as a toggle row above garment cards
      Switching type reloads the defaults in step 2

**Not in scope:** Infant sizing (onesies, sleep sacks — different block
geometry entirely). Baby accessories (bibs, burp cloths) are covered
by the quick-add projects above.

### 2D plan render — real-time 3-view garment preview

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

Phase 1 — Static garment silhouettes (quick win):
- [ ] SVG line drawings for each garment category (tops, pants, skirts, dresses, jackets)
- [ ] Swap elements on/off based on options: pocket placement,
      neckline shape, collar style, sleeve length, hem shape
- [ ] Show in step 3 (options) as a preview panel beside the option controls
- [ ] 3 views: front, side, back — arranged horizontally
- [ ] Monochrome line art on transparent background
- [ ] Difficulty: moderate — hand-drawn SVG templates with conditional visibility

Phase 2 — Measurement-driven proportions (medium effort):
- [ ] Scale the silhouette proportions from user's measurements
      (wider hip = visually wider hip on the drawing)
- [ ] Neckline depth, shoulder width, sleeve length all proportional
- [ ] Garment length reflects actual torso/inseam input
- [ ] Reuses geometry from the engine (armholeCurve, necklineCurve, etc.)
      at a miniature scale
- [ ] Difficulty: moderate — math already exists, just needs a miniature renderer

Phase 3 — Live pattern piece overlay (ambitious):
- [ ] Actual pattern piece outlines rendered at small scale
- [ ] Shows how pieces relate to each other and to the body
- [ ] Toggle between "on body" view and "flat layout" view
- [ ] Difficulty: high — needs body outline + piece positioning

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
