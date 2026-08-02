import { afterEach, describe, expect, mock, test } from 'bun:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

let pendingAvatar = false

// Mutable so tests can vary avatar presence (the activo switch locks without
// an active avatar, mirroring the catalog row).
let selectedCatalog: Record<string, unknown> = {
  id: 1,
  activo: true,
  destacado: false,
  descripcion: null,
  activeAvatar: { id: 1, path: 'http://cdn.test/avatar.webp', version: 'v1' }
}

mock.module('next/navigation', () => ({ useRouter: () => ({ refresh: () => {} }) }))
mock.module('sonner', () => ({ toast: { error: () => {}, success: () => {} } }))
mock.module('@hookform/resolvers/zod', () => ({ zodResolver: () => () => ({ values: {}, errors: {} }) }))
mock.module('@/core/artistas/catalogo/_store/catalog-dialog-store', () => ({
  useCatalogDialog: (select: (state: Record<string, unknown>) => unknown) =>
    select({
      closeUpdateCatalogDialog: () => {},
      selectedCatalog,
      selectedArtist: { id: 42, pseudonimo: 'Exact artist' }
    })
}))
mock.module('@/core/artistas/_store/artist-dialog-store', () => ({ useArtistDialog: () => () => {} }))
mock.module('@/core/artistas/catalogo/_hooks/use-artist-avatar-history', () => ({ useArtistAvatarHistory: () => ({ avatars: [], selectedIndex: 0, selectedAvatar: null, selectIndex: () => {}, error: null }) }))
mock.module('@/core/artistas/catalogo/_lib/catalog-avatar-queue-state', () => ({ useCatalogAvatarPending: () => pendingAvatar }))
mock.module('@/core/artistas/catalogo/_actions/update-catalog.action', () => ({ updateCatalogAction: async () => ({ success: true }) }))
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
    children: unknown
    title?: unknown
    submit?: unknown
    footerStart?: unknown
    isDirty?: boolean
  }) =>
    createElement(
      'div',
      null,
      isDirty ? createElement('span', { 'data-testid': 'badge' }, 'Editado') : null,
      title ? createElement('h2', { 'data-testid': 'dialog-title' }, title as string) : null,
      children,
      submit
        ? createElement(
            'div',
            { 'data-testid': 'dialog-footer' },
            footerStart ?? null
          )
        : null
    )
}))
mock.module('@/shared/components/ui/switch', () => ({ Switch: ({ disabled }: { disabled?: boolean }) => createElement('button', { 'data-testid': 'active-switch', disabled }, 'Active') }))
mock.module('react-hook-form', () => ({
  get: () => undefined,
  set: () => {},
  useForm: () => ({ control: {}, handleSubmit: (submit: () => void) => submit, reset: () => {}, setValue: () => {}, formState: { isDirty: false, isValid: true, isSubmitting: false } }),
  Controller: ({ render }: { render: (value: { field: { value: boolean; onChange: () => void } }) => unknown }) => render({ field: { value: false, onChange: () => {} } })
}))

const { UpdateCatalogDialog } = await import('@/core/artistas/catalogo/_components/update-catalog-dialog')

describe('UpdateCatalogDialog pending avatar lock', () => {
  afterEach(() => {
    selectedCatalog = {
      id: 1,
      activo: true,
      destacado: false,
      descripcion: null,
      activeAvatar: { id: 1, path: 'http://cdn.test/avatar.webp', version: 'v1' }
    }
  })

  test('locks Active for the exact pending avatar job', () => {
    pendingAvatar = true
    const markup = renderToStaticMarkup(createElement(UpdateCatalogDialog))
    expect(markup).toContain('data-testid="active-switch" disabled=""')
  })

  test('releases Active after a terminal exact job', () => {
    pendingAvatar = false
    const markup = renderToStaticMarkup(createElement(UpdateCatalogDialog))
    expect(markup).toContain('data-testid="active-switch"')
    expect(markup).not.toContain('data-testid="active-switch" disabled=""')
  })

  test('does not lock Active for a nonmatching job', () => {
    pendingAvatar = false
    const markup = renderToStaticMarkup(createElement(UpdateCatalogDialog))
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
    const markup = renderToStaticMarkup(createElement(UpdateCatalogDialog))
    expect(markup).toContain('data-testid="active-switch" disabled=""')
  })

  test('releases Active when an avatar exists and no job is pending', () => {
    pendingAvatar = false
    const markup = renderToStaticMarkup(createElement(UpdateCatalogDialog))
    expect(markup).not.toContain('data-testid="active-switch" disabled=""')
  })

  test('R4: renders no Limpiar button in the footer', () => {
    const markup = renderToStaticMarkup(createElement(UpdateCatalogDialog))
    // The submit button is present, so the footer region renders — but the
    // update dialog must never show the create-only Limpiar (R4).
    expect(markup).toContain('data-testid="dialog-footer"')
    expect(markup).not.toContain('Limpiar')
  })
})
