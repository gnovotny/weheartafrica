/* eslint-disable */
import { InteractionManager } from '@pixi/interaction'
import { Container } from '@pixi/display'

InteractionManager.prototype.setTargetElement = function (element, resolution) {
  // setTargetElement(window, resolution)
  if (resolution === void 0) {
    resolution = 1
  }
  const self = this as any
  self.removeTickerListener()
  self.removeEvents()
  self.interactionDOMElement = document.getElementById('engineContainer')
  self.resolution = resolution
  self.addEvents()
  self.addTickerListener()
}

InteractionManager.prototype.mapPositionToPoint = function (point, x, y) {
  const self = this as any
  const rect = self.interactionDOMElement.getBoundingClientRect()
  const resolutionMultiplier = 1.0 / this.resolution
  point.x = (x - rect.left) * resolutionMultiplier
  point.y = (y - rect.top) * resolutionMultiplier
}

;(InteractionManager.prototype as any).addEvents = function () {

  const self = this as any

  if (self.eventsAdded || !self.interactionDOMElement) {
    return;
  }
  const style = self.interactionDOMElement.style;
  if (globalThis.navigator.msPointerEnabled) {
    style.msContentZooming = 'none';
    style.msTouchAction = 'none';
  }
  else if (self.supportsPointerEvents) {
    style.touchAction = 'none';
  }
  /*
   * These events are added first, so that if pointer events are normalized, they are fired
   * in the same order as non-normalized events. ie. pointer event 1st, mouse / touch 2nd
   */
  if (self.supportsPointerEvents) {
    globalThis.document.addEventListener('pointermove', self.onPointerMove, self._eventListenerOptions);
    self.interactionDOMElement.addEventListener('pointerdown', self.onPointerDown, self._eventListenerOptions);
    // pointerout is fired in addition to pointerup (for touch events) and pointercancel
    // we already handle those, so for the purposes of what we do in onPointerOut, we only
    // care about the pointerleave event
    self.interactionDOMElement.addEventListener('pointerleave', self.onPointerOut, self._eventListenerOptions);
    self.interactionDOMElement.addEventListener('pointerover', self.onPointerOver, self._eventListenerOptions);
    globalThis.addEventListener('pointercancel', self.onPointerCancel, self._eventListenerOptions);
    globalThis.addEventListener('pointerup', self.onPointerUp, self._eventListenerOptions);
  }
  else {
    globalThis.document.addEventListener('mousemove', self.onPointerMove, self._eventListenerOptions);
    self.interactionDOMElement.addEventListener('mousedown', self.onPointerDown, self._eventListenerOptions);
    self.interactionDOMElement.addEventListener('mouseout', self.onPointerOut, self._eventListenerOptions);
    self.interactionDOMElement.addEventListener('mouseover', self.onPointerOver, self._eventListenerOptions);
    globalThis.addEventListener('mouseup', self.onPointerUp, self._eventListenerOptions);
  }


  // this is the fix for touch devices
  if (!self.supportsPointerEvents && self.supportsTouchEvents) {
    self.interactionDOMElement.addEventListener('touchstart', self.onPointerDown, self._eventListenerOptions);
    self.interactionDOMElement.addEventListener('touchcancel', self.onPointerCancel, self._eventListenerOptions);
    self.interactionDOMElement.addEventListener('touchend', self.onPointerUp, self._eventListenerOptions);
    self.interactionDOMElement.addEventListener('touchmove', self.onPointerMove, self._eventListenerOptions);
  }
  self.eventsAdded = true;
};


Object.defineProperty(InteractionManager.prototype, "lastObjectRendered", {
  /**
   * Last rendered object or temp object.
   *
   * @readonly
   * @protected
   */
  get: function () {
    // return this.renderer._lastObjectRendered || this._tempDisplayObject;
    return this.renderer.baseScene || this._tempDisplayObject
  },
  enumerable: false,
  configurable: true
});

;(InteractionManager.prototype as any).onPointerComplete = function (originalEvent: { target: any }, cancelled: any, func: any) {
  const self = this as any

  let events = self.normalizeToPointerData(originalEvent);
  let eventLen = events.length;
  // if the event wasn't targeting our canvas, then consider it to be pointerupoutside
  // in all cases (unless it was a pointercancel)
  let eventAppend = originalEvent.target !== self.interactionDOMElement ? 'outside' : '';
  for (let i = 0; i < eventLen; i++) {
    let event = events[i];
    let interactionData = self.getInteractionDataForPointerId(event);
    let interactionEvent = self.configureInteractionEventForDOMEvent(self.eventData, event, interactionData);
    interactionEvent.data.originalEvent = originalEvent;
    // perform hit testing for events targeting our canvas or cancel events
    self.processInteractive(interactionEvent, self.lastObjectRendered, func, true /*cancelled || !eventAppend*/);
    self.emit(cancelled ? 'pointercancel' : "pointerup" + eventAppend, interactionEvent);
    if (event.pointerType === 'mouse' || event.pointerType === 'pen') {
      let isRightButton = event.button === 2;
      self.emit(isRightButton ? "rightup" + eventAppend : "mouseup" + eventAppend, interactionEvent);
    }
    else if (event.pointerType === 'touch') {
      self.emit(cancelled ? 'touchcancel' : "touchend" + eventAppend, interactionEvent);
      self.releaseInteractionDataForPointerId(event.pointerId);
    }
  }
};


// ;(InteractionManager.prototype as any).setCursorMode = function (mode: any) {
//
//   const self = this as any
//   mode = mode || 'default';
//   let applyStyles = true;
//   // offscreen canvas does not support setting styles, but cursor modes can be functions,
//   // in order to handle pixi rendered cursors, so we can't bail
//   if (globalThis.OffscreenCanvas && self.interactionDOMElement instanceof OffscreenCanvas) {
//     applyStyles = false;
//   }
//   // if the mode didn't actually change, bail early
//   if (self.currentCursorMode === mode) {
//     return;
//   }
//   self.currentCursorMode = mode;
//   let style = self.cursorStyles[mode];
//   // only do things if there is a cursor style for it
//   if (style) {
//     if (style === 'inherit') {
//       if (applyStyles) {
//         self.interactionDOMElement.style.cursor = 'grab';
//         // delete self.interactionDOMElement.style.cursor
//       }
//     } else {
//       switch (typeof style) {
//         case 'string':
//           // string styles are handled as cursor CSS
//           if (applyStyles) {
//             self.interactionDOMElement.style.cursor = style;
//           }
//           break;
//         case 'function':
//           // functions are just called, and passed the cursor mode
//           style(mode);
//           break;
//         case 'object':
//           // if it is an object, assume that it is a dictionary of CSS styles,
//           // apply it to the interactionDOMElement
//           if (applyStyles) {
//             Object.assign(self.interactionDOMElement.style, style);
//           }
//           break;
//       }
//     }
//
//   }
//   else if (applyStyles && typeof mode === 'string' && !Object.prototype.hasOwnProperty.call(self.cursorStyles, mode)) {
//     // if it mode is a string (not a Symbol) and cursorStyles doesn't have any entry
//     // for the mode, then assume that the dev wants it to be CSS for the cursor.
//     self.interactionDOMElement.style.cursor = mode;
//   }
// };
/* eslint-enable */
