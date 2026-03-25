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
 *
 * @param {string} easeKey - Key from EASE_VALUES ('slim' | 'regular' | 'relaxed' | 'wide')
 * @returns {{ front: number, back: number, total: number }} Ease in inches per panel
 */
export function easeDistribution(easeKey) {
  const total = EASE_VALUES[easeKey] || 2.5;
  return { front: total * 0.4, back: total * 0.6, total };
}
