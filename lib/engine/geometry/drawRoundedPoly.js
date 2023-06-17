import { LINE_CAP, LINE_JOIN } from '@pixi/graphics'
import { Point } from '@pixi/math'

import getConfig from '@lib/engine/settings'
import { getCurrentMaxBreakpointValue } from '@lib/engine/settings/utils'

import { getClippingBbox, getRouterPathname, getRouterPreviousPathname, getScrollData } from '../../state'

const radsToDegrees = (rads) => {
  return rads * (180 / Math.PI)
}

export const drawRoundedPolyArc = (graphics, points, radius, pointsGraphics = null) => {
  var i, x, y, len, p1, p2, p3, v1, v2, sinA, sinA90, radDirection, drawDirection, angle, halfAngle, cRadius, lenOut
  cRadius = radius

  var asVec = function (p, pp, v) {
    v.x = pp.x - p.x
    v.y = pp.y - p.y
    v.len = Math.sqrt(v.x * v.x + v.y * v.y)
    v.nx = v.x / v.len
    v.ny = v.y / v.len
    v.ang = Math.atan2(v.ny, v.nx)
  }
  v1 = {}
  v2 = {}
  len = points.length
  p1 = points[len - 1]
  for (i = 0; i < len; i++) {
    p2 = points[i % len]
    p3 = points[(i + 1) % len]
    asVec(p2, p1, v1)
    asVec(p2, p3, v2)
    sinA = v1.nx * v2.ny - v1.ny * v2.nx
    sinA90 = v1.nx * v2.nx - v1.ny * -v2.ny
    angle = Math.asin(sinA)
    radDirection = 1
    drawDirection = false
    if (sinA90 < 0) {
      if (angle < 0) {
        angle = Math.PI + angle
      } else {
        angle = Math.PI - angle
        radDirection = -1
        drawDirection = true
      }
    } else {
      if (angle > 0) {
        radDirection = -1
        drawDirection = true
      }
    }

    // const angleDegrees = radsToDegrees(angle)
    // if (sinA90 >= 0) {
    //   cRadius = cRadius / 2
    // }

    // cRadius = Math.abs(cRadius / ((Math.PI / angle)))

    halfAngle = angle / 2
    lenOut = Math.abs((Math.cos(halfAngle) * cRadius) / Math.sin(halfAngle))
    if (lenOut > Math.min(v1.len / 2, v2.len / 2)) {
      lenOut = Math.min(v1.len / 2, v2.len / 2)
      cRadius = Math.abs((lenOut * Math.sin(halfAngle)) / Math.cos(halfAngle))
    } else {
      cRadius = cRadius
    }

    // cRadius = radius
    // cRadius = Math.max(cRadius, radius / 4)

    // console.log('cRadius', cRadius)

    x = p2.x + v2.nx * lenOut
    y = p2.y + v2.ny * lenOut
    x += -v2.ny * cRadius * radDirection
    y += v2.nx * cRadius * radDirection
    graphics.arc(
      x,
      y,
      cRadius,
      v1.ang + (Math.PI / 2) * radDirection,
      v2.ang - (Math.PI / 2) * radDirection,
      drawDirection
    )
    p1 = p2
    p2 = p3

    // pointsGraphics.drawCircle(x, y, 4)
    // pointsGraphics.drawCircle(p3.x, p3.y, 4)

    if (getConfig().features.points && pointsGraphics) {
      pointsGraphics.beginFill(0x0000ff)
      pointsGraphics.drawCircle(p1.x, p1.y, 4)
      pointsGraphics.beginFill(0xff0000)
      pointsGraphics.drawCircle(x, y, 4)
      pointsGraphics.endFill()
      pointsGraphics.lineStyle(1, 0xff0000, 1, 1, false)
      pointsGraphics.drawCircle(x, y, cRadius)
      // pointsGraphics.beginFill(0x0000ff)
      // pointsGraphics.drawCircle(ctrl.x, ctrl.y, 2)
    }
  }
  graphics.closePath()
}

export const pointDistance = (p1, p2) => Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2)

const lerp = (a, b, x) => a + (b - a) * x

const lerp2D = (p1, p2, t) => ({
  x: lerp(p1.x, p2.x, t),
  y: lerp(p1.y, p2.y, t),
})

