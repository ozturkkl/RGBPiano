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
  /** Flip the mapping so low notes are at the far end of the strip. */
  LED_INVERT: boolean
  /** Index of the last LED used (effectively the strip length). */
  LED_END_COUNT: number
  /** Index of the first LED used. LEDs before this stay off. */
  LED_START_COUNT: number
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
  LED_INVERT: true,
  LED_END_COUNT: 177,
  LED_START_COUNT: 0,
  MIDI_INPUT: 'None',
  PI_HOST: 'raspberrypi.local',
}
