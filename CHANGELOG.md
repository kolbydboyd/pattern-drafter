# Changelog

All notable changes are documented here, newest first.

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
