# People's Patterns — Customer Retention Features

## Core Retention Loop

```
Save measurements → Buy pattern → Sew it → Give feedback → Get recommendation → Buy next pattern
```

The moat is not the pattern engine. The moat is the saved measurement profile that makes every subsequent purchase faster and more confident.

---

## Feature 1: Saved Measurement Profiles

**What:** Users save their body measurements under named profiles. One account can have multiple profiles (self, partner, kids, clients).

**Why it retains:** Entering measurements is the biggest friction point. Once saved, every future pattern is 2 clicks — pick garment, generate. Leaving means re-measuring and re-entering everything.

**Claude Code Prompt:**

*"Enhance the saved measurement profiles system. In the account dashboard, show a 'My Profiles' section that lists all saved measurement profiles with: profile name, key measurements displayed (chest, waist, hip), date created, date last used, and a count of patterns generated from this profile. Add an 'Edit' button for each profile. Add a 'New Profile' button. When generating a pattern, if the user is logged in and has profiles, show a profile selector at the top of the measurement step that auto-fills all fields. Track which profile was used for each purchase in the purchases table (add profile_id column if not present). Show 'Patterns made with this profile' list on each profile page. Stage and commit with message 'enhanced measurement profiles with usage tracking'. Do not push."*

---

## Feature 2: Fit Feedback System

**What:** After sewing a pattern, users submit structured feedback: what fit well, what didn't, what they'd change. This data improves the pattern math over time.

**Why it retains:** Users feel heard. Their feedback makes the next pattern better. This creates investment in the platform — they've contributed to improving it.

**Claude Code Prompt:**

*"Create a fit feedback system. Add a Supabase table 'fit_feedback' with columns: id (uuid), user_id (uuid), purchase_id (uuid), garment_id (text), profile_id (uuid), overall_fit (enum: perfect/good/needs_adjustment/poor), specific_feedback (jsonb — keys like waist_fit, hip_fit, length, shoulder, armhole each with values: perfect/too_tight/too_loose/too_long/too_short), notes (text), photo_url (text, optional), created_at (timestamp). Create api/submit-feedback.js that accepts and stores the feedback. In the account dashboard under each purchased pattern, show a 'How did it fit?' button that opens a feedback form with: overall rating selector, body-area-specific fit dropdowns, free-text notes field, and optional photo upload. After submitting, show a thank you message and recommend the next pattern. Stage and commit with message 'fit feedback system'. Do not push."*

---

## Feature 3: Pattern Notes and Project History

**What:** Users can add notes to their purchased patterns: "used cotton lawn", "took in 1 inch at waist", "perfect for summer". Creates a personal sewing journal.

**Why it retains:** Turns the account into a reference library. Users come back to check their notes before starting a similar project.

**Claude Code Prompt:**

*"Add pattern notes to purchased patterns. In the account dashboard, each purchased pattern shows a 'My Notes' text area that saves automatically (debounced, saves to Supabase purchases table in a 'notes' jsonb column). Users can record: fabric used, modifications made, fit adjustments, what they'd do differently. Show these notes when the user re-downloads or views the pattern. Also add a 'My Projects' page in the account section that shows all purchased patterns as cards with: garment name, date purchased, profile used, fit feedback status (submitted / not yet), notes preview, and a 'Sew Again' button that re-generates the pattern with the same measurements. Stage and commit with message 'pattern notes and project history'. Do not push."*

---

## Feature 4: Recommended Next Pattern

**What:** After purchasing or providing fit feedback, suggest 2-3 patterns that use the same body block and would fit with the same confidence.

**Why it retains:** Reduces decision fatigue. Users see a clear path to their next project.

**Claude Code Prompt:**

*"Add pattern recommendations based on body block. Create src/engine/recommendations.js that maps garment IDs to their body block: lower-body-block (cargo-shorts, gym-shorts, swim-trunks, pleated-shorts, straight-jeans, chinos, pleated-trousers, sweatpants, wide-leg-trouser-w, straight-trouser-w, easy-pant-w), upper-body-block (tee, camp-shirt, crewneck, hoodie, crop-jacket, button-up-w, shell-blouse-w, fitted-tee-w), combined-block (shirt-dress-w, wrap-dress-w), skirt-block (slip-skirt-w, a-line-skirt-w). Export a function getRecommendations(garmentId, purchasedIds) that returns 3 garments from the same block that the user hasn't purchased yet. On the pattern output page after generation, show a 'Your measurements also work for:' section with 3 recommended pattern cards. On the post-purchase confirmation page, show the same recommendations. In the 'next pattern recommendation' email, use this function to populate the suggestions. Stage and commit with message 'pattern recommendations by body block'. Do not push."*

---

## Feature 5: Wardrobe Progress / Capsule Suggestions

**What:** Show users how many garments they've made from their profile, suggest capsule combinations, celebrate milestones.

**Why it retains:** Gamification without being cheesy. Users see progress and want to complete their wardrobe.

**Claude Code Prompt:**

*"Add wardrobe progress tracking to the account dashboard. Show a 'My Wardrobe' section that displays: total patterns purchased, total patterns with positive fit feedback, a visual grid of garment category icons (pants, shorts, tops, skirts, dresses, outerwear) with filled/unfilled states based on what the user has purchased. Below the grid, suggest 'Complete your wardrobe' with the next unpurchased category and a recommended starter pattern from that category. Add milestone messages: '1st pattern — welcome to custom fit!', '3 patterns — building a wardrobe', '5 patterns — capsule complete', '10 patterns — true custom wardrobe'. Show these on the dashboard. Stage and commit with message 'wardrobe progress and capsule suggestions'. Do not push."*

---

## Feature 6: Re-Generation with Updated Measurements

**What:** If a user's body changes (weight loss/gain, pregnancy, aging), they update their profile and re-generate all their patterns with new measurements.

**Why it retains:** The purchased patterns grow with the user. They never need to re-buy for size changes.

**Claude Code Prompt:**

*"Add pattern re-generation for updated measurements. When a user edits a measurement profile, show a banner: 'Your measurements changed. Would you like to re-generate your patterns with updated measurements?' with a 'Re-generate All' button. This iterates through all purchases linked to that profile and calls the garment module's pieces() with the new measurements, then regenerates the PDF. For free/beta users, allow unlimited re-generation. For paid users, re-generation of purchased patterns is always free (they already paid for the pattern). Track the re-generation in the purchases table with a 'last_regenerated_at' timestamp. Show 'Updated [date]' on re-generated patterns in the account dashboard. Stage and commit with message 'pattern re-generation on measurement update'. Do not push."*

---

## Human Tasks
- [ ] Create the Google Form for fit feedback (interim before the built-in system)
- [ ] Write the fit feedback request email copy
- [ ] Define capsule wardrobe combinations for each body type
- [ ] Plan the milestone reward system (future: discount codes for milestones?)
- [ ] Decide on commercial use license terms
