import { Point } from '@pixi/math'
import { easeOut, linear } from 'popmotion'

import { arrEquals } from '@components/engine/utils'
import {
  buildEmptyCornerPolyInstructions,
  buildQuadraticPolyInstructions,
} from '@lib/engine/geometry/buildCustomPolyInstructions'
import { getBBoxByCoords } from '@lib/engine/geometry/getBBoxByCoords'
import getCellMargin from '@lib/engine/geometry/getCellMargin'
import { getCentroidPointByCoords } from '@lib/engine/geometry/getCentroidPointByCoords'
import getPolygonLabelCentroidPointByCoords from '@lib/engine/geometry/getPolygonLabelCentroid'
import { offsetPoly } from '@lib/engine/geometry/offsetPoly/offsetPoly'
import { getRelativePoints } from '@lib/engine/renderer/utils'
import getConfig, { getPageTransitionDuration } from '@lib/engine/settings'
import { GEOMETRY_CURVE_METHOD } from '@lib/engine/settings/enums'
import {
  getCurrentMaxBreakpointValue,
  getGeometryCurveMethod,
  getMediaPolyRadius,
  getPolyRadius,
  hasGeometricOffsetScaling,
  isOutlineLineStyleModeWithNoFill,
  pointsHaveValidShape,
  usesRelativePoints,
  usingGeometricStyleStrategy,
  usingGeometryStrategy,
} from '@lib/engine/settings/utils'
import { blueprintsToScrollSimulationData } from '@lib/engine/simulation/blueprintsToScrollSimulationData'
import { buildClipper } from '@lib/engine/simulation/buildClipper'
import { buildSimulation } from '@lib/engine/simulation/buildSimulation'
import { animate } from '@lib/engine/simulation/lib/animate'
import transformCellBlueprintsToSimulationBlueprints from '@lib/engine/simulation/transformCellBlueprintsToSimulationBlueprints'
import {
  buildVoronoiCellsTween as buildTween,
  scrollSimulationsToTweens,
} from '@lib/engine/tween/buildVoronoiCellsTween'
import {
  EngineCellBlueprint,
  EngineCellData,
  EngineClipOptions,
  EngineDimensions,
  EngineInterpolationMetadata,
  EngineInterpolationResults,
  EngineMasterMetadata,
  EngineMasterResults,
  EnginePointerEvent,
  EngineSimulation,
  EngineSimulationBlueprint,
  EngineSimulationTween,
} from '@lib/engine/types'
import {
  cellHasMedia,
  cellUsesLabelCentroid,
  getCellIsInteractive,
  getCellKey,
  getCellOriginalData,
  getCellSite,
  getCellRawWeight,
} from '@lib/engine/utils/cellData'
import { lerpPoints } from '@lib/engine/utils/lerp'
import { isLargeBreakpoint } from '@lib/utils/bph'
import { requestScrollControl, ScrollData, setScrollData } from 'lib/state'

export type HandleSetInterpolated = (interpolated: EngineInterpolationMetadata) => void

type PlaybackControls =
  | {
      stop: () => void
    }
  | undefined

type EngineSimulatorOptions = {
  handleSetInterpolated?: HandleSetInterpolated
  handleAnimationComplete?: () => void
}

export class EngineSimulator {
  scrollTweens: EngineSimulationTween[] = []
  revertInteractionScrollTweenIndex = 0
  currentScrollTweenIndex = 0
  nextBlueprintsTween: EngineSimulationTween

  scrollSimulations: EngineSimulation[] = []

  interactionTween: EngineSimulationTween
  revertInteractionTweenWhileScrollingData: EngineSimulationTween
  revertInteractionTweenData: EngineSimulationTween

  interactionTweenPlaybackControls: PlaybackControls
  nextTweenPlaybackControls: PlaybackControls
  scrollData: ScrollData | undefined
  isTweeningNewBlueprints = false
  isTweeningInteraction = false
  isTweeningExpansion = false
  unprocessedInteractionTween = false
  isTweening = false
  isTweeningResize = false
  isScrolling = false

  cellBlueprints: EngineCellBlueprint[] = []
  simulationBlueprints: EngineSimulationBlueprint[] = []

