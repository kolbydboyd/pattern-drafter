# People's Patterns — Bug Fix Session

Work through every numbered task below in order. Complete 
each task fully before moving to the next. After every task 
run `npm run build` to catch errors early. Do not stop for 
confirmation unless you hit an error you cannot resolve.

When all tasks are complete, report:
- Which tasks were completed successfully
- Any tasks that were skipped and why
- Any remaining build errors

## 1 - Core Geometry Fix
In src/engine/geometry.js, fix the easeDistribution function. 
The current implementation doubles the ease because it adds 
ease.front to each front panel and ease.back to each back panel, 
but each panel is already a quarter of the hip measurement. 
The total ease across the finished garment ends up being 2x the 
intended value.

Fix: change the distribution so that front = total * 0.2 and 
back = total * 0.3 (these are per-panel values that sum to 
total * 0.5, which across front+back panels gives total ease).

Current:
  return { front: total * 0.4, back: total * 0.6, total };

Fix to:
  return { front: total * 0.2, back: total * 0.3, total };

This single fix corrects cargo-shorts.js, gym-shorts.js, 
chinos.js, and pleated-shorts.js simultaneously since they all 
call easeDistribution().

After making the change, verify that for a 36" hip with 
'regular' ease (2.5"), the sum (frontW + backW) * 2 equals 
approximately 38.5" (hip + ease). 
frontW = 36/4 + 0.2*2.5 = 9 + 0.5 = 9.5
backW  = 36/4 + 0.3*2.5 = 9 + 0.75 = 9.75
total  = (9.5 + 9.75) * 2 = 38.5 ✓
## 2 - Calf/Ankle Division Bug (3 files)
In src/garments/chinos.js, src/garments/easy-pant-w.js, and 
src/garments/straight-trouser-w.js, fix the calf and ankle 
measurement division in the buildPanel function.

The current code divides by 4 as if there are 4 panels, but 
trousers only have 2 panels (front and back). This produces 
knee and hem widths that are half what they should be, making 
patterns unwearable.

In each file, find:
  const kneeW = calf  ? calf  / 4 : width * shape.knee;
  const hemW  = ankle ? ankle / 4 : width * shape.hem;

Replace with:
  const kneeW = calf  ? calf  / 2 + 0.5 : width * shape.knee;
  const hemW  = ankle ? ankle / 2 + 0.5 : width * shape.hem;

The 0.5 adds a small ease allowance per panel (1" total across 
both panels), consistent with how the hip measurement is handled.

Apply this fix in all three files. The variable names may differ 
slightly between files (kIn, hIn, kneeInward etc.) but the 
pattern is the same — find where calf and ankle measurements 
are divided and apply the fix.
## 3 - Shirt Dress Mirror Polygon Bug
In src/garments/shirt-dress-w.js, fix the front left bodice 
panel mirror calculation. The current code negates x coordinates 
which produces all-negative values, causing the polygon to render 
outside the SVG viewport.

Find this code in the pieces() function:
  const frontLeftPoly = frontRightPoly
    .map(p => ({ x: -p.x, y: p.y }))
    .reverse();

Replace with:
  const mirrorXs = frontRightPoly.map(p => -p.x);
  const minMirrorX = Math.min(...mirrorXs);
  const frontLeftPoly = frontRightPoly
    .map(p => ({ x: -p.x - minMirrorX, y: p.y }))
    .reverse();

This shifts the mirrored polygon so its leftmost point is at 
x=0, keeping all coordinates positive and the piece visible 
in the SVG viewport.

Also fix the bb() helper function in this file. Currently it 
returns { maxX, maxY } which gives coordinates not dimensions. 
Change it to match the other modules:
  function bb(poly) {
    const xs = poly.map(p => p.x), ys = poly.map(p => p.y);
    return { 
      maxX: Math.max(...xs),
      maxY: Math.max(...ys),
      width: Math.max(...xs) - Math.min(...xs),
      height: Math.max(...ys) - Math.min(...ys)
    };
  }

Then update the piece objects that use bb() to use .width and 
.height instead of .maxX and .maxY for the width and height 
fields.
## 4 - Gym Shorts Bugs (3 issues in one file)
In src/garments/gym-shorts.js, fix three bugs in the pieces() 
function:

BUG 1 — Waistband ease doubled:
Find:
  const wbFrontLen = (m.waist / 2 + ease.front * 2) + sa * 2;
  const wbBackLen  = (m.waist / 2 + ease.back  * 2) + sa * 2;
Replace with:
  const wbFrontLen = (m.waist / 2 + ease.front) + sa * 2;
  const wbBackLen  = (m.waist / 2 + ease.back)  + sa * 2;

BUG 2 — Liner width too narrow:
Find:
  const linerW = frontW - 1;
  const linerH = H - inseam * 0.35;
Replace with:
  const linerW = m.hip / 2 + 2;
  const linerH = H - inseam * 0.35;

BUG 3 — Liner instruction references wrong fabric:
The liner piece currently says 'Cut 2 (mirror) from athletic mesh'.
A brief liner should be cut from the same fabric or mesh but the 
cut count is wrong — it should say 'Cut 1 pair (mirror)' or 
'Cut 2 mirrored pieces'. Leave the instruction as-is, this is 
minor.
## 5 - Hoodie Zipper Length Bug
In src/garments/hoodie.js, fix the full-zip zipper length 
calculation in the pieces() function.

A full-zip hoodie's zipper runs from the hem to the neckline — 
it does NOT run through the hood. The hood attaches above the 
neckline where the zipper ends.

Find:
  const zipLength = torsoLen + hoodH + 2;

Replace with:
  const zipLength = torsoLen + 2;

Also find the zipper-tape piece that uses zipLength for its 
height and verify it uses the corrected value.

Also update the materials notions section — find where the 
separating zipper quantity is calculated and ensure it uses 
the same corrected formula:
  Math.ceil(m.torsoLength + 2)  
instead of including hoodH.
## 6 - Easy Pant Yoga Band Length Bug
In src/garments/easy-pant-w.js, fix the yoga band waistband 
length calculation. The current formula uses the waist 
measurement at 90% which is far shorter than the actual pant 
waist opening.

In the pieces() function, find where frontW and backW are 
calculated (they use hip/4 + ease), then find the yoga band 
piece:

Find:
  dimensions: { length: m.waist * 0.9, width: 6 }

Replace with:
  const pantOpening = (frontW + backW) * 2;
  // ... then in the piece:
  dimensions: { length: Math.round(pantOpening * 0.85 * 4) / 4, width: 6 }

The pantOpening calculation must come after frontW and backW 
are defined. The 0.85 ratio is the stretch ratio for a knit 
yoga band — it should be stretched to meet the pant opening.

Also update the instruction string to reflect the correct 
length using fmtInches().
## 7 - Materials Database: Standardize Interfacing Keys
In src/engine/materials.js, add missing interfacing entries to 
STANDARD_NOTIONS and standardize the keys used across all 
garment modules.

STEP 1 — Add to STANDARD_NOTIONS in materials.js:
  'interfacing-light': { 
    name: 'Lightweight fusible interfacing', 
    notes: 'Pellon SF101 or similar — for lightweight wovens and facings' 
  },
  'interfacing-medium': { 
    name: 'Medium fusible interfacing', 
    notes: 'Pellon SF101 or similar' 
  },

STEP 2 — Audit all garment files for interfacing key usage.
Some files use 'interfacing-med', some use 'interfacing-medium', 
some use 'interfacing-light'. Standardize as follows:
  - Heavy interfacing: keep 'interfacing-heavy' (already exists)
  - Medium interfacing: standardize to 'interfacing-med' 
    (already exists in STANDARD_NOTIONS)
  - Light interfacing: add 'interfacing-light' (new entry above)

STEP 3 — In these files, change 'interfacing-medium' to 
'interfacing-med':
  src/garments/shirt-dress-w.js

STEP 4 — Verify 'interfacing-light' is now handled in:
  src/garments/shell-blouse-w.js
  src/garments/wide-leg-trouser-w.js  
  src/garments/straight-trouser-w.js
  src/garments/crop-jacket.js

After changes, the buildMaterialsSpec() function should 
successfully look up all interfacing keys without returning 
empty objects.
## 8 - Belt Loop Dimensions in Chinos
In src/garments/chinos.js, fix the belt loop piece dimensions. 
The current dimensions represent the finished size, not the 
cut size, leaving no room for seam allowances or folding.

Find the belt-loop piece:
  dimensions: { width: 1.75, height: 0.75 }

Replace with:
  dimensions: { length: 4, width: 2.5 }

The length of 4" gives enough material to fold under at both 
ends for waistband attachment. The width of 2.5" folds in 
thirds to produce a ¾" finished width.

Also update the instruction to:
  'Cut 6-7 strips · Fold in thirds lengthwise (¾″ finished) · 
   Length 4″ · Fold under ends before attaching to waistband'
## 9 - Cargo Shorts Waistband Length for Fly Closures
In src/garments/cargo-shorts.js, fix the waistband length 
calculation to account for the button/buttonhole overlap 
extension when a fly closure is used.

Find in pieces():
  const wbLength = m.hip + ease.total + sa * 2;

Replace with:
  const flyOverlap = (opts.fly === 'none') ? 0 : 2;
  const wbLength = m.hip + ease.total + flyOverlap + sa * 2;

The 2" overlap provides room for the button and buttonhole 
on non-elastic closures. Elastic waistbands don't need this 
extension since they stretch to fit.
## 10 - A-Line Skirt Lining and Zero-Dart Edge Case
In src/garments/a-line-skirt-w.js, fix two issues:

FIX 1 — Dart edge case:
Find:
  const dartW = Math.max(0.25, Math.min(dartIntake / 2, 0.75));

Replace with:
  const dartW = dartIntake > 0.5 
    ? Math.min(dartIntake / 2, 0.75) 
    : 0;

Then in the buildPanel function, only include the dart 
instruction when dartW > 0:
  const dartNote = dartW > 0 
    ? `2 darts · ${fmtInches(dartW)} wide × ${fmtInches(dartL)} long · at ¼ and ¾ of waist edge`
    : 'No darts needed — waist and hip measurements are close';

FIX 2 — Lining pieces use wrong shape:
The lining pieces are currently specified as rectangles but the 
skirt is a trapezoid. Add a note to the instruction rather than 
attempting to generate the correct trapezoid shape:

Find the lining-front and lining-back pieces and update their 
instructions to:
  'Cut 1 on fold · USE MAIN SKIRT PANEL AS TEMPLATE — 
   trace the panel shape, shorten ¾″ from hem edge · 
   Float free at hem, tack to side seams only'

Remove the dimensions field from both lining pieces since the 
dimensions don't represent the correct shape, and add a note 
to the materials section explaining this.
## 11 - App.js Infrastructure Fixes
In src/ui/app.js, make these fixes:

FIX 1 — Remove duplicate GARMENTS registry:
The file currently defines its own GARMENTS object that 
duplicates src/garments/index.js. Remove the inline GARMENTS 
object definition and replace with:
  import GARMENTS from '../garments/index.js';

Keep all the import statements for individual garment modules 
at the top of the file — these are needed for the static 
bundler. Only remove the duplicate object literal.

FIX 2 — Replace prompt() for profile naming:
Find saveCurrentProfile() which uses:
  const name = prompt('Profile name:')?.trim();

Add an inline name input to the UI instead. In buildInputs(), 
after the save/delete buttons, add an input field:
  <input type="text" id="profile-name-input" 
    placeholder="Profile name" style="width:120px">

Then in saveCurrentProfile(), change to:
  const nameInput = document.getElementById('profile-name-input');
  const name = nameInput?.value?.trim();
  if (!name) { 
    nameInput?.focus(); 
    return; 
  }
  nameInput.value = '';

FIX 3 — Fix chest circumference calculation for split-front garments:
Find in _generate():
  const frontP = pieces.find(p => 
    p.id === 'bodice-front' || p.id === 'bodice-front-right');
  const chestCirc = frontP ? frontP.width * 4 : 0;

Replace with:
  const frontP = pieces.find(p => 
    p.id === 'bodice-front' || p.id === 'bodice-front-right');
  const PLACKET_W = 1.5;
  const panelWidth = frontP 
    ? (frontP.id === 'bodice-front-right' 
        ? frontP.width - PLACKET_W 
        : frontP.width)
    : 0;
  const chestCirc = panelWidth * 4;

FIX 4 — Add localStorage try/catch for dark mode:
Find:
  applyTheme(localStorage.getItem('theme') === 'dark');

Replace with:
  function getSavedTheme() {
    try { return localStorage.getItem('theme'); } catch { return null; }
  }
  applyTheme(getSavedTheme() === 'dark');
## 12 - Yardage Calculator: On-Fold Pieces
In src/ui/app.js, fix the calculateYardage() function to 
correctly handle pieces that are cut on fold.

Currently for bodice and sleeve pieces, the function uses 
p.width directly, but p.width is the HALF-width of a folded 
piece. When the fabric is unfolded to cut, you need twice 
that width on the fabric.

Find in calculateYardage():
  } else if (p.type === 'bodice' || p.type === 'sleeve') {
    const sa = p.sa || 0.625;
    w     = (p.width  || 0) + sa * 2;
    h     = (p.height || 0) + sa * 2;
    count = extractCutCount(p.instruction);
  }

