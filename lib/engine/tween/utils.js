//begin: utils
export function sqr(d) {
  return Math.pow(d, 2)
}

export function squaredDistance(s0, s1) {
  return sqr(s1[0] - s0[0]) + sqr(s1[1] - s0[1])
}
