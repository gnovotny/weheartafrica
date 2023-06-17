import { MutableRefObject, useCallback, useEffect, useRef } from 'react'

import { getPageTransitionDuration } from '@lib/engine/settings'
import transformCellBlueprintsToSimulationBlueprints from '@lib/engine/simulation/transformCellBlueprintsToSimulationBlueprints'
import { EngineCellBlueprint } from '@lib/engine/types'

import { getDimensions, setIsScrolling, setScrollData, subScrollControlRequests } from '../../lib/state'

type ScrollerProps = {
  containerRef: MutableRefObject<HTMLDivElement | null>
  cellBlueprints: EngineCellBlueprint[]
}

export const useEngineScroller = ({ containerRef, cellBlueprints }: ScrollerProps) => {
  const scrollerRef = useRef<any>()
  const scrollLimitRef = useRef<number>(0)
  const mastersCountRef = useRef<number>(0)
  const isFirstInit = useRef<boolean>(true)

  const handleScroll = useCallback(
    ({ limit, scroll, speed }: { limit: number; scroll: number; speed: number }) =>
      setScrollData({
        progress: scroll / limit,
        position: scroll,
        speed,
      }),
    []
  )

  const initScroller = useCallback(async () => {
    if (!containerRef.current || !cellBlueprints.length) return

    const [, height] = getDimensions()
    mastersCountRef.current = transformCellBlueprintsToSimulationBlueprints(cellBlueprints).length
    scrollLimitRef.current = mastersCountRef.current * height
    scrollerRef.current = new (await import('@lib/engine/scroller/Scroller')).default({
      el: containerRef.current,
      lerp: 0.09,
      scrollLimit: scrollLimitRef.current,
      onScrollingStateChanged: setIsScrolling,
      handleScroll: handleScroll,
      getSpeed: true,
    })

    // scrollerRef.current.on('scroll', handleScroll)
  }, [cellBlueprints, containerRef, handleScroll])

  const destroyScroller = useCallback(() => {
    scrollerRef?.current?.destroy()
  }, [])

  const resetScrollData = useCallback(() => {
    setScrollData({
      progress: 0,
      position: 0,
    })
  }, [])

  useEffect(() => {
    let initDelay: ReturnType<typeof setTimeout>
    if (isFirstInit.current) {
      void initScroller()
    } else {
      initDelay = setTimeout(initScroller, getPageTransitionDuration())
    }
    isFirstInit.current = false
    return () => {
      initDelay && clearTimeout(initDelay)
      destroyScroller()
      // resetScrollData()
    }
  }, [cellBlueprints, initScroller, destroyScroller, resetScrollData])

  useEffect(
    () =>
      subScrollControlRequests(({ stop, masterIndex } = {}) => {
        masterIndex !== undefined &&
          scrollerRef.current?.scrollTo((scrollLimitRef.current / mastersCountRef.current) * masterIndex)

        stop && scrollerRef.current?.stopScrolling()
      }),
    []
  )

  return {
    scrollerRef,
    containerRef,
  }
}
