import { BLEND_MODES } from '@pixi/constants'
import { Texture } from '@pixi/core'
import { Container } from '@pixi/display'
import { DropShadowFilter } from '@pixi/filter-drop-shadow'
import { Graphics, LINE_CAP, LINE_JOIN } from '@pixi/graphics'
import { SmoothGraphics } from '@pixi/graphics-smooth'
import { LoaderResource } from '@pixi/loaders'
import { Point, Polygon } from '@pixi/math'
import { Sprite } from '@pixi/sprite'
import { animate, easeIn, easeOut } from 'popmotion'

import { LinkCellProps } from '@components/cells/Link/LinkCell'
import getCellMargin from '@lib/engine/geometry/getCellMargin'
import {
  drawCustomPolyInstructions,
  drawCustomPolyInstructionsWithLineStyles,
} from '@lib/engine/geometry/offsetPoly/drawCustomPolyInstructions'
import { getNewSheetOscillationFilter } from '@lib/engine/renderer/filter/SheetOscillationFilter'
import { getMediaElementsFilters } from '@lib/engine/renderer/stages/helpers'
import { EngineRendererStages } from '@lib/engine/renderer/types'
import {
  betterScaleToFill,
  handleEnginePointerEvent,
  handleEnginePointerEventThrottled,
  randomFromArr,
  shuffleArr,
} from '@lib/engine/renderer/utils'
import getConfig from '@lib/engine/settings'
import {
  MANIPULATION_STRATEGY,
  OUTLINE_MODE,
  POINTER_INTERACTIONS_MODE,
  VISUALS_MODE,
} from '@lib/engine/settings/enums'
import { OutlineLineStyle } from '@lib/engine/settings/types'
import {
  getCurrentMaxBreakpointValue,
  getDevicePixelRatio,
  hasGeometricRendererScaling,
  hasPointerInteractions,
  isOutlineLineStyleModeWithNoFill,
  usesRelativePoints,
  usingBlurStrategy,
  usingGeometricStyleStrategy,
  usingGeometryStrategy,
  usingLineJoinStrategy,
} from '@lib/engine/settings/utils'
import { intervalAnimationDriver } from '@lib/engine/simulation/lib/animate'
import { EngineCellComponentProps, EngineCellData } from '@lib/engine/types'
import { getCellManipulationData } from '@lib/engine/utils/cellData'
import { isLargeBreakpoint, isSmallBreakpoint } from '@lib/utils/bph'
import {
  addVisibleCellKeyWithDisplacement,
  getResourceByKey,
  getScrollData,
  loadResourceUrl,
  removeVisibleCellKeyWithDisplacement,
  requestRouteChange,
  setCellIsExpanded,
  subIsScrolling,
} from 'lib/state'

const GenericGraphics: typeof SmoothGraphics | typeof Graphics = getConfig().renderer.smoothGeometry
  ? SmoothGraphics
  : Graphics

const SHARED_LINE_GRAPHICS = isSmallBreakpoint()
const SHARED_LINE_STYLES = false

export class RendererCell {
  public mainGraphics: SmoothGraphics | Graphics | undefined
  public interactiveGraphics: SmoothGraphics | Graphics | undefined
  public static lineGraphics: SmoothGraphics | Graphics | undefined
  public static lineGraphics2: SmoothGraphics | Graphics | undefined
  public lineGraphics: SmoothGraphics | Graphics | undefined
  public mediaMaskGraphics: SmoothGraphics | Graphics | undefined
  public mediaPreWrappersGraphics: SmoothGraphics | Graphics | undefined
  public mediaPostWrappersGraphics: SmoothGraphics | Graphics | undefined
  public siteGraphics: SmoothGraphics | Graphics | undefined
  public centroidGraphics: SmoothGraphics | Graphics | undefined
  public pointsGraphics: SmoothGraphics | Graphics | undefined
  public originalPoints: Point[] = []
  public absolutePoints: Point[] = []
  public relativePoints: Point[] = []
  public absoluteMediaPoints: Point[] = []
  public relativeMediaPoints: Point[] = []
  public data: EngineCellData | undefined
  public sitePoint: Point | undefined
  public stages: EngineRendererStages

  public key: number | string | undefined
  public mediaSprite: Sprite | undefined
  public decoSprite: Sprite | undefined
  public mediaSpriteContainer: Container | undefined

