import { EngineCoordinates, Generic2D } from '@lib/engine/types'

export type BBox = {
  minX: number
  minY: number
  maxX: number
  maxY: number
  width: number
  height: number
}

export const getBBoxByCoords = (cell: EngineCoordinates[]): BBox => {
  let halfedges = cell,
    iHalfedge = halfedges.length,
    minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity,
    v,
    vx,
    vy
  while (iHalfedge--) {
    v = {
      x: halfedges[iHalfedge][0],
      y: halfedges[iHalfedge][1],
    }
    vx = v.x
    vy = v.y
    if (vx < minX) {
      minX = vx
    }
    if (vy < minY) {
      minY = vy
    }
    if (vx > maxX) {
      maxX = vx
    }
    if (vy > maxY) {
      maxY = vy
    }
    // we dont need to take into account end point,
    // since each end point matches a start point
  }
  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  }
}

export const getPointsBBox = (points: Generic2D[]): BBox => getBBoxByCoords(points.map((point) => [point.x, point.y]))
