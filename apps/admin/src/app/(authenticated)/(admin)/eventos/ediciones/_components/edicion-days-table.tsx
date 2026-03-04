'use client'

import { format, parse, isValid } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/shared/components/ui/table'
import type { DayFormState } from '../_types/edition'
import { ActionMenuButton } from '@/shared/components/action-menu-button'
import { EmptyState } from '@/shared/components/empty-state'

const MODALIDAD_LABELS: Record<string, string> = {
  presencial: 'Presencial',
  online: 'Online',
  hibrido: 'Híbrido'
}

function formatFecha(fecha: string): string {
  if (!fecha) return '—'
  const parsed = parse(fecha, 'yyyy-MM-dd', new Date())
  return isValid(parsed) ? format(parsed, 'dd/MM/yyyy') : fecha
}

interface EdicionDaysTableProps {
  days: DayFormState[]
  lugarNombreById: Record<string, string>
  onEdit: (tempId: string) => void
  onDelete: (tempId: string) => void
}

export function EdicionDaysTable({
  days,
  lugarNombreById,
  onEdit,
  onDelete
}: EdicionDaysTableProps) {
  if (days.length === 0) {
    return (
      <EmptyState
        title='No hay días agregados'
        description='Agrega días a esta edición para configurar su fecha, horario, modalidad y lugar.'
      />
    )
  }

  return (
    <div className='rounded-lg border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Modalidad</TableHead>
            <TableHead>Inicio</TableHead>
            <TableHead>Fin</TableHead>
            <TableHead>Lugar</TableHead>
            <TableHead className='w-10' />
          </TableRow>
        </TableHeader>
        <TableBody>
          {days.map((day) => (
            <TableRow key={day.tempId}>
              <TableCell>{formatFecha(day.fecha)}</TableCell>
              <TableCell>
                {(MODALIDAD_LABELS[day.modalidad] ?? day.modalidad) || '—'}
              </TableCell>
              <TableCell>{day.horaInicio || '—'}</TableCell>
              <TableCell>{day.horaFin || '—'}</TableCell>
              <TableCell>
                {day.lugarId ? (lugarNombreById[day.lugarId] ?? '—') : '—'}
              </TableCell>
              <TableCell>
                <ActionMenuButton
                  actions={[
                    {
                      label: 'Editar',
                      onClick: () => onEdit(day.tempId)
                    }
                  ]}
                  isDeleted={false}
                  onDelete={() => onDelete(day.tempId)}
                  onRestore={() => onEdit(day.tempId)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
