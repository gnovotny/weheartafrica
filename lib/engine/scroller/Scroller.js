import BezierEasing from 'bezier-easing'
import sync, { cancelSync } from 'framesync'
import VirtualScroll from 'virtual-scroll'

import { defaults } from '@lib/engine/scroller/options'
import { getTargetFPS, usingSIOnly } from '@lib/engine/settings/utils'

import { lerp } from './utils/maths'
import { getTranslate } from './utils/transform'

const keyCodes = {
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  SPACE: 32,
  TAB: 9,
  PAGEUP: 33,
  PAGEDOWN: 34,
  HOME: 36,
  END: 35,
}

export default class Scroller {
  constructor(options = {}) {
    if (history.scrollRestoration) {
      history.scrollRestoration = 'manual'
    }
    window.scrollTo(0, 0)

    /** super **/
    Object.assign(this, defaults, options)
    this.smartphone = defaults.smartphone
    if (options.smartphone) Object.assign(this.smartphone, options.smartphone)
    this.tablet = defaults.tablet
    if (options.tablet) Object.assign(this.tablet, options.tablet)

    this.namespace = 'scroller'
    this.html = document.documentElement
    this.windowHeight = window.innerHeight
    this.windowWidth = window.innerWidth
    this.windowMiddle = {
      x: this.windowWidth / 2,
      y: this.windowHeight / 2,
    }
    this.listeners = {}

    this.hasScrollTicking = false

    this.checkScroll = this.checkScroll.bind(this)
    this.checkResize = this.checkResize.bind(this)
    this.checkEvent = this.checkEvent.bind(this)

    this.instance = {
      scroll: 0,
      limit: this.html.offsetHeight,
    }

    if (this.isMobile) {
      if (this.isTablet) {
        this.context = 'tablet'
      } else {
        this.context = 'smartphone'
      }
    } else {
      this.context = 'desktop'
    }

    window.addEventListener('resize', this.checkResize, false)
    /** end super **/

    this.isScrolling = false
    this.isDraggingScrollbar = false
    this.isTicking = false
    this.hasScrollTicking = false
    this.stop = false
    this.onScrollingStateChanged = options.onScrollingStateChanged
    this.handleScroll = options.handleScroll

    this.checkKey = this.checkKey.bind(this)
    window.addEventListener('keydown', this.checkKey, false)

    this.init()
  }

  init() {
    this.isMobile =
      /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    // ||
    // window.innerWidth < this.tablet.breakpoint
    this.isTablet = this.isMobile && window.innerWidth >= this.tablet.breakpoint

    this.html.classList.add(this.smoothClass)

    this.instance = {
      delta: this.initPosition,
      scroll: this.initPosition,
      ...this.instance,
    }

    this.vs = new VirtualScroll({
      el: this.scrollFromAnywhere ? document : this.el,
      mouseMultiplier: navigator.platform.indexOf('Win') > -1 ? 1 : 0.4,
      firefoxMultiplier: this.firefoxMultiplier,
      touchMultiplier: this.touchMultiplier,
      useKeyboard: false,
      passive: true,
    })

    this.vs.on((e) => {
      if (this.stop) {
        return
      }

      if (!this.isDraggingScrollbar) {
        if (!usingSIOnly()) {
          requestAnimationFrame(() => {
            this.updateDelta(e)
            if (!this.isScrolling) this.startScrolling()
          })
        } else {
          this.updateDelta(e)
          if (!this.isScrolling) this.startScrolling()
        }
      }
    })

    this.setScrollLimit()
    this.initScrollBar()

    this.checkScroll(true)

    this.initEvents()

    if (usingSIOnly()) {
      this.syncProc = sync.preRender(({ delta }) => {
        if (this.scrollBarTranslation) {
          this.transform(this.scrollbarThumb, 0, this.scrollBarTranslation)
          this.scrollBarTranslation = null
        }
      }, true)
    }
  }

  setScrollLimit() {
    this.instance.limit = this.scrollLimit ?? this.el.offsetHeight - this.windowHeight
  }

  setIsScrolling(isScrolling) {
    this.isScrolling !== isScrolling && this.onScrollingStateChanged?.(isScrolling)
    this.isScrolling = isScrolling
  }

