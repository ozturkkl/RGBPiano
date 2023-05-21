import * as midi from 'midi'
import { Connection } from './websocket'

export class Midi {
  devices: string[] = []
  minNote = 21
  maxNote = 108

  input: midi.Input
  output: midi.Output

  constructor(connection: Connection) {
    this.input = new midi.Input()
    this.output = new midi.Output()
    this.devices = this.getDevices()

    this.input.on('message', (deltaTime, message) => {
      connection.send({
        type: 'midi',
        data: {
          deltaTime,
          notePositionRatio: (message[1] - this.minNote) / (this.maxNote - this.minNote),
          noteVelocityRatio: message[2] / 127,
          midiChannel: message[0]
        }
      })
    })
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
}
