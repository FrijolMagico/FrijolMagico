import { afterAll, afterEach, beforeEach, expect, mock, test } from 'bun:test'
import { act, createElement } from 'react'
import type { Root } from 'react-dom/client'
import { Window } from 'happy-dom'
import type { EditionWithDays, EdicionRootFormInput } from '@/core/eventos/ediciones/_schemas/edition-composite.schema'
import type { Place } from '@/core/eventos/ediciones/_schemas/place.schema'
import type { EventoLookup } from '@/core/eventos/ediciones/_types'

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

for (const [name, value] of [
  ['window', testWindow],
  ['document', testWindow.document],
  ['Node', testWindow.Node],
  ['HTMLElement', testWindow.HTMLElement],
  ['HTMLInputElement', testWindow.HTMLInputElement],
  ['Element', testWindow.Element],
  ['Event', testWindow.Event],
  ['IS_REACT_ACT_ENVIRONMENT', true]
] as const) {
  Object.defineProperty(globalThis, name, { configurable: true, value, writable: true })
}

const { createRoot } = await import('react-dom/client')
const realReactHookForm = await import('react-hook-form')
const originalUseForm = realReactHookForm.useForm
const originalFormProvider = realReactHookForm.FormProvider
const originalUseFormContext = realReactHookForm.useFormContext
const originalUseFormState = realReactHookForm.useFormState
const originalController = realReactHookForm.Controller

type ActionResult = {
  success: boolean
  errors?: { message: string }[]
  webRevalidation?: 'swr' | 'immediate'
}
type SaveEditionAction = (
  previousState: { success: boolean },
  data: {
    id: number | null
    posterUrl: string | null
    eventoId: number
    numeroEdicion: string
    nombre: string | null
    days: EdicionRootFormInput['days']
  }
) => Promise<ActionResult>

const action = mock<SaveEditionAction>(async () => ({ success: true }))
const successToast = mock((_message: string) => {})
const errorToast = mock((_message: string) => {})
const closeDialog = mock(() => {})
const capturedSubmitErrors: unknown[] = []
const mountedRoots = new Set<Root>()
const selectedEdition = {
  id: 42,
  eventoId: 17,
  numeroEdicion: 'XXVI',
  nombre: 'Edición de prueba',
  posterUrl: 'https://example.test/poster.jpg',
  posterDisplayUrl: 'https://example.test/poster-display.jpg',
  days: [{
    tempId: 'day-one',
    existingId: 91,
    fecha: '2026-09-12',
    horaInicio: '09:00',
    horaFin: '18:00',
    modalidad: 'presencial',
    lugarId: 5
  }]
} satisfies EditionWithDays
let activeSelectedEdition: EditionWithDays | null = selectedEdition
const eventos = [{ id: 17, nombre: 'Festival de prueba', slug: 'festival-de-prueba' }] satisfies EventoLookup[]
const lugares = [{
  id: 5,
  nombre: 'Teatro de prueba',
  direccion: 'Calle 1',
  ciudad: 'Santiago',
  coordenadas: null,
  url: null
}] satisfies Place[]

function useFormWithCapturedSubmit<
  TFieldValues extends import('react-hook-form').FieldValues = import('react-hook-form').FieldValues,
  TContext = unknown,
  TTransformedValues extends import('react-hook-form').FieldValues | undefined = undefined
>(options?: import('react-hook-form').UseFormProps<TFieldValues, TContext, TTransformedValues>) {
  const methods = originalUseForm<TFieldValues, TContext, TTransformedValues>(options)
  const handleSubmit = methods.handleSubmit
  methods.handleSubmit = (onValid, onInvalid) => {
    const submitHandler = handleSubmit(onValid, onInvalid)
    return async (event) => {
      try {
        await submitHandler(event)
      } catch (error) {
        capturedSubmitErrors.push(error)
      }
    }
  }
  return methods
}

