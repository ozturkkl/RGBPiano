import { defaultConfig, HOST_PORT, type Config } from '@rgbpiano/shared'

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
  ws = new WebSocket(`ws://${location.hostname}:${HOST_PORT}`)

  ws.onopen = () => (app.hostConnected = true)
  ws.onclose = () => {
    app.hostConnected = false
    app.piConnected = false
    setTimeout(connect, 1000)
  }
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data)
    if (msg.type === 'state') {
      app.config = msg.data.config
      app.devices = msg.data.devices
      app.piConnected = msg.data.piConnected
    }
  }
}

connect()

/** Apply a config change optimistically and send it to the host. */
export function updateConfig(patch: Partial<Config>): void {
  Object.assign(app.config, patch)
  if (ws?.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'config', data: patch }))
  }
}
