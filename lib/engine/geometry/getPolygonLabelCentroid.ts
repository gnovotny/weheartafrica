import Queue from 'tinyqueue'

import { getBBoxByCoords, BBox } from '@lib/engine/geometry/getBBoxByCoords'
import { EngineCellData, EngineCoordinates } from '@lib/engine/types'

type POI = [number, number] & {
  distance?: number
}

export function getPolygonLabelCentroid(polygon: EngineCellData, bbox?: BBox, precision = 1.0, debug = false) {
  const { minX, minY, maxX, maxY, width, height } = bbox ?? getBBoxByCoords(polygon)

  let cellSize = Math.min(width, height)
  let h = cellSize / 2

  if (cellSize === 0) {
    let degeneratePoleOfInaccessibility: POI = [minX, minY]
    degeneratePoleOfInaccessibility.distance = 0
    return degeneratePoleOfInaccessibility
  }

  // a priority queue of cells in order of their "potential" (max distance to polygon)
  let cellQueue = new Queue(undefined, compareMax)

  // cover polygon with initial cells
  for (let x = minX; x < maxX; x += cellSize) {
    for (let y = minY; y < maxY; y += cellSize) {
      cellQueue.push(new PolylabelCell(x + h, y + h, h, polygon))
    }
  }

  // take centroid as the first best guess
  let bestCell = getCentroidCell(polygon)

  // second guess: bounding box centroid
  let bboxCell = new PolylabelCell(minX + width / 2, minY + height / 2, 0, polygon)
  if (bboxCell.d > bestCell.d) bestCell = bboxCell

  let numProbes = cellQueue.length

  while (cellQueue.length) {
    // pick the most promising cell from the queue
    let cell = cellQueue.pop()

    if (!cell) continue

    // update the best cell if we found a better one
    if (cell.d > bestCell.d) {
      bestCell = cell
      if (debug) console.log('found best %f after %d probes', Math.round(1e4 * cell.d) / 1e4, numProbes)
    }

    // do not drill down further if there's no chance of a better solution
    if (cell.max - bestCell.d <= precision) continue

    // split the cell into four cells
    h = cell.h / 2
    cellQueue.push(new PolylabelCell(cell.x - h, cell.y - h, h, polygon))
    cellQueue.push(new PolylabelCell(cell.x + h, cell.y - h, h, polygon))
    cellQueue.push(new PolylabelCell(cell.x - h, cell.y + h, h, polygon))
    cellQueue.push(new PolylabelCell(cell.x + h, cell.y + h, h, polygon))
    numProbes += 4
  }

  if (debug) {
    console.log('num probes: ' + numProbes)
    console.log('best distance: ' + bestCell.d)
  }

  const poleOfInaccessibility: POI = [bestCell.x, bestCell.y]
  poleOfInaccessibility.distance = bestCell.d
  return poleOfInaccessibility
}

export default getPolygonLabelCentroid

function compareMax(a: PolylabelCell, b: PolylabelCell) {
  return b.max - a.max
}

class PolylabelCell {
  x: number
  y: number
  h: number
  d: number
  max: number

  constructor(x: number, y: number, h: number, polygon: EngineCellData) {
    this.x = x // cell center x
    this.y = y // cell center y
    this.h = h // half the cell size
    this.d = pointToPolygonDist(x, y, polygon) // distance from cell center to polygon
    this.max = this.d + this.h * Math.SQRT2 // max distance to polygon within a cell
  }
}

// signed distance from point to polygon outline (negative if point is outside)
function pointToPolygonDist(x: number, y: number, polygon: EngineCellData) {
  let inside = false
  let minDistSq = Infinity

  for (let i = 0, len = polygon.length, j = len - 1; i < len; j = i++) {
    let a = polygon[i]
    let b = polygon[j]

    if (a[1] > y !== b[1] > y && x < ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]) + a[0]) inside = !inside

    minDistSq = Math.min(minDistSq, getSegDistSq(x, y, a, b))
  }

  return minDistSq === 0 ? 0 : (inside ? 1 : -1) * Math.sqrt(minDistSq)
}

// get polygon centroid
function getCentroidCell(polygon: EngineCellData) {
  let area = 0
  let x = 0
  let y = 0
  let points = polygon

  for (let i = 0, len = points.length, j = len - 1; i < len; j = i++) {
    let a = points[i]
    let b = points[j]
    let f = a[0] * b[1] - b[0] * a[1]
    x += (a[0] + b[0]) * f
    y += (a[1] + b[1]) * f
    area += f * 3
  }
  if (area === 0) return new PolylabelCell(points[0][0], points[0][1], 0, polygon)
  return new PolylabelCell(x / area, y / area, 0, polygon)
}

// get squared distance from a point to a segment
function getSegDistSq(px: number, py: number, a: EngineCoordinates, b: EngineCoordinates) {
  let x = a[0]
  let y = a[1]
  let dx = b[0] - x
  let dy = b[1] - y

  if (dx !== 0 || dy !== 0) {
    let t = ((px - x) * dx + (py - y) * dy) / (dx * dx + dy * dy)

    if (t > 1) {
      x = b[0]
      y = b[1]
    } else if (t > 0) {
      x += dx * t
      y += dy * t
    }
  }

  dx = px - x
  dy = py - y

  return dx * dx + dy * dy
}
