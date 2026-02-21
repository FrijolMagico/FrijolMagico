'use client'

import { useRef, useCallback, useEffect, useMemo } from 'react'
import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  type DragMoveEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow
} from '@/shared/components/ui/table'
import { toast } from 'sonner'
import { useCatalogPaginationStore } from '../_store/catalog-pagination-store'
import { useCatalogViewStore } from '../_store/catalog-view-store'
import { useCatalogFilterStore } from '../_store/catalog-filter-store'
import { EmptyState } from '@/shared/components/empty-state'
import {
  useCatalogOperationStore,
  useCatalogProjectionStore
} from '../_store/catalog-ui-store'
import { useCatalogList } from '../_hooks/use-catalog-list'
import { useFractionalDnD } from '@/shared/hooks/use-fractional-dnd'
import { CatalogRow } from './catalog-row'

interface CatalogTableProps {
  containerRef?: React.RefObject<HTMLDivElement | null>
  onPageChange?: (page: number) => void
  handleFiltersChange: (filters: {
    activo?: boolean | null
    destacado?: boolean | null
    search?: string
  }) => void
}

// Constants for auto-pagination
const PAGE_EDGE_THRESHOLD = 60 // px from edge to trigger page change
const PAGE_CHANGE_DELAY = 600 // ms to hold before changing page
const PAGE_CHANGE_COOLDOWN = 800 // ms between page changes

export function CatalogTable({
  containerRef,
  onPageChange,
  handleFiltersChange
}: CatalogTableProps) {
  const { paginatedIds } = useCatalogList()
  const update = useCatalogOperationStore((s) => s.update)

  const catalogById = useCatalogProjectionStore((s) => s.byId)
  const dndItems = useMemo(
    () =>
      paginatedIds.map((id) => ({
        id,
        orderKey: catalogById[id]?.orden || ''
      })),
    [paginatedIds, catalogById]
  )

  const page = useCatalogPaginationStore((s) => s.page)
  const totalPages = useCatalogPaginationStore((s) => s.getTotalPages())
  const setPage = useCatalogPaginationStore((s) => s.setPage)

  const startDrag = useCatalogViewStore((s) => s.startDrag)
  const setFiltersCatalog = useCatalogFilterStore((s) => s.setFilters)
  const endDrag = useCatalogViewStore((s) => s.endDrag)

  const { handleDragEnd: dndHandleDragEnd } = useFractionalDnD({
    items: dndItems,
    onReorder: (id, newOrden) => update(String(id), { orden: newOrden }),
    onDragEnd: endDrag
  })

  // Refs for auto-pagination timers
  const pageChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastPageChangeRef = useRef<number>(0)
  const isNearEdgeRef = useRef<'top' | 'bottom' | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (pageChangeTimeoutRef.current) {
        clearTimeout(pageChangeTimeoutRef.current)
      }
    }
  }, [])

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    if (!active?.id) return
    startDrag(String(active.id))
  }

  const handleDragMove = useCallback(
    (event: DragMoveEvent) => {
      // Get pointer position from the activator event (mouse/touch position)
      const pointerEvent = event.activatorEvent as PointerEvent | undefined
      const clientY = pointerEvent?.clientY

      if (!clientY || !containerRef?.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const now = Date.now()

      // Check if we're in cooldown period
      if (now - lastPageChangeRef.current < PAGE_CHANGE_COOLDOWN) return

      // Check bottom edge (next page) - when dragging near bottom of container
      if (clientY > rect.bottom - PAGE_EDGE_THRESHOLD) {
        if (page < totalPages && isNearEdgeRef.current !== 'bottom') {
          isNearEdgeRef.current = 'bottom'

          // Clear any existing timeout
          if (pageChangeTimeoutRef.current) {
            clearTimeout(pageChangeTimeoutRef.current)
          }

          // Set new timeout
          pageChangeTimeoutRef.current = setTimeout(() => {
            const nextPage = page + 1
            setPage(nextPage)
            if (onPageChange) onPageChange(nextPage)

            lastPageChangeRef.current = Date.now()
            toast.info(`Cambiando a página ${nextPage}`)
            isNearEdgeRef.current = null
            pageChangeTimeoutRef.current = null
          }, PAGE_CHANGE_DELAY)
        }
        return
      }

      // Check top edge (previous page) - when dragging near top of container
      if (clientY < rect.top + PAGE_EDGE_THRESHOLD) {
        if (page > 1 && isNearEdgeRef.current !== 'top') {
          isNearEdgeRef.current = 'top'

          // Clear any existing timeout
          if (pageChangeTimeoutRef.current) {
            clearTimeout(pageChangeTimeoutRef.current)
          }

          // Set new timeout
          pageChangeTimeoutRef.current = setTimeout(() => {
            const prevPage = page - 1
            setPage(prevPage)
            if (onPageChange) onPageChange(prevPage)

            lastPageChangeRef.current = Date.now()
            toast.info(`Cambiando a página ${prevPage}`)
            isNearEdgeRef.current = null
            pageChangeTimeoutRef.current = null
          }, PAGE_CHANGE_DELAY)
        }
        return
      }

      // Not near any edge, clear timeout
      if (pageChangeTimeoutRef.current) {
        clearTimeout(pageChangeTimeoutRef.current)
        pageChangeTimeoutRef.current = null
        isNearEdgeRef.current = null
      }
    },
    [page, totalPages, setPage, containerRef, onPageChange]
  )

  const handleDragEnd = (event: DragEndEvent) => {
    // Clear any pending page change
    if (pageChangeTimeoutRef.current) {
      clearTimeout(pageChangeTimeoutRef.current)
      pageChangeTimeoutRef.current = null
      isNearEdgeRef.current = null
    }

    dndHandleDragEnd(event)
  }

  if (paginatedIds.length === 0) {
    return (
      <EmptyState
        title='No se encontraron artistas'
        description='No hay artistas que coincidan con los filtros seleccionados.'
        action={{
          label: 'Limpiar filtros',
          onClick: () => {
            setFiltersCatalog({
              activo: null,
              destacado: null,
              search: ''
            })
            handleFiltersChange({
              activo: null,
              destacado: null,
              search: ''
            })
          }
        }}
      />
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className='w-8'></TableHead>
            <TableHead className='w-12'></TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead className='w-16 text-center'>Orden</TableHead>
            <TableHead className='w-24'>Destacado</TableHead>
            <TableHead className='w-20'>Activo</TableHead>
            <TableHead className='w-32'>Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <SortableContext
            items={paginatedIds}
            strategy={verticalListSortingStrategy}
          >
            {paginatedIds.map((id) => (
              <CatalogRow key={id} catalogId={id} />
            ))}
          </SortableContext>
        </TableBody>
      </Table>
    </DndContext>
  )
}
