import { afterAll, afterEach, expect, mock, test } from 'bun:test'
import { act, createElement } from 'react'
import type { Root } from 'react-dom/client'
import { Window } from 'happy-dom'
import type { ParticipationsViewData } from '@/core/eventos/participaciones/_types/participations.types'

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

const calls: string[] = []
const successToasts: string[] = []
const errorToasts: string[] = []
let actionResult: {
  success: boolean
  webRevalidation?: 'swr' | 'immediate'
  errors?: { message?: string }[]
} = { success: true, webRevalidation: 'swr' }
let selectedActivityId = 21
let selectedExhibitionId = 11

const deleteActivity = mock(async () => actionResult)
const deleteExhibition = mock(async () => actionResult)
mock.module('@/core/eventos/participaciones/_actions/activities/delete-activity.action', () => ({
  deleteActivityAction: deleteActivity
}))
mock.module('@/core/eventos/participaciones/_actions/exhibitions/delete-exhibition.action', () => ({
  deleteExhibitionAction: deleteExhibition
}))
mock.module('next/navigation', () => ({
  useRouter: () => ({ refresh: () => calls.push('refresh') })
}))
mock.module('nuqs', () => ({ useQueryStates: () => [{}, () => {}] }))
mock.module('sonner', () => ({
  toast: {
    success: (message: string) => {
      successToasts.push(message)
      calls.push(`toast:${message}`)
    },
    error: (message: string) => {
      errorToasts.push(message)
      calls.push(`error:${message}`)
    }
  }
}))
mock.module('@/shared/components/empty-state', () => ({ EmptyState: () => null }))
mock.module('@/core/eventos/participaciones/_store/use-participations-store', () => ({
  useParticipationsStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      selectedExhibition: { exhibition: { id: selectedExhibitionId } },
      selectedActivity: { activity: { id: selectedActivityId } },
      isRemoveExhibitionDialogOpen: true,
      isRemoveActivityDialogOpen: true,
      setRemoveExhibitionDialogOpen: () => {},
      setRemoveActivityDialogOpen: () => {},
      closeUpdateDialogs: () => calls.push('close')
    })
}))
mock.module('@/core/eventos/participaciones/_components/create-activity-dialog', () => ({ CreateActivityDialog: () => null }))
mock.module('@/core/eventos/participaciones/_components/create-exhibition-dialog', () => ({ CreateExhibitionDialog: () => null }))
mock.module('@/core/eventos/participaciones/_components/participants-container', () => ({ ParticipantsContainer: () => null }))
mock.module('@/core/eventos/participaciones/_components/participants-filters', () => ({ ParticipantsFilters: () => null }))
mock.module('@/core/eventos/participaciones/_components/participations-edition-selector', () => ({ ParticipationsEditionSelector: () => null }))
mock.module('@/core/eventos/participaciones/_components/update-activity-dialog', () => ({ UpdateActivityDialog: () => null }))
mock.module('@/core/eventos/participaciones/_components/update-exhibition-dialog', () => ({ UpdateExhibitionDialog: () => null }))
mock.module('@/core/eventos/participaciones/_components/delete-participation-dialog', () => ({
  DeleteParticipationDialogs: ({
    onConfirmRemoveActivity,
    onConfirmRemoveExhibition
  }: {
    onConfirmRemoveActivity: () => void
    onConfirmRemoveExhibition: () => void
  }) => createElement('div', null,
    createElement('button', { id: 'remove-activity', onClick: onConfirmRemoveActivity }, 'Remove activity'),
    createElement('button', { id: 'remove-exhibition', onClick: onConfirmRemoveExhibition }, 'Remove exhibition'))
}))

const data = {
  edition: {
    id: 1,
    editionNumber: '2026',
    slug: 'festival-2026',
    eventName: 'Festival',
    published: false,
    participations: [
      {
        id: 1,
        notas: null,
        entity: {
          artist: { id: 31, pseudonym: 'Artista de prueba', statusId: 1, pseudonyms: [] },
          collective: null,
          band: null
        },
        exhibition: null,
        activities: []
      }
    ]
  },
  editions: [],
  artists: [],
  collectives: [],
  bands: []
} satisfies ParticipationsViewData
const { ParticipationsContainer } = await import('@/core/eventos/participaciones/_components/participations-container')
const mountedRoots = new Set<Root>()

async function mount() {
  const container = document.createElement('main')
  document.body.append(container)
  const root = createRoot(container)
  mountedRoots.add(root)
  await act(async () => root.render(createElement(ParticipationsContainer, { data })))
  return { container, root }
}

async function click(container: HTMLElement, id: string) {
  await act(async () => container.querySelector<HTMLButtonElement>(`#${id}`)?.click())
}

const successCases = [
  { name: 'SWR', metadata: 'swr' as const, suffix: '. Pueden tardar en aparecer en la web.' },
  { name: 'immediate', metadata: 'immediate' as const, suffix: '' },
  { name: 'absent', metadata: undefined, suffix: '' }
]

for (const entity of [
  { label: 'activity', button: 'remove-activity', base: 'Actividad eliminada' },
  { label: 'exhibition', button: 'remove-exhibition', base: 'Expositor eliminado' }
]) {
  for (const outcome of successCases) {
    test(`${entity.label} deletion shows the ${outcome.name} freshness notice`, async () => {
      calls.length = 0
      successToasts.length = 0
      errorToasts.length = 0
      actionResult = { success: true, webRevalidation: outcome.metadata }
      const { container, root } = await mount()

      await click(container, entity.button)

      expect(successToasts).toEqual([`${entity.base}${outcome.suffix}`])
      expect(errorToasts).toEqual([])
      if (entity.label === 'activity') {
        expect(deleteActivity).toHaveBeenLastCalledWith({ id: selectedActivityId })
      } else {
        expect(deleteExhibition).toHaveBeenLastCalledWith(
          { success: false },
          { id: selectedExhibitionId }
        )
      }
      expect(calls.slice(-3)).toEqual([
        `toast:${entity.base}${outcome.suffix}`,
        'close',
        'refresh'
      ])
      await act(async () => root.unmount())
      mountedRoots.delete(root)
      container.remove()
    })
  }

  test(`${entity.label} deletion failure shows no success toast or refresh`, async () => {
    calls.length = 0
    successToasts.length = 0
    errorToasts.length = 0
    actionResult = { success: false, errors: [{ message: 'Deletion failed' }] }
    const { container, root } = await mount()

    await click(container, entity.button)

    expect(successToasts).toEqual([])
    expect(errorToasts).toEqual(['Deletion failed'])
    expect(calls).not.toContain('close')
    expect(calls).not.toContain('refresh')
    await act(async () => root.unmount())
    mountedRoots.delete(root)
    container.remove()
  })
}

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
