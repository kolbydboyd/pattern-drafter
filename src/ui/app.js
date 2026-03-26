/**
 * Main application — wires garment modules to the UI.
 * All imports are static/top-level. No dynamic imports needed.
 */

import { MEASUREMENTS, OPTIONAL_MEASUREMENTS } from '../engine/measurements.js';
import { fmtInches, easeDistribution } from '../engine/geometry.js';
import cargoShorts      from '../garments/cargo-shorts.js';
import gymShorts        from '../garments/gym-shorts.js';
import swimTrunks       from '../garments/swim-trunks.js';
import pleatedShorts    from '../garments/pleated-shorts.js';
import straightJeans    from '../garments/straight-jeans.js';
import chinos           from '../garments/chinos.js';
import pleatedTrousers  from '../garments/pleated-trousers.js';
import sweatpants       from '../garments/sweatpants.js';
import tee              from '../garments/tee.js';
import campShirt        from '../garments/camp-shirt.js';
import crewneck         from '../garments/crewneck.js';
import hoodie           from '../garments/hoodie.js';
import cropJacket       from '../garments/crop-jacket.js';
import wideLegTrouserW  from '../garments/wide-leg-trouser-w.js';
import straightTrouserW from '../garments/straight-trouser-w.js';
import easyPantW        from '../garments/easy-pant-w.js';
import buttonUpW        from '../garments/button-up-w.js';
import shellBlouseW     from '../garments/shell-blouse-w.js';
import fittedTeeW       from '../garments/fitted-tee-w.js';
import slipSkirtW       from '../garments/slip-skirt-w.js';
import aLineSkirtW      from '../garments/a-line-skirt-w.js';
import shirtDressW      from '../garments/shirt-dress-w.js';
import wrapDressW       from '../garments/wrap-dress-w.js';
import { renderPanelSVG, renderGenericPieceSVG } from './pattern-view.js';
import { generatePrintLayout } from '../pdf/print-layout.js';
import { renderMeasurementTeacher } from './measurement-teacher.js';

// ═══ GARMENT REGISTRY ═══
const GARMENTS = {
  'cargo-shorts':       cargoShorts,
  'gym-shorts':         gymShorts,
  'swim-trunks':        swimTrunks,
  'pleated-shorts':     pleatedShorts,
  'straight-jeans':     straightJeans,
  'chinos':             chinos,
  'pleated-trousers':   pleatedTrousers,
  'sweatpants':         sweatpants,
  'tee':                tee,
  'camp-shirt':         campShirt,
  'crewneck':           crewneck,
  'hoodie':             hoodie,
  'crop-jacket':        cropJacket,
  'wide-leg-trouser-w': wideLegTrouserW,
  'straight-trouser-w': straightTrouserW,
  'easy-pant-w':        easyPantW,
  'button-up-w':        buttonUpW,
  'shell-blouse-w':     shellBlouseW,
  'fitted-tee-w':       fittedTeeW,
  'slip-skirt-w':       slipSkirtW,
  'a-line-skirt-w':     aLineSkirtW,
  'shirt-dress-w':      shirtDressW,
  'wrap-dress-w':       wrapDressW,
};

let currentGarment = 'cargo-shorts';

// ═══ OPTIONAL MEASUREMENT RELEVANCE ═══
function relevantOptionalIds(garment) {
  const has = id => garment.measurements.includes(id);
  const ids = [];
  if (has('thigh'))                      { ids.push('calf', 'ankle'); }
  if (has('inseam') || has('hip'))       { ids.push('outseam'); }
  if (has('hip'))                        { ids.push('seatDepth'); }
  if (has('shoulder'))                   { ids.push('crossBack'); }
  if (has('sleeveLength') || has('bicep')) { ids.push('armToElbow'); }
  return [...new Set(ids)];
}

// ═══ MEASUREMENT PROFILES ═══
const PROFILES_KEY = 'pd-profiles';

function loadProfiles() {
  try { return JSON.parse(localStorage.getItem(PROFILES_KEY)) || []; }
  catch { return []; }
}

