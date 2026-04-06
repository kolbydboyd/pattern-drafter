// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Flat Sketch Renderer -- generates assembled garment silhouette SVGs
 * from pattern piece polygons for Etsy listing images.
 *
 * Takes piece data from garment modules and assembles them into a
 * finished-garment outline (mirroring fold pieces, positioning sleeves
 * at shoulders, etc.) for marketing imagery.
 */

// ── Brand constants ──────────────────────────────────────────────────────────
const COLORS = {
  dark: '#1a1714',
  text: '#e8e0d4',
  gold: '#c9a96e',
  lightBg: '#f4f1eb',
  darkText: '#2c2a26',
  stitch: '#6a6560',
};

const FONT = {
  heading: "'Fraunces', serif",
  body: "'IBM Plex Mono', monospace",
};

// ── Geometry helpers ─────────────────────────────────────────────────────────

/** Mirror a polygon across x = 0 (left-right flip), reversing winding. */
function mirrorX(poly) {
  return [...poly].reverse().map(p => ({ x: -p.x, y: p.y }));
}

/** Translate all points in a polygon. */
function translate(poly, dx, dy) {
  return poly.map(p => ({ x: p.x + dx, y: p.y + dy }));
}

/** Bounding box of a polygon. */
function bbox(poly) {
  const xs = poly.map(p => p.x), ys = poly.map(p => p.y);
  return {
    minX: Math.min(...xs), maxX: Math.max(...xs),
    minY: Math.min(...ys), maxY: Math.max(...ys),
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys),
  };
}

/** Bounding box of multiple polygons combined. */
function combinedBbox(polys) {
  const all = polys.flat();
  return bbox(all);
}

/** Convert polygon to SVG path string. */
function polyToPath(poly) {
  if (!poly.length) return '';
  let d = `M ${poly[0].x.toFixed(2)} ${poly[0].y.toFixed(2)}`;
  for (let i = 1; i < poly.length; i++) {
    d += ` L ${poly[i].x.toFixed(2)} ${poly[i].y.toFixed(2)}`;
  }
  return d + ' Z';
}

// ── Illustration embedding ───────────────────────────────────────────────────
// Pre-generated garment illustrations live at public/garment-illustrations/<id>.svg
// These are hand-crafted 160x200 gold-stroke SVGs. The export script reads
// them and passes the SVG content to render functions via options.illustrationSvg.

/**
 * Extract inner content from an SVG string (paths/rects between <svg> tags).
 */
export function extractSvgInner(svgString) {
  return svgString.replace(/<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').trim();
}

/**
 * Extract the viewBox from an SVG string.
 */
function extractViewBox(svgString) {
  const match = svgString.match(/viewBox="([^"]+)"/);
  if (match) {
    const [x, y, w, h] = match[1].split(/\s+/).map(Number);
    return { x, y, w, h };
  }
  return { x: 0, y: 0, w: 160, h: 200 };
}

// ── SVG rendering ────────────────────────────────────────────────────────────

/**
 * Render assembled polygons as a clean flat sketch SVG.
 *
 * @param {Object} garment - Garment definition (id, name, category, etc.)
 * @param {Array} pieces - Output of garment.pieces(measurements, options) (unused if illustrationSvg provided)
 * @param {Object} options
 * @param {number} options.size - SVG canvas size in px (default 2000)
 * @param {'dark'|'light'} options.theme - Background theme
 * @param {boolean} options.showDetails - Show pocket/dart detail lines
 * @param {boolean} options.showName - Show garment name
 * @param {boolean} options.showBadges - Show marketing badges
 * @param {string} options.illustrationSvg - Raw SVG string of the garment illustration (from public/garment-illustrations/)
 * @returns {string} SVG string
 */
