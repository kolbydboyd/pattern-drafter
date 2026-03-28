// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * SVG renderer for pattern pieces.
 * Takes piece objects from garment modules, returns SVG strings.
 */

import { fmtInches, offsetPolygon } from '../engine/geometry.js';

const SC = 20; // 1 inch = 20 SVG units
const sc = i => i * SC;

/**
 * Compute the average centroid of a polygon (inch coords).
 */
function polygonCentroid(poly) {
  let cx = 0, cy = 0;
  for (const p of poly) { cx += p.x; cy += p.y; }
  return { x: cx / poly.length, y: cy / poly.length };
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

        // Pick the one pointing away from the polygon centroid
        const toCx = cpx - centroid.x, toCy = cpy - centroid.y;
        if (nx1 * toCx + ny1 * toCy >= 0) {
          bestNx = nx1; bestNy = ny1;
        } else {
          bestNx = nx2; bestNy = ny2;
        }
      }
    }

    // Convert base point to SVG coords
    const px = ox + sc(bestPx), py = oy + sc(bestPy);

    // Apex: base point + outward normal * triangle height
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
 * Render a grainline arrow: dashed vertical line with solid arrowheads at both ends.
 */
function grainlineSVG(gx, gy1, gy2, labelY = (gy1 + gy2) / 2) {
  const ah = 5;  // arrowhead height
  const aw = 3;  // arrowhead half-width
  return `<line x1="${gx}" y1="${gy1 + ah}" x2="${gx}" y2="${gy2 - ah}" stroke="#2c2a26" stroke-width="0.8" stroke-dasharray="8,4"/>
    <polygon points="${gx},${gy1} ${gx - aw},${gy1 + ah} ${gx + aw},${gy1 + ah}" fill="#2c2a26"/>
    <polygon points="${gx},${gy2} ${gx - aw},${gy2 - ah} ${gx + aw},${gy2 - ah}" fill="#2c2a26"/>
    <text x="${gx}" y="${labelY - 4}" font-family="IBM Plex Mono" font-size="7" fill="#2c2a26" text-anchor="middle">GRAIN</text>`;
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
          crotchBezierSA } = piece;

  const mL = 3, mT = 3, mR = 5, mB = 6;
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
  if (!isBack && opts?.frontPocket === 'slant') {
    // Slash opening: from waist 3.5″ inward from side seam → side seam 6″ below waist
    const slashX1 = ox + sc(width - 3.5);  // waist entry point
    const slashY1 = oy;
    const slashX2 = ox + sc(width);         // side seam exit point
    const slashY2 = oy + sc(6);
    // Pocket bag: ~7″ wide × ~7″ deep behind and below the slash
    const bagL = ox + sc(width - 7);        // left edge of bag
    const bagB = oy + sc(9.5);             // bottom of bag (7″ up to slash + 2.5″ deeper extension)
    // Bag outline path (dashed): top along waist → left side → bottom → curve to side seam → slash closes shape
    pocketSVG += `<path d="M ${slashX1} ${slashY1} L ${bagL} ${slashY1} L ${bagL} ${bagB} Q ${slashX2} ${bagB} ${slashX2} ${slashY2} Z" stroke="#8a4a4a" stroke-width=".6" stroke-dasharray="2,3" fill="rgba(138,74,74,.03)"/>
      <line x1="${slashX1}" y1="${slashY1}" x2="${slashX2}" y2="${slashY2}" stroke="#8a4a4a" stroke-width="1"/>
      <text x="${bagL + 2}" y="${(oy + sc(rise * 0.85)).toFixed(1)}" font-family="IBM Plex Mono" font-size="7" fill="#8a4a4a">slant pocket</text>`;
  }
  if (!isBack && opts?.frontPocket === 'side') {
    // Two tick marks on the side seam showing the pocket opening span.
    // Standard placement: starts 2″ below waist, extends 6.5″ down.
    const pTop = 2;
    const pBot = 2 + 6.5; // 8.5″ below waist

    // Interpolate the side seam (right edge) x coordinate at a given y.
    // Polygon right-side edges: index 1 (side waist) → 2 (side hip) → 3 (side knee) → 4 (side hem).
    function sideSeamXatY(ty) {
      for (let i = 1; i <= 4; i++) {
        const a = polygon[i], b = polygon[i + 1];
        if (!a || !b) break;
        const yMin = Math.min(a.y, b.y), yMax = Math.max(a.y, b.y);
        if (yMin <= ty && ty <= yMax) {
          return a.x + (ty - a.y) / (b.y - a.y) * (b.x - a.x);
        }
      }
      return width; // fallback to hip width
    }

    const sxTop = sideSeamXatY(pTop);
    const sxBot = sideSeamXatY(pBot);

    const txTop = ox + sc(sxTop), tyTop = oy + sc(pTop);
    const txBot = ox + sc(sxBot), tyBot = oy + sc(pBot);
    const tickLen = sc(0.35); // tick extends 0.35″ inward from side seam
    const col = '#8a4a4a';

    // Top tick mark
    pocketSVG += `<line x1="${(txTop - tickLen).toFixed(1)}" y1="${tyTop.toFixed(1)}" x2="${txTop.toFixed(1)}" y2="${tyTop.toFixed(1)}" stroke="${col}" stroke-width="1.2"/>`;
    // Bottom tick mark
    pocketSVG += `<line x1="${(txBot - tickLen).toFixed(1)}" y1="${tyBot.toFixed(1)}" x2="${txBot.toFixed(1)}" y2="${tyBot.toFixed(1)}" stroke="${col}" stroke-width="1.2"/>`;
    // Dashed bracket along the seam between the two ticks
    pocketSVG += `<line x1="${txTop.toFixed(1)}" y1="${tyTop.toFixed(1)}" x2="${txBot.toFixed(1)}" y2="${tyBot.toFixed(1)}" stroke="${col}" stroke-width="0.8" stroke-dasharray="3,3"/>`;
    // Label: "pocket opening" — rotated 90°, positioned outside the cut line
    const labelX = ox + sc(sxTop + sa + 0.3);
    const labelMidY = (tyTop + tyBot) / 2;
    pocketSVG += `<text x="${labelX.toFixed(1)}" y="${labelMidY.toFixed(1)}" font-family="IBM Plex Mono" font-size="7" fill="${col}" text-anchor="middle" transform="rotate(90,${labelX.toFixed(1)},${labelMidY.toFixed(1)})">pocket opening</text>`;
  }
  if (opts?.cargo === 'cargo') {
    const cpX = ox + sc(width), cpY = oy + sc(rise + Math.min(inseam * .2, 2));
    pocketSVG += `<rect x="${cpX-sc(3.5)}" y="${cpY}" width="${sc(3.5)}" height="${sc(4)}" rx="1.5" stroke="#8a4a4a" stroke-width=".6" stroke-dasharray="2,3" fill="rgba(138,74,74,.03)"/>
      <text x="${cpX-sc(3.5)+3}" y="${cpY+sc(4)+9}" font-family="IBM Plex Mono" font-size="7" fill="#8a4a4a">cargo</text>`;
  }
  if (isBack && opts?.backPocket && opts.backPocket !== 'none') {
    const bpX = ox + sc(width * .35), bpY = oy + sc(1.8);
    pocketSVG += `<rect x="${bpX}" y="${bpY}" width="${sc(3)}" height="${sc(3.5)}" rx="2" stroke="#8a4a4a" stroke-width=".6" stroke-dasharray="2,3" fill="rgba(138,74,74,.03)"/>
      <text x="${bpX+2}" y="${bpY+sc(3.5)+9}" font-family="IBM Plex Mono" font-size="7" fill="#8a4a4a">patch pocket</text>`;
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
    <text x="${midX.toFixed(1)}" y="${(py2 + 9).toFixed(1)}" font-family="IBM Plex Mono" font-size="7" fill="#b8963e" text-anchor="middle">pleat</text>`;
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
    ${grainlineSVG(gx, gy1, gy2, grainLabelY)}
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
  const { polygon, dims = [], type, sa = 0.5, hem = 0.75, notches = [], edgeAllowances } = piece;

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
  const saPoly = offsetPolygon(polygon, (i, a, b) => {
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
      if (!hasCurve) return polyPath(saPoly);
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
      : grainlineSVG(gx, gy1, gy2)}
    ${dimsSVG}${bustDartSVG}${edgeSALabels(polygon, edgeAllowances, ox, oy)}${renderNotchesSVG(polygon, notches, ox, oy)}
    <text x="${svgW/2}" y="${svgH - 42}" font-family="IBM Plex Mono" font-size="14" fill="#555" text-anchor="middle" font-weight="500">${pieceLabel}</text>
    ${legendSVG2}
    <text x="10" y="${svgH - 14}" font-family="IBM Plex Mono" font-size="10" fill="#555">${fmtInches(sa)} SA included · ${fmtInches(hem)} hem allowance</text>
  </svg>`;
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
