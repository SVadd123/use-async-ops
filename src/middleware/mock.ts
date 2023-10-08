import { get } from '../registry'
import { Middleware } from './index'

const setLocalStorage = (variable: string, value: any): void => {
  if (value === false || value == null || value === '') {
    window.localStorage.removeItem(variable)
  } else {
    window.localStorage.setItem(variable, value)
  }
}

const getLocalStorage = (cname: string): string | null => window.localStorage.getItem(cname)

export const enable = (): void => setLocalStorage('mock', true)

export const disable = (): void => setLocalStorage('mock', false)

export const enabled = (): boolean => {
  const get = getLocalStorage('mock')
  return get != null
}

const mock: Middleware = next => async (context, response, error) => {
  if (enabled() && response === undefined && error === undefined) {
    const { name, args } = context
    const data = get(name).data ?? {}
    if (typeof data === 'object' && data != null && 'mock' in data) {
      const mockFn: any = data.mock
      try {
        // TODO: This could probably be typed better
        response = await mockFn(...args)
      } catch (e) {
        error = e as any
      }
    }
    if (response === undefined) response = null
  }
  return await next(context, response, error)
}

export default mock
