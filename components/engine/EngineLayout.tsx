import React, { FC, PropsWithChildren, ReactElement, useEffect, useRef } from 'react'

import cn from 'classnames'
import { AnimatePresence } from 'framer-motion'
import { useAtom } from 'jotai'
import { useRouter } from 'next/router'

import Noise from '@components/common/Noise'
import { EngineMobileMenu } from '@components/engine/Header/EngineNav'
import { useCellBlueprintsTransformer } from '@components/engine/useCellBlueprintsTransformer'
import { usingDOMNoise } from '@lib/engine/settings/utils'
import { displayMenuAtom } from 'lib/state'

import { DynamicRendererWrapper } from '../renderer/DynamicRendererWrapper'

import s from './EngineLayout.module.css'
import EngineHeader from './Header'
import { useEngineResizer } from './useEngineResizer'
import { useEngineScroller } from './useEngineScroller'
import { useEngineSimulator } from './useEngineSimulator'

export type LayoutProps = {
  pageProps: any & {
    pages?: any[]
  }
  cells?: ReactElement[]
}

export const MobileMenuUI: FC = () => {
  const [displayMenu, setDisplayMenu] = useAtom(displayMenuAtom)
  const closeMenu = () => setDisplayMenu(false)
  const router = useRouter()

  useEffect(() => {
    router.beforePopState(({ as }) => {
      if (as !== router.asPath) {
        closeMenu()
      }
      return true
    })

    return () => {
      router.beforePopState(() => true)
    }
  }, [router])

  return (
    <EngineMobileMenu
      open={displayMenu}
      onClose={closeMenu}
    />
  )
}

const EngineLayout: FC<PropsWithChildren<LayoutProps>> = ({ children, pageProps, cells: baseCells }) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const { blueprints } = useCellBlueprintsTransformer(baseCells)
  useEngineScroller({ containerRef, cellBlueprints: blueprints })
  useEngineResizer({ containerRef })
  useEngineSimulator({ cellBlueprints: blueprints })

  return (
    <div
      ref={containerRef}
      id='engineContainer'
      className={cn(s.root, s.textured)}
    >
      <EngineHeader />
      {children}
      <AnimatePresence>{baseCells}</AnimatePresence>
      <DynamicRendererWrapper />
      <MobileMenuUI />
      {usingDOMNoise() && <Noise />}
    </div>
  )
}

export default EngineLayout
