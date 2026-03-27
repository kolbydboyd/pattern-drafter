// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Print layout generator.
 * Converts garment module output into a multi-page printable HTML document.
 *
 * Page order:
 *   1) Cover sheet — garment name, measurements used, options
 *   2) Scale verification (2×2 in + 5×5 cm squares) + tile assembly map
 *   3) Full materials & stitch guide
 *   4) Numbered construction steps
 *   5+) Tiled pattern pieces at 1:1 scale, tiled to selected paper size
 */

import { fmtInches, offsetPolygon } from '../engine/geometry.js';
import { MEASUREMENTS } from '../engine/measurements.js';

// ── Paper size registry ────────────────────────────────────────────────────
const PAPER_SIZES = {
  letter:  { w: 8.5,  h: 11,    label: 'US Letter' },
  a4:      { w: 8.27, h: 11.69, label: 'A4'        },
  tabloid: { w: 11,   h: 17,    label: 'Tabloid'   },
  a0:      { w: 33.1, h: 46.8,  label: 'A0/Plotter'},
};

const DPI    = 96;  // CSS px per inch
const px     = in_ => in_ * DPI;
const SM     = 0.4; // safe (unprintable) margin in inches — keep all content inside this boundary
const MARGIN = 1.5; // generous padding around each piece — prevents SA miter clipping on all edges

// ── Piece SVG rendering at 1:1 scale ───────────────────────────────────────

/** Convert an array of {x,y} inch points to an SVG path string, offset by (ox, oy) inches */
function polyPath(pts, ox, oy) {
  let d = `M ${(ox + pts[0].x) * DPI} ${(oy + pts[0].y) * DPI}`;
  for (let i = 1; i < pts.length; i++) {
    d += ` L ${(ox + pts[i].x) * DPI} ${(oy + pts[i].y) * DPI}`;
  }
  return d + ' Z';
}

/**
 * Render a panel piece (front/back) as a full-size SVG string.
 * Returns { svg, wIn, hIn } — dimensions in inches.
 */
function renderPanelSVG(piece) {
  const { polygon, saPolygon, width, height, rise, ext,
          sa, hem, name, instruction, darts = [], notches = [] } = piece;

  const mL = ext + MARGIN;
  const mT = MARGIN;
  const mR = (sa || 0.5) + MARGIN;  // SA extends `sa` past width — MARGIN ensures no clip
  const mB = MARGIN;

  const wIn = mL + width + mR;
  const hIn = mT + height + mB;

  const ox = mL;
  const oy = mT;

  const cutPath = polyPath(saPolygon, ox, oy);
  const sewPath = polyPath(polygon,   ox, oy);

  const cY  = (oy + rise) * DPI;
  const cX1 = (ox - ext - 0.3) * DPI;
  const cX2 = (ox + width + 0.2) * DPI;

  const gx  = (ox + width * 0.42) * DPI;
  const gy1 = (oy + 1.8) * DPI;
  const gy2 = (oy + height - 1.8) * DPI;

  const titleX = (ox + width / 2) * DPI;
  const titleY = (mT - 0.12) * DPI;
  const subY   = (oy - 0.02) * DPI;
  const noteY  = (oy + height + mB - 0.08) * DPI;

  return {
    wIn,
    hIn,
    svg: `<svg xmlns="http://www.w3.org/2000/svg"
        width="${wIn * DPI}" height="${hIn * DPI}"
        viewBox="0 0 ${wIn * DPI} ${hIn * DPI}">
      <path d="${cutPath}" stroke="#000" stroke-width="1.5" fill="none"/>
      <path d="${sewPath}" stroke="#666" stroke-width="0.8" stroke-dasharray="4,3" fill="none"/>
      <line x1="${cX1}" y1="${cY}" x2="${cX2}" y2="${cY}"
        stroke="#d0ccc4" stroke-width="0.8" stroke-dasharray="12,7"/>
      <line x1="${gx}" y1="${gy1 + 7}" x2="${gx}" y2="${gy2 - 7}"
        stroke="#2c2a26" stroke-width="0.8" stroke-dasharray="18,9"/>
      <polygon points="${gx},${gy1} ${gx - 4},${gy1 + 7} ${gx + 4},${gy1 + 7}"
        fill="#2c2a26"/>
      <polygon points="${gx},${gy2} ${gx - 4},${gy2 - 7} ${gx + 4},${gy2 - 7}"
        fill="#2c2a26"/>
      <text x="${gx}" y="${(gy1 + gy2) / 2 - 5}"
        font-family="'IBM Plex Mono',monospace" font-size="8" fill="#2c2a26"
        text-anchor="middle">GRAIN</text>
      <text x="${titleX}" y="${titleY}"
        font-family="'IBM Plex Mono',monospace" font-size="14" font-weight="700"
        fill="#2c2a26" text-anchor="middle">${name} \xd7 2 (mirror)</text>
      <text x="${titleX}" y="${subY}"
        font-family="'IBM Plex Mono',monospace" font-size="12"
        fill="#666" text-anchor="middle">${instruction}</text>
      ${darts.map(d => {
        const dx = (ox + d.x) * DPI;
        const dy1 = oy * DPI;
        const dy2 = (oy + d.length) * DPI;
        const halfW = (d.intake / 2) * DPI;
        return `<line x1="${dx - halfW}" y1="${dy1}" x2="${dx}" y2="${dy2}" stroke="#b8963e" stroke-width="0.8" stroke-dasharray="4,3"/>
        <line x1="${dx + halfW}" y1="${dy1}" x2="${dx}" y2="${dy2}" stroke="#b8963e" stroke-width="0.8" stroke-dasharray="4,3"/>
        <text x="${dx}" y="${dy2 + 12}" font-family="'IBM Plex Mono',monospace" font-size="8" fill="#b8963e" text-anchor="middle">dart</text>`;
      }).join('\n')}
      ${notches.map(n => {
        const nx = (ox + n.x) * DPI, ny = (oy + n.y) * DPI;
        const rad = (n.angle || 0) * Math.PI / 180;
        const h = 0.25 * DPI, w = 0.1 * DPI;
        const tx = nx + Math.cos(rad) * h, ty = ny + Math.sin(rad) * h;
        const bx1 = nx + Math.cos(rad + Math.PI/2) * w, by1 = ny + Math.sin(rad + Math.PI/2) * w;
        const bx2 = nx + Math.cos(rad - Math.PI/2) * w, by2 = ny + Math.sin(rad - Math.PI/2) * w;
        return `<polygon points="${bx1.toFixed(1)},${by1.toFixed(1)} ${tx.toFixed(1)},${ty.toFixed(1)} ${bx2.toFixed(1)},${by2.toFixed(1)}" fill="#2c2a26"/>`;
      }).join('\n')}
      <text x="${(ox - ext) * DPI}" y="${noteY}"
        font-family="'IBM Plex Mono',monospace" font-size="10" fill="#4a8a5a">
        ${fmtInches(sa)} SA all seams incl. waist \xb7 ${fmtInches(hem)} hem
      </text>
    </svg>`,
  };
}

/**
 * Render a bodice or sleeve piece as a full-size SVG string.
 * Returns { svg, wIn, hIn }.
 */