  public bbox: any
  public centroidPoint: Point | undefined
  public labelCentroidPoint: Point | undefined
  public scale = 1
  public isFocused = false
  public isDestroyed = false
  public isVisible = false
  public isExpanded = false

  public linePolyInstructions: any
  public mediaPolyInstructions: any
  public mainPolyInstructions: any
  public lineStyles: OutlineLineStyle[] | undefined

  isScrollingUnsub: (() => void) | undefined = undefined

  constructor(cellData: EngineCellData, stages: EngineRendererStages) {
    this.stages = stages
    this.data = cellData

    this.processData()
    this.initMainGraphics()
    this.initMedia()
    this.initSiteGraphics()
    this.initCentroidGraphics()
    this.initVisiblePointsGraphics()
    this.initLineGraphics()
    this.initDeco()
    this.initInteractivity()
    this.setVisibility(true)
  }

  private initLineStyles() {
    if (!this.hasMedia() || isSmallBreakpoint()) {
      if (this.getCustomConfig()?.outlineStyles) {
        const outlineStyles = getCurrentMaxBreakpointValue(this.getCustomConfig().outlineStyles)
        if (outlineStyles) {
          this.lineStyles = outlineStyles
        }
      } else if (this.getCustomConfig()?.outlineStylesOptions) {
        const stylesOptions = getCurrentMaxBreakpointValue(this.getCustomConfig().outlineStylesOptions)
        if (stylesOptions) {
          const shuffledColors = shuffleArr([...stylesOptions.colors])
          for (let i = 0; i < randomFromArr(getCurrentMaxBreakpointValue(stylesOptions.range) as any[]); i++) {
            if (!this.lineStyles) this.lineStyles = []
            this.lineStyles.push({
              width: randomFromArr(stylesOptions.widths),
              color: shuffledColors[i],
            })
          }
        }
      } else if (getConfig().visuals.outline?.styles) {
        this.lineStyles = getCurrentMaxBreakpointValue(getConfig().visuals.outline?.styles)
      } else {
        const stylesOptions = getCurrentMaxBreakpointValue(getConfig().visuals.outline?.stylesOptions)
        if (stylesOptions) {
          const shuffledColors = shuffleArr([...stylesOptions.colors])
          for (let i = 0; i < randomFromArr(getCurrentMaxBreakpointValue(stylesOptions.range) as any[]); i++) {
            if (!this.lineStyles) this.lineStyles = []
            this.lineStyles.push({
              width: randomFromArr(stylesOptions.widths),
              color: shuffledColors[i],
            })
          }
        }
      }
    }

    return this.lineStyles
  }

  private initMainGraphics() {
    if (this.getCustomConfig()?.fillStyles || this.isInteractive() || this.hasLink()) {
      if (!this.mainGraphics) this.mainGraphics = new GenericGraphics()

      if (usingGeometricStyleStrategy() && getConfig().visuals.fillColor) {
        this.mainGraphics.blendMode = BLEND_MODES.SRC_OUT
      }

      if (this.hasCustomConfig()) {
        const { scale, alpha, zIndex } = this.getCustomConfig().fillStyles || {}

        if (scale) {
          this.mainGraphics.scale.set(scale)
        }
        alpha && (this.mainGraphics.alpha = alpha)
        zIndex && (this.mainGraphics.zIndex = zIndex)
      }

      ;(this.hasDisplacement() ? this.stages.baseDsp : this.stages.base)?.scene.addChild(this.mainGraphics)
    }
  }

  private initDeco() {
    if (this.hasCustomConfig()) {
      const { src, size } = this.getCustomConfig().deco || {}

      if (src) {
        this.decoSprite = new Sprite(Texture.from(src.url, src.dimensions))
        this.decoSprite.tint = 0x1a1a1e
        const { width: srcWidth, height: srcHeight } = src.dimensions
        const sideLength = size ?? 150

        const scale = Math.max(sideLength / srcWidth, sideLength / srcHeight)
        this.decoSprite.height = srcHeight * scale
        this.decoSprite.width = srcWidth * scale
        this.stages.baseDeco2?.scene.addChild(this.decoSprite)
      }
    }
  }

  private initSiteGraphics() {
    if (getConfig().features.sites) {
      if (!this.siteGraphics) this.siteGraphics = new GenericGraphics()
      this.siteGraphics.zIndex = 200
      this.stages.final?.scene.addChild(this.siteGraphics)
    }
  }