  startScrolling() {
    this.startScrollTs = Date.now() // Record timestamp

    this.setIsScrolling(true)

    this.checkScroll()
    this.html.classList.add(this.scrollingClass)
  }

  stopScrolling() {
    this.checkScrollRaf && cancelAnimationFrame(this.checkScrollRaf) // Prevent checkScroll to continue looping
    this.checkScrollTimeout && clearTimeout(this.checkScrollTimeout) // Prevent checkScroll to continue looping

    //Prevent scrollbar glitch/locking
    this.startScrollTs = undefined

    if (this.scrollToRaf) {
      cancelAnimationFrame(this.scrollToRaf)
      this.scrollToRaf = null
    }

    if (this.scrollToTimeout) {
      clearTimeout(this.scrollToTimeout)
      this.scrollToTimeout = null
    }

    this.setIsScrolling(false)
    this.instance.scroll = Math.round(this.instance.scroll)
    this.html.classList.remove(this.scrollingClass)
  }

  checkKey(e) {
    if (this.stop) {
      // If we are stopped, we don't want any scroll to occur because of a keypress
      // Prevent tab to scroll to activeElement
      if (e.keyCode === keyCodes.TAB) {
        if (!usingSIOnly()) {
          requestAnimationFrame(() => {
            // Make sure native scroll is always at top of page
            this.html.scrollTop = 0
            document.body.scrollTop = 0
            this.html.scrollLeft = 0
            document.body.scrollLeft = 0
          })
        } else {
          // Make sure native scroll is always at top of page
          this.html.scrollTop = 0
          document.body.scrollTop = 0
          this.html.scrollLeft = 0
          document.body.scrollLeft = 0
        }
      }
      return
    }

    switch (e.keyCode) {
      case keyCodes.TAB:
        // Do not remove the RAF
        // It allows to override the browser's native scrollTo, which is essential
        if (!usingSIOnly()) {
          requestAnimationFrame(() => {
            // Make sure native scroll is always at top of page
            this.html.scrollTop = 0
            document.body.scrollTop = 0
            this.html.scrollLeft = 0
            document.body.scrollLeft = 0

            // Request scrollTo on the focusedElement, putting it at the center of the screen
            this.scrollTo(document.activeElement, { offset: -window.innerHeight / 2 })
          })
        } else {
          // Make sure native scroll is always at top of page
          this.html.scrollTop = 0
          document.body.scrollTop = 0
          this.html.scrollLeft = 0
          document.body.scrollLeft = 0

          // Request scrollTo on the focusedElement, putting it at the center of the screen
          this.scrollTo(document.activeElement, { offset: -window.innerHeight / 2 })
        }
        break
      case keyCodes.UP:
        if (this.isActiveElementScrollSensitive()) {
          this.instance.delta -= 240
        }
        break
      case keyCodes.DOWN:
        if (this.isActiveElementScrollSensitive()) {
          this.instance.delta += 240
        }
        break
      case keyCodes.PAGEUP:
        this.instance.delta -= window.innerHeight
        break
      case keyCodes.PAGEDOWN:
        this.instance.delta += window.innerHeight
        break
      case keyCodes.HOME:
        this.instance.delta -= this.instance.limit
        break
      case keyCodes.END:
        this.instance.delta += this.instance.limit
        break
      case keyCodes.SPACE:
        if (this.isActiveElementScrollSensitive()) {
          if (e.shiftKey) {
            this.instance.delta -= window.innerHeight
          } else {
            this.instance.delta += window.innerHeight
          }
        }
        break
      default:
        return
    }

    if (this.instance.delta < 0) this.instance.delta = 0
    if (this.instance.delta > this.instance.limit) this.instance.delta = this.instance.limit

    this.stopScrolling() // Stop any movement, allows to kill any other `scrollTo` still happening
    this.setIsScrolling(true)
    this.checkScroll()
    this.html.classList.add(this.scrollingClass)
  }

  isActiveElementScrollSensitive() {
    return (
      !(document.activeElement instanceof HTMLInputElement) &&
      !(document.activeElement instanceof HTMLTextAreaElement) &&
      !(document.activeElement instanceof HTMLButtonElement) &&
      !(document.activeElement instanceof HTMLSelectElement)
    )
  }

