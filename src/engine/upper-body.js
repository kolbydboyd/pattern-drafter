// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Upper body geometry engine.
 *
 * Provides bezier control points and helper functions for constructing bodice,
 * shirt, and jacket blocks. Pairs with geometry.js — all control point objects
 * are {x, y} in inches and are directly compatible with sampleBezier().
 *
 * Coordinate convention used throughout this module (unless a function
 * documents its own system):
 *
 *   x — horizontal, positive toward the side seam / away from CF or CB
 *   y — vertical, positive downward
 *
 * The caller is responsible for mirroring / offsetting into the full pattern
 * coordinate space. Every function works in a local frame anchored at its
 * natural origin (documented per function) so the curves can be composed
 * without coupling to a specific block layout.
 */

// ── Ease tables ────────────────────────────────────────────────────────────

/**
 * Total chest ease by fit style (inches, added to chest circumference).
 * Front receives 55%, back 45% — see chestEaseDistribution().
 */
export const UPPER_EASE = {
  fitted:    2,
  standard:  4,
  relaxed:   6,
  oversized: 10,
};

/**
 * Distribute total chest ease across front and back panels.
 * Front gets 55% (more ease over bust), back 45%.
 *
 * @param {number} ease - Total chest ease in inches
 * @returns {{ front: number, back: number, total: number }}
 */
export function chestEaseDistribution(ease) {
  return { front: ease * 0.55, back: ease * 0.45, total: ease };
}

/**
 * Armhole level derived from chest measurement.
 *
 * Returns the Y-coordinate of the underarm notch measured from the pattern
 * top (point A — the fold/shoulder baseline intersection). Callers that pass
 * the result to armholeCurve() must subtract slopeDrop (typically 1.75 in)
 * to obtain the depth from the shoulder point:
 *
 *   const armholeY     = armholeDepthFromChest(chest, style);
 *   const armholeDepth = armholeY - slopeDrop;   // → armholeCurve 4th arg
 *
 * Classic block drafting rule: scye depth = chest / 4.
 * A small tolerance is added per style so that fitted garments sit slightly
 * higher and oversized ones slightly lower.
 *
 * @param {number} chest - Chest circumference in inches
 * @param {string} [style='standard'] - 'fitted' | 'standard' | 'oversized'
 * @returns {number} Y position of underarm from pattern top (in)
 */
export function armholeDepthFromChest(chest, style = 'standard') {
  const tolerance = { fitted: 0, standard: 0.5, oversized: 1.5 };
  return chest / 4 + (tolerance[style] ?? 0.5);
}

// ── Core curve functions ───────────────────────────────────────────────────

/**
 * Armhole curve — shoulder point → underarm notch.
 *
 * Describes the armhole scye on the bodice/jacket side panel. The front and
 * back differ in a key, visible way:
 *
 *   Back  — a subtle outward bow near the shoulder accommodates shoulder-blade
 *            movement. The curve is comparatively shallow and straight.
 *   Front — a deeper, more pronounced scoop through the chest creates the
 *            forward-roll of the front armhole.
 *
 * Local frame
 *   Origin  p0  shoulder point (top of armhole, at shoulder seam level)
 *   End     p3  (chestDepth, armholeDepth) — underarm notch
 *   x+      toward the side seam (outward); back p1.x is slightly negative
 *           because the back armhole initially bows inward before sweeping out
 *   y+      downward
 *
 * Typical parameter ranges
 *   shoulderWidth  4.5 – 6.5 in
 *   chestDepth     2.0 – 3.5 in  (half-scye width at underarm)
 *   armholeDepth   7.0 – 9.5 in  (use armholeDepthFromChest() as starting point)
 *
 * @param {number}  shoulderWidth  - Shoulder seam length, neck to shoulder point (in)
 * @param {number}  chestDepth     - Horizontal extent of the armhole at underarm level (in)
 * @param {number}  armholeDepth   - Vertical depth from shoulder to underarm (in)
 * @param {boolean} isBack         - true → back armhole; false → front armhole
 * @returns {{ p0, p1, p2, p3 }}   Cubic bezier control points
 */
