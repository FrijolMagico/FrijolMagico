import { afterAll, afterEach, expect, mock, test } from 'bun:test'
import { act, createElement } from 'react'
import type { Root } from 'react-dom/client'
import { Window } from 'happy-dom'

const testWindow = new Window()
const browserGlobalNames = [
  'window',
  'document',
  'Node',
  'HTMLElement',
  'HTMLInputElement',
  'Element',
  'Event',
  'IS_REACT_ACT_ENVIRONMENT'
] as const
const originalBrowserGlobalDescriptors = new Map(
  browserGlobalNames.map((name) => [name, Object.getOwnPropertyDescriptor(globalThis, name)])
)

Object.defineProperty(globalThis, 'window', { configurable: true, value: testWindow, writable: true })
Object.defineProperty(globalThis, 'document', { configurable: true, value: testWindow.document, writable: true })
Object.defineProperty(globalThis, 'Node', { configurable: true, value: testWindow.Node, writable: true })
Object.defineProperty(globalThis, 'HTMLElement', { configurable: true, value: testWindow.HTMLElement, writable: true })
Object.defineProperty(globalThis, 'HTMLInputElement', { configurable: true, value: testWindow.HTMLInputElement, writable: true })
Object.defineProperty(globalThis, 'Element', { configurable: true, value: testWindow.Element, writable: true })
Object.defineProperty(globalThis, 'Event', { configurable: true, value: testWindow.Event, writable: true })
Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { configurable: true, value: true, writable: true })

const { createRoot } = await import('react-dom/client')

type ActionResult = {
  success: boolean
  errors?: { message: string }[]
  webRevalidation?: 'swr' | 'immediate'
}

type EventActionData = {
  id?: number
  nombre: string
  descripcion: string | null
  organizacionId: number
  slug: string
}

const createAction = mock(async (
  _previousState: { success: boolean },
  _data: EventActionData
): Promise<ActionResult> => ({ success: true }))
const updateAction = mock(async (
  _previousState: { success: boolean },
  _data: EventActionData
): Promise<ActionResult> => ({ success: true }))
const successToast = mock((_message: string) => {})
const errorToast = mock((_message: string) => {})
let createOpenChanges: boolean[] = []
let updateCloseCount = 0
const mountedRoots = new Set<Root>()

mock.module('sonner', () => ({
  toast: { success: successToast, error: errorToast }
}))
mock.module('@/core/eventos/_actions/create-event.action', () => ({
  createEventAction: createAction
}))
mock.module('@/core/eventos/_actions/update-event.action', () => ({
  updateEventAction: updateAction
}))
mock.module('@/core/eventos/_store/event-dialog-store', () => ({
  useEventDialog: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      isCreateEventOpen: true,
      isUpdateEventOpen: true,
      selectedEvent: { id: 12, nombre: 'Festival actual', descripcion: null },
      toggleCreateEventDialog: (open: boolean) => createOpenChanges.push(open),
      closeUpdateEventDialog: () => { updateCloseCount += 1 }
    })
}))
mock.module('@/shared/components/entity-form/entity-form-dialog', () => ({
  EntityFormDialog: ({ children }: { children: React.ReactNode }) =>
    createElement('section', null, children)
}))
mock.module('@/shared/components/ui/field', () => ({
  Field: ({ children }: { children: React.ReactNode }) => createElement('div', null, children),
  FieldError: ({ children }: { children: React.ReactNode }) => createElement('div', null, children),
  FieldGroup: ({ children }: { children: React.ReactNode }) => createElement('div', null, children),
  FieldLabel: ({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) =>
    createElement('label', { htmlFor }, children)
}))
mock.module('@/shared/components/ui/input', () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => createElement('input', props)
}))
mock.module('@/shared/components/ui/textarea', () => ({
  Textarea: (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => createElement('textarea', props)
}))

const dialogKinds = ['create', 'update'] as const
type DialogKind = typeof dialogKinds[number]
type DialogComponent =
  | typeof import('@/core/eventos/_components/create-event-dialog').CreateEventDialog
  | typeof import('@/core/eventos/_components/update-event-dialog').UpdateEventDialog

async function mountDialog(kind: DialogKind) {
  let component: DialogComponent
  if (kind === 'create') {
    const dialogModule = await import('@/core/eventos/_components/create-event-dialog')
    component = dialogModule.CreateEventDialog
  } else {
    const dialogModule = await import('@/core/eventos/_components/update-event-dialog')
    component = dialogModule.UpdateEventDialog
  }

  const container = document.createElement('main')
  document.body.append(container)
  const root = createRoot(container)
  mountedRoots.add(root)
  await act(async () => root.render(createElement(component)))
  return { container, root }
}

async function submit(container: HTMLElement, name: string) {
  const input = container.querySelector<HTMLInputElement>('[name="nombre"]')
  if (!input) throw new Error('Missing event name input')
  await act(async () => {
    Object.getOwnPropertyDescriptor(testWindow.HTMLInputElement.prototype, 'value')?.set?.call(input, name)
    input.dispatchEvent(new Event('input', { bubbles: true }))
    input.dispatchEvent(new Event('change', { bubbles: true }))
  })
  await act(async () => {
    container.querySelector('form')?.dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true })
    )
  })
}

