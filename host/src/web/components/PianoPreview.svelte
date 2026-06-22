<script lang="ts">
  import { blendRGB, type RGB } from '../../util/colors.js'
  import { MAX_NOTE, MIDI_NOTE_OFF, MIDI_NOTE_ON, MIN_NOTE } from '../../util/constants.js'
  import { ANIMATION_INTERVAL_MS, NoteEnvelopes } from '../../util/envelope.js'
  import { ledSpreadIntensity, noteToLedIndex } from '../../util/strip.js'
  import { app, sendPreview } from '../lib/host.svelte'

  const OCTAVES = 2
  const WHITE_PER_OCTAVE = 7
  const WHITE_COUNT = OCTAVES * WHITE_PER_OCTAVE

  const WHITE_SEMITONES = [0, 2, 4, 5, 7, 9, 11]
  const BLACK_KEYS = [
    { after: 0, semitone: 1 },
    { after: 1, semitone: 3 },
    { after: 3, semitone: 6 },
    { after: 4, semitone: 8 },
    { after: 5, semitone: 10 },
  ]

  const MIN_START_OCTAVE = 1
  const MAX_START_OCTAVE = 6

  /** Preview-only ambient floor; fades out as strip output brightens. */
  const AMBIENT_WHITE = 40
  const AMBIENT_BLACK = 0

  let startOctave = $state(3)
  let activeNotes = $state<number[]>([])
  let latchedNotes = $state<number[]>([])
  let dragging = $state(false)
  let keyboardEl = $state<HTMLDivElement>()
  let envelopeFrame = $state(0)

  const envelopes = new NoteEnvelopes()

  $effect(() => {
    const config = app.config
    const id = setInterval(() => {
      const wasAnimating = envelopes.isAnimating(config)
      envelopes.tick(config)
      if (wasAnimating || envelopes.isAnimating(config)) envelopeFrame++
    }, ANIMATION_INTERVAL_MS)
    return () => clearInterval(id)
  })

  function cNote(octave: number): number {
    return (octave + 1) * 12
  }

  function whiteNote(whiteIndex: number): number {
    const octave = startOctave + Math.floor(whiteIndex / WHITE_PER_OCTAVE)
    return cNote(octave) + WHITE_SEMITONES[whiteIndex % WHITE_PER_OCTAVE]!
  }

  function blackNote(octaveOffset: number, semitone: number): number {
    return cNote(startOctave + octaveOffset) + semitone
  }

  function inRange(note: number): boolean {
    return note >= MIN_NOTE && note <= MAX_NOTE
  }

  function isActive(note: number): boolean {
    return activeNotes.includes(note)
  }

  function backgroundColor(): RGB {
    const { BACKGROUND_COLOR_RGB, BACKGROUND_BRIGHTNESS } = app.config
    return BACKGROUND_COLOR_RGB.map((c) => c * BACKGROUND_BRIGHTNESS) as RGB
  }

  function noteIntensity(note: number): number {
    envelopeFrame
    const config = app.config
    const ledIndex = noteToLedIndex(note, config)
    let max = 0
    for (const [activeNote, envelope] of envelopes.values(config)) {
      if (envelope <= 0) continue
      const center = noteToLedIndex(activeNote, config)
      max = Math.max(
        max,
        ledSpreadIntensity(ledIndex, center, config.LED_SPREAD_COUNT, config.LED_SPREAD_TAPER, envelope),
      )
    }
    return max
  }

  /** Match leds.ts: blend note into background, then scale by overall brightness. */
  function stripColor(note: number): RGB {
    const bg = backgroundColor()
    const intensity = noteIntensity(note)
    const color = intensity > 0 ? blendRGB(app.config.NOTE_PRESS_COLOR_RGB, bg, intensity) : bg
    return color.map((c) => Math.round(c * app.config.BRIGHTNESS)) as RGB
  }

  function lift(value: number, ambient: number): number {
    return Math.min(255, Math.round(value + ambient * (1 - value / 255)))
  }

  function keyColor(note: number, black: boolean): string {
    const [r, g, b] = stripColor(note)
    const factor = black ? 0.4 : 1
    const ambient = black ? AMBIENT_BLACK : AMBIENT_WHITE
    return `rgb(${lift(r * factor, ambient)}, ${lift(g * factor, ambient)}, ${lift(b * factor, ambient)})`
  }

  type KeySlot = {
    note: number
    left: number
    width: number
    center: number
    black: boolean
  }

  function keySlots(): KeySlot[] {
    const unit = 100 / WHITE_COUNT
    const slots: KeySlot[] = []
    for (let i = 0; i < WHITE_COUNT; i++) {
      slots.push({
        note: whiteNote(i),
        left: i * unit,
        width: unit,
        center: (i + 0.5) * unit,
        black: false,
      })
    }
    for (let octave = 0; octave < OCTAVES; octave++) {
      for (const black of BLACK_KEYS) {
        const whiteIndex = octave * WHITE_PER_OCTAVE + black.after
        const width = unit * 0.58
        const left = unit * (whiteIndex + 0.62)
        slots.push({
          note: blackNote(octave, black.semitone),
          left,
          width,
          center: left + width / 2,
          black: true,
        })
      }
    }
    return slots
  }

  function rgbCss([r, g, b]: RGB): string {
    return `rgb(${r}, ${g}, ${b})`
  }

  function scaledBackground(): RGB {
    return backgroundColor().map((c) => Math.round(c * app.config.BRIGHTNESS + 10)) as RGB
  }

  function ledSegmentOpacity(note: number): number {
    return noteIntensity(note) * app.config.BRIGHTNESS
  }

  function pianoGlowStyle(): string {
    const brightness = app.config.BRIGHTNESS
    if (brightness <= 0) return 'none'
    const slots = keySlots()
    const layers: string[] = []
    for (const slot of slots) {
      const intensity = noteIntensity(slot.note)
      if (intensity <= 0) continue
      const [pr, pg, pb] = stripColor(slot.note)
      layers.push(
        `radial-gradient(ellipse 75% 130% at ${slot.center}% 0%, rgba(${pr},${pg},${pb},${0.55 * brightness * intensity}) 0%, rgba(${pr},${pg},${pb},${0.22 * brightness * intensity}) 38%, transparent 72%)`,
      )
    }
    return layers.length > 0 ? layers.join(', ') : 'none'
  }

  function noteOn(note: number): void {
    if (!inRange(note) || isActive(note)) return
    activeNotes = [...activeNotes, note]
    envelopes.noteOn(note, 1, app.config)
    envelopeFrame++
    sendPreview([MIDI_NOTE_ON, note, 127])
  }

  function noteOff(note: number): void {
    if (!isActive(note)) return
    activeNotes = activeNotes.filter((n) => n !== note)
    envelopes.noteOff(note, app.config)
    envelopeFrame++
    sendPreview([MIDI_NOTE_OFF, note, 0])
  }

  function releaseAll(): void {
    if (activeNotes.length === 0) return
    for (const note of activeNotes) sendPreview([MIDI_NOTE_OFF, note, 0])
    for (const note of activeNotes) envelopes.noteOff(note, app.config)
    activeNotes = []
    latchedNotes = []
    envelopeFrame++
  }

  function releaseHeld(): void {
    for (const note of activeNotes) {
      if (!latchedNotes.includes(note)) noteOff(note)
    }
  }

  function toggleLatch(note: number): void {
    if (!inRange(note)) return
    if (latchedNotes.includes(note)) {
      latchedNotes = latchedNotes.filter((n) => n !== note)
      noteOff(note)
    } else {
      latchedNotes = [...latchedNotes, note]
      noteOn(note)
    }
  }

  function shiftOctave(delta: number): void {
    releaseAll()
    startOctave += delta
  }

  function noteUnderPointer(e: PointerEvent): number | null {
    const el = document.elementFromPoint(e.clientX, e.clientY)
    const raw = el?.closest('[data-note]')?.getAttribute('data-note')
    if (!raw) return null
    const note = Number(raw)
    return inRange(note) ? note : null
  }

  /** While dragging, only the key under the pointer stays pressed (latched keys stay on). */
  function setDragNote(note: number | null): void {
    for (const n of activeNotes) {
      if (latchedNotes.includes(n)) continue
      if (note === null || n !== note) noteOff(n)
    }
    if (note !== null) noteOn(note)
  }

  function onKeyDown(note: number, e: PointerEvent): void {
    if (e.button !== 0) return
    e.preventDefault()
    keyboardEl?.setPointerCapture(e.pointerId)
    dragging = true
    setDragNote(note)
  }

  function onKeyContextMenu(note: number, e: MouseEvent): void {
    e.preventDefault()
    toggleLatch(note)
  }

  function onKeyEnter(note: number): void {
    if (dragging) setDragNote(note)
  }

  function onKeyboardUp(): void {
    dragging = false
    releaseHeld()
  }

  function onKeyboardMove(e: PointerEvent): void {
    if (!dragging) return
    setDragNote(noteUnderPointer(e))
  }
