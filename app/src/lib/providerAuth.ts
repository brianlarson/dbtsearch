import { setProviderPortalSession } from '@/lib/providerSession'

/**
 * Lightweight provider portal sign-in for the static app.
 *
 * - If `VITE_PROVIDER_PORTAL_PASSWORD` is set, password must match (shared preview secret).
 * - In local `vite` dev (`import.meta.env.DEV`), any non-empty password is accepted so UX can be tested without env.
 * - Otherwise sign-in is rejected (production must set the env var).
 */
export async function attemptProviderLogin(
  username: string,
  password: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const name = username.trim()
  if (!name) {
    return { ok: false, error: 'Enter a username.' }
  }
  if (!password) {
    return { ok: false, error: 'Enter a password.' }
  }

  const required = import.meta.env.VITE_PROVIDER_PORTAL_PASSWORD

  if (required != null && String(required).length > 0) {
    if (password !== required) {
      return { ok: false, error: 'Invalid username or password.' }
    }
  } else if (!import.meta.env.DEV) {
    return {
      ok: false,
      error: 'Provider sign-in is not configured. Set VITE_PROVIDER_PORTAL_PASSWORD for this deployment.',
    }
  }

  setProviderPortalSession(name)
  return { ok: true }
}