async function unmountDialog(root: Root, container: HTMLElement) {
  await act(async () => root.unmount())
  mountedRoots.delete(root)
  container.remove()
}

async function runSuccessScenario(
  kind: DialogKind,
  freshness: 'swr' | 'immediate' | undefined
) {
  createAction.mockClear()
  updateAction.mockClear()
  successToast.mockClear()
  errorToast.mockClear()
  createOpenChanges = []
  updateCloseCount = 0
  const result: ActionResult = { success: true }
  if (freshness) result.webRevalidation = freshness
  ;(kind === 'create' ? createAction : updateAction).mockResolvedValue(result)

  const { container, root } = await mountDialog(kind)
  await submit(container, 'Nuevo evento')

  const action = kind === 'create' ? createAction : updateAction
  expect(action).toHaveBeenCalledTimes(1)
  expect(action).toHaveBeenCalledWith(
    { success: false },
    expect.objectContaining({ nombre: 'Nuevo evento', slug: 'nuevo-evento' })
  )
  const original = kind === 'create'
    ? 'Evento creado exitósamente'
    : 'Evento actualizado exitósamente'
  const expected = freshness === 'swr'
    ? `${original}. Pueden tardar en aparecer en la web.`
    : original
  expect(successToast).toHaveBeenCalledWith(expected)
  expect(errorToast).not.toHaveBeenCalled()
  expect(kind === 'create' ? createOpenChanges : updateCloseCount).toEqual(
    kind === 'create' ? [false] : 1
  )
  expect(container.querySelector<HTMLInputElement>('[name="nombre"]')?.value).toBe(
    kind === 'create' ? '' : 'Festival actual'
  )

  await unmountDialog(root, container)
}

async function runFailureScenario(kind: DialogKind) {
  createAction.mockClear()
  updateAction.mockClear()
  successToast.mockClear()
  errorToast.mockClear()
  createOpenChanges = []
  updateCloseCount = 0
  const result: ActionResult = {
    success: false,
    errors: [{ message: 'No se pudo guardar' }],
    webRevalidation: 'swr'
  }
  ;(kind === 'create' ? createAction : updateAction).mockResolvedValue(result)

  const { container, root } = await mountDialog(kind)
  await submit(container, 'Nuevo evento')

  const action = kind === 'create' ? createAction : updateAction
  expect(action).toHaveBeenCalledTimes(1)
  expect(action).toHaveBeenCalledWith(
    { success: false },
    expect.objectContaining({ nombre: 'Nuevo evento', slug: 'nuevo-evento' })
  )
  expect(successToast).not.toHaveBeenCalled()
  expect(errorToast).toHaveBeenCalledWith('No se pudo guardar')
  expect(kind === 'create' ? createOpenChanges : updateCloseCount).toEqual(
    kind === 'create' ? [] : 0
  )
  expect(container.querySelector<HTMLInputElement>('[name="nombre"]')?.value).toBe(
    kind === 'create' ? '' : 'Festival actual'
  )

  await unmountDialog(root, container)
}

for (const kind of dialogKinds) {
  for (const freshness of ['swr', 'immediate', undefined] as const) {
    test(`${kind} dialog keeps its success copy for ${freshness ?? 'absent'} freshness`, async () => {
      await runSuccessScenario(kind, freshness)
    })
  }

  test(`${kind} dialog preserves failure handling when freshness is SWR`, async () => {
    await runFailureScenario(kind)
  })
}

afterEach(async () => {
  for (const root of mountedRoots) {
    await act(async () => root.unmount())
  }
  mountedRoots.clear()
  document.body.replaceChildren()
})

afterAll(() => {
  mock.restore()
  for (const name of browserGlobalNames) {
    const descriptor = originalBrowserGlobalDescriptors.get(name)
    if (descriptor) {
      Object.defineProperty(globalThis, name, descriptor)
    } else {
      Reflect.deleteProperty(globalThis, name)
    }
  }
})
