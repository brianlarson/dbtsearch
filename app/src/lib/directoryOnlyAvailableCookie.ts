const COOKIE_NAME = 'dbtsearch_directory_only_available'
const MAX_AGE_SEC = 60 * 60 * 24 * 365

export function readDirectoryOnlyAvailableCookie(): boolean | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`))
  if (!match?.[1]) return null
  const raw = decodeURIComponent(match[1])
  if (raw === '1' || raw === 'true') return true
  if (raw === '0' || raw === 'false') return false
  return null
}

export function writeDirectoryOnlyAvailableCookie(value: boolean): void {
  if (typeof document === 'undefined') return
  const secure = typeof location !== 'undefined' && location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${COOKIE_NAME}=${value ? '1' : '0'}; Path=/; Max-Age=${MAX_AGE_SEC}; SameSite=Lax${secure}`
}