export function armholeCurve(shoulderWidth, chestDepth, armholeDepth, isBack) {
  const p0 = { x: 0,          y: 0            }; // shoulder point
  const p3 = { x: chestDepth, y: armholeDepth }; // underarm notch

  if (isBack) {
    // Slight inward bow (negative x) near the shoulder for shoulder-blade ease,
    // then a clean sweep toward the underarm.
    return {
      p0,
      p1: { x: -chestDepth * 0.12, y: armholeDepth * 0.30 },
      p2: { x:  chestDepth * 0.50, y: armholeDepth * 0.68 },
      p3,
    };
  } else {
    // Deeper forward scoop characteristic of the front armhole.
    return {
      p0,
      p1: { x: chestDepth * 0.28, y: armholeDepth * 0.46 },
      p2: { x: chestDepth * 0.78, y: armholeDepth * 0.80 },
      p3,
    };
  }
}

/**
 * Shoulder slope — neck point → shoulder point as a bezier straight line.
 *
 * The shoulder drops `slopeDrop` inches over the shoulder width. Returned as
 * a bezier with collinear control points so it integrates seamlessly with
 * sampleBezier() for consistent pipeline usage.
 *
 * Local frame
 *   Origin  p0  neck point (top of shoulder at neckline junction)
 *   End     p3  (shoulderWidth, slopeDrop) — shoulder point
 *   x+      toward the shoulder (outward from neck)
 *   y+      downward (shoulder drops below neck baseline)
 *
 * Typical parameter ranges
 *   shoulderWidth  4.5 – 6.5 in  (half back-neck to shoulder-point)
 *   slopeDrop      1.25 – 2.0 in (front is typically 0.25 in flatter than back)
 *
 * @param {number} shoulderWidth - Distance from neck point to shoulder point (in)
 * @param {number} slopeDrop     - Vertical drop of the shoulder over that distance (in)
 * @returns {{ p0, p1, p2, p3 }}
 */
export function shoulderSlope(shoulderWidth, slopeDrop) {
  // Straight line as cubic bezier — control points at 1/3 and 2/3 along the line
  return {
    p0: { x: 0,                   y: 0                  },
    p1: { x: shoulderWidth / 3,   y: slopeDrop / 3      },
    p2: { x: shoulderWidth * 2/3, y: slopeDrop * 2/3    },
    p3: { x: shoulderWidth,       y: slopeDrop          },
  };
}

/**
 * Neckline curve — shoulder-neck junction → CF / CB neckline point.
 *
 * Describes one half of the neckline (the bodice always has a CF or CB fold,
 * so only the half is drafted). The four supported styles differ in both
 * curve character and intended depth:
 *
 *   'crew'   Rounded quarter-circle. Sits at the base of the neck.
 *            Front depth ≈ 2.5 in, back ≈ 0.75 in, width ≈ 3 in.
 *
 *   'v-neck' Near-straight diagonal line, meeting at a sharp point at CF.
 *            Front depth ≈ 7 – 10 in, back stays as shallow crew.
 *            Width ≈ 3 – 3.5 in.
 *
 *   'scoop'  Elongated rounded curve, wide and deep. The curve drops more
 *            quickly near the shoulder, then flattens as it arrives at CF.
 *            Front depth ≈ 5 – 8 in, width ≈ 3.5 – 4 in.
 *
 *   'boat'   Nearly horizontal. Wide with very shallow depth.
 *            Front depth ≈ 1 – 1.5 in, width ≈ 4 – 5 in.
 *            Front neck is always deeper than back — boat back depth ≈ 0.75 in.
 *
 * Local frame
 *   Origin  p0  shoulder-neck junction (where neckline meets shoulder seam)
 *   End     p3  (neckWidth, neckDepth) — CF or CB neckline low point
 *   x+      toward CF / CB (inward from shoulder)
 *   y+      downward (neckline sits below the shoulder baseline)
 *
 * @param {number} neckWidth - Half neckline width, shoulder to CF/CB (in)
 * @param {number} neckDepth - Depth below shoulder baseline to the CF/CB point (in)
 * @param {string} style     - 'crew' | 'v-neck' | 'scoop' | 'boat'
 * @returns {{ p0, p1, p2, p3 }}
 */
