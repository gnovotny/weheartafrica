import React from 'react'

import { NextSeo } from 'next-seo'

import Cell from '@components/cells/Cell'
import { Text } from '@components/ui'
import { EngineNextPage } from '@lib/engine/types'

const Page5: EngineNextPage = () => (
  <>
    <NextSeo title='Page5' />
  </>
)

Page5.cells = [
  <Cell
    cellId='kids-looking-at-cam2'
    key='kids-looking-at-cam2'
    mediaProps={{
      src: 'https://prismic-io.s3.amazonaws.com/heardprojects/a0909eba-6745-46e2-b4ac-803bea979773_kids_looking_at_cam_2.mp4',
    }}
    isFloating
    isInteractive
    state={[
      {
        base: {
          weight: 1,
          col: 11.9,
          row: 3,
        },
      },
      undefined,
      undefined,
      {
        base: {
          weight: 1,
          col: 11.9,
          row: 9,
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
          weight: 1,
          col: 11.9,
          row: 9,
        },
      },
      {
        base: {
          weight: 0.5,
          col: 11.9,
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
      undefined,
      {
        base: {
          weight: 1,
          col: 11.9,
          row: 9,
        },
      },
      {
        base: {
          weight: 1,
          col: 11.9,
          row: 3,
        },
      },
      {
        base: {
          weight: 0.1,
          col: 11.9,
          row: 1,
        },
      },
    ]}
  />,
  <Cell
    cellId='howcanihelp-hero'
    key='howcanihelp-hero'
    state={[
      {
        base: {
          weight: 3,
          col: 4,
          row: 6,
        },
      },
    ]}
  >
    <div className='flex flex-col items-center justify-center w-full h-full max-w-xs md:max-w-md lg:max-w-3xl max-h-md gap-4 items-center-full gap-2'>
      <Text variant='sectionHeading'>Quae sequitur </Text>
      <Text variant='bodyBoldLg'>
        Quae sequitur regio Mareotis Libya appellatur, Aegypto contermina. tenent Marmarides, Adyrmachidae, dein
        Mareotae
      </Text>
    </div>
  </Cell>,
  <Cell
    cellId='sponsorship-hero'
    key='sponsorship-hero'
    state={[
      undefined,
      {
        base: {
          weight: 0.5,
          col: 6,
          row: 11.9,
        },
      },
      {
        base: {
          weight: 2,
          col: 6,
          row: 6,
        },
      },
    ]}
  >
    <div className='flex flex-col items-center justify-center w-full h-full max-w-xs md:max-w-md lg:max-w-3xl max-h-md gap-4 items-center-full gap-2'>
      <Text variant='sectionHeading'>Nilus incertis ortus</Text>
      <Text variant='bodyBoldLg'>
        fontibus, ut per deserta et ardentia et inmenso longitudinis spatio ambulans famaque tantum inermi quaesitus
        sine bellis, quae ceteras omnes terras invenere, originem, ut Iuba rex potuit exquirere, in monte inferioris
        Mauretaniae non procul oceano
      </Text>
    </div>
  </Cell>,
  <Cell
    cellId='volunteering-hero'
    key='volunteering-hero'
    state={[
      undefined,
      undefined,
      {
        base: {
          weight: 0.1,
          col: 1,
          row: 11.9,
        },
      },
      {
        base: {
          weight: 2,
          col: 6,
          row: 6,
        },
      },
    ]}
  >
    <div className='flex flex-col items-center justify-center w-full h-full max-w-xs md:max-w-md lg:max-w-3xl max-h-md gap-4 items-center-full gap-2'>
      <Text variant='sectionHeading'>Ultra Pelusiacum Arabia est</Text>
      <Text variant='bodyBoldLg'>
        Mareotis lacus a meridiana urbis parte euripo e Canopico ostio mittit ex mediterraneo commercia, insulas quoque
        plures amplexus, XXX traiectu, CCL ambitu, ut tradit Claudius Caesar. alii schoenos in longitudinem patere XL
        faciunt schoenumque stadia XXX: ita fieri longitudinis CL p., tantundem et latitudinis
      </Text>
    </div>
  </Cell>,
]

export default Page5
