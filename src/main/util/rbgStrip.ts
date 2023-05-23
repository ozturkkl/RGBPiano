import ws281x from 'rpi-ws281x-native'
import { DATA_PIN, NUM_LEDS, getConfig, onConfigUpdated } from './config'
import { WebsocketMessageDataMidi } from '../types/websocket'
import { HSLToRGB, RGBToHSL, getBlendedRGB } from './colors'

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
        this.setBackgroundColor()
      }
    })

    this.setBackgroundColor()
  }

  setBrightness(brightness: number): void {
    this.channel.brightness = brightness * 255
    this.render()
  }

  setBackgroundColor(
    [red, green, blue] = getConfig().BACKGROUND_COLOR,
    preserveLightness = false
  ): void {
    this.fillColors([red, green, blue], preserveLightness)
    this.render()
  }

  setStripColor(
    positionRatio?: number,
    velocityRatio = 1,
    [red, green, blue] = getConfig().COLOR
  ): void {
    const blendedColor = getBlendedRGB(
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
        this.setBackgroundColor(getConfig().BACKGROUND_COLOR, true)
      } else {
        this.setBackgroundColor(getBlendedRGB(getConfig().BACKGROUND_COLOR, [0, 0, 0], 0.5), true)
      }
    }
  }

  render(): void {
    Object.entries(this.colors).forEach(([index, color]) => {
      this.channel.array[index] = (color[0] << 16) | (color[1] << 8) | color[2]
    })
    ws281x.render()
  }

  setColor(index: number, color: [number, number, number]): void {
    this.colors[index] = color
  }

  fillColors(color: [number, number, number], preserveLightness = true): void {
    const [h, s, l] = RGBToHSL(...color)

    Object.keys(this.colors).forEach((key) => {
      const currentRGB = this.colors[Number(key)]
      const newRGB = HSLToRGB(h, s, preserveLightness ? RGBToHSL(...currentRGB)[2] : l)
      this.setColor(Number(key), newRGB)
    })
  }
}
