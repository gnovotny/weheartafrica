// when interpolating, all sites/data (entering, updated, exiting) are mapped to an interpolated site in order to produce an interpolated Voronoï tesselation; when interpolation value is 0, we want the interpolated tessellation looks like the first tessellation (even with the added entering sites/data), and don't want the entering sites/data to produce a cell; in the same way, when interpolation value is 1, we want the interpolated tessellation looks like the last tessellation (even with the exiting sites/data), and don't want the exiting sites/data to produce a cell
// using a default weight such (as 0) doesn't insure this desired behavior (a site with weight 0 can produce a cell)
// using a very low default weight (as -1000) will do the trick for first/first and last/last tessellation, BUT the interpolated weights during animation of tessellations may be weird because entering and exiting sites/data appear/disappear too quickly
// so the below function

// returns an underweighted weight so that the entering (or exiting) site/data is completly overweighted by the first sites (or last sites)
// algo:
//	[STEP 1] find the closest first site to the entering/exiting site/data;
//    if first/last clipping polygons are the same, the entering/exiting site WILL surely appear/disappear into/from the closest site's polygon
//    on the other case, the entering/exiting site MAY appear in/disappear from the closest site's polygon, or appear/disappear out of the closest site's polygon if the entering/exiting site is out of the first/last clipping polygon
//	[STEP 2] compute the underweighted weight (deplast on farest vertex from polygon's site and polygon's site's weight)
import { squaredDistance } from '@lib/engine/tween/utils'

export function computeUnderweight(site, polygons) {
  let closestSiteSquaredDistance = Infinity,
    polygon = null,
    squaredD

  // [STEP 1] find the closest first/last site to the entering/exiting site/data;
  polygons.forEach(function (p) {
    squaredD = squaredDistance([p.site.x, p.site.y], [site.x, site.y])
    if (squaredD < closestSiteSquaredDistance) {
      closestSiteSquaredDistance = squaredD
      polygon = p
    }
  })

  // [STEP 2] compute the overweighted weight (deplast on farest vertex of polygon and polygon's site's weight)
  const pSite = polygon.site
  let furthestVertexSquaredDistance = -Infinity
  polygon.forEach(function (vertex) {
    // squaredD = (pSite.x - vertex[0])**2 + (pSite.y - vertex[1]) ** 2;
    squaredD = squaredDistance([pSite.x, pSite.y], vertex)
    if (squaredD > furthestVertexSquaredDistance) {
      furthestVertexSquaredDistance = squaredD
    }
  })

  return -furthestVertexSquaredDistance + pSite.weight
}
