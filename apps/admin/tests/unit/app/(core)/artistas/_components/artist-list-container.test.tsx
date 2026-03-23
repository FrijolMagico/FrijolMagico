import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'
import type { ReactElement } from 'react'

import { ARTIST_STATUS } from '@/core/artistas/_constants'
import type { ArtistWithHistory } from '@/core/artistas/_types/artist'

const emptyHistory = {
  pseudonimos: [],
  correos: [],
  ciudades: [],
  paises: [],
  rrss: {}
}

const setFilters = mock(() => {})

let currentFilters = {
  page: 1,
  limit: 20,
  search: '',
  mostrar_eliminados: false,
  pais: null,
  ciudad: null,
  estado: null
}

let deletedToggleProps: {
  onToggle: () => void
  showDeleted: boolean
  deletedCount: number
} | null = null

let artistListTableProps: {
  showDeleted: boolean
  emptyState: ReactElement
} | null = null

interface EmptyStateAction {
  label: string
  onClick: () => void
}

interface EmptyStateProps {
  action?: EmptyStateAction
}

mock.module('nuqs', () => ({
  throttle: () => 500,
  useQueryStates: () => [currentFilters, setFilters]
}))

mock.module('@/shared/components/deleted-toggle-list', () => ({
  DeletedToggle: (props: {
    onToggle: () => void
    showDeleted: boolean
    deletedCount: number
  }) => {
    deletedToggleProps = props
    return <div data-testid='deleted-toggle' />
  },
  useDeletedToggleList: (options: {
    activeItems: Array<{ id: number }>
    deletedItems: Array<{ id: number }>
    showDeleted?: boolean
    onShowDeletedChange?: (showDeleted: boolean) => void
  }) => ({
    visibleItems: options.showDeleted
      ? options.deletedItems
      : options.activeItems,
    showDeleted: options.showDeleted ?? false,
    toggleShowDeleted: () =>
      options.onShowDeletedChange?.(!(options.showDeleted ?? false)),
    handleDelete: () => undefined,
    handleRestore: () => undefined,
    deletedCount: options.deletedItems.length,
    isPending: false
  })
}))

mock.module('@/shared/components/empty-state', () => ({
  EmptyState: (props: {
    title: string
    description: string
    action?: { label: string; onClick: () => void }
  }) => <div data-title={props.title} />
}))

mock.module('@/shared/components/pagination-controls', () => ({
  PaginationControls: () => <div data-testid='pagination-controls' />
}))

mock.module('@/core/artistas/_components/artist-list-filters', () => ({
  ArtistListFilters: () => <div data-testid='artist-list-filters' />
}))

mock.module('@/core/artistas/_components/artist-list-table', () => ({
  ArtistListTable: (props: {
    showDeleted: boolean
    emptyState: ReactElement
  }) => {
    artistListTableProps = props
    return <div data-testid='artist-list-table' />
  }
}))

mock.module('@/core/artistas/_components/update-artist-dialog', () => ({
  UpdateArtistDialog: () => <div data-testid='update-artist-dialog' />
}))

mock.module('@/core/artistas/_components/create-artist-dialog', () => ({
  CreateArtistDialog: () => <div data-testid='create-artist-dialog' />
}))

mock.module('@/core/artistas/_components/artist-history-dialog', () => ({
  ArtistHistoryDialog: () => <div data-testid='artist-history-dialog' />
}))

mock.module('@/core/artistas/_actions/delete-artista.action', () => ({
  deleteArtistaAction: async () => ({ success: true })
}))

mock.module('@/core/artistas/_actions/restore-artista.action', () => ({
  restoreArtistaAction: async () => ({ success: true })
}))

const { ArtistListContainer } =
  await import('@/core/artistas/_components/artist-list-container')

const activeArtist: ArtistWithHistory = {
  id: 1,
  pseudonimo: 'Ana Luna',
  nombre: 'Ana',
  rut: null,
  telefono: null,
  correo: 'ana@frijolmagico.cl',
  ciudad: 'Santiago',
  pais: 'Chile',
  estadoId: ARTIST_STATUS.ACTIVE,
  rrss: {},
  deletedAt: null,
  history: emptyHistory
}

const deletedArtist: ArtistWithHistory = {
  ...activeArtist,
  id: 2,
  pseudonimo: 'Ana Eliminada',
  deletedAt: '2026-03-23T00:00:00Z'
}

const defaultProps = {
  artists: [activeArtist],
  deletedArtists: [deletedArtist],
  countries: [],
  cities: [],
  pagination: {
    total: 1,
    page: 1,
    pageSize: 20,
    totalPages: 1
  }
}

describe('ArtistListContainer', () => {
  beforeEach(() => {
    setFilters.mockClear()
    currentFilters = {
      page: 1,
      limit: 20,
      search: '',
      mostrar_eliminados: false,
      pais: null,
      ciudad: null,
      estado: null
    }
    deletedToggleProps = null
    artistListTableProps = null
  })

  test('writes mostrar_eliminados=true and resets page when deleted view is toggled on', () => {
    renderToStaticMarkup(<ArtistListContainer {...defaultProps} />)

    deletedToggleProps?.onToggle()

    expect(setFilters).toHaveBeenCalledWith({
      page: 1,
      mostrar_eliminados: true
    })
  })

  test('clears mostrar_eliminados with null when deleted view is toggled off', () => {
    currentFilters = {
      ...currentFilters,
      mostrar_eliminados: true
    }

    renderToStaticMarkup(<ArtistListContainer {...defaultProps} />)

    deletedToggleProps?.onToggle()

    expect(setFilters).toHaveBeenCalledWith({
      page: 1,
      mostrar_eliminados: null
    })
  })

  test('clear filters also resets mostrar_eliminados to null', () => {
    renderToStaticMarkup(<ArtistListContainer {...defaultProps} />)

    const emptyStateProps = artistListTableProps?.emptyState
      .props as EmptyStateProps

    emptyStateProps.action?.onClick()

    expect(setFilters).toHaveBeenCalledWith({
      page: 1,
      search: '',
      mostrar_eliminados: null,
      pais: null,
      ciudad: null,
      estado: null
    })
  })

  test('renders CreateArtistDialog in active view', () => {
    const markup = renderToStaticMarkup(
      <ArtistListContainer {...defaultProps} />
    )

    expect(markup).toContain('data-testid="create-artist-dialog"')
  })

  test('does not render CreateArtistDialog in deleted view', () => {
    currentFilters = {
      ...currentFilters,
      mostrar_eliminados: true
    }

    const markup = renderToStaticMarkup(
      <ArtistListContainer {...defaultProps} />
    )

    expect(markup).not.toContain('data-testid="create-artist-dialog"')
  })
})
