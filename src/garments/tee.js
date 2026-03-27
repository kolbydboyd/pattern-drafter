// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * T-Shirt — upper body knit garment.
 * Uses upper-body.js geometry for armhole, neckline, shoulder, and sleeve cap curves.
 * Pieces: front bodice, back bodice, sleeve ×2, neckband rib strip.
 * Options: neckline style, fit/ease, sleeve length, hem style, optional chest pocket.
 */

import {
  armholeCurve, shoulderSlope, necklineCurve, sleeveCapCurve,
  armholeDepthFromChest, chestEaseDistribution, neckWidthFromCircumference, UPPER_EASE,
} from '../engine/upper-body.js';
import { sampleBezier, fmtInches, edgeAngle, arcLength } from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

// ── Sleeve length presets ────────────────────────────────────────────────────
const SLEEVE_LENGTHS = { short: 8, three_quarter: 18, long: 25 };

// ── Neckline depth by style (front inches; back is computed from neckW/3) ────
// Crew front depth is computed dynamically: neck/6 + 0.5 (per standard block rule)
const NECK_DEPTH_FRONT = {
  vneck: 9.0,
  scoop: 6.5,
};

export default {
  id: 'tee',
  name: 'T-Shirt',
  category: 'upper',
  difficulty: 'beginner',
  measurements: ['chest', 'shoulder', 'neck', 'sleeveLength', 'bicep', 'torsoLength'],
  measurementDefaults: { sleeveLength: 25 },

  options: {
    neckline: {
      type: 'select', label: 'Neckline',
      values: [
        { value: 'crew',  label: 'Crew neck' },
        { value: 'vneck', label: 'V-neck'    },
        { value: 'scoop', label: 'Scoop neck' },
      ],
      default: 'crew',
    },
    fit: {
      type: 'select', label: 'Fit',
      values: [
        { value: 'fitted',    label: 'Slim / fitted (+2″)',  reference: 'fitted, tailored'    },
        { value: 'standard',  label: 'Regular (+4″)',        reference: 'classic, off-the-rack' },
        { value: 'relaxed',   label: 'Relaxed (+6″)',        reference: 'skater, workwear'      },
        { value: 'oversized', label: 'Oversized (+10″)',     reference: 'avant-garde, oversized' },
      ],
      default: 'standard',
    },
    sleeveStyle: {
      type: 'select', label: 'Sleeve length',
      values: [
        { value: 'short',         label: 'Short (8″)'        },
        { value: 'three_quarter', label: '¾ length (18″)'    },
        { value: 'long',          label: 'Long (25″)'        },
      ],
      default: 'short',
    },
    hemStyle: {
      type: 'select', label: 'Hem style',
      values: [
        { value: 'straight',   label: 'Straight' },
        { value: 'shirttail',  label: 'Shirttail curve' },
      ],
      default: 'straight',
    },
    chestPocket: {
      type: 'select', label: 'Chest pocket',
      values: [
        { value: 'none',  label: 'None'         },
        { value: 'patch', label: 'Patch pocket' },
      ],
      default: 'none',
    },
    sa: {
      type: 'select', label: 'Seam allowance',
      values: [
        { value: 0.375, label: '⅜″' },
        { value: 0.5,   label: '½″' },
      ],
      default: 0.5,
    },
    hem: {
      type: 'select', label: 'Hem allowance',
      values: [
        { value: 0.75, label: '¾″ twin-needle' },
        { value: 1,    label: '1″ fold & stitch' },
      ],
      default: 0.75,
    },
  },

  pieces(m, opts) {
    const sa  = parseFloat(opts.sa);
    const hem = parseFloat(opts.hem);

    // ── Ease + panel widths ──────────────────────────────────────────────────
    const totalEase = UPPER_EASE[opts.fit] ?? 4;
    // Each half-panel = (chest + ease) / 4 so front and back side seams align
    const panelW = (m.chest + totalEase) / 4;
    const frontW = panelW;
    const backW  = panelW;

    // ── Shoulder geometry (standard block rules) ─────────────────────────────
    // A = (0, 0): top-left, fold / shoulder baseline
    // B = (neckW, 0): shoulder-neck junction on baseline  — neckW = neck/6
    // Shoulder point = (halfShoulder, slopeDrop): drops 1.75" over shoulder width
    const halfShoulder = m.shoulder / 2;
    const slopeDrop    = 1.75;
    const neckW        = neckWidthFromCircumference(m.neck);   // neck / 6
    const shoulderW    = halfShoulder - neckW;                 // seam length B → shoulder pt
    const shoulderPtX  = halfShoulder;                         // = neckW + shoulderW

    // ── Armhole geometry ─────────────────────────────────────────────────────
    // armholeY: y-coordinate of underarm from pattern top (A) = chest/4 + tolerance
    // armholeDepth: depth from shoulder point → passed to armholeCurve
    // chestDepth: horizontal extent shoulder pt → side seam at underarm level
    const armholeStyle = opts.fit === 'oversized' ? 'oversized' : 'standard';
    const armholeY     = armholeDepthFromChest(m.chest, armholeStyle);
    const armholeDepth = armholeY - slopeDrop;
    const chestDepth   = panelW - shoulderPtX;
    const backChestDepth = m.crossBack ? Math.max(0.5, m.crossBack / 2 - shoulderPtX) : chestDepth;

    // ── Neckline ─────────────────────────────────────────────────────────────
    // Back neckline depth (A→G): neckW / 3 ≈ neck/18 — very shallow, < 1"
    // Front neckline depth: neck/6 + 0.5 (crew), or fixed depth for other styles
    const neckKey       = opts.neckline;
    const neckDepthBack = neckW / 3;
    const neckDepthFront = neckKey === 'crew'
      ? neckW + 0.5
      : (NECK_DEPTH_FRONT[neckKey] ?? neckW + 0.5);
    const neckStyleFront = neckKey === 'vneck' ? 'v-neck' : neckKey === 'scoop' ? 'scoop' : 'crew';
    const neckStyleBack  = 'crew';

    // ── Torso + sleeve lengths ───────────────────────────────────────────────
    const torsoLen  = m.torsoLength;
    const slvLength = SLEEVE_LENGTHS[opts.sleeveStyle] ?? m.sleeveLength ?? 8;

    // ── Bezier curve sampling helpers ─────────────────────────────────────────
    function sampleCurve(cp, steps = 12) {
      return sampleBezier(cp.p0, cp.p1, cp.p2, cp.p3, steps);
    }

    // Build a flat polygon from curve control points
    function curveToPoints(cp, steps = 12) {
      return sampleCurve(cp, steps);
    }

    // Translate an array of {x,y} points
    function translatePts(pts, dx, dy) {
      return pts.map(p => ({ x: p.x + dx, y: p.y + dy }));
    }

    // ── FRONT BODICE POLYGON ─────────────────────────────────────────────────
    // Layout (x+ right toward side seam, y+ down):
    //   LEFT  = CF fold (x = 0), straight vertical
    //   RIGHT = side seam (x = panelW), straight vertical
    //   Neckline: G=(0, frontNeckDepth) curve up-right to B=(neckW, 0)
    //   Shoulder: B → shoulder point (neckW+shoulderW, slopeDrop) = (halfShoulder, 1.75)
    //   Armhole:  shoulder point down-right to underarm (panelW, armholeY)
    //
    const frontNeckPts   = curveToPoints(necklineCurve(neckW, neckDepthFront, neckStyleFront));
    const frontShoulderPts = curveToPoints(shoulderSlope(shoulderW, slopeDrop));
    const frontArmholePts  = curveToPoints(armholeCurve(shoulderW, chestDepth, armholeDepth, false));

    const shoulderPtY = slopeDrop;
    const frontPoly   = [];

    // G (CF neckline low point) → B (shoulder-neck junction)
    // necklineCurve local: p0=(0,0)=shoulder-neck, p3=(neckW,depth)=CF low.
    // Reverse and transform: x_global = neckW - x_local, y_global = y_local
    for (const p of [...frontNeckPts].reverse()) {
      frontPoly.push({ x: neckW - p.x, y: p.y });
    }
    // B → shoulder point
    for (let i = 1; i < frontShoulderPts.length; i++) {
      frontPoly.push({ x: neckW + frontShoulderPts[i].x, y: frontShoulderPts[i].y });
    }
    // Shoulder point → underarm notch (armhole C-curve down the right side)
    for (let i = 1; i < frontArmholePts.length; i++) {
      frontPoly.push({ x: shoulderPtX + frontArmholePts[i].x, y: shoulderPtY + frontArmholePts[i].y });
    }
    // Underarm notch → hem (side seam, straight down)
    frontPoly.push({ x: panelW, y: torsoLen });
    // Hem across to CF fold
    if (opts.hemStyle === 'shirttail') {
      frontPoly.push({ x: neckW * 0.5, y: torsoLen + 0.5 });
    }
    frontPoly.push({ x: 0, y: torsoLen });
    // CF fold up to G (neckline low point)
    frontPoly.push({ x: 0, y: neckDepthFront });

    // ── BACK BODICE POLYGON ──────────────────────────────────────────────────
    // Identical layout; back neckline depth is very shallow (neckW/3 ≈ neck/18 < 1")
    //
    const backNeckPts  = curveToPoints(necklineCurve(neckW, neckDepthBack, neckStyleBack));
    const backArmholePts = curveToPoints(armholeCurve(shoulderW, backChestDepth, armholeDepth, true));

    const backPoly = [];

    for (const p of [...backNeckPts].reverse()) {
      backPoly.push({ x: neckW - p.x, y: p.y });
    }
    for (let i = 1; i < frontShoulderPts.length; i++) {
      backPoly.push({ x: neckW + frontShoulderPts[i].x, y: frontShoulderPts[i].y });
    }
    for (let i = 1; i < backArmholePts.length; i++) {
      backPoly.push({ x: shoulderPtX + backArmholePts[i].x, y: shoulderPtY + backArmholePts[i].y });
    }
    backPoly.push({ x: panelW, y: torsoLen });
    if (opts.hemStyle === 'shirttail') {
      backPoly.push({ x: neckW * 0.5, y: torsoLen + 1 });
    }
    backPoly.push({ x: 0, y: torsoLen });
    backPoly.push({ x: 0, y: neckDepthBack });

    // ── SLEEVE POLYGON ───────────────────────────────────────────────────────
    const effArmToElbow = m.armToElbow || (slvLength * 0.45);
    // Full flat width at underarm = bicep + 2" ease (standard block rule)
    // Cap height 5–6": taller cap = more ease, better shoulder fit on wovens
    const slvFullWidth = m.bicep + 2;
    const capHeight    = opts.fit === 'fitted' ? 5.5 : opts.fit === 'oversized' ? 5.0 : 5.5;
    const capCp        = sleeveCapCurve(m.bicep, capHeight, slvFullWidth);
    const capPts       = curveToPoints(capCp, 16);
    // capPts: (0,0) = back underarm → (slvFullWidth, 0) = front underarm
    // Crown is at y < 0; shift all y by +capHeight so crown sits at y=0

    const sleevePoly = [];
    for (const p of capPts) {
      sleevePoly.push({ x: p.x, y: p.y + capHeight });
    }
    sleevePoly.push({ x: slvFullWidth, y: capHeight + slvLength });
    sleevePoly.push({ x: 0, y: capHeight + slvLength });
    // Back underarm up (already first point via close)

    // ── SLEEVE CAP / ARMHOLE VALIDATION ───────────────────────────────────────
    const frontArmArc = arcLength(frontArmholePts);
    const backArmArc  = arcLength(curveToPoints(armholeCurve(shoulderW, backChestDepth, armholeDepth, true)));
    const armholeArc  = frontArmArc + backArmArc;
    const capArc      = arcLength(capPts);
    const capEase     = capArc - armholeArc;
    if (capEase < 0.5 || capEase > 3) {
      console.warn(`[tee] Sleeve cap ease out of range: ${capEase.toFixed(2)}″ (expected 0.5–3″). Cap: ${capArc.toFixed(2)}″, Armhole: ${armholeArc.toFixed(2)}″`);
    }
    const capEaseNote = `Sleeve cap: ${fmtInches(capArc)}, Armhole: ${fmtInches(armholeArc)}, Ease: ${fmtInches(capEase)}`;

    // ── NECKBAND ─────────────────────────────────────────────────────────────
    // Rib strip: circumference of neckline opening × 0.85 (stretched), 1.5" finished
    const neckCircumference = m.neck;
    const nbLength = neckCircumference * 0.85;
    const nbWidth  = 3; // 1.5" finished, folded

    // ── Bounding box helpers ──────────────────────────────────────────────────
    function bbox(poly) {
      const xs = poly.map(p => p.x), ys = poly.map(p => p.y);
      return {
        minX: Math.min(...xs), maxX: Math.max(...xs),
        minY: Math.min(...ys), maxY: Math.max(...ys),
      };
    }

    function polyToPathStr(poly) {
      let d = `M ${poly[0].x.toFixed(2)} ${poly[0].y.toFixed(2)}`;
      for (let i = 1; i < poly.length; i++) d += ` L ${poly[i].x.toFixed(2)} ${poly[i].y.toFixed(2)}`;
      return d + ' Z';
    }

    // ── PER-EDGE SEAM ALLOWANCES ─────────────────────────────────────────────
    const nNeckPts     = frontNeckPts.length;   // 13
    const nShoulderPts = frontShoulderPts.length - 1; // 12 added (skip first)
    const nArmholeFPts = frontArmholePts.length - 1;  // 12 added
    const nArmholeBPts = backArmholePts.length - 1;   // 12 added

    function buildBodyEA(poly, nNeck, nShoulder, nArm, hasShirttail) {
      const ea = [];
      let idx = 0;
      for (let i = 0; i < nNeck - 1; i++) ea.push({ sa: 0.375, label: 'Neckline' });
      idx += nNeck - 1;
      for (let i = 0; i < nShoulder; i++) ea.push({ sa: 0.625, label: 'Shoulder' });
      idx += nShoulder;
      for (let i = 0; i < nArm; i++) ea.push({ sa: 0.375, label: 'Armhole' });
      idx += nArm;
      // Side seam
      ea.push({ sa: 0.625, label: 'Side seam' });
      idx++;
      // Hem (1 or 2 edges depending on shirttail)
      if (hasShirttail) { ea.push({ sa: hem, label: 'Hem' }); idx++; }
      ea.push({ sa: hem, label: 'Hem' });
      idx++;
      // Fold edge
      ea.push({ sa: 0, label: 'Fold' });
      idx++;
      // Remaining edges to close (fold or zero-length closing)
      while (ea.length < poly.length) ea.push({ sa: 0, label: 'Fold' });
      return ea;
    }

    const hasShirttail = opts.hemStyle === 'shirttail';
    const frontEdgeAllowances = buildBodyEA(frontPoly, nNeckPts, nShoulderPts, nArmholeFPts, hasShirttail);
    const backEdgeAllowances  = buildBodyEA(backPoly,  nNeckPts, nShoulderPts, nArmholeBPts, hasShirttail);

    // Sleeve: cap curve edges, then hem, then back seam (closing)
    const nCapPts = capPts.length; // 17
    const sleeveEdgeAllowances = sleevePoly.map((_, i) => {
      if (i < nCapPts - 1) return { sa: 0.375, label: 'Sleeve cap' };
      if (i === nCapPts - 1) return { sa: 0.625, label: 'Side seam' };
      if (i === nCapPts)     return { sa: hem, label: 'Hem' };
      return { sa: 0.625, label: 'Side seam' };
    });

    const frontBB = bbox(frontPoly);
    const backBB  = bbox(backPoly);
    const slvBB   = bbox(sleevePoly);

    // Notch positions for bodice and sleeve
    const shoulderMidX = (neckW + halfShoulder) / 2;
    const shoulderMidY = slopeDrop / 2;
    const chestNotchY  = armholeY;  // chest/bust level = armhole depth
    const armQuarterTop = slopeDrop + armholeDepth * 0.25;  // top quarter for sleeve cap match
    const armQuarterBot = slopeDrop + armholeDepth * 0.75;  // underarm quarter

    const frontNotches = [
      { x: shoulderMidX, y: shoulderMidY, angle: edgeAngle({ x: neckW, y: 0 }, { x: halfShoulder, y: slopeDrop }) },
      { x: panelW,       y: chestNotchY,  angle: 0 },  // chest on side seam (pointing right)
      { x: halfShoulder + chestDepth * 0.3, y: armQuarterTop, angle: edgeAngle({ x: halfShoulder, y: slopeDrop }, { x: panelW, y: armholeY }) },
      { x: panelW - 0.2, y: armQuarterBot, angle: edgeAngle({ x: halfShoulder, y: slopeDrop }, { x: panelW, y: armholeY }) },
    ];
    const backNotches = [
      { x: shoulderMidX, y: shoulderMidY, angle: edgeAngle({ x: neckW, y: 0 }, { x: halfShoulder, y: slopeDrop }) },
      { x: panelW,       y: chestNotchY,  angle: 0 },
      { x: halfShoulder + backChestDepth * 0.3, y: armQuarterTop, angle: edgeAngle({ x: halfShoulder, y: slopeDrop }, { x: panelW, y: armholeY }) },
      { x: panelW - 0.2, y: armQuarterBot, angle: edgeAngle({ x: halfShoulder, y: slopeDrop }, { x: panelW, y: armholeY }) },
    ];
    // Sleeve notches: center cap at top, quarter notches at underarm
    const slvCapMidX = slvFullWidth / 2;
    const slvCapMinY = Math.min(...sleevePoly.map(p => p.y));
    const sleeveNotches = [
      { x: slvCapMidX,    y: slvCapMinY,   angle: -90 },  // center cap notch (pointing up)
      { x: slvFullWidth * 0.25, y: capHeight, angle: edgeAngle({ x: 0, y: capHeight }, { x: slvFullWidth * 0.25, y: capHeight * 0.5 }) },
      { x: slvFullWidth * 0.75, y: capHeight, angle: edgeAngle({ x: slvFullWidth, y: capHeight }, { x: slvFullWidth * 0.75, y: capHeight * 0.5 }) },
    ];

    const pieces = [
      {
        id: 'bodice-front',
        name: 'Front Bodice',
        instruction: 'Cut 1 on fold (CF) · Place fold at CF edge',
        type: 'bodice',
        polygon: frontPoly,
        path: polyToPathStr(frontPoly),
        width:  frontBB.maxX - frontBB.minX,
        height: frontBB.maxY - frontBB.minY,
        neckDepth: neckDepthFront,
        armholeDepth,
        isBack: false,
        sa, hem,
        notches: frontNotches,
        edgeAllowances: frontEdgeAllowances,
        dims: [
          { label: fmtInches(frontW) + ' half width', x1: 0, y1: -0.5, x2: frontW, y2: -0.5, type: 'h' },
          { label: fmtInches(torsoLen) + ' length', x: frontBB.maxX + 1, y1: 0, y2: torsoLen, type: 'v' },
        ],
      },
      {
        id: 'bodice-back',
        name: 'Back Bodice',
        instruction: 'Cut 1 on fold (CB) · Place fold at CB edge',
        type: 'bodice',
        polygon: backPoly,
        path: polyToPathStr(backPoly),
        width:  backBB.maxX - backBB.minX,
        height: backBB.maxY - backBB.minY,
        neckDepth: neckDepthBack,
        armholeDepth,
        isBack: true,
        sa, hem,
        notches: backNotches,
        edgeAllowances: backEdgeAllowances,
        dims: [
          { label: fmtInches(backW) + ' half width', x1: 0, y1: -0.5, x2: backW, y2: -0.5, type: 'h' },
          { label: fmtInches(torsoLen) + ' length', x: backBB.maxX + 1, y1: 0, y2: torsoLen, type: 'v' },
        ],
      },
      {
        id: 'sleeve',
        name: 'Sleeve',
        instruction: `Cut 2 (mirror L & R) · Cap top · ${opts.sleeveStyle === 'short' ? 'Short sleeve' : opts.sleeveStyle === 'three_quarter' ? '¾ sleeve' : 'Long sleeve'} · ${capEaseNote}`,
        type: 'sleeve',
        polygon: sleevePoly,
        path: polyToPathStr(sleevePoly),
        width:  slvBB.maxX - slvBB.minX,
        height: slvBB.maxY - slvBB.minY,
        capHeight,
        sleeveLength: slvLength,
        sleeveWidth: slvFullWidth,
        sa, hem,
        notches: sleeveNotches,
        edgeAllowances: sleeveEdgeAllowances,
        dims: [
          { label: fmtInches(slvFullWidth) + ' underarm', x1: 0, y1: capHeight + 0.4, x2: slvFullWidth, y2: capHeight + 0.4, type: 'h' },
          { label: fmtInches(slvLength) + ' length', x: slvFullWidth + 1, y1: capHeight, y2: capHeight + slvLength, type: 'v' },
          { label: fmtInches(capHeight) + ' cap', x: -1.2, y1: 0, y2: capHeight, type: 'v' },
          { label: fmtInches(effArmToElbow) + ' to elbow', x: -1.5, y1: 0, y2: effArmToElbow, type: 'v', color: '#b8963e' },
        ],
      },
      {
        id: 'neckband',
        name: 'Neckband',
        instruction: `Cut 1 from rib knit on fold · ${fmtInches(nbLength)} long × ${fmtInches(nbWidth)} cut (${fmtInches(nbWidth / 2)} finished) · 85% of neck opening`,
        type: 'rectangle',
        dimensions: { length: nbLength, width: nbWidth },
        sa,
      },
    ];

    if (opts.chestPocket === 'patch') {
      pieces.push({
        id: 'chest-pocket',
        name: 'Chest Patch Pocket',
        instruction: 'Cut 1 · Position at left chest · Interface if desired',
        type: 'pocket',
        dimensions: { width: 4, height: 5 },
      });
    }

    return pieces;
  },

  materials(m, opts) {
    const isLong = opts.sleeveStyle === 'long' || opts.sleeveStyle === 'three_quarter';
    const notions = [
      { name: 'Rib knit', quantity: '0.25 yard', notes: 'For neckband — high recovery stretch' },
    ];
    if (isLong) {
      notions.push({ name: 'Rib knit (extra)', quantity: '0.5 yard', notes: 'For sleeve cuffs if desired' });
    }

    return buildMaterialsSpec({
      fabrics: ['cotton-jersey', 'rayon-jersey', 'poly-jersey'],
      notions,
      thread: 'poly-all',
      needle: 'ballpoint-80',
      stitches: ['stretch', 'overlock', 'coverstitch', 'zigzag-med'],
      notes: [
        'Use a ballpoint (jersey) needle 80/12 — prevents skipped stitches and snags on knit fabric',
        'Use a stretch stitch or serger for ALL seams — a standard straight stitch will pop when stretched',
        'Twin needle for hem (RS shows two parallel rows) or fold under and coverstitch',
        'Pre-wash jersey before cutting — cotton knits shrink 3–5% in first wash',
        'Neckband cut at 85% of neck opening so it lies flat without gaping',
        'Stretch neckband gently as you sew to match opening — do not stretch the bodice edge',
        opts.fit === 'fitted' ? 'Slim fit: ease is minimal — use 4-way stretch fabric only' : '',
      ].filter(Boolean),
    });
  },

  instructions(m, opts) {
    const steps = [];
    let n = 1;
    const isLong = opts.sleeveStyle !== 'short';

    if (opts.chestPocket === 'patch') {
      steps.push({
        step: n++, title: 'Prepare chest pocket',
        detail: 'Serge top edge. Fold top under ½″, topstitch. Press remaining edges under ½″. Position on left chest 2.5″ below neckline, 1.5″ from CF. Topstitch on 3 sides close to edge. Bar tack top corners.',
      });
    }

    steps.push({
      step: n++, title: 'Sew shoulder seams',
      detail: 'Join front to back at shoulders (RST). Stretch stitch or serge. Press toward back.',
    });

    steps.push({
      step: n++, title: 'Attach neckband',
      detail: `Fold neckband in half lengthwise (WST), press. Divide neckband and neck opening into quarters, pin at quarters. Sew neckband to neck opening (RST), stretching band to fit opening. Serge or stretch stitch. Press SA toward bodice. Topstitch from RS if desired.`,
    });

    steps.push({
      step: n++, title: 'Set sleeves',
      detail: 'Divide sleeve cap and armhole opening into quarters, pin at quarters. Sew sleeve into armhole (RST), easing cap to fit. Stretch stitch. Serge SA together. Press toward sleeve.',
    });

    steps.push({
      step: n++, title: 'Sew side seams and sleeve seams',
      detail: 'Pin front to back at side seams and sleeve seams in one continuous seam from hem to sleeve hem. Stretch stitch or serge. Press toward back.',
    });

    if (isLong) {
      steps.push({
        step: n++, title: 'Hem sleeves',
        detail: 'Fold up ¾″, press. Twin needle from RS or fold under raw edge and zigzag. Or attach rib cuffs at 80% of opening width.',
      });
    } else {
      steps.push({
        step: n++, title: 'Hem sleeves',
        detail: 'Fold up ¾″, press. Twin needle from RS in one pass.',
      });
    }

    steps.push({
      step: n++, title: 'Hem body',
      detail: `Fold hem up ${fmtInches(parseFloat(opts.hem))}, press${opts.hemStyle === 'shirttail' ? ' — clipping curve at sides as needed' : ''}. Twin needle from RS or fold under raw edge and zigzag stitch.`,
    });

    steps.push({
      step: n++, title: 'Finish',
      detail: 'Press with damp cloth on cotton/steam setting (check fabric care). Try on — neckband should sit flat and not gap.',
    });

    return steps;
  },
};
