export function throttleWithTrailing<T>(fn: (arg: T) => void, wait: number): (arg: T) => void {
  let lastArgs: T | null = null
  let lastCallTime = 0
  let timeout: NodeJS.Timeout | null = null

  return function throttled(arg: T) {
    const now = Date.now()
    const remainingTime = wait - (now - lastCallTime)

    if (remainingTime <= 0) {
      // If enough time has passed, execute the function immediately
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
      lastCallTime = now
      fn(arg)
    } else {
      // Store the latest args and set up a trailing call
      lastArgs = arg

      if (!timeout) {
        timeout = setTimeout(() => {
          timeout = null
          lastCallTime = Date.now()
          if (lastArgs) {
            fn(lastArgs)
            lastArgs = null
          }
        }, remainingTime)
      }
    }
  }
}

export function debounce<T>(fn: (arg: T) => void, wait: number): (arg: T) => void {
  let timeout: NodeJS.Timeout | null = null

  return function debounced(arg: T) {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => {
      timeout = null
      fn(arg)
    }, wait)
  }
}
