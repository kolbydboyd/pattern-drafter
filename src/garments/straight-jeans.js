// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Straight Jeans — 5-pocket denim with tapered leg shaping.
 * 31 inch default inseam, 10 inch rise.
 * Leg tapers from hip through knee (55% down inseam) to hem per LEG_SHAPES.
 * Zip fly + fly shield, slant front pockets, coin pocket, patch back pockets ×2.
 */

import {
  crotchCurvePoints, sampleBezier, offsetPolygon, polyToPath, dist, arcLength,
  fmtInches, easeDistribution, LEG_SHAPES, edgeAngle, insetCrotchBezier,
  buildSlantPocketBag, buildSlantPocketBacking, clipPanelAtSlash,
  buildScoopPocketBacking, clipPanelAtScoop,
  buildSquareScoopPocketBacking, clipPanelAtSquareScoop,
  buildFoldOverScoopPocketBag, buildFoldOverSquareScoopPocketBag
} from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

export default {
  id: 'straight-jeans',
  name: 'Straight Jeans',
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
        { value: 'skinny',   label: 'Skinny',   reference: '510, spray-on'    },
        { value: 'slim',     label: 'Slim',     reference: '511, cigarette'   },
        { value: 'straight', label: 'Straight', reference: '501, regular'     },
        { value: 'bootcut',  label: 'Bootcut',  reference: '527, 70s flare'   },
        { value: 'wide',     label: 'Wide',     reference: 'Yohji, palazzo'   },
      ],
      default: 'straight',
    },
    frontPocket: {
      type: 'select', label: 'Front pockets',
      values: [
        { value: 'slant',        label: 'Slant (western)' },
        { value: 'scoop',        label: 'Scoop (curved)'  },
        { value: 'square-scoop', label: 'Square scoop'    },
        { value: 'side',         label: 'Side seam'       },
        { value: 'none',         label: 'None'            },
      ],
      default: 'slant',
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
    yokeStyle: {
      type: 'select', label: 'Back yoke',
      values: [
        { value: 'none',    label: 'No yoke (darts only)' },
        { value: 'pointed', label: 'Pointed V yoke (classic)' },
        { value: 'curved',  label: 'Curved yoke' },
      ],
      default: 'none',
    },
    yokeDepth: { type: 'number', label: 'Yoke depth at CB (inches)', default: 4, step: 0.25, min: 2.5, max: 5.5 },
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
        { value: 0.75, label: '¾″ chain-stitch style' },
        { value: 1,    label: '1″'                    },
        { value: 1.5,  label: '1½″ (cuff)'            },
      ],
      default: 1,
    },
  },

  pieces(m, opts) {
    const ease     = easeDistribution(opts.ease);
    const sa       = parseFloat(opts.sa)       || 0.625;
    const hem      = parseFloat(opts.hem)      || 1;
    const frontExt = parseFloat(opts.frontExt) || 2;
    const backExt  = parseFloat(opts.backExt)  || 3;
    const cbRaise  = parseFloat(opts.cbRaise)  || 1.25;
    const RISE_OFFSETS = { 'ultra-low': -2.5, low: -1.5, mid: 0, high: 1.5, 'ultra-high': 3.0 };
    const baseRise  = m.rise || 10;
    const riseOff   = RISE_OFFSETS[opts.riseStyle] ?? 0;
    const crotchEase = 1.25; // ease below body rise — prevents fabric pulling tight against crotch
    const rawRise   = parseFloat(opts.riseOverride) || (baseRise + riseOff);
    const rise      = rawRise + crotchEase;
    const inseam   = m.inseam || (m.outseam ? Math.max(1, m.outseam - rise) : 31);
    const shape    = LEG_SHAPES[opts.legShape] || LEG_SHAPES.straight;

    const hip   = m.hip   || 36;
    const waist = m.waist || 32;

    let frontHipW   = hip / 4 + ease.front + 0.5;
    let backHipW    = hip / 4 + ease.back;
    const frontWaistW = waist / 4 + ease.front;
    const backWaistW  = waist / 4 + ease.back;
    const hipLineY    = m.seatDepth || 7;

    // Thigh ease check — widen panels if thigh circumference is tight
    if (m.thigh) {
      const patternThigh = (frontHipW + backHipW + frontExt + backExt) * 2;
      const minThigh = m.thigh * 2 + 3;
      if (patternThigh < minThigh) {
        const perPanel = (minThigh - patternThigh) / 4;
        frontHipW += perPanel;
        backHipW += perPanel;
        console.warn(`[straight-jeans] Thigh ease insufficient (${(patternThigh - m.thigh * 2).toFixed(1)}\u2033): widened panels by ${perPanel.toFixed(2)}\u2033 each`);
      } else if (patternThigh - m.thigh * 2 < 2) {
        console.warn(`[straight-jeans] Thigh ease is tight: ${(patternThigh - m.thigh * 2).toFixed(1)}\u2033 (recommend \u2265 2\u2033)`);
      }
    }
    const H           = rise + inseam;

    const pieces = [];

    pieces.push(buildPanel({
      type: 'front', name: 'Front Panel',
      instruction: 'Cut 2 (mirror L & R) · Curve on CENTER · Mark knee point',
      waistWidth: frontWaistW, hipWidth: frontHipW, hipLineY,
      height: H, rise, inseam,
      ext: frontExt, cbRaise: 0, sa, hem,
      isBack: false, shape, opts,
      calf: m.calf, ankle: m.ankle, seatDepth: m.seatDepth,
    }));

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

    // ── YOKE SPLIT (replaces full back panel with yoke + lower panel) ──
    if (opts.yokeStyle && opts.yokeStyle !== 'none') {
      const yokeDepthCB = parseFloat(opts.yokeDepth) || 4;
      const backIdx = pieces.findIndex(p => p.id === 'back');
      const backPanel = pieces[backIdx];
      const { yoke, lower } = splitBackYoke(backPanel, { yokeStyle: opts.yokeStyle, yokeDepthCB, hipLineY });
      pieces.splice(backIdx, 1, yoke, lower);
    }

    // ── WAISTBAND ──
    const wbLen = waist + ease.total + sa * 2;
    pieces.push({
      id: 'waistband',
      name: 'Waistband',
      instruction: `Cut 1 on fold · Interface · 1½″ finished · Belt loops ×${waist > 36 ? 7 : 6}`,
      dimensions: { length: wbLen, width: 3 },
      type: 'rectangle', sa,
    });

    // ── FLY SHIELD (J-curve) ──
    pieces.push(buildFlyShield(rise));

    // ── POCKETS ──
    if (opts.frontPocket === 'slant') {
      // Facing: self-fabric, extends ~1″ below slash opening (7″ deep). Visible from outside.
      pieces.push(buildSlantPocketBacking({ bagWidth: 7, slashInset: 3.5, slashDepth: 6, bagDepth: 7, sa, instruction: 'Cut 2 (1 + 1 mirror) \xb7 Self fabric (denim) \xb7 Pocket facing (visible from outside)' }));
      // Bag: lining, inner edge on fold. Scoop curve is the back of the pocket.
      pieces.push(buildSlantPocketBag({ bagWidth: 7, slashInset: 3.5, slashDepth: 6, bagDepth: 11.5, sa, instruction: 'Cut 2 on fold (1 + 1 mirror) \xb7 Lining (muslin or drill) \xb7 Inner edge on fold \xb7 Scoop curve is pocket back' }));
    }
    if (opts.frontPocket === 'scoop') {
      // Facing: self-fabric. Serge curved bottom edge before assembling.
      pieces.push(buildScoopPocketBacking({ bagWidth: 7, scoopInset: 3.5, scoopDepth: 6, bagDepth: 7, sa, instruction: 'Cut 2 (1 + 1 mirror) \xb7 Self fabric (denim) \xb7 Visible pocket front \xb7 {serge} curved bottom edge before assembling' }));
      // Bag: fold-over lining. Cut on fold at inner (left) edge. French seam at bottom.
      pieces.push(buildFoldOverScoopPocketBag({ bagWidth: 7, scoopInset: 3.5, scoopDepth: 6, bagDepth: 11.5, sa, instruction: 'Cut 2 on fold (1 + 1 mirror) \xb7 Lining (muslin or drill) \xb7 Fold line at inner (left) edge \xb7 French seam at bottom after attaching to panel' }));
    }
    if (opts.frontPocket === 'square-scoop') {
      pieces.push(buildSquareScoopPocketBacking({ bagWidth: 7, scoopInset: 3.5, scoopDepth: 6, bagDepth: 7, sa, instruction: 'Cut 2 (1 + 1 mirror) \xb7 Self fabric (denim) \xb7 Visible pocket front \xb7 {serge} curved bottom edge before assembling' }));
      pieces.push(buildFoldOverSquareScoopPocketBag({ bagWidth: 7, scoopInset: 3.5, scoopDepth: 6, bagDepth: 11.5, sa, instruction: 'Cut 2 on fold (1 + 1 mirror) \xb7 Lining (muslin or drill) \xb7 Fold line at inner (left) edge \xb7 French seam at bottom after attaching to panel' }));
    }
    if (opts.frontPocket === 'side') {
      pieces.push({ id: 'side-bag', name: 'Side-Seam Pocket Bag', instruction: 'Cut 4 (2 per side)', dimensions: { width: 7, height: 9 }, type: 'pocket', sa });
    }
    pieces.push({ id: 'coin-pocket', name: 'Coin Pocket', instruction: 'Cut 2 (outer + lining) \xb7 Right front only \xb7 \u215e\u2033 SA \xb7 {serge} edges \xb7 Rounded bottom corners', dimensions: { width: 3, height: 3.5 }, type: 'pocket', sa: 0.375, cornerRadius: 0.5 });
    pieces.push(buildBackPatchPocket());

    // ── BELT LOOPS ──
    // Finished: ¾″ wide × ~2¾″ tall. Cut strip: 2¼″ wide (fold in thirds) × 3½″ long (includes turn-under).
    const beltLoopCount = waist > 36 ? 7 : 6;
    pieces.push({ id: 'belt-loop', name: 'Belt Loops', instruction: `Cut ${beltLoopCount} strips · 2¼″ × 3½″ cut · {press} in thirds to ¾″ wide · {topstitch} both edges · Finished ¾″ × ~2¾″`, dimensions: { width: 3.5, height: 2.25 }, type: 'rectangle', sa: 0 });

    return pieces;
  },

  materials(m, opts) {
    const notions = [
      { ref: 'interfacing-med', quantity: '0.5 yard (waistband + pocket facings)' },
      { name: 'Metal zipper', quantity: `${Math.ceil((m.rise || 10) * 0.6)}″`, notes: 'YKK #5 metal or equivalent' },
      { name: 'Waistband button', quantity: '1', notes: '¾″ jeans tack button, no-sew' },
      { name: 'Copper rivets', quantity: '5–6', notes: 'At pocket corners and stress points' },
    ];

    return buildMaterialsSpec({
      fabrics: ['denim', 'stretch-denim'],
      notions,
      thread: 'poly-heavy',
      needle: 'denim-100',
      stitches: ['straight-2.5', 'straight-3.5', 'bartack'],
      notes: [
        '{topstitch} with 3.5mm stitch and contrasting gold/amber thread for the classic jeans look. Use a {topstitch} needle for heavier thread',
        'Fell seams on inseam and outseam: after sewing, {press} seam to one side, fold raw edge under, {topstitch} from RS two rows visible',
        'Pre-wash denim once (hot wash, dry on high) to pre-shrink before cutting',
        'Use a denim needle (100/16) and heavy polyester thread 30wt; lighter thread will break under tension',
        'Copper rivet all high-stress points: bottom of front pocket openings, coin pocket sides, crotch junction',
        '{press} denim with a damp cloth. Dry pressing may leave shine marks on dark denim',
      ],
    });
  },

  instructions(m, opts) {
    const steps = [];
    let n = 1;

    steps.push({
      step: n++, title: 'Prepare back patch pockets',
      detail: 'Make a cardboard press template the finished pocket size (no SA). {press} SA under around template. Remove template. Add arcuate topstitching design. Position pockets on back panels, centered on the seat. {topstitch} sides and bottom at 3.5mm with gold thread. Bar tack top corners.',
    });
    const isScoop = opts.frontPocket === 'scoop' || opts.frontPocket === 'square-scoop';
    if (isScoop) {
      steps.push({ step: n++, title: 'Attach coin pocket to right pocket backing',
        detail: 'Construct the coin pocket first: sew outer to lining {RST} on both sides and the bottom. Trim SA to 3mm, {clip} bottom corners diagonally, turn RS out, push corners with {point turner}, {press}. Then {press} \u215e\u2033 SA under on the sides and bottom (top edge stays raw). Align the coin pocket to the placement mark on the RS of the RIGHT backing piece, upper-right corner, with the top raw edge flush with the backing top edge. {topstitch} around sides and bottom with contrasting thread \xbc\u2033 from the folded edges. {bartack} the top two corners.' });
      steps.push({ step: n++, title: 'Prepare pocket backing',
        detail: '{serge} or overlock the curved bottom edge of the pocket backing (self fabric). Leave all other edges raw. This finished edge will hang free inside the assembled pocket.' });
      steps.push({ step: n++, title: 'Baste backing to fold-over bag (outer layer)',
        detail: 'Lay the fold-over pocket bag flat, unfolded, with the outer half face up (the half that will be at the side seam when folded). Place the backing piece WS-to-WS on the outer half, aligning the top and side-seam edges. The backing\u2019s serged bottom edge hangs free over the bag. {baste} around the top and side-seam edges to join backing to the outer layer. The backing is now temporarily joined as one unit with the bag.' });
      steps.push({ step: n++, title: 'Attach pocket unit to front panel',
        detail: 'The front panel is cut along the scoop curve. Align the pocket unit\u2019s opening edge to the front panel\u2019s scoop edge {RST}, backing face to panel RS. Sew along the opening curve. {clip} into the seam allowance every \xbd\u2033. Turn the pocket to the wrong side of the panel. {press}. {understitch} through the backing and both SAs so the seam rolls to the inside. {topstitch} \xbc\u2033 from the scoop edge.' });
      steps.push({ step: n++, title: 'Fold bag and French seam the bottom',
        detail: 'Fold the pocket bag at the fold line (inner left edge) {RST}, aligning the bottom curved edges. The backing folds to the inside. Pin the bottom curve. Stitch 3\u2044\u2088\u2033 from the raw edge. Trim SA to \u215b\u2033. {clip} the curve every \xbd\u2033. Flip the bag WST (turning it so WS faces in). Stitch again \xbc\u2033 from the fold-enclosed edge to complete the French seam. {press} the bottom curve. The bag now has a clean fold at the inner edge and a finished French seam at the bottom.' });
      steps.push({ step: n++, title: 'Baste pocket bag edges',
        detail: '{baste} the top edge and side seam edge of the pocket bag to the front panel\u2019s seam allowances. The pocket is now enclosed when the waist and side seams are sewn.' });
    } else {
      steps.push({ step: n++, title: 'Sew pocket backing to pocket bag',
        detail: 'Place the pocket backing (self fabric) on the pocket bag (lining) {RST}. Sew along the curved bottom edge and the straight left side. Leave the top (waist), right side seam edge, and slash diagonal open. {clip} the curved seam allowance. Turn right side out so the backing faces outward. {press} flat. {topstitch} \xbc\u2033 from the curved edge if desired. The pocket unit is now one piece with two layers.' });
      steps.push({ step: n++, title: 'Attach pocket to front panel',
        detail: 'The front panel is cut off at the slash line (the diagonal from waist to side seam). Align the pocket unit\u2019s slash diagonal edge to the front panel\u2019s slash edge {RST}. The pocket backing should face the front panel RS. Sew along the slash. {clip} the seam allowance. Turn the pocket to the wrong side of the panel. {press}. {understitch} through the pocket backing and both SAs so the seam rolls to the inside. {baste} the pocket\u2019s top edge to the panel\u2019s waist SA. {baste} the pocket\u2019s side seam edge to the panel\u2019s side SA. The pocket is now enclosed when the waist and side seams are sewn.' });
    }
    if (!isScoop) {
      steps.push({ step: n++, title: 'Attach coin pocket to right pocket backing',
        detail: 'Construct the coin pocket: sew outer to lining {RST} on sides and bottom, trim SA to 3mm, {clip} corners diagonally, turn RS out, push corners with {point turner}, {press}. {press} \u215e\u2033 SA under on sides and bottom (top raw). Align to the placement mark on the RS of the right pocket backing, upper-right corner. {topstitch} with contrasting thread \xbc\u2033 from edges. {bartack} the top two corners.' });
    }
    const hasYoke = opts.yokeStyle && opts.yokeStyle !== 'none';
    if (hasYoke) {
      steps.push({
        step: n++, title: 'Sew back yoke to lower back panels',
        detail: `Sew back yoke to lower back panel {RST} along the ${opts.yokeStyle === 'pointed' ? 'V-shaped' : 'curved'} yoke seam. Match notches at side seam, midpoint, and CB. {press} SA toward yoke. Trim lower panel SA to \xbc\u2033. Fold yoke SA over the trimmed edge. {topstitch} with gold thread at 3.5mm, two rows visible from RS. Repeat for mirror side.`,
      });
      steps.push({
        step: n++, title: 'Join back panels at CB',
        detail: 'Join the two yoke+lower-back assemblies at CB crotch seam. {clip} curve. Fell seam toward left back or {press} open for stretch denim.',
      });
    } else {
      steps.push({
        step: n++, title: 'Join back panels at CB',
        detail: 'Join back panels at CB crotch seam. {clip} curve. Fell seam toward left back or {press} open for stretch denim.',
      });
    }
    steps.push({
      step: n++, title: 'Install zip fly',
      detail: 'Interface fly shield. {staystitch} CF seam allowances. Sew front panels at CF from crotch point up to bottom of fly. Sew zipper (RS up) to right CF extension. Sew fly shield to left extension. Pin and {topstitch} the fly J-curve from RS using {topstitch} thread. Secure fly shield to inside.',
    });
    steps.push({
      step: n++, title: 'Sew outseams (side seams)',
      detail: 'Join front to back at outseam {RST}. {press} toward back. {topstitch} outseam fell: fold back panel SA over front, {topstitch} two rows ⅛″ and ¼″ from seam edge (visible from RS as double {topstitch}).',
    });
    steps.push({
      step: n++, title: 'Sew inseam',
      detail: 'Continuous seam from hem to hem. {clip} crotch curve. Fell toward front: fold front inseam SA over, {press}, {topstitch} from RS.',
    });
    steps.push({
      step: n++, title: 'Construct and attach waistband',
      detail: 'Interface waistband. Sew to jeans waist {RST}, matching CB, side seams, CF. Fold over. {topstitch} top and bottom edge with gold {topstitch} thread. Install jeans tack button at CF overlap. Make machine buttonhole or use eyelet.',
    });
    steps.push({
      step: n++, title: 'Attach belt loops',
      detail: '{press} loop strips in thirds. {topstitch} both edges. Cut to length. Pin at CB, side seams, and flanking CF fly. Fold under ends, {topstitch} top and bottom with a bar tack.',
    });
    steps.push({ step: n++, title: 'Set rivets', detail: 'Using rivet setter, place copper rivets at both ends of each front pocket opening (waist-seam end and side-seam end, marked on pattern) and at the sides of the coin pocket. Add one at the crotch seam junction if fabric is heavy.' });
    steps.push({ step: n++, title: 'Hem', detail: `Fold hem up ${fmtInches(parseFloat(opts.hem) || 1)} twice. {topstitch} with 3.5mm gold thread. For chain-stitch look, use a single fold and a serger with chainstitch if available.` });
    steps.push({ step: n++, title: 'Finish', detail: '{press} seams. Bar tack all remaining stress points. Turn jeans inside out and {press} seam allowances flat with damp cloth.' });

    return steps;
  },

  variants: [
    { id: 'slim-jeans', name: 'Slim Jeans', defaults: { ease: 'slim', legShape: 'slim' } },
    { id: 'high-rise-jeans', name: 'High-Rise Jeans', defaults: { riseStyle: 'high', legShape: 'straight' } },
  ],
};


