// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Slip Dress (Womenswear) — bias-inspired strappy dress.
 * Thin adjustable straps, V or scoop neckline, straight/A-line skirt.
 * No sleeves, minimal shaping — beginner-friendly woven construction.
 * Pieces: front body, back body, strap ×2, optional lining.
 */

import {
  necklineCurve, neckWidthFromCircumference,
} from '../engine/upper-body.js';
import { sampleBezier, fmtInches } from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

export default {
  id: 'slip-dress-w',
  name: 'Slip Dress (W)',
  category: 'upper',
  difficulty: 'beginner',
  priceTier: 'core',
  measurements: ['chest', 'waist', 'hip', 'neck', 'torsoLength', 'skirtLength'],
  measurementDefaults: { torsoLength: 16, skirtLength: 28 },

  options: {
    neckline: {
      type: 'select', label: 'Neckline',
      values: [
        { value: 'vneck', label: 'V-neck (default)' },
        { value: 'scoop', label: 'Scoop'             },
        { value: 'straight', label: 'Straight across' },
      ],
      default: 'vneck',
    },
    skirtShape: {
      type: 'select', label: 'Skirt shape',
      values: [
        { value: 'aline',    label: 'Slight A-line (+3″ flare)' },
        { value: 'straight', label: 'Straight / column'          },
      ],
      default: 'aline',
    },
    length: {
      type: 'select', label: 'Length',
      values: [
        { value: 'midi',  label: 'Midi (default)' },
        { value: 'knee',  label: 'Knee (−4″)'     },
        { value: 'maxi',  label: 'Maxi (+8″)'     },
        { value: 'mini',  label: 'Mini (−10″)'    },
      ],
      default: 'midi',
    },
    closure: {
      type: 'select', label: 'Closure',
      values: [
        { value: 'zip',  label: 'Invisible side zip' },
        { value: 'back', label: 'Back zip'            },
      ],
      default: 'zip',
    },
    lining: {
      type: 'select', label: 'Lining',
      values: [
        { value: 'no',  label: 'Self-lined bodice only' },
        { value: 'yes', label: 'Fully lined'            },
      ],
      default: 'no',
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
    const hem = 0.75;
    const ease = 1.5;

    const chestHalf = m.chest / 2 + ease / 2;
    const hipHalf   = m.hip / 2 + ease / 2;
    const waistHalf = m.waist / 2;
    const panelW    = Math.max(chestHalf, hipHalf) / 2;
    const waistW    = waistHalf / 2;

    const neckW = neckWidthFromCircumference(m.neck);
    const torsoLen = m.torsoLength;
    const lengthMod = opts.length === 'mini' ? -10 : opts.length === 'knee' ? -4 : opts.length === 'maxi' ? 8 : 0;
    const skirtL = m.skirtLength + lengthMod;
    const totalLen = torsoLen + skirtL;
    const flare = opts.skirtShape === 'aline' ? 3 : 0;
    const hemW = panelW + flare / 2;

    // Neckline depth
    const neckDepth = opts.neckline === 'vneck' ? Math.min(torsoLen * 0.5, 9) : opts.neckline === 'scoop' ? 6 : 2;
    const strapInset = neckW * 0.6; // strap sits inward from shoulder

    function sc(cp, steps = 12) { return sampleBezier(cp.p0, cp.p1, cp.p2, cp.p3, steps).map(p => ({ ...p, curve: true })); }
    function pp(poly) { let d = `M ${poly[0].x.toFixed(2)} ${poly[0].y.toFixed(2)}`; for (let i = 1; i < poly.length; i++) d += ` L ${poly[i].x.toFixed(2)} ${poly[i].y.toFixed(2)}`; return d + ' Z'; }
    function bb(poly) { const xs = poly.map(p => p.x), ys = poly.map(p => p.y); return { width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys) }; }

    function buildBody(isBack) {
      const depth = isBack ? 2 : neckDepth;
      const neckStyle = opts.neckline === 'vneck' && !isBack ? 'v-neck' : opts.neckline === 'scoop' && !isBack ? 'scoop' : 'crew';
      const neckPts = sc(necklineCurve(strapInset, depth, neckStyle));

      const poly = [];
      // Start at CF/CB neckline low point
      [...neckPts].reverse().forEach(p => poly.push({ ...p, x: strapInset - p.x }));
      delete poly[0].curve;
      delete poly[neckPts.length - 1].curve;

      // Strap attachment point (narrow shoulder)
      poly.push({ x: strapInset + 0.5, y: 0 });
      // Side seam from strap to underarm
      poly.push({ x: panelW, y: 3 });

      // Dart shaping at waist if needed
      const dartIntake = (panelW - waistW);
      if (dartIntake > 0.5) {
        poly.push({ x: panelW, y: torsoLen });
      } else {
        poly.push({ x: panelW, y: torsoLen });
      }

      // Skirt: flare or straight to hem
      poly.push({ x: hemW, y: totalLen });
      poly.push({ x: 0, y: totalLen });

      return poly;
    }

    const frontPoly = buildBody(false);
    const backPoly  = buildBody(true);
    const frontBB = bb(frontPoly), backBB = bb(backPoly);

    // Darts
    const dartIntake = panelW - waistW;
    const darts = [];
    if (dartIntake > 0.5) {
      const dartW = Math.min(dartIntake / 2, 0.75);
      darts.push({
        apexX: panelW * 0.4, apexY: torsoLen,
        sideX: panelW * 0.4, upperY: torsoLen - 4, lowerY: torsoLen,
        intake: dartW, length: 4,
      });
    }

    const frontNotches = [
      { x: panelW, y: torsoLen, angle: 0 }, // waistline
      { x: panelW, y: torsoLen - 7, angle: 0 }, // hip level
    ];
    const backNotches = [
      { x: panelW, y: torsoLen, angle: 0 },
      { x: panelW, y: torsoLen - 7, angle: 0 },
    ];

    const pieces = [
      {
        id: 'front-body', name: 'Front Body',
        instruction: `Cut 1 on fold (CF)${darts.length ? ` · ${darts.length} waist dart(s)` : ''}`,
        type: 'bodice', polygon: frontPoly, path: pp(frontPoly),
        width: frontBB.width, height: frontBB.height, isBack: false, sa, hem, notches: frontNotches, bustDarts: darts,
        dims: [
          { label: fmtInches(panelW) + ' half width', x1: 0, y1: -0.5, x2: panelW, y2: -0.5, type: 'h' },
          { label: fmtInches(totalLen) + ' total length', x: hemW + 1, y1: 0, y2: totalLen, type: 'v' },
        ],
      },
      {
        id: 'back-body', name: 'Back Body',
        instruction: `Cut 1 on fold (CB)${darts.length ? ` · ${darts.length} waist dart(s)` : ''}`,
        type: 'bodice', polygon: backPoly, path: pp(backPoly),
        width: backBB.width, height: backBB.height, isBack: true, sa, hem, notches: backNotches, bustDarts: darts,
        dims: [
          { label: fmtInches(panelW) + ' half width', x1: 0, y1: -0.5, x2: panelW, y2: -0.5, type: 'h' },
        ],
      },
      {
        id: 'strap', name: 'Strap',
        instruction: `Cut 4 (2 per side, self-fabric) · 18″ long × 1.5″ cut (0.5″ finished) · Adjustable length`,
        type: 'rectangle', dimensions: { length: 18, width: 1.5 }, sa,
      },
    ];

    // Zip
    const zipLen = opts.closure === 'back' ? Math.round(totalLen * 0.3) : Math.round(totalLen * 0.25);
    pieces.push({
      id: 'zip', name: opts.closure === 'back' ? 'Back Zip' : 'Side Zip',
      instruction: `${zipLen}″ invisible zipper · ${opts.closure === 'back' ? 'Center back' : 'Left side seam'}`,
      type: 'notion', dimensions: { length: zipLen },
    });

    // Lining
    if (opts.lining === 'yes') {
      pieces.push({
        id: 'lining-front', name: 'Lining Front',
        instruction: 'Cut 1 on fold (CF) from lining · Same as front body, shortened 1″ at hem',
        type: 'bodice', polygon: frontPoly, path: pp(frontPoly),
        width: frontBB.width, height: frontBB.height - 1, isBack: false, sa, hem: 0,
      });
      pieces.push({
        id: 'lining-back', name: 'Lining Back',
        instruction: 'Cut 1 on fold (CB) from lining · Same as back body, shortened 1″ at hem',
        type: 'bodice', polygon: backPoly, path: pp(backPoly),
        width: backBB.width, height: backBB.height - 1, isBack: true, sa, hem: 0,
      });
    }

    return pieces;
  },

  materials(m, opts) {
    const notions = [
      { name: 'Invisible zipper', quantity: '1', notes: opts.closure === 'back' ? 'Center back' : 'Left side seam' },
    ];
    if (opts.lining === 'yes') {
      notions.push({ name: 'Lining fabric', quantity: 'Same yardage as shell', notes: 'Lightweight china silk or poly charmeuse' });
    }

    return buildMaterialsSpec({
      fabrics: ['crepe', 'satin', 'silk-charmeuse', 'rayon-challis', 'tencel'],
      notions,
      thread: 'poly-all',
      needle: 'universal-70',
      stitches: ['straight', 'overlock', 'french-seam'],
      notes: [
        'Lightweight woven fabric with drape — avoid stiff cottons',
        'French seams recommended for unlined versions',
        'Cut on true bias for maximum drape (optional — uses more fabric)',
        'Lightweight 70/10 or 80/12 needle to avoid puckering on silk/satin',
        'Straps are self-fabric tubes — sew, turn, and topstitch',
      ],
    });
  },

  instructions(m, opts) {
    const steps = [];
    let n = 1;
    if (opts.lining === 'yes') {
      steps.push({ step: n++, title: 'Prepare lining', detail: 'Cut lining pieces 1″ shorter at hem. Sew lining darts if applicable.' });
    }
    steps.push({ step: n++, title: 'Sew darts', detail: '{press} front and back waist darts toward center. Taper to nothing at dart point.' });
    steps.push({ step: n++, title: 'Make straps', detail: 'Fold each strap strip in half lengthwise {RST}. Sew long edge. Turn RS out with loop turner or safety pin. {press} flat. {topstitch} both edges.' });
    if (opts.closure === 'back') {
      steps.push({ step: n++, title: 'Install back zip', detail: 'Sew CB seam below zip opening. Install invisible zipper. {press}.' });
      steps.push({ step: n++, title: 'Sew side seams', detail: 'Join front to back at both side seams {RST}. {serge} or French seam. {press} toward back.' });
    } else {
      steps.push({ step: n++, title: 'Sew right side seam', detail: 'Join front to back at right side seam {RST}. {serge} or French seam.' });
      steps.push({ step: n++, title: 'Install side zip', detail: 'Install invisible zipper in left side seam. Sew remainder of left side seam below zip.' });
    }
    steps.push({ step: n++, title: 'Finish neckline', detail: 'Fold top edge under ¼″ then ¼″ again. {press} and {topstitch}. Or apply bias facing for a cleaner finish.' });
    steps.push({ step: n++, title: 'Attach straps', detail: 'Pin straps to front and back neckline. Try on to set length. Stitch in place, then tack securely.' });
    steps.push({ step: n++, title: 'Hem dress', detail: 'Fold hem up ¾″. {press} and {topstitch}. For satin/silk: use a narrow rolled hem or bias-bound hem.' });
    steps.push({ step: n++, title: 'Finish', detail: '{press} all seams. Hang overnight before final hem — bias-cut fabric drops over time.' });
    return steps;
  },

  variants: [
    { id: 'maxi-slip-dress-w', name: 'Maxi Slip Dress', defaults: { length: 'maxi', skirtShape: 'aline' } },
  ],
};
