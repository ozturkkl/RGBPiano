export function throttleWithTrailing<T extends unknown[]>(fn: (...args: T) => void, wait: number): (...args: T) => void {
  let lastArgs: T | null = null
  let lastCallTime = 0
  let timeout: NodeJS.Timeout | null = null

  return function throttled(...args: T) {
    const now = Date.now()
    const remainingTime = wait - (now - lastCallTime)

    if (remainingTime <= 0) {
      // If enough time has passed, execute the function immediately
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
      lastCallTime = now
      fn(...args)
    } else {
      // Store the latest args and set up a trailing call
      lastArgs = args

      if (!timeout) {
        timeout = setTimeout(() => {
          timeout = null
          lastCallTime = Date.now()
          if (lastArgs) {
            fn(...lastArgs)
            lastArgs = null
          }
        }, remainingTime)
      }
    }
  }
}

export function debounce<T extends unknown[]>(fn: (...args: T) => void, wait: number): (...args: T) => void {
  let timeout: NodeJS.Timeout | null = null

  return function debounced(...args: T) {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => {
      timeout = null
      fn(...args)
    }, wait)
  }
}
