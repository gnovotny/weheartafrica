import React, { useCallback, useEffect, useMemo, useRef } from 'react'

import { BatchRenderer, Renderer as PixiRenderer } from '@pixi/core'
import { InteractionManager } from '@pixi/interaction'
import { Loader } from '@pixi/loaders'
import { settings as pixiSettings } from '@pixi/settings'
import { TilingSpriteRenderer } from '@pixi/sprite-tiling'
import { Ticker, UPDATE_PRIORITY } from '@pixi/ticker'
import { skipHello } from '@pixi/utils'
import { debounce } from 'debounce'
import sync, { cancelSync, Process } from 'framesync'
import { useRouter } from 'next/router'

import '@pixi/mixin-cache-as-bitmap'

import { RendererCell } from '@lib/engine/renderer/RendererCell'
import { createStages } from '@lib/engine/renderer/stages/createStages'
import { fillBG } from '@lib/engine/renderer/stages/helpers'
import { EngineRendererStageKey, EngineRendererStages } from '@lib/engine/renderer/types'
import getConfig, { getCurrentMaxBreakpointValue } from '@lib/engine/settings'
import { RENDERER_TICKER } from '@lib/engine/settings/enums'
import { canDeepRender, getDevicePixelRatio, usingIsolatedMediaCanvas, usingRafOnly } from '@lib/engine/settings/utils'
import { getCellOriginalProps } from '@lib/engine/utils/cellData'

import {
  addResources,
  clearResourceQueueMap,
  getCellDataMap,
  getDimensions,
  getResourceQueueMap,
  scheduleDeepRender,
  subCellDataMap,
  subDimensions,
  subRafAnimationCompleted,
  subResourceLoadScheduled,
  subRouteChangeRequests,
  unScheduleDeepRender,
  unscheduleResourceLoad,
  EngineCellDataMap,
} from '../../lib/state'

import { useCellCornersProcessor } from './experimental/useCellCornersProcessor'
import { useDevHelpers } from './useDevHelpers'

require('@lib/engine/renderer/pixiInteractionManagerOverrides')

const MEASURE_PERF = false
const RT_STAGES = ['base', 'firstBlur', 'secondBlur', 'secondBlurInverse', 'thirdBlur']
const RT_MEDIA_STAGES: string[] = ['mediaPreWrappers']

skipHello()

// Install renderer plugins
// PixiRenderer.registerPlugin('accessibility', AccessibilityManager)
// PixiRenderer.registerPlugin('particle', ParticleRenderer)
// PixiRenderer.registerPlugin('prepare', Prepare)
if (getCurrentMaxBreakpointValue(getConfig().pointerInteractions?.enabled)) {
  PixiRenderer.registerPlugin('interaction', InteractionManager)
}

PixiRenderer.registerPlugin('batch', BatchRenderer)
if (getCurrentMaxBreakpointValue(getConfig().features.textures)) {
  PixiRenderer.registerPlugin('tilingSprite', TilingSpriteRenderer)
}
pixiSettings.FILTER_RESOLUTION = getDevicePixelRatio()

type RendererCellMap = Record<string, RendererCell>

