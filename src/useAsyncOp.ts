import { useCallback, useRef, useReducer, useEffect } from 'react'
import { invoke } from './middleware'
import { OpsContext } from './middleware/runningOps/Provider'

export const START = 'START'
export const COMPLETE = 'COMPLETE'
export const ERROR = 'ERROR'

export interface OpsState {
  loading: boolean
  error: null | Error
  result: unknown
}

export interface StartAction {
  type: typeof START
}

export interface ErrorAction {
  type: typeof ERROR
  value: OpsState['error']
}

export interface CompleteAction {
  type: typeof COMPLETE
  value: OpsState['result']
}

export type OpsAction = StartAction | ErrorAction | CompleteAction

const initialState = { result: null, loading: false, error: null }

const reducer = (state: OpsState, action: OpsAction): OpsState => {
  switch (action.type) {
    case START:
      return { ...state, loading: true, error: null }
    case ERROR:
      return { result: null, loading: false, error: action.value }
    case COMPLETE:
      return { result: action.value, loading: false, error: null }
    default:
      return state
  }
}

let runIdInc = 0
let hookIdInc = 0

export interface UseAsyncOpProps {
  name?: OpsContext['name']
  options?: unknown
}

export interface UseAsyncOpReturn extends OpsState {
  call: (...args: unknown[]) => unknown
}

const useAsyncOp = ({ name, options = {} }: UseAsyncOpProps = {}): UseAsyncOpReturn => {
  if (name === undefined || name === '') throw new Error('name required for useAsyncOp')
  const runIdRef = useRef<string | number | undefined>()
  const hookIdRef = useRef(hookIdInc++)
  const [state, dispatch] = useReducer(reducer, initialState)
  let mounted = true

  useEffect(() => {
    // On cleanup:
    return () => {
      mounted = false
    }
  }, [])

  const callFn = useCallback(
    async (...args: unknown[]) => {
      if (!mounted) return
      const runId = runIdInc++
      runIdRef.current = runId

      const dispatchStart = (): void => {
        if (!mounted) return
        dispatch({ type: START })
      }

      const dispatchFail = (value: ErrorAction['value']): void => {
        if (!mounted) return
        if (runIdRef.current !== runId) return
        dispatch({ type: ERROR, value })
      }

      const dispatchComplete = (value: CompleteAction['value']): void => {
        if (!mounted) return
        if (runIdRef.current !== runId) return
        dispatch({ type: COMPLETE, value })
      }

      dispatchStart()
      const res = invoke({ options, runId, hookId: hookIdRef.current })(name, ...args)
      res.then(dispatchComplete).catch(() => {})
      res.catch(dispatchFail)
      return await res
    },
    [runIdRef, dispatch, name]
  )

  return { call: callFn, ...state }
}

export default useAsyncOp
