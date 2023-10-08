import { compose, Middleware, MiddlewareAction } from './index'
import end from './end'

test('composed middleware execution order', async () => {
  let s = ''
  const middleware = (label: string): Middleware =>
    (next) => async (...args: Parameters<MiddlewareAction>) => {
      s += label
      return await next(...args)
    }
  const stack = compose(
    middleware('1'),
    middleware('2'),
    middleware('3'),
    end
  )
  await stack({} as any, 'response', 'error')
  expect(s).toBe('123')
})
