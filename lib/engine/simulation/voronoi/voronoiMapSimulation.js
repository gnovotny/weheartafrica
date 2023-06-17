import { dispatch as d3Dispatch } from 'd3-dispatch'
import { polygonCentroid, polygonArea, polygonContains } from 'd3-polygon'
import { timer } from 'd3-timer'

import getConfig from '@lib/engine/settings'
import { weightedVoronoi } from '@lib/engine/simulation/voronoi/weighted'

import { FlickeringMitigation } from './FlickeringMitigation'
import randomInitialPosition from './policies/initial-position/random'
import halfAverageAreaInitialWeight from './policies/initial-weight/half-average-area'
import { squaredDistance } from './utils'
import voronoiMapError from './voronoiMapError'

//begin: constants
const DEFAULT_CONVERGENCE_RATIO = 0.01
const DEFAULT_MAX_ITERATION_COUNT = 1
// const DEFAULT_MAX_ITERATION_COUNT = 50
const DEFAULT_MIN_WEIGHT_RATIO = 0.01
const DEFAULT_PRNG = Math.random
const DEFAULT_CAN_ADAPT_POSITIONS = getConfig().simulation.adaptPositionsDefault
const DEFAULT_INITIAL_POSITION = randomInitialPosition()
const DEFAULT_INITIAL_WEIGHT = halfAverageAreaInitialWeight()
const RANDOM_INITIAL_POSITION = randomInitialPosition()
const EPSILON = 1e-10
//end: constants

//begin: algorithm conf.
// @ToDo variant 0 is inferior to 1, but it doesn't cause infinite loop when not adapting position during tick
const HANDLE_OVERWEIGHTED_VARIANT = 0 // this option still exists for further experiments
const HANLDE_OVERWEIGHTED_MAX_ITERATION_COUNT = 1000 // max number of tries to handle overweigthed sites
//end: algorithm conf.

