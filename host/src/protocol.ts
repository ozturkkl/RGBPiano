import type { RGB } from './util/colors.js'

/** Wire protocol between the host and the Pi LED server (binary WebSocket frames). */

export const MSG_FRAME = 0x01

const byte = (n: number): number => Math.max(0, Math.min(255, Math.round(n)))

/**
 * Encode a full strip frame: `[MSG_FRAME, brightness, r, g, b, ...]`.
 * The Pi sizes its strip to the number of pixels in the frame.
 */
export function encodeFrame(brightness: number, pixels: RGB[]): Buffer {
  const buf = Buffer.allocUnsafe(2 + pixels.length * 3)
  buf[0] = MSG_FRAME
  buf[1] = byte(brightness)
  for (let i = 0; i < pixels.length; i++) {
    const [r, g, b] = pixels[i]
    const o = 2 + i * 3
    buf[o] = byte(r)
    buf[o + 1] = byte(g)
    buf[o + 2] = byte(b)
  }
  return buf
}
