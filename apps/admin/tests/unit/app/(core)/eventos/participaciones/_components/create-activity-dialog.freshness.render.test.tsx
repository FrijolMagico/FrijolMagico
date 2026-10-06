import { afterAll, afterEach, expect, mock, test } from 'bun:test'
import { act, cloneElement, createElement, isValidElement } from 'react'
import { useController, type UseFormReturn } from 'react-hook-form'
import type { ActivityFormInput } from '@/core/eventos/participaciones/_schemas/activity.schema'
import type { Root } from 'react-dom/client'
import { Window } from 'happy-dom'
import type { ArtistLookup } from '@/core/eventos/participaciones/_types/participations.types'

const testWindow = new Window()
const browserGlobalNames = [
  'window', 'document', 'Node', 'HTMLElement', 'HTMLInputElement', 'Element', 'Event',
  'IS_REACT_ACT_ENVIRONMENT'
] as const
const originalBrowserGlobalDescriptors = new Map(
  browserGlobalNames.map((name) => [name, Object.getOwnPropertyDescriptor(globalThis, name)])
)
for (const [name, value] of [
  ['window', testWindow], ['document', testWindow.document], ['Node', testWindow.Node],
  ['HTMLElement', testWindow.HTMLElement], ['HTMLInputElement', testWindow.HTMLInputElement],
  ['Element', testWindow.Element], ['Event', testWindow.Event], ['IS_REACT_ACT_ENVIRONMENT', true]
] as const) {
  Object.defineProperty(globalThis, name, { configurable: true, value, writable: true })
}
const { createRoot } = await import('react-dom/client')

type SubmitFormProps = { onSubmit: (event: React.FormEvent<HTMLFormElement>) => void | Promise<void> }
const propagatedSubmitError: { current: Error | null } = { current: null }
function readPropagatedSubmitError(): Error | null { return propagatedSubmitError.current }
function isSubmitForm(value: React.ReactNode): value is React.ReactElement<SubmitFormProps> {
  return isValidElement<SubmitFormProps>(value) && value.type === 'form' && typeof value.props.onSubmit === 'function'
}

