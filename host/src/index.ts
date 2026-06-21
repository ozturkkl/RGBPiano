import { getConfig, onConfigUpdated, updateConfig } from './config.js'
import { LedFrame } from './leds.js'
import { MidiManager } from './midi.js'
import { PiClient } from './pi-client.js'
import { startServer } from './server.js'

const leds = new LedFrame()
const pi = new PiClient()
const midi = new MidiManager()

const server = startServer({
  getState: () => ({
    config: getConfig(),
    devices: midi.inputs,
    piConnected: pi.isConnected,
  }),
  updateConfig,
})

await midi.init()

// MIDI in → update strip → stream to Pi.
midi.onMessage((message) => {
  leds.handleMidi(message)
  pi.send(leds.toFrame())
})
midi.onStateChange(() => server.broadcast())

pi.onStatusChange(() => server.broadcast())

// Config changes drive the Pi target, MIDI input selection, and a fresh frame.
onConfigUpdated((changed) => {
  pi.setHost(getConfig().PI_HOST)
  if (changed.MIDI_INPUT !== undefined) midi.select(getConfig().MIDI_INPUT)
  pi.send(leds.toFrame())
  server.broadcast()
}, true)

console.log('RGBPiano host running.')
