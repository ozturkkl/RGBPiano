import midi from 'midi'
import readline from 'readline'
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

  async openInput(device?: string): Promise<void> {
    if (device) {
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
    } else {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      })

      const devices = this.getDevices()
      console.log('Available devices:')
      console.log('0: Cancel')
      devices.forEach((d, i) => {
        console.log(`${i + 1}: ${d}`)
      })
      console.log('Which device would you like to use?')
      const answer = await new Promise<number>((resolve) => {
        rl.question('Device: ', (answer) => {
          resolve(parseInt(answer))
        })
      })
      rl.close()

      if (isNaN(answer) || answer < 1 || answer > devices.length) {
        return
      }

      try {
        this.openInput(devices[answer - 1])
      } catch (e) {
        console.error(`Failed to open port ${this.devices[answer - 1]}: ${e}`)
      }
    }
  }
}
