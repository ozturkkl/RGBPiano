import { HSLToRGB } from './colors'

export type ConfigType = typeof defaultConfig
export const defaultConfig = {
  BRIGHTNESS: 1,
  BACKGROUND_BRIGHTNESS: 0.03,
  BACKGROUND_COLOR_RGB: HSLToRGB(18, 100, 50),
  NOTE_PRESS_COLOR_RGB: HSLToRGB(18, 100, 50),
  CONSTANT_VELOCITY: true,
  SELECTED_DEVICE: 'Springbeats vMIDI1',
  LED_INVERT: true,
  LED_END_COUNT: 177,
  LED_START_COUNT: 0,
  AUTO_CONNECT_BLE_DEVICES: [
    {
      id: '48:B6:20:19:80:CE',
      port: 'Springbeats vMIDI2',
    },
    {
      id: '48:B6:20:22:01:4A',
      port: 'Springbeats vMIDI3',
    },
  ],
}

export const PORT = 3192
export const DATA_PIN = 18
export const MIN_NOTE = 21
export const MAX_NOTE = 108
export const MIDI_INPUT_DEVICE_IDLE_REFRESH_INTERVAL = 10000