Replace with:
  } else if (p.type === 'bodice' || p.type === 'sleeve') {
    const sa = p.sa || 0.625;
    const isFold = p.instruction?.toLowerCase().includes('on fold');
    w = (isFold ? (p.width || 0) * 2 : (p.width || 0)) + sa * 2;
    h = (p.height || 0) + sa * 2;
    count = isFold ? 1 : extractCutCount(p.instruction);
  }

This correctly doubles the width for folded pieces and sets 
count to 1 since cutting on fold produces the full piece in 
one cut.
## 13 - New Garment Template and Guard Rails
Create a new file src/garments/TEMPLATE.js that serves as the 
canonical reference for adding new garment modules. This file 
should not be imported by index.js — it's documentation only.

The template should include:

1. A comment block at the top listing all known bugs to avoid:
   - Never divide calf or ankle measurements by 4 — use / 2 + 0.5
   - Never use easeDistribution().front directly as panel width 
     addition without verifying the math adds up to total ease
   - Always use 'interfacing-med' for medium interfacing, 
     'interfacing-light' for light — never 'interfacing-medium'
   - Waistband length for button/zip closures needs +2" overlap
   - For bodice modules: the bb() helper should return 
     {width: maxX-minX, height: maxY-minY} not {maxX, maxY}
   - Mirror polygons: after negating x, shift by minX to keep 
     all coordinates positive
   - Piece width/height fields should be bounding box dimensions, 
     not max coordinates

