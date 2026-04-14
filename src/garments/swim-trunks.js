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
      // Brief-cut liner: 3 pattern pieces (5 cuts total).
      // Seams: CF only (no side seams), CB only, front-to-gusset, back-to-gusset.
      // Leg opening is a shaped arch — elastic applied to that edge.
      // Sized to waist (body-fit), not to hip-based outer panels.
      const waist    = m.waist || (m.hip * 0.84);
      const gussetW  = 3.0;
      const gussetHW = gussetW / 2;  // half gusset width — marks crotch attachment point on each panel

      // Front panel (one half — cut 2, mirror L & R)
      const bfW  = waist / 4 + 0.75;              // quarter-front + ease
      const bfH  = rise  * 0.58;                  // height: waist to gusset attachment
      const bfSag = Math.min(2.5, bfW * 0.22);    // leg arch sagitta (depth of inward sweep)
      const bfPoly = buildBriefPanel({ panelW: bfW, height: bfH, gussetHW, arcSagitta: bfSag, cbRaise: 0 });
      const bfSaPoly = offsetPolygon(bfPoly, () => -0.375);
      pieces.push({
        id: 'brief-front', name: 'Brief Liner Front',
        instruction: 'Cut 2 (mirror L & R) · Soft elastane (4-way stretch, ≥ 80% elastane) · CF seam joins both halves · Leg arch edge: apply ¼″ lingerie elastic (cut to 75% of arch length)',
        polygon: bfPoly, saPolygon: bfSaPoly,
        path: polyToPath(bfPoly), saPath: polyToPath(bfSaPoly),
        dimensions: [
          { label: fmtInches(bfW),              x1: 0, y1: -0.5, x2: bfW,  y2: -0.5, type: 'h' },
          { label: fmtInches(bfH) + ' height',  x: bfW + 1.2,   y1: 0,    y2: bfH,  type: 'v' },
        ],
        labels: [
          { text: 'BRIEF FRONT', x: bfW * 0.2,  y: bfH * 0.25, rotation: 0  },
          { text: 'CF SEAM',     x: -0.4,        y: bfH * 0.45, rotation: -90 },
          { text: 'LEG ARCH →',  x: bfW * 0.45, y: bfH * 0.4,  rotation: 30 },
        ],
        notches: [], type: 'panel', sa: 0.375, hem: 0,
      });

      // Back panel (one half — cut 2, mirror L & R)
      const bbW   = waist / 4 + 1.25;             // wider for seat coverage
      const bbH   = rise  * 0.75;                 // taller for full seat
      const bbRaise = 0.75;                        // CB raised above outer waist (seat shaping)
      const bbSag = Math.min(2.0, bbW * 0.17);    // shallower arch = more seat coverage
      const bbPoly = buildBriefPanel({ panelW: bbW, height: bbH, gussetHW, arcSagitta: bbSag, cbRaise: bbRaise });
      const bbSaPoly = offsetPolygon(bbPoly, () => -0.375);
      pieces.push({
        id: 'brief-back', name: 'Brief Liner Back',
        instruction: `Cut 2 (mirror L & R) · Soft elastane (4-way stretch, ≥ 80% elastane) · CB raised ${fmtInches(bbRaise)} for seat shaping · CB seam joins both halves · Leg arch edge: apply ¼″ lingerie elastic (cut to 75% of arch length)`,
        polygon: bbPoly, saPolygon: bbSaPoly,
        path: polyToPath(bbPoly), saPath: polyToPath(bbSaPoly),
        dimensions: [
          { label: fmtInches(bbW),              x1: 0, y1: -0.5, x2: bbW,  y2: -0.5,   type: 'h' },
          { label: fmtInches(bbH) + ' height',  x: bbW + 1.2,   y1: 0,    y2: bbH,     type: 'v' },
          { label: fmtInches(bbRaise) + ' CB raise', x: -0.6,   y1: -bbRaise, y2: 0,   type: 'v', color: '#c44' },
        ],
        labels: [
          { text: 'BRIEF BACK', x: bbW * 0.2,  y: bbH * 0.3,  rotation: 0  },
          { text: 'CB SEAM',    x: -0.4,        y: bbH * 0.5,  rotation: -90 },
          { text: 'LEG ARCH →', x: bbW * 0.45, y: bbH * 0.4,  rotation: 25 },
        ],
        notches: [], type: 'panel', sa: 0.375, hem: 0,
      });

      // Gusset (cut 1 — bridges front to back at crotch)
      const gussetH = Math.round((frontExt + backExt) * 10) / 10;
      pieces.push({
        id: 'brief-gusset', name: 'Brief Liner Gusset',
        instruction: 'Cut 1 · Soft elastane or cotton/spandex blend · One long edge sews to front crotch point {RST}; other long edge sews to back crotch point {RST}',
        dimensions: { width: gussetW, height: gussetH },
        type: 'pocket', sa: 0.375,
      });
    }

    // ── WAISTBAND ──
    // Retro style: hybrid (elastic back + drawcord front), same pattern as gym-shorts.
    // Standard style: single drawcord waistband.
    const wbWidth = 3; // 1.5″ finished

    if (isRetro) {
      // Retro waistband is sized to WAIST (not hip-panel width).
      // Panels are hip-sized for fit; the stretch fabric is eased into the shorter waistband.
      // Both halves equal (symmetric at side seams); elastic inside back is cut shorter for recovery.
      // Elastic ends are stitched into the short ends of the back waistband and caught at the side seams
      // when joining the two halves — no CB threading gap needed.
      const wbEase     = 1.0;  // 1" total ease for stretch fabric pull-on with elastic assist
      const wbFrontLen = m.waist / 2 + wbEase / 2 + sa * 2;
      const wbBackLen  = m.waist / 2 + wbEase / 2 + sa * 2;
      const elasticLen = Math.round((wbBackLen - sa * 2) * 0.88);  // 12% shorter than casing for recovery tension
      pieces.push({
        id: 'waistband-front',
        name: 'Waistband Front',
        instruction: `Cut 1 · Self fabric or nylon · ${fmtInches(wbWidth / 2)} finished · Grommet pair at CF for drawstring`,
        dimensions: { length: wbFrontLen, height: wbWidth },
        type: 'pocket', sa,
        marks: [
          { type: 'fold', axis: 'v', position: wbFrontLen / 2, label: 'CF — grommet pair' },
        ],
      });
      pieces.push({
        id: 'waistband-back',
        name: 'Waistband Back',
        instruction: `Cut 1 · Self fabric or nylon · ${fmtInches(wbWidth / 2)} finished · Elastic casing · Cut ¾″ elastic to ${elasticLen}″ (casing length × 0.88) · Stitch one elastic end into each short end before folding — elastic is caught at side seams, no threading gap needed`,
        dimensions: { length: wbBackLen, height: wbWidth },
        type: 'pocket', sa,
        marks: [
          { type: 'fold', axis: 'v', position: wbBackLen / 2, label: 'CB — center reference' },
        ],
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
      if (isRetro) {
        // Retro: anchored folded pocket — rendered as a polygon matching the front panel geometry.
        // Outer edge = front panel side seam. Top = waistband seam line. Bottom = hem fold line.
        // Fold line is a straight vertical edge 5" from the side seam toward the crotch.
        // Piece is ONE layer; fold in half along the fold edge before sewing → 5" deep pocket.
        const bagDepth = 5.0;           // depth from side seam to fold (toward crotch)
        const bagH     = rise + inseam; // full garment height: waistband to hem
        const pocketMouth = 4.0;        // pocket mouth opening: 4" from waistband down the side seam

        // Polygon: fold edge at x=0, side seam at x=bagDepth, y=0 at waist, y=bagH at hem
        const bagPoly = [
          { x: 0,        y: 0    },   // fold at waist
          { x: bagDepth, y: 0    },   // side seam at waist (top of pocket mouth)
          { x: bagDepth, y: bagH },   // side seam at hem
          { x: 0,        y: bagH },   // fold at hem
        ];
        // SA: fold edge = 0 (fold, not seam), hem edge = -hem (caught in fold), others = -sa
        const bagSaPoly = offsetPolygon(bagPoly, (i, a, b) => {
          if (Math.abs(a.x) < 0.01 && Math.abs(b.x) < 0.01) return 0;           // fold — no SA
          if (Math.abs(a.y - bagH) < 0.5 && Math.abs(b.y - bagH) < 0.5) return -hem; // hem edge
          return -sa;
        });

        pieces.push({
          id: 'pocket-bag',
          name: 'Side-Seam Pocket Bag',
          instruction: `Cut 2 (1 per side) · Athletic mesh · {serge} all edges · Fold in half at fold edge (no SA on fold) — fold faces crotch · Top caught in waistband seam · Outer edge into side seam — leave top ${fmtInches(pocketMouth)} OPEN (pocket mouth), sew closed below · Bottom caught in hem fold — bag cannot dangle`,
          polygon: bagPoly, saPolygon: bagSaPoly,
          path: polyToPath(bagPoly), saPath: polyToPath(bagSaPoly),
          dimensions: [
            { label: fmtInches(bagDepth) + ' depth', x1: 0, y1: -0.5, x2: bagDepth, y2: -0.5, type: 'h' },
            { label: fmtInches(bagH) + ' height',    x: bagDepth + 1.2, y1: 0, y2: bagH, type: 'v' },
          ],
          labels: [
            { text: 'FOLD (no SA)', x: -0.4,           y: bagH * 0.5, rotation: -90 },
            { text: 'SIDE SEAM',    x: bagDepth + 0.3,  y: bagH * 0.5, rotation: 90  },
            { text: 'POCKET BAG',   x: bagDepth * 0.25, y: bagH * 0.35, rotation: 0  },
          ],
          notches: [
            // Notch on side seam at bottom of pocket mouth — transition from open to sewn
            { x: bagDepth, y: pocketMouth, angle: edgeAngle({ x: bagDepth, y: 0 }, { x: bagDepth, y: bagH }) },
          ],
          type: 'panel', sa, hem,
        });
      } else {
        pieces.push({
          id: 'pocket-bag',
          name: 'Side-Seam Pocket Bag',
          instruction: 'Cut 4 (2 per side) · Athletic mesh - allows water drainage · {serge} all edges',
          dimensions: { width: 6.5, height: 7.0 },
          type: 'pocket', sa,
        });
      }
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
      notions.push({ ref: 'elastic-0.75', quantity: `${Math.round((m.waist / 2 + 0.5) * 0.88)}″ of ¾″ wide elastic - back waistband casing only (ends caught at side seams, no threading gap needed)` });
      notions.push({ name: 'Soft elastane', quantity: '0.33 yard', notes: 'Brief liner (4-way stretch, ≥ 80% elastane)' });
    }
    if (opts.liner === 'panels') {
      notions.push({ name: 'Athletic mesh', quantity: '0.75 yard', notes: 'Liner panels + pocket bags' });
    } else if (isRetro && opts.pocket === 'side-seam') {
      notions.push({ name: 'Athletic mesh', quantity: '0.25 yard', notes: 'Side-seam pocket bags only (2 folded pieces)' });
    }

    return buildMaterialsSpec({
      fabrics: ['nylon-taslan', 'supplex'],
      notions,
      thread: 'poly-all',
      needle: isRetro ? 'stretch-75' : 'ballpoint-80',
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
        detail: '{serge} all liner piece edges. Join two front halves at CF {RST} with stretch stitch, {clip} curve. Join two back halves at CB {RST}, {clip} curve. Sew one long edge of gusset to front crotch point {RST}. Sew other long edge of gusset to back crotch point {RST}. The result is a mini brief with two leg openings exposed. {clip} all curved seams. Apply ¼″ lingerie elastic to each leg arch opening: pin elastic to WS of arch at 75% stretch, {zigzag} in place, fold elastic to inside, {topstitch}. {baste} brief WS to WS of outer shell at waist edge ¼″ from raw edge. Treat as one unit going forward.',
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
        detail: isRetro
          ? '{serge} all edges of each pocket bag piece. Fold in half lengthwise {WST} — fold edge goes toward the crotch. Baste the top of each folded bag to the waistband seam line on the front panel. Baste the outer (side seam) edge of the bag to the front panel side seam edge. Baste the bottom to the front panel hem fold line. Bag is now secured to the front panel on three sides with the fold facing inward. Before assembling side seams: {serge} or {zigzag} the raw edge of each front panel and each back panel separately along the 4″ pocket mouth zone at the top of the side seam. These finished edges will remain exposed as the pocket mouth opening.'
          : '{serge} all mesh pocket bag edges. Pin one bag to each front panel side seam and one to each back panel at the pocket opening zone. Sew bags to panels along opening only. {press} away from opening.',
      });
    }

    steps.push({ step: n++, title: 'Sew center front seam', detail: 'Join outer front panels at CF crotch {RST}. Stretch stitch. {clip} curve every ½″. {press}.' });
    steps.push({ step: n++, title: 'Sew center back seam',  detail: 'Join outer back panels at CB {RST}. Stretch stitch. {clip}. {press}.' });
    steps.push({
      step: n++, title: 'Sew side seams',
      detail: opts.pocket === 'side-seam'
        ? (isRetro
            ? 'Sew front to back at each side seam {RST} with the pocket bag sandwiched at the seam edge. Starting from the waistband end: leave the first 4″ OPEN — do not sew (this is the pocket mouth). Then sew closed all the way to the hem, catching the bag outer edge in the seam. {press} open. Bar tack at the top and bottom of each pocket mouth opening: stitch width 3.5mm, length 0, 8–10 stitches perpendicular to the side seam at each transition point. This prevents the pocket mouth from extending under stress.'
            : 'Sew above and below pocket opening with stretch stitch. Pivot and sew around pocket bags, joining both bags together. Trim corners. {press} open.')
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
        detail: `Cut ¾″ elastic to the length marked on the pattern piece (back casing length × 0.88). Lay elastic along the inside of the unfolded waistband piece. Align one elastic end with each short end of the waistband, within the seam allowance. {zigzag} each elastic end in place at the short ends — the elastic will be automatically caught in the side seam joins. Fold waistband in half lengthwise {WST}, {press}. Pin to trunks back waist {RST}, matching side seams. Sew, stretching elastic gently to fit. Fold over to inside and {topstitch} top and bottom edges all the way across — no threading gap needed.`,
      });
      steps.push({
        step: n++, title: 'Join waistband halves',
        detail: 'Pin front and back waistband short ends together {RST} at each side seam, aligning with garment side seams. Sew with stretch stitch. Trim and {press}. The elastic ends are now secured at each side seam.',
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
      detail: `Fold hem up ${fmtInches(parseFloat(opts.hem))} once. {topstitch} with {zigzag} (2.5mm width). Do not use straight stitch on stretch/nylon hems.${opts.sideSplit === '1' ? ' Hem up to each bar tack; the slit opens above.' : ''}${isRetro && opts.pocket === 'side-seam' ? ' Catch the bottom edge of each pocket bag in the hem fold. Topstitch through all layers — the bag is now locked at waistband (top), side seam (outer edge), and hem (bottom). Cannot dangle.' : ''}`,
    });
    steps.push({ step: n++, title: 'Finish', detail: 'Inspect all seams. Stretch stitch should {zigzag} slightly. Trim any loose threads. Rinse finished trunks in cold water before first wear.' });

    return steps;
  },

  variants: [
    {
      id: 'retro-short-trunks',
      name: 'Retro Short Trunks',
      defaults: { ease: 'slim', liner: 'brief', sideSplit: '1', backPocket: 'none' },
      measurementDefaults: { inseam: 3 },
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

// ── Brief liner panel builder ─────────────────────────────────────────────────
// Generates one half of a brief front or back panel.
// No side seams — the leg opening is a shaped arch with elastic applied.
// Polygon coordinate system: x = 0 at CF/CB seam (inner), y = 0 at outer waist,
// y increases downward toward gusset attachment.
//
// Seam structure of the finished brief:
//   CF seam  → joins two front halves
//   CB seam  → joins two back halves  (CB is raised by cbRaise for seat shaping)
//   Gusset   → one long edge to front crotch point, other long edge to back crotch point
//   Leg arch → NO seam — elastic applied to this edge

function buildBriefPanel({ panelW, height, gussetHW, arcSagitta, cbRaise }) {
  const poly = [];

  // Top edge: diagonal if CB raised, straight if front (cbRaise = 0)
  poly.push({ x: 0,      y: cbRaise > 0 ? -cbRaise : 0 }); // CF or CB inner waist
  poly.push({ x: panelW, y: 0 });                            // outer waist corner

  // Leg opening arch: cubic Bezier from outer waist to gusset attachment.
  // cp1 stays near the outer waist corner (gradual at hip level).
  // cp2 pulls toward the CF/CB at the lower third (aggressive sweep near crotch).
  // This creates the characteristic brief arch: flat at top, deep curve near crotch.
  const p0  = { x: panelW,              y: 0 };
  const cp1 = { x: panelW - arcSagitta * 0.3, y: height * 0.15 };
  const cp2 = { x: arcSagitta * 0.5,    y: height * 0.75 };
  const p3  = { x: gussetHW,            y: height };

  const archPts = sampleBezier(p0, cp1, cp2, p3, 48);
  for (let i = 1; i < archPts.length - 1; i++) poly.push({ ...archPts[i], curve: true });

  poly.push({ x: gussetHW, y: height }); // gusset attachment corner (outer)
  poly.push({ x: 0,        y: height }); // CF/CB at crotch (inner)
  // Polygon closes back to the first point via the CF/CB seam (left vertical edge)

  return poly;
}