  private initCentroidGraphics() {
    if (getConfig().features.centroids) {
      if (!this.centroidGraphics) this.centroidGraphics = new GenericGraphics()
      this.centroidGraphics.scale.set(1)
      this.centroidGraphics.zIndex = 200
      this.stages.final?.scene.addChild(this.centroidGraphics)
    }
  }

  private initVisiblePointsGraphics() {
    if (getConfig().features.points) {
      if (!this.pointsGraphics) this.pointsGraphics = new GenericGraphics()
      this.pointsGraphics.scale.set(1)
      this.pointsGraphics.zIndex = 200
      this.stages.final?.scene.addChild(this.pointsGraphics)
    }
  }

  private initLineGraphics() {
    if (
      usingGeometricStyleStrategy() &&
      getConfig().visuals.mode === VISUALS_MODE.OUTLINE &&
      getConfig().visuals.outline?.mode === OUTLINE_MODE.LINE_STYLE
    ) {
      const lineStyles = this.initLineStyles()

      if (SHARED_LINE_GRAPHICS) {
        if (lineStyles && !RendererCell.lineGraphics) {
          RendererCell.lineGraphics = new SmoothGraphics()
          this.stages.baseMisc?.scene.addChild(RendererCell.lineGraphics)
        }

        if (!SHARED_LINE_STYLES && lineStyles?.length === 2 && !RendererCell.lineGraphics2) {
          RendererCell.lineGraphics2 = new SmoothGraphics()
          this.stages.baseMisc?.scene.addChild(RendererCell.lineGraphics2)
        }
      } else {
        if (lineStyles && !this.lineGraphics) {
          if (this.hasDisplacement()) {
            this.lineGraphics = new GenericGraphics()
            this.stages.baseDsp?.scene.addChild(this.lineGraphics)
          } else {
            this.lineGraphics = new SmoothGraphics()
            this.stages.baseMisc?.scene.addChild(this.lineGraphics)
          }
        }
      }
    }
  }

  private getLineGraphics() {
    if (SHARED_LINE_GRAPHICS) {
      return RendererCell.lineGraphics
    } else {
      return this.lineGraphics
    }
  }

  private initInteractivity() {
    if (this.isInteractive() || this.hasLink()) {
      this.interactiveGraphics = this.mainGraphics ?? this.mediaPostWrappersGraphics ?? this.lineGraphics

      if (!this.interactiveGraphics) return

      this.interactiveGraphics.zIndex = 300
      this.interactiveGraphics.interactive = true

      if (this.isInteractive()) {
        this.interactiveGraphics.on('pointermove', (e) => {
          if (this.isFocused) {
            handleEnginePointerEventThrottled(e.data.global, 'pointermove', this.getData())
            // console.log('pointermove', this.getCellId())
          }
        })

        this.interactiveGraphics.on('pointerover', (e) => {
          this.isFocused = true
          // console.log('pointerover', this.getCellId())
          // handleCellPointerMoveThrottled(e.data.global, this.getOriginalProps())

          if (getConfig().visuals.media?.tmpFilterFlag) {
            animate({
              from: this.mediaSprite?.filters?.[0].uniforms.hoverProgress,
              to: 0,
              ease: easeOut,
              duration: 750,
              onUpdate: (v) => {
                if (this.mediaSprite?.filters) {
                  this.mediaSprite.filters[0].uniforms.hoverProgress = v(this.mediaSprite.filters[2] as any).distance =
                    30 * ((v + 1) / 1) + 2
                }
              },
            })
          }
        })

        this.interactiveGraphics.on('pointerout', (e) => {
          // console.log('pointerout', this.getCellId())
          if (this.isFocused) {
            handleEnginePointerEventThrottled(e.data.global, 'pointerout')
            this.isFocused = false
            if (getConfig().visuals.media?.tmpFilterFlag) {
              animate({
                from: this.mediaSprite?.filters?.[0].uniforms.hoverProgress,
                to: -1,
                ease: easeOut,
                duration: 1500,
                onUpdate: (v) => {
                  if (this.mediaSprite?.filters) {
                    this.mediaSprite.filters[0].uniforms.hoverProgress = v(
                      this.mediaSprite.filters[2] as any
                    ).distance = 30 * ((v + 1) / 1) + 2
                  }
                },
              })
            }
          }
        })
      }

      if (this.getLinkProps()) {
        this.interactiveGraphics.buttonMode = true
        this.interactiveGraphics.on('pointerup', (e) => {
          if (this.isFocused) {
            const linkProps = this.getLinkProps()
            ;(linkProps as any).href && requestRouteChange((linkProps as any).href)
            ;(linkProps as any).onClick && (linkProps as any).onClick(e)
          }
        })
      } else if (this.isExpandable()) {
        this.interactiveGraphics.buttonMode = true
        this.interactiveGraphics.cursor = 'zoom-in'
        this.interactiveGraphics.on('pointerup', (e: any) => {
          if (this.isFocused && (getScrollData()?.speed ?? 0) <= 5) {
            this.setExpanded(!this.isExpanded)
            handleEnginePointerEvent(e.data.global, this.isExpanded ? 'expand' : 'shrink', this.getData())
          }
        })

        this.isScrollingUnsub = subIsScrolling((isScrolling) => {
          if (isScrolling && this.isExpanded) {
            this.setExpanded(false)
          }
        })
      }
    }
  }

