import { generateKeyBetween } from 'fractional-indexing'
import type { DragEndEvent } from '@dnd-kit/core'

export interface SortableItem {
  id: number
  orderKey: string | null
}

export interface UseFractionalDnDProps {
  items: SortableItem[]
  onReorder: (id: number, newOrderKey: string) => void
  onDragEnd?: () => void
}

export function useFractionalDnD(props: UseFractionalDnDProps) {
  const handleDragEnd = (event: DragEndEvent) => {
    props.onDragEnd?.()

    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const draggedId = active.id as number
    const draggedIndex = props.items.findIndex((item) => item.id === draggedId)
    const dropIndex = props.items.findIndex((item) => item.id === over.id)

    if (draggedIndex === -1 || dropIndex === -1) {
      return
    }

    const movingDown = draggedIndex < dropIndex

    let prevItem: SortableItem | undefined
    let nextItem: SortableItem | undefined

    if (movingDown) {
      prevItem = props.items[dropIndex]
      nextItem = props.items[dropIndex + 1]
    } else {
      prevItem = props.items[dropIndex - 1]
      nextItem = props.items[dropIndex]
    }

    const prevOrder = prevItem?.orderKey ?? null
    const nextOrder = nextItem?.orderKey ?? null

    if (prevOrder !== null && nextOrder !== null && prevOrder > nextOrder) {
      console.error('Invalid order state: prevOrder > nextOrder', {
        prevOrder,
        nextOrder
      })
      return
    }

    try {
      const newOrderKey = generateKeyBetween(prevOrder, nextOrder)
      props.onReorder(draggedId, newOrderKey)
    } catch (error) {
      console.error('Failed to generate fractional key:', error)
    }
  }

  return { handleDragEnd }
}
