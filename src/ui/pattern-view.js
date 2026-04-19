// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * SVG renderer for pattern pieces.
 * Takes piece objects from garment modules, returns SVG strings.
 */

import { fmtInches, offsetPolygon } from '../engine/geometry.js';

const SC = 20; // 1 inch = 20 SVG units
const sc = i => i * SC;

/**
 * Compute the bounding-box center of a polygon (inch coords).
 * Bounding-box center is used instead of vertex average to avoid bias from
 * high-density bezier curves (e.g. crotch arch with 96 sample points skews
 * the average toward the crotch corner, causing wrong inward-normal selection).
 */
function polygonCentroid(poly) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of poly) {
    if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y;
  }
  return { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };
}

/**
 * For each notch in the notches array, snap its base to the nearest point on
 * saPolyInches and compute the outward-facing normal at that edge.
 * Returns SVG polygon elements: filled triangles with base on the cut line,
 * apex pointing outward (away from the polygon centroid).
 *
 * @param {Array<{x,y}>} saPolyInches  – SA polygon vertices in inches
 * @param {Array<{x,y}>} notches       – notch positions in inches
 * @param {number}       ox            – SVG x origin offset
 * @param {number}       oy            – SVG y origin offset
 */
function renderNotchesSVG(saPolyInches, notches, ox, oy) {
  if (!notches || !notches.length) return '';
  const centroid = polygonCentroid(saPolyInches);
  const n = saPolyInches.length;
  const TRI_H = 0.20;   // triangle height, inches
  const TRI_HW = 0.075; // triangle half-base-width, inches (total base = 0.15")
  let svg = '';

  for (const notch of notches) {
    // Find closest point on SA polygon boundary to the notch's intended position
    let bestDist = Infinity;
    let bestPx = 0, bestPy = 0;
    let bestNx = 0, bestNy = -1;

    for (let i = 0; i < n; i++) {
      const a = saPolyInches[i];
      const b = saPolyInches[(i + 1) % n];
      const edx = b.x - a.x, edy = b.y - a.y;
      const lenSq = edx * edx + edy * edy;
      if (lenSq < 1e-10) continue;

      // Project notch onto this edge segment, clamped to [0,1]
      let t = ((notch.x - a.x) * edx + (notch.y - a.y) * edy) / lenSq;
      t = Math.max(0, Math.min(1, t));
      const cpx = a.x + t * edx, cpy = a.y + t * edy;
      const dist = Math.sqrt((notch.x - cpx) ** 2 + (notch.y - cpy) ** 2);

      if (dist < bestDist) {
        bestDist = dist;
        bestPx = cpx;
        bestPy = cpy;

        // Edge length and unit direction
        const len = Math.sqrt(lenSq);
        const edux = edx / len, eduy = edy / len;

        // Two candidate normals (perpendicular to edge)
        const nx1 = eduy, ny1 = -edux;
        const nx2 = -eduy, ny2 = edux;

        // Pick the one pointing toward the polygon centroid (inward — standard for sewing pattern notches)
        const toCx = centroid.x - cpx, toCy = centroid.y - cpy;
        if (nx1 * toCx + ny1 * toCy >= 0) {
          bestNx = nx1; bestNy = ny1;
        } else {
          bestNx = nx2; bestNy = ny2;
        }
      }
    }

    // Convert base point to SVG coords
    const px = ox + sc(bestPx), py = oy + sc(bestPy);

    // Apex: base point + inward normal * triangle height (points into the piece)
    const apexX = px + sc(TRI_H) * bestNx;
    const apexY = py + sc(TRI_H) * bestNy;

    // Base corners: perpendicular to outward normal, centered on base point
    // Perpendicular of (bestNx, bestNy) is (-bestNy, bestNx) and (bestNy, -bestNx)
    const b1x = px + sc(TRI_HW) * (-bestNy), b1y = py + sc(TRI_HW) * bestNx;
    const b2x = px + sc(TRI_HW) * bestNy,   b2y = py + sc(TRI_HW) * (-bestNx);

    svg += `<polygon points="${b1x.toFixed(1)},${b1y.toFixed(1)} ${apexX.toFixed(1)},${apexY.toFixed(1)} ${b2x.toFixed(1)},${b2y.toFixed(1)}" fill="#2c2a26"/>`;
  }
  return svg;
}

/**
 * Build SVG text labels showing per-edge SA values along the cut line.
 * Groups consecutive edges with the same label into one annotation.
 */
function edgeSALabels(polygon, edgeAllowances, ox, oy) {
  if (!edgeAllowances || !edgeAllowances.length) return '';
  const n = polygon.length;
  let svg = '';
  let i = 0;
  while (i < n) {
    const { sa: saVal, label } = edgeAllowances[i];
    let j = i;
    while (j < n && edgeAllowances[j].label === label) j++;
    // Skip center seam and crotch edges — redundant with the bottom SA note
    if (label === 'Center' || label === 'Crotch') { i = j; continue; }
    // Skip fold edges and zero-length groups
    if (saVal > 0) {
      // Find the midpoint of the middle edge in this group
      const mid = Math.floor((i + j - 1) / 2);
      const a = polygon[mid], b = polygon[(mid + 1) % n];
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      const dx = b.x - a.x, dy = b.y - a.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len > 0.01) {
        // Normal pointing outward (CW winding: left of travel)
        const nx = -dy / len, ny = dx / len;
        const off = saVal * 0.5 + 0.15;
        const tx = ox + sc(mx + nx * off), ty = oy + sc(my + ny * off);
        let angle = Math.atan2(dy, dx) * 180 / Math.PI;
        if (angle > 90 || angle < -90) angle += 180;
        svg += `<text x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" font-family="IBM Plex Mono" font-size="7" fill="#999" text-anchor="middle" transform="rotate(${angle.toFixed(1)},${tx.toFixed(1)},${ty.toFixed(1)})">${fmtInches(saVal)}</text>`;
      }
    }
    i = j;
  }
  return svg;
}

/**
 * Render a grainline arrow: dashed line with solid arrowheads at both ends.
 * @param {number} gx    – SVG x center
 * @param {number} gy1   – SVG y top
 * @param {number} gy2   – SVG y bottom
 * @param {number} [labelY] – SVG y for label
 * @param {number} [angleDeg=0] – rotation in degrees (0 = vertical, 45 = bias)
 */
function grainlineSVG(gx, gy1, gy2, labelY = (gy1 + gy2) / 2, angleDeg = 0) {
  const ah = 5;  // arrowhead height
  const aw = 3;  // arrowhead half-width
  const mx = gx, my = (gy1 + gy2) / 2;
  const label = angleDeg === 45 ? 'BIAS' : 'GRAIN';
  if (angleDeg === 0) {
    return `<line x1="${gx}" y1="${gy1 + ah}" x2="${gx}" y2="${gy2 - ah}" stroke="#2c2a26" stroke-width="0.8" stroke-dasharray="8,4"/>
      <polygon points="${gx},${gy1} ${gx - aw},${gy1 + ah} ${gx + aw},${gy1 + ah}" fill="#2c2a26"/>
      <polygon points="${gx},${gy2} ${gx - aw},${gy2 - ah} ${gx + aw},${gy2 - ah}" fill="#2c2a26"/>
      <text x="${gx}" y="${labelY - 4}" font-family="IBM Plex Mono" font-size="7" fill="#2c2a26" text-anchor="middle">${label}</text>`;
  }
  // Rotated grainline: draw the same line + arrows, rotated around center
  return `<g transform="rotate(${angleDeg},${mx.toFixed(1)},${my.toFixed(1)})">
    <line x1="${gx}" y1="${gy1 + ah}" x2="${gx}" y2="${gy2 - ah}" stroke="#2c2a26" stroke-width="0.8" stroke-dasharray="8,4"/>
    <polygon points="${gx},${gy1} ${gx - aw},${gy1 + ah} ${gx + aw},${gy1 + ah}" fill="#2c2a26"/>
    <polygon points="${gx},${gy2} ${gx - aw},${gy2 - ah} ${gx + aw},${gy2 - ah}" fill="#2c2a26"/>
    <text x="${gx}" y="${labelY - 4}" font-family="IBM Plex Mono" font-size="7" fill="#2c2a26" text-anchor="middle">${label}</text>
  </g>`;
}

