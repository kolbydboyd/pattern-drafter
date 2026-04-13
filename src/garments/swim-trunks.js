// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Swim Trunks — nylon taslan outer with mesh liner panels.
 * Side-seam pockets with mesh drainage bags. Drawstring + grommets only (no elastic).
 * 5 inch default inseam.
 */

import {
  crotchCurvePoints, sampleBezier, offsetPolygon, polyToPath,
  fmtInches, easeDistribution, edgeAngle, insetCrotchBezier
} from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

export default {
  id: 'swim-trunks',
  name: 'Swim Trunks',
  category: 'lower',
  difficulty: 'beginner',
  priceTier: 'simple',
  measurements: ['waist', 'hip', 'rise', 'thigh', 'inseam'],
  measurementDefaults: { inseam: 5 },

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
    pocket: {
      type: 'select', label: 'Side pockets',
      values: [
        { value: 'none',      label: 'None',                         reference: 'minimal'       },
        { value: 'side-seam', label: 'Side-seam mesh bag ×2',       reference: 'hidden, clean' },
      ],
      default: 'side-seam',
    },
    liner: {
      type: 'select', label: 'Liner',
      values: [
        { value: 'panels', label: 'Full mesh panels (board-short style)', reference: 'athletic, board shorts' },
        { value: 'brief',  label: 'Brief-cut liner (retro style)',         reference: 'retro, 70s/80s classic' },
        { value: 'no',     label: 'No liner',                              reference: 'minimal, layerable'    },
      ],
      default: 'panels',
    },
    sideSplit: {
      type: 'select', label: 'Hem side split',
      values: [
        { value: 'none', label: 'None'                      },
        { value: '1',    label: '1″ slit (retro/athletic)'  },
      ],
      default: 'none',
    },
    backPocket: {
      type: 'select', label: 'Back pocket',
      values: [
        { value: 'none',  label: 'None'               },
        { value: 'patch', label: 'Small patch pocket' },
      ],
      default: 'none',
    },
    frontExt: { type: 'number', label: 'Front crotch ext', default: 1.75, step: 0.25, min: 0.5, max: 2.5 },
    backExt:  { type: 'number', label: 'Back crotch ext',  default: 2.0,  step: 0.25, min: 1,   max: 3.5 },
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
    cbRaise:  { type: 'number', label: 'CB raise',         default: 1.0,  step: 0.25, min: 0,   max: 2.0 },
    sa: {
      type: 'select', label: 'Seam allowance',
      values: [
        { value: 0.375, label: '⅜″' },
        { value: 0.5,   label: '½″' },
      ],
      default: 0.5,
    },
    hem: {
      type: 'select', label: 'Hem finish',
      values: [
        { value: 0.5,  label: '½″ turned & stitched' },
        { value: 0.75, label: '¾″ with binding tape'  },
      ],
      default: 0.5,
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
    const inseam    = m.inseam || (m.outseam ? Math.max(1, m.outseam - rise) : 5);

    let frontW = m.hip / 4 + ease.front + 0.5;
    let backW  = m.hip / 4 + ease.back;

    // Thigh ease check
    if (m.thigh) {
      const patternThigh = (frontW + backW + frontExt + backExt) * 2;
      const minThigh = m.thigh * 2 + 3;
      if (patternThigh < minThigh) {
        const perPanel = (minThigh - patternThigh) / 4;
        frontW += perPanel;
        backW += perPanel;
        console.warn(`[swim-trunks] Thigh ease insufficient (${(patternThigh - m.thigh * 2).toFixed(1)}″) — widened panels by ${perPanel.toFixed(2)}″ each`);
      } else if (patternThigh - m.thigh * 2 < 2) {
        console.warn(`[swim-trunks] Thigh ease is tight: ${(patternThigh - m.thigh * 2).toFixed(1)}″ (recommend ≥ 2″)`);
      }
    }

    const H      = rise + inseam;

    const pieces = [];

    // ── OUTER PANELS ──
    pieces.push(buildPanel({
      type: 'front', name: 'Front Panel',
      instruction: 'Cut 2 (mirror L & R) · Nylon taslan outer',
      width: frontW, height: H, rise, inseam,
      ext: frontExt, cbRaise: 0, sa, hem, isBack: false, opts,
    }));
    pieces.push(buildPanel({
      type: 'back', name: 'Back Panel',
      instruction: `Cut 2 (mirror L & R) · CB raised ${fmtInches(cbRaise)}`,
      width: backW, height: H, rise, inseam,
      ext: backExt, cbRaise, sa, hem, isBack: true, opts,
    }));

    // ── LINER ──
    const isRetro = opts.liner === 'brief';

    if (opts.liner === 'panels') {
      const linerInseam = Math.max(inseam - 1, 1);
      const linerH = rise + linerInseam;
      pieces.push(buildPanel({
        type: 'front-liner', name: 'Front Liner Panel',
        instruction: 'Cut 2 (mirror) · Athletic mesh · 1″ shorter than outer front',
        width: frontW, height: linerH, rise, inseam: linerInseam,
        ext: frontExt, cbRaise: 0, sa: 0.375, hem: 0.375, isBack: false, opts,
      }));
      pieces.push(buildPanel({
        type: 'back-liner', name: 'Back Liner Panel',
        instruction: 'Cut 2 (mirror) · Athletic mesh · 1″ shorter than outer back',
        width: backW, height: linerH, rise, inseam: linerInseam,
        ext: backExt, cbRaise, sa: 0.375, hem: 0.375, isBack: true, opts,
      }));
    }

    if (opts.liner === 'brief') {
      // Brief-cut liner: single rectangle spanning both front panels.
      // Sewn as a mini-brief (CF + CB + inseam), then basted to outer at waist.
      const briefW = (frontW + backW) * 1.15; // slight ease for brief seams
      const briefH = rise * 0.85;             // brief stops short of hem
      pieces.push({
        id: 'brief-liner',
        name: 'Brief Liner',
        instruction: 'Cut 1 from soft elastane or 4-way stretch mesh · Sew CF seam + CB seam + inseam to form mini brief · {serge} or {zigzag} all edges before sewing · Baste to outer at waist ¼″',
        dimensions: { width: briefW, height: briefH },
        type: 'pocket',
        sa: 0.375,
      });
    }

    // ── WAISTBAND ──
    // Retro style: hybrid (elastic back + drawcord front), same pattern as gym-shorts.
    // Standard style: single drawcord waistband.
    const wbWidth = 3; // 1.5″ finished

    if (isRetro) {
      const wbFrontLen = frontW * 2 + sa * 2;
      const wbBackLen  = backW  * 2 + sa * 2;
      pieces.push({
        id: 'waistband-front',
        name: 'Waistband Front',
        instruction: `Cut 1 · Nylon · ${fmtInches(wbWidth / 2)} finished · Grommet pair at CF for drawstring`,
        dimensions: { length: wbFrontLen, width: wbWidth },
        type: 'rectangle', sa,
      });
      pieces.push({
        id: 'waistband-back',
        name: 'Waistband Back',
        instruction: `Cut 1 · Nylon · ${fmtInches(wbWidth / 2)} finished · Elastic casing for back waistband`,
        dimensions: { length: wbBackLen, width: wbWidth },
        type: 'rectangle', sa,
      });
    } else {
      const wbLen = (frontW + backW) * 2 + sa * 2;
      pieces.push({
        id: 'waistband',
        name: 'Waistband',
        instruction: `Cut 1 · Nylon · ${fmtInches(wbWidth / 2)} finished · Grommet pair at CF for drawstring`,
        dimensions: { length: wbLen, width: wbWidth },
        type: 'rectangle', sa,
      });
    }

    // ── SIDE-SEAM POCKET BAGS (mesh for drainage) ──
    if (opts.pocket === 'side-seam') {
      // Retro shorts: slightly smaller pocket bags (shorter inseam leaves less room)
      const bagW = isRetro ? 6.0 : 6.5;
      const bagH = isRetro ? 6.5 : 7.0;
      pieces.push({
        id: 'pocket-bag',
        name: 'Side-Seam Pocket Bag',
        instruction: 'Cut 4 (2 per side) · Athletic mesh - allows water drainage · {serge} all edges',
        dimensions: { width: bagW, height: bagH },
        type: 'pocket',
        sa,
      });
    }

    // ── BACK PATCH POCKET (retro option) ──
    if (opts.backPocket === 'patch') {
      pieces.push({
        id: 'back-pocket',
        name: 'Back Patch Pocket',
        instruction: 'Cut 1 · Self fabric · 4″ wide × 4.5″ tall · Fold top 1″ under and topstitch before attaching',
        dimensions: { width: 4, height: 4.5 },
        type: 'pocket',
        sa,
        marks: [
          { type: 'fold', axis: 'h', position: 1, label: 'fold under 1″' },
        ],
      });
    }

    return pieces;
  },

  materials(m, opts) {
    const isRetro = opts.liner === 'brief';
    const notions = [
      { ref: 'drawstring', quantity: `${Math.round(m.waist + 14)}″ - flat nylon or polyester cord` },
      { ref: 'grommets',   quantity: '2 - CF drawstring exits, ½″ inner dia, rust-proof' },
    ];
    if (isRetro) {
      notions.push({ ref: 'elastic-0.75', quantity: `${Math.round(m.waist * 0.45)}″ of ¾″ wide elastic - back waistband casing only` });
      notions.push({ name: 'Soft elastane', quantity: '0.33 yard', notes: 'Brief liner (4-way stretch, ≥ 80% elastane)' });
    }
    if (opts.liner === 'panels') {
      notions.push({ name: 'Athletic mesh', quantity: '0.75 yard', notes: 'Liner panels + pocket bags' });
    }

    return buildMaterialsSpec({
      fabrics: ['nylon-taslan', 'supplex'],
      notions,
      thread: 'poly-all',
      needle: 'ballpoint-80',
      stitches: ['stretch', 'zigzag-small', 'straight-3'],
      notes: [
        'Use polyester thread ONLY - cotton thread rots with repeated chlorine and salt water exposure',
        'Rinse trunks in fresh cold water after every wear (pool or ocean) to extend fabric life',
        ...(isRetro ? ['Retro short trunks: 92% nylon / 8% spandex shell gives the most authentic drape and quick-dry performance. Nylon taslan works well for a matte, vintage-textured look.'] : []),
        'Color guidance - hides sweat: black, navy, dark charcoal, dark olive. Avoid light gray and light blue near the water line.',
        'Use rust-proof grommets (brass or stainless) - standard steel grommets will stain the fabric',
        'All hardware (grommets, cord locks) must be corrosion-resistant for saltwater use',
        '{serge} or {zigzag} all seams - do not leave raw edges on mesh; they will fray in water',
        'Do not {press} nylon with high heat - use a damp pressing cloth on low if needed',
      ],
    });
  },

  instructions(m, opts) {
    const steps = [];
    let n = 1;
    const isRetro = opts.liner === 'brief';

    if (opts.liner === 'panels') {
      steps.push({
        step: n++, title: 'Assemble liner',
        detail: '{serge} all liner panel edges. Join liner fronts at CF crotch seam. Join liner backs at CB. Join liner at side seams. Join inseam. {baste} liner WS to WS of outer at waist edge (¼″). Treat as one unit going forward.',
      });
    }

    if (opts.liner === 'brief') {
      steps.push({
        step: n++, title: 'Sew brief liner',
        detail: '{serge} or {zigzag} all liner edges before sewing. Join the two halves at CF seam {RST} with stretch stitch. Join at CB seam. Join inseam. The result is a mini brief. {baste} the brief WS to WS of the outer shell at the waist edge, ¼″ from the raw edge. Treat as one unit going forward.',
      });
    }

    if (opts.backPocket === 'patch') {
      steps.push({
        step: n++, title: 'Attach back pocket',
        detail: 'Fold top edge of pocket under 1″ and {topstitch}. {press} remaining 3 edges under ⅜″. Center pocket on one back panel, 2″ below the waist seam line. {topstitch} close to edge on 3 sides. Bar tack top corners.',
      });
    }

    if (opts.pocket === 'side-seam') {
      steps.push({
        step: n++, title: 'Prepare pocket bags',
        detail: '{serge} all mesh pocket bag edges. Pin one bag to each front panel side seam and one to each back panel at the pocket opening zone. Sew bags to panels along opening only. {press} away from opening.',
      });
    }

    steps.push({ step: n++, title: 'Sew center front seam', detail: 'Join outer front panels at CF crotch {RST}. Stretch stitch. {clip} curve every ½″. {press}.' });
    steps.push({ step: n++, title: 'Sew center back seam',  detail: 'Join outer back panels at CB {RST}. Stretch stitch. {clip}. {press}.' });
    steps.push({
      step: n++, title: 'Sew side seams',
      detail: opts.pocket === 'side-seam'
        ? 'Sew above and below pocket opening with stretch stitch. Pivot and sew around pocket bags, joining both bags together. Trim corners. {press} open.'
        : 'Join front to back at side seams {RST}. Stretch stitch. {press} open.',
    });
    steps.push({ step: n++, title: 'Sew inseam', detail: 'Continuous stretch stitch from hem to hem through crotch. {clip} curve. {press} toward back.' });

    // Waistband
    if (isRetro) {
      steps.push({
        step: n++, title: 'Install grommets in front waistband',
        detail: 'Mark grommet positions ¾″ from each CF short end of the front waistband piece. Punch holes with awl or hole punch. Set rust-proof grommets per manufacturer instructions.',
      });
      steps.push({
        step: n++, title: 'Construct front waistband',
        detail: 'Fold front waistband in half lengthwise {WST}, {press}. Pin to trunks front waist {RST}, matching side seams. Sew. Fold over to inside, pin covering seam. {topstitch} close to inner fold with stretch stitch.',
      });
      steps.push({
        step: n++, title: 'Construct back waistband',
        detail: 'Fold back waistband in half lengthwise {WST}, {press}. Pin to trunks back waist {RST}, matching side seams. Sew. Fold over, leave a 2″ gap in the topstitching at CB. Thread ¾″ elastic through casing with a {bodkin}. Overlap ends 1″, {zigzag} to join. Close gap. {topstitch} top and bottom edges.',
      });
      steps.push({
        step: n++, title: 'Join waistband halves',
        detail: 'Fold short ends of front and back waistband under ⅜″. Pin at each side seam, aligning with garment side seams. {slipstitch} or {topstitch} closed on each side.',
      });
    } else {
      steps.push({
        step: n++, title: 'Install grommets in waistband',
        detail: 'Mark grommet positions ¾″ from each CF short end of waistband. Punch holes with awl or hole punch. Set rust-proof grommets per manufacturer instructions. Check they are flush and secure.',
      });
      steps.push({
        step: n++, title: 'Attach waistband',
        detail: 'Fold waistband in half lengthwise {WST}, {press}. Pin to trunks waist {RST}, matching side seams. Sew. Fold over to inside, pin covering seam. {topstitch} close to inner fold with stretch stitch.',
      });
    }

    steps.push({
      step: n++, title: 'Thread drawstring',
      detail: 'Attach safety pin to cord end. Thread through front waistband casing, exiting at both CF grommets. Even tails. Melt-seal or knot cord ends to prevent fraying. Test drawstring moves freely.',
    });

    if (opts.sideSplit === '1') {
      steps.push({
        step: n++, title: 'Finish side slits',
        detail: 'A slit notch marks the top of each 1″ side slit on the side seam. Bar tack at each notch: stitch width 3–4 mm, length 0, 8–10 stitches. This holds the slit opening under stress. The slit edges finish when you fold and stitch the hem.',
      });
    }

    steps.push({
      step: n++, title: 'Hem',
      detail: `Fold hem up ${fmtInches(parseFloat(opts.hem))} once. {topstitch} with {zigzag} (2.5mm width). Do not use straight stitch on stretch/nylon hems.${opts.sideSplit === '1' ? ' Hem up to each bar tack; the slit opens above.' : ''}`,
    });
    steps.push({ step: n++, title: 'Finish', detail: 'Inspect all seams. Stretch stitch should {zigzag} slightly. Trim any loose threads. Rinse finished trunks in cold water before first wear.' });

    return steps;
  },

  variants: [
    {
      id: 'retro-short-trunks',
      name: 'Retro Short Trunks',
      defaults: { ease: 'slim', liner: 'brief', sideSplit: '1', backPocket: 'none' },
    },
  ],
};