  interactionSimulation: EngineSimulation
  scrollInterpolationProgress = 0
  previousScrollInterpolationProgress = 0
  scrollDirDown = true
  lastDimensions: EngineDimensions = [0, 0]
  dimensions: EngineDimensions = [0, 0]

  handleSetInterpolated: HandleSetInterpolated | undefined
  handleAnimationComplete: (() => void) | undefined
  interpolatedMetadata: EngineInterpolationMetadata | undefined
  mastersMetadata: EngineMasterMetadata[] = []
  authoritativeInterpolatedMetadata: EngineInterpolationMetadata | undefined

  constructor({ handleSetInterpolated, handleAnimationComplete }: EngineSimulatorOptions = {}) {
    this.handleSetInterpolated = handleSetInterpolated
    this.handleAnimationComplete = handleAnimationComplete
  }

  setIsScrolling(isScrolling: boolean) {
    this.isScrolling = isScrolling
  }

  setDimensions(dimensions: EngineDimensions) {
    this.dimensions = dimensions
  }

  getDimensions = () => {
    return this.dimensions
  }

  getInterpolatedCellDataList = () => {
    return this.interpolatedMetadata?.cellDataList || []
  }

  getInterpolatedClipping = () => {
    return this.interpolatedMetadata?.clipping || []
  }

  getAuthoritativeCellDataList = () => {
    return this.authoritativeInterpolatedMetadata?.cellDataList || []
  }

  getInterpolatedCellDataMap = () => {
    return this.interpolatedMetadata?.cellDataMap || {}
  }

  getAuthoritativeCellDataMap = () => {
    return this.authoritativeInterpolatedMetadata?.cellDataMap || {}
  }

  setInterpolated = (interpolated: EngineInterpolationResults, authoritative = true) => {
    this.processCellData(interpolated)
    const cellDataList = interpolated.cells
    this.interpolatedMetadata = {
      bbox: interpolated.bbox,
      clipping: interpolated.clipping,
      facets: interpolated.facets,
      cellDataList: cellDataList,
      cellDataMap: cellDataList.reduce(
        (map, item) => ({
          ...map,
          [getCellKey(item)]: item,
        }),
        {}
      ),
    }
    if (authoritative) this.authoritativeInterpolatedMetadata = this.interpolatedMetadata
    this.handleSetInterpolated?.(this.interpolatedMetadata)
  }

  setMasters = (masters: EngineMasterResults[]) => {
    this.mastersMetadata = masters.map((master) => {
      return {
        clipping: master.clipping,
        cellDataList: master.cells,
        cellDataMap: master.cells.reduce(
          (map, item) => ({
            ...map,
            [getCellKey(item)]: item,
          }),
          {}
        ),
      }
    })
  }

