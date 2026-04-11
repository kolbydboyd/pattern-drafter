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
import { SIZE_LINE_STYLES } from '../engine/grading.js';
import { GLOSSARY } from '../engine/glossary.js';

// ── Paper size registry ────────────────────────────────────────────────────
const PAPER_SIZES = {
  letter:    { w: 8.5,  h: 11,    label: 'US Letter'   },
  a4:        { w: 8.27, h: 11.69, label: 'A4'          },
  tabloid:   { w: 11,   h: 17,    label: 'Tabloid'     },
  a0:        { w: 33.1, h: 46.8,  label: 'A0/Plotter'  },
  projector: { w: 80,   h: 60,    label: 'Projector'   },
};

const DPI    = 96;  // CSS px per inch
const px     = in_ => in_ * DPI;
const SM     = 0.4; // safe (unprintable) margin in inches — keep all content inside this boundary
const MARGIN = 1.5; // generous padding around each piece — prevents SA miter clipping on all edges

// ── Piece SVG rendering at 1:1 scale ───────────────────────────────────────

/**
 * Snap each notch to the nearest point on cutPolyInches (the outer cut line)
 * and render filled triangles pointing INWARD along the edge normal.
 * Professional patterns place notches on the cut edge so they can be snipped
 * into the seam allowance; the inward direction shows which side is "in."
 *
 * Triangle: height 0.20 in, base width 0.15 in (half-base 0.075 in).
 */
function renderNotchesPrint(cutPolyInches, notches, ox, oy) {
  if (!notches || !notches.length) return '';
  const n    = cutPolyInches.length;
  const TRI_H  = 0.20;
  const TRI_HW = 0.075;

  // Centroid for inward-normal selection
  let cx = 0, cy = 0;
  for (const p of cutPolyInches) { cx += p.x; cy += p.y; }
  cx /= n; cy /= n;

  let svg = '';
  for (const notch of notches) {
    let bestDist = Infinity;
    let bestPx = 0, bestPy = 0;
    let bestNx = 0, bestNy = -1;

    for (let i = 0; i < n; i++) {
      const a   = cutPolyInches[i];
      const b   = cutPolyInches[(i + 1) % n];
      const edx = b.x - a.x, edy = b.y - a.y;
      const lenSq = edx * edx + edy * edy;
      if (lenSq < 1e-10) continue;

      // Project notch onto edge, clamp t to [0,1]
      let t = ((notch.x - a.x) * edx + (notch.y - a.y) * edy) / lenSq;
      t = Math.max(0, Math.min(1, t));
      const cpx = a.x + t * edx, cpy = a.y + t * edy;
      const d   = Math.sqrt((notch.x - cpx) ** 2 + (notch.y - cpy) ** 2);

      if (d < bestDist) {
        bestDist = d;
        bestPx = cpx; bestPy = cpy;

        const len  = Math.sqrt(lenSq);
        const edux = edx / len, eduy = edy / len;
        // Two candidate perpendiculars
        const nx1 = eduy, ny1 = -edux;
        const nx2 = -eduy, ny2 = edux;
        // Pick the one pointing TOWARD centroid (inward)
        const toCx = cx - cpx, toCy = cy - cpy;
        if (nx1 * toCx + ny1 * toCy >= 0) { bestNx = nx1; bestNy = ny1; }
        else                               { bestNx = nx2; bestNy = ny2; }
      }
    }

    // Convert to SVG pixels (already at 1:1 print scale)
    const bpx = (ox + bestPx) * DPI;
    const bpy = (oy + bestPy) * DPI;
    const apexX = bpx + TRI_H  * DPI * bestNx;
    const apexY = bpy + TRI_H  * DPI * bestNy;
    const b1x   = bpx + TRI_HW * DPI * (-bestNy);
    const b1y   = bpy + TRI_HW * DPI * bestNx;
    const b2x   = bpx + TRI_HW * DPI * bestNy;
    const b2y   = bpy + TRI_HW * DPI * (-bestNx);

    svg += `<polygon points="${b1x.toFixed(1)},${b1y.toFixed(1)} ${apexX.toFixed(1)},${apexY.toFixed(1)} ${b2x.toFixed(1)},${b2y.toFixed(1)}" fill="#2c2a26"/>`;
  }
  return svg;
}

/** Convert an array of {x,y} inch points to an SVG path string, offset by (ox, oy) inches */
function polyPath(pts, ox, oy) {
  let d = `M ${(ox + pts[0].x) * DPI} ${(oy + pts[0].y) * DPI}`;
  for (let i = 1; i < pts.length; i++) {
    d += ` L ${(ox + pts[i].x) * DPI} ${(oy + pts[i].y) * DPI}`;
  }
  return d + ' Z';
}

/** SVG path for a rect with square top corners and rounded bottom corners */
function bottomRoundedPath(x, y, w, h, cr) {
  const r = Math.min(cr, w / 2, h / 2);
  if (r <= 0) return `M${x},${y} h${w} v${h} h${-w} Z`;
  return `M${x},${y} h${w} v${h - r} q0,${r} ${-r},${r} h${-(w - 2 * r)} q${-r},0 ${-r},${-r} Z`;
}

/** Drill mark (crosshair) for pocket corners — industry standard fabric transfer mark */
function drillMark(x, y, size = 4) {
  return `<line x1="${x - size}" y1="${y}" x2="${x + size}" y2="${y}" stroke="#8a4a4a" stroke-width="0.6"/>
    <line x1="${x}" y1="${y - size}" x2="${x}" y2="${y + size}" stroke="#8a4a4a" stroke-width="0.6"/>`;
}

/** Pocket placement colour constants (matches pattern-view.js) */
const PKT_COL = '#8a4a4a';
const PKT_FILL = 'rgba(138,74,74,.03)';
const PKT_DASH = '2,3';

/**
 * Render pocket placement indicators on a panel piece.
 * Mirrors the logic from pattern-view.js but at 1:1 print scale (DPI px).
 * Returns SVG string (empty if no pockets selected).
 */
function renderPocketPlacement(piece, ox, oy) {
  const { width, height, rise, inseam, polygon, isBack, opts } = piece;
  if (!opts) return '';

  const p = (inches) => inches * DPI; // convert inches to px
  let svg = '';

  // ── Slant pocket (front only) ──
  if (!isBack && opts.frontPocket === 'slant') {
    const sx1 = (ox + width - 3.5) * DPI, sy1 = oy * DPI;
    const sx2 = (ox + width) * DPI,       sy2 = (oy + 6) * DPI;
    const bagL = (ox + width - 7) * DPI,  bagB = (oy + 9.5) * DPI;
    // Bag outline
    svg += `<path d="M ${sx1} ${sy1} L ${bagL} ${sy1} L ${bagL} ${bagB} Q ${sx2} ${bagB} ${sx2} ${sy2} Z"
      stroke="${PKT_COL}" stroke-width="0.6" stroke-dasharray="${PKT_DASH}" fill="${PKT_FILL}"/>`;
    // Slash opening (solid)
    svg += `<line x1="${sx1}" y1="${sy1}" x2="${sx2}" y2="${sy2}"
      stroke="${PKT_COL}" stroke-width="1"/>`;
    // Drill marks at key corners
    svg += drillMark(sx1, sy1);
    svg += drillMark(sx2, sy2);
    svg += drillMark(bagL, sy1);
    svg += drillMark(bagL, bagB);
    // Label
    svg += `<text x="${bagL + 3}" y="${(oy + rise * 0.85) * DPI}"
      font-family="'IBM Plex Mono',monospace" font-size="8" fill="${PKT_COL}">slant pocket</text>`;
  }

  // ── Side-seam pocket (front only) ──
  if (!isBack && opts.frontPocket === 'side') {
    const pTop = 2, pBot = 8.5;
    // Interpolate side seam X at given Y (polygon edges 1-4)
    function sideSeamXatY(ty) {
      for (let i = 1; i <= 4; i++) {
        const a = polygon[i], b = polygon[i + 1];
        if (!a || !b) break;
        const yMin = Math.min(a.y, b.y), yMax = Math.max(a.y, b.y);
        if (yMin <= ty && ty <= yMax) {
          return a.x + (ty - a.y) / (b.y - a.y) * (b.x - a.x);
        }
      }
      return width;
    }
    const txTop = (ox + sideSeamXatY(pTop)) * DPI, tyTop = (oy + pTop) * DPI;
    const txBot = (ox + sideSeamXatY(pBot)) * DPI, tyBot = (oy + pBot) * DPI;
    const tickLen = p(0.35);
    // Top & bottom tick marks
    svg += `<line x1="${txTop - tickLen}" y1="${tyTop}" x2="${txTop}" y2="${tyTop}" stroke="${PKT_COL}" stroke-width="1.2"/>`;
    svg += `<line x1="${txBot - tickLen}" y1="${tyBot}" x2="${txBot}" y2="${tyBot}" stroke="${PKT_COL}" stroke-width="1.2"/>`;
    // Dashed bracket
    svg += `<line x1="${txTop}" y1="${tyTop}" x2="${txBot}" y2="${tyBot}" stroke="${PKT_COL}" stroke-width="0.8" stroke-dasharray="3,3"/>`;
    // Drill marks at opening ends
    svg += drillMark(txTop, tyTop);
    svg += drillMark(txBot, tyBot);
    // Label
    const labelX = (ox + sideSeamXatY(pTop) + (piece.sa || 0.5) + 0.3) * DPI;
    const labelMidY = (tyTop + tyBot) / 2;
    svg += `<text x="${labelX}" y="${labelMidY}" font-family="'IBM Plex Mono',monospace" font-size="8" fill="${PKT_COL}"
      text-anchor="middle" transform="rotate(90,${labelX},${labelMidY})">pocket opening</text>`;
  }

  // ── Scoop / Square-scoop pocket (front only) — rivet positions at opening endpoints ──
  if (!isBack && (opts.frontPocket === 'scoop' || opts.frontPocket === 'square-scoop')) {
    const scoopInset = 3.5, scoopDepth = 6;
    const sx1 = (ox + width - scoopInset) * DPI, sy1 = oy * DPI;
    const sx2 = (ox + width) * DPI,             sy2 = (oy + scoopDepth) * DPI;
    svg += drillMark(sx1, sy1);
    svg += `<text x="${sx1 + 5}" y="${sy1 + 9}"
      font-family="'IBM Plex Mono',monospace" font-size="7" fill="${PKT_COL}">rivet</text>`;
    svg += drillMark(sx2, sy2);
    svg += `<text x="${sx2 + 5}" y="${sy2 + 4}"
      font-family="'IBM Plex Mono',monospace" font-size="7" fill="${PKT_COL}">rivet</text>`;
  }

  // ── Cargo pocket (front only) ──
  if (opts.cargo === 'cargo') {
    const cpX = (ox + width) * DPI;
    const cpY = (oy + rise + Math.min(inseam * 0.2, 2)) * DPI;
    const cpW = p(3.5), cpH = p(4);
    svg += `<rect x="${cpX - cpW}" y="${cpY}" width="${cpW}" height="${cpH}" rx="${p(0.15)}"
      stroke="${PKT_COL}" stroke-width="0.6" stroke-dasharray="${PKT_DASH}" fill="${PKT_FILL}"/>`;
    svg += drillMark(cpX - cpW, cpY);
    svg += drillMark(cpX, cpY);
    svg += drillMark(cpX - cpW, cpY + cpH);
    svg += drillMark(cpX, cpY + cpH);
    svg += `<text x="${cpX - cpW + 3}" y="${cpY + cpH + 10}"
      font-family="'IBM Plex Mono',monospace" font-size="8" fill="${PKT_COL}">cargo</text>`;
  }

  // ── Back patch pocket ──
  if (isBack && opts.backPocket && opts.backPocket !== 'none') {
    const bpX = (ox + width * 0.35) * DPI, bpY = (oy + 1.8) * DPI;
    const bpW = p(3), bpH = p(3.5);
    svg += `<rect x="${bpX}" y="${bpY}" width="${bpW}" height="${bpH}" rx="${p(0.2)}"
      stroke="${PKT_COL}" stroke-width="0.6" stroke-dasharray="${PKT_DASH}" fill="${PKT_FILL}"/>`;
    svg += drillMark(bpX, bpY);
    svg += drillMark(bpX + bpW, bpY);
    svg += drillMark(bpX, bpY + bpH);
    svg += drillMark(bpX + bpW, bpY + bpH);
    svg += `<text x="${bpX + 3}" y="${bpY + bpH + 10}"
      font-family="'IBM Plex Mono',monospace" font-size="8" fill="${PKT_COL}">patch pocket</text>`;
  }

  // ── Back welt pocket (jeans, pleated shorts/trousers) ──
  if (isBack && (opts.backPockets === 'welt1' || opts.backPockets === 'welt2')) {
    const weltW = 5, weltH = 0.5;
    const weltX = (ox + width * 0.5 - weltW / 2) * DPI;
    const weltY = (oy + 2.5) * DPI;
    const wW = p(weltW), wH = p(weltH);
    svg += `<rect x="${weltX}" y="${weltY}" width="${wW}" height="${wH}"
      stroke="${PKT_COL}" stroke-width="0.8" fill="${PKT_FILL}"/>`;
    svg += drillMark(weltX, weltY + wH / 2);
    svg += drillMark(weltX + wW, weltY + wH / 2);
    svg += `<text x="${weltX + 3}" y="${weltY + wH + 10}"
      font-family="'IBM Plex Mono',monospace" font-size="8" fill="${PKT_COL}">welt pocket</text>`;
    // Second welt pocket if welt2, offset 2.5" below first
    if (opts.backPockets === 'welt2') {
      const w2Y = weltY + p(2.5);
      svg += `<rect x="${weltX}" y="${w2Y}" width="${wW}" height="${wH}"
        stroke="${PKT_COL}" stroke-width="0.8" fill="${PKT_FILL}"/>`;
      svg += drillMark(weltX, w2Y + wH / 2);
      svg += drillMark(weltX + wW, w2Y + wH / 2);
    }
  }

  // ── Fly shield outline (front panel, left/CF side) ──
  if (!isBack) {
    const flyLen = Math.ceil((rise || 10) * 0.6);
    const fsX = ox * DPI;
    const fsY = oy * DPI;
    const fsW = 2.5 * DPI;
    const fsH = flyLen * DPI;
    svg += `<rect x="${fsX}" y="${fsY}" width="${fsW}" height="${fsH}"
      stroke="${PKT_COL}" stroke-width="0.6" stroke-dasharray="${PKT_DASH}" fill="${PKT_FILL}"/>`;
    svg += `<text x="${fsX + 3}" y="${fsY + fsH + 10}"
      font-family="'IBM Plex Mono',monospace" font-size="8" fill="${PKT_COL}">fly shield (left only)</text>`;
  }

  return svg;
}

/**
 * Render a panel piece (front/back) as a full-size SVG string.
 * Returns { svg, wIn, hIn } — dimensions in inches.
 */
