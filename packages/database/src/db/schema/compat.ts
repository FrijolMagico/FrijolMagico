// Backwards compatibility - export English names as Spanish aliases
import * as artist from './artist'
import * as events from './events'
import * as core from './core'
import * as participations from './participations'

// Artist exports (English → Spanish aliases)
export const artista = artist.artist
export const artistaEstado = artist.artistStatus
export const artistaImagen = artist.artistImage
export const artistaHistorial = artist.artistHistory
export const catalogoArtista = artist.catalogArtist
export const agrupacion = artist.collective

// Events exports (English → Spanish aliases)
export const evento = events.event
export const eventoEdicion = events.eventEdition
export const eventoEdicionDia = events.eventEditionDay
export const eventoEdicionMetrica = events.eventEditionMetric
export const eventoEdicionSnapshot = events.eventEditionSnapshot
export const eventoEdicionPostulacion = events.eventEditionApplication

// Core exports (keep English as they were)
export const organization = core.organization
export const organizationMember = core.organizationMember
export const place = core.place
export const discipline = core.discipline

// Participations exports (keep English as they were)
export const tipoActividad = participations.activityType
export const modoIngreso = participations.admissionMode
export const participacionEdicion = participations.editionParticipation
export const participacionExposicion = participations.participationExhibition
export const participacionActividad = participations.participationActivity
export const actividad = participations.activity