  processCellData = (results: EngineInterpolationResults) => {
    const cellDataList = results.cells
    cellDataList.forEach((cellData) => {
      const site = getCellSite(cellData)
      const sitePoint = new Point(site.x, site.y)
      const centroidPoint = getCentroidPointByCoords(cellData)
      const bbox = getBBoxByCoords(cellData)
      let labelCentroidPoint

      if (cellUsesLabelCentroid(cellData)) {
        labelCentroidPoint = getPolygonLabelCentroidPointByCoords(cellData, bbox)
      }

      const originalPoints = cellData.map((coords) => new Point(...coords))
      let absolutePoints = originalPoints

      if (usingGeometricStyleStrategy() && !isOutlineLineStyleModeWithNoFill()) {
        if (hasGeometricOffsetScaling()) {
          absolutePoints = offsetPoly(originalPoints, -getCellMargin())
        }
      }
      const relativePoints = getRelativePoints(absolutePoints, centroidPoint)

      let absoluteMediaPoints = absolutePoints
      let relativeMediaPoints
      if (cellHasMedia(cellData) && usingGeometricStyleStrategy() && bbox) {
        absoluteMediaPoints = absolutePoints
        const polyOffset = getCurrentMaxBreakpointValue(getConfig().visuals.media?.polyOffset)
        if (isOutlineLineStyleModeWithNoFill() && polyOffset) {
          absoluteMediaPoints = offsetPoly(absoluteMediaPoints, polyOffset || 0)
          relativeMediaPoints = getRelativePoints(absoluteMediaPoints, centroidPoint)
        } else {
          relativeMediaPoints = relativePoints
        }
      }

      let linePolyInstructions
      let mediaPolyInstructions

      if (usingGeometryStrategy()) {
        switch (getGeometryCurveMethod()) {
          case GEOMETRY_CURVE_METHOD.EMPTY:
            const polyRadius = getPolyRadius()
            if (polyRadius) {
              let calcClippingEdges = true
              linePolyInstructions = buildEmptyCornerPolyInstructions(
                usesRelativePoints() ? relativePoints : absolutePoints,
                originalPoints,
                polyRadius * (isLargeBreakpoint() ? 1.5 : 1),
                calcClippingEdges,
                results.bbox
              )
            }

            const mediaPolyRadius = getMediaPolyRadius()
            if (mediaPolyRadius) {
              const mediaPointsToUse = usesRelativePoints() ? relativeMediaPoints : absoluteMediaPoints
              if (cellHasMedia(cellData) && mediaPointsToUse && pointsHaveValidShape(mediaPointsToUse)) {
                mediaPolyInstructions = buildQuadraticPolyInstructions(mediaPointsToUse, mediaPolyRadius)
              }
            }

            break
        }
      }

      getCellOriginalData(cellData).manipulation = {
        sitePoint,
        centroidPoint,
        bbox,
        labelCentroidPoint,
        originalPoints,
        absolutePoints,
        relativePoints,
        absoluteMediaPoints,
        relativeMediaPoints,
        linePolyInstructions,
        mediaPolyInstructions,
      }
    })
  }

  setCellBlueprints = (cellBlueprints: EngineCellBlueprint[]) => (this.cellBlueprints = cellBlueprints)

  handleScrollData = (scrollData: ScrollData) => {
    this.scrollData = scrollData
    if (this.isTweeningNewBlueprints || this.isTweeningResize) return
    if (this.scrollInterpolationProgress !== scrollData.progress) {
      this.previousScrollInterpolationProgress = this.scrollInterpolationProgress
      this.scrollInterpolationProgress = scrollData.progress
      this.interpolateScrollTweens(this.scrollInterpolationProgress)
    }
  }

  resetInteraction = () => {
    this.isTweeningInteraction = false
    this.isTweeningExpansion = false
    this.unprocessedInteractionTween = false
    this.stopInteractionTweenAnimator()
    this.revertInteractionTweenWhileScrollingData = null
    this.revertInteractionTweenData = null
  }

  simulateCurrentBlueprints = () => {
    this.resetInteraction()
    this.simulationBlueprints = transformCellBlueprintsToSimulationBlueprints(this.cellBlueprints)
    if (this.simulationBlueprints.length > 0) {
      this.simulateBlueprints()
      this.scrollTweens = scrollSimulationsToTweens(this.scrollSimulations, { dimensions: this.getDimensions() })
    }
  }

  interpolateNextBlueprintsTween = (value = 0) => this.setInterpolated(this.nextBlueprintsTween?.interpolate(value))

  // page transition
  simulateAndTweenNextBlueprints = () => {
    this.resetInteraction()
    this.simulationBlueprints = transformCellBlueprintsToSimulationBlueprints(this.cellBlueprints)
    this.simulateBlueprints()

    this.nextBlueprintsTween = buildTween([this.getInterpolatedCellDataList(), this.mastersMetadata[0].cellDataList], {
      interpolationRange: [this.scrollInterpolationProgress, 0], // always transitions to the start,
      dimensions: this.getDimensions(),
      clippingRange: [this.getInterpolatedClipping(), this.mastersMetadata[0].clipping],
    })

    this.stopNextTweenAnimator()

    this.isTweening = true
    this.isTweeningNewBlueprints = true

    setScrollData({
      progress: 0,
      position: 0,
    })

    this.nextTweenPlaybackControls = animate({
      from: 0,
      to: 1,
      ease: easeOut,
      duration: getPageTransitionDuration(),
      onUpdate: this.interpolateNextBlueprintsTween,
      onComplete: () => {
        this.scrollTweens = scrollSimulationsToTweens(this.scrollSimulations, { dimensions: this.getDimensions() })
        this.isTweening = false
        this.isTweeningNewBlueprints = false
        setScrollData({
          position: 0,
          progress: 0,
        })
        this.handleAnimationComplete?.()
      },
    })
  }

