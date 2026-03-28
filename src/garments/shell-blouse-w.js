// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Shell Blouse (Womenswear) — sleeveless or short-sleeved top, no placket.
 * Finished with shaped neckline facing and armhole facings (sleeveless).
 * Optional invisible zip at center back for pullover clearance.
 */

import {
  shoulderSlope, necklineCurve, armholeCurve, shoulderDropFromWidth,
  armholeDepthFromChest, chestEaseDistribution, neckWidthFromCircumference,
} from '../engine/upper-body.js';
import { sampleBezier, fmtInches, edgeAngle } from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

const NECK_STYLES = {
  boat:  { front: 1.0,  back: 0.75, key: 'boat'  },
  round: { front: 2.5,  back: 0.75, key: 'crew'  },
  vneck: { front: 7.0,  back: 0.75, key: 'v-neck' },
  square:{ front: 2.0,  back: 0.75, key: 'crew'  },
};

export default {
  id: 'shell-blouse-w',
  name: 'Shell Blouse (W)',
  category: 'upper',
  difficulty: 'intermediate',
  priceTier: 'core',
  measurements: ['chest', 'shoulder', 'neck', 'bicep', 'torsoLength'],
  measurementDefaults: {},

  options: {
    neckline: {
      type: 'select', label: 'Neckline',
      values: [
        { value: 'boat',   label: 'Boat / bateau' },
        { value: 'round',  label: 'Round / crew'  },
        { value: 'vneck',  label: 'V-neck'        },
        { value: 'square', label: 'Square neck'   },
      ],
      default: 'boat',
    },
    closure: {
      type: 'select', label: 'Back closure',
      values: [
        { value: 'pullover', label: 'Pullover - no zip'             },
        { value: 'zip',      label: 'Invisible zip at center back' },
      ],
      default: 'pullover',
    },
    sleeves: {
      type: 'select', label: 'Sleeves',
      values: [
        { value: 'sleeveless', label: 'Sleeveless'                  },
        { value: 'cap',        label: 'Cap sleeve (3–4″)'           },
        { value: 'flutter',    label: 'Flutter sleeve (curved drape)'},
        { value: 'short',      label: 'Short sleeve (9″)'           },
      ],
      default: 'sleeveless',
    },
    fit: {
      type: 'select', label: 'Fit',
      values: [
        { value: 'fitted',     label: 'Fitted (+2″ with darts)', reference: 'fitted, tailored'    },
        { value: 'semifitted', label: 'Semi-fitted (+3″)',       reference: 'classic, off-the-rack' },
        { value: 'relaxed',    label: 'Relaxed (+5″)',           reference: 'skater, workwear'      },
      ],
      default: 'semifitted',
    },
    bustDart: {
      type: 'select', label: 'Bust dart',
      values: [
        { value: 'yes', label: 'Yes (side seam dart)' },
        { value: 'no',  label: 'No'                   },
      ],
      default: 'no',
    },
    length: {
      type: 'select', label: 'Length',
      values: [
        { value: 'hip',     label: 'Hip (+4″)'          },
        { value: 'cropped', label: 'Cropped (at torso)'  },
        { value: 'tunic',   label: 'Tunic (+8″)'        },
      ],
      default: 'hip',
    },
    hemStyle: {
      type: 'select', label: 'Hem',
      values: [
        { value: 'straight',   label: 'Straight'          },
        { value: 'shirttail',  label: 'Shirttail curve'   },
      ],
      default: 'straight',
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
    const sa  = parseFloat(opts.sa);
    const hem = 0.5;

    const easeVal  = opts.fit === 'fitted' ? 2 : opts.fit === 'relaxed' ? 5 : 3;
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
    // Back armhole must also end at panelW for vertical side seam.
    const backChestDepth = chestDepth;
    const lengthExtra  = opts.length === 'tunic' ? 8 : opts.length === 'cropped' ? 0 : 4;
    const torsoLen     = m.torsoLength + lengthExtra;
    const neckStyle    = NECK_STYLES[opts.neckline] ?? NECK_STYLES.boat;
    const shoulderPtY  = slopeDrop;

    // ── CURVE TAGGING — VERIFIED WORKING, DO NOT CHANGE UNLESS NECESSARY ──
    function sc(cp, steps = 12) { return sampleBezier(cp.p0, cp.p1, cp.p2, cp.p3, steps).map(p => ({ ...p, curve: true })); }
    function pp(poly) { let d = `M ${poly[0].x.toFixed(2)} ${poly[0].y.toFixed(2)}`; for (let i=1;i<poly.length;i++) d+=` L ${poly[i].x.toFixed(2)} ${poly[i].y.toFixed(2)}`; return d+' Z'; }
    function bb(poly) { const xs=poly.map(p=>p.x),ys=poly.map(p=>p.y); return { width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys) }; }

    const frontNeckPts = sc(necklineCurve(neckW, neckStyle.front, neckStyle.key));
    const backNeckPts  = sc(necklineCurve(neckW, neckStyle.back, 'crew'));
    const shoulderPts  = sc(shoulderSlope(shoulderW, slopeDrop));
    const frontArmPts  = sc(armholeCurve(shoulderW, chestDepth, armholeDepth, false));
    const backArmPts   = sc(armholeCurve(shoulderW, backChestDepth, armholeDepth, true));

    function buildBody(isBack, neckPts, armPts, neckDepth, W, sideX) {
      const poly = [];
      [...neckPts].reverse().forEach(p => poly.push({ ...p, x: neckW - p.x }));
      // ── JUNCTION UNTAGGING — VERIFIED WORKING, DO NOT CHANGE UNLESS NECESSARY ──
      delete poly[0].curve;  // fold-neckline junction
      delete poly[neckPts.length - 1].curve;  // shoulder-neck junction
      for (let i=1;i<shoulderPts.length;i++) poly.push({ ...shoulderPts[i], x: neckW + shoulderPts[i].x });
      for (let i=1;i<armPts.length;i++) poly.push({ ...armPts[i], x: shoulderPtX + armPts[i].x, y: shoulderPtY + armPts[i].y });
      if (opts.hemStyle === 'shirttail' && !isBack) {
        poly.push({ x: sideX, y: torsoLen });
        poly.push({ x: neckW * 0.5, y: torsoLen + 1.5 });
      } else {
        poly.push({ x: sideX, y: torsoLen });
      }
      poly.push({ x: 0, y: torsoLen });
      // (0, neckDepth) is already the first polygon point from the reversed neck curve — don't push duplicate
      return poly;
    }

    const sideX = shoulderPtX + chestDepth;
    const frontPoly = buildBody(false, frontNeckPts, frontArmPts, neckStyle.front, frontW, sideX);
    const backPoly  = buildBody(true,  backNeckPts,  backArmPts,  neckStyle.back,  backW,  sideX);

    // Bust dart geometry (horizontal side-seam dart)
    const bustDarts = [];
    if (opts.bustDart === 'yes') {
      const bustLevel = (slopeDrop + armholeY) / 2;
      const bustPointX = panelW / 2;
      const dartIntake = Math.max(0.75, Math.min(3.0, (m.chest - 30) * 0.11 + 0.75));
      const dartLength = Math.max(3, Math.min(sideX - bustPointX - 1.0, 4.0));
      const dartApexX  = sideX - dartLength;
      bustDarts.push({
        apexX: dartApexX, apexY: bustLevel,
        sideX, upperY: bustLevel - dartIntake / 2, lowerY: bustLevel + dartIntake / 2,
        intake: dartIntake, length: dartLength,
      });
    }

    // ── NOTCH MARKS ─────────────────────────────────────────────────────────
    const shoulderMidX = neckW + shoulderW / 2;
    const shoulderMidY = slopeDrop / 2;
    const backSideX = shoulderPtX + backChestDepth;

    const frontNotches = [
      { x: shoulderMidX, y: shoulderMidY, angle: edgeAngle({ x: neckW, y: 0 }, { x: shoulderPtX, y: slopeDrop }) },
      { x: sideX, y: armholeY, angle: 0 },
      { x: shoulderPtX, y: slopeDrop + armholeDepth * 0.25, angle: edgeAngle({ x: shoulderPtX, y: slopeDrop }, { x: sideX, y: armholeY }) },
      { x: sideX, y: slopeDrop + armholeDepth * 0.75, angle: edgeAngle({ x: shoulderPtX, y: slopeDrop }, { x: sideX, y: armholeY }) },
    ];
    // Bust dart matchpoint notches at side seam
    if (bustDarts.length > 0) {
      const bd = bustDarts[0];
      frontNotches.push({ x: bd.sideX, y: bd.upperY, angle: 0 });
      frontNotches.push({ x: bd.sideX, y: bd.lowerY, angle: 0 });
    }

    const backNotches = [
      { x: shoulderMidX, y: shoulderMidY, angle: edgeAngle({ x: neckW, y: 0 }, { x: shoulderPtX, y: slopeDrop }) },
      { x: backSideX, y: armholeY, angle: 0 },
      { x: shoulderPtX, y: slopeDrop + armholeDepth * 0.25, angle: edgeAngle({ x: shoulderPtX, y: slopeDrop }, { x: backSideX, y: armholeY }) },
      { x: backSideX, y: slopeDrop + armholeDepth * 0.75, angle: edgeAngle({ x: shoulderPtX, y: slopeDrop }, { x: backSideX, y: armholeY }) },
    ];

    const frontBB = bb(frontPoly), backBB = bb(backPoly);

    const pieces = [
      {
        id: 'bodice-front', name: 'Front Body',
        instruction: `Cut 1 on fold (CF)${bustDarts.length ? ` · Bust dart: ${fmtInches(bustDarts[0].intake)} intake × ${fmtInches(bustDarts[0].length)} long from side seam` : ''}`,
        type: 'bodice', polygon: frontPoly, path: pp(frontPoly),
        width: frontBB.width, height: frontBB.height, isBack: false, sa, hem, notches: frontNotches, bustDarts,
        dims: [{ label: fmtInches(frontW) + ' half width', x1: 0, y1: -0.5, x2: frontW, y2: -0.5, type: 'h' }],
      },
      {
        id: 'bodice-back', name: 'Back Body',
        instruction: `Cut 1 on fold (CB)${opts.closure === 'zip' ? ' · Split at CB for invisible zip - add ⅝″ SA at CB' : ''}`,
        type: 'bodice', polygon: backPoly, path: pp(backPoly),
        width: backBB.width, height: backBB.height, isBack: true, sa, hem, notches: backNotches,
        dims: [{ label: fmtInches(backW) + ' half width', x1: 0, y1: -0.5, x2: backW, y2: -0.5, type: 'h' }],
      },
      { id: 'neck-facing', name: 'Neckline Facing', instruction: 'Cut 2 (front + back) · Interface · Follows neckline curve, 2.5″ wide · Join at shoulder seams', dimensions: { length: m.neck + 1, width: 2.5 }, type: 'pocket' },
    ];

    if (opts.sleeves === 'sleeveless') {
      pieces.push({ id: 'armhole-facing', name: 'Armhole Facing', instruction: 'Cut 4 (2 front + 2 back) · Interface · Follows armhole curve, 2″ wide', dimensions: { width: armholeDepth + 1, height: 2 }, type: 'pocket' });
    } else if (opts.sleeves === 'cap' || opts.sleeves === 'short') {
      const slvLen = opts.sleeves === 'cap' ? 3.5 : 9;
      const slvW   = (m.bicep || 13) / 2 + easeVal * 0.15;
      const slvPoly = [
        { x: 0,           y: 0      },
        { x: slvW * 2,    y: 0      },
        { x: slvW * 2,    y: slvLen },
        { x: 0,           y: slvLen },
      ];
      const slvBB = bb(slvPoly);
      const sleeveNotches = [
        { x: slvW, y: 0, angle: -90 },
        { x: slvW * 0.5, y: 0, angle: -90 },
        { x: slvW * 1.5, y: 0, angle: -90 },
      ];
      pieces.push({
        id: 'sleeve', name: `${opts.sleeves === 'cap' ? 'Cap' : 'Short'} Sleeve`,
        instruction: 'Cut 2 (mirror L & R)',
        type: 'sleeve', polygon: slvPoly, path: pp(slvPoly),
        width: slvBB.width, height: slvBB.height, capHeight: 0, sleeveLength: slvLen, sleeveWidth: slvW * 2, sa, hem, notches: sleeveNotches,
        dims: [{ label: fmtInches(slvW * 2) + ' width', x1: 0, y1: -0.4, x2: slvW * 2, y2: -0.4, type: 'h' }],
      });
    } else if (opts.sleeves === 'flutter') {
      // Flutter: curved rectangle that drapes — wider at hem than at armhole
      const flutterW = armholeDepth * 1.5;
      pieces.push({ id: 'flutter-sleeve', name: 'Flutter Sleeve', instruction: 'Cut 2 (mirror L & R) · Bias grain for drape · Curved outer edge gathers slightly at attachment', dimensions: { width: flutterW, height: 8 }, type: 'pocket' });
    }

    if (opts.closure === 'zip') {
      pieces.push({ id: 'cb-zip', name: 'Center Back Zipper', instruction: `Invisible zip · ${Math.ceil(torsoLen * 0.6)}″ - install before sewing CB seam`, dimensions: { width: 1, height: Math.ceil(torsoLen * 0.6) }, type: 'pocket' });
    }

    return pieces;
  },

  materials(m, opts) {
    const notions = [
      { ref: 'interfacing-light', quantity: '0.5 yard (neckline + armhole facings)' },
    ];
    if (opts.closure === 'zip') {
      notions.push({ name: 'Invisible zipper', quantity: `${Math.ceil(m.torsoLength * 0.6)}″`, notes: 'Center back' });
    }
    return buildMaterialsSpec({
      fabrics: ['crepe', 'cotton-lawn', 'cotton-voile', 'linen-light'],
      notions,
      thread: 'poly-all',
      needle: 'universal-75',
      stitches: ['straight-2.5', 'straight-2', 'zigzag-small'],
      notes: [
        'Use universal 75/11 or 80/12 needle for lightweight wovens',
        'Lining suggestion: cut front body from cotton batiste or silk habotai for opacity with lightweight fabrics',
        '{understitch} all facings to the SA before pressing to the inside - prevents facing from rolling to the RS',
        opts.bustDart === 'yes' ? 'Bust dart: fold RS together, sew from side seam to apex tapering to nothing, {press} down' : '',
        'French seams work well for the side seams on lightweight fabrics',
      ].filter(Boolean),
    });
  },

  instructions(m, opts) {
    const steps = [];
    let n = 1;
    if (opts.bustDart === 'yes') {
      steps.push({ step: n++, title: 'Sew bust darts', detail: 'Fold front RS together along dart legs. Sew from side to apex tapering to nothing. {press} downward.' });
    }
    steps.push({ step: n++, title: 'Sew shoulder seams', detail: 'Join front to back at shoulders {RST}. {serge} or {zigzag}. {press} toward back.' });
    if (opts.closure === 'zip') {
      steps.push({ step: n++, title: 'Install center back zipper', detail: 'Sew CB seam below zipper stop only. Install invisible zipper from neckline down. Close remaining seam. {press}.' });
    }
    steps.push({ step: n++, title: 'Attach neckline facing', detail: 'Sew front and back neckline facing pieces at shoulders. Interface. Sew facing to neckline {RST}. {clip} curve every ½″. {understitch}. {press} to inside. {slipstitch} to shoulder seams.' });
    if (opts.sleeves === 'sleeveless') {
      steps.push({ step: n++, title: 'Attach armhole facings', detail: 'Join front and back armhole facing pieces at shoulder and underarm. Sew to armhole {RST}. {clip} curves. {understitch}. {press} to inside.' });
    } else if (opts.sleeves !== 'flutter') {
      steps.push({ step: n++, title: 'Set sleeves', detail: 'Pin sleeve cap to armhole center at shoulder seam. Sew {RST}. {serge} SA together. {press} toward sleeve.' });
    } else {
      steps.push({ step: n++, title: 'Attach flutter sleeves', detail: 'Match bias flutter sleeve to armhole, RST. Ease or gather slightly to fit. Sew. {press} SA toward bodice.' });
    }
    steps.push({ step: n++, title: 'Sew side seams', detail: 'Sew front to back at side seams {RST}. {serge} or French seam. {press} toward back.' });
    steps.push({ step: n++, title: 'Hem', detail: `Fold up ½″ twice, {press}. {topstitch} close to fold. For curved hem: {clip} SA first.` });
    steps.push({ step: n++, title: 'Finish', detail: '{press} entire blouse. Check facings are fully turned to the inside.' });

    return steps;
  },
};
