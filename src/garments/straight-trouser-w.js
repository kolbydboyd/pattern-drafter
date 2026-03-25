/**
 * Straight-Leg Trouser (Womenswear) — classic straight leg with slight knee taper.
 * 30″ default inseam, 10″ default rise (mid-high). Regular ease +3″.
 * Slight taper hip→knee (90%), then straight to hem.
 * Optional pressed center front crease.
 */

import {
  crotchCurvePoints, sampleBezier, offsetPolygon, polyToPath,
  fmtInches,
} from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

const PLEAT_DEPTH = 1.25;

export default {
  id: 'straight-trouser-w',
  name: 'Straight Trouser (W)',
  category: 'lower',
  measurements: ['waist', 'hip', 'rise', 'thigh', 'inseam'],
  measurementDefaults: { inseam: 30, rise: 10 },

  options: {
    riseStyle: {
      type: 'select', label: 'Rise style',
      values: [
        { value: 'ultra-low',  label: 'Ultra low (2000s, −2.5″)'  },
        { value: 'low',        label: 'Low rise (−1.5″)'           },
        { value: 'mid',        label: 'Mid rise (body rise)'       },
        { value: 'high',       label: 'High rise (+1.5″)'          },
        { value: 'ultra-high', label: 'Ultra high (paperbag, +3″)' },
      ],
      default: 'mid',
    },
    riseOverride: { type: 'number', label: 'Rise override (inches)', default: 0, step: 0.25, min: 0, max: 18 },
    ease: {
      type: 'select', label: 'Fit',
      values: [
        { value: 'slim',    label: 'Slim (+2″)'    },
        { value: 'regular', label: 'Regular (+3″)' },
        { value: 'relaxed', label: 'Relaxed (+4″)' },
      ],
      default: 'regular',
    },
    pleats: {
      type: 'select', label: 'Pleats (front only)',
      values: [
        { value: 'none',   label: 'No pleats'    },
        { value: 'single', label: 'Single pleat' },
        { value: 'double', label: 'Double pleat' },
      ],
      default: 'none',
    },
    crease: {
      type: 'select', label: 'Front crease',
      values: [
        { value: 'none',   label: 'No crease'           },
        { value: 'crease', label: 'Pressed center crease' },
      ],
      default: 'crease',
    },
    waistband: {
      type: 'select', label: 'Waistband',
      values: [
        { value: 'structured',  label: 'Structured 1.5″ (button + hook-eye)' },
        { value: 'contoured',   label: 'Contoured / petersham'               },
        { value: 'elastic',     label: 'Elastic casing'                      },
      ],
      default: 'structured',
    },
    pockets: {
      type: 'select', label: 'Front pockets',
      values: [
        { value: 'slant',    label: 'Slant (western)'  },
        { value: 'side',     label: 'Side seam'        },
        { value: 'none',     label: 'None'             },
      ],
      default: 'slant',
    },
    backPockets: {
      type: 'select', label: 'Back pockets',
      values: [
        { value: 'welt2', label: 'Welt ×2' },
        { value: 'none',  label: 'None'    },
      ],
      default: 'welt2',
    },
    fly: {
      type: 'select', label: 'Closure',
      values: [
        { value: 'zip',  label: 'Zip fly'                  },
        { value: 'none', label: 'None (elastic waistband)' },
      ],
      default: 'zip',
    },
    hemStyle: {
      type: 'select', label: 'Hem',
      values: [
        { value: 'straight', label: 'Straight (blind hem)' },
        { value: 'crop',     label: 'Ankle crop (−2″ inseam)' },
      ],
      default: 'straight',
    },
    frontExt: { type: 'number', label: 'Front crotch ext', default: 1.5,  step: 0.25, min: 0.5, max: 3   },
    backExt:  { type: 'number', label: 'Back crotch ext',  default: 2.5,  step: 0.25, min: 1,   max: 4.5 },
    cbRaise:  { type: 'number', label: 'CB raise',         default: 0.75, step: 0.25, min: 0,   max: 2   },
    sa: {
      type: 'select', label: 'Seam allowance',
      values: [
        { value: 0.5,   label: '½″' },
        { value: 0.625, label: '⅝″' },
      ],
      default: 0.625,
    },
    hem: {
      type: 'select', label: 'Hem allowance',
      values: [
        { value: 1.5, label: '1.5″ (blind hem)' },
        { value: 2,   label: '2″'               },
      ],
      default: 1.5,
    },
  },

  pieces(m, opts) {
    const easeVal   = opts.ease === 'slim' ? 2 : opts.ease === 'relaxed' ? 4 : 3;
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
    const inseam = (m.inseam || 30) - (opts.hemStyle === 'crop' ? 2 : 0);

    const numPleats  = opts.pleats === 'double' ? 2 : opts.pleats === 'single' ? 1 : 0;
    const pleatExtra = numPleats * PLEAT_DEPTH;

    const frontW = m.hip / 4 + easeFront + pleatExtra;
    const backW  = m.hip / 4 + easeBack;
    const H      = rise + inseam;

    // Knee taper: 90% of panel width at knee level
    const kneeFactor = 0.90;
    const kneeY      = rise + inseam * 0.55;

    const pieces = [];

    pieces.push(buildPanel({
      type: 'front', name: 'Front Panel',
      instruction: `Cut 2 (mirror L & R)${numPleats > 0 ? ` · ${numPleats === 2 ? 'Double' : 'Single'} pleat toward side seam` : ''}${opts.hemStyle === 'crop' ? ' · Ankle crop — inseam reduced 2″' : ''}`,
      width: frontW, height: H, rise, inseam, kneeY, kneeFactor,
      ext: frontExt, cbRaise: 0, sa, hem, isBack: false, opts,
    }));

    pieces.push(buildPanel({
      type: 'back', name: 'Back Panel',
      instruction: `Cut 2 (mirror L & R) · CB raised ${fmtInches(cbRaise)}`,
      width: backW, height: H, rise, inseam, kneeY, kneeFactor,
      ext: backExt, cbRaise, sa, hem, isBack: true, opts,
    }));

    const wbCirc = m.hip + easeVal + pleatExtra * 2 + sa * 2;

    if (opts.waistband === 'structured') {
      pieces.push({ id: 'waistband', name: 'Waistband (Structured)', instruction: 'Cut 1 · Interface · 1.5″ finished · Button + hook-and-eye · 1″ CF overlap', dimensions: { length: wbCirc, width: 3 }, type: 'rectangle', sa });
    } else if (opts.waistband === 'elastic') {
      pieces.push({ id: 'waistband', name: 'Waistband (Elastic Casing)', instruction: `Cut 1 · 2.5″ cut (1.25″ casing) · Thread 1″ elastic = waist − 1″`, dimensions: { length: wbCirc, width: 2.5 }, type: 'rectangle', sa });
    } else {
      pieces.push({ id: 'waistband', name: 'Waistband (Contoured)', instruction: 'Cut 2 (outer + facing) · Interface outer · 1.5″ finished · Curve to match waist · Hook-and-eye', dimensions: { length: wbCirc, width: 3 }, type: 'rectangle', sa });
    }

    if (opts.fly === 'zip') {
      pieces.push({ id: 'fly-shield', name: 'Fly Shield', instruction: 'Cut 1 · Interface · Serge edge', dimensions: { width: 2.5, height: rise }, type: 'pocket' });
    }
    if (opts.pockets === 'slant') {
      pieces.push({ id: 'slant-facing', name: 'Slant Pocket Facing', instruction: 'Cut 2 · Interface', dimensions: { width: 2, height: 7 }, type: 'pocket' });
      pieces.push({ id: 'slant-bag',    name: 'Slant Pocket Bag',    instruction: 'Cut 2 · Lining fabric', dimensions: { width: 7, height: 9 }, type: 'pocket' });
    } else if (opts.pockets === 'side') {
      pieces.push({ id: 'side-bag', name: 'Side-Seam Pocket Bag', instruction: 'Cut 4 (2 per side) · Lining fabric', dimensions: { width: 7, height: 9 }, type: 'pocket' });
    }
    if (opts.backPockets === 'welt2') {
      pieces.push({ id: 'back-welt', name: 'Back Welt Pocket', instruction: 'Cut 4 (2 welts + 2 bags) · ×2 pockets total', dimensions: { width: 5.5, height: 6 }, type: 'pocket' });
    }

    return pieces;
  },

  materials(m, opts) {
    const rise = parseFloat(opts.rise) || m.rise || 10;
    const notions = [
      { ref: 'interfacing-light', quantity: '0.5 yard (waistband + pocket facings)' },
    ];
    if (opts.fly === 'zip') {
      notions.push({ name: 'Invisible zipper', quantity: `${Math.ceil(rise * 0.65)}″`, notes: 'Invisible (lapped) for clean finish' });
      notions.push({ name: 'Waistband button', quantity: '1', notes: '¾″ button or hook' });
      notions.push({ name: 'Hook-and-eye', quantity: '1 set', notes: 'Size 2 at waistband overlap' });
    }
    if (opts.waistband === 'elastic') {
      notions.push({ name: 'Elastic 1″', quantity: `${Math.round(m.waist - 1)}″`, notes: 'Non-roll elastic' });
    }

    return buildMaterialsSpec({
      fabrics: ['wool-suiting', 'cotton-twill', 'ponte'],
      notions,
      thread: 'poly-all',
      needle: 'universal-80',
      stitches: ['straight-2.5', 'straight-3', 'zigzag-small', 'blindhem'],
      notes: [
        'Use universal 80/12 for cotton twill; 90/14 for wool suiting; ballpoint 90/14 for ponte/stretch',
        'Stay-stitch waist ⅝″ from edge before attaching waistband to prevent stretching',
        'Press pleats with steam from WS — press cloth on wool and twill to prevent shine',
        'Grade seam allowances at waistband seam before turning to reduce bulk',
        opts.crease === 'crease' ? 'Front crease: fold each front leg so the inseam aligns with the side seam, press a sharp crease from waist to hem. Use a press cloth and heavy steam. Re-press after washing.' : '',
        opts.hemStyle === 'crop' ? 'Crop length: inseam is 2″ shorter than measurement for ankle-grazing fit. Fit before hemming.' : 'Trouser break: fit while wearing intended shoes — mark hem at top of shoe with ½–¾″ break.',
      ].filter(Boolean),
    });
  },

  instructions(m, opts) {
    const steps = [];
    let n = 1;
    const numPleats = opts.pleats === 'double' ? 2 : opts.pleats === 'single' ? 1 : 0;
    const hasFly    = opts.fly === 'zip';

    if (opts.backPockets === 'welt2') {
      steps.push({ step: n++, title: 'Prepare back welt pockets', detail: 'Mark positions 2.5″ below waist, centered. Sew welts, slash, turn, press. Attach bags. Whipstitch sides. Bar tack ends.' });
    }
    if (opts.pockets === 'slant') {
      steps.push({ step: n++, title: 'Prepare slant pockets', detail: 'Interface facing. Sew to front slash (RST). Clip, turn, press. Understitch. Attach bag. Baste edges.' });
    } else if (opts.pockets === 'side') {
      steps.push({ step: n++, title: 'Prepare side-seam pockets', detail: 'Sew bag pairs together on curved edge. Baste straight edges to front and back side seam SAs at pocket position.' });
    }
    if (numPleats > 0) {
      steps.push({ step: n++, title: `Form front pleat${numPleats === 2 ? 's' : ''}`, detail: `Fold each pleat toward side seam enclosing ${fmtInches(PLEAT_DEPTH)}. Baste at waist. Press first 5–6″ with steam and press cloth. Below hip, allow to drape freely.` });
    }
    steps.push({ step: n++, title: 'Stay-stitch waist', detail: 'Stitch ⅝″ from waist edge on all pieces directionally — prevents stretching while handling.' });
    if (hasFly) {
      steps.push({ step: n++, title: 'Install invisible zip fly', detail: 'Sew CF seam below fly opening only. Install invisible zipper to right CF opening. Attach fly shield to left CF behind zipper. Topstitch fly curve from RS at 1″.' });
    } else {
      steps.push({ step: n++, title: 'Sew center front seam', detail: 'Join fronts at CF. Clip curve. Press open. Serge.' });
    }
    steps.push({ step: n++, title: 'Sew center back seam', detail: 'Join backs at CB. Clip curve. Press open. Serge each side.' });
    steps.push({ step: n++, title: 'Sew side seams', detail: 'Join front to back at side seams (RST). Press open. Serge each SA separately.' });
    steps.push({ step: n++, title: 'Sew inseam', detail: 'Continuous seam from front hem to back hem through crotch. Clip curve. Press toward back. Serge.' });
    if (opts.waistband === 'structured' || opts.waistband === 'contoured') {
      steps.push({ step: n++, title: 'Attach waistband', detail: 'Interface waistband. Sew to trouser waist (RST). Fold over. Grade SA in layers before turning. Slipstitch or edgestitch inside. Install button and hook-and-eye.' });
    } else {
      steps.push({ step: n++, title: 'Attach elastic waistband', detail: 'Fold casing in half (WST). Sew to waist (RST). Fold to inside, topstitch leaving 2″ gap at CB. Thread elastic (waist − 1″). Overlap ends 1″, zigzag. Close gap.' });
    }
    if (opts.crease === 'crease') {
      steps.push({ step: n++, title: 'Press front creases', detail: 'Fold each front leg so the inseam lies exactly on top of the side seam. Press a sharp crease from waist to hem using heavy steam and a press cloth. The crease should run straight down the center of each leg.' });
    }
    steps.push({ step: n++, title: 'Hem — fit first', detail: `Try on with intended shoes. Mark hem at break point. Fold up ${fmtInches(parseFloat(opts.hem))} twice, press. Hand sew with blind hem stitch for an invisible finish.` });
    steps.push({ step: n++, title: 'Finish', detail: 'Press entire garment. Bar tack all pocket openings and crotch junction.' });

    return steps;
  },
};


