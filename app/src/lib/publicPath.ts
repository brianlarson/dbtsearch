/**
 * Prefix paths for static files under `public/` when the app is deployed with a
 * non-root Vite `base` (e.g. `/vue/` on production).
 */
export function publicPath(absoluteFromRoot: string): string {
  const path = absoluteFromRoot.startsWith('/') ? absoluteFromRoot.slice(1) : absoluteFromRoot
  const base = import.meta.env.BASE_URL
  const normalizedBase = base.endsWith('/') ? base : `${base}/`
  return `${normalizedBase}${path}`
}
