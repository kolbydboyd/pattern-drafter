/**
 * SVG renderer for pattern pieces.
 * Takes piece objects from garment modules, returns SVG strings.
 */

import { fmtInches, offsetPolygon } from '../engine/geometry.js';

const SC = 20; // 1 inch = 20 SVG units
const sc = i => i * SC;

/**
 * Render a panel piece (front/back) as an SVG string
 */
export function renderPanelSVG(piece) {
  const { width, height, rise, inseam, ext, sa, hem, isBack, cbRaise,
          polygon, saPolygon, dimensions, labels, pleats = [], opts } = piece;

  const mL = 3, mT = 3, mR = 5, mB = 4.5;
  const svgW = sc(mL + width + mR);
  const svgH = sc(mT + height + mB);
  const ox = sc(mL + ext);
  const oy = sc(mT);

  // Scale polygon to SVG coords
  function toSVG(pt) { return { x: ox + sc(pt.x), y: oy + sc(pt.y) }; }
  const svgPoly = polygon.map(toSVG);

  // Force the top edge of the SA outline to be perfectly horizontal.
  // Find the two SA points with the smallest y values (waist corners) and
  // snap them both to the same y: lowest polygon y minus SA distance.
  const waistTopY = Math.min(...polygon.map(p => p.y)) - sa;
  const saCopy = saPolygon.map(p => ({ ...p }));
  const sorted = [...saCopy].sort((a, b) => a.y - b.y);
  sorted[0].y = waistTopY;
  sorted[1].y = waistTopY;

  const svgSA = saCopy.map(toSVG);

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
      const x1 = ox + sc(d.x1), x2 = ox + sc(d.x2), y = oy + sc(d.y1);
      if (d.color === '#c44') {
        // Crotch-ext dimension: place label in the left margin, outside the pattern,
        // right-aligned toward the pattern so it never overlaps the inseam/crotch lines.
        const labelX = x1 - sc(0.5); // 0.5″ to the left of the crotch extension point
        dimsSVG += `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${col}" stroke-width=".4"/>
        <line x1="${x1}" y1="${y-3}" x2="${x1}" y2="${y+3}" stroke="${col}" stroke-width=".4"/>
        <line x1="${x2}" y1="${y-3}" x2="${x2}" y2="${y+3}" stroke="${col}" stroke-width=".4"/>
        <text x="${labelX}" y="${y+3}" font-family="IBM Plex Mono" font-size="9" fill="${col}" text-anchor="end" font-weight="500">${d.label}</text>`;
      } else {
        dimsSVG += `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${col}" stroke-width=".4"/>
        <line x1="${x1}" y1="${y-3}" x2="${x1}" y2="${y+3}" stroke="${col}" stroke-width=".4"/>
        <line x1="${x2}" y1="${y-3}" x2="${x2}" y2="${y+3}" stroke="${col}" stroke-width=".4"/>
        <text x="${(x1+x2)/2}" y="${y-4}" font-family="IBM Plex Mono" font-size="9" fill="#555" text-anchor="middle" font-weight="500">${d.label}</text>`;
      }
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
    // Slash opening: from waist 3.5″ inward from side seam → side seam 6″ below waist
    const slashX1 = ox + sc(width - 3.5);  // waist entry point
    const slashY1 = oy;
    const slashX2 = ox + sc(width);         // side seam exit point
    const slashY2 = oy + sc(6);
    // Pocket bag: ~7″ wide × ~7″ deep behind and below the slash
    const bagL = ox + sc(width - 7);        // left edge of bag
    const bagB = oy + sc(7);               // bottom of bag
    // Bag outline path (dashed): top along waist → left side → bottom → curve to side seam → slash closes shape
    pocketSVG += `<path d="M ${slashX1} ${slashY1} L ${bagL} ${slashY1} L ${bagL} ${bagB} Q ${slashX2} ${bagB} ${slashX2} ${slashY2} Z" stroke="#8a4a4a" stroke-width=".6" stroke-dasharray="2,3" fill="rgba(138,74,74,.03)"/>
      <line x1="${slashX1}" y1="${slashY1}" x2="${slashX2}" y2="${slashY2}" stroke="#8a4a4a" stroke-width="1"/>
      <text x="${bagL + 2}" y="${bagB + 9}" font-family="IBM Plex Mono" font-size="6" fill="#8a4a4a">slant pocket</text>`;
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
    <text x="${midX.toFixed(1)}" y="${(py2 + 9).toFixed(1)}" font-family="IBM Plex Mono" font-size="6" fill="#b8963e" text-anchor="middle">pleat</text>`;
  }

  // Reference lines
  const cLineY = oy + sc(rise);
  const gx = ox + sc(width * .42), gy1 = oy + sc(1.8), gy2 = oy + sc(height - 1.8);

  const legY = svgH - 24;
  const legendSVG = `
    <line x1="10" y1="${legY-3}" x2="26" y2="${legY-3}" stroke="#000" stroke-width="1.5"/>
    <text x="30" y="${legY}" font-family="IBM Plex Mono" font-size="7" fill="#888">cut here</text>
    <line x1="72" y1="${legY-3}" x2="88" y2="${legY-3}" stroke="#666" stroke-width="0.8" stroke-dasharray="4,3"/>
    <text x="92" y="${legY}" font-family="IBM Plex Mono" font-size="7" fill="#888">stitch line</text>
    <line x1="148" y1="${legY-3}" x2="164" y2="${legY-3}" stroke="#4a8a5a" stroke-width="0.8" stroke-dasharray="4,3"/>
    <text x="168" y="${legY}" font-family="IBM Plex Mono" font-size="7" fill="#888">fold line</text>
    <line x1="218" y1="${legY-3}" x2="234" y2="${legY-3}" stroke="#c44" stroke-width="0.8" stroke-dasharray="3,3"/>
    <text x="238" y="${legY}" font-family="IBM Plex Mono" font-size="7" fill="#888">pocket placement</text>`;

  return `<svg viewBox="0 0 ${svgW} ${svgH}" xmlns="http://www.w3.org/2000/svg" style="background:#faf8f4">
    <defs><pattern id="g${piece.id}" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="7" cy="7" r=".4" fill="#eae6de"/></pattern></defs>
    <rect width="${svgW}" height="${svgH}" fill="url(#g${piece.id})"/>
    <path d="${polyPath(svgSA)}" stroke="#000" stroke-width="1.5" fill="rgba(0,0,0,.02)"/>
    <path d="${polyPath(svgPoly)}" stroke="#666" stroke-width="0.8" stroke-dasharray="4,3" fill="none"/>
    <line x1="${ox-sc(ext+.4)}" y1="${cLineY}" x2="${ox+sc(width+.2)}" y2="${cLineY}" stroke="#e8e4dc" stroke-width=".4" stroke-dasharray="5,4"/>
    <line x1="${gx}" y1="${gy1}" x2="${gx}" y2="${gy2}" stroke="#2c2a26" stroke-width=".5" stroke-dasharray="8,4"/>
    <polygon points="${gx},${gy1-4} ${gx-2.5},${gy1+2.5} ${gx+2.5},${gy1+2.5}" fill="#2c2a26"/>
    ${dimsSVG}${labelsSVG}${pocketSVG}${pleatSVG}
    <text x="${ox+sc(width/2)}" y="${svgH - 50}" font-family="IBM Plex Mono" font-size="6.5" fill="var(--accent,#c44)" text-anchor="middle">← CENTER (curve) · · · · · SIDE (straight) →</text>
    <text x="${ox+sc(width/2)}" y="${svgH - 38}" font-family="IBM Plex Mono" font-size="8" fill="var(--text,#2c2a26)" text-anchor="middle" font-weight="500">${piece.name} × 2 (mirror)</text>
    ${legendSVG}
    <text x="10" y="${svgH - 10}" font-family="IBM Plex Mono" font-size="6.5" fill="#555">${fmtInches(sa)} SA included · ${fmtInches(hem)} hem allowance</text>
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

  const mL = 2.5, mT = 1.5, mR = 3, mB = 3;
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
  const saPoly = offsetPolygon(polygon, i => {
    const a = polygon[i], b = polygon[(i + 1) % polygon.length];
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
        <text x="${(x1+x2)/2}" y="${y-4}" font-family="IBM Plex Mono" font-size="9" fill="#555" text-anchor="middle" font-weight="500">${d.label}</text>`;
    } else if (d.type === 'v') {
      const x = ox + sc(d.x), y1 = oy + sc(d.y1), y2 = oy + sc(d.y2), my = (y1+y2)/2;
      dimsSVG += `<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" stroke="#bbb" stroke-width=".4"/>
        <line x1="${x-3}" y1="${y1}" x2="${x+3}" y2="${y1}" stroke="#bbb" stroke-width=".4"/>
        <line x1="${x-3}" y1="${y2}" x2="${x+3}" y2="${y2}" stroke="#bbb" stroke-width=".4"/>
        <text x="${x+10}" y="${my}" font-family="IBM Plex Mono" font-size="9" fill="#555" text-anchor="start" font-weight="500" transform="rotate(90,${x+10},${my})">${d.label}</text>`;
    }
  }

  const pieceLabel = type === 'sleeve'
    ? 'SLEEVE × 2 (mirror)'
    : cutOnFold
      ? piece.name?.toUpperCase() + ' (cut on fold)'
      : piece.name?.toUpperCase() + ' × 2 (mirror)';
  const foldNote   = cutOnFold ? '← FOLD EDGE' : '';

  const legY2 = svgH - 24;
  const legendSVG2 = `
    <line x1="10" y1="${legY2-3}" x2="26" y2="${legY2-3}" stroke="#000" stroke-width="1.5"/>
    <text x="30" y="${legY2}" font-family="IBM Plex Mono" font-size="7" fill="#888">cut here</text>
    <line x1="72" y1="${legY2-3}" x2="88" y2="${legY2-3}" stroke="#666" stroke-width="0.8" stroke-dasharray="4,3"/>
    <text x="92" y="${legY2}" font-family="IBM Plex Mono" font-size="7" fill="#888">stitch line</text>
    <line x1="148" y1="${legY2-3}" x2="164" y2="${legY2-3}" stroke="#4a8a5a" stroke-width="0.8" stroke-dasharray="4,3"/>
    <text x="168" y="${legY2}" font-family="IBM Plex Mono" font-size="7" fill="#888">fold line</text>
    <line x1="218" y1="${legY2-3}" x2="234" y2="${legY2-3}" stroke="#c44" stroke-width="0.8" stroke-dasharray="3,3"/>
    <text x="238" y="${legY2}" font-family="IBM Plex Mono" font-size="7" fill="#888">pocket placement</text>`;

  return `<svg viewBox="0 0 ${svgW} ${svgH}" xmlns="http://www.w3.org/2000/svg" style="background:#faf8f4">
    <defs><pattern id="gp${piece.id}" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="7" cy="7" r=".4" fill="#eae6de"/></pattern></defs>
    <rect width="${svgW}" height="${svgH}" fill="url(#gp${piece.id})"/>
    <path d="${polyPath(saPoly)}" stroke="#000" stroke-width="1.5" fill="rgba(0,0,0,.02)"/>
    <path d="${polyPath(polygon)}" stroke="#666" stroke-width="0.8" stroke-dasharray="4,3" fill="none"/>
    <line x1="${gx}" y1="${gy1}" x2="${gx}" y2="${gy2}" stroke="#2c2a26" stroke-width=".5" stroke-dasharray="8,4"/>
    <polygon points="${gx},${gy1-4} ${gx-2.5},${gy1+2.5} ${gx+2.5},${gy1+2.5}" fill="#2c2a26"/>
    ${dimsSVG}
    <text x="${svgW/2}" y="${svgH - 38}" font-family="IBM Plex Mono" font-size="8" fill="#555" text-anchor="middle" font-weight="500">${pieceLabel}</text>
    ${legendSVG2}
    <text x="10" y="${svgH - 10}" font-family="IBM Plex Mono" font-size="6.5" fill="#555">${fmtInches(sa)} SA included · ${fmtInches(hem)} hem allowance</text>
    ${foldNote ? `<text x="${sc(mL)}" y="${oy + sc((minY+maxY)/2)}" font-family="IBM Plex Mono" font-size="7" fill="#b8963e" transform="rotate(-90,${sc(mL)},${oy + sc((minY+maxY)/2)})">${foldNote}</text>` : ''}
  </svg>`;
}
