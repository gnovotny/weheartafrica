import { Point } from '@pixi/math'
import {
  ClipperLibWrapper,
  loadNativeClipperLibInstanceAsync,
  NativeClipperLibRequestedFormat,
  JoinType,
  EndType,
} from 'js-angusj-clipper/web'

// float <-> int precision multiplier
const MULTIPLIER = 1000

let clipperLibInstance: ClipperLibWrapper
export const asyncInitWasmPolygonOffsetter = async () =>
  (clipperLibInstance = await loadNativeClipperLibInstanceAsync(
    // let it autodetect which one to use, but also available WasmOnly and AsmJsOnly
    NativeClipperLibRequestedFormat.WasmWithAsmJsFallback
    // NativeClipperLibRequestedFormat.AsmJsOnly
  ))

export const offsetPoly = (points: Point[], delta: number): Point[] =>
  clipperLibInstance
    ? clipperLibInstance
        .offsetToPaths({
          offsetInputs: [
            {
              data: points.map((point) => ({
                x: point.x * MULTIPLIER,
                y: point.y * MULTIPLIER,
              })),
              joinType: JoinType.Miter,
              endType: EndType.ClosedPolygon,
            },
          ],
          delta: delta * MULTIPLIER,
          // cleanDistance: 5,
        })?.[0]
        ?.map((intPoint) => new Point(intPoint.x / MULTIPLIER, intPoint.y / MULTIPLIER)) || []
    : []
