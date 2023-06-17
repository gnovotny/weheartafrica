import { ReactElement, useMemo } from 'react'

import transformReactElementsToCellBlueprints from '@lib/engine/simulation/transformReactElementsToCellBlueprints'
import { EngineCellBlueprint } from '@lib/engine/types'

export const useCellBlueprintsTransformer = (
  cells: ReactElement[] | undefined
): {
  blueprints: EngineCellBlueprint[]
} => useMemo(() => transformReactElementsToCellBlueprints(cells), [cells])
