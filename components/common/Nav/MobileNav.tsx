import { FC } from 'react'

import cn from 'classnames'

import { Hamburger } from '@components/common'
import { useUI } from '@components/ui/context'

import s from './Nav.module.css'

interface Props {
  className?: string
}

const MobileNav: FC<Props> = ({ className }) => {
  const { toggleMenu } = useUI()

  return (
    <nav className={cn(s.root, className)}>
      <a
        onClick={toggleMenu}
        className='button-magnetic'
      >
        <Hamburger className={cn(s.hamburger, s.svg)} />
      </a>
    </nav>
  )
}

export default MobileNav