const Renderer = () => {
  const tickerRef = useRef<Ticker>()
  const syncProcessRef = useRef<Process>()
  const rendererRef = useRef<PixiRenderer>()
  const loadersRef = useRef<Loader[]>([])
  const mediaRendererRef = useRef<PixiRenderer>()
  const canvasElRef = useRef<HTMLCanvasElement>(null)
  const mediaCanvasElRef = useRef<HTMLCanvasElement>(null)
  const stagesRef = useRef<EngineRendererStages>({} as EngineRendererStages)
  const rtStagesRef = useRef<EngineRendererStages>({} as EngineRendererStages)
  const rtMediaStagesRef = useRef<EngineRendererStages>({} as EngineRendererStages)
  const cellMapRef = useRef<RendererCellMap>({})

  const router = useRouter()

  // const { styleDOMCells, hideDOMCell } = useDOMStyler()
  const { drawCellCorners } = useCellCornersProcessor({
    stagesRef,
  })
  const { initDevHelpers, statsRef, gameStatsRef } = useDevHelpers()
  // const { renderShadows } = useVoronoiDynamicShadowRenderer({
  //   stagesRef,
  // })
  // const { initLogo, renderLogo } = useVoronoiCanvasLogo()

  const updateCells = useCallback((cellsDataMap: EngineCellDataMap) => {
    const nextCells: RendererCellMap = {}
    Object.entries(cellsDataMap).forEach(([k, v]) => {
      if (getCellOriginalProps(v)?.isPlaceholder) return

      if (cellMapRef.current[k]) {
        const existingCell = cellMapRef.current[k]
        existingCell.update(v)
        nextCells[k] = existingCell
        existingCell.show()

        delete cellMapRef.current[k]
      } else {
        nextCells[k] = new RendererCell(v, stagesRef.current)
      }
    })

    Object.entries(cellMapRef.current).forEach(([k, cell]) => {
      // const el = cell?.metadata?.site?.originalObject?.data?.originalData?.ref?.current
      // el && getConfig().features.dom && hideDOMCell(el/*, true*/)
      cell?.hide()
    })
    cellMapRef.current = { ...nextCells, ...cellMapRef.current /*.filter((cell) => !!cell)*/ }
  }, [])

  const resize = useCallback(() => {
    const [width, height] = getDimensions()

    if (!rendererRef.current || !canvasElRef.current) return

    canvasElRef.current.width = width * getDevicePixelRatio()
    canvasElRef.current.height = height * getDevicePixelRatio()

    rendererRef.current?.resize(width, height)

    if (usingIsolatedMediaCanvas() && mediaCanvasElRef.current && mediaRendererRef.current) {
      mediaCanvasElRef.current.width = width * getDevicePixelRatio()
      mediaCanvasElRef.current.height = height * getDevicePixelRatio()
      mediaRendererRef.current?.resize(width, height)
    }

    Object.values(stagesRef.current).forEach(({ rt, bg }) => {
      rt?.resize(width /* * 1.125*/, height /* * 1.125*/)
      bg && fillBG(bg, width, height)
    })

    scheduleDeepRender()
  }, [])

  const debounceResize = useMemo(() => debounce(resize, 25), [resize])

  useEffect(() => {
    void init()
    return () => destroy()
  }, [])

  const handleInitError = useCallback((e: Error) => {
    console.error(e)
    setTimeout(init, 500)
  }, [])

  const init = useCallback(
    /*async */ () => {
      // if using wasm lib
      // if (usingPolyOffset()) {
      //   await asyncInitWasmPolygonOffsetter()
      // }
      try {
        initInteractionHelpers()
        initRenderers()
        initLoader()
        initDevHelpers(rendererRef.current)
        initStages()
        // initLogo(stagesRef)

        // let tickerRestartTimeoutId: Timeout

        subCellDataMap(handleCellDataUpdate)
        subDimensions(debounceResize)

        handleCellDataUpdate(getCellDataMap())
        initTicker()

        usingRafOnly() && subRafAnimationCompleted(startTicker)
      } catch (e) {
        handleInitError(e)
      }
    },
    []
  )

  const destroy = useCallback(
    (
      options = {
        texture: true,
        children: true,
        baseTexture: true,
      }
    ) => {
      destroyTicker()
      Object.entries(cellMapRef.current).forEach(([k, cell]) => cell?.destroy(options))
      cellMapRef.current = {}
      try {
        stagesRef.current.final?.scene.destroy(options)
        stagesRef.current = {}
        if (rendererRef.current) {
          ;(rendererRef.current as any).baseScene = undefined
          rendererRef.current.destroy(false)
          rendererRef.current = undefined
        }
        mediaRendererRef.current?.destroy(false)
        mediaRendererRef.current = undefined
      } catch (e) {
        console.error(e)
      }
    },
    []
  )

  const initInteractionHelpers = useCallback(() => {
    subRouteChangeRequests((route) => {
      route && router.push(route)
    })
  }, [])

  const initRenderers = useCallback(() => {
    if (!canvasElRef.current) {
      handleInitError(new Error('Canvas element not found'))
      return
    }

    const [width, height] = getDimensions()

    rendererRef.current = new PixiRenderer({
      width,
      height,
      view: canvasElRef.current,
      resolution: getDevicePixelRatio(),
      autoDensity: true,
      powerPreference: 'high-performance',
      backgroundAlpha: 0,
      antialias: getConfig().renderer.antialias,
      // autoStart: false,
    })

    if (usingIsolatedMediaCanvas()) {
      if (!mediaCanvasElRef.current) {
        handleInitError(new Error('Canvas element not found'))
        return
      }

      mediaRendererRef.current = new PixiRenderer({
        width,
        height,
        view: mediaCanvasElRef.current,
        resolution: getDevicePixelRatio(),
        autoDensity: true,
        // powerPreference: 'high-performance',
        backgroundAlpha: 0,
        antialias: getConfig().renderer.antialias,
        // antialias: true,
      })
      mediaRendererRef.current.plugins.interaction?.destroy()
    }

    // if (!isDev) {
    //   // eslint-disable-next-line no-console
    //   console.clear()
    // }
  }, [])

  const initLoader = useCallback(() => {
    loadersRef.current = [new Loader(), new Loader()]

    subResourceLoadScheduled((isResourceLoadScheduled) => {
      if (isResourceLoadScheduled) {
        unscheduleResourceLoad()
        runLoader()
      }
    })
  }, [])

  const getAvailableLoader = useCallback(() => {
    for (let i in loadersRef.current) {
      if (!loadersRef.current[i].loading) {
        return loadersRef.current[i]
      }
    }

    const newLoader = new Loader()
    loadersRef.current.push(newLoader)
    return newLoader
  }, [])

  const runLoader = useCallback(() => {
    const availableLoader = getAvailableLoader()
    Object.entries(getResourceQueueMap() || {})?.forEach(([url, cb]) => {
      availableLoader.add(url, cb)
    })
    clearResourceQueueMap()
    availableLoader.load((loader, resources) => {
      addResources(resources)
      loader.reset()
      scheduleDeepRender()
    })
  }, [])

  const initStages = useCallback(() => {
    if (!rendererRef.current) return
    stagesRef.current = createStages()
    rtStagesRef.current = (Object.keys(stagesRef.current) as EngineRendererStageKey[])
      .filter((key) => RT_STAGES.includes(key))
      .reduce((stages: EngineRendererStages, key) => {
        stages[key] = stagesRef.current[key]
        return stages
      }, {} as EngineRendererStages)

    usingIsolatedMediaCanvas() &&
      (rtMediaStagesRef.current = (Object.keys(stagesRef.current) as EngineRendererStageKey[])
        .filter((key) => RT_MEDIA_STAGES.includes(key))
        .reduce((stages: EngineRendererStages, key) => {
          stages[key] = stagesRef.current[key]
          return stages
        }, {} as EngineRendererStages))
    ;(rendererRef.current as any).baseScene = stagesRef.current.base?.scene
  }, [])

  const renderAppRTStages = useCallback((renderer: PixiRenderer, stages: EngineRendererStages) => {
    Object.entries(stages).forEach(([key, { scene, rt }]) => {
      MEASURE_PERF && performance.mark(`${key}Scene:start`)
      // console.log(`${key}Scene:start`)
      renderer.render(scene, {
        renderTexture: rt,
      })
      if (MEASURE_PERF) {
        performance.mark(`${key}Scene:end`)
        performance.measure(`${key}Scene`, `${key}Scene:start`, `${key}Scene:end`)
      }
    })
  }, [])

  const renderRTStages = useCallback(() => {
    if (MEASURE_PERF) {
      performance.clearMeasures()
      performance.clearMarks()
      performance.clearResourceTimings()
    }

    rendererRef.current && renderAppRTStages(rendererRef.current, rtStagesRef.current)
    usingIsolatedMediaCanvas() &&
      mediaRendererRef.current &&
      rtMediaStagesRef.current &&
      renderAppRTStages(mediaRendererRef.current, rtMediaStagesRef.current)
  }, [])

  const drawCells = useCallback(() => {
    RendererCell.preDrawShared()
    Object.entries(cellMapRef.current).forEach(([k, cell]) => cell.draw())
    RendererCell.postDrawShared()
  }, [])

  const deepRender = useCallback(() => {
    unScheduleDeepRender()

    // drawCells()
    //
    // /* optional */
    // drawCellCorners()
    // renderLogo()
    /* end optional */

    renderRTStages()
    // styleDOMCells()
  }, [drawCellCorners, drawCells, renderRTStages])

  const shallowRender = useCallback(() => {
    // styleDOMCells()
    stagesRef.current.final?.scene && rendererRef.current?.render(stagesRef.current.final?.scene)
    usingIsolatedMediaCanvas() &&
      stagesRef.current.finalMedia?.scene &&
      mediaRendererRef.current?.render(stagesRef.current.finalMedia?.scene)
  }, [])

  const render = useCallback(() => {
    canDeepRender() && deepRender()
    shallowRender()
  }, [])

  const handleTick = useCallback(() => {
    if (statsRef.current) {
      statsRef.current.update()
    }

    if (gameStatsRef.current) {
      gameStatsRef.current.begin()
    }

    render()

    if (gameStatsRef.current) {
      gameStatsRef.current.end()
    }
  }, [render, statsRef])

  const handleCellDataUpdate = useCallback((cellDataMap: EngineCellDataMap) => {
    if (usingRafOnly()) {
      // if (tickerRestartTimeoutId) clearTimeout(tickerRestartTimeoutId)
      stopTicker()

      // tickerRef.current?.update()
      // handleTick()

      if (statsRef.current) {
        statsRef.current.update()
      }

      if (gameStatsRef.current) {
        gameStatsRef.current.begin()
      }

      updateCells(cellDataMap)
      /* optional */
      // renderShadows()
      /* end optional */

      // drawCells()
      //
      // /* optional */
      // drawCellCorners()
      // // renderLogo()
      // /* end optional */

      scheduleDeepRender()
      render()

      if (gameStatsRef.current) {
        gameStatsRef.current.end()
      }
      // tickerRestartTimeoutId = setTimeout(() => tickerRef.current?.start(), 100)
    } else {
      updateCells(cellDataMap)
      drawCells()
      drawCellCorners()
      scheduleDeepRender()
    }
  }, [])

  const initTicker = useCallback(() => {
    if (getConfig().renderer.ticker === RENDERER_TICKER.FRAME_SYNC) {
      syncProcessRef.current = sync.render(handleTick, true)

      // Ticker.shared.autoStart = false
      // Ticker.shared.stop()
    } else {
      if (!tickerRef.current) {
        // tickerRef.current = new Ticker()
        tickerRef.current = Ticker.shared
        tickerRef.current.maxFPS = getConfig().renderer.maxFPS ?? undefined
        tickerRef.current.add(handleTick, UPDATE_PRIORITY.LOW)
      }
      startTicker()
    }
  }, [handleTick])

  const destroyTicker = useCallback(() => {
    if (getConfig().renderer.ticker === RENDERER_TICKER.FRAME_SYNC) {
      syncProcessRef.current && cancelSync.render(syncProcessRef.current)
    }
  }, [])

  const startTicker = useCallback(() => {
    if (getConfig().renderer.ticker === RENDERER_TICKER.FRAME_SYNC) {
    } else {
      tickerRef.current?.start()
    }
  }, [])
  const stopTicker = useCallback(() => {
    if (getConfig().renderer.ticker === RENDERER_TICKER.FRAME_SYNC) {
    } else {
      tickerRef.current?.stop()
    }
  }, [])

  return (
    <>
      <canvas
        ref={canvasElRef}
        className='absolute inset-0 w-full h-full pointer-events-none'
      />
      {usingIsolatedMediaCanvas() && (
        <canvas
          ref={mediaCanvasElRef}
          className='absolute inset-0 z-40 w-full h-full pointer-events-none'
        />
      )}
    </>
  )
}

export default React.memo(Renderer, () => true)
