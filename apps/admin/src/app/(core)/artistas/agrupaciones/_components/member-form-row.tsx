'use client'

import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Switch } from '@/shared/components/ui/switch'
import { IconTrash } from '@tabler/icons-react'
import type { CollectiveMember, PendingMember } from '../_types/agrupacion'

interface MemberFormRowProps {
  member?: CollectiveMember
  pending?: PendingMember
  onUpdateRol: (artistaId: number, rol: string) => void
  onToggleActivo: (artistaId: number, activo: boolean) => void
  onRemove: (artistaId: number) => void
}

export function MemberFormRow({
  member,
  pending,
  onUpdateRol,
  onToggleActivo,
  onRemove
}: MemberFormRowProps) {
  const artistaId = member?.artistaId ?? pending?.artistaId
  const pseudonimo = member?.artistPseudonimo ?? pending?.pseudonimo
  const ciudad = member?.artistCiudad ?? pending?.ciudad
  const rol = member?.rol ?? pending?.rol ?? ''
  const activo = member?.activo ?? pending?.activo ?? true
  const isPending = Boolean(pending)

  if (!artistaId || !pseudonimo) {
    return null
  }

  return (
    <div className='grid grid-cols-[minmax(0,1fr)_180px_110px_44px] items-center gap-3 rounded-lg border p-3'>
      <div className='min-w-0'>
        <div className='flex items-center gap-2'>
          <p className='truncate font-medium'>{pseudonimo}</p>
          {isPending ? <Badge variant='secondary'>Pendiente</Badge> : null}
        </div>
        <p className='text-muted-foreground text-xs'>
          {ciudad || 'Sin ciudad'}
        </p>
      </div>

      <Input
        value={rol}
        onChange={(event) => onUpdateRol(artistaId, event.target.value)}
        placeholder='Rol dentro de la agrupación'
      />

      <div className='flex items-center gap-2'>
        <Switch
          checked={activo}
          onCheckedChange={(nextValue) => onToggleActivo(artistaId, nextValue)}
          aria-label='Estado del miembro'
        />
        <span className='text-sm'>{activo ? 'Activo' : 'Inactivo'}</span>
      </div>

      <Button
        type='button'
        size='icon-sm'
        variant='ghost'
        onClick={() => onRemove(artistaId)}
        aria-label='Quitar miembro'
      >
        <IconTrash />
      </Button>
    </div>
  )
}
