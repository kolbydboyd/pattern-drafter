/**
 * Fitted Tee (Womenswear) — knit tee with womenswear shaping.
 * Less ease (+2 default), scoop neck default, optional bust dart, hem band option.
 * Neckband at 80% of neckline circumference for a snug knit fit.
 */

import {
  armholeCurve, shoulderSlope, necklineCurve, sleeveCapCurve,
  armholeDepthFromChest, chestEaseDistribution, neckWidthFromCircumference, UPPER_EASE,
} from '../engine/upper-body.js';
import { sampleBezier, fmtInches } from '../engine/geometry.js';
import { buildMaterialsSpec } from '../engine/materials.js';

const SLEEVE_LENGTHS = { short: 7, cap: 3, three_quarter: 17, long: 24 };

const NECK_DEPTHS = {
  crew:  { front: 2.0, back: 0.75 },
  scoop: { front: 5.0, back: 0.75 },
  vneck: { front: 8.0, back: 0.75 },
  boat:  { front: 1.0, back: 0.75 },
};

export default {
  id: 'fitted-tee-w',
  name: 'Fitted Tee (W)',
  category: 'tops',
  measurements: ['chest', 'shoulder', 'neck', 'sleeveLength', 'bicep', 'torsoLength'],
  measurementDefaults: { sleeveLength: 7 },

  options: {
    neckline: {
      type: 'select', label: 'Neckline',
      values: [
        { value: 'scoop', label: 'Scoop (default)'       },
        { value: 'crew',  label: 'Crew'                  },
        { value: 'vneck', label: 'V-neck'                },
        { value: 'boat',  label: 'Wide crew / boat neck' },
      ],
      default: 'scoop',
    },
    fit: {
      type: 'select', label: 'Fit',
      values: [
        { value: 'fitted',   label: 'Fitted (+2″)',   reference: 'fitted, tailored' },
        { value: 'relaxed',  label: 'Relaxed (+4″)',  reference: 'skater, workwear' },
      ],
      default: 'fitted',
    },
    sleeve: {
      type: 'select', label: 'Sleeve',
      values: [
        { value: 'short',         label: 'Short (7″)'     },
        { value: 'cap',           label: 'Cap (3″)'       },
        { value: 'three_quarter', label: '¾ length (17″)' },
        { value: 'long',          label: 'Long (24″)'     },
      ],
      default: 'short',
    },
    bustDart: {
      type: 'select', label: 'Bust dart',
      values: [
        { value: 'no',  label: 'No (knit stretches to fit)' },
        { value: 'yes', label: 'Yes (horizontal side dart)'  },
      ],
      default: 'no',
    },
    hemStyle: {
      type: 'select', label: 'Hem',
      values: [
        { value: 'straight',  label: 'Straight (twin needle)' },
        { value: 'shirttail', label: 'Shirttail curve'        },
        { value: 'banded',    label: 'Rib hem band'           },
      ],
      default: 'straight',
    },
    length: {
      type: 'select', label: 'Length',
      values: [
        { value: 'regular', label: 'Regular (+1″)'    },
        { value: 'cropped', label: 'Cropped (−2″)'    },
        { value: 'tunic',   label: 'Tunic (+5″)'      },
      ],
      default: 'regular',
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
        { value: 1,    label: '1″'             },
      ],
      default: 0.75,
    },
  },

  pieces(m, opts) {
    const sa  = parseFloat(opts.sa);
    const hem = parseFloat(opts.hem);

    const easeVal = opts.fit === 'relaxed' ? 4 : 2;
    const { front: frontEase, back: backEase } = chestEaseDistribution(easeVal);
    const frontW = m.chest / 4 + frontEase / 2;
    const backW  = m.chest / 4 + backEase  / 2;

    const neckW        = neckWidthFromCircumference(m.neck);
    const shoulderW    = m.shoulder / 2 - neckW;
    const slopeDrop    = 1.5;
    const armholeDepth = armholeDepthFromChest(m.chest, 'standard');
    const chestDepth   = frontW * 0.35;
    const neckDepths   = NECK_DEPTHS[opts.neckline] ?? NECK_DEPTHS.scoop;
    const lengthAdj    = opts.length === 'cropped' ? -2 : opts.length === 'tunic' ? 5 : 1;
    const torsoLen     = m.torsoLength + lengthAdj;
    const slvLen       = SLEEVE_LENGTHS[opts.sleeve] ?? 7;
    const shoulderPtX  = neckW + shoulderW;
    const shoulderPtY  = slopeDrop;

    function sc(cp, steps = 12) { return sampleBezier(cp.p0, cp.p1, cp.p2, cp.p3, steps); }
    function pp(poly) { let d = `M ${poly[0].x.toFixed(2)} ${poly[0].y.toFixed(2)}`; for (let i=1;i<poly.length;i++) d+=` L ${poly[i].x.toFixed(2)} ${poly[i].y.toFixed(2)}`; return d+' Z'; }
    function bb(poly) { const xs=poly.map(p=>p.x),ys=poly.map(p=>p.y); return {maxX:Math.max(...xs),maxY:Math.max(...ys)}; }

    const neckStyleKey = opts.neckline === 'vneck' ? 'v-neck' : opts.neckline === 'scoop' ? 'scoop' : opts.neckline === 'boat' ? 'boat' : 'crew';
    const frontNeckPts = sc(necklineCurve(neckW, neckDepths.front, neckStyleKey));
    const backNeckPts  = sc(necklineCurve(neckW, neckDepths.back, 'crew'));
    const shoulderPts  = sc(shoulderSlope(shoulderW, slopeDrop));
    const frontArmPts  = sc(armholeCurve(shoulderW, chestDepth, armholeDepth, false));
    const backArmPts   = sc(armholeCurve(shoulderW, chestDepth * 0.95, armholeDepth, true));

    function buildBody(isBack, neckPts, armPts, neckDepth, sideX) {
      const poly = [];
      [...neckPts].reverse().forEach(p => poly.push({ x: neckW - p.x, y: neckDepth - p.y }));
      for (let i=1;i<shoulderPts.length;i++) poly.push({ x: neckW + shoulderPts[i].x, y: shoulderPts[i].y });
      for (let i=1;i<armPts.length;i++) poly.push({ x: shoulderPtX + armPts[i].x, y: shoulderPtY + armPts[i].y });
      if (opts.hemStyle === 'shirttail' && !isBack) {
        poly.push({ x: sideX, y: torsoLen });
        poly.push({ x: neckW * 0.5, y: torsoLen + 1.0 });
      } else {
        poly.push({ x: sideX, y: torsoLen });
      }
      poly.push({ x: 0, y: torsoLen });
      poly.push({ x: 0, y: neckDepth });
      return poly;
    }

    const frontPoly = buildBody(false, frontNeckPts, frontArmPts, neckDepths.front, shoulderPtX + chestDepth);
    const backPoly  = buildBody(true,  backNeckPts,  backArmPts,  neckDepths.back,  shoulderPtX + chestDepth * 0.95);

    // Sleeve
    const sleeveEase = easeVal * 0.2;
    const slvWidth   = m.bicep / 2 + sleeveEase;
    const capHeight  = opts.sleeve === 'cap' ? 0 : 5.0;
    let sleevePoly;
    if (opts.sleeve === 'cap') {
      sleevePoly = [{ x:0, y:0 }, { x:slvWidth*2, y:0 }, { x:slvWidth*2, y:slvLen }, { x:0, y:slvLen }];
    } else {
      const capCp  = sleeveCapCurve(m.bicep, capHeight, slvWidth * 2);
      const capPts = sampleBezier(capCp.p0, capCp.p1, capCp.p2, capCp.p3, 16);
      sleevePoly = capPts.map(p => ({ x: p.x, y: p.y + capHeight }));
      sleevePoly.push({ x: slvWidth * 2, y: capHeight + slvLen });
      sleevePoly.push({ x: 0, y: capHeight + slvLen });
    }

    const nbLen = m.neck * 0.80; // 80% — slightly tighter for womenswear
    const frontBB = bb(frontPoly), backBB = bb(backPoly), slvBB = bb(sleevePoly);

    const pieces = [
      {
        id: 'bodice-front', name: 'Front Body',
        instruction: `Cut 1 on fold (CF)${opts.bustDart === 'yes' ? ' · Horizontal bust dart at side seam' : ''}`,
        type: 'bodice', polygon: frontPoly, path: pp(frontPoly),
        width: frontBB.maxX, height: frontBB.maxY, isBack: false, sa, hem,
        dims: [{ label: fmtInches(frontW) + ' half width', x1: 0, y1: -0.5, x2: frontW, y2: -0.5, type: 'h' }],
      },
      {
        id: 'bodice-back', name: 'Back Body',
        instruction: 'Cut 1 on fold (CB)',
        type: 'bodice', polygon: backPoly, path: pp(backPoly),
        width: backBB.maxX, height: backBB.maxY, isBack: true, sa, hem,
        dims: [{ label: fmtInches(backW) + ' half width', x1: 0, y1: -0.5, x2: backW, y2: -0.5, type: 'h' }],
      },
      {
        id: 'sleeve', name: 'Sleeve',
        instruction: `Cut 2 (mirror L & R) · ${opts.sleeve} sleeve`,
        type: 'sleeve', polygon: sleevePoly, path: pp(sleevePoly),
        width: slvBB.maxX, height: slvBB.maxY, capHeight, sleeveLength: slvLen, sleeveWidth: slvWidth * 2, sa, hem,
        dims: [{ label: fmtInches(slvWidth * 2) + ' underarm', x1: 0, y1: (opts.sleeve==='cap' ? 0 : capHeight) + 0.4, x2: slvWidth * 2, y2: (opts.sleeve==='cap' ? 0 : capHeight) + 0.4, type: 'h' }],
      },
      { id: 'neckband', name: 'Neckband (rib)', instruction: `Cut 1 from rib knit on fold · ${fmtInches(nbLen)} long × 2.5″ cut (1.25″ finished) · 80% of neck opening`, dimensions: { length: nbLen, width: 2.5 }, type: 'rectangle', sa },
    ];

    if (opts.hemStyle === 'banded') {
      const hemCirc = (frontW + backW) * 2;
      pieces.push({ id: 'hem-band', name: 'Hem Band (rib)', instruction: `Cut 1 from rib knit on fold · ${fmtInches(hemCirc * 0.9)} long × 3″ cut (1.5″ finished) · 90% of hem circumference`, dimensions: { length: hemCirc * 0.9, width: 3 }, type: 'rectangle', sa });
    }

    return pieces;
  },

  materials(m, opts) {
    return buildMaterialsSpec({
      fabrics: ['cotton-jersey', 'cotton-modal', 'bamboo-jersey'],
      notions: [
        { name: 'Rib knit', quantity: opts.hemStyle === 'banded' ? '0.5 yard' : '0.25 yard', notes: 'For neckband (and hem band if applicable)' },
      ],
      thread: 'poly-all',
      needle: 'ballpoint-75',
      stitches: ['stretch', 'overlock', 'coverstitch', 'zigzag-med'],
      notes: [
        'Ballpoint 75/11 or 80/12 — prevents snags on fine jersey',
        'Stretch stitch or serger for all seams — no straight stitch',
        'Neckband at 80% of neckline opening: slightly snugger than unisex tee for a clean, flat finish',
        opts.bustDart === 'yes' ? 'Bust dart on knit: fold RS together, sew from side seam toward bust apex — knit does not ravel so no need to clip' : 'Knit stretches to accommodate shape — bust darts optional on fitted styles',
        'Twin needle hem from RS — creates two parallel rows of topstitch; or use coverstitch machine',
        'Pre-wash jersey: cotton knits shrink 3–5%',
      ].filter(Boolean),
    });
  },

  instructions(m, opts) {
    const steps = [];
    let n = 1;
    if (opts.bustDart === 'yes') {
      steps.push({ step: n++, title: 'Sew bust darts', detail: 'Fold front RS together along dart. Sew from side seam to apex tapering to nothing. Press downward. Knit does not need clipping.' });
    }
    steps.push({ step: n++, title: 'Sew shoulder seams', detail: 'Join front to back at shoulders (RST). Stretch stitch or serge. Press toward back.' });
    steps.push({ step: n++, title: 'Attach neckband', detail: 'Fold neckband in half lengthwise (WST). Divide into 4 equal sections; pin to neckline. Stretch band to match opening. Stretch stitch or serge. Press toward bodice.' });
    if (opts.sleeve !== 'cap') {
      steps.push({ step: n++, title: 'Set sleeves', detail: 'Pin sleeve cap center to shoulder seam. Divide into quarters, pin. Ease cap to fit. Stretch stitch or serge. Press toward sleeve.' });
    } else {
      steps.push({ step: n++, title: 'Attach cap sleeves', detail: 'Pin straight edge of cap sleeve to armhole (RST). Stretch stitch or serge. Press toward sleeve.' });
    }
    steps.push({ step: n++, title: 'Sew side and sleeve seams', detail: 'Sew front to back continuously from hem through underarm to sleeve hem. Stretch stitch or serge. Press toward back.' });
    if (opts.hemStyle === 'banded') {
      steps.push({ step: n++, title: 'Attach hem band', detail: 'Fold hem band in half (WST). Divide into quarters, pin to body hem. Stretch to fit. Stretch stitch or serge.' });
    } else {
      steps.push({ step: n++, title: 'Hem body and sleeves', detail: `Fold hem up ${fmtInches(parseFloat(opts.hem))}${opts.hemStyle === 'shirttail' ? ' — clip curves at sides' : ''}. Twin needle from RS in one pass. Or serge edge and fold.` });
    }
    steps.push({ step: n++, title: 'Finish', detail: 'Press lightly. Neckband should lie flat and not gap.' });
    return steps;
  },
};
