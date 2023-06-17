import { WRAP_MODES } from '@pixi/constants'
import { Filter, RenderTexture, Texture } from '@pixi/core'
import { Container } from '@pixi/display'
import { DropShadowFilter } from '@pixi/filter-drop-shadow'
import { KawaseBlurFilter } from '@pixi/filter-kawase-blur'
import { NoiseFilter } from '@pixi/filter-noise'
import { OutlineFilter } from '@pixi/filter-outline'
import { Graphics } from '@pixi/graphics'
import { Sprite } from '@pixi/sprite'
import { TilingSprite } from '@pixi/sprite-tiling'
import sync from 'framesync'

import { CustomDisplacementFilter } from '@lib/engine/renderer/filter/CustomDisplacementFilter'
import getConfig from '@lib/engine/settings'
import { OUTLINE_MODE } from '@lib/engine/settings/enums'
import {
  canDeepRender,
  getCurrentMaxBreakpointValue,
  getDevicePixelRatio,
  usingDisplacement,
  usingRendererNoise,
} from '@lib/engine/settings/utils'
import { isSmallBreakpoint } from '@lib/utils/bph'
import {
  deepRenderIsScheduled,
  getDimensions,
  getResourceByKey,
  hasVisibleCellKeysWithDisplacement as hasVisibleCellsWithDisplacement,
  loadResourceUrl,
} from 'lib/state'

export type StageOptions = {
  children?: Array<Sprite | Container | Graphics>
  hasBg?: boolean | number
  rtOptions?: {
    resFactor: number
  }
  spriteProps?: Partial<Record<keyof Sprite, any>>
  sceneProps?: Partial<Record<keyof Container, any>>
  mask?: Sprite | Container | Graphics
}

// const OFFSET_FACTOR = 0.125
const OFFSET_FACTOR = getConfig().renderer.filterFixRTOffsetFactor ?? 0
// const OFFSET_FACTOR = 0.0

export const fillBG = (bg: Sprite, width: number, height: number) => {
  bg.x = OFFSET_FACTOR * -width
  bg.y = OFFSET_FACTOR * -height
  bg.width = (1 + OFFSET_FACTOR * 2) * width
  bg.height = (1 + OFFSET_FACTOR * 2) * height
}

export const createBaseStage = ({ children = [], sceneProps }: StageOptions) => {
  const scene = new Container()

  Object.assign(scene, sceneProps)

  children.forEach((child) => scene.addChild(child))

  return {
    scene,
  }
}

export const createBaseDspStage = ({
  children = [],
  rtOptions = {
    resFactor: 1,
  },
  sceneProps,
}: StageOptions) => {
  const scene = new Container()

  if (usingDisplacement()) {
    applyDisplacement(scene)
  }

  Object.assign(scene, sceneProps)

  children.forEach((child) => scene.addChild(child))

  return {
    scene,
  }
}

export const createRTStage = ({
  children = [],
  hasBg = false,
  rtOptions = {
    resFactor: 1,
  },
  spriteProps,
  sceneProps,
}: StageOptions) => {
  const [width, height] = getDimensions()
  let bg

  const scene = new Container()
  scene.position.set(OFFSET_FACTOR * width, OFFSET_FACTOR * height)
  Object.assign(scene, sceneProps)

  if (hasBg) {
    bg = Sprite.from(Texture.WHITE)
    if (!isNaN(hasBg as number)) {
      bg.tint = hasBg as number
    }
    fillBG(bg, width, height)
    scene.addChild(bg)
  }

  children.forEach((child) => scene.addChild(child))

  const rt = RenderTexture.create({
    width: width * (1 + OFFSET_FACTOR * 2),
    height: height * (1 + OFFSET_FACTOR * 2),
    resolution: rtOptions.resFactor * getDevicePixelRatio(),
  })
  const sprite = new Sprite(rt)
  sprite.position.set(OFFSET_FACTOR * -width, OFFSET_FACTOR * -height)
  Object.assign(sprite, spriteProps)

  return {
    scene,
    bg,
    rt,
    sprite,
  }
}

export const createFirstBlurStage = (options: StageOptions) => {
  const blurFilter = new KawaseBlurFilter(isSmallBreakpoint() ? 4 : 7, isSmallBreakpoint() ? 4 : 7, true)
  blurFilter.padding = 0
  blurFilter.resolution = 0.5 * getDevicePixelRatio()

  return createRTStage({
    ...options,
    spriteProps: {
      ...options.spriteProps,
      filters: [blurFilter],
    },
  })
}

