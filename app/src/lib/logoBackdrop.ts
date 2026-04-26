/**
 * Sample decoded logo pixels (small canvas) and infer whether the artwork is
 * predominantly light — use a dark tile behind it — or dark — keep a light tile.
 * Returns null if sampling fails (e.g. tainted canvas / CORS).
 */
export function inferLogoBackdropTone(img: HTMLImageElement): 'light' | 'dark' | null {
  if (!img.naturalWidth || !img.naturalHeight) return null

  const side = 48
  const canvas = document.createElement('canvas')
  canvas.width = side
  canvas.height = side
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null

  try {
    ctx.drawImage(img, 0, 0, side, side)
    const { data } = ctx.getImageData(0, 0, side, side)
    let sum = 0
    let n = 0
    for (let i = 0; i < data.length; i += 4) {
      const a = data[i + 3] ?? 0
      if (a < 20) continue
      const r = data[i] ?? 0
      const g = data[i + 1] ?? 0
      const b = data[i + 2] ?? 0
      sum += 0.2126 * r + 0.7152 * g + 0.0722 * b
      n++
    }
    if (n < 12) return null
    const avg = sum / n
    // Bright marks / light logos → dark backdrop; dark marks → light backdrop
    return avg > 158 ? 'dark' : 'light'
  } catch {
    return null
  }
}
