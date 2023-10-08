import { Middleware } from './index'

const end: Middleware = next => async (context, resp, err) => {
  // Because we can't guarantee that dependent projects follow this in a sane manner,
  // eslint-disable-next-line @typescript-eslint/no-throw-literal
  if (err !== '' && err != null) throw err
  return resp
}

export default end
