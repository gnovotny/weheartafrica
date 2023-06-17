import { Filter } from '@pixi/core'

export class VoronoiCanvasThresholdFilter extends Filter {
  constructor(e = 0.5) {
    super(
      undefined,
      `
                precision mediump float;
                varying vec2 vTextureCoord;
                uniform sampler2D uSampler;
                uniform float threshold;

                void main() {
                    vec4 color = texture2D(uSampler, vTextureCoord);
                    float v = smoothstep(${e - 0.02}, ${e + 0.02}, color.r);
                    gl_FragColor = vec4(v);
                }
            `
    )
  }
}
