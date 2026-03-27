// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * TEMPLATE.js — canonical reference for adding new garment modules.
 * DO NOT import this file in index.js — it is documentation only.
 *
 * KNOWN BUGS TO AVOID:
 * - Never divide calf or ankle measurements by 4 — use / 2 + 0.5
 * - Never use easeDistribution().front directly as panel width
 *   addition without verifying the math adds up to total ease
 * - Always use 'interfacing-med' for medium interfacing,
 *   'interfacing-light' for light — never 'interfacing-medium'
 * - Waistband length for button/zip closures needs +2" overlap
 * - For bodice modules: the bb() helper should return
 *   {width: maxX-minX, height: maxY-minY} not {maxX, maxY}
 * - Mirror polygons: after negating x, shift by minX to keep
 *   all coordinates positive
 * - Piece width/height fields should be bounding box dimensions,
 *   not max coordinates
 */

// ── LOWER BODY EASE PATTERN (correct) ────────────────────────────────────────
// Example for a 36" hip with 2.5" ease:
//   frontW = 36/4 + 0.2*2.5 = 9 + 0.5 = 9.5
//   backW  = 36/4 + 0.3*2.5 = 9 + 0.75 = 9.75
//   total  = (9.5 + 9.75) * 2 = 38.5 ✓

function exampleLowerBodyEase(m, easeVal) {
  const easeFront = easeVal * 0.2;  // per-panel front (20% of total)
  const easeBack  = easeVal * 0.3;  // per-panel back (30% of total)
  const frontW = m.hip / 4 + easeFront;
  const backW  = m.hip / 4 + easeBack;
  // Verify: (frontW + backW) * 2 ≈ m.hip + easeVal ✓
  return { frontW, backW };
}

// ── UPPER BODY EASE PATTERN (correct) ────────────────────────────────────────
// Both front and back half-panels are equal so side seams align when sewn.

function exampleUpperBodyEase(m, totalEase) {
  const panelW = (m.chest + totalEase) / 4;
  // Both front and back use panelW so side seams align
  // Verify: panelW * 4 = m.chest + totalEase ✓
  return panelW;
}

// ── MIRROR POLYGON PATTERN (correct) ─────────────────────────────────────────
function mirrorPolyCorrect(rightPoly) {
  const mirrorXs = rightPoly.map(p => -p.x);
  const minMirrorX = Math.min(...mirrorXs);
  // Shift so leftmost point is at x=0 (all coordinates positive)
  return rightPoly.map(p => ({ x: -p.x - minMirrorX, y: p.y })).reverse();
}

// ── BOUNDING BOX HELPER (correct) ────────────────────────────────────────────
function bb(poly) {
  const xs = poly.map(p => p.x), ys = poly.map(p => p.y);
  return {
    maxX: Math.max(...xs),
    maxY: Math.max(...ys),
    width: Math.max(...xs) - Math.min(...xs),   // use .width for piece width
    height: Math.max(...ys) - Math.min(...ys),  // use .height for piece height
  };
}

// ── CALF / ANKLE DIVISION (correct) ──────────────────────────────────────────
// Trousers have 2 panels (front + back), not 4.
function calfAnkleExample(calf, ankle, width, shape) {
  const kneeW = calf  ? calf  / 2 + 0.5 : width * shape.knee;
  const hemW  = ankle ? ankle / 2 + 0.5 : width * shape.hem;
  return { kneeW, hemW };
}

// ── NOTCH MARKS ────────────────────────────────────────────────────────────────
// Add a `notches` array to each piece object. Each notch is { x, y, angle }
// where angle (degrees) points outward from the cut line perpendicular.
// Use edgeAngle(a, b) from geometry.js to compute the angle between two polygon
// vertices — it returns the outward perpendicular direction.
//
// Lower body: hip on side seam, crotch junction, knee on both seams (if pants)
// Upper body: shoulder midpoint, chest on side seam, 2 armhole quarter points
// Sleeves:    center cap notch, 2 quarter notches
// Skirts:     hip on side seam, dart endpoints, CF/CB marks
//
// The renderers (pattern-view.js, print-layout.js) auto-render notches as
// filled 0.25″ triangles. If a piece has no notches array, it renders fine.

// BEFORE SUBMITTING A NEW MODULE, VERIFY:
// [ ] (frontW + backW) * 2 = m.hip + total ease
// [ ] panelW * 4 = m.chest + total ease
// [ ] All interfacing refs use 'interfacing-med' or 'interfacing-light'
// [ ] Waistband length includes flyOverlap (+2") if closure !== elastic/none
// [ ] Calf/ankle use / 2 + 0.5 not / 4
// [ ] bb() returns width/height not maxX/maxY
// [ ] Mirror polygons shift to positive coordinate space
// [ ] Copyright header is first line of file
// [ ] Notches added to all polygon-based pieces (see notch section above)
// [ ] Do not push duplicate closure points (neckline curves already emit CF/CB)