  checkScroll(forced = false) {
    if (forced || this.isScrolling || this.isDraggingScrollbar) {
      if (!this.hasScrollTicking) {
        if (!usingSIOnly()) {
          this.checkScrollRaf = requestAnimationFrame(() => this.checkScroll())
        } else {
          this.checkScrollTimeout = setTimeout(() => this.checkScroll(), 1000 / getTargetFPS()) // @Todo use some sort of delta
        }
        this.hasScrollTicking = true
      }

      this.updateScroll()

      const distance = Math.abs(this.instance.delta - this.instance.scroll)
      const timeSinceStart = Date.now() - this.startScrollTs // Get the time since the scroll was started: the scroll can be stopped again only past 100ms
      if (
        !this.animatingScroll &&
        timeSinceStart > 100 &&
        ((distance < 0.5 && this.instance.delta !== 0) || (distance < 0.5 && this.instance.delta === 0))
      ) {
        this.stopScrolling()
      }

      if (this.getDirection) {
        this.addDirection()
      }

      if (this.getSpeed) {
        this.addSpeed()
        this.speedTs = Date.now()
      }

      if (this.hasScrollbar) {
        this.scrollBarTranslation = (this.instance.scroll / this.instance.limit) * this.scrollBarLimit

        if (!usingSIOnly()) {
          this.transform(this.scrollbarThumb, 0, this.scrollBarTranslation)
        }
      }

      this.dispatchScroll()

      this.hasScrollTicking = false
    }
  }

  resize() {
    this.windowHeight = window.innerHeight
    this.windowWidth = window.innerWidth

    this.windowMiddle = {
      x: this.windowWidth / 2,
      y: this.windowHeight / 2,
    }
    this.update()
  }

  updateDelta(e) {
    this.instance.delta -= e.deltaY * this.multiplier

    if (this.instance.delta < 0) this.instance.delta = 0
    if (this.instance.delta > this.instance.limit) this.instance.delta = this.instance.limit
  }

  updateScroll(e) {
    if (this.isScrolling || this.isDraggingScrollbar) {
      this.instance.scroll = lerp(this.instance.scroll, this.instance.delta, this.lerp)
    } else {
      if (this.instance.scroll > this.instance.limit) {
        this.setScroll(this.instance.scroll, this.instance.limit)
      } else if (this.instance.scroll < 0) {
        this.setScroll(this.instance.scroll, 0)
      } else {
        this.setScroll(this.instance.scroll, this.instance.delta)
      }
    }
  }

  addDirection() {
    if (this.instance.delta > this.instance.scroll) {
      if (this.instance.direction !== 'down') {
        this.instance.direction = 'down'
      }
    } else if (this.instance.delta < this.instance.scroll) {
      if (this.instance.direction !== 'up') {
        this.instance.direction = 'up'
      }
    }
  }

  addSpeed() {
    if (this.instance.delta !== this.instance.scroll) {
      this.instance.speed = (this.instance.delta - this.instance.scroll) / Math.max(1, Date.now() - this.speedTs)
    } else {
      this.instance.speed = 0
    }
  }

  initScrollBar() {
    this.scrollbar = document.createElement('span')
    this.scrollbarThumb = document.createElement('span')
    this.scrollbar.classList.add(`${this.scrollbarClass}`)
    this.scrollbarThumb.classList.add(`${this.scrollbarClass}_thumb`)

    this.scrollbar.append(this.scrollbarThumb)
    // if (this.el) {
    //   this.el.append(this.scrollbar)
    // } else {
    document.body.append(this.scrollbar)
    // }

    // Scrollbar Events
    this.getScrollBar = this.getScrollBar.bind(this)
    this.releaseScrollBar = this.releaseScrollBar.bind(this)
    this.moveScrollBar = this.moveScrollBar.bind(this)

    this.scrollbarThumb.addEventListener('mousedown', this.getScrollBar)
    window.addEventListener('mouseup', this.releaseScrollBar)
    window.addEventListener('mousemove', this.moveScrollBar)

    // Set scrollbar values
    this.reinitScrollBar()
  }

