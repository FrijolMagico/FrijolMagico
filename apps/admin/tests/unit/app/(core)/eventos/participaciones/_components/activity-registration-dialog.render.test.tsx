import { afterAll, afterEach, expect, test, mock } from 'bun:test'
import { createElement, act } from 'react'
import { useController, useForm, useWatch } from 'react-hook-form'
import type { ActivityFormInput } from '@/core/eventos/participaciones/_schemas/activity.schema'
import { activityRegistrationFormSchema } from '@/core/eventos/participaciones/_schemas/activity.schema'
import { createHappyDOMEnvironment } from '@/tests/unit/_support/happy-dom-environment'

const environment = await createHappyDOMEnvironment()
const { createRoot: createDOMRoot } = await import('react-dom/client')
const activeRoots = new Set<ReturnType<typeof createDOMRoot>>()

function createRoot(container: HTMLElement) {
  const root = createDOMRoot(container)
  activeRoots.add(root)
  return root
}

async function disposeRoot(root: ReturnType<typeof createRoot>) {
  if (!activeRoots.has(root)) return
  await act(async () => root.unmount())
  activeRoots.delete(root)
}

afterEach(async () => {
  try {
    for (const root of activeRoots) await disposeRoot(root)
    await act(async () => new Promise((resolve) => setTimeout(resolve, 5)))
  } finally {
    document.body.replaceChildren()
    selectedActivity = { entity: null, activity: null }
  }
})

afterAll(async () => environment.dispose())

mock.module('@/shared/components/entity-form/entity-form-dialog', () => ({
  EntityFormDialog: ({
    children,
    title,
    submit
  }: {
    children: React.ReactNode
    title: string
    submit: { label: string; form: string; disabled: boolean }
  }) =>
    createElement(
      'section',
      null,
      createElement('h2', null, title),
      children,
      createElement(
        'button',
        { type: 'submit', form: submit.form, disabled: submit.disabled },
        submit.label
      )
    )
}))
const refresh = mock(() => {})
const close = mock(() => {})
mock.module('next/navigation', () => ({ useRouter: () => ({ refresh }) }))

let selectedActivity: {
  entity: unknown
  activity: (Record<string, unknown> & { registration?: unknown }) | null
} = { entity: null, activity: null }
mock.module(
  '@/core/eventos/participaciones/_store/use-participations-store',
  () => ({
    useParticipationsStore: (
      selector: (state: Record<string, unknown>) => unknown
    ) =>
      selector({
        isCreateActivityDialogOpen: true,
        toggleCreateActivityDialogOpen: () => {},
        selectedActivity,
        isUpdateActivityDialogOpen: false,
        closeUpdateDialogs: close,
        setRemoveActivityDialogOpen: () => {}
      })
  })
)
mock.module('@/shared/components/ui/select', () => ({
  Select: ({
    children,
    onValueChange,
    value
  }: {
    children: React.ReactNode
    onValueChange?: (value: string) => void
    value?: string | number
  }) =>
    createElement(
      'div',
      { 'data-select': true },
      children,
      onValueChange &&
        createElement(
          'button',
          {
            type: 'button',
            onClick: () =>
              onValueChange(
                value === 'artista'
                  ? 'banda'
                  : value === 'banda'
                    ? 'artista'
                    : String(value) === '3'
                      ? '1'
                      : '3'
              )
          },
          value === 'artista' || value === 'banda'
            ? 'Cambiar participante'
            : 'Cambiar tipo'
        ),
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
        )
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
  ControllerCombobox: ({
    name,
    control
  }: {
    name: 'entity.artistaId' | 'entity.agrupacionId' | 'entity.bandaId'
    control: Parameters<typeof useController<ActivityFormInput>>[0]['control']
  }) => {
    const { field } = useController({ name, control })
    return createElement(
      'button',
      {
        type: 'button',
        onClick: () => field.onChange(5)
      },
      'Elegir participante'
    )
  }
}))
const createAction = mock(async () => ({ success: true }))
mock.module(
  '@/core/eventos/participaciones/_actions/activities/create-activity.action',
  () => ({
    createActivityAction: createAction
  })
)
const updateAction = mock(async () => ({ success: true }))
mock.module(
  '@/core/eventos/participaciones/_actions/activities/update-activity-aggregate.action',
  () => ({
    updateActivityAggregateAction: updateAction
  })
)

const { ActivityRegistrationFields, EMPTY_REGISTRATION } =
  await import('@/core/eventos/participaciones/_components/activity-registration-fields')

