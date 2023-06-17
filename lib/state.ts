import { MutableRefObject, RefObject } from 'react'

import { LoaderResource } from '@pixi/loaders'
import { debounce } from 'debounce'
import { atom } from 'jotai'

import { BBox } from '@lib/engine/geometry/getBBoxByCoords'
import { usingRafOnly } from '@lib/engine/settings/utils'
import {
  EngineCellData,
  EngineCellBlueprint,
  EngineClipping,
  EngineDimensions,
  EngineCellComponentProps,
  EngineSimulationBlueprint,
  EnginePointerEvent,
  EngineInterpolationMetadata,
} from '@lib/engine/types'
import { store } from '@lib/store'
import { isClient } from '@lib/utils/common'

export declare type Dict<T> = {
  [key: string]: T
}

type VoronoiProps = {
  props: EngineCellComponentProps
  ref: RefObject<HTMLDivElement | null> | MutableRefObject<HTMLDivElement | null>
}

export type EngineCellDataMap = Record<string, EngineCellData>

export type ScrollData = {
  progress: number
  position: number
  speed?: number
}

export const displayMenuAtom = atom<boolean>(false)
export const cellDataListAtom = atom<EngineCellData[]>([])
export const cellDataMapAtom = atom<EngineCellDataMap>({})
export const clippingAtom = atom<EngineClipping>([])
export const clippingBboxAtom = atom<BBox | undefined>(undefined)
export const facetsAtom = atom<any[]>([])
export const scrollDataAtom = atom<ScrollData>({
  progress: 0,
  position: 0,
  speed: 0,
})
export const isScrollingAtom = atom<boolean>(false)
export const dimensionsAtom = atom<EngineDimensions>(isClient ? [window.innerWidth, window.innerHeight] : [0, 0])
// export const dimensionsAtom = atom<VoronoiDimensions>([0, 0])
export const logoDataAtom = atom<any>(undefined)
export const arrowDataAtom = atom<any>(undefined)
export const resourceQueueMapAtom = atom<Record<string, any>>({})
export const resourceMapAtom = atom<Record<string, LoaderResource>>({})
export const scheduledResourceLoadBufferAtom = atom<boolean>(false)
export const scheduledResourceLoadAtom = atom<boolean>(false)
export const routeChangeRequestAtom = atom<string | undefined>(undefined)
export const scrollControlRequestAtom = atom<{ masterIndex?: number; stop?: boolean } | undefined>(undefined)
export const pathnameAtom = atom<string | undefined>(undefined)
export const prevPathnameAtom = atom<string | undefined>(undefined)
export const pageIsTransitioningAtom = atom<boolean>(false)
export const animationCompletedAtom = atom<string | number | undefined>(undefined)
export const requestDomStylesUpdateAtom = atom<string | number | undefined>(undefined)
export const cellIsExpandedAtom = atom<boolean | string>(false)

const cellBlueprintsBufferAtom = atom<EngineCellBlueprint[]>([])
export const cellBlueprintsAtom = atom<EngineCellBlueprint[]>([])
export const simulationBlueprintsAtom = atom<EngineSimulationBlueprint[]>([])
export const currentEnginePointerEventAtom = atom<EnginePointerEvent | null>(null)
export const scheduledDeepRenderAtom = atom<boolean>(false)
export const visibleCellKeysWithDisplacementAtom = atom<string[]>([])

export const cellsRefMapAtom = atom<Record<string, MutableRefObject<HTMLDivElement>>>({})

export const addResourcesAtom = atom(null, (get, set, resources: Dict<LoaderResource>) => {
  set(resourceMapAtom, (prev) => ({ ...prev, ...resources }))
})

const debounceCommitCellBlueprintsBuffer = debounce(() => {
  const cellBlueprints = [...(store.get(cellBlueprintsBufferAtom) ?? [])]
  store.set(cellBlueprintsAtom, cellBlueprints)
  // store.set(simulationBlueprintsAtom, transformCellBlueprintsToSimulationBlueprints(cellBlueprints))
}, 0)

const debounceCommitResourceLoadScheduledBuffer = debounce(() => {
  store.set(scheduledResourceLoadAtom, store.get(scheduledResourceLoadBufferAtom) as boolean)
}, 0)

