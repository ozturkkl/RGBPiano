import { contextBridge, ipcRenderer } from 'electron'

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  // Expose a method to the renderer process
  contextBridge.exposeInMainWorld('ipcRenderer', {
    send: ipcRenderer.send,
    on: ipcRenderer.on,
    invoke: ipcRenderer.invoke
  })
} else {
  // Add to the DOM global
  window.ipcRenderer = {
    send: ipcRenderer.send,
    on: ipcRenderer.on,
    invoke: ipcRenderer.invoke
  }
}