export function renderFlatSketch(garment, pieces, options = {}) {
  const {
    size = 2000,
    theme = 'dark',
    showDetails = true,
    showName = true,
    showBadges = true,
    illustrationSvg = null,
  } = options;

  const isDark = theme === 'dark';
  const bg = isDark ? COLORS.dark : COLORS.lightBg;
  const illustrationStroke = isDark ? COLORS.text : COLORS.darkText;

  // Compute layout regions
  const padding = size * 0.1;
  const nameSpace = showName ? size * 0.14 : 0;
  const badgeSpace = showBadges ? size * 0.1 : 0;
  const drawH = size - padding * 2 - nameSpace - badgeSpace;
  const drawW = size - padding * 2;

  // Build illustration content
  let illustrationSVG = '';
  if (illustrationSvg) {
    // Use the hand-crafted illustration SVG -- scale it up to fill the drawing area
    const vb = extractViewBox(illustrationSvg);
    const inner = extractSvgInner(illustrationSvg);
    const ilScale = Math.min(drawW / vb.w, drawH / vb.h) * 0.92;
    const ilW = vb.w * ilScale;
    const ilH = vb.h * ilScale;
    const ilX = (size - ilW) / 2;
    const ilY = padding + nameSpace + (drawH - ilH) / 2;

    // Set stroke on the <g> wrapper -- the illustration paths inherit from parent
    illustrationSVG = `<g transform="translate(${ilX.toFixed(1)},${ilY.toFixed(1)}) scale(${ilScale.toFixed(4)})" fill="none" stroke="${illustrationStroke}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${inner}</g>`;
  } else {
    // Fallback: assemble from pattern pieces (basic approach)
    const front = pieces.find(p => p.polygon);
    if (front) {
      const pts = front.polygon.filter(p => !p.curve);
      const rightHalf = pts;
      const leftHalf = mirrorX(rightHalf);
      const full = [...leftHalf, ...rightHalf.slice(1)];
      const cb = bbox(full);
      const scale = Math.min(drawW / cb.width, drawH / cb.height) * 0.75;
      const offX = size / 2 - (cb.minX + cb.width / 2) * scale;
      const offY = padding + nameSpace + drawH / 2 - (cb.minY + cb.height / 2) * scale;
      const svgPts = full.map(p => ({ x: p.x * scale + offX, y: p.y * scale + offY }));
      illustrationSVG = `<path d="${polyToPath(svgPts)}" stroke="${illustrationStroke}" stroke-width="2.5" fill="none" stroke-linejoin="round"/>`;
    }
  }

  // Garment name text
  let nameSVG = '';
  if (showName) {
    const nameY = padding * 0.6 + 10;
    // Clean up display name: remove "(W)" suffix, format nicely
    const displayName = garment.name
      .replace(/\s*\(W\)\s*$/, '')
      .replace(/\s*\(M\)\s*$/, '');

    nameSVG += `<text x="${size / 2}" y="${nameY}" font-family="${FONT.heading}" font-size="120" font-weight="300" fill="${isDark ? COLORS.text : COLORS.darkText}" text-anchor="middle" letter-spacing="3">${displayName}</text>`;

    // Gold accent line under name
    const lineY = nameY + 30;
    const lineW = Math.min(displayName.length * 45, size * 0.4);
    nameSVG += `<line x1="${size / 2 - lineW / 2}" y1="${lineY}" x2="${size / 2 + lineW / 2}" y2="${lineY}" stroke="${COLORS.gold}" stroke-width="3"/>`;
  }

  // Marketing badges
  let badgesSVG = '';
  if (showBadges) {
    const badgeY = size - padding * 0.8;
    const badges = [
      'PDF Sewing Pattern',
      'Made to Your Measurements',
      garment.difficulty === 'beginner' ? 'Beginner Friendly' : 'Intermediate',
    ];

    const badgeW = 440;
    const gap = 50;
    const totalW = badges.length * badgeW + (badges.length - 1) * gap;
    let startX = (size - totalW) / 2;

    for (const badge of badges) {
      const cx = startX + badgeW / 2;
      // Badge pill background
      badgesSVG += `<rect x="${startX}" y="${badgeY - 40}" width="${badgeW}" height="${64}" rx="32" fill="none" stroke="${COLORS.gold}" stroke-width="2"/>`;
      badgesSVG += `<text x="${cx}" y="${badgeY + 2}" font-family="${FONT.body}" font-size="28" font-weight="500" fill="${COLORS.gold}" text-anchor="middle" letter-spacing="1.5">${badge}</text>`;
      startX += badgeW + gap;
    }
  }

  // Logo watermark (bottom-right corner)
  const logoSVG = `
    <text x="${size - padding}" y="${size - 55}" font-family="${FONT.heading}" font-size="42" font-weight="300" fill="${isDark ? 'rgba(232,224,212,0.35)' : 'rgba(44,42,38,0.25)'}" text-anchor="end">People's Patterns</text>
    <text x="${size - padding}" y="${size - 20}" font-family="${FONT.body}" font-size="18" font-weight="500" fill="${isDark ? 'rgba(232,224,212,0.25)' : 'rgba(44,42,38,0.18)'}" text-anchor="end" letter-spacing="4">PATTERNS</text>
  `;

  return `<svg viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${bg}"/>
  ${nameSVG}
  ${illustrationSVG}
  ${badgesSVG}
  ${logoSVG}
</svg>`;
}

