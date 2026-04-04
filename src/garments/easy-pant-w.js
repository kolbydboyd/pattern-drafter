// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Easy Pant (Womenswear) — pull-on with no fly, no zipper, elastic waist.
 * 29″ default inseam, 10″ rise. Relaxed ease +4″.
 * Great beginner project — 5 construction steps.
 * Fabric: rayon challis, linen, cotton lawn, viscose, ponte, french terry.
 */

import {
  edgeAngle, crotchCurvePoints, sampleBezier, offsetPolygon, polyToPath,
  fmtInches, insetCrotchBezier,
} from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

export default {
  id: 'easy-pant-w',
  name: 'Easy Pant (W)',
  category: 'lower',
  difficulty: 'beginner',
  priceTier: 'simple',
  measurements: ['waist', 'hip', 'rise', 'thigh', 'inseam'],
  measurementDefaults: { inseam: 29, rise: 10 },

  options: {
    legShape: {
      type: 'select', label: 'Leg shape',
      values: [
        { value: 'wide',     label: 'Wide leg',     reference: 'Yohji, palazzo' },
        { value: 'straight', label: 'Straight leg', reference: '501, regular'   },
        { value: 'tapered',  label: 'Tapered leg'  },
      ],
      default: 'wide',
    },
    riseStyle: {
      type: 'select', label: 'Rise style',
      values: [
        { value: 'ultra-low',  label: 'Ultra low (2000s, −2.5″)'  },
        { value: 'low',        label: 'Low rise (−1.5″)'           },
        { value: 'mid',        label: 'Mid rise (body rise)'       },
        { value: 'high',       label: 'High rise (+1.5″)'          },
        { value: 'ultra-high', label: 'Ultra high (paperbag, +3″)' },
      ],
      default: 'high',
    },
    riseOverride: { type: 'number', label: 'Rise override (inches)', default: 0, step: 0.25, min: 0, max: 18 },
    waistband: {
      type: 'select', label: 'Waistband',
      values: [
        { value: 'elastic',    label: 'Elastic casing 1.5″ (fold-over)', reference: 'chef pant, pull-on'   },
        { value: 'yoga',       label: 'Yoga fold-over knit band 3″',     reference: 'yoga pant, activewear' },
      ],
      default: 'elastic',
    },
    pockets: {
      type: 'select', label: 'Pockets',
      values: [
        { value: 'side', label: 'Side-seam pockets', reference: 'hidden, clean' },
        { value: 'none', label: 'None',              reference: 'minimal'       },
      ],
      default: 'side',
    },
    frontPocket: {
      type: 'select', label: 'Front pockets',
      values: [
        { value: 'none',  label: 'None'             },
        { value: 'slant', label: 'Slant (western)' },
        { value: 'side',  label: 'Side seam'       },
      ],
      default: 'none',
    },
    hemStyle: {
      type: 'select', label: 'Hem',
      values: [
        { value: 'straight', label: 'Straight (clean hem)'     },
        { value: 'elastic',  label: 'Elastic / jogger cuff'    },
        { value: 'rolled',   label: 'Rolled (lightweight only)'},
      ],
      default: 'straight',
    },
    frontExt: { type: 'number', label: 'Front crotch ext', default: 1.5,  step: 0.25, min: 0.5, max: 3   },
    backExt:  { type: 'number', label: 'Back crotch ext',  default: 2.5,  step: 0.25, min: 1,   max: 4.5 },
    cbRaise:  { type: 'number', label: 'CB raise',         default: 0.5,  step: 0.25, min: 0,   max: 1.5 },
    sa: {
      type: 'select', label: 'Seam allowance',
      values: [
        { value: 0.5,   label: '½″' },
        { value: 0.625, label: '⅝″' },
      ],
      default: 0.5,
    },
    hem: {
      type: 'select', label: 'Hem allowance',
      values: [
        { value: 0.75, label: '¾″' },
        { value: 1,    label: '1″' },
      ],
      default: 0.75,
    },
  },

  pieces(m, opts) {
    const easeVal   = 4;
    const easeFront = easeVal * 0.45;
    const easeBack  = easeVal * 0.55;

    const sa       = parseFloat(opts.sa);
    const hem      = parseFloat(opts.hem);
    const frontExt = parseFloat(opts.frontExt);
    const backExt  = parseFloat(opts.backExt);
    const cbRaise  = parseFloat(opts.cbRaise);
    const RISE_OFFSETS = { 'ultra-low': -2.5, low: -1.5, mid: 0, high: 1.5, 'ultra-high': 3.0 };
    const baseRise  = m.rise || 10;
    const riseOff   = RISE_OFFSETS[opts.riseStyle] ?? 0;
    const rise      = parseFloat(opts.riseOverride) || (baseRise + riseOff);
    const inseam   = m.outseam ? Math.max(1, m.outseam - rise) : (m.inseam || 29);

    const frontW = m.hip / 4 + easeFront;
    const backW  = m.hip / 4 + easeBack;
    const H      = rise + inseam;

    // Leg shape taper at hem
    const shape = opts.legShape === 'tapered'
      ? { knee: 0.88, hem: 0.70 }
      : opts.legShape === 'wide'
        ? { knee: 1.0, hem: 1.05 }
        : { knee: 0.95, hem: 0.95 }; // straight slight taper

    const kneeY = rise + inseam * 0.55;

    function buildPanel(type, isBack, width, ext) {
      const ccp      = crotchCurvePoints(0, 0, rise, ext, isBack, cbRaise);
      const curvePts = sampleBezier(ccp.p0, ccp.p1, ccp.p2, ccp.p3, 96);

      const kneeW   = m.calf  ? m.calf  / 2 + 0.5 : width * shape.knee;
      const hemW    = m.ankle ? m.ankle / 2 + 0.5 : width * shape.hem;
      const kIn     = (width - kneeW) * 0.5;
      const hIn     = (width - hemW)  * 0.5;
      const skX     = width - kIn,  shkX = width - hIn;
      const ikX     = -ext + kIn,   ihX  = -ext + hIn;

      const poly = [];
            poly.push({ x: 0,     y: 0       });
      poly.push({ x: width, y: 0     });
      poly.push({ x: skX,   y: kneeY });
      poly.push({ x: shkX,  y: H     });
      poly.push({ x: ihX,   y: H     });
      poly.push({ x: ikX,   y: kneeY });
      poly.push({ x: -ext,  y: rise  });
      for (let i = curvePts.length - 2; i >= 1; i--) poly.push({ ...curvePts[i], curve: true });
  if (isBack && cbRaise > 0) poly.push({ x: 0, y: cbRaise }); // CB seam top

      const saPoly = offsetPolygon(poly, (i, a, b) => {
        if (Math.abs(a.y - H) < 0.5 && Math.abs(b.y - H) < 0.5) return -hem;
        return -sa;
      });

      const effSeatDepth = m.seatDepth || 7;
      const notches = [
        { x: width, y: effSeatDepth, angle: edgeAngle({ x: width, y: 0 }, { x: skX, y: kneeY }) },
        { x: -ext,  y: rise,         angle: edgeAngle({ x: ikX, y: kneeY }, { x: -ext, y: rise }) },
        { x: skX,   y: kneeY,        angle: edgeAngle({ x: width, y: 0 }, { x: skX, y: kneeY }) },
        { x: ikX,   y: kneeY,        angle: edgeAngle({ x: -ext, y: rise }, { x: ikX, y: kneeY }) },
      ];

      return {
        id: type, name: type === 'front' ? 'Front Panel' : 'Back Panel',
        instruction: `Cut 2 (mirror L & R)`,
        polygon: poly, saPolygon: saPoly,
        path: polyToPath(poly), saPath: polyToPath(saPoly),
        dimensions: [
          { label: fmtInches(width),            x1: 0, y1: -0.5, x2: width, y2: -0.5, type: 'h' },
          { label: fmtInches(rise) + ' rise',   x: width + 1.2, y1: 0, y2: rise,      type: 'v' },
          { label: fmtInches(inseam) + ' inseam', x: width + 1.2, y1: rise, y2: H,   type: 'v' },
          { label: fmtInches(m.seatDepth || 7) + ' seat', x: -ext - 1.2, y1: 0, y2: m.seatDepth || 7, type: 'v', color: '#b8963e' },
        ],
        width, height: H, rise, inseam, ext, cbRaise, sa, hem, isBack,
        labels: [
          { text: 'SIDE SEAM', x: width + 0.3, y: H * 0.35,  rotation: 90  },
          { text: 'CENTER',    x: -0.5,         y: rise * 0.3, rotation: -90 },
        ],
        notches, crotchBezier: ccp,
        // LOCKED — crotch curve cut & stitch lines are finalized. Do not modify
        // crotchBezier, crotchBezierSA, or their rendering in pattern-view.js.
        crotchBezierSA: insetCrotchBezier(ccp, sa), type: 'panel', opts,
      };
    }

    const pieces = [
      buildPanel('front', false, frontW, frontExt),
      buildPanel('back',  true,  backW,  backExt),
    ];

    const wbCirc = m.hip + easeVal + sa * 2;
    const pantOpening = (frontW + backW) * 2;
    if (opts.waistband === 'elastic') {
      pieces.push({ id: 'waistband', name: 'Waistband (Elastic Casing)', instruction: `Cut 1 · Fold-over casing · 3″ cut (1.5″ finished × 2) · Thread 1″ elastic = waist − 2″`, dimensions: { length: wbCirc, width: 3 }, type: 'rectangle', sa });
    } else {
      const yogaLen = Math.round(pantOpening * 0.85 * 4) / 4;
      pieces.push({ id: 'waistband', name: 'Yoga Band (Knit)', instruction: `Cut 1 from rib or ponte on fold · ${fmtInches(yogaLen)} long × 6″ cut (3″ finished fold-over) · Stretch 15% to meet pant opening (${fmtInches(pantOpening)})`, dimensions: { length: yogaLen, width: 6 }, type: 'rectangle', sa });
    }

    if (opts.pockets === 'side') {
      pieces.push({ id: 'side-bag', name: 'Side-Seam Pocket Bag', instruction: 'Cut 4 (2 per side) · Same fabric or lining', dimensions: { width: 7, height: 9 }, type: 'pocket' });
    }

    if (opts.frontPocket === 'slant') {
      pieces.push({ id: 'slant-facing', name: 'Slant Pocket Facing', instruction: 'Cut 2 (1 + 1 mirror — flip fabric for second) · Match fabric or lining · {serge} before attaching', dimensions: { width: 2, height: 6.5 }, type: 'pocket' });
      pieces.push({ id: 'slant-bag',    name: 'Slant Pocket Bag',    instruction: 'Cut 2 (1 + 1 mirror) · Lining fabric · {serge} all edges', dimensions: { width: 7, height: 13.5 }, type: 'pocket' });
    }
    if (opts.frontPocket === 'side' && opts.pockets !== 'side') {
      pieces.push({ id: 'side-bag', name: 'Side-Seam Pocket Bag', instruction: 'Cut 4 (2 per side)', dimensions: { width: 7, height: 9 }, type: 'pocket' });
    }

    if (opts.hemStyle === 'elastic') {
      const hemOpening = frontW * shape.hem * 2 * 0.85;
      pieces.push({ id: 'hem-cuff', name: 'Hem Cuff (Elastic / Rib)', instruction: `Cut 2 · ${fmtInches(hemOpening)} long × 4″ cut (2″ finished) · Stretch to fit opening`, dimensions: { width: hemOpening, height: 4 }, type: 'pocket' });
    }

    return pieces;
  },

  materials(m, opts) {
    const isKnit = opts.waistband === 'yoga';
    const notions = [
      { name: 'Elastic 1″', quantity: `${Math.round(m.waist - 2)}″`, notes: 'Non-roll elastic - waist − 2″ for snug fit' },
    ];

    return buildMaterialsSpec({
      fabrics: ['rayon-challis', 'linen-light', 'cotton-lawn', 'ponte'],
      notions,
      thread: 'poly-all',
      needle: isKnit ? 'ballpoint-80' : 'universal-80',
      stitches: isKnit ? ['stretch', 'overlock', 'zigzag-med'] : ['straight-2.5', 'zigzag-small'],
      notes: [
        'Great beginner project - only 5 seams total before the waistband and hem',
        'Use universal 80/12 for wovens (rayon, linen, lawn); ballpoint 80/12 for knit ponte or jersey',
        isKnit ? 'For knit fabric: use stretch stitch or serger for ALL seams - straight stitch will pop when stretched' : 'Drapey wovens: stay-stitch waist and hip curves before assembling to prevent bias stretch',
        'Elastic waist: cut elastic at waist measurement minus 2″ for a comfortable snug fit that doesn\'t dig in',
        'Pre-wash rayon and viscose - they can shrink 3–5% and the dye may bleed in the first wash',
      ],
    });
  },

  instructions(m, opts) {
    const steps = [];
    let n = 1;

    if (opts.pockets === 'side') {
      steps.push({ step: n++, title: 'Prepare side-seam pockets', detail: 'Sew each pocket bag pair together along curved edge {RST}. {baste} flat edges to front and back side seam SAs at pocket position (usually hip level).' });
    }
    steps.push({ step: n++, title: 'Sew center front and back seams', detail: 'Join front panels at CF {RST}. Join back panels at CB {RST}. {clip} crotch curves. {press} open or {serge}.' });
    steps.push({ step: n++, title: 'Sew side seams', detail: opts.pockets === 'side' ? 'Sew front to back above and below pocket opening. Sew around pocket bag to join halves. {press} open.' : 'Sew front to back at both side seams {RST}. {press} open.' });
    steps.push({ step: n++, title: 'Sew inseam', detail: 'Sew one continuous seam from front hem through crotch to back hem. {clip} crotch curve. {press} toward back. {serge} or {zigzag}.' });
    steps.push({
      step: n++, title: 'Attach waistband and thread elastic',
      detail: opts.waistband === 'elastic'
        ? 'Fold casing strip in half lengthwise {WST}, {press}. Sew to waist edge {RST}. Fold to inside. {topstitch} leaving a 2″ gap. Thread elastic (waist − 2″) with a {bodkin}. Overlap ends 1″, {zigzag}. Close gap. {topstitch} close to fold.'
        : 'Fold yoga band in half lengthwise {WST}. Divide into quarters, pin to waist. Stretch band slightly to match waist. Sew with stretch stitch. Fold band down to outside of pant for a fold-over yoga waist.',
    });
    steps.push({
      step: n++, title: 'Hem',
      detail: opts.hemStyle === 'elastic'
        ? 'Fold cuff in half {WST}. Sew to hem opening {RST}, stretching to fit. {press} SA into leg.'
        : opts.hemStyle === 'rolled'
          ? 'Roll hem ¼″ twice, {topstitch} with straight stitch. Best on lightweight rayon or lawn.'
          : `Fold up ${fmtInches(parseFloat(opts.hem))} twice, {press}. {topstitch} close to inner fold.`,
    });

    return steps;
  },
};