function saveCurrentProfile() {
  const name = prompt('Profile name:')?.trim();
  if (!name) return;
  const g = GARMENTS[currentGarment];
  const m = {};
  for (const mId of g.measurements) {
    m[mId] = parseFloat(document.getElementById(`m-${mId}`)?.value) || 0;
  }
  for (const mId of relevantOptionalIds(g)) {
    const el = document.getElementById(`m-${mId}`);
    if (!el) continue;
    const raw = el.value.trim();
    if (raw !== '') { const v = parseFloat(raw); if (!isNaN(v) && v > 0) m[mId] = v; }
  }
  const profiles = loadProfiles().filter(p => p.name !== name);
  profiles.push({ name, ...m });
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  buildInputs(); // re-render to update dropdown
}

function deleteCurrentProfile() {
  const sel = document.getElementById('profile-select');
  const name = sel?.value;
  if (!name) return;
  const profiles = loadProfiles().filter(p => p.name !== name);
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  buildInputs();
}

function applyProfile(name) {
  const profile = loadProfiles().find(p => p.name === name);
  if (!profile) return;
  for (const [key, val] of Object.entries(profile)) {
    if (key === 'name') continue;
    const el = document.getElementById(`m-${key}`);
    if (el) el.value = val;
  }
  generate();
}

// ═══ BUILD INPUT PANEL ═══
function buildInputs() {
  const g = GARMENTS[currentGarment];
  const panel = document.getElementById('input-panel');
  let html = '';

  // Garment selector
  html += `<h2>Garment</h2>
    <div class="f"><select id="garment-select">
      ${Object.values(GARMENTS).map(gr =>
        `<option value="${gr.id}" ${gr.id === currentGarment ? 'selected' : ''}>${gr.name}${gr.difficulty ? ' · ' + gr.difficulty : ''}</option>`
      ).join('')}
    </select></div>`;

  // "How to measure" toggle
  html += `<button class="btn-s" id="how-to-measure-btn" style="margin-bottom:6px">How to measure ▾</button>
    <div id="mt-guide-container" style="display:none"></div>`;

  // Body measurements + profile selector
  const profiles = loadProfiles();
  const profileOptions = profiles.map(p =>
    `<option value="${p.name}">${p.name}</option>`
  ).join('');
  html += `<h2>Body</h2><p class="sd">Flexible tape over underwear. Don't pull tight.</p>
    <div class="f profile-row">
      <select id="profile-select" title="Load saved profile">
        <option value="">— saved profiles —</option>
        ${profileOptions}
      </select>
      <button class="btn-xs" id="save-profile-btn" title="Save current measurements">Save</button>
      <button class="btn-xs btn-xs-del" id="del-profile-btn" title="Delete selected profile">&times;</button>
    </div>`;
  for (const mId of g.measurements) {
    const mDef = MEASUREMENTS[mId];
    if (!mDef) continue;
    const mDefault = g.measurementDefaults?.[mId] ?? mDef.default;
    html += `<div class="f"><label>${mDef.label}</label>
      <div class="hint">${mDef.instruction}</div>
      <input type="number" id="m-${mId}" value="${mDefault}" step="${mDef.step}"></div>`;
  }

  // Advanced (optional) measurements
  const optIds = relevantOptionalIds(g);
  if (optIds.length) {
    html += `<details class="adv-meas"><summary>Advanced Measurements</summary>
      <p class="adv-hint">Leave blank to use calculated defaults. Fill in for more accurate shaping.</p>`;
    for (const mId of optIds) {
      const mDef = OPTIONAL_MEASUREMENTS[mId];
      if (!mDef) continue;
      html += `<div class="f"><label>${mDef.label}</label>
        <div class="hint">${mDef.instruction}</div>
        <input type="number" id="m-${mId}" value="" placeholder="optional" step="${mDef.step}" min="${mDef.min}" max="${mDef.max}"></div>`;
    }
    html += `</details>`;
  }

  // Options
  html += `<hr class="dv"><h2>Options</h2>`;
  for (const [key, opt] of Object.entries(g.options)) {
    if (opt.type === 'select') {
      html += `<div class="f"><label>${opt.label}</label><select id="o-${key}">
        ${opt.values.map(v =>
          `<option value="${v.value}" ${v.value == opt.default ? 'selected' : ''}>${v.label}${v.reference ? ` · ${v.reference}` : ''}</option>`
        ).join('')}
      </select></div>`;
    } else if (opt.type === 'number') {
      html += `<div class="f"><label>${opt.label}</label>
        <input type="number" id="o-${key}" value="${opt.default}" step="${opt.step || 0.25}"></div>`;
    }
  }

  html += `<hr class="dv">
    <button class="btn" id="gen-btn">Generate Pattern</button>
    <button class="btn-s" id="export-btn">Export SVGs</button>
    <button class="btn-s" id="print-btn">Print Pattern</button>
    <button class="btn-s" id="reset-btn">Reset to Defaults</button>`;

  panel.innerHTML = html;

  // Rise style auto-fill
  const riseStyleEl    = document.getElementById('o-riseStyle');
  const riseOverrideEl = document.getElementById('o-riseOverride');
  if (riseStyleEl && riseOverrideEl) {
    const RISE_OFFSETS = { 'ultra-low': -2.5, low: -1.5, mid: 0, high: 1.5, 'ultra-high': 3.0 };
    const updateRiseOverride = () => {
      const bodyRise = parseFloat(document.getElementById('m-rise')?.value) || 10;
      const offset   = RISE_OFFSETS[riseStyleEl.value] ?? 0;
      riseOverrideEl.value = (bodyRise + offset).toFixed(2);
    };
    riseStyleEl.addEventListener('change', updateRiseOverride);
    document.getElementById('m-rise')?.addEventListener('input', updateRiseOverride);
    updateRiseOverride();
  }

  // Event listeners
  document.getElementById('gen-btn').addEventListener('click', generate);
  document.getElementById('export-btn').addEventListener('click', exportSVG);
  document.getElementById('print-btn').addEventListener('click', printPattern);
  document.getElementById('reset-btn').addEventListener('click', resetToDefaults);
  document.getElementById('save-profile-btn').addEventListener('click', saveCurrentProfile);
  document.getElementById('del-profile-btn').addEventListener('click', deleteCurrentProfile);
  document.getElementById('profile-select').addEventListener('change', e => {
    if (e.target.value) applyProfile(e.target.value);
  });
  document.getElementById('garment-select').addEventListener('change', e => {
    currentGarment = e.target.value;
    buildInputs();
    generate();
  });
  document.getElementById('how-to-measure-btn').addEventListener('click', () => {
    const container = document.getElementById('mt-guide-container');
    const btn = document.getElementById('how-to-measure-btn');
    const isHidden = container.style.display === 'none';
    if (isHidden) {
      const g = GARMENTS[currentGarment];
      container.innerHTML = renderMeasurementTeacher(g.measurements);
      container.style.display = '';
      btn.textContent = 'How to measure ▴';
    } else {
      container.style.display = 'none';
      btn.textContent = 'How to measure ▾';
    }
  });
}

