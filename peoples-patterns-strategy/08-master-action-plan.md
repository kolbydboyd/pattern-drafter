# People's Patterns — Master Action Plan

## The Single Most Important Thing

**Fit trust.**

Not code. Not features. Not catalog size. Not branding. If people believe "this site helps me make clothes that fit my real body," you have a business. If they don't, nothing else matters.

Everything in this plan serves that one goal.

---

## Your Real Competitive Position

You are NOT:
- The cheapest custom-fit patterns (Bootstrap Fashion is cheaper)
- The only custom-fit pattern app (FreeSewing, Lekala, Sewist, Apostrophe exist)
- Pattern drafting software (Seamly2D, Tailornova are more powerful)
- A giant library (Seamwork has 250+)

You ARE:
- The fastest path from body measurements to a wearable garment
- The simplest UX for custom-fit (no drafting knowledge needed)
- A brand built on proven fit with sewn examples and real feedback
- A personal, trustworthy voice in a space full of faceless companies

Your positioning: **"The easiest way for home sewists to make clothes that actually fit their body."**

---

## What's Been Done

- [x] 23 garment modules built
- [x] Pattern generation engine working
- [x] Print layout with tiling
- [x] Supabase backend (auth, profiles, purchases)
- [x] Stripe checkout configured
- [x] Email sending via Resend
- [x] Vercel serverless functions
- [x] Domain: peoplespatterns.com
- [x] All social handles secured
- [x] Brand kit complete (fonts, colors, avatars, banners)
- [x] Branding applied across app
- [x] Security fix: purchase bypass patched
- [x] Ease distribution bug fixed
- [x] Waist measurement integrated into tailored pants
- [x] Polygon sanitizer added
- [x] SA offset logic unified
- [x] Notches added to launch patterns
- [x] Sleeve cap to armhole validation added
- [x] README updated to reflect actual architecture
- [x] Documentation synced with codebase

---

## What Must Happen Before Launch

### Critical (launch blockers)

- [X] **Make repo private on GitHub** — your entire business logic is publicly visible
- [X] **Wire peoplespatterns.com to Vercel** — DNS records in Porkbun
- [ ] **Sew muslins for 6 launch patterns** — cargo shorts, straight jeans/pants, tee, camp shirt, a-line skirt, slip skirt
- [ ] **Photograph sewn samples** — multiple angles, fit details, on body
- [ ] **Fix any fit issues found during muslin testing** — this is the whole point
- [ ] **Test the full purchase flow end-to-end** — checkout, webhook, PDF generation, download, re-download
- [ ] **Test print layout at 1:1 scale** — verify scale square, verify tiles assemble correctly, verify no clipping
- [X] **Update pricing in Stripe** — new 3-tier structure ($9/$14/$19), bundles, membership tiers

### Important (should do before public promotion)

- [ ] **Add sewn sample photos to pattern pages** — biggest trust signal
- [ ] **Create individual pattern pages** with SEO meta tags
- [ ] **Create FAQ page** with schema markup
- [ ] **Create the first 3 blog articles** from YouTube video transcripts
- [ ] **Set up Google Search Console** and submit sitemap
- [ ] **Set up email flows** — at minimum: welcome, generated-not-purchased, fit feedback request
- [ ] **Create Google Form for fit feedback** (interim before built-in system)
- [ ] **Film "how to measure yourself" video** — your #1 content asset
- [ ] **Film "how People's Patterns works" video** — product demo
- [ ] **Post branded avatars and banners** to all social accounts

### Nice to Have (do after launch)

- [ ] React/Tailwind migration
- [ ] Projector file support
- [ ] A0 file upsell
- [ ] Starter kit physical product
- [ ] Referral program
- [ ] Community sew-along events
- [ ] Mobile app
- [ ] Commercial use license tier
- [ ] Kids sizing

---

## 30-Day Launch Plan

### Week 1: Prove Fit
- Day 1-2: Cut and sew tee muslin, photograph results
- Day 3-4: Cut and sew cargo shorts muslin, photograph results
- Day 5-6: Cut and sew pants muslin, photograph results
- Day 7: Fix any math issues found, push updates
- Film everything — this is content

### Week 2: Polish and Prepare
- Wire domain to Vercel
- Make repo private
- Add sewn photos to pattern pages
- Create FAQ page
- Film "how to measure" and "how it works" videos
- Set up Google Search Console
- Set up email capture and welcome flow
- Test full purchase flow end-to-end
- Update pricing in Stripe

### Week 3: Content + Soft Launch
- Publish first YouTube video ("how to measure yourself")
- Write and publish first blog article
- Create 5-10 Pinterest pins
- Post on Instagram — sewing workspace, first makes
- Start answering questions on Reddit (no product mention yet)
- Post daily TikTok/Reels from filming sessions
- Send first newsletter to email list

