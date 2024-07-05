import ws281x from 'rpi-ws281x-native'
import { DATA_PIN, getConfig, onConfigUpdated } from './config'
import { WebsocketMessageDataMidi } from '../types/websocket'
import { getBlendedRGB } from './colors'

export class RgbStrip {
  private channel = this.initializeWS281x()
  private colors: {
    [key: number]: [number, number, number]
  } = {}

  constructor() {
    onConfigUpdated((updatedProperties) => {
      if (updatedProperties.BRIGHTNESS !== undefined) {
        this.setBrightness(updatedProperties.BRIGHTNESS)
      }
      if (
        updatedProperties.BACKGROUND_BRIGHTNESS !== undefined ||
        updatedProperties.BACKGROUND_COLOR_RGB !== undefined
      ) {
        this.fillColors()
      }
      if (updatedProperties.LED_END_COUNT !== undefined) {
        this.colors = {}
        this.fillColors()
        ws281x.finalize()
        this.channel = this.initializeWS281x()
      }
      if (updatedProperties.LED_START_COUNT !== undefined) {
        this.colors = {}
        this.fillColors()
      }
    })

    this.fillColors()
  }

  private initializeWS281x() {
    return ws281x(getConfig().LED_END_COUNT, {
      gpio: DATA_PIN,
      brightness: getConfig().BRIGHTNESS * 255
    })
  }

  private setBrightness(brightness: number): void {
    this.channel.brightness = brightness * 255
    this.render()
  }

  private setColor(index: number, color: [number, number, number]) {
    this.colors[index] = color
  }

  private fillColors(
    color = getConfig().BACKGROUND_COLOR_RGB.map((c) => c * getConfig().BACKGROUND_BRIGHTNESS) as [
      number,
      number,
      number
    ]
  ) {
    for (let i = getConfig().LED_START_COUNT; i < getConfig().LED_END_COUNT; i++) {
      this.setColor(i, color)
    }

    this.render()
  }

  private render(): void {
    this.channel.array.fill(0)
    Object.entries(this.colors).forEach(([index, color]) => {
      this.channel.array[index] = (color[0] << 16) | (color[1] << 8) | color[2]
    })
    ws281x.render()
  }

  private noteHandler(
    positionRatio: number,
    velocityRatio = 1,
    [red, green, blue] = getConfig().NOTE_PRESS_COLOR_RGB
  ): void {
    const blendedColor = getBlendedRGB(
      [red, green, blue],
      getConfig().BACKGROUND_COLOR_RGB.map((c) => c * getConfig().BACKGROUND_BRIGHTNESS) as [
        number,
        number,
        number
      ],
      velocityRatio
    )
    const colorPosition =
      positionRatio === 1
        ? getConfig().LED_END_COUNT - 1
        : Math.floor(
            positionRatio * (getConfig().LED_END_COUNT - getConfig().LED_START_COUNT) +
              getConfig().LED_START_COUNT
          )

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
    if (data.midiChannel === 128) {
      this.noteHandler(data.notePositionRatio, 0)
    }

    // pedal
    // if (data.midiChannel === 176) {
    //   if (data.noteVelocityRatio === 0) {
    //     this.fillColors(getConfig().BACKGROUND_COLOR, true)
    //   } else {
    //     this.fillColors(getBlendedRGB(getConfig().BACKGROUND_COLOR, [0, 0, 0], 0.5), true)
    //   }
    // }
  }
}
