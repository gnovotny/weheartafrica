import { MutableRefObject, useCallback, useRef } from 'react'

import { Texture } from '@pixi/core'
import { Container } from '@pixi/display'
import { Sprite } from '@pixi/sprite'

import { EngineRendererStages } from '@lib/engine/renderer/types'
import getConfig from '@lib/engine/settings'
import lerp from '@lib/engine/utils/lerp'
import { store } from '@lib/store'
import { isSmallBreakpoint } from '@lib/utils/bph'
import { getDimensions, scrollDataAtom } from 'lib/state'

export const useClippedLogoProcessor = (): {
  initLogo: (stagesRef: MutableRefObject<EngineRendererStages>) => void
  renderLogo: () => void
} => {
  const logoSpriteRef = useRef<Sprite>()
  const logoContainerRef = useRef<Container>()

  const initLogo = useCallback((stagesRef: MutableRefObject<any>) => {
    const logoUrl = getConfig().experimental?.customClipLogoUrl
    if (!logoUrl) return
    const [width, height] = getDimensions()
    logoSpriteRef.current = new Sprite(Texture.from(logoUrl))
    logoSpriteRef.current.x = logoSpriteRef.current.y = getConfig().baseCellMargin * (isSmallBreakpoint() ? 1 : 2)
    logoSpriteRef.current.width = logoSpriteRef.current.height = Math.min(width / 4, 100)
    logoSpriteRef.current.width = logoSpriteRef.current.width > 200 ? 200 : logoSpriteRef.current.width
    logoSpriteRef.current.height = logoSpriteRef.current.height > 200 ? 200 : logoSpriteRef.current.height
    logoSpriteRef.current.tint = 0x464646

    // const lines = new SmoothGraphics()
    //
    // lines
    //   .lineStyle({
    //     width: 20,
    //     color: 0x666666,
    //     alignment: 1,
    //     alpha: 0.5,
    //     join: LINE_JOIN.ROUND,
    //     cap: LINE_CAP.ROUND,
    //     miterLimit: 198,
    //   })
    //
    //   .drawPolygon([new Point(50 + 0 * 200, 100), new Point(150 + 0 * 200, 100), new Point(100 + 0 * 200, 200)])

    logoContainerRef.current = new Container()
    // logoContainerRef.current.x =
    //   logoContainerRef.current.y =
    //   logoContainerRef.current.pivot.x =
    //   logoContainerRef.current.pivot.y =
    //     logoSpriteRef.current.width / 2
    logoContainerRef.current.addChild(logoSpriteRef.current)
    // logoContainerRef.current.addChild(lines)

    logoContainerRef.current.scale.set(1)
    // stagesRef.current.maskFinal.scene.addChild(logoContainerRef.current)
    stagesRef.current.final.scene.addChild(logoContainerRef.current)
  }, [])

  const renderLogo = useCallback(() => {
    const interpolation = store.get(scrollDataAtom) as number

    const relativeValue = Math.min(1, interpolation * (1 / 0.2))

    if (getConfig().customClipLogo && logoContainerRef.current) {
      logoContainerRef.current.scale.set(
        // lerp(logoContainerRef.current.scale.x, 1 - relativeValue, 0.1)
        lerp(logoContainerRef.current.scale.x, 1 - (relativeValue > 0.6 ? 1 : relativeValue), 0.1)
        // lerp(logoContainerRef.current.scale.x, 1 - (interpolation > 0.4 ? 1 : interpolation), 0.1)
      )
    }
  }, [])

  return {
    initLogo,
    renderLogo,
  }
}
