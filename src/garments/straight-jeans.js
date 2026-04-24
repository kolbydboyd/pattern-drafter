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
  buildFoldOverScoopPocketBag, buildFoldOverSquareScoopPocketBag,
  closeYokeDarts, buildSideSeamPocketBag, tummyAdjustment,
} from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';
import { flatFelledSeam } from '../lib/seam-techniques.js';

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
    yokeDepth: { type: 'number', label: 'Yoke depth at CB (inches)', default: 2, step: 0.25, min: 1.5, max: 5.5 },
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
    beltLoopStyle: {
      type: 'select', label: 'Belt loops',
      values: [
        { value: 'individual', label: 'Individual loops (classic 5/6/7-loop)' },
        { value: 'tunnel',     label: 'Tunnel loops (continuous band, military/workwear)' },
        { value: 'none',       label: 'No belt loops' },
      ],
      default: 'individual',
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
    const tummyAdj = tummyAdjustment(m);

    pieces.push(buildPanel({
      type: 'front', name: 'Front Panel',
      instruction: 'Cut 2 (mirror L & R) · Curve on CENTER · Mark knee point',
      waistWidth: frontWaistW, hipWidth: frontHipW, hipLineY,
      height: H, rise, inseam,
      ext: frontExt, cbRaise: 0, sa, hem,
      isBack: false, shape, opts,
      calf: m.calf, ankle: m.ankle, seatDepth: m.seatDepth, tummyAdj,
    }));

    const hasYoke = opts.yokeStyle && opts.yokeStyle !== 'none';
    const backDartIntake = hasYoke ? 0 : Math.max(0, backHipW - backWaistW);
    // Only widen the cut panel when a dart will actually be drawn (intake > 1").
    // For smaller differences the side-seam taper is sufficient; widening without
    // a dart creates unaccounted excess at the waist.
    const effectiveDartIntake = backDartIntake > 1 ? backDartIntake : 0;

    pieces.push(buildPanel({
      type: 'back', name: 'Back Panel',
      instruction: `Cut 2 (mirror L & R) · CB raised ${fmtInches(cbRaise)} · Mark knee point`,
      waistWidth: backWaistW + effectiveDartIntake, hipWidth: backHipW, hipLineY,
      dartIntake: effectiveDartIntake,
      height: H, rise, inseam,
      ext: backExt, cbRaise, sa, hem,
      isBack: true, shape, opts: { ...opts, backPocket: 'patch' },
      calf: m.calf, ankle: m.ankle, seatDepth: m.seatDepth,
    }));

    // ── YOKE SPLIT (replaces full back panel with yoke + lower panel) ──
    if (opts.yokeStyle && opts.yokeStyle !== 'none') {
      const yokeDepthCB = parseFloat(opts.yokeDepth) || 2;
      const backIdx = pieces.findIndex(p => p.id === 'back');
      const backPanel = pieces[backIdx];
      const { yoke, lower } = splitBackYoke(backPanel, { yokeStyle: opts.yokeStyle, yokeDepthCB, hipLineY });
      pieces.splice(backIdx, 1, yoke, lower);
    }

    // ── WAISTBAND ──
    const wbLen = waist + ease.total + sa * 2;
    const beltLoopStyle = opts.beltLoopStyle || 'individual';
    const beltLoopCountForBand = waist > 36 ? 7 : 6;
    const wbInstr = beltLoopStyle === 'tunnel'
      ? `Cut 1 on fold · Interface · 1½″ finished · Tunnel belt loops applied across band (5 wide + 2 narrow)`
      : beltLoopStyle === 'none'
        ? `Cut 1 on fold · Interface · 1½″ finished · No belt loops`
        : `Cut 1 on fold · Interface · 1½″ finished · Belt loops ×${beltLoopCountForBand}`;
    pieces.push({
      id: 'waistband',
      name: 'Waistband',
      instruction: wbInstr,
      dimensions: { length: wbLen, width: 3 },
      type: 'rectangle', sa,
    });

    // ── FLY SHIELD (J-curve) + FLY EXTENSION ──
    pieces.push(buildFlyShield(rise));
    pieces.push(buildFlyExtension(rise));

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
      pieces.push(buildSquareScoopPocketBacking({ bagWidth: 7, scoopInset: 3.5, scoopDepth: 4, bagDepth: 5, sa, instruction: 'Cut 2 (1 + 1 mirror) \xb7 Self fabric (denim) \xb7 Visible pocket front \xb7 {serge} curved bottom edge before assembling' }));
      pieces.push(buildFoldOverSquareScoopPocketBag({ bagWidth: 7, scoopInset: 3.5, scoopDepth: 4, bagDepth: 10, sa, instruction: 'Cut 2 on fold (1 + 1 mirror) \xb7 Lining (muslin or drill) \xb7 Fold line at inner (left) edge \xb7 French seam at bottom after attaching to panel' }));
    }
    if (opts.frontPocket === 'side') {
      pieces.push(buildSideSeamPocketBag({
        bagWidth: 7, bagHeight: 9, sa,
        instruction: `Cut 4 (2 per side) · ${fmtInches(7)} wide × ${fmtInches(9)} deep · D-shaped · Straight edge along side seam · Serge all edges before assembly`,
      }));
    }
    pieces.push({ id: 'coin-pocket', name: 'Coin Pocket', instruction: 'Cut 1 \xb7 Right front only \xb7 \u215c\u2033 SA sides/bottom, \u00bd\u2033 SA top (double-fold hem) \xb7 {press} under using cardboard template \xb7 Rounded bottom corners', dimensions: { width: 3, height: 2.5 }, type: 'pocket', sa: 0.375, cornerRadius: 0.5 });
    pieces.push(buildBackPatchPocket());

    // ── BELT LOOPS ──
    if (beltLoopStyle === 'individual') {
      // Finished: ¾″ wide × ~2¾″ tall. Cut strip: 2¼″ wide (fold in thirds) × 3½″ long.
      const beltLoopCount = waist > 36 ? 7 : 6;
      pieces.push({ id: 'belt-loop', name: 'Belt Loops', instruction: `Cut ${beltLoopCount} strips · 2¼″ × 3½″ cut · {press} in thirds to ¾″ wide · {topstitch} both edges · Finished ¾″ × ~2¾″`, dimensions: { length: 3.5, width: 2.25 }, type: 'rectangle', sa: 0 });
    } else if (beltLoopStyle === 'tunnel') {
      // Dickies-style discrete tunnel loops: short, wide patches sewn across
      // the waistband. Each patch is tacked along the existing waistband top
      // and bottom topstitching lines, forming a horizontal tunnel the belt
      // threads through. Wide tunnels (3½″) sit at CB, both back panels, and
      // both side seams (5 total). Narrow tunnels (1½″) sit over the front
      // hip bones flanking the fly (2 total). Each strip is cut taller than
      // the finished waistband so it bows out enough to clear a 1¼″ belt.
      const tunnelH = 2.25; // cut height; finishes ~1½″ tall once tacked
      pieces.push({
        id: 'belt-tunnel-wide', name: 'Tunnel Belt Loop (wide)',
        instruction: `Cut 5 patches · 4″ × ${fmtInches(tunnelH)} · {press} long edges under ⅜″ each so it finishes ~3¼″ wide · Tack at top and bottom of waistband (along existing topstitching lines) at CB, both back panels, and both side seams · Belt threads horizontally through each tunnel`,
        dimensions: { width: 4, height: tunnelH },
        type: 'rectangle', sa: 0,
      });
      pieces.push({
        id: 'belt-tunnel-narrow', name: 'Tunnel Belt Loop (narrow)',
        instruction: `Cut 2 patches · 2¼″ × ${fmtInches(tunnelH)} · {press} long edges under ⅜″ each so it finishes ~1½″ wide · Tack at top and bottom of waistband over the front hip bones, flanking the fly · Belt threads horizontally through each tunnel`,
        dimensions: { width: 2.25, height: tunnelH },
        type: 'rectangle', sa: 0,
      });
    }
    // beltLoopStyle === 'none' adds no piece.

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
    const waist = m.waist || 32;
    const beltLoopCount = waist > 36 ? 7 : 6;
    const beltLoopStyle = opts.beltLoopStyle || 'individual';
    const hasYoke = opts.yokeStyle && opts.yokeStyle !== 'none';

    steps.push({
      step: n++, title: 'Prepare back patch pockets',
      detail: `Make a cardboard press template the finished pocket size (no SA). {press} SA under around template. Remove template. Add arcuate topstitching design. Position pockets on the ${hasYoke ? 'lower back panels (the section below the yoke seam)' : 'back panels'}, centered on the seat. {topstitch} sides and bottom at 3.5mm with gold thread. Bar tack top corners.`,
    });
    const coinPocketPlacement = (opts.frontPocket === 'side' || opts.frontPocket === 'none')
      ? 'upper outer area of the right front panel, approximately 2½″ from the side seam and 1″ below the waist edge'
      : 'upper outer area, just below the front pocket opening';
    steps.push({ step: n++, title: 'Attach coin pocket to right front panel',
      detail: `Make a cardboard press template the finished coin pocket size (no SA). Double-fold the top edge ¼″ + ¼″ and {topstitch} at ⅛″ from the fold for a clean finished hem. {press} the ⅜″ SA under on the sides and bottom around the template; {clip} into the bottom corner curves so they lie flat. Remove template. Position the coin pocket on the RS of the RIGHT front panel using the coin pocket placement notch (${coinPocketPlacement}). {topstitch} sides and bottom in gold thread at ⅛″ and again at ¼″ from the folded edges. {bartack} the top two corners. The coin pocket is now permanently sewn through the right front denim, before any pocket-bag assembly.` });
    if (opts.frontPocket === 'scoop' || opts.frontPocket === 'square-scoop') {
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
    } else if (opts.frontPocket === 'slant') {
      steps.push({ step: n++, title: 'Sew pocket backing to pocket bag',
        detail: 'Place the pocket backing (self fabric) on the pocket bag (lining) {RST}. Sew along the curved bottom edge and the straight left side. Leave the top (waist), right side seam edge, and slash diagonal open. {clip} the curved seam allowance. Turn right side out so the backing faces outward. {press} flat. {topstitch} \xbc\u2033 from the curved edge if desired. The pocket unit is now one piece with two layers.' });
      steps.push({ step: n++, title: 'Attach pocket to front panel',
        detail: 'The front panel is cut off at the slash line (the diagonal from waist to side seam). Align the pocket unit\u2019s slash diagonal edge to the front panel\u2019s slash edge {RST}. The pocket backing should face the front panel RS. Sew along the slash. {clip} the seam allowance. Turn the pocket to the wrong side of the panel. {press}. {understitch} through the pocket backing and both SAs so the seam rolls to the inside. {baste} the pocket\u2019s top edge to the panel\u2019s waist SA. {baste} the pocket\u2019s side seam edge to the panel\u2019s side SA. The pocket is now enclosed when the waist and side seams are sewn.' });
    } else if (opts.frontPocket === 'side') {
      steps.push({ step: n++, title: 'Prepare side-seam pocket bags',
        detail: '{serge} all edges of each pocket bag piece. Place two pocket bag pieces {RST} and sew around the curved bottom edge only at \xbd\u2033. Leave the top (waist) and straight side-seam edge open. {clip} the curved SA every \xbd\u2033. Turn RS out and {press} the bottom curve. Repeat for the second side. You now have two finished D-shaped pocket bags, one per side.' });
      steps.push({ step: n++, title: 'Baste pocket bags to front panels',
        detail: 'On each front panel, align a pocket bag\u2019s straight side-seam edge to the front panel\u2019s side-seam edge {RST}, with the pocket bag opening at the waist. The bag hangs into the body of the front panel. {baste} the side-seam edge at \u215c\u2033 and the top (waist) edge at \u215c\u2033. The bag will be caught automatically when the outseam and waistband are sewn.' });
    }
    // frontPocket === 'none': no pocket assembly steps
    if (hasYoke) {
      steps.push({
        step: n++, title: 'Sew back yoke to lower back panels',
        detail: `Sew back yoke to lower back panel {RST} along the ${opts.yokeStyle === 'pointed' ? 'V-shaped' : 'curved'} yoke seam at 5/8\u2033. Match notches at side seam, midpoint, and CB. {press} both SAs toward the yoke. Trim the lower panel SA to 3/16\u2033. Tuck the raw edge of the yoke SA under \xbc\u2033 (so it encloses the trimmed lower SA) and {press} flat \u2014 you now have a clean folded edge sitting on the yoke side of the seam, covering the 3/16\u2033 trimmed edge with ~\xbc\u2033 of clean margin. {topstitch} with gold thread at 3.5mm, two rows from RS: first at 1/8\u2033 from the seam, then at \xbc\u2033 from the seam. Both rows should bite through the fold, the trimmed lower SA, and the lower back panel. Repeat for mirror side.`,
      });
      steps.push({
        step: n++, title: 'Sew center back and seat curve',
        detail: 'Place both yoke+back assemblies {RST}, aligning the CB and seat curve edges from the waist all the way down to the front crotch point. Stitch the entire CB-to-seat-curve in one pass at 5/8\u2033. Add a second reinforcement row at 1/2\u2033 (1/8\u2033 outside the first row, in the SA). Trim SA to 3/8\u2033. {clip} the curve every 1/2\u2033. {serge} or zigzag the raw edge. {press} SA toward the left back. From RS, {topstitch} two rows in gold thread alongside the seam. The back rise is reinforced by double-stitching, not flat-felled, because the seat curvature can\u2019t lie flat under a fell.',
      });
    } else {
      steps.push({
        step: n++, title: 'Sew center back and seat curve',
        detail: 'Place both back panels {RST}, aligning the CB and seat curve edges from the waist all the way down to the front crotch point. Stitch the entire CB-to-seat-curve in one pass at 5/8\u2033. Add a second reinforcement row at 1/2\u2033 (1/8\u2033 outside the first row, in the SA). Trim SA to 3/8\u2033. {clip} the curve every 1/2\u2033. {serge} or zigzag the raw edge. {press} SA toward the left back. From RS, {topstitch} two rows in gold thread alongside the seam. The back rise is reinforced by double-stitching, not flat-felled, because the seat curvature can\u2019t lie flat under a fell.',
      });
    }
    steps.push({
      step: n++, title: 'Prep fly pieces',
      detail: 'Interface the outer fly shield piece. {staystitch} both the left and right CF edges of the front panels 3/8\u2033 from the edge to stabilize the curve. Sew the two fly shield pieces {RST}, leaving the straight CF edge open. Trim, {clip} the J-curve, turn RS out, {press}. {topstitch} the J-curve at 3/16\u2033 from RS.',
    });
    steps.push({
      step: n++, title: 'Sew CF curve below fly',
      detail: 'Sew the right and left front panels {RST} from the crotch point up to the base of the fly opening (marked on the pattern). Backtack at the fly base. {clip} the curve. {press} SA toward the right side.',
    });
    steps.push({
      step: n++, title: 'Attach right zipper tape to fly extension',
      detail: 'Fold the right Fly Extension to the RS at the fold line, enclosing the SA. {press}. Place the closed zipper face-down on the folded extension with the teeth right at the fold. Stitch the right zipper tape to the extension only \u2014 do not catch the main panel.',
    });
    steps.push({
      step: n++, title: 'Attach left zipper tape',
      detail: 'Fold the left Fly Extension to the WS. {press}. Open the zipper. Place the left tape face-up on the left extension, teeth aligned at the fold. Stitch 1/4\u2033 from the teeth, catching both the extension and the front panel.',
    });
    steps.push({
      step: n++, title: 'Attach fly shield, topstitch J, bartack',
      detail: 'Place the prepared fly shield on the left extension WS, straight CF edges aligned, and {baste} together. Close the zipper. Fold everything to the RS and {baste} the fly layers together from the RS to hold position. {topstitch} the J-curve from RS (transfer the J-curve shape from the pattern piece using chalk or a tracing wheel). {bartack} the fly base: 8\u201310 zig-zag stitches at 0mm stitch length across the seam. Check that the zipper opens cleanly from the RS.',
    });
    steps.push({
      step: n++, title: 'Sew outseams (side seams)',
      detail: 'Join front to back at each side seam {RST}, matching notches at hip and hem.\n\n' + flatFelledSeam({
        seam: 'outseam (side seam)',
        sa: '⅝″',
        pressDir: 'back',
        trimSide: 'front',
        foldSide: 'back',
        trimTo: '3/16″',
        row1: '⅛″',
        row2: '¼″',
        thread: 'gold',
        extraTip: 'Repeat for the other side seam. Work on one leg at a time while the assembly is still flat — it is much easier than trying to maneuver a closed tube of fabric.',
      }),
    });
    steps.push({
      step: n++, title: 'Sew inseams',
      detail: 'At this point each leg is a flat front+back assembly joined only at the outseam. The crotch curve was already sewn, so this step closes the inner-leg seams. For each leg: align the inseam edges {RST} from hem up to the crotch notch.\n\n' + flatFelledSeam({
        seam: 'inseam',
        sa: '⅝″',
        pressDir: 'front',
        trimSide: 'back',
        foldSide: 'front',
        trimTo: '3/16″',
        row1: '⅛″',
        row2: '¼″',
        thread: 'gold',
        extraTip: 'On the inseam the fell folds toward the front of the leg. After both inseams are felled, the crotch curves should meet cleanly at the crotch junction. If a small gap remains right at the junction, close it with a short reinforcing seam stitched twice. The pants are now a closed pair.',
      }),
    });
    if (beltLoopStyle === 'individual') {
      steps.push({
        step: n++, title: 'Make belt loop strips',
        detail: `Cut ${beltLoopCount} belt loop strips on the straight grain, each 2\u00bc\u2033 wide \u00d7 3\u00bd\u2033 long (matches the Belt Loops piece). {press} each strip in thirds lengthwise so it finishes \u00be\u2033 wide. {topstitch} both long edges at 2mm in gold thread. Trim ends square. The finished loop is \u00be\u2033 wide \u00d7 ~2\u00be\u2033 tall after both ends are turned under. Baste the top raw end of each loop to the waist SA, RS up, raw ends flush with the waist raw edge. Distribute ${beltLoopCount} loops around the waist: one at CB, one on each side seam, and the rest spaced evenly across the back and front (avoiding the fly).`,
      });
    }
    steps.push({
      step: n++, title: 'Prep waistband',
      detail: 'Interface the waistband (full length). Fold {RST} lengthwise. Stitch both short ends with the asymmetric overlap built in: the left end extends ~1\u00bc\u2033 past CF for the buttonhole overlap, the right end extends ~\u215d\u2033 for the button underlap. {clip} corners, turn RS out, {press} flat.',
    });
    steps.push({
      step: n++, title: 'Attach waistband to jeans waist',
      detail: beltLoopStyle === 'individual'
        ? 'Pin the bottom (WS) half of the waistband to the jeans waist {RST}, matching notches at CB, both side seams, CF, and the fly base. The belt loops sit sandwiched between the waist and the band, hanging down into the body. Stitch at 5/8\u2033. Grade the SA (trim jeans SA to 3/8\u2033, waistband SA to 1/4\u2033) so the seam lies flat.'
        : 'Pin the bottom (WS) half of the waistband to the jeans waist {RST}, matching notches at CB, both side seams, CF, and the fly base. Stitch at 5/8\u2033. Grade the SA (trim jeans SA to 3/8\u2033, waistband SA to 1/4\u2033) so the seam lies flat.',
    });
    steps.push({
      step: n++, title: 'Finish waistband interior',
      detail: 'Fold the waistband up and over to the inside. Fold the inside SA under so the folded edge sits just below the seam line. From RS, {topstitch} along the bottom of the waistband at 1/16\u2033 from the seam, catching the inner fold in one pass. {topstitch} a second row at the top edge of the waistband and continue around both finished ends, all in gold thread at 3mm.',
    });
    if (beltLoopStyle === 'individual') {
      steps.push({
        step: n++, title: 'Finish belt loops',
        detail: 'Flip each loop up over the waistband. Fold the bottom raw end under \u00bd\u2033. {topstitch} down through all layers close to the fold. Bar tack across the top and bottom of each loop (8\u201310 zig-zag stitches at 0mm stitch length) to lock the ends securely.',
      });
    } else if (beltLoopStyle === 'tunnel') {
      steps.push({
        step: n++, title: 'Prep tunnel belt loop patches',
        detail: 'Cut 5 wide tunnel patches (4\u2033 \u00d7 2\u00bc\u2033) and 2 narrow tunnel patches (2\u00bc\u2033 \u00d7 2\u00bc\u2033) on the straight grain. For each patch: {press} both long (vertical) edges under \u215c\u2033 toward the WS, then {topstitch} each folded edge at \u215b\u2033 in gold thread. Wide patches now finish ~3\u00bc\u2033 wide; narrow patches finish ~1\u00bd\u2033 wide. Top and bottom raw edges stay raw \u2014 they get caught by the waistband topstitching. The patch height (2\u00bc\u2033) is intentionally taller than the 1\u00bd\u2033 finished waistband so the patch bows out enough to clear a 1\u00bc\u2033 belt.',
      });
      steps.push({
        step: n++, title: 'Apply tunnel patches across waistband',
        detail: 'Position each finished patch horizontally across the OUTSIDE (RS) of the waistband, centered top-to-bottom so the patch overhangs both the top and bottom edges of the band by ~\u215c\u2033. Wide patches go at: CB, midway across each back panel between CB and side seam, and one centered on each side seam (5 total). Narrow patches go over each front hip bone, flanking the fly (2 total). For each patch: pin in place, then {topstitch} the top raw edge of the patch directly along the existing waistband top topstitching line, catching the patch in the same row. {topstitch} the bottom raw edge along the waistband bottom topstitching line. The middle of the patch stays free \u2014 it bows out from the waistband to form the tunnel. {bartack} both ends of both top and bottom seams on each patch (8\u201310 zig-zag stitches at 0mm length) for the high-stress corners. Verify each tunnel accepts the belt by threading one through before declaring done.',
      });
    }
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
  const w = 6;                // pocket width
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
    // Top edge gets 3/4″ SA (double fold ⅜″+⅜″ — industry standard for jeans patch pockets)
    if (Math.abs(a.y) < 0.1 && Math.abs(b.y) < 0.1) return -0.75;
    return -pocketSA;
  });

  return {
    id: 'back-pocket',
    name: 'Back Patch Pocket',
    instruction: 'Cut 2 · ¾″ hem at top (fold under ⅜″ twice, {topstitch}) · ⅜″ SA sides/bottom · {press} under using cardboard template · {topstitch} to back panel · Add arcuate stitching',
    polygon: poly,
    saPolygon: saPoly,
    path: polyToPath(poly),
    saPath: polyToPath(saPoly),
    width: w, height: totalH,
    sa: pocketSA, hem: 0.75, hemEdge: 'top', type: 'bodice',
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
    notches: [
      { x: 0, y: flyLen, angle: 270, label: 'fly base' },
    ],
  };
}


