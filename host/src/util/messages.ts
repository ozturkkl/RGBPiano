import type { Config } from './config.js'

export interface BrowserState {
  config: Config
  devices: string[]
  piConnected: boolean
}

export type BrowserMessage =
  | { type: 'state'; data: BrowserState }
  | { type: 'config'; data: Partial<Config> }
