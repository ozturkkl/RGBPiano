import { MAX_NOTE, MIN_NOTE } from './constants.js'
import type { Config } from './config.js'

export type StripConfig = Pick<Config, 'LED_INVERT' | 'LED_START_COUNT' | 'LED_END_COUNT'>

export function noteToLedIndex(note: number, config: StripConfig): number {
  const ratio = (note - MIN_NOTE) / (MAX_NOTE - MIN_NOTE)
  const position = config.LED_INVERT ? 1 - ratio : ratio
  return position === 1
    ? config.LED_END_COUNT - 1
    : Math.floor(position * (config.LED_END_COUNT - config.LED_START_COUNT) + config.LED_START_COUNT)
}