function RegistrationWithValue() {
  const methods = useForm<ActivityFormInput>({
    defaultValues: { registration: {
      url: 'https://example.org/alta', startDate: '2026-07-01', startTime: '10:30',
      endDate: '2026-07-02', endTime: '11:00', registrationEnabled: true
    } }
  })
  const registration = useWatch({ control: methods.control, name: 'registration' })
  return createElement('section', null,
    createElement(ActivityRegistrationFields, { methods, disabled: false }),
    createElement('output', null, JSON.stringify(registration)))
}

test('registration edits replace prior UTC-valid time and keep UTC validation', async () => {
  const container = document.createElement('main')
  document.body.append(container)
  const root = createRoot(container)
  await act(async () => root.render(createElement(RegistrationWithValue)))
  const hour = container.querySelector<HTMLInputElement>('#registration-startTime-hour')!
  const minute = container.querySelector<HTMLInputElement>('#registration-startTime-minute')!
  for (const [input, text, expected] of [
    [hour, '2', '2:30'], [hour, '24', '24:30'], [hour, '10', '10:30'],
    [minute, '60', '10:60'], [minute, '', '10:'], [hour, '', '']
  ] as const) {
    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(input, text)
      input.dispatchEvent(new Event('input', { bubbles: true }))
    })
    const registration = JSON.parse(container.querySelector('output')!.textContent!)
    expect(registration.startTime).toBe(expected)
    expect(activityRegistrationFormSchema.safeParse(registration).success).toBe(expected === '10:30')
  }
  await disposeRoot(root)
  container.remove()
})

function RegistrationForm() {
  const methods = useForm<ActivityFormInput>({
    defaultValues: { registration: EMPTY_REGISTRATION }
  })
  return createElement(ActivityRegistrationFields, { methods, disabled: false })
}

function findPickerButton(container: HTMLElement, label: string): HTMLButtonElement | null {
  // The picker renders a Field with FieldLabel (containing the label) and a Button (containing the value)
  // Find the FieldLabel with the label text, then find the sibling Button
  const labels = container.querySelectorAll('label')
  for (const lbl of labels) {
    if (lbl.textContent?.includes(label)) {
      const field = lbl.closest('[data-field]') ?? lbl.parentElement
      if (field) {
        const btn = field.querySelector<HTMLButtonElement>('button[type="button"]')
        if (btn) return btn
      }
    }
  }
  return null
}

test('renders shared registration controls with empty defaults', async () => {
  const container = document.createElement('main')
  document.body.append(container)
  const root = createRoot(container)
  await act(async () => root.render(createElement(RegistrationForm)))
  expect(container.querySelector<HTMLInputElement>('#registration-url')).toBeNull()
  expect(container.querySelector('#registration-startDate')).not.toBeNull()
  // Form renders without errors (pickers tested in integration)
  await disposeRoot(root)
  container.remove()
})

test('renders create activity through the mocked shell', async () => {
  const { CreateActivityDialog } =
    await import('@/core/eventos/participaciones/_components/create-activity-dialog')
  const container = document.createElement('main')
  document.body.append(container)
  const root = createRoot(container)
  await act(async () =>
    root.render(
      createElement(CreateActivityDialog, {
        edition: { id: 1, editionNumber: '2026', eventName: 'Festival' },
        artistas: [],
        agrupaciones: [],
        bandas: []
      })
    )
  )
  // Registration section hidden by default (toggle OFF)
  expect(
    container.querySelector<HTMLInputElement>('[name="registration.url"]')
  ).toBeNull()
  await disposeRoot(root)
  container.remove()
})

