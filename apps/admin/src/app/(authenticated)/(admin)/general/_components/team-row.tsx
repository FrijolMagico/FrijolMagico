'use client'

import { TableCell, TableRow } from '@/shared/components/ui/table'
import {
  useTeamOperationStore,
  useTeamProjectionStore
} from '../_store/organization-team-ui-store'
import { cn } from '@/lib/utils'
import { ButtonWithTooltip } from '@/shared/components/button-with-tooltip'
import { Pencil, RotateCcw, Trash2 } from 'lucide-react'
import { useTeamDialog } from '../_store/team-dialog-store'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/shared/components/ui/dropdown-menu'
import Link from 'next/link'
import { StateBadge } from '@/shared/components/state-badge'
import { memo } from 'react'

interface TeamRowProps {
  id: string
}

export const TeamRow = memo(function TeamRow({ id }: TeamRowProps) {
  const openDialog = useTeamDialog((state) => state.openDialog)
  const remove = useTeamOperationStore((s) => s.remove)
  const restore = useTeamOperationStore((s) => s.restore)
  const member = useTeamProjectionStore((s) => s.byId[id])

  const socials = Object.entries(member?.rrss || {}).flatMap(
    ([platform, urls]) => urls.map((url) => ({ platform, url }))
  )

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
        {member.rrss ? (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <ButtonWithTooltip
                  size='xs'
                  variant='outline'
                  tooltipContent='Ver RRSS'
                  disabled={member.__meta?.isDeleted}
                >
                  Ver
                </ButtonWithTooltip>
              }
            />

            <DropdownMenuContent className='w-full min-w-40'>
              {socials.map(({ platform, url }) => (
                <DropdownMenuItem
                  key={url + platform}
                  render={
                    <Link
                      href={url}
                      target='_blank'
                      className='w-full text-nowrap'
                    >
                      {platform}: @{url.split('/')[3]}
                    </Link>
                  }
                />
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          '-'
        )}
      </TableCell>
      <TableCell>
        <ButtonWithTooltip
          size='icon'
          variant='ghost'
          onClick={() => openDialog(id)}
          tooltipContent='Editar artista'
          className='h-8 w-8'
          disabled={member.__meta?.isDeleted}
        >
          <Pencil className='h-4 w-4' />
        </ButtonWithTooltip>
      </TableCell>
      <TableCell>
        <ButtonWithTooltip
          size='icon'
          variant='ghost'
          onClick={() => {
            if (member.__meta?.isDeleted) {
              restore(id)
            } else {
              remove(id)
            }
          }}
          tooltipContent={member.__meta?.isDeleted ? 'Restaurar' : 'Eliminar'}
          className={cn(
            'text-destructive hover:text-destructive/80 h-8 w-8',
            member.__meta?.isDeleted && 'text-green-500 hover:text-green-500/80'
          )}
        >
          {member.__meta?.isDeleted ? <RotateCcw /> : <Trash2 />}
        </ButtonWithTooltip>
      </TableCell>
    </TableRow>
  )
})
