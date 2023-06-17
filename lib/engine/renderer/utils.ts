import { Point } from '@pixi/math'
import { Sprite } from '@pixi/sprite'

import { BBox } from '@lib/engine/geometry/getBBoxByCoords'
import { EngineCellData, Generic2D } from '@lib/engine/types'
import throttle from '@lib/engine/utils/throttle'
import { store } from '@lib/store'

import { currentEnginePointerEventAtom, getDimensions } from '../../state'

export function scaleToFill(sprite: Sprite, bBox: BBox, dimensions: { width: number; height: number }) {
  const { width: bboxWidth, height: bboxHeight, minX: bboxX, minY: bboxY } = bBox
  // get the scale
  const scale = Math.max(bboxWidth / dimensions.width, bboxHeight / dimensions.height)
  // get the top left position
  const scaleX = bboxWidth / 2 - (dimensions.width / 2) * scale
  const scaleY = bboxHeight / 2 - (dimensions.height / 2) * scale

  sprite.x = bboxX + scaleX
  sprite.y = bboxY + scaleY
  sprite.height = dimensions.height * scale
  sprite.width = dimensions.width * scale
}

export function betterScaleToFill(sprite: Sprite, bBox: BBox, scaleFactor: number = 1, offsetFactor: number = 0) {
  const [dimensionsWidth, dimensionsHeight] = getDimensions()
  const { width: bboxWidth, height: bboxHeight, minX: bboxX, minY: bboxY } = bBox

  const { width: baseTextureWidth, height: baseTextureHeight } = sprite.texture.baseTexture

  const scale = Math.max((bboxWidth * scaleFactor) / baseTextureWidth, (bboxHeight * scaleFactor) / baseTextureHeight)

  const width = baseTextureWidth * scale
  const height = baseTextureHeight * scale

  const scaleX = bboxWidth / 2 - width / 2
  const scaleY = bboxHeight / 2 - height / 2

  sprite.x = bboxX + scaleX - offsetFactor * dimensionsWidth
  sprite.y = bboxY + scaleY - offsetFactor * dimensionsHeight
  sprite.height = height
  sprite.width = width
}

export const handleEnginePointerEvent = (point: Generic2D, type: string, cellData?: EngineCellData) => {
  store.set(currentEnginePointerEventAtom, {
    point,
    type,
    cellData,
  })
}
export const handleEnginePointerEventThrottled: typeof handleEnginePointerEvent = throttle(
  handleEnginePointerEvent,
  200
)

export const getRelativePoints = (points: Point[], centroid: Point | undefined) =>
  points.map((point) => new Point(point.x - (centroid?.x || 0), point.y - (centroid?.y || 0)))
export const randomFromArr = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)]

export function shuffleArr(a: any[]) {
  var j, x, i
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1))
    x = a[i]
    a[i] = a[j]
    a[j] = x
  }
  return a
}
