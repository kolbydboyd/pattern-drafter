# Changelog

All notable changes are documented here, newest first.

---

## [0.12.77] - 2026-04-20

### Added
- **Button marks on all button-front patterns** — `{ type: 'button', x, y }` marks now appear on the front panel of every garment with a button closure: button-up, button-up-w, polo-shirt, henley, shirt-dress-w, chore-coat, crop-jacket, denim-jacket, and athletic-formal-jacket. Marks are conditional on `opts.closure === 'button'` where applicable (crop-jacket, denim-jacket, chore-coat). Denim-jacket marks are split between front-yoke and front-panel pieces by yoke seam Y. Athletic-formal-jacket renders a 2×2 grid for double-breasted and 2 vertical marks for single-breasted.
- **Back-panel notch doubles for athletic-formal-trousers** — hip (side seam) and crotch (inseam) notches now include a second triangle offset by ±0.25″ on back panels, matching the double-notch convention used by baggy-jeans, chinos, wide-leg trousers, and pleated trousers.

---

## [0.12.76] - 2026-04-20

### Added (camp-shirt.js)
- **Camp Shirt revere collar option** — new `collar: 'revere'` option on `camp-shirt`. When selected: the front panel gains a shaped lapel extension (break point at 7.5″, lapel tip at −2.25″) and a printed roll line annotation; the collar is shortened to back neckline only (back arc × 2 + 0.75″ shoulder extension each side) with its ends sandwiched into the shoulder seams; the flat placket facing is replaced by a shaped revere facing polygon that follows the lapel curve; construction instructions are updated for the revere sequence (no top button, lapel folds naturally along roll line). Default collar style remains `'flat'` — all existing camp shirt variants are unaffected.
- **`camp-shirt-revere` variant** — new pre-set variant using the revere collar with standard fit and short sleeve.
- **SVG illustration** for `camp-shirt-revere` in `scripts/gen-illustrations.mjs`.
- **SEO description** for `camp-shirt-revere` in `src/garments/seo-descriptions.js`.

---

## [0.12.75] - 2026-04-20

### Added (button-up.js)

- **Split yoke option** — new `yokeStyle` option (`single` | `split`) for the back yoke. When `split`: the half-yoke polygon gains a CB seam edge with 5/8" seam allowance, the piece instruction changes to "Cut 4 (2 outer + 2 lining, mirror)", per-edge allowances are set (neckline 3/8", shoulder/yoke-seam per global SA, armhole 3/8", CB seam 5/8"), and `isCutOnFold` is false. When `single` (default): existing cut-on-fold behavior is preserved unchanged.
- **Split yoke instruction step** — when `yokeStyle: 'split'`, the "Attach back yoke" instruction step prepends CB seam construction ("Sew CB seam on outer yoke halves RST at 5/8". Repeat for lining halves. Press seams open.") before the standard yoke assembly.
- **Split yoke materials note** — when split yoke is active, a note is added explaining the CB seam enables stripe and check matching across the back.
- **Oxford Shirt defaults to split yoke** — `oxford-shirt` variant now defaults to `yokeStyle: 'split'`, consistent with tailored dress-shirt convention.

---

## [0.12.74] - 2026-04-20

### Changed (button-up.js — Oxford and linen shirt improvements)

- **Relaxed fit ease** — increased from +5" to +6" chest ease; +5" was within the range for a loose regular fit, not a true relaxed fit (industry minimum is +6").
- **Linen Shirt default fit** — changed from `fitted` (+2") to `standard` (+4"). A 2" ease is too snug for a linen shirt after pre-wash shrinkage margin.
- **Linen pre-wash instruction** — corrected "wash hot, tumble dry" to "wash warm (40 °C), air dry or tumble dry on low heat only." Tumble drying linen hot risks 10-15% additional shrinkage.
- **Seam finish recommendation for linen** — changed from flat-felled to French seams when linen/linen-light is selected (in both `materials()` notes and the side/sleeve seam instruction step). French seams suit loosely woven cloth; flat-felled adds bulk and can show through.

### Added (button-up.js)

- **French cuff option** — added `french` cuff choice (5" cut width, folds to 2.5", 4 link holes). Appears in cuff options, pieces list, materials (cufflinks notion), and instructions. Available on the men's/unisex button-up module; was previously only in the women's module.
- **Button-down collar (OCBD)** — added `button-down` collar option: same stand (1.25") and fall (2") geometry as the point collar but no interfacing on the fall (for natural soft roll), buttonhole marks at 1/2" from each collar tip, and 2 small anchor buttons (9mm) in the materials list. Instructions include a step for marking and sewing anchor buttons after fitting collar roll.
- **Oxford Shirt (OCBD) variant** — new `oxford-shirt` catalog entry defaulting to button-down collar, standard fit, back yoke, barrel cuff.
- **Oxford Shirt SVG illustration** — `public/garment-illustrations/oxford-shirt.svg` with anchor-button circles at collar tips as the defining visual detail.

---

## [0.12.73] - 2026-04-20

### Added
- **Camp shirt: boxy fit (+8″ ease)** — new fit option added to `camp-shirt.js`; `boxy: 8` added to `UPPER_EASE` in `upper-body.js`.
- **Camp shirt: side seam vents** — `sideVent: 'vent'` option adds a 2½″ vent underlap extension to the back panel (polygon + per-edge SA), vent-depth notches on front and back, and a dedicated "Finish side vents" instruction step.
- **Camp shirt: barrel cuff** — `cuff: 'barrel'` option (long sleeve only) adds a separate `sleeve-cuff` rectangle piece, changes the sleeve hem edge to a cuff seam SA, and adds an "Attach barrel cuffs" instruction step.
- **Camp shirt: dropped shoulder** — `shoulderDrop` option (none / ¾″ / 1½″) recalculates shoulder width, slope, and armhole curves for a relaxed or boxy dropped-shoulder look.
- **Camp shirt: cross-grain collar annotation** — collar piece now includes a `grainLine` property indicating cross-grain cut direction; instruction text updated accordingly.
- **Camp shirt: Boxy Camp Shirt variant** — new `boxy-camp-shirt` variant (boxy fit, dropped shoulder, side vents, patch pocket) with hand-crafted SVG illustration.
- **Camp shirt: existing variants updated** — fitted-linen-camp now defaults to barrel cuff; classic-camp-yoke now defaults to side vents; all variants carry explicit defaults for the three new options.

---

## [0.12.72] - 2026-04-20

### Added
- **Deep Autumn Color Palette in Admin Reference tab** — added a visual swatch card to the Reference tab showing the 14 core Deep Autumn colors grouped by family (Neutrals, Earth Tones, Greens, Accents). Each swatch displays a colored chip, name, and hex code. Colors sourced from seasonal color analysis research and cross-referenced against the Founder's Select garment color notes.

---

## [0.12.71] - 2026-04-19

### Changed
- **Jeans back panel — no darts when yoke active** — jeans have a yoke *instead of* darts: the yoke's trapezoidal shape (narrow waist, wider bottom) absorbs the waist-to-hip shaping that would otherwise be closed into darts. Previously the back panel was drafted with a fake wide waist + computed dart intake, then the yoke split closed those darts via rotation (with snap-back fixes to keep the side seam straight). Now, when `yokeStyle !== 'none'`, the back panel is drafted directly with `waistWidth = backWaistW` and `dartIntake = 0` — the diagonal side seam from narrow waist to wider hip runs through both the yoke and lower panel naturally, no dart machinery needed. Trousers still get darts; jeans get a yoke.

---

## [0.12.70] - 2026-04-19

### Fixed
- **Jeans back yoke side seam** — dart closure in `splitBackYoke()` was rotating the yoke's two side-seam vertices away from the true side seam. Previously only `y` was forced back to 0 for the side-waist corner; now both corners (side waist at top and yoke-seam/side-seam junction at bottom) are snapped back to their original positions on the back-panel side seam diagonal. This keeps the yoke and lower-panel side seams collinear and eliminates the kink at the junction.
- **Jeans back yoke rendered as "cut on fold"** — the UI was auto-treating the yoke as a fold piece (no SA on the CB edge, "PLACE ON FOLD" indicator, label "cut on fold") because `isCutOnFold` was unset. Added `isCutOnFold: false` to the yoke piece; it now renders with correct CB seam allowance and "× 2 (mirror)" label, matching its instruction text.

---

## [0.12.69] - 2026-04-19