// ── Panel builder (shared geometry) ──────────────────────────────────────

function buildPanel({ type, name, instruction, width, height, rise, inseam, ext, cbRaise, sa, hem, isBack, opts }) {
  const ccp      = crotchCurvePoints(0, 0, rise, ext, isBack, cbRaise);
  const curvePts = sampleBezier(ccp.p0, ccp.p1, ccp.p2, ccp.p3, 96);

  const poly = [];
  poly.push({ x: 0,     y: isBack ? -cbRaise : 0 }); // waist (raised on back)
  poly.push({ x: width, y: 0 });
  poly.push({ x: width, y: height });
  poly.push({ x: -ext,  y: height });
  poly.push({ x: -ext,  y: rise   });
  for (let i = curvePts.length - 2; i >= 1; i--) poly.push({ ...curvePts[i], curve: true });
  if (isBack && cbRaise > 0) poly.push({ x: 0, y: cbRaise }); // CB seam top

  const saPoly = offsetPolygon(poly, (i, a, b) => {
    if (Math.abs(a.y - height) < 0.5 && Math.abs(b.y - height) < 0.5) return -hem;
    return -sa;
  });

  const dims = [
    { label: fmtInches(width),              x1: 0,          y1: -0.5,       x2: width,  y2: -0.5,       type: 'h' },
    { label: fmtInches(rise)   + ' rise',   x: width + 1.2, y1: 0,          y2: rise,                   type: 'v' },
    { label: fmtInches(inseam) + ' inseam', x: width + 1.2, y1: rise,       y2: height,                 type: 'v' },
    { label: fmtInches(height) + ' total',  x: width + 2.3, y1: 0,          y2: height,                 type: 'v' },
    { label: fmtInches(ext)    + ' ext',    x1: -ext,       y1: rise + 0.4, x2: 0, y2: rise + 0.4,     type: 'h', color: '#c44' },
  ];

  // Notch marks: hip level on side seam, crotch junction, slit start
  const splitIn = parseFloat(opts.sideSplit) || 0;
  const notches = [
    { x: width, y: rise,        angle: edgeAngle({ x: width, y: 0 }, { x: width, y: height }) },  // hip on side seam
    ...(isBack ? [{ x: width, y: rise + 0.25, angle: edgeAngle({ x: width, y: 0 }, { x: width, y: height }) }] : []),
    { x: -ext,  y: rise,        angle: edgeAngle({ x: -ext, y: height }, { x: -ext, y: rise }) },  // crotch junction
    ...(isBack ? [{ x: -ext,  y: rise - 0.25, angle: edgeAngle({ x: -ext, y: height }, { x: -ext, y: rise }) }] : []),
    ...(splitIn > 0 ? [{ x: width, y: height - splitIn, angle: edgeAngle({ x: width, y: 0 }, { x: width, y: height }) }] : []),  // slit top
  ];

  return {
    id: type, name, instruction,
    polygon: poly, saPolygon: saPoly,
    path: polyToPath(poly), saPath: polyToPath(saPoly),
    dimensions: dims,
    width, height, rise, inseam, ext, cbRaise, sa, hem, isBack,
    notches, crotchBezier: ccp,
    // LOCKED — crotch curve cut & stitch lines are finalized. Do not modify
    // crotchBezier, crotchBezierSA, or their rendering in pattern-view.js.
    crotchBezierSA: insetCrotchBezier(ccp, sa),
    labels: [
      { text: 'SIDE SEAM', x: width + 0.3, y: height * 0.35, rotation: 90  },
      { text: 'CENTER',    x: -0.5,         y: rise   * 0.3,  rotation: -90 },
    ],
    type: 'panel', opts,
  };
}
