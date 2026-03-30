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
 * Render a cubic bezier as an SVG C command string (without the initial M).
 * Use with M x,y at the p0 position, then append this for the curve.
 *
 * @param {{ p0, p1, p2, p3 }} cp - Bezier control points
 * @param {number} [precision=2] - Decimal precision
 * @returns {string} SVG path fragment, e.g. "C 1.00 2.00, 3.00 4.00, 5.00 6.00"
 */
export function bezierToSvgC(cp, precision = 2) {
  const f = v => v.toFixed(precision);
  return `C ${f(cp.p1.x)} ${f(cp.p1.y)}, ${f(cp.p2.x)} ${f(cp.p2.y)}, ${f(cp.p3.x)} ${f(cp.p3.y)}`;
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
  let p1 = { x: ox, y: oy + rise * (isBack ? 0.35 : 0.45) };
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

export function insetCrotchBezier(ccp, sa) {
  const { p0, p1, p2, p3 } = ccp;
  const ip0 = { x: p0.x + sa, y: p0.y };
  const ip3 = { x: p3.x, y: p3.y - sa };
  const ip1 = { x: p1.x + sa * 0.7, y: p1.y - sa * 0.3 };
  const ip2 = { x: p2.x + sa * 0.3, y: p2.y - sa * 0.7 };
  return { p0: ip0, p1: ip1, p2: ip2, p3: ip3 };
}

/**
 * Validate that front + back cross-seam arc lengths are reasonable for the
 * given rise. Logs a warning if the total deviates more than 30% from the
 * expected range (2 × rise). Does not block pattern generation.
 *
 * @param {{ p0, p1, p2, p3 }} frontCurve - Front crotch bezier control points
 * @param {{ p0, p1, p2, p3 }} backCurve  - Back crotch bezier control points
 * @param {number} rise - Rise measurement (in)
 */
export function validateCrossSeam(frontCurve, backCurve, rise) {
  const frontLen = arcLength(sampleBezier(frontCurve.p0, frontCurve.p1, frontCurve.p2, frontCurve.p3, 32));
  const backLen  = arcLength(sampleBezier(backCurve.p0, backCurve.p1, backCurve.p2, backCurve.p3, 32));
  const total    = frontLen + backLen;
  const expected = rise * 2;
  if (total < expected * 0.7 || total > expected * 1.3) {
    console.warn(`[geometry] Cross-seam length ${total.toFixed(1)}″ is outside expected range (${(expected * 0.7).toFixed(1)}–${(expected * 1.3).toFixed(1)}″ for ${rise.toFixed(1)}″ rise). Check measurements.`);
  }
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
    if (cross > sinTol || curr.curve) {
      filtered.push(curr); // non-collinear or tagged curve point — keep
    }
  }
  if (filtered.length < 3) return deduped; // fallback — don't collapse to nothing

  // Step 2b — drop curve points too close to structural (non-curve) vertices.
  // These create tiny edges at junctions (e.g. crotch curve → waist) that cause
  // offset miter artifacts even with capping.  0.3″ threshold is visually invisible.
  const trimmed = [];
  for (let i = 0; i < filtered.length; i++) {
    if (filtered[i].curve) {
      const pIdx = (i - 1 + filtered.length) % filtered.length;
      const nIdx = (i + 1) % filtered.length;
      const prevPt = filtered[pIdx];
      const nextPt = filtered[nIdx];
      if ((!prevPt.curve && dist(filtered[i], prevPt) < 1.25) ||
          (!nextPt.curve && dist(filtered[i], nextPt) < 1.25)) {
        continue; // skip — too close to structural vertex
      }
    }
    trimmed.push(filtered[i]);
  }
  const final = trimmed.length >= 3 ? trimmed : filtered;

  // Step 3 — ensure clockwise winding (negative signed area)
  let area2 = 0;
  for (let i = 0; i < final.length; i++) {
    const j = (i + 1) % final.length;
    area2 += final[i].x * final[j].y;
    area2 -= final[j].x * final[i].y;
  }
  if (area2 > 0) final.reverse(); // was CCW → flip to CW

  return final;
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
 * @param {Function} edgeOffsetFn  - (edgeIndex, startPt, endPt) => offset distance
 *                                   Edge i goes from poly[i] to poly[(i+1)%n]
 *                                   startPt/endPt are the sanitized vertices (use for geometry-based matching)
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
    const oIn  = edgeOffsetFn(eInIdx, prev, curr);
    const oOut = edgeOffsetFn(eOutIdx, curr, next);

    // Perpendicular normals (for CW winding, inward is left of travel direction)
    const nIn  = norm({ x: -(curr.y - prev.y), y: curr.x - prev.x });
    const nOut = norm({ x: -(next.y - curr.y), y: next.x - curr.x });

    // Edge lengths — very short edges produce degenerate miters
    const lenIn  = Math.sqrt((curr.x - prev.x) ** 2 + (curr.y - prev.y) ** 2);
    const lenOut = Math.sqrt((next.x - curr.x) ** 2 + (next.y - curr.y) ** 2);
    const minEdge = Math.min(lenIn, lenOut);
    const maxOff  = Math.max(Math.abs(oIn), Math.abs(oOut));

    // If either adjacent edge is shorter than the offset, the miter math is
    // unreliable (the intersection point flies far from the vertex).  Use a
    // simple average-normal offset instead — smooth and stable.
    // Propagate .curve tag to offset points for downstream renderers
    const tag = curr.curve ? { curve: true } : {};

    if (minEdge < maxOff && curr.curve) {
      const nx = (nIn.x + nOut.x) / 2, ny = (nIn.y + nOut.y) / 2;
      const nl = Math.sqrt(nx * nx + ny * ny) || 1;
      const avgOff = (oIn + oOut) / 2;
      result.push({ x: curr.x + nx / nl * avgOff, y: curr.y + ny / nl * avgOff, ...tag });
      continue;
    }

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

    if (Math.abs(denom) < 0.01) {
      // Parallel / anti-parallel edges — perpendicular offset only, no miter
      result.push({ ...p1, ...tag });
      if (Math.abs(oIn - oOut) >= 1e-9) result.push({ ...p2, ...tag });
    } else {
      const dp = { x: p2.x - p1.x, y: p2.y - p1.y };
      const t  = (dp.x * d2.y - dp.y * d2.x) / denom;
      const ix = p1.x + t * d1.x;
      const iy = p1.y + t * d1.y;

      // Cap miter distance: at most 2.5× the larger offset, to prevent spikes
      const maxDist = maxOff * 2.5;
      const distSq  = (ix - curr.x) ** 2 + (iy - curr.y) ** 2;

      if (distSq <= maxDist * maxDist) {
        result.push({ x: ix, y: iy, ...tag });
      } else if (curr.curve) {
        // Curve point: cap the miter distance instead of creating a step
        const scale = maxDist / Math.sqrt(distSq);
        result.push({ x: curr.x + (ix - curr.x) * scale, y: curr.y + (iy - curr.y) * scale, ...tag });
      } else {
        // Structural corner: two-point step for clean SA transitions (e.g. hem)
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
  // Minimum 4 inches ease at hip for woven fabrics. Slim fit only appropriate for stretch fabrics.
  slim: 2.5,
  regular: 4,
  relaxed: 6,
  wide: 8,
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

// ── Slant pocket piece builders ─────────────────────────────────────────────

/**
 * Build a slant pocket bag as a shaped piece with polygon + edgeAllowances.
 * Shape: angled top matching slash line, straight sides, gentle convex bottom.
 * Returns a piece object compatible with the bodice/sleeve renderer.
 *
 * @param {{ width?: number, height?: number, sa?: number, instruction?: string }} opts
 */
export function buildSlantPocketBag({ width = 7, height = 10.5, sa = 0.625, instruction = '' } = {}) {
  const slantDrop = 2; // top-left is 2" lower than top-right (slash angle)
  // Bottom curve: gentle convex arc from (width, height) to (0, height)
  const curveDepth = 0.5;
  const bottomPts = sampleBezier(
    { x: width, y: height },
    { x: width * 0.65, y: height + curveDepth },
    { x: width * 0.35, y: height + curveDepth },
    { x: 0, y: height },
    16,
  ).map((p, i, arr) => ({ ...p, ...(i > 0 && i < arr.length - 1 ? { curve: true } : {}) }));

  // CW polygon: top-left → top-right → bottom-right → (curve) → bottom-left → back up
  const polygon = [
    { x: 0, y: slantDrop },          // top-left (lower due to slash angle)
    { x: width, y: 0 },              // top-right (waist level)
    ...bottomPts,                     // right-to-left curved bottom
    // closes back to top-left
  ];

  return {
    id: 'slant-bag',
    name: 'Slant Pocket Bag',
    instruction: instruction || `Cut 2 (1 + 1 mirror) \xb7 Lining fabric OK`,
    polygon,
    sa,
    hem: sa,
    width,
    height: height + curveDepth,
    type: 'bodice',
    isCutOnFold: false,
    dimensions: { width, height: height + curveDepth },
  };
}

/**
 * Build a slant pocket facing as a shaped piece matching the slash line contour.
 * Shape: parallelogram — top/bottom edges follow the slash angle, ~2" wide strip.
 * Returns a piece object compatible with the bodice/sleeve renderer.
 *
 * @param {{ width?: number, height?: number, sa?: number, instruction?: string }} opts
 */
export function buildSlantPocketFacing({ width = 2, height = 6, sa = 0.625, instruction = '' } = {}) {
  // The facing is a strip that follows the slash line angle.
  // Slash line runs from (panelWidth - 3.5, 0) to (panelWidth, 6) on the panel,
  // giving an angle. The facing mirrors this: top is offset rightward.
  const slantOffset = width * 0.5; // horizontal shift from slash angle

  // CW polygon: a parallelogram following the slash angle
  const polygon = [
    { x: slantOffset, y: 0 },             // top-left (slash edge, upper)
    { x: width + slantOffset, y: 0 },     // top-right
    { x: width, y: height },              // bottom-right
    { x: 0, y: height },                  // bottom-left (slash edge, lower)
  ];

  return {
    id: 'slant-facing',
    name: 'Slant Pocket Facing',
    instruction: instruction || `Cut 2 (1 + 1 mirror) \xb7 Match to front slash`,
    polygon,
    sa,
    hem: sa,
    width: width + slantOffset,
    height,
    type: 'bodice',
    isCutOnFold: false,
    dimensions: { width: width + slantOffset, height },
  };
}
