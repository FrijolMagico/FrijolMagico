import { describe, expect, test } from 'bun:test'
import { act, createElement } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Window } from 'happy-dom'
import { useDebouncedCallback } from 'use-debounce'
import { resolvePresenterText } from '@/core/eventos/participaciones/_components/activity-presenter-fields'
import { activityFormSchema } from '@/core/eventos/participaciones/_schemas/activity.schema'
import { ARTIST_STATUS } from '@/core/artistas/_constants'
import type { ArtistLookup } from '@/core/eventos/participaciones/_types/participations.types'
import type { ActivityFormInput } from '@/core/eventos/participaciones/_schemas/activity.schema'

const window = new Window()
globalThis.window = window as unknown as Window & typeof globalThis
globalThis.document = window.document as unknown as Document
globalThis.Node = window.Node as typeof Node
globalThis.HTMLElement = window.HTMLElement as typeof HTMLElement
globalThis.HTMLInputElement = window.HTMLInputElement as typeof HTMLInputElement
globalThis.Element = window.Element as typeof Element
globalThis.Event = window.Event as typeof Event
globalThis.requestAnimationFrame = window.requestAnimationFrame.bind(window)
globalThis.cancelAnimationFrame = window.cancelAnimationFrame.bind(window)
globalThis.IS_REACT_ACT_ENVIRONMENT = true
const { createRoot } = await import('react-dom/client')
const { ActivityPresenterFields, applyPresenterOption } = await import(
  '@/core/eventos/participaciones/_components/activity-presenter-fields'
)

const artists: ArtistLookup[] = [
  {
    id: 10,
    pseudonym: 'Primary artist',
    statusId: 1,
    pseudonyms: [
      { id: 101, pseudonym: 'Ada', isPrimary: true },
      { id: 102, pseudonym: 'Lovelace', isPrimary: false }
    ]
  },
  {
    id: 20,
    pseudonym: 'Other artist',
    statusId: 1,
    pseudonyms: [{ id: 201, pseudonym: 'ADA', isPrimary: true }]
  },
  {
    id: 30,
    pseudonym: 'Cancelled artist',
    statusId: ARTIST_STATUS.CANCELLED,
    pseudonyms: [{ id: 301, pseudonym: 'Grace', isPrimary: true }]
  }
]

const validTalk: ActivityFormInput = {
  participantType: 'artista', tipoActividadId: 2, modoIngresoId: 1,
  notas: '', estado: 'seleccionado', puntaje: null, pseudonimoId: null,
  entity: { artistaId: 1, agrupacionId: null, bandaId: null },
  detail: {
    titulo: 'Charla', descripcion: '', duracionMinutos: null, cupos: null,
    horaInicio: '', ubicacion: '', presenterNombre: '',
    presenterArtistaId: null, presenterPseudonimoId: null
  },
  occurrences: [{ date: '2026-06-12', startTime: '', durationMinutes: null }]
}

function PresenterForm({ onSubmit }: { onSubmit?: (value: ActivityFormInput) => void }) {
  const methods = useForm<ActivityFormInput>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: validTalk
  })
  return createElement(
    'form',
    { onSubmit: methods.handleSubmit((value) => onSubmit?.(value)) },
    createElement(ActivityPresenterFields, { methods, artistas: artists }),
    createElement(
      'button',
      {
        type: 'button',
        onClick: () => {
          methods.setError('detail.presenterNombre', { message: 'Ingresá un nombre' })
          methods.setError('detail.presenterArtistaId', { message: 'Seleccioná un artista' })
          methods.setError('detail.presenterPseudonimoId', { message: 'Seleccioná un pseudónimo' })
        }
      },
      'Mostrar errores'
    )
  )
}

async function renderPresenterForm(onSubmit?: (value: ActivityFormInput) => void) {
  const container = document.createElement('main')
  document.body.append(container)
  const root = createRoot(container)
  await act(async () => root.render(createElement(PresenterForm, { onSubmit })))
  return {
    container,
    dispose: async () => {
      await act(async () => root.unmount())
      container.remove()
    }
  }
}

async function typeIn(input: HTMLInputElement, value: string) {
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, value)
    input.dispatchEvent(new window.InputEvent('input', { bubbles: true, inputType: 'insertText', data: value.slice(-1) }))
  })
}

