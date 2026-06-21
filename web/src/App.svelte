<script lang="ts">
  import { hexToRGB, RGBToHex } from '@rgbpiano/shared'
  import { app, updateConfig } from './lib/host.svelte'

  let useSameColor = $state(localStorage.getItem('useSameColor') !== 'false')
  $effect(() => localStorage.setItem('useSameColor', String(useSameColor)))

  const config = $derived(app.config)

  function setNoteColor(hex: string) {
    const rgb = hexToRGB(hex)
    updateConfig(
      useSameColor
        ? { NOTE_PRESS_COLOR_RGB: rgb, BACKGROUND_COLOR_RGB: rgb }
        : { NOTE_PRESS_COLOR_RGB: rgb },
    )
  }
</script>

<main class="mx-auto flex max-w-md flex-col gap-5 p-5">
  <header class="flex items-center justify-between">
    <h1 class="text-2xl font-bold">RGB Piano</h1>
    <div class="flex gap-2 text-xs">
      <span class="badge gap-1" class:badge-success={app.hostConnected}>
        Host {app.hostConnected ? 'on' : 'off'}
      </span>
      <span class="badge gap-1" class:badge-success={app.piConnected}>
        Pi {app.piConnected ? 'on' : 'off'}
      </span>
    </div>
  </header>

  <label class="form-control">
    <span class="label-text mb-1">MIDI input</span>
    <select
      class="select select-bordered"
      value={config.MIDI_INPUT}
      onchange={(e) => updateConfig({ MIDI_INPUT: e.currentTarget.value })}
    >
      <option>None</option>
      {#each app.devices as device (device)}
        <option>{device}</option>
      {/each}
    </select>
  </label>

  <div class="flex gap-6">
    <label class="form-control">
      <span class="label-text mb-1">Note color</span>
      <input
        type="color"
        value={RGBToHex(...config.NOTE_PRESS_COLOR_RGB)}
        oninput={(e) => setNoteColor(e.currentTarget.value)}
      />
    </label>

    <label class="form-control">
      <span class="label-text mb-1">Background color</span>
      <input
        type="color"
        disabled={useSameColor}
        value={RGBToHex(...config.BACKGROUND_COLOR_RGB)}
        oninput={(e) => updateConfig({ BACKGROUND_COLOR_RGB: hexToRGB(e.currentTarget.value) })}
      />
    </label>
  </div>

  <label class="label cursor-pointer justify-start gap-3">
    <input type="checkbox" class="checkbox" bind:checked={useSameColor} />
    <span class="label-text">Use note color for background</span>
  </label>

  <label class="form-control">
    <span class="label-text mb-1">Brightness</span>
    <input
      type="range"
      min="0"
      max="100"
      class="range"
      value={config.BRIGHTNESS * 100}
      oninput={(e) => updateConfig({ BRIGHTNESS: e.currentTarget.valueAsNumber / 100 })}
    />
  </label>

  <label class="form-control">
    <span class="label-text mb-1">Background brightness</span>
    <input
      type="range"
      min="0"
      max="100"
      class="range"
      value={config.BACKGROUND_BRIGHTNESS * 100}
      oninput={(e) => updateConfig({ BACKGROUND_BRIGHTNESS: e.currentTarget.valueAsNumber / 100 })}
    />
  </label>

  <div class="divider my-0"></div>

  <label class="label cursor-pointer justify-start gap-3">
    <input
      type="checkbox"
      class="checkbox"
      checked={config.CONSTANT_VELOCITY}
      onchange={(e) => updateConfig({ CONSTANT_VELOCITY: e.currentTarget.checked })}
    />
    <span class="label-text">Constant velocity</span>
  </label>

  <label class="label cursor-pointer justify-start gap-3">
    <input
      type="checkbox"
      class="checkbox"
      checked={config.LED_INVERT}
      onchange={(e) => updateConfig({ LED_INVERT: e.currentTarget.checked })}
    />
    <span class="label-text">Invert direction</span>
  </label>

  <div class="flex gap-4">
    <label class="form-control flex-1">
      <span class="label-text mb-1">LED start</span>
      <input
        type="number"
        min="0"
        class="input input-bordered"
        value={config.LED_START_COUNT}
        oninput={(e) => updateConfig({ LED_START_COUNT: e.currentTarget.valueAsNumber })}
      />
    </label>
    <label class="form-control flex-1">
      <span class="label-text mb-1">LED end</span>
      <input
        type="number"
        min="0"
        class="input input-bordered"
        value={config.LED_END_COUNT}
        oninput={(e) => updateConfig({ LED_END_COUNT: e.currentTarget.valueAsNumber })}
      />
    </label>
  </div>

  <label class="form-control">
    <span class="label-text mb-1">Pi address</span>
    <input
      type="text"
      class="input input-bordered"
      value={config.PI_HOST}
      onchange={(e) => updateConfig({ PI_HOST: e.currentTarget.value })}
    />
  </label>
</main>

<style>
  input[type='color'] {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    width: 48px;
    height: 44px;
    padding: 0;
    border: none;
    border-radius: 10px;
    background: transparent;
    cursor: pointer;
  }
  input[type='color']::-webkit-color-swatch {
    border: 2px solid var(--fallback-b3, oklch(var(--b3)));
    border-radius: 10px;
  }
  input[type='color']:disabled {
    cursor: not-allowed;
    opacity: 0.4;
  }
</style>
