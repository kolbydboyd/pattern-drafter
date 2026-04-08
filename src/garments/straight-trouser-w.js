// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Straight-Leg Trouser (Womenswear) — classic straight leg with slight knee taper.
 * 30″ default inseam, 10″ default rise (mid-high). Regular ease +3″.
 * Slight taper hip→knee (90%), then straight to hem.
 * Optional pressed center front crease.
 */

import {
  edgeAngle, crotchCurvePoints, sampleBezier, offsetPolygon, polyToPath,
  fmtInches, easeDistribution, insetCrotchBezier,
  buildSlantPocketBag, buildSlantPocketBacking, clipPanelAtSlash,
} from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

const PLEAT_DEPTH = 1.25;

export default {
  id: 'straight-trouser-w',
  name: 'Straight Trouser (W)',
  category: 'lower',
  difficulty: 'intermediate',
  priceTier: 'core',
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
        { value: 'slim',    label: 'Slim (+2.5\u2033) , stretch fabric only',    reference: 'fitted, tailored'    },
        { value: 'regular', label: 'Regular (+4\u2033)', reference: 'classic, off-the-rack' },
        { value: 'relaxed', label: 'Relaxed (+6\u2033)', reference: 'skater, workwear'      },
      ],
      default: 'regular',
    },
    pleats: {
      type: 'select', label: 'Pleats (front only)',
      values: [
        { value: 'none',   label: 'No pleats',    reference: 'flat front, modern' },
        { value: 'single', label: 'Single pleat', reference: 'classic, Italian'   },
        { value: 'double', label: 'Double pleat', reference: 'full, Savile Row'   },
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
        { value: 'structured',  label: 'Structured 1.5″ (button + hook-eye)', reference: 'dress trouser, Dickies' },
        { value: 'contoured',   label: 'Contoured / petersham',               reference: 'petersham, contoured'  },
        { value: 'elastic',     label: 'Elastic casing',                      reference: 'chef pant, pull-on'    },
      ],
      default: 'structured',
    },
    elasticWidth: {
      type: 'select', label: 'Elastic width',
      values: [
        { value: 0.75, label: '¾″ (1¾″ finished waistband → 3½″ cut)' },
        { value: 1,    label: '1″ (2″ finished waistband → 4″ cut)' },
        { value: 1.5,  label: '1½″ (2½″ finished waistband → 5″ cut)' },
        { value: 2,    label: '2″ (3″ finished waistband → 6″ cut)' },
      ],
      default: 1,
      showWhen: { waistband: 'elastic' },
    },
    pockets: {
      type: 'select', label: 'Front pockets',
      values: [
        { value: 'slant',    label: 'Slant (western)',  reference: 'chino, Western' },
        { value: 'side',     label: 'Side seam',        reference: 'hidden, clean'  },
        { value: 'none',     label: 'None',             reference: 'minimal'        },
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
    backExt:  { type: 'number', label: 'Back crotch ext',  default: 2.75, step: 0.25, min: 1,   max: 4.5 },
    cbRaise:  { type: 'number', label: 'CB raise',         default: 1.25, step: 0.25, min: 0,   max: 2   },
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
    const easeVal = opts.ease === 'slim' ? 2.5 : opts.ease === 'relaxed' ? 6 : 4;
    const ease    = easeDistribution(easeVal);

    const sa       = parseFloat(opts.sa);
    const hem      = parseFloat(opts.hem);
    const frontExt = parseFloat(opts.frontExt);
    const backExt  = parseFloat(opts.backExt);
    const cbRaise  = parseFloat(opts.cbRaise);

    const RISE_OFFSETS = { 'ultra-low': -2.5, low: -1.5, mid: 0, high: 1.5, 'ultra-high': 3.0 };
    const baseRise  = m.rise || 10;
    const riseOff   = RISE_OFFSETS[opts.riseStyle] ?? 0;
    const crotchEase = 1.25; // ease below body rise — prevents fabric pulling tight against crotch
    const rawRise   = parseFloat(opts.riseOverride) || (baseRise + riseOff);
    const rise      = rawRise + crotchEase;
    const baseInseam = m.inseam || (m.outseam ? Math.max(1, m.outseam - rise) : 30);
    const inseam = baseInseam - (opts.hemStyle === 'crop' ? 2 : 0);

    const numPleats  = opts.pleats === 'double' ? 2 : opts.pleats === 'single' ? 1 : 0;
    const pleatExtra = numPleats * PLEAT_DEPTH;

    let frontHipW   = m.hip / 4 + ease.front + 0.5 + pleatExtra;
    let backHipW    = m.hip / 4 + ease.back;

    // Thigh ease check
    if (m.thigh) {
      const patternThigh = (frontHipW + backHipW + frontExt + backExt) * 2;
      const minThigh = m.thigh * 2 + 3;
      if (patternThigh < minThigh) {
        const perPanel = (minThigh - patternThigh) / 4;
        frontHipW += perPanel;
        backHipW += perPanel;
        console.warn(`[straight-trouser-w] Thigh ease insufficient (${(patternThigh - m.thigh * 2).toFixed(1)}″) — widened panels by ${perPanel.toFixed(2)}″ each`);
      } else if (patternThigh - m.thigh * 2 < 2) {
        console.warn(`[straight-trouser-w] Thigh ease is tight: ${(patternThigh - m.thigh * 2).toFixed(1)}″ (recommend ≥ 2″)`);
      }
    }

    const frontWaistW = m.waist / 4 + ease.front + pleatExtra;
    const backWaistW  = m.waist / 4 + ease.back;
    const hipLineY    = m.seatDepth || 7;
    const H           = rise + inseam;

    // Knee taper: 90% of panel width at knee level
    const kneeFactor = 0.90;
    const kneeY      = rise + inseam * 0.55;

    const pieces = [];

    pieces.push(buildPanel({
      type: 'front', name: 'Front Panel',
      instruction: `Cut 2 (mirror L & R)${numPleats > 0 ? ` · ${numPleats === 2 ? 'Double' : 'Single'} pleat toward side seam` : ''}${opts.hemStyle === 'crop' ? ' · Ankle crop (inseam reduced 2″)' : ''}`,
      waistWidth: frontWaistW, hipWidth: frontHipW, hipLineY,
      height: H, rise, inseam, kneeY, kneeFactor,
      ext: frontExt, cbRaise: 0, sa, hem, isBack: false, numPleats, pleatDepth: PLEAT_DEPTH, opts,
      calf: m.calf, seatDepth: m.seatDepth,
    }));

    const backDartIntake = backHipW - backWaistW;

    pieces.push(buildPanel({
      type: 'back', name: 'Back Panel',
      instruction: `Cut 2 (mirror L & R) · CB raised ${fmtInches(cbRaise)}`,
      waistWidth: backWaistW + backDartIntake, hipWidth: backHipW, hipLineY,
      dartIntake: backDartIntake,
      height: H, rise, inseam, kneeY, kneeFactor,
      ext: backExt, cbRaise, sa, hem, isBack: true, opts,
      calf: m.calf, seatDepth: m.seatDepth,
    }));

    // Elastic waistband matches garment waist opening (sum of panel tops).
    // Structured/contoured sits at body waist measurement.
    const garmentWaist = (frontHipW + backHipW) * 2;
    const wbCirc = (opts.waistband === 'elastic') ? garmentWaist + sa * 2 : m.waist + ease.total + pleatExtra * 2 + sa * 2;

    if (opts.waistband === 'structured') {
      pieces.push({ id: 'waistband', name: 'Waistband (Structured)', instruction: 'Cut 1 · Interface · 1.5″ finished · Button + hook-and-eye · 1″ CF overlap', dimensions: { length: wbCirc, width: 3 }, type: 'rectangle', sa });
    } else if (opts.waistband === 'elastic') {
      const elasticW = parseFloat(opts.elasticWidth) || 1;
      const wbWidth = (elasticW + 1) * 2;
      pieces.push({ id: 'waistband', name: 'Waistband (Elastic Casing)', instruction: `Cut 1 · ${fmtInches(wbWidth)} cut (${fmtInches(wbWidth / 2)} casing) · Thread ${fmtInches(elasticW)} elastic = ${Math.round(m.waist * 0.9)}″ (~90% of waist)`, dimensions: { length: wbCirc, width: wbWidth }, type: 'rectangle', sa });
    } else {
      pieces.push({ id: 'waistband', name: 'Waistband (Contoured)', instruction: 'Cut 2 (outer + facing) · Interface outer · 1.5″ finished · Curve to match waist · Hook-and-eye', dimensions: { length: wbCirc, width: 3 }, type: 'rectangle', sa });
    }

    if (opts.fly === 'zip') {
      pieces.push({ id: 'fly-shield', name: 'Fly Shield', instruction: 'Cut 1 · Interface · {serge} edge', dimensions: { width: 2.5, height: rise }, type: 'pocket', sa });
    }
    if (opts.pockets === 'slant') {
      pieces.push(buildSlantPocketBacking({ bagWidth: 7, slashInset: 3.5, slashDepth: 7, bagDepth: 12, sa, instruction: 'Cut 2 (1 + 1 mirror) \xb7 Self fabric \xb7 Interface \xb7 Visible pocket front' }));
      pieces.push(buildSlantPocketBag({ bagWidth: 7, slashInset: 3.5, slashDepth: 7, bagDepth: 12, sa, instruction: 'Cut 2 (1 + 1 mirror) \xb7 Lining fabric \xb7 Pocket back (against body)' }));
    } else if (opts.pockets === 'side') {
      pieces.push({ id: 'side-bag', name: 'Side-Seam Pocket Bag', instruction: 'Cut 4 (2 per side) · Lining fabric', dimensions: { width: 7, height: 9 }, type: 'pocket', sa });
    }
    if (opts.backPockets === 'welt2') {
      pieces.push({ id: 'back-welt', name: 'Back Welt Pocket', instruction: 'Cut 4 (2 welts + 2 bags) · ×2 pockets total', dimensions: { width: 5.5, height: 6 }, type: 'pocket', sa });
    }

    return pieces;
  },

  materials(m, opts) {
    const rise = m.rise || 10;
    const notions = [
      { ref: 'interfacing-light', quantity: '0.5 yard (waistband + pocket facings)' },
    ];
    if (opts.fly === 'zip') {
      notions.push({ name: 'Invisible zipper', quantity: `${Math.ceil(rise * 0.65)}″`, notes: 'Invisible (lapped) for clean finish' });
      notions.push({ name: 'Waistband button', quantity: '1', notes: '¾″ button or hook' });
      notions.push({ name: 'Hook-and-eye', quantity: '1 set', notes: 'Size 2 at waistband overlap' });
    }
    if (opts.waistband === 'elastic') {
      const elasticW = parseFloat(opts.elasticWidth) || 1;
      notions.push({ name: `Elastic ${fmtInches(elasticW)}`, quantity: `${Math.round(m.waist * 0.9)}″`, notes: `Non-roll ${fmtInches(elasticW)} wide elastic (~90% of waist)` });
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
        '{press} pleats with steam from WS - {press} cloth on wool and twill to prevent shine',
        'Grade seam allowances at waistband seam before turning to reduce bulk',
        opts.crease === 'crease' ? 'Front crease: fold each front leg so the inseam aligns with the side seam, {press} a sharp crease from waist to hem. Use a {press} cloth and heavy steam. Re-{press} after washing.' : '',
        opts.hemStyle === 'crop' ? 'Crop length: inseam is 2″ shorter than measurement for ankle-grazing fit. Fit before hemming.' : 'Trouser break: fit while wearing intended shoes - mark hem at top of shoe with ½–¾″ break.',
      ].filter(Boolean),
    });
  },

  instructions(m, opts) {
    const steps = [];
    let n = 1;
    const numPleats = opts.pleats === 'double' ? 2 : opts.pleats === 'single' ? 1 : 0;
    const hasFly    = opts.fly === 'zip';

    if (opts.backPockets === 'welt2') {
      steps.push({ step: n++, title: 'Prepare back welt pockets', detail: 'Mark positions 2.5″ below waist, centered. Sew welts, slash, turn, {press}. Attach bags. Whipstitch sides. Bar tack ends.' });
    }
    if (opts.pockets === 'slant') {
      steps.push({ step: n++, title: 'Sew pocket backing to pocket bag',
        detail: 'Place the pocket backing (self fabric) on the pocket bag (lining) {RST}. Sew along the curved bottom edge and the straight left side. Leave the top (waist), right side seam edge, and slash diagonal open. {clip} the curved seam allowance. Turn right side out so the backing faces outward. {press} flat. {topstitch} \u00bc\u2033 from the curved edge if desired. The pocket unit is now one piece with two layers.' });
      steps.push({ step: n++, title: 'Attach pocket to front panel',
        detail: 'The front panel is cut off at the slash line (the diagonal from waist to side seam). Align the pocket unit\u2019s slash diagonal edge to the front panel\u2019s slash edge {RST}. The pocket backing should face the front panel RS. Sew along the slash. {clip} the seam allowance. Turn the pocket to the wrong side of the panel. {press}. {understitch} through the pocket backing and both SAs so the seam rolls to the inside. {baste} the pocket\u2019s top edge to the panel\u2019s waist SA. {baste} the pocket\u2019s side seam edge to the panel\u2019s side SA. The pocket is now enclosed when the waist and side seams are sewn.' });
    } else if (opts.pockets === 'side') {
      steps.push({ step: n++, title: 'Prepare side-seam pockets', detail: 'Sew bag pairs together on curved edge. {baste} straight edges to front and back side seam SAs at pocket position.' });
    }
    if (numPleats > 0) {
      steps.push({ step: n++, title: `Form front pleat${numPleats === 2 ? 's' : ''}`, detail: `Fold each pleat toward side seam enclosing ${fmtInches(PLEAT_DEPTH)}. {baste} at waist. {press} first 5–6″ with steam and {press} cloth. Below hip, allow to drape freely.` });
    }
    steps.push({ step: n++, title: 'Stay-stitch waist', detail: 'Stitch ⅝″ from waist edge on all pieces directionally to prevent stretching while handling.' });
    if (hasFly) {
      steps.push({ step: n++, title: 'Install invisible zip fly', detail: 'Sew CF seam below fly opening only. Install invisible zipper to right CF opening. Attach fly shield to left CF behind zipper. {topstitch} fly curve from RS at 1″.' });
    } else {
      steps.push({ step: n++, title: 'Sew center front seam', detail: 'Join fronts at CF. {clip} curve. {press} open. {serge}.' });
    }
    steps.push({ step: n++, title: 'Sew center back seam', detail: 'Join backs at CB. {clip} curve. {press} open. {serge} each side.' });
    steps.push({ step: n++, title: 'Sew side seams', detail: 'Join front to back at side seams {RST}. {press} open. {serge} each SA separately.' });
    steps.push({ step: n++, title: 'Sew inseam', detail: 'Continuous seam from front hem to back hem through crotch. {clip} curve. {press} toward back. {serge}.' });
    if (opts.waistband === 'structured' || opts.waistband === 'contoured') {
      steps.push({ step: n++, title: 'Attach waistband', detail: 'Interface waistband. Sew to trouser waist {RST}. Fold over. Grade SA in layers before turning. {slipstitch} or {edgestitch} inside. Install button and hook-and-eye.' });
    } else {
      steps.push({ step: n++, title: 'Attach elastic waistband', detail: 'Fold casing in half {WST}. Sew to waist {RST}. Fold to inside, {topstitch} leaving 2″ gap at CB. Thread elastic (~90% of waist). Overlap ends 1″, {zigzag}. Close gap.' });
    }
    if (opts.crease === 'crease') {
      steps.push({ step: n++, title: '{press} front creases', detail: 'Fold each front leg so the inseam lies exactly on top of the side seam. {press} a sharp crease from waist to hem using heavy steam and a {press} cloth. The crease should run straight down the center of each leg.' });
    }
    steps.push({ step: n++, title: 'Hem - fit first', detail: `Try on with intended shoes. Mark hem at break point. Fold up ${fmtInches(parseFloat(opts.hem))} twice, {press}. Hand sew with blind hem stitch for an invisible finish.` });
    steps.push({ step: n++, title: 'Finish', detail: '{press} entire garment. Bar tack all pocket openings and crotch junction.' });

    return steps;
  },

  variants: [
    { id: 'cigarette-pants-w', name: 'Cigarette Pants', defaults: { ease: 'slim', riseStyle: 'high', hemStyle: 'crop' } },
  ],
};


