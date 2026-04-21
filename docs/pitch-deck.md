# People's Patterns — Investor Pitch Deck

> **Format guide:** Each slide shows a headline, 3–5 bullets, and speaker notes.
> Paste slide content into Gamma, Beautiful.ai, or any AI deck tool.
> Replace `[PLACEHOLDER]` sections before presenting.

---

## Slide 1: Cover

**Headline:** People's Patterns

**Subhead:** Made-to-measure sewing patterns. Generated in the browser. Built for real bodies.

**Tagline:** The easiest way to make clothes that actually fit.

**Speaker notes:**
Start with the problem, not the company. Most people have bought a sewing pattern that didn't fit. That's the entire setup for this business.

---

## Slide 2: The Problem

**Headline:** Standard sizes fit almost nobody.

- Off-the-rack sewing patterns are drafted for a statistical average body that represents a small fraction of real people
- Getting a pattern custom-drafted by a professional costs $150 or more per garment. Most people can't justify it
- So home sewists give up, alter patterns by hand, or waste fabric on muslins that never work
- 68% of sewists report fit as their #1 frustration. Clothing return rates hit 20–30% at retail for the same reason
- The home sewing market is growing fast. The infrastructure for it has not kept up

**Speaker notes:**
The market pain is visceral and universal. Every sewist in the room has a pile of patterns they bought and never used because the fit was wrong. This is not a niche problem — it's the defining frustration of the hobby.

---

## Slide 3: The Solution

**Headline:** Enter your measurements. Get your pattern. Start cutting.

- People's Patterns is a browser-based, made-to-measure sewing pattern generator
- Users input their measurements, choose a garment, and receive a print-ready PDF in under two minutes
- Patterns use the same parametric drafting math taught in fashion design programs. No guesswork
- Seam allowances, grain lines, notches, and step-by-step construction notes are included automatically
- No software to download. Works on any device. Prices start at $9

**Speaker notes:**
The insight is that pattern drafting math has been codified in fashion schools for decades. It's just never been made accessible to home sewists at scale. We automated it. The output is indistinguishable from a professional custom draft.

---

## Slide 4: Product

**Headline:** Fully built. 121 garments. Ready to launch.

- 67 base garment modules with 121 total catalog items across menswear, womenswear, kids, and accessories
- Categories: tops, bottoms, dresses, skirts, outerwear, activewear, accessories (sizes 2T–3X+)
- Inclusive measurement system: Full Bust Adjustment, tummy fit, high bust, height-proportional scaling
- Full account system: measurement profiles, purchase history, fit feedback, pattern regeneration when measurements change
- Stripe payments, Supabase auth, PostHog analytics, and email infrastructure all live

**Speaker notes:**
This is not a prototype. It is a production-grade application at version 0.12.83 with over 100 documented changelogs. The product works. The launch work remaining is content, testing sewn samples, and community outreach — not engineering.

**[INSERT: Product screenshots — wizard flow, pattern preview, account dashboard]**

---

## Slide 5: Market Size

**Headline:** A $60 billion market with no dominant digital player.

- **TAM: $60B** — Global custom clothing market (2025), projected $149.5B by 2035 at 9.56% CAGR
- **SAM: ~$2B** — Estimated US home sewing pattern market (30M+ home sewists, avg $60+/yr on patterns)
- **SOM: $15M+** — Capturing 1% of US home sewists in years 1–3 at $15 average order value and 30% returning
- Millennials and Gen Z now represent 60% of new sewers. This demographic is digital-native and sustainability-driven
- #sewing has accumulated over 3 million posts on TikTok. The community is large, active, and underserved by current tools

**Speaker notes:**
The TAM is large but not the right number to focus on. The SAM is the honest addressable market: home sewists who already buy patterns. We don't need to create the behavior — we need to be the better option. The SOM is conservative and achievable within 24 months.

---

## Slide 6: Business Model

**Headline:** Multiple revenue streams. Low CAC. High repeat potential.

| Tier | Price | Example Garments |
|---|---|---|
| Simple | $9 | T-Shirt, Gym Shorts, Easy Pant, Kids patterns |
| Core | $14 | Jeans, Camp Shirt, A-Line Skirt, Crewneck |
| Tailored | $19 | Hoodie, Denim Jacket, Pleated Trousers, Wrap Dress |

