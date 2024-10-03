import { WebsocketMessage, WebsocketP2P } from './WebsocketP2P'
import {
  ConfigType,
  getConfig,
  getSavedConfig,
  onConfigUpdated,
  saveConfigToFile,
  updateConfig
} from '../util/config'
import { RgbStrip } from './RbgStrip'
import { Midi } from './Midi'
import { BluetoothManager } from './BluetoothManager'
// import { BluetoothManager } from './BluetoothManager'

export async function Main(ipcMain: Electron.IpcMain) {
  const connection = new WebsocketP2P()
  await connection.connect()

  // IF ELECTRON
  if (ipcMain) {
    try {
      // SETUP MIDI
      await Midi.init()
      console.log('Midi initialized')
      console.log(`Midi inputs:\n  ${Midi.inputs.join('\n  ')}`)
      console.log(`Midi outputs:\n  ${Midi.outputs.join('\n  ')}`)
      new Midi(getConfig().SELECTED_DEVICE, (msg) => {
        connection.send({
          type: 'midi',
          data: msg
        })
      })

      // SETUP CONFIG
      const config = getSavedConfig()
      connection.send({
        type: 'config',
        data: config
      })
      onConfigUpdated(() => {
        saveConfigToFile()
      })
      ipcMain.handle('config', (_, config: ConfigType) => {
        console.log('Received config: ', config)
        connection.send({
          type: 'config',
          data: config
        })
        updateConfig(config)
      })

      // SETUP BLUETOOTH
      // TODO: WIP
      // bm.onMidiDeviceListUpdated = (devices) => {
      //   console.log('Midi devices updated: ', devices)
      // }
      const bm = new BluetoothManager()
      await bm.connectDevice('48:B6:20:22:01:4A', (data) => {
        console.log('Received data from 48:B6:20:22:01:4A: ', data)
      })
      const bm2 = new BluetoothManager()
      await bm2.connectDevice('48:B6:20:19:80:CE', (data) => {
        console.log('Received data from 48:B6:20:19:80:CE: ', data)
      })
    } catch (e) {
      console.error(e)
    }
  }

  // IF NOT ELECTRON => RASPBERRY PI - LED STRIP
  if (!ipcMain) {
    const rgbStrip = new RgbStrip()

    connection.listen((message: WebsocketMessage) => {
      console.log(message)
      if (message?.type === 'midi') {
        rgbStrip.handleNotePress(message.data)
      }
      if (message?.type === 'config') {
        updateConfig(message.data)
      }
    })
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
