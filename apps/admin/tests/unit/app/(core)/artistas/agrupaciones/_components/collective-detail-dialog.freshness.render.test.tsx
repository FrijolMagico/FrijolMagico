import { afterAll, afterEach, expect, mock, test } from 'bun:test'
import {
  act,
  Children,
  cloneElement,
  createElement,
  isValidElement
} from 'react'
import type { Root } from 'react-dom/client'
import { Window } from 'happy-dom'
import type {
  ArtistOption,
  CollectiveRow,
  MemberDraftItem
} from '@/core/artistas/agrupaciones/_types/collective.types'
import type { UpsertCollectivePayloadInput } from '@/core/artistas/agrupaciones/_schemas/collective.schema'
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
  browserGlobalNames.map((name) => [
    name,
    Object.getOwnPropertyDescriptor(globalThis, name)
  ])
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
  Object.defineProperty(globalThis, name, {
    configurable: true,
    value,
    writable: true
  })
}

const { createRoot } = await import('react-dom/client')
const collective = {
  id: 42,
  nombre: 'Agrupación original',
  descripcion: 'Descripción original',
  correo: 'original@example.cl',
  activo: true,
  memberCount: 3,
  createdAt: '2025-01-01T00:00:00.000Z'
} satisfies CollectiveRow
const initialMembers: MemberDraftItem[] = [
  {
    artistId: 1,
    pseudonymId: 11,
    pseudonym: 'Artista uno',
    city: 'Santiago',
    role: 'Voz',
    active: true
  },
  {
    artistId: 3,
    pseudonymId: null,
    pseudonym: 'Artista tres',
    city: null,
    role: null,
    active: false
  }
]
const addedMember: MemberDraftItem = {
  artistId: 2,
  pseudonymId: 22,
  pseudonym: 'Artista dos',
  city: 'Valparaíso',
  role: 'Guitarra',
  active: true
}
const propagatedSubmitError: { current: Error | null } = { current: null }
const mountedRoots = new Set<Root>()
const action = mock<
  typeof import('@/core/artistas/agrupaciones/_actions/upsert-collective-with-members.action').upsertCollectiveWithMembersAction
>(async (_previousState, _data): Promise<ActionState> => ({ success: true }))
const successOrder: string[] = []
const successToast = mock((_message: string) => successOrder.push('toast'))
const errorToast = mock((_message: string) => {})

type SubmitFormProps = {
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void | Promise<void>
}

function isSubmitForm(
  value: React.ReactNode
): value is React.ReactElement<SubmitFormProps> {
  return (
    isValidElement<SubmitFormProps>(value) &&
    value.type === 'form' &&
    typeof value.props.onSubmit === 'function'
  )
}

function handleSubmitForm(
  event: React.FormEvent<HTMLFormElement>,
  onSubmit: SubmitFormProps['onSubmit']
) {
  const submitted = onSubmit(event)
  if (submitted instanceof Promise) {
    return submitted.catch((reason: unknown) => {
      if (reason instanceof Error) propagatedSubmitError.current = reason
    })
  }
  return submitted
}

mock.module('sonner', () => ({
  toast: { success: successToast, error: errorToast }
}))
mock.module(
  '@/core/artistas/agrupaciones/_actions/upsert-collective-with-members.action',
  () => ({
    upsertCollectiveWithMembersAction: action
  })
)
mock.module('@/shared/components/entity-form/entity-form-dialog', () => ({
  EntityFormDialog: ({ children }: { children: React.ReactNode }) =>
    createElement(
      'section',
      null,
      Children.map(children, (child) =>
        isSubmitForm(child)
          ? cloneElement(child, {
              onSubmit: (event) => handleSubmitForm(event, child.props.onSubmit)
            })
          : child
      )
    )
}))
mock.module('@/shared/components/ui/field', () => ({
  Field: ({ children }: { children: React.ReactNode }) =>
    createElement('div', null, children),
  FieldError: ({ children }: { children: React.ReactNode }) =>
    createElement('div', null, children),
  FieldGroup: ({ children }: { children: React.ReactNode }) =>
    createElement('div', null, children),
  FieldLabel: ({
    children,
    htmlFor
  }: {
    children: React.ReactNode
    htmlFor?: string
  }) => createElement('label', { htmlFor }, children)
}))
mock.module('@/shared/components/ui/input', () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) =>
    createElement('input', props)
}))
mock.module('@/shared/components/ui/textarea', () => ({
  Textarea: (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) =>
    createElement('textarea', props)
}))
mock.module('@/shared/components/ui/switch', () => ({
  Switch: ({
    checked,
    onCheckedChange,
    ...props
  }: {
    checked: boolean
    onCheckedChange: (checked: boolean) => void
    'aria-label'?: string
  }) =>
    createElement('input', {
      ...props,
      type: 'checkbox',
      checked,
      onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
        onCheckedChange(event.currentTarget.checked)
    })
}))
mock.module(
  '@/core/artistas/agrupaciones/_components/collective-member-list',
  () => ({ CollectiveMemberList: () => null })
)
mock.module(
  '@/core/artistas/agrupaciones/_components/member-create-dialog',
  () => ({ MemberCreateDialog: () => null })
)
mock.module(
  '@/core/artistas/agrupaciones/_components/member-update-dialog',
  () => ({ MemberUpdateDialog: () => null })
)