2. A minimal working lower-body garment template showing the 
   correct ease calculation pattern:
   const easeVal = /* total ease */;
   const easeFront = easeVal * 0.45;  // per-panel front
   const easeBack  = easeVal * 0.55;  // per-panel back  
   const frontW = m.hip / 4 + easeFront;
   const backW  = m.hip / 4 + easeBack;
   // Verify: (frontW + backW) * 2 ≈ m.hip + easeVal ✓

3. A minimal working upper-body garment template showing the 
   correct chest ease calculation:
   const totalEase = /* e.g. 4 */;
   const panelW = (m.chest + totalEase) / 4;
   // Both front and back use panelW so side seams align
   // Verify: panelW * 4 = m.chest + totalEase ✓

4. A checklist comment at the bottom of the template:
   // BEFORE SUBMITTING A NEW MODULE, VERIFY:
   // [ ] (frontW + backW) * 2 = m.hip + total ease
   // [ ] panelW * 4 = m.chest + total ease  
   // [ ] All interfacing refs use 'interfacing-med' or 'interfacing-light'
   // [ ] Waistband length includes fly overlap if closure !== elastic
   // [ ] Calf/ankle use / 2 + 0.5 not / 4
   // [ ] bb() returns width/height not maxX/maxY
   // [ ] Mirror polygons shift to positive coordinate space
