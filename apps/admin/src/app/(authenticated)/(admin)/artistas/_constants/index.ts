export const ARTISTA_CACHE_TAG = 'admin:artistas'
export const ARTISTA_HISTORIAL_CACHE_TAG = 'admin:artistas:historial'

export const ADD_ARTIST_FORM_ID = 'add-artista-form'
export const EDIT_ARTIST_FORM_ID = 'edit-artista-form'

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
