import { BBox } from '@lib/engine/geometry/getBBoxByCoords'
import getConfig from '@lib/engine/settings'
import { getClipperMargin } from '@lib/engine/settings/utils'
import { EngineClipOptions, EngineClipping } from '@lib/engine/types'
import { lerp2D } from '@lib/engine/utils/lerp'
import { isSmallBreakpoint } from '@lib/utils/bph'
import { getRouterPathname } from 'lib/state'

type ClipReturn = {
  clipping: [number, number][]
  bbox: BBox
}
type BuildClipperReturn = (iv: number) => ClipReturn

export const buildClipper = (options: EngineClipOptions): BuildClipperReturn => {
  const {
    evolving = true,
    interpolationRange = [0, 1],
    scrollEmulationMarginZone = 0.1,
    dimensions,
    dimensionsRange,
    clippingRange,
  } = options

  const getRelativeValue = (value: number) => {
    const factor = Math.abs(interpolationRange[1] - interpolationRange[0])
    return factor > 0
      ? interpolationRange[0] + factor * value * (interpolationRange[1] >= interpolationRange[0] ? 1 : -1)
      : interpolationRange[0]
  }

  const clip: BuildClipperReturn = (iv: number) => {
    const relativeValue = getRelativeValue(iv)

    // clipping / margin mutations (for simulating scrolling) should occur in first/last given % of the interpolation
    const relativeStartValue = Math.min(1, relativeValue * (1 / scrollEmulationMarginZone))
    const relativeEndValue =
      relativeValue > 1 - scrollEmulationMarginZone
        ? Math.min(1, (relativeValue - (1 - scrollEmulationMarginZone)) * (1 / scrollEmulationMarginZone))
        : 0

    const { x: marginX = 0, y: marginY = 0 } = getClipperMargin() || {}

    let marginXStart: number = marginX
    let marginXEnd: number = marginX
    let marginYStart: number = marginY
    let marginYEnd: number = marginY

    if (getRouterPathname() === '/' && !isSmallBreakpoint()) {
      marginYStart = marginY * (1 - relativeStartValue * 2) * 5
      marginYEnd = marginY * (1 - relativeStartValue * 2) * 4
    } else {
      if (isSmallBreakpoint()) {
        marginYStart = -marginY
      } else {
        marginYStart = marginY * (1 - relativeStartValue * 2) * 3 * (isSmallBreakpoint() ? 0.5 : 1)
      }

      marginYEnd = -marginY * 6 * (1 - relativeEndValue)
    }

    const [width, height] = dimensionsRange ? lerp2D(...dimensionsRange, iv) : dimensions

    let clipping: EngineClipping
    const bbox: BBox = {
      minX: marginXStart,
      minY: marginYStart,
      maxX: width - marginXEnd,
      maxY: height - marginYEnd,
      width: width - marginXEnd - marginXStart,
      height: height - marginYEnd - marginYStart,
    }
    if (!getConfig().experimental?.customClip) {
      clipping = [
        [marginXStart, marginYStart],
        [marginXStart, height - marginYEnd],
        [width - marginXEnd, height - marginYEnd],
        [width - marginXEnd, marginYStart],
      ]
    } else {
      const xStart = marginXStart,
        xEnd = width - marginXStart,
        yStart = marginYStart,
        yEnd = height - marginYEnd

      let logoClipX = (xEnd / 2) * (1 - relativeStartValue)
      let logoClipY = (yEnd / 3) * (1 - relativeStartValue)

      const maxLogoClipX = Math.min(xEnd / 2, 300)
      const maxLogoClipY = Math.min(yEnd / 4, 300)

      logoClipX = logoClipX > maxLogoClipX ? maxLogoClipX : logoClipX
      logoClipY = logoClipY > maxLogoClipY ? maxLogoClipY : logoClipY

      clipping = [
        [xStart, yStart + logoClipY],
        [xStart, yEnd],
        [xEnd, yEnd],
        [xEnd, yStart],
        [xStart + logoClipX, yStart],
        [xStart + logoClipX, yStart + logoClipY],
      ]
    }

    return { clipping, bbox }
  }

  if (clippingRange) {
    return (iv: number): ClipReturn => {
      const [clipping0, clipping1] = clippingRange

      const vector0 = lerp2D(clipping0[0], clipping1[0], iv)
      const vector2 = lerp2D(clipping0[2], clipping1[2], iv)

      const bbox: BBox = {
        minX: vector0[0],
        minY: vector0[1],
        maxX: vector2[0],
        maxY: vector2[1],
        width: vector2[0] - vector0[0],
        height: vector2[1] - vector0[1],
      }

      const clipping: EngineClipping = [
        [bbox.minX, bbox.minY],
        [bbox.minX, bbox.maxY],
        [bbox.maxX, bbox.maxY],
        [bbox.maxX, bbox.minY],
      ]

      return { clipping, bbox }
    }
  }

  if (!evolving) {
    const staticClippingPolygon = clip(0)
    return () => staticClippingPolygon
  } else {
    return clip
  }
}
