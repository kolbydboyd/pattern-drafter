/**
 * Camp Shirt — woven button-front with camp/convertible collar.
 * Front panels split at CF for button placket (+1.5″ each side).
 * Collar is a shaped rectangle with rounded front points.
 * Short sleeve default (straight rectangle with slight taper).
 * Fabric: cotton lawn, chambray, linen, rayon — light wovens 3–6 oz.
 */

import {
  shoulderSlope, necklineCurve, armholeCurve,
  armholeDepthFromChest, chestEaseDistribution, neckWidthFromCircumference, UPPER_EASE,
} from '../engine/upper-body.js';
import { sampleBezier, fmtInches } from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

const PLACKET_W = 1.5; // button placket extension on each front panel (inches)

// Sleeve length presets
const SLEEVE_LENGTHS = { short: 9, long: 26 };

// Neckline depth for crew-fit camp collar
const NECK_DEPTH_FRONT = 3.0;
const NECK_DEPTH_BACK  = 0.75;

export default {
  id: 'camp-shirt',
  name: 'Camp Shirt',
  category: 'upper',
  measurements: ['chest', 'shoulder', 'neck', 'sleeveLength', 'bicep', 'wrist', 'torsoLength'],
  measurementDefaults: { sleeveLength: 26 },

  options: {
    collar: {
      type: 'select', label: 'Collar style',
      values: [
        { value: 'camp',   label: 'Camp / revere (default)' },
        { value: 'worker', label: 'Worker / point collar'   },
      ],
      default: 'camp',
    },
    sleeveStyle: {
      type: 'select', label: 'Sleeve length',
      values: [
        { value: 'short', label: 'Short (9″)' },
        { value: 'long',  label: 'Long (26″)' },
      ],
      default: 'short',
    },
    fit: {
      type: 'select', label: 'Fit',
      values: [
        { value: 'standard',  label: 'Regular (+4″)' },
        { value: 'relaxed',   label: 'Relaxed (+6″)' },
      ],
      default: 'standard',
    },
    chestPocket: {
      type: 'select', label: 'Chest pocket',
      values: [
        { value: 'none',  label: 'None'         },
        { value: 'patch', label: 'Patch pocket' },
      ],
      default: 'patch',
    },
    buttons: {
      type: 'select', label: 'Button count',
      values: [
        { value: '5', label: '5 buttons' },
        { value: '6', label: '6 buttons' },
      ],
      default: '5',
    },
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
        { value: 0.5, label: '½″ (rolled)' },
        { value: 1,   label: '1″ folded'   },
      ],
      default: 0.5,
    },
  },

  pieces(m, opts) {
    const sa  = parseFloat(opts.sa);
    const hem = parseFloat(opts.hem);

    const totalEase  = UPPER_EASE[opts.fit] ?? 4;
    const { front: frontEase, back: backEase } = chestEaseDistribution(totalEase);
    const frontW = m.chest / 4 + frontEase / 2;  // half-front panel (before placket)
    const backW  = m.chest / 4 + backEase  / 2;

    const halfShoulder  = m.shoulder / 2;
    const neckW         = neckWidthFromCircumference(m.neck);
    const shoulderW     = halfShoulder - neckW;
    const slopeDrop     = 1.5;
    const armholeDepth  = armholeDepthFromChest(m.chest, 'standard');
    const chestDepth    = frontW * 0.35;
    const torsoLen      = m.torsoLength;
    const slvLength     = SLEEVE_LENGTHS[opts.sleeveStyle] ?? m.sleeveLength ?? 9;

    // Neckline curves
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

    const frontNeckPts   = sampleCurve(necklineCurve(neckW, NECK_DEPTH_FRONT, 'crew'));
    const backNeckPts    = sampleCurve(necklineCurve(neckW, NECK_DEPTH_BACK, 'crew'));
    const shoulderPts    = sampleCurve(shoulderSlope(shoulderW, slopeDrop));
    const frontArmPts    = sampleCurve(armholeCurve(shoulderW, chestDepth, armholeDepth, false));
    const backArmPts     = sampleCurve(armholeCurve(shoulderW, chestDepth * 0.95, armholeDepth, true));

    const shoulderPtX = neckW + shoulderW;
    const shoulderPtY = slopeDrop;

    // ── FRONT PANEL (LEFT — RIGHT panel is a mirror, same piece) ─────────────
    // CF edge gets +PLACKET_W extension (button placket fold-over).
    // Origin: CF neckline low point at (0, NECK_DEPTH_FRONT).
    const frontPoly = [];

    // CF low point → shoulder-neck junction (reverse neck curve, shifted to x-axis)
    const neckFrontRev = [...frontNeckPts].reverse();
    for (const p of neckFrontRev) {
      frontPoly.push({ x: neckW - p.x, y: NECK_DEPTH_FRONT - p.y });
    }
    // Shoulder-neck → shoulder point
    for (let i = 1; i < shoulderPts.length; i++) {
      frontPoly.push({ x: neckW + shoulderPts[i].x, y: shoulderPts[i].y });
    }
    // Shoulder point → underarm (front armhole)
    for (let i = 1; i < frontArmPts.length; i++) {
      frontPoly.push({ x: shoulderPtX + frontArmPts[i].x, y: shoulderPtY + frontArmPts[i].y });
    }
    // Underarm → hem
    const sideX = shoulderPtX + chestDepth;
    frontPoly.push({ x: sideX, y: torsoLen });
    // Hem → CF fold (including placket extension)
    frontPoly.push({ x: -PLACKET_W, y: torsoLen });
    // CF fold up to neckline low point
    frontPoly.push({ x: -PLACKET_W, y: NECK_DEPTH_FRONT });
    // Back to CF low point of neckline (close)
    frontPoly.push({ x: 0, y: NECK_DEPTH_FRONT });

    // ── BACK PANEL ───────────────────────────────────────────────────────────
    const backChestDepth = chestDepth * 0.95;
    const backPoly = [];

    const neckBackRev = [...backNeckPts].reverse();
    for (const p of neckBackRev) {
      backPoly.push({ x: neckW - p.x, y: NECK_DEPTH_BACK - p.y });
    }
    for (let i = 1; i < shoulderPts.length; i++) {
      backPoly.push({ x: neckW + shoulderPts[i].x, y: shoulderPts[i].y });
    }
    for (let i = 1; i < backArmPts.length; i++) {
      backPoly.push({ x: shoulderPtX + backArmPts[i].x, y: shoulderPtY + backArmPts[i].y });
    }
    const backSideX = shoulderPtX + backChestDepth;
    backPoly.push({ x: backSideX, y: torsoLen });
    backPoly.push({ x: 0, y: torsoLen });
    backPoly.push({ x: 0, y: NECK_DEPTH_BACK });

    // ── SLEEVE (straight rectangle with 10% taper toward hem) ────────────────
    const sleeveEase = totalEase * 0.2;
    const slvTopW    = m.bicep / 2 + sleeveEase;     // half-sleeve at cap
    const slvBotW    = (m.wrist || m.bicep * 0.7) / 2 + (opts.sleeveStyle === 'long' ? 0.5 : 0);
    const sleevePoly = [
      { x: 0,        y: 0          },  // back shoulder
      { x: slvTopW * 2, y: 0       },  // front shoulder
      { x: slvTopW * 2 - (slvTopW - slvBotW), y: slvLength }, // front hem (tapered)
      { x: slvTopW - slvBotW,       y: slvLength },            // back hem (tapered)
    ];

    // ── COLLAR ───────────────────────────────────────────────────────────────
    // Camp collar: rectangle with the front corners angled.
    // Width = half neckline circumference + 0.25″ ease. Height = 3″ cut (1.5″ finished × 2).
    const collarLen = m.neck / 2 + 0.25;
    const collarH   = 3; // 1.5″ finished
    // "Rounded" front points are approximated in the instruction note.

    // ── PLACKET FACING ───────────────────────────────────────────────────────
    // Separate facing strip to back the button/buttonhole side.
    const placketH = torsoLen - NECK_DEPTH_FRONT;

    // ── BUTTON spacing ────────────────────────────────────────────────────────
    const btnCount   = parseInt(opts.buttons) || 5;
    const btnDiam    = 0.5; // ½″ default button
    const btnholeSz  = fmtInches(btnDiam + 0.125);

    const frontBB   = bbox(frontPoly);
    const backBB    = bbox(backPoly);
    const sleeveBB  = bbox(sleevePoly);

    const pieces = [
      {
        id: 'bodice-front',
        name: 'Front Panel (Left)',
        instruction: `Cut 2 (L & R mirror) · CF edge has ${fmtInches(PLACKET_W)} placket extension · Button side: ${btnCount} buttonholes at ${btnholeSz} · Buttonhole side: ${btnCount} buttons spaced evenly`,
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
        instruction: 'Cut 1 on fold (CB) · Place fold at CB edge',
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
        instruction: `Cut 2 (mirror L & R) · Straight grain along center length · ${opts.sleeveStyle === 'short' ? 'Short sleeve' : 'Long sleeve'}`,
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
          { label: fmtInches(slvTopW * 2) + ' top', x1: 0, y1: -0.4, x2: slvTopW * 2, y2: -0.4, type: 'h' },
          { label: fmtInches(slvLength) + ' length', x: slvTopW * 2 + 1, y1: 0, y2: slvLength, type: 'v' },
        ],
      },
      {
        id: 'collar',
        name: 'Collar',
        instruction: `Cut 2 (outer + facing/undercollar) · Interface outer · ${fmtInches(collarLen)} × ${fmtInches(collarH)} · Shape front corners to rounded point after cutting`,
        type: 'rectangle',
        dimensions: { length: collarLen, width: collarH },
        sa,
      },
      {
        id: 'placket-facing',
        name: 'Front Placket Facing',
        instruction: `Cut 2 (L & R) · Interface · ${fmtInches(PLACKET_W + 0.5)} wide × ${fmtInches(placketH)} long`,
        type: 'pocket',
        dimensions: { width: PLACKET_W + 0.5, height: placketH },
      },
    ];

    if (opts.chestPocket === 'patch') {
      pieces.push({
        id: 'chest-pocket',
        name: 'Chest Patch Pocket',
        instruction: 'Cut 1 · Position at left chest 2.5″ below neckline, 1.5″ from placket · Interface if desired',
        type: 'pocket',
        dimensions: { width: 4, height: 5 },
      });
    }

    return pieces;
  },

  materials(m, opts) {
    const btnCount = parseInt(opts.buttons) || 5;
    const btnDiam  = 0.5;
    const isLong   = opts.sleeveStyle === 'long';

    const notions = [
      { name: 'Buttons', quantity: `${btnCount + 1}`, notes: `${fmtInches(btnDiam)} (shirt buttons) — +1 spare` },
      { ref: 'interfacing-light', quantity: '0.5 yard (collar + placket facings)' },
    ];

    return buildMaterialsSpec({
      fabrics: ['cotton-lawn', 'chambray', 'linen-light', 'rayon-challis'],
      notions,
      thread: 'poly-all',
      needle: 'universal-80',
      stitches: ['straight-2.5', 'straight-1.8', 'zigzag-small'],
      notes: [
        'Pre-wash fabric before cutting — linen can shrink 5–8%, rayon 3–5%',
        'French seams optional: sew WS together at 3mm, trim, fold, sew RS together at 6mm — clean interior, no serger needed',
        `Button spacing: divide placket length by ${btnCount - 1} — place top button 1″ from neckline, bottom button 1″ from hem`,
        'Interface collar (outer layer only) with woven or sew-in interfacing — fusible can show through light fabrics',
        'Sew buttonholes before attaching buttons — test buttonhole size on a scrap first',
        isLong ? 'Long sleeve: roll up and hold with a button tab or hem at desired length before finishing' : '',
      ].filter(Boolean),
    });
  },

  instructions(m, opts) {
    const steps = [];
    let n = 1;
    const btnCount = parseInt(opts.buttons) || 5;

    if (opts.chestPocket === 'patch') {
      steps.push({
        step: n++, title: 'Prepare chest pocket',
        detail: 'Serge or zigzag top edge. Fold top under ½″, topstitch. Press remaining three edges under ⅝″. Position on left front panel 2.5″ below shoulder seam. Topstitch on 3 sides. Bar tack top corners.',
      });
    }

    steps.push({
      step: n++, title: 'Prepare collar',
      detail: 'Fuse interfacing to outer collar. Sew outer to undercollar (RST) along front and outer edges, leaving neck edge open. Clip corners, trim seams to 3mm. Turn RS out, press flat. Understitch undercollar if desired. Shape front points: fold front edge diagonally, press, trim. Topstitch if using worker collar style.',
    });

    steps.push({
      step: n++, title: 'Prepare front plackets',
      detail: `Press center front fold line ${fmtInches(PLACKET_W)} from CF edge. Fuse interfacing to placket facing strips. Fold placket extension to WS along fold line, press. Sew facing to placket edge (RST), press, fold under, slipstitch or topstitch to WS.`,
    });

    steps.push({
      step: n++, title: 'Sew shoulder seams',
      detail: 'Join front panels to back at shoulders (RST). Press toward back. For French seams: sew WS together at 3mm, trim, press open, fold RST, sew at 6mm.',
    });

    steps.push({
      step: n++, title: 'Attach collar',
      detail: 'Pin outer collar to neckline (RST), matching CF and CB marks. Sew collar to neckline through outer collar and bodice only. Clip curve. Fold undercollar seam allowance under, pin to cover neckline seam on WS. Slipstitch or edgestitch.',
    });

    steps.push({
      step: n++, title: 'Set sleeves',
      detail: 'Mark center of sleeve cap (top edge center). Match to shoulder seam. Pin sleeve to armhole (RST), ease cap to fit — no ease needed for short sleeves. Sew. Finish seam with zigzag or French seam. Press toward sleeve.',
    });

    steps.push({
      step: n++, title: 'Sew side seams and sleeve seams',
      detail: 'Sew front to back at side seams in one continuous seam from shirt hem to sleeve hem (RST). For French seams: sew WS together, trim, fold, sew again. Press toward back.',
    });

    steps.push({
      step: n++, title: 'Hem sleeves and body',
      detail: `Sleeve hem: fold up ${fmtInches(parseFloat(opts.hem))} twice, press, topstitch. Body hem: fold up ${fmtInches(parseFloat(opts.hem))} twice, press, topstitch close to inner fold.`,
    });

    steps.push({
      step: n++, title: 'Buttonholes and buttons',
      detail: `Mark ${btnCount} buttonhole positions on right front placket (horizontal buttonholes): first 1″ from neckline, last 1″ from hem, evenly spaced. Test buttonhole on scrap. Sew buttonholes. Cut open with seam ripper. Sew buttons to left placket at matching positions.`,
    });

    steps.push({
      step: n++, title: 'Finish',
      detail: 'Press entire shirt. Check collar sits flat and even. Try on and verify button placket hangs straight.',
    });

    return steps;
  },
};
