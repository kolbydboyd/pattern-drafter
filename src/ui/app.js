// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
/**
 * Main application — wires garment modules to the UI.
 * All imports are static/top-level. No dynamic imports needed.
 */

import '../analytics.js';
import { trackEvent, initSiteTracking, initHeroABTest, initSocialProofABTest } from '../analytics.js';
import { renderMakesGallery } from './real-makes.js';
import { MEASUREMENTS, OPTIONAL_MEASUREMENTS } from '../engine/measurements.js';
import { fmtInches, sanitizePoly } from '../engine/geometry.js';
import { renderPanelSVG, renderGenericPieceSVG, addWatermark, removeWatermarks } from './pattern-view.js';
import { generatePrintLayout } from '../pdf/print-layout.js';
import { renderMeasurementTeacher } from './measurement-teacher.js';
import GARMENTS from '../garments/index.js';
import { initAuthModal, openAuthModal, getCurrentUser, onUserChange } from './auth-modal.js';
import { hasPurchased, saveMeasurementProfile, updateMeasurementProfile, updateProfileLastUsed, getMeasurementProfiles, logMeasurementDelta, getWishlist, addToWishlist, removeFromWishlist, getPurchases, getFreeCredits } from '../lib/db.js';
import { getRecommendations } from '../engine/recommendations.js';
import { expandGlossary, GLOSSARY } from '../engine/glossary.js';
import { PATTERN_PRICES } from '../lib/pricing.js';
import { getSession, signIn } from '../lib/auth.js';
import { checkAndSetAffiliateCookie } from '../lib/affiliate.js';

// Check for affiliate referral on every page load
checkAndSetAffiliateCookie();

// ── Beta mode ─────────────────────────────────────────────────────────────────
// When true: everyone gets free downloads via email gate. No purchase required.
// Set to false to enable paid downloads.
const BETA_MODE = false;

// ── URL sync ──────────────────────────────────────────────────────────────────
// Read ?garment= from the URL on load so direct links pre-select correctly
const _urlParams        = new URLSearchParams(location.search);
const _urlGarmentParam  = _urlParams.get('garment');
const _urlRedeemFlag    = _urlParams.get('redeem') === '1';
let currentGarment    = (_urlGarmentParam && GARMENTS[_urlGarmentParam]) ? _urlGarmentParam : 'cargo-shorts';

// ── Redemption code state (set by /redeem page, stored in sessionStorage) ────
let _redemptionCode       = sessionStorage.getItem('redemptionCode') || null;
let _redemptionGarment    = sessionStorage.getItem('redemptionGarment') || null;
let _redemptionGarmentName = sessionStorage.getItem('redemptionGarmentName') || null;
const _isRedemptionMode   = !!(_redemptionCode && _redemptionGarment && GARMENTS[_redemptionGarment]);

// If arriving from /redeem, lock to the redemption garment
if (_isRedemptionMode) {
  currentGarment = _redemptionGarment;
}

function _syncGarmentUrl(id) {
  window.history.replaceState(null, '', '?garment=' + encodeURIComponent(id));
}

let _currentPurchased = false; // set by _applyWatermarkState, read by captureEmailThenPrint
let _currentHasA0     = false; // whether current pattern purchase includes A0 addon
let _activeProfileId   = null; // Supabase ID of the loaded measurement profile
let _activeProfileName = null; // display name, shown in step 2 label

// ═══ WIZARD STATE ═══
let currentStep = 1;
let stepsCompleted = 0;
let selectedCategory = null;
let renderedGarment = null;
let activeTab = 'pieces';
let selectedPaperSize = 'letter';
let _wishlistSet = new Set(); // garment IDs in user's wishlist
let _purchasedSet = new Set(); // garment IDs user has purchased/credited

const GARMENT_CATEGORIES = [
  { id:'pants',       label:'Pants',       desc:'Trousers, jeans & sweatpants',          ids:['straight-jeans','baggy-jeans','chinos','pleated-trousers','athletic-formal-trousers','sweatpants','wide-leg-trouser-w','straight-trouser-w','easy-pant-w','leggings'] },
  { id:'shorts',      label:'Shorts',      desc:'Casual, sport & tailored shorts',        ids:['cargo-shorts','gym-shorts','swim-trunks','pleated-shorts','baggy-shorts'] },
  { id:'tops',        label:'Tops',        desc:'Tees, shirts, hoodies & blouses',        ids:['tee','tank-top','camp-shirt','crewneck','hoodie','fitted-tee-w','button-up-w','shell-blouse-w'] },
  { id:'skirts',      label:'Skirts',      desc:'Slip, A-line, pencil & circle skirts',   ids:['slip-skirt-w','a-line-skirt-w','pencil-skirt-w','circle-skirt-w'] },
  { id:'dresses',     label:'Dresses',     desc:'Shirt, wrap, slip, T-shirt & A-line dresses', ids:['shirt-dress-w','wrap-dress-w','tshirt-dress-w','slip-dress-w','a-line-dress-w','sundress-w'] },
  { id:'outerwear',   label:'Outerwear',   desc:'Jackets & coats',                        ids:['crop-jacket','denim-jacket','athletic-formal-jacket'] },
  { id:'accessories', label:'Accessories', desc:'Aprons, bow ties, bags & more',           ids:['apron','bow-tie','tote-bag'] },
];

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

// Briefly show a green "Saved!" badge near a reference element
function _showSaveFeedback(anchor) {
  const msg = document.createElement('span');
  msg.textContent = 'Saved!';
  msg.style.cssText = 'color:var(--sa);font-size:.72rem;margin-left:8px;font-family:"IBM Plex Mono",monospace;opacity:1;transition:opacity .4s ease .8s';
  const target = anchor || document.getElementById('save-profile-btn')?.parentElement;
  if (!target) return;
  target.appendChild(msg);
  // trigger fade-out then remove
  requestAnimationFrame(() => requestAnimationFrame(() => { msg.style.opacity = '0'; }));
  setTimeout(() => msg.remove(), 1400);
}

