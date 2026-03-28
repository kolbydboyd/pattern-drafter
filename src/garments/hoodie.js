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
import { sampleBezier, fmtInches, edgeAngle, arcLength } from '../engine/geometry.js';
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
        { value: 'pullover', label: 'Pullover - no zip'        },
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
    // Each panel is roughly a rectangle with a curved back seam.
    // Width = head circumference / 3 + 1″ ease (estimated from neck × 1.45, min 22″)
    // Height = head circumference / 2 + 2″ ease (estimated from neck × 1.45, min 22″)
    const headCircEst  = Math.max(m.neck * 1.45, 22); // anatomical head circ — neck × 1.45, floor at 22″
    const hoodH        = headCircEst / 2 + 2;
    const hoodW        = headCircEst / 3 + 1;
    // Curved back seam: back of hood curves up ~1.5″ at top
    const hoodPoly = [
      { x: 0,      y: 0      }, // face opening top (CF)
      { x: hoodW,  y: 0      }, // back top
      { x: hoodW + 1.5, y: hoodH * 0.4 }, // back curve control point (approximated as polygon)
      { x: hoodW,  y: hoodH  }, // back bottom
      { x: 0,      y: hoodH  }, // face opening bottom (neck edge)
    ];

    // ── RIB TRIM ─────────────────────────────────────────────────────────────
    const hemCirc = (frontW + backW) * 2;
    const wbLen   = hemCirc * 0.90;
    const cuffLen = slvWidth * 2 * 0.85;

    // ── NOTCH MARKS ─────────────────────────────────────────────────────────
    const shoulderMidX = neckW + shoulderW / 2;
    const shoulderMidY = slopeDrop / 2;

    const frontNotches = [
      { x: shoulderMidX, y: shoulderMidY, angle: edgeAngle({ x: neckW, y: 0 }, { x: shoulderPtX, y: slopeDrop }) },
      { x: sideX, y: armholeY, angle: 0 },
      { x: shoulderPtX, y: slopeDrop + armholeDepth * 0.25, angle: edgeAngle({ x: shoulderPtX, y: slopeDrop }, { x: sideX, y: armholeY }) },
      { x: sideX, y: slopeDrop + armholeDepth * 0.75, angle: edgeAngle({ x: shoulderPtX, y: slopeDrop }, { x: sideX, y: armholeY }) },
    ];

    const backNotches = [
      { x: shoulderMidX, y: shoulderMidY, angle: edgeAngle({ x: neckW, y: 0 }, { x: shoulderPtX, y: slopeDrop }) },
      { x: backSideX, y: armholeY, angle: 0 },
      { x: shoulderPtX, y: slopeDrop + armholeDepth * 0.25, angle: edgeAngle({ x: shoulderPtX, y: slopeDrop }, { x: backSideX, y: armholeY }) },
      { x: backSideX, y: slopeDrop + armholeDepth * 0.75, angle: edgeAngle({ x: shoulderPtX, y: slopeDrop }, { x: backSideX, y: armholeY }) },
    ];

    const capW = slvWidth * 2;
    const sleeveNotches = [
      { x: capW / 2, y: 0, angle: -90 },
      { x: capW * 0.25, y: capHeight * 0.5, angle: edgeAngle({ x: 0, y: capHeight }, { x: capW / 2, y: 0 }) },
      { x: capW * 0.75, y: capHeight * 0.5, angle: edgeAngle({ x: capW / 2, y: 0 }, { x: capW, y: capHeight }) },
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
      {
        id: 'kangaroo-pocket',
        name: 'Kangaroo Pocket',
        instruction: 'Cut 1 · Center on front bodice at waist level · Round bottom corners (2″ radius) · {topstitch} sides and bottom',
        type: 'pocket',
        dimensions: { width: 10, height: 7 },
      },
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
      { name: 'Rib knit', quantity: '0.75 yard', notes: 'For waistband and cuffs - high recovery 2×2 rib' },
      { name: 'Flat cord drawstring', quantity: '54″', notes: 'Cotton or poly flat cord, ¼″–⅜″ wide, with aglets' },
      { name: 'Grommets or eyelets', quantity: '2', notes: '¼″ grommets at CF hood opening for cord exits' },
    ];

    if (isFullZip) {
      notions.push({ name: 'Separating zipper', quantity: `${Math.ceil(m.torsoLength + 2)}″`, notes: 'Full-length separating zipper - runs hem to neckline only (not through hood)' });
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
      detail: 'Round the two bottom corners of pocket (2″ radius). {serge} top edge, fold under ½″, {topstitch}. {press} remaining edges under ½″. Position centered on front body at waist level. {topstitch} on sides and bottom. Bar tack top corners.',
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
      detail: '{press} lightly with low steam. Try on - hood should sit comfortably without pulling neckline down.',
    });

    return steps;
  },
};
