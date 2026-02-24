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
 * Evento - Eventos organizados
 */
export const evento = sqliteTable(
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
  (table) => [uniqueIndex('idx_evento_slug').on(table.slug)]
)

/**
 * Evento Edicion - Ediciones de un evento
 */
export const eventoEdicion = sqliteTable(
  'evento_edicion',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    eventoId: integer('evento_id').references(() => evento.id, {
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
    uniqueIndex('idx_evento_edicion_numero').on(
      table.eventoId,
      table.numeroEdicion
    ),
    uniqueIndex('idx_evento_edicion_slug').on(table.eventoId, table.slug),
    index('idx_evento_edicion_evento').on(table.eventoId)
  ]
)

/**
 * Evento Edicion Dia - Días de una edición de evento
 */
export const eventoEdicionDia = sqliteTable(
  'evento_edicion_dia',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    eventoEdicionId: integer('evento_edicion_id')
      .notNull()
      .references(() => eventoEdicion.id, { onDelete: 'cascade' }),
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
    uniqueIndex('uq_evento_edicion_dia').on(table.eventoEdicionId, table.fecha),
    index('idx_evento_edicion_dia_edicion').on(table.eventoEdicionId),
    index('idx_evento_edicion_dia_fecha').on(table.fecha),
    index('idx_evento_edicion_dia_lugar').on(table.lugarId)
  ]
)

/**
 * Evento Edicion Metrica - Métricas de ediciones de eventos
 */
export const eventoEdicionMetrica = sqliteTable(
  'evento_edicion_metrica',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    eventoEdicionId: integer('evento_edicion_id').references(
      () => eventoEdicion.id,
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
    index('idx_evento_edicion_metrica_evento_edicion').on(
      table.eventoEdicionId
    ),
    index('idx_evento_edicion_metrica_fecha').on(table.fechaRegistro)
  ]
)

/**
 * Evento Edicion Snapshot - Snapshots de ediciones de eventos
 */
export const eventoEdicionSnapshot = sqliteTable(
  'evento_edicion_snapshot',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    eventoEdicionId: integer('evento_edicion_id').references(
      () => eventoEdicion.id,
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
    index('idx_evento_edicion_snapshot_evento_edicion').on(
      table.eventoEdicionId
    )
  ]
)

/**
 * Evento Edicion Postulacion - Postulaciones a ediciones de eventos
 */
export const eventoEdicionPostulacion = sqliteTable(
  'evento_edicion_postulacion',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    eventoEdicionId: integer('evento_edicion_id')
      .notNull()
      .references(() => eventoEdicion.id, { onDelete: 'cascade' }),
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
    index('idx_postulacion_evento_edicion').on(table.eventoEdicionId),
    index('idx_postulacion_disciplina').on(table.disciplinaId)
  ]
)
