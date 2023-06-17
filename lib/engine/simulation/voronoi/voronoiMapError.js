// from https://stackoverflow.com/questions/1382107/whats-a-good-way-to-extend-error-in-javascript
// (above link provided by https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)

export default function voronoiMapError(message) {
  this.message = message
  this.stack = new Error().stack
}

voronoiMapError.prototype.name = 'voronoiMapError'
voronoiMapError.prototype = new Error()
