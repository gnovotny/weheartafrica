import {
  GEOMETRY_CURVE_METHOD,
  GEOMETRY_SCALE_MODE,
  MANIPULATION_STRATEGY,
  NOISE_MODE,
  OUTLINE_MODE,
  POINTER_INTERACTIONS_MODE,
  RENDERER_TICKER,
  VISUALS_MODE,
} from '@lib/engine/settings/enums'
import { Generic2D, EngineBreakpointValue } from '@lib/engine/types'

export const enum RENDERER_STRATEGY {
  RAF_ONLY = 'raf-only',
  RAF_SI = 'raf-si',
  SI_ONLY = 'si-only',
}

export type OutlineLineStyle = {
  color: number | EngineBreakpointValue<number>
  width: number | EngineBreakpointValue<number>
  alpha?: number
  native?: boolean
  alignment?: 0 | 1 | 0.5 | EngineBreakpointValue<0 | 1 | 0.5>
}

export type OutlineLineStyleOptions = {
  range: [number, number] | EngineBreakpointValue<[number, number]>
  widths: Array<number | EngineBreakpointValue<number>>
  colors: number[]
}

export type EngineConfig = {
  experimental?: {
    customClip?: boolean
    customClipLogoUrl?: string
  }
  baseCellMargin: number
  dev?: {
    gameStats?: boolean
    stats?: boolean
    gui?: boolean
  }
  simulation: {
    cols: number
    rows: number
    pageTransitionDuration?: number
    adaptPositionsDefault?: boolean
    webWorker?: boolean
    clipper?: {
      margin?: EngineBreakpointValue<Generic2D>
    }
  }
  features: {
    sites?: boolean
    centroids?: boolean
    points?: boolean
    media: boolean
    labelCentroid?: boolean
    dom: boolean
    textures?: EngineBreakpointValue<boolean> | boolean
    corners?: EngineBreakpointValue<boolean> | boolean
    animatedTextures?: EngineBreakpointValue<boolean> | boolean
    displacement?: EngineBreakpointValue<boolean> | boolean
  }
  visuals: {
    mode: VISUALS_MODE
    fillColor?: number
    media?: {
      noise?: boolean
      postWrapper?: boolean | EngineBreakpointValue<boolean>
      tintColor?: number | EngineBreakpointValue<number>
      outline?: OutlineLineStyle
      polyOffset?: number | EngineBreakpointValue<number>
      polyRadius?: number | EngineBreakpointValue<number>
      scale?: EngineBreakpointValue<number>
      isolatedCanvas?: boolean
      tmpFilterFlag?: boolean
    }
    outline?: {
      mode: OUTLINE_MODE
      lineStyleModeNoFill?: boolean
      styles?: OutlineLineStyle[] | EngineBreakpointValue<OutlineLineStyle[]>
      stylesOptions?: OutlineLineStyleOptions | EngineBreakpointValue<OutlineLineStyleOptions>
    }
    shadow?: {
      dynamic?: boolean
      colorOutline: number
      colorDark: number
      colorLight: number
    }
    noise?: {
      enabled: boolean | EngineBreakpointValue<boolean>
      mode: NOISE_MODE
    }
  }
  manipulation: {
    strategy: MANIPULATION_STRATEGY
    geometry: {
      usesRelativePoints?: boolean | EngineBreakpointValue<boolean>
      curve: GEOMETRY_CURVE_METHOD
      baseRadius: number | EngineBreakpointValue<number>
      scaleMode?: GEOMETRY_SCALE_MODE
    }
  }
  pointerInteractions?: {
    enabled: EngineBreakpointValue<boolean> | boolean
    mediaCellDefaultExpansionEnabled?: boolean
    cellDefaultInteractivityEnabled?: boolean
    mediaCellDefaultInteractivityEnabled?: boolean
    mode: POINTER_INTERACTIONS_MODE
    throttleRate?: number
    debounceRate?: number
  }
  renderer: {
    maxFPS: number
    devicePixelRatioFactor?: number
    smoothGeometry?: boolean
    strategy?: RENDERER_STRATEGY
    ticker?: RENDERER_TICKER
    forceCanvas?: boolean
    antialias?: boolean
    filterFixRTOffsetFactor?: number
  }
}
