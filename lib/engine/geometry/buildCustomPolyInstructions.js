import { Point } from '@pixi/math'

export const pointDistance = (p1, p2) => Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2)

const lerp = (a, b, x) => a + (b - a) * x

const lerp2D = (p1, p2, t) => ({
  x: lerp(p1.x, p2.x, t),
  y: lerp(p1.y, p2.y, t),
})

/**
 * build sliced corner poly insructions
 * @param {Array} points A list of `{x, y}` points
 * @param radius {number} how much to round the corners
 */
export const buildSlicedCornerPolyInstructions = (points, radius) => {
  const numPoints = points.length

  let skipNextPoint = false

  let segments = []

  let i = 0

  const minLength = radius / 2

  if (numPoints > 3) {
    let prevLength = pointDistance(points[(i + 1) % numPoints], points[i % numPoints])
    if (prevLength < minLength) {
      i = 1
    }
  }
  for (i; i < numPoints; i++) {
    let lastPoint = points[i % numPoints]
    let thisPoint = points[(i + 1) % numPoints]
    let nextPoint = points[(i + 2) % numPoints]
    let nextX2Point = points[(i + 3) % numPoints]

    if (skipNextPoint) {
      skipNextPoint = false
      continue
    }

    let nextLength = pointDistance(nextPoint, thisPoint)
    if (numPoints > 3 && nextLength < minLength) {
      skipNextPoint = true

      let lastEdgeLength = pointDistance(lastPoint, thisPoint)
      let lastOffsetDistance = Math.min(lastEdgeLength / 2, radius)
      let start = lerp2D(thisPoint, lastPoint, lastOffsetDistance / lastEdgeLength)

      let nextEdgeLength = pointDistance(nextX2Point, nextPoint)
      let nextOffsetDistance = Math.min(nextEdgeLength / 2, radius)
      let end = lerp2D(nextPoint, nextX2Point, nextOffsetDistance / nextEdgeLength)

      const midPoint = lerp2D(start, end, 0.5)
      const midPoint2 = lerp2D(thisPoint, nextPoint, 0.5)
      const newControlPoint = lerp2D(midPoint, midPoint2, nextLength / minLength)
      segments.push([start, null, newControlPoint])
      segments.push([newControlPoint, null, end])
    } else {
      let lastEdgeLength = pointDistance(lastPoint, thisPoint)
      let lastOffsetDistance = Math.min(lastEdgeLength / 2, radius)
      let start = lerp2D(thisPoint, lastPoint, lastOffsetDistance / lastEdgeLength)

      let nextEdgeLength = pointDistance(nextPoint, thisPoint)
      let nextOffsetDistance = Math.min(nextEdgeLength / 2, radius)
      let end = lerp2D(thisPoint, nextPoint, nextOffsetDistance / nextEdgeLength)

      segments.push([start, null, end])
    }
  }

  return {
    method: 'sliced',
    closePath: true,
    segments,
  }
}

const getBezierPoint = (start, ctrl, end, t) =>
  new Point(
    Math.pow(1 - t, 2) * start.x + 2 * (1 - t) * t * ctrl.x + Math.pow(t, 2) * end.x,
    Math.pow(1 - t, 2) * start.y + 2 * (1 - t) * t * ctrl.y + Math.pow(t, 2) * end.y
  )

const getBezierCtrlPointByT = (start, end, point, t) =>
  new Point(2 * point.x - t * start.x - t * end.x, 2 * point.y - t * start.y - t * end.y)

/**
 * build sliced corner poly insructions
 * @param {Array} points A list of `{x, y}` points
 * @param radius {number} how much to round the corners
 */
export const buildQuadraticPolyInstructions = (points, radius) => {
  const numPoints = points.length

  let skipNextPoint = false

  let segments = []

  let i = 0

  const minLength = radius / 2

  if (numPoints > 3) {
    let prevLength = pointDistance(points[(i + 1) % numPoints], points[i % numPoints])
    if (prevLength < minLength) {
      i = 1
    }
  }
  for (i; i < numPoints; i++) {
    let lastPoint = points[i % numPoints]
    let thisPoint = points[(i + 1) % numPoints]
    let nextPoint = points[(i + 2) % numPoints]
    let nextX2Point = points[(i + 3) % numPoints]

    if (skipNextPoint) {
      skipNextPoint = false
      continue
    }

    let nextLength = pointDistance(nextPoint, thisPoint)
    if (numPoints > 3 && nextLength < minLength) {
      skipNextPoint = true

      let lastEdgeLength = pointDistance(lastPoint, thisPoint)
      let lastOffsetDistance = Math.min(lastEdgeLength / 2, radius)
      let start = lerp2D(thisPoint, lastPoint, lastOffsetDistance / lastEdgeLength)

      let nextEdgeLength = pointDistance(nextX2Point, nextPoint)
      let nextOffsetDistance = Math.min(nextEdgeLength / 2, radius)
      let end = lerp2D(nextPoint, nextX2Point, nextOffsetDistance / nextEdgeLength)

      const midPoint = lerp2D(thisPoint, nextPoint, 0.5)
      // https://math.stackexchange.com/questions/1666026/find-the-control-point-of-quadratic-bezier-curve-having-only-the-end-points
      const bezierControlPoint = getBezierCtrlPointByT(start, end, midPoint, 0.5)
      const newControlPoint = lerp2D(midPoint, bezierControlPoint, nextLength / minLength)

      const bezier05Point = getBezierPoint(start, newControlPoint, end, 0.5)
      const bezier025Point = getBezierPoint(start, newControlPoint, end, 0.25)
      const bezier075Point = getBezierPoint(start, newControlPoint, end, 0.75)

      const bezierControlPoint1 = getBezierCtrlPointByT(start, bezier05Point, bezier025Point, 0.5)
      const lerpedCP1 = lerp2D(bezierControlPoint1, thisPoint, nextLength / minLength)
      segments.push([start, lerpedCP1, bezier05Point])

      const bezierControlPoint2 = getBezierCtrlPointByT(bezier05Point, end, bezier075Point, 0.5)
      const lerpedCP2 = lerp2D(bezierControlPoint2, nextPoint, nextLength / minLength)
      segments.push([bezier05Point, lerpedCP2, end])
    } else {
      let lastEdgeLength = pointDistance(lastPoint, thisPoint)
      let lastOffsetDistance = Math.min(lastEdgeLength / 2, radius)
      let start = lerp2D(thisPoint, lastPoint, lastOffsetDistance / lastEdgeLength)

      let nextEdgeLength = pointDistance(nextPoint, thisPoint)
      let nextOffsetDistance = Math.min(nextEdgeLength / 2, radius)
      let end = lerp2D(thisPoint, nextPoint, nextOffsetDistance / nextEdgeLength)

      segments.push([start, thisPoint, end])
    }
  }

  return {
    method: 'quadratic',
    closePath: true,
    segments,
  }
}

