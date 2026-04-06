import { beforeEach, describe, expect, mock, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'

const setParams = mock(() => {})

let currentParams = {
  page: 1,
  pageSize: 20,
  mostrar_eliminados: false
}

let deletedToggleProps: {
  onToggle: () => void
  showDeleted: boolean
  deletedCount: number
} | null = null

mock.module('nuqs', () => ({
  throttle: () => 300,
  useQueryStates: () => [currentParams, setParams]
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
    toggleShowDeleted: () =>
      options.onShowDeletedChange?.(!(options.showDeleted ?? false)),
    handleDelete: () => undefined,
    handleRestore: () => undefined,
    deletedCount: options.deletedItems.length
  })
}))

mock.module('@/shared/components/empty-state', () => ({
  EmptyState: (props: { title: string }) => <div data-title={props.title} />
}))

mock.module('@/shared/components/pagination-controls', () => ({
  PaginationControls: () => <div data-testid='pagination-controls' />
}))

mock.module('@/core/artistas/bandas/_components/band-list-table', () => ({
  BandListTable: () => <div data-testid='band-list-table' />
}))

mock.module('@/core/artistas/bandas/_components/band-create-dialog', () => ({
  BandCreateDialog: () => <div data-testid='band-create-dialog' />
}))

mock.module('@/core/artistas/bandas/_components/band-update-dialog', () => ({
  BandUpdateDialog: () => <div data-testid='band-update-dialog' />
}))

mock.module('@/core/artistas/bandas/_actions/delete-banda.action', () => ({
  deleteBandaAction: async () => ({ success: true })
}))

mock.module('@/core/artistas/bandas/_actions/restore-banda.action', () => ({
  restoreBandaAction: async () => ({ success: true })
}))

const { BandListContainer } =
  await import('@/core/artistas/bandas/_components/band-list-container')

const activeBands = {
  data: [
    {
      id: 1,
      name: 'Los Andes',
      description: null,
      email: null,
      phone: null,
      city: 'La Serena',
      country: 'Chile',
      active: true,
      createdAt: '2026-03-22 12:00:00'
    }
  ],
  total: 1,
  page: 1,
  pageSize: 20,
  totalPages: 1
}

const deletedBands = {
  data: [
    {
      id: 2,
      name: 'Mar de Fondo',
      description: null,
      email: null,
      phone: null,
      city: 'Coquimbo',
      country: 'Chile',
      active: false,
      createdAt: '2026-03-20 12:00:00',
      deletedAt: '2026-03-21 12:00:00'
    }
  ],
  total: 1,
  page: 1,
  pageSize: 20,
  totalPages: 1
}

describe('BandListContainer', () => {
  beforeEach(() => {
    setParams.mockClear()
    currentParams = {
      page: 1,
      pageSize: 20,
      mostrar_eliminados: false
    }
    deletedToggleProps = null
  })

  test('writes mostrar_eliminados=true and resets page when deleted view is toggled on', () => {
    renderToStaticMarkup(
      <BandListContainer
        activeBands={activeBands}
        deletedBands={deletedBands}
      />
    )

    deletedToggleProps?.onToggle()

    expect(setParams).toHaveBeenCalledWith({
      page: 1,
      mostrar_eliminados: true
    })
  })

  test('renders create and update dialogs in active view', () => {
    const markup = renderToStaticMarkup(
      <BandListContainer
        activeBands={activeBands}
        deletedBands={deletedBands}
      />
    )

    expect(markup).toContain('data-testid="band-create-dialog"')
    expect(markup).toContain('data-testid="band-update-dialog"')
  })

  test('hides create dialog in deleted view and keeps update dialog mounted', () => {
    currentParams = {
      ...currentParams,
      mostrar_eliminados: true
    }

    const markup = renderToStaticMarkup(
      <BandListContainer
        activeBands={activeBands}
        deletedBands={deletedBands}
      />
    )

    expect(markup).not.toContain('data-testid="band-create-dialog"')
    expect(markup).toContain('data-testid="band-update-dialog"')
  })
})
