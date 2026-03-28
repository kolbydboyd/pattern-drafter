// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * A-Line Skirt (Womenswear) — trapezoid panels with hem flare.
 * Waist darts, structured or elastic waistband, optional side pockets.
 * Flare amount controls how much wider the hem is than the hip.
 */

import { fmtInches, edgeAngle } from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

export default {
  id: 'a-line-skirt-w',
  name: 'A-Line Skirt (W)',
  category: 'lower',
  difficulty: 'beginner',
  priceTier: 'core',
  measurements: ['waist', 'hip', 'skirtLength'],
  measurementDefaults: { skirtLength: 26 },

  options: {
    flare: {
      type: 'select', label: 'Flare amount',
      values: [
        { value: '2', label: 'Subtle (+2″ per panel at hem)',  reference: 'subtle'       },
        { value: '4', label: 'Classic (+4″ per panel at hem)', reference: 'classic A-line' },
        { value: '6', label: 'Full (+6″ per panel at hem)',    reference: 'dramatic'      },
      ],
      default: '4',
    },
    waistband: {
      type: 'select', label: 'Waistband',
      values: [
        { value: 'structured', label: 'Structured (1.5″ + interfacing)', reference: 'dress trouser, Dickies' },
        { value: 'elastic',    label: 'Elastic casing (1″)',             reference: 'chef pant, pull-on'    },
      ],
      default: 'structured',
    },
    closure: {
      type: 'select', label: 'Closure',
      values: [
        { value: 'zip',      label: 'Invisible zip at left side seam'  },
        { value: 'pullover', label: 'Pullover (elastic waistband only)' },
      ],
      default: 'zip',
    },
    pockets: {
      type: 'select', label: 'Pockets',
      values: [
        { value: 'yes', label: 'Side-seam pockets', reference: 'hidden, clean' },
        { value: 'no',  label: 'None',               reference: 'minimal'       },
      ],
      default: 'yes',
    },
    hem: {
      type: 'select', label: 'Hem',
      values: [
        { value: 'straight', label: 'Straight (clean finish)' },
        { value: 'faced',    label: 'Faced hem (curved)'      },
      ],
      default: 'straight',
    },
    lining: {
      type: 'select', label: 'Lining',
      values: [
        { value: 'yes', label: 'Yes — full lining' },
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
    const sa       = parseFloat(opts.sa);
    const hem      = opts.hem === 'faced' ? 0 : 0.75; // faced hem uses a facing piece instead
    const flareAmt = parseFloat(opts.flare) || 4;

    const ease  = 1.0;
    const hipW  = m.hip / 2 + ease / 2;
    const waistW = m.waist / 2;
    const hemW  = hipW + flareAmt;       // wider at hem than hip
    const L     = m.skirtLength || 26;

    // Dart intake per panel (hip - waist, spread across 2 darts)
    const dartIntake = hipW - waistW;
    const dartW      = dartIntake > 0.5
      ? Math.min(dartIntake / 2, 0.75)
      : 0;
    const dartL      = 3.5;

    function pp(poly) {
      let d = `M ${poly[0].x.toFixed(2)} ${poly[0].y.toFixed(2)}`;
      for (let i = 1; i < poly.length; i++) d += ` L ${poly[i].x.toFixed(2)} ${poly[i].y.toFixed(2)}`;
      return d + ' Z';
    }

    function buildPanel(id, name, isBack) {
      // Trapezoid: waist narrower than hem, sides angled
      const flarePerSide = flareAmt / 2;
      const poly = [
        { x: flarePerSide,        y: 0 },   // waist left
        { x: flarePerSide + hipW, y: 0 },   // waist right (hip-width at waist)
        { x: hemW,                y: L },   // hem right
        { x: 0,                   y: L },   // hem left
      ];

      const dartNote = dartW > 0
        ? `2 darts · ${fmtInches(dartW)} wide × ${fmtInches(dartL)} long · at ¼ and ¾ of waist edge`
        : 'No darts needed — waist and hip measurements are close';

      // Hip level ~ 7″ below waist; interpolate side seam x at that y
      const hipY = 7;
      const sideHipX = flarePerSide + hipW + (hemW - flarePerSide - hipW) * (hipY / L);
      // Notches: hip on side seam, dart endpoints, CF/CB at waist
      const notches = [
        // Hip level on side seam
        { x: sideHipX, y: hipY, angle: edgeAngle(poly[1], poly[2]) },
        // CF/CB mark at waist center
        { x: flarePerSide + hipW / 2, y: 0, angle: -90 },
      ];
      // Dart endpoint notches (at bottom of each dart)
      if (dartW > 0) {
        const d1x = flarePerSide + hipW * 0.25;
        const d2x = flarePerSide + hipW * 0.75;
        notches.push({ x: d1x, y: dartL, angle: -90 });
        notches.push({ x: d2x, y: dartL, angle: -90 });
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
        instruction: `Cut 1 on fold (${isBack ? 'CB' : 'CF'})${opts.closure === 'zip' && !isBack ? ' · Leave left side seam open for invisible zip' : ''} · ${dartNote}`,
        type: 'bodice', polygon: poly, path: pp(poly),
        width: hemW, height: L, isBack, sa, hem, notches, edgeAllowances,
        dims: [
          { label: fmtInches(hipW) + ' at hip', x1: flarePerSide, y1: -0.5, x2: flarePerSide + hipW, y2: -0.5, type: 'h' },
          { label: fmtInches(hemW) + ' at hem', x1: 0, y1: L + 0.5, x2: hemW, y2: L + 0.5, type: 'h' },
        ],
      };
    }

    const pieces = [
      buildPanel('skirt-front', 'Front Panel', false),
      buildPanel('skirt-back',  'Back Panel',  true),
    ];

    // Waistband
    const wbCirc = m.hip + ease + sa * 2;
    if (opts.waistband === 'structured') {
      pieces.push({ id: 'waistband', name: 'Waistband', instruction: `Cut 2 (self + interfacing) · ${fmtInches(wbCirc)} long × 3.5″ cut (1.5″ finished + SA) · Interface fully`, dimensions: { length: wbCirc, width: 3.5 }, type: 'rectangle', sa });
    } else {
      pieces.push({ id: 'waistband', name: 'Elastic Casing', instruction: `Cut 1 · ${fmtInches(wbCirc)} long × 2.5″ cut · Fold over 1″ elastic (waist − 1″)`, dimensions: { length: wbCirc, width: 2.5 }, type: 'rectangle', sa });
    }

    if (opts.closure === 'zip') {
      const zipLen = Math.ceil(L * 0.45);
      pieces.push({ id: 'side-zip', name: 'Invisible Zip', instruction: `${zipLen}″ invisible zip · Left side seam`, dimensions: { width: 1, height: zipLen }, type: 'pocket' });
    }

    if (opts.pockets === 'yes') {
      pieces.push({ id: 'pocket-bag', name: 'Side-Seam Pocket Bag', instruction: 'Cut 4 (2 per side) · Attach bag to front and back side seam SAs at hip level', dimensions: { width: 7, height: 9 }, type: 'pocket' });
    }

    if (opts.hem === 'faced') {
      // Facing strip follows the curved hem
      const hemCirc = hemW * 2;
      pieces.push({ id: 'hem-facing', name: 'Hem Facing', instruction: `Cut 2 (front + back) · Interface · Follows hem curve · 2.5″ wide · {understitch} and {press} to WS`, dimensions: { length: hemCirc * 0.5 + 1, width: 2.5 }, type: 'pocket' });
    }

    if (opts.lining === 'yes') {
      pieces.push({ id: 'lining-front', name: 'Lining Front', instruction: 'Cut 1 on fold · USE MAIN SKIRT PANEL AS TEMPLATE — trace the panel shape, shorten ¾″ from hem edge · Float free at hem, tack to side seams only', type: 'pocket', dimensions: { width: 1, height: 1 } });
      pieces.push({ id: 'lining-back',  name: 'Lining Back',  instruction: 'Cut 1 on fold · USE MAIN SKIRT PANEL AS TEMPLATE — trace the panel shape, shorten ¾″ from hem edge · Float free at hem, tack to side seams only', type: 'pocket', dimensions: { width: 1, height: 1 } });
    }

    return pieces;
  },

  materials(m, opts) {
    const notions = [];
    if (opts.waistband === 'structured') {
      notions.push({ ref: 'interfacing-med', quantity: '0.5 yard' });
    }
    if (opts.closure === 'zip') {
      notions.push({ name: 'Invisible zipper', quantity: `${Math.ceil((m.skirtLength || 26) * 0.45)}″`, notes: 'Left side seam' });
    }
    if (opts.lining === 'yes') {
      notions.push({ name: 'Lining fabric', quantity: '1.5 yard', notes: 'Habotai, China silk, or Bemberg rayon' });
    }

    return buildMaterialsSpec({
      fabrics: ['cotton-poplin', 'linen-light', 'crepe', 'wool-blend', 'denim-light'],
      notions,
      thread: 'poly-all',
      needle: 'universal-75',
      stitches: ['straight-2.5', 'zigzag-small'],
      notes: [
        'Stay-stitch waist and hip curves at ½″ before assembling to prevent bias stretch',
        '{press} darts toward CB on back panel, toward CF on front — creates a smooth hip curve',
        opts.pockets === 'yes' ? '{baste} pocket bags to side seam SAs before sewing side seams — they should sit at hip height (approx 7–8″ below waist)' : '',
        'Hang finished skirt 24 hours before marking the final hem — A-line skirts drop slightly at the sides, especially in lighter fabrics',
        opts.hem === 'faced' ? '{understitch} hem facing before pressing to WS — prevents it from rolling to the outside when wearing' : '{clip} hem SA every ½–1″ on curved sections to allow it to lie flat',
        'For structured waistband: stitch in the ditch from RS to secure WS edge invisibly',
      ].filter(Boolean),
    });
  },

  instructions(m, opts) {
    const steps = [];
    let n = 1;

    steps.push({ step: n++, title: 'Stay-stitch waist and hip', detail: 'Stitch ½″ from waist on both panels. Also stay-stitch ½″ from side seams at hip level. This prevents the bias areas from stretching during construction.' });
    steps.push({ step: n++, title: 'Sew waist darts', detail: 'Fold dart RS together, sew from waist to point tapering to nothing. {press} back darts toward CB, front darts toward CF. {clip} at dart base if needed.' });

    if (opts.pockets === 'yes') {
      steps.push({ step: n++, title: 'Attach pocket bags', detail: 'Sew one pocket bag piece to each front side seam SA {RST}. Sew matching piece to each back side seam SA. {press} bags toward front.' });
    }

    if (opts.closure === 'zip') {
      steps.push({ step: n++, title: 'Install invisible zipper', detail: '{press} zip coils. Sew zip to front and back left side seam SAs {RST}, starting at waist. Close remaining seam below zip stop with a regular foot.' });
    }

    steps.push({ step: n++, title: 'Sew side seams', detail: opts.pockets === 'yes' ? 'Sew front to back at right side seam {RST} from waist to hem. For left seam with pockets: sew above and below pocket opening, sew around pocket bag. {press} seams open.' : `Sew front to back at both side seams {RST}. {press} open.${opts.closure === 'zip' ? ' Left side seam already sewn below zip.' : ''}` });

    if (opts.lining === 'yes') {
      steps.push({ step: n++, title: 'Assemble lining', detail: 'Sew lining darts and side seams. If applicable, leave left side seam open for zip. {press}.' });
    }

    if (opts.waistband === 'structured') {
      steps.push({ step: n++, title: 'Attach waistband', detail: 'Interface waistband. Sew one long edge to waist {RST}, matching CF/CB. Grade SA. {press} up. Fold over, {press} under ⅝″ on inner edge. {edgestitch} or {slipstitch} inner edge to WS.' });
    } else {
      steps.push({ step: n++, title: 'Attach elastic casing', detail: 'Fold casing in half lengthwise {WST}. Sew to waist {RST}. Fold inside, {topstitch} leaving 2″ gap. Thread elastic (waist − 1″). Overlap 1″, {zigzag}. Close gap.' });
    }

    if (opts.lining === 'yes') {
      steps.push({ step: n++, title: 'Attach lining at waist', detail: 'Fold under top edge of lining ⅝″. {slipstitch} to WS of waistband seam. Tack side seams together. Let hem float free.' });
    }

    if (opts.hem === 'faced') {
      steps.push({ step: n++, title: 'Attach hem facing', detail: 'Join front and back hem facing at side seams. Interface. Sew to hem edge {RST}. Grade SA. {clip} curves every ½″. {understitch}. {press} facing to WS. {slipstitch} facing edge to WS.' });
    } else {
      steps.push({ step: n++, title: 'Hang and hem', detail: 'Hang skirt 24 hours on a hanger before marking the hem — mark level from floor with a skirt marker. Trim to even hem allowance. Fold up, {press}, {slipstitch} or {edgestitch}.' });
    }

    steps.push({ step: n++, title: 'Finish', detail: '{press} entire skirt with a pressing cloth. Check side seams are pressed open and darts lie flat.' });

    return steps;
  },
};