// ── Back patch pocket (pentagon with pointed bottom) ────────────────────

function buildBackPatchPocket() {
  const pocketSA = 0.375;     // 3/8″ SA for patch pockets (pressed under)
  const w = 5.5;              // pocket width
  const sideH = 5;            // straight side height before angling inward
  const totalH = 6.5;         // total height (top to point)

  // Pentagon: top edge, two straight sides, two angled sides meeting at point
  const poly = [
    { x: 0, y: 0 },            // top-left
    { x: w, y: 0 },            // top-right
    { x: w, y: sideH },        // right side, start of angle
    { x: w / 2, y: totalH },   // bottom center point
    { x: 0, y: sideH },        // left side, start of angle
  ];

  const saPoly = offsetPolygon(poly, (i, a, b) => {
    // Top edge gets 1/2″ SA (double fold for clean finish)
    if (Math.abs(a.y) < 0.1 && Math.abs(b.y) < 0.1) return -0.5;
    return -pocketSA;
  });

  return {
    id: 'back-pocket',
    name: 'Back Patch Pocket',
    instruction: 'Cut 2 · ⅜″ SA sides/bottom, ½″ SA top · {press} under using cardboard template · {topstitch} to back panel · Add arcuate stitching',
    polygon: poly,
    saPolygon: saPoly,
    path: polyToPath(poly),
    saPath: polyToPath(saPoly),
    width: w, height: totalH,
    sa: pocketSA, type: 'bodice',
    isCutOnFold: false,
    dimensions: [
      { label: fmtInches(w) + ' width', x1: 0, y1: -0.4, x2: w, y2: -0.4, type: 'h' },
      { label: fmtInches(totalH) + ' height', x: w + 0.8, y1: 0, y2: totalH, type: 'v' },
    ],
  };
}


