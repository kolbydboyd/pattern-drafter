# People's Patterns — Etsy Strategy & Implementation Plan

Garment-Specific Plans for Etsy & Craftsy Standardized Listings

---

## 1. The Big Picture

Year 1 goal: Put a PDF in front of as many interested sewists as possible. Three revenue streams:

1. **Peoplespatterns.com** — custom-fit patterns from measurements, main product, higher margin
2. **Etsy/Craftsy** — graded standard-size patterns (XS–3XL), passive income, SEO discovery
3. **Affiliate** — fabric/notions links in every pattern PDF and on every garment page

**Revenue split by year 3:** Direct site ~25%, Etsy/Craftsy ~25%, memberships ~18%, affiliates ~12%, social ~7%, data licensing ~8%, professional/institutional ~5%

**Key insight:** The Etsy sale is NOT the end goal — it's a top-of-funnel acquisition channel. Every Etsy customer gets a card/insert with their PDF that reads: "This pattern was made from standard sizes. For a pattern drafted from YOUR measurements, visit peoplespatterns.com." The Etsy listing is the awareness layer. The site is the conversion layer.

---

## 2. Standardization Core System

### 2.1 Grade Rules

Build a grading function that runs the existing engine with standardized body measurements for each size (XS through 3XL).

### 2.2 Proportion Harmony

Validate each graded size for visual proportion balance — critical for sizes at the extremes where simple linear grading breaks down.

### 2.3 Construction Notes

Every PDF includes standardized construction notes appropriate to the garment complexity level.

---

## 3. User Experience Flow

1. **Visit site** → "Enter your measurements" → Download your pattern (custom-fit)
2. **Visit Etsy** → "Get this pattern" → Download graded PDF → Insert card says "For custom fit, visit peoplespatterns.com"

Key conversion path:
- Etsy sale → garment page (link, app, social, etc.) → custom fit upsell
- Against traditional funnel: Etsy generates awareness. Download provides value. The card/insert triggers curiosity. The site converts to custom-fit customer.

### Listing optimization
- Primary: "Made to measure digital sewing pattern" — this exact phrase is the target
- Secondary: Put step-by-step photos and review screenshots in listing images. Stack social proof.

---

## 4. Post-Purchase Conversion Funnel

Once an Etsy customer buys, there are 3 future conversion paths. Mark each path as:
1. Visit peoplespatterns.com for custom-fit version
2. Subscribe for monthly credits
3. Buy more patterns on Etsy

### Conversion Collateral
- **Etsy PDF insert page** — "Get your custom-fit version" — profile, measurements, CTA
- **Follow-up message** (Etsy allows one) — thank, link to measurement guide
- Site landing page for Etsy converters (UTM-tagged)

---

## 5. Unit Economics

| Metric | Value |
|--------|-------|
| Etsy listing fee | $0.20/listing (renews every 4 months) |
| Etsy transaction fee | 6.5% of sale price |
| Etsy payment processing | 3% + $0.25 |
| Avg Etsy price | $6–8 |
| Net per sale (after fees) | ~$4–5 |
| Etsy → site conversion rate | 15–25% (target) |
| Site conversion value | $12–14 (avg pattern price) |
| Blended value per Etsy customer | $6–9 (direct + downstream) |

---

## 6. Etsy Listing Strategy

### Initial Listings (6 launch patterns, graded XS–3XL):

Every graded listing gets:
- 10 listing images (flat lay, detail shots, size chart, construction preview)
- Size chart table in description
- "Custom fit version available" callout
- Link to peoplespatterns.com in shop announcement
- Tags optimized for Etsy search (13 tags max per listing)

### Listing Expansion

- **Phase 1:** List first 6 launch patterns (graded standard sizes)
- **Phase 2:** 1 new listing per week from remaining 17 modules
  (run engine with standard size chart, generate graded PDFs)
- **Phase 3:** Add "custom fit" as a variation option on Etsy listings
  (redirects to site — allowed under Etsy's digital goods policy)

### Pricing

- Simple garments (tee, gym shorts, tank): $5–6
- Core garments (jeans, camp shirt, chinos): $7–8
- Tailored garments (blazer, coat, shirt dress): $9–10
- Bundles: 3-pattern for $15, 5-pattern for $22

---

## 7. Implementation Plan

### Phase 1 — Grading System (before launch)

1. Build grading function in engine
   - Standard size chart: XS (chest 32, waist 26, hip 34) through 3XL (chest 54, waist 48, hip 56)
   - Run each garment module with each size's measurements
   - Generate multi-size PDF with all sizes nested/layered

2. Selling page: build a simple, single-page Etsy-style storefront on peoplespatterns.com
   for graded patterns (separate from the custom-fit generator)
   - Or skip this entirely and just use Etsy as the graded channel

3. On Etsy:
   - Create graded PDFs for first 6 launch patterns
   - 10 standard photos per garment (flat lay, detail, size chart, etc.)
   - Write SEO-optimized titles and descriptions
   - Set up shop policies, FAQs
   - $0.20/listing × 6 = $1.20 investment to start

### Phase 2 — Expand Listings (month 2+)

- Add 1 new graded pattern listing per week
- A/B test pricing ($5 vs $7 vs $9 per pattern)
- Track Etsy → site conversion rate via UTM codes
- Optimize listings based on Etsy search analytics

### Phase 3 — Cross-Pollination

- Etsy favorites and purchases drive Etsy search ranking
- Every Etsy customer gets pushed toward custom-fit site
- Site customers get recommended Etsy listings for gift purchases
- Cross-link everything

---

## 8. Claude Code Implementation Prompts

_For each component, a Claude Code prompt:_

### Prompt 1: Grading Function
"Build a grading function that takes a garment module and a standard size chart, runs the engine for each size, and outputs a multi-size PDF with nested pattern pieces. Size chart: XS through 3XL with standard ASTM measurements."

### Prompt 2: Etsy PDF Template
"Create an Etsy-ready PDF template that includes: cover page with garment illustration and size chart, pattern pieces with all sizes layered, construction notes, and a final page with 'Get your custom-fit version at peoplespatterns.com' CTA."

### Prompt 3: Batch Generator
"Build a batch generator script that runs every garment module through the grading function and outputs individual Etsy-ready PDFs for each garment in each size range."
