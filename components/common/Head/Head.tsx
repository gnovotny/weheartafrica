import { FC } from 'react'

import NextHead from 'next/head'
import Script from 'next/script'
import { DefaultSeo } from 'next-seo'

import config from '@config/seo.json'
import { G_ID } from '@lib/gtm'
import { isDev } from '@lib/utils/common'

const Head: FC = () => {
  return (
    <>
      <DefaultSeo {...config} />
      <NextHead>
        <meta
          name='viewport'
          content='width=device-width, initial-scale=1'
        />
        <link
          rel='manifest'
          href='/site.webmanifest'
          key='siteGraphics-manifest'
        />
      </NextHead>
      {!isDev && (
        <>
          <Script
            id='gtag'
            src={`https://www.googletagmanager.com/gtag/js?id=${G_ID}`}
            strategy='afterInteractive'
          />
          <Script
            id='gtag_init'
            strategy='afterInteractive'
            dangerouslySetInnerHTML={{
              __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${G_ID}');
            `,
            }}
          />
        </>
      )}
    </>
  )
}

export default Head
