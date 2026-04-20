// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Polo Shirt — classic knit polo with self-fabric collar, 2-button CF placket,
 * set-in short sleeve with stiff rib cuff, turn-back hem, and side slits.
 *
 * Pieces: front bodice (CF slit for placket), back bodice (¾″ longer),
 *         set-in sleeve ×2, sleeve rib cuff ×2, polo collar upper + under,
 *         CF placket facing strip ×4, neck tape.
 *
 * Construction note: collar crispness comes from interfacing the upper collar
 * piece and the sewn-and-turned method — not from fabric stiffness alone.
 * Readymade knit collar pieces (available from specialty fabric suppliers) may
 * be substituted for the self-fabric collar if desired.
 */

import {
  armholeCurve, shoulderSlope, necklineCurve, sleeveCapCurve, shoulderDropFromWidth,
  armholeDepthFromChest, neckWidthFromCircumference, UPPER_EASE,
  validateSleeveSeams,
} from '../engine/upper-body.js';
import { sampleBezier, fmtInches, edgeAngle, arcLength, ptAtArcLen } from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

const PLACKET_LEN   = 4.0;   // vertical CF opening from neckline down (2 buttons)
const PLACKET_CUT_W = 2.5;   // cut width of each placket facing strip
const SLIT_DEPTH    = 2.5;   // side hem slit depth (inches)
const BACK_EXTRA    = 0.75;  // back bodice is this much longer than front

// Sleeve length presets (from underarm)
const SLEEVE_LENGTHS = { 'mid-bicep': 7, 'elbow': 9 };