export const addCellBlueprintAtom = atom(null, (get, set, update: VoronoiProps) => {
  const cellBlueprint = {
    props: {
      ...update.props,
      ref: update.ref,
    },
  }
  set(cellBlueprintsBufferAtom, (prev) => [...prev, cellBlueprint])
  debounceCommitCellBlueprintsBuffer()
})

export const removeCellBlueprintAtom = atom(null, (get, set, update: VoronoiProps) => {
  set(cellBlueprintsBufferAtom, (prev) =>
    prev.filter((cellBlueprint) => cellBlueprint.props.cellId !== update.props.cellId)
  )
  debounceCommitCellBlueprintsBuffer()
})

export const resetCellBlueprintsAtom = atom(null)

export const getDimensions = () => store.get(dimensionsAtom) as EngineDimensions
export const subDimensions = (cb: (dimensions: EngineDimensions) => void) =>
  store.sub(dimensionsAtom, () => cb(getDimensions()))
export const getScrollData = () => store.get(scrollDataAtom) as ScrollData
export const setScrollData = (data: ScrollData) => store.set(scrollDataAtom, data)
export const subScrollData = (cb: (data: ScrollData) => void) => store.sub(scrollDataAtom, () => cb(getScrollData()))
export const getCellDataList = () => store.get(cellDataListAtom) as EngineCellData[]
export const setCellDataList = (cells: EngineCellData[]) => cells && store.set(cellDataListAtom, cells)
export const subCellDataList = (cb: (cellDataList: EngineCellData[]) => void) =>
  store.sub(cellDataListAtom, () => cb(getCellDataList()))

export const getCellDataMap = () => store.get(cellDataMapAtom) as EngineCellDataMap
export const setCellDataMap = (cells: EngineCellDataMap) => cells && store.set(cellDataMapAtom, cells)
export const subCellDataMap = (cb: (cellDataMap: EngineCellDataMap) => void) =>
  store.sub(cellDataMapAtom, () => cb(getCellDataMap()))

export const getFacets = () => store.get(facetsAtom) as any[]
export const setFacets = (facets: any[]) => facets && store.set(facetsAtom, facets)
export const getClipping = () => store.get(clippingAtom) as EngineClipping
export const getClippingBbox = () => store.get(clippingBboxAtom) as BBox
export const setClippingBbox = (bbox: BBox) => bbox && store.set(clippingBboxAtom, bbox)
export const setClipping = (clipping: EngineClipping) => clipping && store.set(clippingAtom, clipping)
export const setInterpolated = ({ cellDataList, cellDataMap, facets, clipping, bbox }: EngineInterpolationMetadata) => {
  setClipping(clipping)
  setClippingBbox(bbox)
  setFacets(facets)
  setCellDataList(cellDataList)
  setCellDataMap(cellDataMap)
}

export const setIsScrolling = (newState: boolean) => {
  isScrolling() && !newState && usingRafOnly() && pubRafAnimationCompleted(performance.now())
  store.set(isScrollingAtom, newState)
}
export const isScrolling = () => store.get(isScrollingAtom) as boolean
export const subIsScrolling = (cb: (isScrolling: boolean) => void) =>
  store.sub(isScrollingAtom, () => cb(isScrolling()))

export const getLogoData = () => store.get(logoDataAtom)
export const subLogoData = (cb: (data: any) => void) => store.sub(logoDataAtom, () => cb(getLogoData()))
export const setLogoData = (data: any) => data && store.set(logoDataAtom, data)

export const getArrowData = () => store.get(arrowDataAtom)
export const subArrowData = (cb: (data: any) => void) => store.sub(arrowDataAtom, () => cb(getArrowData()))
export const setArrowData = (data: any) => data && store.set(arrowDataAtom, data)

export const subCurrentPointer = (cb: () => void) => store.sub(currentEnginePointerEventAtom, cb)
export const getCurrentPointer = () => store.get(currentEnginePointerEventAtom)

export const getResourceQueueMap = () => store.get(resourceQueueMapAtom)
export const setResourceQueueMap = (resourceQueueMap: Record<string, any>) =>
  store.set(resourceQueueMapAtom, resourceQueueMap)
