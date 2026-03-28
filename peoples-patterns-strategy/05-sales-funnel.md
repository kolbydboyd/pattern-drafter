# People's Patterns — Sales Funnel

## The Funnel

```
DISCOVER → TRY → TRUST → BUY → SEW → FEEDBACK → BUY AGAIN
```

Each stage has specific tactics.

---

## Stage 1: Discover

**Goal:** Get sewists to the site.

### Channels (ranked by expected ROI)
1. Pinterest pins → pattern pages (evergreen, search-driven)
2. YouTube tutorials → blog articles → pattern pages (trust + SEO)
3. TikTok/Reels → bio link → landing page (volume)
4. Reddit → honest engagement → profile link (credibility)
5. Google organic → blog articles → pattern pages (long-term)
6. Word of mouth / referrals (highest conversion)

### Key Metrics
- Unique visitors per week
- Source breakdown (which channel drives most)
- Bounce rate on landing page (should be <50%)

---

## Stage 2: Try (The Aha Moment)

**Goal:** User generates a custom pattern and sees it on screen.

This is the most powerful part of the funnel. The moment someone enters their measurements and sees a pattern built for their body is the conversion event. Everything before this is just getting them here.

### Friction Points to Remove
- Don't require signup to generate
- Don't require signup to view the full pattern, materials, instructions
- Pre-fill measurements from saved profile if logged in
- Show results instantly — no loading spinners, no "processing"
- Make the garment selector visual, not a boring dropdown

### What They See
- Their custom pattern with their exact measurements labeled
- All pattern pieces with cut lines, stitch lines, notches
- Complete materials list with fabric type, yardage, notions
- Full construction instructions numbered step by step
- Fit check table showing their measurements vs pattern dimensions

### Key Metrics
- % of visitors who click "Get Started"
- % who complete measurements and generate
- Average time from landing to first generation

---

## Stage 3: Trust

**Goal:** User believes this pattern will actually work.

### Trust Signals (implement in order of impact)

1. **Sewn sample photos** on every pattern page — most important
2. **Scale verification square** on the print output — proves accuracy
3. **Fit check table** showing measurements vs pattern — transparency
4. **"How it works" video** — demystifies the process
5. **Customer fit feedback / reviews** — social proof
6. **"Muslin recommended"** messaging — honesty builds trust
7. **Free first pattern** — let them prove it to themselves
8. **Your face on YouTube** — personal trust

### Key Metrics
- Time spent on pattern page before clicking download
- % who view the fit check table
- % who watch the "how it works" video

---

## Stage 4: Buy (Conversion)

**Goal:** User pays for the print-ready PDF.

### Conversion Flow
1. User clicks "Download Print-Ready PDF"
2. If not logged in → email capture modal → create account
3. If logged in with credits → deduct credit, generate PDF
4. If logged in, no credits → show price + "Add to Cart"
5. Stripe checkout (minimal steps)
6. Confirmation page with download link + recommendations

### Conversion Boosters
- Show what's included: "tiled PDF + materials guide + instructions + scale verification"
- Show what they DON'T get without paying: "preview only — download includes print-ready tiles"
- First-purchase discount: "FIRST50 — 50% off your first pattern"
- Urgency (light): "Your custom pattern is generated and ready"
- Social proof: "[X] patterns downloaded this week"

### Reduce Purchase Anxiety
- "Re-download anytime from your account"
- "Update measurements and re-generate for free"
- "30-day money-back guarantee"
- "Questions? Email us"

### Key Metrics
- Conversion rate: generates → purchases (target: 5-10%)
- Average order value
- Cart abandonment rate

---

## Stage 5: Sew

**Goal:** User actually makes the garment.

This is the hardest stage to influence but the most important for retention. If they sew it and it fits, they'll buy again. If they don't sew it, they're gone.

### Tactics to Get Them Sewing
- Post-purchase email with sewing tips (3 days after download)
- Link to the sew-along video for that garment
- Muslin recommendation with clear instructions
- "Start with this step" highlight in the instructions
- Community sew-along events with deadlines

### Key Metrics
- % who download the PDF (of purchasers)
- % who submit fit feedback (proxy for "they sewed it")

---

## Stage 6: Feedback

**Goal:** User tells you how it fit.

### Tactics
- Fit feedback email 14 days after download
- In-app feedback button on the purchased pattern
- Make it easy: 5 quick dropdowns + optional free text
- Respond personally to every piece of feedback
- Share improvements made from feedback (newsletter)

### Key Metrics
- Feedback submission rate (target: 20-30% of purchasers)
- Positive fit rate (target: 70%+)
- Response time to negative feedback

---

## Stage 7: Buy Again (Repeat Purchase)

**Goal:** Turn one-time buyer into a wardrobe builder.

### Tactics
- "Your measurements work for these patterns too" recommendations
- "Complete your capsule" suggestions
- Next-pattern recommendation email 21 days after purchase
- Member pricing on additional patterns
- Bundle discounts: "3 patterns for $29"
- Seasonal collection drops with email announcement
- "New pattern: [garment]" notifications for subscribers

### Key Metrics
- Repeat purchase rate (target: 30%+ within 90 days)
- Average patterns per customer
- Time between purchases

---

## Claude Code Prompts



---

## Human Tasks
- [ ] Create the FIRST50 promo code in Stripe
- [ ] Write the post-purchase confirmation page copy
- [ ] Define the refund policy (30 days, what qualifies)
- [ ] Sew and photograph samples for 6 launch patterns
- [ ] Film sew-along videos for at least 2 patterns
- [ ] Set up the fit feedback Google Form (interim)
- [ ] Plan first community sew-along event