/**
 * Draws a polygon with rounded corners
 * @param {PIXI.Graphics} graphics The canvas context
 * @param {Array} points A list of `{x, y}` points
 * @param radius
 * @param pointsGraphics
 * @radius {number} how much to round the corners
 */
export const drawRoundedPolyQuadraticOld = (graphics, points, radius, pointsGraphics = null) => {
  const numPoints = points.length

  let skipNextPoint = false

  let corners = []

  let i = 0

  if (numPoints > 3) {
    let prevLength = pointDistance(points[(i + 1) % numPoints], points[i % numPoints])
    if (prevLength < radius / 2) {
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
    if (numPoints > 3 && nextLength < radius / 2) {
      // const intersectionPoint = intersect(
      //   lastPoint.x,
      //   lastPoint.y,
      //   thisPoint.x,
      //   thisPoint.y,
      //   nextPoint.x,
      //   nextPoint.y,
      //   nextX2Point.x,
      //   nextX2Point.y
      // )

      skipNextPoint = true

      let lastEdgeLength = pointDistance(lastPoint, thisPoint)
      let lastOffsetDistance = Math.min(lastEdgeLength / 2, radius)
      let start = lerp2D(thisPoint, lastPoint, lastOffsetDistance / lastEdgeLength)

      let nextEdgeLength = pointDistance(nextX2Point, nextPoint)
      let nextOffsetDistance = Math.min(nextEdgeLength / 2, radius)
      let end = lerp2D(nextPoint, nextX2Point, nextOffsetDistance / nextEdgeLength)

      // const newControlPoint = lerp2D(midPoint, intersectionPoint, Math.min(nextEdgeLength / radius, 1))

      const midPoint = lerp2D(thisPoint, nextPoint, 0.5)
      // https://math.stackexchange.com/questions/1666026/find-the-control-point-of-quadratic-bezier-curve-having-only-the-end-points
      const bezierControlPoint = new Point(
        2 * midPoint.x - 0.5 * start.x - 0.5 * end.x,
        2 * midPoint.y - 0.5 * start.y - 0.5 * end.y
      )
      const newControlPoint = lerp2D(midPoint, bezierControlPoint, (nextLength / radius) * 2)

      corners.push([start, newControlPoint, end])

      if (getConfig().features.points && pointsGraphics) {
        pointsGraphics.beginFill(0xffff00)
        pointsGraphics.drawCircle(thisPoint.x, thisPoint.y, 4)
        pointsGraphics.beginFill(0xeeee00)
        pointsGraphics.drawCircle(nextPoint.x, nextPoint.y, 5)

        pointsGraphics.beginFill(0x000000)
        pointsGraphics.drawCircle(bezierControlPoint.x, bezierControlPoint.y, 5)
      }
    } else {
      let lastEdgeLength = pointDistance(lastPoint, thisPoint)
      let lastOffsetDistance = Math.min(lastEdgeLength / 2, radius)
      let start = lerp2D(thisPoint, lastPoint, lastOffsetDistance / lastEdgeLength)

      let nextEdgeLength = pointDistance(nextPoint, thisPoint)
      let nextOffsetDistance = Math.min(nextEdgeLength / 2, radius)
      let end = lerp2D(thisPoint, nextPoint, nextOffsetDistance / nextEdgeLength)

      corners.push([start, thisPoint, end])
    }
  }

  graphics.moveTo(corners[0][0].x, corners[0][0].y)
  for (let [start, ctrl, end] of corners) {
    start && graphics.lineTo(start.x, start.y)
    ctrl && end && graphics.quadraticCurveTo(ctrl.x, ctrl.y, end.x, end.y)

    if (getConfig().features.points && pointsGraphics) {
      if (end) {
        pointsGraphics.beginFill(0x00ff00)
        pointsGraphics.drawCircle(end.x, end.y, 6)
      }

      if (start) {
        pointsGraphics.beginFill(0xff0000)
        pointsGraphics.drawCircle(start.x, start.y, 4)
      }

      if (ctrl) {
        pointsGraphics.beginFill(0x0000ff)
        pointsGraphics.drawCircle(ctrl.x, ctrl.y, 2)
      }
    }
  }

  graphics.closePath()
}

const getBezierPoint = (start, ctrl, end, t) =>
  new Point(
    Math.pow(1 - t, 2) * start.x + 2 * (1 - t) * t * ctrl.x + Math.pow(t, 2) * end.x,
    Math.pow(1 - t, 2) * start.y + 2 * (1 - t) * t * ctrl.y + Math.pow(t, 2) * end.y
  )

const getBezierCtrlPointByT = (start, end, point, t) =>
  new Point(2 * point.x - t * start.x - t * end.x, 2 * point.y - t * start.y - t * end.y)

/**
 * Draws a polygon with rounded corners
 * @param {PIXI.Graphics | PIXI.Graphics[]} graphics The canvas context
 * @param {Array} points A list of `{x, y}` points
 * @param radius
 * @param pointsGraphics
 * @radius {number} how much to round the corners
 */
export const drawRoundedPolyQuadratic = (
  graphics,
  points,
  radius,
  { pointsGraphics = null, originalPoints = null, useBoundaries = false } = {}
) => {
  const numPoints = points.length

  let skipNextPoint = false

  let corners = []

  let i = 0

  // const minLength = Math.min(radius / 4, 40)
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
      corners.push([start, lerpedCP1, bezier05Point])

      const bezierControlPoint2 = getBezierCtrlPointByT(bezier05Point, end, bezier075Point, 0.5)
      const lerpedCP2 = lerp2D(bezierControlPoint2, nextPoint, nextLength / minLength)
      corners.push([bezier05Point, lerpedCP2, end])

      if (pointsGraphics) {
        pointsGraphics.beginFill(0xffff00)
        pointsGraphics.drawCircle(thisPoint.x, thisPoint.y, 4)
        pointsGraphics.beginFill(0xeeee00)
        pointsGraphics.drawCircle(nextPoint.x, nextPoint.y, 5)

        pointsGraphics.beginFill(0x000000)
        pointsGraphics.drawCircle(bezierControlPoint.x, bezierControlPoint.y, 5)

        pointsGraphics.beginFill(0xffffff)
        pointsGraphics.drawCircle(midPoint.x, midPoint.y, 5)
      }
    } else {
      let lastEdgeLength = pointDistance(lastPoint, thisPoint)
      let lastOffsetDistance = Math.min(lastEdgeLength / 2, radius)
      let start = lerp2D(thisPoint, lastPoint, lastOffsetDistance / lastEdgeLength)

      let nextEdgeLength = pointDistance(nextPoint, thisPoint)
      let nextOffsetDistance = Math.min(nextEdgeLength / 2, radius)
      let end = lerp2D(thisPoint, nextPoint, nextOffsetDistance / nextEdgeLength)

      corners.push([start, thisPoint, end])
    }
  }

  const graphicsSet = Array.isArray(graphics) ? graphics : [graphics]

  graphicsSet.forEach((g) => g?.moveTo(corners[0][0].x, corners[0][0].y))

  for (let [start, ctrl, end] of corners) {
    start && graphicsSet.forEach((g) => g?.lineTo(start.x, start.y))
    ctrl && end && graphicsSet.forEach((g) => g?.quadraticCurveTo(ctrl.x, ctrl.y, end.x, end.y))

    if (pointsGraphics) {
      if (end) {
        pointsGraphics.beginFill(0x00ff00)
        pointsGraphics.drawCircle(end.x, end.y, 6)
      }

      if (start) {
        pointsGraphics.beginFill(0xff0000)
        pointsGraphics.drawCircle(start.x, start.y, 4)
      }

      if (ctrl) {
        pointsGraphics.beginFill(0x0000ff)
        pointsGraphics.drawCircle(ctrl.x, ctrl.y, 2)
      }
    }
  }

  graphicsSet.forEach((g) => g?.closePath())
}

