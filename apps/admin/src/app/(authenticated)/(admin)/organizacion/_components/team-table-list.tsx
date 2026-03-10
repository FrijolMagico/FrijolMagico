'use client'

import { TeamMember } from '../_types'
import { TeamRow } from './team-row'
import { UpdateMemberDialog } from './update-member-dialog'

export function TeamTableList({ initialData }: { initialData: TeamMember[] }) {
  return (
    <>
      {initialData.map((member) => (
        <TeamRow key={member.id} member={member} />
      ))}
      <UpdateMemberDialog />
    </>
  )
}