async function mountDialog() {
  const [
    { CollectiveDetailDialog },
    { useCollectiveStore },
    { useCollectiveDraftStore }
  ] = await Promise.all([
    import('@/core/artistas/agrupaciones/_components/collective-detail-dialog'),
    import('@/core/artistas/agrupaciones/_store/use-collective-store'),
    import('@/core/artistas/agrupaciones/_store/use-collective-draft-store')
  ])
  useCollectiveStore.getState().openUpdateCollectiveDialog(collective)
  const container = document.createElement('main')
  document.body.append(container)
  const root = createRoot(container)
  mountedRoots.add(root)
  const availableArtists = [
    { id: 2, pseudonym: 'Artista dos', aliasLabel: null, city: 'Valparaíso' }
  ] satisfies ArtistOption[]
  await act(async () =>
    root.render(
      createElement(CollectiveDetailDialog, {
        membersByCollectiveId: { [collective.id]: initialMembers },
        availableArtists
      })
    )
  )
  return { container, root, useCollectiveStore, useCollectiveDraftStore }
}

async function setField(container: HTMLElement, name: string, value: string) {
  const input = container.querySelector<HTMLInputElement | HTMLTextAreaElement>(
    `[name="${name}"]`
  )
  if (!input) throw new Error(`Missing collective ${name} field`)
  await act(async () => {
    const prototype =
      input instanceof testWindow.HTMLTextAreaElement
        ? testWindow.HTMLTextAreaElement.prototype
        : testWindow.HTMLInputElement.prototype
    Object.getOwnPropertyDescriptor(prototype, 'value')?.set?.call(input, value)
    input.dispatchEvent(new Event('input', { bubbles: true }))
    input.dispatchEvent(new Event('change', { bubbles: true }))
  })
}

async function submit(container: HTMLElement) {
  await act(async () => {
    container
      .querySelector('form')
      ?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
  })
}

async function unmountDialog(root: Root, container: HTMLElement) {
  await act(async () => root.unmount())
  mountedRoots.delete(root)
  container.remove()
}

function resetScenario() {
  action.mockClear()
  successToast.mockClear()
  errorToast.mockClear()
  successOrder.length = 0
  propagatedSubmitError.current = null
}

async function addMemberDraftChanges(
  useCollectiveDraftStore: typeof import('@/core/artistas/agrupaciones/_store/use-collective-draft-store').useCollectiveDraftStore
) {
  await act(async () => {
    useCollectiveDraftStore
      .getState()
      .updateMember(1, { pseudonymId: 12, role: 'Líder', active: false })
    useCollectiveDraftStore.getState().removeMember(3)
    useCollectiveDraftStore.getState().addMember(addedMember)
  })
}