export function necklineCurve(neckWidth, neckDepth, style) {
  const p0 = { x: 0,         y: 0         }; // shoulder-neck junction
  const p3 = { x: neckWidth, y: neckDepth }; // CF / CB low point

  switch (style) {

    case 'crew':
      // Classic rounded quarter-circle. Tangent is nearly vertical at the
      // shoulder end and nearly horizontal arriving at CF/CB.
      // Control-point ratio ≈ 0.5523 mirrors the standard bezier circle approx.
      return {
        p0,
        p1: { x: 0,                y: neckDepth * 0.55 },
        p2: { x: neckWidth * 0.55, y: neckDepth        },
        p3,
      };

    case 'v-neck':
      // Near-straight diagonal. Control points are slightly bowed inward near
      // the CF apex to give the subtle concave appearance of a real V.
      return {
        p0,
        p1: { x: neckWidth * 0.22, y: neckDepth * 0.28 },
        p2: { x: neckWidth * 0.52, y: neckDepth * 0.82 },
        p3,
      };

    case 'scoop':
      // The curve drops steeply right from the shoulder then flattens as it
      // reaches the CF — the opposite cadence of a crew neck.
      return {
        p0,
        p1: { x: neckWidth * 0.08, y: neckDepth * 0.65 },
        p2: { x: neckWidth * 0.60, y: neckDepth * 0.98 },
        p3,
      };

    case 'boat':
      // Almost a horizontal line. The curve barely departs from shoulder height
      // and arrives nearly flat at CF/CB.
      return {
        p0,
        p1: { x: neckWidth * 0.02, y: neckDepth * 0.90 },
        p2: { x: neckWidth * 0.25, y: neckDepth        },
        p3,
      };

    default:
      // Fallback — treat unknown styles as crew
      return {
        p0,
        p1: { x: 0,                y: neckDepth * 0.55 },
        p2: { x: neckWidth * 0.55, y: neckDepth        },
        p3,
      };
  }
}

/**
 * Sleeve cap curve — back underarm notch → front underarm notch.
 *
 * Describes the full cap of a one-piece sleeve laid flat, from the back
 * underarm notch across the crown to the front underarm notch. The cap is
 * slightly asymmetric: the back (left) side is a touch flatter and the front
 * (right) side slightly fuller, matching the front/back armhole asymmetry.
 *
 * The "ease" in the sleeve cap — the fact that the cap seam is longer than
 * the armhole — is baked into the shape: a taller capHeight relative to
 * sleeveWidth produces more ease. Typical ease is 1 – 1.5 inches.
 *
 * Cap height guide
 *   5.0 – 5.5 in  casual / relaxed (less ease, easier to set)
 *   5.5 – 6.0 in  standard tailored shirt
 *   6.0 – 6.5 in  structured jacket (more ease for shoulder shaping)
 *
 * Local frame
 *   Origin  p0  back underarm notch  (x = 0,           y = 0)
 *   End     p3  front underarm notch (x = sleeveWidth,  y = 0)
 *   Crown       approximately at x = sleeveWidth / 2,   y = −capHeight
 *   x+      toward front of sleeve
 *   y+      downward (crown is above underarm baseline, so y is negative there)
 *
 * @param {number} bicep       - Bicep circumference (in) — used for proportional checks
 * @param {number} capHeight   - Vertical distance from underarm to crown (in), typically 5–6.5
 * @param {number} sleeveWidth - Full width of sleeve at underarm (in), ≈ bicep / 2 + 1–2 ease
 * @returns {{ p0, p1, p2, p3 }}
 */
export function sleeveCapCurve(bicep, capHeight, sleeveWidth) {
  // crownPull sets how far above the underarm baseline the control points pull
  // the bezier. A value of -capHeight * 0.42 places the actual crown point
  // (at t ≈ 0.5) at approximately -capHeight * 0.16 above the baseline —
  // this matches real cap ease measurements well.
  const crownPull = -capHeight * 0.42;

  return {
    p0: { x: 0,                  y: 0          }, // back underarm notch
    p1: { x: sleeveWidth * 0.14, y: crownPull  }, // back cap — slightly narrower
    p2: { x: sleeveWidth * 0.84, y: crownPull  }, // front cap — slightly wider
    p3: { x: sleeveWidth,        y: 0          }, // front underarm notch
  };
}