/**
 * Render a "PLACE ON FOLD" indicator along the fold edge.
 * Draws small arrows pointing toward the fold and centered text.
 * @param {number} fx  – SVG x of the fold edge
 * @param {number} fy1 – SVG y top of fold edge
 * @param {number} fy2 – SVG y bottom of fold edge
 */
function foldIndicatorSVG(fx, fy1, fy2) {
  const len = fy2 - fy1;
  const inset = len * 0.15;  // inset arrows from ends
  const aw = 4;  // arrow width (pointing left toward fold)
  const ah = 2.5;  // arrow half-height
  const arrowX = fx + 8;  // arrows sit slightly right of fold
  let svg = '';
  // Small arrows pointing left toward fold, evenly spaced
  const count = Math.max(2, Math.min(5, Math.floor(len / 30)));
  for (let i = 0; i < count; i++) {
    const ay = fy1 + inset + (len - 2 * inset) * i / (count - 1);
    svg += `<polygon points="${arrowX - aw},${ay} ${arrowX},${ay - ah} ${arrowX},${ay + ah}" fill="#b8963e"/>`;
  }
  // Text along fold edge
  const my = (fy1 + fy2) / 2;
  svg += `<text x="${fx + 5}" y="${my}" font-family="IBM Plex Mono" font-size="8" fill="#b8963e" text-anchor="middle" letter-spacing="2" transform="rotate(-90,${fx + 5},${my})">PLACE ON FOLD</text>`;
  // Dashed line along fold edge
  svg += `<line x1="${fx}" y1="${fy1}" x2="${fx}" y2="${fy2}" stroke="#b8963e" stroke-width="0.8" stroke-dasharray="4,3"/>`;
  return svg;
}

/**
 * Render a panel piece (front/back) as an SVG string
 */
