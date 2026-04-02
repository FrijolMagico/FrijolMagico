'use client'

import { TableCell, TableRow } from '@/shared/components/ui/table'
import { ActionMenuButton } from '@/shared/components/action-menu-button'
import { RRSSViewer } from '@/shared/components/rrss/rrss-viewer'
import { useTeamDialog } from '../_store/team-dialog-store'
import { useState } from 'react'
import { TeamMember } from '../_schemas/organizacion.schema'
import { ConfirmationDialog } from '@/shared/components/confirmation-dialog'
import { CopyToClipboard } from '@/shared/components/copy-to-clipboard'

interface TeamRowProps {
  member: TeamMember
  onDelete: (id: number) => void
}

export function TeamRow({ member, onDelete }: TeamRowProps) {
  const openUpdateMemberDialog = useTeamDialog(
    (state) => state.openUpdateMemberDialog
  )
  const [showAlert, setShowAlert] = useState(false)

  const handleMemberDeletion = async () => {
    onDelete(member.id)
    setShowAlert(false)
  }

  return (
    <TableRow>
      <ConfirmationDialog
        open={showAlert}
        onOpenChange={setShowAlert}
        onConfirm={handleMemberDeletion}
        title='¿Eliminar miembro?'
        description='Esta acción no se puede deshacer. El miembro del equipo será eliminado permanentemente.'
      />
      <TableCell>{member.name}</TableCell>
      <TableCell>{member.position || '-'}</TableCell>
      <TableCell>
        {!!member.email ? (
          <CopyToClipboard>{member.email}</CopyToClipboard>
        ) : (
          '-'
        )}
      </TableCell>
      <TableCell>
        {!!member.phone ? (
          <CopyToClipboard>{member.phone}</CopyToClipboard>
        ) : (
          '-'
        )}
      </TableCell>
      <TableCell>{member.rut || '-'}</TableCell>
      <TableCell>
        <RRSSViewer rrss={member.rrss} />
      </TableCell>

      <TableCell>
        <ActionMenuButton
          actions={[
            {
              label: 'Editar',
              onClick: () => openUpdateMemberDialog(member)
            }
          ]}
          onDelete={() => setShowAlert(true)}
        />
      </TableCell>
    </TableRow>
  )
}
