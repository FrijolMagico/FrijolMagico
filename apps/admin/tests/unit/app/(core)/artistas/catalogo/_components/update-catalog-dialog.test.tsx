import { describe, expect, mock, test } from 'bun:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

let pendingAvatar = false

mock.module('next/navigation', () => ({ useRouter: () => ({ refresh: () => {} }) }))
mock.module('sonner', () => ({ toast: { error: () => {}, success: () => {} } }))
mock.module('@hookform/resolvers/zod', () => ({ zodResolver: () => () => ({ values: {}, errors: {} }) }))
mock.module('@/core/artistas/catalogo/_store/catalog-dialog-store', () => ({
  useCatalogDialog: (select: (state: Record<string, unknown>) => unknown) =>
    select({
      closeUpdateCatalogDialog: () => {},
      selectedCatalog: { id: 1, activo: true, destacado: false, descripcion: null, activeAvatar: null },
      selectedArtist: { id: 42, pseudonimo: 'Exact artist' }
    })
}))
mock.module('@/core/artistas/_store/artist-dialog-store', () => ({ useArtistDialog: () => () => {} }))
mock.module('@/core/artistas/catalogo/_hooks/use-artist-avatar-history', () => ({ useArtistAvatarHistory: () => ({ avatars: [], selectedIndex: 0, selectedAvatar: null, selectIndex: () => {}, error: null }) }))
mock.module('@/core/artistas/catalogo/_lib/catalog-avatar-queue-state', () => ({ useCatalogAvatarPending: () => pendingAvatar }))
mock.module('@/core/artistas/catalogo/_actions/update-catalog.action', () => ({ updateCatalogAction: async () => ({ success: true }) }))
mock.module('@/core/artistas/catalogo/_components/artist-avatar-section', () => ({ ArtistAvatarSection: () => null }))
mock.module('@/core/artistas/_components/update-artist-dialog', () => ({ UpdateArtistDialog: () => null }))
mock.module('@/shared/components/entity-form/entity-form-dialog', () => ({ EntityFormDialog: ({ children }: { children: unknown }) => createElement('div', null, children) }))
mock.module('@/shared/components/ui/switch', () => ({ Switch: ({ disabled }: { disabled?: boolean }) => createElement('button', { 'data-testid': 'active-switch', disabled }, 'Active') }))
mock.module('react-hook-form', () => ({
  get: () => undefined,
  set: () => {},
  useForm: () => ({ control: {}, handleSubmit: (submit: () => void) => submit, reset: () => {}, setValue: () => {}, formState: { isDirty: false, isValid: true, isSubmitting: false } }),
  Controller: ({ render }: { render: (value: { field: { value: boolean; onChange: () => void } }) => unknown }) => render({ field: { value: false, onChange: () => {} } })
}))

const { UpdateCatalogDialog } = await import('@/core/artistas/catalogo/_components/update-catalog-dialog')

describe('UpdateCatalogDialog pending avatar lock', () => {
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
})