/**
 * Draws a polygon with rounded corners
 * @param {PIXI.Graphics | PIXI.Graphics[]} graphics The canvas context
 * @param {Array} points A list of `{x, y}` points
 * @param radius
 * @param pointsGraphics
 * @radius {number} how much to round the corners
 */
export const drawRoundedPolyCutCorners = (
  graphics,
  points,
  radius,
  { pointsGraphics = null, originalPoints = null, useBoundaries = false } = {}
) => {
  const numPoints = points.length

  let skipNextPoint = false

  let corners = []

  let i = 0

  // const minLength = Math.min(radius / 4, 40)
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
      // https://math.stackexchange.com/questions/1666026/find-the-control-point-of-quadratic-bezier-curve-having-only-the-end-points
      const newControlPoint = lerp2D(midPoint, midPoint2, nextLength / minLength)

      corners.push([start, null, newControlPoint])

      corners.push([newControlPoint, null, end])

      // if (pointsGraphics) {
      //   pointsGraphics.beginFill(0xffff00)
      //   pointsGraphics.drawCircle(thisPoint.x, thisPoint.y, 4)
      //   pointsGraphics.beginFill(0xeeee00)
      //   pointsGraphics.drawCircle(nextPoint.x, nextPoint.y, 5)
      //
      //   pointsGraphics.beginFill(0x000000)
      //   pointsGraphics.drawCircle(bezierControlPoint.x, bezierControlPoint.y, 5)
      //
      //   pointsGraphics.beginFill(0xffffff)
      //   pointsGraphics.drawCircle(midPoint.x, midPoint.y, 5)
      // }
    } else {
      let lastEdgeLength = pointDistance(lastPoint, thisPoint)
      let lastOffsetDistance = Math.min(lastEdgeLength / 2, radius)
      let start = lerp2D(thisPoint, lastPoint, lastOffsetDistance / lastEdgeLength)

      let nextEdgeLength = pointDistance(nextPoint, thisPoint)
      let nextOffsetDistance = Math.min(nextEdgeLength / 2, radius)
      let end = lerp2D(thisPoint, nextPoint, nextOffsetDistance / nextEdgeLength)

      corners.push([start, null, end])
    }

    if (pointsGraphics) {
      pointsGraphics.beginFill(0x000000)
      pointsGraphics.drawCircle(thisPoint.x, thisPoint.y, 4)
      pointsGraphics.beginFill(0xeeee00)
      pointsGraphics.drawCircle(nextPoint.x, nextPoint.y, 5)
    }
  }

  const graphicsSet = Array.isArray(graphics) ? graphics : [graphics]

  graphicsSet.forEach((g) => g?.moveTo(corners[0][0].x, corners[0][0].y))

  for (let [start, ctrl, end] of corners) {
    start && graphicsSet.forEach((g) => g?.lineTo(start.x, start.y))
    // ctrl && graphicsSet.forEach((g) => g?.lineTo(ctrl.x, ctrl.y))
    end && graphicsSet.forEach((g) => g?.lineTo(end.x, end.y))

    if (pointsGraphics) {
      if (end) {
        pointsGraphics.beginFill(0x00ff00)
        pointsGraphics.drawCircle(end.x, end.y, 6)
      }

      if (start) {
        pointsGraphics.beginFill(0xff0000)
        pointsGraphics.drawCircle(start.x, start.y, 4)
      }

      if (ctrl) {
        pointsGraphics.beginFill(0x0000ff)
        pointsGraphics.drawCircle(ctrl.x, ctrl.y, 2)
      }
    }
  }

  graphicsSet.forEach((g) => g?.closePath())
}

