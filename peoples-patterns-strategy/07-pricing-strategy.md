# People's Patterns — Pricing Strategy

## Current Pricing (as configured in Stripe)
- Simple patterns: $7
- Core patterns: $8
- Complex patterns: $10
- Membership: $13/month unlimited

## Recommended Pricing (from report analysis)

### Why Change

The current pricing is too flat and the membership is too generous for a small catalog. $7-10 per pattern undervalues custom-fit when Bootstrap Fashion charges $5 for generic custom-fit and Seamwork charges $12+ for standard-size patterns with a big library. You're in between — better fit than Seamwork, smaller catalog than Bootstrap Fashion. Price for the value of custom fit, not the cost of generation.

$13/month unlimited makes no sense with 23 patterns. A user could download everything in month one and cancel. Unlimited works when you have 250+ patterns like Seamwork. With a small catalog, use credits.

### New Pricing Structure

**Per-Pattern (one-time purchase)**

| Tier | Price | Examples |
|------|-------|---------|
| Simple | $9 | Gym shorts, tee, slip skirt |
| Core | $14 | Cargo shorts, straight jeans, camp shirt, A-line skirt |
| Tailored | $19 | Pleated trousers, button-up, shirt dress, wrap dress |

**Bundles**

| Bundle | Price | Savings |
|--------|-------|---------|
| 3-pattern capsule | $29 | Save $4-28 depending on tier mix |
| 5-pattern wardrobe | $49 | Save $10-46 depending on tier mix |

**Membership**

| Tier | Monthly | Annual | Includes |
|------|---------|--------|----------|
| Club | $12/mo | $120/yr | 1 credit/month, saved profiles, member pricing (20% off extra patterns), sew-along access, fit notes |
| Wardrobe | $24/mo | $240/yr | 3 credits/month, early access to new patterns, fit revision credits, bundle discounts, premium exports (A0/projector) included |

**Credits:** 1 credit = 1 pattern download regardless of tier. Unused credits roll over for 3 months then expire. Additional credits can be purchased at member pricing.

**Member Pricing:** Members get 20% off any additional pattern purchase beyond their monthly credits.

### Why This Works

- $9 simple patterns are impulse-buy territory — low enough to try without stress
- $14 core patterns are the anchor — most purchases will be here
- $19 tailored patterns justify the premium through complexity and unique value
- $12/mo Club is cheaper than current $13 but limited to 1 credit — sustainable
- $24/mo Wardrobe is for active sewists who make 2-3 garments monthly
- Annual pricing at 2 months free incentivizes commitment
- No unlimited tier — protects margins while catalog is small

### Free Tier (stays the same)
- Generate any pattern — free, no account needed
- View pattern pieces, materials, instructions on screen — free
- Download print-ready PDF — requires account + payment or credits

### First-Purchase Offer
- FIRST50: 50% off first pattern for new accounts
- Or: 1 free pattern credit on signup (simpler, no code needed)
- Recommend: free first credit — cleaner, more generous, converts better

---

## Pricing by Garment

| Garment | Tier | Price |
|---------|------|-------|
| Gym Shorts | Simple | $9 |
| Swim Trunks | Simple | $9 |
| Tee | Simple | $9 |
| Fitted Tee (W) | Simple | $9 |
| Slip Skirt (W) | Simple | $9 |
| Easy Pant (W) | Simple | $9 |
| Cargo Shorts | Core | $14 |
| Straight Jeans | Core | $14 |
| Chinos | Core | $14 |
| Sweatpants | Core | $14 |
| Camp Shirt | Core | $14 |
| Crewneck | Core | $14 |
| A-Line Skirt (W) | Core | $14 |
| Straight Trouser (W) | Core | $14 |
| Wide-Leg Trouser (W) | Core | $14 |
| Shell Blouse (W) | Core | $14 |
| Pleated Shorts | Tailored | $19 |
| Pleated Trousers | Tailored | $19 |
| Hoodie | Tailored | $19 |
| Crop Jacket | Tailored | $19 |
| Button-Up (W) | Tailored | $19 |
| Shirt Dress (W) | Tailored | $19 |
| Wrap Dress (W) | Tailored | $19 |

---





---

## Human Tasks
- [ ] Create new Stripe products for each tier
- [ ] Create Stripe subscription products for Club and Wardrobe
- [ ] Create bundle products in Stripe
- [ ] Create FIRST50 coupon in Stripe (50% off, single use)
- [ ] Update the pricing page content
- [ ] Decide on credit rollover policy (recommend 3 months)
- [ ] Define what "member pricing" means for extra purchases (20% off)
- [ ] Set up annual billing in Stripe with the discount
