// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Athletic Formal Trousers — suit-style trousers in heavyweight cotton jersey.
 * Inspired by the Keiji Kaneko × Fruit of the Loom Japan "Athletic Formal Suit".
 *
 * Key features:
 * - 12 oz heavyweight cotton jersey (t-shirt fabric, not fleece)
 * - Double pleat default (suit silhouette)
 * - Elastic + drawcord waistband default (comfort), with hybrid and flat front options
 * - Straight leg default (suit look), with tapered and wide options
 * - Slant front pockets, faux welt back pockets
 * - Relaxed ease (+4″ default) for the slouchy Kaneko silhouette
 *
 * Companion: athletic-formal-jacket
 */

import {
  edgeAngle, crotchCurvePoints, sampleBezier, offsetPolygon, polyToPath,
  fmtInches, easeDistribution, insetCrotchBezier,
  buildSlantPocketBacking, buildSlantPocketBag, clipPanelAtSlash
} from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

const PLEAT_DEPTH = 1.5; // inches per pleat (front panel only)

export default {
  id: 'athletic-formal-trousers',
  name: 'Athletic Formal Trousers',
  category: 'lower',
  difficulty: 'intermediate',
  priceTier: 'core',
  companionId: 'athletic-formal-jacket',
  measurements: ['waist', 'hip', 'rise', 'thigh', 'inseam'],
  measurementDefaults: { inseam: 31 },

  options: {
    ease: {
      type: 'select', label: 'Fit',
      values: [
        { value: 'regular', label: 'Regular (+2.5″)', reference: 'classic, off-the-rack'  },
        { value: 'relaxed', label: 'Relaxed (+4″)',   reference: 'slouchy, Kaneko fit'     },
        { value: 'wide',    label: 'Wide (+6″)',      reference: 'full, deconstructed'     },
      ],
      default: 'relaxed',
    },
    waistband: {
      type: 'select', label: 'Waistband',
      values: [
        { value: 'elastic',  label: 'Elastic + drawcord',                reference: 'comfort, athleisure'     },
        { value: 'hybrid',   label: 'Hybrid (flat front, elastic back)', reference: 'smart casual, structured' },
        { value: 'flat',     label: 'Flat front (button/hook)',          reference: 'suit, tailored'           },
      ],
      default: 'elastic',
    },
    pleats: {
      type: 'select', label: 'Pleats (front only)',
      values: [
        { value: 'none',   label: 'No pleats',    reference: 'flat front, modern'   },
        { value: 'single', label: 'Single pleat', reference: 'classic, Italian'     },
        { value: 'double', label: 'Double pleat', reference: 'full, Kaneko original' },
      ],
      default: 'double',
    },
    legStyle: {
      type: 'select', label: 'Leg style',
      values: [
        { value: 'straight', label: 'Straight',                reference: 'suit silhouette'    },
        { value: 'tapered',  label: 'Tapered (jogger-style)',   reference: 'streetwear, modern' },
        { value: 'wide',     label: 'Wide leg',                 reference: 'relaxed, full drape' },
      ],
      default: 'straight',
    },
    legLength: {
      type: 'select', label: 'Length',
      values: [
        { value: 'full',    label: 'Full length'           },
        { value: 'cropped', label: 'Cropped (ankle, −3″)' },
      ],
      default: 'full',
    },
    cuff: {
      type: 'select', label: 'Hem finish',
      values: [
        { value: 'hemmed', label: 'Hemmed (twin-needle)',  reference: 'suit-like, clean'     },
        { value: 'turnup', label: 'Turn-up cuff (1.5″)',   reference: 'classic trouser cuff' },
        { value: 'rib',    label: 'Rib knit cuff',         reference: 'sporty, jogger'       },
      ],
      default: 'hemmed',
    },
    pocket: {
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
        { value: 'welt',  label: 'Faux welt ×2'  },
        { value: 'patch', label: 'Patch ×2'       },
        { value: 'none',  label: 'None'            },
      ],
      default: 'welt',
    },
    riseStyle: {
      type: 'select', label: 'Rise style',
      values: [
        { value: 'low',  label: 'Low rise (−1.5″)'    },
        { value: 'mid',  label: 'Mid rise (body rise)' },
        { value: 'high', label: 'High rise (+1.5″)'    },
      ],
      default: 'mid',
    },
    riseOverride: { type: 'number', label: 'Rise override (inches)', default: 0, step: 0.25, min: 0, max: 18 },
    frontExt: { type: 'number', label: 'Front crotch ext', default: 1.5, step: 0.25, min: 0.5, max: 3   },
    backExt:  { type: 'number', label: 'Back crotch ext',  default: 2.5, step: 0.25, min: 1,   max: 4   },
    cbRaise:  { type: 'number', label: 'CB raise',         default: 0.5, step: 0.25, min: 0,   max: 1.5 },
    sa: {
      type: 'select', label: 'Seam allowance',
      values: [
        { value: 0.375, label: '⅜″' },
        { value: 0.5,   label: '½″' },
      ],
      default: 0.5,
    },
    hem: {
      type: 'select', label: 'Hem allowance',
      values: [
        { value: 0.75, label: '¾″ twin-needle' },
        { value: 1,    label: '1″ fold & stitch' },
      ],
      default: 0.75,
    },
  },

  pieces(m, opts) {
    const ease = easeDistribution(opts.ease || 'relaxed');

    const sa       = parseFloat(opts.sa);
    const hem      = parseFloat(opts.hem);
    const frontExt = parseFloat(opts.frontExt);
    const backExt  = parseFloat(opts.backExt);
    const cbRaise  = parseFloat(opts.cbRaise);

    const numPleats  = opts.pleats === 'double' ? 2 : opts.pleats === 'single' ? 1 : 0;
    const pleatExtra = numPleats * PLEAT_DEPTH;

    const RISE_OFFSETS = { low: -1.5, mid: 0, high: 1.5 };
    const baseRise  = m.rise || 10;
    const riseOff   = RISE_OFFSETS[opts.riseStyle] ?? 0;
    const rise      = parseFloat(opts.riseOverride) || (baseRise + riseOff);

    const lengthAdj = opts.legLength === 'cropped' ? -3 : 0;
    const inseam    = (m.outseam ? Math.max(1, m.outseam - rise) : (m.inseam || 31)) + lengthAdj;

    // Leg shape: straight (no taper), tapered (jogger-style), or wide
    const shape = opts.legStyle === 'tapered'
      ? { knee: 0.82, hem: 0.58 }
      : opts.legStyle === 'wide'
        ? { knee: 1.05, hem: 1.05 }
        : { knee: 1.0, hem: 1.0 };

    const frontHipW = m.hip / 4 + ease.front + pleatExtra;
    const backHipW  = m.hip / 4 + ease.back;
    const H         = rise + inseam;

    const pieces = [];

    pieces.push(buildPanel({
      type: 'front', name: 'Front Panel',
      instruction: `Cut 2 (mirror L & R)${numPleats > 0 ? ` · ${numPleats === 2 ? 'Double' : 'Single'} pleat folded toward side seam, ${fmtInches(PLEAT_DEPTH)} each` : ''}`,
      width: frontHipW, height: H, rise, inseam,
      ext: frontExt, cbRaise: 0, sa, hem, isBack: false, shape, numPleats, pleatDepth: PLEAT_DEPTH, opts,
      calf: m.calf, ankle: m.ankle, seatDepth: m.seatDepth,
    }));

    pieces.push(buildPanel({
      type: 'back', name: 'Back Panel',
      instruction: `Cut 2 (mirror L & R) · CB raised ${fmtInches(cbRaise)}`,
      width: backHipW, height: H, rise, inseam,
      ext: backExt, cbRaise, sa, hem, isBack: true, shape, opts,
      calf: m.calf, ankle: m.ankle, seatDepth: m.seatDepth,
    }));

    // ── WAISTBAND ──
    if (opts.waistband === 'elastic') {
      // Full elastic + drawcord casing (like sweatpants)
      const wbLen   = m.hip + ease.total + pleatExtra * 2 + sa * 2;
      const wbWidth = 3.5;  // ~1.75″ finished
      pieces.push({
        id: 'waistband',
        name: 'Waistband (Elastic + Drawcord)',
        instruction: `Cut 1 · ${fmtInches(wbWidth / 2)} finished · Elastic + drawcord casing · Buttonhole/grommet pair at CF`,
        dimensions: { length: wbLen, width: wbWidth },
        type: 'rectangle', sa,
      });
    } else if (opts.waistband === 'hybrid') {
      // Front: structured flat waistband with button
      // Back: elastic casing
      const frontWbLen = (m.waist + ease.total + pleatExtra * 2) / 2 + 2; // front half + overlap
      const backWbLen  = (m.hip + ease.total) / 2 + sa * 2; // back half, sized to hip for elastic recovery
      const wbWidth = 3.5;
      pieces.push({
        id: 'waistband-front',
        name: 'Front Waistband (Structured)',
        instruction: `Cut 1 · Interface · ${fmtInches(wbWidth / 2)} finished · Button + hook closure at CF`,
        dimensions: { length: frontWbLen, width: wbWidth },
        type: 'rectangle', sa,
      });
      pieces.push({
        id: 'waistband-back',
        name: 'Back Waistband (Elastic Casing)',
        instruction: `Cut 1 · ${fmtInches(wbWidth / 2)} finished · Elastic casing, joins front waistband at side seams`,
        dimensions: { length: backWbLen, width: wbWidth },
        type: 'rectangle', sa,
      });
    } else {
      // Flat front: structured curtain waistband (like pleated-trousers)
      const wbLen = m.waist + ease.total + pleatExtra * 2 + sa * 2 + 2; // +2 overlap
      const wbWidth = 4;
      pieces.push({
        id: 'waistband',
        name: 'Waistband (Curtain)',
        instruction: `Cut 1 · Interface · 2″ finished · Button + hook-and-eye · CF overlap 1½″`,
        dimensions: { length: wbLen, width: wbWidth },
        type: 'rectangle', sa,
      });
    }

    // ── FRONT POCKETS ──
    if (opts.pocket === 'slant') {
      pieces.push(buildSlantPocketBacking({ bagWidth: 7, slashInset: 3.5, slashDepth: 6.5, bagDepth: 10, sa, instruction: 'Cut 2 (1 + 1 mirror) \xb7 Self fabric or lining \xb7 Visible pocket front \xb7 {serge} before attaching' }));
      pieces.push(buildSlantPocketBag({ bagWidth: 7, slashInset: 3.5, slashDepth: 6.5, bagDepth: 10, sa, instruction: 'Cut 2 (1 + 1 mirror) \xb7 Lining fabric \xb7 Pocket back (against body) \xb7 {serge} all edges' }));
    }
    if (opts.pocket === 'side') {
      pieces.push({ id: 'side-bag', name: 'Side-Seam Pocket Bag', instruction: 'Cut 4 (2 per side)', dimensions: { width: 7, height: 9 }, type: 'pocket' });
    }

    // ── BACK POCKETS ──
    if (opts.backPocket === 'welt') {
      pieces.push({
        id: 'back-welt',
        name: 'Back Faux Welt Pocket',
        instruction: 'Cut 4 (2 welts + 2 bags) · ×2 pockets total · Interface welts with knit fusible',
        dimensions: { width: 5.5, height: 6 }, type: 'pocket',
      });
    }
    if (opts.backPocket === 'patch') {
      pieces.push({
        id: 'back-patch',
        name: 'Back Patch Pocket',
        instruction: 'Cut 2 · Position centered on back panel below hip · {topstitch} sides and bottom · Bar tack corners',
        dimensions: { width: 6, height: 7 }, type: 'pocket',
      });
    }

    // ── RIB CUFFS (jogger/rib option) ──
    if (opts.cuff === 'rib') {
      const hemW = frontHipW * (shape.hem || 1);
      const hemInward  = (frontHipW - hemW) * 0.5;
      const sideHemX   = frontHipW - hemInward;
      const inseamHemX = -frontExt + hemInward;
      const hemOpening = sideHemX - inseamHemX;
      const cuffWidth  = hemOpening * 0.8;
      const cuffHeight = 3 * 2; // 3″ finished = 6″ cut

      pieces.push({
        id: 'rib-cuff',
        name: 'Rib Cuff',
        instruction: `Cut 2 from rib knit · ${fmtInches(cuffWidth)} wide × ${fmtInches(cuffHeight)} tall · 80% of hem opening (${fmtInches(hemOpening)}) for stretch recovery`,
        dimensions: { width: cuffWidth, height: cuffHeight },
        type: 'pocket',
      });
    }

    return pieces;
  },

  materials(m, opts) {
    const ease = easeDistribution(opts.ease || 'relaxed');
    const numPleats = opts.pleats === 'double' ? 2 : opts.pleats === 'single' ? 1 : 0;

    const notions = [];

    if (opts.waistband === 'elastic' || opts.waistband === 'hybrid') {
      const elasticLen = opts.waistband === 'hybrid'
        ? Math.round(m.waist * 0.42)  // back half only
        : Math.round(m.waist * 0.85); // full
      notions.push({ ref: 'elastic-1', quantity: `${elasticLen}″ - ${opts.waistband === 'hybrid' ? 'back half of' : 'full'} waistband` });
    }
    if (opts.waistband === 'elastic') {
      notions.push({ ref: 'drawstring', quantity: `${Math.round(m.waist + 14)}″ - front tie + tails` });
    }
    if (opts.waistband === 'hybrid' || opts.waistband === 'flat') {
      notions.push({ name: 'Waistband button', quantity: '1', notes: '¾″ shank or sew-through' });
      notions.push({ name: 'Hook-and-eye', quantity: '1 set', notes: 'Size 3 - waistband closure' });
      notions.push({ ref: 'interfacing-light', quantity: '0.25 yard (waistband, knit fusible only)' });
    }
    if (opts.backPocket === 'welt') {
      notions.push({ ref: 'interfacing-light', quantity: '¼ yard (welt pocket facings, knit fusible only)' });
    }
    if (opts.cuff === 'rib') {
      notions.push({ name: 'Rib knit', quantity: '0.5 yard', notes: 'For leg cuffs - high recovery stretch' });
    }

    return buildMaterialsSpec({
      fabrics: ['heavyweight-jersey', 'ponte', 'french-terry'],
      notions,
      thread: 'poly-all',
      needle: 'ballpoint-90',
      stitches: ['stretch', 'overlock', 'zigzag-med', 'coverstitch'],
      notes: [
        'Use a ballpoint (jersey) needle 90/14 — prevents skipped stitches on knit',
        'Use stretch stitch or serger for ALL seams — a straight stitch will pop when stretched',
        'Interfacing: use KNIT FUSIBLE interfacing only — woven interfacing will prevent the fabric from stretching and cause puckering',
        'Pre-wash heavyweight jersey before cutting — cotton knits can shrink 3–5% in the first wash',
        'Do not {press} with high heat — use medium heat, light steam, or finger {press} seams',
        `Hem finish: ${opts.cuff === 'rib' ? 'ribbed cuffs at 80% of hem opening for stretch recovery' : opts.cuff === 'turnup' ? 'fold up 1.5″ twice for turn-up cuff, {press} lightly, tack at side seam and inseam' : 'twin needle creates two parallel rows of {topstitch} from RS; or use coverstitch if available'}`,
        numPleats > 0 ? `Pleats: {press} lightly from WS with steam, allow to drape naturally below hip. Jersey pleats are soft — do not {press} a hard crease.` : '',
        opts.waistband === 'hybrid' ? 'Hybrid waistband: the structured front uses knit fusible interfacing for subtle body, while the elastic back provides comfort. Join front and back waistband at side seams.' : '',
      ].filter(Boolean),
    });
  },

  instructions(m, opts) {
    const steps = [];
    let n = 1;
    const numPleats = opts.pleats === 'double' ? 2 : opts.pleats === 'single' ? 1 : 0;

    // ── POCKETS ──
    if (opts.backPocket === 'welt') {
      steps.push({
        step: n++, title: 'Prepare back welt pockets',
        detail: 'Interface welt pieces with knit fusible. Mark pocket positions on back panels (2.5″ below waist, centered in panel). Sew bound welts, slash, turn, {press} gently. Attach bag halves. Whipstitch bag sides. Bar tack ends.',
      });
    }
    if (opts.backPocket === 'patch') {
      steps.push({
        step: n++, title: 'Prepare back patch pockets',
        detail: 'Fold top edge under ¾″ twice, {topstitch}. {press} remaining three edges under ½″. Position on back panels below hip. {topstitch} on 3 sides. Bar tack all four corners.',
      });
    }
    if (opts.pocket === 'slant') {
      steps.push({ step: n++, title: 'Sew pocket backing to pocket bag',
        detail: 'Place the pocket backing (self fabric) on the pocket bag (lining) {RST}. Sew along the curved bottom edge and the straight left side. Leave the top (waist), right side seam edge, and slash diagonal open. {clip} the curved seam allowance. Turn right side out so the backing faces outward. {press} flat. {topstitch} \u00bc\u2033 from the curved edge if desired. The pocket unit is now one piece with two layers.' });
      steps.push({ step: n++, title: 'Attach pocket to front panel',
        detail: 'The front panel is cut off at the slash line (the diagonal from waist to side seam). Align the pocket unit\u2019s slash diagonal edge to the front panel\u2019s slash edge {RST}. The pocket backing should face the front panel RS. Sew along the slash. {clip} the seam allowance. Turn the pocket to the wrong side of the panel. {press}. {understitch} through the pocket backing and both SAs so the seam rolls to the inside. {baste} the pocket\u2019s top edge to the panel\u2019s waist SA. {baste} the pocket\u2019s side seam edge to the panel\u2019s side SA. The pocket is now enclosed when the waist and side seams are sewn.' });
    }
    if (opts.pocket === 'side') {
      steps.push({
        step: n++, title: 'Prepare side-seam pockets',
        detail: 'Sew pocket bag pieces to front and back panels at pocket opening {RST}. {press} bags toward front. {baste} pocket edges to panel at waist and side seam.',
      });
    }

    // ── PLEATS ──
    if (numPleats > 0) {
      steps.push({
        step: n++, title: `Form ${numPleats === 2 ? 'double' : 'single'} front pleat${numPleats === 2 ? 's' : ''}`,
        detail: `Mark pleat fold line${numPleats === 2 ? 's' : ''} on RS. Fold each pleat toward side seam enclosing ${fmtInches(PLEAT_DEPTH)}. Pin at waist. {baste} ⅜″ from edge. {press} lightly from WS — jersey pleats should drape softly, not crease sharply.`,
      });
    }

    // ── SEAMS ──
    steps.push({ step: n++, title: 'Sew center front seam', detail: 'Join front panels at CF {RST}. Stretch stitch from waist to crotch. {clip} curve. {serge} or {press} open.' });
    steps.push({ step: n++, title: 'Sew center back seam',  detail: 'Join back panels at CB {RST}. Stretch stitch. {clip}. {press}.' });
    steps.push({
      step: n++, title: 'Sew side seams',
      detail: opts.pocket === 'slant'
        ? 'Sew above and below pocket opening with stretch stitch. Sew around bag to join both halves. Trim corners. {press} open.'
        : opts.pocket === 'side'
          ? 'Sew side seams leaving pocket opening unstitched. Sew around pocket bags. {press} open.'
          : 'Join front to back at side seams {RST}. Stretch stitch. {press} open or {serge} together.',
    });
    steps.push({ step: n++, title: 'Sew inseam', detail: 'Continuous stretch stitch from hem to hem through crotch. {clip} curve. {press} toward back.' });

    // ── WAISTBAND ──
    if (opts.waistband === 'elastic') {
      steps.push({
        step: n++, title: 'Construct elastic + drawcord waistband',
        detail: 'Fold waistband in half lengthwise {WST}, {press}. Fold CF ends under ½″. Sew buttonholes or install grommets at CF for drawstring exits. Pin to trousers waist {RST}, stretching to fit. Stretch stitch. Fold to inside. {topstitch} all the way around leaving a 3″ gap. Insert elastic — overlap elastic ends 1″, {zigzag}. Close gap. Thread drawstring through front. Knot or heat-seal ends.',
      });
    } else if (opts.waistband === 'hybrid') {
      steps.push({
        step: n++, title: 'Construct hybrid waistband',
        detail: 'Interface front waistband with knit fusible. Join front and back waistband pieces at side seam positions {RST}. Fold waistband in half lengthwise {WST}. For the front section: install button and hook-and-eye closure at CF. For the back section: create elastic casing by {topstitch}ing leaving a gap, insert elastic through back portion only, overlap elastic ends 1″, {zigzag}, close gap. Pin completed waistband to trousers waist {RST}. Stretch stitch. Fold to inside and {topstitch}.',
      });
    } else {
      steps.push({
        step: n++, title: 'Construct curtain waistband',
        detail: 'Apply knit fusible interfacing to outer waistband. Fold lengthwise, {press}. Sew short ends — CF right side has a 1½″ extension for overlap. Sew to trousers waist {RST}. Fold over. {topstitch} or {slipstitch} inside. Install button at CF overlap. Attach hook-and-eye inside overlap.',
      });
    }

    // ── HEM ──
    if (opts.cuff === 'rib') {
      steps.push({
        step: n++, title: 'Attach rib cuffs',
        detail: 'Fold each rib cuff in half widthwise {WST}. Divide hem opening and cuff into quarters, pin at quarters. Sew cuff to hem opening {RST}, stretching cuff to match opening. Use stretch stitch or serger.',
      });
    } else if (opts.cuff === 'turnup') {
      steps.push({
        step: n++, title: 'Hem with turn-up cuff',
        detail: '{serge} raw hem edge. Fold up 1.5″, {press} lightly. Fold up another 1.5″ for the visible cuff. {press}. Tack cuff in place at side seam and inseam with a few hand stitches.',
      });
    } else {
      steps.push({
        step: n++, title: 'Hem',
        detail: `Fold hem up ${fmtInches(parseFloat(opts.hem))} once, {press} gently. For twin needle: sew from RS using a twin needle (2.5mm apart) in one pass. For regular: fold under raw edge, {topstitch} with stretch stitch.`,
      });
    }

    steps.push({ step: n++, title: 'Finish', detail: '{press} lightly with medium heat and damp cloth. Try on and adjust waistband. The jersey will relax and drape after the first wash — expect a slightly looser fit.' });

    return steps;
  },
};


