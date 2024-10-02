import { BrowserWindow } from 'electron'
import { execJsOnClient } from '../util/execJsOnClient'

export class BluetoothManager {
  static singleton: BluetoothManager

  readonly midiServiceUUID = '03b80e5a-ede8-4b33-a751-6ce34ec4c700'
  readonly midiCharacteristicUUID = '7772e5db-3868-4112-a1a9-f2669d106bf3'

  private midiDevices: Map<string, string> = new Map()
  private mainWindow!: BrowserWindow

  get devices() {
    return this.midiDevices
  }

  constructor() {
    if (BluetoothManager.singleton) {
      return BluetoothManager.singleton
    }
    BluetoothManager.singleton = this

    this.mainWindow = BrowserWindow.getAllWindows()[0]
    if (!this.mainWindow) {
      throw new Error('No main window found')
    }

    this.enumerateMidiDevices()
  }

  // private async connectToDevice(deviceId?: string) {
  //   if (this.midiDevices.size === 0) {
  //     throw new Error('No MIDI devices found')
  //   }
  //   if (!deviceId) {
  //     deviceId = this.midiDevices.keys().next().value
  //   }
  //   const device = await window.navigator.bluetooth.requestDevice({
  //     filters: [{ services: [this.midiServiceUUID] }],
  //     optionalServices: [this.midiServiceUUID]
  //   })
  // }

  private enumerateMidiDevices() {
    console.log('Enumerating MIDI devices...')
    setInterval(() => {
      execJsOnClient(() => {
        window.navigator.bluetooth.requestDevice({
          filters: [{ services: ['${this.midiServiceUUID}'] }]
        })
      })
    }, 20000)

    this.mainWindow.webContents.on('select-bluetooth-device', (event, deviceList) => {
      event.preventDefault()
      for (const device of deviceList) {
        this.midiDevices.set(device.deviceId, device.deviceName)
      }
    })
  }

  async init() {
    try {
      // window.electron.ipcRenderer.on('bluetooth-device-list', (event, data) => {
      //   console.log('Bluetooth devices:', data)
      // })
      // const device = await navigator.bluetooth.requestDevice({
      //   filters: [{ services: ['03b80e5a-ede8-4b33-a751-6ce34ec4c700'] }]
      // })
      // const server = await device.gatt.connect()
      // console.log('Connected to GATT Server:', server)
      // const service = await server.getPrimaryService('03b80e5a-ede8-4b33-a751-6ce34ec4c700')
      // const characteristic = await service.getCharacteristic('7772e5db-3868-4112-a1a9-f2669d106bf3')
      // const deviceID = device.id
      // const deviceName = device.name
      // await characteristic.startNotifications()
      // characteristic.addEventListener('characteristicvaluechanged', (event) => {
      //   const value = event.target.value
      //   const data = new Uint8Array(value.buffer)
      //   window.electron.ipcRenderer.send('bluetooth-data', {
      //     id: deviceID,
      //     data
      //   })
      // })
      // window.electron.ipcRenderer.send('bluetooth-connect', {
      //   id: deviceID,
      //   name: deviceName
      // })
      // // send event back on disconnect
      // device.addEventListener('gattserverdisconnected', () => {
      //   window.electron.ipcRenderer.send('bluetooth-disconnect', {
      //     id: deviceID
      //   })
      // })
    } catch (error) {
      // if (error.name === 'NotFoundError') return
      console.error('Error connecting to Bluetooth device:', error)
    } finally {
      console.log('Bluetooth connection attempt complete')
    }
  }
}
