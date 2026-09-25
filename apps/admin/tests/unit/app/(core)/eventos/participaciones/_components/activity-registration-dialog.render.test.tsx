import { expect, test, mock } from 'bun:test'
import { createElement, act } from 'react'
import { useController, useForm } from 'react-hook-form'
import type { ActivityFormInput } from '@/core/eventos/participaciones/_schemas/activity.schema'
import { Window } from 'happy-dom'

const window = new Window()
globalThis.window = window as unknown as Window & typeof globalThis
globalThis.document = window.document as unknown as Document
globalThis.Node = window.Node as typeof Node
globalThis.HTMLElement = window.HTMLElement as typeof HTMLElement
globalThis.HTMLInputElement = window.HTMLInputElement as typeof HTMLInputElement
globalThis.Event = window.Event as typeof Event
globalThis.IS_REACT_ACT_ENVIRONMENT = true
const { createRoot } = await import('react-dom/client')

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

let selectedActivity: Record<string, unknown> = { entity: null, activity: null }
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
const createAction = mock(async (_payload: unknown) => ({ success: true }))
mock.module(
  '@/core/eventos/participaciones/_actions/activities/create-activity.action',
  () => ({
    createActivityAction: createAction
  })
)
const updateAction = mock(async (_payload: unknown) => ({ success: true }))
mock.module(
  '@/core/eventos/participaciones/_actions/activities/update-activity-aggregate.action',
  () => ({
    updateActivityAggregateAction: updateAction
  })
)

const { ActivityRegistrationFields, EMPTY_REGISTRATION } =
  await import('@/core/eventos/participaciones/_components/activity-registration-fields')

function RegistrationForm() {
  const methods = useForm<ActivityFormInput>({
    defaultValues: { registration: EMPTY_REGISTRATION }
  })
  return createElement(ActivityRegistrationFields, { methods, disabled: false })
}

test('renders shared registration controls with empty defaults', async () => {
  const container = document.createElement('main')
  document.body.append(container)
  const root = createRoot(container)
  await act(async () => root.render(createElement(RegistrationForm)))
  expect(
    container.querySelector<HTMLInputElement>('#registration-url')?.value
  ).toBe('')
  expect(container.querySelectorAll('input')).toHaveLength(5)
  expect(
    container.querySelector<HTMLLabelElement>('label[for="registration-url"]')
      ?.textContent
  ).toBe('Enlace HTTPS de inscripción')
  expect(
    container.querySelector<HTMLInputElement>('#registration-url')?.type
  ).toBe('url')
  expect(
    container.querySelector<HTMLInputElement>('[name="registration.startDate"]')
      ?.type
  ).toBe('date')
  expect(
    container.querySelector<HTMLInputElement>('[name="registration.endTime"]')
      ?.type
  ).toBe('time')
  await act(async () => root.unmount())
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
  expect(
    container.querySelectorAll('input[name^="registration."]')
  ).toHaveLength(5)
  expect(
    container.querySelector<HTMLInputElement>('[name="registration.url"]')
      ?.value
  ).toBe('')
  await act(async () => root.unmount())
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
      registration: {
        url: 'https://example.org/registro',
        startDate: '2026-07-01',
        startTime: '12:00',
        endDate: '2026-07-02',
        endTime: '12:00'
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
  expect(
    container.querySelector<HTMLInputElement>('[name="registration.url"]')
      ?.value
  ).toBe('https://example.org/registro')
  expect(
    container.querySelector<HTMLInputElement>('[name="registration.startTime"]')
      ?.value
  ).toBe('12:00')
  expect(
    container.querySelector<HTMLInputElement>('[name="registration.startDate"]')
      ?.value
  ).toBe('2026-07-01')
  expect(
    container.querySelector<HTMLInputElement>('[name="registration.endDate"]')
      ?.value
  ).toBe('2026-07-02')
  const musicButton = container.querySelector<HTMLButtonElement>(
    '[data-select] button'
  )
  await act(async () => musicButton?.click())
  expect(
    container.querySelectorAll('input[name^="registration."]')
  ).toHaveLength(0)
  await act(async () =>
    container
      .querySelector<HTMLFormElement>('form')
      ?.dispatchEvent(
        new window.Event('submit', { bubbles: true, cancelable: true })
      )
  )
  expect(updateAction).toHaveBeenCalledWith(
    expect.objectContaining({
      activity: expect.objectContaining({ tipoActividadId: 3 }),
      registration: EMPTY_REGISTRATION
    })
  )
  await act(async () =>
    container.querySelector<HTMLButtonElement>('[data-select] button')?.click()
  )
  expect(
    container.querySelector<HTMLInputElement>('[name="registration.url"]')
      ?.value
  ).toBe('')
  expect(
    container.querySelector<HTMLInputElement>('[name="registration.startDate"]')
      ?.value
  ).toBe('')
  await act(async () => root.unmount())
  container.remove()
  selectedActivity = { entity: null, activity: null }
})

// Use the native setter so React's change tracker observes edits in happy-dom.
async function enter(input: HTMLInputElement, value: string) {
  await act(async () => {
    Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value'
    )?.set?.call(input, value)
    input.dispatchEvent(new window.Event('input', { bubbles: true }))
    input.dispatchEvent(new window.Event('change', { bubbles: true }))
  })
}

