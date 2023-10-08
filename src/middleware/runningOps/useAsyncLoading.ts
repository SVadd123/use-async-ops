import useRunningOps from './useRunningOps'

export default (filter: Parameters<typeof useRunningOps>[0]): boolean => {
  const running = useRunningOps(filter)
  return running.length !== 0
}
