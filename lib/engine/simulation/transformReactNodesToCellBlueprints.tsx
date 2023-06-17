import React, { createRef, isValidElement, MutableRefObject, ReactElement, ReactNode } from 'react'

import Cell from '@components/cells/Cell'
import { EngineCellBlueprint } from '@lib/engine/types'

const transformReactNodesToCellBlueprints = (
  nodes: ReactNode | ReactNode[] = [],
  cellsRef: MutableRefObject<HTMLDivElement[]>,
  baseIndex = 0
) => {
  let blueprints: EngineCellBlueprint[] = []
  let index = baseIndex
  const _nodes = Array.isArray(nodes) ? nodes : [nodes]

  _nodes
    .filter((child) => child)
    .forEach((child: ReactNode, childIndex) => {
      if (isValidElement(child) && child.props.isCell) {
        const cellId = child.props.cellId

        cellsRef.current[cellId] = cellsRef.current[cellId] || createRef<HTMLDivElement>()
        const props = {
          ...child.props,
          ref: cellsRef.current[cellId],
          key: cellId,
        }
        const component = <Cell {...props}>{child}</Cell>
        blueprints.push({
          props,
        })
        _nodes[childIndex] = component
        index++
      } else if (((child as ReactElement)?.props?.children?.[0] as ReactElement)?.props?.isCell) {
        index++

        const kids = [...(child as ReactElement).props.children] as ReactNode | ReactNode[]
        const grandChildren = transformReactNodesToCellBlueprints(kids, cellsRef, index)
        _nodes[childIndex] = {
          ...(child as any),
          props: {
            ...child?.props,
            children: kids,
          },
        }

        index = grandChildren.length + index
        blueprints = [...blueprints, ...grandChildren]
      }
    })

  return blueprints
}

export default transformReactNodesToCellBlueprints
