// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Core geometry engine for pattern drafting.
 * All measurements in inches. SVG scale applied at render time.
 */

/**
 * Normalize a 2-D vector to unit length.
 * Returns {x:0, y:0} for the zero vector to avoid NaN propagation.
 *
 * @param {{ x: number, y: number }} v
 * @returns {{ x: number, y: number }}
 */
export function norm(v) {
  const l = Math.sqrt(v.x * v.x + v.y * v.y);
  return l > 0 ? { x: v.x / l, y: v.y / l } : { x: 0, y: 0 };
}

/**
 * Euclidean distance between two points.
 *
 * @param {{ x: number, y: number }} a
 * @param {{ x: number, y: number }} b
 * @returns {number} Distance in the same units as the input coordinates (inches)
 */
export function dist(a, b) {
  return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
}

/**
 * Cubic bezier point at parameter t
 */
export function cubicBezier(t, p0, p1, p2, p3) {
  const m = 1 - t;
  return {
    x: m*m*m*p0.x + 3*m*m*t*p1.x + 3*m*t*t*p2.x + t*t*t*p3.x,
    y: m*m*m*p0.y + 3*m*m*t*p1.y + 3*m*t*t*p2.y + t*t*t*p3.y,
  };
}

/**
 * Sample a bezier curve into a polyline
 */
export function sampleBezier(p0, p1, p2, p3, steps = 16) {
  const pts = [];
  for (let t = 0; t <= 1; t += 1 / steps) {
    pts.push(cubicBezier(t, p0, p1, p2, p3));
  }
  return pts;
}

/**
 * Post-process a sampled crotch curve to enforce monotonic movement:
 * x must only decrease (move left) and y must only increase (move down).
 * Clamps each point to the previous point's x/y if a reversal is detected.
 * This eliminates horizontal steps produced by bezier overshoots.
 *
 * @param {Array<{x: number, y: number}>} pts - sampled curve points
 * @returns {Array<{x: number, y: number}>} monotone curve points
 */
export function monotoneCrotchCurve(pts) {
  if (!pts || pts.length < 2) return pts;
  // Clamp every point so x never increases and y never decreases.
  // This keeps the full sample count intact (no points are dropped) so that
  // offsetPolygon, SA miter math, and notch snapping all have a dense polygon.
  // The visual curve is rendered as a bezier C command using the original control
  // points, so the "shelf" artifact of clamping is invisible in the SVG output.
  const out = [{ x: pts[0].x, y: pts[0].y }];
  for (let i = 1; i < pts.length; i++) {
    const prev = out[i - 1];
    out.push({
      x: Math.min(pts[i].x, prev.x),
      y: Math.max(pts[i].y, prev.y),
    });
  }
  return out;
}

/**
 * Arc length of a polyline (array of {x, y} points).
 * Sum of Euclidean distances between consecutive points.
 */
export function arcLength(pts) {
  let len = 0;
  for (let i = 1; i < pts.length; i++) {
    len += dist(pts[i - 1], pts[i]);
  }
  return len;
}

/**
 * Generate crotch curve control points for pants/shorts
 * @param {number} ox - x origin (center seam top)
 * @param {number} oy - y origin (waist)
 * @param {number} rise - rise measurement
 * @param {number} ext - crotch extension
 * @param {boolean} isBack - back panel has deeper curve
 * @param {number} cbRaise - center back waist raise
 * @returns {Object} {p0, p1, p2, p3} bezier control points
 */
export function crotchCurvePoints(ox, oy, rise, ext, isBack, cbRaise = 0) {
  const p0 = { x: ox, y: oy + cbRaise };
  const p3 = { x: ox - ext, y: oy + rise };
  // p1.x stays on the center seam (ox); curve sweeps horizontally only below p2
  let p1 = { x: ox, y: oy + rise * (isBack ? 0.5 : 0.6) };
  const p2 = { x: ox - ext * (isBack ? 0.55 : 0.35), y: oy + rise * (isBack ? 0.88 : 0.93) };

  // Monotonicity check: x values must only decrease from p0 to p3
  // (curve must stay on or left of center seam — never swing back)
  const testPts = sampleBezier(p0, p1, p2, p3, 32);
  let reversed = false;
  for (let i = 1; i < testPts.length; i++) {
    if (testPts[i].x > testPts[i - 1].x + 0.001) { reversed = true; break; }
  }
  if (reversed) {
    // Introduce a small horizontal offset on p1 to prevent reversal
    p1 = { x: ox - ext * 0.08, y: p1.y };
    console.warn('[geometry] crotchCurve: x reversal detected — adjusted p1.x');
  }

  return { p0, p1, p2, p3 };
}