function buildPanel({ type, name, instruction, width, height, rise, inseam, kneeY, kneeFactor, ext, cbRaise, sa, hem, isBack, opts }) {
  const ccp      = crotchCurvePoints(0, 0, rise, ext, isBack, cbRaise);
  const curvePts = sampleBezier(ccp.p0, ccp.p1, ccp.p2, ccp.p3, 16);

  // Knee taper: inward on both sides from hip to knee, straight from knee to hem
  const kneeInward  = (width - width * kneeFactor) * 0.5;
  const sideKneeX   = width - kneeInward;
  const inseamKneeX = -ext + kneeInward;

  const poly = [];
  poly.push({ x: 0,            y: cbRaise });
  if (isBack) poly.push({ x: width * 0.5, y: cbRaise * 0.15 });
  poly.push({ x: width,        y: 0       });
  poly.push({ x: sideKneeX,   y: kneeY   });
  poly.push({ x: sideKneeX,   y: height  });
  poly.push({ x: inseamKneeX, y: height  });
  poly.push({ x: inseamKneeX, y: kneeY   });
  poly.push({ x: -ext,        y: rise    });
  for (let i = curvePts.length - 2; i >= 0; i--) poly.push(curvePts[i]);

  const saPoly = offsetPolygon(poly, pt => (pt.y > height - 0.5 ? hem : sa));

  const dims = [
    { label: fmtInches(width),              x1: 0,           y1: -0.5,       x2: width,        y2: -0.5,       type: 'h' },
    { label: fmtInches(width * kneeFactor) + ' knee', x1: inseamKneeX, y1: kneeY + 0.4, x2: sideKneeX, y2: kneeY + 0.4, type: 'h', color: '#b8963e' },
    { label: fmtInches(rise)   + ' rise',   x: width + 1.2, y1: 0,           y2: rise,                          type: 'v' },
    { label: fmtInches(inseam) + ' inseam', x: width + 1.2, y1: rise,        y2: height,                        type: 'v' },
    { label: fmtInches(height) + ' total',  x: width + 2.3, y1: 0,           y2: height,                        type: 'v' },
    { label: fmtInches(ext)    + ' ext',    x1: -ext,       y1: rise + 0.4,  x2: 0,            y2: rise + 0.4,  type: 'h', color: '#c44' },
  ];

  return {
    id: type, name, instruction,
    polygon: poly, saPolygon: saPoly,
    path: polyToPath(poly), saPath: polyToPath(saPoly),
    dimensions: dims, width, height, rise, inseam, ext, cbRaise, sa, hem, isBack,
    labels: [
      { text: 'SIDE SEAM', x: width + 0.3, y: height * 0.35, rotation: 90  },
      { text: 'CENTER',    x: -0.5,         y: rise   * 0.3,  rotation: -90 },
    ],
    type: 'panel', opts,
  };
}
