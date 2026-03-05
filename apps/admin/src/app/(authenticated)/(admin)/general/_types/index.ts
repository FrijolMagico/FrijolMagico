import type {
  Organization as RawOrg,
  OrganizationMember
} from '@frijolmagico/database/orm'

export type RawOrganization = RawOrg
export type RawTeamMember = OrganizationMember

export type Organization = Omit<RawOrganization, 'id'> & {
  id: string
}

export type TeamMember = {
  id: string
  organizationId: number
  name: string
  rut?: string
  email?: string
  phone?: string
  position?: string
  rrss: Record<string, Array<string>> | null
}

export interface UpdateOrganizationResult {
  success: boolean
  error?: string
  data?: RawOrg
}
