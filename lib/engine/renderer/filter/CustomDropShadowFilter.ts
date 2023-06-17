import type { CLEAR_MODES } from '@pixi/constants'
import { Filter } from '@pixi/core'
import type { FilterSystem, RenderTexture } from '@pixi/core'
import { KawaseBlurFilter } from '@pixi/filter-kawase-blur'
import { DEG_TO_RAD, Point } from '@pixi/math'
import type { IPoint } from '@pixi/math'
import { settings } from '@pixi/settings'
import { rgb2hex, hex2rgb } from '@pixi/utils'

type PixelSizeValue = number | number[] | IPoint

interface CustomDropShadowFilterOptions {
  rotation: number
  distance: number
  colors: {
    light: number
    dark: number
  }
  alpha: number
  shadowOnly: boolean
  blur: number
  quality: number
  kernels: number[] | null
  pixelSize: PixelSizeValue
  resolution: number
}

const vertex = `
attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vTextureCoord = aTextureCoord;
}

`

const fragment = `
varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform float alpha;
uniform vec3 color;

uniform vec2 shift;
uniform vec4 inputSize;

void main(void){
    vec4 sample = texture2D(uSampler, vTextureCoord - shift * inputSize.zw);

    // Premultiply alpha
    sample.rgb = color.rgb * sample.a;

    // alpha user alpha
    sample *= alpha;

    gl_FragColor = sample;
}`

/**
 * Drop shadow filter.<br>
 * ![original](../tools/screenshots/dist/original.png)![filter](../tools/screenshots/dist/drop-shadow.png)
 * @class
 * @extends PIXI.Filter
 * @memberof PIXI.filters
 * @see {@link https://www.npmjs.com/package/@pixi/filter-drop-shadow|@pixi/filter-drop-shadow}
 * @see {@link https://www.npmjs.com/package/pixi-filters|pixi-filters}
 */
class CustomDropShadowFilter extends Filter {
  /** Default constructor options. */
  public static readonly defaults: CustomDropShadowFilterOptions = {
    rotation: 45,
    distance: 5,
    colors: {
      light: 0xffffff,
      dark: 0x000000,
    },
    alpha: 0.5,
    shadowOnly: false,
    kernels: null,
    blur: 2,
    quality: 3,
    pixelSize: 1,
    resolution: settings.FILTER_RESOLUTION,
  }

  /** Hide the contents, only show the shadow. */
  public shadowOnly: boolean

  /** Angle of the shadow in degrees. */
  public angle = 45

  private _distance = 5
  private _tintFilterLight: Filter
  private _tintFilterDark: Filter
  private _blurFilter: KawaseBlurFilter
  protected _resolution: number = settings.FILTER_RESOLUTION

  /**
   * @param {object} [options] - Filter options
   * @param {number} [options.rotation=45] - The angle of the shadow in degrees.
   * @param {number} [options.distance=5] - Distance of shadow
   * @param {number} [options.colors] - Colors of the shadow
   * @param {number} [options.alpha=0.5] - Alpha of the shadow
   * @param {boolean} [options.shadowOnly=false] - Whether render shadow only
   * @param {number} [options.blur=2] - Sets the strength of the Blur properties simultaneously
   * @param {number} [options.quality=3] - The quality of the Blur filter.
   * @param {number[]} [options.kernels=null] - The kernels of the Blur filter.
   * @param {number|number[]|PIXI.Point} [options.pixelSize=1] - the pixelSize of the Blur filter.
   * @param {number} [options.resolution=PIXI.settings.FILTER_RESOLUTION] - The resolution of the Blur filter.
   */
  constructor(options?: Partial<CustomDropShadowFilterOptions>) {
    super()

    const opt: CustomDropShadowFilterOptions = options
      ? { ...CustomDropShadowFilter.defaults, ...options }
      : CustomDropShadowFilter.defaults

    const { kernels, blur, quality, pixelSize, resolution } = opt

    this._tintFilterLight = new Filter(vertex, fragment)
    this._tintFilterLight.uniforms.color = new Float32Array(4)
    this._tintFilterLight.uniforms.shift = new Point()
    this._tintFilterDark = new Filter(vertex, fragment)
    this._tintFilterDark.uniforms.color = new Float32Array(4)
    this._tintFilterDark.uniforms.shift = new Point()
    this._tintFilterLight.resolution = this._tintFilterDark.resolution = resolution
    this._blurFilter = kernels ? new KawaseBlurFilter(kernels) : new KawaseBlurFilter(blur, quality)

    this.pixelSize = pixelSize
    this.resolution = resolution

    const { shadowOnly, rotation, distance, alpha, colors } = opt

    this.shadowOnly = shadowOnly
    this.rotation = rotation
    this.distance = distance
    this.alpha = alpha
    this.colors = colors

    this._updatePadding()
  }

