import { afterEach, describe, expect, mock, test } from 'bun:test'
import { createElement, type ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import type { Artist, ArtistUpdateFormInput } from '@/core/artistas/_schemas/artista.schema'
import type { ArtistPseudonymDraftInput } from '@/core/artistas/_schemas/artist-pseudonym.schema'
import type { ActionState } from '@/shared/types/actions'

const artist = {
  id: 42,
  nombre: 'Ana Luna',
  pseudonimo: 'Luna',
  rut: '123',
  telefono: '555',
  correo: 'ana@example.com',
  ciudad: 'Santiago',
  pais: 'Chile',
  rrss: null,
  estadoId: 1
} satisfies Artist

const submittedData = {
  nombre: 'Ana Luna',
  pseudonimo: 'Luna',
  rut: '123',
  telefono: '555',
  correo: 'ana@example.com',
  ciudad: 'Santiago',
  pais: 'Chile',
  rrss: null,
  estadoId: 1,
  historialFlags: {
    pseudonimo: false,
    correo: false,
    ciudad: false,
    pais: false,
    rrss: false
  }
} satisfies ArtistUpdateFormInput

const closeDialog = mock(() => events.push('close'))
const state = {
  selectedArtist: artist,
  isUpdateArtistOpen: true,
  closeUpdateArtistDialog: closeDialog
}
const events: string[] = []
const missingSubmitHandler = async (_data: ArtistUpdateFormInput): Promise<void> => {
  throw new Error('Update form submit handler was not captured')
}
const captured: { submit: (data: ArtistUpdateFormInput) => Promise<void> } = {
  submit: missingSubmitHandler
}
let actionResult: ActionState = { success: true }
let actionError: Error | null = null
const updateAction = mock(async (
  _previous: ActionState<Artist>,
  _input: { data: ArtistUpdateFormInput; pseudonymDrafts: ArtistPseudonymDraftInput[] }
): Promise<ActionState> => {
  if (actionError) throw actionError
  return actionResult
})
const toastError = mock((message: string) => events.push(`error:${message}`))
const toastSuccess = mock((message: string) => events.push(`success:${message}`))

mock.module('sonner', () => ({ toast: { error: toastError, success: toastSuccess } }))
mock.module('@/core/artistas/_store/artist-dialog-store', () => ({
  useArtistDialog: (selector: (value: typeof state) => unknown) => selector(state)
}))
mock.module('@/core/artistas/_actions/update-artista.action', () => ({
  updateArtistaWithPseudonymsAction: updateAction
}))
mock.module('@/shared/components/entity-form/entity-form-dialog', () => ({
  EntityFormDialog: ({ children }: { children: ReactNode }) => children
}))
mock.module('@/core/artistas/_components/artist-form-layout', () => ({
  ArtistFormLayout: () => null
}))
mock.module('react-hook-form', () => ({
  appendErrors: () => ({}),
  get: () => undefined,
  set: () => {},
  FormProvider: ({ children }: { children: ReactNode }) => children,
  useForm: () => ({
    control: {},
    handleSubmit: (submit: (data: ArtistUpdateFormInput) => Promise<void>) => {
      captured.submit = submit
      return async () => {}
    }
  }),
  useFormState: () => ({ isValid: true, isDirty: true, isSubmitting: false })
}))

const { UpdateArtistDialog } = await import('@/core/artistas/_components/update-artist-dialog')

async function submitUpdateDialog(): Promise<void> {
  captured.submit = missingSubmitHandler
  renderToStaticMarkup(createElement(UpdateArtistDialog))
  await captured.submit(submittedData)
}

describe('UpdateArtistDialog web freshness feedback', () => {
  afterEach(() => {
    actionResult = { success: true }
    actionError = null
    events.length = 0
    closeDialog.mockClear()
    updateAction.mockClear()
    toastError.mockClear()
    toastSuccess.mockClear()
    captured.submit = missingSubmitHandler
  })

  test('adds the delayed-web notice only after successful SWR updates', async () => {
    actionResult = { success: true, webRevalidation: 'swr' }
    await submitUpdateDialog()

    expect(updateAction).toHaveBeenCalledWith(
      { success: false, data: artist },
      { data: submittedData, pseudonymDrafts: [] }
    )
    expect(events).toEqual([
      'close',
      'success:Artista actualizado correctamente. Pueden tardar en aparecer en la web.'
    ])
    expect(toastError).not.toHaveBeenCalled()
  })

  test.each([
    ['immediate', { webRevalidation: 'immediate' as const }],
    ['absent', {}]
  ])('keeps the existing success copy when metadata is %s', async (_label, metadata) => {
    actionResult = { success: true, ...metadata }
    await submitUpdateDialog()

    expect(events).toEqual(['close', 'success:Artista actualizado correctamente'])
  })

  test('keeps failed SWR results on the error path without closing', async () => {
    actionResult = {
      success: false,
      errors: [{ entityType: 'artista', message: 'No se pudo guardar' }],
      webRevalidation: 'swr'
    }
    await submitUpdateDialog()

    expect(events).toEqual(['error:No se pudo guardar'])
    expect(toastSuccess).not.toHaveBeenCalled()
    expect(closeDialog).not.toHaveBeenCalled()
  })

  test('preserves rejected action exceptions without notifications or closing', async () => {
    actionError = new Error('Action exception')

    await expect(submitUpdateDialog()).rejects.toThrow('Action exception')

    expect(events).toEqual([])
    expect(closeDialog).not.toHaveBeenCalled()
  })
})
