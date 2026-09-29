import { describe, expect, test } from 'bun:test'
import { act, createElement } from 'react'
import { useForm } from 'react-hook-form'
import { Window } from 'happy-dom'
import { resolvePresenterText } from '@/core/eventos/participaciones/_components/activity-presenter-fields'
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
globalThis.IS_REACT_ACT_ENVIRONMENT = true
const { createRoot } = await import('react-dom/client')
const { ActivityPresenterFields } = await import(
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

function PresenterForm() {
  const methods = useForm<ActivityFormInput>({
    defaultValues: {
      detail: {
        presenterNombre: '',
        presenterArtistaId: null,
        presenterPseudonimoId: null
      }
    }
  })
  return createElement(
    'form',
    null,
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

async function renderPresenterForm() {
  const container = document.createElement('main')
  document.body.append(container)
  const root = createRoot(container)
  await act(async () => root.render(createElement(PresenterForm)))
  return {
    container,
    dispose: async () => {
      await act(async () => root.unmount())
      container.remove()
    }
  }
}

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
