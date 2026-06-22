import { blendRGB, type RGB } from './util/colors.js'
import { MIDI_NOTE_OFF, MIDI_NOTE_ON } from './util/constants.js'
import { NoteEnvelopes } from './util/envelope.js'
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
  private envelopes = new NoteEnvelopes()

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
        changed.LED_SPREAD_TAPER !== undefined ||
        changed.NOTE_ATTACK_MS !== undefined ||
        changed.NOTE_RELEASE_MS !== undefined ||
        changed.NOTE_MIN_LENGTH_MS !== undefined
      ) {
        this.rebuild()
      }
    })
    this.rebuild()
  }

  /** Apply a MIDI message to the strip state. */
  handleMidi(message: number[]): void {
    const [status, note, velocity] = message
    const config = getConfig()
    if (status === MIDI_NOTE_ON) {
      if (velocity === 0) {
        this.envelopes.noteOff(note, config)
      } else {
        const ratio = config.CONSTANT_VELOCITY ? 1 : velocity / 127
        this.envelopes.noteOn(note, ratio, config)
      }
      this.rebuild()
    } else if (status === MIDI_NOTE_OFF) {
      this.envelopes.noteOff(note, config)
      this.rebuild()
    }
  }

  /** Advance envelopes and rebuild. Returns true while animation should continue. */
  tick(): boolean {
    const config = getConfig()
    this.envelopes.tick(config)
    this.rebuild()
    return this.envelopes.isAnimating(config)
  }

  isAnimating(): boolean {
    return this.envelopes.isAnimating(getConfig())
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

    for (const [note, envelope] of this.envelopes.values(config)) {
      if (envelope <= 0) continue
      const center = noteToLedIndex(note, config)
      for (const offset of spreadOffsets(LED_SPREAD_COUNT)) {
        const index = center + offset
        if (index < LED_START_COUNT || index >= LED_END_COUNT) continue
        const intensity = ledSpreadIntensity(
          index,
          center,
          LED_SPREAD_COUNT,
          LED_SPREAD_TAPER,
          envelope,
        )
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
