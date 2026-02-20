import { Organizacion, OrganizacionEquipo } from '@frijolmagico/database/orm'

export type RawOrganization = Organizacion
export type RawTeamMember = OrganizacionEquipo

export type Organization = Omit<RawOrganization, 'id'> & {
  id: string
}

export type TeamMember = Omit<RawTeamMember, 'id'> & {
  id: string
}

export interface UpdateOrganizationResult {
  success: boolean
  error?: string
  data?: Organizacion
}
