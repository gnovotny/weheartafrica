// convexHull.js
import { ConflictList, ConflictListNode } from './ConflictList'
import { Face } from './Face'
import { epsilonesque, dot, linearDependent } from './utils'
import { Vertex } from './vertex'
import weightedVoronoiError from './weightedVoronoiError'

export class ConvexHull {
  constructor() {
    this.points = []
    this.facets = []
    this.created = []
    this.horizon = []
    this.visible = []
    this.current = 0
  }

  // IN: sites (x,y,z)
  init(boundingSites, sites) {
    this.points = []
    for (let i = 0; i < sites.length; i++) {
      this.points[i] = new Vertex(sites[i].x, sites[i].y, sites[i].z, null, sites[i], false)
    }
    this.points = this.points.concat(boundingSites)
  }

  permutate() {
    let pointSize = this.points.length
    for (let i = pointSize - 1; i > 0; i--) {
      let ra = Math.floor(Math.random() * i)
      let temp = this.points[ra]
      temp.index = i
      let currentItem = this.points[i]
      currentItem.index = ra
      this.points.splice(ra, 1, currentItem)
      this.points.splice(i, 1, temp)
    }
  }

  prep() {
    if (this.points.length <= 3) {
      throw new weightedVoronoiError('Less than 4 points')
    }
    for (let i = 0; i < this.points.length; i++) {
      this.points[i].index = i
    }

    let v0, v1, v2, v3
    let f1, f2, f3, f0
    v0 = this.points[0]
    v1 = this.points[1]
    v2 = v3 = null

    // Searching for a third vertex, not aligned with the 2 firsts
    for (let i = 2; i < this.points.length; i++) {
      if (!(linearDependent(v0, this.points[i]) && linearDependent(v1, this.points[i]))) {
        v2 = this.points[i]
        v2.index = 2
        this.points[2].index = i
        this.points.splice(i, 1, this.points[2])
        this.points.splice(2, 1, v2)
        break
      }
    }
    if (v2 === null) {
      throw new weightedVoronoiError('Not enough non-planar Points (v2 is null)')
    }

    // Create first JFace
    f0 = new Face(v0, v1, v2)
    // Searching for a fourth vertex, not coplanar to the 3 firsts
    for (let i = 3; i < this.points.length; i++) {
      if (!epsilonesque(dot(f0.normal, f0.verts[0]) - dot(f0.normal, this.points[i]))) {
        v3 = this.points[i]
        v3.index = 3
        this.points[3].index = i
        this.points.splice(i, 1, this.points[3])
        this.points.splice(3, 1, v3)
        break
      }
    }
    if (v3 === null) {
      throw new weightedVoronoiError('Not enough non-planar Points (v3 is null)')
    }

    f0.orient(v3)
    f1 = new Face(v0, v2, v3, v1)
    f2 = new Face(v0, v1, v3, v2)
    f3 = new Face(v1, v2, v3, v0)
    this.addFacet(f0)
    this.addFacet(f1)
    this.addFacet(f2)
    this.addFacet(f3)
    // Connect facets
    f0.link(f1, v0, v2)
    f0.link(f2, v0, v1)
    f0.link(f3, v1, v2)
    f1.link(f2, v0, v3)
    f1.link(f3, v2, v3)
    f2.link(f3, v3, v1)
    this.current = 4

    let v
    for (let i = this.current; i < this.points.length; i++) {
      v = this.points[i]
      if (f0.conflict(v)) {
        this.addConflict(f0, v)
      }
      if (f1.conflict(v)) {
        this.addConflict(f1, v)
      }
      if (f2.conflict(v)) {
        this.addConflict(f2, v)
      }
      if (f3.conflict(v)) {
        this.addConflict(f3, v)
      }
    }
  }

  // IN: Faces old1 old2 and fn
  addConflicts(old1, old2, fn) {
    let l1 = old1.conflicts.getVertices()
    let l2 = old2.conflicts.getVertices()
    let nCL = []
    let v1, v2
    let i, l
    i = l = 0
    // Fill the possible new Conflict List
    while (i < l1.length || l < l2.length) {
      if (i < l1.length && l < l2.length) {
        v1 = l1[i]
        v2 = l2[l]
        // If the index is the same, it's the same vertex and only 1 has to be added
        if (v1.index === v2.index) {
          nCL.push(v1)
          i++
          l++
        } else if (v1.index > v2.index) {
          nCL.push(v1)
          i++
        } else {
          nCL.push(v2)
          l++
        }
      } else if (i < l1.length) {
        nCL.push(l1[i++])
      } else {
        nCL.push(l2[l++])
      }
    }
    // Check if the possible conflicts are real conflicts
    for (let ii = nCL.length - 1; ii >= 0; ii--) {
      v1 = nCL[ii]
      if (fn.conflict(v1)) this.addConflict(fn, v1)
    }
  }

  // IN: Face face, Vertex v
  addConflict(face, vert) {
    let e = new ConflictListNode(face, vert)
    face.conflicts.add(e)
    vert.conflicts.add(e)
  }

  // IN: Face f
  removeConflict(f) {
    f.removeConflict()
    let index = f.index
    f.index = -1
    if (index === this.facets.length - 1) {
      this.facets.splice(this.facets.length - 1, 1)
      return
    }
    if (index >= this.facets.length || index < 0) return
    let last = this.facets.splice(this.facets.length - 1, 1)
    last[0].index = index
    this.facets.splice(index, 1, last[0])
  }

  // IN: Face face
  addFacet(face) {
    face.index = this.facets.length
    this.facets.push(face)
  }

  compute() {
    this.prep()
    while (this.current < this.points.length) {
      let next = this.points[this.current]
      if (next.conflicts.isEmpty()) {
        // No conflict, point in hull
        this.current++
        continue
      }
      this.created = [] // TODO: make sure this is okay and doesn't dangle references
      this.horizon = []
      this.visible = []
      // The visible faces are also marked
      next.conflicts.fill(this.visible)
      // Horizon edges are orderly added to the horizon list
      let e
      for (let jF = 0; jF < this.visible.length; jF++) {
        e = this.visible[jF].getHorizon()
        if (e !== null) {
          e.findHorizon(this.horizon)
          break
        }
      }
      let last = null,
        first = null
      // Iterate over horizon edges and create new faces oriented with the marked face 3rd unused point
      for (let hEi = 0; hEi < this.horizon.length; hEi++) {
        let hE = this.horizon[hEi]
        let fn = new Face(next, hE.orig, hE.dest, hE.twin.next.dest)
        fn.conflicts = new ConflictList(true)
        // Add to facet list
        this.addFacet(fn)
        this.created.push(fn)
        // Add new conflicts
        this.addConflicts(hE.iFace, hE.twin.iFace, fn)
        // Link the new face with the horizon edge
        fn.link(hE)
        if (last !== null) fn.link(last, next, hE.orig)
        last = fn
        if (first === null) first = fn
      }
      // Links the first and the last created JFace
      if (first !== null && last !== null) {
        last.link(first, next, this.horizon[0].orig)
      }
      if (this.created.length !== 0) {
        // update conflict graph
        for (let f = 0; f < this.visible.length; f++) {
          this.removeConflict(this.visible[f])
        }
        this.current++
        this.created = []
      }
    }
    return this.facets
  }

  clear() {
    this.points = []
    this.facets = []
    this.created = []
    this.horizon = []
    this.visible = []
    this.current = 0
  }
}

export const computeFacets = (boundingSites, sites) => {
  const convexHull = new ConvexHull()
  convexHull.clear()
  convexHull.init(boundingSites, sites)

  return convexHull.compute(sites)
}