  private setExpanded(expanded: boolean) {
    this.isExpanded = expanded
    setCellIsExpanded(this.isExpanded)
    if (this.interactiveGraphics) {
      this.interactiveGraphics.cursor = this.isExpanded ? 'zoom-out' : 'zoom-in'
    }
  }

  private initMedia() {
    if (!this.hasMedia() || !this.stages.mediaElements || !this.bbox) return

    const mediaProps = this.getMediaProps()
    if (usingGeometricStyleStrategy()) {
      this.stages.mediaPreWrappers?.scene && (this.mediaPreWrappersGraphics = new GenericGraphics())
      this.stages.mediaPostWrappers?.scene && (this.mediaPostWrappersGraphics = new SmoothGraphics())
      this.mediaMaskGraphics = this.mediaPreWrappersGraphics?.clone()
    }

    const getOrCreateTextureFromLoaderResource = (resource: LoaderResource) => {
      let texture = resource.texture

      if (!texture) {
        const btResource = resource.data as any
        btResource.autoplay = true
        btResource.loop = true
        btResource.muted = true

        texture = Texture.from(resource.data, {
          resourceOptions: {
            autoPlay: true,
            updateFPS: 24,
          },
        })
      }

      return texture
    }

    const createSprite = (texture: Texture) => {
      if (!texture?.valid) return
      this.mediaSprite = new Sprite(texture)
      this.mediaSprite.tint = getCurrentMaxBreakpointValue(getConfig().visuals.media?.tintColor) ?? 0xffffff
      this.mediaSprite.filters = getMediaElementsFilters()
      this.mediaSprite.alpha = 0

      animate({
        from: 0,
        to: 1,
        ease: easeIn,
        duration: Math.random() * 1000 + 1000,
        onUpdate: (v) => {
          this.mediaSprite && (this.mediaSprite.alpha += v)
        },
        driver: intervalAnimationDriver,
      })

      let scaleFactor = 1
      if (isOutlineLineStyleModeWithNoFill()) {
        if (getConfig().visuals.media?.scale) {
          scaleFactor = getCurrentMaxBreakpointValue(getConfig().visuals.media?.scale) ?? 1
        }
      }
      betterScaleToFill(this.mediaSprite, this.bbox, scaleFactor, getConfig().renderer.filterFixRTOffsetFactor ?? 0)

      this.mediaSpriteContainer = new Container()
      this.mediaSpriteContainer.addChild(this.mediaSprite)
      this.mediaMaskGraphics &&
        usingGeometricStyleStrategy() &&
        (this.mediaSpriteContainer.mask = this.mediaMaskGraphics)

      this.stages.mediaElements?.scene.addChild(this.mediaSpriteContainer)
    }

    const existingLoaderResource = getResourceByKey(mediaProps.src)

    if (existingLoaderResource) {
      createSprite(getOrCreateTextureFromLoaderResource(existingLoaderResource))
    } else {
      loadResourceUrl(mediaProps.src, (resource) => {
        if (this.isDestroyed || !resource) {
          return
        }

        createSprite(getOrCreateTextureFromLoaderResource(resource))
      })
    }

    if (getConfig().visuals.media?.tmpFilterFlag) {
      const sheetOscillationFilter = getNewSheetOscillationFilter()
      this.mediaPreWrappersGraphics &&
        (this.mediaPreWrappersGraphics.filters = [
          sheetOscillationFilter,
          new DropShadowFilter({
            rotation: 90,
            color: 0x1a1a1e,
            alpha: 0.3,
            distance: 5,
            pixelSize: 0.5,
            quality: 1,
            resolution: 0.5 * getDevicePixelRatio(),
          }),
        ])
    }

    this.mediaMaskGraphics && this.stages.mediaPreWrappers?.scene.addChild(this.mediaMaskGraphics)
    this.mediaPreWrappersGraphics &&
      isLargeBreakpoint() &&
      this.stages.mediaPreWrappers?.scene.addChild(this.mediaPreWrappersGraphics)
    this.mediaPostWrappersGraphics && this.stages.mediaPostWrappers?.scene.addChild(this.mediaPostWrappersGraphics)
  }

