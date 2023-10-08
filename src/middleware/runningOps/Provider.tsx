import React, { createContext, useReducer, useRef, FC, ReactNode, Dispatch } from 'react'
import { Middleware } from '../index'

export interface OpsContext {
  name: string
  args: unknown[]
  runId: string | number
  options: unknown
  hookId: number
}

export interface OpsStateData {
  name: string
  args: unknown[]
}

export interface OpsState {
  [runId: string]: OpsStateData
}

interface RegisterAction {
  type: typeof REGISTER
  name: string
  args: unknown[]
  runId: string | number
}

interface DeregisterAction {
  type: typeof DEREGISTER
  runId: string | number
}

export type ProviderAction = RegisterAction | DeregisterAction

export const context = createContext<OpsState | undefined>(undefined)

const REGISTER = 'REGISTER'
const DEREGISTER = 'DEREGISTER'

export interface DetermineKeyProps {
  name: OpsContext['name']
  hookId: OpsContext['hookId']
  runId: OpsContext['runId']
}

export const determineKey = ({ name, hookId, runId }: DetermineKeyProps): string =>
  [name, hookId, runId].filter(x => x).join('_')

const handleRegister = (state: OpsState, action: RegisterAction): OpsState => ({
  ...state,
  [action.runId]: { name: action.name, args: action.args }
})

const handleDeregister = (state: OpsState, action: DeregisterAction): OpsState => {
  const stateClone = { ...state }
  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
  delete stateClone[action.runId]
  return stateClone
}

const reducer = (state: OpsState = {}, action: ProviderAction): OpsState => {
  switch (action.type) {
    case REGISTER: return handleRegister(state, action)
    case DEREGISTER: return handleDeregister(state, action)
    default: return state
  }
}

const buildMiddleware = ({ dispatch }: { dispatch: Dispatch<ProviderAction> }): Middleware => next => async (context, response, error) => {
  const { name, args, runId } = context
  dispatch({ type: REGISTER, runId, name, args })
  try {
    const r = await next(context, response, error)
    dispatch({ type: DEREGISTER, runId })
    return r
  } catch (e) {
    dispatch({ type: DEREGISTER, runId })
    throw e
  }
}

export interface ProviderProps {
  children?: ReactNode
  prependMiddleware: (middleware: Middleware) => void
}

const Provider: FC<ProviderProps> = ({ children, prependMiddleware }) => {
  const [runningOps, dispatch] = useReducer(reducer, {})
  const registeredRef = useRef(false)

  if (!registeredRef.current) {
    prependMiddleware(buildMiddleware({ dispatch }))
    registeredRef.current = true
  }

  return (
    <context.Provider value={runningOps}>
      {children}
    </context.Provider>
  )
}

export default Provider