function _showDuplicateProfilePrompt(name) {
  return new Promise(resolve => {
    const overlay = document.createElement('div');
    overlay.className = 'dup-profile-overlay';
    overlay.innerHTML = `
      <div class="dup-profile-dialog">
        <p>A profile named <strong>"${name}"</strong> already exists.</p>
        <p>Would you like to overwrite it or choose a different name?</p>
        <div class="dup-profile-btns">
          <button class="btn-xs" id="dup-overwrite">Overwrite</button>
          <button class="btn-xs" id="dup-rename">Change Name</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.querySelector('#dup-overwrite').addEventListener('click', () => { overlay.remove(); resolve('overwrite'); });
    overlay.querySelector('#dup-rename').addEventListener('click', () => { overlay.remove(); resolve('rename'); });
    overlay.addEventListener('click', e => { if (e.target === overlay) { overlay.remove(); resolve('cancel'); } });
  });
}

function _computeMeasDeltas(oldMeas, newMeas) {
  const deltas = {};
  const allKeys = new Set([...Object.keys(oldMeas), ...Object.keys(newMeas)]);
  for (const k of allKeys) {
    const o = oldMeas[k] ?? null;
    const n = newMeas[k] ?? null;
    if (o !== n) deltas[k] = { old: o, new: n };
  }
  return Object.keys(deltas).length ? deltas : null;
}

// Update active profile state + step 2 stepper label
function _setActiveProfile(id, name) {
  _activeProfileId   = id   ?? null;
  _activeProfileName = name ?? null;
  const lbl = document.querySelector('[data-step="2"] .step-lbl');
  if (lbl) lbl.textContent = name ? ` Measure · ${name}` : ' Measure';
}

function loadProfiles() {
  try { return JSON.parse(localStorage.getItem(PROFILES_KEY)) || []; }
  catch { return []; }
}

function refreshProfileDropdown() {
  const sel = document.getElementById('profile-select');
  if (!sel) return;
  const profiles = loadProfiles();
  sel.innerHTML = `<option value="">- saved profiles -</option>` +
    profiles.map(p => `<option value="${p.name}">${p.name}</option>`).join('');
}

async function saveCurrentProfile() {
  if (!getCurrentUser()) {
    openAuthModal('save-profile', () => saveCurrentProfile());
    return;
  }
  const nameInput = document.getElementById('profile-name-input');
  const name = nameInput?.value?.trim();
  if (!name) {
    nameInput?.focus();
    return;
  }

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

  // Check for existing profile with same name
  const existing = loadProfiles().find(p => p.name === name);
  if (existing) {
    const action = await _showDuplicateProfilePrompt(name);
    if (action === 'rename') { nameInput.focus(); nameInput.select(); return; }
    if (action !== 'overwrite') return;

    // Overwrite existing profile
    const user = getCurrentUser();
    const btn  = document.getElementById('save-profile-btn');
    const orig = btn?.textContent;
    if (btn) { btn.disabled = true; btn.textContent = 'Saving…'; }

    if (existing.id) {
      // Log measurement delta before overwriting
      const oldMeas = { ...existing }; delete oldMeas.id; delete oldMeas.name;
      const deltas = _computeMeasDeltas(oldMeas, m);
      if (deltas) logMeasurementDelta(user.id, existing.id, deltas);

      const { error } = await updateMeasurementProfile(existing.id, m);
      if (error) console.error('Supabase update failed:', error.message);
    }

    if (btn) { btn.disabled = false; btn.textContent = orig; }

    const profiles = loadProfiles().filter(p => p.name !== name);
    profiles.push({ id: existing.id, name, ...m });
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
    refreshProfileDropdown();
    _setActiveProfile(existing.id, name);
    nameInput.value = '';
    _showSaveFeedback(btn?.closest('.profile-row') || btn?.parentElement);
    return;
  }

  // Save new profile to Supabase
  const user = getCurrentUser();
  const btn  = document.getElementById('save-profile-btn');
  const orig = btn?.textContent;
  if (btn) { btn.disabled = true; btn.textContent = 'Saving…'; }
  const { data: savedProfile, error } = await saveMeasurementProfile(user.id, name, m);
  if (btn) { btn.disabled = false; btn.textContent = orig; }

  if (error) {
    console.error('Supabase save failed:', error.message);
  }

  // Save to localStorage (wizard dropdown) — include Supabase ID for purchase linkage
  const profileId = savedProfile?.id ?? null;
  const profiles = loadProfiles().filter(p => p.name !== name);
  profiles.push({ id: profileId, name, ...m });
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  refreshProfileDropdown();
  _setActiveProfile(profileId, name);

  nameInput.value = '';
  _showSaveFeedback(btn?.closest('.profile-row') || btn?.parentElement);
}

function deleteCurrentProfile() {
  const sel = document.getElementById('profile-select');
  const name = sel?.value;
  if (!name) return;
  const profiles = loadProfiles().filter(p => p.name !== name);
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  refreshProfileDropdown();
  if (_activeProfileName === name) _setActiveProfile(null, null);
}

function applyProfile(name) {
  const profile = loadProfiles().find(p => p.name === name);
  if (!profile) return;
  _setActiveProfile(profile.id ?? null, name);
  const g = GARMENTS[currentGarment];
  const garmentDefaults = g?.measurementDefaults ?? {};
  for (const [key, val] of Object.entries(profile)) {
    if (key === 'name' || key === 'id') continue;
    if (key in garmentDefaults) continue; // skip garment-specific lengths (inseam, sleeveLength, etc.)
    const el = document.getElementById(`m-${key}`);
    if (el) el.value = val;
  }
  // Notify listeners (e.g. riseOverride auto-fill) that m-rise may have changed
  document.getElementById('m-rise')?.dispatchEvent(new Event('input'));
  if (currentStep === 4) generate();
  // Track last used in Supabase (fire and forget)
  if (profile.id) updateProfileLastUsed(profile.id).catch(() => {});
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
  const isAccessory = g.category === 'accessory';
  html += `<button class="btn-s" id="how-to-measure-btn" style="margin-bottom:6px">${isAccessory ? 'Dimension guide ▾' : 'How to measure ▾'}</button>
    <div id="mt-guide-container" style="display:none"></div>`;

  // Body measurements + profile selector
  const profiles = loadProfiles();
  const profileOptions = profiles.map(p =>
    `<option value="${p.name}">${p.name}</option>`
  ).join('');

  if (isAccessory) {
    html += `<h2>${g.measurementLabel || 'Dimensions'}</h2><p class="sd">Enter your desired dimensions.</p>`;
  } else {
    html += `<h2>Body</h2><p class="sd">Flexible tape over underwear. Don't pull tight.</p>
    <div class="f profile-row">
      <select id="profile-select" title="Load saved profile">
        <option value="">- saved profiles -</option>
        ${profileOptions}
      </select>
      <button class="btn-xs" id="save-profile-btn" title="Save current measurements">Save</button>
      <button class="btn-xs btn-xs-del" id="del-profile-btn" title="Delete selected profile">&times;</button>
      <input type="text" id="profile-name-input" placeholder="Profile name" style="width:120px">
    </div>`;
  }
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
    <button class="btn-s" id="download-pdf-btn">Download PDF</button>
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
  document.getElementById('print-btn').addEventListener('click', () => handlePrint(document.getElementById('print-btn')));
  document.getElementById('download-pdf-btn').addEventListener('click', () => handleDownloadPDF(document.getElementById('download-pdf-btn')));
  document.getElementById('reset-btn').addEventListener('click', resetToDefaults);
  document.getElementById('save-profile-btn')?.addEventListener('click', saveCurrentProfile);
  document.getElementById('del-profile-btn')?.addEventListener('click', deleteCurrentProfile);
  document.getElementById('profile-select')?.addEventListener('change', e => {
    if (e.target.value) applyProfile(e.target.value);
  });
  document.getElementById('garment-select').addEventListener('change', e => {
    currentGarment = e.target.value;
    _syncGarmentUrl(currentGarment);
    buildInputs();
    generate();
    trackEvent('garment_selected', { garment_id: currentGarment, category: GARMENTS[currentGarment]?.category });
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

// ═══ SYNC WIZARD → SIDE PANEL ═══
// Wizard fields use wz- prefix to avoid duplicate IDs. Copy values to panel on advance.
function _syncWizardToPanel(g, which) {
  if (which === 'measurements') {
    for (const mId of g.measurements) {
      const wz = document.getElementById(`wz-m-${mId}`);
      const sp = document.getElementById(`m-${mId}`);
      if (wz && sp) sp.value = wz.value;
    }
    for (const mId of relevantOptionalIds(g)) {
      const wz = document.getElementById(`wz-m-${mId}`);
      const sp = document.getElementById(`m-${mId}`);
      if (wz && sp) sp.value = wz.value;
    }
  }
  if (which === 'options') {
    for (const key of Object.keys(g.options)) {
      const wz = document.getElementById(`wz-o-${key}`);
      const sp = document.getElementById(`o-${key}`);
      if (wz && sp) sp.value = wz.value;
    }
  }
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
      const isFold = p.instruction?.toLowerCase().includes('on fold');
      w = (isFold ? (p.width || 0) * 2 : (p.width || 0)) + sa * 2;
      h = (p.height || 0) + sa * 2;
      count = isFold ? 1 : extractCutCount(p.instruction);
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
    const fName = f.affiliateUrl
      ? `<a href="${f.affiliateUrl}" class="mat-aff-link" target="_blank" rel="noopener sponsored">${f.name}</a>`
      : f.name;
    html += `<div class="mat-row">${fName} <span class="note">(${f.weight})</span>${f.notes ? ` <span class="note">${expandGlossary(f.notes)}</span>` : ''}</div>`;
  }
  html += `</div>`;

  html += `<div class="mat-section"><h5>Notions</h5>`;
  for (const n of mat.notions) {
    if (!n?.name) continue;
    const nName = n.affiliateUrl
      ? `<a href="${n.affiliateUrl}" class="mat-aff-link" target="_blank" rel="noopener sponsored">${n.name}</a>`
      : n.name;
    html += `<div class="mat-row">${nName}${n.quantity ? ` <span class="qty">${n.quantity}</span>` : ''}${n.notes ? ` <span class="note">(${expandGlossary(n.notes)})</span>` : ''}</div>`;
  }
  html += `</div>`;

  const threadName = mat.thread?.name ?? 'Polyester all-purpose';
  const threadLink = mat.thread?.affiliateUrl
    ? `<a href="${mat.thread.affiliateUrl}" class="mat-aff-link" target="_blank" rel="noopener sponsored">${threadName}</a>`
    : threadName;
  const needleName = mat.needle?.name ?? String(mat.needle ?? 'Universal');
  const needleLink = mat.needle?.affiliateUrl
    ? `<a href="${mat.needle.affiliateUrl}" class="mat-aff-link" target="_blank" rel="noopener sponsored">${needleName}</a>`
    : needleName;

  html += `<div class="mat-section"><h5>Thread & Needle</h5>
    <div class="mat-row">Thread: ${threadLink} (${mat.thread?.weight ?? '40wt'}) <span class="note">${mat.thread?.notes ?? ''}</span></div>
    <div class="mat-row">Needle: ${needleLink} <span class="note">${mat.needle?.use ?? ''}</span></div>
  </div>`;

  html += `<div class="mat-section"><h5>Stitch Settings</h5>`;
  for (const s of mat.stitches) {
    if (!s?.name) continue;
    html += `<span class="mat-stitch">${s.name} ${s.length}${s.width !== '0' ? ' w:' + s.width : ''} · ${expandGlossary(s.use)}</span>`;
  }
  html += `</div>`;

  if (mat.machineSettings?.length) {
    html += `<div class="mat-section"><h5>Machine Settings</h5>`;
    for (const ms of mat.machineSettings) {
      html += `<div class="mat-row"><strong>${ms.label}</strong></div>`;
      html += `<div class="mat-row">Tension: ${ms.tension} · ${ms.stitch}</div>`;
      html += `<div class="mat-row"><span class="note">${ms.notes}</span></div>`;
    }
    html += `</div>`;
  }

  if (mat.troubleshooting?.length) {
    html += `<div class="mat-section"><h5>Troubleshooting</h5>`;
    for (const t of mat.troubleshooting) html += `<div class="mat-row">• ${expandGlossary(t)}</div>`;
    html += `</div>`;
  }

  if (mat.notes?.length) {
    html += `<div class="mat-section"><h5>Important Notes</h5>`;
    for (const n of mat.notes) html += `<div class="mat-row">• ${expandGlossary(n)}</div>`;
    html += `</div>`;
  }

  html += `<p class="mat-affiliate-note">Links may earn us a small commission at no cost to you.</p>`;

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

// ═══ RENDER INSTRUCTIONS ═══
function renderInstructions(steps) {
  // Section headers inserted before the first step that matches each trigger.
  const SECTIONS = [
    { key: 'pocket',    label: 'POCKET PREPARATION', trigger: t => /pocket|facing|welt|fly shield/i.test(t) },
    { key: 'assembly',  label: 'ASSEMBLY',            trigger: t => /sew\s.*(seam|front|back|side|inseam|shoulder|sleeve|panel)|attach.*sleeve|join.*panel|construct.*body/i.test(t) },
    { key: 'waistband', label: 'WAISTBAND',           trigger: t => /waistband|casing|curtain waist/i.test(t) },
    { key: 'finishing', label: 'FINISHING',           trigger: t => /^hem$|^finish$|press.*garment|bar tack|set rivet|blind hem/i.test(t) },
  ];
  const emitted = new Set();

  // Glossary toggle + collapsible panel at the top
  const glossaryTerms = Object.entries(GLOSSARY)
    .map(([term, def]) => `<dt>${term}</dt><dd>${def}</dd>`)
    .join('');
  let html = `<span class="instr-glossary-toggle" id="gloss-toggle">glossary ▾</span>
<dl class="instr-glossary-panel" id="gloss-panel">${glossaryTerms}</dl>`;

  for (const s of steps) {
    // Check if this step triggers a new section header (each section fires at most once)
    for (const sec of SECTIONS) {
      if (!emitted.has(sec.key) && sec.trigger(s.title)) {
        emitted.add(sec.key);
        html += `<div class="instr-section-hdr">${sec.label}</div>`;
        break;
      }
    }

    // Split long detail text at sentence boundaries, then expand glossary markers
    const rawDetail = s.detail || '';
    const split = rawDetail.length > 200
      ? rawDetail.replace(/\.\s+/g, '.<br>').trim()
      : rawDetail;
    const detail = expandGlossary(split);

    html += `<div class="instr-step"><span class="num">${s.step}.</span><span class="instr-body"><span class="ttl">${s.title}.</span> <span class="dtl">${detail}</span></span></div>`;
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
  if (currentStep === 4) generate();
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

  const pieces       = g.pieces(m, opts);
  // Sanitize polygons — skip panel pieces: their polygons are already clean and
  // sanitizePoly reverses their winding (CW-in-screen → CCW-in-screen), which
  // breaks crotchPath's vertex traversal and the SA polygon coordinate mapping.
  for (const p of pieces) {
    if (p.type === 'panel') continue;
    if (p.polygon) {
      const orig = p.polygon;
      p.polygon = sanitizePoly(orig);
      if (p.edgeAllowances && p.polygon.length !== orig.length) p.edgeAllowances = null;
    }
    if (p.saPolygon) p.saPolygon = sanitizePoly(p.saPolygon);
  }
  const materials    = g.materials(m, opts);
  const instructions = g.instructions(m, opts);

  const isLower = g.category === 'lower';
  const isUpper = !isLower;
  const overviewParts = isUpper
    ? [g.name, opts.fit ?? opts.ease, m.chest ? fmtInches(m.chest) + ' chest' : '', m.waist ? fmtInches(m.waist) + ' waist' : '', m.torsoLength ? fmtInches(m.torsoLength) + ' torso' : ''].filter(Boolean)
    : [g.name, opts.fit ?? opts.ease, fmtInches(m.waist) + ' W', fmtInches(m.hip) + ' H', m.rise ? fmtInches(m.rise) + ' rise' : '', m.inseam ? fmtInches(m.inseam) + ' inseam' : ''].filter(Boolean);
  const diffBadge = g.difficulty ? `<span class="diff-badge diff-${g.difficulty}">${g.difficulty}</span>` : '';

  // ── Pieces pane ──
  let piecesHtml = `<div class="po">`;
  for (const piece of pieces) {
    if (piece.type === 'panel') {
      const svg = renderPanelSVG(piece);
      piecesHtml += `<div class="pc"><h3>${piece.name}</h3><div class="sub">${expandGlossary(piece.instruction)}</div>${svg}
        <table class="dt">
          <tr><td>Panel width</td><td>${fmtInches(piece.width)}</td></tr>
          <tr><td>Height</td><td>${fmtInches(piece.height)}</td></tr>
          <tr><td>Crotch ext</td><td>${fmtInches(piece.ext)}</td></tr>
          <tr><td>Cut size (w/ SA)</td><td>${fmtInches(piece.width + piece.ext + piece.sa * 2)} × ${fmtInches(piece.height + piece.sa + piece.hem)}</td></tr>
        </table></div>`;
    } else if (piece.type === 'bodice' || piece.type === 'sleeve') {
      const svg = renderGenericPieceSVG(piece);
      piecesHtml += `<div class="pc"><h3>${piece.name}</h3><div class="sub">${expandGlossary(piece.instruction)}</div>${svg}
        <table class="dt">
          <tr><td>Width</td><td>${fmtInches(piece.width)}</td></tr>
          <tr><td>Height</td><td>${fmtInches(piece.height)}</td></tr>
          ${piece.type === 'sleeve' ? `<tr><td>Cap height</td><td>${fmtInches(piece.capHeight)}</td></tr>` : ''}
        </table></div>`;
    } else if (piece.type === 'rectangle') {
      piecesHtml += `<div class="pc full"><h3>${piece.name}</h3><div class="sub">${expandGlossary(piece.instruction)}</div>
        <table class="dt" style="max-width:400px">
          <tr><td>Length</td><td>${fmtInches(piece.dimensions.length)}</td></tr>
          <tr><td>Width</td><td>${fmtInches(piece.dimensions.width)}</td></tr>
          <tr><td>Finished</td><td>${fmtInches(piece.dimensions.width / 2)}</td></tr>
        </table></div>`;
    } else if (piece.type === 'pocket') {
      const pd = piece.dimensions;
      const pW = pd.length ?? pd.width;
      const pH = pd.height ?? pd.width;
      const pSize = pd.length != null
        ? `${fmtInches(pd.length)} × ${fmtInches(pd.width)}`
        : `${fmtInches(pd.width)} × ${fmtInches(pd.height)}`;
      // Mini SVG preview showing SA outline + marks
      const pSc = 12; // px per inch for pocket preview
      const pM = 16;  // margin in px
      const svgW = pM * 2 + pW * pSc;
      const svgH = pM * 2 + pH * pSc;
      const prx = pM, pry = pM, prW = pW * pSc, prH = pH * pSc;
      const pSa = piece.sa || 0;
      const pSaOff = pSa * pSc;
      let pSvg = `<svg viewBox="0 0 ${svgW} ${svgH}" style="max-width:${Math.min(svgW, 280)}px;display:block;margin:8px auto">`;
      if (pSa > 0) pSvg += `<rect x="${prx - pSaOff}" y="${pry - pSaOff}" width="${prW + pSaOff * 2}" height="${prH + pSaOff * 2}" stroke="#000" stroke-width="1.2" fill="none"/>`;
      pSvg += `<rect x="${prx}" y="${pry}" width="${prW}" height="${prH}" stroke="${pSa > 0 ? '#666' : '#2c2a26'}" stroke-width="${pSa > 0 ? 0.6 : 1.2}" ${pSa > 0 ? 'stroke-dasharray="3,2"' : ''} fill="none"/>`;
      const marks = piece.marks || [];
      for (const mk of marks) {
        const mc = '#4a8a5a';
        if (mk.type === 'fold' && mk.axis === 'h') {
          const ly = pry + mk.position * pSc;
          pSvg += `<line x1="${prx}" y1="${ly}" x2="${prx + prW}" y2="${ly}" stroke="${mc}" stroke-width="0.6" stroke-dasharray="3,2"/>`;
        } else if (mk.type === 'fold' && mk.axis === 'v') {
          const lx = prx + mk.position * pSc;
          pSvg += `<line x1="${lx}" y1="${pry}" x2="${lx}" y2="${pry + prH}" stroke="${mc}" stroke-width="0.6" stroke-dasharray="3,2"/>`;
        } else if (mk.type === 'pleat') {
          const lx1 = prx + (mk.center - mk.intake) * pSc;
          const lx2 = prx + (mk.center + mk.intake) * pSc;
          const lxC = prx + mk.center * pSc;
          pSvg += `<line x1="${lx1}" y1="${pry}" x2="${lx1}" y2="${pry + prH}" stroke="${mc}" stroke-width="0.6" stroke-dasharray="3,2"/>`;
          pSvg += `<line x1="${lx2}" y1="${pry}" x2="${lx2}" y2="${pry + prH}" stroke="${mc}" stroke-width="0.6" stroke-dasharray="3,2"/>`;
          pSvg += `<line x1="${lxC}" y1="${pry}" x2="${lxC}" y2="${pry + prH}" stroke="${mc}" stroke-width="0.3" stroke-dasharray="2,3"/>`;
        }
      }
      pSvg += '</svg>';
      piecesHtml += `<div class="pc sm"><h3>${piece.name}</h3><div class="sub">${expandGlossary(piece.instruction)}</div>
        ${pSvg}
        <table class="dt">
          <tr><td>Size</td><td>${pSize}</td></tr>
          ${pSa > 0 ? `<tr><td>SA</td><td>${fmtInches(pSa)}</td></tr>` : ''}
        </table></div>`;
    }
  }
  // Fit check lives in pieces pane (skip for accessories — no body measurements to verify)
  if (g.category !== 'accessory') {
    let fitCheckHtml = '';
    if (isUpper) {
      const frontP = pieces.find(p => p.id === 'bodice-front' || p.id === 'bodice-front-right');
      const PLACKET_W = 1.5;
      const panelWidth = frontP
        ? (frontP.id === 'bodice-front-right'
            ? frontP.width - PLACKET_W
            : frontP.width)
        : 0;
      const chestCirc = panelWidth * 4;
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
    piecesHtml += `<div class="pc full"><h3>Fit Check</h3><div class="sub">Verify before cutting</div>${fitCheckHtml}</div>`;
  }
  piecesHtml += `</div>`;

  // ── Materials pane ──
  const y45 = calculateYardage(pieces, 45);
  const y60 = calculateYardage(pieces, 60);
  const materialsHtml = `<div class="s4-pane-inner">${renderMaterials(materials, y45, y60)}</div>`;

  // ── Instructions pane ──
  const instructionsHtml = `<div class="s4-pane-inner">
    <p class="s4-pane-note">Read all steps before starting. Press every seam.</p>
    ${renderInstructions(instructions)}
  </div>`;

  // ── Print pane ──
  const PAPER_SIZES = [
    { id: 'letter',  label: 'US Letter   8.5 x 11 in   (tiled)' },
    { id: 'a4',      label: 'A4          210 x 297 mm  (tiled)' },
    { id: 'tabloid', label: 'Tabloid     11 x 17 in    (tiled)' },
    { id: 'a0',      label: 'A0 / Copy Shop / Projector  33.1 x 46.8 in (+$4)' },
  ];
  const printHtml = `<div class="s4-print-wrap">
    <div class="s4-print-section">
      <div class="s4-print-label">Paper Size</div>
      ${PAPER_SIZES.map(s => `<label class="s4-print-radio">
        <input type="radio" name="s4-ps" value="${s.id}"${s.id === selectedPaperSize ? ' checked' : ''}> ${s.label}
      </label>`).join('')}
    </div>
    <div class="s4-print-actions">
      <button class="btn" id="s4-print-btn">Print Pattern</button>
      <button class="btn-s" id="s4-download-btn">Download PDF</button>
    </div>
  </div>`;

  document.getElementById('output').innerHTML =
    `<div class="oh">${diffBadge}${overviewParts.join(' · ')}</div>` +
    `<div id="s4-pane-pieces"       class="s4-pane">${piecesHtml}</div>` +
    `<div id="s4-pane-materials"    class="s4-pane">${materialsHtml}</div>` +
    `<div id="s4-pane-instructions" class="s4-pane">${instructionsHtml}</div>` +
    `<div id="s4-pane-print"        class="s4-pane">${printHtml}</div>`;

  // Wire print pane listeners
  document.querySelectorAll('input[name="s4-ps"]').forEach(r =>
    r.addEventListener('change', e => { selectedPaperSize = e.target.value; })
  );
  document.getElementById('s4-print-btn')?.addEventListener('click', () => handlePrint(document.getElementById('s4-print-btn')));
  document.getElementById('s4-download-btn')?.addEventListener('click', () => handleDownloadPDF(document.getElementById('s4-download-btn')));

  switchTab(activeTab);

  // Glossary toggle
  document.getElementById('gloss-toggle')?.addEventListener('click', () => {
    const panel = document.getElementById('gloss-panel');
    const toggle = document.getElementById('gloss-toggle');
    if (!panel) return;
    panel.classList.toggle('open');
    toggle.textContent = panel.classList.contains('open') ? 'glossary ▴' : 'glossary ▾';
  });

  // Async: apply or remove watermark based on purchase status
  _applyWatermarkState(currentGarment);

  // Async: inject recommendations section below output
  _renderRecommendationsSection(currentGarment);
}

async function _applyWatermarkState(garmentId) {
  const output = document.getElementById('output');
  if (!output) return;

  removeWatermarks(output);
  document.getElementById('wm-purchase-banner')?.remove();

  // ── BETA: free downloads for everyone via email gate ──────────────────────
  if (BETA_MODE) {
    _currentPurchased = true; // allow download to proceed without purchase check
    const banner = document.createElement('div');
    banner.id = 'wm-purchase-banner';
    banner.className = 'wm-banner';
    banner.innerHTML = `<button class="wm-banner-btn" id="wm-beta-dl-btn">Download PDF (free during beta)</button>`;
    output.parentNode.insertBefore(banner, output);
    document.getElementById('wm-beta-dl-btn').addEventListener('click', () => {
      showEmailGate(() => handleDownloadPDF(document.getElementById('wm-beta-dl-btn')));
    });
    return;
  }

  // ── REDEMPTION CODE MODE ─────────────────────────────────────────────────
  if (_isRedemptionMode && garmentId === _redemptionGarment) {
    const user = getCurrentUser();
    // Check if already purchased (code was already redeemed in a previous session)
    if (user) {
      const purchaseRes = await hasPurchased(user.id, garmentId);
      if (purchaseRes.data) {
        _currentPurchased = true;
        _currentHasA0 = !!purchaseRes.data?.a0_addon;
        return;
      }
    }

    const banner = document.createElement('div');
    banner.id = 'wm-purchase-banner';
    banner.className = 'wm-banner';
    const gName = _redemptionGarmentName || garmentId.replace(/-/g, ' ');

    if (!user) {
      // Not logged in: prompt signup first, then redeem on download
      banner.innerHTML = `
        <span class="wm-banner-text">Redeeming code for <strong>${gName}</strong>. Create a free account to download.</span>
        <button class="wm-banner-btn" id="wm-redeem-signup-btn">Create Free Account &amp; Download</button>`;
      output.parentNode.insertBefore(banner, output);
      document.getElementById('wm-redeem-signup-btn').addEventListener('click', () => {
        _showFreeSignupModal(garmentId);
      });
    } else {
      // Logged in: redeem code and download
      banner.innerHTML = `
        <span class="wm-banner-text">Your code unlocks a custom-fit <strong>${gName}</strong>. Free with your redemption code.</span>
        <button class="wm-banner-btn wm-free-btn" id="wm-redeem-btn">Download My Pattern</button>`;
      output.parentNode.insertBefore(banner, output);
      document.getElementById('wm-redeem-btn').addEventListener('click', async () => {
        const btn = document.getElementById('wm-redeem-btn');
        btn.disabled = true; btn.textContent = 'Redeeming…';
        const { session } = await getSession();
        const { m: _rM, opts: _rOpts } = readInputs();
        try {
          const res = await fetch('/api/redeem-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
            body: JSON.stringify({ code: _redemptionCode, profileId: _activeProfileId, measurements: _rM, opts: _rOpts }),
          });
          const json = await res.json();
          if (!res.ok) { btn.disabled = false; btn.textContent = 'Download My Pattern'; alert(json.error || 'Could not redeem code.'); return; }
          _currentPurchased = true;
          // Clear redemption state
          sessionStorage.removeItem('redemptionCode');
          sessionStorage.removeItem('redemptionGarment');
          sessionStorage.removeItem('redemptionGarmentName');
          _redemptionCode = null;
          removeWatermarks(output);
          banner.innerHTML = `<span class="wm-banner-text" style="color:var(--gold)">Code redeemed! <strong>${gName}</strong> is now in your account.</span>`;
          handleDownloadPDF(btn);
        } catch {
          btn.disabled = false; btn.textContent = 'Download My Pattern';
          alert('Something went wrong. Please try again.');
        }
      });
    }
    return;
  }

  // ── PAID MODE ─────────────────────────────────────────────────────────────
  const user = getCurrentUser();
  let purchased = false;
  let freeCredits = 0;
  if (user) {
    const [purchaseRes, creditsRes] = await Promise.all([
      hasPurchased(user.id, garmentId),
      getFreeCredits(user.id),
    ]);
    purchased   = !!purchaseRes.data;
    _currentHasA0 = !!purchaseRes.data?.a0_addon;
    freeCredits = creditsRes.credits ?? 0;
  }
  _currentPurchased = purchased;

  if (!purchased) {
    // watermark removed — preview stays clean

    const price   = PATTERN_PRICES[garmentId];
    const label   = price?.label ?? 'this pattern';
    const dollars = price ? `$${(price.cents / 100).toFixed(2)}` : '';
    const banner  = document.createElement('div');
    banner.id = 'wm-purchase-banner';
    banner.className = 'wm-banner';

    if (!user) {
      // Not logged in: frictionless account creation → free credit → download
      banner.innerHTML = `
        <span class="wm-banner-text">Your first pattern is <strong>free</strong>. No credit card needed.</span>
        <button class="wm-banner-btn" id="wm-signup-btn">Create Free Account &amp; Download</button>`;
      output.parentNode.insertBefore(banner, output);
      document.getElementById('wm-signup-btn').addEventListener('click', () => {
        _showFreeSignupModal(garmentId);
      });
    } else if (freeCredits > 0) {
      // Logged in with free credit
      banner.innerHTML = `
        <span class="wm-banner-text">You have <strong>1 free pattern download</strong>. Use it on ${label}?</span>
        <button class="wm-banner-btn wm-free-btn" id="wm-free-btn">Download Free (1 credit)</button>`;
      output.parentNode.insertBefore(banner, output);
      document.getElementById('wm-free-btn').addEventListener('click', async () => {
        const btn = document.getElementById('wm-free-btn');
        btn.disabled = true; btn.textContent = 'Applying…';
        const { session } = await getSession();
        const { m: _fcM, opts: _fcOpts } = readInputs();
        const res  = await fetch('/api/use-free-credit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
          body: JSON.stringify({ garmentId, profileId: _activeProfileId, measurements: _fcM, opts: _fcOpts }),
        });
        const json = await res.json();
        if (!res.ok) { btn.disabled = false; btn.textContent = 'Download Free (1 credit)'; alert(json.error); return; }
        _currentPurchased = true;
        removeWatermarks(output);
        banner.innerHTML = `<span class="wm-banner-text" style="color:var(--gold)">Free credit used. Your next pattern starts at $9. <strong>${label}</strong> is now in your account.</span>`;
        _showEmailOptIn(getCurrentUser()?.email);
        handleDownloadPDF(btn);
      });
    } else {
      // Logged in, no free credits: full purchase bar with A0 upsell
      banner.innerHTML = `
        <span class="wm-banner-text">Purchase ${label} to download the full-resolution print-ready PDF${dollars ? ` (${dollars})` : ''}</span>
        <label class="wm-a0-label" id="wm-a0-label">
          <input type="checkbox" id="wm-a0-check">
          Add A0 / Projector / Copy Shop files <span class="wm-a0-price">(+$4)</span> · no taping
        </label>
        <button class="wm-banner-btn" id="wm-buy-btn">Buy Now</button>`;
      output.parentNode.insertBefore(banner, output);
      document.getElementById('wm-buy-btn').addEventListener('click', () => {
        const addA0 = document.getElementById('wm-a0-check')?.checked ?? false;
        _triggerBuyPattern(garmentId, addA0);
      });
    }
  }
}

// ── Frictionless signup modal ─────────────────────────────────────────────────
function _showFreeSignupModal(garmentId) {
  let dlg = document.getElementById('free-signup-dlg');
  if (!dlg) {
    dlg = document.createElement('dialog');
    dlg.id = 'free-signup-dlg';
    dlg.innerHTML = `
      <div class="email-gate-card">
        <div class="email-gate-logo">People's Patterns</div>
        <p class="email-gate-body">Create a free account to download. Your first pattern is free, no credit card needed.</p>
        <form id="free-signup-form" class="email-gate-form">
          <input type="email" id="free-signup-email" placeholder="you@example.com" required autocomplete="email">
          <input type="password" id="free-signup-pw" placeholder="Choose a password (8+ characters)" required autocomplete="new-password" minlength="8">
          <button type="submit" class="email-gate-submit" id="free-signup-submit">Create Account &amp; Download</button>
          <p id="free-signup-err" class="free-signup-err" hidden></p>
        </form>
        <button type="button" class="email-gate-cancel" id="free-signup-cancel">Maybe later</button>
      </div>`;
    document.body.appendChild(dlg);
  }

  const form      = dlg.querySelector('#free-signup-form');
  const cancelBtn = dlg.querySelector('#free-signup-cancel');
  const errEl     = dlg.querySelector('#free-signup-err');

  cancelBtn.onclick = () => dlg.close();

  form.onsubmit = async (e) => {
    e.preventDefault();
    const email    = dlg.querySelector('#free-signup-email').value.trim();
    const password = dlg.querySelector('#free-signup-pw').value;
    const submitBtn = dlg.querySelector('#free-signup-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account…';
    errEl.hidden = true;

    // Server creates the user with free_credits=1, bypassing email confirmation
    const res = await fetch('/api/signup-free', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    if (!res.ok) {
      errEl.textContent = json.error || 'Could not create account.';
      errEl.hidden = false;
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create Account & Download';
      return;
    }

    // Sign in on the client
    const { data, error: signInErr } = await signIn(email, password);
    if (signInErr || !data?.session) {
      errEl.textContent = 'Account created! Check your email to confirm, then sign in to download.';
      errEl.hidden = false;
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create Account & Download';
      return;
    }

    dlg.close();

    const { session } = data;
    const { m: _scM, opts: _scOpts } = readInputs();

    // ── Redemption mode: use the code instead of free credit ──────────────
    if (_isRedemptionMode && _redemptionCode && garmentId === _redemptionGarment) {
      const redeemRes = await fetch('/api/redeem-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({ code: _redemptionCode, profileId: _activeProfileId, measurements: _scM, opts: _scOpts }),
      });
      const redeemJson = await redeemRes.json();
      if (!redeemRes.ok) {
        alert('Account created! ' + (redeemJson.error || 'Could not redeem code. Try again from your account.'));
        return;
      }
      _currentPurchased = true;
      sessionStorage.removeItem('redemptionCode');
      sessionStorage.removeItem('redemptionGarment');
      sessionStorage.removeItem('redemptionGarmentName');
      _redemptionCode = null;
      const output = document.getElementById('output');
      if (output) removeWatermarks(output);
      const banner = document.getElementById('wm-purchase-banner');
      const gName = _redemptionGarmentName || garmentId.replace(/-/g, ' ');
      if (banner) banner.innerHTML = `<span class="wm-banner-text" style="color:var(--gold)">Code redeemed! <strong>${gName}</strong> is now in your account.</span>`;
      const dummyBtn = document.createElement('button');
      dummyBtn.textContent = 'Downloading…';
      handleDownloadPDF(dummyBtn);
      return;
    }

    // ── Standard flow: use free credit ────────────────────────────────────
    const creditRes = await fetch('/api/use-free-credit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
      body: JSON.stringify({ garmentId, profileId: _activeProfileId, measurements: _scM, opts: _scOpts }),
    });
    const creditJson = await creditRes.json();
    if (!creditRes.ok) {
      alert('Account created! ' + (creditJson.error || 'Sign in to download your free pattern.'));
      return;
    }

    _currentPurchased = true;
    const output = document.getElementById('output');
    if (output) removeWatermarks(output);
    const banner = document.getElementById('wm-purchase-banner');
    if (banner) {
      const price = PATTERN_PRICES[garmentId];
      const label = price?.label ?? 'this pattern';
      banner.innerHTML = `<span class="wm-banner-text" style="color:var(--gold)">Free credit used. Your next pattern starts at $9. <strong>${label}</strong> is now in your account.</span>`;
    }
    _showEmailOptIn(email);

    // Trigger download
    const dummyBtn = document.createElement('button');
    dummyBtn.textContent = 'Downloading…';
    handleDownloadPDF(dummyBtn);
  };

  dlg.querySelector('#free-signup-email').value = '';
  dlg.querySelector('#free-signup-pw').value = '';
  dlg.showModal();
}

// ═══ EMAIL OPT-IN ═══
function _showEmailOptIn(userEmail) {
  if (document.getElementById('email-optin-card')) return;
  const card = document.createElement('div');
  card.id = 'email-optin-card';
  card.className = 'email-optin-card';
  card.innerHTML = `
    <p class="email-optin-title">Get weekly fit tips + early new pattern drops</p>
    <p class="email-optin-sub">One email a week, max. Unsubscribe any time.</p>
    <div class="email-optin-row">
      <input type="email" class="email-optin-input" id="email-optin-input" placeholder="you@example.com" value="${userEmail || ''}">
      <button class="email-optin-btn" id="email-optin-btn">Yes please</button>
    </div>`;
  const banner = document.getElementById('wm-purchase-banner');
  if (banner) banner.after(card);
  document.getElementById('email-optin-btn')?.addEventListener('click', async () => {
    const input = document.getElementById('email-optin-input');
    const btn   = document.getElementById('email-optin-btn');
    const email = input?.value.trim();
    if (!email || !email.includes('@')) return;
    btn.disabled = true; btn.textContent = '...';
    try {
      const user = getCurrentUser();
      await fetch('/api/email-opt-in', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, userId: user?.id }),
      });
      card.innerHTML = '<p class="email-optin-done">You\'re in! Check your inbox.</p>';
      setTimeout(() => card.remove(), 4000);
    } catch { btn.disabled = false; btn.textContent = 'Yes please'; }
  });
}

// ═══ RECOMMENDATIONS ═══
async function _renderRecommendationsSection(garmentId) {
  // Remove any previous recs section
  document.getElementById('pp-recs-section')?.remove();

  const user = getCurrentUser();
  let purchasedIds = [];
  if (user) {
    const { data } = await getPurchases(user.id);
    purchasedIds = (data || []).map(p => p.garment_id);
  }

  const recs = getRecommendations(garmentId, purchasedIds, 3);
  if (!recs.length) return;

  const section = document.createElement('div');
  section.id = 'pp-recs-section';
  section.className = 'recs-section';
  section.innerHTML = `
    <h3 class="recs-title">Your measurements also work for:</h3>
    <div class="recs-grid">
      ${recs.map(id => {
        const displayName = id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        return `<button class="recs-card" data-garment="${id}">
          <span class="recs-card-name">${displayName}</span>
          <span class="recs-card-cta">Generate →</span>
        </button>`;
      }).join('')}
    </div>`;

  const output = document.getElementById('output');
  if (!output) return;
  output.insertAdjacentElement('afterend', section);

  section.querySelectorAll('.recs-card').forEach(card => {
    card.addEventListener('click', () => {
      const id  = card.dataset.garment;
      const sel = document.getElementById('garment-select');
      if (sel) { sel.value = id; currentGarment = id; buildInputs(); generate(); }
    });
  });
}

// ═══ EXPORT ═══
// Reserved for professional tier — plotter/institutional export feature
// function exportSVG(btn) {
//   if (!getCurrentUser()) { openAuthModal('download', () => exportSVG(btn)); return; }
//   if (!_currentPurchased) { _triggerBuyPattern(currentGarment); return; }
//   const svgs = document.querySelectorAll('#output svg');
//   if (!svgs.length) return alert('Generate first');
//   svgs.forEach((s, i) => {
//     const a = document.createElement('a');
//     a.href = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(s)], { type: 'image/svg+xml' }));
//     a.download = `pattern-piece-${i + 1}.svg`;
//     a.click();
//   });
// }

// ═══ EMAIL CAPTURE ═══
function storeEmail(email) {
  const stored = JSON.parse(localStorage.getItem('captured_emails') || '[]');
  if (!stored.includes(email)) {
    stored.push(email);
    localStorage.setItem('captured_emails', JSON.stringify(stored));
  }
}

function showEmailGate(onSuccess) {
  let dlg = document.getElementById('email-gate-dlg');
  if (!dlg) {
    dlg = document.createElement('dialog');
    dlg.id = 'email-gate-dlg';
    dlg.innerHTML = `
      <div class="email-gate-card">
        <div class="email-gate-logo">People's Patterns</div>
        <p class="email-gate-tagline">made-to-measure sewing patterns</p>
        <p class="email-gate-body">Enter your email to download your pattern. Free during beta.</p>
        <form id="email-gate-form" class="email-gate-form">
          <input type="email" id="email-gate-input" placeholder="you@example.com" required autocomplete="email">
          <label class="email-gate-check">
            <input type="checkbox" id="email-gate-optin" checked>
            Send me new pattern drops and sewing tips
          </label>
          <button type="submit" class="email-gate-submit">Download Pattern</button>
        </form>
        <button type="button" class="email-gate-cancel" id="email-gate-cancel">Maybe later</button>
      </div>`;
    document.body.appendChild(dlg);
  }

  const form = dlg.querySelector('#email-gate-form');
  const cancelBtn = dlg.querySelector('#email-gate-cancel');
  const emailInput = dlg.querySelector('#email-gate-input');

  form.onsubmit = (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    if (!email) return;
    storeEmail(email);
    dlg.close();
    onSuccess();
  };

  cancelBtn.onclick = () => dlg.close();

  emailInput.value = '';
  dlg.showModal();
}

// ── Purchase gate helpers ─────────────────────────────────────────────────────
function _triggerBuyPattern(garmentId, addA0 = false) {
  const user = getCurrentUser();
  if (!user) {
    openAuthModal('download', () => _triggerBuyPattern(garmentId, addA0));
    return;
  }
  import('../lib/checkout.js').then(mod => {
    const { m: mVals, opts } = readInputs();
    return mod.buyPattern(garmentId ?? currentGarment, mVals, opts, user.id, _activeProfileId, addA0);
  }).catch(err => {
    console.error('Checkout error:', err);
    alert('Could not start checkout: ' + err.message);
  });
}

function _promptA0Upgrade() {
  let dlg = document.getElementById('a0-upgrade-dlg');
  if (!dlg) {
    dlg = document.createElement('dialog');
    dlg.id = 'a0-upgrade-dlg';
    dlg.innerHTML = `
      <div class="email-gate-card">
        <div class="email-gate-logo">People's Patterns</div>
        <p class="email-gate-body"><strong>A0 / Projector / Copy Shop files</strong> are a one-time $4 add-on for this pattern.</p>
        <ul class="a0-upgrade-list">
          <li><strong>A0 PDF</strong> — single-sheet print at any copy shop</li>
          <li><strong>Projector file</strong> — project directly onto fabric, no paper</li>
        </ul>
        <button class="email-gate-submit" id="a0-upgrade-buy">Add for $4</button>
        <button type="button" class="email-gate-cancel" id="a0-upgrade-cancel">Cancel</button>
        <p class="a0-upgrade-err" id="a0-upgrade-err" hidden></p>
      </div>`;
    document.body.appendChild(dlg);
  }

  const buyBtn = dlg.querySelector('#a0-upgrade-buy');
  const cancelBtn = dlg.querySelector('#a0-upgrade-cancel');
  const errEl = dlg.querySelector('#a0-upgrade-err');
  errEl.hidden = true;
  buyBtn.disabled = false;
  buyBtn.textContent = 'Add for $4';

  buyBtn.onclick = async () => {
    buyBtn.disabled = true;
    buyBtn.textContent = 'Redirecting\u2026';
    errEl.hidden = true;
    try {
      const user = getCurrentUser();
      const { supabase } = await import('../lib/supabase.js');
      const { data: purchase } = await supabase
        .from('purchases')
        .select('id')
        .eq('user_id', user.id)
        .eq('garment_id', currentGarment)
        .limit(1)
        .maybeSingle();
      if (!purchase) throw new Error('Purchase not found. Try from My Patterns.');
      const { session } = await getSession();
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body: JSON.stringify({ mode: 'a0_upgrade', purchaseId: purchase.id, userId: user.id }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || 'Checkout failed');
      window.location.href = json.url;
    } catch (err) {
      errEl.textContent = err.message || 'Something went wrong. Try again.';
      errEl.hidden = false;
      buyBtn.disabled = false;
      buyBtn.textContent = 'Add for $4';
    }
  };

  cancelBtn.onclick = () => dlg.close();
  dlg.showModal();
}

async function handlePrint(btn) {
  if (!getCurrentUser()) {
    openAuthModal('download', () => handlePrint(btn));
    return;
  }
  if (!_currentPurchased) {
    // Refresh purchase/credit state — user may have just signed up with a free credit
    await _applyWatermarkState(currentGarment);
    if (!_currentPurchased) return; // banner now shows correct action (free credit or buy)
  }
  if (selectedPaperSize === 'a0' && !_currentHasA0) {
    _promptA0Upgrade();
    return;
  }
  printPattern();
}

async function _blobDownload(url, filename) {
  const r = await fetch(url);
  const blob = await r.blob();
  const obj = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = obj;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(obj);
}

async function handleDownloadPDF(btn) {
  if (!getCurrentUser()) {
    openAuthModal('download', () => handleDownloadPDF(btn));
    return;
  }
  if (!_currentPurchased) {
    // Refresh purchase/credit state — user may have just signed up with a free credit
    await _applyWatermarkState(currentGarment);
    if (!_currentPurchased) return; // banner now shows correct action (free credit or buy)
  }
  if (selectedPaperSize === 'a0' && !_currentHasA0) {
    _promptA0Upgrade();
    return;
  }

  const origText  = btn.textContent;
  btn.disabled    = true;
  btn.textContent = 'Generating…';

  try {
    const user       = getCurrentUser();
    const { session } = await getSession();
    const { m, opts } = readInputs();
    const res = await fetch('/api/generate-pattern', {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token}`,
      },
      body:    JSON.stringify({
        garmentId:    currentGarment,
        measurements: m,
        opts,
      }),
    });
    const json = await res.json();
    if (!res.ok || json.error) {
      alert('Could not generate PDF: ' + (json.error ?? res.statusText));
      return;
    }
    // Trigger tiled letter PDF download — fetch as blob so the download
    // attribute works (it's ignored for cross-origin Supabase URLs otherwise)
    await _blobDownload(json.downloadUrl, `${currentGarment}-pattern.pdf`);
    trackEvent('download_initiated', { garment_id: currentGarment, price_tier: GARMENTS[currentGarment]?.priceTier });
    // If A0 addon was purchased, trigger A0 + projector downloads and show a notice
    if (json.a0DownloadUrl) {
      setTimeout(() => _blobDownload(json.a0DownloadUrl, `${currentGarment}-pattern-a0.pdf`), 800);
      if (json.projectorDownloadUrl) {
        setTimeout(() => _blobDownload(json.projectorDownloadUrl, `${currentGarment}-pattern-projector.pdf`), 1600);
      }
      const notice = document.createElement('p');
      notice.className = 'a0-download-notice';
      notice.textContent = 'Your A0 + projector files are also downloading. No taping required.';
      btn.parentNode?.insertBefore(notice, btn.nextSibling);
    }
  } catch (err) {
    alert('Download failed. Please try again.');
  } finally {
    btn.disabled    = false;
    btn.textContent = origText;
  }
}