const calls: string[] = []
const successes: string[] = []
const errors: string[] = []
let actionResult: { success: boolean; webRevalidation?: 'swr' | 'immediate'; errors?: { message: string }[] } = { success: true, webRevalidation: 'swr' }
type CreateActivityInput = Parameters<typeof import('@/core/eventos/participaciones/_actions/activities/create-activity.action').createActivityAction>[0]
const createAction = mock(async (_input: CreateActivityInput) => actionResult)
mock.module('@/core/eventos/participaciones/_actions/activities/create-activity.action', () => ({ createActivityAction: createAction }))
mock.module('next/navigation', () => ({ useRouter: () => ({ refresh: () => calls.push('refresh') }) }))
mock.module('sonner', () => ({ toast: {
  success: (message: string) => { successes.push(message); calls.push(`toast:${message}`) },
  error: (message: string) => { errors.push(message); calls.push(`error:${message}`) }
} }))
mock.module('@/core/eventos/participaciones/_store/use-participations-store', () => ({
  useParticipationsStore: (selector: (state: Record<string, unknown>) => unknown) => selector({
    isCreateActivityDialogOpen: true,
    toggleCreateActivityDialogOpen: (open: boolean) => calls.push(`close:${open}`),
    selectedActivity: null, isUpdateActivityDialogOpen: false,
    closeUpdateDialogs: () => {}, setRemoveActivityDialogOpen: () => {}
  })
}))
mock.module('@/shared/components/entity-form/entity-form-dialog', () => ({
  EntityFormDialog: ({ children, submit }: { children: React.ReactNode; submit: { form: string } }) => createElement('section', null,
    isSubmitForm(children) ? cloneElement(children, { onSubmit: (event) => {
      const returned = children.props.onSubmit(event)
      if (returned instanceof Promise) return returned.catch((reason) => { if (reason instanceof Error) propagatedSubmitError.current = reason })
    } }) : children,
    createElement('button', { type: 'submit', form: submit.form }, 'Submit'))
}))
mock.module('@/shared/components/ui/select', () => ({
  Select: ({ children }: { children: React.ReactNode }) => createElement('div', null, children),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => createElement('div', null, children),
  SelectValue: ({ children }: { children: React.ReactNode }) => createElement('span', null, children),
  SelectContent: ({ children }: { children: React.ReactNode }) => createElement('div', null, children),
  SelectItem: ({ children }: { children: React.ReactNode }) => createElement('span', null, children)
}))
mock.module('@/shared/components/ui/field', () => ({
  Field: ({ children }: { children: React.ReactNode }) => createElement('div', null, children),
  FieldError: ({ children }: { children: React.ReactNode }) => createElement('span', null, children),
  FieldGroup: ({ children }: { children: React.ReactNode }) => createElement('div', null, children),
  FieldLabel: ({ children }: { children: React.ReactNode }) => createElement('label', null, children)
}))
mock.module('@/shared/components/controller-combobox', () => ({
  ControllerCombobox: ({ control, name }: { control: Parameters<typeof useController<ActivityFormInput>>[0]['control']; name: 'entity.artistaId' | 'entity.agrupacionId' | 'entity.bandaId' }) => {
    const { field } = useController<ActivityFormInput>({ control, name })
    return createElement('button', { type: 'button', onClick: () => field.onChange(5) }, 'Elegir artista')
  }
}))
for (const path of [
  '@/shared/components/ui/input', '@/shared/components/ui/textarea',
  '@/shared/components/rich-textarea', '@/shared/components/ui/separator',
  '@/shared/components/ui/switch', '@/shared/components/ui/button'
]) mock.module(path, () => ({ Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => createElement('input', props),
  Textarea: (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => createElement('textarea', props),
  RichTextarea: ({ value, onChange, ...props }: { value: string; onChange: (value: string) => void; id?: string; placeholder?: string }) => createElement('textarea', { ...props, value, onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => onChange(event.target.value) }),
  Separator: () => null, Switch: () => null, Button: ({ children }: { children: React.ReactNode }) => createElement('button', null, children)
}))
mock.module('@/core/eventos/participaciones/_components/activity-registration-fields', () => ({
  ActivityRegistrationFields: () => null,
  EMPTY_REGISTRATION: { url: '', startDate: '', startTime: '', endDate: '', endTime: '', registrationEnabled: false },
  clearRegistration: () => {}
}))
mock.module('@/core/eventos/participaciones/_components/activity-occurrence-fields', () => ({
  ActivityOccurrenceFields: ({ methods }: { methods: UseFormReturn<ActivityFormInput> }) => createElement('button', {
    type: 'button', onClick: () => methods.setValue('occurrences', [{ date: '2026-11-28', startTime: null, durationMinutes: null }], { shouldDirty: true, shouldValidate: true })
  }, 'Agregar fecha de prueba')
}))
mock.module('@/core/eventos/participaciones/_components/activity-presenter-fields', () => ({ ActivityPresenterFields: () => null }))
const artists = [{ id: 5, pseudonym: 'Sol', statusId: 1, pseudonyms: [{ id: 13, pseudonym: 'Sol', isPrimary: true }] }] satisfies ArtistLookup[]
const { CreateActivityDialog } = await import('@/core/eventos/participaciones/_components/create-activity-dialog')
const mountedRoots = new Set<Root>()

async function mount() {
  const container = document.createElement('main')
  document.body.append(container)
  const root = createRoot(container)
  mountedRoots.add(root)
  await act(async () => root.render(createElement(CreateActivityDialog, {
    edition: { id: 2, editionNumber: '2026', eventName: 'Festival' }, artistas: artists, agrupaciones: [], bandas: []
  })))
  const artist = container.querySelector<HTMLButtonElement>('button[type="button"]')
  await act(async () => artist?.click())
  const addOccurrence = Array.from(container.querySelectorAll<HTMLButtonElement>('button')).find((button) => button.textContent === 'Agregar fecha de prueba')
  await act(async () => addOccurrence?.click())
  const title = container.querySelector<HTMLInputElement>('[name="detail.titulo"]')
  if (!title) throw new Error('Missing activity title field')
  await act(async () => {
    Object.getOwnPropertyDescriptor(testWindow.HTMLInputElement.prototype, 'value')?.set?.call(title, 'Taller de prueba')
    title.dispatchEvent(new Event('input', { bubbles: true }))
    title.dispatchEvent(new Event('change', { bubbles: true }))
  })
  return { container, root }
}

async function submit(container: HTMLElement) {
  await act(async () => container.querySelector<HTMLFormElement>('form')?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })))
}


