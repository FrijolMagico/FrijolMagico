export const ENTITIES = {
  ORGANIZACION: 'organizacion',
  ORGANIZACION_EQUIPO: 'organizacion_equipo',
  ARTISTA: 'artista',
  CATALOGO_ARTISTA: 'catalogo_artista',
  ARTISTA_HISTORIAL: 'artista_historial',
  EVENTO: 'evento',
  EVENTO_EDICION: 'evento_edicion',
  EVENTO_EDICION_DIA: 'evento_edicion_dia',
  LUGAR: 'lugar'
} as const

export type Entity = (typeof ENTITIES)[keyof typeof ENTITIES]

export const ENTITY_LABELS: Record<Entity, string> = {
  [ENTITIES.ORGANIZACION]: 'Organización',
  [ENTITIES.ORGANIZACION_EQUIPO]: 'Organización Equipo',
  [ENTITIES.ARTISTA]: 'Artista',
  [ENTITIES.CATALOGO_ARTISTA]: 'Catálogo Artista',
  [ENTITIES.ARTISTA_HISTORIAL]: 'Historial Artista',
  [ENTITIES.EVENTO]: 'Evento',
  [ENTITIES.EVENTO_EDICION]: 'Edición de Evento',
  [ENTITIES.EVENTO_EDICION_DIA]: 'Día de Evento',
  [ENTITIES.LUGAR]: 'Lugar'
}

export const ROUTE_ENTITY_MAP: Partial<Record<string, Entity[]>> = {
  '/general': [ENTITIES.ORGANIZACION, ENTITIES.ORGANIZACION_EQUIPO],
  '/artistas': [ENTITIES.ARTISTA],
  '/artistas/catalogo': [ENTITIES.CATALOGO_ARTISTA],
  '/eventos': [ENTITIES.EVENTO],
  '/eventos/ediciones': [
    ENTITIES.EVENTO_EDICION,
    ENTITIES.EVENTO_EDICION_DIA,
    ENTITIES.LUGAR
  ]
}
