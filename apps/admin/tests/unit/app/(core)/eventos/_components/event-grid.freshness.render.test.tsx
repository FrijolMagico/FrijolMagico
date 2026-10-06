import { afterAll, afterEach, beforeEach, expect, mock, test } from 'bun:test'
import { act, createElement } from 'react'
import type { Root } from 'react-dom/client'
import { Window } from 'happy-dom'
import type { Event } from '@/core/eventos/_schemas/event.schema'
import type { deleteEventAction } from '@/core/eventos/_actions/delete-event.action'

const testWindow = new Window()
const browserGlobalNames = [
  'window',
  'document',
  'Node',
  'HTMLElement',
  'Element',
  'Event',
  'IS_REACT_ACT_ENVIRONMENT'
] as const
const originalBrowserGlobalDescriptors = new Map(
  browserGlobalNames.map((name) => [name, Object.getOwnPropertyDescriptor(globalThis, name)])
)

for (const [name, value] of [
  ['window', testWindow],
  ['document', testWindow.document],
  ['Node', testWindow.Node],
  ['HTMLElement', testWindow.HTMLElement],
  ['Element', testWindow.Element],
  ['Event', testWindow.Event],
  ['IS_REACT_ACT_ENVIRONMENT', true]
] as const) {
  Object.defineProperty(globalThis, name, { configurable: true, value, writable: true })
}

const { createRoot } = await import('react-dom/client')
type DeleteResult = Awaited<ReturnType<typeof deleteEventAction>>
type DeleteAction = (id: number) => Promise<DeleteResult>
const action = mock<DeleteAction>(async () => ({ success: true }))
const successToast = mock((_message: string) => {})
const errorToast = mock((_message: string) => {})
const mountedRoots = new Set<Root>()
const originalConsoleError = console.error
const events = [
  { id: 21, organizacionId: null, nombre: 'Festival objetivo', slug: null, descripcion: null },
  { id: 22, organizacionId: 3, nombre: 'Festival restante', slug: 'festival-restante', descripcion: 'Descripción' }
] satisfies Event[]

mock.module('sonner', () => ({ toast: { success: successToast, error: errorToast } }))
mock.module('@/core/eventos/_actions/delete-event.action', () => ({ deleteEventAction: action }))
mock.module('@/core/eventos/_components/event-card', () => ({
  EventCard: ({ event, onDelete }: { event: Event; onDelete: (id: number) => void }) =>
    createElement(
      'article',
      { 'data-event-id': event.id },
      createElement('span', null, event.nombre),
      createElement('button', { onClick: () => onDelete(event.id) }, 'Eliminar')
    )
}))

const { EventGrid } = await import('@/core/eventos/_components/event-grid')

async function mountGrid() {
  const container = document.createElement('main')
  document.body.append(container)
  const root = createRoot(container)
  mountedRoots.add(root)
  await act(async () => root.render(createElement(EventGrid, { events })))
  return { container, root }
}

async function unmountGrid(root: Root, container: HTMLElement) {
  await act(async () => root.unmount())
  mountedRoots.delete(root)
  container.remove()
}

beforeEach(() => {
  action.mockReset()
  action.mockResolvedValue({ success: true })
  successToast.mockClear()
  errorToast.mockClear()
  console.error = mock(() => {})
})

test('shows the delayed-copy suffix only after successful SWR deletion', async () => {
  const { container, root } = await mountGrid()
  action.mockResolvedValue({ success: true, webRevalidation: 'swr' })

  await act(async () => container.querySelector('button')?.click())

  expect(action).toHaveBeenCalledTimes(1)
  expect(action).toHaveBeenCalledWith(21)
  expect(successToast).toHaveBeenCalledWith(
    'Evento eliminado exitosamente. Pueden tardar en aparecer en la web.'
  )
  expect(errorToast).not.toHaveBeenCalled()
  await unmountGrid(root, container)
})

for (const freshness of ['immediate', undefined] as const) {
  test(`keeps the original success copy for ${freshness ?? 'absent'} freshness`, async () => {
    const { container, root } = await mountGrid()
    action.mockResolvedValue({ success: true, ...(freshness ? { webRevalidation: freshness } : {}) })

    await act(async () => container.querySelector('button')?.click())

    expect(action).toHaveBeenCalledWith(21)
    expect(successToast).toHaveBeenCalledWith('Evento eliminado exitosamente')
    expect(errorToast).not.toHaveBeenCalled()
    await unmountGrid(root, container)
  })
}

test('does not show success or errors for a resolved failure carrying SWR metadata', async () => {
  const { container, root } = await mountGrid()
  action.mockResolvedValue({ success: false, webRevalidation: 'swr' })

  await act(async () => container.querySelector('button')?.click())

  expect(action).toHaveBeenCalledWith(21)
  expect(successToast).not.toHaveBeenCalled()
  expect(errorToast).not.toHaveBeenCalled()
  expect(console.error).not.toHaveBeenCalled()
  await unmountGrid(root, container)
})

test('preserves the generic error toast and logs the original rejected error', async () => {
  const { container, root } = await mountGrid()
  const rejection = new Error('deletion rejected')
  action.mockRejectedValue(rejection)

  await act(async () => container.querySelector('button')?.click())

  expect(action).toHaveBeenCalledWith(21)
  expect(successToast).not.toHaveBeenCalled()
  expect(errorToast).toHaveBeenCalledWith('Ocurrió un error al intentar eliminar el evento')
  expect(console.error).toHaveBeenCalledWith(rejection)
  await unmountGrid(root, container)
})

test('optimistically removes only the requested event while deletion is pending', async () => {
  const { container, root } = await mountGrid()
  let finishDeletion: (result: DeleteResult) => void = () => {}
  action.mockImplementation(
    () => new Promise((resolve) => { finishDeletion = resolve })
  )

  await act(async () => container.querySelector('button')?.click())

  expect(action).toHaveBeenCalledWith(21)
  expect(container.querySelector('[data-event-id="21"]')).toBeNull()
  expect(container.querySelector('[data-event-id="22"]')?.textContent).toBe('Festival restanteEliminar')

  await act(async () => finishDeletion({ success: true }))
  await unmountGrid(root, container)
})

afterEach(async () => {
  for (const root of mountedRoots) {
    await act(async () => root.unmount())
  }
  mountedRoots.clear()
  document.body.replaceChildren()
  console.error = originalConsoleError
})

afterAll(() => {
  mock.restore()
  for (const name of browserGlobalNames) {
    const descriptor = originalBrowserGlobalDescriptors.get(name)
    if (descriptor) Object.defineProperty(globalThis, name, descriptor)
    else Reflect.deleteProperty(globalThis, name)
  }
  testWindow.happyDOM.abort()
})
