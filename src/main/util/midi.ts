import midi from 'midi'
import { Connection } from './websocket'
import { RgbStrip } from './rbgStrip'
import { MAX_NOTE, MIN_NOTE, getConfig, onConfigUpdated } from './config'

export class Midi {
  minNote = MIN_NOTE
  maxNote = MAX_NOTE

  input: midi.Input
  output: midi.Output

  connection: Connection
  rgbStrip: RgbStrip

  constructor(connection: Connection, rgbStrip: RgbStrip) {
    this.input = new midi.Input()
    this.output = new midi.Output()
    this.connection = connection
    this.rgbStrip = rgbStrip
    this.listenToInput()
    this.initConfiguredInput()
  }

  getDevices(): string[] {
    const devices: string[] = []
    for (let i = 0; i < this.input.getPortCount(); i++) {
      devices.push(this.input.getPortName(i))
    }
    return devices
  }

  async openInput(device: string): Promise<void> {
    this.getDevices().forEach((d, i) => {
      if (d === device) {
        try {
          this.input.closePort()
          this.input.openPort(i)

          console.log(`Opened port ${d}`)
        } catch (e) {
          console.error(`Failed to open port ${d}: ${e}`)
        }
      }
    })
  }

  listenToInput(): void {
    this.input.on('message', (deltaTime, message) => {
      const payload = {
        deltaTime,
        notePositionRatio: (message[1] - this.minNote) / (this.maxNote - this.minNote),
        noteVelocityRatio: message[2] / 127,
        midiChannel: message[0]
      }

      this.connection.send({
        type: 'midi',
        data: payload
      })

      this.rgbStrip.handleNotePress(payload)
    })
  }

  initConfiguredInput(): void {
    const devices: string[] = this.getDevices()
    devices.forEach((device) => {
      if (device.includes(getConfig().SELECTED_DEVICE)) {
        this.openInput(device)
      }
    })

    onConfigUpdated((config) => {
      if (config.SELECTED_DEVICE) {
        this.openInput(config.SELECTED_DEVICE)
      }
    })
  }
}