  public getData = () => this.data

  private processData() {
    const data = this.getData()
    if (!data) return

    if (usingGeometricStyleStrategy() && !isOutlineLineStyleModeWithNoFill()) {
      if (hasGeometricRendererScaling()) {
        this.scale = Math.max(
          Math.min(
            Math.max(this.bbox.height, this.bbox.width) /
              (Math.max(this.bbox.height, this.bbox.width) + getConfig().baseCellMargin),
            1
          ),
          0
        )
        this.mainGraphics?.scale.set(this.scale)
      }
    }

    const {
      sitePoint,
      centroidPoint,
      bbox,
      labelCentroidPoint,
      originalPoints,
      absolutePoints,
      relativePoints,
      absoluteMediaPoints,
      relativeMediaPoints,
      linePolyInstructions,
      mainPolyInstructions,
      mediaPolyInstructions,
    } = getCellManipulationData(data)

    this.originalPoints = originalPoints
    this.absolutePoints = absolutePoints
    this.relativePoints = relativePoints
    this.absoluteMediaPoints = absoluteMediaPoints
    this.relativeMediaPoints = relativeMediaPoints
    this.sitePoint = sitePoint
    this.centroidPoint = centroidPoint
    this.labelCentroidPoint = labelCentroidPoint
    this.bbox = bbox
    this.linePolyInstructions = linePolyInstructions
    this.mainPolyInstructions = mainPolyInstructions
    this.mediaPolyInstructions = mediaPolyInstructions

    if (usesRelativePoints()) {
      this.applyCentroid()
    } else {
      this.mainGraphics?.position.set(this.centroidPoint?.x, this.centroidPoint?.y)

      if (this.decoSprite) {
        this.decoSprite.position.set(
          (this.centroidPoint?.x ?? 0) - this.decoSprite.width / 2,
          (this.centroidPoint?.y ?? 0) - this.decoSprite.height / 2
        )
      }
    }
  }

  private processMediaData() {
    if (this.hasMedia() && this.bbox) {
      let scaleFactor = 1
      if (isOutlineLineStyleModeWithNoFill()) {
        if (getConfig().visuals.media?.scale) {
          scaleFactor = getCurrentMaxBreakpointValue(getConfig().visuals.media?.scale) ?? 1
          this.mediaMaskGraphics?.scale.set(scaleFactor)
          this.mediaPreWrappersGraphics?.scale.set(scaleFactor)
          this.mediaPostWrappersGraphics?.scale.set(scaleFactor)
        }
      }
      this.mediaSprite &&
        betterScaleToFill(this.mediaSprite, this.bbox, scaleFactor, getConfig().renderer.filterFixRTOffsetFactor ?? 0)
    }
  }

  public static preDrawShared() {
    RendererCell.lineGraphics?.clear()
    RendererCell.lineGraphics2?.clear()
  }

  public static postDrawShared() {
    RendererCell.lineGraphics?.closePath()
  }

