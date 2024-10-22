import { WebsocketMessage, WebsocketP2P } from './WebsocketP2P'
import { getConfig, getSavedConfig, onConfigUpdated, saveConfigToFile, updateConfig } from '../util/config'
import { RgbStrip } from './RbgStrip'
import { Midi } from './Midi'
import { ConfigType } from '../util/consts'

export async function Main(electron?: {
  ipcMain: Electron.IpcMain
  app: Electron.App
  BrowserWindow: typeof Electron.BrowserWindow
}) {
  getSavedConfig(electron?.app)

  onConfigUpdated((c) => saveConfigToFile(electron?.app, c))

  const connection = new WebsocketP2P()
  connection.connect()

  // IF ELECTRON
  if (electron) {
    try {
      // SETUP IPC LISTENERS
      electron.ipcMain.handle('config', (_, config: ConfigType) => updateConfig(config))
      electron.ipcMain.handle('connected', () => connection.isConnected)
      electron.ipcMain.handle('window:minimize', () => electron.BrowserWindow.getFocusedWindow()?.minimize())
      electron.ipcMain.handle('window:maximize', () => {
        const win = electron.BrowserWindow.getFocusedWindow()
        win?.isMaximized() ? win?.unmaximize() : win?.maximize()
      })
      electron.ipcMain.handle('window:close', () => electron?.BrowserWindow?.getFocusedWindow()?.close())

      // SETUP MIDI
      await Midi.init()
      console.log('Midi initialized')
      console.log(`Inputs:\n  ${Midi.inputs.join('\n  ')}`)
      console.log(`Outputs:\n  ${Midi.outputs.join('\n  ')}`)
      electron.ipcMain.handle('midi:get-devices', () => ({ inputs: Midi.inputs, outputs: Midi.outputs }))
      Midi.onStateChanged(() =>
        electron.ipcMain.emit('midi:devices-changed', {
          inputs: Midi.inputs,
          outputs: Midi.outputs,
        }),
      )

      let ledReceiveFrom: Midi | undefined
      onConfigUpdated((config) => {
        if (config.LED_RECEIVE_FROM) {
          ledReceiveFrom?.onMessage(undefined)
          ledReceiveFrom = new Midi(config.LED_RECEIVE_FROM)
          ledReceiveFrom.onMessage((msg) => {
            connection.send({
              type: 'midi',
              data: msg,
            })
          })
        }
      }, true)

      // SETUP CONFIG
      connection.onConnectionEstablished = () => {
        connection.send({
          type: 'config',
          data: getConfig(),
        })
      }
      onConfigUpdated((config) => {
        connection.send({
          type: 'config',
          data: config,
        })
      })

      // SETUP BLE MIDI
      const { BluetoothMidi } = await import('./BluetoothMidi')
      let connectBleDevicesInterval: NodeJS.Timeout
      const connectBleDevices = () => {
        const autoConnectDevices = getConfig().AUTO_CONNECT_BLE_DEVICES
        autoConnectDevices.forEach((device) => {
          const midi = new Midi(device.port)

          BluetoothMidi.getDevice(device.id, (data) => {
            midi.sendMessage(data)
          })
        })

        connectBleDevicesInterval && clearInterval(connectBleDevicesInterval)
        connectBleDevicesInterval = setInterval(() => {
          autoConnectDevices.forEach((device) => {
            BluetoothMidi.getDevice(device.id).connect()
          })
        }, 1000)
      }
      onConfigUpdated((config) => {
        if (config.AUTO_CONNECT_BLE_DEVICES) connectBleDevices()
      })
      connectBleDevices()

      // DEBUG LISTENER
      connection.listen((message: WebsocketMessage) => {
        message.type !== 'ping' && console.log(message)
      })
    } catch (e) {
      console.error(e)
    }
  }

  // IF NOT ELECTRON => RASPBERRY PI - LED STRIP
  if (!electron?.ipcMain) {
    const rgbStrip = new RgbStrip()

    connection.listen((message: WebsocketMessage) => {
      message.type !== 'ping' && console.log(message)
      if (message?.type === 'midi') {
        rgbStrip.handleNotePress(message.data)
      }
      if (message?.type === 'config') {
        updateConfig(message.data)
      }
    })
  }
}