// ═══ PRINT ═══
function printPattern() {
  const g = GARMENTS[currentGarment];
  const { m, opts } = readInputs();
  const pieces       = g.pieces(m, opts);
  // Sanitize all piece polygons for print layout
  for (const p of pieces) {
    if (p.polygon) {
      const orig = p.polygon;
      p.polygon = sanitizePoly(orig);
      if (p.edgeAllowances && p.polygon.length !== orig.length) p.edgeAllowances = null;
    }
    if (p.saPolygon) p.saPolygon = sanitizePoly(p.saPolygon);
  }
  const materials    = g.materials(m, opts);
  const instructions = g.instructions(m, opts);
  const html = generatePrintLayout(g, pieces, materials, instructions, m, opts, selectedPaperSize);
  const win = window.open('', '_blank');
  if (!win) { alert('Allow pop-ups to open the print layout.'); return; }
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.addEventListener('load', () => win.print());
}

// ═══ WIZARD ═══
function showLanding() {
  document.getElementById('landing').style.display = '';
  document.getElementById('wizard').style.display = 'none';
}

function showWizard() {
  document.getElementById('landing').style.display = 'none';
  document.getElementById('wizard').style.display = '';
  goToStep(1);
}

function goToStep(n) {
  currentStep = n;
  document.querySelectorAll('.step-item').forEach(btn => {
    const s = parseInt(btn.dataset.step);
    btn.classList.remove('step-active', 'step-done');
    if (s === n)    btn.classList.add('step-active');
    else if (s < n) btn.classList.add('step-done');
    btn.disabled = s > stepsCompleted + 1;
  });
  for (let i = 1; i <= 4; i++) {
    document.getElementById(`wiz-step-${i}`).style.display = i === n ? '' : 'none';
  }
  if (n === 1) { Promise.all([_loadWishlist(), _loadPurchases()]).then(renderStep1); }
  else if (n === 4) renderStep4();
}