async function submit(container: HTMLElement) {
  await act(async () => {
    container.querySelector('form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
  })
}

describe('ActivityPresenterFields interactions', () => {
  test('retains spaces across the debounce pause, then submits trimmed free text after blur', async () => {
    const submissions: ActivityFormInput[] = []
    const { container, dispose } = await renderPresenterForm((value) => submissions.push(value))
    const input = container.querySelector<HTMLInputElement>('input[role="combobox"]')!
    await act(async () => input.focus())
    await typeIn(input, 'Ana ')
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 380)) })
    expect(input.value).toBe('Ana ')
    await typeIn(input, 'Ana María')
    await act(async () => input.blur())
    expect(input.value).toBe('Ana María')
    await submit(container)
    expect(submissions).toHaveLength(1)
    expect(submissions[0]!.detail).toMatchObject({
      presenterNombre: 'Ana María', presenterArtistaId: null, presenterPseudonimoId: null
    })
    await dispose()
  })

  test('keeps unmatched input through Base UI focus-out and submits it', async () => {
    const submissions: ActivityFormInput[] = []
    const { container, dispose } = await renderPresenterForm((value) => submissions.push(value))
    const input = container.querySelector<HTMLInputElement>('input[role="combobox"]')!
    await act(async () => input.focus())
    await typeIn(input, 'Someone new')
    await act(async () => input.blur())
    expect(input.value).toBe('Someone new')
    await submit(container)
    expect(submissions[0]?.detail.presenterNombre).toBe('Someone new')
    await dispose()
  })

  test('keeps a free presenter after keyboard Escape closes the menu and focus leaves', async () => {
    const submissions: ActivityFormInput[] = []
    const { container, dispose } = await renderPresenterForm((value) => submissions.push(value))
    const input = container.querySelector<HTMLInputElement>('input[role="combobox"]')!
    await act(async () => input.focus())
    await typeIn(input, 'Ana María')
    await act(async () => input.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })))
    await act(async () => input.blur())
    expect(input.value).toBe('Ana María')
    await submit(container)
    expect(submissions[0]?.detail.presenterNombre).toBe('Ana María')
    await dispose()
  })

  test('applies a selected option atomically and cancels pending text before resolver submission', async () => {
    const submissions: ActivityFormInput[] = []
    function SelectionForm() {
      const methods = useForm<ActivityFormInput>({
        resolver: zodResolver(activityFormSchema),
        defaultValues: validTalk
      })
      const pendingText = useDebouncedCallback(() => {
        methods.setValue('detail', {
          ...methods.getValues('detail'),
          presenterNombre: 'Love', presenterArtistaId: null, presenterPseudonimoId: null
        })
      }, 300)
      return createElement('form', { onSubmit: methods.handleSubmit((value) => submissions.push(value)) },
        createElement('button', { type: 'button', onClick: () => pendingText() }, 'Queue text'),
        createElement('button', {
          type: 'button',
          onClick: () => applyPresenterOption(methods, { artistId: 10, pseudonymId: 102 }, () => pendingText.cancel())
        }, 'Select Lovelace'))
    }
    const container = document.createElement('main')
    document.body.append(container)
    const root = createRoot(container)
    await act(async () => root.render(createElement(SelectionForm)))
    const buttons = container.querySelectorAll('button')
    await act(async () => buttons[0]!.click())
    await act(async () => buttons[1]!.click())
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 380)) })
    await submit(container)
    expect(submissions).toHaveLength(1)
    expect(submissions[0]!.detail).toMatchObject({
      presenterNombre: '', presenterArtistaId: 10, presenterPseudonimoId: 102
    })
    await act(async () => root.unmount())
    container.remove()
  })
})

describe('ActivityPresenterFields accessibility', () => {
  test('connects its visible label and input and references all rendered errors', async () => {
    const { container, dispose } = await renderPresenterForm()
    const label = container.querySelector('label[data-slot="field-label"]')!
    const input = container.querySelector<HTMLInputElement>('input[role="combobox"]')!
    expect(label.getAttribute('for')).toBe(input.id)
    expect(input.id).toBeTruthy()

    const button = Array.from(container.querySelectorAll('button')).find(
      (item) => item.textContent === 'Mostrar errores'
    )!
    await act(async () => button.click())
    expect(input.getAttribute('aria-invalid')).toBe('true')
    const describedBy = input.getAttribute('aria-describedby')?.split(/\s+/) ?? []
    const errors = Array.from(container.querySelectorAll('[role="alert"]'))
    expect(errors).toHaveLength(3)
    expect(describedBy).toHaveLength(errors.length)
    expect(describedBy).toEqual(errors.map((error) => error.id))
    for (const error of errors) expect(error.id).toBeTruthy()
    await dispose()
  })

  test('omits invalid state and error descriptions when there are no errors', async () => {
    const { container, dispose } = await renderPresenterForm()
    const input = container.querySelector<HTMLInputElement>('input[role="combobox"]')!
    expect(input.getAttribute('aria-invalid')).toBeNull()
    expect(input.getAttribute('aria-describedby')).toBeNull()
    await dispose()
  })
})

describe('resolvePresenterText', () => {
  test('matches trimmed pseudonym text case-insensitively when the match is unique', () => {
    expect(resolvePresenterText('  Lovelace  ', artists)).toEqual({
      type: 'linked',
      artistId: 10,
      pseudonymId: 102
    })
  })

  test('keeps unmatched and case-colliding text as a free presenter name', () => {
    expect(resolvePresenterText('Someone new', artists)).toEqual({
      type: 'free',
      presenterNombre: 'Someone new'
    })
    expect(resolvePresenterText(' ada ', artists)).toEqual({
      type: 'free',
      presenterNombre: 'ada'
    })
  })

  test('does not match pseudonyms belonging to cancelled artists', () => {
    expect(resolvePresenterText('Grace', artists)).toEqual({
      type: 'free',
      presenterNombre: 'Grace'
    })
  })

  test('treats trimmed empty text as no presenter', () => {
    expect(resolvePresenterText('  ', artists)).toEqual({ type: 'none' })
  })
})
