import { beforeEach, describe, expect, mock, test } from 'bun:test'

const toastSuccess = mock(() => {})
const toastError = mock(() => {})

mock.module('sonner', () => ({
  toast: {
    success: toastSuccess,
    error: toastError
  }
}))

const {
  applyOptimisticAction,
  getDeletedToggleBaseItems,
  resolveDeletedToggleMessages,
  runOptimisticMutation
} =
  await import('@/shared/components/deleted-toggle-list/use-deleted-toggle-list')

interface TestItem {
  id: number
  name: string
  deletedAt: string | null
}

const activeItems: TestItem[] = [
  { id: 1, name: 'Activa', deletedAt: null },
  { id: 2, name: 'Visible', deletedAt: null }
]

const deletedItems: TestItem[] = [
  { id: 3, name: 'Eliminada', deletedAt: '2026-03-22T00:00:00Z' }
]

describe('useDeletedToggleList helpers', () => {
  beforeEach(() => {
    toastSuccess.mockClear()
    toastError.mockClear()
  })

  test('uses active items by default', () => {
    expect(getDeletedToggleBaseItems(false, activeItems, deletedItems)).toEqual(
      activeItems
    )
  })

  test('switches to deleted items when deleted view is active', () => {
    expect(getDeletedToggleBaseItems(true, activeItems, deletedItems)).toEqual(
      deletedItems
    )
  })

  test('optimistically removes an item from the active view on delete', () => {
    const result = applyOptimisticAction(
      activeItems,
      { type: 'delete', id: 1, item: activeItems[0] },
      {
        showDeleted: false,
        getId: (item) => item.id,
        isDeleted: (item) => item.deletedAt !== null
      }
    )

    expect(result).toEqual([activeItems[1]])
  })

  test('optimistically removes an item from the deleted view on restore', () => {
    const result = applyOptimisticAction(
      deletedItems,
      { type: 'restore', id: 3, item: deletedItems[0] },
      {
        showDeleted: true,
        getId: (item) => item.id,
        isDeleted: (item) => item.deletedAt !== null
      }
    )

    expect(result).toEqual([])
  })

  test('uses custom messages when provided', () => {
    expect(
      resolveDeletedToggleMessages({ deleteSuccess: 'Artista eliminado' })
    ).toMatchObject({
      deleteSuccess: 'Artista eliminado',
      restoreSuccess: 'Entidad restaurada correctamente'
    })
  })

  test('shows success toast after delete success', async () => {
    const optimisticUpdate = mock(() => {})
    const serverAction = mock(async () => ({ success: true }))

    await runOptimisticMutation({
      type: 'delete',
      id: 1,
      item: activeItems[0],
      optimisticUpdate,
      serverAction,
      successMessage: 'Artista eliminado correctamente',
      errorMessage: 'Error al eliminar'
    })

    expect(optimisticUpdate).toHaveBeenCalledTimes(1)
    expect(serverAction).toHaveBeenCalledWith(1)
    expect(toastSuccess).toHaveBeenCalledWith('Artista eliminado correctamente')
    expect(toastError).not.toHaveBeenCalled()
  })

  test('shows error toast after delete failure', async () => {
    const optimisticUpdate = mock(() => {})

    await runOptimisticMutation({
      type: 'delete',
      id: 1,
      item: activeItems[0],
      optimisticUpdate,
      serverAction: async () => ({
        success: false,
        errors: [{ entityType: 'artista', message: 'No se pudo eliminar' }]
      }),
      successMessage: 'Artista eliminado correctamente',
      errorMessage: 'Error al eliminar'
    })

    expect(optimisticUpdate).toHaveBeenCalledTimes(1)
    expect(toastError).toHaveBeenCalledWith('No se pudo eliminar')
  })

  test('shows success toast after restore success', async () => {
    const optimisticUpdate = mock(() => {})
    const serverAction = mock(async () => ({ success: true }))

    await runOptimisticMutation({
      type: 'restore',
      id: 3,
      item: deletedItems[0],
      optimisticUpdate,
      serverAction,
      successMessage: 'Artista restaurado correctamente',
      errorMessage: 'Error al restaurar'
    })

    expect(optimisticUpdate).toHaveBeenCalledTimes(1)
    expect(serverAction).toHaveBeenCalledWith(3)
    expect(toastSuccess).toHaveBeenCalledWith(
      'Artista restaurado correctamente'
    )
    expect(toastError).not.toHaveBeenCalled()
  })

  test('shows error toast after restore failure', async () => {
    const optimisticUpdate = mock(() => {})

    await runOptimisticMutation({
      type: 'restore',
      id: 3,
      item: deletedItems[0],
      optimisticUpdate,
      serverAction: async () => ({
        success: false,
        errors: [{ entityType: 'artista', message: 'No se pudo restaurar' }]
      }),
      successMessage: 'Artista restaurado correctamente',
      errorMessage: 'Error al restaurar'
    })

    expect(optimisticUpdate).toHaveBeenCalledTimes(1)
    expect(toastError).toHaveBeenCalledWith('No se pudo restaurar')
  })

  test('skips restore mutation when restore action is omitted', async () => {
    const optimisticUpdate = mock(() => {})

    await runOptimisticMutation({
      type: 'restore',
      id: 3,
      item: deletedItems[0],
      optimisticUpdate,
      successMessage: 'Artista restaurado correctamente',
      errorMessage: 'Error al restaurar'
    })

    expect(optimisticUpdate).not.toHaveBeenCalled()
    expect(toastSuccess).not.toHaveBeenCalled()
    expect(toastError).not.toHaveBeenCalled()
  })
})