// ── Derived / utility ──────────────────────────────────────────────────────

/**
 * Compute the approximate sleeve cap ease — the extra length sewn into the
 * cap so it can be "eased in" to the armhole. Uses the bezier arc length
 * approximation (chord sum with n segments).
 *
 * Ease of 1 – 1.5 in is typical for woven shirts.
 * Ease > 2 in indicates a structured jacket with pad-stitched canvas.
 * Ease < 0.75 in works for knit fabrics that stretch to accommodate.
 *
 * @param {number} bicep
 * @param {number} capHeight
 * @param {number} sleeveWidth
 * @param {number} armholeCircumference - Measured around the bodice armhole (in)
 * @returns {number} Cap ease in inches (positive = cap is longer than armhole)
 */
export function sleeveCapEase(bicep, capHeight, sleeveWidth, armholeCircumference) {
  const { p0, p1, p2, p3 } = sleeveCapCurve(bicep, capHeight, sleeveWidth);
  const N = 32;
  let len = 0;
  let prev = p0;
  for (let i = 1; i <= N; i++) {
    const t = i / N;
    const m = 1 - t;
    const x = m*m*m*p0.x + 3*m*m*t*p1.x + 3*m*t*t*p2.x + t*t*t*p3.x;
    const y = m*m*m*p0.y + 3*m*m*t*p1.y + 3*m*t*t*p2.y + t*t*t*p3.y;
    const dx = x - prev.x, dy = y - prev.y;
    len += Math.sqrt(dx*dx + dy*dy);
    prev = { x, y };
  }
  return len - armholeCircumference;
}

/**
 * Half back-neck width from neck circumference — shoulder-neck junction to CB/CF.
 *
 * Standard block drafting rule: back neck width = neck / 6.
 * This is the distance from the fold (CB or CF) to point B on the shoulder
 * baseline. The front neckline uses the same width; its extra depth comes
 * from the neckline curve, not a wider opening.
 *
 * @param {number} neckCircumference - Neck circumference (in)
 * @returns {number} neckWidth to pass to necklineCurve() and shoulderSlope()
 */
export function neckWidthFromCircumference(neckCircumference) {
  return neckCircumference / 6;
}

// ── Two-part sleeve ──────────────────────────────────────────────────────

/**
 * Two-part sleeve — top sleeve (outer arm) + under sleeve (inner arm).
 *
 * Used for tailored jackets, blazers, overcoats, and denim jackets where a
 * single-piece sleeve cannot achieve the correct arm hang. The top sleeve
 * carries the full cap crown; the under sleeve has a much flatter, lower cap.
 *
 * The two pieces share the back seam (along the outer elbow) and the front
 * seam (along the inner forearm). When sewn together these form a cylinder
 * with a pre-shaped elbow bend.
 *
 * The function iterates to match the combined cap seam length to the
 * bodice armhole circumference + ease. Up to 25 iterations, adjusting
 * sleeve width by ±1–2% per step until the cap is within 0.25″ of target.
 *
 * Local frame (both pieces)
 *   x+  toward front of sleeve (same as sleeveCapCurve)
 *   y+  downward (cap crown is negative y, wrist is positive y)
 *   Origin: top of top-sleeve cap crown at (topSleeveWidth/2, 0)
 *
 * @param {Object} params
 * @param {number} params.bicep             - Bicep circumference (in)
 * @param {number} params.sleeveLength      - Shoulder to wrist (in)
 * @param {number} params.armToElbow        - Shoulder to elbow (in), or 0 for auto
 * @param {number} params.wrist             - Wrist circumference (in)
 * @param {number} params.armholeArc        - Total bodice armhole arc length (in)
 * @param {number} params.capEaseTarget     - Desired cap ease (in), typically 1–2
 * @param {number} [params.sleeveBend=10]   - Elbow bend angle in degrees (0–20)
 * @param {number} [params.bicepEase=0.15]  - Fraction of bicep added as ease
 * @param {number} [params.cuffEase=0.40]   - Fraction of wrist added as ease
 * @param {number} [params.capHeightRatio=0.45] - Cap height as fraction of eased bicep
 * @returns {{
 *   topSleeve: Array<{x:number, y:number}>,
 *   underSleeve: Array<{x:number, y:number}>,
 *   capHeight: number,
 *   topSleeveWidth: number,
 *   underSleeveWidth: number,
 *   elbowY: number,
 *   capArc: number,
 *   iterations: number,
 * }}
 */
