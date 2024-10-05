import { WebsocketMessage, WebsocketP2P } from './WebsocketP2P'
import {
  ConfigType,
  getConfig,
  getSavedConfig,
  onConfigUpdated,
  saveConfigToFile,
  updateConfig
} from '../util/config'
import { RgbStrip } from './RbgStrip'
import { Midi } from './Midi'

export async function Main(ipcMain?: Electron.IpcMain) {
  const connection = new WebsocketP2P()
  await connection.connect()

  const config = getSavedConfig()
  onConfigUpdated(() => {
    saveConfigToFile()
  })

  // IF ELECTRON
  if (ipcMain) {
    try {
      // SETUP MIDI
      await Midi.init()
      console.log('Midi initialized')
      console.log(`Midi inputs:\n  ${Midi.inputs.join('\n  ')}`)
      console.log(`Midi outputs:\n  ${Midi.outputs.join('\n  ')}`)
      new Midi(getConfig().SELECTED_DEVICE, (msg) => {
        connection.send({
          type: 'midi',
          data: msg
        })
      })

      // SETUP CONFIG
      connection.send({
        type: 'config',
        data: config
      })

      ipcMain.handle('config', (_, config: ConfigType) => {
        updateConfig(config)
      })
      onConfigUpdated((config) => {
        connection.send({
          type: 'config',
          data: config
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
      onConfigUpdated(() => {
        connectBleDevices()
      })
      connectBleDevices()
    } catch (e) {
      console.error(e)
    }
  }

  // IF NOT ELECTRON => RASPBERRY PI - LED STRIP
  if (!ipcMain) {
    const rgbStrip = new RgbStrip()

    connection.listen((message: WebsocketMessage) => {
      console.log(message)
      if (message?.type === 'midi') {
        rgbStrip.handleNotePress(message.data)
      }
      if (message?.type === 'config') {
        updateConfig(message.data)
      }
    })
  }
}