async function enterRegistration(container: HTMLElement) {
  const values = {
    url: 'https://example.org/alta',
    startDate: '2026-07-01',
    startTime: '12:00',
    endDate: '2026-07-02',
    endTime: '12:00'
  }
  for (const [name, value] of Object.entries(values)) {
    const input = container.querySelector<HTMLInputElement>(
      `[name="registration.${name}"]`
    )
    if (!input) throw new Error(`Missing registration.${name}`)
    await enter(input, value)
  }
  return values
}

test('create sends edited complete registration and resets after success', async () => {
  createAction.mockClear()
  refresh.mockClear()
  const { CreateActivityDialog } =
    await import('@/core/eventos/participaciones/_components/create-activity-dialog')
  const container = document.createElement('main')
  document.body.append(container)
  const root = createRoot(container)
  await act(async () =>
    root.render(
      createElement(CreateActivityDialog, {
        edition: { id: 1, editionNumber: '2026', eventName: 'Festival' },
        artistas: [{ id: 5, pseudonym: 'Sol', statusId: 1 }],
        agrupaciones: [],
        bandas: []
      })
    )
  )
  await act(async () =>
    Array.from(container.querySelectorAll<HTMLButtonElement>('button'))
      .find((button) => button.textContent === 'Elegir participante')
      ?.click()
  )
  const registration = await enterRegistration(container)
  await act(async () =>
    container
      .querySelector<HTMLFormElement>('form')
      ?.dispatchEvent(
        new window.Event('submit', { bubbles: true, cancelable: true })
      )
  )
  expect(createAction).toHaveBeenCalledWith(
    expect.objectContaining({ registration })
  )
  expect(refresh).toHaveBeenCalledTimes(1)
  expect(
    container.querySelector<HTMLInputElement>('[name="registration.url"]')
      ?.value
  ).toBe('')
  await act(async () => root.unmount())
  container.remove()
})

test('create band selection hides, clears and submits absent registration', async () => {
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
  await enterRegistration(container)
  await act(async () =>
    Array.from(container.querySelectorAll<HTMLButtonElement>('button'))
      .find((button) => button.textContent === 'Cambiar participante')
      ?.click()
  )
  expect(
    container.querySelectorAll('input[name^="registration."]')
  ).toHaveLength(0)
  expect(container.textContent).toContain('Las bandas solo pueden participar')
  await act(async () =>
    Array.from(container.querySelectorAll<HTMLButtonElement>('button'))
      .find((button) => button.textContent === 'Cambiar participante')
      ?.click()
  )
  await act(async () =>
    Array.from(container.querySelectorAll<HTMLButtonElement>('button'))
      .find((button) => button.textContent === 'Cambiar tipo')
      ?.click()
  )
  expect(
    container.querySelector<HTMLInputElement>('[name="registration.url"]')
      ?.value
  ).toBe('')
  await act(async () =>
    Array.from(container.querySelectorAll<HTMLButtonElement>('button'))
      .find((button) => button.textContent === 'Cambiar participante')
      ?.click()
  )
  await act(async () =>
    Array.from(container.querySelectorAll<HTMLButtonElement>('button'))
      .find((button) => button.textContent === 'Elegir participante')
      ?.click()
  )
  await act(async () =>
    container
      .querySelector<HTMLFormElement>('form')
      ?.dispatchEvent(
        new window.Event('submit', { bubbles: true, cancelable: true })
      )
  )
  expect(createAction).toHaveBeenCalledWith(
    expect.objectContaining({
      activity: expect.objectContaining({ tipoActividadId: 3 }),
      registration: EMPTY_REGISTRATION
    })
  )
  await act(async () => root.unmount())
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
      registration: {
        url: 'https://example.org/registro',
        startDate: '2026-07-01',
        startTime: '12:00',
        endDate: '2026-07-02',
        endTime: '12:00'
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
        new window.Event('submit', { bubbles: true, cancelable: true })
      )
  })
  expect(updateAction).toHaveBeenCalledWith(
    expect.objectContaining({
      registration:
        selectedActivity.activity &&
        (selectedActivity.activity as { registration: unknown }).registration
    })
  )
  expect(close).toHaveBeenCalledTimes(1)
  expect(refresh).toHaveBeenCalledTimes(1)
  expect(
    container.querySelector<HTMLButtonElement>('button[type="submit"]')
      ?.disabled
  ).toBe(true)
  expect(
    container.querySelector<HTMLInputElement>('[name="registration.url"]')
      ?.value
  ).toBe('https://example.org/registro')
  await act(async () => root.unmount())
  container.remove()
  selectedActivity = { entity: null, activity: null }
})
