import breakpointHelper from 'breakpoint-helper'
import { isMobile } from 'react-device-detect'

import { isClient } from '@lib/utils/common'

import config from '../../tailwind.config.js'

const bph = breakpointHelper(config.theme.screens)

export const { getBreakpoints, getMediaQuery, isMatching, listen, listenAll } = bph

type BreakpointKey = keyof typeof config.theme.screens

let currentMaxBp: BreakpointKey | 'base' | undefined

if (isClient) {
  window.onresize = () => (currentMaxBp = undefined)
}

export const descendingBps = Object.keys(getBreakpoints()).reverse() as BreakpointKey[]

export const getCurrentMaxBreakpoint = () => {
  if (currentMaxBp) return currentMaxBp

  currentMaxBp = 'base'

  if (isClient) {
    for (let i = 0; i < descendingBps.length; i++) {
      if (isMatching(descendingBps[i])) {
        currentMaxBp = descendingBps[i]
        break
      }
    }
  }

  return currentMaxBp
}

export const isSmallBreakpoint = () => isMobile || !['md', 'lg', 'xl', '2xl'].includes(getCurrentMaxBreakpoint())

export const isLargeBreakpoint = () => ['md', 'lg', 'xl', '2xl'].includes(getCurrentMaxBreakpoint())

export default bph
