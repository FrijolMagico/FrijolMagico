export const JOURNAL_ENTITIES = {
  ORGANIZACION: 'organizacion',
  ORGANIZACION_EQUIPO: 'organizacion_equipo',
  ARTISTA: 'artista',
  CATALOGO_ARTISTA: 'catalogo_artista',
  ARTISTA_HISTORIAL: 'artista_historial'
} as const

export type JournalEntity =
  (typeof JOURNAL_ENTITIES)[keyof typeof JOURNAL_ENTITIES]

export const JOURNAL_ENTITY_LABELS: Record<JournalEntity, string> = {
  [JOURNAL_ENTITIES.ORGANIZACION]: 'Organización',
  [JOURNAL_ENTITIES.ORGANIZACION_EQUIPO]: 'Organización Equipo',
  [JOURNAL_ENTITIES.ARTISTA]: 'Artista',
  [JOURNAL_ENTITIES.CATALOGO_ARTISTA]: 'Catálogo Artista',
  [JOURNAL_ENTITIES.ARTISTA_HISTORIAL]: 'Historial Artista'
}

export const ROUTE_ENTITY_MAP: Partial<Record<string, JournalEntity[]>> = {
  '/general': [JOURNAL_ENTITIES.ORGANIZACION, JOURNAL_ENTITIES.ORGANIZACION_EQUIPO],
  '/artistas/listado': [JOURNAL_ENTITIES.ARTISTA],
  '/artistas/catalogo': [JOURNAL_ENTITIES.CATALOGO_ARTISTA],
}