function renderBodiceOrSleeveSVG(piece) {
  const { polygon, sa = 0.5, hem = 0.75, name, type, notches = [] } = piece;

  const xs = polygon.map(p => p.x), ys = polygon.map(p => p.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const pW = maxX - minX, pH = maxY - minY;

  const mL = MARGIN, mT = MARGIN, mR = MARGIN, mB = MARGIN;
  const wIn = mL + pW + mR;
  const hIn = mT + pH + mB;

  const ox = mL - minX;
  const oy = mT - minY;

  // Compute SA outline using shared offsetPolygon (fold-edge = 0 offset)
  const cutOnFold = type !== 'sleeve' && piece.isCutOnFold !== false;
  const ea = piece.edgeAllowances;
  const saPoints = offsetPolygon(polygon, i => {
    if (ea && ea[i]) return -ea[i].sa;
    const a = polygon[i], b = polygon[(i + 1) % polygon.length];
    if (cutOnFold && Math.abs(a.x - minX) < 0.01 && Math.abs(b.x - minX) < 0.01) return 0;
    return -sa;
  });

  function pts2path(pts) {
    let d = `M ${(ox + pts[0].x) * DPI} ${(oy + pts[0].y) * DPI}`;
    for (let i = 1; i < pts.length; i++) d += ` L ${(ox + pts[i].x) * DPI} ${(oy + pts[i].y) * DPI}`;
    return d + ' Z';
  }

  const cutPath = pts2path(saPoints);
  const sewPath = pts2path(polygon);

  const gx  = (ox + (minX + maxX) / 2) * DPI;
  const gy1 = (oy + minY + pH * 0.2)   * DPI;
  const gy2 = (oy + minY + pH * 0.8)   * DPI;

  const titleX = (ox + (minX + maxX) / 2) * DPI;
  const titleY = (mT - 0.12) * DPI;
  const noteY  = (oy + maxY + mB - 0.08) * DPI;

  const pieceLabel = type === 'sleeve'
    ? `${name} \xd7 2 (mirror)`
    : cutOnFold
      ? `${name} (cut on fold)`
      : `${name} \xd7 2 (mirror)`;

  return {
    wIn,
    hIn,
    svg: `<svg xmlns="http://www.w3.org/2000/svg"
        width="${wIn * DPI}" height="${hIn * DPI}"
        viewBox="0 0 ${wIn * DPI} ${hIn * DPI}">
      <path d="${cutPath}" stroke="#000" stroke-width="1.5" fill="none"/>
      <path d="${sewPath}" stroke="#666" stroke-width="0.8" stroke-dasharray="4,3" fill="none"/>
      ${cutOnFold ? `
      <line x1="${(ox + minX) * DPI}" y1="${gy1}" x2="${(ox + minX) * DPI}" y2="${gy2}"
        stroke="#b8963e" stroke-width="0.8" stroke-dasharray="4,3"/>
      ${(() => { const fx = (ox + minX) * DPI, aw = 5, ah = 3;
        const count = Math.max(2, Math.min(5, Math.floor((gy2 - gy1) / 30)));
        const inset = (gy2 - gy1) * 0.15;
        let arrows = '';
        for (let i = 0; i < count; i++) {
          const ay = gy1 + inset + (gy2 - gy1 - 2 * inset) * i / (count - 1);
          arrows += '<polygon points="' + (fx + 10 - aw) + ',' + ay + ' ' + (fx + 10) + ',' + (ay - ah) + ' ' + (fx + 10) + ',' + (ay + ah) + '" fill="#b8963e"/>';
        }
        const my = (gy1 + gy2) / 2;
        arrows += '<text x="' + (fx + 6) + '" y="' + my + '" font-family="IBM Plex Mono,monospace" font-size="9" fill="#b8963e" text-anchor="middle" letter-spacing="2" transform="rotate(-90,' + (fx + 6) + ',' + my + ')">PLACE ON FOLD</text>';
        return arrows;
      })()}
      ` : `
      <line x1="${gx}" y1="${gy1 + 7}" x2="${gx}" y2="${gy2 - 7}"
        stroke="#2c2a26" stroke-width="0.8" stroke-dasharray="18,9"/>
      <polygon points="${gx},${gy1} ${gx - 4},${gy1 + 7} ${gx + 4},${gy1 + 7}"
        fill="#2c2a26"/>
      <polygon points="${gx},${gy2} ${gx - 4},${gy2 - 7} ${gx + 4},${gy2 - 7}"
        fill="#2c2a26"/>
      <text x="${gx}" y="${(gy1 + gy2) / 2 - 5}"
        font-family="'IBM Plex Mono',monospace" font-size="8" fill="#2c2a26"
        text-anchor="middle">GRAIN</text>
      `}
      <text x="${titleX}" y="${titleY}"
        font-family="'IBM Plex Mono',monospace" font-size="14" font-weight="700"
        fill="#2c2a26" text-anchor="middle">${pieceLabel}</text>
      ${notches.map(n => {
        const nx = (ox + n.x) * DPI, ny = (oy + n.y) * DPI;
        const rad = (n.angle || 0) * Math.PI / 180;
        const h = 0.25 * DPI, w = 0.1 * DPI;
        const tx = nx + Math.cos(rad) * h, ty = ny + Math.sin(rad) * h;
        const bx1 = nx + Math.cos(rad + Math.PI/2) * w, by1 = ny + Math.sin(rad + Math.PI/2) * w;
        const bx2 = nx + Math.cos(rad - Math.PI/2) * w, by2 = ny + Math.sin(rad - Math.PI/2) * w;
        return `<polygon points="${bx1.toFixed(1)},${by1.toFixed(1)} ${tx.toFixed(1)},${ty.toFixed(1)} ${bx2.toFixed(1)},${by2.toFixed(1)}" fill="#2c2a26"/>`;
      }).join('\n')}
      ${(piece.bustDarts || []).map(d => {
        const ax = (ox + d.apexX) * DPI, ay = (oy + d.apexY) * DPI;
        const ux = (ox + d.sideX) * DPI, uy = (oy + d.upperY) * DPI;
        const lx = (ox + d.sideX) * DPI, ly = (oy + d.lowerY) * DPI;
        return `<line x1="${ux.toFixed(1)}" y1="${uy.toFixed(1)}" x2="${ax.toFixed(1)}" y2="${ay.toFixed(1)}" stroke="#b8963e" stroke-width="0.8" stroke-dasharray="4,3"/>
        <line x1="${lx.toFixed(1)}" y1="${ly.toFixed(1)}" x2="${ax.toFixed(1)}" y2="${ay.toFixed(1)}" stroke="#b8963e" stroke-width="0.8" stroke-dasharray="4,3"/>
        <text x="${(ax - 10).toFixed(1)}" y="${(ay - 5).toFixed(1)}" font-family="'IBM Plex Mono',monospace" font-size="8" fill="#b8963e" text-anchor="middle">dart</text>`;
      }).join('\n')}
      <text x="${titleX}" y="${noteY}"
        font-family="'IBM Plex Mono',monospace" font-size="10" fill="#4a8a5a"
        text-anchor="middle">${fmtInches(sa)} SA \xb7 ${fmtInches(hem)} hem</text>
    </svg>`,
  };
}

/**
 * Render a rectangle piece at 1:1.
 * Returns { svg, wIn, hIn }.
 */
function renderRectSVG(piece) {
  const { name, dimensions, sa } = piece;
  const W = dimensions.length;
  const H = dimensions.width;

  const mL = MARGIN, mT = MARGIN, mR = MARGIN, mB = MARGIN;
  const wIn = mL + W + mR;
  const hIn = mT + H + mB;

  const rx = mL * DPI, ry = mT * DPI;
  const rW = W * DPI,  rH = H * DPI;
  const saOff = (sa || 0.625) * DPI;
  const cx = (mL + W / 2) * DPI;
  const cy = (mT + H / 2) * DPI;

  return {
    wIn,
    hIn,
    svg: `<svg xmlns="http://www.w3.org/2000/svg"
        width="${wIn * DPI}" height="${hIn * DPI}"
        viewBox="0 0 ${wIn * DPI} ${hIn * DPI}">
      <rect x="${rx - saOff}" y="${ry - saOff}"
        width="${rW + saOff * 2}" height="${rH + saOff * 2}"
        stroke="#000" stroke-width="1.5" fill="none"/>
      <rect x="${rx}" y="${ry}" width="${rW}" height="${rH}"
        stroke="#666" stroke-width="0.8" stroke-dasharray="4,3" fill="none"/>
      <line x1="${cx}" y1="${ry}" x2="${cx}" y2="${ry + rH}"
        stroke="#d0ccc4" stroke-width="0.6" stroke-dasharray="8,6"/>
      <line x1="${rx}" y1="${cy}" x2="${rx + rW}" y2="${cy}"
        stroke="#d0ccc4" stroke-width="0.6" stroke-dasharray="8,6"/>
      <text x="${cx}" y="${(mT - 0.12) * DPI}"
        font-family="'IBM Plex Mono',monospace" font-size="14" font-weight="700"
        fill="#2c2a26" text-anchor="middle">${name}</text>
      <text x="${cx}" y="${cy}"
        font-family="'IBM Plex Mono',monospace" font-size="12"
        fill="#888" text-anchor="middle">${fmtInches(W)} \xd7 ${fmtInches(H)}</text>
    </svg>`,
  };
}

/**
 * Render a pocket piece at 1:1.
 * Returns { svg, wIn, hIn }.
 */
function renderPocketSVG(piece) {
  const { name, dimensions } = piece;
  // Pocket bags use { width, height }; strip pieces (collar, facing, tie) use { length, width }
  const W = dimensions.length ?? dimensions.width;
  const H = dimensions.height  ?? dimensions.width;

  const mL = MARGIN, mT = MARGIN, mR = MARGIN, mB = MARGIN;
  const wIn = mL + W + mR;
  const hIn = mT + H + mB;

  const rx = mL * DPI, ry = mT * DPI;
  const rW = W * DPI,  rH = H * DPI;
  const cx = (mL + W / 2) * DPI;

  return {
    wIn,
    hIn,
    svg: `<svg xmlns="http://www.w3.org/2000/svg"
        width="${wIn * DPI}" height="${hIn * DPI}"
        viewBox="0 0 ${wIn * DPI} ${hIn * DPI}">
      <rect x="${rx}" y="${ry}" width="${rW}" height="${rH}"
        stroke="#2c2a26" stroke-width="2" fill="none"/>
      <text x="${cx}" y="${(mT - 0.12) * DPI}"
        font-family="'IBM Plex Mono',monospace" font-size="14" font-weight="700"
        fill="#2c2a26" text-anchor="middle">${name}</text>
      <text x="${cx}" y="${(mT + H / 2) * DPI}"
        font-family="'IBM Plex Mono',monospace" font-size="12"
        fill="#888" text-anchor="middle">${fmtInches(W)} \xd7 ${fmtInches(H)}</text>
    </svg>`,
  };
}

// ── Registration crosshair ─────────────────────────────────────────────────

function crosshair(x, y, size = 14, label = '', alignLabel = false) {
  const lbl = label
    ? `<text x="${x + size + 3}" y="${y - size - 2}"
        font-family="'IBM Plex Mono',monospace" font-size="7" font-weight="700"
        fill="#000">${label}</text>`
    : '';
  const aLbl = alignLabel
    ? `<text x="${x + size + 3}" y="${y + size + 10}"
        font-family="'IBM Plex Mono',monospace" font-size="6.5"
        fill="#444">+ align here</text>`
    : '';
  return `<line x1="${x - size}" y1="${y}" x2="${x + size}" y2="${y}"
      stroke="#000" stroke-width="0.6"/>
    <line x1="${x}" y1="${y - size}" x2="${x}" y2="${y + size}"
      stroke="#000" stroke-width="0.6"/>
    <circle cx="${x}" cy="${y}" r="4" fill="none" stroke="#000" stroke-width="0.6"/>
    ${lbl}${aLbl}`;
}

// ── Overlap zone: scissors cut line at OUTER edge ─────────────────────────
// Outer edge = page-side boundary of the overlap zone (where user cuts)
// Inner edge = pattern-side boundary = SM+OV (where crosshairs sit for alignment)

function overlapZoneSVG(direction, tPW, tPH, SM, OV) {
  let shapes = '';

  if (direction === 'left') {
    const cx    = px(SM);             // outer (page-side) cut line — solid
    const yS    = px(SM), yE = px(tPH - SM);
    const midY  = (yS + yE) / 2;

    // Solid cut line at outer edge
    shapes += `<line x1="${cx}" y1="${yS}" x2="${cx}" y2="${yE}"
      stroke="#000" stroke-width="1.4"/>`;
    // Dashed guide through the overlap zone interior
    const dashX = cx + px(OV * 0.45);
    shapes += `<line x1="${dashX}" y1="${yS}" x2="${dashX}" y2="${yE}"
      stroke="#555" stroke-width="0.5" stroke-dasharray="4,5" opacity="0.5"/>`;
    // ✂ scissors icon at top of cut line
    shapes += `<text x="${cx}" y="${yS + 16}"
      font-family="serif" font-size="13" fill="#000"
      text-anchor="middle">\u2702</text>`;
    // "cut here" label rotated along line
    shapes += `<text
      font-family="'IBM Plex Mono',monospace" font-size="6.5" fill="#000"
      text-anchor="middle"
      transform="rotate(-90,${cx - 11},${midY})">cut here</text>`;
  } else {
    const cy    = px(SM);             // outer (page-side) cut line — solid
    const xS    = px(SM), xE = px(tPW - SM);
    const midX  = (xS + xE) / 2;

    // Solid cut line at outer edge
    shapes += `<line x1="${xS}" y1="${cy}" x2="${xE}" y2="${cy}"
      stroke="#000" stroke-width="1.4"/>`;
    // Dashed guide through the overlap zone interior
    const dashY = cy + px(OV * 0.45);
    shapes += `<line x1="${xS}" y1="${dashY}" x2="${xE}" y2="${dashY}"
      stroke="#555" stroke-width="0.5" stroke-dasharray="4,5" opacity="0.5"/>`;
    // ✂ scissors icon at left of cut line
    shapes += `<text x="${xS + 16}" y="${cy - 3}"
      font-family="serif" font-size="13" fill="#000"
      text-anchor="middle">\u2702</text>`;
    // "cut here" label
    shapes += `<text x="${midX}" y="${cy - 4}"
      font-family="'IBM Plex Mono',monospace" font-size="6.5" fill="#000"
      text-anchor="middle">cut here</text>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg"
      style="position:absolute;top:0;left:0;width:${tPW}in;height:${tPH}in;
             pointer-events:none;z-index:5;overflow:visible">
    ${shapes}
  </svg>`;
}

// ── 1-inch ruler hash strip ────────────────────────────────────────────────

function rulerStrip(tPW, SM) {
  // Placed at the BOTTOM margin — ticks grow upward, labels above ticks.
  // bottom:0 positions the SVG flush with the page bottom edge.
  const rY  = px(SM * 0.65);  // baseline near bottom of the strip (ticks go up)
  const x0  = px(SM);
  const x1  = px(tPW - SM);
  const totalIn = tPW - 2 * SM;
  let marks = `<line x1="${x0}" y1="${rY}" x2="${x1}" y2="${rY}" stroke="#000" stroke-width="0.4"/>`;
  const steps = Math.round(totalIn / 0.25);
  for (let i = 0; i <= steps; i++) {
    const x = x0 + px(i * 0.25);
    if (x > x1 + 1) break;
    const isIn = i % 4 === 0, isHalf = i % 2 === 0;
    const h = isIn ? 8 : isHalf ? 5 : 3;
    marks += `<line x1="${x}" y1="${rY - h}" x2="${x}" y2="${rY}" stroke="#000" stroke-width="${isIn ? 0.7 : 0.4}"/>`;
    if (isIn && i > 0) {
      marks += `<text x="${x}" y="${rY - h - 2}"
        font-family="'IBM Plex Mono',monospace" font-size="6" text-anchor="middle"
        dominant-baseline="auto" fill="#000">${i / 4}"</text>`;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg"
    style="position:absolute;bottom:0;left:0;width:${tPW}in;height:${SM}in;
           pointer-events:none;z-index:11;overflow:visible">
    ${marks}
  </svg>`;
}

// ── Tile layout helper (orientation + seam avoidance) ─────────────────────

function computeTileLayout(wIn, hIn, piece, PW, PH, OV) {
  const TX_p = PW - 2 * SM - OV, TY_p = PH - 2 * SM - OV;
  const TX_l = PH - 2 * SM - OV, TY_l = PW - 2 * SM - OV;
  const pages_p = Math.ceil(wIn / TX_p) * Math.ceil(hIn / TY_p);
  const pages_l = Math.ceil(wIn / TX_l) * Math.ceil(hIn / TY_l);
  // Panel pieces (pants, shorts) are always taller than wide — force portrait so
  // tiles cover more of the long dimension per row and assembly is intuitive.
  const landscape = piece.type !== 'panel' && pages_l < pages_p;
  const tPW = landscape ? PH : PW;
  const tPH = landscape ? PW : PH;
  const TX  = landscape ? TX_l : TX_p;
  const TY  = landscape ? TY_l : TY_p;

  // Seam avoidance: fold line and right cut edge must not land within 0.1″ of a tile seam
  const foldEdge  = piece.type === 'panel' ? (piece.ext || 0) + MARGIN : MARGIN;
  const rightEdge = wIn;
  let shiftX = 0;
  for (let c = 1; c <= Math.ceil(wIn / TX) + 1; c++) {
    const seam = c * TX;
    for (const edge of [foldEdge, rightEdge]) {
      if (Math.abs(edge - seam) < 0.1 || Math.abs(edge - (seam - OV)) < 0.1) {
        shiftX = Math.max(shiftX, 0.25);
      }
    }
  }

  const effectiveW = wIn + shiftX;
  const cols = Math.ceil(effectiveW / TX);
  const rows = Math.ceil(hIn / TY);
  return { landscape, tPW, tPH, TX, TY, cols, rows, shiftX, effectiveW };
}

// ── Piece renderer dispatch ────────────────────────────────────────────────

/** Render any piece to { svg, wIn, hIn }. Returns null for unknown types. */
function renderPiece(piece) {
  if      (piece.type === 'panel')                              return renderPanelSVG(piece);
  else if (piece.type === 'bodice' || piece.type === 'sleeve')  return renderBodiceOrSleeveSVG(piece);
  else if (piece.type === 'rectangle')                          return renderRectSVG(piece);
  else if (piece.type === 'pocket')                             return renderPocketSVG(piece);
  return null;
}

// ── Tile page builder ──────────────────────────────────────────────────────

function buildTilePages(piece, pieceIdx, totalPieces, PW, PH, OV) {
  const rendered = renderPiece(piece);
  if (!rendered) return '';

  const { svg, wIn, hIn } = rendered;

  // Fix 3: choose orientation, Fix 2: seam avoidance
  const layout = computeTileLayout(wIn, hIn, piece, PW, PH, OV);
  const { landscape, tPW, tPH, TX, TY, cols, rows, shiftX, effectiveW } = layout;

  let pages = '';

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Compute base tile offsets (negative = scroll piece into view)
      let offsetX = -(col * TX * DPI) + shiftX * DPI;
      let offsetY = -(row * TY * DPI);

      // Center small pieces that fit on a single tile (looks more professional)
      if (cols === 1 && rows === 1) {
        const contentW = (tPW - 2 * SM) * DPI;
        const contentH = (tPH - 2 * SM) * DPI;
        offsetX = Math.max(0, Math.round((contentW - effectiveW * DPI) / 2));
        offsetY = Math.max(0, Math.round((contentH - hIn * DPI) / 2));
      }

      // Fix 4: B&W overlap zone markers (triangles + trim line)
      let overlapSvgs = '';
      if (col > 0) overlapSvgs += overlapZoneSVG('left', tPW, tPH, SM, OV);
      if (row > 0) overlapSvgs += overlapZoneSVG('top',  tPW, tPH, SM, OV);

      // Crosshairs sit at the INNER edge of each overlap zone (SM+OV from the overlap side).
      // This is what users align after cutting at the outer scissors line.
      // Non-overlap edges keep crosshairs at the outer corner (SM from edge).
      const rA   = String.fromCharCode(65 + row);
      const rB   = String.fromCharCode(65 + row + 1);
      const ovX  = px(SM + OV);  // inner left edge (after cutting left overlap)
      const ovY  = px(SM + OV);  // inner top edge  (after cutting top overlap)
      const tlX  = col > 0 ? ovX : px(SM);
      const tlY  = row > 0 ? ovY : px(SM);
      const trY  = row > 0 ? ovY : px(SM);
      const blX  = col > 0 ? ovX : px(SM);
      const chSVG = `<svg xmlns="http://www.w3.org/2000/svg"
          style="position:absolute;top:0;left:0;width:${tPW}in;height:${tPH}in;
                 pointer-events:none;z-index:10;overflow:visible">
        ${crosshair(tlX,           tlY,           14, `${rA}${col}`,     col > 0 || row > 0)}
        ${crosshair(px(tPW - SM),  trY,           14, `${rA}${col + 1}`, row > 0           )}
        ${crosshair(blX,           px(tPH - SM),  14, `${rB}${col}`,     col > 0           )}
        ${crosshair(px(tPW - SM),  px(tPH - SM),  14, `${rB}${col + 1}`, false             )}
      </svg>`;

      // Fix 5: 1-inch ruler hash strip along top margin
      const ruler = rulerStrip(tPW, SM);

      const tileId    = `${row + 1}-${col + 1}`;
      const gridLabel = `${rows}\xd7${cols}`;
      const orientTag = landscape ? ' \xb7 LANDSCAPE' : '';
      const orientCls = landscape ? ' landscape-tile' : '';

      pages += `<div class="page tile-page${orientCls}" style="width:${tPW}in;height:${tPH}in">
        <div class="tile-clip" style="width:${tPW - 2 * SM}in;height:${tPH - 2 * SM}in">
          <div style="position:absolute;left:${offsetX}px;top:${offsetY}px;
                      width:${effectiveW * DPI}px;height:${hIn * DPI}px">
            ${svg}
          </div>
        </div>
        ${overlapSvgs}
        ${chSVG}
        ${ruler}
        <div class="tile-footer">
          <span class="tf-name">${piece.name} \u2014 tile ${tileId} of ${gridLabel} pages</span>
          <span class="tf-brand">People\u2019s Patterns \xb7 peoplespatterns.com \xb7 @peoplespatterns</span>
          <span class="tf-info">piece ${pieceIdx + 1}/${totalPieces} \xb7 row ${row + 1} col ${col + 1}${orientTag} \xb7 \xbe\u2033 overlap</span>
        </div>
      </div>`;
    }
  }

  return pages;
}

// ── Nested small-piece packer (large format only) ──────────────────────────

/**
 * Pack single-tile pieces onto shared A0 sheets using shelf packing.
 * Pieces are placed left-to-right; a new shelf starts when the row fills;
 * a new sheet starts when the page fills.
 */
function buildNestedSmallPages(smallPieces, PW, PH) {
  if (smallPieces.length === 0) return '';
  const availW = PW - 2 * SM;
  const availH = PH - 2 * SM - 0.4; // reserve bottom strip for footer
  const GAP = 0.3; // gap between pieces in inches

  const pages = [];
  let current = [], shelfX = 0, shelfY = 0, shelfH = 0;

  for (const { rendered, piece } of smallPieces) {
    const { svg, wIn, hIn } = rendered;

    if (shelfX > 0 && shelfX + wIn > availW) {
      // row full — next shelf
      shelfY += shelfH + GAP;
      shelfX = 0; shelfH = 0;
    }
    if (shelfY + hIn > availH) {
      // page full — flush and start a new sheet
      if (current.length) pages.push(current);
      current = []; shelfX = 0; shelfY = 0; shelfH = 0;
    }

    current.push({ svg, wIn, hIn, x: shelfX, y: shelfY, piece });
    shelfX += wIn + GAP;
    shelfH = Math.max(shelfH, hIn);
  }
  if (current.length) pages.push(current);

  return pages.map((items, pi) => {
    const divs = items.map(({ svg, wIn, hIn, x, y }) =>
      `<div style="position:absolute;left:${x * DPI}px;top:${y * DPI}px;
                   width:${wIn * DPI}px;height:${hIn * DPI}px">${svg}</div>`
    ).join('');
    const names = items.map(i => i.piece.name).join(' \xb7 ');
    const sheetLabel = pages.length > 1 ? ` \u2014 sheet ${pi + 1} of ${pages.length}` : '';
    return `<div class="page tile-page" style="width:${PW}in;height:${PH}in">
      <div class="tile-clip" style="width:${availW}in;height:${availH}in">
        ${divs}
      </div>
      <div class="tile-footer">
        <span class="tf-name">Small Pieces${sheetLabel}</span>
        <span class="tf-brand">People\u2019s Patterns \xb7 peoplespatterns.com \xb7 @peoplespatterns</span>
        <span class="tf-info">${names}</span>
      </div>
    </div>`;
  }).join('');
}

// ── Tile map (page 2 overview) ─────────────────────────────────────────────

function buildTileMapSVG(pieces, PW, PH, OV) {
  const CELL_W = 44, CELL_H = 18, GAP = 5, PAD = 10;
  const SVG_W = 460;
  const COL_GAP = 40;

  // Escape XML special chars so piece names never bleed into surrounding markup
  const xmlEsc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // Resolve piece dimensions (returns null to skip)
  function pieceDims(piece) {
    if (piece.type === 'panel') {
      const sa = piece.sa || 0.5;
      return { wIn: (piece.ext || 0) + MARGIN + piece.width + sa + MARGIN, hIn: MARGIN + piece.height + MARGIN };
    }
    if (piece.type === 'bodice' || piece.type === 'sleeve') {
      const xs = piece.polygon.map(p => p.x), ys = piece.polygon.map(p => p.y);
      return { wIn: MARGIN + (Math.max(...xs) - Math.min(...xs)) + MARGIN, hIn: MARGIN + (Math.max(...ys) - Math.min(...ys)) + MARGIN };
    }
    if (piece.type === 'rectangle') {
      return { wIn: MARGIN + piece.dimensions.length + MARGIN, hIn: MARGIN + piece.dimensions.width + MARGIN };
    }
    if (piece.dimensions) {
      const d = piece.dimensions;
      return { wIn: MARGIN + (d.length ?? d.width) + MARGIN, hIn: MARGIN + (d.height ?? d.width) + MARGIN };
    }
    return null;
  }

  // Filter pieces that have renderable dimensions
  const valid = pieces.filter(p => pieceDims(p) !== null);
  const n = valid.length;

  // Column count: 1 for ≤3 pieces, 2 for 4-6, 3 for 7+
  const numCols = n >= 7 ? 3 : n >= 4 ? 2 : 1;
  const perCol = Math.ceil(n / numCols);
  const colW = (SVG_W - PAD * 2 - COL_GAP * (numCols - 1)) / numCols;

  let items = '';
  let maxH = 0;

  for (let ci = 0; ci < numCols; ci++) {
    const col = valid.slice(ci * perCol, (ci + 1) * perCol);
    const xOff = PAD + ci * (colW + COL_GAP);
    let y = PAD;

    for (const piece of col) {
      const { wIn, hIn } = pieceDims(piece);
      const layout = computeTileLayout(wIn, hIn, piece, PW, PH, OV);
      const { landscape, cols, rows } = layout;
      const total = rows * cols;
      const orientNote = landscape ? ' \xb7 L' : '';
      const countLabel = `${rows}\xd7${cols} = ${total} page${total !== 1 ? 's' : ''}${orientNote}`;

      // Piece name — each on its own element, explicitly terminated, XML-escaped
      items += `\n<text x="${xOff}" y="${y + 12}" font-family="'IBM Plex Mono',monospace" font-size="10" font-weight="600" fill="#2c2a26">${xmlEsc(piece.name)}</text>`;
      // Count label — separate element at different x
      items += `\n<text x="${xOff + cols * (CELL_W + GAP) + 8}" y="${y + 12}" font-family="'IBM Plex Mono',monospace" font-size="9" fill="#999">${countLabel}</text>`;

      y += 18;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cx = xOff + c * (CELL_W + GAP);
          const cy = y + r * (CELL_H + GAP);
          const fill = landscape
            ? ((r + c) % 2 === 0 ? '#e8f0f8' : '#dce8f4')
            : ((r + c) % 2 === 0 ? '#f0eeea' : '#e8e4dd');
          items += `\n<rect x="${cx}" y="${cy}" width="${CELL_W}" height="${CELL_H}" rx="2" fill="${fill}" stroke="#bbb" stroke-width="0.7"/>`;
          items += `\n<text x="${cx + CELL_W / 2}" y="${cy + 12}" font-family="'IBM Plex Mono',monospace" font-size="8" fill="#666" text-anchor="middle">${r + 1}-${c + 1}</text>`;
        }
      }

      y += rows * (CELL_H + GAP) + 14;
    }

    maxH = Math.max(maxH, y);
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SVG_W}" height="${maxH + PAD}" style="display:block">${items}\n</svg>`;
}

