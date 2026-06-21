import { defaultConfig, type Config } from '../../util/config.js'
import type { BrowserMessage, BrowserState } from '../../util/messages.js'

interface State {
  config: Config
  devices: string[]
  piConnected: boolean
  hostConnected: boolean
}

export const app: State = $state({
  config: { ...defaultConfig },
  devices: [],
  piConnected: false,
  hostConnected: false,
})

let ws: WebSocket | undefined

function connect(): void {
  const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
  ws = new WebSocket(`${protocol}//${location.host}`)

  ws.onopen = () => (app.hostConnected = true)
  ws.onclose = () => {
    app.hostConnected = false
    app.piConnected = false
    setTimeout(connect, 1000)
  }
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data) as BrowserMessage
    if (msg.type === 'state') {
      const state: BrowserState = msg.data
      app.config = state.config
      app.devices = state.devices
      app.piConnected = state.piConnected
    }
  }
}

connect()

/** Apply a config change optimistically and send it to the host. */
export function updateConfig(patch: Partial<Config>): void {
  Object.assign(app.config, patch)
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'config', data: patch } satisfies BrowserMessage))
  }
}
