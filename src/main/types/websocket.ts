import { ConfigType } from '../util/config'

export type WebsocketMessage =
  | {
      type: 'midi'
      data: number[]
    }
  | {
      type: 'config'
      data: Partial<ConfigType>
    }
