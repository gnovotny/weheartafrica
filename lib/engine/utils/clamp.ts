const clamp = (min: number, max: number, val: number = 0) => Math.min(Math.max(min, val), max)

export default clamp
