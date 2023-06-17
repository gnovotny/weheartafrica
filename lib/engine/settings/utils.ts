import {
  GEOMETRY_SCALE_MODE,
  MANIPULATION_STRATEGY,
  NOISE_MODE,
  OUTLINE_MODE,
  VISUALS_MODE,
} from '@lib/engine/settings/enums'
import getConfig from '@lib/engine/settings/index'
import { RENDERER_STRATEGY } from '@lib/engine/settings/types'
import { EngineBreakpointValue, Generic2D } from '@lib/engine/types'
import { descendingBps, getCurrentMaxBreakpoint } from '@lib/utils/bph'
import { isClient } from '@lib/utils/common'

import { deepRenderIsScheduled, getRouterPathname, getScrollData } from '../../state'

export const usingRafOnly = () => getConfig().renderer.strategy === RENDERER_STRATEGY.RAF_ONLY
export const usingRafSI = () => getConfig().renderer.strategy === RENDERER_STRATEGY.RAF_SI
export const usingSIOnly = () => getConfig().renderer.strategy === RENDERER_STRATEGY.SI_ONLY

export const getTargetFPS = () => getConfig().renderer.maxFPS || 60

export const getDevicePixelRatio = () =>
  (isClient ? window.devicePixelRatio : 1) * (getConfig().renderer.devicePixelRatioFactor || 1)

export const isOutlineLineStyleModeWithNoFill = () =>
  getConfig().visuals.mode === VISUALS_MODE.OUTLINE &&
  getConfig().visuals.outline?.mode === OUTLINE_MODE.LINE_STYLE &&
  getConfig().visuals.outline?.lineStyleModeNoFill
export const usingMedia = () => getConfig().features.media
export const usingDom = () => getConfig().features.dom
export const usingIsolatedMediaCanvas = () => usingMedia() && getConfig().visuals.media?.isolatedCanvas
export const usingBlurStrategy = () => getConfig().manipulation.strategy === MANIPULATION_STRATEGY.BLUR
export const usingGeometryStrategy = () => getConfig().manipulation.strategy === MANIPULATION_STRATEGY.GEOMETRY
export const getGeometryCurveMethod = () => getConfig().manipulation.geometry?.curve
export const usingLineJoinStrategy = () => getConfig().manipulation.strategy === MANIPULATION_STRATEGY.LINE_JOIN
export const usingGeometricStyleStrategy = () => usingGeometryStrategy() || usingLineJoinStrategy()
export const hasGeometricRendererScaling = () =>
  getConfig().manipulation.geometry?.scaleMode === GEOMETRY_SCALE_MODE.RENDERER
export const hasGeometricOffsetScaling = () =>
  getConfig().manipulation.geometry?.scaleMode === GEOMETRY_SCALE_MODE.GEOMETRY
export const pointsHaveValidShape = (pts?: Generic2D[]) => (pts ? pts.length >= 3 : false)
export const usingPolyOffset = () =>
  usingGeometricStyleStrategy() && (hasGeometricOffsetScaling() || getConfig().visuals.media?.polyOffset)

export const usingDisplacement = () => getCurrentMaxBreakpointValue(getConfig().features.displacement)
export const usingTextures = () => getCurrentMaxBreakpointValue(getConfig().features.textures)
export const usingCorners = () => getCurrentMaxBreakpointValue(getConfig().features.corners)
export const usingAnimatedTextures = () =>
  usingTextures() && getCurrentMaxBreakpointValue(getConfig().features.animatedTextures)

export const usingNoise = () => getCurrentMaxBreakpointValue(getConfig().visuals.noise?.enabled)
export const usingDOMNoise = () => usingNoise() && getConfig().visuals.noise?.mode === NOISE_MODE.DOM
export const usingRendererNoise = () => usingNoise() && getConfig().visuals.noise?.mode === NOISE_MODE.RENDERER

export const getClipperMargin = () => getCurrentMaxBreakpointValue(getConfig().simulation.clipper?.margin)
export const hasPointerInteractions = () => getCurrentMaxBreakpointValue(getConfig().pointerInteractions?.enabled)

export function getCurrentMaxBreakpointValue<T>(bpValues: EngineBreakpointValue<T> | T) {
  if (typeof bpValues !== 'object') return bpValues as T
  const bpValuesObj = bpValues as EngineBreakpointValue<T>

  if (isClient) {
    const maxBpKey = getCurrentMaxBreakpoint()
    let bpHit = false
    for (let bpKey of descendingBps) {
      if (bpKey === maxBpKey) bpHit = true
      if (bpHit) {
        if (bpValuesObj[bpKey] !== undefined) {
          return bpValuesObj[bpKey]
        }
      }
    }
  }

  return bpValuesObj.base
}

export const canDeepRender = () =>
  deepRenderIsScheduled() || (getRouterPathname() === '/' && getScrollData()?.position < 300)

export const usesRelativePoints = () =>
  getCurrentMaxBreakpointValue(getConfig().manipulation.geometry?.usesRelativePoints)
export const getPageTransitionDuration = () => getConfig().simulation.pageTransitionDuration ?? 1700
export const getPolyRadius = () => getCurrentMaxBreakpointValue(getConfig().manipulation.geometry?.baseRadius)
export const getMediaPolyRadius = () => getCurrentMaxBreakpointValue(getConfig().visuals?.media?.polyRadius)