/**
 * Render a pattern pieces overview SVG showing all polygon pieces
 * arranged in a grid, labeled, with clean styling for Etsy listings.
 */
export function renderPiecesOverview(garment, pieces, options = {}) {
  const { size = 2000, theme = 'light' } = options;
  const isDark = theme === 'dark';
  const bg = isDark ? COLORS.dark : COLORS.lightBg;
  const stroke = isDark ? COLORS.text : COLORS.darkText;
  const fill = isDark ? 'rgba(232,224,212,0.04)' : 'rgba(44,42,38,0.03)';

  // Filter to only polygon pieces
  const polyPieces = pieces.filter(p => p.polygon && p.polygon.length > 2);

  if (!polyPieces.length) {
    return `<svg viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg"><rect width="${size}" height="${size}" fill="${bg}"/></svg>`;
  }

  // Compute grid layout
  const cols = Math.ceil(Math.sqrt(polyPieces.length));
  const rows = Math.ceil(polyPieces.length / cols);

  const padding = size * 0.08;
  const headerH = size * 0.1;
  const cellW = (size - padding * 2) / cols;
  const cellH = (size - padding * 2 - headerH) / rows;
  const cellPad = 30;

  // Header
  const displayName = garment.name.replace(/\s*\(W\)\s*$/, '').replace(/\s*\(M\)\s*$/, '');
  let svg = `<svg viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${bg}"/>
  <text x="${size / 2}" y="${padding + 70}" font-family="${FONT.heading}" font-size="72" font-weight="300" fill="${isDark ? COLORS.text : COLORS.darkText}" text-anchor="middle">${displayName} - Pattern Pieces</text>
  <line x1="${size / 2 - 160}" y1="${padding + 92}" x2="${size / 2 + 160}" y2="${padding + 92}" stroke="${COLORS.gold}" stroke-width="2.5"/>
  `;

  // Render each piece in its grid cell
  for (let i = 0; i < polyPieces.length; i++) {
    const piece = polyPieces[i];
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cellX = padding + col * cellW;
    const cellY = padding + headerH + row * cellH;

    const pts = piece.polygon.filter(p => !p.curve);
    const b = bbox(pts);

    // Scale piece to fit cell
    const availW = cellW - cellPad * 2;
    const availH = cellH - cellPad * 2 - 40; // leave room for label
    const s = Math.min(availW / b.width, availH / b.height) * 0.85;

    const ox = cellX + cellW / 2 - (b.minX + b.width / 2) * s;
    const oy = cellY + cellPad + (availH / 2) - (b.minY + b.height / 2) * s;

    const svgPts = pts.map(p => ({
      x: p.x * s + ox,
      y: p.y * s + oy,
    }));

    svg += `<path d="${polyToPath(svgPts)}" stroke="${stroke}" stroke-width="1.5" fill="${fill}" stroke-linejoin="round"/>`;

    // Piece label
    svg += `<text x="${cellX + cellW / 2}" y="${cellY + cellH - 15}" font-family="${FONT.body}" font-size="28" fill="${isDark ? COLORS.stitch : '#666'}" text-anchor="middle">${piece.name}</text>`;
  }

  // Footer
  svg += `<text x="${size / 2}" y="${size - 50}" font-family="${FONT.body}" font-size="26" fill="${COLORS.gold}" text-anchor="middle" letter-spacing="2">All pieces included - cut lines, stitch lines, notches, grainlines</text>`;

  svg += '</svg>';
  return svg;
}

/**
 * Render a measurement guide SVG for Etsy listings.
 * Shows which body measurements are needed for a specific garment.
 */