mock.module('react-hook-form', () => ({
  ...realReactHookForm,
  Controller: originalController,
  FormProvider: originalFormProvider,
  useForm: useFormWithCapturedSubmit,
  useFormContext: originalUseFormContext,
  useFormState: originalUseFormState
}))
mock.module('sonner', () => ({ toast: { success: successToast, error: errorToast } }))
mock.module('@/core/eventos/ediciones/_actions/save-edition-with-days.action', () => ({
  saveEditionWithDaysAction: action
}))
mock.module('@/core/eventos/ediciones/_store/edition-dialog-store', () => ({
  useEditionDialog: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      isUpdateEditionOpen: true,
      selectedEdition: activeSelectedEdition,
      closeUpdateEditionDialog: closeDialog
    })
}))
mock.module('@/shared/components/entity-form/entity-form-dialog', () => ({
  EntityFormDialog: ({ children }: { children: React.ReactNode }) =>
    createElement('section', null, children)
}))
mock.module('@/core/eventos/ediciones/_components/edition-form-layout', () => ({
  EditionFormLayout: () => null
}))

const { UpdateEditionDialog } = await import(
  '@/core/eventos/ediciones/_components/update-edition-dialog'
)

async function mountDialog(edition: EditionWithDays | null = selectedEdition) {
  activeSelectedEdition = edition
  const container = document.createElement('main')
  document.body.append(container)
  const root = createRoot(container)
  mountedRoots.add(root)
  await act(async () => root.render(createElement(UpdateEditionDialog, { eventos, lugares })))
  return { container, root }
}

async function submit(container: HTMLElement) {
  await act(async () => {
    const form = container.querySelector('form')
    if (!form) throw new Error('Missing edition form')
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    await Promise.resolve()
    await Promise.resolve()
  })
}

async function unmountDialog(root: Root, container: HTMLElement) {
  await act(async () => root.unmount())
  mountedRoots.delete(root)
  container.remove()
}

beforeEach(() => {
  activeSelectedEdition = selectedEdition
  action.mockReset()
  action.mockResolvedValue({ success: true })
  successToast.mockClear()
  errorToast.mockClear()
  closeDialog.mockClear()
  capturedSubmitErrors.length = 0
})

for (const freshness of ['swr', 'immediate', undefined] as const) {
  test(`shows delay copy only for successful ${freshness ?? 'absent'} freshness`, async () => {
    const { container, root } = await mountDialog()
    action.mockResolvedValue({ success: true, ...(freshness ? { webRevalidation: freshness } : {}) })

    await submit(container)

    expect(action).toHaveBeenCalledTimes(1)
    expect(action).toHaveBeenCalledWith({ success: false }, {
      id: 42,
      posterUrl: 'https://example.test/poster.jpg',
      eventoId: 17,
      numeroEdicion: 'XXVI',
      nombre: 'Edición de prueba',
      days: selectedEdition.days
    })
    expect(successToast).toHaveBeenCalledWith(
      freshness === 'swr'
        ? 'Edición actualizada. Pueden tardar en aparecer en la web.'
        : 'Edición actualizada'
    )
    expect(errorToast).not.toHaveBeenCalled()
    expect(closeDialog).toHaveBeenCalledTimes(1)
    expect(container.querySelector('form')).not.toBeNull()
    await unmountDialog(root, container)
  })
}

test('shows the first action error and does not close on failure', async () => {
  action.mockResolvedValue({
    success: false,
    errors: [{ message: 'No se pudo guardar' }, { message: 'Otro error' }],
    webRevalidation: 'swr'
  })
  const { container, root } = await mountDialog()

  await submit(container)

  expect(successToast).not.toHaveBeenCalled()
  expect(errorToast).toHaveBeenCalledWith('No se pudo guardar')
  expect(closeDialog).not.toHaveBeenCalled()
  await unmountDialog(root, container)
})

test('uses the fallback action error and does not close on failure', async () => {
  action.mockResolvedValue({ success: false })
  const { container, root } = await mountDialog()

  await submit(container)

  expect(successToast).not.toHaveBeenCalled()
  expect(errorToast).toHaveBeenCalledWith('Error al actualizar')
  expect(closeDialog).not.toHaveBeenCalled()
  await unmountDialog(root, container)
})

test('keeps action rejection propagation without showing a toast or closing', async () => {
  const rejection = new Error('action rejected')
  action.mockRejectedValue(rejection)
  const { container, root } = await mountDialog()

  await submit(container)

  expect(successToast).not.toHaveBeenCalled()
  expect(errorToast).not.toHaveBeenCalled()
  expect(closeDialog).not.toHaveBeenCalled()
  expect(capturedSubmitErrors).toContain(rejection)
  await unmountDialog(root, container)
})

test('renders nothing when there is no selected edition', async () => {
  const { container, root } = await mountDialog(null)
  expect(container.querySelector('form')).toBeNull()
  await unmountDialog(root, container)
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