export function twoPartSleeve({
  bicep, sleeveLength, armToElbow, wrist,
  armholeArc, capEaseTarget = 1.5,
  sleeveBend = 10, bicepEase = 0.15, cuffEase = 0.40,
  capHeightRatio = 0.45,
}) {
  const elbowY    = armToElbow || sleeveLength * 0.55;
  const wristCirc = wrist * (1 + cuffEase);
  const target    = armholeArc + capEaseTarget;

  // Helper: cubic bezier sample as polyline
  function sample(p0, p1, p2, p3, n = 24) {
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n, m = 1 - t;
      pts.push({
        x: m*m*m*p0.x + 3*m*m*t*p1.x + 3*m*t*t*p2.x + t*t*t*p3.x,
        y: m*m*m*p0.y + 3*m*m*t*p1.y + 3*m*t*t*p2.y + t*t*t*p3.y,
      });
    }
    return pts;
  }

  // Helper: polyline arc length
  function plen(pts) {
    let l = 0;
    for (let i = 1; i < pts.length; i++) {
      const dx = pts[i].x - pts[i-1].x, dy = pts[i].y - pts[i-1].y;
      l += Math.sqrt(dx*dx + dy*dy);
    }
    return l;
  }

  let tweak = 1;
  let runs  = 0;
  let topPoly, underPoly, capArc, capH, tsW, usW;

  do {
    const easedQB = (bicep / 4) * (1 + bicepEase) * tweak;
    const fullW   = easedQB * 4; // full sleeve width at bicep
    capH = fullW * capHeightRatio * 0.5;

    // Top sleeve is ~60% of the width, under sleeve ~40%
    tsW = fullW * 0.60;
    usW = fullW * 0.40;
    const factor = fullW / 4;

    // ── Key landmarks ──────────────────────────────────────────────────
    const crownY  = 0;
    const armY    = capH;                   // underarm level
    const wristY  = capH + sleeveLength;

    // Back pitch point: on the outer (back) edge of the cap, ~1/3 down
    const backPitchPt = { x: tsW, y: armY / 3 };

    // Front pitch point: on the inner (front) side, ~60% down
    const frontPitchPt = { x: 0, y: armY * 0.6 };

    // Crown (top of cap)
    const crown = { x: tsW * 0.5, y: crownY };

    // ── Top sleeve cap (3 bezier segments: back→crown→front→tsLeftEdge)
    // Segment 1: backPitch → crown
    const tsCap1 = sample(
      backPitchPt,
      { x: backPitchPt.x, y: crownY + capH * 0.05 },
      { x: crown.x + factor * 0.6, y: crownY },
      crown
    );
    // Segment 2: crown → frontPitch
    const tsCap2 = sample(
      crown,
      { x: crown.x - factor * 0.6, y: crownY },
      { x: frontPitchPt.x + factor * 0.28, y: frontPitchPt.y - capH * 0.15 },
      frontPitchPt
    );
    // Segment 3: frontPitch → tsLeftEdge (underarm front)
    const tsLeftEdge = { x: -factor * 0.25, y: armY };
    const tsCap3 = sample(
      frontPitchPt,
      { x: frontPitchPt.x - factor * 0.1, y: frontPitchPt.y + (armY - frontPitchPt.y) * 0.66 },
      { x: tsLeftEdge.x + factor * 0.3, y: armY },
      tsLeftEdge
    );
    const tsCapPts = [...tsCap1, ...tsCap2.slice(1), ...tsCap3.slice(1)];

    // ── Under sleeve cap (single flatter curve: usTip → usLeftEdge)
    const usTip     = { x: backPitchPt.x - factor * 0.25, y: backPitchPt.y };
    const usLeftEdge = { x: factor * 0.25, y: armY };
    const usCapPts = sample(
      usTip,
      { x: usTip.x - factor * 0.3, y: usTip.y + (armY - usTip.y) * 0.4 },
      { x: usLeftEdge.x + factor * 0.4, y: armY - capH * 0.05 },
      usLeftEdge
    );

    capArc = plen(tsCapPts) + plen(usCapPts);

    // ── Build full polygons ──────────────────────────────────────────
    // Elbow bend: rotate wrist points slightly toward front
    const bendRad    = (sleeveBend * Math.PI) / 180;
    const elbowRight = { x: tsW + factor / 9, y: elbowY + capH };
    const tsRightEdge = { x: tsW + factor / 9, y: armY };

    // Wrist points — apply elbow bend rotation around elbow
    const topWristW   = wristCirc / 2 + factor / 5;
    const underWristW = wristCirc / 2 - factor / 5;
    const tsWristRight = {
      x: elbowRight.x + Math.sin(bendRad) * (wristY - elbowY - capH),
      y: wristY,
    };
    const tsWristLeft = { x: tsWristRight.x - topWristW, y: wristY };

    const usWristRight = { x: tsWristRight.x, y: wristY };
    const usWristLeft  = { x: usWristRight.x - underWristW, y: wristY };

    // Elbow points
    const tsElbowLeft = { x: tsLeftEdge.x - factor / 9, y: elbowY + capH };
    const usElbowLeft = { x: usLeftEdge.x + factor / 2.4, y: elbowY + capH };

    // Top sleeve polygon: cap → right edge down → wrist → left edge up
    topPoly = [
      ...tsCapPts,
      tsLeftEdge,
      tsElbowLeft,
      tsWristLeft,
      tsWristRight,
      elbowRight,
      tsRightEdge,
      backPitchPt,
    ];

    // Under sleeve polygon: cap → left edge down → wrist → right edge up
    underPoly = [
      ...usCapPts,
      usLeftEdge,
      usElbowLeft,
      usWristLeft,
      usWristRight,
      elbowRight,
      tsRightEdge,
      usTip,
    ];

    runs++;
    const delta = capArc - target;
    if (delta > 0) tweak *= 0.99;
    else tweak *= 1.02;
  } while (Math.abs(capArc - target) > 0.25 && runs < 25);

  return {
    topSleeve: topPoly,
    underSleeve: underPoly,
    capHeight: capH,
    topSleeveWidth: tsW,
    underSleeveWidth: usW,
    elbowY: elbowY + capH,
    capArc,
    iterations: runs,
  };
}

