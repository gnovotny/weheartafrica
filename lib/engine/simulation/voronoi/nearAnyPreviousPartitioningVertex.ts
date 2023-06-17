// return a position corresponding to a vertex separating 2 cells (not a vertex of a border cell due to the clipping polygon)
import { polygonContains } from 'd3-polygon'

import { random } from '@lib/engine/utils/random'

export const nearAnyPreviousPartitioningVertex = (previousPolygons: any[], clippingPolygon: [number, number][]) => {
  let vertexNearClippingPolygon = true
  let i, previouscell, previousVertex

  // begin: redo until choosen vertex is not one of the clipping polygon
  while (vertexNearClippingPolygon) {
    // pick a random previous cell
    i = Math.floor(previousPolygons.length * random())
    previouscell = previousPolygons[i]
    // pick a random vertex
    i = Math.floor(previouscell.length * random())
    previousVertex = previouscell[i]
    vertexNearClippingPolygon = nearAClippingPolygonVertex(previousVertex, clippingPolygon)
  }
  // end: redo until choosen vertex is not one of the clipping polygon

  // add some randomness if the choosen vertex is picked several times due to several addition of data, checking that the coords are still in the clipping polygon
  let coordsInClippingPolygon = false
  let xRandomness, yRandomness
  let coords: [number, number] | undefined
  let loopCount = 0
  while (!coordsInClippingPolygon) {
    if (loopCount > 100) {
      console.error('nearAnyPreviousPartitioningVertex: too many loops')
      break
    }
    xRandomness = random() - 0.5 // -0.5 for a central distribution
    yRandomness = random() - 0.5
    coords = [previousVertex[0] + xRandomness, previousVertex[1] + yRandomness]
    coordsInClippingPolygon = polygonContains(clippingPolygon, coords)
    loopCount++
  }

  // begin: debug: display position of added sites (i.e. added data)
  // siteContainer.append('circle').attr('r', 3).attr('cx', coords[0]).attr('cy', coords[1]).attr('fill', 'red');
  // end: debug

  return coords
}
export const nearAClippingPolygonVertex = (v: number[], clippingPolygon: number[][]) => {
  const near = 1
  let dx, dy, d
  let isVertexOfClippingPolygon = false
  clippingPolygon.forEach((cv: number[]) => {
    if (!isVertexOfClippingPolygon) {
      dx = v[0] - cv[0]
      dy = v[1] - cv[1]
      d = Math.sqrt(dx ** 2 + dy ** 2)
      isVertexOfClippingPolygon = d < near
    }
  })
  return isVertexOfClippingPolygon
}
