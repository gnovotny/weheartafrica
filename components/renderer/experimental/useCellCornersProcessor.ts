/** DANGER HERE BE DRAGONS, ETC. **/

import { MutableRefObject, useCallback, useMemo, useRef } from 'react'

import { Texture } from '@pixi/core'
import { Sprite } from '@pixi/sprite'
import { useRouter } from 'next/router'

import { pointDistance } from '@lib/engine/geometry/drawRoundedPoly'
import { EngineRendererStages } from '@lib/engine/renderer/types'
import { getPolyRadius, usingCorners } from '@lib/engine/settings/utils'
import { getCellId, getCellKey, getCellOriginalData } from '@lib/engine/utils/cellData'
import lerp from '@lib/engine/utils/lerp'
import { isSmallBreakpoint } from '@lib/utils/bph'
import {
  getCellDataList,
  getRouterPathname,
  getRouterPreviousPathname,
  getScrollData,
  setArrowData,
  setLogoData,
} from 'lib/state'

export const useCellCornersProcessor = ({
  stagesRef,
}: {
  stagesRef: MutableRefObject<EngineRendererStages>
}): { drawCellCorners: () => void } => {
  const cornerElementsDataRef = useRef<Record<string, any>>({})
  const cornerElementsIndexRef = useRef<number>(0)
  const lastChosenSrcIdRef = useRef<string | undefined>()
  const router = useRouter()

  const srcList = useMemo(
    () => [
      {
        id: 'bongo',
        url: '/assets/african_woman_playing_bongo_white.png',
        dimensions: { width: 356, height: 351 },
      },
      {
        id: 'village_women',
        url: '/assets/african_women_white_small.png',
        dimensions: { width: 200, height: 186 },
      },
      ...(router.pathname !== '/' || getScrollData()?.position > 300
        ? [
            {
              id: 'canoe',
              url: '/assets/canoe_white.png',
              dimensions: { width: 488, height: 546 },
            },
            {
              id: 'logo',
              url: '/assets/logo/connected_hearts7_white_small.png',
              dimensions: { width: 174, height: 174 },
              rotateX: true,
            },
          ]
        : []),
    ],
    [router.pathname]
  )

  const getNewSrc = useCallback(() => {
    const filteredSrcList = srcList.filter(({ id }) => id !== lastChosenSrcIdRef.current)
    const newSrc = filteredSrcList[Math.floor(Math.random() * filteredSrcList.length)]
    lastChosenSrcIdRef.current = newSrc.id
    return newSrc
  }, [srcList])

  const drawCellCorners = useCallback(
    /*async */ () => {
      if (!usingCorners()) return

      const parentStage = stagesRef.current.baseDeco

      const cellDataList = getCellDataList()
      const pointsegmentsArrHashedByCoordsGlobal: Record<string, any[]> = {}
      cellDataList.forEach((cellData) => {
        const pointsegmentsHashedByCoords: Record<string, boolean> = {}

        const segments = getCellOriginalData(cellData)?.manipulation?.linePolyInstructions?.segments
        if (segments) {
          segments.forEach((segment) => {
            const key = `${Number(segment.originalPoint.x).toFixed(2)}_${Number(segment.originalPoint.y).toFixed(2)}`

            if (pointsegmentsHashedByCoords[key]) return

            pointsegmentsHashedByCoords[key] = true

            if (!pointsegmentsArrHashedByCoordsGlobal[key]) {
              pointsegmentsArrHashedByCoordsGlobal[key] = []
            }
            pointsegmentsArrHashedByCoordsGlobal[key].push({
              segment,
              cellData,
            })
          })
        }
      })

      const newCornerElementsData: Record<string, any> = {}
      Object.values(pointsegmentsArrHashedByCoordsGlobal)
        .filter((corner) => {
          if (corner.length >= 3) {
            return true
          } else if (corner.length === 2) {
            if (
              (getRouterPathname() === '/' || getRouterPreviousPathname() === '/') &&
              getScrollData()?.position < 300
            ) {
              if (
                (getCellKey(corner[0].cellData) === 'hero' || getCellKey(corner[1].cellData) === 'hero') &&
                (['gulugufe'].includes(getCellKey(corner[0].cellData) || '') ||
                  ['gulugufe'].includes(getCellKey(corner[1].cellData) || ''))
              ) {
                if (corner[0].segment.clippingEdge === 'top' || corner[1].segment.clippingEdge === 'top') {
                  const sideLength = 240 * (isSmallBreakpoint() ? 0.5 : 1)
                  corner.src = {
                    id: 'mainLogo',
                    url: '/assets/logo/connected_hearts7_white_small.png',
                    dimensions: { width: 174, height: 174 },
                    noCollisionCheck: true,
                    sideLength: sideLength,
                    offsetY: sideLength / 6,
                    rotateX: true,
                  }
                  return true
                }
              }

              if (
                ['hero', 'antomwe'].includes(getCellId(corner[0].cellData) || '') &&
                ['hero', 'antomwe'].includes(getCellId(corner[1].cellData) || '')
              ) {
                if (corner[0].segment.clippingEdge === 'bottom' || corner[1].segment.clippingEdge === 'bottom') {
                  corner.src = {
                    id: 'arrowDown',
                    url: '/assets/paint_brush_arrow_white.png',
                    dimensions: { width: 99, height: 148 },
                    noCollisionCheck: true,
                    sideLength: 60,
                    offsetY: -30,
                  }
                  return true
                }
              }
            }
          }
        })
        .forEach((segments) => {
          const key = segments
            .map((item) => getCellKey(item.cellData))
            .sort()
            .join('_')

          let newCornerElementData: any
          if (cornerElementsDataRef.current[key]) {
            newCornerElementData = cornerElementsDataRef.current[key]
            newCornerElementData.isNew = false
            delete cornerElementsDataRef.current[key]

            // if (!(segments.src?.id && (segments.src?.id === 'mainLogo' || segments.src?.id === 'arrowDown'))) {
            //   segments.src = newCornerElementData.src
            // }
            if (segments.src) {
              newCornerElementData.src = segments.src
            }
          } else {
            const src = (segments.src = segments.src || getNewSrc())
            const sprite = new Sprite(Texture.from(src.url, src.dimensions))
            sprite.tint = 0x1a1a1e
            // sprite.alpha = 0
            // sprite.scale.set(0)
            parentStage?.scene.addChild(sprite)
            newCornerElementData = {
              key,
              isNew: true,
              sprite,
              src,
              index: cornerElementsIndexRef.current++,
            }
          }

          newCornerElementData.hasCollisionTransform = false
          newCornerElementData.prevPoint = newCornerElementData.point
          newCornerElementData.point = segments[0].segment.originalPoint
          newCornerElementData.polygon = segments.reduce(
            (prev, cur) => [...prev, cur.segment.start, cur.segment.end],
            []
          )
          newCornerElementsData[key] = newCornerElementData

          try {
            const {
              dimensions: { width: srcWidth, height: srcHeight },
              rotateX = false,
              offsetY = 0,
              sideLength = 80 * (isSmallBreakpoint() ? 0.5 : 1),
            } = newCornerElementData.src

            // get the scale
            const scale = Math.max(sideLength / srcWidth, sideLength / srcHeight)
            // get the top left position
            const scaleX = sideLength / 2 - (srcWidth / 2) * scale
            const scaleY = sideLength / 2 - (srcHeight / 2) * scale

            const spriteData = {
              x: newCornerElementData.point.x + scaleX,
              y: newCornerElementData.point.y - (offsetY + scaleY),
              height: srcHeight * scale,
              width: srcWidth * scale,
            }

            newCornerElementData.spriteData = spriteData

            const sprite = newCornerElementData.sprite
            sprite.x = spriteData.x
            sprite.y = spriteData.y
            sprite.height = spriteData.height
            sprite.width = spriteData.width

            // sprite.alpha = 1
            sprite.alpha = lerp(sprite.alpha, 1, 0.05)
            // sprite.scale = lerp(sprite.scale.x, 1, 0.05)

            newCornerElementData.sprite.anchor.set(0.5)

            if (newCornerElementData.prevPoint) {
              if (newCornerElementData.point.x !== newCornerElementData.prevPoint.x) {
                const xDiff = newCornerElementData.point.x - newCornerElementData.prevPoint.x
                const yDiff = newCornerElementData.point.y - newCornerElementData.prevPoint.y

                if (rotateX) {
                  newCornerElementData.sprite.rotation += 0.01 * (Math.abs(yDiff) > Math.abs(xDiff) ? yDiff : xDiff)
                  // newCornerElementData.sprite.rotation += 0.01 * -xDiff
                } else {
                  if (
                    (newCornerElementData.sprite.angle > -15 && -xDiff < 0) ||
                    (newCornerElementData.sprite.angle < 15 && -xDiff > 0)
                  ) {
                    newCornerElementData.sprite.rotation += 0.005 * -xDiff
                  }
                }
              }
            }

            newCornerElementData.src.id === 'mainLogo' && setLogoData(spriteData)
            newCornerElementData.src.id === 'arrowDown' && setArrowData(spriteData)

            // newCornerElementData.sprite.width = newCornerElementData.sprite.height =
            //   (getConfig().manipulation.geometry?.baseRadius || 20) * 1
            // newCornerElementData.sprite?.position?.set(newCornerElementData.point.x, newCornerElementData.point.y)
            // newCornerElementData.sprite.pivot.x = 440
            // newCornerElementData.sprite.pivot.y = 440
          } catch (e) {
            console.error(e)
          }
        })

      const cornerElementsDataArr = Object.values(newCornerElementsData)
      const newCornerElementsDataArr = cornerElementsDataArr.filter((e) => e.isNew)
      Object.values(cornerElementsDataRef.current).forEach((cornerElementData) => {
        if (cornerElementData.sprite) {
          let foundMatch = false

          if (cornerElementData.src.id !== 'mainLogo' || cornerElementData.src.id !== 'arrowDown') {
            newCornerElementsDataArr.forEach((e) => {
              if (e.src.id === 'mainLogo' || e.src.id === 'arrowDown') {
                return
              }
              if (foundMatch || e.foundOldMatch) return
              if (pointDistance(cornerElementData.point, e.point) < 40) {
                foundMatch = true
                e.foundOldMatch = true
                parentStage?.scene.removeChild(e.sprite)
                ;(e.sprite as Sprite).destroy()
                e.sprite = cornerElementData.sprite
                e.sprite.x = e.spriteData.x
                e.sprite.y = e.spriteData.y
                e.sprite.height = e.spriteData.height
                e.sprite.width = e.spriteData.width
                e.sprite.alpha = 1
                e.src = cornerElementData.src
              }
            })
          }

          if (!foundMatch) {
            parentStage?.scene.removeChild(cornerElementData.sprite)
            ;(cornerElementData.sprite as Sprite).destroy()
          }
        }
      })

      cornerElementsDataArr.forEach((cornerElementData, i) => {
        const sprite = cornerElementData.sprite
        if (cornerElementData.src.noCollisionCheck) return

        const sideLength =
          cornerElementData.sideLength ?? (getPolyRadius() || 20) * 1.5 * (isSmallBreakpoint() ? 0.5 : 1)

        const halfSideLength = sideLength / 2

        cornerElementsDataArr.forEach((otherCornerElementData, index) => {
          if (
            otherCornerElementData.hasCollisionTransform === cornerElementData.key ||
            cornerElementData.hasCollisionTransform === otherCornerElementData.key ||
            otherCornerElementData.src.noCollisionCheck ||
            i === index
          )
            return

          const otherSideLength =
            otherCornerElementData.sideLength ?? (getPolyRadius() || 20) * 1.5 * (isSmallBreakpoint() ? 0.5 : 1)

          const otherHalfSideLength = otherSideLength / 2

          const minDist = (halfSideLength + otherHalfSideLength) as number
          const pDist = pointDistance(cornerElementData.point, otherCornerElementData.point)

          if (pDist < minDist) {
            const [elementDataToTransform, otherElementData] =
              otherCornerElementData.index < cornerElementData.index
                ? [cornerElementData, otherCornerElementData]
                : [otherCornerElementData, cornerElementData]

            if (!elementDataToTransform.hasCollisionTransform) {
              elementDataToTransform.hasCollisionTransform = otherElementData.key

              const spriteToTransform = elementDataToTransform.sprite as Sprite

              const factor = pDist / minDist
              spriteToTransform.scale.set(spriteToTransform.scale.x * factor)
              spriteToTransform.alpha = factor
            }
          }
        })
      })

      cornerElementsDataRef.current = newCornerElementsData
    },
    []
  )

  return {
    drawCellCorners,
  }
}
