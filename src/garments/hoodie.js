// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Hoodie — same as crewneck plus hood panels, kangaroo pocket (default),
 * drawstring channel, and optional full-zip front split.
 * Hood: two mirrored panels with curved back seam.
 * Drawstring: 54″ flat cotton cord, exits at CF through grommets.
 * Fabric: same as crewneck — french terry or sweatshirt fleece.
 */

import {
  shoulderSlope, necklineCurve, armholeCurve, sleeveCapCurve, shoulderDropFromWidth,
  armholeDepthFromChest, chestEaseDistribution, neckWidthFromCircumference, UPPER_EASE,
} from '../engine/upper-body.js';
import { sampleBezier, fmtInches, edgeAngle, arcLength, dist } from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

export default {
  id: 'hoodie',
  name: 'Hoodie',
  category: 'upper',
  difficulty: 'intermediate',
  priceTier: 'tailored',
  measurements: ['chest', 'shoulder', 'neck', 'sleeveLength', 'bicep', 'torsoLength'],
  measurementDefaults: { sleeveLength: 25 },

  options: {
    fit: {
      type: 'select', label: 'Fit',
      values: [
        { value: 'standard',  label: 'Regular (+4″)'    },
        { value: 'oversized', label: 'Oversized (+10″)' },
      ],
      default: 'standard',
    },
    frontStyle: {
      type: 'select', label: 'Front opening',
      values: [
        { value: 'pullover', label: 'Pullover, no zip'        },
        { value: 'fullzip',  label: 'Full zip (split front)'  },
      ],
      default: 'pullover',
    },
    hoodLining: {
      type: 'select', label: 'Hood lining',
      values: [
        { value: 'unlined', label: 'Unlined'                },
        { value: 'lined',   label: 'Lined (contrast fabric)' },
      ],
      default: 'unlined',
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

    const totalEase = UPPER_EASE[opts.fit] ?? 4;
    const { front: frontEase, back: backEase } = chestEaseDistribution(totalEase);
    // Both front and back half-panels are equal so side seams align when sewn
    const panelW = (m.chest + totalEase) / 4;
    const frontW = panelW;
    const backW  = panelW;

    const halfShoulder = m.shoulder / 2;
    const neckW        = neckWidthFromCircumference(m.neck);
    const shoulderW    = halfShoulder - neckW;
    const slopeDrop    = shoulderDropFromWidth(shoulderW);
    const shoulderPtX  = neckW + shoulderW;
    const armholeY     = armholeDepthFromChest(m.chest, opts.fit === 'oversized' ? 'oversized' : 'standard');
    const armholeDepth = armholeY - slopeDrop;
    const chestDepth   = panelW - shoulderPtX;
    // Back armhole must also end at panelW for vertical side seam.
    // crossBack influences armhole curve shape, not endpoint.
    const backChestDepth = chestDepth;
    const torsoLen     = m.torsoLength;
    const slvLength    = m.sleeveLength ?? 25;
    const isFullZip    = opts.frontStyle === 'fullzip';

    // ── CURVE TAGGING — VERIFIED WORKING, DO NOT CHANGE UNLESS NECESSARY ──
    // .curve tags enable Catmull-Rom rendering in pattern-view.js / print-layout.js.
    // Junction points must have .curve DELETED after polygon construction.
    function sampleCurve(cp, steps = 12) {
      return sampleBezier(cp.p0, cp.p1, cp.p2, cp.p3, steps).map(p => ({ ...p, curve: true }));
    }
    function polyToPathStr(poly) {
      let d = `M ${poly[0].x.toFixed(2)} ${poly[0].y.toFixed(2)}`;
      for (let i = 1; i < poly.length; i++) d += ` L ${poly[i].x.toFixed(2)} ${poly[i].y.toFixed(2)}`;
      return d + ' Z';
    }
    function bbox(poly) {
      const xs = poly.map(p => p.x), ys = poly.map(p => p.y);
      return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) };
    }

    const shoulderPtY = slopeDrop;

    // ── FRONT BODICE ─────────────────────────────────────────────────────────
    // Pullover: cut on fold (no CF opening)
    // Full zip: cut L & R with 1″ zipper tape extension at CF
    const ZIP_EXT  = isFullZip ? 1.0 : 0;
    const neckDepthFront = 2.5;

    const frontNeckPts   = sampleCurve(necklineCurve(neckW, neckDepthFront, 'crew'));
    const frontShoulderPts = sampleCurve(shoulderSlope(shoulderW, slopeDrop));
    const frontArmPts    = sampleCurve(armholeCurve(shoulderW, chestDepth, armholeDepth, false));

    const frontPoly = [];
    const neckFrontRev = [...frontNeckPts].reverse();
    for (const p of neckFrontRev) frontPoly.push({ ...p, x: neckW - p.x });
    // ── JUNCTION UNTAGGING — VERIFIED WORKING, DO NOT CHANGE UNLESS NECESSARY ──
    delete frontPoly[0].curve;  // fold-neckline junction
    delete frontPoly[frontNeckPts.length - 1].curve;  // shoulder-neck junction
    for (let i = 1; i < frontShoulderPts.length; i++) {
      frontPoly.push({ ...frontShoulderPts[i], x: neckW + frontShoulderPts[i].x });
    }
    for (let i = 1; i < frontArmPts.length; i++) {
      frontPoly.push({ ...frontArmPts[i], x: shoulderPtX + frontArmPts[i].x, y: shoulderPtY + frontArmPts[i].y });
    }
    const sideX = shoulderPtX + chestDepth;
    frontPoly.push({ x: sideX, y: torsoLen });
    frontPoly.push({ x: -ZIP_EXT, y: torsoLen });
    frontPoly.push({ x: -ZIP_EXT, y: neckDepthFront });

    // ── BACK BODICE ──────────────────────────────────────────────────────────
    const neckDepthBack  = 0.75;
    const backNeckPts    = sampleCurve(necklineCurve(neckW, neckDepthBack, 'crew'));
    const backArmPts     = sampleCurve(armholeCurve(shoulderW, backChestDepth, armholeDepth, true));

    const backPoly = [];
    const neckBackRev = [...backNeckPts].reverse();
    for (const p of neckBackRev) backPoly.push({ ...p, x: neckW - p.x });
    // ── JUNCTION UNTAGGING — VERIFIED WORKING, DO NOT CHANGE UNLESS NECESSARY ──
    delete backPoly[0].curve;  // fold-neckline junction
    delete backPoly[backNeckPts.length - 1].curve;  // shoulder-neck junction
    for (let i = 1; i < frontShoulderPts.length; i++) {
      backPoly.push({ ...frontShoulderPts[i], x: neckW + frontShoulderPts[i].x });
    }
    for (let i = 1; i < backArmPts.length; i++) {
      backPoly.push({ ...backArmPts[i], x: shoulderPtX + backArmPts[i].x, y: shoulderPtY + backArmPts[i].y });
    }
    const backSideX = shoulderPtX + backChestDepth;
    backPoly.push({ x: backSideX, y: torsoLen });
    backPoly.push({ x: 0, y: torsoLen });

    // ── SLEEVE ───────────────────────────────────────────────────────────────
    const effArmToElbow = m.armToElbow || (slvLength * 0.45);
    const sleeveEase = totalEase * 0.25;
    const slvWidth   = m.bicep / 2 + sleeveEase;
    const capHeight  = armholeDepth * (opts.fit === 'oversized' ? 0.55 : 0.60);
    const capCp      = sleeveCapCurve(m.bicep, capHeight, slvWidth * 2);
    const capPts     = sampleCurve(capCp, 16);
    const sleevePoly = [];
    for (const p of capPts) sleevePoly.push({ ...p, y: p.y + capHeight });
    // ── SLEEVE JUNCTION UNTAGGING — VERIFIED WORKING, DO NOT CHANGE UNLESS NECESSARY ──
    delete sleevePoly[0].curve;
    delete sleevePoly[capPts.length - 1].curve;
    sleevePoly.push({ x: slvWidth * 2, y: capHeight + slvLength });
    sleevePoly.push({ x: 0, y: capHeight + slvLength });

    // ── HOOD PANELS ──────────────────────────────────────────────────────────
    // Two-panel hood construction per standard drafting:
    //   Width  = head_circ / 3 + 1″ ease  (panel is roughly square for avg adult)
    //   Height = head_circ / 2 + 2″ ease
    //   Back seam curves inward (toward face) by ~0.5″ at 60% up from neckline —
    //   this accommodates head roundness so the panels don't pull apart at the crown.
    // Reference: Mueller & Sohn hood construction, Treasurie hood drafting guide.
    const headCircEst  = Math.max(m.neck * 1.45, 22); // anatomical head circ — neck × 1.45, floor at 22″
    const hoodH        = headCircEst / 2 + 2;
    const hoodW        = headCircEst / 3 + 1;

    // Curved back seam modeled as a Bézier:
    //   p0 = back-top, p3 = back-bottom (neckline end)
    //   Control points pull the seam inward (toward face opening, i.e. x decreases)
    //   by ~0.5″ at the 60% point from top — matches standard inward concave arc.
    const hoodBackCP = {
      p0: { x: hoodW, y: 0 },                                      // back top
      p1: { x: hoodW - 0.5, y: hoodH * 0.25 },                    // upper control
      p2: { x: hoodW - 0.5, y: hoodH * 0.65 },                    // lower control
      p3: { x: hoodW, y: hoodH },                                   // back bottom (neckline)
    };
    const hoodBackPts = sampleBezier(hoodBackCP.p0, hoodBackCP.p1, hoodBackCP.p2, hoodBackCP.p3, 12)
      .map(p => ({ ...p, curve: true }));

    // Build polygon: face-top → back curve (top→bottom) → face-bottom
    const hoodPoly = [];
    hoodPoly.push({ x: 0, y: 0 });       // face opening top (CF) — no curve tag (junction)
    for (let i = 0; i < hoodBackPts.length; i++) {
      const p = hoodBackPts[i];
      // Remove curve tag at endpoints (junctions with straight face/neck edges)
      if (i === 0 || i === hoodBackPts.length - 1) hoodPoly.push({ x: p.x, y: p.y });
      else hoodPoly.push(p);
    }
    hoodPoly.push({ x: 0, y: hoodH });   // face opening bottom (neck edge) — no curve tag

    // ── RIB TRIM ─────────────────────────────────────────────────────────────
    const hemCirc = (frontW + backW) * 2;
    const wbLen   = hemCirc * 0.90;
    const cuffLen = slvWidth * 2 * 0.85;

    // ── NOTCH MARKS ─────────────────────────────────────────────────────────
    // Industry convention: single notch = front, double notch = back.
    // Notches are placed by arc-length along each curve (~3.25″ from underarm),
    // matching positions on sleeve cap so they align when the cap is eased in.
    // Reference: Fashion-Incubator notch maps, Dresspatternmaking sleeve cap guide.

    const shoulderMidX = neckW + shoulderW / 2;
    const shoulderMidY = slopeDrop / 2;

    // Arc-length walk helper: find point at target arc-length from the START of pts array
    function ptAtArcLen(pts, targetLen) {
      let walked = 0;
      for (let i = 1; i < pts.length; i++) {
        const d = dist(pts[i - 1], pts[i]);
        if (walked + d >= targetLen) {
          const t = (targetLen - walked) / d;
          return {
            x: pts[i - 1].x + t * (pts[i].x - pts[i - 1].x),
            y: pts[i - 1].y + t * (pts[i].y - pts[i - 1].y),
          };
        }
        walked += d;
      }
      return pts[pts.length - 1]; // clamp to end
    }

    // Front armhole pts go shoulder→underarm (p0→p3 direction in armholeCurve).
    // We want arc-length FROM UNDERARM, so reverse the array.
    const frontArmPtsRev = [...frontArmPts].reverse();
    const backArmPtsRev  = [...backArmPts].reverse();

    // Single front notch: ~3.25″ arc from underarm along front armhole
    const FRONT_NOTCH_ARC = 3.25;
    const frontNotchPt = ptAtArcLen(frontArmPtsRev, FRONT_NOTCH_ARC);
    // Double back notch: ~3.25″ arc from underarm along back armhole, spaced 0.25″ apart
    const BACK_NOTCH_ARC  = 3.25;
    const backNotch1Pt = ptAtArcLen(backArmPtsRev, BACK_NOTCH_ARC);
    const backNotch2Pt = ptAtArcLen(backArmPtsRev, BACK_NOTCH_ARC + 0.25);

    // Transform armhole pts from local bezier frame to bodice polygon frame.
    // frontArmPts local origin = shoulderPt = (shoulderPtX, shoulderPtY) on bodice.
    // frontArmPtsRev[0] = underarm (chestDepth, armholeDepth) in local frame → (sideX, armholeY+shoulderPtY) on bodice.
    // The sampleBezier pts already have the local x/y. We need to add the offset.
    const fArmOffset = { x: shoulderPtX, y: shoulderPtY };
    const frontNotchBodice = { x: frontNotchPt.x + fArmOffset.x, y: frontNotchPt.y + fArmOffset.y };
    const backNotch1Bodice = { x: backNotch1Pt.x + fArmOffset.x, y: backNotch1Pt.y + fArmOffset.y };
    const backNotch2Bodice = { x: backNotch2Pt.x + fArmOffset.x, y: backNotch2Pt.y + fArmOffset.y };

    const frontNotches = [
      { x: shoulderMidX, y: shoulderMidY, angle: edgeAngle({ x: neckW, y: 0 }, { x: shoulderPtX, y: slopeDrop }) },
      { x: sideX, y: armholeY, angle: 0 },
      // Single notch (front convention) at ~3.25″ arc from underarm
      { x: frontNotchBodice.x, y: frontNotchBodice.y, angle: 0 },
    ];

    const backNotches = [
      { x: shoulderMidX, y: shoulderMidY, angle: edgeAngle({ x: neckW, y: 0 }, { x: shoulderPtX, y: slopeDrop }) },
      { x: backSideX, y: armholeY, angle: 0 },
      // Double notch (back convention) at ~3.25″ arc from underarm, spaced 0.25″ apart
      { x: backNotch1Bodice.x, y: backNotch1Bodice.y, angle: 0 },
      { x: backNotch2Bodice.x, y: backNotch2Bodice.y, angle: 0 },
    ];

    // ── Sleeve cap notches matched by arc-length to armhole notches ──────────
    // capPts run back-underarm (x=0) → crown (x=capW/2) → front-underarm (x=capW).
    // Front cap = right half (crown→front-underarm), Back cap = left half (crown→back-underarm).
    const capW = slvWidth * 2;
    const capPtsLocal = capPts.map(p => ({ x: p.x + capW / 2, y: p.y + capHeight })); // shift to polygon frame
    // Actually capPts are in local frame with p0=(0,0)=back-underarm, p3=(capW,0)=front-underarm.
    // The polygon offsets by (0, capHeight) when building sleevePoly.
    // For arc-length, use the raw capPts.

    // Back half: pts from back-underarm (index 0) toward crown
    const capMidIdx = Math.floor(capPts.length / 2);
    const backCapPts = capPts.slice(0, capMidIdx + 1); // back-underarm → crown
    // Front half: pts from front-underarm toward crown (reversed so we walk from underarm)
    const frontCapPtsRev = [...capPts.slice(capMidIdx)].reverse(); // front-underarm → crown

    const backCapNotch1 = ptAtArcLen(backCapPts, BACK_NOTCH_ARC);
    const backCapNotch2 = ptAtArcLen(backCapPts, BACK_NOTCH_ARC + 0.25);
    const frontCapNotch = ptAtArcLen(frontCapPtsRev, FRONT_NOTCH_ARC);
    // Translate frontCapNotch back to forward direction (it's from the reversed array)
    // frontCapPtsRev[0] = capPts[last] = (capW, 0). So x counts toward crown (decreasing).
    // ptAtArcLen returns in the reversed pts frame: need no extra transform since we just use coords.

    // capPts local frame has y=0 at underarms and y=-capHeight at crown.
    // Sleeve polygon shifts all capPts by +capHeight, so polygon frame = local y + capHeight.
    // Notch coords from ptAtArcLen are in local frame → add capHeight for polygon frame.
    const sleeveNotches = [
      // Crown = shoulder seam alignment (top center cap, y=0 in polygon frame)
      { x: capW / 2, y: 0, angle: -90 },
      // Back cap double notch (~3.25″ arc from back underarm) — local y + capHeight = polygon y
      { x: backCapNotch1.x, y: backCapNotch1.y + capHeight, angle: edgeAngle(backCapPts[0], backCapPts[1]) },
      { x: backCapNotch2.x, y: backCapNotch2.y + capHeight, angle: edgeAngle(backCapPts[0], backCapPts[1]) },
      // Front cap single notch (~3.25″ arc from front underarm)
      { x: frontCapNotch.x, y: frontCapNotch.y + capHeight, angle: edgeAngle(frontCapPtsRev[0], frontCapPtsRev[1]) },
    ];

    // ── SLEEVE CAP / ARMHOLE VALIDATION ───────────────────────────────────────
    const frontArmArc = arcLength(frontArmPts);
    const backArmArc  = arcLength(backArmPts);
    const armholeArc  = frontArmArc + backArmArc;
    const capArc      = arcLength(capPts);
    const capEase     = capArc - armholeArc;
    if (capEase < 0.5 || capEase > 3) {
      console.warn(`[hoodie] Sleeve cap ease out of range: ${capEase.toFixed(2)}″ (expected 0.5–3″). Cap: ${capArc.toFixed(2)}″, Armhole: ${armholeArc.toFixed(2)}″`);
    }
    const capEaseNote = `Sleeve cap: ${fmtInches(capArc)}, Armhole: ${fmtInches(armholeArc)}, Ease: ${fmtInches(capEase)}`;

    const frontBB  = bbox(frontPoly);
    const backBB   = bbox(backPoly);
    const sleeveBB = bbox(sleevePoly);
    const hoodBB   = bbox(hoodPoly);

    const pieces = [
      {
        id: 'bodice-front',
        name: isFullZip ? 'Front Panel (Left)' : 'Front Bodice',
        instruction: isFullZip
          ? `Cut 2 (L & R mirror) · 1″ zipper tape extension at CF · Full-length zipper ${fmtInches(torsoLen + 2)}`
          : 'Cut 1 on fold (CF)',
        type: 'bodice',
        polygon: frontPoly,
        path: polyToPathStr(frontPoly),
        width: frontBB.maxX - frontBB.minX,
        height: frontBB.maxY - frontBB.minY,
        isBack: false,
        sa, hem,
        notches: frontNotches,
        dims: [
          { label: fmtInches(frontW) + ' half width', x1: 0, y1: -0.5, x2: frontW, y2: -0.5, type: 'h' },
          { label: fmtInches(torsoLen) + ' length', x: frontBB.maxX + 1, y1: 0, y2: torsoLen, type: 'v' },
        ],
      },
      {
        id: 'bodice-back',
        name: 'Back Bodice',
        instruction: 'Cut 1 on fold (CB)',
        type: 'bodice',
        polygon: backPoly,
        path: polyToPathStr(backPoly),
        width: backBB.maxX - backBB.minX,
        height: backBB.maxY - backBB.minY,
        isBack: true,
        sa, hem,
        notches: backNotches,
        dims: [
          { label: fmtInches(backW) + ' half width', x1: 0, y1: -0.5, x2: backW, y2: -0.5, type: 'h' },
          { label: fmtInches(torsoLen) + ' length', x: backBB.maxX + 1, y1: 0, y2: torsoLen, type: 'v' },
        ],
      },
      {
        id: 'sleeve',
        name: 'Sleeve',
        instruction: `Cut 2 (mirror L & R) · Cap top, set into armhole · ${capEaseNote}`,
        type: 'sleeve',
        polygon: sleevePoly,
        path: polyToPathStr(sleevePoly),
        width: sleeveBB.maxX - sleeveBB.minX,
        height: sleeveBB.maxY - sleeveBB.minY,
        capHeight,
        sleeveLength: slvLength,
        sleeveWidth: slvWidth * 2,
        sa, hem,
        notches: sleeveNotches,
        dims: [
          { label: fmtInches(slvWidth * 2) + ' underarm', x1: 0, y1: capHeight + 0.4, x2: slvWidth * 2, y2: capHeight + 0.4, type: 'h' },
          { label: fmtInches(slvLength) + ' length', x: slvWidth * 2 + 1, y1: capHeight, y2: capHeight + slvLength, type: 'v' },
          { label: fmtInches(effArmToElbow) + ' to elbow', x: -1.5, y1: 0, y2: effArmToElbow, type: 'v', color: '#b8963e' },
        ],
      },
      {
        id: 'hood-panel',
        name: 'Hood Panel',
        instruction: `Cut 2 (mirror L & R) · Back seam joins two panels · Face opening gets ¾″ drawstring casing · ${opts.hoodLining === 'lined' ? 'Also cut 2 lining' : 'Unlined'}`,
        type: 'bodice',
        polygon: hoodPoly,
        path: polyToPathStr(hoodPoly),
        width: hoodBB.maxX - hoodBB.minX,
        height: hoodBB.maxY - hoodBB.minY,
        isBack: false,
        sa, hem,
        dims: [
          { label: fmtInches(hoodW) + ' width', x1: 0, y1: -0.5, x2: hoodW, y2: -0.5, type: 'h' },
          { label: fmtInches(hoodH) + ' height', x: hoodW + 2, y1: 0, y2: hoodH, type: 'v' },
        ],
      },
      // Kangaroo pocket: hexagonal shape — flat bottom, short vertical sides, diagonal hand openings.
      // Shape: bottom-left → bottom-right → right side up to openH → diagonal to top (openW from right)
      //        → top middle → diagonal to left side (openW from left) → left side down → close.
      // Reference: BERNINA kangaroo pocket drafting, KT's Slow Closet tutorial.
      (() => {
        // Scale width to roughly span hip-to-hip (≈1.3× half-front panel, capped 10–14″)
        const kW = Math.min(14, Math.max(10, Math.round(frontW * 1.3 * 2) / 2));
        const kH = 8;             // standard hoodie pocket height
        const openW = 3.25;       // diagonal opening: 3.25″ in from each top corner
        const openH = 3.5;        // diagonal opening: 3.5″ up from bottom on each side

        // Build hexagonal polygon CW: bottom-left → bottom-right → right opening → top → left opening → close
        const poly = [];
        poly.push({ x: 0,         y: kH });           // bottom-left
        poly.push({ x: kW,        y: kH });           // bottom-right
        poly.push({ x: kW,        y: kH - openH });   // right side, openH up from bottom (opening base)
        poly.push({ x: kW - openW, y: 0 });           // right opening top (openW in from top-right corner)
        poly.push({ x: openW,     y: 0 });            // left opening top (openW in from top-left corner)
        poly.push({ x: 0,         y: kH - openH });   // left side, openH up from bottom (opening base)

        // polygon closes back to bottom-left

        const bb = bbox(poly);
        return {
          id: 'kangaroo-pocket',
          name: 'Kangaroo Pocket',
          instruction: 'Cut 1 · Center on front bodice at waist level · Diagonal openings = hand entries · {topstitch} bottom and side edges · Bar tack top corners of openings',
          type: 'bodice',
          polygon: poly,
          path: polyToPathStr(poly),
          width: bb.maxX - bb.minX,
          height: bb.maxY - bb.minY,
          isCutOnFold: false,
          sa, hem: 0.5,
          dims: [
            { label: fmtInches(kW) + ' width', x1: 0, y1: kH + 0.4, x2: kW, y2: kH + 0.4, type: 'h' },
            { label: fmtInches(kH) + ' height', x: kW + 1, y1: 0, y2: kH, type: 'v' },
          ],
        };
      })(),
      {
        id: 'waistband',
        name: 'Waistband (rib)',
        instruction: `Cut 1 from rib knit on fold · ${fmtInches(wbLen)} long × 3″ cut (1.5″ finished) · 90% of body hem circumference`,
        type: 'rectangle',
        dimensions: { length: wbLen, width: 3 },
        sa,
      },
      {
        id: 'cuff',
        name: 'Sleeve Cuff (rib)',
        instruction: `Cut 2 from rib knit on fold · ${fmtInches(cuffLen)} long × 3″ cut (1.5″ finished) · 85% of sleeve opening`,
        type: 'rectangle',
        dimensions: { length: cuffLen, width: 3 },
        sa,
      },
    ];

    if (isFullZip) {
      const zipLength = torsoLen + 2; // body + buffer (zipper ends at neckline, not through hood)
      pieces.push({
        id: 'zipper-tape',
        name: 'Zipper Tape Extension',
        instruction: `Cut 2 (L & R) · 1″ wide × ${fmtInches(zipLength)} long · Interface · Sew to CF edges before attaching zipper`,
        type: 'pocket',
        dimensions: { width: 1, height: zipLength },
        sa,
      });
    }

    return pieces;
  },

  materials(m, opts) {
    const isFullZip   = opts.frontStyle === 'fullzip';
    const isLined     = opts.hoodLining === 'lined';
    const headCircEst = Math.max(m.neck * 1.45, 22);
    const hoodH       = headCircEst / 2 + 2;

    const notions = [
      { name: 'Rib knit', quantity: '0.75 yard', notes: 'For waistband and cuffs (high recovery 2×2 rib)' },
      { name: 'Flat cord drawstring', quantity: '54″', notes: 'Cotton or poly flat cord, ¼″–⅜″ wide, with aglets' },
      { name: 'Grommets or eyelets', quantity: '2', notes: '¼″ grommets at CF hood opening for cord exits' },
    ];

    if (isFullZip) {
      notions.push({ name: 'Separating zipper', quantity: `${Math.ceil(m.torsoLength + 2)}″`, notes: 'Full-length separating zipper. Runs hem to neckline only (not through hood)' });
      notions.push({ ref: 'interfacing-light', quantity: '0.5 yard (zipper tape extensions)' });
    }

    return buildMaterialsSpec({
      fabrics: ['french-terry', 'sweatshirt-fleece'],
      notions,
      thread: 'poly-all',
      needle: 'ballpoint-90',
      stitches: ['stretch', 'overlock', 'coverstitch', 'zigzag-med'],
      notes: [
        'Use a ballpoint (jersey) needle 90/14 for fleece and french terry',
        'Use stretch stitch or serger for all body seams',
        'Hood casing: fold face opening under ¾″ twice, {topstitch} to create drawstring channel',
        'Install grommets at CF of hood casing before joining hood to body',
        'Pre-wash fleece before cutting - knits can shrink 3–5%',
        isFullZip ? 'Full zip: sew zipper tape extensions first, then {baste} zipper in place, {topstitch} from RS' : '',
        isLined ? 'Lined hood: sew outer and lining with RS together around face opening, turn, {press}, then treat as one layer for attaching to body' : '',
      ].filter(Boolean),
    });
  },

  instructions(m, opts) {
    const steps = [];
    let n = 1;
    const isFullZip = opts.frontStyle === 'fullzip';
    const isLined   = opts.hoodLining === 'lined';

    steps.push({
      step: n++, title: 'Attach kangaroo pocket',
      detail: '{serge} diagonal opening edges, fold under ½″, {topstitch}. {press} bottom and side edges under ½″. Position centered on front body at waist level. {topstitch} on sides and bottom. Bar tack top corners of openings.',
    });

    steps.push({
      step: n++, title: 'Sew hood back seam',
      detail: 'Sew two hood panels together at curved back seam {RST}. {clip} curve at top. {press} seam toward one side.',
    });

    if (isLined) {
      steps.push({
        step: n++, title: 'Attach hood lining',
        detail: 'Sew outer hood to lining around face opening {RST}. Trim seam. Turn RS out, {press}. {baste} neck edges together, treating as one layer going forward.',
      });
    }

    steps.push({
      step: n++, title: 'Make drawstring casing',
      detail: `{press} face opening under ¾″ twice (first fold ¾″, second fold ¾″). Install two grommets at CF opening, centered in casing width. {topstitch} casing close to inner fold, leaving grommet area accessible for cord insertion.`,
    });

    if (isFullZip) {
      steps.push({
        step: n++, title: 'Prepare zipper extensions',
        detail: 'Interface zipper tape extension pieces. Fold in half lengthwise {WST}. Sew to CF edges of front panels. {press} flat. {baste} zipper tape to extensions, RS up. {topstitch} from RS.',
      });
    }

    steps.push({
      step: n++, title: 'Sew shoulder seams',
      detail: 'Join front to back at shoulders {RST}. Stretch stitch or {serge}. {press} toward back.',
    });

    steps.push({
      step: n++, title: 'Attach hood to body',
      detail: 'Match CF of hood to CF of neckline (or CF zipper edge). Pin hood to neckline {RST}. Sew. {clip} curve. {serge} or {zigzag} SA together. {press} down.',
    });

    steps.push({
      step: n++, title: 'Set sleeves',
      detail: 'Pin sleeve cap to armhole, matching center cap to shoulder seam. Ease cap to fit. Stretch stitch or {serge}. {press} toward sleeve.',
    });

    steps.push({
      step: n++, title: 'Sew side and sleeve seams',
      detail: 'Sew front to back at side seams continuously from waistband level through underarm to sleeve hem. Stretch stitch or {serge}. {press} toward back.',
    });

    steps.push({
      step: n++, title: 'Attach sleeve cuffs and waistband',
      detail: 'Fold each rib piece in half lengthwise {WST}. Divide cuff/waistband and opening into quarters. Sew with stretch stitch, stretching rib to match opening. {press} SA into body.',
    });

    steps.push({
      step: n++, title: 'Thread drawstring',
      detail: 'Thread 54″ cord through one grommet, around hood casing, and out the other grommet. Even the ends. Add aglets or heat-seal if cord is synthetic.',
    });

    steps.push({
      step: n++, title: 'Finish',
      detail: '{press} lightly with low steam. Try on. Hood should sit comfortably without pulling neckline down.',
    });

    return steps;
  },
};
