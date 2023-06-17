export const enum RENDERER_TICKER {
  FRAME_SYNC = 'framesync',
}

export const enum MANIPULATION_STRATEGY {
  BLUR = 'blur',
  LINE_JOIN = 'line-join',
  GEOMETRY = 'geometry',
  NONE = 'none',
}

export const enum GEOMETRY_CURVE_METHOD {
  ARC = 'arc',
  QUADRATIC = 'quadratic',
  CUBIC = 'cubic',
  MITER = 'miter',
  EMPTY = 'empty',
  NONE = 'none',
}

export const enum VISUALS_MODE {
  OUTLINE = 'outline',
  SHADOW = 'shadow',
  NONE = 'none',
  DEV = 'dev',
}

export const enum GEOMETRY_SCALE_MODE {
  RENDERER = 'renderer',
  GEOMETRY = 'geometry',
  NONE = 'none',
}

export const enum POINTER_INTERACTIONS_MODE {
  RENDERER = 'renderer',
  DOM = 'dom',
}

export const enum NOISE_MODE {
  RENDERER = 'renderer',
  DOM = 'dom',
}

export const enum OUTLINE_MODE {
  FILTER = 'filter',
  LINE_STYLE = 'line-style',
}
