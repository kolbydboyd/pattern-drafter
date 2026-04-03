// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Sundress (Womenswear) — strappy summer dress with gathered skirt.
 * Fitted bodice with thin straps or wide tank straps, waist seam,
 * gathered or tiered skirt. Woven fabric, beginner-friendly construction.
 * Pieces: front bodice, back bodice, skirt front, skirt back, strap ×2,
 *   optional tier panel(s).
 */

import {
  necklineCurve, neckWidthFromCircumference,
} from '../engine/upper-body.js';
import { sampleBezier, fmtInches } from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

export default {
  id: 'sundress-w',
  name: 'Sundress (W)',
  category: 'upper',
  difficulty: 'beginner',
  priceTier: 'core',
  measurements: ['chest', 'waist', 'hip', 'neck', 'torsoLength', 'skirtLength'],
  measurementDefaults: { torsoLength: 16, skirtLength: 22 },

  options: {
    neckline: {
      type: 'select', label: 'Neckline',
      values: [
        { value: 'scoop', label: 'Scoop (default)' },
        { value: 'straight', label: 'Straight across' },
        { value: 'sweetheart', label: 'Sweetheart' },
      ],
      default: 'scoop',
    },
    strap: {
      type: 'select', label: 'Strap style',
      values: [
        { value: 'thin', label: 'Thin spaghetti strap' },
        { value: 'wide', label: 'Wide strap (~2″)' },
        { value: 'tie',  label: 'Tie strap' },
      ],
      default: 'thin',
    },
    skirtStyle: {
      type: 'select', label: 'Skirt style',
      values: [
        { value: 'gathered',  label: 'Gathered at waist (default)' },
        { value: 'tiered',    label: 'Two-tier gathered' },
      ],
      default: 'gathered',
    },
    length: {
      type: 'select', label: 'Length',
      values: [
        { value: 'knee', label: 'Knee (default)' },
        { value: 'midi', label: 'Midi (+4″)' },
        { value: 'mini', label: 'Mini (−4″)' },
        { value: 'maxi', label: 'Maxi (+12″)' },
      ],
      default: 'knee',
    },
    closure: {
      type: 'select', label: 'Closure',
      values: [
        { value: 'back', label: 'Back zip' },
        { value: 'side', label: 'Invisible side zip' },
      ],
      default: 'back',
    },
    pockets: {
      type: 'select', label: 'Pockets',
      values: [
        { value: 'no',   label: 'None' },
        { value: 'seam', label: 'Side seam pockets' },
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
    const ease = 1;

    const chestHalf = m.chest / 2 + ease / 2;
    const waistHalf = m.waist / 2;
    const panelW    = chestHalf / 2;
    const waistW    = waistHalf / 2;

    const neckW = neckWidthFromCircumference(m.neck);
    const torsoLen = m.torsoLength;
    const lengthMod = opts.length === 'mini' ? -4 : opts.length === 'midi' ? 4 : opts.length === 'maxi' ? 12 : 0;
    const skirtL = m.skirtLength + lengthMod;
    const gatherRatio = 1.5; // 1.5× fullness

    // Neckline depth
    const neckDepth = opts.neckline === 'scoop' ? 6 : opts.neckline === 'sweetheart' ? 7 : 2;
    const strapW = opts.strap === 'wide' ? 2 : opts.strap === 'tie' ? 1 : 0.5;
    const strapInset = neckW * 0.6;

    function sc(cp, steps = 12) { return sampleBezier(cp.p0, cp.p1, cp.p2, cp.p3, steps).map(p => ({ ...p, curve: true })); }
    function pp(poly) { let d = `M ${poly[0].x.toFixed(2)} ${poly[0].y.toFixed(2)}`; for (let i = 1; i < poly.length; i++) d += ` L ${poly[i].x.toFixed(2)} ${poly[i].y.toFixed(2)}`; return d + ' Z'; }
    function bb(poly) { const xs = poly.map(p => p.x), ys = poly.map(p => p.y); return { width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys) }; }

    function buildBodice(isBack) {
      const depth = isBack ? 2 : neckDepth;
      const neckStyle = opts.neckline === 'sweetheart' && !isBack ? 'scoop' : opts.neckline === 'scoop' && !isBack ? 'scoop' : 'crew';
      const neckPts = sc(necklineCurve(strapInset, depth, neckStyle));

      const poly = [];
      // CF/CB neckline
      [...neckPts].reverse().forEach(p => poly.push({ ...p, x: strapInset - p.x }));
      delete poly[0].curve;
      delete poly[neckPts.length - 1].curve;

      // Strap attachment
      poly.push({ x: strapInset + strapW, y: 0 });
      // Side seam to underarm
      poly.push({ x: panelW, y: 3 });
      // Waist
      poly.push({ x: waistW, y: torsoLen });
      // CF/CB at waist
      poly.push({ x: 0, y: torsoLen });

      return poly;
    }

    const frontPoly = buildBodice(false);
    const backPoly  = buildBodice(true);
    const frontBB = bb(frontPoly), backBB = bb(backPoly);

    // Sweetheart notch (decorative V dip at center front)
    const sweetheart = opts.neckline === 'sweetheart';

    const frontNotches = [
      { x: panelW, y: torsoLen * 0.5, angle: 0 },
    ];
    const backNotches = [
      { x: panelW, y: torsoLen * 0.5, angle: 0 },
    ];

    const pieces = [
      {
        id: 'bodice-front', name: 'Front Bodice',
        instruction: `Cut 1 on fold (CF)${sweetheart ? ' · Sweetheart dip: clip ½″ at CF neckline, press under' : ''}`,
        type: 'bodice', polygon: frontPoly, path: pp(frontPoly),
        width: frontBB.width, height: frontBB.height, isBack: false, sa, hem: 0,
        notches: frontNotches,
        dims: [
          { label: fmtInches(panelW) + ' half width', x1: 0, y1: -0.5, x2: panelW, y2: -0.5, type: 'h' },
          { label: fmtInches(torsoLen) + ' bodice length', x: panelW + 1, y1: 0, y2: torsoLen, type: 'v' },
        ],
      },
      {
        id: 'bodice-back', name: 'Back Bodice',
        instruction: 'Cut 1 on fold (CB)',
        type: 'bodice', polygon: backPoly, path: pp(backPoly),
        width: backBB.width, height: backBB.height, isBack: true, sa, hem: 0,
        notches: backNotches,
        dims: [
          { label: fmtInches(panelW) + ' half width', x1: 0, y1: -0.5, x2: panelW, y2: -0.5, type: 'h' },
        ],
      },
    ];

    // Skirt pieces
    const skirtW = waistHalf / 2 * gatherRatio;
    if (opts.skirtStyle === 'tiered') {
      const tierLen = Math.round(skirtL / 2);
      const tier2W = skirtW * 1.3; // second tier wider for more gather
      pieces.push({
        id: 'skirt-tier1-front', name: 'Skirt Tier 1 (Front)',
        instruction: `Cut 1 on fold · ${fmtInches(skirtW * 2)} wide × ${fmtInches(tierLen)} long · Gather top edge to fit bodice waist`,
        type: 'rectangle', dimensions: { length: tierLen, width: skirtW * 2 }, sa, hem: 0,
      });
      pieces.push({
        id: 'skirt-tier1-back', name: 'Skirt Tier 1 (Back)',
        instruction: `Cut 1 on fold · ${fmtInches(skirtW * 2)} wide × ${fmtInches(tierLen)} long · Gather top edge to fit bodice waist`,
        type: 'rectangle', dimensions: { length: tierLen, width: skirtW * 2 }, sa, hem: 0,
      });
      pieces.push({
        id: 'skirt-tier2-front', name: 'Skirt Tier 2 (Front)',
        instruction: `Cut 1 on fold · ${fmtInches(tier2W * 2)} wide × ${fmtInches(tierLen)} long · Gather top to tier 1 hem`,
        type: 'rectangle', dimensions: { length: tierLen, width: tier2W * 2 }, sa, hem,
      });
      pieces.push({
        id: 'skirt-tier2-back', name: 'Skirt Tier 2 (Back)',
        instruction: `Cut 1 on fold · ${fmtInches(tier2W * 2)} wide × ${fmtInches(tierLen)} long · Gather top to tier 1 hem`,
        type: 'rectangle', dimensions: { length: tierLen, width: tier2W * 2 }, sa, hem,
      });
    } else {
      pieces.push({
        id: 'skirt-front', name: 'Skirt Front',
        instruction: `Cut 1 on fold · ${fmtInches(skirtW * 2)} wide × ${fmtInches(skirtL)} long · Gather top edge to fit bodice waist`,
        type: 'rectangle', dimensions: { length: skirtL, width: skirtW * 2 }, sa, hem,
      });
      pieces.push({
        id: 'skirt-back', name: 'Skirt Back',
        instruction: `Cut 1 on fold · ${fmtInches(skirtW * 2)} wide × ${fmtInches(skirtL)} long · Gather top edge to fit bodice waist`,
        type: 'rectangle', dimensions: { length: skirtL, width: skirtW * 2 }, sa, hem,
      });
    }

    // Straps
    const strapLen = opts.strap === 'tie' ? 24 : 18;
    const strapCutW = opts.strap === 'wide' ? 5 : opts.strap === 'tie' ? 3 : 1.5;
    const strapFinished = opts.strap === 'wide' ? '2″' : opts.strap === 'tie' ? '1″' : '½″';
    pieces.push({
      id: 'strap', name: 'Strap',
      instruction: `Cut 4 (2 per side) · ${strapLen}″ long × ${fmtInches(strapCutW)} cut (${strapFinished} finished)${opts.strap === 'tie' ? ' · Tie at shoulder' : ' · Adjustable length'}`,
      type: 'rectangle', dimensions: { length: strapLen, width: strapCutW }, sa,
    });

    // Zip
    const zipLen = Math.round(torsoLen * 0.8);
    pieces.push({
      id: 'zip', name: opts.closure === 'back' ? 'Back Zip' : 'Side Zip',
      instruction: `${zipLen}″ invisible zipper · ${opts.closure === 'back' ? 'Center back' : 'Left side seam'}`,
      type: 'notion', dimensions: { length: zipLen },
    });

    // Pockets
    if (opts.pockets === 'seam') {
      pieces.push({
        id: 'pocket', name: 'Side Seam Pocket',
        instruction: 'Cut 4 (2 per side) · 6″ wide × 7″ deep pocket bag',
        type: 'rectangle', dimensions: { length: 7, width: 6 }, sa,
      });
    }

    return pieces;
  },

  materials(m, opts) {
    const notions = [
      { name: 'Invisible zipper', quantity: '1', notes: opts.closure === 'back' ? 'Center back' : 'Left side seam' },
    ];

    return buildMaterialsSpec({
      fabrics: ['cotton-lawn', 'cotton-voile', 'linen', 'rayon-challis', 'chambray', 'cotton-poplin'],
      notions,
      thread: 'poly-all',
      needle: 'universal-70',
      stitches: ['straight', 'overlock', 'gathering'],
      notes: [
        'Lightweight woven fabric with drape — cotton lawn, voile, or linen ideal for summer',
        'Pre-wash fabric before cutting — cotton and linen shrink 3–5%',
        'Gather skirt panels to 1.5× fullness for soft volume',
        opts.skirtStyle === 'tiered' ? 'Tier 2 is cut wider than tier 1 for cascading fullness' : '',
        opts.strap === 'tie' ? 'Tie straps: sew tubes, turn RS out, tie at shoulder for adjustable fit' : '',
        'French seams recommended for sheer fabrics like voile',
      ].filter(Boolean),
    });
  },

  instructions(m, opts) {
    const steps = [];
    let n = 1;

    steps.push({ step: n++, title: 'Sew bodice darts/shaping', detail: 'Sew side seams on front and back bodice from underarm to waist {RST}. {press} toward back.' });

    if (opts.closure === 'back') {
      steps.push({ step: n++, title: 'Install back zip', detail: 'Sew CB seam below zip opening on bodice. Install invisible zipper. {press}.' });
    }

    steps.push({ step: n++, title: 'Finish bodice top edge', detail: 'Fold top edge under ¼″ then ¼″ again. {press} and {topstitch}. Leave strap attachment points open.' });

    steps.push({ step: n++, title: 'Make straps', detail: 'Fold each strap strip in half lengthwise {RST}. Sew long edge. Turn RS out. {press} flat. {topstitch} both edges.' });

    steps.push({ step: n++, title: 'Attach straps', detail: 'Pin straps to front and back bodice at marked points. Try on to set length. Stitch in place securely.' });

    // Skirt assembly
    if (opts.skirtStyle === 'tiered') {
      steps.push({ step: n++, title: 'Sew tier 1 side seams', detail: 'Join front and back tier 1 panels at side seams {RST}. {serge} or French seam.' });
      steps.push({ step: n++, title: 'Gather tier 1', detail: 'Run two rows of gathering stitches along top edge of tier 1. Pull to match bodice waist circumference.' });
      steps.push({ step: n++, title: 'Attach tier 1 to bodice', detail: 'Pin gathered tier 1 to bodice waist {RST}, distributing gathers evenly. Sew. {press} SA toward bodice.' });
      steps.push({ step: n++, title: 'Sew tier 2 side seams', detail: 'Join front and back tier 2 panels at side seams {RST}.' });
      steps.push({ step: n++, title: 'Gather and attach tier 2', detail: 'Gather top of tier 2, pull to match tier 1 hem. Pin {RST}, sew. {press} SA up.' });
    } else {
      steps.push({ step: n++, title: 'Sew skirt side seams', detail: 'Join front and back skirt panels at side seams {RST}. {serge} or French seam.' });
      steps.push({ step: n++, title: 'Gather skirt', detail: 'Run two rows of gathering stitches along top edge of skirt. Pull to match bodice waist circumference.' });
      steps.push({ step: n++, title: 'Attach skirt to bodice', detail: 'Pin gathered skirt to bodice waist {RST}, distributing gathers evenly. Sew. {press} SA toward bodice.' });
    }

    if (opts.closure === 'side') {
      steps.push({ step: n++, title: 'Install side zip', detail: 'Install invisible zipper in left side seam through bodice and skirt. Sew remainder of seam below zip.' });
    }

    if (opts.pockets === 'seam') {
      steps.push({ step: n++, title: 'Add pockets', detail: 'Attach pocket bags to side seam allowances. Sew around pocket bag. {press} toward front.' });
    }

    steps.push({ step: n++, title: 'Hem skirt', detail: 'Fold hem up ¾″. {press} and {topstitch}. For sheer fabrics: use a narrow rolled hem.' });
    steps.push({ step: n++, title: 'Finish', detail: '{press} all seams. Try on — adjust strap length if needed.' });

    return steps;
  },
};
