import { afterAll, afterEach, expect, mock, test } from 'bun:test'
import { act, cloneElement, createElement, isValidElement } from 'react'
import { useController } from 'react-hook-form'
import type { Root } from 'react-dom/client'
import { Window } from 'happy-dom'
import type { ActionState } from '@/shared/types/actions'
import type { ExhibitionFormInput } from '@/core/eventos/participaciones/_schemas/exhibition.schema'
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
let actionResult: ActionState = { success: true, webRevalidation: 'swr' }
type CreateExhibitionInput = Parameters<typeof import('@/core/eventos/participaciones/_actions/exhibitions/create-exhibition.action').createExhibitionAction>[0]
const createAction = mock(async (_input: CreateExhibitionInput): Promise<ActionState> => actionResult)
mock.module('@/core/eventos/participaciones/_actions/exhibitions/create-exhibition.action', () => ({ createExhibitionAction: createAction }))
mock.module('sonner', () => ({ toast: {
  success: (message: string) => { successes.push(message); calls.push(`toast:${message}`) },
  error: (message: string) => { errors.push(message); calls.push(`error:${message}`) }
} }))
mock.module('@/core/eventos/participaciones/_store/use-participations-store', () => ({
  useParticipationsStore: (selector: (state: Record<string, unknown>) => unknown) => selector({
    isCreateExhibitionDialogOpen: true,
    toggleCreateExhibitionDialogOpen: (open: boolean) => calls.push(`close:${open}`)
  })
}))
mock.module('@/shared/components/entity-form/entity-form-dialog', () => ({
  EntityFormDialog: ({ children, submit }: { children: React.ReactNode; submit: { form: string } }) => createElement('section', null,
    isSubmitForm(children) ? cloneElement(children, { onSubmit: (event) => {
      const returned = children.props.onSubmit(event)
      if (returned instanceof Promise) return returned.catch((reason) => {
        if (reason instanceof Error) propagatedSubmitError.current = reason
      })
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
  FieldLabel: ({ children }: { children: React.ReactNode }) => createElement('label', null, children)
}))
mock.module('@/shared/components/controller-combobox', () => ({
  ControllerCombobox: ({ control, name }: {
    control: Parameters<typeof useController<ExhibitionFormInput>>[0]['control']
    name: 'entity.artistaId' | 'entity.agrupacionId'
  }) => {
    const { field } = useController<ExhibitionFormInput>({ control, name })
    return createElement('button', { type: 'button', onClick: () => field.onChange(5) }, 'Elegir artista')
  }
}))
mock.module('@/shared/components/ui/textarea', () => ({
  Textarea: (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => createElement('textarea', props)
}))
const artists = [{
  id: 5, pseudonym: 'Sol', statusId: 1,
  pseudonyms: [{ id: 13, pseudonym: 'Sol', isPrimary: true }]
}] satisfies ArtistLookup[]
const { CreateExhibitionDialog } = await import('@/core/eventos/participaciones/_components/create-exhibition-dialog')
const mountedRoots = new Set<Root>()

async function mount() {
  const container = document.createElement('main')
  document.body.append(container)
  const root = createRoot(container)
  mountedRoots.add(root)
  await act(async () => root.render(createElement(CreateExhibitionDialog, {
    edition: { id: 2, editionNumber: '2026', eventName: 'Festival' }, artistas: artists, agrupaciones: []
  })))
  const artist = container.querySelector<HTMLButtonElement>('button[type="button"]')
  await act(async () => artist?.click())
  const notes = container.querySelector<HTMLTextAreaElement>('#exhibition-notes')
  if (!notes) throw new Error('Missing exhibition notes field')
  await act(async () => {
    Object.getOwnPropertyDescriptor(testWindow.HTMLTextAreaElement.prototype, 'value')?.set?.call(notes, 'Nota de prueba')
    notes.dispatchEvent(new Event('input', { bubbles: true }))
    notes.dispatchEvent(new Event('change', { bubbles: true }))
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
  test(`create exhibition confirms ${label} web freshness`, async () => {
    calls.length = 0; successes.length = 0; errors.length = 0; createAction.mockClear()
    actionResult = { success: true, ...(metadata ? { webRevalidation: metadata } : {}) }
    const { container, root } = await mount()
    await submit(container)
    expect(createAction).toHaveBeenCalledTimes(1)
    expect(createAction).toHaveBeenCalledWith({
      participation: { edicionId: 2, artistaId: 5, agrupacionId: null },
      exhibition: { disciplinaId: 1, modoIngresoId: 1, estado: 'seleccionado', notas: 'Nota de prueba', pseudonimoId: 13 }
    })
    expect(successes).toEqual([`Expositor agregado correctamente${suffix}`])
    expect(errors).toEqual([])
    expect(calls.slice(-2)).toEqual([`toast:Expositor agregado correctamente${suffix}`, 'close:false'])
    expect(container.querySelector<HTMLTextAreaElement>('#exhibition-notes')?.value).toBe('')
    await act(async () => root.unmount()); mountedRoots.delete(root); container.remove()
  })
}

test('create exhibition failure preserves errors and leaves form open and unchanged', async () => {
  calls.length = 0; successes.length = 0; errors.length = 0; createAction.mockClear()
  actionResult = { success: false, errors: [{ entityType: 'participacion', message: 'No se pudo crear' }] }
  const { container, root } = await mount()
  await submit(container)
  expect(successes).toEqual([])
  expect(errors).toEqual(['No se pudo crear'])
  expect(calls).not.toContain('close:false')
  expect(container.querySelector<HTMLTextAreaElement>('#exhibition-notes')?.value).toBe('Nota de prueba')
  await act(async () => root.unmount()); mountedRoots.delete(root); container.remove()
})

test('create exhibition rejection propagates and leaves form open and unchanged', async () => {
  calls.length = 0; successes.length = 0; errors.length = 0; createAction.mockClear()
  propagatedSubmitError.current = null
  createAction.mockImplementationOnce(async () => { throw new Error('networkless rejection') })
  const { container, root } = await mount()
  await submit(container)
  await act(async () => Promise.resolve())
  expect(readPropagatedSubmitError()?.message).toBe('networkless rejection')
  expect(successes).toEqual([])
  expect(errors).toEqual([])
  expect(calls).not.toContain('close:false')
  expect(container.querySelector<HTMLTextAreaElement>('#exhibition-notes')?.value).toBe('Nota de prueba')
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
