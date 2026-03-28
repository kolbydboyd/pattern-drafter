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
- Instagram @peoplespatterns
- TikTok
- YouTube
- Pinterest
- Newsletter

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

### Seasonal
- [ ] Halloween costumes — target October
- [ ] Holiday party dress — target November
- [ ] Swimwear expansion — target June

---

## Phase 5 — The Data Play

### Fit Feedback Collection
- [x] Post-sew feedback form in account dashboard
- [ ] Aggregate by measurement + size range
- [ ] Feed corrections back into geometry
      (each module gets a correction factor
      based on real-world fit reports)

### What This Becomes
- Most detailed real-body fit dataset for
  home sewists ever assembled
- Licensable to:
  Fabric companies, clothing brands, pattern
  companies, academic textile research
- Timeline: meaningful data at ~5,000 fit reports
  Licensable asset at ~50,000 fit reports

---

## Technical Debt & Improvements

### Open Known Issues
- [ ] KI-002 SA corner spikes at acute angles
- [ ] KI-003 Slant pocket mirror annotation
- [ ] KI-004 Ext label clips at small values
- [ ] KI-006 Wrap dress skirt SA scaling
- [ ] KI-009 Category 'tops' vs 'upper' inconsistency
- [x] KI-010 edgeAllowances/sanitizePoly interaction (mitigated)
- [ ] KI-011 Bust dart intake fixed at 1.5" (should scale with cup size)
- [x] KI-012 Dual PDF renderer removed (accepted risk)
- [ ] KI-013 Scale check depends on CSS class name

### UI Improvements
- [ ] Profile name input (replace prompt() with
      inline field — broken on mobile)
- [ ] Measurement validation before generation
- [ ] Mobile-friendly measurement input
- [ ] React/Tailwind migration (low priority until scale)

### Output Formats
- [ ] Projector file export
- [ ] A0 single-sheet export
- [ ] DXF for plotters

### Pattern Quality
- [ ] Notch marks on all pieces (partial — on launch patterns)
- [ ] Dart manipulation tools (partial — bust darts done)
- [ ] Contoured waistband geometry
- [ ] Piece nesting / layout optimizer
- [ ] Scale bust dart intake with cup size (KI-011)

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
