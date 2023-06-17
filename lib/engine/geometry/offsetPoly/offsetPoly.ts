import { Point } from '@pixi/math'

import ClipperLib from './clipperLib/ClipperLibFullModded'

type FPoint = { X: number; Y: number }

// const miterLimit = 2
// const arcTolerance = 0.25
const offsetter = new ClipperLib.ClipperOffset(/*miterLimit, arcTolerance*/)

export const offsetPoly = (points: Point[], delta: number): Point[] => {
  const path = points.map((point) => ({
    X: point.x,
    Y: point.y,
  }))
  offsetter.Clear()

  offsetter.AddPath(path, ClipperLib.JoinType.jtMiter, ClipperLib.EndType.etClosedPolygon)

  const solution: FPoint[][] = []
  offsetter.Execute(solution, delta)

  return solution[0]?.map((fPoint: FPoint) => new Point(fPoint.X, fPoint.Y)) || []
}
