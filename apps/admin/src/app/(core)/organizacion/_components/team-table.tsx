'use client'

import { startTransition, useOptimistic } from 'react'
import { TeamMember } from '../_schemas/organizacion.schema'
import { TeamRow } from './team-row'
import { deleteTeamMember } from '../_actions/team-member.action'
import { toast } from 'sonner'

interface TeamTableProps {
  team: TeamMember[]
}

export function TeamTable({ team }: TeamTableProps) {
  const [optimisticTeam, setOptimisticTeam] = useOptimistic(
    team,
    (current, id) => current.filter((member) => member.id !== id)
  )

  const handleMemberDeletion = (id: number) => {
    startTransition(async () => {
      setOptimisticTeam(id)
      try {
        const result = await deleteTeamMember(id)
        if (result.success)
          toast.success('Miembro del equipo eliminado exitosamente')
      } catch (error) {
        toast.error(
          'Ocurrió un error al intentar eliminar al miembro del equipo'
        )
        console.error(error)
      }
    })
  }

  return optimisticTeam.map((member) => (
    <TeamRow key={member.id} member={member} onDelete={handleMemberDeletion} />
  ))
}
