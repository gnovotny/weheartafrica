// Vector

// IN: coordinates x, y, z
export class Vector {
  constructor(x, y, z) {
    this.x = x
    this.y = y
    this.z = z
  }

  negate() {
    this.x *= -1
    this.y *= -1
    this.z *= -1
  }

  // Normalizes X Y and Z in-place
  normalize() {
    const length = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z)
    if (length > 0) {
      this.x /= length
      this.y /= length
      this.z /= length
    }
  }
}
