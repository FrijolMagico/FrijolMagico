import type {
  Organization as RawOrg,
  OrganizationMember
} from '@frijolmagico/database/orm'

export type RawOrganization = RawOrg
export type RawTeamMember = OrganizationMember

export type Organization = Omit<RawOrganization, 'id'> & {
  id: string
}

export type TeamMember = Omit<RawTeamMember, 'id' | 'organizationId'> & {
  id: string
  organizationId: string
  rrss: Record<string, string[]> | null
}
