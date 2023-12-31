// Plane3D and Point2D

// IN: Face face
export class Plane3D {
  constructor(face) {
    let p1 = face.verts[0]
    let p2 = face.verts[1]
    let p3 = face.verts[2]
    this.a = p1.y * (p2.z - p3.z) + p2.y * (p3.z - p1.z) + p3.y * (p1.z - p2.z)
    this.b = p1.z * (p2.x - p3.x) + p2.z * (p3.x - p1.x) + p3.z * (p1.x - p2.x)
    this.c = p1.x * (p2.y - p3.y) + p2.x * (p3.y - p1.y) + p3.x * (p1.y - p2.y)
    this.d =
      -1 *
      (p1.x * (p2.y * p3.z - p3.y * p2.z) + p2.x * (p3.y * p1.z - p1.y * p3.z) + p3.x * (p1.y * p2.z - p2.y * p1.z))
  }

  getNormZPlane() {
    return [-1 * (this.a / this.c), -1 * (this.b / this.c), -1 * (this.d / this.c)]
  }

  // OUT: point2D
  getDualPointMappedToPlane() {
    let nPlane = this.getNormZPlane()
    return new Point2D(nPlane[0] / 2, nPlane[1] / 2)
  }
}

// IN: doubles x and y
export function Point2D(x, y) {
  this.x = x
  this.y = y
}
