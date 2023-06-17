const seedrandom = require('seedrandom')

const repeatableRandomness = true

export const random = repeatableRandomness ? seedrandom('seed2') : Math.random
