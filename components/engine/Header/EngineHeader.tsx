import React, { FC, useEffect, useState } from 'react'

import { AnimatePresence } from 'framer-motion'
import { useAtom } from 'jotai'
import { useRouter } from 'next/router'

import { EngineLandingHeader } from '@components/engine/Header/EngineLandingHeader'
import EngineStandardHeader from '@components/engine/Header/EngineStandardHeader'
import { isLargeBreakpoint } from '@lib/utils/bph'

import { getDimensions, pageIsTransitioningAtom, subScrollData } from '../../../lib/state'

export type EngineHeaderProps = {
  className?: string
  children?: any
  pages?: any[]
}

const EngineHeader: FC<EngineHeaderProps> = () => {
  const { pathname } = useRouter()

  const [scrollPositionCloseToTop, setScrollPositionCloseToTop] = useState(true)
  const [pageIsTransitioning] = useAtom(pageIsTransitioningAtom)

  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => setIsMounted(true), [])

  useEffect(
    () =>
      subScrollData(({ position }) => {
        const isClose = position < getDimensions()[1] / 3
        if (scrollPositionCloseToTop !== isClose) {
          setScrollPositionCloseToTop(isClose)
        }
      }),
    [scrollPositionCloseToTop]
  )

  const canRenderLandingHeader = pathname === '/' && isLargeBreakpoint() && !pageIsTransitioning
  const shouldRenderLandingHeader = canRenderLandingHeader && scrollPositionCloseToTop

  return (
    <>
      <AnimatePresence>
        {isMounted && canRenderLandingHeader && <EngineLandingHeader visible={shouldRenderLandingHeader} />}
      </AnimatePresence>
      <EngineStandardHeader visible={isMounted && !shouldRenderLandingHeader} />
    </>
  )
}

export default EngineHeader
