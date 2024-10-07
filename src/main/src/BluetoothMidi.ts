import { BrowserWindow, ipcMain } from 'electron'
import { execJsOnClient } from '../util/execJsOnClient'

type MidiDevice = {
  name: string
}

export class BluetoothMidi {
  // STATIC MEMBERS
  private static midiDevices: Map<string, MidiDevice> = new Map()
  private static webContents: Electron.WebContents
  private static initialized = false
  private static deviceListUpdateSubscribers: ((devices: Map<string, MidiDevice>) => void)[] = []
  private static connectionInProgress = false

  private static deviceMap = new Map<string, BluetoothMidi>()

  private static init() {
    if (BluetoothMidi.initialized) return

    this.webContents = BrowserWindow.getAllWindows()[0].webContents
    if (!this.webContents) {
      throw new Error('No main window web contents found')
    }

    ipcMain.on('ble-midi-connected', (_, deviceId) => {
      const device = BluetoothMidi.getDevice(deviceId)
      device.connected = true
      console.log('Connected to device: ', deviceId)
    })
    ipcMain.on('ble-midi-disconnected', (_, deviceId) => {
      const device = BluetoothMidi.getDevice(deviceId)
      device.connected = false
      console.log('Disconnected from device: ', deviceId)
    })
    ipcMain.on('ble-midi-data', (_, { deviceId, data }) => {
      const device = BluetoothMidi.getDevice(deviceId)
      const parsed = BluetoothMidi.parseMIDIData(data)
      parsed.messages.forEach((msg) => {
        device.onMessage?.(msg.data)
      })
    })

    this.startEnumeration()
    BluetoothMidi.initialized = true
  }

  private static parseMIDIData(dataArray: Uint8Array) {
    // COMMON MIDI VALUES
    // 128 - 143: Note Off
    // 144 - 159: Note On
    // 160 - 175: Polyphonic Aftertouch
    // 176 - 191: CC
    // 192 - 207: Program Change
    // 208 - 223: Channel Aftertouch
    // 224 - 239: Pitch Bend

    // COMMON CC VALUES
    // 0: Bank Select
    // 1: Modulation Wheel
    // 2: Breath Controller
    // 7: Volume
    // 10: Pan
    // 11: Expression Controller
    // 64: Sustain
    // 65: Portamento
    // 66: Sostenuto
    // 67: Soft Pedal
    // 120: All Sound Off
    // 121: Reset All Controllers
    // 123: All Notes Off

    const MST = dataArray[0] // most significant time byte

    let errorParsing = false

    type MidiMessage = {
      time: number
      data: number[]
    }
    const messages: MidiMessage[] = []

    for (let i = 1; i < dataArray.length; i++) {
      const message: MidiMessage = {
        time: 0,
        data: []
      }

      const LST = dataArray[i] // least significant time byte
      message.time = (MST << 8) + LST

      const status = dataArray[i + 1]
      if (status < 128 || status > 239) {
        errorParsing = true
        break
      }

      if (status >= 128 && status <= 143) {
        // Note Off
        message.data = [status, dataArray[i + 2], dataArray[i + 3]]

        // sometimes the note off message is sent twice, check for that condition
        if (dataArray[i + 4] < 128 && dataArray[i + 5] < 128) {
          // next two bytes are not a valid status or time byte, they are likely a combined note off message
          message.data = [status, dataArray[i + 4], dataArray[i + 5]]
          i += 2
        }
        i += 3
      } else if (status >= 144 && status <= 159) {
        // Note On
        message.data = [status, dataArray[i + 2], dataArray[i + 3]]
        i += 3
      } else if (status >= 160 && status <= 175) {
        // Polyphonic Aftertouch
        message.data = [status, dataArray[i + 2], dataArray[i + 3]]
        i += 3
      } else if (status >= 176 && status <= 191) {
        // CC
        message.data = [status, dataArray[i + 2], dataArray[i + 3]]
        i += 3
      } else if (status >= 192 && status <= 207) {
        // Program Change
        message.data = [status, dataArray[i + 2]]
        i += 2
      } else if (status >= 208 && status <= 223) {
        // Channel Aftertouch
        message.data = [status, dataArray[i + 2]]
        i += 2
      } else if (status >= 224 && status <= 239) {
        // Pitch Bend
        message.data = [status, dataArray[i + 2], dataArray[i + 3]]

        // sometimes the pitch bend message is sent twice, check for that condition
        if (dataArray[i + 4] < 128 && dataArray[i + 5] < 128) {
          // next two bytes are not a valid status or time byte, they are likely a combined pitch bend message
          message.data = [status, dataArray[i + 4], dataArray[i + 5]]
          i += 2
        }
        i += 3
      }

      messages.push(message)
    }

    if (errorParsing) {
      console.error('Error parsing MIDI data: ', dataArray)
    }

    return {
      messages,
      errorParsing
    }
  }

