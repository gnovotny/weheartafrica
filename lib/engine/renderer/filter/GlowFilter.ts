// import { vertex } from '@tools/fragments';
// import fragment from './glow.frag';
import { Filter } from '@pixi/core'
import { rgb2hex, hex2rgb } from '@pixi/utils'

interface GlowFilterOptions {
  distance: number
  outerStrength: number
  innerStrength: number
  color: number
  quality: number
  knockout: boolean
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
varying vec4 vColor;

uniform sampler2D uSampler;

uniform float innerStrength;

uniform vec4 glowColor;

uniform vec4 filterArea;
uniform vec4 filterClamp;

const float PI = 3.14159265358979323846264;

const float DIST = __DIST__;
const float ANGLE_STEP_SIZE = min(__ANGLE_STEP_SIZE__, PI * 2.0);
const float ANGLE_STEP_NUM = ceil(PI * 2.0 / ANGLE_STEP_SIZE);

const float MAX_TOTAL_ALPHA = ANGLE_STEP_NUM * DIST * (DIST + 1.0) / 2.0;

void main(void) {
    vec2 px = vec2(1.0 / filterArea.x, 1.0 / filterArea.y);

    float totalAlpha = 0.0;
    float maxAlpha = 0.;
    
    vec2 direction;
    vec2 displaced;
    vec4 curColor;

    for (float angle = 0.0; angle < PI * 2.0; angle += ANGLE_STEP_SIZE) {
       direction = vec2(cos(angle), sin(angle)) * px;

       for (float curDistance = 0.0; curDistance < DIST; curDistance++) {
           displaced = clamp(vTextureCoord + direction * 
                   (curDistance + 1.0), filterClamp.xy, filterClamp.zw);

           curColor = texture2D(uSampler, displaced);

           maxAlpha = max(maxAlpha, curColor.a);
           totalAlpha += (DIST - curDistance) * curColor.a;
       }
    }
    
    curColor = texture2D(uSampler, vTextureCoord);

    float alphaRatio = (totalAlpha / MAX_TOTAL_ALPHA);

    float innerGlowAlpha = (1.0 - alphaRatio) * innerStrength * curColor.a;
    float innerGlowStrength = min(1.0, innerGlowAlpha);
    
    vec4 innerColor = mix(curColor, glowColor, innerGlowStrength);

    
    gl_FragColor = innerColor;
}
`

/**
 * GlowFilter, originally by mishaa
 * [codepen]{@link http://codepen.io/mishaa/pen/raKzrm}.<br>
 * ![original](../tools/screenshots/dist/original.png)![filter](../tools/screenshots/dist/glow.png)
 * @class
 *
 * @extends PIXI.Filter
 * @memberof PIXI.filters
 * @see {@link https://www.npmjs.com/package/@pixi/filter-glow|@pixi/filter-glow}
 * @see {@link https://www.npmjs.com/package/pixi-filters|pixi-filters}
 *
 * @example
 *  someSprite.filters = [
 *      new GlowFilter({ distance: 15, outerStrength: 2 })
 *  ];
 */
class GlowFilter extends Filter {
  /** Default values for options. */
  static readonly defaults: GlowFilterOptions = {
    distance: 10,
    innerStrength: 0,
    color: 0xffffff,
    quality: 0.1,
  }

  /**
   * @param {number} [options] - Options for glow.
   * @param {number} [options.distance=10] - The distance of the glow. Make it 2 times more for resolution=2.
   *        It can't be changed after filter creation.
   * @param {number} [options.outerStrength=4] - The strength of the glow outward from the edge of the sprite.
   * @param {number} [options.innerStrength=0] - The strength of the glow inward from the edge of the sprite.
   * @param {number} [options.color=0xffffff] - The color of the glow.
   * @param {number} [options.quality=0.1] - A number between 0 and 1 that describes the quality of the glow.
   *        The higher the number the less performant.
   * @param {boolean} [options.knockout=false] - Toggle to hide the contents and only show glow.
   */
  constructor(options?: Partial<GlowFilterOptions>) {
    const opts: GlowFilterOptions = Object.assign({}, GlowFilter.defaults, options)
    const { innerStrength, color, quality } = opts

    const distance = Math.round(opts.distance)

    super(
      vertex,
      fragment
        .replace(/__ANGLE_STEP_SIZE__/gi, `${(1 / quality / distance).toFixed(7)}`)
        .replace(/__DIST__/gi, `${distance.toFixed(0)}.0`)
    )

    this.uniforms.glowColor = new Float32Array([0, 0, 0, 1])

    Object.assign(this, {
      color,
      innerStrength,
    })
  }

  /**
   * The color of the glow.
   * @default 0xFFFFFF
   */
  get color(): number {
    return rgb2hex(this.uniforms.glowColor)
  }
  set color(value: number) {
    hex2rgb(value, this.uniforms.glowColor)
  }

  /**
   * The strength of the glow inward from the edge of the sprite.
   * @default 0
   */
  get innerStrength(): number {
    return this.uniforms.innerStrength
  }
  set innerStrength(value: number) {
    this.uniforms.innerStrength = value
  }
}

export { GlowFilter }
export type { GlowFilterOptions }
