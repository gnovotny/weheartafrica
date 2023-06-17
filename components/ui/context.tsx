import React, { FC, useMemo } from 'react'

export interface State {
  displayMenu: boolean
}

const initialState = {
  displayMenu: false,
}

type Action =
  | {
      type: 'OPEN_MENU'
    }
  | {
      type: 'CLOSE_MENU'
    }

export const UIContext = React.createContext<State | any>(initialState)

UIContext.displayName = 'UIContext'

function uiReducer(state: State, action: Action) {
  switch (action.type) {
    case 'OPEN_MENU': {
      return {
        ...state,
        displayMenu: true,
        displayModal: false,
      }
    }
    case 'CLOSE_MENU': {
      return {
        ...state,
        displayMenu: false,
      }
    }
  }
}

export const UIProvider: FC = (props) => {
  const [state, dispatch] = React.useReducer(uiReducer, initialState)

  const openMenu = () => dispatch({ type: 'OPEN_MENU' })
  const closeMenu = () => dispatch({ type: 'CLOSE_MENU' })
  const toggleMenu = () => (state.displayMenu ? dispatch({ type: 'CLOSE_MENU' }) : dispatch({ type: 'OPEN_MENU' }))

  const closeMenuIfPresent = () => state.displayMenu && dispatch({ type: 'CLOSE_MENU' })

  const value = useMemo(
    () => ({
      ...state,
      openMenu,
      closeMenu,
      toggleMenu,
      closeMenuIfPresent,
    }),
    [state]
  )

  return (
    <UIContext.Provider
      value={value}
      {...props}
    />
  )
}

export const useUI = () => {
  const context = React.useContext(UIContext)
  if (context === undefined) {
    throw new Error(`useUI must be used within a UIProvider`)
  }
  return context
}
