import { Filter } from '@pixi/core'
import { Dict } from '@pixi/utils'

import { getDevicePixelRatio } from '@lib/engine/settings/utils'

const originalFrag = `
precision mediump float;
precision mediump int;
varying vec2 vTextureCoord;
varying vec4 vColor;
uniform sampler2D uSampler;
uniform float hoverProgress;
uniform float time;
uniform float blend;
uniform float offset;
uniform float delayOffset;
uniform float friction;
#define PI 3.14159265359
float displaceAmount = 0.5;
float displaceAmount2 = 0.3;
float displaceAmount3 = 0.2;
mat2 rotate2d(float _angle) {
  return mat2(cos(_angle), -sin(_angle), sin(_angle), cos(_angle));
}
void main() {
  vec2 vUv = vTextureCoord;
  vUv -= vec2(0.5);
  float scaleLvl = 0.1;
  vec2 vUv1 = vUv * rotate2d(PI / 4.);
  vUv1 += vec2(0.5);
  float hp = hoverProgress * 1.5;
  float y = (0.3 * (1.680 - smoothstep(0.180, 0.492, vUv1.y - hoverProgress))) + smoothstep(0.340, 0.896, vUv1.y - hoverProgress);
  if (y > 1.) {
    y = 1.;
  }
  float x = sin(vUv1.y / 10.);
  float zoom = 1. - (scaleLvl * (1. - y));
  vUv *= vec2(zoom);
  vUv += vec2(0.5);
  vUv.y += offset;
  vec4 image1 = texture2D(uSampler, vUv);
  float blend2 = 1. - blend;
  vec4 image = texture2D(uSampler, vec2(vUv.x, vUv.y + blend));
  float t1 = (image.r * displaceAmount) * offset;
  vec2 vuvA = vec2(vUv.x, vUv.y - t1);
  vec4 imageA = texture2D(uSampler, vuvA) * blend2;
  vec4 fColor = (imageA.bbra * blend) + (imageA * blend2);
  vec2 vUv2 = vTextureCoord;
  vUv2 -= vec2(0.5);
  vUv2 *= vec2(zoom);
  vUv2 += vec2(0.5);
  vUv2.y += (offset * 0.85);
  vec4 image2 = texture2D(uSampler, vec2(vUv2.x, vUv2.y + blend));
  float t2 = ((image2.r * displaceAmount2) * offset) * 0.85;
  vec2 vuvA2 = vec2(vUv2.x, vUv2.y - t2);
  vec4 imageA2 = texture2D(uSampler, vuvA2) * blend2;
  vec4 fColor2 = (imageA2.bbra * blend) + (imageA2 * blend2);
  vec2 vUv3 = vTextureCoord;
  vUv3 -= vec2(0.5);
  vUv3 *= vec2(zoom);
  vUv3 += vec2(0.5);
  vUv3.y += (offset * 0.75);
  vec4 image3 = texture2D(uSampler, vec2(vUv3.x, vUv3.y + blend));
  float t3 = ((image3.r * displaceAmount3) * offset) * 0.35;
  vec2 vuvA3 = vec2(vUv3.x, vUv3.y - t3);
  vec4 imageA3 = texture2D(uSampler, vuvA3) * blend2;
  vec4 fColor3 = (imageA3.bbra * blend) + (imageA3 * blend2);
  if (image1.a == 1.) {
    image2.a = 0.;
  }
  if (image2.a == 1.) {
    image3.a = 0.;
  }
  vec4 dsimg1 = max(fColor, image1);
  vec4 dsimg2 = max(fColor2 * (1. - image1.a), image2 * (1. - image1.a));
  vec4 dsimg3 = max((fColor3 * (1. - image2.a)) * (1. - image1.a), (image3 * (1. - image2.a)) * (1. - image1.a));
  gl_FragColor = (dsimg1 + dsimg2) + dsimg3;
}
`