  apply(filterManager: FilterSystem, input: RenderTexture, output: RenderTexture, clear: CLEAR_MODES): void {
    const target = filterManager.getFilterTexture()

    this._tintFilterLight.apply(filterManager, input, target, 1)
    this._tintFilterDark.apply(filterManager, input, target, 0)
    // this._tintFilterLight.apply(filterManager, target, output, 1);
    this._blurFilter.apply(filterManager, target, output, clear)

    if (this.shadowOnly !== true) {
      filterManager.applyFilter(this, input, output, 0)
    }

    filterManager.returnFilterTexture(target)
  }

  /**
   * Recalculate the proper padding amount.
   * @private
   */
  private _updatePadding() {
    this.padding = this.distance + this.blur * 2
  }

  /**
   * Update the transform matrix of offset angle.
   * @private
   */
  private _updateShift() {
    this._tintFilterDark.uniforms.shift.set(
      -this.distance * Math.cos(this.angle),
      -this.distance * Math.sin(this.angle)
    )
    this._tintFilterDark.uniforms.shift.set(this.distance * Math.cos(this.angle), this.distance * Math.sin(this.angle))
  }

  /**
   * The resolution of the filter.
   * @default PIXI.settings.FILTER_RESOLUTION
   */
  get resolution(): number {
    return this._resolution
  }
  set resolution(value: number) {
    this._resolution = value

    if (this._tintFilterLight) {
      this._tintFilterLight.resolution = value
    }
    if (this._tintFilterDark) {
      this._tintFilterDark.resolution = value
    }
    if (this._blurFilter) {
      this._blurFilter.resolution = value
    }
  }

  /**
   * Distance offset of the shadow
   * @default 5
   */
  get distance(): number {
    return this._distance
  }
  set distance(value: number) {
    this._distance = value
    this._updatePadding()
    this._updateShift()
  }

  /**
   * The angle of the shadow in degrees
   * @default 2
   */
  get rotation(): number {
    return this.angle / DEG_TO_RAD
  }
  set rotation(value: number) {
    this.angle = value * DEG_TO_RAD
    this._updateShift()
  }

  /**
   * The alpha of the shadow
   * @default 1
   */
  get alpha(): number {
    return this._tintFilterLight.uniforms.alpha
  }
  set alpha(value: number) {
    this._tintFilterLight.uniforms.alpha = value
    this._tintFilterDark.uniforms.alpha = value
  }

  /**
   * The colors of the shadow.
   * @default 0x000000
   */
  get colors(): { light: number; dark: number } {
    return {
      dark: rgb2hex(this._tintFilterDark.uniforms.color),
      light: rgb2hex(this._tintFilterLight.uniforms.color),
    }
  }
  set colors({ light, dark }: { light: number; dark: number }) {
    hex2rgb(light, this._tintFilterLight.uniforms.color)
    hex2rgb(dark, this._tintFilterDark.uniforms.color)
  }

  /**
   * Sets the kernels of the Blur Filter
   */
  get kernels(): number[] {
    return this._blurFilter.kernels
  }
  set kernels(value: number[]) {
    this._blurFilter.kernels = value
  }

  /**
   * The blur of the shadow
   * @default 2
   */
  get blur(): number {
    return this._blurFilter.blur
  }
  set blur(value: number) {
    this._blurFilter.blur = value
    this._updatePadding()
  }

  /**
   * Sets the quality of the Blur Filter
   * @default 4
   */
  get quality(): number {
    return this._blurFilter.quality
  }
  set quality(value: number) {
    this._blurFilter.quality = value
  }

  /**
   * Sets the pixelSize of the Kawase Blur filter
   *
   * @member {number|number[]|PIXI.Point}
   * @default 1
   */
  get pixelSize(): PixelSizeValue {
    return this._blurFilter.pixelSize
  }
  set pixelSize(value: PixelSizeValue) {
    this._blurFilter.pixelSize = value
  }
}

export { CustomDropShadowFilter }
export type { CustomDropShadowFilterOptions as DropShadowFilterOptions }
