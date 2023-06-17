import getConfig from '@lib/engine/settings'
import { isSmallBreakpoint } from '@lib/utils/bph'

const getCellMargin = () => getConfig().baseCellMargin * (isSmallBreakpoint() ? 0.5 : 1)

export default getCellMargin
