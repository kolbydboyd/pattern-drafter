// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Keepall Duffel — arch-end construction.
 * Two arch-shaped end panels (short sides) + one continuous body wrap (L × wrapWidth).
 * Zipper runs along the top long edge. Trim straps (structural) run widthwise front-to-back.
 * All measurements in inches. Seam allowance computed by the engine.
 */

import { fmtInches, polyToPath, sampleBezier } from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

// Dimensions sourced from LV website + luggage review sites and converted from cm.
// 35 cm is a discontinued size; 45/50 are current Bandoulière models.
const PRESETS = {
  'keepall-35': { bagLen: 13.75, bagHeight: 8.25,   bagDepth: 6.75  }, // ~35×21×17 cm
  'keepall-45': { bagLen: 17.75, bagHeight: 10.625, bagDepth: 7.875 }, // 45×27×20 cm
  'keepall-50': { bagLen: 19.75, bagHeight: 11.375, bagDepth: 8.875 }, // 50×29×22.5 cm
};

function handleCutLen(L) { return Math.round((L / 2 + 8) * 2) / 2; }
function shoulderH(H) { return Math.round(H * 0.55 * 4) / 4; }
function wrapWidth(H, D) { return 2 * shoulderH(H) + D + 1; }

export default {
  id: 'keepall-duffel',
  name: 'Keepall Duffel',
  category: 'accessory',
  difficulty: 'intermediate',
  priceTier: 'intermediate',
  measurementLabel: 'Bag Dimensions',
  measurements: ['bagLen', 'bagHeight', 'bagDepth'],
  measurementDefaults: { bagLen: 13.75, bagHeight: 8.25, bagDepth: 6.75 },

  options: {
    preset: {
      type: 'select', label: 'Size',
      values: [
        { value: 'custom',     label: 'Custom' },
        { value: 'keepall-35', label: 'Keepall 35  (13¾ × 8¼ × 6¾″)', reference: 'day bag, smallest holdall' },
        { value: 'keepall-45', label: 'Keepall 45  (17¾ × 9¾ × 7¾″)', reference: 'weekend bag' },
        { value: 'keepall-50', label: 'Keepall 50  (19¾ × 10¾ × 8¼″)', reference: 'carry-on, most popular size' },
      ],
      default: 'keepall-35',
    },
    shoulderStrap: {
      type: 'select', label: 'Detachable shoulder strap',
      values: [
        { value: 'none', label: 'None (top handles only)' },
        { value: 'yes',  label: 'Yes — Bandouliere style', reference: 'adjustable strap with tri-glide and swivel snaps' },
      ],
      default: 'none',
    },
    interiorPocket: {
      type: 'select', label: 'Interior pocket',
      values: [
        { value: 'none', label: 'None' },
        { value: 'slip', label: 'Flat slip pocket',      reference: 'open patch pocket sewn to lining' },
        { value: 'zip',  label: 'Zippered flat pocket',  reference: 'zipped pocket sewn to lining' },
      ],
      default: 'slip',
    },
    exteriorPocket: {
      type: 'select', label: 'Exterior zip pocket',
      values: [
        { value: 'none',  label: 'None' },
        { value: 'front', label: 'Front zip pocket', reference: 'flat zip patch pocket on front body panel' },
      ],
      default: 'none',
    },
    handleStyle: {
      type: 'select', label: 'Top handles',
      values: [
        { value: 'fabric',  label: 'Fabric tube (matching canvas)', reference: 'folded tube, topstitched both edges' },
        { value: 'webbing', label: 'Cotton webbing (1″)',            reference: 'durable, less bulk than fabric tube' },
      ],
      default: 'fabric',
    },
    interfacing: {
      type: 'select', label: 'Stabilizer',
      values: [
        { value: 'none',   label: 'None — heavy canvas is self-supporting' },
        { value: 'medium', label: 'Medium sew-in', reference: 'use with lighter canvas (8–10 oz)' },
        { value: 'heavy',  label: 'Heavy fusible',  reference: 'Pellon 809 Decor-Bond, maximum structure' },
      ],
      default: 'none',
    },
    sa: {
      type: 'select', label: 'Seam allowance',
      values: [
        { value: 0.5,   label: '½″ (recommended for canvas)' },
        { value: 0.625, label: '⅝″' },
      ],
      default: 0.5,
    },
  },

  pieces(m, opts) {
    const sa  = parseFloat(opts.sa);
    const pre = PRESETS[opts.preset];
    const L   = pre ? pre.bagLen    : (m.bagLen    ?? 13.75);
    const H   = pre ? pre.bagHeight : (m.bagHeight ?? 8.25);
    const D   = pre ? pre.bagDepth  : (m.bagDepth  ?? 6.75);
    const sh  = shoulderH(H);
    const wW  = wrapWidth(H, D);
    const pieces = [];

    // ── End Panel (arch shape) ────────────────────────────────────────────────
    // Arch at top (y≈0), bottom straight edge at y=H — consistent with SVG y-down convention.
    // Bezier goes left-shoulder → arch peak → right-shoulder, curving upward (small y).
    const archH = H - sh;   // height of arch portion above the shoulder line
    const archPts = sampleBezier(
      { x: 0, y: archH },
      { x: 0, y: 0 },
      { x: D, y: 0 },
      { x: D, y: archH },
      32
    );
    // CW winding: arch (left→right via peak) → bottom-right → bottom-left → close (left side)
    const endPoly = [
      ...archPts,            // (0,archH) → peak → (D,archH) — zipper opening edge
      { x: D, y: H },        // bottom-right corner
      { x: 0, y: H },        // bottom-left corner
    ];
    const endPath = polyToPath(endPoly);
    // 33 arch points = 32 arch edges + 1 right side + 1 bottom + 1 left close = 35 total edges
    const endEdges = [
      ...Array(archPts.length - 1).fill(null).map(() => ({ sa, label: 'Arch — zipper opening edge' })),
      { sa, label: 'Right side — body wrap seam' },
      { sa, label: 'Bottom — body wrap seam' },
      { sa, label: 'Left side — body wrap seam' },
    ];
    const endDims = [
      { label: fmtInches(D) + ' width', x1: 0, y1: -0.6, x2: D, y2: -0.6, type: 'h' },
      { label: fmtInches(H) + ' height', x: D + 0.9, y1: 0, y2: H, type: 'v' },
    ];

    pieces.push({
      id: 'end-panel-outer', name: 'End Panel (Outer)',
      instruction: `Cut 2 · ${fmtInches(D)} wide × ${fmtInches(H)} tall · Arch top is the zipper opening; bottom and sides sew to body wrap`,
      type: 'bodice', polygon: endPoly, path: endPath,
      width: D, height: H, sa,
      edgeAllowances: endEdges, dims: endDims,
    });

    pieces.push({
      id: 'end-panel-lining', name: 'End Panel (Lining)',
      instruction: `Cut 2 · ${fmtInches(D)} wide × ${fmtInches(H)} tall · Same arch shape as outer`,
      type: 'bodice', polygon: endPoly, path: endPath,
      width: D, height: H, sa,
      edgeAllowances: endEdges,
    });

    if (opts.interfacing !== 'none') {
      pieces.push({
        id: 'end-panel-interfacing', name: 'End Panel Interfacing',
        instruction: `Cut 2 · ${fmtInches(D)} wide × ${fmtInches(H)} tall · Trim ⅛″ inside seamline before fusing`,
        type: 'bodice', polygon: endPoly, path: endPath,
        width: D, height: H, sa: 0,
      });
    }

    // ── Body Wrap (one long rectangle) ────────────────────────────────────────
    // Width = wW, measured from front zipper edge (long edge) to back zipper edge.
    // Zones across width: 0–sh = front face, sh–(sh+D) = bottom, (sh+D)–(2sh+D) = back face, +1″ ease.
    // Short ends (wW wide) sew to end panel perimeter: right angle corners at sh and sh+D from front long edge.

    pieces.push({
      id: 'body-wrap-outer', name: 'Body Wrap (Outer)',
      instruction: `Cut 1 · ${fmtInches(L)} long × ${fmtInches(wW)} wide · ` +
        `On each short end mark notches across the width at: ${fmtInches(sh)} from front long edge (front-face to bottom corner) and ${fmtInches(sh + D)} from front long edge (bottom to back-face corner); also mark ${fmtInches(sh + D/2)} (bottom center — turning gap reference). ` +
        `Along each long edge mark trim-strap positions at ${fmtInches(L/3)} and ${fmtInches(2*L/3)} from each short end.`,
      type: 'rectangle',
      dimensions: { length: L, width: wW }, sa,
      dims: [
        { label: fmtInches(L) + ' length', x1: 0, y1: -0.6, x2: L, y2: -0.6, type: 'h' },
        { label: fmtInches(wW) + ' width', x: L + 0.9, y1: 0, y2: wW, type: 'v' },
      ],
    });

    pieces.push({
      id: 'body-wrap-lining', name: 'Body Wrap (Lining)',
      instruction: `Cut 1 · ${fmtInches(L)} long × ${fmtInches(wW)} wide · Leave 6–7″ turning gap at center-bottom when sewing to end panels`,
      type: 'rectangle',
      dimensions: { length: L, width: wW }, sa,
    });

    if (opts.interfacing !== 'none') {
      pieces.push({
        id: 'body-wrap-interfacing', name: 'Body Wrap Interfacing',
        instruction: `Cut 1 · ${fmtInches(L)} long × ${fmtInches(2*sh)} wide · Interface only front and back faces; skip bottom band`,
        type: 'rectangle',
        dimensions: { length: L, width: 2*sh }, sa: 0,
      });
    }

    // ── Trim Straps (structural) ──────────────────────────────────────────────
    // Runs front zipper top → down front face (sh) → across bottom (D) → up back face (sh) → back zipper top.
    // Extra 12″ forms 4″ loose flaps at both ends for handle attachment.
    const trimStrapLen = 2*sh + D + 12;
    pieces.push({
      id: 'trim-strap', name: 'Trim Strap',
      instruction: `Cut 2 · ${fmtInches(trimStrapLen)} long × 1½″ wide · ` +
        `Fold in half lengthwise {RST}, sew long edge, turn right side out, {press}, {topstitch} both long edges.`,
      type: 'rectangle',
      dimensions: { length: trimStrapLen, width: 1.5 }, sa: 0,
    });

    // ── Handles ───────────────────────────────────────────────────────────────
    const hLen = handleCutLen(L);
    if (opts.handleStyle === 'fabric') {
      pieces.push({
        id: 'handle', name: 'Top Handle',
        instruction: `Cut 2 · ${fmtInches(hLen)} long × 2″ wide · ` +
          `Lay a length of ¾″ cotton webbing centered on the wrong side of the strip. ` +
          `Fold one long edge under ¼″ and press. Fold the strip around the webbing, raw edge tucked under the folded edge. ` +
          `Using a zipper foot, stitch close to the webbing along the full length, catching both fabric layers and locking the webbing core. ` +
          `Trim webbing flush at each end before attaching to anchor patches.`,
        type: 'rectangle',
        dimensions: { length: hLen, width: 2 }, sa: 0,
      });
    } else {
      pieces.push({
        id: 'handle-webbing', name: 'Top Handle (Webbing)',
        instruction: `Cut 2 strips of 1″ cotton webbing · ${fmtInches(hLen)} long each · Seal cut ends with lighter flame.`,
        type: 'rectangle',
        dimensions: { length: hLen, width: 1 }, sa: 0,
      });
    }

    // ── Handle Anchor Patches ─────────────────────────────────────────────────
    pieces.push({
      id: 'handle-anchor-patch', name: 'Handle Anchor Patch',
      instruction: `Cut 4 in outer fabric · 3″ wide × 2″ tall · X-box stitch (rectangle + diagonals) through patch, handle end, and body wrap.`,
      type: 'rectangle',
      dimensions: { length: 2, width: 3 }, sa: 0,
    });

    pieces.push({
      id: 'handle-anchor-interfacing', name: 'Handle Anchor Interfacing',
      instruction: `Cut 4 · 3″ wide × 2″ tall · Fuse or baste to wrong side of anchor patches`,
      type: 'rectangle',
      dimensions: { length: 2, width: 3 }, sa: 0,
    });

    // ── D-Ring Tabs + Shoulder Strap (optional) ───────────────────────────────
    if (opts.shoulderStrap === 'yes') {
      pieces.push({
        id: 'dring-tab', name: 'D-Ring Tab',
        instruction: `Cut 2 · 4″ long × 1½″ wide · Fold in half around a 1″ D-ring, raw edges together. Baste close to D-ring.`,
        type: 'rectangle',
        dimensions: { length: 4, width: 1.5 }, sa: 0,
      });

      const strapLen = Math.max(56, Math.round(L * 4.5));
      pieces.push({
        id: 'shoulder-strap', name: 'Detachable Shoulder Strap',
        instruction: `Cut 1 · ${fmtInches(strapLen)} long × 2½″ wide · ` +
          `Fold in half lengthwise {RST}. Sew long edge. Turn right side out. {press}. {topstitch} both long edges. ` +
          `Thread one end through tri-glide, fold back 1½″, sew box stitch. Attach swivel snaps.`,
        type: 'rectangle',
        dimensions: { length: strapLen, width: 2.5 }, sa: 0,
      });
    }

    // ── Zipper End Tabs ───────────────────────────────────────────────────────
    const tabW = D + sa * 2;
    pieces.push({
      id: 'zipper-end-tab', name: 'Zipper End Tab',
      instruction: `Cut 4 (2 outer + 2 lining) · 1½″ long × ${fmtInches(tabW)} wide · ` +
        `Fold in half lengthwise wrong sides together. Slip folded tab over each zipper end. Baste across.`,
      type: 'rectangle',
      dimensions: { length: 1.5, width: tabW }, sa: 0,
    });

    // ── Interior Pocket ───────────────────────────────────────────────────────
    // Pocket heights must fit within the face zone (sh tall) with margin for the fold and seamline.
    if (opts.interiorPocket === 'slip') {
      const pW = Math.min(10, Math.round(L * 0.6 * 4) / 4);
      const pH = Math.max(2.5, Math.min(6, Math.round((sh - 1.5) * 4) / 4));
      pieces.push({
        id: 'interior-slip-pocket', name: 'Interior Slip Pocket',
        instruction: `Cut 1 in lining fabric · ${fmtInches(pW)} wide × ${fmtInches(pH)} tall · ` +
          `Fold top edge under ½″ twice. {press} and {topstitch}. Press remaining three edges under ½″. ` +
          `Center on one lining body wrap back-face zone. {topstitch} sides and bottom close to fold.`,
        type: 'rectangle',
        dimensions: { length: pH, width: pW }, sa: 0,
      });
    }

    if (opts.interiorPocket === 'zip') {
      const pW = Math.min(10, Math.round(L * 0.6 * 4) / 4);
      const pH = Math.max(3, Math.min(5, Math.round((sh - 1.5) * 4) / 4));
      pieces.push({
        id: 'interior-zip-pocket', name: 'Interior Zip Pocket Panel',
        instruction: `Cut 2 in lining fabric · ${fmtInches(pW)} wide × ${fmtInches(pH)} tall · ` +
          `Sandwich a zipper between panels at top. Sew, {press}, {topstitch}. Sew remaining three sides {RST}. ` +
          `Turn through open zipper. {press}. Attach to lining body wrap back-face zone.`,
        type: 'rectangle',
        dimensions: { length: pH, width: pW }, sa: 0,
      });
    }

    // ── Exterior Zip Pocket (optional) ────────────────────────────────────────
    if (opts.exteriorPocket === 'front') {
      const epW = Math.min(10, Math.round(L * 0.55 * 4) / 4);
      const epH = Math.max(2.5, Math.min(4, Math.round((sh - 2) * 4) / 4));
      pieces.push({
        id: 'exterior-zip-pocket', name: 'Exterior Zip Pocket Panel',
        instruction: `Cut 2 in outer fabric · ${fmtInches(epW)} wide × ${fmtInches(epH)} tall · ` +
          `Sandwich zipper at top. Sew, {press}, {topstitch}. Sew remaining edges {RST}. ` +
          `Turn through open zipper. {press}. Center on front body wrap face zone with 1″ margin above and below. {topstitch} edges.`,
        type: 'rectangle',
        dimensions: { length: epH, width: epW }, sa: 0,
      });
    }

    return pieces;
  },

  materials(m, opts) {
    const sa  = parseFloat(opts.sa);
    const pre = PRESETS[opts.preset];
    const L   = pre ? pre.bagLen    : (m.bagLen    ?? 13.75);
    const H   = pre ? pre.bagHeight : (m.bagHeight ?? 8.25);
    const D   = pre ? pre.bagDepth  : (m.bagDepth  ?? 6.75);
    const sh  = shoulderH(H);
    const wW  = wrapWidth(H, D);

    const endRowH  = H + sa * 2 + 0.5;
    const wrapRowH = wW + sa * 2 + 0.5;
    const miscRowH = 6;
    const outerIn  = endRowH + wrapRowH + miscRowH;
    const outerYards = Math.ceil((outerIn / 36 + 0.25) * 4) / 4;

    const liningIn    = endRowH + wrapRowH + (opts.interiorPocket !== 'none' ? 2 : 0);
    const liningYards = Math.ceil((liningIn / 36 + 0.25) * 4) / 4;

    const notions = [];
    const notes   = [];

    notions.push({
      name: `Continuous coil zipper, ${fmtInches(L + 2)} minimum (YKK #5 non-separating coil)`,
      quantity: 1,
    });

    if (opts.handleStyle === 'webbing') {
      notions.push({
        name: `1″ cotton webbing, ${fmtInches(2 * handleCutLen(L))}`,
        quantity: 1,
      });
    } else {
      notions.push({
        name: `¾″ cotton webbing, ${fmtInches(2 * handleCutLen(L) + 2)} (core for wrapped fabric handles)`,
        quantity: 1,
      });
    }

    if (opts.shoulderStrap === 'yes') {
      notions.push({ name: '1″ D-rings', quantity: 2 });
      notions.push({ name: '1″ tri-glide slider', quantity: 1 });
      notions.push({ name: '1″ swivel snap hooks', quantity: 2 });
    }

    if (opts.interiorPocket === 'zip') {
      notions.push({ name: 'Interior pocket zipper, 7″', quantity: 1 });
    }

    if (opts.exteriorPocket === 'front') {
      notions.push({ name: 'Exterior pocket zipper, 8″', quantity: 1 });
    }

    if (opts.interfacing === 'medium') {
      notions.push({ ref: 'interfacing-med', quantity: `${outerYards} yards` });
    } else if (opts.interfacing === 'heavy') {
      notions.push({ ref: 'interfacing-heavy', quantity: `${outerYards} yards` });
    }

    notes.push(
      `Outer fabric: approximately ${outerYards} yard(s) at 54–60″ wide.`,
      `Lining fabric: approximately ${liningYards} yard(s) at 44–60″ wide.`,
      'Use heavy-duty polyester thread (30 wt) and a size 110/18 or 100/16 needle.',
      'Clip body-wrap SA at the two 90° corners on each short end (at the front-face/bottom and bottom/back-face notches) to within ⅛″ of seamline so the strip pivots around the corners.',
      'X-box stitch at handle anchors: rectangle ¼″ from all four patch edges, then both diagonals.',
      'Rub beeswax or zipper wax along zipper teeth before installing — canvas tension makes zippers stiff.',
    );

    if (opts.handleStyle === 'fabric') {
      notes.push(
        'Wrapped handles: lay ¾″ cotton webbing on the wrong side of each 2″ fabric strip, fold one long edge under ¼″ and press, then fold the strip around the webbing with the raw edge tucked under the folded edge. A zipper foot lets you stitch close to the core in a single pass — cleaner than the tube-and-turn method and gives the Keepall handle its slim structured profile.',
      );
    }

    if (opts.interfacing === 'none') {
      notes.push('No interfacing needed for 12 oz or heavier canvas.');
    }

    return buildMaterialsSpec({
      fabrics: ['waxed-canvas', 'cotton-duck', 'cotton-canvas', 'denim'],
      notions,
      thread: 'poly-heavy',
      needle: 'universal-100',
      stitches: ['straight-3', 'topstitch', 'bartack'],
      notes,
    });
  },

  instructions(m, opts) {
    const steps = [];
    let n = 1;
    const pre = PRESETS[opts.preset];
    const L   = pre ? pre.bagLen    : (m.bagLen    ?? 13.75);
    const H   = pre ? pre.bagHeight : (m.bagHeight ?? 8.25);
    const D   = pre ? pre.bagDepth  : (m.bagDepth  ?? 6.75);
    const sa  = parseFloat(opts.sa);
    const sh  = shoulderH(H);
    const hasStrap = opts.shoulderStrap === 'yes';

    steps.push({
      step: n++, title: 'Cut all pieces and transfer markings',
      detail: `Cut all pattern pieces with grain lines vertical. On each short end of the body wrap, mark notches across the width at ${fmtInches(sh)} from the front long edge (front-face to bottom corner) and ${fmtInches(sh + D)} from the front long edge (bottom to back-face corner); mark ${fmtInches(sh + D / 2)} as the bottom center reference for the lining turning gap. Along each long edge of the outer body wrap mark trim-strap positions at ${fmtInches(L / 3)} and ${fmtInches(2 * L / 3)} from each short end. On end panel pieces, mark the shoulder transition point (where arch meets straight side) for reference. On lining end panels mark pocket placement if chosen.`,
    });

    if (opts.interfacing !== 'none') {
      const ifDetail = opts.interfacing === 'heavy'
        ? 'Fuse heavy fusible interfacing to wrong side of both outer end panels and body wrap front/back faces only (skip bottom band). Use press cloth, firm pressure, no steam. Cool flat.'
        : 'Baste medium sew-in interfacing to wrong side of outer end panels and body wrap front/back faces. Trim ⅛″ inside seamlines.';
      steps.push({ step: n++, title: 'Apply interfacing', detail: ifDetail });
    }

    steps.push({
      step: n++, title: 'Make trim straps',
      detail: 'Fold each 1.5″ strip in half lengthwise {RST}. Sew long edge. Turn right side out. {press}. {topstitch} both long edges. These straps run widthwise across the bag, front-to-bottom-to-back.',
    });

    if (opts.handleStyle === 'fabric') {
      steps.push({
        step: n++, title: 'Make wrapped fabric handles',
        detail: `Cut a length of ¾″ cotton webbing slightly longer than each 2″-wide fabric handle strip. ` +
          `Fold one long edge of the fabric strip under ¼″ and {press}. ` +
          `Lay the webbing on the wrong side of the strip, aligned with the unfolded long edge. ` +
          `Fold the strip around the webbing so the folded edge overlaps the raw edge by ¼″. ` +
          `Using a zipper foot, stitch close to the webbing along the full length, catching both fabric layers. ` +
          `The handle should hold a slim structured profile — no turning, no {press} flat. ` +
          `Trim webbing flush at each end before attaching.`,
      });
    } else {
      steps.push({
        step: n++, title: 'Prepare webbing handles',
        detail: 'Seal cut ends of each webbing strip with a lighter flame. Fold each end under 1″.',
      });
    }

    steps.push({
      step: n++, title: 'Interface handle anchor patches',
      detail: 'Fuse or baste interfacing to wrong side of all four anchor patch pieces.',
    });

    if (opts.exteriorPocket === 'front') {
      steps.push({
        step: n++, title: 'Make and attach exterior zip pocket',
        detail: `Sew two pocket panels {RST} with zipper at top (sandwich method). {press} panels away from zipper. {topstitch} close to teeth. Open zipper. Fold pocket {RST}, sew remaining edges, clip corners, turn. {press}. Center on the front body wrap face zone (the ${fmtInches(sh)} band along the front long edge) with approximately 1″ margin above and below the pocket. {topstitch} side and bottom edges.`,
      });
    }

    steps.push({
      step: n++, title: 'Sew trim straps to body wrap',
      detail: `Position trim straps vertically at ${fmtInches(L / 3)} and ${fmtInches(2 * L / 3)} marks, running front-face-to-bottom-to-back-face. {topstitch} both long edges of each strap to the outer body wrap. Leave the top 4″ of BOTH ends of each strap loose (front-face top and back-face top) — these flaps will sandwich the handle ends under the anchor patches in the next step.`,
    });

    steps.push({
      step: n++, title: 'Attach handles and anchor patches',
      detail: 'Each handle has two ends — one attaches at the front-face top of a trim strap, the other at the back-face top of the same trim strap, arching up across the zipper. Tuck each handle end between the loose trim-strap flap and the body wrap, with the handle arching away from the zipper. Lay an anchor patch (raw edges turned under) over each end, top edge flush with the body wrap zipper edge. X-box stitch (rectangle ¼″ inside edges, then both diagonals) through anchor patch + trim strap + handle end + body wrap. Four X-boxes total: two per face.',
    });

    if (hasStrap) {
      steps.push({
        step: n++, title: 'Make and baste D-ring tabs',
        detail: 'Fold each tab in half around a 1″ D-ring, raw edges together. Sew close to D-ring. Baste one tab to each short end of the outer body wrap, flush with the front long edge (zipper edge side), raw ends of tab even with the body wrap short end. The D-ring tab will be caught in the body-wrap-to-end-panel seam in step 13, placing the D-ring at the top corner of the bag end.',
      });
    }

    if (opts.interiorPocket === 'slip') {
      steps.push({
        step: n++, title: 'Attach interior slip pocket to lining',
        detail: `Fold pocket top edge under ½″ twice. {press} and {topstitch}. Press remaining three edges under ½″. Center on the lining body wrap back-face zone (the ${fmtInches(sh)} band along the back long edge) with roughly equal margin above and below. {topstitch} sides and bottom.`,
      });
    } else if (opts.interiorPocket === 'zip') {
      steps.push({
        step: n++, title: 'Make and attach interior zippered pocket',
        detail: `Sandwich zipper between two pocket panels at top. Sew, {press}, {topstitch} close to teeth. Open zipper, fold {RST}, sew remaining edges, clip corners, turn. {press}. Center on the lining body wrap back-face zone (the ${fmtInches(sh)} band along the back long edge), pocket top 1″ below the back long edge. Edgestitch sides and bottom to lining.`,
      });
    }

    steps.push({
      step: n++, title: 'Prepare zipper end tabs',
      detail: 'Fold each end tab in half lengthwise, wrong sides together. Slip folded tab over each zipper tape end, covering the raw stop. Baste across.',
    });

    steps.push({
      step: n++, title: 'Install zipper on body wrap',
      detail: `Open zipper fully. Lay the front long edge of the outer body wrap {RST} against the front zipper tape, raw edges even. Using a zipper foot, sew with a ${fmtInches(sa)} seam. {press} the body wrap away from the zipper. {topstitch} ¼″ from the teeth. Repeat to sew the back long edge to the back zipper tape. Zipper end tabs (folded in the previous step) cap each raw end of the zipper tape — they will be secured in the end-panel seam in the next step.`,
    });

    steps.push({
      step: n++, title: 'Sew outer end panels to body wrap',
      detail: `Place one outer end panel {RST} to one short end of the outer body wrap. The short end wraps around the U-shaped perimeter of the end panel: starting from the front zipper edge, down the front face (${fmtInches(sh)}), across the bottom (${fmtInches(D)}), up the back face (${fmtInches(sh)}) to the back zipper edge. Clip the body wrap SA at the two 90° corners (at the ${fmtInches(sh)} and ${fmtInches(sh + D)} notch marks) to within ⅛″ of the seamline so the strip pivots cleanly around each corner. Pin and sew with ${fmtInches(sa)} seam. Zipper end tabs${hasStrap ? ' and D-ring tabs' : ''} are caught in this seam at the front-edge corner. Repeat for the second end panel.`,
    });

    steps.push({
      step: n++, title: 'Assemble lining',
      detail: `Sew lining end panels to lining body wrap exactly as outer bag, but leave 6–7″ turning gap open at center-bottom of body wrap seam. No zipper in lining.`,
    });

    steps.push({
      step: n++, title: 'Insert lining and slip-stitch to zipper tape',
      detail: 'Turn lining right side out. Nest lining inside outer bag, wrong sides together. Fold the front long edge of the lining body wrap under ½″ and pin to the front zipper tape; repeat for the back long edge to the back zipper tape. Fold the lining end panel arch edges under ½″ and pin to the zipper tape near each short end. Slip-stitch by hand or machine-edgestitch close to the folded lining edges, covering the zipper seam stitching.',
    });

    steps.push({
      step: n++, title: 'Close turning gap',
      detail: 'Reach through zipper to gap in lining body wrap bottom. Fold raw edges in ½″. Slip-stitch or edgestitch gap closed.',
    });

    steps.push({
      step: n++, title: 'Topstitch main seams (optional)',
      detail: 'For a refined finish, {topstitch} along outside where end panels meet body wrap, close to seamline, 3.5–4 mm stitch length.',
    });

    if (hasStrap) {
      steps.push({
        step: n++, title: 'Finish and attach shoulder strap',
        detail: 'Fold strap in half lengthwise {RST}. Sew long edge. Turn right side out. {press}. {topstitch} both long edges. Thread one end through tri-glide, fold back 1½″, sew box stitch. Attach swivel snaps to each end. Clip snaps to D-rings.',
      });
    }

    steps.push({
      step: n++, title: 'Final press and inspection',
      detail: '{press} entire bag with heavy press cloth. Push out arch corners. Tug each handle firmly. Open/close zipper; rub teeth with beeswax if stiff. Bag complete.',
    });

    return steps;
  },

  variants: [
    {
      id: 'keepall-35',
      name: 'Keepall 35',
      defaults: { preset: 'keepall-35', shoulderStrap: 'none', interiorPocket: 'slip', handleStyle: 'fabric' },
    },
    {
      id: 'keepall-45',
      name: 'Keepall 45',
      defaults: { preset: 'keepall-45', shoulderStrap: 'none', interiorPocket: 'slip', handleStyle: 'fabric' },
    },
    {
      id: 'keepall-50',
      name: 'Keepall 50',
      defaults: { preset: 'keepall-50', shoulderStrap: 'yes', interiorPocket: 'zip', handleStyle: 'fabric' },
    },
  ],
};
