import { sql } from 'drizzle-orm'
import {
  sqliteTable,
  text,
  integer,
  index,
  check,
  uniqueIndex
} from 'drizzle-orm/sqlite-core'

import { eventEdition, eventEditionApplication } from './events'
import { collective, artist, band } from './artist'
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
 * Event Edition Participation - Participants in event editions (master table)
 */
export const editionParticipation = sqliteTable(
  'participacion_edicion',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    edicionId: integer('edicion_id')
      .notNull()
      .references(() => eventEdition.id, { onDelete: 'restrict' }),
    artistaId: integer('artista_id').references(() => artist.id, {
      onDelete: 'restrict'
    }),
    agrupacionId: integer('agrupacion_id').references(() => collective.id, {
      onDelete: 'restrict'
    }),
    bandaId: integer('banda_id').references(() => band.id, {
      onDelete: 'restrict'
    }),
    notas: text('notas'),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`)
  },
  (table) => [
    uniqueIndex('uq_participacion_artista')
      .on(table.edicionId, table.artistaId)
      .where(sql`${table.artistaId} IS NOT NULL`),
    uniqueIndex('uq_participacion_agrupacion')
      .on(table.edicionId, table.agrupacionId)
      .where(sql`${table.agrupacionId} IS NOT NULL`),
    uniqueIndex('uq_participacion_banda')
      .on(table.edicionId, table.bandaId)
      .where(sql`${table.bandaId} IS NOT NULL`),
    index('idx_participacion_edicion').on(table.edicionId),
    index('idx_participacion_artista').on(table.artistaId),
    index('idx_participacion_agrupacion').on(table.agrupacionId),
    index('idx_participacion_banda').on(table.bandaId)
  ]
)

/**
 * Participation Exhibition - Exhibition section participation
 */
export const participationExhibition = sqliteTable(
  'participacion_exposicion',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    participacionId: integer('participacion_id')
      .notNull()
      .unique()
      .references(() => editionParticipation.id, { onDelete: 'cascade' }),
    disciplinaId: integer('disciplina_id')
      .notNull()
      .references(() => discipline.id, { onDelete: 'restrict' }),
    postulacionId: integer('postulacion_id').references(
      () => eventEditionApplication.id,
      { onDelete: 'restrict' }
    ),
    modoIngresoId: integer('modo_ingreso_id')
      .notNull()
      .default(1)
      .references(() => admissionMode.id, { onDelete: 'restrict' }),
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
    index('idx_pexp_participacion').on(table.participacionId),
    index('idx_pexp_disciplina').on(table.disciplinaId),
    index('idx_pexp_estado').on(table.estado)
  ]
)

/**
 * Participation Activity - Activity section participation
 */
export const participationActivity = sqliteTable(
  'participacion_actividad',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    participacionId: integer('participacion_id')
      .notNull()
      .references(() => editionParticipation.id, { onDelete: 'cascade' }),
    tipoActividadId: integer('tipo_actividad_id')
      .notNull()
      .references(() => activityType.id, { onDelete: 'restrict' }),
    postulacionId: integer('postulacion_id').references(
      () => eventEditionApplication.id,
      { onDelete: 'restrict' }
    ),
    modoIngresoId: integer('modo_ingreso_id')
      .notNull()
      .default(2)
      .references(() => admissionMode.id, { onDelete: 'restrict' }),
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
    index('idx_pact_participacion').on(table.participacionId),
    index('idx_pact_tipo_actividad').on(table.tipoActividadId),
    index('idx_pact_estado').on(table.estado)
  ]
)

/**
 * Optional registration for a non-music participation activity.
 * The migration also guards cross-table music transitions with triggers.
 */
export const activityRegistration = sqliteTable(
  'activity_registration',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    participationActivityId: integer('participation_activity_id')
      .notNull()
      .unique()
      .references(() => participationActivity.id, { onDelete: 'cascade' }),
    url: text('url').notNull(),
    startAt: text('start_at').notNull(),
    endAt: text('end_at').notNull(),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`)
  },
  (table) => [
    check(
      'chk_activity_registration_https',
      sql`${table.url} LIKE 'https://_%' COLLATE BINARY AND substr(${table.url}, 1, 8) = 'https://'`
    ),
    check(
      'chk_activity_registration_start',
      sql`strftime('%Y-%m-%dT%H:%M:%fZ', julianday(${table.startAt})) IS NOT NULL AND strftime('%Y-%m-%dT%H:%M:%fZ', julianday(${table.startAt})) = ${table.startAt}`
    ),
    check(
      'chk_activity_registration_end',
      sql`strftime('%Y-%m-%dT%H:%M:%fZ', julianday(${table.endAt})) IS NOT NULL AND strftime('%Y-%m-%dT%H:%M:%fZ', julianday(${table.endAt})) = ${table.endAt}`
    ),
    check(
      'chk_activity_registration_window',
      sql`${table.endAt} > ${table.startAt}`
    )
  ]
)

/**
 * Activity - Details of scheduled activities
 */
export const activity = sqliteTable(
  'actividad',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    participacionActividadId: integer('participacion_actividad_id')
      .unique()
      .notNull()
      .references(() => participationActivity.id, { onDelete: 'cascade' }),
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
    index('idx_actividad_participacion_actividad').on(
      table.participacionActividadId
    )
  ]
)
