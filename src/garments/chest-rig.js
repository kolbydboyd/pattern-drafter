// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * MYOG Chest Rig / Plate Carrier — advanced gear project.
 * Parametric pattern for AR-15 magazine pouches, SAPI plate pockets,
 * padded shoulder straps, and MOLLE/PALS webbing panel.
 * All measurements in inches. Seam allowance computed by the engine.
 */

import { fmtInches } from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

// ── Physical constants ────────────────────────────────────────────────────────
const MAG = { w: 2.4, h: 7.4, d: 0.8 };   // AR-15 STANAG 30-round
const MOLLE_GRID = { h: 1, vSpacing: 2, hSpacing: 1.5 };
const SA = 0.5;
const PLATE_CLEARANCE = 0.375;  // each side of plate
const PLATE_GUSSET_D  = 1.25;   // pocket depth — fits hard armor up to ~1.1" thick
const PAD_W   = 2.5;            // finished shoulder pad width
const PAD_LEN = 9.5;            // padded section length (shoulder contact zone)

const PLATE_SIZES = {
  small:  { w: 7.25, h:  9.5  },
  medium: { w: 8.75, h: 11.25 },
  large:  { w: 9.5,  h: 12.25 },
  xl:     { w: 10.5, h: 13.25 },
};

// ── Shared geometry calculation ───────────────────────────────────────────────
function _calc(m, opts) {
  const magCount     = parseInt(opts.magCapacity);
  const magsPerPouch = magCount <= 3 ? 1 : 2;
  const pouchCount   = Math.ceil(magCount / magsPerPouch);

  const rawPouchW    = magsPerPouch * MAG.w + 0.25 * 2;
  const molleColumns = Math.ceil(rawPouchW / MOLLE_GRID.hSpacing);
  const pouchW       = molleColumns * MOLLE_GRID.hSpacing;  // snapped to MOLLE grid
  const pouchFrontH  = 5.75;
  const pouchBackH   = opts.pouchStyle === 'taco' ? 4.25 : 5.75;
  const pouchGussetD = magsPerPouch * MAG.d + 0.25;
  const pouchGussetL = 2 * Math.max(pouchFrontH, pouchBackH) + pouchW;
  const magBankW     = pouchCount * pouchW + 1.5;  // 0.75" margin each side

  const plate         = PLATE_SIZES[opts.plateSize];
  const platePocketW  = plate.w + PLATE_CLEARANCE * 2;
  const platePocketH  = plate.h + PLATE_CLEARANCE + 0.5;   // +0.5" at top for insertion
  const platePocketGL = 2 * platePocketH + platePocketW;    // 3-sided gusset perimeter

  const molleRowCount = opts.molle === 'none' ? 0 : parseInt(opts.molle);

  let panelW, panelH;
  if (opts.platePockets !== 'none') {
    panelW = Math.max(magBankW, platePocketW + 1.5);
    panelH = plate.h + 2 * PLATE_CLEARANCE + 2.0;   // 1" top + 1" bottom margin
  } else {
    panelW = magBankW;
    panelH = pouchFrontH + 2.0 + molleRowCount * MOLLE_GRID.vSpacing;
  }
  // Snap panel width to MOLLE grid
  panelW = Math.ceil(panelW / MOLLE_GRID.hSpacing) * MOLLE_GRID.hSpacing;

  const backPanelW = platePocketW + 1.5;
  const backPanelH = plate.h + 2 * PLATE_CLEARANCE + 2.0;

  // Half-chest + 12" adjustment range, rounded to nearest 0.5"
  const strapCutLength = Math.round((m.chest / 2 + 12) * 2) / 2;

  return {
    magCount, magsPerPouch, pouchCount,
    pouchW, pouchFrontH, pouchBackH, pouchGussetD, pouchGussetL, magBankW,
    plate, platePocketW, platePocketH, platePocketGL,
    molleRowCount,
    panelW, panelH,
    backPanelW, backPanelH,
    strapCutLength,
  };
}

