# Changelog

All notable changes are documented here, newest first.

---

## [0.12.20] - 2026-04-11

### Fixed
- Rear patch pocket outline no longer extends past the side seam cut line on narrower measurements or yoke-split back panels. Pocket inner offset is now clamped to keep all vertices at least 0.5 inches inside the side seam.

---

## [0.12.19] - 2026-04-10

### Fixed
- Back Lower Panel distortion when yoke is enabled (soloist jeans, any jeans with yoke). `splitBackYoke()` was using `hipWidth` for the yoke side seam instead of the correct interpolated x on the waist-to-hip taper line. This made the top of the lower panel too wide and the side seam vertical instead of diagonal.
- Back Yoke piece now uses `waistWidth` at the waist edge and the correct interpolated x at the yoke seam, matching the original back panel side seam geometry.
- Curved yoke seam control points now originate from the correct side seam position.

### Added
- Scoop pocket bag now shows a horizontal fold line at the scoop depth.
- `renderGenericPieceSVG` now supports `marks` array for fold line indicators on bodice-type pieces.

---

## [0.12.18] - 2026-04-10

### Added
- New "Square scoop" front pocket option for all jeans patterns. The pocket opening uses an L-shaped cut (vertical drop, rounded 90-degree corner, horizontal run to side seam) instead of the smooth J-curve of the regular scoop. Available in the Front Pockets dropdown on Straight Jeans, Soloist Jeans, and other jeans variants.
- Soloist Jeans now defaults to the square scoop pocket style.

---

## [0.12.17] - 2026-04-10

### Fixed
- `fmtInches()` no longer crashes when called with `undefined` or `NaN`. Returns `"0″"` instead of throwing `s.toFixed is not a function`. This was the direct cause of the "undefined is not an object (evaluating 's.toFixed')" error on all jeans patterns.
- All jeans modules (`straight-jeans.js`, `baggy-jeans.js`) now fall back to safe defaults for `m.waist` and `m.hip` when measurements are missing or zero.
- Lower-body overview line in the pattern view now guards `fmtInches` calls behind truthiness checks, matching how upper-body patterns already worked.

---

## [0.12.16] - 2026-04-10

### Fixed
- All garments now load correctly in the wizard flow. `readInputs()` was reading from side panel inputs (`m-*`, `o-*`) which don't exist when using the wizard. Now uses the `_el()` helper to try wizard inputs (`wz-*`) first. This was the root cause of the "undefined is not an object (evaluating 's.toFixed')" error on straight jeans, baggy jeans, soloist jeans, sweatpants, and other garments.
- Added `|| default` fallbacks for `parseFloat` calls in `baggy-jeans.js` and `sweatpants.js` for defensive safety.

---

## [0.12.15] - 2026-04-10

### Fixed
- Soloist Jeans no longer fails to load. Five unguarded `parseFloat` calls in `straight-jeans.pieces()` (`sa`, `hem`, `frontExt`, `backExt`, `cbRaise`) could return NaN when DOM inputs were absent, corrupting polygon coordinates in `buildPanel()` and `splitBackYoke()`. Added `|| default` fallbacks matching the pattern from the prior `yokeDepth` fix. Straight Jeans is unaffected because it defaults `yokeStyle: 'none'` and never enters the yoke split path.

---

## [0.12.14] - 2026-04-10