  interpolateInteractionTween = (value = 0) => {
    this.setInterpolated(this.interactionTween.interpolate(value), false)
  }

  interpolateResizeInteractionTween = (value = 0) => {
    this.setInterpolated(this.interactionTween.interpolate(value), true)
  }

  stopNextTweenAnimator = () => {
    this.nextTweenPlaybackControls?.stop()
    this.isTweeningNewBlueprints = false
  }

  stopInteractionTweenAnimator = () => {
    this.interactionTweenPlaybackControls?.stop()
    this.isTweeningInteraction = false
    this.isTweeningExpansion = false
  }
  tweenPointerInteractionSimulation = (
    newCells: EngineCellData[],
    tweenDurationFactor = 1,
    onStart?: () => void,
    onComplete?: () => void
  ) => {
    const clipOptions: EngineClipOptions = {
      evolving: false,
      interpolationRange: [this.scrollInterpolationProgress, this.scrollInterpolationProgress],
      dimensions: this.getDimensions(),
    }

    this.interactionTween = buildTween([this.getInterpolatedCellDataList(), newCells], clipOptions)

    this.stopInteractionTweenAnimator()

    onStart?.()
    this.isTweeningInteraction = true
    this.interactionTweenPlaybackControls = animate({
      from: 0,
      to: 1,
      ease: easeOut,
      duration: 750 * tweenDurationFactor,
      onUpdate: this.interpolateInteractionTween,
      onComplete: () => {
        this.isTweeningInteraction = false
        this.unprocessedInteractionTween = true
        this.handleAnimationComplete?.()
        onComplete?.()
      },
    })
  }

  tweenResizeInteractionSimulation = (newCells: EngineCellData[], customClipOptions?: Partial<EngineClipOptions>) => {
    const clipOptions: EngineClipOptions = {
      interpolationRange: [this.scrollInterpolationProgress, this.scrollInterpolationProgress],
      dimensionsRange: [this.lastDimensions, this.getDimensions()],
      dimensions: this.getDimensions(),
      ...customClipOptions,
    }

    this.interactionTween = buildTween([this.getInterpolatedCellDataList(), newCells], clipOptions)

    this.stopInteractionTweenAnimator()
    this.isTweeningInteraction = true
    this.isTweening = true
    this.isTweeningResize = true

    this.interactionTweenPlaybackControls = animate({
      from: 0,
      to: 1,
      ease: linear,
      duration: 750,
      onUpdate: this.interpolateResizeInteractionTween,
      onComplete: () => {
        this.resetInteraction()
        this.isTweening = false
        this.isTweeningResize = false
        this.handleAnimationComplete?.()
      },
    })
  }

  playRevertInteractionTween = () => {
    this.stopInteractionTweenAnimator()

    this.isTweeningInteraction = true
    this.interactionTweenPlaybackControls = animate({
      from: 0,
      to: 1,
      ease: easeOut,
      duration: 750,
      onUpdate: this.interpolateRevertInteractionTween,
      onComplete: () => {
        this.handleAnimationComplete?.()
        this.resetInteraction()
      },
    })
  }

