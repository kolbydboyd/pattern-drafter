# People's Patterns — Email Flows

## Tech Stack
- **Resend** for transactional email sending
- **Supabase** for subscriber lists, purchase records, and trigger logic
- **Vercel API routes** for webhook-triggered sends

---

## Flow 1: Welcome + Measurement Guide

**Trigger:** User signs up or enters email on download gate
**Delay:** Immediate

**Subject:** Welcome to People's Patterns — let's get your measurements right

**Body:**
```
Hey!

Welcome to People's Patterns. You just joined a community of sewists who are done guessing with standard sizes.

Here's the one thing that makes everything work: accurate measurements.

If your measurements are right, your pattern will fit. If they're off, nothing else matters. So before you generate your first pattern, take 5 minutes and measure yourself properly.

Here's what you need:
- A flexible tape measure (not a metal one)
- A friend helps, but you can do it solo
- Measure over underwear, not over clothes

The key measurements:
→ Chest: around the fullest part, under your arms, tape level
→ Waist: around your natural waist, where you bend side to side
→ Hip: around the fullest part of your seat, standing relaxed
→ Rise: sit on a flat chair, measure your side from waist to the chair
→ Inseam: inside leg, crotch to where you want the hem

We have a full guide with diagrams at peoplespatterns.com — click "How to Measure" on any pattern page.

Your measurements are saved to your profile. Enter them once, use them for every pattern.

Go make something that fits.

— Kol, People's Patterns
peoplespatterns.com
```

---

## Flow 2: Generated But Not Purchased

**Trigger:** User generated a pattern but didn't download/purchase within 24 hours
**Delay:** 24 hours after generation

**Subject:** Your custom pattern is still waiting

**Body:**
```
Hey — you generated a custom [GARMENT_NAME] pattern yesterday with your measurements.

That pattern was built specifically for your body. Nobody else has that exact combination of [CHEST/WAIST/HIP] measurements with [FIT_OPTION] fit.

It's ready to download whenever you are.

→ Download your [GARMENT_NAME] pattern: [LINK]

If you're not sure about printing, here's a quick tip: print page 2 first (the scale verification page) and measure the test square. If it's exactly 2 inches, you're good. If not, check that your printer is set to 100% scale, not "fit to page."

Questions? Just reply to this email.

— People's Patterns
```

---

## Flow 3: Cart / Checkout Abandon

**Trigger:** User started checkout but didn't complete payment
**Delay:** 1 hour after abandon

**Subject:** You're one click away from your custom pattern

**Body:**
```
Looks like you started checking out for your [GARMENT_NAME] pattern but didn't finish.

No pressure — your pattern and measurements are saved. When you're ready:

→ Complete your purchase: [CHECKOUT_LINK]

If something went wrong with payment, or if you have questions about what's included, just reply here.

Every pattern includes:
✓ Print-ready tiled PDF (US Letter or A4)
✓ Full materials and stitch guide
✓ Step-by-step construction instructions
✓ Scale verification page
✓ Your exact measurements built in

— People's Patterns
```

---

## Flow 4: Purchased But Not Downloaded

**Trigger:** Payment confirmed but PDF not downloaded within 48 hours
**Delay:** 48 hours after purchase

**Subject:** Don't forget to download your pattern

**Body:**
```
Hey — you purchased your [GARMENT_NAME] pattern but haven't downloaded it yet.

Your pattern is ready and waiting in your account:

→ Download now: [DOWNLOAD_LINK]

Quick printing checklist:
1. Print at 100% scale (never "fit to page")
2. Check the scale verification square on page 2
3. Cut along the scissors line on each tile
4. Match the crosshair marks between tiles
5. Tape from the back

You can re-download anytime from your account.

— People's Patterns
```

---

## Flow 5: Post-Purchase Sew Help

**Trigger:** 3 days after download
**Delay:** 3 days

**Subject:** Tips for sewing your [GARMENT_NAME]

**Body:**
```
By now you might be getting ready to cut and sew your [GARMENT_NAME]. A few tips:

Cut a muslin first. Seriously. Use cheap fabric (muslin is $4-6/yard) to test the fit before cutting your good fabric. It takes 30 minutes and saves hours of frustration.

When you sew:
- Press every seam as you go (iron down, lift, don't slide)
- Match your notch marks — they're there so pieces align correctly
- Check the materials guide for the right needle and stitch settings

The construction steps are numbered in order. Don't skip ahead. Step 1 before step 2. Each step builds on the last.

If something doesn't fit right on the muslin, reply to this email and tell me what happened. I'll help you figure out the adjustment.

— Kol, People's Patterns
```

---

## Flow 6: Fit Feedback Request

**Trigger:** 14 days after download
**Delay:** 14 days

**Subject:** How did it fit?

**Body:**
```
It's been about two weeks since you downloaded your [GARMENT_NAME] pattern. I'm hoping you've had a chance to sew it up (or at least cut a muslin).

I'd love to hear how it went. Your feedback directly improves the pattern math for everyone.

→ Share your feedback (takes 2 minutes): [FEEDBACK_FORM_LINK]

Even a quick "it fit great" or "the waist was too loose" helps enormously. And if you have a photo of the finished garment, I'd love to see it.

If you ran into any issues — printing, cutting, sewing, fit — reply here. I read every email.

— Kol, People's Patterns
```

---

## Flow 7: Next Pattern Recommendation

**Trigger:** 21 days after purchase (or after positive fit feedback)
**Delay:** 21 days or triggered by feedback

**Subject:** Your measurements are ready for your next project

**Body:**
```
Your measurement profile is saved and ready to go. That means your next pattern is even faster — no measuring, just pick a style and generate.

Based on your [GARMENT_NAME], these patterns use the same body block and will fit with the same confidence:

[RECOMMENDED_PATTERN_1] — [SHORT_DESCRIPTION]
[RECOMMENDED_PATTERN_2] — [SHORT_DESCRIPTION]
[RECOMMENDED_PATTERN_3] — [SHORT_DESCRIPTION]

→ Browse all patterns: peoplespatterns.com

Building a wardrobe from one measurement profile is where People's Patterns really shines. Every garment fits the same body — yours.

— People's Patterns
```

---

## Flow 8: Monthly Newsletter / New Release

**Trigger:** Monthly, 1st of each month
**Delay:** Scheduled

**Subject:** [MONTH] at People's Patterns — [HIGHLIGHT]

**Body:**
```
What's new this month:

🧵 NEW PATTERN: [GARMENT_NAME]
[One-line description]. [Difficulty]. [Key feature].
→ Generate yours: [LINK]

📐 FIT UPDATE
We updated the [BLOCK_NAME] block based on feedback from [X] sewists. [What changed and why].

📺 NEW TUTORIAL
[Video title] — [what it covers]
→ Watch: [YOUTUBE_LINK]

💬 FROM THE COMMUNITY
[Featured make or testimonial or interesting feedback]

Coming next month: [TEASER]

— Kol, People's Patterns
peoplespatterns.com | @peoplespatterns
```

---