export const voronoiMapSimulation = (template) => {
  /////// Inputs ///////
  let weight = function (d) {
    return d.weight
  } // accessor to the weight
  let convergenceRatio = DEFAULT_CONVERGENCE_RATIO // targeted allowed error ratio; default 0.01 stops computation when cell areas error <= 1% clipping polygon's area
  let maxIterationCount = DEFAULT_MAX_ITERATION_COUNT // maximum allowed iteration; stops computation even if convergence is not reached; use a large amount for a sole converge-based computation stop
  let minWeightRatio = DEFAULT_MIN_WEIGHT_RATIO // used to compute the minimum allowed weight; default 0.01 means 1% of max weight; handle near-zero weights, and leaves enought space for cell hovering
  let prng = DEFAULT_PRNG // pseudorandom number generator
  let canAdaptPositions = DEFAULT_CAN_ADAPT_POSITIONS
  let initialPosition = DEFAULT_INITIAL_POSITION // accessor to the initial position; defaults to a random position inside the clipping polygon
  let initialWeight = DEFAULT_INITIAL_WEIGHT // accessor to the initial weight; defaults to the average area of the clipping polygon

  //begin: internals
  let weighted = weightedVoronoi(),
    flickeringMitigation = new FlickeringMitigation(),
    shouldInitialize = true, // should initialize due to changes via APIs
    siteCount, // number of sites
    totalArea, // area of the clipping polygon
    areaErrorTreshold, // targeted allowed area error (= totalArea * convergenceRatio); below this treshold, map is considered obtained and computation stops
    iterationCount, // current iteration
    polygons, // current computed polygons
    facets, // current computed facets
    areaError, // current area error
    converged, // true if (areaError < areaErrorTreshold)
    ended // stores if computation is ended, either if computation has converged or if it has reached the maximum allowed iteration
  //end: internals
  //being: internals/simulation
  let simulation,
    stepper = timer(step),
    event = d3Dispatch('tick', 'end')
  //end: internals/simulation

  let handleOverweighted

  ///////////////////////
  ///////// API /////////
  ///////////////////////

  simulation = {
    tick: tick,
    updateSimulation: updateSimulation,

    restart: function () {
      stepper.restart(step)
      return simulation
    },

    stop: function () {
      stepper.stop()
      return simulation
    },

    weight: function (_) {
      if (!arguments.length) {
        return weight
      }

      weight = _
      shouldInitialize = true
      return simulation
    },

    convergenceRatio: function (_) {
      if (!arguments.length) {
        return convergenceRatio
      }

      convergenceRatio = _
      shouldInitialize = true
      return simulation
    },

    maxIterationCount: function (_) {
      if (!arguments.length) {
        return maxIterationCount
      }

      maxIterationCount = _
      return simulation
    },

    minWeightRatio: function (_) {
      if (!arguments.length) {
        return minWeightRatio
      }

      minWeightRatio = _
      shouldInitialize = true
      return simulation
    },

    clip: function (_) {
      if (!arguments.length) {
        return weighted.clip()
      }

      weighted.clip(_)
      shouldInitialize = true
      return simulation
    },

    extent: function (_) {
      if (!arguments.length) {
        return weighted.extent()
      }

      weighted.extent(_)
      shouldInitialize = true
      return simulation
    },

    size: function (_) {
      if (!arguments.length) {
        return weighted.size()
      }

      weighted.size(_)
      shouldInitialize = true
      return simulation
    },

    prng: function (_) {
      if (!arguments.length) {
        return prng
      }

      prng = _
      shouldInitialize = true
      return simulation
    },

    canAdaptPositions: function (_) {
      if (!arguments.length) {
        return canAdaptPositions
      }

      canAdaptPositions = _
      shouldInitialize = true
      return simulation
    },

    initialPosition: function (_) {
      if (!arguments.length) {
        return initialPosition
      }

      initialPosition = _
      shouldInitialize = true
      return simulation
    },

    initialWeight: function (_) {
      if (!arguments.length) {
        return initialWeight
      }

      initialWeight = _
      shouldInitialize = true
      return simulation
    },

    state: function () {
      if (shouldInitialize) {
        initializeSimulation()
      }
      return {
        ended: ended,
        iterationCount: iterationCount,
        convergenceRatio: areaError / totalArea,
        cells: polygons,
        facets: facets,
      }
    },

    getCells: function () {
      return polygons
    },

    setCells: function (p) {
      polygons = p
      return simulation
    },

    on: function (name, _) {
      if (arguments.length === 1) {
        return event.on(name)
      }

      event.on(name, _)
      return simulation
    },
  }

  ///////////////////////
  /////// Private ///////
  ///////////////////////

  //begin: simulation's main loop
  function step() {
    tick()
    event.call('tick', simulation)
    if (ended) {
      stepper.stop()
      event.call('end', simulation)
    }
  }
  //end: simulation's main loop

  //begin: algorithm used at each iteration
  function tick() {
    if (!ended) {
      if (shouldInitialize) {
        initializeSimulation()
      }
      adapt(flickeringMitigation.ratio())
      iterationCount++
      areaError = computeAreaError(polygons)
      flickeringMitigation.add(areaError)
      converged = areaError < areaErrorTreshold
      ended = converged || iterationCount >= maxIterationCount
      // console.log('error %: ' + Math.round((areaError * 100 * 1000) / totalArea) / 1000)
    }
  }
  //end: algorithm used at each iteration

  function initializeSimulation() {
    //begin: handle algorithm's variants
    setHandleOverweighted()
    //end: handle algorithm's variants

    siteCount = template.length
    totalArea = Math.abs(polygonArea(weighted.clip()))
    areaErrorTreshold = convergenceRatio * totalArea
    flickeringMitigation.clear().totalArea(totalArea)

    iterationCount = 0
    converged = false
    let w = initialize(template, simulation)
    polygons = w.polygons
    facets = w.facets
    ended = false
    shouldInitialize = false
  }

  function updateSimulation(t) {
    //begin: handle algorithm's variants
    setHandleOverweighted()
    //end: handle algorithm's variants

    // simulation.canAdaptPositions(true)
    simulation.maxIterationCount(1)

    shouldInitialize = false
    iterationCount = 0
    converged = false
    polygons = initialize(t, simulation)
    ended = false

    let state = simulation.state() // retrieve the simulation's state, i.e. {ended, polygons, iterationCount, convergenceRatio}

    //begin: manually launch each iteration until the simulation ends
    while (!state.ended) {
      simulation.tick()
      state = simulation.state()
    }
  }

  function initialize(data, simulation) {
    let maxWeight = data.reduce(function (max, d) {
        return Math.max(max, weight(d))
      }, -Infinity),
      minAllowedWeight = maxWeight * minWeightRatio
    let weights, mapPoints

    //begin: extract weights
    weights = data.map(function (d, i, arr) {
      return {
        index: i,
        weight: Math.max(weight(d), minAllowedWeight),
        initialPosition: initialPosition(d, i, arr, simulation),
        initialWeight: initialWeight(d, i, arr, simulation),
        originalData: d,
      }
    })
    //end: extract weights

    // create map-related points
    // (with targetedArea, initial position and initialWeight)
    mapPoints = createMapPoints(weights, simulation)
    handleOverweighted(mapPoints)
    try {
      return weighted(mapPoints)
    } catch (e) {
      console.error(e)
    }
  }

  function createMapPoints(basePoints, simulation) {
    let totalWeight = basePoints.reduce(function (acc, bp) {
      return (acc += bp.weight)
    }, 0)
    let initialPosition

    return basePoints.map(function (bp, i, bps) {
      initialPosition = bp.initialPosition

      if (!polygonContains(weighted.clip(), initialPosition)) {
        initialPosition = DEFAULT_INITIAL_POSITION(bp, i, bps, simulation)
      }

      return {
        index: bp.index,
        targetedArea: (totalArea * bp.weight) / totalWeight,
        data: bp,
        x: initialPosition[0],
        y: initialPosition[1],
        weight: bp.initialWeight, // ArlindNocaj/Voronoi-Treemap-Library uses an epsilonesque initial weight; using heavier initial weights allows faster weight adjustements, hence faster stabilization
      }
    })
  }

  function adapt(flickeringMitigationRatio) {
    let adaptedPolys = polygons
    let adaptedFacets = facets
    let adaptedMapPoints

    if (canAdaptPositions) {
      adaptPositions(adaptedPolys, flickeringMitigationRatio)

      adaptedMapPoints = adaptedPolys.map(function (p) {
        return p.site.originalObject
      })
      let adapted = weighted(adaptedMapPoints)
      adaptedPolys = adapted.polygons
      adaptedFacets = adapted.facets
      if (adaptedPolys.length < siteCount) {
        throw new voronoiMapError('at least 1 site has no area, which is not supposed to arise')
      }
    }

    adaptWeights(adaptedPolys, flickeringMitigationRatio)
    adaptedMapPoints = adaptedPolys.map(function (p) {
      return p.site.originalObject
    })
    let adapted = weighted(adaptedMapPoints)
    adaptedPolys = adapted.polygons
    adaptedFacets = adapted.facets
    if (adaptedPolys.length < siteCount) {
      throw new voronoiMapError('at least 1 site has no area, which is not supposed to arise')
    }

    polygons = adaptedPolys
    facets = adaptedFacets
  }

  function adaptPositions(polygons, flickeringMitigationRatio) {
    let newMapPoints = [],
      flickeringInfluence = 0.5
    let flickeringMitigation, d, polygon, mapPoint, centroid, dx, dy

    flickeringMitigation = flickeringInfluence * flickeringMitigationRatio
    d = 1 - flickeringMitigation // in [0.5, 1]
    for (let i = 0; i < siteCount; i++) {
      polygon = polygons[i]
      mapPoint = polygon.site.originalObject
      centroid = polygonCentroid(polygon)

      dx = centroid[0] - mapPoint.x
      dy = centroid[1] - mapPoint.y

      //begin: handle excessive change;
      dx *= d
      dy *= d
      //end: handle excessive change;

      mapPoint.x += dx
      mapPoint.y += dy

      newMapPoints.push(mapPoint)
    }

    handleOverweighted(newMapPoints)
  }

  function adaptWeights(polygons, flickeringMitigationRatio) {
    let newMapPoints = [],
      flickeringInfluence = 0.1
    let flickeringMitigation, polygon, mapPoint, currentArea, adaptRatio, adaptedWeight

    flickeringMitigation = flickeringInfluence * flickeringMitigationRatio
    for (let i = 0; i < siteCount; i++) {
      polygon = polygons[i]

      // if (!polygon) continue // @Todo dangerous fix with pos. repercussions

      mapPoint = polygon.site.originalObject
      currentArea = polygonArea(polygon)
      adaptRatio = mapPoint.targetedArea / currentArea

      //begin: handle excessive change;
      adaptRatio = Math.max(adaptRatio, 1 - flickeringInfluence + flickeringMitigation) // in [(1-flickeringInfluence), 1]
      adaptRatio = Math.min(adaptRatio, 1 + flickeringInfluence - flickeringMitigation) // in [1, (1+flickeringInfluence)]
      //end: handle excessive change;

      adaptedWeight = mapPoint.weight * adaptRatio
      adaptedWeight = Math.max(adaptedWeight, EPSILON)

      mapPoint.weight = adaptedWeight

      newMapPoints.push(mapPoint)
    }

    handleOverweighted(newMapPoints)
  }

  // heuristics: lower heavy weights
  function handleOverweighted0(mapPoints) {
    let fixCount = 0
    let fixApplied, tpi, tpj, weightest, lightest, sqrD, adaptedWeight
    do {
      if (fixCount > HANLDE_OVERWEIGHTED_MAX_ITERATION_COUNT) {
        // setHandleOverweighted(1)
        // return
        throw new voronoiMapError('handleOverweighted0 is looping too much')
      }
      fixApplied = false
      for (let i = 0; i < siteCount; i++) {
        tpi = mapPoints[i]
        for (let j = i + 1; j < siteCount; j++) {
          tpj = mapPoints[j]
          if (tpi.weight > tpj.weight) {
            weightest = tpi
            lightest = tpj
          } else {
            weightest = tpj
            lightest = tpi
          }
          sqrD = squaredDistance(tpi, tpj)
          if (sqrD < weightest.weight - lightest.weight) {
            // adaptedWeight = sqrD - epsilon; // as in ArlindNocaj/Voronoi-Treemap-Library
            // adaptedWeight = sqrD + lightest.weight - epsilon; // works, but below heuristics performs better (less flickering)
            adaptedWeight = sqrD + lightest.weight / 2
            adaptedWeight = Math.max(adaptedWeight, EPSILON)
            weightest.weight = adaptedWeight
            fixApplied = true
            fixCount++
            break
          }
        }
        if (fixApplied) {
          break
        }
      }
    } while (fixApplied)

    /*
    if (fixCount > 0) {
      console.log('# fix: ' + fixCount);
    }
    */
  }

  // heuristics: increase light weights
  function handleOverweighted1(mapPoints) {
    let fixCount = 0
    let fixApplied, tpi, tpj, weightest, lightest, sqrD, overweight
    do {
      if (fixCount > HANLDE_OVERWEIGHTED_MAX_ITERATION_COUNT) {
        throw new voronoiMapError('handleOverweighted1 is looping too much')
      }
      fixApplied = false
      for (let i = 0; i < siteCount; i++) {
        tpi = mapPoints[i]
        for (let j = i + 1; j < siteCount; j++) {
          tpj = mapPoints[j]

          // if (!tpj) continue // @Todo dangerous fix with pos. repercussions

          if (tpi.weight > tpj.weight) {
            weightest = tpi
            lightest = tpj
          } else {
            weightest = tpj
            lightest = tpi
          }
          sqrD = squaredDistance(tpi, tpj)
          if (sqrD < weightest.weight - lightest.weight) {
            overweight = weightest.weight - lightest.weight - sqrD
            lightest.weight += overweight + EPSILON
            fixApplied = true
            fixCount++
            break
          }
        }
        if (fixApplied) {
          break
        }
      }
    } while (fixApplied)

    /*
    if (fixCount > 0) {
      console.log('# fix: ' + fixCount);
    }
    */
  }

  function computeAreaError(polygons) {
    //convergence based on summation of all sites current areas
    let areaErrorSum = 0
    let polygon, mapPoint, currentArea
    for (let i = 0; i < siteCount; i++) {
      polygon = polygons[i]
      mapPoint = polygon.site.originalObject
      currentArea = polygonArea(polygon)
      areaErrorSum += Math.abs(mapPoint.targetedArea - currentArea)
    }
    return areaErrorSum
  }

  function setHandleOverweighted(override = false) {
    switch (override !== false ? override : canAdaptPositions ? 1 : 0) {
      case 0:
        handleOverweighted = handleOverweighted0
        break
      case 1:
        handleOverweighted = handleOverweighted1
        break
      default:
        console.error("unknown 'handleOverweighted' variant; using variant #1")
        handleOverweighted = handleOverweighted0
    }
  }

  return simulation
}