test('renders update Chile-local defaults and submits absent registration after selecting music', async () => {
  updateAction.mockClear()
  selectedActivity = {
    entity: {
      artist: { id: 5, pseudonym: 'Sol', statusId: 1 },
      collective: null,
      band: null
    },
    activity: {
      id: 7,
      participacionId: 3,
      tipoActividadId: 1,
      modoIngresoId: 1,
      notas: '',
      estado: 'completado',
      puntaje: null,
      detail: {
        id: 4,
        titulo: 'Taller',
        descripcion: '',
        duracionMinutos: null,
        cupos: null,
        horaInicio: '',
        ubicacion: ''
      },
      occurrences: [{ id: 71, date: '2026-07-01', startTime: '12:00', durationMinutes: 60, url: 'https://example.org/registro' }],
      registration: {
        url: 'https://example.org/registro',
        startDate: '2026-07-01',
        startTime: '12:00',
        endDate: '2026-07-02',
        endTime: '12:00',
        registrationEnabled: true
      }
    }
  }
  const { UpdateActivityDialog } =
    await import('@/core/eventos/participaciones/_components/update-activity-dialog')
  const container = document.createElement('main')
  document.body.append(container)
  const root = createRoot(container)
  await act(async () =>
    root.render(
      createElement(UpdateActivityDialog, {
        edition: { id: 1, editionNumber: '2026', eventName: 'Festival' },
        artistas: [{
          id: 5,
          pseudonym: 'Sol',
          statusId: 1,
          pseudonyms: [{ id: 13, pseudonym: 'Sol', isPrimary: true }]
        }]
      })
    )
  )
  // Per-occurrence URL is hydrated independently from the global registration window.
  const urlInput = container.querySelector<HTMLInputElement>('[name="occurrences.0.url"]')
  expect(urlInput?.value).toBe('https://example.org/registro')
  expect(container.querySelector<HTMLInputElement>('#registration-startTime-hour')?.value).toBe('12')
  expect(container.querySelector<HTMLInputElement>('#registration-startTime-minute')?.value).toBe('00')

  // Registration form renders correctly (pickers tested in integration)

  const musicButton = container.querySelectorAll<HTMLButtonElement>('[data-select] button')[1]
  await act(async () => musicButton?.click())
  // When music is selected, registration pickers are hidden
  expect(findPickerButton(container, 'Inicio: fecha')).toBeNull()
  await act(async () =>
    container
      .querySelector<HTMLFormElement>('form')
      ?.dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true })
      )
  )
  expect(updateAction).toHaveBeenCalledWith(
    expect.objectContaining({
      activity: expect.objectContaining({ tipoActividadId: 3 }),
      registration: EMPTY_REGISTRATION
    })
  )
  await act(async () =>
    [...container.querySelectorAll<HTMLButtonElement>('[data-select] button')]
      .find((button) => button.textContent === 'Cambiar participante')?.click()
  )
  // When banda is selected, registration section is hidden
  expect(
    container.querySelector<HTMLInputElement>('[name="registration.url"]')
  ).toBeNull()
  await disposeRoot(root)
  container.remove()
  selectedActivity = { entity: null, activity: null }
})

test('activity status guidance follows the selected state in create and update forms', async () => {
  const note =
    'Esta actividad no se mostrará en la web a menos que tenga estado Confirmado o Completado.'
  const edition = { id: 1, editionNumber: '2026', eventName: 'Festival' }
  const { CreateActivityDialog } = await import(
    '@/core/eventos/participaciones/_components/create-activity-dialog'
  )
  const createContainer = document.createElement('main')
  document.body.append(createContainer)
  const createRootInstance = createRoot(createContainer)
  await act(async () =>
    createRootInstance.render(
      createElement(CreateActivityDialog, {
        edition,
        artistas: [],
        agrupaciones: [],
        bandas: []
      })
    )
  )
  expect(createContainer.textContent).toContain(note)
  for (const status of ['confirmado', 'completado']) {
    await act(async () =>
      Array.from(createContainer.querySelectorAll<HTMLButtonElement>('button'))
        .find((button) => button.textContent === `Estado ${status}`)
        ?.click()
    )
    expect(createContainer.textContent).not.toContain(note)
  }
  await act(async () =>
    Array.from(createContainer.querySelectorAll<HTMLButtonElement>('button'))
      .find((button) => button.textContent === 'Estado cancelado')
      ?.click()
  )
  expect(createContainer.textContent).toContain(note)
  await disposeRoot(createRootInstance)
  createContainer.remove()

  selectedActivity = {
    entity: {
      artist: { id: 5, pseudonym: 'Sol', statusId: 1 },
      collective: null,
      band: null
    },
    activity: {
      id: 7,
      participacionId: 3,
      tipoActividadId: 1,
      modoIngresoId: 1,
      notas: '',
      estado: 'seleccionado',
      puntaje: null,
      detail: {
        id: 4,
        titulo: 'Taller',
        descripcion: '',
        duracionMinutos: null,
        cupos: null,
        horaInicio: '',
        ubicacion: ''
      },
      registration: null,
      occurrences: []
    }
  }
  const { UpdateActivityDialog } = await import(
    '@/core/eventos/participaciones/_components/update-activity-dialog'
  )
  const updateContainer = document.createElement('main')
  document.body.append(updateContainer)
  const updateRootInstance = createRoot(updateContainer)
  await act(async () =>
    updateRootInstance.render(
      createElement(UpdateActivityDialog, { edition })
    )
  )
  expect(updateContainer.textContent).toContain(note)
  for (const status of ['confirmado', 'completado']) {
    await act(async () =>
      Array.from(updateContainer.querySelectorAll<HTMLButtonElement>('button'))
        .find((button) => button.textContent === `Estado ${status}`)
        ?.click()
    )
    expect(updateContainer.textContent).not.toContain(note)
  }
  await act(async () =>
    Array.from(updateContainer.querySelectorAll<HTMLButtonElement>('button'))
      .find((button) => button.textContent === 'Estado cancelado')
      ?.click()
  )
  expect(updateContainer.textContent).toContain(note)
  await disposeRoot(updateRootInstance)
  updateContainer.remove()
  selectedActivity = { entity: null, activity: null }
})

