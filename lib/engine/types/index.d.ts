import React, { ReactNode, FC, PropsWithChildren } from 'react'

import { MotionValue } from 'framer-motion'
import { NextPage } from 'next'
import { LinkProps as NextLinkProps } from 'next/dist/client/link'

import Cell from '@components/cells/Cell'
import { LayoutProps } from '@components/engine/EngineLayout'
import { BBox } from '@lib/engine/geometry/getBBoxByCoords'
import { EngineConfig } from '@lib/engine/settings/types'

import { EngineCellDataMap } from '../../state'

export type IfEquals<X, Y, A = X, B = never> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2
  ? A
  : B

export type WritableKeys<T> = {
  [P in keyof T]-?: IfEquals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] }, P>
}

export type EngineDOMCellQueriedState = {
  weight?: number
  col?: number
  row?: number
}

export type EngineBreakpointKey = 'base' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

export type EngineBreakpointValue<T> = Partial<Record<EngineBreakpointKey, T>>

export type EngineDOMCellStateMediaQuery = EngineBreakpointValue<EngineDOMCellQueriedState>

export type EngineDOMCellStatesProp = /*VoronoiDOMCellStateMediaQuery | */ Array<
  EngineDOMCellStateMediaQuery | undefined
>

export type EngineCellComponentProps = {
  state?: EngineDOMCellStatesProp
  finalState?: EngineDOMCellStateMediaQuery
  permanentState?: EngineDOMCellStateMediaQuery
  cellClassName?: string
  cellId: string
  rendererConfig?: any
  cellIndex?: number
  theme?: string
  children?: ReactNode | ReactNode[]
  isActive?: boolean
  lowPower?: boolean
  isCell?: boolean
  isScalable?: boolean
  isPlaceholder?: boolean
  isInteractive?: boolean
  isExpandable?: boolean
  hasDisplacement?: boolean
  isScrollable?: boolean
  isClippable?: boolean
  isResizable?: boolean
  isFloating?: boolean
  isFixed?: boolean
  isScreenCentered?: boolean
  hasLabelCentroid?: boolean
  canRotate?: boolean
  followsPointer?: boolean
  nextCellIndex?: number
  isFocusable?: boolean
  variant?: 'default'
  mediaProps?: any
  linkProps?: Partial<NextLinkProps>
  onCellPointerMove?: (event: PointerEvent<HTMLElement>, cellId: string, isInteractive?: boolean) => void
  forwardedRef?: React.MutableRefObject<HTMLDivElement | null>
}

export type EngineCoordinates = [number, number]
export type EngineDimensions = EngineCoordinates

export type EngineCellData = EngineCoordinates[] & {
  site: any
  bbox?: BBox
  centroid?: { x?: number; y?: number }
}

export type EngineClipping = EngineCoordinates[] & {
  bbox?: BBox
}

export type EngineLayoutRow = number[]
export type EngineLayout = EngineLayoutRow[]
export type EngineCellBlueprintProps = EngineCellComponentProps & {
  ref?: React.MutableRefObject<HTMLDivElement | null>
  key?: string | number
}
export type EngineCellBlueprint = {
  props: EngineCellBlueprintProps
}
export type EngineSimulationBlueprintCell = {
  props: EngineCellComponentProps
  key?: string | number
  index?: number
  weight: number
  position?: {
    xPrct: number
    yPrct: number
  }
}

export type EngineSimulationBlueprint = EngineSimulationBlueprintCell[]
export type EngineSimulation = any
export type EngineSimulationTween = any

export type EngineClipOptions = {
  evolving?: boolean
  interpolationRange?: number[]
  scrollEmulationMarginZone?: number
  noInitialMargin?: boolean
  noEndingMargin?: boolean
  dimensions: EngineDimensions
  dimensionsRange?: [EngineDimensions, EngineDimensions]
  clippingRange?: [EngineCoordinates[], EngineCoordinates[]]
}

export type Generic2D = {
  x?: number
  y?: number
}

export type EngineInterpolationResults = {
  facets: any[]
  cells: EngineCellData[]
  clipping: EngineCoordinates[]
  bbox: BBox
}

export type EngineMasterResults = {
  cells: EngineCellData[]
  clipping: EngineCoordinates[]
}

export type EngineInterpolationMetadata = {
  facets: any[]
  cellDataList: EngineCellData[]
  cellDataMap: EngineCellDataMap
  clipping: EngineCoordinates[]
  bbox: BBox
}

export type EngineMasterMetadata = {
  cellDataList: EngineCellData[]
  cellDataMap: EngineCellDataMap
  clipping: EngineCoordinates[]
}

export type EnginePointerEvent = {
  type: string
  point: Generic2D
  cellData?: EngineCellData
}

export type EngineNextPage = NextPage & {
  Layout?: FC<PropsWithChildren<LayoutProps>>
  config?: Partial<EngineConfig>
  cells?: Cell[]
}

export type DOMStylerStyle = Record<string, MotionValue>
