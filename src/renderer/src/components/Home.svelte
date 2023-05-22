<script lang="ts">
  import { onMount } from 'svelte'

  async function buttonClick() {
    const config = { BRIGHTNESS: Math.random() }

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
