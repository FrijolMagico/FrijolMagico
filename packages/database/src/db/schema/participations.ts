import { sql } from 'drizzle-orm'
import {
  sqliteTable,
  text,
  integer,
  index,
  uniqueIndex
} from 'drizzle-orm/sqlite-core'

import { eventEdition, eventEditionApplication } from './events'
import { collective, artist } from './artist'
import { discipline } from './core'

/**
 * Activity Type - Catalog of activity types
 */
export const activityType = sqliteTable('tipo_actividad', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  descripcion: text('descripcion'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`)
})

/**
 * Admission Mode - Catalog of admission modes for participants
 */
export const admissionMode = sqliteTable('modo_ingreso', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  descripcion: text('descripcion'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`)
})

/**
 * Event Edition Participant - Participants in event editions (master table)
 */
export const eventEditionParticipant = sqliteTable(
  'evento_edicion_participante',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    eventoEdicionId: integer('evento_edicion_id')
      .notNull()
      .references(() => eventEdition.id, { onDelete: 'cascade' }),
    artistaId: integer('artista_id')
      .notNull()
      .references(() => artist.id, { onDelete: 'cascade' }),
    estado: text('estado', {
      enum: ['renuncia', 'expulsado', 'cancelado', 'activo', 'completado']
    })
      .notNull()
      .default('activo'),
    notas: text('notas'),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`)
  },
  (table) => [
    uniqueIndex('uq_participant').on(table.artistaId, table.eventoEdicionId),
    index('idx_participant_evento_edicion').on(table.eventoEdicionId),
    index('idx_participant_artista').on(table.artistaId),
    index('idx_participant_estado').on(table.estado)
  ]
)

/**
 * Participant Exhibition - Participants in exhibition section
 */
export const participantExhibition = sqliteTable(
  'participante_exposicion',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    artistaId: integer('artista_id')
      .notNull()
      .references(() => artist.id, { onDelete: 'restrict' }),
    eventoEdicionId: integer('evento_edicion_id')
      .notNull()
      .references(() => eventEdition.id, { onDelete: 'restrict' }),
    postulacionId: integer('postulacion_id').references(
      () => eventEditionApplication.id,
      { onDelete: 'restrict' }
    ),
    participanteId: integer('participante_id').references(
      () => eventEditionParticipant.id,
      { onDelete: 'restrict' }
    ),
    disciplinaId: integer('disciplina_id')
      .notNull()
      .references(() => discipline.id),
    agrupacionId: integer('agrupacion_id').references(() => collective.id),
    modoIngresoId: integer('modo_ingreso_id')
      .notNull()
      .default(1)
      .references(() => admissionMode.id),
    puntaje: integer('puntaje'),
    estado: text('estado', {
      enum: [
        'seleccionado',
        'confirmado',
        'desistido',
        'cancelado',
        'ausente',
        'completado'
      ]
    })
      .notNull()
      .default('seleccionado'),
    notas: text('notas'),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`)
  },
  (table) => [
    uniqueIndex('uq_exhibition_artista_evento').on(
      table.artistaId,
      table.eventoEdicionId
    ),
    index('idx_exhibition_artista').on(table.artistaId),
    index('idx_exhibition_evento_edicion').on(table.eventoEdicionId),
    index('idx_exhibition_postulacion').on(table.postulacionId),
    index('idx_exhibition_participante').on(table.participanteId),
    index('idx_exhibition_estado').on(table.estado),
    index('idx_exhibition_disciplina').on(table.disciplinaId),
    index('idx_exhibition_agrupacion').on(table.agrupacionId),
    index('idx_exhibition_modo_ingreso').on(table.modoIngresoId),
    index('idx_exhibition_puntaje')
      .on(table.puntaje)
      .where(sql`${table.puntaje} IS NOT NULL`)
  ]
)

/**
 * Participant Activity - Participants in activities
 */
export const participantActivity = sqliteTable(
  'participante_actividad',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    artistaId: integer('artista_id')
      .notNull()
      .references(() => artist.id, { onDelete: 'restrict' }),
    eventoEdicionId: integer('evento_edicion_id')
      .notNull()
      .references(() => eventEdition.id, { onDelete: 'restrict' }),
    postulacionId: integer('postulacion_id').references(
      () => eventEditionApplication.id,
      { onDelete: 'restrict' }
    ),
    participanteId: integer('participante_id').references(
      () => eventEditionParticipant.id,
      { onDelete: 'restrict' }
    ),
    tipoActividadId: integer('tipo_actividad_id')
      .notNull()
      .references(() => activityType.id),
    agrupacionId: integer('agrupacion_id').references(() => collective.id),
    modoIngresoId: integer('modo_ingreso_id')
      .notNull()
      .default(2)
      .references(() => admissionMode.id),
    puntaje: integer('puntaje'),
    estado: text('estado', {
      enum: [
        'seleccionado',
        'confirmado',
        'desistido',
        'cancelado',
        'ausente',
        'completado'
      ]
    })
      .notNull()
      .default('seleccionado'),
    notas: text('notas'),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`)
  },
  (table) => [
    index('idx_activity_artista').on(table.artistaId),
    index('idx_activity_evento_edicion').on(table.eventoEdicionId),
    index('idx_activity_postulacion').on(table.postulacionId),
    index('idx_activity_participante').on(table.participanteId),
    index('idx_activity_estado').on(table.estado),
    index('idx_activity_tipo_actividad').on(table.tipoActividadId),
    index('idx_activity_agrupacion').on(table.agrupacionId),
    index('idx_activity_modo_ingreso').on(table.modoIngresoId),
    index('idx_activity_puntaje')
      .on(table.puntaje)
      .where(sql`${table.puntaje} IS NOT NULL`)
  ]
)

/**
 * Activity - Details of scheduled activities
 */
export const activity = sqliteTable(
  'actividad',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    participanteActividadId: integer('participante_actividad_id')
      .unique()
      .notNull()
      .references(() => participantActivity.id, { onDelete: 'cascade' }),
    titulo: text('titulo'),
    descripcion: text('descripcion'),
    duracionMinutos: integer('duracion_minutos'),
    ubicacion: text('ubicacion'),
    horaInicio: text('hora_inicio'),
    cupos: integer('cupos'),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`)
  },
  (table) => [
    index('idx_activity_participante_actividad').on(table.participanteActividadId)
  ]
)
