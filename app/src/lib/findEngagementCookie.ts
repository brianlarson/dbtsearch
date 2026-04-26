/**
 * Remembers that the visitor has used the provider directory so `/find/` can skip
 * the splash and go straight to listings on later visits.
 *
 * Opt out of the redirect with `?splash` or `?home` on the splash URL.
 */
const COOKIE_NAME = 'dbtfind_engaged'
const MAX_AGE_SEC = 60 * 60 * 24 * 365

function cookiePath(): string {
  const base = import.meta.env.BASE_URL || '/'
  const trimmed = base.replace(/\/$/, '')
  return trimmed || '/'
}

export function isFindDirectoryEngaged(): boolean {
  if (typeof document === 'undefined') return false
  const prefix = `${COOKIE_NAME}=`
  return document.cookie.split(';').some((c) => c.trim().startsWith(prefix))
}

export function setFindDirectoryEngaged(): void {
  if (typeof document === 'undefined') return
  const secure = typeof location !== 'undefined' && location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${COOKIE_NAME}=1; Path=${cookiePath()}; Max-Age=${MAX_AGE_SEC}; SameSite=Lax${secure}`
}
