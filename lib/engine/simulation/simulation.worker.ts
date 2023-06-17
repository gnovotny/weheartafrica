import { EngineInterpolationMetadata } from '@lib/engine/types'

import { EngineSimulator } from './EngineSimulator'

const ctx: Worker = self as unknown as Worker

async function setInterpolated(interpolated: EngineInterpolationMetadata) {
  ctx.postMessage({
    type: 'setInterpolated',
    args: { interpolated },
  })
}

const simulator = new EngineSimulator({
  handleSetInterpolated: setInterpolated,
})

ctx.addEventListener('message', ({ data: { type, args = {} } }) => {
  switch (type) {
    case 'handleScrollData':
      simulator.handleScrollData(args)
      break
    case 'setDimensions':
      simulator.setDimensions(args.dimensions)
      break
    case 'setCellBlueprints':
      simulator.setCellBlueprints(args.cellBlueprints)
      break
    case 'simulateAndTweenNextBlueprints':
      simulator.simulateAndTweenNextBlueprints()
      break
    case 'simulateCurrentBlueprints':
      simulator.simulateCurrentBlueprints()
      break
    case 'interpolateScrollTweensCurrentProgress':
      simulator.interpolateScrollTweensCurrentProgress()
      break
    case 'interpolateScrollTweens':
      simulator.interpolateScrollTweens()
      break

    case 'simulatePointerInteraction':
      simulator.simulatePointerInteraction(args.pointer)
      break
    case 'simulateResizeInteraction':
      simulator.simulateResizeInteraction()
      break
  }
})
