<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import type { Config } from '../../../main/types/config'
  import { HSLToRGB, hexToRgb } from '../../../main/util/colors'
  import { RGBToHSL } from '../../../main/util/colors'

  function changeColor(e: Event & { currentTarget: HTMLInputElement }) {
    const [red, green, blue] = hexToRgb(e.currentTarget.value)
    const [hue, sat, bri] = RGBToHSL(red, green, blue)
    const config: Partial<Config> = {
      BACKGROUND_COLOR_RGB: HSLToRGB(hue, sat, bri),
      NOTE_PRESS_COLOR_RGB: HSLToRGB(hue, sat, bri)
    }

    window.electron.ipcRenderer.invoke('config', config)
  }

  function changeBrightness(e: Event & { currentTarget: HTMLInputElement }) {
    const config: Partial<Config> = {
      BRIGHTNESS: parseInt(e.currentTarget.value) / 100
    }

    window.electron.ipcRenderer.invoke('config', config)
  }
  function changeBackgroundBrightness(e: Event & { currentTarget: HTMLInputElement }) {
    const config: Partial<Config> = {
      BACKGROUND_BRIGHTNESS: parseInt(e.currentTarget.value) / 100
    }

    window.electron.ipcRenderer.invoke('config', config)
  }

  function changeConstantVelocity(e: Event & { currentTarget: HTMLInputElement }) {
    const config: Partial<Config> = {
      CONSTANT_VELOCITY: e.currentTarget.checked
    }

    window.electron.ipcRenderer.invoke('config', config)
  }

  function changeLEDInvert(e: Event & { currentTarget: HTMLInputElement }) {
    const config: Partial<Config> = {
      LED_INVERT: e.currentTarget.checked
    }

    window.electron.ipcRenderer.invoke('config', config)
  }

  function changeLEDStartCount(e: Event & { currentTarget: HTMLInputElement }) {
    const config: Partial<Config> = {
      LED_START_COUNT: parseInt(e.currentTarget.value)
    }

    window.electron.ipcRenderer.invoke('config', config)
  }

  function changeLEDEndCount(e: Event & { currentTarget: HTMLInputElement }) {
    const config: Partial<Config> = {
      LED_END_COUNT: parseInt(e.currentTarget.value)
    }

    window.electron.ipcRenderer.invoke('config', config)
  }

  onMount(() => {
    // noop
  })

  onDestroy(() => {
    // noop
  })
</script>

<div class="Home">
  <h1>Settings</h1>
  <h2>Color</h2>
  <input type="color" on:input={changeColor} />

  <h2>LED Brightness</h2>
  <input type="range" min="0" max="100" on:input={changeBrightness} />

  <h2>Background Brightness</h2>
  <input type="range" min="0" max="100" on:input={changeBackgroundBrightness} />

  <h2>Constant Velocity</h2>
  <input type="checkbox" on:change={changeConstantVelocity} />

  <h2>LED Invert</h2>
  <input type="checkbox" on:change={changeLEDInvert} />

  <h2>LED Start/End Count</h2>
  <input type="number" min="0" max="177" value="0" on:input={changeLEDStartCount} />
  <input type="number" min="0" max="177" value="177" on:input={changeLEDEndCount} />
</div>

<style>
  .Home {
    display: flex;
    flex-direction: column;
  }
</style>
