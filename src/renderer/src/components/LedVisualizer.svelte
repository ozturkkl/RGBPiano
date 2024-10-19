<script lang="ts">
  import { onMount } from 'svelte'
  import { hexToRgb, HSLToRGB, RGBToHex, RGBToHSL } from '../../../main/util/colors'
  import { defaultConfig, type ConfigType } from '../../../main/util/consts'

  // Variables for each config setting
  let config = defaultConfig
  $: brightness = config.BRIGHTNESS * 100
  $: backgroundBrightness = config.BACKGROUND_BRIGHTNESS * 100
  $: notePressColorHex = RGBToHex(...config.NOTE_PRESS_COLOR_RGB)

  // Request the initial config and set the UI elements accordingly
  const requestConfig = async () => {
    config = (await window.ipcRenderer.invoke('config:get', {})) as ConfigType
  }

  function changeColor(e: Event & { currentTarget: HTMLInputElement }) {
    const [red, green, blue] = hexToRgb(e.currentTarget.value)
    const [hue, sat, bri] = RGBToHSL(red, green, blue)
    const configUpdate = {
      BACKGROUND_COLOR_RGB: HSLToRGB(hue, sat, bri),
      NOTE_PRESS_COLOR_RGB: HSLToRGB(hue, sat, bri),
    }

    window.ipcRenderer.invoke('config', configUpdate)
  }

  function changeBrightness(e: Event & { currentTarget: HTMLInputElement }) {
    const configUpdate = {
      BRIGHTNESS: parseInt(e.currentTarget.value) / 100,
    }

    window.ipcRenderer.invoke('config', configUpdate)
  }

  function changeBackgroundBrightness(e: Event & { currentTarget: HTMLInputElement }) {
    const configUpdate = {
      BACKGROUND_BRIGHTNESS: parseInt(e.currentTarget.value) / 100,
    }

    window.ipcRenderer.invoke('config', configUpdate)
  }

  function changeConstantVelocity(e: Event & { currentTarget: HTMLInputElement }) {
    const configUpdate = {
      CONSTANT_VELOCITY: e.currentTarget.checked,
    }

    window.ipcRenderer.invoke('config', configUpdate)
  }

  function changeLEDInvert(e: Event & { currentTarget: HTMLInputElement }) {
    const configUpdate = {
      LED_INVERT: e.currentTarget.checked,
    }

    window.ipcRenderer.invoke('config', configUpdate)
  }

  function changeLEDStartCount(e: Event & { currentTarget: HTMLInputElement }) {
    const configUpdate = {
      LED_START_COUNT: parseInt(e.currentTarget.value),
    }

    window.ipcRenderer.invoke('config', configUpdate)
  }

  function changeLEDEndCount(e: Event & { currentTarget: HTMLInputElement }) {
    const configUpdate = {
      LED_END_COUNT: parseInt(e.currentTarget.value),
    }

    window.ipcRenderer.invoke('config', configUpdate)
  }

  onMount(() => {
    requestConfig() // Request the existing config on mount
  })
</script>

<div class="p-8">
  <h1 class="text-3xl font-bold mb-4">Led Visualizer</h1>
  <h2 class="text-xl font-semibold mb-2">Color</h2>

  <input type="color" value={notePressColorHex} on:input={changeColor} />

  <div class="divider"></div>

  <h2 class="text-xl font-semibold mb-2">LED Brightness</h2>
  <input type="range" min="0" max="100" value={brightness} on:input={changeBrightness} class="range mb-4" />

  <h2 class="text-xl font-semibold mb-2">Background Brightness</h2>
  <input
    type="range"
    min="0"
    max="100"
    value={backgroundBrightness}
    on:input={changeBackgroundBrightness}
    class="range mb-4"
  />

  <div class="form-control mb-4">
    <label class="label cursor-pointer">
      <span class="label-text">Constant Velocity</span>
      <input type="checkbox" checked={config.CONSTANT_VELOCITY} class="checkbox" on:change={changeConstantVelocity} />
    </label>
  </div>

  <div class="form-control mb-4">
    <label class="label cursor-pointer">
      <span class="label-text">LED Invert</span>
      <input type="checkbox" checked={config.LED_INVERT} class="checkbox" on:change={changeLEDInvert} />
    </label>
  </div>

  <div class="divider">Start / End</div>

  <h2 class="text-xl font-semibold mb-2">LED Start/End Count</h2>
  <input
    type="number"
    min="0"
    max="177"
    value={config.LED_START_COUNT}
    on:input={changeLEDStartCount}
    class="input input-bordered w-full max-w-xs mb-4"
  />
  <input
    type="number"
    min="0"
    max="177"
    value={config.LED_END_COUNT}
    on:input={changeLEDEndCount}
    class="input input-bordered w-full max-w-xs mb-4"
  />
</div>

<style>
  input[type='color'] {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    background-color: transparent;
    width: 40px;
    height: 40px;
    border: none;
    cursor: pointer;
  }
  input[type='color']::-webkit-color-swatch {
    border-radius: 999px;
    border: 3px solid #000000;
  }
</style>