// ── Individual page builders ───────────────────────────────────────────────

function buildCoverPage(garment, measurements, opts) {
  const measRows = garment.measurements.map(id => {
    const def = MEASUREMENTS[id];
    return `<tr><td>${def ? def.label : id}</td><td>${fmtInches(measurements[id])}</td></tr>`;
  }).join('');

  const optRows = Object.entries(opts).map(([k, v]) => {
    const label = k.replace(/([A-Z])/g, ' $1').trim();
    return `<tr><td>${label}</td><td>${v}</td></tr>`;
  }).join('');

  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return `<div class="page cover-page">
    <div class="cover-body">
      <div class="cover-brand">People\u2019s Patterns</div>
      <div class="cover-title">${garment.name}</div>
      <div class="cover-sub">Sewing Pattern \u2014 Print at 100% \xb7 Do not scale to fit</div>
      <div class="cover-cols">
        <div class="cover-col">
          <h3 class="sect-head">Body Measurements</h3>
          <table class="ptable">
            <thead><tr><th>Measurement</th><th>Value</th></tr></thead>
            <tbody>${measRows}</tbody>
          </table>
        </div>
        <div class="cover-col">
          <h3 class="sect-head">Pattern Options</h3>
          <table class="ptable">
            <thead><tr><th>Option</th><th>Setting</th></tr></thead>
            <tbody>${optRows}</tbody>
          </table>
        </div>
      </div>
      <div class="cover-how">
        <h3 class="sect-head">How to Assemble</h3>
        <ol>
          <li>Print at <strong>100% scale</strong> \u2014 never \u201cfit to page\u201d or \u201cshrink to margins\u201d</li>
          <li>Verify the 2\xd72 inch and 5\xd75 cm squares on page 2 measure exactly right</li>
          <li>Assemble in the order shown on the tile map (page 2)</li>
          <li>Cut along the \u2702 scissors line at the left/top edge of each overlap tile \u2014 this removes the shaded overlap strip</li>
          <li>Align the \u2295 crosshairs on the trimmed tile with the matching crosshairs on the adjacent tile \u2014 matching letters (e.g.\u202fA1\u202f\u2192\u202fA1) confirm correct placement</li>
          <li>Tape from the back. Check the 1\u2033 ruler strip to confirm scale before taping</li>
        </ol>
      </div>
    </div>
    <div class="cover-foot">Drafted ${date} \xb7 People\u2019s Patterns \xb7 peoplespatterns.com \xb7 @peoplespatterns</div>
  </div>`;
}

