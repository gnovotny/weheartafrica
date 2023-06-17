import { LinkCellProps } from '@components/cells/Link/LinkCell'
import getConfig, { hasPointerInteractions } from '@lib/engine/settings'
import { POINTER_INTERACTIONS_MODE } from '@lib/engine/settings/enums'
import { EngineCellComponentProps, EngineCellData } from '@lib/engine/types'

export const getCellSiteKey = (site: any) =>
  site?.key || site?.originalObject?.key || site?.originalObject?.data?.originalData?.key // mapping between data sets

export const getCellSite = (cellData: EngineCellData) => {
  return cellData?.site
}

export const getCellKey = (cellData: EngineCellData | undefined) => {
  return cellData && getCellSiteKey(getCellSite(cellData))
}

export const getCellData = (cellData: EngineCellData) => {
  return getCellSite(cellData)?.originalObject?.data
}

export const getCellOriginalData = (cellData: EngineCellData) => {
  return getCellData(cellData)?.originalData
}

export const getCellManipulationData = (cellData: EngineCellData) => {
  return getCellOriginalData(cellData)?.manipulation
}

export const getCellOriginalProps = (cellData: EngineCellData) => {
  return getCellOriginalData(cellData)?.props as EngineCellComponentProps
}

export const getCellMediaProps = (cellData: EngineCellData) => {
  return getCellOriginalProps(cellData)?.mediaProps
}
export const getCellId = (cellData: EngineCellData) => {
  return getCellOriginalProps(cellData)?.cellId
}

export const getCellLinkProps = (cellData: EngineCellData) => {
  const props = getCellOriginalProps(cellData)
  return props?.linkProps ?? ((props as LinkCellProps).href ? { href: (props as LinkCellProps).href } : false)
}

export const cellHasMedia = (cellData: EngineCellData) => {
  return getConfig().features.media && !!getCellMediaProps(cellData)
}

export const cellUsesLabelCentroid = (cellData: EngineCellData) => {
  return getConfig().features.labelCentroid && getCellOriginalProps(cellData).hasLabelCentroid
}

export const cellHasLink = (cellData: EngineCellData) => {
  return !!getCellLinkProps(cellData)
}

export const getCellRawWeight = (cellData: EngineCellData) => {
  return getCellSite(cellData)?.weight
}

export const getCellOriginalDataWeight = (cellData: EngineCellData) => {
  return getCellOriginalData(cellData)?.weight || 1
}

export const getCellIsInteractive = (cellData: EngineCellData) => {
  if (!hasPointerInteractions() || getConfig().pointerInteractions?.mode !== POINTER_INTERACTIONS_MODE.RENDERER)
    return false

  const isInteractive = getCellOriginalProps(cellData)?.isInteractive
  return !!(
    isInteractive ||
    ((getConfig().pointerInteractions?.cellDefaultInteractivityEnabled ||
      (getConfig().pointerInteractions?.mediaCellDefaultInteractivityEnabled && cellHasMedia(cellData))) &&
      isInteractive !== false)
  )
}
