// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Dolman / Batwing Top (Womenswear) — T-shape with integrated sleeves.
 * No set-in sleeve cap. No armhole curve. Underarm is a concave batwing curve.
 * Front and back are mirror-image panels sewn at shoulder (sleeve top) and side seam.
 * All measurements in inches. Seam allowance computed by the engine.
 */

import { sampleBezier, fmtInches } from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

export default {
  id: 'dolman-top-w',
  name: 'Dolman / Batwing Top',
  category: 'upper',
  difficulty: 'beginner',
  priceTier: 'simple',
  measurements: ['bust', 'neck', 'torsoLength'],
  measurementDefaults: { torsoLength: 24 },

  options: {
    ease: {
      type: 'select', label: 'Fit',
      values: [
        { value: 'relaxed',  label: 'Relaxed (+4″)', reference: 'classic dolman' },
        { value: 'generous', label: 'Generous (+6″)', reference: 'oversized, drapey' },
      ],
      default: 'relaxed',
    },
    sleeveLength: {
      type: 'select', label: 'Sleeve length',
      values: [
        { value: '3',  label: 'Cap sleeve (3″)'     },
        { value: '10', label: 'Elbow length (10″)'  },
        { value: '18', label: '¾ length (18″)'      },
        { value: '24', label: 'Full length (24″)'   },
      ],
      default: '10',
    },
    neckline: {
      type: 'select', label: 'Neckline',
      values: [
        { value: 'crew',  label: 'Crew / round (2.5″ deep)' },
        { value: 'scoop', label: 'Scoop (4″ deep)'          },
        { value: 'vneck', label: 'V-neck (6″ deep)'         },
      ],
      default: 'crew',
    },
    fabric: {
      type: 'select', label: 'Fabric type',
      values: [
        { value: 'knit',  label: 'Knit (jersey, rayon, bamboo)', reference: '⅜″ SA, stretch stitch' },
        { value: 'woven', label: 'Woven (voile, crepe, silk)', reference: '½″ SA, straight stitch' },
      ],
      default: 'knit',
    },
    sa: {
      type: 'select', label: 'Seam allowance',
      values: [
        { value: 0.375, label: '⅜″ (knit)' },
        { value: 0.5,   label: '½″ (woven)' },
      ],
      default: 0.375,
    },
    hem: {
      type: 'select', label: 'Hem allowance',
      values: [
        { value: 0.75, label: '¾″ twin-needle / cover stitch' },
        { value: 1,    label: '1″ double-fold (woven)'        },
      ],
      default: 0.75,
    },
  },

  pieces(m, opts) {
    const sa       = parseFloat(opts.sa)  || 0.375;
    const hem      = parseFloat(opts.hem) || 0.75;
    const easeVal  = opts.ease === 'generous' ? 6 : 4;
    const slvLen   = parseFloat(opts.sleeveLength) || 10;
    const isKnit   = opts.fabric === 'knit';

    // Body dimensions
    const panelW      = (m.bust + easeVal) / 4;       // half-chest quarter panel
    const bodyLength  = m.torsoLength || 24;
    const halfSpan    = panelW + slvLen;               // wrist to CF fold

    // Neckline
    const neckW       = (m.neck || 14) * 0.16;        // rough crew neck half-width
    const neckDepths  = { crew: 2.5, scoop: 4, vneck: 6 };
    const neckDepthF  = neckDepths[opts.neckline] ?? 2.5;
    const neckDepthB  = 0.75;

    // Sleeve / underarm geometry
    const shoulderDrop = 0.5;                          // shoulder to sleeve-top drop
    const wristW       = Math.max(4, m.bust * 0.12);  // estimated wrist opening
    const armholeY     = Math.min(bodyLength * 0.38, 10); // depth of underarm

    // ── Helper: path string from polygon ──────────────────────────────────────
    function polyPath(poly) {
      let d = `M ${poly[0].x.toFixed(2)} ${poly[0].y.toFixed(2)}`;
      for (let i = 1; i < poly.length; i++) {
        d += ` L ${poly[i].x.toFixed(2)} ${poly[i].y.toFixed(2)}`;
      }
      return d + ' Z';
    }

    // ── Helper: front/back neckline curve ────────────────────────────────────
    function neckCurve(depth) {
      return sampleBezier(
        { x: 0,         y: depth },
        { x: 0,         y: depth * 0.2 },
        { x: neckW * 0.6, y: 0 },
        { x: neckW,     y: 0 },
        10,
      ).map(p => ({ ...p, curve: true }));
    }

    // ── Helper: underarm batwing curve ────────────────────────────────────────
    // Concave inward from wrist-bottom toward body side seam
    function underarmCurve(halfSpanX, wristTopY, wristBotY, armX, armY) {
      return sampleBezier(
        { x: halfSpanX, y: wristBotY },
        { x: halfSpanX - slvLen * 0.3, y: wristBotY + 3.5 }, // dips down = batwing
        { x: armX + 4,  y: armY + 2 },
        { x: armX,      y: armY },
        18,
      ).map(p => ({ ...p, curve: true }));
    }

    // ── Build one panel (front or back) ───────────────────────────────────────
    function buildPanel(isBack) {
      const neckDepth = isBack ? neckDepthB : neckDepthF;
      const neckPts   = neckCurve(neckDepth);
      const wristTopY = shoulderDrop;
      const wristBotY = shoulderDrop + wristW;
      const aCurve    = underarmCurve(halfSpan, wristTopY, wristBotY, panelW, armholeY);

      const poly = [];

      // CF/CB fold at top-left — start at neckline depth
      poly.push({ x: 0, y: neckDepth });

      // Neckline curve to shoulder/neck point
      for (let i = 1; i < neckPts.length; i++) poly.push({ ...neckPts[i] });
      delete poly[poly.length - 1].curve;

      // Shoulder → wrist top (straight, slight drop)
      poly.push({ x: halfSpan, y: wristTopY });

      // Wrist end (down)
      poly.push({ x: halfSpan, y: wristBotY });

      // Batwing underarm curve
      for (let i = 1; i < aCurve.length; i++) poly.push({ ...aCurve[i] });
      delete poly[poly.length - 1].curve;

      // Side seam down to hem
      poly.push({ x: panelW, y: bodyLength });

      // Hem back to CF fold
      poly.push({ x: 0, y: bodyLength });

      function bbW(p) { const xs = p.map(pt => pt.x); return Math.max(...xs) - Math.min(...xs); }
      function bbH(p) { const ys = p.map(pt => pt.y); return Math.max(...ys) - Math.min(...ys); }

      return {
        id:   isBack ? 'back-panel'  : 'front-panel',
        name: isBack ? 'Back Panel'  : 'Front Panel',
        instruction: isBack
          ? `Cut 1 on fold (CB) · Back ${opts.neckline === 'vneck' ? 'V-neck' : 'crew'} neckline · ${fmtInches(neckDepthB)} deep`
          : `Cut 1 on fold (CF) · ${opts.neckline === 'vneck' ? 'V-neck' : opts.neckline === 'scoop' ? 'Scoop' : 'Crew'} neckline · ${fmtInches(neckDepthF)} deep`,
        type: 'bodice',
        polygon: poly, path: polyPath(poly),
        width: bbW(poly), height: bbH(poly),
        sa, hem, isBack,
        dims: [
          { label: fmtInches(panelW) + ' at chest (¼ width)', x1: 0, y1: -0.5, x2: panelW, y2: -0.5, type: 'h' },
          { label: fmtInches(slvLen) + ' sleeve', x1: panelW, y1: -0.5, x2: halfSpan, y2: -0.5, type: 'h' },
          { label: fmtInches(bodyLength) + ' length', x: panelW + 1, y1: armholeY, y2: bodyLength, type: 'v' },
        ],
      };
    }

    const pieces = [
      buildPanel(false),
      buildPanel(true),
    ];

    // ── Neck facing ───────────────────────────────────────────────────────────
    const neckCirc = Math.round((m.neck || 14) * 0.85 * 4) / 4;
    pieces.push({
      id: 'neck-facing',
      name: 'Neckline Facing',
      instruction: isKnit
        ? `Cut 1 from self on fold · ${fmtInches(neckCirc / 2)} long (half circumference) × 1.5″ wide · {serge} outer edge before attaching`
        : `Cut 2 (self + interfacing) · ${fmtInches(neckCirc / 2)} long × 2.5″ wide · Interface the self piece`,
      type: 'rectangle',
      dimensions: { length: neckCirc / 2, width: isKnit ? 1.5 : 2.5 },
      sa,
    });

    return pieces;
  },

  materials(m, opts) {
    const isKnit = opts.fabric === 'knit';
    const slvLen = parseFloat(opts.sleeveLength) || 10;
    const panelW = (m.bust + (opts.ease === 'generous' ? 6 : 4)) / 4;
    const halfSpan = panelW + slvLen;
    // Fabric estimate: 2 panels × (halfSpan width + SA) × (torsoLength + SA)
    const yards = Math.ceil(((halfSpan + 1) * 2 / 36 + 0.25) * 4) / 4;

    return buildMaterialsSpec({
      fabrics: isKnit
        ? ['knit-jersey', 'rayon-jersey', 'bamboo-jersey', 'modal-jersey']
        : ['crepe-de-chine', 'voile', 'silk-charmeuse', 'rayon-challis'],
      notions: [],
      thread: 'poly-all',
      needle: isKnit ? 'ballpoint-80' : 'universal-80',
      stitches: isKnit
        ? ['stretch', 'overlock', 'twin-needle']
        : ['straight-2.5', 'topstitch', 'overlock'],
      notes: [
        `Fabric: approximately ${yards} yard(s) at 44-60″ wide. Cut both panels from the same length.`,
        'The batwing underarm curve is one continuous seam from sleeve cuff through underarm to hem.',
        isKnit
          ? 'Use a ballpoint needle. Stretch stitch or serger on all curved seams.'
          : 'Stay-stitch neckline and sleeve edges before sewing to prevent bias stretch.',
        'If using a knit, the neckline can be finished with a folded self-fabric band instead of a facing.',
        opts.sleeveLength === '24'
          ? 'Full-length sleeve: add a cuff or hem the wrist opening before sewing the underarm seam.'
          : 'Hem the sleeve edge before closing the underarm seam for easiest access.',
      ],
    });
  },

  instructions(m, opts) {
    const steps = [];
    let n = 1;
    const sa = parseFloat(opts.sa) || 0.375;
    const saLabel = sa === 0.375 ? '⅜″' : '½″';
    const isKnit = opts.fabric === 'knit';
    const seam = isKnit ? `${saLabel} stretch stitch or serge` : `${saLabel} straight stitch`;

    steps.push({
      step: n++, title: 'Stay-stitch neckline',
      detail: `Sew a line of stay stitching ${saLabel} from the neckline edge on both front and back panels to prevent stretching while handling.`,
    });

    steps.push({
      step: n++, title: 'Sew shoulder / sleeve top seam',
      detail: `Place front and back panels {RST}, aligning the top edge (shoulder and sleeve). Sew from neckline edge to sleeve cuff with a ${seam}. {press} toward back.`,
    });

    steps.push({
      step: n++, title: 'Attach neckline facing',
      detail: isKnit
        ? `Sew the short ends of the facing strip together to form a ring. Pin to neckline {RST}, stretching to fit. Serge or stretch stitch. Fold facing to WS, {press}, and {topstitch} ¼″ from neck edge.`
        : `Interface the facing. Sew to neckline {RST}. {clip} curves. Turn to WS, {press}. {understitch} and {slipstitch} facing edge.`,
    });

    steps.push({
      step: n++, title: 'Hem sleeve cuffs (before underarm seam)',
      detail: `Fold sleeve hem up ${parseFloat(opts.hem) === 1 ? '¼″ then 1″' : '¾″'} and {press}. ${isKnit ? 'Twin needle from RS, or fold under raw edge and {zigzag}.' : '{edgestitch} or {slipstitch}.'}`,
    });

    steps.push({
      step: n++, title: 'Sew underarm and side seam',
      detail: `Fold garment {RST}, aligning front and back from cuff edge through the batwing underarm curve all the way to the hem. This is one continuous curved seam. Sew with a ${seam}. {clip} the curve every ½″ especially at the deep batwing point. {serge} or {zigzag} raw edges. {press} toward back.`,
    });

    steps.push({
      step: n++, title: 'Hem body',
      detail: `Fold hem up ${parseFloat(opts.hem) === 1 ? '¼″ then 1″' : '¾″'} and {press}. ${isKnit ? 'Twin needle from RS.' : '{edgestitch} close to inner fold.'}`,
    });

    return steps;
  },
};
