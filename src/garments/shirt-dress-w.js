/**
 * Shirt Dress (Womenswear) — button-up bodice + attached skirt.
 * Skirt options: A-line, straight, or gathered. Belt/sash option.
 * Uses fullLength measurement (or torsoLength + skirtLength).
 * Collar styles: point, camp/revere, band-only.
 */

import {
  shoulderSlope, necklineCurve, armholeCurve,
  armholeDepthFromChest, chestEaseDistribution, neckWidthFromCircumference,
} from '../engine/upper-body.js';
import { sampleBezier, fmtInches } from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

const PLACKET_W  = 1.5;
const FACING_W   = 2.0;

export default {
  id: 'shirt-dress-w',
  name: 'Shirt Dress (W)',
  category: 'upper',
  difficulty: 'advanced',
  measurements: ['chest', 'shoulder', 'neck', 'bicep', 'waist', 'hip', 'torsoLength', 'skirtLength'],
  measurementDefaults: { torsoLength: 16, skirtLength: 26 },

  options: {
    collar: {
      type: 'select', label: 'Collar',
      values: [
        { value: 'point',  label: 'Classic point collar',  reference: 'dress shirt, Oxford' },
        { value: 'camp',   label: 'Camp / revere collar',  reference: 'bowling, cabana'     },
        { value: 'band',   label: 'Mandarin band collar',  reference: 'Mandarin, Nehru'     },
      ],
      default: 'point',
    },
    skirtShape: {
      type: 'select', label: 'Skirt shape',
      values: [
        { value: 'aline',     label: 'A-line (+4″ hem flare per panel)', reference: 'versatile, classic' },
        { value: 'straight',  label: 'Straight / fitted',                reference: 'pencil, fitted'     },
        { value: 'gathered',  label: 'Gathered (1.5× hip width)',        reference: 'full, romantic'     },
      ],
      default: 'aline',
    },
    sleeve: {
      type: 'select', label: 'Sleeve',
      values: [
        { value: 'short',      label: 'Short (9″)'    },
        { value: 'roll',       label: 'Roll-up (17″)' },
        { value: 'long',       label: 'Long (26″)'    },
        { value: 'sleeveless', label: 'Sleeveless'    },
      ],
      default: 'short',
    },
    fit: {
      type: 'select', label: 'Bodice fit',
      values: [
        { value: 'fitted',    label: 'Fitted (+2″)',    reference: 'fitted, tailored' },
        { value: 'relaxed',   label: 'Relaxed (+4″)',   reference: 'skater, workwear' },
      ],
      default: 'relaxed',
    },
    bustDart: {
      type: 'select', label: 'Bust dart',
      values: [
        { value: 'yes', label: 'Yes (side seam dart)' },
        { value: 'no',  label: 'No'                   },
      ],
      default: 'no',
    },
    belt: {
      type: 'select', label: 'Belt / sash',
      values: [
        { value: 'sash',   label: 'Self-fabric sash (loops)' },
        { value: 'belt',   label: 'Structured belt (interfaced)' },
        { value: 'none',   label: 'None'                     },
      ],
      default: 'sash',
    },
    buttonCount: {
      type: 'select', label: 'Buttons',
      values: [
        { value: '6', label: '6 buttons' },
        { value: '7', label: '7 buttons' },
        { value: '8', label: '8 buttons' },
      ],
      default: '7',
    },
    length: {
      type: 'select', label: 'Dress length',
      values: [
        { value: 'midi',  label: 'Midi (knee + 8″)'  },
        { value: 'knee',  label: 'Knee (−1″ above)'  },
        { value: 'mini',  label: 'Mini (mid-thigh)'  },
        { value: 'maxi',  label: 'Maxi (full length)'},
      ],
      default: 'midi',
    },
    sa: {
      type: 'select', label: 'Seam allowance',
      values: [
        { value: 0.5,   label: '½″' },
        { value: 0.625, label: '⅝″' },
      ],
      default: 0.625,
    },
  },

  pieces(m, opts) {
    const sa  = parseFloat(opts.sa);
    const hem = 0.75;

    // Bodice geometry
    const easeVal = opts.fit === 'fitted' ? 2 : 4;
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
    const shoulderPtY  = slopeDrop;
    const torsoLen     = m.torsoLength || 16;

    function sc(cp, steps = 12) { return sampleBezier(cp.p0, cp.p1, cp.p2, cp.p3, steps); }
    function pp(poly) {
      let d = `M ${poly[0].x.toFixed(2)} ${poly[0].y.toFixed(2)}`;
      for (let i = 1; i < poly.length; i++) d += ` L ${poly[i].x.toFixed(2)} ${poly[i].y.toFixed(2)}`;
      return d + ' Z';
    }
    function bb(poly) {
      const xs = poly.map(p => p.x), ys = poly.map(p => p.y);
      return { maxX: Math.max(...xs), maxY: Math.max(...ys) };
    }

    const frontNeckPts = sc(necklineCurve(neckW, 2.5, 'crew'));
    const backNeckPts  = sc(necklineCurve(neckW, 0.75, 'crew'));
    const shoulderPts  = sc(shoulderSlope(shoulderW, slopeDrop));
    const frontArmPts  = sc(armholeCurve(shoulderW, chestDepth, armholeDepth, false));
    const backArmPts   = sc(armholeCurve(shoulderW, backChestDepth, armholeDepth, true));

    function buildBodice(isBack, neckPts, armPts, neckDepth, sideX) {
      const poly = [];
      [...neckPts].reverse().forEach(p => poly.push({ x: neckW - p.x, y: p.y }));
      for (let i = 1; i < shoulderPts.length; i++) poly.push({ x: neckW + shoulderPts[i].x, y: shoulderPts[i].y });
      for (let i = 1; i < armPts.length; i++) poly.push({ x: shoulderPtX + armPts[i].x, y: shoulderPtY + armPts[i].y });
      poly.push({ x: sideX, y: torsoLen });
      poly.push({ x: 0, y: torsoLen });
      poly.push({ x: 0, y: neckDepth });
      return poly;
    }

    const frontBodice = buildBodice(false, frontNeckPts, frontArmPts, 2.5, shoulderPtX + chestDepth);
    const backBodice  = buildBodice(true,  backNeckPts,  backArmPts,  0.75, shoulderPtX + chestDepth);

    // Front panels split at CF + placket extension
    const frontRightPoly = frontBodice.map(p => ({ x: p.x + PLACKET_W, y: p.y }));
    // Mirror the right panel. Negating x flips CW→CCW winding; .reverse() restores CW
    // so offsetPolygon computes the SA outline correctly (outside the stitch line).
    const frontLeftPoly  = frontRightPoly.map(p => ({ x: -p.x, y: p.y })).reverse();
    const frontRightBB   = bb(frontRightPoly);
    const frontLeftBB    = bb(frontLeftPoly);
    const backBB         = bb(backBodice);

    // Skirt geometry
    const skirtL = m.skirtLength || 26;
    const lengthMod = opts.length === 'mini' ? -8 : opts.length === 'knee' ? -4 : opts.length === 'maxi' ? 10 : 0;
    const adjSkirtL = skirtL + lengthMod;

    const hipHalf = m.hip / 2 + 1.0; // 1″ ease
    const skirtFrontW = hipHalf / 2;
    const skirtBackW  = hipHalf / 2;

    function buildSkirtPanel(id, name, isBack, panelW) {
      let poly;
      if (opts.skirtShape === 'aline') {
        const flare = 4.0;
        const fh = flare / 2;
        poly = [
          { x: fh,           y: 0       },
          { x: fh + panelW,  y: 0       },
          { x: panelW + fh + flare / 2, y: adjSkirtL },
          { x: 0,            y: adjSkirtL },
        ];
      } else if (opts.skirtShape === 'gathered') {
        const gatheredW = panelW * 1.5;
        poly = [
          { x: 0,          y: 0          },
          { x: gatheredW,  y: 0          },
          { x: gatheredW,  y: adjSkirtL  },
          { x: 0,          y: adjSkirtL  },
        ];
      } else {
        // straight
        poly = [
          { x: 0,       y: 0          },
          { x: panelW,  y: 0          },
          { x: panelW,  y: adjSkirtL  },
          { x: 0,       y: adjSkirtL  },
        ];
      }

      const gatherNote = opts.skirtShape === 'gathered' ? ' · Gather waist edge to match bodice waist width' : '';
      return {
        id, name,
        instruction: `Cut 1 on fold (${isBack ? 'CB' : 'CF'})${gatherNote}`,
        type: 'bodice', polygon: poly, path: pp(poly),
        width: bb(poly).maxX, height: adjSkirtL, isBack, sa, hem,
        dims: [{ label: fmtInches(panelW) + ' half width at hip', x1: 0, y1: -0.5, x2: panelW, y2: -0.5, type: 'h' }],
      };
    }

    const pieces = [
      {
        id: 'bodice-front-right', name: 'Front Bodice (Right / buttonhole side)',
        instruction: `Cut 1 · Placket ${fmtInches(PLACKET_W)} extension at CF · ${parseInt(opts.buttonCount)} buttonholes on RIGHT front (womenswear convention)${opts.bustDart === 'yes' ? ' · Bust dart from side seam toward bust apex' : ''}`,
        type: 'bodice', polygon: frontRightPoly, path: pp(frontRightPoly),
        isCutOnFold: false,
        width: frontRightBB.maxX, height: frontRightBB.maxY, isBack: false, sa, hem,
        dims: [{ label: fmtInches(frontW + PLACKET_W) + ' half width + placket', x1: 0, y1: -0.5, x2: frontW + PLACKET_W, y2: -0.5, type: 'h' }],
      },
      {
        id: 'bodice-front-left', name: 'Front Bodice (Left / button side)',
        instruction: `Cut 1 (mirror of right front) · Placket ${fmtInches(PLACKET_W)} extension at CF · ${parseInt(opts.buttonCount)} buttons on LEFT front (womenswear convention)`,
        type: 'bodice', polygon: frontLeftPoly, path: pp(frontLeftPoly),
        isCutOnFold: false,
        width: frontLeftBB.maxX, height: frontLeftBB.maxY, isBack: false, sa, hem,
        dims: [{ label: fmtInches(frontW + PLACKET_W) + ' half width + placket', x1: 0, y1: -0.5, x2: frontW + PLACKET_W, y2: -0.5, type: 'h' }],
      },
      {
        id: 'bodice-back', name: 'Back Bodice',
        instruction: 'Cut 1 on fold (CB)',
        type: 'bodice', polygon: backBodice, path: pp(backBodice),
        width: backBB.maxX, height: backBB.maxY, isBack: true, sa, hem,
        dims: [{ label: fmtInches(backW) + ' half width', x1: 0, y1: -0.5, x2: backW, y2: -0.5, type: 'h' }],
      },
      buildSkirtPanel('skirt-front', 'Skirt Front', false, skirtFrontW),
      buildSkirtPanel('skirt-back',  'Skirt Back',  true,  skirtBackW),
    ];

    // Collar
    const collarLen = m.neck + sa * 2;
    if (opts.collar === 'point') {
      const standLen = collarLen, standH = 1.25;
      const collarH  = 2.5;
      pieces.push({ id: 'collar-stand', name: 'Collar Stand', instruction: `Cut 2 (self + interfacing) · ${fmtInches(standLen)} long × ${fmtInches(standH * 2)} cut`, dimensions: { length: standLen, width: standH * 2 }, type: 'pocket' });
      pieces.push({ id: 'collar-leaf',  name: 'Collar Leaf',  instruction: `Cut 2 (self + interfacing) · Point at CF · ${fmtInches(collarLen)} long × ${fmtInches(collarH + sa)} cut (including SA)`, dimensions: { length: collarLen, width: collarH + sa }, type: 'pocket' });
    } else if (opts.collar === 'camp') {
      pieces.push({ id: 'collar-revere', name: 'Camp / Revere Collar', instruction: `Cut 2 (self + interfacing) · ${fmtInches(collarLen)} long × 3.5″ cut · Folds back to create lapel at CF`, dimensions: { length: collarLen, width: 3.5 }, type: 'pocket' });
    } else {
      pieces.push({ id: 'collar-band', name: 'Mandarin Band Collar', instruction: `Cut 2 (self + interfacing) · ${fmtInches(collarLen)} long × 2.5″ cut (1.25″ finished)`, dimensions: { length: collarLen, width: 2.5 }, type: 'pocket' });
    }

    // Front facing
    pieces.push({ id: 'front-facing', name: 'Front Facing', instruction: `Cut 2 (self + interfacing) · ${fmtInches(FACING_W)} wide × ${fmtInches(torsoLen)} long · Attach at CF edge (button/buttonhole extension)`, dimensions: { length: torsoLen, width: FACING_W }, type: 'pocket' });

    // Sleeve
    if (opts.sleeve !== 'sleeveless') {
      const SLEEVE_LENGTHS = { short: 9, roll: 17, long: 26 };
      const slvLen  = SLEEVE_LENGTHS[opts.sleeve] || 9;
      const effArmToElbow = m.armToElbow || (slvLen * 0.45);
      const slvW    = (m.bicep || 13) / 2 + easeVal * 0.15 + 0.5;
      const slvPoly = [{ x:0, y:0 }, { x:slvW*2, y:0 }, { x:slvW*2, y:slvLen }, { x:0, y:slvLen }];
      const slvBB   = bb(slvPoly);
      pieces.push({
        id: 'sleeve', name: `${opts.sleeve === 'roll' ? 'Roll-up' : opts.sleeve === 'long' ? 'Long' : 'Short'} Sleeve`,
        instruction: `Cut 2 (mirror L & R)${opts.sleeve === 'roll' ? ' · Tab and button to hold roll-up position' : ''}`,
        type: 'sleeve', polygon: slvPoly, path: pp(slvPoly),
        width: slvBB.maxX, height: slvBB.maxY, capHeight: 0, sleeveLength: slvLen, sleeveWidth: slvW * 2, sa, hem,
        dims: [{ label: fmtInches(slvW * 2) + ' width', x1: 0, y1: -0.4, x2: slvW * 2, y2: -0.4, type: 'h' }, { label: fmtInches(effArmToElbow) + ' to elbow', x: -1.5, y1: 0, y2: effArmToElbow, type: 'v', color: '#b8963e' }],
      });
    } else {
      pieces.push({ id: 'armhole-facing', name: 'Armhole Facing', instruction: 'Cut 4 (2 front + 2 back) · Interface · 2″ wide · Follows armhole curve', dimensions: { width: armholeDepth + 1, height: 2 }, type: 'pocket' });
    }

    // Belt/sash
    if (opts.belt === 'sash') {
      const sashLen = (m.waist || 28) * 3 + 20;
      pieces.push({ id: 'sash', name: 'Self-Fabric Sash', instruction: `Cut 2 on bias (or straight) · Each piece ${fmtInches(sashLen / 2)} long × 4″ cut (2″ finished) · Sew end-to-end for full sash`, dimensions: { length: sashLen / 2, width: 4 }, type: 'pocket' });
      pieces.push({ id: 'sash-loop', name: 'Belt Loops', instruction: 'Cut 4 · Each 1″ wide × 2″ long · Position at side seams and slightly toward CB', dimensions: { length: 2, width: 1 }, type: 'pocket' });
    } else if (opts.belt === 'belt') {
      const beltLen = (m.waist || 28) + 10;
      pieces.push({ id: 'belt', name: 'Structured Belt', instruction: `Cut 2 (self + interfacing) · ${fmtInches(beltLen)} long × 3.5″ cut (1.75″ finished) · Interface · Taper ends · Add D-rings or buckle`, dimensions: { length: beltLen, width: 3.5 }, type: 'pocket' });
    }

    return pieces;
  },

  materials(m, opts) {
    const notions = [
      { ref: 'interfacing-medium', quantity: opts.collar === 'point' ? '0.75 yard' : '0.5 yard' },
      { name: `Buttons ¾″`, quantity: `${parseInt(opts.buttonCount) + 2} (dress front + cuffs)`, notes: `Womenswear: buttons on left front, buttonholes on right` },
    ];

    if (opts.sleeve === 'roll') {
      notions.push({ name: 'Small buttons', quantity: '2', notes: 'Sleeve roll-up tab buttons' });
    }

    return buildMaterialsSpec({
      fabrics: ['cotton-chambray', 'cotton-poplin', 'cotton-lawn', 'linen-light', 'rayon-challis'],
      notions,
      thread: 'poly-all',
      needle: 'universal-75',
      stitches: ['straight-2.5', 'zigzag-small'],
      notes: [
        'Stay-stitch neckline and waist seam immediately after cutting — both bias areas will stretch before assembly',
        'Womenswear convention: buttons attach on LEFT front, buttonholes on RIGHT front (as worn)',
        opts.skirtShape === 'gathered' ? 'Gather skirt waist: two rows of long basting stitch, draw up bobbin threads evenly, pin to bodice waist, stitch' : 'Stay-stitch skirt waist edge before attaching to bodice to prevent stretching',
        opts.bustDart === 'yes' ? 'Bust dart: fold RS together, sew side seam to apex, press downward' : '',
        opts.belt !== 'none' ? 'Belt loops: fold strip in thirds lengthwise, edgestitch both long edges, cut to 2″ sections' : '',
        'French seams for side seams give a clean interior — worth doing on lighter fabrics',
      ].filter(Boolean),
    });
  },

  instructions(m, opts) {
    const steps = [];
    let n = 1;

    if (opts.bustDart === 'yes') {
      steps.push({ step: n++, title: 'Sew bust darts', detail: 'Fold front RS together at dart. Sew from side seam to apex tapering to nothing. Press downward.' });
    }
    steps.push({ step: n++, title: 'Sew shoulder seams', detail: 'Join front bodice pieces to back bodice at shoulders (RST). Press toward back.' });

    if (opts.collar === 'point') {
      steps.push({ step: n++, title: 'Attach collar', detail: 'Sew stand pieces together at ends (RST), turn. Sew collar leaf pieces RS together around outer edge, turn, press. Sandwich leaf between stand layers. Topstitch all edges. Sew finished collar to neckline (RST) starting at CF. Press. Edgestitch.' });
    } else if (opts.collar === 'camp') {
      steps.push({ step: n++, title: 'Attach revere collar', detail: 'Interface collar. Sew outer and inner pieces RS together at long edges and ends. Turn, press. Sew to neckline (RST). Fold collar back to create lapel at CF. Understitch inner edge. Topstitch.' });
    } else {
      steps.push({ step: n++, title: 'Attach band collar', detail: 'Interface. Sew collar band pieces RS together at ends and one long edge. Turn. Sew to neckline (RST). Fold over SA, topstitch or slipstitch inner edge.' });
    }

    steps.push({ step: n++, title: 'Finish front placket and facing', detail: 'Interface facing. Attach facing to CF edges of both front panels. Fold back, press, understitch. Mark button/buttonhole positions evenly spaced. Make buttonholes on right front. Sew buttons to left front.' });

    if (opts.sleeve !== 'sleeveless') {
      steps.push({ step: n++, title: 'Set sleeves', detail: 'Pin sleeve cap center to shoulder seam. Sew sleeve to armhole (RST). Press SA toward sleeve. Serge or zigzag SA.' });
      steps.push({ step: n++, title: 'Sew side and sleeve seams', detail: 'Sew front to back continuously from bodice hem through underarm to sleeve hem. Press open.' });
    } else {
      steps.push({ step: n++, title: 'Attach armhole facings', detail: 'Join facing pieces at shoulder and side. Interface. Sew to armhole (RST). Clip, understitch, press to WS.' });
      steps.push({ step: n++, title: 'Sew side seams', detail: 'Sew front to back at both side seams (RST). Press open.' });
    }

    steps.push({ step: n++, title: 'Attach skirt to bodice', detail: `Join skirt to bodice at waist (RST).${opts.skirtShape === 'gathered' ? ' Gather skirt first to match bodice waist width.' : ''} Serge SA together. Press SA upward.` });

    if (opts.belt !== 'none') {
      steps.push({ step: n++, title: 'Attach belt loops', detail: 'Fold strips into belt loops. Sew to side seams and slightly toward CB at waist seam level. Fold under top and bottom raw ends before attaching.' });
    }

    steps.push({ step: n++, title: 'Hem', detail: 'Hang dress 24 hours. Mark hem level. Fold up twice, press, topstitch or slipstitch.' });
    steps.push({ step: n++, title: 'Finish', detail: 'Press entire dress. Check collar lies flat. Check buttonhole placement aligns with buttons.' });

    return steps;
  },
};
