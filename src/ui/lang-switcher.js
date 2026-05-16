// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
import { getLocale, setLocale, SUPPORTED_LOCALES } from '../lib/i18n.js';

const LOCALE_META = {
  'en':    { flag: '🇺🇸', label: 'EN' },
  'en-CA': { flag: '🇨🇦', label: 'EN-CA' },
  'fr-CA': { flag: '🇨🇦', label: 'FR-CA' },
  'es':    { flag: '🇪🇸', label: 'ES' },
  'nl':    { flag: '🇳🇱', label: 'NL' },
  'de':    { flag: '🇩🇪', label: 'DE' },
};

export function initLangSwitcher(containerEl) {
  const locale = getLocale();
  const meta = LOCALE_META[locale] || LOCALE_META['en'];

  const wrapper = document.createElement('div');
  wrapper.className = 'lang-switcher';
  wrapper.setAttribute('role', 'combobox');
  wrapper.setAttribute('aria-label', 'Language');
  wrapper.setAttribute('aria-expanded', 'false');

  const btn = document.createElement('button');
  btn.className = 'lang-switcher__btn';
  btn.type = 'button';
  btn.setAttribute('aria-haspopup', 'listbox');
  btn.innerHTML = `<span class="lang-switcher__flag" aria-hidden="true">${meta.flag}</span><span class="lang-switcher__code">${meta.label}</span><span class="lang-switcher__arrow" aria-hidden="true">▾</span>`;

  const dropdown = document.createElement('ul');
  dropdown.className = 'lang-switcher__dropdown';
  dropdown.setAttribute('role', 'listbox');
  dropdown.hidden = true;

  for (const code of SUPPORTED_LOCALES) {
    const m = LOCALE_META[code];
    if (!m) continue;
    const li = document.createElement('li');
    li.className = 'lang-switcher__option' + (code === locale ? ' lang-switcher__option--active' : '');
    li.setAttribute('role', 'option');
    li.setAttribute('aria-selected', String(code === locale));
    li.dataset.locale = code;
    li.innerHTML = `<span class="lang-switcher__flag" aria-hidden="true">${m.flag}</span><span class="lang-switcher__code">${m.label}</span>`;
    li.addEventListener('click', () => {
      if (code !== getLocale()) setLocale(code);
      close();
    });
    dropdown.appendChild(li);
  }

  wrapper.appendChild(btn);
  wrapper.appendChild(dropdown);

  let open = false;

  function toggle() {
    open = !open;
    dropdown.hidden = !open;
    wrapper.setAttribute('aria-expanded', String(open));
  }

  function close() {
    open = false;
    dropdown.hidden = true;
    wrapper.setAttribute('aria-expanded', 'false');
  }

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggle();
  });

  document.addEventListener('click', close);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && open) close();
  });

  containerEl.appendChild(wrapper);
  return wrapper;
}
