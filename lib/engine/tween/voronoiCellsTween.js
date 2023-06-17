import { weightedVoronoi } from '@lib/engine/simulation/voronoi/weighted'
import lerp from '@lib/engine/utils/lerp'

import { computeUnderweight } from './computeUnderweight'
import {
  DEFAULT_IDENTIFIER_ACCESSOR,
  ENTER_TWEEN_TYPE,
  EXIT_TWEEN_TYPE,
  INTERPOLATED_WEIGHT_ACCESSOR,
  INTERPOLATED_X_ACCESSOR,
  INTERPOLATED_Y_ACCESSOR,
  UPDATE_TWEEN_TYPE,
} from './consts'

export const voronoiCellsTween = () => {
  //begin: inputs
  let firstCells // first Voronoï tessellations
  let lastCells // last Voronoï tessellations
  // let firstClippingPolygon // used by the DEFAULT_CLIP_INTERPOLATOR
  let clipInterpolator // default interpolator of the clipping polygon; in fact, no interpolation at all, always used the first clipping polygon. used to know retrieve the interpolated clipping polygon;
  // let firstKey = DEFAULT_IDENTIFIER_ACCESSOR // used to identify first data; used when mapping first data and last data
  // let lastKey = DEFAULT_IDENTIFIER_ACCESSOR // used to identify last data; used when mapping first data and last data
  let key = DEFAULT_IDENTIFIER_ACCESSOR // used to identify last data; used when mapping first data and last data
  //end: inputs

  //begin: internals
  let weighted = weightedVoronoi()
      .x(INTERPOLATED_X_ACCESSOR)
      .y(INTERPOLATED_Y_ACCESSOR)
      .weight(INTERPOLATED_WEIGHT_ACCESSOR),
    firstSiteByKey = {}, // map datum's identifier => firstSite (which references first site's weight, position and first data)
    lastSiteByKey = {}, // map datum's identifier => lastSite (which references last site's weight, position and last data)
    allSimulationSitesByKey = [],
    allSiteKeys = new Set(), // all data identifiers (from first data and last data)
    siteTweenData = [], // tween information for each data
    setsLength
  //end: internals

  ///////////////////////
  ///////// API /////////
  ///////////////////////
  const _voronoiMapTween = {
    initialize: function (cellSets) {
      ;[firstCells, lastCells] = cellSets

      setsLength = cellSets.length

      //begin: inputs
      // firstCells = _firstVoronoiMapSimulation.state().polygons // first Voronoï tessellation
      // lastCells = _lastVoronoiMapSimulation.state().polygons // last Voronoï tessellation

      // firstClippingPolygon = _firstVoronoiMapSimulation.clip() // used by the DEFAULT_CLIP_INTERPOLATOR
      // firstClippingPolygon = datasets[0].clip() // used by the DEFAULT_CLIP_INTERPOLATOR
      //
      // if (!clipInterpolator) {
      //   clipInterpolator = function (interpolationValue) {
      //     return firstClippingPolygon
      //   } // default interpolator of the clipping polygon; in fact, no interpolation at all, always used the first clipping polygon. used to know retrieve the interpolated clipping polygon;
      //   //end: inputs
      // }

      const firstSites = firstCells.map(function (p) {
        return p.site
      })
      const lastSites = lastCells.map(function (p) {
        return p.site
      })

      const allCellSitesArr = cellSets.map((cells) => cells.map((p) => p.site))

      let k

      allSimulationSitesByKey = []
      firstSiteByKey = {}
      allSiteKeys = new Set()
      firstSites.forEach(function (s) {
        k = key(s)
        firstSiteByKey[k] = s
        allSiteKeys.add(k)
      })
      lastSiteByKey = {}
      lastSites.forEach(function (s) {
        k = key(s)
        lastSiteByKey[k] = s
        allSiteKeys.add(k)
      })

      // firstSiteByKey (and last) replacement
      allCellSitesArr.forEach((sites, simIndex) => {
        if (!allSimulationSitesByKey[simIndex]) {
          allSimulationSitesByKey[simIndex] = {}
        }
        sites.forEach((s) => {
          const k = key(s)
          allSimulationSitesByKey[simIndex][k] = s
          allSiteKeys.add(k)
        })
      })

      let firstSite, firstX, firstY, firstWeight, lastSite, lastX, lastY, lastWeight, tweenType

      //find correspondance between first and last cells/sites/data; handle entering and exiting cells
      siteTweenData = []

      allSiteKeys.forEach((k) => {
        firstSite = firstSiteByKey[k]
        lastSite = lastSiteByKey[k]

        tweenType = null

        if (firstSite && lastSite) {
          // a firstSite and an lastSite related to the same datum
          firstX = firstSite.x
          lastX = lastSite.x
          firstY = firstSite.y
          lastY = lastSite.y
          firstWeight = firstSite.weight
          lastWeight = lastSite.weight
          tweenType = UPDATE_TWEEN_TYPE
        } else if (lastSite) {
          // no firstSite, i.e. datum not in first sites
          // no coords interpolation (site fixed to last position), weight interpolated FROM underweighted weight, and value interpolated FROM 0
          firstX = lastSite.x
          lastX = lastSite.x
          firstY = lastSite.y
          lastY = lastSite.y
          firstWeight = computeUnderweight(lastSite, firstCells)
          lastWeight = lastSite.weight
          tweenType = ENTER_TWEEN_TYPE
        } else if (firstSite) {
          //no lastSite, i.e. datum not in last sites
          //no coords interpolation (site fixed to first position), weight interpolated TO underweighted weight, and data interpolated TO 0
          firstX = firstSite.x
          lastX = firstSite.x
          firstY = firstSite.y
          lastY = firstSite.y
          firstWeight = firstSite.weight
          lastWeight = computeUnderweight(firstSite, lastCells)
          tweenType = EXIT_TWEEN_TYPE
        }

        if (tweenType) {
          siteTweenData.push({
            data: firstSite?.originalObject?.data || lastSite?.originalObject?.data,
            key: k,
            firstX: firstX,
            lastX: lastX,
            firstY: firstY,
            lastY: lastY,
            firstWeight: firstWeight,
            lastWeight: lastWeight,
            tweenType: tweenType,
          })
        }
      })

      return _voronoiMapTween
    },

    interpolate: function (interpolationValue) {
      // Produces a Voronoï tessellation inbetween a first tessellation and an last tessellation.
      // Currently uses a LERP interpollation. Param 'interpolationValue' gives the interpolation amount: 0->first tessellation, 1->last tessellation

      // [STEP 1] interpolate sites's coords and weights
      const relativeInterpolationValue = interpolationValue / (setsLength - 1)
      const interpolatedSites = siteTweenData.map((std) => {
        return {
          key: std.key,
          data: std.data,
          interpolatedSiteX: lerp(std.firstX, std.lastX, relativeInterpolationValue),
          interpolatedSiteY: lerp(std.firstY, std.lastY, relativeInterpolationValue),
          interpolatedSiteWeight: lerp(std.firstWeight, std.lastWeight, relativeInterpolationValue),
          tweenType: std.tweenType,
        }
      })

      // [STEP 2] use weighted-voronoi to compute the interpolated tessellation
      const { clipping, bbox } = clipInterpolator(interpolationValue)
      const res = weighted.clip(clipping)(interpolatedSites)

      return {
        cells: res.polygons,
        facets: res.facets,
        clipping,
        bbox,
      }
    },

    setClipInterpolator: function (_) {
      clipInterpolator = _
      return _voronoiMapTween
    },

    key: function (_) {
      key = _
      return _voronoiMapTween
    },
  }

  return _voronoiMapTween
}
