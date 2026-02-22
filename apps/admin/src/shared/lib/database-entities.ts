export const JOURNAL_ENTITIES = {
  ORGANIZACION: 'organizacion',
  ORGANIZACION_EQUIPO: 'organizacion_equipo',
  ARTISTA: 'artista',
  CATALOGO_ARTISTA: 'catalogo_artista',
  ARTISTA_HISTORIAL: 'artista_historial'
} as const

export type JournalEntity =
  (typeof JOURNAL_ENTITIES)[keyof typeof JOURNAL_ENTITIES]