### Week 4: Public Launch
- Publish YouTube product demo video
- Post on Reddit: "I built a free custom-fit pattern generator — would love feedback"
- Share in sewing Facebook groups
- Publish "custom-fit cargo shorts sew-along" video
- Daily TikTok/Reels content
- Pinterest pins for every pattern
- Send launch email to full list
- Collect feedback actively
- Respond to every comment and message personally

---

## Revenue Targets

### Month 1-3 (validation)
- 50-100 email signups
- 20-50 fit feedback submissions
- 10-30 paid pattern downloads
- Revenue: $100-500/month
- Goal: prove people will pay and patterns fit

### Month 4-6 (growth)
- 500+ email subscribers
- 100+ paid downloads
- 10-30 active subscribers
- Revenue: $500-2,000/month
- Goal: consistent revenue, growing email list

### Month 7-12 (scaling)
- 2,000+ email subscribers
- 500+ total paid downloads
- 50-100 active subscribers
- Revenue: $2,000-5,000/month
- Goal: $50K-60K annual run rate

### Year 2
- Target: $100K annual revenue
- Requires: ~640 subscribers at $13/mo average OR ~11,000 pattern sales at $9 average
- Realistically: mix of subscriptions + one-off purchases + upsells + affiliates

---

## From the Report: Things Not Covered Elsewhere

### Export Formats (future)
Consider a canonical internal representation beyond SVG/PDF so you can later export to: A0/plotter, projector sewing files, DXF for CAD software, and adaptive outputs. Not a launch priority but think about it architecturally.

### Legal / IP
Sewing patterns have limited copyright protection in the US — functional aspects aren't protected the same way as expressive works. Your real protection is: brand trust, ongoing updates, community, and making the legitimate version easier than pirating. Don't over-invest in DRM. The watermark + account stamping you have is sufficient.

### Privacy Consideration
You're storing body measurements in Stripe session metadata (copied to a third-party payment system). Consider minimizing this — store measurements only in your own database, pass only a reference ID to Stripe. Not urgent but worth doing before you scale.

### Schema Migration Risk
Your schema.sql has migration columns as "run once" comments while API code depends on those columns. Document the required schema state clearly, or use a proper migration tool (like Supabase migrations) to prevent deployment drift.

### Documentation Trust
The audit found that docs don't match code in several places. Every time you make a code change, update the corresponding doc. Stale docs erode trust — both for you (you'll forget what's true) and for anyone you bring on later.

---

## The Solo Founder Playbook

Your edge is taste, speed, and focus. Not breadth.

**Do this:**
- Own one sharp promise: "clothes that fit your real body"
- Launch 4-6 hero patterns with proof
- Over-document fit proof (photos, measurements, feedback)
- Build in public (show the process, not just the product)
- Make every buyer feel close to the product
- Use content as trust infrastructure
- Keep ops light
- Respond to every customer personally

**Don't do this:**
- Don't chase every channel equally
- Don't expand the catalog before proving fit
- Don't build a mobile app yet
- Don't order physical inventory until you have demand signal
- Don't offer unlimited membership with a small catalog
- Don't position as "AI for sewing" — position as "custom fit made simple"
- Don't compare yourself to FreeSewing or Bootstrap Fashion — your category is UX and trust, not technology
- Don't spend money on ads until organic is working

---

## Daily Routine Once Launched

- Morning: check emails, respond to feedback and questions
- Midday: post 1 TikTok/Reel, 1 Instagram story
- Evening: 1-2 hours of either sewing (content creation) OR coding (feature development)
- Weekly: 1 YouTube video publish, 5-10 Pinterest pins, 1 newsletter
- Monthly: 1 new pattern drop, 1 capsule suggestion, review metrics

---

## What Success Looks Like in 90 Days

- 6 patterns with sewn sample photos and fit proof
- 100+ email subscribers
- 20+ fit feedback submissions
- First 10 paid customers
- YouTube channel with 5+ videos
- Consistent daily posting on TikTok/Instagram
- Reddit presence established
- Pinterest driving passive traffic
- peoplespatterns.com live and functional
- You are wearing clothes you made from your own patterns

That last one is the most important. If you're wearing it, you can sell it.

---

## Reference: All Strategy Documents

1. **01-email-flows.md** — All 8 email templates, written and formatted, with Claude Code prompts for implementation
2. **02-social-media-strategy.md** — Platform strategies, content calendars, post ideas, schedules
3. **03-website-seo.md** — Site structure, keywords, pattern pages, blog system, technical SEO
4. **04-retention-features.md** — Saved profiles, fit feedback, project history, recommendations, wardrobe progress
5. **05-sales-funnel.md** — Full funnel from discovery to repeat purchase with tactics per stage
6. **06-upsell-crosssell-downsell.md** — Revenue maximization per customer touchpoint
7. **07-pricing-strategy.md** — Three-tier pricing, bundles, membership tiers, per-garment pricing
8. **08-master-action-plan.md** — This document: everything in one place

---

*People's Patterns. Made to your measurements, not a size chart. Go sew.*