function switchTab(name) {
  activeTab = name;
  for (const t of ['pieces', 'materials', 'instructions', 'print']) {
    const pane = document.getElementById(`s4-pane-${t}`);
    const btn  = document.getElementById(`s4-tab-${t}`);
    if (pane) pane.style.display = t === name ? '' : 'none';
    if (btn)  btn.classList.toggle('s4-tab-active', t === name);
  }
}

async function _loadWishlist() {
  const user = getCurrentUser();
  if (!user) {
    // Guest: use localStorage
    try {
      const stored = JSON.parse(localStorage.getItem('wishlist') || '[]');
      _wishlistSet = new Set(stored);
    } catch { _wishlistSet = new Set(); }
    return;
  }
  const { data } = await getWishlist(user.id);
  _wishlistSet = new Set((data || []).map(r => r.garment_id));
}

async function _loadPurchases() {
  const user = getCurrentUser();
  if (!user) { _purchasedSet = new Set(); return; }
  const { data } = await getPurchases(user.id);
  _purchasedSet = new Set((data || []).map(p => p.garment_id));
}

async function _toggleWishlist(garmentId, heartBtn) {
  const isOn = _wishlistSet.has(garmentId);
  const user  = getCurrentUser();

  if (user) {
    if (isOn) {
      await removeFromWishlist(user.id, garmentId);
      _wishlistSet.delete(garmentId);
    } else {
      await addToWishlist(user.id, garmentId);
      _wishlistSet.add(garmentId);
    }
  } else {
    // Guest: localStorage
    if (isOn) { _wishlistSet.delete(garmentId); }
    else       { _wishlistSet.add(garmentId); }
    localStorage.setItem('wishlist', JSON.stringify([..._wishlistSet]));
  }
  heartBtn.classList.toggle('gmt-heart--on', _wishlistSet.has(garmentId));
  heartBtn.setAttribute('aria-pressed', String(_wishlistSet.has(garmentId)));
}