// ── Yoke split ───────────────────────────────────────────────────────────

/**
 * Find the point where a horizontal yoke line crosses the armhole curve.
 *
 * The yoke seam runs horizontally from CF/CB to the armhole at a given
 * depth below the shoulder. This function samples the armhole bezier and
 * returns the x-coordinate where the curve crosses yokeY, allowing the
 * caller to split the bodice into yoke + lower panel.
 *
 * @param {{ p0, p1, p2, p3 }} armholeBezier - From armholeCurve()
 * @param {number} yokeY      - Y-coordinate of the yoke seam (relative to armhole p0)
 * @param {number} [steps=32] - Sampling resolution
 * @returns {{ x: number, y: number } | null} Intersection point, or null if none found
 */
export function yokeSplit(armholeBezier, yokeY, steps = 32) {
  const { p0, p1, p2, p3 } = armholeBezier;
  let prev = p0;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps, m = 1 - t;
    const curr = {
      x: m*m*m*p0.x + 3*m*m*t*p1.x + 3*m*t*t*p2.x + t*t*t*p3.x,
      y: m*m*m*p0.y + 3*m*m*t*p1.y + 3*m*t*t*p2.y + t*t*t*p3.y,
    };
    if ((prev.y <= yokeY && curr.y >= yokeY) || (prev.y >= yokeY && curr.y <= yokeY)) {
      // Linear interpolation between prev and curr
      const frac = (yokeY - prev.y) / (curr.y - prev.y);
      return {
        x: prev.x + frac * (curr.x - prev.x),
        y: yokeY,
      };
    }
    prev = curr;
  }
  return null;
}

// ── Collar system ────────────────────────────────────────────────────────

