# RGBPiano

Light up a WS2812 LED strip mounted behind your piano when you play. MIDI from your
computer is streamed over WiFi to a Raspberry Pi Zero that drives the strip.

Inspired by [onlaj/Piano-LED-Visualizer](https://github.com/onlaj/Piano-LED-Visualizer).

> This is a 2026 ground-up rewrite. The previous Electron-based version lives in `.old/`
> for reference. Goals of the rewrite: kill Electron, drop Bluetooth, simplify the Pi
> runtime, keep Svelte, modern typed code, minimal & DRY.

## Architecture

```
  Piano ──USB/MIDI──▶  Host computer  ──WiFi (WebSocket)──▶  Raspberry Pi Zero  ──▶  WS2812 strip
                       (Node + TS)                            (tiny Python driver)
                       • reads MIDI
                       • computes LED frames
                       • serves config web UI
                       • streams pixels to the Pi
```

Two pieces:

### `host/` — the brains (TypeScript / Node, cross-platform)

Runs on your computer (Linux/macOS/Windows). Responsibilities:

- Read MIDI from a selected input port (your piano, or a virtual DAW port).
- Own **all** the interesting logic: note → LED position mapping, invert, start/end
  range, velocity → color blending, background, brightness.
- Compute the final per-LED RGB frame and stream it to the Pi.
- Serve the Svelte config UI on `http://localhost` and persist config to disk.

### `pi/` — the display sink (tiny Python script)

Runs on the Pi Zero. Deliberately **dumb**: it receives a finished pixel frame and
blits it to the strip via [`rpi_ws281x`](https://github.com/jgarff/rpi_ws281x). No MIDI
logic, no color math — all of that lives on the host. This keeps the Pi side ~30 lines,
avoids the old pain of running Node on ARMv6, and uses the Python that ships with
Raspberry Pi OS.

### Why "dumb Pi"?

The old design ran the LED math on the Pi and shipped raw MIDI + config to it. By moving
all logic to the host and streaming finished frames instead, we get:

- One typed source of truth for all behavior (testable on the host).
- A trivially simple, robust Pi script.
- No duplicated color/position logic across two runtimes.

## Project layout

```
host/    Node + TypeScript + Svelte: MIDI, LED frames, config UI, Pi streaming
pi/      Python LED driver + systemd unit for autostart
.old/    Previous Electron implementation (reference only)
```

## Getting started

### Host (your computer)

Requires Node 20+.

```bash
cd host
npm install
npm start          # builds the web UI, then runs the host
```

Then open http://localhost:3192, pick your MIDI input, set the Pi address, and play.
Config is saved to `~/.rgbpiano/config.json`.

For development with hot-reloading UI on the same port:

```bash
cd host
npm run dev        # host + UI on http://localhost:3192
```

### Pi (the LED driver)

Clone this repo on the Pi, then:

```bash
cd RGBPiano/pi
./install.sh       # idempotent: installs deps + a systemd service, starts on boot
```

To update after pulling new code, just run `./install.sh` again. To remove
everything (service + virtualenv):

```bash
./uninstall.sh
```

Useful checks on the Pi:

```bash
systemctl status rgbpiano       # is it running?
journalctl -u rgbpiano -f        # live logs
```

The LED data pin defaults to GPIO 18 and the port to 3193. Override with the
`RGBPIANO_GPIO` / `RGBPIANO_PORT` environment variables in the service if needed.

## Ports

| Port | Where | What |
| ---- | ----- | ---- |
| 3192 | Host  | Config web UI + browser WebSocket |
| 3193 | Pi    | LED frame stream (host → Pi) |

## Hardware

- Raspberry Pi Zero (W / 2 W) + microSD
- WS2812 addressable RGB LED strip (better strip = better color)
- 5V power supply sized for your LED count
- See [onlaj/Piano-LED-Visualizer](https://github.com/onlaj/Piano-LED-Visualizer) for
  detailed wiring.