  public draw() {
    if (this.isDestroyed || !this.isVisible) return

    this.processData()
    this.processMediaData()

    const points = usesRelativePoints() ? this.relativePoints : this.absolutePoints

    if (points.length < 3) {
      this.clearAll()
      return
    }

    if ((this.isInteractive() || this.hasLink()) && this.interactiveGraphics) {
      this.interactiveGraphics.hitArea = new Polygon(...this.relativePoints)
    }

    this.setGraphicsStyles()

    if (usingBlurStrategy()) {
      this.mainGraphics?.drawPolygon(points)
    } else {
      if (usingLineJoinStrategy()) {
        this.mainGraphics?.drawPolygon(points)
      } else if (usingGeometryStrategy()) {
        this.mainPolyInstructions && drawCustomPolyInstructions(this.mainPolyInstructions, this.mainGraphics)

        if (this.getLineGraphics()) {
          if (isLargeBreakpoint() && this.linePolyInstructions) {
            drawCustomPolyInstructionsWithLineStyles(this.linePolyInstructions, this.getLineGraphics(), this.lineStyles)
          } else {
            if (this.linePolyInstructions && SHARED_LINE_GRAPHICS && !SHARED_LINE_STYLES) {
              let style = this.lineStyles?.[0]
              let graphics = RendererCell.lineGraphics as Graphics
              if (style && graphics) {
                graphics?.lineStyle({
                  alignment: getCurrentMaxBreakpointValue(style.alignment) ?? 0.5,
                  width: getCurrentMaxBreakpointValue(style.width),
                  color: getCurrentMaxBreakpointValue(style.color),
                  join: LINE_JOIN.ROUND,
                  cap: LINE_CAP.ROUND,

                  alpha: style.alpha ?? 1,
                  native: !!style.native,
                })
                graphics.drawPolygon(points)
              }

              style = this.lineStyles?.[1]
              graphics = RendererCell.lineGraphics2 as Graphics
              if (style && graphics) {
                drawCustomPolyInstructionsWithLineStyles(this.linePolyInstructions, graphics, [style])
              }
            } else {
              this.lineStyles?.forEach((style, index) => {
                ;(this.getLineGraphics() as Graphics)?.lineStyle({
                  alignment: getCurrentMaxBreakpointValue(style.alignment) ?? 0.5,
                  width: getCurrentMaxBreakpointValue(style.width),
                  color: getCurrentMaxBreakpointValue(style.color),
                  join: LINE_JOIN.ROUND,
                  cap: LINE_CAP.ROUND,

                  alpha: style.alpha ?? 1,
                  native: !!style.native,
                })
                this.getLineGraphics()?.drawPolygon(points)
              })
            }
          }
        }

        if (this.mediaPolyInstructions) {
          drawCustomPolyInstructions(this.mediaPolyInstructions, [
            this.mediaPreWrappersGraphics,
            this.mediaPostWrappersGraphics,
          ])
        } else {
          ;[this.mediaPreWrappersGraphics, this.mediaPostWrappersGraphics].forEach((graphics) => {
            graphics?.drawPolygon(usesRelativePoints() ? this.relativeMediaPoints : this.absoluteMediaPoints)
          })
        }

        if (this.getCustomConfig()?.fillStyles) {
          this.mainGraphics?.drawPolygon(this.relativePoints)
        }
      }
    }

    if (this.siteGraphics && this.sitePoint) {
      this.siteGraphics.drawCircle(this.sitePoint.x, this.sitePoint.y, 10)
    }

    if (this.centroidGraphics && this.centroidPoint) {
      this.centroidGraphics.drawCircle(this.centroidPoint.x, this.centroidPoint.y, 10)
    }

    this.closeGraphicsStyles()
  }

  private setGraphicsStyles() {
    this.clearAll()

    if (this.mainGraphics) {
      if (!isOutlineLineStyleModeWithNoFill()) {
        if (getConfig().visuals.fillColor || this.hasMedia()) {
          this.mainGraphics.beginFill(0x000000)
        }
        // }
      } else {
        if (this.hasCustomConfig()) {
          const { fillColor, outlineColor } = this.getCustomConfig().fillStyles || {}
          fillColor && this.mainGraphics.beginFill(fillColor)

          outlineColor &&
            (this.mainGraphics as Graphics).lineStyle({
              width: getConfig().baseCellMargin,
              color: outlineColor,
              join: LINE_JOIN.ROUND,
              cap: LINE_CAP.ROUND,
              alignment: 1,
            })
        }
      }

      if (getConfig().manipulation.strategy === MANIPULATION_STRATEGY.BLUR) {
        ;(this.mainGraphics as Graphics).lineStyle(getCellMargin(), 0xffffff, 1, 1, false)
      } else {
        if (getConfig().manipulation.strategy === MANIPULATION_STRATEGY.LINE_JOIN) {
          ;(this.mainGraphics as Graphics).lineStyle({
            width: getConfig().baseCellMargin * 5,
            color: 0x000000,
            join: LINE_JOIN.ROUND,
            cap: LINE_CAP.ROUND,
          })
        }
      }
    }

    const mPWWidth = getCurrentMaxBreakpointValue(getConfig().visuals.media?.outline?.width)
    const mPWColor = getCurrentMaxBreakpointValue(getConfig().visuals.media?.outline?.color) || 0x000000
    mPWWidth &&
      (this.mediaPreWrappersGraphics as Graphics)?.lineStyle({
        alignment: getCurrentMaxBreakpointValue(getConfig().visuals.media?.outline?.alignment) ?? 0.5,
        width: mPWWidth,
        color: mPWColor,
        join: LINE_JOIN.ROUND,
        cap: LINE_CAP.ROUND,
      })

    this.mediaPreWrappersGraphics?.beginFill(mPWColor)
    ;[this.mediaPostWrappersGraphics].forEach((graphics: SmoothGraphics | Graphics | undefined) =>
      (graphics as Graphics)?.lineStyle({
        width: (getCurrentMaxBreakpointValue(getConfig().visuals.media?.outline?.width) || 15) + 1,
        color: getCurrentMaxBreakpointValue(getConfig().visuals.media?.outline?.color) || 0x000000,
        join: LINE_JOIN.ROUND,
        cap: LINE_CAP.ROUND,
      })
    )

    this.siteGraphics?.beginFill(0xff0000)

    this.centroidGraphics?.beginFill(0x00ff00)

    this.pointsGraphics?.beginFill(0xff0000)
  }