function renderPanelSVG(piece) {
  const { polygon, saPolygon, width, height, rise, ext, inseam,
          sa, hem, name, instruction = '', darts = [], notches = [],
          crotchBezierSA, isBack, opts } = piece;

  const mL = ext + MARGIN;
  const mT = MARGIN;
  const mR = (sa || 0.5) + MARGIN;  // SA extends `sa` past width — MARGIN ensures no clip
  const mB = MARGIN;

  const cbR = piece.cbRaise || 0;
  const wIn = mL + width + mR;
  const hIn = mT + cbR + height + mB;

  const ox = mL;
  const oy = mT + cbR;

  const cutPath = polyPath(polygon, ox, oy);

  // LOCKED — hybrid crotch curve stitch line, ported from pattern-view.js.
  // Uses Catmull-Rom → cubic bezier through offsetPolygon points for uniform SA
  // offset + smooth rendering. Do not modify without also updating pattern-view.js.
  const sewPath = (() => {
    if (!crotchBezierSA) return polyPath(saPolygon, ox, oy);

    // Convert saPolygon + bezier endpoints to px coordinates
    const saPx = saPolygon.map(p => ({ x: (ox + p.x) * DPI, y: (oy + p.y) * DPI }));
    const sp0 = { x: (ox + crotchBezierSA.p0.x) * DPI, y: (oy + crotchBezierSA.p0.y) * DPI };
    const sp3 = { x: (ox + crotchBezierSA.p3.x) * DPI, y: (oy + crotchBezierSA.p3.y) * DPI };

    // Find SA polygon vertices closest to bezier endpoints
    let idx0 = 0, idx3 = 0, d0 = Infinity, d3 = Infinity;
    for (let i = 0; i < saPx.length; i++) {
      const dist0 = (saPx[i].x - sp0.x) ** 2 + (saPx[i].y - sp0.y) ** 2;
      if (dist0 < d0) { d0 = dist0; idx0 = i; }
      const dist3 = (saPx[i].x - sp3.x) ** 2 + (saPx[i].y - sp3.y) ** 2;
      if (dist3 < d3) { d3 = dist3; idx3 = i; }
    }

    // Determine structural direction (through hem = high y)
    const n = saPx.length;
    let fwdMaxY = 0, bwdMaxY = 0;
    for (let i = (idx3 + 1) % n; i !== idx0; i = (i + 1) % n) fwdMaxY = Math.max(fwdMaxY, saPx[i].y);
    for (let i = (idx3 - 1 + n) % n; i !== idx0; i = (i - 1 + n) % n) bwdMaxY = Math.max(bwdMaxY, saPx[i].y);
    const structDir = fwdMaxY > bwdMaxY ? 1 : -1;

    // Collect structural edges (waist→side→hem→inseam)
    let hp = `M ${saPx[idx3].x.toFixed(1)} ${saPx[idx3].y.toFixed(1)}`;
    for (let i = (idx3 + structDir + n) % n; i !== idx0; i = (i + structDir + n) % n) {
      hp += ` L ${saPx[i].x.toFixed(1)} ${saPx[i].y.toFixed(1)}`;
    }
    hp += ` L ${saPx[idx0].x.toFixed(1)} ${saPx[idx0].y.toFixed(1)}`;

    // Collect crotch curve offset points (walk same direction as struct — wraps via curve)
    const rawCurvePts = [];
    for (let i = (idx0 + structDir + n) % n; i !== idx3; i = (i + structDir + n) % n) {
      rawCurvePts.push(saPx[i]);
    }

    // Trim curve points too close to structural endpoints — prevents jog/overshoot
    const trimDist = sa * DPI * 1.5;
    const v0 = saPx[idx0], v3 = saPx[idx3];
    const curvePts = rawCurvePts.filter(p => {
      const dd0 = Math.sqrt((p.x - v0.x) ** 2 + (p.y - v0.y) ** 2);
      const dd3 = Math.sqrt((p.x - v3.x) ** 2 + (p.y - v3.y) ** 2);
      return dd0 > trimDist && dd3 > trimDist;
    });

    if (curvePts.length < 2) {
      hp += ` L ${v3.x.toFixed(1)} ${v3.y.toFixed(1)} Z`;
    } else {
      // Bookend with structural vertices for clean entry/exit
      const cp = [v0, ...curvePts, v3];
      hp += ` L ${cp[0].x.toFixed(1)} ${cp[0].y.toFixed(1)}`;
      // Catmull-Rom → cubic bezier spline through offset points
      for (let k = 0; k < cp.length - 1; k++) {
        const p0 = cp[Math.max(0, k - 1)];
        const p1 = cp[k];
        const p2 = cp[k + 1];
        const p3 = cp[Math.min(cp.length - 1, k + 2)];
        const b1x = p1.x + (p2.x - p0.x) / 6;
        const b1y = p1.y + (p2.y - p0.y) / 6;
        const b2x = p2.x - (p3.x - p1.x) / 6;
        const b2y = p2.y - (p3.y - p1.y) / 6;
        hp += ` C ${b1x.toFixed(1)} ${b1y.toFixed(1)}, ${b2x.toFixed(1)} ${b2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
      }
      hp += ' Z';
    }
    return hp;
  })();

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
        stroke="#999" stroke-width="0.8" stroke-dasharray="12,7"/>
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
        return `<line x1="${dx - halfW}" y1="${dy1}" x2="${dx}" y2="${dy2}" stroke="#555" stroke-width="0.8" stroke-dasharray="4,3"/>
        <line x1="${dx + halfW}" y1="${dy1}" x2="${dx}" y2="${dy2}" stroke="#555" stroke-width="0.8" stroke-dasharray="4,3"/>
        <text x="${dx}" y="${dy2 + 12}" font-family="'IBM Plex Mono',monospace" font-size="8" fill="#444" text-anchor="middle">dart</text>`;
      }).join('\n')}
      ${renderNotchesPrint(polygon, notches, ox, oy)}
      <text x="${(ox - ext) * DPI}" y="${noteY}"
        font-family="'IBM Plex Mono',monospace" font-size="10" fill="#444">
        ${fmtInches(sa)} SA all seams incl. waist \xb7 ${fmtInches(hem)} hem
      </text>
      ${(() => {
        // Info block at bottom-left inside the piece outline (visible after cutting)
        const infoX = (ox + 0.3) * DPI;
        const infoY = (oy + height - hem - 1.6) * DPI;
        const lh = 11; // line height in px
        const lines = [
          `${name} \xd7 2 (mirror)`,
          instruction,
          `${fmtInches(sa)} SA all seams \xb7 ${fmtInches(hem)} hem`,
        ].filter(Boolean);
        return lines.map((line, i) =>
          `<text x="${infoX}" y="${infoY + i * lh}"
            font-family="'IBM Plex Mono',monospace" font-size="8"
            fill="#999">${line}</text>`
        ).join('\n');
      })()}
      ${renderPocketPlacement(piece, ox, oy)}
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
  const saPoints = offsetPolygon(polygon, (i, a, b) => {
    if (ea && ea[i]) return -ea[i].sa;
    if (cutOnFold && Math.abs(a.x - minX) < 0.01 && Math.abs(b.x - minX) < 0.01) return 0;
    return -sa;
  });

  function pts2path(pts) {
    let d = `M ${(ox + pts[0].x) * DPI} ${(oy + pts[0].y) * DPI}`;
    for (let i = 1; i < pts.length; i++) d += ` L ${(ox + pts[i].x) * DPI} ${(oy + pts[i].y) * DPI}`;
    return d + ' Z';
  }

  const cutPath = pts2path(polygon);
  // ── HYBRID STITCH PATH — VERIFIED WORKING, DO NOT CHANGE UNLESS NECESSARY ──
  // Same algorithm as pattern-view.js renderGenericPieceSVG: Catmull-Rom for .curve sections,
  // L for structural edges. Duplicate-endpoint phantoms at curve run boundaries.
  const sewPath = (() => {
    const hasCurve = saPoints.some(p => p.curve);
    if (!hasCurve) return pts2path(saPoints);
    const pts = saPoints.map(p => ({ x: (ox + p.x) * DPI, y: (oy + p.y) * DPI, curve: p.curve }));
    let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
    for (let i = 1; i < pts.length; i++) {
      if (!pts[i].curve) {
        d += ` L ${pts[i].x.toFixed(1)} ${pts[i].y.toFixed(1)}`;
      } else {
        const before = pts[i - 1];
        const curveRun = [];
        while (i < pts.length && pts[i].curve) curveRun.push(pts[i++]);
        const after = i < pts.length ? pts[i] : pts[0];
        d += ` L ${curveRun[0].x.toFixed(1)} ${curveRun[0].y.toFixed(1)}`;
        const run = [curveRun[0], ...curveRun, curveRun[curveRun.length - 1]];
        for (let k = 1; k < run.length - 2; k++) {
          const p0 = run[k - 1], p1 = run[k], p2 = run[k + 1];
          const p3 = run[Math.min(run.length - 1, k + 2)];
          const b1x = p1.x + (p2.x - p0.x) / 6;
          const b1y = p1.y + (p2.y - p0.y) / 6;
          const b2x = p2.x - (p3.x - p1.x) / 6;
          const b2y = p2.y - (p3.y - p1.y) / 6;
          d += ` C ${b1x.toFixed(1)} ${b1y.toFixed(1)}, ${b2x.toFixed(1)} ${b2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
        }
        d += ` L ${after.x.toFixed(1)} ${after.y.toFixed(1)}`;
        i--;
      }
    }
    return d + ' Z';
  })();

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
        stroke="#555" stroke-width="0.8" stroke-dasharray="4,3"/>
      ${(() => { const fx = (ox + minX) * DPI, aw = 5, ah = 3;
        const count = Math.max(2, Math.min(5, Math.floor((gy2 - gy1) / 30)));
        const inset = (gy2 - gy1) * 0.15;
        let arrows = '';
        for (let i = 0; i < count; i++) {
          const ay = gy1 + inset + (gy2 - gy1 - 2 * inset) * i / (count - 1);
          arrows += '<polygon points="' + (fx + 10 - aw) + ',' + ay + ' ' + (fx + 10) + ',' + (ay - ah) + ' ' + (fx + 10) + ',' + (ay + ah) + '" fill="#444"/>';
        }
        const my = (gy1 + gy2) / 2;
        arrows += '<text x="' + (fx + 6) + '" y="' + my + '" font-family="IBM Plex Mono,monospace" font-size="9" fill="#444" text-anchor="middle" letter-spacing="2" transform="rotate(-90,' + (fx + 6) + ',' + my + ')">PLACE ON FOLD</text>';
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
      ${renderNotchesPrint(polygon, notches, ox, oy)}
      ${(piece.bustDarts || []).map(d => {
        const ax = (ox + d.apexX) * DPI, ay = (oy + d.apexY) * DPI;
        const ux = (ox + d.sideX) * DPI, uy = (oy + d.upperY) * DPI;
        const lx = (ox + d.sideX) * DPI, ly = (oy + d.lowerY) * DPI;
        return `<line x1="${ux.toFixed(1)}" y1="${uy.toFixed(1)}" x2="${ax.toFixed(1)}" y2="${ay.toFixed(1)}" stroke="#555" stroke-width="0.8" stroke-dasharray="4,3"/>
        <line x1="${lx.toFixed(1)}" y1="${ly.toFixed(1)}" x2="${ax.toFixed(1)}" y2="${ay.toFixed(1)}" stroke="#555" stroke-width="0.8" stroke-dasharray="4,3"/>
        <text x="${(ax - 10).toFixed(1)}" y="${(ay - 5).toFixed(1)}" font-family="'IBM Plex Mono',monospace" font-size="8" fill="#444" text-anchor="middle">dart</text>`;
      }).join('\n')}
      <text x="${titleX}" y="${noteY}"
        font-family="'IBM Plex Mono',monospace" font-size="10" fill="#444"
        text-anchor="middle">${fmtInches(sa)} SA \xb7 ${fmtInches(hem)} hem</text>
      ${(() => {
        // Info block at bottom-left inside the piece outline (visible after cutting)
        // Skip for very small pieces where text wouldn't fit
        if (pW < 3 || pH < 3) return '';
        const infoX = (ox + minX + sa + 0.3) * DPI;
        const infoY = (oy + maxY - 1.4) * DPI;
        const lh = 11;
        const instruction = piece.instruction || '';
        const lines = [
          pieceLabel,
          instruction,
          `${fmtInches(sa)} SA \xb7 ${fmtInches(hem)} hem`,
        ].filter(Boolean);
        return lines.map((line, i) =>
          `<text x="${infoX}" y="${infoY + i * lh}"
            font-family="'IBM Plex Mono',monospace" font-size="8"
            fill="#999">${line}</text>`
        ).join('\n');
      })()}
      ${(() => {
        if (piece.id !== 'scoop-backing' && piece.id !== 'square-scoop-backing') return '';
        const bW = piece.width || 7;
        const bSA = piece.sa || 0.625;
        const coinW = 3, coinH = 3.5;
        const cpX = (ox + bW - bSA - coinW) * DPI;
        const cpY = (oy + bSA) * DPI;
        const cpW = coinW * DPI, cpH = coinH * DPI;
        const crpx = 0.5 * DPI;
        return `<rect x="${cpX.toFixed(1)}" y="${cpY.toFixed(1)}" width="${cpW.toFixed(1)}" height="${cpH.toFixed(1)}" rx="${crpx.toFixed(1)}"
          stroke="${PKT_COL}" stroke-width="0.6" stroke-dasharray="${PKT_DASH}" fill="${PKT_FILL}"/>
        ${drillMark(cpX, cpY)}
        ${drillMark(cpX + cpW, cpY)}
        <text x="${(cpX + 3).toFixed(1)}" y="${(cpY + cpH + 10).toFixed(1)}"
          font-family="'IBM Plex Mono',monospace" font-size="8" fill="${PKT_COL}">coin pocket</text>`;
      })()}
    </svg>`,
  };
}

/**
 * Render a rectangle piece at 1:1.
 * Returns { svg, wIn, hIn }.
 */
function renderRectSVG(piece, { compact = false, fold } = {}) {
  const { name, dimensions, sa, instruction = '' } = piece;
  const fullLen = dimensions.length;
  const fullWid = dimensions.width;

  // Auto-detect fold eligibility when not explicitly specified —
  // garment authors mark foldable pieces with "on fold" in instruction text
  if (fold === undefined) {
    fold = /on fold/i.test(instruction);
  }
  const halfLen = fold ? fullLen / 2 : fullLen;

  // Rotate so the long dimension runs vertically (portrait) to reduce paper
  const rotated = halfLen > fullWid;
  const W = rotated ? fullWid : halfLen;
  const H = rotated ? halfLen : fullWid;

  const saVal = sa || 0.625;
  const M = compact ? Math.max(0.3, saVal + 0.08) : MARGIN;
  const wIn = M + W + M;
  const hIn = M + H + M;

  const rx = M * DPI, ry = M * DPI;
  const rW = W * DPI,  rH = H * DPI;
  const saOff = saVal * DPI;
  const cx = (M + W / 2) * DPI;
  const cy = (M + H / 2) * DPI;

  const foldLabel = fold ? `${fmtInches(fullLen)} full (place on fold)` : `${fmtInches(fullLen)}`;
  const dimLabel = `${foldLabel} \xd7 ${fmtInches(fullWid)}`;

  // Fold-line indicator — on the outer cut-line edge (not the inner stitch line)
  let foldSvg = '';
  if (fold && rotated) {
    // Horizontal fold line along the top cut edge
    const fy = ry - saOff;
    const fx1 = rx - saOff + (rW + saOff * 2) * 0.1, fx2 = rx - saOff + (rW + saOff * 2) * 0.9;
    const fmx = (fx1 + fx2) / 2;
    foldSvg = `<line x1="${fx1}" y1="${fy}" x2="${fx2}" y2="${fy}" stroke="#555" stroke-width="0.8" stroke-dasharray="4,3"/>`;
    const aw = 3, ah = 4;
    const inset = (fx2 - fx1) * 0.15;
    for (let i = 0; i < 3; i++) {
      const ax = fx1 + inset + (fx2 - fx1 - 2 * inset) * i / 2;
      foldSvg += `<polygon points="${ax},${fy + 8 - aw} ${ax - ah},${fy + 8} ${ax + ah},${fy + 8}" fill="#555"/>`;
    }
    foldSvg += `<text x="${fmx}" y="${fy + 5}" font-family="'IBM Plex Mono',monospace" font-size="7" fill="#555" text-anchor="middle" letter-spacing="1.5" dominant-baseline="middle">FOLD</text>`;
  } else if (fold) {
    // Vertical fold line on the left cut edge (original orientation)
    const fx = rx - saOff;
    const fy1 = ry - saOff + (rH + saOff * 2) * 0.1, fy2 = ry - saOff + (rH + saOff * 2) * 0.9;
    const fmy = (fy1 + fy2) / 2;
    foldSvg = `<line x1="${fx}" y1="${fy1}" x2="${fx}" y2="${fy2}" stroke="#555" stroke-width="0.8" stroke-dasharray="4,3"/>`;
    const aw = 4, ah = 3;
    const inset = (fy2 - fy1) * 0.15;
    for (let i = 0; i < 3; i++) {
      const ay = fy1 + inset + (fy2 - fy1 - 2 * inset) * i / 2;
      foldSvg += `<polygon points="${fx + 8 - aw},${ay} ${fx + 8},${ay - ah} ${fx + 8},${ay + ah}" fill="#444"/>`;
    }
    foldSvg += `<text x="${fx + 5}" y="${fmy}" font-family="'IBM Plex Mono',monospace" font-size="8" fill="#444" text-anchor="middle" letter-spacing="1.5" transform="rotate(-90,${fx + 5},${fmy})">FOLD</text>`;
  }

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
        stroke="#999" stroke-width="0.6" stroke-dasharray="8,6"/>
      <line x1="${rx}" y1="${cy}" x2="${rx + rW}" y2="${cy}"
        stroke="#999" stroke-width="0.6" stroke-dasharray="8,6"/>
      ${foldSvg}
      <text x="${cx}" y="${(M - 0.08) * DPI}"
        font-family="'IBM Plex Mono',monospace" font-size="${compact ? 10 : 14}" font-weight="700"
        fill="#2c2a26" text-anchor="middle">${name}</text>
      <text x="${cx}" y="${cy}"
        font-family="'IBM Plex Mono',monospace" font-size="${compact ? 9 : 12}"
        fill="#666" text-anchor="middle">${dimLabel}</text>
      ${instruction && W >= 3 ? `<text x="${cx}" y="${cy + (compact ? 12 : 16)}"
        font-family="'IBM Plex Mono',monospace" font-size="${compact ? 8 : 10}"
        fill="#666" text-anchor="middle">${instruction}</text>` : ''}
      ${piece.id === 'waistband'
        ? `${drillMark(cx, ry + rH)}
           <circle cx="${cx}" cy="${ry + rH}" r="5" stroke="${PKT_COL}" stroke-width="0.8" fill="none"/>
           <text x="${cx + 9}" y="${ry + rH + 4}"
             font-family="'IBM Plex Mono',monospace" font-size="7" fill="${PKT_COL}">button/buttonhole</text>`
        : ''}
    </svg>`,
  };
}

/**
 * Render a pocket piece at 1:1.
 * Returns { svg, wIn, hIn }.
 *
 * Supports optional `marks` array on the piece for fold/pleat/centerline indicators:
 *   { type: 'fold',   axis: 'h'|'v', position: <inches from top/left>, label: '...' }
 *   { type: 'pleat',  axis: 'v',     center: <inches from left>, intake: <inches each side>, label: '...' }
 *   { type: 'centerline', axis: 'h'|'v' }
 */
function renderPocketSVG(piece, { compact = false } = {}) {
  const { name, dimensions, marks = [] } = piece;
  // Pocket bags use { width, height }; strip pieces (collar, facing, tie) use { length, width }
  const W = dimensions.length ?? dimensions.width;
  const H = dimensions.height  ?? dimensions.width;
  const sa = piece.sa || 0;
  const saOff = sa * DPI;

  const M = compact ? Math.max(0.3, sa > 0 ? sa + 0.08 : 0.3) : MARGIN;
  const wIn = M + W + M;
  const hIn = M + H + M;

  const rx = M * DPI, ry = M * DPI;
  const rW = W * DPI,  rH = H * DPI;
  const cx = (M + W / 2) * DPI;
  const cy = (M + H / 2) * DPI;

  // SA cut line (outer) + stitch line (inner dashed)
  const crInner = (piece.cornerRadius || 0) * DPI;
  const crOuter = ((piece.cornerRadius || 0) + sa) * DPI;
  const saRect = sa > 0
    ? (piece.id === 'coin-pocket'
      ? `<path d="${bottomRoundedPath(rx - saOff, ry - saOff, rW + saOff * 2, rH + saOff * 2, crOuter)}"
          stroke="#000" stroke-width="1.5" fill="none"/>`
      : `<rect x="${rx - saOff}" y="${ry - saOff}" width="${rW + saOff * 2}" height="${rH + saOff * 2}"
          rx="${crOuter}" stroke="#000" stroke-width="1.5" fill="none"/>`)
    : '';
  const stitchStroke = sa > 0 ? 'stroke="#666" stroke-width="0.8" stroke-dasharray="4,3"' : 'stroke="#2c2a26" stroke-width="2"';

  // Marks rendering
  let marksSvg = '';
  const markCol = '#4a8a5a';
  for (const m of marks) {
    if (m.type === 'fold') {
      if (m.axis === 'h') {
        // Horizontal fold line at `position` inches from top
        const ly = ry + m.position * DPI;
        marksSvg += `<line x1="${rx}" y1="${ly}" x2="${rx + rW}" y2="${ly}" stroke="${markCol}" stroke-width="0.8" stroke-dasharray="4,3"/>`;
        if (m.label) marksSvg += `<text x="${rx + rW + 4}" y="${ly + 3}" font-family="'IBM Plex Mono',monospace" font-size="7" fill="${markCol}">${m.label}</text>`;
      } else {
        // Vertical fold line at `position` inches from left
        const lx = rx + m.position * DPI;
        marksSvg += `<line x1="${lx}" y1="${ry}" x2="${lx}" y2="${ry + rH}" stroke="${markCol}" stroke-width="0.8" stroke-dasharray="4,3"/>`;
        if (m.label) marksSvg += `<text x="${lx}" y="${ry - 4}" font-family="'IBM Plex Mono',monospace" font-size="7" fill="${markCol}" text-anchor="middle">${m.label}</text>`;
      }
    } else if (m.type === 'pleat') {
      // Two symmetric fold lines around center
      const lx1 = rx + (m.center - m.intake) * DPI;
      const lx2 = rx + (m.center + m.intake) * DPI;
      const lxC = rx + m.center * DPI;
      marksSvg += `<line x1="${lx1}" y1="${ry}" x2="${lx1}" y2="${ry + rH}" stroke="${markCol}" stroke-width="0.8" stroke-dasharray="4,3"/>`;
      marksSvg += `<line x1="${lx2}" y1="${ry}" x2="${lx2}" y2="${ry + rH}" stroke="${markCol}" stroke-width="0.8" stroke-dasharray="4,3"/>`;
      // Center reference
      marksSvg += `<line x1="${lxC}" y1="${ry}" x2="${lxC}" y2="${ry + rH}" stroke="${markCol}" stroke-width="0.4" stroke-dasharray="2,4"/>`;
      // Arrows showing fold direction (pointing inward toward center)
      const arrowY = ry + rH * 0.15;
      const aw = 4, ah = 2.5;
      marksSvg += `<polygon points="${lx1 + aw},${arrowY} ${lx1},${arrowY - ah} ${lx1},${arrowY + ah}" fill="${markCol}"/>`;
      marksSvg += `<polygon points="${lx2 - aw},${arrowY} ${lx2},${arrowY - ah} ${lx2},${arrowY + ah}" fill="${markCol}"/>`;
      if (m.label) marksSvg += `<text x="${lxC}" y="${ry - 4}" font-family="'IBM Plex Mono',monospace" font-size="7" fill="${markCol}" text-anchor="middle">${m.label}</text>`;
    } else if (m.type === 'centerline') {
      if (m.axis === 'h') {
        marksSvg += `<line x1="${rx}" y1="${cy}" x2="${rx + rW}" y2="${cy}" stroke="#999" stroke-width="0.6" stroke-dasharray="8,6"/>`;
      } else {
        marksSvg += `<line x1="${cx}" y1="${ry}" x2="${cx}" y2="${ry + rH}" stroke="#999" stroke-width="0.6" stroke-dasharray="8,6"/>`;
      }
    }
  }

  // SA note at bottom
  const saNote = sa > 0
    ? `<text x="${cx}" y="${ry + rH + saOff + 12}" font-family="'IBM Plex Mono',monospace" font-size="8" fill="#444" text-anchor="middle">${fmtInches(sa)} SA included</text>`
    : '';

  return {
    wIn,
    hIn,
    svg: `<svg xmlns="http://www.w3.org/2000/svg"
        width="${wIn * DPI}" height="${hIn * DPI}"
        viewBox="0 0 ${wIn * DPI} ${hIn * DPI}">
      ${saRect}
      ${piece.id === 'coin-pocket'
        ? `<path d="${bottomRoundedPath(rx, ry, rW, rH, crInner)}" ${stitchStroke} fill="none"/>`
        : `<rect x="${rx}" y="${ry}" width="${rW}" height="${rH}" rx="${crInner}" ${stitchStroke} fill="none"/>`}
      ${marksSvg}
      ${piece.id === 'coin-pocket'
        ? `${drillMark(rx, ry)}${drillMark(rx + rW, ry)}
           <text x="${rx + 4}" y="${ry - 5}"
             font-family="'IBM Plex Mono',monospace" font-size="7" fill="${PKT_COL}">bar tack / rivet</text>`
        : ''}
      <text x="${cx}" y="${(M - 0.08) * DPI}"
        font-family="'IBM Plex Mono',monospace" font-size="${compact ? 10 : 14}" font-weight="700"
        fill="#2c2a26" text-anchor="middle">${name}</text>
      <text x="${cx}" y="${cy}"
        font-family="'IBM Plex Mono',monospace" font-size="${compact ? 9 : 12}"
        fill="#666" text-anchor="middle">${fmtInches(W)} \xd7 ${fmtInches(H)}</text>
      ${piece.instruction && W >= 3 ? `<text x="${cx}" y="${cy + (compact ? 12 : 16)}"
        font-family="'IBM Plex Mono',monospace" font-size="${compact ? 8 : 10}"
        fill="#666" text-anchor="middle">${piece.instruction}</text>` : ''}
      ${saNote}
    </svg>`,
  };
}

/**
 * Render a vinyl/template piece (bone outlines etc.) at 1:1 scale.
 * Returns { svg, wIn, hIn }.
 */
function renderTemplateSVG(piece, { compact = false } = {}) {
  const { polygon, width, height, name } = piece;
  if (!polygon || !polygon.length) return null;

  const xs = polygon.map(p => p.x), ys = polygon.map(p => p.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const pW = maxX - minX, pH = maxY - minY;

  const M = compact ? 0.3 : MARGIN;
  const wIn = M + pW + M;
  const hIn = M + pH + M;
  const ox = M - minX, oy = M - minY;

  // Build path in DPI units — use svgPath (compound with holes) if available
  let d;
  if (piece.svgPath) {
    d = piece.svgPath.replace(/([0-9.-]+)\s+([0-9.-]+)/g, (_, xStr, yStr) => {
      return `${((ox + parseFloat(xStr)) * DPI).toFixed(1)} ${((oy + parseFloat(yStr)) * DPI).toFixed(1)}`;
    });
  } else {
    d = `M ${((ox + polygon[0].x) * DPI).toFixed(1)} ${((oy + polygon[0].y) * DPI).toFixed(1)}`;
    for (let i = 1; i < polygon.length; i++) {
      d += ` L ${((ox + polygon[i].x) * DPI).toFixed(1)} ${((oy + polygon[i].y) * DPI).toFixed(1)}`;
    }
    d += ' Z';
  }

  const cx = (M + pW / 2) * DPI;

  return {
    wIn,
    hIn,
    svg: `<svg xmlns="http://www.w3.org/2000/svg"
        width="${wIn * DPI}" height="${hIn * DPI}"
        viewBox="0 0 ${wIn * DPI} ${hIn * DPI}">
      <path d="${d}" fill="#2c2a26" fill-rule="evenodd" stroke="#2c2a26" stroke-width="1"/>
      <text x="${cx}" y="${(M - 0.08) * DPI}"
        font-family="'IBM Plex Mono',monospace" font-size="${compact ? 10 : 14}" font-weight="700"
        fill="#2c2a26" text-anchor="middle">${name}</text>
      <text x="${cx}" y="${(M + pH / 2) * DPI}"
        font-family="'IBM Plex Mono',monospace" font-size="${compact ? 9 : 12}"
        fill="#fff" text-anchor="middle">${fmtInches(pW)} \xd7 ${fmtInches(pH)}</text>
      ${!compact && piece.instruction ? `<text x="${cx}" y="${(M + pH + 0.3) * DPI}"
        font-family="'IBM Plex Mono',monospace" font-size="9"
        fill="#666" text-anchor="middle">${piece.instruction}</text>` : ''}
    </svg>`,
  };
}

// ── Registration crosshair ─────────────────────────────────────────────────

function crosshair(x, y, size = 14, label = '', alignLabel = false) {
  const lbl = label
    ? `<text x="${x + size + 3}" y="${y - size - 2}"
        font-family="'IBM Plex Mono',monospace" font-size="8" font-weight="700"
        fill="#000">${label}</text>`
    : '';
  const aLbl = alignLabel
    ? `<text x="${x + size + 3}" y="${y + size + 10}"
        font-family="'IBM Plex Mono',monospace" font-size="7.5"
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
    // ✂ scissors icon pointing downward along vertical cut line
    shapes += `<text x="${cx}" y="${yS + 16}"
      font-family="serif" font-size="13" fill="#000"
      text-anchor="middle"
      transform="rotate(270,${cx},${yS + 16})">\u2702</text>`;
    // "cut here" label rotated along line
    shapes += `<text
      font-family="'IBM Plex Mono',monospace" font-size="7.5" fill="#000"
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
    // ✂ scissors icon pointing rightward along horizontal cut line
    shapes += `<text x="${xS + 16}" y="${cy - 3}"
      font-family="serif" font-size="13" fill="#000"
      text-anchor="middle"
      transform="rotate(180,${xS + 16},${cy - 3})">\u2702</text>`;
    // "cut here" label
    shapes += `<text x="${midX}" y="${cy - 4}"
      font-family="'IBM Plex Mono',monospace" font-size="7.5" fill="#000"
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
        font-family="'IBM Plex Mono',monospace" font-size="8" text-anchor="middle"
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

function computeTileLayout(wIn, hIn, piece, PW, PH, OV, renderMargin) {
  const TX_p = PW - 2 * SM - OV, TY_p = PH - 2 * SM - OV;
  const TX_l = PH - 2 * SM - OV, TY_l = PW - 2 * SM - OV;

  // Tile count: each tile's clip area is TX+OV wide, so the first tile covers OV
  // more than subsequent strides.  Also trim trailing MARGIN padding (no drawn
  // content there) so we don't generate tiles that only show empty margin.
  function tileCnt(span, stride) {
    const content = Math.max(stride, span - MARGIN);   // trim trailing margin
    return Math.max(1, Math.ceil((content - OV) / stride));
  }
  const pages_p = tileCnt(wIn, TX_p) * tileCnt(hIn, TY_p);
  const pages_l = tileCnt(wIn, TX_l) * tileCnt(hIn, TY_l);
  // Panel pieces (pants, shorts) are always taller than wide — force portrait so
  // tiles cover more of the long dimension per row and assembly is intuitive.
  // Tiebreak: if both orientations use the same page count, prefer landscape for
  // pieces that are wider than tall (e.g. yokes, cuffs) so the long axis spans
  // the page width and assembly is easier.
  const landscape = piece.type !== 'panel' && (pages_l < pages_p || (pages_l === pages_p && wIn > hIn));
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
  let cols = tileCnt(effectiveW, TX);
  let rows = tileCnt(hIn, TY);

  // Margin-trim optimization: if the actual drawn content (SA polygon) fits in
  // one fewer column/row, reduce the tile count and shift content to fit.
  // This prevents wasteful sliver tiles caused by generous MARGIN padding.
  let marginTrimX = 0, marginTrimY = 0;
  if (renderMargin !== undefined) {
    const sa_val = piece.sa || 0.625;
    if (cols > 1) {
      const contentW = effectiveW - 2 * renderMargin + 2 * sa_val;
      const reducedCoverage = (cols - 1) * TX + OV;
      if (contentW <= reducedCoverage) {
        cols--;
        marginTrimX = Math.max(0, renderMargin - sa_val);
      }
    }
    if (rows > 1) {
      const contentH = hIn - 2 * renderMargin + 2 * sa_val;
      const reducedCoverage = (rows - 1) * TY + OV;
      if (contentH <= reducedCoverage) {
        rows--;
        marginTrimY = Math.max(0, renderMargin - sa_val);
      }
    }
  }

  return { landscape, tPW, tPH, TX, TY, cols, rows, shiftX, effectiveW, marginTrimX, marginTrimY };
}

// ── Piece renderer dispatch ────────────────────────────────────────────────

/** Render any piece to { svg, wIn, hIn }. Returns null for unknown types. */
function renderPiece(piece) {
  if      (piece.type === 'panel')                              return renderPanelSVG(piece);
  else if (piece.type === 'bodice' || piece.type === 'sleeve')  return renderBodiceOrSleeveSVG(piece);
  else if (piece.type === 'rectangle')                          return renderRectSVG(piece);
  else if (piece.type === 'pocket')                             return renderPocketSVG(piece);
  else if (piece.type === 'template')                           return renderTemplateSVG(piece);
  return null;
}

/**
 * Render a small piece compactly for bin-packing onto shared pages.
 * - Rectangles (waistbands): fold in half along the length, print half with fold line
 * - Pockets: render with tight 0.3″ margins instead of 1.5″
 * Returns null for piece types that shouldn't be bin-packed (panels, bodice, sleeve).
 */
function renderPieceCompact(piece) {
  if (piece.type === 'rectangle') {
    // Waistbands and neckbands are symmetric — fold in half to save paper
    const isWaistband = piece.id === 'waistband' || piece.id === 'neckband';
    return renderRectSVG(piece, { compact: true, fold: isWaistband });
  }
  if (piece.type === 'pocket') {
    return renderPocketSVG(piece, { compact: true });
  }
  if (piece.type === 'template') {
    return renderTemplateSVG(piece, { compact: true });
  }
  return null;
}

// ── Tile page builder ──────────────────────────────────────────────────────

function buildTilePages(piece, pieceIdx, totalPieces, PW, PH, OV) {
  const rendered = renderPiece(piece);
  if (!rendered) return '';

  const { svg, wIn, hIn } = rendered;

  // Fix 3: choose orientation, Fix 2: seam avoidance
  const layout = computeTileLayout(wIn, hIn, piece, PW, PH, OV, MARGIN);
  const { landscape, tPW, tPH, TX, TY, cols, rows, shiftX, effectiveW, marginTrimX, marginTrimY } = layout;

  let pages = '';

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Skip tiles with negligible visible content (< 0.1″ in either dimension)
      const tileL = col * TX, tileR = tileL + (tPW - 2 * SM);
      const tileT = row * TY, tileB = tileT + (tPH - 2 * SM);
      const visW = Math.max(0, Math.min(effectiveW, tileR) - Math.max(0, tileL));
      const visH = Math.max(0, Math.min(hIn, tileB) - Math.max(0, tileT));
      if (visW < 0.1 || visH < 0.1) continue;

      // Compute base tile offsets (negative = scroll piece into view)
      // marginTrimX/Y shift content to reclaim padding space and avoid sliver tiles
      let offsetX = -(col * TX * DPI) + shiftX * DPI - marginTrimX * DPI;
      let offsetY = -(row * TY * DPI) - marginTrimY * DPI;

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
        ${(col === 0 && row === 0) ? `<svg xmlns="http://www.w3.org/2000/svg"
          style="position:absolute;bottom:${SM + 0.15}in;right:${SM + 0.15}in;width:1.4in;height:1.4in;
                 pointer-events:none;z-index:12;overflow:visible">
          <rect x="4" y="4" width="${DPI}" height="${DPI}" fill="none" stroke="#000" stroke-width="1"/>
          <line x1="4" y1="${4 + DPI / 2}" x2="${4 + DPI}" y2="${4 + DPI / 2}" stroke="#000" stroke-width="0.4" stroke-dasharray="3,3"/>
          <line x1="${4 + DPI / 2}" y1="4" x2="${4 + DPI / 2}" y2="${4 + DPI}" stroke="#000" stroke-width="0.4" stroke-dasharray="3,3"/>
          <text x="${4 + DPI / 2}" y="${4 + DPI + 12}" font-family="'IBM Plex Mono',monospace" font-size="8" fill="#000" text-anchor="middle">1 inch = 1 inch</text>
        </svg>` : ''}
        <div class="tile-footer">
          <span class="tf-name">${piece.name} · tile ${tileId} of ${gridLabel} pages</span>
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
    const sheetLabel = pages.length > 1 ? ` · sheet ${pi + 1} of ${pages.length}` : '';
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
  const GAP = 5, PAD = 10;
  const SVG_W = 660;
  const COL_GAP = 40;

  // Landscape cells are wider than tall; portrait cells are taller than wide
  const P_CELL_W = 36, P_CELL_H = 22;  // portrait
  const L_CELL_W = 46, L_CELL_H = 16;  // landscape

  const xmlEsc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  function pieceDims(piece) {
    if (piece.type === 'panel') {
      const sa = piece.sa || 0.5;
      return { wIn: (piece.ext || 0) + MARGIN + piece.width + sa + MARGIN, hIn: MARGIN + (piece.cbRaise || 0) + piece.height + MARGIN };
    }
    if (piece.type === 'bodice' || piece.type === 'sleeve') {
      const xs = piece.polygon.map(p => p.x), ys = piece.polygon.map(p => p.y);
      return { wIn: MARGIN + (Math.max(...xs) - Math.min(...xs)) + MARGIN, hIn: MARGIN + (Math.max(...ys) - Math.min(...ys)) + MARGIN };
    }
    if (piece.type === 'rectangle') {
      const fullLen = piece.dimensions.length;
      const fullWid = piece.dimensions.width;
      const isFold = /on fold/i.test(piece.instruction || '');
      const halfLen = isFold ? fullLen / 2 : fullLen;
      const isRotated = halfLen > fullWid;
      const W = isRotated ? fullWid : halfLen;
      const H = isRotated ? halfLen : fullWid;
      return { wIn: MARGIN + W + MARGIN, hIn: MARGIN + H + MARGIN };
    }
    if (piece.dimensions) {
      const d = piece.dimensions;
      return { wIn: MARGIN + (d.length ?? d.width) + MARGIN, hIn: MARGIN + (d.height ?? d.width) + MARGIN };
    }
    return null;
  }

  // Classify pieces into tiled (large) and bin-packed (small)
  const tiledEntries = [];
  const smallNames = [];
  for (const piece of pieces) {
    const dims = pieceDims(piece);
    if (!dims) continue;
    const compactRendered = renderPieceCompact(piece);
    if (compactRendered) {
      const layout = computeTileLayout(compactRendered.wIn, compactRendered.hIn, piece, PW, PH, OV);
      if (layout.cols === 1 && layout.rows === 1) {
        smallNames.push(piece.name);
        continue;
      }
    }
    tiledEntries.push({ piece, dims });
  }

  // Build display list: tiled pieces + one "Small Pieces" group
  const displayList = tiledEntries.map(({ piece, dims }) => {
    const layout = computeTileLayout(dims.wIn, dims.hIn, piece, PW, PH, OV, MARGIN);
    return { name: piece.name, landscape: layout.landscape, cols: layout.cols, rows: layout.rows };
  });
  if (smallNames.length > 0) {
    displayList.push({ name: 'Small Pieces', landscape: false, cols: 1, rows: 1, smallNames });
  }

  const n = displayList.length;
  const numCols = n >= 7 ? 3 : n >= 4 ? 2 : 1;
  const perCol = Math.ceil(n / numCols);

  let items = '';
  let maxH = 0;

  for (let ci = 0; ci < numCols; ci++) {
    const col = displayList.slice(ci * perCol, (ci + 1) * perCol);
    const xOff = PAD + ci * ((SVG_W - PAD * 2) / numCols + (ci > 0 ? 0 : 0));
    const colXOff = PAD + ci * ((SVG_W - PAD * 2 - COL_GAP * (numCols - 1)) / numCols + COL_GAP);
    let y = PAD;

    for (const entry of col) {
      const { name, landscape, cols, rows, smallNames: sn } = entry;
      const total = rows * cols;
      const cellW = landscape ? L_CELL_W : P_CELL_W;
      const cellH = landscape ? L_CELL_H : P_CELL_H;
      const orientLabel = landscape ? 'landscape' : 'portrait';
      const countLabel = sn
        ? `${sn.length} pieces \xb7 bin-packed`
        : `${rows}\xd7${cols} = ${total} pg \xb7 ${orientLabel}`;

      items += `\n<text x="${colXOff}" y="${y + 12}" font-family="'IBM Plex Mono',monospace" font-size="10" font-weight="600" fill="#2c2a26">${xmlEsc(name)}</text>`;
      items += `\n<text x="${colXOff}" y="${y + 23}" font-family="'IBM Plex Mono',monospace" font-size="9" fill="#666">${countLabel}</text>`;

      y += 28;

      if (sn) {
        // Small pieces group — show a single cell with piece count
        const bx = colXOff, by = y;
        items += `\n<rect x="${bx}" y="${by}" width="${cellW * 2}" height="${cellH}" rx="2" fill="#f0ead6" stroke="#555" stroke-width="0.7"/>`;
        items += `\n<text x="${bx + cellW}" y="${by + 12}" font-family="'IBM Plex Mono',monospace" font-size="8" fill="#444" text-anchor="middle">${sn.length} pcs</text>`;
        y += cellH + GAP;
        // List piece names below in small text
        for (const sName of sn) {
          items += `\n<text x="${colXOff + 6}" y="${y + 8}" font-family="'IBM Plex Mono',monospace" font-size="8" fill="#666">\u2022 ${xmlEsc(sName)}</text>`;
          y += 11;
        }
      } else {
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const cx = colXOff + c * (cellW + GAP);
            const cy = y + r * (cellH + GAP);
            const fill = landscape
              ? ((r + c) % 2 === 0 ? '#e8f0f8' : '#dce8f4')
              : ((r + c) % 2 === 0 ? '#f0eeea' : '#e8e4dd');
            items += `\n<rect x="${cx}" y="${cy}" width="${cellW}" height="${cellH}" rx="2" fill="${fill}" stroke="#bbb" stroke-width="0.7"/>`;
            items += `\n<text x="${cx + cellW / 2}" y="${cy + (cellH / 2 + 4)}" font-family="'IBM Plex Mono',monospace" font-size="8" fill="#666" text-anchor="middle">${r + 1}-${c + 1}</text>`;
          }
        }
        y += rows * (cellH + GAP);
      }

      y += 14;
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
      <div class="cover-sub">Sewing Pattern \xb7 Print at 100% \xb7 Do not scale to fit</div>
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
          <li>Print at <strong>100% scale</strong>. Never select \u201cfit to page\u201d or \u201cshrink to margins.\u201d</li>
          <li>Verify the 2\xd72 inch and 5\xd75 cm squares on page 2 measure exactly right.</li>
          <li>Assemble in the order shown on the tile map (page 2).</li>
          <li>Cut along the \u2702 scissors line at the left/top edge of each overlap tile to remove the shaded overlap strip.</li>
          <li>Align the \u2295 crosshairs on the trimmed tile with the matching crosshairs on the adjacent tile. Matching letters (e.g.\u202fA1\u202f\u2192\u202fA1) confirm correct placement.</li>
          <li>Tape tiles together. Check the 1\u2033 ruler strip to confirm scale before taping.</li>
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
      <h3 class="sect-head">Print Accuracy: Measure before cutting any fabric</h3>
      <p class="note">If either square is wrong, check that your printer scale is set to 100%.</p>
      <div class="sq-row">
        <div class="sq-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="${sq2px}" height="${sq2px}"
              viewBox="0 0 ${sq2px} ${sq2px}" style="display:block">
            <rect x="1" y="1" width="${sq2px - 2}" height="${sq2px - 2}"
              fill="none" stroke="#2c2a26" stroke-width="1.5" data-scale-check="2in"/>
            <line x1="${sq2px / 2}" y1="1" x2="${sq2px / 2}" y2="${sq2px - 1}"
              stroke="#ccc" stroke-width="0.7"/>
            <line x1="1" y1="${sq2px / 2}" x2="${sq2px - 1}" y2="${sq2px / 2}"
              stroke="#ccc" stroke-width="0.7"/>
          </svg>
          <div class="sq-label">Must measure exactly 2 \xd7 2 inches</div>
        </div>
        ${scaleSVG(sq5px, 'Must measure exactly 5 \xd7 5 cm')}
      </div>
    </div>
    <div class="map-sect">
      <h3 class="sect-head">Tile Assembly Map</h3>
      <p class="note">Each cell = one printed page. Label = row-col (e.g.\u202f2-3\u202f= row 2, col 3). Assemble left-to-right, top-to-bottom. Blue cells = landscape. \u2022 Cut along the \u2702 scissors line at each overlap edge. \u2022 Slide trimmed tile until the \u2295 crosshairs match the adjacent tile (same letter = same point). \u2022 Tape tiles together.</p>
      ${buildTileMapSVG(pieces, PW, PH, OV)}
    </div>
  </div>`;
}

function buildMaterialsPage(materials, instructions) {
  const fabricRows = (materials.fabrics || []).map(f =>
    `<tr><td>${f.name}</td><td>${f.weight || ''}</td><td>${expandGlossaryPrint(f.notes || '')}</td></tr>`
  ).join('');

  const notionRows = (materials.notions || []).map(n =>
    `<tr><td>${n.name}</td><td>${n.quantity || ''}</td><td>${expandGlossaryPrint(n.notes || '')}</td></tr>`
  ).join('');

  const stitchRows = (materials.stitches || []).map(s =>
    `<tr><td>${s.name}</td><td>${s.length || ''}</td><td>${s.width !== '0' ? (s.width || 'n/a') : 'n/a'}</td><td>${expandGlossaryPrint(s.use || '')}</td></tr>`
  ).join('');

  const notesHtml = materials.notes?.length
    ? `<div class="mat-notes">
        <h3 class="sect-head" style="margin-top:1em">Important Notes</h3>
        <ul>${materials.notes.map(n => `<li>${expandGlossaryPrint(n)}</li>`).join('')}</ul>
       </div>`
    : '';

  const threadHtml = materials.thread
    ? `<tr><td>Thread</td><td>${materials.thread.name || ''} ${materials.thread.weight ? '(' + materials.thread.weight + ')' : ''} · ${expandGlossaryPrint(materials.thread.notes || '')}</td></tr>`
    : '';
  const needleHtml = materials.needle
    ? `<tr><td>Needle</td><td>${materials.needle.name || ''} · ${expandGlossaryPrint(materials.needle.use || '')}</td></tr>`
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

/**
 * Build a standalone glossary page.
 * Separated from the materials page so it never overflows into the materials
 * page bottom margin. Returns empty string when no glossary terms are in use.
 */
function buildGlossaryPage(materials, instructions) {
  const terms = usedGlossaryTerms(instructions, materials);
  if (!terms.length) return '';
  return `<div class="page mat-page">
    <h2 class="page-head">Glossary</h2>
    <div class="gl-grid">${terms.map(t =>
      `<div class="gl-entry"><b class="gl">${t.term}</b> <span class="gl-def">${t.def}</span></div>`
    ).join('')}</div>
  </div>`;
}

/** Replace {term} markers with bold text for print */
function expandGlossaryPrint(text) {
  if (!text) return text;
  return text.replace(/\{([^}]+)\}/g, (_, term) => {
    if (GLOSSARY[term]) return `<b class="gl">${term}</b>`;
    return term;
  });
}

/** Collect glossary terms actually used in instructions and materials */
function usedGlossaryTerms(instructions, materials) {
  let text = (instructions || []).map(s => s.detail || '').join(' ');
  if (materials) {
    text += ' ' + (materials.notes || []).join(' ');
    text += ' ' + (materials.fabrics || []).map(f => f.notes || '').join(' ');
    text += ' ' + (materials.notions || []).map(n => n.notes || '').join(' ');
    text += ' ' + (materials.stitches || []).map(s => s.use || '').join(' ');
    text += ' ' + (materials.thread?.notes || '');
    text += ' ' + (materials.needle?.use || '');
  }
  const used = [];
  for (const [term, def] of Object.entries(GLOSSARY)) {
    if (text.includes(`{${term}}`)) used.push({ term, def });
  }
  return used;
}

function buildInstructionsPage(instructions, PH) {
  const PAD = 0.5;            // top + bottom padding on .instr-page
  const HEAD_H = 0.55;        // heading + note on first page
  const CONT_HEAD_H = 0.35;   // heading only on continuation pages
  const STEP_GAP = 0.14;      // gap between steps
  const CHARS_PER_LINE = 78;  // ~chars fitting in detail column at 10pt monospace (6.94in / ~0.089in/char)
  const LINE_H = 0.215;       // 10pt * 1.55 line-height = 10/72 * 1.55 ≈ 0.215in
  const TITLE_H = 0.2;        // title line height
  const SAFETY = 0.2;         // safety buffer against font-metric rounding differences

  function estimateStepHeight(s) {
    const detailLines = Math.ceil((s.detail || '').length / CHARS_PER_LINE) || 1;
    return TITLE_H + detailLines * LINE_H + STEP_GAP;
  }

  const allSteps = instructions || [];
  const pages = [];
  let cur = [];
  let usedH = 0;
  let availH = PH - PAD * 2 - HEAD_H - SAFETY;

  for (const s of allSteps) {
    const h = estimateStepHeight(s);
    if (cur.length > 0 && usedH + h > availH) {
      pages.push(cur);
      cur = [];
      usedH = 0;
      availH = PH - PAD * 2 - CONT_HEAD_H - SAFETY;
    }
    cur.push(s);
    usedH += h;
  }
  if (cur.length > 0) pages.push(cur);

  return pages.map((steps, i) => {
    const stepsHtml = steps.map(s =>
      `<div class="step">
        <div class="step-n">${s.step}</div>
        <div class="step-b">
          <div class="step-t">${s.title}</div>
          <div class="step-d">${expandGlossaryPrint(s.detail)}</div>
        </div>
      </div>`
    ).join('');
    const heading = i === 0 ? 'Construction Order' : "Construction Order (cont'd)";
    const note = i === 0
      ? '<p class="note" style="margin-bottom:0.2in">Read all steps before starting. Press every seam.</p>'
      : '';
    return `<div class="page instr-page">
      <h2 class="page-head">${heading}</h2>
      ${note}
      <div class="steps">${stepsHtml}</div>
    </div>`;
  }).join('');
}

// ── Tabloid combined preamble (11×17, two pages) ──────────────────────────

/**
 * For tabloid paper, collapse the 4 preamble pages into 2:
 *   Page 1 — Cover, scale verification, tile assembly map
 *   Page 2 — Materials, stitch guide, construction steps
 */
function buildTabloidPreamble(garment, pieces, materials, instructions, measurements, opts, PW, PH, OV) {
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
    `<tr><td>${n.name}</td><td>${n.quantity || ''}</td><td>${n.notes || ''}</td></tr>`
  ).join('');
  const stitchRows = (materials.stitches || []).map(s =>
    `<tr><td>${s.name}</td><td>${s.length || ''}</td><td>${s.width !== '0' ? (s.width || '\u2014') : '\u2014'}</td><td>${s.use || ''}</td></tr>`
  ).join('');
  const stepsHtml = (instructions || []).map(s =>
    `<div class="step">
      <div class="step-n">${s.step}</div>
      <div class="step-b">
        <div class="step-t">${s.title}</div>
        <div class="step-d">${s.detail}</div>
      </div>
    </div>`
  ).join('');
  const threadHtml = materials.thread
    ? `<tr><td>Thread</td><td>${materials.thread.name || ''} ${materials.thread.weight ? '(' + materials.thread.weight + ')' : ''} \u2014 ${materials.thread.notes || ''}</td></tr>`
    : '';
  const needleHtml = materials.needle
    ? `<tr><td>Needle</td><td>${materials.needle.name || ''} \u2014 ${materials.needle.use || ''}</td></tr>`
    : '';
  const notesHtml = materials.notes?.length
    ? `<div class="mat-notes">
        <h3 class="sect-head" style="margin-top:0.18in">Important Notes</h3>
        <ul>${materials.notes.map(n => `<li>${n}</li>`).join('')}</ul>
       </div>`
    : '';

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

  // ── Page 1: Cover & Scale ──
  const page1 = `<div class="page tb-preamble" style="width:${PW}in;height:${PH}in">
    <div class="tb-header">
      <div class="tb-brand">People\u2019s Patterns</div>
      <div class="tb-title">${garment.name}</div>
      <div class="tb-sub">Sewing Pattern \u2014 Print at 100% \xb7 Do not scale to fit \xb7 Drafted ${date}</div>
    </div>
    <div class="tb-body">
      <div class="tb-col">
        <h3 class="sect-head">Body Measurements</h3>
        <table class="ptable"><tbody>${measRows}</tbody></table>
        <h3 class="sect-head" style="margin-top:0.24in">Pattern Options</h3>
        <table class="ptable"><tbody>${optRows}</tbody></table>
        <h3 class="sect-head" style="margin-top:0.24in">How to Assemble</h3>
        <ol class="tb-howto">
          <li>Print at <strong>100% scale</strong> \u2014 never \u201cfit to page\u201d or \u201cshrink to margins\u201d</li>
          <li>Verify the 2\xd72 in and 5\xd75 cm squares at right measure exactly right</li>
          <li>Assemble tiles in the order shown in the map at right</li>
          <li>Cut along the \u2702 scissors line at each overlap edge</li>
          <li>Align \u2295 crosshairs \u2014 matching labels (e.g.\u202fA1\u202f\u2192\u202fA1) confirm placement</li>
          <li>Tape from the back; check the 1\u2033 ruler strip before taping</li>
        </ol>
      </div>
      <div class="tb-col">
        <h3 class="sect-head">Scale Verification \u2014 Measure before cutting fabric</h3>
        <div class="sq-row" style="justify-content:flex-start;gap:0.5in;margin:0.1in 0 0.24in">
          ${scaleSVG(sq2px, 'Must be exactly 2 \xd7 2 in')}
          ${scaleSVG(sq5px, 'Must be exactly 5 \xd7 5 cm')}
        </div>
        <h3 class="sect-head">Tile Assembly Map</h3>
        <p class="note" style="margin-bottom:0.1in">Each cell = one printed sheet. Label = row-col. Assemble left-to-right, top-to-bottom.</p>
        ${buildTileMapSVG(pieces, PW, PH, OV)}
      </div>
    </div>
    <div class="tb-foot">Drafted ${date} \xb7 People\u2019s Patterns \xb7 peoplespatterns.com \xb7 @peoplespatterns</div>
  </div>`;

  // ── Page 2: Materials & Construction ──
  const page2 = `<div class="page tb-preamble" style="width:${PW}in;min-height:${PH}in;height:auto;overflow:visible">
    <h2 class="tb-page-head">Materials &amp; Construction Order</h2>
    <div class="tb-body">
      <div class="tb-col">
        <h3 class="sect-head">Fabric Options</h3>
        <table class="ptable">
          <thead><tr><th>Fabric</th><th>Weight</th><th>Notes</th></tr></thead>
          <tbody>${fabricRows}</tbody>
        </table>
        <h3 class="sect-head" style="margin-top:0.2in">Notions</h3>
        <table class="ptable">
          <thead><tr><th>Item</th><th>Qty</th><th>Notes</th></tr></thead>
          <tbody>${notionRows}</tbody>
        </table>
        <h3 class="sect-head" style="margin-top:0.2in">Thread &amp; Needle</h3>
        <table class="ptable">
          <tbody>${threadHtml}${needleHtml}</tbody>
        </table>
        ${notesHtml}
      </div>
      <div class="tb-col">
        <h3 class="sect-head">Stitch Settings</h3>
        <table class="ptable">
          <thead><tr><th>Stitch</th><th>Length</th><th>Width</th><th>Use</th></tr></thead>
          <tbody>${stitchRows}</tbody>
        </table>
        <h3 class="sect-head" style="margin-top:0.24in">Construction Order</h3>
        <p class="note" style="margin-bottom:0.12in">Read all steps before starting. Press every seam.</p>
        <div class="steps">${stepsHtml}</div>
      </div>
    </div>
  </div>`;

  return page1 + page2;
}

// ── Projector layout (single-layer pieces, no tiling) ─────────────────────

/**
 * Build a projector-friendly layout: one page per piece at 1:1 scale,
 * no tile overlaps, no crosshairs, no scissors marks. A calibration
 * page comes first so the user can verify their projector scale.
 */
function buildProjectorLayout(garment, pieces, materials, instructions, measurements, opts) {
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const PAD = 1; // padding around each piece in inches

  // ── Calibration page (fixed 40×30 in canvas) ──
  const calW = 40, calH = 30;
  const sq4  = 4 * DPI;  // 4″ calibration square
  const sq10 = (10 / 2.54) * DPI; // 10 cm calibration square
  const gridSpacing = DPI; // 1-inch grid
  let gridLines = '';
  for (let x = gridSpacing; x < calW * DPI; x += gridSpacing) {
    gridLines += `<line x1="${x}" y1="0" x2="${x}" y2="${calH * DPI}" stroke="#e8e6e0" stroke-width="0.5"/>`;
  }
  for (let y = gridSpacing; y < calH * DPI; y += gridSpacing) {
    gridLines += `<line x1="0" y1="${y}" x2="${calW * DPI}" y2="${y}" stroke="#e8e6e0" stroke-width="0.5"/>`;
  }

  const calPage = `<div class="page pj-page" style="width:${calW}in;height:${calH}in">
    <svg xmlns="http://www.w3.org/2000/svg" width="${calW * DPI}" height="${calH * DPI}"
         viewBox="0 0 ${calW * DPI} ${calH * DPI}" style="position:absolute;top:0;left:0">
      ${gridLines}
    </svg>
    <div class="pj-cal">
      <div class="pj-header">
        <div class="pj-brand">People\u2019s Patterns</div>
        <div class="pj-title">${garment.name}</div>
        <div class="pj-sub">Projector File \u2014 Drafted ${date}</div>
      </div>
      <div class="pj-cal-body">
        <h3 class="sect-head">Projector Calibration</h3>
        <p class="note">Place your cutting mat under the projector. Verify both squares measure correctly before cutting fabric.</p>
        <div class="sq-row" style="justify-content:flex-start;gap:0.8in;margin:0.3in 0">
          <div class="sq-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="${sq4}" height="${sq4}"
                viewBox="0 0 ${sq4} ${sq4}" style="display:block">
              <rect x="1" y="1" width="${sq4 - 2}" height="${sq4 - 2}"
                fill="none" stroke="#2c2a26" stroke-width="2"/>
              <line x1="${sq4 / 2}" y1="1" x2="${sq4 / 2}" y2="${sq4 - 1}" stroke="#ccc" stroke-width="0.7"/>
              <line x1="1" y1="${sq4 / 2}" x2="${sq4 - 1}" y2="${sq4 / 2}" stroke="#ccc" stroke-width="0.7"/>
            </svg>
            <div style="font-size:11pt;color:#555;margin-top:8px;text-align:center">Must be exactly 4 \xd7 4 inches</div>
          </div>
          <div class="sq-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="${sq10}" height="${sq10}"
                viewBox="0 0 ${sq10} ${sq10}" style="display:block">
              <rect x="1" y="1" width="${sq10 - 2}" height="${sq10 - 2}"
                fill="none" stroke="#2c2a26" stroke-width="2"/>
              <line x1="${sq10 / 2}" y1="1" x2="${sq10 / 2}" y2="${sq10 - 1}" stroke="#ccc" stroke-width="0.7"/>
              <line x1="1" y1="${sq10 / 2}" x2="${sq10 - 1}" y2="${sq10 / 2}" stroke="#ccc" stroke-width="0.7"/>
            </svg>
            <div style="font-size:11pt;color:#555;margin-top:8px;text-align:center">Must be exactly 10 \xd7 10 cm</div>
          </div>
        </div>
        <p class="note" style="margin-top:0.2in">Advance to the next page once calibration is confirmed. Each piece is on its own page at 1:1 scale.</p>
      </div>
    </div>
  </div>`;

  // ── One page per piece ──
  const piecePages = [];
  for (const piece of pieces) {
    const rendered = renderPiece(piece);
    if (!rendered) continue;
    const { svg, wIn, hIn } = rendered;
    const pageW = wIn + 2 * PAD;
    const pageH = hIn + 2 * PAD;

    piecePages.push(`<div class="page pj-page" style="width:${pageW}in;height:${pageH}in">
      <div style="position:absolute;left:${PAD}in;top:${PAD}in;width:${wIn}in;height:${hIn}in">
        ${svg}
      </div>
      <div class="pj-piece-footer">
        <span class="tf-name">${piece.name}${piece.cutCount ? ' \xd7 ' + piece.cutCount : ''}</span>
        <span class="tf-brand">People\u2019s Patterns \xb7 ${garment.name}</span>
      </div>
    </div>`);
  }

  return calPage + piecePages.join('');
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
    `<tr><td>${f.name}</td><td>${f.weight || ''}</td><td>${expandGlossaryPrint(f.notes || '')}</td></tr>`
  ).join('');
  const notionRows = (materials.notions || []).map(n =>
    `<tr><td>${n.name}</td><td>${n.quantity || ''}</td></tr>`
  ).join('');
  const stitchRows = (materials.stitches || []).map(s =>
    `<tr><td>${s.name}</td><td>${s.length || ''}</td><td>${expandGlossaryPrint(s.use || '')}</td></tr>`
  ).join('');
  const stepsHtml = (instructions || []).map(s =>
    `<div class="lf-step">
      <div class="lf-step-n">${s.step}</div>
      <div><div class="lf-step-t">${s.title}</div>
      <div class="lf-step-d">${expandGlossaryPrint(s.detail)}</div></div>
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
      <div style="font-size:10pt;color:#444;margin-top:6px;text-align:center">${label}</div>
    </div>`;
  }

  return `<div class="page lf-preamble" style="width:${PW}in;height:${PH}in">
    <div class="lf-header">
      <div class="lf-brand">People\u2019s Patterns</div>
      <div class="lf-garment-title">${garment.name}</div>
      <div class="lf-sub">Sewing Pattern \xb7 Print at 100% \xb7 Do not scale to fit \xb7 Drafted ${date}</div>
    </div>
    <div class="lf-body">
      <div class="lf-col">
        <h3 class="sect-head">Body Measurements</h3>
        <table class="ptable"><tbody>${measRows}</tbody></table>
        <h3 class="sect-head" style="margin-top:0.28in">Pattern Options</h3>
        <table class="ptable"><tbody>${optRows}</tbody></table>
        <h3 class="sect-head" style="margin-top:0.28in">How to Assemble</h3>
        <ol class="lf-howto">
          <li>Print at <strong>100% scale</strong>. Never select \u201cfit to page\u201d or \u201cshrink to margins.\u201d</li>
          <li>Verify the 2\xd72 in and 5\xd75 cm squares below measure exactly right.</li>
          <li>Assemble tiles in the order shown in the map at right.</li>
          <li>Cut along the \u2702 scissors line at each overlap edge.</li>
          <li>Align \u2295 crosshairs. Matching labels (e.g.\u202fA1\u202f\u2192\u202fA1) confirm placement.</li>
          <li>Tape tiles together. Check the 1\u2033 ruler strip before taping.</li>
        </ol>
        <h3 class="sect-head" style="margin-top:0.28in">Scale Verification: Measure before cutting fabric</h3>
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
  color:#777; letter-spacing:0.04em;
}
.cover-title {
  font-size:34pt; font-weight:700; color:#2c2a26;
  border-bottom:2px solid #2c2a26; padding-bottom:0.18in; margin-top:-0.18in;
}
.cover-sub { font-size:10pt; color:#666; }
.cover-cols { display:flex; gap:0.5in; }
.cover-col { flex:1; }
.cover-how ol { padding-left:1.2em; font-size:9.5pt; line-height:1.9; color:#444; }
.cover-how strong { color:#c44; }
.cover-foot {
  position:absolute; bottom:0.35in; left:1in;
  font-size:10pt; color:#666;
}

/* ── Scale page ── */
.scale-page { padding:0.5in; }
.print-note {
  font-size:9.5pt; color:#444; background:#f5f3ef;
  border:0.5px solid #d0ccc4; border-radius:3px;
  padding:0.1in 0.15in; margin-bottom:0.18in; line-height:1.5;
}
.scale-sect { margin-bottom:0.25in; }
.sq-row { display:flex; gap:0.6in; align-items:flex-start; justify-content:center; margin:0.12in 0 0; }
.sq-item { text-align:center; }
.sq-label { font-size:10pt; color:#444; margin-top:0.1in; }

/* ── Materials ── */
.mat-page { padding:0.5in; height:auto !important; min-height:${PH}in; overflow:visible !important; }
.two-col { display:flex; gap:0.4in; margin-top:0.1in; }
.two-col > div { flex:1; }
.mat-notes ul { padding-left:1.1em; font-size:9.5pt; line-height:1.75; color:#444; columns:2; column-gap:0.35in; }
.mat-notes li { break-inside:avoid; }

/* ── Instructions ── */
.instr-page { padding:0.5in; height:auto !important; min-height:${PH}in; overflow:visible !important; }
.steps { display:flex; flex-direction:column; gap:0.14in; }
.step { display:flex; gap:0.16in; align-items:flex-start; break-inside:avoid; }
.step-n {
  font-size:20pt; font-weight:700; color:#e0ddd8;
  min-width:0.4in; text-align:right; line-height:1; padding-top:0.02in;
}
.step-b { flex:1; }
.step-t { font-size:10pt; font-weight:700; color:#2c2a26; margin-bottom:0.03in; }
.step-d { font-size:10pt; color:#444; line-height:1.55; }
b.gl { font-weight:600; color:#2c2a26; }
.print-glossary { margin-top:0.3in; border-top:0.5px solid #e0e0e0; padding-top:0.15in; break-inside:avoid; }
.gl-grid { columns:2; column-gap:0.4in; font-size:9pt; line-height:1.6; }
.gl-entry { break-inside:avoid; margin-bottom:0.04in; }
.ptable { break-inside:avoid; }
.gl-def { color:#666; }

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
.tf-name { font-size:10pt; font-weight:700; color:#2c2a26; }
.tf-brand { font-size:10pt; color:#666; }
.tf-info { font-size:10pt; color:#777; }

/* ── Shared ── */
.page-head {
  font-size:15pt; font-weight:700; color:#2c2a26;
  border-bottom:1.5px solid #2c2a26;
  padding-bottom:0.08in; margin-bottom:0.2in;
}
.sect-head {
  font-size:10pt; text-transform:uppercase; letter-spacing:0.06em;
  color:#777; margin-bottom:0.09in;
}
.note { font-size:10pt; color:#666; margin-bottom:0.08in; }
.ptable { width:100%; border-collapse:collapse; font-size:9.5pt; }
.ptable th {
  text-align:left; border-bottom:1px solid #ddd;
  padding:3px 5px; font-weight:600; color:#777;
}
.ptable td { border-bottom:0.5px solid #f0f0f0; padding:3px 5px; vertical-align:top; }

/* ── Large-format preamble ── */
.lf-preamble { padding:0.6in 0.7in 0.4in; }
.lf-header { border-bottom:2px solid #2c2a26; padding-bottom:0.18in; margin-bottom:0.28in; }
.lf-brand { font-family:'Fraunces',serif; font-size:11pt; font-weight:300; color:#777; letter-spacing:0.04em; }
.lf-garment-title { font-size:28pt; font-weight:700; color:#2c2a26; margin-top:0.06in; }
.lf-sub { font-size:10pt; color:#666; margin-top:0.04in; }
.lf-body { display:flex; gap:0.7in; }
.lf-col { flex:1; min-width:0; }
.lf-howto { padding-left:1.2em; font-size:10pt; line-height:1.85; color:#444; }
.lf-howto strong { color:#c44; }
.lf-steps { display:flex; flex-direction:column; gap:0.13in; }
.lf-step { display:flex; gap:0.15in; align-items:flex-start; }
.lf-step-n { font-size:18pt; font-weight:700; color:#e0ddd8; min-width:0.38in; text-align:right; line-height:1; padding-top:0.02in; flex-shrink:0; }
.lf-step-t { font-size:10pt; font-weight:700; color:#2c2a26; margin-bottom:0.03in; }
.lf-step-d { font-size:10pt; color:#444; line-height:1.5; }

/* ── Tabloid preamble (11×17 two-page layout) ── */
.tb-preamble   { padding:0.6in 0.65in 0.4in; }
.tb-header     { border-bottom:2px solid #2c2a26; padding-bottom:0.16in; margin-bottom:0.24in; }
.tb-brand      { font-family:'Fraunces',serif; font-size:11pt; font-weight:300; color:#aaa; letter-spacing:0.04em; }
.tb-title      { font-size:30pt; font-weight:700; color:#2c2a26; margin-top:0.06in; }
.tb-sub        { font-size:9.5pt; color:#999; margin-top:0.04in; }
.tb-body       { display:flex; gap:0.5in; }
.tb-col        { flex:1; min-width:0; }
.tb-howto      { padding-left:1.2em; font-size:9pt; line-height:1.85; color:#444; }
.tb-howto strong { color:#c44; }
.tb-page-head  { font-size:14pt; font-weight:700; color:#2c2a26; border-bottom:1.5px solid #2c2a26; padding-bottom:0.08in; margin-bottom:0.2in; }
.tb-foot       { position:absolute; bottom:0.35in; left:0.65in; font-size:8pt; color:#bbb; }

/* ── Projector layout ── */
.pj-page       { background:#fff; position:relative; overflow:hidden; margin:0 auto 0.35in; page-break-after:always; break-after:page; }
.pj-cal        { position:relative; padding:1in; z-index:1; }
.pj-header     { border-bottom:2px solid #2c2a26; padding-bottom:0.18in; margin-bottom:0.3in; }
.pj-brand      { font-family:'Fraunces',serif; font-size:13pt; font-weight:300; color:#aaa; letter-spacing:0.04em; }
.pj-title      { font-size:34pt; font-weight:700; color:#2c2a26; margin-top:0.06in; }
.pj-sub        { font-size:10pt; color:#999; margin-top:0.04in; }
.pj-cal-body   { max-width:20in; }
.pj-piece-footer {
  position:absolute; bottom:0.3in; left:0.5in; right:0.5in;
  display:flex; justify-content:space-between; align-items:baseline;
  font-size:9pt; z-index:20;
}

@media print {
  body { background:#fff; }
  .page { margin:0; box-shadow:none; }
}
`;
}

// ── Graded (multi-size) layout for Etsy ───────────────────────────────────

/**
 * Build a cover page for a graded (multi-size) pattern.
 * Shows a size chart table instead of individual measurements.
 */
function buildGradedCoverPage(garment, sizeChart, opts, redemptionCode) {
  const measKeys = garment.measurements;

  // Size chart header row
  const thCells = measKeys.map(id => {
    const def = MEASUREMENTS[id];
    return `<th>${def ? def.label : id}</th>`;
  }).join('');

  // Size chart body rows
  const sizeRows = sizeChart.map((row, i) => {
    const style = SIZE_LINE_STYLES[i] || SIZE_LINE_STYLES[0];
    const cells = measKeys.map(key => {
      const val = key === 'chest' && row.bust !== undefined ? (row.bust ?? row.chest) : row[key];
      return `<td>${val !== undefined ? fmtInches(val) : '-'}</td>`;
    }).join('');
    return `<tr><td><strong>${row.label}</strong> (US ${row.us})</td>${cells}<td>${style.label}</td></tr>`;
  }).join('');

  const optRows = Object.entries(opts).map(([k, v]) => {
    const label = k.replace(/([A-Z])/g, ' $1').trim();
    return `<tr><td>${label}</td><td>${v}</td></tr>`;
  }).join('');

  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const redeemHtml = redemptionCode
    ? `<div class="cover-redeem">
        <strong>FREE custom-fit upgrade!</strong> Visit
        <a href="https://peoplespatterns.com/redeem">peoplespatterns.com/redeem</a>
        and enter code: <strong>${redemptionCode}</strong>
        to get this pattern drafted to YOUR exact body measurements.
      </div>`
    : '';

  return `<div class="page cover-page">
    <div class="cover-body">
      <div class="cover-brand">People\u2019s Patterns</div>
      <div class="cover-title">${garment.name}</div>
      <div class="cover-sub">Sewing Pattern \xb7 Sizes ${sizeChart[0].label}\u2013${sizeChart[sizeChart.length - 1].label} \xb7 Print at 100% \xb7 Do not scale to fit</div>
      <div>
        <h3 class="sect-head">Size Chart (Body Measurements)</h3>
        <table class="ptable">
          <thead><tr><th>Size</th>${thCells}<th>Line style</th></tr></thead>
          <tbody>${sizeRows}</tbody>
        </table>
      </div>
      <div class="cover-cols" style="margin-top:0.15in">
        <div class="cover-col">
          <h3 class="sect-head">Pattern Options</h3>
          <table class="ptable">
            <thead><tr><th>Option</th><th>Setting</th></tr></thead>
            <tbody>${optRows}</tbody>
          </table>
        </div>
        <div class="cover-col">
          <h3 class="sect-head">How to Assemble</h3>
          <ol style="font-size:9pt;line-height:1.7;color:#444;padding-left:1.2em">
            <li>Print at <strong>100% scale</strong></li>
            <li>Verify the scale squares on page 2</li>
            <li>Each size uses a different line style (see chart above)</li>
            <li>Identify your size, cut along that line style</li>
            <li>Assemble tiles per the tile map on page 2</li>
          </ol>
        </div>
      </div>
      ${redeemHtml}
    </div>
    <div class="cover-foot">Drafted ${date} \xb7 People\u2019s Patterns \xb7 peoplespatterns.com \xb7 @peoplespatterns</div>
  </div>`;
}

/**
 * Compute the cut-line polygon path for a piece, offset within a shared
 * coordinate system.  Works for panel, bodice, sleeve, rectangle, and pocket types.
 *
 * Returns { cutD, stitchD, wIn, hIn, ox, oy, piece } where cutD and stitchD
 * are SVG path `d` strings, and ox/oy are the piece-local origin offsets.
 */
function extractPiecePaths(piece) {
  if (piece.type === 'panel') {
    const { polygon, saPolygon, width, height, ext, sa } = piece;
    const mL = ext + MARGIN, mT = MARGIN;
    const mR = (sa || 0.5) + MARGIN, mB = MARGIN;
    const wIn = mL + width + mR, hIn = mT + height + mB;
    const ox = mL, oy = mT;
    return {
      cutD: polyPath(polygon, ox, oy),
      stitchD: polyPath(saPolygon, ox, oy),
      wIn, hIn, ox, oy, piece,
    };
  }
  if (piece.type === 'bodice' || piece.type === 'sleeve') {
    const { polygon, sa = 0.5 } = piece;
    const xs = polygon.map(p => p.x), ys = polygon.map(p => p.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const pW = maxX - minX, pH = maxY - minY;
    const wIn = MARGIN + pW + MARGIN, hIn = MARGIN + pH + MARGIN;
    const ox = MARGIN - minX, oy = MARGIN - minY;
    const cutOnFold = piece.type !== 'sleeve' && piece.isCutOnFold !== false;
    const ea = piece.edgeAllowances;
    const saPoints = offsetPolygon(polygon, (i, a, b) => {
      if (ea && ea[i]) return -ea[i].sa;
      if (cutOnFold && Math.abs(a.x - minX) < 0.01 && Math.abs(b.x - minX) < 0.01) return 0;
      return -sa;
    });
    function pts2d(pts) {
      let d = `M ${(ox + pts[0].x) * DPI} ${(oy + pts[0].y) * DPI}`;
      for (let i = 1; i < pts.length; i++) d += ` L ${(ox + pts[i].x) * DPI} ${(oy + pts[i].y) * DPI}`;
      return d + ' Z';
    }
    return { cutD: pts2d(polygon), stitchD: pts2d(saPoints), wIn, hIn, ox, oy, piece };
  }
  if (piece.type === 'rectangle') {
    const { dimensions, sa } = piece;
    const W = dimensions.length, H = dimensions.width;
    const wIn = MARGIN + W + MARGIN, hIn = MARGIN + H + MARGIN;
    const rx = MARGIN * DPI, ry = MARGIN * DPI;
    const rW = W * DPI, rH = H * DPI;
    const saOff = (sa || 0.625) * DPI;
    // Cut line = SA rect, stitch line = inner rect
    const cutD = `M ${rx - saOff} ${ry - saOff} h ${rW + saOff * 2} v ${rH + saOff * 2} h ${-(rW + saOff * 2)} Z`;
    const stitchD = `M ${rx} ${ry} h ${rW} v ${rH} h ${-rW} Z`;
    return { cutD, stitchD, wIn, hIn, ox: MARGIN, oy: MARGIN, piece };
  }
  if (piece.type === 'pocket') {
    const { dimensions } = piece;
    const W = dimensions.length ?? dimensions.width;
    const H = dimensions.height ?? dimensions.width;
    const wIn = MARGIN + W + MARGIN, hIn = MARGIN + H + MARGIN;
    const rx = MARGIN * DPI, ry = MARGIN * DPI;
    const rW = W * DPI, rH = H * DPI;
    const cutD = `M ${rx} ${ry} h ${rW} v ${rH} h ${-rW} Z`;
    return { cutD, stitchD: cutD, wIn, hIn, ox: MARGIN, oy: MARGIN, piece };
  }
  if (piece.type === 'template') {
    const { polygon } = piece;
    if (!polygon || !polygon.length) return null;
    const xs = polygon.map(p => p.x), ys = polygon.map(p => p.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const pW = maxX - minX, pH = maxY - minY;
    const wIn = MARGIN + pW + MARGIN, hIn = MARGIN + pH + MARGIN;
    const ox = MARGIN - minX, oy = MARGIN - minY;
    let cutD = `M ${((ox + polygon[0].x) * DPI).toFixed(1)} ${((oy + polygon[0].y) * DPI).toFixed(1)}`;
    for (let i = 1; i < polygon.length; i++) cutD += ` L ${((ox + polygon[i].x) * DPI).toFixed(1)} ${((oy + polygon[i].y) * DPI).toFixed(1)}`;
    cutD += ' Z';
    return { cutD, stitchD: cutD, wIn, hIn, ox, oy, piece };
  }
  return null;
}

/**
 * Render a single piece at all graded sizes, overlaid on the same SVG.
 *
 * Strategy: render the LARGEST size fully (annotations, grainlines, text,
 * notches) using the standard renderer. Then for each size, extract just the
 * cut-line and stitch-line polygons and draw them with a distinct stroke style.
 * A size label is placed at the top-right of each cut path.
 *
 * Returns { svg, wIn, hIn } using the largest size as the bounding box.
 */
function renderGradedPieceSVG(piecesPerSize) {
  // Render the largest size fully for annotations
  const largest = piecesPerSize[piecesPerSize.length - 1];
  if (!largest) return null;
  const baseSVG = renderPiece(largest);
  if (!baseSVG) return null;

  const wIn = baseSVG.wIn;
  const hIn = baseSVG.hIn;

  // Extract the inner content of the base SVG (strip outer <svg> tags)
  const baseContent = baseSVG.svg
    .replace(/<svg[^>]*>/, '')
    .replace(/<\/svg>\s*$/, '');

  // Build graded overlay paths for each size
  let gradedPaths = '';
  for (let si = 0; si < piecesPerSize.length; si++) {
    const piece = piecesPerSize[si];
    if (!piece) continue;

    const paths = extractPiecePaths(piece);
    if (!paths) continue;

    const style = SIZE_LINE_STYLES[si] || SIZE_LINE_STYLES[0];
    const dashAttr = style.dash ? ` stroke-dasharray="${style.dash}"` : '';

    // Cut line for this size
    gradedPaths += `<path d="${paths.cutD}" stroke="#000" stroke-width="1.5" fill="none"${dashAttr}/>`;

    // Size label at top-right of the piece bounding box
    const labelX = paths.wIn * DPI - MARGIN * DPI;
    const labelY = MARGIN * DPI * 0.6;
    const sizeChart = piecesPerSize._sizeChart;
    const label = sizeChart ? sizeChart[si]?.label : `S${si}`;
    gradedPaths += `<text x="${labelX}" y="${labelY}"
      font-family="'IBM Plex Mono',monospace" font-size="9" font-weight="600"
      fill="#000" text-anchor="end">${label}</text>`;
  }

  return {
    wIn,
    hIn,
    svg: `<svg xmlns="http://www.w3.org/2000/svg"
        width="${wIn * DPI}" height="${hIn * DPI}"
        viewBox="0 0 ${wIn * DPI} ${hIn * DPI}">
      ${gradedPaths}
      ${baseContent}
    </svg>`,
  };
}

/**
 * Build tile pages for a graded piece (all sizes overlaid).
 * Uses the same tiling logic as single-size but with graded SVG.
 */
function buildGradedTilePages(piecesPerSize, pieceIdx, totalPieces, PW, PH, OV) {
  // Use the largest size's piece for layout calculations
  const largest = piecesPerSize[piecesPerSize.length - 1];
  if (!largest) return '';

  const graded = renderGradedPieceSVG(piecesPerSize);
  if (!graded) return '';

  const { svg, wIn, hIn } = graded;

  const layout = computeTileLayout(wIn, hIn, largest, PW, PH, OV);
  const { landscape, tPW, tPH, TX, TY, cols, rows, shiftX, effectiveW } = layout;

  let pages = '';

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      let offsetX = -(col * TX * DPI) + shiftX * DPI;
      let offsetY = -(row * TY * DPI);

      if (cols === 1 && rows === 1) {
        const contentW = (tPW - 2 * SM) * DPI;
        const contentH = (tPH - 2 * SM) * DPI;
        offsetX = Math.max(0, Math.round((contentW - effectiveW * DPI) / 2));
        offsetY = Math.max(0, Math.round((contentH - hIn * DPI) / 2));
      }

      let overlapSvgs = '';
      if (col > 0) overlapSvgs += overlapZoneSVG('left', tPW, tPH, SM, OV);
      if (row > 0) overlapSvgs += overlapZoneSVG('top',  tPW, tPH, SM, OV);

      const rA   = String.fromCharCode(65 + row);
      const rB   = String.fromCharCode(65 + row + 1);
      const ovX  = px(SM + OV);
      const ovY  = px(SM + OV);
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
        ${(col === 0 && row === 0) ? `<svg xmlns="http://www.w3.org/2000/svg"
          style="position:absolute;bottom:${SM + 0.15}in;right:${SM + 0.15}in;width:1.4in;height:1.4in;
                 pointer-events:none;z-index:12;overflow:visible">
          <rect x="4" y="4" width="${DPI}" height="${DPI}" fill="none" stroke="#000" stroke-width="1"/>
          <line x1="4" y1="${4 + DPI / 2}" x2="${4 + DPI}" y2="${4 + DPI / 2}" stroke="#000" stroke-width="0.4" stroke-dasharray="3,3"/>
          <line x1="${4 + DPI / 2}" y1="4" x2="${4 + DPI / 2}" y2="${4 + DPI}" stroke="#000" stroke-width="0.4" stroke-dasharray="3,3"/>
          <text x="${4 + DPI / 2}" y="${4 + DPI + 12}" font-family="'IBM Plex Mono',monospace" font-size="7" fill="#000" text-anchor="middle">1 inch = 1 inch</text>
        </svg>` : ''}
        <div class="tile-footer">
          <span class="tf-name">${largest.name} \u2014 tile ${tileId} of ${gridLabel} pages</span>
          <span class="tf-brand">People\u2019s Patterns \xb7 peoplespatterns.com \xb7 @peoplespatterns</span>
          <span class="tf-info">piece ${pieceIdx + 1}/${totalPieces} \xb7 all sizes${orientTag} \xb7 \xbe\u2033 overlap</span>
        </div>
      </div>`;
    }
  }

  return pages;
}

// ── Projector layout ──────────────────────────────────────────────────────

/**
 * Build a projector-format layout: single custom-sized page with all pieces
 * at 1:1 scale, thick lines, calibration grid, no tiling.
 *
 * @param {Object} garment
 * @param {Array} pieces - output of garment.pieces(m, opts)
 * @param {Object} measurements
 * @param {Object} opts
 * @returns {string} Complete HTML document
 */
function buildProjectorPage(garment, pieces, measurements, opts, sizeLabel) {
  // Render all pieces and calculate total bounding box
  const renderedPieces = [];
  for (const p of pieces) {
    const rendered = renderPiece(p);
    if (!rendered) continue;
    renderedPieces.push({ piece: p, ...rendered });
  }

  if (renderedPieces.length === 0) return '';

  // Simple row layout: place pieces left-to-right, wrapping rows
  const GAP = 2; // inches between pieces
  const MARGIN_PROJ = 1; // 1 inch = ~2.5cm margin (industry standard min 2.5cm)
  const MAX_ROW_W = 80; // max row width in inches before wrapping

  let curX = MARGIN_PROJ, curY = MARGIN_PROJ, rowH = 0;
  const placed = [];

  for (const { piece, svg, wIn, hIn } of renderedPieces) {
    if (curX + wIn > MAX_ROW_W && curX > MARGIN_PROJ) {
      curX = MARGIN_PROJ;
      curY += rowH + GAP;
      rowH = 0;
    }
    placed.push({ piece, svg, wIn, hIn, x: curX, y: curY });
    curX += wIn + GAP;
    rowH = Math.max(rowH, hIn);
  }

  const totalW = Math.max(...placed.map(p => p.x + p.wIn)) + MARGIN_PROJ;
  const totalH = Math.max(...placed.map(p => p.y + p.hIn)) + MARGIN_PROJ;

  // Thicken all strokes for projector visibility (3pt cut, 1.5pt stitch)
  // Replace inline stroke-width values in each piece's SVG
  const pieceSvgs = placed.map(({ svg, wIn, hIn, x, y }) => {
    const thickSvg = svg
      .replace(/stroke-width="1.5"/g, 'stroke-width="3"')    // cut lines: 1.5 -> 3pt
      .replace(/stroke-width="0.8"/g, 'stroke-width="1.5"')  // stitch/guide lines: 0.8 -> 1.5pt
      .replace(/stroke-width="0.6"/g, 'stroke-width="1.2"')  // fold/grain lines
      .replace(/font-size="8"/g,  'font-size="14"')           // labels larger for distance
      .replace(/font-size="10"/g, 'font-size="16"')
      .replace(/font-size="12"/g, 'font-size="18"')
      .replace(/font-size="14"/g, 'font-size="22"');
    return `<div style="position:absolute;left:${x * DPI}px;top:${y * DPI}px;
                 width:${wIn * DPI}px;height:${hIn * DPI}px">${thickSvg}</div>`;
  }).join('');

  // ── Calibration grid: dual-unit (4-inch + 10cm) ────────────────────────
  const gridSize4in = 4 * DPI;
  const gridSize10cm = (10 / 2.54) * DPI; // ~377.95 px
  const totalWpx = totalW * DPI;
  const totalHpx = totalH * DPI;

  let calibGrid = '';

  // 4-inch grid (light gray, dashed)
  for (let gx = 0; gx <= totalWpx; gx += gridSize4in) {
    calibGrid += `<line x1="${gx}" y1="0" x2="${gx}" y2="${totalHpx}" stroke="#ccc" stroke-width="0.3" stroke-dasharray="8,8"/>`;
  }
  for (let gy = 0; gy <= totalHpx; gy += gridSize4in) {
    calibGrid += `<line x1="0" y1="${gy}" x2="${totalWpx}" y2="${gy}" stroke="#ccc" stroke-width="0.3" stroke-dasharray="8,8"/>`;
  }

  // 10cm grid (light blue, dotted - distinct from inch grid)
  for (let gx = 0; gx <= totalWpx; gx += gridSize10cm) {
    calibGrid += `<line x1="${gx.toFixed(1)}" y1="0" x2="${gx.toFixed(1)}" y2="${totalHpx}" stroke="#aad" stroke-width="0.3" stroke-dasharray="3,6"/>`;
  }
  for (let gy = 0; gy <= totalHpx; gy += gridSize10cm) {
    calibGrid += `<line x1="0" y1="${gy.toFixed(1)}" x2="${totalWpx}" y2="${gy.toFixed(1)}" stroke="#aad" stroke-width="0.3" stroke-dasharray="3,6"/>`;
  }

  // Calibration square: 4 inches (industry standard)
  const calSq = 4 * DPI;
  const calX = 0.5 * DPI, calY = 0.5 * DPI;
  calibGrid += `<rect x="${calX}" y="${calY}" width="${calSq}" height="${calSq}" fill="none" stroke="#000" stroke-width="2.5"/>`;
  calibGrid += `<line x1="${calX}" y1="${calY + calSq / 2}" x2="${calX + calSq}" y2="${calY + calSq / 2}" stroke="#000" stroke-width="0.5" stroke-dasharray="4,4"/>`;
  calibGrid += `<line x1="${calX + calSq / 2}" y1="${calY}" x2="${calX + calSq / 2}" y2="${calY + calSq}" stroke="#000" stroke-width="0.5" stroke-dasharray="4,4"/>`;
  calibGrid += `<text x="${calX + calSq / 2}" y="${calY + calSq + 20}" font-family="'IBM Plex Mono',monospace" font-size="14" font-weight="600" fill="#000" text-anchor="middle">4" x 4" calibration square</text>`;

  // 10cm calibration square (next to the inch one)
  const cal10cm = gridSize10cm;
  const cal10X = calX + calSq + 0.5 * DPI;
  calibGrid += `<rect x="${cal10X}" y="${calY}" width="${cal10cm.toFixed(1)}" height="${cal10cm.toFixed(1)}" fill="none" stroke="#000" stroke-width="2.5"/>`;
  calibGrid += `<line x1="${cal10X}" y1="${calY + cal10cm / 2}" x2="${cal10X + cal10cm}" y2="${calY + cal10cm / 2}" stroke="#000" stroke-width="0.5" stroke-dasharray="4,4"/>`;
  calibGrid += `<line x1="${cal10X + cal10cm / 2}" y1="${calY}" x2="${cal10X + cal10cm / 2}" y2="${calY + cal10cm}" stroke="#000" stroke-width="0.5" stroke-dasharray="4,4"/>`;
  calibGrid += `<text x="${(cal10X + cal10cm / 2).toFixed(1)}" y="${(calY + cal10cm + 20).toFixed(1)}" font-family="'IBM Plex Mono',monospace" font-size="14" font-weight="600" fill="#000" text-anchor="middle">10 x 10 cm calibration square</text>`;

  // Grid legend (bottom-left)
  const legY = totalHpx - 40;
  calibGrid += `<text x="${MARGIN_PROJ * DPI}" y="${legY}" font-family="'IBM Plex Mono',monospace" font-size="11" fill="#999">Grid: gray dashed = 4" | blue dotted = 10 cm</text>`;

  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // NOTE: Cut-on-fold pieces are rendered as half-pieces with fold indicators,
  // matching the print layout. Full unfolding (mirroring the polygon) is a
  // future enhancement that requires engine-level polygon mirroring.

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${garment.name}${sizeLabel ? ` - Size ${sizeLabel}` : ''} \u2014 Projector Pattern</title>
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { background:#fff; }
.projector-page {
  width:${totalW}in; height:${totalH}in;
  position:relative; background:#fff;
}
.projector-pieces { position:absolute; top:0; left:0; width:100%; height:100%; z-index:2; }
.projector-grid {
  position:absolute; top:0; left:0;
  pointer-events:none; z-index:1;
}
.projector-header {
  position:absolute; top:0.3in; right:0.5in;
  font-family:'IBM Plex Mono',monospace; font-size:16pt;
  color:#888; z-index:5;
}
</style>
</head>
<body>
<div class="projector-page">
  <svg class="projector-grid" xmlns="http://www.w3.org/2000/svg"
       width="${totalWpx}" height="${totalHpx}"
       viewBox="0 0 ${totalWpx} ${totalHpx}">
    ${calibGrid}
  </svg>
  <div class="projector-pieces">
    ${pieceSvgs}
  </div>
  <div class="projector-header">
    ${garment.name}${sizeLabel ? ` \xb7 Size ${sizeLabel}` : ''} \xb7 People\u2019s Patterns \xb7 ${date}
  </div>
</div>
</body>
</html>`;
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
  const isProjector   = paperSize === 'projector';
  const isLargeFormat = !isProjector && PW >= 30; // A0/plotter — collapse preamble + nest small pieces
  const isTabloid = !isLargeFormat && !isProjector && PW >= 10 && PH >= 16; // tabloid (11×17) — 2-page preamble

  // ── Projector: completely different layout (no tiling, one piece per page) ──
  if (isProjector) {
    const body = buildProjectorLayout(garment, pieces, materials, instructions, measurements, opts);
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${garment.name} \u2014 Projector Pattern</title>
<style>${buildCSS(PW, PH)}</style>
</head>
<body>
${body}
</body>
</html>`;
  }

  // ── Preamble pages ──────────────────────────────────────────────────────
  const preamblePages = isLargeFormat
    ? buildLargeFormatPreamble(garment, pieces, materials, instructions, measurements, opts, PW, PH, OV)
    : isTabloid
    ? buildTabloidPreamble(garment, pieces, materials, instructions, measurements, opts, PW, PH, OV)
    : buildCoverPage(garment, measurements, opts)
    + buildScalePage(pieces, PW, PH, OV)
    + buildMaterialsPage(materials, instructions)
    + buildGlossaryPage(materials, instructions)
    + buildInstructionsPage(instructions, PH);

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
    // Separate pieces into large (multi-tile) and small (single-tile, bin-packable)
    const largePieces = [], smallQueue = [];
    for (const p of pieces) {
      // Try compact render first for small pieces (pockets, rectangles)
      const compactRendered = renderPieceCompact(p);
      if (compactRendered) {
        const layout = computeTileLayout(compactRendered.wIn, compactRendered.hIn, p, PW, PH, OV);
        if (layout.cols === 1 && layout.rows === 1) {
          smallQueue.push({ rendered: compactRendered, piece: p });
          continue;
        }
      }
      largePieces.push(p);
    }
    tilePages = largePieces.map((p, i) => buildTilePages(p, i, pieces.length, PW, PH, OV)).join('')
              + buildNestedSmallPages(smallQueue, PW, PH);
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${garment.name} | Printable Pattern (${size.label})</title>
<style>${buildCSS(PW, PH)}</style>
</head>
<body>
${preamblePages}
${tilePages}
</body>
</html>`;
}

/**
 * Generate a graded (multi-size) printable HTML document for Etsy listings.
 * All sizes are overlaid on the same pattern pieces with distinct line styles.
 *
 * @param {Object} gradingResult - output of gradeGarment() from grading.js
 * @param {Object} materials     - output of garment.materials(m, opts) (use middle size)
 * @param {Array}  instructions  - output of garment.instructions(m, opts)
 * @param {string} [paperSize]   - key from PAPER_SIZES, default 'letter'
 * @param {string} [redemptionCode] - optional code to print on cover page
 * @returns {string} Complete HTML document
 */
// DESIGN DECISION: Per-size files instead of toggleable PDF layers.
//
// Tiled print PDF: all sizes overlaid with distinct line styles (industry standard).
// Projector files: one file per size via generateGradedProjectorLayouts().
// Buyer downloads only the size they need for projecting.
//
// Toggleable PDF layers (OCG) would require cpdf ($300 license), PyMuPDF (AGPL),
// or reportlab (Python). Deferred until Etsy revenue justifies the investment.
// See memory: reference_pdf_layers.md for tool/cost details.
export function generateGradedPrintLayout(gradingResult, materials, instructions, paperSize = 'letter', redemptionCode) {
  const { sizeChart, gradedPieces, garment, opts } = gradingResult;
  const size = PAPER_SIZES[paperSize] || PAPER_SIZES.letter;
  const PW = size.w;
  const PH = size.h;
  const OV = 0.75;

  // Use the largest size's pieces for the tile map and materials page
  const largestPieces = gradedPieces[gradedPieces.length - 1].pieces;

  // Build preamble with graded cover page
  const preamblePages = buildGradedCoverPage(garment, sizeChart, opts, redemptionCode)
    + buildScalePage(largestPieces, PW, PH, OV)
    + buildMaterialsPage(materials)
    + buildGlossaryPage(materials, instructions)
    + buildInstructionsPage(instructions);

  // Build tile pages with all sizes overlaid
  // Group pieces by piece name/index across sizes
  const pieceCount = largestPieces.length;
  let tilePages = '';

  for (let pi = 0; pi < pieceCount; pi++) {
    const piecesPerSize = gradedPieces.map(gp => gp.pieces[pi]);
    // Attach size chart so renderGradedPieceSVG can read labels
    piecesPerSize._sizeChart = sizeChart;
    tilePages += buildGradedTilePages(piecesPerSize, pi, pieceCount, PW, PH, OV);
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${garment.name} \u2014 Graded Pattern ${sizeChart[0].label}\u2013${sizeChart[sizeChart.length - 1].label} (${size.label})</title>
<style>${buildCSS(PW, PH)}
.cover-redeem {
  margin-top:0.2in; padding:0.15in 0.2in;
  background:#f7f5f0; border:1px solid #e0ddd8; border-radius:4px;
  font-size:9pt; color:#555; line-height:1.6;
}
.cover-redeem strong { color:#2c2a26; }
.cover-redeem a { color:#2c2a26; }
</style>
</head>
<body>
${preamblePages}
${tilePages}
</body>
</html>`;
}

/**
 * Generate a projector-format HTML document for a single size.
 * Single custom-sized page, all pieces at 1:1, calibration grid, thick lines.
 *
 * For graded Etsy patterns: call this once per size to produce separate
 * projector files (e.g. "T-Shirt - Projector - Size M.pdf"). Buyers
 * download only the size they need.
 *
 * @param {Object} garment
 * @param {Array}  pieces - output of garment.pieces(m, opts) for one size
 * @param {Object} measurements
 * @param {Object} opts
 * @param {string} [sizeLabel] - e.g. "M (8-10)" for graded patterns
 * @returns {string} Complete HTML document
 */
export function generateProjectorLayout(garment, pieces, measurements, opts, sizeLabel) {
  return buildProjectorPage(garment, pieces, measurements, opts, sizeLabel);
}

/**
 * Generate projector files for ALL graded sizes.
 * Returns an array of { sizeLabel, html } objects, one per size.
 * Each html string is a complete projector-format document for that size.
 *
 * @param {Object} gradingResult - output of gradeGarment()
 * @returns {Array<{ sizeLabel: string, us: string, html: string }>}
 */
export function generateGradedProjectorLayouts(gradingResult) {
  const { sizeChart, gradedPieces, garment, opts } = gradingResult;
  return gradedPieces.map((gp, i) => ({
    sizeLabel: sizeChart[i].label,
    us: sizeChart[i].us,
    html: buildProjectorPage(garment, gp.pieces, gp.measurements, opts, `${sizeChart[i].label} (US ${sizeChart[i].us})`),
  }));
}

/**
 * Generate per-size tiled print layouts for ALL graded sizes.
 * Returns an array of { sizeLabel, html } objects, one per size.
 * Each is a complete tiled print document for that single size -
 * same format as generatePrintLayout() but with a size-specific cover page.
 *
 * Etsy download bundle includes these so sewists can print only their size
 * without wading through overlaid multi-size pieces.
 *
 * @param {Object} gradingResult - output of gradeGarment()
 * @param {string} [paperSize] - 'letter' or 'a4'
 * @param {string} [redemptionCode]
 * @returns {Array<{ sizeLabel: string, us: string, html: string }>}
 */
export function generateGradedTiledLayouts(gradingResult, paperSize = 'letter', redemptionCode) {
  const { sizeChart, gradedPieces, garment, opts } = gradingResult;
  return gradedPieces.map((gp, i) => {
    const materials    = garment.materials(gp.measurements, opts);
    const instructions = garment.instructions(gp.measurements, opts);
    const sizeLabel    = `${sizeChart[i].label} (US ${sizeChart[i].us})`;

    const size = PAPER_SIZES[paperSize] || PAPER_SIZES.letter;
    const PW = size.w, PH = size.h, OV = 0.75;

    // Single-size cover page with this size's measurements highlighted
    const measRows = garment.measurements.map(id => {
      const def = MEASUREMENTS[id];
      const val = gp.measurements[id];
      return `<tr><td>${def ? def.label : id}</td><td>${val !== undefined ? fmtInches(val) : '-'}</td></tr>`;
    }).join('');

    const optRows = Object.entries(opts).map(([k, v]) => {
      const label = k.replace(/([A-Z])/g, ' $1').trim();
      return `<tr><td>${label}</td><td>${v}</td></tr>`;
    }).join('');

    const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const redeemHtml = redemptionCode
      ? `<div class="cover-redeem">
          <strong>FREE custom-fit upgrade!</strong> Visit
          <a href="https://peoplespatterns.com/redeem">peoplespatterns.com/redeem</a>
          and enter code: <strong>${redemptionCode}</strong>
        </div>`
      : '';

    const coverPage = `<div class="page cover-page">
      <div class="cover-body">
        <div class="cover-brand">People\u2019s Patterns</div>
        <div class="cover-title">${garment.name} \u2014 Size ${sizeLabel}</div>
        <div class="cover-sub">Sewing Pattern \xb7 Print at 100% \xb7 Do not scale to fit</div>
        <div class="cover-cols">
          <div class="cover-col">
            <h3 class="sect-head">Body Measurements (Size ${sizeChart[i].label})</h3>
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
            <li>Cut along the \u2702 scissors line at each overlap edge</li>
            <li>Align \u2295 crosshairs, tape from the back</li>
          </ol>
        </div>
        ${redeemHtml}
      </div>
      <div class="cover-foot">Drafted ${date} \xb7 Size ${sizeLabel} \xb7 People\u2019s Patterns \xb7 peoplespatterns.com</div>
    </div>`;

    const preamble = coverPage
      + buildScalePage(gp.pieces, PW, PH, OV)
      + buildMaterialsPage(materials)
      + buildGlossaryPage(materials, instructions)
      + buildInstructionsPage(instructions);

    // Standard single-size tile pages
    const largePieces = [], smallQueue = [];
    for (const p of gp.pieces) {
      const compactRendered = renderPieceCompact(p);
      if (compactRendered) {
        const layout = computeTileLayout(compactRendered.wIn, compactRendered.hIn, p, PW, PH, OV);
        if (layout.cols === 1 && layout.rows === 1) {
          smallQueue.push({ rendered: compactRendered, piece: p });
          continue;
        }
      }
      largePieces.push(p);
    }
    const tilePages = largePieces.map((p, pi) => buildTilePages(p, pi, gp.pieces.length, PW, PH, OV)).join('')
      + buildNestedSmallPages(smallQueue, PW, PH);

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${garment.name} \u2014 Size ${sizeLabel} (${size.label})</title>
<style>${buildCSS(PW, PH)}
.cover-redeem {
  margin-top:0.2in; padding:0.15in 0.2in;
  background:#f7f5f0; border:1px solid #e0ddd8; border-radius:4px;
  font-size:9pt; color:#555; line-height:1.6;
}
.cover-redeem strong { color:#2c2a26; }
.cover-redeem a { color:#2c2a26; }
</style>
</head>
<body>
${preamble}
${tilePages}
</body>
</html>`;

    return { sizeLabel: sizeChart[i].label, us: sizeChart[i].us, html };
  });
}
