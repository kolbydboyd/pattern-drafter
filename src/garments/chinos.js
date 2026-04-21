// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Chinos — clean tailored trousers with serger-finished seams.
 * 31 inch default inseam, 10 inch rise. Same leg shapes as straight-jeans.
 * Slant front pockets, welt back pockets ×2 with button, zip fly.
 * No fell seams — {serge} or {zigzag} edge finish throughout.
 */

import {
  edgeAngle, crotchCurvePoints, sampleBezier, offsetPolygon, polyToPath,
  fmtInches, easeDistribution, LEG_SHAPES, insetCrotchBezier,
  buildSlantPocketBag, buildSlantPocketBacking, clipPanelAtSlash, buildSideSeamPocketBag,
  tummyAdjustment,
} from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

export default {
  id: 'chinos',
  name: 'Chinos',
  category: 'lower',
  difficulty: 'intermediate',
  priceTier: 'core',
  measurements: ['waist', 'hip', 'rise', 'thigh', 'inseam'],
  measurementDefaults: { inseam: 31 },

  options: {
    ease: {
      type: 'select', label: 'Fit',
      values: [
        { value: 'slim',    label: 'Slim (+2.5\u2033) , stretch fabric only', reference: 'fitted, tailored'    },
        { value: 'regular', label: 'Regular (+4\u2033)', reference: 'classic, off-the-rack' },
        { value: 'relaxed', label: 'Relaxed (+6\u2033)',   reference: 'skater, workwear'      },
      ],
      default: 'regular',
    },
    legShape: {
      type: 'select', label: 'Leg shape',
      values: [
        { value: 'skinny',   label: 'Skinny',   reference: '510, spray-on'  },
        { value: 'slim',     label: 'Slim',     reference: '511, cigarette' },
        { value: 'straight', label: 'Straight', reference: '501, regular'   },
        { value: 'bootcut',  label: 'Bootcut',  reference: '527, 70s flare' },
        { value: 'wide',     label: 'Wide',     reference: 'Yohji, palazzo' },
      ],
      default: 'straight',
    },
    frontPocket: {
      type: 'select', label: 'Front pockets',
      values: [
        { value: 'slant', label: 'Slant (western)' },
        { value: 'side',  label: 'Side seam'       },
        { value: 'none',  label: 'None'             },
      ],
      default: 'slant',
    },
    backPocket: {
      type: 'select', label: 'Back pockets',
      values: [
        { value: 'welt-button', label: 'Welt with button ×2', reference: 'dress trouser' },
        { value: 'welt',        label: 'Welt no button ×2',  reference: 'clean finish'  },
        { value: 'none',        label: 'None',               reference: 'minimal'       },
      ],
      default: 'welt-button',
    },
    frontExt: { type: 'number', label: 'Front crotch ext', default: 2, step: 0.25, min: 0.5, max: 3   },
    backExt:  { type: 'number', label: 'Back crotch ext',  default: 3.0, step: 0.25, min: 1,   max: 4.5 },
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
    cbRaise:  { type: 'number', label: 'CB raise',         default: 1.25, step: 0.25, min: 0,  max: 2.5 },
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
        { value: 1,   label: '1″'         },
        { value: 1.5, label: '1½″'        },
        { value: 2,   label: '2″ (cuff)'  },
      ],
      default: 1.5,
    },
  },

  pieces(m, opts) {
    const ease     = easeDistribution(opts.ease);
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
    const inseam   = m.inseam || (m.outseam ? Math.max(1, m.outseam - rise) : 31);
    const shape    = LEG_SHAPES[opts.legShape] || LEG_SHAPES.straight;

    let frontHipW   = m.hip / 4 + ease.front + 0.5;
    let backHipW    = m.hip / 4 + ease.back;

    // Thigh ease check
    if (m.thigh) {
      const patternThigh = (frontHipW + backHipW + frontExt + backExt) * 2;
      const minThigh = m.thigh * 2 + 3;
      if (patternThigh < minThigh) {
        const perPanel = (minThigh - patternThigh) / 4;
        frontHipW += perPanel;
        backHipW += perPanel;
        console.warn(`[chinos] Thigh ease insufficient (${(patternThigh - m.thigh * 2).toFixed(1)}″) — widened panels by ${perPanel.toFixed(2)}″ each`);
      } else if (patternThigh - m.thigh * 2 < 2) {
        console.warn(`[chinos] Thigh ease is tight: ${(patternThigh - m.thigh * 2).toFixed(1)}″ (recommend ≥ 2″)`);
      }
    }

    const frontWaistW = m.waist / 4 + ease.front;
    const backWaistW  = m.waist / 4 + ease.back;
    const hipLineY    = m.seatDepth || 7;
    const H           = rise + inseam;

    const pieces = [];
    const tummyAdj = tummyAdjustment(m);

    pieces.push(buildPanel({
      type: 'front', name: 'Front Panel',
      instruction: 'Cut 2 (mirror L & R) · {serge} all raw edges after each seam',
      waistWidth: frontWaistW, hipWidth: frontHipW, hipLineY,
      height: H, rise, inseam,
      ext: frontExt, cbRaise: 0, sa, hem, isBack: false, shape, opts,
      calf: m.calf, ankle: m.ankle, seatDepth: m.seatDepth, tummyAdj,
    }));

    // Back panel waist darts: suppress waist-to-hip difference
    const backDartIntake = backHipW - backWaistW;

    pieces.push(buildPanel({
      type: 'back', name: 'Back Panel',
      instruction: `Cut 2 (mirror L & R) · CB raised ${fmtInches(cbRaise)}`,
      waistWidth: backWaistW + backDartIntake, hipWidth: backHipW, hipLineY,
      dartIntake: backDartIntake,
      height: H, rise, inseam,
      ext: backExt, cbRaise, sa, hem, isBack: true, shape, opts,
      calf: m.calf, ankle: m.ankle, seatDepth: m.seatDepth,
    }));

    // ── WAISTBAND ──
    const wbLen = m.waist + ease.total + sa * 2;
    pieces.push({
      id: 'waistband',
      name: 'Waistband',
      instruction: `Cut 1 · Interface · 1½″ finished · Belt loops ×${m.waist > 36 ? 7 : 6}`,
      dimensions: { length: wbLen, width: 3 },
      type: 'rectangle', sa,
    });

    // ── FLY ──
    pieces.push({ id: 'fly-shield', name: 'Fly Shield', instruction: 'Cut 1 · Interface · {serge} edge before attaching', dimensions: { width: 2.5, height: rise }, type: 'pocket', sa });

    // ── POCKETS ──
    if (opts.frontPocket === 'slant') {
      pieces.push(buildSlantPocketBacking({ bagWidth: 7, slashInset: 3.5, slashDepth: 6, bagDepth: 11.5, sa, instruction: 'Cut 2 (1 + 1 mirror) \xb7 Self fabric \xb7 Visible pocket front' }));
      pieces.push(buildSlantPocketBag({ bagWidth: 7, slashInset: 3.5, slashDepth: 6, bagDepth: 11.5, sa, instruction: 'Cut 2 (1 + 1 mirror) \xb7 Lining or drill \xb7 Pocket back (against body)' }));
    }
    if (opts.frontPocket === 'side') {
      pieces.push(buildSideSeamPocketBag({
        bagWidth: 7, bagHeight: 9, sa,
        instruction: `Cut 4 (2 per side) · ${fmtInches(7)} wide × ${fmtInches(9)} deep · D-shaped · Straight edge along side seam · Serge all edges before assembly`,
      }));
    }

    if (opts.backPocket !== 'none') {
      pieces.push({ id: 'welt-back', name: 'Back Welt Pocket', instruction: 'Cut 4 (2 welts + 2 bags) · ×2 pockets total · {serge} bag edges', dimensions: { width: 5.5, height: 6 }, type: 'pocket', sa });
    }

    // ── BELT LOOPS ──
    pieces.push({ id: 'belt-loop', name: 'Belt Loops', instruction: `Cut ${m.waist > 36 ? 7 : 6} strips · Fold in thirds lengthwise (¾″ finished) · Length 4″ · Fold under ends before attaching to waistband`, dimensions: { length: 4, width: 2.5 }, type: 'pocket', sa, marks: [
      { type: 'fold', axis: 'v', position: 0.83, label: 'fold in thirds' },
      { type: 'fold', axis: 'v', position: 1.67, label: 'fold in thirds' },
    ] });

    return pieces;
  },

  materials(m, opts) {
    const notions = [
      { ref: 'interfacing-med', quantity: '0.5 yard (waistband + pocket facings)' },
      { name: 'Metal zipper',    quantity: `${Math.ceil(m.rise * 0.6)}″`, notes: 'YKK or equivalent' },
      { name: 'Waistband button', quantity: '1', notes: '¾″ shank button' },
    ];
    if (opts.backPocket === 'welt-button') {
      notions.push({ name: 'Welt buttons', quantity: '2', notes: '½″ sew-through buttons for back pockets' });
    }

    return buildMaterialsSpec({
      fabrics: ['cotton-twill', 'gabardine', 'stretch-denim'],
      notions,
      thread: 'poly-all',
      needle: 'universal-90',
      stitches: ['straight-2.5', 'straight-3', 'zigzag-small', 'bartack'],
      notes: [
        'Clean-finish ALL seams - {serge} or {zigzag} edge every seam allowance before or after sewing. No fell seams.',
        'Stitch seams at 2.5mm; {topstitch} at 3.0mm for a cleaner, less casual look than jeans',
        '{press} every seam immediately after sewing - chinos require crisp pressing to lie flat',
        'Pre-wash fabric once at the temperature you plan to wash the finished garment',
        'Bar tack all pocket corners and the crotch junction',
      ],
    });
  },

  instructions(m, opts) {
    const steps = [];
    let n = 1;

    if (opts.backPocket !== 'none') {
      steps.push({
        step: n++, title: 'Prepare back welt pockets',
        detail: `{serge} pocket bag edges. Mark welt positions on back panels. Sew bound welts {RST}, slash, turn, {press}. Attach bag halves. Whipstitch bag sides. Bar tack ends.${opts.backPocket === 'welt-button' ? ' Work buttonhole on upper welt, attach button.' : ''}`,
      });
    }

    steps.push({ step: n++, title: 'Sew pocket backing to pocket bag',
      detail: 'Place the pocket backing (self fabric) on the pocket bag (lining) {RST}. Sew along the curved bottom edge and the straight left side. Leave the top (waist), right side seam edge, and slash diagonal open. {clip} the curved seam allowance. Turn right side out so the backing faces outward. {press} flat. {topstitch} \u00bc\u2033 from the curved edge if desired. The pocket unit is now one piece with two layers.' });
    steps.push({ step: n++, title: 'Attach pocket to front panel',
      detail: 'The front panel is cut off at the slash line (the diagonal from waist to side seam). Align the pocket unit\u2019s slash diagonal edge to the front panel\u2019s slash edge {RST}. The pocket backing should face the front panel RS. Sew along the slash. {clip} the seam allowance. Turn the pocket to the wrong side of the panel. {press}. {understitch} through the pocket backing and both SAs so the seam rolls to the inside. {baste} the pocket\u2019s top edge to the panel\u2019s waist SA. {baste} the pocket\u2019s side seam edge to the panel\u2019s side SA. The pocket is now enclosed when the waist and side seams are sewn.' });
    steps.push({
      step: n++, title: 'Install zip fly',
      detail: '{serge} fly shield edges. {staystitch} CF seam allowances. Sew front panels at CF from crotch to bottom of fly opening. {clip} curve. Sew zipper to right CF. Sew fly shield to left CF. {topstitch} fly curve from RS at 3.0mm.',
    });
    steps.push({
      step: n++, title: 'Sew center back seam',
      detail: 'Join back panels at CB {RST}. {clip} curve. {serge} seam allowances together. {press} toward one side.',
    });
    steps.push({
      step: n++, title: 'Sew side seams',
      detail: 'Join front to back at side seams {RST}. {press} open. {serge} each seam allowance separately. {topstitch} at 3.0mm if desired.',
    });
    steps.push({
      step: n++, title: 'Sew inseam',
      detail: 'Continuous seam from hem to hem. {clip} crotch curve. {serge} seam allowances together. {press} toward back.',
    });
    steps.push({
      step: n++, title: 'Construct and attach waistband',
      detail: 'Interface waistband. Sew to trousers waist {RST}. Fold over. {topstitch} top and bottom edges at 3.0mm. Waistband button and buttonhole at CF overlap.',
    });
    steps.push({
      step: n++, title: 'Attach belt loops',
      detail: '{press} loop strips. {topstitch} edges. Cut to height. Place at CB, side seams, flanking CF. Fold and {topstitch} ends. Bar tack through all layers.',
    });
    steps.push({
      step: n++, title: 'Hem',
      detail: `{serge} or turn under raw hem edge. Fold hem up ${fmtInches(parseFloat(opts.hem))}. {press}. {topstitch} at 3.0mm or hand-slip stitch for a cleaner finish.`,
    });
    steps.push({ step: n++, title: 'Finish', detail: '{press} entire garment with steam. Bar tack all stress points. Check all seam allowances are neatly serged.' });

    return steps;
  },

  variants: [
    { id: 'slim-chinos', name: 'Slim Chinos', defaults: { ease: 'slim', legShape: 'slim' } },
  ],
};


