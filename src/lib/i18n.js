// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Core i18n utility. No external dependencies. Vanilla JS only.

export const SUPPORTED_LOCALES = ['en', 'en-CA', 'fr-CA', 'es', 'nl', 'de'];
const DEFAULT_LOCALE = 'en';
const STORAGE_KEY    = 'pp-lang';

let _locale      = DEFAULT_LOCALE;
let _messages    = {};  // current locale UI strings (overlaid on en)
let _fallback    = {};  // English base — always loaded
let _garmentMsgs = {};  // current locale garment strings
let _measureMsgs = {};  // current locale measurement strings

export function getLocale() { return _locale; }

export function setLocale(locale) {
  if (!SUPPORTED_LOCALES.includes(locale)) return;
  try { localStorage.setItem(STORAGE_KEY, locale); } catch {}
  // Reload with lang param so the new locale is detected on next initLocale()
  const url = new URL(location.href);
  url.searchParams.set('lang', locale);
  location.href = url.toString();
}

/** Detect locale. Synchronous. Call before loadLocale(). */
export function initLocale() {
  const urlParam = new URLSearchParams(location.search).get('lang');
  let stored = null;
  try { stored = localStorage.getItem(STORAGE_KEY); } catch {}

  // Navigator language → try exact, then language-prefix match
  const nav = (navigator.language || '').replace('_', '-');
  const navCandidates = [];
  if (nav) {
    const exact = SUPPORTED_LOCALES.find(l => l.toLowerCase() === nav.toLowerCase());
    if (exact) navCandidates.push(exact);
    const prefix = nav.split('-')[0].toLowerCase();
    const prefixMatch = SUPPORTED_LOCALES.find(l =>
      l.toLowerCase() === prefix || l.toLowerCase().startsWith(prefix + '-')
    );
    if (prefixMatch && !navCandidates.includes(prefixMatch)) navCandidates.push(prefixMatch);
  }

  const candidates = [urlParam, stored, ...navCandidates].filter(Boolean);
  _locale = candidates.find(c => SUPPORTED_LOCALES.includes(c)) || DEFAULT_LOCALE;

  // Persist URL choice and clean param from URL
  if (urlParam && SUPPORTED_LOCALES.includes(urlParam)) {
    try { localStorage.setItem(STORAGE_KEY, urlParam); } catch {}
    const url = new URL(location.href);
    url.searchParams.delete('lang');
    history.replaceState(null, '', url.toString());
  }

  return _locale;
}

/** Load locale data. Must be awaited before calling t(). */
export async function loadLocale(locale) {
  _locale = locale || DEFAULT_LOCALE;

  // English base is always loaded as the fallback
  const [enUiMod, enMeasMod] = await Promise.all([
    import('../locales/en/ui.js'),
    import('../locales/en/measurements.js'),
  ]);
  _fallback    = enUiMod.default;
  const enMeas = enMeasMod.default;

  if (_locale === 'en') {
    _messages    = _fallback;
    _measureMsgs = enMeas;
    _garmentMsgs = {};
    try { const m = await import('../locales/en/garments.js'); _garmentMsgs = m.default; } catch {}
    return;
  }

  // Load locale-specific files gracefully (empty obj on missing file)
  const load = path => import(path).then(m => m.default).catch(() => ({}));

  const [locUi, locMeas, locGarments] = await Promise.all([
    load(`../locales/${_locale}/ui.js`),
    load(`../locales/${_locale}/measurements.js`),
    load(`../locales/${_locale}/garments.js`),
  ]);

  _messages    = { ..._fallback,  ...locUi    };
  _measureMsgs = { ...enMeas,     ...locMeas   };
  _garmentMsgs = locGarments;
}

/**
 * Translate a UI key with optional {var} interpolation.
 * Falls back: current locale → English base → key string itself.
 */
export function t(key, vars) {
  const raw = _messages[key] ?? _fallback[key] ?? key;
  if (!vars) return raw;
  return raw.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}

/**
 * Translated measurement label or instruction.
 * Returns null if not found (caller should fall back to MEASUREMENTS[id][field]).
 */
export function tMeasure(id, field) {
  return _measureMsgs[id]?.[field] ?? null;
}

/**
 * Translate a garment string by ID + dot-path.
 * e.g. tGarment('tee', 'options.neckline.label')
 * Returns undefined when no translation exists — caller uses English fallback.
 */
export function tGarment(garmentId, path) {
  const entry = _garmentMsgs[garmentId];
  if (!entry) return undefined;
  const parts = path.split('.');
  let cur = entry;
  for (const p of parts) {
    if (cur == null || typeof cur !== 'object') return undefined;
    cur = cur[p];
  }
  return typeof cur === 'string' ? cur : undefined;
}

/**
 * Overlay locale translations onto a pieces() return value.
 * Looks up by piece.id first, then piece.name. Non-destructive.
 */
export function translatePieces(garmentId, pieces) {
  const entry = _garmentMsgs[garmentId];
  if (!entry?.pieces) return pieces;
  return pieces.map(piece => {
    const tr = entry.pieces[piece.id] || entry.pieces[piece.name];
    return tr ? { ...piece, ...tr } : piece;
  });
}

/**
 * Overlay locale translations onto an instructions() return value.
 * Matched by index position. Non-destructive.
 */
export function translateInstructions(garmentId, steps) {
  const entry = _garmentMsgs[garmentId];
  if (!entry?.instructions) return steps;
  return steps.map((step, i) => {
    const tr = entry.instructions[i];
    return tr ? { ...step, ...tr } : step;
  });
}

/**
 * Walk the DOM and apply data-i18n* attributes.
 * Call once after locale is loaded and DOM is ready.
 *   data-i18n="key"                 → textContent
 *   data-i18n-html="key"            → innerHTML (safe keys only)
 *   data-i18n-attr="attr:key,..."   → attribute values
 */
export function applyI18nDOM(root) {
  const r = root || document;
  r.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  r.querySelectorAll('[data-i18n-html]').forEach(el => {
    el.innerHTML = t(el.dataset.i18nHtml);
  });
  r.querySelectorAll('[data-i18n-attr]').forEach(el => {
    el.dataset.i18nAttr.split(',').forEach(pair => {
      const sep = pair.indexOf(':');
      if (sep < 1) return;
      const attr = pair.slice(0, sep).trim();
      const key  = pair.slice(sep + 1).trim();
      el.setAttribute(attr, t(key));
    });
  });
  document.documentElement.lang = _locale;
}
