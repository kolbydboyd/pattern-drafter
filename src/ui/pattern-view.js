/**
 * SVG renderer for pattern pieces.
 * Takes piece objects from garment modules, returns SVG strings.
 */

import { fmtInches } from '../engine/geometry.js';

const SC = 20; // 1 inch = 20 SVG units
const sc = i => i * SC;

/**
 * Render a panel piece (front/back) as an SVG string
 */
export function renderPanelSVG(piece) {
  const { width, height, rise, inseam, ext, sa, hem, isBack, cbRaise,
          polygon, saPolygon, dimensions, labels, opts } = piece;

  const mL = 3, mT = 2, mR = 3.5, mB = 3.5;
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
      const x1 = ox + sc(d.x1), x2 = ox + sc(d.x2), y = oy + sc(d.y1);
      const col = d.color || '#bbb';
      dimsSVG += `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${col}" stroke-width=".4"/>
        <line x1="${x1}" y1="${y-3}" x2="${x1}" y2="${y+3}" stroke="${col}" stroke-width=".4"/>
        <line x1="${x2}" y1="${y-3}" x2="${x2}" y2="${y+3}" stroke="${col}" stroke-width=".4"/>
        <text x="${(x1+x2)/2}" y="${y-4}" font-family="IBM Plex Mono" font-size="9" fill="#555" text-anchor="middle" font-weight="500">${d.label}</text>`;
    } else if (d.type === 'v') {
      const x = ox + sc(d.x), y1 = oy + sc(d.y1), y2 = oy + sc(d.y2), my = (y1+y2)/2;
      dimsSVG += `<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" stroke="#bbb" stroke-width=".4"/>
        <line x1="${x-3}" y1="${y1}" x2="${x+3}" y2="${y1}" stroke="#bbb" stroke-width=".4"/>
        <line x1="${x-3}" y1="${y2}" x2="${x+3}" y2="${y2}" stroke="#bbb" stroke-width=".4"/>
        <text x="${x+10}" y="${my}" font-family="IBM Plex Mono" font-size="9" fill="#555" text-anchor="start" font-weight="500" transform="rotate(90,${x+10},${my})">${d.label}</text>`;
    }
  }

  // Labels
  let labelsSVG = '';
  for (const l of labels) {
    const x = ox + sc(l.x), y = oy + sc(l.y);
    labelsSVG += `<text x="${x}" y="${y}" font-family="IBM Plex Mono" font-size="7" fill="#b8963e" transform="rotate(${l.rotation},${x},${y})">${l.text}</text>`;
  }

  // Pocket indicators
  let pocketSVG = '';
  if (!isBack && opts?.frontPocket === 'slant') {
    const sx = ox + sc(width), sy = oy;
    pocketSVG += `<line x1="${sx}" y1="${sy}" x2="${sx-sc(3)}" y2="${sy+sc(3.5)}" stroke="#8a4a4a" stroke-width=".8" stroke-dasharray="3,3"/>
      <text x="${sx-sc(3.2)}" y="${sy+sc(3.5)+10}" font-family="IBM Plex Mono" font-size="6.5" fill="#8a4a4a">slant pocket</text>`;
  }
  if (opts?.cargo === 'cargo') {
    const cpX = ox + sc(width), cpY = oy + sc(rise + Math.min(inseam * .2, 2));
    pocketSVG += `<rect x="${cpX-sc(3.5)}" y="${cpY}" width="${sc(3.5)}" height="${sc(4)}" rx="1.5" stroke="#8a4a4a" stroke-width=".6" stroke-dasharray="2,3" fill="rgba(138,74,74,.03)"/>
      <text x="${cpX-sc(3.5)+3}" y="${cpY+sc(4)+9}" font-family="IBM Plex Mono" font-size="6" fill="#8a4a4a">cargo</text>`;
  }
  if (isBack && opts?.backPocket && opts.backPocket !== 'none') {
    const bpX = ox + sc(width * .35), bpY = oy + sc(1.8);
    pocketSVG += `<rect x="${bpX}" y="${bpY}" width="${sc(3)}" height="${sc(3.5)}" rx="2" stroke="#8a4a4a" stroke-width=".6" stroke-dasharray="2,3" fill="rgba(138,74,74,.03)"/>
      <text x="${bpX+2}" y="${bpY+sc(3.5)+9}" font-family="IBM Plex Mono" font-size="6" fill="#8a4a4a">patch pocket</text>`;
  }

  // Reference lines
  const cLineY = oy + sc(rise);
  const gx = ox + sc(width * .42), gy1 = oy + sc(1.8), gy2 = oy + sc(height - 1.8);

  return `<svg viewBox="0 0 ${svgW} ${svgH}" xmlns="http://www.w3.org/2000/svg" style="background:#faf8f4">
    <defs><pattern id="g${piece.id}" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="7" cy="7" r=".4" fill="#eae6de"/></pattern></defs>
    <rect width="${svgW}" height="${svgH}" fill="url(#g${piece.id})"/>
    <path d="${polyPath(svgSA)}" stroke="#4a8a5a" stroke-width=".5" stroke-dasharray="3,3" fill="rgba(74,138,90,.02)"/>
    <path d="${polyPath(svgPoly)}" stroke="#2c2a26" stroke-width="1.2" fill="none"/>
    <line x1="${ox-sc(ext+.4)}" y1="${cLineY}" x2="${ox+sc(width+.2)}" y2="${cLineY}" stroke="#e8e4dc" stroke-width=".4" stroke-dasharray="5,4"/>
    <line x1="${gx}" y1="${gy1}" x2="${gx}" y2="${gy2}" stroke="#2c2a26" stroke-width=".5" stroke-dasharray="8,4"/>
    <polygon points="${gx},${gy1-4} ${gx-2.5},${gy1+2.5} ${gx+2.5},${gy1+2.5}" fill="#2c2a26"/>
    ${dimsSVG}${labelsSVG}${pocketSVG}
    <text x="${sc(mL)}" y="${svgH - 10}" font-family="IBM Plex Mono" font-size="6.5" fill="var(--sa,#4a8a5a)">${fmtInches(sa)} SA · ${fmtInches(hem)} hem · No SA at waist</text>
    <text x="${ox+sc(width/2)}" y="${svgH - 24}" font-family="IBM Plex Mono" font-size="8" fill="var(--text,#2c2a26)" text-anchor="middle" font-weight="500">${piece.name} × 2 (mirror)</text>
    <text x="${ox+sc(width/2)}" y="${svgH - 36}" font-family="IBM Plex Mono" font-size="6.5" fill="var(--accent,#c44)" text-anchor="middle">← CENTER (curve) · · · · · SIDE (straight) →</text>
  </svg>`;
}

