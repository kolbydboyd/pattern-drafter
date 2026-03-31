// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Slip Skirt (Womenswear) — simple rectangle panels with waist darts.
 * Petersham, structured, or elastic waistband. Invisible CB zip. Optional lining.
 * Two darts per panel to absorb waist-hip differential.
 */

import { fmtInches, edgeAngle } from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

export default {
  id: 'slip-skirt-w',
  name: 'Slip Skirt (W)',
  category: 'lower',
  difficulty: 'beginner',
  priceTier: 'simple',
  measurements: ['waist', 'hip', 'skirtLength'],
  measurementDefaults: { skirtLength: 28 },

  options: {
    waistband: {
      type: 'select', label: 'Waistband',
      values: [
        { value: 'petersham',  label: 'Petersham ribbon (1.5″)',             reference: 'petersham, contoured'  },
        { value: 'structured', label: 'Structured band (1.5″ + interfacing)', reference: 'dress trouser, Dickies' },
        { value: 'elastic',    label: 'Elastic casing (1″)',                  reference: 'chef pant, pull-on'    },
      ],
      default: 'petersham',
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
    hem: {
      type: 'select', label: 'Hem',
      values: [
        { value: 'straight', label: 'Straight' },
        { value: 'handrolled', label: 'Hand-rolled (fine fabrics)' },
        { value: 'horsehair', label: 'Horsehair braid (slight flare)' },
      ],
      default: 'straight',
    },
    lining: {
      type: 'select', label: 'Lining',
      values: [
        { value: 'yes', label: 'Yes, full lining' },
        { value: 'no',  label: 'No'                },
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
    const hem = opts.hem === 'handrolled' ? 0.25 : 0.75;

    // Ease: 1″ per panel (2″ total around the body — standard woven skirt ease)
    const ease    = 1.0;
    const hipW    = m.hip / 2 + ease;       // per panel (front or back)
    const waistW  = m.waist / 2;             // per panel

    // Dart intake: how much extra hip vs waist to take in per panel
    const totalIntake = hipW - waistW;       // per panel
    const dartCount   = parseInt(opts.darts, 10) || 2;
    const dartPerUnit = totalIntake / dartCount; // depth per dart
    const dartW       = Math.max(0.25, Math.min(dartPerUnit, 0.75)); // clamp to reasonable
    const dartL       = 4.0; // dart length from waist

    const L = m.skirtLength || 28;

    // Simple rectangle panel: straight sides, width = hipW, height = L
    // Waist edge is narrower than hip (darts handle the shaping)
    function buildPanel(name, id) {
      const poly = [
        { x: 0,    y: 0 },
        { x: hipW, y: 0 },
        { x: hipW, y: L },
        { x: 0,    y: L },
      ];
      const path = `M 0 0 L ${hipW.toFixed(2)} 0 L ${hipW.toFixed(2)} ${L.toFixed(2)} L 0 ${L.toFixed(2)} Z`;

      // Dart annotations as dimensions (visual only — rendered as note)
      const dims = [
        { label: fmtInches(hipW) + ' half width', x1: 0, y1: -0.5, x2: hipW, y2: -0.5, type: 'h' },
        { label: fmtInches(L) + ' length', x: hipW + 0.8, y1: 0, y2: L, type: 'v' },
      ];

      const dartNote = dartCount === 2
        ? `${dartCount} darts per panel · ${fmtInches(dartW)} wide × ${fmtInches(dartL)} long · spaced at ¼ and ¾ of waist`
        : `1 dart per panel · ${fmtInches(dartW)} wide × ${fmtInches(dartL)} long · centered at waist`;

      // Hip level ~ 7″ below waist
      const hipY = 7;
      // Notches: hip on side seam, dart endpoints, CF/CB at waist
      const notches = [
        // Hip level on side seam (right edge, pointing outward)
        { x: hipW, y: hipY, angle: 0 },
        ...(id === 'skirt-back' ? [{ x: hipW, y: hipY + 0.25, angle: 0 }] : []),
        // CF/CB mark at waist center
        { x: hipW / 2, y: 0, angle: -90 },
      ];
      // Dart endpoint notches
      if (dartCount === 2) {
        notches.push({ x: hipW * 0.25, y: dartL, angle: -90 });
        notches.push({ x: hipW * 0.75, y: dartL, angle: -90 });
      } else {
        notches.push({ x: hipW * 0.5, y: dartL, angle: -90 });
      }

      // Per-edge seam allowances: waist, side, hem, fold
      const edgeAllowances = [
        { sa,      label: 'Waist' },
        { sa,      label: 'Side seam' },
        { sa: 1.5, label: 'Hem' },
        { sa: 0,   label: 'Fold' },
      ];

      return {
        id, name,
        instruction: `Cut 1 on fold (${id === 'skirt-front' ? 'CF' : 'CB'})${opts.closure === 'zip' && id === 'skirt-back' ? ' · Split at CB for invisible zip. Add ⅝″ SA at CB seam' : ''} · ${dartNote}`,
        type: 'bodice', polygon: poly, path,
        width: hipW, height: L, isBack: id === 'skirt-back', sa, hem, notches, edgeAllowances,
        dims,
      };
    }

    const pieces = [
      buildPanel('Front Panel', 'skirt-front'),
      buildPanel('Back Panel',  'skirt-back'),
    ];

    // Waistband — structured/petersham sits at waist; elastic must pass over hips
    const wbCirc = (opts.waistband === 'elastic') ? m.hip + ease + sa * 2 : m.waist + ease + sa * 2;
    if (opts.waistband === 'petersham') {
      pieces.push({ id: 'waistband', name: 'Petersham Ribbon', instruction: `1.5″ petersham ribbon · ${fmtInches(wbCirc)} long · hook-and-bar at CB`, dimensions: { length: wbCirc, width: 1.5 }, type: 'rectangle', sa });
    } else if (opts.waistband === 'structured') {
      pieces.push({ id: 'waistband', name: 'Structured Waistband', instruction: `Cut 2 (self + interfacing) · ${fmtInches(wbCirc)} long × 3″ cut (1.5″ finished) · Interface fully`, dimensions: { length: wbCirc, width: 3 }, type: 'rectangle', sa });
    } else {
      pieces.push({ id: 'waistband', name: 'Elastic Casing', instruction: `Cut 1 · ${fmtInches(wbCirc)} long × 2.5″ cut · Fold over 1″ elastic (waist − 1″)`, dimensions: { length: wbCirc, width: 2.5 }, type: 'rectangle', sa });
    }

    if (opts.closure === 'zip') {
      const zipLen = Math.ceil(L * 0.45);
      pieces.push({ id: 'cb-zip', name: 'Invisible Zip', instruction: `${zipLen}″ invisible zip · Install at CB before sewing CB seam`, dimensions: { width: 1, height: zipLen }, type: 'pocket', sa });
    }

    if (opts.lining === 'yes') {
      pieces.push({ id: 'lining-front', name: 'Lining Front', instruction: `Cut 1 on fold · Same as front panel · Shorten 1″ from hem · Sew to zip tape and waistband`, dimensions: { length: hipW, width: L - 1 }, type: 'pocket', sa });
      pieces.push({ id: 'lining-back',  name: 'Lining Back',  instruction: `Cut 1 on fold · Same as back panel · Shorten 1″ from hem · Leave CB open to zip`, dimensions: { length: hipW, width: L - 1 }, type: 'pocket', sa });
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
      notions.push({ name: 'Invisible zipper', quantity: `${Math.ceil((m.skirtLength || 28) * 0.45)}″`, notes: 'CB closure' });
    }
    if (opts.hem === 'horsehair') {
      notions.push({ name: 'Horsehair braid ¾″', quantity: `${Math.ceil((m.hip + 1) / 36 * 2)} yard`, notes: 'Hem braid for subtle flare' });
    }
    if (opts.lining === 'yes') {
      notions.push({ name: 'Lining fabric', quantity: '1.5 yard', notes: 'China silk, habotai, or Bemberg rayon' });
    }

    return buildMaterialsSpec({
      fabrics: ['silk-charmeuse', 'crepe', 'satin', 'tencel', 'viscose'],
      notions,
      thread: 'poly-all',
      needle: 'universal-70',
      stitches: ['straight-2', 'zigzag-small'],
      notes: [
        'Cut with grain running vertically - bias cut will cause wavy hem and excess stretch',
        'Stay-stitch waist edge at ½″ immediately after cutting to prevent bias stretch',
        'Sew darts from waist toward apex - {press} toward CB on back, CF on front',
        opts.hem === 'handrolled' ? 'Hand-rolled hem: machine stitch 2mm from edge, trim close, roll between fingers, {slipstitch}. Best on silk and chiffon.' : '{press} hem up twice, {slipstitch} or {edgestitch} close to fold',
        opts.lining === 'yes' ? 'Attach lining at waistband and zip tape - leave hem free (let lining float 1″ shorter than skirt)' : 'French seams work well at the side seams for a clean interior finish on fine fabrics',
        'Hang skirt 24 hours before marking final hem - bias-cut or drapy wovens will drop at the hemline',
      ].filter(Boolean),
    });
  },

  instructions(m, opts) {
    const steps = [];
    let n = 1;

    steps.push({ step: n++, title: 'Stay-stitch waist', detail: 'Stitch ½″ from waist edge of both panels immediately after cutting. This prevents bias stretch before assembling.' });
    steps.push({ step: n++, title: 'Sew waist darts', detail: `Fold each dart RS together. Sew from waist to point, tapering to nothing. Backstitch at waist. {press} toward ${opts.closure === 'zip' ? 'CB/CF' : 'center'}.` });

    if (opts.closure === 'zip') {
      steps.push({ step: n++, title: 'Install invisible zipper', detail: '{press} zip coils flat. Sew right side of zip to right CB seam allowance. Sew left side to left CB seam allowance. Attach zip foot. Close remaining CB seam below zip stop.' });
    }

    steps.push({ step: n++, title: 'Sew side seams', detail: 'Join front to back at both side seams {RST}. Sew from waist to hem. {press} open. For fine fabrics: use French seams: sew WS together first at 3mm, {press}, flip RS together, sew at ¼″.' });

    if (opts.lining === 'yes') {
      steps.push({ step: n++, title: 'Assemble lining', detail: 'Sew lining darts and side seams as for shell. Leave CB open for zipper. {press}.' });
    }

    if (opts.waistband === 'petersham') {
      steps.push({ step: n++, title: 'Attach petersham', detail: 'Sew petersham ribbon to waist edge {RST}, easing any fullness. {press} up. {slipstitch} folded edge to WS. Attach hook and bar at CB.' });
    } else if (opts.waistband === 'structured') {
      steps.push({ step: n++, title: 'Attach structured waistband', detail: 'Interface waistband. Fold in half lengthwise {RST}, sew ends. Turn. Sew one long edge to waist {RST}. Fold over, {slipstitch} or {edgestitch} other edge to WS.' });
    } else {
      steps.push({ step: n++, title: 'Attach elastic casing', detail: 'Fold casing strip in half {WST}. Sew to waist {RST}. Fold inside. {topstitch} leaving 2″ gap. Thread elastic (waist − 1″). Overlap ends 1″, {zigzag}. Close gap.' });
    }

    if (opts.lining === 'yes') {
      steps.push({ step: n++, title: 'Attach lining to waist', detail: 'Fold under top edge of lining 5/8″. {slipstitch} folded edge to WS of waistband seam allowance. Tack lining to zip tape at CB.' });
    }

    steps.push({ step: n++, title: 'Hang and hem', detail: `Hang skirt 24 hours on a hanger before marking hem. ${opts.hem === 'handrolled' ? 'Trim hem allowance to ¼″. Roll edge between fingers and {slipstitch}.' : opts.hem === 'horsehair' ? '{baste} horsehair braid inside hem fold. {edgestitch} close to fold. The braid creates a slight flare.' : 'Fold up hem twice, {press}, {slipstitch} or {edgestitch} close to inner fold.'}` });
    steps.push({ step: n++, title: 'Finish', detail: '{press} entire skirt with a pressing cloth. Check darts lie flat and waistband is even.' });

    return steps;
  },
};
