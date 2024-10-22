import JZZ from 'jzz'
import { MIDI_INPUT_DEVICE_IDLE_REFRESH_INTERVAL } from '../util/consts'

export class Midi {
  private static _inputs: string[] = []
  private static _outputs: string[] = []
  private static _jzz: WebMidi.MIDIAccess
  private static _initialized = false
  private static onStateChangedListeners: (() => void)[] = []

  private _deviceName: string
  private _inputActive = false
  private _onMessage: ((payload: number[]) => void) | undefined

  get deviceName() {
    return this._deviceName
  }
  get online() {
    return this._inputActive
  }
  static get inputs() {
    return this._inputs
  }
  static get outputs() {
    return this._outputs
  }

  static async init() {
    if (this._initialized) return
    if (this._jzz === undefined) this._jzz = await JZZ.requestMIDIAccess()

    this._jzz.onstatechange = () => {
      this.populateDevices()
      this.onStateChangedListeners.forEach((cb) => cb())
    }
    await this.populateDevices()
    this._initialized = true
  }

  static onStateChanged(callback: () => void) {
    this.onStateChangedListeners.push(callback)
  }

  constructor(deviceName: string) {
    if (!Midi._initialized) {
      throw new Error('Midi not initialized, call Midi.init() first')
    }

    this._deviceName = deviceName

    if (this._deviceName === undefined) {
      throw new Error('No midi device name provided when creating midi input/output!')
    }

    setInterval(() => {
      this.listenToInputIfNeeded()
    }, 1000)
  }

  sendMessage(message: number[]): void {
    const output = Midi._jzz.outputs.get(this._deviceName)
    if (!output) {
      console.error(`Could not find output device with name ${this._deviceName}`)
      return
    }

    try {
      output.send(message)
    } catch (e) {
      console.error(e)
    }
  }

  onMessage(callback?: (payload: number[]) => void) {
    this._onMessage = callback
  }

  private listenToInputIfNeeded(): void {
    if (this._inputActive || !this._deviceName || !this._onMessage) return

    const selectedDevice = Midi._jzz.inputs.get(this._deviceName)
    if (!selectedDevice) return

    this._inputActive = true

    let inputDeviceRefreshTimeout: NodeJS.Timeout
    const ito = () => {
      if (inputDeviceRefreshTimeout) clearTimeout(inputDeviceRefreshTimeout)
      inputDeviceRefreshTimeout = setTimeout(() => {
        this._inputActive = false
      }, MIDI_INPUT_DEVICE_IDLE_REFRESH_INTERVAL)
    }

    ito()

    selectedDevice.onmidimessage = (msg) => {
      ito()
      this._onMessage?.(Array.from(msg.data))
    }
  }

  private static async populateDevices() {
    this._inputs = Array.from(this._jzz.inputs.values()).map((i) => i.name ?? 'Unknown')
    this._outputs = Array.from(this._jzz.outputs.values()).map((o) => o.name ?? 'Unknown')
  }
}
