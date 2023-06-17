import React, { useCallback, useEffect, useRef, useState } from 'react'

import { Point } from '@pixi/math'
import { useMotionValue } from 'framer-motion'
import sync, { cancelSync } from 'framesync'

import getConfig from '@lib/engine/settings'
import { usingDom } from '@lib/engine/settings/utils'
import { DOMStylerStyle, EngineCellComponentProps } from '@lib/engine/types'
import { getCellKey, getCellOriginalData } from '@lib/engine/utils/cellData'
import clamp from '@lib/engine/utils/clamp'
import { lerpPoints } from '@lib/engine/utils/lerp'
import { getCellDataMap, getCurrentPointer, getDimensions, subDimensions } from 'lib/state'

function randomNumber(min: number, max: number) {
  return Math.random() * (max - min) + min
}

type DOMStylerState = {
  isVisible: boolean
  isSuspended: boolean
  dimensions?: { width: number; height: number }
} & any

export const useCellStyler = (
  cellId: string,
  cellProps: EngineCellComponentProps,
  cellRef: React.MutableRefObject<HTMLDivElement | null>
): {
  style: DOMStylerStyle
  isVisible: boolean
} => {
  const pointerEvents = useMotionValue<string | undefined>('none')
  const x = useMotionValue<number>(0)
  const y = useMotionValue<number>(0)
  const rotate = useMotionValue<number>(0)
  const scale = useMotionValue<number>(1)
  const display = useMotionValue<string>('')
  const width = useMotionValue<number | undefined>(undefined)
  const height = useMotionValue<number | undefined>(undefined)
  const stateRef = useRef<DOMStylerState>({
    isVisible: false,
    isSuspended: true,
  })
  const [isVisible, setIsVisible] = useState(stateRef.current.isVisible)
  const styleRef = useRef<DOMStylerStyle>({
    width,
    height,
    x,
    y,
    rotate,
    scale,
    pointerEvents,
  })
  const suspensionTimeoutRef = useRef<ReturnType<typeof setTimeout>>()

  const lerpStepRef = useRef(randomNumber(0.03, 0.07))

  const flushVisibilityBuffer = useCallback(() => {
    if (stateRef.current.isVisible !== isVisible) {
      setIsVisible(stateRef.current.isVisible)
    }
  }, [isVisible])

  const hide = useCallback(() => {
    if (!stateRef.current.isSuspended && !suspensionTimeoutRef.current) {
      suspensionTimeoutRef.current = setTimeout(() => {
        stateRef.current.isSuspended = true
        suspensionTimeoutRef.current = undefined
      }, 2000)
    }

    stateRef.current.isVisible = false

    if (styleRef.current.pointerEvents.get() !== 'none') {
      styleRef.current.pointerEvents?.set('none')
    }
  }, [])

  const reveal = useCallback(() => {
    if (suspensionTimeoutRef.current) {
      clearTimeout(suspensionTimeoutRef.current)
      suspensionTimeoutRef.current = undefined
    }
    stateRef.current.isSuspended = false
    stateRef.current.isVisible = true

    if (styleRef.current.pointerEvents.get() !== 'auto') {
      styleRef.current.pointerEvents?.set('auto')
    }
  }, [])

  useEffect(() => {
    if (getConfig().features.dom) {
      const syncProcess = sync.update(styleCell, true)
      return () => cancelSync.update(syncProcess)
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => flushVisibilityBuffer(), 300)
    return () => clearInterval(interval)
  }, [flushVisibilityBuffer])

  useEffect(subDimensions(() => (stateRef.current.dimensions = null)))

  const styleCell = useCallback(() => {
    const el = cellRef?.current
    if (!usingDom() || !cellId || !el || !el.firstChild) return
    const [clippingWidth, clippingHeight] = getDimensions()

    let markedAsHidden = false

    if (!stateRef.current.dimensions) {
      const rect = (el.firstChild as HTMLElement)?.getBoundingClientRect() || {}
      const { width, height } = rect
      if (width && width > 0 && height && height > 0) {
        stateRef.current.dimensions = { width, height }
      }
    }

    const { width, height } = stateRef.current.dimensions || {}

    const cellData = getCellDataMap()[cellId]
    if (!cellData || !width || !height) {
      hide()
      markedAsHidden = true
    }

    if (markedAsHidden && stateRef.current.isSuspended) {
      return
    }

    const manipulationData = getCellOriginalData(cellData)?.manipulation

    const { followsPointer, canRotate } = cellProps

    const bbox = (stateRef.current.lastKnownBbox = manipulationData?.bbox ?? stateRef.current.lastKnownBbox)

    if (bbox && width && height && bbox.width * (isVisible ? 0.7 : 0.8) < width /* || bbox.height * 0.9 < height*/) {
      hide()
      markedAsHidden = true
    }

    const referenceAnchorPoint =
      manipulationData?.labelCentroidPoint ??
      manipulationData?.centroidPoint ??
      stateRef.current.lastKnownReferenceAnchorPoint
    if (!referenceAnchorPoint) return
    stateRef.current.lastKnownReferenceAnchorPoint = referenceAnchorPoint

    let maxHeightToOffset = 0
    if (height && bbox?.height) {
      maxHeightToOffset = Math.min(height / 2, bbox.height / 2)
    }
    const customAnchorPoint = new Point(
      referenceAnchorPoint.x - (width ? width / 2 : 0),
      referenceAnchorPoint.y - maxHeightToOffset
    )

    const CLIP_BUFFER = 20
    if (
      customAnchorPoint.x < -CLIP_BUFFER ||
      customAnchorPoint.x > clippingWidth + CLIP_BUFFER ||
      (customAnchorPoint.y < -CLIP_BUFFER && customAnchorPoint.y + height < clippingHeight / 3) ||
      customAnchorPoint.y > clippingHeight + CLIP_BUFFER
    ) {
      hide()
      markedAsHidden = true
    }

    if (!stateRef.current.isVisible && !markedAsHidden) {
      reveal()
    }

    const customPositionPoint = (stateRef.current.customPositionPoint =
      stateRef.current.customPositionPoint ?? customAnchorPoint)

    let newPosition = lerpPoints(customPositionPoint, customAnchorPoint, lerpStepRef.current)

    if (followsPointer) {
      const { cellData, point: pointerPoint } = getCurrentPointer() ?? {}
      const pointerCellId = getCellKey(cellData)
      if (pointerPoint && pointerCellId === cellId) {
        newPosition = lerpPoints(
          customPositionPoint,
          new Point((pointerPoint.x ?? 0) - (width ?? 0) / 2, (pointerPoint.y ?? 0) - (height ?? 0) / 2),
          lerpStepRef.current
        )
      }
    }

    stateRef.current.customPositionPoint = newPosition

    if (styleRef.current.x.get() !== newPosition.x || styleRef.current.y.get() !== newPosition.y) {
      if (canRotate && styleRef.current.rotate) {
        stateRef.current.rotate = clamp(
          -3,
          3,
          (stateRef.current.rotate ?? 0) + (styleRef.current.x.get() > newPosition.x ? 0.1 : -0.1)
        )
        styleRef.current.rotate?.set(stateRef.current.rotate)
      }

      styleRef.current.x?.set(newPosition?.x)
      styleRef.current.y?.set(newPosition?.y)
    }
  }, [cellId, cellProps, cellRef, isVisible, hide, reveal])

  return {
    style: styleRef.current,
    isVisible,
  }
}
