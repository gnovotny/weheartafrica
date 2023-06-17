import React from 'react'

import { NextSeo } from 'next-seo'

import Cell from '@components/cells/Cell'
import LinkCell from '@components/cells/Link'
import { Text } from '@components/ui'
import { EngineNextPage } from '@lib/engine/types'

const HomePage: EngineNextPage = () => {
  return (
    <>
      <NextSeo title='Home' />
    </>
  )
}

HomePage.cells = [
  <LinkCell
    href='/page2'
    cellId='gulugufe'
    key='gulugufe-link'
    mediaProps={{
      src: 'https://prismic-io.s3.amazonaws.com/weheartafrica/493ee97a-15fc-498a-b8e2-40eb5a1b82fd_pexels-taryn-elliott-3326781-960x540-24fps.mp4',
    }}
    isFloating
    isInteractive
    hasLabelCentroid
    canRotate
    followsPointer
    isScalable={false}
    state={[
      {
        base: {
          weight: 1,
          col: 10,
          row: 2,
        },
        md: {
          weight: 3,
          col: 7,
          row: 2,
        },
      },
      {
        base: {
          weight: 0.5,
          col: 11.9,
          row: 1,
        },
        md: {
          weight: 1,
          col: 5,
          row: 1,
        },
      },
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
    href='/page3'
    cellId='antomwe'
    key='antomwe-media-link'
    mediaProps={{
      src: 'https://prismic-io.s3.amazonaws.com/weheartafrica/9a774f35-1db4-4acc-b2c8-6c4712126956_pexels-lifeofhicham-14908997-960x540-30fps.mp4',
    }}
    isFloating
    isInteractive
    hasLabelCentroid
    canRotate
    followsPointer
    isScalable={false}
    state={[
      {
        base: {
          weight: 1,
          col: 3,
          row: 7,
        },
        md: {
          weight: 1,
          col: 6,
          row: 11.9,
        },
      },
      {
        base: undefined,
        md: {
          weight: 0.1,
          col: 1,
          row: 3,
        },
      },
      undefined,
      undefined,
      undefined,
      undefined,
      {
        base: {
          weight: 1,
          col: 2,
          row: 3,
        },
      },
    ]}
  >
    <Text variant='dymoLabelAlt'>PAGE 3</Text>
  </LinkCell>,
  <Cell
    isInteractive={true}
    hasDisplacement
    cellId='lake'
    key='lake'
    state={[
      {
        base: undefined,
        md: {
          weight: 1,
          col: 10,
          row: 11.9,
        },
      },
      {
        base: undefined,
        md: {
          weight: 0.1,
          col: 10,
          row: 4,
        },
      },
    ]}
    rendererConfig={{
      deco: {
        src: {
          id: 'canoe',
          url: '/assets/canoe_white.png',
          dimensions: { width: 488, height: 546 },
        },
      },
      fillStyles: {
        fillColor: 0x004f4c,
        outlineColor: 0xffe29c,
        scale: 0.75,
        alpha: 0.7,
        zIndex: 5,
      },
      outlineStyles: {
        md: [
          {
            color: 0x465444,
            width: {
              base: 15,
              md: 20,
              lg: 105,
            },
            alignment: 0,
          },
          {
            color: 0x1a1a1e,
            width: {
              base: 20,
              md: 28,
              lg: 55,
            },
            alignment: 1,
          },
        ],
      },
    }}
  />,
  <Cell
    isInteractive={false}
    hasLabelCentroid
    cellId='hero'
    key='hero'
    state={[
      {
        base: {
          weight: 2,
          col: 6,
          row: 10,
        },
        md: {
          weight: 3,
          col: 2,
          row: 6,
        },
        lg: {
          weight: 2,
          col: 2,
          row: 6,
        },
      },
      {
        base: {
          weight: 0.1,
          col: 1,
          row: 1,
        },
        md: {
          weight: 1,
          col: 1,
          row: 1,
        },
        lg: {
          weight: 0.5,
          col: 1,
          row: 1,
        },
      },
    ]}
  >
    <div className='flex flex-col items-center justify-center w-full h-full max-w-[10rem] md:max-w-[10rem] lg:max-w-sm max-h-md gap-2'>
      <Text variant='sectionHeading'>Aegyptio finitur, nec alia pars terrarum...</Text>
      <Text variant='bodyBoldLg'>
        ...pauciores recipit sinus, longe ab occidente litorum obliquo spatio. populorum eius oppidorumque...
      </Text>
    </div>
  </Cell>,
  <Cell
    isInteractive={false}
    hasLabelCentroid
    cellId='intro'
    key='intro'
    state={[
      undefined,
      {
        base: {
          weight: 4,
          col: 6,
          row: 6,
        },
      },
      {
        base: {
          weight: 2,
          col: 6,
          row: 2,
        },
      },
    ]}
  >
    <div className='flex flex-col items-center justify-center w-full h-full max-w-xs md:max-w-md lg:max-w-3xl max-h-md gap-4'>
      <Text variant='bodyBoldLg'>
        Principio terrarum Mauretaniae appellantur, usque ad C. Caesarem Germanici filium regna, saevitia eius in duas
        divisaeº provincias. promunturium oceani extumum Ampelusia nominatur a Graecis. oppida fuere Lissa et Cottae
        ultra columnas Herculis, nunc est Tingi, quondam ab Antaeo conditum, postea a Claudio Caesare, cum coloniam
        faceret, appellatum Traducta Iulia. abest a Baelone oppido Baeticae proximo traiectu XXX. ab eo XXV in ora
        oceani colonia Augusti Iulia Constantia Zulil, regum dicioni exempta et iura in Baeticam petere iussa. ab ea
        XXXV colonia a Claudio Caesare facta Lixos, vel fabulosissime antiquis narrata:
      </Text>
    </div>
  </Cell>,
  // <ShowreelCell
  //   key='showreel'
  //   {...showreelCellDefaultProps}
  //   state={[
  //     undefined,
  //     {
  //       base: {
  //         weight: 0.5,
  //         col: 11.9,
  //         row: 11.9,
  //       },
  //     },
  //     {
  //       base: {
  //         weight: 2,
  //         col: 8,
  //         row: 8,
  //       },
  //     },
  //     {
  //       base: {
  //         weight: 0.5,
  //         col: 10,
  //         row: 1,
  //       },
  //     },
  //   ]}
  // />,
  <Cell
    isInteractive
    isExpandable
    cellId='showreel'
    key='showreel'
    mediaProps={{
      src: 'https://prismic-io.s3.amazonaws.com/weheartafrica/346d1b11-70c0-4315-aea0-190e840b625a_pexels-rihan-bezuidenhout-12419429-960x540-30fps.mp4',
    }}
    state={[
      undefined,
      {
        base: {
          weight: 0.5,
          col: 11.9,
          row: 11.9,
        },
      },
      {
        base: {
          weight: 2,
          col: 8,
          row: 8,
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
    isInteractive
    isExpandable
    cellId='streetkids-landing'
    key='streetkids-landing'
    mediaProps={{
      src: 'https://prismic-io.s3.amazonaws.com/weheartafrica/66548189-324a-44db-aa61-b0748288e8ec_pexels-why-steve-16922560-960x540-25fps.mp4',
    }}
    state={[
      undefined,
      undefined,
      undefined,
      {
        base: {
          weight: 1,
          col: 10,
          row: 10,
        },
      },
      {
        base: {
          weight: 2,
          col: 11,
          row: 3,
        },
      },
    ]}
  />,
  <Cell
    isInteractive
    cellId='photoshooting-img'
    key='photoshooting-img'
    mediaProps={{
      src: 'https://images.prismic.io/weheartafrica/de9b9876-1bd5-45aa-898f-bce2df1720c0_pexels-boris-ulzibat-3378996.jpg?auto=compress,format',
    }}
    state={[
      undefined,
      undefined,
      undefined,
      {
        base: {
          weight: 2,
          col: 2,
          row: 11,
        },
      },
      {
        base: {
          weight: 1,
          col: 2,
          row: 1,
        },
      },
    ]}
  />,
  <Cell
    isInteractive={false}
    hasLabelCentroid
    cellId='landing-midtext'
    key='landing-midtext'
    state={[
      undefined,
      undefined,
      undefined,
      undefined,
      {
        base: {
          weight: 4,
          col: 6,
          row: 6,
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
  >
    <div className='flex flex-col items-center justify-center w-full h-full max-w-xs md:max-w-md lg:max-w-4xl max-h-md gap-2'>
      <Text variant='bodyBoldLg'>
        ibi regia Antaei certamenque cum Hercule et Hesperidum horti. adfunditur autem aestuarium e mari flexuoso meatu,
        in quo dracones custodiae instar fuisse nunc interpretantur. amplectitur intra se insulam, quam solam e vicino
        tractu aliquanto excelsiore non tamen aestus maris inundant. exstat in ea et ara Herculis nec praeter oleastros
        aliud ex narrato illo aurifero nemore.
      </Text>
    </div>
  </Cell>,
  <Cell
    isInteractive={false}
    hasLabelCentroid
    cellId='landing-endtext'
    key='landing-endtext'
    state={[
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      {
        base: {
          weight: 4,
          col: 6,
          row: 6,
        },
      },
    ]}
  >
    <div className='flex flex-col items-center justify-center w-full h-full max-w-xs md:max-w-md lg:max-w-4xl max-h-md gap-2'>
      <Text variant='bodyBoldLg'>
        minus profecto mirentur portentosa Graeciae mendacia de his et amne Lixo prodita qui cogitent nostros nuperque
        paulo minus monstrifica quaedam de iisdem tradidisse, praevalidam hanc urbem maioremque Magna Carthagine,
        praeterea ex adverso eius sitam et prope inmenso tractu ab Tingi, quaeque alia Cornelius Nepos avidissime
        credidit.
      </Text>
    </div>
  </Cell>,
  <LinkCell
    href='/page4'
    cellId='follow-banner'
    key='follow-banner-link'
    isFloating
    hasLabelCentroid
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
          weight: 0.1,
          col: 1,
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
          weight: 0.1,
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
HomePage.config = {}

export default HomePage
