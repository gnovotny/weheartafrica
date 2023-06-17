// Declarations for modules without types
declare module 'next-themes'
declare module 'flubber'
declare module 'stats-js'
declare module 'dat.gui'
declare module 'breakpoint-helper'
declare module '@georgedoescode/vector2d' {
  export const Vector2D: any
}

declare global {
  interface Window {
    meter?: any
    FPSMeter?: any
  }
}

window.meter = window.meter || {}
window.FPSMeter = window.FPSMeter || {}

// Declarations for satic imports
declare module '*.svg' {
  const content: any
  export default content
}

declare module '*.png' {
  const content: any
  export default content
}

declare module '*.jpg' {
  const content: any
  export default content
}

declare module '*.jpeg' {
  const content: any
  export default content
}

declare module '*.gif' {
  const content: any
  export default content
}

declare module '*.mp3'
declare module '*.frag'
declare module '*.vert'

// From https://webpack.js.org/loaders/worker-loader/#loading-without-worker-loader
declare module '*.worker.ts' {
  // You need to change `Worker`, if you specified a different value for the `workerType` option
  class WebpackWorker extends Worker {
    constructor()
  }

  // Uncomment this if you set the `esModule` option to `false`
  // export = WebpackWorker;
  export default WebpackWorker
}
