<script lang="ts">
  import { onMount } from 'svelte'
  import type { Config } from '../../../main/types/config'

  async function buttonClick() {
    const color = [
      Math.floor(Math.random() * 255),
      Math.floor(Math.random() * 255),
      Math.floor(Math.random() * 255)
    ]
    const bgColor = [
      Math.floor(color[0] * 0.2),
      Math.floor(color[1] * 0.2),
      Math.floor(color[2] * 0.2)
    ]
    const config: Partial<Config> = {
      BRIGHTNESS: 1,
      BACKGROUND_COLOR: bgColor,
      COLOR: color
    }

    await window.electron.ipcRenderer.invoke('config', config)
  }

  onMount(() => {
    console.log('Home mounted')
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
