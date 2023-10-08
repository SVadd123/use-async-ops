import { Middleware } from './index'
import { OpsAction } from '../useAsyncOp'

const CSS_HEADER = 'color: #777;'
const CSS_NAME = 'color: #000; font-weight: bold;'
const CSS_OPTIONS = 'color: #555;'
const CSS_ARGS = 'font-weight: normal;'
const CSS_EVENT_COMPLETE = 'color: #272;'
const CSS_EVENT_ERROR = 'color: #c22;'
const CSS_EVENT_START = 'color: #22c;'

interface LogProps {
  id: string | number
  event: OpsAction['type']
  name: string
  args: unknown[]
  options: unknown
  error?: Error | string
  result?: unknown
}

const log = ({ id, event, name, args, options, error, result }: LogProps): void => {
  let s = ''
  const logParams: any[] = []

  const append = (css: string | null, type: string, value: any): void => {
    s += ''
    if (css != null) {
      s += '%c'
      logParams.push(css)
    }
    s += type + ' '
    logParams.push(value)
  }

  append(CSS_HEADER, '%s', 'ASYNC_OP')
  append(null, '%i', id)
  append(CSS_NAME, '%s', name)

  append(CSS_OPTIONS, '%s', JSON.stringify(options))

  if (event === 'COMPLETE') {
    append(CSS_EVENT_COMPLETE, '%s', event)
  } else if (event === 'ERROR') {
    append(CSS_EVENT_ERROR, '%s', event)
  } else {
    append(CSS_EVENT_START, '%s', event)
  }

  append(CSS_ARGS, '%o', args)

  if (event === 'ERROR') append(null, '%o', error)
  if (result != null && result !== '') append(null, '%o', result)

  console.log(s, ...logParams)
}

const logging: Middleware = next => async (context, response, error) => {
  const { name, args, options, runId: id } = context
  log({ id, event: 'START', name, args, options })
  try {
    const r = await next(context, response, error)
    log({ id, event: 'COMPLETE', name, args, options, result: r })
    return r
  } catch (e) {
    log({ id, event: 'ERROR', name, args, options, error: e as any })
    throw e
  }
}

export default logging
