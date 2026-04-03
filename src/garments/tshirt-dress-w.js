// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * T-Shirt Dress (Womenswear) — knit dress extending the fitted-tee bodice.
 * Same upper-body block as fitted-tee-w, extended to knee/midi/maxi length.
 * Pieces: front body, back body, sleeve, neckband. Single-piece construction (no waist seam).
 */

import {
  armholeCurve, shoulderSlope, necklineCurve, sleeveCapCurve, shoulderDropFromWidth,
  armholeDepthFromChest, chestEaseDistribution, neckWidthFromCircumference,
} from '../engine/upper-body.js';
import { sampleBezier, fmtInches, edgeAngle, arcLength, ptAtArcLen } from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

const SLEEVE_LENGTHS = { short: 7, cap: 3, three_quarter: 17, long: 24 };

const NECK_DEPTHS = {
  crew:  { front: 2.0, back: 0.75 },
  scoop: { front: 5.0, back: 0.75 },
  vneck: { front: 8.0, back: 0.75 },
};

export default {
  id: 'tshirt-dress-w',
  name: 'T-Shirt Dress (W)',
  category: 'upper',
  difficulty: 'beginner',
  priceTier: 'core',
  measurements: ['chest', 'shoulder', 'neck', 'sleeveLength', 'bicep', 'torsoLength', 'hip', 'skirtLength'],
  measurementDefaults: { sleeveLength: 7, skirtLength: 24 },

  options: {
    neckline: {
      type: 'select', label: 'Neckline',
      values: [
        { value: 'scoop', label: 'Scoop (default)' },
        { value: 'crew',  label: 'Crew'             },
        { value: 'vneck', label: 'V-neck'           },
      ],
      default: 'scoop',
    },
    fit: {
      type: 'select', label: 'Fit',
      values: [
        { value: 'fitted',  label: 'Fitted (+2″)',  reference: 'body-con, slim' },
        { value: 'relaxed', label: 'Relaxed (+4″)',  reference: 'easy, everyday' },
      ],
      default: 'relaxed',
    },
    sleeve: {
      type: 'select', label: 'Sleeve',
      values: [
        { value: 'short',         label: 'Short (7″)'     },
        { value: 'cap',           label: 'Cap (3″)'       },
        { value: 'three_quarter', label: '¾ length (17″)' },
        { value: 'long',          label: 'Long (24″)'     },
      ],
      default: 'short',
    },
    length: {
      type: 'select', label: 'Length',
      values: [
        { value: 'knee',  label: 'Knee'          },
        { value: 'midi',  label: 'Midi (+6″)'    },
        { value: 'maxi',  label: 'Maxi (+14″)'   },
        { value: 'mini',  label: 'Mini (−6″)'    },
      ],
      default: 'knee',
    },
    hemStyle: {
      type: 'select', label: 'Hem',
      values: [
        { value: 'straight', label: 'Straight (twin needle)' },
        { value: 'banded',   label: 'Rib hem band'           },
      ],
      default: 'straight',
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
        { value: 1,    label: '1″'             },
      ],
      default: 0.75,
    },
  },

  pieces(m, opts) {
    const sa  = parseFloat(opts.sa);
    const hem = parseFloat(opts.hem);

    const easeVal = opts.fit === 'relaxed' ? 4 : 2;
    const panelW  = (m.chest + easeVal) / 4;
    // Hip panel: use wider of chest or hip to ensure skirt doesn't pull
    const hipPanelW = Math.max(panelW, (m.hip + easeVal) / 4);

    const neckW       = neckWidthFromCircumference(m.neck);
    const shoulderW   = m.shoulder / 2 - neckW;
    const slopeDrop   = shoulderDropFromWidth(shoulderW);
    const shoulderPtX = neckW + shoulderW;
    const shoulderPtY = slopeDrop;
    const armholeY    = armholeDepthFromChest(m.chest, 'standard');
    const armholeDepth = armholeY - slopeDrop;
    const chestDepth  = panelW - shoulderPtX;
    const neckDepths  = NECK_DEPTHS[opts.neckline] ?? NECK_DEPTHS.scoop;

    const lengthMod = opts.length === 'mini' ? -6 : opts.length === 'midi' ? 6 : opts.length === 'maxi' ? 14 : 0;
    const totalLen  = m.torsoLength + m.skirtLength + lengthMod;
    const waistY    = m.torsoLength;
    const slvLen    = SLEEVE_LENGTHS[opts.sleeve] ?? 7;

    function sc(cp, steps = 12) { return sampleBezier(cp.p0, cp.p1, cp.p2, cp.p3, steps).map(p => ({ ...p, curve: true })); }
    function pp(poly) { let d = `M ${poly[0].x.toFixed(2)} ${poly[0].y.toFixed(2)}`; for (let i = 1; i < poly.length; i++) d += ` L ${poly[i].x.toFixed(2)} ${poly[i].y.toFixed(2)}`; return d + ' Z'; }
    function bb(poly) { const xs = poly.map(p => p.x), ys = poly.map(p => p.y); return { width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys) }; }

    const neckStyleKey = opts.neckline === 'vneck' ? 'v-neck' : opts.neckline === 'scoop' ? 'scoop' : 'crew';
    const frontNeckPts = sc(necklineCurve(neckW, neckDepths.front, neckStyleKey));
    const backNeckPts  = sc(necklineCurve(neckW, neckDepths.back, 'crew'));
    const shoulderPts  = sc(shoulderSlope(shoulderW, slopeDrop));
    const frontArmPts  = sc(armholeCurve(shoulderW, chestDepth, armholeDepth, false));
    const backArmPts   = sc(armholeCurve(shoulderW, chestDepth, armholeDepth, true));

    function buildBody(isBack, neckPts, armPts) {
      const neckDepth = isBack ? neckDepths.back : neckDepths.front;
      const sideX = shoulderPtX + chestDepth;
      const poly = [];

      [...neckPts].reverse().forEach(p => poly.push({ ...p, x: neckW - p.x }));
      delete poly[0].curve;
      delete poly[neckPts.length - 1].curve;

      for (let i = 1; i < shoulderPts.length; i++) poly.push({ ...shoulderPts[i], x: neckW + shoulderPts[i].x });
      for (let i = 1; i < armPts.length; i++) poly.push({ ...armPts[i], x: shoulderPtX + armPts[i].x, y: shoulderPtY + armPts[i].y });

      // Flare out from chest to hip width, then straight to hem
      if (hipPanelW > sideX) {
        poly.push({ x: sideX, y: armholeY + 2 }); // just below armhole
        poly.push({ x: hipPanelW, y: waistY + 7 }); // hip level
      } else {
        poly.push({ x: sideX, y: armholeY });
      }
      poly.push({ x: hipPanelW, y: totalLen });
      poly.push({ x: 0, y: totalLen });

      return poly;
    }

    const sideX = shoulderPtX + chestDepth;
    const frontPoly = buildBody(false, frontNeckPts, frontArmPts);
    const backPoly  = buildBody(true,  backNeckPts,  backArmPts);

    // Sleeve
    const sleeveEase = easeVal * 0.2;
    const slvWidth   = m.bicep / 2 + sleeveEase;
    const capHeight  = opts.sleeve === 'cap' ? 0 : armholeDepth * 0.60;
    let sleevePoly;
    if (opts.sleeve === 'cap') {
      sleevePoly = [{ x: 0, y: 0 }, { x: slvWidth * 2, y: 0 }, { x: slvWidth * 2, y: slvLen }, { x: 0, y: slvLen }];
    } else {
      const capCp  = sleeveCapCurve(m.bicep, capHeight, slvWidth * 2);
      const capPts = sampleBezier(capCp.p0, capCp.p1, capCp.p2, capCp.p3, 16).map(p => ({ ...p, curve: true }));
      sleevePoly = capPts.map(p => ({ ...p, y: p.y + capHeight }));
      delete sleevePoly[0].curve;
      delete sleevePoly[capPts.length - 1].curve;
      sleevePoly.push({ x: slvWidth * 2, y: capHeight + slvLen });
      sleevePoly.push({ x: 0, y: capHeight + slvLen });
    }

    // Notches
    const shoulderMidX = neckW + shoulderW / 2;
    const shoulderMidY = slopeDrop / 2;
    const frontArmPtsRev = [...frontArmPts].reverse();
    const backArmPtsRev  = [...backArmPts].reverse();
    const frontNotchPt = ptAtArcLen(frontArmPtsRev, 3.25);
    const backNotch1Pt = ptAtArcLen(backArmPtsRev, 3.25);
    const backNotch2Pt = ptAtArcLen(backArmPtsRev, 3.5);

    const frontNotches = [
      { x: shoulderMidX, y: shoulderMidY, angle: edgeAngle({ x: neckW, y: 0 }, { x: shoulderPtX, y: slopeDrop }) },
      { x: frontNotchPt.x + shoulderPtX, y: frontNotchPt.y + shoulderPtY, angle: 0 },
      { x: hipPanelW, y: waistY, angle: 0 }, // waistline notch
    ];
    const backNotches = [
      { x: shoulderMidX, y: shoulderMidY, angle: edgeAngle({ x: neckW, y: 0 }, { x: shoulderPtX, y: slopeDrop }) },
      { x: backNotch1Pt.x + shoulderPtX, y: backNotch1Pt.y + shoulderPtY, angle: 0 },
      { x: backNotch2Pt.x + shoulderPtX, y: backNotch2Pt.y + shoulderPtY, angle: 0 },
      { x: hipPanelW, y: waistY, angle: 0 },
    ];

    // Sleeve notches
    const capW = slvWidth * 2;
    let sleeveNotches;
    if (opts.sleeve === 'cap') {
      sleeveNotches = [{ x: capW / 2, y: 0, angle: -90 }];
    } else {
      sleeveNotches = [{ x: capW / 2, y: 0, angle: -90 }];
    }

    const nbLen = m.neck * 0.80;
    const frontBB = bb(frontPoly), backBB = bb(backPoly), slvBB = bb(sleevePoly);

    const pieces = [
      {
        id: 'bodice-front', name: 'Front Body',
        instruction: 'Cut 1 on fold (CF)',
        type: 'bodice', polygon: frontPoly, path: pp(frontPoly),
        width: frontBB.width, height: frontBB.height, isBack: false, sa, hem, notches: frontNotches,
        dims: [
          { label: fmtInches(hipPanelW) + ' half width at hip', x1: 0, y1: -0.5, x2: hipPanelW, y2: -0.5, type: 'h' },
          { label: fmtInches(totalLen) + ' total length', x: hipPanelW + 1, y1: 0, y2: totalLen, type: 'v' },
        ],
      },
      {
        id: 'bodice-back', name: 'Back Body',
        instruction: 'Cut 1 on fold (CB)',
        type: 'bodice', polygon: backPoly, path: pp(backPoly),
        width: backBB.width, height: backBB.height, isBack: true, sa, hem, notches: backNotches,
        dims: [
          { label: fmtInches(hipPanelW) + ' half width at hip', x1: 0, y1: -0.5, x2: hipPanelW, y2: -0.5, type: 'h' },
        ],
      },
      {
        id: 'sleeve', name: 'Sleeve',
        instruction: `Cut 2 (mirror L & R) · ${opts.sleeve} sleeve`,
        type: 'sleeve', polygon: sleevePoly, path: pp(sleevePoly),
        width: slvBB.width, height: slvBB.height, capHeight, sleeveLength: slvLen, sleeveWidth: slvWidth * 2, sa, hem, notches: sleeveNotches,
        dims: [{ label: fmtInches(slvWidth * 2) + ' underarm', x1: 0, y1: (opts.sleeve === 'cap' ? 0 : capHeight) + 0.4, x2: slvWidth * 2, y2: (opts.sleeve === 'cap' ? 0 : capHeight) + 0.4, type: 'h' }],
      },
      { id: 'neckband', name: 'Neckband (rib)', instruction: `Cut 1 from rib knit on fold · ${fmtInches(nbLen)} long × 2.5″ cut (1.25″ finished) · 80% of neck opening`, dimensions: { length: nbLen, width: 2.5 }, type: 'rectangle', sa },
    ];

    if (opts.hemStyle === 'banded') {
      const hemCirc = hipPanelW * 4;
      pieces.push({ id: 'hem-band', name: 'Hem Band (rib)', instruction: `Cut 1 from rib knit on fold · ${fmtInches(hemCirc * 0.9)} long × 3″ cut (1.5″ finished)`, dimensions: { length: hemCirc * 0.9, width: 3 }, type: 'rectangle', sa });
    }

    return pieces;
  },

  materials(m, opts) {
    return buildMaterialsSpec({
      fabrics: ['cotton-jersey', 'rayon-jersey', 'french-terry', 'ponte'],
      notions: [
        { name: 'Rib knit', quantity: opts.hemStyle === 'banded' ? '0.5 yard' : '0.25 yard', notes: 'For neckband (and hem band if applicable)' },
      ],
      thread: 'poly-all',
      needle: 'ballpoint-75',
      stitches: ['stretch', 'overlock', 'coverstitch', 'zigzag-med'],
      notes: [
        'Ballpoint 75/11 — prevents snags on jersey',
        'Stretch stitch or serger for all seams',
        'Pre-wash jersey: cotton knits shrink 3–5%',
        'No waist seam — single-piece bodice-to-hem construction for a relaxed drape',
        opts.fit === 'fitted' ? 'Fitted: use 4-way stretch fabric for ease of movement' : '',
      ].filter(Boolean),
    });
  },

  instructions(m, opts) {
    const steps = [];
    let n = 1;
    steps.push({ step: n++, title: 'Sew shoulder seams', detail: 'Join front to back at shoulders {RST}. Stretch stitch or {serge}. {press} toward back.' });
    steps.push({ step: n++, title: 'Attach neckband', detail: 'Fold neckband in half lengthwise {WST}. Quarter-pin to neckline. Stretch to match. {serge} or stretch stitch. {press} toward bodice.' });
    if (opts.sleeve !== 'cap') {
      steps.push({ step: n++, title: 'Set sleeves', detail: 'Pin sleeve cap center to shoulder seam. Ease cap to fit. Stretch stitch or {serge}. {press} toward sleeve.' });
    } else {
      steps.push({ step: n++, title: 'Attach cap sleeves', detail: 'Pin cap sleeve to armhole {RST}. Stretch stitch or {serge}. {press} toward sleeve.' });
    }
    steps.push({ step: n++, title: 'Sew side seams', detail: 'Sew front to back continuously from hem through underarm to sleeve hem. Stretch stitch or {serge}. {press} toward back.' });
    if (opts.hemStyle === 'banded') {
      steps.push({ step: n++, title: 'Attach hem band', detail: 'Fold hem band in half {WST}. Quarter-pin to body hem. Stretch to fit. {serge} or stretch stitch.' });
    } else {
      steps.push({ step: n++, title: 'Hem dress', detail: `Fold hem up ${fmtInches(parseFloat(opts.hem))}. Twin needle from RS or coverstitch.` });
    }
    steps.push({ step: n++, title: 'Hem sleeves', detail: `Fold sleeve hem up ${fmtInches(parseFloat(opts.hem))}. Twin needle from RS.` });
    steps.push({ step: n++, title: 'Finish', detail: '{press} lightly. No waist seam means this dress hangs from the shoulders — adjust length as needed before hemming.' });
    return steps;
  },
};
