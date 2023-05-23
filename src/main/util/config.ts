import EventEmitter from 'events'
import { readFileSync, writeFileSync } from 'fs'
import path from 'path'
import { HSLToRGB } from './colors'

export type ConfigType = typeof config
export const configPath = path.join(__dirname, 'RGBPiano-config.json')

export const PORT = 3192
export const DATA_PIN = 18
export const MIN_NOTE = 21
export const MAX_NOTE = 108
export const NUM_LEDS = 177

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
    // write config to file
    writeFileSync(configPath, JSON.stringify(config, null, 2))
  }
}

export function onConfigUpdated(listener: (conf: Partial<typeof config>) => void): void {
  configEmitter.on('configUpdated', (updatedProperties: Partial<typeof config>) => {
    listener(updatedProperties)
  })
}

const hue = Math.round(Math.random() * 360)

let config: {
  BRIGHTNESS: number
  BACKGROUND_COLOR: [number, number, number]
  COLOR: [number, number, number]
  CONSTANT_VELOCITY: boolean
  SELECTED_DEVICE: string
} = {
  BRIGHTNESS: 1,
  BACKGROUND_COLOR: HSLToRGB(hue, 1, 0.02),
  COLOR: HSLToRGB(hue, 1, 1),
  CONSTANT_VELOCITY: true,
  SELECTED_DEVICE: 'Springbeats vMIDI1'
}

initConfig()

const configEmitter = new EventEmitter()

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

function initConfig(): void {
  try {
    config = {
      ...config,
      ...JSON.parse(readFileSync(configPath, 'utf8'))
    }
  } catch (error) {
    console.log('Could not load config file, using default config')
  }
}