  reinitScrollBar() {
    this.hasScrollbar = false
    if (this.instance.limit + this.windowHeight <= this.windowHeight) {
      return
    }
    this.hasScrollbar = true

    this.scrollbarBCR = this.scrollbar.getBoundingClientRect()
    this.scrollbarHeight = this.scrollbarBCR.height
    this.scrollbarWidth = this.scrollbarBCR.width

    this.scrollbarThumb.style.height = `${
      (this.scrollbarHeight * this.scrollbarHeight) / (this.instance.limit + this.scrollbarHeight)
    }px`

    this.scrollbarThumbBCR = this.scrollbarThumb.getBoundingClientRect()
    // this.scrollBarLimit = {
    //   x: this.scrollbarWidth - this.scrollbarThumbBCR.width,
    //   y: this.scrollbarHeight - this.scrollbarThumbBCR.height,
    // }

    this.scrollBarLimit = this.scrollbarHeight - this.scrollbarThumbBCR.height
  }

  destroyScrollBar() {
    this.scrollbarThumb.removeEventListener('mousedown', this.getScrollBar)
    window.removeEventListener('mouseup', this.releaseScrollBar)
    window.removeEventListener('mousemove', this.moveScrollBar)
    this.scrollbar.remove()
  }

  getScrollBar(e) {
    this.isDraggingScrollbar = true
    this.checkScroll()
    this.html.classList.remove(this.scrollingClass)
    this.html.classList.add(this.draggingClass)
  }

  releaseScrollBar(e) {
    this.isDraggingScrollbar = false

    if (this.isScrolling) {
      this.html.classList.add(this.scrollingClass)
    }

    this.html.classList.remove(this.draggingClass)
  }

  moveScrollBar(e) {
    if (this.isDraggingScrollbar) {
      const fn = () => {
        let y = ((((e.clientY - this.scrollbarBCR.top) * 100) / this.scrollbarHeight) * this.instance.limit) / 100

        if (y > 0 && y < this.instance.limit) {
          this.instance.delta = y
        }
      }
      if (!usingSIOnly()) {
        requestAnimationFrame(fn)
      } else {
        fn()
      }
    }
  }

  transform(element, x, y, delay) {
    let transform

    if (!delay) {
      transform = `matrix3d(1,0,0.00,0,0.00,1,0.00,0,0,0,1,0,${x},${y},0,1)`
    } else {
      let start = getTranslate(element)
      let lerpX = lerp(start.x, x, delay)
      let lerpY = lerp(start.y, y, delay)

      transform = `matrix3d(1,0,0.00,0,0.00,1,0.00,0,0,0,1,0,${lerpX},${lerpY},0,1)`
    }

    element.style.webkitTransform = transform
    element.style.msTransform = transform
    element.style.transform = transform
  }

  /**
   * Scroll to a desired target.
   *
   * @param  Available options :
   *          target {node, string, "top", "bottom", int} - The DOM element we want to scroll to
   *          options {object} - Options object for additionnal settings.
   * @return {void}
   */
  scrollTo(target, options = {}) {
    // Parse options
    let offset = parseInt(options.offset) || 0 // An offset to apply on top of given `target` or `sourceElem`'s target
    const duration = !isNaN(parseInt(options.duration)) ? parseInt(options.duration) : 1000 // Duration of the scroll animation in milliseconds
    let easing = options.easing || [0.25, 0.0, 0.35, 1.0] // An array of 4 floats between 0 and 1 defining the bezier curve for the animation's easing. See http://greweb.me/bezier-easing-editor/example/
    const disableLerp = options.disableLerp ? true : false // Lerp effect won't be applied if set to true
    const callback = options.callback ? options.callback : false // function called when scrollTo completes (note that it won't wait for lerp to stabilize)

    easing = BezierEasing(...easing)

    if (target === 'top') {
      target = 0
    } else if (target === 'bottom') {
      target = this.instance.limit
    } else if (typeof target === 'number') {
      // Absolute coordinate
      target = parseInt(target)
    } else {
      console.warn('`target` parameter is not valid')
      return
    }

    offset = target + offset

    // Actual scrollto
    // ==========================================================================

    // Setup
    const scrollStart = parseFloat(this.instance.delta)
    const scrollTarget = Math.max(0, Math.min(offset, this.instance.limit)) // Make sure our target is in the scroll boundaries
    const scrollDiff = scrollTarget - scrollStart
    const render = (p) => {
      if (disableLerp) {
        // this.setScroll(this.instance.delta.x, scrollStart + scrollDiff * p)
      } else {
        this.instance.delta = scrollStart + scrollDiff * p
      }
    }

    // Prepare the scroll
    this.animatingScroll = true // This boolean allows to prevent `checkScroll()` from calling `stopScrolling` when the animation is slow (i.e. at the beginning of an EaseIn)
    this.stopScrolling() // Stop any movement, allows to kill any other `scrollTo` still happening
    this.startScrolling() // Restart the scroll

    // Start the animation loop
    const start = Date.now()
    const loop = () => {
      var p = (Date.now() - start) / duration // Animation progress

      if (p > 1) {
        // Animation ends
        render(1)
        this.animatingScroll = false

        if (duration === 0) this.update()
        if (callback) callback()
      } else {
        if (!usingSIOnly()) {
          this.scrollToRaf = requestAnimationFrame(loop)
        } else {
          this.scrollToTimeout = setTimeout(loop, 1000 / getTargetFPS())
        }

        render(easing(p))
      }
    }
    loop()
  }

