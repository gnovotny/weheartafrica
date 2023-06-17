import getConfig from '@lib/engine/settings'
import { getCurrentMaxBreakpointValue } from '@lib/engine/settings/utils'
import {
  EngineCellBlueprint,
  EngineCellBlueprintProps,
  EngineDOMCellQueriedState,
  EngineDOMCellStateMediaQuery,
  EngineSimulationBlueprint,
  EngineSimulationBlueprintCell,
} from '@lib/engine/types'

const createSimulationBlueprintCell = (
  queriedState: EngineDOMCellQueriedState,
  props: EngineCellBlueprintProps
): EngineSimulationBlueprintCell => ({
  props: props,
  key: props.cellId,
  index: props.cellIndex,
  weight: queriedState.weight || 1,
  position:
    queriedState.col && queriedState.row
      ? {
          xPrct: queriedState.col / getConfig().simulation.cols,
          yPrct: queriedState.row / getConfig().simulation.rows,
        }
      : undefined,
})

const queryState = (state: EngineDOMCellStateMediaQuery) => {
  const queriedState = getCurrentMaxBreakpointValue(state)
  return queriedState
}

const transformCellBlueprintsToSimulationBlueprints = (
  cellBlueprints: EngineCellBlueprint[]
): EngineSimulationBlueprint[] => {
  const simulationBlueprints: EngineSimulationBlueprint[] = []
  let shouldProcessFinalState = false
  let shouldProcessPermanentState = false
  cellBlueprints.forEach(({ props }) => {
    if (props.state) {
      const states = Array.isArray(props.state) ? props.state : [props.state]
      states.forEach((state, stateIndex) => {
        if (state) {
          const queriedState = queryState(state)

          if (queriedState) {
            if (!simulationBlueprints[stateIndex]) {
              simulationBlueprints[stateIndex] = []
            }
            simulationBlueprints[stateIndex].push(createSimulationBlueprintCell(queriedState, props))
          }
        }
      })
    } else if (props.finalState) {
      shouldProcessFinalState = true
    } else if (props.permanentState) {
      shouldProcessPermanentState = true
    }
  })

  shouldProcessFinalState &&
    cellBlueprints
      .filter(({ props: { finalState } }) => finalState)
      .forEach(({ props }) => {
        if (props.finalState) {
          const queriedState = queryState(props.finalState)
          queriedState &&
            simulationBlueprints[simulationBlueprints.length - 1]?.push(
              createSimulationBlueprintCell(queriedState, props)
            )
        }
      })

  shouldProcessPermanentState &&
    cellBlueprints
      .filter(({ props: { permanentState } }) => permanentState)
      .forEach(({ props }) => {
        if (props.permanentState) {
          const queriedState = queryState(props.permanentState)
          queriedState &&
            simulationBlueprints.forEach((sBP) => sBP?.push(createSimulationBlueprintCell(queriedState, props)))
        }
      })

  return simulationBlueprints
}

export default transformCellBlueprintsToSimulationBlueprints
