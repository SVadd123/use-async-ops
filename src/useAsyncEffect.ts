import { useEffect } from 'react'
import useAsyncOp, { UseAsyncOpReturn } from './useAsyncOp'
import { OpsContext } from './middleware/runningOps/Provider'

export interface UseAsyncEffectProps {
  name: OpsContext['name']
  options: unknown
}

export interface UseAsyncEffectReturn {
  loading: UseAsyncOpReturn['loading']
  error: UseAsyncOpReturn['error']
  result: UseAsyncOpReturn['result']
}

const useAsyncEffect = ({ name, options }: UseAsyncEffectProps, ...args: unknown[]): UseAsyncEffectReturn => {
  const { call, loading, error, result } = useAsyncOp({ name, options })
  useEffect(() => {
    call(...args)
  }, [call, ...args])
  return { loading, error, result }
}

export default useAsyncEffect