/**
 * Collar stand + fall curve points for tailored collars.
 *
 * Generates the outlines for a two-piece collar (upper collar + under collar)
 * used on denim jackets, blazers, and structured coats. The collar is drafted
 * as a flat rectangle that is then shaped with a curved outer (fall) edge.
 *
 * The under collar is cut ~2% smaller so that when the collar is turned and
 * pressed, the seam rolls to the underside and stays invisible from the front.
 *
 * Both pieces are cut on fold at CB. The returned polygons represent one half
 * (CB fold to CF point).
 *
 * Collar anatomy
 *   Stand     — the portion that rises vertically from the neckline seam
 *   Roll line — where the collar folds over (top of the stand)
 *   Fall      — the portion that laps down over the stand
 *   Gorge     — the notch point where the collar meets the lapel (if applicable)
 *
 * @param {Object} params
 * @param {number} params.neckArc          - Half neckline arc (CB to CF shoulder), in inches
 * @param {number} params.collarWidth      - Total collar width from neckline to outer edge (in), typically 2.5–3.5
 * @param {string} [params.style='point']  - 'point' | 'band' | 'rounded'
 * @param {number} [params.standHeight=1.25] - Height of the stand portion (in)
 * @param {number} [params.underShrink=0.02] - How much smaller the under collar is (fraction)
 * @returns {{
 *   upperCollar: Array<{x:number, y:number}>,
 *   underCollar: Array<{x:number, y:number}>,
 *   standLength: number,
 *   rollLine: Array<{x:number, y:number}>,
 * }}
 */
export function collarCurve({
  neckArc,
  collarWidth = 3,
  style = 'point',
  standHeight = 1.25,
  underShrink = 0.02,
}) {
  // Full collar length along the neckline seam (half — CB to CF)
  const collarLen = neckArc;
  const fallHeight = collarWidth - standHeight;

  // The outer edge (fall edge) has a gentle wave — it curves outward
  // slightly at the back and sweeps inward toward CF. This shaping
  // is what makes the collar lie flat when turned.
  const waveDepth = collarWidth * 0.08; // how much the outer edge bows outward at back

  // ── Upper collar polygon ───────────────────────────────────────────
  // Points run clockwise: CB top → CF top → CF bottom → CB bottom (fold)
  const cbTop    = { x: 0, y: 0 };                          // CB fold, outer edge
  const cbBottom = { x: 0, y: collarWidth };                 // CB fold, neckline edge

  // The outer (fall) edge curves gently — approximate with 5 points
  const outerEdge = [];
  for (let i = 0; i <= 4; i++) {
    const frac = i / 4;
    const x = collarLen * frac;
    // Sine wave: peaks at 25% along the length (back quarter), fades to zero at CF
    const wave = waveDepth * Math.sin(Math.PI * (1 - frac) * 0.8);
    outerEdge.push({ x, y: -wave });
  }

  // CF point shape depends on style
  let cfTopX = collarLen;
  let cfTopY = outerEdge[outerEdge.length - 1].y;
  let cfBottomX = collarLen;
  let cfBottomY = collarWidth;

  if (style === 'point') {
    // Point collar: the tip extends ~0.75″ beyond the neckline at CF
    cfTopX += 0.75;
    cfTopY += standHeight * 0.3;
  } else if (style === 'rounded') {
    // Rounded: the tip is at the same x but the corner is softened
    cfTopX += 0.25;
  }
  // 'band' style: no extension, straight rectangle

  const upperCollar = [
    cbTop,
    ...outerEdge.slice(1, -1), // intermediate outer edge points (skip first/last)
    { x: cfTopX, y: cfTopY },  // CF tip
    { x: cfBottomX, y: cfBottomY }, // CF neckline edge
    cbBottom,                   // CB fold neckline edge
  ];

  // ── Under collar polygon ───────────────────────────────────────────
  // Shrunk by underShrink fraction so the seam rolls underneath
  const shrink = 1 + underShrink;
  const underCollar = upperCollar.map(p => ({
    x: p.x / shrink,
    y: p.y / shrink,
  }));

  // ── Roll line (straight line at stand height) ──────────────────────
  const rollLine = [
    { x: 0, y: standHeight },
    { x: collarLen, y: standHeight },
  ];

  return {
    upperCollar,
    underCollar,
    standLength: collarLen,
    rollLine,
  };
}
