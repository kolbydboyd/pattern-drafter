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

import { fmtInches } from '../engine/geometry.js';
import { MEASUREMENTS } from '../engine/measurements.js';

// ── Paper size registry ────────────────────────────────────────────────────
const PAPER_SIZES = {
  letter:  { w: 8.5,  h: 11,    label: 'US Letter' },
  a4:      { w: 8.27, h: 11.69, label: 'A4'        },
  tabloid: { w: 11,   h: 17,    label: 'Tabloid'   },
  a0:      { w: 33.1, h: 46.8,  label: 'A0/Plotter'},
};

const DPI = 96; // CSS px per inch
const px  = in_ => in_ * DPI;
const SM  = 0.4; // safe (unprintable) margin in inches — keep all content inside this boundary

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
          sa, hem, name, instruction } = piece;

  const mL = ext + 0.45;
  const mT = 0.55;
  const mR = 0.45;
  const mB = 0.5;

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
      <path d="${cutPath}" stroke="#4a8a5a" stroke-width="1.2"
        stroke-dasharray="8,5" fill="rgba(74,138,90,0.04)"/>
      <path d="${sewPath}" stroke="#2c2a26" stroke-width="2" fill="none"/>
      <line x1="${cX1}" y1="${cY}" x2="${cX2}" y2="${cY}"
        stroke="#d0ccc4" stroke-width="0.8" stroke-dasharray="12,7"/>
      <line x1="${gx}" y1="${gy1}" x2="${gx}" y2="${gy2}"
        stroke="#2c2a26" stroke-width="1.2" stroke-dasharray="18,9"/>
      <polygon points="${gx},${gy1 - 7} ${gx - 4},${gy1 + 7} ${gx + 4},${gy1 + 7}"
        fill="#2c2a26"/>
      <text x="${titleX}" y="${titleY}"
        font-family="'IBM Plex Mono',monospace" font-size="14" font-weight="700"
        fill="#2c2a26" text-anchor="middle">${name} \xd7 2 (mirror)</text>
      <text x="${titleX}" y="${subY}"
        font-family="'IBM Plex Mono',monospace" font-size="10"
        fill="#666" text-anchor="middle">${instruction}</text>
      <text x="${(ox - ext) * DPI}" y="${noteY}"
        font-family="'IBM Plex Mono',monospace" font-size="10" fill="#4a8a5a">
        ${fmtInches(sa)} SA all seams incl. waist \xb7 ${fmtInches(hem)} hem
      </text>
    </svg>`,
  };
}

/** Normalize a 2D vector */
function normVec(v) {
  const len = Math.hypot(v.x, v.y);
  return len < 1e-9 ? { x: 0, y: 0 } : { x: v.x / len, y: v.y / len };
}

/**
 * Render a bodice or sleeve piece as a full-size SVG string.
 * Returns { svg, wIn, hIn }.
 */
function renderBodiceOrSleeveSVG(piece) {
  const { polygon, sa = 0.5, hem = 0.75, name, type } = piece;

  const xs = polygon.map(p => p.x), ys = polygon.map(p => p.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const pW = maxX - minX, pH = maxY - minY;

  const mL = 0.45, mT = 0.55, mR = 0.45, mB = 0.5;
  const wIn = mL + pW + mR;
  const hIn = mT + pH + mB;

  const ox = mL - minX;
  const oy = mT - minY;

  // Compute SA outline with fold-edge = 0 offset (mirrors renderGenericPieceSVG logic)
  const cutOnFold = type !== 'sleeve' && piece.isCutOnFold !== false;
  const n = polygon.length;
  const saPoints = [];
  for (let i = 0; i < n; i++) {
    const prev = polygon[(i - 1 + n) % n];
    const curr = polygon[i];
    const next = polygon[(i + 1) % n];
    const eInIdx  = (i - 1 + n) % n;
    const eOutIdx = i;
    const aIn  = polygon[eInIdx],  bIn  = polygon[(eInIdx + 1) % n];
    const aOut = polygon[eOutIdx], bOut = polygon[(eOutIdx + 1) % n];
    const oIn  = (cutOnFold && Math.abs(aIn.x - minX) < 0.01 && Math.abs(bIn.x - minX) < 0.01) ? 0 : -sa;
    const oOut = (cutOnFold && Math.abs(aOut.x - minX) < 0.01 && Math.abs(bOut.x - minX) < 0.01) ? 0 : -sa;

    const nIn  = normVec({ x: -(curr.y - prev.y), y: curr.x - prev.x });
    const nOut = normVec({ x: -(next.y - curr.y), y: next.x - curr.x });

    const p1 = { x: curr.x + nIn.x  * oIn,  y: curr.y + nIn.y  * oIn  };
    const p2 = { x: curr.x + nOut.x * oOut,  y: curr.y + nOut.y * oOut };

    const d1 = { x: curr.x - prev.x, y: curr.y - prev.y };
    const d2 = { x: next.x - curr.x, y: next.y - curr.y };
    const denom = d1.x * d2.y - d1.y * d2.x;

    if (Math.abs(denom) < 1e-9) {
      saPoints.push(p1);
      if (Math.abs(oIn - oOut) >= 1e-9) saPoints.push(p2);
    } else {
      const dp = { x: p2.x - p1.x, y: p2.y - p1.y };
      const t  = (dp.x * d2.y - dp.y * d2.x) / denom;
      const ix = p1.x + t * d1.x;
      const iy = p1.y + t * d1.y;
      const maxDist = Math.max(Math.abs(oIn), Math.abs(oOut)) * 2.5;
      if ((ix - curr.x) ** 2 + (iy - curr.y) ** 2 <= maxDist * maxDist) {
        saPoints.push({ x: ix, y: iy });
      } else {
        saPoints.push(p1);
        saPoints.push(p2);
      }
    }
  }

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
      <path d="${cutPath}" stroke="#4a8a5a" stroke-width="1.2"
        stroke-dasharray="8,5" fill="rgba(74,138,90,0.04)"/>
      <path d="${sewPath}" stroke="#2c2a26" stroke-width="2" fill="none"/>
      <line x1="${gx}" y1="${gy1}" x2="${gx}" y2="${gy2}"
        stroke="#2c2a26" stroke-width="1.2" stroke-dasharray="18,9"/>
      <polygon points="${gx},${gy1 - 7} ${gx - 4},${gy1 + 7} ${gx + 4},${gy1 + 7}"
        fill="#2c2a26"/>
      <text x="${titleX}" y="${titleY}"
        font-family="'IBM Plex Mono',monospace" font-size="14" font-weight="700"
        fill="#2c2a26" text-anchor="middle">${pieceLabel}</text>
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

  const mL = 0.45, mT = 0.55, mR = 0.45, mB = 0.5;
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
        stroke="#4a8a5a" stroke-width="1.2" stroke-dasharray="8,5"
        fill="rgba(74,138,90,0.04)"/>
      <rect x="${rx}" y="${ry}" width="${rW}" height="${rH}"
        stroke="#2c2a26" stroke-width="2" fill="none"/>
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
  const W = dimensions.width;
  const H = dimensions.height;

  const mL = 0.45, mT = 0.55, mR = 0.45, mB = 0.5;
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

function crosshair(x, y, size = 14) {
  return `<line x1="${x - size}" y1="${y}" x2="${x + size}" y2="${y}"
      stroke="#000" stroke-width="0.6"/>
    <line x1="${x}" y1="${y - size}" x2="${x}" y2="${y + size}"
      stroke="#000" stroke-width="0.6"/>
    <circle cx="${x}" cy="${y}" r="4" fill="none" stroke="#000" stroke-width="0.6"/>`;
}

// ── Tile page builder ──────────────────────────────────────────────────────

function buildTilePages(piece, pieceIdx, totalPieces, PW, PH, OV) {
  // Usable advance per tile: full page minus two safe margins minus overlap zone
  const TX = PW - 2 * SM - OV;
  const TY = PH - 2 * SM - OV;

  let rendered;
  if      (piece.type === 'panel')                              rendered = renderPanelSVG(piece);
  else if (piece.type === 'bodice' || piece.type === 'sleeve')  rendered = renderBodiceOrSleeveSVG(piece);
  else if (piece.type === 'rectangle')                          rendered = renderRectSVG(piece);
  else if (piece.type === 'pocket')                             rendered = renderPocketSVG(piece);
  else return '';

  const { svg, wIn, hIn } = rendered;

  const cols = Math.ceil(wIn / TX);
  const rows = Math.ceil(hIn / TY);

  let pages = '';

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const offsetX = -(col * TX * DPI);
      const offsetY = -(row * TY * DPI);

      let overlapHtml = '';
      if (col > 0) {
        overlapHtml += `<div style="position:absolute;top:${SM}in;left:${SM}in;
            width:${OV}in;height:${PH - 2 * SM}in;pointer-events:none;z-index:5;
            background:repeating-linear-gradient(45deg,
              transparent,transparent 4px,
              rgba(160,160,160,0.2) 4px,rgba(160,160,160,0.2) 8px);
            border-right:0.75px dashed #aaa;"></div>`;
      }
      if (row > 0) {
        overlapHtml += `<div style="position:absolute;top:${SM}in;left:${SM}in;
            width:${PW - 2 * SM}in;height:${OV}in;pointer-events:none;z-index:5;
            background:repeating-linear-gradient(45deg,
              transparent,transparent 4px,
              rgba(160,160,160,0.2) 4px,rgba(160,160,160,0.2) 8px);
            border-bottom:0.75px dashed #aaa;"></div>`;
      }

      // Crosshairs placed SM inches inward from each corner (within safe margin)
      const chSVG = `<svg xmlns="http://www.w3.org/2000/svg"
          style="position:absolute;top:0;left:0;
                 width:${PW}in;height:${PH}in;
                 pointer-events:none;z-index:10;overflow:visible">
        ${crosshair(px(SM),       px(SM))}
        ${crosshair(px(PW - SM),  px(SM))}
        ${crosshair(px(SM),       px(PH - SM))}
        ${crosshair(px(PW - SM),  px(PH - SM))}
      </svg>`;

      const tileId    = `${row + 1}-${col + 1}`;
      const gridLabel = `${rows}\xd7${cols}`;

      pages += `<div class="page tile-page">
        <div class="tile-clip">
          <div style="position:absolute;
                      left:${offsetX}px;top:${offsetY}px;
                      width:${wIn * DPI}px;height:${hIn * DPI}px;">
            ${svg}
          </div>
        </div>
        ${overlapHtml}
        ${chSVG}
        <div class="tile-footer">
          <span class="tf-name">${piece.name} \u2014 tile ${tileId} of ${gridLabel} pages</span>
          <span class="tf-brand">People\u2019s Patterns \xb7 peoplespatterns.com \xb7 @peoplespatterns</span>
          <span class="tf-info">piece ${pieceIdx + 1}/${totalPieces} \xb7 row ${row + 1} col ${col + 1} \xb7 \xbe\u2033 overlap</span>
        </div>
      </div>`;
    }
  }

  return pages;
}

