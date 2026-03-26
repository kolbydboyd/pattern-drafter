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