// ═══ READ INPUTS ═══
function readInputs() {
  const g = GARMENTS[currentGarment];
  const m = {};
  for (const mId of g.measurements) {
    m[mId] = parseFloat(document.getElementById(`m-${mId}`)?.value) || 0;
  }
  // Optional measurements — only include when the user actually entered a value
  for (const mId of relevantOptionalIds(g)) {
    const el = document.getElementById(`m-${mId}`);
    if (!el) continue;
    const raw = el.value.trim();
    if (raw !== '') {
      const v = parseFloat(raw);
      if (!isNaN(v) && v > 0) m[mId] = v;
    }
  }
  const opts = {};
  for (const [key, opt] of Object.entries(g.options)) {
    const el = document.getElementById(`o-${key}`);
    if (!el) continue;
    if (opt.type === 'boolean') opts[key] = el.checked;
    else if (opt.type === 'number') opts[key] = parseFloat(el.value);
    else opts[key] = el.value;
  }
  return { m, opts };
}

// ═══ FABRIC CALCULATOR ═══
function extractCutCount(instruction) {
  const m = instruction?.match(/[Cc]ut\s+(\d+)/);
  return m ? parseInt(m[1]) : 2;
}

function calculateYardage(pieces, fabricWidthIn) {
  const GAP = 0.5;
  const instances = [];

  for (const p of pieces) {
    let w, h, count;
    if (p.type === 'panel') {
      w     = p.ext + p.width + (p.sa || 0.625) * 2;
      h     = p.height + (p.sa || 0.625) + (p.hem || 1);
      count = 2;
    } else if (p.type === 'rectangle') {
      const sa = p.sa || 0.625;
      w     = p.dimensions.length + sa * 2;
      h     = p.dimensions.width  + sa * 2;
      count = extractCutCount(p.instruction);
    } else if (p.type === 'bodice' || p.type === 'sleeve') {
      const sa = p.sa || 0.625;
      w     = (p.width  || 0) + sa * 2;
      h     = (p.height || 0) + sa * 2;
      count = extractCutCount(p.instruction);
    } else {
      w     = (p.dimensions?.width  || 0) + 0.625 * 2;
      h     = (p.dimensions?.height || 0) + 0.625 * 2;
      count = extractCutCount(p.instruction);
    }
    for (let i = 0; i < count; i++) instances.push({ w: w + GAP, h: h + GAP });
  }

  // Greedy row packing — sort tallest first for better utilisation
  instances.sort((a, b) => b.h - a.h);

  let totalLength = 0;
  let i = 0;
  while (i < instances.length) {
    let rowW = 0, rowH = 0;
    while (i < instances.length && rowW + instances[i].w <= fabricWidthIn) {
      rowW += instances[i].w;
      rowH  = Math.max(rowH, instances[i].h);
      i++;
    }
    if (rowH === 0 && i < instances.length) { rowH = instances[i].h; i++; } // wider than fabric
    totalLength += rowH;
  }

  // +10% buffer, round up to nearest ⅛ yard
  const yards = (totalLength * 1.1) / 36;
  return Math.ceil(yards * 8) / 8;
}