// ── Fly shield with J-curve ──────────────────────────────────────────────

function buildFlyShield(rise) {
  const shieldSA = 0.25;                  // 1/4″ SA — sewn RST and turned
  const w = 2.5;                          // shield width
  const flyLen = Math.ceil(rise * 0.6);   // fly opening length (~60% of rise)
  const h = flyLen + 1;                   // shield height: fly length + 1″ below fly base
  const r = 1.25;                         // J-curve radius at bottom

  // Polygon CW: CF edge (left, straight), top, right edge, J-curve, back to CF
  const poly = [];
  poly.push({ x: 0, y: 0 });            // top-left (CF at waist)
  poly.push({ x: w, y: 0 });            // top-right
  poly.push({ x: w, y: h - r });        // right edge stops above J-curve

  // J-curve: quarter-circle from right edge to bottom CF
  const jPts = sampleBezier(
    { x: w, y: h - r },                  // start: right edge
    { x: w, y: h - r * 0.45 },           // cp1: pulls down
    { x: r * 0.45, y: h },               // cp2: pulls across
    { x: 0, y: h },                      // end: bottom at CF
    12,
  );
  for (let i = 1; i < jPts.length; i++) {
    poly.push({ ...jPts[i], ...(i < jPts.length - 1 ? { curve: true } : {}) });
  }
  // closes back to top-left along CF

  const saPoly = offsetPolygon(poly, (i, a, b) => {
    // CF edge (left side, x≈0): no SA — sits on center front seam
    if (Math.abs(a.x) < 0.1 && Math.abs(b.x) < 0.1) return 0;
    return -shieldSA;
  });

  return {
    id: 'fly-shield',
    name: 'Fly Shield',
    instruction: 'Cut 2 (outer + lining) · Interface outer · ¼″ SA · Sew {RST}, turn, {press} · {topstitch} J-curve from RS',
    polygon: poly,
    saPolygon: saPoly,
    path: polyToPath(poly),
    saPath: polyToPath(saPoly),
    width: w, height: h,
    sa: shieldSA, type: 'bodice',
    isCutOnFold: false,
    dimensions: [
      { label: fmtInches(w) + ' width',  x1: 0, y1: -0.4, x2: w, y2: -0.4, type: 'h' },
      { label: fmtInches(h) + ' height', x: w + 0.8, y1: 0, y2: h, type: 'v' },
    ],
    labels: [
      { text: 'CF', x: -0.4, y: h * 0.4, rotation: -90 },
    ],
  };
}


