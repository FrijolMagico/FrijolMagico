export const ARTIST_LIST_FILTER_KEYS = {
  COUNTRY: 'country',
  CITY: 'city',
  STATUS_ID: 'statusId'
} as const

export type ArtistListFilterKey =
  (typeof ARTIST_LIST_FILTER_KEYS)[keyof typeof ARTIST_LIST_FILTER_KEYS]

export type ArtistListQueryFilters = Partial<
  Record<ArtistListFilterKey, string>
>

export const CATALOG_LIST_FILTER_KEYS = {
  ACTIVO: 'activo',
  DESTACADO: 'destacado'
} as const

export type CatalogListFilterKey =
  (typeof CATALOG_LIST_FILTER_KEYS)[keyof typeof CATALOG_LIST_FILTER_KEYS]

export type CatalogListQueryFilters = Partial<
  Record<CatalogListFilterKey, string>
>

export const EDICION_LIST_FILTER_KEYS = {
  EVENTO_ID: 'eventoId'
} as const

export type EdicionListFilterKey =
  (typeof EDICION_LIST_FILTER_KEYS)[keyof typeof EDICION_LIST_FILTER_KEYS]

export type EdicionListQueryFilters = Partial<
  Record<EdicionListFilterKey, string>
>

export const PARTICIPACIONES_LIST_FILTER_KEYS = {
  EDICION_ID: 'edicionId',
  ESTADO: 'estado'
} as const

export type ParticipacionesListFilterKey =
  (typeof PARTICIPACIONES_LIST_FILTER_KEYS)[keyof typeof PARTICIPACIONES_LIST_FILTER_KEYS]

export type ParticipacionesListQueryFilters = Partial<
  Record<ParticipacionesListFilterKey, string>
>

export interface AdminListEntityFilters {
  artistas: ArtistListQueryFilters
  catalogo: CatalogListQueryFilters
  ediciones: EdicionListQueryFilters
  participaciones: ParticipacionesListQueryFilters
}
