export type RGB = [number, number, number]

export function RGBToHSL(r: number, g: number, b: number): RGB {
  r /= 255
  g /= 255
  b /= 255
  const l = Math.max(r, g, b)
  const s = l - Math.min(r, g, b)
  const h = s ? (l === r ? (g - b) / s : l === g ? 2 + (b - r) / s : 4 + (r - g) / s) : 0
  return [
    60 * h < 0 ? 60 * h + 360 : 60 * h,
    100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0),
    (100 * (2 * l - s)) / 2,
  ]
}

export function HSLToRGB(h: number, s: number, l: number): RGB {
  s /= 100
  l /= 100
  const k = (n: number): number => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n: number): number => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return [255 * f(0), 255 * f(8), 255 * f(4)]
}

export function hexToRGB(hex: string): RGB {
  return (
    (hex
      .replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (_m, r, g, b) => '#' + r + r + g + g + b + b)
      .substring(1)
      .match(/.{2}/g)
      ?.map((x) => parseInt(x, 16)) as RGB) ?? [0, 0, 0]
  )
}

export function RGBToHex(r: number, g: number, b: number): string {
  const clamp = (value: number): number => Math.max(0, Math.min(255, Math.round(value)))
  return `#${[r, g, b].map((c) => clamp(c).toString(16).padStart(2, '0')).join('')}`
}

/** Blend two colors together. `ratio` of 1 is fully `a`, 0 is fully `b`. */
export function blendRGB([ar, ag, ab]: RGB, [br, bg, bb]: RGB, ratio: number): RGB {
  return [
    Math.round(ar * ratio) + Math.round(br * (1 - ratio)),
    Math.round(ag * ratio) + Math.round(bg * (1 - ratio)),
    Math.round(ab * ratio) + Math.round(bb * (1 - ratio)),
  ]
}