// ═══ RENDER MATERIALS ═══
function renderMaterials(mat, yardage45, yardage60) {
  let html = `<div class="mat"><h4>Materials & Stitch Guide</h4>`;

  html += `<div class="mat-section"><h5>Fabric Options</h5>`;
  for (const f of mat.fabrics) {
    if (!f?.name) continue;
    html += `<div class="mat-row">${f.name} <span class="note">(${f.weight})</span>${f.notes ? ` — <span class="note">${f.notes}</span>` : ''}</div>`;
  }
  html += `</div>`;

  html += `<div class="mat-section"><h5>Notions</h5>`;
  for (const n of mat.notions) {
    if (!n?.name) continue;
    html += `<div class="mat-row">${n.name}${n.quantity ? ` — <span class="qty">${n.quantity}</span>` : ''}${n.notes ? ` <span class="note">(${n.notes})</span>` : ''}</div>`;
  }
  html += `</div>`;

  html += `<div class="mat-section"><h5>Thread & Needle</h5>
    <div class="mat-row">Thread: ${mat.thread?.name ?? 'Polyester all-purpose'} (${mat.thread?.weight ?? '40wt'}) — <span class="note">${mat.thread?.notes ?? ''}</span></div>
    <div class="mat-row">Needle: ${mat.needle?.name ?? String(mat.needle ?? 'Universal')} — <span class="note">${mat.needle?.use ?? ''}</span></div>
  </div>`;

  html += `<div class="mat-section"><h5>Stitch Settings</h5>`;
  for (const s of mat.stitches) {
    if (!s?.name) continue;
    html += `<span class="mat-stitch">${s.name} ${s.length}${s.width !== '0' ? ' w:' + s.width : ''} — ${s.use}</span>`;
  }
  html += `</div>`;

  if (mat.notes?.length) {
    html += `<div class="mat-section"><h5>Important Notes</h5>`;
    for (const n of mat.notes) html += `<div class="mat-row">• ${n}</div>`;
    html += `</div>`;
  }

  if (yardage45 !== undefined) {
    html += `<div class="mat-section mat-yardage">
      <h5>Estimated Yardage</h5>
      <div class="mat-row yard-row">
        <span class="yard-val">${yardage45} yd</span><span class="note"> of 45″ fabric</span>
      </div>
      <div class="mat-row yard-row">
        <span class="yard-val">${yardage60} yd</span><span class="note"> of 58–60″ fabric</span>
      </div>
      <div class="mat-row"><span class="note">Includes 10% buffer. Add extra for pattern matching, nap, or large prints.</span></div>
    </div>`;
  }

  html += `</div>`;
  return html;
}