  simulatePointerInteraction = (pointer: EnginePointerEvent) => {
    if (this.isTweening) return

    const { type, point, cellData } = pointer

    const lastScrollSpeed = this.scrollData?.speed
    if (this.isScrolling && lastScrollSpeed) {
      if (type === 'pointerout') {
        return
      }
      if (lastScrollSpeed > 0.2) {
        return
      } else {
        requestScrollControl({ stop: true })
      }
    }

    const isInteractive = cellData ? getCellIsInteractive(cellData) : false
    const pointerCellKey = getCellKey(cellData)

    if (isInteractive && point && type === 'pointermove') {
      if (this.isTweeningExpansion) return
      let tweenDurationFactor = 1

      const interactionSimulationBlueprint: EngineSimulationBlueprint = []

      const authoritativeCellDataList = this.getAuthoritativeCellDataList()
      const weights = authoritativeCellDataList.map((cellData) => {
        return getCellRawWeight(cellData)
      })

      const lowestWeight = weights.reduce((a, b) => (b < a ? b : a), 0)
      const adjustedWeights = weights.map((weight) => (weight - lowestWeight + 10000) / 100000)
      const highestAdjustedWeight = adjustedWeights.reduce((a, b) => (b > a ? b : a), 0)
      const sum = adjustedWeights.reduce((a, b) => a + b, 0)
      const avgAdjustedWeight = sum / adjustedWeights.length || 0

      authoritativeCellDataList.forEach((cellData: EngineCellData, index) => {
        const cellKey = getCellKey(cellData)
        const authoritativeSitePoint = new Point(cellData.site.x, cellData.site.y)

        let position
        let weight

        if (cellKey === pointerCellKey) {
          position = authoritativeSitePoint
          position = lerpPoints(authoritativeSitePoint, point, 0.2)
          weight = adjustedWeights[index]

          if (weight < avgAdjustedWeight) {
            weight = avgAdjustedWeight
          }
          weight *= 1.5

          if (weight < highestAdjustedWeight) {
            weight = highestAdjustedWeight
          }
        } else {
          position = authoritativeSitePoint
          const rawWeight = weights[index]
          if (rawWeight === lowestWeight) {
            return
          }
          weight = adjustedWeights[index] / 1.5
        }

        interactionSimulationBlueprint.push({
          ...getCellOriginalData(cellData),
          position,
          weight,
        })
      })

      try {
        this.interactionSimulation = buildSimulation(
          interactionSimulationBlueprint,
          authoritativeCellDataList,
          buildClipper({ dimensions: this.getDimensions() })(this.scrollInterpolationProgress).clipping,
          {
            maxIterationCount: 50, // less random noise when moving if it stays high
            useRawWeight: false,
            canAdaptPositions: false,
          }
        )

        this.tweenPointerInteractionSimulation(this.interactionSimulation.state().cells, tweenDurationFactor)
      } catch (e) {
        console.error(e)
      }
    } else if (isInteractive && point && pointerCellKey && type === 'expand') {
      const cellData = this.getInterpolatedCellDataMap()?.[pointerCellKey]
      if (cellData) {
        this.interactionSimulation = buildSimulation(
          [getCellOriginalData(cellData)],
          this.getInterpolatedCellDataList(),
          buildClipper({ dimensions: this.getDimensions() })(this.scrollInterpolationProgress).clipping,
          { maxIterationCount: 1 }
        )

        this.tweenPointerInteractionSimulation(
          this.interactionSimulation.state().cells,
          2,
          () => (this.isTweeningExpansion = true),
          () => (this.isTweeningExpansion = false)
        )
      }
    } else if (!this.isScrolling) {
      this.buildRevertInteractionTweenData()
      this.playRevertInteractionTween()
    }
  }

  interpolateScrollTweensCurrentProgress = () =>
    this.setInterpolated(this.interpolateScrollTweensInternal(this.scrollInterpolationProgress))

  interpolateScrollTweensInternal = (value = 0) => {
    const relativeInterpolationValue = value * this.scrollTweens?.length - this.currentScrollTweenIndex
    return this.scrollTweens[this.currentScrollTweenIndex]?.interpolate(relativeInterpolationValue)
  }

  interpolateRevertInteractionWhileScrollingTween = (value = 0) => {
    if (!this.revertInteractionTweenWhileScrollingData) return

    const { tween, interpolationRange } = this.revertInteractionTweenWhileScrollingData
    const factor = 1 / Math.abs(interpolationRange[1] - interpolationRange[0])
    const relativeValue = (value - interpolationRange[0]) * factor

    if (value > interpolationRange[1] || value < interpolationRange[0]) {
      this.resetInteraction()
      return
    }

    this.setInterpolated(tween.interpolate(relativeValue))
  }

  interpolateRevertInteractionTween = (v = 0) => {
    if (!this.revertInteractionTweenData) return

    const { tween } = this.revertInteractionTweenData

    this.setInterpolated(tween.interpolate(v), false)
  }