// ── Tile map (page 2 overview) ─────────────────────────────────────────────

function buildTileMapSVG(pieces, PW, PH, OV) {
  const TX = PW - 2 * SM - OV;
  const TY = PH - 2 * SM - OV;
  const CELL_W = 44, CELL_H = 18, GAP = 5, PAD = 10;

  let items = '';
  let y = PAD;

  for (const piece of pieces) {
    let wIn, hIn;
    if (piece.type === 'panel') {
      wIn = (piece.ext || 0) + 0.45 + piece.width + 0.45;
      hIn = 0.55 + piece.height + 0.5;
    } else if (piece.type === 'bodice' || piece.type === 'sleeve') {
      const xs = piece.polygon.map(p => p.x), ys = piece.polygon.map(p => p.y);
      wIn = 0.45 + (Math.max(...xs) - Math.min(...xs)) + 0.45;
      hIn = 0.55 + (Math.max(...ys) - Math.min(...ys)) + 0.5;
    } else if (piece.type === 'rectangle') {
      wIn = 0.45 + piece.dimensions.length + 0.45;
      hIn = 0.55 + piece.dimensions.width + 0.5;
    } else if (piece.dimensions) {
      wIn = 0.45 + piece.dimensions.width + 0.45;
      hIn = 0.55 + piece.dimensions.height + 0.5;
    } else {
      continue;
    }

    const cols = Math.ceil(wIn / TX);
    const rows = Math.ceil(hIn / TY);
    const total = rows * cols;

    items += `<text x="${PAD}" y="${y + 12}"
      font-family="'IBM Plex Mono',monospace" font-size="10" font-weight="600"
      fill="#2c2a26">${piece.name}</text>
      <text x="${PAD + cols * (CELL_W + GAP) + 8}" y="${y + 12}"
      font-family="'IBM Plex Mono',monospace" font-size="9" fill="#999">
        ${rows}\xd7${cols} = ${total} page${total !== 1 ? 's' : ''}
      </text>`;

    y += 18;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cx = PAD + c * (CELL_W + GAP);
        const cy = y + r * (CELL_H + GAP);
        const fill = (r + c) % 2 === 0 ? '#f0eeea' : '#e8e4dd';
        items += `<rect x="${cx}" y="${cy}" width="${CELL_W}" height="${CELL_H}"
            rx="2" fill="${fill}" stroke="#bbb" stroke-width="0.7"/>
          <text x="${cx + CELL_W / 2}" y="${cy + 12}"
            font-family="'IBM Plex Mono',monospace" font-size="8"
            fill="#666" text-anchor="middle">${r + 1}-${c + 1}</text>`;
      }
    }

    y += rows * (CELL_H + GAP) + 14;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg"
      width="460" height="${y + PAD}" style="display:block">
    ${items}
  </svg>`;
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
          <li>Cut pages just outside the crosshairs at each corner</li>
          <li>Overlap each page \xbe\u2033 onto the next, matching registration crosshairs</li>
          <li>Assemble in the order shown on the tile map (page 2)</li>
          <li>Shaded margin on the left/top of a tile = the \xbe\u2033 overlap zone</li>
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
      <p class="note">Each cell = one printed page. Label = row-col (e.g. 2-3 = row 2, col 3). Assemble left-to-right, top-to-bottom per piece.</p>
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

// ── Shared print CSS ───────────────────────────────────────────────────────

function buildCSS(PW, PH) {
  return `
