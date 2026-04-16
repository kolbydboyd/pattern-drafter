// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Moto Jacket — asymmetric-zip outerwear in three style modes:
 * - Moto / fashion biker (versatile everyday)
 * - Perfecto / double rider (asymmetric zip, wide notch lapel, belt, epaulettes)
 * - Café racer (center zip, band collar, 1960s minimal)
 *
 * Construction: back yoke + panel (CB fold), full front panels L/R,
 * two-piece tailored sleeve (always), notched lapel facing or band collar.
 * Materials: leather, faux leather, waxed canvas, boiled wool.
 */

import {
  shoulderSlope, necklineCurve, armholeCurve, shoulderDropFromWidth,
  armholeDepthFromChest, neckWidthFromCircumference,
  twoPartSleeve, collarCurve, notchedLapelCurve, yokeSplit,
} from '../engine/upper-body.js';
import { sampleBezier, fmtInches, edgeAngle, arcLength, offsetPolygon } from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

const FACING_W       = 3.0;
const FACING_TOP_W   = 2.0;
const ZIP_OFFSET     = 2.5;
const NECK_DEPTH_FRONT = 3.0;
const NECK_DEPTH_BACK  = 1.0;

export default {
  id:         'moto-jacket',
  name:       'Moto Jacket',
  category:   'upper',
  difficulty: 'advanced',
  priceTier:  'tailored',
  measurements: ['chest', 'waist', 'shoulder', 'neck', 'sleeveLength', 'bicep', 'wrist', 'torsoLength'],
  measurementDefaults: { sleeveLength: 26 },

  options: {
    style: {
      type: 'select', label: 'Jacket style',
      values: [
        { value: 'moto',       label: 'Moto / fashion biker',   reference: 'versatile everyday wear' },
        { value: 'perfecto',   label: 'Perfecto (double rider)', reference: 'Schott-inspired, asymmetric zip, full hardware' },
        { value: 'cafe-racer', label: 'Café racer',              reference: 'center zip, band collar, 1960s minimal' },
      ],
      default: 'moto',
    },
    fit: {
      type: 'select', label: 'Fit',
      values: [
        { value: 'slim',     label: 'Slim (+1.5″)',   reference: 'fitted, tailored' },
        { value: 'standard', label: 'Standard (+3″)', reference: 'classic biker ease' },
        { value: 'relaxed',  label: 'Relaxed (+5″)',  reference: 'oversized, layering' },
      ],
      default: 'standard',
    },
    length: {
      type: 'select', label: 'Length',
      values: [
        { value: 'cropped',  label: 'Cropped (at waist)'     },
        { value: 'standard', label: 'Standard (below waist)' },
      ],
      default: 'cropped',
    },
    frontZip: {
      type: 'select', label: 'Front closure',
      values: [
        { value: 'asymmetric', label: 'Asymmetric off-center zip', reference: 'classic biker look' },
        { value: 'center',     label: 'Center zip',                reference: 'café racer style' },
      ],
      default: 'asymmetric',
    },
    lapel: {
      type: 'select', label: 'Collar / lapel',
      values: [
        { value: 'wide-notch',   label: 'Wide notch lapel (3.5″)',   reference: 'classic perfecto' },
        { value: 'narrow-notch', label: 'Narrow notch lapel (2.5″)', reference: 'modern moto' },
        { value: 'band',         label: 'Band collar (mandarin)',     reference: 'café racer' },
        { value: 'collarless',   label: 'Collarless',                reference: 'minimalist' },
      ],
      default: 'narrow-notch',
    },
    belt: {
      type: 'select', label: 'Waist belt',
      values: [
        { value: 'yes', label: 'Waist belt with buckle', reference: 'perfecto detail' },
        { value: 'no',  label: 'No belt' },
      ],
      default: 'no',
    },
    epaulettes: {
      type: 'select', label: 'Epaulettes',
      values: [
        { value: 'yes', label: 'Shoulder epaulettes with snap', reference: 'classic biker hardware' },
        { value: 'no',  label: 'None' },
      ],
      default: 'no',
    },
    sidePockets: {
      type: 'select', label: 'Side pockets',
      values: [
        { value: 'zip-welt',  label: 'Zip welt pockets ×2',  reference: 'standard moto' },
        { value: 'zip-patch', label: 'Zip patch pockets ×2'  },
        { value: 'none',      label: 'None'                  },
      ],
      default: 'zip-welt',
    },
    chestPocket: {
      type: 'select', label: 'Chest pocket',
      values: [
        { value: 'yes', label: 'Zip welt chest pocket (left chest)' },
        { value: 'no',  label: 'None' },
      ],
      default: 'no',
    },
    cuff: {
      type: 'select', label: 'Cuff style',
      values: [
        { value: 'zip-gusset', label: 'Zip gusset cuff',  reference: '5″ zip + 1.5″ gore, classic moto' },
        { value: 'snap-tab',   label: 'Snap tab cuff',    reference: 'clean, minimal' },
        { value: 'plain',      label: 'Plain hemmed cuff' },
      ],
      default: 'zip-gusset',
    },
    lining: {
      type: 'select', label: 'Lining',
      values: [
        { value: 'full',    label: 'Fully lined (Bemberg / charmeuse)'  },
        { value: 'quilted', label: 'Quilted lining (diamond quilt)'     },
        { value: 'half',    label: 'Half lining (body only)'            },
        { value: 'none',    label: 'Unlined / serged seams'             },
      ],
      default: 'full',
    },
    sa: {
      type: 'select', label: 'Seam allowance',
      values: [
        { value: 0.375, label: '⅜″ (leather / faux leather)' },
        { value: 0.625, label: '⅝″ (woven / waxed canvas)'   },
      ],
      default: 0.375,
    },
  },

  pieces(m, opts) {
    const sa  = parseFloat(opts.sa);
    const hem = 1.25;
    const totalEase   = opts.fit === 'slim' ? 1.5 : opts.fit === 'relaxed' ? 5 : 3;
    const panelW      = (m.chest + totalEase) / 4;
    const neckW       = neckWidthFromCircumference(m.neck);
    const shoulderW   = (m.shoulder / 2) - neckW;
    const slopeDrop   = shoulderDropFromWidth(shoulderW);
    const shoulderPtX = neckW + shoulderW;
    const armholeY    = armholeDepthFromChest(m.chest, opts.fit === 'relaxed' ? 'oversized' : 'standard');
    const armholeDepth = armholeY - slopeDrop;
    const chestDepth  = panelW - shoulderPtX;
    const torsoLen    = m.torsoLength + (opts.length === 'standard' ? 2 : 0);
    const slvLength   = m.sleeveLength ?? 26;
    const effArmToElbow = m.armToElbow || (slvLength * 0.55);
    const shoulderPtY = slopeDrop;

    function sc(cp, steps = 12) { return sampleBezier(cp.p0, cp.p1, cp.p2, cp.p3, steps); }
    function pts2path(poly) {
      let d = `M ${poly[0].x.toFixed(2)} ${poly[0].y.toFixed(2)}`;
      for (let i = 1; i < poly.length; i++) d += ` L ${poly[i].x.toFixed(2)} ${poly[i].y.toFixed(2)}`;
      return d + ' Z';
    }
    function bbox(poly) {
      const xs = poly.map(p => p.x), ys = poly.map(p => p.y);
      return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) };
    }

    // Bodice curves
    const frontNeckPts = sc(necklineCurve(neckW, NECK_DEPTH_FRONT, 'crew'));
    const backNeckPts  = sc(necklineCurve(neckW, NECK_DEPTH_BACK,  'crew'));
    const shoulderPts  = sc(shoulderSlope(shoulderW, slopeDrop));
    const frontArmCp   = armholeCurve(shoulderW, chestDepth, armholeDepth, false);
    const backArmCp    = armholeCurve(shoulderW, chestDepth, armholeDepth, true);
    const frontArmPts  = sc(frontArmCp);
    const backArmPts   = sc(backArmCp);
    const sideX        = shoulderPtX + chestDepth;

    // Back yoke: straight seam at 25% of armhole depth
    const yokeDepth = armholeDepth * 0.25;
    const backYokePt = yokeSplit(backArmCp, yokeDepth);
    const backYokeX  = backYokePt ? shoulderPtX + backYokePt.x : sideX;
    const yokeLineY  = shoulderPtY + yokeDepth;

    // Back yoke polygon (cut on fold at CB)
    const backYokePoly = [];
    for (const p of [...backNeckPts].reverse()) backYokePoly.push({ x: neckW - p.x, y: p.y });
    for (let i = 1; i < shoulderPts.length; i++) backYokePoly.push({ x: neckW + shoulderPts[i].x, y: shoulderPts[i].y });
    for (let i = 1; i < backArmPts.length; i++) {
      const pt = { x: shoulderPtX + backArmPts[i].x, y: shoulderPtY + backArmPts[i].y };
      if (pt.y > yokeLineY) break;
      backYokePoly.push(pt);
    }
    backYokePoly.push({ x: backYokeX, y: yokeLineY });
    backYokePoly.push({ x: 0, y: yokeLineY });

    // Back panel polygon (below yoke, cut on fold at CB)
    const backPanelPoly = [{ x: 0, y: yokeLineY }, { x: backYokeX, y: yokeLineY }];
    for (let i = 0; i < backArmPts.length; i++) {
      const pt = { x: shoulderPtX + backArmPts[i].x, y: shoulderPtY + backArmPts[i].y };
      if (pt.y <= yokeLineY) continue;
      backPanelPoly.push(pt);
    }
    backPanelPoly.push({ x: sideX, y: torsoLen });
    backPanelPoly.push({ x: 0, y: torsoLen });

    // Lapel geometry — computed before front panel so the panel can include lapel outline
    const lapelW        = opts.lapel === 'wide-notch' ? 3.5 : 2.5;
    const breakPointY   = armholeDepth * 0.85;
    const hasNotchLapel = opts.lapel === 'wide-notch' || opts.lapel === 'narrow-notch';
    const frontNeckArc  = arcLength(frontNeckPts);
    const backNeckArc   = arcLength(backNeckPts);
    const halfNeckArc   = frontNeckArc + backNeckArc + shoulderW;

    let lapelResult = null, collarResult = null;
    if (hasNotchLapel) {
      lapelResult = notchedLapelCurve({
        neckDepthFront: NECK_DEPTH_FRONT, breakPointY, lapelWidth: lapelW,
        gorgeAngle: opts.lapel === 'wide-notch' ? 35 : 28,
      });
      collarResult = collarCurve({ neckArc: halfNeckArc, collarWidth: opts.lapel === 'wide-notch' ? 3.5 : 3.0, style: 'point', standHeight: 1.25 });
    }

    // Front panels — for asymmetric zip the left panel extends ZIP_OFFSET past CF.
    // When hasNotchLapel, the panel includes the lapel outline (traditional tailoring).
    const asymmetric = opts.frontZip === 'asymmetric';
    const cfX = asymmetric ? -ZIP_OFFSET : 0;

    function buildFrontPanel(cfOffset) {
      const poly = [];
      poly.push({ x: neckW, y: 0 }); // shoulder-neck junction
      for (let i = 1; i < shoulderPts.length; i++) poly.push({ x: neckW + shoulderPts[i].x, y: shoulderPts[i].y });
      for (let i = 1; i < frontArmPts.length; i++) poly.push({ x: shoulderPtX + frontArmPts[i].x, y: shoulderPtY + frontArmPts[i].y });
      poly.push({ x: sideX, y: torsoLen });
      poly.push({ x: cfOffset, y: torsoLen }); // hem to CF (or zip offset for asymmetric)
      if (hasNotchLapel && lapelResult) {
        // Up CF / zip line to break point, then lapel outline, then partial neckline
        poly.push({ x: 0, y: breakPointY });
        const gorgePt = lapelResult.gorgePoint;
        for (let i = 1; i < lapelResult.lapelPoints.length; i++) {
          const p = lapelResult.lapelPoints[i];
          poly.push({ x: p.x, y: p.y });
          if (p.x === gorgePt.x && p.y === gorgePt.y) break;
        }
        // Partial neckline from gorgePoint → shoulder-neck (gorge-side → shoulder-side)
        const neckForPanel = frontNeckPts
          .map(p => ({ x: neckW - p.x, y: p.y }))
          .filter(p => p.x > gorgePt.x + 0.01);
        neckForPanel.sort((a, b) => a.x - b.x);
        for (const p of neckForPanel) poly.push(p);
      } else {
        // No lapel — simple reversed neckline CF → shoulder
        for (const p of [...frontNeckPts].reverse()) poly.push({ x: neckW - p.x, y: p.y });
      }
      return poly;
    }
    const frontPanelPoly = buildFrontPanel(cfX);
    const rightFlapPoly  = asymmetric ? buildFrontPanel(0) : null;

    // Two-piece sleeve (always)
    const frontArmArc = arcLength(frontArmPts);
    const backArmArc  = arcLength(backArmPts);
    const armholeArc  = frontArmArc + backArmArc;
    const sleeveResult = twoPartSleeve({
      bicep: m.bicep, sleeveLength: slvLength,
      armToElbow: effArmToElbow, wrist: m.wrist || m.bicep * 0.55,
      armholeArc, capEaseTarget: 1.5, sleeveBend: 10,
      bicepEase: totalEase > 3 ? 0.20 : 0.15,
    });
    const capEase = sleeveResult.capArc - armholeArc;
    if (capEase < 0.5 || capEase > 3) console.warn(`[moto-jacket] cap ease out of range: ${capEase.toFixed(2)}″`);
    const capEaseNote = `Cap: ${fmtInches(sleeveResult.capArc)}, Armhole: ${fmtInches(armholeArc)}, Ease: ${fmtInches(capEase)}`;

    // Bounding boxes
    const byBB  = bbox(backYokePoly);
    const bpBB  = bbox(backPanelPoly);
    const fpBB  = bbox(frontPanelPoly);
    const tsBB  = bbox(sleeveResult.topSleeve);
    const usBB  = bbox(sleeveResult.underSleeve);

    const shoulderMidX = neckW + shoulderW / 2;
    const shoulderMidY = slopeDrop / 2;
    const yokeNotch = [{ x: shoulderMidX, y: shoulderMidY, angle: edgeAngle({ x: neckW, y: 0 }, { x: shoulderPtX, y: slopeDrop }) }];

    const pieces = [];

    // ── BACK YOKE ─────────────────────────────────────────────────────────────
    pieces.push({
      id: 'back-yoke', name: 'Back Yoke',
      instruction: 'Cut 1 on fold (CB) · Straight seam at base · Joins to back panel',
      type: 'bodice', polygon: backYokePoly, path: pts2path(backYokePoly),
      width: byBB.maxX - byBB.minX, height: byBB.maxY - byBB.minY,
      isBack: true, sa, hem: 0, notches: yokeNotch,
      dims: [
        { label: fmtInches(panelW) + ' half width', x1: 0, y1: -0.5, x2: panelW, y2: -0.5, type: 'h' },
        { label: fmtInches(yokeLineY) + ' depth', x: byBB.maxX + 1, y1: 0, y2: yokeLineY, type: 'v' },
      ],
    });

    // ── BACK PANEL ────────────────────────────────────────────────────────────
    pieces.push({
      id: 'back-panel', name: 'Back Panel',
      instruction: 'Cut 1 on fold (CB) · Joins to back yoke at top, side seams at sides',
      type: 'bodice', polygon: backPanelPoly, path: pts2path(backPanelPoly),
      width: bpBB.maxX - bpBB.minX, height: bpBB.maxY - bpBB.minY,
      isBack: true, sa, hem,
      notches: [{ x: sideX, y: armholeY, angle: 0 }, { x: sideX, y: armholeY + 0.25, angle: 0 }],
      dims: [
        { label: fmtInches(panelW) + ' half width', x1: 0, y1: yokeLineY - 0.5, x2: panelW, y2: yokeLineY - 0.5, type: 'h' },
        { label: fmtInches(torsoLen - yokeLineY) + ' length', x: bpBB.maxX + 1, y1: yokeLineY, y2: torsoLen, type: 'v' },
      ],
    });

    // ── FRONT PANELS ──────────────────────────────────────────────────────────
    pieces.push({
      id: 'front-panel', name: asymmetric ? 'Front Panel (Left)' : 'Front Panel',
      instruction: asymmetric
        ? `Cut 1 · Left side, extends ${fmtInches(ZIP_OFFSET)} past CF for asymmetric zip overlap`
        : 'Cut 2 (L & R mirror) · Panels meet at CF for center zip',
      type: 'bodice', polygon: frontPanelPoly, path: pts2path(frontPanelPoly),
      width: fpBB.maxX - fpBB.minX, height: fpBB.maxY - fpBB.minY,
      isBack: false, sa, hem,
      notches: [{ x: sideX, y: armholeY, angle: 0 }],
      dims: [
        { label: fmtInches(panelW + (asymmetric ? ZIP_OFFSET : 0)) + ' width', x1: cfX, y1: -0.5, x2: panelW, y2: -0.5, type: 'h' },
        { label: fmtInches(torsoLen) + ' length', x: fpBB.maxX + 1, y1: 0, y2: torsoLen, type: 'v' },
      ],
    });

    if (asymmetric && rightFlapPoly) {
      const rfBB = bbox(rightFlapPoly);
      pieces.push({
        id: 'front-panel-right', name: 'Front Panel (Right)',
        instruction: 'Cut 1 · Right lap flap · CF edge at zip centerline · Narrower than left panel',
        type: 'bodice', polygon: rightFlapPoly, path: pts2path(rightFlapPoly),
        width: rfBB.maxX - rfBB.minX, height: rfBB.maxY - rfBB.minY,
        isBack: false, sa, hem,
        notches: [{ x: sideX, y: armholeY, angle: 0 }],
        dims: [{ label: fmtInches(panelW) + ' width', x1: 0, y1: -0.5, x2: panelW, y2: -0.5, type: 'h' }],
      });
    }

    // ── TWO-PIECE SLEEVE ──────────────────────────────────────────────────────
    const { crown, backPitchPt, frontPitchPt, tsElbowLeft, usElbowLeft } = sleeveResult.landmarks;
    pieces.push({
      id: 'top-sleeve', name: 'Top Sleeve',
      instruction: `Cut 2 (L & R mirror) · Outer arm · Two-piece tailored · ${capEaseNote}`,
      type: 'sleeve', polygon: sleeveResult.topSleeve, path: pts2path(sleeveResult.topSleeve),
      width: tsBB.maxX - tsBB.minX, height: tsBB.maxY - tsBB.minY,
      capHeight: sleeveResult.capHeight, sleeveLength: slvLength, sleeveWidth: sleeveResult.topSleeveWidth,
      sa, hem,
      notches: [
        { x: crown.x,             y: crown.y,        angle: -90 },
        { x: frontPitchPt.x,      y: frontPitchPt.y, angle: 180 },
        { x: backPitchPt.x,       y: backPitchPt.y,  angle: 0   },
        { x: backPitchPt.x + 0.3, y: backPitchPt.y,  angle: 0   },
        { x: tsElbowLeft.x,       y: tsElbowLeft.y,  angle: 180 },
      ],
      dims: [
        { label: fmtInches(sleeveResult.topSleeveWidth) + ' width', x1: tsBB.minX, y1: sleeveResult.capHeight + 0.4, x2: tsBB.maxX, y2: sleeveResult.capHeight + 0.4, type: 'h' },
        { label: fmtInches(slvLength) + ' length', x: tsBB.maxX + 1, y1: 0, y2: slvLength + sleeveResult.capHeight, type: 'v' },
        { label: fmtInches(effArmToElbow) + ' to elbow', x: tsBB.minX - 1.5, y1: sleeveResult.capHeight, y2: sleeveResult.elbowY, type: 'v', color: '#b8963e' },
      ],
    });
    pieces.push({
      id: 'under-sleeve', name: 'Under Sleeve',
      instruction: 'Cut 2 (L & R mirror) · Inner arm · Joins to top sleeve at front and back seams',
      type: 'sleeve', polygon: sleeveResult.underSleeve, path: pts2path(sleeveResult.underSleeve),
      width: usBB.maxX - usBB.minX, height: usBB.maxY - usBB.minY,
      capHeight: sleeveResult.capHeight, sleeveLength: slvLength, sleeveWidth: sleeveResult.underSleeveWidth,
      sa, hem,
      notches: [{ x: usElbowLeft.x, y: usElbowLeft.y, angle: 0 }],
      dims: [
        { label: fmtInches(sleeveResult.underSleeveWidth) + ' width', x1: usBB.minX, y1: sleeveResult.capHeight + 0.4, x2: usBB.maxX, y2: sleeveResult.capHeight + 0.4, type: 'h' },
        { label: fmtInches(slvLength) + ' length', x: usBB.maxX + 1, y1: 0, y2: slvLength + sleeveResult.capHeight, type: 'v' },
      ],
    });

    // ── COLLAR / LAPEL ────────────────────────────────────────────────────────
    if (hasNotchLapel && lapelResult && collarResult) {
      const gorgePt = lapelResult.gorgePoint;
      // True facing: mirrors the lapel area from the front panel, then tapers as a CF strip.
      // Reuse the exact same lapelPoints slice used in buildFrontPanel (break → gorgePoint).
      const lapelForFacing = [];
      for (let i = 0; i < lapelResult.lapelPoints.length; i++) {
        const p = lapelResult.lapelPoints[i];
        lapelForFacing.push({ x: p.x, y: p.y });
        if (p.x === gorgePt.x && p.y === gorgePt.y) break;
      }
      const facingPoly = [...lapelForFacing];
      facingPoly.push({ x: FACING_TOP_W, y: NECK_DEPTH_FRONT }); // step inward at neck
      facingPoly.push({ x: FACING_W, y: torsoLen });              // CF strip to hem
      facingPoly.push({ x: 0, y: torsoLen });                     // across hem to CF zip line
      facingPoly.push({ x: 0, y: breakPointY });                  // up CF to break (closes to lapelForFacing[0])

      const lapelSa = Math.min(sa, 0.375);
      const lapelEdgeCount = lapelForFacing.length - 1;
      const facingEdges = [];
      for (let i = 0; i < lapelEdgeCount; i++) facingEdges.push({ sa: lapelSa, label: 'Lapel' });
      facingEdges.push({ sa, label: 'Neck-step' }, { sa: hem, label: 'Hem' }, { sa, label: 'CF' }, { sa, label: 'Break' });

      const rawSA = offsetPolygon(facingPoly, (i) => -(facingEdges[i]?.sa ?? sa));
      const clippedSA = [];
      for (let i = 0; i < rawSA.length; i++) {
        clippedSA.push(rawSA[i]);
        const a = rawSA[i], b = rawSA[(i + 1) % rawSA.length];
        for (let j = i + 2; j < rawSA.length; j++) {
          if (j === rawSA.length - 1 && i === 0) continue;
          const c = rawSA[j], d = rawSA[(j + 1) % rawSA.length];
          const d1x = b.x - a.x, d1y = b.y - a.y, d2x = d.x - c.x, d2y = d.y - c.y;
          const denom = d1x * d2y - d1y * d2x;
          if (Math.abs(denom) < 1e-10) continue;
          const t = ((c.x - a.x) * d2y - (c.y - a.y) * d2x) / denom;
          const u = ((c.x - a.x) * d1y - (c.y - a.y) * d1x) / denom;
          if (t > 0.01 && t < 0.99 && u > 0.01 && u < 0.99) {
            clippedSA.push({ x: a.x + d1x * t, y: a.y + d1y * t });
            i = j; break;
          }
        }
      }

      const fBB = bbox(facingPoly);
      const ucBB = bbox(collarResult.upperCollar);
      const lcBB = bbox(collarResult.underCollar);
      pieces.push({
        id: 'front-facing', name: 'Front Facing',
        instruction: `Cut 2 (L & R mirror) · Interface · Mirrors the ${opts.lapel === 'wide-notch' ? 'wide notch' : 'narrow notch'} lapel of the front panel plus ${fmtInches(FACING_W)} CF strip to hem`,
        type: 'bodice', polygon: facingPoly, saPolygon: clippedSA, path: pts2path(facingPoly),
        edgeAllowances: facingEdges,
        rollLine: { from: { x: 0, y: breakPointY }, to: { x: gorgePt.x, y: gorgePt.y }, label: 'roll line' },
        notches: [{ x: gorgePt.x, y: gorgePt.y, angle: 0 }, { x: 0, y: breakPointY, angle: 180 }],
        width: fBB.maxX - fBB.minX, height: fBB.maxY - fBB.minY, isBack: false, sa,
      });
      pieces.push({
        id: 'upper-collar', name: 'Upper Collar',
        instruction: `Cut 1 on fold (CB) · Interface · ${fmtInches(opts.lapel === 'wide-notch' ? 3.5 : 3.0)} wide · Outer visible collar`,
        type: 'bodice', polygon: collarResult.upperCollar, path: pts2path(collarResult.upperCollar),
        width: ucBB.maxX - ucBB.minX, height: ucBB.maxY - ucBB.minY, isBack: false, sa, hem: 0,
        dims: [{ label: fmtInches(collarResult.standLength) + ' half length', x1: 0, y1: -0.5, x2: collarResult.standLength, y2: -0.5, type: 'h' }],
      });
      pieces.push({
        id: 'under-collar', name: 'Under Collar',
        instruction: 'Cut 1 on fold (CB) · Interface 2 layers · 2% smaller than upper collar for seam roll',
        type: 'bodice', polygon: collarResult.underCollar, path: pts2path(collarResult.underCollar),
        width: lcBB.maxX - lcBB.minX, height: lcBB.maxY - lcBB.minY, isBack: false, sa, hem: 0,
      });
    }

    if (opts.lapel === 'band') {
      const bandLen = halfNeckArc + 0.5;
      pieces.push({
        id: 'band-collar', name: 'Band Collar',
        instruction: `Cut 2 (outer + facing) on fold (CB) · ${fmtInches(bandLen)} × 3″ · Interface outer · Mandarin / café racer collar`,
        type: 'rectangle', dimensions: { length: bandLen, width: 3 }, sa,
      });
    }

    // ── CUFF ──────────────────────────────────────────────────────────────────
    const wristCirc = (m.wrist || m.bicep * 0.55) + 1;
    if (opts.cuff === 'zip-gusset') {
      pieces.push({ id: 'sleeve-zip-gusset', name: 'Sleeve Zip Gusset', instruction: 'Cut 4 (2 × L + 2 × R mirror) · 1.5″ × 4″ gore at wrist · Fits 5″ cuff zip', type: 'rectangle', dimensions: { length: 4, width: 1.5 }, sa });
    } else if (opts.cuff === 'snap-tab') {
      pieces.push({ id: 'snap-cuff-tab', name: 'Snap Cuff Tab', instruction: `Cut 4 (2 outer + 2 facing) · ${fmtInches(wristCirc / 2 + 1)} × 2.5″ · Interface outer · Snap at tip`, type: 'rectangle', dimensions: { length: wristCirc / 2 + 1, width: 2.5 }, sa });
    }

    // ── HARDWARE ──────────────────────────────────────────────────────────────
    if (opts.belt === 'yes') {
      const beltLen = (m.waist || m.chest * 0.85) + 5;
      pieces.push({ id: 'waist-belt', name: 'Waist Belt', instruction: `Cut 2 (outer + facing) · ${fmtInches(beltLen)} × 3″ fold to 1.5″ finished · Buckle at right end`, type: 'rectangle', dimensions: { length: beltLen, width: 3 }, sa });
      pieces.push({ id: 'belt-tab', name: 'Belt Side Tab', instruction: 'Cut 4 (2 × L + 2 × R) · 1.25″ × 3.5″ · Loop through side seam · D-ring attachment', type: 'rectangle', dimensions: { length: 3.5, width: 1.25 }, sa });
    }
    if (opts.epaulettes === 'yes') {
      pieces.push({ id: 'epaulette', name: 'Epaulette', instruction: 'Cut 4 (2 outer + 2 facing) · 3″ × 2″ · Interface · Stitched at shoulder seam · Snap at tip toward collar', type: 'rectangle', dimensions: { length: 3, width: 2 }, sa });
    }

    // ── SIDE POCKETS ──────────────────────────────────────────────────────────
    if (opts.sidePockets !== 'none') {
      if (opts.sidePockets === 'zip-welt') {
        pieces.push({ id: 'side-pocket-welt', name: 'Side Zip Pocket Welt', instruction: 'Cut 4 (2 outer + 2 facing) · 6.5″ × 1.25″ · Interface · 6–7″ metal #3 zipper', type: 'pocket', dimensions: { width: 6.5, height: 1.25 }, sa });
        pieces.push({ id: 'side-pocket-bag', name: 'Side Pocket Bag', instruction: 'Cut 4 (2 × L + 2 × R) · 6.5″ × 8″ · Self or lining fabric', type: 'pocket', dimensions: { width: 6.5, height: 8 }, sa });
      } else {
        pieces.push({ id: 'side-pocket-patch', name: 'Side Zip Patch Pocket', instruction: 'Cut 2 · 6.5″ × 8″ · Interface · Zip at top edge · Topstitch to front panel', type: 'pocket', dimensions: { width: 6.5, height: 8 }, sa });
      }
    }

    // ── CHEST POCKET ──────────────────────────────────────────────────────────
    if (opts.chestPocket === 'yes') {
      pieces.push({ id: 'chest-pocket-welt', name: 'Chest Zip Pocket Welt', instruction: 'Cut 2 (outer + facing) · 5.5″ × 1.25″ · Interface · Left chest · 5–6″ metal #3 zipper', type: 'pocket', dimensions: { width: 5.5, height: 1.25 }, sa });
      pieces.push({ id: 'chest-pocket-bag', name: 'Chest Pocket Bag', instruction: 'Cut 2 · 5.5″ × 7″ · Self or lining fabric', type: 'pocket', dimensions: { width: 5.5, height: 7 }, sa });
    }

    // ── LINING ────────────────────────────────────────────────────────────────
    if (opts.lining !== 'none') {
      const LIFT = 1.0;
      const fLin = frontPanelPoly.map(p => ({ x: p.x, y: Math.min(p.y, torsoLen - LIFT) }));
      const bLin = backPanelPoly.map( p => ({ x: p.x, y: Math.min(p.y, torsoLen - LIFT) }));
      const flBB = bbox(fLin), blBB = bbox(bLin);
      const quilted = opts.lining === 'quilted';
      pieces.push({
        id: 'front-lining', name: 'Front Lining',
        instruction: [asymmetric ? 'Cut 1' : 'Cut 2 (L & R mirror)', quilted ? 'Quilt before cutting' : 'Bemberg or charmeuse', `Hem ${fmtInches(LIFT)} shorter than shell`].join(' · '),
        type: 'bodice', polygon: fLin, path: pts2path(fLin), width: flBB.maxX - flBB.minX, height: flBB.maxY - flBB.minY, isBack: false, sa, hem: 0.75,
      });
      pieces.push({
        id: 'back-lining', name: 'Back Lining',
        instruction: ['Cut 1 on fold (CB)', quilted ? 'Quilt before cutting' : 'Bemberg or charmeuse', `Hem ${fmtInches(LIFT)} shorter than shell`].join(' · '),
        type: 'bodice', polygon: bLin, path: pts2path(bLin), width: blBB.maxX - blBB.minX, height: blBB.maxY - blBB.minY, isBack: true, sa, hem: 0.75,
      });
      if (opts.lining === 'full' || quilted) {
        const slvW = sleeveResult.topSleeveWidth;
        const slvH = slvLength + sleeveResult.capHeight - LIFT;
        pieces.push({ id: 'sleeve-lining', name: 'Sleeve Lining', instruction: `Cut 4 (top + under × 2) · ${fmtInches(slvW)} × ${fmtInches(slvH)} · Attach at armhole, hem ⅜″ above shell sleeve hem`, type: 'rectangle', dimensions: { length: slvW, width: slvH }, sa });
      }
    }

    return pieces;
  },

  materials(m, opts) {
    const notions = [
      { ref: 'interfacing-med', quantity: '1.5 yd (collar, facings, welts, cuffs)' },
    ];
    const zipLen = opts.frontZip === 'asymmetric' ? 22 : 20;
    notions.push({ name: 'Separating zipper (main front)', quantity: '1', notes: `${zipLen}″ metal #5 YKK or equivalent · Brass for perfecto style` });
    if (opts.sidePockets !== 'none') notions.push({ name: 'Side pocket zippers', quantity: '2', notes: '6–7″ metal #3' });
    if (opts.chestPocket === 'yes') notions.push({ name: 'Chest pocket zipper', quantity: '1', notes: '5–6″ metal #3' });
    if (opts.cuff === 'zip-gusset') notions.push({ name: 'Sleeve cuff zippers', quantity: '2', notes: '5″ metal #3, one per sleeve gusset' });
    const snapCount = (opts.lapel !== 'collarless' ? 2 : 0) + (opts.epaulettes === 'yes' ? 4 : 0) + (opts.cuff === 'snap-tab' ? 2 : 0);
    if (snapCount > 0) notions.push({ name: 'Heavy-duty snaps size 24', quantity: `${snapCount}`, notes: 'Collar tab, epaulettes, cuff tabs' });
    if (opts.belt === 'yes') notions.push({ name: 'Belt buckle with prong (1.25–1.5″ solid brass)', quantity: '1', notes: 'Or D-rings ×2 for tab attachment' });
    if (opts.lining !== 'none') {
      const linYd = opts.lining === 'full' ? 2.5 : opts.lining === 'quilted' ? 2 : 1.5;
      notions.push({ name: opts.lining === 'quilted' ? 'Quilted lining fabric' : 'Lining fabric', quantity: `${linYd} yd`, notes: opts.lining === 'quilted' ? 'Diamond quilt ¾″ grid pre-made or self-quilt' : 'Bemberg, China silk, or polyester charmeuse' });
    }
    return buildMaterialsSpec({
      fabrics: ['genuine-leather', 'faux-leather-pu', 'waxed-canvas', 'boiled-wool'],
      notions,
      thread: 'poly-heavy',
      needle: 'leather-90',
      stitches: ['straight-3', 'straight-3.5', 'bartack', 'topstitch'],
      notes: [
        'For leather: use leather needles (size 90–100) and hold seams with binder clips — no pins',
        'For leather or faux leather: ⅜″ SA recommended — seams lie flatter with no fraying',
        'Pre-wash faux leather and waxed canvas before cutting',
        'Interface lapel facing, welt strips, and collar on WS before cutting final pieces',
        opts.lining !== 'none' ? 'Sew lining separately and attach at neckline and zip tape · Slip-stitch hem loosely' : 'Serge or bind all raw seams on woven fabrics',
        opts.belt === 'yes' ? 'Belt: fold in half lengthwise {WST}, topstitch all 4 edges at 3mm for firm band' : '',
        opts.epaulettes === 'yes' ? 'Epaulettes: sew outer to facing {RST}, turn, topstitch, catch in shoulder seam' : '',
      ].filter(Boolean),
    });
  },

  instructions(m, opts) {
    const steps = [];
    let n = 1;
    const asymmetric = opts.frontZip === 'asymmetric';
    const hasNotchLapel = opts.lapel === 'wide-notch' || opts.lapel === 'narrow-notch';

    steps.push({ step: n++, title: 'Interface and prepare pieces', detail: 'Apply medium woven interfacing to WS of: front facings + lapel pieces, collar pieces, welt strips, and cuff tabs. For leather: apply interfacing with leather adhesive or press cloth on low heat — test on scrap first.' });

    if (opts.epaulettes === 'yes') {
      steps.push({ step: n++, title: 'Sew epaulettes', detail: 'Sew epaulette outer to facing {RST} on 3 sides, leave shoulder end open. Trim to 3mm, {clip} corners. Turn RS out, push corners with {point turner}. {press}. {topstitch} at 3mm. Install snap at free tip. Set aside — will be caught in shoulder seam.' });
    }

    steps.push({ step: n++, title: 'Sew back yoke to back panel', detail: 'Sew back yoke to back panel at straight yoke seam {RST}. {press} SA toward yoke. {topstitch} at 3.5mm. Keep seam level across full width.' });

    steps.push({ step: n++, title: 'Sew shoulder seams', detail: asymmetric ? 'Join left front panel to back yoke at left shoulder {RST}. Join right front flap to back yoke at right shoulder {RST}. {press} both SAs toward back. {topstitch} at 3.5mm.' : 'Join front panels to back yoke at both shoulder seams {RST}. {press} SA toward back. {topstitch} at 3.5mm.' });

    if (opts.epaulettes === 'yes') {
      steps.push({ step: n++, title: 'Catch epaulettes in shoulder seam', detail: 'Pin epaulette raw edge into shoulder seam SA before final topstitch, snap tip pointing toward collar. Sew through all layers. Epaulette lies flat against shoulder.' });
    }

    if (hasNotchLapel) {
      steps.push({ step: n++, title: 'Prepare two-piece collar', detail: 'Interface upper collar with 1 layer, under collar with 2 layers. Sew outer (fall) edge and both CF ends {RST}. Trim to 3mm, {clip} corners. Turn RS out, {press}. {topstitch} outer edge at 3.5mm. Leave neckline edge raw.' });
      steps.push({ step: n++, title: 'Attach facing with lapel to front panel', detail: 'Sew facing + lapel piece to front panel at CF edge {RST} from hem to gorge point. {clip} curve at gorge. Fold facing to WS along roll line. {press} roll. {topstitch} facing inner edge to garment on WS.' });
    } else if (opts.lapel === 'band') {
      steps.push({ step: n++, title: 'Prepare band collar', detail: 'Interface outer band. Sew outer to facing {RST} along both short ends and top edge. Trim, turn RS out, {press}. Leave neckline edge open for attachment.' });
    }

    if (opts.chestPocket === 'yes') {
      steps.push({ step: n++, title: 'Sew chest zip pocket', detail: 'Mark pocket on left front 1.5″ below shoulder seam, centered on panel. Interface welt. Sew welt around zipper tape {RST}. Cut pocket slit, push welt through. {topstitch} welt. Sew pocket bags to welt edges. Bar tack all corners.' });
    }

    if (opts.sidePockets !== 'none') {
      steps.push({ step: n++, title: `Sew side ${opts.sidePockets === 'zip-welt' ? 'zip welt' : 'zip patch'} pockets`, detail: opts.sidePockets === 'zip-welt' ? 'Mark pocket at hip on each front panel. Interface welt. Sew welt around zipper tape. Cut slit, push welt through. {topstitch}. Attach pocket bags. Bar tack corners.' : 'Position patch pocket on front panel at hip. {topstitch} 3 sides. Sew zip to top edge. Bar tack top corners.' });
    }

    steps.push({ step: n++, title: `Install main front zipper (${asymmetric ? 'asymmetric' : 'center'})`, detail: asymmetric ? 'Baste left panel CF-offset edge to one zipper tape. Baste right flap CF edge to other tape. The zip runs diagonally from lower-left hem to upper-right collar notch. Test alignment before final stitch. {topstitch} close to teeth on both sides.' : 'Pin zipper tape to CF edges of both panels {RST}. Sew both sides with zipper foot. {topstitch} at 3mm from teeth.' });

    if (hasNotchLapel || opts.lapel === 'band') {
      steps.push({ step: n++, title: 'Attach collar to neckline', detail: hasNotchLapel ? 'Pin under collar to neckline {RST}, CB to CB. Sew. {clip} curve. Fold upper collar neckline SA under, pin from RS. {topstitch} from RS through all layers at 3.5mm.' : 'Pin band collar inner edge to neckline {RST}, CB to CB. Sew. Fold outer band SA under, pin from RS. {topstitch} at 3.5mm.' });
    }

    steps.push({ step: n++, title: 'Sew two-piece sleeves', detail: 'For each sleeve: sew top sleeve to under sleeve along front (inner) seam {RST}. {press} open. Sew back (outer) seam {RST}. {press} open. Result is a shaped cylinder with a two-piece cap.' });

    if (opts.cuff === 'zip-gusset') {
      steps.push({ step: n++, title: 'Attach sleeve zip gussets', detail: 'Insert 1.5″ × 4″ gusset gore into under-sleeve wrist seam at back edge. Sew 5″ zipper tape to gusset edges. {topstitch}. Gusset opens the cuff over the hand.' });
    } else if (opts.cuff === 'snap-tab') {
      steps.push({ step: n++, title: 'Sew snap cuff tabs', detail: 'Sew cuff tab outer to facing {RST} on 3 sides. Turn, {press}, {topstitch}. Sew to sleeve opening at back under-sleeve seam. Install snap at free end.' });
    }

    steps.push({ step: n++, title: 'Set sleeves into armholes', detail: 'Pin top sleeve cap to armhole: crown notch to shoulder seam, front pitch to front, back pitch (double notch) to back. Ease cap fullness evenly. Sew. {press} SA into sleeve. {topstitch} from RS at 6mm.' });

    steps.push({ step: n++, title: 'Sew side seams', detail: 'Sew front panel to back panel at side seams from hem to underarm {RST}. {press} seam open (woven) or toward back (leather). {topstitch} if desired.' });

    if (opts.belt === 'yes') {
      steps.push({ step: n++, title: 'Attach belt and tabs', detail: 'Fold belt strip in half {WST}, {press}. {topstitch} all 4 edges. Sew belt tabs at side seams as loops, insert D-rings. Thread belt through D-rings. Attach buckle at right end.' });
    }

    if (opts.lining !== 'none') {
      steps.push({ step: n++, title: 'Attach lining', detail: opts.lining === 'quilted' ? 'Sew quilted lining panels matching shell seams. Attach at neckline and zip tape {RST}. Slip-stitch hem of lining 1″ shorter than shell. Tack sleeve lining at underarm.' : 'Sew lining front, back, and sleeves. Attach to shell at neckline {RST} and along zip tape. Slip-stitch hem. Lining hangs ½–1″ shorter than shell.' });
    }

    steps.push({ step: n++, title: 'Finish and press', detail: 'Hem shell at lower edge. For leather: {topstitch} hem or use leather adhesive on turn-under — never direct-iron faux leather or PU. For woven: fold under, {topstitch}. Check all zippers run smooth. Add rivets at pocket corners and stress points if desired.' });

    return steps;
  },

  variants: [
    {
      id:   'cafe-racer-jacket',
      name: 'Café Racer Jacket',
      defaults: { style: 'cafe-racer', frontZip: 'center', lapel: 'band', belt: 'no', epaulettes: 'no', cuff: 'snap-tab', lining: 'full' },
    },
    {
      id:   'perfecto-jacket',
      name: 'Perfecto Jacket',
      defaults: { style: 'perfecto', frontZip: 'asymmetric', lapel: 'wide-notch', belt: 'yes', epaulettes: 'yes', cuff: 'zip-gusset', lining: 'full' },
    },
  ],
};
