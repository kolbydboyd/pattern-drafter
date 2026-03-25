/**
 * Crop Jacket (Chore Coat style) — woven outerwear, extra ease for layering.
 * Front panels split at CF for button/snap placket.
 * Flat-felled seams on shoulders and side seams.
 * Stand collar (point or Mandarin/band). Large hip patch pockets.
 * Fabric: cotton canvas 10–12 oz, bull denim, waxed cotton.
 */

import {
  shoulderSlope, necklineCurve, armholeCurve,
  armholeDepthFromChest, chestEaseDistribution, neckWidthFromCircumference, UPPER_EASE,
} from '../engine/upper-body.js';
import { sampleBezier, fmtInches } from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

const PLACKET_W   = 1.5;  // button placket extension each front panel
const FACING_W    = 3.0;  // front facing width (interfaced)

export default {
  id: 'crop-jacket',
  name: 'Crop Jacket',
  category: 'upper',
  measurements: ['chest', 'shoulder', 'neck', 'sleeveLength', 'bicep', 'wrist', 'torsoLength'],
  measurementDefaults: { sleeveLength: 26 },

  options: {
    length: {
      type: 'select', label: 'Jacket length',
      values: [
        { value: 'crop', label: 'Crop — at waist (torso length)' },
        { value: 'hip',  label: 'Hip — +4″ below waist'          },
      ],
      default: 'crop',
    },
    collar: {
      type: 'select', label: 'Collar style',
      values: [
        { value: 'point',   label: 'Worker / point stand collar' },
        { value: 'mandarin', label: 'Mandarin / band collar'     },
      ],
      default: 'point',
    },
    closure: {
      type: 'select', label: 'Closure',
      values: [
        { value: 'button', label: 'Buttons (shank)'    },
        { value: 'snap',   label: 'Snap buttons'       },
      ],
      default: 'button',
    },
    chestPocket: {
      type: 'select', label: 'Chest pocket',
      values: [
        { value: 'none',  label: 'None'                   },
        { value: 'patch', label: 'Patch with pencil slot' },
      ],
      default: 'none',
    },
    sa: {
      type: 'select', label: 'Seam allowance',
      values: [
        { value: 0.625, label: '⅝″' },
        { value: 1,     label: '1″' },
      ],
      default: 0.625,
    },
    hem: {
      type: 'select', label: 'Hem allowance',
      values: [
        { value: 1,   label: '1″' },
        { value: 1.5, label: '1½″' },
      ],
      default: 1,
    },
  },

  pieces(m, opts) {
    const sa  = parseFloat(opts.sa);
    const hem = parseFloat(opts.hem);

    // Outerwear ease: 6″ over chest for layering
    const totalEase = 6;
    const { front: frontEase, back: backEase } = chestEaseDistribution(totalEase);
    // Both front and back half-panels are equal so side seams align when sewn
    const panelW = (m.chest + totalEase) / 4;
    const frontW = panelW;
    const backW  = panelW;

    const halfShoulder  = m.shoulder / 2;
    const neckW         = neckWidthFromCircumference(m.neck);
    const shoulderW     = halfShoulder - neckW;
    const slopeDrop     = 1.75;
    const shoulderPtX   = neckW + shoulderW;
    const armholeDepth  = armholeDepthFromChest(m.chest, 'oversized'); // extra depth for layers
    const chestDepth    = panelW - shoulderPtX;
    const torsoLen      = m.torsoLength + (opts.length === 'hip' ? 4 : 0);
    const slvLength     = m.sleeveLength ?? 26;
    const btnCount      = 5;

    function sampleCurve(cp, steps = 12) {
      return sampleBezier(cp.p0, cp.p1, cp.p2, cp.p3, steps);
    }
    function polyToPathStr(poly) {
      let d = `M ${poly[0].x.toFixed(2)} ${poly[0].y.toFixed(2)}`;
      for (let i = 1; i < poly.length; i++) d += ` L ${poly[i].x.toFixed(2)} ${poly[i].y.toFixed(2)}`;
      return d + ' Z';
    }
    function bbox(poly) {
      const xs = poly.map(p => p.x), ys = poly.map(p => p.y);
      return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) };
    }

    const shoulderPtY = slopeDrop;
    const NECK_DEPTH_FRONT = 3.0;
    const NECK_DEPTH_BACK  = 1.0;

    const frontNeckPts   = sampleCurve(necklineCurve(neckW, NECK_DEPTH_FRONT, 'crew'));
    const backNeckPts    = sampleCurve(necklineCurve(neckW, NECK_DEPTH_BACK, 'crew'));
    const shoulderPts    = sampleCurve(shoulderSlope(shoulderW, slopeDrop));
    const frontArmPts    = sampleCurve(armholeCurve(shoulderW, chestDepth, armholeDepth, false));
    const backChestDepth = chestDepth * 0.95;
    const backArmPts     = sampleCurve(armholeCurve(shoulderW, backChestDepth, armholeDepth, true));

    // ── FRONT PANEL (left — right is mirror) ─────────────────────────────────
    const frontPoly = [];
    const neckFrontRev = [...frontNeckPts].reverse();
    for (const p of neckFrontRev) frontPoly.push({ x: neckW - p.x, y: NECK_DEPTH_FRONT - p.y });
    for (let i = 1; i < shoulderPts.length; i++) {
      frontPoly.push({ x: neckW + shoulderPts[i].x, y: shoulderPts[i].y });
    }
    for (let i = 1; i < frontArmPts.length; i++) {
      frontPoly.push({ x: shoulderPtX + frontArmPts[i].x, y: shoulderPtY + frontArmPts[i].y });
    }
    const sideX = shoulderPtX + chestDepth;
    frontPoly.push({ x: sideX, y: torsoLen });
    frontPoly.push({ x: -PLACKET_W, y: torsoLen });
    frontPoly.push({ x: -PLACKET_W, y: NECK_DEPTH_FRONT });
    frontPoly.push({ x: 0, y: NECK_DEPTH_FRONT });

    // ── BACK PANEL ───────────────────────────────────────────────────────────
    const backPoly = [];
    const neckBackRev = [...backNeckPts].reverse();
    for (const p of neckBackRev) backPoly.push({ x: neckW - p.x, y: NECK_DEPTH_BACK - p.y });
    for (let i = 1; i < shoulderPts.length; i++) {
      backPoly.push({ x: neckW + shoulderPts[i].x, y: shoulderPts[i].y });
    }
    for (let i = 1; i < backArmPts.length; i++) {
      backPoly.push({ x: shoulderPtX + backArmPts[i].x, y: shoulderPtY + backArmPts[i].y });
    }
    backPoly.push({ x: shoulderPtX + backChestDepth, y: torsoLen });
    backPoly.push({ x: 0, y: torsoLen });
    backPoly.push({ x: 0, y: NECK_DEPTH_BACK });

    // ── SLEEVE (straight, long, no taper) ────────────────────────────────────
    const slvTopW  = m.bicep / 2 + totalEase * 0.2;
    const slvBotW  = (m.wrist || m.bicep * 0.8) / 2 + 0.5;
    const sleevePoly = [
      { x: 0,           y: 0         },
      { x: slvTopW * 2, y: 0         },
      { x: slvTopW * 2, y: slvLength },
      { x: 0,           y: slvLength },
    ];

    // ── COLLAR ───────────────────────────────────────────────────────────────
    // Stand collar: 3″ cut (1.5″ finished stand). Length = neckline circumference.
    const collarLen   = m.neck + 1; // ease for standing collar
    const collarH     = 3;          // 1.5″ finished stand

    // ── FRONT FACING ─────────────────────────────────────────────────────────
    const facingH = torsoLen - NECK_DEPTH_FRONT;

    const frontBB  = bbox(frontPoly);
    const backBB   = bbox(backPoly);
    const sleeveBB = bbox(sleevePoly);

    const pieces = [
      {
        id: 'bodice-front',
        name: 'Front Panel (Left)',
        instruction: `Cut 2 (L & R mirror) · ${fmtInches(PLACKET_W)} placket extension at CF · Flat-fell side seams · Bar tack all pocket corners`,
        type: 'bodice',
        polygon: frontPoly,
        path: polyToPathStr(frontPoly),
        width: frontBB.maxX - frontBB.minX,
        height: frontBB.maxY - frontBB.minY,
        isBack: false,
        sa, hem,
        dims: [
          { label: fmtInches(frontW) + ' panel', x1: 0, y1: -0.5, x2: frontW, y2: -0.5, type: 'h' },
          { label: fmtInches(torsoLen) + ' length', x: frontBB.maxX + 1, y1: 0, y2: torsoLen, type: 'v' },
        ],
      },
      {
        id: 'bodice-back',
        name: 'Back Panel',
        instruction: 'Cut 1 on fold (CB) · Flat-fell shoulder and side seams',
        type: 'bodice',
        polygon: backPoly,
        path: polyToPathStr(backPoly),
        width: backBB.maxX - backBB.minX,
        height: backBB.maxY - backBB.minY,
        isBack: true,
        sa, hem,
        dims: [
          { label: fmtInches(backW) + ' half width', x1: 0, y1: -0.5, x2: backW, y2: -0.5, type: 'h' },
          { label: fmtInches(torsoLen) + ' length', x: backBB.maxX + 1, y1: 0, y2: torsoLen, type: 'v' },
        ],
      },
      {
        id: 'sleeve',
        name: 'Sleeve',
        instruction: 'Cut 2 (mirror L & R) · Straight grain along length · No ease in cap — set flat',
        type: 'sleeve',
        polygon: sleevePoly,
        path: polyToPathStr(sleevePoly),
        width: sleeveBB.maxX - sleeveBB.minX,
        height: sleeveBB.maxY - sleeveBB.minY,
        capHeight: 0,
        sleeveLength: slvLength,
        sleeveWidth: slvTopW * 2,
        sa, hem,
        dims: [
          { label: fmtInches(slvTopW * 2) + ' width', x1: 0, y1: -0.4, x2: slvTopW * 2, y2: -0.4, type: 'h' },
          { label: fmtInches(slvLength) + ' length', x: slvTopW * 2 + 1, y1: 0, y2: slvLength, type: 'v' },
        ],
      },
      {
        id: 'collar',
        name: opts.collar === 'mandarin' ? 'Band Collar' : 'Stand Collar',
        instruction: `Cut 2 (outer + facing) · Interface outer · ${fmtInches(collarLen)} × ${fmtInches(collarH)} cut · ${opts.collar === 'point' ? 'Shape front corners to a point' : 'Round front corners slightly'}`,
        type: 'rectangle',
        dimensions: { length: collarLen, width: collarH },
        sa,
      },
      {
        id: 'front-facing',
        name: 'Front Facing',
        instruction: `Cut 2 (L & R) · Interface · ${fmtInches(FACING_W)} wide × ${fmtInches(facingH)} long`,
        type: 'pocket',
        dimensions: { width: FACING_W, height: facingH },
      },
      {
        id: 'hip-pocket',
        name: 'Hip Patch Pocket',
        instruction: `Cut 2 · Position at hip level ${fmtInches(opts.length === 'hip' ? 8 : 4)}″ from hem on front panels · Bar tack top corners`,
        type: 'pocket',
        dimensions: { width: 7, height: 7 },
      },
    ];

    if (opts.chestPocket === 'patch') {
      pieces.push({
        id: 'chest-pocket',
        name: 'Chest Patch Pocket with Pencil Slot',
        instruction: 'Cut 1 · Left chest, 2.5″ below neckline · Pencil slot: 1.5″ wide section at top, divided by topstitching',
        type: 'pocket',
        dimensions: { width: 5, height: 6 },
      });
    }

    return pieces;
  },

  materials(m, opts) {
    const btnCount = 5;
    const notions  = [
      { ref: 'interfacing-med', quantity: '0.75 yard (collar + front facings)' },
    ];

    if (opts.closure === 'button') {
      notions.push({ name: 'Heavy-duty shank buttons', quantity: `${btnCount + 1}`, notes: '⅞″ – 1″ diameter — +1 spare' });
    } else {
      notions.push({ name: 'Snap buttons', quantity: `${btnCount}`, notes: 'Heavy-duty snaps — size 24 or 20' });
    }

    return buildMaterialsSpec({
      fabrics: ['cotton-canvas', 'bull-denim', 'waxed-cotton'],
      notions,
      thread: 'poly-heavy',
      needle: 'denim-100',
      stitches: ['straight-3', 'straight-3.5', 'bartack'],
      notes: [
        'Topstitch all seams at 3.5mm — use contrasting or matching thread as desired',
        'Flat-fell seams on shoulder and side seams: sew, press to one side, trim lower SA to 3mm, fold upper SA over, topstitch',
        'Pre-wash canvas to preshrink — canvas can shrink 5–8% in first wash',
        'Interface collar with 2 layers of medium woven interfacing for structure',
        'Bar tack all four corners of each pocket — canvas is heavy and will stress pocket attachment',
        opts.closure === 'snap' ? 'Install snaps with a snap setter tool — do not sew snap buttons by hand on canvas' : '',
        'Waxed cotton: do not pre-wash — wipe clean only, re-wax annually',
      ].filter(Boolean),
    });
  },

  instructions(m, opts) {
    const steps = [];
    let n = 1;
    const btnCount = 5;

    if (opts.chestPocket === 'patch') {
      steps.push({
        step: n++, title: 'Prepare chest pocket',
        detail: 'Mark pencil slot division line 1.5″ from right edge. Fold top under 1″, topstitch twice. Press sides and bottom under ⅝″. Topstitch slot division line through pocket. Position on left front panel. Topstitch on 3 sides. Bar tack all four corners.',
      });
    }

    steps.push({
      step: n++, title: 'Prepare hip patch pockets',
      detail: 'Fold top edge under 1″ twice, topstitch. Press remaining three edges under ⅝″. Position on front panels at hip level. Topstitch on 3 sides at 3.5mm. Bar tack all four corners.',
    });

    steps.push({
      step: n++, title: 'Prepare collar',
      detail: `Interface outer collar with 2 layers. Sew outer to facing (RST) on three sides, leaving neck edge open. Trim seam to 3mm. Clip corners (point collar) or notch curves. Turn, press. For point collar: shape points precisely — use a point turner. Topstitch 3.5mm from edge if desired.`,
    });

    steps.push({
      step: n++, title: 'Prepare front facings and plackets',
      detail: `Interface facing strips. Press placket extension ${fmtInches(PLACKET_W)} to WS at CF fold line. Sew facing to placket edge (RST). Press, topstitch. Facing creates clean interior at front opening.`,
    });

    steps.push({
      step: n++, title: 'Sew shoulder seams (flat-fell)',
      detail: 'Sew front to back at shoulders (RST). Press both SAs toward back. Trim front SA to 3mm. Fold back SA over trimmed edge, press. Topstitch at 3.5mm close to fold. Result: two visible rows of topstitch on RS.',
    });

    steps.push({
      step: n++, title: 'Attach collar',
      detail: 'Pin outer collar to neckline (RST), matching CF marks. Sew. Clip curve. Fold facing SA under, pin to WS covering seam. Topstitch from RS through all layers.',
    });

    steps.push({
      step: n++, title: 'Set sleeves',
      detail: 'Sew sleeves into armhole (RST), starting at underarm notch. Ease fullness at cap evenly. Sew. Topstitch SA toward sleeve at 6mm from seam.',
    });

    steps.push({
      step: n++, title: 'Sew side seams (flat-fell)',
      detail: 'Sew front to back at side seams (RST), from hem through underarm continuously to sleeve hem. Apply flat-fell finish: press toward back, trim front SA to 3mm, fold back SA over, topstitch at 3.5mm.',
    });

    steps.push({
      step: n++, title: 'Hem sleeves and body',
      detail: `Fold sleeve hem up ${fmtInches(parseFloat(opts.hem))} twice, press. Topstitch at 3.5mm. Repeat for jacket body hem.`,
    });

    steps.push({
      step: n++, title: opts.closure === 'button' ? 'Buttonholes and buttons' : 'Install snaps',
      detail: opts.closure === 'button'
        ? `Mark ${btnCount} buttonholes on right placket (vertical buttonholes for jacket): first 1.5″ from neckline, last 2″ from hem, evenly spaced. Test on scrap canvas. Sew buttonholes. Cut open. Sew buttons to left placket.`
        : `Mark ${btnCount} snap positions. Install male halves on right placket, female halves on left placket. Use snap setter tool and backing plate — canvas requires firm pressure.`,
    });

    steps.push({
      step: n++, title: 'Finish',
      detail: 'Press with steam on cotton/linen setting. Bar tack any remaining stress points. Try on and check collar stands evenly.',
    });

    return steps;
  },
};
