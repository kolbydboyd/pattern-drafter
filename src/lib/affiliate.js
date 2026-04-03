// Copyright (c) 2026 People's Patterns LLC. All rights reserved.
// Client-side affiliate referral tracking.

const COOKIE_NAME = 'pp_ref';
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

/** Read the affiliate referral code from the cookie (if any). */
export function getAffiliateCode() {
  const match = document.cookie.match(new RegExp('(?:^|;\\s*)' + COOKIE_NAME + '=([^;]+)'));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * On every page load: check for ?ref= param, set cookie (first-touch),
 * record the click server-side, and clean the URL.
 */
export function checkAndSetAffiliateCookie() {
  const params = new URLSearchParams(location.search);
  const ref = params.get('ref');
  if (!ref) return;

  // First-touch: don't overwrite an existing affiliate cookie
  if (!getAffiliateCode()) {
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(ref)};max-age=${COOKIE_MAX_AGE};path=/;SameSite=Lax`;
  }

  // Record click (fire-and-forget)
  fetch('/api/affiliate-click', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code: ref,
      landingPage: location.pathname,
      referrer: document.referrer,
    }),
  }).catch(() => {});

  // Clean the URL so visitors don't accidentally share tracked links
  params.delete('ref');
  const clean = params.toString();
  const newUrl = location.pathname + (clean ? '?' + clean : '') + location.hash;
  history.replaceState(null, '', newUrl);
}