export function renderMeasurementGuide(garment, options = {}) {
  const { size = 2000, theme = 'light' } = options;
  const isDark = theme === 'dark';
  const bg = isDark ? COLORS.dark : COLORS.lightBg;
  const textColor = isDark ? COLORS.text : COLORS.darkText;
  const mutedColor = isDark ? COLORS.stitch : '#888';

  const displayName = garment.name.replace(/\s*\(W\)\s*$/, '').replace(/\s*\(M\)\s*$/, '');

  // Measurement display names
  const MEASUREMENT_LABELS = {
    chest: 'Chest',
    waist: 'Waist',
    hip: 'Hip',
    shoulder: 'Shoulder',
    neck: 'Neck',
    sleeveLength: 'Sleeve Length',
    bicep: 'Bicep',
    torsoLength: 'Torso Length',
    rise: 'Rise',
    thigh: 'Thigh',
    inseam: 'Inseam',
    skirtLength: 'Skirt Length',
    outseam: 'Outseam',
    knee: 'Knee',
    armToElbow: 'Arm to Elbow',
    seatDepth: 'Seat Depth',
    bustCircumference: 'Bust',
    underbust: 'Underbust',
    shoulderToWaist: 'Shoulder to Waist',
    fullLength: 'Full Length',
  };

  const measurements = garment.measurements || [];
  const measLabels = measurements.map(m => MEASUREMENT_LABELS[m] || m);

  let svg = `<svg viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${bg}"/>

  <text x="${size / 2}" y="180" font-family="${FONT.heading}" font-size="80" font-weight="300" fill="${textColor}" text-anchor="middle">${displayName}</text>
  <line x1="${size / 2 - 140}" y1="210" x2="${size / 2 + 140}" y2="210" stroke="${COLORS.gold}" stroke-width="2.5"/>
  <text x="${size / 2}" y="280" font-family="${FONT.body}" font-size="36" fill="${mutedColor}" text-anchor="middle" letter-spacing="2">Measurements Needed</text>
  `;

  // List measurements with styled bullets
  const startY = 420;
  const lineH = 100;
  const leftX = size * 0.3;

  for (let i = 0; i < measLabels.length; i++) {
    const y = startY + i * lineH;
    // Gold circle bullet
    svg += `<circle cx="${leftX - 40}" cy="${y - 12}" r="10" fill="${COLORS.gold}"/>`;
    svg += `<text x="${leftX}" y="${y}" font-family="${FONT.body}" font-size="44" fill="${textColor}">${measLabels[i]}</text>`;
  }

  // Bottom message
  svg += `<text x="${size / 2}" y="${size - 140}" font-family="${FONT.body}" font-size="36" fill="${COLORS.gold}" text-anchor="middle" letter-spacing="2">Enter your measurements. Get your pattern.</text>`;
  svg += `<text x="${size / 2}" y="${size - 90}" font-family="${FONT.body}" font-size="28" fill="${mutedColor}" text-anchor="middle">That's it.</text>`;

  svg += '</svg>';
  return svg;
}

/**
 * Render an options/variations grid SVG showing all garment customization options.
 */