function buildScalePage(pieces, PW, PH, OV) {
  const sq2px = px(2);
  const sq5px = (5 / 2.54) * DPI;

  function scaleSVG(size, label) {
    return `<div class="sq-item">
      <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"
          viewBox="0 0 ${size} ${size}" style="display:block">
        <rect x="1" y="1" width="${size - 2}" height="${size - 2}"
          fill="none" stroke="#2c2a26" stroke-width="1.5"/>
        <line x1="${size / 2}" y1="1" x2="${size / 2}" y2="${size - 1}"
          stroke="#ccc" stroke-width="0.7"/>
        <line x1="1" y1="${size / 2}" x2="${size - 1}" y2="${size / 2}"
          stroke="#ccc" stroke-width="0.7"/>
      </svg>
      <div class="sq-label">${label}</div>
    </div>`;
  }

  return `<div class="page scale-page">
    <h2 class="page-head">Scale Verification &amp; Tile Map</h2>
    <p class="print-note">Print at 100% scale. Do not select fit-to-page or shrink-to-fit. If your printer has a borderless printing option, you may enable it but it is not required.</p>
    <div class="scale-sect">
      <h3 class="sect-head">Print Accuracy \u2014 Measure before cutting any fabric</h3>
      <p class="note">If either square is wrong, check that your printer scale is set to 100%.</p>
      <div class="sq-row">
        ${scaleSVG(sq2px, 'Must measure exactly 2 \xd7 2 inches')}
        ${scaleSVG(sq5px, 'Must measure exactly 5 \xd7 5 cm')}
      </div>
    </div>
    <div class="map-sect">
      <h3 class="sect-head">Tile Assembly Map</h3>
      <p class="note">Each cell = one printed page. Label = row-col (e.g.\u202f2-3\u202f= row 2, col 3). Assemble left-to-right, top-to-bottom. Blue cells = landscape. \u2022 Cut along the \u2702 scissors line at each overlap edge. \u2022 Slide trimmed tile until the \u2295 crosshairs match the adjacent tile (same letter = same point). \u2022 Tape from the back.</p>
      ${buildTileMapSVG(pieces, PW, PH, OV)}
    </div>
  </div>`;
}

