// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Circle Skirt (Womenswear) — ring-sector pattern with waistband.
 * Full circle, 3/4 circle, or 1/2 circle fullness options.
 * Waistband and closure options reused from slip-skirt pattern.
 */

import { fmtInches, edgeAngle } from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

// Fullness fractions: what fraction of a full circle (360°) is used
const FULLNESS = {
  full:          1.0,
  'three-quarter': 0.75,
  half:          0.5,
};

export default {
  id: 'circle-skirt-w',
  name: 'Circle Skirt (W)',
  category: 'lower',
  difficulty: 'beginner',
  priceTier: 'simple',
  measurements: ['waist', 'hip', 'skirtLength'],
  measurementDefaults: { skirtLength: 26 },

  options: {
    fullness: {
      type: 'select', label: 'Fullness',
      values: [
        { value: 'full',           label: 'Full circle (360°)',        reference: 'dramatic, twirl skirt'   },
        { value: 'three-quarter',  label: '¾ circle (270°)',           reference: 'classic, versatile'      },
        { value: 'half',           label: 'Half circle (180°)',         reference: 'less fabric, flowy'      },
      ],
      default: 'full',
    },
    panels: {
      type: 'select', label: 'Panel layout',
      values: [
        { value: 'single',  label: 'Single piece (on fold, up to 60″ fabric)' },
        { value: 'two',     label: '2 quarter-circle panels'                   },
        { value: 'four',    label: '4 panels (any fabric width)'               },
      ],
      default: 'two',
    },
    waistband: {
      type: 'select', label: 'Waistband',
      values: [
        { value: 'structured', label: 'Structured band (1.5″ + interfacing)', reference: 'dress, formal'      },
        { value: 'elastic',    label: 'Elastic casing (1″)',                  reference: 'casual, pull-on'   },
        { value: 'petersham',  label: 'Petersham ribbon (1.5″)',              reference: 'petersham, vintage' },
      ],
      default: 'elastic',
    },
    closure: {
      type: 'select', label: 'Closure',
      values: [
        { value: 'zip',      label: 'Invisible zip at CB' },
        { value: 'pullover', label: 'Pullover (elastic only)' },
      ],
      default: 'pullover',
    },
    hem: {
      type: 'select', label: 'Hem finish',
      values: [
        { value: 'narrow',      label: 'Narrow rolled (⅜″)',    reference: 'clean, lightweight fabrics' },
        { value: 'wide',        label: 'Wide (1″ fold)',          reference: 'casual, heavier fabrics'   },
        { value: 'horsehair',   label: 'Horsehair braid',         reference: 'structured, prom/formal'   },
      ],
      default: 'narrow',
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
    const hemAllow = opts.hem === 'wide' ? 1.0 : 0.5;
    const L        = m.skirtLength || 26;
    const frac     = FULLNESS[opts.fullness] ?? 1.0;
    const panels   = parseInt(opts.panels === 'single' ? '1' : opts.panels === 'two' ? '4' : '8', 10);
    // panels here = number of quarter-pieces (for 2-piece layout, each is a 180° sector)
    const sectorCount = opts.panels === 'single' ? 1 : opts.panels === 'two' ? 2 : 4;

    // Inner radius: derived from waist circumference and fullness fraction
    // waist = 2 * PI * r_inner * frac  →  r_inner = waist / (2 * PI * frac)
    const rInner = m.waist / (2 * Math.PI * frac);
    const rOuter = rInner + L;

    // Angle for one sector panel
    const sectorAngle = (2 * Math.PI * frac) / sectorCount; // radians

    // Generate arc polygon for one sector (inner arc + outer arc)
    // For the pattern piece, we represent as a polygon with sampled arc points
    const N_ARC = 24; // points to sample per arc

    function buildSectorPolygon(innerR, outerR, angle) {
      const poly = [];
      // Inner arc: angle 0 → angle, at radius innerR
      for (let i = 0; i <= N_ARC; i++) {
        const theta = (i / N_ARC) * angle;
        poly.push({ x: innerR * Math.cos(theta), y: innerR * Math.sin(theta), curve: true });
      }
      delete poly[0].curve;
      delete poly[poly.length - 1].curve;
      // Outer arc: angle → 0, at radius outerR (reversed)
      for (let i = N_ARC; i >= 0; i--) {
        const theta = (i / N_ARC) * angle;
        poly.push({ x: outerR * Math.cos(theta), y: outerR * Math.sin(theta), curve: true });
      }
      delete poly[N_ARC + 1].curve;
      delete poly[poly.length - 1].curve;
      return poly;
    }

    function polyToPathStr(poly) {
      let d = `M ${poly[0].x.toFixed(2)} ${poly[0].y.toFixed(2)}`;
      for (let i = 1; i < poly.length; i++) d += ` L ${poly[i].x.toFixed(2)} ${poly[i].y.toFixed(2)}`;
      return d + ' Z';
    }

    function bbox(poly) {
      const xs = poly.map(p => p.x), ys = poly.map(p => p.y);
      return { width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys) };
    }

    // Translate polygon so all coords are positive
    function normalizePoly(poly) {
      const minX = Math.min(...poly.map(p => p.x));
      const minY = Math.min(...poly.map(p => p.y));
      return poly.map(p => ({ ...p, x: p.x - minX, y: p.y - minY }));
    }

    const sectorPoly = normalizePoly(buildSectorPolygon(rInner, rOuter, sectorAngle));
    const bb = bbox(sectorPoly);

    const sectorDegrees = Math.round((sectorAngle * 180) / Math.PI);
    const cutCount = sectorCount;

    // Notch: side seam at hip level (~7″ down outer edge)
    const hipNotchTheta = sectorAngle * 0.5;
    const hipNotchR = rInner + 7;
    const minX = Math.min(...buildSectorPolygon(rInner, rOuter, sectorAngle).map(p => p.x));
    const minY = Math.min(...buildSectorPolygon(rInner, rOuter, sectorAngle).map(p => p.y));
    const hipNotch = {
      x: hipNotchR * Math.cos(hipNotchTheta) - minX,
      y: hipNotchR * Math.sin(hipNotchTheta) - minY,
      angle: (hipNotchTheta * 180 / Math.PI) + 90,
    };

    const pieces = [];

    pieces.push({
      id: 'skirt-panel', name: `Skirt Panel (${sectorDegrees}°)`,
      instruction: [
        `Cut ${cutCount}`,
        `Inner radius: ${fmtInches(rInner)} · Outer radius: ${fmtInches(rOuter)}`,
        sectorCount > 1 ? `Sew panels at side seams with ${fmtInches(sa)} SA` : 'Cut on fold',
        `Grain: radial (straight of grain runs waist-to-hem at center front)`,
      ].join(' · '),
      type: 'bodice', polygon: sectorPoly, path: polyToPathStr(sectorPoly),
      width: bb.width, height: bb.height,
      sa, hem: hemAllow,
      notches: [hipNotch],
      edgeAllowances: [
        ...sectorPoly.slice(0, N_ARC + 1).map((_, i) => ({ sa: sa, label: i === 0 || i === N_ARC ? 'Side seam / fold' : 'Waist' })),
        ...sectorPoly.slice(N_ARC + 1).map((_, i) => ({ sa: hemAllow, label: 'Hem' })),
      ],
      dims: [
        { label: fmtInches(rInner) + ' inner radius', x: 0, y1: 0, y2: rInner, type: 'v' },
        { label: fmtInches(rOuter) + ' outer radius', x: bb.width + 0.8, y1: 0, y2: Math.min(rOuter, bb.height), type: 'v' },
        { label: fmtInches(L) + ' length', x: bb.width + 1.8, y1: 0, y2: L, type: 'v', color: '#b8963e' },
      ],
    });

    // Waistband
    const wbCirc = opts.waistband === 'elastic' ? m.hip + 1 + sa * 2 : m.waist + 1 + sa * 2;
    if (opts.waistband === 'petersham') {
      pieces.push({ id: 'waistband', name: 'Petersham Ribbon', instruction: `1.5″ petersham ribbon · ${fmtInches(wbCirc)} long · hook-and-bar at CB`, dimensions: { length: wbCirc, width: 1.5 }, type: 'rectangle', sa });
    } else if (opts.waistband === 'structured') {
      pieces.push({ id: 'waistband', name: 'Structured Waistband', instruction: `Cut 2 (self + interfacing) · ${fmtInches(wbCirc)} long × 3″ cut (1.5″ finished) · Interface fully`, dimensions: { length: wbCirc, width: 3 }, type: 'rectangle', sa });
    } else {
      pieces.push({ id: 'waistband', name: 'Elastic Casing', instruction: `Cut 1 · ${fmtInches(wbCirc)} long × 2.5″ cut · Fold over 1″ elastic = ${Math.round(m.waist * 0.9)}″ (~90% of waist)`, dimensions: { length: wbCirc, width: 2.5 }, type: 'rectangle', sa });
    }

    if (opts.closure === 'zip') {
      const zipLen = Math.ceil(L * 0.45);
      pieces.push({ id: 'cb-zip', name: 'Invisible Zip', instruction: `${zipLen}″ invisible zip · Install at CB before sewing last side seam`, dimensions: { width: 1, height: zipLen }, type: 'pocket', sa });
    }

    return pieces;
  },

  materials(m, opts) {
    const L      = m.skirtLength || 26;
    const frac   = FULLNESS[opts.fullness] ?? 1.0;
    const rInner = m.waist / (2 * Math.PI * frac);
    const rOuter = rInner + L;
    // Fabric yardage: full circle uses 2 × (2 * rOuter) = 4 * rOuter width
    // estimate 1.5× rOuter yards for 2-panel layout, conservatively
    const yardsRaw  = (rOuter * 2) / 36 * frac * 1.2;
    const yards     = Math.ceil(yardsRaw * 4) / 4; // round up to nearest 0.25 yd

    const notions = [];
    if (opts.waistband === 'structured') {
      notions.push({ ref: 'interfacing-med', quantity: '0.25 yard' });
    }
    if (opts.waistband === 'petersham') {
      notions.push({ name: 'Petersham ribbon 1.5″', quantity: `${Math.ceil(m.hip + 2)}″` });
      notions.push({ name: 'Hook and bar', quantity: '1 set' });
    }
    if (opts.closure === 'zip') {
      notions.push({ name: 'Invisible zipper', quantity: `${Math.ceil(L * 0.45)}″` });
    }
    if (opts.hem === 'horsehair') {
      notions.push({ name: 'Horsehair braid ¾″', quantity: `${Math.ceil((rOuter * 2 * Math.PI * frac) / 36 + 1)} yard` });
    }

    return buildMaterialsSpec({
      fabrics: ['cotton-poplin', 'linen', 'cotton-lawn', 'silk', 'chiffon', 'rayon'],
      notions,
      thread: 'poly-all',
      needle: 'universal-70',
      stitches: ['straight-2', 'zigzag-small'],
      notes: [
        `Circle skirts use more fabric than straight skirts — estimate ~${yards} yards based on your measurements`,
        'Hang skirt 24–48 hours before marking hem — the bias-heavy cut will drop significantly',
        'Stay-stitch waist edge immediately after cutting at ½″ to prevent bias stretch',
        opts.fullness === 'full' ? 'Full circle: cut 2 half-circle panels (each on fold) for most efficient fabric use on standard 45–60″ wide fabric' : '',
        opts.hem === 'narrow' ? 'Narrow hem on a circle: machine-roll with rolled hem foot, or hand-roll ¼″ for finest finish' : '',
        'Grain line runs from waist to hem at center front — true bias falls at side seams (expect stretching)',
      ].filter(Boolean),
    });
  },

  instructions(m, opts) {
    const steps = [];
    let n = 1;

    steps.push({ step: n++, title: 'Stay-stitch waist', detail: 'Immediately after cutting, stitch ½″ from waist arc on all panels. Bias cut waist stretches quickly — this prevents distortion.' });

    if (opts.panels !== 'single') {
      steps.push({ step: n++, title: 'Sew panels together', detail: `Join panels at side seams {RST} with ${fmtInches(parseFloat(opts.sa))} SA. ${opts.closure === 'zip' ? 'Leave CB seam open at top for zipper.' : ''} {press} seams open.` });
    }

    if (opts.closure === 'zip') {
      steps.push({ step: n++, title: 'Install invisible zipper', detail: '{press} zip coils flat. Sew zip to CB seam allowances. Attach zip foot. Close remaining CB seam below zip stop.' });
    }

    if (opts.waistband === 'petersham') {
      steps.push({ step: n++, title: 'Attach petersham', detail: 'Sew petersham ribbon to waist edge {RST}, easing any fullness. {press} up. {slipstitch} folded edge to WS. Attach hook and bar at CB.' });
    } else if (opts.waistband === 'structured') {
      steps.push({ step: n++, title: 'Attach structured waistband', detail: 'Interface waistband. Fold in half lengthwise {RST}, sew ends. Turn. Sew one long edge to waist {RST}. Fold over, {slipstitch} other edge to WS.' });
    } else {
      steps.push({ step: n++, title: 'Attach elastic casing', detail: 'Fold casing in half {WST}. Sew to waist {RST}. Fold inside. {topstitch} leaving 2″ gap. Thread elastic. Overlap ends 1″, {zigzag}. Close gap.' });
    }

    steps.push({ step: n++, title: 'Hang and mark hem', detail: 'Hang skirt on a hanger for 24–48 hours. The bias sections will drop. Mark hem at desired length using a hem gauge or have someone mark while you wear the skirt.' });

    steps.push({
      step: n++, title: 'Finish hem',
      detail: opts.hem === 'narrow'
        ? 'Use a rolled hem foot or hand-roll: stitch ⅛″ from edge, trim, roll and {slipstitch}.'
        : opts.hem === 'horsehair'
          ? '{baste} horsehair braid to inside hem fold. {edgestitch} close to fold. Braid creates a subtle flare.'
          : 'Fold hem up 1″ twice, {press}. {slipstitch} or {edgestitch} close to inner fold.',
    });

    steps.push({ step: n++, title: 'Final press', detail: '{press} seams and waistband. Avoid {pressing} the hem flat — the slight loft helps the skirt swing.' });

    return steps;
  },
};
