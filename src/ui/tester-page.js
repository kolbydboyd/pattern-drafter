// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Tester program public page — application form + featured gallery.

import '../analytics.js';
import './auth-modal.js';
import { getUser, getSession, onAuthStateChange } from '../lib/auth.js';
import { initLocale, loadLocale, applyI18nDOM } from '../lib/i18n.js';
import {
  getTesterApplication,
  getFeaturedTesterSubmissions,
} from '../lib/db.js';
import GARMENTS from '../garments/index.js';
import { MEASUREMENTS } from '../engine/measurements.js';

// ── Theme toggle (shared with page.js) ──────────────────────────────────────

function getSavedTheme() {
  try { return localStorage.getItem('theme'); } catch { return null; }
}

function applyTheme(dark) {
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  const icon = document.querySelector('#theme-btn .dark-mode-toggle__icon');
  if (icon) icon.classList.toggle('dark-mode-toggle__icon--moon', dark);
}

const _saved = getSavedTheme();
applyTheme(_saved !== null ? _saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches);

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
  if (getSavedTheme() === null) applyTheme(e.matches);
});

document.getElementById('theme-btn')?.addEventListener('click', () => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const next = !isDark;
  localStorage.setItem('theme', next ? 'dark' : 'light');
  applyTheme(next);
});

document.getElementById('hdr-logo')?.addEventListener('click', () => { location.href = '/'; });

// Mobile hamburger
const menuBtn  = document.getElementById('hdr-menu-btn');
const mobileNav = document.getElementById('hdr-nav-mobile');
menuBtn?.addEventListener('click', () => { mobileNav?.classList.toggle('open'); });
document.addEventListener('click', e => {
  if (mobileNav?.classList.contains('open') &&
      !mobileNav.contains(e.target) && !menuBtn?.contains(e.target)) {
    mobileNav.classList.remove('open');
  }
});
document.getElementById('theme-btn-m')?.addEventListener('click', () => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const next = !isDark;
  localStorage.setItem('theme', next ? 'dark' : 'light');
  applyTheme(next);
  mobileNav?.classList.remove('open');
});

// ── Toast ────────────────────────────────────────────────────────────────────

function _showToast(msg) {
  const t = document.createElement('div');
  t.textContent = msg;
  t.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#4a8a5a;color:#fff;padding:8px 18px;border-radius:4px;font-family:"IBM Plex Mono",monospace;font-size:.78rem;z-index:9999;opacity:1;transition:opacity .4s ease .6s;pointer-events:none';
  document.body.appendChild(t);
  requestAnimationFrame(() => requestAnimationFrame(() => { t.style.opacity = '0'; }));
  setTimeout(() => t.remove(), 1200);
}

// ── Constants ────────────────────────────────────────────────────────────────

const SPECIALTIES = [
  { id: 'woven_tops',     label: 'Woven Tops' },
  { id: 'knit_tops',      label: 'Knit Tops' },
  { id: 'pants',          label: 'Pants & Shorts' },
  { id: 'skirts',         label: 'Skirts' },
  { id: 'dresses',        label: 'Dresses' },
  { id: 'outerwear',      label: 'Outerwear' },
  { id: 'activewear',     label: 'Activewear' },
  { id: 'tailoring',      label: 'Tailoring' },
  { id: 'menswear',       label: 'Menswear' },
  { id: 'childrenswear',  label: 'Childrenswear' },
];

const MACHINES = [
  { id: 'domestic_sewing',   label: 'Domestic Sewing Machine' },
  { id: 'industrial_sewing', label: 'Industrial Sewing Machine' },
  { id: 'serger',            label: 'Serger / Overlocker' },
  { id: 'coverstitch',       label: 'Coverstitch' },
  { id: 'embroidery',        label: 'Embroidery Machine' },
];

const PATTERN_CATEGORIES = [
  { id: 'lower_body', label: 'Lower Body (pants, shorts)' },
  { id: 'skirts',     label: 'Skirts' },
  { id: 'upper_body', label: 'Upper Body (tops, shirts)' },
  { id: 'dresses',    label: 'Dresses & Jumpsuits' },
  { id: 'outerwear',  label: 'Outerwear & Jackets' },
];

// Measurement IDs to show per selected pattern category
const CATEGORY_MEASUREMENTS = {
  lower_body: ['waist', 'hip', 'rise', 'thigh', 'inseam'],
  skirts:     ['waist', 'hip', 'skirtLength'],
  upper_body: ['chest', 'shoulder', 'neck', 'torsoLength'],
  dresses:    ['chest', 'shoulder', 'waist', 'hip', 'fullLength'],
  outerwear:  ['chest', 'shoulder', 'neck', 'torsoLength'],
};

// ── Measurement field helpers ─────────────────────────────────────────────────

