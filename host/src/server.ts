import http from 'node:http'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { WebSocketServer, WebSocket } from 'ws'
import { HOST_PORT, type Config } from '@rgbpiano/shared'

const WEB_DIR = path.resolve(import.meta.dirname, '../../web/dist')

const MIME: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
}

export interface BrowserState {
  config: Config
  devices: string[]
  piConnected: boolean
}

export interface ServerHooks {
  getState: () => BrowserState
  updateConfig: (patch: Partial<Config>) => void
}

export interface Server {
  /** Push the latest state to every connected browser. */
  broadcast: () => void
}

export function startServer(hooks: ServerHooks): Server {
  const httpServer = http.createServer((req, res) => serveStatic(req, res))
  const wss = new WebSocketServer({ server: httpServer })

  wss.on('connection', (ws) => {
    sendState(ws, hooks.getState())
    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString())
        if (msg.type === 'config') hooks.updateConfig(msg.data)
      } catch (error) {
        console.error('Bad message from browser:', error)
      }
    })
  })

  httpServer.listen(HOST_PORT, () => {
    console.log(`Config UI on http://localhost:${HOST_PORT}`)
  })

  return {
    broadcast: () => {
      const state = hooks.getState()
      for (const client of wss.clients) {
        if (client.readyState === WebSocket.OPEN) sendState(client, state)
      }
    },
  }
}

function sendState(ws: WebSocket, state: BrowserState): void {
  ws.send(JSON.stringify({ type: 'state', data: state }))
}

async function serveStatic(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
  const urlPath = decodeURIComponent((req.url ?? '/').split('?')[0])
  const requested = path.join(WEB_DIR, urlPath)

  // Resolve to a file, falling back to index.html for SPA routes.
  let file = requested
  if (!path.extname(file) || !file.startsWith(WEB_DIR)) {
    file = path.join(WEB_DIR, 'index.html')
  }

  try {
    const body = await readFile(file)
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] ?? 'application/octet-stream' })
    res.end(body)
  } catch {
    res.writeHead(404).end('Not found. Did you run `npm run build`?')
  }
}
