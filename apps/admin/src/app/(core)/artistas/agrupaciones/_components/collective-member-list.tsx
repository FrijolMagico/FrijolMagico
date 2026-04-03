'use client'

import { IconEdit, IconRotateClockwise2, IconTrash } from '@tabler/icons-react'
import { useShallow } from 'zustand/react/shallow'

import { EmptyState } from '@/shared/components/empty-state'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent } from '@/shared/components/ui/card'

import { useCollectiveDraftStore } from '../_store/use-collective-draft-store'
import type { MemberDraftItem } from '../_types/collective.types'

function hasMemberChanged(
  originalMembers: MemberDraftItem[],
  member: MemberDraftItem
) {
  const originalMember = originalMembers.find(
    (item) => item.artistId === member.artistId
  )

  return Boolean(
    originalMember &&
    (originalMember.role !== member.role ||
      originalMember.active !== member.active)
  )
}

function buildRemovedMembers(
  originalMembers: MemberDraftItem[],
  existingMembers: MemberDraftItem[]
) {
  return originalMembers.filter(
    (originalMember) =>
      !existingMembers.some(
        (existingMember) => existingMember.artistId === originalMember.artistId
      )
  )
}

interface MemberRowProps {
  member: MemberDraftItem
  status: 'persisted' | 'pending' | 'removed'
  onEdit?: (artistId: number) => void
  onRemove?: (artistId: number) => void
  onRestore?: (member: MemberDraftItem) => void
  isEdited?: boolean
}

function MemberRow({
  member,
  status,
  onEdit,
  onRemove,
  onRestore,
  isEdited = false
}: MemberRowProps) {
  return (
    <Card
      size='sm'
      className={status === 'removed' ? 'border-destructive/30' : ''}
    >
      <CardContent className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div className='min-w-0'>
          <div className='flex flex-wrap items-center gap-2'>
            <p className='truncate font-medium'>{member.pseudonym}</p>

            {status === 'pending' ? (
              <Badge variant='secondary'>Pendiente</Badge>
            ) : null}
            {status === 'removed' ? (
              <Badge variant='destructive'>Por quitar</Badge>
            ) : null}
            {status === 'persisted' && isEdited ? (
              <Badge variant='outline'>Editado</Badge>
            ) : null}
            {!member.active && status !== 'removed' ? (
              <Badge variant='outline'>Inactivo</Badge>
            ) : null}
          </div>

          <p className='text-muted-foreground text-sm'>
            Rol: {member.role || 'Sin rol asignado'}
          </p>
        </div>

        <div className='flex items-center gap-2'>
          {status === 'removed' ? (
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => onRestore?.(member)}
            >
              <IconRotateClockwise2 />
              Restaurar
            </Button>
          ) : (
            <>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => onEdit?.(member.artistId)}
              >
                <IconEdit />
                Editar
              </Button>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={() => onRemove?.(member.artistId)}
              >
                <IconTrash />
                Quitar
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function CollectiveMemberList() {
  const {
    originalMembers,
    existingMembers,
    pendingAdds,
    openMemberUpdate,
    removeMember,
    addMember
  } = useCollectiveDraftStore(
    useShallow((state) => ({
      originalMembers: state.originalMembers,
      existingMembers: state.existingMembers,
      pendingAdds: state.pendingAdds,
      openMemberUpdate: state.openMemberUpdate,
      removeMember: state.removeMember,
      addMember: state.addMember
    }))
  )

  const removedMembers = buildRemovedMembers(originalMembers, existingMembers)

  if (
    existingMembers.length === 0 &&
    pendingAdds.length === 0 &&
    removedMembers.length === 0
  ) {
    return (
      <EmptyState
        title='No hay miembros'
        description='Agregá artistas para comenzar a armar esta agrupación.'
      />
    )
  }

  return (
    <div className='space-y-3'>
      {existingMembers.map((member) => (
        <MemberRow
          key={member.artistId}
          member={member}
          status='persisted'
          isEdited={hasMemberChanged(originalMembers, member)}
          onEdit={openMemberUpdate}
          onRemove={removeMember}
        />
      ))}

      {pendingAdds.map((member) => (
        <MemberRow
          key={`pending-${member.artistId}`}
          member={member}
          status='pending'
          onEdit={openMemberUpdate}
          onRemove={removeMember}
        />
      ))}

      {removedMembers.map((member) => (
        <MemberRow
          key={`removed-${member.artistId}`}
          member={member}
          status='removed'
          onRestore={addMember}
        />
      ))}
    </div>
  )
}
