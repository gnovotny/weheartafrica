import React, { FC, useEffect, useState } from 'react'

import cn from 'classnames'
import { useAtom } from 'jotai'
import NextLink from 'next/link'

import LogoVariant6 from '@components/icons/logo/LogoVariant6'
import { cellIsExpandedAtom, displayMenuAtom, getScrollData, ScrollData, subScrollData } from 'lib/state'

import s from './EngineHeader.module.css'
import { EngineNav } from './EngineNav'

function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null)
  const [scrolledToTop, setScrolledToTop] = useState<boolean>(true)

  useEffect(() => {
    let lastPosition = getScrollData()?.position || 0

    const updateScrollDirection = ({ position }: ScrollData) => {
      const direction = position > lastPosition ? 'down' : 'up'
      if (direction !== scrollDirection /* && (scrollY - lastPosition > 0.01 || scrollY - lastPosition < -0.01)*/) {
        setScrollDirection(direction)
      }
      lastPosition = position > 0 ? position : 0

      if (position === 0 && !scrolledToTop) {
        setScrolledToTop(true)
      } else if (position !== 0 && scrolledToTop) {
        setScrolledToTop(false)
      }
    }
    const unsubScrollProgress = subScrollData(updateScrollDirection)
    // window.addEventListener("scroll", updateScrollDirection); // add event listener
    return () => {
      // window.removeEventListener("scroll", updateScrollDirection); // clean up
      unsubScrollProgress()
    }
  }, [scrollDirection, scrolledToTop])

  return { scrollDirection, scrolledToTop }
}

type EngineStandardHeaderProps = {
  visible?: boolean
}

const EngineStandardHeader: FC<EngineStandardHeaderProps> = ({ visible = false }) => {
  const { scrollDirection, scrolledToTop } = useScrollDirection()
  const [displayMenu] = useAtom(displayMenuAtom)
  const [cellIsExpanded] = useAtom(cellIsExpandedAtom)

  return (
    <header
      className={cn(s.standard /*, s.textured*/, {
        [s.visible]: displayMenu || (visible && ((scrollDirection === 'up' && !cellIsExpanded) || scrolledToTop)),
        [s.scrolledToTop]: scrolledToTop,
      })}
    >
      <div className={s.inner}>
        <NextLink href='/'>
          <div className='flex flex-row items-center justify-center h-full gap-2'>
            <div className={s.preLogo}>We</div>
            <div className='h-12 md:h-14'>
              <LogoVariant6 className='w-auto h-full' />
            </div>
            <div className={s.postLogo}>Africa</div>
          </div>
        </NextLink>
        <EngineNav />
      </div>
    </header>
  )
}

export default EngineStandardHeader