test('music hides registration, keeps date selection visible, and cannot submit without a date', async () => {
  createAction.mockClear()
  const { CreateActivityDialog } =
    await import('@/core/eventos/participaciones/_components/create-activity-dialog')
  const container = document.createElement('main')
  document.body.append(container)
  const root = createRoot(container)
  await act(async () =>
    root.render(
      createElement(CreateActivityDialog, {
        edition: { id: 1, editionNumber: '2026', eventName: 'Festival' },
        artistas: [],
        agrupaciones: [],
        bandas: []
      })
    )
  )
  await act(async () =>
    Array.from(container.querySelectorAll<HTMLButtonElement>('button'))
      .find((button) => button.textContent === 'Cambiar participante')
      ?.click()
  )
  expect(findPickerButton(container, 'Inicio: fecha')).toBeNull()
  expect(container.querySelector('#occurrence-new-date')).not.toBeNull()
  expect(container.querySelector<HTMLInputElement>('[name="registration.url"]')).toBeNull()
  await act(async () =>
    container.querySelector<HTMLFormElement>('form')?.dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true })
    )
  )
  expect(createAction).not.toHaveBeenCalled()
  await disposeRoot(root)
  container.remove()
})

test('submits complete update registration and refreshes after success', async () => {
  updateAction.mockClear()
  refresh.mockClear()
  close.mockClear()
  selectedActivity = {
    entity: {
      artist: { id: 5, pseudonym: 'Sol', statusId: 1 },
      collective: null,
      band: null
    },
    activity: {
      id: 7,
      participacionId: 3,
      tipoActividadId: 1,
      modoIngresoId: 1,
      notas: '',
      estado: 'completado',
      puntaje: null,
      detail: {
        id: 4,
        titulo: 'Taller',
        descripcion: '',
        duracionMinutos: null,
        cupos: null,
        horaInicio: '',
        ubicacion: ''
      },
      occurrences: [{ id: 71, date: '2026-07-01', startTime: '12:00', durationMinutes: 60, url: 'https://example.org/registro' }],
      registration: {
        url: 'https://example.org/registro',
        startDate: '2026-07-01',
        startTime: '12:00',
        endDate: '2026-07-02',
        endTime: '12:00',
        registrationEnabled: true
      }
    }
  }
  const { UpdateActivityDialog } =
    await import('@/core/eventos/participaciones/_components/update-activity-dialog')
  const container = document.createElement('main')
  document.body.append(container)
  const root = createRoot(container)
  await act(async () =>
    root.render(
      createElement(UpdateActivityDialog, {
        edition: { id: 1, editionNumber: '2026', eventName: 'Festival' }
      })
    )
  )
  await act(async () => {
    container
      .querySelector('form')
      ?.dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true })
      )
  })
  expect(updateAction).toHaveBeenCalledWith(
    expect.objectContaining({
      registration: selectedActivity.activity?.registration
    })
  )
  expect(close).toHaveBeenCalledTimes(1)
  expect(refresh).toHaveBeenCalledTimes(1)
  expect(
    container.querySelector<HTMLButtonElement>('button[type="submit"]')
      ?.disabled
  ).toBe(true)
  expect(
    container.querySelector<HTMLInputElement>('[name="occurrences.0.url"]')
      ?.value
  ).toBe('https://example.org/registro')
  await disposeRoot(root)
  container.remove()
  selectedActivity = { entity: null, activity: null }
})