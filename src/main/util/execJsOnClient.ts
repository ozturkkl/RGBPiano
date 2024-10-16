import { BrowserWindow } from 'electron'

export function execJsOnClient(
  func: (...args: unknown[]) => Promise<unknown | void> | unknown | void,
  ...args: unknown[]
) {
  const mainWindow = BrowserWindow.getAllWindows()[0]
  if (!mainWindow) {
    throw new Error('No main window found')
  }

  return mainWindow.webContents.executeJavaScript(
    `(${func})(${args.map((arg) => JSON.stringify(arg)).join(',')})`,
    true
  )
}
