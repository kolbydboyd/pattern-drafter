/**
 * Core geometry engine for pattern drafting.
 * All measurements in inches. SVG scale applied at render time.
 */

export function norm(v) {
  const l = Math.sqrt(v.x * v.x + v.y * v.y);
  return l > 0 ? { x: v.x / l, y: v.y / l } : { x: 0, y: 0 };
}

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
  const p1 = { x: ox, y: oy + rise * (isBack ? 0.5 : 0.6) };
  const p2 = { x: ox - ext * (isBack ? 0.55 : 0.35), y: oy + rise * (isBack ? 0.88 : 0.93) };
  return { p0, p1, p2, p3 };
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

    // Outward normals (for CW winding, outward is left of travel direction)
    const nIn  = norm({ x: -(curr.y - prev.y), y: curr.x - prev.x });
    const nOut = norm({ x: -(next.y - curr.y), y: next.x - curr.x });

    if (Math.abs(oIn - oOut) < 1e-9) {
      // Same offset on both adjacent edges — compute miter.
      // Clamp dot to ≥0.35 to cap spike on sharp corners; fall back on
      // perpendicular when avg is degenerate (e.g. a cusp).
      const avg    = norm({ x: nIn.x + nOut.x, y: nIn.y + nOut.y });
      const rawDot = nIn.x * avg.x + nIn.y * avg.y;
      const dot    = rawDot !== 0 ? Math.max(Math.abs(rawDot), 0.35) * Math.sign(rawDot) : 0;
      const miter  = dot !== 0
        ? Math.min(Math.abs(oIn / dot), oIn * 2.5) * Math.sign(oIn / dot)
        : oIn;
      result.push({ x: curr.x + avg.x * miter, y: curr.y + avg.y * miter });
    } else {
      // Different offsets on adjacent edges — step corner.
      // Emit two offset points (one per edge normal) so each edge remains
      // a perfect parallel copy at its own distance.
      result.push({ x: curr.x + nIn.x  * oIn,  y: curr.y + nIn.y  * oIn  });
      result.push({ x: curr.x + nOut.x * oOut,  y: curr.y + nOut.y * oOut });
    }
  }

  return result;
}

/**
 * Convert polygon to SVG path string
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
 * Format inches as a readable fraction string
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
 * Leg shape definitions — knee and hem widths as ratio of hip panel width
 */
export const LEG_SHAPES = {
  skinny:   { knee: 0.72, hem: 0.58 },
  slim:     { knee: 0.80, hem: 0.68 },
  straight: { knee: 0.90, hem: 0.85 },
  bootcut:  { knee: 0.78, hem: 0.92 },
  wide:     { knee: 1.00, hem: 1.10 },
};

/**
 * Calculate ease distribution (front gets 40%, back gets 60%)
 */
export const EASE_VALUES = {
  slim: 1.5,
  regular: 2.5,
  relaxed: 4,
  wide: 6,
};

export function easeDistribution(easeKey) {
  const total = EASE_VALUES[easeKey] || 2.5;
  return { front: total * 0.4, back: total * 0.6, total };
}
