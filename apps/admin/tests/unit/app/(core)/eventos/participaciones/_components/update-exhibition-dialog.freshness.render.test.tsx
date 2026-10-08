import { afterAll, afterEach, expect, mock, test } from 'bun:test'
import { act, cloneElement, createElement, isValidElement } from 'react'
import { useController } from 'react-hook-form'
import type { Root } from 'react-dom/client'
import { Window } from 'happy-dom'
import type { ActionState } from '@/shared/types/actions'
import type { ExhibitionFormInput } from '@/core/eventos/participaciones/_schemas/exhibition.schema'
import type { ExhibitionLookup, ParticipantEntity } from '@/core/eventos/participaciones/_types/participations.types'

const testWindow = new Window()
const browserGlobalNames = [
  'window', 'document', 'Node', 'HTMLElement', 'HTMLInputElement', 'HTMLTextAreaElement',
  'Element', 'Event', 'IS_REACT_ACT_ENVIRONMENT'
] as const
const originalBrowserGlobalDescriptors = new Map(
  browserGlobalNames.map((name) => [name, Object.getOwnPropertyDescriptor(globalThis, name)])
)
for (const [name, value] of [
  ['window', testWindow], ['document', testWindow.document], ['Node', testWindow.Node],
  ['HTMLElement', testWindow.HTMLElement], ['HTMLInputElement', testWindow.HTMLInputElement],
  ['HTMLTextAreaElement', testWindow.HTMLTextAreaElement], ['Element', testWindow.Element],
  ['Event', testWindow.Event], ['IS_REACT_ACT_ENVIRONMENT', true]
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
let participationResult: ActionState = { success: true }
let exhibitionResult: ActionState = { success: true, webRevalidation: 'swr' }
type ParticipationInput = Parameters<typeof import('@/core/eventos/participaciones/_actions/participations/update-participation.action').updateParticipationAction>[0]
type ExhibitionInput = Parameters<typeof import('@/core/eventos/participaciones/_actions/exhibitions/update-exhibition.action').updateExhibitionAction>[0]
const participationAction = mock(async (_input: ParticipationInput): Promise<ActionState> => participationResult)
const exhibitionAction = mock(async (_input: ExhibitionInput): Promise<ActionState> => exhibitionResult)
mock.module('@/core/eventos/participaciones/_actions/participations/update-participation.action', () => ({ updateParticipationAction: participationAction }))
mock.module('@/core/eventos/participaciones/_actions/exhibitions/update-exhibition.action', () => ({ updateExhibitionAction: exhibitionAction }))
mock.module('sonner', () => ({ toast: {
  success: (message: string) => { successes.push(message); calls.push(`toast:${message}`) },
  error: (message: string) => { errors.push(message); calls.push(`error:${message}`) }
} }))
const entity = {
  artist: { id: 5, pseudonym: 'Sol', statusId: 1, pseudonyms: [{ id: 13, pseudonym: 'Sol', isPrimary: true }] },
  collective: null,
  band: null
} satisfies ParticipantEntity
const exhibition = {
  id: 42,
  participacionId: 7,
  disciplinaId: 1,
  artistaId: 5,
  pseudonimoId: 13,
  modoIngresoId: 1,
  puntaje: null,
  estado: 'seleccionado',
  notas: 'Original'
} satisfies ExhibitionLookup
mock.module('@/core/eventos/participaciones/_store/use-participations-store', () => ({
  useParticipationsStore: (selector: (state: Record<string, unknown>) => unknown) => selector({
    selectedExhibition: { entity, exhibition },
    isUpdateExhibitionDialogOpen: true,
    closeUpdateDialogs: () => calls.push('close'),
    setRemoveExhibitionDialogOpen: () => calls.push('remove')
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
  FieldGroup: ({ children }: { children: React.ReactNode }) => createElement('div', null, children),
  FieldLabel: ({ children }: { children: React.ReactNode }) => createElement('label', null, children)
}))
mock.module('@/shared/components/ui/button', () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => createElement('button', props, children)
}))
mock.module('@/shared/components/ui/textarea', () => ({
  Textarea: (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => createElement('textarea', props)
}))
const { UpdateExhibitionDialog } = await import('@/core/eventos/participaciones/_components/update-exhibition-dialog')
const mountedRoots = new Set<Root>()

async function mount(changeNotes: boolean) {
  const container = document.createElement('main')
  document.body.append(container)
  const root = createRoot(container)
  mountedRoots.add(root)
  await act(async () => root.render(createElement(UpdateExhibitionDialog, {
    edition: { id: 2, editionNumber: '2026', eventName: 'Festival' }, artistas: [entity.artist]
  })))
  if (changeNotes) {
    const notes = container.querySelector<HTMLTextAreaElement>('#exhibition-notes-42')
    if (!notes) throw new Error('Missing exhibition notes field')
    await act(async () => {
      Object.getOwnPropertyDescriptor(testWindow.HTMLTextAreaElement.prototype, 'value')?.set?.call(notes, 'Actualizadas')
      notes.dispatchEvent(new Event('input', { bubbles: true }))
      notes.dispatchEvent(new Event('change', { bubbles: true }))
    })
  }
  return { container, root }
}
async function submit(container: HTMLElement) {
  await act(async () => container.querySelector<HTMLFormElement>('form')?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })))
}

