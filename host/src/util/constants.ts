/** Port the host serves the config web UI + browser WebSocket on. */
export const HOST_PORT = 3192

/** WebSocket path the config UI connects to (kept separate from Vite HMR in dev). */
export const BROWSER_WS_PATH = '/ws'

/** Port the Raspberry Pi LED server listens on. */
export const PI_PORT = 3193

/** Lowest and highest MIDI note numbers on an 88-key piano (A0–C8). */
export const MIN_NOTE = 21
export const MAX_NOTE = 108

/** MIDI channel-1 status bytes (note on / note off). */
export const MIDI_NOTE_ON = 0x90
export const MIDI_NOTE_OFF = 0x80

/** GPIO data pin the LED strip is wired to on the Pi. Documented here; the Pi reads its own. */
export const DATA_PIN = 18