const getVectorDimensionClippingEdge = (a, b, min, max) => {
  // return a === b && (a === min || a === max)
  //
  if (a === b) {
    if (a === min) return 'start'
    if (a === max) return 'end'
  }
}

const getVectorClippingEdge = (p1, p2, totalOffset = 0) => {
  const onClippingEdgeY = getVectorDimensionClippingEdge(
    p1.y,
    p2.y,
    getClippingBbox().minY + totalOffset,
    getClippingBbox().maxY - totalOffset
  )
  if (onClippingEdgeY) {
    if (onClippingEdgeY === 'start') {
      return 'top'
    } else {
      return 'bottom'
    }
  }

  const onClippingEdgeX = getVectorDimensionClippingEdge(
    p1.x,
    p2.x,
    getClippingBbox().minX + totalOffset,
    getClippingBbox().maxX - totalOffset
  )
  if (onClippingEdgeX) {
    if (onClippingEdgeX === 'start') {
      return 'left'
    } else {
      return 'right'
    }
  }
}

const getVerticeDimensionClippingEdge = (a, min, max, label) => {
  // if (label === 'y') {
  //   if (Math.abs(a - min) < 100) {
  //     console.log('a', a, 'min', min)
  //   }
  // }

  // @Todo hack because of inaccuracies (was worse when cells were being processed before clipping bbox update)
  if (Math.abs(a - min) < 1) return 'start'
  if (Math.abs(a - max) < 1) return 'end'
}

