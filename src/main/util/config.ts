import EventEmitter from 'events'
import { readFileSync, writeFileSync } from 'fs'
import path from 'path'
import { HSLToRGB } from './colors'
import { debounce, throttleWithTrailing } from './timeThrottleDebounce'
import { App } from 'electron'

export type ConfigType = typeof config
const configEmitter = new EventEmitter()

const hue = 18

export const PORT = 3192
export const DATA_PIN = 18
export const MIN_NOTE = 21
export const MAX_NOTE = 108
export const INPUT_DEVICE_REFRESH_INTERVAL = 10000

let config: {
  BRIGHTNESS: number
  BACKGROUND_BRIGHTNESS: number
  BACKGROUND_COLOR_RGB: [number, number, number]
  NOTE_PRESS_COLOR_RGB: [number, number, number]
  CONSTANT_VELOCITY: boolean
  SELECTED_DEVICE: string
  LED_INVERT: boolean
  LED_END_COUNT: number
  LED_START_COUNT: number
  AUTO_CONNECT_BLE_DEVICES: { id: string; port: string }[]
} = {
  BRIGHTNESS: 1,
  BACKGROUND_BRIGHTNESS: 0.03,
  BACKGROUND_COLOR_RGB: HSLToRGB(hue, 100, 50),
  NOTE_PRESS_COLOR_RGB: HSLToRGB(hue, 100, 50),
  CONSTANT_VELOCITY: true,
  SELECTED_DEVICE: 'Springbeats vMIDI1',
  LED_INVERT: true,
  LED_END_COUNT: 177,
  LED_START_COUNT: 0,
  AUTO_CONNECT_BLE_DEVICES: [
    {
      id: '48:B6:20:19:80:CE',
      port: 'Springbeats vMIDI2'
    },
    {
      id: '48:B6:20:22:01:4A',
      port: 'Springbeats vMIDI3'
    }
  ]
}

function getConfigPath(app?: App) {
  if (app) {
    return path.join(app.getPath('exe'), '..', 'user-config.json')
  } else {
    return path.join(__dirname, 'RGBPiano-config.json')
  }
}
export function getSavedConfig(app?: App) {
  try {
    const configPath = getConfigPath(app)
    console.log(`Loading config from ${configPath}`)
    config = {
      ...config,
      ...JSON.parse(readFileSync(configPath, 'utf8'))
    }
  } catch (error) {
    console.log('Could not load config file, using default config')
  }

  return config
}

export const saveConfigToFile = debounce((app?: Electron.App) => {
  const configPath = getConfigPath(app)
  console.log(`Saving config to ${configPath}`)
  try {
    writeFileSync(configPath, JSON.stringify(config, null, 2))
  } catch (error) {
    console.error('Could not save config file')
    console.error(error)
  }
}, 1000)

export function getConfig(): typeof config {
  return config
}

export function updateConfig(newConfig: Partial<typeof config>): void {
  const updatedProperties = {}

  getUpdatedProperties(config, newConfig).forEach((property) => {
    updatedProperties[property] = newConfig[property]
  })

  if (Object.keys(updatedProperties).length > 0) {
    config = {
      ...config,
      ...newConfig
    }
    configEmitter.emit('configUpdated', updatedProperties)
  }
}

export function onConfigUpdated(listener: (conf: Partial<typeof config>) => void): void {
  const throttled = throttleWithTrailing(listener, 22) // 45 FPS
  configEmitter.on('configUpdated', (updatedProperties: Partial<typeof config>) => {
    throttled(updatedProperties)
  })
}

function isObject(value): boolean {
  return typeof value === 'object' && value !== null
}
function getUpdatedProperties(currentConfig, newConfig): string[] {
  const updatedProperties: string[] = []

  for (const key in newConfig) {
    if (!isObject(newConfig[key])) {
      if (currentConfig[key] !== newConfig[key]) {
        updatedProperties.push(key)
      }
    } else {
      const nestedUpdatedProperties = getUpdatedProperties(currentConfig[key], newConfig[key])
      if (nestedUpdatedProperties.length > 0) {
        updatedProperties.push(key)
      }
    }
  }

  return updatedProperties
}
