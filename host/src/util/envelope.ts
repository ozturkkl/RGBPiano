import type { Config } from './config.js'

export type EnvelopeConfig = Pick<Config, 'NOTE_ATTACK_MS' | 'NOTE_RELEASE_MS' | 'NOTE_MIN_LENGTH_MS'>

/** Frame rate for note envelope animation (host strip + preview). */
export const ANIMATION_FPS = 240
export const ANIMATION_INTERVAL_MS = 1000 / ANIMATION_FPS

type NoteState = {
  target: number
  value: number
  pressed: boolean
  noteOnTime: number
  phase: 'attack' | 'release'
  phaseStartTime: number
  phaseStartValue: number
}

function isInstant(config: EnvelopeConfig): boolean {
  return (
    config.NOTE_ATTACK_MS === 0 &&
    config.NOTE_RELEASE_MS === 0 &&
    config.NOTE_MIN_LENGTH_MS === 0
  )
}

const ENVELOPE_EPS = 1e-6

function rampProgress(elapsed: number, durationMs: number): number {
  if (durationMs <= 0) return 1
  return Math.min(1, elapsed / durationMs)
}

function canRelease(state: NoteState, config: EnvelopeConfig, now: number): boolean {
  return (
    !state.pressed &&
    (config.NOTE_MIN_LENGTH_MS === 0 || now >= state.noteOnTime + config.NOTE_MIN_LENGTH_MS)
  )
}

/** Per-note attack/release envelopes for note press lighting. */
export class NoteEnvelopes {
  private notes = new Map<number, NoteState>()

  noteOn(note: number, target: number, config: EnvelopeConfig, now = Date.now()): void {
    const existing = this.notes.get(note)
    if (existing) {
      existing.pressed = true
      existing.target = target
      if (existing.phase === 'release' || existing.value < target) {
        existing.phase = 'attack'
        existing.phaseStartTime = now
        existing.phaseStartValue = existing.value
      }
      if (isInstant(config)) existing.value = target
      return
    }

    const value = isInstant(config) || config.NOTE_ATTACK_MS === 0 ? target : 0
    this.notes.set(note, {
      target,
      value,
      pressed: true,
      noteOnTime: now,
      phase: 'attack',
      phaseStartTime: now,
      phaseStartValue: value,
    })
  }

  noteOff(note: number, config: EnvelopeConfig, now = Date.now()): void {
    const state = this.notes.get(note)
    if (!state) return
    state.pressed = false
    if (isInstant(config)) {
      this.notes.delete(note)
      return
    }
    if (config.NOTE_RELEASE_MS <= 0 && canRelease(state, config, now)) {
      this.notes.delete(note)
    }
  }

  /** Advance envelopes; returns whether another tick is needed. */
  tick(config: EnvelopeConfig, now = Date.now()): boolean {
    if (this.notes.size === 0) return false

    if (isInstant(config)) {
      for (const [note, state] of this.notes) {
        if (!state.pressed) this.notes.delete(note)
      }
      return this.isAnimating(config, now)
    }

    for (const [note, state] of [...this.notes.entries()]) {
      if (canRelease(state, config, now)) {
        if (config.NOTE_RELEASE_MS <= 0) {
          this.notes.delete(note)
          continue
        }
        if (state.phase !== 'release') {
          state.phase = 'release'
          state.phaseStartTime = now
          state.phaseStartValue = state.value
        }
        const t = rampProgress(now - state.phaseStartTime, config.NOTE_RELEASE_MS)
        state.value = state.phaseStartValue * (1 - t)
        if (t >= 1 || state.value <= ENVELOPE_EPS) this.notes.delete(note)
      } else if (state.value < state.target) {
        if (state.phase === 'release') {
          state.phase = 'attack'
          state.phaseStartTime = now
          state.phaseStartValue = state.value
        }
        const t = rampProgress(now - state.phaseStartTime, config.NOTE_ATTACK_MS)
        state.value = state.phaseStartValue + (state.target - state.phaseStartValue) * t
        if (t >= 1) state.value = state.target
      } else {
        state.value = state.target
      }
    }

    return this.isAnimating(config, now)
  }

  isAnimating(config: EnvelopeConfig, now = Date.now()): boolean {
    if (this.notes.size === 0) return false
    if (isInstant(config)) return [...this.notes.values()].some((s) => s.pressed)

    for (const state of this.notes.values()) {
      if (state.pressed) {
        if (state.value < state.target) return true
        continue
      }
      if (config.NOTE_MIN_LENGTH_MS > 0 && now < state.noteOnTime + config.NOTE_MIN_LENGTH_MS) {
        return true
      }
      if (state.value > ENVELOPE_EPS) return true
    }
    return false
  }

  /** Current envelope level (0–1) per active or fading note. */
  *values(): IterableIterator<[note: number, value: number]> {
    for (const [note, state] of this.notes) {
      yield [note, state.value]
    }
  }
}
