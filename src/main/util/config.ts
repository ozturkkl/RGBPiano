import EventEmitter from 'events'
import { readFileSync, writeFileSync } from 'fs'
import path from 'path'

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

  compareProperties(config, newConfig, updatedProperties)

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

let config = {
  BRIGHTNESS: 1,
  BACKGROUND_COLOR: [0, 2, 2],
  COLOR: [0, 255, 255],
  CONSTANT_VELOCITY: true,
  SELECTED_DEVICE: 'Springbeats vMIDI1'
}

initConfig()

const configEmitter = new EventEmitter()

function isObject(value): boolean {
  return typeof value === 'object' && value !== null
}

function compareProperties(currentConfig, newConfig, updatedProperties, path = ''): void {
  for (const key in newConfig) {
    const currentVal = currentConfig[key]
    const newVal = newConfig[key]
    const nestedPath = path ? `${path}.${key}` : key

    if (isObject(currentVal) && isObject(newVal)) {
      compareProperties(currentVal, newVal, updatedProperties, nestedPath)
    } else if (currentVal !== newVal) {
      updatedProperties[nestedPath] = newVal
    }
  }
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