const getVerticeDimensionClippingEdge = (a, min, max, label) => {
  // @Todo hack because of inaccuracies (was worse when cells were being processed before clipping bbox update)
  if (Math.abs(a - min) < 1) return 'start'
  if (Math.abs(a - max) < 1) return 'end'
}

const getVecticeClippingEdges = (p1, clippingBbox, totalOffset = 0) => {
  const onClippingEdgeY = getVerticeDimensionClippingEdge(
    p1.y,
    clippingBbox.minY + totalOffset,
    clippingBbox.maxY - totalOffset,
    'y'
  )
  const onClippingEdgeX = getVerticeDimensionClippingEdge(
    p1.x,
    clippingBbox.minX + totalOffset,
    clippingBbox.maxX - totalOffset,
    'x'
  )

  const edges = []

  if (onClippingEdgeY) {
    if (onClippingEdgeY === 'start') {
      edges.push('top')
    } else {
      edges.push('bottom')
    }
  }

  if (onClippingEdgeX) {
    if (onClippingEdgeX === 'start') {
      edges.push('left')
    } else {
      edges.push('right')
    }
  }

  return edges
}

/**
 * Draws a polygon without corners
 * @param {Array} points A list of `{x, y}` points
 * @param {Array} originalPoints A list of `{x, y}` points
 * @param radius {number} how much to round the corners
 * @param calcClippingEdges
 */
export const buildEmptyCornerPolyInstructions = (
  points,
  originalPoints,
  radius,
  calcClippingEdges = false,
  clippingBbox
) => {
  const numPoints = points.length

  let segments = []
  for (let i = 0; i <= numPoints; i++) {
    let lastPointIndex = i % numPoints
    let lastPoint = points[lastPointIndex]
    let lastAbsPoint = originalPoints?.[lastPointIndex] || lastPoint
    let thisPointIndex = (i + 1) % numPoints
    let thisPoint = points[thisPointIndex]
    let thisAbsPoint = originalPoints?.[thisPointIndex] || thisPoint
    let nextPointIndex = (i + 2) % numPoints
    let nextPoint = points[nextPointIndex]
    let nextAbsPoint = originalPoints?.[nextPointIndex] || nextPoint

    let thisPointClippingEdges
    let lastPointClippingEdges
    let nextPointClippingEdges
    if (calcClippingEdges) {
      thisPointClippingEdges = getVecticeClippingEdges(thisAbsPoint, clippingBbox)
      lastPointClippingEdges = getVecticeClippingEdges(lastAbsPoint, clippingBbox)
      nextPointClippingEdges = getVecticeClippingEdges(nextAbsPoint, clippingBbox)
    }

    const thisPointIsTopEdgeOnly = thisPointClippingEdges?.length === 1 && thisPointClippingEdges?.[0] === 'top'

    const startRadius = thisPointIsTopEdgeOnly && lastPointClippingEdges?.[0] === 'top' ? radius * 1.5 : radius
    const endRadius = thisPointIsTopEdgeOnly && nextPointClippingEdges?.[0] === 'top' ? radius * 1.5 : radius

    let lastEdgeLength = pointDistance(lastPoint, thisPoint)
    let lastOffsetDistance = Math.min(lastEdgeLength / 2, startRadius)
    let start = lerp2D(thisPoint, lastPoint, lastOffsetDistance / lastEdgeLength)

    let nextEdgeLength = pointDistance(nextPoint, thisPoint)
    let nextOffsetDistance = Math.min(nextEdgeLength / 2, endRadius)
    let end = lerp2D(thisPoint, nextPoint, nextOffsetDistance / nextEdgeLength)

    segments.push({
      start,
      end,
      originalPoint: thisAbsPoint,
      clippingEdge: thisPointClippingEdges?.[0],
    })
  }

  return {
    method: 'none',
    closePath: false,
    segments,
  }
}