  private closeGraphicsStyles() {
    this.mainGraphics?.endFill()
    this.mediaPreWrappersGraphics?.endFill()
    this.siteGraphics?.endFill()
    this.centroidGraphics?.endFill()
    this.pointsGraphics?.endFill()
  }

  public update(cellData: EngineCellData) {
    this.data = cellData
  }

  public clearAll() {
    if (this.getCustomConfig()?.fillStyles) {
      this.mainGraphics?.clear()
    }
    this.mediaPreWrappersGraphics?.clear()
    this.mediaPostWrappersGraphics?.clear()
    this.siteGraphics?.clear()
    this.centroidGraphics?.clear()
    this.pointsGraphics?.clear()
    this.lineGraphics?.clear()
  }

  public destroy(options = { children: true /*texture: true, baseTexture: true*/ }) {
    this.isScrollingUnsub?.()

    if (this.mainGraphics) {
      ;(this.hasDisplacement() ? this.stages.baseDsp : this.stages.base)?.scene.removeChild(this.mainGraphics)
      this.mainGraphics.destroy(options)
    }

    if (this.lineGraphics) {
      ;(this.hasDisplacement() ? this.stages.baseDsp : this.stages.base)?.scene.removeChild(this.lineGraphics)
      this.lineGraphics.destroy(options)
    }

    if (this.mediaSpriteContainer) {
      this.stages.mediaElements?.scene.removeChild(this.mediaSpriteContainer)
      this.mediaSpriteContainer.destroy(options)
    } else if (this.mediaSprite) {
      this.stages.mediaElements?.scene.removeChild(this.mediaSprite)
      this.mediaSprite.destroy(options)
    }

    if (this.mediaPostWrappersGraphics) {
      this.stages.mediaPostWrappers?.scene.removeChild(this.mediaPostWrappersGraphics)
      this.mediaPostWrappersGraphics.destroy(options)
    }

    if (this.mediaMaskGraphics) {
      this.stages.mediaPreWrappers?.scene.removeChild(this.mediaMaskGraphics)
      this.mediaMaskGraphics.destroy(options)
    }

    if (this.mediaPreWrappersGraphics) {
      this.stages.mediaPreWrappers?.scene.removeChild(this.mediaPreWrappersGraphics)
      this.mediaPreWrappersGraphics.destroy(options)
    }

    if (this.pointsGraphics) {
      this.stages.final?.scene.removeChild(this.pointsGraphics)
      this.pointsGraphics.destroy(options)
    }

    if (this.centroidGraphics) {
      this.stages.final?.scene.removeChild(this.centroidGraphics)
      this.centroidGraphics.destroy(options)
    }

    if (this.siteGraphics) {
      this.stages.final?.scene.removeChild(this.siteGraphics)
      this.siteGraphics.destroy(options)
    }

    if (this.decoSprite) {
      this.stages.baseDeco2?.scene.removeChild(this.decoSprite)
      this.decoSprite.destroy(options)
    }

    this.isDestroyed = true
  }

  public hide() {
    this.clearAll()
    this.setVisibility(false)
  }
  public show() {
    this.setVisibility(true)
  }

