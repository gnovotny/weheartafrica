import getConfig from '@lib/engine/settings'
import { usingRafOnly } from '@lib/engine/settings/utils'
import { EngineSimulator } from '@lib/engine/simulation/EngineSimulator'
import { EngineCellBlueprint, EngineDimensions } from '@lib/engine/types'

import {
  getCurrentPointer,
  getDimensions,
  pubRafAnimationCompleted,
  ScrollData,
  setInterpolated,
  subDimensions,
} from '../../state'

const handleAnimationComplete = () => usingRafOnly() && pubRafAnimationCompleted(performance.now())

export class EngineSimulatorManager {
  simulator: EngineSimulator | undefined
  worker: Worker | undefined

  constructor() {
    if (getConfig().simulation.webWorker && typeof Worker !== 'undefined') {
      this.initWorker()
    } else {
      this.simulator = new EngineSimulator({
        handleSetInterpolated: setInterpolated,
        handleAnimationComplete: handleAnimationComplete,
      })
    }

    this.setDimensions(getDimensions())
    subDimensions((dimensions) => this.setDimensions(dimensions))
  }

  setDimensions(dimensions: EngineDimensions) {
    if (this.worker) {
      this.worker.postMessage({ type: 'setDimensions', args: { dimensions } })
    } else if (this.simulator) {
      this.simulator.setDimensions(dimensions)
    }
  }

  initWorker() {
    // From https://webpack.js.org/guides/web-workers/#syntax
    this.worker = new Worker(new URL('./simulation.worker.ts', import.meta.url))

    this.worker.addEventListener('message', (evt) => {
      switch (evt.data.type) {
        case 'setInterpolated':
          setInterpolated(evt.data.args.interpolated)
          break
      }
    })
  }

  setCellBlueprints(cellBlueprints: EngineCellBlueprint[]) {
    if (this.worker) {
      this.worker.postMessage({ type: 'setCellBlueprints', args: { cellBlueprints } })
    } else if (this.simulator) {
      this.simulator.setCellBlueprints(cellBlueprints)
    }
  }

  simulateAndTweenNextBlueprints() {
    if (this.worker) {
      this.worker.postMessage({ type: 'simulateAndTweenNextBlueprints' })
    } else if (this.simulator) {
      this.simulator.simulateAndTweenNextBlueprints()
    }
  }

  simulateCurrentBlueprints() {
    if (this.worker) {
      this.worker.postMessage({ type: 'simulateCurrentBlueprints' })
    } else if (this.simulator) {
      this.simulator.simulateCurrentBlueprints()
    }
  }

  interpolateScrollTweensCurrentProgress() {
    if (this.worker) {
      this.worker.postMessage({ type: 'interpolateScrollTweensCurrentProgress' })
    } else if (this.simulator) {
      this.simulator.interpolateScrollTweensCurrentProgress()
    }
  }

  interpolateScrollTweens(scrollProgress: number) {
    if (this.worker) {
      this.worker.postMessage({ type: 'interpolateScrollTweens', args: { scrollProgress } })
    } else if (this.simulator) {
      this.simulator.interpolateScrollTweens(scrollProgress)
    }
  }

  simulatePointerInteraction() {
    const pointer = getCurrentPointer()
    if (!pointer) return

    if (this.worker) {
      this.worker.postMessage({ type: 'simulatePointerInteraction', args: { pointer } })
    } else if (this.simulator) {
      this.simulator.simulatePointerInteraction(pointer)
    }
  }

  simulateResizeInteraction() {
    if (this.worker) {
      this.worker.postMessage({ type: 'simulateResizeInteraction' })
    } else if (this.simulator) {
      this.simulator.simulateResizeInteraction()
    }
  }

  handleScrollData(scrollData: ScrollData) {
    if (this.worker) {
      this.worker.postMessage({ type: 'handleScrollData', args: scrollData })
    } else if (this.simulator) {
      this.simulator.handleScrollData(scrollData)
    }
  }

  setIsScrolling(isScrolling: boolean) {
    if (this.worker) {
      this.worker.postMessage({ type: 'setIsScrolling', args: { isScrolling: isScrolling } })
    } else if (this.simulator) {
      this.simulator.setIsScrolling(isScrolling)
    }
  }
}
