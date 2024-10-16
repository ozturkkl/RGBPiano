<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import { hexToRgb, HSLToRGB, RGBToHSL } from '../../../main/util/colors'

  function changeColor(e: Event & { currentTarget: HTMLInputElement }) {
    const [red, green, blue] = hexToRgb(e.currentTarget.value)
    const [hue, sat, bri] = RGBToHSL(red, green, blue)
    const config = {
      BACKGROUND_COLOR_RGB: HSLToRGB(hue, sat, bri),
      NOTE_PRESS_COLOR_RGB: HSLToRGB(hue, sat, bri)
    }

    window.ipcRenderer.invoke('config', config)
  }

  function changeBrightness(e: Event & { currentTarget: HTMLInputElement }) {
    const config = {
      BRIGHTNESS: parseInt(e.currentTarget.value) / 100
    }

    window.ipcRenderer.invoke('config', config)
  }
  function changeBackgroundBrightness(e: Event & { currentTarget: HTMLInputElement }) {
    const config = {
      BACKGROUND_BRIGHTNESS: parseInt(e.currentTarget.value) / 100
    }

    window.ipcRenderer.invoke('config', config)
  }

  function changeConstantVelocity(e: Event & { currentTarget: HTMLInputElement }) {
    const config = {
      CONSTANT_VELOCITY: e.currentTarget.checked
    }

    window.ipcRenderer.invoke('config', config)
  }

  function changeLEDInvert(e: Event & { currentTarget: HTMLInputElement }) {
    const config = {
      LED_INVERT: e.currentTarget.checked
    }

    window.ipcRenderer.invoke('config', config)
  }

  function changeLEDStartCount(e: Event & { currentTarget: HTMLInputElement }) {
    const config = {
      LED_START_COUNT: parseInt(e.currentTarget.value)
    }

    window.ipcRenderer.invoke('config', config)
  }

  function changeLEDEndCount(e: Event & { currentTarget: HTMLInputElement }) {
    const config = {
      LED_END_COUNT: parseInt(e.currentTarget.value)
    }

    window.ipcRenderer.invoke('config', config)
  }

  onMount(() => {
    // noop
  })

  onDestroy(() => {
    // noop
  })
</script>

<div class="App p-8">
  <h1>Settings</h1>
  <h2>Color</h2>
  <input type="color" on:input={changeColor} />

  <div class="divider"></div>

  <h2>LED Brightness</h2>
  <input type="range" min="0" max="100" on:input={changeBrightness} class="range" />

  <h2>Background Brightness</h2>
  <input type="range" min="0" max="100" on:input={changeBackgroundBrightness} class="range" />

  <div class="form-control">
    <label class="label cursor-pointer">
      <span class="label-text">Constant Velocity</span>
      <input type="checkbox" checked={true} class="checkbox" on:change={changeConstantVelocity} />
    </label>
  </div>
  <div class="form-control">
    <label class="label cursor-pointer">
      <span class="label-text">LED Invert</span>
      <input type="checkbox" checked={true} class="checkbox" on:change={changeLEDInvert} />
    </label>
  </div>

  <div class="divider">Start End</div>

  <h2>LED Start/End Count</h2>
  <input type="number" min="0" max="177" value="0" on:input={changeLEDStartCount} />
  <input type="number" min="0" max="177" value="177" on:input={changeLEDEndCount} />
</div>

<style>
  .App {
    display: flex;
    flex-direction: column;
  }
</style>