function renderStep1() {
  const el = document.getElementById('wiz-step-1');
  if (selectedCategory) {
    const cat = GARMENT_CATEGORIES.find(c => c.id === selectedCategory);
    el.innerHTML = `
      <div class="wiz-step-header">
        <button class="wiz-back-cat" id="wiz-back-cat">← All categories</button>
        <h2 class="wiz-step-title">${cat.label}</h2>
        <p class="wiz-step-desc">Select a garment to continue</p>
      </div>
      <div class="gmt-grid">
        ${cat.ids.map(id => {
          const g = GARMENTS[id];
          const wishlisted = _wishlistSet.has(id);
          const owned = _purchasedSet.has(id);
          const price = PATTERN_PRICES[id];
          const dollars = price ? `$${(price.cents / 100).toFixed(0)}` : '';
          return `<button class="gmt-card" data-garment="${id}">
            <div class="gmt-card-img">
              <img src="/garment-illustrations/${id}.svg" alt="${g.name} illustration" width="80" height="100" loading="lazy">
            </div>
            <div class="gmt-card-info">
              <div class="gmt-name">${g.name}</div>
              <div class="gmt-card-meta">
                ${g.difficulty ? `<span class="diff-badge diff-${g.difficulty}">${g.difficulty}</span>` : ''}
                ${owned ? `<span class="gmt-owned-badge">Owned</span>` : dollars ? `<span class="gmt-price">${dollars}</span>` : ''}
              </div>
            </div>
            <button class="gmt-heart${wishlisted ? ' gmt-heart--on' : ''}" data-garment="${id}" aria-label="Wishlist ${g.name}" aria-pressed="${wishlisted}" title="Save to wishlist"><svg viewBox="0 0 24 24" width="14" height="14" fill="${wishlisted ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M12 21C12 21 3 14.5 3 8.5A5.5 5.5 0 0 1 12 5.5 5.5 5.5 0 0 1 21 8.5C21 14.5 12 21 12 21Z"/></svg></button>
          </button>`;
        }).join('')}
      </div>`;
    el.querySelector('#wiz-back-cat').onclick = () => { selectedCategory = null; renderStep1(); };
    el.querySelectorAll('.gmt-heart').forEach(hBtn => {
      hBtn.addEventListener('click', e => {
        e.stopPropagation();
        _toggleWishlist(hBtn.dataset.garment, hBtn);
      });
    });
    el.querySelectorAll('.gmt-card').forEach(btn => {
      btn.onclick = e => {
        if (e.target.closest('.gmt-heart')) return;
        const newGarment = btn.dataset.garment;
        if (newGarment !== currentGarment) {
          currentGarment = newGarment;
          _syncGarmentUrl(currentGarment);
          stepsCompleted = 1;
          renderedGarment = null;
          activeTab = 'pieces';
        }
        if (renderedGarment !== currentGarment) {
          buildMeasureStep();
          buildOptionsStep();
          renderedGarment = currentGarment;
        }
        stepsCompleted = Math.max(stepsCompleted, 1);
        goToStep(2);
      };
    });
  } else {
    el.innerHTML = `
      <div class="wiz-step-header">
        <h2 class="wiz-step-title">Choose a garment</h2>
        <p class="wiz-step-desc">Select a category to browse patterns</p>
      </div>
      <div class="cat-grid">
        ${GARMENT_CATEGORIES.map(cat => `
          <button class="cat-card" data-cat="${cat.id}">
            <div class="cat-label">${cat.label}</div>
            <p class="cat-desc">${cat.desc}</p>
          </button>`).join('')}
      </div>`;
    el.querySelectorAll('.cat-card').forEach(btn => {
      btn.onclick = () => { selectedCategory = btn.dataset.cat; Promise.all([_loadWishlist(), _loadPurchases()]).then(renderStep1); };
    });
  }
}

