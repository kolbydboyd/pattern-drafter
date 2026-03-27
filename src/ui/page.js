// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Minimal JS for static pages (FAQ, Terms, Privacy) — theme toggle only.

function getSavedTheme() {
  try { return localStorage.getItem('theme'); } catch { return null; }
}

function applyTheme(dark) {
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  const icon = document.querySelector('#theme-btn .dark-mode-toggle__icon');
  if (icon) icon.classList.toggle('dark-mode-toggle__icon--moon', dark);
}

applyTheme(getSavedTheme() === 'dark');

document.getElementById('theme-btn')?.addEventListener('click', () => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const next = !isDark;
  localStorage.setItem('theme', next ? 'dark' : 'light');
  applyTheme(next);
});

document.getElementById('hdr-logo')?.addEventListener('click', () => {
  location.href = '/';
});
