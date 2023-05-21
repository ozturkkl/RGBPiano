import { Connection } from './websocket'
import { RgbStrip } from './rbgStrip'
import { Midi } from './midi'

const BACKGROUND_COLOR = [0, 2, 2]
const COLOR = [0, 255, 255]

export async function mainProcess(): Promise<void> {
  const connection = new Connection()
  await connection.connect()

  const midi = new Midi(connection)
  const devices: string[] = midi.getDevices()
  devices.forEach((device) => {
    if (device.includes('Springbeats vMIDI1')) {
      midi.openInput(device)
    }
  })

  const rgbStrip = new RgbStrip()
  rgbStrip.setBrightness(255)
  rgbStrip.setBackgroundColor(...BACKGROUND_COLOR)

  connection.listen((message) => {
    console.log(message)
    if (message?.type === 'midi' && message?.data) {
      const { notePositionRatio, noteVelocityRatio, midiChannel } = message.data

      // note
      if (midiChannel === 144) {
        rgbStrip.setPixelColor(notePositionRatio, noteVelocityRatio === 0 ? 0 : 1, ...COLOR)
      }

      // pedal
      if (midiChannel === 176) {
        // disabled until other notes disappearing is fixed
        // rgbStrip.setBackgroundColor(
        //   ...BACKGROUND_COLOR.map((c) => c * (noteVelocityRatio === 1 ? 2 : 1))
        // );
      }
    }
  })
}
