import WebSocket from 'ws'
import { Server, Client, SsdpHeaders } from 'node-ssdp'
import { PORT } from './config'

export class Connection {
  private server: WebSocket.Server | null
  private client: WebSocket | null
  private connectingPromise: Promise<void> | null
  private delinquentServerCloseTimeout: NodeJS.Timeout | null

  constructor() {
    this.server = null
    this.client = null
    this.connectingPromise = null
    this.delinquentServerCloseTimeout = null
  }

  async connect(): Promise<void> {
    if (this.connectingPromise) {
      return await this.connectingPromise
    }

    this.connectingPromise = new Promise(async (resolve, reject) => {
      this.client = null
      this.server = null

      try {
        const device = await this.searchForServer('urn:schemas-upnp-org:service:WebSocket:1')

        if (device) {
          const url = `ws://${device?.LOCATION?.split('//')[1]}`
          console.log(`Connecting to ${url}`)
          const ws = new WebSocket(url)

          ws.on('open', () => {
            console.log('Connected')
            this.client = ws
            resolve()
          })

          ws.on('error', async (err) => {
            console.error(`WebSocket error: ${err}`)
            this.client = null
            resolve()
          })

          ws.on('close', async () => {
            console.log('Client closed')
            resolve()
          })
          return
        }

        console.log(`No WebSocket servers with port ${PORT} found, creating one...`)

        // If no WebSocket servers were found, create one
        await this.createWebSocketServer()
        resolve()
      } catch (err) {
        console.error(`Error searching/creating WebSocket servers: ${err}`)
        reject(err)
        return
      }
    })

    await this.connectingPromise
    this.connectingPromise = null
  }

  send(message: { type: string; data: object }): void {
    console.log(`Sending message: ${JSON.stringify(message)}`)
    if (this.server) {
      console.log(this.server.clients.size)
      this.server.clients.forEach((client) => {
        client.send(JSON.stringify(message))
      })

      if (this.server.clients.size === 0 && !this.delinquentServerCloseTimeout) {
        console.log(
          'Sending failed: No WebSocket clients connected. Restarting server in 15 seconds...'
        )
        this.delinquentServerCloseTimeout = setTimeout(() => {
          this.server?.close()
          this.delinquentServerCloseTimeout = null
        }, 15000)
      }

      if (this.server.clients.size > 0 && this.delinquentServerCloseTimeout) {
        clearTimeout(this.delinquentServerCloseTimeout)
        this.delinquentServerCloseTimeout = null
      }
    } else if (this.client) {
      this.client.send(JSON.stringify(message))
    } else {
      console.log('Sending failed: No WebSocket connection, trying to connect again...')
      this.connect()
    }
  }

  async listen(callback: (message) => void): Promise<void> {
    if (this.server) {
      this.server.on('connection', (ws) => {
        ws.on('message', (message) => {
          const data = JSON.parse(message.toString())
          callback(data)
        })

        ws.on('error', (err) => {
          console.error(`Listen error: WebSocket client error: ${err}`)
          this.server = null
          this.listen(callback)
        })
      })

      this.server.on('error', (err) => {
        console.error(`Listen error: WebSocket server error: ${err}`)
        this.server = null
        this.listen(callback)
      })

      this.server.on('close', async () => {
        console.log('WebSocket server closed, trying to reconnect...')
        await this.connect()
        this.listen(callback)
      })
    } else if (this.client) {
      this.client.on('message', (message) => {
        const data = JSON.parse(message.toString())
        callback(data)
      })

      this.client.on('error', (err) => {
        console.error(`Listen error: WebSocket error: ${err}`)
        this.client = null
        this.listen(callback)
      })

      this.client.on('close', async () => {
        console.log('Connection closed, trying to reconnect...')
        this.client = null
        this.listen(callback)
      })
    } else {
      console.log('Listening failed: No WebSocket connection, trying to connect...')
      await this.connect()
      this.listen(callback)
    }
  }

  createWebSocketServer(): Promise<void> {
    return new Promise<void>((resolve) => {
      try {
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
        })

        wss.on('error', (err) => {
          console.error(`WebSocket server error: ${err}`)
          this.server = null
          try {
            ssdpServer.stop()
          } catch (e) {
            console.log(`Could not stop ssdp server.`)
          }
          resolve()
        })

        wss.on('listening', () => {
          ssdpServer.addUSN('urn:schemas-upnp-org:service:WebSocket:1')
          ssdpServer.start()

          console.log('WebSocket server created')
          this.server = wss
          resolve()
        })

        wss.on('close', () => {
          console.log('WebSocket server closed')
          this.server = null
          try {
            ssdpServer.stop()
          } catch (e) {
            console.log(`Could not stop ssdp server.`)
          }
          resolve()
        })
      } catch (err) {
        console.error(`Error creating WebSocket server: ${err}`)
        this.server = null
        resolve()
      }
    })
  }

  searchForServer(searchTarget: string): Promise<null | SsdpHeaders> {
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
}
