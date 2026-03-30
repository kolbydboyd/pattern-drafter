// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Minimal JS for static pages (FAQ, Terms, Privacy) — theme toggle only.

import { inject } from '@vercel/analytics';
inject();

function getSavedTheme() {
  try { return localStorage.getItem('theme'); } catch { return null; }
}

function applyTheme(dark) {
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  const icon = document.querySelector('#theme-btn .dark-mode-toggle__icon');
  if (icon) icon.classList.toggle('dark-mode-toggle__icon--moon', dark);
}

// Default to system preference when no saved preference exists
const _saved = getSavedTheme();
applyTheme(_saved !== null ? _saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches);

// Track system preference changes (only when user hasn't overridden)
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
  if (getSavedTheme() === null) applyTheme(e.matches);
});

document.getElementById('theme-btn')?.addEventListener('click', () => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const next = !isDark;
  localStorage.setItem('theme', next ? 'dark' : 'light');
  applyTheme(next);
});

document.getElementById('hdr-logo')?.addEventListener('click', () => {
  location.href = '/';
});

// Mobile hamburger
const menuBtn  = document.getElementById('hdr-menu-btn');
const mobileNav = document.getElementById('hdr-nav-mobile');
menuBtn?.addEventListener('click', () => {
  mobileNav?.classList.toggle('open');
});
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