export const createThirdBlurStage = (options: StageOptions) =>
  createRTStage({
    ...options,
    children: [
      ...(options.children ? options.children : []),
      // ...(getConfig().features.textures ? [getBGTextureSprite()] : []),
    ],
    spriteProps: {
      ...options.spriteProps,
      filters: getDisplayModeFilters(),
    },
  })

export const createFinalStage = (children: Container[], filters: Filter[] | null = null) => {
  const scene = new Container()
  scene.sortableChildren = true
  scene.interactiveChildren = false
  children.forEach((child) => scene.addChild(child))
  scene.filters = filters

  return {
    scene,
  }
}

export const createMediaElementsStage = ({ mask, sceneProps, spriteProps }: StageOptions) => {
  const [width, height] = getDimensions()

  const scene = new Container()
  Object.assign(scene, sceneProps)

  // let filters: Filter[] = []
  // filters = [
  //   new DropShadowFilter({
  //     rotation: 90,
  //     // color: 0xc8d0e7,
  //     // color: 0xd1cdc7,
  //     color: 0x000000,
  //     alpha: 0.7,
  //     distance: 5,
  //     // blur: 1,
  //     // pixelSize: .5
  //     // quality: 1,
  //     // resolution: 0.5 * getConfig().RENDERER.DEVICE_PIXEL_RATIO,
  //   }),
  // ]
  // switch (getConfig().DISPLAY_MODE) {
  //   case 'shadow':
  //     filters = [
  //       ...(getConfig().ROUNDING_STRATEGY === ROUNDING_STRATEGY.BLUR ? [new GlowFilter({ quality: 0.1, distance: 15, innerStrength: 100, color: getConfig().VISUALS.FILL_COLOR })] : []),
  //       new CustomDropShadowFilter({
  //         colors: {
  //           light: getConfig().VISUALS.SHADOW.COLOR_LIGHT,
  //           dark: getConfig().VISUALS.SHADOW.COLOR_DARK,
  //         },
  //         alpha: 1,
  //         distance: 5,
  //       }),
  //     ]
  //     break
  // }
  //
  // if (getConfig().WEBGL_NOISE_ENABLED) {
  //   filters
  //     .push
  //     // new NoiseFilter()
  //     // new OldFilmFilter({
  //     //   // sepia: 0,
  //     //   // scratch: 0,
  //     //   // vignetting: 0,
  //     //   // noise: 1,
  //     // })
  //     ()
  // }
  //
  // scene.filters = filters
  //
  // mask && (scene.mask = mask)

  // const rt = RenderTexture.create({
  //   width: width,
  //   height: height,
  //   resolution: getDevicePixelRatio(),
  // })
  // const sprite = new Sprite(rt)
  //
  // Object.assign(sprite, spriteProps)

  return {
    scene,
    // rt,
    // sprite,
  }
}

// const createViewportStage = (app: Application, { children = [] }: MaskStageOptions) => {
//   const [width, height] = getDimensions()
//
//   const scene = new Viewport({
//     screenWidth: width,
//     screenHeight: height,
//     worldWidth: width,
//     worldHeight: height,
//
//     interaction: app.renderer.plugins.interaction,
//   })
//
//   scene
//     .drag()
//     .wheel()
//     .pinch()
//   children.forEach((child) => scene.addChild(child))
//
//   return {
//     scene,
//   }
// }

export const getDisplayModeFilters = () => {
  let filters: Filter[] = []

  switch (getConfig().visuals.mode) {
    case 'outline':
      if (getConfig().visuals.outline?.mode === OUTLINE_MODE.FILTER) {
        filters =
          getCurrentMaxBreakpointValue(getConfig().visuals.outline?.styles)?.map(
            (style) =>
              new OutlineFilter(getCurrentMaxBreakpointValue(style.width), getCurrentMaxBreakpointValue(style.color))
          ) || []
      }
      break

    case 'shadow':
      filters = [
        // new CustomDropShadowFilter({
        //   colors: {
        //     light: getConfig().VISUALS.SHADOW.COLOR_LIGHT,
        //     dark: getConfig().VISUALS.SHADOW.COLOR_DARK,
        //   },
        //   alpha: 1,
        //   distance: 5,
        // }),
        //
        new OutlineFilter(0.5, getConfig().visuals.shadow?.colorOutline),
        new DropShadowFilter({
          // color: 0xc8d0e7,
          // color: 0xd1cdc7,
          color: getConfig().visuals.shadow?.colorDark,
          // alpha: 0.7,
          alpha: 1,
          distance: 5,
          // blur: 1,
          // pixelSize: .5
          // quality: 1,
          // resolution: 0.5 * getConfig().RENDERER.DEVICE_PIXEL_RATIO,
        }),
        new DropShadowFilter({
          // rotation: -45,
          distance: -5,
          color: getConfig().visuals.shadow?.colorLight,
          alpha: 0.7,
          // alpha: 1,
          // blur: 1,
          // pixelSize: .5
          // quality: 1,
          // resolution: 0.5 * getConfig().RENDERER.DEVICE_PIXEL_RATIO
        }),
      ]
      break
  }
  return filters
}

