// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Pencil Skirt (Womenswear) — fitted tapered skirt with back vent or kick pleat.
 * Forked from slip-skirt-w.js: tapered panels instead of straight rectangles.
 * Waistband, closure, dart, and lining code reused from slip-skirt.
 */

import { sampleBezier, fmtInches, edgeAngle, tummyAdjustment } from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

export default {
  id: 'pencil-skirt-w',
  name: 'Pencil Skirt (W)',
  category: 'lower',
  difficulty: 'beginner',
  priceTier: 'simple',
  measurements: ['waist', 'hip', 'skirtLength'],
  measurementDefaults: { skirtLength: 26 },

  options: {
    taper: {
      type: 'select', label: 'Taper (hem vs hip)',
      values: [
        { value: 'fitted',   label: 'Fitted (−4″ at hem)',  reference: 'classic pencil, below-knee' },
        { value: 'moderate', label: 'Moderate (−2″ at hem)', reference: 'office, midi'              },
        { value: 'straight', label: 'No taper (straight)',   reference: 'column skirt'              },
      ],
      default: 'fitted',
    },
    backVent: {
      type: 'select', label: 'Back hem opening',
      values: [
        { value: 'vent',        label: 'Vent (6″ overlap)',         reference: 'classic pencil'       },
        { value: 'kickpleat',   label: 'Kick pleat (3″ box pleat)', reference: 'office, structured'   },
        { value: 'none',        label: 'None (stretch fabric only)', reference: 'jersey, ponte'        },
      ],
      default: 'vent',
    },
    waistband: {
      type: 'select', label: 'Waistband',
      values: [
        { value: 'structured', label: 'Structured band (1.5″ + interfacing)', reference: 'dress trouser, office' },
        { value: 'elastic',    label: 'Elastic casing (1″)',                  reference: 'casual, pull-on'       },
        { value: 'petersham',  label: 'Petersham ribbon (1.5″)',              reference: 'petersham, vintage'    },
      ],
      default: 'structured',
    },
    elasticWidth: {
      type: 'select', label: 'Elastic width',
      values: [
        { value: 0.75, label: '¾″ (1½″ finished casing → 3″ cut)' },
        { value: 1,    label: '1″ (1¾″ finished casing → 3½″ cut)' },
        { value: 1.5,  label: '1½″ (2¼″ finished casing → 4½″ cut)' },
      ],
      default: 1,
      showWhen: { waistband: 'elastic' },
    },
    closure: {
      type: 'select', label: 'Closure',
      values: [
        { value: 'zip',      label: 'Invisible zip at CB' },
        { value: 'pullover', label: 'Pullover (elastic only)' },
      ],
      default: 'zip',
    },
    darts: {
      type: 'select', label: 'Waist darts',
      values: [
        { value: '2', label: '2 per panel (standard)' },
        { value: '1', label: '1 per panel (smaller intake)' },
      ],
      default: '2',
    },
    lining: {
      type: 'select', label: 'Lining',
      values: [
        { value: 'yes', label: 'Yes - full lining' },
        { value: 'no',  label: 'No' },
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
    const sa  = parseFloat(opts.sa);
    const hem = 1.0;
    const L   = m.skirtLength || 26;
    const ease = 1.0; // standard woven ease

    // Panel widths at hip level
    const hipW   = m.hip / 2 + ease;       // per panel (front or back)
    const waistW = m.waist / 2;            // per panel

    // Taper: how much narrower is the hem than the hip
    const TAPER = { fitted: 4, moderate: 2, straight: 0 };
    const taperTotal = TAPER[opts.taper] ?? 4;
    const hemW = hipW - taperTotal / 2; // per panel (both panels taper equally)

    // Dart calculation
    const totalIntake  = hipW - waistW;
    const dartCount    = parseInt(opts.darts, 10) || 2;
    const dartPerUnit  = totalIntake / dartCount;
    const dartW        = Math.max(0.25, Math.min(dartPerUnit, 0.75));
    const dartL        = 4.0;
    const tummyAdj     = tummyAdjustment(m);

    function pp(poly) {
      let d = `M ${poly[0].x.toFixed(2)} ${poly[0].y.toFixed(2)}`;
      for (let i = 1; i < poly.length; i++) d += ` L ${poly[i].x.toFixed(2)} ${poly[i].y.toFixed(2)}`;
      return d + ' Z';
    }

    function buildPanel(name, id) {
      // Fold at CF/CB (left edge) must be vertical — all taper to side seam
      const isBack = id === 'skirt-back';
      const waistDip = 0.375;
      let poly;

      if (isBack) {
        // Curved waist at CB (horizontal tangent at fold for smooth unfold)
        const waistPts = sampleBezier(
          { x: 0, y: waistDip }, { x: hipW * 0.4, y: waistDip },
          { x: hipW * 0.8, y: 0 }, { x: hipW, y: 0 }, 12
        ).map(p => ({ ...p, curve: true }));
        delete waistPts[0].curve;
        delete waistPts[waistPts.length - 1].curve;
        poly = [...waistPts,
          { x: hemW, y: L },
          { x: 0,    y: L },
        ];
      } else {
        poly = [
          { x: 0,    y: -tummyAdj },
          { x: hipW, y: 0 },
          { x: hemW, y: L },
          { x: 0,    y: L },
        ];
      }

      const dartNote = dartCount === 2
        ? `${dartCount} darts · ${fmtInches(dartW)} × ${fmtInches(dartL)} · spaced at ¼ and ¾ of waist`
        : `1 dart · ${fmtInches(dartW)} × ${fmtInches(dartL)} · centered`;

      const hipY = 7;
      const sideAngle = edgeAngle({ x: hipW, y: 0 }, { x: hemW, y: L });
      const notches = [
        { x: hipW, y: hipY, angle: sideAngle },
        ...(isBack ? [{ x: hipW, y: hipY + 0.25, angle: sideAngle }] : []),
        { x: hipW / 2, y: 0, angle: -90 },
      ];
      if (dartCount === 2) {
        notches.push({ x: hipW * 0.25, y: dartL, angle: -90 });
        notches.push({ x: hipW * 0.75, y: dartL, angle: -90 });
      } else {
        notches.push({ x: hipW * 0.5, y: dartL, angle: -90 });
      }

      const edgeAllowances = [
        { sa,      label: 'Waist' },
        { sa,      label: 'Side seam' },
        { sa: hem, label: 'Hem' },
        { sa,      label: 'Side seam' },
      ];

      return {
        id, name,
        instruction: [
          `Cut 1 on fold (${id === 'skirt-front' ? 'CF' : 'CB'})`,
          opts.closure === 'zip' && id === 'skirt-back' ? 'Split at CB for zip — add ⅝″ SA at CB seam' : '',
          dartNote,
        ].filter(Boolean).join(' · '),
        type: 'bodice', polygon: poly, path: pp(poly),
        width: hipW, height: L,
        isBack, sa, hem, notches, edgeAllowances,
        dims: [
          { label: fmtInches(hipW) + ' hip width', x1: 0, y1: -0.5, x2: hipW, y2: -0.5, type: 'h' },
          { label: fmtInches(hemW) + ' hem width', x1: 0, y1: L + 0.8, x2: hemW, y2: L + 0.8, type: 'h', color: '#b8963e' },
          { label: fmtInches(L) + ' length', x: hipW + 0.8, y1: 0, y2: L, type: 'v' },
        ],
      };
    }

    const pieces = [
      buildPanel('Front Panel', 'skirt-front'),
      buildPanel('Back Panel',  'skirt-back'),
    ];

    // Back vent or kick pleat
    if (opts.backVent === 'vent') {
      const ventH = 6;
      const ventW = 3; // overlap width
      pieces.push({
        id: 'vent-facing', name: 'Back Vent Facing',
        instruction: `Cut 2 · ${fmtInches(ventW)} wide × ${fmtInches(ventH + 1)} tall · Attach to CB hem at vent opening · One overlaps the other`,
        type: 'rectangle',
        dimensions: { width: ventW, height: ventH + 1 },
        sa,
      });
    } else if (opts.backVent === 'kickpleat') {
      const pleatH = 8;
      const pleatW = 7; // 3″ box pleat = 6″ total underlay + 1″ SA
      pieces.push({
        id: 'kick-pleat-underlay', name: 'Kick Pleat Underlay',
        instruction: `Cut 1 · ${fmtInches(pleatW)} wide × ${fmtInches(pleatH)} tall · Sew into CB hem opening · Creates 3″ visible pleat box`,
        type: 'rectangle',
        dimensions: { width: pleatW, height: pleatH },
        sa,
      });
    }

    // Waistband
    const wbCirc = opts.waistband === 'elastic' ? m.hip + ease + sa * 2 : m.waist + ease + sa * 2;
    if (opts.waistband === 'petersham') {
      pieces.push({ id: 'waistband', name: 'Petersham Ribbon', instruction: `1.5″ petersham ribbon · ${fmtInches(wbCirc)} long · hook-and-bar at CB`, dimensions: { length: wbCirc, width: 1.5 }, type: 'rectangle', sa });
    } else if (opts.waistband === 'structured') {
      pieces.push({ id: 'waistband', name: 'Structured Waistband', instruction: `Cut 2 (self + interfacing) · ${fmtInches(wbCirc)} long × 3″ cut (1.5″ finished) · Interface fully`, dimensions: { length: wbCirc, width: 3 }, type: 'rectangle', sa });
    } else {
      const elasticW = parseFloat(opts.elasticWidth) || 1;
      const wbWidth = (elasticW + 0.75) * 2;
      pieces.push({ id: 'waistband', name: 'Elastic Casing', instruction: `Cut 1 · ${fmtInches(wbCirc)} long × ${fmtInches(wbWidth)} cut · Fold over ${fmtInches(elasticW)} elastic = ${Math.round(m.waist * 0.9)}″ (~90% of waist)`, dimensions: { length: wbCirc, width: wbWidth }, type: 'rectangle', sa });
    }

    if (opts.closure === 'zip') {
      const zipLen = Math.ceil(L * 0.45);
      pieces.push({ id: 'cb-zip', name: 'Invisible Zip', instruction: `${zipLen}″ invisible zip · CB closure`, dimensions: { width: 1, height: zipLen }, type: 'pocket', sa });
    }

    if (opts.lining === 'yes') {
      pieces.push({ id: 'lining-front', name: 'Lining Front', instruction: `Cut 1 on fold · Same as front panel · Shorten 1″ from hem`, dimensions: { length: hipW, width: L - 1 }, type: 'pocket', sa });
      pieces.push({ id: 'lining-back',  name: 'Lining Back',  instruction: `Cut 1 on fold · Same as back panel · Shorten 1″ from hem · Leave CB open for zip`, dimensions: { length: hipW, width: L - 1 }, type: 'pocket', sa });
    }

    return pieces;
  },

  materials(m, opts) {
    const notions = [];
    if (opts.waistband === 'structured') {
      notions.push({ ref: 'interfacing-med', quantity: `${fmtInches((m.hip + 1) / 12 + 0.25)} yard` });
    }
    if (opts.waistband === 'petersham') {
      notions.push({ name: 'Petersham ribbon 1.5″', quantity: `${Math.ceil(m.hip + 2)}″` });
      notions.push({ name: 'Hook and bar', quantity: '1 set' });
    }
    if (opts.closure === 'zip') {
      notions.push({ name: 'Invisible zipper', quantity: `${Math.ceil((m.skirtLength || 26) * 0.45)}″` });
    }
    if (opts.lining === 'yes') {
      notions.push({ name: 'Lining fabric', quantity: '1.25 yard', notes: 'China silk, habotai, or Bemberg rayon' });
    }

    return buildMaterialsSpec({
      fabrics: ['ponte', 'wool-suiting', 'cotton-sateen', 'crepe', 'denim'],
      notions,
      thread: 'poly-all',
      needle: 'universal-80',
      stitches: ['straight-2', 'zigzag-small'],
      notes: [
        'Stay-stitch waist edge at ½″ immediately after cutting',
        'Sew darts from waist toward apex — {press} toward CB on back, CF on front',
        opts.backVent === 'vent' ? 'Back vent: stitching stops at vent notch — leave open below. One side overlaps the other by 3″' : '',
        opts.backVent === 'kickpleat' ? 'Kick pleat underlay: sew to CB hem opening. Bring folds to center, {baste} at waist level. Releases at hem for walking ease' : '',
        opts.lining === 'yes' ? 'Lining tacked at waistband and zip tape — hem floats 1″ shorter than skirt shell' : '',
        'Hang skirt 24 hours before marking final hem',
      ].filter(Boolean),
    });
  },

  instructions(m, opts) {
    const steps = [];
    let n = 1;

    steps.push({ step: n++, title: 'Stay-stitch waist', detail: 'Stitch ½″ from waist edge of both panels immediately after cutting.' });
    steps.push({ step: n++, title: 'Sew waist darts', detail: `Fold each dart {RST}. Sew from waist to point, tapering to nothing. Backstitch at waist. {press} toward center.` });

    if (opts.closure === 'zip') {
      steps.push({ step: n++, title: 'Install invisible zipper', detail: '{press} zip coils flat. Sew to CB seam allowances. Close remaining CB seam below zip stop.' });
    }

    if (opts.backVent === 'vent') {
      steps.push({ step: n++, title: 'Prepare back vent', detail: 'Sew CB seam from waist to vent notch. Backstitch firmly at vent stop. {press} open. Fold vent facings in place, {press}. Top-vent underlap over overlap by 3″.' });
    } else if (opts.backVent === 'kickpleat') {
      steps.push({ step: n++, title: 'Attach kick pleat underlay', detail: 'Sew CB seam to pleat notch. Sew pleat underlay into CB opening. {baste} folds at waist level to hold in place during construction. Release basting after skirt is complete.' });
    }

    steps.push({ step: n++, title: 'Sew side seams', detail: 'Join front to back at side seams {RST}. Sew from waist to hem. {press} open.' });

    if (opts.lining === 'yes') {
      steps.push({ step: n++, title: 'Assemble lining', detail: 'Sew lining darts and side seams as for shell. Leave CB open for zipper.' });
    }

    if (opts.waistband === 'petersham') {
      steps.push({ step: n++, title: 'Attach petersham', detail: 'Sew petersham to waist {RST}. {press} up. {slipstitch} to WS. Hook and bar at CB.' });
    } else if (opts.waistband === 'structured') {
      steps.push({ step: n++, title: 'Attach structured waistband', detail: 'Interface waistband. Sew ends. Turn. Sew one long edge to waist {RST}. {slipstitch} other edge to WS.' });
    } else {
      steps.push({ step: n++, title: 'Attach elastic casing', detail: 'Fold casing {WST}. Sew to waist {RST}. Fold inside. {topstitch} leaving gap. Thread elastic. Overlap ends, {zigzag}. Close gap.' });
    }

    if (opts.lining === 'yes') {
      steps.push({ step: n++, title: 'Attach lining', detail: 'Fold lining top edge under ⅝″. {slipstitch} to WS of waistband seam. Tack to zip tape at CB.' });
    }

    steps.push({ step: n++, title: 'Hem', detail: 'Hang 24 hours. Fold hem up 1″ twice, {press}, {slipstitch} or {edgestitch}.' });
    steps.push({ step: n++, title: 'Finish', detail: '{press} entire skirt. Check vent/pleat lies flat and waistband is even.' });

    return steps;
  },
};
