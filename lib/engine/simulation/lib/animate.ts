import { AnimationOptions, Driver, animate as popmotionAnimate } from 'popmotion'

import { usingSIOnly } from '@lib/engine/settings/utils'

/** @see https://github.com/Popmotion/popmotion/blob/master/packages/popmotion/src/animations/index.ts **/
export const timeoutAnimationDriver: Driver = (update) => {
  // const passTimestamp = ({ delta }) => update(delta)

  let latestTimeout: ReturnType<typeof setTimeout>
  let prevTimestamp = performance.now()

  const stopTimeout = () => {
    latestTimeout && clearTimeout(latestTimeout)
  }
  const updateTimeout = () => {
    const timestamp = performance.now()
    const delta = timestamp - prevTimestamp
    prevTimestamp = timestamp

    update(delta)

    latestTimeout = setTimeout(updateTimeout, 1000 / 30)
  }

  const startTimeout = () => {
    latestTimeout = setTimeout(updateTimeout, 1000 / 30)
  }

  return {
    start: () => startTimeout(),
    stop: () => stopTimeout(),
  }
}

export const intervalAnimationDriver: Driver = (update) => {
  let latestInterval: ReturnType<typeof setInterval>
  let prevTimestamp = performance.now()

  const stopInterval = () => {
    latestInterval && clearInterval(latestInterval)
  }
  const interval = () => {
    const timestamp = performance.now()
    const delta = timestamp - prevTimestamp
    prevTimestamp = timestamp

    update(delta)
  }

  const startInterval = () => {
    latestInterval = setInterval(interval, 1000 / 30)
  }

  return {
    start: () => startInterval(),
    stop: () => stopInterval(),
  }
}

export const animate = <V = number>(options: AnimationOptions<V>) =>
  !usingSIOnly() ? popmotionAnimate(options) : popmotionAnimate({ ...options, driver: intervalAnimationDriver })
