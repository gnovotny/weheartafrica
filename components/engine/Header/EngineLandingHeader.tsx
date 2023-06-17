import React, { FC, useCallback, useEffect, useRef, useState } from 'react'

import cn from 'classnames'
import { motion, MotionValue } from 'framer-motion'
import { useAtom } from 'jotai'

import { EngineNav } from '@components/engine/Header/EngineNav'
import { DOMStylerStyle, EngineDimensions } from '@lib/engine/types'

import {
  dimensionsAtom,
  pageIsTransitioningAtom,
  requestScrollControl,
  subArrowData,
  subLogoData,
} from '../../../lib/state'

import s from './EngineHeader.module.css'

type EngineLandingHeaderProps = {
  visible?: boolean
}

const EngineLandingHeader: FC<EngineLandingHeaderProps> = ({ visible: canBeVisibleParent = false }) => {
  const [[globalWidth]] = useAtom<EngineDimensions>(dimensionsAtom)
  const [pageIsTransitioning] = useAtom(pageIsTransitioningAtom)

  const [canBeVisibleLocal, setCanBeVisibleLocal] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  // const latestDataRef = useRef<any>(null)
  const preRef = useRef<HTMLDivElement>(null)
  const postRef = useRef<HTMLDivElement>(null)

  const preStyleRef = useRef<DOMStylerStyle>({
    // width: new MotionValue<number | undefined>(undefined),
    // height: new MotionValue<number | undefined>(undefined),
    // scaleX: new MotionValue<number | undefined>(undefined),
    // scaleY: new MotionValue<number | undefined>(undefined),
    // opacity: new MotionValue<number>(0),
    x: new MotionValue<number>(0),
    y: new MotionValue<number>(0),
    scaleX: new MotionValue<number>(1),
    scaleY: new MotionValue<number>(1),
    width: new MotionValue<number | undefined>(undefined),
    height: new MotionValue<number | undefined>(undefined),
    fontSize: new MotionValue<string | undefined>(undefined),
  })

  const postStyleRef = useRef<DOMStylerStyle>({
    // width: new MotionValue<number | undefined>(undefined),
    // height: new MotionValue<number | undefined>(undefined),
    // scaleX: new MotionValue<number | undefined>(undefined),
    // scaleY: new MotionValue<number | undefined>(undefined),
    // opacity: new MotionValue<number>(0),
    x: new MotionValue<number>(0),
    y: new MotionValue<number>(0),
    width: new MotionValue<number | undefined>(undefined),
    height: new MotionValue<number | undefined>(undefined),
    scaleX: new MotionValue<number>(1),
    scaleY: new MotionValue<number>(1),
    fontSize: new MotionValue<string | undefined>(undefined),
  })

  // const setMainStyles = useCallback((data: any) => {
  //   const mainStyle = mainStyleRef.current
  //   if (!mainStyle.width.get() || !mainStyle.height.get()) {
  //     mainStyle.width.set(data.width)
  //     mainStyle.height.set(data.height)
  //   }
  //
  //   mainStyle.x.set(data.x - data.width / 2)
  //   mainStyle.y.set(data.y - data.height / 2)
  // }, [])

  // const setPreStyles = useCallback((data: any) => {
  //   const preStyle = preStyleRef.current
  //   // const newWidth = data.x
  //   // if (!preStyle.width.get() || !preStyle.height.get()) {
  //   //   preStyle.width.set(newWidth)
  //   //   preStyle.height.set(data.height)
  //   // } else {
  //   //   // preStyle.scaleX.set(newWidth / preStyle.width.get())
  //   //   // preStyle.scaleY.set(data.height / preStyle.height.get())
  //   // }
  //
  //   // preStyle.x.set(data.x + data.width)
  //
  //   if (!preStyle.fontSize.get()) {
  //     const modifier = 0.8
  //     const padding = 0
  //     const widthAvailable = data.x - data.width / 2 - padding
  //     const nrOfChars = 2
  //     const fontSizeVW = (widthAvailable / globalWidth / nrOfChars) * 100 * modifier
  //     preStyle.fontSize.set(`${fontSizeVW}vw`)
  //   }
  //
  //   // if (!preStyle.opacity.get()) {
  //   //   preStyle.opacity.set(1)
  //   // }
  //
  //   preStyle.y.set(data.y - data.height / 2)
  // }, [])

  const setPreStyles = useCallback(
    (data: any, resetDimensions?: boolean) => {
      if (!preRef.current) return
      const preStyle = preStyleRef.current

      const modifier = 1
      const paddingX = 20
      const paddingY = 120
      const y = data.y - data.height / 2
      const widthAvailable = data.x - data.width / 2
      const heightAvailable = data.height

      if (!preStyle.fontSize.get()) {
        const nrOfChars = postRef.current?.innerText.length
        if (nrOfChars) {
          const fontSizeVW = (globalWidth / nrOfChars) * 100 * modifier
          preStyle.fontSize.set(`${fontSizeVW}vw`)
        }
        setTimeout(() => setPreStyles(data, resetDimensions))
      } else if (resetDimensions || !preStyle.width.get() || !preStyle.height.get()) {
        const { width, height } = preRef.current?.getBoundingClientRect() || {}
        if (width && height) {
          preStyle.width.set(width)
          preStyle.height.set(height)
        }
      }

      if (preStyle.width.get() && preStyle.height.get()) {
        const scaleX = (widthAvailable - paddingX) / preStyle.width.get()
        const scaleY = (heightAvailable - paddingY) / preStyle.height.get()

        if (scaleX !== preStyle.scaleX.get() || scaleY !== preStyle.scaleY.get()) {
          preStyle.scaleX.set(scaleX)
          preStyle.scaleY.set(scaleY)
        }
      }

      if (preStyle.y.get() !== y) {
        preStyle.y.set(y)
      }
    },
    [globalWidth]
  )

  const setPostStyles = useCallback(
    (data: any, resetDimensions?: boolean) => {
      if (!postRef.current) return
      const postStyle = postStyleRef.current

      const modifier = 1.2
      const padding = 40
      const x = data.x + data.width / 2
      const widthAvailable = globalWidth - x
      const heightAvailable = data.height

      if (!postStyle.fontSize.get()) {
        const nrOfChars = postRef.current.innerText.length
        const fontSizeVW = (globalWidth / nrOfChars) * 100 * modifier
        postStyle.fontSize.set(`${fontSizeVW}vw`)
        setTimeout(() => setPostStyles(data, resetDimensions))
      } else if (resetDimensions || !postStyle.width.get() || !postStyle.height.get()) {
        const { width, height } = postRef.current?.getBoundingClientRect() || {}
        if (width && height) {
          postStyle.width.set(width)
          postStyle.height.set(height)
        }
      }

      if (postStyle.width.get() && postStyle.height.get()) {
        const scaleX = (widthAvailable - padding) / postStyle.width.get()
        const scaleY = (heightAvailable - padding) / postStyle.height.get()

        if (scaleX !== postStyle.scaleX.get() || scaleY !== postStyle.scaleY.get()) {
          postStyle.scaleX.set(scaleX)
          postStyle.scaleY.set(scaleY)
        }
      }

      if (postStyle.x.get() !== x) {
        postStyle.x.set(x)
      }
    },
    [globalWidth]
  )

  const setAllStyles = useCallback(
    (data: any, resetDimensions?: boolean) => {
      if (!data) return
      setPreStyles(data, resetDimensions)
      setPostStyles(data, resetDimensions)
    },
    [setPostStyles, setPreStyles]
  )

  const setVisibility = useCallback(() => {
    if (canBeVisibleParent && !pageIsTransitioning) {
      !isVisible && setTimeout(() => setIsVisible(true), 200)
    } else {
      isVisible && setIsVisible(false)
    }
  }, [isVisible, canBeVisibleParent, pageIsTransitioning])

  useEffect(() => subLogoData(setAllStyles), [setAllStyles])
  // useEffect(() => setAllStyles(getLogoData(), true), [globalWidth, setAllStyles])
  useEffect(setVisibility, [setVisibility])

  return (
    <motion.header
      className={s.landing}
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      exit={{ opacity: 0 }}
    >
      <div className={s.header}>
        <motion.div
          ref={preRef}
          className={cn(s.sequence, s.preLogo)}
          style={preStyleRef.current}
        >
          We
        </motion.div>
        <motion.div
          ref={postRef}
          className={cn(s.sequence, s.postLogo)}
          style={postStyleRef.current}
        >
          Africa
        </motion.div>
      </div>
      <EngineLandingFooter />
    </motion.header>
  )
}