function _getRelevantMeasurementIds(selectedCategories) {
  const ids = new Set();
  for (const cat of selectedCategories) {
    for (const id of (CATEGORY_MEASUREMENTS[cat] || [])) ids.add(id);
  }
  return [...ids];
}

function _measurementFieldsHtml(selectedCategories) {
  const ids = _getRelevantMeasurementIds(selectedCategories);
  if (!ids.length) return '';

  const fields = ids.map(id => {
    const m = MEASUREMENTS[id];
    if (!m) return '';
    return `
    <div class="tester-meas-field">
      <label class="tester-field-label" for="meas_${id}">${m.label}</label>
      <div class="tester-meas-row">
        <input
          type="number"
          id="meas_${id}"
          name="meas_${id}"
          class="tester-input"
          min="${m.min}"
          max="${m.max}"
          step="${m.step}"
          placeholder="${m.default}"
          aria-label="${m.label} in inches"
        >
        <span class="tester-meas-unit">in</span>
      </div>
      <span class="tester-meas-hint">${m.instruction}</span>
    </div>`;
  }).join('');

  return `
  <div class="tester-field" id="tester-meas-fields">
    <label class="tester-field-label">Body Measurements</label>
    <p class="tester-field-hint">All measurements in inches. Enter what you can — partial sets are fine for your application.</p>
    <div class="tester-meas-grid">${fields}</div>
  </div>`;
}

function _collectMeasurements(fd) {
  const out = {};
  for (const [key, val] of fd.entries()) {
    if (!key.startsWith('meas_')) continue;
    const id = key.slice(5);
    const n = parseFloat(val);
    if (!isNaN(n) && n > 0) out[id] = n;
  }
  return out;
}

// ── Application form ─────────────────────────────────────────────────────────

async function _renderApplySection() {
  const container = document.getElementById('tester-apply-container');
  if (!container) return;

  const { user } = await getUser();
  if (!user) {
    container.innerHTML = `<p class="tester-login-prompt">
      <a href="/?signup=1" class="tester-link">Sign in or create an account</a> to apply.
    </p>`;
    return;
  }

  // Check existing application
  const { data: app } = await getTesterApplication(user.id);

  if (app?.status === 'approved') {
    const slotHtml = await _approvedSlotHtml();
    container.innerHTML = `
      <div class="tester-status-card tester-status-approved">
        <strong>You're an approved tester.</strong>
        <p>Head to your <a href="/?account=tester" class="tester-link">account dashboard</a> to view assignments and submit feedback.</p>
        ${slotHtml}
      </div>`;
    return;
  }

  if (app?.status === 'pending') {
    container.innerHTML = `
      <div class="tester-status-card tester-status-pending">
        <strong>Application submitted</strong>
        <p>We review applications weekly. You'll get an email when we've made a decision.</p>
        <button class="tester-btn-ghost" id="tester-withdraw-btn">Withdraw Application</button>
      </div>`;
    document.getElementById('tester-withdraw-btn')?.addEventListener('click', async () => {
      if (!confirm('Withdraw your tester application?')) return;
      const { session } = await getSession();
      const resp = await fetch('/api/tester-apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ action: 'withdraw' }),
      });
      if (resp.ok) {
        _showToast('Application withdrawn');
        setTimeout(() => _renderApplySection(), 600);
      }
    });
    return;
  }

  if (app?.status === 'rejected') {
    container.innerHTML = `
      <div class="tester-status-card tester-status-rejected">
        <strong>Application not accepted</strong>
        <p>We weren't able to accept your application this round. You're welcome to re-apply below.</p>
      </div>` + _applicationFormHtml();
    _bindForm(user);
    return;
  }

  // No application — show form
  container.innerHTML = _applicationFormHtml();
  _bindForm(user);
}

async function _approvedSlotHtml() {
  try {
    const { session } = await getSession();
    if (!session) return '';
    const resp = await fetch('/api/tester-slots', {
      headers: { 'Authorization': `Bearer ${session.access_token}` },
    });
    if (!resp.ok) return '';
    const s = await resp.json();
    const myRemaining = s.myRemaining ?? 0;
    const progRemaining = s.programRemaining ?? 0;
    return `<div class="tester-slots-info">
      You have <strong>${myRemaining} paid slot${myRemaining !== 1 ? 's' : ''} remaining</strong> this month.
      ${progRemaining} of ${s.programCap} program slots available.
      Tests over the cap are still accepted and paid the following cycle.
    </div>`;
  } catch {
    return '';
  }
}

