import { sql } from 'drizzle-orm'
import {
  sqliteTable,
  text,
  integer,
  uniqueIndex
} from 'drizzle-orm/sqlite-core'

/**
 * Organizacion - Entidad organizadora
 */
export const organization = sqliteTable('organizacion', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nombre: text('nombre').notNull(),
  descripcion: text('descripcion'),
  mision: text('mision'),
  vision: text('vision'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`)
})

/**
 * Organizacion Equipo - Miembros del equipo de la organización
 */
export const organizationMember = sqliteTable('organization_member', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  organizationId: integer('organization_id')
    .notNull()
    .references(() => organization.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  rut: text('rut').unique(),
  email: text('email'),
  phone: text('phone'),
  position: text('position'),
  rrss: text('rrss'),
  createdAt: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`)
})

/**
 * Lugar - Ubicaciones donde se realizan eventos
 */
export const place = sqliteTable(
  'lugar',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    nombre: text('nombre').notNull(),
    direccion: text('direccion'),
    ciudad: text('ciudad'),
    coordenadas: text('coordenadas'),
    url: text('url'),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`)
  },
  (table) => [
    uniqueIndex('uq_lugar_nombre_direccion').on(table.nombre, table.direccion)
  ]
)

/**
 * Disciplina - Catálogo de disciplinas artísticas
 */
export const discipline = sqliteTable('disciplina', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  createdAt: text('created_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`)
})