// ═══ JARGON EXPANSION ═══
function expandJargon(steps) {
  const seen = new Set();
  const JARGON = [
    { key: 'rst',         rx: /\bRST\b/,                           fn: () => 'right sides together (RST — good sides of fabric facing each other)' },
    { key: 'press',       rx: /\b([Pp]ress(?:ed|ing)?)\b(?!\s+cloth)/,  fn: (_, c) => `${c} with iron (don't slide; press straight down and lift)` },
    { key: 'baste',       rx: /\b([Bb]aste[ds]?|[Bb]asting)\b/,    fn: (_, c) => `${c} (temporary long stitch to hold in place)` },
    { key: 'understitch', rx: /\b([Uu]nderstitch(?:ed|ing)?)\b/,    fn: (_, c) => `${c} (sew the seam allowance to the facing close to the seam so it rolls inward)` },
    { key: 'topstitch',   rx: /\b([Tt]opstitch(?:ed|ing)?)\b/,      fn: (_, c) => `${c} (visible stitch on the outside of the garment)` },
    { key: 'sa',          rx: /\bSA\b/,                             fn: () => 'seam allowance (SA)' },
    { key: 'bodkin',      rx: /\b([Bb]odkin)\b/,                    fn: (_, c) => `${c} (or large safety pin)` },
    { key: 'clipcurve',   rx: /[Cc]lip (?:the )?curve/,             fn: () => 'clip the curve (cut small snips into the seam allowance so it lies flat around curves — don\'t cut through the stitching)' },
    { key: 'bartack',     rx: /[Bb]ar[ -]?tack/,                    fn: () => 'bar tack (tight zigzag reinforcement stitch at stress points)' },
    { key: 'fellseam',    rx: /flat-?fell(?:ed)? seam|fell(?:ed)? seam/i, fn: () => 'flat-felled seam (seam enclosed on itself for durability, like on jeans)' },
    { key: 'serger',      rx: /\b([Ss]erger)\b/,                    fn: (_, c) => `${c}/overlocker (or use zigzag stitch if you don't have one)` },
    { key: 'serge',       rx: /\b([Ss]erged?)\b/,                   fn: (_, c) => `${c} (or zigzag stitch)` },
  ];

  return steps.map(s => {
    let detail = s.detail;
    for (const { key, rx, fn } of JARGON) {
      if (!seen.has(key)) {
        const next = detail.replace(rx, (...args) => { seen.add(key); return fn(...args); });
        detail = next;
      }
    }
    return { ...s, detail };
  });
}

// ═══ RENDER INSTRUCTIONS ═══
function renderInstructions(steps) {
  let html = '';
  for (const s of steps) {
    html += `<div class="instr-step"><span class="num">${s.step}.</span> <span class="ttl">${s.title}</span> — <span class="dtl">${s.detail}</span></div>`;
  }
  return html;
}

// ═══ RESET TO DEFAULTS ═══
function resetToDefaults() {
  if (!confirm('Reset all measurements and options to defaults?')) return;
  const g = GARMENTS[currentGarment];
  for (const mId of g.measurements) {
    const mDef = MEASUREMENTS[mId];
    if (!mDef) continue;
    const el = document.getElementById(`m-${mId}`);
    if (el) el.value = g.measurementDefaults?.[mId] ?? mDef.default;
  }
  for (const mId of relevantOptionalIds(g)) {
    const el = document.getElementById(`m-${mId}`);
    if (el) el.value = '';
  }
  for (const [key, opt] of Object.entries(g.options)) {
    const el = document.getElementById(`o-${key}`);
    if (el) el.value = opt.default;
  }
  generate();
}