function buildMaterialsPage(materials) {
  const fabricRows = (materials.fabrics || []).map(f =>
    `<tr><td>${f.name}</td><td>${f.weight || ''}</td><td>${f.notes || ''}</td></tr>`
  ).join('');

  const notionRows = (materials.notions || []).map(n =>
    `<tr><td>${n.name}</td><td>${n.quantity || ''}</td><td>${n.notes || ''}</td></tr>`
  ).join('');

  const stitchRows = (materials.stitches || []).map(s =>
    `<tr><td>${s.name}</td><td>${s.length || ''}</td><td>${s.width !== '0' ? (s.width || '\u2014') : '\u2014'}</td><td>${s.use || ''}</td></tr>`
  ).join('');

  const notesHtml = materials.notes?.length
    ? `<div class="mat-notes">
        <h3 class="sect-head" style="margin-top:1em">Important Notes</h3>
        <ul>${materials.notes.map(n => `<li>${n}</li>`).join('')}</ul>
       </div>`
    : '';

  const threadHtml = materials.thread
    ? `<tr><td>Thread</td><td>${materials.thread.name || ''} ${materials.thread.weight ? '(' + materials.thread.weight + ')' : ''} \u2014 ${materials.thread.notes || ''}</td></tr>`
    : '';
  const needleHtml = materials.needle
    ? `<tr><td>Needle</td><td>${materials.needle.name || ''} \u2014 ${materials.needle.use || ''}</td></tr>`
    : '';

  return `<div class="page mat-page">
    <h2 class="page-head">Materials &amp; Stitch Guide</h2>
    <div class="two-col">
      <div>
        <h3 class="sect-head">Fabric Options</h3>
        <table class="ptable">
          <thead><tr><th>Fabric</th><th>Weight</th><th>Notes</th></tr></thead>
          <tbody>${fabricRows}</tbody>
        </table>
        <h3 class="sect-head" style="margin-top:1em">Notions</h3>
        <table class="ptable">
          <thead><tr><th>Item</th><th>Qty</th><th>Notes</th></tr></thead>
          <tbody>${notionRows}</tbody>
        </table>
        ${notesHtml}
      </div>
      <div>
        <h3 class="sect-head">Thread &amp; Needle</h3>
        <table class="ptable">
          <tbody>${threadHtml}${needleHtml}</tbody>
        </table>
        <h3 class="sect-head" style="margin-top:1em">Stitch Settings</h3>
        <table class="ptable">
          <thead><tr><th>Stitch</th><th>Length</th><th>Width</th><th>Use</th></tr></thead>
          <tbody>${stitchRows}</tbody>
        </table>
      </div>
    </div>
  </div>`;
}