- **Bundles:** 3-pattern capsule ($29), 5-pattern wardrobe ($49), 8 curated theme bundles ($25–42)
- **Subscriptions:** Club Monthly ($12/mo), Wardrobe Monthly ($24/mo) — recurring pattern credits
- **Affiliate program:** 30% commission on referred fabric and notions purchases
- **Future:** Professional tier ($50/mo for pattern makers and small studios), physical kits, graded standard sizes (XS–3X)

**Unit economics:** Avg order ~$15. Subscription LTV (annual): $144–$288. CAC target: under $10 via community-driven organic channels.

**Speaker notes:**
The per-pattern model generates immediate revenue with no inventory. Subscriptions add predictable recurring revenue. The affiliate layer monetizes traffic beyond direct purchases. The professional tier unlocks a B2B motion at much higher ACV.

---

## Slide 7: Competitive Landscape

**Headline:** No one is doing this at scale.

| | People's Patterns | Indie PDF Patterns | Custom Drafting Services | Big 4 (Simplicity, Vogue) |
|---|---|---|---|---|
| Made-to-measure | Yes | No | Yes | No |
| Browser-based | Yes | No | No | No |
| Under $20 | Yes | Mostly | No | Sometimes |
| Instant delivery | Yes | Yes | No (days/weeks) | No |
| 100+ garments | Yes | No | No | Yes |
| Inclusive sizing | Yes | Varies | Yes | No |

- Closest analog: Valentina Project (open-source desktop app, requires technical skill, limited catalog)
- No venture-backed company has built automated MTM for home sewists at scale
- First-mover advantage is real. The moat is the data, the catalog depth, and the community trust

**Speaker notes:**
The competition is fragmented. Indie designers sell individual patterns. Custom drafters charge 10x our price. Big 4 brands sell standard sizes with no personalization. We're the only product that combines instant delivery, made-to-measure precision, and a price accessible to hobbyists.

---

## Slide 8: The Data Moat

**Headline:** Every pattern generated is a data point. No one else has this dataset.

- People's Patterns collects body measurements, garment choices, fit feedback, and alteration requests at scale
- This builds a proprietary dataset mapping real body measurements to real fit outcomes — across age, gender, height, body composition
- No clothing brand, pattern company, or research institution has this data systematically
- Applications: predictive fit recommendations, AI-driven pattern adjustments, size standard benchmarking
- Dataset is licensable to apparel brands, fabric companies, and fit-tech companies as a B2B revenue stream
- As the catalog and user base grow, the data moat becomes the most defensible asset in the business

**Speaker notes:**
This is the AI angle. The pattern generation engine is valuable. The fit dataset it generates over time is potentially more valuable. We're building the training data for the next generation of fit intelligence — and we're the only company positioned to do it at the intersection of precision measurement and home sewing.

---

## Slide 9: Go-to-Market

**Headline:** Community-first. Organic first. Profitable channels before paid.

**Phase 1 — Pre-launch (now):**
- Muslin testing with sewists for fit validation and testimonials
- Sewn sample photography for product pages and social content
- Email list seeding through sewing community forums

