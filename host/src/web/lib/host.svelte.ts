import { defaultConfig, type Config } from '../../util/config.js'
import { BROWSER_WS_PATH } from '../../util/constants.js'
import type { BrowserMessage, BrowserState } from '../../util/messages.js'

class HostApp {
  config = $state<Config>({ ...defaultConfig })
  devices = $state<string[]>([])
  piConnected = $state(false)
  hostConnected = $state(false)
}

export const app = new HostApp()

let ws: WebSocket | undefined

function applyState(state: BrowserState): void {
  app.config = structuredClone(state.config)
  app.devices = state.devices
  app.piConnected = state.piConnected
}

function connect(): void {
  const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
  ws = new WebSocket(`${protocol}//${location.host}${BROWSER_WS_PATH}`)

  ws.onopen = () => (app.hostConnected = true)
  ws.onclose = () => {
    app.hostConnected = false
    app.piConnected = false
    setTimeout(connect, 1000)
  }
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data) as BrowserMessage
    if (msg.type === 'state') applyState(msg.data)
  }
}

connect()

/** Apply a config change optimistically and send it to the host. */
export function updateConfig(patch: Partial<Config>): void {
  app.config = { ...app.config, ...patch }
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'config', data: patch } satisfies BrowserMessage))
  }
}

/** Simulate a MIDI message on the strip (and Pi, if connected). */
export function sendPreview(message: number[]): void {
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'preview', data: message } satisfies BrowserMessage))
  }
}
