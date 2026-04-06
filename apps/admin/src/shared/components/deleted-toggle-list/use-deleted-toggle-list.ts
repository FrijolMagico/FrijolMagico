'use client'

import { toast } from 'sonner'
import {
  useOptimistic,
  useState,
  useTransition,
  type Dispatch,
  type SetStateAction
} from 'react'

import type { ActionState } from '@/shared/types/actions'

const DEFAULT_MESSAGES = {
  deleteSuccess: 'Entidad eliminada correctamente',
  deleteError: 'Ocurrió un problema al intentar eliminar la entidad',
  restoreSuccess: 'Entidad restaurada correctamente',
  restoreError: 'Ocurrió un problema al intentar restaurar la entidad'
} as const

export type OptimisticAction<
  TItem extends DeletedToggleListItem,
  TId extends TItem['id'] & number
> =
  | { type: 'delete'; id: TId; item: TItem }
  | { type: 'restore'; id: TId; item: TItem }

export interface UseDeletedToggleListMessages {
  deleteSuccess?: string
  deleteError?: string
  restoreSuccess?: string
  restoreError?: string
}

export interface DeletedToggleListItem {
  id: number
}

export interface UseDeletedToggleListOptions<
  TItem extends DeletedToggleListItem,
  TId extends TItem['id'] & number
> {
  activeItems: TItem[]
  deletedItems: TItem[]
  getId: (item: TItem) => TId
  isDeleted: (item: TItem) => boolean
  deleteItem: (id: TId) => Promise<ActionState>
  restoreItem?: (id: TId) => Promise<ActionState>
  showDeleted?: boolean
  onShowDeletedChange?: (showDeleted: boolean) => void
  messages?: UseDeletedToggleListMessages
}

export interface UseDeletedToggleListResult<
  TItem extends DeletedToggleListItem,
  TId extends TItem['id'] & number
> {
  visibleItems: TItem[]
  optimisticItems: TItem[]
  showDeleted: boolean
  setShowDeleted: Dispatch<SetStateAction<boolean>>
  toggleShowDeleted: () => void
  handleDelete: (id: TId) => void
  handleRestore: (id: TId) => void
  deletedCount: number
  activeCount: number
  isPending: boolean
}

interface OptimisticReducerOptions<
  TItem extends DeletedToggleListItem,
  TId extends TItem['id'] & number
> {
  showDeleted: boolean
  getId: (item: TItem) => TId
  isDeleted: (item: TItem) => boolean
}

interface RunOptimisticMutationOptions<
  TItem extends DeletedToggleListItem,
  TId extends TItem['id'] & number
> {
  type: OptimisticAction<TItem, TId>['type']
  id: TId
  item: TItem
  optimisticUpdate: (action: OptimisticAction<TItem, TId>) => void
  serverAction?: (id: TId) => Promise<ActionState>
  successMessage: string
  errorMessage: string
}

export function getDeletedToggleBaseItems<TItem>(
  showDeleted: boolean,
  activeItems: TItem[],
  deletedItems: TItem[]
) {
  return showDeleted ? deletedItems : activeItems
}

export function resolveDeletedToggleMessages(
  messages?: UseDeletedToggleListMessages
) {
  return {
    ...DEFAULT_MESSAGES,
    ...messages
  }
}

export function getActionErrorMessage(
  result: ActionState | undefined,
  fallback: string
) {
  return result?.errors?.[0]?.message || fallback
}

export function applyOptimisticAction<
  TItem extends DeletedToggleListItem,
  TId extends TItem['id'] & number
>(
  currentItems: TItem[],
  action: OptimisticAction<TItem, TId>,
  options: OptimisticReducerOptions<TItem, TId>
) {
  const { showDeleted, getId, isDeleted } = options

  if (action.type === 'delete') {
    if (!showDeleted) {
      return currentItems.filter((item) => getId(item) !== action.id)
    }

    const existingIndex = currentItems.findIndex(
      (item) => getId(item) === action.id
    )

    if (existingIndex === -1) {
      return [...currentItems, action.item]
    }

    return currentItems.map((item) => {
      if (getId(item) !== action.id) {
        return item
      }

      return isDeleted(action.item) ? action.item : item
    })
  }

  if (!showDeleted) {
    return currentItems
  }

  return currentItems.filter((item) => getId(item) !== action.id)
}

export async function runOptimisticMutation<
  TItem extends DeletedToggleListItem,
  TId extends TItem['id'] & number
>({
  type,
  id,
  item,
  optimisticUpdate,
  serverAction,
  successMessage,
  errorMessage
}: RunOptimisticMutationOptions<TItem, TId>) {
  if (!serverAction) {
    return
  }

  optimisticUpdate({ type, id, item })

  try {
    const result = await serverAction(id)

    if (result.success) {
      toast.success(successMessage)
      return
    }

    toast.error(getActionErrorMessage(result, errorMessage))
  } catch (error) {
    toast.error(error instanceof Error ? error.message : errorMessage)
  }
}

export function useDeletedToggleList<
  TItem extends DeletedToggleListItem,
  TId extends TItem['id'] & number
>({
  activeItems,
  deletedItems,
  getId,
  isDeleted,
  deleteItem,
  restoreItem,
  showDeleted: controlledShowDeleted,
  onShowDeletedChange,
  messages
}: UseDeletedToggleListOptions<TItem, TId>): UseDeletedToggleListResult<
  TItem,
  TId
> {
  const [internalShowDeleted, setInternalShowDeleted] = useState(false)
  const [isPending, startTransition] = useTransition()
  const showDeleted = controlledShowDeleted ?? internalShowDeleted
  const resolvedMessages = resolveDeletedToggleMessages(messages)
  const baseItems = getDeletedToggleBaseItems(
    showDeleted,
    activeItems,
    deletedItems
  )
  const [optimisticItems, updateOptimisticItems] = useOptimistic<
    TItem[],
    OptimisticAction<TItem, TId>
  >(baseItems, (currentItems, action) =>
    applyOptimisticAction(currentItems, action, {
      showDeleted,
      getId,
      isDeleted
    })
  )

  const setShowDeleted: Dispatch<SetStateAction<boolean>> = (value) => {
    const nextValue = typeof value === 'function' ? value(showDeleted) : value

    setInternalShowDeleted(nextValue)
    onShowDeletedChange?.(nextValue)
  }

  const handleDelete = (id: TId) => {
    const item = activeItems.find((candidate) => getId(candidate) === id)

    if (!item) {
      return
    }

    startTransition(() => {
      void runOptimisticMutation({
        type: 'delete',
        id,
        item,
        optimisticUpdate: updateOptimisticItems,
        serverAction: deleteItem,
        successMessage: resolvedMessages.deleteSuccess,
        errorMessage: resolvedMessages.deleteError
      })
    })
  }

  const handleRestore = (id: TId) => {
    if (!restoreItem) {
      return
    }

    const item = deletedItems.find((candidate) => getId(candidate) === id)

    if (!item) {
      return
    }

    startTransition(() => {
      void runOptimisticMutation({
        type: 'restore',
        id,
        item,
        optimisticUpdate: updateOptimisticItems,
        serverAction: restoreItem,
        successMessage: resolvedMessages.restoreSuccess,
        errorMessage: resolvedMessages.restoreError
      })
    })
  }

  return {
    visibleItems: optimisticItems,
    optimisticItems,
    showDeleted,
    setShowDeleted,
    toggleShowDeleted: () => setShowDeleted((currentValue) => !currentValue),
    handleDelete,
    handleRestore,
    deletedCount: deletedItems.length,
    activeCount: activeItems.length,
    isPending
  }
}
