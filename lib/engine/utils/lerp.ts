import { Generic2D } from '@lib/engine/types'

const lerp = (v0: number, v1: number, t: number) => {
  return v0 * (1 - t) + v1 * t
}

export default lerp

export const lerp2D = (p1: [number, number], p2: [number, number], t: number) => [
  lerp(p1[0], p2[0], t),
  lerp(p1[1], p2[1], t),
]

export const lerpPoints = (p1: Generic2D, p2: Generic2D, t: number) => ({
  x: lerp(p1.x, p2.x, t),
  y: lerp(p1.y, p2.y, t),
})

export const lerpDegrees = (start: number, end: number, amount: number) => {
  const difference = Math.abs(end - start)
  if (difference > 180) {
    // We need to add on to one of the values.
    if (end > start) {
      // We'll add it on to start...
      start += 360
    } else {
      // Add it on to end.
      end += 360
    }
  }

  // Interpolate it.
  const value = start + (end - start) * amount

  // Wrap it..
  const rangeZero = 360

  if (value >= 0 && value <= 360) return value

  return value % rangeZero
}
