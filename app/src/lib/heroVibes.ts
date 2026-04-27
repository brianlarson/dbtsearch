/**
 * Decorative hero backgrounds — Unsplash (hotlinked per https://unsplash.com/license).
 * Pool is rotated randomly once per browser tab session (sessionStorage).
 */
export type HeroVibe = {
  url: string
  /** Short alt for the decorative header image */
  alt: string
}

const Q = 'auto=format&fit=crop&w=1800&q=80'

function photo(id: string): string {
  return `https://images.unsplash.com/photo-${id}?${Q}`
}

/** Curated abstract / atmospheric images (painting, fluid art, gradients, soft landscapes). */
export const HERO_VIBES: HeroVibe[] = [
  { url: photo('1579783902614-a3fb3927b6a5'), alt: 'Colorful abstract painting' },
  { url: photo('1541963463532-d68292c34b19'), alt: 'Abstract gallery painting' },
  { url: photo('1618005182384-a83a8bd57fbe'), alt: 'Fluid abstract shapes' },
  { url: photo('1634017839464-5c339ebe3cb4'), alt: 'Soft abstract gradient' },
  { url: photo('1557672172-298e090bd0f1'), alt: 'Bold abstract color blocks' },
  { url: photo('1547826039-bfc35e0f1ea8'), alt: 'Paint texture abstract' },
  { url: photo('1501472312651-726afe119ff1'), alt: 'Warm sunset sky' },
  { url: photo('1500530855697-b586d89ba3ee'), alt: 'Misty mountain layers' },
  { url: photo('1519681393784-d120267933ba'), alt: 'Night sky and stars' },
  { url: photo('1558618666-fcd25c85cd64'), alt: 'Abstract geometric light' },
  { url: photo('1490750967868-88aa4486c946'), alt: 'Soft floral color wash' },
  { url: photo('1604076913837-52ab5629fba9'), alt: 'Abstract paper texture' },
]

const SESSION_KEY = 'dbtsearch:hero-vibe-idx'

let memo: HeroVibe | null = null

export function getHeroVibe(): HeroVibe {
  if (memo) return memo

  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (raw !== null) {
      const i = Number.parseInt(raw, 10)
      if (!Number.isNaN(i) && i >= 0 && i < HERO_VIBES.length) {
        memo = HERO_VIBES[i]!
        return memo
      }
    }
  } catch {
    /* private mode / blocked storage */
  }

  const i = Math.floor(Math.random() * HERO_VIBES.length)
  memo = HERO_VIBES[i]!

  try {
    sessionStorage.setItem(SESSION_KEY, String(i))
  } catch {
    /* ignore */
  }

  return memo
}
