import { expect, mock, test } from 'bun:test'
import { act, createElement, useState } from 'react'
import { useController } from 'react-hook-form'
import { Window } from 'happy-dom'
import type { ActivityFormInput } from '@/core/eventos/participaciones/_schemas/activity.schema'

const window = new Window()
globalThis.window = window as unknown as Window & typeof globalThis
globalThis.document = window.document as unknown as Document
globalThis.Node = window.Node as typeof Node
globalThis.HTMLElement = window.HTMLElement as typeof HTMLElement
globalThis.HTMLInputElement = window.HTMLInputElement as typeof HTMLInputElement
globalThis.Element = window.Element as typeof Element
globalThis.Event = window.Event as typeof Event
globalThis.IS_REACT_ACT_ENVIRONMENT = true
const { createRoot } = await import('react-dom/client')

const formatted = '<p><strong>Bold</strong> <em>italic</em> <a href="https://example.org">link</a></p><ul><li><p>Item</p></li></ul>'

// Model the editor's initial-content behavior: value changes alone do not replace its document.
mock.module('@/shared/components/rich-textarea', () => ({
  RichTextarea: ({ id, value, onChange }: { id: string; value: string; onChange: (value: string) => void }) => {
    const [initialValue] = useState(value)
    return createElement('div', { id, 'data-initial-html': initialValue },
      createElement('button', { type: 'button', onClick: () => onChange(formatted) }, 'Format description'))
  }
}))
mock.module('@/shared/components/entity-form/entity-form-dialog', () => ({
  EntityFormDialog: ({ children }: { children: React.ReactNode }) =>
    createElement('section', null, children)
}))
mock.module('next/navigation', () => ({ useRouter: () => ({ refresh: () => {} }) }))
let selectedActivity: Record<string, unknown> | null = null
mock.module('@/core/eventos/participaciones/_store/use-participations-store', () => ({
  useParticipationsStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      isCreateActivityDialogOpen: true,
      toggleCreateActivityDialogOpen: () => {},
      selectedActivity,
      isUpdateActivityDialogOpen: true,
      closeUpdateDialogs: () => {},
      setRemoveActivityDialogOpen: () => {}
    })
}))
mock.module('@/shared/components/ui/select', () => ({
  Select: ({ children }: { children: React.ReactNode }) => createElement('div', null, children),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => createElement('div', null, children),
  SelectValue: ({ children }: { children: React.ReactNode }) => createElement('span', null, children),
  SelectContent: ({ children }: { children: React.ReactNode }) => createElement('div', null, children),
  SelectItem: ({ children }: { children: React.ReactNode }) => createElement('span', null, children)
}))
mock.module('@/shared/components/controller-combobox', () => ({
  ControllerCombobox: ({ name, control }: {
    name: 'entity.artistaId' | 'entity.agrupacionId' | 'entity.bandaId'
    control: Parameters<typeof useController<ActivityFormInput>>[0]['control']
  }) => {
    const { field } = useController({ name, control })
    return createElement('button', { type: 'button', onClick: () => field.onChange(5) }, 'Choose artist')
  }
}))
const createAction = mock(async (_payload: unknown) => ({ success: true }))
const updateAction = mock(async (_payload: unknown) => ({ success: true }))
mock.module('@/core/eventos/participaciones/_actions/activities/create-activity.action', () => ({ createActivityAction: createAction }))
mock.module('@/core/eventos/participaciones/_actions/activities/update-activity-aggregate.action', () => ({ updateActivityAggregateAction: updateAction }))

const edition = { id: 1, editionNumber: '2026', eventName: 'Festival' }

async function submit(container: HTMLElement) {
  await act(async () => {
    container.querySelector('form')?.dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true }))
  })
}

async function mount(element: React.ReactElement) {
  const container = document.createElement('main')
  document.body.append(container)
  const root = createRoot(container)
  await act(async () => root.render(element))
  return { container, root }
}

test('creation sends editor HTML through RHF and clears the editor after success', async () => {
  createAction.mockClear()
  const { CreateActivityDialog } = await import('@/core/eventos/participaciones/_components/create-activity-dialog')
  const { container, root } = await mount(createElement(CreateActivityDialog, {
    edition, artistas: [], agrupaciones: [], bandas: []
  }))
  await act(async () => container.querySelector<HTMLButtonElement>('#create-activity-description button')?.click())
  await act(async () => Array.from(container.querySelectorAll<HTMLButtonElement>('button'))
    .find((button) => button.textContent === 'Choose artist')?.click())
  const title = container.querySelector<HTMLInputElement>('[name="detail.titulo"]')
  if (!title) throw new Error('Missing activity title')
  await act(async () => {
    Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set?.call(title, 'Taller')
    title.dispatchEvent(new window.Event('input', { bubbles: true }))
    title.dispatchEvent(new window.Event('change', { bubbles: true }))
  })
  await submit(container)
  expect(createAction).toHaveBeenCalledWith(expect.objectContaining({
    detail: expect.objectContaining({ descripcion: formatted })
  }))
  expect(container.querySelector('#create-activity-description')?.getAttribute('data-initial-html')).toBe('')
  await act(async () => root.unmount())
  container.remove()
})

test('editing loads persisted HTML, saves edits and reloads a different activity', async () => {
  updateAction.mockClear()
  const persisted = '<p><strong>Original</strong></p>'
  const activity = (id: number, descripcion: string) => ({
    entity: { artist: { id: 5, pseudonym: 'Sol' }, collective: null, band: null },
    activity: {
      id, participacionId: 3, tipoActividadId: 1, modoIngresoId: 1,
      notas: '', estado: 'completado', puntaje: null, registration: null,
      detail: { id: 4, titulo: 'Taller', descripcion, duracionMinutos: null,
        cupos: null, horaInicio: '', ubicacion: '' }
    }
  })
  selectedActivity = activity(7, persisted)
  const { UpdateActivityDialog } = await import('@/core/eventos/participaciones/_components/update-activity-dialog')
  const { container, root } = await mount(createElement(UpdateActivityDialog, { edition }))
  expect(container.querySelector('#detalle-descripcion-4')?.getAttribute('data-initial-html')).toBe(persisted)
  await act(async () => container.querySelector<HTMLButtonElement>('#detalle-descripcion-4 button')?.click())
  await submit(container)
  expect(updateAction).toHaveBeenCalledWith(expect.objectContaining({
    detail: expect.objectContaining({ descripcion: formatted })
  }))
  selectedActivity = activity(8, '<p><em>Reloaded</em></p>')
  await act(async () => root.render(createElement(UpdateActivityDialog, { edition })))
  expect(container.querySelector('#detalle-descripcion-4')?.getAttribute('data-initial-html')).toBe('<p><em>Reloaded</em></p>')
  selectedActivity = activity(8, '<p><strong>Refreshed</strong></p>')
  await act(async () => root.render(createElement(UpdateActivityDialog, { edition })))
  expect(container.querySelector('#detalle-descripcion-4')?.getAttribute('data-initial-html')).toBe('<p><strong>Refreshed</strong></p>')
  await submit(container)
  expect(updateAction).toHaveBeenLastCalledWith(expect.objectContaining({
    detail: expect.objectContaining({ descripcion: '<p><strong>Refreshed</strong></p>' })
  }))
  await act(async () => root.unmount())
  container.remove()
  selectedActivity = null
})
