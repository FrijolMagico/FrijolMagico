import { afterAll, afterEach, expect, mock, test } from 'bun:test'
import { act, cloneElement, createElement, isValidElement } from 'react'
import type { Root } from 'react-dom/client'
import { Window } from 'happy-dom'
import type { CollectiveInsertInput } from '@/core/artistas/agrupaciones/_schemas/collective.schema'
import type { ActionState } from '@/shared/types/actions'

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

type SubmitFormProps = {
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void | Promise<void>
}
const propagatedSubmitError: { current: Error | null } = { current: null }

function getPropagatedSubmitError(): Error | null {
  return propagatedSubmitError.current
}

function isSubmitForm(value: React.ReactNode): value is React.ReactElement<SubmitFormProps> {
  return isValidElement<SubmitFormProps>(value) && value.type === 'form' && typeof value.props.onSubmit === 'function'
}

type CreateCollectiveAction = typeof import('@/core/artistas/agrupaciones/_actions/create-collective.action').createCollectiveAction
type CollectiveCreateDialogComponent = typeof import('@/core/artistas/agrupaciones/_components/collective-create-dialog').CollectiveCreateDialog

type CollectiveActionResult = ActionState

const createAction = mock<CreateCollectiveAction>(async (
  _previousState,
  _data
): Promise<CollectiveActionResult> => ({ success: true }))
const successToast = mock((_message: string) => {
  successOrder.push('toast')
})
const errorToast = mock((_message: string) => {})
const openChanges: boolean[] = []
const successOrder: string[] = []
const mountedRoots = new Set<Root>()

mock.module('sonner', () => ({ toast: { success: successToast, error: errorToast } }))
mock.module('@/core/artistas/agrupaciones/_actions/create-collective.action', () => ({
  createCollectiveAction: createAction
}))
mock.module('@/core/artistas/agrupaciones/_store/use-collective-store', () => ({
  useCollectiveStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      isCreateCollectiveOpen: true,
      toggleCreateCollectiveDialog: (open: boolean) => {
        openChanges.push(open)
        if (!open) successOrder.push('close')
      }
    })
}))
mock.module('@/shared/components/entity-form/entity-form-dialog', () => ({
  EntityFormDialog: ({ children }: { children: React.ReactNode }) => createElement(
    'section',
    null,
    isSubmitForm(children)
      ? cloneElement(children, {
          onSubmit: (event) => {
            const submitted = children.props.onSubmit(event)
            if (submitted instanceof Promise) {
              return submitted.catch((reason: unknown) => {
                if (reason instanceof Error) propagatedSubmitError.current = reason
              })
            }
          }
        })
      : children
  )
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
mock.module('@/shared/components/ui/switch', () => ({
  Switch: ({ checked, onCheckedChange, ...props }: {
    checked: boolean
    onCheckedChange: (checked: boolean) => void
    'aria-label'?: string
  }) => createElement('input', {
    ...props,
    type: 'checkbox',
    checked,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => onCheckedChange(event.currentTarget.checked)
  })
}))

async function mountDialog() {
  const { CollectiveCreateDialog } = await import(
    '@/core/artistas/agrupaciones/_components/collective-create-dialog'
  )
  const component: CollectiveCreateDialogComponent = CollectiveCreateDialog
  const container = document.createElement('main')
  document.body.append(container)
  const root = createRoot(container)
  mountedRoots.add(root)
  await act(async () => root.render(createElement(component)))
  return { container, root }
}

async function setField(container: HTMLElement, name: string, value: string) {
  const input = container.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[name="${name}"]`)
  if (!input) throw new Error(`Missing collective ${name} field`)
  await act(async () => {
    const prototype = input instanceof testWindow.HTMLTextAreaElement
      ? testWindow.HTMLTextAreaElement.prototype
      : testWindow.HTMLInputElement.prototype
    Object.getOwnPropertyDescriptor(prototype, 'value')?.set?.call(input, value)
    input.dispatchEvent(new Event('input', { bubbles: true }))
    input.dispatchEvent(new Event('change', { bubbles: true }))
  })
}

async function submit(container: HTMLElement) {
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

async function runSuccessScenario(freshness: 'swr' | 'immediate' | undefined) {
  createAction.mockClear()
  successToast.mockClear()
  errorToast.mockClear()
  openChanges.length = 0
  successOrder.length = 0
  const result: ActionState = { success: true }
  if (freshness) result.webRevalidation = freshness
  createAction.mockResolvedValue(result)

  const { container, root } = await mountDialog()
  await setField(container, 'nombre', '  Agrupación nueva  ')
  await setField(container, 'descripcion', ' Descripción ')
  await setField(container, 'correo', ' correo@example.cl ')
  await submit(container)

  const expectedInput: CollectiveInsertInput = {
    nombre: 'Agrupación nueva',
    descripcion: 'Descripción',
    correo: 'correo@example.cl',
    activo: true
  }
  expect(createAction).toHaveBeenCalledTimes(1)
  expect(createAction).toHaveBeenCalledWith({ success: false }, expectedInput)
  const original = 'Agrupación creada correctamente'
  expect(successToast).toHaveBeenCalledWith(
    freshness === 'swr' ? `${original}. Pueden tardar en aparecer en la web.` : original
  )
  expect(errorToast).not.toHaveBeenCalled()
  expect(openChanges).toEqual([false])
  expect(successOrder).toEqual(['toast', 'close'])
  expect(container.querySelector<HTMLInputElement>('[name="nombre"]')?.value).toBe('')

  await unmountDialog(root, container)
}

for (const freshness of ['swr', 'immediate', undefined] as const) {
  test(`collective create keeps success flow for ${freshness ?? 'absent'} freshness`, async () => {
    await runSuccessScenario(freshness)
  })
}

test('collective create preserves action errors when freshness is SWR', async () => {
  createAction.mockClear()
  successToast.mockClear()
  errorToast.mockClear()
  openChanges.length = 0
  successOrder.length = 0
  createAction.mockResolvedValue({
    success: false,
    errors: [{ entityType: 'agrupacion', message: 'No se pudo crear' }],
    webRevalidation: 'swr'
  })

  const { container, root } = await mountDialog()
  await setField(container, 'nombre', 'Agrupación nueva')
  await submit(container)

  expect(createAction).toHaveBeenCalledTimes(1)
  expect(successToast).not.toHaveBeenCalled()
  expect(errorToast).toHaveBeenCalledWith('No se pudo crear')
  expect(openChanges).toEqual([])
  expect(container.querySelector<HTMLInputElement>('[name="nombre"]')?.value).toBe('Agrupación nueva')

  await unmountDialog(root, container)
})

test('collective create rejection propagates without toast or close', async () => {
  createAction.mockClear()
  successToast.mockClear()
  errorToast.mockClear()
  openChanges.length = 0
  successOrder.length = 0
  propagatedSubmitError.current = null
  createAction.mockImplementationOnce(async () => {
    throw new Error('network rejection')
  })

  const { container, root } = await mountDialog()
  await setField(container, 'nombre', 'Agrupación nueva')
  await submit(container)
  await act(async () => Promise.resolve())

  const submitError = getPropagatedSubmitError()
  expect(submitError?.message).toBe('network rejection')
  expect(successToast).not.toHaveBeenCalled()
  expect(errorToast).not.toHaveBeenCalled()
  expect(openChanges).toEqual([])
  expect(container.querySelector<HTMLInputElement>('[name="nombre"]')?.value).toBe('Agrupación nueva')

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
    if (descriptor) {
      Object.defineProperty(globalThis, name, descriptor)
    } else {
      Reflect.deleteProperty(globalThis, name)
    }
  }
})
