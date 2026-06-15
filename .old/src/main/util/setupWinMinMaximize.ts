export function setupWinMinMaximize(ipcMain: Electron.IpcMain, window: Electron.BrowserWindow) {
  window.on('maximize', () => window.webContents.send('window:maximized'))
  window.on('unmaximize', () => window.webContents.send('window:unmaximized'))

  ipcMain.handle('window:minimize', () => window.minimize())
  ipcMain.handle('window:maximize', () =>
    window.isMaximized() ? window.unmaximize() : window.maximize(),
  )
  ipcMain.handle('window:close', () => window.close())
}
