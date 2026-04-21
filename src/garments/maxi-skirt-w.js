// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Maxi Skirt (Womenswear) — floor-length A-line panels.
 * Same trapezoid panel math as a-line-skirt-w.js but skirt length ~50″.
 * Elastic casing waistband or invisible zip + structured waistband.
 * Works in cotton, linen, rayon, and lightweight wovens.
 * All measurements in inches. Seam allowance computed by the engine.
 */

import { sampleBezier, fmtInches, edgeAngle, buildSideSeamPocketBag, tummyAdjustment } from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

export default {
  id: 'maxi-skirt-w',
  name: 'Maxi Skirt',
  category: 'lower',
  difficulty: 'beginner',
  priceTier: 'simple',
  measurements: ['waist', 'hip', 'skirtLength'],
  measurementDefaults: { skirtLength: 50 },

  options: {
    flare: {
      type: 'select', label: 'Flare amount',
      values: [
        { value: '3', label: 'Subtle (+3″ per panel at hem)',  reference: 'gentle A-line' },
        { value: '5', label: 'Classic (+5″ per panel at hem)', reference: 'classic maxi'  },
        { value: '8', label: 'Full (+8″ per panel at hem)',    reference: 'dramatic'       },
      ],
      default: '5',
    },
    closure: {
      type: 'select', label: 'Waist closure',
      values: [
        { value: 'elastic', label: 'Elastic casing (pull-on, beginner-friendly)', reference: 'classic, comfortable' },
        { value: 'zip',     label: 'Invisible zip + structured waistband',        reference: 'fitted, polished' },
      ],
      default: 'elastic',
    },
    elasticWidth: {
      type: 'select', label: 'Elastic width',
      values: [
        { value: 1,    label: '1″ elastic (standard)' },
        { value: 1.5,  label: '1½″ elastic (extra stable)' },
      ],
      default: 1,
      showWhen: { closure: 'elastic' },
    },
    pockets: {
      type: 'select', label: 'Pockets',
      values: [
        { value: 'yes', label: 'Side-seam pockets (2)', reference: 'hidden, clean' },
        { value: 'no',  label: 'None' },
      ],
      default: 'yes',
    },
    lining: {
      type: 'select', label: 'Lining',
      values: [
        { value: 'no',  label: 'No lining' },
        { value: 'yes', label: 'Yes, full lining' },
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
    const sa       = parseFloat(opts.sa) || 0.625;
    const hemAllow = 1.5;                             // maxi skirts need generous hem
    const flareAmt = parseFloat(opts.flare) || 5;
    const ease     = 1.0;

    const hipW   = m.hip / 2 + ease / 2;
    const waistW = m.waist / 2;
    const hemW   = hipW + flareAmt;
    const L      = m.skirtLength || 50;

    // Dart intake per half-panel
    const dartIntake = hipW - waistW;
    const dartW      = dartIntake > 0.5 ? Math.min(dartIntake / 2, 0.75) : 0;
    const dartL      = 3.5;
    const tummyAdj   = tummyAdjustment(m);

    function pp(poly) {
      let d = `M ${poly[0].x.toFixed(2)} ${poly[0].y.toFixed(2)}`;
      for (let i = 1; i < poly.length; i++) d += ` L ${poly[i].x.toFixed(2)} ${poly[i].y.toFixed(2)}`;
      return d + ' Z';
    }

    function buildPanel(id, name, isBack) {
      const waistDip = 0.375;
      let poly;

      if (isBack) {
        const waistPts = sampleBezier(
          { x: 0, y: waistDip }, { x: hipW * 0.4, y: waistDip },
          { x: hipW * 0.8, y: 0 }, { x: hipW, y: 0 }, 12,
        ).map(p => ({ ...p, curve: true }));
        delete waistPts[0].curve;
        delete waistPts[waistPts.length - 1].curve;
        poly = [...waistPts, { x: hemW, y: L }, { x: 0, y: L }];
      } else {
        poly = [
          { x: 0,    y: -tummyAdj },
          { x: hipW, y: 0 },
          { x: hemW, y: L },
          { x: 0,    y: L },
        ];
      }

      const dartNote = dartW > 0
        ? `2 darts · ${fmtInches(dartW)} wide × ${fmtInches(dartL)} long`
        : 'No darts needed';

      const hipY = 7;
      const sideHipX = hipW + flareAmt * (hipY / L);
      const notches = [
        { x: sideHipX, y: hipY, angle: edgeAngle({ x: hipW, y: 0 }, { x: hemW, y: L }) },
        ...(isBack ? [{ x: sideHipX, y: hipY + 0.25, angle: edgeAngle({ x: hipW, y: 0 }, { x: hemW, y: L }) }] : []),
        { x: hipW / 2, y: 0, angle: -90 },
      ];
      if (dartW > 0) {
        notches.push({ x: hipW * 0.25, y: dartL, angle: -90 });
        notches.push({ x: hipW * 0.75, y: dartL, angle: -90 });
      }

      return {
        id, name,
        instruction: `Cut 1 on fold (${isBack ? 'CB' : 'CF'})${opts.closure === 'zip' && isBack ? ' · Leave CB seam open 9″ for invisible zip' : ''} · ${dartNote}`,
        type: 'bodice', polygon: poly, path: pp(poly),
        width: hemW, height: L, isBack, sa, hem: hemAllow, notches,
        dims: [
          { label: fmtInches(hipW) + ' at hip', x1: 0, y1: -0.5, x2: hipW, y2: -0.5, type: 'h' },
          { label: fmtInches(hemW) + ' at hem', x1: 0, y1: L + 0.5, x2: hemW, y2: L + 0.5, type: 'h' },
          { label: fmtInches(L) + ' length', x: hemW + 1, y1: 0, y2: L, type: 'v' },
        ],
      };
    }

    const pieces = [
      buildPanel('skirt-front', 'Front Panel', false),
      buildPanel('skirt-back',  'Back Panel',  true),
    ];

    // ── Waistband / casing ────────────────────────────────────────────────────
    if (opts.closure === 'elastic') {
      const elasticW = parseFloat(opts.elasticWidth) || 1;
      const wbCirc   = m.hip + ease + sa * 2;        // casing must pass over hips
      const wbWidth  = (elasticW + 0.75) * 2;
      pieces.push({
        id: 'waistband', name: 'Elastic Casing',
        instruction: `Cut 1 · ${fmtInches(wbCirc)} long × ${fmtInches(wbWidth)} cut · Elastic: ${Math.round(m.waist * 0.90)}″ of ${elasticW === 1 ? '1″' : '1½″'} elastic`,
        type: 'rectangle',
        dimensions: { length: wbCirc, width: wbWidth },
        sa,
      });
    } else {
      const wbCirc = m.waist + ease + sa * 2 + 2;   // +2" overlap at zip
      pieces.push({
        id: 'waistband', name: 'Structured Waistband',
        instruction: `Cut 2 (self + interfacing) · ${fmtInches(wbCirc)} long × 3.5″ cut (1.5″ finished) · Interface fully · 9″ invisible zip at CB`,
        type: 'rectangle',
        dimensions: { length: wbCirc, width: 3.5 },
        sa,
      });
      const zipLen = 9;
      pieces.push({
        id: 'zip', name: 'Invisible Zip',
        instruction: `${zipLen}″ invisible zipper · Center back seam`,
        type: 'notion',
        dimensions: { length: zipLen },
      });
    }

    if (opts.pockets === 'yes') {
      pieces.push(buildSideSeamPocketBag({
        bagWidth: 7, bagHeight: 10, sa,
        instruction: `Cut 4 (2 per side) · ${fmtInches(7)} wide × ${fmtInches(10)} deep · D-shaped · Self or lining fabric · Serge all edges before assembly`,
      }));
    }

    if (opts.lining === 'yes') {
      pieces.push({
        id: 'lining-front', name: 'Lining Front',
        instruction: `Cut 1 on fold · Trace main panel; shorten ¾″ from hem · ${fmtInches(hemW)} × ${fmtInches(L - 0.75)}`,
        type: 'pocket',
        dimensions: { width: hemW, height: L - 0.75 },
        sa,
      });
      pieces.push({
        id: 'lining-back', name: 'Lining Back',
        instruction: `Cut 1 on fold · Trace main panel; shorten ¾″ from hem · ${fmtInches(hemW)} × ${fmtInches(L - 0.75)}`,
        type: 'pocket',
        dimensions: { width: hemW, height: L - 0.75 },
        sa,
      });
    }

    return pieces;
  },

  materials(m, opts) {
    const flareAmt = parseFloat(opts.flare) || 5;
    const L        = m.skirtLength || 50;
    const ease     = 1;
    const hipH     = m.hip / 2 + ease / 2;
    const hemH     = hipH + flareAmt;
    const yards    = Math.ceil(((hemH + 1) * 2 / 36 + 0.5) * 4) / 4;

    const notions = [];
    if (opts.closure === 'elastic') {
      const elasticW = parseFloat(opts.elasticWidth) || 1;
      notions.push({ name: `${elasticW === 1 ? '1″' : '1½″'} elastic`, quantity: `${Math.round(m.waist * 0.9)}″` });
    } else {
      notions.push({ name: 'Invisible zipper', quantity: '9″', notes: 'Center back' });
      notions.push({ ref: 'interfacing-med', quantity: '0.25 yard', notes: 'Waistband only' });
    }

    return buildMaterialsSpec({
      fabrics: ['cotton-lawn', 'rayon-challis', 'linen-light', 'gauze', 'crepe', 'cotton-voile'],
      notions,
      thread: 'poly-all',
      needle: 'universal-80',
      stitches: ['straight-2.5', 'topstitch', 'zigzag-small'],
      notes: [
        `Fabric: approximately ${yards} yard(s) at 44-60″ wide. A longer skirt needs more fabric — measure twice.`,
        'Pre-wash and press all fabric before cutting. Maxi skirts with a bias hem will drop significantly after washing if not pre-treated.',
        'Stay-stitch waist and hip seams at ½″ immediately after cutting to prevent bias stretch.',
        'Hang the finished skirt on a dress form or hanger for 24 hours before marking and cutting the final hem. The skirt will drop at the sides due to fabric weight and bias.',
        opts.pockets === 'yes' ? 'Side-seam pockets: attach bags at hip level (7–8″ below waist) before sewing side seams.' : '',
        opts.lining === 'yes' ? 'Lining: float free at hem — do not attach lining hem to skirt hem. Tack at side seams and waist only.' : '',
      ].filter(Boolean),
    });
  },

  instructions(m, opts) {
    const steps = [];
    let n = 1;
    const sa = parseFloat(opts.sa) || 0.625;
    const saLabel = sa === 0.625 ? '⅝″' : '½″';

    steps.push({
      step: n++, title: 'Stay-stitch waist edge',
      detail: `Stay-stitch ${saLabel} from the waist edge on both panels before any other sewing. Prevents the waist from stretching out of shape.`,
    });

    steps.push({
      step: n++, title: 'Sew waist darts',
      detail: 'Fold darts {RST}, sew from waist edge to point. {press} front darts toward CF, back darts toward CB.',
    });

    if (opts.pockets === 'yes') {
      steps.push({
        step: n++, title: 'Attach pocket bags',
        detail: 'Sew one pocket bag to each front side seam SA {RST} at hip level (7–8″ below waist). Repeat on back panels. {press} bags toward front.',
      });
    }

    if (opts.closure === 'zip') {
      steps.push({
        step: n++, title: 'Install invisible zip at CB',
        detail: '{press} zip coils open. Sew zip tape to each back CB edge {RST}, starting at waist. Close the remaining CB seam below the zip stop.',
      });
    }

    steps.push({
      step: n++, title: 'Sew side seams',
      detail: opts.pockets === 'yes'
        ? 'Sew front to back at both side seams, leaving the pocket opening. Sew around pocket bags to join. {press} seams open.'
        : 'Sew front to back at both side seams {RST}. {press} open.',
    });

    if (opts.lining === 'yes') {
      steps.push({
        step: n++, title: 'Assemble lining',
        detail: 'Sew lining darts and side seams. {press}. Leave lining hem unfinished for now.',
      });
    }

    if (opts.closure === 'elastic') {
      steps.push({
        step: n++, title: 'Attach elastic casing',
        detail: `Fold casing in half lengthwise {WST}. Sew to waist {RST}. Fold to inside, {press}. {topstitch} close to lower edge leaving a 2″ gap. Thread elastic through casing. Overlap ends 1″ and {zigzag}. Close gap.`,
      });
    } else {
      steps.push({
        step: n++, title: 'Attach structured waistband',
        detail: 'Interface waistband. Sew one long edge to waist {RST}, matching CB, CF, and side seams. Grade SA. {press} up. Fold over, {press} under ⅝″ on inner edge. {slipstitch} inner edge or {edgestitch} from RS.',
      });
    }

    if (opts.lining === 'yes') {
      steps.push({
        step: n++, title: 'Attach lining at waist',
        detail: 'Fold lining top edge under ⅝″. {slipstitch} to WS of waistband seam. Tack lining to skirt at side seams only. Let lining hem float free.',
      });
    }

    steps.push({
      step: n++, title: 'Hang before hemming',
      detail: 'Hang finished skirt (without hem) on a dress form or hanger for 24 hours. The sides and back will drop as fabric relaxes. Mark the hem level from the floor using a skirt marker. Trim to a consistent hem allowance.',
    });

    steps.push({
      step: n++, title: 'Hem the skirt',
      detail: 'Fold hem up 1.5″. {press}. {edgestitch} or {slipstitch} by hand for an invisible finish. For a narrow rolled hem on lightweight fabric: use a rolled hem foot or fold up ¼″ twice and {edgestitch}.',
    });

    return steps;
  },

  variants: [
    { id: 'maxi-skirt-elastic-w', name: 'Elastic Maxi Skirt',        defaults: { closure: 'elastic', flare: '5' } },
    { id: 'maxi-skirt-zip-w',     name: 'Side-Zip Maxi Skirt',       defaults: { closure: 'zip',     flare: '3' } },
  ],
};
