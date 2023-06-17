import { RenderTexture } from '@pixi/core'
import { Container } from '@pixi/display'
import { Graphics } from '@pixi/graphics'
import { SmoothGraphics } from '@pixi/graphics-smooth'
import { Point } from '@pixi/math'
import { Sprite } from '@pixi/sprite'

import { OutlineLineStyle } from '@lib/engine/settings/types'

export type EngineRendererStage = {
  scene: Container
  bg?: Sprite
  rt?: RenderTexture
  sprite?: Sprite
}

export type EngineRendererStageKey =
  | 'baseMisc'
  | 'baseDeco'
  | 'baseDeco2'
  | 'baseDsp'
  | 'base'
  | 'firstBlur'
  | 'secondBlur'
  | 'secondBlurInverse'
  | 'thirdBlur'
  | 'final'
  | 'mediaElements'
  | 'mediaPreWrappers'
  | 'mediaPostWrappers'
  | 'finalMedia'

export type EngineRendererStages = Partial<Record<EngineRendererStageKey, EngineRendererStage>>

export type LineGraphicsData = {
  graphics: SmoothGraphics | Graphics
  style: OutlineLineStyle
  points?: Point[]
  relativePoints?: Point[]
  totalOffset?: number
}