## 14 - Copyright Headers and License
Make these two changes:

CHANGE 1 — Add copyright header to all source files:
Add the following comment as the FIRST line of every .js file 
in src/ (before the existing JSDoc comment if present):

  // Copyright (c) 2026 People's Patterns LLC. All rights reserved.

Files to update:
  src/engine/geometry.js
  src/engine/upper-body.js
  src/engine/measurements.js
  src/engine/materials.js
  src/ui/app.js
  src/ui/pattern-view.js
  src/ui/measurement-teacher.js
  src/pdf/print-layout.js
  src/garments/index.js
  src/garments/cargo-shorts.js
  src/garments/gym-shorts.js
  src/garments/swim-trunks.js
  src/garments/pleated-shorts.js
  src/garments/straight-jeans.js
  src/garments/chinos.js
  src/garments/pleated-trousers.js
  src/garments/sweatpants.js
  src/garments/tee.js
  src/garments/camp-shirt.js
  src/garments/crewneck.js
  src/garments/hoodie.js
  src/garments/crop-jacket.js
  src/garments/wide-leg-trouser-w.js
  src/garments/straight-trouser-w.js
  src/garments/easy-pant-w.js
  src/garments/button-up-w.js
  src/garments/shell-blouse-w.js
  src/garments/fitted-tee-w.js
  src/garments/slip-skirt-w.js
  src/garments/a-line-skirt-w.js
  src/garments/shirt-dress-w.js
  src/garments/wrap-dress-w.js

