// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Trapeze Dress (Womenswear) — sleeveless A-line silhouette, no waist shaping.
 * One front panel (on fold at CF) + one back panel (on fold at CB or CB seam for zip).
 * Flares from bust/shoulder to hem. Neckline and armhole facings finish the upper edges.
 * No bodice darts, no waist seam, no sleeves.
 * All measurements in inches. Seam allowance computed by the engine.
 */

import { sampleBezier, fmtInches } from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

export default {
  id: 'trapeze-dress-w',
  name: 'Trapeze Dress',
  category: 'upper',
  difficulty: 'beginner',
  priceTier: 'simple',
  measurements: ['bust', 'hip', 'neck', 'torsoLength', 'skirtLength'],
  measurementDefaults: { torsoLength: 16, skirtLength: 24 },

  options: {
    flare: {
      type: 'select', label: 'Flare amount',
      values: [
        { value: '4',  label: 'Subtle (+4″ per panel at hem)',  reference: 'shift dress feel' },
        { value: '7',  label: 'Classic (+7″ per panel at hem)', reference: 'true trapeze'     },
        { value: '10', label: 'Full (+10″ per panel at hem)',   reference: 'dramatic, baby-doll' },
      ],
      default: '7',
    },
    neckline: {
      type: 'select', label: 'Neckline',
      values: [
        { value: 'crew',  label: 'Crew / round' },
        { value: 'scoop', label: 'Scoop'         },
        { value: 'square', label: 'Square'       },
      ],
      default: 'crew',
    },
    closure: {
      type: 'select', label: 'Back closure',
      values: [
        { value: 'zip',     label: 'Invisible zip at CB seam' },
        { value: 'pullover', label: 'Pullover (wide neck opening)' },
      ],
      default: 'zip',
    },
    length: {
      type: 'select', label: 'Dress length',
      values: [
        { value: 'mini',  label: 'Mini (−6″ from knee)' },
        { value: 'knee',  label: 'Knee length'          },
        { value: 'midi',  label: 'Midi (+6″)'           },
      ],
      default: 'knee',
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
    const sa      = parseFloat(opts.sa) || 0.625;
    const hem     = 0.75;
    const flare   = parseFloat(opts.flare) || 7;
    const ease    = 2;                               // minimal ease at bust for a loose trapeze

    const lengthMod = opts.length === 'mini' ? -6 : opts.length === 'midi' ? 6 : 0;
    const totalLen  = (m.torsoLength || 16) + (m.skirtLength || 24) + lengthMod;

    // Panel widths
    const panelW    = (m.bust + ease) / 4;           // quarter bust at top
    const hemPanelW = panelW + flare;                 // quarter hem at bottom

    // Neckline geometry (simple bezier)
    const neckW = (m.neck || 14) * 0.16;             // half-width of crew neck opening
    const neckDepths = { crew: 2.5, scoop: 4, square: 2 };
    const neckDepthF = neckDepths[opts.neckline] ?? 2.5;
    const neckDepthB = opts.closure === 'pullover' ? 2.5 : 0.75;

    // Armhole geometry (simple depth; no armholeCurve — facing covers the opening)
    const armholeDepth = Math.min((m.bust || 36) * 0.19, 8);  // approx 7-8" deep
    const armholeWidth = panelW - neckW;              // from neck edge to side seam

    // ── Helpers ───────────────────────────────────────────────────────────────
    function pp(poly) {
      let d = `M ${poly[0].x.toFixed(2)} ${poly[0].y.toFixed(2)}`;
      for (let i = 1; i < poly.length; i++) d += ` L ${poly[i].x.toFixed(2)} ${poly[i].y.toFixed(2)}`;
      return d + ' Z';
    }
    function bbW(p) { const xs = p.map(pt => pt.x); return Math.max(...xs) - Math.min(...xs); }
    function bbH(p) { const ys = p.map(pt => pt.y); return Math.max(...ys) - Math.min(...ys); }

    // Neckline curve for front: (0, neckDepth) → (neckW, 0)
    function neckCurveF() {
      if (opts.neckline === 'square') {
        return [{ x: 0, y: neckDepthF }, { x: neckW, y: neckDepthF }, { x: neckW, y: 0 }];
      }
      return sampleBezier(
        { x: 0,         y: neckDepthF },
        { x: 0,         y: neckDepthF * 0.2 },
        { x: neckW * 0.6, y: 0 },
        { x: neckW,     y: 0 },
        10,
      ).map(p => ({ ...p, curve: true }));
    }

    // Armhole curve: simple concave at top of side seam from (panelW, 0) down to (panelW, armholeDepth)
    function armholeCurveF() {
      return sampleBezier(
        { x: panelW, y: 0 },
        { x: panelW - 0.5, y: armholeDepth * 0.3 },
        { x: panelW - 1.5, y: armholeDepth * 0.7 },
        { x: panelW,       y: armholeDepth },
        8,
      ).map(p => ({ ...p, curve: true }));
    }

    // ── Build one panel (front or back, on fold at CF/CB) ────────────────────
    function buildPanel(isBack) {
      const neckDepth  = isBack ? neckDepthB : neckDepthF;
      const neckCurve  = neckCurveF();           // reuse front shape for back (shallower depth already set via neckDepthB)
      const ahCurve    = armholeCurveF();

      // Build back neckline
      function neckCurveB() {
        if (opts.neckline === 'square' || opts.closure === 'pullover') {
          return [{ x: 0, y: neckDepthB }, { x: neckW, y: neckDepthB }, { x: neckW, y: 0 }];
        }
        return sampleBezier(
          { x: 0,        y: neckDepthB },
          { x: 0,        y: 0 },
          { x: neckW * 0.5, y: 0 },
          { x: neckW,    y: 0 },
          8,
        ).map(p => ({ ...p, curve: true }));
      }

      const activeCurve = isBack ? neckCurveB() : neckCurve;

      const poly = [];
      // Start at CF/CB fold, neckline depth
      poly.push({ x: 0, y: activeCurve[0].y });

      // Neckline curve to shoulder/neck edge
      for (let i = 1; i < activeCurve.length; i++) poly.push({ ...activeCurve[i] });
      delete poly[poly.length - 1].curve;

      // Across shoulder to armhole start
      poly.push({ x: panelW, y: 0 });

      // Armhole curve down to underarm level
      for (let i = 1; i < ahCurve.length; i++) poly.push({ ...ahCurve[i] });
      delete poly[poly.length - 1].curve;

      // Side seam angling outward from armhole to hem
      poly.push({ x: hemPanelW, y: totalLen });

      // Hem straight back to CF/CB fold
      poly.push({ x: 0, y: totalLen });

      return {
        id:   isBack ? 'back-panel'  : 'front-panel',
        name: isBack ? 'Back Panel'  : 'Front Panel',
        instruction: isBack
          ? `Cut 1 on fold (CB)${opts.closure === 'zip' ? ' · Split CB and leave open 20″ for invisible zip' : ''} · Back neckline ${fmtInches(neckDepthB)} deep`
          : `Cut 1 on fold (CF) · ${opts.neckline === 'scoop' ? 'Scoop' : opts.neckline === 'square' ? 'Square' : 'Crew'} neckline ${fmtInches(neckDepthF)} deep`,
        type: 'bodice', polygon: poly, path: pp(poly),
        width: bbW(poly), height: bbH(poly),
        sa, hem, isBack,
        dims: [
          { label: fmtInches(panelW) + ' at bust (¼ width)', x1: 0, y1: -0.5, x2: panelW, y2: -0.5, type: 'h' },
          { label: fmtInches(hemPanelW) + ' at hem', x1: 0, y1: totalLen + 0.5, x2: hemPanelW, y2: totalLen + 0.5, type: 'h' },
          { label: fmtInches(totalLen) + ' length', x: hemPanelW + 1, y1: 0, y2: totalLen, type: 'v' },
        ],
      };
    }

    const pieces = [
      buildPanel(false),
      buildPanel(true),
    ];

    // ── Neckline facing ───────────────────────────────────────────────────────
    const neckCirc = Math.round((m.neck || 14) * 0.85 * 4) / 4;
    pieces.push({
      id: 'neck-facing', name: 'Neckline Facing',
      instruction: `Cut 2 (self + interfacing) · ${fmtInches(neckCirc / 2)} per half × 2.5″ wide · Interface and {understitch} after attaching`,
      type: 'rectangle',
      dimensions: { length: neckCirc / 2, width: 2.5 },
      sa,
    });

    // ── Armhole facings ───────────────────────────────────────────────────────
    const armholeCirc = (armholeDepth + armholeWidth) * 1.25;  // approximate armhole circumference
    pieces.push({
      id: 'armhole-facing', name: 'Armhole Facing',
      instruction: `Cut 4 (2 self + 2 interfacing) · ${fmtInches(armholeCirc)} long × 2.5″ wide · Interface and {understitch} after attaching`,
      type: 'rectangle',
      dimensions: { length: armholeCirc, width: 2.5 },
      sa,
    });

    // ── Invisible zip ─────────────────────────────────────────────────────────
    if (opts.closure === 'zip') {
      const zipLen = Math.min(Math.round(totalLen * 0.5), 22);
      pieces.push({
        id: 'zip', name: 'Invisible Zip',
        instruction: `${zipLen}″ invisible zipper · Center back seam`,
        type: 'notion',
        dimensions: { length: zipLen },
      });
    }

    return pieces;
  },

  materials(m, opts) {
    const notions = [
      { ref: 'interfacing-med', quantity: '0.5 yard', notes: 'Neckline and armhole facings' },
    ];
    if (opts.closure === 'zip') {
      const totalLen = (m.torsoLength || 16) + (m.skirtLength || 24) + (opts.length === 'mini' ? -6 : opts.length === 'midi' ? 6 : 0);
      notions.push({ name: 'Invisible zipper', quantity: `${Math.min(Math.round(totalLen * 0.5), 22)}″`, notes: 'Center back' });
    }

    return buildMaterialsSpec({
      fabrics: ['cotton-lawn', 'cotton-poplin', 'rayon-challis', 'crepe', 'linen-light'],
      notions,
      thread: 'poly-all',
      needle: 'universal-80',
      stitches: ['straight-2.5', 'zigzag-small', 'topstitch'],
      notes: [
        'Lightweight to medium-weight woven recommended. The trapeze shape needs a fabric with some drape.',
        'Interface ALL facing pieces before cutting — this prevents neckline and armhole edges from stretching.',
        '{understitch} every facing before pressing to WS. This is what keeps the facing invisible from the outside.',
        opts.closure === 'zip' ? 'CB zip: install before sewing side seams. Leave top 2″ of CB seam open for a smooth waistline.' : 'Wide neckline for pullover: make sure the neckline circumference is wide enough to pass over the head before cutting.',
        'Hang the finished dress before hemming. Trapeze dresses drop more at sides — mark hem level with a hem marker for an even result.',
      ],
    });
  },

  instructions(m, opts) {
    const steps = [];
    let n = 1;
    const sa = parseFloat(opts.sa) || 0.625;
    const saLabel = sa === 0.625 ? '⅝″' : '½″';

    steps.push({
      step: n++, title: 'Interface and prepare facings',
      detail: 'Interface all neckline and armhole facing pieces. {press} until bond is firm. Sew neckline facing short ends together (front to back) to form a loop. Repeat for each armhole facing.',
    });

    if (opts.closure === 'zip') {
      steps.push({
        step: n++, title: 'Install CB zip',
        detail: '{press} zip coils open. Mark the CB seam on both back panels. Sew zip to CB edges {RST}, starting at neckline. Close remaining CB seam below the zip stop with a regular presser foot.',
      });
    }

    steps.push({
      step: n++, title: 'Sew shoulder seams',
      detail: `Join front to back at both shoulder seams {RST} with a ${saLabel} seam. {press} toward back.`,
    });

    steps.push({
      step: n++, title: 'Attach neckline facing',
      detail: 'Pin neckline facing to neckline {RST}, matching CF, CB, and shoulder seams. Sew with a straight stitch. {clip} curves every ½″. Turn facing to WS. {press} firmly. {understitch} facing from WS ⅛″ from seam. {slipstitch} facing edges to shoulder seam SAs.',
    });

    steps.push({
      step: n++, title: 'Attach armhole facings',
      detail: 'Pin each armhole facing to the armhole {RST}. Sew around the armhole curve. {clip} curves. Turn to WS. {press}. {understitch}. {slipstitch} facing edge to side seam SA.',
    });

    steps.push({
      step: n++, title: 'Sew side seams',
      detail: `Join front to back at both side seams {RST}, from armhole level down to hem. {press} open. Catch-stitch or stitch in the ditch at armhole facing edges.`,
    });

    steps.push({
      step: n++, title: 'Hang and hem',
      detail: 'Hang the dress for at least an hour before hemming. Mark hem from the floor with a hem marker. Trim to a consistent allowance. Fold up ¾″, {press}. {slipstitch} or {edgestitch}.',
    });

    return steps;
  },
};
