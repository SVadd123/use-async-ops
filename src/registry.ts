import { OpsContext } from './middleware/runningOps/Provider'

export interface RegistryData {
  fn: Function
  data: unknown
}

const registry: Record<OpsContext['name'], RegistryData | undefined> = {}

export const register = (name?: OpsContext['name'], fn?: RegistryData['fn'], data?: RegistryData['data']): void => {
  if (name == null || name === '') throw new Error('Unable to register: No service name has been provided')
  if (fn == null) throw new Error('Unable to register: No operation has been provided for: ' + name)
  if (registry[name] != null) console.log('WARNING: Overwriting existing operation for: ' + name)
  registry[name] = { fn, data }
}

export const get = (name: OpsContext['name']): RegistryData => {
  const operation = registry[name]
  if (operation === undefined) throw new Error('No operation has been registered for: ' + name)
  return operation
}
