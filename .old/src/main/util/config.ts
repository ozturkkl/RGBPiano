import EventEmitter from 'events'
import { readFileSync, writeFileSync } from 'fs'
import path from 'path'
import { debounce, throttleWithTrailing } from './timeThrottleDebounce'
import { App } from 'electron'
import { ConfigType, defaultConfig } from './consts'

const configEmitter = new EventEmitter()

const config = defaultConfig

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
    const newConfig = JSON.parse(readFileSync(configPath, 'utf8'))
    Object.assign(config, newConfig)
  } catch (error) {
    console.log('Could not load config file, using default config')
  }

  return config
}

export const saveConfigToFile = debounce((app?: Electron.App, c?: Partial<ConfigType>) => {
  const configPath = getConfigPath(app)
  console.log(`Saving config to ${configPath}`)
  try {
    writeFileSync(configPath, JSON.stringify({ ...config, ...c }, null, 2))
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
    Object.assign(config, newConfig)
    configEmitter.emit('configUpdated', updatedProperties)
  }
}

export function onConfigUpdated(listener: (conf: Partial<ConfigType>) => void, invokeImmediately = false) {
  const throttled = throttleWithTrailing(listener, 22) // 45 FPS
  if (invokeImmediately) {
    listener(config)
  }
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
    ) {
      return false
    }
  }

  return true
}

function getUpdatedProperties(currentConfig: ConfigType, newConfig: Partial<ConfigType>) {
  const updatedProperties: (keyof ConfigType)[] = []

  for (const key in newConfig) {
    const isDeepEqualResult = isDeepEqual(currentConfig[key as keyof ConfigType], newConfig[key as keyof ConfigType])
    if (!isDeepEqualResult) {
      updatedProperties.push(key as keyof ConfigType)
    }
  }

  return updatedProperties
}