export const getMediaPreWrappersFilters = () => {
  let filters: Filter[] = [
    new DropShadowFilter({
      rotation: 90,
      // color: 0xc8d0e7,
      // color: 0xd1cdc7,
      color: 0x1a1a1e,
      alpha: 0.5,
      distance: 4,
      blur: 2,
      pixelSize: 1,
      quality: 1,
      // resolution: 0.5 * getDevicePixelRatio(),
      shadowOnly: false,
    }),
  ]
  return filters
}

let noiseFilter: NoiseFilter
if (usingRendererNoise()) {
  // oF = new OldFilmFilter({
  //   sepia: 0,
  //   noise: 0.2,
  //   noiseSize: 0.5,
  //   scratch: 0,
  //   scratchDensity: 0,
  //   vignetting: 0,
  //   vignettingAlpha: 0,
  //   vignettingBlur: 0,
  // })

  noiseFilter = new NoiseFilter(0.2)

  sync.preRender(() => {
    // Ticker.shared.add(() => {
    noiseFilter.seed = Math.random()
  }, true)
}

export const getMediaElementsFilters = () => {
  let filters: Filter[] | null = null

  // const maskedFIlter = new MaskFilter(oF)
  // maskedFIlter.safeFlipY = true

  if (noiseFilter) {
    filters = [noiseFilter]
  }

  // oF.resolution = getDevicePixelRatio()

  return filters
}

export const applyDisplacement = (target: Container) => {
  target.visible = false

  // const displacementTex = Texture.from('/assets/displacement_map_repeat.jpg', { width: 512, height: 512 }
  loadResourceUrl('/assets/displacement_map_repeat.jpg', (resource) => {
    const texture = resource?.texture
    if (!texture) return

    // Make sure the texture is wrapping.
    texture.baseTexture.wrapMode = WRAP_MODES.REPEAT
    const displacementSprite = new Sprite(texture)
    // displacementSprite.width = width
    // displacementSprite.height = height
    const displacementFilter = new CustomDisplacementFilter(displacementSprite)
    // const displacementFilter = new DisplacementFilter(displacementSprite)
    // displacementFilter.padding = 0
    displacementFilter.padding = 0
    displacementFilter.autoFit = false // https://pixijs.download/dev/docs/PIXI.Filter.html#autoFit

    // displacementSprite.position.set(width / 2, height / 2)

    // displacementSprite.angle += 90
    displacementSprite.position.set(0, 0)
    displacementSprite.anchor.set(0.5)

    // displacementSprite.scale.set(.2)

    // displacementFilter.scale.x = 30
    // displacementFilter.scale.y = 60
    displacementFilter.scale.x = 240 / 1.5
    displacementFilter.scale.y = 240 / 1.5
    // displacementFilter2.scale.x = -240
    // displacementFilter2.scale.y = 240

    // displacementFilter.

    // Ticker.shared.add((delta) => {
    if (!isSmallBreakpoint()) {
      sync.preRender(({ delta }) => {
        // return

        if (!canDeepRender()) {
          return
        }

        if (!hasVisibleCellsWithDisplacement()) {
          target.visible = false
          return
        } else {
          target.visible = true
        }

        const customDelta = delta / 4

        try {
          if (!displacementSprite) return
          // Offset the sprite position to make vFilterCoord update to larger value. Repeat wrapping makes sure there's still pixels on the coordinates.
          displacementSprite.y += 0.0625 * customDelta
          // displacementSprite.rotation += 0.0001 * customDelta
          // displacementSprite.y += 0.0625 * customDelta
          // Reset x to 0 when it's over width to keep values from going to very huge numbers.
          // if (displacementSprite.x > displacementSprite.width) {
          //   displacementSprite.x = 0
          // }

          // displacementSprite.rotation += 0.1

          // if (displacementSprite.y > displacementSprite.height) {
          //   displacementSprite.y = 0
          // }
        } catch (e) {}
      }, true /*, UPDATE_PRIORITY.HIGH*/)
    }

    target.addChild(displacementSprite)
    if (!target.filters) target.filters = []
    target.filters.push(displacementFilter)
    // target.filters?.push(displacementFilter2)

    target.visible = true
  })

  // const displacementTex = Texture.from('/assets/displacement2.png')
}

