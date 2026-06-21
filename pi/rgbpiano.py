#!/usr/bin/env python3
"""RGBPiano LED server.

A deliberately dumb display sink: it receives finished pixel frames over a WebSocket
and blits them to a WS2812 strip. All the visual logic lives on the host.

Frame format (binary): [MSG_FRAME, brightness, r, g, b, r, g, b, ...]
The strip is sized to the number of pixels in each frame.
"""

import asyncio
import os

from rpi_ws281x import Color, PixelStrip
from websockets.server import serve

PORT = int(os.environ.get("RGBPIANO_PORT", "3193"))
GPIO = int(os.environ.get("RGBPIANO_GPIO", "18"))

LED_FREQ_HZ = 800000
LED_DMA = 10
LED_INVERT = False
LED_CHANNEL = 0

MSG_FRAME = 0x01

_strip: PixelStrip | None = None
_strip_len = 0


def _ensure_strip(num_leds: int, brightness: int) -> PixelStrip:
    """(Re)create the strip when the LED count changes."""
    global _strip, _strip_len
    if _strip is None or _strip_len != num_leds:
        _strip = PixelStrip(
            num_leds, GPIO, LED_FREQ_HZ, LED_DMA, LED_INVERT, brightness, LED_CHANNEL
        )
        _strip.begin()
        _strip_len = num_leds
    return _strip


def render(data: bytes) -> None:
    if len(data) < 2 or data[0] != MSG_FRAME:
        return

    brightness = data[1]
    pixels = data[2:]
    num_leds = len(pixels) // 3

    strip = _ensure_strip(num_leds, brightness)
    strip.setBrightness(brightness)
    for i in range(num_leds):
        o = i * 3
        strip.setPixelColor(i, Color(pixels[o], pixels[o + 1], pixels[o + 2]))
    strip.show()


async def handler(websocket, *_args) -> None:
    async for message in websocket:
        if isinstance(message, bytes):
            render(message)


async def main() -> None:
    print(f"RGBPiano LED server listening on :{PORT} (GPIO {GPIO})", flush=True)
    async with serve(handler, "0.0.0.0", PORT, max_size=None):
        await asyncio.Future()  # run forever


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass
