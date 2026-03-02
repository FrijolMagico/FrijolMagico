export const ENTITIES = {
  ORGANIZACION: 'organizacion',
  ORGANIZACION_EQUIPO: 'organizacion_equipo',
  ARTISTA: 'artista',
  CATALOGO_ARTISTA: 'catalogo_artista',
  ARTISTA_HISTORIAL: 'artista_historial'
} as const

export type Entity = (typeof ENTITIES)[keyof typeof ENTITIES]

export const ENTITY_LABELS: Record<Entity, string> = {
  [ENTITIES.ORGANIZACION]: 'Organización',
  [ENTITIES.ORGANIZACION_EQUIPO]: 'Organización Equipo',
  [ENTITIES.ARTISTA]: 'Artista',
  [ENTITIES.CATALOGO_ARTISTA]: 'Catálogo Artista',
  [ENTITIES.ARTISTA_HISTORIAL]: 'Historial Artista'
}

export const ROUTE_ENTITY_MAP: Partial<Record<string, Entity[]>> = {
  '/general': [ENTITIES.ORGANIZACION, ENTITIES.ORGANIZACION_EQUIPO],
  '/artistas/listado': [ENTITIES.ARTISTA],
  '/artistas/catalogo': [ENTITIES.CATALOGO_ARTISTA]
}
