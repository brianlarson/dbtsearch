const STORAGE_KEY = 'dbtsearch_provider_portal_session'

export type ProviderPortalSession = {
  username: string
  loggedInAt: number
}

export function getProviderPortalSession(): ProviderPortalSession | null {
  if (typeof sessionStorage === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as ProviderPortalSession
    if (typeof parsed?.username !== 'string' || !parsed.username.trim()) return null
    return { username: parsed.username.trim(), loggedInAt: Number(parsed.loggedInAt) || Date.now() }
  } catch {
    return null
  }
}

export function isProviderPortalLoggedIn(): boolean {
  return getProviderPortalSession() !== null
}

export function getProviderPortalUsername(): string | null {
  return getProviderPortalSession()?.username ?? null
}

export function setProviderPortalSession(username: string): void {
  if (typeof sessionStorage === 'undefined') return
  const trimmed = username.trim()
  if (!trimmed) return
  const payload: ProviderPortalSession = { username: trimmed, loggedInAt: Date.now() }
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

export function clearProviderPortalSession(): void {
  if (typeof sessionStorage === 'undefined') return
  sessionStorage.removeItem(STORAGE_KEY)
}
