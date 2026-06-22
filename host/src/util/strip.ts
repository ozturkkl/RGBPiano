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

/** Offsets from center for a spread count (e.g. 3 → [-1, 0, 1]). */
export function spreadOffsets(spreadCount: number): number[] {
  const left = Math.floor((spreadCount - 1) / 2)
  const right = Math.ceil((spreadCount - 1) / 2)
  const offsets: number[] = []
  for (let offset = -left; offset <= right; offset++) offsets.push(offset)
  return offsets
}

export function ledSpreadIntensity(
  ledIndex: number,
  centerIndex: number,
  spreadCount: number,
  taper: number,
  velocityRatio = 1,
): number {
  const offset = ledIndex - centerIndex
  if (!spreadOffsets(spreadCount).includes(offset)) return 0
  return velocityRatio * taper ** Math.abs(offset)
}
