import { contextBridge, ipcRenderer } from 'electron'

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  // Expose a method to the renderer process
  contextBridge.exposeInMainWorld('ipcRenderer', {
    on: (channel: string, func: (...args: unknown[]) => void) => {
      ipcRenderer.on(channel, (_e, ...args) => func(...args))
    },
    invoke: ipcRenderer.invoke,
    off: ipcRenderer.off,
  })
} else {
  // Add to the DOM global
  window.ipcRenderer = {
    on: (channel: string, func: (...args: unknown[]) => void) => {
      ipcRenderer.on(channel, (_e, ...args) => func(...args))
    },
    invoke: ipcRenderer.invoke,
    off: ipcRenderer.off,
  }
}
