// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Henley — crew-neck top with a 3-button vertical placket at CF.
 * No collar. Relaxed fit. Set-in sleeve (long, 3/4, or short).
 * Works in woven (poplin, linen, chambray) or knit (jersey, interlock) fabric.
 * Bodice geometry identical to tee.js; adds henley-placket facing pieces.
 */

import {
  armholeCurve, shoulderSlope, necklineCurve, sleeveCapCurve, shoulderDropFromWidth,
  armholeDepthFromChest, chestEaseDistribution, neckWidthFromCircumference, UPPER_EASE,
  validateSleeveSeams,
} from '../engine/upper-body.js';
import { sampleBezier, fmtInches, edgeAngle, arcLength, ptAtArcLen } from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

const SLEEVE_LENGTHS = { short: 9, three_quarter: 18, long: 26 };
const PLACKET_LEN = 5.5;   // inches of vertical placket opening from neckline down
const PLACKET_CUT_W = 2.5; // cut width of placket facing strip (1″ finished each side)

export default {
  id: 'henley',
  name: 'Henley',
  category: 'upper',
  difficulty: 'beginner',
  priceTier: 'simple',
  measurements: ['chest', 'shoulder', 'neck', 'sleeveLength', 'bicep', 'torsoLength'],
  measurementDefaults: { sleeveLength: 26 },

  options: {
    fit: {
      type: 'select', label: 'Fit',
      values: [
        { value: 'standard',  label: 'Regular (+4″)',    reference: 'classic, off-the-rack'  },
        { value: 'relaxed',   label: 'Relaxed (+6″)',    reference: 'skater, workwear'        },
        { value: 'oversized', label: 'Oversized (+10″)', reference: 'avant-garde, oversized'  },
      ],
      default: 'standard',
    },
    sleeve: {
      type: 'select', label: 'Sleeve length',
      values: [
        { value: 'long',          label: 'Long (26″)'     },
        { value: 'three_quarter', label: '¾ length (18″)' },
        { value: 'short',         label: 'Short (9″)'     },
      ],
      default: 'long',
    },
    fabric: {
      type: 'select', label: 'Fabric type',
      values: [
        { value: 'woven', label: 'Woven (poplin, linen, chambray)' },
        { value: 'knit',  label: 'Knit (jersey, interlock, pique)' },
      ],
      default: 'woven',
    },
    hem: {
      type: 'select', label: 'Hem style',
      values: [
        { value: 'straight',  label: 'Straight' },
        { value: 'shirttail', label: 'Shirttail curve' },
      ],
      default: 'straight',
    },
    sa: {
      type: 'select', label: 'Seam allowance',
      values: [
        { value: 0.625, label: '⅝″ (woven)' },
        { value: 0.5,   label: '½″ (knit)'  },
      ],
      default: 0.625,
    },
    hemAllowance: {
      type: 'select', label: 'Hem allowance',
      values: [
        { value: 0.75, label: '¾″' },
        { value: 1,    label: '1″' },
      ],
      default: 0.75,
    },
  },

  pieces(m, opts) {
    const sa  = parseFloat(opts.sa);
    const hem = parseFloat(opts.hemAllowance);

    const totalEase = UPPER_EASE[opts.fit] ?? 4;
    const panelW    = (m.chest + totalEase) / 4;
    const frontW    = panelW;
    const backW     = panelW;

    const halfShoulder = m.shoulder / 2;
    const neckW        = neckWidthFromCircumference(m.neck);
    const shoulderW    = halfShoulder - neckW;
    const slopeDrop    = shoulderDropFromWidth(shoulderW);
    const shoulderPtX  = halfShoulder;

    const armholeStyle = opts.fit === 'oversized' ? 'oversized' : 'standard';
    const armholeY     = armholeDepthFromChest(m.chest, armholeStyle);
    const armholeDepth = armholeY - slopeDrop;
    const chestDepth   = panelW - shoulderPtX;

    // Henley neckline: slightly deeper than a plain crew (neckW + 1.0)
    const neckDepthFront = neckW + 1.0;
    const neckDepthBack  = neckW / 3;

    const torsoLen  = m.torsoLength;
    const slvLength = SLEEVE_LENGTHS[opts.sleeve] ?? m.sleeveLength ?? 26;

    // ── CURVE TAGGING — VERIFIED WORKING, DO NOT CHANGE UNLESS NECESSARY ──
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
    function dedupPoly(poly, label) {
      const result = [poly[0]];
      for (let i = 1; i < poly.length; i++) {
        const prev = result[result.length - 1];
        const dx = poly[i].x - prev.x, dy = poly[i].y - prev.y;
        if (Math.sqrt(dx * dx + dy * dy) >= 0.05) result.push(poly[i]);
      }
      if (result.length !== poly.length) console.log(`[henley] ${label} dedup: ${poly.length} → ${result.length} pts`);
      return result;
    }

    const frontNeckPts    = sampleCurve(necklineCurve(neckW, neckDepthFront, 'crew'));
    const backNeckPts     = sampleCurve(necklineCurve(neckW, neckDepthBack,  'crew'));
    const frontShoulderPts = sampleCurve(shoulderSlope(shoulderW, slopeDrop));
    const frontArmholePts  = sampleCurve(armholeCurve(shoulderW, chestDepth, armholeDepth, false));
    const backArmholePts   = sampleCurve(armholeCurve(shoulderW, chestDepth, armholeDepth, true));

    const shoulderPtY = slopeDrop;

    // ── FRONT BODICE ─────────────────────────────────────────────────────────
    // Front is cut ON FOLD (same as tee). Henley placket is a separate facing piece
    // that is sewn to a vertical slit cut from neckline down PLACKET_LEN after assembly.
    const frontPoly = [];

    for (const p of [...frontNeckPts].reverse()) frontPoly.push({ ...p, x: neckW - p.x });
    // ── JUNCTION UNTAGGING — VERIFIED WORKING, DO NOT CHANGE UNLESS NECESSARY ──
    delete frontPoly[0].curve;
    delete frontPoly[frontNeckPts.length - 1].curve;

    for (let i = 1; i < frontShoulderPts.length; i++) {
      frontPoly.push({ ...frontShoulderPts[i], x: neckW + frontShoulderPts[i].x });
    }
    for (let i = 1; i < frontArmholePts.length; i++) {
      frontPoly.push({ ...frontArmholePts[i], x: shoulderPtX + frontArmholePts[i].x, y: shoulderPtY + frontArmholePts[i].y });
    }
    frontPoly.push({ x: panelW, y: torsoLen });
    if (opts.hem === 'shirttail') frontPoly.push({ x: neckW * 0.5, y: torsoLen + 0.5 });
    frontPoly.push({ x: 0, y: torsoLen });
    frontPoly.push({ x: 0, y: neckDepthFront });

    // ── BACK BODICE ──────────────────────────────────────────────────────────
    const backPoly = [];

    for (const p of [...backNeckPts].reverse()) backPoly.push({ ...p, x: neckW - p.x });
    // ── JUNCTION UNTAGGING — VERIFIED WORKING, DO NOT CHANGE UNLESS NECESSARY ──
    delete backPoly[0].curve;
    delete backPoly[backNeckPts.length - 1].curve;

    for (let i = 1; i < frontShoulderPts.length; i++) {
      backPoly.push({ ...frontShoulderPts[i], x: neckW + frontShoulderPts[i].x });
    }
    for (let i = 1; i < backArmholePts.length; i++) {
      backPoly.push({ ...backArmholePts[i], x: shoulderPtX + backArmholePts[i].x, y: shoulderPtY + backArmholePts[i].y });
    }
    backPoly.push({ x: panelW, y: torsoLen });
    if (opts.hem === 'shirttail') backPoly.push({ x: neckW * 0.5, y: torsoLen + 1 });
    backPoly.push({ x: 0, y: torsoLen });
    backPoly.push({ x: 0, y: neckDepthBack });

    // ── SLEEVE ───────────────────────────────────────────────────────────────
    const slvFullWidth = m.bicep + 2;
    const capHeight    = armholeDepth * (opts.fit === 'oversized' ? 0.55 : 0.60);
    const capCp        = sleeveCapCurve(m.bicep, capHeight, slvFullWidth);
    const capPts       = sampleCurve(capCp, 32);

    const sleevePoly = [];
    for (const p of capPts) sleevePoly.push({ ...p, y: p.y + capHeight });
    // ── SLEEVE JUNCTION UNTAGGING — VERIFIED WORKING, DO NOT CHANGE UNLESS NECESSARY ──
    delete sleevePoly[0].curve;
    delete sleevePoly[capPts.length - 1].curve;
    sleevePoly.push({ x: slvFullWidth, y: capHeight + slvLength });
    sleevePoly.push({ x: 0,           y: capHeight + slvLength });

    frontPoly.splice(0, frontPoly.length,   ...dedupPoly(frontPoly,   'front'));
    backPoly.splice(0, backPoly.length,     ...dedupPoly(backPoly,    'back'));
    sleevePoly.splice(0, sleevePoly.length, ...dedupPoly(sleevePoly,  'sleeve'));

    // ── SLEEVE CAP VALIDATION ─────────────────────────────────────────────────
    const { capArc, armholeArc, capEase } = validateSleeveSeams('henley', capPts, frontArmholePts, backArmholePts);
    const capEaseNote = `Cap: ${fmtInches(capArc)}, Armhole: ${fmtInches(armholeArc)}, Ease: ${fmtInches(capEase)}`;

    // ── NOTCHES ───────────────────────────────────────────────────────────────
    const shoulderMidX = (neckW + shoulderPtX) / 2;
    const shoulderMidY = slopeDrop / 2;

    const FRONT_NOTCH_ARC = 3.25;
    const BACK_NOTCH_ARC  = 3.25;
    const frontArmPtsRev  = [...frontArmholePts].reverse();
    const backArmPtsRev   = [...backArmholePts].reverse();
    const frontNotchPt    = ptAtArcLen(frontArmPtsRev, FRONT_NOTCH_ARC);
    const backNotch1Pt    = ptAtArcLen(backArmPtsRev, BACK_NOTCH_ARC);
    const backNotch2Pt    = ptAtArcLen(backArmPtsRev, BACK_NOTCH_ARC + 0.25);

    const frontNotches = [
      { x: shoulderMidX, y: shoulderMidY, angle: edgeAngle({ x: neckW, y: 0 }, { x: shoulderPtX, y: slopeDrop }) },
      { x: panelW,       y: armholeY,     angle: 0 },
      { x: frontNotchPt.x + shoulderPtX, y: frontNotchPt.y + slopeDrop, angle: 0 },
    ];
    const backNotches = [
      { x: shoulderMidX, y: shoulderMidY, angle: edgeAngle({ x: neckW, y: 0 }, { x: shoulderPtX, y: slopeDrop }) },
      { x: panelW,       y: armholeY,     angle: 0 },
      { x: backNotch1Pt.x + shoulderPtX, y: backNotch1Pt.y + slopeDrop, angle: 0 },
      { x: backNotch2Pt.x + shoulderPtX, y: backNotch2Pt.y + slopeDrop, angle: 0 },
    ];

    const capW       = slvFullWidth;
    const capMidIdx  = Math.floor(capPts.length / 2);
    const backCapPts = capPts.slice(0, capMidIdx + 1);
    const frontCapPtsRev = [...capPts.slice(capMidIdx)].reverse();
    const backCapNotch1  = ptAtArcLen(backCapPts, BACK_NOTCH_ARC);
    const backCapNotch2  = ptAtArcLen(backCapPts, BACK_NOTCH_ARC + 0.25);
    const frontCapNotch  = ptAtArcLen(frontCapPtsRev, FRONT_NOTCH_ARC);
    const sleeveNotches = [
      { x: capW / 2,          y: 0,          angle: -90 },
      { x: backCapNotch1.x,   y: backCapNotch1.y  + capHeight, angle: edgeAngle(backCapPts[0], backCapPts[1]) },
      { x: backCapNotch2.x,   y: backCapNotch2.y  + capHeight, angle: edgeAngle(backCapPts[0], backCapPts[1]) },
      { x: frontCapNotch.x,   y: frontCapNotch.y  + capHeight, angle: edgeAngle(frontCapPtsRev[0], frontCapPtsRev[1]) },
    ];

    const frontBB  = bbox(frontPoly);
    const backBB   = bbox(backPoly);
    const sleeveBB = bbox(sleevePoly);

    // Placket dimensions
    const placketH  = neckDepthFront + PLACKET_LEN + 0.5;
    // Button positions: 3 buttons, first at neckDepthFront + 0.75, then every ~1.75
    const bh1 = neckDepthFront + 0.75;
    const bh2 = neckDepthFront + 2.5;
    const bh3 = neckDepthFront + 4.25;

    const pieces = [
      {
        id: 'bodice-front',
        name: 'Front Bodice',
        instruction: `Cut 1 on fold (CF) · After assembly: cut ${fmtInches(PLACKET_LEN)} vertical slit at CF from neckline down for placket opening`,
        type: 'bodice',
        polygon: frontPoly,
        path: polyToPathStr(frontPoly),
        width:  frontBB.maxX - frontBB.minX,
        height: frontBB.maxY - frontBB.minY,
        isBack: false,
        sa, hem,
        marks: [{ type: 'button', x: 0, y: bh1 }, { type: 'button', x: 0, y: bh2 }, { type: 'button', x: 0, y: bh3 }],
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
        width:  backBB.maxX - backBB.minX,
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
        instruction: `Cut 2 (mirror L & R) · Set-in cap · ${opts.sleeve === 'short' ? 'Short sleeve' : opts.sleeve === 'three_quarter' ? '¾ sleeve' : 'Long sleeve'} · ${capEaseNote}`,
        type: 'sleeve',
        polygon: sleevePoly,
        path: polyToPathStr(sleevePoly),
        width:  sleeveBB.maxX - sleeveBB.minX,
        height: sleeveBB.maxY - sleeveBB.minY,
        capHeight,
        sleeveLength: slvLength,
        sleeveWidth: slvFullWidth,
        sa, hem,
        notches: sleeveNotches,
        dims: [
          { label: fmtInches(slvFullWidth) + ' underarm', x1: 0, y1: capHeight + 0.4, x2: slvFullWidth, y2: capHeight + 0.4, type: 'h' },
          { label: fmtInches(slvLength) + ' length', x: slvFullWidth + 1, y1: capHeight, y2: capHeight + slvLength, type: 'v' },
        ],
      },
      {
        id: 'henley-placket',
        name: 'Henley Placket Facing',
        instruction: `Cut 4 (2 outer + 2 facing per panel — 1 per CF side) · Interface outer · ${fmtInches(PLACKET_CUT_W)} wide × ${fmtInches(placketH)} long · Mark 3 buttonhole positions at ${fmtInches(bh1)}, ${fmtInches(bh2)}, ${fmtInches(bh3)} from top on RIGHT outer piece only`,
        type: 'rectangle',
        dimensions: { length: placketH, width: PLACKET_CUT_W },
        sa,
      },
    ];

    // ── NECKLINE FINISH ───────────────────────────────────────────────────────
    if (opts.fabric === 'knit') {
      // Rib neckband (without placket)
      const nbLen = m.neck * 0.85;
      pieces.push({
        id: 'neckband',
        name: 'Neckband (rib)',
        instruction: `Cut 1 from rib knit on fold · ${fmtInches(nbLen)} long × 3″ cut (1.5″ finished) · 85% of neck opening`,
        type: 'rectangle',
        dimensions: { length: nbLen, width: 3 },
        sa,
      });
    } else {
      // Woven: shaped facing strip following neckline curve
      const frontNeckArc = arcLength(frontNeckPts);
      const backNeckArc  = arcLength(backNeckPts);
      const facingLen    = frontNeckArc * 2 + backNeckArc * 2;
      pieces.push({
        id: 'neckline-facing',
        name: 'Neckline Facing',
        instruction: `Cut 1 on fold from self or lining fabric · Interface · ${fmtInches(facingLen)} long × 2.5″ wide · Shape to match neck curve · {understitch} after attaching to neckline`,
        type: 'rectangle',
        dimensions: { length: facingLen, width: 2.5 },
        sa,
      });
    }

    return pieces;
  },

  materials(m, opts) {
    const isKnit = opts.fabric === 'knit';
    const notions = [
      { ref: 'interfacing-light', quantity: '0.25 yard (placket facings + neckline facing)' },
      { name: 'Buttons', quantity: '3', notes: '½″ sew-through buttons for placket' },
    ];

    return buildMaterialsSpec({
      fabrics: isKnit
        ? ['cotton-jersey', 'poly-jersey', 'rayon-jersey']
        : ['chambray', 'cotton-poplin', 'linen', 'linen-light'],
      notions,
      thread: 'poly-all',
      needle: isKnit ? 'ballpoint-80' : 'universal-80',
      stitches: isKnit
        ? ['stretch', 'overlock', 'zigzag-med', 'coverstitch']
        : ['straight-2.5', 'zigzag-small', 'topstitch'],
      notes: [
        isKnit
          ? 'Knit henley: use stretch stitch or serger for ALL seams — a straight stitch will pop. Ballpoint needle prevents skipped stitches.'
          : 'Woven henley: stay-stitch the neckline ⅝″ from edge before attaching placket to prevent stretching.',
        'Henley placket construction: sew outer to facing {RST} on three sides, turn RS out, {press}. Attach one piece to each side of the CF slit, then fold back and {topstitch} from RS.',
        'Interface the placket outer pieces BEFORE cutting for precise buttonhole placement.',
        'Make buttonholes before attaching the placket to the body — much easier to handle flat.',
        opts.sleeve === 'long' ? 'Long sleeve: a sleeve placket or simple slit at the cuff helps get the sleeve over the hand. Optional 1.5″ slit at cuff hem with a button loop.' : '',
      ].filter(Boolean),
    });
  },

  instructions(m, opts) {
    const steps = [];
    let n = 1;
    const isKnit = opts.fabric === 'knit';

    steps.push({
      step: n++, title: 'Prepare henley placket',
      detail: `Interface the two outer placket pieces. Make buttonholes on the right outer piece at ${fmtInches(5.5 / 3)} intervals. Sew each outer piece to its facing {RST} on three sides (two long sides + bottom), leaving the top edge open. {clip} bottom corners. Turn RS out, {press}. {topstitch} ⅛″ from the three closed edges.`,
    });

    steps.push({
      step: n++, title: 'Sew shoulder seams',
      detail: isKnit
        ? 'Join front to back at shoulders {RST}. Stretch stitch or {serge}. {press} toward back.'
        : 'Join front to back at shoulders {RST}. Straight stitch, {press} open. {serge} or {zigzag} SAs.',
    });

    steps.push({
      step: n++, title: 'Install henley placket',
      detail: `Cut a ${fmtInches(PLACKET_LEN)} vertical slit down the front from the center of the neckline opening. Clip a tiny triangle at the bottom of the slit. Align one placket piece to each side of the slit {RST}. Sew a 3mm seam from top to bottom of each side. Fold plackets away from slit. {press}. {topstitch} from RS to hold in place. The right side overlaps the left when buttoned.`,
    });

    if (isKnit) {
      steps.push({ step: n++, title: 'Attach neckband', detail: 'Fold neckband in half lengthwise {WST}. Divide into quarters, pin to neck opening. Stretch stitch or {serge}, stretching band to fit. {press} toward bodice.' });
    } else {
      steps.push({ step: n++, title: 'Attach neckline facing', detail: 'Interface neckline facing. Sew short ends to form a loop. Sew to neck opening {RST}. {clip} curves. {press} facing up. {understitch}. Fold facing to inside, {topstitch} or {slipstitch}.' });
    }

    steps.push({
      step: n++, title: 'Set sleeves',
      detail: isKnit
        ? 'Pin sleeve cap to armhole. Ease cap. Stretch stitch or {serge}. {press} toward sleeve.'
        : 'Pin sleeve cap {RST}, match notches. Ease cap. Sew. {press} toward sleeve.',
    });

    steps.push({
      step: n++, title: 'Sew side and underarm seams',
      detail: isKnit
        ? 'Sew from hem through underarm to sleeve hem in one pass. Stretch stitch or {serge}.'
        : 'Sew from hem through underarm to sleeve hem {RST}. {clip} underarm. {press} open.',
    });

    steps.push({
      step: n++, title: 'Hem body and sleeves',
      detail: isKnit
        ? 'Fold hem allowance up, {press}. Topstitch with twin needle or coverstitch for a professional knit hem.'
        : `Fold hem allowance ${fmtInches(parseFloat(opts.hemAllowance))} up twice, {press}. {topstitch} from RS.`,
    });

    steps.push({
      step: n++, title: 'Sew buttons and finish',
      detail: 'Sew 3 buttons to left placket piece, aligning to buttonholes on right piece. {press} entire garment.',
    });

    return steps;
  },

  variants: [
    {
      id: 'long-sleeve-henley',
      name: 'Long Sleeve Henley',
      defaults: { sleeve: 'long', fit: 'relaxed', fabric: 'knit', hem: 'straight' },
    },
  ],
};