for (const [label, metadata, suffix] of [
  ['SWR', 'swr', '. Pueden tardar en aparecer en la web.'],
  ['inmediata', 'immediate', ''],
  ['ausente', undefined, '']
] as const) {
  test(`update exhibition confirms ${label} freshness after executing the changed action`, async () => {
    calls.length = 0; successes.length = 0; errors.length = 0
    participationAction.mockClear(); exhibitionAction.mockClear()
    participationResult = { success: true }
    exhibitionResult = { success: true, ...(metadata ? { webRevalidation: metadata } : {}) }
    const { container, root } = await mount(true)
    await submit(container)

    expect(participationAction).not.toHaveBeenCalled()
    expect(exhibitionAction).toHaveBeenCalledTimes(1)
    expect(exhibitionAction).toHaveBeenCalledWith({
      id: 42, participacionId: 7, disciplinaId: 1, modoIngresoId: 1,
      notas: 'Actualizadas', estado: 'seleccionado', puntaje: null, pseudonimoId: 13
    })
    expect(successes).toEqual([`Cambios guardados${suffix}`])
    expect(errors).toEqual([])
    expect(calls.slice(-2)).toEqual([`toast:Cambios guardados${suffix}`, 'close'])
    expect(container.querySelector<HTMLTextAreaElement>('#exhibition-notes-42')?.value).toBe('Actualizadas')
    await act(async () => root.unmount()); mountedRoots.delete(root); container.remove()
  })
}

test('unchanged exhibition succeeds without executing actions or adding freshness copy', async () => {
  calls.length = 0; successes.length = 0; errors.length = 0
  participationAction.mockClear(); exhibitionAction.mockClear()
  const { container, root } = await mount(false)
  await submit(container)
  expect(participationAction).not.toHaveBeenCalled()
  expect(exhibitionAction).not.toHaveBeenCalled()
  expect(successes).toEqual(['Cambios guardados'])
  expect(errors).toEqual([])
  expect(calls.slice(-2)).toEqual(['toast:Cambios guardados', 'close'])
  await act(async () => root.unmount()); mountedRoots.delete(root); container.remove()
})

test('failed changed action does not show success, reset, or close', async () => {
  calls.length = 0; successes.length = 0; errors.length = 0
  exhibitionAction.mockClear()
  exhibitionResult = { success: false, errors: [{ entityType: 'expositor', message: 'No se pudo actualizar' }] }
  const { container, root } = await mount(true)
  await submit(container)
  expect(successes).toEqual([])
  expect(errors).toEqual(['No se pudo actualizar'])
  expect(calls).not.toContain('close')
  expect(container.querySelector<HTMLTextAreaElement>('#exhibition-notes-42')?.value).toBe('Actualizadas')
  await act(async () => root.unmount()); mountedRoots.delete(root); container.remove()
})

test('rejected changed action propagates without success or close', async () => {
  calls.length = 0; successes.length = 0; errors.length = 0
  propagatedSubmitError.current = null
  exhibitionAction.mockClear()
  exhibitionAction.mockImplementationOnce(async () => { throw new Error('action rejection') })
  const { container, root } = await mount(true)
  await submit(container)
  expect(readPropagatedSubmitError()?.message).toBe('action rejection')
  expect(successes).toEqual([])
  expect(errors).toEqual([])
  expect(calls).not.toContain('close')
  expect(container.querySelector<HTMLTextAreaElement>('#exhibition-notes-42')?.value).toBe('Actualizadas')
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
