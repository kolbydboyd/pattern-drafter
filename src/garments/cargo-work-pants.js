// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Cargo Work Pants — inspired by the Strauss e.s.motion ten.
 * Durable stretch-fabric workwear pants with Flexbelt waistband,
 * multi-compartment cargo pockets, deep slant pockets, knee pad pockets
 * with Velcro, double inner-leg seam, and a modern slightly tapered leg.
 * Uses lower body block with leg shaping via LEG_SHAPES.
 */

import {
  crotchCurvePoints, sampleBezier, offsetPolygon, polyToPath, dist, arcLength,
  fmtInches, easeDistribution, LEG_SHAPES, edgeAngle, insetCrotchBezier,
  buildSlantPocketBacking, buildSlantPocketBag, clipPanelAtSlash
} from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

export default {
  id: 'cargo-work-pants',
  name: 'Cargo Work Pants',
  category: 'lower',
  difficulty: 'advanced',
  priceTier: 'tailored',
  measurements: ['waist', 'hip', 'rise', 'thigh', 'inseam'],
  measurementDefaults: { inseam: 32 },

  options: {
    ease: {
      type: 'select', label: 'Fit',
      values: [
        { value: 'slim',    label: 'Slim (+2.5″)',    reference: 'modern workwear'       },
        { value: 'regular', label: 'Regular (+4″)',    reference: 'classic workwear'      },
        { value: 'relaxed', label: 'Relaxed (+6″)',    reference: 'heavy-duty, layering'  },
      ],
      default: 'relaxed',
    },
    legShape: {
      type: 'select', label: 'Leg shape',
      values: [
        { value: 'slim',     label: 'Slim',     reference: 'modern tapered'   },
        { value: 'straight', label: 'Straight', reference: 'classic work pant' },
        { value: 'bootcut',  label: 'Bootcut',  reference: 'over work boots'   },
      ],
      default: 'straight',
    },
    waistband: {
      type: 'select', label: 'Waistband',
      values: [
        { value: 'flexbelt', label: 'Flexbelt (elastic sides)' },
        { value: 'standard', label: 'Standard belt-loop'       },
      ],
      default: 'flexbelt',
    },
    frontPocket: {
      type: 'select', label: 'Front pockets',
      values: [
        { value: 'slant', label: 'Deep slant (crossover)' },
        { value: 'side',  label: 'Side seam'              },
        { value: 'none',  label: 'None'                    },
      ],
      default: 'slant',
    },
    cargoPocket: {
      type: 'select', label: 'Cargo pockets',
      values: [
        { value: 'cargo', label: 'Multi-compartment' },
        { value: 'none',  label: 'None'               },
      ],
      default: 'cargo',
    },
    backPocket: {
      type: 'select', label: 'Back pockets',
      values: [
        { value: 'flap',  label: 'Patch + flap & press stud' },
        { value: 'patch', label: 'Patch plain'                },
        { value: 'none',  label: 'None'                        },
      ],
      default: 'flap',
    },
    kneePad: {
      type: 'select', label: 'Knee pads',
      values: [
        { value: 'kneepad', label: 'Knee pad pocket (Velcro, top-loading)' },
        { value: 'reinforce', label: 'Reinforcement patch'                 },
        { value: 'none',    label: 'None'                                   },
      ],
      default: 'kneepad',
    },
    innerLeg: {
      type: 'select', label: 'Inner leg seam',
      values: [
        { value: 'double',   label: 'Double seam (heavy-duty)' },
        { value: 'standard', label: 'Standard'                  },
      ],
      default: 'double',
    },
    frontExt: { type: 'number', label: 'Front crotch ext', default: 2, step: 0.25, min: 0.5, max: 3   },
    backExt:  { type: 'number', label: 'Back crotch ext',  default: 2.5, step: 0.25, min: 1,   max: 4   },
    riseStyle: {
      type: 'select', label: 'Rise style',
      values: [
        { value: 'ultra-low',  label: 'Ultra low (−2.5″)'  },
        { value: 'low',        label: 'Low rise (−1.5″)'    },
        { value: 'mid',        label: 'Mid rise (body rise)' },
        { value: 'high',       label: 'High rise (+1.5″)'    },
        { value: 'ultra-high', label: 'Ultra high (+3″)'     },
      ],
      default: 'mid',
    },
    riseOverride: { type: 'number', label: 'Rise override (inches)', default: 0, step: 0.25, min: 0, max: 18 },
    cbRaise:  { type: 'number', label: 'CB raise', default: 1.25, step: 0.25, min: 0, max: 2.5 },
    sa: {
      type: 'select', label: 'Seam allowance',
      values: [
        { value: 0.5,   label: '½″' },
        { value: 0.625, label: '⅝″' },
        { value: 1,     label: '1″' },
      ],
      default: 0.625,
    },
    hem: {
      type: 'select', label: 'Hem allowance',
      values: [
        { value: 1,   label: '1″'          },
        { value: 1.5, label: '1½″'         },
        { value: 2,   label: '2″ (cuff)'   },
      ],
      default: 1,
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
    const baseRise = m.rise || 10;
    const riseOff  = RISE_OFFSETS[opts.riseStyle] ?? 0;
    const crotchEase = 0.75; // ease below body rise — prevents fabric pulling tight against crotch
    const rise     = parseFloat(opts.riseOverride) || (baseRise + riseOff + crotchEase);
    const inseam   = m.outseam ? Math.max(1, m.outseam - rise) : (m.inseam || 32);
    const shape    = LEG_SHAPES[opts.legShape] || LEG_SHAPES.straight;

    const frontHipW   = m.hip / 4 + ease.front;
    const backHipW    = m.hip / 4 + ease.back;
    const frontWaistW = m.waist / 4 + ease.front;
    const backWaistW  = m.waist / 4 + ease.back;
    const hipLineY    = m.seatDepth || 7;
    const H           = rise + inseam;

    const pieces = [];

    // ── FRONT PANEL ──
    pieces.push(buildPanel({
      type: 'front', name: 'Front Panel',
      instruction: 'Cut 2 (mirror L & R) · Curve on CENTER · Mark knee point',
      waistWidth: frontWaistW, hipWidth: frontHipW, hipLineY,
      height: H, rise, inseam,
      ext: frontExt, cbRaise: 0, sa, hem,
      isBack: false, shape, opts,
      calf: m.calf, ankle: m.ankle, seatDepth: m.seatDepth,
    }));

    // ── BACK PANEL ──
    const backDartIntake = backHipW - backWaistW;

    pieces.push(buildPanel({
      type: 'back', name: 'Back Panel',
      instruction: `Cut 2 (mirror L & R) · CB raised ${fmtInches(cbRaise)} · Mark knee point`,
      waistWidth: backWaistW + backDartIntake, hipWidth: backHipW, hipLineY,
      dartIntake: backDartIntake,
      height: H, rise, inseam,
      ext: backExt, cbRaise, sa, hem,
      isBack: true, shape, opts,
      calf: m.calf, ankle: m.ankle, seatDepth: m.seatDepth,
    }));

    // ── WAISTBAND ──
    if (opts.waistband === 'flexbelt') {
      const pantsWaist = (frontWaistW + backHipW) * 2; // actual waist opening of assembled pants
      const wbLength = pantsWaist + sa * 2;
      pieces.push({
        id: 'waistband',
        name: 'Flexbelt Waistband',
        instruction: `Cut 1 on fold · Interface center · Elastic in side sections · ${fmtInches(2)} finished`,
        dimensions: { length: wbLength, width: 4 },
        type: 'rectangle', sa,
      });
    } else {
      const wbLength = m.waist + ease.total + 2 + sa * 2;
      pieces.push({
        id: 'waistband',
        name: 'Waistband',
        instruction: `Cut 1 on fold · Interface · ${fmtInches(1.5)} finished · Belt loops ×${m.waist > 36 ? 7 : 6}`,
        dimensions: { length: wbLength, width: 3 },
        type: 'rectangle', sa,
      });
    }

    // ── FLY SHIELD ──
    pieces.push({ id: 'fly-shield', name: 'Fly Shield', instruction: 'Cut 1 · Interface', dimensions: { width: 2.5, height: rise }, type: 'pocket' });

    // ── FRONT POCKETS ──
    if (opts.frontPocket === 'slant') {
      pieces.push(buildSlantPocketBacking({ bagWidth: 8, slashInset: 4, slashDepth: 7, bagDepth: 10.5, sa, instruction: 'Cut 2 (1 + 1 mirror) \xb7 Self fabric \xb7 Deep crossover opening \xb7 Visible pocket front' }));
      pieces.push(buildSlantPocketBag({ bagWidth: 8, slashInset: 4, slashDepth: 7, bagDepth: 10.5, sa, instruction: 'Cut 2 (1 + 1 mirror) \xb7 Lining fabric \xb7 Deep pocket for crossover access \xb7 Pocket back (against body)' }));
      pieces.push({ id: 'coin-pocket', name: 'Coin Pocket', instruction: 'Cut 2 (outer + lining) · Right front only · Inside slant pocket', dimensions: { width: 3.5, height: 4 }, type: 'pocket' });
      pieces.push({ id: 'zip-pocket', name: 'Zip Security Pocket', instruction: 'Cut 2 (outer + lining) · Left front only · Inside slant pocket · Install 4″ zip', dimensions: { width: 3.5, height: 4 }, type: 'pocket' });
    }
    if (opts.frontPocket === 'side') {
      pieces.push({ id: 'side-bag', name: 'Side-Seam Pocket Bag', instruction: 'Cut 4 (2 per side)', dimensions: { width: 8, height: 10 }, type: 'pocket' });
    }

    // ── CARGO POCKETS ──
    if (opts.cargoPocket === 'cargo') {
      pieces.push({ id: 'cargo-body', name: 'Multi-Compartment Cargo Pocket', instruction: 'Cut 2 \xb7 10\u2033 wide \xd7 8\u2033 tall \xb7 Box pleat at center: \u00bd\u2033 under, \u00bd\u2033 fold back, 2\u2033 on top, \u00bd\u2033 under, \u00bd\u2033 back out (4\u2033 consumed total) \xb7 Finished pocket 6\u2033 wide, expands to 10\u2033 \xb7 Mark internal divider at center for main + Velcro compartments \xb7 Mark smartphone pocket 2.5\u2033 from left edge', dimensions: { width: 10, height: 8 }, type: 'pocket' });
      pieces.push({ id: 'cargo-flap', name: 'Cargo Pocket Flap', instruction: 'Cut 4 (2 outer + 2 lining) \xb7 6\u00bd\u2033 wide \xd7 3\u2033 tall \xb7 Covers finished pocket opening with \u00bc\u2033 overlap each side', dimensions: { width: 6.5, height: 3 }, type: 'pocket' });
      pieces.push({ id: 'cargo-zip-pocket', name: 'Cargo Zip Safety Pocket', instruction: 'Cut 2 (outer + lining) · Sewn inside cargo body · Install 4″ zip', dimensions: { width: 4, height: 5 }, type: 'pocket' });
    }

    // ── BACK POCKETS ──
    if (opts.backPocket !== 'none') {
      pieces.push({ id: 'back-patch', name: 'Back Patch Pocket', instruction: 'Cut 4 (2 per back panel)', dimensions: { width: 6.5, height: 7.5 }, type: 'pocket' });
      if (opts.backPocket === 'flap') {
        pieces.push({ id: 'back-flap', name: 'Back Pocket Flap', instruction: 'Cut 4 (2 outer + 2 lining) · Install press stud', dimensions: { width: 6.5, height: 3 }, type: 'pocket' });
      }
    }

    // ── KNEE PAD POCKETS ──
    if (opts.kneePad === 'kneepad') {
      pieces.push({ id: 'kneepad-pocket', name: 'Knee Pad Pocket', instruction: 'Cut 2 · Top-loading pocket · Position at knee point on front panel inside', dimensions: { width: 9, height: 7 }, type: 'pocket' });
      pieces.push({ id: 'kneepad-facing', name: 'Knee Pad Pocket Facing', instruction: 'Cut 2 · Facing strip for top opening · Attach Velcro to close', dimensions: { width: 9, height: 2 }, type: 'pocket' });
    }
    if (opts.kneePad === 'reinforce') {
      pieces.push({ id: 'knee-reinforce', name: 'Knee Reinforcement Patch', instruction: 'Cut 2 · Baste to inside of front panel at knee point', dimensions: { width: 8, height: 6 }, type: 'pocket' });
    }

    // ── RULER POCKET ──
    pieces.push({ id: 'ruler-pocket', name: 'Ruler/Yardstick Pocket', instruction: 'Cut 2 · Narrow tool pocket · Attach to outer side seam at thigh', dimensions: { width: 1.5, height: 9 }, type: 'pocket' });

    // ── BELT LOOPS (standard waistband only) ──
    if (opts.waistband === 'standard') {
      pieces.push({ id: 'belt-loop', name: 'Belt Loops', instruction: `Cut ${m.waist > 36 ? 7 : 6} strips 1¾″ × ¾″ finished`, dimensions: { width: 1.75, height: 0.75 }, type: 'pocket' });
    }

    return pieces;
  },

  materials(m, opts) {
    const notions = [
      { ref: 'interfacing-med', quantity: '0.5 yard (waistband + pocket facings)' },
      { name: 'Metal zipper (fly)', quantity: `${Math.ceil((m.rise || 10) * 0.6)}″`, notes: 'YKK #5 or equivalent' },
      { name: 'Waistband button', quantity: '1', notes: '¾″ shank button' },
    ];

    if (opts.waistband === 'flexbelt') {
      notions.push({ ref: 'elastic-1.5', quantity: `${Math.round(m.waist * 0.4)}″ (two side sections)`, notes: '1.5″ wide woven elastic for Flexbelt sides' });
    }
    if (opts.cargoPocket === 'cargo') {
      notions.push({ name: 'Press studs', quantity: '2 sets', notes: 'For cargo pocket flaps' });
      notions.push({ name: 'Velcro strips', quantity: '2 × 4″', notes: 'For cargo Velcro compartments' });
      notions.push({ name: 'Nylon zipper (cargo)', quantity: '2 × 4″', notes: 'For cargo safety pockets' });
    }
    if (opts.backPocket === 'flap') {
      notions.push({ name: 'Press studs', quantity: '2 sets', notes: 'For back pocket flaps' });
    }
    if (opts.kneePad === 'kneepad') {
      notions.push({ name: 'Velcro strips', quantity: '2 × 9″', notes: 'For knee pad pocket closures (hook + loop)' });
    }
    if (opts.frontPocket === 'slant') {
      notions.push({ name: 'Nylon zipper (pocket)', quantity: '1 × 4″', notes: 'For front zip security pocket' });
    }

    return buildMaterialsSpec({
      fabrics: ['cotton-twill', 'stretch-twill', 'gabardine'],
      notions,
      thread: 'poly-heavy',
      needle: 'universal-100',
      stitches: ['straight-2.5', 'straight-3', 'bartack', 'zigzag-small'],
      notes: [
        'Use stretch-twill or CORDURA/cotton blend for best durability and flexibility',
        'Pre-wash fabric (hot wash, tumble dry) to pre-shrink before cutting',
        'Interface waistband with 2 layers BEFORE cutting',
        'Bar tack all pocket corners, cargo attachment points, and crotch junction',
        opts.innerLeg === 'double' ? 'Double-stitch inner leg seam: sew once, then sew again ¼″ from first line for heavy-duty durability' : '',
        'Finish raw edges with serger or {zigzag}',
        '{press} with damp cloth to avoid shine on dark fabrics',
      ].filter(Boolean),
    });
  },

  instructions(m, opts) {
    const steps = [];
    let n = 1;

    // Knee pads first (basted to panels before assembly)
    if (opts.kneePad === 'kneepad') {
      steps.push({ step: n++, title: 'Prepare knee pad pockets',
        detail: 'Sew facing strip to pocket body along top edge {RST}. Turn, {press}. Attach Velcro hook strip to facing and loop strip to pocket body (these close the top-loading opening). Position pocket on inside of front panel at knee point mark. {baste} sides and bottom to panel.' });
    }
    if (opts.kneePad === 'reinforce') {
      steps.push({ step: n++, title: 'Prepare knee reinforcement',
        detail: '{baste} reinforcement patch to inside of front panel at knee point. Stitch around perimeter ¼″ from edge.' });
    }

    // Front pockets
    if (opts.frontPocket === 'slant') {
      steps.push({ step: n++, title: 'Sew pocket backing to pocket bag',
        detail: 'Place the pocket backing (self fabric) on the pocket bag (lining) {RST}. Sew along the curved bottom edge and the straight left side. Leave the top (waist), right side seam edge, and slash diagonal open. {clip} the curved seam allowance. Turn right side out so the backing faces outward. {press} flat. {topstitch} \u00bc\u2033 from the curved edge if desired. The pocket unit is now one piece with two layers.' });
      steps.push({ step: n++, title: 'Attach pocket to front panel',
        detail: 'The front panel is cut off at the slash line (the diagonal from waist to side seam). Align the pocket unit\u2019s slash diagonal edge to the front panel\u2019s slash edge {RST}. The pocket backing should face the front panel RS. Sew along the slash. {clip} the seam allowance. Turn the pocket to the wrong side of the panel. {press}. {understitch} through the pocket backing and both SAs so the seam rolls to the inside. {baste} the pocket\u2019s top edge to the panel\u2019s waist SA. {baste} the pocket\u2019s side seam edge to the panel\u2019s side SA. The pocket is now enclosed when the waist and side seams are sewn.' });
    }

    // Cargo pockets
    if (opts.cargoPocket === 'cargo') {
      steps.push({ step: n++, title: 'Prepare multi-compartment cargo pockets',
        detail: 'Mark center divider line on cargo body. Sew internal divider (fold fabric strip, topstitch to body along center line \u2014 creates main compartment and secondary compartment). Install Velcro strip along top of secondary compartment. Mark smartphone pocket position 2.5\u2033 from left edge, sew vertical divider. Install zip safety pocket: sew zipper between pocket pieces, attach inside cargo body at bottom. Form box pleat at center: from each side, fold \u00bd\u2033 under, fold back \u00bd\u2033, then bring 2\u2033 across on top to the center line (\u00bd\u2033 + \u00bd\u2033 tucked inside each fold, 4\u2033 consumed total). {press} pleat flat. {baste} pleat at top and bottom. Fold top edge under 1\u2033, {topstitch}. {press} side and bottom SA under \u215d\u2033. Sew flap outer to lining {RST} on 3 sides, {clip} corners, turn, {press}. {topstitch} \u00bc\u2033 from edge. Install press stud on flap center.' });
    }

    // Back pockets
    if (opts.backPocket !== 'none') {
      steps.push({ step: n++, title: 'Prepare & attach back pockets',
        detail: `Fold top edge under 1″, {topstitch}. {press} remaining edges under ⅝″. Position on back panel 2.5″ below waist line, centered. {topstitch} close to edge on 3 sides. Bar tack top corners.${opts.backPocket === 'flap' ? ' Sew flap outer to lining {RST} on 3 sides, {clip} corners, turn, {press}. {topstitch} ¼″ from edge. Install press stud. Sew flap above pocket opening, flip down.' : ''}` });
    }

    // Assembly
    steps.push({ step: n++, title: 'Sew center front seam & install zip fly',
      detail: 'Interface fly shield. {staystitch} CF seam allowances. Join front panels at CF from crotch point up to bottom of fly opening. Install zipper to right CF extension. Sew fly shield to left extension. {topstitch} fly curve from RS. Secure fly shield to inside.' });
    steps.push({ step: n++, title: 'Sew center back seam',
      detail: 'Join back panels at CB crotch seam {RST}. {clip} crotch curve. {press} seam open.' });
    steps.push({ step: n++, title: 'Sew side seams',
      detail: 'Join front to back at side seams {RST}. {press} open.' });
    if (opts.cargoPocket === 'cargo') {
      steps.push({ step: n++, title: 'Attach cargo pockets',
        detail: 'Position each cargo pocket on the outer leg, centered over the side seam, with the top edge at mid-thigh. Pin in place. {topstitch} the sides and bottom at \u215b\u2033 from the edge, backstitching at the top corners. Align the flap above the pocket opening with the raw edge pointing up. Sew across the flap \u00bc\u2033 from the raw edge. Flip the flap down over the pocket and {press}. {topstitch} \u00bc\u2033 from the fold to hold the flap in place. Bar tack all four corners of the pocket body for reinforcement.' });
    }
    steps.push({ step: n++, title: 'Attach ruler pockets',
      detail: 'Position each ruler pocket on the outer side seam at thigh level. {topstitch} the sides and bottom close to the edge. Leave the top open. Bar tack the top corners.' });
    steps.push({ step: n++, title: 'Sew inner leg seam',
      detail: opts.innerLeg === 'double'
        ? 'One continuous seam from hem to hem through crotch. {clip} crotch curve. Sew second line of stitching ¼″ from first for double-seam durability. {press} toward front.'
        : 'One continuous seam from hem to hem through crotch. {clip} crotch curve. {press}.' });

    // Waistband
    if (opts.waistband === 'flexbelt') {
      steps.push({ step: n++, title: 'Construct Flexbelt waistband',
        detail: 'Fuse interfacing to center front and center back sections. Cut elastic for two side sections (each ≈ 20% of waist). Sew elastic into side channels between interfaced sections. Pin waistband to pants waist {RST}, matching CB, side seams, CF. Sew. Fold over, {press}. Fold top edge under, pin to inside covering seam. {topstitch} through all layers. Double {topstitch} top and bottom of waistband. Install button at CF overlap.' });
    } else {
      steps.push({ step: n++, title: 'Construct waistband & attach belt loops',
        detail: `Fuse interfacing. Attach to pants waist {RST}. Fold, {press}, {topstitch} top and bottom edge. Install button at CF overlap. {press} belt loop strips in thirds. {topstitch} both edges. Cut to length. Pin at CB, side seams, and flanking CF fly. Fold under ends, {topstitch} top and bottom with a bar tack.` });
    }

    steps.push({ step: n++, title: 'Hem',
      detail: `Fold up ${fmtInches(parseFloat(opts.hem))} twice. {topstitch} close to inner fold.` });
    steps.push({ step: n++, title: 'Finish',
      detail: '{press} entire garment. Bar tack all stress points: pocket openings, cargo pocket corners, crotch junction, knee pad pocket edges, ruler pocket top. Install any remaining press studs and Velcro. Try on and adjust Flexbelt elastic tension if needed.' });

    return steps;
  },
};


// ── Panel builder with knee-point leg shaping (adapted from straight-jeans) ──

function buildPanel({ type, name, instruction, waistWidth, hipWidth, hipLineY, height, rise, inseam, ext, cbRaise, sa, hem, isBack, shape, opts, calf, ankle, seatDepth, dartIntake = 0 }) {
  const ccp      = crotchCurvePoints(0, 0, rise, ext, isBack, cbRaise);
  const curvePts = sampleBezier(ccp.p0, ccp.p1, ccp.p2, ccp.p3, 96);

  const kneeY      = rise + inseam * 0.55;
  const kneeW      = calf  ? calf  / 2 + 0.5 : hipWidth * shape.knee;
  const hemW       = ankle ? ankle / 2 + 0.5 : hipWidth * shape.hem;

  const kneeInward = (hipWidth - kneeW) * 0.5;
  const hemInward  = (hipWidth - hemW)  * 0.5;

  const sideKneeX    =  hipWidth - kneeInward;
  const sideHemX     =  hipWidth - hemInward;
  const inseamKneeX  = -ext   + kneeInward;
  const inseamHemX   = -ext   + hemInward;

  const sideWaistX = waistWidth;

  const poly = [];
  poly.push({ x: 0,            y: 0       });
  poly.push({ x: sideWaistX,   y: 0       });
  poly.push({ x: hipWidth,     y: hipLineY });
  poly.push({ x: sideKneeX,    y: kneeY   });
  poly.push({ x: sideHemX,     y: height  });
  poly.push({ x: inseamHemX,   y: height  });
  poly.push({ x: inseamKneeX,  y: kneeY   });
  poly.push({ x: -ext,         y: rise    });
  for (let i = curvePts.length - 2; i >= 1; i--) poly.push({ ...curvePts[i], curve: true });
  if (isBack && cbRaise > 0) poly.push({ x: 0, y: cbRaise });

  const hasSlash = !isBack && opts?.frontPocket === 'slant';
  if (hasSlash) clipPanelAtSlash(poly, sideWaistX, 4, 7);

  const sideIdx = hasSlash ? 2 : 1;

  const saPoly = offsetPolygon(poly, (i, a, b) => {
    if (Math.abs(a.y - height) < 0.5 && Math.abs(b.y - height) < 0.5) return -hem;
    return -sa;
  });

  const effSeatDepth = seatDepth || 7;

  const outseamLen = dist({ x: sideWaistX, y: 0 }, { x: hipWidth, y: hipLineY })
    + dist({ x: hipWidth, y: hipLineY }, { x: sideKneeX, y: kneeY })
    + dist({ x: sideKneeX, y: kneeY }, { x: sideHemX, y: height });
  const inseamLen = dist({ x: inseamHemX, y: height }, { x: inseamKneeX, y: kneeY })
    + dist({ x: inseamKneeX, y: kneeY }, { x: -ext, y: rise });
  const crotchLen = arcLength(curvePts);

  const dims = [
    { label: fmtInches(waistWidth) + ' waist', x1: 0, y1: -0.5, x2: sideWaistX, y2: -0.5, type: 'h' },
    { label: fmtInches(hipWidth) + ' hip',     x1: 0,            y1: hipLineY + 0.4, x2: hipWidth, y2: hipLineY + 0.4, type: 'h', color: '#b8963e' },
    { label: fmtInches(kneeW) + ' knee',       x1: inseamKneeX,  y1: kneeY + 0.4, x2: sideKneeX, y2: kneeY + 0.4, type: 'h', color: '#b8963e' },
    { label: fmtInches(hemW)  + ' hem',        x1: inseamHemX,   y1: height - 0.5, x2: sideHemX,  y2: height - 0.5, type: 'h', color: '#b8963e' },
    { label: fmtInches(rise)   + ' rise',      x: hipWidth + 1.2, y1: 0,      y2: rise,               type: 'v' },
    { label: fmtInches(inseam) + ' inseam',    x: hipWidth + 1.2, y1: rise,   y2: height,             type: 'v' },
    { label: fmtInches(ext)    + ' ext',       x1: -ext, y1: rise + 0.4, x2: 0, y2: rise + 0.4,   type: 'h', color: '#c44' },
    { label: fmtInches(effSeatDepth) + ' seat', x: -ext - 1.2, y1: 0, y2: effSeatDepth,        type: 'v', color: '#b8963e' },
    { label: fmtInches(outseamLen) + ' outseam', x: hipWidth + 2.8, y1: 0, y2: height, type: 'v', color: '#b8963e' },
    { label: fmtInches(inseamLen) + ' inseam seam', x: -ext - 2.8, y1: rise, y2: height, type: 'v', color: '#b8963e' },
  ];

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
    { x: hipWidth,    y: hipLineY, angle: edgeAngle({ x: hipWidth, y: 0 }, { x: sideKneeX, y: kneeY }) },
    { x: -ext,        y: rise,     angle: edgeAngle({ x: inseamKneeX, y: kneeY }, { x: -ext, y: rise }) },
    { x: sideKneeX,   y: kneeY,    angle: edgeAngle({ x: hipWidth, y: hipLineY }, { x: sideKneeX, y: kneeY }) },
    { x: inseamKneeX, y: kneeY,    angle: edgeAngle({ x: -ext, y: rise }, { x: inseamKneeX, y: kneeY }) },
  ];

  return {
    id: type, name, instruction,
    polygon: poly, saPolygon: saPoly,
    path: polyToPath(poly), saPath: polyToPath(saPoly),
    dimensions: dims, waistWidth, hipWidth, width: hipWidth, height, rise, inseam, ext, cbRaise, sa, hem, isBack,
    notches, crotchBezier: ccp,
    // LOCKED — crotch curve cut & stitch lines are finalized. Do not modify
    // crotchBezier, crotchBezierSA, or their rendering in pattern-view.js.
    crotchBezierSA: insetCrotchBezier(ccp, sa),
    labels: [
      { text: 'SIDE SEAM', x: hipWidth + 0.3, y: height * 0.35, rotation: 90  },
      { text: 'CENTER',    x: -0.5,            y: rise   * 0.3,  rotation: -90 },
    ],
    darts, type: 'panel', opts,
  };
}