export default {
  id: 'chest-rig',
  name: 'MYOG Chest Rig',
  category: 'accessory',
  difficulty: 'advanced',
  priceTier: 'standard',
  measurements: ['chest'],
  measurementDefaults: { chest: 40 },

  options: {
    magCapacity: {
      type: 'select', label: 'Magazine capacity',
      values: [
        { value: '3', label: '3 magazines', reference: 'compact patrol setup' },
        { value: '4', label: '4 magazines', reference: 'balanced load' },
        { value: '6', label: '6 magazines', reference: 'full combat load' },
      ],
      default: '6',
    },
    pouchStyle: {
      type: 'select', label: 'Mag pouch style',
      values: [
        { value: 'taco', label: 'Taco — open top, bungee retention', reference: 'faster access, most popular' },
        { value: 'flap', label: 'Flap — covered, snap closure', reference: 'more secure retention' },
      ],
      default: 'taco',
    },
    platePockets: {
      type: 'select', label: 'Plate pockets',
      values: [
        { value: 'none',  label: 'None (chest rig only)' },
        { value: 'front', label: 'Front plate only' },
        { value: 'both',  label: 'Front + back plates', reference: 'full plate carrier' },
      ],
      default: 'both',
    },
    plateSize: {
      type: 'select', label: 'Plate size (SAPI / ESAPI)',
      values: [
        { value: 'small',  label: 'Small — 7¼ × 9½″' },
        { value: 'medium', label: 'Medium — 8¾ × 11¼″', reference: 'most common size' },
        { value: 'large',  label: 'Large — 9½ × 12¼″' },
        { value: 'xl',     label: 'XL — 10½ × 13¼″' },
      ],
      default: 'medium',
    },
    molle: {
      type: 'select', label: 'MOLLE webbing rows',
      values: [
        { value: 'none', label: 'None' },
        { value: '2',    label: '2 rows', reference: 'pistol mag, tourniquet, etc.' },
        { value: '4',    label: '4 rows', reference: 'full panel MOLLE coverage' },
      ],
      default: '2',
    },
    adminPocket: {
      type: 'select', label: 'Admin / map pocket',
      values: [
        { value: 'none', label: 'None' },
        { value: 'flat', label: 'Flat slip pocket', reference: 'notes, cards, small items' },
        { value: 'zip',  label: 'Zippered pocket', reference: 'secure small items' },
      ],
      default: 'none',
    },
    harnessStyle: {
      type: 'select', label: 'Harness style',
      values: [
        { value: 'h-harness', label: 'H-harness (4-point)', reference: 'most stable, weight distributed' },
        { value: 'loops',     label: 'Simple shoulder loops', reference: 'minimal, lightweight' },
      ],
      default: 'h-harness',
    },
    material: {
      type: 'select', label: 'Shell material',
      values: [
        { value: '500d',  label: '500D Cordura', reference: 'lighter, flexible, modern builds' },
        { value: '1000d', label: '1000D Cordura', reference: 'maximum durability, heavier' },
      ],
      default: '500d',
    },
  },

  pieces(m, opts) {
    const g = _calc(m, opts);
    const pieces = [];

    // ── Front Panel ──────────────────────────────────────────────────────────
    let panelNote = '';
    if (g.molleRowCount > 0) {
      panelNote = ` Mark MOLLE webbing rows on the face: first row 1″ from top edge, then every 2″ (1″ webbing + 1″ gap). Bartack each row at 1½″ intervals across the full width.`;
    }
    pieces.push({
      id: 'front-panel',
      name: 'Front Panel',
      instruction: `Cut 1 on grain. ${fmtInches(g.panelW)} wide × ${fmtInches(g.panelH)} tall.${panelNote}`,
      type: 'rectangle',
      dimensions: { width: g.panelW, length: g.panelH },
      sa: SA,
    });

    // ── Front Plate Pocket ───────────────────────────────────────────────────
    if (opts.platePockets !== 'none') {
      const sizeLabel = `SAPI ${opts.plateSize} plate (${fmtInches(g.plate.w)} × ${fmtInches(g.plate.h)})`;
      pieces.push({
        id: 'plate-pocket-front',
        name: 'Front Plate Pocket — Face Panel',
        instruction: `Cut 1. ${fmtInches(g.platePocketW)} wide × ${fmtInches(g.platePocketH)} tall. Fits ${sizeLabel}. Sewn to wrong side of front panel.`,
        type: 'rectangle',
        dimensions: { width: g.platePocketW, length: g.platePocketH },
        sa: SA,
      });
      pieces.push({
        id: 'plate-pocket-back',
        name: 'Front Plate Pocket — Back Panel',
        instruction: `Cut 1. Same dimensions as face panel (${fmtInches(g.platePocketW)} × ${fmtInches(g.platePocketH)}).`,
        type: 'rectangle',
        dimensions: { width: g.platePocketW, length: g.platePocketH },
        sa: SA,
      });
      pieces.push({
        id: 'plate-pocket-gusset',
        name: 'Front Plate Pocket — Gusset',
        instruction: `Cut 1. ${fmtInches(g.platePocketGL)} long × ${fmtInches(PLATE_GUSSET_D)} wide. Wraps around three sides (bottom + both sides) of the plate pocket.`,
        type: 'rectangle',
        dimensions: { width: g.platePocketGL, length: PLATE_GUSSET_D },
        sa: SA,
      });
    }

    // ── Mag Pouches ──────────────────────────────────────────────────────────
    const magsLabel = g.magsPerPouch === 1 ? '1 magazine' : '2 magazines side by side';
    pieces.push({
      id: 'mag-pouch-front',
      name: `Mag Pouch — Front Panel (cut ${g.pouchCount})`,
      instruction: `Cut ${g.pouchCount}. ${fmtInches(g.pouchW)} wide × ${fmtInches(g.pouchFrontH)} tall. All pouches identical. Each holds ${magsLabel}.`,
      type: 'rectangle',
      dimensions: { width: g.pouchW, length: g.pouchFrontH },
      sa: SA,
    });
    pieces.push({
      id: 'mag-pouch-back',
      name: `Mag Pouch — Back Panel (cut ${g.pouchCount})`,
      instruction: `Cut ${g.pouchCount}. ${fmtInches(g.pouchW)} wide × ${fmtInches(g.pouchBackH)} tall.${opts.pouchStyle === 'taco' ? ' Shorter than front to allow open-top access.' : ''}`,
      type: 'rectangle',
      dimensions: { width: g.pouchW, length: g.pouchBackH },
      sa: SA,
    });
    pieces.push({
      id: 'mag-pouch-gusset',
      name: `Mag Pouch — Gusset (cut ${g.pouchCount})`,
      instruction: `Cut ${g.pouchCount}. ${fmtInches(g.pouchGussetL)} long × ${fmtInches(g.pouchGussetD)} wide. Wraps three sides of the pouch. Depth sized for ${magsLabel}.`,
      type: 'rectangle',
      dimensions: { width: g.pouchGussetL, length: g.pouchGussetD },
      sa: SA,
    });

    // ── Mag Pouch Flap ───────────────────────────────────────────────────────
    if (opts.pouchStyle === 'flap') {
      pieces.push({
        id: 'mag-pouch-flap',
        name: `Mag Pouch — Flap (cut ${g.pouchCount * 2})`,
        instruction: `Cut ${g.pouchCount * 2} (${g.pouchCount} outer + ${g.pouchCount} lining). ${fmtInches(g.pouchW)} wide × 4½″ tall. Sew RST on three sides, turn, edgestitch.`,
        type: 'rectangle',
        dimensions: { width: g.pouchW, length: 4.5 },
        sa: SA,
      });
    }

    // ── MOLLE Webbing Strips ─────────────────────────────────────────────────
    if (g.molleRowCount > 0) {
      const webLength = g.panelW + 2;
      pieces.push({
        id: 'molle-webbing-strip',
        name: `MOLLE Webbing Strip (cut ${g.molleRowCount})`,
        instruction: `Cut ${g.molleRowCount} lengths of 1″ nylon webbing at ${fmtInches(webLength)} each. Edge-stitch both long edges; bartack box-X pattern at every 1½″ across width.`,
        type: 'rectangle',
        dimensions: { width: webLength, length: 1 },
        sa: 0,
      });
    }

    // ── Admin Pocket ─────────────────────────────────────────────────────────
    if (opts.adminPocket !== 'none') {
      const adminW = g.panelW - 2;
      pieces.push({
        id: 'admin-pocket-front',
        name: 'Admin Pocket — Front Panel',
        instruction: `Cut 1. ${fmtInches(adminW)} wide × 4″ tall. Positioned above mag pouches on panel face.`,
        type: 'rectangle',
        dimensions: { width: adminW, length: 4 },
        sa: SA,
      });
      pieces.push({
        id: 'admin-pocket-back',
        name: 'Admin Pocket — Back Panel',
        instruction: `Cut 1. Same dimensions as admin pocket front (${fmtInches(adminW)} × 4″).`,
        type: 'rectangle',
        dimensions: { width: adminW, length: 4 },
        sa: SA,
      });
      if (opts.adminPocket === 'zip') {
        pieces.push({
          id: 'admin-zipper-tab',
          name: 'Admin Pocket Zipper Tab (cut 2)',
          instruction: `Cut 2. 1½″ long × 1″ wide. Fold over each end of the zipper tape to finish.`,
          type: 'rectangle',
          dimensions: { width: 1.5, length: 1 },
          sa: 0,
        });
      }
    }

    // ── Back Panel + Back Plate Pocket ───────────────────────────────────────
    if (opts.platePockets === 'both') {
      pieces.push({
        id: 'back-panel',
        name: 'Back Panel',
        instruction: `Cut 1 on grain. ${fmtInches(g.backPanelW)} wide × ${fmtInches(g.backPanelH)} tall. Back plate pocket attaches to wrong side.`,
        type: 'rectangle',
        dimensions: { width: g.backPanelW, length: g.backPanelH },
        sa: SA,
      });
      pieces.push({
        id: 'back-plate-pocket-front',
        name: 'Back Plate Pocket — Face Panel',
        instruction: `Cut 1. Same dimensions as front plate pocket face panel (${fmtInches(g.platePocketW)} × ${fmtInches(g.platePocketH)}).`,
        type: 'rectangle',
        dimensions: { width: g.platePocketW, length: g.platePocketH },
        sa: SA,
      });
      pieces.push({
        id: 'back-plate-pocket-back',
        name: 'Back Plate Pocket — Back Panel',
        instruction: `Cut 1. Same dimensions as back plate pocket face panel.`,
        type: 'rectangle',
        dimensions: { width: g.platePocketW, length: g.platePocketH },
        sa: SA,
      });
      pieces.push({
        id: 'back-plate-pocket-gusset',
        name: 'Back Plate Pocket — Gusset',
        instruction: `Cut 1. Same as front plate pocket gusset (${fmtInches(g.platePocketGL)} × ${fmtInches(PLATE_GUSSET_D)}).`,
        type: 'rectangle',
        dimensions: { width: g.platePocketGL, length: PLATE_GUSSET_D },
        sa: SA,
      });
    }

    // ── Shoulder Pads ────────────────────────────────────────────────────────
    const padShellW = PAD_W + 0.5;   // 0.25" extra each side
    const padShellL = PAD_LEN + 0.5;
    pieces.push({
      id: 'shoulder-pad-outer',
      name: 'Shoulder Pad — Outer Shell (cut 2)',
      instruction: `Cut 2 from main fabric. ${fmtInches(padShellW)} wide × ${fmtInches(padShellL)} long. Sewn RST with lining, turned, foam inserted, quilted every 2½″.`,
      type: 'rectangle',
      dimensions: { width: padShellW, length: padShellL },
      sa: 0.25,
    });
    pieces.push({
      id: 'shoulder-pad-lining',
      name: 'Shoulder Pad — Lining (cut 2)',
      instruction: `Cut 2 from ripstop or lighter fabric. ${fmtInches(padShellW)} wide × ${fmtInches(padShellL)} long — same as outer shell.`,
      type: 'rectangle',
      dimensions: { width: padShellW, length: padShellL },
      sa: 0.25,
    });

    // ── H-Harness Back Connector ─────────────────────────────────────────────
    if (opts.harnessStyle === 'h-harness') {
      pieces.push({
        id: 'back-strap-connector',
        name: 'H-Harness Back Connector',
        instruction: `Cut 1. 3″ wide × 5″ long. Folded and topstitched into a stiff loop anchoring shoulder straps at center-back.`,
        type: 'rectangle',
        dimensions: { width: 3, length: 5 },
        sa: SA,
      });
    }

    return pieces;
  },

  materials(m, opts) {
    const g = _calc(m, opts);
    const isHarness  = opts.harnessStyle === 'h-harness';
    const hasFront   = opts.platePockets !== 'none';
    const hasBack    = opts.platePockets === 'both';
    const webLength  = g.panelW + 2;
    const adminW     = g.panelW - 2;
    const padShellW  = PAD_W + 0.5;
    const padShellL  = PAD_LEN + 0.5;

    // ── Fabric yardage (60" wide Cordura) ────────────────────────────────────
    let totalArea = g.panelW * g.panelH;
    if (hasFront) {
      totalArea += g.platePocketW * g.platePocketH * 2 + g.platePocketGL * PLATE_GUSSET_D;
    }
    if (hasBack) {
      totalArea += g.backPanelW * g.backPanelH;
      totalArea += g.platePocketW * g.platePocketH * 2 + g.platePocketGL * PLATE_GUSSET_D;
    }
    totalArea += (g.pouchW * g.pouchFrontH + g.pouchW * g.pouchBackH + g.pouchGussetL * g.pouchGussetD) * g.pouchCount;
    if (opts.pouchStyle === 'flap')    totalArea += g.pouchW * 4.5 * g.pouchCount * 2;
    if (opts.adminPocket !== 'none')  totalArea += adminW * 4 * 2;
    totalArea += padShellW * padShellL * 2;
    if (isHarness) totalArea += 3 * 5;

    const mainYards = Math.ceil(((totalArea * 1.15) / (60 * 36)) * 4) / 4;

    // ── 1" webbing total ─────────────────────────────────────────────────────
    const molleWebbing = g.molleRowCount * webLength;
    const strapWebbing = 2 * g.strapCutLength;
    const padWebbing   = 2 * (PAD_LEN + 8);
    const cummWebbing  = isHarness ? 2 * 22 : 0;
    const webbingYards = Math.ceil(((molleWebbing + strapWebbing + padWebbing + cummWebbing) / 36) * 4) / 4;

    const fabricName = opts.material === '500d' ? '500D Cordura nylon' : '1000D Cordura nylon';

    const notions = [
      { name: '1″ MIL-W-17337 nylon webbing',
        quantity: `${webbingYards} yard(s) — MOLLE rows, shoulder straps, cummerbund, and pad webbing` },
      { name: '3/8″ closed-cell EVA foam',
        quantity: `2 pieces, each ${fmtInches(PAD_W)} × ${fmtInches(PAD_LEN)} — shoulder pad cores` },
      { name: '1″ ITW Nexus QASM side-release buckles',
        quantity: isHarness ? '4 (2 shoulder, 2 cummerbund)' : '2 (shoulder only)' },
      { name: '1″ Delrin D-rings',
        quantity: hasBack ? '4 (2 front panel, 2 back panel)' : '2 (front panel top corners)' },
    ];

    if (opts.pouchStyle === 'taco') {
      notions.push({ name: '3/8″ bungee cord (elastic shock cord)',
        quantity: `${g.pouchCount} × 14″ lengths — magazine retention` });
      notions.push({ name: 'Barrel cord lock (toggle)', quantity: `${g.pouchCount}` });
    }
    if (opts.pouchStyle === 'flap') {
      notions.push({ name: '1″ hook & loop tape (Velcro, sew-on)',
        quantity: `${g.pouchCount} × 2″ — flap closures` });
    }
    if (opts.adminPocket === 'zip') {
      notions.push({ name: '#5 nylon zipper',
        quantity: `1 at ${fmtInches(adminW)} minimum length — admin pocket` });
    }

    const notes = [
      `Main fabric: ${fabricName}, approximately ${mainYards} yard(s) at 60″ wide.`,
      `Shoulder pad lining: ¼ yard of ripstop nylon or lightweight Cordura.`,
      `Use a walking foot throughout — Cordura is slippery and multi-layer sections are thick.`,
      `All load-bearing joints (D-ring tabs, pouch corners, strap anchors) require box-X bartacks with TEX 70 or heavier bonded nylon thread.`,
      `Sew MOLLE webbing rows onto the panel before attaching pouches — much easier to bartack on a flat panel.`,
    ];

    return buildMaterialsSpec({
      fabrics: [
        { name: fabricName,
          weight: opts.material === '500d' ? '8–10 oz/yd²' : '14–18 oz/yd²',
          stretch: false,
          category: 'woven',
          notes: opts.material === '500d'
            ? 'High-tenacity nylon with PU coating. Use Teflon or walking foot. Denim needle 100/16.'
            : 'Maximum durability; heavy — walking foot and denim 110/18 needle required.',
        },
      ],
      notions,
      thread: 'poly-heavy',
      needle: 'denim-100',
      stitches: ['straight-3', 'topstitch', 'bartack'],
      notes,
    });
  },

  instructions(m, opts) {
    const g = _calc(m, opts);
    const steps = [];
    let n = 1;
    const hasFront  = opts.platePockets !== 'none';
    const hasBack   = opts.platePockets === 'both';
    const isTaco    = opts.pouchStyle === 'taco';
    const isFlap    = opts.pouchStyle === 'flap';
    const isHarness = opts.harnessStyle === 'h-harness';

    steps.push({
      step: n++, title: 'Cut and mark all pieces',
      detail: `Cut all fabric pieces on grain. Mark MOLLE bartack positions on the front panel face with chalk or a water-soluble marker: first row 1″ from the top edge, then every 2″. Mark vertical bartack lines every 1½″ across the full width.`,
    });

    if (g.molleRowCount > 0) {
      steps.push({
        step: n++, title: 'Sew MOLLE webbing rows',
        detail: `Pin each 1″ webbing strip across the front panel at the marked row positions, wrapping the ends around the panel edge. Edge-stitch both long edges of each strip with a 3mm straight stitch. Then bartack at every 1½″ interval using a box-X pattern: stitch a ¼″ × ½″ rectangle with an X through the center. Use TEX 70 or heavier bonded nylon thread for all bartacks.`,
      });
    }

    if (hasFront) {
      steps.push({
        step: n++, title: 'Build front plate pocket',
        detail: `With RST (right sides together), sew the gusset around three sides of the face panel — both sides and the bottom. Then sew the back panel to the remaining gusset edge on the same three sides. Clip corners. Serge or bind all interior raw edges. Leave the top edge open for plate insertion. Topstitch around the perimeter at 3/8″.`,
      });
      steps.push({
        step: n++, title: 'Attach front plate pocket to panel',
        detail: `Center the assembled plate pocket on the wrong side of the front panel, 1″ from the bottom edge. Topstitch the bottom and both sides of the pocket to the panel. The pocket will sit between your body and the panel when the rig is worn.`,
      });
    }

    steps.push({
      step: n++, title: 'Assemble mag pouches',
      detail: `For each of the ${g.pouchCount} pouches: sew the front panel to the gusset RST on three sides (bottom and both sides). Sew the back panel to the other gusset edge on the same three sides. Clip all corners. Turn right side out through the open top. Edgestitch the opening at 1/8″ for a crisp finish.`,
    });

    if (isTaco) {
      steps.push({
        step: n++, title: 'Install bungee retention',
        detail: `Fold the top edge of each pouch front panel over 1″ and topstitch, leaving 3/8″ openings at each side seam to create a bungee channel. Thread 3/8″ bungee cord through the channel. Install a barrel cord lock; tie a stop knot to prevent pull-out. Tension the bungee so it firmly holds a loaded magazine but releases with a firm outward pull.`,
      });
    }

    if (isFlap) {
      steps.push({
        step: n++, title: 'Make and attach flap closures',
        detail: `For each flap: sew outer and lining panels RST on three sides; turn right side out through the open end; edgestitch all four edges. Sew the loop side of hook & loop tape to the inside face of the flap. Sew the hook side to the front face of the pouch, 1/2″ below the opening. Attach the flap to the top of the pouch back panel by topstitching.`,
      });
    }

    steps.push({
      step: n++, title: 'Attach mag pouches to front panel',
      detail: `Space the ${g.pouchCount} pouch${g.pouchCount === 1 ? '' : 'es'} evenly across the bottom of the front panel, 1″ from the bottom edge. Edgestitch the bottom and both side edges of each pouch to the panel. Bartack all four corners with a box-X pattern — these are the highest-stress joints on the rig.`,
    });

    if (opts.adminPocket !== 'none') {
      if (opts.adminPocket === 'flat') {
        steps.push({
          step: n++, title: 'Make and attach admin pocket',
          detail: `Press the top edge of the admin pocket front panel under ½″ twice and topstitch. Place the pocket on the front panel face above the pouches. Edgestitch bottom and both sides to the panel. Bartack the top corners.`,
        });
      } else {
        steps.push({
          step: n++, title: 'Make and attach zippered admin pocket',
          detail: `Install the zipper using the sandwich method: lay the front pocket panel face up, place the zipper face down along its top edge, then place the back pocket panel face down on top. Sew through all layers. Press both panels away from the zipper; topstitch close to the zipper on both sides. Sew the remaining three sides of the pocket together. Attach the completed pocket to the front panel by topstitching around the back panel perimeter.`,
        });
      }
    }

    if (hasBack) {
      steps.push({
        step: n++, title: 'Build and attach back plate pocket',
        detail: `Assemble the back plate pocket identically to the front: sew gusset to face panel RST on three sides, sew back panel to remaining gusset edge, clip corners, serge edges, leave top open. Topstitch perimeter. Center the pocket on the wrong side of the back panel, 1″ from bottom, and topstitch to secure.`,
      });
    }

    steps.push({
      step: n++, title: 'Sew shoulder pad shells',
      detail: `For each of the 2 pads: place outer shell and lining RST. Sew both long edges and one short end; leave the other short end open. Turn right side out through the open end and press flat. Dampen the EVA foam pad to compress it slightly, then slide it into the shell. Topstitch the open end closed. Quilt through all layers every 2½″ along the length to lock the foam in place.`,
    });

    steps.push({
      step: n++, title: 'Integrate strap webbing through shoulder pads',
      detail: `Thread a length of 1″ webbing alongside the foam in each pad, with 18–20″ extending from each end for buckle routing. At each end of the pad, fold the webbing back 2″ and secure with a box-X bartack directly through pad and webbing — use at least 4 passes. These joints carry the full loaded weight of the rig.`,
    });

    steps.push({
      step: n++, title: 'Attach D-ring tabs at panel top corners',
      detail: `Cut ${hasBack ? 'four' : 'two'} 3″ lengths of 1″ webbing. Fold each in half around a D-ring. Bartack the folded loop to the top corners of the front panel${hasBack ? ' and back panel' : ''} on the wrong side, with the D-ring protruding from the face side. Use box-X bartacks — these carry the full plate + magazine load.`,
    });

    if (isHarness) {
      steps.push({
        step: n++, title: 'Make H-harness back connector',
        detail: `Fold the back connector piece into thirds lengthwise and topstitch through all layers to create a stiff band. Fold into a flat loop. Sew to the center-back area where the shoulder straps cross. This forms the horizontal bar of the H, keeping straps from sliding off the shoulders under load.`,
      });
      steps.push({
        step: n++, title: 'Thread shoulder straps and install buckles',
        detail: `Thread each shoulder strap through its front D-ring, up and over the shoulder, through the back connector, ${hasBack ? 'through the back panel D-ring,' : ''} and back to the front. Install a female QASM buckle at chest level on the free end. Adjust total strap length so the front panel rests at sternum/xiphoid level. Fold the webbing tail back 2″ and bartack.`,
      });
      steps.push({
        step: n++, title: 'Install cummerbund side straps',
        detail: `Bartack a looped tab of 1″ webbing to each side edge of the front panel. Install a female QASM buckle at the panel end. Route each strap around the torso${hasBack ? ' to the back panel side edge and loop-attach there.' : ' and fasten the male buckle behind the back.'} Adjust so the rig wraps snugly without restricting a full breath.`,
      });
    } else {
      steps.push({
        step: n++, title: 'Thread shoulder straps and install buckles',
        detail: `Thread each shoulder strap through the front D-ring. Fold back 2″ and bartack to create a fixed loop at the panel. Feed the free end over the shoulder and route back to a QASM buckle at chest level. Adjust for a secure, non-restrictive fit.`,
      });
    }

    steps.push({
      step: n++, title: 'Final edgestitching and inspection',
      detail: `Topstitch around the full perimeter of the front panel at ¼″ and 3/8″ for a double-stitched reinforced border. Inspect every bartack — no raw edges should be visible and all stress points should show box-X patterns. Tug each pouch and strap junction firmly to verify hold before loading.`,
    });

    steps.push({
      step: n++, title: 'Fit and load test',
      detail: `${hasFront ? 'Insert plates. ' : ''}Load magazines into pouches. Put on the rig and adjust all straps: shoulder pads should sit centered on the deltoid, not on the neck or trapezius. Front panel rests at sternum level. Cummerbund is snug but permits a full breath. Wear for 10 minutes with full load and note any pressure points.`,
    });

    return steps;
  },
};
