import midi, { MidiMessage } from 'midi'
import { INPUT_DEVICE_REFRESH_INTERVAL } from '../util/config'

export class MidiDevice {
  static getDevices() {
    // refactor with jzz
    const inputDevices: string[] = []
    const id = new midi.Input()
    for (let i = 0; i < id.getPortCount(); i++) {
      inputDevices.push(id.getPortName(i))
    }
    const outputDevices: string[] = []
    const od = new midi.Output()
    for (let i = 0; i < od.getPortCount(); i++) {
      outputDevices.push(od.getPortName(i))
    }
    return {
      inputDevices,
      outputDevices
    }
  }

  deviceName: string | undefined
  onMessage: ((payload: number[]) => void) | undefined

  private input: midi.Input
  private output: midi.Output
  private outputConnected = false

  constructor(deviceName: string | undefined, onMessage?: (payload: number[]) => void) {
    this.deviceName = deviceName
    this.onMessage = onMessage
    this.input = new midi.Input()
    this.output = new midi.Output()

    if (this.onMessage) {
      if (this.deviceName === undefined) {
        console.error('No midi device name provided for listening virtual midi device')
        return
      }
      this.listenToInput()
      this.connectToInput()
    }
  }

  private connectToInput() {
    const devices = MidiDevice.getDevices().inputDevices
    const portIndex = devices.findIndex(
      (d) => d === this.deviceName || d.includes(this.deviceName!)
    )

    if (portIndex === -1) {
      console.error(`Could not connect to ${this.deviceName}, retrying in 10 seconds`)
      return
    }
    try {
      const d = devices[portIndex]
      this.input.closePort()
      this.input.openPort(portIndex)

      console.log(`Listening to device ${d}`)
    } catch (e) {
      console.error(`Could not connect to device ${this.deviceName}: ${e}`)
    }
  }
  private listenToInput(): void {
    let lastMessageTime = Date.now()

    this.input.on('message', (_deltaTime, message) => {
      lastMessageTime = Date.now()
      this.onMessage?.(message)
    })

    setInterval(() => {
      if (Date.now() - lastMessageTime > INPUT_DEVICE_REFRESH_INTERVAL) {
        this.connectToInput()
        lastMessageTime = Date.now()
      }
    }, 5000)
  }

  sendMessage(message: MidiMessage) {
    if (!this.deviceName) {
      console.error('No midi device name provided for sending virtual midi device message!')
      return
    }
    if (!this.outputConnected) {
      const devices = MidiDevice.getDevices().outputDevices
      const portIndex = devices.findIndex(
        (d) => d === this.deviceName || d.includes(this.deviceName!)
      )

      if (portIndex === -1) {
        console.error(`Could not send message, ${this.deviceName} not found.`)
        return
      }

      this.output.closePort()
      this.output.openPort(portIndex)
      this.outputConnected = true
    }

    try {
      this.output.sendMessage(message)
    } catch (e) {
      this.outputConnected = false
      console.error(`Could not send message: ${e}. Next message will try to reconnect.`)
    }
  }
}
