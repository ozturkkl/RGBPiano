import { HSLToRGB, type RGB } from './colors.js'

export interface Config {
  /** Global hardware brightness, 0–1. Applied on the strip for smooth dimming. */
  BRIGHTNESS: number
  /** Brightness of the idle/background glow, 0–1. */
  BACKGROUND_BRIGHTNESS: number
  /** Color of the idle/background glow. */
  BACKGROUND_COLOR_RGB: RGB
  /** Color a key lights up when pressed. */
  NOTE_PRESS_COLOR_RGB: RGB
  /** Ignore key velocity and always light at full intensity. */
  CONSTANT_VELOCITY: boolean
  /** Milliseconds to ramp note lighting up on press. 0 = instant. */
  NOTE_ATTACK_MS: number
  /** Milliseconds to ramp note lighting down on release. 0 = instant. */
  NOTE_RELEASE_MS: number
  /** Ms to hold brightness after release before fade-out begins. 0 = fade starts immediately. */
  NOTE_RELEASE_HOLD_MS: number
  /** Flip the mapping so low notes are at the far end of the strip. */
  LED_INVERT: boolean
  /** Index of the last LED used (effectively the strip length). */
  LED_END_COUNT: number
  /** Index of the first LED used. LEDs before this stay off. */
  LED_START_COUNT: number
  /** LEDs lit per key press, centered on the note position. */
  LED_SPREAD_COUNT: number
  /** Brightness multiplier for each step away from center (0–1). Center is always full. */
  LED_SPREAD_TAPER: number
  /** Name of the MIDI input port to read from, or 'None'. */
  MIDI_INPUT: string
  /** Hostname or IP of the Raspberry Pi running the LED server. */
  PI_HOST: string
}

export const defaultConfig: Config = {
  BRIGHTNESS: 1,
  BACKGROUND_BRIGHTNESS: 0.03,
  BACKGROUND_COLOR_RGB: HSLToRGB(18, 100, 50),
  NOTE_PRESS_COLOR_RGB: HSLToRGB(18, 100, 50),
  CONSTANT_VELOCITY: true,
  NOTE_ATTACK_MS: 0,
  NOTE_RELEASE_MS: 150,
  NOTE_RELEASE_HOLD_MS: 0,
  LED_INVERT: true,
  LED_END_COUNT: 177,
  LED_START_COUNT: 0,
  LED_SPREAD_COUNT: 1,
  LED_SPREAD_TAPER: 1,
  MIDI_INPUT: 'None',
  PI_HOST: 'raspberrypi.local',
}
