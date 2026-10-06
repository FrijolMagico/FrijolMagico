import { afterAll, afterEach, beforeEach, expect, mock, test } from 'bun:test'
import { Component, act, createElement } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import type { Root } from 'react-dom/client'
import { Window } from 'happy-dom'
import type { PaginatedEdition } from '@/core/eventos/ediciones/_types/paginated-edition'
import type { EditionDay } from '@/core/eventos/ediciones/_schemas/edition-day.schema'
import type { Place } from '@/core/eventos/ediciones/_schemas/place.schema'
import type { EventoLookup } from '@/core/eventos/ediciones/_types'

type ActionResult = {
  success: boolean
  errors?: { message: string }[]
  webRevalidation?: 'swr' | 'immediate'
}
type DeleteEditionAction = (
  previousState: { success: boolean },
  payload: { id: number }
) => Promise<ActionResult>

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
const action = mock<DeleteEditionAction>(async () => ({ success: true }))
const successToast = mock((_message: string) => {})
const errorToast = mock((_message: string) => {})
const mountedRoots = new Set<Root>()
const edition = {
  id: 42,
  eventoId: 17,
  nombre: 'Edición de prueba',
  numeroEdicion: 'XXVI',
  slug: 'festival-xxvi',
  posterUrl: null,
  published: false,
  posterDisplayUrl: null,
  eventoNombre: 'Festival de prueba',
  dateRange: '12 sep 2026',
  firstDate: '2026-09-12',
  lugarNombre: null,
  modalidadLabel: null
} satisfies PaginatedEdition
const days = [] satisfies EditionDay[]
const places = [] satisfies Place[]
const events = [{ id: 17, nombre: 'Festival de prueba', slug: 'festival-de-prueba' }] satisfies EventoLookup[]

mock.module('sonner', () => ({ toast: { success: successToast, error: errorToast } }))
mock.module('@/core/eventos/ediciones/_actions/delete-edition.action', () => ({
  deleteEditionAction: action
}))
mock.module('@/shared/components/action-menu-button', () => ({
  ActionMenuButton: ({ onDelete }: { onDelete: () => void }) =>
    createElement('button', { onClick: onDelete }, 'Eliminar')
}))
mock.module('@/shared/components/confirmation-dialog', () => ({
  ConfirmationDialog: ({ open, onConfirm }: { open: boolean; onConfirm: () => void }) =>
    open
    ? createPortal(
        createElement('button', { 'data-testid': 'confirm-delete', onClick: onConfirm }, 'Confirmar'),
        document.body
      )
    : null
}))
mock.module('@/core/eventos/_components/edition-publication-switch', () => ({
  EditionPublicationSwitch: () => null
}))
mock.module('@/core/eventos/ediciones/_components/poster-preview', () => ({ PosterPreview: () => null }))
mock.module('@/core/eventos/ediciones/_components/poster-thumbnail', () => ({ PosterThumbnail: () => null }))

const { EditionRow } = await import('@/core/eventos/ediciones/_components/edition-row')

class ActionErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error) {
    caughtActionRejections.push(error)
  }

  render() {
    return this.state.error !== null ? null : this.props.children
  }
}

const caughtActionRejections: unknown[] = []

async function mountRow() {
  const container = document.createElement('table')
  document.body.append(container)
  const root = createRoot(container)
  mountedRoots.add(root)
  await act(async () => root.render(createElement(ActionErrorBoundary, null,
    createElement('tbody', null, createElement(EditionRow, { edition, days, places, events }))
  )))
  return { container, root }
}

async function openConfirmation(container: HTMLElement) {
  const deleteButton = container.querySelector('button')
  if (!deleteButton) throw new Error('Missing delete menu button')
  await act(async () => deleteButton.click())
  expect(document.querySelector('[data-testid="confirm-delete"]')).not.toBeNull()
  expect(action).not.toHaveBeenCalled()
}

async function confirmDeletion(container: HTMLElement) {
  const confirmButton = document.querySelector<HTMLButtonElement>('[data-testid="confirm-delete"]')
  if (!confirmButton) throw new Error('Missing confirmation button')
  await act(async () => {
    confirmButton.click()
    await Promise.resolve()
    await Promise.resolve()
  })
}

async function unmountRow(root: Root, container: HTMLElement) {
  await act(async () => root.unmount())
  mountedRoots.delete(root)
  container.remove()
}

beforeEach(() => {
  action.mockReset()
  action.mockResolvedValue({ success: true })
  successToast.mockClear()
  errorToast.mockClear()
  caughtActionRejections.length = 0
})

for (const freshness of ['swr', 'immediate', undefined] as const) {
  test(`keeps deletion copy for successful ${freshness ?? 'absent'} freshness`, async () => {
    const { container, root } = await mountRow()
    action.mockResolvedValue({ success: true, ...(freshness ? { webRevalidation: freshness } : {}) })

    await openConfirmation(container)
    await confirmDeletion(container)

    expect(action).toHaveBeenCalledTimes(1)
    expect(action).toHaveBeenCalledWith({ success: false }, { id: 42 })
    expect(successToast).toHaveBeenCalledWith(
      freshness === 'swr'
        ? 'Edición eliminada. Pueden tardar en aparecer en la web.'
        : 'Edición eliminada'
    )
    expect(errorToast).not.toHaveBeenCalled()
    await unmountRow(root, container)
  })
}

test('keeps the existing success toast when failure has no errors', async () => {
  const { container, root } = await mountRow()
  action.mockResolvedValue({ success: false, webRevalidation: 'swr' })

  await openConfirmation(container)
  await confirmDeletion(container)

  expect(action).toHaveBeenCalledWith({ success: false }, { id: 42 })
  expect(successToast).toHaveBeenCalledWith('Edición eliminada')
  expect(errorToast).not.toHaveBeenCalled()
  await unmountRow(root, container)
})

test('shows action errors without success', async () => {
  const { container, root } = await mountRow()
  action.mockResolvedValue({ success: false, errors: [{ message: 'No se pudo eliminar' }] })

  await openConfirmation(container)
  await confirmDeletion(container)

  expect(successToast).not.toHaveBeenCalled()
  expect(errorToast).toHaveBeenCalledWith('No se pudo eliminar')
  await unmountRow(root, container)
})

test('observes rejected action through the real transition error boundary', async () => {
  const rejection = new Error('action rejected')
  const { container, root } = await mountRow()
  action.mockRejectedValue(rejection)

  await openConfirmation(container)
  await confirmDeletion(container)

  expect(successToast).not.toHaveBeenCalled()
  expect(errorToast).not.toHaveBeenCalled()
  expect(caughtActionRejections).toContain(rejection)
  await unmountRow(root, container)
})

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
    if (descriptor) Object.defineProperty(globalThis, name, descriptor)
    else Reflect.deleteProperty(globalThis, name)
  }
  testWindow.happyDOM.abort()
})
