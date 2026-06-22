#!/usr/bin/env python3
"""RGBPiano LED server.

A deliberately dumb display sink: it receives finished pixel frames over a WebSocket
and blits them to a WS2812 strip. All the visual logic lives on the host.

Frame format (binary): [MSG_FRAME, brightness, r, g, b, r, g, b, ...]
The strip is sized to the number of pixels in each frame.
"""

from __future__ import annotations

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

# Only ever draw the newest frame; if frames pile up while one is rendering, the
# stale ones are dropped so the strip can never fall behind the host.
# The Event is created inside the running loop (Python 3.7 binds it to a loop on init).
_latest: bytes | None = None
_new_frame: asyncio.Event | None = None


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
    global _latest
    async for message in websocket:
        if isinstance(message, bytes):
            _latest = message
            if _new_frame is not None:
                _new_frame.set()


async def render_loop(new_frame: asyncio.Event) -> None:
    while True:
        await new_frame.wait()
        new_frame.clear()
        frame = _latest
        if frame is not None:
            render(frame)


async def main() -> None:
    global _new_frame
    _new_frame = asyncio.Event()
    print(f"RGBPiano LED server listening on :{PORT} (GPIO {GPIO})", flush=True)
    renderer = asyncio.ensure_future(render_loop(_new_frame))
    try:
        async with serve(handler, "0.0.0.0", PORT, max_size=None):
            await asyncio.Future()  # run forever
    finally:
        renderer.cancel()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass
