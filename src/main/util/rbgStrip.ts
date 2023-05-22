import ws281x from 'rpi-ws281x-native'
import color from 'color'
import { DATA_PIN, NUM_LEDS, getConfig, onConfigUpdated } from './config'
import { WebsocketMessageDataMidi } from '../types/websocket'

export class RgbStrip {
  channel = ws281x(NUM_LEDS, {
    stripType: ws281x.stripType.WS2812,
    gpio: DATA_PIN,
    brightness: getConfig().BRIGHTNESS * 255,
    invert: false
  })
  colors = this.channel.array

  constructor() {
    onConfigUpdated((updatedProperties) => {
      if (updatedProperties.BRIGHTNESS) {
        this.setBrightness(updatedProperties.BRIGHTNESS)
      }
      if (updatedProperties.BACKGROUND_COLOR) {
        this.setBackgroundColor(...updatedProperties.BACKGROUND_COLOR)
      }
    })
  }

  setBrightness(brightness: number): void {
    this.channel.brightness = brightness * 255
    ws281x.render()
  }

  setPixelColor(
    pixelPositionRatio: number,
    velocityRatio = 1,
    red = 255,
    green = 255,
    blue = 255
  ): void {
    const bgColor = getConfig().BACKGROUND_COLOR
    const blendedColor = color.rgb(
      Math.round(red * velocityRatio) + Math.round(bgColor[0] * (1 - velocityRatio)),
      Math.round(green * velocityRatio) + Math.round(bgColor[1] * (1 - velocityRatio)),
      Math.round(blue * velocityRatio) + Math.round(bgColor[2] * (1 - velocityRatio))
    )

    // if no pixel position is specified, set all pixels to the same color
    if (pixelPositionRatio === undefined) {
      this.colors.fill(blendedColor.rgbNumber())
    } else {
      const pixelPosition = Math.round((NUM_LEDS - 2) * pixelPositionRatio) + 1
      this.colors[pixelPosition] = blendedColor.rgbNumber()
    }

    ws281x.render()
  }

  setBackgroundColor(red = 0, green = 0, blue = 0): void {
    this.colors.fill(color.rgb(red, green, blue).rgbNumber())
    ws281x.render()
  }

  // reset(): void {
  //   ws281x.reset()
  // }

  handleNotePress(data: WebsocketMessageDataMidi): void {
    // note
    if (data.midiChannel === 144) {
      if (getConfig().CONSTANT_VELOCITY) {
        data.noteVelocityRatio = data.noteVelocityRatio === 0 ? 0 : 1
      }

      this.setPixelColor(data.notePositionRatio, data.noteVelocityRatio, ...getConfig().COLOR)
    }

    // pedal
    if (data.midiChannel === 176) {
      // disabled until other notes disappearing is fixed
      // this.setBackgroundColor(
      //   ...BACKGROUND_COLOR.map((c) => c * (noteVelocityRatio === 1 ? 2 : 1))
      // );
    }
  }
}