function buildMeasureStep() {
  const g = GARMENTS[currentGarment];
  const el = document.getElementById('wiz-step-2');
  const isAccessory = g.category === 'accessory';
  const measTitle = g.measurementLabel || (isAccessory ? 'Dimensions' : 'Measurements');
  const measDesc  = isAccessory
    ? `${g.name}: enter your desired dimensions.`
    : `${g.name}: flexible tape over underwear. Don't pull tight.`;

  let html = `<div class="wiz-form-wrap">
    <div class="wiz-form-header">
      <h2 class="wiz-form-title">${measTitle}</h2>
      <p class="wiz-form-desc">${measDesc}</p>
    </div>`;

  if (!isAccessory) {
    html += `<div class="f profile-row">
      <select id="wz-profile-select" title="Load saved profile">
        <option value="">- saved profiles -</option>
        ${loadProfiles().map(p => `<option value="${p.name}">${p.name}</option>`).join('')}
      </select>
      <button class="btn-xs" id="wz-save-profile-btn" title="Save current measurements">Save</button>
      <button class="btn-xs btn-xs-del" id="wz-del-profile-btn" title="Delete selected profile">&times;</button>
      <input type="text" id="wz-profile-name-input" placeholder="Profile name" style="width:120px">
    </div>`;
  }

  html += `<button class="btn-s" id="wz-how-to-measure-btn" style="margin-bottom:6px">${isAccessory ? 'Dimension guide ▾' : 'How to measure ▾'}</button>
    <div id="wz-mt-guide-container" style="display:none"></div>`;

  for (const mId of g.measurements) {
    const mDef = MEASUREMENTS[mId];
    if (!mDef) continue;
    const mDefault = g.measurementDefaults?.[mId] ?? mDef.default;
    html += `<div class="f"><label>${mDef.label}</label>
      <div class="hint">${mDef.instruction}</div>
      <input type="number" id="wz-m-${mId}" value="${mDefault}" step="${mDef.step}"></div>`;
  }

  const optIds = relevantOptionalIds(g);
  if (optIds.length) {
    html += `<details class="adv-meas"><summary>Advanced Measurements</summary>
      <p class="adv-hint">Leave blank to use calculated defaults. Fill in for more accurate shaping.</p>`;
    for (const mId of optIds) {
      const mDef = OPTIONAL_MEASUREMENTS[mId];
      if (!mDef) continue;
      html += `<div class="f"><label>${mDef.label}</label>
        <div class="hint">${mDef.instruction}</div>
        <input type="number" id="wz-m-${mId}" value="" placeholder="optional" step="${mDef.step}" min="${mDef.min}" max="${mDef.max}"></div>`;
    }
    html += `</details>`;
  }

  html += `<div class="wiz-nav-row">
    <button class="btn-s" id="wiz-s2-back">← Back</button>
    <button class="btn" id="wiz-s2-next">Next: Customize →</button>
  </div></div>`;

  el.innerHTML = html;

  // Sync Supabase profiles into localStorage so the dropdown reflects any
  // profiles saved from the account dashboard. Skip for accessories (no body profiles).
  if (!isAccessory) {
    const _wizUser = getCurrentUser();
    if (_wizUser) {
      getMeasurementProfiles(_wizUser.id).then(({ data: remoteProfiles }) => {
        if (!remoteProfiles?.length) return;
        const local = loadProfiles();
        const localNames = new Set(local.map(p => p.name));
        let added = false;
        for (const rp of remoteProfiles) {
          if (!localNames.has(rp.name) && rp.measurements) {
            local.push({ name: rp.name, measurements: rp.measurements });
            added = true;
          }
        }
        if (added) {
          localStorage.setItem(PROFILES_KEY, JSON.stringify(local));
          refreshProfileDropdown();
        }
      }).catch(() => {});
    }

    // Clear profiles on sign-out (privacy: don't leave personal measurements in localStorage)
    // Reload profiles from Supabase on sign-in
    onUserChange(async (user) => {
      if (!user) {
        localStorage.removeItem(PROFILES_KEY);
        _setActiveProfile(null, null);
        refreshProfileDropdown();
        return;
      }
      const { data: remoteProfiles } = await getMeasurementProfiles(user.id);
      if (remoteProfiles?.length) {
        const local = remoteProfiles.map(rp => ({ name: rp.name, measurements: rp.measurements }));
        localStorage.setItem(PROFILES_KEY, JSON.stringify(local));
      }
      refreshProfileDropdown();
    });
  }

  document.getElementById('wz-save-profile-btn')?.addEventListener('click', saveCurrentProfile);
  document.getElementById('wz-del-profile-btn')?.addEventListener('click', deleteCurrentProfile);
  document.getElementById('wz-profile-select')?.addEventListener('change', e => {
    if (e.target.value) applyProfile(e.target.value);
  });
  document.getElementById('wz-how-to-measure-btn').addEventListener('click', () => {
    const container = document.getElementById('wz-mt-guide-container');
    const btn = document.getElementById('wz-how-to-measure-btn');
    const hidden = container.style.display === 'none';
    if (hidden) {
      container.innerHTML = renderMeasurementTeacher(g.measurements);
      container.style.display = '';
      btn.textContent = isAccessory ? 'Dimension guide ▴' : 'How to measure ▴';
    } else {
      container.style.display = 'none';
      btn.textContent = isAccessory ? 'Dimension guide ▾' : 'How to measure ▾';
    }
  });
  document.getElementById('wiz-s2-back').addEventListener('click', () => goToStep(1));
  document.getElementById('wiz-s2-next').addEventListener('click', () => {
    _syncWizardToPanel(g, 'measurements');
    stepsCompleted = Math.max(stepsCompleted, 2);
    trackEvent('measurements_entered', { garment_id: currentGarment });
    goToStep(3);
  });
}

