/**
 * Button-Up Shirt (Womenswear) — buttons on LEFT side (womenswear convention).
 * Split front panels with 1.5″ placket. Optional bust darts. Various collar styles.
 * Back yoke option. Barrel or French cuff for long sleeve.
 */

import {
  shoulderSlope, necklineCurve, armholeCurve,
  armholeDepthFromChest, chestEaseDistribution, neckWidthFromCircumference, UPPER_EASE,
} from '../engine/upper-body.js';
import { sampleBezier, fmtInches } from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

const PLACKET_W = 1.5;

const SLEEVE_LENGTHS   = { short: 9, three_quarter: 18, long: 26, cap: 3 };
const NECK_DEPTH_FRONT = 3.0;
const NECK_DEPTH_BACK  = 0.75;

export default {
  id: 'button-up-w',
  name: 'Button-Up Shirt (W)',
  category: 'tops',
  difficulty: 'advanced',
  measurements: ['chest', 'shoulder', 'neck', 'sleeveLength', 'bicep', 'wrist', 'torsoLength'],
  measurementDefaults: { sleeveLength: 26 },

  options: {
    collar: {
      type: 'select', label: 'Collar',
      values: [
        { value: 'point',    label: 'Point / spread collar',  reference: 'dress shirt, Oxford' },
        { value: 'camp',     label: 'Camp / revere collar',   reference: 'bowling, cabana'     },
        { value: 'band',     label: 'Band / Mandarin collar', reference: 'Mandarin, Nehru'     },
        { value: 'peterpan', label: 'Peter Pan collar',       reference: 'retro, schoolgirl'   },
      ],
      default: 'point',
    },
    sleeve: {
      type: 'select', label: 'Sleeve',
      values: [
        { value: 'long',          label: 'Long (with cuff)' },
        { value: 'three_quarter', label: '¾ length'         },
        { value: 'short',         label: 'Short'            },
        { value: 'cap',           label: 'Cap sleeve'       },
      ],
      default: 'long',
    },
    fit: {
      type: 'select', label: 'Fit',
      values: [
        { value: 'fitted',     label: 'Fitted (+2″ with darts)', reference: 'fitted, tailored'    },
        { value: 'semifitted', label: 'Semi-fitted (+3″)',       reference: 'classic, off-the-rack' },
        { value: 'relaxed',    label: 'Relaxed (+5″)',           reference: 'skater, workwear'      },
      ],
      default: 'semifitted',
    },
    length: {
      type: 'select', label: 'Length',
      values: [
        { value: 'hip',    label: 'Hip (+4″ below torso)' },
        { value: 'tunic',  label: 'Tunic (+8″)'           },
        { value: 'cropped', label: 'Cropped (at waist)'   },
      ],
      default: 'hip',
    },
    bustDart: {
      type: 'select', label: 'Bust dart',
      values: [
        { value: 'yes', label: 'Yes (from side seam)' },
        { value: 'no',  label: 'No'                   },
      ],
      default: 'no',
    },
    backDetail: {
      type: 'select', label: 'Back detail',
      values: [
        { value: 'plain',  label: 'Plain'               },
        { value: 'yoke',   label: 'Back yoke'           },
        { value: 'pleat',  label: 'Center back pleat'   },
      ],
      default: 'plain',
    },
    cuff: {
      type: 'select', label: 'Cuff (long sleeve)',
      values: [
        { value: 'barrel',  label: 'Barrel cuff (2.5″ band)' },
        { value: 'french',  label: 'French cuff (turn-back)'  },
        { value: 'none',    label: 'No cuff (hem only)'       },
      ],
      default: 'barrel',
    },
    buttons: {
      type: 'select', label: 'Buttons',
      values: [
        { value: '7', label: '7 buttons' },
        { value: '8', label: '8 buttons' },
      ],
      default: '7',
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
        { value: 1,   label: '1″'          },
      ],
      default: 0.5,
    },
  },

  pieces(m, opts) {
    const sa  = parseFloat(opts.sa);
    const hem = parseFloat(opts.hem);

    const easeVal = opts.fit === 'fitted' ? 2 : opts.fit === 'relaxed' ? 5 : 3;
    const { front: frontEase, back: backEase } = chestEaseDistribution(easeVal);
    // Both front and back half-panels are equal so side seams align when sewn
    const panelW = (m.chest + easeVal) / 4;
    const frontW = panelW;
    const backW  = panelW;

    const neckW        = neckWidthFromCircumference(m.neck);
    const shoulderW    = m.shoulder / 2 - neckW;
    const slopeDrop    = 1.75;
    const shoulderPtX  = neckW + shoulderW;
    const armholeY     = armholeDepthFromChest(m.chest, 'standard');
    const armholeDepth = armholeY - slopeDrop;
    const chestDepth   = panelW - shoulderPtX;
    const effCrossBack  = m.crossBack  || (m.shoulder - 2);
    const backChestDepth = m.crossBack ? Math.max(0.5, m.crossBack / 2 - shoulderPtX) : chestDepth;
    const lengthExtra  = opts.length === 'tunic' ? 8 : opts.length === 'cropped' ? 0 : 4;
    const torsoLen     = m.torsoLength + lengthExtra;
    const slvLen       = SLEEVE_LENGTHS[opts.sleeve] ?? m.sleeveLength ?? 9;
    const shoulderPtY  = slopeDrop;

    function sampleCurve(cp, steps = 12) { return sampleBezier(cp.p0, cp.p1, cp.p2, cp.p3, steps); }
    function polyPath(poly) { let d = `M ${poly[0].x.toFixed(2)} ${poly[0].y.toFixed(2)}`; for (let i=1;i<poly.length;i++) d+=` L ${poly[i].x.toFixed(2)} ${poly[i].y.toFixed(2)}`; return d+' Z'; }
    function bbox(poly) { const xs=poly.map(p=>p.x),ys=poly.map(p=>p.y); return {minX:Math.min(...xs),maxX:Math.max(...xs),minY:Math.min(...ys),maxY:Math.max(...ys)}; }

    const frontNeckPts   = sampleCurve(necklineCurve(neckW, NECK_DEPTH_FRONT, 'crew'));
    const backNeckPts    = sampleCurve(necklineCurve(neckW, NECK_DEPTH_BACK, 'crew'));
    const shoulderPts    = sampleCurve(shoulderSlope(shoulderW, slopeDrop));
    const frontArmPts    = sampleCurve(armholeCurve(shoulderW, chestDepth, armholeDepth, false));
    const backArmPts     = sampleCurve(armholeCurve(shoulderW, backChestDepth, armholeDepth, true));

    // Front panel polygon
    const frontPoly = [];
    [...frontNeckPts].reverse().forEach(p => frontPoly.push({ x: neckW - p.x, y: p.y }));
    for (let i=1;i<shoulderPts.length;i++) frontPoly.push({ x: neckW + shoulderPts[i].x, y: shoulderPts[i].y });
    for (let i=1;i<frontArmPts.length;i++) frontPoly.push({ x: shoulderPtX + frontArmPts[i].x, y: shoulderPtY + frontArmPts[i].y });
    frontPoly.push({ x: shoulderPtX + chestDepth, y: torsoLen });
    frontPoly.push({ x: -PLACKET_W, y: torsoLen });
    frontPoly.push({ x: -PLACKET_W, y: NECK_DEPTH_FRONT });
    frontPoly.push({ x: 0, y: NECK_DEPTH_FRONT });

    // Bust dart indicator (note: actual dart is a modification to side seam, simplified here)
    const bustDartNote = opts.bustDart === 'yes' ? ' · Bust dart from side seam: 1–1.5″ wide × 3–4″ long, pointing toward bust apex' : '';

    // Back panel polygon
    const yokeH = opts.backDetail === 'yoke' ? 3.5 : 0;
    const backPoly = [];
    [...backNeckPts].reverse().forEach(p => backPoly.push({ x: neckW - p.x, y: p.y }));
    for (let i=1;i<shoulderPts.length;i++) backPoly.push({ x: neckW + shoulderPts[i].x, y: shoulderPts[i].y });
    for (let i=1;i<backArmPts.length;i++) backPoly.push({ x: shoulderPtX + backArmPts[i].x, y: shoulderPtY + backArmPts[i].y });
    backPoly.push({ x: shoulderPtX + chestDepth, y: torsoLen });
    backPoly.push({ x: 0, y: torsoLen });
    backPoly.push({ x: 0, y: NECK_DEPTH_BACK });

    // Sleeve polygon (tapered)
    const effArmToElbow = m.armToElbow || (slvLen * 0.45);
    const slvTopW = m.bicep / 2 + easeVal * 0.15;
    const slvBotW = (m.wrist || m.bicep * 0.75) / 2 + 0.25;
    const sleevePoly = [
      { x: 0,           y: 0      },
      { x: slvTopW * 2, y: 0      },
      { x: slvTopW * 2 - (slvTopW - slvBotW), y: slvLen },
      { x: slvTopW - slvBotW,                  y: slvLen },
    ];

    const collarLen = m.neck + 0.5;
    const frontBB = bbox(frontPoly), backBB = bbox(backPoly), slvBB = bbox(sleevePoly);
    const btnCount = parseInt(opts.buttons) || 7;

    const pieces = [
      {
        id: 'bodice-front', name: 'Front Panel (Left)',
        instruction: `Cut 2 (L & R mirror) · ${fmtInches(PLACKET_W)} placket at CF · Left panel: buttonholes · Right panel: buttons${bustDartNote}`,
        type: 'bodice', polygon: frontPoly, path: polyPath(frontPoly),
        width: frontBB.maxX - frontBB.minX, height: frontBB.maxY - frontBB.minY,
        isBack: false, sa, hem,
        dims: [{ label: fmtInches(frontW) + ' panel', x1: 0, y1: -0.5, x2: frontW, y2: -0.5, type: 'h' }],
      },
      {
        id: 'bodice-back', name: 'Back Panel',
        instruction: `Cut 1 on fold (CB)${opts.backDetail === 'yoke' ? ' · Stop at yoke seam line' : ''}${opts.backDetail === 'pleat' ? ' · CB pleat 1″ each side' : ''}`,
        type: 'bodice', polygon: backPoly, path: polyPath(backPoly),
        width: backBB.maxX - backBB.minX, height: backBB.maxY - backBB.minY,
        isBack: true, sa, hem,
        dims: [{ label: fmtInches(backW) + ' half width', x1: 0, y1: -0.5, x2: backW, y2: -0.5, type: 'h' }],
      },
      {
        id: 'sleeve', name: 'Sleeve',
        instruction: `Cut 2 (mirror L & R) · ${opts.sleeve} · Straight grain along length`,
        type: 'sleeve', polygon: sleevePoly, path: polyPath(sleevePoly),
        width: slvBB.maxX - slvBB.minX, height: slvBB.maxY - slvBB.minY,
        capHeight: 0, sleeveLength: slvLen, sleeveWidth: slvTopW * 2, sa, hem,
        dims: [{ label: fmtInches(slvTopW * 2) + ' top', x1: 0, y1: -0.4, x2: slvTopW * 2, y2: -0.4, type: 'h' }, { label: fmtInches(effArmToElbow) + ' to elbow', x: -1.5, y1: 0, y2: effArmToElbow, type: 'v', color: '#b8963e' }],
      },
      { id: 'collar', name: `${opts.collar === 'peterpan' ? 'Peter Pan' : opts.collar === 'band' ? 'Band' : opts.collar === 'camp' ? 'Camp'  : 'Point'} Collar`, instruction: `Cut 2 (outer + facing) · Interface outer · ${fmtInches(collarLen)} long × 3″ cut`, dimensions: { length: collarLen, width: 3 }, type: 'rectangle', sa },
      { id: 'collar-stand', name: 'Collar Stand', instruction: 'Cut 2 · Interface one · 1.5″ wide × neckline length', dimensions: { length: m.neck + 0.5, width: 1.5 }, type: 'pocket' },
      { id: 'front-facing', name: 'Front Facing', instruction: `Cut 2 (L & R) · Interface · ${fmtInches(PLACKET_W + 0.5)} wide × ${fmtInches(torsoLen - NECK_DEPTH_FRONT)} long`, dimensions: { width: PLACKET_W + 0.5, height: torsoLen - NECK_DEPTH_FRONT }, type: 'pocket' },
    ];

    if (opts.backDetail === 'yoke') {
      pieces.push({ id: 'back-yoke', name: 'Back Yoke', instruction: 'Cut 2 (outer + lining) · Interface outer · Horizontal across upper back', dimensions: { length: backW * 2 + 1, width: yokeH + sa * 2 }, type: 'pocket' });
    }
    if (opts.sleeve === 'long' && opts.cuff !== 'none') {
      const cuffH = opts.cuff === 'french' ? 5 : 2.5;
      pieces.push({ id: 'cuff', name: opts.cuff === 'french' ? 'French Cuff' : 'Barrel Cuff', instruction: `Cut 4 (2 outer + 2 facing) · Interface outer · ${fmtInches(m.wrist + 1)} long × ${fmtInches(cuffH + sa * 2)} cut · 1 button per cuff${opts.cuff === 'french' ? ' (or cufflinks)' : ''}`, dimensions: { length: m.wrist + 1, width: cuffH + sa * 2 }, type: 'pocket' });
    }

    return pieces;
  },

  materials(m, opts) {
    const btnCount = parseInt(opts.buttons) || 7;
    const notions = [
      { name: 'Buttons', quantity: `${btnCount + (opts.sleeve === 'long' && opts.cuff !== 'none' ? 3 : 0) + 1}`, notes: '½″ shirt buttons — +1 spare, +2 per cuff if applicable' },
      { ref: 'interfacing-light', quantity: '0.75 yard (collar + stand + facings + cuffs)' },
    ];
    return buildMaterialsSpec({
      fabrics: ['cotton-poplin', 'cotton-lawn', 'linen-light', 'chambray'],
      notions,
      thread: 'poly-all',
      needle: 'universal-80',
      stitches: ['straight-2.5', 'straight-1.8', 'zigzag-small'],
      notes: [
        'Buttons on LEFT front (womenswear) — buttonholes on right placket, buttons on left',
        'French seams recommended for lightweight fabrics: sew at 3mm WS together, trim, fold RST, sew at 6mm',
        'Interface collar (outer only) with woven sew-in interfacing for lightweight fabrics — fusible can show through',
        opts.bustDart === 'yes' ? 'Bust dart: mark on RS with tailor\'s chalk. Fold RS together at dart legs. Sew from side seam to point — taper to nothing at apex. Press down.' : '',
        'Horizontal buttonholes on collar stand and cuffs; vertical buttonholes on placket',
      ].filter(Boolean),
    });
  },

  instructions(m, opts) {
    const steps = [];
    let n = 1;
    const btnCount = parseInt(opts.buttons) || 7;

    if (opts.bustDart === 'yes') {
      steps.push({ step: n++, title: 'Sew bust darts', detail: 'Fold each front panel RS together along dart legs. Sew from side seam to point, tapering to nothing at apex. Secure thread. Press dart downward.' });
    }
    if (opts.backDetail === 'yoke') {
      steps.push({ step: n++, title: 'Attach back yoke', detail: 'Sew back body to outer yoke (RST) at yoke seam. Press up. Place yoke lining over (RST), sew. Turn and press. Edgestitch from RS.' });
    }
    if (opts.backDetail === 'pleat') {
      steps.push({ step: n++, title: 'Form back pleat', detail: 'Fold 1″ pleat each side of CB crease toward center back. Baste at neckline. Press folds for first 3″.' });
    }
    steps.push({ step: n++, title: 'Prepare collar', detail: 'Interface outer collar and stand. Sew outer to undercollar (RST) on outer 3 sides. Trim, turn, press. If using stand: sew collar to stand, then stand to neckline in two steps.' });
    steps.push({ step: n++, title: 'Prepare front plackets', detail: `Interface facing strips. Press ${fmtInches(PLACKET_W)} fold at CF. Sew facing to placket edge, press, topstitch.` });
    steps.push({ step: n++, title: 'Sew shoulder seams', detail: 'Join front to back at shoulders (RST). French seam or serge. Press toward back.' });
    steps.push({ step: n++, title: 'Attach collar', detail: 'Pin collar/stand to neckline. Sew outer to neckline through bodice. Fold inner SA under, slipstitch or edgestitch from RS.' });
    steps.push({ step: n++, title: 'Set sleeves', detail: 'Mark sleeve center. Match to shoulder seam. Pin and ease into armhole (RST). Sew. French seam or serge. Press toward sleeve.' });
    steps.push({ step: n++, title: 'Sew side and sleeve seams', detail: 'Continuous seam from shirt hem through underarm to sleeve hem (RST). French seam or serge. Press toward back.' });
    if (opts.sleeve === 'long' && opts.cuff !== 'none') {
      steps.push({ step: n++, title: 'Attach cuffs', detail: `Interface outer cuff. Sew outer to sleeve opening (RST) easing fullness. Fold cuff SA under. Slipstitch or edgestitch. Make buttonhole${opts.cuff === 'french' ? 's for cufflinks' : ''}. Attach button.` });
    }
    steps.push({ step: n++, title: 'Hem', detail: `Fold up ${fmtInches(parseFloat(opts.hem))} twice, press. Topstitch. For curved hem (hip length): clip SA before folding.` });
    steps.push({ step: n++, title: 'Buttonholes and buttons', detail: `Mark ${btnCount} buttonhole positions on RIGHT placket (horizontal). Sew buttonholes. Cut open. Sew buttons to LEFT placket at matching positions.` });
    steps.push({ step: n++, title: 'Finish', detail: 'Press entire shirt. Check collar sits symmetrically. Check placket hangs straight.' });

    return steps;
  },
};
