// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Cargo Shorts — first complete garment module.
 * Uses lower body block for front/back panels.
 * Adds cargo pockets, slant pockets, patch back pocket, elastic waistband.
 */

import {
  crotchCurvePoints, sampleBezier, offsetPolygon, polyToPath,
  fmtInches, easeDistribution, LEG_SHAPES, edgeAngle, insetCrotchBezier,
  buildSlantPocketBag, buildSlantPocketBacking, clipPanelAtSlash
} from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

export default {
  id: 'cargo-shorts',
  name: 'Cargo Shorts',
  category: 'lower',
  difficulty: 'intermediate',
  priceTier: 'core',
  measurements: ['waist', 'hip', 'rise', 'thigh', 'inseam'],
  measurementDefaults: { inseam: 10 },

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
    frontPocket: {
      type: 'select', label: 'Front pockets',
      values: [
        { value: 'none', label: 'None' },
        { value: 'slant', label: 'Slant (western)' },
        { value: 'side', label: 'Side seam' },
      ],
      default: 'slant',
    },
    cargo: {
      type: 'select', label: 'Cargo pockets',
      values: [
        { value: 'none', label: 'None' },
        { value: 'cargo', label: 'Cargo with flap' },
      ],
      default: 'cargo',
    },
    backPocket: {
      type: 'select', label: 'Back pockets',
      values: [
        { value: 'none', label: 'None' },
        { value: 'patch1', label: 'Patch ×1' },
        { value: 'patch2', label: 'Patch ×2' },
      ],
      default: 'patch1',
    },
    fly: {
      type: 'select', label: 'Closure',
      values: [
        { value: 'none', label: 'Elastic waistband' },
        { value: 'drawstring', label: 'Drawstring (no elastic)' },
        { value: 'zip', label: 'Zip fly' },
        { value: 'button', label: 'Button fly' },
      ],
      default: 'none',
    },
    elasticWidth: {
      type: 'select', label: 'Elastic / casing width',
      values: [
        { value: 0.75, label: '¾″ (1¾″ finished waistband → 3½″ cut)' },
        { value: 1,    label: '1″ (2″ finished waistband → 4″ cut)' },
        { value: 1.5,  label: '1½″ (2½″ finished waistband → 5″ cut)' },
        { value: 2,    label: '2″ (3″ finished waistband → 6″ cut)' },
      ],
      default: 1,
      showWhen: { fly: ['none', 'drawstring'] },
    },
    internalBelt: {
      type: 'select', label: 'Internal belt',
      values: [
        { value: 'none', label: 'None' },
        { value: 'webbing', label: 'Nylon webbing (holster/EDC support)' },
      ],
      default: 'none',
    },
    frontExt: { type: 'number', label: 'Front crotch ext', default: 2, step: 0.25, min: 0.5, max: 3 },
    backExt: { type: 'number', label: 'Back crotch ext', default: 2.5, step: 0.25, min: 1, max: 4 },
    sa: {
      type: 'select', label: 'Seam allowance',
      values: [
        { value: 0.375, label: '⅜″' },
        { value: 0.5, label: '½″' },
        { value: 0.625, label: '⅝″' },
        { value: 1, label: '1″' },
      ],
      default: 0.625,
    },
    hem: {
      type: 'select', label: 'Hem allowance',
      values: [
        { value: 0.5, label: '½″' },
        { value: 1, label: '1″' },
        { value: 1.5, label: '1½″' },
        { value: 2, label: '2″ (cuff)' },
      ],
      default: 1,
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
      default: 'mid',
    },
    riseOverride: { type: 'number', label: 'Rise override (inches)', default: 0, step: 0.25, min: 0, max: 18 },
    cbRaise: { type: 'number', label: 'CB raise', default: 1.25, step: 0.25, min: 0, max: 2.5 },
  },

  /**
   * Generate all pattern pieces
   */
  pieces(m, opts) {
    const ease = easeDistribution(opts.ease);
    const sa = parseFloat(opts.sa);
    const hem = parseFloat(opts.hem);
    const frontExt = parseFloat(opts.frontExt);
    const backExt = parseFloat(opts.backExt);
    const cbRaise = parseFloat(opts.cbRaise);

    let frontW = m.hip / 4 + ease.front;
    let backW = m.hip / 4 + ease.back;

    // Thigh ease check — widen panels if thigh circumference is tight
    if (m.thigh) {
      const patternThigh = (frontW + backW + frontExt + backExt) * 2;
      const minThigh = m.thigh * 2 + 3;
      if (patternThigh < minThigh) {
        const perPanel = (minThigh - patternThigh) / 4;
        frontW += perPanel;
        backW += perPanel;
        console.warn(`[cargo-shorts] Thigh ease insufficient (${(patternThigh - m.thigh * 2).toFixed(1)}\u2033): widened panels by ${perPanel.toFixed(2)}\u2033 each`);
      } else if (patternThigh - m.thigh * 2 < 2) {
        console.warn(`[cargo-shorts] Thigh ease is tight: ${(patternThigh - m.thigh * 2).toFixed(1)}\u2033 (recommend \u2265 2\u2033)`);
      }
    }

    const RISE_OFFSETS = { 'ultra-low': -2.5, low: -1.5, mid: 0, high: 1.5, 'ultra-high': 3.0 };
    const baseRise  = m.rise || 10;
    const riseOff   = RISE_OFFSETS[opts.riseStyle] ?? 0;
    const crotchEase = 0.75; // ease below body rise — prevents fabric pulling tight against crotch
    const rise      = parseFloat(opts.riseOverride) || (baseRise + riseOff + crotchEase);
    const inseam    = m.inseam || (m.outseam ? Math.max(1, m.outseam - rise) : 10);
    const H = rise + inseam;

    const pieces = [];

    // ── FRONT PANEL ──
    pieces.push(buildPanel({
      type: 'front',
      name: 'Front Panel',
      instruction: 'Cut 2 (mirror L & R) · Curve on CENTER seam',
      width: frontW,
      height: H,
      rise: rise,
      inseam,
      ext: frontExt,
      cbRaise: 0,
      sa, hem,
      isBack: false,
      opts, seatDepth: m.seatDepth,
    }));

    // ── BACK PANEL ──
    pieces.push(buildPanel({
      type: 'back',
      name: 'Back Panel',
      instruction: `Cut 2 (mirror L & R) · CB raised ${fmtInches(cbRaise)}`,
      width: backW,
      height: H,
      rise: rise,
      inseam,
      ext: backExt,
      cbRaise,
      sa, hem,
      isBack: true,
      opts, seatDepth: m.seatDepth,
    }));

    // ── WAISTBAND ──
    // Elastic/drawstring: waistband matches garment waist opening. Fly: body waist + overlap.
    const isCasing = opts.fly === 'none' || opts.fly === 'drawstring';
    const flyOverlap = isCasing ? 0 : 2;
    const shortsWaist = (frontW + backW) * 2; // actual waist opening of assembled shorts
    const wbBase = isCasing ? shortsWaist : (m.waist + ease.total);
    const wbLength = wbBase + flyOverlap + sa * 2;
    const elasticW = parseFloat(opts.elasticWidth) || 1;
    // Casing waistband: cut = (elastic/cord width + 1″ ease/fold) × 2. Structured: fixed 3″.
    const wbWidth = isCasing ? (elasticW + 1) * 2 : 3;

    const wbInstruction = [
      `Cut 1 on fold · Interface (2 layers) before cutting · ${fmtInches(wbWidth / 2)} finished`,
      `Notch at CF, CB, and both side seams (front panel = ${fmtInches(frontW)}, back panel = ${fmtInches(backW)} from each side seam)`,
      opts.fly === 'drawstring' ? `Mark 2 buttonholes at CF, 1″ apart, on the inner half (near the fold). On the printed on-fold piece, mark 1 buttonhole ½″ from the fold.` : '',
    ].filter(Boolean).join(' · ');
    pieces.push({
      id: 'waistband',
      name: 'Waistband',
      instruction: wbInstruction,
      dimensions: { length: wbLength, width: wbWidth },
      type: 'rectangle',
      sa,
      notches: [
        { label: 'CF', position: 0 },
        { label: 'Side seam', position: frontW },
        { label: 'CB', position: frontW + backW },
        { label: 'Side seam', position: frontW + backW + backW },
      ],
      marks: opts.fly === 'drawstring' ? [
        { type: 'buttonhole', axis: 'h', position: wbWidth / 2 - 0.5, label: 'drawstring buttonhole (work through both layers at CF)' },
      ] : [],
    });

    // ── POCKET PIECES ──
    if (opts.frontPocket === 'slant') {
      pieces.push(buildSlantPocketBacking({ bagWidth: 7, slashInset: 3.5, slashDepth: 6, bagDepth: 9.5, sa, instruction: 'Cut 2 (1 + 1 mirror) \xb7 Self fabric \xb7 Visible pocket front' }));
      pieces.push(buildSlantPocketBag({ bagWidth: 7, slashInset: 3.5, slashDepth: 6, bagDepth: 9.5, sa, instruction: 'Cut 2 (1 + 1 mirror) \xb7 Lining fabric \xb7 Pocket back (against body)' }));
    }
    if (opts.frontPocket === 'side') {
      pieces.push({ id: 'side-bag', name: 'Side-Seam Pocket Bag', instruction: 'Cut 4 (2 per side)', dimensions: { width: 7, height: 7.5 }, type: 'pocket', sa });
    }
    if (opts.cargo === 'cargo') {
      pieces.push({ id: 'cargo-body', name: 'Cargo Pocket Body', instruction: 'Cut 2 \xb7 9\u2033 wide \xd7 7\u2033 tall cut \xb7 Box pleat at center: \u00bd\u2033 under, \u00bd\u2033 fold back, 2\u2033 on top, \u00bd\u2033 under, \u00bd\u2033 back out (4\u2033 consumed total) \xb7 Finished pocket 5\u2033 wide, expands to 9\u2033', dimensions: { width: 9, height: 7 }, type: 'pocket', sa, marks: [
        { type: 'pleat', axis: 'v', center: 4.5, intake: 2, label: 'box pleat \u00bd\u2033 under + \u00bd\u2033 back + 2\u2033 top ea. side' },
        { type: 'fold', axis: 'h', position: 1, label: 'fold under 1\u2033' },
      ] });
      pieces.push({ id: 'cargo-flap', name: 'Cargo Pocket Flap', instruction: 'Cut 4 (2 outer + 2 lining) \xb7 5\u00bd\u2033 wide \xd7 3\u2033 tall \xb7 Covers finished pocket opening with \u00bc\u2033 overlap each side', dimensions: { width: 5.5, height: 3 }, type: 'pocket', sa });
    }
    if (opts.backPocket !== 'none') {
      const qty = opts.backPocket === 'patch2' ? 2 : 1;
      pieces.push({ id: 'back-patch', name: 'Back Patch Pocket', instruction: `Cut ${qty}${opts.backPocket === 'patch2' ? ' (one per back panel)' : ''}`, dimensions: { width: 6, height: 7 }, type: 'pocket', sa, marks: [
        { type: 'fold', axis: 'h', position: 1, label: 'fold under 1″' },
      ] });
    }
    if (opts.fly === 'zip') {
      pieces.push({ id: 'fly-shield', name: 'Fly Shield', instruction: 'Cut 1 · Interface', dimensions: { width: 3, height: m.rise }, type: 'pocket', sa });
    }
    if (opts.fly === 'button') {
      pieces.push({ id: 'button-placket', name: 'Button Fly Placket', instruction: 'Cut 2 (left + right)', dimensions: { width: 5, height: m.rise }, type: 'pocket', sa });
    }

    return pieces;
  },

  /**
   * Materials / BOM
   */
  materials(m, opts) {
    const ease = easeDistribution(opts.ease);
    const notions = [
      { ref: 'interfacing-med', quantity: '0.5 yard (2 layers for waistband)' },
    ];

    const elasticW = parseFloat(opts.elasticWidth) || 1;
    if (opts.fly === 'none') {
      notions.push({ ref: `elastic-${elasticW}`, quantity: `${Math.round(m.waist * 0.9)}″ of ${fmtInches(elasticW)} wide elastic (adjust at fitting \xb7 should be snug, ~90% of waist)` });
    }
    if (opts.fly === 'drawstring') {
      notions.push({ ref: 'drawstring', quantity: `${Math.round(m.waist + 14)}″ cord or flat drawstring (waist + 14″ for tails)` });
      notions.push({ name: 'Grommets or buttonholes', quantity: '2', notes: '½″ inner dia at CF for drawstring exits (or work 2 vertical buttonholes)' });
    }
    if (opts.fly === 'none' || opts.fly === 'drawstring') {
      if (opts.internalBelt === 'webbing') {
        notions.push({ ref: 'webbing-1.5', quantity: `${Math.round(m.waist + 2)}″ (internal belt for holster support)` });
      }
    }
    if (opts.fly === 'zip') {
      notions.push({ name: 'Zipper', quantity: `${m.rise}″`, notes: 'Metal or nylon coil' });
      notions.push({ name: 'Waistband button', quantity: '1', notes: '¾″ shank button' });
    }
    if (opts.fly === 'button') {
      notions.push({ name: 'Buttons', quantity: '4–5', notes: '⅝″ for fly' });
    }
    if (opts.cargo === 'cargo') {
      notions.push({ ref: 'snaps', quantity: '2 sets (for cargo flaps)' });
    }

    return buildMaterialsSpec({
      fabrics: ['gabardine', 'cotton-twill', 'linen'],
      notions,
      thread: 'poly-all',
      needle: 'universal-90',
      stitches: ['straight-2.5', 'straight-3', 'zigzag-small', 'bartack'],
      notes: [
        'Pre-wash linen (hot wash, tumble dry); shrinks 3–5%',
        'Interface waistband with 2 layers BEFORE cutting',
        ...(opts.internalBelt === 'webbing' ? ['Sew nylon webbing into waistband for holster-clip support'] : []),
        'Bar tack all pocket corners and crotch junction',
        'Finish raw edges with serger or {zigzag}',
      ],
    });
  },

  /**
   * Construction instructions
   */
  instructions(m, opts) {
    const ease = easeDistribution(opts.ease);
    const sa = parseFloat(opts.sa);
    const elasticW = parseFloat(opts.elasticWidth) || 1;
    const frontW = m.hip / 4 + ease.front;
    const backW  = m.hip / 4 + ease.back;
    const steps = [];
    let n = 1;

    // Pockets first
    if (opts.frontPocket === 'slant') {
      steps.push({ step: n++, title: 'Sew pocket backing to pocket bag',
        detail: 'Place the pocket backing (self fabric) on the pocket bag (lining) {RST}. Sew along the curved bottom edge and the straight left side. Leave the top (waist), right side seam edge, and slash diagonal open. {clip} the curved seam allowance. Turn right side out so the backing faces outward. {press} flat. {topstitch} \u00bc\u2033 from the curved edge if desired. The pocket unit is now one piece with two layers. Tension: 3.5\u20134 for straight stitch on pocket seams.' });
      steps.push({ step: n++, title: 'Attach pocket to front panel',
        detail: 'The front panel is cut off at the slash line (the diagonal from waist to side seam). Align the pocket unit\u2019s slash diagonal edge to the front panel\u2019s slash edge {RST}. The pocket backing should face the front panel RS. Sew along the slash. {clip} the seam allowance. Turn the pocket to the wrong side of the panel. {press}. {understitch} through the pocket backing and both SAs so the seam rolls to the inside. {baste} the pocket\u2019s top edge to the panel\u2019s waist SA. {baste} the pocket\u2019s side seam edge to the panel\u2019s side SA. The pocket is now enclosed when the waist and side seams are sewn. Tension: 3.5\u20134 for understitch and basting.' });
    }
    if (opts.cargo === 'cargo') {
      steps.push({ step: n++, title: 'Prepare cargo pockets',
        detail: 'Mark center of pocket body. Form box pleat at center: from each side, fold \u00bd\u2033 under, fold back \u00bd\u2033, then bring 2\u2033 across on top to the center line. The two folds meet at center with 2\u2033 visible on top and \u00bd\u2033 + \u00bd\u2033 tucked inside each fold (4\u2033 consumed total). {press} pleat flat. Finished pocket is 5\u2033 wide, expands to 9\u2033 when filled. {baste} pleat at top and bottom edges. Fold top edge under 1\u2033, {topstitch}. {press} side and bottom SA under \u215d\u2033. Sew flap outer to lining {RST} on 3 sides, {clip} corners, turn, {press}. {topstitch} \u00bc\u2033 from edge. Install snap on flap center. Tension: 4 for topstitch. If sewing through the box pleat layers, increase to 4.5.' });
    }
    if (opts.backPocket !== 'none') {
      steps.push({ step: n++, title: 'Prepare & attach back pocket',
        detail: 'Fold top edge under 1\u2033, {topstitch}. {press} remaining edges under \u215d\u2033. Position on back panel 2.5\u2033 below waist line, centered. {topstitch} close to edge on 3 sides. Bar tack top corners. Tension: 4 for topstitch.' });
    }

    // Assembly
    steps.push({ step: n++, title: 'Sew center front seam',
      detail: 'Join two front panels at center seam {RST}. {clip} crotch curve. {press} seam open or to one side. Tension: 4 for straight stitch.' });
    steps.push({ step: n++, title: 'Sew center back seam',
      detail: 'Join two back panels at center seam {RST}. {clip} crotch curve. {press}. Tension: 4 for straight stitch.' });
    steps.push({ step: n++, title: 'Sew side seams',
      detail: 'Join front to back at side seams {RST}. {press} open. Tension: 4 for straight stitch.' });
    if (opts.cargo === 'cargo') {
      steps.push({ step: n++, title: 'Attach cargo pockets',
        detail: 'Position each cargo pocket on the outer leg, centered over the side seam, with the top edge at mid-thigh. Pin in place. {topstitch} the sides and bottom at \u215b\u2033 from the edge, backstitching at the top corners. Align the flap above the pocket opening with the raw edge pointing up. Sew across the flap \u00bc\u2033 from the raw edge. Flip the flap down over the pocket and {press}. {topstitch} \u00bc\u2033 from the fold to hold the flap in place. Bar tack all four corners of the pocket body for reinforcement. Tension: 4 for topstitch. Use 4.5 if sewing through multiple layers at pleat area.' });
    }
    steps.push({ step: n++, title: 'Sew inseam',
      detail: 'One continuous seam from hem to hem through crotch. Use stretch stitch or small {zigzag} at crotch curve for durability. {clip} curve, {press}. Tension: reduce to 2.5\u20133 for stretch stitch at crotch curve (the multi-pass stitch puts extra pull on the top thread at normal tension). Return to 4 for straight stitch on the rest of the inseam.' });

    // Waistband
    const isCasing = opts.fly === 'none' || opts.fly === 'drawstring';
    if (isCasing) {
      // Shared steps for elastic and drawstring waistbands
      const sharedSteps = [
        `Fuse interfacing (2 layers) to waistband before cutting.`,
        opts.internalBelt === 'webbing' ? 'Sew webbing centered on the outer half.' : '',
        `Notch or mark CF, CB, and both side seams on the waistband (front panel width = ${fmtInches(frontW)}, back = ${fmtInches(backW)} from each side seam).`,
        opts.fly === 'drawstring'
          ? `Work 2 vertical buttonholes (or install ½″ grommets) at CF, spaced 1″ apart, on the INNER half of the waistband (the half closer to the fold/top edge). Do this while the waistband is still flat, before sewing the loop.`
          : '',
        `Fold the waistband in half lengthwise {WST} and {press} the fold. This fold becomes the top edge of the finished waistband.`,
        opts.fly === 'none'
          ? `Open it back up. Sew the short ends {RST} to form a loop, leaving a 2″ gap in the CB seam for threading elastic later.`
          : `Open it back up. Sew the short ends {RST} to form a loop. No gap needed (drawstring enters and exits through the CF buttonholes).`,
        `Pin one raw edge of the waistband loop to the shorts waist {RST}, matching CF, CB, and side seam notches. Sew all the way around. Tension: 4.`,
        `{press} the seam allowance up into the waistband. The panel raw edges point straight up. Do not fold the panels.`,
        `Fold the waistband up and over along the center crease you pressed earlier. The waistband wraps around the panel raw edges like a sandwich (outer waistband, panel SA in the middle, inner waistband). Tuck the inner waistband raw edge under about ⅝″ so it just covers the seam line on the inside. Pin from the right side.`,
        `{topstitch} from the RS through all layers, stitching close to the lower edge of the waistband (this catches the folded inner edge). Then {topstitch} again along the top fold.`,
      ];

      if (opts.fly === 'none') {
        sharedSteps.push(`Thread ${fmtInches(elasticW)} elastic (~90% of waist, should feel snug) through the 2″ CB gap using a {bodkin}. Tip: pin the trailing end to the fabric near the gap so it does not get pulled in. Work the fabric along the elastic rather than pulling the elastic through. Overlap ends 1″, {zigzag} to join. Tension: 3 to 3.5 for zigzag through elastic. Close the gap with a few hand stitches or machine stitch.`);
      } else {
        sharedSteps.push(`Thread drawstring cord through the CF buttonholes using a {bodkin} or safety pin. Feed in through one buttonhole, around the full waistband casing, and out through the other buttonhole. Even up the tails. Knot or heat-seal cord ends to prevent fraying.`);
      }

      steps.push({ step: n++, title: 'Construct waistband',
        detail: sharedSteps.filter(Boolean).join(' ') });
    } else {
      steps.push({ step: n++, title: 'Construct waistband',
        detail: 'Fuse interfacing. Attach to shorts waist {RST}. Fold, {press}, {topstitch}. Install button/buttonhole at center front overlap. Tension: 4 for seaming and topstitch.' });
    }

    steps.push({ step: n++, title: 'Hem',
      detail: 'Fold up \u00bd\u2033, {press}. Fold again \u00bd\u2033, {press}. {topstitch} close to inner fold. Clean 1\u2033 finished hem. Tension: 4 for topstitch.' });
    steps.push({ step: n++, title: 'Finish',
      detail: `{press} entire garment. Bar tack all stress points: pocket openings, cargo pocket corners, crotch junction.${opts.fly === 'none' ? ' Try on and adjust elastic tension if needed.' : ''}${opts.fly === 'drawstring' ? ' Try on and adjust drawstring length.' : ''} Bar tack tension: 0\u20131 (or as low as your machine allows). Short, dense {zigzag}.` });

    return steps;
  },
};


