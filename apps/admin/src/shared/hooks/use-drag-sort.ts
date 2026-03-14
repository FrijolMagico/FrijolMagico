'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import type { RefObject } from 'react'
import {
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragMoveEvent,
  type DragStartEvent,
  type Modifier
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { useFractionalDnD } from './use-fractional-dnd'

export interface SortableItem {
  id: number
  orderKey: string
}

interface DragSortPaginationOptions {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

interface DragSortConfig {
  edgeThreshold?: number
  pageChangeDelay?: number
  pageCooldown?: number
  activationDistance?: number
}

interface UseDragSortOptions {
  items: SortableItem[]
  onReorder: (id: number, newKey: string) => void
  onDragStart?: (id: number) => void
  onDragEnd?: () => void
  containerRef?: RefObject<HTMLElement | null>
  pagination?: DragSortPaginationOptions
  config?: DragSortConfig
}

interface UseDragSortReturn {
  dndContextProps: {
    sensors: ReturnType<typeof useSensors>
    collisionDetection: CollisionDetection
    modifiers: Modifier[]
    onDragStart: (e: DragStartEvent) => void
    onDragMove: (e: DragMoveEvent) => void
    onDragEnd: (e: DragEndEvent) => void
  }
  isDragging: boolean
  activeId: number | null
}

export function useDragSort({
  items,
  onReorder,
  onDragStart: onDragStartProp,
  onDragEnd: onDragEndProp,
  containerRef,
  pagination,
  config = {}
}: UseDragSortOptions): UseDragSortReturn {
  const {
    edgeThreshold = 60,
    pageChangeDelay = 600,
    pageCooldown = 800,
    activationDistance = 8
  } = config

  const [activeId, setActiveId] = useState<number | null>(null)
  const isDragging = activeId !== null

  // Auto-pagination refs
  const pageChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastPageChangeRef = useRef<number>(0)
  const isNearEdgeRef = useRef<'top' | 'bottom' | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: activationDistance }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  const { handleDragEnd: fractionalHandleDragEnd } = useFractionalDnD({
    items,
    onReorder,
    onDragEnd: onDragEndProp
  })

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (pageChangeTimeoutRef.current) {
        clearTimeout(pageChangeTimeoutRef.current)
      }
    }
  }, [])

  const handleDragStart = useCallback(
    (e: DragStartEvent) => {
      const id = Number(e.active.id)
      setActiveId(id)
      onDragStartProp?.(id)
    },
    [onDragStartProp]
  )

  const handleDragMove = useCallback(
    (e: DragMoveEvent) => {
      if (!containerRef?.current || !pagination) return

      const pointerEvent = e.activatorEvent as PointerEvent | undefined
      const clientY = pointerEvent?.clientY
      if (!clientY) return

      const rect = containerRef.current.getBoundingClientRect()
      const now = Date.now()

      // Respect cooldown
      if (now - lastPageChangeRef.current < pageCooldown) return

      // Bottom edge → next page
      if (clientY > rect.bottom - edgeThreshold) {
        if (
          pagination.page < pagination.totalPages &&
          isNearEdgeRef.current !== 'bottom'
        ) {
          isNearEdgeRef.current = 'bottom'
          if (pageChangeTimeoutRef.current) {
            clearTimeout(pageChangeTimeoutRef.current)
          }
          pageChangeTimeoutRef.current = setTimeout(() => {
            const nextPage = pagination.page + 1
            pagination.onPageChange(nextPage)
            lastPageChangeRef.current = Date.now()
            isNearEdgeRef.current = null
            pageChangeTimeoutRef.current = null
          }, pageChangeDelay)
        }
        return
      }

      // Top edge → previous page
      if (clientY < rect.top + edgeThreshold) {
        if (pagination.page > 1 && isNearEdgeRef.current !== 'top') {
          isNearEdgeRef.current = 'top'
          if (pageChangeTimeoutRef.current) {
            clearTimeout(pageChangeTimeoutRef.current)
          }
          pageChangeTimeoutRef.current = setTimeout(() => {
            const prevPage = pagination.page - 1
            pagination.onPageChange(prevPage)
            lastPageChangeRef.current = Date.now()
            isNearEdgeRef.current = null
            pageChangeTimeoutRef.current = null
          }, pageChangeDelay)
        }
        return
      }

      // Not near any edge — cancel pending timeout
      if (pageChangeTimeoutRef.current) {
        clearTimeout(pageChangeTimeoutRef.current)
        pageChangeTimeoutRef.current = null
        isNearEdgeRef.current = null
      }
    },
    [containerRef, pagination, edgeThreshold, pageChangeDelay, pageCooldown]
  )

  const handleDragEnd = useCallback(
    (e: DragEndEvent) => {
      // Clear any pending page change
      if (pageChangeTimeoutRef.current) {
        clearTimeout(pageChangeTimeoutRef.current)
        pageChangeTimeoutRef.current = null
        isNearEdgeRef.current = null
      }
      setActiveId(null)
      fractionalHandleDragEnd(e)
    },
    [fractionalHandleDragEnd]
  )

  return {
    dndContextProps: {
      sensors,
      collisionDetection: closestCenter,
      modifiers: [restrictToVerticalAxis],
      onDragStart: handleDragStart,
      onDragMove: handleDragMove,
      onDragEnd: handleDragEnd
    },
    isDragging,
    activeId
  }
}
