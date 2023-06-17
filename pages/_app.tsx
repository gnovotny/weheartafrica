import { useEffect, useRef } from 'react'

import { Provider } from 'jotai'
import type { AppProps } from 'next/app'

import { Head } from '@components/common'
import EngineLayout from '@components/engine/EngineLayout'
import { getPageTransitionDuration, setConfig } from '@lib/engine/settings'
import { EngineNextPage } from '@lib/engine/types'
import { store } from '@lib/store'
import { closeMenu, setPageIsTransitioning, setRouterPathname, setRouterPreviousPathname } from 'lib/state'

import '@lib/wdyr/wdyr'
import '@styles/main.css'

export default function VoronoiApp({ Component, pageProps, router }: AppProps) {
  const VoronoiPage = Component as EngineNextPage
  const cells = VoronoiPage?.cells

  setConfig(VoronoiPage.config)
  setRouterPathname(router.pathname)

  const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>()

  useEffect(() => {
    document.body.classList?.remove('loading')

    router.events.on('routeChangeStart', (newPathname) => {
      setRouterPreviousPathname(router.pathname)
      setRouterPathname(newPathname)

      transitionTimeoutRef.current && clearTimeout(transitionTimeoutRef.current)
    })

    router.events.on('routeChangeComplete', (newPathname) => {
      setRouterPreviousPathname(undefined)

      transitionTimeoutRef.current && clearTimeout(transitionTimeoutRef.current)
      setPageIsTransitioning(true)
      transitionTimeoutRef.current = setTimeout(() => setPageIsTransitioning(false), getPageTransitionDuration())

      closeMenu()
    })
  }, [])

  return (
    <>
      <Head />
      <Provider unstable_createStore={() => store}>
        <EngineLayout
          pageProps={pageProps}
          cells={cells}
        >
          <VoronoiPage {...pageProps} />
        </EngineLayout>
      </Provider>
    </>
  )
}
