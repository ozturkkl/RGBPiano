<script lang="ts">
  import { onMount } from 'svelte'
  import { hexToRgb, RGBToHex } from '../../../main/util/colors'
  import { defaultConfig } from '../../../main/util/consts'
  import { Store } from '../util/store'

  // Variables for each config setting
  const config = Store.getPersistent('config', defaultConfig)
  const useColorForBackground = Store.getPersistent<boolean>('useColorForBackground', true)
  let connected: boolean

  $: brightness = $config.BRIGHTNESS * 100
  $: backgroundBrightness = $config.BACKGROUND_BRIGHTNESS * 100

  $: notePressColorHex = RGBToHex(...$config.NOTE_PRESS_COLOR_RGB)
  $: notePressBgColorHex = RGBToHex(...$config.BACKGROUND_COLOR_RGB)

  $: $useColorForBackground && ($config.BACKGROUND_COLOR_RGB = $config.NOTE_PRESS_COLOR_RGB)

  $: window.ipcRenderer.invoke('config', $config)

  onMount(() => {
    const checkConnected = async () => {
      if (window.ipcRenderer) {
        connected = (await window.ipcRenderer.invoke('connected', {})) as boolean
      }
    }
    const connectedCheckInterval = setInterval(checkConnected, 500)
    checkConnected()

    return () => clearInterval(connectedCheckInterval)
  })

  function changeColor(e: Event & { currentTarget: HTMLInputElement }) {
    const rgb = hexToRgb(e.currentTarget.value)
    $config.NOTE_PRESS_COLOR_RGB = rgb
  }

  function changeColorBg(e: Event & { currentTarget: HTMLInputElement }) {
    const rgb = hexToRgb(e.currentTarget.value)
    $config.BACKGROUND_COLOR_RGB = rgb
  }

  function changeBrightness(e: Event & { currentTarget: HTMLInputElement }) {
    $config.BRIGHTNESS = parseInt(e.currentTarget.value) / 100
  }

  function changeBackgroundBrightness(e: Event & { currentTarget: HTMLInputElement }) {
    $config.BACKGROUND_BRIGHTNESS = parseInt(e.currentTarget.value) / 100
  }

  function changeConstantVelocity(e: Event & { currentTarget: HTMLInputElement }) {
    $config.CONSTANT_VELOCITY = e.currentTarget.checked
  }

  function changeLEDInvert(e: Event & { currentTarget: HTMLInputElement }) {
    $config.LED_INVERT = e.currentTarget.checked
  }

  function changeLEDStartCount(e: Event & { currentTarget: HTMLInputElement }) {
    $config.LED_START_COUNT = parseInt(e.currentTarget.value)
  }

  function changeLEDEndCount(e: Event & { currentTarget: HTMLInputElement }) {
    $config.LED_END_COUNT = parseInt(e.currentTarget.value)
  }
</script>

<div>
  <div class="flex justify-between align-center mb-4">
    <p class="text-3xl font-bold pb-1">Led Visualizer</p>
    {#if connected !== undefined}
      <label class="swap">
        <input type="checkbox" bind:checked={connected} disabled />
        <div class="swap-on flex items-center gap-2 justify-end">
          Connected<span class="badge badge-success badge-xs mr-1"></span><span
            class="loading loading-ring loading-md text-success absolute right-[-2px]"
          ></span>
        </div>
        <div class="swap-off flex items-center gap-1 justify-end">
          Trying to connect...<span class="loading loading-ring loading-xs"></span>
        </div>
      </label>
    {/if}
  </div>

  <p class="text-xl font-semibold mb-2">Color</p>
  <input type="color" value={notePressColorHex} on:input={changeColor} />

  <p class="text-xl font-semibold mb-2">Background Color</p>
  <label class="label cursor-pointer">
    <span class="label-text">Use same color as Color</span>
    <input
      type="checkbox"
      checked={$useColorForBackground}
      class="checkbox"
      on:change={() => ($useColorForBackground = !$useColorForBackground)}
    />
  </label>
  <input type="color" value={notePressBgColorHex} on:input={changeColorBg} disabled={$useColorForBackground} />

  <p class="text-xl font-semibold mb-2">Brightness</p>
  <input type="range" min="0" max="100" value={brightness} on:input={changeBrightness} class="range mb-4" />

  <p class="text-xl font-semibold mb-2">Background Brightness</p>
  <input
    type="range"
    min="0"
    max="100"
    value={backgroundBrightness}
    on:input={changeBackgroundBrightness}
    class="range mb-4"
  />

  <div class="divider">Other</div>

  <label class="label cursor-pointer">
    <span class="label-text">Constant Velocity</span>
    <input type="checkbox" checked={$config.CONSTANT_VELOCITY} class="checkbox" on:change={changeConstantVelocity} />
  </label>

  <label class="label cursor-pointer">
    <span class="label-text">LED Invert</span>
    <input type="checkbox" checked={$config.LED_INVERT} class="checkbox" on:change={changeLEDInvert} />
  </label>

  <p class="text-xl font-semibold mb-2">LED Start/End Count</p>
  <input
    type="number"
    min="0"
    max="177"
    value={$config.LED_START_COUNT}
    on:input={changeLEDStartCount}
    class="input input-bordered w-full max-w-xs mb-4"
  />
  <input
    type="number"
    min="0"
    max="177"
    value={$config.LED_END_COUNT}
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
    height: 44px;
    border: none;
    cursor: pointer;
  }
  input[type='color']::-webkit-color-swatch {
    border-radius: 10px;
    border: 2px solid oklch(var(--b3));
  }
</style>
