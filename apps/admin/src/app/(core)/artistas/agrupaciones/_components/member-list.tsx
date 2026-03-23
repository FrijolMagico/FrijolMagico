'use client'

import { EmptyState } from '@/shared/components/empty-state'
import type {
  CollectiveMember,
  PendingMember
} from '../_types/agrupacion'
import { MemberFormRow } from './member-form-row'

interface MemberListProps {
  members: CollectiveMember[]
  pendingMembers: PendingMember[]
  onUpdateRol: (artistaId: number, rol: string) => void
  onToggleActivo: (artistaId: number, activo: boolean) => void
  onRemove: (artistaId: number) => void
}

export function MemberList({
  members,
  pendingMembers,
  onUpdateRol,
  onToggleActivo,
  onRemove
}: MemberListProps) {
  if (members.length === 0 && pendingMembers.length === 0) {
    return (
      <EmptyState
        title='No hay miembros'
        description='Agregá artistas para comenzar a armar esta agrupación.'
      />
    )
  }

  return (
    <div className='space-y-3'>
      {members.map((member) => (
        <MemberFormRow
          key={member.artistaId}
          member={member}
          onUpdateRol={onUpdateRol}
          onToggleActivo={onToggleActivo}
          onRemove={onRemove}
        />
      ))}

      {pendingMembers.map((member) => (
        <MemberFormRow
          key={`pending-${member.artistaId}`}
          pending={member}
          onUpdateRol={onUpdateRol}
          onToggleActivo={onToggleActivo}
          onRemove={onRemove}
        />
      ))}
    </div>
  )
}