CHANGE 2 — Update README.md:
Find the License section that says "MIT" and replace with:

  ## License

  Copyright (c) 2026 People's Patterns LLC. All rights reserved.
  
  Unauthorized copying, distribution, modification, or commercial 
  use of this software is prohibited without explicit written 
  permission from People's Patterns LLC.

## 15a - Dead Code Cleanup
Remove dead variables and clean up inconsistencies across all 
garment files. These don't affect functionality but create 
confusion when reading the code.

CLEANUP 1 — Remove effCrossBack dead variable:
In each of these files, find and remove the line:
  const effCrossBack = m.crossBack || (m.shoulder - 2);
This variable is computed but never used in any of them.

Files:
  src/garments/tee.js
  src/garments/crewneck.js
  src/garments/hoodie.js
  src/garments/crop-jacket.js
  src/garments/shirt-dress-w.js
  src/garments/fitted-tee-w.js
  src/garments/shell-blouse-w.js
  src/garments/button-up-w.js

CLEANUP 2 — Remove unused EASE_VALUES import:
In src/garments/pleated-trousers.js, find:
  import { ..., EASE_VALUES } from '../engine/geometry.js';
Remove EASE_VALUES from the import since the module defines 
its own ease constants and never uses EASE_VALUES.

CLEANUP 3 — Fix dead qty ternary in cargo-shorts:
In src/garments/cargo-shorts.js, find:
  const qty = opts.backPocket === 'patch2' ? 2 : 2;
Replace with just removing the qty variable and using 2 
directly in the instruction string, or make it meaningful:
  const qty = opts.backPocket === 'patch2' ? 4 : 2;
(patch2 = 2 pockets × 2 panels each = 4 pieces total)
Update the instruction to use qty.

CLEANUP 4 — Remove NECK_DEPTH_FRONT.crew null entry in tee.js:
Find:
  crew:  null, // computed: neckW + 0.5
Remove this entry entirely since it's never reached (crew 
case is handled by the ternary before this object is accessed).

## 15b - Additional Code Cleanup
Fix remaining issues across all files not covered by earlier prompts.

TASK 15A — Remove effCrossBack dead variable
In each file listed below, find and remove this line:
  const effCrossBack = m.crossBack || (m.shoulder - 2);
The variable is computed but never used anywhere in any of these files.

Files to update:
  src/garments/tee.js
  src/garments/crewneck.js
  src/garments/hoodie.js
  src/garments/crop-jacket.js
  src/garments/shirt-dress-w.js
  src/garments/fitted-tee-w.js
  src/garments/shell-blouse-w.js
  src/garments/button-up-w.js
  src/garments/camp-shirt.js
  src/garments/wrap-dress-w.js


TASK 15B — Fix sweatpants ease calculation
In src/garments/sweatpants.js, in the pieces() function:

Step 1 — Remove this line entirely (the result is never used):
  const ease = easeDistribution(opts.ease === 'wide' ? 'relaxed' : opts.ease);

Step 2 — Change:
  const easeFront = easeVal * 0.4;
  const easeBack  = easeVal * 0.6;
To:
  const easeFront = easeVal * 0.2;
  const easeBack  = easeVal * 0.3;

Verify after the fix: for a 36" hip with relaxed ease (4"),
  frontW = 36/4 + 0.2*4 = 9 + 0.8 = 9.8
  backW  = 36/4 + 0.3*4 = 9 + 1.2 = 10.2
  total  = (9.8 + 10.2) * 2 = 40" = 36 + 4 ✓


TASK 15C — Fix sweatpants calf and ankle division
In src/garments/sweatpants.js, in the buildPanel function at the bottom
of the file, find:
  const kneeW = calf  ? calf  / 4 : width * shape.knee;
  const hemW  = ankle ? ankle / 4 : width * shape.hem;