// ── Panel builder with knee-point leg shaping ─────────────────────────────

function buildPanel({ type, name, instruction, waistWidth, hipWidth, hipLineY, height, rise, inseam, ext, cbRaise, sa, hem, isBack, shape, opts, calf, ankle, seatDepth, dartIntake = 0 }) {
  const ccp      = crotchCurvePoints(0, 0, rise, ext, isBack, cbRaise);
  const curvePts = sampleBezier(ccp.p0, ccp.p1, ccp.p2, ccp.p3, 96);

  // Knee sits 55% down the inseam from the crotch
  const kneeY      = rise + inseam * 0.55;
  // If calf/ankle provided, derive per-panel width from body measurement; else use shape ratios
  const kneeW      = calf  ? calf  / 2 + 0.5 : hipWidth * shape.knee;
  const hemW       = ankle ? ankle / 2 + 0.5 : hipWidth * shape.hem;

  // Each leg narrows symmetrically — half on side seam, half on inseam
  const kneeInward = (hipWidth - kneeW) * 0.5;
  const hemInward  = (hipWidth - hemW)  * 0.5;

  const sideKneeX    =  hipWidth - kneeInward;
  const sideHemX     =  hipWidth - hemInward;
  const inseamKneeX  = -ext   + kneeInward;
  const inseamHemX   = -ext   + hemInward;

  // Waist-to-hip shaping: all taper on side seam, center seam stays at x=0
  const sideWaistX = waistWidth;

  const poly = [];
  poly.push({ x: 0,            y: isBack ? -cbRaise : 0 });   // waist at center seam (raised on back)
  poly.push({ x: sideWaistX,   y: 0       });   // waist at side seam
  poly.push({ x: hipWidth,     y: hipLineY });   // hip at side seam
  poly.push({ x: sideKneeX,    y: kneeY   });   // knee on side seam
  poly.push({ x: sideHemX,     y: height  });   // hem at side seam
  poly.push({ x: inseamHemX,   y: height  });   // hem at inseam
  poly.push({ x: inseamKneeX,  y: kneeY   });   // knee on inseam
  poly.push({ x: -ext,         y: rise    });   // crotch extension point
  for (let i = curvePts.length - 2; i >= 1; i--) poly.push({ ...curvePts[i], curve: true });
  if (isBack && cbRaise > 0) poly.push({ x: 0, y: cbRaise }); // CB seam top

  const hasSlash = !isBack && opts?.frontPocket === 'slant';
  const hasScoop = !isBack && opts?.frontPocket === 'scoop';
  const hasSquareScoop = !isBack && opts?.frontPocket === 'square-scoop';
  if (hasSlash) clipPanelAtSlash(poly, sideWaistX, 3.5, 6);
  if (hasScoop) clipPanelAtScoop(poly, sideWaistX, 3.5, 6);
  if (hasSquareScoop) clipPanelAtSquareScoop(poly, sideWaistX, 3.5, 6);

  // SA offset — match edges by geometry (sanitizePoly changes vertex order/count)
  const sideIdx = hasSlash ? 2 : 1;
  const saPoly = offsetPolygon(poly, (i, a, b) => {
    if (Math.abs(a.y - height) < 0.5 && Math.abs(b.y - height) < 0.5) return -hem;
    return -sa;
  });

  const effSeatDepth = seatDepth || 7;

  // Compute seam lengths for cross-reference labels
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

  // Notch marks: hip on side seam, crotch junction, knee on both seams
  const notches = [
    { x: hipWidth,    y: hipLineY,        angle: edgeAngle({ x: hipWidth, y: 0 }, { x: sideKneeX, y: kneeY }) },
    ...(isBack ? [{ x: hipWidth, y: hipLineY + 0.25, angle: edgeAngle({ x: hipWidth, y: 0 }, { x: sideKneeX, y: kneeY }) }] : []),
    { x: -ext,        y: rise,            angle: edgeAngle({ x: inseamKneeX, y: kneeY }, { x: -ext, y: rise }) },
    ...(isBack ? [{ x: -ext, y: rise - 0.25,         angle: edgeAngle({ x: inseamKneeX, y: kneeY }, { x: -ext, y: rise }) }] : []),
    { x: sideKneeX,   y: kneeY,           angle: edgeAngle({ x: hipWidth, y: hipLineY }, { x: sideKneeX, y: kneeY }) },
    { x: inseamKneeX, y: kneeY,           angle: edgeAngle({ x: -ext, y: rise }, { x: inseamKneeX, y: kneeY }) },
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


// ── Yoke split for back panel ───────────────────────────────────────────────

function splitBackYoke(backPanel, { yokeStyle, yokeDepthCB, hipLineY }) {
  const { waistWidth, hipWidth, cbRaise, sa, hem, rise, inseam, ext, height,
          polygon, crotchBezier, crotchBezierSA, notches: origNotches, opts } = backPanel;

  const yokeSideDepth = 1.5; // yoke at side seam (~1.5″ below waist)
  // Interpolate the side seam x at yokeSideDepth — original side seam runs
  // diagonally from (waistWidth, 0) to (hipWidth, hipLineY)
  const sideXAtYoke = waistWidth + (hipWidth - waistWidth) * (yokeSideDepth / hipLineY);

  // ── Yoke seam curve from side seam → CB ────────────────────────────────
  const seamPts = [];
  if (yokeStyle === 'curved') {
    const p0 = { x: sideXAtYoke, y: yokeSideDepth };
    const p3 = { x: 0, y: yokeDepthCB };
    const p1 = { x: sideXAtYoke * 0.6,  y: yokeSideDepth + (yokeDepthCB - yokeSideDepth) * 0.35 };
    const p2 = { x: sideXAtYoke * 0.25, y: yokeDepthCB   - (yokeDepthCB - yokeSideDepth) * 0.1  };
    const pts = sampleBezier(p0, p1, p2, p3, 16);
    for (let i = 1; i < pts.length - 1; i++) seamPts.push({ ...pts[i], curve: true });
  }
  // 'pointed': no intermediate points — straight line forms the V

  // ── YOKE polygon (clockwise) ──────────────────────────────────────────
  const yokePoly = [];
  yokePoly.push({ x: 0,           y: -cbRaise       }); // CB waist (raised)
  yokePoly.push({ x: waistWidth,  y: 0               }); // side waist
  yokePoly.push({ x: sideXAtYoke, y: yokeSideDepth   }); // yoke seam at side
  for (const pt of seamPts) yokePoly.push(pt);
  yokePoly.push({ x: 0,        y: yokeDepthCB     }); // yoke seam at CB

  // ── LOWER BACK polygon (clockwise) ────────────────────────────────────
  const lowerPoly = [];
  lowerPoly.push({ x: 0,        y: yokeDepthCB    }); // yoke seam at CB
  for (let i = seamPts.length - 1; i >= 0; i--) lowerPoly.push({ ...seamPts[i] });
  lowerPoly.push({ x: sideXAtYoke, y: yokeSideDepth  }); // yoke seam at side
  // Copy hip → knee → hem → inseam → crotch → crotch curve from original.
  // Filter out crotch curve points above the yoke cut and the {0, cbRaise}
  // structural point (it belongs to the yoke, not the lower panel).
  for (let i = 2; i < polygon.length; i++) {
    const pt = polygon[i];
    if (pt.curve && pt.y < yokeDepthCB) continue;
    if (!pt.curve && Math.abs(pt.x) < 0.01 && Math.abs(pt.y - cbRaise) < 0.01) continue;
    lowerPoly.push({ ...pt });
  }

  // ── SA offset ─────────────────────────────────────────────────────────
  const yokeSaPoly = offsetPolygon(yokePoly, () => -sa);
  const lowerSaPoly = offsetPolygon(lowerPoly, (i, a, b) => {
    if (Math.abs(a.y - height) < 0.5 && Math.abs(b.y - height) < 0.5) return -hem;
    return -sa;
  });

  // ── Seam lengths ──────────────────────────────────────────────────────
  let yokeSeamLen = dist({ x: sideXAtYoke, y: yokeSideDepth }, seamPts[0] || { x: 0, y: yokeDepthCB });
  for (let i = 0; i < seamPts.length - 1; i++) yokeSeamLen += dist(seamPts[i], seamPts[i + 1]);
  if (seamPts.length) yokeSeamLen += dist(seamPts[seamPts.length - 1], { x: 0, y: yokeDepthCB });
  const yokeW = waistWidth;
  const yokeH = yokeDepthCB + cbRaise;

  // ── Yoke notches (mid-seam alignment mark) ────────────────────────────
  const seamMidIdx = Math.floor(seamPts.length / 2);
  const seamMidPt  = seamPts.length
    ? seamPts[seamMidIdx]
    : { x: sideXAtYoke * 0.5, y: (yokeSideDepth + yokeDepthCB) / 2 };
  const seamEndA = seamPts.length ? seamPts[Math.max(0, seamMidIdx - 1)] : { x: sideXAtYoke, y: yokeSideDepth };
  const seamEndB = seamPts.length ? seamPts[Math.min(seamPts.length - 1, seamMidIdx + 1)] : { x: 0, y: yokeDepthCB };

  const yokeNotches = [
    { x: sideXAtYoke, y: yokeSideDepth, angle: edgeAngle({ x: waistWidth, y: 0 }, { x: hipWidth, y: hipLineY }) },
    { x: seamMidPt.x, y: seamMidPt.y, angle: edgeAngle(seamEndA, seamEndB) },
    { x: 0, y: yokeDepthCB, angle: 0 },
  ];

  // ── Dimensions ────────────────────────────────────────────────────────
  const yokeDims = [
    { label: fmtInches(yokeW) + ' width',     x1: 0, y1: -cbRaise - 0.5, x2: waistWidth, y2: -cbRaise - 0.5, type: 'h' },
    { label: fmtInches(yokeH) + ' depth',     x: waistWidth + 1.2, y1: -cbRaise, y2: yokeDepthCB, type: 'v' },
    { label: fmtInches(yokeSeamLen) + ' seam', x1: 0, y1: yokeDepthCB + 0.5, x2: sideXAtYoke, y2: yokeSideDepth + 0.5, type: 'h', color: '#b8963e' },
  ];

  // Lower panel inherits most of the original dimensions minus waist width
  const lowerDims = backPanel.dimensions.filter(d => !d.label.includes('waist'));
  lowerDims.push({ label: fmtInches(yokeSeamLen) + ' yoke seam', x1: 0, y1: yokeDepthCB - 0.5, x2: sideXAtYoke, y2: yokeSideDepth - 0.5, type: 'h', color: '#b8963e' });

  // ── Build pieces ──────────────────────────────────────────────────────
  const yoke = {
    id: 'back-yoke',
    name: 'Back Yoke',
    instruction: `Cut 2 (mirror L & R) · ${yokeStyle === 'pointed' ? 'Pointed V' : 'Curved'} yoke · Flat-fell to lower back panel`,
    polygon: yokePoly, saPolygon: yokeSaPoly,
    path: polyToPath(yokePoly), saPath: polyToPath(yokeSaPoly),
    dimensions: yokeDims,
    waistWidth, hipWidth, width: sideXAtYoke, height: yokeH,
    rise, inseam, ext, cbRaise, sa, hem, isBack: true,
    notches: yokeNotches,
    labels: [
      { text: 'CB',        x: -0.5,             y: yokeDepthCB * 0.4, rotation: -90 },
      { text: 'SIDE SEAM', x: sideXAtYoke + 0.3, y: yokeSideDepth * 0.5, rotation: 90 },
    ],
    darts: [], type: 'bodice', opts,
  };

  const lower = {
    id: 'back-lower',
    name: 'Back Lower Panel',
    instruction: `Cut 2 (mirror L & R) · Joins to yoke at top · CB raised ${fmtInches(cbRaise)} · Mark knee point`,
    polygon: lowerPoly, saPolygon: lowerSaPoly,
    path: polyToPath(lowerPoly), saPath: polyToPath(lowerSaPoly),
    dimensions: lowerDims,
    waistWidth, hipWidth, width: hipWidth, height,
    rise, inseam, ext, cbRaise, sa, hem, isBack: true,
    notches: [
      ...yokeNotches,
      // Keep original notches for hip, crotch, knee alignment
      ...(origNotches || []),
    ],
    crotchBezier,
    crotchBezierSA,
    labels: [
      { text: 'SIDE SEAM', x: hipWidth + 0.3, y: height * 0.35, rotation: 90  },
      { text: 'CENTER',    x: -0.5,            y: rise   * 0.3,  rotation: -90 },
    ],
    darts: [], type: 'panel', opts,
  };

  return { yoke, lower };
}