* { margin:0; padding:0; box-sizing:border-box; }
body { background:#777; font-family:'IBM Plex Mono',monospace; }

@page { size:${PW}in ${PH}in; margin:0; }

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
.sq-label { font-size:8.5pt; color:#555; margin-top:0.1in; }

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
.step-d { font-size:8.5pt; color:#555; line-height:1.55; }

/* ── Tiles ── */
.tile-page { background:#fff; }
.tile-clip {
  position:absolute; top:${SM}in; left:${SM}in;
  width:${PW - 2 * SM}in; height:${PH - 2 * SM}in;
  overflow:hidden;
}
.tile-footer {
  position:absolute; bottom:${SM}in; left:${SM}in; right:${SM}in;
  display:flex; justify-content:space-between; align-items:baseline;
  background:rgba(255,255,255,0.93);
  padding:1px 4px;
  border-top:0.5px solid #ddd;
  z-index:20;
}
.tf-name { font-size:7.5pt; font-weight:700; color:#2c2a26; }
.tf-brand { font-size:7pt; color:#888; }
.tf-info { font-size:7pt; color:#aaa; }

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
.note { font-size:8.5pt; color:#888; margin-bottom:0.08in; }
.ptable { width:100%; border-collapse:collapse; font-size:8.5pt; }
.ptable th {
  text-align:left; border-bottom:1px solid #ddd;
  padding:3px 5px; font-weight:600; color:#777;
}
.ptable td { border-bottom:0.5px solid #f0f0f0; padding:3px 5px; vertical-align:top; }

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

  const coverPage = buildCoverPage(garment, measurements, opts);
  const scalePage = buildScalePage(pieces, PW, PH, OV);
  const matPage   = buildMaterialsPage(materials);
  const instrPage = buildInstructionsPage(instructions);
  const tilePages = pieces.map((p, i) => buildTilePages(p, i, pieces.length, PW, PH, OV)).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${garment.name} \u2014 Printable Pattern (${size.label})</title>
<style>${buildCSS(PW, PH)}</style>
</head>
<body>
${coverPage}
${scalePage}
${matPage}
${instrPage}
${tilePages}
</body>
</html>`;
}
