import React, { FC, useCallback, useRef } from 'react'

import cn from 'classnames'
import { useAtom } from 'jotai'
import NextLink from 'next/link'
import { useRouter } from 'next/router'

import { Text } from '@components/ui'
import { displayMenuAtom, requestScrollControl } from 'lib/state'

import s from './EngineHeader.module.css'

type EngineNavProps = {
  className?: string
}

export const EngineNav: FC<EngineNavProps> = ({ className = '' }) => {
  return (
    <div className={cn(s.nav, className)}>
      <EngineDesktopNav />
      <EngineMobileToggle />
    </div>
  )
}

export const EngineNavItems = () => {
  const { pathname } = useRouter()
  const [displayMenu, setDisplayMenu] = useAtom(displayMenuAtom)
  const closeMenu = () => displayMenu && setDisplayMenu(!displayMenu)
  const handleAboutClick = useCallback(() => {
    if (pathname === '/') {
      requestScrollControl({ masterIndex: 1 })
      closeMenu()
    }
  }, [pathname, closeMenu])

  return (
    <>
      <NextLink
        href='/'
        onClick={handleAboutClick}
      >
        <Text variant='bodyBoldLg'>
          Page1<span className='hidden md:inline md:pr-1'>,</span>
        </Text>
      </NextLink>
      <NextLink href='/page2'>
        <Text variant='bodyBoldLg'>
          Page2<span className='hidden md:inline md:pr-1'>,</span>
        </Text>
      </NextLink>
      <NextLink href='/page3'>
        <Text variant='bodyBoldLg'>
          Page3<span className='hidden md:inline md:pr-1'>,</span>
        </Text>
      </NextLink>
      <NextLink href='/page4'>
        <Text variant='bodyBoldLg'>
          Page4<span className='hidden md:inline md:pr-1'>,</span>
        </Text>
      </NextLink>
      <NextLink href='/page5'>
        <Text
          variant='bodyBoldLg'
          className='whitespace-nowrap'
        >
          Page5
        </Text>
      </NextLink>
    </>
  )
}
export const EngineDesktopNav: FC<EngineNavProps> = ({ className = '' }) => {
  return (
    <nav className={cn(s.desktopNav, className)}>
      <EngineNavItems />
    </nav>
  )
}

export const EngineMobileToggle: FC<EngineNavProps> = ({ className = '' }) => {
  const [displayMenu, setDisplayMenu] = useAtom(displayMenuAtom)
  const toggleMenu = () => setDisplayMenu(!displayMenu)

  return (
    <button
      className={cn(s.mobileToggle, className)}
      role='menu'
      onClick={toggleMenu}
    >
      <Text variant='bodyBoldLg'>{displayMenu ? 'Close' : 'Menu'}</Text>
    </button>
  )
}
interface MenuProps {
  className?: string
  children?: any
  open?: boolean
  onClose: () => void
  onEnter?: () => void | null
}

export const EngineMobileMenu: FC<MenuProps> = ({ children, open, onClose, onEnter = null }) => {
  const ref = useRef() as React.MutableRefObject<HTMLDivElement>

  return (
    <>
      <div className={cn(s.mobileMenu, { [s.isOpen]: open })}>
        <nav
          className={s.nav}
          role='menu'
          ref={ref}
        >
          <div className={s.gridContainer}>
            <EngineNavItems />
          </div>
        </nav>
      </div>
    </>
  )
}
