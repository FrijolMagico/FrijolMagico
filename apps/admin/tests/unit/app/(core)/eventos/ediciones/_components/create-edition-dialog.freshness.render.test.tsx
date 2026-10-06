import { afterAll, afterEach, beforeEach, expect, mock, test } from 'bun:test'
import { act, createElement } from 'react'
import type { Root } from 'react-dom/client'
import type {
  FieldValues,
  UseFormProps,
  UseFormReturn
} from 'react-hook-form'
import { Window } from 'happy-dom'
import type { EdicionRootFormInput } from '@/core/eventos/ediciones/_schemas/edition-composite.schema'

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
const realReactHookForm = await import('react-hook-form')
const originalUseForm = realReactHookForm.useForm
const ControllerComponent = realReactHookForm.Controller
const originalFormProvider = realReactHookForm.FormProvider
const originalUseFormContext = realReactHookForm.useFormContext
const originalUseFormState = realReactHookForm.useFormState

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
const openChanges: boolean[] = []
const capturedSubmitErrors: unknown[] = []
const mountedRoots = new Set<Root>()

function useFormWithCapturedSubmit<
  TFieldValues extends FieldValues = FieldValues,
  TContext = unknown,
  TTransformedValues extends FieldValues | undefined = undefined
>(
  options?: UseFormProps<TFieldValues, TContext, TTransformedValues>
): UseFormReturn<TFieldValues, TContext, TTransformedValues> {
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
  Controller: ControllerComponent,
  FormProvider: originalFormProvider,
  useForm: useFormWithCapturedSubmit,
  useFormContext: originalUseFormContext,
  useFormState: originalUseFormState
}))

mock.module('sonner', () => ({
  toast: { success: successToast, error: errorToast }
}))
mock.module('@/core/eventos/ediciones/_actions/save-edition-with-days.action', () => ({
  saveEditionWithDaysAction: action
}))
mock.module('@/core/eventos/ediciones/_store/edition-dialog-store', () => ({
  useEditionDialog: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      isCreateEditionOpen: true,
      toggleCreateEditionDialog: (open: boolean) => openChanges.push(open)
    })
}))
mock.module('@/shared/components/entity-form/entity-form-dialog', () => ({
  EntityFormDialog: ({ children }: { children: React.ReactNode }) =>
    createElement('section', null, children)
}))
function MockEditionFormLayout() {
  const { control, register } = originalUseFormContext<EdicionRootFormInput>()
  return (
    <div>
      <ControllerComponent<EdicionRootFormInput>
        name='eventoId'
        control={control}
        render={({ field }) => (
          <button
            type='button'
            data-testid='select-event'
            onClick={() => field.onChange(17)}
          >
            {String(field.value ?? '')}
          </button>
        )}
      />
      <input {...register('numeroEdicion')} aria-label='Número de edición' />
      <input {...register('nombre')} aria-label='Nombre' />
    </div>
  )
}

mock.module('@/core/eventos/ediciones/_components/edition-form-layout', () => ({
  EditionFormLayout: MockEditionFormLayout
}))

const { CreateEditionDialog } = await import(
  '@/core/eventos/ediciones/_components/create-edition-dialog'
)

async function mountDialog() {
  openChanges.length = 0
  const container = document.createElement('main')
  document.body.append(container)
  const root = createRoot(container)
  mountedRoots.add(root)
  await act(async () => root.render(createElement(CreateEditionDialog, {
    eventos: [{ id: 17, nombre: 'Festival de prueba', slug: 'festival-de-prueba' }],
    lugares: []
  })))
  return { container, root }
}

async function submit(container: HTMLElement) {
  const eventButton = container.querySelector<HTMLButtonElement>('[data-testid="select-event"]')
  const numberInput = container.querySelector<HTMLInputElement>('[aria-label="Número de edición"]')
  if (!eventButton || !numberInput) throw new Error('Missing edition form controls')
  await act(async () => eventButton.click())
  await act(async () => {
    Object.getOwnPropertyDescriptor(testWindow.HTMLInputElement.prototype, 'value')?.set?.call(numberInput, 'V')
    numberInput.dispatchEvent(new Event('input', { bubbles: true }))
    numberInput.dispatchEvent(new Event('change', { bubbles: true }))
  })
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
  action.mockReset()
  action.mockResolvedValue({ success: true })
  successToast.mockClear()
  errorToast.mockClear()
  openChanges.length = 0
  capturedSubmitErrors.length = 0
})

for (const freshness of ['swr', 'immediate', undefined] as const) {
  test(`appends delay copy only for successful ${freshness ?? 'absent'} freshness`, async () => {
    const { container, root } = await mountDialog()
    action.mockResolvedValue({ success: true, ...(freshness ? { webRevalidation: freshness } : {}) })

    await submit(container)

    expect(action).toHaveBeenCalledTimes(1)
    expect(action).toHaveBeenCalledWith(
      { success: false },
      {
        id: null,
        posterUrl: null,
        eventoId: 17,
        numeroEdicion: 'V',
        nombre: null,
        days: []
      }
    )
    expect(successToast).toHaveBeenCalledWith(
      freshness === 'swr'
        ? 'Edición creada. Pueden tardar en aparecer en la web.'
        : 'Edición creada'
    )
    expect(errorToast).not.toHaveBeenCalled()
    expect(openChanges).toEqual([false])
    expect(container.querySelector<HTMLInputElement>('[aria-label="Número de edición"]')?.value).toBe('')

    await unmountDialog(root, container)
  })
}

test('does not show success or reset/close on an action error', async () => {
  action.mockResolvedValue({ success: false, errors: [{ message: 'No se pudo guardar' }], webRevalidation: 'swr' })
  const { container, root } = await mountDialog()

  await submit(container)

  expect(successToast).not.toHaveBeenCalled()
  expect(errorToast).toHaveBeenCalledWith('No se pudo guardar')
  expect(openChanges).toEqual([])
  expect(container.querySelector<HTMLInputElement>('[aria-label="Número de edición"]')?.value).toBe('V')
  await unmountDialog(root, container)
})

test('records a rejected submit without producing success or resetting/closing', async () => {
  const rejection = new Error('action rejected')
  action.mockRejectedValue(rejection)
  const { container, root } = await mountDialog()

  await submit(container)

  expect(successToast).not.toHaveBeenCalled()
  expect(errorToast).not.toHaveBeenCalled()
  expect(openChanges).toEqual([])
  expect(container.querySelector<HTMLInputElement>('[aria-label="Número de edición"]')?.value).toBe('V')
  expect(capturedSubmitErrors).toContain(rejection)
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
