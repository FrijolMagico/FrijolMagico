import { Window } from 'happy-dom'

const GLOBALS = [
  'window',
  'document',
  'Node',
  'HTMLElement',
  'HTMLInputElement',
  'Element',
  'SVGElement',
  'HTMLIFrameElement',
  'Event',
  'KeyboardEvent',
  'WheelEvent',
  'InputEvent',
  'FormData',
  'requestAnimationFrame',
  'cancelAnimationFrame',
  'IS_REACT_ACT_ENVIRONMENT'
] as const

export interface HappyDOMEnvironment {
  window: Window
  dispose: () => Promise<void>
}

function restoreGlobals(descriptors: Map<string, PropertyDescriptor | undefined>): unknown[] {
  const errors: unknown[] = []

  for (const [name, descriptor] of descriptors) {
    try {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor)
      else if (!Reflect.deleteProperty(globalThis, name)) throw new TypeError(`Could not remove global ${name}`)
    } catch (error) {
      errors.push(error)
    }
  }

  return errors
}

function throwCleanupErrors(errors: unknown[], message: string): never {
  if (errors.length === 1) throw errors[0]
  throw new AggregateError(errors, message)
}

export async function createHappyDOMEnvironment(): Promise<HappyDOMEnvironment> {
  const window = new Window()
  const descriptors = new Map<string, PropertyDescriptor | undefined>(
    GLOBALS.map((name): [string, PropertyDescriptor | undefined] => [name, Object.getOwnPropertyDescriptor(globalThis, name)])
  )
  const globals: [string, unknown][] = [
    ['window', window],
    ['document', window.document],
    ['Node', window.Node],
    ['HTMLElement', window.HTMLElement],
    ['HTMLInputElement', window.HTMLInputElement],
    ['Element', window.Element],
    ['SVGElement', window.SVGElement],
    ['HTMLIFrameElement', window.HTMLIFrameElement],
    ['Event', window.Event],
    ['KeyboardEvent', window.KeyboardEvent],
    ['WheelEvent', window.WheelEvent],
    ['InputEvent', window.InputEvent],
    ['FormData', window.FormData],
    ['requestAnimationFrame', window.requestAnimationFrame.bind(window)],
    ['cancelAnimationFrame', window.cancelAnimationFrame.bind(window)],
    ['IS_REACT_ACT_ENVIRONMENT', true]
  ]

  try {
    for (const [name, value] of globals) {
      Object.defineProperty(globalThis, name, {
        configurable: true,
        enumerable: descriptors.get(name)?.enumerable ?? true,
        value,
        writable: true
      })
    }
  } catch (error) {
    const cleanupErrors = restoreGlobals(descriptors)
    try {
      await window.happyDOM.close()
    } catch (cleanupError) {
      cleanupErrors.push(cleanupError)
    }
    if (cleanupErrors.length > 0) {
      throwCleanupErrors([error, ...cleanupErrors], 'Happy DOM installation and rollback failed')
    }
    throw error
  }

  let globalsRestored = false
  let windowClosed = false
  return {
    window,
    dispose: async () => {
      if (globalsRestored && windowClosed) return

      const errors: unknown[] = []
      if (!globalsRestored) {
        const restorationErrors = restoreGlobals(descriptors)
        if (restorationErrors.length === 0) globalsRestored = true
        else errors.push(...restorationErrors)
      }
      if (!windowClosed) {
        try {
          await window.happyDOM.close()
          windowClosed = true
        } catch (error) {
          errors.push(error)
        }
      }
      if (errors.length > 0) throwCleanupErrors(errors, 'Happy DOM disposal failed')
    }
  }
}
