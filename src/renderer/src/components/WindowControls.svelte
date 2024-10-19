<script lang="ts">
  let isMaximized = false

  function minimize() {
    window.ipcRenderer.invoke('window:minimize', undefined)
  }

  function maximize() {
    window.ipcRenderer.invoke('window:maximize', undefined)
  }

  function unmaximize() {
    window.ipcRenderer.invoke('window:unmaximize', undefined)
  }

  function close() {
    window.ipcRenderer.invoke('window:close', undefined)
  }

  window.ipcRenderer.on('window:maximized', () => {
    isMaximized = true
  })

  window.ipcRenderer.on('window:unmaximized', () => {
    isMaximized = false
  })

  window.ipcRenderer.on('window:closed', () => {
    window.close()
  })
</script>

<div class="window-controls flex flex-end h-full pb-1 sm:border-l-2 border-neutral/70">
  <button class="btn rounded-none btn-m btn-ghost w-11 h-full" on:click={minimize}>🗕</button>
  <button class="btn rounded-none btn-m btn-ghost w-11 h-full" on:click={isMaximized ? unmaximize : maximize}>
    {isMaximized ? '🗖' : '🗗'}</button
  >
  <button class="btn rounded-none btn-m btn-ghost w-11 h-full hover:bg-orange-600/40" on:click={close}>🗙</button>
</div>
