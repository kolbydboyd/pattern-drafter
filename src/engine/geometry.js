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
 * Walk a polyline from pts[0] and return the interpolated point at targetLen arc distance.
 * Clamps to pts[last] if targetLen exceeds total arc length.
 * @param {Array<{x,y}>} pts
 * @param {number} targetLen
 * @returns {{x, y}}
 */
export function ptAtArcLen(pts, targetLen) {
  let walked = 0;
  for (let i = 1; i < pts.length; i++) {
    const d = dist(pts[i - 1], pts[i]);
    if (walked + d >= targetLen) {
      const t = (targetLen - walked) / d;
      return {
        x: pts[i - 1].x + t * (pts[i].x - pts[i - 1].x),
        y: pts[i - 1].y + t * (pts[i].y - pts[i - 1].y),
      };
    }
    walked += d;
  }
  return { ...pts[pts.length - 1] };
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
 * Rotate dart wedges closed on a yoke polygon. Each dart is treated as a
 * wedge cut out of the waist (top) edge with apex at (dart.x, dart.length).
 * The polygon section to the right of each dart rotates rigidly about the
 * apex by the dart's subtended angle, "absorbing" the dart into the seams.
 * After closure, the top edge is shorter (by the sum of dart intakes) and the
 * side seam slants inward — the standard pattern-drafting move that turns a
 * rectangular yoke into a curved/wedge shape.
 *
 * Expects yokePoly ordered clockwise starting at the CB waist (top-left).
 * The top edge runs from poly[0] (CB waist) to poly[1] (side waist) at y≈0;
 * the bottom edge (yoke seam) runs back to poly[0].
 *
 * @param {Array<{x:number, y:number}>} yokePoly  Pre-rotation yoke polygon
 * @param {Array<{x:number, intake:number, length:number}>} darts  Dart definitions
 * @returns {Array<{x:number, y:number}>}  Rotated polygon
 */
export function closeYokeDarts(yokePoly, darts) {
  if (!darts || !darts.length) return yokePoly.map(p => ({ ...p }));
  const valid = darts.filter(d => d && d.intake > 0 && d.length > 0);
  if (!valid.length) return yokePoly.map(p => ({ ...p }));
  const sorted = [...valid].sort((a, b) => a.x - b.x);

  // Augment polygon: insert dart left/right leg vertices on the top edge
  // between poly[0] (CB waist) and poly[1] (side waist).  Each remaining
  // vertex is tagged with a panel index based on its original x position.
  const pts = [];
  pts.push({ ...yokePoly[0], _panel: 0 });
  for (let i = 0; i < sorted.length; i++) {
    const d = sorted[i];
    const half = d.intake / 2;
    pts.push({ x: d.x - half, y: 0, _panel: i });
    pts.push({ x: d.x + half, y: 0, _panel: i + 1, _dartRight: true });
  }
  for (let i = 1; i < yokePoly.length; i++) {
    const p = yokePoly[i];
    let panel = 0;
    for (const d of sorted) if (p.x > d.x) panel++;
    pts.push({ ...p, _panel: panel });
  }

  // Right-to-left rotation pass: for each dart i, rotate all points whose
  // panel index is > i about apex_i by the dart's subtended angle.
  for (let i = sorted.length - 1; i >= 0; i--) {
    const d = sorted[i];
    const apex = { x: d.x, y: d.length };
    const half = d.intake / 2;
    // Angle that takes (+half, -length) onto (-half, -length)
    const cross = -2 * half * d.length;
    const dot   = d.length * d.length - half * half;
    const angle = Math.atan2(cross, dot);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    for (const p of pts) {
      if (p._panel > i) {
        const dx = p.x - apex.x;
        const dy = p.y - apex.y;
        p.x = apex.x + dx * cos - dy * sin;
        p.y = apex.y + dx * sin + dy * cos;
      }
    }
  }

  // Drop the right-leg duplicates (they coincide with their matching left
  // leg after rotation) and strip internal markers.
  const out = [];
  for (const p of pts) {
    if (p._dartRight) continue;
    const clean = { ...p };
    delete clean._panel;
    delete clean._dartRight;
    out.push(clean);
  }
  return out;
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
  if (val == null || isNaN(val)) return '0″';
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
  wide:       { knee: 1.00, hem: 1.10 },
  'ultra-wide': { knee: 1.10, hem: 1.25 },
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
 * Scoop curve for slant pocket pieces.
 * Matches the front panel overlay: one continuous curve from
 * (bagWidth, slashDepth) scooping down to (0, bagDepth).
 * No straight right edge below the slash — just the curve.
 *
 * Cubic bezier approximation of the quadratic Q(bagWidth,bagDepth).
 */
function slantPocketScoop(bagWidth, slashDepth, bagDepth) {
  const scoopPts = sampleBezier(
    { x: bagWidth, y: slashDepth },                                            // start: slash exit on side seam
    { x: bagWidth, y: slashDepth + (bagDepth - slashDepth) * 2 / 3 },         // cp1: pulls down along side seam
    { x: bagWidth * 2 / 3, y: bagDepth },                                     // cp2: pulls across at bottom
    { x: 0, y: bagDepth },                                                    // end: bottom-left
    16,
  ).map((p, i, arr) => ({ ...p, ...(i > 0 && i < arr.length - 1 ? { curve: true } : {}) }));
  return scoopPts;
}

/**
 * Build a slant pocket backing piece (self-fabric).
 * Visible front of the pocket. Waist to side seam, straight down side
 * seam to slash exit level, then scoop curve to bottom-left.
 *
 * @param {{ bagWidth?: number, slashInset?: number, slashDepth?: number, bagDepth?: number, sa?: number, instruction?: string }} opts
 */
export function buildSlantPocketBacking({ bagWidth = 7, slashInset = 3.5, slashDepth = 6, bagDepth = 9.5, sa = 0.625, instruction = '' } = {}) {
  const scoopPts = slantPocketScoop(bagWidth, slashDepth, bagDepth);

  // CW polygon: waist across → side seam down to slash exit → scoop curve to bottom-left → left side up
  const polygon = [
    { x: 0, y: 0 },                       // top-left (waist, inner edge)
    { x: bagWidth, y: 0 },                // top-right (waist at side seam)
    { x: bagWidth, y: slashDepth },        // side seam down to slash exit level
    ...scoopPts.slice(1),                  // scoop from slash exit to bottom-left (skip first, it's the same point)
    // closes back to top-left
  ];
  const width = bagWidth;
  const height = bagDepth;

  return {
    id: 'slant-backing',
    name: 'Slant Pocket Backing',
    instruction: instruction || 'Cut 2 (1 + 1 mirror) \xb7 Self fabric \xb7 Visible pocket front',
    polygon,
    sa,
    hem: sa,
    width,
    height,
    type: 'bodice',
    isCutOnFold: false,
    dimensions: { width, height },
  };
}

/**
 * Build a slant pocket bag piece (lining).
 * Forms the back of the pocket against the body. Top-right edge follows
 * the slash diagonal (sewn to the front panel at the slash seam).
 *
 * @param {{ bagWidth?: number, slashInset?: number, slashDepth?: number, bagDepth?: number, sa?: number, instruction?: string }} opts
 */
export function buildSlantPocketBag({ bagWidth = 7, slashInset = 3.5, slashDepth = 6, bagDepth = 9.5, sa = 0.625, instruction = '' } = {}) {
  const scoopPts = slantPocketScoop(bagWidth, slashDepth, bagDepth);

  // CW polygon: waist to slash start → slash diagonal to slash exit →
  // scoop curve to bottom-left → left side up
  const slashStartX = bagWidth - slashInset;
  const polygon = [
    { x: 0, y: 0 },                       // top-left (waist, inner edge)
    { x: slashStartX, y: 0 },             // slash start on waist
    ...scoopPts,                           // slash exit then scoop to bottom-left
    // closes back to top-left
  ];
  const width = bagWidth;
  const height = bagDepth;

  return {
    id: 'slant-bag',
    name: 'Slant Pocket Bag',
    instruction: instruction || 'Cut 2 (1 + 1 mirror) \xb7 Lining fabric \xb7 Pocket back (against body)',
    polygon,
    sa,
    hem: sa,
    width,
    height,
    type: 'bodice',
    isCutOnFold: false,
    dimensions: { width, height },
  };
}

// Legacy alias — some garments may still import the old name
export { buildSlantPocketBacking as buildSlantPocketFacing };

/**
 * Build a side-seam (in-seam) pocket bag piece.
 * D-shaped: straight top, straight sides, semicircular bottom.
 * bagWidth = depth of bag into garment (7"); bagHeight = total bag length (10").
 *
 * @param {{ bagWidth?: number, bagHeight?: number, sa?: number, instruction?: string }} opts
 */
export function buildSideSeamPocketBag({ bagWidth = 7, bagHeight = 10, sa = 0.5, instruction = '' } = {}) {
  const r = bagWidth / 2;           // semicircle radius = half width
  const straightH = bagHeight - r;  // straight-wall height above semicircle
  const k = 0.5523;                 // bezier approximation factor for quarter circle

  // Right-side arc: (bagWidth, straightH) → (bagWidth/2, bagHeight)
  const arc1 = sampleBezier(
    { x: bagWidth,       y: straightH },
    { x: bagWidth,       y: straightH + r * k },
    { x: bagWidth / 2 + r * k, y: bagHeight },
    { x: bagWidth / 2,   y: bagHeight },
    20,
  ).map((p, i, arr) => ({ ...p, ...(i > 0 && i < arr.length - 1 ? { curve: true } : {}) }));

  // Left-side arc: (bagWidth/2, bagHeight) → (0, straightH)
  const arc2 = sampleBezier(
    { x: bagWidth / 2,       y: bagHeight },
    { x: bagWidth / 2 - r * k, y: bagHeight },
    { x: 0,                  y: straightH + r * k },
    { x: 0,                  y: straightH },
    20,
  ).map((p, i, arr) => ({ ...p, ...(i > 0 && i < arr.length - 1 ? { curve: true } : {}) }));

  // CW polygon: top-left → top-right → right wall → arc right-to-bottom → arc bottom-to-left → closes up left wall
  const polygon = [
    { x: 0,        y: 0 },          // top-left  (inner, waist)
    { x: bagWidth, y: 0 },          // top-right (side seam, waist)
    { x: bagWidth, y: straightH },  // right wall bottom
    ...arc1.slice(1),               // arc right → bottom
    ...arc2.slice(1),               // arc bottom → left
  ];

  const dims = [
    { label: fmtInches(bagWidth),  x1: 0, y1: -0.35, x2: bagWidth, y2: -0.35, type: 'h' },
    { label: fmtInches(bagHeight), x: bagWidth + 0.8, y1: 0, y2: bagHeight, type: 'v' },
  ];

  return {
    id: 'side-bag',
    name: 'Side-Seam Pocket Bag',
    instruction: instruction || `Cut 4 (2 per side) · D-shaped · Straight edge along side seam · Semicircular bottom · Serge all edges`,
    polygon,
    sa, hem: sa,
    width: bagWidth, height: bagHeight,
    type: 'bodice',
    isCutOnFold: false,
    dimensions: { width: bagWidth, height: bagHeight },
    dims,
    labels: [
      { text: 'SIDE SEAM', x: bagWidth + 0.25, y: bagHeight * 0.28, rotation: 90 },
      { text: 'INNER',     x: -0.25,            y: bagHeight * 0.28, rotation: -90 },
    ],
  };
}

/**
 * Clip a front panel polygon at the slash line for a slant pocket.
 * Removes the triangle at the waist/side-seam corner and replaces it
 * with the slash diagonal.
 *
 * Mutates `poly` in place and returns it.
 *
 * @param {Array<{x:number, y:number}>} poly - CW panel polygon
 * @param {number} waistSideX - x of the waist-at-side-seam vertex (width or sideWaistX)
 * @param {number} slashInset - how far in from side seam the slash starts on waist (default 3.5)
 * @param {number} slashDepth - how far below waist the slash meets the side seam (default 6)
 * @returns {Array<{x:number, y:number}>} the mutated polygon
 */
export function clipPanelAtSlash(poly, waistSideX, slashInset = 3.5, slashDepth = 6) {
  // Find the waist-at-side-seam vertex: the point closest to (waistSideX, 0)
  let idx = -1;
  let bestDist = Infinity;
  for (let i = 0; i < poly.length; i++) {
    const d = Math.abs(poly[i].x - waistSideX) + Math.abs(poly[i].y);
    if (d < bestDist) { bestDist = d; idx = i; }
  }
  if (idx < 0 || bestDist > 1) return poly; // safety: no match found

  // Interpolate the actual side seam x at slashDepth (side seam tapers from waist to hip)
  const hipPt = poly[(idx + 1) % poly.length];
  const endX = hipPt.y > 0
    ? waistSideX + (hipPt.x - waistSideX) * (slashDepth / hipPt.y)
    : waistSideX;

  // Replace the corner vertex with two slash endpoints
  poly.splice(idx, 1,
    { x: waistSideX - slashInset, y: 0 },    // slash start on waist
    { x: endX, y: slashDepth },               // slash end on actual side seam
  );
  return poly;
}

/**
 * Clip a front panel polygon at a scoop curve for a curved inset pocket.
 * Like clipPanelAtSlash but replaces the waist/side-seam corner with a
 * concave bezier curve instead of a straight diagonal.
 *
 * Mutates `poly` in place and returns it.
 *
 * @param {Array<{x:number, y:number}>} poly - CW panel polygon
 * @param {number} waistSideX - x of the waist-at-side-seam vertex
 * @param {number} scoopInset - how far in from side seam the scoop starts on waist (default 3.5)
 * @param {number} scoopDepth - how far below waist the scoop meets the side seam (default 6)
 * @returns {Array<{x:number, y:number}>} the mutated polygon
 */
export function clipPanelAtScoop(poly, waistSideX, scoopInset = 3.5, scoopDepth = 6) {
  let idx = -1;
  let bestDist = Infinity;
  for (let i = 0; i < poly.length; i++) {
    const d = Math.abs(poly[i].x - waistSideX) + Math.abs(poly[i].y);
    if (d < bestDist) { bestDist = d; idx = i; }
  }
  if (idx < 0 || bestDist > 1) return poly;

  // Interpolate the actual side seam x at scoopDepth (side seam tapers from waist to hip)
  const hipPt = poly[(idx + 1) % poly.length];
  const endX = hipPt.y > 0
    ? waistSideX + (hipPt.x - waistSideX) * (scoopDepth / hipPt.y)
    : waistSideX;

  // Concave J-curve from waist (inset) to side seam (depth)
  // CP1 vertical → CP2 at same depth as endpoint → horizontal tangent at side seam
  const sx = waistSideX - scoopInset;
  const curvePts = sampleBezier(
    { x: sx, y: 0 },
    { x: sx, y: scoopDepth * 0.45 },
    { x: waistSideX - scoopInset * 0.3, y: scoopDepth },
    { x: endX, y: scoopDepth },
    12,
  ).map((p, i, arr) => ({ ...p, ...(i > 0 && i < arr.length - 1 ? { curve: true } : {}) }));

  poly.splice(idx, 1, ...curvePts);
  return poly;
}

/**
 * Build a scoop pocket backing piece (self-fabric, visible front).
 * Same shape as slant backing. Extends from waist across full bag width,
 * down the side seam, then scoops to the bottom.
 */
export function buildScoopPocketBacking({ bagWidth = 7, scoopInset = 3.5, scoopDepth = 6, bagDepth = 9.5, sa = 0.625, instruction = '' } = {}) {
  const scoopPts = slantPocketScoop(bagWidth, scoopDepth, bagDepth);

  const polygon = [
    { x: 0, y: 0 },
    { x: bagWidth, y: 0 },
    { x: bagWidth, y: scoopDepth },
    ...scoopPts.slice(1),
  ];

  return {
    id: 'scoop-backing',
    name: 'Scoop Pocket Backing',
    instruction: instruction || 'Cut 2 (1 + 1 mirror) \xb7 Self fabric (denim) \xb7 Visible pocket front \xb7 {serge} curved bottom edge before assembling',
    polygon, sa, hem: sa,
    width: bagWidth, height: bagDepth,
    type: 'bodice', isCutOnFold: false,
    dimensions: { width: bagWidth, height: bagDepth },
  };
}

/**
 * Build a scoop pocket bag piece (lining).
 * Top edge follows the scoop curve (matching the front panel opening),
 * bottom edge follows the bag scoop curve.
 */
export function buildScoopPocketBag({ bagWidth = 7, scoopInset = 3.5, scoopDepth = 6, bagDepth = 11.5, sa = 0.625, instruction = '' } = {}) {
  // Curved opening edge from (bagWidth - scoopInset, 0) to (bagWidth, scoopDepth)
  // CP2 at same y as endpoint → horizontal tangent at side seam (no slant at junction)
  const sx = bagWidth - scoopInset;
  const openingPts = sampleBezier(
    { x: sx, y: 0 },
    { x: sx, y: scoopDepth * 0.45 },
    { x: bagWidth - scoopInset * 0.3, y: scoopDepth },
    { x: bagWidth, y: scoopDepth },
    12,
  ).map((p, i, arr) => ({ ...p, ...(i > 0 && i < arr.length - 1 ? { curve: true } : {}) }));

  const bottomPts = slantPocketScoop(bagWidth, scoopDepth, bagDepth);

  const polygon = [
    { x: 0, y: 0 },
    ...openingPts,
    ...bottomPts.slice(1),
  ];

  return {
    id: 'scoop-bag',
    name: 'Scoop Pocket Bag',
    instruction: instruction || 'Cut 2 (1 + 1 mirror) \xb7 Lining (muslin or drill) \xb7 Pocket back (against body)',
    polygon, sa, hem: sa,
    width: bagWidth, height: bagDepth,
    type: 'bodice', isCutOnFold: false,
    dimensions: { width: bagWidth, height: bagDepth },
    marks: [
      { type: 'fold', axis: 'h', position: scoopDepth },
    ],
  };
}

// ── Square-scoop pocket (L-shaped opening with rounded corner) ──────────────

/**
 * Clip a front panel polygon at a square-scoop opening.
 * Replaces the waist/side-seam corner with an L-shaped polyline:
 * vertical drop → rounded 90° corner → horizontal run to side seam.
 *
 * Mutates `poly` in place and returns it.
 *
 * @param {Array<{x:number, y:number}>} poly - CW panel polygon
 * @param {number} waistSideX - x of the waist-at-side-seam vertex
 * @param {number} scoopInset - how far in from side seam the opening starts on waist (default 3.5)
 * @param {number} scoopDepth - how far below waist the opening meets the side seam (default 6)
 * @param {number} cornerRadius - radius of the rounded corner (default 0.75)
 * @returns {Array<{x:number, y:number}>} the mutated polygon
 */
export function clipPanelAtSquareScoop(poly, waistSideX, scoopInset = 3.5, scoopDepth = 6, cornerRadius = 0.75) {
  let idx = -1;
  let bestDist = Infinity;
  for (let i = 0; i < poly.length; i++) {
    const d = Math.abs(poly[i].x - waistSideX) + Math.abs(poly[i].y);
    if (d < bestDist) { bestDist = d; idx = i; }
  }
  if (idx < 0 || bestDist > 1) return poly;

  // Interpolate the actual side seam x at scoopDepth (side seam tapers from waist to hip)
  const hipPt = poly[(idx + 1) % poly.length];
  const endX = hipPt.y > 0
    ? waistSideX + (hipPt.x - waistSideX) * (scoopDepth / hipPt.y)
    : waistSideX;

  const sx = waistSideX - scoopInset;
  const r = Math.min(cornerRadius, scoopInset, scoopDepth);
  const k = 0.5523; // bezier approximation of quarter-circle

  // Quarter-circle from end of vertical to start of horizontal
  const arcPts = sampleBezier(
    { x: sx, y: scoopDepth - r },
    { x: sx, y: scoopDepth - r + r * k },
    { x: sx + r - r * k, y: scoopDepth },
    { x: sx + r, y: scoopDepth },
    6,
  ).map((p, i, arr) => ({ ...p, ...(i > 0 && i < arr.length - 1 ? { curve: true } : {}) }));

  const pts = [
    { x: sx, y: 0 },                // opening start on waist
    { x: sx, y: scoopDepth - r },   // bottom of vertical segment (arc start)
    ...arcPts.slice(1, -1),          // arc mid-points (skip endpoints, already covered)
    { x: sx + r, y: scoopDepth },   // end of arc / start of horizontal
    { x: endX, y: scoopDepth },     // opening end on actual side seam
  ];

  poly.splice(idx, 1, ...pts);
  return poly;
}

/**
 * Build a square-scoop pocket backing piece (self-fabric, visible front).
 * Same shape as scoop backing: rectangle from waist across full bag width,
 * down the side seam, then scoop curve at the bottom.
 */
export function buildSquareScoopPocketBacking({ bagWidth = 7, scoopInset = 3.5, scoopDepth = 6, bagDepth = 9.5, sa = 0.625, instruction = '' } = {}) {
  const scoopPts = slantPocketScoop(bagWidth, scoopDepth, bagDepth);

  const polygon = [
    { x: 0, y: 0 },
    { x: bagWidth, y: 0 },
    { x: bagWidth, y: scoopDepth },
    ...scoopPts.slice(1),
  ];

  return {
    id: 'square-scoop-backing',
    name: 'Square Scoop Pocket Backing',
    instruction: instruction || 'Cut 2 (1 + 1 mirror) \xb7 Self fabric (denim) \xb7 Visible pocket front \xb7 {serge} curved bottom edge before assembling',
    polygon, sa, hem: sa,
    width: bagWidth, height: bagDepth,
    type: 'bodice', isCutOnFold: false,
    dimensions: { width: bagWidth, height: bagDepth },
  };
}

/**
 * Build a square-scoop pocket bag piece (lining).
 * Top-right edge follows the L-shaped opening (vertical + rounded corner + horizontal),
 * bottom edge follows the bag scoop curve.
 */
export function buildSquareScoopPocketBag({ bagWidth = 7, scoopInset = 3.5, scoopDepth = 6, bagDepth = 11.5, cornerRadius = 0.75, sa = 0.625, instruction = '' } = {}) {
  const sx = bagWidth - scoopInset;
  const r = Math.min(cornerRadius, scoopInset, scoopDepth);
  const k = 0.5523;

  // L-shaped opening edge matching clipPanelAtSquareScoop
  const arcPts = sampleBezier(
    { x: sx, y: scoopDepth - r },
    { x: sx, y: scoopDepth - r + r * k },
    { x: sx + r - r * k, y: scoopDepth },
    { x: sx + r, y: scoopDepth },
    6,
  ).map((p, i, arr) => ({ ...p, ...(i > 0 && i < arr.length - 1 ? { curve: true } : {}) }));

  const openingPts = [
    { x: sx, y: 0 },
    { x: sx, y: scoopDepth - r },
    ...arcPts.slice(1, -1),
    { x: sx + r, y: scoopDepth },
    { x: bagWidth, y: scoopDepth },
  ];

  const bottomPts = slantPocketScoop(bagWidth, scoopDepth, bagDepth);

  const polygon = [
    { x: 0, y: 0 },
    ...openingPts,
    ...bottomPts.slice(1),
  ];

  return {
    id: 'square-scoop-bag',
    name: 'Square Scoop Pocket Bag',
    instruction: instruction || 'Cut 2 (1 + 1 mirror) \xb7 Lining (muslin or drill) \xb7 Pocket back (against body)',
    polygon, sa, hem: sa,
    width: bagWidth, height: bagDepth,
    type: 'bodice', isCutOnFold: false,
    dimensions: { width: bagWidth, height: bagDepth },
  };
}

// ── Fold-over pocket bag builders ────────────────────────────────────────────
// RTW/professional construction: one lining piece cut on fold at the inner
// (left) edge. The fold replaces the inner seam; the bottom is finished with
// a French seam after the pocket is attached to the front panel.
//
// Construction sequence:
//  1. Serge/finish curved bottom edge of self-fabric backing piece.
//  2. With fold-over bag laid flat (unfolded), place backing WS-to-WS on the
//     outer half, align top and side-seam edges. Baste top and side edges.
//     Backing's serged bottom edge hangs free.
//  3. Align bag+backing unit's opening edge to front panel scoop edge RST.
//     Sew the opening curve. Clip every 1/2". Turn pocket to WS of panel.
//     Press. Understitch. Topstitch 1/4" from opening edge.
//  4. Fold the bag at the fold line RST, bottom edges aligned.
//     Stitch bottom 3/8" SA. Trim to 1/8". Clip curve. Flip WST.
//     Stitch again 1/4" from edge (French seam). Press.
//  5. Baste top and side seam edges of pocket bag to panel SAs.

/**
 * Build a fold-over scoop pocket bag piece (lining, cut on fold).
 * Identical polygon to buildScoopPocketBag — the fold is at x = 0 (inner
 * edge). Cut on fold; when opened flat the piece is 2× as wide.
 */
export function buildFoldOverScoopPocketBag({ bagWidth = 7, scoopInset = 3.5, scoopDepth = 6, bagDepth = 11.5, sa = 0.625, instruction = '' } = {}) {
  const sx = bagWidth - scoopInset;
  const openingPts = sampleBezier(
    { x: sx, y: 0 },
    { x: sx, y: scoopDepth * 0.45 },
    { x: bagWidth - scoopInset * 0.3, y: scoopDepth },
    { x: bagWidth, y: scoopDepth },
    12,
  ).map((p, i, arr) => ({ ...p, ...(i > 0 && i < arr.length - 1 ? { curve: true } : {}) }));

  const bottomPts = slantPocketScoop(bagWidth, scoopDepth, bagDepth);

  const polygon = [
    { x: 0, y: 0 },
    ...openingPts,
    ...bottomPts.slice(1),
  ];

  return {
    id: 'scoop-bag',
    name: 'Scoop Pocket Bag (Fold-Over)',
    instruction: instruction || 'Cut 2 on fold (1 + 1 mirror) \xb7 Lining (muslin or drill) \xb7 Fold line at inner (left) edge \xb7 French seam at bottom after attaching to panel',
    polygon, sa, hem: sa,
    width: bagWidth, height: bagDepth,
    type: 'bodice', isCutOnFold: true,
    foldEdge: 'left',
    dimensions: { width: bagWidth, height: bagDepth },
    marks: [
      { type: 'fold', axis: 'v', position: 0 },
    ],
    // Opening edges (J-curve, indices 1–12) get 3/8″ SA; fold closure edge gets 0 SA.
    edgeAllowances: polygon.map((_, i) => {
      if (i >= 1 && i <= 12) return { sa: 0.375, label: 'opening' };
      if (i === polygon.length - 1) return { sa: 0, label: 'fold' };
      return { sa, label: '' };
    }),
  };
}

/**
 * Build a fold-over square-scoop pocket bag piece (lining, cut on fold).
 * Identical polygon to buildSquareScoopPocketBag — fold at x = 0 (inner edge).
 */
export function buildFoldOverSquareScoopPocketBag({ bagWidth = 7, scoopInset = 3.5, scoopDepth = 6, bagDepth = 11.5, cornerRadius = 0.75, sa = 0.625, instruction = '' } = {}) {
  const sx = bagWidth - scoopInset;
  const r = Math.min(cornerRadius, scoopInset, scoopDepth);
  const k = 0.5523;

  const arcPts = sampleBezier(
    { x: sx, y: scoopDepth - r },
    { x: sx, y: scoopDepth - r + r * k },
    { x: sx + r - r * k, y: scoopDepth },
    { x: sx + r, y: scoopDepth },
    6,
  ).map((p, i, arr) => ({ ...p, ...(i > 0 && i < arr.length - 1 ? { curve: true } : {}) }));

  const openingPts = [
    { x: sx, y: 0 },
    { x: sx, y: scoopDepth - r },
    ...arcPts.slice(1, -1),
    { x: sx + r, y: scoopDepth },
    { x: bagWidth, y: scoopDepth },
  ];

  const bottomPts = slantPocketScoop(bagWidth, scoopDepth, bagDepth);

  const polygon = [
    { x: 0, y: 0 },
    ...openingPts,
    ...bottomPts.slice(1),
  ];

  return {
    id: 'square-scoop-bag',
    name: 'Square Scoop Pocket Bag (Fold-Over)',
    instruction: instruction || 'Cut 2 on fold (1 + 1 mirror) \xb7 Lining (muslin or drill) \xb7 Fold line at inner (left) edge \xb7 French seam at bottom after attaching to panel',
    polygon, sa, hem: sa,
    width: bagWidth, height: bagDepth,
    type: 'bodice', isCutOnFold: true,
    foldEdge: 'left',
    dimensions: { width: bagWidth, height: bagDepth },
    marks: [
      { type: 'fold', axis: 'v', position: 0 },
    ],
    // Opening edges (straight + arc + horizontal to side seam, indices 1–8) get 3/8″ SA.
    edgeAllowances: polygon.map((_, i) => {
      if (i >= 1 && i <= 8) return { sa: 0.375, label: 'opening' };
      if (i === polygon.length - 1) return { sa: 0, label: 'fold' };
      return { sa, label: '' };
    }),
  };
}
