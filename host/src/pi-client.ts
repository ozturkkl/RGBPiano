import { PI_PORT } from './util/constants.js'
import { WebSocket } from 'ws'

const RECONNECT_MS = 2000

/**
 * Streams strip frames to the Pi LED server over a WebSocket, reconnecting forever.
 * The target host can change at runtime (e.g. when the user edits it in the UI).
 */
export class PiClient {
  private host = ''
  private ws?: WebSocket
  private connected = false
  private lastFrame?: Buffer
  private statusHandler?: (connected: boolean) => void

  get isConnected(): boolean {
    return this.connected
  }

  onStatusChange(handler: (connected: boolean) => void): void {
    this.statusHandler = handler
  }

  setHost(host: string): void {
    if (host === this.host) return
    this.host = host
    this.connect()
  }

  send(frame: Buffer): void {
    this.lastFrame = frame
    if (this.connected) this.ws?.send(frame)
  }

  private connect(): void {
    this.ws?.removeAllListeners()
    this.ws?.terminate()
    this.setConnected(false)
    if (!this.host) return

    const ws = new WebSocket(`ws://${this.host}:${PI_PORT}`)
    this.ws = ws

    ws.on('open', () => {
      this.setConnected(true)
      if (this.lastFrame) ws.send(this.lastFrame)
    })
    ws.on('error', () => {}) // a 'close' always follows
    ws.on('close', () => {
      if (ws !== this.ws) return
      this.setConnected(false)
      setTimeout(() => {
        if (ws === this.ws) this.connect()
      }, RECONNECT_MS)
    })
  }

  private setConnected(connected: boolean): void {
    if (connected === this.connected) return
    this.connected = connected
    this.statusHandler?.(connected)
  }
}
