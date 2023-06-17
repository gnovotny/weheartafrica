// ConflictList and ConflictListNode

export class ConflictListNode {
  constructor(face, vert) {
    this.face = face
    this.vert = vert
    this.nextf = null
    this.prevf = null
    this.nextv = null
    this.prevv = null
  }
}

// IN: boolean forFace
export class ConflictList {
  constructor(forFace) {
    this.forFace = forFace
    this.head = null
  }

  // IN: ConflictListNode cln
  add(cln) {
    if (this.head === null) {
      this.head = cln
    } else {
      if (this.forFace) {
        // Is FaceList
        this.head.prevv = cln
        cln.nextv = this.head
        this.head = cln
      } else {
        // Is VertexList
        this.head.prevf = cln
        cln.nextf = this.head
        this.head = cln
      }
    }
  }

  isEmpty() {
    return this.head === null
  }

  // Array of faces visible
  fill(visible) {
    if (this.forFace) {
      return
    }
    let curr = this.head
    do {
      visible.push(curr.face)
      curr.face.marked = true
      curr = curr.nextf
    } while (curr !== null)
  }

  removeAll() {
    let curr
    if (this.forFace) {
      // Remove all vertices from Face
      curr = this.head
      do {
        if (curr.prevf === null) {
          // Node is head
          if (curr.nextf === null) {
            curr.vert.conflicts.head = null
          } else {
            curr.nextf.prevf = null
            curr.vert.conflicts.head = curr.nextf
          }
        } else {
          // Node is not head
          if (curr.nextf != null) {
            curr.nextf.prevf = curr.prevf
          }
          curr.prevf.nextf = curr.nextf
        }
        curr = curr.nextv
        if (curr != null) {
          curr.prevv = null
        }
      } while (curr != null)
    } else {
      // Remove all JFaces from vertex
      curr = this.head
      do {
        if (curr.prevv == null) {
          // Node is head
          if (curr.nextv == null) {
            curr.face.conflicts.head = null
          } else {
            curr.nextv.prevv = null
            curr.face.conflicts.head = curr.nextv
          }
        } else {
          // Node is not head
          if (curr.nextv != null) {
            curr.nextv.prevv = curr.prevv
          }
          curr.prevv.nextv = curr.nextv
        }
        curr = curr.nextf
        if (curr != null) curr.prevf = null
      } while (curr != null)
    }
  }

  // IN: list of vertices
  getVertices() {
    let list = [],
      curr = this.head
    while (curr !== null) {
      list.push(curr.vert)
      curr = curr.nextv
    }
    return list
  }
}
