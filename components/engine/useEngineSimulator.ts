import { useCallback, useEffect, useMemo, useRef } from 'react'

import { debounce } from 'debounce'

import { EngineSimulatorManager } from '@lib/engine/simulation/EngineSimulatorManager'
import { EngineCellBlueprint, EngineDimensions } from '@lib/engine/types'
import throttle from '@lib/engine/utils/throttle'
import { getDimensions, subCurrentPointer, subDimensions, subIsScrolling, subScrollData } from 'lib/state'

type SimulatorProps = {
  cellBlueprints: EngineCellBlueprint[]
}

export const useEngineSimulator = ({ cellBlueprints }: SimulatorProps) => {
  const cellBlueprintsRef = useRef<EngineCellBlueprint[]>([])

  const scrollInterpolationProgressRef = useRef<number>(0)
  const previousScrollInterpolationProgressRef = useRef<number>(0)
  const currentDimensionsRef = useRef<EngineDimensions>(getDimensions())
  const simulatorManagerRef = useRef<EngineSimulatorManager>(new EngineSimulatorManager())

  // @ToDo move processing to worker
  // const tsWorkerRef = useRef<Worker | null>()
  //
  // const tsWorkerMessagesRef = useRef<string[]>([])
  //
  // useEffect(() => {
  //   // From https://webpack.js.org/guides/web-workers/#syntax
  //   tsWorkerRef.current = new Worker(new URL('./simulation.worker.ts', import.meta.url))
  //
  //   tsWorkerRef.current.addEventListener('message', (evt) => {
  //     console.log('Message from TS worker:', evt.data)
  //     const newMessages = [...tsWorkerMessagesRef.current, evt.data]
  //     tsWorkerMessagesRef.current = newMessages
  //   })
  //
  //   tsWorkerRef.current.postMessage({ type: 'start' })
  // }, [])

  const blueprintsHaveChanged = useCallback(
    () => cellBlueprintsRef.current?.length && cellBlueprints?.length && cellBlueprintsRef.current !== cellBlueprints,
    [cellBlueprints]
  )

  useEffect(() => {
    if (!cellBlueprints.length) return

    simulatorManagerRef.current.setCellBlueprints(cellBlueprints)

    if (blueprintsHaveChanged()) {
      simulatorManagerRef.current.simulateAndTweenNextBlueprints()
    } else {
      simulatorManagerRef.current.simulateCurrentBlueprints()
      simulatorManagerRef.current.interpolateScrollTweensCurrentProgress()
    }
    cellBlueprintsRef.current = cellBlueprints
  }, [cellBlueprints])

  const throttledhandleScrollData = useMemo(
    () => throttle(simulatorManagerRef.current.handleScrollData.bind(simulatorManagerRef.current), 1000 / 30),
    []
  )

  useEffect(() => {
    // subScrollProgress(throttledhandleScrollData)
    subScrollData(simulatorManagerRef.current.handleScrollData.bind(simulatorManagerRef.current))
  }, [])

  useEffect(() => {
    subIsScrolling(simulatorManagerRef.current.setIsScrolling.bind(simulatorManagerRef.current))
  }, [])

  const debounceSimulatePointerInteraction = useMemo(
    () => debounce(simulatorManagerRef.current.simulatePointerInteraction.bind(simulatorManagerRef.current), 25),
    []
  )

  const debounceSimulateResizeInteraction = useMemo(
    () => debounce(simulatorManagerRef.current.simulateResizeInteraction.bind(simulatorManagerRef.current), 25),
    []
  )

  useEffect(() => {
    setTimeout(() => {
      currentDimensionsRef.current = getDimensions()
      subDimensions(debounceSimulateResizeInteraction)
    }, 1000)
  }, [debounceSimulateResizeInteraction])

  // useEffect(() => subCurrentPointer(debounceSimulatePointerInteraction), [debounceSimulatePointerInteraction])
  useEffect(
    () => subCurrentPointer(simulatorManagerRef.current.simulatePointerInteraction.bind(simulatorManagerRef.current)),
    [debounceSimulatePointerInteraction]
  )
}
