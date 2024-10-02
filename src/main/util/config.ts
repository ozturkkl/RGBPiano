import EventEmitter from 'events'
import { readFileSync, writeFileSync } from 'fs'
import path from 'path'
import { HSLToRGB } from './colors'

export type ConfigType = typeof config
export const configPath = path.join(__dirname, 'RGBPiano-config.json')
const configEmitter = new EventEmitter()

const hue = Math.round(Math.random() * 360)

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
} = {
  BRIGHTNESS: 1,
  BACKGROUND_BRIGHTNESS: 0.05,
  BACKGROUND_COLOR_RGB: HSLToRGB(hue, 100, 100),
  NOTE_PRESS_COLOR_RGB: HSLToRGB(hue, 100, 100),
  CONSTANT_VELOCITY: true,
  SELECTED_DEVICE: 'Springbeats vMIDI1',
  LED_INVERT: true,
  LED_END_COUNT: 177,
  LED_START_COUNT: 0
}

export function initSavedConfig() {
  try {
    config = {
      ...config,
      ...JSON.parse(readFileSync(configPath, 'utf8'))
    }

    return config
  } catch (error) {
    console.log('Could not load config file, using default config')

    return null
  }
}
export function saveConfigToFile() {
  writeFileSync(configPath, JSON.stringify(config, null, 2))
}

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
  configEmitter.on('configUpdated', (updatedProperties: Partial<typeof config>) => {
    listener(updatedProperties)
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