// ── Panel builder with knee-point leg shaping ─────────────────────────────

function buildPanel({ type, name, instruction, waistWidth, hipWidth, hipLineY, height, rise, inseam, ext, cbRaise, sa, hem, isBack, shape, opts, calf, ankle, seatDepth, dartIntake = 0, tummyAdj = 0 }) {
  const ccp      = crotchCurvePoints(0, 0, rise, ext, isBack, cbRaise);
  const curvePts = sampleBezier(ccp.p0, ccp.p1, ccp.p2, ccp.p3, 96);

  const kneeY       = rise + inseam * 0.55;
  const kneeW       = calf  ? calf  / 2 + 0.5 : hipWidth * shape.knee;
  const hemW        = ankle ? ankle / 2 + 0.5 : hipWidth * shape.hem;
  const kneeInward  = (hipWidth - kneeW) * 0.5;
  const hemInward   = (hipWidth - hemW)  * 0.5;
  const sideKneeX   =  hipWidth - kneeInward;
  const sideHemX    =  hipWidth - hemInward;
  const inseamKneeX = -ext   + kneeInward;
  const inseamHemX  = -ext   + hemInward;

  // Waist-to-hip shaping: all taper on side seam, center seam stays at x=0
  const sideWaistX = waistWidth;

  const poly = [];
  // Front: raise CF by tummyAdj so fabric travels over a prominent belly
  poly.push({ x: 0,            y: isBack ? -cbRaise : -tummyAdj });
  poly.push({ x: sideWaistX,   y: 0       });   // waist at side seam
  poly.push({ x: hipWidth,     y: hipLineY });   // hip at side seam
  poly.push({ x: sideKneeX,    y: kneeY   });
  poly.push({ x: sideHemX,     y: height  });
  poly.push({ x: inseamHemX,   y: height  });
  poly.push({ x: inseamKneeX,  y: kneeY   });
  poly.push({ x: -ext,         y: rise    });
  for (let i = curvePts.length - 2; i >= 1; i--) poly.push({ ...curvePts[i], curve: true });
  if (isBack && cbRaise > 0) poly.push({ x: 0, y: cbRaise }); // CB seam top

  // Clip front panel at slash line for slant pocket
  const hasSlash = !isBack && opts?.frontPocket === 'slant';
  if (hasSlash) clipPanelAtSlash(poly, sideWaistX, 3.5, 6);

  // Per-edge seam allowances
  const crotchEdgeCount = curvePts.length - 2;
  const sideIdx = hasSlash ? 2 : 1;
  const edgeAllowances = poly.map((_, i) => {
    if (i === 0) return { sa, label: 'Waist' };
    if (hasSlash && i === 1) return { sa, label: 'Slash' };
    if (i === sideIdx) return { sa, label: 'Side seam' };
    if (i === sideIdx + 1) return { sa, label: 'Side seam' };
    if (i === sideIdx + 2) return { sa, label: 'Side seam' };
    if (i === sideIdx + 3) return { sa: hem, label: 'Hem' };
    if (i === sideIdx + 4) return { sa, label: 'Inseam' };
    if (i === sideIdx + 5) return { sa, label: 'Inseam' };
    if (i >= sideIdx + 6 && i < sideIdx + 6 + crotchEdgeCount) return { sa, label: 'Crotch' };
    return { sa, label: 'Center' };
  });

  const saPoly = offsetPolygon(poly, (i, a, b) => {
    if (Math.abs(a.y - height) < 0.5 && Math.abs(b.y - height) < 0.5) return -hem;
    return -sa;
  });

  const effSeatDepth = seatDepth || 7;
  const dims = [
    { label: fmtInches(waistWidth) + ' waist', x1: 0, y1: -0.5, x2: sideWaistX, y2: -0.5, type: 'h' },
    { label: fmtInches(hipWidth) + ' hip',     x1: 0,            y1: hipLineY + 0.4, x2: hipWidth, y2: hipLineY + 0.4, type: 'h', color: '#b8963e' },
    { label: fmtInches(kneeW) + ' knee',       x1: inseamKneeX,  y1: kneeY + 0.4, x2: sideKneeX,  y2: kneeY + 0.4, type: 'h', color: '#b8963e' },
    { label: fmtInches(hemW)  + ' hem',        x1: inseamHemX,   y1: height - 0.5, x2: sideHemX,  y2: height - 0.5, type: 'h', color: '#b8963e' },
    { label: fmtInches(rise)   + ' rise',      x: hipWidth + 1.2, y1: 0,           y2: rise,                         type: 'v' },
    { label: fmtInches(inseam) + ' inseam',    x: hipWidth + 1.2, y1: rise,        y2: height,                       type: 'v' },
    { label: fmtInches(ext)    + ' ext',       x1: -ext, y1: rise + 0.4, x2: 0, y2: rise + 0.4,                   type: 'h', color: '#c44' },
    { label: fmtInches(effSeatDepth) + ' seat', x: -ext - 1.2, y1: 0, y2: effSeatDepth,                        type: 'v', color: '#b8963e' },
  ];

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
    notches, darts, crotchBezier: ccp,
    // LOCKED — crotch curve cut & stitch lines are finalized. Do not modify
    // crotchBezier, crotchBezierSA, or their rendering in pattern-view.js.
    crotchBezierSA: insetCrotchBezier(ccp, sa), type: 'panel', opts,
  };
}
