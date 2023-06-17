import { MutableRefObject, useCallback, useEffect, useMemo, useRef } from 'react'

import { EngineDimensions } from '@lib/engine/types'
import throttle from '@lib/engine/utils/throttle'
import { store } from '@lib/store'

import { dimensionsAtom } from '../../lib/state'

type UseEngineResizerProps = {
  containerRef: MutableRefObject<HTMLDivElement | null>
}

export const useEngineResizer = ({ containerRef }: UseEngineResizerProps): void => {
  const setDimensions = useCallback((dimensions: EngineDimensions) => store.set(dimensionsAtom, dimensions), [])

  const localDimensionsRef = useRef<EngineDimensions>([0, 0])

  const onResize = useCallback(() => setDimensions(localDimensionsRef.current), [setDimensions])

  const onResizeThrottled = useMemo(() => throttle(onResize, 50), [onResize])

  const observerRef = useRef<ResizeObserver>()

  useEffect(() => {
    if (!observerRef.current) {
      observerRef.current = new ResizeObserver((entries) => {
        // Only care about the first element
        const { width, height } = entries[0].contentRect
        localDimensionsRef.current = [width, height]

        // onResizeThrottled()
        onResize()
      })
    }
    let container: HTMLDivElement
    if (containerRef.current) {
      container = containerRef.current
      observerRef.current.observe(containerRef.current)
    }

    return () => {
      container && observerRef.current?.unobserve(container)
    }
  }, [containerRef, onResizeThrottled])
}
