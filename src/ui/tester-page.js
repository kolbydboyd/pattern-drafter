// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Tester program public page — application form + featured gallery.

import { inject } from '@vercel/analytics';
import '../analytics.js';
import './auth-modal.js';
import { getUser, getSession, onAuthStateChange } from '../lib/auth.js';
import {
  getTesterApplication,
  getFeaturedTesterSubmissions,
} from '../lib/db.js';
import GARMENTS from '../garments/index.js';

inject();

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
    container.innerHTML = `
      <div class="tester-status-card tester-status-approved">
        <strong>You're an approved tester!</strong>
        <p>Head to your <a href="/?account=tester" class="tester-link">account dashboard</a> to view assignments and submit feedback.</p>
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

function _applicationFormHtml() {
  const specCheckboxes = SPECIALTIES.map(s =>
    `<label class="tester-check"><input type="checkbox" name="specialties" value="${s.id}"> ${s.label}</label>`
  ).join('');

  const machineCheckboxes = MACHINES.map(m =>
    `<label class="tester-check"><input type="checkbox" name="machineTypes" value="${m.id}"> ${m.label}</label>`
  ).join('');

  return `
  <form id="tester-apply-form" class="tester-form">
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

    <button type="submit" class="tester-btn" id="tester-submit-btn">Submit Application</button>
    <p class="tester-form-note">We'll email you when your application has been reviewed.</p>
  </form>`;
}

function _bindForm(user) {
  const form = document.getElementById('tester-apply-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('tester-submit-btn');
    btn.disabled = true;
    btn.textContent = 'Submitting...';

    const fd = new FormData(form);
    const specialties  = fd.getAll('specialties');
    const machineTypes = fd.getAll('machineTypes');

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
          experience:   fd.get('experience'),
          specialties,
          machineTypes,
          socialHandle: fd.get('socialHandle'),
          portfolioUrl: fd.get('portfolioUrl'),
          whyTest:      fd.get('whyTest'),
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

_renderApplySection();
_renderGallery();

onAuthStateChange(() => {
  _renderApplySection();
});
