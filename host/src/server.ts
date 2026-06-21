import http from 'node:http'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { WebSocketServer, WebSocket } from 'ws'
import type { ViteDevServer } from 'vite'
import { HOST_PORT, BROWSER_WS_PATH } from './util/constants.js'
import type { BrowserMessage, BrowserState } from './util/messages.js'
import type { Config } from './util/config.js'
import { createViteDevServer } from './vite-dev.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const WEB_DIR = path.resolve(__dirname, '../dist')

const MIME: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
}

export type { BrowserState }

export interface ServerHooks {
  getState: () => BrowserState
  updateConfig: (patch: Partial<Config>) => void
}

export interface Server {
  /** Push the latest state to every connected browser. */
  broadcast: () => void
}

export interface ServerOptions {
  dev?: boolean
}

export async function startServer(hooks: ServerHooks, options?: ServerOptions): Promise<Server> {
  const httpServer = http.createServer()
  const vite: ViteDevServer | undefined = options?.dev
    ? await createViteDevServer(httpServer)
    : undefined

  httpServer.on('request', (req, res) => {
    if (vite) {
      vite.middlewares(req, res, () => serveStatic(req, res))
    } else {
      serveStatic(req, res)
    }
  })

  const wss = new WebSocketServer({ noServer: true })

  httpServer.on('upgrade', (req, socket, head) => {
    const pathname = new URL(req.url ?? '/', `http://${req.headers.host}`).pathname
    if (pathname !== BROWSER_WS_PATH) return

    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit('connection', ws, req)
    })
  })

  wss.on('connection', (ws) => {
    ws.on('error', (error) => console.error('Browser WS error:', error.message))
    sendState(ws, hooks.getState())
    ws.on('message', (raw) => {
      try {
        const msg = JSON.parse(raw.toString()) as BrowserMessage
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
  const msg: BrowserMessage = { type: 'state', data: state }
  ws.send(JSON.stringify(msg))
}

async function serveStatic(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
  const urlPath = decodeURIComponent((req.url ?? '/').split('?')[0])
  const file = path.normalize(path.join(WEB_DIR, urlPath))

  if (!file.startsWith(WEB_DIR)) {
    res.writeHead(403).end()
    return
  }

  const target = path.extname(file) ? file : path.join(WEB_DIR, 'index.html')

  try {
    const body = await readFile(target)
    res.writeHead(200, { 'Content-Type': MIME[path.extname(target)] ?? 'application/octet-stream' })
    res.end(body)
  } catch {
    res.writeHead(404).end('Not found. Did you run `npm run build`?')
  }
}