const getVecticeClippingEdges = (p1, totalOffset = 0) => {
  const onClippingEdgeY = getVerticeDimensionClippingEdge(
    p1.y,
    getClippingBbox().minY + totalOffset,
    getClippingBbox().maxY - totalOffset,
    'y'
  )
  const onClippingEdgeX = getVerticeDimensionClippingEdge(
    p1.x,
    getClippingBbox().minX + totalOffset,
    getClippingBbox().maxX - totalOffset,
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
 * @param {PIXI.Graphics} graphics The canvas context
 * @param {Array} points A list of `{x, y}` points
 * @param radius
 * @param originalPoints for when the points have been modified
 * @param absolutePoints
 * @param absolutePoints
 * @param totalOffset
 * @param skipClippingEdges
 * @param totalOffset
 * @radius {number} how much to round the corners
 */
export const drawRoundedPolyEmptyCorners = (
  graphics,
  points,
  radius,
  absolutePoints = null,
  skipClippingEdges = false,
  cell
) => {
  const numPoints = points.length

  let calcClippingEdges = false

  if (
    (getRouterPathname() === '/' || getRouterPreviousPathname() === '/') &&
    getScrollData()?.position < 300 &&
    ['hero', 'gulugufe', 'antomwe'].includes(cell.getCellId())
  ) {
    calcClippingEdges = true
  }

  let corners = []
  for (let i = 0; i <= numPoints; i++) {
    let lastPointIndex = i % numPoints
    let lastPoint = points[lastPointIndex]
    let lastAbsPoint = absolutePoints?.[lastPointIndex] || lastPoint
    let thisPointIndex = (i + 1) % numPoints
    let thisPoint = points[thisPointIndex]
    let thisAbsPoint = absolutePoints?.[thisPointIndex] || thisPoint
    let nextPointIndex = (i + 2) % numPoints
    let nextPoint = points[nextPointIndex]
    let nextAbsPoint = absolutePoints?.[nextPointIndex] || nextPoint

    let thisPointClippingEdges
    let lastPointClippingEdges
    let nextPointClippingEdges
    if (calcClippingEdges) {
      thisPointClippingEdges = getVecticeClippingEdges(thisAbsPoint)
      lastPointClippingEdges = getVecticeClippingEdges(lastAbsPoint)
      nextPointClippingEdges = getVecticeClippingEdges(nextAbsPoint)
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

    const isSkippableClippingEdge = skipClippingEdges && getVectorClippingEdge(lastAbsPoint, thisAbsPoint)

    corners.push([!isSkippableClippingEdge ? start : null, thisAbsPoint, end, thisPointClippingEdges?.[0]])
  }

  getConfig().visuals.outline?.styles.forEach((style, index) => {
    graphics.lineStyle({
      alignment: index,
      width: getCurrentMaxBreakpointValue(style.width),
      color: style.color,
      join: LINE_JOIN.ROUND,
      cap: LINE_CAP.ROUND,
      // color: 0x000000,
      // native: true,
      // alpha: 1,
    })

    corners[0][0] && graphics.moveTo(corners[0][0].x, corners[0][0].y)
    for (let [start, , end] of corners) {
      start && graphics.lineTo(start.x, start.y)
      end && graphics.moveTo(end.x, end.y)
    }
  })

  return corners
}

/**
 * Draws a polygon with rounded corners
 * @param {PIXI.Graphics} graphics The canvas context
 * @param {Array} points A list of `{x, y}` points
 * @param radius
 * @param pointsGraphics
 * @radius {number} how much to round the corners
 */
export const drawRoundedPolyCubic = (graphics, points, radius, pointsGraphics = null) => {
  const numPoints = points.length

  let skipNextPoint = false

  let corners = []

  let i = 0

  const minLength = Math.min(radius / 4, 40)

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
      // const intersectionPoint = intersect(
      //   lastPoint.x,
      //   lastPoint.y,
      //   thisPoint.x,
      //   thisPoint.y,
      //   nextPoint.x,
      //   nextPoint.y,
      //   nextX2Point.x,
      //   nextX2Point.y
      // )

      skipNextPoint = true

      let lastEdgeLength = pointDistance(lastPoint, thisPoint)
      let lastOffsetDistance = Math.min(lastEdgeLength / 2, radius)
      let start = lerp2D(thisPoint, lastPoint, lastOffsetDistance / lastEdgeLength)

      let nextEdgeLength = pointDistance(nextX2Point, nextPoint)
      let nextOffsetDistance = Math.min(nextEdgeLength / 2, radius)
      let end = lerp2D(nextPoint, nextX2Point, nextOffsetDistance / nextEdgeLength)

      // https://math.stackexchange.com/questions/1666026/find-the-control-point-of-quadratic-bezier-curve-having-only-the-end-points
      const bezierControlPoint = new Point(
        (-5 * start.x + 18 * thisPoint.x - 9 * nextPoint.x + 2 * end.x) / 6,
        (-5 * start.y + 18 * thisPoint.y - 9 * nextPoint.y + 2 * end.y) / 6
      )
      const bezierControlPoint2 = new Point(
        (2 * start.x - 9 * thisPoint.x + 18 * nextPoint.x - 5 * end.x) / 6,
        (2 * start.y - 9 * thisPoint.y + 18 * nextPoint.y - 5 * end.y) / 6
      )
      // const newControlPoint1 = lerp2D(thisPoint, bezierControlPoint, (nextLength / radius) * 4)
      // const newControlPoint2 = lerp2D(nextPoint, bezierControlPoint2, (nextLength / radius) * 4)

      const newControlPoint1 = lerp2D(thisPoint, bezierControlPoint, nextLength / minLength)
      const newControlPoint2 = lerp2D(nextPoint, bezierControlPoint2, nextLength / minLength)

      corners.push([start, newControlPoint1, newControlPoint2, end])

      if (getConfig().features.points && pointsGraphics) {
        pointsGraphics.beginFill(0xffff00)
        pointsGraphics.drawCircle(thisPoint.x, thisPoint.y, 4)
        pointsGraphics.beginFill(0xeeee00)
        pointsGraphics.drawCircle(nextPoint.x, nextPoint.y, 5)

        pointsGraphics.beginFill(0x000000)
        pointsGraphics.drawCircle(bezierControlPoint.x, bezierControlPoint.y, 5)
        pointsGraphics.drawCircle(bezierControlPoint2.x, bezierControlPoint2.y, 5)
      }
    } else {
      let lastEdgeLength = pointDistance(lastPoint, thisPoint)
      let lastOffsetDistance = Math.min(lastEdgeLength / 2, radius)
      let start = lerp2D(thisPoint, lastPoint, lastOffsetDistance / lastEdgeLength)

      let nextEdgeLength = pointDistance(nextPoint, thisPoint)
      let nextOffsetDistance = Math.min(nextEdgeLength / 2, radius)
      let end = lerp2D(thisPoint, nextPoint, nextOffsetDistance / nextEdgeLength)

      corners.push([start, thisPoint, thisPoint, end])
    }
  }

  graphics.moveTo(corners[0][0].x, corners[0][0].y)
  for (let [start, ctrl, ctrl2, end] of corners) {
    start && graphics.lineTo(start.x, start.y)
    ctrl && ctrl2 && end && graphics.bezierCurveTo(ctrl.x, ctrl.y, ctrl2.x, ctrl2.y, end.x, end.y)

    if (getConfig().features.points && pointsGraphics) {
      if (end) {
        pointsGraphics.beginFill(0x00ff00)
        pointsGraphics.drawCircle(end.x, end.y, 6)
      }

      if (start) {
        pointsGraphics.beginFill(0xff0000)
        pointsGraphics.drawCircle(start.x, start.y, 4)
      }

      if (ctrl) {
        pointsGraphics.beginFill(0x0000ff)
        pointsGraphics.drawCircle(ctrl.x, ctrl.y, 2)
      }

      if (ctrl2) {
        pointsGraphics.beginFill(0x0000ff)
        pointsGraphics.drawCircle(ctrl2.x, ctrl2.y, 2)
      }
    }
  }

  graphics.closePath()
}

// line intercept math by Paul Bourke http://paulbourke.net/geometry/pointlineplane/
// Determine the intersection point of two line segments
// Return FALSE if the lines don't intersect
function intersect(x1, y1, x2, y2, x3, y3, x4, y4) {
  // Check if none of the lines are of length 0
  if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
    return false
  }

  const denominator = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1)

  // Lines are parallel
  if (denominator === 0) {
    return false
  }

  let ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator
  let ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator

  // is the intersection along the segments
  // if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
  //   return false
  // }

  // Return a object with the x and y coordinates of the intersection
  let x = x1 + ua * (x2 - x1)
  let y = y1 + ua * (y2 - y1)

  return new Point(x, y)
}