// ═══ GENERATE ═══
function generate() {
  try {
    _generate();
  } catch (err) {
    console.error('generate() failed:', err);
    document.getElementById('output').innerHTML =
      `<div style="color:#c44;font-family:monospace;padding:20px;white-space:pre-wrap"><strong>Error generating pattern:</strong>\n${err.message}\n\nCheck the browser console (F12) for the full stack trace.</div>`;
  }
}
function _generate() {
  const g = GARMENTS[currentGarment];
  const { m, opts } = readInputs();

  const pieces = g.pieces(m, opts);
  const materials = g.materials(m, opts);
  const instructions = expandJargon(g.instructions(m, opts));

  const isLower = g.category === 'lower';
  const isUpper = !isLower;
  const overviewParts = isUpper
    ? [g.name, opts.fit ?? opts.ease, m.chest ? fmtInches(m.chest) + ' chest' : '', m.waist ? fmtInches(m.waist) + ' waist' : '', m.torsoLength ? fmtInches(m.torsoLength) + ' torso' : ''].filter(Boolean)
    : [g.name, opts.fit ?? opts.ease, fmtInches(m.waist) + ' W', fmtInches(m.hip) + ' H', m.rise ? fmtInches(m.rise) + ' rise' : '', m.inseam ? fmtInches(m.inseam) + ' inseam' : ''].filter(Boolean);
  const diffBadge = g.difficulty ? `<span class="diff-badge diff-${g.difficulty}">${g.difficulty}</span>` : '';
  let html = `<div class="oh">${diffBadge}${overviewParts.join(' · ')}</div>`;
  html += `<div class="po">`;

  // Pattern pieces
  for (const piece of pieces) {
    if (piece.type === 'panel') {
      const svg = renderPanelSVG(piece);
      html += `<div class="pc"><h3>${piece.name}</h3><div class="sub">${piece.instruction}</div>${svg}
        <table class="dt">
          <tr><td>Panel width</td><td>${fmtInches(piece.width)}</td></tr>
          <tr><td>Height</td><td>${fmtInches(piece.height)}</td></tr>
          <tr><td>Crotch ext</td><td>${fmtInches(piece.ext)}</td></tr>
          <tr><td>Cut size (w/ SA)</td><td>${fmtInches(piece.width + piece.ext + piece.sa * 2)} × ${fmtInches(piece.height + piece.sa + piece.hem)}</td></tr>
        </table></div>`;
    } else if (piece.type === 'bodice' || piece.type === 'sleeve') {
      const svg = renderGenericPieceSVG(piece);
      html += `<div class="pc"><h3>${piece.name}</h3><div class="sub">${piece.instruction}</div>${svg}
        <table class="dt">
          <tr><td>Width</td><td>${fmtInches(piece.width)}</td></tr>
          <tr><td>Height</td><td>${fmtInches(piece.height)}</td></tr>
          ${piece.type === 'sleeve' ? `<tr><td>Cap height</td><td>${fmtInches(piece.capHeight)}</td></tr>` : ''}
        </table></div>`;
    } else if (piece.type === 'rectangle') {
      html += `<div class="pc full"><h3>${piece.name}</h3><div class="sub">${piece.instruction}</div>
        <table class="dt" style="max-width:400px">
          <tr><td>Length</td><td>${fmtInches(piece.dimensions.length)}</td></tr>
          <tr><td>Width</td><td>${fmtInches(piece.dimensions.width)}</td></tr>
          <tr><td>Finished</td><td>${fmtInches(piece.dimensions.width / 2)}</td></tr>
        </table></div>`;
    } else if (piece.type === 'pocket') {
      const pd = piece.dimensions;
      const pSize = pd.length != null
        ? `${fmtInches(pd.length)} × ${fmtInches(pd.width)}`
        : `${fmtInches(pd.width)} × ${fmtInches(pd.height)}`;
      html += `<div class="pc sm"><h3>${piece.name}</h3><div class="sub">${piece.instruction}</div>
        <table class="dt">
          <tr><td>Size</td><td>${pSize}</td></tr>
        </table></div>`;
    }
  }

  // Fit check
  let fitCheckHtml = '';
  if (isUpper) {
    const frontP = pieces.find(p => p.id === 'bodice-front' || p.id === 'bodice-front-right');
    const chestCirc = frontP ? frontP.width * 4 : 0;
    fitCheckHtml = `<table class="dt" style="max-width:480px">
      ${m.chest ? `<tr><td>Chest (yours)</td><td>${fmtInches(m.chest)}</td></tr>
      <tr><td>Chest (pattern circ)</td><td>${fmtInches(chestCirc)}</td></tr>
      <tr><td>Chest ease</td><td>${fmtInches(chestCirc - m.chest)}</td></tr>` : ''}
      ${m.waist ? `<tr><td>Waist (yours)</td><td>${fmtInches(m.waist)}</td></tr>` : ''}
      ${m.hip ? `<tr><td>Hip (yours)</td><td>${fmtInches(m.hip)}</td></tr>` : ''}
    </table>`;
  } else {
    const fW = pieces.find(p => p.id === 'front')?.width || 0;
    const bW = pieces.find(p => p.id === 'back')?.width || 0;
    fitCheckHtml = `<table class="dt" style="max-width:480px">
      ${m.thigh ? `<tr><td>Thigh (yours)</td><td>${fmtInches(m.thigh)}</td></tr>
      <tr><td>Thigh (pattern circ)</td><td>${fmtInches((fW + bW) * 2)}</td></tr>
      <tr><td>Thigh ease</td><td>${fmtInches((fW + bW) * 2 - m.thigh)}</td></tr>` : ''}
      ${m.waist ? `<tr><td>Waist (yours)</td><td>${fmtInches(m.waist)}</td></tr>` : ''}
      ${m.hip ? `<tr><td>Hip (yours)</td><td>${fmtInches(m.hip)}</td></tr>` : ''}
    </table>`;
  }
  html += `<div class="pc full"><h3>Fit Check</h3><div class="sub">Verify before cutting</div>${fitCheckHtml}</div>`;

  // Materials
  const y45 = calculateYardage(pieces, 45);
  const y60 = calculateYardage(pieces, 60);
  html += `<div class="pc full"><h3>Materials & Stitch Guide</h3>
    <div class="sub">Everything you need — fabric, notions, needle, thread, stitch settings</div>
    ${renderMaterials(materials, y45, y60)}</div>`;

  // Construction
  html += `<div class="pc full"><h3>Construction Order</h3>
    <div class="sub">Read all steps before starting. Press every seam.</div>
    ${renderInstructions(instructions)}</div>`;

  html += `</div>`;
  document.getElementById('output').innerHTML = html;
}

