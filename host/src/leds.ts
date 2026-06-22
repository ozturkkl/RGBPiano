import { blendRGB, type RGB } from './util/colors.js'
import { MIDI_NOTE_OFF, MIDI_NOTE_ON } from './util/constants.js'
import { noteToLedIndex } from './util/strip.js'
import { getConfig, onConfigUpdated } from './config.js'
import { encodeFrame } from './protocol.js'

/**
 * Holds the current color of every LED and turns MIDI events into a strip frame.
 * All the visual logic (background fill, note → position mapping, velocity blending)
 * lives here; the Pi just displays whatever frame we send it.
 */
export class LedFrame {
  private colors: RGB[] = []

  constructor() {
    onConfigUpdated((changed) => {
      if (
        changed.BACKGROUND_BRIGHTNESS !== undefined ||
        changed.BACKGROUND_COLOR_RGB !== undefined ||
        changed.LED_START_COUNT !== undefined ||
        changed.LED_END_COUNT !== undefined
      ) {
        this.fillBackground()
      }
    })
    this.fillBackground()
  }

  /** Apply a MIDI message to the strip state. */
  handleMidi(message: number[]): void {
    const [status, note, velocity] = message
    if (status === MIDI_NOTE_ON) {
      const ratio = getConfig().CONSTANT_VELOCITY ? 1 : velocity / 127
      this.setNote(note, ratio)
    } else if (status === MIDI_NOTE_OFF) {
      this.setNote(note, 0)
    }
  }

  /** Encode the current strip state into a frame ready to send to the Pi. */
  toFrame(): Buffer {
    return encodeFrame(getConfig().BRIGHTNESS * 255, this.colors)
  }

  private backgroundColor(): RGB {
    const { BACKGROUND_COLOR_RGB, BACKGROUND_BRIGHTNESS } = getConfig()
    return BACKGROUND_COLOR_RGB.map((c) => c * BACKGROUND_BRIGHTNESS) as RGB
  }

  private fillBackground(): void {
    const { LED_START_COUNT, LED_END_COUNT } = getConfig()
    const background = this.backgroundColor()
    this.colors = Array.from({ length: LED_END_COUNT }, (_, i) =>
      i >= LED_START_COUNT ? [...background] : [0, 0, 0],
    ) as RGB[]
  }

  private setNote(note: number, velocityRatio: number): void {
    const color = blendRGB(getConfig().NOTE_PRESS_COLOR_RGB, this.backgroundColor(), velocityRatio)
    this.colors[noteToLedIndex(note, getConfig())] = color
  }
}
