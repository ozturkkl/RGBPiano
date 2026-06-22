import type { Config } from './config.js'

export type EnvelopeConfig = Pick<Config, 'NOTE_ATTACK_MS' | 'NOTE_RELEASE_MS' | 'NOTE_RELEASE_HOLD_MS'>

/** Frame rate for note envelope animation (host strip + preview). */
export const ANIMATION_FPS = 120
export const ANIMATION_INTERVAL_MS = 1000 / ANIMATION_FPS

type NoteState = {
  target: number
  pressed: boolean
  noteOnTime: number
  releasedAt?: number
  phase: 'attack' | 'release'
  phaseStartTime: number
  phaseStartValue: number
}

function isInstant(config: EnvelopeConfig): boolean {
  return (
    config.NOTE_ATTACK_MS === 0 &&
    config.NOTE_RELEASE_MS === 0 &&
    config.NOTE_RELEASE_HOLD_MS === 0
  )
}

const ENVELOPE_EPS = 1e-6

function rampProgress(elapsed: number, durationMs: number): number {
  if (durationMs <= 0) return 1
  return Math.min(1, elapsed / durationMs)
}

function releaseFadeAt(state: NoteState, config: EnvelopeConfig): number {
  if (state.pressed || state.releasedAt === undefined) return Infinity
  return state.releasedAt + config.NOTE_RELEASE_HOLD_MS
}

function canRelease(state: NoteState, config: EnvelopeConfig, now: number): boolean {
  return !state.pressed && state.releasedAt !== undefined && now >= releaseFadeAt(state, config)
}

function attackValue(state: NoteState, config: EnvelopeConfig, at: number): number {
  if (config.NOTE_ATTACK_MS <= 0) return state.target
  const t = rampProgress(at - state.phaseStartTime, config.NOTE_ATTACK_MS)
  const v = state.phaseStartValue + (state.target - state.phaseStartValue) * t
  return Math.min(v, state.target)
}

function latchRelease(state: NoteState, config: EnvelopeConfig): void {
  if (state.phase === 'release') return
  const t0 = releaseFadeAt(state, config)
  const releaseStartValue = holdValue(state, config, t0)
  state.phase = 'release'
  state.phaseStartTime = t0
  state.phaseStartValue = releaseStartValue
}

function holdValue(state: NoteState, config: EnvelopeConfig, now: number): number {
  const attack = attackValue(state, config, now)
  return attack < state.target - ENVELOPE_EPS ? attack : state.target
}

function releaseValue(state: NoteState, config: EnvelopeConfig, at: number): number {
  if (config.NOTE_RELEASE_MS <= 0) return 0
  if (state.phase !== 'release') latchRelease(state, config)
  const t = rampProgress(at - state.phaseStartTime, config.NOTE_RELEASE_MS)
  return Math.max(0, state.phaseStartValue * (1 - t))
}

function valueAt(state: NoteState, config: EnvelopeConfig, now: number): number {
  if (state.pressed) return attackValue(state, config, now)
  if (state.releasedAt !== undefined && !canRelease(state, config, now)) {
    return holdValue(state, config, now)
  }
  if (config.NOTE_RELEASE_MS <= 0) return 0
  return releaseValue(state, config, now)
}

/** Per-note attack/release envelopes for note press lighting. */
export class NoteEnvelopes {
  private notes = new Map<number, NoteState>()

  noteOn(note: number, target: number, config: EnvelopeConfig, now = Date.now()): void {
    const existing = this.notes.get(note)
    if (existing) {
      const current = valueAt(existing, config, now)
      existing.pressed = true
      existing.releasedAt = undefined
      existing.target = target
      if (existing.phase === 'release' || current < target) {
        existing.phase = 'attack'
        existing.phaseStartTime = now
        existing.phaseStartValue = current
      }
      return
    }

    const phaseStartValue = config.NOTE_ATTACK_MS === 0 ? target : 0
    this.notes.set(note, {
      target,
      pressed: true,
      noteOnTime: now,
      phase: 'attack',
      phaseStartTime: now,
      phaseStartValue,
    })
  }

  noteOff(note: number, config: EnvelopeConfig, now = Date.now()): void {
    const state = this.notes.get(note)
    if (!state) return
    state.pressed = false
    state.releasedAt = now
    if (isInstant(config)) {
      this.notes.delete(note)
      return
    }
    if (config.NOTE_RELEASE_MS <= 0 && canRelease(state, config, now)) {
      this.notes.delete(note)
    }
  }

  /** Drop finished notes; returns whether another tick is needed. */
  tick(config: EnvelopeConfig, now = Date.now()): boolean {
    if (this.notes.size === 0) return false

    if (isInstant(config)) {
      for (const [note, state] of this.notes) {
        if (!state.pressed) this.notes.delete(note)
      }
      return this.isAnimating(config, now)
    }

    for (const [note, state] of [...this.notes.entries()]) {
      if (!state.pressed && canRelease(state, config, now)) {
        if (config.NOTE_RELEASE_MS <= 0 || valueAt(state, config, now) <= ENVELOPE_EPS) {
          this.notes.delete(note)
        }
      }
    }

    return this.isAnimating(config, now)
  }

  isAnimating(config: EnvelopeConfig, now = Date.now()): boolean {
    if (this.notes.size === 0) return false
    if (isInstant(config)) return [...this.notes.values()].some((s) => s.pressed)

    for (const state of this.notes.values()) {
      const value = valueAt(state, config, now)
      if (state.pressed) {
        if (value < state.target - ENVELOPE_EPS) return true
        continue
      }
      if (!canRelease(state, config, now)) return true
      if (value > ENVELOPE_EPS) return true
    }
    return false
  }

  /** Current envelope level (0–1) per active or fading note, sampled at `now`. */
  *values(config: EnvelopeConfig, now = Date.now()): IterableIterator<[note: number, value: number]> {
    for (const [note, state] of this.notes) {
      const value = valueAt(state, config, now)
      if (value > ENVELOPE_EPS) yield [note, value]
    }
  }
}