// ═══ EXPORT ═══
function exportSVG() {
  const svgs = document.querySelectorAll('#output svg');
  if (!svgs.length) return alert('Generate first');
  svgs.forEach((s, i) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(s)], { type: 'image/svg+xml' }));
    a.download = `pattern-piece-${i + 1}.svg`;
    a.click();
  });
}

// ═══ PRINT ═══
function printPattern() {
  const g = GARMENTS[currentGarment];
  const { m, opts } = readInputs();

  // Paper size picker modal
  const SIZES = [
    { id: 'letter',  label: 'US Letter  8.5 × 11 in   (tiled)' },
    { id: 'a4',      label: 'A4         210 × 297 mm  (tiled)' },
    { id: 'tabloid', label: 'Tabloid    11 × 17 in    (tiled)' },
    { id: 'a0',      label: 'A0/Plotter 33.1 × 46.8 in (single sheet)' },
  ];

  // Build a tiny inline <dialog> for paper size selection
  let dlg = document.getElementById('print-size-dlg');
  if (!dlg) {
    dlg = document.createElement('dialog');
    dlg.id = 'print-size-dlg';
    dlg.style.cssText = 'font-family:IBM Plex Mono,monospace;font-size:13px;padding:1.2em 1.5em;border:1px solid #ccc;border-radius:6px;min-width:320px;box-shadow:0 4px 24px rgba(0,0,0,.18)';
    dlg.innerHTML = `<form method="dialog">
      <p style="font-weight:700;margin-bottom:.8em">Select paper size</p>
      ${SIZES.map(s => `<label style="display:block;margin:.35em 0;cursor:pointer">
        <input type="radio" name="ps" value="${s.id}" style="margin-right:.5em">${s.label}
      </label>`).join('')}
      <div style="margin-top:1em;display:flex;gap:.6em;justify-content:flex-end">
        <button value="cancel" style="padding:.3em .9em">Cancel</button>
        <button value="ok" style="padding:.3em .9em;font-weight:700">Print</button>
      </div>
    </form>`;
    document.body.appendChild(dlg);
    // Default selection
    dlg.querySelector('input[value="letter"]').checked = true;
  }

  dlg.returnValue = '';
  dlg.showModal();
  dlg.onclose = () => {
    if (dlg.returnValue !== 'ok') return;
    const paperSize = dlg.querySelector('input[name="ps"]:checked')?.value || 'letter';

    const pieces       = g.pieces(m, opts);
    const materials    = g.materials(m, opts);
    const instructions = g.instructions(m, opts);

    const html = generatePrintLayout(g, pieces, materials, instructions, m, opts, paperSize);

    const win = window.open('', '_blank');
    if (!win) { alert('Allow pop-ups to open the print layout.'); return; }
    win.document.open();
    win.document.write(html);
    win.document.close();
    win.addEventListener('load', () => win.print());
  };
}

// ═══ DARK MODE ═══
function applyTheme(dark) {
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  const btn = document.getElementById('theme-btn');
  if (btn) btn.textContent = dark ? 'Light' : 'Dark';
}

function toggleTheme() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const next = !isDark;
  localStorage.setItem('theme', next ? 'dark' : 'light');
  applyTheme(next);
}

// ═══ BOOT ═══
applyTheme(localStorage.getItem('theme') === 'dark');
document.getElementById('theme-btn')?.addEventListener('click', toggleTheme);
buildInputs();
setTimeout(generate, 50);
