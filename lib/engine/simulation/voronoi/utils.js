function sqr(d) {
  return Math.pow(d, 2)
}

export function squaredDistance(s0, s1) {
  return sqr(s1.x - s0.x) + sqr(s1.y - s0.y)
}