  update() {
    this.setScrollLimit()
    this.updateScroll()
    this.reinitScrollBar()
    this.checkScroll(true)
  }

  startScroll() {
    this.stop = false
  }

  stopScroll() {
    this.stop = true
  }

  setScroll(y) {
    this.instance = {
      ...this.instance,
      scroll: y,
      delta: y,
      speed: 0,
    }
  }

  destroy() {
    window.removeEventListener('resize', this.checkResize, false)

    Object.keys(this.listeners).forEach((event) => {
      this.el.removeEventListener(this.namespace + event, this.checkEvent, false)
    })
    this.listeners = {}

    this.html.classList.remove(this.initClass)

    this.stopScrolling()
    this.html.classList.remove(this.smoothClass)
    this.vs.destroy()
    this.destroyScrollBar()
    window.removeEventListener('keydown', this.checkKey, false)

    if (usingSIOnly() && this.syncProc) {
      cancelSync.preRender(this.syncProc)
    }
  }

  start() {
    this.startScroll()
  }

  stop() {
    this.stopScroll()
  }

  on(event, func) {
    this.setEvents(event, func)
  }

  off(event, func) {
    this.unsetEvents(event, func)
  }

  checkResize() {
    if (!this.resizeTick) {
      this.resizeTick = true
      requestAnimationFrame(() => {
        this.resize()
        this.resizeTick = false
      })
    }
  }

  initEvents() {
    this.setScrollTo = this.setScrollTo.bind(this)
  }

  setScrollTo(event) {
    event.preventDefault()

    this.scrollTo(
      event.currentTarget.getAttribute(`data-${this.name}-href`) || event.currentTarget.getAttribute('href'),
      {
        offset: event.currentTarget.getAttribute(`data-${this.name}-offset`),
      }
    )
  }

  dispatchScroll() {
    if (this.handleScroll) {
      this.handleScroll(this.instance)
    } else {
      const scrollEvent = new Event(this.namespace + 'scroll')
      this.el.dispatchEvent(scrollEvent)
    }
  }

  setEvents(event, func) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }

    const list = this.listeners[event]
    list.push(func)

    if (list.length === 1) {
      this.el.addEventListener(this.namespace + event, this.checkEvent, false)
    }
  }

  unsetEvents(event, func) {
    if (!this.listeners[event]) return

    const list = this.listeners[event]
    const index = list.indexOf(func)

    if (index < 0) return

    list.splice(index, 1)

    if (list.index === 0) {
      this.el.removeEventListener(this.namespace + event, this.checkEvent, false)
    }
  }

  checkEvent(event) {
    const name = event.type.replace(this.namespace, '')
    const list = this.listeners[name]

    if (!list || list.length === 0) return

    list.forEach((func) => {
      switch (name) {
        case 'scroll':
          return func(this.instance)
        case 'call':
          return func(this.callValue, this.callWay, this.callObj)
        default:
          return func()
      }
    })
  }
}
