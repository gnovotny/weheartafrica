// Face

import { ConflictList } from './ConflictList'
import { HEdge } from './HEdge'
import { Plane3D } from './Plane3D'
import { epsilon, dot } from './utils'
import { Vector } from './vector'
import weightedVoronoiError from './weightedVoronoiError'

// IN: Vertices a, b, c
export class Face {
  constructor(a, b, c, orient) {
    this.conflicts = new ConflictList(true)
    this.verts = [a, b, c]
    this.marked = false
    let t = a.subtract(b).crossproduct(b.subtract(c))

    this.normal = new Vector(-t.x, -t.y, -t.z)
    this.normal.normalize()
    this.createEdges()
    this.dualPoint = null

    if (orient !== undefined) {
      this.orient(orient)
    }
  }

  // OUT: Point2D
  getDualPoint() {
    if (this.dualPoint == null) {
      let plane3d = new Plane3D(this)
      this.dualPoint = plane3d.getDualPointMappedToPlane()
    }
    return this.dualPoint
  }

  isVisibleFromBelow() {
    return this.normal.z < -1.4259414393190911e-9
  }

  createEdges() {
    this.edges = []
    this.edges[0] = new HEdge(this.verts[0], this.verts[1], this)
    this.edges[1] = new HEdge(this.verts[1], this.verts[2], this)
    this.edges[2] = new HEdge(this.verts[2], this.verts[0], this)
    this.edges[0].next = this.edges[1]
    this.edges[0].prev = this.edges[2]
    this.edges[1].next = this.edges[2]
    this.edges[1].prev = this.edges[0]
    this.edges[2].next = this.edges[0]
    this.edges[2].prev = this.edges[1]
  }

  // IN: vertex orient
  orient(orient) {
    if (!(dot(this.normal, orient) < dot(this.normal, this.verts[0]))) {
      let temp = this.verts[1]
      this.verts[1] = this.verts[2]
      this.verts[2] = temp
      this.normal.negate()
      this.createEdges()
    }
  }

  // IN: two vertices v0 and v1
  getEdge(v0, v1) {
    for (let i = 0; i < 3; i++) {
      if (this.edges[i].isEqual(v0, v1)) {
        return this.edges[i]
      }
    }
    return null
  }

  // IN: Face face, vertices v0 and v1
  link(face, v0, v1) {
    if (face instanceof Face) {
      let twin = face.getEdge(v0, v1)
      if (twin === null) {
        throw new weightedVoronoiError('when linking, twin is null')
      }
      let edge = this.getEdge(v0, v1)
      if (edge === null) {
        throw new weightedVoronoiError('when linking, twin is null')
      }
      twin.twin = edge
      edge.twin = twin
    } else {
      let twin = face // face is a hEdge
      let edge = this.getEdge(twin.orig, twin.dest)
      twin.twin = edge
      edge.twin = twin
    }
  }

  // IN: vertex v
  conflict(v) {
    return dot(this.normal, v) > dot(this.normal, this.verts[0]) + epsilon
  }

  getHorizon() {
    for (let i = 0; i < 3; i++) {
      if (this.edges[i].twin !== null && this.edges[i].twin.isHorizon()) {
        return this.edges[i]
      }
    }
    return null
  }

  removeConflict() {
    this.conflicts.removeAll()
  }
}
