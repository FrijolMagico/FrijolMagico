'use client'

import { useRef, useCallback, useEffect } from 'react'
import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  type DragMoveEvent,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {
  arrayMove,
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
import { Card } from '@/shared/components/ui/card'
import { DraggableCatalogRow } from './draggable-catalog-row'
import { toast } from 'sonner'
import type { CatalogArtist } from '../_types'
import { useArtistUI, useVisibleArtists } from '../_hooks/use-artist-ui'
import { useCatalogView } from '../_hooks/use-catalog-view'

interface CatalogTableProps {
  containerRef?: React.RefObject<HTMLDivElement | null>
  onPageChange?: (page: number) => void
}

// TODO: Extract DnD and auto-pagination logic into a reusable hook for other catalog tables (e.g. obras)
// Constants for auto-pagination
const PAGE_EDGE_THRESHOLD = 60 // px from edge to trigger page change
const PAGE_CHANGE_DELAY = 600 // ms to hold before changing page
const PAGE_CHANGE_COOLDOWN = 800 // ms between page changes

export function CatalogTable({
  containerRef,
  onPageChange
}: CatalogTableProps) {
  const { artists: allArtists, reorder, updateOne } = useArtistUI()
  const visibleArtists = useVisibleArtists()
  const {
    page,
    pageSize,
    totalPages,
    setPage,
    startDrag,
    endDrag,
    draggedArtistId,
    openCatalogDialog
  } = useCatalogView()

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
    endDrag()

    // Clear any pending page change
    if (pageChangeTimeoutRef.current) {
      clearTimeout(pageChangeTimeoutRef.current)
      pageChangeTimeoutRef.current = null
      isNearEdgeRef.current = null
    }

    if (over && active.id !== over.id) {
      // Calculate indices based on GLOBAL list
      const globalOldIndex = allArtists.findIndex(
        (a) => a.artistaId === draggedId
      )

      const localNewIndex = visibleArtists.findIndex(
        (a) => a.artistaId === Number(over.id)
      )

      if (globalOldIndex !== -1 && localNewIndex !== -1) {
        const startIndex = (page - 1) * pageSize
        const globalNewIndex = startIndex + localNewIndex

        const newGlobalOrder = arrayMove(
          allArtists,
          globalOldIndex,
          globalNewIndex
        )
        reorder(newGlobalOrder, draggedId)
      }
    }
  }

  const handleToggleField = (
    artista: CatalogArtist,
    field: 'destacado' | 'activo',
    value: boolean
  ) => {
    // Update using ui-state (automatically handles Layer 3)
    updateOne(String(artista.artistaId), { [field]: value })
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

  const draggedArtista = draggedArtistId
    ? allArtists.find((a) => a.artistaId === draggedArtistId)
    : null

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

      <DragOverlay dropAnimation={null}>
        {draggedArtista ? (
          <Card className='border-primary border-2 p-3 opacity-90 shadow-xl'>
            <div className='flex items-center gap-3'>
              <div className='bg-muted flex h-8 w-8 items-center justify-center rounded-full'>
                <span className='text-muted-foreground text-xs'>
                  {draggedArtista.pseudonimo.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className='text-sm font-medium'>
                  {draggedArtista.nombre || draggedArtista.pseudonimo}
                </p>
                <p className='text-muted-foreground text-xs'>
                  @{draggedArtista.pseudonimo}
                </p>
              </div>
            </div>
          </Card>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