const EngineLandingFooter: FC<EngineLandingHeaderProps> = ({ visible = false }) => {
  const [[globalWidth]] = useAtom<EngineDimensions>(dimensionsAtom)
  const footerRef = useRef<HTMLDivElement | null>(null)

  const mainStyleRef = useRef<DOMStylerStyle>({
    width: new MotionValue<number | undefined>(undefined),
    height: new MotionValue<number | undefined>(undefined),
    x: new MotionValue<number>(0),
    y: new MotionValue<number>(0),
  })

  const postStyleRef = useRef<DOMStylerStyle>({
    width: new MotionValue<number | undefined>(undefined),
    height: new MotionValue<number | undefined>(undefined),
    // scaleX: new MotionValue<number | undefined>(undefined),
    // scaleY: new MotionValue<number | undefined>(undefined),
    x: new MotionValue<number>(0),
    y: new MotionValue<number>(0),
    opacity: new MotionValue<number>(0),
  })

  const setMainStyles = useCallback((data: any) => {
    const mainStyle = mainStyleRef.current
    if (!mainStyle.width.get() || !mainStyle.height.get()) {
      mainStyle.width.set(data.width)
      mainStyle.height.set(data.height)
    }

    const footerYOffset = footerRef.current?.getBoundingClientRect()?.y ?? 0

    mainStyle.x.set(data.x - data.width / 2)
    mainStyle.y.set(data.y - data.height / 2 - footerYOffset)
  }, [])

  const setPostStyles = useCallback(
    (data: any) => {
      const postStyle = postStyleRef.current
      const newWidth = globalWidth - (data.x + data.width)
      if (!postStyle.width.get() || !postStyle.height.get()) {
        postStyle.width.set(newWidth)
        postStyle.height.set(data.height)
      } else {
        // postStyle.scaleX.set(newWidth / postStyle.width.get())
        // postStyle.scaleY.set(data.y / postStyle.height.get())
      }

      const footerYOffset = footerRef.current?.getBoundingClientRect()?.y ?? 0

      postStyle.x.set(data.x + data.width / 2)
      postStyle.y.set(data.y - data.height / 2 - footerYOffset)

      if (!postStyle.opacity.get()) {
        postStyle.opacity.set(1)
      }
    },
    [globalWidth]
  )

  const setAllStyles = useCallback(
    (data: any) => {
      if (!data) return
      setMainStyles(data)
      setPostStyles(data)
    },
    [setPostStyles, setMainStyles]
  )

  useEffect(() => subArrowData(setAllStyles), [setAllStyles])

  const scrollToIntro = (e: any) => requestScrollControl({ masterIndex: 1 })

  return (
    <div
      className={s.footer}
      ref={footerRef}
    >
      <motion.div
        className={s.arrow}
        style={mainStyleRef.current}
        onClick={scrollToIntro}
      />
      <motion.div
        className={cn(s.postArrow)}
        style={postStyleRef.current}
      >
        <EngineNav className={s.menu} />
      </motion.div>
    </div>
  )
}

export { EngineLandingHeader, EngineLandingFooter }
