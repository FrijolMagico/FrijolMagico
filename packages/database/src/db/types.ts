import { type InferSelectModel, type InferInsertModel } from 'drizzle-orm'

import {
  discipline,
  place,
  organization,
  organizationMember
} from './schema/core'

import {
  evento,
  eventoEdicion,
  eventoEdicionMetrica,
  eventoEdicionPostulacion,
  eventoEdicionSnapshot
} from './schema/events'

import { eventoEdicionDia } from './schema/events'

import {
  actividad,
  eventoEdicionParticipante,
  modoIngreso,
  participanteActividad,
  participanteExposicion,
  tipoActividad
} from './schema/participations'

import {
  agrupacion,
  artista,
  artistaEstado,
  artistaHistorial,
  artistaImagen,
  catalogoArtista
} from './schema/artist'

import { account, session, user, verification } from './schema/auth'

// ============================================
// Core Types
// ============================================

export type Organizacion = InferSelectModel<typeof organization>
export type NewOrganizacion = InferInsertModel<typeof organization>

export type OrganizacionEquipo = InferSelectModel<typeof organizationMember>
export type NewOrganizacionEquipo = InferInsertModel<typeof organizationMember>

export type Lugar = InferSelectModel<typeof place>
export type NewLugar = InferInsertModel<typeof place>

export type Disciplina = InferSelectModel<typeof discipline>
export type NewDisciplina = InferInsertModel<typeof discipline>

// ============================================
// Artista Types
// ============================================

export type ArtistaEstado = InferSelectModel<typeof artistaEstado>
export type NewArtistaEstado = InferInsertModel<typeof artistaEstado>

export type Artista = InferSelectModel<typeof artista>
export type NewArtista = InferInsertModel<typeof artista>

export type ArtistaImagen = InferSelectModel<typeof artistaImagen>
export type NewArtistaImagen = InferInsertModel<typeof artistaImagen>

export type ArtistaHistorial = InferSelectModel<typeof artistaHistorial>
export type NewArtistaHistorial = InferInsertModel<typeof artistaHistorial>

export type CatalogoArtista = InferSelectModel<typeof catalogoArtista>
export type NewCatalogoArtista = InferInsertModel<typeof catalogoArtista>

export type Agrupacion = InferSelectModel<typeof agrupacion>
export type NewAgrupacion = InferInsertModel<typeof agrupacion>

// ============================================
// Evento Types
// ============================================

export type Evento = InferSelectModel<typeof evento>
export type NewEvento = InferInsertModel<typeof evento>

export type EventoEdicion = InferSelectModel<typeof eventoEdicion>
export type NewEventoEdicion = InferInsertModel<typeof eventoEdicion>

export type EventoEdicionDia = InferSelectModel<typeof eventoEdicionDia>
export type NewEventoEdicionDia = InferInsertModel<typeof eventoEdicionDia>

export type EventoEdicionMetrica = InferSelectModel<typeof eventoEdicionMetrica>
export type NewEventoEdicionMetrica = InferInsertModel<
  typeof eventoEdicionMetrica
>

export type EventoEdicionSnapshot = InferSelectModel<
  typeof eventoEdicionSnapshot
>
export type NewEventoEdicionSnapshot = InferInsertModel<
  typeof eventoEdicionSnapshot
>

export type EventoEdicionPostulacion = InferSelectModel<
  typeof eventoEdicionPostulacion
>
export type NewEventoEdicionPostulacion = InferInsertModel<
  typeof eventoEdicionPostulacion
>

// ============================================
// Participante Types
// ============================================

export type TipoActividad = InferSelectModel<typeof tipoActividad>
export type NewTipoActividad = InferInsertModel<typeof tipoActividad>

export type ModoIngreso = InferSelectModel<typeof modoIngreso>
export type NewModoIngreso = InferInsertModel<typeof modoIngreso>

export type EventoEdicionParticipante = InferSelectModel<
  typeof eventoEdicionParticipante
>
export type NewEventoEdicionParticipante = InferInsertModel<
  typeof eventoEdicionParticipante
>

export type ParticipanteExposicion = InferSelectModel<
  typeof participanteExposicion
>
export type NewParticipanteExposicion = InferInsertModel<
  typeof participanteExposicion
>

export type ParticipanteActividad = InferSelectModel<
  typeof participanteActividad
>
export type NewParticipanteActividad = InferInsertModel<
  typeof participanteActividad
>

export type Actividad = InferSelectModel<typeof actividad>
export type NewActividad = InferInsertModel<typeof actividad>

// ============================================
// Auth Types
// ============================================

export type User = InferSelectModel<typeof user>
export type Session = InferSelectModel<typeof session>
export type Account = InferSelectModel<typeof account>
export type Verification = InferSelectModel<typeof verification>