function _applicationFormHtml() {
  const specCheckboxes = SPECIALTIES.map(s =>
    `<label class="tester-check"><input type="checkbox" name="specialties" value="${s.id}"> ${s.label}</label>`
  ).join('');

  const machineCheckboxes = MACHINES.map(m =>
    `<label class="tester-check"><input type="checkbox" name="machineTypes" value="${m.id}"> ${m.label}</label>`
  ).join('');

  const catCheckboxes = PATTERN_CATEGORIES.map(c =>
    `<label class="tester-check"><input type="checkbox" name="patternCategories" value="${c.id}" class="tester-cat-check"> ${c.label}</label>`
  ).join('');

  return `
  <form id="tester-apply-form" class="tester-form">

    <div class="tester-field">
      <label class="tester-field-label" for="tester-fullname">Full Name *</label>
      <input type="text" id="tester-fullname" name="fullName" class="tester-input" placeholder="Your name" required maxlength="120">
    </div>

    <div class="tester-field">
      <label class="tester-field-label" for="tester-location">Location</label>
      <p class="tester-field-hint">City, state, country. Used if we ever need to ship materials.</p>
      <input type="text" id="tester-location" name="location" class="tester-input" placeholder="e.g. Austin, TX, USA" maxlength="200">
    </div>

    <div class="tester-field">
      <label class="tester-field-label">Sewing Experience *</label>
      <select name="experience" class="tester-select" required>
        <option value="">Select your level</option>
        <option value="beginner">Beginner (under 1 year)</option>
        <option value="intermediate">Intermediate (1-5 years)</option>
        <option value="advanced">Advanced (5+ years)</option>
      </select>
    </div>

    <div class="tester-field">
      <label class="tester-field-label">Specialties</label>
      <p class="tester-field-hint">What do you sew most? Check all that apply.</p>
      <div class="tester-check-grid">${specCheckboxes}</div>
    </div>

    <div class="tester-field">
      <label class="tester-field-label">Machines Available</label>
      <div class="tester-check-grid">${machineCheckboxes}</div>
    </div>

    <div class="tester-field">
      <label class="tester-field-label">Pattern Categories to Test *</label>
      <p class="tester-field-hint">Check what you want to test. This determines which body measurements we ask for.</p>
      <div class="tester-check-grid" id="tester-cat-grid">${catCheckboxes}</div>
    </div>

    <div id="tester-meas-container"></div>

    <div class="tester-field">
      <label class="tester-check">
        <input type="checkbox" name="hasPrinter" value="on">
        I have access to a printer (standard letter/A4 or large-format)
      </label>
    </div>

    <div class="tester-field">
      <label class="tester-field-label">Social Handle</label>
      <input type="text" name="socialHandle" class="tester-input" placeholder="@yourhandle" maxlength="100">
    </div>

    <div class="tester-field">
      <label class="tester-field-label">Portfolio / Blog URL</label>
      <input type="url" name="portfolioUrl" class="tester-input" placeholder="https://" maxlength="500">
    </div>

    <div class="tester-field">
      <label class="tester-field-label">Why do you want to test patterns? *</label>
      <textarea name="whyTest" class="tester-textarea" rows="4" placeholder="Tell us what interests you about the program and what you hope to get from it." required minlength="10" maxlength="2000"></textarea>
    </div>

    <div class="tester-consent-block">
      <p style="font-size:.82rem;color:var(--mid);margin:0 0 4px">
        Before applying, read the <a href="/tester-agreement" target="_blank" class="tester-agreement-link">full Tester Agreement</a>.
        It covers compensation ($30 per completed test), catalog access, confidentiality, and media rights.
      </p>

      <label class="tester-consent-std">
        <input type="checkbox" name="agreementAccepted" id="tester-agreement-check">
        <span class="tester-consent-std-label">I have read and agree to the <a href="/tester-agreement" target="_blank" class="tester-agreement-link">Pattern Tester Agreement</a>, including the compensation terms, deliverable requirements, confidentiality, and independent contractor status.</span>
      </label>
      <div class="tester-consent-error" id="tester-agreement-error">You must accept the Tester Agreement to apply.</div>

      <label class="tester-consent-required">
        <input type="checkbox" name="mediaConsent" id="tester-media-check">
        <span class="tester-consent-required-label"><strong>Required.</strong> I grant People's Patterns a perpetual, royalty-free license to use my submitted photos and videos — including on-body shots and my likeness — for marketing on their website, Instagram, TikTok, Pinterest, and paid ads.</span>
      </label>
      <div class="tester-consent-error" id="tester-media-error">Photo and media consent is required to apply.</div>
    </div>

    <button type="submit" class="tester-btn" id="tester-submit-btn" style="margin-top:20px">Submit Application</button>
    <p class="tester-form-note">We'll email you when your application has been reviewed.</p>
  </form>`;
}