export const clearResourceQueueMap = () => store.set(resourceQueueMapAtom, {})
export const getResourceMap = () => store.get(resourceMapAtom)
export const getResourceByKey = (key: string) => store.get(resourceMapAtom)?.[key]
export const addResources = (resources: Dict<LoaderResource>) => store.set(addResourcesAtom, resources)
export const loadResourceUrl = (url: string, cb: LoaderResource.OnCompleteSignal) => {
  store.set(resourceQueueMapAtom, (prev) => ({ ...prev, [url]: cb }))
  scheduleResourceLoad()
}

export const subResourceLoadScheduled = (cb: (isResourceLoadScheduled: boolean) => void) =>
  store.sub(scheduledResourceLoadAtom, () => cb(isResourceLoadScheduled()))
export const isResourceLoadScheduled = () => store.get(scheduledResourceLoadAtom) as boolean
export const scheduleResourceLoad = () => {
  store.set(scheduledResourceLoadBufferAtom, true)
  debounceCommitResourceLoadScheduledBuffer()
}
export const unscheduleResourceLoad = () => {
  store.set(scheduledResourceLoadBufferAtom, false)
  debounceCommitResourceLoadScheduledBuffer()
}

export const getRouterPreviousPathname = () => store.get(prevPathnameAtom)
export const getRouterPathname = () => store.get(pathnameAtom)
export const setRouterPreviousPathname = (pathname: string | undefined) => store.set(prevPathnameAtom, pathname)
export const setRouterPathname = (pathname: string) => store.set(pathnameAtom, pathname)
export const requestRouteChange = (route: string) => store.set(routeChangeRequestAtom, route)
export const subRouteChangeRequests = (cb: (route?: string) => void) =>
  store.sub(routeChangeRequestAtom, () => cb(store.get(routeChangeRequestAtom)))

export const setPageIsTransitioning = (isTransitioning: boolean) => store.set(pageIsTransitioningAtom, isTransitioning)
export const subPageIsTransitioning = (cb: (isTransitioning: boolean | undefined) => void) =>
  store.sub(pageIsTransitioningAtom, () => cb(store.get(pageIsTransitioningAtom)))

export const pubRafAnimationCompleted = (animationId: string | number | undefined) =>
  store.set(animationCompletedAtom, animationId)
export const subRafAnimationCompleted = (cb: () => void) => store.sub(animationCompletedAtom, cb)

export const pubRequestDomStyleUpdate = (update: string | number | undefined) =>
  store.set(requestDomStylesUpdateAtom, update)
export const subRequestDomStyleUpdate = (cb: (update: string | number | undefined) => void) =>
  store.sub(requestDomStylesUpdateAtom, () => cb(store.get(requestDomStylesUpdateAtom)))

export const getCellsRefMap = () => store.get(cellsRefMapAtom) as Record<string, MutableRefObject<HTMLDivElement>>

export const scheduleDeepRender = () => store.set(scheduledDeepRenderAtom, true)
export const unScheduleDeepRender = () => store.set(scheduledDeepRenderAtom, false)
export const deepRenderIsScheduled = () => store.get(scheduledDeepRenderAtom)

export const requestScrollControl = (request: { masterIndex?: number; stop?: boolean }) =>
  store.set(scrollControlRequestAtom, request)
export const subScrollControlRequests = (cb: (request: { masterIndex?: number; stop?: boolean } | undefined) => void) =>
  store.sub(scrollControlRequestAtom, () => cb(store.get(scrollControlRequestAtom)))

export const menuIsOpen = () => store.get(displayMenuAtom) as boolean
export const closeMenu = () => store.set(displayMenuAtom, false)

export const cellIsExpanded = () => store.get(cellIsExpandedAtom)
export const setCellIsExpanded = (expanded: string | boolean) => store.set(cellIsExpandedAtom, expanded)

export const setVisibleCellKeysWithDisplacement = (cellKeys: string[]) =>
  store.set(visibleCellKeysWithDisplacementAtom, cellKeys)
export const addVisibleCellKeyWithDisplacement = (cellKey: string) =>
  store.set(visibleCellKeysWithDisplacementAtom, (prev) => [...prev, cellKey])
export const removeVisibleCellKeyWithDisplacement = (cellKey: string) =>
  store.set(visibleCellKeysWithDisplacementAtom, (prev) => prev.filter((item) => item !== cellKey))
export const getVisibleCellKeysWithDisplacement = () => store.get(visibleCellKeysWithDisplacementAtom)
export const hasVisibleCellKeysWithDisplacement = () => !!store.get(visibleCellKeysWithDisplacementAtom)?.length
