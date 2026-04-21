// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * A-Line Dress (Womenswear) — fitted bodice with flared A-line skirt.
 * Waist seam separates shaped bodice from flared skirt.
 * Options: sleeveless or sleeved, back zip, optional pockets.
 * Pieces: front bodice, back bodice, front skirt, back skirt, sleeve (opt), facing/neckband.
 */

import {
  armholeCurve, shoulderSlope, necklineCurve, sleeveCapCurve, shoulderDropFromWidth,
  armholeDepthFromChest, chestEaseDistribution, neckWidthFromCircumference,
  validateSleeveSeams, bustDartIntake,
} from '../engine/upper-body.js';
import { sampleBezier, fmtInches, edgeAngle, ptAtArcLen, buildSideSeamPocketBag, tummyAdjustment } from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

export default {
  id: 'a-line-dress-w',
  name: 'A-Line Dress (W)',
  category: 'upper',
  difficulty: 'intermediate',
  priceTier: 'tailored',
  measurements: ['chest', 'shoulder', 'neck', 'bicep', 'waist', 'hip', 'torsoLength', 'skirtLength'],
  measurementDefaults: { torsoLength: 16, skirtLength: 24 },

  options: {
    neckline: {
      type: 'select', label: 'Neckline',
      values: [
        { value: 'scoop', label: 'Scoop (default)' },
        { value: 'crew',  label: 'Crew / jewel'    },
        { value: 'vneck', label: 'V-neck'           },
      ],
      default: 'scoop',
    },
    sleeve: {
      type: 'select', label: 'Sleeve',
      values: [
        { value: 'sleeveless', label: 'Sleeveless (default)' },
        { value: 'short',      label: 'Short (7″)'           },
        { value: 'three_qtr',  label: '¾ length (17″)'       },
      ],
      default: 'sleeveless',
    },
    fit: {
      type: 'select', label: 'Bodice fit',
      values: [
        { value: 'fitted',  label: 'Fitted (+2″)',  reference: 'classic, feminine' },
        { value: 'relaxed', label: 'Relaxed (+3″)',  reference: 'easy, comfortable' },
      ],
      default: 'fitted',
    },
    flare: {
      type: 'select', label: 'Skirt flare',
      values: [
        { value: '4', label: 'Classic A-line (+4″)' },
        { value: '6', label: 'Full A-line (+6″)'    },
        { value: '2', label: 'Subtle (+2″)'         },
      ],
      default: '4',
    },
    bustDart: {
      type: 'select', label: 'Bust dart',
      values: [
        { value: 'yes', label: 'Yes (side seam, recommended)' },
        { value: 'no',  label: 'No' },
      ],
      default: 'yes',
    },
    length: {
      type: 'select', label: 'Length',
      values: [
        { value: 'knee', label: 'Knee (default)'  },
        { value: 'midi', label: 'Midi (+6″)'      },
        { value: 'maxi', label: 'Maxi (+14″)'     },
        { value: 'mini', label: 'Mini (−6″)'      },
      ],
      default: 'knee',
    },
    pockets: {
      type: 'select', label: 'Pockets',
      values: [
        { value: 'yes', label: 'Side seam pockets' },
        { value: 'no',  label: 'No pockets'        },
      ],
      default: 'yes',
    },
    sa: {
      type: 'select', label: 'Seam allowance',
      values: [
        { value: 0.5,   label: '½″' },
        { value: 0.625, label: '⅝″' },
      ],
      default: 0.625,
    },
  },

  pieces(m, opts) {
    const sa   = parseFloat(opts.sa);
    const hem  = 0.75;
    const easeVal = opts.fit === 'relaxed' ? 3 : 2;
    const flareAmt = parseFloat(opts.flare);

    const panelW      = (m.chest + easeVal) / 4;
    const neckW       = neckWidthFromCircumference(m.neck);
    const shoulderW   = m.shoulder / 2 - neckW;
    const slopeDrop   = shoulderDropFromWidth(shoulderW);
    const shoulderPtX = neckW + shoulderW;
    const shoulderPtY = slopeDrop;
    const armholeY    = armholeDepthFromChest(m.chest, 'standard');
    const armholeDepth = armholeY - slopeDrop;
    const chestDepth  = panelW - shoulderPtX;
    const torsoLen    = m.torsoLength;

    const neckDepthFront = opts.neckline === 'vneck' ? 7 : opts.neckline === 'scoop' ? 5 : 2;
    const neckDepthBack  = 0.75;

    const lengthMod = opts.length === 'mini' ? -6 : opts.length === 'midi' ? 6 : opts.length === 'maxi' ? 14 : 0;
    const skirtL = m.skirtLength + lengthMod;

    function sc(cp, steps = 12) { return sampleBezier(cp.p0, cp.p1, cp.p2, cp.p3, steps).map(p => ({ ...p, curve: true })); }
    function pp(poly) { let d = `M ${poly[0].x.toFixed(2)} ${poly[0].y.toFixed(2)}`; for (let i = 1; i < poly.length; i++) d += ` L ${poly[i].x.toFixed(2)} ${poly[i].y.toFixed(2)}`; return d + ' Z'; }
    function bb(poly) { const xs = poly.map(p => p.x), ys = poly.map(p => p.y); return { width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys) }; }

    const neckStyleKey = opts.neckline === 'vneck' ? 'v-neck' : opts.neckline === 'scoop' ? 'scoop' : 'crew';
    const frontNeckPts = sc(necklineCurve(neckW, neckDepthFront, neckStyleKey));
    const backNeckPts  = sc(necklineCurve(neckW, neckDepthBack, 'crew'));
    const shoulderPts  = sc(shoulderSlope(shoulderW, slopeDrop));
    const frontArmPts  = sc(armholeCurve(shoulderW, chestDepth, armholeDepth, false));
    const backArmPts   = sc(armholeCurve(shoulderW, chestDepth, armholeDepth, true));

    function buildBodice(isBack, neckPts, armPts) {
      const sideX = shoulderPtX + chestDepth;
      const poly = [];

      [...neckPts].reverse().forEach(p => poly.push({ ...p, x: neckW - p.x }));
      delete poly[0].curve;
      delete poly[neckPts.length - 1].curve;

      for (let i = 1; i < shoulderPts.length; i++) poly.push({ ...shoulderPts[i], x: neckW + shoulderPts[i].x });
      for (let i = 1; i < armPts.length; i++) poly.push({ ...armPts[i], x: shoulderPtX + armPts[i].x, y: shoulderPtY + armPts[i].y });

      poly.push({ x: sideX, y: torsoLen }); // waistline at side
      poly.push({ x: 0, y: torsoLen }); // waistline at fold

      return poly;
    }

    const sideX = shoulderPtX + chestDepth;
    const frontBodice = buildBodice(false, frontNeckPts, frontArmPts);
    const backBodice  = buildBodice(true,  backNeckPts,  backArmPts);
    const frontBodBB = bb(frontBodice), backBodBB = bb(backBodice);

    // Bust dart
    const bustDarts = [];
    if (opts.bustDart === 'yes') {
      const bustLevel  = (slopeDrop + armholeY) / 2;
      const dartIntake = bustDartIntake(m);
      const dartLength = Math.max(3, Math.min(sideX - panelW / 2 - 1.0, 4.0));
      const dartApexX  = sideX - dartLength;
      bustDarts.push({
        apexX: dartApexX, apexY: bustLevel,
        sideX, upperY: bustLevel - dartIntake / 2, lowerY: bustLevel + dartIntake / 2,
        intake: dartIntake, length: dartLength,
      });
    }

    // Skirt panels (trapezoid)
    const hipHalf = m.hip / 2 + 1;
    const waistHalf = m.waist / 2;
    const skirtPanelW = hipHalf / 2;
    // Fold at CF/CB (left edge) must be vertical — all flare to side seam
    const skirtHemW = skirtPanelW + flareAmt / 2;
    const waistDip = 0.375;
    const tummyAdj = tummyAdjustment(m);

    function buildSkirt(isBack) {
      if (isBack) {
        // Curved waist at CB (horizontal tangent at fold for smooth unfold)
        const waistPts = sampleBezier(
          { x: 0, y: waistDip }, { x: skirtPanelW * 0.4, y: waistDip },
          { x: skirtPanelW * 0.8, y: 0 }, { x: skirtPanelW, y: 0 }, 12
        ).map(p => ({ ...p, curve: true }));
        delete waistPts[0].curve;
        delete waistPts[waistPts.length - 1].curve;
        return [...waistPts,
          { x: skirtHemW, y: skirtL },
          { x: 0,         y: skirtL },
        ];
      }
      // Front: raise CF waist by tummyAdj so fabric travels over the belly
      return [
        { x: 0,           y: -tummyAdj },
        { x: skirtPanelW, y: 0 },
        { x: skirtHemW,   y: skirtL },
        { x: 0,           y: skirtL },
      ];
    }

    const skirtFrontPoly = buildSkirt(false);
    const skirtBackPoly  = buildSkirt(true);
    const skirtFrontBB = bb(skirtFrontPoly);
    const skirtBackBB  = bb(skirtBackPoly);

    // Waist darts on skirt
    const skirtDartIntake = (skirtPanelW - waistHalf / 2);
    const skirtDarts = [];
    if (skirtDartIntake > 0.5) {
      const dartW = Math.min(skirtDartIntake / 2, 0.75);
      skirtDarts.push({
        apexX: skirtPanelW * 0.4, apexY: 0,
        sideX: skirtPanelW * 0.4, upperY: 0, lowerY: 3.5,
        intake: dartW, length: 3.5,
      });
    }

    // Bodice notches
    const shoulderMidX = neckW + shoulderW / 2;
    const shoulderMidY = slopeDrop / 2;
    const frontArmPtsRev = [...frontArmPts].reverse();
    const backArmPtsRev = [...backArmPts].reverse();
    const frontNotchPt = ptAtArcLen(frontArmPtsRev, 3.25);
    const backNotch1Pt = ptAtArcLen(backArmPtsRev, 3.25);
    const backNotch2Pt = ptAtArcLen(backArmPtsRev, 3.5);

    const frontBodNotches = [
      { x: shoulderMidX, y: shoulderMidY, angle: edgeAngle({ x: neckW, y: 0 }, { x: shoulderPtX, y: slopeDrop }) },
      { x: frontNotchPt.x + shoulderPtX, y: frontNotchPt.y + shoulderPtY, angle: 0 },
    ];
    if (bustDarts.length) {
      const bd = bustDarts[0];
      frontBodNotches.push({ x: bd.sideX, y: bd.upperY, angle: 0 });
      frontBodNotches.push({ x: bd.sideX, y: bd.lowerY, angle: 0 });
    }

    const backBodNotches = [
      { x: shoulderMidX, y: shoulderMidY, angle: edgeAngle({ x: neckW, y: 0 }, { x: shoulderPtX, y: slopeDrop }) },
      { x: backNotch1Pt.x + shoulderPtX, y: backNotch1Pt.y + shoulderPtY, angle: 0 },
      { x: backNotch2Pt.x + shoulderPtX, y: backNotch2Pt.y + shoulderPtY, angle: 0 },
    ];

    const skirtNotches = [
      { x: skirtPanelW / 2, y: 0, angle: -90 }, // center waist
      { x: skirtHemW * 0.5, y: 7, angle: 0 }, // hip level
    ];

    const pieces = [
      {
        id: 'bodice-front', name: 'Front Bodice',
        instruction: `Cut 1 on fold (CF)${bustDarts.length ? ` · Bust dart: ${fmtInches(bustDarts[0].intake)} intake` : ''}`,
        type: 'bodice', polygon: frontBodice, path: pp(frontBodice),
        width: frontBodBB.width, height: frontBodBB.height, isBack: false, sa, hem: 0, notches: frontBodNotches, bustDarts,
        dims: [{ label: fmtInches(panelW) + ' half width', x1: 0, y1: -0.5, x2: panelW, y2: -0.5, type: 'h' }],
      },
      {
        id: 'bodice-back', name: 'Back Bodice',
        instruction: 'Cut 2 (mirror L & R — CB seam for zip)',
        type: 'bodice', polygon: backBodice, path: pp(backBodice),
        width: backBodBB.width, height: backBodBB.height, isBack: true, sa, hem: 0, notches: backBodNotches,
        dims: [{ label: fmtInches(panelW) + ' half width', x1: 0, y1: -0.5, x2: panelW, y2: -0.5, type: 'h' }],
      },
      {
        id: 'skirt-front', name: 'Front Skirt',
        instruction: `Cut 1 on fold (CF) · ${fmtInches(flareAmt)} total A-line flare${skirtDarts.length ? ` · ${skirtDarts.length} waist dart(s)` : ''}`,
        type: 'bodice', polygon: skirtFrontPoly, path: pp(skirtFrontPoly),
        width: skirtFrontBB.width, height: skirtFrontBB.height, isBack: false, sa, hem, notches: skirtNotches, bustDarts: skirtDarts,
        dims: [
          { label: fmtInches(skirtHemW) + ' half width at hem', x1: 0, y1: skirtL + 0.4, x2: skirtHemW, y2: skirtL + 0.4, type: 'h' },
          { label: fmtInches(skirtL) + ' length', x: skirtHemW + 1, y1: 0, y2: skirtL, type: 'v' },
        ],
      },
      {
        id: 'skirt-back', name: 'Back Skirt',
        instruction: `Cut 1 on fold (CB)${skirtDarts.length ? ` · ${skirtDarts.length} waist dart(s)` : ''}`,
        type: 'bodice', polygon: skirtBackPoly, path: pp(skirtBackPoly),
        width: skirtBackBB.width, height: skirtBackBB.height, isBack: true, sa, hem, notches: skirtNotches, bustDarts: skirtDarts,
      },
    ];

    // Sleeve (optional)
    if (opts.sleeve !== 'sleeveless') {
      const slvLen = opts.sleeve === 'short' ? 7 : 17;
      const sleeveEase = easeVal * 0.2;
      const slvWidth = m.bicep / 2 + sleeveEase;
      const capHeight = armholeDepth * 0.60;
      const capCp = sleeveCapCurve(m.bicep, capHeight, slvWidth * 2);
      const capPts = sampleBezier(capCp.p0, capCp.p1, capCp.p2, capCp.p3, 16).map(p => ({ ...p, curve: true }));
      validateSleeveSeams('a-line-dress-w', capPts, frontArmPts, backArmPts);
      const sleevePoly = capPts.map(p => ({ ...p, y: p.y + capHeight }));
      delete sleevePoly[0].curve;
      delete sleevePoly[capPts.length - 1].curve;
      sleevePoly.push({ x: slvWidth * 2, y: capHeight + slvLen });
      sleevePoly.push({ x: 0, y: capHeight + slvLen });
      const slvBB = bb(sleevePoly);

      pieces.push({
        id: 'sleeve', name: 'Sleeve',
        instruction: `Cut 2 (mirror L & R) · ${opts.sleeve} sleeve`,
        type: 'sleeve', polygon: sleevePoly, path: pp(sleevePoly),
        width: slvBB.width, height: slvBB.height, capHeight, sleeveLength: slvLen, sleeveWidth: slvWidth * 2, sa, hem,
        notches: [{ x: slvWidth, y: 0, angle: -90 }],
      });
    } else {
      // Armhole facing for sleeveless
      const armholeCirc = (armholeDepth + chestDepth + shoulderW) * 1.2;
      pieces.push({
        id: 'armhole-facing', name: 'Armhole Facing',
        instruction: `Cut 4 (2 self + 2 interfacing) · ${fmtInches(armholeCirc)} long × 2.5″ wide`,
        type: 'rectangle', dimensions: { length: armholeCirc, width: 2.5 }, sa,
      });
    }

    // Neckline facing
    const neckCirc = m.neck * 0.9;
    pieces.push({
      id: 'neck-facing', name: 'Neckline Facing',
      instruction: `Cut 2 (self + interfacing) · ${fmtInches(neckCirc)} long × 2.5″ wide · Follows neckline shape`,
      type: 'rectangle', dimensions: { length: neckCirc, width: 2.5 }, sa,
    });

    // Back zip
    const zipLen = Math.round(torsoLen + 4);
    pieces.push({
      id: 'zip', name: 'Back Zip',
      instruction: `${zipLen}″ invisible zipper · Center back, from neckline through bodice into skirt`,
      type: 'notion', dimensions: { length: zipLen },
    });

    // Pockets
    if (opts.pockets === 'yes') {
      pieces.push(buildSideSeamPocketBag({
        bagWidth: 7, bagHeight: 9, sa,
        instruction: `Cut 4 (2 per side) · ${fmtInches(7)} wide × ${fmtInches(9)} deep · D-shaped · Set into side seam · Serge all edges before assembly`,
      }));
    }

    return pieces;
  },

  materials(m, opts) {
    const notions = [
      { name: 'Invisible zipper', quantity: '1', notes: 'Center back' },
      { name: 'Lightweight interfacing', quantity: '0.5 yard', notes: 'Neckline and armhole facings' },
    ];
    if (opts.sleeve === 'sleeveless') {
      notions.push({ name: 'Interfacing for armholes', quantity: 'Included above', notes: '' });
    }

    return buildMaterialsSpec({
      fabrics: ['cotton-poplin', 'cotton-sateen', 'linen', 'crepe', 'ponte'],
      notions,
      thread: 'poly-all',
      needle: 'universal-80',
      stitches: ['straight', 'overlock', 'edgestitch'],
      notes: [
        'Medium-weight woven with slight body — holds the A-line shape',
        'Interface neckline and armhole facings with lightweight fusible',
        'Waist seam: press toward bodice, {understitch} to prevent rolling',
        opts.bustDart === 'yes' ? 'Bust darts: sew from side seam to apex, tapering to nothing. {press} downward.' : '',
        opts.pockets === 'yes' ? 'Side seam pockets: attach pocket bag to front and back before sewing side seams' : '',
      ].filter(Boolean),
    });
  },

  instructions(m, opts) {
    const steps = [];
    let n = 1;

    if (opts.bustDart === 'yes') {
      steps.push({ step: n++, title: 'Sew bust darts', detail: 'Fold front bodice {RST} along dart. Sew from side seam toward apex. {press} downward.' });
    }
    steps.push({ step: n++, title: 'Sew shoulder seams', detail: 'Join front bodice to back bodice at shoulders {RST}. {press} toward back.' });
    steps.push({ step: n++, title: 'Attach neckline facing', detail: 'Interface facing. Sew facing to neckline {RST}. {clip} curves, turn, {press}. {understitch} facing.' });

    if (opts.sleeve !== 'sleeveless') {
      steps.push({ step: n++, title: 'Set sleeves', detail: 'Pin sleeve cap center to shoulder seam. Ease to fit. Sew {RST}. {press} toward sleeve.' });
    } else {
      steps.push({ step: n++, title: 'Attach armhole facings', detail: 'Interface facings. Sew to armholes {RST}. {clip} curves, turn, {press}. {understitch}.' });
    }

    steps.push({ step: n++, title: 'Sew waist darts on skirt', detail: '{press} front and back skirt darts toward center.' });
    steps.push({ step: n++, title: 'Join bodice to skirt', detail: 'Pin bodice to skirt at waist {RST}, matching CF, CB, and side seams. Sew waist seam. {press} toward bodice.' });
    steps.push({ step: n++, title: 'Install back zip', detail: 'Install invisible zipper from neckline through waist into skirt back. {press}.' });

    if (opts.pockets === 'yes') {
      steps.push({ step: n++, title: 'Attach pockets', detail: 'Sew pocket bags to front and back at side seam opening (between waist and hip). {press} toward front.' });
    }

    steps.push({ step: n++, title: 'Sew side seams', detail: `Join front to back at side seams {RST}${opts.pockets === 'yes' ? ', leaving pocket openings' : ''}. {press} toward back.` });
    steps.push({ step: n++, title: 'Hem dress', detail: 'Fold hem up ¾″. {press} and {topstitch} or blind hem.' });
    steps.push({ step: n++, title: 'Finish', detail: '{press} all seams and facings. The A-line skirt should swing freely from the waist.' });

    return steps;
  },

  variants: [
    { id: 'midi-aline-dress-w', name: 'Midi A-Line Dress', defaults: { length: 'midi', sleeve: 'short' } },
  ],
};
