// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Tank Top / A-Shirt — sleeveless upper body knit.
 * Forked from tee.js: same bodice block with sleeve removed and armhole widened.
 * Pieces: front bodice, back bodice, neckband rib strip, optional armhole binding.
 */

import {
  armholeCurve, shoulderSlope, necklineCurve,
  shoulderDropFromWidth, armholeDepthFromChest,
  neckWidthFromCircumference, UPPER_EASE,
} from '../engine/upper-body.js';
import { sampleBezier, fmtInches, edgeAngle } from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

export default {
  id: 'tank-top',
  name: 'Tank Top',
  category: 'upper',
  difficulty: 'beginner',
  priceTier: 'simple',
  measurements: ['chest', 'shoulder', 'neck', 'torsoLength'],
  measurementDefaults: {},

  options: {
    neckline: {
      type: 'select', label: 'Neckline',
      values: [
        { value: 'crew',  label: 'Crew neck'  },
        { value: 'scoop', label: 'Scoop neck'  },
        { value: 'vneck', label: 'V-neck'      },
      ],
      default: 'scoop',
    },
    strap: {
      type: 'select', label: 'Strap style',
      values: [
        { value: 'wide',      label: 'Wide strap (~2.5″)',  reference: 'classic tank, muscle tee' },
        { value: 'racerback', label: 'Racerback',           reference: 'athletic, yoga'           },
      ],
      default: 'wide',
    },
    fit: {
      type: 'select', label: 'Fit',
      values: [
        { value: 'fitted',    label: 'Slim / fitted (+2″)',  reference: 'fitted, tailored'     },
        { value: 'standard',  label: 'Regular (+4″)',        reference: 'classic, off-the-rack' },
        { value: 'relaxed',   label: 'Relaxed (+6″)',        reference: 'breezy, oversized'     },
      ],
      default: 'standard',
    },
    armholeFinish: {
      type: 'select', label: 'Armhole finish',
      values: [
        { value: 'binding', label: 'Bias binding',         reference: 'clean, athletic'          },
        { value: 'fold',    label: 'Fold under & topstitch', reference: 'casual, quick'           },
      ],
      default: 'binding',
    },
    hemStyle: {
      type: 'select', label: 'Hem style',
      values: [
        { value: 'straight',  label: 'Straight'       },
        { value: 'shirttail', label: 'Shirttail curve' },
      ],
      default: 'straight',
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
    const panelW    = (m.chest + totalEase) / 4;

    const halfShoulder = m.shoulder / 2;
    const neckW        = neckWidthFromCircumference(m.neck);
    const shoulderW    = halfShoulder - neckW;
    const slopeDrop    = shoulderDropFromWidth(shoulderW);
    const shoulderPtX  = halfShoulder;

    const armholeY    = armholeDepthFromChest(m.chest, 'standard');
    const armholeDepth = armholeY - slopeDrop;
    const chestDepth  = panelW - shoulderPtX;

    const neckKey       = opts.neckline;
    const neckDepthBack = neckW / 3;
    const NECK_DEPTH_FRONT = { vneck: 9.0, scoop: 6.5 };
    const neckDepthFront = neckKey === 'crew'
      ? neckW + 0.5
      : (NECK_DEPTH_FRONT[neckKey] ?? neckW + 0.5);
    const neckStyleFront = neckKey === 'vneck' ? 'v-neck' : neckKey === 'scoop' ? 'scoop' : 'crew';

    const torsoLen = m.torsoLength;

    // Racerback: bring shoulder in significantly (narrower strap)
    const strapReduction = opts.strap === 'racerback' ? shoulderW * 0.55 : 0;
    const effectiveShoulderW = shoulderW - strapReduction;
    const effectiveSlopeDrop = shoulderDropFromWidth(effectiveShoulderW);
    const effectiveShoulderPtX = neckW + effectiveShoulderW;
    const effectiveChestDepth = panelW - effectiveShoulderPtX;

    function curveToPoints(cp, steps = 12) {
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

    function dedupPoly(poly) {
      const result = [poly[0]];
      for (let i = 1; i < poly.length; i++) {
        const prev = result[result.length - 1];
        const dx = poly[i].x - prev.x, dy = poly[i].y - prev.y;
        if (Math.sqrt(dx * dx + dy * dy) >= 0.05) result.push(poly[i]);
      }
      return result;
    }

    function buildBodice(isBack) {
      const neckStyle = isBack ? 'crew' : neckStyleFront;
      const neckDepth = isBack ? neckDepthBack : neckDepthFront;
      const effShoulderW = effectiveShoulderW;
      const effSlopeDrop = effectiveSlopeDrop;
      const effShoulderPtX = effectiveShoulderPtX;
      const effChestDepth = effectiveChestDepth;

      const neckPts     = curveToPoints(necklineCurve(neckW, neckDepth, neckStyle));
      const shoulderPts = curveToPoints(shoulderSlope(effShoulderW, effSlopeDrop));
      const armholePts  = curveToPoints(armholeCurve(effShoulderW, effChestDepth, armholeDepth + (slopeDrop - effSlopeDrop), isBack));

      const poly = [];

      for (const p of [...neckPts].reverse()) {
        poly.push({ ...p, x: neckW - p.x });
      }
      delete poly[0].curve;
      delete poly[neckPts.length - 1].curve;

      for (let i = 1; i < shoulderPts.length; i++) {
        poly.push({ ...shoulderPts[i], x: neckW + shoulderPts[i].x });
      }

      for (let i = 1; i < armholePts.length; i++) {
        poly.push({ ...armholePts[i], x: effShoulderPtX + armholePts[i].x, y: effSlopeDrop + armholePts[i].y });
      }

      poly.push({ x: panelW, y: torsoLen });

      if (opts.hemStyle === 'shirttail') {
        poly.push({ x: neckW * 0.5, y: torsoLen + (isBack ? 1 : 0.5) });
      }

      poly.push({ x: 0, y: torsoLen });
      poly.push({ x: 0, y: neckDepth });

      return { poly: dedupPoly(poly), neckPts, shoulderPts, armholePts, neckDepth, effShoulderPtX };
    }

    const front = buildBodice(false);
    const back  = buildBodice(true);

    const frontBB = bbox(front.poly);
    const backBB  = bbox(back.poly);

    // Per-edge seam allowances
    function buildBodyEA(neckPts, shoulderPts, armholePts, hasShirttail) {
      const ea = [];
      for (let i = 0; i < neckPts.length - 1; i++) ea.push({ sa: sa, label: 'Neckline' });
      for (let i = 0; i < shoulderPts.length - 1; i++) ea.push({ sa: 0.625, label: 'Shoulder' });
      for (let i = 0; i < armholePts.length - 1; i++) ea.push({ sa: sa, label: 'Armhole' });
      ea.push({ sa: 0.625, label: 'Side seam' });
      if (hasShirttail) ea.push({ sa: hem, label: 'Hem' });
      ea.push({ sa: hem, label: 'Hem' });
      ea.push({ sa: 0, label: 'Fold' });
      return ea;
    }

    const hasShirttail = opts.hemStyle === 'shirttail';
    const frontEA = buildBodyEA(front.neckPts, front.shoulderPts, front.armholePts, hasShirttail);
    const backEA  = buildBodyEA(back.neckPts,  back.shoulderPts,  back.armholePts,  hasShirttail);

    // Notches: shoulder midpoint, chest on side seam
    const shoulderMidX = (neckW + effectiveShoulderPtX) / 2;
    const shoulderMidY = effectiveSlopeDrop / 2;
    const frontNotches = [
      { x: shoulderMidX, y: shoulderMidY, angle: edgeAngle({ x: neckW, y: 0 }, { x: effectiveShoulderPtX, y: effectiveSlopeDrop }) },
      { x: panelW, y: armholeY, angle: 0 },
    ];
    const backNotches = [
      { x: shoulderMidX, y: shoulderMidY, angle: edgeAngle({ x: neckW, y: 0 }, { x: effectiveShoulderPtX, y: effectiveSlopeDrop }) },
      { x: panelW, y: armholeY, angle: 0 },
      { x: panelW, y: armholeY + 0.25, angle: 0 },  // double = back convention
    ];

    // Neckband
    const nbLength = m.neck * 0.85;
    const nbWidth  = 3;

    const pieces = [
      {
        id: 'bodice-front', name: 'Front Bodice',
        instruction: 'Cut 1 on fold (CF)',
        type: 'bodice', polygon: front.poly, path: polyToPathStr(front.poly),
        width: frontBB.maxX - frontBB.minX, height: frontBB.maxY - frontBB.minY,
        neckDepth: front.neckDepth, armholeDepth, isBack: false, sa, hem,
        notches: frontNotches, edgeAllowances: frontEA,
        dims: [
          { label: fmtInches(panelW) + ' half width', x1: 0, y1: -0.5, x2: panelW, y2: -0.5, type: 'h' },
          { label: fmtInches(torsoLen) + ' length', x: frontBB.maxX + 1, y1: 0, y2: torsoLen, type: 'v' },
        ],
      },
      {
        id: 'bodice-back', name: 'Back Bodice',
        instruction: 'Cut 1 on fold (CB)',
        type: 'bodice', polygon: back.poly, path: polyToPathStr(back.poly),
        width: backBB.maxX - backBB.minX, height: backBB.maxY - backBB.minY,
        neckDepth: back.neckDepth, armholeDepth, isBack: true, sa, hem,
        notches: backNotches, edgeAllowances: backEA,
        dims: [
          { label: fmtInches(panelW) + ' half width', x1: 0, y1: -0.5, x2: panelW, y2: -0.5, type: 'h' },
          { label: fmtInches(torsoLen) + ' length', x: backBB.maxX + 1, y1: 0, y2: torsoLen, type: 'v' },
        ],
      },
      {
        id: 'neckband', name: 'Neckband',
        instruction: `Cut 1 from rib knit on fold · ${fmtInches(nbLength)} long × ${fmtInches(nbWidth)} cut (${fmtInches(nbWidth / 2)} finished) · 85% of neck opening`,
        type: 'rectangle', dimensions: { length: nbLength, width: nbWidth }, sa,
      },
    ];

    if (opts.armholeFinish === 'binding') {
      // Armhole circumference estimate: armholeDepth * 2 + shoulder width + chest depth (rough)
      const armholeCirc = (armholeDepth + chestDepth + effectiveShoulderW) * 1.2;
      pieces.push({
        id: 'armhole-binding', name: 'Armhole Binding',
        instruction: `Cut 2 from rib knit or bias strip · ${fmtInches(armholeCirc * 0.85)} long × 1.5″ wide · One per armhole · 85% of armhole opening`,
        type: 'rectangle', dimensions: { length: armholeCirc * 0.85, width: 1.5 }, sa,
      });
    }

    return pieces;
  },

  materials(m, opts) {
    const notions = [
      { name: 'Rib knit', quantity: '0.25 yard', notes: 'For neckband' },
    ];
    if (opts.armholeFinish === 'binding') {
      notions.push({ name: 'Rib knit or bias tape', quantity: '0.25 yard extra', notes: 'Armhole binding' });
    }

    return buildMaterialsSpec({
      fabrics: ['cotton-jersey', 'rayon-jersey', 'poly-jersey', 'bamboo-jersey'],
      notions,
      thread: 'poly-all',
      needle: 'ballpoint-80',
      stitches: ['stretch', 'overlock', 'coverstitch', 'zigzag-med'],
      notes: [
        'Use a ballpoint (jersey) needle 80/12 — prevents skipped stitches on knit fabric',
        'Use a stretch stitch or serger for ALL seams — a straight stitch will pop when stretched',
        'Pre-wash jersey before cutting — cotton knits shrink 3–5% in first wash',
        'Neckband and armhole binding cut at 85% of opening so they lie flat without gaping',
        opts.strap === 'racerback' ? 'Racerback strap: sew shoulder seams, then sew armhole binding to shape before side seams' : '',
        opts.fit === 'fitted' ? 'Slim fit: use 4-way stretch fabric only — 2-way stretch will restrict movement' : '',
      ].filter(Boolean),
    });
  },

  instructions(m, opts) {
    const steps = [];
    let n = 1;

    steps.push({ step: n++, title: 'Sew shoulder seams', detail: 'Join front to back at both shoulder seams {RST}. Stretch stitch or {serge}. {press} toward back.' });

    steps.push({ step: n++, title: 'Attach neckband', detail: 'Fold neckband in half lengthwise {WST}, {press}. Divide neckband and neck opening into quarters, pin. Stretch neckband to fit opening, sew {RST}. {serge} or stretch stitch. {press} SA toward bodice.' });

    if (opts.armholeFinish === 'binding') {
      steps.push({ step: n++, title: 'Bind armholes', detail: 'Before sewing side seams, bind each armhole opening. Fold binding in half lengthwise {WST}. Stretch binding to fit armhole, sew {RST}. {press} SA toward bodice. {topstitch} from RS if desired.' });
    }

    steps.push({ step: n++, title: 'Sew side seams', detail: 'Join front to back at side seams {RST}. Stretch stitch or {serge} from hem to armhole. {press} toward back.' });

    if (opts.armholeFinish === 'fold') {
      steps.push({ step: n++, title: 'Finish armholes', detail: 'Fold armhole edge under ⅜″, {press}. {topstitch} close to fold with stretch stitch.' });
    }

    steps.push({ step: n++, title: 'Hem body', detail: `Fold hem up ${fmtInches(parseFloat(opts.hem))}, {press}. Twin needle from RS or {zigzag} stitch.` });

    steps.push({ step: n++, title: 'Finish', detail: '{press} with damp cloth. Try on — neckband and armhole binding should lie flat.' });

    return steps;
  },
};
