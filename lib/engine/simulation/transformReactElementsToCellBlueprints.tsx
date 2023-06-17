import { isValidElement, ReactElement } from 'react'

import { EngineCellBlueprint, EngineCellComponentProps } from '@lib/engine/types'

const transformReactElementsToCellBlueprints = (elements: ReactElement | ReactElement[] = []) => {
  let blueprints: EngineCellBlueprint[] = []

  ;(Array.isArray(elements) ? elements : [elements])
    .filter((child) => child)
    .forEach((child: ReactElement<EngineCellComponentProps>, childIndex) => {
      if (isValidElement(child) && child.props.cellId) {
        blueprints.push({
          props: Object.keys(child.props)
            .filter((key) => key !== 'children')
            .reduce((cur, key) => {
              return Object.assign(cur, { [key]: child.props[key] })
            }, {}),
        })
      }
    })

  return { blueprints }
}

export default transformReactElementsToCellBlueprints