function buildPanel({ type, name, instruction, waistWidth, hipWidth, hipLineY, height, rise, inseam, kneeY, kneeFactor, ext, cbRaise, sa, hem, isBack, numPleats = 0, pleatDepth = 0, opts, calf, seatDepth, dartIntake = 0 }) {
  const ccp      = crotchCurvePoints(0, 0, rise, ext, isBack, cbRaise);
  const curvePts = sampleBezier(ccp.p0, ccp.p1, ccp.p2, ccp.p3, 96);

  // Knee taper: if calf provided use body measurement, else use kneeFactor ratio
  const kneeW       = calf ? calf / 2 + 0.5 : hipWidth * kneeFactor;
  const kneeInward  = (hipWidth - kneeW) * 0.5;
  const sideKneeX   = hipWidth - kneeInward;
  const inseamKneeX = -ext + kneeInward;

  // Waist-to-hip shaping: all taper on side seam, center seam stays at x=0
  const sideWaistX = waistWidth;

  const poly = [];
  poly.push({ x: 0,            y: isBack ? -cbRaise : 0 });   // waist at center seam (raised on back)
  poly.push({ x: sideWaistX,   y: 0       });   // waist at side seam
  poly.push({ x: hipWidth,     y: hipLineY });   // hip at side seam
  poly.push({ x: sideKneeX,    y: kneeY   });
  poly.push({ x: sideKneeX,    y: height  });
  poly.push({ x: inseamKneeX,  y: height  });
  poly.push({ x: inseamKneeX,  y: kneeY   });
  poly.push({ x: -ext,         y: rise    });
  for (let i = curvePts.length - 2; i >= 1; i--) poly.push({ ...curvePts[i], curve: true });
  if (isBack && cbRaise > 0) poly.push({ x: 0, y: cbRaise }); // CB seam top

  const hasSlash = !isBack && opts?.pockets === 'slant';
  if (hasSlash) clipPanelAtSlash(poly, sideWaistX, 3.5, 7);

  const sideIdx = hasSlash ? 2 : 1;
  const saPoly = offsetPolygon(poly, (i, a, b) => {
    if (Math.abs(a.y - height) < 0.5 && Math.abs(b.y - height) < 0.5) return -hem;
    return -sa;
  });

  const dims = [
    { label: fmtInches(waistWidth) + ' waist', x1: 0, y1: -0.5, x2: sideWaistX, y2: -0.5, type: 'h' },
    { label: fmtInches(hipWidth) + ' hip',     x1: 0,            y1: hipLineY + 0.4, x2: hipWidth, y2: hipLineY + 0.4, type: 'h', color: '#b8963e' },
    { label: fmtInches(kneeW) + ' knee',       x1: inseamKneeX,  y1: kneeY + 0.4, x2: sideKneeX, y2: kneeY + 0.4, type: 'h', color: '#b8963e' },
    { label: fmtInches(rise)   + ' rise',      x: hipWidth + 1.2, y1: 0,           y2: rise,                          type: 'v' },
    { label: fmtInches(inseam) + ' inseam',    x: hipWidth + 1.2, y1: rise,        y2: height,                        type: 'v' },
    { label: fmtInches(height) + ' total',     x: hipWidth + 2.3, y1: 0,           y2: height,                        type: 'v' },
    { label: fmtInches(ext)    + ' ext',       x1: -ext,          y1: rise + 0.4,  x2: 0,            y2: rise + 0.4,  type: 'h', color: '#c44' },
    { label: fmtInches(seatDepth || 7) + ' seat', x: -ext - 1.2, y1: 0, y2: seatDepth || 7,                    type: 'v', color: '#b8963e' },
  ];

  const pleats = [];
  if (!isBack && numPleats >= 1) pleats.push({ x: waistWidth * 0.25, depth: pleatDepth, y1: 0, y2: 4.5 });
  if (!isBack && numPleats >= 2) pleats.push({ x: waistWidth * 0.5,  depth: pleatDepth, y1: 0, y2: 4.5 });

  // Waist darts for back panel
  const darts = [];
  if (isBack && dartIntake > 1) {
    if (dartIntake <= 1.5) {
      darts.push({ x: waistWidth * 0.4, intake: dartIntake, length: 4.5 });
    } else {
      darts.push({ x: waistWidth * 0.3, intake: dartIntake / 2, length: 4.5 });
      darts.push({ x: waistWidth * 0.6, intake: dartIntake / 2, length: 4 });
    }
  }

  const notches = [
    { x: hipWidth,     y: hipLineY,        angle: edgeAngle({ x: hipWidth, y: 0 }, { x: sideKneeX, y: kneeY }) },
    ...(isBack ? [{ x: hipWidth, y: hipLineY + 0.25, angle: edgeAngle({ x: hipWidth, y: 0 }, { x: sideKneeX, y: kneeY }) }] : []),
    { x: -ext,         y: rise,            angle: edgeAngle({ x: inseamKneeX, y: kneeY }, { x: -ext, y: rise }) },
    ...(isBack ? [{ x: -ext, y: rise - 0.25,         angle: edgeAngle({ x: inseamKneeX, y: kneeY }, { x: -ext, y: rise }) }] : []),
    { x: sideKneeX,    y: kneeY,           angle: edgeAngle({ x: hipWidth, y: hipLineY }, { x: sideKneeX, y: kneeY }) },
    { x: inseamKneeX,  y: kneeY,           angle: edgeAngle({ x: -ext, y: rise }, { x: inseamKneeX, y: kneeY }) },
  ];

  return {
    id: type, name, instruction,
    polygon: poly, saPolygon: saPoly,
    path: polyToPath(poly), saPath: polyToPath(saPoly),
    dimensions: dims, waistWidth, hipWidth, width: hipWidth, height, rise, inseam, ext, cbRaise, sa, hem, isBack,
    labels: [
      { text: 'SIDE SEAM', x: hipWidth + 0.3, y: height * 0.35, rotation: 90  },
      { text: 'CENTER',    x: -0.5,            y: rise   * 0.3,  rotation: -90 },
    ],
    notches, pleats, darts, crotchBezier: ccp,
    // LOCKED — crotch curve cut & stitch lines are finalized. Do not modify
    // crotchBezier, crotchBezierSA, or their rendering in pattern-view.js.
    crotchBezierSA: insetCrotchBezier(ccp, sa), type: 'panel', opts,
  };
}
