import { polygonHull as d3PolygonHull } from 'd3-polygon'

import { computePowerDiagramIntegrated } from './powerDiagram'
import { arrExtent, epsilon, polygonDirection } from './utils'
import { Vertex } from './vertex'

export function weightedVoronoi() {
  /////// Inputs ///////
  let x = function (d) {
    return d.x
  } // accessor to the x value
  let y = function (d) {
    return d.y
  } // accessor to the y value
  let weight = function (d) {
    return d.weight
  } // accessor to the weight
  let clip = [
    [0, 0],
    [0, 1],
    [1, 1],
    [1, 0],
  ] // clipping polygon
  let extent = [
    [0, 0],
    [1, 1],
  ] // extent of the clipping polygon
  let size = [1, 1] // [width, height] of the clipping polygon

  ///////////////////////
  ///////// API /////////
  ///////////////////////

  function _weightedVoronoi(data) {
    let formattedSites

    //begin: map sites to the expected format of PowerDiagram
    formattedSites = data.map(function (d) {
      return new Vertex(x(d), y(d), null, weight(d), d, false)
    })
    //end: map sites to the expected format of PowerDiagram

    return computePowerDiagramIntegrated(formattedSites, boundingSites(), clip)
  }

  _weightedVoronoi.x = function (_) {
    if (!arguments.length) {
      return x
    }

    x = _
    return _weightedVoronoi
  }

  _weightedVoronoi.y = function (_) {
    if (!arguments.length) {
      return y
    }

    y = _
    return _weightedVoronoi
  }

  _weightedVoronoi.weight = function (_) {
    if (!arguments.length) {
      return weight
    }

    weight = _
    return _weightedVoronoi
  }

  _weightedVoronoi.clip = function (_) {
    let direction, xExtent, yExtent

    if (!arguments.length) {
      return clip
    }

    xExtent = arrExtent(
      _.map(function (c) {
        return c[0]
      })
    )
    yExtent = arrExtent(
      _.map(function (c) {
        return c[1]
      })
    )
    direction = polygonDirection(_)
    if (direction === undefined) {
      clip = d3PolygonHull(_) // ensure clip to be a convex, hole-free, counterclockwise polygon
    } else if (direction === 1) {
      clip = _.reverse() // already convex, order array in the same direction as d3-polygon.polygonHull(...)
    } else {
      clip = _
    }
    extent = [
      [xExtent[0], yExtent[0]],
      [xExtent[1], yExtent[1]],
    ]
    size = [xExtent[1] - xExtent[0], yExtent[1] - yExtent[0]]
    return _weightedVoronoi
  }

  _weightedVoronoi.extent = function (_) {
    if (!arguments.length) {
      return extent
    }

    clip = [_[0], [_[0][0], _[1][1]], _[1], [_[1][0], _[0][1]]]
    extent = _
    size = [_[1][0] - _[0][0], _[1][1] - _[0][1]]
    return _weightedVoronoi
  }

  _weightedVoronoi.size = function (_) {
    if (!arguments.length) {
      return size
    }

    clip = [
      [0, 0],
      [0, _[1]],
      [_[0], _[1]],
      [_[0], 0],
    ]
    extent = [[0, 0], _]
    size = _
    return _weightedVoronoi
  }

  ///////////////////////
  /////// Private ///////
  ///////////////////////

  function boundingSites() {
    let minX,
      maxX,
      minY,
      maxY,
      width,
      height,
      x0,
      x1,
      y0,
      y1,
      boundingData = [],
      boundingSites = []

    minX = extent[0][0]
    maxX = extent[1][0]
    minY = extent[0][1]
    maxY = extent[1][1]
    width = maxX - minX
    height = maxY - minY
    x0 = minX - width
    x1 = maxX + width
    y0 = minY - height
    y1 = maxY + height

    // MUST be counterclockwise
    // if not, may produce 'TypeError: Cannot set property 'twin' of null' during computation
    // don't know how to test as it is not exposed
    boundingData[0] = [x0, y0]
    boundingData[1] = [x0, y1]
    boundingData[2] = [x1, y1]
    boundingData[3] = [x1, y0]

    for (let i = 0; i < 4; i++) {
      boundingSites.push(
        new Vertex(
          boundingData[i][0],
          boundingData[i][1],
          null,
          epsilon,
          new Vertex(boundingData[i][0], boundingData[i][1], null, epsilon, null, true),
          true
        )
      )
    }

    return boundingSites
  }

  return _weightedVoronoi
}
