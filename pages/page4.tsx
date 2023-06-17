import React from 'react'

import { NextSeo } from 'next-seo'

import Cell from '@components/cells/Cell'
import { Text } from '@components/ui'
import { EngineNextPage } from '@lib/engine/types'

const Page4: EngineNextPage = () => (
  <>
    <NextSeo title='Page4' />
  </>
)

Page4.cells = [
  <Cell
    cellId='kids-looking-at-cam2'
    key='kids-looking-at-cam2'
    mediaProps={{
      src: 'https://prismic-io.s3.amazonaws.com/heardprojects/a0909eba-6745-46e2-b4ac-803bea979773_kids_looking_at_cam_2.mp4',
    }}
    isInteractive
    state={[
      {
        base: {
          weight: 1,
          col: 2,
          row: 2,
        },
      },
    ]}
  />,
  <Cell
    cellId='follow-hero'
    key='follow-hero'
    state={[
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
          col: 6,
          row: 6,
        },
      },
    ]}
  >
    <div className='flex flex-col items-center justify-center w-full h-full max-w-xs md:max-w-md max-h-md gap-2'>
      <Text variant='sectionHeading'>Page4</Text>
      <Text variant='bodyBoldLg'></Text>
    </div>
  </Cell>,
]

export default Page4