export function renderPanelSVG(piece) {
  const { width, height, rise, inseam, ext, sa, hem, isBack, cbRaise,
          polygon, saPolygon, dimensions, labels, pleats = [], darts = [], notches = [], edgeAllowances, opts,
          crotchBezierSA, waistWidth = 0 } = piece;

  const mL = 3, mT = 3, mR = Math.max(5, ext + 3.5), mB = 6;
  const svgW = sc(mL + width + mR);
  const svgH = sc(mT + height + mB);
  const ox = sc(mL + ext);
  const oy = sc(mT);

  // Scale polygon to SVG coords
  function toSVG(pt) { return { x: ox + sc(pt.x), y: oy + sc(pt.y) }; }
  const svgPoly = polygon.map(toSVG);

  const svgSA = saPolygon.map(toSVG);

  function polyPath(pts) {
    let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
    for (let i = 1; i < pts.length; i++) d += ` L ${pts[i].x.toFixed(1)} ${pts[i].y.toFixed(1)}`;
    return d + ' Z';
  }

  // Dimensions
  let dimsSVG = '';
  for (const d of dimensions) {
    if (d.type === 'h') {
      const col = d.color || '#bbb';
      const x1 = ox + sc(d.x1), x2 = ox + sc(d.x2);
      // Hem-area dims (within 1″ of panel bottom): push below SA cut line + 0.5″ clearance
      const isHemDim = d.y1 > height - 1;
      const lineY = isHemDim ? oy + sc(height + hem + 0.5) : oy + sc(d.y1);
      const textY = isHemDim ? lineY + 14 : lineY - 4;
      if (d.color === '#c44') {
        // Crotch-ext: label below dim line, centered between endpoints
        // (was placed in left margin which clips when ext < 0.5")
        const labelX = (x1 + x2) / 2;
        dimsSVG += `<line x1="${x1}" y1="${lineY}" x2="${x2}" y2="${lineY}" stroke="${col}" stroke-width=".4"/>
        <line x1="${x1}" y1="${lineY-3}" x2="${x1}" y2="${lineY+3}" stroke="${col}" stroke-width=".4"/>
        <line x1="${x2}" y1="${lineY-3}" x2="${x2}" y2="${lineY+3}" stroke="${col}" stroke-width=".4"/>
        <text x="${labelX}" y="${lineY+14}" font-family="IBM Plex Mono" font-size="10" fill="${col}" text-anchor="middle" font-weight="500">${d.label}</text>`;
      } else if (d.color === '#b8963e' && !isHemDim) {
        // Knee/width accent dim: label to the right of the dim line to avoid grain line
        dimsSVG += `<line x1="${x1}" y1="${lineY}" x2="${x2}" y2="${lineY}" stroke="${col}" stroke-width=".4"/>
        <line x1="${x1}" y1="${lineY-3}" x2="${x1}" y2="${lineY+3}" stroke="${col}" stroke-width=".4"/>
        <line x1="${x2}" y1="${lineY-3}" x2="${x2}" y2="${lineY+3}" stroke="${col}" stroke-width=".4"/>
        <text x="${x2+5}" y="${textY}" font-family="IBM Plex Mono" font-size="12" fill="${col}" text-anchor="start" font-weight="500">${d.label}</text>`;
      } else {
        dimsSVG += `<line x1="${x1}" y1="${lineY}" x2="${x2}" y2="${lineY}" stroke="${col}" stroke-width=".4"/>
        <line x1="${x1}" y1="${lineY-3}" x2="${x1}" y2="${lineY+3}" stroke="${col}" stroke-width=".4"/>
        <line x1="${x2}" y1="${lineY-3}" x2="${x2}" y2="${lineY+3}" stroke="${col}" stroke-width=".4"/>
        <text x="${(x1+x2)/2}" y="${textY}" font-family="IBM Plex Mono" font-size="12" fill="#555" text-anchor="middle" font-weight="500">${d.label}</text>`;
      }
    } else if (d.type === 'v') {
      const col = d.color || '#bbb';
      const x = ox + sc(d.x), y1 = oy + sc(d.y1), y2 = oy + sc(d.y2), my = (y1+y2)/2;
      dimsSVG += `<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" stroke="${col}" stroke-width=".4"/>
        <line x1="${x-3}" y1="${y1}" x2="${x+3}" y2="${y1}" stroke="${col}" stroke-width=".4"/>
        <line x1="${x-3}" y1="${y2}" x2="${x+3}" y2="${y2}" stroke="${col}" stroke-width=".4"/>
        <text x="${x+14}" y="${my}" font-family="IBM Plex Mono" font-size="12" fill="#555" text-anchor="start" font-weight="500" transform="rotate(90,${x+14},${my})">${d.label}</text>`;
    }
  }

  // Labels — ensure they sit outside the SA cut line
  let labelsSVG = '';
  for (const l of labels) {
    let lx = l.x;
    // rotation > 0 → SIDE SEAM (right side); keep outside width + sa
    if (l.rotation > 0 && lx < width + sa + 0.3) lx = width + sa + 0.3;
    // rotation < 0 → CENTER (left side); keep outside -sa
    if (l.rotation < 0 && lx > -(sa + 0.3)) lx = -(sa + 0.3);
    const x = ox + sc(lx), y = oy + sc(l.y);
    labelsSVG += `<text x="${x}" y="${y}" font-family="IBM Plex Mono" font-size="9" fill="#b8963e" transform="rotate(${l.rotation},${x},${y})">${l.text}</text>`;
  }

  // Pocket indicators
  let pocketSVG = '';
  if (!isBack && (opts?.frontPocket === 'slant' || opts?.pockets === 'slant')) {
    // The front panel is now cut at the slash line (diagonal edge is part of the piece outline).
    // Show the pocket bag area as a dashed reference overlay.
    const slashX2 = ox + sc(width);         // side seam at slash exit
    const slashY2 = oy + sc(6);
    const bagL = ox + sc(width - 7);        // left edge of bag
    const bagB = oy + sc(11.5);             // bottom of bag
    pocketSVG += `<path d="M ${bagL} ${oy} L ${bagL} ${bagB} Q ${slashX2} ${bagB} ${slashX2} ${slashY2}" stroke="#8a4a4a" stroke-width=".6" stroke-dasharray="2,3" fill="none"/>
      <text x="${bagL + 2}" y="${(oy + sc(rise * 0.85)).toFixed(1)}" font-family="IBM Plex Mono" font-size="7" fill="#8a4a4a">pocket bag area</text>`;
  }
  if (!isBack && (opts?.frontPocket === 'side' || opts?.pockets === 'side')) {
    // Side-seam pocket: D-shaped bag extending inward from side seam.
    // Opening: 6.5″ along the side seam, starting 2″ below waist.
    const pTop = 2;
    const pBot = 2 + 6.5; // 8.5″ below waist
    const bagInset = 7; // bag extends 7″ inward from side seam

    // Interpolate the side seam (right edge) x coordinate at a given y.
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

    const sxTop = sideSeamXatY(pTop);
    const sxBot = sideSeamXatY(pBot);
    const col = '#8a4a4a';

    const txTop = ox + sc(sxTop), tyTop = oy + sc(pTop);
    const txBot = ox + sc(sxBot), tyBot = oy + sc(pBot);
    const bagL = ox + sc(sxTop - bagInset); // left edge of bag
    const midY = (tyTop + tyBot) / 2;

    // D-shaped bag outline: straight along side seam, curved inward
    pocketSVG += `<path d="M ${txTop.toFixed(1)} ${tyTop.toFixed(1)} L ${bagL.toFixed(1)} ${tyTop.toFixed(1)} Q ${(bagL - sc(1)).toFixed(1)} ${midY.toFixed(1)} ${bagL.toFixed(1)} ${tyBot.toFixed(1)} L ${txBot.toFixed(1)} ${tyBot.toFixed(1)}" stroke="${col}" stroke-width=".6" stroke-dasharray="2,3" fill="rgba(138,74,74,.03)"/>`;
    // Solid line along the pocket opening on the side seam
    pocketSVG += `<line x1="${txTop.toFixed(1)}" y1="${tyTop.toFixed(1)}" x2="${txBot.toFixed(1)}" y2="${tyBot.toFixed(1)}" stroke="${col}" stroke-width="1"/>`;
    // Label
    pocketSVG += `<text x="${(bagL + 2).toFixed(1)}" y="${(midY + 3).toFixed(1)}" font-family="IBM Plex Mono" font-size="7" fill="${col}">side pocket</text>`;
  }
  if (!isBack && (opts?.frontPocket === 'scoop' || opts?.frontPocket === 'square-scoop')) {
    // square-scoop clips at depth 4; curved scoop clips at depth 6
    const isSquareScoop = opts?.frontPocket === 'square-scoop';
    const scoopInset = 3.5;
    const scoopDepth = isSquareScoop ? 4 : 6;
    // Use waistWidth (x of waist side-seam vertex) not hipWidth for rivet x positions
    const wx = waistWidth || width;
    // Compute where the opening ends on the actual side seam (interpolated from hip vertex)
    const hipPt = polygon.reduce((best, pt) => pt.x > best.x ? pt : best, polygon[0]);
    const endX = hipPt.y > 0 ? wx + (hipPt.x - wx) * (scoopDepth / hipPt.y) : wx;
    const sx1 = ox + sc(wx - scoopInset), sy1 = oy;
    const sx2 = ox + sc(endX),            sy2 = oy + sc(scoopDepth);
    const col = '#8a4a4a';
    const dm = (x, y) =>
      `<line x1="${x-3}" y1="${y}" x2="${x+3}" y2="${y}" stroke="${col}" stroke-width=".8"/>` +
      `<line x1="${x}" y1="${y-3}" x2="${x}" y2="${y+3}" stroke="${col}" stroke-width=".8"/>`;
    pocketSVG += dm(sx1, sy1);
    pocketSVG += `<text x="${sx1+4}" y="${sy1+9}" font-family="IBM Plex Mono" font-size="7" fill="${col}">rivet</text>`;
    pocketSVG += dm(sx2, sy2);
    pocketSVG += `<text x="${sx2+4}" y="${sy2+4}" font-family="IBM Plex Mono" font-size="7" fill="${col}">rivet</text>`;
  }
  // Fly shield placement outline (front panel only — only garments that have a fly option)
  if (!isBack && opts?.fly) {
    const flyLen = Math.ceil(rise * 0.6);
    const col = '#8a4a4a';
    pocketSVG += `<rect x="${ox}" y="${oy}" width="${sc(2.5)}" height="${sc(flyLen)}"
      stroke="${col}" stroke-width=".6" stroke-dasharray="2,3" fill="rgba(138,74,74,.03)"/>
      <text x="${ox + 3}" y="${oy + sc(flyLen) + 9}"
        font-family="IBM Plex Mono" font-size="7" fill="${col}">fly shield (left only)</text>`;
  }
  if (opts?.cargo === 'cargo') {
    const cpX = ox + sc(width), cpY = oy + sc(rise + Math.min(inseam * .2, 2));
    pocketSVG += `<rect x="${cpX-sc(3.5)}" y="${cpY}" width="${sc(3.5)}" height="${sc(4)}" rx="1.5" stroke="#8a4a4a" stroke-width=".6" stroke-dasharray="2,3" fill="rgba(138,74,74,.03)"/>
      <text x="${cpX-sc(3.5)+3}" y="${cpY+sc(4)+9}" font-family="IBM Plex Mono" font-size="7" fill="#8a4a4a">cargo</text>`;
  }
  if (isBack && (opts?.backPocket ? opts.backPocket !== 'none' : true)) {
    // Pentagon patch pocket placement: 5.5″ wide × 6.5″ tall, pointed bottom
    const pw = 5.5, psH = 5, ptH = 6.5;
    const col = '#8a4a4a';
    // Pentagon points (local coords, untilted)
    const ppts = [
      [0, 0], [pw, 0], [pw, psH], [pw / 2, ptH], [0, psH]
    ];

    // Derive hipLineY from polygon (vertex with max x = hip point)
    const hipVertex = polygon.reduce((best, pt) => pt.x > best.x ? pt : best, polygon[0]);
    const hipLineY = hipVertex.y;

    function sideSeamXatY(py) {
      let maxX = 0;
      for (let i = 0; i < polygon.length; i++) {
        const a = polygon[i], b = polygon[(i + 1) % polygon.length];
        const yMin = Math.min(a.y, b.y), yMax = Math.max(a.y, b.y);
        if (yMin <= py && py <= yMax && Math.abs(b.y - a.y) > 0.01) {
          const x = a.x + (py - a.y) / (b.y - a.y) * (b.x - a.x);
          if (x > maxX) maxX = x;
        }
      }
      return maxX || width;
    }
    function topEdgeYatX(px) {
      let minY = Infinity;
      for (let i = 0; i < polygon.length; i++) {
        const a = polygon[i], b = polygon[(i + 1) % polygon.length];
        const xMin = Math.min(a.x, b.x), xMax = Math.max(a.x, b.x);
        if (xMin <= px && px <= xMax && Math.abs(b.x - a.x) > 0.01) {
          const y = a.y + (px - a.x) / (b.x - a.x) * (b.y - a.y);
          if (y < minY) minY = y;
        }
      }
      return minY === Infinity ? 0 : minY;
    }

    // Auto-derive pocket tilt from the panel's top-edge slope (yoke seam on
    // lower back panel). Sample across the pocket's expected x-range so CB-deep
    // / side-shallow yokes rotate the pocket to stay parallel with the seam.
    const sampleL = Math.max(0.5, width * 0.15);
    const sampleR = Math.min(width - 0.5, sampleL + pw);
    const yL = topEdgeYatX(sampleL), yR = topEdgeYatX(sampleR);
    const rad = sampleR > sampleL ? Math.atan2(yR - yL, sampleR - sampleL) : 0;
    const cosA = Math.cos(rad), sinA = Math.sin(rad);

    // Center pocket on the seat: pocket midpoint sits 0.5″ below hip line
    let bpTop = hipLineY - ptH / 2 + 0.5;

    // ── Side-seam clamping ──
    let bpInner = 2;
    for (const [lx, ly] of ppts) {
      const rx = lx * cosA - ly * sinA;
      const ry = lx * sinA + ly * cosA;
      const allowed = sideSeamXatY(bpTop + ry) - 0.75 - rx;
      if (allowed < bpInner) bpInner = allowed;
    }
    bpInner = Math.max(0.5, bpInner);

    // ── Top-edge clamping (prevents pocket crossing yoke seam) ──
    for (const [lx, ly] of ppts) {
      const rx = lx * cosA - ly * sinA;
      const ry = lx * sinA + ly * cosA;
      const topY = topEdgeYatX(bpInner + rx);
      const needed = topY + 0.75 - ry;
      if (needed > bpTop) bpTop = needed;
    }

    const svgPts = ppts.map(([lx, ly]) => {
      const rx = lx * cosA - ly * sinA;
      const ry = lx * sinA + ly * cosA;
      return `${(ox + sc(bpInner + rx)).toFixed(1)},${(oy + sc(bpTop + ry)).toFixed(1)}`;
    });
    pocketSVG += `<polygon points="${svgPts.join(' ')}" stroke="${col}" stroke-width=".6" stroke-dasharray="2,3" fill="rgba(138,74,74,.03)"/>`;
    // Label below pocket
    const lblX = ox + sc(bpInner + pw * 0.3), lblY = oy + sc(bpTop + ptH + 0.8);
    pocketSVG += `<text x="${lblX.toFixed(1)}" y="${lblY.toFixed(1)}" font-family="IBM Plex Mono" font-size="7" fill="${col}">patch pocket</text>`;
  }

  // Pleat fold lines
  let pleatSVG = '';
  for (const p of pleats) {
    const px1 = ox + sc(p.x);
    const px2 = ox + sc(p.x + p.depth);
    const py1 = oy + sc(p.y1);
    const py2 = oy + sc(p.y2);
    const midX = (px1 + px2) / 2;
    pleatSVG += `
    <line x1="${px1.toFixed(1)}" y1="${py1.toFixed(1)}" x2="${px1.toFixed(1)}" y2="${py2.toFixed(1)}" stroke="#b8963e" stroke-width="0.8" stroke-dasharray="4,3"/>
    <line x1="${px2.toFixed(1)}" y1="${py1.toFixed(1)}" x2="${px2.toFixed(1)}" y2="${py2.toFixed(1)}" stroke="#b8963e" stroke-width="0.8" stroke-dasharray="4,3"/>
    <text x="${midX.toFixed(1)}" y="${(py2 + 9).toFixed(1)}" font-family="IBM Plex Mono" font-size="7" fill="#b8963e" text-anchor="middle">${p.label || 'pleat'}</text>`;
  }

  // Dart V-lines (back panel waist darts)
  let dartSVG = '';
  for (const d of darts) {
    const dx = ox + sc(d.x);
    const dy1 = oy;
    const dy2 = oy + sc(d.length);
    const halfW = sc(d.intake / 2);
    dartSVG += `
    <line x1="${(dx - halfW).toFixed(1)}" y1="${dy1.toFixed(1)}" x2="${dx.toFixed(1)}" y2="${dy2.toFixed(1)}" stroke="#b8963e" stroke-width="0.8" stroke-dasharray="4,3"/>
    <line x1="${(dx + halfW).toFixed(1)}" y1="${dy1.toFixed(1)}" x2="${dx.toFixed(1)}" y2="${dy2.toFixed(1)}" stroke="#b8963e" stroke-width="0.8" stroke-dasharray="4,3"/>
    <text x="${dx.toFixed(1)}" y="${(dy2 + 9).toFixed(1)}" font-family="IBM Plex Mono" font-size="7" fill="#b8963e" text-anchor="middle">dart</text>`;
  }

  // Notch marks: base snapped to SA cut line, apex pointing outward
  const notchSVG = renderNotchesSVG(polygon, notches, ox, oy);

  // Reference lines
  const cLineY = oy + sc(rise);
  const gx = ox + sc(width * .42), gy1 = oy + sc(1.8), gy2 = oy + sc(height - 1.8);
  const grainLabelY = oy + sc(height * 0.45);

  const legY = svgH - 28;
  const legendSVG = `
    <line x1="10" y1="${legY-3}" x2="26" y2="${legY-3}" stroke="#000" stroke-width="1.5"/>
    <text x="30" y="${legY}" font-family="IBM Plex Mono" font-size="9" fill="#888">cut here</text>
    <line x1="72" y1="${legY-3}" x2="88" y2="${legY-3}" stroke="#666" stroke-width="0.8" stroke-dasharray="4,3"/>
    <text x="92" y="${legY}" font-family="IBM Plex Mono" font-size="9" fill="#888">stitch line</text>
    <line x1="148" y1="${legY-3}" x2="164" y2="${legY-3}" stroke="#4a8a5a" stroke-width="0.8" stroke-dasharray="4,3"/>
    <text x="168" y="${legY}" font-family="IBM Plex Mono" font-size="9" fill="#888">fold line</text>
    <line x1="218" y1="${legY-3}" x2="234" y2="${legY-3}" stroke="#c44" stroke-width="0.8" stroke-dasharray="3,3"/>
    <text x="238" y="${legY}" font-family="IBM Plex Mono" font-size="9" fill="#888">pocket placement</text>`;

  return `<svg viewBox="0 0 ${svgW} ${svgH}" xmlns="http://www.w3.org/2000/svg" style="background:#faf8f4">
    <defs><pattern id="g${piece.id}" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="7" cy="7" r=".4" fill="#eae6de"/></pattern></defs>
    <rect class="grid-bg" width="${svgW}" height="${svgH}" fill="url(#g${piece.id})"/>
    <path d="${polyPath(svgPoly)}" stroke="#000" stroke-width="1.5" fill="rgba(0,0,0,.02)"/>
    ${/* LOCKED — crotch curve hybrid stitch line rendering is finalized.
       Do not modify the Catmull-Rom spline, trim threshold, point collection,
       or hybrid path construction below. See also: geometry.js offsetPolygon,
       sanitizePoly, insetCrotchBezier. */ ''}
    ${(() => {
      if (!crotchBezierSA) return `<path d="${polyPath(svgSA)}" stroke="#666" stroke-width="0.8" stroke-dasharray="4,3" fill="none"/>`;
      const s = crotchBezierSA;
      const sp0 = toSVG(s.p0), sp3 = toSVG(s.p3);
      // Find SA polygon vertices closest to bezier endpoints
      let idx0 = 0, idx3 = 0, d0 = Infinity, d3 = Infinity;
      for (let i = 0; i < svgSA.length; i++) {
        const dist0 = (svgSA[i].x - sp0.x) ** 2 + (svgSA[i].y - sp0.y) ** 2;
        if (dist0 < d0) { d0 = dist0; idx0 = i; }
        const dist3 = (svgSA[i].x - sp3.x) ** 2 + (svgSA[i].y - sp3.y) ** 2;
        if (dist3 < d3) { d3 = dist3; idx3 = i; }
      }
      // Determine structural direction (through hem = high y)
      const n = svgSA.length;
      let fwdMaxY = 0, bwdMaxY = 0;
      for (let i = (idx3 + 1) % n; i !== idx0; i = (i + 1) % n) fwdMaxY = Math.max(fwdMaxY, svgSA[i].y);
      for (let i = (idx3 - 1 + n) % n; i !== idx0; i = (i - 1 + n) % n) bwdMaxY = Math.max(bwdMaxY, svgSA[i].y);
      const structDir = fwdMaxY > bwdMaxY ? 1 : -1;
      const curveDir = -structDir;
      // Collect structural edges (waist→side→hem→inseam)
      let structPath = `M ${svgSA[idx3].x.toFixed(1)} ${svgSA[idx3].y.toFixed(1)}`;
      for (let i = (idx3 + structDir + n) % n; i !== idx0; i = (i + structDir + n) % n) {
        structPath += ` L ${svgSA[i].x.toFixed(1)} ${svgSA[i].y.toFixed(1)}`;
      }
      structPath += ` L ${svgSA[idx0].x.toFixed(1)} ${svgSA[idx0].y.toFixed(1)}`;
      // Collect crotch curve offset points — walk SAME direction as struct (wraps the other way)
      const rawCurvePts = [];
      for (let i = (idx0 + structDir + n) % n; i !== idx3; i = (i + structDir + n) % n) {
        rawCurvePts.push(svgSA[i]);
      }
      // Trim curve points too close to the structural endpoints — these cause jog/overshoot
      const trimDist = sc(sa) * 1.5; // 1.5× SA in SVG units
      const v0 = svgSA[idx0], v3 = svgSA[idx3];
      const curvePts = rawCurvePts.filter(p => {
        const d0 = Math.sqrt((p.x - v0.x) ** 2 + (p.y - v0.y) ** 2);
        const d3 = Math.sqrt((p.x - v3.x) ** 2 + (p.y - v3.y) ** 2);
        return d0 > trimDist && d3 > trimDist;
      });
      // Build path: structural edges + Catmull-Rom spline for crotch curve
      let hp = structPath;
      // Line to first curve point (or straight to idx3 if no curve points survived trim)
      if (curvePts.length < 2) {
        hp += ` L ${v3.x.toFixed(1)} ${v3.y.toFixed(1)} Z`;
      } else {
        // Bookend with structural vertices for clean entry/exit
        const cp = [v0, ...curvePts, v3];
        hp += ` L ${cp[0].x.toFixed(1)} ${cp[0].y.toFixed(1)}`;
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
      return `<path d="${hp}" stroke="#666" stroke-width="0.8" stroke-dasharray="4,3" fill="none"/>`;
    })()}
    <line x1="${ox-sc(ext+.4)}" y1="${cLineY}" x2="${ox+sc(width+.2)}" y2="${cLineY}" stroke="#e8e4dc" stroke-width=".4" stroke-dasharray="5,4"/>
    ${grainlineSVG(gx, gy1, gy2, grainLabelY, piece.grainAngle || 0)}
    ${dimsSVG}${labelsSVG}${pocketSVG}${pleatSVG}${dartSVG}${notchSVG}${edgeSALabels(polygon, edgeAllowances, ox, oy)}
    <text x="${ox+sc(width/2)}" y="${svgH - 56}" font-family="IBM Plex Mono" font-size="9" fill="var(--accent,#c44)" text-anchor="middle">← CENTER (curve) · · · · · SIDE (straight) →</text>
    <text x="${ox+sc(width/2)}" y="${svgH - 42}" font-family="IBM Plex Mono" font-size="14" fill="var(--text,#2c2a26)" text-anchor="middle" font-weight="500">${piece.name} × 2 (mirror)</text>
    ${legendSVG}
    <text x="10" y="${svgH - 14}" font-family="IBM Plex Mono" font-size="10" fill="#555">${fmtInches(sa)} SA included · ${fmtInches(hem)} hem allowance</text>
  </svg>`;
}

