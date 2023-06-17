import { AlphaFilter } from '@pixi/filter-alpha'
import { Sprite } from '@pixi/sprite'

import { VoronoiCanvasThresholdFilter } from '@lib/engine/renderer/filter/VoronoiCanvasThresholdFilter'
import { EngineRendererStages } from '@lib/engine/renderer/types'
import getConfig, {
  getCurrentMaxBreakpointValue,
  isOutlineLineStyleModeWithNoFill,
  usingAnimatedTextures,
  usingBlurStrategy,
  usingGeometricStyleStrategy,
  usingIsolatedMediaCanvas,
  usingMedia,
  usingTextures,
} from '@lib/engine/settings'
import { isSmallBreakpoint } from '@lib/utils/bph'

import {
  createBaseDspStage,
  createBaseStage,
  createFinalStage,
  createFirstBlurStage,
  createMediaElementsStage,
  createRTStage,
  createThirdBlurStage,
  getDisplayModeFilters,
  getFirstFgTexture,
  getMediaPreWrappersFilters,
  getSecondFgTexture,
} from './helpers'

export const createStages = (): EngineRendererStages => {
  const baseDspStage = createBaseDspStage({
    sceneProps: {
      // interactiveChildren: false,
      sortableChildren: true,
      // zIndex: 5,
    },
    children: [
      ...(usingTextures() ? [getFirstFgTexture(usingAnimatedTextures(), false)] : []),
      // ...(usingTextures() ? [getSecondFgTexture(true)] : []),
    ],
  })

  const baseDecoStage = createBaseStage({
    sceneProps: {
      interactiveChildren: false,
      // zIndex: 6,
    },
  })

  const baseDeco2Stage = createBaseStage({
    sceneProps: {
      interactiveChildren: false,
      // zIndex: 6,
    },
  })

  const baseMiscStage = createBaseStage({
    sceneProps: {
      // interactiveChildren: false,
    },
  })

  const mediaPreWrappersStage = createBaseStage({
    sceneProps: {
      interactiveChildren: false,
      zIndex: 10,
      filters: !isSmallBreakpoint() ? getMediaPreWrappersFilters() : null,
    },
  })

  const mediaPostWrappersStage = getCurrentMaxBreakpointValue(getConfig().visuals.media?.postWrapper)
    ? createBaseStage({
        sceneProps: {
          interactiveChildren: false,
        },
      })
    : undefined

  const baseStage = createRTStage({
    children: [
      baseDecoStage.scene,
      baseMiscStage.scene,
      baseDspStage.scene,
      baseDeco2Stage.scene,
      ...(usingTextures() ? [getSecondFgTexture(true)] : []),
      ...(!usingIsolatedMediaCanvas() && mediaPreWrappersStage ? [mediaPreWrappersStage.scene] : []),
    ],
    sceneProps: {
      sortableChildren: true,
      filters: [
        ...(usingGeometricStyleStrategy() ? getDisplayModeFilters() : []),
        ...(isSmallBreakpoint() ? [new AlphaFilter(0.8)] : []),
      ],
    },
    spriteProps: {
      zIndex: isSmallBreakpoint() ? 50 : undefined,
    },
    hasBg: usingGeometricStyleStrategy()
      ? !isOutlineLineStyleModeWithNoFill() && getConfig().visuals.fillColor
        ? getConfig().visuals.fillColor
        : false
      : 0xffffff,
  })

  const firstBlurStage = usingBlurStrategy()
    ? createFirstBlurStage({
        children: [baseStage.sprite],
        rtOptions: { resFactor: 0.5 },
      })
    : undefined
  const secondBlurStage =
    firstBlurStage && usingBlurStrategy()
      ? createRTStage({
          sceneProps: { filters: [new VoronoiCanvasThresholdFilter(isSmallBreakpoint() ? 0.35 : 0.5)] },
          children: [firstBlurStage.sprite],
          spriteProps: {
            tint: getConfig().visuals.fillColor,
          },
        })
      : undefined
  const secondBlurInverseStage =
    usingBlurStrategy() && usingMedia()
      ? createRTStage({
          children: (() => {
            const s = new Sprite(secondBlurStage ? secondBlurStage.rt : baseStage.rt)
            s.tint = 0x000000
            return [s]
          })(),
          hasBg: true,
        })
      : undefined

  const mediaElementsStage = usingMedia()
    ? createMediaElementsStage({
        ...(secondBlurInverseStage?.sprite
          ? {
              mask: secondBlurInverseStage?.sprite,
            }
          : {}),
        sceneProps: {
          // filters: getMediaElementsFilters(),
          interactiveChildren: false,
        },
      })
    : undefined

  const thirdBlurStage =
    usingBlurStrategy() && secondBlurStage
      ? createThirdBlurStage({
          sceneProps: {
            sortableChildren: true,
          },
          children: [secondBlurStage.sprite],
        })
      : undefined
  // const viewportStage = createViewportStage(app, { children: [finalStage.scene] })

  const finalStage = createFinalStage([
    // baseDecoStage.scene,
    usingBlurStrategy() && thirdBlurStage?.sprite ? thirdBlurStage.sprite : baseStage.sprite,
    // ...(usingTextures() ? [getBGTextureSprite(baseStage)] : []),
    // ...(mediaPreWrappersStage && !usingIsolatedMediaCanvas() ? [mediaPreWrappersStage.sprite] : []),
    ...(mediaElementsStage && !usingIsolatedMediaCanvas() ? [mediaElementsStage.scene] : []),
    ...(mediaPostWrappersStage && !usingIsolatedMediaCanvas() ? [mediaPostWrappersStage.scene] : []),
  ])

  const finalMediaStage = usingIsolatedMediaCanvas()
    ? createFinalStage(
        [
          ...(mediaPreWrappersStage ? [mediaPreWrappersStage.scene] : []),
          ...(mediaElementsStage ? [mediaElementsStage.scene] : []),
          ...(mediaPostWrappersStage ? [mediaPostWrappersStage.scene] : []),
        ]
        // getMediaWrappersFilters()
      )
    : undefined

  return {
    baseMisc: baseMiscStage,
    baseDeco: baseDecoStage,
    baseDeco2: baseDeco2Stage,
    baseDsp: baseDspStage,
    base: baseStage,
    ...(usingBlurStrategy()
      ? {
          firstBlur: firstBlurStage,
          secondBlur: secondBlurStage,
          thirdBlur: thirdBlurStage,
          secondBlurInverse: secondBlurInverseStage,
        }
      : {}),
    final: finalStage,
    ...(usingIsolatedMediaCanvas() ? { finalMedia: finalMediaStage } : {}),
    ...(mediaElementsStage ? { mediaElements: mediaElementsStage } : {}),
    ...(mediaPreWrappersStage ? { mediaPreWrappers: mediaPreWrappersStage } : {}),
    ...(mediaPostWrappersStage ? { mediaPostWrappers: mediaPostWrappersStage } : {}),
  }
}
