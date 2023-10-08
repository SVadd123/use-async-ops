import { useContext } from 'react'
import { context, OpsStateData } from './Provider'

export type FilterFunc = (a: unknown) => boolean

const useRunningOps = (filter: FilterFunc | string | undefined): OpsStateData[] => {
  const runningContext = useContext(context)
  if (runningContext == null) throw new Error('component must be wrapped with middleware.runningOps.Provider for global async status')

  const a = Object.values(runningContext)

  if (filter instanceof Function) {
    return a.filter(filter)
  }
  if (typeof filter === 'string') {
    return a.filter(l => l.name === filter)
  }
  return a
}

export default useRunningOps
