import React, { useRef } from 'react'

import cn from 'classnames'
import { motion } from 'framer-motion'

import { useCellStyler } from '@components/cells/useCellStyler'
import getConfig from '@lib/engine/settings'
import { EngineCellComponentProps } from '@lib/engine/types'

import s from './Cell.module.css'

const Cell = (props: EngineCellComponentProps) => {
  const {
    children,
    cellClassName,
    cellId,
    state,
    isClippable = false,
    isScrollable = false,
    isFloating = false,
    isResizable = false,
  } = props

  const ref = useRef<HTMLDivElement>(null)

  const rootClassName = cn(
    s.root,
    {
      [s.isFloating]: isFloating,
      [s.isClippable]: isClippable,
      [s.isResizable]: isResizable,
      [s.isInitiallyVisible]: !!state?.[0],
    },
    cellClassName
  )

  const { style, isVisible } = useCellStyler(cellId, props, ref)

  return getConfig().features.dom && children ? (
    <motion.section
      data-scroll-persistent={isScrollable}
      data-scroll-section={isScrollable}
      ref={ref}
      id={cellId}
      className={rootClassName}
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0, transition: { duration: 0.7 /*delay: 0.4, duration: 1.3*/ } }}
      exit={{ opacity: 0, transition: { /*delay: 0.2,*/ duration: 0.7 } }}
      style={style}
    >
      {children}
    </motion.section>
  ) : null
}

export default Cell
