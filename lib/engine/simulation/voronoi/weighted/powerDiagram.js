// import { polygonLength } from 'd3-polygon'

import { computeFacets } from './ConvexHull'
import { polygonClip } from './polygonUtils'
import { epsilon } from './utils'

function polyHasNonZeroLength(polygon) {
  var i = -1,
    n = polygon.length,
    b = polygon[n - 1],
    xa,
    ya,
    xb = b[0],
    yb = b[1],
    perimeter = 0

  while (++i < n) {
    xa = xb
    ya = yb
    b = polygon[i]
    xb = b[0]
    yb = b[1]
    xa -= xb
    ya -= yb
    perimeter += Math.hypot(xa, ya)

    if (perimeter > 0) return true
  }
}

// IN: HEdge edge
function getFacesOfDestVertex(edge) {
  let faces = []
  let previous = edge
  let first = edge.dest
  let site = first.originalObject
  let neighbours = []
  do {
    previous = previous.twin.prev
    let siteOrigin = previous.orig.originalObject
    if (!siteOrigin.isDummy) {
      neighbours.push(siteOrigin)
    }
    let iFace = previous.iFace
    if (iFace.isVisibleFromBelow()) {
      faces.push(iFace)
    }
  } while (previous !== edge)
  site.neighbours = neighbours
  return faces
}

// IN: Omega = convex bounding polygon
// IN: S = unique set of sites with weights
// OUT: Set of lines making up the voronoi power diagram
export function computePowerDiagramIntegrated(sites, boundingSites, clippingPolygon) {
  const polygons = []
  const verticesVisited = []
  const facets = computeFacets(boundingSites, sites)
  facets.forEach((facet) => {
    if (!facet.isVisibleFromBelow()) return

    // go through the edges and start to build the polygon by going through the double connected edge list
    facet.edges.forEach((edge) => {
      let destVertex = edge.dest
      let site = destVertex.originalObject

      if (verticesVisited[destVertex.index]) return
      verticesVisited[destVertex.index] = true

      // skip if this is one of the sites making the bounding polygon
      if (site.isDummy) return

      // faces around the vertices which correspond to the polygon corner points
      const faces = getFacesOfDestVertex(edge)
      const protoPoly = []
      let lastX = null
      let lastY = null
      let dx = 1
      let dy = 1
      faces.forEach((face) => {
        let point = face.getDualPoint()
        let x1 = point.x
        let y1 = point.y
        if (lastX !== null) {
          dx = lastX - x1
          dy = lastY - y1
          if (dx < 0) {
            dx = -dx
          }
          if (dy < 0) {
            dy = -dy
          }
        }
        if (dx > epsilon || dy > epsilon) {
          protoPoly.push([x1, y1])
          lastX = x1
          lastY = y1
        }
      })

      site.nonClippedPolygon = protoPoly.reverse()
      if (polyHasNonZeroLength(site.nonClippedPolygon)) {
        let clippedPoly = polygonClip(clippingPolygon, site.nonClippedPolygon)
        site.polygon = clippedPoly
        clippedPoly.site = site
        if (clippedPoly.length > 0) {
          polygons.push(clippedPoly)
        }
      }
    })
  })
  return { polygons, facets }
}
