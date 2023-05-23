import ws281x from 'rpi-ws281x-native'
import { DATA_PIN, NUM_LEDS, getConfig, onConfigUpdated } from './config'
import { WebsocketMessageDataMidi } from '../types/websocket'

export class RgbStrip {
  private channel = ws281x(NUM_LEDS, {
    gpio: DATA_PIN,
    brightness: getConfig().BRIGHTNESS * 255,
    invert: false
  })
  colors: {
    [key: number]: [number, number, number]
  } = {}

  constructor() {
    onConfigUpdated((updatedProperties) => {
      if (updatedProperties.BRIGHTNESS) {
        this.setBrightness(updatedProperties.BRIGHTNESS)
      }
      if (updatedProperties.BACKGROUND_COLOR) {
        this.setBackgroundColor(updatedProperties.BACKGROUND_COLOR)
      }
    })

    this.setBackgroundColor(getConfig().BACKGROUND_COLOR)
  }

  setBrightness(brightness: number): void {
    this.channel.brightness = brightness * 255
    this.render()
  }

  setBackgroundColor([red, green, blue]): void {
    this.fillColors([red, green, blue])
    this.render()
  }

  setStripColor(
    positionRatio?: number,
    velocityRatio = 1,
    [red, green, blue] = getConfig().COLOR
  ): void {
    const blendedColor = this.getBlendedRGB(
      [red, green, blue],
      getConfig().BACKGROUND_COLOR,
      velocityRatio
    )

    // if no pixel position is specified, set all pixels to the same color
    if (positionRatio === undefined) {
      this.fillColors(blendedColor, false)
    } else {
      const colorPosition = Math.floor(positionRatio * NUM_LEDS)
      this.setColor(colorPosition, blendedColor)
    }

    this.render()
  }

  reset(): void {
    this.fillColors(getConfig().BACKGROUND_COLOR, false)
    this.render()
  }

  handleNotePress(data: WebsocketMessageDataMidi): void {
    // note
    if (data.midiChannel === 144) {
      if (getConfig().CONSTANT_VELOCITY) {
        data.noteVelocityRatio = data.noteVelocityRatio === 0 ? 0 : 1
      }

      this.setStripColor(data.notePositionRatio, data.noteVelocityRatio)
    }

    // pedal
    if (data.midiChannel === 176) {
      if (data.noteVelocityRatio === 0) {
        this.setBackgroundColor(getConfig().BACKGROUND_COLOR)
      } else {
        this.setBackgroundColor(this.getBlendedRGB(getConfig().BACKGROUND_COLOR, [0, 0, 0], 0.5))
      }
    }
  }

  render(): void {
    Object.entries(this.colors).forEach(([index, color]) => {
      this.channel.array[index] = (color[0] << 16) | (color[1] << 8) | color[2]
    })
    ws281x.render()
  }

  RGBToHSL(r: number, g: number, b: number): [number, number, number] {
    r /= 255
    g /= 255
    b /= 255
    const l = Math.max(r, g, b)
    const s = l - Math.min(r, g, b)
    const h = s ? (l === r ? (g - b) / s : l === g ? 2 + (b - r) / s : 4 + (r - g) / s) : 0
    return [
      60 * h < 0 ? 60 * h + 360 : 60 * h,
      100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0),
      (100 * (2 * l - s)) / 2
    ]
  }

  HSLToRGB(h: number, s: number, l: number): [number, number, number] {
    s /= 100
    l /= 100
    const k = (n: number): number => (n + h / 30) % 12
    const a = s * Math.min(l, 1 - l)
    const f = (n: number): number => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
    return [255 * f(0), 255 * f(8), 255 * f(4)]
  }

  getBlendedRGB(
    [c1r, c1g, c1b]: [number, number, number],
    [c2r, c2g, c2b]: [number, number, number],
    ratio: number
  ): [number, number, number] {
    return [
      Math.round(c1r * ratio) + Math.round(c2r * (1 - ratio)),
      Math.round(c1g * ratio) + Math.round(c2g * (1 - ratio)),
      Math.round(c1b * ratio) + Math.round(c2b * (1 - ratio))
    ]
  }

  setColor(index: number, color: [number, number, number]): void {
    this.colors[index] = color
  }

  fillColors(color: [number, number, number], preserveLightness = true): void {
    const [h, s, l] = this.RGBToHSL(...color)

    Object.keys(this.colors).forEach((key) => {
      const currentRGB = this.colors[Number(key)]
      const newRGB = this.HSLToRGB(h, s, preserveLightness ? this.RGBToHSL(...currentRGB)[2] : l)
      this.setColor(Number(key), newRGB)
    })
  }
}