function buildInstructionsPage(instructions) {
  const stepsHtml = (instructions || []).map(s =>
    `<div class="step">
      <div class="step-n">${s.step}</div>
      <div class="step-b">
        <div class="step-t">${s.title}</div>
        <div class="step-d">${s.detail}</div>
      </div>
    </div>`
  ).join('');

  return `<div class="page instr-page">
    <h2 class="page-head">Construction Order</h2>
    <p class="note" style="margin-bottom:0.2in">Read all steps before starting. Press every seam.</p>
    <div class="steps">${stepsHtml}</div>
  </div>`;
}

// ── Large-format combined preamble (A0/plotter) ────────────────────────────

/**
 * For large-format paper, collapse the 4 preamble pages (cover, scale, materials,
 * instructions) into a single sheet using a two-column layout.
 */
function buildLargeFormatPreamble(garment, pieces, materials, instructions, measurements, opts, PW, PH, OV) {
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const measRows = garment.measurements.map(id => {
    const def = MEASUREMENTS[id];
    return `<tr><td>${def ? def.label : id}</td><td>${fmtInches(measurements[id])}</td></tr>`;
  }).join('');
  const optRows = Object.entries(opts).map(([k, v]) => {
    const label = k.replace(/([A-Z])/g, ' $1').trim();
    return `<tr><td>${label}</td><td>${v}</td></tr>`;
  }).join('');
  const fabricRows = (materials.fabrics || []).map(f =>
    `<tr><td>${f.name}</td><td>${f.weight || ''}</td><td>${f.notes || ''}</td></tr>`
  ).join('');
  const notionRows = (materials.notions || []).map(n =>
    `<tr><td>${n.name}</td><td>${n.quantity || ''}</td></tr>`
  ).join('');
  const stitchRows = (materials.stitches || []).map(s =>
    `<tr><td>${s.name}</td><td>${s.length || ''}</td><td>${s.use || ''}</td></tr>`
  ).join('');
  const stepsHtml = (instructions || []).map(s =>
    `<div class="lf-step">
      <div class="lf-step-n">${s.step}</div>
      <div><div class="lf-step-t">${s.title}</div>
      <div class="lf-step-d">${s.detail}</div></div>
    </div>`
  ).join('');

  const sq2px = px(2), sq5px = (5 / 2.54) * DPI;
  function scaleSVG(size, label) {
    return `<div class="sq-item">
      <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"
          viewBox="0 0 ${size} ${size}" style="display:block">
        <rect x="1" y="1" width="${size - 2}" height="${size - 2}"
          fill="none" stroke="#2c2a26" stroke-width="1.5"/>
        <line x1="${size / 2}" y1="1" x2="${size / 2}" y2="${size - 1}"
          stroke="#ccc" stroke-width="0.7"/>
        <line x1="1" y1="${size / 2}" x2="${size - 1}" y2="${size / 2}"
          stroke="#ccc" stroke-width="0.7"/>
      </svg>
      <div style="font-size:9pt;color:#555;margin-top:6px;text-align:center">${label}</div>
    </div>`;
  }

  return `<div class="page lf-preamble" style="width:${PW}in;height:${PH}in">
    <div class="lf-header">
      <div class="lf-brand">People\u2019s Patterns</div>
      <div class="lf-garment-title">${garment.name}</div>
      <div class="lf-sub">Sewing Pattern \u2014 Print at 100% \xb7 Do not scale to fit \xb7 Drafted ${date}</div>
    </div>
    <div class="lf-body">
      <div class="lf-col">
        <h3 class="sect-head">Body Measurements</h3>
        <table class="ptable"><tbody>${measRows}</tbody></table>
        <h3 class="sect-head" style="margin-top:0.28in">Pattern Options</h3>
        <table class="ptable"><tbody>${optRows}</tbody></table>
        <h3 class="sect-head" style="margin-top:0.28in">How to Assemble</h3>
        <ol class="lf-howto">
          <li>Print at <strong>100% scale</strong> \u2014 never \u201cfit to page\u201d or \u201cshrink to margins\u201d</li>
          <li>Verify the 2\xd72 in and 5\xd75 cm squares below measure exactly right</li>
          <li>Assemble tiles in the order shown in the map at right</li>
          <li>Cut along the \u2702 scissors line at each overlap edge</li>
          <li>Align \u2295 crosshairs \u2014 matching labels (e.g.\u202fA1\u202f\u2192\u202fA1) confirm placement</li>
          <li>Tape from the back; check the 1\u2033 ruler strip before taping</li>
        </ol>
        <h3 class="sect-head" style="margin-top:0.28in">Scale Verification \u2014 Measure before cutting fabric</h3>
        <div class="sq-row" style="justify-content:flex-start;gap:0.5in;margin:0.1in 0 0">
          ${scaleSVG(sq2px, 'Must be exactly 2 \xd7 2 in')}
          ${scaleSVG(sq5px, 'Must be exactly 5 \xd7 5 cm')}
        </div>
        <h3 class="sect-head" style="margin-top:0.28in">Fabric Options</h3>
        <table class="ptable"><thead><tr><th>Fabric</th><th>Weight</th><th>Notes</th></tr></thead>
          <tbody>${fabricRows}</tbody></table>
        <h3 class="sect-head" style="margin-top:0.18in">Notions</h3>
        <table class="ptable"><thead><tr><th>Item</th><th>Qty</th></tr></thead>
          <tbody>${notionRows}</tbody></table>
        <h3 class="sect-head" style="margin-top:0.18in">Stitch Settings</h3>
        <table class="ptable"><thead><tr><th>Stitch</th><th>Length</th><th>Use</th></tr></thead>
          <tbody>${stitchRows}</tbody></table>
      </div>
      <div class="lf-col">
        <h3 class="sect-head">Tile Assembly Map</h3>
        <p class="note" style="margin-bottom:0.1in">Each cell = one printed sheet. Label = row-col. Assemble left-to-right, top-to-bottom.</p>
        ${buildTileMapSVG(pieces, PW, PH, OV)}
        <h3 class="sect-head" style="margin-top:0.3in">Construction Order</h3>
        <p class="note" style="margin-bottom:0.15in">Read all steps before starting. Press every seam.</p>
        <div class="lf-steps">${stepsHtml}</div>
      </div>
    </div>
  </div>`;
}

