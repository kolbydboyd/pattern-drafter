// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Wrap Dress (Womenswear) — overlapping front panels with self-fabric ties.
 * V-neckline angled from shoulder. Left and right fronts each extend 4–5″ past CF.
 * Hood facing along V-neckline edge. Knit or woven fabric option.
 */

import {
  shoulderSlope, necklineCurve, armholeCurve, shoulderDropFromWidth,
  armholeDepthFromChest, chestEaseDistribution, neckWidthFromCircumference,
  sleeveCapCurve,
} from '../engine/upper-body.js';
import { sampleBezier, fmtInches, edgeAngle, ptAtArcLen, dist } from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

export default {
  id: 'wrap-dress-w',
  name: 'Wrap Dress (W)',
  category: 'upper',
  difficulty: 'advanced',
  priceTier: 'tailored',
  measurements: ['chest', 'shoulder', 'neck', 'bicep', 'waist', 'hip', 'torsoLength', 'skirtLength'],
  measurementDefaults: { torsoLength: 16, skirtLength: 28 },

  options: {
    fabric: {
      type: 'select', label: 'Fabric type',
      values: [
        { value: 'woven', label: 'Woven (structured drape)', reference: 'challis, crepe'  },
        { value: 'knit',  label: 'Knit / jersey (stretchy)', reference: 'jersey, stretch' },
      ],
      default: 'woven',
    },
    skirtShape: {
      type: 'select', label: 'Skirt shape',
      values: [
        { value: 'aline',    label: 'A-line (classic wrap)',            reference: 'versatile, classic' },
        { value: 'flowy',    label: 'Flowy / semi-circle (lots of drape)', reference: 'goddess, drape'     },
        { value: 'straight', label: 'Straight (minimal flare)',         reference: 'pencil, fitted'     },
      ],
      default: 'aline',
    },
    sleeve: {
      type: 'select', label: 'Sleeve',
      values: [
        { value: 'short',      label: 'Short (9″)'   },
        { value: 'three_qtr',  label: '¾ length (17″)' },
        { value: 'long',       label: 'Long (25″)'   },
        { value: 'sleeveless', label: 'Sleeveless'   },
      ],
      default: 'short',
    },
    fit: {
      type: 'select', label: 'Fit',
      values: [
        { value: 'standard', label: 'Standard (+3″ ease)', reference: 'classic, off-the-rack' },
        { value: 'relaxed',  label: 'Relaxed (+5″ ease)',  reference: 'skater, workwear'      },
      ],
      default: 'standard',
    },
    wrapDepth: {
      type: 'select', label: 'Wrap overlap',
      values: [
        { value: '4', label: 'Moderate (4″ overlap)' },
        { value: '5', label: 'Deep (5″ overlap)'     },
      ],
      default: '4',
    },
    length: {
      type: 'select', label: 'Skirt length',
      values: [
        { value: 'midi',  label: 'Midi'  },
        { value: 'knee',  label: 'Knee'  },
        { value: 'maxi',  label: 'Maxi'  },
        { value: 'mini',  label: 'Mini'  },
      ],
      default: 'midi',
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
    const sa      = parseFloat(opts.sa);
    const hem     = opts.fabric === 'knit' ? 0.5 : 0.75;
    const easeVal = opts.fit === 'relaxed' ? 5 : 3;
    const wrapExt = parseFloat(opts.wrapDepth) || 4;

    const { front: frontEase, back: backEase } = chestEaseDistribution(easeVal);
    // Both front and back half-panels are equal so side seams align when sewn
    const panelW = (m.chest + easeVal) / 4;
    const frontW = panelW;
    const backW  = panelW;

    const neckW        = neckWidthFromCircumference(m.neck);
    const shoulderW    = m.shoulder / 2 - neckW;
    const slopeDrop    = shoulderDropFromWidth(shoulderW);
    const shoulderPtX  = neckW + shoulderW;
    const armholeY     = armholeDepthFromChest(m.chest, 'standard');
    const armholeDepth = armholeY - slopeDrop;
    const chestDepth   = panelW - shoulderPtX;
    const backChestDepth = chestDepth;
    const shoulderPtY  = slopeDrop;
    const torsoLen     = m.torsoLength || 16;

    // ── CURVE TAGGING — VERIFIED WORKING, DO NOT CHANGE UNLESS NECESSARY ──
    function sc(cp, steps = 12) { return sampleBezier(cp.p0, cp.p1, cp.p2, cp.p3, steps).map(p => ({ ...p, curve: true })); }
    function pp(poly) {
      let d = `M ${poly[0].x.toFixed(2)} ${poly[0].y.toFixed(2)}`;
      for (let i = 1; i < poly.length; i++) d += ` L ${poly[i].x.toFixed(2)} ${poly[i].y.toFixed(2)}`;
      return d + ' Z';
    }
    function bb(poly) {
      const xs = poly.map(p => p.x), ys = poly.map(p => p.y);
      return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys),
               width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys) };
    }

    // V-neck depth for wrap — deep but capped so it doesn't reach the navel
    const vNeckDepth = Math.min(torsoLen * 0.45, 9);

    const frontNeckPts = sc(necklineCurve(neckW, vNeckDepth, 'v-neck'));
    const backNeckPts  = sc(necklineCurve(neckW, 0.75, 'crew'));
    const shoulderPts  = sc(shoulderSlope(shoulderW, slopeDrop));
    const frontArmPts  = sc(armholeCurve(shoulderW, chestDepth, armholeDepth, false));
    const backArmPts   = sc(armholeCurve(shoulderW, backChestDepth, armholeDepth, true));

    // Front panel — shoulder/armhole at standard panelW; wrap extension on inner edge only
    function buildFrontBodice() {
      const poly = [];
      // Neckline: CF V-point → shoulder-neck junction (y: p.y — NOT vNeckDepth - p.y)
      [...frontNeckPts].reverse().forEach(p => poly.push({ ...p, x: neckW - p.x }));
      // ── JUNCTION UNTAGGING — VERIFIED WORKING, DO NOT CHANGE UNLESS NECESSARY ──
      delete poly[0].curve;
      delete poly[frontNeckPts.length - 1].curve;
      // Shoulder slope (shoulder stays at normal width, not shifted by wrapExt)
      for (let i = 1; i < shoulderPts.length; i++) poly.push({ ...shoulderPts[i], x: neckW + shoulderPts[i].x });
      // Armhole
      for (let i = 1; i < frontArmPts.length; i++) poly.push({ ...frontArmPts[i], x: shoulderPtX + frontArmPts[i].x, y: shoulderPtY + frontArmPts[i].y });
      // Side seam to hem at standard panel width
      poly.push({ x: frontW, y: torsoLen });
      // Hem extends wrapExt past CF — this is the overlap extension
      poly.push({ x: -wrapExt, y: torsoLen });
      // Inner edge up to V-neck apex at CF
      poly.push({ x: -wrapExt, y: vNeckDepth });
      // Close: line from (-wrapExt, vNeckDepth) back to start (0, vNeckDepth) = CF V point
      return poly;
    }

    function buildBackBodice() {
      const poly = [];
      [...backNeckPts].reverse().forEach(p => poly.push({ ...p, x: neckW - p.x }));
      // ── JUNCTION UNTAGGING — VERIFIED WORKING, DO NOT CHANGE UNLESS NECESSARY ──
      delete poly[0].curve;
      delete poly[backNeckPts.length - 1].curve;
      for (let i = 1; i < shoulderPts.length; i++) poly.push({ ...shoulderPts[i], x: neckW + shoulderPts[i].x });
      for (let i = 1; i < backArmPts.length; i++) poly.push({ ...backArmPts[i], x: shoulderPtX + backArmPts[i].x, y: shoulderPtY + backArmPts[i].y });
      poly.push({ x: backW, y: torsoLen });
      poly.push({ x: 0, y: torsoLen });
      poly.push({ x: 0, y: 0.75 });
      return poly;
    }

    const frontBodicePoly = buildFrontBodice();
    const backBodicePoly  = buildBackBodice();
    const frontBB = bb(frontBodicePoly), backBB = bb(backBodicePoly);

    // Notch marks — front bodice
    const frontShoulderMidX = neckW + shoulderW / 2;
    const frontShoulderMidY = slopeDrop / 2;
    // Arc-length armhole notches: single = front, double = back
    const FRONT_NOTCH_ARC = 3.25;
    const BACK_NOTCH_ARC  = 3.25;
    const frontArmPtsRev = [...frontArmPts].reverse();
    const backArmPtsRev  = [...backArmPts].reverse();
    const frontNotchPt    = ptAtArcLen(frontArmPtsRev, FRONT_NOTCH_ARC);
    const backNotch1Pt    = ptAtArcLen(backArmPtsRev, BACK_NOTCH_ARC);
    const backNotch2Pt    = ptAtArcLen(backArmPtsRev, BACK_NOTCH_ARC + 0.25);
    const frontNotchBodice = { x: frontNotchPt.x + shoulderPtX, y: frontNotchPt.y + shoulderPtY };
    const backNotch1Bodice = { x: backNotch1Pt.x + shoulderPtX, y: backNotch1Pt.y + shoulderPtY };
    const backNotch2Bodice = { x: backNotch2Pt.x + shoulderPtX, y: backNotch2Pt.y + shoulderPtY };

    const frontNotches = [
      { x: frontShoulderMidX, y: frontShoulderMidY, angle: edgeAngle({ x: neckW, y: 0 }, { x: shoulderPtX, y: slopeDrop }) },
      { x: frontW, y: armholeY, angle: 0 },
      { x: frontNotchBodice.x, y: frontNotchBodice.y, angle: 0 },
    ];
    // Notch marks — back bodice
    const backNotches = [
      { x: frontShoulderMidX, y: frontShoulderMidY, angle: edgeAngle({ x: neckW, y: 0 }, { x: shoulderPtX, y: slopeDrop }) },
      { x: backW, y: armholeY, angle: 0 },
      { x: backNotch1Bodice.x, y: backNotch1Bodice.y, angle: 0 },
      { x: backNotch2Bodice.x, y: backNotch2Bodice.y, angle: 0 },
    ];

    // Skirt
    const skirtL     = m.skirtLength || 28;
    const lengthMod  = opts.length === 'mini' ? -10 : opts.length === 'knee' ? -5 : opts.length === 'maxi' ? 8 : 0;
    const adjSkirtL  = skirtL + lengthMod;
    const hipHalf    = m.hip / 2 + easeVal * 0.5;

    function buildSkirtPanel(id, name, isBack) {
      const panelW = hipHalf / 2 + (isBack ? 0 : wrapExt);
      const waistDip = 0.375; // ⅜″ concave curve at CB for body shaping
      let poly;

      // Back panel: curved waistline (horizontal tangent at fold so no kink when unfolded)
      let waistPts;
      if (isBack) {
        const waistCp = {
          p0: { x: 0,            y: waistDip },
          p1: { x: panelW * 0.4, y: waistDip },
          p2: { x: panelW * 0.8, y: 0 },
          p3: { x: panelW,       y: 0 },
        };
        waistPts = sc(waistCp, 12);
        // ── JUNCTION UNTAGGING — VERIFIED WORKING, DO NOT CHANGE UNLESS NECESSARY ──
        delete waistPts[0].curve;
        delete waistPts[waistPts.length - 1].curve;
      }

      if (opts.skirtShape === 'aline') {
        const flare = 5.0;
        if (isBack) {
          // Fold at CB (left edge) must be vertical — all flare to side seam
          poly = [...waistPts,
            { x: panelW + flare, y: adjSkirtL  },
            { x: 0,              y: adjSkirtL  },
          ];
        } else {
          const fh = flare / 2;
          poly = [
            { x: fh,              y: 0          },
            { x: fh + panelW,     y: 0          },
            { x: panelW + flare,  y: adjSkirtL  },
            { x: 0,               y: adjSkirtL  },
          ];
        }
      } else if (opts.skirtShape === 'flowy') {
        const flowW = panelW * 2.2;
        if (isBack) {
          // Fold at CB (left edge) must be vertical — all flare to side seam
          poly = [...waistPts,
            { x: flowW,  y: adjSkirtL  },
            { x: 0,      y: adjSkirtL  },
          ];
        } else {
          poly = [
            { x: (flowW - panelW) / 2,          y: 0          },
            { x: (flowW - panelW) / 2 + panelW, y: 0          },
            { x: flowW,                          y: adjSkirtL  },
            { x: 0,                              y: adjSkirtL  },
          ];
        }
      } else {
        if (isBack) {
          poly = [...waistPts,
            { x: panelW, y: adjSkirtL  },
            { x: 0,      y: adjSkirtL  },
          ];
        } else {
          poly = [
            { x: 0,       y: 0          },
            { x: panelW,  y: 0          },
            { x: panelW,  y: adjSkirtL  },
            { x: 0,       y: adjSkirtL  },
          ];
        }
      }
      const gatherNote = opts.skirtShape === 'flowy' ? ' · Gather waist to match bodice waist width' : '';
      const hipLevel = Math.min(8, adjSkirtL * 0.3);
      const skirtNotches = [
        { x: panelW / 2, y: 0, angle: -90 },
        { x: panelW, y: hipLevel, angle: 0 },
      ];
      // Per-edge SA: waist → side seam → hem → fold/side
      const skirtEA = poly.map((_, i) => {
        if (i === poly.length - 1) return { sa: isBack ? 0 : sa, label: isBack ? 'Fold' : 'Side seam' };
        if (i === 0) return { sa, label: 'Waist' };
        if (i === 1) return { sa, label: 'Side seam' };
        if (i === 2) return { sa: hem, label: 'Hem' };
        return { sa, label: 'Seam' };
      });
      return {
        id, name,
        instruction: `Cut 1${isBack ? ' on fold (CB)' : '. Left and right fronts are mirror images'}${gatherNote}`,
        type: 'bodice', polygon: poly, path: pp(poly),
        width: bb(poly).width, height: adjSkirtL, isBack, sa, hem,
        dims: [{ label: fmtInches(panelW) + ' panel width', x1: 0, y1: -0.5, x2: panelW, y2: -0.5, type: 'h' }],
        notches: skirtNotches,
        edgeAllowances: skirtEA,
        isCutOnFold: isBack,
      };
    }

    const pieces = [
      {
        id: 'bodice-front', name: 'Front Bodice (cut 2, mirror)',
        instruction: `Cut 2 (mirror L & R) · ${fmtInches(wrapExt)} wrap extension past CF · V-neck descends to bust level · Facing sewn along V-neckline edge`,
        type: 'bodice', polygon: frontBodicePoly, path: pp(frontBodicePoly),
        isCutOnFold: false,
        width: frontBB.width, height: frontBB.height, isBack: false, sa, hem,
        dims: [{ label: fmtInches(frontW + wrapExt) + ' width + wrap', x1: -wrapExt, y1: -0.5, x2: frontW, y2: -0.5, type: 'h' }],
        notches: frontNotches,
      },
      {
        id: 'bodice-back', name: 'Back Bodice',
        instruction: 'Cut 1 on fold (CB)',
        type: 'bodice', polygon: backBodicePoly, path: pp(backBodicePoly),
        width: backBB.width, height: backBB.height, isBack: true, sa, hem,
        dims: [{ label: fmtInches(backW) + ' half width', x1: 0, y1: -0.5, x2: backW, y2: -0.5, type: 'h' }],
        notches: backNotches,
      },
      buildSkirtPanel('skirt-front', 'Skirt Front Panel (cut 2, mirror)', false),
      buildSkirtPanel('skirt-back',  'Skirt Back Panel', true),
    ];

    // V-neckline facing
    const vFacingLen = Math.sqrt(vNeckDepth ** 2 + neckW ** 2) + m.neck / 2;
    pieces.push({
      id: 'v-neck-facing', name: 'V-Neckline Facing',
      instruction: `Cut 4 (2 per side, self + interfacing) · 2.5″ wide · Follows V from shoulder to apex · {understitch} and {press} to WS · Tack at shoulder seam`,
      dimensions: { length: vFacingLen, width: 2.5 }, type: 'pocket', sa,
    });

    // Self-fabric ties
    const tieLen = 30;
    pieces.push({
      id: 'tie', name: 'Self-Fabric Tie',
      instruction: `Cut 4 (2 per side) · Each ${fmtInches(tieLen)} long × 2.5″ cut (1.25″ finished) · Fold in half lengthwise, sew, turn, {press} · Attach 2 at inner side seam (hidden tie) and 2 at outer side seam (visible bow)`,
      dimensions: { length: tieLen, width: 2.5 }, type: 'pocket', sa,
    });

    // Sleeve
    if (opts.sleeve !== 'sleeveless') {
      const SLEEVE_LENGTHS = { short: 9, three_qtr: 17, long: 25 };
      const slvLen    = SLEEVE_LENGTHS[opts.sleeve] || 9;
      const effArmToElbow = m.armToElbow || (slvLen * 0.45);
      const slvFullWidth = (m.bicep || 13) + 2;
      const capH = armholeDepth * (opts.fit === 'relaxed' ? 0.55 : 0.60);
      const capCp = sleeveCapCurve(m.bicep || 13, capH, slvFullWidth);
      const capPts = sc(capCp, 32);

      const slvPoly = [];
      for (const p of capPts) {
        slvPoly.push({ ...p, y: p.y + capH });
      }
      // ── JUNCTION UNTAGGING — VERIFIED WORKING, DO NOT CHANGE UNLESS NECESSARY ──
      delete slvPoly[0].curve;
      delete slvPoly[capPts.length - 1].curve;
      slvPoly.push({ x: slvFullWidth, y: capH + slvLen });
      slvPoly.push({ x: 0, y: capH + slvLen });

      const slvBB = bb(slvPoly);
      const sleeveNotches = [
        { x: slvFullWidth / 2, y: 0, angle: -90 },
        { x: slvFullWidth * 0.25, y: capH * 0.5, angle: edgeAngle({ x: 0, y: capH }, { x: slvFullWidth / 2, y: 0 }) },
        { x: slvFullWidth * 0.75, y: capH * 0.5, angle: edgeAngle({ x: slvFullWidth / 2, y: 0 }, { x: slvFullWidth, y: capH }) },
      ];
      pieces.push({
        id: 'sleeve', name: 'Sleeve',
        instruction: 'Cut 2 (mirror L & R)',
        type: 'sleeve', polygon: slvPoly, path: pp(slvPoly),
        width: slvBB.width, height: slvBB.height, capHeight: capH, sleeveLength: slvLen, sleeveWidth: slvFullWidth, sa, hem,
        dims: [{ label: fmtInches(slvFullWidth) + ' width', x1: 0, y1: -0.4, x2: slvFullWidth, y2: -0.4, type: 'h' }, { label: fmtInches(effArmToElbow) + ' to elbow', x: -1.5, y1: 0, y2: effArmToElbow, type: 'v', color: '#b8963e' }],
        notches: sleeveNotches,
      });
    } else {
      pieces.push({ id: 'armhole-facing', name: 'Armhole Facing', instruction: 'Cut 4 (2 front + 2 back) · Interface · 2″ wide', dimensions: { width: armholeDepth + 1, height: 2 }, type: 'pocket', sa });
    }

    return pieces;
  },

  materials(m, opts) {
    const isKnit = opts.fabric === 'knit';
    const notions = [
      { ref: 'interfacing-light', quantity: '0.5 yard (neckline facings)' },
    ];

    return buildMaterialsSpec({
      fabrics: isKnit
        ? ['cotton-jersey', 'cotton-modal', 'bamboo-jersey', 'ponte']
        : ['rayon-challis', 'crepe', 'viscose', 'cotton-lawn', 'silk-charmeuse'],
      notions,
      thread: 'poly-all',
      needle: isKnit ? 'ballpoint-75' : 'universal-75',
      stitches: isKnit
        ? ['stretch', 'overlock', 'zigzag-med']
        : ['straight-2.5', 'zigzag-small'],
      notes: [
        'Cut front panels as mirror images. Lay fabric doubled for one cut',
        'Stay-stitch V-neckline curves and waist seam immediately after cutting to prevent bias stretch',
        opts.skirtShape === 'flowy' ? 'Gather skirt waist: two rows of basting at ⅜″ and ¼″, draw up to match bodice width, distribute fullness evenly' : 'A-line skirt: {press} side seams open for a clean silhouette',
        'Ties: attach inner tie to bodice facing, outer tie to side seam. The inner tie passes through a small opening at the side seam to tie at the back',
        isKnit ? 'Use a stretch stitch or serger for all seams; straight stitch will pop when fabric stretches' : 'French seams at side seams are worth the effort on fine drapey fabrics',
        'Hang dress 24 hours before hemming. Drapey wovens and bias cuts will drop',
      ].filter(Boolean),
    });
  },

  instructions(m, opts) {
    const steps = [];
    let n = 1;

    steps.push({ step: n++, title: 'Stay-stitch and prepare', detail: 'Stay-stitch V-neckline at ½″ on both front panels. Stay-stitch waist edges. For wovens: {press}-mark CF fold line on front panels.' });
    steps.push({ step: n++, title: 'Sew bodice shoulder seams', detail: 'Join front to back at shoulders {RST}. {press} toward back.' });
    steps.push({ step: n++, title: 'Attach V-neckline facing', detail: 'Interface facing pieces. Sew facing to neckline V {RST}, matching shoulder seams. {clip} at V point, nearly to stitching. {understitch}. {press} facing to WS. Tack at shoulder seams.' });

    if (opts.sleeve !== 'sleeveless') {
      steps.push({ step: n++, title: 'Set sleeves', detail: 'Pin sleeve cap to armhole center at shoulder seam. Sew {RST}. {press} SA toward sleeve. {serge} or {zigzag}.' });
      steps.push({ step: n++, title: 'Sew side and sleeve seams', detail: 'Sew front to back continuously from bodice hem through underarm to sleeve hem. Leave a small opening at inner side seam for hidden tie to pass through. {press} open.' });
    } else {
      steps.push({ step: n++, title: 'Attach armhole facings', detail: 'Join facing pieces, interface. Sew to armhole {RST}. {clip}, {understitch}, {press} to WS.' });
      steps.push({ step: n++, title: 'Sew bodice side seams', detail: 'Sew front to back at both side seams. Leave opening at inner side for hidden tie.' });
    }

    steps.push({ step: n++, title: 'Attach skirt to bodice', detail: `Join skirt panels at side seams. ${opts.skirtShape === 'flowy' ? 'Gather skirt waist to match bodice width. ' : ''}Sew skirt to bodice at waist {RST}. {press} SA upward.` });
    steps.push({ step: n++, title: 'Make and attach ties', detail: 'Fold tie strips in half lengthwise {RST}, sew long edge and one short end. Trim corners, turn with a tube turner, {press}. Attach inner ties at inner side seam (pass through opening to tie at back) and outer ties at outer side seam (tie at front or back).' });
    steps.push({ step: n++, title: 'Hang and hem', detail: 'Hang dress 24 hours. Mark hem level from floor. Fold up twice, {press}, {topstitch} or {slipstitch}. For drapey fabrics: hand hem with {slipstitch}.' });
    steps.push({ step: n++, title: 'Finish', detail: '{press} entire dress with a pressing cloth. Check neckline facing lies flat. Try on and adjust tie length if needed.' });

    return steps;
  },

  variants: [
    { id: 'maxi-wrap-dress-w', name: 'Maxi Wrap Dress', defaults: { length: 'maxi', sleeve: 'long' } },
  ],
};