**Phase 2 — Launch:**
- TikTok and Instagram sew-along content (high organic potential in #sewTok)
- PatternReview.com listings and r/sewing community engagement
- Affiliate seeding with fabric and notions retailers (mutual benefit)

**Phase 3 — Expansion:**
- Etsy and Craftsy marketplace listings (high-intent buyers already shopping for patterns)
- Professional tier launch targeting pattern makers and small studios
- Paid acquisition once organic CAC is benchmarked

**Speaker notes:**
The sewing community is tight-knit and trust-driven. One honest review on PatternReview or a viral sew-along video converts at rates paid ads can't match. We're not spending to acquire users until we know the organic channels work. This keeps burn low and retention high.

---

## Slide 10: Traction

**Headline:** Pre-launch. Product complete. Ready to turn on.

**What's done:**
- Production application at v0.12.83 — full stack built and deployed
- 121-item garment catalog with inclusive sizing across all categories
- Stripe payments, Supabase auth, email infrastructure, analytics all integrated
- Per-pattern landing pages built and SEO-indexed

**What's in progress:**
- Sewn sample testing and photography (6 garments)
- Launch content production (sew-along videos, tutorials)
- Community outreach and affiliate partner seeding

**What's not started:**
- Paid user acquisition (intentionally — organic first)

**Speaker notes:**
We are pre-revenue and pre-user by choice, not by delay. The product is built. The go-to-market plan is specific and sequenced. The work remaining before first revenue is weeks, not months. The risk here is execution, not product-market fit — and the execution is already 90% done.

---

## Slide 11: Projections

**Headline:** Conservative path to $120K ARR within 24 months.

| Milestone | Target | Monthly Revenue |
|---|---|---|
| Break-even | ~200 purchases/mo | ~$2,750/mo |
| Meaningful ($50K ARR) | ~280 purchases + 30 subs/mo | ~$4,200/mo |
| Goal ($120K ARR) | ~500 purchases + 150 subs/mo | ~$10,000/mo |
| Ceiling, solo ($300K ARR) | ~1,000 purchases + 400 subs/mo | ~$25,000/mo |

**Assumptions:**
- Average order value: $14 (blended across tiers)
- Subscription average: $15/mo (mix of Club and Wardrobe)
- Affiliate and bundle revenue not included in base projections (upside)
- No paid acquisition in year 1 — organic and community-driven only

**Speaker notes:**
These numbers are not hockey-stick projections. They are the founder's own stated milestones from the product roadmap. The business reaches meaningful income for a solo founder at around 280 purchases per month — a realistic number for a product with genuine community pull in an underserved market.

---

## Slide 12: Team

**Headline:** [FOUNDER NAME] — [TITLE]

- Built the entire product solo: pattern drafting engine, 121-garment catalog, full-stack application, payments, email, analytics
- [Background: fashion, engineering, or both — add specifics here]
- [Any relevant credentials: sewing experience, fashion education, software background]
- Advisor: [NAME, ROLE] — [1 sentence on why they're relevant]

**Why a solo founder works here:**
- The product is feature-complete. The work remaining is GTM, not engineering
- Solo economics mean break-even is achievable at low revenue thresholds
- The technical moat is already built. Scaling requires community + content, not a large team

**Speaker notes:**
The fact that one person built a production-grade, 121-garment pattern generation platform is itself a signal. This is not a team that needs to find product-market fit — it's a founder who has already solved the hard problem and is now executing distribution.

**[PLACEHOLDER: Add founder photo, specific credentials, and any advisors]**

---

## Slide 13: The Ask

**Headline:** [PLACEHOLDER: Funding amount and use of funds]

**We are raising: $[AMOUNT]**

**Use of funds:**
- [PLACEHOLDER: e.g., 40% content production and community launch]
- [PLACEHOLDER: e.g., 30% sewn sample testing and photography]
- [PLACEHOLDER: e.g., 20% paid acquisition experiments post-organic validation]
- [PLACEHOLDER: e.g., 10% infrastructure and tooling]

**What this buys:**
- [PLACEHOLDER: e.g., 12 months of runway to reach $[X] ARR]
- [PLACEHOLDER: e.g., First 1,000 paying customers]
- [PLACEHOLDER: e.g., Dataset seeding for the fit intelligence layer]

**Contact:** [PLACEHOLDER: email / website / calendar link]

**Speaker notes:**
[PLACEHOLDER: Be specific about what you're raising, why this amount, and what success looks like at the end of the runway. If you're bootstrapping, replace this slide with a "What we need" slide focused on advisors, partnerships, or community.]

---

## Appendix: Key Stats at a Glance

| Metric | Value |
|---|---|
| Garments in catalog | 121 (67 base + variants) |
| Pricing range | $9 – $19 per pattern |
| Bundle pricing | $25 – $49 |
| Subscription options | $12/mo – $24/mo |
| Market size (TAM) | $60B (2025), $149.5B (2035) |
| Market CAGR | 9.56% |
| Target break-even | ~$2,750/mo |
| Target ARR (goal) | $120,000 |
| Affiliate commission | 30% |
| Current version | v0.12.83 |
| Users | Pre-launch |

---

## Appendix: Why Now

1. **Gen Z sewing renaissance.** #sewing has exploded on TikTok. A new generation is learning to sew and demanding better tools.
2. **Sustainability pressure.** Fast fashion backlash is driving consumers toward making their own clothes. Made-to-measure reduces waste.
3. **AI infrastructure maturity.** Parametric drafting can now be deployed in the browser at scale. Three years ago, this was a desktop-software problem.
4. **Fit data gap.** No company has built a systematic fit dataset from real-body measurements at scale. The window to be first is open now.
5. **No incumbent to unseat.** The Big 4 pattern companies are legacy businesses with no digital roadmap. The field is clear.