for (const [label, metadata, suffix] of [
  ['SWR', 'swr', ' Pueden tardar en aparecer en la web.'],
  ['inmediata', 'immediate', ''], ['ausente', undefined, '']
] as const) {
  test(`create confirms ${label} web freshness`, async () => {
    calls.length = 0; successes.length = 0; errors.length = 0
    createAction.mockClear()
    actionResult = { success: true, ...(metadata ? { webRevalidation: metadata } : {}) }
    const { container, root } = await mount()
    await submit(container)
    expect(createAction).toHaveBeenCalledTimes(1)
    expect(createAction).toHaveBeenCalledWith(expect.objectContaining({
      participation: { edicionId: 2, artistaId: 5, agrupacionId: null, bandaId: null, notas: '' },
      pseudonimoId: 13,
      activity: { tipoActividadId: 1, modoIngresoId: 1, notas: '', estado: 'seleccionado' },
      registration: expect.objectContaining({ registrationEnabled: false }),
      occurrences: [{ date: '2026-11-28', startTime: null, durationMinutes: null }],
      detail: expect.objectContaining({ titulo: 'Taller de prueba', descripcion: '', duracionMinutos: null })
    }))
    expect(successes).toEqual([`Actividad agregada correctamente${suffix}`])
    expect(errors).toEqual([])
    expect(calls.slice(-3)).toEqual([`toast:Actividad agregada correctamente${suffix}`, 'close:false', 'refresh'])
    expect(container.querySelector<HTMLInputElement>('[name="detail.titulo"]')?.value).toBe('')
    await act(async () => root.unmount()); mountedRoots.delete(root); container.remove()
  })
}

test('create failure does not toast success, close, or refresh', async () => {
  calls.length = 0; successes.length = 0; errors.length = 0
  createAction.mockClear()
  actionResult = { success: false, errors: [{ message: 'No se pudo crear' }] }
  const { container, root } = await mount()
  await submit(container)
  expect(successes).toEqual([])
  expect(errors).toEqual(['No se pudo crear'])
  expect(calls).not.toContain('close:false')
  expect(calls).not.toContain('refresh')
  expect(container.querySelector<HTMLInputElement>('[name="detail.titulo"]')?.value).toBe('Taller de prueba')
  await act(async () => root.unmount()); mountedRoots.delete(root); container.remove()
})

test('create rejection does not toast success, close, or refresh', async () => {
  calls.length = 0; successes.length = 0; errors.length = 0
  createAction.mockClear()
  propagatedSubmitError.current = null
  createAction.mockImplementationOnce(async () => { throw new Error('networkless rejection') })
  const { container, root } = await mount()
  await submit(container)
  await act(async () => Promise.resolve())
  expect(readPropagatedSubmitError()?.message).toBe('networkless rejection')
  expect(successes).toEqual([])
  expect(errors).toEqual([])
  expect(calls).not.toContain('close:false')
  expect(calls).not.toContain('refresh')
  expect(container.querySelector<HTMLInputElement>('[name="detail.titulo"]')?.value).toBe('Taller de prueba')
  await act(async () => root.unmount()); mountedRoots.delete(root); container.remove()
})

afterEach(async () => {
  for (const root of mountedRoots) await act(async () => root.unmount())
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
})
