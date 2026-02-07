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
} from '@/components/ui/table'
import { DraggableCatalogoRow } from './DraggableCatalogoRow'
import { useCatalogoForm } from '../_hooks/useCatalogoForm'
import { toast } from 'sonner'
import type { CatalogoArtista } from '../_types/catalogo'

interface CatalogoTableProps {
  onEdit: (artista: CatalogoArtista) => void
  containerRef?: React.RefObject<HTMLDivElement | null>
}

// Constants for auto-pagination
const PAGE_EDGE_THRESHOLD = 60 // px from edge to trigger page change
const PAGE_CHANGE_DELAY = 600 // ms to hold before changing page
const PAGE_CHANGE_COOLDOWN = 800 // ms between page changes

export function CatalogoTable({ onEdit, containerRef }: CatalogoTableProps) {
  const artistas = useCatalogoForm((state) => state.artistas)
  const page = useCatalogoForm((state) => state.page)
  const totalPages = useCatalogoForm((state) => state.totalPages)
  const setPage = useCatalogoForm((state) => state.setPage)
  const reorderArtistas = useCatalogoForm((state) => state.reorderArtistas)
  const startDrag = useCatalogoForm((state) => state.startDrag)
  const endDrag = useCatalogoForm((state) => state.endDrag)
  const draggedArtistaId = useCatalogoForm((state) => state.draggedArtistaId)
  const toggleField = useCatalogoForm((state) => state.toggleField)

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
            setPage(page + 1)
            lastPageChangeRef.current = Date.now()
            toast.info(`Cambiando a página ${page + 1}`)
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
            setPage(page - 1)
            lastPageChangeRef.current = Date.now()
            toast.info(`Cambiando a página ${page - 1}`)
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
    [page, totalPages, setPage, containerRef]
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
      const oldIndex = artistas.findIndex((a) => a.artistaId === draggedId)
      const newIndex = artistas.findIndex(
        (a) => a.artistaId === Number(over.id)
      )

      if (oldIndex !== -1 && newIndex !== -1) {
        // Reorder locally, passing the dragged item ID
        const newOrder = arrayMove(artistas, oldIndex, newIndex)
        reorderArtistas(newOrder, draggedId)
      }
    }
  }

  const handleToggleField = (
    artista: CatalogoArtista,
    field: 'destacado' | 'activo',
    value: boolean
  ) => {
    // Toggle locally (tracked in store, not saved yet)
    toggleField(artista.artistaId, field, value)
    toast.info(
      `${field === 'destacado' ? 'Destacado' : 'Activo'} cambiado. Presiona "Guardar cambios" para aplicar.`
    )
  }

  // Get the dragged artista for the overlay
  const draggedArtista = draggedArtistaId
    ? artistas.find((a) => a.artistaId === draggedArtistaId)
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
            items={artistas.map((a) => a.artistaId)}
            strategy={verticalListSortingStrategy}
          >
            {artistas.map((artista) => (
              <DraggableCatalogoRow
                key={artista.artistaId}
                artista={artista}
                onToggleField={(field, value) =>
                  handleToggleField(artista, field, value)
                }
                onEdit={() => onEdit(artista)}
              />
            ))}
          </SortableContext>
        </TableBody>
      </Table>

      <DragOverlay dropAnimation={null}>
        {draggedArtista ? (
          <div className='rounded-md border-2 border-blue-400 bg-white p-3 opacity-90 shadow-xl'>
            <div className='flex items-center gap-3'>
              <div className='flex h-8 w-8 items-center justify-center rounded-full bg-gray-100'>
                <span className='text-xs text-gray-500'>
                  {draggedArtista.pseudonimo.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className='text-sm font-medium'>
                  {draggedArtista.nombre || draggedArtista.pseudonimo}
                </p>
                <p className='text-xs text-gray-500'>
                  @{draggedArtista.pseudonimo}
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
