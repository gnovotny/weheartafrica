import React from 'react'

import { NextSeo } from 'next-seo'

import Cell from '@components/cells/Cell'
import LinkCell from '@components/cells/Link'
import { Text } from '@components/ui'
import { EngineNextPage } from '@lib/engine/types'

const Page3: EngineNextPage = () => (
  <>
    <NextSeo title='Page3' />
  </>
)

Page3.cells = [
  <Cell
    cellId='antomwe'
    key='antomwe-media'
    mediaProps={{
      src: 'https://prismic-io.s3.amazonaws.com/weheartafrica/9a774f35-1db4-4acc-b2c8-6c4712126956_pexels-lifeofhicham-14908997-960x540-30fps.mp4',
    }}
    isFloating
    state={[
      {
        base: {
          weight: 2,
          col: 8,
          row: 2,
        },
        md: {
          weight: 2,
          col: 9,
          row: 2,
        },
      },
      {
        base: {
          weight: 1,
          col: 6,
          row: 1,
        },
      },
    ]}
  />,
  <Cell
    cellId='antomwe-garden'
    key='antomwe-garden'
    mediaProps={{
      src: 'https://images.prismic.io/heardprojects/a0a3d77a-e460-484b-aeed-9c3a50d7fa64_antomwe_progress+%281%29.jpg?auto=compress,format',
    }}
    isFloating
    state={[
      {
        base: {
          weight: 2,
          col: 1,
          row: 6,
        },
        md: {
          weight: 2,
          col: 2,
          row: 2,
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
    cellId='antomwe-hero'
    key='antomwe-hero'
    cellClassName='flex justify-center items-center'
    state={[
      {
        base: {
          weight: 3,
          col: 8,
          row: 8,
        },
        md: {
          weight: 2,
          col: 8,
          row: 11,
        },
      },
      {
        base: {
          weight: 1,
          col: 8,
          row: 1,
        },
      },
    ]}
  >
    <div className='flex flex-col items-end justify-center w-full h-full max-w-[10rem] md:max-w-sm lg:max-w-sm max-h-md gap-2'>
      <Text variant='customMultiPartHeading'>
        <span className='wide'>Pa</span>
        <span className='narrow'>ge3</span>
      </Text>
      <Text
        variant='bodyBoldLg'
        className='text-right'
      >
        ab Lixo XL in mediterraneo altera Augusta colonia est Babba, Iulia Campestris appellata, et tertia Banasa LXXV
        p., Valentia cognominata. ab ea XXXV Volubile oppidum
      </Text>
    </div>
  </Cell>,
  <Cell
    hasDisplacement
    cellId='village'
    key='village'
    state={[
      undefined,
      {
        base: undefined,
        md: {
          weight: 0.1,
          col: 10,
          row: 10,
        },
      },
      {
        base: undefined,
        md: {
          weight: 0.1,
          col: 11.9,
          row: 1,
        },
      },
    ]}
    rendererConfig={{
      deco: {
        src: {
          id: 'african_village',
          url: '/assets/african_village_white.png',
          dimensions: { width: 201, height: 130 },
        },
        size: 75,
      },
      fillStyles: {
        fillColor: 0xffe29c,
        outlineColor: 0x80471c,
        scale: 0.75,
        // alpha: 0.4,
        alpha: 0.7,
        zIndex: 5,
      },
      outlineStyles: {
        md: [
          {
            color: 0x465444,
            width: {
              base: 15,
              md: 65,
              lg: 105,
            },
            alignment: 0,
          },
          {
            color: 0x4a2511,
            width: {
              base: 20,
              md: 40,
              lg: 55,
            },
            alignment: 1,
          },
        ],
      },
    }}
  />,
  <Cell
    hasLabelCentroid
    cellId='antomwe-intro'
    key='antomwe-intro'
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
          weight: 3,
          col: 4,
          row: 3,
        },
      },
    ]}
  >
    <div className='flex flex-col items-center justify-center w-full h-full max-w-[80%] md:max-w-xl lg:max-w-3xl max-h-md gap-4'>
      <Text variant='bodyBoldLg'>
        Banasa LXXV p., Valentia cognominata. ab ea XXXV Volubile oppidum, tantundem a mari utroque distans. at in ora a
        Lixo L amnis Sububus, praeter Banasam coloniam defluens, magnificus et navigabilis. ab eo totidem milibus
        oppidum Sala
      </Text>
      <Text variant='bodyBoldLg'>
        eiusdem nominis fluvio inpositum, iam solitudinibus vicinum elephantorumque gregibus infestum, multo tamen magis
        Autololum gente, per quam iter est ad montem Africae vel fabulosissimum Atlantem{' '}
      </Text>
    </div>
  </Cell>,
  <Cell
    cellId='antomwe-group-garden'
    key='antomwe-group-garden'
    mediaProps={{
      src: 'https://images.prismic.io/heardprojects/8bbae55b-8992-4e10-81c6-762960e0e671_antomwe+%284%29.jpg?auto=compress,format',
    }}
    isFloating
    state={[
      undefined,
      undefined,
      {
        base: {
          weight: 2,
          col: 11.9,
          row: 9,
        },
      },
      {
        base: {
          weight: 2,
          col: 11.9,
          row: 2,
        },
      },
    ]}
  />,
  <Cell
    cellId='antomwe-oxes'
    key='antomwe-oxes'
    mediaProps={{
      src: 'https://images.prismic.io/heardprojects/fcc11b0c-dff5-44a6-b5ec-027be14f19ec_antomwe+%286%29.jpg?auto=compress,format',
    }}
    isFloating
    state={[
      undefined,
      undefined,
      {
        base: {
          weight: 2,
          col: 1,
          row: 11.9,
        },
      },
      {
        base: {
          weight: 2,
          col: 4,
          row: 2,
        },
      },
    ]}
  />,
  <Cell
    cellId='antomwe-text-mid'
    key='antomwe-text-mid'
    state={[
      undefined,
      undefined,
      undefined,
      {
        base: {
          weight: 4,
          col: 6,
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
  >
    <div className='flex flex-col items-center justify-center w-full h-full max-w-[80%] md:max-w-lg lg:max-w-4xl max-h-md gap-2'>
      <Text variant='bodyBoldLg'>
        E mediis hunc harenis in caelum attolli prodidere, asperum, squalentem qua vergat ad litora oceani, cui conomen
        inposuit, eundem opacum nemorosumque et scatebris fontium riguum qua spectet Africam, fructibus omnium generum
        sponte ita subnascentibus, ut numquam satias voluptatibus desit.
      </Text>
    </div>
  </Cell>,
  <Cell
    cellId='gulugufe-swimming'
    key='gulugufe-swimming'
    mediaProps={{
      src: 'https://prismic-io.s3.amazonaws.com/weheartafrica/d385a6a4-a1ea-4c38-a546-c0162438b6ed_pexels-agnieszka-taggart-17154494-960x540-30fps.mp4',
    }}
    isFloating
    state={[
      undefined,
      undefined,
      undefined,
      {
        base: {
          weight: 2,
          col: 11.9,
          row: 11.9,
        },
      },
      {
        base: {
          weight: 2,
          col: 10,
          row: 10,
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
    cellId='antomwe-nursery'
    key='antomwe-nursery'
    mediaProps={{
      src: 'https://images.prismic.io/heardprojects/2212d67f-7612-4b1d-8b84-7909eefb4c8b_antomwe+%281%29.jpg?auto=compress,format',
    }}
    isFloating
    state={[
      undefined,
      undefined,
      undefined,
      undefined,
      {
        base: {
          weight: 0.1,
          col: 6,
          row: 11.9,
        },
      },
      {
        base: {
          weight: 1,
          col: 8,
          row: 11.9,
        },
      },
      {
        base: {
          weight: 0.5,
          col: 10,
          row: 1,
        },
      },
    ]}
  />,
  <Cell
    cellId='antomwe-simon-tomato'
    key='antomwe-simon-tomato'
    mediaProps={{
      src: 'https://images.prismic.io/heardprojects/843bee69-f13b-4ad0-852e-4f76fa769db8_antomwe+%285%29.jpg?auto=compress,format',
    }}
    isFloating
    state={[
      undefined,
      undefined,
      undefined,
      undefined,
      {
        base: {
          weight: 0.5,
          col: 2,
          row: 6,
        },
      },
      {
        base: {
          weight: 1,
          col: 4,
          row: 4,
        },
      },
    ]}
  />,
  <Cell
    cellId='antomwe-solar-drier-hero'
    key='antomwe-solar-drier-hero'
    cellClassName='flex justify-center items-center'
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
          row: 8,
        },
      },
      {
        base: {
          weight: 1,
          col: 10,
          row: 2,
        },
      },
    ]}
  >
    <div className='flex flex-col items-center justify-center w-full h-full max-w-[80%] md:max-w-xl lg:max-w-3xl max-h-md gap-2'>
      <Text variant='sectionHeading'>voluptatibus desit</Text>
      <Text variant='bodyBoldLg'>
        incolarum neminem interdiu cerni; silere omnia haut alio quam solitudinum horrore; subire tacitam religionem
        animos propius accedentium praeterque horrorem{' '}
      </Text>
    </div>
  </Cell>,
  <Cell
    cellId='gulugufe-painting'
    key='gulugufe-painting'
    mediaProps={{
      src: 'https://images.prismic.io/weheartafrica/a4fe58da-5249-4e54-8bc9-1085cd7d08d2_pexels-jean-van-der-meulen-1660623.jpg?auto=compress,format',
    }}
    isFloating
    state={[
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      {
        base: {
          weight: 2,
          col: 1,
          row: 6,
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
  <LinkCell
    href='/page2'
    cellId='gulugufe'
    key='gulugufe-link'
    mediaProps={{
      src: 'https://prismic-io.s3.amazonaws.com/weheartafrica/493ee97a-15fc-498a-b8e2-40eb5a1b82fd_pexels-taryn-elliott-3326781-960x540-24fps.mp4',
    }}
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
      undefined,
      {
        base: {
          weight: 4,
          col: 10,
          row: 6,
        },
      },
    ]}
  >
    <Text variant='dymoLabel'>PAGE 2</Text>
  </LinkCell>,
  <LinkCell
    href='/'
    cellId='about-banner'
    key='about-banner-link'
    isFloating
    hasLabelCentroid
    state={[
      undefined,
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
    state={[
      undefined,
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
    state={[
      undefined,
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

export default Page3