/**
 * Render a bodice or sleeve piece as an SVG string.
 * Piece must have: polygon (array of {x,y} in inches), dims (optional), type, name, sa, hem
 */
export function renderGenericPieceSVG(piece) {
  const { polygon, dims = [], type, sa = 0.5, hem = 0.75, hemEdge = 'bottom', notches = [], edgeAllowances } = piece;

  // Compute bounding box
  const xs = polygon.map(p => p.x), ys = polygon.map(p => p.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const pW = maxX - minX, pH = maxY - minY;

  const mL = 2.5, mT = 1.5, mR = 3, mB = 4.5;
  const svgW = sc(mL + pW + mR);
  const svgH = sc(mT + pH + mB);
  const ox = sc(mL - minX);
  const oy = sc(mT - minY);

  function toSVG(pt) { return { x: ox + sc(pt.x), y: oy + sc(pt.y) }; }

  function polyPath(pts) {
    const mapped = pts.map(toSVG);
    let d = `M ${mapped[0].x.toFixed(1)} ${mapped[0].y.toFixed(1)}`;
    for (let i = 1; i < mapped.length; i++) d += ` L ${mapped[i].x.toFixed(1)} ${mapped[i].y.toFixed(1)}`;
    return d + ' Z';
  }

  const cutOnFold = type !== 'sleeve' && piece.isCutOnFold !== false;
  const saPoly = piece.saPolygon || offsetPolygon(polygon, (i, a, b) => {
    if (edgeAllowances && edgeAllowances[i]) return -edgeAllowances[i].sa;
    // Fold edge: both endpoints at x = minX — no SA, the fold is not a seam
    if (cutOnFold && Math.abs(a.x - minX) < 0.01 && Math.abs(b.x - minX) < 0.01) return 0;
    return -sa;
  });

  // Grain line: vertical through horizontal center of bounding box
  const gx = ox + sc((minX + maxX) / 2);
  const gy1 = oy + sc(minY + pH * 0.2);
  const gy2 = oy + sc(minY + pH * 0.8);

  // Dimension annotations
  let dimsSVG = '';
  for (const d of dims) {
    if (d.type === 'h') {
      const x1 = ox + sc(d.x1), x2 = ox + sc(d.x2), y = oy + sc(d.y1);
      const col = d.color || '#bbb';
      dimsSVG += `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${col}" stroke-width=".4"/>
        <line x1="${x1}" y1="${y-3}" x2="${x1}" y2="${y+3}" stroke="${col}" stroke-width=".4"/>
        <line x1="${x2}" y1="${y-3}" x2="${x2}" y2="${y+3}" stroke="${col}" stroke-width=".4"/>
        <text x="${(x1+x2)/2}" y="${y-4}" font-family="IBM Plex Mono" font-size="12" fill="#555" text-anchor="middle" font-weight="500">${d.label}</text>`;
    } else if (d.type === 'v') {
      const x = ox + sc(d.x), y1 = oy + sc(d.y1), y2 = oy + sc(d.y2), my = (y1+y2)/2;
      dimsSVG += `<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" stroke="#bbb" stroke-width=".4"/>
        <line x1="${x-3}" y1="${y1}" x2="${x+3}" y2="${y1}" stroke="#bbb" stroke-width=".4"/>
        <line x1="${x-3}" y1="${y2}" x2="${x+3}" y2="${y2}" stroke="#bbb" stroke-width=".4"/>
        <text x="${x+10}" y="${my}" font-family="IBM Plex Mono" font-size="12" fill="#555" text-anchor="start" font-weight="500" transform="rotate(90,${x+10},${my})">${d.label}</text>`;
    }
  }

  // Bust dart lines (horizontal side-seam darts on womenswear bodice)
  const { bustDarts = [] } = piece;
  let bustDartSVG = '';
  for (const d of bustDarts) {
    const ax = ox + sc(d.apexX), ay = oy + sc(d.apexY);
    const ux = ox + sc(d.sideX), uy = oy + sc(d.upperY);
    const lx = ox + sc(d.sideX), ly = oy + sc(d.lowerY);
    bustDartSVG += `
    <line x1="${ux.toFixed(1)}" y1="${uy.toFixed(1)}" x2="${ax.toFixed(1)}" y2="${ay.toFixed(1)}" stroke="#b8963e" stroke-width="0.8" stroke-dasharray="4,3"/>
    <line x1="${lx.toFixed(1)}" y1="${ly.toFixed(1)}" x2="${ax.toFixed(1)}" y2="${ay.toFixed(1)}" stroke="#b8963e" stroke-width="0.8" stroke-dasharray="4,3"/>
    <text x="${(ax - 8).toFixed(1)}" y="${(ay - 5).toFixed(1)}" font-family="IBM Plex Mono" font-size="7" fill="#b8963e" text-anchor="middle">dart</text>`;
  }

  const pieceLabel = type === 'sleeve'
    ? 'SLEEVE × 2 (mirror)'
    : cutOnFold
      ? piece.name?.toUpperCase() + ' (cut on fold)'
      : piece.name?.toUpperCase() + ' × 2 (mirror)';
  const legY2 = svgH - 28;
  const legendSVG2 = `
    <line x1="10" y1="${legY2-3}" x2="26" y2="${legY2-3}" stroke="#000" stroke-width="1.5"/>
    <text x="30" y="${legY2}" font-family="IBM Plex Mono" font-size="9" fill="#888">cut here</text>
    <line x1="72" y1="${legY2-3}" x2="88" y2="${legY2-3}" stroke="#666" stroke-width="0.8" stroke-dasharray="4,3"/>
    <text x="92" y="${legY2}" font-family="IBM Plex Mono" font-size="9" fill="#888">stitch line</text>
    <line x1="148" y1="${legY2-3}" x2="164" y2="${legY2-3}" stroke="#4a8a5a" stroke-width="0.8" stroke-dasharray="4,3"/>
    <text x="168" y="${legY2}" font-family="IBM Plex Mono" font-size="9" fill="#888">fold line</text>
    <line x1="218" y1="${legY2-3}" x2="234" y2="${legY2-3}" stroke="#c44" stroke-width="0.8" stroke-dasharray="3,3"/>
    <text x="238" y="${legY2}" font-family="IBM Plex Mono" font-size="9" fill="#888">pocket placement</text>`;

  return `<svg viewBox="0 0 ${svgW} ${svgH}" xmlns="http://www.w3.org/2000/svg" style="background:#faf8f4">
    <defs><pattern id="gp${piece.id}" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="7" cy="7" r=".4" fill="#eae6de"/></pattern></defs>
    <rect class="grid-bg" width="${svgW}" height="${svgH}" fill="url(#gp${piece.id})"/>
    <path d="${polyPath(polygon)}" stroke="#000" stroke-width="1.5" fill="rgba(0,0,0,.02)"/>
    <path d="${(() => {
      // ── HYBRID STITCH PATH — VERIFIED WORKING, DO NOT CHANGE UNLESS NECESSARY ──
      // Catmull-Rom spline for .curve-tagged sections, SVG L commands for structural edges.
      // Uses duplicate-endpoint phantoms at curve run boundaries to prevent wild tangent vectors.
      // Junction points between curves and structural edges must be un-tagged (.curve deleted)
      // in the garment module so this renderer produces clean L transitions at those junctions.
      const pts = saPoly.map(toSVG);
      // Check if any points are curve-tagged
      const hasCurve = saPoly.some(p => p.curve);
      if (!hasCurve) {
        // When hemEdge === 'top', draw 3-sided stitch path (omit the opening edge)
        if (hemEdge === 'top') {
          const mapped = saPoly.map(toSVG);
          let topEdgeIdx = 0, minAvgY = Infinity;
          for (let i = 0; i < saPoly.length; i++) {
            const a = mapped[i], b = mapped[(i + 1) % saPoly.length];
            const avg = (a.y + b.y) / 2;
            if (avg < minAvgY) { minAvgY = avg; topEdgeIdx = i; }
          }
          const si = (topEdgeIdx + 1) % saPoly.length;
          let d = `M ${mapped[si].x.toFixed(1)} ${mapped[si].y.toFixed(1)}`;
          for (let s = 1; s < saPoly.length; s++) {
            const idx = (si + s) % saPoly.length;
            d += ` L ${mapped[idx].x.toFixed(1)} ${mapped[idx].y.toFixed(1)}`;
          }
          return d; // open path — no Z
        }
        return polyPath(saPoly);
      }
      // Copy curve tags to SVG-mapped points
      for (let i = 0; i < pts.length; i++) if (saPoly[i].curve) pts[i].curve = true;
      let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
      for (let i = 1; i < pts.length; i++) {
        if (!pts[i].curve) {
          d += ` L ${pts[i].x.toFixed(1)} ${pts[i].y.toFixed(1)}`;
        } else {
          // Collect contiguous curve run with structural bookends
          const before = pts[i - 1]; // structural bookend before
          const curveRun = [];
          while (i < pts.length && pts[i].curve) curveRun.push(pts[i++]);
          const after = i < pts.length ? pts[i] : pts[0]; // structural bookend after
          // L to first curve point (straight side-seam → curve junction)
          d += ` L ${curveRun[0].x.toFixed(1)} ${curveRun[0].y.toFixed(1)}`;
          // Catmull-Rom only between curve points; duplicate endpoints as phantoms
          // (prevents distant structural bookends from creating wild tangent vectors)
          const run = [curveRun[0], ...curveRun, curveRun[curveRun.length - 1]];
          for (let k = 1; k < run.length - 2; k++) {
            const p0 = run[k - 1];
            const p1 = run[k];
            const p2 = run[k + 1];
            const p3 = run[Math.min(run.length - 1, k + 2)];
            const b1x = p1.x + (p2.x - p0.x) / 6;
            const b1y = p1.y + (p2.y - p0.y) / 6;
            const b2x = p2.x - (p3.x - p1.x) / 6;
            const b2y = p2.y - (p3.y - p1.y) / 6;
            d += ` C ${b1x.toFixed(1)} ${b1y.toFixed(1)}, ${b2x.toFixed(1)} ${b2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
          }
          // L from last curve point to structural bookend (curve → side-seam)
          d += ` L ${after.x.toFixed(1)} ${after.y.toFixed(1)}`;
          i--; // re-visit last structural point for next segment
        }
      }
      return d + ' Z';
    })()}" stroke="#666" stroke-width="0.8" stroke-dasharray="4,3" fill="none"/>
    ${cutOnFold
      ? foldIndicatorSVG(ox + sc(minX), oy + sc(minY + pH * 0.08), oy + sc(minY + pH * 0.92))
      : grainlineSVG(gx, gy1, gy2, (gy1 + gy2) / 2, piece.grainAngle || 0)}
    ${dimsSVG}${bustDartSVG}${(piece.labels || []).map(l => {
      const x = ox + sc(l.x), y = oy + sc(l.y);
      return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-family="IBM Plex Mono" font-size="9" fill="#b8963e" text-anchor="middle" transform="rotate(${l.rotation || 0},${x.toFixed(1)},${y.toFixed(1)})">${l.text}</text>`;
    }).join('')}${edgeSALabels(polygon, edgeAllowances, ox, oy)}${renderNotchesSVG(polygon, notches, ox, oy)}${
      // Roll/fold line annotation (e.g. lapel break line)
      piece.rollLine ? (() => {
        const r = piece.rollLine;
        const a = toSVG(r.from), b = toSVG(r.to);
        const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        const angle = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
        return `<line x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${b.x.toFixed(1)}" y2="${b.y.toFixed(1)}" stroke="#4a8a5a" stroke-width="0.8" stroke-dasharray="4,3"/>
          <text x="${mx.toFixed(1)}" y="${(my - 4).toFixed(1)}" font-family="IBM Plex Mono" font-size="7" fill="#4a8a5a" text-anchor="middle" transform="rotate(${angle.toFixed(1)},${mx.toFixed(1)},${(my - 4).toFixed(1)})">${r.label || 'roll line'}</text>`;
      })() : ''
    }
    ${(piece.marks || []).map(mk => {
      const mc = '#4a8a5a';
      if (mk.type === 'fold' && mk.axis === 'h') {
        const ly = oy + sc(mk.position);
        const lx1 = ox + sc(minX), lx2 = ox + sc(maxX);
        return `<line x1="${lx1}" y1="${ly}" x2="${lx2}" y2="${ly}" stroke="${mc}" stroke-width="0.8" stroke-dasharray="4,3"/>`;
      } else if (mk.type === 'fold' && mk.axis === 'v') {
        const lx = ox + sc(mk.position);
        const ly1 = oy + sc(minY), ly2 = oy + sc(maxY);
        return `<line x1="${lx}" y1="${ly1}" x2="${lx}" y2="${ly2}" stroke="${mc}" stroke-width="0.8" stroke-dasharray="4,3"/>`;
      }
      return '';
    }).join('')}
    ${(() => {
      if (piece.id !== 'scoop-backing' && piece.id !== 'square-scoop-backing') return '';
      const bW = piece.width || 7;
      const bSA = piece.sa || 0.625;
      const coinW = 3, coinH = 3.5;
      const cpX = ox + sc(bW - bSA - coinW);
      const cpY = oy + sc(bSA);
      const cpWpx = sc(coinW), cpHpx = sc(coinH);
      const col = '#8a4a4a';
      return `<rect x="${cpX.toFixed(1)}" y="${cpY.toFixed(1)}" width="${cpWpx.toFixed(1)}" height="${cpHpx.toFixed(1)}" rx="${sc(0.5).toFixed(1)}"
        stroke="${col}" stroke-width="0.6" stroke-dasharray="2,3" fill="rgba(138,74,74,.03)"/>
      <text x="${(cpX + 2).toFixed(1)}" y="${(cpY + cpHpx + 9).toFixed(1)}"
        font-family="IBM Plex Mono" font-size="7" fill="${col}">coin pocket</text>`;
    })()}
    <text x="${svgW/2}" y="${svgH - 42}" font-family="IBM Plex Mono" font-size="14" fill="#555" text-anchor="middle" font-weight="500">${pieceLabel}</text>
    ${legendSVG2}
    <text x="10" y="${svgH - 14}" font-family="IBM Plex Mono" font-size="10" fill="#555">${hemEdge === 'top' && hem > 0 ? `${fmtInches(hem)} hem at top · ${fmtInches(sa)} SA on 3 sides` : `${fmtInches(sa)} SA included · ${fmtInches(hem)} hem allowance`}</text>
  </svg>`;
}

/**
 * Render a rectangle piece (gathered panels, straps, simple rectangles) as an SVG string.
 * Piece must have: dimensions.width, dimensions.length, sa, name, id.
 * Optional: hem, hemEdge ('top'|'bottom', default 'bottom'), instruction (checked for "on fold").
 * When hemEdge === 'top': hem allowance goes above the stitch line (pocket opening edge).
 *   The stitch line is drawn as 3 sides only (left, bottom, right) — the top is a fold/hem.
 */
export function renderRectanglePieceSVG(piece) {
  const { dimensions, sa = 0.625, hem = 0, hemEdge = 'bottom', name, id, instruction = '' } = piece;
  const pieceW = dimensions.width;
  const pieceL = dimensions.length;
  const onFold = /on fold/i.test(instruction);
  const hemAtTop = hem > 0 && hemEdge === 'top';

  const mL = 3, mT = 2, mR = 4, mB = 6;
  const svgW = sc(mL + pieceW + mR);
  const svgH = sc(mT + pieceL + mB);
  const ox = sc(mL);
  const oy = sc(mT);

  // Cut line (outer, solid)
  // hemAtTop: hem above stitch line, SA below; otherwise SA above, hem (or SA) below
  const topAllowance = hemAtTop ? hem : sa;
  const botAllowance = hemAtTop ? sa : (hem > 0 ? hem : sa);
  const cutX = ox - sc(sa);
  const cutY = oy - sc(topAllowance);
  const cutW = sc(pieceW + 2 * sa);
  const cutH = sc(pieceL + topAllowance + botAllowance);

  // Stitch line (inner, dashed)
  const stX = ox, stY = oy, stW = sc(pieceW), stH = sc(pieceL);
  // When hem is at top, the top edge is a fold/hem — draw only 3 sides (left, bottom, right)
  const stitch3Side = hemAtTop
    ? `M ${(stX + stW).toFixed(1)} ${stY.toFixed(1)} L ${stX.toFixed(1)} ${stY.toFixed(1)} L ${stX.toFixed(1)} ${(stY + stH).toFixed(1)} L ${(stX + stW).toFixed(1)} ${(stY + stH).toFixed(1)} L ${(stX + stW).toFixed(1)} ${stY.toFixed(1)}`
    : null;

  // Grain line — vertical through horizontal center
  const gx = ox + sc(pieceW / 2);
  const gy1 = oy + sc(pieceL * 0.2);
  const gy2 = oy + sc(pieceL * 0.8);

  // Dimension annotations
  // Horizontal (width) above piece — position above the cut line top
  const dimHy = cutY - 8;
  const dimHx1 = ox, dimHx2 = ox + sc(pieceW);
  const dimHlabel = fmtInches(pieceW);
  // Vertical (length) at right of piece
  const dimVx = ox + sc(pieceW) + sc(sa) + 14;
  const dimVy1 = oy, dimVy2 = oy + sc(pieceL);
  const dimVmy = (dimVy1 + dimVy2) / 2;
  const dimVlabel = fmtInches(pieceL);

  const dimsSVG = `
    <line x1="${dimHx1}" y1="${dimHy}" x2="${dimHx2}" y2="${dimHy}" stroke="#bbb" stroke-width=".4"/>
    <line x1="${dimHx1}" y1="${dimHy - 3}" x2="${dimHx1}" y2="${dimHy + 3}" stroke="#bbb" stroke-width=".4"/>
    <line x1="${dimHx2}" y1="${dimHy - 3}" x2="${dimHx2}" y2="${dimHy + 3}" stroke="#bbb" stroke-width=".4"/>
    <text x="${(dimHx1 + dimHx2) / 2}" y="${dimHy - 4}" font-family="IBM Plex Mono" font-size="12" fill="#555" text-anchor="middle" font-weight="500">${dimHlabel}</text>
    <line x1="${dimVx}" y1="${dimVy1}" x2="${dimVx}" y2="${dimVy2}" stroke="#bbb" stroke-width=".4"/>
    <line x1="${dimVx - 3}" y1="${dimVy1}" x2="${dimVx + 3}" y2="${dimVy1}" stroke="#bbb" stroke-width=".4"/>
    <line x1="${dimVx - 3}" y1="${dimVy2}" x2="${dimVx + 3}" y2="${dimVy2}" stroke="#bbb" stroke-width=".4"/>
    <text x="${dimVx + 10}" y="${dimVmy}" font-family="IBM Plex Mono" font-size="12" fill="#555" text-anchor="start" font-weight="500" transform="rotate(90,${dimVx + 10},${dimVmy})">${dimVlabel}</text>`;

  const legY = svgH - 28;
  const legendSVG = `
    <line x1="10" y1="${legY - 3}" x2="26" y2="${legY - 3}" stroke="#000" stroke-width="1.5"/>
    <text x="30" y="${legY}" font-family="IBM Plex Mono" font-size="9" fill="#888">cut here</text>
    <line x1="72" y1="${legY - 3}" x2="88" y2="${legY - 3}" stroke="#666" stroke-width="0.8" stroke-dasharray="4,3"/>
    <text x="92" y="${legY}" font-family="IBM Plex Mono" font-size="9" fill="#888">stitch line</text>
    ${onFold ? `<line x1="148" y1="${legY - 3}" x2="164" y2="${legY - 3}" stroke="#4a8a5a" stroke-width="0.8" stroke-dasharray="4,3"/>
    <text x="168" y="${legY}" font-family="IBM Plex Mono" font-size="9" fill="#888">fold line</text>` : ''}`;

  const pieceLabel = onFold ? `${name?.toUpperCase()} (cut on fold)` : `${name?.toUpperCase()} × 2 (mirror)`;
  const saNote = hemAtTop
    ? `${fmtInches(hem)} hem at top (fold) · ${fmtInches(sa)} SA on 3 sides`
    : hem > 0
      ? `${fmtInches(sa)} SA · ${fmtInches(hem)} hem allowance`
      : `${fmtInches(sa)} SA included`;

  return `<svg viewBox="0 0 ${svgW} ${svgH}" xmlns="http://www.w3.org/2000/svg" style="background:#faf8f4">
    <defs><pattern id="gp${id}" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="7" cy="7" r=".4" fill="#eae6de"/></pattern></defs>
    <rect class="grid-bg" width="${svgW}" height="${svgH}" fill="url(#gp${id})"/>
    <rect x="${cutX.toFixed(1)}" y="${cutY.toFixed(1)}" width="${cutW.toFixed(1)}" height="${cutH.toFixed(1)}" stroke="#000" stroke-width="1.5" fill="rgba(0,0,0,.02)"/>
    ${stitch3Side
      ? `<path d="${stitch3Side}" stroke="#666" stroke-width="0.8" stroke-dasharray="4,3" fill="none"/>`
      : `<rect x="${stX.toFixed(1)}" y="${stY.toFixed(1)}" width="${stW.toFixed(1)}" height="${stH.toFixed(1)}" stroke="#666" stroke-width="0.8" stroke-dasharray="4,3" fill="none"/>`}
    ${grainlineSVG(gx, gy1, gy2, (gy1 + gy2) / 2, piece.grainAngle || 0)}
    ${onFold ? foldIndicatorSVG(cutX, cutY, cutY + cutH) : ''}
    ${dimsSVG}
    <text x="${svgW / 2}" y="${svgH - 42}" font-family="IBM Plex Mono" font-size="14" fill="#555" text-anchor="middle" font-weight="500">${pieceLabel}</text>
    ${legendSVG}
    <text x="10" y="${svgH - 14}" font-family="IBM Plex Mono" font-size="10" fill="#555">${saNote}</text>
  </svg>`;
}

/**
 * Render a vinyl/template piece (bone outlines etc.) as an SVG string.
 * Piece must have: polygon (array of {x,y} in inches), width, height, name.
 * Supports compound paths via piece.svgPath (fill-rule:evenodd for holes).
 * Renders as a filled silhouette with a download link for Cricut SVG export.
 */
export function renderTemplateSVG(piece) {
  const { polygon, width, height, name } = piece;
  if (!polygon || !polygon.length) return '';

  // Compute bounding box from polygon
  const xs = polygon.map(p => p.x), ys = polygon.map(p => p.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const pW = maxX - minX, pH = maxY - minY;

  const mL = 1.5, mT = 1.5, mR = 1.5, mB = 3;
  const svgW = sc(mL + pW + mR);
  const svgH = sc(mT + pH + mB);
  const ox = sc(mL - minX);
  const oy = sc(mT - minY);

  // Build display path — use svgPath (compound with holes) if available, else polygon
  let d;
  if (piece.svgPath) {
    // Scale the svgPath from inches to SVG units with offset
    d = piece.svgPath.replace(/([0-9.-]+)\s+([0-9.-]+)/g, (_, xStr, yStr) => {
      const x = ox + sc(parseFloat(xStr));
      const y = oy + sc(parseFloat(yStr));
      return `${x.toFixed(1)} ${y.toFixed(1)}`;
    });
  } else {
    const pts = polygon.map(p => ({ x: ox + sc(p.x), y: oy + sc(p.y) }));
    d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
    for (let i = 1; i < pts.length; i++) d += ` L ${pts[i].x.toFixed(1)} ${pts[i].y.toFixed(1)}`;
    d += ' Z';
  }

  // Build standalone SVG for Cricut download (inch units, no margins)
  let dlD;
  if (piece.svgPath) {
    // Shift svgPath so min corner is at origin
    dlD = piece.svgPath.replace(/([0-9.-]+)\s+([0-9.-]+)/g, (_, xStr, yStr) => {
      return `${(parseFloat(xStr) - minX).toFixed(3)} ${(parseFloat(yStr) - minY).toFixed(3)}`;
    });
  } else {
    const dlPts = polygon.map(p => ({ x: p.x - minX, y: p.y - minY }));
    dlD = `M ${dlPts[0].x.toFixed(3)} ${dlPts[0].y.toFixed(3)}`;
    for (let i = 1; i < dlPts.length; i++) dlD += ` L ${dlPts[i].x.toFixed(3)} ${dlPts[i].y.toFixed(3)}`;
    dlD += ' Z';
  }
  const dlSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${pW.toFixed(3)}in" height="${pH.toFixed(3)}in" viewBox="0 0 ${pW.toFixed(3)} ${pH.toFixed(3)}"><path d="${dlD}" fill="#000" fill-rule="evenodd" stroke="none"/></svg>`;
  const blob = new Blob([dlSvg], { type: 'image/svg+xml' });
  const dlUrl = URL.createObjectURL(blob);

  return `<svg xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 ${svgW} ${svgH}"
      style="max-width:${Math.min(svgW, 500)}px;display:block;margin:0 auto;background:var(--bg,#fff)">
    <path d="${d}" fill="var(--text,#2c2a26)" fill-rule="evenodd" stroke="var(--text,#2c2a26)" stroke-width="0.5"/>
    <text x="${svgW / 2}" y="${svgH - 30}" font-family="IBM Plex Mono" font-size="13" fill="var(--text,#2c2a26)" text-anchor="middle" font-weight="500">${name}</text>
    <text x="${svgW / 2}" y="${svgH - 14}" font-family="IBM Plex Mono" font-size="10" fill="#555" text-anchor="middle">${fmtInches(pW)} × ${fmtInches(pH)}</text>
  </svg>
  <a href="${dlUrl}" download="${(piece.id || 'template').replace(/\s+/g, '-')}.svg" style="display:block;text-align:center;margin:6px 0 0;font-size:0.75rem;font-family:'IBM Plex Mono',monospace;color:var(--link,#2c6fce)">Download SVG for Cricut</a>`;
}

/**
 * Append a tiled diagonal watermark to a live SVG DOM element.
 * Call after the SVG is in the DOM.
 * @param {SVGElement} svgEl
 */
export function addWatermark(svgEl) {
  if (!svgEl) return;
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const fill   = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.12)';

  const vb    = svgEl.viewBox.baseVal;
  const w     = vb.width  || svgEl.clientWidth  || 300;
  const h     = vb.height || svgEl.clientHeight || 400;
  const xStep = 120;
  const yStep = 80;
  const ns    = 'http://www.w3.org/2000/svg';

  const g = document.createElementNS(ns, 'g');
  g.setAttribute('class', 'wm-layer');

  for (let y = -yStep; y < h + yStep; y += yStep) {
    for (let x = -xStep; x < w + xStep; x += xStep) {
      const t = document.createElementNS(ns, 'text');
      t.setAttribute('x', x);
      t.setAttribute('y', y);
      t.setAttribute('font-family', 'IBM Plex Mono, monospace');
      t.setAttribute('font-size', '14');
      t.setAttribute('fill', fill);
      t.setAttribute('transform', `rotate(-35, ${x}, ${y})`);
      t.setAttribute('pointer-events', 'none');
      t.textContent = 'peoplespatterns.com';
      g.appendChild(t);
    }
  }

  svgEl.appendChild(g);
}

/**
 * Remove watermark layer from all SVGs in a container.
 * @param {Element} container
 */
export function removeWatermarks(container) {
  container.querySelectorAll('.wm-layer').forEach(el => el.remove());
}
