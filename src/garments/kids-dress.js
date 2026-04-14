// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Kids A-Line Dress — children's fitted bodice + flared A-line skirt (sizes 2T–14).
 * No bust dart (children's flat chest). Elastic back neck for easy dressing.
 * Bodice uses upper-body engine (same geometry as kids-tee).
 * Skirt is a trapezoid (A-line) cut on fold at CF and CB.
 * Pieces: front bodice, back bodice, front skirt, back skirt, optional short sleeve ×2.
 */

import {
  armholeCurve, shoulderSlope, necklineCurve, shoulderDropFromWidth,
  armholeDepthFromChest, neckWidthFromCircumference,
} from '../engine/upper-body.js';
import { sampleBezier, fmtInches, edgeAngle, offsetPolygon, polyToPath, buildSideSeamPocketBag } from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

// Kids bodice ease: +2" chest (standard), +3" (relaxed)
const KIDS_BODICE_EASE = { standard: 2, relaxed: 3 };

export default {
  id: 'kids-dress',
  name: 'Kids A-Line Dress',
  category: 'dress',
  audience: 'kids',
  difficulty: 'beginner',
  priceTier: 'simple',
  measurements: ['chest', 'shoulder', 'neck', 'waist', 'hip', 'torsoLength', 'fullLength'],
  measurementDefaults: {
    chest: 25, shoulder: 11.5, neck: 11.5, waist: 22, hip: 24, torsoLength: 13, fullLength: 26,
  },

  options: {
    neckline: {
      type: 'select', label: 'Neckline',
      values: [
        { value: 'crew',  label: 'Round crew neck' },
        { value: 'scoop', label: 'Scoop neck'      },
        { value: 'boat',  label: 'Boat neck'       },
      ],
      default: 'crew',
    },
    sleeve: {
      type: 'select', label: 'Sleeve',
      values: [
        { value: 'sleeveless', label: 'Sleeveless'          },
        { value: 'short',      label: 'Short (4″ cap sleeve)' },
      ],
      default: 'sleeveless',
    },
    fit: {
      type: 'select', label: 'Bodice fit',
      values: [
        { value: 'standard', label: 'Standard (+2″)', reference: 'everyday, classic' },
        { value: 'relaxed',  label: 'Relaxed (+3″)',  reference: 'comfy, twirl'      },
      ],
      default: 'standard',
    },
    flare: {
      type: 'select', label: 'Skirt flare',
      values: [
        { value: '3', label: 'Gentle A-line (+3″)' },
        { value: '5', label: 'Classic A-line (+5″)' },
        { value: '7', label: 'Full A-line (+7″)'    },
      ],
      default: '5',
    },
    pockets: {
      type: 'select', label: 'Pockets',
      values: [
        { value: 'yes', label: 'Side seam pockets' },
        { value: 'no',  label: 'No pockets'        },
      ],
      default: 'no',
    },
    sa: {
      type: 'select', label: 'Seam allowance',
      values: [
        { value: 0.375, label: '⅜″' },
        { value: 0.5,   label: '½″' },
      ],
      default: 0.5,
    },
  },

  pieces(m, opts) {
    const sa       = parseFloat(opts.sa);
    const hemAllow = 1;
    const easeVal  = KIDS_BODICE_EASE[opts.fit] ?? 2;
    const flareAmt = parseFloat(opts.flare);

    // ── Bodice geometry (same engine as kids-tee) ──────────────────────────────
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

    // Neckline depths by style
    const NECK_DEPTHS = { crew: neckW + 0.5, scoop: 4.0, boat: neckW - 0.25 };
    const NECK_STYLES = { crew: 'crew', scoop: 'scoop', boat: 'crew' }; // boat uses crew curve, narrower depth
    const neckDepthFront = NECK_DEPTHS[opts.neckline] ?? neckW + 0.5;
    const neckDepthBack  = opts.neckline === 'boat' ? neckW - 0.25 : neckW / 3;
    const neckStyleFront = NECK_STYLES[opts.neckline] ?? 'crew';
    const neckStyleBack  = 'crew';

    function sc(cp, steps = 12) {
      return sampleBezier(cp.p0, cp.p1, cp.p2, cp.p3, steps).map(p => ({ ...p, curve: true }));
    }
    function bb(poly) {
      const xs = poly.map(p => p.x), ys = poly.map(p => p.y);
      return { width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys) };
    }

    const frontNeckPts  = sc(necklineCurve(neckW, neckDepthFront, neckStyleFront));
    const backNeckPts   = sc(necklineCurve(neckW, neckDepthBack,  neckStyleBack));
    const shoulderPts   = sc(shoulderSlope(shoulderW, slopeDrop));
    const frontArmPts   = sc(armholeCurve(shoulderW, chestDepth, armholeDepth, false));
    const backArmPts    = sc(armholeCurve(shoulderW, chestDepth, armholeDepth, true));

    function buildBodice(neckPts, armPts) {
      const poly = [];
      [...neckPts].reverse().forEach(p => poly.push({ ...p, x: neckW - p.x }));
      delete poly[0].curve;
      delete poly[neckPts.length - 1].curve;
      for (let i = 1; i < shoulderPts.length; i++) poly.push({ ...shoulderPts[i], x: neckW + shoulderPts[i].x });
      for (let i = 1; i < armPts.length; i++) poly.push({ ...armPts[i], x: shoulderPtX + armPts[i].x, y: shoulderPtY + armPts[i].y });
      poly.push({ x: panelW, y: torsoLen }); // side waist
      poly.push({ x: 0,      y: torsoLen }); // CF/CB waist fold
      return poly;
    }

    const frontBodice = buildBodice(frontNeckPts, frontArmPts);
    const backBodice  = buildBodice(backNeckPts,  backArmPts);
    const frontBodBB  = bb(frontBodice);
    const backBodBB   = bb(backBodice);

    // ── Skirt geometry ─────────────────────────────────────────────────────────
    // Skirt waist = bodice waist = panelW (on fold = half the full waist)
    // Skirt hem = panelW + flareAmt / 2 (flare distributed evenly to side seams)
    const skirtLen    = m.fullLength - torsoLen; // below waist
    const skirtPanelW = panelW;
    const skirtHemW   = skirtPanelW + flareAmt / 2;

    const frontSkirt = [
      { x: 0,           y: 0        },
      { x: skirtPanelW, y: 0        },
      { x: skirtHemW,   y: skirtLen },
      { x: 0,           y: skirtLen },
    ];
    const backSkirt = [...frontSkirt]; // same shape for kids (no back waist dart)
    const skirtBB   = bb(frontSkirt);

    // Bodice edge allowances
    const nNeck     = frontNeckPts.length;
    const nShoulder = shoulderPts.length - 1;
    const nFrontArm = frontArmPts.length - 1;
    const nBackArm  = backArmPts.length - 1;

    function bodiceEA(nNeckPts, nArmPts, hem) {
      const ea = [];
      for (let i = 0; i < nNeckPts - 1; i++) ea.push({ sa: 0.375, label: 'Neckline' });
      for (let i = 0; i < nShoulder; i++)     ea.push({ sa: 0.5,   label: 'Shoulder' });
      for (let i = 0; i < nArmPts; i++)       ea.push({ sa: opts.sleeve === 'sleeveless' ? 0.375 : 0.5, label: 'Armhole' });
      ea.push({ sa: 0.5, label: 'Side seam' });
      ea.push({ sa: hem, label: 'Waist' });  // waist joins skirt
      ea.push({ sa: 0,   label: 'Fold'   });
      return ea;
    }
    const frontBodEA = bodiceEA(nNeck, nFrontArm, sa);
    const backBodEA  = bodiceEA(nNeck, nBackArm,  sa);

    const pieces = [
      {
        id: 'bodice-front', name: 'Front Bodice',
        instruction: `Cut 1 on fold (CF) · No dart — flat chest block`,
        type: 'bodice', polygon: frontBodice,
        width: frontBodBB.width, height: frontBodBB.height, isBack: false, sa,
        edgeAllowances: frontBodEA,
        dims: [
          { label: fmtInches(panelW) + ' half width', x1: 0, y1: -0.5, x2: panelW, y2: -0.5, type: 'h' },
          { label: fmtInches(torsoLen) + ' bodice length', x: frontBodBB.width + 1, y1: 0, y2: torsoLen, type: 'v' },
        ],
      },
      {
        id: 'bodice-back', name: 'Back Bodice',
        instruction: 'Cut 1 on fold (CB) · Elastic at back neckline for easy dressing',
        type: 'bodice', polygon: backBodice,
        width: backBodBB.width, height: backBodBB.height, isBack: true, sa,
        edgeAllowances: backBodEA,
        dims: [
          { label: fmtInches(panelW) + ' half width', x1: 0, y1: -0.5, x2: panelW, y2: -0.5, type: 'h' },
          { label: fmtInches(torsoLen) + ' bodice length', x: backBodBB.width + 1, y1: 0, y2: torsoLen, type: 'v' },
        ],
      },
      {
        id: 'skirt-front', name: 'Front Skirt',
        instruction: 'Cut 1 on fold (CF) · Straight grain on CF edge',
        type: 'panel', polygon: frontSkirt,
        width: skirtBB.width, height: skirtBB.height,
        sa,
        dims: [
          { label: fmtInches(skirtPanelW) + ' waist', x1: 0, y1: -0.5, x2: skirtPanelW, y2: -0.5, type: 'h' },
          { label: fmtInches(skirtHemW)   + ' hem',   x1: 0, y1: skirtLen + 0.5, x2: skirtHemW, y2: skirtLen + 0.5, type: 'h', color: '#b8963e' },
          { label: fmtInches(skirtLen)    + ' length', x: skirtHemW + 1, y1: 0, y2: skirtLen, type: 'v' },
        ],
      },
      {
        id: 'skirt-back', name: 'Back Skirt',
        instruction: 'Cut 1 on fold (CB) · Straight grain on CB edge',
        type: 'panel', polygon: backSkirt,
        width: skirtBB.width, height: skirtBB.height,
        sa,
        dims: [
          { label: fmtInches(skirtPanelW) + ' waist', x1: 0, y1: -0.5, x2: skirtPanelW, y2: -0.5, type: 'h' },
          { label: fmtInches(skirtHemW)   + ' hem',   x1: 0, y1: skirtLen + 0.5, x2: skirtHemW, y2: skirtLen + 0.5, type: 'h', color: '#b8963e' },
          { label: fmtInches(skirtLen)    + ' length', x: skirtHemW + 1, y1: 0, y2: skirtLen, type: 'v' },
        ],
      },
    ];

    // ── Optional cap sleeve ────────────────────────────────────────────────────
    if (opts.sleeve === 'short') {
      const slvLength  = 4; // 4″ cap sleeve
      const slvWidth   = m.bicep ? m.bicep + 2 : m.chest / 4 + 2;
      const capHeight  = armholeDepth * 0.55;
      const sleevePoly = [
        { x: 0,        y: capHeight            },
        { x: slvWidth, y: capHeight            },
        { x: slvWidth, y: capHeight + slvLength },
        { x: 0,        y: capHeight + slvLength },
      ];
      pieces.push({
        id: 'sleeve',
        name: 'Cap Sleeve',
        instruction: 'Cut 2 (mirror L & R) · Straight grain · Ease into armhole',
        type: 'panel', polygon: sleevePoly,
        width: slvWidth, height: capHeight + slvLength,
        sa,
        dims: [
          { label: fmtInches(slvWidth) + ' width', x1: 0, y1: capHeight - 0.5, x2: slvWidth, y2: capHeight - 0.5, type: 'h' },
          { label: fmtInches(slvLength) + ' length', x: slvWidth + 1, y1: capHeight, y2: capHeight + slvLength, type: 'v' },
        ],
      });
    }

    // ── Optional pockets ───────────────────────────────────────────────────────
    if (opts.pockets === 'yes') {
      pieces.push(buildSideSeamPocketBag({
        bagWidth: 5.5, bagHeight: 6.5, sa,
        instruction: `Cut 4 (2 per side) · ${fmtInches(5.5)} wide × ${fmtInches(6.5)} deep · D-shaped · Lining or self fabric · Serge all edges before assembly`,
      }));
    }

    // ── Neckband / facing ─────────────────────────────────────────────────────
    const neckCirc = m.neck;
    const neckBandLen = neckCirc * 0.95;
    pieces.push({
      id: 'neckband',
      name: 'Neckband (or Neck Facing)',
      instruction: `Cut 1 strip ${fmtInches(neckBandLen)} long × 1.5″ wide · Or use ${fmtInches(1.5)}″ bias tape · Fold under and {topstitch} around neckline`,
      type: 'rectangle',
      dimensions: { length: neckBandLen, width: 1.5 },
      sa,
    });

    return pieces;
  },

  materials(m, opts) {
    const notions = [];
    if (opts.pockets === 'yes') {
      notions.push({ name: 'Lining or self fabric', quantity: '0.25 yard', notes: 'For pocket bags' });
    }
    notions.push({ name: 'Bias tape or neckband', quantity: '0.5 yard', notes: '1.5″ wide, for neck finish' });

    return buildMaterialsSpec({
      fabrics: ['cotton-poplin', 'cotton-lawn', 'linen-blend', 'voile'],
      notions,
      thread: 'poly-all',
      needle: 'universal-80',
      stitches: ['straight-2.5', 'zigzag-small', 'overlock'],
      notes: [
        'Lightweight wovens like cotton lawn or poplin are ideal — they drape beautifully and wash easily',
        'Pre-wash fabric before cutting — natural fibers shrink 3–5%',
        'No bust dart — flat chest bodice block for children',
        'Back neckline: run ¼″ elastic through a casing at back neck to allow over-head dressing without zipper',
        opts.pockets === 'yes' ? 'Pocket openings should be at hip level on the skirt side seam' : '',
        'Hem: fold under 1″ twice for a clean double-fold hem, or use bias tape for a contrast color accent',
      ].filter(Boolean),
    });
  },

  instructions(m, opts) {
    const steps = [];
    let n = 1;

    if (opts.sleeve === 'short') {
      steps.push({
        step: n++, title: 'Prepare cap sleeves',
        detail: '{serge} or fold under the hem edge of each sleeve ½″ and {press}. Set aside until armhole step.',
      });
    }

    if (opts.pockets === 'yes') {
      steps.push({
        step: n++, title: 'Attach pocket bags to skirt',
        detail: '{serge} all pocket bag edges. Sew pocket bags to front and back skirt side seams {RST} at hip level (roughly 6–7″ below waist). {press} bags away. {baste} at top and bottom edges.',
      });
    }

    steps.push({
      step: n++, title: 'Sew bodice shoulder seams',
      detail: 'Join front to back bodice at shoulders {RST}. Straight stitch. {press} toward back.',
    });

    if (opts.sleeve === 'sleeveless') {
      steps.push({
        step: n++, title: 'Finish armhole edges',
        detail: '{serge} armhole raw edges or apply bias tape around each armhole opening. Fold under ⅜″ and {topstitch} from RS.',
      });
    } else {
      steps.push({
        step: n++, title: 'Set cap sleeves',
        detail: 'Pin sleeve into armhole {RST}. Ease to fit. Straight stitch. {serge} SA together. {press} toward sleeve.',
      });
    }

    steps.push({
      step: n++, title: 'Finish neckline',
      detail: 'Apply bias tape or neckband around neckline. For back neck elastic: stitch a casing ½″ wide at back neck, thread ¼″ elastic to fit, stitch ends closed.',
    });

    steps.push({
      step: n++, title: 'Sew bodice side seams',
      detail: 'Join front to back bodice at side seams {RST}. Straight stitch. {press} open.',
    });

    steps.push({
      step: n++, title: 'Sew skirt side seams',
      detail: opts.pockets === 'yes'
        ? 'Sew above and below pocket openings. Sew around bags to close. {press} seams open.'
        : 'Join front to back skirt at side seams {RST}. Straight stitch. {press} open.',
    });

    steps.push({
      step: n++, title: 'Join bodice to skirt',
      detail: 'With {RST}, pin bodice waist to skirt waist, matching CF, CB, and side seams. Straight stitch all the way around. {serge} raw edge or {zigzag}. {press} SA toward bodice.',
    });

    steps.push({
      step: n++, title: 'Hem skirt',
      detail: 'Fold up 1″, {press}. Fold under raw edge another ½″, {press}. {topstitch} close to inner fold. Or use bias tape for a contrast color hem.',
    });

    steps.push({
      step: n++, title: 'Finish',
      detail: '{press} with damp cloth. Try on child — neckline should slide on easily over the head. Twirl test: A-line should flare nicely.',
    });

    return steps;
  },
};
