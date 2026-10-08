import { afterAll, afterEach, expect, test, mock } from 'bun:test'
import { createElement, act } from 'react'
import { createHappyDOMEnvironment } from '@/tests/unit/_support/happy-dom-environment'

const environment = await createHappyDOMEnvironment()
const { createRoot: createDOMRoot } = await import('react-dom/client')
const activeRoots = new Set<ReturnType<typeof createDOMRoot>>()

function createRoot(container: HTMLElement) {
  const root = createDOMRoot(container)
  activeRoots.add(root)
  return root
}

async function disposeRoot(root: ReturnType<typeof createDOMRoot>) {
  if (!activeRoots.has(root)) return
  await act(async () => root.unmount())
  activeRoots.delete(root)
}

afterEach(async () => {
  try {
    for (const root of activeRoots) await act(async () => root.unmount())
  } finally {
    activeRoots.clear()
    document.body.replaceChildren()
    selectedExhibition = { entity: null, exhibition: null }
  }
})

afterAll(async () => environment.dispose())

mock.module('@/shared/components/entity-form/entity-form-dialog', () => ({
  EntityFormDialog: ({ children }: { children: React.ReactNode }) =>
    createElement('section', null, children)
}))
mock.module('@/shared/components/ui/select', () => ({
  Select: ({
    children,
    onValueChange,
    value
  }: {
    children: React.ReactNode
    onValueChange?: (value: string) => void
    value?: string
  }) =>
    createElement(
      'div',
      null,
      children,
      onValueChange &&
        [
          'seleccionado',
          'confirmado',
          'completado',
          'desistido',
          'cancelado',
          'ausente'
        ].includes(String(value)) &&
        ['confirmado', 'completado', 'cancelado'].map((status) =>
          createElement(
            'button',
            {
              key: status,
              type: 'button',
              onClick: () => onValueChange(status)
            },
            `Estado ${status}`
          )
        ),
      createElement('output', null, value)
    ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) =>
    createElement('div', null, children),
  SelectValue: ({ children }: { children: React.ReactNode }) =>
    createElement('span', null, children),
  SelectContent: ({ children }: { children: React.ReactNode }) =>
    createElement('div', null, children),
  SelectItem: ({ children }: { children: React.ReactNode }) =>
    createElement('span', null, children)
}))
mock.module('@/shared/components/controller-combobox', () => ({
  ControllerCombobox: () => createElement('button', null, 'Participante')
}))
mock.module('@/core/eventos/participaciones/_store/use-participations-store', () => ({
  useParticipationsStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({
      isCreateExhibitionDialogOpen: true,
      toggleCreateExhibitionDialogOpen: () => {},
      selectedExhibition,
      isUpdateExhibitionDialogOpen: true,
      closeUpdateDialogs: () => {},
      setRemoveExhibitionDialogOpen: () => {}
    })
}))
mock.module('@/core/eventos/participaciones/_actions/exhibitions/create-exhibition.action', () => ({
  createExhibitionAction: mock(async () => ({ success: true }))
}))
mock.module('@/core/eventos/participaciones/_actions/exhibitions/update-exhibition.action', () => ({
  updateExhibitionAction: mock(async () => ({ success: true }))
}))
mock.module('@/core/eventos/participaciones/_actions/participations/update-participation.action', () => ({
  updateParticipationAction: mock(async () => ({ success: true }))
}))

let selectedExhibition: Record<string, unknown> = { entity: null, exhibition: null }
const edition = { id: 1, editionNumber: '2026', eventName: 'Festival' }
const note =
  'Esta exhibición no se mostrará en la web a menos que tenga estado Confirmado o Completado.'

async function render(element: React.ReactNode) {
  const container = document.createElement('main')
  document.body.append(container)
  const root = createRoot(container)
  await act(async () => root.render(element))
  return { container, root }
}

test('create exhibition status guidance follows visible states', async () => {
  const { CreateExhibitionDialog } = await import(
    '@/core/eventos/participaciones/_components/create-exhibition-dialog'
  )
  const { container, root } = await render(
    createElement(CreateExhibitionDialog, {
      edition,
      artistas: [],
      agrupaciones: []
    })
  )
  expect(container.textContent).toContain(note)
  for (const status of ['confirmado', 'completado']) {
    await act(async () =>
      Array.from(container.querySelectorAll<HTMLButtonElement>('button'))
        .find((button) => button.textContent === `Estado ${status}`)
        ?.click()
    )
    expect(container.textContent).not.toContain(note)
  }
  await act(async () =>
    Array.from(container.querySelectorAll<HTMLButtonElement>('button'))
      .find((button) => button.textContent === 'Estado cancelado')
      ?.click()
  )
  expect(container.textContent).toContain(note)
  await disposeRoot(root)
  container.remove()
})

test('update exhibition status guidance follows visible states', async () => {
  selectedExhibition = {
    entity: {
      artist: { id: 5, pseudonym: 'Sol', statusId: 1 },
      collective: null,
      band: null
    },
    exhibition: {
      id: 7,
      participacionId: 3,
      disciplinaId: 1,
      modoIngresoId: 1,
      notas: '',
      estado: 'seleccionado',
      puntaje: null
    }
  }
  const { UpdateExhibitionDialog } = await import(
    '@/core/eventos/participaciones/_components/update-exhibition-dialog'
  )
  const { container, root } = await render(
    createElement(UpdateExhibitionDialog, { edition })
  )
  expect(container.textContent).toContain(note)
  for (const status of ['confirmado', 'completado']) {
    await act(async () =>
      Array.from(container.querySelectorAll<HTMLButtonElement>('button'))
        .find((button) => button.textContent === `Estado ${status}`)
        ?.click()
    )
    expect(container.textContent).not.toContain(note)
  }
  await act(async () =>
    Array.from(container.querySelectorAll<HTMLButtonElement>('button'))
      .find((button) => button.textContent === 'Estado cancelado')
      ?.click()
  )
  expect(container.textContent).toContain(note)
  await disposeRoot(root)
  container.remove()
  selectedExhibition = { entity: null, exhibition: null }
})