</script>

<section class="card card-border bg-base-200/70">
  <div class="card-body gap-4 p-5">
  <div class="flex items-center justify-between gap-3">
    <h2 class="text-xs font-semibold tracking-widest text-base-content/50 uppercase">
      Keyboard preview
    </h2>
    <div class="flex items-center gap-1">
      <button
        type="button"
        class="btn btn-xs btn-square btn-ghost"
        disabled={startOctave <= MIN_START_OCTAVE}
        aria-label="Lower octaves"
        onclick={() => shiftOctave(-1)}
      >
        ←
      </button>
      <span class="min-w-16 text-center text-xs font-medium tabular-nums text-base-content/70">
        C{startOctave}–B{startOctave + 1}
      </span>
      <button
        type="button"
        class="btn btn-xs btn-square btn-ghost"
        disabled={startOctave >= MAX_START_OCTAVE}
        aria-label="Higher octaves"
        onclick={() => shiftOctave(1)}
      >
        →
      </button>
    </div>
  </div>

  <div
    bind:this={keyboardEl}
    class="keyboard relative flex h-28 touch-none flex-col overflow-hidden rounded-lg border select-none"
    role="group"
    aria-label="Piano keyboard preview"
    onpointerup={onKeyboardUp}
    onpointercancel={onKeyboardUp}
    onpointermove={onKeyboardMove}
    onlostpointercapture={onKeyboardUp}
  >
    <div
      class="led-strip relative h-2 shrink-0 border-b border-black/40"
      style:background={rgbCss(scaledBackground())}
      aria-hidden="true"
    >
      {#each keySlots() as slot (slot.note)}
        <div
          class="absolute inset-y-0"
          class:z-10={slot.black}
          style:left="{slot.left}%"
          style:width="{slot.width}%"
          style:background={rgbCss(stripColor(slot.note))}
          style:opacity={ledSegmentOpacity(slot.note)}
        ></div>
      {/each}
    </div>

    <div class="keys relative min-h-0 flex-1">
      <div
        class="piano-glow pointer-events-none absolute inset-0 z-10"
        style:background={pianoGlowStyle()}
        aria-hidden="true"
      ></div>

      <div class="relative flex h-full">
        {#each Array(WHITE_COUNT) as _, i (i)}
          {@const note = whiteNote(i)}
          <button
            type="button"
            data-note={note}
            class="h-full min-w-0 flex-1 border-r border-black/10 last:border-r-0"
            class:rounded-bl-lg={i === 0}
            class:rounded-br-lg={i === WHITE_COUNT - 1}
            style:background={keyColor(note, false)}
            aria-label="Note {note}"
            onpointerdown={(e) => onKeyDown(note, e)}
            onpointerenter={() => onKeyEnter(note)}
            oncontextmenu={(e) => onKeyContextMenu(note, e)}
          ></button>
        {/each}
      </div>

      {#each Array(OCTAVES) as _, octave (octave)}
        {#each BLACK_KEYS as black (`${octave}-${black.after}`)}
          {@const whiteIndex = octave * WHITE_PER_OCTAVE + black.after}
          {@const note = blackNote(octave, black.semitone)}
          <button
            type="button"
            data-note={note}
            class="black-key absolute top-0 z-20 h-[62%] rounded-b-sm"
            class:pressed={isActive(note)}
            style:left="calc(100% / {WHITE_COUNT} * {whiteIndex + 0.62})"
            style:width="calc(100% / {WHITE_COUNT} * 0.58)"
            style:background={keyColor(note, true)}
            aria-label="Note {note}"
            onpointerdown={(e) => onKeyDown(note, e)}
            onpointerenter={() => onKeyEnter(note)}
            oncontextmenu={(e) => onKeyContextMenu(note, e)}
          ></button>
        {/each}
      {/each}
    </div>
  </div>

  <p class="text-center text-xs text-base-content/40">
    Click or drag to test; right-click to latch a key
  </p>
  </div>
</section>

<style>
  .keyboard {
    border-color: rgb(0 0 0 / 0.9);
    box-shadow:
      inset 0 0 4px rgb(0 0 0 / 0.12),
      0 0 8px rgb(0 0 0 / 0.4);
  }

  .led-strip {
    box-shadow:
      0 0 6px rgb(0 0 0 / 0.25);
    filter: brightness(5);
  }

  .black-key {
    box-shadow:
      inset 0 0 2px rgba(0, 0, 0, .8),
      0px 0px 3px 0px rgba(0, 0, 0, 0.8);
      filter: brightness(2.2);
  }
</style>
