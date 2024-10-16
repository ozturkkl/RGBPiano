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

export function getConfig() {
  return config
}

export function updateConfig(newConfig: Partial<ConfigType>) {
  const updatedProperties: Partial<Record<keyof ConfigType, unknown>> = {}

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

export function onConfigUpdated(listener: (conf: Partial<ConfigType>) => void) {
  const throttled = throttleWithTrailing(listener, 22) // 45 FPS
  configEmitter.on('configUpdated', (updatedProperties: Partial<ConfigType>) => {
    throttled(updatedProperties)
  })
}

function isDeepEqual(obj1: unknown, obj2: unknown): boolean {
  // Check if both are primitives (string, number, boolean, etc.) or functions
  if (obj1 === obj2) return true

  // If either is null or undefined, or if their types differ, they are not equal
  if (obj1 == null || obj2 == null || typeof obj1 !== typeof obj2) return false

  // If they are not objects (i.e., they are functions or other non-object non-primitive types), return false
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return false

  // Handle Arrays
  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    if (obj1.length !== obj2.length) return false
    for (let i = 0; i < obj1.length; i++) {
      if (!isDeepEqual(obj1[i], obj2[i])) return false
    }
    return true
  }

  // If one is array and the other is not, they are not equal
  if (Array.isArray(obj1) !== Array.isArray(obj2)) return false

  // Handle Objects
  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)

  // If number of keys is different, they are not equal
  if (keys1.length !== keys2.length) return false

  // Check recursively for each key
  for (const key of keys1) {
    if (
      !keys2.includes(key) ||
      !isDeepEqual((obj1 as Record<string, unknown>)[key], (obj2 as Record<string, unknown>)[key])
    )
      return false
  }

  return true
}

function getUpdatedProperties(currentConfig: ConfigType, newConfig: Partial<ConfigType>) {
  const updatedProperties: (keyof ConfigType)[] = []

  for (const key in newConfig) {
    const isDeepEqualResult = isDeepEqual(
      currentConfig[key as keyof ConfigType],
      newConfig[key as keyof ConfigType]
    )
    if (!isDeepEqualResult) {
      updatedProperties.push(key as keyof ConfigType)
    }
  }

  return updatedProperties
}
