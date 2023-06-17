import defaultConfig from '@config/engine'
import { EngineConfig } from '@lib/engine/settings/types'

export * from './utils'

const cloneConfig = (defaultConfig: EngineConfig) => JSON.parse(JSON.stringify(defaultConfig))
let config = cloneConfig(defaultConfig)

export function setConfig(source: Partial<EngineConfig> | undefined, reset = true) {
  const target = reset ? (config = cloneConfig(defaultConfig)) : config
  return mergeConfig(source, target)
}
export function mergeConfig(source: any = {}, target = config) {
  for (const [key, val] of Object.entries(source)) {
    if (val !== null && typeof val === `object`) {
      if (target[key] === undefined) {
        target[key] = new (val as any).__proto__.constructor()
      }
      mergeConfig(val, target[key])
    } else {
      target[key] = val
    }
  }
  return target
}

export function getConfig(): EngineConfig {
  return config
}

export default getConfig
