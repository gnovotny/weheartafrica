import React, { FunctionComponent, JSXElementConstructor, CSSProperties } from 'react'

import cn from 'classnames'

import s from './Text.module.css'

interface TextProps {
  variant?: Variant
  className?: string
  style?: CSSProperties
  children?: React.ReactNode | any
  html?: string
  onClick?: () => any
}

type Variant =
  | 'heading'
  | 'body'
  | 'bodyBold'
  | 'pageHeading'
  | 'sectionHeading'
  | 'dymoLabel'
  | 'dymoLabelAlt'
  | 'siteHeading'
  | 'bodyBoldLg'
  | 'customMultiPartHeading'

const Text: FunctionComponent<TextProps> = ({
  style,
  className = '',
  variant = 'body',
  children,
  html,
  onClick,
} = {}) => {
  const componentsMap: {
    [P in Variant]: React.ComponentType<any> | string
  } = {
    body: 'div',
    bodyBold: 'div',
    bodyBoldLg: 'div',
    heading: 'h1',
    pageHeading: 'h1',
    sectionHeading: 'h2',
    dymoLabel: 'h3',
    dymoLabelAlt: 'h3',
    siteHeading: 'h1',
    customMultiPartHeading: 'h1',
  }

  const Component: JSXElementConstructor<any> | React.ReactElement<any> | React.ComponentType<any> | string =
    componentsMap![variant!]

  const htmlContentProps = html
    ? {
        dangerouslySetInnerHTML: { __html: html },
      }
    : {}

  return (
    <Component
      className={cn(
        s.root,
        {
          [s.body]: variant === 'body',
          [s.bodyBold]: variant === 'bodyBold',
          [s.bodyBoldLg]: variant === 'bodyBoldLg',
          [s.heading]: variant === 'heading',
          [s.pageHeading]: variant === 'pageHeading',
          [s.sectionHeading]: variant === 'sectionHeading',
          [s.dymoLabel]: variant === 'dymoLabel' || variant === 'dymoLabelAlt',
          [s.dymoLabelAlt]: variant === 'dymoLabelAlt',
          [s.siteHeading]: variant === 'siteHeading',
          [s.customMultiPartHeading]: variant === 'customMultiPartHeading',
        },
        className
      )}
      onClick={onClick}
      style={style}
      {...htmlContentProps}
    >
      {children}
    </Component>
  )
}

export default Text
