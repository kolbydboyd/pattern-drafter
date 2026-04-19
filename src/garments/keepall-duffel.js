// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Keepall Duffel — lined canvas holdall inspired by the classic European travel duffel.
 * Keepall-35 dimensions by default (35 cm length). Fully lined, top-zip entry, two top handles.
 * All measurements in inches. Seam allowance computed by the engine.
 */

import { fmtInches, polyToPath } from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

// Size presets — L × H × D in inches (rounded from cm originals)
const PRESETS = {
  'keepall-35': { bagLen: 13.75, bagHeight: 8.25,  bagDepth: 6.75 },
  'keepall-45': { bagLen: 17.75, bagHeight: 9.75,  bagDepth: 7.75 },
  'keepall-50': { bagLen: 19.75, bagHeight: 10.75, bagDepth: 8.25 },
};

const HANDLE_CUT_LEN = 12; // cut length before folding; finishes to ~9.5" usable loop

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
    const r   = Math.min(1.25, H * 0.14); // corner radius, max 1.25″
    const pieces = [];

    // ── Body Panels (front + back) ────────────────────────────────────────────
    // Hexagonal polygon: straight top (zipper edge), chamfered bottom corners.
    const bodyPoly = [
      { x: 0,     y: 0 },
      { x: L,     y: 0 },
      { x: L,     y: H - r },
      { x: L - r, y: H },
      { x: r,     y: H },
      { x: 0,     y: H - r },
    ];
    const bodyPath = polyToPath(bodyPoly);
    const bodyEdges = [
      { sa, label: 'Top — zipper seam' },
      { sa, label: 'Side — gusset seam' },
      { sa, label: 'Corner curve — clip gusset here' },
      { sa, label: 'Bottom — gusset seam' },
      { sa, label: 'Corner curve — clip gusset here' },
      { sa, label: 'Side — gusset seam' },
    ];
    const bodyDims = [
      { label: fmtInches(L) + ' length', x1: 0, y1: -0.6, x2: L,  y2: -0.6, type: 'h' },
      { label: fmtInches(H) + ' height', x: L + 0.9, y1: 0, y2: H, type: 'v' },
    ];

    pieces.push({
      id: 'body-panel-outer', name: 'Body Panel (Outer)',
      instruction: `Cut 2 · ${fmtInches(L)} wide × ${fmtInches(H)} tall · Round bottom two corners by ${fmtInches(r)} radius · Top straight edge = zipper`,
      type: 'bodice', polygon: bodyPoly, path: bodyPath,
      width: L, height: H, sa,
      edgeAllowances: bodyEdges, dims: bodyDims,
    });

    pieces.push({
      id: 'body-panel-lining', name: 'Body Panel (Lining)',
      instruction: `Cut 2 · ${fmtInches(L)} wide × ${fmtInches(H)} tall · Same shape as outer body panel`,
      type: 'bodice', polygon: bodyPoly, path: bodyPath,
      width: L, height: H, sa,
      edgeAllowances: bodyEdges,
    });

    // ── Side + Bottom Gusset ──────────────────────────────────────────────────
    // Wraps: top-right → down right side → across bottom → up left side → top-left.
    // Corner ease zones let it bend around the rounded body-panel corners.
    const arcLen    = (Math.PI / 2) * r;
    const sideLen   = H - r;
    const gussetLen = Math.ceil((2 * sideLen + 2 * arcLen + L + 1) * 4) / 4;

    pieces.push({
      id: 'gusset-outer', name: 'Side + Bottom Gusset (Outer)',
      instruction: `Cut 1 · ${fmtInches(gussetLen)} long × ${fmtInches(D)} wide · ` +
        `Mark center notch at ${fmtInches(gussetLen / 2)} (bottom center). ` +
        `Mark corner-ease notches ${fmtInches(Math.round(sideLen * 4) / 4)} and ` +
        `${fmtInches(Math.round((sideLen + arcLen) * 4) / 4)} from each short end. ` +
        `Clip into SA every ½″ within the ease zones before sewing to body panels.`,
      type: 'rectangle',
      dimensions: { length: gussetLen, width: D },
      sa,
      dims: [
        { label: fmtInches(gussetLen) + ' length', x1: 0, y1: -0.6, x2: gussetLen, y2: -0.6, type: 'h' },
        { label: fmtInches(D) + ' depth', x: gussetLen + 0.9, y1: 0, y2: D, type: 'v' },
      ],
    });

    pieces.push({
      id: 'gusset-lining', name: 'Side + Bottom Gusset (Lining)',
      instruction: `Cut 1 · ${fmtInches(gussetLen)} long × ${fmtInches(D)} wide · ` +
        `Same as outer gusset. When sewing to lining body panels, leave a 6–7″ turning gap at the center bottom seam.`,
      type: 'rectangle',
      dimensions: { length: gussetLen, width: D },
      sa,
    });

    // ── Zipper End Tabs ───────────────────────────────────────────────────────
    // Cap the raw ends of the zipper tape; caught in the top seam.
    const tabW = D + sa * 2;
    pieces.push({
      id: 'zipper-end-tab', name: 'Zipper End Tab',
      instruction: `Cut 4 (2 outer + 2 lining) · 1½″ long × ${fmtInches(tabW)} wide · ` +
        `Fold in half lengthwise wrong sides together. Slip one folded tab over each end of zipper tape, covering the raw stop. Baste across end.`,
      type: 'rectangle',
      dimensions: { length: 1.5, width: tabW },
      sa: 0,
    });

    // ── Top Handles ───────────────────────────────────────────────────────────
    if (opts.handleStyle === 'fabric') {
      pieces.push({
        id: 'handle', name: 'Top Handle',
        instruction: `Cut 2 · ${fmtInches(HANDLE_CUT_LEN)} long × 2½″ wide · ` +
          `Fold in half lengthwise {RST}. Sew long raw edge. Turn right side out. {press} flat, seam centered. {topstitch} both long edges ⅛″ from edge. Fold each end under ½″.`,
        type: 'rectangle',
        dimensions: { length: HANDLE_CUT_LEN, width: 2.5 },
        sa: 0,
      });
    } else {
      pieces.push({
        id: 'handle-webbing', name: 'Top Handle (Webbing)',
        instruction: `Cut 2 strips of 1″ cotton webbing · ${fmtInches(HANDLE_CUT_LEN)} long each · Seal cut ends with lighter flame. Fold under 1″ at each end before anchoring under patches.`,
        type: 'rectangle',
        dimensions: { length: HANDLE_CUT_LEN, width: 1 },
        sa: 0,
      });
    }

    // ── Handle Anchor Patches ─────────────────────────────────────────────────
    const anchorOffset = Math.round(L / 4 * 4) / 4;
    pieces.push({
      id: 'handle-anchor-patch', name: 'Handle Anchor Patch',
      instruction: `Cut 4 in outer fabric + 4 in interfacing · 3″ wide × 2″ tall · ` +
        `Interface all 4 patches. On each outer body panel mark two positions: ${fmtInches(anchorOffset)} from each short end, 1″ below top raw edge. ` +
        `Tuck handle ends under patches. Sew X-box stitch through patch, handle end, and body panel.`,
      type: 'rectangle',
      dimensions: { length: 2, width: 3 },
      sa: 0,
    });

    // ── D-Ring Tabs + Shoulder Strap (optional) ───────────────────────────────
    if (opts.shoulderStrap === 'yes') {
      pieces.push({
        id: 'dring-tab', name: 'D-Ring Attachment Tab',
        instruction: `Cut 2 in outer fabric · 4″ long × 1½″ wide · ` +
          `Fold each piece in half around a 1″ D-ring, raw edges together. Baste close to the D-ring. ` +
          `Baste one tab to each short end of the outer gusset, centered, raw edges flush with the gusset top edge. Caught in the top/zipper seam.`,
        type: 'rectangle',
        dimensions: { length: 4, width: 1.5 },
        sa: 0,
      });

      const strapLen = Math.max(56, Math.round(L * 4.5));
      pieces.push({
        id: 'shoulder-strap', name: 'Detachable Shoulder Strap',
        instruction: `Cut 1 · ${fmtInches(strapLen)} long × 2½″ wide · ` +
          `Fold in half lengthwise {RST}. Sew long edge. Turn right side out. {press}. {topstitch} both long edges. ` +
          `Thread one end through the tri-glide slider, fold back 1½″, sew box stitch. Attach swivel snap to each strap end. Clip snaps to D-rings.`,
        type: 'rectangle',
        dimensions: { length: strapLen, width: 2.5 },
        sa: 0,
      });
    }

    // ── Interior Pocket ───────────────────────────────────────────────────────
    if (opts.interiorPocket === 'slip') {
      const pW = Math.min(10, Math.round(L * 0.65 * 4) / 4);
      const pH = Math.min(7,  Math.round(H * 0.70 * 4) / 4);
      pieces.push({
        id: 'interior-slip-pocket', name: 'Interior Slip Pocket',
        instruction: `Cut 1 in lining fabric · ${fmtInches(pW)} wide × ${fmtInches(pH)} tall · ` +
          `Fold top edge under ½″ twice. {press} and {topstitch}. Press remaining three edges under ½″. ` +
          `Center on one lining body panel 1½″ below top raw edge. {topstitch} sides and bottom close to fold.`,
        type: 'rectangle',
        dimensions: { length: pH, width: pW },
        sa, hem: 1.0, hemEdge: 'top',
      });
    }

    if (opts.interiorPocket === 'zip') {
      const pW = Math.min(10, Math.round(L * 0.65 * 4) / 4);
      pieces.push({
        id: 'interior-zip-pocket', name: 'Interior Zip Pocket Panel',
        instruction: `Cut 2 in lining fabric · ${fmtInches(pW)} wide × 6″ tall · ` +
          `Sandwich a ${fmtInches(pW + 1)} zipper between the two panels at the top edge. Sew through all three layers. {press} away from zipper. {topstitch}. ` +
          `Sew remaining three sides {RST}. Turn right side out. Attach finished pocket to one lining body panel 1½″ below top edge.`,
        type: 'rectangle',
        dimensions: { length: 6, width: pW },
        sa,
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
    const r   = Math.min(1.25, H * 0.14);
    const arcLen    = (Math.PI / 2) * r;
    const sideLen   = H - r;
    const gussetLen = Math.ceil((2 * sideLen + 2 * arcLen + L + 1) * 4) / 4;

    // Yardage: layout on 54-60″ wide fabric
    // Row 1: both outer body panels side by side (each L wide, so 2L on 54″ wide is fine)
    // Row 2: gusset (gussetLen × D) + handles + patches
    const bodyRowH   = H + sa * 2 + 0.5;
    const gussetRowH = D + sa * 2 + 0.5;
    const miscRowH   = 4; // handles, patches, tabs
    const outerIn    = bodyRowH + gussetRowH + miscRowH;
    const outerYards = Math.ceil((outerIn / 36 + 0.25) * 4) / 4;

    const liningIn    = bodyRowH + gussetRowH + (opts.interiorPocket !== 'none' ? 3 : 0);
    const liningYards = Math.ceil((liningIn / 36 + 0.25) * 4) / 4;

    const notions = [];
    const notes   = [];

    const zipperLen = Math.ceil(L + 4);
    notions.push({
      name: 'Main zipper',
      quantity: `1 continuous coil or separating, at least ${fmtInches(zipperLen)} long. YKK #5 coil recommended. Use a Teflon foot over canvas.`,
    });

    notions.push({ name: '¾″ D-rings (handle anchors)', quantity: '4' });

    if (opts.shoulderStrap === 'yes') {
      notions.push({ name: '1″ D-rings (strap attachment)', quantity: '2' });
      notions.push({ name: '1″ tri-glide / ladder lock slider', quantity: '1' });
      notions.push({ name: '1″ swivel snap hooks', quantity: '2' });
    }

    if (opts.interiorPocket === 'zip') {
      const pW = Math.min(10, Math.round(L * 0.65 * 4) / 4);
      notions.push({ name: 'Interior pocket zipper', quantity: `1, ${fmtInches(Math.ceil(pW + 1))} long` });
    }

    if (opts.handleStyle === 'webbing') {
      notions.push({ name: '1″ cotton webbing', quantity: `${fmtInches(HANDLE_CUT_LEN * 2)} for two handles` });
    }

    if (opts.interfacing === 'medium') {
      notions.push({ ref: 'interfacing-med', quantity: `${outerYards} yards` });
    } else if (opts.interfacing === 'heavy') {
      notions.push({ ref: 'interfacing-heavy', quantity: `${outerYards} yards` });
    }

    notes.push(
      'Outer fabric: use 10–14 oz waxed canvas, cotton duck, or heavyweight cotton canvas. Pre-shrink all natural-fiber fabric before cutting.',
      `Outer fabric: approximately ${outerYards} yard(s) at 54–60″ wide.`,
      `Lining fabric: approximately ${liningYards} yard(s). Cotton twill, cotton canvas, or similar sturdy woven at 44–60″ wide.`,
      'Use heavy-duty polyester thread (30 wt) and a size 100/16 or 110/18 needle for all construction seams.',
      'Grade seam allowances at curved gusset corners: trim gusset SA to ¼″, body panel SA to ⅜″, to reduce bulk.',
      'Wax zipper teeth with beeswax before installing — canvas tension can make zippers stiff.',
      'X-box stitch at handle anchors: sew a rectangle ¼″ from all four patch edges, then stitch both diagonals. This is the critical structural step.',
    );

    if (opts.interfacing === 'none') {
      notes.push('No interfacing is needed for 12 oz or heavier canvas. For 8–10 oz canvas add medium sew-in interfacing to the outer body panels.');
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
    const r   = Math.min(1.25, H * 0.14);
    const arcLen      = (Math.PI / 2) * r;
    const sideLen     = H - r;
    const anchorOffset = fmtInches(Math.round(L / 4 * 4) / 4);
    const hasStrap    = opts.shoulderStrap === 'yes';

    // 1. Cut and mark
    steps.push({
      step: n++, title: 'Cut all pieces and transfer markings',
      detail: `Cut all pattern pieces with grain lines vertical. On each outer body panel mark the two handle anchor positions: ${anchorOffset} from each short end, 1″ below the top raw edge. On the gusset mark the center-bottom notch and the two pairs of corner-ease zone notches (${fmtInches(Math.round(sideLen * 4) / 4)} and ${fmtInches(Math.round((sideLen + arcLen) * 4) / 4)} from each short end). These notches tell you exactly where to clip the SA to ease the gusset around the body-panel corners.`,
    });

    // 2. Interfacing
    if (opts.interfacing !== 'none') {
      const ifDetail = opts.interfacing === 'heavy'
        ? 'Fuse heavy fusible interfacing to the wrong side of both outer body panels and the outer gusset. Use a press cloth, firm pressure, no steam. Let cool completely flat — moving pieces while warm causes bubbling.'
        : 'Baste medium sew-in interfacing to the wrong side of both outer body panels and the outer gusset within the seam allowance. Trim interfacing ⅛″ inside all seamlines to eliminate bulk at seams.';
      steps.push({ step: n++, title: 'Apply interfacing', detail: ifDetail });
    }

    // 3. Make handles
    if (opts.handleStyle === 'fabric') {
      steps.push({
        step: n++, title: 'Make fabric tube handles',
        detail: `Fold each handle strip in half lengthwise {RST}. Sew the long raw edge. Trim SA to ¼″. Turn right side out using a bodkin or safety pin. {press} flat, seam centered on one face. {topstitch} both long edges ⅛″ from the edge. Set aside.`,
      });
    } else {
      steps.push({
        step: n++, title: 'Prepare webbing handles',
        detail: 'Seal cut ends of each webbing strip by melting briefly with a lighter. Fold each end under 1″. The folded end will be hidden under the anchor patch.',
      });
    }

    // 4. Interface anchor patches
    steps.push({
      step: n++, title: 'Interface handle anchor patches',
      detail: 'Fuse or baste interfacing to the wrong side of all four anchor patch pieces. These small reinforcements spread load from a heavy bag across several inches of canvas, preventing tear-out at the handle roots.',
    });

    // 5. Attach handles + patches with X-box stitch
    steps.push({
      step: n++, title: 'Attach handles and anchor patches to outer body panels',
      detail: `On the right side of each outer body panel, pin the handle ends at the marked positions (${anchorOffset} from each short end, ends pointing downward, loop arching above). Handle ends should extend 1½″ below the top raw edge. Baste each end in place. Lay one anchor patch right side up over each handle end, top edge flush with the body panel top raw edge. Sew the X-box stitch: stitch a rectangle ¼″ inside all four patch edges, then stitch both diagonals. Repeat for both handles on both body panels.`,
    });

    // 6. D-ring tabs (optional)
    if (hasStrap) {
      steps.push({
        step: n++, title: 'Make and baste D-ring tabs',
        detail: 'Fold each tab in half around a 1″ D-ring, raw edges together. Sew a box stitch close to the D-ring. Baste one tab to each short end of the outer gusset, centered widthwise, raw edges of tab flush with the gusset top long edge. D-rings point inward at this stage; they will be caught in the zipper seam.',
      });
    }

    // 7. Interior pocket
    if (opts.interiorPocket === 'slip') {
      steps.push({
        step: n++, title: 'Attach interior slip pocket to lining',
        detail: 'Fold the pocket top edge under ½″ twice. {press} and {topstitch}. Press the remaining three edges under ½″. Center the pocket on the right side of one lining body panel, 1½″ below the top raw edge. {topstitch} the sides and bottom close to the folded edge. Bar tack the top two corners.',
      });
    } else if (opts.interiorPocket === 'zip') {
      steps.push({
        step: n++, title: 'Make and attach interior zippered pocket',
        detail: 'Layer one pocket panel face up, the zipper face down along its top edge, then the second panel face down — a three-layer sandwich. Sew across the top. {press} panels away from zipper. {topstitch} close to teeth on both sides. Open zipper halfway. Fold pocket {RST} and sew the bottom and both side edges. Clip corners. Turn right side out. {press}. Stitch pocket outer edges to one lining body panel, centered, 1½″ below top edge.',
      });
    }

    // 8. Zipper end tabs
    steps.push({
      step: n++, title: 'Prepare zipper end tabs',
      detail: 'Fold each zipper end tab in half lengthwise, wrong sides together. Slip one folded tab over each end of the main zipper tape, covering the raw metal stop. Baste across the end. Fabric tabs create a clean corner when the zipper is sewn in and prevent the teeth from abrading adjacent canvas.',
    });

    // 9. Sew outer gusset to body panels
    steps.push({
      step: n++, title: 'Sew outer gusset to both outer body panels',
      detail: `Place the outer gusset and one outer body panel {RST}. Start pinning at the top-right corner of the body panel and work counter-clockwise — down the right side, across the bottom (align the gusset center notch to the body panel bottom center), up the left side. In each corner ease zone, clip the gusset SA every ½″ so the strip bends around the rounded corner; do not clip the body panel. Sew with the body panel face up so you can steer the curve. Use a ${fmtInches(parseFloat(opts.sa))} seam. Backstitch at both top ends. Repeat to sew the second body panel to the opposite long edge of the gusset. You now have a U-shaped outer shell open at the top. Grade seam allowances at the curves to reduce bulk.`,
    });

    // 10. Install zipper
    steps.push({
      step: n++, title: 'Install main zipper on outer shell',
      detail: `Open the zipper fully. With the outer shell right side out, lay the zipper face down along the top raw edge of the front body panel, tape edge aligned with the fabric raw edge. Using a zipper foot, sew the zipper tape down with a ${fmtInches(parseFloat(opts.sa))} seam. {press} the panel away from the zipper. {topstitch} ¼″ from the zipper teeth. Close the zipper. Align the back body panel to the opposite zipper tape side, pin, and sew the same way. {press} and {topstitch}. Tack the zipper tape ends to the gusset top edge at each short end.`,
    });

    // 11. Assemble lining
    steps.push({
      step: n++, title: 'Assemble lining',
      detail: 'Sew the lining gusset to both lining body panels exactly as the outer bag. Leave a 6–7″ turning gap open in the center of the lining gusset bottom seam (not in a corner zone). No zipper in the lining.',
    });

    // 12. Insert lining + slip-stitch to zipper tape
    steps.push({
      step: n++, title: 'Insert lining and slip-stitch to zipper tape',
      detail: 'Turn the lining right side out. With the outer bag also right side out, nest the lining inside, wrong sides together. Align the top raw edges of the lining with the zipper tape on both sides. Fold the lining raw edges under ½″ and pin the folded edge to the zipper tape, covering the seam stitching. Slip-stitch by hand or machine-edgestitch the folded lining edge to the zipper tape on all four lengths (front and back, each side of the tape). The lining should sit smooth with no gapping.',
    });

    // 13. Close turning gap
    steps.push({
      step: n++, title: 'Close the lining turning gap',
      detail: 'Reach through the zipper opening to the gap in the lining gusset bottom. Fold raw edges in ½″ and slip-stitch or edgestitch the gap closed. Push the lining into all four bottom corners of the bag.',
    });

    // 14. Topstitch outer seams (optional)
    steps.push({
      step: n++, title: 'Topstitch main seams (optional)',
      detail: 'For a refined finish and added seam strength, {topstitch} along the outside of the bag where body panels meet the gusset, stitching close to the seamline with a 3.5–4 mm stitch length. This step is optional but typical of professional bag construction.',
    });

    // 15. Shoulder strap (optional)
    if (hasStrap) {
      steps.push({
        step: n++, title: 'Finish and attach shoulder strap',
        detail: 'Fold the strap strip in half lengthwise {RST}, sew the long edge, turn right side out, {press}, {topstitch} both long edges. Thread one end through the tri-glide, fold back 1½″, sew a box stitch. Clip a swivel snap to the strap loop at the tri-glide end and to the other strap end. Clip both snaps to the bag D-rings. Adjust length with the tri-glide.',
      });
    }

    // 16. Final
    steps.push({
      step: n++, title: 'Final press and inspection',
      detail: '{press} the entire bag with a heavy press cloth. Push out the gusset corners. Tug each handle firmly to confirm the X-box stitching holds. Open and close the zipper several times; rub teeth with beeswax if stiff. The bag is complete.',
    });

    return steps;
  },

  variants: [
    {
      id: 'keepall-35-canvas',
      name: 'Keepall 35 Canvas',
      defaults: { preset: 'keepall-35', shoulderStrap: 'none', interiorPocket: 'slip', handleStyle: 'fabric' },
    },
    {
      id: 'keepall-50-canvas',
      name: 'Keepall 50 Weekender',
      defaults: { preset: 'keepall-50', shoulderStrap: 'yes', interiorPocket: 'zip', handleStyle: 'fabric' },
    },
  ],
};
