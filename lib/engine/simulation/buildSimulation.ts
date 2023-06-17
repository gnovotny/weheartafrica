import { getBBoxByCoords } from '@lib/engine/geometry/getBBoxByCoords'
import { getCellSiteKey } from '@lib/engine/utils/cellData'
import lerp from '@lib/engine/utils/lerp'

import { random } from '../utils/random'

import { nearAnyPreviousPartitioningVertex } from './voronoi/nearAnyPreviousPartitioningVertex'
import { voronoiMapSimulation } from './voronoi/voronoiMapSimulation'

//uses d3-v-map to compute a Voronoï map where each cell's area encodes a particular datum's value.
//Param 'previousPolygons' allows to reuse coords and weights of a previously computed Voronoï tessellation, in order for updated data to produce cells in the same region.
export function buildSimulation(
  data: any,
  previousPolygons: any[] | null,
  clippingPolygon: [number, number][],
  options: { maxIterationCount?: number; useRawWeight?: boolean; canAdaptPositions?: boolean },
  onTick?: (polygons: any[]) => void,
  onEnd?: (polygons: any[]) => void
) {
  const clippingBBox = getBBoxByCoords(clippingPolygon)
  let simulation: any, k

  if (previousPolygons) {
    const previousSites = previousPolygons.map((d) => d.site)
    const previousSiteByKey: any = {}
    let previousTotalWeight = 0
    previousSites.forEach((s) => {
      k = getCellSiteKey(s)
      previousSiteByKey[k] = s
      previousTotalWeight += s.weight
    })
    const previousAverageWeight = previousTotalWeight / previousSites.length

    const initialPositioner = function (d: any) {
      const previousSite = previousSiteByKey[getCellSiteKey(d)]
      let newSitePosition: any
      if (previousSite) {
        newSitePosition = [previousSite.x / 2, previousSite.y / 2]
      } else {
        newSitePosition = nearAnyPreviousPartitioningVertex(previousPolygons, clippingPolygon)
      }
      return [newSitePosition[0] / 2, newSitePosition[1] / 2]
      // dividing by 2 ensure to position site inside ending polygon
      // even when size is smaller, or/and shape is smaller
    }
    const initialWeighter = function (d: any) {
      const previousSite = previousSiteByKey[getCellSiteKey(d)]
      let newSiteWeight
      if (previousSite) {
        newSiteWeight = previousSite.weight / 4
      } else {
        newSiteWeight = previousAverageWeight / 4
      }
      return newSiteWeight / 4
      // as new site position is divided by 2 along x and y axes
      // we divide the weight by pow(2,2) to preserve cell aspects
    }
    simulation = voronoiMapSimulation(data)
      .clip(clippingPolygon)
      .weight((d: any) => d.weight)
      .canAdaptPositions(!!options?.canAdaptPositions)

    if (data[0].position) {
      const { minX, maxX, minY, maxY } = clippingBBox
      simulation = simulation.initialPosition((d: any) => {
        if (d.position) {
          if (d.position.xPrct && d.position.yPrct) {
            return [lerp(minX, maxX, d.position.xPrct), lerp(minY, maxY, d.position.yPrct)]
          } else if (d.position.x && d.position.y) {
            return [d.position.x, d.position.y]
          }
        }
      })
    } else {
      simulation = simulation.initialPosition(initialPositioner)
    }

    if (data[0].weight) {
      simulation = simulation.initialWeight((d: any) => {
        if (d.weight) {
          return d.weight * (!options?.useRawWeight ? 100000 : 1)
        }
      })
    } else {
      simulation = simulation.initialWeight(initialWeighter)
    }
  } else {
    simulation = voronoiMapSimulation(data)
      .clip(clippingPolygon)
      .canAdaptPositions(!!options?.canAdaptPositions)
      .weight((d: any) => d.weight)

    if (data[0].position) {
      const { minX, maxX, minY, maxY } = clippingBBox
      simulation = simulation.initialPosition((d: any) => {
        if (d.position) {
          if (d.position.xPrct && d.position.yPrct) {
            return [lerp(minX, maxX, d.position.xPrct), lerp(minY, maxY, d.position.yPrct)]
          } else if (d.position.x && d.position.y) {
            return [d.position.x, d.position.y]
          }
        }
      })
    }

    simulation = simulation.initialWeight((d: any) => {
      if (d.weight) {
        return d.weight * (!options?.useRawWeight ? 100000 : 1)
      }
    })
  }

  simulation.prng(random)

  if (options?.maxIterationCount) {
    simulation.maxIterationCount(options.maxIterationCount)
  }

  if (onTick && onEnd) {
    simulation
      .on('tick', function () {
        onTick(simulation.state().cells)
      })
      .on('end', function () {
        onEnd(simulation.state().cells)
      })
  } else {
    simulation.stop()
    let state = simulation.state() // retrieve the simulation's state, i.e. {ended, polygons, iterationCount, convergenceRatio}

    //begin: manually launch each iteration until the simulation ends
    while (!state.ended) {
      simulation.tick()
      state = simulation.state()
    }
    //end:manually launch each iteration until the simulation ends
  }

  return simulation
}
