<script lang="ts">
  import { onMount } from 'svelte'
  import type { Config } from '../../../main/types/config'

  async function buttonClick() {
    const color: [number, number, number] = [
      Math.floor(Math.random() * 255),
      Math.floor(Math.random() * 255),
      Math.floor(Math.random() * 255)
    ]
    const config: Partial<Config> = {
      BRIGHTNESS: 1,
      COLOR: color,
      BACKGROUND_COLOR: [
        Math.round(color[0] * 0.02),
        Math.round(color[1] * 0.02),
        Math.round(color[2] * 0.02)
      ]
    }

    await window.electron.ipcRenderer.invoke('config', config)
  }

  onMount(() => {
    console.log('Home mounted')
    return setInterval(() => {
      // buttonClick()
    }, 500000)
  })
</script>

<div class="Home">
  <button on:click={buttonClick}> Yo this is </button>
</div>

<style>
  .Home {
    display: flex;
  }
</style>