function _bindForm(user) {
  const form = document.getElementById('tester-apply-form');
  if (!form) return;

  // Dynamic measurement fields based on selected categories
  const catGrid = document.getElementById('tester-cat-grid');
  const measContainer = document.getElementById('tester-meas-container');
  if (catGrid && measContainer) {
    catGrid.addEventListener('change', () => {
      const selected = [...catGrid.querySelectorAll('input[name="patternCategories"]:checked')]
        .map(el => el.value);
      measContainer.innerHTML = _measurementFieldsHtml(selected);
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Explicit consent validation
    const agreementChecked = form.querySelector('#tester-agreement-check')?.checked;
    const mediaChecked     = form.querySelector('#tester-media-check')?.checked;
    const agreementErr     = document.getElementById('tester-agreement-error');
    const mediaErr         = document.getElementById('tester-media-error');

    let blocked = false;
    if (!agreementChecked) {
      if (agreementErr) agreementErr.classList.add('visible');
      blocked = true;
    } else {
      if (agreementErr) agreementErr.classList.remove('visible');
    }
    if (!mediaChecked) {
      if (mediaErr) mediaErr.classList.add('visible');
      blocked = true;
    } else {
      if (mediaErr) mediaErr.classList.remove('visible');
    }
    if (blocked) return;

    const btn = document.getElementById('tester-submit-btn');
    btn.disabled = true;
    btn.textContent = 'Submitting...';

    const fd = new FormData(form);
    const specialties       = fd.getAll('specialties');
    const machineTypes      = fd.getAll('machineTypes');
    const patternCategories = fd.getAll('patternCategories');
    const measurements      = _collectMeasurements(fd);

    const { session } = await getSession();
    if (!session) {
      btn.disabled = false;
      btn.textContent = 'Submit Application';
      alert('Please sign in first.');
      return;
    }

    try {
      const resp = await fetch('/api/tester-apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          experience:        fd.get('experience'),
          specialties,
          machineTypes,
          socialHandle:      fd.get('socialHandle'),
          portfolioUrl:      fd.get('portfolioUrl'),
          whyTest:           fd.get('whyTest'),
          fullName:          fd.get('fullName'),
          location:          fd.get('location'),
          patternCategories,
          measurements,
          hasPrinter:        fd.get('hasPrinter') === 'on',
          agreementAccepted: !!agreementChecked,
          mediaConsent:      !!mediaChecked,
          agreementVersion:  'v1.0',
        }),
      });

      const result = await resp.json();
      if (!resp.ok) {
        alert(result.error || 'Something went wrong');
        btn.disabled = false;
        btn.textContent = 'Submit Application';
        return;
      }

      _showToast('Application submitted!');
      _renderApplySection();
    } catch (err) {
      console.error('tester apply error:', err);
      alert('Network error — please try again.');
      btn.disabled = false;
      btn.textContent = 'Submit Application';
    }
  });
}

// ── Featured gallery ─────────────────────────────────────────────────────────

async function _renderGallery() {
  const container = document.getElementById('tester-gallery-container');
  if (!container) return;

  const { data, error } = await getFeaturedTesterSubmissions();
  if (error || !data?.length) {
    container.innerHTML = `<p class="tester-empty">Featured tester makes will appear here once submissions start rolling in.</p>`;
    return;
  }

  let html = '<div class="tester-gallery-grid">';
  for (const sub of data) {
    const garment = GARMENTS[sub.garment_id];
    const name    = garment?.name || sub.garment_id;
    const photo   = sub.photos?.[0] || '';
    const caption = sub.photo_captions?.[0] || '';
    const handle  = sub.social_handle ? `<span class="tester-gallery-handle">${sub.social_handle}</span>` : '';

    html += `
    <div class="tester-gallery-card">
      ${photo ? `<img class="tester-gallery-img" src="${photo}" alt="${caption || name + ' by tester'}" loading="lazy">` : '<div class="tester-gallery-placeholder"></div>'}
      <div class="tester-gallery-info">
        <span class="tester-gallery-garment">${name}</span>
        ${handle}
        <span class="tester-gallery-fit">${_fitLabel(sub.overall_fit)}</span>
      </div>
      ${sub.fit_notes ? `<p class="tester-gallery-quote">"${sub.fit_notes.slice(0, 150)}${sub.fit_notes.length > 150 ? '...' : ''}"</p>` : ''}
      ${sub.fabric_used ? `<p class="tester-gallery-fabric">Fabric: ${sub.fabric_used}</p>` : ''}
    </div>`;
  }
  html += '</div>';
  container.innerHTML = html;
}

function _fitLabel(fit) {
  const labels = { perfect: 'Perfect fit', good: 'Good fit', needs_adjustment: 'Needs adjustment', poor: 'Poor fit' };
  return labels[fit] || fit;
}

// ── Init ─────────────────────────────────────────────────────────────────────

loadLocale(initLocale()).then(() => applyI18nDOM(document.body));

_renderApplySection();
_renderGallery();

onAuthStateChange(() => {
  _renderApplySection();
});
