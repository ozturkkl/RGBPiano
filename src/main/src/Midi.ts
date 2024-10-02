import { INPUT_DEVICE_REFRESH_INTERVAL } from '../util/config'
import JZZ from 'jzz'

export class Midi {
  static inputs: string[] = []
  static outputs: string[] = []

  private static _jzz: WebMidi.MIDIAccess
  private static _initialized = false

  static async init() {
    if (this._initialized) return
    if (this._jzz === undefined) this._jzz = await JZZ.requestMIDIAccess()

    this._jzz.onstatechange = () => {
      this.populateDevices()
    }
    await this.populateDevices()
    this._initialized = true
  }
  private static async populateDevices() {
    const inputDevices = Array.from(this._jzz.inputs.values()).map((i) => i.name)
    const outputDevices = Array.from(this._jzz.outputs.values()).map((o) => o.name)

    this.inputs = inputDevices
    this.outputs = outputDevices
  }

  private _deviceName: string
  private _inputActive = false
  private _onMessage: ((payload: number[]) => void) | undefined

  get deviceName() {
    return this._deviceName
  }
  get online() {
    return this._inputActive
  }

  constructor(deviceName: string, onMessage?: (payload: number[]) => void) {
    if (!Midi._initialized) {
      throw new Error('Midi not initialized, call Midi.init() first')
    }

    this._deviceName = deviceName
    this._onMessage = onMessage

    if (this._deviceName === undefined) {
      throw new Error('No midi device name provided when creating midi input/output!')
    }

    if (this._onMessage) {
      setInterval(() => {
        this.listenToInputIfNeeded()
      }, 1000)
    }
  }
  private listenToInputIfNeeded(): void {
    if (this._inputActive) return

    const selectedDevice = Midi._jzz.inputs.get(this._deviceName)
    if (!selectedDevice) return

    this._inputActive = true

    let inputDeviceRefreshTimeout: NodeJS.Timeout
    const ito = () => {
      if (inputDeviceRefreshTimeout) clearTimeout(inputDeviceRefreshTimeout)
      inputDeviceRefreshTimeout = setTimeout(() => {
        this._inputActive = false
      }, INPUT_DEVICE_REFRESH_INTERVAL)
    }

    ito()

    selectedDevice.onmidimessage = (msg) => {
      ito()
      this._onMessage(Array.from(msg.data))
    }
  }

  sendMessage(message: number[]): void {
    const output = Midi._jzz.outputs.get(this._deviceName)
    if (!output) {
      console.error(`Could not find output device with name ${this._deviceName}`)
      return
    }

    output.send(message)
  }
}