// ── Shared print CSS ───────────────────────────────────────────────────────

function buildCSS(PW, PH) {
  return `
* { margin:0; padding:0; box-sizing:border-box; }
body { background:#777; font-family:'IBM Plex Mono',monospace; }

@page           { size:${PW}in ${PH}in; margin:0; }
@page landscape-page { size:${PH}in ${PW}in; margin:0; }

.page {
  width:${PW}in; height:${PH}in;
  background:#fff;
  position:relative;
  overflow:hidden;
  margin:0 auto 0.35in;
  page-break-after:always;
  break-after:page;
}

/* ── Cover ── */
.cover-page { padding:0.8in 1in 0.5in; }
.cover-body { height:100%; display:flex; flex-direction:column; gap:0.28in; }
.cover-brand {
  font-family:'Fraunces',serif; font-size:11pt; font-weight:300;
  color:#aaa; letter-spacing:0.04em;
}
.cover-title {
  font-size:34pt; font-weight:700; color:#2c2a26;
  border-bottom:2px solid #2c2a26; padding-bottom:0.18in; margin-top:-0.18in;
}
.cover-sub { font-size:10pt; color:#999; }
.cover-cols { display:flex; gap:0.5in; }
.cover-col { flex:1; }
.cover-how ol { padding-left:1.2em; font-size:9.5pt; line-height:1.9; color:#444; }
.cover-how strong { color:#c44; }
.cover-foot {
  position:absolute; bottom:0.35in; left:1in;
  font-size:8pt; color:#bbb;
}

/* ── Scale page ── */
.scale-page { padding:0.5in; }
.print-note {
  font-size:8.5pt; color:#444; background:#f5f3ef;
  border:0.5px solid #d0ccc4; border-radius:3px;
  padding:0.1in 0.15in; margin-bottom:0.18in; line-height:1.5;
}
.scale-sect { margin-bottom:0.25in; }
.sq-row { display:flex; gap:0.6in; align-items:flex-start; justify-content:center; margin:0.12in 0 0; }
.sq-item { text-align:center; }
.sq-label { font-size:9pt; color:#555; margin-top:0.1in; }

/* ── Materials ── */
.mat-page { padding:0.5in; }
.two-col { display:flex; gap:0.4in; margin-top:0.1in; }
.two-col > div { flex:1; }
.mat-notes ul { padding-left:1.1em; font-size:8.5pt; line-height:1.75; color:#555; }

/* ── Instructions ── */
.instr-page { padding:0.5in; }
.steps { display:flex; flex-direction:column; gap:0.14in; }
.step { display:flex; gap:0.16in; align-items:flex-start; }
.step-n {
  font-size:20pt; font-weight:700; color:#e0ddd8;
  min-width:0.4in; text-align:right; line-height:1; padding-top:0.02in;
}
.step-b { flex:1; }
.step-t { font-size:10pt; font-weight:700; color:#2c2a26; margin-bottom:0.03in; }
.step-d { font-size:9pt; color:#555; line-height:1.55; }

/* ── Tiles ── */
.tile-page { background:#fff; }
.landscape-tile { page:landscape-page; }
.tile-clip {
  position:absolute; top:${SM}in; left:${SM}in;
  overflow:hidden;
  /* width/height overridden per-tile via inline style for landscape support */
}
.tile-footer {
  position:absolute; bottom:${SM}in; left:${SM}in; right:${SM}in;
  display:flex; justify-content:space-between; align-items:baseline;
  background:rgba(255,255,255,0.93);
  padding:1px 4px;
  border-top:0.5px solid #ddd;
  z-index:20;
}
.tf-name { font-size:8pt; font-weight:700; color:#2c2a26; }
.tf-brand { font-size:8pt; color:#888; }
.tf-info { font-size:8pt; color:#aaa; }

/* ── Shared ── */
.page-head {
  font-size:15pt; font-weight:700; color:#2c2a26;
  border-bottom:1.5px solid #2c2a26;
  padding-bottom:0.08in; margin-bottom:0.2in;
}
.sect-head {
  font-size:8pt; text-transform:uppercase; letter-spacing:0.06em;
  color:#aaa; margin-bottom:0.09in;
}
.note { font-size:9pt; color:#888; margin-bottom:0.08in; }
.ptable { width:100%; border-collapse:collapse; font-size:8.5pt; }
.ptable th {
  text-align:left; border-bottom:1px solid #ddd;
  padding:3px 5px; font-weight:600; color:#777;
}
.ptable td { border-bottom:0.5px solid #f0f0f0; padding:3px 5px; vertical-align:top; }

/* ── Large-format preamble ── */
.lf-preamble { padding:0.6in 0.7in 0.4in; }
.lf-header { border-bottom:2px solid #2c2a26; padding-bottom:0.18in; margin-bottom:0.28in; }
.lf-brand { font-family:'Fraunces',serif; font-size:11pt; font-weight:300; color:#aaa; letter-spacing:0.04em; }
.lf-garment-title { font-size:28pt; font-weight:700; color:#2c2a26; margin-top:0.06in; }
.lf-sub { font-size:9pt; color:#999; margin-top:0.04in; }
.lf-body { display:flex; gap:0.7in; }
.lf-col { flex:1; min-width:0; }
.lf-howto { padding-left:1.2em; font-size:9pt; line-height:1.85; color:#444; }
.lf-howto strong { color:#c44; }
.lf-steps { display:flex; flex-direction:column; gap:0.13in; }
.lf-step { display:flex; gap:0.15in; align-items:flex-start; }
.lf-step-n { font-size:18pt; font-weight:700; color:#e0ddd8; min-width:0.38in; text-align:right; line-height:1; padding-top:0.02in; flex-shrink:0; }
.lf-step-t { font-size:10pt; font-weight:700; color:#2c2a26; margin-bottom:0.03in; }
.lf-step-d { font-size:9pt; color:#555; line-height:1.5; }

@media print {
  body { background:#fff; }
  .page { margin:0; box-shadow:none; }
}
`;
}

