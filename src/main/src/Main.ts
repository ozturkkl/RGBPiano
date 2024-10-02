import { WebsocketP2P } from './WebsocketP2P'
import { getConfig, updateConfig } from '../util/config'
import { WebsocketMessage } from '../types/websocket'
import { RgbStrip } from './RbgStrip'
import JZZ from 'jzz'
// import { BluetoothManager } from './BluetoothManager'
// import { MidiDevice } from './MidiDevice'

// interface MidiMessage {
//   time: number
//   data: number[]
// }

export async function Main(isElectron: boolean): Promise<{
  connection: WebsocketP2P
}> {
  const connection = new WebsocketP2P()
  await connection.connect()

  let rgbStrip: RgbStrip | null = null
  if (!isElectron) {
    // lazy load the RGB strip for non-electron environments like the Raspberry Pi
    rgbStrip = new RgbStrip()
  }

  try {
    // new MidiDevice(getConfig().SELECTED_DEVICE, (msg) => {
    //   connection.send({
    //     type: 'midi',
    //     data: msg
    //   })

    //   rgbStrip?.handleNotePress(msg)
    // })

    const jzz = await JZZ.requestMIDIAccess()
    console.log('MIDI Inputs:')
    jzz.inputs.forEach((input) => {
      console.log(input.name)
    })
    console.log('MIDI Outputs:')
    jzz.outputs.forEach((output) => {
      console.log(output.name)
    })
    jzz.onstatechange = function (e) {
      console.log(e.port.name, e.port.state)
    }

    // send note to rgbStrip from SELECTED_DEVICE
    const selectedDevice = jzz.inputs.get(getConfig().SELECTED_DEVICE)
    if (selectedDevice) {
      selectedDevice.onmidimessage = (msg) => {
        connection.send({
          type: 'midi',
          data: Array.from(msg.data)
        })
        rgbStrip?.handleNotePress(Array.from(msg.data))
      }
    }

    if (isElectron) {
      // const bm = new BluetoothManager()
    }
  } catch (e) {
    console.log(e)
  }

  connection.listen((message: WebsocketMessage) => {
    console.log(message)
    if (message?.type === 'midi') {
      rgbStrip?.handleNotePress(message.data)
    }
    if (message?.type === 'config') {
      updateConfig(message.data)
    }
  })

  return {
    connection
  }
}

// function parseMIDIData(dataArray: Uint8Array) {
//   // COMMON MIDI VALUES
//   // 128 - 143: Note Off
//   // 144 - 159: Note On
//   // 160 - 175: Polyphonic Aftertouch
//   // 176 - 191: CC
//   // 192 - 207: Program Change
//   // 208 - 223: Channel Aftertouch
//   // 224 - 239: Pitch Bend

//   // COMMON CC VALUES
//   // 0: Bank Select
//   // 1: Modulation Wheel
//   // 2: Breath Controller
//   // 7: Volume
//   // 10: Pan
//   // 11: Expression Controller
//   // 64: Sustain
//   // 65: Portamento
//   // 66: Sostenuto
//   // 67: Soft Pedal
//   // 120: All Sound Off
//   // 121: Reset All Controllers
//   // 123: All Notes Off

//   const MST = dataArray[0] // most significant time byte

//   let errorParsing = false

//   const messages: MidiMessage[] = []
//   const message: MidiMessage = {
//     time: 0,
//     data: []
//   }

//   for (let i = 1; i < dataArray.length; i++) {
//     const LST = dataArray[i] // least significant time byte
//     message.time = (MST << 8) + LST

//     const status = dataArray[i + 1]
//     if (status < 128 || status > 239) {
//       errorParsing = true
//       break
//     }

//     if (status >= 128 && status <= 143) {
//       // Note Off
//       message.data = [status, dataArray[i + 2], dataArray[i + 3]]

//       // sometimes the note off message is sent twice, check for that condition
//       if (dataArray[i + 4] < 128 && dataArray[i + 5] < 128) {
//         // next two bytes are not a valid status or time byte, they are likely a combined note off message
//         message.data = [status, dataArray[i + 4], dataArray[i + 5]]
//         i += 2
//       }
//       i += 3
//     } else if (status >= 144 && status <= 159) {
//       // Note On
//       message.data = [status, dataArray[i + 2], dataArray[i + 3]]
//       i += 3
//     } else if (status >= 160 && status <= 175) {
//       // Polyphonic Aftertouch
//       message.data = [status, dataArray[i + 2], dataArray[i + 3]]
//       i += 3
//     } else if (status >= 176 && status <= 191) {
//       // CC
//       message.data = [status, dataArray[i + 2], dataArray[i + 3]]
//       i += 3
//     } else if (status >= 192 && status <= 207) {
//       // Program Change
//       message.data = [status, dataArray[i + 2]]
//       i += 2
//     } else if (status >= 208 && status <= 223) {
//       // Channel Aftertouch
//       message.data = [status, dataArray[i + 2]]
//       i += 2
//     } else if (status >= 224 && status <= 239) {
//       // Pitch Bend
//       message.data = [status, dataArray[i + 2], dataArray[i + 3]]

//       // sometimes the pitch bend message is sent twice, check for that condition
//       if (dataArray[i + 4] < 128 && dataArray[i + 5] < 128) {
//         // next two bytes are not a valid status or time byte, they are likely a combined pitch bend message
//         message.data = [status, dataArray[i + 4], dataArray[i + 5]]
//         i += 2
//       }
//       i += 3
//     }

//     messages.push(message)
//   }

//   return {
//     messages,
//     errorParsing
//   }
// }
