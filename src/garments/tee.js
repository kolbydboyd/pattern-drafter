/**
 * T-Shirt — upper body knit garment.
 * Uses upper-body.js geometry for armhole, neckline, shoulder, and sleeve cap curves.
 * Pieces: front bodice, back bodice, sleeve ×2, neckband rib strip.
 * Options: neckline style, fit/ease, sleeve length, hem style, optional chest pocket.
 */

import {
  armholeCurve, shoulderSlope, necklineCurve, sleeveCapCurve,
  armholeDepthFromChest, chestEaseDistribution, neckWidthFromCircumference, UPPER_EASE,
} from '../engine/upper-body.js';
import { sampleBezier, fmtInches } from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

// ── Sleeve length presets ────────────────────────────────────────────────────
const SLEEVE_LENGTHS = { short: 8, three_quarter: 18, long: 25 };

// ── Neckline depth by style (front / back in inches) ────────────────────────
const NECK_DEPTHS = {
  crew:   { front: 2.5,  back: 0.75 },
  vneck:  { front: 9.0,  back: 0.75 },
  scoop:  { front: 6.5,  back: 0.75 },
};

export default {
  id: 'tee',
  name: 'T-Shirt',
  category: 'upper',
  measurements: ['chest', 'shoulder', 'neck', 'sleeveLength', 'bicep', 'torsoLength'],
  measurementDefaults: { sleeveLength: 25 },

  options: {
    neckline: {
      type: 'select', label: 'Neckline',
      values: [
        { value: 'crew',  label: 'Crew neck' },
        { value: 'vneck', label: 'V-neck'    },
        { value: 'scoop', label: 'Scoop neck' },
      ],
      default: 'crew',
    },
    ease: {
      type: 'select', label: 'Fit',
      values: [
        { value: 'fitted',    label: 'Slim / fitted (+2″)',  reference: 'fitted, tailored'    },
        { value: 'standard',  label: 'Regular (+4″)',        reference: 'classic, off-the-rack' },
        { value: 'relaxed',   label: 'Relaxed (+6″)',        reference: 'skater, workwear'      },
        { value: 'oversized', label: 'Oversized (+10″)',     reference: 'avant-garde, oversized' },
      ],
      default: 'standard',
    },
    sleeveStyle: {
      type: 'select', label: 'Sleeve length',
      values: [
        { value: 'short',         label: 'Short (8″)'        },
        { value: 'three_quarter', label: '¾ length (18″)'    },
        { value: 'long',          label: 'Long (25″)'        },
      ],
      default: 'short',
    },
    hemStyle: {
      type: 'select', label: 'Hem style',
      values: [
        { value: 'straight',   label: 'Straight' },
        { value: 'shirttail',  label: 'Shirttail curve' },
      ],
      default: 'straight',
    },
    chestPocket: {
      type: 'select', label: 'Chest pocket',
      values: [
        { value: 'none',  label: 'None'         },
        { value: 'patch', label: 'Patch pocket' },
      ],
      default: 'none',
    },
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
    const sa  = parseFloat(opts.sa);
    const hem = parseFloat(opts.hem);

    // ── Ease + panel widths ──────────────────────────────────────────────────
    const totalEase = UPPER_EASE[opts.ease] ?? 4;
    const { front: frontEase, back: backEase } = chestEaseDistribution(totalEase);
    const frontW = m.chest / 4 + frontEase / 2;  // half-front panel width
    const backW  = m.chest / 4 + backEase  / 2;  // half-back panel width

    // ── Shoulder geometry ────────────────────────────────────────────────────
    const halfShoulder = m.shoulder / 2;          // shoulder point from CF/CB
    const slopeDrop    = 1.5;                      // standard shoulder drop (in)
    const shoulderW    = halfShoulder - neckWidthFromCircumference(m.neck);

    // ── Armhole depth ────────────────────────────────────────────────────────
    const armholeDepth = armholeDepthFromChest(m.chest, opts.ease === 'oversized' ? 'oversized' : 'standard');
    const chestDepth   = frontW * 0.35;           // armhole horizontal extent at underarm

    // ── Neckline ─────────────────────────────────────────────────────────────
    const neckKey  = opts.neckline;
    const neckW    = neckWidthFromCircumference(m.neck);
    const neckDepthFront = NECK_DEPTHS[neckKey]?.front ?? 2.5;
    const neckDepthBack  = NECK_DEPTHS[neckKey]?.back  ?? 0.75;
    const neckStyleFront = neckKey === 'vneck' ? 'v-neck' : neckKey === 'scoop' ? 'scoop' : 'crew';
    const neckStyleBack  = 'crew';

    // ── Torso + sleeve lengths ───────────────────────────────────────────────
    const torsoLen  = m.torsoLength;
    const slvLength = SLEEVE_LENGTHS[opts.sleeveStyle] ?? m.sleeveLength ?? 8;

    // ── Bezier curve sampling helpers ─────────────────────────────────────────
    function sampleCurve(cp, steps = 12) {
      return sampleBezier(cp.p0, cp.p1, cp.p2, cp.p3, steps);
    }

    // Build a flat polygon from curve control points
    function curveToPoints(cp, steps = 12) {
      return sampleCurve(cp, steps);
    }

    // Translate an array of {x,y} points
    function translatePts(pts, dx, dy) {
      return pts.map(p => ({ x: p.x + dx, y: p.y + dy }));
    }

    // ── FRONT BODICE POLYGON ─────────────────────────────────────────────────
    // Origin: CF neckline point (top-center of piece)
    // x+ rightward toward side seam; y+ downward
    //
    //   CF fold        shoulder        armhole        side
    //   (0,neckDepth) → (neckW,0) → (halfShoulder, slopeDrop) → armhole → (frontW, armholeDepth) → (frontW, torsoLen) → (0, torsoLen)
    //
    const frontNeckPts = curveToPoints(
      necklineCurve(neckW, neckDepthFront, neckStyleFront)
    ); // p0=(0,0) = shoulder-neck junction → p3=(neckW,neckDepthFront) = CF low point

    const frontShoulderPts = curveToPoints(
      shoulderSlope(shoulderW, slopeDrop)
    ); // p0=(0,0) neck pt → p3=(shoulderW, slopeDrop) shoulder point

    const frontArmholeCp = armholeCurve(shoulderW, chestDepth, armholeDepth, false);
    const frontArmholePts = curveToPoints(frontArmholeCp);
    // p0=(0,0) shoulder point → p3=(chestDepth, armholeDepth) underarm

    // Compose front polygon (CW winding, origin at top-left = CF top edge at neckline level)
    // Shift so shoulder-neck junction is at x=neckW, y=0
    const frontPoly = [];

    // CF neckline low point → shoulder-neck junction (reverse of neckline curve)
    const neckFrontRev = [...frontNeckPts].reverse();
    for (const p of neckFrontRev) {
      frontPoly.push({ x: neckW - p.x, y: neckDepthFront - p.y });
    }

    // Shoulder-neck junction → shoulder point
    for (let i = 1; i < frontShoulderPts.length; i++) {
      frontPoly.push({ x: neckW + frontShoulderPts[i].x, y: frontShoulderPts[i].y });
    }

    // Shoulder point → underarm notch (armhole curve)
    const shoulderPtX = neckW + shoulderW;
    const shoulderPtY = slopeDrop;
    for (let i = 1; i < frontArmholePts.length; i++) {
      frontPoly.push({
        x: shoulderPtX + frontArmholePts[i].x,
        y: shoulderPtY + frontArmholePts[i].y,
      });
    }

    // Underarm → hem (side seam)
    const sideX = shoulderPtX + chestDepth;
    frontPoly.push({ x: sideX, y: torsoLen });

    // Hem across to CF fold
    if (opts.hemStyle === 'shirttail') {
      // Simple curve: side hem drops ~1.5" lower than CF hem
      frontPoly.push({ x: neckW * 0.5, y: torsoLen + 0.5 });
    }
    frontPoly.push({ x: 0, y: torsoLen });

    // CF fold back up to neckline low point
    frontPoly.push({ x: 0, y: neckDepthFront });

    // ── BACK BODICE POLYGON ──────────────────────────────────────────────────
    const backNeckPts = curveToPoints(
      necklineCurve(neckW, neckDepthBack, neckStyleBack)
    );
    const backArmholeCp = armholeCurve(shoulderW, chestDepth * 0.95, armholeDepth, true);
    const backArmholePts = curveToPoints(backArmholeCp);

    const backPoly = [];

    const neckBackRev = [...backNeckPts].reverse();
    for (const p of neckBackRev) {
      backPoly.push({ x: neckW - p.x, y: neckDepthBack - p.y });
    }

    for (let i = 1; i < frontShoulderPts.length; i++) {
      backPoly.push({ x: neckW + frontShoulderPts[i].x, y: frontShoulderPts[i].y });
    }

    const backChestDepth = chestDepth * 0.95;
    for (let i = 1; i < backArmholePts.length; i++) {
      backPoly.push({
        x: shoulderPtX + backArmholePts[i].x,
        y: shoulderPtY + backArmholePts[i].y,
      });
    }

    const backSideX = shoulderPtX + backChestDepth;
    backPoly.push({ x: backSideX, y: torsoLen });
    if (opts.hemStyle === 'shirttail') {
      backPoly.push({ x: neckW * 0.5, y: torsoLen + 1 });
    }
    backPoly.push({ x: 0, y: torsoLen });
    backPoly.push({ x: 0, y: neckDepthBack });

    // ── SLEEVE POLYGON ───────────────────────────────────────────────────────
    // Width at underarm: bicep/2 + ease
    const sleeveEase = totalEase * 0.25;
    const slvWidth   = m.bicep / 2 + sleeveEase;
    const capHeight  = opts.ease === 'fitted' ? 5.5 : opts.ease === 'oversized' ? 5.0 : 5.5;
    const capCp      = sleeveCapCurve(m.bicep, capHeight, slvWidth * 2);
    const capPts     = curveToPoints(capCp, 16);
    // capPts go from (0,0) back underarm → (slvWidth*2, 0) front underarm
    // y is negative at crown — shift all y by +capHeight so origin is at crown level

    const sleevePoly = [];
    // Cap — from back underarm across crown to front underarm
    for (const p of capPts) {
      sleevePoly.push({ x: p.x, y: p.y + capHeight });
    }
    // Front underarm down to hem
    sleevePoly.push({ x: slvWidth * 2, y: capHeight + slvLength });
    // Hem across
    sleevePoly.push({ x: 0, y: capHeight + slvLength });
    // Back underarm up (already first point via close)

    // ── NECKBAND ─────────────────────────────────────────────────────────────
    // Rib strip: circumference of neckline opening × 0.85 (stretched), 1.5" finished
    const neckCircumference = m.neck;
    const nbLength = neckCircumference * 0.85;
    const nbWidth  = 3; // 1.5" finished, folded

    // ── Bounding box helpers ──────────────────────────────────────────────────
    function bbox(poly) {
      const xs = poly.map(p => p.x), ys = poly.map(p => p.y);
      return {
        minX: Math.min(...xs), maxX: Math.max(...xs),
        minY: Math.min(...ys), maxY: Math.max(...ys),
      };
    }

    function polyToPathStr(poly) {
      let d = `M ${poly[0].x.toFixed(2)} ${poly[0].y.toFixed(2)}`;
      for (let i = 1; i < poly.length; i++) d += ` L ${poly[i].x.toFixed(2)} ${poly[i].y.toFixed(2)}`;
      return d + ' Z';
    }

    const frontBB = bbox(frontPoly);
    const backBB  = bbox(backPoly);
    const slvBB   = bbox(sleevePoly);

    const pieces = [
      {
        id: 'bodice-front',
        name: 'Front Bodice',
        instruction: 'Cut 1 on fold (CF) · Place fold at CF edge',
        type: 'bodice',
        polygon: frontPoly,
        path: polyToPathStr(frontPoly),
        width:  frontBB.maxX - frontBB.minX,
        height: frontBB.maxY - frontBB.minY,
        neckDepth: neckDepthFront,
        armholeDepth,
        isBack: false,
        sa, hem,
        dims: [
          { label: fmtInches(frontW) + ' half width', x1: 0, y1: -0.5, x2: frontW, y2: -0.5, type: 'h' },
          { label: fmtInches(torsoLen) + ' length', x: frontBB.maxX + 1, y1: 0, y2: torsoLen, type: 'v' },
        ],
      },
      {
        id: 'bodice-back',
        name: 'Back Bodice',
        instruction: 'Cut 1 on fold (CB) · Place fold at CB edge',
        type: 'bodice',
        polygon: backPoly,
        path: polyToPathStr(backPoly),
        width:  backBB.maxX - backBB.minX,
        height: backBB.maxY - backBB.minY,
        neckDepth: neckDepthBack,
        armholeDepth,
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
        instruction: `Cut 2 (mirror L & R) · Cap top · ${opts.sleeveStyle === 'short' ? 'Short sleeve' : opts.sleeveStyle === 'three_quarter' ? '¾ sleeve' : 'Long sleeve'}`,
        type: 'sleeve',
        polygon: sleevePoly,
        path: polyToPathStr(sleevePoly),
        width:  slvBB.maxX - slvBB.minX,
        height: slvBB.maxY - slvBB.minY,
        capHeight,
        sleeveLength: slvLength,
        sleeveWidth: slvWidth * 2,
        sa, hem,
        dims: [
          { label: fmtInches(slvWidth * 2) + ' underarm', x1: 0, y1: capHeight + 0.4, x2: slvWidth * 2, y2: capHeight + 0.4, type: 'h' },
          { label: fmtInches(slvLength) + ' length', x: slvWidth * 2 + 1, y1: capHeight, y2: capHeight + slvLength, type: 'v' },
          { label: fmtInches(capHeight) + ' cap', x: -1.2, y1: 0, y2: capHeight, type: 'v' },
        ],
      },
      {
        id: 'neckband',
        name: 'Neckband',
        instruction: `Cut 1 from rib knit on fold · ${fmtInches(nbLength)} long × ${fmtInches(nbWidth)} cut (${fmtInches(nbWidth / 2)} finished) · 85% of neck opening`,
        type: 'rectangle',
        dimensions: { length: nbLength, width: nbWidth },
        sa,
      },
    ];

    if (opts.chestPocket === 'patch') {
      pieces.push({
        id: 'chest-pocket',
        name: 'Chest Patch Pocket',
        instruction: 'Cut 1 · Position at left chest · Interface if desired',
        type: 'pocket',
        dimensions: { width: 4, height: 5 },
      });
    }

    return pieces;
  },

  materials(m, opts) {
    const isLong = opts.sleeveStyle === 'long' || opts.sleeveStyle === 'three_quarter';
    const notions = [
      { name: 'Rib knit', quantity: '0.25 yard', notes: 'For neckband — high recovery stretch' },
    ];
    if (isLong) {
      notions.push({ name: 'Rib knit (extra)', quantity: '0.5 yard', notes: 'For sleeve cuffs if desired' });
    }

    return buildMaterialsSpec({
      fabrics: ['cotton-jersey', 'rayon-jersey', 'poly-jersey'],
      notions,
      thread: 'poly-all',
      needle: 'ballpoint-80',
      stitches: ['stretch', 'overlock', 'coverstitch', 'zigzag-med'],
      notes: [
        'Use a ballpoint (jersey) needle 80/12 — prevents skipped stitches and snags on knit fabric',
        'Use a stretch stitch or serger for ALL seams — a standard straight stitch will pop when stretched',
        'Twin needle for hem (RS shows two parallel rows) or fold under and coverstitch',
        'Pre-wash jersey before cutting — cotton knits shrink 3–5% in first wash',
        'Neckband cut at 85% of neck opening so it lies flat without gaping',
        'Stretch neckband gently as you sew to match opening — do not stretch the bodice edge',
        opts.ease === 'fitted' ? 'Slim fit: ease is minimal — use 4-way stretch fabric only' : '',
      ].filter(Boolean),
    });
  },

  instructions(m, opts) {
    const steps = [];
    let n = 1;
    const isLong = opts.sleeveStyle !== 'short';

    if (opts.chestPocket === 'patch') {
      steps.push({
        step: n++, title: 'Prepare chest pocket',
        detail: 'Serge top edge. Fold top under ½″, topstitch. Press remaining edges under ½″. Position on left chest 2.5″ below neckline, 1.5″ from CF. Topstitch on 3 sides close to edge. Bar tack top corners.',
      });
    }

    steps.push({
      step: n++, title: 'Sew shoulder seams',
      detail: 'Join front to back at shoulders (RST). Stretch stitch or serge. Press toward back.',
    });

    steps.push({
      step: n++, title: 'Attach neckband',
      detail: `Fold neckband in half lengthwise (WST), press. Divide neckband and neck opening into quarters, pin at quarters. Sew neckband to neck opening (RST), stretching band to fit opening. Serge or stretch stitch. Press SA toward bodice. Topstitch from RS if desired.`,
    });

    steps.push({
      step: n++, title: 'Set sleeves',
      detail: 'Divide sleeve cap and armhole opening into quarters, pin at quarters. Sew sleeve into armhole (RST), easing cap to fit. Stretch stitch. Serge SA together. Press toward sleeve.',
    });

    steps.push({
      step: n++, title: 'Sew side seams and sleeve seams',
      detail: 'Pin front to back at side seams and sleeve seams in one continuous seam from hem to sleeve hem. Stretch stitch or serge. Press toward back.',
    });

    if (isLong) {
      steps.push({
        step: n++, title: 'Hem sleeves',
        detail: 'Fold up ¾″, press. Twin needle from RS or fold under raw edge and zigzag. Or attach rib cuffs at 80% of opening width.',
      });
    } else {
      steps.push({
        step: n++, title: 'Hem sleeves',
        detail: 'Fold up ¾″, press. Twin needle from RS in one pass.',
      });
    }

    steps.push({
      step: n++, title: 'Hem body',
      detail: `Fold hem up ${fmtInches(parseFloat(opts.hem))}, press${opts.hemStyle === 'shirttail' ? ' — clipping curve at sides as needed' : ''}. Twin needle from RS or fold under raw edge and zigzag stitch.`,
    });

    steps.push({
      step: n++, title: 'Finish',
      detail: 'Press with damp cloth on cotton/steam setting (check fabric care). Try on — neckband should sit flat and not gap.',
    });

    return steps;
  },
};
