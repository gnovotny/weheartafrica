import React from 'react'

import dynamic from 'next/dynamic'

export const DynamicRendererWrapper = dynamic(
  async () => {
    const Renderer = (await import('./Renderer')).default
    // eslint-disable-next-line react/display-name
    return ({ forwardedRef, ...props }: any) => (
      <Renderer
        ref={forwardedRef}
        {...props}
      />
    )
  },
  { ssr: false }
)
