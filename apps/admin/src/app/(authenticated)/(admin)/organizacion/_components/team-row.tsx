'use client'

import { TableCell, TableRow } from '@/shared/components/ui/table'
import { ActionMenuButton } from '@/shared/components/action-menu-button'
import { RRSSViewer } from '@/shared/components/rrss/rrss-viewer'
import { deleteTeamMember } from '../_actions/team-member.action'
import { useTeamDialog } from '../_store/team-dialog-store'
import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle
} from '@/shared/components/ui/alert-dialog'
import { IconTrashFilled } from '@tabler/icons-react'
import { toast } from 'sonner'
import { TeamMember } from '../_schemas/organizacion.schema'

interface TeamRowProps {
  member: TeamMember
}

export function TeamRow({ member }: TeamRowProps) {
  const openEdit = useTeamDialog((state) => state.openEdit)
  const [showAlert, setShowAlert] = useState(false)

  const handleMemberDeletion = async () => {
    const result = await deleteTeamMember(member.id)

    if (!result.success) {
      toast.error(
        result.errors
          ? result.errors.map((e) => e.message).join(', ')
          : 'Error al eliminar el miembro del equipo'
      )

      return
    }

    setShowAlert(false)
    toast.success('Miembro del equipo eliminado correctamente')
  }

  return (
    <>
      <TableRow>
        <TableCell>{member.name}</TableCell>
        <TableCell>{member.position || '-'}</TableCell>
        <TableCell>{member.email || '-'}</TableCell>
        <TableCell>{member.phone || '-'}</TableCell>
        <TableCell>{member.rut || '-'}</TableCell>
        <TableCell>
          <RRSSViewer rrss={member.rrss} />
        </TableCell>

        <TableCell>
          <ActionMenuButton
            actions={[
              {
                label: 'Editar',
                onClick: () => openEdit(member)
              }
            ]}
            onDelete={() => setShowAlert(true)}
          />
        </TableCell>
      </TableRow>

      <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
        <AlertDialogContent size='sm'>
          <AlertDialogHeader>
            <AlertDialogMedia className='bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive'>
              <IconTrashFilled />
            </AlertDialogMedia>
            <AlertDialogTitle>Eliminar miembro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El miembro del equipo será
              eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant='outline'>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant='destructive'
              onClick={handleMemberDeletion}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