/**
 * Render a bodice or sleeve piece as an SVG string.
 * Piece must have: polygon (array of {x,y} in inches), dims (optional), type, name, sa, hem
 */
export function renderGenericPieceSVG(piece) {
  const { polygon, dims = [], type, sa = 0.5, hem = 0.75 } = piece;

  // Compute bounding box
  const xs = polygon.map(p => p.x), ys = polygon.map(p => p.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const pW = maxX - minX, pH = maxY - minY;

  const mL = 2.5, mT = 1.5, mR = 3, mB = 1.5;
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

  // Simple SA offset — shrink polygon by sa amount (approximate inset)
  function insetPoly(pts, offset) {
    // Naïve: scale polygon about centroid
    const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
    const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
    return pts.map(p => ({
      x: cx + (p.x - cx) * (1 - offset / (pW / 2)),
      y: cy + (p.y - cy) * (1 - offset / (pH / 2)),
    }));
  }

  const saPoly = insetPoly(polygon, -(sa));  // outset by sa

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
        <text x="${(x1+x2)/2}" y="${y-4}" font-family="IBM Plex Mono" font-size="9" fill="#555" text-anchor="middle" font-weight="500">${d.label}</text>`;
    } else if (d.type === 'v') {
      const x = ox + sc(d.x), y1 = oy + sc(d.y1), y2 = oy + sc(d.y2), my = (y1+y2)/2;
      dimsSVG += `<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" stroke="#bbb" stroke-width=".4"/>
        <line x1="${x-3}" y1="${y1}" x2="${x+3}" y2="${y1}" stroke="#bbb" stroke-width=".4"/>
        <line x1="${x-3}" y1="${y2}" x2="${x+3}" y2="${y2}" stroke="#bbb" stroke-width=".4"/>
        <text x="${x+10}" y="${my}" font-family="IBM Plex Mono" font-size="9" fill="#555" text-anchor="start" font-weight="500" transform="rotate(90,${x+10},${my})">${d.label}</text>`;
    }
  }

  const pieceLabel = type === 'sleeve' ? 'SLEEVE × 2 (mirror)' : piece.name?.toUpperCase() + ' (cut on fold)';
  const foldNote   = type === 'sleeve' ? '' : '← FOLD EDGE';

  return `<svg viewBox="0 0 ${svgW} ${svgH}" xmlns="http://www.w3.org/2000/svg" style="background:#faf8f4">
    <defs><pattern id="gp${piece.id}" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="7" cy="7" r=".4" fill="#eae6de"/></pattern></defs>
    <rect width="${svgW}" height="${svgH}" fill="url(#gp${piece.id})"/>
    <path d="${polyPath(saPoly)}" stroke="#4a8a5a" stroke-width=".5" stroke-dasharray="3,3" fill="rgba(74,138,90,.02)"/>
    <path d="${polyPath(polygon)}" stroke="#2c2a26" stroke-width="1.2" fill="none"/>
    <line x1="${gx}" y1="${gy1}" x2="${gx}" y2="${gy2}" stroke="#2c2a26" stroke-width=".5" stroke-dasharray="8,4"/>
    <polygon points="${gx},${gy1-4} ${gx-2.5},${gy1+2.5} ${gx+2.5},${gy1+2.5}" fill="#2c2a26"/>
    ${dimsSVG}
    <text x="${sc(mL)}" y="${svgH - sc(0.5)}" font-family="IBM Plex Mono" font-size="6.5" fill="#4a8a5a">${fmtInches(sa)} SA · ${fmtInches(hem)} hem</text>
    <text x="${svgW/2}" y="${svgH - sc(0.1)}" font-family="IBM Plex Mono" font-size="8" fill="#555" text-anchor="middle" font-weight="500">${pieceLabel}</text>
    ${foldNote ? `<text x="${sc(mL)}" y="${oy + sc((minY+maxY)/2)}" font-family="IBM Plex Mono" font-size="7" fill="#b8963e" transform="rotate(-90,${sc(mL)},${oy + sc((minY+maxY)/2)})">${foldNote}</text>` : ''}
  </svg>`;
}
