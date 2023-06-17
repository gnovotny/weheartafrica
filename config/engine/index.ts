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
import { RENDERER_STRATEGY, EngineConfig } from '@lib/engine/settings/types'

const CONFIG: EngineConfig = {
  baseCellMargin: 30,
  dev: {
    stats: false,
    gameStats: false,
    gui: false,
  },
  simulation: {
    pageTransitionDuration: 1700,
    webWorker: false,
    cols: 12,
    rows: 12,
    adaptPositionsDefault: false,
    clipper: {
      margin: {
        base: {
          x: -30,
          y: 30,
        },
        md: {
          x: -50,
          y: 30,
        },
      },
    },
  },
  features: {
    sites: false,
    centroids: false,
    points: false,
    media: true,
    dom: true,
    textures: {
      base: false,
      md: true,
    },
    corners: {
      base: false,
      md: true,
    },
    animatedTextures: true,
    labelCentroid: false,
    displacement: {
      base: false,
      md: true,
    },
  },
  visuals: {
    mode: VISUALS_MODE.OUTLINE,
    media: {
      postWrapper: {
        base: false,
        md: true,
      },
      tintColor: {
        md: 0xf0ece1,
      },
      outline: {
        color: {
          base: 0xeeeeee,
          md: 0xf0ece1,
        },
        width: {
          // base: 20,
          md: 15,
          lg: 20,
        },
      },
      scale: {
        md: 0.9,
      },

      polyRadius: {
        base: undefined,
        md: 80,
      },
      isolatedCanvas: false,
      tmpFilterFlag: false,
    },
    outline: {
      mode: OUTLINE_MODE.LINE_STYLE,
      lineStyleModeNoFill: true,
      styles: {
        base: [
          {
            color: 0xffffff,
            width: 40,
          },
          {
            color: 0x1a1a1e,
            width: 1,
          },
        ],
        md: [
          {
            color: 0xffffff,
            width: {
              base: 20,
            },
            alpha: 0.8,
          },
          {
            color: 0x1a1a1e,
            width: {
              base: 1,
            },
          },
        ],
      },
    },
    shadow: {
      dynamic: false,
      colorOutline: 0xc8c8c8,
      colorDark: 0xb4b4b4,
      colorLight: 0xffffff,
    },
    noise: {
      enabled: {
        md: false,
      },
      mode: NOISE_MODE.RENDERER,
    },
  },
  manipulation: {
    strategy: MANIPULATION_STRATEGY.GEOMETRY,
    geometry: {
      usesRelativePoints: {
        base: false,
        md: true,
      },
      curve: GEOMETRY_CURVE_METHOD.EMPTY,
      baseRadius: {
        base: 60,
        md: 80,
      },
      scaleMode: GEOMETRY_SCALE_MODE.RENDERER,
    },
  },
  pointerInteractions: {
    enabled: {
      base: false,
      md: true,
    },
    mediaCellDefaultExpansionEnabled: true,
    cellDefaultInteractivityEnabled: false,
    mediaCellDefaultInteractivityEnabled: true,
    mode: POINTER_INTERACTIONS_MODE.RENDERER,
    throttleRate: 250,
    debounceRate: 500,
  },
  renderer: {
    maxFPS: 60,
    devicePixelRatioFactor: 1,
    smoothGeometry: false,
    strategy: RENDERER_STRATEGY.SI_ONLY,
    ticker: RENDERER_TICKER.FRAME_SYNC,
    antialias: false,
  },
}

export default CONFIG