// ── Panel builder ────────────────────────────────────────────────────────

function buildPanel({ type, name, instruction, width, height, rise, inseam, ext, cbRaise, sa, hem, isBack, shape, numPleats = 0, pleatDepth = 0, opts, calf, ankle, seatDepth }) {
  const ccp      = crotchCurvePoints(0, 0, rise, ext, isBack, cbRaise);
  const curvePts = sampleBezier(ccp.p0, ccp.p1, ccp.p2, ccp.p3, 96);

  const kneeY       = rise + inseam * 0.55;
  const kneeW       = calf  ? calf  / 2 + 0.5 : width * shape.knee;
  const hemW        = ankle ? ankle / 2 + 0.5 : width * shape.hem;
  const kneeInward  = (width - kneeW) * 0.5;
  const hemInward   = (width - hemW)  * 0.5;
  const sideKneeX   =  width - kneeInward;
  const sideHemX    =  width - hemInward;
  const inseamKneeX = -ext   + kneeInward;
  const inseamHemX  = -ext   + hemInward;

  const poly = [];
  poly.push({ x: 0,           y: 0       });
  poly.push({ x: width,       y: 0       });
  poly.push({ x: sideKneeX,   y: kneeY   });
  poly.push({ x: sideHemX,    y: height  });
  poly.push({ x: inseamHemX,  y: height  });
  poly.push({ x: inseamKneeX, y: kneeY   });
  poly.push({ x: -ext,        y: rise    });
  for (let i = curvePts.length - 2; i >= 1; i--) poly.push({ ...curvePts[i], curve: true });
  if (isBack && cbRaise > 0) poly.push({ x: 0, y: cbRaise });

  const hasSlash = !isBack && opts?.pocket === 'slant';
  if (hasSlash) clipPanelAtSlash(poly, width, 3.5, 6.5);
  const sideIdx = hasSlash ? 2 : 1;

  const saPoly = offsetPolygon(poly, (i, a, b) => {
    if (Math.abs(a.y - height) < 0.5 && Math.abs(b.y - height) < 0.5) return -hem;
    return -sa;
  });

  const dims = [
    { label: fmtInches(width),              x1: 0,           y1: -0.5,        x2: width,      y2: -0.5,        type: 'h' },
    { label: fmtInches(kneeW) + ' knee',    x1: inseamKneeX, y1: kneeY + 0.4, x2: sideKneeX,  y2: kneeY + 0.4, type: 'h', color: '#b8963e' },
    { label: fmtInches(hemW)  + ' hem',     x1: inseamHemX,  y1: height - 0.5, x2: sideHemX,  y2: height - 0.5, type: 'h', color: '#b8963e' },
    { label: fmtInches(rise)   + ' rise',   x: width + 1.2,  y1: 0,           y2: rise,                         type: 'v' },
    { label: fmtInches(inseam) + ' inseam', x: width + 1.2,  y1: rise,        y2: height,                       type: 'v' },
    { label: fmtInches(ext)    + ' ext',    x1: -ext, y1: rise + 0.4, x2: 0, y2: rise + 0.4,                   type: 'h', color: '#c44' },
    { label: fmtInches(seatDepth || 7) + ' seat', x: -ext - 1.2, y1: 0, y2: seatDepth || 7,                    type: 'v', color: '#b8963e' },
  ];

  const pleats = [];
  if (!isBack && numPleats >= 1) pleats.push({ x: width * 0.25, depth: pleatDepth, y1: 0, y2: 4.5 });
  if (!isBack && numPleats >= 2) pleats.push({ x: width * 0.5,  depth: pleatDepth, y1: 0, y2: 4.5 });

  const effSeatDepth = seatDepth || 7;
  const notches = [
    { x: width,        y: effSeatDepth, angle: edgeAngle({ x: width, y: 0 }, { x: sideKneeX, y: kneeY }) },
    { x: -ext,         y: rise,         angle: edgeAngle({ x: inseamKneeX, y: kneeY }, { x: -ext, y: rise }) },
    { x: sideKneeX,    y: kneeY,        angle: edgeAngle({ x: width, y: 0 }, { x: sideKneeX, y: kneeY }) },
    { x: inseamKneeX,  y: kneeY,        angle: edgeAngle({ x: -ext, y: rise }, { x: inseamKneeX, y: kneeY }) },
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
    notches, pleats, crotchBezier: ccp,
    // LOCKED — crotch curve cut & stitch lines are finalized. Do not modify
    // crotchBezier, crotchBezierSA, or their rendering in pattern-view.js.
    crotchBezierSA: insetCrotchBezier(ccp, sa), type: 'panel', opts,
  };
}
