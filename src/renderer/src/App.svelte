<script lang="ts">
  import Bluetooth from './components/Bluetooth.svelte'
  import LedVisualizer from './components/LedVisualizer.svelte'
  import Settings from './components/Settings.svelte'
  import WindowControls from './components/WindowControls.svelte'
  import SvgPiano from './svg/SvgPiano.svelte'
  import SvgSettings from './svg/SvgSettings.svelte'
  import { Store } from './util/store'

  let sidebarToggled = false
  type ActiveTab = 'bluetooth' | 'led-visualizer' | 'settings'
  const activeTab = Store.getPersistent<ActiveTab>('activeTab', 'led-visualizer', (v) => v !== 'settings')

  const settingsButtonAnim =
    'hover:fill-primary hover:active:rotate-180 hover:rotate-180 duration-500 ease-in-out hover:active:scale-75'
</script>

<div class="App drawer">
  <input id="app-drawer" type="checkbox" class="drawer-toggle" bind:checked={sidebarToggled} />
  <div class="drawer-content flex flex-col">
    <div class="navbar bg-base-300 w-screen h-11 min-h-11 p-0 flex z-10" class:app-drag={!sidebarToggled}>
      <div class="flex-none sm:hidden">
        <label for="app-drawer" aria-label="open sidebar" class="btn btn-square rounded-none btn-ghost">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            class="inline-block h-6 w-6 stroke-current"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </label>
      </div>
      <div class="mx-2 px-2 justify-self-start">
        <div class="flex w-14 mr-5">
          <SvgPiano />
        </div>
        <h1>RGB Piano</h1>
      </div>
      <div class="hidden sm:flex h-full flex-1 justify-center">
        <button
          class="btn btn-sm btn-ghost h-5/6"
          class:text-primary={$activeTab === 'bluetooth'}
          class:hover:bg-transparent={$activeTab === 'bluetooth'}
          on:click={() => ($activeTab = 'bluetooth')}>Bluetooth</button
        >
        <button
          class="btn btn-sm btn-ghost h-5/6"
          class:text-primary={$activeTab === 'led-visualizer'}
          class:hover:bg-transparent={$activeTab === 'led-visualizer'}
          on:click={() => ($activeTab = 'led-visualizer')}>LED Visualizer</button
        >
      </div>
      <div class="ml-auto justify-self-end">
        <button
          class="btn btn-sm btn-ghost h-full hover:bg-transparent w-9 p-0 fill-neutral-content sm:ml-2 sm:mr-3 {settingsButtonAnim}"
          class:fill-primary={$activeTab === 'settings'}
          on:click={() => ($activeTab = 'settings')}><SvgSettings /></button
        >
        <WindowControls />
      </div>
    </div>

    <div class="absolute w-screen h-screen max-h-screen pt-11 overflow-hidden *:overflow-auto *:h-full">
      <!-- Page content here -->
      {#if $activeTab === 'bluetooth'}
        <Bluetooth />
      {:else if $activeTab === 'led-visualizer'}
        <LedVisualizer />
      {:else}
        <Settings />
      {/if}
    </div>
  </div>

  <div class="drawer-side">
    <label for="app-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
    <ul class="menu bg-base-200 h-screen pt-14 p-4 max-w-screen">
      <button
        class="btn btn-sm btn-ghost"
        class:text-primary={$activeTab === 'bluetooth'}
        class:hover:bg-transparent={$activeTab === 'bluetooth'}
        on:click={() => (($activeTab = 'bluetooth'), (sidebarToggled = false))}>Bluetooth</button
      >
      <button
        class="btn btn-sm btn-ghost"
        class:text-primary={$activeTab === 'led-visualizer'}
        class:hover:bg-transparent={$activeTab === 'led-visualizer'}
        on:click={() => (($activeTab = 'led-visualizer'), (sidebarToggled = false))}>LED Visualizer</button
      >
    </ul>
  </div>
</div>