export function renderOptionsGrid(garment, options = {}) {
  const { size = 2000, theme = 'light' } = options;
  const isDark = theme === 'dark';
  const bg = isDark ? COLORS.dark : COLORS.lightBg;
  const textColor = isDark ? COLORS.text : COLORS.darkText;
  const mutedColor = isDark ? COLORS.stitch : '#888';

  const displayName = garment.name.replace(/\s*\(W\)\s*$/, '').replace(/\s*\(M\)\s*$/, '');

  // Get all non-SA, non-hem options
  const garmentOpts = garment.options || {};
  const optEntries = Object.entries(garmentOpts).filter(([key]) =>
    key !== 'sa' && key !== 'hem' && key !== 'frontExt' && key !== 'backExt' &&
    key !== 'cbRaise' && key !== 'riseOverride'
  );

  let svg = `<svg viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${bg}"/>

  <text x="${size / 2}" y="170" font-family="${FONT.heading}" font-size="80" font-weight="300" fill="${textColor}" text-anchor="middle">${displayName}</text>
  <line x1="${size / 2 - 140}" y1="200" x2="${size / 2 + 140}" y2="200" stroke="${COLORS.gold}" stroke-width="2.5"/>
  <text x="${size / 2}" y="265" font-family="${FONT.body}" font-size="36" fill="${mutedColor}" text-anchor="middle" letter-spacing="2">Customize Your Pattern</text>
  `;

  // Grid layout for options
  const cols = Math.min(2, optEntries.length);
  const rows = Math.ceil(optEntries.length / cols);
  const padding = size * 0.08;
  const startY = 340;
  const cellW = (size - padding * 2) / cols;
  const cellH = Math.min(180, (size - startY - 250) / rows);

  for (let i = 0; i < optEntries.length; i++) {
    const [key, opt] = optEntries[i];
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = padding + col * cellW;
    const y = startY + row * cellH;

    // Option label
    svg += `<text x="${x + 30}" y="${y + 40}" font-family="${FONT.body}" font-size="32" font-weight="500" fill="${COLORS.gold}">${opt.label || key}</text>`;

    // Option values
    if (opt.values) {
      const valStr = opt.values.map(v => v.label).join('  |  ');
      const display = valStr.length > 55 ? valStr.substring(0, 52) + '...' : valStr;
      svg += `<text x="${x + 30}" y="${y + 80}" font-family="${FONT.body}" font-size="24" fill="${mutedColor}">${display}</text>`;
    }
  }

  // Count total combinations
  let combos = 1;
  for (const [, opt] of optEntries) {
    if (opt.values) combos *= opt.values.length;
  }

  svg += `<text x="${size / 2}" y="${size - 120}" font-family="${FONT.body}" font-size="40" fill="${COLORS.gold}" text-anchor="middle" letter-spacing="2">${combos}+ unique combinations</text>`;
  svg += `<text x="${size / 2}" y="${size - 70}" font-family="${FONT.body}" font-size="28" fill="${mutedColor}" text-anchor="middle">Your pattern. Your way.</text>`;

  svg += '</svg>';
  return svg;
}

/**
 * Render the "What Makes Us Different" comparison slide for Etsy listings.
 */
export function renderDifferentiator(options = {}) {
  const { size = 2000 } = options;
  const bg = COLORS.lightBg;
  const textColor = COLORS.darkText;

  return `<svg viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${bg}"/>

  <text x="${size / 2}" y="130" font-family="${FONT.heading}" font-size="56" font-weight="300" fill="${textColor}" text-anchor="middle">Why Custom Fit?</text>
  <line x1="${size / 2 - 80}" y1="155" x2="${size / 2 + 80}" y2="155" stroke="${COLORS.gold}" stroke-width="2"/>

  <!-- Left: Standard patterns problem -->
  <rect x="100" y="240" width="800" height="700" rx="12" fill="#fff" stroke="#ddd" stroke-width="1"/>
  <text x="500" y="310" font-family="${FONT.body}" font-size="28" font-weight="500" fill="#999" text-anchor="middle" letter-spacing="2">STANDARD SIZES</text>
  <line x1="200" y1="330" x2="800" y2="330" stroke="#eee" stroke-width="1"/>

  <text x="500" y="400" font-family="${FONT.body}" font-size="22" fill="#999" text-anchor="middle">XS - S - M - L - XL - 2XL</text>
  <text x="500" y="480" font-family="${FONT.body}" font-size="20" fill="#bbb" text-anchor="middle">Assumes your proportions</text>
  <text x="500" y="520" font-family="${FONT.body}" font-size="20" fill="#bbb" text-anchor="middle">match a size chart</text>

  <text x="500" y="640" font-family="${FONT.body}" font-size="24" fill="#c44" text-anchor="middle">Gaps at the waist?</text>
  <text x="500" y="680" font-family="${FONT.body}" font-size="24" fill="#c44" text-anchor="middle">Too tight at the hip?</text>
  <text x="500" y="720" font-family="${FONT.body}" font-size="24" fill="#c44" text-anchor="middle">Sleeves too long?</text>

  <text x="500" y="840" font-family="${FONT.body}" font-size="18" fill="#bbb" text-anchor="middle">"Between sizes? Pick the closest one."</text>

  <!-- Right: People's Patterns solution -->
  <rect x="1100" y="240" width="800" height="700" rx="12" fill="${COLORS.dark}" stroke="${COLORS.gold}" stroke-width="2"/>
  <text x="1500" y="310" font-family="${FONT.body}" font-size="28" font-weight="500" fill="${COLORS.gold}" text-anchor="middle" letter-spacing="2">YOUR MEASUREMENTS</text>
  <line x1="1200" y1="330" x2="1800" y2="330" stroke="${COLORS.gold}" stroke-width="0.5" opacity="0.3"/>

  <text x="1500" y="400" font-family="${FONT.body}" font-size="22" fill="${COLORS.text}" text-anchor="middle">Custom Fit - Any Size</text>
  <text x="1500" y="480" font-family="${FONT.body}" font-size="20" fill="${COLORS.stitch}" text-anchor="middle">Drafted from YOUR body</text>
  <text x="1500" y="520" font-family="${FONT.body}" font-size="20" fill="${COLORS.stitch}" text-anchor="middle">measurements, not a chart</text>

  <text x="1500" y="640" font-family="${FONT.body}" font-size="24" fill="${COLORS.gold}" text-anchor="middle">Waist fits your waist</text>
  <text x="1500" y="680" font-family="${FONT.body}" font-size="24" fill="${COLORS.gold}" text-anchor="middle">Hip fits your hip</text>
  <text x="1500" y="720" font-family="${FONT.body}" font-size="24" fill="${COLORS.gold}" text-anchor="middle">Every measurement, yours</text>

  <text x="1500" y="840" font-family="${FONT.body}" font-size="18" fill="${COLORS.stitch}" text-anchor="middle">"Enter your numbers. Get your pattern."</text>

  <!-- Bottom callout -->
  <text x="${size / 2}" y="1100" font-family="${FONT.heading}" font-size="42" font-weight="300" fill="${textColor}" text-anchor="middle">Not a size chart.</text>
  <text x="${size / 2}" y="1160" font-family="${FONT.heading}" font-size="42" font-weight="300" fill="${COLORS.gold}" text-anchor="middle">Your body. Your pattern.</text>

  <text x="${size / 2}" y="${size - 50}" font-family="${FONT.body}" font-size="16" fill="#bbb" text-anchor="middle" letter-spacing="3">PEOPLE'S PATTERNS - made-to-measure sewing patterns</text>
</svg>`;
}

