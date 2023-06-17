import { MutableRefObject, useCallback, useRef } from 'react'

import { FORMATS } from '@pixi/constants'
import { Renderer } from '@pixi/core'

import getConfig from '@lib/engine/settings'
import { setStyles } from '@lib/engine/utils/setStyles'

export const useDevHelpers = (): {
  initDevHelpers: (renderer?: Renderer) => void
  statsRef: MutableRefObject<any>
  gameStatsRef: MutableRefObject<any>
  datGuiRef: MutableRefObject<any>
} => {
  const statsRef = useRef<any>()
  const gameStatsRef = useRef<any>()
  const datGuiRef = useRef<any>()

  const initDevHelpers = useCallback(async (renderer?: Renderer) => {
    if (!renderer) return

    if (getConfig().dev?.stats && !statsRef.current && !(window as any).Stats) {
      const Stats = ((window as any).Stats = (await import('stats-js')).default)
      statsRef.current = new Stats()
      setStyles(statsRef.current.domElement, {
        position: 'absolute',
        top: '3px',
        left: '3px',
      })
      statsRef.current.showPanel(0) // 0: fps,2: mb, 1: ms, 3+: custom
      document.body.appendChild(statsRef.current.dom)
    }
    if (getConfig().dev?.gameStats && !gameStatsRef.current && !(window as any).GameStats) {
      // const GameStats = ((window as any).GameStats = (await import('gamestats.js')).default)
      const GameStats = ((window as any).GameStats = (await import('@lib/engine/gamestats/index')).default)
      gameStatsRef.current = new GameStats({
        pixi: {
          formats: FORMATS,
          renderer,
        },
      })

      document.body.appendChild(gameStatsRef.current.dom)
    }
    if (getConfig().dev?.gui && !datGuiRef.current && !(window as any).DatGui) {
      const Dat = ((window as any).DatGui = await import('dat.gui'))
      datGuiRef.current = new Dat.GUI(/*{ load: CONFIG }*/)

      // Object.entries(CONFIG).forEach(([key, value]) => {
      //   if (typeof value === 'number') {
      //     datGuiRef.current.add(CONFIG, key) /*.min(0).max(1).step(0.01)*/
      //     // } else if (typeof value === 'boolean') {
      //   } else {
      //     datGuiRef.current.add(CONFIG, key)
      //   }
      // })
    }
  }, [])

  // useEffect(() => {
  //   void initDevHelpers()
  // }, [initDevHelpers])

  return {
    initDevHelpers,
    statsRef,
    gameStatsRef,
    datGuiRef,
  }
}