// ══════════════════════════════════════════════
// PANEL BUILDER (shared geometry for front/back)
// ══════════════════════════════════════════════

function buildPanel({ type, name, instruction, width, height, rise, inseam, ext, cbRaise, sa, hem, isBack, opts, seatDepth }) {
  // Build polygon points (all in inches, CW winding)
  // LEFT = center seam (crotch curve), RIGHT = side seam (straight)
  const kneeY = rise + inseam * 0.55;

  // Crotch curve
  const ccp = crotchCurvePoints(0, 0, rise, ext, isBack, cbRaise);
  const curvePts = sampleBezier(ccp.p0, ccp.p1, ccp.p2, ccp.p3, 96);

  // Main polygon
  const poly = [];

  // Waist: CB to Side
    poly.push({ x: 0, y: isBack ? -cbRaise : 0 }); // waist at center seam (raised on back)
  poly.push({ x: width, y: 0 }); // waist at side seam

  // Side seam down (straight for shorts)
  poly.push({ x: width, y: height }); // hem at side

  // Hem across
  poly.push({ x: -ext, y: height }); // hem at inseam

  // Inseam up to crotch ext
  poly.push({ x: -ext, y: rise }); // crotch extension point

  // Crotch curve back to waist (reverse order)
  for (let i = curvePts.length - 2; i >= 1; i--) {
    poly.push({ ...curvePts[i], curve: true });
  }
  if (isBack && cbRaise > 0) poly.push({ x: 0, y: cbRaise }); // CB seam top

  // Clip front panel at slash line for slant pocket
  const hasSlash = !isBack && opts?.frontPocket === 'slant';
  if (hasSlash) clipPanelAtSlash(poly, width, 3.5, 6);

  // Per-edge seam allowances
  const crotchEdgeCount = curvePts.length - 2; // 15 crotch curve edges
  // When slant pocket is active, vertex 1 is the slash-waist point and
  // vertex 2 is the slash-side-seam point (extra vertex inserted by clip).
  const sideIdx = hasSlash ? 2 : 1; // index of the first side-seam vertex
  const edgeAllowances = poly.map((_, i) => {
    if (i === 0) return { sa, label: 'Waist' };
    if (hasSlash && i === 1) return { sa, label: 'Slash' };
    if (i === sideIdx) return { sa, label: 'Side seam' };
    if (i === sideIdx + 1) return { sa: hem, label: 'Hem' };
    if (i === sideIdx + 2) return { sa, label: 'Inseam' };
    if (i >= sideIdx + 3 && i < sideIdx + 3 + crotchEdgeCount) return { sa, label: 'Crotch' };
    return { sa, label: 'Center' };
  });

  // SA offset — match edges by geometry (sanitizePoly changes vertex order/count)
  const saPoly = offsetPolygon(poly, (i, a, b) => {
    // Hem edge: both endpoints at y ≈ height
    if (Math.abs(a.y - height) < 0.5 && Math.abs(b.y - height) < 0.5) return -hem;
    return -sa;
  });

  // Build dimension annotations
  const dims = [
    { label: fmtInches(width), x1: 0, y1: -0.5, x2: width, y2: -0.5, type: 'h' },
    { label: fmtInches(rise) + ' rise', x: width + 1.2, y1: 0, y2: rise, type: 'v' },
    { label: fmtInches(inseam) + ' inseam', x: width + 1.2, y1: rise, y2: height, type: 'v' },
    { label: fmtInches(height) + ' total', x: width + 2.3, y1: 0, y2: height, type: 'v' },
    { label: fmtInches(ext) + ' ext', x1: -ext, y1: rise + 0.4, x2: 0, y2: rise + 0.4, type: 'h', color: '#c44' },
    { label: fmtInches(seatDepth || 7) + ' seat', x: -ext - 1.2, y1: 0, y2: seatDepth || 7, type: 'v', color: '#b8963e' },
  ];

  // Notch marks: hip level on side seam, crotch junction
  const effSeatDepth = seatDepth || 7;
  const notches = [
    { x: width, y: effSeatDepth,        angle: edgeAngle({ x: width, y: 0 }, { x: width, y: height }) },  // hip on side seam
    ...(isBack ? [{ x: width, y: effSeatDepth + 0.25, angle: edgeAngle({ x: width, y: 0 }, { x: width, y: height }) }] : []),
    { x: -ext,  y: rise,                angle: edgeAngle({ x: -ext, y: height }, { x: -ext, y: rise }) },  // crotch junction
    ...(isBack ? [{ x: -ext,  y: rise - 0.25,         angle: edgeAngle({ x: -ext, y: height }, { x: -ext, y: rise }) }] : []),
  ];

  return {
    id: type,
    name,
    instruction,
    polygon: poly,
    saPolygon: saPoly,
    path: polyToPath(poly),
    saPath: polyToPath(saPoly),
    dimensions: dims,
    width, height, rise, inseam, ext, cbRaise, sa, hem,
    isBack,
    notches, edgeAllowances, crotchBezier: ccp,
    // LOCKED — crotch curve cut & stitch lines are finalized. Do not modify
    // crotchBezier, crotchBezierSA, or their rendering in pattern-view.js.
    // The stitch line uses Catmull-Rom → cubic bezier through offsetPolygon
    // points for uniform SA + smooth rendering. See geometry.js + pattern-view.js.
    crotchBezierSA: insetCrotchBezier(ccp, sa),
    labels: [
      { text: 'SIDE SEAM', x: width + 0.3, y: height * 0.35, rotation: 90 },
      { text: 'CENTER', x: -0.5, y: rise * 0.3, rotation: -90 },
    ],
    type: 'panel',
    opts,
  };
}
