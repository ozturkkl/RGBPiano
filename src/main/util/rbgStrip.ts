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
        this.fillColors(updatedProperties.BACKGROUND_COLOR)
      }
    })

    this.fillColors(getConfig().BACKGROUND_COLOR)
  }

  setBrightness(brightness: number): void {
    this.channel.brightness = brightness * 255
    this.render()
  }

  setColor(index: number, color: [number, number, number], preserveLightness = false): void {
    if (preserveLightness) {
      const targetHSL = RGBToHSL(...color)
      const currentHSL = RGBToHSL(...this.colors[index])
      this.colors[index] = HSLToRGB(targetHSL[0], targetHSL[1], currentHSL[2])
    } else {
      this.colors[index] = color
    }
  }

  fillColors(color = getConfig().BACKGROUND_COLOR, preserveLightness = false): void {
    Object.keys(this.colors).forEach((key) => {
      this.setColor(Number(key), color, preserveLightness)
    })

    this.render()
  }

  render(): void {
    Object.entries(this.colors).forEach(([index, color]) => {
      this.channel.array[index] = (color[0] << 16) | (color[1] << 8) | color[2]
    })
    ws281x.render()
  }

  noteHandler(
    positionRatio: number,
    velocityRatio = 1,
    [red, green, blue] = getConfig().COLOR
  ): void {
    const blendedColor = getBlendedRGB(
      [red, green, blue],
      getConfig().BACKGROUND_COLOR,
      velocityRatio
    )
    const colorPosition = Math.floor(positionRatio * NUM_LEDS)

    this.setColor(colorPosition, blendedColor)
    this.render()
  }

  handleNotePress(data: WebsocketMessageDataMidi): void {
    // note
    if (data.midiChannel === 144) {
      if (getConfig().CONSTANT_VELOCITY) {
        data.noteVelocityRatio = data.noteVelocityRatio === 0 ? 0 : 1
      }

      this.noteHandler(data.notePositionRatio, data.noteVelocityRatio)
    }

    // pedal
    if (data.midiChannel === 176) {
      if (data.noteVelocityRatio === 0) {
        this.fillColors(getConfig().BACKGROUND_COLOR, true)
      } else {
        this.fillColors(getBlendedRGB(getConfig().BACKGROUND_COLOR, [0, 0, 0], 0.5), true)
      }
    }
  }
}
