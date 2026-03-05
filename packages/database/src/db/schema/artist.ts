import { sql } from 'drizzle-orm'
import {
  sqliteTable,
  text,
  integer,
  index,
  uniqueIndex
} from 'drizzle-orm/sqlite-core'

/**
 * Artist Status - Catalog of artist statuses
 */
export const artistStatus = sqliteTable('artista_estado', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  createdAt: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`)
})

/**
 * Artist - Artists registered in the system
 */
export const artist = sqliteTable(
  'artista',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    estadoId: integer('estado_id')
      .notNull()
      .default(1)
      .references(() => artistStatus.id),
    nombre: text('nombre'),
    pseudonimo: text('pseudonimo').notNull().unique(),
    slug: text('slug').notNull().unique(),
    rut: text('rut').unique(),
    correo: text('correo'),
    rrss: text('rrss'),
    ciudad: text('ciudad'),
    pais: text('pais'),
    telefono: text('telefono'),
    deletedAt: text('deleted_at'),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`)
  },
  (table) => [
    uniqueIndex('idx_artist_slug').on(table.slug),
    uniqueIndex('idx_artist_correo_pseudonimo')
      .on(table.correo, table.pseudonimo)
      .where(sql`${table.correo} IS NOT NULL`),
    index('idx_artist_estado').on(table.estadoId),
    index('idx_artist_deleted_at').on(table.deletedAt)
  ]
)

/**
 * Artist Image - Images associated to artists
 */
export const artistImage = sqliteTable(
  'artista_imagen',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    artistaId: integer('artista_id')
      .notNull()
      .references(() => artist.id),
    imagenUrl: text('imagen_url').notNull(),
    tipo: text('tipo', { enum: ['avatar', 'galeria'] }).notNull(),
    orden: integer('orden').notNull().default(1),
    metadata: text('metadata'),
    deletedAt: text('deleted_at'),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`)
  },
  (table) => [
    index('idx_artist_image_artista').on(table.artistaId),
    index('idx_artist_image_artista_tipo').on(table.artistaId, table.tipo),
    index('idx_artist_image_deleted_at').on(table.deletedAt)
  ]
)

/**
 * Artist History - Change history of artists
 */
export const artistHistory = sqliteTable(
  'artista_historial',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    artistaId: integer('artista_id')
      .notNull()
      .references(() => artist.id),
    pseudonimo: text('pseudonimo'),
    correo: text('correo'),
    rrss: text('rrss'),
    ciudad: text('ciudad'),
    pais: text('pais'),
    orden: integer('orden').notNull().default(1),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    notas: text('notas')
  },
  (table) => [
    uniqueIndex('uq_artist_history_orden').on(table.artistaId, table.orden),
    index('idx_artist_history_artista').on(table.artistaId),
    index('idx_artist_history_pseudonimo').on(table.pseudonimo),
    index('idx_artist_history_orden').on(table.artistaId, table.orden)
  ]
)

/**
 * Catalog Artist - Artists in the public catalog
 */
export const catalogArtist = sqliteTable(
  'catalogo_artista',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    artistaId: integer('artista_id')
      .notNull()
      .unique()
      .references(() => artist.id),
    orden: text('orden').notNull(),
    destacado: integer('destacado', { mode: 'boolean' })
      .notNull()
      .default(false),
    activo: integer('activo', { mode: 'boolean' }).notNull().default(true),
    descripcion: text('descripcion'),
    deletedAt: text('deleted_at'),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`)
  },
  (table) => [
    index('idx_catalog_artist_orden').on(table.orden),
    index('idx_catalog_artist_activo').on(table.activo),
    index('idx_catalog_artist_destacado').on(table.destacado),
    index('idx_catalog_artist_deleted_at').on(table.deletedAt)
  ]
)

/**
 * Collective - Artist groupings
 */
export const collective = sqliteTable('agrupacion', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nombre: text('nombre').unique().notNull(),
  descripcion: text('descripcion'),
  correo: text('correo'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`)
})
