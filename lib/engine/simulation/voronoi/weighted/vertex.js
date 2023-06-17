// Vertex
import { ConflictList } from './ConflictList'
import { epsilon } from './utils'

// IN: coordinates x, y, z
export class Vertex {
  constructor(x, y, z, weight, orig, isDummy) {
    this.x = x
    this.y = y
    this.weight = epsilon
    this.index = 0
    this.conflicts = new ConflictList(false)
    this.neighbours = null // Potential trouble
    this.nonClippedPolygon = null
    this.polygon = null
    this.originalObject = null
    this.isDummy = false

    if (orig !== undefined) {
      this.originalObject = orig
    }
    if (isDummy != undefined) {
      this.isDummy = isDummy
    }
    if (weight != null) {
      this.weight = weight
    }
    if (z != null) {
      this.z = z
    } else {
      this.z = this.projectZ(this.x, this.y, this.weight)
    }
  }

  projectZ(x, y, weight) {
    return x * x + y * y - weight
  }

  setWeight(weight) {
    this.weight = weight
    this.z = this.projectZ(this.x, this.y, this.weight)
  }

  subtract(v) {
    return new Vertex(v.x - this.x, v.y - this.y, v.z - this.z)
  }

  crossproduct(v) {
    return new Vertex(this.y * v.z - this.z * v.y, this.z * v.x - this.x * v.z, this.x * v.y - this.y * v.x)
  }

  equals(v) {
    return this.x === v.x && this.y === v.y && this.z === v.z
  }
}