const frag = `
precision mediump float;
precision mediump int;
varying vec2 vTextureCoord;
varying vec4 vColor;
uniform sampler2D uSampler;
uniform float hoverProgress;
uniform float time;
uniform float blend;
uniform float offset;
uniform float delayOffset;
uniform float friction;
#define PI 3.14159265359
float displaceAmount = 0.5;
float displaceAmount2 = 0.3;
float displaceAmount3 = 0.2;
mat2 rotate2d(float _angle) {
  return mat2(cos(_angle), -sin(_angle), sin(_angle), cos(_angle));
}
void main() {
  vec2 vUv = vTextureCoord;
  vUv -= vec2(0.5);
  float scaleLvl = 0.1;
  vec2 vUv1 = vUv * rotate2d(PI);
  vUv1 += vec2(0.5);
  float hp = hoverProgress * 1.5;
  float y = (0.3 * (1.680 - smoothstep(0.180, 0.492, vUv1.y - hoverProgress))) + smoothstep(0.340, 0.896, vUv1.y - hoverProgress);
  if (y > 1.) {
    y = 1.;
  }
  float x = sin(vUv1.y / 10.);
  float zoom = 1. - (scaleLvl * (1. - y));
  vUv *= vec2(zoom);
  vUv += vec2(0.5);
  vUv.y += offset;
  vec4 image1 = texture2D(uSampler, vUv);
  float blend2 = 1. - blend;
  vec4 image = texture2D(uSampler, vec2(vUv.x, vUv.y + blend));
  float t1 = (image.r * displaceAmount) * offset;
  vec2 vuvA = vec2(vUv.x, vUv.y - t1);
  vec4 imageA = texture2D(uSampler, vuvA) * blend2;
  vec4 fColor = (imageA.bbra * blend) + (imageA * blend2);
  vec2 vUv2 = vTextureCoord;
  vUv2 -= vec2(0.5);
  vUv2 *= vec2(zoom);
  vUv2 += vec2(0.5);
  vUv2.y += (offset * 0.85);
  vec4 image2 = texture2D(uSampler, vec2(vUv2.x, vUv2.y + blend));
  float t2 = ((image2.r * displaceAmount2) * offset) * 0.85;
  vec2 vuvA2 = vec2(vUv2.x, vUv2.y - t2);
  vec4 imageA2 = texture2D(uSampler, vuvA2) * blend2;
  vec4 fColor2 = (imageA2.bbra * blend) + (imageA2 * blend2);
  vec2 vUv3 = vTextureCoord;
  vUv3 -= vec2(0.5);
  vUv3 *= vec2(zoom);
  vUv3 += vec2(0.5);
  vUv3.y += (offset * 0.75);
  vec4 image3 = texture2D(uSampler, vec2(vUv3.x, vUv3.y + blend));
  float t3 = ((image3.r * displaceAmount3) * offset) * 0.35;
  vec2 vuvA3 = vec2(vUv3.x, vUv3.y - t3);
  vec4 imageA3 = texture2D(uSampler, vuvA3) * blend2;
  vec4 fColor3 = (imageA3.bbra * blend) + (imageA3 * blend2);
  if (image1.a == 1.) {
    image2.a = 0.;
  }
  if (image2.a == 1.) {
    image3.a = 0.;
  }
  vec4 dsimg1 = max(fColor, image1);
  vec4 dsimg2 = max(fColor2 * (1. - image1.a), image2 * (1. - image1.a));
  vec4 dsimg3 = max((fColor3 * (1. - image2.a)) * (1. - image1.a), (image3 * (1. - image2.a)) * (1. - image1.a));
  gl_FragColor = (dsimg1 + dsimg2) + dsimg3;
}
`

export class SheetOscillationFilter extends Filter {
  constructor(options: Dict<any>) {
    super(undefined, frag, options)
  }
}

export const getNewSheetOscillationFilter = (
  options: Dict<any> = {
    blend: 0,
    offset: 0,
    hoverProgress: -1,
    delayOffset: 1,
    friction: 0,
  }
) => {
  const filter = new SheetOscillationFilter(options)
  filter.resolution = getDevicePixelRatio()
  return filter
}
