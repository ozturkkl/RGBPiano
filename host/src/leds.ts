import { blendRGB, type RGB } from './util/colors.js'
import { MIDI_NOTE_OFF, MIDI_NOTE_ON } from './util/constants.js'
import { ledSpreadIntensity, noteToLedIndex, spreadOffsets } from './util/strip.js'
import { getConfig, onConfigUpdated } from './config.js'
import { encodeFrame } from './protocol.js'

/**
 * Holds the current color of every LED and turns MIDI events into a strip frame.
 * All the visual logic (background fill, note → position mapping, velocity blending)
 * lives here; the Pi just displays whatever frame we send it.
 */
export class LedFrame {
  private colors: RGB[] = []
  private activeNotes = new Map<number, number>()

  constructor() {
    onConfigUpdated((changed) => {
      if (
        changed.BACKGROUND_BRIGHTNESS !== undefined ||
        changed.BACKGROUND_COLOR_RGB !== undefined ||
        changed.LED_START_COUNT !== undefined ||
        changed.LED_END_COUNT !== undefined
      ) {
        this.rebuild()
        return
      }
      if (
        changed.NOTE_PRESS_COLOR_RGB !== undefined ||
        changed.LED_SPREAD_COUNT !== undefined ||
        changed.LED_SPREAD_TAPER !== undefined
      ) {
        this.rebuild()
      }
    })
    this.rebuild()
  }

  /** Apply a MIDI message to the strip state. */
  handleMidi(message: number[]): void {
    const [status, note, velocity] = message
    if (status === MIDI_NOTE_ON) {
      if (velocity === 0) {
        this.activeNotes.delete(note)
      } else {
        const ratio = getConfig().CONSTANT_VELOCITY ? 1 : velocity / 127
        this.activeNotes.set(note, ratio)
      }
      this.rebuild()
    } else if (status === MIDI_NOTE_OFF) {
      this.activeNotes.delete(note)
      this.rebuild()
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

  private rebuild(): void {
    const config = getConfig()
    const { LED_START_COUNT, LED_END_COUNT, NOTE_PRESS_COLOR_RGB, LED_SPREAD_COUNT, LED_SPREAD_TAPER } =
      config
    const background = this.backgroundColor()
    const intensities = new Float32Array(LED_END_COUNT)

    for (const [note, velocityRatio] of this.activeNotes) {
      const center = noteToLedIndex(note, config)
      for (const offset of spreadOffsets(LED_SPREAD_COUNT)) {
        const index = center + offset
        if (index < LED_START_COUNT || index >= LED_END_COUNT) continue
        const intensity = ledSpreadIntensity(index, center, LED_SPREAD_COUNT, LED_SPREAD_TAPER, velocityRatio)
        intensities[index] = Math.max(intensities[index], intensity)
      }
    }

    this.colors = Array.from({ length: LED_END_COUNT }, (_, i) => {
      if (i < LED_START_COUNT) return [0, 0, 0] as RGB
      const intensity = intensities[i]
      return intensity > 0
        ? blendRGB(NOTE_PRESS_COLOR_RGB, background, intensity)
        : ([...background] as RGB)
    })
  }
}