/**
 * Sanitize a polygon by removing degenerate points and ensuring CW winding.
 *
 * 1. Removes consecutive duplicate points (within 0.01″ tolerance)
 * 2. Removes collinear points that don't contribute to the shape
 *    (cross-product / edge-length below 0.5° angular tolerance)
 * 3. Ensures consistent clockwise winding order
 *
 * This prevents zero-length edges, degenerate miter calculations in
 * offsetPolygon, and winding-order bugs across all garment modules.
 *
 * @param {Array<{ x: number, y: number }>} pts - input polygon
 * @returns {Array<{ x: number, y: number }>} sanitized polygon (new array)
 */
export function sanitizePoly(pts) {
  if (!pts || pts.length < 3) return pts;

  // Step 1 — remove consecutive duplicate points (including wrap-around)
  let deduped = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    if (dist(pts[i], deduped[deduped.length - 1]) > 0.01) {
      deduped.push(pts[i]);
    }
  }
  // Check last vs first
  if (deduped.length > 1 && dist(deduped[deduped.length - 1], deduped[0]) < 0.01) {
    deduped.pop();
  }
  if (deduped.length < 3) return deduped;

  // Step 2 — remove collinear points (cross-product test)
  // sin(0.25°) ≈ 0.00436 — tight tolerance preserves gentle bezier arcs (crotch curve, neckline)
  const sinTol = Math.sin(0.25 * Math.PI / 180);
  const n = deduped.length;
  const filtered = [];
  for (let i = 0; i < n; i++) {
    const prev = deduped[(i - 1 + n) % n];
    const curr = deduped[i];
    const next = deduped[(i + 1) % n];
    const dx1 = curr.x - prev.x, dy1 = curr.y - prev.y;
    const dx2 = next.x - curr.x, dy2 = next.y - curr.y;
    const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
    const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
    if (len1 < 0.01 || len2 < 0.01) continue; // degenerate edge — skip
    // Cross product of unit vectors = sin of angle between them
    const cross = Math.abs(dx1 * dy2 - dy1 * dx2) / (len1 * len2);
    if (cross > sinTol) {
      filtered.push(curr); // non-collinear — keep
    }
  }
  if (filtered.length < 3) return deduped; // fallback — don't collapse to nothing

  // Step 3 — ensure clockwise winding (negative signed area)
  let area2 = 0;
  for (let i = 0; i < filtered.length; i++) {
    const j = (i + 1) % filtered.length;
    area2 += filtered[i].x * filtered[j].y;
    area2 -= filtered[j].x * filtered[i].y;
  }
  if (area2 > 0) filtered.reverse(); // was CCW → flip to CW

  return filtered;
}

/**
 * Compute perpendicular offset for a polygon (for seam allowance).
 * Each EDGE gets a uniform offset so seam lines run perfectly parallel to
 * their corresponding cut lines. At corners where adjacent edges have
 * different offsets (e.g. the hem corner where SA meets hem allowance),
 * two points are emitted to create a clean step instead of an interpolated
 * blend.
 *
 * @param {Array}    poly          - array of {x, y} points (clockwise winding)
 * @param {Function} edgeOffsetFn  - (edgeIndex) => offset distance
 *                                   Edge i goes from poly[i] to poly[(i+1)%n]
 * @returns {Array} offset polygon (may have more points than input at step corners)
 */
export function offsetPolygon(poly, edgeOffsetFn) {
  // Sanitize input to prevent zero-length edges and degenerate miters
  poly = sanitizePoly(poly);
  const n = poly.length;
  const result = [];

  for (let i = 0; i < n; i++) {
    const prev = poly[(i - 1 + n) % n];
    const curr = poly[i];
    const next = poly[(i + 1) % n];

    const eInIdx  = (i - 1 + n) % n; // incoming edge: prev → curr
    const eOutIdx = i;                // outgoing edge: curr → next
    const oIn  = edgeOffsetFn(eInIdx);
    const oOut = edgeOffsetFn(eOutIdx);

    // Perpendicular normals (for CW winding, inward is left of travel direction)
    const nIn  = norm({ x: -(curr.y - prev.y), y: curr.x - prev.x });
    const nOut = norm({ x: -(next.y - curr.y), y: next.x - curr.x });

    // Anchor points on each inset edge (one per adjacent edge)
    const p1 = { x: curr.x + nIn.x  * oIn,  y: curr.y + nIn.y  * oIn  };
    const p2 = { x: curr.x + nOut.x * oOut,  y: curr.y + nOut.y * oOut };

    // Direction vectors of the two edges (unnormalised — only sign/ratio matters)
    const d1 = { x: curr.x - prev.x, y: curr.y - prev.y };
    const d2 = { x: next.x - curr.x, y: next.y - curr.y };

    // Find the intersection of the two inset lines via 2-D cross product.
    // This gives a clean miter for equal offsets AND a clean right-angle step
    // for different offsets (e.g. SA vs hem allowance at the bottom corners).
    const denom = d1.x * d2.y - d1.y * d2.x;

    if (Math.abs(denom) < 1e-9) {
      // Parallel / anti-parallel edges — perpendicular offset only, no miter
      result.push(p1);
      if (Math.abs(oIn - oOut) >= 1e-9) result.push(p2);
    } else {
      const dp = { x: p2.x - p1.x, y: p2.y - p1.y };
      const t  = (dp.x * d2.y - dp.y * d2.x) / denom;
      const ix = p1.x + t * d1.x;
      const iy = p1.y + t * d1.y;

      // Cap miter distance: at most 2.5× the larger offset, to prevent spikes
      const maxDist = Math.max(Math.abs(oIn), Math.abs(oOut)) * 2.5;
      const distSq  = (ix - curr.x) ** 2 + (iy - curr.y) ** 2;

      if (distSq <= maxDist * maxDist) {
        result.push({ x: ix, y: iy });
      } else {
        // Too far from corner — fall back to two-point step
        result.push(p1);
        result.push(p2);
      }
    }
  }

  return result;
}

