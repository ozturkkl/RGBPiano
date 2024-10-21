import { writable, type Writable } from 'svelte/store'

export abstract class Store {
  private static variables: Map<string, Writable<unknown>> = new Map()

  static get<T>(key: string, defaultValue?: T): Writable<T> {
    const existing = this.variables.get(key)
    if (existing) {
      return existing as Writable<T>
    }
    const w = writable(defaultValue)
    this.variables.set(key, w)
    return w
  }

  static getPersistent<T>(key: string, defaultValue?: T, persistentFilterFunc?: (v: T) => boolean): Writable<T> {
    const w = this.get(key, defaultValue)
    const v = localStorage.getItem(key)
    if (v !== undefined && v !== null) {
      w.set(JSON.parse(v).value)
    }
    w.subscribe((value) => {
      if (persistentFilterFunc && !persistentFilterFunc(value)) {
        return
      }
      localStorage.setItem(key, JSON.stringify({ value }))
    })
    return w
  }
}
