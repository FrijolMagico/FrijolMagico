'use client'

import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
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
}

export function CatalogoTable({ onEdit }: CatalogoTableProps) {
  const artistas = useCatalogoForm((state) => state.artistas)
  const reorderArtistas = useCatalogoForm((state) => state.reorderArtistas)
  const startDrag = useCatalogoForm((state) => state.startDrag)
  const endDrag = useCatalogoForm((state) => state.endDrag)
  const toggleField = useCatalogoForm((state) => state.toggleField)
  const canEdit = useCatalogoForm((state) => state.canEdit)

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

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    startDrag(Number(active.id))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    endDrag()

    if (over && active.id !== over.id) {
      const oldIndex = artistas.findIndex((a) => a.artistaId === Number(active.id))
      const newIndex = artistas.findIndex((a) => a.artistaId === Number(over.id))

      if (oldIndex !== -1 && newIndex !== -1) {
        // Reorder locally (tracked in store, not saved yet)
        const newOrder = arrayMove(artistas, oldIndex, newIndex)
        reorderArtistas(newOrder)
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

  const handleEdit = (artista: CatalogoArtista) => {
    // Check if there are pending changes
    if (!canEdit()) {
      toast.warning(
        'Tienes cambios sin guardar. Por favor guarda los cambios antes de editar un artista.'
      )
      return
    }
    onEdit(artista)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8"></TableHead>
            <TableHead className="w-12"></TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead className="w-16 text-center">Orden</TableHead>
            <TableHead className="w-24">Destacado</TableHead>
            <TableHead className="w-20">Activo</TableHead>
            <TableHead className="w-32">Acciones</TableHead>
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
                onEdit={() => handleEdit(artista)}
              />
            ))}
          </SortableContext>
        </TableBody>
      </Table>
    </DndContext>
  )
}
