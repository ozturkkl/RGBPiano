import WebSocket from 'ws'
import { Server, Client, SsdpHeaders } from 'node-ssdp'
import { ConfigType, PORT } from '../util/config'

export type WebsocketMessage =
  | {
      type: 'midi'
      data: number[]
    }
  | {
      type: 'config'
      data: Partial<ConfigType>
    }
  | {
      type: 'ping'
    }

export class WebsocketP2P {
  private server: WebSocket.Server | null
  private client: WebSocket | null
  private connectingPromise: Promise<void> | null
  private onConnectionEstablishedListeners: (() => void)[] = []
  private serverPingInterval: NodeJS.Timeout | null = null

  set onConnectionEstablished(callback: () => void) {
    this.onConnectionEstablishedListeners.push(callback)
  }

  constructor() {
    this.server = null
    this.client = null
    this.connectingPromise = null

    this.setupDelinquentServerCleanup()
  }

  async connect(): Promise<void> {
    if (this.connectingPromise) {
      return await this.connectingPromise
    }

    this.connectingPromise = new Promise((resolve) => {
      ;(async () => {
        this.client = null
        this.server = null
        if (this.serverPingInterval) clearInterval(this.serverPingInterval)

        const device = await this.searchForServer('urn:schemas-upnp-org:service:WebSocket:1')

        if (device) {
          const url = `ws://${device?.LOCATION?.split('//')[1]}`
          console.log(`Connecting to ws server: ${url}`)
          const ws = new WebSocket(url)

          ws.on('open', () => {
            console.log('Connected to remote server')
            this.client = ws
            resolve()
            this.onConnectionEstablishedListeners.forEach((listener) => listener())
          })

          ws.on('error', async (err) => {
            console.error(`Client error: ${err}`)
            resolve()
            setTimeout(this.connect.bind(this), 0)
          })

          ws.on('close', async () => {
            console.log('Remote server closed, trying to reconnect...')
            resolve()
            setTimeout(this.connect.bind(this), 0)
          })

          return
        }

        console.log(`No WebSocket servers with port ${PORT} found, creating one...`)

        // If no WebSocket servers were found, create one
        await this.createWebSocketServer()
        resolve()
      })()
    })

    await this.connectingPromise
    this.connectingPromise = null
  }

  private async createWebSocketServer(): Promise<void> {
    return new Promise<void>((resolve) => {
      const wss = new WebSocket.Server({ port: PORT })

      // Advertise the WebSocket server via SSDP
      const ssdpServer = new Server({
        location: {
          port: PORT,
          path: '/'
        }
      })

      wss.on('connection', () => {
        console.log('Client connected')
        resolve()
        this.onConnectionEstablishedListeners.forEach((listener) => listener())
      })

      wss.on('error', (err) => {
        try {
          ssdpServer.stop()
        } catch (err) {
          console.error(`Could not stop ssdp server: ${err}`)
        }
        resolve()
        console.error(err)
        setTimeout(this.connect.bind(this), 0)
      })

      wss.on('listening', () => {
        ssdpServer.addUSN('urn:schemas-upnp-org:service:WebSocket:1')
        ssdpServer.start()

        console.log('WebSocket server created, waiting for clients...')
        this.server = wss
        this.serverPingInterval = setInterval(() => {
          this.send({ type: 'ping' })
        }, 500)
      })

      wss.on('close', () => {
        try {
          ssdpServer.stop()
        } catch (e) {
          console.log(`Could not stop ssdp server.`)
        }
        resolve()
        console.log('WebSocket server closed, trying to reconnect...')
        setTimeout(this.connect.bind(this), 0)
      })
    })
  }

  send(message: WebsocketMessage): void {
    message.type !== 'ping' && console.log(`Sending message: ${JSON.stringify(message, null, 2)}`)
    if (this.server) {
      this.server.clients.forEach((client) => {
        client.send(JSON.stringify(message))
      })
    } else if (this.client) {
      this.client.send(JSON.stringify(message))
    } else {
      console.warn('Sending failed: No WebSocket connection, message not sent!')
    }
  }

  async listen(callback: (message: WebsocketMessage) => void): Promise<void> {
    if (this.server) {
      this.server.clients.forEach((client) => {
        client.on('message', (message) => {
          const data = JSON.parse(message.toString())
          callback(data)
        })
      })

      this.server.on('connection', (ws) => {
        ws.on('message', (message) => {
          const data = JSON.parse(message.toString())
          callback(data)
        })
      })

      this.server.on('error', (err) => {
        console.error(`Listen error: WebSocket server error: ${err}`)
        this.waitForConnection().then(() => this.listen(callback))
      })

      this.server.on('close', async () => {
        console.log('Listen rerun: WebSocket server closed')
        this.waitForConnection().then(() => this.listen(callback))
      })
    } else if (this.client) {
      this.client.on('message', (message) => {
        const data = JSON.parse(message.toString())
        callback(data)
      })

      this.client.on('error', (err) => {
        console.error(`Listen error: WebSocket client error: ${err}`)
        this.waitForConnection().then(() => this.listen(callback))
      })

      this.client.on('close', async () => {
        console.log('Listen rerun: WebSocket client closed')
        this.waitForConnection().then(() => this.listen(callback))
      })
    } else {
      console.log('Listening failed: No WebSocket connection, waiting for connection...')
      this.waitForConnection().then(() => this.listen(callback))
    }
  }

  private searchForServer(searchTarget: string): Promise<null | SsdpHeaders> {
    console.log(`Searching for devices...`)
    return new Promise((resolve) => {
      const client = new Client()

      client.on('response', (headers) => {
        if (headers?.LOCATION?.includes(`:${PORT}/`)) resolve(headers)
      })

      client.search(searchTarget)

      setTimeout(() => {
        client.stop()
        resolve(null)
      }, 5000)
    })
  }

  private setupDelinquentServerCleanup(): void {
    setInterval(() => {
      if (this.server && this.server.clients.size === 0) {
        console.log('WebSocket server has no clients, closing...')
        this.server.close()
      }
    }, 20000 + Math.random() * 50000)
  }

  waitForConnection(): Promise<void> {
    return new Promise((resolve) => {
      this.onConnectionEstablished = resolve
    })
  }
}
