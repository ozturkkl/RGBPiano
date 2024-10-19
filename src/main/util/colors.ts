export function RGBToHSL(r: number, g: number, b: number): [number, number, number] {
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

export function HSLToRGB(h: number, s: number, l: number): [number, number, number] {
  s /= 100
  l /= 100
  const k = (n: number): number => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n: number): number => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return [255 * f(0), 255 * f(8), 255 * f(4)]
}

export function hexToRgb(hex: string) {
  return (
    hex
      .replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (_m, r, g, b) => '#' + r + r + g + g + b + b)
      .substring(1)
      .match(/.{2}/g)
      ?.map((x) => parseInt(x, 16)) ?? [0, 0, 0]
  )
}

export function RGBToHex(r: number, g: number, b: number) {
  const clamp = (value: number) => Math.max(0, Math.min(255, Math.round(value)))

  const redHex = clamp(r).toString(16).padStart(2, '0')
  const greenHex = clamp(g).toString(16).padStart(2, '0')
  const blueHex = clamp(b).toString(16).padStart(2, '0')

  return `#${redHex}${greenHex}${blueHex}`
}

export function getBlendedRGB(
  [c1r, c1g, c1b]: [number, number, number],
  [c2r, c2g, c2b]: [number, number, number],
  ratio: number,
): [number, number, number] {
  return [
    Math.round(c1r * ratio) + Math.round(c2r * (1 - ratio)),
    Math.round(c1g * ratio) + Math.round(c2g * (1 - ratio)),
    Math.round(c1b * ratio) + Math.round(c2b * (1 - ratio)),
  ]
}
