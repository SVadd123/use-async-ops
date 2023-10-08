import { get } from '../registry'
import { Middleware } from './index'

const call: Middleware = next => async (context, response, error) => {
  if (response === undefined && error === undefined) {
    const { name, args } = context
    const fn = get(name).fn
    try {
      response = await fn(...args)
    } catch (e) {
      error = e as any
    }
  }

  return await next(context, response, error)
}

export default call