export default {
  id: 'polo-shirt',
  name: 'Polo Shirt',
  category: 'upper',
  difficulty: 'intermediate',
  priceTier: 'core',
  measurements: ['chest', 'shoulder', 'neck', 'bicep', 'torsoLength'],

  options: {
    fit: {
      type: 'select', label: 'Fit',
      values: [
        { value: 'fitted',   label: 'Slim (+2″)',    reference: 'fitted, performance'   },
        { value: 'standard', label: 'Regular (+4″)', reference: 'classic, off-the-rack' },
        { value: 'relaxed',  label: 'Relaxed (+6″)', reference: 'casual, boxy'          },
      ],
      default: 'standard',
    },
    sleeve: {
      type: 'select', label: 'Sleeve length',
      values: [
        { value: 'mid-bicep', label: 'Mid-bicep (7″)'    },
        { value: 'elbow',     label: 'Above elbow (9″)'  },
      ],
      default: 'mid-bicep',
    },
    collar: {
      type: 'select', label: 'Collar finish',
      values: [
        { value: 'interfaced',   label: 'Interfaced (crisp, structured)' },
        { value: 'uninterfaced', label: 'No interfacing (soft, sporty)'  },
      ],
      default: 'interfaced',
    },
    sa: {
      type: 'select', label: 'Seam allowance',
      values: [
        { value: 0.375, label: '⅜″' },
        { value: 0.5,   label: '½″' },
      ],
      default: 0.375,
    },
    hem: {
      type: 'select', label: 'Hem allowance (turn-back)',
      values: [
        { value: 0.5,  label: '½″ single fold' },
        { value: 0.75, label: '¾″ single fold'  },
      ],
      default: 0.5,
    },
  },

  pieces(m, opts) {
    const sa      = parseFloat(opts.sa);
    const hem     = parseFloat(opts.hem);
    const slvLen  = SLEEVE_LENGTHS[opts.sleeve] ?? 7;
    const totalEase = UPPER_EASE[opts.fit] ?? 4;

    // ── Panel widths ─────────────────────────────────────────────────────────
    const panelW = (m.chest + totalEase) / 4;

    // ── Shoulder geometry ────────────────────────────────────────────────────
    const halfShoulder = m.shoulder / 2;
    const neckW        = neckWidthFromCircumference(m.neck);
    const shoulderW    = halfShoulder - neckW;
    const slopeDrop    = shoulderDropFromWidth(shoulderW);
    const shoulderPtX  = halfShoulder;

    // ── Armhole geometry ─────────────────────────────────────────────────────
    const armholeY     = armholeDepthFromChest(m.chest, 'standard');
    const armholeDepth = armholeY - slopeDrop;
    const chestDepth   = panelW - shoulderPtX;

    // ── Polo neckline: slightly shallower crew than a tee (sporty, wider) ────
    const neckDepthFront = neckW + 0.25;
    const neckDepthBack  = neckW / 4;

    const torsoLen = m.torsoLength;
    const backLen  = torsoLen + BACK_EXTRA;

    // ── Curve helpers ─────────────────────────────────────────────────────────
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
      if (result.length !== poly.length) console.log(`[polo-shirt] ${label} dedup: ${poly.length} → ${result.length} pts`);
      return result;
    }

    // ── Curve sampling ───────────────────────────────────────────────────────
    const frontNeckPts    = sampleCurve(necklineCurve(neckW, neckDepthFront, 'crew'));
    const backNeckPts     = sampleCurve(necklineCurve(neckW, neckDepthBack,  'crew'));
    const frontShoulderPts = sampleCurve(shoulderSlope(shoulderW, slopeDrop));
    const frontArmholePts  = sampleCurve(armholeCurve(shoulderW, chestDepth, armholeDepth, false));
    const backArmholePts   = sampleCurve(armholeCurve(shoulderW, chestDepth, armholeDepth, true));

    const shoulderPtY = slopeDrop;

    // ── FRONT BODICE ─────────────────────────────────────────────────────────
    // CF is fold; placket slit cut after assembly.
    // Side seam shows slit start point (top of slit, SLIT_DEPTH above hem).
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
    frontPoly.push({ x: panelW, y: torsoLen - SLIT_DEPTH }); // slit start notch
    frontPoly.push({ x: panelW, y: torsoLen });
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
    backPoly.push({ x: panelW, y: backLen - SLIT_DEPTH }); // slit start notch
    backPoly.push({ x: panelW, y: backLen });
    backPoly.push({ x: 0, y: backLen });
    backPoly.push({ x: 0, y: neckDepthBack });

    // ── SLEEVE ───────────────────────────────────────────────────────────────
    const slvFullWidth = m.bicep + 2;
    const capHeight    = armholeDepth * 0.72;
    const capCp        = sleeveCapCurve(m.bicep, capHeight, slvFullWidth);
    const capPts       = sampleCurve(capCp, 32);

    const sleevePoly = [];
    for (const p of capPts) sleevePoly.push({ ...p, y: p.y + capHeight });
    // ── SLEEVE JUNCTION UNTAGGING — VERIFIED WORKING, DO NOT CHANGE UNLESS NECESSARY ──
    delete sleevePoly[0].curve;
    delete sleevePoly[capPts.length - 1].curve;
    sleevePoly.push({ x: slvFullWidth, y: capHeight + slvLen });
    sleevePoly.push({ x: 0,           y: capHeight + slvLen });

    frontPoly.splice(0, frontPoly.length,   ...dedupPoly(frontPoly,   'front'));
    backPoly.splice(0, backPoly.length,     ...dedupPoly(backPoly,    'back'));
    sleevePoly.splice(0, sleevePoly.length, ...dedupPoly(sleevePoly,  'sleeve'));

    // ── SLEEVE CAP VALIDATION ─────────────────────────────────────────────────
    const { capArc, armholeArc, capEase } = validateSleeveSeams('polo-shirt', capPts, frontArmholePts, backArmholePts);
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
    const backCapPts     = capPts.slice(0, capMidIdx + 1);
    const frontCapPtsRev = [...capPts.slice(capMidIdx)].reverse();
    const backCapNotch1  = ptAtArcLen(backCapPts, BACK_NOTCH_ARC);
    const backCapNotch2  = ptAtArcLen(backCapPts, BACK_NOTCH_ARC + 0.25);
    const frontCapNotch  = ptAtArcLen(frontCapPtsRev, FRONT_NOTCH_ARC);
    const sleeveNotches = [
      { x: capW / 2,        y: 0,         angle: -90 },
      { x: backCapNotch1.x, y: backCapNotch1.y + capHeight, angle: edgeAngle(backCapPts[0], backCapPts[1]) },
      { x: backCapNotch2.x, y: backCapNotch2.y + capHeight, angle: edgeAngle(backCapPts[0], backCapPts[1]) },
      { x: frontCapNotch.x, y: frontCapNotch.y + capHeight, angle: edgeAngle(frontCapPtsRev[0], frontCapPtsRev[1]) },
    ];

    const frontBB  = bbox(frontPoly);
    const backBB   = bbox(backPoly);
    const sleeveBB = bbox(sleevePoly);

    // ── COLLAR DIMENSIONS ────────────────────────────────────────────────────
    // Polo collar: 2 pieces (upper + under) sewn RST on 3 sides, turned.
    // Length = full neckline opening circumference.
    // Each bodice is cut on fold, so each contributes 2× its arc.
    const frontNeckArc  = arcLength(frontNeckPts);
    const backNeckArc   = arcLength(backNeckPts);
    const collarLen     = (frontNeckArc + backNeckArc) * 2 + sa * 4;
    const collarCutW    = 6.0;  // 3″ finished height (collar folds to show ~2.75″)

    // ── SLEEVE RIB CUFF ───────────────────────────────────────────────────────
    // Stiff polo-weight rib: 90% of sleeve opening (less stretch than soft jersey rib).
    // Folded over and pressed to create the characteristic polo sleeve band.
    const cuffLen  = slvFullWidth * 0.90;
    const cuffCutW = 3.0;  // 1.5″ finished

    // ── CF PLACKET ────────────────────────────────────────────────────────────
    const placketH = neckDepthFront + PLACKET_LEN + 0.5;
    const bh1 = neckDepthFront + 0.75;
    const bh2 = neckDepthFront + 2.5;

    // ── NECK TAPE ─────────────────────────────────────────────────────────────
    // Narrow self-fabric or twill tape strip sewn over the interior neckline seam.
    // Covers the SA and gives the inside of the polo its clean, finished look.
    const neckTapeLen = (frontNeckArc + backNeckArc) * 2 + PLACKET_CUT_W + 1.0;
    const neckTapeW   = 1.25;

    const pieces = [
      {
        id: 'bodice-front',
        name: 'Front Bodice',
        instruction: `Cut 1 on fold (CF) · After assembly cut ${fmtInches(PLACKET_LEN)} CF slit from neckline down for placket · Mark slit starts ${fmtInches(SLIT_DEPTH)} from each side hem edge`,
        type: 'bodice',
        polygon: frontPoly,
        path: polyToPathStr(frontPoly),
        width:  frontBB.maxX - frontBB.minX,
        height: frontBB.maxY - frontBB.minY,
        isBack: false,
        sa, hem,
        marks: [{ type: 'button', x: 0, y: bh1 }, { type: 'button', x: 0, y: bh2 }],
        notches: frontNotches,
        dims: [
          { label: fmtInches(panelW) + ' half width', x1: 0, y1: -0.5, x2: panelW, y2: -0.5, type: 'h' },
          { label: fmtInches(torsoLen) + ' length', x: frontBB.maxX + 1, y1: 0, y2: torsoLen, type: 'v' },
        ],
      },
      {
        id: 'bodice-back',
        name: 'Back Bodice',
        instruction: `Cut 1 on fold (CB) · Back is ${fmtInches(BACK_EXTRA)} longer than front · Mark slit starts ${fmtInches(SLIT_DEPTH)} from each side hem edge`,
        type: 'bodice',
        polygon: backPoly,
        path: polyToPathStr(backPoly),
        width:  backBB.maxX - backBB.minX,
        height: backBB.maxY - backBB.minY,
        isBack: true,
        sa, hem,
        notches: backNotches,
        dims: [
          { label: fmtInches(panelW) + ' half width', x1: 0, y1: -0.5, x2: panelW, y2: -0.5, type: 'h' },
          { label: fmtInches(backLen) + ' length', x: backBB.maxX + 1, y1: 0, y2: backLen, type: 'v' },
        ],
      },
      {
        id: 'sleeve',
        name: 'Sleeve',
        instruction: `Cut 2 (mirror L & R) · Set-in cap · ${opts.sleeve === 'mid-bicep' ? 'Mid-bicep length (7″)' : 'Above-elbow length (9″)'} · ${capEaseNote}`,
        type: 'sleeve',
        polygon: sleevePoly,
        path: polyToPathStr(sleevePoly),
        width:  sleeveBB.maxX - sleeveBB.minX,
        height: sleeveBB.maxY - sleeveBB.minY,
        capHeight,
        sleeveLength: slvLen,
        sleeveWidth: slvFullWidth,
        sa, hem,
        notches: sleeveNotches,
        dims: [
          { label: fmtInches(slvFullWidth) + ' underarm', x1: 0, y1: capHeight + 0.4, x2: slvFullWidth, y2: capHeight + 0.4, type: 'h' },
          { label: fmtInches(slvLen) + ' length', x: slvFullWidth + 1, y1: capHeight, y2: capHeight + slvLen, type: 'v' },
        ],
      },
      {
        id: 'sleeve-rib',
        name: 'Sleeve Rib Cuff',
        instruction: `Cut 2 from stiff rib knit on fold · ${fmtInches(cuffLen)} long × ${fmtInches(cuffCutW)} cut (${fmtInches(cuffCutW / 2)} finished) · 90% of sleeve opening · Fold in half lengthwise, {press}. Sew to sleeve hem, RS together, stretching cuff to fit opening`,
        type: 'rectangle',
        dimensions: { length: cuffLen, width: cuffCutW },
        sa,
      },
      {
        id: 'polo-collar',
        name: 'Polo Collar',
        instruction: [
          `Cut 2 from body fabric (1 upper collar, 1 under collar)`,
          `${fmtInches(collarLen)} long × ${fmtInches(collarCutW)} wide`,
          opts.collar === 'interfaced'
            ? 'Interface the upper collar piece (WS) before sewing. Interfacing gives the stiff, crisp stand characteristic of a classic polo collar.'
            : 'No interfacing — collar will have a soft, relaxed drape.',
          `Sew upper collar to under collar {RST} on 3 sides (2 short ends + 1 long outer edge). Leave the long neckline edge open. {clip} corners. Turn RS out, {press} firmly. {topstitch} ⅛″ from all 3 closed seam edges.`,
          `Readymade knit collar pieces from specialty sewing suppliers may be substituted.`,
        ].join(' · '),
        type: 'rectangle',
        dimensions: { length: collarLen, width: collarCutW },
        sa,
      },
      {
        id: 'cf-placket',
        name: 'CF Placket Facing',
        instruction: `Cut 4 (2 outer + 2 facing — 1 pair per CF side) · Interface outer pieces · ${fmtInches(PLACKET_CUT_W)} wide × ${fmtInches(placketH)} long · Mark 2 buttonholes on RIGHT outer piece at ${fmtInches(bh1)} and ${fmtInches(bh2)} from top`,
        type: 'rectangle',
        dimensions: { length: placketH, width: PLACKET_CUT_W },
        sa,
      },
      {
        id: 'neck-tape',
        name: 'Neck Tape',
        instruction: `Cut 1 from self-fabric or lightweight twill tape · ${fmtInches(neckTapeLen)} long × ${fmtInches(neckTapeW)} wide · Covers the neckline SA on the garment interior. Press in half lengthwise, lay over neckline seam after collar is attached, {topstitch} through all layers from RS`,
        type: 'rectangle',
        dimensions: { length: neckTapeLen, width: neckTapeW },
        sa: 0,
      },
    ];

    return pieces;
  },

  materials(m, opts) {
    const notions = [
      {
        ref: 'interfacing-light',
        quantity: opts.collar === 'interfaced'
          ? '0.25 yard (upper collar + CF placket outer pieces)'
          : '0.125 yard (CF placket outer pieces only)',
      },
      { name: 'Buttons',          quantity: '2', notes: '½″–⅝″ sew-through buttons for placket' },
      { name: 'Stiff rib knit',   quantity: '0.25 yard', notes: '2×2 or 1×1 polo-weight rib for sleeve cuffs (firmer than waistband rib)' },
    ];

    return buildMaterialsSpec({
      fabrics: [
        { name: 'Cotton piqué',    weight: '6–8 oz/yd²', stretch: true, category: 'knit', notes: 'Textured waffle knit. The classic polo fabric.' },
        'poly-jersey',    // covers poly interlock
        'cotton-jersey',
      ],
      notions,
      thread: 'poly-all',
      needle: 'ballpoint-80',
      stitches: ['stretch', 'overlock', 'topstitch', 'zigzag-med'],
      notes: [
        'Piqué or interlock knit is recommended. Piqué has the textured waffle weave of a classic polo; interlock is smooth and heavier than jersey.',
        opts.collar === 'interfaced'
          ? 'Collar crispness: interface the upper collar piece with a medium-weight fusible woven interfacing before sewing. The turn-and-press construction creates the sharp fold edges.'
          : 'Soft collar: skip interfacing for a relaxed, sporty look. Use a heavier piqué if you want some natural body.',
        'Readymade knit collar pieces are available from specialty sewing suppliers and can replace the self-fabric collar.',
        'Pre-wash fabric before cutting. Knit polo fabric shrinks 3–5% in first wash.',
        'Use a ballpoint needle to avoid snags and skipped stitches on knit.',
        'All seams should be serged or sewn with a stretch stitch. A straight stitch only will pop under tension.',
      ].filter(Boolean),
    });
  },

  instructions(m, opts) {
    const hem  = parseFloat(opts.hem);
    const steps = [];
    let n = 1;

    steps.push({
      step: n++, title: 'Prepare CF placket',
      detail: `Interface the 2 outer placket pieces. Make 2 buttonholes on the right outer piece at ${fmtInches(PLACKET_LEN / 2)} intervals. Sew each outer piece to its facing {RST} on 3 sides (2 long sides + bottom), leave top open. {clip} corners. Turn RS out, {press}. {topstitch} ⅛″ from finished edges.`,
    });

    steps.push({
      step: n++, title: 'Prepare polo collar',
      detail: opts.collar === 'interfaced'
        ? `Fuse interfacing to WS of upper collar piece. Sew upper collar to under collar {RST} along outer long edge and both short ends, leaving neckline edge open. {clip} corners. Turn RS out, {press} firmly — crisp edges come from pressing, not just turning. {topstitch} ⅛″ from all 3 closed seam edges.`
        : `Sew collar pieces {RST} along outer long edge and both short ends, leaving neckline edge open. {clip} corners. Turn RS out, {press}. {topstitch} ⅛″ from all 3 closed seam edges.`,
    });

    steps.push({
      step: n++, title: 'Sew shoulder seams',
      detail: 'Join front to back at shoulders {RST}. Stretch stitch or {serge}. {press} toward back.',
    });

    steps.push({
      step: n++, title: 'Install CF placket',
      detail: `Cut a ${fmtInches(PLACKET_LEN)} vertical slit at center front from the neckline down. Clip a small triangle at the slit bottom. Attach one placket piece to each side of the slit {RST}, 3mm seam. Fold plackets away from body, {press}. {topstitch} from RS. Right side overlaps left when buttoned.`,
    });

    steps.push({
      step: n++, title: 'Attach collar',
      detail: 'Pin under collar to neckline {RST}, distributing ease. Collar ends meet at placket edges. Sew at ⅜″ SA. {serge} or {zigzag} SA. {press} SA toward bodice.',
    });

    steps.push({
      step: n++, title: 'Apply neck tape',
      detail: `Fold neck tape in half lengthwise, {press}. Lay folded tape over the neckline SA on the garment interior, enclosing the raw edge. {topstitch} through all layers from RS close to the collar base. This gives the inside its clean, store-finished look.`,
    });

    steps.push({
      step: n++, title: 'Set sleeves',
      detail: 'Pin sleeve cap to armhole {RST}, matching notches. Ease cap to fit. Stretch stitch or {serge}. {press} toward sleeve.',
    });

    steps.push({
      step: n++, title: 'Sew side and underarm seams',
      detail: `Sew front to back at side seams from ${fmtInches(SLIT_DEPTH)} above the front hem mark (slit top), through underarm, to sleeve hem in one continuous pass. Stretch stitch or {serge}. {press} toward back.`,
    });

    steps.push({
      step: n++, title: 'Finish side slits',
      detail: `With side seam sewn only to the slit mark, fold back raw edges on each open slit section ${fmtInches(hem)} to WS and {topstitch}. The back slit hem folds over the front at the corner for a neat finish. Secure corners with a small bartack or hand stitch.`,
    });

    steps.push({
      step: n++, title: 'Attach sleeve rib cuffs',
      detail: 'Fold each cuff in half lengthwise {WST}, {press}. Pin to sleeve hem {RST}, stretching cuff to match opening. Stretch stitch or {serge}. {press} SA up into sleeve.',
    });

    steps.push({
      step: n++, title: 'Hem body (turn-back)',
      detail: `Fold hem ${fmtInches(hem)} to WS, {press}. {topstitch} from RS. Stop and restart at each side slit — do not stitch across the open slit edges.`,
    });

    steps.push({
      step: n++, title: 'Sew buttons and final press',
      detail: 'Sew 2 buttons to left placket, aligned with buttonholes on right. {press} collar with steam, holding the outer fold crisp. Try on — collar should stand slightly and roll over cleanly at the fold.',
    });

    return steps;
  },

  variants: [
    { id: 'slim-polo',    name: 'Slim Polo',    defaults: { fit: 'fitted',   sleeve: 'mid-bicep', collar: 'interfaced'   } },
    { id: 'classic-polo', name: 'Classic Polo', defaults: { fit: 'standard', sleeve: 'elbow',     collar: 'interfaced'   } },
    { id: 'sport-polo',   name: 'Sport Polo',   defaults: { fit: 'relaxed',  sleeve: 'mid-bicep', collar: 'uninterfaced' } },
  ],
};
