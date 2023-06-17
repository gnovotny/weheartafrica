import { buildClipper } from '@lib/engine/simulation/buildClipper'
import { voronoiCellsTween } from '@lib/engine/tween/voronoiCellsTween'
import { EngineCellData, EngineClipOptions, EngineDimensions, EngineSimulation } from '@lib/engine/types'
import { getCellSiteKey } from '@lib/engine/utils/cellData'

export const scrollSimulationsToTweens = (
  simulations: EngineSimulation[],
  { dimensions }: { dimensions: EngineDimensions }
) =>
  simulations.reduce(
    (prev, cur, i) => [
      ...prev,
      ...(i > 0
        ? [
            buildVoronoiCellsTween([simulations[i - 1].state().cells, cur.state().cells], {
              interpolationRange: [(i - 1) / (simulations.length - 1), i / (simulations.length - 1)],
              dimensions,
            }),
          ]
        : []),
    ],
    []
  )

export const buildVoronoiCellsTween = (cellSets: EngineCellData[][], clipOptions: EngineClipOptions) => {
  const clipInterpolatorOptions: EngineClipOptions = {
    interpolationRange: [0, 1],
    noInitialMargin: cellSets[0]?.length === 1,
    noEndingMargin: cellSets[cellSets.length - 1]?.length === 1,
    ...clipOptions,
  }

  return voronoiCellsTween()
    .setClipInterpolator(buildClipper(clipInterpolatorOptions))
    .key(getCellSiteKey)
    .initialize(cellSets)
}