  private static startEnumeration() {
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

    this.webContents.on('select-bluetooth-device', (event, deviceList) => {
      event.preventDefault()

      const prevMidiDevices = new Map(JSON.parse(JSON.stringify(Array.from(this.midiDevices))))

      for (const device of deviceList) {
        this.midiDevices.set(device.deviceId, {
          name: device.deviceName
        })
      }

      const diffHappened =
        JSON.stringify(Array.from(this.midiDevices)) !== JSON.stringify(Array.from(prevMidiDevices))
      if (diffHappened) {
        this.deviceListUpdateSubscribers.forEach((handler) => handler(this.midiDevices))
      }
    })
  }

  static get devices() {
    BluetoothMidi.init()
    return this.midiDevices
  }
  static set onMidiDeviceListUpdated(handler: (devices: Map<string, MidiDevice>) => void) {
    BluetoothMidi.init()
    this.deviceListUpdateSubscribers.push(handler)
  }

  static getDevice(deviceId: string, onMessage?: (data: number[]) => void, connect = false) {
    let device = BluetoothMidi.deviceMap.get(deviceId)
    if (!device) {
      device = new BluetoothMidi(deviceId)
      BluetoothMidi.deviceMap.set(deviceId, device)
    }

    if (onMessage) {
      device.onMessage = onMessage
    }
    if (connect) device.connect()

    return device
  }

  // INSTANCE MEMBERS
  onMessage?: (data: number[]) => void
  private deviceId: string
  private connected = false

  private constructor(deviceId: string) {
    BluetoothMidi.init()
    this.deviceId = deviceId
  }

  async connect() {
    if (
      !BluetoothMidi.devices.has(this.deviceId) ||
      this.connected ||
      BluetoothMidi.connectionInProgress
    )
      return
    BluetoothMidi.connectionInProgress = true

    console.log('Connecting to device: ', this.deviceId)
    const connectHandlerFunc: (
      event: Electron.Event,
      devices: Electron.BluetoothDevice[],
      callback: (deviceId: string) => void
    ) => void = (event, deviceList, callback) => {
      event.preventDefault()
      const device = deviceList.find((d) => d.deviceId === this.deviceId)
      if (device) {
        console.log(`Connecting bluetooth midi device: ${this.deviceId}...`)
        callback(device.deviceId)
        BluetoothMidi.webContents.off('select-bluetooth-device', connectHandlerFunc)
      }
    }

    try {
      BluetoothMidi.webContents.on('select-bluetooth-device', connectHandlerFunc)

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
          const data = new Uint8Array(event.target.value.buffer)
          window.electron.ipcRenderer.send('ble-midi-data', {
            deviceId,
            data
          })
        })
      }, this.deviceId)
    } catch (error) {
      console.error('Error connecting to device: ', this.deviceId, error)
    } finally {
      BluetoothMidi.webContents.off('select-bluetooth-device', connectHandlerFunc)
      BluetoothMidi.connectionInProgress = false
    }
  }
}