// ── Fly extension (rectangular underlap behind the CF) ──────────────────

function buildFlyExtension(rise) {
  const extSA = 0.25;                    // 1/4″ SA
  const w = 1.375;                       // ~1⅜″ wide
  const flyLen = Math.ceil(rise * 0.6);  // matches fly shield calc
  const h = flyLen + 1;                  // extends 1″ below fly base

  const poly = [
    { x: 0, y: 0 },
    { x: w, y: 0 },
    { x: w, y: h },
    { x: 0, y: h },
  ];

  const saPoly = offsetPolygon(poly, (i, a, b) => {
    // CF edge (left, x≈0): no SA — sits on center front fold
    if (Math.abs(a.x) < 0.1 && Math.abs(b.x) < 0.1) return 0;
    return -extSA;
  });

  return {
    id: 'fly-extension',
    name: 'Fly Extension',
    instruction: 'Cut 2 (left + right mirror) · Self fabric · Interface left · ¼″ SA · Folds back behind CF; carries the zipper tape',
    polygon: poly,
    saPolygon: saPoly,
    path: polyToPath(poly),
    saPath: polyToPath(saPoly),
    width: w, height: h,
    sa: extSA, type: 'bodice',
    isCutOnFold: false,
    dimensions: [
      { label: fmtInches(w) + ' width',  x1: 0, y1: -0.4, x2: w, y2: -0.4, type: 'h' },
      { label: fmtInches(h) + ' height', x: w + 0.8, y1: 0, y2: h, type: 'v' },
    ],
    labels: [
      { text: 'CF / FOLD', x: -0.55, y: h * 0.4, rotation: -90 },
    ],
    notches: [
      { x: 0, y: flyLen, angle: 270, label: 'fly base' },
    ],
  };
}


