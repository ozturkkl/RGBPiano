import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { Main } from './src/Main'
import {
  ConfigType,
  initSavedConfig,
  onConfigUpdated,
  saveConfigToFile,
  updateConfig
} from './util/config'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: false,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.webContents.openDevTools()

  mainWindow.on('ready-to-show', () => {
    // mainWindow.minimize()
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  const pairedDevicesMap = new Map<string, string>()
  // let selectDeviceCallback: ((deviceId: string) => void) | null = null
  mainWindow.webContents.on('select-bluetooth-device', (event, deviceList) => {
    event.preventDefault()
    // selectDeviceCallback = callback
    console.log('Bluetooth devices:', deviceList)
    mainWindow.webContents.send('bluetooth-device-list', deviceList)
  })

  ipcMain.on('bluetooth-connect', (_ev, data) => {
    console.log('Bluetooth connected:', data)
    pairedDevicesMap.set(data.id, 'Unknown Device')
  })
  ipcMain.on('bluetooth-disconnect', (_ev, data) => {
    console.log('Bluetooth disconnected:', data)
    pairedDevicesMap.delete(data.id)
  })
  ipcMain.on('bluetooth-data', (_ev, data) => {
    console.log('Received Bluetooth data in main process:', data)
    // Process or handle the data here as needed
  })
  // Listen for a message from the renderer to get the response for the Bluetooth pairing.
  ipcMain.on('bluetooth-pairing-response', (_ev, response) => {
    console.log('Bluetooth pairing response:', response)
  })
  mainWindow.webContents.session.setBluetoothPairingHandler((details) => {
    console.log('Bluetooth pairing details:', details)
  })

  // mainWindow.webContents.on('did-finish-load', () => {
  //   mainWindow.webContents.executeJavaScript(
  //     `
  //     document.getElementById('bluetoothButton').click();
  //   `,
  //     true
  //   )
  // })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()
  main()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

async function main(): Promise<void> {
  const savedConfig = initSavedConfig()
  const { connection } = await Main(true)

  // if config was saved, send it to the websocket listeners
  if (savedConfig) {
    connection.send({
      type: 'config',
      data: savedConfig
    })
  }
  // if config is updated, save it to the file
  onConfigUpdated(() => {
    saveConfigToFile()
  })

  // if new config is received from the UI, update the saved config
  ipcMain.handle('config', (_, config: ConfigType) => {
    console.log('Received config: ', config)
    connection.send({
      type: 'config',
      data: config
    })

    updateConfig(config)
  })
}
