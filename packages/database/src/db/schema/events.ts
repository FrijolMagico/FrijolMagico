import { sql } from 'drizzle-orm'
import {
  sqliteTable,
  text,
  integer,
  real,
  index,
  uniqueIndex
} from 'drizzle-orm/sqlite-core'

import { discipline, place, organization } from './core'

/**
 * Event - Organized events
 */
export const event = sqliteTable(
  'evento',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    organizacionId: integer('organizacion_id').references(
      () => organization.id,
      {
        onDelete: 'set null'
      }
    ),
    nombre: text('nombre').unique().notNull(),
    slug: text('slug').unique(),
    descripcion: text('descripcion'),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`)
  },
  (table) => [
    uniqueIndex('idx_event_slug').on(table.slug),
    index('idx_evento_organizacion_id').on(table.organizacionId)
  ]
)

/**
 * Event Edition - Editions of an event
 */
export const eventEdition = sqliteTable(
  'evento_edicion',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    eventoId: integer('evento_id').references(() => event.id, {
      onDelete: 'set null'
    }),
    nombre: text('nombre'),
    numeroEdicion: text('numero_edicion').notNull(),
    slug: text('slug'),
    posterUrl: text('poster_url'),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`)
  },
  (table) => [
    uniqueIndex('idx_event_edition_numero').on(
      table.eventoId,
      table.numeroEdicion
    ),
    uniqueIndex('idx_event_edition_slug').on(table.eventoId, table.slug),
    index('idx_event_edition_evento').on(table.eventoId),
    index('idx_evento_edicion_created_at').on(table.createdAt)
  ]
)

/**
 * Event Edition Day - Days of an event edition
 */
export const eventEditionDay = sqliteTable(
  'evento_edicion_dia',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    eventoEdicionId: integer('evento_edicion_id')
      .notNull()
      .references(() => eventEdition.id, { onDelete: 'cascade' }),
    lugarId: integer('lugar_id').references(() => place.id, {
      onDelete: 'set null'
    }),
    fecha: text('fecha').notNull(),
    horaInicio: text('hora_inicio').notNull(),
    horaFin: text('hora_fin').notNull(),
    modalidad: text('modalidad', { enum: ['presencial', 'online', 'hibrido'] })
      .notNull()
      .default('presencial'),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`)
  },
  (table) => [
    uniqueIndex('uq_event_edition_day').on(table.eventoEdicionId, table.fecha),
    index('idx_event_edition_day_edicion').on(table.eventoEdicionId),
    index('idx_event_edition_day_fecha').on(table.fecha),
    index('idx_event_edition_day_lugar').on(table.lugarId)
  ]
)

/**
 * Event Edition Metric - Metrics of event editions
 */
export const eventEditionMetric = sqliteTable(
  'evento_edicion_metrica',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    eventoEdicionId: integer('evento_edicion_id').references(
      () => eventEdition.id,
      {
        onDelete: 'set null'
      }
    ),
    tipo: text('tipo').notNull(),
    valor: real('valor'),
    payload: text('payload'),
    fuente: text('fuente'),
    fechaRegistro: text('fecha_registro')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    notas: text('notas')
  },
  (table) => [
    index('idx_event_edition_metric_evento_edicion').on(table.eventoEdicionId),
    index('idx_event_edition_metric_fecha').on(table.fechaRegistro)
  ]
)

/**
 * Event Edition Snapshot - Snapshots of event editions
 */
export const eventEditionSnapshot = sqliteTable(
  'evento_edicion_snapshot',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    eventoEdicionId: integer('evento_edicion_id').references(
      () => eventEdition.id,
      {
        onDelete: 'set null'
      }
    ),
    tipo: text('tipo').notNull(),
    payload: text('payload').notNull(),
    version: integer('version').notNull().default(1),
    generadoEn: text('generado_en')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`)
  },
  (table) => [
    uniqueIndex('uq_snapshot').on(table.eventoEdicionId, table.tipo),
    index('idx_event_edition_snapshot_evento_edicion').on(table.eventoEdicionId)
  ]
)

/**
 * Event Edition Application - Applications to event editions
 */
export const eventEditionApplication = sqliteTable(
  'evento_edicion_postulacion',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    eventoEdicionId: integer('evento_edicion_id')
      .notNull()
      .references(() => eventEdition.id, { onDelete: 'cascade' }),
    nombre: text('nombre').notNull(),
    pseudonimo: text('pseudonimo'),
    correo: text('correo'),
    rrss: text('rrss'),
    disciplinaId: integer('disciplina_id')
      .notNull()
      .references(() => discipline.id),
    dossierUrl: text('dossier_url'),
    estado: text('estado', {
      enum: ['pendiente', 'seleccionado', 'rechazado', 'invitado']
    })
      .notNull()
      .default('pendiente'),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`)
  },
  (table) => [
    index('idx_application_evento_edicion').on(table.eventoEdicionId),
    index('idx_application_disciplina').on(table.disciplinaId)
  ]
)