// ── Panel builder with knee-point leg shaping ─────────────────────────────

function buildPanel({ type, name, instruction, waistWidth, hipWidth, hipLineY, height, rise, inseam, ext, cbRaise, sa, hem, isBack, shape, opts, calf, ankle, seatDepth, dartIntake = 0, tummyAdj = 0 }) {
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
  poly.push({ x: 0,            y: isBack ? -cbRaise : -tummyAdj });   // waist at center seam (raised on back, tummy on front)
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
  if (hasSquareScoop) clipPanelAtSquareScoop(poly, sideWaistX, 3.5, 4);

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

  // For back panels with darts, waistWidth is the cut width; subtract dart intake
  // to get the finished (sewn) measurement shown on the label.
  const finishedWaistWidth = waistWidth - dartIntake;

  const dims = [
    { label: fmtInches(finishedWaistWidth) + ' waist', x1: 0, y1: -0.5, x2: sideWaistX, y2: -0.5, type: 'h' },
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

  // Notch marks: hip on side seam, crotch junction, knee on both seams.
  // Front panels also get a coin-pocket placement notch in the upper-right
  // pocket area (right front only, but marked on both since panels are mirrors).
  const notches = [
    { x: hipWidth,    y: hipLineY,        angle: edgeAngle({ x: hipWidth, y: 0 }, { x: sideKneeX, y: kneeY }) },
    ...(isBack ? [{ x: hipWidth, y: hipLineY + 0.25, angle: edgeAngle({ x: hipWidth, y: 0 }, { x: sideKneeX, y: kneeY }) }] : []),
    { x: -ext,        y: rise,            angle: edgeAngle({ x: inseamKneeX, y: kneeY }, { x: -ext, y: rise }) },
    ...(isBack ? [{ x: -ext, y: rise - 0.25,         angle: edgeAngle({ x: inseamKneeX, y: kneeY }, { x: -ext, y: rise }) }] : []),
    { x: sideKneeX,   y: kneeY,           angle: edgeAngle({ x: hipWidth, y: hipLineY }, { x: sideKneeX, y: kneeY }) },
    { x: inseamKneeX, y: kneeY,           angle: edgeAngle({ x: -ext, y: rise }, { x: inseamKneeX, y: kneeY }) },
    // Coin pocket placement (right front only) — sits just below the front
    // pocket opening on the upper outer area of the panel.
    ...(!isBack ? [{ x: sideWaistX - 1.75, y: 2.5, angle: 0, label: 'coin pocket' }] : []),
    // Pocket opening start on waist edge — matches the slash/scoop start notch on
    // the pocket bag so the two pieces can be aligned before sewing.
    ...(!isBack && (hasSlash || hasScoop || hasSquareScoop)
      ? [{ x: sideWaistX - 3.5, y: 0, angle: 180, label: 'pocket' }]
      : []),
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
          polygon, crotchBezier, crotchBezierSA, notches: origNotches, opts,
          darts: backDarts } = backPanel;

  const yokeSideDepth = 1.5; // yoke at side seam (~1.5″ below waist)
  // Interpolate the side seam x at yokeSideDepth — original side seam runs
  // diagonally from (waistWidth, 0) to (hipWidth, hipLineY)
  const sideXAtYoke = waistWidth + (hipWidth - waistWidth) * (yokeSideDepth / hipLineY);

  // ── Yoke seam curve from side seam → CB (pre-rotation) ────────────────
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

  // ── PRE-ROTATION yoke polygon (clockwise from CB waist) ───────────────
  const yokePolyRaw = [];
  yokePolyRaw.push({ x: 0,           y: -cbRaise      }); // CB waist (raised)
  yokePolyRaw.push({ x: waistWidth,  y: 0             }); // side waist (= backHipW)
  yokePolyRaw.push({ x: sideXAtYoke, y: yokeSideDepth }); // yoke seam at side
  for (const pt of seamPts) yokePolyRaw.push(pt);
  yokePolyRaw.push({ x: 0,           y: yokeDepthCB   }); // yoke seam at CB

  // ── Close the back darts: rotate dart wedges shut, absorbing them into
  // the yoke's seams.  The resulting yoke top edge becomes backWaistW wide,
  // the side seam slants inward, and the bottom (yoke seam) gains a curve.
  const numDarts = (backDarts || []).filter(d => d && d.intake > 0 && d.length > 0).length;
  const yokePoly = closeYokeDarts(yokePolyRaw, backDarts || []);

  // Dart closure rotates both side-seam vertices away from the true side seam.
  // The side seam is a garment boundary shared with the front panel — it must
  // stay on the original diagonal (waistWidth,0) → (hipWidth,hipLineY).
  // Snap both corners back; the dart intake lives in the yoke seam curve only.
  if (numDarts > 0 && numDarts + 1 < yokePoly.length) {
    yokePoly[numDarts + 1].y = 0;
    yokePoly[numDarts + 1].x = waistWidth;
  }
  // Remove dart left-leg pivot vertices — they create a kink in the top edge.
  // After splice: [CB_waist, side_waist, yoke_seam_side, ..., yoke_seam_CB]
  if (numDarts > 0) {
    yokePoly.splice(1, numDarts);
  }
  // seamStartIdx is always 2 after splice (CB_waist + side_waist precede seam)
  const seamStartIdx = 2;
  const yokeSeamLine = yokePoly.slice(seamStartIdx); // side → ... → CB (post-rotation)

  // Snap the yoke-seam/side-seam junction back to its original position.
  // Dart rotation shifts this endpoint; snapping it keeps the yoke and lower
  // panel side seams collinear with the original back-panel side seam.
  if (yokeSeamLine.length > 0) {
    yokeSeamLine[0].x = sideXAtYoke;
    yokeSeamLine[0].y = yokeSideDepth;
  }

  // ── LOWER BACK polygon (clockwise) ────────────────────────────────────
  // Top edge is the post-rotation yoke seam in reverse (CB → side), so the
  // lower panel mates exactly with the yoke piece.
  const lowerPoly = [];
  for (let i = yokeSeamLine.length - 1; i >= 0; i--) {
    lowerPoly.push({ ...yokeSeamLine[i] });
  }
  // Copy hip → knee → hem → inseam → crotch curve from the original back panel.
  // Skip both waist points (indices 0 and 1) since the top edge is now the
  // yoke seam line above.  Also filter out curve points above the yoke cut
  // and the {0, cbRaise} structural CB point (which now belongs to the yoke).
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

  // ── Seam lengths (measured along the post-rotation seam line) ─────────
  let yokeSeamLen = 0;
  for (let i = 0; i < yokeSeamLine.length - 1; i++) {
    yokeSeamLen += dist(yokeSeamLine[i], yokeSeamLine[i + 1]);
  }
  // Yoke top edge length post-closure = backWaistW (sum of dart intakes removed)
  const dartIntakeTotal = (backDarts || []).reduce((s, d) => s + (d?.intake || 0), 0);
  const yokeTopW = Math.max(0, waistWidth - dartIntakeTotal);
  const yokeH = yokeDepthCB + cbRaise;

  // ── Yoke notches (mid-seam alignment mark, on post-rotation seam) ─────
  const seamMidIdx = Math.floor(yokeSeamLine.length / 2);
  const seamMidPt  = yokeSeamLine[seamMidIdx] || { x: sideXAtYoke * 0.5, y: (yokeSideDepth + yokeDepthCB) / 2 };
  const seamEndA = yokeSeamLine[Math.max(0, seamMidIdx - 1)] || yokeSeamLine[0];
  const seamEndB = yokeSeamLine[Math.min(yokeSeamLine.length - 1, seamMidIdx + 1)] || yokeSeamLine[yokeSeamLine.length - 1];
  const yokeSideCornerPost = yokeSeamLine[0]; // post-rotation side-seam corner
  const yokeCBCorner       = yokeSeamLine[yokeSeamLine.length - 1]; // (0, yokeDepthCB), unrotated

  const yokeNotches = [
    { x: yokeSideCornerPost.x, y: yokeSideCornerPost.y, angle: edgeAngle({ x: waistWidth, y: 0 }, { x: hipWidth, y: hipLineY }) },
    { x: seamMidPt.x, y: seamMidPt.y, angle: edgeAngle(seamEndA, seamEndB) },
    { x: yokeCBCorner.x, y: yokeCBCorner.y, angle: 0 },
  ];

  // ── Dimensions ────────────────────────────────────────────────────────
  const yokeDims = [
    { label: fmtInches(yokeTopW) + ' waist', x1: 0, y1: -cbRaise - 0.5, x2: yokeTopW, y2: -cbRaise - 0.5, type: 'h' },
    { label: fmtInches(yokeH) + ' depth',     x: yokeSideCornerPost.x + 1.2, y1: -cbRaise, y2: yokeDepthCB, type: 'v' },
    { label: fmtInches(yokeSeamLen) + ' seam', x1: 0, y1: yokeDepthCB + 0.5, x2: yokeSideCornerPost.x, y2: yokeSideCornerPost.y + 0.5, type: 'h', color: '#b8963e' },
  ];

  // Lower panel inherits most of the original dimensions minus waist width
  const lowerDims = backPanel.dimensions.filter(d => !d.label.includes('waist'));
  lowerDims.push({ label: fmtInches(yokeSeamLen) + ' yoke seam', x1: 0, y1: yokeDepthCB - 0.5, x2: yokeSideCornerPost.x, y2: yokeSideCornerPost.y - 0.5, type: 'h', color: '#b8963e' });

  // ── Build pieces ──────────────────────────────────────────────────────
  const yoke = {
    id: 'back-yoke',
    name: 'Back Yoke',
    instruction: `Cut 2 (mirror L & R) · ${yokeStyle === 'pointed' ? 'Pointed V' : 'Curved'} yoke · Flat-fell to lower back panel`,
    polygon: yokePoly, saPolygon: yokeSaPoly,
    path: polyToPath(yokePoly), saPath: polyToPath(yokeSaPoly),
    dimensions: yokeDims,
    waistWidth: yokeTopW, hipWidth, width: yokeSideCornerPost.x, height: yokeH,
    rise, inseam, ext, cbRaise, sa, hem, isBack: true,
    notches: yokeNotches,
    labels: [
      { text: 'CB',        x: -0.5,                       y: yokeDepthCB * 0.4, rotation: -90 },
      { text: 'SIDE SEAM', x: yokeSideCornerPost.x + 0.3, y: yokeSideCornerPost.y * 0.5, rotation: 90 },
    ],
    darts: [], type: 'bodice', isCutOnFold: false, opts,
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