function buildOptionsStep() {
  const g = GARMENTS[currentGarment];
  const el = document.getElementById('wiz-step-3');
  let html = `<div class="wiz-form-wrap">
    <div class="wiz-form-header">
      <h2 class="wiz-form-title">Customize</h2>
      <p class="wiz-form-desc">${g.name}: adjust fit and style options</p>
    </div>`;

  for (const [key, opt] of Object.entries(g.options)) {
    if (opt.type === 'select') {
      html += `<div class="f"><label>${opt.label}</label><select id="wz-o-${key}">
        ${opt.values.map(v =>
          `<option value="${v.value}" ${v.value == opt.default ? 'selected' : ''}>${v.label}${v.reference ? ` · ${v.reference}` : ''}</option>`
        ).join('')}
      </select></div>`;
    } else if (opt.type === 'number') {
      html += `<div class="f"><label>${opt.label}</label>
        <input type="number" id="wz-o-${key}" value="${opt.default}" step="${opt.step || 0.25}"></div>`;
    }
  }

  html += `<div class="wiz-nav-row">
    <button class="btn-s" id="wiz-s3-back">← Back</button>
    <button class="btn" id="wiz-s3-next">Generate Pattern →</button>
  </div></div>`;

  el.innerHTML = html;

  // Rise style auto-fill (cross-step: wz-m-rise is in step 2, wz-o-riseStyle/wz-o-riseOverride are here)
  const riseStyleEl    = document.getElementById('wz-o-riseStyle');
  const riseOverrideEl = document.getElementById('wz-o-riseOverride');
  if (riseStyleEl && riseOverrideEl) {
    const RISE_OFFSETS = { 'ultra-low': -2.5, low: -1.5, mid: 0, high: 1.5, 'ultra-high': 3.0 };
    const updateRise = () => {
      const bodyRise = parseFloat(document.getElementById('wz-m-rise')?.value) || 10;
      riseOverrideEl.value = (bodyRise + (RISE_OFFSETS[riseStyleEl.value] ?? 0)).toFixed(2);
    };
    riseStyleEl.addEventListener('change', updateRise);
    document.getElementById('wz-m-rise')?.addEventListener('input', updateRise);
    updateRise();
  }

  document.getElementById('wiz-s3-back').addEventListener('click', () => goToStep(2));
  document.getElementById('wiz-s3-next').addEventListener('click', () => {
    _syncWizardToPanel(g, 'options');
    stepsCompleted = Math.max(stepsCompleted, 3);
    const { opts } = readInputs();
    trackEvent('pattern_generated', { garment_id: currentGarment, options: opts });
    goToStep(4);
  });
}

