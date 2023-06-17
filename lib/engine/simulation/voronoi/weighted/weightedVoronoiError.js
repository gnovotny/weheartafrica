// from https://stackoverflow.com/questions/1382107/whats-a-good-way-to-extend-error-in-javascript
// (above link provided by https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)

export default function weightedVoronoiError(message) {
  this.message = message
  this.stack = new Error().stack
}

weightedVoronoiError.prototype.name = 'd3WeightedVoronoiError'
weightedVoronoiError.prototype = new Error()