  interpolateScrollTweens = (value = 0) => {
    if (!this.scrollTweens?.length) return

    const scrollTweenProgress = Math.max(0, value * this.scrollTweens?.length)

    const scrollTweenIndex = Math.min(
      this.scrollTweens?.length - 1,
      Math.max(0, Math.floor(value * this.scrollTweens?.length))
    )

    const scrollDirDown = value > this.previousScrollInterpolationProgress
    const scrollDirChanged = scrollDirDown !== this.scrollDirDown
    this.scrollDirDown = scrollDirDown

    this.currentScrollTweenIndex = scrollTweenIndex

    if (
      this.isTweeningInteraction ||
      this.unprocessedInteractionTween ||
      (this.revertInteractionTweenWhileScrollingData && scrollDirChanged)
    ) {
      this.revertInteractionScrollTweenIndex = this.currentScrollTweenIndex

      this.isTweeningInteraction && this.stopInteractionTweenAnimator()
      this.unprocessedInteractionTween = false

      const currentCells = this.getInterpolatedCellDataList()
      const newCells =
        this.scrollSimulations[this.revertInteractionScrollTweenIndex + (scrollDirDown ? 1 : 0)].state().cells

      const cellSets: [EngineCellData[], EngineCellData[]] = scrollDirDown
        ? [currentCells, newCells]
        : [newCells, currentCells]
      const newInterpolationValue =
        (this.revertInteractionScrollTweenIndex + (scrollDirDown ? 1 : 0)) / this.scrollTweens.length

      const interpolationRange: [number, number] = scrollDirDown
        ? [value, newInterpolationValue]
        : [newInterpolationValue, value]

      this.buildRevertInteractionWhileScrollingTweenData(cellSets, interpolationRange)

      this.interpolateRevertInteractionWhileScrollingTween(value)
    } else if (this.revertInteractionTweenWhileScrollingData) {
      this.interpolateRevertInteractionWhileScrollingTween(value)
    } else {
      this.setInterpolated(this.interpolateScrollTweensInternal(value))
    }
  }

  buildRevertInteractionTweenData = (
    cellSets: [EngineCellData[], EngineCellData[]] = [
      this.getInterpolatedCellDataList(),
      this.getAuthoritativeCellDataList(),
    ],
    interpolationRange: [number, number] = [this.scrollInterpolationProgress, this.scrollInterpolationProgress]
  ) => {
    this.revertInteractionTweenData = {
      tween: buildTween(cellSets, {
        interpolationRange,
        dimensions: this.getDimensions(),
      }),
      interpolationRange,
    }
  }

  buildRevertInteractionWhileScrollingTweenData = (
    cellSets: [EngineCellData[], EngineCellData[]] = [
      this.getInterpolatedCellDataList(),
      this.getAuthoritativeCellDataList(),
    ],
    interpolationRange?: [number, number]
  ) => {
    this.revertInteractionTweenWhileScrollingData = {
      tween: buildTween(cellSets, {
        interpolationRange,
        dimensions: this.getDimensions(),
      }),
      interpolationRange,
    }
  }

  simulateResizeInteraction = () => {
    const newDimensions = this.getDimensions()
    if (!arrEquals(this.lastDimensions, newDimensions) && this.simulationBlueprints.length > 0) {
      requestScrollControl({ stop: true })
      this.resetInteraction()
      this.simulationBlueprints = transformCellBlueprintsToSimulationBlueprints(this.cellBlueprints)
      this.simulateBlueprints()
      this.scrollTweens = scrollSimulationsToTweens(this.scrollSimulations, { dimensions: this.getDimensions() })
      this.tweenResizeInteractionSimulation(
        this.interpolateScrollTweensInternal(this.scrollInterpolationProgress).cells
      )
      this.lastDimensions = newDimensions
    }
  }

  simulateBlueprints = () => {
    const masters: EngineMasterResults[] = []
    const scrollSimulations: EngineSimulation[] = []
    blueprintsToScrollSimulationData(this.simulationBlueprints, {
      dimensions: this.getDimensions(),
    }).forEach(({ simulation, clipping }) => {
      masters.push({
        cells: simulation.state().cells,
        clipping,
      })
      scrollSimulations.push(simulation)
    })
    this.setMasters(masters)
    this.scrollSimulations = scrollSimulations
  }
}