### Changed
- **Soloist Jeans defaults** — updated to match a classic 501 silhouette: `riseStyle` `low` → `mid` (body rise), `frontPocket` `square-scoop` → `scoop`, `legShape` `slim` → `straight`. Header comment updated to reflect the new defaults. Construction still delegates to `straight-jeans.js`.
- **Global jeans yoke depth** — lowered `yokeDepth` default from 4″ to 2″ (min also lowered from 2.5″ to 1.5″) in `straight-jeans.js` to match real-world references (Levi's 501, Wrangler Retro, Stetson). The previous 4″ default produced a ~5.25″ yoke at CB after `cbRaise`, roughly double what actual jeans show. `splitBackYoke()` fallback updated to match.

### Fixed
- **Back patch pocket placement tilt** — `pattern-view.js` previously drew the dashed patch-pocket overlay with a hardcoded +5° tilt (CB edge higher), which is the opposite direction of the yoke seam on the lower panel (CB deeper, side shallower). Replaced with an auto-derived tilt computed from the panel's own top-edge slope, so the pocket top always reads parallel to the yoke seam above it regardless of `yokeDepth` / `cbRaise` settings.

---

## [0.12.68] - 2026-04-19

### Fixed
- **Back patch pocket width** — widened from 5.5″ to 6″ to match industry minimum (standard range 6–6.5″). The previous 5.5″ was below spec and produced a visually narrow pocket.
- **Coin pocket depth** — reduced from 3.5″ to 2.5″ to match industry standard (2–2.5″). The previous 3.5″ was 1″ deeper than typical, which wastes fabric and looks proportionally odd.
- **Back pocket step wording when yoke is active** — step 1 now says "lower back panels (the section below the yoke seam)" instead of "back panels" when a yoke style is selected, preventing beginner confusion about which piece to work on.
- **Coin pocket placement wording for side/none pocket variants** — step 2 previously referenced "just below the front pocket opening" for all pocket types, but side-seam and no-pocket variants have no front opening. The instruction now gives a measurement-based placement description for those variants.

---

## [0.12.67] - 2026-04-19

### Fixed
- **Jeans side-seam and no-pocket instructions bug** — `instructions()` used a single `isScoop` boolean to branch pocket assembly steps, so `frontPocket: 'side'` fell into the `else` (slant) branch and got completely wrong instructions (slash-diagonal steps instead of side-seam bag basting steps), and `frontPocket: 'none'` also generated spurious slant-pocket steps. Replaced with explicit `if/else if` branches for each pocket type. Side-seam pocket now has two correct steps: serge/assemble the D-shaped bags, then baste bags to front panels along the side seam edge before the outseam is sewn. `none` generates no pocket steps.

---

## [0.12.66] - 2026-04-19

### Fixed
- **Soloist/Straight Jeans back yoke waistline kink** — after PR #234 snapped the side-waist vertex back to y=0, the dart left-leg pivot vertices remained in the yoke polygon at y=0, creating a step/kink between the CB-to-dart diagonal and the dart-to-side horizontal segment. Removed the dart left-leg vertices via `yokePoly.splice(1, numDarts)` after dart closure and updated `seamStartIdx = 2`. The yoke top edge is now a clean single diagonal from CB to side seam with no intermediate kink. (Research confirms the yoke waistline after dart closure should be a continuous smooth line — the left-leg vertices are only needed as rotation pivots, not as polygon shape vertices.)

---

## [0.12.65] - 2026-04-19

### Fixed
- **Soloist/Straight Jeans back yoke waist alignment** — `closeYokeDarts` rotates the side-seam waist vertex off `y=0` when closing back darts, producing a concave dip in the yoke's top edge. Fixed in `splitBackYoke` by truing the waist after dart closure: force `yokePoly[numDarts + 1].y = 0` so the top edge stays flat for waistband attachment. The x-position (shifted inward by the rotation) is preserved and correctly reflects the narrower post-closure waist width. Affects any jeans variant with `yokeStyle: 'pointed'` or `'curved'`.

---

## [0.12.64] - 2026-04-17

### Changed
- **Camp Shirt** — full pattern upgrade to industry-standard quality (Helen's Closet Cameron / Closet Core Kalle level). Difficulty downgraded to beginner. Removed worker-collar option. Hem default changed to 1" folded. Shaped camp collar is now a proper trapezoid (pointCut = collarH × 0.5) so it lies flat when open rather than standing up. Added optional back yoke (option: `yoke: 'none' | 'yoke'`, default `none`) using the same shaped-polygon approach as the denim jacket: `yokeDepth = armholeDepth × 0.33`, armhole curve split at `yokeLineY` via linear interpolation, yoke piece cut on fold (outer + lining). Materials list upgraded: rayon challis first, yardage formula for 45" and 60" widths, button quality note. Instructions expanded to 13 steps: stay-stitch first, conditional yoke sandwich step, finishing options section.
- **Added `classic-camp-yoke` variant** — camp shirt with back yoke enabled by default. New SVG illustration (dashed yoke seam) and SEO description added.

---

## [0.12.63] - 2026-04-17

### Added
- **Flat-felled seam instructions (beginner-friendly)** — added a shared helper `src/lib/seam-techniques.js` exporting `flatFelledSeam()`. Every garment that uses flat-felled seams now receives detailed, step-by-step instructions covering: which SA to trim, how to fold and press, why two topstitch rows are used, needle/thread recommendations, and common pitfalls. Affects: `crop-jacket`, `straight-jeans`, `baggy-jeans`, `button-up`, `chore-coat`, and `denim-jacket` (yoke, shoulder, armhole, and side seam steps). `soloist-jeans` is covered automatically via its `straight-jeans` delegation.

---

## [0.12.62] - 2026-04-16

### Fixed
- **Crop Jacket sleeve cap** — the sleeve was a pure rectangle with no cap shaping (`capHeight: 0`), making it impossible to set correctly into the shaped armhole. Replaced with a proper one-piece set-in cap using `sleeveCapCurve()` at 4.5″ cap height (flat workwear cap, same as the denim jacket). The sleeve now tapers from bicep to wrist. Cap ease is computed and validated (warns if outside 0.5–3″). All cap notches updated: crown (single, at cap top → shoulder seam), front quarter (single), back quarter (double). Lining sleeve updated to match the shell cap shape.
- **Crop Jacket stand collar** — the collar was a plain rectangle (`type: 'rectangle'`), producing no stand. Replaced with `collarCurve()` generating two shaped polygon pieces: outer collar (upper, `type: 'bodice'`, cut 1 on fold at CB) and facing (under collar, 2% smaller so the seam rolls under). The outer edge now has a slight outward wave that causes the collar to stand naturally when sewn to the neckline. Point collar CF tips are geometrically correct (0.75″ extension), not just a sewing instruction. Mandarin/band option uses `style: 'band'` (no CF extension, squared ends).
- **Crop Jacket seam matching** — collar half-length is now `arcLength(frontNeckPts) + arcLength(backNeckPts)` (actual bodice neckline arc), not the raw `m.neck + 1` approximation. Cap ease note shown in sleeve piece instruction for verification.

---

## [0.12.61] - 2026-04-16

### Fixed
- **Athletic Formal Jacket front facing crash** — pattern generation threw `undefined is not an object (evaluating 'e[d].label')` for all three lapel styles. The `facingEdges` array on the `front-facing` piece was one entry short of `facingPoly.length`: the closing CF edge (from `(-PLACKET_W, breakPointY)` back to the break point) had no label. `src/ui/pattern-view.js` reads one label per polygon edge, so the missing final slot crashed the renderer. `facingEdges` is now built one label per edge in explicit order (Lapel × K-1, Neck × N for shawl, then Neck-step, Inner, Hem, Placket, BreakStep) with a dev-time length-match warning to catch future regressions.

---

## [0.12.60] - 2026-04-16

### Added
- **Moto Jacket** (`moto-jacket`) — new advanced outerwear module with 12 options and 124,416 permutations. Three style modes: Moto / fashion biker, Perfecto (double rider), and Café Racer. Features: asymmetric or center zip, wide/narrow notch lapel or band collar or collarless, optional belt with buckle, shoulder epaulettes, side/chest zip pockets, sleeve zip gusset or snap tab cuff, and full/quilted/half/no lining. Always uses a two-piece tailored sleeve. Pattern pieces: back yoke + panel (CB fold), full front panels L/R, top sleeve + under sleeve, front facing + lapel, upper/under collar, and all conditional hardware pieces.
- **Café Racer Jacket** (`cafe-racer-jacket`) — variant of moto jacket with center zip, band collar, snap tab cuff, and no hardware.
- **Perfecto Jacket** (`perfecto-jacket`) — variant of moto jacket with asymmetric zip, wide notch lapel, belt, epaulettes, zip gusset cuffs, and full lining.

### Fixed
- **Athletic Formal Jacket lapel geometry** — the lapel is now cut as part of the front panel (traditional tailoring), not on a separate piece. Previously the front panel rendered with only a roll-line marker and a flat neckline, while a separate "Front Facing + Lapel" piece carried the entire lapel shape. The front panel now extends from the break point out to the peak tip / notch and back to the gorge, for all three collar styles (peak, notched, shawl). The `front-facing` piece becomes a true facing that mirrors the lapel area plus a tapering strip down CF to the hem. Shawl's combined "Shawl Collar + Facing" piece is split into a narrow back-neck collar wrap (sewn shoulder-to-shoulder) plus the shared front facing. Roll line on the front panel now ends at the gorge (peak/notched) or shoulder-neck (shawl) instead of the CF neckline point. Notches on the front panel updated to match the new gorge / shoulder-neck attach points. Construction instructions rewritten to reflect the lapel-on-panel workflow.
- **`src/engine/upper-body.js`** — added `shawlLapelFront(...)` to generate the smooth (no-notch) lapel outline for the shawl style on the front panel. `shawlCollarCurve(...)` narrowed to a back-neck collar wrap only (CB fold to shoulder-seam), since the front lapel now lives on the front panel.

---

## [0.12.59] - 2026-04-16

### Changed
- **Privacy policy** — updated third-party services section to reflect current hosting stack. Replaced "Vercel: hosts the application" with "Cloudflare Pages: hosts the frontend application" and "AWS Lambda: generates PDF pattern files".
- **vite.config.js** — updated comment to reference `_redirects` instead of the deleted `vercel.json`.

---

## [0.12.58] - 2026-04-16

### Fixed
- **Cloudflare Pages configuration** — added `wrangler.toml` with `pages_build_output_dir = "dist"` and `compatibility_flags = ["nodejs_compat"]`. The previous migration added then removed `wrangler.toml` because it was formatted as a Workers config (triggering a required deploy command). The correct Pages format uses `pages_build_output_dir` instead of `main`, which signals to Cloudflare that this is a Pages project. Without this file the `nodejs_compat` flag (required by `affiliate-click.js` for `node:crypto`) had to be set manually in the dashboard on every project setup, and `pages_build_output_dir` was similarly undocumented in the repo.
- **Back patch pocket tilt** — placement overlay on the back panel was tilted the wrong way. The rotation formula in SVG (y-down) requires a negative angle to raise the side-seam edge. Changed `tiltDeg` from `+5` to `-5` so the side-seam corner sits higher than the CB corner, matching the yoke seam angle.
- **Front panel scoop/square-scoop rivet overlay** — rivet markers were placed using `hipWidth` instead of `waistWidth`, making them appear too far toward the side seam and creating a false diagonal. Now uses the actual waist side-seam x (`piece.waistWidth`) and the correct pocket depth (4″ for square-scoop, 6″ for curved scoop) to precisely locate both rivets.
- **Belt loops SVG broken** — piece had `dimensions: { width, height }` but `renderRectanglePieceSVG` expects `{ length, width }`. Changed to `{ length: 3.5, width: 2.25 }` so the belt loops render correctly with a 3½″ × 2¼″ cut rectangle.
- **Panel SVG right-margin clipping** — right margin was fixed at 5 SVG-inches regardless of crotch extension. Panels with large back-crotch extensions (e.g. 3¼″) had the outseam dimension label clipped. Right margin is now `max(5, ext + 3.5)` inches, ensuring all dimension labels are fully visible.

---

## [0.12.57] - 2026-04-15

### Added
- **US Legal paper size (8.5 x 14 in)** — available in the Print tab alongside Letter, A4, Tabloid, and A0. Legal produces fewer tile pages than Letter for tall panel pieces (pants, skirts) because the extra 3 inches of height covers more of the piece per page. Available for both browser print and downloaded PDF.
- **Tapered tiling for panel pieces** — slim or tapered garments (jeans, fitted trousers) now skip blank tile columns in rows where the actual piece is narrower than its widest point. A waist row that needs 3 pages wide and a hem row that only needs 2 will now print correctly, saving paper without changing the assembly experience.

---

## [0.12.56] - 2026-04-14

### Changed
- **Hosting migration: Vercel → Cloudflare Pages + AWS Lambda** — reduces hosting cost from ~$20/month to ~$0-5/month.
  - Frontend deploys to Cloudflare Pages (free tier, unlimited bandwidth).
  - All 29 light API functions converted from Vercel serverless format to Cloudflare Pages Functions (Workers) format in `functions/api/`. Key changes: `context.env` instead of `process.env`, Web API `Request`/`Response` instead of Express-style `req`/`res`, `sendEmail` and `enqueueWelcomeSequence` now accept `env` as first parameter.
  - PDF generation (`generate-pattern`, `regenerate-pattern`) moved to AWS Lambda in `lambda/` — these require 1024 MB RAM and 60 s timeout, which Cloudflare Workers cannot provide. Invoked via Lambda Function URL; address stored in `LAMBDA_GENERATE_URL` env var.
  - 5 cron jobs moved from Vercel Crons to GitHub Actions scheduled workflows in `.github/workflows/`.
  - `@vercel/analytics` removed from `src/analytics.js`, `src/ui/page.js`, `src/ui/tester-page.js`, and `package.json`. Analytics now handled entirely by PostHog (already integrated).
  - `VERCEL_URL` references in `api/stripe-webhook.js` replaced with `SITE_URL` env var; `triggerPdf()` now uses `LAMBDA_GENERATE_URL` when set.
  - `public/_redirects` added for Cloudflare Pages routing (replaces `vercel.json` rewrites and redirects).
  - `wrangler.toml` added for Cloudflare Pages configuration with `nodejs_compat` flag.
  - `_rate-limit.js` removed — per-IP in-memory rate limiting is incompatible with stateless Workers; Cloudflare network-level protection replaces it.

---

## [0.12.55] - 2026-04-14

### Added
- **Polo Shirt** (`polo-shirt`) — new upper-body garment module with self-fabric collar, 2-button CF placket, set-in short sleeve with stiff rib cuff, side hem slits, turn-back hem, and ¾″ longer back. Pieces: front bodice (cut on fold, CF slit for placket), back bodice, set-in sleeve ×2, sleeve rib cuff ×2, polo collar upper + under collar (interfaced upper layer for crisp stand), CF placket facing ×4, neck tape. Three options: fit (slim/regular/relaxed), sleeve length (mid-bicep 7″/elbow 9″), collar finish (interfaced/uninterfaced). Three variants: `slim-polo`, `classic-polo`, `sport-polo`. SEO descriptions and release dates added for all four IDs.

---

## [0.12.54] - 2026-04-14

### Fixed
- **Button-Up Shirt (W) — missing sleeve cap curve**: the `button-up.js` unisex sleeve cap fix (commit `2571c54`) was never applied to the women's variant. `button-up-w.js` still used a flat 4-point trapezoid with `capHeight: 0` for all sleeve styles (long, ¾, short), making it impossible to ease the sleeve into the curved armhole. Added `sleeveCapCurve()` at `armholeDepth × 0.55` (matching the unisex fix), per-edge seam allowances on cap curve points, and proper cap notch marks. The `cap` sleeve option retains a flat rectangle (correct by design). Imports `sleeveCapCurve` and `validateSleeveSeams` from `upper-body.js`.

---

## [0.12.53] - 2026-04-14

### Fixed
- **Crewneck Sweatshirt — raglan sleeve ReferenceError**: same class of scoping bug as the `fitted-tee-w` capPts fix (`0b5082d`). When `sleeveType === 'raglan'`, three variables declared with `const` inside `else` blocks were accessed unconditionally outside their block scope: `frontArmPts` (line 133), `backArmPts` (line 160), and `capPts` (line 190). All users who selected the Raglan sleeve option saw a runtime crash with no pattern output. Fixed by hoisting `let frontArmPts, backArmPts` before the if/else and wrapping the entire armhole-notch and sleeve-cap-notch block in `if (!isRaglan)`, consistent with how the rest of the raglan branch handles absence of set-in geometry.

---

## [0.12.52] - 2026-04-14

### Fixed
- **D-shaped side-seam pocket bags backported to remaining 14 garments** — completing the full audit of all side-seam pocket pieces. Every remaining garment that used a flat rectangle `{ dimensions: { width, height }, type: 'pocket' }` for a side-seam bag is now using `buildSideSeamPocketBag()`. Sizes are unchanged; D-shape replaces rectangle throughout. Imports updated for each file.
  - Pants/trousers: `easy-pant-w` (both side-pocket branches), `straight-jeans`, `chinos`, `baggy-jeans`, `straight-trouser-w`, `wide-leg-trouser-m`, `wide-leg-trouser-w`, `sweatpants`
  - Skirts/dresses: `a-line-skirt-w` (7×9), `a-line-dress-w` (7×9), `maxi-skirt-w` (7×10)
  - Kids: `kids-dress` (5.5×6.5), `kids-joggers` (6×7)
  - Swim: `swim-trunks` standard non-retro mesh pocket (6.5×7)

---

## [0.12.51] - 2026-04-14

### Fixed
- **Waistband sizing bug backported to 9 garments** — elastic and drawstring waistband pieces were incorrectly sized to the hip-derived garment opening `(frontW + backW) * 2` instead of the body waist measurement. For a 32W/40H user this produced bands up to ~8" too long. All affected garments now size the band to `m.waist + [ease] + sa * 2` and include a "gather garment opening to fit band before attaching" instruction.
  - Adults (+2" ease): `sweatpants`, `pajama-pants`, `lounge-shorts`, `easy-pant-w` (elastic option), `cargo-shorts` (elastic/drawstring option), `swim-trunks` (standard non-retro variant)
  - Kids (+1.5" ease): `kids-shorts`, `kids-joggers`, `kids-leggings`
- **D-shaped side-seam pocket bags backported to 8 garments** — side-seam pocket bag pieces were defined as simple rectangles instead of using the `buildSideSeamPocketBag()` D-shaped builder added in v0.12.44. Pockets now have a straight top and sides with a semicircular bottom, matching real pocket construction. Each file's import updated accordingly.
  - `lounge-shorts` (6×7), `kids-shorts` (5×6), `gym-shorts` (7×7.5), `cargo-shorts` (7×7.5), `cargo-work-pants` (8×10), `baggy-shorts` (7×9), `pleated-shorts` (7×9), `pleated-trousers` (7×9)

---

## [0.12.50] - 2026-04-14

### Added
- **Newest patterns carousel** on the landing page, directly under "Popular patterns". Shows the 4 most recent garments with a forward arrow that reveals the next 3 (pool of 7). Mobile viewports fall back to a native horizontal scroll with scroll-snap.
- **Release dates manifest** at `src/garments/release-dates.js` — single source of truth for garment release dates and the `getNewestGarmentIds()` helper that powers the carousel. Add new entries here as future garments ship.

---

## [0.12.49] - 2026-04-14

### Added
- **Mini Skirt (W)** — new womenswear garment module `mini-skirt-w` at 14" default length. Introduces three construction techniques not previously used in the catalog:
  - **Shaped front panel** with concave waist curve and a convex side seam that bulges outward through the hip then tapers slightly to the hem. No front darts — the side-seam curve and the contoured waistband do the shaping.
  - **Raised-peak back darts** — each back panel has a single waist dart drafted as a bezier-arched "peak" rising above the waistline, which flattens into a smooth curve when the dart is sewn closed. When the two mirrored back panels sit side by side, the combined waistline reads as a soft "W".
  - **Mirrored hem-allowance kick** — the hem allowance is baked into the polygon (not a parallel SA offset) with the side edge reflected across the hem fold line, so when the hem turns up the side edges lie flush against the panel side seams above without any trimming.
  - **Three-piece contoured waistband** — 1 front waistband on the fold + 2 mirrored back waistbands, drafted as shaped polygon pieces so the curved lower edge matches the skirt waist exactly. Slipstitched inside with no visible topstitch. Invisible zip at CB runs through both the back panels and the back waistband.
- **Micro Skirt (W)** — `micro-skirt-w` variant at 12" default length. Same construction as the mini skirt via the existing variants expansion in `src/garments/index.js`.
- **2 SVG garment illustrations** — `mini-skirt-w.svg` and `micro-skirt-w.svg` added to `/public/garment-illustrations/` via `scripts/gen-illustrations.mjs`.
- **SEO descriptions** for both skirts in `seo-descriptions.js`.
- **Pricing** — both mapped to `simple` tier ($9) in `pricing.js`.
- **Skirts wizard category** updated to include both new entries.

---

## [0.12.48] - 2026-04-14

### Added
- **9 new garment modules** (quick-win patterns with minimal geometry):
  - **Scrunchie** (`scrunchie.js`) — no body measurements; 1-rectangle construction; 3 size presets (standard 22″, mini 16″, oversized 28″); variants: `mini-scrunchie`, `oversized-scrunchie`
  - **Dog Bandana** (`dog-bandana.js`) — S/M/L/XL sizing by collar width; over-collar triangle fold or tie-on rectangle styles; lined option
  - **Zippered Pouch** (`zippered-pouch.js`) — 3 size presets (small 5×4″, medium 8×6″, large 10×7″); boxed corners, interior pocket, wrist loop options; variants: `makeup-bag`, `pencil-case`
  - **Pajama Pants** (`pajama-pants.js`) — elastic casing waistband + optional drawstring; flannel/voile/satin fabric options; variants: `flannel-pajama-pants`, `satin-pajama-pants`
  - **Lounge Shorts** (`lounge-shorts.js`) — pajama-pants lower block at 3–8″ inseam; knit or woven toggle changes SA; optional side-seam pockets
  - **Turtleneck** (`turtleneck.js`) — full upper-body block (same as tee.js); collar rectangle at 87% neck circumference; full/mock/funnel collar styles; variant: `mock-neck`
  - **Dolman / Batwing Top** (`dolman-top-w.js`) — T-shape one-piece; integrated sleeves, no set-in armhole; batwing underarm bezier curve; knit or woven; cap/elbow/¾/full sleeve lengths
  - **Maxi Skirt** (`maxi-skirt-w.js`) — floor-length A-line panels (~50″ default); elastic casing or invisible zip + structured waistband; hang-before-hemming instruction; variants: `maxi-skirt-elastic-w`, `maxi-skirt-zip-w`
  - **Trapeze Dress** (`trapeze-dress-w.js`) — sleeveless A-line from bust to hem; no waist shaping or darts; crew/scoop/square neckline; neckline + armhole facings; invisible zip or pullover back
- **SVG illustrations** for all new modules and variants (19 new SVG files in `public/garment-illustrations/`)
- **Pricing entries** for all 18 new garment IDs in `src/lib/pricing.js` (all `simple` tier, $9)
- **SEO descriptions** for all 18 new garment IDs in `src/garments/seo-descriptions.js`
- Pattern page count: 119 → 134 garments (combined with kids patterns from [0.12.47])

---
## [0.12.47] - 2026-04-14

### Added
- **Children's patterns (v0.8.0)** — 5 new garment modules for sizes 2T–14, each with child-appropriate ease, measurement defaults, and beginner-friendly construction:
  - `kids-tee` — Kids T-Shirt (crew/scoop neck, short/long sleeve, +2" standard ease)
  - `kids-joggers` — Kids Joggers (elastic-only waistband, straight/tapered leg, growth hem tuck)
  - `kids-leggings` — Kids Leggings (zero ease knit, ankle/capri/shorts length, high or mid waist)
  - `kids-shorts` — Kids Pull-On Shorts (elastic waist, 3 inseam lengths, optional side pockets)
  - `kids-dress` — Kids A-Line Dress (round/scoop/boat neck, sleeveless/cap sleeve, A-line skirt)
- **Children's filter tab** on the `/patterns` listing page — new "Children" tab filters to the 5 kids garments. Menswear tab no longer includes kids patterns.
- **Children's category in wizard** — "Children" category tile added to step 1 of the pattern wizard (between Accessories and the end of the list).
- **5 SVG garment illustrations** — `kids-tee.svg`, `kids-joggers.svg`, `kids-leggings.svg`, `kids-shorts.svg`, `kids-dress.svg` added to `/public/garment-illustrations/`.
- **Measurement min bounds lowered** for child compatibility: chest (30→18), waist (22→16), hip (28→18), shoulder (14→8), neck (13→9), bicep (10→6), torsoLength (14→8), rise (7→4), thigh (16→10). Adult defaults unchanged.
- **SEO descriptions** added for all 5 kids garments in `seo-descriptions.js`.
- **Pricing** — all 5 kids garments mapped to `simple` tier ($9) in `pricing.js`.
- **Related patterns** on garment detail pages now scopes by audience — kids patterns only relate to other kids patterns, adults to adults.
- **CHILDREN_SIZES avatar array** added to `src/engine/grading.js` — 10 sizes (2T–14) for pattern grading and PDF bundle size charts.

---

## [0.12.46] - 2026-04-14

### Fixed
- **Hoodie / Scholar Hoodie — hood face opening shape**: the face opening edge was a straight vertical line, which appeared convex and caused fabric bunching at the drawstring casing. Added a concave Bézier arc (~0.5″ inward bow at the cheek/chin zone) matching standard two-panel hood drafting practice. The Scholar Hoodie inherits the fix automatically since it delegates hood panel geometry to `hoodie.js`.

---

## [0.12.45] - 2026-04-14

### Fixed
- **Crop Jacket — lining pieces are now shaped polygons, not rectangles**: the first pass of the Detroit conversion shipped lining pieces as `type: 'pocket'` with `dimensions: { width, height }`, which renders as a flat rectangle in the piece view. That's wrong — a real front lining follows the front panel shape (neck curve, shoulder slope, armhole, side seam) with the inner edge clipped to the facing line, and a real back lining follows the back panel shape. Now derives `liningFrontPoly`, `liningBackPoly`, and `liningSleevePoly` from the actual shell polygons:
  - **Front lining**: clones `frontPoly` and snaps every point with `x < FACING_W` to `x = FACING_W`, then lifts the hem to `torsoLen − 1″`. When `neckW > FACING_W` the lining shows a real partial neck curve at the top inner area (e.g. neck=18″ → neckW=3.6 > FACING_W=3, so points 8–12 of the curve survive); when `neckW ≤ FACING_W` the inner edge is fully vertical. A `dedupPoly` helper drops consecutive duplicate points and any closing-point dupe so the polygon stays clean. Renders as `type: 'bodice'` so the piece view + yardage estimator handle it correctly.
  - **Back lining**: clones `backPoly` and only lifts hem points to `torsoLen − 1″`. Renders as `type: 'bodice'`, `isBack: true`, cut on fold.
  - **Sleeve lining**: rebuilt as a 4-point polygon at `slvTopW × 2` wide × `slvLength − 1″` tall (the shell sleeve is already a straight rectangle in this jacket). Renders as `type: 'sleeve'`.
- Verified with two body sizes (chest 38 / neck 15 → neckW = FACING_W exactly, and chest 44 / neck 18 → neckW > FACING_W) — polygon point counts and bounding boxes both come out right (front lining: 39 pts, BB 8.0 × 15.0 for the small size; back lining: 39 pts, BB 11.0 × 15.0; sleeve lining: 4 pts, BB 15.4 × 25.0).
- **Cropped Tee (fitted-tee-w) — `capPts is not defined` error**: `capPts` was declared with `const` inside the first `if/else` block's `else` branch, making it block-scoped and inaccessible to the second `else` branch that computed sleeve notches. Lifted the declaration to `let capPts` above both blocks so it is in scope throughout the sleeve section.

---

## [0.12.44] - 2026-04-14

### Added
- **Crop Jacket — full Carhartt Detroit conversion**: the crop jacket was marketed as a chore-coat / Detroit style but only supported button or snap closures and patch pockets. After auditing against a real Detroit jacket and FreeSewing's Jaeger / Carlton sources (fetched from GitHub since the local freesewing-develop repo isn't synced into the build environment), added five new options and up to seven new conditional pattern pieces:
  - **`closure: zipper`** (now the default) — exposed YKK #5 separating zipper at CF. Adds a `Zipper Guard Strip` piece (1.5″ × torsoLen, cut 2 L+R, interfaced) that folds behind the zipper tape to back the teeth and protect the wearer from cold metal. Materials gain the separating zipper notion (length = torsoLen + 2″) plus a single collar tab button or snap. Front facing instruction now references the guard strip when the zipper is selected. Dedicated install step uses the guard + zipper foot + topstitch sequence.
  - **`lining: poplin | flannel`** — adds three lining pieces: `Front Lining` (×2, frontW − facing width × torsoLen − 1, sewn to facing inner edge), `Back Lining` (cut on fold, ½″ CB pleat for ease), and `Sleeve Lining` (×2 mirror, bagged through sleeve hem). Materials gain 2.5 yd of poplin or brushed flannel (Carhartt blanket-lined style). Construction instructions add an "Assemble lining" + "Bag the lining" sequence after the body is built; lining hem floats 1″ shorter than shell.
  - **`lowerPocket: welt`** — replaces the hip patch pocket with a `Hip Welt Pocket` piece (cut 4: 2 welts 7″ × 1.5″ + 2 bags 7″ × 8″ per pocket, ×2 pockets). Construction step covers welt slash, clip-to-corners, understitch, bag attach, bar tack — the same workflow used by the trouser welt back pockets so the user only learns it once.
  - **`chestPocket: zip`** — replaces the patch chest pocket with a `Zippered Chest Pocket` (5″ × 7″ bag halves + 5″ × 1.5″ interfaced welt strip + 5″ #3 coil zipper). Dedicated welt + bag construction step. The original `patch` (with pencil slot) and `none` options are preserved.
  - **`innerPocket: welt`** — interior breast pocket cut from lining fabric. Requires `lining !== 'none'`. Adds `Inner Pocket Welt` (×2 L+R, 5″ × 3″ folded, interfaced) and `Inner Pocket Bag` (4 pieces, 5″ × 8″) following Jaeger/Carlton's inner pocket construction. Sewn into the lining BEFORE the lining is bagged into the shell.
  - **`cuff: tab`** — adjustable snap/button cuff tab (Detroit-style adjustable wrist). Adds `Adjustable Cuff Tab` piece (4 cut, 3″ × 2.5″, interfaced, folded + sewn + turned). Tab is attached to the underarm side of the sleeve hem before hemming with ~1″ adjustment range. Materials gain 2 cuff tab snaps or buttons.
- Reuses existing infrastructure: lining pattern follows `slip-skirt-w.js`, welt pocket pieces follow `pleated-shorts.js`, zipper guard concept follows `straight-jeans.js` fly shield, cuff tab follows `denim-jacket.js`. No new engine code, no new top-level dirs, fully within `src/garments/crop-jacket.js`.

### Fixed
- **Camp Shirt — sleeve missing cap curve**: the sleeve piece was drafted as a flat 4-point trapezoid with `capHeight: 0` and no sleeve cap geometry. Set-in sleeves require a curved cap to fit the armhole. Wired up `sleeveCapCurve` and `validateSleeveSeams` from `src/engine/upper-body.js` (already used by `button-up.js`) and rebuilt the sleeve polygon with a proper bezier cap curve (now 19 points, `capH = armholeDepth * 0.55`). Updated `sleeveEdgeAllowances` to dynamically cover all cap points with 0.375″ SA, and updated `sleeveNotches` and `dims` to reference cap geometry. Affects Camp Shirt, Fitted Camp Shirt, and Fitted Linen Camp Shirt variants.
- **Athletic Formal Trousers — waistband length bug**: `wbLen` for the elastic waistband was calculated from the hip-based garment opening (`(frontHipW + backHipW) * 2`), which also incorrectly included `outtuckExtra` that is already consumed by folding before the waistband is attached. Result was a 49″ waistband for a 32W / 36H, instead of the correct ~35″. Fixed by sizing the elastic waistband to the body waist measurement (`m.waist + 2 + sa * 2`) — the elastic gathers the wider trouser opening to fit. Fixed hybrid back waistband (`backWbLen`) the same way (`m.waist / 2 + 1 + sa * 2`). Updated instruction to note "gather trouser waist to fit band before attaching."
- **Athletic Formal Trousers — back patch pocket tilt direction**: `tiltDeg = -5` in `pattern-view.js` rotated the pocket indicator CW in SVG coordinates, making the CB edge higher (wrong direction). Changed to `tiltDeg = 5` so the side-seam edge is higher, which is the correct tailoring convention for back pants pockets.
- **Athletic Formal Trousers — CB raise default reduced**: default `cbRaise` reduced from 1.25″ to 0.75″. For a stretch jersey garment with an elastic waistband, 1.25″ is over-specified; 0.75″ provides adequate seat coverage without over-lifting the back waistline. The option is still adjustable (0–2.5″ in 0.25″ steps).

### Changed
- **Athletic Formal Trousers — side-seam pocket bag is now a shaped piece**: replaced the simple `type: 'pocket'` rectangle piece (7″ × 9″) with a fully drafted D-shaped polygon via the new `buildSideSeamPocketBag` engine function. The piece renders with a 7″ × 10″ cut outline (straight top and sides, semicircular bottom), SA offset, grain line, and dimension labels. Depth increased 9″ → 10″ for heavyweight jersey comfort.
- **Engine — `buildSideSeamPocketBag` added to `geometry.js`**: reusable D-shaped in-seam pocket bag builder. Uses `sampleBezier` for the semicircular bottom (two quarter-circle cubic bezier segments). Returns a `type: 'bodice'` piece compatible with `renderGenericPieceSVG` and `renderBodiceOrSleeveSVG`.

---

## [0.12.43] - 2026-04-14

### Fixed
- **Retro Short Trunks — pocket-mouth finish**: the side-seam pocket opening produced clean construction but didn't include the press / topstitch / bar-tack sequence needed for an RTW-quality finish. Updated three instruction strings: "Prepare pocket bags" now adds a press-under of the serged mouth edges ⅜″ to the wrong side; "Sew side seams" now adds a press-open of the closed seam, ⅛″ topstitch (stretch / narrow zigzag) along the full 4″ mouth on both front and back panels, and ties the bar tacks to the topstitch endpoints catching all layers (front + bag at top, both panels + bag tail at bottom); pocket bag piece label updated to mention the topstitch + bar tack finish so it's visible from the piece view alone. No geometry change.
- **Retro Short Trunks — pocket mouth notch on outer panels**: the pocket bag piece had a notch at the bottom of the 4″ pocket mouth on its side-seam edge, but `buildPanel` wasn't adding a matching notch on the front or back panel side seams. Without it the open / closed transition couldn't be aligned at sewing time. Added a side-seam notch at `y = 4.0″` on both front and back panels when `opts.pocket === 'side-seam'` and `opts.liner === 'brief'`.
- **Retro Short Trunks — Waistband Back size showing 0″**: the `waistband-back` piece was passing `dimensions: { length, height: wbWidth }` while `waistband-front` (and the renderer) expects `width`. The size label rendered as `17¼" × 0"`. Renamed the key to `width` so both halves display the correct 1½″ finished width.
- **Retro Short Trunks — pocket bag layer assignment**: the previous "Prepare pocket bags" / "Sew side seams" / pocket bag piece label all described basting both layers of the folded bag to the FRONT panel only. That's not how an in-seam pocket works. Updated all three to the correct construction: front bag layer is basted to the front panel along three edges (waistband stitch line, side seam edge, hem fold line); back bag layer is basted to the back panel along the matching three edges; the fold sits free in the middle and forms the inside of the pocket. Side seam step now explicitly catches all four layers below the mouth (front panel + front bag + back bag + back panel) and the topstitch / bar tack call-outs reference panel + bag layer at the appropriate transition points.
- **Swim Trunks — comfort finish on body seams**: the outer-shell CF, CB, side, and inseam steps previously sewed and pressed but never finished the raw edges, leaving them to rub against skin in sensitive areas. Updated all four steps to trim SA to ¼″, serge or zigzag the SAs together, press to one side (toward back for inseam and side seams), and topstitch ⅛″ from the seam line to lock the doubled SA flat against the body. For the side seam with retro pocket, the front pair (panel + front bag layer) and back pair (panel + back bag layer) are serged separately so no raw mesh edge touches skin. Both waistband construction steps now explicitly note that the waist seam SA and elastic are fully enclosed inside the waistband fold.

---

## [0.12.42] - 2026-04-14

### Fixed
- **Retro Short Trunks — brief leg opening now sized to thigh**: previously the leg arch was purely a function of waist + rise and ignored `m.thigh` entirely, so for anyone with a larger thigh-to-waist ratio the leg opening was uncomfortably tight (often needing >100% elastic stretch). Added two helpers — `solveBriefCrotchW` (solves for the crotch-seam width that gives a target arch chord length) and `briefArcLength` (samples the bezier to compute actual arc length). The brief's front and back arches are now sized so the combined fabric leg opening ≈ thigh × 0.92, putting the elastic stretch in the 50–70% range across normal body sizes. Added `[swim-trunks]` console warnings if the resulting opening would need >80% stretch (too tight) or <20% stretch (too loose). Side-drop ratios reduced (front 0.35→0.30, back 0.45→0.40) to give the chord more vertical room.

---

## [0.12.41] - 2026-04-14

### Fixed
- **Retro Short Trunks — pocket bag sizing**: `bagDepth` was hardcoded to 5″ regardless of the wearer's measurements, producing a narrow rectangle that didn't match the front panel. Now derived from front panel geometry: `bagDepth = frontW + frontExt`, so the folded pocket bag spans the full width of the front panel hem. Mesh yardage bumped from 0.25 yd to 0.5 yd to match.
- **Retro Short Trunks — brief liner polygon shape**: `buildBriefPanel` was producing a single-lobed curve with no side edge and no crotch seam — the leg arch ran straight from the outer waist corner to the CF/CB center, which doesn't resemble a real brief. Rewritten as a proper 5-edge polygon: waist, side edge (straight vertical), leg arch (concave bezier), crotch seam (short horizontal), CF/CB seam. Front uses `sideDrop = 0.35·H`, `crotchW = 0.30·W`; back uses `sideDrop = 0.45·H`, `crotchW = 0.45·W` (wider seat, shallower arch). Notches added at leg-arch start and crotch corner. "Sew brief liner" instructions updated to reference the new edge structure and clarify that elastic applies only to the curved leg arch, not the straight side edge.

---

## [0.12.40] - 2026-04-14

### Fixed
- **Retro Short Trunks — brief liner seam finishing**: CF, CB, and crotch seam steps now explicitly instruct to trim SA to ¼″, press to one side, and topstitch flat. This prevents raw serged edges from sitting against skin in the crotch/groin area.
- **Retro Short Trunks — leg arch elastic upgraded to FOE**: instructions now offer ⅝″ foldover elastic (FOE) as the preferred option over plain ¼″ lingerie elastic. FOE folds over the raw arch edge, enclosing both sides in one pass — no separate serging, softer against skin. Plain lingerie elastic remains listed as an alternative. FOE added to the materials list (1 yard covers all 4 leg arch openings at 75% stretch).

---

## [0.12.39] - 2026-04-14

### Fixed
- **Retro Short Trunks — brief liner rendering**: `brief-front` and `brief-back` pieces were `type: 'panel'` but lacked the panel-specific props (`width`, `height`, `ext`, `rise`, `inseam`, `cbRaise`), so the UI showed "Panel width: undefined" with no polygon. Changed to `type: 'bodice'` with explicit `width`/`height`/`isCutOnFold: false` so the shaped arch polygon now renders correctly in the pattern view.
- **Retro Short Trunks — pocket bag rendering**: same fix applied to the `pocket-bag` piece (`type: 'panel'` → `type: 'bodice'`). Shaped rectangular polygon now renders in the pattern view with fold-edge and side-seam labels.
- **Retro Short Trunks — brief liner gusset removed**: brief liner simplified from 3 pieces (front×2, back×2, gusset×1) to 2 pieces (front×2, back×2). The gusset was unnecessary — front and back panels now join directly at a crotch seam, which is the standard construction for commercial retro brief liners. `buildBriefPanel` updated so the leg arch bezier terminates at x=0 (CF/CB center) instead of at a gusset attachment point. Instructions updated accordingly.
- **Retro Short Trunks — waistband dimension display**: `dimensions: { length, height }` should have been `{ length, width }`. The pocket-renderer display string uses `pd.width` for the second dimension; `height` caused "undefined" to appear. Fixed to `{ length, width }`.
- **Fly shield in PDF**: `renderPocketPlacement` in `print-layout.js` was drawing the fly shield outline on all front panels (including swim trunks, gym shorts, etc.) because the gate was `if (!isBack)`. Fixed to `if (!isBack && opts?.fly)` so the overlay only appears on garments with the fly option active.
- **Notch centroid bias**: both `polygonCentroid` in `pattern-view.js` and the equivalent inline computation in `print-layout.js` `renderNotchesPrint` used vertex-average centroid. High-density bezier curves (e.g. 96-point crotch arch) skewed the centroid toward the crotch corner, occasionally flipping the inward-normal selection. Changed to bounding-box center `(minX+maxX)/2, (minY+maxY)/2` in both files for bias-free inward normal selection.
- **Labels in `renderGenericPieceSVG`**: added `piece.labels` rendering support to the bodice/generic SVG renderer in `pattern-view.js`. Labels array `[{ text, x, y, rotation }]` now renders as amber text overlays on the shaped polygon preview.

---

## [0.12.38] - 2026-04-14

### Fixed
- **Notch marks — UI preview**: all notch triangles in the pattern piece preview now point **inward** (apex toward the piece interior), matching industry-standard sewing pattern notation. Previously `renderNotchesSVG` in `pattern-view.js` picked the outward normal, so triangles pointed outside the cut line. The PDF renderer (`print-layout.js`) was already correct; the UI renderer now matches it.
- **Retro Short Trunks — waistband visual markers**: waistband-front and waistband-back pieces converted from `type: 'rectangle'` (no SVG preview) to `type: 'pocket'` (mini SVG with mark rendering). CF position is now marked on the front waistband with a dashed green line; CB center reference is marked on the back waistband.
- **Retro Short Trunks — elastic construction**: switched from CB-loop (thread through gap with bodkin) to side-seam-catch method. Elastic ends are stitched within the SA at each short end of the back waistband before assembly; they are automatically caught when joining the waistband halves at the side seams. No threading gap or bodkin step needed. Construction steps and materials updated accordingly.
- **Retro Short Trunks — pocket mouth finishing**: added instruction to serge/zigzag the raw edges of each front and back panel separately along the 4″ pocket mouth zone before sewing the side seams. Added bartack instruction at the top and bottom of each pocket mouth opening (width 3.5mm, length 0, 8–10 stitches) to prevent the opening from extending under stress.
- **Retro Short Trunks — missing mesh material**: athletic mesh was not listed in the materials spec when `liner: 'brief'` + `pocket: 'side-seam'`. Added `0.25 yard Athletic mesh` (pocket bags only) for this combination.
- **Retro Short Trunks — needle spec**: changed from generic `ballpoint-80` (for cotton jersey) to `stretch-75` (Schmetz Stretch 75/11, for Lycra/spandex blends) when retro mode is active, matching the 4-way stretch nylon/spandex shell fabric. Non-retro swim trunks retain `ballpoint-80`.

---

## [0.12.37] - 2026-04-14

### Fixed
- **Retro Short Trunks — waistband sizing**: waistband pieces were incorrectly sized to the hip-based panel width (~42" total for 31" waist / 36" hip). Waistband pieces must be sized to the body waist, not the hip panels. Fixed: `wbFrontLen = wbBackLen = waist/2 + 0.5" ease + SA×2`. For 31" waist this yields 17" per half = 34" total. The outer panels remain correctly hip-sized; the stretch fabric eases into the narrower waistband. Elastic inside back casing updated to `waist/2 × 0.88` with the rationale documented.
- **Retro Short Trunks — pocket bag**: replaced the free-hanging vertical bag (which could protrude past the 3" hem) with a folded, anchored design. One piece per side (8" wide, folds to 4" deep toward crotch × full garment height). Top caught in waistband seam, outer edge into side seam (4" left open from waistband = pocket mouth, side seam closed below to hem), bottom caught in hem fold. Bag cannot dangle. Sewing sequence updated across pocket prep, side seam, and hem steps.

---

## [0.12.36] - 2026-04-13

### Fixed
- **Retro Short Trunks — brief liner shape**: replaced single rectangular placeholder with 3 properly named pieces: `Brief Liner Front` (cut 2, mirror), `Brief Liner Back` (cut 2, mirror, taller for seat coverage), and `Brief Liner Gusset` (cut 1). Dimensions are now body-measurement-based (waist/4 + ease) rather than hip-panel-derived. Instructions updated to describe marking the leg opening arc, joining CF/CB seams, attaching the gusset, and basting the finished mini brief to the outer shell.
- **Retro Short Trunks — pocket bag depth**: pocket bag height is now constrained to `min(6.5″, max(2.0″, inseam − hem − 0.75″))` so the bag never protrudes past the hem. For the default 3″ inseam this yields a 2.0″ bag depth (appropriate for a key card). Bag width reduced from 6.0″ to 5.5″ to match the shorter cut.
- **Swim Trunks waistband sizing** (no code change): the 21″ back + 21.5″ front waistband lengths for a 31″ waist are correct. The waistband pieces are sized to the hip-based garment opening; the elastic casing (back) and drawcord (front) cinch the garment to the actual waist measurement.

---

## [0.12.35] - 2026-04-13

### Fixed
- **Retro Short Trunks default inseam** set to 3″. The variant was inheriting the base `swim-trunks` default of 5″ because the variant expansion loop did not support `measurementDefaults` overrides. Added `measurementDefaults: { inseam: 3 }` to the retro variant definition and updated the expansion loop in `index.js` to shallow-merge variant `measurementDefaults` over the base module's `measurementDefaults`. Any future variant can now override specific measurement defaults the same way.

---

## [0.12.34] - 2026-04-13

### Added
- **Running Shorts** and **Basketball Shorts** tiles (variants of `gym-shorts`): both were previously registered but lacked sport-specific side-split defaults. Running Shorts now defaults to `sideSplit: '2'`; Basketball Shorts defaults to `sideSplit: '1'`.
- **Hiking Shorts** tile (new variant of `cargo-shorts`): defaults to drawstring waist, slant front pockets, cargo pockets, and 1″ hem. Fabric note recommends ripstop nylon or nylon-stretch. ROADMAP item fulfilled.
- **Retro Short Trunks** tile (new variant of `swim-trunks`): 3″ inseam slim-fit trunks modeled after the 70s/80s California retro style. Defaults to `liner: 'brief'`, `sideSplit: '1'`, slim ease. Construction uses a brief-cut elastane liner (one piece, basted to outer at waist) rather than four full mesh panels, and a hybrid elastic-back / drawcord-front waistband identical to the gym-shorts pattern.

### Changed
- **`gym-shorts.js`**: added `sideSplit` option (`none` / `1″` / `2″`). Notch mark added at slit-top on side seam. Bar-tack step inserted before hem step when a split is active. Affects Running Shorts and Basketball Shorts variant defaults.
- **`swim-trunks.js`**: renamed `liner: 'yes'` to `liner: 'panels'` (backward-compatible default update). Added `liner: 'brief'` option (brief-cut elastane piece, retro style). Added `sideSplit` option (`none` / `1″`). Added `backPocket` option (`none` / small patch). Waistband splits into hybrid front/back halves when `liner: 'brief'` is active. Materials list conditionally adds ¾″ elastic and soft elastane for retro variant.

---

## [0.12.33] - 2026-04-13

### Added
- **Tunnel belt loop option** (Dickies-style) for Straight Jeans / Soloist Jeans (via delegation). New `beltLoopStyle` option with three values: `individual` (the classic 5/6/7 narrow loops, default and unchanged), `tunnel` (discrete wide patches tacked top-and-bottom across the waistband to form horizontal belt tunnels), and `none`. The tunnel build emits two pieces: `Tunnel Belt Loop (wide)` cuts 5 patches at 4″ × 2¼″ for CB / both back panels / both side seams; `Tunnel Belt Loop (narrow)` cuts 2 patches at 2¼″ × 2¼″ for the front hip bones flanking the fly. Each patch finishes ~1½″ tall (matching the waistband) and bows out to clear a 1¼″ belt. Instructions branch on style: individual is unchanged; tunnel runs a "Prep tunnel patches" step (press long edges under, topstitch) followed by "Apply tunnel patches across waistband" (tack top and bottom raw edges directly along the existing waistband topstitching lines, bartack the corners). Waistband instruction text also branches so the "loops sandwiched between waist and band" line only appears for individual loops.

---

## [0.12.32] - 2026-04-13

### Fixed
- **Back yoke now actually closes the back darts.** Straight Jeans / Soloist Jeans (via delegation): the previous yoke split sliced the rectangular top off the back panel without rotating the dart wedges shut, so the yoke top edge was as wide as `backHipW` instead of `backWaistW`. Every render with `yokeStyle: 'pointed'` or `'curved'` produced a back assembly the waistband couldn't attach to without ruching. Soloist Jeans defaults to `pointed`, so it hit this bug out of the box. Fixed by adding a new `closeYokeDarts` helper in `src/engine/geometry.js` that rotates each dart wedge closed about its apex (right-to-left rotation pass, panel-classified so the rotations compose order-independently), and rewriting `splitBackYoke` to consume `backPanel.darts` and rebuild the lower-panel top edge from the post-rotation seam line so the two pieces mate exactly.

### Changed
- **Coin pocket attaches to the right front panel directly**, not to a loose pocket backing. Added a coin-pocket placement notch to the front panel notches array (right-front mirror only) so position is unambiguous, and merged the previously duplicated scoop/non-scoop coin pocket steps into a single early step that runs right after "Prepare back patch pockets". Matches traditional Levi's-style construction where the coin pocket is sewn through the denim before any pocket-bag assembly.
- **Belt loop instructions reconciled with the pieces spec.** The instruction step previously hardcoded `5` strips at `1½″ × (waistband + 1½″)`, while the pieces section already cut `waist > 36 ? 7 : 6` strips at `2¼″ × 3½″`. The instruction now uses the same `beltLoopCount` variable and the same finished `¾″ × ~2¾″` dimensions.
- **Center-back rise + seat curve are now one step**, not two. The previous "Flat-fell CB rise (straight portion only)" + "Double-stitch curved crotch seat" split asked the user to mark a transition point that doesn't exist on the pattern, then change technique mid-seam. Production jeans sew the entire CB-to-seat-curve in one pass with reinforcement double-stitching; the instructions now say the same.
- **Inseam step rewritten to remove the phantom "join legs at crotch" pass.** The old wording read as if the user re-sewed the crotch curve after sewing the inseams (it had already been sewn earlier as part of the seat curve). New wording explicitly states each leg's inseam closes flat from hem to crotch notch and that the crotch curves should already meet at the junction.
- **Fly install split into 5 short steps** (Prep fly pieces / Sew CF curve / Right tape / Left tape / Shield + topstitch + bartack) instead of one 10-substep wall of text.
- **Waistband install split into 3 steps** (Prep waistband / Attach to waist / Finish interior).
- **Soloist Jeans gets actual silhouette defaults** instead of no-op overrides matching the straight-jeans defaults: `legShape: 'slim'`, `riseStyle: 'low'`, `inseam: 33` (longer for the dragging-hem look), `frontExt: 1.75`, `backExt: 3.25` (deeper back, shallower front), retaining `frontPocket: 'square-scoop'` and `yokeStyle: 'pointed'`. Header comment now spells out the long/lean Takahiromiyashita silhouette intent.

### Added
- **Fly Extension piece** (`buildFlyExtension`) — the rectangular underlap behind the CF that carries the zipper tape was previously missing from the piece list even though the assembly steps referenced it. Now cut as `Cut 2 (left + right mirror) · Self fabric · Interface left · ¼″ SA · 1⅜″ × (flyLen + 1″)`.
- **`closeYokeDarts(yokePoly, darts)` in `src/engine/geometry.js`** — rotates each dart wedge closed about its apex via a right-to-left rotation pass with panel classification, so two rotations about distinct points compose order-independently. Available for any future yoke-from-darted-panel construction.

---

## [0.12.31] - 2026-04-13

### Changed
- **Wide-Leg Trouser (M)** (`wide-leg-trouser-m`): four improvements from tailoring research.
  - **Belt loops added** (were entirely missing): structured waistband now generates a `belt-loop` rectangle piece (cut 5, self-fabric, 1½″ × 4″), a belt-loop notion, and a dedicated "Prepare and attach belt loops" instruction step covering fold/press/edge-stitch, placement (CF×2, side seam×2, CB×1), and top-stitch over WB.
  - **Cuff construction fixed**: `hem` option changed from a numeric value (used only as SA inset) to named keys (`plain` / `cuff175` / `cuff200`). For turn-up cuffs, leg height `H` is extended by 2× finished cuff depth and the hem polygon inset is 0.5″ SA, producing the correct amount of fabric to fold back. Previous 2″ "wide cuff fold" option only provided 2″ of fabric — physically impossible to make a 2″ turn-up with. Added 1¾″ English cuff option.
  - **Pleat depth** bumped 1.25″ → 1.5″ per pleat, matching `pleated-trousers.js` and research consensus that 1.25″ is skimpy.
  - **Pleat direction option** (`pleatDir`): forward (opens toward CF, Italian, most slimming) or reverse (opens toward side seam, RTW standard). Defaults to forward. `showWhen` suppresses it when pleats are off. Instruction and step detail reflect the chosen direction.
  - Zipper notion renamed from "Invisible zipper" to "Coil zipper" (fly zips are standard coil/metal, not invisible). Hook-and-eye renamed to "Trouser hook-and-bar".
  - Seasonal fabric note added: linen 3–5 oz for summer, worsted wool 8–11 oz for winter, tropical wool/crepe 6–8 oz for formal, with 4 oz minimum weight advisory for wide-leg drape.

---

## [0.12.30] - 2026-04-13

### Added
- **Scholar Sweatpants** (`scholar-sweatpants`): new lower-body garment modeled after the Alo Yoga Scholar Straight Leg Sweatpant. Thin wrapper over `sweatpants.js` with Scholar defaults (wide ease, straight leg, mid rise, deeper back crotch extension at 3.25″) plus signature welt-zip side pockets. Adds `welt-strip` and `welt-pocket-bag` pieces, a coil pocket zipper notion (2 × 6″), light fusible interfacing, and four dedicated construction steps (mark opening, attach welt and cut, install zipper, attach bags) inserted before the side seam step. Base slash/slant/side pockets are suppressed so the Scholar welt-zip is the only pocket construction.
- **Scholar Hoodie** (`scholar-hoodie`): new upper-body garment modeled after the Alo Scholar Hooded Sweater. Reimplements the bodice and sleeve with dropped-shoulder geometry — shoulder point extended laterally by the new `shoulderDrop` option (default 2.5″, range 1–4″), slope flattened to near-zero, armhole lowered by the drop amount, and a shallow sleeve cap at 0.35× armhole depth to match the relaxed drop. Delegates hood, kangaroo pocket, and rib cuff construction to `hoodie.js` (forced to `fit: 'oversized'` and `frontStyle: 'pullover'`) so the hood curve math and pocket geometry stay in one place. Custom 4″-cut / 2″-finished rib hem at 90% of body hem for the taller Scholar rib. New "Set sleeves (dropped-shoulder note)" step inserted before the standard set-sleeves step. Appended fabric notes recommend heavyweight sweater-knit cotton (or heavy jersey/interlock) as the correct hand.
- SVG catalog-card illustrations for `scholar-sweatpants`, `scholar-hoodie`, and `soloist-jeans` (the Soloist card was previously missing an illustration and had been falling through to a placeholder). Scholar pant illustration calls out the welt-zip side pockets and external drawcord grommets. Scholar hoodie illustration shows the dropped-shoulder seam, taller rib hem, and two-panel hood. Soloist illustration shows the square-scoop front pocket opening and a hinted pointed back yoke.
- SEO description entry for `soloist-jeans` in `seo-descriptions.js` (previously missing, triggering a build warning). The new entry covers the square-scoop pocket opening and denim weight recommendation. Build is now warning-free for SEO and catalog illustrations across all 97 garments.

---

## [0.12.29] - 2026-04-13

### Changed
- Unified flat-fell method across all seams in Straight Jeans / Soloist Jeans assembly instructions. CB rise flat-fell was previously a "true" flat-fell (sew WST, open flat, fold, topstitch) while outseams and inseams used the "felled seam" method (sew RST, press to one side, trim under-SA, fold over-SA, topstitch). Both methods produce an identical topstitched flat-fell visible on the RS, but the inconsistency forced the sewer to mentally switch between WST and RST mode partway through construction. CB rise is now RST + press-to-side + fell, matching the outseam and inseam convention. No finished-garment difference.

---

## [0.12.28] - 2026-04-13

### Fixed
- Yoke flat-fell instructions (Straight Jeans, Soloist Jeans via delegation): trimmed lower panel SA was reduced from ¼″ to 3/16″ to match the rest of the file's flat-fell convention (CB rise, outseam, inseam all use 3/16″). At ¼″ trim with a 5/8″ over-SA, the fold-over barely cleared the trimmed edge and the second topstitch row at ¼″ landed right on the fold edge. Also spelled out the previously-implicit "tuck raw edge under ¼″" step so home sewers don't end up with raw edges peeking out from under the topstitching.
- Back rise + crotch seat instructions: split the old combined "Join back panels at CB" step into two distinct steps — "Flat-fell CB rise (straight portion only)" and "Double-stitch curved crotch seat". The combined step required sewing two separate 5/8″ seams under one step header, which read as though the user was being told to stitch the same seam twice. Split also lets the reader mark and sew the straight portion first (where flat-felling works) before re-opening and RST-joining the curve (where it doesn't). Clarified the ambiguous "1/2″ inside the first" reinforcement-row wording to "1/2″ from the raw edge (1/8″ outside the first row, closer to the raw edge)".

---

## [0.12.27] - 2026-04-13

### Fixed
- Square-scoop pocket opening depth: reduced `scoopDepth` from 6″ to 4″ on Straight Jeans (and Soloist Jeans via delegation). Previously the bottom of the L-shaped opening finished ~7.5″ below the top of the finished waistband (6″ panel + 1.5″ waistband), which is ~2″ too deep for comfortable hand insertion. New depth puts the bottom of the opening ~5.5″ below the finished waistband top, matching standard jeans/workwear hand-pocket geometry. Also tightened the square-scoop backing (`bagDepth` 7 → 5) and bag (`bagDepth` 11.5 → 10) proportionally so the pocket bag isn't disproportionately long for the shallower opening.

---

## [0.12.26] - 2026-04-12

### Fixed
- Coin pocket construction: removed the spurious "outer + lining" 2-layer construction on Straight Jeans, Soloist Jeans (via delegation), Baggy Jeans, Baggy Shorts, and Cargo Work Pants. The coin pocket is now cut as a single layer with ⅜″ SA on sides/bottom and ½″ SA on top for a double-fold hem, then pressed under with a cardboard template and topstitched directly onto the pocket backing. This matches traditional Levi's-style construction and the existing back patch pocket build in `straight-jeans.js`. Two layers of denim added unnecessary bulk and wasted fabric.
- Straight Jeans coin pocket piece: corrected a typo in the SA annotation (`⅞″` → `⅜″`, matching the actual `sa: 0.375` value).

---

## [0.12.25] - 2026-04-11

### Fixed
- Front panel side seam now flows smoothly past the pocket opening on all three pocket styles (slant, scoop, square-scoop). The pocket opening endpoint is now interpolated to land on the actual side seam at the pocket depth, eliminating the kink/notch that appeared where the opening met the tapered side seam.
- Print overflow: "Construction Order" pages no longer overflow the physical page boundary in browser print preview. Root cause was `LINE_H = 0.135` in `buildInstructionsPage` — a 60% underestimate of the actual rendered line height for `.step-d { font-size:10pt; line-height:1.55 }` (≈ 0.215 in). Updated to `LINE_H = 0.215`, tightened `CHARS_PER_LINE` from 85 to 78, and added a 0.2 in safety buffer to the available height calculation. Each instruction page now packs the correct number of steps.
- Print overflow: glossary terms moved to a dedicated page (`buildGlossaryPage`) so the Materials page stays within one physical page and the glossary never overflows the bottom margin. Glossary page is omitted when no terms are in use.
- Print layout: wide pieces (yokes, cuffs) now use landscape orientation when portrait and landscape require the same number of tile pages. The tiebreak in `computeTileLayout` now prefers landscape when `wIn > hIn`, matching the physical shape of the piece.
- Print layout: last tile page missing for waistband and pocket bag pieces. Root cause was an off-by-one in `computeTileLayout` margin-trim: `contentH/W` was computed as `span - 2*renderMargin + sa` but the SA cut line extends `sa` beyond the polygon on both ends, so the correct formula is `+ 2*sa`. The undercount caused the trim to incorrectly drop the last row or column tile for pieces near the tile-boundary threshold.
- Print layout: Scale Verification tile map now uses a wider SVG (660px vs 460px) so pieces have more room across the full page width.
- Print layout: "Important Notes" section on the Materials page now renders in two columns, matching the two-column layout used elsewhere on the page.
- Print layout: Coin Pocket pattern piece now renders with square top corners and rounded bottom corners, matching the actual construction (top edge is sewn flush to the waist seam; only the bottom is rounded).

### Changed
- Soloist Jeans: removed bone/skeleton vinyl template pieces. The garment now uses the straight jeans piece set directly.

---

## [0.12.24] - 2026-04-11

### Added
- Fly shield placement indicator on the front panel pattern piece: dashed rectangle at the CF edge spanning ~60% of the rise, labeled "fly shield (left only)". Visible in both the on-screen pattern view and print layout.

### Changed
- Rewrote all construction steps in Straight Jeans (and Soloist Jeans, which delegates to it) with detailed, technique-accurate guidance:
  - **Join back panels at CB**: now covers WST flat-fell for the back rise (two-row topstitch 1/8 inch and 1/4 inch) then RST double-stitch for the crotch curve (two rows, serge/clip, press toward back).
  - **Install zip fly**: expanded from one sentence to a 10-sub-step sequence covering interface, staystitch, CF join, right zipper tape, left zipper tape, fly shield assembly, baste, J-topstitch, bar tack, and check.
  - **Sew outseams**: clarified flat-fell direction (toward back) with explicit two-row topstitch detail.
  - **Sew inseam**: corrected from "continuous seam from hem to hem" to sewing each inseam tube individually (hem to crotch notch), fellling toward front, then joining the crotch seat by turning one leg inside the other with a double-stitched reinforced seam.
  - **Construct and attach waistband**: added overlap/underlap extension lengths (1-1/4 inch left for buttonhole, 5/8 inch right for button), grade SA, and topstitch detail.
  - **Belt loops**: split into two correctly ordered steps — "Make belt loop strips" (baste tops to waist SA before waistband is attached) and "Finish belt loops" (flip up, fold and topstitch base, bar tack) after waistband is attached. Removed the previously misplaced single-step.

---

## [0.12.23] - 2026-04-11

### Added
- Reduced seam allowance (3/8 inch) on the scoop pocket opening curve of fold-over bag pieces via `edgeAllowances`. The J-curve opening edges now carry their own SA that prints narrower than the rest of the bag, matching RTW construction practice. Label "opening" with the 3/8 inch value is rendered alongside the arc on both screen and print.
- Rivet drill marks on the front panel pattern piece at both endpoints of the scoop pocket opening: where the J-curve meets the waist seam (top) and where it meets the side seam (bottom). Labeled "rivet" on both screen and print.
- Rivet drill marks on the coin pocket pattern piece at the top-left and top-right corners, with label "bar tack / rivet". Visible in both screen preview (app.js mini SVG) and print PDF.
- Button/buttonhole mark on the waistband pattern piece: drill mark + circle at the overlap/buttonhole end, labeled "button/buttonhole" in the print layout.

---

## [0.12.22] - 2026-04-11

### Added
- Coin pocket placement indicator on scoop and square-scoop pocket backing pattern pieces: dashed rectangle with drill marks and "coin pocket" label in the upper-right corner, visible in both the on-screen pattern view and print layout.
- Rounded bottom corners (0.5 inch radius) on coin pocket pattern piece. Corner radius is now supported in `renderPocketSVG` for any pocket piece that declares `cornerRadius`.
- New construction step in Straight Jeans and Soloist Jeans instructions: attach coin pocket to the right pocket backing before assembling the scoop pocket unit. Replaces the previous generic step that incorrectly directed attaching to the front panel.

---

## [0.12.21] - 2026-04-11

### Fixed
- Rear patch pocket vertical placement now scales with seat depth instead of using a fixed 3 inch offset. Pocket is centered on the hip line, matching the industry standard of "centered on the seat."
- Rear patch pocket no longer crosses the yoke seam on yoke-split back panels. Added top-edge clamping that pushes the pocket down when rotated vertices would breach the diagonal yoke seam.

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
