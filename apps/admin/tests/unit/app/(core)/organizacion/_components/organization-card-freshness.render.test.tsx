import { afterAll, afterEach, expect, mock, test } from 'bun:test'
import { act, createElement } from 'react'
import type { Root } from 'react-dom/client'
import { Window } from 'happy-dom'
import type { Organization, OrganizationFormInput } from '@/core/organizacion/_schemas/organizacion.schema'
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

type OrganizationAction = (
  previousState: ActionState<OrganizationFormInput>,
  data: OrganizationFormInput
) => Promise<ActionState<OrganizationFormInput>>
type OrganizationCardComponent = typeof import('@/core/organizacion/_components/organization-card').OrganizationCard

const updateAction = mock<OrganizationAction>(async () => ({ success: true }))
const successToast = mock((_message: string) => {})
const errorToast = mock((_message: string) => {})
const mountedRoots = new Set<Root>()

mock.module('sonner', () => ({ toast: { success: successToast, error: errorToast } }))
mock.module('@/core/organizacion/_actions/organization.action', () => ({ updateOrganization: updateAction }))
mock.module('@/shared/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => createElement('section', null, children),
  CardContent: ({ children }: { children: React.ReactNode }) => createElement('div', null, children),
  CardHeader: ({ children }: { children: React.ReactNode }) => createElement('header', null, children),
  CardTitle: ({ children }: { children: React.ReactNode }) => createElement('h2', null, children)
}))
mock.module('@/shared/components/ui/button', () => ({
  Button: (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => createElement('button', props)
}))
mock.module('@/shared/components/ui/badge', () => ({
  Badge: ({ children }: { children: React.ReactNode }) => createElement('span', null, children)
}))
mock.module('@tabler/icons-react', () => ({
  IconSeedingFilled: () => createElement('span'),
  IconUpload: () => createElement('span')
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
mock.module('@/shared/components/rich-textarea', () => ({
  RichTextarea: (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => createElement('textarea', props)
}))

const initialData: Organization = {
  id: 1,
  nombre: 'Organización actual',
  descripcion: 'Descripción actual',
  mision: 'Misión actual',
  vision: 'Visión actual',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z'
}

async function mountCard() {
  const { OrganizationCard } = await import('@/core/organizacion/_components/organization-card')
  const container = document.createElement('main')
  document.body.append(container)
  const root = createRoot(container)
  mountedRoots.add(root)
  await act(async () => root.render(createElement(OrganizationCard as OrganizationCardComponent, { initialData })))
  return { container, root }
}

async function submit(container: HTMLElement) {
  await act(async () => {
    container.querySelector('form')?.dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true })
    )
  })
}

async function unmountCard(root: Root, container: HTMLElement) {
  await act(async () => root.unmount())
  mountedRoots.delete(root)
  container.remove()
}

async function runSuccessScenario(freshness: 'swr' | 'immediate' | undefined) {
  updateAction.mockClear()
  successToast.mockClear()
  errorToast.mockClear()
  const result: ActionState<OrganizationFormInput> = {
    success: true,
    data: {
      nombre: 'Organización actualizada',
      descripcion: 'Descripción actualizada',
      mision: 'Misión actualizada',
      vision: 'Visión actualizada'
    }
  }
  if (freshness) result.webRevalidation = freshness
  updateAction.mockResolvedValue(result)

  const { container, root } = await mountCard()
  await submit(container)

  expect(updateAction).toHaveBeenCalledTimes(1)
  expect(updateAction).toHaveBeenCalledWith(
    { success: false },
    {
      nombre: 'Organización actual',
      descripcion: 'Descripción actual',
      mision: 'Misión actual',
      vision: 'Visión actual'
    }
  )
  const original = 'Organización actualizada correctamente'
  expect(successToast).toHaveBeenCalledWith(
    freshness === 'swr' ? `${original}. Pueden tardar en aparecer en la web.` : original
  )
  expect(errorToast).not.toHaveBeenCalled()
  expect(container.querySelector<HTMLInputElement>('#nombre')?.value).toBe('Organización actualizada')

  await unmountCard(root, container)
}

for (const freshness of ['swr', 'immediate', undefined] as const) {
  test(`organization card keeps success flow for ${freshness ?? 'absent'} freshness`, async () => {
    await runSuccessScenario(freshness)
  })
}

test('organization card preserves failure handling when freshness is SWR', async () => {
  updateAction.mockClear()
  successToast.mockClear()
  errorToast.mockClear()
  updateAction.mockResolvedValue({
    success: false,
    errors: [{ entityType: 'organizacion', message: 'No se pudo guardar' }],
    webRevalidation: 'swr'
  })

  const { container, root } = await mountCard()
  await submit(container)

  expect(updateAction).toHaveBeenCalledTimes(1)
  expect(successToast).not.toHaveBeenCalled()
  expect(errorToast).toHaveBeenCalledWith('No se pudo guardar')
  expect(container.querySelector<HTMLInputElement>('#nombre')?.value).toBe('Organización actual')

  await unmountCard(root, container)
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
