import EventEmitter from 'node:events'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { homedir } from 'node:os'
import path from 'node:path'
import { defaultConfig, type Config } from '@rgbpiano/shared'
import { debounce, throttleWithTrailing } from './util/throttle.js'

const CONFIG_DIR = path.join(homedir(), '.rgbpiano')
const CONFIG_PATH = path.join(CONFIG_DIR, 'config.json')

const emitter = new EventEmitter()
const config: Config = { ...defaultConfig }

loadConfig()

export function getConfig(): Config {
  return config
}

function loadConfig(): void {
  try {
    Object.assign(config, JSON.parse(readFileSync(CONFIG_PATH, 'utf8')))
    console.log(`Loaded config from ${CONFIG_PATH}`)
  } catch {
    console.log('No saved config found, using defaults')
  }
}

const saveConfig = debounce(() => {
  try {
    mkdirSync(CONFIG_DIR, { recursive: true })
    writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2))
  } catch (error) {
    console.error('Could not save config:', error)
  }
}, 1000)

export function updateConfig(patch: Partial<Config>): void {
  const changed: Partial<Config> = {}
  for (const key of Object.keys(patch) as (keyof Config)[]) {
    if (!deepEqual(config[key], patch[key])) {
      ;(changed as Record<string, unknown>)[key] = patch[key]
    }
  }

  if (Object.keys(changed).length === 0) return

  Object.assign(config, changed)
  saveConfig()
  emitter.emit('updated', changed)
}

/** Subscribe to config changes. Listener receives only the properties that changed. */
export function onConfigUpdated(
  listener: (changed: Partial<Config>) => void,
  invokeImmediately = false,
): void {
  if (invokeImmediately) listener(config)
  const throttled = throttleWithTrailing(listener, 22) // ~45 FPS
  emitter.on('updated', throttled)
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false
  return JSON.stringify(a) === JSON.stringify(b)
}