function renderStep4() {
  stepsCompleted = Math.max(stepsCompleted, 4);
  const stepEl = document.getElementById('wiz-step-4');
  if (!stepEl.querySelector('.wiz-s4-bar')) {
    const bar = document.createElement('div');
    bar.className = 'wiz-s4-bar';
    bar.innerHTML = `
      <button class="btn-s wiz-s4-back-btn" id="wiz-s4-back">← Customize</button>
      <div class="s4-tabs" id="s4-tabs">
        <button class="s4-tab" id="s4-tab-pieces"       data-tab="pieces">Pieces</button>
        <button class="s4-tab" id="s4-tab-materials"    data-tab="materials">Materials</button>
        <button class="s4-tab" id="s4-tab-instructions" data-tab="instructions">Instructions</button>
        <button class="s4-tab" id="s4-tab-print"        data-tab="print">Print</button>
      </div>`;
    stepEl.insertBefore(bar, document.getElementById('output'));
    document.getElementById('wiz-s4-back').addEventListener('click', () => goToStep(3));
    document.getElementById('s4-tabs').addEventListener('click', e => {
      const tab = e.target.closest('.s4-tab');
      if (tab) switchTab(tab.dataset.tab);
    });
  }
  generate();
}

// ═══ DARK MODE ═══
function applyTheme(dark) {
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  const icon = document.querySelector('#theme-btn .dark-mode-toggle__icon');
  if (icon) icon.classList.toggle('dark-mode-toggle__icon--moon', dark);
}

function toggleTheme() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const next = !isDark;
  localStorage.setItem('theme', next ? 'dark' : 'light');
  applyTheme(next);
}

// ═══ BOOT ═══
function getSavedTheme() {
  try { return localStorage.getItem('theme'); } catch { return null; }
}
applyTheme(getSavedTheme() === 'dark');
document.getElementById('theme-btn')?.addEventListener('click', toggleTheme);
document.getElementById('hdr-logo')?.addEventListener('click', showLanding);

// Re-download from account dashboard: open wizard at the right garment + download tab
window.addEventListener('pp:redownload', e => {
  const { garmentId } = e.detail;
  showWizard();
  currentGarment = garmentId;
  _syncGarmentUrl(currentGarment);
  const sel = document.getElementById('garment-select');
  if (sel) sel.value = garmentId;
  buildInputs();
  generate();
  // Jump straight to step 4 and open the print/download tab
  goToStep(4);
  switchTab('print');
});

initAuthModal();

// Landing email capture
document.getElementById('land-email-btn')?.addEventListener('click', async () => {
  const input = document.getElementById('land-email-input');
  const btn   = document.getElementById('land-email-btn');
  const email = input?.value.trim();
  if (!email || !email.includes('@')) return;

  btn.disabled    = true;
  btn.textContent = '...';

  try {
    await fetch('/api/join-list', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email }),
    });
    storeEmail(email);
    input.value       = '';
    input.placeholder = "You're in!";
    btn.textContent   = 'Done';
  } catch {
    btn.disabled    = false;
    btn.textContent = 'Join';
  }
});

// Get Started / Get Your Pattern — all CTA buttons
document.getElementById('get-started-btn')?.addEventListener('click', showWizard);
document.getElementById('hdr-cta-btn')?.addEventListener('click', showWizard);
document.getElementById('hdr-cta-btn-m')?.addEventListener('click', () => {
  document.getElementById('hdr-nav-mobile')?.classList.remove('open');
  showWizard();
});
document.querySelectorAll('.lp-cta-btn').forEach(btn => btn.addEventListener('click', showWizard));

// "How It Works" smooth scroll from nav
function scrollToHowItWorks(e) {
  const target = document.getElementById('how-it-works');
  if (!target) return;
  // Only intercept if we're on the landing page
  const landing = document.getElementById('landing');
  if (landing && landing.style.display !== 'none') {
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth' });
    document.getElementById('hdr-nav-mobile')?.classList.remove('open');
  }
}
document.getElementById('nav-how-it-works')?.addEventListener('click', scrollToHowItWorks);
document.getElementById('nav-how-it-works-m')?.addEventListener('click', scrollToHowItWorks);

// Landing page FAQ accordion
document.getElementById('lp-faq-accordion')?.addEventListener('click', e => {
  const btn = e.target.closest('.faq-q');
  if (!btn) return;
  const item = btn.closest('.faq-item');
  const isOpen = btn.getAttribute('aria-expanded') === 'true';
  btn.setAttribute('aria-expanded', String(!isOpen));
  item.classList.toggle('open', !isOpen);
});

// If arriving from /redeem page with a redemption code, open wizard at step 2 with garment locked
if (_isRedemptionMode && _urlRedeemFlag) {
  const sel = document.getElementById('garment-select');
  if (sel) { sel.value = currentGarment; sel.disabled = true; }
  showWizard();
  buildInputs();
  stepsCompleted = 1; // allow access to step 2
  goToStep(2);
}
// If ?garment= was in the URL (non-redemption), open the wizard and pre-select it
else if (_urlGarmentParam && GARMENTS[_urlGarmentParam]) {
  const sel = document.getElementById('garment-select');
  if (sel) sel.value = currentGarment;
  showWizard();
  buildInputs();
  generate();
  goToStep(4);
}

// Real Makes gallery on home page — loads async, hidden if empty
(function loadRealMakes() {
  const el = document.getElementById('real-makes-home');
  if (el) renderMakesGallery(el, { limit: 8 });
})();

// Pattern generation counter — fetch once and display
(function loadPatternCount() {
  const el = document.getElementById('land-pattern-count');
  if (!el) return;
  fetch('/api/pattern-count').then(r => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  }).then(({ count }) => {
    if (count && count > 0) {
      el.textContent = `${count.toLocaleString()} custom patterns generated`;
    }
  }).catch(() => {});
})();

// Stepper back-navigation via event delegation
document.getElementById('stepper')?.addEventListener('click', e => {
  const btn = e.target.closest('.step-item');
  if (!btn || btn.disabled) return;
  const s = parseInt(btn.dataset.step);
  if (s <= stepsCompleted + 1) goToStep(s);
});

// Mobile hamburger
const _mobileNav = document.getElementById('hdr-nav-mobile');
document.getElementById('hdr-menu-btn')?.addEventListener('click', () => {
  _mobileNav?.classList.toggle('open');
});
document.addEventListener('click', e => {
  const menuBtn = document.getElementById('hdr-menu-btn');
  if (_mobileNav?.classList.contains('open') &&
      !_mobileNav.contains(e.target) && !menuBtn?.contains(e.target)) {
    _mobileNav.classList.remove('open');
  }
});
document.getElementById('theme-btn-m')?.addEventListener('click', () => {
  document.getElementById('theme-btn')?.click();
  _mobileNav?.classList.remove('open');
});

// ── Exit-intent measurement save capture (desktop only, once per session) ──────
(function initExitIntent() {
  const STORAGE_KEY = 'pp-exit-shown';
  if (sessionStorage.getItem(STORAGE_KEY)) return;
  if (getCurrentUser()) return; // already signed in — no banner needed

  let banner = null;

  function createBanner() {
    if (banner) return;

    // Snapshot any measurements the user has entered so far
    let measSnapshot = {};
    try { measSnapshot = readInputs().m ?? {}; } catch { /* no measurements yet */ }
    const hasMeas = Object.values(measSnapshot).some(v => v > 0);

    banner = document.createElement('div');
    banner.id = 'exit-intent-banner';
    banner.innerHTML = `
      <div class="exit-intent-inner">
        <p class="exit-intent-msg">Save your measurements and get your first pattern free.</p>
        <form class="exit-intent-form" id="exit-intent-form">
          <input type="email" id="exit-intent-email" placeholder="your@email.com" autocomplete="email" required>
          <button type="submit" class="exit-intent-btn">Save${hasMeas ? ' & get free pattern' : ''}</button>
        </form>
        <button class="exit-intent-close" id="exit-intent-close" aria-label="Dismiss">&#x2715;</button>
      </div>`;
    document.body.appendChild(banner);
    sessionStorage.setItem(STORAGE_KEY, '1');

    document.getElementById('exit-intent-close')?.addEventListener('click', () => {
      banner.remove();
      banner = null;
    });

    document.getElementById('exit-intent-form')?.addEventListener('submit', async e => {
      e.preventDefault();
      const emailInput = document.getElementById('exit-intent-email');
      const email = emailInput?.value.trim();
      if (!email || !email.includes('@')) return;

      const submitBtn = e.target.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Saving…';

      try {
        await fetch('/api/save-meas-capture', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ email, measurements: hasMeas ? measSnapshot : {} }),
        });
        const inner = banner.querySelector('.exit-intent-inner');
        if (inner) inner.innerHTML = '<p class="exit-intent-success">Your profile is saved. Come back anytime.</p>';
        setTimeout(() => { banner?.remove(); banner = null; }, 3500);
      } catch {
        submitBtn.disabled    = false;
        submitBtn.textContent = 'Save';
      }
    });
  }

  // Trigger when mouse moves above y=10 on desktop (toward browser bar/tabs)
  if (window.matchMedia('(pointer: fine)').matches) {
    document.addEventListener('mousemove', function onMove(e) {
      if (e.clientY <= 10) {
        document.removeEventListener('mousemove', onMove);
        createBanner();
      }
    });
  }
})();

// Analytics — site-wide tracking + hero A/B test
initSiteTracking();
initHeroABTest();
initSocialProofABTest();
