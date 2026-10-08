import { expect, test } from 'bun:test'
import { Window } from 'happy-dom'
import { createHappyDOMEnvironment } from './happy-dom-environment'

const objectDefinePropertyDescriptor = Object.getOwnPropertyDescriptor(Object, 'defineProperty')
if (!objectDefinePropertyDescriptor) throw new Error('Object.defineProperty descriptor is unavailable')

const GLOBAL_NAMES = [
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

function snapshotGlobals() {
  return new Map(GLOBAL_NAMES.map((name) => [name, Object.getOwnPropertyDescriptor(globalThis, name)]))
}

function restoreSnapshot(snapshot: Map<string, PropertyDescriptor | undefined>) {
  for (const [name, descriptor] of snapshot) {
    if (descriptor) Object.defineProperty(globalThis, name, descriptor)
    else Reflect.deleteProperty(globalThis, name)
  }
}

test('installs SVG and iframe constructors and bound animation-frame functions from its window realm', async () => {
  const snapshot = snapshotGlobals()
  const environment = await createHappyDOMEnvironment()

  try {
    expect(Object.is(globalThis.SVGElement, environment.window.SVGElement)).toBe(true)
    expect(Object.is(globalThis.HTMLIFrameElement, environment.window.HTMLIFrameElement)).toBe(true)
    expect(globalThis.requestAnimationFrame).not.toBe(environment.window.requestAnimationFrame)
    expect(globalThis.cancelAnimationFrame).not.toBe(environment.window.cancelAnimationFrame)
    const frame = globalThis.requestAnimationFrame(() => {})
    globalThis.cancelAnimationFrame(frame)
  } finally {
    await environment.dispose()
    restoreSnapshot(snapshot)
  }
})

test('installs keyboard, wheel, and input event constructors from its window realm', async () => {
  const snapshot = snapshotGlobals()
  const environment = await createHappyDOMEnvironment()

  try {
    expect(Object.is(globalThis.KeyboardEvent, environment.window.KeyboardEvent)).toBe(true)
    expect(Object.is(globalThis.WheelEvent, environment.window.WheelEvent)).toBe(true)
    expect(Object.is(globalThis.InputEvent, environment.window.InputEvent)).toBe(true)
  } finally {
    await environment.dispose()
    restoreSnapshot(snapshot)
  }
})

test('installs globals from its single window realm', async () => {
  const snapshot = snapshotGlobals()
  const environment = await createHappyDOMEnvironment()

  try {
    expect(Object.is(globalThis.window, environment.window)).toBe(true)
    expect(Object.is(globalThis.document, environment.window.document)).toBe(true)
    expect(Object.is(globalThis.Event, environment.window.Event)).toBe(true)
    expect(Object.is(globalThis.FormData, environment.window.FormData)).toBe(true)
    expect(Object.is(globalThis.Node, environment.window.Node)).toBe(true)
    expect(Object.getOwnPropertyDescriptor(globalThis, 'IS_REACT_ACT_ENVIRONMENT')?.value).toBe(true)
  } finally {
    await environment.dispose()
    restoreSnapshot(snapshot)
  }
})

test('restores pre-existing global descriptors exactly and removes globals that were absent', async () => {
  const snapshot = snapshotGlobals()
  const customEvent = { marker: true }

  try {
    Object.defineProperty(globalThis, 'Event', {
      configurable: true,
      enumerable: false,
      value: customEvent,
      writable: false
    })
    Reflect.deleteProperty(globalThis, 'document')

    const expectedEvent = Object.getOwnPropertyDescriptor(globalThis, 'Event')
    const environment = await createHappyDOMEnvironment()

    try {
      expect(Object.is(globalThis.Event, environment.window.Event)).toBe(true)
      expect(Object.is(globalThis.document, environment.window.document)).toBe(true)
    } finally {
      await environment.dispose()
    }

    expect(Object.getOwnPropertyDescriptor(globalThis, 'Event')).toEqual(expectedEvent)
    expect(Object.getOwnPropertyDescriptor(globalThis, 'document')).toBeUndefined()
  } finally {
    restoreSnapshot(snapshot)
  }
})

test('restores globals and closes the window when test work throws', async () => {
  const snapshot = snapshotGlobals()
  const environment = await createHappyDOMEnvironment()
  let error: unknown

  try {
    throw new Error('test failure')
  } catch (caught) {
    error = caught
  } finally {
    await environment.dispose()
  }

  expect(error).toEqual(new Error('test failure'))
  expect(environment.window.closed).toBe(true)
  expect(Object.getOwnPropertyDescriptor(globalThis, 'document')).toEqual(snapshot.get('document'))
  restoreSnapshot(snapshot)
})

test('retries disposal when the first window close fails', async () => {
  const snapshot = snapshotGlobals()
  const environment = await createHappyDOMEnvironment()
  const closeDescriptor = Object.getOwnPropertyDescriptor(environment.window.happyDOM, 'close')
  const originalClose = environment.window.happyDOM.close
  let attempts = 0

  try {
    Object.defineProperty(environment.window.happyDOM, 'close', {
      configurable: true,
      value: async () => {
        attempts += 1
        if (attempts === 1) throw new Error('close failed')
        await originalClose.call(environment.window.happyDOM)
      },
      writable: true
    })

    await expect(environment.dispose()).rejects.toThrow('close failed')
    await environment.dispose()
    await environment.dispose()

    expect(attempts).toBe(2)
    expect(environment.window.closed).toBe(true)
    expect(Object.getOwnPropertyDescriptor(globalThis, 'document')).toEqual(snapshot.get('document'))
  } finally {
    if (closeDescriptor) Object.defineProperty(environment.window.happyDOM, 'close', closeDescriptor)
    else Reflect.deleteProperty(environment.window.happyDOM, 'close')
    if (!environment.window.closed) await environment.dispose()
    restoreSnapshot(snapshot)
  }
})

test('attempts window close and retries failed descriptor restoration', async () => {
  const snapshot = snapshotGlobals()
  const environment = await createHappyDOMEnvironment()
  const priorEvent = snapshot.get('Event')
  const originalDefineProperty = Object.defineProperty
  let restorationFailed = false
  let closeAttempts = 0
  const closeDescriptor = Object.getOwnPropertyDescriptor(environment.window.happyDOM, 'close')
  const originalClose = environment.window.happyDOM.close

  try {
    Object.defineProperty(environment.window.happyDOM, 'close', {
      configurable: true,
      value: async () => {
        closeAttempts += 1
        await originalClose.call(environment.window.happyDOM)
      },
      writable: true
    })
    Object.defineProperty(Object, 'defineProperty', {
      ...objectDefinePropertyDescriptor,
      value: function defineProperty<T extends object>(target: T, propertyKey: PropertyKey, attributes: PropertyDescriptor): T {
        if (
          target === globalThis &&
          propertyKey === 'Event' &&
          attributes.value === priorEvent?.value &&
          attributes.enumerable === priorEvent?.enumerable &&
          attributes.configurable === priorEvent?.configurable &&
          attributes.writable === priorEvent?.writable &&
          !restorationFailed
        ) {
          restorationFailed = true
          throw new Error('descriptor restore failed')
        }
        return originalDefineProperty(target, propertyKey, attributes)
      }
    })

    await expect(environment.dispose()).rejects.toThrow('descriptor restore failed')
    expect(closeAttempts).toBe(1)
    expect(environment.window.closed).toBe(true)

    Reflect.defineProperty(Object, 'defineProperty', {
      ...objectDefinePropertyDescriptor,
      value: originalDefineProperty
    })
    await environment.dispose()
    expect(Object.getOwnPropertyDescriptor(globalThis, 'Event')).toEqual(priorEvent)
    expect(closeAttempts).toBe(1)
  } finally {
    Reflect.defineProperty(Object, 'defineProperty', {
      ...objectDefinePropertyDescriptor,
      value: originalDefineProperty
    })
    if (closeDescriptor) originalDefineProperty(environment.window.happyDOM, 'close', closeDescriptor)
    else Reflect.deleteProperty(environment.window.happyDOM, 'close')
    if (!environment.window.closed) await environment.dispose()
    restoreSnapshot(snapshot)
  }
})

test('rolls back a partial installation and closes its window when installation fails', async () => {
  const snapshot = snapshotGlobals()
  const originalDefineProperty = Object.defineProperty
  let createdWindow: Window | undefined
  let installationFailed = false

  try {
    Object.defineProperty(Object, 'defineProperty', {
      ...objectDefinePropertyDescriptor,
      value: function defineProperty<T extends object>(target: T, propertyKey: PropertyKey, attributes: PropertyDescriptor): T {
        if (target === globalThis && propertyKey === 'window' && attributes.value instanceof Window) createdWindow = attributes.value
        if (target === globalThis && propertyKey === 'Element' && attributes.value !== snapshot.get('Element')?.value && !installationFailed) {
          installationFailed = true
          throw new Error('installation failed')
        }
        return originalDefineProperty(target, propertyKey, attributes)
      }
    })

    await expect(createHappyDOMEnvironment()).rejects.toThrow('installation failed')
    expect(createdWindow?.closed).toBe(true)
    for (const name of GLOBAL_NAMES) {
      expect(Object.getOwnPropertyDescriptor(globalThis, name)).toEqual(snapshot.get(name))
    }
  } finally {
    Reflect.defineProperty(Object, 'defineProperty', {
      ...objectDefinePropertyDescriptor,
      value: originalDefineProperty
    })
    restoreSnapshot(snapshot)
  }
})
