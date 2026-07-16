/**
 * Soft cookie notice — same key/value as the archived Vue SPA so returners stay silent.
 * Not a CMP: Accept / dismiss both persist consent in localStorage.
 */
export const STORAGE_KEY = 'dbtsearch_cookie_consent';
export const STORAGE_VALUE = 'v1';

export function hasCookieConsent() {
  try {
    if (typeof localStorage === 'undefined') return true;
    return localStorage.getItem(STORAGE_KEY) === STORAGE_VALUE;
  } catch {
    return true;
  }
}

export function acceptCookieConsent() {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, STORAGE_VALUE);
  } catch {
    // Ignore quota / private-mode failures; bar may reappear.
  }
}

export function initCookieConsent() {
  const bar = document.getElementById('cookie-consent-bar');
  if (!bar || hasCookieConsent()) {
    return;
  }

  bar.hidden = false;

  function dismiss() {
    acceptCookieConsent();
    bar.hidden = true;
  }

  bar.querySelectorAll('[data-cookie-consent-dismiss]').forEach((el) => {
    el.addEventListener('click', dismiss);
  });
}