/**
 * Render the brand/trust closing slide for Etsy listings.
 */
export function renderBrandSlide(options = {}) {
  const { size = 2000 } = options;

  return `<svg viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${COLORS.dark}"/>

  <!-- Logo -->
  <text x="${size / 2}" y="820" font-family="${FONT.heading}" font-size="140" font-weight="300" fill="${COLORS.text}" text-anchor="middle">People's</text>
  <text x="${size / 2}" y="920" font-family="${FONT.body}" font-size="56" font-weight="500" fill="${COLORS.gold}" text-anchor="middle" letter-spacing="14">PATTERNS</text>
  <line x1="${size / 2 - 160}" y1="945" x2="${size / 2 + 160}" y2="945" stroke="${COLORS.gold}" stroke-width="2.5"/>

  <text x="${size / 2}" y="1020" font-family="${FONT.body}" font-size="32" fill="${COLORS.stitch}" text-anchor="middle" letter-spacing="3">made-to-measure sewing patterns</text>

  <!-- Trust badges -->
  <text x="${size / 2 - 380}" y="1200" font-family="${FONT.body}" font-size="26" fill="${COLORS.gold}" text-anchor="middle">Instant PDF Download</text>
  <text x="${size / 2}" y="1200" font-family="${FONT.body}" font-size="26" fill="${COLORS.gold}" text-anchor="middle">Print at Home</text>
  <text x="${size / 2 + 380}" y="1200" font-family="${FONT.body}" font-size="26" fill="${COLORS.gold}" text-anchor="middle">Custom Fit for Every Body</text>

  <!-- Divider dots between badges -->
  <circle cx="${size / 2 - 190}" cy="1194" r="4" fill="${COLORS.stitch}"/>
  <circle cx="${size / 2 + 190}" cy="1194" r="4" fill="${COLORS.stitch}"/>

  <text x="${size / 2}" y="1350" font-family="${FONT.body}" font-size="26" fill="${COLORS.stitch}" text-anchor="middle">peoplespatterns.com</text>
</svg>`;
}
