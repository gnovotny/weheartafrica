import React from 'react'

import { NextSeo } from 'next-seo'

import Cell from '@components/cells/Cell'
import LinkCell from '@components/cells/Link'
import { Text } from '@components/ui'
import { EngineNextPage } from '@lib/engine/types'

const Page2: EngineNextPage = () => (
  <>
    <NextSeo title='Page2' />
  </>
)

Page2.cells = [
  <Cell
    cellId='gulugufe'
    key='gulugufe'
    mediaProps={{
      src: 'https://prismic-io.s3.amazonaws.com/weheartafrica/493ee97a-15fc-498a-b8e2-40eb5a1b82fd_pexels-taryn-elliott-3326781-960x540-24fps.mp4',
    }}
    isFloating
    isInteractive
    state={[
      {
        base: {
          weight: 3,
          col: 9,
          row: 4,
        },
      },
      {
        base: {
          weight: 1,
          col: 11,
          row: 1,
        },
      },
    ]}
  />,
  <Cell
    cellId='gulugufe-swimming'
    key='gulugufe-swimming'
    mediaProps={{
      src: 'https://prismic-io.s3.amazonaws.com/weheartafrica/d385a6a4-a1ea-4c38-a546-c0162438b6ed_pexels-agnieszka-taggart-17154494-960x540-30fps.mp4',
    }}
    isFloating
    isInteractive
    state={[
      {
        base: {
          weight: 2,
          col: 1,
          row: 1,
        },
      },
      {
        base: {
          weight: 1,
          col: 1,
          row: 1,
        },
      },
    ]}
  />,
  <Cell
    cellId='kids-looking-at-cam'
    key='kids-looking-at-cam'
    mediaProps={{
      src: 'https://images.prismic.io/weheartafrica/d1730403-3426-4953-8592-00cca339d962_pexels-antony-trivet-6056379+%281%29.jpg?auto=compress,format',
    }}
    isFloating
    isInteractive
    state={[
      {
        base: {
          weight: 2,
          col: 6,
          row: 1,
        },
      },
      undefined,
    ]}
  />,
  <Cell
    cellId='gulugufe-hero'
    key='gulugufe-hero'
    state={[
      {
        base: {
          weight: 3,
          col: 2,
          row: 8,
        },
      },
      {
        base: {
          weight: 1,
          col: 6,
          row: 3,
        },
      },
    ]}
  >
    <div className='flex flex-col items-center justify-center w-full h-full max-w-[10rem] md:max-w-sm lg:max-w-sm max-h-md gap-2'>
      <Text variant='customMultiPartHeading'>
        <span className='wide'>Pa</span>
        <span className='narrow'>ge2</span>
      </Text>
      <Text
        variant='bodyBoldLg'
        className='text-left'
      >
        Hinc redeundum est ad oram atque Phoenicen. fuit oppidum Crocodilon, est flumen. memoria urbium Dorum,
        Sycaminum. promunturium Carmelum et in monte oppidum eodem nomine, quondam Acbatana dictum. iuxta Getta, Geba,
        rivus Pacida sive Belus, vitri fertiles harenas parvo litori
      </Text>
    </div>
  </Cell>,
  <Cell
    cellId='gulugufe-intro'
    key='gulugufe-intro'
    state={[
      undefined,
      {
        base: {
          weight: 3,
          col: 6,
          row: 6,
        },
      },
      {
        base: {
          weight: 2,
          col: 1,
          row: 3,
        },
      },
    ]}
  >
    <div className='flex flex-col items-center justify-center w-full h-full max-w-[80%] md:max-w-xl lg:max-w-3xl max-h-md gap-4'>
      <Text variant='bodyBoldLg'>
        Tyros, quondam insula praealto mari DCC passibus divisa, nunc vero Alexandri oppugnantis operibus continens;
        olim partu clara, urbibus genitis Lepti, Utica et illa aemula terrarumque orbis avida Carthagine, etiam Gadibus
        extra orbem conditis: nunc omnis eius nobilitas
      </Text>
    </div>
  </Cell>,
  <Cell
    cellId='gulugufe-driving'
    key='gulugufe-driving'
    mediaProps={{
      src: 'https://prismic-io.s3.amazonaws.com/weheartafrica/67162d9f-d078-4d95-9644-2c5c9d1609d2_pexels-agnieszka-taggart-17154494-960x540-30fps.mp4',
    }}
    isFloating
    isInteractive
    state={[
      undefined,
      {
        base: {
          weight: 1,
          col: 11.9,
          row: 11.9,
        },
      },
      {
        base: {
          weight: 1,
          col: 11.9,
          row: 1,
        },
      },
    ]}
  />,
  <Cell
    cellId='gulugufe-painting'
    key='gulugufe-painting'
    mediaProps={{
      src: 'https://images.prismic.io/weheartafrica/a4fe58da-5249-4e54-8bc9-1085cd7d08d2_pexels-jean-van-der-meulen-1660623.jpg?auto=compress,format',
    }}
    isFloating
    isInteractive
    state={[
      undefined,
      undefined,
      {
        base: {
          weight: 1,
          col: 11.9,
          row: 11.9,
        },
      },
      {
        base: {
          weight: 1,
          col: 11.9,
          row: 1,
        },
      },
    ]}
  />,
  <Cell
    cellId='gulugufe-misc'
    key='gulugufe-misc'
    mediaProps={{
      src: 'https://prismic-io.s3.amazonaws.com/weheartafrica/70b368d3-bf35-45b5-a8b2-9c696143dc13_pexels-roman-odintsov-11025694-960x506-30fps.mp4',
    }}
    isFloating
    isInteractive
    state={[
      undefined,
      undefined,
      undefined,
      {
        base: {
          weight: 1,
          col: 1,
          row: 11.9,
        },
      },
      {
        base: {
          weight: 1,
          col: 1,
          row: 1,
        },
      },
    ]}
  />,
  <Cell
    cellId='gulugufe-misc-2'
    key='gulugufe-misc-2'
    mediaProps={{
      src: 'https://prismic-io.s3.amazonaws.com/weheartafrica/e224b677-eaa2-4790-bc37-1b8edbcc27ee_pexels-edward-mukomazi-16320007-960x540-30fps.mp4',
    }}
    isFloating
    isInteractive
    state={[
      undefined,
      undefined,
      undefined,
      undefined,
      {
        base: {
          weight: 1,
          col: 11.9,
          row: 11.9,
        },
      },
      {
        base: {
          weight: 1,
          col: 11.9,
          row: 6,
        },
      },
      {
        base: {
          weight: 1,
          col: 11.9,
          row: 1,
        },
      },
    ]}
  />,
  <Cell
    cellId='gulugufe-text-mid'
    key='gulugufe-text-mid'
    state={[
      undefined,
      undefined,
      undefined,
      undefined,
      {
        base: {
          weight: 1,
          col: 3,
          row: 9,
        },
      },
      {
        base: {
          weight: 0.5,
          col: 1,
          row: 1,
        },
      },
    ]}
  >
    <div className='flex flex-col items-center justify-center w-full h-full max-w-[80%] md:max-w-xl lg:max-w-3xl max-h-md gap-4'>
      <Text variant='bodyBoldLg'>
        Infra Palmyrae solitudines Telendena regio dictaeque iam Hierapolis ac Beroae et Chalcis. ultra Palmyram quoque
        ex solitudinibus his aliquid obtinet Hemesa, item Elatium, dimidio propior Petrae quam Damascus. a Sura autem
        proxime est Philiscum, oppidum Parthorum ad Euphraten. ab eo Seleuciam dierum decem navigatio, totidemque fere
        Babylonem{' '}
      </Text>
    </div>
  </Cell>,
  <Cell
    cellId='gulugufe-text-end'
    key='gulugufe-text-end'
    state={[
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      {
        base: {
          weight: 1,
          col: 3,
          row: 9,
        },
      },
      {
        base: {
          weight: 0.5,
          col: 1,
          row: 19,
        },
      },
    ]}
  >
    <div className='flex flex-col items-center justify-center w-full h-full max-w-[80%] md:max-w-xl lg:max-w-3xl max-h-md gap-4'>
      <Text variant='sectionHeading'>scinditur enim Euphrates</Text>
      <Text variant='bodyBoldLg'>
        a Zeugmate DLXXXXIIII p. circa vicum Masicen et parte laeva in Mesopotamiam vadit, per ipsam Seleuciam circaque
        eam praefluenti infusus Tigri, dexteriore autem alveo Babylonem, quondam Chaldaeae caput, petit mediamque
        permeans item quam Mothrim vocant, distrahitur in paludes. increscit autem et ipse Nili modo
      </Text>
      <Text variant='bodyBoldLg'>
        statis diebus, paulum differens, ac Mesopotamian inundat sole optinente XX partem cancri. minui incipit in
        virginem e leone transgresso, in totum vero remeat in XXVIIII parte virginis
      </Text>
    </div>
  </Cell>,
  <LinkCell
    href='/'
    cellId='about-banner'
    key='about-banner-link'
    isFloating
    hasLabelCentroid
    canRotate
    followsPointer
    isScalable={false}
    state={[
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      {
        base: {
          weight: 1,
          col: 1,
          row: 11.9,
        },
      },
    ]}
  >
    <div className='flex flex-col items-center justify-center w-full h-full max-w-[10rem] md:max-w-[10rem] lg:max-w-sm max-h-md gap-2'>
      <Text variant='sectionHeading'>Page1</Text>
    </div>
  </LinkCell>,
  <LinkCell
    href='/page4'
    cellId='follow-banner'
    key='follow-banner-link'
    isFloating
    hasLabelCentroid
    canRotate
    followsPointer
    isScalable={false}
    state={[
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      {
        base: {
          weight: 1,
          col: 5,
          row: 11.9,
        },
      },
    ]}
  >
    <div className='flex flex-col items-center justify-center w-full h-full max-w-[10rem] md:max-w-[10rem] lg:max-w-sm max-h-md gap-2'>
      <Text variant='sectionHeading'>Page4</Text>
    </div>
  </LinkCell>,
  <LinkCell
    href='/page5'
    cellId='page5'
    key='page5-link'
    isFloating
    hasLabelCentroid
    canRotate
    followsPointer
    isScalable={false}
    state={[
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      {
        base: {
          weight: 1,
          col: 8,
          row: 10,
        },
      },
    ]}
  >
    <div className='flex flex-col items-center justify-center w-full h-full max-w-[10rem] md:max-w-[10rem] lg:max-w-sm max-h-md gap-2'>
      <Text variant='sectionHeading'>Page5</Text>
    </div>
  </LinkCell>,
]

export default Page2
