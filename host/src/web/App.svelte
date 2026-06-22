<script lang="ts">
  import { hexToRGB, RGBToHex } from '../util/colors.js'
  import { app, updateConfig } from './lib/host.svelte'
  import PianoPreview from './components/PianoPreview.svelte'
  import SvgPiano from './svg/SvgPiano.svelte'

  let useSameColor = $state(localStorage.getItem('useSameColor') !== 'false')
  $effect(() => localStorage.setItem('useSameColor', String(useSameColor)))

  function setNoteColor(hex: string) {
    const rgb = hexToRGB(hex)
    updateConfig(
      useSameColor
        ? { NOTE_PRESS_COLOR_RGB: rgb, BACKGROUND_COLOR_RGB: rgb }
        : { NOTE_PRESS_COLOR_RGB: rgb },
    )
  }

  function setUseSameColor(checked: boolean) {
    useSameColor = checked
    if (checked) {
      updateConfig({ BACKGROUND_COLOR_RGB: [...app.config.NOTE_PRESS_COLOR_RGB] })
    }
  }

  function pct(value: number): string {
    return `${Math.round(value * 100)}%`
  }
</script>

<div class="mx-auto flex max-w-md flex-col gap-6 px-5 pt-8 pb-10">
  <header class="flex flex-col gap-5">
    <div class="flex items-center justify-between gap-4">
      <div class="flex min-w-0 items-center gap-4">
        <div class="w-[4.5rem] shrink-0 text-primary [&_svg]:block [&_svg]:h-auto [&_svg]:w-full">
          <SvgPiano />
        </div>
        <div>
          <h1 class="text-xl font-bold tracking-tight">RGB Piano</h1>
          <p class="mt-0.5 text-sm text-base-content/60">Light your keys as you play</p>
        </div>
      </div>

      <span
        class="badge badge-sm badge-outline shrink-0 gap-1.5 uppercase"
        class:badge-success={app.piConnected}
      >
        <span
          class="size-1.5 rounded-full bg-current opacity-40"
          class:opacity-100={app.piConnected}
        ></span>
        Pi {app.piConnected ? 'connected' : 'offline'}
      </span>
    </div>

    <PianoPreview />
  </header>

  <main class="flex flex-col gap-4">
    <section class="card card-border bg-base-200/70">
      <div class="card-body gap-4 p-5">
        <h2 class="text-xs font-semibold tracking-widest text-base-content/50 uppercase">
          Connection
        </h2>

        <label class="form-control">
          <div class="label py-0">
            <span class="label-text">MIDI input</span>
          </div>
          <select
            class="select select-bordered w-full"
            value={app.config.MIDI_INPUT}
            onchange={(e) => updateConfig({ MIDI_INPUT: e.currentTarget.value })}
          >
            <option>None</option>
            {#each app.devices as device (device)}
              <option>{device}</option>
            {/each}
          </select>
        </label>

        <label class="form-control">
          <div class="label py-0">
            <span class="label-text">Pi address</span>
          </div>
          <input
            type="text"
            class="input input-bordered w-full"
            placeholder="raspberrypi.local"
            value={app.config.PI_HOST}
            onchange={(e) => updateConfig({ PI_HOST: e.currentTarget.value })}
          />
        </label>
      </div>
    </section>

    <section class="card card-border bg-base-200/70">
      <div class="card-body gap-4 p-5">
        <h2 class="text-xs font-semibold tracking-widest text-base-content/50 uppercase">Colors</h2>

        <div class="flex gap-3">
          <label class="form-control min-w-0 flex-1">
            <div class="label py-0">
              <span class="label-text">Note</span>
            </div>
            <div
              class="flex items-center gap-2.5 rounded-field border border-base-300 bg-base-100 px-3 py-2"
            >
              <input
                type="color"
                value={RGBToHex(...app.config.NOTE_PRESS_COLOR_RGB)}
                oninput={(e) => setNoteColor(e.currentTarget.value)}
              />
              <span class="font-mono text-xs text-base-content/50 uppercase">
                {RGBToHex(...app.config.NOTE_PRESS_COLOR_RGB)}
              </span>
            </div>
          </label>

          <label class="form-control min-w-0 flex-1" class:opacity-45={useSameColor}>
            <div class="label py-0">
              <span class="label-text">Background</span>
            </div>
            <div
              class="flex items-center gap-2.5 rounded-field border border-base-300 bg-base-100 px-3 py-2"
            >
              <input
                type="color"
                disabled={useSameColor}
                value={RGBToHex(...app.config.BACKGROUND_COLOR_RGB)}
                oninput={(e) =>
                  updateConfig({ BACKGROUND_COLOR_RGB: hexToRGB(e.currentTarget.value) })}
              />
              <span class="font-mono text-xs text-base-content/50 uppercase">
                {RGBToHex(...app.config.BACKGROUND_COLOR_RGB)}
              </span>
            </div>
          </label>
        </div>

        <label class="label cursor-pointer justify-start gap-3 py-0">
          <input
            type="checkbox"
            class="toggle toggle-primary"
            checked={useSameColor}
            onchange={(e) => setUseSameColor(e.currentTarget.checked)}
          />
          <span class="label-text">Use note color for background</span>
        </label>
      </div>
    </section>

    <section class="card card-border bg-base-200/70">
      <div class="card-body gap-4 p-5">
        <h2 class="text-xs font-semibold tracking-widest text-base-content/50 uppercase">
          Brightness
        </h2>

        <label class="form-control">
          <div class="label py-0">
            <span class="label-text">Overall</span>
            <span class="label-text-alt font-semibold text-primary tabular-nums">
              {pct(app.config.BRIGHTNESS)}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            class="range range-primary"
            value={app.config.BRIGHTNESS * 100}
            oninput={(e) => updateConfig({ BRIGHTNESS: e.currentTarget.valueAsNumber / 100 })}
          />
        </label>

        <label class="form-control">
          <div class="label py-0">
            <span class="label-text">Background glow</span>
            <span class="label-text-alt font-semibold text-primary tabular-nums">
              {pct(app.config.BACKGROUND_BRIGHTNESS)}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            class="range range-primary"
            value={app.config.BACKGROUND_BRIGHTNESS * 100}
            oninput={(e) =>
              updateConfig({ BACKGROUND_BRIGHTNESS: e.currentTarget.valueAsNumber / 100 })}
          />
        </label>
      </div>
    </section>

    <section class="card card-border bg-base-200/70">
      <div class="card-body gap-4 p-5">
        <h2 class="text-xs font-semibold tracking-widest text-base-content/50 uppercase">
          LED strip
        </h2>

        <div class="flex gap-3">
          <label class="form-control min-w-0 flex-1">
            <div class="label py-0">
              <span class="label-text">Start index</span>
            </div>
            <input
              type="number"
              min="0"
              class="input input-bordered w-full"
              value={app.config.LED_START_COUNT}
              oninput={(e) => updateConfig({ LED_START_COUNT: e.currentTarget.valueAsNumber })}
            />
          </label>

          <label class="form-control min-w-0 flex-1">
            <div class="label py-0">
              <span class="label-text">End index</span>
            </div>
            <input
              type="number"
              min="0"
              class="input input-bordered w-full"
              value={app.config.LED_END_COUNT}
              oninput={(e) => updateConfig({ LED_END_COUNT: e.currentTarget.valueAsNumber })}
            />
          </label>
        </div>

        <label class="label cursor-pointer justify-start gap-3 py-0">
          <input
            type="checkbox"
            class="toggle toggle-primary"
            checked={app.config.LED_INVERT}
            onchange={(e) => updateConfig({ LED_INVERT: e.currentTarget.checked })}
          />
          <span class="label-text">Invert direction</span>
        </label>

        <label class="form-control">
          <div class="label py-0">
            <span class="label-text">LEDs per key</span>
          </div>
          <input
            type="number"
            min="1"
            class="input input-bordered w-full"
            value={app.config.LED_SPREAD_COUNT}
            oninput={(e) =>
              updateConfig({ LED_SPREAD_COUNT: Math.max(1, e.currentTarget.valueAsNumber) })}
          />
        </label>

        <label class="form-control">
          <div class="label py-0">
            <span class="label-text">Adjacent LED taper</span>
            <span class="label-text-alt font-semibold text-primary tabular-nums">
              {pct(app.config.LED_SPREAD_TAPER)}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            class="range range-primary"
            value={app.config.LED_SPREAD_TAPER * 100}
            oninput={(e) => updateConfig({ LED_SPREAD_TAPER: e.currentTarget.valueAsNumber / 100 })}
          />
        </label>

        <label class="label cursor-pointer justify-start gap-3 py-0">
          <input
            type="checkbox"
            class="toggle toggle-primary"
            checked={app.config.CONSTANT_VELOCITY}
            onchange={(e) => updateConfig({ CONSTANT_VELOCITY: e.currentTarget.checked })}
          />
          <span class="label-text">Constant velocity</span>
        </label>
      </div>
    </section>

    <section class="card card-border bg-base-200/70">
      <div class="card-body gap-4 p-5">
        <h2 class="text-xs font-semibold tracking-widest text-base-content/50 uppercase">
          Note animation
        </h2>

        <label class="form-control">
          <div class="label py-0">
            <span class="label-text">Attack</span>
            <span class="label-text-alt font-semibold text-primary tabular-nums">
              {app.config.NOTE_ATTACK_MS} ms
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="2000"
            step="10"
            class="range range-primary"
            value={app.config.NOTE_ATTACK_MS}
            oninput={(e) => updateConfig({ NOTE_ATTACK_MS: e.currentTarget.valueAsNumber })}
          />
        </label>

        <label class="form-control">
          <div class="label py-0">
            <span class="label-text">Release</span>
            <span class="label-text-alt font-semibold text-primary tabular-nums">
              {app.config.NOTE_RELEASE_MS} ms
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="2000"
            step="10"
            class="range range-primary"
            value={app.config.NOTE_RELEASE_MS}
            oninput={(e) => updateConfig({ NOTE_RELEASE_MS: e.currentTarget.valueAsNumber })}
          />
        </label>

        <label class="form-control">
          <div class="label py-0">
            <span class="label-text">Release hold</span>
            <span class="label-text-alt font-semibold text-primary tabular-nums">
              {app.config.NOTE_RELEASE_HOLD_MS} ms
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="2000"
            step="10"
            class="range range-primary"
            value={app.config.NOTE_RELEASE_HOLD_MS}
            oninput={(e) => updateConfig({ NOTE_RELEASE_HOLD_MS: e.currentTarget.valueAsNumber })}
          />
        </label>
      </div>
    </section>
  </main>
</div>
