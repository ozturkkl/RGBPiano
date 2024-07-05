import { Config } from './config'

export type WebsocketMessage =
  | {
      type: 'midi'
      data: WebsocketMessageDataMidi
    }
  | {
      type: 'config'
      data: Partial<Config>
    }

export interface WebsocketMessageDataMidi {
  deltaTime: number
  notePositionRatio: number
  noteVelocityRatio: number
  midiChannel: number
}
