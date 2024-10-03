import { BrowserWindow, ipcMain } from 'electron'
import { execJsOnClient } from '../util/execJsOnClient'

type MidiDevice = {
  name: string
  status: 'connected' | 'ready' | 'disconnected'
}

export class BluetoothManager {
  readonly midiServiceUUID = '03b80e5a-ede8-4b33-a751-6ce34ec4c700'
  readonly midiCharacteristicUUID = '7772e5db-3868-4112-a1a9-f2669d106bf3'
  readonly bleConnectRetryCount = 10

  private midiDevices: Map<string, MidiDevice> = new Map()
  private mainWindow!: BrowserWindow

  get devices() {
    return this.midiDevices
  }

  onMidiDeviceListUpdated: (devices: Map<string, MidiDevice>) => void = () => {}

  constructor() {
    this.mainWindow = BrowserWindow.getAllWindows()[0]
    if (!this.mainWindow) {
      throw new Error('No main window found')
    }

    this.enumerateMidiDevices()
  }

  async connectDevice(deviceId: string, onMessage: (data: Uint8Array) => void) {
    console.log(`Connecting to device ${deviceId}...`)

    const connectHandlerFunc: (
      event: Electron.Event,
      devices: Electron.BluetoothDevice[],
      callback: (deviceId: string) => void
    ) => void = (event, deviceList, callback) => {
      console.log(`Selecting device ${deviceId}... Device list: `, deviceList)
      event.preventDefault()
      const device = deviceList.find((d) => d.deviceId === deviceId)
      if (device) {
        callback(device.deviceId)
        this.mainWindow.webContents.off('select-bluetooth-device', connectHandlerFunc)
      }
    }

    try {
      this.mainWindow.webContents.on('select-bluetooth-device', connectHandlerFunc)

      await execJsOnClient(async (deviceId) => {
        const device = await window.navigator.bluetooth.requestDevice({
          filters: [{ services: ['03b80e5a-ede8-4b33-a751-6ce34ec4c700'] }]
        })

        const server = await device.gatt.connect()
        const service = await server.getPrimaryService('03b80e5a-ede8-4b33-a751-6ce34ec4c700')
        const characteristic = await service.getCharacteristic(
          '7772e5db-3868-4112-a1a9-f2669d106bf3'
        )
        await characteristic.startNotifications()

        window.electron.ipcRenderer.send('ble-midi-connected', deviceId)
        device.addEventListener('gattserverdisconnected', () => {
          window.electron.ipcRenderer.send('ble-midi-disconnected', deviceId)
        })
        characteristic.addEventListener('characteristicvaluechanged', (event) => {
          const value = event.target.value
          const data = new Uint8Array(value.buffer)
          console.log('Received data: ', data, 'from device: ', deviceId)
          window.electron.ipcRenderer.send('ble-midi-data', {
            deviceId,
            data
          })
        })
      }, deviceId)

      ipcMain.on('ble-midi-connected', (_, deviceId) => {
        if (deviceId !== deviceId) return
        console.log(`Connected to device ${deviceId}`)
        this.midiDevices.set(deviceId, {
          name: this.midiDevices.get(deviceId)?.name || 'Unknown device',
          status: 'connected'
        })
      })
      ipcMain.on('ble-midi-disconnected', (_, deviceId) => {
        if (deviceId !== deviceId) return
        console.log(`Disconnected from device ${deviceId}`)
        this.midiDevices.set(deviceId, {
          name: this.midiDevices.get(deviceId)?.name || 'Unknown device',
          status: 'disconnected'
        })
      })
      ipcMain.on('ble-midi-data', (_, { deviceId, data }) => {
        console.log(`Received data from device ${deviceId}: `, data)
        if (deviceId !== deviceId) return
        // onMessage(data)
      })
    } catch (error) {
      console.error('Error connecting to device: ', error)
    } finally {
      this.mainWindow.webContents.off('select-bluetooth-device', connectHandlerFunc)
    }
  }

  private enumerateMidiDevices() {
    console.log('Enumerating Ble MIDI devices...')
    const requestDeviceClient = () => {
      execJsOnClient(() => {
        window.navigator.bluetooth
          .requestDevice({
            filters: [{ services: ['03b80e5a-ede8-4b33-a751-6ce34ec4c700'] }]
          })
          .catch(() => {})
      })
    }
    setInterval(requestDeviceClient, 20000)
    requestDeviceClient()

    this.mainWindow.webContents.on('select-bluetooth-device', (event, deviceList) => {
      event.preventDefault()

      const prevMidiDevices = new Map(JSON.parse(JSON.stringify(Array.from(this.midiDevices))))

      for (const device of this.midiDevices) {
        const deviceIsConnected = device[1].status === 'connected'
        this.midiDevices.set(device[0], {
          ...device[1],
          // status: deviceIsConnected ? 'connected' : 'disconnected'
          status: 'disconnected'
        })
      }
      for (const device of deviceList) {
        const deviceIsConnected = this.midiDevices.get(device.deviceId)?.status === 'connected'
        this.midiDevices.set(device.deviceId, {
          name: device.deviceName,
          // status: deviceIsConnected ? 'connected' : 'ready'
          status: 'ready'
        })
      }

      const diffHappened =
        JSON.stringify(Array.from(this.midiDevices)) !== JSON.stringify(Array.from(prevMidiDevices))
      if (diffHappened) {
        this.onMidiDeviceListUpdated(this.midiDevices)
      }
    })
  }
}
