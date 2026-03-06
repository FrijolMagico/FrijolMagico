export type ArtistStatusStat = {
  slug: string
  count: number
}

export type DataCompleteness = {
  total: number
  withEmail: number
  withPhone: number
  withRut: number
}

export type DashboardArtistStats = {
  total: number
  byStatus: ArtistStatusStat[]
  catalogActive: number
  completeness: DataCompleteness
}

export type DashboardEventStats = {
  totalParticipations: number
  totalEditions: number
  latestEdition: {
    id: string
    nombre: string | null
    numeroEdicion: string
    participantCount: number
  } | null
}

export type EditionGrowthPoint = {
  edicionId: string
  numero: string
  nombre: string | null
  participantes: number
}

export type DisciplinePoint = {
  disciplina: string
  count: number
}

export type CityPoint = {
  ciudad: string
  count: number
}

export type TopArtistEntry = {
  id: string
  pseudonimo: string
  ediciones: number
}