  public setVisibility(visibility: boolean) {
    if (!visibility && this.isExpanded) {
      this.setExpanded(false)
    }
    if (this.isVisible === visibility) return

    if (this.getOriginalProps()?.hasDisplacement) {
      if (visibility) {
        addVisibleCellKeyWithDisplacement(this.getCellId())
      } else {
        removeVisibleCellKeyWithDisplacement(this.getCellId())
      }
    }

    if (this.mainGraphics) {
      this.mainGraphics.visible = visibility
    }

    if (this.lineGraphics) {
      this.lineGraphics.visible = visibility
    }

    if (this.mediaSpriteContainer) {
      this.mediaSpriteContainer.visible = visibility
    } else if (this.mediaSprite) {
      this.mediaSprite.visible = visibility
    }

    if (this.mediaPostWrappersGraphics) {
      this.mediaPostWrappersGraphics.visible = visibility
    }

    if (this.mediaMaskGraphics) {
      this.mediaMaskGraphics.visible = visibility
    }

    if (this.mediaPreWrappersGraphics) {
      this.mediaPreWrappersGraphics.visible = visibility
    }

    if (this.pointsGraphics) {
      this.pointsGraphics.visible = visibility
    }

    if (this.centroidGraphics) {
      this.centroidGraphics.visible = visibility
    }

    if (this.siteGraphics) {
      this.siteGraphics.visible = visibility
    }

    if (this.decoSprite) {
      this.decoSprite.visible = visibility
    }

    this.isVisible = visibility
  }

  public getOriginalObjectData() {
    return this.data?.site?.originalObject?.data
  }

  public getOriginalData() {
    return this.getOriginalObjectData()?.originalData
  }

  public getOriginalProps() {
    return this.getOriginalData()?.props as EngineCellComponentProps
  }

  public getMediaProps() {
    return this.getOriginalProps()?.mediaProps
  }

  public hasMedia() {
    return getConfig().features.media && !!this.getMediaProps()
  }

  public hasDisplacement() {
    return this.getOriginalProps()?.hasDisplacement
  }

  public getCustomConfig() {
    return this.getOriginalProps()?.rendererConfig
  }

  public hasCustomConfig() {
    return !!this.getCustomConfig()
  }

  public getCellId() {
    return this.getOriginalProps()?.cellId
  }

  public getLinkProps() {
    const props = this.getOriginalProps() as LinkCellProps
    return props?.linkProps || props?.href || props?.onClick
      ? {
          ...props?.linkProps,
          ...(props?.href ? { href: props.href } : {}),
          ...(props?.onClick ? { href: props.onClick } : {}),
        }
      : false
  }

  public hasLabelCentroid() {
    return getConfig().features.labelCentroid && this.getOriginalProps().hasLabelCentroid
  }

  public hasLink() {
    return !!this.getLinkProps()
  }

  public isInteractive() {
    if (!hasPointerInteractions() || getConfig().pointerInteractions?.mode !== POINTER_INTERACTIONS_MODE.RENDERER)
      return false

    const isInteractive = this.getOriginalProps()?.isInteractive
    return !!(
      isInteractive ||
      ((getConfig().pointerInteractions?.cellDefaultInteractivityEnabled ||
        (getConfig().pointerInteractions?.mediaCellDefaultInteractivityEnabled && this.hasMedia())) &&
        isInteractive !== false)
    )
  }

  public isExpandable() {
    const isExpandable = this.getOriginalProps()?.isExpandable

    return (
      !this.hasLink() &&
      !!(
        this.isInteractive() &&
        (isExpandable ||
          (this.hasMedia() &&
            getConfig().pointerInteractions?.mediaCellDefaultExpansionEnabled &&
            isExpandable !== false))
      )
    )
  }

  private applyCentroid() {
    ;[
      this.mainGraphics,
      this.getLineGraphics(),
      this.pointsGraphics,
      this.mediaMaskGraphics,
      this.mediaPreWrappersGraphics,
      this.mediaPostWrappersGraphics,
    ].forEach((displayObject) => displayObject?.position.set(this.centroidPoint?.x, this.centroidPoint?.y))

    if (this.decoSprite) {
      this.decoSprite.position.set(
        (this.centroidPoint?.x ?? 0) - this.decoSprite.width / 2,
        (this.centroidPoint?.y ?? 0) - this.decoSprite.height / 2
      )
    }
  }
}
