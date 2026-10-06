import { afterEach, describe, expect, mock, test } from 'bun:test'
import { createElement, isValidElement } from 'react'
import type { FormEvent, FormEventHandler, ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import type { CatalogUpdateFormInput } from '@/core/artistas/catalogo/_schemas/catalog.schema'

let pendingAvatar = false
let closeDialog = mock(() => {})
let refreshRouter = mock(() => {})
let capturedSubmit: FormEventHandler<HTMLFormElement> | null = null
let submittedData: CatalogUpdateFormInput = {
  descripcion: 'Descripción del catálogo',
  pseudonimoId: 7,
  activo: true,
  destacado: false,
  expectedActive: { id: 1, path: 'avatars/artist.webp', version: 'v1' },
  intent: 'unchanged'
}
let updateActionResult: {
  success: boolean
  errors?: { message: string; entityType?: string }[]
  webRevalidation?: 'swr' | 'immediate'
} = { success: true }

// Mutable so tests can vary avatar presence (the activo switch locks without
// an active avatar, mirroring the catalog row).
let selectedCatalog: Record<string, unknown> = {
  id: 1,
  activo: true,
  destacado: false,
  descripcion: null,
  activeAvatar: { id: 1, path: 'http://cdn.test/avatar.webp', version: 'v1' }
}

mock.module('next/navigation', () => ({ useRouter: () => ({ refresh: refreshRouter }) }))
const mockToastError = mock(() => {})
const mockToastSuccess = mock(() => {})
mock.module('sonner', () => ({
  toast: { error: mockToastError, success: mockToastSuccess }
}))
mock.module('@/core/artistas/catalogo/_store/catalog-dialog-store', () => ({
  useCatalogDialog: (select: (state: Record<string, unknown>) => unknown) =>
    select({
      closeUpdateCatalogDialog: closeDialog,
      selectedCatalog,
      selectedArtist: { id: 42, pseudonimo: 'Exact artist' }
    })
}))
mock.module('@/core/artistas/_store/artist-dialog-store', () => ({ useArtistDialog: () => () => {} }))
mock.module('@/core/artistas/catalogo/_hooks/use-avatar-controller', () => ({
  useAvatarController: () => ({
    state: { phase: 'idle', currentAvatar: null },
    enqueue: mock(async () => {}),
    cancel: mock(() => {}),
    reset: mock(() => {}),
    retry: mock(async () => {}),
    selectFile: mock(async () => ({ phase: 'ready' as const }))
  })
}))
mock.module('@/core/artistas/catalogo/_hooks/use-artist-avatar-history', () => ({ useArtistAvatarHistory: () => ({ avatars: [], selectedIndex: 0, selectedAvatar: null, selectIndex: () => {}, error: null }) }))
mock.module('@/core/artistas/catalogo/_lib/catalog-avatar-queue-state', () => ({ useCatalogAvatarPending: () => pendingAvatar }))
const mockUpdateCatalogAction = mock(async () => updateActionResult)
mock.module('@/core/artistas/catalogo/_actions/update-catalog.action', () => ({ updateCatalogAction: mockUpdateCatalogAction }))
mock.module('@/core/artistas/catalogo/_components/artist-avatar-section', () => ({ ArtistAvatarSection: () => null }))
mock.module('@/core/artistas/_components/update-artist-dialog', () => ({ UpdateArtistDialog: () => null }))
mock.module('@/shared/components/entity-form/entity-form-dialog', () => ({
  EntityFormDialog: ({
    children,
    title,
    submit,
    footerStart,
    isDirty
  }: {
    children: ReactNode
    title?: ReactNode
    submit?: unknown
    footerStart?: ReactNode
    isDirty?: boolean
  }) => {
    if (isValidElement<{ onSubmit: FormEventHandler<HTMLFormElement> }>(children)) {
      capturedSubmit = children.props.onSubmit
    }
    return createElement(
      'div',
      null,
      isDirty ? createElement('span', { 'data-testid': 'badge' }, 'Editado') : null,
      title ? createElement('h2', { 'data-testid': 'dialog-title' }, title) : null,
      children,
      submit ? createElement('div', { 'data-testid': 'dialog-footer' }, footerStart ?? null) : null
    )
  }
}))
mock.module('@/shared/components/ui/switch', () => ({ Switch: ({ disabled }: { disabled?: boolean }) => createElement('button', { 'data-testid': 'active-switch', disabled }, 'Active') }))
mock.module('react-hook-form', () => ({
  appendErrors: () => ({}),
  get: () => undefined,
  set: () => {},
  useForm: () => ({
    control: {},
    handleSubmit: (submit: (data: CatalogUpdateFormInput) => Promise<void>) =>
      async (event?: FormEvent<HTMLFormElement>) => {
        event?.preventDefault()
        await submit(submittedData)
      },
    reset: () => {},
    setValue: () => {},
    formState: { isDirty: false, isValid: true, isSubmitting: false }
  }),
  Controller: ({ render }: { render: (value: { field: { value: boolean; onChange: () => void } }) => ReactNode }) => render({ field: { value: false, onChange: () => {} } })
}))

const { UpdateCatalogDialog } = await import('@/core/artistas/catalogo/_components/update-catalog-dialog')

function renderUpdateDialog(): string {
  capturedSubmit = null
  const markup = renderToStaticMarkup(createElement(UpdateCatalogDialog))
  if (!capturedSubmit) throw new Error('Update form submit handler was not captured')
  return markup
}

async function submitUpdateDialog(): Promise<void> {
  renderUpdateDialog()
  if (!capturedSubmit) throw new Error('Update form submit handler was not captured')
  await capturedSubmit({ preventDefault: () => {} } as FormEvent<HTMLFormElement>)
}

describe('UpdateCatalogDialog pending avatar lock and freshness', () => {
  afterEach(() => {
    selectedCatalog = {
      id: 1,
      activo: true,
      destacado: false,
      descripcion: null,
      activeAvatar: { id: 1, path: 'http://cdn.test/avatar.webp', version: 'v1' }
    }
    pendingAvatar = false
    updateActionResult = { success: true }
    submittedData = {
      descripcion: 'Descripción del catálogo',
      pseudonimoId: 7,
      activo: true,
      destacado: false,
      expectedActive: { id: 1, path: 'avatars/artist.webp', version: 'v1' },
      intent: 'unchanged'
    }
    closeDialog = mock(() => {})
    refreshRouter = mock(() => {})
    capturedSubmit = null
    mockUpdateCatalogAction.mockClear()
    mockToastError.mockClear()
    mockToastSuccess.mockClear()
  })

  test('locks Active for the exact pending avatar job', () => {
    pendingAvatar = true
    const markup = renderUpdateDialog()
    expect(markup).toContain('data-testid="active-switch" disabled=""')
  })

  test('releases Active after a terminal exact job', () => {
    pendingAvatar = false
    const markup = renderUpdateDialog()
    expect(markup).toContain('data-testid="active-switch"')
    expect(markup).not.toContain('data-testid="active-switch" disabled=""')
  })

  test('does not lock Active for a nonmatching job', () => {
    pendingAvatar = false
    const markup = renderUpdateDialog()
    expect(markup).not.toContain('data-testid="active-switch" disabled=""')
  })

  test('locks Active when the catalog entry has no avatar', () => {
    pendingAvatar = false
    selectedCatalog = {
      id: 1,
      activo: false,
      destacado: false,
      descripcion: null,
      activeAvatar: null
    }
    const markup = renderUpdateDialog()
    expect(markup).toContain('data-testid="active-switch" disabled=""')
  })

  test('releases Active when an avatar exists and no job is pending', () => {
    pendingAvatar = false
    const markup = renderUpdateDialog()
    expect(markup).not.toContain('data-testid="active-switch" disabled=""')
  })

  test('R4: renders no Limpiar button in the footer', () => {
    const markup = renderUpdateDialog()
    expect(markup).toContain('data-testid="dialog-footer"')
    expect(markup).not.toContain('Limpiar')
  })

  test('shows the delayed-web notice only for successful SWR updates', async () => {
    updateActionResult = { success: true, webRevalidation: 'swr' }
    await submitUpdateDialog()

    expect(mockToastSuccess).toHaveBeenCalledWith(
      'Catálogo actualizado correctamente. Pueden tardar en aparecer en la web.'
    )
    expect(mockUpdateCatalogAction).toHaveBeenCalledWith(
      { success: false },
      expect.objectContaining({
        id: 1,
        artistaId: 42,
        expectedActive: selectedCatalog.activeAvatar,
        intent: 'unchanged'
      })
    )
    expect(closeDialog).toHaveBeenCalledTimes(1)
    expect(mockToastError).not.toHaveBeenCalled()
  })

  test.each([
    ['immediate', { webRevalidation: 'immediate' as const }],
    ['absent', {}]
  ])('preserves the original update confirmation when metadata is %s', async (_label, metadata) => {
    updateActionResult = { success: true, ...metadata }
    await submitUpdateDialog()

    expect(mockToastSuccess).toHaveBeenCalledWith('Catálogo actualizado correctamente')
    expect(mockToastError).not.toHaveBeenCalled()
  })

  test('keeps failures and avatar conflicts out of the success-toast path despite SWR metadata', async () => {
    updateActionResult = {
      success: false,
      errors: [{ message: 'No se pudo guardar', entityType: 'OTHER' }],
      webRevalidation: 'swr'
    }
    await submitUpdateDialog()
    expect(mockToastSuccess).not.toHaveBeenCalled()
    expect(mockToastError).toHaveBeenNthCalledWith(1, 'No se pudo guardar')
    expect(closeDialog).not.toHaveBeenCalled()
    expect(refreshRouter).not.toHaveBeenCalled()

    updateActionResult = {
      success: false,
      errors: [{ message: 'Conflict', entityType: 'AVATAR_CONFLICT' }],
      webRevalidation: 'swr'
    }
    await submitUpdateDialog()
    expect(mockToastSuccess).not.toHaveBeenCalled()
    expect(mockToastError).toHaveBeenNthCalledWith(
      2,
      'El avatar cambió en otra sesión. Se recargó el catálogo.'
    )
    expect(closeDialog).toHaveBeenCalledTimes(1)
    expect(refreshRouter).toHaveBeenCalledTimes(1)
  })
})