Change to:
  const kneeW = calf  ? calf  / 2 + 0.5 : width * shape.knee;
  const hemW  = ankle ? ankle / 2 + 0.5 : width * shape.hem;


TASK 15D — Fix slip-skirt-w interfacing key
In src/garments/slip-skirt-w.js, in the materials() function, find:
  { ref: 'interfacing-medium', quantity: ... }

Change 'interfacing-medium' to 'interfacing-med' to match the
key that actually exists in the STANDARD_NOTIONS database.


TASK 15E — Fix wrap-dress-w sleeve piece dimensions
In src/garments/wrap-dress-w.js, find the sleeve piece definition.
It currently sets width and height using raw bounding box coordinates:
  width: slvBB.maxX, height: slvBB.maxY,

Change to:
  width: slvBB.width, height: slvBB.height,

Note: the bb() function in this file already returns both maxX/maxY
AND width/height, so .width and .height are available.


TASK 15F — Remove unused EASE_VALUES import in pleated-trousers
In src/garments/pleated-trousers.js, find the import line from
geometry.js. It includes EASE_VALUES which is never used in the file.
Remove EASE_VALUES from the import. The module defines its own
ease constants inline.


TASK 15G — Fix dead qty ternary in cargo-shorts
In src/garments/cargo-shorts.js, in pieces(), find:
  const qty = opts.backPocket === 'patch2' ? 2 : 2;

Both branches return 2, making this meaningless. Change to:
  const qty = opts.backPocket === 'patch2' ? 4 : 2;

patch2 means 2 pockets × 2 panels = 4 pieces total.
patch1 means 1 pocket per back panel = 2 pieces total.

Update the instruction string that uses qty to reflect this.


TASK 15H — Remove unreachable null entry in tee.js
In src/garments/tee.js, find the NECK_DEPTH_FRONT object near
the top of the file:
  const NECK_DEPTH_FRONT = {
    crew:  null, // computed: neckW + 0.5
    vneck: 9.0,
    scoop: 6.5,
  };

Remove the crew: null line entirely. The crew case is handled
by a ternary before this object is ever accessed, so this entry
is unreachable and the null comment is misleading.


TASK 15I — Add copyright header to files not yet covered
The earlier prompt added headers to src/ files but missed the
new files. Add this as the first line of each:
  // Copyright (c) 2026 People's Patterns LLC. All rights reserved.

Files:
  src/garments/camp-shirt.js
  src/garments/slip-skirt-w.js
  src/garments/swim-trunks.js
  src/garments/sweatpants.js
  src/garments/wrap-dress-w.js
  src/ui/measurement-teacher.js


After completing all tasks above, run npm run build and confirm
no errors were introduced. Report which tasks completed
successfully and flag any that could not be completed.

## 16 - Additional File Audit
Audit these files for the same bugs found in similar modules:

src/garments/swim-trunks.js — check for:
  - easeDistribution() ease doubling (fix same as cargo-shorts)
  - calf/4 division if present
  - riseOverride falsy-zero bug

src/garments/sweatpants.js — check for:
  - easeDistribution() ease doubling
  - calf/4 division if present  
  - riseOverride falsy-zero bug
  - elastic waistband length calculation (compare to gym-shorts fix)

src/garments/camp-shirt.js — check for:
  - effCrossBack dead variable (remove it)
  - sleeve ease not fit-aware (compare to tee.js fix)
  - bb() returns maxX/maxY instead of width/height

src/garments/slip-skirt-w.js — check for:
  - zero-dart edge case (same fix as a-line-skirt-w.js)
  - waistband length calculation
  - lining pieces using wrong shape if lining option exists

src/garments/wrap-dress-w.js — check for:
  - effCrossBack dead variable
  - bb() implementation consistency
  - skirt panel width calculation

src/ui/measurement-teacher.js — check for:
  - any hardcoded measurement ranges that conflict with 
    the min/max values in measurements.js

Apply the same fixes found in the audited modules. 
Add the copyright header to each file.

## When all tasks are complete:
- Run `npm run build` one final time
- Confirm no files still contain `effCrossBack`
- Confirm no files still contain `calf / 4` or `ankle / 4`
- Confirm `easeDistribution` returns `total * 0.2` and `total * 0.3`
- Report which tasks were completed and any that were skipped