/**
 * Convert an array of {x, y} points to an SVG path `d` attribute string.
 * The path is automatically closed with a Z command.
 * Coordinates are rounded to one decimal place.
 *
 * @param {Array<{ x: number, y: number }>} poly
 * @returns {string} SVG path data string, e.g. "M 0.0 0.0 L 10.0 0.0 ... Z"
 */
export function polyToPath(poly) {
  if (!poly.length) return '';
  let d = `M ${poly[0].x.toFixed(1)} ${poly[0].y.toFixed(1)}`;
  for (let i = 1; i < poly.length; i++) {
    d += ` L ${poly[i].x.toFixed(1)} ${poly[i].y.toFixed(1)}`;
  }
  d += ' Z';
  return d;
}

/**
 * Format a decimal inch value as a human-readable fraction string.
 * Fractions supported: ⅛, ¼, ⅜, ½, ⅝, ¾, ⅞ (tolerance ±0.06).
 * Negative values are treated as their absolute value.
 *
 * @param {number} val - Measurement in inches (e.g. 1.625)
 * @returns {string} Formatted string (e.g. "1⅝″", "2″", "3.3″")
 */
export function fmtInches(val) {
  if (val < 0) val = -val;
  const whole = Math.floor(val);
  const frac = val - whole;
  const fracs = [
    [0.125, '⅛'], [0.25, '¼'], [0.375, '⅜'], [0.5, '½'],
    [0.625, '⅝'], [0.75, '¾'], [0.875, '⅞'],
  ];
  for (const [n, s] of fracs) {
    if (Math.abs(frac - n) < 0.06) return whole + s + '″';
  }
  if (frac < 0.0625) return (whole || '0') + '″';
  return val.toFixed(1) + '″';
}

/**
 * Leg shape definitions — knee and hem widths as a ratio of the hip panel half-width.
 * Multiply by the computed hip half-width to get absolute knee/hem measurements.
 *
 * @type {Object.<string, { knee: number, hem: number }>}
 */
export const LEG_SHAPES = {
  skinny:   { knee: 0.72, hem: 0.58 },
  slim:     { knee: 0.80, hem: 0.68 },
  straight: { knee: 0.90, hem: 0.85 },
  bootcut:  { knee: 0.78, hem: 0.92 },
  wide:     { knee: 1.00, hem: 1.10 },
};

/**
 * Total lower-body ease by fit style in inches (added to hip circumference).
 * Front panel receives 40%, back panel receives 60% — see easeDistribution().
 *
 * @type {Object.<string, number>}
 */
export const EASE_VALUES = {
  slim: 1.5,
  regular: 2.5,
  relaxed: 4,
  wide: 6,
};

/**
 * Distribute total lower-body ease across front and back panels.
 * Back gets 60% (accommodates seat); front gets 40%.
 * Each value is per quarter-panel (one of four panels in the garment).
 *
 * @param {string|number} easeKeyOrTotal - Key from EASE_VALUES or a numeric total in inches
 * @returns {{ front: number, back: number, total: number }} Ease in inches per quarter-panel
 */
export function easeDistribution(easeKeyOrTotal) {
  const total = typeof easeKeyOrTotal === 'number'
    ? easeKeyOrTotal
    : (EASE_VALUES[easeKeyOrTotal] || 2.5);
  return { front: total * 0.2, back: total * 0.3, total };
}

/**
 * Compute the outward-pointing angle (in degrees) at a point on a polygon edge.
 * The angle is perpendicular to the edge direction, pointing away from the
 * polygon interior (assuming CW winding for lower-body, varies for upper).
 *
 * @param {{ x: number, y: number }} a - start of edge
 * @param {{ x: number, y: number }} b - end of edge
 * @returns {number} angle in degrees (0 = right, 90 = down in SVG coords)
 */
export function edgeAngle(a, b) {
  const dx = b.x - a.x, dy = b.y - a.y;
  // Perpendicular pointing right of travel direction (outward for CW winding)
  return Math.atan2(dx, -dy) * (180 / Math.PI);
}
