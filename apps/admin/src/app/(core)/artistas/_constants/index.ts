export const ARTIST_CACHE_TAG = 'admin:artist'
export const ARTIST_HISTORY_CACHE_TAG = 'admin:artist:history'

export const CREATE_ARTIST_FORM_ID = 'create-artist-form'
export const UPDATE_ARTIST_FORM_ID = 'update-artist-form'

export enum ARTIST_STATUS {
  UNKNOWN = 1,
  ACTIVE,
  INACTIVE,
  SUSPENDED,
  CANCELLED
}

export const STATUS_LABEL_MAP: Record<ARTIST_STATUS, string> = {
  [ARTIST_STATUS.UNKNOWN]: 'Desconocido',
  [ARTIST_STATUS.ACTIVE]: 'Activo',
  [ARTIST_STATUS.INACTIVE]: 'Inactivo',
  [ARTIST_STATUS.SUSPENDED]: 'Vetado',
  [ARTIST_STATUS.CANCELLED]: 'Cancelado'
}