async function runSuccessScenario(freshness: 'swr' | 'immediate' | undefined) {
  resetScenario()
  const result: ActionState = { success: true }
  if (freshness) result.webRevalidation = freshness
  action.mockResolvedValue(result)
  const { container, root, useCollectiveStore, useCollectiveDraftStore } =
    await mountDialog()
  await addMemberDraftChanges(useCollectiveDraftStore)
  await setField(container, 'nombre', '  Agrupación modificada  ')
  const unsubscribeDraft = useCollectiveDraftStore.subscribe(
    (state, previousState) => {
      if (
        state.originalMembers.length === 0 &&
        previousState.originalMembers.length > 0
      ) {
        successOrder.push('draft-reset')
      }
    }
  )
  const unsubscribeCollective = useCollectiveStore.subscribe(
    (state, previousState) => {
      if (
        !state.isUpdateCollectiveOpen &&
        previousState.isUpdateCollectiveOpen
      ) {
        successOrder.push('store-close')
      }
    }
  )
  await submit(container)
  unsubscribeDraft()
  unsubscribeCollective()

  const expectedInput: UpsertCollectivePayloadInput = {
    collectiveId: collective.id,
    fields: {
      nombre: 'Agrupación modificada',
      descripcion: collective.descripcion,
      correo: collective.correo,
      activo: collective.activo
    },
    pendingAdds: [
      { artistId: 2, pseudonymId: 22, role: 'Guitarra', active: true }
    ],
    pendingUpdates: [
      { artistId: 1, pseudonymId: 12, role: 'Líder', active: false }
    ],
    pendingRemovals: [3]
  }
  expect(action).toHaveBeenCalledTimes(1)
  expect(action).toHaveBeenCalledWith({ success: false }, expectedInput)
  const original = 'Agrupación actualizada correctamente'
  expect(successToast).toHaveBeenCalledWith(
    freshness === 'swr'
      ? `${original}. Pueden tardar en aparecer en la web.`
      : original
  )
  expect(errorToast).not.toHaveBeenCalled()
  expect(successOrder).toEqual(['toast', 'draft-reset', 'store-close'])
  expect(useCollectiveStore.getState().selectedCollective).toBeNull()
  expect(useCollectiveDraftStore.getState()).toMatchObject({
    originalMembers: [],
    existingMembers: [],
    pendingAdds: []
  })
  await unmountDialog(root, container)
}

for (const freshness of ['swr', 'immediate', undefined] as const) {
  test(`collective detail success preserves payload and close flow for ${freshness ?? 'absent'} freshness`, async () => {
    await runSuccessScenario(freshness)
  })
}

test('collective detail closes a clean draft without an action', async () => {
  resetScenario()
  const { container, root, useCollectiveStore, useCollectiveDraftStore } =
    await mountDialog()
  await submit(container)
  expect(action).not.toHaveBeenCalled()
  expect(successToast).not.toHaveBeenCalled()
  expect(useCollectiveStore.getState().selectedCollective).toBeNull()
  expect(useCollectiveDraftStore.getState()).toMatchObject({
    originalMembers: [],
    existingMembers: [],
    pendingAdds: []
  })
  await unmountDialog(root, container)
})

test('collective detail action errors preserve form and member drafts without success', async () => {
  resetScenario()
  action.mockResolvedValue({
    success: false,
    errors: [
      {
        entityType: 'collective',
        message: 'No se pudieron guardar los cambios'
      }
    ],
    webRevalidation: 'swr'
  })
  const { container, root, useCollectiveStore, useCollectiveDraftStore } =
    await mountDialog()
  await addMemberDraftChanges(useCollectiveDraftStore)
  await setField(container, 'nombre', 'Agrupación pendiente')
  await submit(container)
  expect(successToast).not.toHaveBeenCalled()
  expect(errorToast).toHaveBeenCalledWith('No se pudieron guardar los cambios')
  expect(useCollectiveStore.getState().selectedCollective).toEqual(collective)
  expect(useCollectiveDraftStore.getState().pendingAdds).toEqual([addedMember])
  expect(useCollectiveDraftStore.getState().existingMembers).toEqual([
    { ...initialMembers[0], pseudonymId: 12, role: 'Líder', active: false }
  ])
  expect(
    container.querySelector<HTMLInputElement>('[name="nombre"]')?.value
  ).toBe('Agrupación pendiente')
  await unmountDialog(root, container)
})

test('collective detail rejection propagates without success or draft reset', async () => {
  resetScenario()
  action.mockImplementationOnce(async () => {
    throw new Error('network rejection')
  })
  const { container, root, useCollectiveStore, useCollectiveDraftStore } =
    await mountDialog()
  await addMemberDraftChanges(useCollectiveDraftStore)
  await setField(container, 'nombre', 'Agrupación pendiente')
  await submit(container)
  await act(async () => Promise.resolve())
  expect(propagatedSubmitError.current?.message).toBe('network rejection')
  expect(successToast).not.toHaveBeenCalled()
  expect(errorToast).not.toHaveBeenCalled()
  expect(useCollectiveStore.getState().selectedCollective).toEqual(collective)
  expect(useCollectiveDraftStore.getState().pendingAdds).toEqual([addedMember])
  expect(useCollectiveDraftStore.getState().existingMembers).toHaveLength(1)
  expect(
    container.querySelector<HTMLInputElement>('[name="nombre"]')?.value
  ).toBe('Agrupación pendiente')
  await unmountDialog(root, container)
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
