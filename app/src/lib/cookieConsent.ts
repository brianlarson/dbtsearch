const STORAGE_KEY = 'dbtsearch_cookie_consent'
const STORAGE_VALUE = 'v1'

export function hasCookieConsent(): boolean {
  if (typeof localStorage === 'undefined') return true
  return localStorage.getItem(STORAGE_KEY) === STORAGE_VALUE
}

export function acceptCookieConsent(): void {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(STORAGE_KEY, STORAGE_VALUE)
}
