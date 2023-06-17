import { buildClipper } from '@lib/engine/simulation/buildClipper'
import { buildSimulation } from '@lib/engine/simulation/buildSimulation'
import { EngineCellData, EngineDimensions, EngineSimulation, EngineSimulationBlueprint } from '@lib/engine/types'

export const blueprintsToScrollSimulationData = (
  blueprints: EngineSimulationBlueprint[],
  { dimensions }: { dimensions: EngineDimensions },
  onTick?: (cells: EngineCellData[]) => void,
  onEnd?: (cells: EngineCellData[]) => void
) =>
  blueprints.reduce(
    (prev, cur, i) => [
      ...prev,
      (() => {
        const clipping = buildClipper({
          dimensions,
          interpolationRange: [0, blueprints.length - 1],
          // noInitialMargin: prev[i - 1]?.state().cells.length === 1,
          // noEndingMargin: cur.length === 1,
        })(i / (blueprints.length - 1)).clipping
        return {
          clipping,
          simulation: buildSimulation(
            cur,
            prev[i - 1]?.simulation?.state().cells,
            clipping,
            {},
            i === 0 ? onTick : undefined,
            i === 0 ? onEnd : undefined
          ),
        }
      })(),
    ],
    [] as EngineSimulation[]
  )
