import { BrowserWindow } from 'electron'

export function execJsOnClient(func, ...args) {
  const mainWindow = BrowserWindow.getAllWindows()[0]
  if (!mainWindow) {
    throw new Error('No main window found')
  }

  return mainWindow.webContents.executeJavaScript(
    `(${func})(${args.map((arg) => JSON.stringify(arg)).join(',')})`,
    true
  )
}
