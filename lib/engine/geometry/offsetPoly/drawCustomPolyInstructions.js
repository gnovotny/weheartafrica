import { LINE_CAP, LINE_JOIN } from '@pixi/graphics'

import { pointDistance } from '@lib/engine/geometry/buildCustomPolyInstructions'
import { getCurrentMaxBreakpointValue } from '@lib/engine/settings/utils'

export const drawCustomPolyInstructions = (instructions, graphics, pointsGraphics = null) => {
  const { segments, method, closePath } = instructions

  const graphicsSet = Array.isArray(graphics) ? graphics : [graphics]

  segments[0][0] && graphicsSet.forEach((g) => g?.moveTo(segments[0][0].x, segments[0][0].y))
  for (let [start, ctrl, end] of segments) {
    start && graphicsSet.forEach((g) => g?.lineTo(start.x, start.y))

    switch (method) {
      case 'none':
        end && graphicsSet.forEach((g) => g?.moveTo(end.x, end.y))
        break
      case 'sliced':
        end && graphicsSet.forEach((g) => g?.lineTo(end.x, end.y))
        break

      case 'quadratic':
        ctrl && end && graphicsSet.forEach((g) => g?.quadraticCurveTo(ctrl.x, ctrl.y, end.x, end.y))
        break
    }

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

  closePath && graphicsSet.forEach((g) => g?.closePath())
}

export const drawCustomPolyInstructionsWithLineStyles = (instructions, graphics, lineStyles, pointsGraphics = null) => {
  const { segments, method, closePath } = instructions

  const graphicsSet = Array.isArray(graphics) ? graphics : [graphics]

  lineStyles.forEach((style, index) => {
    let currentPosition
    segments[0].start && graphicsSet.forEach((g) => g?.moveTo(segments[0].start.x, segments[0].start.y))
    for (let { start, end } of segments) {
      let scaleFactor = 1

      if (start) {
        let skipLine = false
        if (currentPosition) {
          let edgeLength = pointDistance(currentPosition, start)

          if (edgeLength < 10) {
            skipLine = true
          } else if (edgeLength < 50) {
            scaleFactor = edgeLength / 50
          }
        }

        if (!skipLine) {
          graphics.lineStyle({
            // alignment: index > 1 ? 0.5 : index,
            alignment: style.alignment ?? 0.5,
            width: getCurrentMaxBreakpointValue(style.width) * scaleFactor,
            color: style.color,
            join: LINE_JOIN.ROUND,
            cap: LINE_CAP.ROUND,
            // alpha: scaleFactor,
            alpha: style.alpha ?? 1,
            native: !!style.native,
          })

          currentPosition = start
          graphicsSet.forEach((g) => g?.lineTo(start.x, start.y))
        }

        if (pointsGraphics) {
          pointsGraphics.beginFill(0xff0000)
          pointsGraphics.drawCircle(start.x, start.y, 4)
        }
      }

      if (end) {
        currentPosition = end
        graphicsSet.forEach((g) => g?.moveTo(end.x, end.y))

        if (pointsGraphics) {
          pointsGraphics.beginFill(0x00ff00)
          pointsGraphics.drawCircle(end.x, end.y, 6)
        }
      }
    }
  })

  closePath && graphicsSet.forEach((g) => g?.closePath())
}
