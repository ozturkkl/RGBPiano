import { Connection } from '../util/websocket'
import { RgbStrip } from '../util/rbgStrip'
import { Midi } from '../util/midi'
import { updateConfig } from '../util/config'
import { WebsocketMessage } from '../types/websocket'

export async function mainProcess(): Promise<{
  connection: Connection
  midi: Midi
  rgbStrip: RgbStrip
}> {
  const connection = new Connection()
  await connection.connect()

  const rgbStrip = new RgbStrip()

  const midi = new Midi(connection, rgbStrip)

  connection.listen((message: WebsocketMessage) => {
    console.log(message)
    if (message?.type === 'midi') {
      rgbStrip.handleNotePress(message.data)
    }
    if (message?.type === 'config') {
      updateConfig(message.data)
    }
  })

  return {
    connection,
    midi,
    rgbStrip
  }
}
