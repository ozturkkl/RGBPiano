<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import type { Config } from '../../../main/types/config'
  import { HSLToRGB } from '../../../main/util/colors'

  let interval: NodeJS.Timeout | null = null

  async function buttonClick() {
    const hue = Math.round(Math.random() * 360)

    const config: Partial<Config> = {
      BACKGROUND_COLOR: HSLToRGB(hue, 100, 1),
      COLOR: HSLToRGB(hue, 100, 50)
    }

    await window.electron.ipcRenderer.invoke('config', config)
  }

  onMount(() => {
    interval = setInterval(() => {
      // buttonClick()
    }, 200000)
  })

  onDestroy(() => {
    if (interval) {
      clearInterval(interval)
    }
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
