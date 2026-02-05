export interface OrganizacionEquipo {
  id: number
  organizacionId: number
  nombre: string
  cargo: string | null
  rrss: string | null
  createdAt: string
  updatedAt: string
}

export interface Organizacion {
  id: number
  nombre: string
  descripcion: string | null
  mision: string | null
  vision: string | null
  createdAt: string
  updatedAt: string
  equipo: OrganizacionEquipo[]
}

export interface OrganizacionFormData {
  nombre: string
  descripcion: string
  mision: string
  vision: string
  equipo: OrganizacionEquipoFormData[]
}

export interface OrganizacionEquipoFormData {
  id?: number
  nombre: string
  cargo: string
  rrss: string
  isNew?: boolean
  isDeleted?: boolean
}

export interface UpdateOrganizacionResult {
  success: boolean
  error?: string
  data?: Organizacion
}
