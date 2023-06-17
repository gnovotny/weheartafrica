import { MutableRefObject, useCallback, useEffect, useRef } from 'react'

import { Filter } from '@pixi/core'

import { EngineRendererStages } from '@lib/engine/renderer/types'
import getConfig from '@lib/engine/settings'
import { lerpDegrees } from '@lib/engine/utils/lerp'

/* testing automatic shadow rotation */
// let rotation = 0
// setTimeout(() => {
//   const controls = animate(rotation, 360, {
//     repeatType: 'loop',
//     repeat: Infinity,
//     type: 'tween',
//     duration: 5,
//     onUpdate: (v) => {
//       stagesRef.current.final.scene.filters[0].rotation = v
//       stagesRef.current.final.scene.filters[1].rotation = v
//     },
//     onComplete: () => {
//     },
//   })
// }, 5000)

export const useDynamicShadowsProcessor = ({
  stagesRef,
}: {
  stagesRef: MutableRefObject<EngineRendererStages>
}): { renderShadows: () => void } => {
  const angleRef = useRef<number>(45)

  useEffect(() => {
    if (!getConfig().visuals.shadow?.dynamic) return

    const getMouse = (e: any) => {
      const mouse = {
        x: e.clientX || e.pageX || e.touches[0].pageX || 0 || window.innerWidth / 2,
        y: e.clientY || e.pageX || e.touches[0].pageY || 0 || window.innerHeight / 2,
      }

      // inset vs outset
      /*
        shadowMoveRef.current.x = (window.innerWidth / 2 - mouse.x) / 100
      shadowMoveRef.current.y = (window.innerHeight / 2 - mouse.y) / 100
        finalSceneRef.current.filters[0].distance = shadowMoveRef.current.x
        finalSceneRef.current.filters[1].distance = -shadowMoveRef.current.x*/

      const boxCenter = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      }
      const radians = Math.atan2(mouse.x - boxCenter.x, -(mouse.y - boxCenter.y))
      angleRef.current = radians * (180 / Math.PI) * -1
      // angleRef.current = angleRef.current < 0 ? angleRef.current + 360 : angleRef.current
    }
    ;['mousemove', 'touchstart', 'touchmove'].forEach((e) => {
      window.addEventListener(e, getMouse)
    })

    return () =>
      ['mousemove', 'touchstart', 'touchmove'].forEach((e) => {
        window.removeEventListener(e, getMouse)
      })
  }, [])

  const renderShadows = useCallback(() => {
    if (getConfig().visuals.mode === 'shadow' && getConfig().visuals.shadow?.dynamic && stagesRef.current.thirdBlur)
      stagesRef.current.thirdBlur.scene.filters
        ?.filter((filter: Filter) => filter.constructor.name === 'DropShadowFilter')
        .forEach((filter: any) => (filter.rotation = lerpDegrees(filter.rotation, angleRef.current, 0.05)))
  }, [stagesRef])

  return {
    renderShadows,
  }
}
