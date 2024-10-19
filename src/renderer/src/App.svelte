<script lang="ts">
  import Bluetooth from './components/Bluetooth.svelte'
  import LedVisualizer from './components/LedVisualizer.svelte'

  let sidebarToggled = false
  let activeTab: 'bluetooth' | 'led-visualizer' | 'settings' = 'bluetooth'
  const settingsButtonAnim =
    'hover:bg-transparent w-9 p-0 fill-neutral-content hover:fill-primary hover:active:rotate-180 hover:rotate-180 duration-500 ease-in-out hover:active:scale-75'

  // import LedVisualizer from './components/LedVisualizer.svelte'
  import WindowControls from './components/WindowControls.svelte'
  import Piano from './svg/Piano.svelte'
  import Settings from './svg/Settings.svelte'
</script>

<div class="App flex w-full h-full">
  <div class="drawer">
    <input id="app-drawer" type="checkbox" class="drawer-toggle" bind:checked={sidebarToggled} />
    <div class="drawer-content flex flex-col">
      <div class="navbar bg-base-300 w-full h-11 min-h-0 p-0 flex" class:app-drag={!sidebarToggled}>
        <div class="flex-none sm:hidden">
          <label for="app-drawer" aria-label="open sidebar" class="btn btn-square btn-ghost">
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
            <Piano />
          </div>
          <h1>RGB Piano</h1>
        </div>
        <div class="hidden sm:flex h-full flex-1 justify-center">
          <button
            class="btn btn-sm btn-ghost h-5/6"
            class:text-primary={activeTab === 'bluetooth'}
            class:hover:bg-transparent={activeTab === 'bluetooth'}
            on:click={() => (activeTab = 'bluetooth')}>Bluetooth</button
          >
          <button
            class="btn btn-sm btn-ghost h-5/6"
            class:text-primary={activeTab === 'led-visualizer'}
            class:hover:bg-transparent={activeTab === 'led-visualizer'}
            on:click={() => (activeTab = 'led-visualizer')}>LED Visualizer</button
          >
        </div>
        <div class="ml-auto justify-self-end">
          <button
            class="btn btn-sm btn-ghost h-full sm:ml-2 sm:mr-3 {settingsButtonAnim}"
            class:fill-primary={activeTab === 'settings'}
            on:click={() => (activeTab = 'settings')}><Settings /></button
          >
          <WindowControls />
        </div>
      </div>

      <!-- Page content here -->
      {#if activeTab === 'bluetooth'}
        <div class="flex-1 flex items-center justify-center">
          <Bluetooth />
        </div>
      {:else if activeTab === 'led-visualizer'}
        <LedVisualizer />
      {:else}
        <div class="flex-1 flex items-center justify-center">
          <Settings />
        </div>
      {/if}
    </div>

    <div class="drawer-side">
      <label for="app-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
      <ul class="menu bg-base-200 min-h-full w-80 p-4 max-w-full">
        <button class="btn m-2">ghost</button>
        <button class="btn m-2">Neutral</button>
      </ul>
    </div>
  </div>
</div>
