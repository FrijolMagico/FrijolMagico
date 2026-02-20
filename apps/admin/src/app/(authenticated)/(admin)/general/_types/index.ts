import { Organizacion, OrganizacionEquipo } from '@frijolmagico/database/orm'

export type RawOrganization = Organizacion
export type RawTeamMember = OrganizacionEquipo

export type Organization = Omit<RawOrganization, 'id'> & {
  id: string
}

export type TeamMember = Pick<RawTeamMember, 'nombre' | 'cargo' | 'rrss'> & {
  id: string
}

export interface UpdateOrganizationResult {
  success: boolean
  error?: string
  data?: Organizacion
}
