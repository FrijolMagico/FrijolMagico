'use client'

import { useRef, useCallback, useEffect, use } from 'react'
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
import { DraggableCatalogRow } from './draggable-catalog-row'
import { toast } from 'sonner'
import type { CatalogArtist } from '../_types'
import { useArtistUI, useVisibleArtists } from '../_hooks/use-artist-ui'
import { useCatalogPaginationStore } from '../_store/catalog-pagination-store'
import { useCatalogViewStore } from '../_store/catalog-view-store'
import { useArtistaUIStore } from '../_store/artista-ui-store'
import { EmptyState } from '@/shared/components/empty-state'

interface CatalogTableProps {
  containerRef?: React.RefObject<HTMLDivElement | null>
  onPageChange?: (page: number) => void
  handleFiltersChange: (filters: {
    activo?: boolean | null
    destacado?: boolean | null
    search?: string
  }) => void
}

// TODO: Extract DnD and auto-pagination logic into a reusable hook for other catalog tables (e.g. obras)
// Constants for auto-pagination
const PAGE_EDGE_THRESHOLD = 60 // px from edge to trigger page change
const PAGE_CHANGE_DELAY = 600 // ms to hold before changing page
const PAGE_CHANGE_COOLDOWN = 800 // ms between page changes

export function CatalogTable({
  containerRef,
  onPageChange,
  handleFiltersChange
}: CatalogTableProps) {
  const { reorder } = useArtistUI()
  const updateOne = useArtistaUIStore((s) => s.updateOne)

  const { visibleArtists } = useVisibleArtists()

  const page = useCatalogPaginationStore((s) => s.page)
  const totalPages = useCatalogPaginationStore((s) => s.getTotalPages())
  const setPage = useCatalogPaginationStore((s) => s.setPage)

  const startDrag = useCatalogViewStore((s) => s.startDrag)
  const endDrag = useCatalogViewStore((s) => s.endDrag)
  const setFilters = useCatalogViewStore((s) => s.setFilters)
  const openCatalogDialog = useCatalogViewStore((s) => s.openCatalogDialog)

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
    startDrag(Number(active.id))
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
    const { active, over } = event
    const draggedId = Number(active.id)
    const dropTargetId = over ? Number(over.id) : null

    endDrag()

    // Clear any pending page change
    if (pageChangeTimeoutRef.current) {
      clearTimeout(pageChangeTimeoutRef.current)
      pageChangeTimeoutRef.current = null
      isNearEdgeRef.current = null
    }

    if (over && active.id !== over.id && dropTargetId) {
      reorder(draggedId, dropTargetId)
    }
  }

  const handleToggleField = (
    artista: CatalogArtist,
    field: 'destacado' | 'activo',
    value: boolean
  ) => {
    // Update using ui-state (automatically handles Layer 3)
    updateOne(artista.artistaId, { [field]: value })
    toast.info(
      `${field === 'destacado' ? 'Destacado' : 'Activo'} cambiado. Presiona "Guardar cambios" para aplicar.`
    )
  }

  const handleEdit = useCallback(
    (artista: CatalogArtist) => {
      openCatalogDialog(artista.artistaId)
    },
    [openCatalogDialog]
  )

  if (visibleArtists.length === 0) {
    return (
      <EmptyState
        title='No se encontraron artistas'
        description='No hay artistas que coincidan con los filtros seleccionados.'
        action={{
          label: 'Limpiar filtros',
          onClick: () => {
            setFilters({
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
            items={visibleArtists.map((a) => a.artistaId)}
            strategy={verticalListSortingStrategy}
          >
            {visibleArtists.map((artista) => (
              <DraggableCatalogRow
                key={artista.artistaId}
                artista={artista}
                onToggleField={(field, value) =>
                  handleToggleField(artista, field, value)
                }
                onEdit={() => handleEdit(artista)}
              />
            ))}
          </SortableContext>
        </TableBody>
      </Table>
    </DndContext>
  )
}
