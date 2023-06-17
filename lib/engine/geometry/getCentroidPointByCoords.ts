import { Point } from '@pixi/math'
import { polygonCentroid } from 'd3-polygon'

import { EngineCoordinates } from '@lib/engine/types'

export const getCentroidPointByCoords = (cell: EngineCoordinates[]): Point => new Point(...polygonCentroid(cell))

export const getCentroidPointByPoints = (points: Point[]): Point =>
  getCentroidPointByCoords(points.map((point) => [point.x, point.y]))
