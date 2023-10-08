import call from './call'
import end from './end'
import mock from './mock'
import { OpsContext } from './runningOps/Provider'

let middlewareStack: Middleware[] = [mock, call]

export type MiddlewareAction = (context: OpsContext, response: unknown, error?: Error | string) => Promise<unknown>

export type Middleware = (next: MiddlewareAction) => MiddlewareAction

export const compose = (...middlewares: Middleware[]): MiddlewareAction => {
  const empty: Middleware = arg => arg
  const middleware: Middleware = middlewares.reduce((sum: Middleware, current: Middleware): Middleware => {
    return (...args) => {
      return sum(current(...args))
    }
  }, empty)

  // Here, `undefined` is the value that is passed into `empty`, which essentially returns the first middleware
  return middleware(undefined as any)
}

let stack: MiddlewareAction
const buildStack = (): void => {
  stack = compose(...middlewareStack, end)
}

buildStack()

export const append = (middleware: Middleware): void => {
  middlewareStack = [...middlewareStack, middleware]
  buildStack()
}

export const prepend = (middleware: Middleware): void => {
  middlewareStack = [middleware, ...middlewareStack]
  buildStack()
}

export const set = (newStack: Middleware[]): void => {
  middlewareStack = newStack
  buildStack()
}

export type InvokeProps = Pick<OpsContext, 'options' | 'runId' | 'hookId'>

export type Invoke = ({ options, runId, hookId }: InvokeProps) => (name: OpsContext['name'], ...args: OpsContext['args']) => Promise<unknown>

export const invoke: Invoke = ({ options, runId, hookId }) =>
  async (name, ...args) =>
    await stack({ name, args, runId, hookId, options }, undefined, undefined)
