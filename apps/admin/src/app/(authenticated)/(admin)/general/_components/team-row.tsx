'use client'

import { TableCell, TableRow } from '@/shared/components/ui/table'
import {
  useTeamOperationStore,
  useTeamProjectionStore
} from '../_store/organization-team-ui-store'
import { cn } from '@/lib/utils'
import { useTeamDialog } from '../_store/team-dialog-store'
import { StateBadge } from '@/shared/components/state-badge'
import { memo } from 'react'
import { ActionMenuButton } from '@/shared/components/action-menu-button'
import { RRSSViewer } from '@/shared/components/rrss-viewer/rrss-viewer'

interface TeamRowProps {
  id: string
}

export const TeamRow = memo(function TeamRow({ id }: TeamRowProps) {
  const openDialog = useTeamDialog((state) => state.openDialog)
  const remove = useTeamOperationStore((s) => s.remove)
  const restore = useTeamOperationStore((s) => s.restore)
  const member = useTeamProjectionStore((s) => s.byId[id])

  if (!member) return null

  console.log('[TeamRow] Rendering row for member:', id)

  return (
    <TableRow
      className={cn(
        member.__meta?.isDeleted && 'bg-destructive/10 hover:bg-destructive/20'
      )}
    >
      <TableCell>
        <StateBadge {...member.__meta} />
      </TableCell>
      <TableCell>{member.name}</TableCell>
      <TableCell>{member.position || '-'}</TableCell>
      <TableCell>
        {/* TODO: make this into a copy to clipboard with tooltip */}
        {member.email || '-'}
      </TableCell>
      <TableCell>{member.phone || '-'}</TableCell>
      <TableCell>
        <RRSSViewer rrss={member.rrss} disabled={member.__meta?.isDeleted} />
      </TableCell>

      <TableCell>
        <ActionMenuButton
          actions={[
            {
              label: 'Editar',
              onClick: () => openDialog(id)
            }
          ]}
          isDeleted={member.__meta?.isDeleted}
          onDelete={() => remove(id)}
          onRestore={() => restore(id)}
        />
      </TableCell>
    </TableRow>
  )
})
