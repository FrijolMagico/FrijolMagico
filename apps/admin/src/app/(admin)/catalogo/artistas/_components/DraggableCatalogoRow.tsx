'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Pencil, Star, Check, X } from 'lucide-react'
import { TableCell, TableRow } from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import { ArtistaAvatar } from './ArtistaAvatar'
import { useCatalogoForm } from '../_hooks/useCatalogoForm'
import type { CatalogoArtista } from '../_types/catalogo'

interface DraggableCatalogoRowProps {
  artista: CatalogoArtista
  onToggleField: (field: 'destacado' | 'activo', value: boolean) => void
  onEdit: () => void
}

export function DraggableCatalogoRow({
  artista,
  onToggleField,
  onEdit
}: DraggableCatalogoRowProps) {
  const isDraggingGlobal = useCatalogoForm((state) => state.isDragging)
  const originalArtistas = useCatalogoForm((state) => state.originalArtistas)
  const pendingChanges = useCatalogoForm((state) => state.pendingChanges)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: artista.artistaId })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto'
  }

  // Check if this row has pending changes
  const hasReorderChange = pendingChanges.reorders.some(
    (r) => r.artistaId === artista.artistaId
  )
  const hasToggleChange = pendingChanges.toggles.some(
    (t) => t.artistaId === artista.artistaId
  )
  const hasPendingChanges = hasReorderChange || hasToggleChange

  // Check if order changed from original
  const originalOrder = originalArtistas?.find(
    (a) => a.artistaId === artista.artistaId
  )?.orden
  const orderChanged = originalOrder !== undefined && originalOrder !== artista.orden

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={`group ${isDragging || isDraggingGlobal ? 'bg-blue-50 shadow-lg' : ''} ${hasPendingChanges ? 'bg-yellow-50/50' : ''}`}
    >
      {/* Drag Handle */}
      <TableCell className="w-8">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-100"
          title="Arrastrar para reordenar"
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
        </div>
      </TableCell>

      {/* Avatar */}
      <TableCell className="w-12">
        <ArtistaAvatar
          src={artista.avatarUrl}
          alt={artista.pseudonimo}
          size="sm"
        />
      </TableCell>

      {/* Nombre y detalles */}
      <TableCell className="flex-1">
        <div className="flex flex-col">
          <span className="font-medium">
            {artista.nombre || artista.pseudonimo}
          </span>
          {artista.nombre && (
            <span className="text-sm text-gray-500">@{artista.pseudonimo}</span>
          )}
          {(artista.ciudad || artista.pais) && (
            <span className="text-xs text-gray-400">
              {[artista.ciudad, artista.pais].filter(Boolean).join(', ')}
            </span>
          )}
        </div>
      </TableCell>

      {/* Orden (solo lectura) */}
      <TableCell className="w-16 text-center">
        <div className="flex flex-col items-center">
          <span className={`text-sm font-mono ${orderChanged ? 'text-yellow-600 font-bold' : 'text-gray-500'}`}>
            {artista.orden}
          </span>
          {orderChanged && (
            <Badge variant="outline" className="text-[10px] mt-1 border-yellow-400 text-yellow-600">
              Cambiado
            </Badge>
          )}
        </div>
      </TableCell>

      {/* Destacado */}
      <TableCell className="w-24">
        <div className="flex items-center gap-2">
          <Switch
            checked={artista.destacado}
            onCheckedChange={(checked) => onToggleField('destacado', checked)}
          />
          {artista.destacado && (
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          )}
        </div>
      </TableCell>

      {/* Activo */}
      <TableCell className="w-20">
        <div className="flex items-center gap-2">
          <Switch
            checked={artista.activo}
            onCheckedChange={(checked) => onToggleField('activo', checked)}
          />
          {artista.activo ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <X className="h-4 w-4 text-red-500" />
          )}
        </div>
      </TableCell>

      {/* Acciones */}
      <TableCell className="w-32">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Pencil className="h-4 w-4 mr-1" />
            Editar
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}
