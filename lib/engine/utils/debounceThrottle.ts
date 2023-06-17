// Simplest, dont run once when event haven been seen for 50 ms
// You have to wait until events end firing before function is run
function debounce(method, delayMs) {
  delayMs = delayMs || 50
  var timer = null
  return function () {
    var context = this,
      args = arguments
    clearTimeout(timer)
    timer = setTimeout(function () {
      method.apply(context, args)
    }, delayMs)
  }
}

// Somewhat more complicated. function is fired right away, then for maximum
// every 250 ms. You might potentially have to wait 250 ms after last seen event
export function throttle(fn, threshold) {
  threshold = threshold || 250
  var last, deferTimer

  return function () {
    var now = +new Date(),
      args = arguments
    if (last && now < last + threshold) {
      clearTimeout(deferTimer)
      deferTimer = setTimeout(function () {
        last = now
        fn.apply(this, args)
      }, threshold)
    } else {
      last = now
      fn.apply(this, args)
    }
  }
}

// Somewhat more complicated. function is fired right away, then for maximum
// every 250 ms. You might potentially have to wait 250 ms after last seen event
export default function debounceThrottle(fn, threshold, delayMs) {
  threshold = threshold || 250
  var last, deferTimer

  var db = debounce(fn)
  return function () {
    var now = +new Date(),
      args = arguments
    if (!last || (last && now < last + threshold)) {
      clearTimeout(deferTimer)
      db.apply(this, args)
      deferTimer = setTimeout(function () {
        last = now
        fn.apply(this, args)
      }, threshold)
    } else {
      last = now
      fn.apply(this, args)
    }
  }
}