// ── Main export ────────────────────────────────────────────────────────────

/**
 * Generate a complete printable HTML document string.
 *
 * @param {Object} garment      — garment module object (.name, .measurements, .id)
 * @param {Array}  pieces       — output of garment.pieces(m, opts)
 * @param {Object} materials    — output of garment.materials(m, opts)
 * @param {Array}  instructions — output of garment.instructions(m, opts)
 * @param {Object} measurements — { waist, hip, ... }
 * @param {Object} opts         — { ease, sa, ... }
 * @param {string} [paperSize]  — key from PAPER_SIZES, default 'letter'
 * @returns {string} Complete HTML document
 */
export function generatePrintLayout(garment, pieces, materials, instructions, measurements, opts, paperSize = 'letter') {
  const size = PAPER_SIZES[paperSize] || PAPER_SIZES.letter;
  const PW  = size.w;
  const PH  = size.h;
  const OV  = 0.75; // tile overlap in inches
  const isLargeFormat = PW >= 30; // A0/plotter — collapse preamble + nest small pieces

  // ── Preamble pages ──────────────────────────────────────────────────────
  const preamblePages = isLargeFormat
    ? buildLargeFormatPreamble(garment, pieces, materials, instructions, measurements, opts, PW, PH, OV)
    : buildCoverPage(garment, measurements, opts)
    + buildScalePage(pieces, PW, PH, OV)
    + buildMaterialsPage(materials)
    + buildInstructionsPage(instructions);

  // ── Pattern piece pages ─────────────────────────────────────────────────
  let tilePages;
  if (isLargeFormat) {
    // Separate pieces that fit on a single A0 sheet (small) from multi-tile (large)
    const largePieces = [], smallQueue = [];
    for (const p of pieces) {
      const rendered = renderPiece(p);
      if (!rendered) continue;
      const layout = computeTileLayout(rendered.wIn, rendered.hIn, p, PW, PH, OV);
      if (layout.cols === 1 && layout.rows === 1) {
        smallQueue.push({ rendered, piece: p });
      } else {
        largePieces.push(p);
      }
    }
    tilePages = largePieces.map((p, i) => buildTilePages(p, i, pieces.length, PW, PH, OV)).join('')
              + buildNestedSmallPages(smallQueue, PW, PH);
  } else {
    tilePages = pieces.map((p, i) => buildTilePages(p, i, pieces.length, PW, PH, OV)).join('');
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${garment.name} \u2014 Printable Pattern (${size.label})</title>
<style>${buildCSS(PW, PH)}</style>
</head>
<body>
${preamblePages}
${tilePages}
</body>
</html>`;
}
