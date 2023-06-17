import React, { FC } from 'react'

import { UrlObject } from 'url'

import NextLink from 'next/link'

import Cell from '@components/cells/Cell'
import { EngineCellComponentProps } from '@lib/engine/types'

export type LinkCellProps = EngineCellComponentProps & {
  href?: string | UrlObject
  onClick?: (e: any) => void
}

const LinkCell: FC<LinkCellProps> = ({ children, href, onClick, ...props }) => (
  <Cell
    {...props}
    linkProps={props.linkProps || { href: href || '/', onClick }}
  >
    <NextLink
      href={href || '/'}
      {...props.linkProps}
    >
      {children}
    </NextLink>
  </Cell>
)

export default LinkCell