export const getFirstFgTexture = (animated = false, cache = true) => {
  const [width, height] = getDimensions()

  const fgTex1 = Texture.from('/assets/fg_texture-2.png', { width: 210, height: 144 })

  const spriteContainer = new Container()
  spriteContainer.interactiveChildren = false
  spriteContainer.zIndex = 500

  const fg1Sprite = new TilingSprite(fgTex1, width, height)
  fg1Sprite.tileScale.set(260 / 210, 260 / 144)
  // fg1Sprite.tileScale.set(0.5, 0.5)
  fg1Sprite.position.set(0)
  // fg1Sprite.position.set(width / 2, height / 2)
  // fg1Sprite.pivot.set(width / 2, height / 2)
  spriteContainer.addChild(fg1Sprite)

  const fg1Sprite2 = new TilingSprite(fgTex1, width, height)
  fg1Sprite2.tileScale.set(260 / 210, 260 / 144)
  fg1Sprite2.tilePosition.set(130, 130)
  fg1Sprite2.position.set(0)
  // fg1Sprite.position.set(width / 2, height / 2)
  // fg1Sprite.pivot.set(width / 2, height / 2)
  spriteContainer.addChild(fg1Sprite2)

  if (animated && !isSmallBreakpoint()) {
    sync.preRender(({ delta }) => {
      // Ticker.shared.add((delta) => {
      if (!deepRenderIsScheduled() || !hasVisibleCellsWithDisplacement()) {
        // if (!spriteContainer.cacheAsBitmap) {
        //   spriteContainer.cacheAsBitmap = true
        // }
        return
      }

      // if (spriteContainer.cacheAsBitmap) {
      //   spriteContainer.cacheAsBitmap = false
      // }

      const customDelta = delta / 10

      if (fg1Sprite) {
        fg1Sprite.tileTransform.rotation += 0.0005 * customDelta
        fg1Sprite.tilePosition.x -= 0.025 * customDelta
        fg1Sprite.tilePosition.y -= 0.025 * customDelta
        // fg1Sprite.tileScale.x -= 0.00025 * (Math.random() < 0.5 ? -1 : 1) * customDelta
        // fg1Sprite.tileScale.y -= 0.00025 * (Math.random() < 0.5 ? -1 : 1) * customDelta
      }

      if (fg1Sprite2) {
        fg1Sprite2.tileTransform.rotation -= 0.0005 * customDelta
        fg1Sprite2.tilePosition.x += 0.025 * customDelta
        fg1Sprite2.tilePosition.y += 0.025 * customDelta
        // fg1Sprite2.tileScale.x += 0.00025 * (Math.random() < 0.5 ? -1 : 1) * customDelta
        // fg1Sprite2.tileScale.y += 0.00025 * (Math.random() < 0.5 ? -1 : 1) * customDelta
      }
    }, true /*, UPDATE_PRIORITY.HIGH*/)
  }

  return spriteContainer
}

export const getSecondFgTexture = (cache = false) => {
  const [width, height] = getDimensions()

  const spriteContainer = new Container()
  spriteContainer.interactiveChildren = false
  spriteContainer.zIndex = 50

  const mediaProps = {
    src: '/assets/bg_canvas-repeat-3-white_small.png',
    width: 300,
    height: 169,
  }

  const initSprites = (texture: Texture) => {
    const fg2Sprite = new TilingSprite(texture, width, height)
    // fg2Sprite.tileScale.set(300 / 1366, 150 / 768)
    spriteContainer.addChild(fg2Sprite)

    const fg2Sprite2 = new TilingSprite(texture, width, height)
    // fg2Sprite2.tileScale.set(300 / 1366, 150 / 768)
    fg2Sprite2.tilePosition.set(150, 75)
    spriteContainer.addChild(fg2Sprite2)

    if (cache) spriteContainer.cacheAsBitmap = true
  }

  const existingLoaderResource = getResourceByKey(mediaProps.src)

  if (existingLoaderResource?.texture) {
    initSprites(existingLoaderResource.texture)
  } else {
    loadResourceUrl(mediaProps.src, (resource) => {
      if (!resource?.texture) return
      initSprites(resource.texture)
    })
  }

  return spriteContainer
}