### New
- **Back yoke for jeans** — `straight-jeans.js` gains `yokeStyle` (none/pointed/curved) and `yokeDepth` options. When enabled, the full back panel splits into a shaped Back Yoke and Back Lower Panel. Pointed V yoke uses straight-line seam. Curved yoke uses a bezier arc. Yoke seam replaces waist darts. SA, notches, and flat-fell construction instructions included.
- Soloist Jeans defaults to pointed V yoke (`yokeStyle: 'pointed'`).
- **Fly shield J-curve** — Fly shield is now a shaped polygon with a proper quarter-circle J-curve at the bottom instead of a plain rectangle. Height sized to fly opening length (60% of rise + 1"). Cut 2 (outer + lining) with interfacing.

### Fixed
- Belt loop dimensions now show the CUT size (2.25" x 3.5" strip) instead of the finished size. Instruction explains fold-in-thirds construction to reach 0.75" finished width.
- Yoke side seam depth increased from 0.5" to 1.5" for correct proportions and clean SA offset geometry. Yoke renders as `bodice` type. Lower panel stays as `panel` type (retains crotch curve rendering).
- Back pocket changed from rectangular welt to pentagon-shaped patch pocket (5.5" x 6.5") with pointed bottom. Instructions updated for patch pocket construction with cardboard press template.
- Front pocket facing depth: 7" (1" below the 6" opening). Pocket bag (lining) stays at full 11.5" depth with scoop curve, cut on fold at inner edge.
- Piece-specific seam allowances: back patch pocket 3/8" sides/bottom + 1/2" top (pressed under); fly shield 1/4" (sewn RST and turned, 0 on CF edge); coin pocket 3/8". Main panel seams stay at 5/8".
- Back pocket placement overlay on back panel: pentagon shape (5.5" x 6.5") at correct position (2" from CB, 3" below waist) tilted 5° with outer/side seam edge higher.
- Back pocket type corrected from welt to patch. Instructions updated for cardboard press template construction.

---

## [0.12.13] - 2026-04-09

### New
- Founder's Select tab in admin dashboard with personal wardrobe system
- Fabric sourcing guide: 18 garments with fabric type, weight, yardage, colors (Deep Autumn palette), notions, sewing tips
- Local Houston store guide (Mood Fabrics, Hobby Lobby, JoAnn, Fabrictopia, Universal Fabric Center)
- Online store directory (8 curated shops with per-garment recommendations)
- Editable measurement profile: fill in, update, and save all body measurements directly from the admin tab (upper body, lower body, full body with optional fields). Creates a new Supabase profile or updates existing one.
- Pattern shortcut links on every garment card (direct to /patterns/{slug})
- Deep Autumn color palette reference (neutrals, core, accents with hex codes) with collapsible toggle

### Fixed
- Profile selection in pattern generator now updates both wizard and side panel measurement inputs (was only updating side panel)
- Accordion expand/collapse and garments vs store guide sub-tab switching

---

## [0.12.12] - 2026-04-08

### New
- **Open Cardigan / Shacket** (`open-cardigan.js`) — oversized open-front drop-shoulder layer. Back on fold, two separate front panels (open at CF), shallow cap sleeves, optional patch pockets and shawl collar. Hip or mid-thigh length, +7-10″ ease. Variants: Duster Cardigan, Shacket.
- **Chore Coat / Overshirt** (`chore-coat.js`) — boxy hip-length woven overshirt with set-in sleeves and button placket (+1.5″ CF extension). Camp or band collar, chest flap pockets, lower patch pockets, optional barrel cuffs. +6-9″ ease. Variants: Linen Overshirt, Canvas Work Coat.
- **Wide-Leg Trouser (M)** (`wide-leg-trouser-m.js`) — men's version of the existing wide-leg trouser. Same `buildPanel()` geometry and crotch curve math as the women's version; adjusted defaults for men's proportions (10″ rise, +4″ ease, flat front, smaller crotch extensions). Variant: Pleated Trouser (M).
- **Henley** (`henley.js`) — crew-neck top with 3-button vertical placket at CF. Bodice geometry identical to `tee.js`. Adds a separate placket facing piece (2.5″ × 7.5″, cut 4). Works in woven or knit. Variant: Long Sleeve Henley.
- 10 new SVG illustrations: `open-cardigan`, `chore-coat`, `wide-leg-trouser-m`, `henley`, plus 6 variant illustrations.
- SEO descriptions for all 10 new catalog entries.
- Base module count: 43 → 47. Total catalog entries (including variants): ~81 → ~91.

---

## [0.12.11] - 2026-04-08

### New
- Fit Reference Library: users can reference a brand/size they know fits to auto-set ease
- `src/lib/fit-library/` module with profiles, brand data, and derivation API
- 15 curated brand entries (Levi's 501/511/550, Abercrombie women's/men's, Wrangler, Dockers, J.Crew, Uniqlo, Hanes, Gildan, Champion) covering jeans, chinos, tees, hoodies, sweatshirts
- "Measure a garment" flat-lay path: enter across-measurements, ×2 conversion is automatic
- Community submissions: users can submit their own garment measurements to Supabase
- Community tab in fit reference UI shows approved submissions sorted by helpfulness
- Supabase migration `010_community_garments.sql` with RLS and increment helper function
- Ease snapping: derived numeric ease snaps to nearest named profile (slim/regular/relaxed/oversized) — works with all existing garment modules, no changes required
- Stretch detection: warns when reference garment implies stretch fabric and clamps to minimum woven ease
- Kibbe body types proportion guide article in the Fit category of /learn

---

## [0.12.10] - 2026-04-08

### Improved
- Bone shapes sourced from anatomical reference SVGs (full shapes, no half+mirror)
- Simpler bone scaling: normalized path data scaled directly to body dimensions
- Both pelvis pieces now have accurate obturator foramina (holes) from compound paths

### New
- Scoop (curved inset) pocket option for all jeans variants (geometry.js, straight-jeans.js)
- `clipPanelAtScoop`, `buildScoopPocketBacking`, `buildScoopPocketBag` in geometry engine
- Soloist Jeans defaults to scoop pockets (matching the reference garment)

---

## [0.12.9] - 2026-04-06

### New
- Search input on patterns listing page. Filters by name, category, and difficulty in real time.

---

## [0.12.8] - 2026-04-06

### New
- Soloist Jeans garment module with parametric skeleton bone vinyl templates
- Bone templates (pelvis front/back, femur, knee, tibia) scale with body measurements (hip, inseam, thigh, rise)
- New 'template' piece type for vinyl/applique cut guides in both browser preview and PDF output
- Browser preview includes per-bone SVG download links for direct Cricut import
- Materials list includes HTV vinyl and application instructions

---

## [0.12.7] - 2026-04-06

### SEO and crawlability improvements
- Pre-render /patterns listing page at build time with full catalog content, category sections, pricing, and ItemList JSON-LD schema
- Pre-render /learn listing and all article detail pages at build time with Article, FAQPage, BreadcrumbList, and CollectionPage JSON-LD schemas
- Add 5 SEO landing pages targeting high-intent search queries: made-to-measure-sewing-patterns, custom-sewing-patterns-from-measurements, made-to-measure-mens-sewing-patterns, made-to-measure-womens-sewing-patterns, how-made-to-measure-sewing-patterns-work
- Update robots.txt to explicitly allow AI search crawlers (OAI-SearchBot, ChatGPT-User, Applebot-Extended, ClaudeBot, PerplexityBot, anthropic-ai, Bytespider) and disallow /admin
- Add all landing pages to sitemap with priority 0.7-0.8
- Update build chain to run new pre-render scripts after vite build
- Add Vercel rewrites for landing pages
- Build-time sitemap and learn page pre-render now fetch articles from Supabase (with static fallback)

---

## [0.12.6] - 2026-04-06

### New
- Standalone fit feedback page at /feedback with interactive body map
- Email feedback links now point to /feedback instead of account dashboard
- Email quick select options (perfect, adjusted, wip) pre fill the overall fit dropdown
- API now auto looks up purchase when only garmentId is provided
- Body map added to general customer feedback modal (My Patterns tab)
- API accepts new body map zone keys: neck_fit, sleeve_fit, rise_fit

---

## [0.12.5] - 2026-04-06

### Improved
- Tester feedback modal now uses an interactive SVG body map instead of dropdown selects for fit rating
- Clickable body zones with color coded fit status (perfect, too tight, too loose, too long, too short)
- Front/back view toggle to rate all body areas
- Per zone notes and "adjusted after sewing" checkbox
- New reusable body map widget in src/ui/body-map.js

---

## [0.12.4] - 2026-04-06

### Fixed
- Cron email schedule changed from 9 AM UTC (4 AM Eastern) to 2 PM UTC (10 AM Eastern) so users stop receiving emails at 4 AM

---

## [0.12.3] - 2026-04-05

### New garment: 874 Work Pants
- Based on chinos module with 874-specific adaptations
- High rise default (+1.5", 11.5" effective), relaxed fit (+6" ease), slight taper (0.95/0.90 knee/hem ratios)
- 1.75" finished waistband with hook-and-eye + button closure, +2" overlap
- 7 tunnel belt loops (1" finished width)
- Double-stitch + edge finish seam construction throughout
- Center crease option (default on) with pressing instructions
- Era option: classic (pre-2010 heavier USA-made twill) vs modern (current lighter blend)
- Slant front pockets, welt back pockets with button

---


## [0.12.2] - 2026-04-05

### Fix patterns page load failure
- Patterns listing page now renders the grid immediately instead of waiting for user data (auth, purchases, wishlist) to load first. Owned badges and wishlist hearts update once user data arrives.
- Added 6 second timeout to Supabase calls in `_loadUserData()` so the page cannot hang indefinitely if auth or DB requests stall.
- Added `.catch()` to the `renderPatternListing()` call to prevent unhandled promise rejections from leaving the page blank.

---

## [0.12.1] - 2026-04-05

### Email verification flow
- After signup, users now see a "Check your email" verification screen instead of being immediately logged in.
- Unverified users (no `email_confirmed_at`) are blocked from appearing signed in via `onAuthStateChange` and session restore.
- `onAuthStateChange` callback now receives the Supabase event type for more precise auth state handling.
- Added `.auth-verify`, `.auth-verify-icon`, `.auth-verify-text`, `.auth-verify-hint`, and `.auth-btn-secondary` CSS classes.

---

## [0.12.0] - 2026-04-03

### Email marketing system (code complete, not yet live)
- **5-email welcome sequence** - Day 0 (how to measure), Day 2 (what to expect), Day 5 (tiled PDFs), Day 9 (beginner patterns), Day 13 (community fit tips). Drip schedule stored in `welcome_sequence` table, delivered via daily cron.
- **Email opt-in UI** - shown after free pattern redemption (app.js) and on all purchase success pages (success.html). Pre-fills user email, posts to new `/api/email-opt-in` endpoint.
- **Weekly digest** - sends every Sunday to opted-in subscribers with new articles and tester calls since last digest.
- **Abandoned pattern reminders** - targets users who used their free credit 3-7 days ago but haven't made a paid purchase. Offers 25% off first credit pack with code `FIRSTPACK25`.
- **Landing page copy** - email section updated to "Weekly fit tips + new pattern drops" with "One email a week, max" subtext.
- **join-list.js** upgraded to full welcome sequence enrollment with marketing opt-in tracking.
- 7 new email templates, 7 new dispatcher cases, 3 new cron triggers.

### Credit packs (code complete, not yet live)
- **2-Credit Pack at $22** ($11/credit) - new purchase type alongside individual patterns, bundles, and subscriptions.
- Full checkout flow: create-checkout.js, stripe-webhook.js, session-info.js, checkout.js.
- Pricing page section between bundles and memberships with wired button.
- Separate `credit_pack_credits` column on profiles for analytics.

### Database
- Migration `004_email_marketing.sql`: `marketing_opt_in` on profiles/newsletter, `welcome_sequence` table, `digest_state` table, `credit_pack_credits` on profiles.

### Infrastructure
- New API endpoint: `api/email-opt-in.js`
- `vercel.json` updated with function config

**To activate:**
1. Run migration `004_email_marketing.sql` in Supabase
2. Create Stripe price for 2-credit pack, replace `price_CREDIT_PACK_2` in `pricing.js`
3. Create Stripe promotion code `FIRSTPACK25` (25% off credit packs)

---

## [0.11.0] — 2026-04-03

### Affiliate program (built, not yet live)
- 30% commission referral system for sewing bloggers, YouTubers, and influencers
- Referral tracking via `?ref=CODE` URL parameter with 30-day first-touch cookie attribution
- Public `/affiliate` signup page with application form, commission table, and how-it-works
- 3 new API endpoints: `affiliate-apply.js`, `affiliate-click.js`, `affiliate-dashboard.js`
- Affiliate tab in account dashboard: referral link with copy button, stats cards (clicks, conversions, conversion rate, total earned), earnings breakdown (pending/paid), recent conversions table, monthly breakdown
- Stripe metadata integration: affiliate code passed through all checkout modes (pattern, bundle, subscription)
- Webhook conversion recording with self-referral prevention and per-affiliate commission rates
- 4 new email templates: application confirmation, approval with referral link, admin notification, payout confirmation
- Database migration `005_add_affiliate_program.sql`: affiliates, affiliate_clicks, affiliate_conversions, affiliate_payouts tables
- Manual PayPal payouts with $20 minimum threshold
- **Not yet activated** - requires running the migration and deploying

---

## [0.10.0] — 2026-04-03 (ready to implement - not yet live)

### Email marketing system
- **Email opt-in UI** shown after free pattern redemption (`app.js`) and paid purchases (`success.js`). Headline: "Get weekly fit tips + early new pattern drops". Gold CTA button, neutral dismiss, PostHog tracking.
- **5-email welcome sequence** dripped over 13 days: Day 0 (immediate), Day 2 (fit tips), Day 5 (pattern piece guide), Day 9 (social proof/tester calls), Day 13 (20% off credit pack nudge). Day 0 sent immediately at opt-in; Days 2-13 queued in `welcome_sequence` table and sent by daily cron.
- **Weekly digest** sends every Sunday via the existing daily cron. Compares `ARTICLES` array `datePublished` against a `digest_state` watermark. Includes article summary cards and tester call section. Only sent to opted-in subscribers.
- **Abandoned pattern reminders** for users who generated but didn't purchase (3-7 day window). Only sent to opted-in users. CTA: "25% off your first credit pack".
- **Landing page newsletter** copy updated from "Get notified when new patterns drop" to "Weekly fit tips + new pattern drops" with "One email a week, max. Unsubscribe any time." subtext.
- **`api/join-list.js`** now sets `marketing_opt_in = true` and enrolls in welcome sequence (replaces old generic welcome email).
- **7 new email templates** added to `email-templates.js`: 5 welcome sequence, weekly digest, abandoned pattern reminder. All use existing branded shell/btn/rule helpers.
- **8 new dispatcher cases** in `send-email.js`: `WELCOME_SEQ_0` through `WELCOME_SEQ_4`, `WEEKLY_DIGEST`, `ABANDONED_PATTERN_REMINDER`.
- **3 new cron triggers** in `cron-emails.js`: `sendWelcomeSequenceDrips()`, `sendWeeklyDigest()`, `sendAbandonedPatternReminders()`.

### Credit packs
- **2-Credit Pack at $22** added to `CREDIT_PACKS` in `pricing.js`. Any tier, credits never expire.
- Full checkout flow: `create-checkout.js` handles `mode: 'credit_pack'`, `stripe-webhook.js` fulfills by adding credits to `profiles.credit_pack_credits`, `checkout.js` exports `buyCreditPack()`.
- Credit Packs section added to `pricing.html` between Bundles and Memberships, wired in `pricing.js`.

### Database migration (`004_email_marketing.sql`)
- `profiles`: added `marketing_opt_in`, `opted_in_at`, `credit_pack_credits` columns
- `newsletter`: added `marketing_opt_in`, `opted_in_at` columns
- New tables: `welcome_sequence` (drip scheduling), `digest_state` (cron watermarks)

### Infrastructure
- New endpoint: `api/email-opt-in.js` (records opt-in, sends Day 0, enqueues Days 2-13)
- `vercel.json`: added function configs for `email-opt-in.js` and `cron-emails.js`

### To activate
- Run `supabase/migrations/004_email_marketing.sql` in Supabase SQL editor
- Create Stripe price for 2-credit pack, replace `price_CREDIT_PACK_2` in `src/lib/pricing.js`

---

## [0.9.0] — 2026-04-01

### Pattern Tester Program
- Added complete self-serve tester flow: apply, get approved, sew muslins, submit structured fit feedback with photos, get featured on site and socials
- New public landing page at `/tester` with how-it-works, perks, auth-aware application form, and featured gallery
- New "Tester Program" section in account dashboard with assignment tracking, feedback modal (9 body areas, difficulty/clarity ratings, photo upload), and feature consent
- 4 new API endpoints: `tester-apply`, `tester-admin`, `tester-submit`, `tester-upload`
- 5 new email templates: application received, approved, rejected, submission received, featured
- Supabase migration: `tester_applications`, `tester_assignments`, `tester_submissions` tables with RLS, `tester-photos` storage bucket, `is_tester`/`is_admin` profile flags
- Admin actions: list/approve/reject applications, grant free credits, create assignments, feature submissions

### Navigation
- Added "Tester" link to desktop header nav, mobile nav, and footer across all 12 HTML pages

---

## [0.8.1] — 2026-03-29

### Codebase audit — dead code removal and cleanup
- Removed bogus `tmux` npm dependency (supply chain risk -- unmaintained, unrelated package)
- Removed 4 duplicate fabric entries from `materials.js`: bare `jersey`, `jersey-cotton`, `jersey-modal`, `jersey-bamboo` (canonical keys are `cotton-jersey`, `cotton-modal`, `bamboo-jersey`)
- Updated `wrap-dress-w.js` to use canonical fabric keys
- Removed `interfacing-medium` from `STANDARD_NOTIONS` (trap for misuse -- `interfacing-med` is the canonical key)
- Deleted 24 dead garment imports from `app.js` (all garments accessed via `GARMENTS` from `index.js`)
- Removed unused `easeDistribution` import from `app.js`
- Fixed A-line skirt lining pieces: now compute actual dimensions from panel instead of hardcoded 1x1" placeholder

### Infrastructure
- Added GitHub Actions CI workflow -- runs `npm run build` on every push to main and PR
- Added Sentry browser error monitoring (`@sentry/browser`) -- catches unhandled JS errors in production
- Added per-IP rate limiting to 5 API endpoints: `join-list` (5/min), `signup-free` (5/min), `create-checkout` (10/min), `use-free-credit` (5/min), `submit-feedback` (10/min)

### README
- Added missing `denim-jacket` to garment module table (was in code but not listed)

---

## [0.8.0] — 2026-03-28

### Drafting math audit — corrected formulas to standard block rules
- **Neck width** changed from `neck / 6` to `neck / 5` (Aldrich standard). Affects all 11 upper-body garments. Widens neck opening ~0.5" per side, fixing tight crew necks.
- **Shoulder slope** changed from hardcoded 1.75" drop to proportional `shoulderWidth × tan(13°)`. New `shoulderDropFromWidth()` function in `upper-body.js`. Prevents too-steep shoulders on narrow frames.
- **Sleeve cap height** changed from hardcoded 5.0–5.5" to `armholeDepth × 0.60` (0.55 for oversized). Proportional cap produces correct ease across body sizes.
- **Armhole depth** now accepts optional `waistToArmpit` measurement for direct measurement instead of `chest / 4` approximation. New optional measurement added to `measurements.js`.

### Bug fix — waistband length used hip instead of waist
- Structured waistbands (jeans, chinos, pleated trousers/shorts) were using `m.hip` instead of `m.waist`, producing waistbands 6–10" too long
- Elastic/pull-on waistbands (sweatpants, swim trunks) correctly keep `m.hip` since garment must pass over hips
- Garments with both options (skirts, womenswear trousers, cargo shorts) now use conditional: `m.waist` for structured, `m.hip` for elastic

### Small-piece bin-packing on letter/A4 paper
- Pockets, waistbands, belt loops, neckbands, and fly shields now bin-pack onto shared pages instead of each getting a full page
- Compact renderer with 0.3" margins (vs 1.5" for tiled pieces) makes small pieces packable
- Waistbands and neckbands print at half length with "FOLD" indicator and full dimensions noted
- Saves ~5 pages per jeans pattern, ~2–3 per shirt

### Tile map improvements
- Portrait pieces show as tall cells, landscape pieces as wide cells — visual matches print orientation
- Orientation label now spells out "portrait" / "landscape" instead of abbreviation "L"
- Bin-packed small pieces shown as a single grouped entry with bullet list of piece names

### Print layout additions
- Per-piece 1" × 1" scale reference box on the first tile of every piece
- Outseam and inseam seam-length dimension labels on jeans panels

### Engine additions
- `shoulderDropFromWidth(width, slopeDeg)` — proportional shoulder drop from seam width and angle
- `validateCrossSeam(frontCurve, backCurve, rise)` — warns if crotch curve arc length is outside expected range
- `bezierToSvgC(cp)` — SVG cubic bezier path fragment from control points (prep for future smooth curve rendering)

### Known issues resolved (all KIs closed)
- **KI-011** Bust dart intake now scales with chest measurement: `(chest - 30) × 0.11 + 0.75`, clamped 0.75–3.0". No longer fixed at 1.5" for all cup sizes.
- **KI-006** Wrap dress skirt panels now have per-edge `edgeAllowances` with proper hem vs SA distinction and `isCutOnFold` for back panels.
- **KI-003** Slant pocket facing/bag instructions now say "1 + 1 mirror — flip fabric for second" across all 9 garments with slant pockets.
- **KI-004** Crotch extension dimension label centered below dim line instead of clipped in left margin at small ext values.
- **KI-009** Confirmed not a bug — `'tops'` is a UI display label, `'upper'` is the measurement category; never compared.
- **KI-013** Scale verification square now uses `data-scale-check` attribute instead of fragile CSS class. API files updated to match.
- **KI-014** Print colors replaced with B&W-safe grays: gold → #555, green → #444, warm gray → #999.
- **KI-015** `armholeCurve()` now clamps chestDepth to min 0.5" with warning when shoulder width exceeds chest panel.
- **KI-002** Confirmed mitigated by existing 2.5× miter cap + sanitizePoly.

---

## [0.7.0] — 2026-03-27

### Per-edge seam allowances
- Added `edgeAllowances` arrays to 6 launch modules: `cargo-shorts`, `straight-jeans`, `tee`, `camp-shirt`, `a-line-skirt-w`, `slip-skirt-w`
- Each edge gets a named SA value (e.g. waist 0.625", hem 1.5", neckline 0.375", fold 0")
- `offsetPolygon` calls updated to use `i => -edgeAllowances[i].sa` per-edge function
- Labels rendered on each edge in both screen and print views

### Grainline arrows and fold indicators
- All pattern pieces now have consistent double-ended grainline arrows (dashed, stroke-width 0.8)
- Cut-on-fold pieces show "PLACE ON FOLD" text with directional arrows instead of grainline
- Applied to both `renderPanelSVG` and `renderGenericPieceSVG` in pattern-view.js
- Applied to both renderers in print-layout.js

### Bust dart geometry
- Added bust dart rendering to 4 womenswear tops: `button-up-w`, `shell-blouse-w`, `fitted-tee-w`, `shirt-dress-w`
- When bust dart option enabled, front piece includes actual dart lines (dashed, gold), matchpoint notches at side seam, and "dart" label
- `shirt-dress-w` correctly transforms dart coordinates for offset and mirrored front panels
- `bustDarts` array on piece objects: `{ apexX, apexY, sideX, upperY, lowerY, intake, length }`

### Polygon sanitizer
- New `sanitizePoly(pts)` in `geometry.js`: removes duplicate points (0.01" tolerance), collinear points (0.5° tolerance), ensures CW winding
- Applied inside `offsetPolygon()` (covers all SA computations)
- Applied in `app.js` after both `g.pieces()` calls (covers all rendering)
- Applied in `api/generate-pattern.js` and `api/regenerate-pattern.js` (covers server-side PDF)
- If sanitization changes point count, `edgeAllowances` is dropped (renderer falls back to uniform SA)

### PDF renderer consolidation
- Removed `html-pdf-node` fallback from both API functions
- All PDF output now uses headless Chromium only, eliminating subtle scale differences
- Added automated scale verification: measures the 2x2" calibration square after rendering, logs warning if deviation > 0.5%

---

## [0.6.0] — 2026-03-26

### Infrastructure
- Supabase auth, Stripe payments, email system, account dashboard
- 404 page, success page, newsletter join, mobile header, wishlist, garment illustrations
- Subscription download limits, purchase verification, rate limiting
- See CLAUDE.md tasks 1-8 for full details

---

## [0.5.0] — 2026-03-25

### Engine — upper body block rewritten to standard drafting rules
- `upper-body.js` fully rewritten: scye depth now uses `chest/4 + style tolerance` instead of a flat constant; back neck width uses `neck/6`; shoulder slope, neckline curves (crew/v-neck/scoop/boat), armhole curves (back shallow bow, front deep scoop), and sleeve cap curve are now separate exported functions with full JSDoc
- `UPPER_EASE` table: fitted=2, standard=4, relaxed=6, oversized=10 inches
- `chestEaseDistribution()`: front 55%, back 45%
- `armholeDepthFromChest()`: `chest/4` plus per-style tolerance
- `armholeCurve()`: back armhole has slight inward bow; front has deeper forward scoop
- `shoulderSlope()`: straight line as bezier (collinear control points) for pipeline consistency
- `necklineCurve()`: crew, v-neck, scoop, boat — each parametric with documented control point rationale
- `sleeveCapCurve()` / `sleeveCapEase()`: asymmetric cap (back slightly flatter, front slightly fuller); ease computed as bezier arc length minus armhole circumference

---

## [0.4.0] — 2026-03-25

### Bug fix — chest/8 typo in upper body geometry
- Fixed incorrect formula where `chest/8` was used where `chest/4` was intended for scye depth calculation, producing armholes roughly half the correct depth

---

## [0.3.0] — 2026-03-24

### Bug fix — upper body garments crash on generate
- All upper body garments (`tee`, `camp-shirt`, `crewneck`, `hoodie`, `crop-jacket`, `button-up-w`, `shell-blouse-w`, `fitted-tee-w`) were crashing on pattern generation due to missing dimension fields expected by the renderer
- Added required `dimensions` object to all bodice, sleeve, and panel pieces in upper body garments

### Bug fix — pattern view rendering
- Fixed `mR` (margin-right) padding on pattern piece cards
- Slant pocket rendering: corrected pocket-mouth line endpoint calculation
- Extension label (`ext` annotation) was rendering at wrong coordinates
- SA (seam allowance) polygon miter at bottom corners now produces a clean right-angle step instead of an interpolated blend — `offsetPolygon()` now emits two points at step corners

---

## [0.2.0] — 2026-03-24

### Style reference labels on all garment options
- Every garment option dropdown now includes a `ref` string — a plain-English style reference shown in the UI (e.g. "classic, off-the-rack", "workwear", "streetwear/oversized")
- Covers: ease, leg shape, rise, neckline, collar, pocket, fly, and sleeve length options across all 23 modules

### Rise presets on all lower body garments
- Standardised `riseAdjust` option with five presets: ultra-low (−2.5″), low (−1.5″), mid (0), high (+1.5″), ultra-high (+3.0″)
- Applied to all 8 menswear bottoms and all 5 womenswear bottoms

---

## [0.1.0] — 2026-03-23

### 10 womenswear garments added
**Womenswear · Bottoms**
- `wide-leg-trouser-w` — high waist, belt loops, slash pockets
- `straight-trouser-w` — mid rise, slash and back welt pockets
- `easy-pant-w` — elastic waist, tapered leg, side pockets
- `slip-skirt-w` — midi or maxi, side slit
- `a-line-skirt-w` — fitted waist, flared hem, optional lining

**Womenswear · Tops**
- `button-up-w` — collar stand, French placket, short or long sleeve
- `shell-blouse-w` — sleeveless, jewel or scoop neck, side zip
- `fitted-tee-w` — crew/scoop/V neck, set-in sleeve, knit fabric

**Womenswear · Dresses**
- `shirt-dress-w` — button-up bodice, full skirt, collar stand, optional belt
- `wrap-dress-w` — V-neck bodice, A-line skirt, self-tie sash

### Measurement teacher
- `measurement-teacher.js` added: inline SVG diagrams with annotated measurement points for all 13 body measurements; separate lower-body and upper-body schematics

---

## [0.0.4] — 2026-03-22

### Upper body garments — camp shirt, crewneck, hoodie, crop jacket
- `camp-shirt` — camp/open collar, short sleeve, chest patch pockets, relaxed fit
- `crewneck` — dropped shoulder option, kangaroo pocket, ribbed trim
- `hoodie` — drawstring hood, kangaroo pocket, ribbed cuffs and hem
- `crop-jacket` — structured crop, welt pockets, optional lining, flat-fell seam option

### Bug fix — pattern view panel bottom text spacing
- Construction step text was overflowing the SVG panel card; added bottom padding offset

---

## [0.0.3] — 2026-03-22

### First upper body garment — tee
- `tee.js`: crew/V/scoop neckline, short/¾/long sleeve, optional chest pocket, set-in sleeve
- Garment-specific `measurementDefaults` field introduced (sets reasonable inseam/sleeve starting values per garment)
- Pattern view `viewBox` fixed for long-inseam garments — was clipping the hem on inseams > 20″

### Upper body geometry engine
- `upper-body.js` created with armhole, shoulder slope, neckline, and sleeve cap curve functions (initial version; rewrote in 0.5.0)

---

## [0.0.2] — 2026-03-21

### 7 garment modules, print layout, dark mode, profiles, yardage calculator
**Garments**
- `cargo-shorts` — rise preset, cargo pocket, inseam length
- `gym-shorts` — elastic waist, optional liner, inseam
- `swim-trunks` — mesh liner, board short or trunk length
- `pleated-shorts` — single or double pleat, tab waistband
- `straight-jeans` — 5-pocket, fly front, low/mid/high rise
- `chinos` — flat front, slash pockets, back welts
- `pleated-trousers` — double pleat, belt loops, cuffed hem
- `sweatpants` — drawstring waist, ribbed cuffs, side pockets

**App features**
- 4-step wizard flow: Choose garment → Measurements → Options → Pattern
- Dark mode with persistent `localStorage` preference
- Measurement profiles: save/load/delete named profiles via `localStorage`
- Fabric yardage calculator: greedy row-packing at 45″ and 60″ widths, +10% buffer
- Print layout (`print-layout.js`): US Letter tiled output at 1:1 scale (96 dpi) with ¾″ tile overlap, registration crosshairs, scale verification squares, cover sheet, materials and instructions pages

**Engine**
- `geometry.js`: `norm`, `dist`, `cubicBezier`, `sampleBezier`, `crotchCurvePoints`, `offsetPolygon` (miter intersection), `polyToPath`, `fmtInches`, `LEG_SHAPES`, `EASE_VALUES`, `easeDistribution`
- `measurements.js`: 13 measurement fields with labels, instructions, min/max/step/default
- `materials.js`: `FABRIC_TYPES` (40+ entries), `THREAD_TYPES`, `NEEDLE_TYPES`, `STITCH_TYPES`, `STANDARD_NOTIONS`, `buildMaterialsSpec()`

---

## [0.0.1] — 2026-03-20

### Initial commit
- Project scaffolded with Vite 6, ES modules, vanilla JS
- `index.html` entry point
