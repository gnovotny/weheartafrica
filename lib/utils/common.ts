export const isWorker = typeof self !== 'undefined' && (self as any).DedicatedWorkerGlobalScope !== undefined
export const isClient = !isWorker && typeof window !== 'undefined'
export const isServer = !isWorker && typeof window === 'undefined'

export const isAnalyzing = process.env.ANALYZE === 'true'
export const isDev = process.env.NODE_ENV === 'development'
export const isProd = process.env.NODE_ENV === 'production'
