import { ConfigType } from '../util/config'
import { PrettyMidiMessage } from './midi'

export type WebsocketMessage =
  | {
      type: 'midi'
      data: PrettyMidiMessage
    }
  | {
      type: 'config'
      data: Partial<ConfigType>
    }
