# @frijolmagico/database

Database package for the Frijol Mágico monorepo. Provides access to Turso/libSQL via two interfaces:

- **Raw Client (libSQL)**: Direct SQL queries
- **Drizzle ORM Client**: Type-safe queries with relations

## Installation

This is an internal monorepo package:

```bash
bun install
```

## Package Exports

```typescript
import { db } from '@frijolmagico/database/orm' // Drizzle ORM client
import { executeQuery } from '@frijolmagico/database/client' // Raw SQL client
import { schema } from '@frijolmagico/database/schema' // Schema exports
```

## Project Structure

```
src/                           # Source code
├── client.ts                  # Raw SQL client (Turso/libSQL)
├── drizzle.ts                 # Drizzle ORM client
└── db/
    ├── schema/                # Table definitions
    │   ├── core.ts            # Organization, lugar, disciplina
    │   ├── artist.ts          # Artista, catalogo, agrupacion
    │   ├── events.ts          # Evento, edicion, actividades
    │   ├── participations.ts  # Participantes, exposiciones
    │   ├── auth.ts            # Better Auth tables
    │   └── index.ts           # Schema exports
    ├── relations.ts           # Drizzle relations
    └── types.ts               # Custom types

migrations/                    # Drizzle Kit migrations
data/                          # Reference SQL files
seed/                          # Seed data
scripts/                       # Automation scripts
├── seed.ts                    # Create local.dev.db from scratch
```

## Commands

```bash
# Run from packages/database/

# Desarrollar con datos curados (seed)
bun run seed                # Crea local.dev.db: schema + datos mínimos realistas
bun run dev                 # turso dev --db-file local.dev.db

# Desarrollar con datos reales (dump de Turso)
bun run prod                # turso dev --db-file local.db (requiere dump previo)

# Migraciones (para deploy a Turso remoto)
bun run migrate             # Aplica migrations pendientes contra Turso Cloud
bun run new <name>          # Crea migration custom nueva

# Utilidades
bun run lint                # ESLint
bun run type-check          # TypeScript check
```

### Workflows

#### Desarrollo con datos curados (default)

```bash
# 1. Crear DB con datos de desarrollo (2 artistas, 1 evento, participaciones)
bun run seed

# 2. Iniciar servidor local
bun run dev

# La app apunta a http://127.0.0.1:8080 (local.dev.db)
```

#### Desarrollo con datos reales (dump de producción)

```bash
# 1. Dump de Turso remoto a archivo local
#    (documentado en db/shell de Turso CLI)

# 2. Iniciar servidor local con dump
bun run prod
```

> ⚠️ `local.dev.db` y `local.db` son archivos separados. `bun run seed` solo
> modifica `local.dev.db`. El dump de prod va a `local.db` y nunca es pisado
> por el seed.

## Usage

### Drizzle ORM Client

```typescript
import { db } from '@frijolmagico/database/orm'
import { artista } from '@frijolmagico/database/schema'
import { eq } from 'drizzle-orm'

// Simple query
const artistas = await db.select().from(artista)

// With filters
const activos = await db.select().from(artista).where(eq(artista.estadoId, 1))

// With relations
const conImagenes = await db.query.artista.findMany({
  with: {
    imagenes: true,
    estado: true
  }
})

// Insert
const [nuevo] = await db
  .insert(artista)
  .values({ pseudonimo: 'Nombre', slug: 'nombre' })
  .returning()
```

### Raw SQL Client

```typescript
import {
  executeQuery,
  executeBatch,
  executeInsert
} from '@frijolmagico/database/client'

// Query
const { data, error } = await executeQuery<{ id: number; nombre: string }>(
  'SELECT id, nombre FROM artista WHERE estado_id = ?',
  [1]
)

// Insert with ID
const { lastInsertRowid, error } = await executeInsert(
  'INSERT INTO artista (pseudonimo, slug) VALUES (?, ?)',
  ['Nombre', 'slug']
)

// Batch
await executeBatch([
  { sql: 'UPDATE artista SET ciudad = ? WHERE id = ?', params: ['Santiago', 1] }
])
```

## Schema

26 tables organized by domain:

- **Core**: organizacion, organizacion_equipo, lugar, disciplina
- **Artists**: artista, artista_imagen, artista_historial, catalogo_artista, agrupacion
- **Events**: evento, evento_edicion, evento_edicion_dia, evento_edicon_metrica, evento_edicion_snapshot, evento_edicion_postulacion
- **Participations**: tipo_actividad, modo_ingreso, evento_edicion_participante, participante_exposicion, participante_actividad, actividad
- **Auth**: user, session, account, verification (Better Auth)

## Migrations

Uses drizzle-kit with custom SQL:

```bash
# Create migration
bun run new nombre-migracion

# Edit migrations/000N_nombre-migracion.sql
# Use --> statement-breakpoint between statements

# Apply
bun run migrate
```

## Environment Variables

See `.env.example` in this directory for required variables.

```bash
cp .env.example .env.local
```

Key variables:

- `TURSO_DATABASE_URL` - URL de Turso Cloud (para deploy via `migrate`)
- `TURSO_AUTH_TOKEN` - Token de autenticación para Turso Cloud
- `TURSO_DATABASE_NAME` - Nombre de la DB en Turso Cloud (para CLI)

  > Para desarrollo local (`seed` + `dev`/`prod`) no se necesita ninguna variable.
  > El seed usa `file:local.dev.db` directo y `turso dev` no requiere configuración.

## Dual Client Pattern

- **Admin app**: Uses Drizzle ORM for complex relational queries
- **Web app**: Uses raw SQL for optimized manual queries
- Both share the same underlying libSQL connection

## See Also

- [Root README](../../README.md) - Project overview
- [Drizzle ORM Docs](https://orm.drizzle.team/docs/overview)
- [Turso Docs](https://docs.turso.tech/)
